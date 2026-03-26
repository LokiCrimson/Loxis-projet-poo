import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Users, 
  Mail, 
  Phone, 
  Briefcase,
  ChevronRight,
  MoreVertical,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useLocataires, useDeleteLocataire } from '@/hooks/use-locataires';
import { LocataireFormModal } from '@/components/LocataireFormModal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ViewToggle } from '@/components/ViewToggle';

export default function LocatairesPage() {
  const { t } = useTranslation();
  const [view, setView] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('locataires_view') as 'grid' | 'list') || 'list';
  });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleViewChange = (newView: 'grid' | 'list') => {
    setView(newView);
    localStorage.setItem('locataires_view', newView);
  };

  const { data: locataires, isLoading } = useLocataires();
  const deleteMut = useDeleteLocataire();

  const filteredLocataires = (locataires || []).filter(loc => {
    const searchLower = search.toLowerCase();
    const fullName = `${loc.first_name || loc.prenom} ${loc.last_name || loc.nom}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      loc.email?.toLowerCase().includes(searchLower) ||
      (loc.phone || loc.telephone)?.includes(searchLower)
    );
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('tenants_title')}</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
            {t('active_tenants_count', { count: locataires?.length || 0 })}
          </p>
        </div>
        <Button onClick={() => { setEditId(null); setModalOpen(true); }} className="rounded-2xl shadow-lg shadow-primary/20 font-black h-12 px-6">
          <Plus className="mr-2 h-5 w-5" /> {t('add_tenant')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="relative flex-1 min-w-[300px] max-w-md">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder={t('search_placeholder')} 
            className="h-14 pl-14 pr-6 rounded-[1.5rem] border-none bg-white dark:bg-slate-900 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-medium text-slate-900 dark:text-white" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <ViewToggle view={view} onViewChange={handleViewChange} />
      </div>

      {isLoading ? (
        <div className={cn(
          "px-2 gap-6",
          view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "space-y-4"
        )}>
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} type={view === 'grid' ? "card" : "table"} />
          ))}
        </div>
      ) : !filteredLocataires?.length ? (
        <EmptyState 
          icon={Users} 
          title={t('no_tenants_found')} 
          description={t('adjust_filters')} 
          actionLabel={t('add_tenant')} 
          onAction={() => { setEditId(null); setModalOpen(true); }} 
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 px-2">
          {filteredLocataires.map(loc => (
            <Card key={loc.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-900 shadow-xl shadow-slate-200 text-xl font-black text-white transform group-hover:rotate-6 transition-transform duration-500">
                            {(loc.first_name || loc.prenom)?.[0] || ''}{(loc.last_name || loc.nom)?.[0] || ''}
                        </div>
                        {(loc.is_active ?? loc.actif) && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                          {(loc.first_name || loc.prenom)} {(loc.last_name || loc.nom)}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 italic">
                          <Briefcase className="h-3 w-3" /> {loc.profession || t('no_profession')}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-xl h-10 w-10 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl p-2 border-none shadow-2xl bg-white dark:bg-slate-900">
                        <DropdownMenuItem onClick={() => { setEditId(loc.id); setModalOpen(true); }} className="rounded-xl font-bold py-2.5 text-slate-900 dark:text-white">
                          <Pencil className="mr-2 h-4 w-4" /> {t('modify')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive rounded-xl font-bold py-2.5" onClick={() => setDeleteId(loc.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 transition-colors group-hover:bg-primary/5">
                      <div className="h-8 w-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate">{loc.email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 transition-colors group-hover:bg-primary/5">
                      <div className="h-8 w-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{(loc.phone || loc.telephone)}</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between border-t border-slate-100/50 dark:border-slate-800">
                  <Badge className={cn(
                    'rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest border-none',
                    (loc.is_active ?? loc.actif) ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  )}>
                    {(loc.is_active ?? loc.actif) ? t('active_record') : t('inactive')}
                  </Badge>
                  
                  <Link 
                    to={`/locataires/${loc.id}`} 
                    className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest group/link"
                  >
                    {t('profile_link')} <ChevronRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="px-2">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <TableHead className="px-8 py-6 text-left text-[11px] font-black underline decoration-primary/30 decoration-2 underline-offset-8 text-slate-400 uppercase tracking-[0.2em]">{t('tenant')}</TableHead>
                    <TableHead className="px-6 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('email')}</TableHead>
                    <TableHead className="px-6 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('phone')}</TableHead>
                    <TableHead className="px-6 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('status_label')}</TableHead>
                    <TableHead className="px-8 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('actions_label')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {filteredLocataires.map((loc) => (
                    <TableRow key={loc.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all duration-300">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-slate-200 dark:shadow-none">
                            {(loc.first_name || loc.prenom)?.[0] || ''}{(loc.last_name || loc.nom)?.[0] || ''}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                              {(loc.first_name || loc.prenom)} {(loc.last_name || loc.nom)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{loc.profession}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-sm font-bold text-slate-600 dark:text-slate-400">{loc.email}</TableCell>
                      <TableCell className="px-6 py-6 text-sm font-bold text-slate-600 dark:text-slate-400">{(loc.phone || loc.telephone)}</TableCell>
                      <TableCell className="px-6 py-6">
                        <Badge className={cn(
                          'rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest border-none',
                          (loc.is_active ?? loc.actif) ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        )}>
                          {(loc.is_active ?? loc.actif) ? t('active_record') : t('inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-400 dark:text-slate-500 transition-all">
                            <Link to={`/locataires/${loc.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-10 w-10 p-0 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-400 dark:text-slate-500 transition-all"
                            onClick={() => { setEditId(loc.id); setModalOpen(true); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-10 w-10 p-0 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 text-slate-400 dark:text-slate-500 transition-all"
                            onClick={() => setDeleteId(loc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      <LocataireFormModal 
        isOpen={modalOpen} 
        onClose={() => { setModalOpen(false); setEditId(null); }} 
        locataire={locataires?.find(l => l.id === editId)} 
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title={t('delete_tenant_confirm')}
        description={t('delete_tenant_warning')}
        confirmLabel={t('delete')}
        onConfirm={() => {
          if (deleteId) {
            deleteMut.mutate(deleteId, {
              onSuccess: () => {
                toast({ title: t('tenant_deleted_success') });
                setDeleteId(null);
              }
            });
          }
        }}
        variant="destructive"
      />
    </div>
  );
}
