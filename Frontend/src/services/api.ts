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
    
    // Ignore les erreurs 401 pour la page de login pour éviter les boucles de redirection
    // et les messages d'erreur automatiques sur les tentatives de connexion échouées
    // (on gère les erreurs de login manuellement dans LoginPage.tsx)
    const isLoginPath = window.location.pathname.includes('/login') || error.config?.url?.includes('/token/');

    if (response) {
      if (response.status === 401) {
        if (!isLoginPath) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } 
      else if (response.status === 403) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions nécessaires.",
          variant: "destructive",
        });
      }
      else if (response.status === 400 && !isLoginPath) {
        const errors = response.data;
        let errorMsg = "Données invalides";
        
        if (typeof errors === 'object' && errors !== null) {
          const values = Object.values(errors);
          const first = values[0];
          errorMsg = Array.isArray(first) ? first[0] : String(first || errorMsg);
        }
        
        toast({
          title: "Erreur",
          description: errorMsg,
          variant: "destructive",
        });
      }
      else if (response.status >= 500) {
        toast({
          title: "Erreur serveur",
          description: "Le service Loxis rencontre une difficulté technique.",
          variant: "destructive",
        });
      }
    } else if (!isLoginPath) {
      toast({
        title: "Loxis Hors Ligne",
        description: "Connexion au serveur impossible.",
        variant: "destructive",
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;
