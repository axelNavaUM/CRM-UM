import { useAuth } from '@/context/AuthContext';
import { UserScreenAccess } from '@/models/permisos/screenPermissionsModel';
import { useScreenPermissionsStore } from '@/store/permisos/screenPermissionsStore';
import { useEffect } from 'react';

export const useScreenPermissions = () => {
  const { user } = useAuth();
  const { 
    checkScreenAccess, 
    loadUserRoleInfo, 
    hasScreenAccess: storeHasScreenAccess,
    isLoading, 
    error, 
    userRoleInfo 
  } = useScreenPermissionsStore();

  // Cargar información del usuario al montar el hook
  useEffect(() => {
    if (user?.email) {
      loadUserRoleInfo(user.email);
    }
  }, [user?.email]);

  const hasScreenAccess = (screenName: string): boolean => {
    return storeHasScreenAccess(screenName);
  };

  const canAccessFeature = (featureName: string): boolean => {
    // Mapeo de características a pantallas
    const featureToScreenMap: { [key: string]: string } = {
      'search': 'explore',
      'notifications': 'notificaciones',
      'alta_alumnos': 'altaAlumno',
      'alta_usuarios': 'altaUsuario',
      'gestion_peticiones': 'gestionPeticiones'
    };
    
    const screenName = featureToScreenMap[featureName];
    if (!screenName) {
      console.warn(`Feature '${featureName}' no mapeada a ninguna pantalla`);
      return false;
    }
    
    return storeHasScreenAccess(screenName);
  };

  const checkAccess = async (screenName: string): Promise<UserScreenAccess> => {
    if (!user?.email) {
      return {
        hasAccess: false,
        reason: 'Usuario no autenticado'
      };
    }

    try {
      const result = await checkScreenAccess(user.email, screenName);
      return result;
    } catch (error) {
      console.error('Error al verificar acceso a pantalla:', error);
      return {
        hasAccess: false,
        reason: 'Error al verificar permisos'
      };
    }
  };

  const clearCache = () => {
    // El caché ahora se maneja en el store
  };

  return {
    hasScreenAccess,
    canAccessFeature,
    checkAccess,
    clearCache,
    isLoading,
    error
  };
}; 