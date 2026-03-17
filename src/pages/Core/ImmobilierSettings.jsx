import React, { useState, useEffect } from 'react';
import { Building, Plus, Trash2, Loader2 } from 'lucide-react';
import api from '../../services/api';

const ImmobilierSettings = () => {
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [newCat, setNewCat] = useState('');
    const [newType, setNewType] = useState('');
    const [selectedCat, setSelectedCat] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [catRes, typesRes] = await Promise.all([
                api.get('/api/immobilier/categories-biens/'),
                api.get('/api/immobilier/types-biens/')
            ]);
            setCategories(catRes.data);
            setTypes(typesRes.data);
            if (catRes.data.length > 0) setSelectedCat(catRes.data[0].id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/api/immobilier/categories-biens/', { name: newCat });
            setCategories([...categories, data]);
            setNewCat('');
            if (!selectedCat) setSelectedCat(data.id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddType = async (e) => {
        e.preventDefault();
        if (!selectedCat) return;
        try {
            const { data } = await api.post('/api/immobilier/types-biens/', { name: newType, category: selectedCat });
            setTypes([...types, data]);
            setNewType('');
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>;

    return (
        <div className="space-y-12">
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <Building className="text-indigo-500" size={24} />
                    <h2 className="text-xl font-bold text-slate-800">Catégories de bien</h2>
                </div>
                <form onSubmit={handleAddCategory} className="flex gap-4 items-center">
                    <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)} required placeholder="Nouvelle catégorie (ex: Maison)" className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-700 hover:border-slate-300 transition-all" />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"><Plus size={18} /> Ajouter</button>
                </form>
                <div className="mt-6 flex flex-wrap gap-2">
                    {categories.map(c => (
                        <div key={c.id} className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg font-bold text-slate-700">{c.name}</div>
                    ))}
                </div>
            </section>
            
            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-6">Types de bien</h2>
                <form onSubmit={handleAddType} className="flex gap-4 items-center">
                    <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 font-medium text-slate-700">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="text" value={newType} onChange={e => setNewType(e.target.value)} required placeholder="Nouveau type (ex: T3)" className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-700 hover:border-slate-300 transition-all" />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"><Plus size={18} /> Ajouter</button>
                </form>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {types.map(t => (
                        <div key={t.id} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="font-bold text-slate-800">{t.name}</p>
                                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{categories.find(c => c.id === t.category)?.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ImmobilierSettings;