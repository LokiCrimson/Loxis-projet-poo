import api from './api';

export const login = async (email: string, password: string, otp?: string) => {
  return api.post('/token/', { email, password, otp });
};

export const logout = async () => {
  localStorage.removeItem('token');
};

export const getCurrentUser = async () => {
  return api.get('/utilisateurs/me/');
};
