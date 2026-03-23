import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Grid3X3, List, Eye, Pencil, MoreVertical, MapPin, Maximize2, DoorOpen, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useBiens, useDeleteBien } from '@/hooks/use-biens';
import { formatFCFA } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BienFormModal } from '@/components/BienFormModal';
import { useToast } from '@/hooks/use-toast';

const gradients = [
  'from-primary/80 to-secondary/80',
  'from-secondary/60 to-primary/60',
  'from-success/50 to-secondary/50',
  'from-warning/40 to-primary/40',
  'from-primary/70 to-success/40',
];

export default function BiensPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('tous');
  const [categorie, setCategorie] = useState('tous');
  const [modalOpen, setModalOpen] = useState(searchParams.get('action') === 'add');
  const [editBien, setEditBien] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { toast } = useToast();

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (statut !== 'tous') params.statut = statut;
  if (categorie !== 'tous') params.categorie = categorie;

  const { data: biens, isLoading } = useBiens(params);
  const deleteMutation = useDeleteBien();

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => {
          toast({ title: 'Bien supprimé', description: 'Le bien a été supprimé avec succès.' });
          setDeleteId(null);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Biens"
        subtitle={biens ? `${biens.length} biens au total` : undefined}
        action={<Button onClick={() => setModalOpen(true)}><Plus className="mr-2 h-4 w-4" />Ajouter un bien</Button>}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher par adresse, référence, ville..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statut} onValueChange={setStatut}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous statuts</SelectItem>
            <SelectItem value="vacant">Vacant</SelectItem>
            <SelectItem value="loue">Loué</SelectItem>
            <SelectItem value="en_travaux">En travaux</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categorie} onValueChange={setCategorie}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Catégorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Toutes catégories</SelectItem>
            <SelectItem value="Appartement">Appartement</SelectItem>
            <SelectItem value="Maison">Maison</SelectItem>
            <SelectItem value="Bureau">Bureau</SelectItem>
            <SelectItem value="Local">Local</SelectItem>
            <SelectItem value="Parking">Parking</SelectItem>
            <SelectItem value="Terrain">Terrain</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-1 rounded-lg border border-border p-1">
          <button onClick={() => setView('grid')} className={cn('rounded-md p-1.5', view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button onClick={() => setView('list')} className={cn('rounded-md p-1.5', view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Active filters */}
      {(statut !== 'tous' || categorie !== 'tous' || search) && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
              Recherche: {search}
              <button onClick={() => setSearch('')} className="ml-1 text-muted-foreground hover:text-foreground">×</button>
            </span>
          )}
          {statut !== 'tous' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
              Statut: {statut}
              <button onClick={() => setStatut('tous')} className="ml-1 text-muted-foreground hover:text-foreground">×</button>
            </span>
          )}
          {categorie !== 'tous' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
              Catégorie: {categorie}
              <button onClick={() => setCategorie('tous')} className="ml-1 text-muted-foreground hover:text-foreground">×</button>
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} type="card" className="h-64" />)}
        </div>
      ) : !biens?.length ? (
        <EmptyState
          icon={Building2}
          title="Aucun bien trouvé"
          description="Ajoutez votre premier bien immobilier pour commencer."
          actionLabel="Ajouter un bien"
          onAction={() => setModalOpen(true)}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {biens.map((bien, idx) => (
            <div key={bien.id} className="group overflow-hidden rounded-xl bg-card shadow-sm transition-shadow hover:shadow-md">
              {/* Photo */}
              <div className={cn('relative h-40 bg-gradient-to-br overflow-hidden', gradients[idx % gradients.length])}>
                <div className="absolute inset-0 flex items-center justify-center">
                  {bien.main_photo ? (
                    <img src={bien.main_photo} alt={bien.name || bien.nom} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-12 w-12 text-card/40" />
                  )}
                </div>
                <div className="absolute right-3 top-3">
                  <StatusBadge status={(bien.status || bien.statut || "VACANT")} />
                </div>
              </div>
              {/* Body */}
              <div className="p-4">
                <p className="text-xs text-muted-foreground">{bien.reference}</p>
                <p className="mt-1 font-semibold text-foreground">{(bien.address || bien.adresse)}</p>
                <p className="text-sm text-muted-foreground">{(bien.city || bien.ville || "")}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" />{(bien.surface_area || bien.surface || 0)} m²</span>
                  <span className="flex items-center gap-1"><DoorOpen className="h-3 w-3" />{(bien.rooms_count || bien.nombre_pieces || 0)} pièces</span>
                  <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{(bien.category_name || bien.category || bien.categorie || "N/A")}</span>
                </div>
                <p className="mt-3 text-lg font-bold text-secondary">{formatFCFA((Number(bien.base_rent_hc || bien.loyer_hc || 0)))}<span className="text-xs font-normal text-muted-foreground"> / mois</span></p>
                {(Number(bien.base_charges || bien.charges || 0)) > 0 && <p className="text-xs text-muted-foreground">+ {formatFCFA((Number(bien.base_charges || bien.charges || 0)))} de charges</p>}
              </div>
              {/* Footer */}
              <div className="border-t border-border px-4 py-3">
                {bien.locataire_actuel && (
                  <p className="mb-2 text-xs text-muted-foreground">Locataire: <span className="font-medium text-foreground">{bien.locataire_actuel}</span></p>
                )}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to={`/biens/${bien.id}`}><Eye className="mr-1 h-3 w-3" />Voir</Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setEditBien(bien.id); setModalOpen(true); }}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm"><MoreVertical className="h-3 w-3" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(bien.id)}>Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="overflow-hidden rounded-xl bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-3 text-left font-medium text-muted-foreground">Référence</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Adresse</th>
                <th className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Catégorie</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Loyer HC</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Statut</th>
                <th className="p-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Locataire</th>
                <th className="p-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {biens.map((bien, idx) => (
                <tr key={bien.id} className={cn('border-b border-border hover:bg-muted/30 transition-colors', idx % 2 === 0 ? '' : 'bg-muted/10')}>
                  <td className="p-3 font-medium">{bien.reference}</td>
                  <td className="p-3">
                    <p>{(bien.address || bien.adresse)}</p>
                    <p className="text-xs text-muted-foreground">{(bien.city || bien.ville || "")}</p>
                  </td>
                  <td className="p-3 hidden md:table-cell">{(bien.category_name || bien.category || bien.categorie || "N/A")}</td>
                  <td className="p-3 font-semibold text-secondary">{formatFCFA((Number(bien.base_rent_hc || bien.loyer_hc || 0)))}</td>
                  <td className="p-3"><StatusBadge status={(bien.status || bien.statut || "VACANT")} /></td>
                  <td className="p-3 hidden lg:table-cell">{bien.locataire_actuel || '—'}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild><Link to={`/biens/${bien.id}`}><Eye className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setEditBien(bien.id); setModalOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BienFormModal open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) setEditBien(null); }} bienId={editBien} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Supprimer ce bien" description="Cette action est irréversible. Voulez-vous vraiment supprimer ce bien ?" confirmLabel="Supprimer" onConfirm={handleDelete} destructive />
    </div>
  );
}
