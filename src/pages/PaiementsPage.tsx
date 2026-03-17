import { useState } from 'react';
import { CreditCard, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { usePaiements, useEnregistrerPaiement } from '@/hooks/use-paiements';
import { formatFCFA, formatDate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const moisLabels = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function PaiementsPage() {
  const [mois, setMois] = useState('all');
  const [statut, setStatut] = useState('tous');
  const [payModal, setPayModal] = useState<number | null>(null);
  const [montantPaye, setMontantPaye] = useState('');
  const [moyen, setMoyen] = useState('virement');
  const { toast } = useToast();

  const params: Record<string, string> = {};
  if (mois && mois !== 'all') params.mois = mois;
  params.annee = '2026';
  if (statut !== 'tous') params.statut = statut;

  const { data: paiements, isLoading } = usePaiements(params);
  const enregistrerMut = useEnregistrerPaiement();

  const selectedPaiement = paiements?.find(p => p.id === payModal);

  const handleEnregistrer = () => {
    if (!payModal || !montantPaye) return;
    enregistrerMut.mutate(
      { id: payModal, data: { montant_paye: Number(montantPaye), moyen, date_paiement: new Date().toISOString().split('T')[0] } },
      {
        onSuccess: () => {
          toast({ title: 'Paiement enregistré', description: 'La quittance sera générée automatiquement.' });
          setPayModal(null);
          setMontantPaye('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Paiements" subtitle="Suivi des loyers — Année 2026" />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={mois} onValueChange={setMois}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Tous les mois" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les mois</SelectItem>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>{moisLabels[i + 1]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statut} onValueChange={setStatut}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous</SelectItem>
            <SelectItem value="paye">Payé</SelectItem>
            <SelectItem value="partiel">Partiel</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" lines={8} />
      ) : !paiements?.length ? (
        <EmptyState icon={CreditCard} title="Aucun paiement" description="Les paiements apparaîtront ici." />
      ) : (
        <div className="overflow-x-auto rounded-xl bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-3 text-left font-medium text-muted-foreground">Locataire</th>
                <th className="p-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Bien</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Période</th>
                <th className="p-3 text-right font-medium text-muted-foreground">Attendu</th>
                <th className="p-3 text-right font-medium text-muted-foreground">Payé</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Statut</th>
                <th className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Moyen</th>
                <th className="p-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paiements.map((p, idx) => (
                <tr key={p.id} className={cn('border-b border-border hover:bg-muted/30 transition-colors', idx % 2 === 0 ? '' : 'bg-muted/10')}>
                  <td className="p-3 font-medium">{p.locataire}</td>
                  <td className="p-3 hidden sm:table-cell text-muted-foreground">{p.bien_reference}</td>
                  <td className="p-3">{moisLabels[p.periode_mois]} {p.periode_annee}</td>
                  <td className="p-3 text-right">{formatFCFA(p.montant_attendu)}</td>
                  <td className="p-3 text-right font-semibold">{formatFCFA(p.montant_paye)}</td>
                  <td className="p-3"><StatusBadge status={p.statut} /></td>
                  <td className="p-3 hidden md:table-cell capitalize text-muted-foreground">{p.moyen || '—'}</td>
                  <td className="p-3 text-right">
                    {p.statut !== 'paye' && (
                      <Button size="sm" onClick={() => { setPayModal(p.id); setMontantPaye(p.reste_a_payer.toString()); }}>
                        <Plus className="mr-1 h-3 w-3" />Payer
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {paiements && paiements.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-card p-4 shadow-sm text-center">
            <p className="label-uppercase">Total attendu</p>
            <p className="mt-1 text-xl font-bold">{formatFCFA(paiements.reduce((s, p) => s + p.montant_attendu, 0))}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm text-center">
            <p className="label-uppercase">Total perçu</p>
            <p className="mt-1 text-xl font-bold text-success">{formatFCFA(paiements.reduce((s, p) => s + p.montant_paye, 0))}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm text-center">
            <p className="label-uppercase">Reste à percevoir</p>
            <p className="mt-1 text-xl font-bold text-destructive">{formatFCFA(paiements.reduce((s, p) => s + p.reste_a_payer, 0))}</p>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      <Dialog open={!!payModal} onOpenChange={() => setPayModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle></DialogHeader>
          {selectedPaiement && (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p><span className="text-muted-foreground">Locataire:</span> <span className="font-medium">{selectedPaiement.locataire}</span></p>
                <p><span className="text-muted-foreground">Période:</span> {moisLabels[selectedPaiement.periode_mois]} {selectedPaiement.periode_annee}</p>
                <p><span className="text-muted-foreground">Reste à payer:</span> <span className="font-bold text-destructive">{formatFCFA(selectedPaiement.reste_a_payer)}</span></p>
              </div>
              <div>
                <Label>Montant payé (FCFA) *</Label>
                <Input type="number" value={montantPaye} onChange={e => setMontantPaye(e.target.value)} />
              </div>
              <div>
                <Label>Moyen de paiement</Label>
                <Select value={moyen} onValueChange={setMoyen}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virement">Virement</SelectItem>
                    <SelectItem value="cheque">Chèque</SelectItem>
                    <SelectItem value="especes">Espèces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setPayModal(null)}>Annuler</Button>
                <Button onClick={handleEnregistrer} disabled={enregistrerMut.isPending}>
                  {enregistrerMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
