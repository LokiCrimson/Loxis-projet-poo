import api from './api';
import { mockLocataires } from './mock-data-phase2';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const USE_MOCK = true;

export const getLocataires = async (params?: Record<string, string>) => {
  if (USE_MOCK) {
    await delay(500);
    let data = [...mockLocataires];
    if (params?.search) {
      const s = params.search.toLowerCase();
      data = data.filter(l => `${l.nom} ${l.prenom}`.toLowerCase().includes(s) || l.email.toLowerCase().includes(s));
    }
    if (params?.actif === 'true') data = data.filter(l => l.actif);
    if (params?.actif === 'false') data = data.filter(l => !l.actif);
    return { data };
  }
  return api.get('/locataires/', { params });
};

export const getLocataireById = async (id: number) => {
  if (USE_MOCK) {
    await delay(400);
    const loc = mockLocataires.find(l => l.id === id);
    if (!loc) throw new Error('Locataire non trouvé');
    return { data: loc };
  }
  return api.get(`/locataires/${id}/`);
};

export const createLocataire = async (data: Record<string, unknown>) => {
  if (USE_MOCK) { await delay(800); return { data: { ...data, id: mockLocataires.length + 1 } }; }
  return api.post('/locataires/', data);
};

export const updateLocataire = async (id: number, data: Record<string, unknown>) => {
  if (USE_MOCK) { await delay(800); return { data: { ...data, id } }; }
  return api.put(`/locataires/${id}/`, data);
};

export const deleteLocataire = async (id: number) => {
  if (USE_MOCK) { await delay(500); return { data: { success: true } }; }
  return api.delete(`/locataires/${id}/`);
};
