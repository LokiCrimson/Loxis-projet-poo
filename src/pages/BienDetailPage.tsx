import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Building2, MapPin, Maximize2, DoorOpen, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { useBien, useDepensesByBien } from '@/hooks/use-biens';
import { formatFCFA, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { mockBaux } from '@/services/mock-data';

const gradients = [
  'from-primary/80 to-secondary/80',
  'from-secondary/60 to-primary/60',
  'from-success/50 to-secondary/50',
];

export default function BienDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bienId = Number(id);
  const { data: bien, isLoading } = useBien(bienId);
  const { data: depenses } = useDepensesByBien(bienId);

  const activeBaux = mockBaux.filter(b => b.bien_id === bienId && b.statut === 'actif');

  if (isLoading) {
    return <div className="space-y-4"><LoadingSkeleton lines={2} /><LoadingSkeleton type="card" /><LoadingSkeleton type="card" /></div>;
  }

  if (!bien) {
    return <EmptyState title="Bien non trouvé" description="Ce bien n'existe pas ou a été supprimé." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/biens" className="flex items-center gap-1 hover:text-foreground"><ArrowLeft className="h-4 w-4" />Mes Biens</Link>
        <span>/</span>
        <span className="text-foreground">{bien.reference}</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="page-title">{bien.adresse}</h1>
            <StatusBadge status={bien.statut} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{bien.reference} · {bien.ville}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Pencil className="mr-2 h-4 w-4" />Modifier</Button>
          <Button><Plus className="mr-2 h-4 w-4" />Nouveau Bail</Button>
        </div>
      </div>

      {/* Photo */}
      <div className={cn('relative h-56 rounded-xl bg-gradient-to-br', gradients[bienId % gradients.length])}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="h-16 w-16 text-card/30" />
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <h3 className="section-title mb-4">Caractéristiques</h3>
          <div className="space-y-3 text-sm">
            {[
              { icon: Maximize2, label: 'Surface', value: `${bien.surface} m²` },
              { icon: DoorOpen, label: 'Pièces', value: bien.nombre_pieces },
              { icon: Tag, label: 'Catégorie', value: bien.categorie },
              { icon: Building2, label: 'Type', value: bien.type_bien },
              { icon: MapPin, label: 'Ville', value: bien.ville },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><item.icon className="h-4 w-4" />{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
            {bien.description && (
              <div className="mt-4 rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">{bien.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-card p-6 shadow-sm">
          <h3 className="section-title mb-4">Finances</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Loyer HC</span>
              <span className="text-lg font-bold text-secondary">{formatFCFA(bien.loyer_hc)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Charges</span>
              <span className="font-medium">{formatFCFA(bien.charges)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Dépôt de garantie</span>
              <span className="font-medium">{formatFCFA(bien.depot_garantie)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="font-medium">Loyer total</span>
              <span className="text-lg font-bold text-foreground">{formatFCFA(bien.loyer_hc + bien.charges)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bail" className="rounded-xl bg-card p-6 shadow-sm">
        <TabsList>
          <TabsTrigger value="bail">Bail Actif</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
          <TabsTrigger value="depenses">Dépenses</TabsTrigger>
        </TabsList>

        <TabsContent value="bail" className="mt-4">
          {activeBaux.length > 0 ? (
            activeBaux.map(bail => (
              <div key={bail.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{bail.locataire}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(bail.date_debut)} → {formatDate(bail.date_fin)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-secondary">{formatFCFA(bail.loyer)}/mois</p>
                    <StatusBadge status={bail.statut} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="Aucun bail actif" description="Ce bien n'a pas de bail en cours." actionLabel="Créer un bail" onAction={() => {}} />
          )}
        </TabsContent>

        <TabsContent value="historique" className="mt-4">
          <EmptyState title="Aucun historique" description="Les baux terminés apparaîtront ici." />
        </TabsContent>

        <TabsContent value="depenses" className="mt-4">
          {depenses && depenses.length > 0 ? (
            <div className="space-y-3">
              {depenses.map(dep => (
                <div key={dep.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{dep.libelle}</p>
                    <p className="text-xs text-muted-foreground">{dep.categorie} · {formatDate(dep.date)}</p>
                  </div>
                  <p className="font-semibold text-destructive">{formatFCFA(dep.montant)}</p>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="font-medium">Total des dépenses</span>
                <span className="font-bold">{formatFCFA(depenses.reduce((s, d) => s + d.montant, 0))}</span>
              </div>
            </div>
          ) : (
            <EmptyState title="Aucune dépense" description="Les dépenses liées à ce bien apparaîtront ici." actionLabel="Ajouter une dépense" onAction={() => {}} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
