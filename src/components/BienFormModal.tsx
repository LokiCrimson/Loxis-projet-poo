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
import { useCreateBien, useUpdateBien, useBien } from '@/hooks/use-biens';
import { mockCategories, mockTypesBien } from '@/services/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';

const bienSchema = z.object({
  categorie: z.string().min(1, 'La catégorie est requise'),
  type_bien: z.string().min(1, 'Le type est requis'),
  reference: z.string().min(1, 'La référence est requise'),
  adresse: z.string().min(1, "L'adresse est requise"),
  ville: z.string().min(1, 'La ville est requise'),
  code_postal: z.string().optional(),
  surface: z.coerce.number().min(1, 'La surface est requise'),
  nombre_pieces: z.coerce.number().min(0, 'Nombre de pièces invalide'),
  description: z.string().optional(),
  loyer_hc: z.coerce.number().min(1, 'Le loyer est requis'),
  charges: z.coerce.number().min(0).optional(),
  depot_garantie: z.coerce.number().min(0).optional(),
  statut: z.string().default('vacant'),
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
  const createMutation = useCreateBien();
  const updateMutation = useUpdateBien();
  const { toast } = useToast();
  const [selectedCategorie, setSelectedCategorie] = useState('');

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<BienFormData>({
    resolver: zodResolver(bienSchema),
    defaultValues: {
      reference: `BIEN-${String(Math.floor(Math.random() * 900) + 100)}`,
      statut: 'vacant',
      charges: 0,
      depot_garantie: 0,
      nombre_pieces: 1,
    },
  });

  const watchedCategorie = watch('categorie');

  useEffect(() => {
    if (watchedCategorie !== selectedCategorie) {
      setSelectedCategorie(watchedCategorie);
      setValue('type_bien', '');
    }
  }, [watchedCategorie, selectedCategorie, setValue]);

  useEffect(() => {
    if (isEdit && existingBien) {
      reset({
        categorie: existingBien.categorie,
        type_bien: existingBien.type_bien,
        reference: existingBien.reference,
        adresse: existingBien.adresse,
        ville: existingBien.ville,
        code_postal: existingBien.code_postal || '',
        surface: existingBien.surface,
        nombre_pieces: existingBien.nombre_pieces,
        description: existingBien.description || '',
        loyer_hc: existingBien.loyer_hc,
        charges: existingBien.charges,
        depot_garantie: existingBien.depot_garantie,
        statut: existingBien.statut,
      });
      setSelectedCategorie(existingBien.categorie);
    }
  }, [isEdit, existingBien, reset]);

  const onSubmit = (data: BienFormData) => {
    const mutation = isEdit
      ? updateMutation.mutateAsync({ id: bienId!, data })
      : createMutation.mutateAsync(data);

    mutation.then(() => {
      toast({ title: isEdit ? 'Bien modifié' : 'Bien créé', description: 'Opération réussie.' });
      onOpenChange(false);
      reset();
    }).catch(() => {
      toast({ title: 'Erreur', description: "Une erreur est survenue.", variant: 'destructive' });
    });
  };

  const types = selectedCategorie ? (mockTypesBien[selectedCategorie] || []) : [];
  const isPending = createMutation.isPending || updateMutation.isPending;

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Catégorie *</Label>
                  <Controller control={control} name="categorie" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {mockCategories.map(c => <SelectItem key={c.id} value={c.nom}>{c.nom}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                  {errors.categorie && <p className="mt-1 text-xs text-destructive">{errors.categorie.message}</p>}
                </div>
                <div>
                  <Label>Type de bien *</Label>
                  <Controller control={control} name="type_bien" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={!selectedCategorie}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                  {errors.type_bien && <p className="mt-1 text-xs text-destructive">{errors.type_bien.message}</p>}
                </div>
              </div>
              <div>
                <Label>Référence *</Label>
                <Input {...register('reference')} />
                {errors.reference && <p className="mt-1 text-xs text-destructive">{errors.reference.message}</p>}
              </div>
              <div>
                <Label>Adresse complète *</Label>
                <Textarea {...register('adresse')} rows={2} />
                {errors.adresse && <p className="mt-1 text-xs text-destructive">{errors.adresse.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ville *</Label>
                  <Input {...register('ville')} />
                  {errors.ville && <p className="mt-1 text-xs text-destructive">{errors.ville.message}</p>}
                </div>
                <div>
                  <Label>Code postal</Label>
                  <Input {...register('code_postal')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Surface (m²) *</Label>
                  <Input type="number" {...register('surface')} />
                  {errors.surface && <p className="mt-1 text-xs text-destructive">{errors.surface.message}</p>}
                </div>
                <div>
                  <Label>Nombre de pièces</Label>
                  <Input type="number" {...register('nombre_pieces')} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea {...register('description')} rows={3} />
              </div>
            </TabsContent>

            <TabsContent value="financier" className="mt-4 space-y-4">
              <div>
                <Label>Loyer hors charges (FCFA) *</Label>
                <Input type="number" {...register('loyer_hc')} />
                {errors.loyer_hc && <p className="mt-1 text-xs text-destructive">{errors.loyer_hc.message}</p>}
              </div>
              <div>
                <Label>Charges (FCFA)</Label>
                <Input type="number" {...register('charges')} />
              </div>
              <div>
                <Label>Dépôt de garantie (FCFA)</Label>
                <Input type="number" {...register('depot_garantie')} />
              </div>
              <div>
                <Label>Statut initial</Label>
                <Controller control={control} name="statut" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacant">Vacant</SelectItem>
                      <SelectItem value="en_travaux">En travaux</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </TabsContent>

            <TabsContent value="photos" className="mt-4">
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12 text-center">
                <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Glissez-déposez vos photos ici</p>
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP — Max 10 photos</p>
                <Button type="button" variant="outline" size="sm" className="mt-4">Parcourir</Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Enregistrer' : 'Créer le bien'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
