import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Eye, 
  Pencil, 
  MoreVertical, 
  MapPin, 
  Maximize2, 
  DoorOpen, 
  Building2,
  Trash2,
  Filter,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useBiens, useDeleteBien, useCategories } from '@/hooks/use-biens';
import { formatFCFA } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BienFormModal } from '@/components/BienFormModal';
import { useToast } from '@/hooks/use-toast';

export default function BiensPage() {
  const { t } = useTranslation();
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
  const { data: categoriesReal } = useCategories();
  const deleteMutation = useDeleteBien();

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => {
          toast({ title: t('property_deleted'), description: t('property_deleted_desc') });
          setDeleteId(null);
        },
      });
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('real_estate_portfolio')}</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
            {t('units_listed', { count: biens?.length || 0 })}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="rounded-2xl shadow-lg shadow-primary/20 font-black h-12 px-6">
          <Plus className="mr-2 h-5 w-5" /> {t('add_property')}
        </Button>
      </div>

      {/* Filters & Actions Bar */}
      <div className="flex flex-wrap items-center gap-4 px-2">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder={t('search_property_placeholder')} 
            className="h-14 pl-14 pr-6 rounded-[1.5rem] border-none bg-white dark:bg-slate-900 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-medium" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={statut} onValueChange={setStatut}>
            <SelectTrigger className="w-44 h-14 rounded-[1.5rem] border-none bg-white dark:bg-slate-900 shadow-sm font-bold px-6">
              <SelectValue placeholder={t('status_label')} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
              <SelectItem value="tous" className="rounded-xl font-bold py-3 px-4">{t('all_statuses')}</SelectItem>
              <SelectItem value="vacant" className="rounded-xl font-bold py-3 px-4 text-emerald-600">{t('vacant')}</SelectItem>
              <SelectItem value="loue" className="rounded-xl font-bold py-3 px-4 text-blue-600">{t('rented')}</SelectItem>
              <SelectItem value="en_travaux" className="rounded-xl font-bold py-3 px-4 text-amber-600">{t('under_maintenance')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categorie} onValueChange={setCategorie}>
            <SelectTrigger className="w-48 h-14 rounded-[1.5rem] border-none bg-white dark:bg-slate-900 shadow-sm font-bold px-6 text-slate-900 dark:text-white">
              <SelectValue placeholder={t('category_label')} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
              <SelectItem value="tous" className="rounded-xl font-bold py-3 px-4">{t('all_categories')}</SelectItem>
              {categoriesReal?.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.name} className="rounded-xl font-bold py-3 px-4">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 rounded-[1.5rem] bg-white dark:bg-slate-900 p-1 shadow-sm h-14">
            <button 
              onClick={() => setView('grid')} 
              className={cn('rounded-[1.2rem] p-3 transition-all', view === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600')}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setView('list')} 
              className={cn('rounded-[1.2rem] p-3 transition-all', view === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600')}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 px-2">
          {Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} type="card" />)}
        </div>
      ) : !biens?.length ? (
        <EmptyState
          icon={Building2}
          title={t('no_property_found')}
          description={t('portfolio_empty_desc')}
          actionLabel={t('add_property')}
          onAction={() => setModalOpen(true)}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 px-2">
          {biens.map((bien) => (
            <Card key={bien.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 flex flex-col h-full">
              <CardContent className="p-0 flex flex-col h-full">
                {/* Image / Thumbnail Section */}
                <div className="relative h-56 overflow-hidden">
                  {bien.main_photo ? (
                    <img src={bien.main_photo} alt={bien.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-slate-300 dark:text-slate-700" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className={cn(
                      "rounded-full px-4 py-1.5 font-bold border-none shadow-lg text-xs uppercase tracking-widest",
                      (bien.statut || bien.status || '').toLowerCase() === 'vacant' ? "bg-emerald-500 text-white" : 
                      (bien.statut || bien.status || '').toLowerCase() === 'loue' ? "bg-blue-500 text-white" : "bg-amber-500 text-white"
                    )}>
                      {t((bien.statut || bien.status || 'vacant').toLowerCase()).toUpperCase()}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-10 w-10 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border-none hover:bg-white transition-all transform hover:scale-105">
                          <MoreVertical className="h-5 w-5 text-slate-900" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-2xl border-none shadow-2xl p-2 bg-white/95 backdrop-blur-md">
                        <DropdownMenuItem asChild className="rounded-xl font-bold py-3 px-4 focus:bg-slate-100 dark:focus:bg-slate-800">
                          <Link to={`/biens/${bien.id}`} className="flex items-center">
                            <Eye className="mr-3 h-4 w-4" /> {t('details')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditBien(bien.id)} className="rounded-xl font-bold py-3 px-4 focus:bg-slate-100 dark:focus:bg-slate-800">
                          <Pencil className="mr-3 h-4 w-4" /> {t('modify')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteId(bien.id)} className="rounded-xl font-bold py-3 px-4 text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20">
                          <Trash2 className="mr-3 h-4 w-4" /> {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-7 flex flex-col flex-grow">
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white line-clamp-1 mb-1">
                      {bien.nom || bien.name}
                    </h3>
                    <div className="flex items-center text-slate-400 font-bold text-xs uppercase tracking-tighter italic">
                      <MapPin className="h-3.5 w-3.5 mr-1" /> {bien.city || 'Ville inconnue'}, {bien.address}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center text-center">
                      <Maximize2 className="h-5 w-5 text-indigo-500 mb-2" />
                      <span className="text-sm font-black text-slate-900 dark:text-white">{bien.surface} m²</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('surface')}</span>
                    </div>
                    <div className="p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center text-center">
                      <DoorOpen className="h-5 w-5 text-emerald-500 mb-2" />
                      <span className="text-sm font-black text-slate-900 dark:text-white">{bien.rooms || bien.nombre_pieces || 0} p</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('rooms')}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{t('monthly_rent')}</span>
                      <span className="text-2xl font-black text-emerald-600">{formatFCFA(bien.loyer_base || bien.base_rent)}</span>
                    </div>
                    <Button asChild size="icon" className="h-12 w-12 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">
                      <Link to={`/biens/${bien.id}`}>
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="px-2 space-y-4">
          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t('property_and_address')}</th>
                      <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t('type')}</th>
                      <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t('surface')}</th>
                      <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t('status_label')}</th>
                      <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">{t('base_rent')}</th>
                      <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">{t('action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {biens.map((bien) => (
                      <tr key={bien.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-lg">
                              <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="font-black text-slate-900 dark:text-white">{bien.nom || bien.name}</div>
                              <div className="text-xs font-bold text-slate-400 flex items-center mt-0.5">
                                <MapPin className="h-3 w-3 mr-1" /> {bien.address}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                           <Badge variant="outline" className="rounded-xl border-slate-200 dark:border-slate-700 font-bold px-3 py-1 text-slate-600 dark:text-slate-300">
                            {t((bien.categorie || 'Property').toLowerCase())}
                           </Badge>
                        </td>
                        <td className="p-6 font-bold text-slate-600 dark:text-slate-400">{bien.surface} m²</td>
                        <td className="p-6">
                          <Badge className={cn(
                            "rounded-full px-4 py-1.5 font-bold border-none text-[10px]",
                            (bien.statut || bien.status || '').toLowerCase() === 'vacant' ? "bg-emerald-100 text-emerald-600" : 
                            (bien.statut || bien.status || '').toLowerCase() === 'loue' ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                          )}>
                            {t((bien.statut || bien.status || 'vacant').toLowerCase()).toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-6 text-right font-black text-slate-900 dark:text-white">
                          {formatFCFA(bien.loyer_base || bien.base_rent)}
                        </td>
                        <td className="p-6 text-center">
                          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Link to={`/biens/${bien.id}`}><ChevronRight className="h-5 w-5" /></Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modals & Dialogs */}
      {modalOpen && <BienFormModal open={modalOpen} onOpenChange={setModalOpen} />}
      {editBien && <BienFormModal open={!!editBien} onOpenChange={() => setEditBien(null)} bienId={editBien} />}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('confirm_delete_property')}
        description={t('this_action_irreversible')}
        destructive
      />
    </div>
  );
}
