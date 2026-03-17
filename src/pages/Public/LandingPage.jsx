import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  Building2, ShieldCheck, Zap, Box, ChevronRight, ArrowRight,
  Globe, PieChart, Home, CreditCard, Users, CheckCircle2,
  Star, Quote, Lock, Clock, HelpCircle, Mail
} from 'lucide-react';

const LandingPage = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 150]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

  const items = [
    { name: 'Villa des Lumières', rent: '+2 400 €', statusText: 'Payé' },
    { name: 'Appartement T4 Centre', rent: '+1 250 €', statusText: 'Payé' },
    { name: 'Studio Étudiant', rent: '+650 €', statusText: 'En attente' }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-indigo-500/30 overflow-hidden outline-none">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[0%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[-20%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/5 h-20 flex items-center justify-center">
        <div className="max-w-7xl w-full px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Building2 className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Loxis</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#stats" className="hover:text-white transition-colors">Chiffres</a>
            <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden md:block text-slate-300 text-sm font-semibold hover:text-white transition-colors">
              Connexion
            </Link>
            <Link to="/register" className="px-5 py-2.5 bg-white text-[#0B0F19] text-sm font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Démarrer
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-8 min-h-screen flex flex-col justify-center">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold tracking-widest mb-8 backdrop-blur-md uppercase">
              <Zap size={14} className="text-indigo-400" />
              L'avenir de l'immobilier
            </div>
            <h1 className="text-6xl md:text-7xl font-black leading-[1.1] tracking-tight mb-6">
              Gérez votre parc <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
                sans aucun stress.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-10 max-w-lg font-light">
              Loxis centralise vos biens, automatise la collecte de loyers et votre comptabilité. Une expérience premium pour propriétaires exigeants.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-[0_0_40px_rgba(99,102,241,0.4)] flex items-center gap-2 group hover:-translate-y-1">
                Essayer gratuitement
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#0B0F19] text-xs flex items-center justify-center font-bold">JD</div>
                <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-[#0B0F19] text-xs flex items-center justify-center font-bold">SM</div>
                <div className="w-10 h-10 rounded-full bg-slate-600 border-2 border-[#0B0F19] text-xs flex items-center justify-center font-bold">PL</div>
              </div>
              <div className="text-sm font-medium text-slate-400">
                L'outil préféré de <span className="text-white font-bold">+2,400</span> propriétaires
              </div>
            </div>
          </motion.div>

          {/* Right Hero Visual */}
          <motion.div style={{ y: y1 }} className="relative lg:h-[600px] w-full hidden lg:block">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#131B2C]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Revenus mensuels</p>
                  <h3 className="text-3xl font-black text-white px-2 mt-1">42 850 €</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <PieChart size={24} />
                </div>
              </div>
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                        <Home size={18} className="text-slate-300" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{item.name}</p>
                        <p className={'text-xs font-bold ' + (item.statusText === 'Payé' ? 'text-emerald-400' : 'text-amber-400')}>{item.statusText}</p>
                      </div>
                    </div>
                    <span className="font-bold text-white">{item.rent}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Floating Element 1 - Security */}
            <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute left-0 top-32 bg-[#131B2C]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-4">
               <ShieldCheck className="text-emerald-400" size={24} />
               <div>
                 <p className="text-[10px] text-slate-400 uppercase font-bold">Sécurité</p>
                 <p className="text-sm font-bold text-white">Chiffrement SSL</p>
               </div>
            </motion.div>

             {/* Floating Element 2 - Rate */}
             <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="absolute -right-8 bottom-40 bg-[#131B2C]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-4">
               <Users className="text-purple-400" size={24} />
               <div>
                 <p className="text-[10px] text-slate-400 uppercase font-bold">Occupation</p>
                 <p className="text-sm font-bold text-white">99.8% atteints</p>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5 text-center">
          <div>
            <h4 className="text-4xl md:text-5xl font-black text-white mb-2">2.4k</h4>
            <p className="text-slate-400 font-medium">Utilisateurs actifs</p>
          </div>
          <div>
             <h4 className="text-4xl md:text-5xl font-black text-white mb-2">15M€</h4>
             <p className="text-slate-400 font-medium">De loyers gérés</p>
          </div>
          <div>
             <h4 className="text-4xl md:text-5xl font-black text-white mb-2">0</h4>
             <p className="text-slate-400 font-medium">Erreur comptable</p>
          </div>
          <div>
             <h4 className="text-4xl md:text-5xl font-black text-white mb-2">12h</h4>
             <p className="text-slate-400 font-medium">Gagnées par mois</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Un outil conçu pour tout orchestrer.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Bénéficiez d'une suite complète pour remplacer vos classeurs excel et logiciels de comptabilité obsolètes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-[#131B2C] border border-white/10 rounded-[2rem] p-10 hover:border-indigo-500/50 transition-colors group">
              <PieChart className="text-indigo-400 mb-6" size={40} />
              <h3 className="text-2xl font-bold mb-4">Tableau de bord intelligent</h3>
              <p className="text-slate-400 text-lg">Visualisez d'un coup d'œil vos revenus, vacances locatives et taxes. Le reporting génère automatiquement vos déclarations de revenus fonciers.</p>
            </div>
            <div className="bg-[#131B2C] border border-white/10 rounded-[2rem] p-10 hover:border-purple-500/50 transition-colors">
              <Lock className="text-purple-400 mb-6" size={40} />
              <h3 className="text-2xl font-bold mb-4">Coffre-fort Légal</h3>
              <p className="text-slate-400">Stockage de vos baux territoriaux, DPE fixes et justificatifs entièrement encodés.</p>
            </div>
            <div className="bg-[#131B2C] border border-white/10 rounded-[2rem] p-10 hover:border-emerald-500/50 transition-colors">
              <CreditCard className="text-emerald-400 mb-6" size={40} />
              <h3 className="text-2xl font-bold mb-4">Paiements Autos</h3>
              <p className="text-slate-400">Encaissez automatiquement les loyers SEPA et éditez vos quittances digitalement.</p>
            </div>
            <div className="md:col-span-2 bg-[#131B2C] border border-white/10 rounded-[2rem] p-10 hover:border-blue-500/50 transition-colors">
              <Users className="text-blue-400 mb-6" size={40} />
              <h3 className="text-2xl font-bold mb-4">Espace Locataire Dédié</h3>
              <p className="text-slate-400 text-lg">Donnez à vos résidents un portail unique pour déclarer les sinistres, trouver leur quittance du mois et régler un impayé en ligne.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-8 relative z-10 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Ils rentabilisent leur temps.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "Depuis Loxis, je gère mes 12 biens seul alors qu'avant cela m'obligeait à payer une agence 8% de mes marges.",
                name: "Marc T.",
                role: "Propriétaire indépendant"
              },
              {
                text: "L'interface est claire. L'envoi automatique des quittances à mes locataires a littéralement changé mon approche mensuelle.",
                name: "Sophie R.",
                role: "Investisseuse LMNP"
              },
              {
                text: "Toutes les charges sont clouées au cordeau. Le bilan de fin d'année pour le comptable s'exporte en 2 minutes chronos.",
                name: "Benoît D.",
                role: "Gérant SCI"
              }
            ].map((t, i) => (
              <div key={i} className="bg-[#131B2C] p-8 rounded-[2rem] border border-white/5 relative">
                <Quote className="absolute top-6 right-6 text-white/5" size={60} />
                <div className="flex gap-1 mb-6 text-amber-400">
                   <Star size={16} fill="currentColor" />
                   <Star size={16} fill="currentColor" />
                   <Star size={16} fill="currentColor" />
                   <Star size={16} fill="currentColor" />
                   <Star size={16} fill="currentColor" />
                </div>
                <p className="text-slate-300 text-lg mb-8 relative z-10">"{t.text}"</p>
                <div>
                  <p className="text-white font-bold">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section id="pricing" className="py-32 px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-black mb-6">Une tarification simple.</h2>
             <p className="text-slate-400 text-lg">Indépendant du nombre de vos locataires.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Free */}
            <div className="p-8 rounded-[2rem] border border-white/10 bg-[#131B2C]">
              <h3 className="text-2xl font-bold text-white mb-2">Découverte</h3>
              <p className="text-slate-400 mb-6">Idéal pour démarrer avec un bien.</p>
              <div className="text-5xl font-black text-white mb-8">0 € <span className="text-lg text-slate-500 font-medium">/mois</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="text-indigo-400" size={20} /> Jusqu'à 2 biens</li>
                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="text-indigo-400" size={20} /> Suivi des loyers</li>
                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="text-indigo-400" size={20} /> Support basique</li>
              </ul>
              <Link to="/register" className="block text-center w-full py-4 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-colors">
                Commencer
              </Link>
            </div>

            {/* Pro */}
            <div className="p-8 rounded-[2rem] border-2 border-indigo-500 bg-gradient-to-b from-[#1c2438] to-[#131B2C] relative transform md:-translate-y-4 shadow-2xl shadow-indigo-500/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">Le plus populaire</div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <p className="text-indigo-200 mb-6">Pour les empires immobiliers.</p>
              <div className="text-5xl font-black text-white mb-8">9 € <span className="text-lg text-slate-500 font-medium">/mois</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-white"><CheckCircle2 className="text-indigo-400" size={20} /> Biens et portails illimités</li>
                <li className="flex items-center gap-3 text-white"><CheckCircle2 className="text-indigo-400" size={20} /> Édition auto des quittances</li>
                <li className="flex items-center gap-3 text-white"><CheckCircle2 className="text-indigo-400" size={20} /> Exports comptables complets</li>
                <li className="flex items-center gap-3 text-white"><CheckCircle2 className="text-indigo-400" size={20} /> Stockage illimité de baux</li>
              </ul>
              <Link to="/register" className="block text-center w-full py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30">
                Ouvrir un compte Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-8 relative z-10 max-w-3xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-12">Des questions ?</h2>
        <div className="space-y-6">
           <div className="p-6 bg-[#131B2C] border border-white/5 rounded-2xl">
             <h4 className="flex items-center gap-3 font-bold text-lg mb-2"><HelpCircle className="text-indigo-400" size={20} /> Est-ce compliqué à configurer ?</h4>
             <p className="text-slate-400 text-sm ml-8">Pas du tout. Loxis a été conçu pour qu'en 5 minutes vôtres premier bien et locataire soient instanciés prêts à tracker vos revenus.</p>
           </div>
           <div className="p-6 bg-[#131B2C] border border-white/5 rounded-2xl">
             <h4 className="flex items-center gap-3 font-bold text-lg mb-2"><HelpCircle className="text-indigo-400" size={20} /> Mes données sont-elles sécurisées ?</h4>
             <p className="text-slate-400 text-sm ml-8">Totalement. Vos informations bénéficient d'un cryptage bancaire (AES-256) et vos dossiers sont conservés sur des serveurs certifiés en France.</p>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8 relative z-10">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-indigo-900 via-[#1e1b4b] to-[#311042] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(99,102,241,0.2)]">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">Reprenez le contrôle aujourd'hui.</h2>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto mb-10 relative z-10">Inscrivez-vous maintenant. Aucune carte bancaire requise pour expérimenter le mode découverte.</p>
          <Link to="/register" className="inline-flex items-center justify-center px-10 py-5 bg-white text-indigo-900 font-bold rounded-xl hover:scale-105 transition-transform shadow-2xl relative z-10 text-lg">
            Créer mon espace gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-8 text-slate-500 relative z-10 bg-[#060A11]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-12">
           <div className="md:col-span-2">
             <div className="flex items-center gap-2 mb-4">
               <Building2 className="text-indigo-500" size={24} />
               <span className="font-bold text-white text-xl">Loxis</span>
             </div>
             <p className="text-sm mb-6 max-w-sm">Le standard Premium pour gérer vos affaires immobilières sereinement. Oubliez la paperasse.</p>
           </div>
           <div>
             <h4 className="text-white font-bold mb-4">Produit</h4>
             <ul className="space-y-2 text-sm">
               <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
               <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
               <li><a href="/login" className="hover:text-white transition-colors">Espace Client</a></li>
             </ul>
           </div>
           <div>
             <h4 className="text-white font-bold mb-4">Ressources</h4>
             <ul className="space-y-2 text-sm">
               <li><a href="#faq" className="hover:text-white transition-colors">FAQ Support</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
             </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs">
          <p>© 2026 Loxis Technologies. Tous droits réservés.</p>
          <p className="flex items-center gap-2 mt-4 md:mt-0">Fabriqué avec passion pour simplifier l'immobilier.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
