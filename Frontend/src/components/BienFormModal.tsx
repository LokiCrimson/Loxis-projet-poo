import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { uploadPhotoBien } from '@/services/biens.service';
import { useCreateBien, useUpdateBien, useBien, useCategories, useTypesBien, usePhotosBien, useDeletePhotoBien } from '@/hooks/use-biens';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, Check, Hammer, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const bienSchema = z.object({
  name: z.string().min(2, 'Le nom est requis'),
  categorie: z.string().min(1, 'La catégorie est requise'),
  type_bien: z.string().min(1, 'Le type est requis'),
  adresse: z.string().min(1, "L'adresse est requise"),
  ville: z.string().min(1, 'La ville est requise'),
  code_postal: z.string().optional(),
  surface: z.coerce.number().min(1, 'La surface est requise'),
  pieces: z.coerce.number().min(0, 'Nombre de pièces invalide'),
  description: z.string().optional(),
  tour_3d_url: z.string().url('URL invalide').or(z.literal('')).optional(),
  loyer_hc: z.coerce.number().min(1, 'Le loyer est requis'),
  charges: z.coerce.number().min(0).optional(),
  depot_garantie: z.coerce.number().min(0).optional(),
  statut: z.string().default('VACANT'),
});

type BienFormData = z.infer<typeof bienSchema>;

interface BienFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bienId?: number | null;
}

