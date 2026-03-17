import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, FileText, CreditCard,
  Receipt, BarChart3, Bell, Settings, LogOut, Menu, X, Search, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Mes Biens', icon: Building2, path: '/biens' },
  { label: 'Locataires', icon: Users, path: '/locataires' },
  { label: 'Baux', icon: FileText, path: '/baux' },
  { label: 'Paiements', icon: CreditCard, path: '/paiements' },
  { label: 'Quittances', icon: Receipt, path: '/quittances' },
  { label: 'Comptabilité', icon: BarChart3, path: '/comptabilite' },
  { label: 'Alertes', icon: Bell, path: '/alertes' },
  { label: 'Paramètres', icon: Settings, path: '/parametres' },
];

const mobileNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Biens', icon: Building2, path: '/biens' },
  { label: 'Paiements', icon: CreditCard, path: '/paiements' },
  { label: 'Alertes', icon: Bell, path: '/alertes' },
];

function getPageTitle(pathname: string): string {
  const item = navItems.find(n => pathname.startsWith(n.path));
  if (pathname.match(/^\/biens\/\d+/)) return 'Détail du bien';
  return item?.label || 'LOXIS';
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const user = mockCurrentUser;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
            <Home className="h-4 w-4 text-secondary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-active">LOXIS</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-sidebar-foreground" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-l-2 border-secondary bg-sidebar-accent text-sidebar-active'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-active'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
                {item.label === 'Alertes' && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    3
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
              {user.prenom[0]}{user.nom[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-active">{user.prenom} {user.nom}</p>
              <p className="truncate text-xs text-sidebar-foreground capitalize">{user.role}</p>
            </div>
            <button className="text-sidebar-foreground hover:text-sidebar-active">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">{pageTitle}</h2>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="w-64 pl-9" />
            </div>
            <button className="relative rounded-lg p-2 hover:bg-muted">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                3
              </span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="flex border-t border-border bg-card lg:hidden">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 py-2 text-xs',
                  isActive ? 'text-secondary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
