import { useLocation, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBail } from '@/hooks/use-baux';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useBiens } from '@/hooks/use-biens';
import { useLocataires } from '@/hooks/use-locataires';
import { useEffect } from 'react';

const bailSchema = z.object({
  bien_id: z.coerce.number().min(1, 'Le bien est requis'),
  locataire_id: z.coerce.number().min(1, 'Le locataire est requis'),
  date_debut: z.string().min(1, 'La date de début est requise'),
  date_fin: z.string().optional().or(z.literal('')),
  loyer_initial: z.coerce.number().min(1, 'Le loyer est requis'),
  loyer_actuel: z.coerce.number().min(1, 'Le loyer actuel est requis'),
  charges: z.coerce.number().min(0).optional().default(0),
  depot_garantie_verse: z.coerce.number().min(0).optional().default(0),
  jour_paiement: z.coerce.number().min(1).max(28, 'Le jour doit être entre 1 et 28'),
  moyen_initial: z.string().optional().default('especes'),
}).refine((data) => {
  if (data.date_fin && data.date_fin !== '') {
    return new Date(data.date_debut) < new Date(data.date_fin);
  }
  return true;
}, {
  message: "La date de fin doit être après la date de début",
  path: ["date_fin"],
});

type BailFormData = z.infer<typeof bailSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultBienId?: number;
}

export function BailFormModal({ open, onOpenChange, defaultBienId }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state?.prefill;

  const createMut = useCreateBail();
  const { toast } = useToast();
  const { data: biens = [] } = useBiens(); // On retire le filtre statut: 'vacant' pour voir tous les biens
  const { data: locataires = [] } = useLocataires();

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<BailFormData>({
    resolver: zodResolver(bailSchema),
    defaultValues: { charges: 0, depot_garantie_verse: 0, jour_paiement: 5, bien_id: defaultBienId },
  });

  useEffect(() => {
    if (open) {
      if (prefill) {
        reset({
          bien_id: prefill.bien_id || defaultBienId,
          locataire_id: prefill.locataire_id,
          date_debut: prefill.date_debut,
          loyer_initial: Number(prefill.loyer_initial),
          loyer_actuel: Number(prefill.loyer_actuel),
          charges: Number(prefill.charges),
          jour_paiement: prefill.jour_paiement,
        });
      } else if (defaultBienId) {
        setValue('bien_id', defaultBienId);
      }
    }
  }, [open, prefill, defaultBienId, setValue, reset]);

  const loyerInitial = watch('loyer_initial');
  const bienId = watch('bien_id');

  useEffect(() => {
    if (loyerInitial) {
      setValue('loyer_actuel', loyerInitial);
    }
  }, [loyerInitial, setValue]);

  // Mettre à jour automatiquement le loyer et les charges quand on change de bien
  useEffect(() => {
    // On ne veut pas écraser les données de pré-remplissage lors de l'initialisation
    if (bienId && !prefill) {
      const bien = biens.find((b: any) => b.id === bienId);
      if (bien) {
        setValue('loyer_initial', Number(bien.base_rent_hc) || 0);
        setValue('loyer_actuel', Number(bien.base_rent_hc) || 0);
        setValue('charges', Number(bien.base_charges) || 0);
        setValue('depot_garantie_verse', Number(bien.guarantee_deposit) || 0);
      }
    }
  }, [bienId, biens, setValue, prefill]);

  const onSubmit = (data: BailFormData) => {
    // Transformer date_fin vide en null pour le backend
    const payload = {
      ...data,
      date_fin: data.date_fin === '' ? null : data.date_fin,
    };
    
    createMut.mutateAsync(payload)
      .then(() => { 
        toast({ title: 'Bail créé avec succès' }); 
        onOpenChange(false); 
        reset(); 
        navigate('/baux');
      })
      .catch((e) => {
        console.error(e);
        const errorData = e.response?.data;
        let errorMessage = 'Erreur lors de la création';
        
        if (typeof errorData === 'object') {
          errorMessage = Object.entries(errorData)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join(' | ');
        } else if (errorData) {
          errorMessage = JSON.stringify(errorData);
        }
        
        toast({ 
          title: 'Erreur', 
          description: errorMessage, 
          variant: 'destructive' 
        });
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nouveau bail</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <Label>Bien *</Label>
            <Controller control={control} name="bien_id" render={({ field }) => (
              <Select value={field.value?.toString()} onValueChange={v => field.onChange(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un bien" /></SelectTrigger>
                <SelectContent>
                  {biens.map((b: any) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium text-black">
                          {b.reference || `ID: ${b.id}`} — {b.address || b.adresse || 'Sans adresse'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Loyer: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(b.base_rent_hc || 0)} | 
                          Charges: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(b.base_charges || 0)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
            {errors.bien_id && <p className="mt-1 text-xs text-destructive">{errors.bien_id.message}</p>}
          </div>
          <div>
            <Label>Locataire *</Label>
            <Controller control={control} name="locataire_id" render={({ field }) => (
              <Select value={field.value?.toString()} onValueChange={v => field.onChange(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un locataire" /></SelectTrigger>
                <SelectContent>
                  {locataires.map((l: any) => <SelectItem key={l.id} value={l.id.toString()}>{l.first_name || l.prenom} {l.last_name || l.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {errors.locataire_id && <p className="mt-1 text-xs text-destructive">{errors.locataire_id.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date de début *</Label>
              <Input type="date" {...register('date_debut')} />
              {errors.date_debut && <p className="mt-1 text-xs text-destructive">{errors.date_debut.message}</p>}
            </div>
            <div>
              <Label>Date de fin *</Label>
              <Input type="date" {...register('date_fin')} />
              {errors.date_fin && <p className="mt-1 text-xs text-destructive">{errors.date_fin.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Loyer initial (FCFA) *</Label>
              <Input type="number" {...register('loyer_initial')} />
              {errors.loyer_initial && <p className="mt-1 text-xs text-destructive">{errors.loyer_initial.message}</p>}
            </div>
            <div>
              <Label>Jour de paiement (1-28) *</Label>
              <Input type="number" {...register('jour_paiement')} />
              {errors.jour_paiement && <p className="mt-1 text-xs text-destructive">{errors.jour_paiement.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Charges (FCFA)</Label><Input type="number" {...register('charges')} /></div>
            <div><Label>Dépôt de garantie / Avance (FCFA)</Label><Input type="number" {...register('depot_garantie_verse')} /></div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 space-y-3">
            <h4 className="text-sm font-semibold">Mode de règlement de la signature</h4>
            <div>
              <Label>Moyen de paiement</Label>
              <Controller control={control} name="moyen_initial" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Moyen" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="especes">Espèces</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                    <SelectItem value="cheque">Chèque</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            <p className="text-[10px] text-muted-foreground">Le dépôt de garantie versé sera automatiquement enregistré comme premier paiement (avance) pour le mois en cours.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={createMut.isPending}>
              {createMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer le bail
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
