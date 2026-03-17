import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertCircle, Loader2, CreditCard, ChevronRight, Download, HandCoins, ArrowRightLeft, FileText, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/UI/Modal';
import PaymentForm from './PaymentForm';

export default function FinancesList() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await api.get('/api/finances/paiements/');
      setPayments(response.data);
    } catch (error) {
      console.error('Erreur paiements:', error);
      // Fallback
      setPayments([
        { id: 1, reference: 'PAY-10293', date_paiement: '2023-11-05', montant_paye: 850, montant_attendu: 850, statut: 'paye', tenant_name: 'Alice Dubois', property_name: 'Appartement T3', moyen: 'virement' },
        { id: 2, reference: 'PAY-10294', date_paiement: '2023-11-01', montant_paye: 500, montant_attendu: 600, statut: 'partiel', tenant_name: 'Marc Lemoine', property_name: 'Studio M', moyen: 'especes' },
        { id: 3, reference: 'PAY-10295', date_paiement: '', montant_paye: 0, montant_attendu: 700, statut: 'en_attente', tenant_name: 'Sophie Martin', property_name: 'Maison', moyen: '' },
        { id: 4, reference: 'PAY-10296', date_paiement: '', montant_paye: 0, montant_attendu: 600, statut: 'impaye', tenant_name: 'Marc Lemoine', property_name: 'Studio M', moyen: '' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusBadge = (statut) => {
    switch(statut) {
      case 'paye': return <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm flex items-center gap-1.5"><CheckCircle2 size={14}/>Payé</span>;
      case 'partiel': return <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-orange-50 text-orange-600 border-orange-200 shadow-sm flex items-center gap-1.5"><ArrowRightLeft size={14}/>Partiel</span>;
      case 'impaye': return <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-rose-50 text-rose-600 border-rose-200 shadow-sm flex items-center gap-1.5"><AlertCircle size={14}/>Impayé</span>;
      default: return <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-slate-50 text-slate-500 border-slate-200 shadow-sm flex items-center gap-1.5"><Clock size={14}/>En attente</span>;
    }
  };

  const filteredPayments = payments.filter(p => {
    const searchString = `${p.reference || ''} ${p.tenant_name || ''} ${p.property_name || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'PAYE') return matchesSearch && p.statut === 'paye';
    if (statusFilter === 'ATTENTE') return matchesSearch && (p.statut === 'en_attente' || p.statut === 'impaye' || p.statut === 'partiel');
    
    return matchesSearch;
  });

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight leading-tight mb-2">Paiements</h1>
          <p className="text-slate-500 font-medium text-lg">Suivi des loyers, encaissements et quittances.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-xl shadow-indigo-200"
        >
          <Plus size={20} />
          Saisir un paiement
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher une réf, locataire, bien..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-4 py-4 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl text-base font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all"
          />
        </div>
        <div className="flex bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-x-auto hide-scrollbar">
          {['ALL', 'PAYE', 'ATTENTE'].map(status => {
             const labels = { ALL: 'Tous', PAYE: 'Encaissés', ATTENTE: 'En attente / Impayés' };
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
      ) : filteredPayments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem]">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <CreditCard size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Aucun paiement trouvé</h3>
          <p className="text-slate-500 mt-2">Modifiez vos filtres ou enregistrez un paiement.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPayments.map((p) => (
            <div 
              key={p.id}
              className="bg-white/50 hover:bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg uppercase tracking-wider">
                  {p.reference || `PAY-${p.id}`}
                </div>
                {getStatusBadge(p.statut)}
              </div>
              
              <div className="mb-6 flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  {p.montant_paye} € <span className="text-sm font-medium text-slate-400">/ {p.montant_attendu} €</span>
                </h3>
                <p className="text-sm font-semibold text-indigo-600 mb-1">{p.tenant_name || 'Locataire inconnu'}</p>
                <p className="text-sm font-medium text-slate-500 truncate">{p.property_name || 'Bien inconnu'}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 mt-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Clock size={14} />
                  {p.date_paiement || 'Non payé'}
                </div>
                {p.statut === 'paye' && (
                  <button className="flex items-center justify-center p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors" title="Télécharger la quittance">
                    <Download size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Saisir un paiement"
      >
        <PaymentForm onSuccess={() => {
          setIsModalOpen(false);
          fetchPayments();
        }} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
