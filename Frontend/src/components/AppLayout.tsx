import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Building2, Users, FileText, CreditCard,
  Receipt, BarChart3, Bell, Settings, LogOut, Menu, X, Search, Home, Star, MessageSquare, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useAllAlertes, useAlertCount } from '@/hooks/use-alertes';
import { getAllAlertes } from '@/services/alertes.service';
import { useQuery } from '@tanstack/react-query';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['ADMIN', 'OWNER'] },
  { label: 'Mon Espace', icon: LayoutDashboard, path: '/mon-espace', roles: ['TENANT'] },
  { label: 'Biens', icon: Building2, path: '/biens', roles: ['ADMIN', 'OWNER'] },
  { label: 'Réservations', icon: MessageSquare, path: '/reservations', roles: ['ADMIN', 'OWNER'] },
  { label: 'Catalogue', icon: Building2, path: '/explorer', roles: ['TENANT'] },
  { label: 'Mes Locations', icon: ShieldCheck, path: '/mes-locations', roles: ['TENANT'] },
  { label: 'Locataires', icon: Users, path: '/locataires', roles: ['ADMIN', 'OWNER'] },
  { label: 'Baux', icon: FileText, path: '/baux', roles: ['ADMIN', 'OWNER'] },
  { label: 'Paiements', icon: CreditCard, path: '/paiements', roles: ['ADMIN', 'OWNER'] },
  { label: 'Mes Paiements', icon: CreditCard, path: '/mes-paiements', roles: ['TENANT'] },
  { label: 'Quittances', icon: Receipt, path: '/quittances', roles: ['ADMIN', 'OWNER'] },
  { label: 'Avis Reçus', icon: Star, path: '/avis', roles: ['ADMIN', 'OWNER'] },
  { label: 'Mes Avis', icon: Star, path: '/mes-avis', roles: ['TENANT'] },
  { label: 'Comptabilité', icon: BarChart3, path: '/comptabilite', roles: ['ADMIN', 'OWNER'] },
];

const mobileNavItems = [
  { label: 'Catalogue', icon: Building2, path: '/explorer', roles: ['TENANT'] },
  { label: 'Mes Locations', icon: ShieldCheck, path: '/mes-locations', roles: ['TENANT'] },
  { label: 'my_assets', icon: Building2, path: '/biens', roles: ['ADMIN', 'OWNER'] },
  { label: 'accounting', icon: BarChart3, path: '/comptabilite', roles: ['ADMIN', 'OWNER'] },
];

function getPageTitle(pathname: string, t: (key: string) => string): string {
  const item = navItems.find(n => pathname.startsWith(n.path));
  if (pathname.match(/^\/biens\/\d+/)) return t('asset_detail');
  if (pathname.match(/^\/locataires\/\d+/)) return t('tenant_detail');
  if (pathname.match(/^\/baux\/\d+/)) return t('lease_detail');
  return item ? t(item.label) : 'LOXIS';
}