export function BienFormModal({ open, onOpenChange, bienId }: BienFormModalProps) {
  const isEdit = !!bienId;
  const { data: existingBien } = useBien(bienId || 0);
  const { data: categories = [] } = useCategories();
  const { data: typesBien = [] } = useTypesBien();
  const { data: existingPhotos = [] } = usePhotosBien(bienId || 0);
  const deletePhotoMutation = useDeletePhotoBien();
  const createMutation = useCreateBien();
  const updateMutation = useUpdateBien();
  const { toast } = useToast();
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPhotoPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDeleteExistingPhoto = async (photoId: number) => {
    if (!bienId) return;
    try {
      await deletePhotoMutation.mutateAsync({ bienId, photoId });
      toast({ title: 'Photo supprimée' });
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer la photo.', variant: 'destructive' });
    }
  };

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<BienFormData>({
    resolver: zodResolver(bienSchema),
    defaultValues: {
      statut: 'VACANT',
      charges: 0,
      depot_garantie: 0,
      pieces: 1,
    },
  });

  const watchedCategorie = watch('categorie');
  const currentStatut = watch('statut');

  useEffect(() => {
    if (watchedCategorie !== selectedCategorie) {
      setSelectedCategorie(watchedCategorie);
      setValue('type_bien', '');
    }
  }, [watchedCategorie, selectedCategorie, setValue]);

  useEffect(() => {
    if (isEdit && existingBien) {
      reset({
        name: existingBien.name || '',
        categorie: String(existingBien.category?.id || existingBien.category || ''),
        type_bien: String(existingBien.property_type?.id || existingBien.property_type || ''),
        adresse: existingBien.address || '',
        ville: existingBien.city || '',
        code_postal: existingBien.zip_code || '',
        surface: Number(existingBien.surface_area || 0),
        pieces: existingBien.rooms_count || 1,
        description: existingBien.description || '',
        loyer_hc: Number(existingBien.base_rent_hc || 0),
        charges: Number(existingBien.base_charges || 0),
        depot_garantie: Number(existingBien.guarantee_deposit || 0),
        statut: existingBien.status || 'VACANT',        tour_3d_url: existingBien.tour_3d_url || '',      });
      setSelectedCategorie(String(existingBien.category?.id || existingBien.category || ''));
    }
  }, [isEdit, existingBien, reset]);

  const onSubmit = async (data: BienFormData) => {
    try {
      const payload = {
        name: data.name,
        category: Number(data.categorie),
        property_type: Number(data.type_bien),
        address: data.adresse,
        city: data.ville,
        zip_code: data.code_postal || '00000',
        surface_area: data.surface,
        rooms_count: data.pieces || 1,
        description: data.description || '',
        base_rent_hc: data.loyer_hc,
        base_charges: data.charges || 0,
        guarantee_deposit: data.depot_garantie || 0,
        status: data.statut,
        tour_3d_url: data.tour_3d_url || null
      };

      const mutation = isEdit
        ? updateMutation.mutateAsync({ id: bienId!, data: payload })
        : createMutation.mutateAsync(payload);

      const resp: any = await mutation;
      const bId = isEdit ? bienId : (resp.id || (resp.data && resp.data.id) || resp.property_id);

      if (bId && photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          await uploadPhotoBien(bId, photos[i], i === 0);
        }
      }

      toast({ title: isEdit ? 'Bien modifié' : 'Bien créé', description: 'Opération réussie.' });
      onOpenChange(false);
      reset();
      setPhotos([]);
      setPhotoPreviews([]);
    } catch (e: any) {
      toast({ title: 'Erreur', description: 'Veuillez vérifier les champs obligatoires.', variant: 'destructive' });
    }
  };

  const types = Array.isArray(typesBien) ? typesBien.filter((t: any) => String(t.category) === String(selectedCategorie)) : [];
  const isPending = createMutation.isPending || updateMutation.isPending;

  const statuts = [
    { id: 'VACANT', label: 'Disponible', icon: Check, color: 'text-success border-success bg-success/10' },
    { id: 'RENTED', label: 'Loué', icon: Home, color: 'text-primary border-primary bg-primary/10' },
    { id: 'UNDER_WORK', label: 'En travaux', icon: Hammer, color: 'text-warning border-warning bg-warning/10' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le bien' : 'Ajouter un bien'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="general" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Informations</TabsTrigger>
              <TabsTrigger value="financier">Financier</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du bien *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Villa des Roses, Appartement T3 Centre..."
                  {...register('name')}
                  className={cn(errors.name && "border-destructive")}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Statut du bien</Label>
                <div className="flex gap-2">
                  {statuts.map((s) => (
                    <Button
                      key={s.id}
                      type="button"
                      variant="outline"
                      className={cn(
                        "flex-1 gap-2 h-12",
                        currentStatut === s.id ? s.color : "opacity-50"
                      )}
                      onClick={() => setValue('statut', s.id)}
                    >
                      <s.icon className="h-4 w-4" />
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Catégorie *</Label>
                  <Controller control={control} name="categorie" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div>
                  <Label>Type de bien *</Label>
                  <Controller control={control} name="type_bien" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={!selectedCategorie}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {types.map((t: any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              </div>
              <div>
                <Label>Adresse complète *</Label>
                <Textarea {...register('adresse')} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ville *</Label>
                  <Input {...register('ville')} />
                </div>
                <div>
                  <Label>Code Postal</Label>
                  <Input {...register('code_postal')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Surface (m²) *</Label>
                  <Input type="number" {...register('surface')} />
                </div>
                <div>
                  <Label>Nombre de pièces *</Label>
                  <Input type="number" {...register('pieces')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Lien Visite 3D (Matterport, etc.)</Label>
                <Input placeholder="https://my.matterport.com/show/..." {...register('tour_3d_url')} />
              </div>
            </TabsContent>

            <TabsContent value="financier" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Loyer HC (mensuel) *</Label>
                  <Input type="number" {...register('loyer_hc')} />
                </div>
                <div>
                  <Label>Charges (mensuel)</Label>
                  <Input type="number" {...register('charges')} />
                </div>
                <div>
                  <Label>Dépôt de garantie</Label>
                  <Input type="number" {...register('depot_garantie')} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="photos" className="mt-4 space-y-4">
               <div className="grid grid-cols-3 gap-4">
                  {/* Photos existantes sur le serveur (en mode édition) */}
                  {isEdit && existingPhotos.map((p: any) => (
                    <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={p.image} alt="Bien" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingPhoto(p.id)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Nouvelles photos à uploader */}
                  {photoPreviews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-primary/30">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground text-center px-2">Ajouter des photos</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
               </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Enregistrer les modifications' : 'Créer le bien'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
