import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Box, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/70 backdrop-blur-lg border-b border-white/50 py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Building2 className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Loxis</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Fonctionnalités</a>
            <a href="#solutions" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Solutions</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Tarifs</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              Connexion
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              Espace Client
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 rounded-full">
                Proptech Evolution 2026
              </span>
              <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                La gestion locative <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500">
                  de demain.
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                Automatisez votre comptabilité, gérez vos baux en un clic et offrez des visites 3D immersives à vos futurs locataires.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-2 group">
                  Démarrer gratuitement
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 font-bold rounded-2xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                  Voir la démo
                </button>
              </div>
            </motion.div>
          </div>

          {/* Mockup Interface */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto max-w-6xl"
          >
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden aspect-[16/9]">
              {/* Fake Dashboard Header */}
              <div className="h-16 border-b border-slate-100 flex items-center px-8 justify-between bg-white/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="w-1/3 h-8 bg-slate-100 rounded-lg" />
                <div className="w-10 h-10 bg-slate-200 rounded-full" />
              </div>
              
              {/* Fake Bento Grid */}
              <div className="p-8 grid grid-cols-12 gap-6 h-full">
                <div className="col-span-8 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 p-6">
                  <div className="w-1/4 h-6 bg-indigo-200 rounded-md mb-4" />
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-32 bg-white rounded-2xl border border-indigo-100 shadow-sm" />
                    ))}
                  </div>
                </div>
                <div className="col-span-4 flex flex-col gap-6">
                  <div className="h-1/2 bg-emerald-50/50 rounded-3xl border border-emerald-100/50 p-6">
                    <div className="w-1/2 h-6 bg-emerald-200 rounded-md" />
                  </div>
                  <div className="h-1/2 bg-slate-50 rounded-3xl border border-slate-100 p-6">
                    <div className="w-1/2 h-6 bg-slate-200 rounded-md" />
                  </div>
                </div>
              </div>

              {/* Floating 3D Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-white flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Box className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Visite Immersive</p>
                    <p className="text-lg font-bold text-slate-900">Moteur 3D Actif</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                Une suite d'outils <br />
                <span className="text-indigo-600">pensée pour la performance.</span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Zap size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Comptabilité Automatisée</h3>
                    <p className="text-slate-600">Loxis détecte les virements, génère les quittances et relance les impayés sans intervention humaine.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Box size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Visites 3D Immersives</h3>
                    <p className="text-slate-600">Réduisez les visites inutiles de 70% grâce à notre moteur de rendu 3D intégré directement dans vos annonces.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Sécurité & Conformité</h3>
                    <p className="text-slate-600">Signature électronique certifiée eIDAS et coffre-fort numérique pour tous vos baux et documents.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-6">
              <div className="space-y-6 pt-12">
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 aspect-square flex flex-col justify-end">
                  <Layers className="text-indigo-600 mb-4" size={32} />
                  <h4 className="font-bold text-lg">Multi-biens</h4>
                </div>
                <div className="bg-indigo-600 p-8 rounded-[2rem] text-white aspect-square flex flex-col justify-end">
                  <Zap className="mb-4" size={32} />
                  <h4 className="font-bold text-lg">Instant Sync</h4>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-slate-900 p-8 rounded-[2rem] text-white aspect-square flex flex-col justify-end">
                  <ShieldCheck className="mb-4" size={32} />
                  <h4 className="font-bold text-lg">Data Safe</h4>
                </div>
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 aspect-square flex flex-col justify-end">
                  <Box className="text-emerald-600 mb-4" size={32} />
                  <h4 className="font-bold text-lg">3D Engine</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight">Loxis</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Loxis Technologies. Tous droits réservés.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Zap size={20} /></a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><ShieldCheck size={20} /></a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Building2 size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
