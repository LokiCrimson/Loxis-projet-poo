import React, { useState, useEffect } from 'react';
import { Save, Calendar, FileText, CreditCard, AlertCircle, Home, Users, Hash } from 'lucide-react';
import api from '../../services/api';

const LeaseForm = ({ lease, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    bien_id: lease?.bien_id || '',
    locataire_id: lease?.locataire_id || '',
    reference: lease?.reference || '',
    date_debut: lease?.date_debut || '',
    date_fin: lease?.date_fin || '',
    loyer_initial: lease?.loyer_initial || '',
    loyer_actuel: lease?.loyer_actuel || '',
    charges: lease?.charges || 0,
    depot_garantie_verse: lease?.depot_garantie_verse || 0,
    jour_paiement: lease?.jour_paiement || 5,
    statut: lease?.statut || 'actif',
  });

  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDeps, setFetchingDeps] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        setFetchingDeps(true);
        const [propsRes, docsRes] = await Promise.all([
          api.get('/api/immobilier/biens/'),
          api.get('/api/utilisateurs/locataires/')
        ]);
        setProperties(propsRes.data.results || propsRes.data);
        setTenants(docsRes.data.results || docsRes.data);
      } catch (err) {
        console.error('Erreur chargement dépendances baux:', err);
      } finally {
        setFetchingDeps(false);
      }
    };
    fetchDependencies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
        // Auto-sync loyer_actuel if loyer_initial changes and form is in creation mode
        if (name === 'loyer_initial' && !lease?.id) {
            return { ...prev, [name]: value, loyer_actuel: value };
        }
        return { ...prev, [name]: value };
    });
    if (errors[name] || errors.non_field_errors) {
      setErrors(prev => ({ ...prev, [name]: null, non_field_errors: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Formatting payload
    const payload = {
        bien: formData.bien_id,
        locataire: formData.locataire_id,
        reference: formData.reference,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin || null,
        loyer_initial: formData.loyer_initial,
        loyer_actuel: formData.loyer_actuel,
        charges: formData.charges,
        depot_garantie_verse: formData.depot_garantie_verse,
        jour_paiement: formData.jour_paiement,
        statut: formData.statut,
    };

    try {
      if (lease?.id) {
        await api.put(`/api/baux/${lease.id}/`, payload);
      } else {
        await api.post('/api/baux/', payload);
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erreur form bail:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ non_field_errors: ['Une erreur inattendue est survenue'] });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) => {
    if (!errors[field]) return null;
    const msg = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
    return <p className="text-rose-500 text-xs font-semibold mt-1.5 flex items-center gap-1"><AlertCircle size={12}/>{msg}</p>;
  };

  const inputClasses = (hasError) => 
    `w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 transition-all ${hasError ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/50' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-300'}`;

  if (fetchingDeps) {
      return (
          <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Chargement des biens et locataires...</p>
          </div>
      );
  }

  const hasAnyError = Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {hasAnyError && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-sm font-semibold border border-rose-100 flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p>Veuillez corriger les erreurs ci-dessous.</p>
            {errors.non_field_errors && <p className="mt-1 font-bold">{errors.non_field_errors}</p>}
            {errors.detail && <p className="mt-1 font-bold">{errors.detail}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* LIAISONS */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Home size={14}/> Bien immobilier *</label>
          <select
            name="bien_id"
            value={formData.bien_id}
            onChange={handleChange}
            required
            className={inputClasses(errors.bien)}
          >
            <option value="">Sélectionner un bien...</option>
            {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name || p.reference}</option>
            ))}
          </select>
          {renderError('bien')}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Users size={14}/> Locataire *</label>
          <select
            name="locataire_id"
            value={formData.locataire_id}
            onChange={handleChange}
            required
            className={inputClasses(errors.locataire)}
          >
            <option value="">Sélectionner un locataire...</option>
            {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
            ))}
          </select>
          {renderError('locataire')}
        </div>

        {/* DATES */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Date de début *</label>
          <input
            type="date"
            name="date_debut"
            value={formData.date_debut}
            onChange={handleChange}
            required
            className={inputClasses(errors.date_debut)}
          />
          {renderError('date_debut')}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Date de fin (optionnel)</label>
          <input
            type="date"
            name="date_fin"
            value={formData.date_fin}
            onChange={handleChange}
            className={inputClasses(errors.date_fin)}
          />
          {renderError('date_fin')}
        </div>

        {/* FINANCES */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Loyer initial (€) *</label>
          <input
            type="number"
            step="0.01"
            name="loyer_initial"
            value={formData.loyer_initial}
            onChange={handleChange}
            required
            className={inputClasses(errors.loyer_initial)}
            placeholder="Ex: 850.00"
          />
          {renderError('loyer_initial')}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Charges (€)</label>
          <input
            type="number"
            step="0.01"
            name="charges"
            value={formData.charges}
            onChange={handleChange}
            className={inputClasses(errors.charges)}
            placeholder="Ex: 50.00"
          />
          {renderError('charges')}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Dépôt de garantie (€)</label>
          <input
            type="number"
            step="0.01"
            name="depot_garantie_verse"
            value={formData.depot_garantie_verse}
            onChange={handleChange}
            className={inputClasses(errors.depot_garantie_verse)}
            placeholder="Ex: 850.00"
          />
          {renderError('depot_garantie_verse')}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 title-case">Jour de paiement (1-28) *</label>
          <input
            type="number"
            min="1"
            max="28"
            name="jour_paiement"
            value={formData.jour_paiement}
            onChange={handleChange}
            required
            className={inputClasses(errors.jour_paiement)}
          />
          {renderError('jour_paiement')}
        </div>

        {/* STATUS & REF */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Hash size={14}/> Référence bail (optionnel)</label>
          <input
            type="text"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            className={inputClasses(errors.reference)}
            placeholder="Laissé vide = généré automatiquement"
          />
          {renderError('reference')}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Statut</label>
          <select
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            className={inputClasses(errors.statut)}
          >
            <option value="actif">Actif</option>
            <option value="termine">Terminé</option>
            <option value="resilie">Résilié</option>
          </select>
          {renderError('statut')}
        </div>

      </div>

      <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end gap-3">
        {onClose && (
            <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
            >
            Annuler
            </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {lease?.id ? 'Mettre à jour le contrat' : 'Créer le contrat'}
        </button>
      </div>
    </form>
  );
};

export default LeaseForm;
