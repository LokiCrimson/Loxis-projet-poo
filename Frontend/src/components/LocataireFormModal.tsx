import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateLocataire, useUpdateLocataire } from '@/hooks/use-locataires';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Shield } from 'lucide-react';
import { useEffect } from 'react';

const locataireSchema = z.object({
  prenom: z.string().min(1, 'Le prénom est requis'),
  nom: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(1, 'Le téléphone est requis'),
  profession: z.string().min(1, 'La profession est requise'),
  piece_identite_type: z.string().default('CNI'),
  piece_identite_numero: z.string().min(1, 'Le numéro de pièce est requis'),
  date_naissance: z.string().optional(),
  garant: z.object({
    prenom: z.string().min(1, 'Prénom du garant requis'),
    nom: z.string().min(1, 'Nom du garant requis'),
    telephone: z.string().min(1, 'Téléphone du garant requis'),
    email: z.string().email('Email du garant invalide'),
    profession: z.string().min(1, 'Profession du garant requise'),
    revenu_mensuel: z.coerce.number().min(0, 'Revenu invalide'),
  }),
});

type LocataireFormData = z.infer<typeof locataireSchema>;

interface LocataireFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  locataire?: any;
}

export function LocataireFormModal({ isOpen, onClose, locataire }: LocataireFormModalProps) {
  const isEdit = !!locataire;
  const createMutation = useCreateLocataire();
  const updateMutation = useUpdateLocataire();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LocataireFormData>({
    resolver: zodResolver(locataireSchema),
    defaultValues: {
      piece_identite_type: 'CNI',
      garant: { revenu_mensuel: 0 }
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (locataire) {
        const g = locataire.guarantors?.[0] || locataire.garant || {};
        reset({
          prenom: locataire.first_name || locataire.prenom || '',
          nom: locataire.last_name || locataire.nom || '',
          email: locataire.email || '',
          telephone: locataire.phone || locataire.telephone || '',
          profession: locataire.profession || '',
          piece_identite_type: locataire.id_type || locataire.piece_identite_type || 'CNI',
          piece_identite_numero: locataire.id_number || locataire.piece_identite_numero || '',
          date_naissance: locataire.birth_date || locataire.date_naissance || '',
          garant: {
            prenom: g.first_name || g.prenom || '',
            nom: g.last_name || g.nom || '',
            email: g.email || '',
            telephone: g.phone || g.telephone || '',
            profession: g.profession || '',
            revenu_mensuel: g.monthly_income || g.revenu_mensuel || 0,
          }
        });
      } else {
        reset({
          prenom: '', nom: '', email: '', telephone: '', profession: '',
          piece_identite_type: 'CNI', piece_identite_numero: '', date_naissance: '',
          garant: { prenom: '', nom: '', email: '', telephone: '', profession: '', revenu_mensuel: 0 }
        });
      }
    }
  }, [isOpen, locataire, reset]);

  const onSubmit = async (data: LocataireFormData) => {
    try {
      const payload = {
        first_name: data.prenom,
        last_name: data.nom,
        email: data.email,
        phone: data.telephone,
        profession: data.profession,
        id_type: data.piece_identite_type,
        id_number: data.piece_identite_numero,
        birth_date: data.date_naissance || null,
        garant_data: data.garant,
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: locataire.id, data: payload });
        toast({ title: 'Locataire modifié', description: 'Les modifications ont été enregistrées.' });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'Locataire créé', description: 'Le locataire a été ajouté avec succès.' });
      }
      onClose();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.response?.data?.detail || 'Une erreur est survenue.', variant: 'destructive' });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le locataire' : 'Ajouter un locataire'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="identite" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="identite">Identité</TabsTrigger>
              <TabsTrigger value="garant">Garant</TabsTrigger>
            </TabsList>

            <TabsContent value="identite" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom *</Label>
                  <Input {...register('prenom')} />
                  {errors.prenom && <p className="text-xs text-destructive">{errors.prenom.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input {...register('nom')} />
                  {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" {...register('email')} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Téléphone *</Label>
                  <Input {...register('telephone')} />
                  {errors.telephone && <p className="text-xs text-destructive">{errors.telephone.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Profession *</Label>
                <Input {...register('profession')} />
                {errors.profession && <p className="text-xs text-destructive">{errors.profession.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de pièce *</Label>
                  <Input {...register('piece_identite_type')} />
                </div>
                <div className="space-y-2">
                  <Label>Numéro de pièce *</Label>
                  <Input {...register('piece_identite_numero')} />
                  {errors.piece_identite_numero && <p className="text-xs text-destructive">{errors.piece_identite_numero.message}</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="garant" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom du garant *</Label>
                  <Input {...register('garant.prenom')} />
                  {errors.garant?.prenom && <p className="text-xs text-destructive">{errors.garant.prenom.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Nom du garant *</Label>
                  <Input {...register('garant.nom')} />
                  {errors.garant?.nom && <p className="text-xs text-destructive">{errors.garant.nom.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email du garant *</Label>
                  <Input type="email" {...register('garant.email')} />
                  {errors.garant?.email && <p className="text-xs text-destructive">{errors.garant.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Téléphone du garant *</Label>
                  <Input {...register('garant.telephone')} />
                  {errors.garant?.telephone && <p className="text-xs text-destructive">{errors.garant.telephone.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Profession du garant *</Label>
                  <Input {...register('garant.profession')} />
                  {errors.garant?.profession && <p className="text-xs text-destructive">{errors.garant.profession.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Revenu mensuel *</Label>
                  <Input type="number" {...register('garant.revenu_mensuel')} />
                  {errors.garant?.revenu_mensuel && <p className="text-xs text-destructive">{errors.garant.revenu_mensuel.message}</p>}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Enregistrer' : 'Ajouter le locataire'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
