import { authModel } from '@/models/auth/authModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = '@auth_user';

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  idarea?: number;
  nombreusuario?: string;
  apellido?: string;
  correoinstitucional?: string;
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
          // Preservar campos cruciales para roles
          idarea: parsed.idarea,
          nombreusuario: parsed.nombreusuario,
          apellido: parsed.apellido,
          correoinstitucional: parsed.correoinstitucional,
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
      // Preservar campos cruciales para roles
      idarea: userData.idarea,
      nombreusuario: userData.nombreusuario,
      apellido: userData.apellido,
      correoinstitucional: userData.correoinstitucional,
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
    console.log('🚪 Iniciando logout en AuthContext');
    if (typeof window !== 'undefined' && window.localStorage) {
      console.log('🚪 Cerrando sesión (web): eliminando STORAGE_KEY', STORAGE_KEY);
      window.localStorage.removeItem(STORAGE_KEY);
      console.log('🚪 Storage eliminado en web');
    } else {
      console.log('🚪 Cerrando sesión (móvil): eliminando STORAGE_KEY', STORAGE_KEY);
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('🚪 Storage eliminado en móvil');
    }
    console.log('🚪 Limpiando estado del usuario');
    setUser(null);
    console.log('🚪 Logout completado en AuthContext');
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