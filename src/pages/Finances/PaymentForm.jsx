import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function PaymentForm({ onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    bail: '',
    montant_paye: '',
    date_paiement: new Date().toISOString().split('T')[0],
    moyen_paiement: 'virement',
    reference_transaction: ''
  });
  
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        // Idéalement on récupère que les baux actifs
        const res = await api.get('/api/baux/');
        setLeases(res.data);
      } catch(e) {
        console.error('Erreur locataires pour paiements:', e);
      }
    };
    fetchLeases();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/api/finances/paiements/', formData);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Save error:', error);
      setErrorMsg(error.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-3">
          <AlertCircle size={20} />
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Bail concerné</label>
        <select
          name="bail"
          value={formData.bail}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
        >
          <option value="">Sélectionnez un bail...</option>
          {leases.map(l => (
            <option key={l.id} value={l.id}>Bail #{l.id} - Loyer: {l.loyer_base}€</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Montant payé (€)</label>
          <input
            type="number"
            step="0.01"
            name="montant_paye"
            value={formData.montant_paye}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
            placeholder="Ex: 850"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Date de paiement</label>
          <input
            type="date"
            name="date_paiement"
            value={formData.date_paiement}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Moyen de paiement</label>
          <select
            name="moyen_paiement"
            value={formData.moyen_paiement}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
          >
            <option value="virement">Virement</option>
            <option value="prelevement">Prélèvement</option>
            <option value="cheque">Chèque</option>
            <option value="especes">Espèces</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Référence (Optionnel)</label>
          <input
            type="text"
            name="reference_transaction"
            value={formData.reference_transaction}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
            placeholder="Numéro de chèque, transaction..."
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : (
            <>
              <Save size={20} />
              Enregistrer
            </>
          )}
        </button>
      </div>
    </form>
  );
}
