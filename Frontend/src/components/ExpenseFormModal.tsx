import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateExpense, useExpenseCategories } from '@/hooks/use-depenses';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const expenseSchema = z.object({
  bien_id: z.number().min(1, 'Le bien est requis'),
  categorie_id: z.string().min(1, 'La catégorie est requise'),
  libelle: z.string().min(3, 'Le libellé doit faire au moins 3 caractères'),
  montant: z.coerce.number().min(0.01, 'Le montant doit être supérieur à 0'),
  date_depense: z.string().min(1, 'La date est requise'),
  fournisseur: z.string().optional(),
  deductible: z.boolean().default(false),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bienId: number;
}

export function ExpenseFormModal({ open, onOpenChange, bienId }: ExpenseFormModalProps) {
  const { data: categories = [] } = useExpenseCategories();
  const createMutation = useCreateExpense();
  const { toast } = useToast();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      bien_id: bienId,
      date_depense: new Date().toISOString().split('T')[0],
      deductible: false,
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        categorie_id: parseInt(data.categorie_id),
      });
      toast({ title: 'Dépense enregistrée', description: 'La dépense a été ajoutée avec succès.' });
      onOpenChange(false);
      reset();
    } catch (e: any) {
      toast({ 
        title: 'Erreur', 
        description: e.response?.data?.detail || 'Une erreur est survenue lors de l\'enregistrement.', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter une dépense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="libelle">Libellé *</Label>
            <Input id="libelle" {...register('libelle')} placeholder="Ex: Réparation fuite évier" />
            {errors.libelle && <p className="text-xs text-destructive">{errors.libelle.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Controller
                control={control}
                name="categorie_id"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categorie_id && <p className="text-xs text-destructive">{errors.categorie_id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="montant">Montant *</Label>
              <Input id="montant" type="number" step="0.01" {...register('montant')} />
              {errors.montant && <p className="text-xs text-destructive">{errors.montant.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_depense">Date *</Label>
              <Input id="date_depense" type="date" {...register('date_depense')} />
              {errors.date_depense && <p className="text-xs text-destructive">{errors.date_depense.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fournisseur">Fournisseur</Label>
              <Input id="fournisseur" {...register('fournisseur')} placeholder="Ex: Castorama" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
