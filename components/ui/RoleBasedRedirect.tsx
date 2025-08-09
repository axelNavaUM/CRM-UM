import { useAuth } from '@/context/AuthContext';
import { useRoleBasedContent } from '@/hooks/permisos/useRoleBasedContent';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({ children }) => {
  const { user } = useAuth();
  const { content, isLoading } = useRoleBasedContent();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Solo redirigir una vez y si el usuario está autenticado y el contenido está cargado
    if (user && !isLoading && content && !hasRedirected) {
      console.log('[DEBUG] RoleBasedRedirect - Verificando redirección');
      console.log('[DEBUG] RoleBasedRedirect - user:', user);
      console.log('[DEBUG] RoleBasedRedirect - content:', content);

      // Marcar que ya se hizo una redirección
      setHasRedirected(true);

      // Si el usuario es director, redirigir a gestión de peticiones
      if (content.role === 'director') {
        console.log('[DEBUG] RoleBasedRedirect - Director detectado, redirigiendo a gestión de peticiones');
        router.replace('/(tabs)/gestionPeticiones');
        return;
      }

      // Si el usuario no tiene ningún contenido específico, redirigir a explore
      if (!content.showAsesorStudents && 
          !content.showCareerChangePetitions && 
          !content.showLogs && 
          !content.showStudentsByGroups && 
          !content.showStudentsWithMissingDocuments && 
          !content.showStudentsWithPendingPayments && 
          !content.showMetrics) {
        console.log('[DEBUG] RoleBasedRedirect - Usuario sin contenido específico, redirigiendo a explore');
        router.replace('/(tabs)/explore');
        return;
      }
    }
  }, [user, isLoading, content, router, hasRedirected]);

  // Solo mostrar loading si está cargando y no ha redirigido aún
  if (isLoading && !hasRedirected) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Determinando contenido...</Text>
      </View>
    );
  }

  // Si ya redirigió o no necesita redirección, mostrar children
  return <>{children}</>;
}; 