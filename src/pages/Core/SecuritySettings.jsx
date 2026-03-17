import React, { useState } from 'react';
import { Shield, Key, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const SecuritySettings = ({ profileData }) => {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    const handleEnable2FA = async () => {
        setLoading(true);
        try {
            await api.post('/api/utilisateurs/2fa/activer/');
            setMsg({ type: 'success', text: 'Une fois configuré, un QR code sera disponible.' });
            // In a real flow, you show the QR code here
        } catch (err) {
            setMsg({ type: 'error', text: 'Erreur lors de l\'activation du 2FA.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        setLoading(true);
        try {
            await api.post('/api/utilisateurs/2fa/desactiver/');
            setMsg({ type: 'success', text: '2FA désactivé avec succès.' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Erreur lors de la désactivation du 2FA.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Shield size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Paramètres de sécurité</h2>
                    <p className="text-slate-500 font-medium text-sm">Gérez la sécurité de votre compte et l'authentification.</p>
                </div>
            </div>

            {msg && (
                <div className={`p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {msg.text}
                </div>
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex items-start gap-4">
                        <Smartphone className="text-slate-400 mt-1" size={24} />
                        <div>
                            <h3 className="font-bold text-slate-800">Authentification à deux facteurs (2FA)</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-md">Ajoute une couche de sécurité supplémentaire à votre compte en demandant un code en plus de votre mot de passe.</p>
                        </div>
                    </div>
                    <div>
                        {profileData?.is_two_factor_enabled ? (
                            <button onClick={handleDisable2FA} disabled={loading} className="px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors">Désactiver</button>
                        ) : (
                            <button onClick={handleEnable2FA} disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">Activer le 2FA</button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex items-start gap-4">
                        <Key className="text-slate-400 mt-1" size={24} />
                        <div>
                            <h3 className="font-bold text-slate-800">Mot de passe</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-md">Il est recommandé de changer votre mot de passe régulièrement pour des raisons de sécurité.</p>
                        </div>
                    </div>
                    <div>
                        <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 shadow-sm transition-all">Modifier</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;