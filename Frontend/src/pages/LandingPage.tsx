import { Link } from 'react-router-dom';
import { 
  Building2, 
  FileText, 
  ArrowRight, 
  Menu, 
  X, 
  Shield, 
  BarChart3, 
  Clock, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight,
  Wallet,
  Zap,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

const features = [
  { 
    icon: Building2, 
    title: 'Patrimoine Immobilier', 
    desc: 'Visualisez vos unités (Villas, Appartements) avec des indicateurs de statut temps réel comme sur votre dashboard.',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-500/10'
  },
  { 
    icon: TrendingUp, 
    title: 'Analyses de Revenus', 
    desc: 'Suivez vos encaissements mensuels et comparez vos revenus réels face aux impayés avec nos graphiques AreaChart.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10'
  },
  { 
    icon: FileText, 
    title: 'Gestion des Baux', 
    desc: 'Centralisation complète des contrats, dates d\'échéance et alertes de fin de bail pour une gestion sans stress.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10'
  },
  { 
    icon: Wallet, 
    title: 'Comptabilité Automatisée', 
    desc: 'Génération automatique de quittances et suivi des flux de trésorerie mensuels par exercice comptable.',
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-500/10'
  }
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-primary/10">
      {/* HEADER - Inspiré de la Welcome Bar du Dashboard */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/20">
              <Building2 className="h-7 w-7" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">LOXIS</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              <a href="#features" className="hover:text-primary transition-colors">Fonctionnalités</a>
              <a href="#steps" className="hover:text-primary transition-colors">Méthode</a>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" asChild className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                <Link to="/login">Connexion</Link>
              </Button>
              <Button asChild className="rounded-2xl h-11 px-8 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform">
                <Link to="/register">S'inscrire</Link>
              </Button>
            </div>
          </div>

          <button className="md:hidden p-2 text-slate-900 dark:text-slate-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white p-6 dark:bg-slate-900 dark:border-slate-800 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-6 text-[10px] font-black uppercase tracking-widest">
              <Link to="/login" onClick={() => setMenuOpen(false)}>Connexion</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Créer un compte</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION - Inspiré des KPI Cards */}
      <section className="relative px-6 py-24 lg:py-40 overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0 -z-20">
          <img 
            src="/home-bg.jpg" 
            alt="Background" 
            className="w-full h-full object-cover opacity-60 dark:opacity-30 mix-blend-multiply dark:mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/20 to-white dark:from-slate-950/80 dark:via-slate-950/40 dark:to-slate-950" />
        </div>

        {/* Abstract Background Element (comme dans le donut card) */}
        <div className="absolute top-0 right-0 p-20 opacity-[0.03] -z-10 dark:opacity-[0.05]">
          <Activity className="h-[600px] w-[600px] text-slate-900" />
        </div>

        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto mb-10 flex w-fit items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-900 px-5 py-2 border border-slate-200 dark:border-slate-800">
            <Zap className="h-4 w-4 text-primary fill-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">Version 2.0 • Togo 🇹🇬</span>
          </div>

          <h1 className="text-6xl font-black tracking-tighter text-slate-900 sm:text-8xl lg:text-9xl dark:text-white leading-[0.9]">
            Pilotez votre <br />
            <span className="text-primary italic">patrimoine</span>.
          </h1>

          <p className="mx-auto mt-12 max-w-2xl text-lg font-bold leading-relaxed text-slate-400 dark:text-slate-500 uppercase tracking-tight">
            L'ERP immobilier de référence. Gérez vos baux, vos revenus et vos impayés avec la précision d'un dashboard financier.
          </p>

          <div className="mt-16 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Button size="lg" asChild className="h-16 rounded-[2rem] px-12 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:-translate-y-1">
              <Link to="/register">Démarrer l'audit gratuit</Link>
            </Button>
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SÉCURISÉ PAR DOUBLE AUTHENTIFICATION 2FA
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID - Inspiré des KPI Cards */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-32">
        <div className="mb-20">
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-4">Systèmes Intégrés</h2>
          <p className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Expertise de gestion digitale.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={i} className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2">
              <div className={cn("inline-flex p-4 rounded-2xl mb-8 transition-transform group-hover:scale-110 duration-500", f.bg, f.color)}>
                <f.icon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-4 italic">{f.title}</h3>
              <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-tight">{f.desc}</p>
              
              <div className="mt-8">
                <div className="h-1 w-12 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:w-full group-hover:bg-primary transition-all duration-700" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION - Inspiré de la Donut Card (Dark Mode) */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="relative rounded-[3rem] bg-slate-900 p-12 lg:p-24 overflow-hidden text-center">
          <div className="absolute top-0 left-0 p-12 opacity-5">
            <Target className="h-64 w-64 text-white" />
          </div>
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl lg:text-7xl font-black tracking-tighter text-white leading-none">
              Prêt à passer à <br className="hidden md:block" />
              la gestion de <span className="text-primary italic underline decoration-white/20 underline-offset-8">demain</span> ?
            </h2>
            <p className="mx-auto max-w-xl text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
              Utilisé par des centaines de bailleurs pour sécuriser leurs flux de trésorerie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="h-16 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 px-10 text-xs font-black uppercase tracking-widest shadow-xl">
                <Link to="/register">Rejoindre Loxis</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="h-16 rounded-2xl border-white/20 text-white hover:bg-white/10 px-10 text-xs font-black uppercase tracking-widest backdrop-blur-sm">
                <Link to="/login">Espace Client</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-50 py-16 text-center dark:border-slate-900">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-lg font-black tracking-tighter text-slate-400 uppercase">LOXIS 2026</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 dark:text-slate-800">
            Propulsé par Gemini 3 Flash & GitHub Copilot
          </p>
        </div>
      </footer>
    </div>
  );
}
