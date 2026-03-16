import api from './api';
import { mockDashboardStats, mockRevenueChart, mockAlertes, mockBienStatuts } from './mock-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const USE_MOCK = true;

export const getDashboardStats = async () => {
  if (USE_MOCK) {
    await delay(500);
    return { data: mockDashboardStats };
  }
  return api.get('/dashboard/stats/');
};

export const getRevenueChart = async () => {
  if (USE_MOCK) {
    await delay(600);
    return { data: mockRevenueChart };
  }
  return api.get('/dashboard/revenue-chart/');
};

export const getAlertes = async (params?: Record<string, string>) => {
  if (USE_MOCK) {
    await delay(400);
    return { data: mockAlertes };
  }
  return api.get('/alertes/', { params });
};

export const getBienStatuts = async () => {
  if (USE_MOCK) {
    await delay(300);
    return { data: mockBienStatuts };
  }
  return api.get('/dashboard/bien-statuts/');
};
