import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Redirect, Slot, Tabs, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  if (isLoading) return null;
  if (!isAuthenticated && pathname !== '/loginScreen') {
    return <Redirect href="/loginScreen" />;
  }
  if (isAuthenticated && pathname === '/loginScreen') {
    return <Redirect href="/" />;
  }

  // 4. El resto de tu lógica...
  const getActiveRoute = () => {
    if (pathname === '/') return 'index';
    return pathname.replace('/', '') || 'index';
  };
  const activeTab = getActiveRoute();
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
    {
      name: 'altaAlumno',
      title: 'Alta de Alumnos',
      icon: 'person.fill',
      iconOutline: 'person',
    },
  ];

  // Para móvil: usar bottom tabs
  if (isMobile) {
    return (
      <SafeAreaView style={styles.containerMobile}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
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
          {navigationItems.map((item) => (
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

  // Para web/desktop: sidebar + contenido sin Tabs
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
            {navigationItems.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.minimalSidebarItem,
                  activeTab === item.name && styles.minimalSidebarItemActive
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
                  name={activeTab === item.name ? item.icon : (item.iconOutline || item.icon)}
                  color={activeTab === item.name ? '#FF6B35' : '#FFFFFF'}
                />
              </TouchableOpacity>
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

        {/* Main Content - Renderizar el contenido de las pantallas */}
        <View style={styles.mainContent}>
          <Slot />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  containerMobile: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  layoutContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  minimalSidebar: {
    width: 80,
    backgroundColor: '#1C1C1E',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  minimalLogo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimalNavigation: {
    flex: 1,
    alignItems: 'center',
  },
  minimalSidebarItem: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  minimalSidebarItemActive: {
    backgroundColor: '#2C2C2E',
  },
  minimalFooter: {
    alignItems: 'center',
  },
  minimalUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimalAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimalAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mobileTabBar: {
    backgroundColor: '#000',
    borderTopWidth: 0,
    height: 88,
    paddingBottom: 20,
    paddingTop: 10,
  },
  mobileTabLabel: {
    fontSize: 12,
    fontWeight: '500',
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
