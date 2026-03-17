import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  User, 
  ChevronDown, 
  LogOut, 
  Settings,
  Mail,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, title: 'Loyer reçu', desc: 'Alice Martin a payé son loyer.', time: '2h ago', icon: Mail, color: 'text-emerald-600 bg-emerald-50' },
    { id: 2, title: 'Maintenance', desc: 'Nouvelle demande pour Lyon 6.', time: '5h ago', icon: Settings, color: 'text-amber-600 bg-amber-50' },
    { id: 3, title: 'Bail expiré', desc: 'Le bail de Sophie Petit expire bientôt.', time: '1d ago', icon: Clock, color: 'text-red-600 bg-red-50' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('loxis_access_token');
    window.location.href = '/login';
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 z-30 px-8 flex items-center justify-between">
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Recherche globale (biens, locataires...)" 
          className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all relative"
          >
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-4 w-80 bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-indigo-100/50 p-4 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <h4 className="font-bold text-slate-900">Notifications</h4>
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Tout lire</button>
                </div>
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer">
                      <div className={`p-2 rounded-lg ${n.color}`}>
                        <n.icon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{n.title}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{n.desc}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-3 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
                  Voir toutes les notifications
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-slate-100 mx-2" />

        {/* Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group"
          >
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xs font-bold">
              AD
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-900">Admin Loxis</p>
              <p className="text-[10px] text-slate-400 font-medium">Administrateur</p>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-4 w-56 bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-indigo-100/50 p-2 overflow-hidden"
              >
                <button 
                  onClick={() => { setShowProfile(false); window.location.href = '/dashboard/settings'; }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all font-semibold text-sm"
                >
                  <User size={18} />
                  Profil
                </button>
                <button 
                  onClick={() => { setShowProfile(false); window.location.href = '/dashboard/settings'; }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all font-semibold text-sm"
                >
                  <Settings size={18} />
                  Paramètres
                </button>
                <div className="h-px bg-slate-50 my-2 mx-2" />
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-semibold text-sm"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
