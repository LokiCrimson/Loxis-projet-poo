import axios from 'axios';
import { toast } from '@/hooks/use-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response) {
      // 401: Unauthorized - Redirect to login
      if (response.status === 401) {
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } 
      // 403: Forbidden
      else if (response.status === 403) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions nécessaires pour cette action.",
          variant: "destructive",
        });
      }
      // 400: Bad Request (Validation errors)
      else if (response.status === 400) {
        const errors = response.data;
        const firstError = typeof errors === 'object' 
          ? Object.values(errors)[0] 
          : "Données invalides";
        
        toast({
          title: "Erreur de validation",
          description: Array.isArray(firstError) ? firstError[0] : String(firstError),
          variant: "destructive",
        });
      }
      // 500: Server Error
      else if (response.status >= 500) {
        toast({
          title: "Erreur serveur",
          description: "Une erreur interne est survenue sur le serveur Loxis.",
          variant: "destructive",
        });
      }
    } else {
      // Network Error
      toast({
        title: "Erreur réseau",
        description: "Impossible de contacter le serveur. Vérifiez votre connexion.",
        variant: "destructive",
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;
