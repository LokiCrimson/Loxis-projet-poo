import api from './api';
import { mockBiens, mockRevenueChart, mockAlertes, mockBienStatuts } from './mock-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const USE_MOCK = true;

// Helper to filter biens by owner
const filterBiensByOwner = (proprietaireId?: number) => {
  if (!proprietaireId) return mockBiens; // admin sees all
  return mockBiens.filter(b => b.proprietaire_id === proprietaireId);
};

export const getDashboardStats = async (proprietaireId?: number) => {
  if (USE_MOCK) {
    await delay(500);
    const biens = filterBiensByOwner(proprietaireId);
    const loues = biens.filter(b => b.statut === 'loue');
    const revenus = loues.reduce((sum, b) => sum + b.loyer_hc + b.charges, 0);
    return {
      data: {
        total_biens: biens.length,
        baux_actifs: loues.length,
        revenus_mois: revenus,
        loyers_impayes: proprietaireId ? Math.min(1, loues.length) : 2,
        evolution_revenus: 8.5,
        evolution_baux: 0,
        evolution_impayes: -15,
      },
    };
  }
  return api.get('/dashboard/stats/');
};

export const getRevenueChart = async (proprietaireId?: number) => {
  if (USE_MOCK) {
    await delay(600);
    if (!proprietaireId) return { data: mockRevenueChart };
    // Scale revenues proportionally for owner
    const biens = filterBiensByOwner(proprietaireId);
    const ratio = biens.length / mockBiens.length;
    return {
      data: mockRevenueChart.map(m => ({
        mois: m.mois,
        revenus: Math.round(m.revenus * ratio),
        depenses: Math.round(m.depenses * ratio),
      })),
    };
  }
  return api.get('/dashboard/revenue-chart/');
};

export const getAlertes = async (params?: Record<string, string>, proprietaireId?: number) => {
  if (USE_MOCK) {
    await delay(400);
    if (!proprietaireId) return { data: mockAlertes };
    const ownerBienIds = filterBiensByOwner(proprietaireId).map(b => b.id);
    return { data: mockAlertes.filter(a => ownerBienIds.includes(a.bien_id)) };
  }
  return api.get('/alertes/', { params });
};

export const getBienStatuts = async (proprietaireId?: number) => {
  if (USE_MOCK) {
    await delay(300);
    if (!proprietaireId) return { data: mockBienStatuts };
    const biens = filterBiensByOwner(proprietaireId);
    return {
      data: {
        loues: biens.filter(b => b.statut === 'loue').length,
        vacants: biens.filter(b => b.statut === 'vacant').length,
        en_travaux: biens.filter(b => b.statut === 'en_travaux').length,
      },
    };
  }
  return api.get('/dashboard/bien-statuts/');
};
