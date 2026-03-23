import api from './api';

export const getQuittances = async (params?: Record<string, string>) => {
  return api.get('/finances/quittances/', { params });
};

export const envoyerQuittance = async (id: number) => {
  return api.post(`/finances/quittances/${id}/email/`);
};
