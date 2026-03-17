import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Building2, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/token/', { email, password });
      const { access, refresh } = response.data;
      
      localStorage.setItem('loxis_access_token', access);
      localStorage.setItem('loxis_refresh_token', refresh);

      const decoded = jwtDecode(access);
      const role = decoded.role;

      // Redirection selon le rôle
      if (role === 'ADMIN') navigate('/dashboard/admin');
      else if (role === 'OWNER') navigate('/dashboard');
      else if (role === 'TENANT') navigate('/tenant-portal');
      else navigate('/dashboard');

    } catch (err) {
      console.error('Login error:', err);
      setError('Identifiants invalides. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side: Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                <Building2 className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">Loxis</span>
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Bon retour.</h1>
            <p className="text-slate-500 font-medium">Connectez-vous pour accéder à votre espace de gestion.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email professionnel</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-semibold"
                  placeholder="nom@entreprise.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mot de passe</label>
                <a href="#" className="text-xs font-bold text-indigo-600 hover:underline">Oublié ?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-semibold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-50">
            <p className="text-sm text-slate-500 font-medium">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                Créer un compte gratuitement
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Image/Branding */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900">
        <img 
          src="https://picsum.photos/seed/loxis-auth/1200/1600" 
          alt="Real Estate" 
          className="w-full h-full object-cover opacity-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        
        <div className="absolute bottom-16 left-16 right-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-5xl font-black text-white leading-tight mb-6">
              La gestion immobilière <br />
              <span className="text-indigo-400">réinventée.</span>
            </h2>
            <p className="text-slate-300 text-lg font-medium leading-relaxed max-w-md">
              Rejoignez des milliers de propriétaires qui font confiance à Loxis pour automatiser leur patrimoine.
            </p>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-20 w-24 h-24 bg-violet-500/20 blur-3xl rounded-full animate-pulse delay-700" />
      </div>
    </div>
  );
};

export default LoginPage;
