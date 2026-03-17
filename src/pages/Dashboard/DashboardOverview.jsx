import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Loader2,
  MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
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
import { motion } from 'motion/react';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const chartData = [
    { name: 'Oct', revenue: 8500 },
    { name: 'Nov', revenue: 9200 },
    { name: 'Dec', revenue: 10500 },
    { name: 'Jan', revenue: 11800 },
    { name: 'Feb', revenue: 12100 },
    { name: 'Mar', revenue: 12450 },
  ];

  const pieData = [
    { name: 'Appartements', value: 12, color: '#6366f1' },
    { name: 'Maisons', value: 5, color: '#10b981' },
    { name: 'Studios', value: 8, color: '#f59e0b' },
    { name: 'Bureaux', value: 3, color: '#f43f5e' },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulation des données pour éviter les erreurs 404 en phase de design UI
        // Remplacer par ces appels quand le backend sera prêt :
        const kpisRes = await api.get('/api/immobilier/kpis/');
        // const logsRes = await api.get('/api/systeme/journal-audit/');
        
        await new Promise(resolve => setTimeout(resolve, 600));

        setStats({
          total_properties: 28,
          active_tenants: 24,
          active_leases: 24,
          occupancy_rate: 94,
          total_revenue: 12450
        });
        setActivities([
          { id: 1, action: 'Paiement reçu', details: 'Loyer Alice - Mars 2026', timestamp: 'Il y a 2h', user_email: 'système' },
          { id: 2, action: 'Nouveau bail', details: 'Signature bail Marc', timestamp: 'Il y a 5h', user_email: 'admin@loxis.fr' },
          { id: 3, action: 'Maintenance', details: 'Entretien chaudière', timestamp: 'Hier', user_email: 'technicien' },
        ]);
      } catch (error) {
        console.error('Erreur dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
    </div>
  );

  return (
    <div className="space-y-10 relative">
      {/* Header Titre */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight leading-tight">
            Vue d'ensemble
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Voici l'état de votre patrimoine aujourd'hui.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-full text-sm font-bold shadow-sm border border-emerald-100/50">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          Système Opérationnel
        </div>
      </div>

      {/* Stats Grid - Floating Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Propriétés', value: stats.total_properties, sub: '+2 ce mois', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '/dashboard/properties' },
          { label: 'Locataires', value: stats.active_tenants, sub: '98% actifs', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/dashboard/tenants' },
          { label: 'Baux Actifs', value: stats.active_leases, sub: '1 en attente', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', path: '/dashboard/leases' },
          { label: 'Revenus (Mar)', value: `${stats.total_revenue} €`, sub: '+12% vs Fév', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50', path: '/dashboard/finances' },
        ].map((item, i) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, ease: "easeOut" }}
            onClick={() => navigate(item.path)}
            className="group bg-white/40 hover:bg-white/80 backdrop-blur-xl p-7 rounded-[2rem] border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300`}>
                <item.icon size={26} strokeWidth={2} />
              </div>
              <button className="text-slate-300 hover:text-slate-500 transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{item.label}</p>
              <div className="flex items-end gap-3">
                <h3 className="text-3xl font-black text-slate-800">{item.value}</h3>
              </div>
              <p className="text-sm font-semibold text-slate-400 mt-2">{item.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Main Island */}
        <div className="lg:col-span-2 bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] rounded-[2rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Évolution des Revenus</h3>
              <p className="text-slate-500 font-medium mt-1">Analyse sur les 6 derniers mois</p>
            </div>
            <select className="bg-white/50 border border-slate-200/50 text-sm font-bold text-slate-600 rounded-xl px-4 py-2.5 outline-none hover:bg-white cursor-pointer transition-all shadow-sm">
              <option>6 derniers mois</option>
              <option>Cette année</option>
            </select>
          </div>
          <div className="h-[320px] w-full min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#4f46e5', fontWeight: 800 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panel - Split in two floating widgets */}
        <div className="flex flex-col gap-6">
          
          {/* Distribution Pie Widget */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] rounded-[2rem] p-7 flex-1">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Parc Immobilier</h3>
            <div className="h-[180px] w-full min-h-[180px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-base font-black text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Recent Activity Widget */}
        <div className="lg:col-span-3 bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] rounded-[2rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-slate-800">Flux d'activités</h3>
            <button 
              onClick={() => navigate('/dashboard/audit')}
              className="text-indigo-600 font-bold justify-center px-4 py-2 hover:bg-indigo-50 rounded-xl text-sm flex items-center gap-2 transition-all"
            >
              Historique complet <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activities.map((activity, i) => (
              <div key={activity.id} className="bg-white/60 p-5 rounded-[1.5rem] border border-white hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-[1rem] flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shrink-0 shadow-sm">
                    <Clock size={22} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activity.timestamp}</span>
                    <p className="text-base font-bold text-slate-800 mt-0.5 leading-tight">{activity.action}</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">{activity.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardOverview;
