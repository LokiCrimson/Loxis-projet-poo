import api from './api';

export const getLocataires = async (params?: Record<string, string>) => {
  return api.get('/utilisateurs/locataires/', { params });
};

export const getLocataireById = async (id: number) => {
  return api.get(`/utilisateurs/locataires/${id}/`);
};

export const createLocataire = async (data: Record<string, unknown>) => {
  return api.post('/utilisateurs/locataires/', data);
};

export const updateLocataire = async (id: number, data: Record<string, unknown>) => {
  return api.put(`/utilisateurs/locataires/${id}/`, data);
};

export const deleteLocataire = async (id: number) => {
  return api.delete(`/utilisateurs/locataires/${id}/`);
};
