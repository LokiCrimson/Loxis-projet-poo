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
import { mockBiens } from '@/services/mock-data';
import { mockLocataires } from '@/services/mock-data-phase2';

const bailSchema = z.object({
  bien_id: z.coerce.number().min(1, 'Le bien est requis'),
  locataire_id: z.coerce.number().min(1, 'Le locataire est requis'),
  date_debut: z.string().min(1, 'La date de début est requise'),
  date_fin: z.string().min(1, 'La date de fin est requise'),
  loyer_initial: z.coerce.number().min(1, 'Le loyer est requis'),
  charges: z.coerce.number().min(0).optional(),
  depot_garantie_verse: z.coerce.number().min(0).optional(),
});

type BailFormData = z.infer<typeof bailSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BailFormModal({ open, onOpenChange }: Props) {
  const createMut = useCreateBail();
  const { toast } = useToast();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<BailFormData>({
    resolver: zodResolver(bailSchema),
    defaultValues: { charges: 0, depot_garantie_verse: 0 },
  });

  const biensVacants = mockBiens.filter(b => b.statut === 'vacant');

  const onSubmit = (data: BailFormData) => {
    createMut.mutateAsync(data)
      .then(() => { toast({ title: 'Bail créé avec succès' }); onOpenChange(false); reset(); })
      .catch(() => toast({ title: 'Erreur', variant: 'destructive' }));
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
                  {biensVacants.map(b => <SelectItem key={b.id} value={b.id.toString()}>{b.reference} — {b.adresse}</SelectItem>)}
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
                  {mockLocataires.map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.prenom} {l.nom}</SelectItem>)}
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
          <div>
            <Label>Loyer mensuel (FCFA) *</Label>
            <Input type="number" {...register('loyer_initial')} />
            {errors.loyer_initial && <p className="mt-1 text-xs text-destructive">{errors.loyer_initial.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Charges (FCFA)</Label><Input type="number" {...register('charges')} /></div>
            <div><Label>Dépôt de garantie (FCFA)</Label><Input type="number" {...register('depot_garantie_verse')} /></div>
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
