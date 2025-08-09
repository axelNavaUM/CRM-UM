import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface SimpleRoleRedirectProps {
  children: React.ReactNode;
}

export const SimpleRoleRedirect: React.FC<SimpleRoleRedirectProps> = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Solo ejecutar una vez
    if (hasRedirected.current || !user) {
      return;
    }

    console.log('[DEBUG] SimpleRoleRedirect - Verificando redirección para usuario:', user);

    // Marcar que ya se ejecutó
    hasRedirected.current = true;

    // Redirección simple basada en el área del usuario
    if (user.idarea === 1) { // Asumiendo que área 1 es director
      console.log('[DEBUG] SimpleRoleRedirect - Director detectado, redirigiendo a gestión de peticiones');
      router.replace('/(tabs)/gestionPeticiones');
    } else {
      console.log('[DEBUG] SimpleRoleRedirect - Usuario no es director, redirigiendo a explore');
      router.replace('/(tabs)/explore');
    }
  }, [user, router]);

  // Solo mostrar loading si está cargando y no ha redirigido aún
  if (!user && !hasRedirected.current) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Cargando...</Text>
      </View>
    );
  }

  // Si ya redirigió o no necesita redirección, mostrar children
  return <>{children}</>;
}; 