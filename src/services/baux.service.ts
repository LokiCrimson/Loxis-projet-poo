import api from './api';
import { mockBauxFull } from './mock-data-phase2';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const USE_MOCK = true;

export const getBaux = async (params?: Record<string, string>) => {
  if (USE_MOCK) {
    await delay(500);
    let data = [...mockBauxFull];
    if (params?.statut && params.statut !== 'tous') data = data.filter(b => b.statut === params.statut);
    if (params?.search) {
      const s = params.search.toLowerCase();
      data = data.filter(b => b.reference.toLowerCase().includes(s) || b.locataire_nom.toLowerCase().includes(s) || b.bien_reference.toLowerCase().includes(s));
    }
    return { data };
  }
  return api.get('/baux/', { params });
};

export const getBailById = async (id: number) => {
  if (USE_MOCK) {
    await delay(400);
    const bail = mockBauxFull.find(b => b.id === id);
    if (!bail) throw new Error('Bail non trouvé');
    return { data: bail };
  }
  return api.get(`/baux/${id}/`);
};

export const createBail = async (data: Record<string, unknown>) => {
  if (USE_MOCK) { await delay(800); return { data: { ...data, id: mockBauxFull.length + 1 } }; }
  return api.post('/baux/', data);
};

export const resilierBail = async (id: number, data: Record<string, unknown>) => {
  if (USE_MOCK) { await delay(800); return { data: { id, statut: 'resilie', ...data } }; }
  return api.post(`/baux/${id}/resilier/`, data);
};
