import api from './api';
import { mockQuittances } from './mock-data-phase2';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const USE_MOCK = true;

export const getQuittances = async (params?: Record<string, string>) => {
  if (USE_MOCK) {
    await delay(500);
    let data = [...mockQuittances];
    if (params?.search) {
      const s = params.search.toLowerCase();
      data = data.filter(q => q.numero.toLowerCase().includes(s) || q.locataire.toLowerCase().includes(s));
    }
    return { data };
  }
  return api.get('/quittances/', { params });
};

export const envoyerQuittance = async (id: number) => {
  if (USE_MOCK) { await delay(800); return { data: { id, envoyee: true, date_envoi: new Date().toISOString() } }; }
  return api.post(`/quittances/${id}/envoyer/`);
};
