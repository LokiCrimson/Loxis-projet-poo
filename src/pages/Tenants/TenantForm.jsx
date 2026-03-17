import React, { useState } from 'react';
import { Mail, Phone, Briefcase, CreditCard, Save, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const TenantForm = ({ tenant, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: tenant?.first_name || '',
    last_name: tenant?.last_name || '',
    email: tenant?.email || '',
    phone: tenant?.phone || '',
    profession: tenant?.profession || '',
    id_type: tenant?.id_type || 'ID_CARD',
    id_number: tenant?.id_number || '',
    monthly_income: tenant?.monthly_income || '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name] || errors.non_field_errors) {
      setErrors(prev => ({ ...prev, [name]: null, non_field_errors: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (tenant?.id) {
        await api.put(`/api/utilisateurs/locataires/${tenant.id}/`, formData);
      } else {
        await api.post('/api/utilisateurs/locataires/', formData);
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erreur form locataire:', error);
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

  const hasAnyError = Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {hasAnyError && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-sm font-semibold border border-rose-100 flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p>Veuillez corriger les erreurs ci-dessous.</p>
            {errors.non_field_errors && (
                <p className="mt-1 font-bold">{errors.non_field_errors}</p>
            )}
            {errors.detail && (
                <p className="mt-1 font-bold">{errors.detail}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Prénom *</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 transition-all ${errors.first_name ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/50' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-300'}`}
            placeholder="Jean"
          />
          {renderError('first_name')}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Nom *</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 transition-all ${errors.last_name ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/50' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-300'}`}
            placeholder="Dupont"
          />
          {renderError('last_name')}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Email *</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 transition-all ${errors.email ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/50' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-300'}`}
              placeholder="jean.dupont@email.com"
            />
          </div>
          {renderError('email')}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Téléphone</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 transition-all ${errors.phone ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/50' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-300'}`}
              placeholder="06 12 34 56 78"
            />
          </div>
          {renderError('phone')}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Profession</label>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 transition-all ${errors.profession ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/50' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-300'}`}
              placeholder="Cadre, Indépendant..."
            />
          </div>
          {renderError('profession')}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Type de pièce d'identité</label>
          <select
            name="id_type"
            value={formData.id_type}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 transition-all ${errors.id_type ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/50' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-300'}`}
          >
            <option value="ID_CARD">Carte d'Identité</option>
            <option value="PASSPORT">Passeport</option>
            <option value="RESIDENCE_PERMIT">Titre de Séjour</option>
          </select>
          {renderError('id_type')}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Numéro de pièce</label>
          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              name="id_number"
              value={formData.id_number}
              onChange={handleChange}
              className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 transition-all ${errors.id_number ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/50' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-300'}`}
              placeholder="Numéro de document"
            />
          </div>
          {renderError('id_number')}
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
          {tenant?.id ? 'Enregistrer les modifications' : 'Créer le locataire'}
        </button>
      </div>
    </form>
  );
};

export default TenantForm;