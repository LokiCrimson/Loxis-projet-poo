import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Download } from 'lucide-react';
import api from '../../services/api';

const AuditLogsList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/api/systeme/journal-audit/');
        setLogs(response.data);
      } catch (error) {
        console.error('Erreur audit:', error);
        // Mock pour démo
        setLogs([
          { id: 1, action: 'Connexion', user: 'Jean Dupont', details: 'IP: 192.168.1.1', created_at: '2026-03-16 14:30' },
          { id: 2, action: 'Modification Bien', user: 'Admin', details: 'ID Bien: 45 - Changement prix', created_at: '2026-03-16 12:15' },
          { id: 3, action: 'Suppression Locataire', user: 'Jean Dupont', details: 'ID Locataire: 892', created_at: '2026-03-16 10:05' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Journal d'Audit</h1>
          <p className="text-slate-500">Suivi complet des actions effectuées sur la plateforme.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
          <Download size={18} />
          Exporter CSV
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher une action, un utilisateur..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">
            <Filter size={18} />
            Filtres avancés
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date & Heure</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Utilisateur</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <History size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{log.created_at}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-semibold text-slate-600">{log.user}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm text-slate-500 font-medium">{log.details}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-slate-50 flex justify-between items-center">
          <p className="text-sm text-slate-400 font-medium">Affichage de {logs.length} entrées</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed">Précédent</button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 hover:bg-slate-50">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsList;
