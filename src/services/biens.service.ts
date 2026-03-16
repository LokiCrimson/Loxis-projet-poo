import api from './api';
import { mockBiens, mockCategories, mockTypesBien, mockDepenses } from './mock-data';

// Mock delay to simulate API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const USE_MOCK = true;

export const getBiens = async (params?: Record<string, string>) => {
  if (USE_MOCK) {
    await delay(600);
    let filtered = [...mockBiens];
    if (params?.statut && params.statut !== 'tous') {
      filtered = filtered.filter(b => b.statut === params.statut);
    }
    if (params?.categorie && params.categorie !== 'tous') {
      filtered = filtered.filter(b => b.categorie === params.categorie);
    }
    if (params?.ville && params.ville !== 'tous') {
      filtered = filtered.filter(b => b.ville === params.ville);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(b =>
        b.adresse.toLowerCase().includes(s) ||
        b.reference.toLowerCase().includes(s) ||
        b.ville.toLowerCase().includes(s)
      );
    }
    return { data: filtered };
  }
  return api.get('/biens/', { params });
};

export const getBienById = async (id: number) => {
  if (USE_MOCK) {
    await delay(400);
    const bien = mockBiens.find(b => b.id === id);
    if (!bien) throw new Error('Bien non trouvé');
    return { data: bien };
  }
  return api.get(`/biens/${id}/`);
};

export const createBien = async (data: Record<string, unknown>) => {
  if (USE_MOCK) {
    await delay(800);
    const newBien = { ...data, id: mockBiens.length + 1, date_creation: new Date().toISOString() };
    return { data: newBien };
  }
  return api.post('/biens/', data);
};

export const updateBien = async (id: number, data: Record<string, unknown>) => {
  if (USE_MOCK) {
    await delay(800);
    return { data: { ...data, id } };
  }
  return api.put(`/biens/${id}/`, data);
};

export const deleteBien = async (id: number) => {
  if (USE_MOCK) {
    await delay(500);
    return { data: { success: true } };
  }
  return api.delete(`/biens/${id}/`);
};

export const getCategories = async () => {
  if (USE_MOCK) {
    await delay(200);
    return { data: mockCategories };
  }
  return api.get('/categories/');
};

export const getTypesBien = async () => {
  if (USE_MOCK) {
    await delay(200);
    return { data: mockTypesBien };
  }
  return api.get('/types-bien/');
};

export const getDepensesByBien = async (bienId: number) => {
  if (USE_MOCK) {
    await delay(400);
    return { data: mockDepenses.filter(d => d.bien_id === bienId) };
  }
  return api.get(`/biens/${bienId}/depenses/`);
};
