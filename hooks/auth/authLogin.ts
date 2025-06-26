// ===========================================
// 1. hooks/auth/useAuthLogin.ts (HOOK - Intermediario)
// ===========================================
import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSessionStore } from '@/store/session/sessionStore';
import { loginController } from '@/controller/auth/authController';

export const useAuthLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);

  const handleLogin = async (username: string, password: string) => {
    // Validación básica
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Llamar directamente al CONTROLLER (siguiendo tu MVC)
      const session = await loginController(username, password);
      
      // Manejar el éxito con hooks de React
      setSession(session);
      Alert.alert('Bienvenido', '¡Inicio de sesión exitoso!');
      router.push('/'); // Navegar al home
      
    } catch (error: any) {
      console.error('Login Error:', error.message);
      Alert.alert('Error en login', error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleLogin,
    isLoading,
  };
};