import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useBaux, useResilierBail, useToggleSuiviBail } from "@/hooks/use-baux";
import { formatFCFA, formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { BailFormModal } from "@/components/BailFormModal";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ViewToggle } from "@/components/ViewToggle";

export default function BauxPage() {
  const { t } = useTranslation();
  const [view, setView] = useState<"grid" | "list">(() => {
    return (localStorage.getItem("baux_view") as "grid" | "list") || "list";
  });
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("tous");
  const [modalOpen, setModalOpen] = useState(false);
  const [resilierBailId, setResilierBailId] = useState<number | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (location.state?.prefill) {
      setModalOpen(true);
    }
  }, [location.state]);

  const handleViewChange = (newView: "grid" | "list") => {
    setView(newView);
    localStorage.setItem("baux_view", newView);
  };

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (statut !== "tous") params.statut = statut;

  const { data: baux, isLoading } = useBaux(params);
  const resilierMut = useResilierBail();
  const toggleSuiviMut = useToggleSuiviBail();

  const filteredBaux = (baux || []).filter(b => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      b.reference?.toLowerCase().includes(searchLower) ||
      b.locataire_nom?.toLowerCase().includes(searchLower) ||
      b.bien_reference?.toLowerCase().includes(searchLower);
    
    return matchesSearch;
  });

  const getRetardBadge = (retard: any) => {
    if (!retard || retard.niveau === 0) return null;
    return (
      <Badge variant="destructive" className="ml-2 bg-red-500 text-white border-none font-bold animate-pulse px-3 rounded-full">
        {t("days_overdue", { count: retard.jours })}
      </Badge>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t("lease_mgmt")}</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
            {t("active_contracts", { count: baux?.length || 0 })}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="rounded-2xl shadow-lg shadow-primary/20 font-black h-12 px-6">
          <Plus className="mr-2 h-5 w-5" /> {t("Nouveau Bail")}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder={t("Rechercher un bail...")} 
              className="h-14 pl-14 pr-6 rounded-[1.5rem] border-none bg-white dark:bg-slate-900 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-medium text-slate-900 dark:text-white" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <Select value={statut} onValueChange={setStatut}>
            <SelectTrigger className="w-52 h-14 rounded-[1.5rem] border-none bg-white dark:bg-slate-900 shadow-sm font-bold px-6 text-slate-900 dark:text-white">
              <SelectValue placeholder={t("status_all")} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white dark:bg-slate-900">
              <SelectItem value="tous" className="rounded-xl font-bold py-3 px-4 text-slate-900 dark:text-white">{t("status_all")}</SelectItem>
              <SelectItem value="actif" className="rounded-xl font-bold py-3 px-4 text-slate-900 dark:text-white">{t("status_active")}</SelectItem>
              <SelectItem value="termine" className="rounded-xl font-bold py-3 px-4 text-slate-900 dark:text-white">{t("status_finished")}</SelectItem>
              <SelectItem value="resilie" className="rounded-xl font-bold py-3 px-4 text-slate-900 dark:text-white">{t("status_cancelled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ViewToggle view={view} onViewChange={handleViewChange} />
      </div>

      {isLoading ? (
        <div className={cn(
          "px-2 gap-6",
          view === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "space-y-4"
        )}>
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} type={view === "grid" ? "card" : "table"} />
          ))}
        </div>
      ) : !filteredBaux?.length ? (
        <EmptyState icon={FileText} title="Aucun bail trouvé" description="Ajustez vos filtres ou créez un nouveau contrat." actionLabel="Nouveau bail" onAction={() => setModalOpen(true)} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 px-2">
          {filteredBaux.map(bail => (
            <Card key={bail.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 items-center justify-center rounded-[1.5rem] bg-indigo-600 shadow-xl shadow-indigo-100 dark:shadow-none flex text-white">
                        <FileText className="h-8 w-8 text-white/90" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                          #{bail.reference}
                          {bail.is_followed && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 italic">
                          <Home className="h-3 w-3" /> {bail.bien_reference}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("tenant")}</p>
                      <p className="text-sm font-bold truncate">{bail.locataire_nom}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("rent")}</p>
                      <p className="text-sm font-black text-primary">{formatFCFA(bail.loyer_base)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors">
                      {formatDate(bail.date_debut)} à {bail.date_fin ? formatDate(bail.date_fin) : t("perpetual")}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between border-t border-slate-100/50 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      "rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest border-none",
                      bail.statut === "actif" ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      <StatusBadge status={bail.statut} />
                    </Badge>
                  </div>
                  <Link 
                    to={`/baux/${bail.id}`} 
                    className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest group/link"
                  >
                    Détails <ChevronRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 mx-2">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-6 text-left text-[11px] font-black underline decoration-primary/30 decoration-2 underline-offset-8 text-slate-400 uppercase tracking-[0.2em]">Référence & Bien</th>
                    <th className="px-6 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hidden md:table-cell">Locataire</th>
                    <th className="px-6 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hidden lg:table-cell">Période</th>
                    <th className="px-6 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Loyer</th>
                    <th className="px-6 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                    <th className="px-8 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {filteredBaux.map((bail) => (
                    <tr key={bail.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">#{bail.reference}</span>
                            {bail.is_followed && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                            <Home className="h-3 w-3" />
                            <span className="text-xs font-bold truncate max-w-[180px]">{bail.bien_reference}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 hidden md:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-900/10 dark:bg-indigo-500/20 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-indigo-400 ring-2 ring-white/10">
                            {(bail.locataire_nom || "L").split(" ").map((n: any) => n[0]).join("").toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{bail.locataire_nom}</span>
                            {getRetardBadge(bail.retard_info)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(bail.date_debut)}</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-300">{bail.date_fin ? formatDate(bail.date_fin) : "Indéfini"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-base font-black text-slate-900 dark:text-white">{formatFCFA(bail.loyer_actuel)}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Mensuel</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <Badge className={cn(
                          "rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest border-none",
                          bail.statut === "actif" ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                          <StatusBadge status={bail.statut} />
                        </Badge>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                            <Link to={`/baux/${bail.id}`}>
                              <Eye className="h-5 w-5" />
                            </Link>
                          </Button>
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

      {/* Modale de création */}
      <BailFormModal 
        open={modalOpen} 
        onOpenChange={setModalOpen}
        initialData={location.state?.prefill}
      />

      {/* Dialogue de résiliation */}
      <ConfirmDialog
        open={!!resilierBailId}
        onOpenChange={() => setResilierBailId(null)}
        title="Résilier le bail"
        description="Êtes-vous sûr de vouloir résilier ce bail ? Cette action est irréversible."
        onConfirm={() => {
          if (resilierBailId) {
            resilierMut.mutate(resilierBailId, {
              onSuccess: () => {
                toast({ title: "Bail résilié", description: "Le contrat a été marqué comme résilié." });
                setResilierBailId(null);
              }
            });
          }
        }}
        confirmText="Résilier"
        variant="destructive"
      />
    </div>
  );
}
