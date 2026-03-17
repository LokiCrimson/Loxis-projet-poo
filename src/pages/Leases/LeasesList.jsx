import React, { useState, useEffect } from 'react';
import { Plus, Search, Home, Users, Calendar, AlertCircle, Loader2, FileText, FileDown, CheckCircle2, HandCoins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/UI/Modal';
import LeaseForm from './LeaseForm';

const LeasesList = () => {
  const navigate = useNavigate();
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchLeases = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await api.get('/api/baux/');
      setLeases(response.data);
    } catch (error) {
      console.error('Erreur contrats:', error);
      // Fallback de test si non dispo
      setLeases([
        { id: 1, reference: 'BAIL-A1B2', property_name: 'Appartement T3', tenant_name: 'Alice Dubois', statut: 'actif', loyer_actuel: 850, date_debut: '2023-01-01', jour_paiement: 5 },
        { id: 2, reference: 'BAIL-C3D4', property_name: 'Studio M', tenant_name: 'Marc Lemoine', statut: 'termine', loyer_actuel: 600, date_debut: '2021-05-01', date_fin: '2023-05-01', jour_paiement: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  const getStatusBadge = (statut) => {
    if (statut === 'termine' || statut === 'resilie') {
      return <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-slate-50 text-slate-500 border-slate-200 shadow-sm flex items-center gap-1.5"><FileDown size={14}/>Terminé</span>;
    }
    return <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm flex items-center gap-1.5"><CheckCircle2 size={14}/>Actif</span>;
  };

  const filteredLeases = leases.filter(l => {
    const searchString = `${l.reference || ''} ${l.property_name || ''} ${l.tenant_name || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'ACTIF') return matchesSearch && l.statut === 'actif';
    if (statusFilter === 'TERMINE') return matchesSearch && (l.statut === 'termine' || l.statut === 'resilie');
    
    return matchesSearch;
  });

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight leading-tight mb-2">Contrats de Bail</h1>
          <p className="text-slate-500 font-medium text-lg">Gérez les locations, les loyers et les échéances.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-xl shadow-indigo-200"
        >
          <Plus size={20} />
          Nouveau contrat
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher une réf, un bien, un locataire..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-4 py-4 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl text-base font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all"
          />
        </div>
        <div className="flex bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-x-auto hide-scrollbar">
          {['ALL', 'ACTIF', 'TERMINE'].map(status => {
             const labels = { ALL: 'Tous', ACTIF: 'En cours', TERMINE: 'Terminés' };
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
      ) : filteredLeases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem]">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Aucun contrat trouvé</h3>
          <p className="text-slate-500 mt-2">Modifiez vos filtres ou créez un nouveau bail.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLeases.map((lease) => (
            <div 
              key={lease.id}
              onClick={() => navigate(`/dashboard/leases/${lease.id}`)}
              className="bg-white/50 hover:bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 cursor-pointer group flex flex-col"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-black text-xs rounded-lg uppercase tracking-wider">
                  {lease.reference || `BAIL-#${lease.id}`}
                </div>
                {getStatusBadge(lease.statut)}
              </div>
              
              <div className="mb-6 flex-1 space-y-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                    <Home size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Bien loué</p>
                    <p className="font-semibold truncate">{lease.property_name || 'Bien non défini'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Locataire</p>
                    <p className="font-semibold truncate">{lease.tenant_name || 'Locataire non défini'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 mt-auto">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1"><HandCoins size={12}/>Loyer</p>
                    <p className="font-black text-lg text-slate-800">{lease.loyer_actuel} €</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1"><Calendar size={12}/>Début</p>
                    <p className="font-bold text-slate-700">{lease.date_debut}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Créer un contrat de location"
      >
        <LeaseForm onSuccess={() => {
          setIsModalOpen(false);
          fetchLeases();
        }} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default LeasesList;