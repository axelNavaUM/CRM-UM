import RadixIcons from '@/components/ui/RadixIcons';
import { useScreenPermissionsStore } from '@/store/permisos/screenPermissionsStore';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface NavItem {
  name: string;
  title: string;
  icon: keyof typeof RadixIcons;
  route: string;
}

const navigationItems: NavItem[] = [
  {
    name: 'home',
    title: 'Inicio',
    icon: 'Home',
    route: '/'
  },
  {
    name: 'explore',
    title: 'Actividades',
    icon: 'Dashboard',
    route: '/explore'
  },
  {
    name: 'gestionPeticiones',
    title: 'Gestión Peticiones',
    icon: 'Documents',
    route: '/gestionPeticiones'
  },
  {
    name: 'altaAlumno',
    title: 'Alta Alumnos',
    icon: 'Students',
    route: '/altaAlumno'
  },
  {
    name: 'altaUsuario',
    title: 'Alta Usuarios',
    icon: 'Users',
    route: '/altaUsuario'
  }
];

interface NavigationItemsProps {
  activeTab: string;
  onNavigation: (route: string) => void;
  isMobile: boolean;
}

export default function NavigationItems({ activeTab, onNavigation, isMobile }: NavigationItemsProps) {
  const { hasScreenAccess, isLoading, userPermissions } = useScreenPermissionsStore();
  const { width } = useWindowDimensions();

  // Memoizar los elementos filtrados para evitar re-renderizados innecesarios
  const filteredNavigationItems = useMemo(() => {
    // Si está cargando, mostrar solo inicio
    if (isLoading) {
      return navigationItems.filter(item => item.name === 'home');
    }
    
    // Filtrar elementos basados en permisos
    return navigationItems.filter(item => {
      const hasAccess = hasScreenAccess(item.name);
      return hasAccess;
    });
  }, [isLoading, userPermissions]); // Solo se recalcula cuando cambian los permisos

  if (isMobile) {
    return (
      <>
        {filteredNavigationItems.map((item) => {
          const IconComponent = RadixIcons[item.icon];
          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.mobileNavButton,
                activeTab === item.name && styles.mobileNavButtonActive
              ]}
              onPress={() => onNavigation(item.route)}
            >
              <IconComponent
                size={24}
                color={activeTab === item.name ? '#FFFFFF' : '#666666'}
              />
            </TouchableOpacity>
          );
        })}
      </>
    );
  }

  return (
    <View style={styles.desktopNavItems}>
      {filteredNavigationItems.map((item) => {
        const IconComponent = RadixIcons[item.icon];
        return (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.desktopNavButton,
              activeTab === item.name && styles.desktopNavButtonActive
            ]}
            onPress={() => onNavigation(item.route)}
          >
            <IconComponent
              size={22}
              color={activeTab === item.name ? '#FF6B35' : '#666666'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
}); 