import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, MoreVertical, Users, Phone, Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/PageHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useLocataires, useDeleteLocataire } from '@/hooks/use-locataires';
import { useToast } from '@/hooks/use-toast';
import { LocataireFormModal } from '@/components/LocataireFormModal';
import { cn } from '@/lib/utils';

export default function LocatairesPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { toast } = useToast();

  const params: Record<string, string> = {};
  if (search) params.search = search;

  const { data: locataires, isLoading } = useLocataires(params);
  const deleteMutation = useDeleteLocataire();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locataires"
        subtitle={locataires ? `${locataires.length} locataires` : undefined}
        action={<Button onClick={() => setModalOpen(true)}><Plus className="mr-2 h-4 w-4" />Ajouter un locataire</Button>}
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher un locataire..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} type="card" />)}
        </div>
      ) : !locataires?.length ? (
        <EmptyState icon={Users} title="Aucun locataire" description="Ajoutez votre premier locataire." actionLabel="Ajouter un locataire" onAction={() => setModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {locataires.map(loc => (
            <div key={loc.id} className="rounded-xl bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/10 text-sm font-bold text-secondary">
                    {loc.prenom[0]}{loc.nom[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{loc.prenom} {loc.nom}</p>
                    <p className="text-xs text-muted-foreground">{loc.profession}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditId(loc.id); setModalOpen(true); }}><Pencil className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(loc.id)}><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{loc.email}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{loc.telephone}</div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', loc.actif ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
                  {loc.actif ? 'Actif' : 'Inactif'}
                </span>
                {loc.garant && <span className="text-xs text-muted-foreground">Garant: {loc.garant.prenom} {loc.garant.nom}</span>}
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to={`/locataires/${loc.id}`}><Eye className="mr-2 h-3 w-3" />Voir le profil</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LocataireFormModal open={modalOpen} onOpenChange={(o) => { setModalOpen(o); if (!o) setEditId(null); }} locataireId={editId} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Supprimer ce locataire" description="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => { toast({ title: 'Locataire supprimé' }); setDeleteId(null); } }); }} destructive />
    </div>
  );
}
