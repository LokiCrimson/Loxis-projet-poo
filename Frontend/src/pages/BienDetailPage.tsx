import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Building2, MapPin, Maximize2, DoorOpen, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { BienFormModal } from '@/components/BienFormModal';
import { useState } from 'react';
import { useBien, useDepensesByBien, usePhotosBien } from '@/hooks/use-biens';
import { formatFCFA, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useBaux } from '@/hooks/use-baux';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ExpenseFormModal } from '@/components/ExpenseFormModal';
import { BailFormModal } from '@/components/BailFormModal';

const gradients = [
  'from-primary/80 to-secondary/80',
  'from-secondary/60 to-primary/60',
  'from-success/50 to-secondary/50',
];

export default function BienDetailPage() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isBailOpen, setIsBailOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const bienId = Number(id);
  const { data: bien, isLoading } = useBien(bienId);
  const { data: photos = [] } = usePhotosBien(bienId);
  const { data: depenses } = useDepensesByBien(bienId);
  const { data: baux = [] } = useBaux({ statut: 'actif', bien_id: bienId.toString() });

  const activeBaux = baux.filter((b: any) => b.bien_id === bienId && b.statut === 'actif');

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
            <h1 className="page-title">{bien.address}</h1>
            <StatusBadge status={bien.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{bien.reference} · {((bien.city || bien.ville || "") || bien.ville || "")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}><Pencil className="mr-2 h-4 w-4" />Modifier</Button>
          <Button onClick={() => setIsBailOpen(true)}><Plus className="mr-2 h-4 w-4" />Nouveau Bail</Button>
        </div>
      </div>

      {/* Photo / Carousel */}
      <div className="relative group">
        {photos && photos.length > 0 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {photos.map((p: any) => (
                <CarouselItem key={p.id}>
                  <div className="relative h-96 w-full rounded-2xl overflow-hidden bg-muted">
                    <img 
                      src={p.image} 
                      alt={`Photo ${p.id}`} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                    />
                    {p.is_main && (
                      <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg">
                        Principale
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {photos.length > 1 && (
              <>
                <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </Carousel>
        ) : (
          <div className={cn('relative h-56 rounded-xl bg-gradient-to-br', gradients[bienId % gradients.length], 'overflow-hidden flex items-center justify-center')}>
             <Building2 className="h-16 w-16 text-card/30" />
          </div>
        )}

        {/* 3D Tour Button overlay */}
        {bien.tour_3d_url && (
          <div className="absolute bottom-6 right-6 z-10">
            <Button 
              asChild 
              className="bg-primary/90 hover:bg-primary shadow-2xl backdrop-blur-md rounded-full px-6 h-12 gap-2"
            >
              <a href={bien.tour_3d_url} target="_blank" rel="noopener noreferrer">
                <Maximize2 className="h-5 w-5" />
                Voir la Visite 3D
              </a>
            </Button>
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <h3 className="section-title mb-4">Caractéristiques</h3>
          <div className="space-y-3 text-sm">
            {[
              { icon: Maximize2, label: 'Surface', value: `${((bien.surface_area || bien.surface || 0) || bien.surface || 0)} m²` },
              { icon: DoorOpen, label: 'Pièces', value: ((bien.rooms_count || bien.nombre_pieces || 1) || bien.nombre_pieces || 1) },
              { icon: Tag, label: 'Catégorie', value: (bien.category_name || bien.category || '' ) },
              { icon: Building2, label: 'Type', value: (bien.type || bien.property_type || '') },
              { icon: MapPin, label: 'Ville', value: ((bien.city || bien.ville || "") || bien.ville || "") },
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
              <span className="text-lg font-bold text-secondary">{formatFCFA(Number(bien.base_rent_hc || 0))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Charges</span>
              <span className="font-medium">{formatFCFA(Number(bien.base_charges || 0))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Dépôt de garantie</span>
              <span className="font-medium">{formatFCFA(Number(bien.guarantee_deposit || 0))}</span>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="font-medium">Loyer total</span>
              <span className="text-lg font-bold text-foreground">{formatFCFA(Number(bien.base_rent_hc || 0) + Number(bien.base_charges || 0))}</span>
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
            <EmptyState 
              title="Aucune dépense" 
              description="Les dépenses liées à ce bien apparaîtront ici." 
              actionLabel="Ajouter une dépense" 
              onAction={() => setIsExpenseOpen(true)} 
            />
          )}
        </TabsContent>
      </Tabs>
      <BienFormModal open={isEditOpen} onOpenChange={setIsEditOpen} bienId={bienId} />
      <ExpenseFormModal open={isExpenseOpen} onOpenChange={setIsExpenseOpen} bienId={bienId} />
      <BailFormModal open={isBailOpen} onOpenChange={setIsBailOpen} defaultBienId={bienId} />
    </div>
  );
}
