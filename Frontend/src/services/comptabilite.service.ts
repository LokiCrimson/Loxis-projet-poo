import api from './api';

export const getComptaResume = async () => {
  return api.get('/finances/comptabilite/resume/');
};

export const getComptaMensuel = async () => {
  return api.get('/finances/comptabilite/mensuel/');
};

export const getComptaParBien = async () => {
  return api.get('/finances/comptabilite/par-bien/');
};
