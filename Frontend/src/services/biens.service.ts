import api from './api';

export const getBiens = async (params?: Record<string, string>) => {
  return api.get('/immobilier/biens/', { params });
};

export const getBienById = async (id: number) => {
  return api.get(`/immobilier/biens/${id}/`);
};

export const createBien = async (data: Record<string, unknown>) => {
  return api.post('/immobilier/biens/', data);
};

export const updateBien = async (id: number, data: Record<string, unknown>) => {
  return api.put(`/immobilier/biens/${id}/`, data);
};

export const deleteBien = async (id: number) => {
  return api.delete(`/immobilier/biens/${id}/`);
};

export const getCategories = async () => {
  return api.get('/immobilier/categories-biens/');
};

export const getTypesBien = async () => {
  return api.get('/immobilier/types-biens/');
};

export const getPhotosBien = async (bienId: number) => {
  return api.get(`/immobilier/biens/${bienId}/photos/`);
};

export const deletePhotoBien = async (bienId: number, photoId: number) => {
  return api.delete(`/immobilier/biens/${bienId}/photos/${photoId}/`);
};

export const getDepensesByBien = async (bienId: number) => {
  return api.get(`/finances/depenses/?property_id=${bienId}`);
};

export const uploadPhotoBien = async (bienId: number, file: File, isMain: boolean = false) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('is_main', isMain.toString());
  return api.post(`/immobilier/biens/${bienId}/photos/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
