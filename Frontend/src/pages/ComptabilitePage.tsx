import { TrendingUp, TrendingDown, Download, Wallet, BarChart3, Building2, Calendar, FileText, ArrowUpRight, ArrowDownRight, ChevronRight, MapPin, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useComptaResume, useComptaMensuel, useComptaParBien } from '@/hooks/use-comptabilite';
import { formatFCFA } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ComptabilitePage() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const { data: resume, isLoading: rLoading } = useComptaResume(currentYear);
  const { data: mensuel, isLoading: mLoading } = useComptaMensuel(currentYear);
  const { data: parBien, isLoading: bLoading } = useComptaParBien(currentYear);
  const { toast } = useToast();

  const handleExportExcel = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/finances/export/?mode=compta&year=${currentYear}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Expert_Loxis_${currentYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "Succès", description: "Le rapport expert a été généré." });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de générer l'export Excel.", variant: "destructive" });
    }
  };

  const kpis = resume ? [
    { label: t('received_revenue'), value: formatFCFA(resume.total_revenus), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12%', trendUp: true },
    { label: t('expenses_fees'), value: formatFCFA(resume.total_depenses), icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50', trend: '-5%', trendUp: false },
    { label: t('net_profit'), value: formatFCFA(resume.benefice_net), icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: t('stable'), trendUp: true },
    { label: t('total_overdue'), value: formatFCFA(resume.total_impayes), icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50', trend: t('action_required_caps'), trendUp: false },
  ] : [];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('fin_analysis')}</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
            {t('fiscal_year', { year: new Date().getFullYear() })}
          </p>
        </div>
        <Button onClick={handleExportExcel} variant="outline" className="rounded-2xl border-none bg-white dark:bg-slate-900 shadow-sm hover:shadow-md font-black h-12 px-6 flex gap-2 text-slate-900 dark:text-white">
          <Download className="h-5 w-5 text-indigo-500" /> {t('export_report')}
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 px-2">
        {rLoading ? (
          Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} type="card" />)
        ) : kpis.map((kpi, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden group bg-white dark:bg-slate-900">
            <CardContent className="p-7">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3.5 rounded-2xl transition-transform group-hover:scale-110 duration-500", kpi.bg, kpi.color)}>
                  <kpi.icon className="h-6 w-6" />
                </div>
                <Badge variant="outline" className={cn(
                  "rounded-full px-3 py-1 font-bold border-none text-[10px] items-center gap-1",
                  kpi.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  {kpi.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {kpi.trend}
                </Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</h3>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-2">
        {/* Monthly Chart */}
        <Card className="xl:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-2 overflow-hidden">
          <CardHeader className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('monthly_cashflow')}</CardTitle>
                <CardDescription className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{t('rev_vs_overdue')}</CardDescription>
              </div>
              <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl">
                 <div className="flex items-center gap-1.5 px-3 py-1.5">
                    <div className="h-2 w-2 rounded-full bg-slate-900" />
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">{t('revenue')}</span>
                 </div>
                 <div className="flex items-center gap-1.5 px-3 py-1.5">
                    <div className="h-2 w-2 rounded-full bg-rose-500" />
                      <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">{t('expenses_fees')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">{t('unpaid')}</span>
                 </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {mLoading ? <div className="p-8"><LoadingSkeleton lines={8} /></div> : (
              <div className="h-[550px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mensuel} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="rgba(0,0,0,0.03)" />
                    <XAxis 
                      dataKey="mois" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                      tickFormatter={v => `${(v / 1000)}k`} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.01)' }}
                      contentStyle={{ 
                        borderRadius: '1.2rem', 
                        border: 'none', 
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                        padding: '15px',
                        background: 'white',
                        fontWeight: '900'
                      }}
                      itemStyle={{ padding: '2px 0' }}
                      labelStyle={{ marginBottom: '8px', color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      formatter={(value: number, name: string) => {
                        const colors: Record<string, string> = {
                          revenus: '#0f172a',
                          depenses: '#ef4444',
                          impayes: '#f59e0b'
                        };
                        const labels: Record<string, string> = {
                          revenus: 'REVENUS',
                          depenses: 'DÉPENSES',
                          impayes: 'IMPAYÉS'
                        };
                        return [
                          <span style={{ color: colors[name] || '#000' }}>{formatFCFA(value)}</span>,
                          <span style={{ color: colors[name] || '#000' }}>{labels[name] || name}</span>
                        ];
                      }}
                    />
                    <Bar dataKey="revenus" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={24} />
                    <Bar dataKey="depenses" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
                    <Bar dataKey="impayes" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performers / Quick Stats */}
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-2 overflow-hidden">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Par Performance</CardTitle>
            <CardDescription className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Rentabilité par unité</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            {bLoading ? <LoadingSkeleton type="table" lines={5} /> : Array.isArray(parBien) && parBien.slice(0, 5).map((b, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-[1rem] bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black shadow-sm group-hover:scale-110 transition-transform">
                    {String(b.bien_reference || "").slice(-2)}
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">{b.bien_reference}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center mt-0.5">
                      <MapPin className="h-2.5 w-2.5 mr-1" /> {(b.adresse || "").split(',')[0]}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-600">{formatFCFA(b.revenus)}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">LOYER PERÇU</div>
                </div>
              </div>
            ))}
            <Link to="/biens">
              <Button variant="ghost" className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs hover:bg-slate-100 dark:hover:bg-slate-800 gap-2">
                Voir tout le patrimoine <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <div className="px-2">
        <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 p-2">
          <CardHeader className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-left">Grand Livre des Recettes</CardTitle>
                <CardDescription className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1 text-left">Détail analytique par bien immobilier</CardDescription>
              </div>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 cursor-help hover:text-indigo-500 transition-colors shrink-0 ml-4">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] p-4 rounded-2xl bg-slate-900 text-white border-none shadow-2xl">
                    <p className="text-xs font-bold leading-relaxed">
                      <span className="text-indigo-400 block mb-1 uppercase tracking-widest text-[10px]">Taux d'Occupation :</span>
                      Mesure la proportion de temps où votre bien génère des revenus. Un taux de 100% signifie que le bien est actuellement sous bail actif. S'il est vacant, le taux tombe à 0% pour la période concernée.
                    </p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Unité & Emplacement</th>
                    <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Revenus Bruts</th>
                    <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Dépenses</th>
                    <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Impayés</th>
                    <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Bénéfice Net</th>
                    <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Taux d'Occupation</th>
                    <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parBien?.map((b) => (
                    <tr key={b.bien_reference} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-lg group-hover:rotate-3 transition-transform">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-black text-slate-900 dark:text-white">{b.bien_reference}</div>
                            <div className="text-xs font-bold text-slate-400 italic mt-0.5 truncate max-w-[200px]">{b.adresse}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-right font-black text-emerald-600">{formatFCFA(b.revenus)}</td>
                      <td className="p-6 text-right font-black text-rose-500">{formatFCFA(b.depenses)}</td>
                      <td className="p-6 text-right font-black text-rose-500">{formatFCFA(b.impayes)}</td>
                      <td className="p-6 text-right font-black text-indigo-600">{formatFCFA(b.net)}</td>
                      <td className="p-6">
                        <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                           <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full transition-all duration-1000", b.status === 'RENTED' ? "bg-emerald-500 w-full" : "bg-amber-500 w-0")} 
                              />
                           </div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{b.status === 'RENTED' ? '100%' : '0%'}</span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <Badge className={cn(
                          "rounded-full px-4 py-1.5 font-bold border-none text-[10px] uppercase tracking-tighter",
                          b.status === 'RENTED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        )}>
                          {b.status === 'RENTED' ? 'Loué' : 'Vacant'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
