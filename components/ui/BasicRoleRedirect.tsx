import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

interface BasicRoleRedirectProps {
  children: React.ReactNode;
}

let didInitialRedirect = false;

export const BasicRoleRedirect: React.FC<BasicRoleRedirectProps> = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Solo ejecutar una vez por montaje y una vez global por sesión
    if (hasRedirected.current || didInitialRedirect || !user) {
      return;
    }

    console.log('[DEBUG] BasicRoleRedirect - Usuario:', user);
    console.log('[DEBUG] BasicRoleRedirect - idarea:', user.idarea, 'pathname:', pathname);

    // Marcar que ya se ejecutó
    hasRedirected.current = true;
    didInitialRedirect = true;

    // Estabilizar únicamente si la ruta no es de tabs conocidas
    const isOnKnownTabs = (
      pathname === '/(tabs)/gestionPeticiones' ||
      pathname === '/(tabs)/explore' ||
      pathname === '/(tabs)/notificaciones'
    );

    if (!isOnKnownTabs) {
      console.log('[DEBUG] BasicRoleRedirect - Ruta desconocida, enviando a notificaciones para estabilizar');
      router.replace('/(tabs)/notificaciones');
    }
  }, [user, router, pathname]);

  // Siempre mostrar children, no hay loading
  return <>{children}</>;
}; 