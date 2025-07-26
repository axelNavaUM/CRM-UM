import { useAuth } from '@/context/AuthContext';
import { logoutController } from '@/controller/auth/authController';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

export function useLogout() {
  const router = useRouter();
  const { logout: authLogout } = useAuth();

  const logout = useCallback(async () => {
    console.log('🚪 Iniciando logout desde useLogout');
    await logoutController();
    await authLogout();
    console.log('🚪 Redirigiendo a loginScreen');
    router.replace('/loginScreen');
  }, [router, authLogout]);

  return { logout };
}
