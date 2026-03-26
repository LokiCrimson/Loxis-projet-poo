import api from './api';

export const getComptaResume = async (year?: number) => {
  return api.get('/finances/comptabilite/resume/', { params: year ? { year } : {} });
};

export const getComptaMensuel = async (year?: number) => {
  return api.get('/finances/comptabilite/mensuel/', { params: year ? { year } : {} });
};

export const getComptaParBien = async (year?: number) => {
  return api.get('/finances/comptabilite/par-bien/', { params: year ? { year } : {} });
};
