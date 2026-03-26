import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateLocataire, useUpdateLocataire } from '@/hooks/use-locataires';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Shield, Phone, Mail, Briefcase, CreditCard, Calendar } from 'lucide-react';
import { useEffect } from 'react';

const locataireSchema = z.object({
  prenom: z.string().min(1, 'Le prénom est requis'),
  nom: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(1, 'Le téléphone est requis'),
  profession: z.string().min(1, 'La profession est requise'),
  piece_identite_type: z.string().min(1, 'Type de pièce requis'),
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

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<LocataireFormData>({
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
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto p-0 border-none shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white rounded-t-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6" />
              {isEdit ? 'Édition du Dossier Locataire' : 'Nouveau Dossier Locataire'}
            </DialogTitle>
            <DialogDescription className="text-blue-100">
              {isEdit ? 'Mettez à jour les informations du locataire et de son garant.' : 'Remplissez les détails pour créer un nouveau profil locataire.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 bg-white">
          <Tabs defaultValue="identite" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-xl mb-6">
              <TabsTrigger 
                value="identite" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all py-3"
              >
                <User className="w-4 h-4 mr-2" />
                Informations Locataire
              </TabsTrigger>
              <TabsTrigger 
                value="garant" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all py-3"
              >
                <Shield className="w-4 h-4 mr-2" />
                Détails du Garant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="identite" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    Prénom <span className="text-red-500">*</span>
                  </Label>
                  <Input {...register('prenom')} placeholder="Ex: Koffi" className="border-gray-200 focus:border-blue-500" />
                  {errors.prenom && <p className="text-xs text-red-500 font-medium">{errors.prenom.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <Input {...register('nom')} placeholder="Ex: OLYMPIO" className="border-gray-200 focus:border-blue-500" />
                  {errors.nom && <p className="text-xs text-red-500 font-medium">{errors.nom.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    Email Professionnel <span className="text-red-500">*</span>
                  </Label>
                  <Input type="email" {...register('email')} placeholder="koffi.o@example.tg" className="border-gray-200 focus:border-blue-500" />
                  {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    Téléphone <span className="text-red-500">*</span>
                  </Label>
                  <Input {...register('telephone')} placeholder="+228 90 00 00 00" className="border-gray-200 focus:border-blue-500" />
                  {errors.telephone && <p className="text-xs text-red-500 font-medium">{errors.telephone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    Profession <span className="text-red-500">*</span>
                  </Label>
                  <Input {...register('profession')} placeholder="Ex: Comptable" className="border-gray-200 focus:border-blue-500" />
                  {errors.profession && <p className="text-xs text-red-500 font-medium">{errors.profession.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Date de naissance
                  </Label>
                  <Input type="date" {...register('date_naissance')} className="border-gray-200 focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-xl">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    Type de pièce <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="piece_identite_type"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-white border-gray-200">
                          <SelectValue placeholder="Choisir un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CNI">CNI (Carte Nationale)</SelectItem>
                          <SelectItem value="PASSPORT">Passeport</SelectItem>
                          <SelectItem value="PERMIS">Permis de conduire</SelectItem>
                          <SelectItem value="CARTE_SEJOUR">Carte de séjour</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    Numéro de pièce <span className="text-red-500">*</span>
                  </Label>
                  <Input {...register('piece_identite_numero')} placeholder="Ex: TG-12345678" className="bg-white border-gray-200 focus:border-blue-500" />
                  {errors.piece_identite_numero && <p className="text-xs text-red-500 font-medium">{errors.piece_identite_numero.message}</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="garant" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-bold uppercase tracking-wider mb-1">Information importante</p>
                  <p>Le garant est la personne qui s'engage à payer le loyer en cas de défaillance du locataire. Ses coordonnées doivent être exactes.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Prénom du garant *</Label>
                  <Input {...register('garant.prenom')} placeholder="Prénom" className="border-gray-200 focus:border-blue-500" />
                  {errors.garant?.prenom && <p className="text-xs text-red-500 font-medium">{errors.garant.prenom.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Nom du garant *</Label>
                  <Input {...register('garant.nom')} placeholder="Nom" className="border-gray-200 focus:border-blue-500" />
                  {errors.garant?.nom && <p className="text-xs text-red-500 font-medium">{errors.garant.nom.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Email du garant *</Label>
                  <Input type="email" {...register('garant.email')} placeholder="garant@example.tg" className="border-gray-200 focus:border-blue-500" />
                  {errors.garant?.email && <p className="text-xs text-red-500 font-medium">{errors.garant.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Téléphone du garant *</Label>
                  <Input {...register('garant.telephone')} placeholder="+228..." className="border-gray-200 focus:border-blue-500" />
                  {errors.garant?.telephone && <p className="text-xs text-red-500 font-medium">{errors.garant.telephone.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Profession du garant *</Label>
                  <Input {...register('garant.profession')} placeholder="Ex: Directeur Général" className="border-gray-200 focus:border-blue-500" />
                  {errors.garant?.profession && <p className="text-xs text-red-500 font-medium">{errors.garant.profession.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Revenu mensuel (FCFA) *</Label>
                  <Input type="number" {...register('garant.revenu_mensuel')} placeholder="800000" className="border-gray-200 focus:border-blue-500" />
                  {errors.garant?.revenu_mensuel && <p className="text-xs text-red-500 font-medium">{errors.garant.revenu_mensuel.message}</p>}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending} className="text-gray-500">
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isPending} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11 rounded-lg transition-all shadow-md active:scale-[0.98]"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Mettre à jour le dossier' : 'Créer le dossier locataire'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
