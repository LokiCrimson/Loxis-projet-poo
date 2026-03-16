import api from './api';
import { mockCurrentUser } from './mock-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const USE_MOCK = true;

export const login = async (email: string, password: string) => {
  if (USE_MOCK) {
    await delay(800);
    return { data: { token: 'mock-jwt-token', user: mockCurrentUser } };
  }
  return api.post('/auth/login/', { email, mot_de_passe: password });
};

export const logout = async () => {
  localStorage.removeItem('token');
  if (USE_MOCK) return;
  return api.post('/auth/logout/');
};

export const getCurrentUser = async () => {
  if (USE_MOCK) {
    await delay(300);
    return { data: mockCurrentUser };
  }
  return api.get('/auth/me/');
};
