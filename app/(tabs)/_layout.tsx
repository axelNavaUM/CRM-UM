import Header from '@/components/inicio/Header';
import ResponsiveNavbarV2 from '@/components/navbar/ResponsiveNavbarV2';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Redirect, Slot, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, StatusBar, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  // 1. TODOS los hooks deben ir ANTES de cualquier lógica condicional
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  // 2. useEffect también debe ir después de los hooks
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);

  // 3. DESPUÉS de todos los hooks, puedes hacer lógica condicional
  console.log('🔍 Debug layout - pathname:', pathname, 'isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  
  const isLoginScreen = pathname.startsWith('/loginScreen');

  if (isLoading) return null;
  if (!isAuthenticated && !isLoginScreen) {
    console.log('🔍 Redirigiendo a loginScreen desde layout');
    return <Redirect href="/loginScreen" />;
  }
  if (isAuthenticated && isLoginScreen) {
    console.log('🔍 Redirigiendo a home desde layout');
    return <Redirect href="/(tabs)/explore" />;
  }

  const isMobile = screenWidth < 768;

  // Para móvil: header fijo con nuestro componente, posicionado como el nativo
  if (isMobile) {
    return (
      <View style={styles.containerMobile}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
        {/* Header superior con búsqueda, notificaciones y perfil */}
        <View style={styles.mobileHeader}>
          <Header darkMode={colorScheme === 'dark'} />
        </View>
        {/* Contenido principal debajo del header */}
        <View style={styles.mobileContent}>
          <Slot />
        </View>
        {/* Navbar */}
        <ResponsiveNavbarV2 />
      </View>
    );
  }

  // Para web/desktop: sidebar + contenido en forma de L
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.layoutContainer}>
        {/* Navbar vertical a la izquierda */}
        <View style={styles.desktopSidebar}>
          <ResponsiveNavbarV2 />
        </View>

        {/* Contenido principal (header + contenido) */}
        <View style={styles.mainContent}>
          {/* Header horizontal que no tapa el navbar */}
          {pathname !== '/loginScreen' && (
            <View style={styles.desktopHeader}>
              <Header darkMode={colorScheme === 'dark'} />
            </View>
          )}
          
          {/* Contenido de las pantallas */}
          <View style={styles.desktopContent}>
            <Slot />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 0,
    padding: 0,
  },
  containerMobile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mobileHeader: {
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 9999,
    elevation: 2,
  },
  mobileContent: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 80,
    zIndex: 1,
  },
  layoutContainer: {
    flex: 1,
    flexDirection: 'row',
    margin: 0,
    padding: 0,
  },
  desktopSidebar: {
    width: 80,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 0,
    borderRightColor: 'transparent',
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  desktopHeader: {
    backgroundColor: '#F5F5F5',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    margin: 0,
    zIndex: 9999, // Asegurar que esté por encima del contenido
  },
  desktopContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    margin: 0,
    zIndex: 1, // Asegurar que esté por debajo del header
  },
});
