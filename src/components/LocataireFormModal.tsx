import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateLocataire, useUpdateLocataire, useLocataire } from '@/hooks/use-locataires';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const locataireSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(1, 'Le téléphone est requis'),
  date_naissance: z.string().optional(),
  profession: z.string().optional(),
  piece_identite_type: z.string().min(1, 'Le type de pièce est requis'),
  piece_identite_numero: z.string().min(1, 'Le numéro est requis'),
  garant_nom: z.string().optional(),
  garant_prenom: z.string().optional(),
  garant_telephone: z.string().optional(),
  garant_email: z.string().optional(),
  garant_profession: z.string().optional(),
  garant_revenu_mensuel: z.coerce.number().optional(),
  garant_entite: z.string().optional(),
  garant_details: z.string().optional(),
});

type LocataireFormData = z.infer<typeof locataireSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locataireId?: number | null;
}

export function LocataireFormModal({ open, onOpenChange, locataireId }: Props) {
  const isEdit = !!locataireId;
  const { data: existing } = useLocataire(locataireId || 0);
  const createMut = useCreateLocataire();
  const updateMut = useUpdateLocataire();
  const { toast } = useToast();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<LocataireFormData>({
    resolver: zodResolver(locataireSchema),
    defaultValues: { piece_identite_type: 'cni' },
  });

  useEffect(() => {
    if (isEdit && existing) {
      reset({
        nom: existing.nom, prenom: existing.prenom, email: existing.email,
        telephone: existing.telephone, date_naissance: existing.date_naissance || '',
        profession: existing.profession || '', piece_identite_type: existing.piece_identite_type,
        piece_identite_numero: existing.piece_identite_numero,
        garant_nom: existing.garant?.nom || '', garant_prenom: existing.garant?.prenom || '',
        garant_telephone: existing.garant?.telephone || '', garant_email: existing.garant?.email || '',
        garant_profession: existing.garant?.profession || '',
        garant_revenu_mensuel: existing.garant?.revenu_mensuel || 0,
        garant_entite: existing.garant?.entite || '', garant_details: existing.garant?.details || '',
      });
    }
  }, [isEdit, existing, reset]);

  const onSubmit = (data: LocataireFormData) => {
    const mutation = isEdit
      ? updateMut.mutateAsync({ id: locataireId!, data })
      : createMut.mutateAsync(data);
    mutation.then(() => { toast({ title: isEdit ? 'Locataire modifié' : 'Locataire créé' }); onOpenChange(false); reset(); })
      .catch(() => toast({ title: 'Erreur', variant: 'destructive' }));
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le locataire' : 'Ajouter un locataire'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="garant">Garant</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom *</Label>
                  <Input {...register('nom')} />
                  {errors.nom && <p className="mt-1 text-xs text-destructive">{errors.nom.message}</p>}
                </div>
                <div>
                  <Label>Prénom *</Label>
                  <Input {...register('prenom')} />
                  {errors.prenom && <p className="mt-1 text-xs text-destructive">{errors.prenom.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email *</Label>
                  <Input type="email" {...register('email')} />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div>
                  <Label>Téléphone *</Label>
                  <Input {...register('telephone')} />
                  {errors.telephone && <p className="mt-1 text-xs text-destructive">{errors.telephone.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date de naissance</Label>
                  <Input type="date" {...register('date_naissance')} />
                </div>
                <div>
                  <Label>Profession</Label>
                  <Input {...register('profession')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type de pièce d'identité *</Label>
                  <Controller control={control} name="piece_identite_type" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cni">CNI</SelectItem>
                        <SelectItem value="passeport">Passeport</SelectItem>
                        <SelectItem value="titre_sejour">Titre de séjour</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div>
                  <Label>Numéro de pièce *</Label>
                  <Input {...register('piece_identite_numero')} />
                  {errors.piece_identite_numero && <p className="mt-1 text-xs text-destructive">{errors.piece_identite_numero.message}</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="garant" className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">Informations du garant (optionnel)</p>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nom</Label><Input {...register('garant_nom')} /></div>
                <div><Label>Prénom</Label><Input {...register('garant_prenom')} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Téléphone</Label><Input {...register('garant_telephone')} /></div>
                <div><Label>Email</Label><Input type="email" {...register('garant_email')} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Profession</Label><Input {...register('garant_profession')} /></div>
                <div><Label>Revenu mensuel (FCFA)</Label><Input type="number" {...register('garant_revenu_mensuel')} /></div>
              </div>
              <div><Label>Entité / Entreprise</Label><Input {...register('garant_entite')} /></div>
              <div><Label>Détails / Lien</Label><Input {...register('garant_details')} placeholder="Ex: Père du locataire" /></div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Enregistrer' : 'Créer le locataire'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
