import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Download, 
  Loader2,
  Building2,
  Calendar,
  Briefcase,
  Wallet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // profile, documents, guarantor

  const fetchTenant = async () => {
    try {
      const response = await api.get(`/api/utilisateurs/locataires/${id}/`);
      setTenant(response.data);
    } catch (error) {
      console.error('Erreur détail locataire:', error);
      // Mock pour démo
      setTenant({
        id,
        first_name: 'Alice',
        last_name: 'Martin',
        email: 'alice.martin@email.com',
        phone: '06 12 34 56 78',
        status: 'ACTIVE',
        profession: 'Ingénieur Logiciel',
        income: 3200,
        property_name: 'Appartement T3 - Lyon 6',
        lease_start: '2025-01-01',
        guarantor: {
          name: 'Robert Martin',
          relation: 'Père',
          income: 5500,
          profession: 'Médecin',
          email: 'robert.m@email.com'
        },
        documents: [
          { id: 1, name: 'Pièce d\'identité', type: 'PDF', date: '2024-12-15' },
          { id: 2, name: 'Contrat de travail', type: 'PDF', date: '2024-12-15' },
          { id: 3, name: '3 derniers bulletins de salaire', type: 'ZIP', date: '2024-12-15' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard/tenants')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          Retour à la liste
        </button>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
            Modifier le dossier
          </button>
          <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Contacter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Tabs */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-inner">
                {tenant.first_name[0]}{tenant.last_name[0]}
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">{tenant.first_name} {tenant.last_name}</h1>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <Mail size={16} />
                    {tenant.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <Phone size={16} />
                    {tenant.phone}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit mb-8">
              {[
                { id: 'profile', label: 'Profil', icon: User },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'guarantor', label: 'Garant', icon: ShieldCheck },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                        <Briefcase size={18} />
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Situation Pro</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{tenant.profession}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                        <Wallet size={18} />
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Revenus Mensuels</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{tenant.income} € net / mois</p>
                  </div>
                </div>

                <div className="p-8 bg-indigo-600 rounded-[2rem] text-white flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Dossier Validé</h3>
                    <p className="text-indigo-100 opacity-80 text-sm">Ce locataire a passé tous les contrôles de solvabilité.</p>
                  </div>
                  <CheckCircle2 size={48} className="text-indigo-300 opacity-50" />
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                {tenant.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                        <FileText size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.type} • Ajouté le {doc.date}</p>
                      </div>
                    </div>
                    <button className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm">
                      <Download size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'guarantor' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2rem]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-black">
                      {tenant.guarantor.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{tenant.guarantor.name}</h3>
                      <p className="text-sm text-slate-500">{tenant.guarantor.relation}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profession</p>
                      <p className="text-sm font-bold text-slate-900">{tenant.guarantor.profession}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenus</p>
                      <p className="text-sm font-bold text-slate-900">{tenant.guarantor.income} € / mois</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                      <p className="text-sm font-bold text-slate-900">{tenant.guarantor.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Lease Info */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl text-white">
            <h3 className="text-xl font-bold mb-6">Location Actuelle</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                  <Building2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Bien</p>
                  <p className="font-bold text-sm">{tenant.property_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Début du bail</p>
                  <p className="font-bold text-sm">{tenant.lease_start}</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20">
              Voir le contrat
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-indigo-600" size={24} />
              <h3 className="text-xl font-bold text-slate-900">Actions Rapides</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-bold text-slate-700 text-left transition-all flex items-center justify-between">
                Générer quittance
                <ChevronRight size={16} className="text-slate-400" />
              </button>
              <button className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-bold text-slate-700 text-left transition-all flex items-center justify-between">
                Régularisation charges
                <ChevronRight size={16} className="text-slate-400" />
              </button>
              <button className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-bold text-red-600 text-left transition-all flex items-center justify-between">
                Signaler un impayé
                <ChevronRight size={16} className="text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDetail;
