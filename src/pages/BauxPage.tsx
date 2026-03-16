import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, FileText, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useBaux, useResilierBail } from '@/hooks/use-baux';
import { formatFCFA, formatDate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';
import { BailFormModal } from '@/components/BailFormModal';
import { cn } from '@/lib/utils';

export default function BauxPage() {
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('tous');
  const [modalOpen, setModalOpen] = useState(false);
  const [resilierBailId, setResilierBailId] = useState<number | null>(null);
  const { toast } = useToast();

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (statut !== 'tous') params.statut = statut;

  const { data: baux, isLoading } = useBaux(params);
  const resilierMut = useResilierBail();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Baux"
        subtitle={baux ? `${baux.length} baux` : undefined}
        action={<Button onClick={() => setModalOpen(true)}><Plus className="mr-2 h-4 w-4" />Nouveau bail</Button>}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher un bail..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statut} onValueChange={setStatut}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="termine">Terminé</SelectItem>
            <SelectItem value="resilie">Résilié</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" lines={6} />
      ) : !baux?.length ? (
        <EmptyState icon={FileText} title="Aucun bail" description="Créez votre premier bail." actionLabel="Nouveau bail" onAction={() => setModalOpen(true)} />
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-3 text-left font-medium text-muted-foreground">Référence</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Bien</th>
                <th className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Locataire</th>
                <th className="p-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Période</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Loyer</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Statut</th>
                <th className="p-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {baux.map((bail, idx) => (
                <tr key={bail.id} className={cn('border-b border-border hover:bg-muted/30 transition-colors', idx % 2 === 0 ? '' : 'bg-muted/10')}>
                  <td className="p-3 font-medium">{bail.reference}</td>
                  <td className="p-3">
                    <p>{bail.bien_reference}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{bail.bien_adresse}</p>
                  </td>
                  <td className="p-3 hidden md:table-cell">{bail.locataire_nom}</td>
                  <td className="p-3 hidden lg:table-cell text-xs">
                    {formatDate(bail.date_debut)} → {formatDate(bail.date_fin)}
                  </td>
                  <td className="p-3 font-semibold text-secondary">{formatFCFA(bail.loyer_actuel)}</td>
                  <td className="p-3"><StatusBadge status={bail.statut} /></td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild><Link to={`/baux/${bail.id}`}><Eye className="h-4 w-4" /></Link></Button>
                      {bail.statut === 'actif' && (
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setResilierBailId(bail.id)}>
                          <XCircle className="h-4 w-4" />
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

      <BailFormModal open={modalOpen} onOpenChange={setModalOpen} />
      <ConfirmDialog
        open={!!resilierBailId}
        onOpenChange={() => setResilierBailId(null)}
        title="Résilier ce bail"
        description="Le bail sera marqué comme résilié. Les paiements en cours seront conservés."
        confirmLabel="Résilier"
        onConfirm={() => {
          if (resilierBailId) {
            resilierMut.mutate({ id: resilierBailId, data: { motif_fin: 'Résiliation anticipée' } }, {
              onSuccess: () => { toast({ title: 'Bail résilié' }); setResilierBailId(null); },
            });
          }
        }}
        destructive
      />
    </div>
  );
}