export default function AppLayout() {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const { data: nonLuesCount = 0, refetch } = useAlertCount();
  
  const pageTitle = getPageTitle(location.pathname, t);

  useEffect(() => {
    // Rafraîchir les notifications lors du changement de page
    refetch();
  }, [location.pathname, refetch]);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(nextLang);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 20);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#0a0c10]">
      {/* Background Blobs for depth */}
      <div className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-[500px] w-[500px] rounded-full bg-secondary/10 blur-[120px]" />

      {/* 
        DESKTOP DOCK (Vertical Left)
      */}
      <nav className="fixed left-6 top-1/2 z-50 hidden max-h-[90vh] -translate-y-1/2 flex-col items-center justify-between rounded-[2rem] border border-white/40 bg-white/40 p-4 py-6 shadow-2xl backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/40 lg:flex">
        
        {/* Top: Home/Logo */}
        <div className="mb-6">
          <Link to={user?.role === 'TENANT' ? "/mon-espace" : "/dashboard"} className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-110 hover:shadow-primary/50">
            <Home className="h-6 w-6" />
            <span className="pointer-events-none absolute left-16 translate-x-4 whitespace-nowrap rounded-xl border border-white/20 bg-background/80 px-3 py-1.5 text-sm font-semibold text-foreground opacity-0 shadow-xl backdrop-blur-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:border-slate-700/50">
              Logo Loxis
            </span>
          </Link>
        </div>
        
        {/* Middle: Nav Menu */}
        <div className="flex flex-1 flex-col justify-center gap-3 pb-6 pt-2 w-full items-center">
          {navItems
            .filter(item => !item.roles || item.roles.includes(user?.role || ''))
            .map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'group relative flex h-12 w-12 items-center justify-center rounded-[1.25rem] transition-all duration-300 ease-out hover:scale-110',
                  isActive
                    ? 'bg-white shadow-md text-primary dark:bg-card dark:text-primary dark:shadow-black/50'
                    : 'text-muted-foreground hover:bg-white/50 hover:text-foreground dark:hover:bg-slate-800/50'
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-transform duration-300", isActive && "scale-110")} />
                {item.label === 'alerts' && nonLuesCount > 0 && (
                  <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border border-white bg-destructive shadow-sm dark:border-slate-800 animate-pulse" />
                )}
                {/* Custom Tooltip */}
                <span className="pointer-events-none absolute left-16 translate-x-4 whitespace-nowrap rounded-xl border border-white/20 bg-background/80 px-3 py-1.5 text-sm font-medium text-foreground opacity-0 shadow-xl backdrop-blur-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:border-slate-700/50">
                  {t(item.label)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 
        MAIN ISLAND (The app container)
      */}
      <main className="relative z-10 flex h-[100dvh] w-full flex-col overflow-hidden bg-white/80 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out backdrop-blur-[25px] sm:h-[95vh] sm:w-[95%] sm:max-w-[1400px] sm:rounded-[2.5rem] sm:border sm:border-white/40 sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:bg-slate-900/80 sm:dark:border-slate-800/50 lg:ml-32 lg:w-auto lg:flex-1">
        
        {/* Floating Top Control Bar Component */}
        <header className={cn(
          "z-20 flex h-20 shrink-0 items-center justify-between px-6 transition-all duration-300 sm:px-10",
          scrolled && "border-b border-border/50 bg-background/50 backdrop-blur-md"
        )}>
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 transition-colors hover:bg-muted lg:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground transition-all">{pageTitle}</h1>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center justify-center rounded-full bg-white/40 shadow-sm backdrop-blur-md dark:bg-slate-900/40 border border-white/40 dark:border-slate-700/50 h-10 w-10 sm:h-12 sm:w-12 text-[10px] font-black uppercase tracking-tighter hover:bg-white/60 transition-colors"
            >
              {i18n.language === 'fr' ? 'EN' : 'FR'}
            </button>

            {/* Elegant Search Input */}
            <div className="group relative hidden md:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder={t('search')} 
                className="h-10 w-64 rounded-full border-white/20 bg-white/40 pl-10 shadow-inner backdrop-blur-sm transition-all focus-visible:w-72 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-slate-700/50 dark:bg-slate-900/40 dark:focus-visible:bg-slate-900"
              />
            </div>
            
            {/* Notification Bell */}
            <Link to="/alertes" className="flex items-center justify-center rounded-full bg-white/40 shadow-sm backdrop-blur-md dark:bg-slate-900/40 border border-white/40 dark:border-slate-700/50 h-10 w-10 sm:h-12 sm:w-12 relative cursor-pointer hover:bg-white/60 transition-colors group">
              <Bell className={cn("h-5 w-5 text-foreground transition-transform group-hover:rotate-12", nonLuesCount > 0 && "text-indigo-600 dark:text-indigo-400")} />
              {nonLuesCount > 0 && (
                <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-destructive text-[9px] font-black text-white shadow-sm shadow-destructive/40 animate-bounce">
                  {nonLuesCount > 9 ? '9+' : nonLuesCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle Wrapper */}
            <div className="flex items-center justify-center rounded-full bg-white/40 shadow-sm backdrop-blur-md dark:bg-slate-900/40 border border-white/40 dark:border-slate-700/50 h-10 w-10 sm:h-12 sm:w-12">
              <ThemeToggle />
            </div>

            {/* Top Right Controls & Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-12 items-center gap-3 rounded-full border border-white/40 bg-white/40 pl-3 pr-4 shadow-sm backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/40 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all outline-none">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-xs font-bold text-white shadow-md">
                     {user?.prenom?.[0] || 'U'}{user?.nom?.[0] || ''}
                     <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-secondary" />
                  </div>
                  <div className="hidden flex-col leading-none sm:flex text-left">
                    <span className="text-sm font-semibold text-foreground">{user?.prenom} {user?.nom}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{user?.role}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-700/50 shadow-2xl p-2 z-[100]">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.prenom} {user?.nom}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50 my-2" />
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary">
                  <Link to="/parametres" className="flex w-full items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>{t('settings')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50 my-2" />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="rounded-xl cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Viewport with Custom Spacing */}
        <div className="relative flex-1 overflow-y-auto px-4 pb-28 pt-4 sm:px-10 sm:pb-10 custom-scrollbar" onScroll={handleScroll}>
           <div className="mx-auto h-full w-full max-w-7xl animate-in fade-in duration-500">
              <Outlet />
           </div>
        </div>
      </main>

      {/* 
        MOBILE DOCK (Bottom Floating)
      */}
      <nav className="fixed bottom-6 left-1/2 z-50 flex w-[92%] -translate-x-1/2 items-center justify-around gap-2 rounded-[2rem] border border-white/40 bg-white/60 p-2 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/60 lg:hidden">
        {mobileNavItems
          .filter(item => !item.roles || item.roles.includes(user?.role || ''))
          .map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex flex-col items-center gap-1 rounded-2xl p-2 transition-all duration-300',
                isActive ? 'scale-110 bg-white shadow-md dark:bg-card dark:text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {isActive && <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside 
            className="absolute left-0 top-0 h-full w-72 flex-col bg-card p-6 shadow-2xl animate-in slide-in-from-left duration-300 flex"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="text-xl font-bold text-primary">LOXIS</span>
              <button className="rounded-lg bg-muted p-2" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
              {navItems
                .filter(item => !item.roles || item.roles.includes(user?.role || ''))
                .map(item => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    location.pathname.startsWith(item.path) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-auto border-t border-border pt-4">
              <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground">
                <LogOut className="h-4 w-4" /> Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
