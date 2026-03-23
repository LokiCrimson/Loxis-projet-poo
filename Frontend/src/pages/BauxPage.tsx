import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Eye, 
  FileText, 
  XCircle, 
  UserCheck, 
  UserMinus, 
  Calendar, 
  Home, 
  User, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useBaux, useResilierBail, useToggleSuiviBail } from '@/hooks/use-baux';
import { formatFCFA, formatDate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';
import { BailFormModal } from '@/components/BailFormModal';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
  const toggleSuiviMut = useToggleSuiviBail();

  const getRetardBadge = (retard: any) => {
    if (!retard || retard.niveau === 0) return null;
    return (
      <Badge variant="destructive" className="ml-2 bg-red-500 text-white border-none font-bold animate-pulse px-3 rounded-full">
        {retard.jours}j retard
      </Badge>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Gestion des Baux</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
            {baux?.length || 0} CONTRATS EN COURS
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="rounded-2xl shadow-lg shadow-primary/20 font-black h-12 px-6">
          <Plus className="mr-2 h-5 w-5" /> Nouveau bail
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-2">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Référence, locataire, bien..." 
            className="h-14 pl-14 pr-6 rounded-[1.5rem] border-none bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-medium" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <Select value={statut} onValueChange={setStatut}>
          <SelectTrigger className="w-52 h-14 rounded-[1.5rem] border-none bg-white shadow-sm font-bold px-6">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
            <SelectItem value="tous" className="rounded-xl font-bold py-3 px-4">Tous les statuts</SelectItem>
            <SelectItem value="actif" className="rounded-xl font-bold py-3 px-4">Actifs</SelectItem>
            <SelectItem value="termine" className="rounded-xl font-bold py-3 px-4">Terminés</SelectItem>
            <SelectItem value="resilie" className="rounded-xl font-bold py-3 px-4">Résiliés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="px-2 space-y-4">
          <LoadingSkeleton type="table" lines={8} />
        </div>
      ) : !baux?.length ? (
        <EmptyState icon={FileText} title="Aucun bail trouvé" description="Ajustez vos filtres ou créez un nouveau contrat." actionLabel="Nouveau bail" onAction={() => setModalOpen(true)} />
      ) : (
        <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white mx-2">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-6 text-left text-[11px] font-black underline decoration-primary/30 decoration-2 underline-offset-8 text-slate-400 uppercase tracking-[0.2em]">Référence & Bien</th>
                    <th className="px-6 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hidden md:table-cell">Locataire</th>
                    <th className="px-6 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hidden lg:table-cell">Période</th>
                    <th className="px-6 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Loyer</th>
                    <th className="px-6 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                    <th className="px-8 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {baux.map((bail) => (
                    <tr key={bail.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-slate-900 group-hover:text-primary transition-colors">#{bail.reference}</span>
                            {bail.is_followed && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Home className="h-3 w-3 text-slate-400" />
                            <span className="text-xs font-bold text-slate-500 truncate max-w-[180px]">{bail.bien_reference}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 hidden md:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-slate-200">
                            {bail.locataire_nom?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">{bail.locataire_nom}</span>
                            {getRetardBadge(bail.retard_info)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-slate-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">ÉCHÉANCE</span>
                            <span className="text-xs font-bold text-slate-900">{formatDate(bail.date_fin)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-base font-black text-slate-900">{formatFCFA(bail.loyer_actuel)}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">mensuel</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <StatusBadge status={bail.statut} className="font-black text-[10px] tracking-widest" />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild className="rounded-xl h-10 w-10 p-0 hover:bg-white hover:shadow-md transition-all">
                            <Link to={`/baux/${bail.id}`}><Eye className="h-5 w-5 text-slate-400" /></Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleSuiviMut.mutate(bail.id)}
                            className={cn("rounded-xl h-10 w-10 p-0 hover:bg-white hover:shadow-md transition-all", bail.is_followed ? "text-primary" : "text-slate-400")}
                          >
                            {bail.is_followed ? <UserMinus className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                          </Button>
                          {bail.statut === 'actif' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-slate-300 hover:text-destructive rounded-xl h-10 w-10 p-0 hover:bg-white hover:shadow-md transition-all" 
                              onClick={() => setResilierBailId(bail.id)}
                            >
                              <XCircle className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <BailFormModal open={modalOpen} onOpenChange={setModalOpen} />
      <ConfirmDialog
        open={!!resilierBailId}
        onOpenChange={() => setResilierBailId(null)}
        title="Résilier ce bail"
        description="Cette action marquera le bail comme résilié. Assurez-vous d'avoir effectué l'état des lieux de sortie."
        confirmLabel="Confirmer la résiliation"
        onConfirm={() => {
          if (resilierBailId) {
            resilierMut.mutate(resilierBailId, {
              onSuccess: () => {
                toast({ title: 'Bail résilié avec succès' });
                setResilierBailId(null);
              }
            });
          }
        }}
        destructive
      />
    </div>
  );
}
  );
}
