import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Building2, User, Banknote, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { useBail, useResilierBail } from '@/hooks/use-baux';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { formatFCFA, formatDate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function BailDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: bail, isLoading } = useBail(Number(id));
  const [showResilier, setShowResilier] = useState(false);
  const resilierMut = useResilierBail();
  const { toast } = useToast();

  if (isLoading) return <div className="space-y-4"><LoadingSkeleton lines={2} /><LoadingSkeleton type="card" /></div>;
  if (!bail) return <EmptyState title="Bail non trouvé" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/baux" className="flex items-center gap-1 hover:text-foreground"><ArrowLeft className="h-4 w-4" />Baux</Link>
        <span>/</span><span className="text-foreground">{bail.reference}</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="page-title">{bail.reference}</h1>
          <StatusBadge status={bail.statut} />
        </div>
        {bail.statut === 'actif' && (
          <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => setShowResilier(true)}>
            <XCircle className="mr-2 h-4 w-4" />Résilier le bail
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-6 shadow-sm space-y-4">
          <h3 className="section-title">Informations du bail</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-4 w-4" />Bien</span><Link to={`/biens/${bail.bien_id}`} className="font-medium text-secondary hover:underline">{bail.bien_reference}</Link></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Adresse</span><span className="text-right text-xs max-w-[200px]">{bail.bien_adresse}</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" />Locataire</span><span className="font-medium">{bail.locataire_nom}</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" />Début</span><span>{formatDate(bail.date_debut)}</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" />Fin</span><span>{formatDate(bail.date_fin)}</span></div>
          </div>
        </div>

        <div className="rounded-xl bg-card p-6 shadow-sm space-y-4">
          <h3 className="section-title">Finances</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Banknote className="h-4 w-4" />Loyer initial</span><span className="font-bold text-secondary">{formatFCFA(bail.loyer_initial)}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Loyer actuel</span><span className="font-bold text-secondary">{formatFCFA(bail.loyer_actuel)}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Charges</span><span>{formatFCFA(bail.charges)}</span></div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3"><span className="font-medium">Total mensuel</span><span className="text-lg font-bold">{formatFCFA(bail.loyer_actuel + bail.charges)}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Dépôt de garantie</span><span>{formatFCFA(bail.depot_garantie_verse)}</span></div>
          </div>
          {bail.motif_fin && (
            <div className="rounded-lg bg-destructive/10 p-3">
              <p className="text-sm font-medium text-destructive">Motif de fin: {bail.motif_fin}</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog open={showResilier} onOpenChange={setShowResilier} title="Résilier ce bail" description="Cette action marquera le bail comme résilié. Confirmez-vous ?" confirmLabel="Résilier" onConfirm={() => { resilierMut.mutate({ id: bail.id, data: { motif_fin: 'Résiliation anticipée' } }, { onSuccess: () => { toast({ title: 'Bail résilié' }); setShowResilier(false); } }); }} destructive />
    </div>
  );
}
