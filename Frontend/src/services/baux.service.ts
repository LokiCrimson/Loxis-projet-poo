import api from './api';

export const getBaux = async (params?: Record<string, string>) => {
  return api.get('/baux/', { params });
};

export const getBailById = async (id: number) => {
  return api.get(`/baux/${id}/`);
};

export const createBail = async (data: Record<string, unknown>) => {
  return api.post('/baux/', data);
};

export const resilierBail = async (id: number, data: Record<string, unknown>) => {
  return api.post(`/baux/${id}/resilier/`, data);
};

export const toggleSuiviBail = async (id: number) => {
  return api.post(`/baux/${id}/toggle_suivi/`);
};
