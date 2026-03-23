import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'admin' | 'proprietaire' | 'locataire' | 'ADMIN' | 'OWNER' | 'TENANT';

export interface AuthUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  mot_de_passe: string;
  role: 'proprietaire' | 'locataire';
}

import { login as apiLogin, getCurrentUser } from '../services/auth.service';
import api from '../services/api';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getCurrentUser();
          const userData = {
            id: res.data.id,
            email: res.data.email,
            nom: res.data.last_name || res.data.nom || '',
            prenom: res.data.first_name || res.data.prenom || '',
            telephone: res.data.phone || res.data.telephone || '',
            role: res.data.role
          };
          setUser(userData as AuthUser);
          localStorage.setItem('loxis_user', JSON.stringify(userData));
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('loxis_user');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    const token = res.data.access || res.data.token; // Handle Django SimpleJWT structure
    if (token) {
      localStorage.setItem('token', token);
      const userRes = await getCurrentUser();
      const userData = {
        id: userRes.data.id,
        email: userRes.data.email,
        nom: userRes.data.last_name || userRes.data.nom || '',
        prenom: userRes.data.first_name || userRes.data.prenom || '',
        telephone: userRes.data.phone || userRes.data.telephone || '',
        role: userRes.data.role
      };
      setUser(userData as AuthUser);
      localStorage.setItem('loxis_user', JSON.stringify(userData));
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await api.post('/utilisateurs/comptes/', data);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('loxis_user');
    localStorage.removeItem('token');
  }, []);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('loxis_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
