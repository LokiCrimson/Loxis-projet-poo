import { useState } from 'react';
import { Search, Receipt, Mail, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
                <th className="p-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quittances.map((q, idx) => (
                <tr key={q.id} className={cn('border-b border-border hover:bg-muted/30 transition-colors', idx % 2 === 0 ? '' : 'bg-muted/10')}>
                  <td className="p-3 font-medium">{q.numero}</td>
                  <td className="p-3">{q.locataire}</td>
                  <td className="p-3 hidden sm:table-cell text-muted-foreground">{q.bien_reference}</td>
                  <td className="p-3">{q.periode}</td>
                  <td className="p-3 text-right font-semibold text-secondary">{formatFCFA(q.montant_total)}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{formatDate(q.date_emission)}</td>
                  <td className="p-3">
                    {q.envoyee ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-success"><Check className="h-3 w-3" />Oui</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Non</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setPreviewId(q.id)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                      {!q.envoyee && (
                        <Button variant="ghost" size="sm" onClick={() => handleEnvoyer(q.id)} disabled={envoyerMut.isPending}>
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
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
          <DialogHeader><DialogTitle>Aperçu de la quittance</DialogTitle></DialogHeader>
          {previewQuittance && (
            <div className="mt-4">
              <div className="rounded-lg border border-border p-6 space-y-4">
                <div className="text-center border-b border-border pb-4">
                  <h3 className="text-lg font-bold text-foreground">QUITTANCE DE LOYER</h3>
                  <p className="text-sm text-muted-foreground">{previewQuittance.numero}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Locataire</span><span className="font-medium">{previewQuittance.locataire}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Bien</span><span>{previewQuittance.bien_reference}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Période</span><span>{previewQuittance.periode}</span></div>
                </div>
                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Loyer</span><span>{formatFCFA(previewQuittance.montant_loyer)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Charges</span><span>{formatFCFA(previewQuittance.montant_charges)}</span></div>
                  <div className="flex justify-between font-bold text-base border-t border-border pt-2"><span>Total</span><span className="text-secondary">{formatFCFA(previewQuittance.montant_total)}</span></div>
                </div>
                <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
                  <p>Date d'émission: {formatDate(previewQuittance.date_emission)}</p>
                  <p className="mt-1">LOXIS — Votre patrimoine, simplifié.</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                {!previewQuittance.envoyee && (
                  <Button onClick={() => { handleEnvoyer(previewQuittance.id); setPreviewId(null); }} disabled={envoyerMut.isPending}>
                    {envoyerMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Envoyer par email
                  </Button>
                )}
                <Button variant="outline" onClick={() => setPreviewId(null)}>Fermer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
