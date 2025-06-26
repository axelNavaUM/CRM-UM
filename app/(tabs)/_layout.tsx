import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs, usePathname, useRouter, Redirect } from 'expo-router'; // Asegúrate de importar Redirect
import React, { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSessionCheck } from '@/hooks/auth/sessionPass'; // Importa el hook que creamos

export default function TabLayout() {
  const { session, checkSession } = useSessionCheck(); // Usa el hook useSessionCheck

  // ** Lógica de Redirección si no hay sesión **
  // Verifica si no hay sesión y la ruta actual NO es la de loginScreen
  const router = useRouter();
  const pathname = usePathname();

  // Importante: Redirige si NO hay sesión Y la ruta actual NO es '/loginScreen'
  // Esto previene bucles infinitos de redirección.
  if (!checkSession() && pathname !== '/loginScreen') {
    return <Redirect href="/loginScreen" />;
  }
  // ** Fin Lógica de Redirección **


  // Resto de tus hooks y estado
  const colorScheme = useColorScheme();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  // ... Tu lógica para obtener la ruta activa (getActiveRoute) ...
  const getActiveRoute = () => {
    if (pathname === '/') return 'index';
    return pathname.replace('/', '') || 'index';
  };
  const activeTab = getActiveRoute();
  // ... Fin lógica de obtener ruta activa ...

  // ... Tu useEffect para actualizar screenWidth ...
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);
  // ... Fin useEffect ...


  const isMobile = screenWidth < 768;

  const navigationItems = [
    {
      name: 'index',
      title: 'Home',
      icon: 'house.fill',
      iconOutline: 'house',
    },
    {
      name: 'explore',
      title: 'Activities',
      icon: 'chart.bar.fill',
      iconOutline: 'chart.bar',
    },
    // Incluye loginScreen si necesitas que aparezca en la navegación (aunque no esté protegido por esta lógica)
    // O exclúyelo si es solo una pantalla de autenticación fuera de las tabs protegidas
     {
       name: 'loginScreen',
       title: 'Login', // Cambiado a Login para claridad
       icon: 'person.crop.circle', // Icono representativo
       iconOutline: 'person.crop.circle',
     },
    {
      name: 'altaAlumnos',
      title: 'Alta de Alumnos',
      icon: 'person.fill',
      iconOutline: 'person',
    },
    {
      name: 'settings',
      title: 'Settings',
      icon: 'gearshape.fill',
      iconOutline: 'gearshape',
    },
  ];

  // Resto de tu JSX para renderizar las Tabs o el Sidebar
  // Asegúrate de que la pantalla 'loginScreen' esté definida en algún lugar de tus rutas
  // pero NO dentro de las Tabs que se renderizan CONDICIONALMENTE (es decir, si isMobile)
  // ya que la redirección ya la maneja fuera de este bloque.

  // Para móvil: usar bottom tabs
  if (isMobile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#FF6B35',
            tabBarInactiveTintColor: '#8E8E93',
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarStyle: styles.mobileTabBar,
            tabBarLabelStyle: styles.mobileTabLabel,
          }}>
          {/* Renderiza solo las tabs protegidas para usuarios autenticados */}
          {/* Excluye loginScreen de estas tabs si solo debe ser accesible cuando no hay sesión */}
          {navigationItems
            .filter(item => item.name !== 'loginScreen') // Filtra la pantalla de login si no quieres que esté en la navegación normal
            .map((item) => (
            <Tabs.Screen
              key={item.name}
              name={item.name}
              options={{
                title: item.title,
                tabBarIcon: ({ color, focused }) => (
                  <IconSymbol
                    size={focused ? 26 : 24}
                    name={focused ? item.icon : (item.iconOutline || item.icon)}
                    color={color}
                  />
                ),
              }}
            />
          ))}
        </Tabs>
      </SafeAreaView>
    );
  }

  // Componente del Minimal Sidebar Item (asegúrate de que esté definido)
  const MinimalSidebarItem = ({ item, isActive }) => (
    <TouchableOpacity
      style={[
        styles.minimalSidebarItem,
        isActive && styles.minimalSidebarItemActive
      ]}
      onPress={() => {
        if (item.name === 'index') {
          router.push('/');
        } else {
          router.push(`/${item.name}`);
        }
      }}
    >
      <IconSymbol
        size={22}
        name={isActive ? item.icon : (item.iconOutline || item.icon)}
        color={isActive ? '#FF6B35' : '#FFFFFF'}
      />
    </TouchableOpacity>
  );


  // Para tablet/desktop: minimal sidebar izquierdo
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.layoutContainer}>
        {/* Minimal Dark Sidebar */}
        <View style={styles.minimalSidebar}>
          {/* Logo at top */}
          <View style={styles.minimalLogo}>
            <View style={styles.logoIcon}>
              <IconSymbol
                name="app.fill"
                size={24}
                color="#FF6B35"
              />
            </View>
          </View>

          {/* Navigation Items */}
          <View style={styles.minimalNavigation}>
             {/* Renderiza solo las tabs protegidas para usuarios autenticados */}
            {/* Excluye loginScreen de estas tabs si solo debe ser accesible cuando no hay sesión */}
            {navigationItems
              .filter(item => item.name !== 'loginScreen') // Filtra la pantalla de login
              .map((item) => (
              <MinimalSidebarItem
                key={item.name}
                item={item}
                isActive={activeTab === item.name}
              />
            ))}
          </View>

          {/* Bottom section with user */}
          <View style={styles.minimalFooter}>
            <TouchableOpacity style={styles.minimalUserAvatar}>
              <View style={styles.minimalAvatarCircle}>
                <Text style={styles.minimalAvatarText}>A</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: 'none' }, // Oculta la tab bar ya que usamos sidebar
            }}
          >
             {/* Aquí defines las pantallas accesibles. Debes incluir 'loginScreen' aquí */}
             {/* para que expo-router sepa que existe, aunque la redirección la maneje el layout */}
             {navigationItems.map((item) => (
              <Tabs.Screen
                key={item.name}
                name={item.name}
                options={{ title: item.title }}
              />
            ))}
          </Tabs>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ... Tus estilos (StyleSheet.create) ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  layoutContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  // Mobile Bottom Tab Styles
  mobileTabBar: {
    position: 'absolute',
    bottom: 10,           // Margen inferior
    left: 0,              // Alineado al borde izquierdo del contenedor
    right: 0,             // Alineado al borde derecho del contenedor
    marginHorizontal: 15, // Margen uniforme a ambos lados (15px)
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingBottom: 5,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  mobileTabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },

  // Minimal Dark Sidebar
  minimalSidebar: {
    width: 70,
    backgroundColor: '#1A1A1A',
    paddingVertical: 20,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#2A2A2A',
  },

  // Minimal Logo
  minimalLogo: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Minimal Navigation
  minimalNavigation: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    gap: 16,
  },
  minimalSidebarItem: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  minimalSidebarItemActive: {
    backgroundColor: '#2A2A2A',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  // Minimal Footer
  minimalFooter: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  minimalUserAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Main Content
  mainContent: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
});


// Hook para detección de dispositivos (Ya estaba en tu código)
export const useDeviceType = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'mobile',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const { width, height } = Dimensions.get('window');

      let type = 'mobile';
      if (width >= 1024) {
        type = 'desktop';
      } else if (width >= 768) {
        type = 'tablet';
      }

      setDeviceInfo({ type, width, height });
    };

    updateDeviceInfo();
    const subscription = Dimensions.addEventListener('change', updateDeviceInfo);

    return () => subscription?.remove();
  }, []);

  return deviceInfo;
};
