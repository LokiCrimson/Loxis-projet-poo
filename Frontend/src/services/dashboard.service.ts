import api from './api';

export const getDashboardStats = async (proprietaireId?: number) => {
  return api.get('/systeme/dashboard/stats/', { params: { proprietaire_id: proprietaireId } });
};

export const getRevenueChart = async (proprietaireId?: number) => {
  return api.get('/systeme/dashboard/revenue-chart/', { params: { proprietaire_id: proprietaireId } });
};

export const getAlertes = async (params?: Record<string, string>, proprietaireId?: number) => {
  return api.get('/systeme/alertes/', { params: { ...params, proprietaire_id: proprietaireId } });
};

export const getBienStatuts = async (proprietaireId?: number) => {
  return api.get('/systeme/dashboard/bien-statuts/', { params: { proprietaire_id: proprietaireId } });
};
