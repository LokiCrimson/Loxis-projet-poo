import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-3xl" 
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center max-w-md w-full space-y-8"
      >
        {/* Animated Icon Container */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: [12, -12, 12] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-indigo-500/10 rounded-[2.5rem]" 
            />
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 0 }}
              className="absolute inset-0 bg-slate-900 dark:bg-white/5 rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-white/10"
            >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Search className="h-12 w-12 text-indigo-500" />
                </motion.div>
            </motion.div>
        </div>

        <div className="space-y-3">
          <motion.h1 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="text-8xl font-black tracking-tighter text-slate-900 dark:text-white"
          >
            404
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight"
          >
            Page Introuvable
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4"
          >
            Il semble que l'adresse <span className="text-indigo-500 dark:text-indigo-400">"{location.pathname}"</span> n'existe pas ou a été déplacée.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Button asChild variant="outline" className="w-full sm:w-auto rounded-2xl h-12 px-6 font-bold border-none shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-all flex gap-2 group">
            <button onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 text-indigo-500 transition-transform group-hover:-translate-x-1" /> Retour
            </button>
          </Button>
          <Button asChild className="w-full sm:w-auto rounded-2xl h-12 px-8 font-black shadow-lg shadow-indigo-500/20 flex gap-2 hover:scale-105 transition-transform active:scale-95">
            <Link to="/">
              <Home className="h-4 w-4" /> Accueil Loxis
            </Link>
          </Button>
        </motion.div>

        {/* Support Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          whileHover={{ opacity: 1 }}
          className="pt-12 flex items-center justify-center gap-2"
        >
            <HelpCircle className="h-4 w-4 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Besoin d'aide ? Contactez le support Loxis</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
