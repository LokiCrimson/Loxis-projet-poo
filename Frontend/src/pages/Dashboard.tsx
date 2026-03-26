import { 
  Building2, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Plus, 
  Shield, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Wallet,
  Activity,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useDashboardStats, useRevenueChart, useAlertes, useBienStatuts } from '@/hooks/use-dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { formatFCFA, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const DONUT_COLORS = ['#10b981', '#cbd5e1', '#f59e0b'];

const alertConfig = {
  UNPAID_RENT: { bg: 'bg-destructive/5', border: 'border-destructive/20', icon: AlertTriangle, iconColor: 'text-destructive', label: 'Impayé' },
  LEASE_END: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', icon: Clock, iconColor: 'text-amber-600', label: 'Fin de bail' },
  RENT_REVISION: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', icon: RefreshCw, iconColor: 'text-blue-600', label: 'Révision' },
  PROPERTY_VACANT: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', icon: Building2, iconColor: 'text-emerald-600', label: 'Vacant' },
  SUSPICIOUS_ACTIVITY: { bg: 'bg-rose-500/5', border: 'border-rose-500/20', icon: Shield, iconColor: 'text-rose-600', label: 'Suspicion' },
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: chart, isLoading: chartLoading } = useRevenueChart();
  const { data: alertes, isLoading: alertesLoading } = useAlertes();
  const { data: statuts, isLoading: statutsLoading } = useBienStatuts();

  const kpis = stats ? [
    { label: t('total_assets'), value: stats.total_biens, icon: Building2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', trend: '+2', trendUp: true },
    { label: t('active_leases'), value: stats.baux_actifs, icon: FileText, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', trend: '+1', trendUp: true },
    { label: t('collection'), value: formatFCFA(stats.revenus_mois), icon: Wallet, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', trend: t('this_month'), trendUp: true },
    { label: t('unpaid'), value: formatFCFA(stats.total_impayes), icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', trend: t('action_required'), trendUp: false },
  ] : [];

  const donutData = statuts || [];
  const totalBiens = stats?.total_biens || statuts?.reduce((acc, curr) => acc + curr.value, 0) || 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Top Welcome Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('hello')}, {user?.first_name || 'Dave'} !
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin ? t('admin_platform_desc') : t('owner_platform_desc')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{formatDate(new Date().toISOString())}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} type="card" />)
        ) : kpis.map((kpi, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-[2rem] overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={cn("p-3 rounded-2xl transition-colors group-hover:scale-110 duration-500", kpi.bg, kpi.color)}>
                  <kpi.icon className="h-6 w-6" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full",
                  kpi.trendUp ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                )}>
                  {kpi.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {kpi.trend}
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-1">
                <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{kpi.value}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{kpi.label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Revenue Chart - Takes 2 columns */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] p-4 bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> {t('revenue')}
              </CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t('monthly_collection')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-emerald-700 uppercase">{t('collection')}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 rounded-full border border-rose-100">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-[10px] font-black text-rose-700 uppercase">{t('unpaid')}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <LoadingSkeleton lines={8} />
            ) : (
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="mois" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      tickFormatter={(v) => `${(v / 1000)}k`} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 700 }} 
                      formatter={(v) => formatFCFA(v as number)}
                    />
                    <Area type="monotone" dataKey="revenus" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="impayes" stroke="#f43f5e" strokeWidth={4} strokeDasharray="10 10" fillOpacity={1} fill="url(#colorImp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution - Takes 1 column */}
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Activity className="h-32 w-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-black tracking-tight italic">{t('distribution_by_status')}</CardTitle>
            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('global_repartition')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-4">
            {statutsLoading ? (
              <LoadingSkeleton type="card" />
            ) : (
              <>
                <div className="relative h-[220px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {donutData.map((entry, i) => (
                           <Cell 
                             key={i} 
                             fill={entry.name === "Loués" || entry.name === "Loué" ? "#10b981" : entry.name === "Vacants" || entry.name === "Vacant" ? "#cbd5e1" : "#f59e0b"} 
                           />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black tracking-tighter">{totalBiens}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total</span>
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-4 w-full">
                  {donutData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: DONUT_COLORS[i] }} />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">{t(d.name.toLowerCase()) || d.name}</span>
                      <span className="text-[10px] font-bold text-indigo-400">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">{t('active_alerts')}</h3>
            <Badge variant="destructive" className="rounded-full px-2 py-0 h-5 font-black text-[10px] animate-pulse">
              {alertes?.filter(a => !a.is_read).length || 0} {t('new_uppercase')}
            </Badge>
          </div>
          <Link to="/alertes" className="group flex items-center gap-1 text-xs font-black text-primary uppercase tracking-widest">
            {t('view_all')} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {alertesLoading ? (
            Array.from({ length: 3 }).map((_, i) => <LoadingSkeleton key={i} type="card" />)
          ) : alertes && alertes.length > 0 ? (
            alertes.slice(0, 3).map(alerte => {
              const config = alertConfig[alerte.alert_type as keyof typeof alertConfig] || alertConfig.UNPAID_RENT;
              
              // Déterminer le lien de redirection
              let link = "/alertes";
              if (alerte.related_entity_type === 'Property' && alerte.related_entity_id) {
                link = `/biens/${alerte.related_entity_id}`;
              } else if (alerte.related_entity_type === 'Lease' && alerte.related_entity_id) {
                link = `/baux/${alerte.related_entity_id}`;
              } else if (alerte.related_entity_type === 'RentPayment' && alerte.related_entity_id && alerte.metadata?.lease_id) {
                link = `/baux/${alerte.metadata.lease_id}`;
              }

              return (
                <Link to={link} key={alerte.id} className="group cursor-pointer">
                  <div className={cn(
                    "relative flex items-center gap-4 p-5 rounded-3xl border transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg h-full",
                    config.bg, config.border,
                    !alerte.is_read && "border-l-4 border-l-primary shadow-sm bg-white dark:bg-slate-900"
                  )}>
                    <div className={cn("p-3 rounded-2xl", config.iconColor, "bg-white dark:bg-slate-900 shadow-sm")}>
                      <config.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border", config.iconColor, config.border)}>
                          {config.label}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">{formatDate(alerte.created_at)}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {alerte.message}
                      </p>
                    </div>
                    <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <Card className="col-span-full border-dashed border-2 bg-transparent h-24 flex items-center justify-center">
              <p className="text-sm font-bold text-slate-400 italic">{t('no_critical_alerts')}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
