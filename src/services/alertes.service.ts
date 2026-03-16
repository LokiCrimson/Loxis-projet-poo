import api from './api';
import { mockAlertesAll } from './mock-data-phase2';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const USE_MOCK = true;

let localAlertes = [...mockAlertesAll];

export const getAllAlertes = async (params?: Record<string, string>) => {
  if (USE_MOCK) {
    await delay(400);
    let data = [...localAlertes];
    if (params?.type && params.type !== 'tous') data = data.filter(a => a.type === params.type);
    if (params?.lu === 'true') data = data.filter(a => a.lu);
    if (params?.lu === 'false') data = data.filter(a => !a.lu);
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { data };
  }
  return api.get('/alertes/', { params });
};

export const marquerAlerteLue = async (id: number) => {
  if (USE_MOCK) {
    await delay(300);
    localAlertes = localAlertes.map(a => a.id === id ? { ...a, lu: true } : a);
    return { data: { id, lu: true } };
  }
  return api.put(`/alertes/${id}/lire/`);
};

export const marquerToutesLues = async () => {
  if (USE_MOCK) {
    await delay(500);
    localAlertes = localAlertes.map(a => ({ ...a, lu: true }));
    return { data: { success: true } };
  }
  return api.put('/alertes/lire-toutes/');
};
