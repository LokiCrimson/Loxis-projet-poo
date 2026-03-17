import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'admin' | 'proprietaire' | 'locataire';

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
}

interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  mot_de_passe: string;
  role: 'proprietaire' | 'locataire';
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demo
const MOCK_USERS: (AuthUser & { password: string })[] = [
  { id: 1, nom: 'Agbéko', prenom: 'Yao', email: 'admin@loxis.com', telephone: '+228 90 12 34 56', role: 'admin', password: 'admin123' },
  { id: 2, nom: 'Koffi', prenom: 'Ama', email: 'proprio@loxis.com', telephone: '+228 91 23 45 67', role: 'proprietaire', password: 'proprio123' },
  { id: 3, nom: 'Mensah', prenom: 'Kofi', email: 'locataire@loxis.com', telephone: '+228 92 34 56 78', role: 'locataire', password: 'locataire123' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('loxis_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 600));
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Email ou mot de passe incorrect');
    const { password: _, ...userData } = found;
    setUser(userData);
    localStorage.setItem('loxis_user', JSON.stringify(userData));
    localStorage.setItem('token', 'mock-jwt-token');
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await new Promise(r => setTimeout(r, 600));
    // Mock: just succeed
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('loxis_user');
    localStorage.removeItem('token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
