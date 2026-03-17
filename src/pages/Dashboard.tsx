import { Building2, FileText, TrendingUp, AlertCircle, AlertTriangle, Clock, RefreshCw, Plus, Shield, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useDashboardStats, useRevenueChart, useAlertes, useBienStatuts } from '@/hooks/use-dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { formatFCFA, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const DONUT_COLORS = ['hsl(142, 71%, 45%)', 'hsl(215, 16%, 80%)', 'hsl(38, 92%, 50%)'];

const alertConfig = {
  loyer_impaye: { border: 'border-l-destructive', icon: AlertTriangle, iconColor: 'text-destructive' },
  fin_bail: { border: 'border-l-warning', icon: Clock, iconColor: 'text-warning' },
  revision_loyer: { border: 'border-l-secondary', icon: RefreshCw, iconColor: 'text-secondary' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: chart, isLoading: chartLoading } = useRevenueChart();
  const { data: alertes, isLoading: alertesLoading } = useAlertes();
  const { data: statuts, isLoading: statutsLoading } = useBienStatuts();

  const subtitle = isAdmin
    ? 'Vue globale de la plateforme — tous les propriétaires'
    : `Bienvenue ${user?.prenom}, voici votre patrimoine`;

  const kpis = stats ? [
    { label: 'Total Biens', value: stats.total_biens, icon: Building2, color: 'bg-secondary/10 text-secondary', trend: null },
    { label: 'Baux Actifs', value: stats.baux_actifs, icon: FileText, color: 'bg-success/10 text-success', trend: stats.evolution_baux },
    { label: 'Revenus du mois', value: formatFCFA(stats.revenus_mois), icon: TrendingUp, color: 'bg-secondary/10 text-secondary', trend: stats.evolution_revenus },
    { label: 'Loyers Impayés', value: stats.loyers_impayes, icon: AlertCircle, color: 'bg-destructive/10 text-destructive', trend: stats.evolution_impayes, pulse: true },
  ] : [];

  const donutData = statuts ? [
    { name: 'Loués', value: statuts.loues },
    { name: 'Vacants', value: statuts.vacants },
    { name: 'En travaux', value: statuts.en_travaux },
  ] : [];
  const totalBiens = statuts ? statuts.loues + statuts.vacants + statuts.en_travaux : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={isAdmin ? 'Dashboard Administrateur' : 'Mon Dashboard'}
          subtitle={subtitle}
        />
        {isAdmin && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">Admin</span>
          </div>
        )}
      </div>

      {/* Admin-only: Platform overview */}
      {isAdmin && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-primary">Vue plateforme</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-xs text-muted-foreground">Propriétaires</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">5</p>
              <p className="text-xs text-muted-foreground">Locataires actifs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">9</p>
              <p className="text-xs text-muted-foreground">Biens totaux</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">98%</p>
              <p className="text-xs text-muted-foreground">Taux de recouvrement</p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} type="card" />)
        ) : kpis.map((kpi, i) => (
          <div key={i} className="rounded-xl bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', kpi.color)}>
                <kpi.icon className={cn('h-5 w-5', kpi.pulse && 'animate-pulse-dot')} />
              </div>
              {kpi.trend !== null && kpi.trend !== 0 && (
                <span className={cn('text-xs font-semibold', kpi.trend > 0 ? 'text-success' : 'text-destructive')}>
                  {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
                </span>
              )}
            </div>
            <p className="mt-4 kpi-value">{kpi.value}</p>
            <p className="mt-1 label-uppercase">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl bg-card p-6 shadow-sm">
        <h3 className="section-title mb-4">
          {isAdmin ? 'Revenus globaux des 12 derniers mois' : 'Mes revenus des 12 derniers mois'}
        </h3>
        {chartLoading ? (
          <LoadingSkeleton lines={6} />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" tickFormatter={v => `${(v / 1000)}k`} />
              <Tooltip formatter={(value: number) => formatFCFA(value)} />
              <Legend />
              <Bar dataKey="revenus" name="Revenus" fill="hsl(214, 60%, 27%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="depenses" name="Dépenses" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Alerts */}
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="section-title">{isAdmin ? 'Toutes les alertes' : 'Mes alertes'}</h3>
              <span className="flex h-5 items-center rounded-full bg-destructive/10 px-2 text-xs font-semibold text-destructive">
                {alertes?.filter(a => !a.lu).length || 0}
              </span>
            </div>
          </div>
          {alertesLoading ? (
            <LoadingSkeleton lines={5} />
          ) : alertes && alertes.length > 0 ? (
            <div className="space-y-3">
              {alertes.slice(0, 5).map(alerte => {
                const config = alertConfig[alerte.type];
                return (
                  <div key={alerte.id} className={cn('flex items-start gap-3 rounded-lg border-l-4 bg-muted/30 p-3', config.border)}>
                    <config.icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', config.iconColor)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{alerte.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(alerte.date)}</p>
                    </div>
                    <Link to={`/biens/${alerte.bien_id}`} className="text-xs font-medium text-secondary hover:underline">
                      Voir
                    </Link>
                  </div>
                );
              })}
              <Link to="/alertes" className="block text-center text-sm font-medium text-secondary hover:underline">
                Voir toutes les alertes
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Aucune alerte pour le moment</p>
          )}
        </div>

        {/* Donut */}
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <h3 className="section-title mb-4">{isAdmin ? 'Tous les biens par statut' : 'Mes biens par statut'}</h3>
          {statutsLoading ? (
            <LoadingSkeleton lines={4} />
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 text-center">
                <p className="text-2xl font-bold">{totalBiens}</p>
                <p className="text-xs text-muted-foreground">{isAdmin ? 'biens sur la plateforme' : 'biens dans mon patrimoine'}</p>
              </div>
              <div className="mt-4 flex gap-6">
                {donutData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: DONUT_COLORS[i] }} />
                    <span className="text-xs text-muted-foreground">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/biens?action=add"><Plus className="mr-2 h-4 w-4" />Ajouter un bien</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/paiements?action=add"><Plus className="mr-2 h-4 w-4" />Enregistrer un paiement</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/baux?action=add"><Plus className="mr-2 h-4 w-4" />Nouveau bail</Link>
        </Button>
      </div>
    </div>
  );
}
