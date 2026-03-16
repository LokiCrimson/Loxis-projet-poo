import api from './api';
import { mockComptaResumeAnnuel, mockComptaMensuel, mockComptaParBien } from './mock-data-phase2';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const USE_MOCK = true;

export const getComptaResume = async () => {
  if (USE_MOCK) { await delay(500); return { data: mockComptaResumeAnnuel }; }
  return api.get('/comptabilite/resume/');
};

export const getComptaMensuel = async () => {
  if (USE_MOCK) { await delay(500); return { data: mockComptaMensuel }; }
  return api.get('/comptabilite/mensuel/');
};

export const getComptaParBien = async () => {
  if (USE_MOCK) { await delay(500); return { data: mockComptaParBien }; }
  return api.get('/comptabilite/par-bien/');
};
