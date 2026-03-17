import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('loxis_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer le rafraîchissement du token (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('loxis_refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${api.defaults.baseURL}/api/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('loxis_access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Si le refresh échoue, on déconnecte
          localStorage.removeItem('loxis_access_token');
          localStorage.removeItem('loxis_refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getUserRole = () => {
  const token = localStorage.getItem('loxis_access_token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.role; // Assumé que le backend injecte 'role' dans le JWT
  } catch (e) {
    return null;
  }
};

export default api;
