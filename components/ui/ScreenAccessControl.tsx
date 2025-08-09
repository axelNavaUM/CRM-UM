import { useAuth } from '@/context/AuthContext';
import { useScreenPermissions } from '@/hooks/permisos/useScreenPermissions';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface ScreenAccessControlProps {
  children: React.ReactNode;
  requiredScreen: string;
  fallbackScreen?: string;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

export const ScreenAccessControl: React.FC<ScreenAccessControlProps> = ({
  children,
  requiredScreen,
  fallbackScreen = '/',
  loadingComponent,
  unauthorizedComponent
}) => {
  const { user } = useAuth();
  const { hasScreenAccess, isLoading } = useScreenPermissions();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Evitar redirecciones mientras se está cargando la info de permisos
    if (isLoading) return;

    if (!user?.email) {
      if (pathname !== (fallbackScreen as string)) {
        router.replace(fallbackScreen as any);
      }
      return;
    }

    const allowed = hasScreenAccess(requiredScreen);
    if (!allowed) {
      console.log(`🔒 Acceso denegado a ${requiredScreen} (cache store)`);
      if (pathname !== (fallbackScreen as string)) {
        router.replace(fallbackScreen as any);
      }
    }
  }, [user?.email, requiredScreen, fallbackScreen, router, isLoading, pathname, hasScreenAccess]);

  // Mostrar loading mientras se verifica el permiso
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Verificando permisos...</Text>
      </View>
    );
  }

  // Si tiene acceso, mostrar el contenido
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 16,
  },
  unauthorizedText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 