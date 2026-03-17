import React, { useState, useEffect } from 'react';
import { Bell, User, ChevronDown } from 'lucide-react';
import api from '../../services/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/systeme/alertes/');
      setNotifications(response.data);
      setHasUnread(response.data.some(n => !n.is_read));
    } catch (error) {
      setNotifications([
        { id: 1, message: 'Loyer en retard : Studio 4B', type: 'warning', is_read: false, created_at: 'Il y a 2h' },
        { id: 2, message: 'Nouveau bail signé', type: 'success', is_read: false, created_at: 'Il y a 5h' },
      ]);
      setHasUnread(true);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-slate-50 border border-slate-100/50 rounded-[1rem] text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer"
      >
        <Bell size={20} strokeWidth={2} />
        {hasUnread && (
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
        )}
      </button>
    </div>
  );
};

const Topbar = ({ onProfileClick, userProfile }) => {
  const initials = userProfile 
    ? `${userProfile.first_name?.[0] || ''}${userProfile.last_name?.[0] || ''}`.toUpperCase()
    : 'JD';
    
  const fullName = userProfile 
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || userProfile.email
    : 'Jean Dupont';

  const roleName = userProfile?.role || 'Admin';

  return (
    <header className="absolute top-6 left-6 right-6 lg:left-32 lg:right-12 z-[100] flex justify-end items-center pointer-events-none">
      <div className="bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[1.5rem] p-2 flex items-center gap-2 pointer-events-auto">
        <NotificationBell />

        <div className="h-8 w-[2px] bg-slate-200/50 mx-1 rounded-full" />

        <button onClick={onProfileClick} className="flex items-center gap-3 pl-1.5 pr-4 py-1 hover:bg-slate-50/80 rounded-[1.2rem] transition-all cursor-pointer group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-[1rem] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none mb-1">{fullName}</p>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{roleName}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400 ml-1 group-hover:translate-y-0.5 transition-transform" strokeWidth={3} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;