import { authModel } from '@/models/authModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = '@auth_user';

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      let storedUser: string | null = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        storedUser = window.localStorage.getItem(STORAGE_KEY);
      } else {
        storedUser = await AsyncStorage.getItem(STORAGE_KEY);
      }
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // Mapea al formato correcto si viene crudo
        const mappedUser = {
          id: parsed.idusuario || parsed.id || '',
          name: parsed.nombre || parsed.nombreusuario || '',
          email: parsed.correoinstitucional || parsed.email || '',
          avatarUrl: parsed.avatarUrl || '',
        };
        setUser(mappedUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: any) => {
    // Mapea los campos al formato esperado por el contexto
    const mappedUser = {
      id: userData.idusuario || userData.id || '',
      name: userData.nombre || userData.nombreusuario || '',
      email: userData.correoinstitucional || userData.email || '',
      avatarUrl: userData.avatarUrl || '',
    };
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedUser));
    } else {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mappedUser));
    }
    setUser(mappedUser);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { session } = await authModel.login(email, password);
      if (!session) throw new Error('Credenciales incorrectas');
      await saveUser(session);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
} 