import Header from '@/components/inicio/Header';
import ResponsiveNavbarV2 from '@/components/navbar/ResponsiveNavbarV2';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Redirect, Slot, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

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
    return () => subscription?.remove();
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
    return <Redirect href="/" />;
  }

  const isMobile = screenWidth < 768;

  // Para móvil: navbar en bottom - SIN SafeAreaView
  if (isMobile) {
    return (
      <View style={styles.containerMobile}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Header solo si NO es loginScreen */}
        {pathname !== '/loginScreen' && (
          <View style={styles.mobileHeader}>
            <Header darkMode={false} />
          </View>
        )}
        
        {/* Contenido principal */}
        <View style={styles.mobileContent}>
          <Slot />
        </View>
        
        {/* Navbar */}
        <ResponsiveNavbarV2 />
      </View>
    );
  }

  // Para web/desktop: sidebar + contenido
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.layoutContainer}>
        {/* Nuevo Responsive Navbar */}
        <ResponsiveNavbarV2 />

        {/* Main Content con Header */}
        <View style={styles.mainContent}>
          {/* Header solo si NO es loginScreen */}
          {pathname !== '/loginScreen' && (
            <View style={styles.desktopHeader}>
              <Header darkMode={false} />
            </View>
          )}
          
          {/* Contenido de las pantallas */}
          <View style={styles.desktopContent}>
            <Slot />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerMobile: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Cambiado a blanco para evitar fondo oscuro
  },
  mobileHeader: {
    // Sin padding top para evitar conflictos con CSS externo
    backgroundColor: 'transparent', // Header transparente
    // Sin borderBottom para que sea completamente transparente
  },
  mobileContent: {
    flex: 1,
    paddingBottom: 80, // Espacio reducido para el navbar
  },
  layoutContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  desktopHeader: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  desktopContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
