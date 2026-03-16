import api from './api';
import { mockPaiements } from './mock-data-phase2';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const USE_MOCK = true;

export const getPaiements = async (params?: Record<string, string>) => {
  if (USE_MOCK) {
    await delay(500);
    let data = [...mockPaiements];
    if (params?.mois) data = data.filter(p => p.periode_mois === Number(params.mois));
    if (params?.annee) data = data.filter(p => p.periode_annee === Number(params.annee));
    if (params?.statut && params.statut !== 'tous') data = data.filter(p => p.statut === params.statut);
    return { data };
  }
  return api.get('/paiements/', { params });
};

export const enregistrerPaiement = async (id: number, data: Record<string, unknown>) => {
  if (USE_MOCK) { await delay(800); return { data: { id, ...data, statut: 'paye' } }; }
  return api.put(`/paiements/${id}/`, data);
};
