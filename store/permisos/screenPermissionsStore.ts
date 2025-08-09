import { ScreenPermissionsController } from '@/controller/permisos/screenPermissionsController';
import { UserScreenAccess } from '@/models/permisos/screenPermissionsModel';
import { create } from 'zustand';

interface ScreenPermissionsState {
  userRoleInfo: any;
  isLoading: boolean;
  error: string | null;
  userPermissions: { [key: string]: boolean };
  
  // Actions
  checkScreenAccess: (email: string, screenName: string) => Promise<UserScreenAccess>;
  loadUserRoleInfo: (email: string) => Promise<void>;
  hasScreenAccess: (screenName: string) => boolean;
  resetState: () => void;
}

export const useScreenPermissionsStore = create<ScreenPermissionsState>((set, get) => ({
  userRoleInfo: null,
  isLoading: false,
  error: null,
  userPermissions: {},

  checkScreenAccess: async (email: string, screenName: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await ScreenPermissionsController.checkUserScreenAccess(email, screenName);
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al verificar permisos',
        isLoading: false 
      });
      return {
        hasAccess: false,
        reason: 'Error al verificar permisos'
      };
    }
  },

  loadUserRoleInfo: async (email: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const userRoleInfo = await ScreenPermissionsController.getUserRoleInfo(email);
      
      // Calcular permisos una sola vez cuando se carga la información del usuario
      const userPermissions = get().calculateUserPermissions(userRoleInfo);
      
      set({ userRoleInfo, userPermissions, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar información del usuario',
        isLoading: false 
      });
    }
  },

  hasScreenAccess: (screenName: string) => {
    const { userPermissions } = get();
    return userPermissions[screenName] || false;
  },

  calculateUserPermissions: (userRoleInfo: any) => {
    if (!userRoleInfo) return {};
    
    const { rolarea, nombrearea } = userRoleInfo || ({} as any);
    
    // Configuración de permisos por pantalla
    const screenPermissions: { [key: string]: { roles: string[], areas: string[] } } = {
      'explore': {
        roles: ['Asesor', 'Jefe de Ventas', 'jefe de coordinacion', 'jefe de control', 'jefe de caja', 'superSu', 'administrador', 'director'],
        areas: ['Ventas', 'Coordinación', 'Control Escolar', 'Caja', 'Administrador', 'Dirección', 'superSu']
      },
      'altaAlumno': {
        roles: ['Asesor', 'Jefe de Ventas', 'jefe de coordinacion'],
        areas: ['Ventas', 'Coordinación']
      },
      'altaUsuario': {
        roles: ['superSu', 'administrador', 'director'],
        areas: ['superSu', 'Administrador', 'Dirección']
      },
      'gestionPeticiones': {
        // Gestión de Peticiones también es la pantalla donde se firman
        // Acceso: Asesor (consulta/creación), Jefe de Ventas (gestiona),
        // y firmantes: director y jefes de áreas (coordinación, control, caja)
        roles: ['Asesor', 'Jefe de Ventas', 'jefe de coordinacion', 'jefe de control', 'jefe de caja', 'director', 'superSu', 'administrador'],
        areas: ['Ventas', 'Coordinación', 'Control Escolar', 'Caja', 'Dirección', 'Administrador', 'superSu']
      },
      'firmas': {
        // Acceso a pantalla de firmas: jefes (de cualquier área) y director
        roles: ['director', 'jefe de coordinacion', 'jefe de control', 'jefe de caja'],
        areas: ['Dirección', 'Coordinación', 'Control Escolar', 'Caja']
      },
      'notificaciones': {
        roles: ['Asesor', 'Jefe de Ventas', 'jefe de coordinacion', 'jefe de control', 'jefe de caja', 'superSu', 'administrador', 'director'],
        areas: ['Ventas', 'Coordinación', 'Control Escolar', 'Caja', 'Administrador', 'Dirección', 'superSu']
      }
    };

    const permissions: { [key: string]: boolean } = {};
    
    Object.keys(screenPermissions).forEach(screenName => {
      const permission = screenPermissions[screenName];
      const role = (rolarea || '').toLowerCase();
      const area = (nombrearea || '').toLowerCase();
      const hasRoleAccess = permission.roles.map(r => r.toLowerCase()).includes(role)
        || (/^jefe(\s+de)?\s+/i.test(rolarea || '') && screenName === 'firmas');
      const hasAreaAccess = permission.areas.map(a => a.toLowerCase()).includes(area);
      permissions[screenName] = hasRoleAccess && hasAreaAccess;
    });

    return permissions;
  },

  resetState: () => {
    set({
      userRoleInfo: null,
      isLoading: false,
      error: null,
      userPermissions: {}
    });
  }
})); 