import { IconSymbol } from '@/components/ui/IconSymbol';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface NavItem {
  name: string;
  title: string;
  icon: string;
  route: string;
}

const navigationItems: NavItem[] = [
  {
    name: 'home',
    title: 'Inicio',
    icon: 'house.fill',
    route: '/'
  },
  {
    name: 'explore',
    title: 'Actividades',
    icon: 'chart.bar.fill',
    route: '/explore'
  },
  {
    name: 'gestionPeticiones',
    title: 'Gestión Peticiones',
    icon: 'doc.text.fill',
    route: '/gestionPeticiones'
  },
  {
    name: 'altaAlumno',
    title: 'Alta Alumnos',
    icon: 'person.badge.plus.fill',
    route: '/altaAlumno'
  },
  {
    name: 'altaUsuario',
    title: 'Alta Usuarios',
    icon: 'person.2.fill',
    route: '/altaUsuario'
  }
];

export default function ResponsiveNavbarV2() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = width < 768;

  const getActiveRoute = () => {
    if (pathname === '/') return 'home';
    return pathname.replace('/', '') || 'home';
  };

  const activeTab = getActiveRoute();

  const handleNavigation = (route: string) => {
    if (route === '/') {
      router.push('/' as any);
    } else {
      router.push(route as any);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Mobile Navigation (Bottom) - Estilo específico para móvil
  if (isMobile) {
    return (
      <View style={styles.mobileContainer}>
        <View style={styles.mobileNavContainer}>
          <View style={styles.mobileNavButtons}>
            {navigationItems.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.mobileNavButton,
                  activeTab === item.name && styles.mobileNavButtonActive
                ]}
                onPress={() => handleNavigation(item.route)}
              >
                <IconSymbol
                  size={24}
                  name={(activeTab === item.name ? item.icon : item.icon.replace('.fill', '')) as any}
                  color={activeTab === item.name ? '#FFFFFF' : '#666666'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // Desktop/Tablet Navigation (Sidebar) - Estilo específico para web
  return (
    <View style={styles.desktopContainer}>
      {/* Logo */}
      <View style={styles.desktopLogo}>
        <View style={styles.logoIcon}>
          <IconSymbol name="app.fill" size={24} color="#FF6B35" />
        </View>
        <Text style={styles.desktopLogoText}>Universidad</Text>
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.desktopBackButton} onPress={handleBack}>
        <IconSymbol name="chevron.left" size={20} color="#666666" />
      </TouchableOpacity>

      {/* Navigation Items - Centered */}
      <View style={styles.desktopNavItems}>
        {navigationItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.desktopNavButton,
              activeTab === item.name && styles.desktopNavButtonActive
            ]}
            onPress={() => handleNavigation(item.route)}
          >
            <IconSymbol
              size={22}
              name={(activeTab === item.name ? item.icon : item.icon.replace('.fill', '')) as any}
              color={activeTab === item.name ? '#FF6B35' : '#666666'}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ===== ESTILOS ESPECÍFICOS PARA MÓVIL =====
  mobileContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  mobileNavContainer: {
    backgroundColor: '#FFFFFF', // Fondo blanco para integrarse con la app
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  mobileNavButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  mobileNavButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  mobileNavButtonActive: {
    backgroundColor: '#FF6B35', // Naranja para el botón activo
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  // ===== ESTILOS ESPECÍFICOS PARA WEB/DESKTOP =====
  desktopContainer: {
    width: 80,
    backgroundColor: '#FFFFFF',
    height: '100%',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  desktopLogo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  desktopLogoText: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  desktopBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  desktopNavItems: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  desktopNavButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  desktopNavButtonActive: {
    backgroundColor: '#FFF5F2',
    borderWidth: 2,
    borderColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
}); 