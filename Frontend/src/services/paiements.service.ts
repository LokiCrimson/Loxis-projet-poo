import api from './api';

export const getPaiements = async (params?: Record<string, string>) => {
  return api.get('/finances/paiements/', { params });
};

export const enregistrerPaiement = async (id: number, data: Record<string, unknown>) => {
  return api.put(`/finances/paiements/${id}/`, data);
};

export const exportPaiementsCsv = async () => {
  const response = await api.get('/finances/export/', {
    responseType: 'blob'
  });
  return response.data;
};
