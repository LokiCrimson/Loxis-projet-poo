import { useState } from 'react';
import { CreditCard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { usePaiements, useEnregistrerPaiement } from '@/hooks/use-paiements';
import { formatFCFA } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const moisLabels = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function PaiementsPage() {
  const [mois, setMois] = useState('all');
  const [statut, setStatut] = useState('tous');
  const [payModal, setPayModal] = useState<any | null>(null);
  const [montantPaye, setMontantPaye] = useState('');
  const [moyen, setMoyen] = useState('virement');
  const [reference, setReference] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const { toast } = useToast();

  const params: Record<string, string> = {
    annee: new Date().getFullYear().toString()
  };
  if (mois && mois !== 'all') params.mois = mois;
  if (statut !== 'tous') params.statut = statut;

  const { data: paiements, isLoading } = usePaiements(params);
  const enregistrerMut = useEnregistrerPaiement();

  const handleOpenPayModal = (paiement: any) => {
    setPayModal(paiement);
    // Calculer le reliquat exact pour pré-remplir
    const attendu = Number(paiement.montant_attendu || 0);
    const dejaPaye = Number(paiement.montant_paye || 0);
    const reste = Math.max(0, attendu - dejaPaye);
    setMontantPaye(reste.toString());
  };

  const handleEnregistrer = () => {
    if (!payModal || !montantPaye) return;
    
    // Si c'est un paiement partiel qu'on complète, on envoie le MONTANT PERÇU cumulé
    // Le backend compare montant_paye vs montant_attendu
    const nouveauCumul = Number(payModal.montant_paye || 0) + Number(montantPaye);

    const payload = {
      montant_paye: nouveauCumul,
      moyen,
      reference,
      commentaire,
      date_paiement: new Date().toISOString().split('T')[0],
      periode_mois: payModal.periode_mois,
      periode_annee: payModal.periode_annee,
      bail: payModal.bail
    };

    enregistrerMut.mutate(
      { id: payModal.id, data: payload },
      {
        onSuccess: () => {
          toast({ title: 'Succès', description: 'Paiement enregistré et quittance générée.' });
          setPayModal(null);
          setMontantPaye('');
          setReference('');
          setCommentaire('');
        },
        onError: (error: any) => {
          const detail = error.response?.data?.detail || error.response?.data?.message || "Erreur lors de l'enregistrement";
          toast({ title: 'Erreur', description: detail, variant: 'destructive' });
        }
      }
    );
  };

  const totalAttendu = paiements?.reduce((acc, p) => acc + Number(p.montant_attendu || 0), 0) || 0;
  const totalPercu = paiements?.reduce((acc, p) => acc + Number(p.montant_paye || 0), 0) || 0;
  const resteAPercevoir = totalAttendu - totalPercu;

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
        <>
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
                    <td className="p-3 font-medium">{p.locataire || '—'}</td>
                    <td className="p-3 hidden sm:table-cell text-muted-foreground">{p.bien_reference || '—'}</td>
                    <td className="p-3">{moisLabels[p.periode_mois]} {p.periode_annee}</td>
                    <td className="p-3 text-right font-medium">{formatFCFA(p.montant_attendu)}</td>
                    <td className="p-3 text-right font-bold text-primary">{formatFCFA(p.montant_paye)}</td>
                    <td className="p-3"><StatusBadge status={p.statut} /></td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{p.moyen_display || '—'}</td>
                    <td className="p-3 text-right">
                      {p.statut !== 'paye' && (
                        <Button size="sm" onClick={() => handleOpenPayModal(p)} className="gap-2">
                          <Plus className="h-3.5 w-3.5" /> Payer
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-card p-6 shadow-sm text-center border-l-4 border-l-primary">
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Total Attendu</p>
              <p className="text-2xl font-bold text-black">{formatFCFA(totalAttendu)}</p>
            </div>
            <div className="rounded-xl bg-card p-6 shadow-sm text-center border-l-4 border-l-success">
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Total Perçu</p>
              <p className="text-2xl font-bold text-success">{formatFCFA(totalPercu)}</p>
            </div>
            <div className="rounded-xl bg-card p-6 shadow-sm text-center border-l-4 border-l-destructive">
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Reste à percevoir</p>
              <p className="text-2xl font-bold text-destructive">{formatFCFA(resteAPercevoir)}</p>
            </div>
          </div>
        </>
      )}

      <Dialog open={!!payModal} onOpenChange={(open) => !open && setPayModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {payModal ? (
                <>
                  {payModal.locataire} — {payModal.bien_reference} ({moisLabels[payModal.periode_mois]} {payModal.periode_annee})
                </>
              ) : (
                "Veuillez remplir les informations de paiement ci-dessous."
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Attendu</p>
                <p className="text-sm font-medium">{formatFCFA(payModal?.montant_attendu || 0)}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Reste à payer</p>
                <p className="text-sm font-bold text-destructive">{formatFCFA(payModal?.reste_a_payer !== undefined ? payModal.reste_a_payer : payModal?.montant_attendu || 0)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="montant">Montant perçu (FCFA) *</Label>
              <Input 
                id="montant"
                type="number" 
                value={montantPaye} 
                onChange={e => setMontantPaye(e.target.value)} 
                placeholder="Entrez le montant reçu"
                className="font-bold text-lg h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Moyen *</Label>
                <Select value={moyen} onValueChange={setMoyen}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virement">Virement</SelectItem>
                    <SelectItem value="cheque">Chèque</SelectItem>
                    <SelectItem value="especes">Espèces</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ref">Référence</Label>
                <Input 
                  id="ref"
                  value={reference} 
                  onChange={e => setReference(e.target.value)} 
                  placeholder="ID transaction / N° chèque" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comm">Commentaire (interne)</Label>
              <Input 
                id="comm"
                value={commentaire} 
                onChange={e => setCommentaire(e.target.value)} 
                placeholder="Note libre..." 
              />
            </div>

            <div className="bg-muted/30 p-3 rounded-lg border border-border">
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                Note : Si le paiement est partiel, le reste sera reporté en dette sur le mois suivant. Une quittance sera générée automatiquement dès confirmation.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setPayModal(null)}>Annuler</Button>
              <Button className="flex-1 font-bold" onClick={handleEnregistrer} disabled={enregistrerMut.isPending || !montantPaye}>
                {enregistrerMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
