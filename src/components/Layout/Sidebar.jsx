import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Building2,
  Users,
  FileText,
  PieChart,
  Settings,
  LayoutDashboard,
  History,
  Menu
} from 'lucide-react';
import { getUserRole } from '../../services/api';

const Sidebar = ({ onToggleMenu }) => {
  const role = getUserRole();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'OWNER', 'TENANT'] },
    { icon: Building2, label: 'Propriétés', path: '/dashboard/properties', roles: ['ADMIN', 'OWNER'] },
    { icon: Users, label: 'Locataires', path: '/dashboard/tenants', roles: ['ADMIN', 'OWNER'] },
    { icon: FileText, label: 'Baux', path: '/dashboard/leases', roles: ['ADMIN', 'OWNER', 'TENANT'] },
    { icon: PieChart, label: 'Finances', path: '/dashboard/finances', roles: ['ADMIN', 'OWNER'] },
    { icon: History, label: 'Audit', path: '/dashboard/audit', roles: ['ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-[150] hidden lg:flex flex-col items-center gap-6 bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] py-8 px-4">
      {/* Logo flottant */}
      <div className="w-14 h-14 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-indigo-200 mb-2 cursor-pointer hover:scale-105 hover:-translate-y-1 transition-all duration-300">
        <Building2 className="text-white" size={28} strokeWidth={2.5} />
      </div>

      {/* Dock d'applications */}
      <div className="flex flex-col gap-3 flex-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `
              relative group flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300
              ${isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-500'}
            `}
            title={item.label}
          >
            <item.icon size={22} strokeWidth={2.5} />
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all whitespace-nowrap shadow-xl">
              {item.label}
            </div>
          </NavLink>
        ))}
      </div>

      {/* Bouton Menu Coulissant */}
      <button
        onClick={onToggleMenu}
        className="relative group flex items-center justify-center w-12 h-12 mt-4 rounded-2xl bg-slate-900 text-white hover:bg-black hover:scale-105 transition-all duration-300 shadow-lg shadow-slate-300"
        title="Menu"
      >
        <Menu size={22} strokeWidth={2.5} />
        <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all whitespace-nowrap shadow-xl">
          Menu Principal
        </div>
      </button>
    </nav>
  );
};

export default Sidebar;