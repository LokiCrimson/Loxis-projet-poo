import api from './api';

export const getAllAlertes = async (params?: Record<string, string>) => {
  return api.get('/systeme/alertes/', { params });
};

export const marquerAlerteLue = async (id: number) => {
  return api.post(`/systeme/alertes/${id}/marquer-lu/`);
};

export const marquerToutesLues = async () => {
  return api.post('/systeme/alertes/marquer-tout-lu/');
};
