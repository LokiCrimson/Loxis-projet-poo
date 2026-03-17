import React, { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Shield,
  Database,
  Save,
  Loader2,
  Mail,
  Lock,
  Building,
  Phone
} from 'lucide-react';
import { motion } from 'motion/react';
import api from '../../services/api';
import ImmobilierSettings from './ImmobilierSettings';
import AuditLogsList from './AuditLogsList';
import SecuritySettings from './SecuritySettings';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // States explicitly for the user profile form
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: ''
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'system', label: 'Système', icon: Database },
    { id: 'immobilier', label: 'Immobilier', icon: Building },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const { data } = await api.get('/api/utilisateurs/me/');
      setProfileData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || ''
      });
    } catch (err) {
      console.error(err);
      setErrorMsg("Impossible de charger les données du profil.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.put('/api/utilisateurs/me/', {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone
      });
      setSuccessMsg("Profil mis à jour avec succès.");
      // Auto-hide success after 3s
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur lors de la mise à jour du profil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Paramètres du Compte</h1>
        <p className="text-slate-500 font-medium">Gérez vos informations personnelles et vos préférences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'
                  : 'bg-white/60 text-slate-500 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-slate-200'
              }`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? 'animate-pulse' : ''} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {loading ? (
             <div className="flex items-center justify-center p-20">
               <Loader2 className="animate-spin text-indigo-500" size={40} />
             </div>
          ) : activeTab === 'immobilier' ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><ImmobilierSettings /></motion.div>
          ) : activeTab === 'security' ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><SecuritySettings profileData={profileData} /></motion.div>
          ) : activeTab === 'system' ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><AuditLogsList /></motion.div>
          ) : activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-200">
                   {`${profileData.first_name?.[0] || ''}${profileData.last_name?.[0] || ''}`.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{profileData.first_name} {profileData.last_name}</h3>
                  <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mt-1">{profileData.role}</p>
                </div>
              </div>

              {errorMsg && (
                 <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold">{errorMsg}</div>
              )}
              {successMsg && (
                 <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-semibold">{successMsg}</div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Prénom</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        name="first_name"
                        value={profileData.first_name}
                        onChange={handleProfileChange}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nom</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        name="last_name"
                        value={profileData.last_name}
                        onChange={handleProfileChange}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email (Connexion)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      name="email"
                      value={profileData.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium" 
                    />
                  </div>
                  <p className="text-xs text-slate-400 font-medium ml-1">L'email ne peut pas être modifié depuis cet écran.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="tel" 
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" 
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {!loading && !['profile', 'immobilier', 'security', 'system'].includes(activeTab) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-slate-500"
            >
              <Lock size={48} className="text-slate-300 mb-4" />
              <p className="font-semibold text-lg text-slate-700">Section en cours de développement</p>
              <p className="text-sm">Ces paramètres seront bientôt disponibles.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;