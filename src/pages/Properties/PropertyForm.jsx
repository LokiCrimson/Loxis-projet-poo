import React, { useState, useEffect } from 'react';
import { Loader2, Save, Building, MapPin, Euro, Maximize, Layers, Tag, Hash, FileText } from 'lucide-react';
import api from '../../services/api';

const PropertyForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  
  const [formData, setFormData] = useState({
    reference: '',
    category: '',
    property_type: '',
    address: '',
    city: '',
    zip_code: '',
    surface_area: '',
    rooms_count: '',
    base_rent_hc: '',
    base_charges: '',
    guarantee_deposit: '',
    description: ''
  });

  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [catRes, typesRes] = await Promise.all([
          api.get('/api/immobilier/categories-biens/').catch(() => ({ data: [{id: 1, name: 'Catégorie A'}] })),
          api.get('/api/immobilier/types-biens/').catch(() => ({ data: [{id: 1, category: 1, name: 'Type Standard'}] }))
        ]);
        setCategories(catRes.data);
        setTypes(typesRes.data);
        
        if (catRes.data.length > 0) {
          setFormData(prev => ({ ...prev, category: catRes.data[0].id }));
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
      } finally {
        setInitLoading(false);
      }
    };
    fetchDependencies();
  }, []);

  const filteredTypes = types.filter(t => t.category === parseInt(formData.category) || t.category?.id === parseInt(formData.category));

  useEffect(() => {
    if (filteredTypes.length > 0 && (!formData.property_type || !filteredTypes.find(t => t.id === parseInt(formData.property_type)))) {
      setFormData(prev => ({ ...prev, property_type: filteredTypes[0].id }));
    } else if (filteredTypes.length === 0 && formData.property_type !== '') {
      setFormData(prev => ({ ...prev, property_type: '' }));
    }
  }, [formData.category, types]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/api/immobilier/biens/', formData);
      onSuccess();
    } catch (error) {
      console.error('Erreur création bien:', error.response?.data || error.message);
      if (error.response?.data && typeof error.response.data === 'object') {
        const errors = Object.entries(error.response.data)
          .map(([key, value]) => key + ': ' + (Array.isArray(value) ? value.join(', ') : value))
          .join(' | ');
        setErrorMsg(errors || "Erreur de validation (vérifiez les champs).");
      } else {
        setErrorMsg("Erreur réseau ou validation échouée.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (initLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 flex items-start gap-3">
          <div className="w-2 h-2 mt-1.5 rounded-full bg-red-600 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Référence Unique</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" name="reference" required value={formData.reference} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20" placeholder="Ex: REF-001" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Catégorie</label>
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select name="category" required value={formData.category} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 appearance-none">
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Type de bien</label>
          <div className="relative">
            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select name="property_type" required value={formData.property_type} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 appearance-none">
              {filteredTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Ville</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20" placeholder="Ex: Paris" />
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Adresse compléte</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20" placeholder="Numéro, rue..." />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Code postal</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" name="zip_code" required value={formData.zip_code} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Surface (mé)</label>
          <div className="relative">
            <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="number" step="0.01" name="surface_area" required value={formData.surface_area} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Nombre de piéces</label>
          <div className="relative">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="number" name="rooms_count" required value={formData.rooms_count} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Loyer (HC)</label>
          <div className="relative">
            <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="number" step="0.01" name="base_rent_hc" required value={formData.base_rent_hc} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Charges</label>
          <div className="relative">
            <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="number" step="0.01" name="base_charges" required value={formData.base_charges} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Dépét de garantie</label>
          <div className="relative">
            <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="number" step="0.01" name="guarantee_deposit" required value={formData.guarantee_deposit} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Description (Optionnelle)</label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
            <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 resize-none" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button type="submit" disabled={loading} className="w-full md:w-auto flex justify-center items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {loading ? 'Création...' : 'Enregistrer le bien'}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;
