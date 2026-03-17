import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MapPin, BedDouble, Square, ChevronRight, Loader2, Home, Building, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/UI/Modal';
import PropertyForm from './PropertyForm';

const PropertiesList = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await api.get('/api/immobilier/biens/');
      setProperties(response.data);
    } catch (error) {
      console.error('Erreur propriétés:', error);
      // Fallback local UI si le backend n'est pas encore prêt/lancé
      setProperties([
        { id: 1, name: 'Appartement T3 - Lyon 6', address: '12 Rue de la Paix, 69006 Lyon', type: 'Appartement', surface: 75, rooms: 3, status: 'RENTED', price: 1250 },
        { id: 2, name: 'Studio Moderne - Paris', address: '45 Avenue Foch, 75016 Paris', type: 'Studio', surface: 22, rooms: 1, status: 'VACANT', price: 850 },
        { id: 3, name: 'Villa Contemporaine', address: '8 Impasse des Oliviers, 06000 Nice', type: 'Maison', surface: 180, rooms: 6, status: 'UNDER_WORK', price: 3500 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      RENTED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      VACANT: 'bg-amber-50 text-amber-600 border-amber-100',
      UNDER_WORK: 'bg-red-50 text-red-600 border-red-100',
      // Handling old mock statuses just in case
      OCCUPIED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      MAINTENANCE: 'bg-red-50 text-red-600 border-red-100',
    };
    const labels = {
      RENTED: 'Loué',
      VACANT: 'Vacant',
      UNDER_WORK: 'En travaux',
      OCCUPIED: 'Loué',
      MAINTENANCE: 'En travaux',
    };
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm backdrop-blur-md ${styles[status] || 'bg-slate-50 text-slate-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight leading-tight mb-2">Patrimoine</h1>
          <p className="text-slate-500 font-medium text-lg">Gérez vos biens immobiliers et suivez leurs statuts.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-xl shadow-indigo-200"
        >
          <Plus size={20} />
          Ajouter un bien
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, ville, adresse..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-4 py-4 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl text-base font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all"
          />
        </div>
        <div className="flex bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-x-auto hide-scrollbar">
          {['ALL', 'VACANT', 'RENTED', 'UNDER_WORK'].map(status => {
             const labels = { ALL: 'Tous', VACANT: 'Vacants', RENTED: 'Loués', UNDER_WORK: 'Travaux' };
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
      ) : filteredProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem]">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <Building size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Aucun bien trouvé</h3>
          <p className="text-slate-500 mt-2">Modifiez vos filtres ou ajoutez un nouveau bien.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div 
              key={property.id}
              onClick={() => navigate(`/dashboard/properties/${property.id}`)}
              className="bg-white/50 hover:bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 cursor-pointer group flex flex-col"
            >
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/prop-${property.id}/800/400`} 
                  alt={property.name || property.reference}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute top-4 right-4">
                  {getStatusBadge(property.status)}
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold text-white border border-white/20 shadow-sm">
                    {property.type || property.property_type || 'Bien'}
                  </span>
                  <span className="text-2xl font-black text-white drop-shadow-md">
                    {property.price || property.base_rent_hc} é
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-800 mb-2 truncate">{property.name || property.reference}</h3>
                <div className="flex items-start gap-2 text-slate-500 text-sm mb-6">
                  <MapPin size={16} className="shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">{property.address}, {property.city}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-200/60 mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Square size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Surface</p>
                      <p className="text-sm font-black text-slate-800">{property.surface || property.surface_area} mé</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <BedDouble size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Piéces</p>
                      <p className="text-sm font-black text-slate-800">{property.rooms || property.rooms_count}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Ajouter un nouveau bien"
      >
        <PropertyForm onSuccess={() => {
          setIsModalOpen(false);
          fetchProperties();
        }} />
      </Modal>
    </div>
  );
};

export default PropertiesList;
