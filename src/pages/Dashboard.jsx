import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

const StatCard = ({ title, value, trend, icon: Icon, color }) => (
  <div className="bg-white/80 backdrop-blur-md border border-white/50 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${
          trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState({
    kpis: {
      revenue: '0 €',
      occupancy: '0%',
      tenants: 0,
      properties: 0
    },
    recentPayments: [],
    loading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Appels API combinés
        const [kpiRes, paymentRes] = await Promise.all([
            api.get('/api/immobilier/kpis/').catch(() => ({ data: {
              total_properties: 28, active_tenants: 24,
              active_leases: 24, occupancy_rate: 94, total_revenue: 12450
            }})),
            api.get('/api/finances/paiements/')
        ]);
        setData({
          kpis: kpiRes.data,
          recentPayments: paymentRes.data,
          loading: false
        });
      } catch (error) {
        console.error('Erreur Dashboard:', error);
        // Mock data for visual demo if API fails
        setData(prev => ({
          ...prev,
          kpis: { revenue: '12,450 €', occupancy: '94%', tenants: 28, properties: 12 },
          recentPayments: [
            { id: 1, tenant: 'Alice Martin', property: 'Appart. T3 - Lyon', amount: '850 €', date: 'Aujourd\'hui', status: 'paid' },
            { id: 2, tenant: 'Marc Durand', property: 'Studio - Paris', amount: '620 €', date: 'Hier', status: 'pending' },
            { id: 3, tenant: 'Sophie Petit', property: 'Villa - Nice', amount: '2,100 €', date: '12 Mars', status: 'paid' },
          ],
          loading: false
        }));
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bonjour, Jean ðŸ‘‹</h1>
        <p className="text-slate-500">Voici ce qui se passe dans votre parc immobilier aujourd'hui.</p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Revenus Mensuels" 
          value={data.kpis.revenue} 
          trend={12.5} 
          icon={Wallet} 
          color="bg-indigo-600" 
        />
        <StatCard 
          title="Taux d'occupation" 
          value={data.kpis.occupancy} 
          trend={2.1} 
          icon={TrendingUp} 
          color="bg-emerald-600" 
        />
        <StatCard 
          title="Locataires Actifs" 
          value={data.kpis.tenants} 
          icon={Users} 
          color="bg-violet-600" 
        />
        <StatCard 
          title="Biens en Gestion" 
          value={data.kpis.properties} 
          icon={Building2} 
          color="bg-amber-600" 
        />
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card (Placeholder) */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Performance Financière</h3>
              <p className="text-sm text-slate-500">Évolution des encaissements sur 6 mois</p>
            </div>
            <select className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none">
              <option>6 derniers mois</option>
              <option>Année 2025</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {[40, 65, 45, 90, 55, 75].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t-2xl shadow-lg shadow-indigo-100"
                />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mois {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl text-white">
          <h3 className="text-xl font-bold mb-6">Derniers Paiements</h3>
          <div className="space-y-6">
            {data.recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    payment.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {payment.status === 'paid' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm group-hover:text-indigo-400 transition-colors">{payment.tenant}</p>
                    <p className="text-xs text-slate-400">{payment.property}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{payment.amount}</p>
                  <p className="text-xs text-slate-500">{payment.date}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all border border-white/10">
            Voir tout l'historique
          </button>
        </div>

        {/* Alerts Bento Card */}
        <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="text-red-500" size={24} />
            <h3 className="text-xl font-bold text-slate-900">Alertes Critiques</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-sm font-bold text-red-900 mb-1">Bail expirant bientôt</p>
              <p className="text-xs text-red-700">Appartement T2 - Résidence des Pins (15 jours)</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <p className="text-sm font-bold text-amber-900 mb-1">Maintenance requise</p>
              <p className="text-xs text-amber-700">Fuite signalée - Studio 4B</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Bento Card */}
        <div className="lg:col-span-2 bg-indigo-600 rounded-[2.5rem] p-8 shadow-xl shadow-indigo-200 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <h3 className="text-2xl font-bold mb-2">Prêt à ajouter un nouveau bien ?</h3>
            <p className="text-indigo-100 opacity-80">Configurez votre prochaine propriété et commencez à collecter des loyers dès aujourd'hui.</p>
          </div>
          <button className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-xl">
            <Building2 size={20} />
            Ajouter un bien
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
