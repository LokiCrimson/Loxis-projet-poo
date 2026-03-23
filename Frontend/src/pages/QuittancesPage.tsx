import { useState } from 'react';
import { Search, Receipt, Mail, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageHeader } from '@/components/PageHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { useQuittances, useEnvoyerQuittance } from '@/hooks/use-quittances';
import { formatFCFA, formatDate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function QuittancesPage() {
  const [search, setSearch] = useState('');
  const [previewId, setPreviewId] = useState<number | null>(null);
  const { toast } = useToast();

  const params: Record<string, string> = {};
  if (search) params.search = search;

  const { data: quittances, isLoading } = useQuittances(params);
  const envoyerMut = useEnvoyerQuittance();

  const previewQuittance = quittances?.find(q => q.id === previewId);

  const handleEnvoyer = (id: number) => {
    envoyerMut.mutate(id, {
      onSuccess: () => toast({ title: 'Quittance envoyée', description: 'Le locataire recevra la quittance par email.' }),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Quittances" subtitle={quittances ? `${quittances.length} quittances` : undefined} />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher par numéro ou locataire..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" lines={6} />
      ) : !quittances?.length ? (
        <EmptyState icon={Receipt} title="Aucune quittance" description="Les quittances seront générées automatiquement après chaque paiement." />
      ) : (
        <div className="overflow-x-auto rounded-xl bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-3 text-left font-medium text-muted-foreground">Numéro</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Locataire</th>
                <th className="p-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Bien</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Période</th>
                <th className="p-3 text-right font-medium text-muted-foreground">Montant</th>
                <th className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Émission</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Envoyée</th>
                <th className="p-3 text-right font-medium text-muted-foreground text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quittances.map((q, idx) => (
                <tr key={q.id} className={cn('border-b border-border hover:bg-muted/30 transition-colors', idx % 2 === 0 ? '' : 'bg-muted/10')}>
                  <td className="p-3 font-medium text-black">{q.numero}</td>
                  <td className="p-3 text-black font-semibold">{q.locataire_nom}</td>
                  <td className="p-3 hidden sm:table-cell text-muted-foreground">
                    <div className="flex flex-col">
                      <span className="text-black font-medium">{q.bien_reference}</span>
                      <span className="text-[10px] truncate max-w-[150px]">{q.bien_adresse}</span>
                    </div>
                  </td>
                  <td className="p-3 text-black font-medium">{q.periode}</td>
                  <td className="p-3 text-right font-bold text-secondary">{formatFCFA(q.montant_total)}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{formatDate(q.date_emission)}</td>
                  <td className="p-3">
                    {q.envoyee ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20"><Check className="h-3 w-3" />Oui</span>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">Non</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setPreviewId(q.id)} title="Aperçu">
                        <FileText className="h-4 w-4 text-black" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEnvoyer(q.id)} disabled={envoyerMut.isPending} title="Envoyer par email" className={q.envoyee ? "text-success" : "text-black"}>
                        {envoyerMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PDF Preview Modal */}
      <Dialog open={!!previewId} onOpenChange={() => setPreviewId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Aperçu de la quittance</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground italic">
              Vérifiez les détails de la quittance avant impression ou envoi.
            </DialogDescription>
          </DialogHeader>
          {previewQuittance && (
            <div className="mt-4 p-1">
              <div className="rounded-xl border-2 border-muted bg-white p-6 shadow-sm space-y-6">
                <div className="text-center border-b border-muted pb-6">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">QUITTANCE DE LOYER</h3>
                  <div className="mt-2 inline-block bg-muted px-3 py-1 rounded-full text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    N° {previewQuittance.numero}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Locataire</span>
                    <p className="font-bold text-slate-900 leading-none">{previewQuittance.locataire_nom}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Période</span>
                    <p className="font-bold text-slate-900 leading-none">{previewQuittance.periode}</p>
                  </div>
                  <div className="col-span-2 space-y-1 border-t border-muted pt-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bien immobilier</span>
                    <p className="font-bold text-slate-900 leading-tight">{previewQuittance.bien_reference}</p>
                    <p className="text-xs text-muted-foreground italic">{previewQuittance.bien_adresse}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/30 border border-muted p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-600">Loyer Principal</span>
                    <span className="font-bold text-slate-900">{formatFCFA(previewQuittance.montant_loyer)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-600">Charges</span>
                    <span className="font-bold text-slate-900">{formatFCFA(previewQuittance.montant_charges)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-muted pt-3 font-black text-lg">
                    <span className="text-slate-900 uppercase tracking-tighter">Total payé</span>
                    <div className="text-secondary bg-secondary/5 px-3 py-1 rounded-lg border border-secondary/10">
                      {formatFCFA(previewQuittance.montant_total)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1 text-center border-t border-muted pt-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Émis le {formatDate(previewQuittance.date_emission)}</span>
                  </div>
                  <div className="text-[11px] font-black text-secondary tracking-[0.2em] mt-1 italic">
                    LOXIS — Votre patrimoine, simplifié.
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" className="font-bold text-slate-700" onClick={() => setPreviewId(null)}>Fermer</Button>
                <Button 
                  className="bg-indigo-600 hover:bg-slate-900 font-bold px-6 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                  onClick={() => { handleEnvoyer(previewQuittance.id); setPreviewId(null); }} 
                  disabled={envoyerMut.isPending}
                >
                  {envoyerMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                  Envoyer maintenant
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
