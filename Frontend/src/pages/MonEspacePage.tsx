import { Building2, Download, CreditCard, FileText, Calendar, MapPin, Wallet, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { formatFCFA, formatDate } from '@/lib/format';
import { useBaux } from '@/hooks/use-baux';
import { usePaiements } from '@/hooks/use-paiements';
import { useQuittances } from '@/hooks/use-quittances';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import { useState } from 'react';

export default function MonEspacePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState<number | null>(null);
  
  const { data: bauxData = [] } = useBaux({ locataire_id: user?.id?.toString() });
  const activeBail = bauxData.find((b: any) => b.statut === 'actif');

  const { data: paiementsData = [] } = usePaiements({ locataire_id: user?.id?.toString() });
  const { data: quittancesData = [] } = useQuittances({ locataire_id: user?.id?.toString() });

  const handleDownloadQuittance = async (q: any) => {
    try {
      setDownloading(q.id);
      const response = await api.get(`/finances/quittances/${q.id}/pdf/`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Quittance_${q.periode_mois}_${q.periode_annee}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Hero Header avec dégradé */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />
        
        <div className="container mx-auto max-w-6xl px-4 py-10 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Bienvenue, {user?.prenom || 'Locataire'} 👋
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl font-medium">
                Retrouvez ici l'ensemble de vos documents locatifs, l'historique de vos paiements et le détail de votre bail.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Colonne de GAUCHE: Mon Bail & Infos Clés */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Mon bail actif - Design moderne avec icônes */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Mon bail en cours
                </h2>
                {activeBail && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 font-bold px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" /> Contrat Actif
                  </Badge>
                )}
              </div>

              {activeBail ? (
                <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:shadow-2xl hover:shadow-slate-300/50 dark:hover:shadow-none border-t-4 border-t-primary">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-primary/5 to-transparent p-6 sm:p-8">
                      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" /> Adresse du bien
                          </label>
                          <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                            {activeBail.bien_adresse || 'Adresse non renseignée'}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1.5">
                            <Wallet className="h-3 w-3" /> Loyer mensuel HC
                          </label>
                          <p className="text-2xl font-black text-primary tracking-tight">
                            {formatFCFA(activeBail.loyer_hc || activeBail.loyer)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" /> Période du bail
                          </label>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Du {formatDate(activeBail.date_debut)} au {formatDate(activeBail.date_fin)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900/50 px-8 py-4 border-t flex flex-wrap gap-4 items-center justify-between">
                       <div className="flex gap-4">
                          <div className="text-xs font-semibold">
                            <span className="text-muted-foreground">Charges : </span>
                            <span className="text-slate-900 dark:text-white">{formatFCFA(activeBail.charges)}</span>
                          </div>
                          <div className="text-xs font-semibold">
                            <span className="text-muted-foreground">Dépôt : </span>
                            <span className="text-slate-900 dark:text-white">{formatFCFA(activeBail.depot_garantie)}</span>
                          </div>
                       </div>
                       <Link to="/mes-locations" className="text-xs font-bold text-primary flex items-center hover:underline group">
                         Voir tout le dossier <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
                       </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed border-2 bg-slate-50/50 transition-colors hover:bg-slate-100/50">
                  <CardContent className="p-12 text-center">
                    <div className="h-16 w-16 bg-slate-200/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-muted-foreground font-semibold">Aucun bail actif n'est enregistré sur votre compte.</p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Historique des paiements - Liste épurée */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-indigo-500" /> Historique des règlements
                </h2>
                <Link to="/mes-paiements" className="text-sm font-bold text-primary hover:underline">Voir l'historique complet</Link>
              </div>

              <div className="space-y-3">
                {paiementsData.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="group relative flex items-center justify-between bg-white dark:bg-slate-900/40 rounded-2xl border p-4 transition-all hover:shadow-lg hover:border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{p.mois || `${p.periode_mois}/${p.periode_annee}`}</p>
                        {p.date && <p className="text-[10px] font-bold uppercase text-slate-400">Réglé le {formatDate(p.date)}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black text-slate-900 dark:text-white">{formatFCFA(p.montant || p.montant_paye)}</span>
                      {p.statut === 'paye' || p.statut === 'PAID' ? (
                        <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      ) : (
                         <Badge variant="outline" className="h-8 px-3 rounded-lg font-bold">En attente</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {paiementsData.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground font-medium bg-slate-50 rounded-2xl border border-dashed">
                    Aucun paiement enregistré pour l'instant.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Colonne de DROITE: Quittances & Actions Rapides */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Mes Quittances - Design moderne "Document Card" */}
            <section className="sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Download className="h-5 w-5 text-amber-500" /> Mes quittances
                </h2>
              </div>
              
              <div className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-6">Documents disponibles</p>
                
                <div className="space-y-4">
                  {quittancesData.slice(0, 3).map((q: any) => (
                    <div key={q.id} className="flex flex-col gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm transition-all hover:bg-white/10">
                      <div className="flex justify-between items-start">
                        <div className="bg-amber-500/20 text-amber-400 p-2 rounded-lg">
                          <FileText className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="border-white/20 text-white/40 text-[10px] font-black uppercase tracking-tighter">PDF</Badge>
                      </div>
                      
                      <div>
                        <p className="text-white font-bold text-sm leading-tight">Quittance Loyer</p>
                        <p className="text-white/40 text-[11px] font-bold uppercase">{q.periode || `${q.periode_mois}/${q.periode_annee}`}</p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={downloading === q.id}
                        onClick={() => handleDownloadQuittance(q)}
                        className="w-full h-10 rounded-xl border-white/20 bg-transparent text-white hover:bg-white hover:text-slate-900 transition-all font-bold group"
                      >
                        {downloading === q.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                        )}
                        {downloading === q.id ? "Préparation..." : "Télécharger"}
                      </Button>
                    </div>
                  ))}
                  
                  {quittancesData.length === 0 && (
                    <div className="p-10 text-center space-y-3">
                       <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                          <Download className="h-6 w-6 text-white/20" />
                       </div>
                       <p className="text-white/40 text-sm font-medium italic">Aucune quittance générée pour le moment.</p>
                    </div>
                  )}
                </div>

                {quittancesData.length > 3 && (
                   <div className="mt-6 pt-6 border-t border-white/10 text-center">
                      <Link to="/mes-paiements" className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-widest">
                        Afficher tout le registre
                      </Link>
                   </div>
                )}
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}
