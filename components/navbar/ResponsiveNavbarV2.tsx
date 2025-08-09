import NavigationItems from '@/components/navbar/NavigationItems';
import RadixIcons from '@/components/ui/RadixIcons';
import { useLogout } from '@/hooks/auth/useLogout';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export default function ResponsiveNavbarV2() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = width < 768;
  const { logout } = useLogout();

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

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Mobile Navigation (Bottom) - Estilo específico para móvil
  if (isMobile) {
    return (
      <View style={styles.mobileContainer}>
        <View style={styles.mobileNavContainer}>
          <View style={styles.mobileNavButtons}>
            <NavigationItems 
              activeTab={activeTab}
              onNavigation={handleNavigation}
              isMobile={true}
            />
            
            {/* Botón de Logout */}
            <TouchableOpacity
              style={styles.mobileLogoutButton}
              onPress={handleLogout}
            >
              <RadixIcons.Logout
                size={24}
                color="#EF4444"
              />
            </TouchableOpacity>
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
        <Image source={require('@/assets/images/icon.png')} style={{ width: 40, height: 40, borderRadius: 8 }} />
        <Text style={styles.desktopLogoText}>Universidad</Text>
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.desktopBackButton} onPress={handleBack}>
        <RadixIcons.ChevronLeft size={20} color="#666666" />
      </TouchableOpacity>

      {/* Navigation Items - Centered */}
      <NavigationItems 
        activeTab={activeTab}
        onNavigation={handleNavigation}
        isMobile={false}
      />
      
      {/* Botón de Logout */}
      <TouchableOpacity
        style={styles.desktopLogoutButton}
        onPress={handleLogout}
      >
        <RadixIcons.Logout
          size={22}
          color="#EF4444"
        />
      </TouchableOpacity>
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
  mobileLogoutButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
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
  desktopLogoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 'auto',
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