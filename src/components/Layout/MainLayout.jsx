import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Settings, LogOut, Menu as MenuIcon, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MainLayout = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/utilisateurs/me/');
        setUserProfile(res.data);
      } catch (err) {
        console.error('Erreur chargement profil', err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loxis_access_token');
    localStorage.removeItem('loxis_refresh_token');
    navigate('/login');
  };

  const handleNavigation = (path) => {
    setIsDrawerOpen(false);
    navigate(path);
  };

  const initials = userProfile 
    ? `${userProfile.first_name?.[0] || ''}${userProfile.last_name?.[0] || ''}`.toUpperCase()
    : 'JD';
    
  const fullName = userProfile 
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || userProfile.email
    : 'Jean Dupont';

  const roleName = userProfile?.role || 'Admin';

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center p-4 lg:p-8">
      {/* 1. AURORA MESH BACKGROUND (Absolute, Blur-3xl, Animé) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600 rounded-full blur-[100px] opacity-20 animate-blob-bounce" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600 rounded-full blur-[120px] opacity-20 animate-blob-bounce" style={{ animationDelay: '2s', animationDuration: '20s' }} />
        <div className="absolute top-[40%] left-[50%] w-[40vw] h-[40vw] bg-blue-500 rounded-full blur-[100px] opacity-10 animate-blob-bounce" style={{ animationDelay: '5s' }} />
      </div>

      {/* Floating Vertical Dock (Slide-over Trigger inside) */}
      <Sidebar onToggleMenu={() => setIsDrawerOpen(true)} />

      {/* Floating Top Pill */}
      <Topbar onProfileClick={() => setIsDrawerOpen(true)} userProfile={userProfile} />

      {/* Main Central Island */}
      <main className="flex-1 w-full max-w-[1400px] h-[calc(100vh-4rem)] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] flex flex-col relative z-10 lg:ml-24 mt-16 overflow-hidden">
        {/* Scrollbars Invisibles sur le conteneur scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 scrollbar-hide relative z-10 w-full rounded-[2.5rem]">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* 3. SLIDE-OVER PANEL (Menu Utilisateur & Déconnexion) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop overlay (bg-black/60 avec backdrop-blur) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 200 }}
              className="fixed top-0 left-0 w-80 max-w-[85vw] h-full bg-slate-900/95 backdrop-blur-2xl border-r border-white/10 z-[210] p-6 flex flex-col shadow-[30px_0_60px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-[1rem] flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">{fullName}</h2>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-1">{roleName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all hover:rotate-90 duration-300 -mr-2"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Contenu du Menu */}
              <div className="flex flex-col gap-2">
                <button onClick={() => handleNavigation('/dashboard/settings')} className="flex items-center justify-between p-4 rounded-2xl bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white transition-colors group">
                  <div className="flex items-center gap-4">
                    <User size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-sm">Mon Profil</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>

                <button onClick={() => handleNavigation('/dashboard/settings')} className="flex items-center justify-between p-4 rounded-2xl bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white transition-colors group">
                  <div className="flex items-center gap-4">
                    <Settings size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-sm">Paramètres</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              </div>

              <div className="mt-auto pt-6 pb-2 border-t border-slate-700/50">
                <button onClick={handleLogout} className="flex items-center gap-4 p-4 w-full rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all border border-transparent hover:border-rose-500/30 group">
                  <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="font-semibold text-sm">Déconnexion</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;