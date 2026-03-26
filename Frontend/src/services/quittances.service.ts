import api from './api';

export const getQuittances = async (params?: Record<string, string>) => {
  return api.get('/finances/quittances/', { params });
};

export const envoyerQuittance = async (id: number) => {
  return api.post(`/finances/quittances/${id}/email/`);
};

export const downloadQuittance = async (id: number) => {
  const response = await api.get(`/finances/quittances/${id}/pdf/`, {
    responseType: 'blob'
  });
  return response.data;
};

export const exportQuittancesCsv = async () => {
  const response = await api.get('/finances/export/', {
    responseType: 'blob'
  });
  return response.data;
};
