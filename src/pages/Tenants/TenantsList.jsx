import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Mail, Phone, MapPin, AlertCircle, Loader2, Users, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/UI/Modal';
import TenantForm from './TenantForm';

const TenantsList = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await api.get('/api/utilisateurs/locataires/');
      setTenants(response.data);
    } catch (error) {
      console.error('Erreur locataires:', error);
      // Fallback de démo si API non prête
      setTenants([
        { id: 1, first_name: 'Alice', last_name: 'Dubois', email: 'alice@email.com', phone: '06 12 34 56 78', is_active: true, property_name: 'Appartement T3 - Lyon 6', rent_status: 'up_to_date' },
        { id: 2, first_name: 'Marc', last_name: 'Lemoine', email: 'marc@email.com', phone: '07 89 12 34 56', is_active: true, property_name: 'Studio Moderne - Paris', rent_status: 'late' },
        { id: 3, first_name: 'Sophie', last_name: 'Martin', email: 'sophie@email.com', phone: '06 98 76 54 32', is_active: false, property_name: 'Ancien locataire', rent_status: 'up_to_date' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const getStatusBadge = (tenant) => {
    if (!tenant.is_active) {
      return <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-slate-50 text-slate-500 border-slate-200 shadow-sm">Inactif</span>;
    }
    if (tenant.rent_status === 'late') {
      return <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-rose-50 text-rose-600 border-rose-200 shadow-sm">Retard Paiement</span>;
    }
    return <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm">À Jour</span>;
  };

  const filteredTenants = tenants.filter(t => {
    const fullName = `${t.first_name || ''} ${t.last_name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'ACTIVE') return matchesSearch && t.is_active;
    if (statusFilter === 'INACTIVE') return matchesSearch && !t.is_active;
    if (statusFilter === 'LATE') return matchesSearch && t.rent_status === 'late';
    
    return matchesSearch;
  });

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight leading-tight mb-2">Locataires</h1>
          <p className="text-slate-500 font-medium text-lg">Gérez vos locataires, leurs dossiers et leurs paiements.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-xl shadow-indigo-200"
        >
          <Plus size={20} />
          Nouveau locataire
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un nom, un email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-4 py-4 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl text-base font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all"
          />
        </div>
        <div className="flex bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-x-auto hide-scrollbar">
          {['ALL', 'ACTIVE', 'LATE', 'INACTIVE'].map(status => {
             const labels = { ALL: 'Tous', ACTIVE: 'Actifs', LATE: 'En retard', INACTIVE: 'Anciens' };
             return (
               <button 
                 key={status}
                 onClick={() => setStatusFilter(status)}
                 className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                   statusFilter === status 
                     ? 'bg-white text-indigo-600 shadow-sm' 
                     : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                 }`}
               >
                 {labels[status]}
               </button>
             );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold border border-red-100 flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{errorMsg}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem]">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Aucun locataire trouvé</h3>
          <p className="text-slate-500 mt-2">Modifiez vos filtres ou ajoutez un nouveau locataire.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => (
            <div 
              key={tenant.id}
              onClick={() => navigate(`/dashboard/tenants/${tenant.id}`)}
              className="bg-white/50 hover:bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 cursor-pointer group flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm font-black text-xl group-hover:scale-110 transition-transform duration-300">
                  {(tenant.first_name?.[0] || '') + (tenant.last_name?.[0] || '')}
                </div>
                {getStatusBadge(tenant)}
              </div>
              
              <div className="mb-6 flex-1">
                <h3 className="text-xl font-bold text-slate-800 truncate">
                  {tenant.first_name} {tenant.last_name}
                </h3>
                {tenant.property_name && (
                  <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2 truncate">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{tenant.property_name}</span>
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200/60 mt-auto">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Mail size={14} className="text-slate-400" />
                  </div>
                  <span className="truncate font-medium">{tenant.email}</span>
                </div>
                {tenant.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Phone size={14} className="text-slate-400" />
                    </div>
                    <span className="font-medium">{tenant.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Créer un dossier locataire"
      >
        <TenantForm onSuccess={() => {
          setIsModalOpen(false);
          fetchTenants();
        }} />
      </Modal>
    </div>
  );
};

export default TenantsList;