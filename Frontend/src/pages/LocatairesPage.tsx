import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Eye, 
  Pencil, 
  MoreVertical, 
  Users, 
  Phone, 
  Mail, 
  Trash2, 
  MapPin, 
  Briefcase,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Locataires</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
            {locataires?.length || 0} Dossiers enregistrés
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="rounded-2xl shadow-lg shadow-primary/20 font-black h-12 px-6">
          <Plus className="mr-2 h-5 w-5" /> Ajouter un locataire
        </Button>
      </div>

      <div className="relative max-w-md px-2">
        <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input 
          placeholder="Rechercher par nom, email..." 
          className="h-14 pl-14 pr-6 rounded-[1.5rem] border-none bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-medium" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 px-2">
          {Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} type="card" />)}
        </div>
      ) : !locataires?.length ? (
        <EmptyState icon={Users} title="Aucun locataire" description="Votre base de données est vide." actionLabel="Ajouter un locataire" onAction={() => setModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 px-2">
          {locataires.map(loc => (
            <Card key={loc.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-900 shadow-xl shadow-slate-200 text-xl font-black text-white transform group-hover:rotate-6 transition-transform duration-500">
                            {(loc.first_name || loc.prenom)?.[0] || ''}{(loc.last_name || loc.nom)?.[0] || ''}
                        </div>
                        {(loc.is_active ?? loc.actif) && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-4 border-white" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-slate-900">
                          {(loc.first_name || loc.prenom)} {(loc.last_name || loc.nom)}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 italic">
                          <Briefcase className="h-3 w-3" /> {loc.profession || 'Sans profession'}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-xl h-10 w-10 p-0 text-slate-400 hover:text-slate-900">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl p-2 border-none shadow-2xl">
                        <DropdownMenuItem onClick={() => { setEditId(loc.id); setModalOpen(true); }} className="rounded-xl font-bold py-2.5">
                          <Pencil className="mr-2 h-4 w-4" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive rounded-xl font-bold py-2.5" onClick={() => setDeleteId(loc.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 transition-colors group-hover:bg-primary/5">
                      <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-bold text-slate-600 truncate">{loc.email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 transition-colors group-hover:bg-primary/5">
                      <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-bold text-slate-600">{(loc.phone || loc.telephone)}</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100/50">
                  <Badge className={cn(
                    'rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest border-none',
                    (loc.is_active ?? loc.actif) ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 text-slate-500'
                  )}>
                    {(loc.is_active ?? loc.actif) ? 'DOSSIER ACTIF' : 'INACTIF'}
                  </Badge>
                  
                  <Link 
                    to={`/locataires/${loc.id}`} 
                    className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-widest group/link"
                  >
                    Profil <ChevronRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <LocataireFormModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditId(null); }} locataire={locataires?.find(l => l.id === editId)} />
      <ConfirmDialog 
        open={!!deleteId} 
        onOpenChange={() => setDeleteId(null)} 
        title="Supprimer ce locataire" 
        description="Attention ! Cette action est définitive et supprimera tout l'historique associé." 
        confirmLabel="Confirmer la suppression" 
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => { toast({ title: 'Locataire supprimé' }); setDeleteId(null); } }); }} 
        destructive 
      />
    </div>
  );
}
