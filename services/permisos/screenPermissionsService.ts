import { UserRoleInfo } from '@/models/permisos/roleBasedContentModel';
import { ScreenPermission, UserScreenAccess } from '@/models/permisos/screenPermissionsModel';
import { supabase } from '@/services/supabase/supaConf';

export class ScreenPermissionsService {
  static async getUserRoleInfo(email: string): Promise<UserRoleInfo | null> {
    try {
      // Obtener información del usuario y su área
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuariosum')
        .select('idusuario, idarea')
        .eq('correoinstitucional', email)
        .single();

      if (usuarioError) {
        return null;
      }

      // Obtener información del área
      // Usuario sin área => superSU (acceso total)
      if (!usuario?.idarea) {
        return {
          idusuario: usuario.idusuario,
          idarea: null as unknown as number,
          nombrearea: 'superSu',
          rolarea: 'superSu'
        } as unknown as UserRoleInfo;
      }

      const { data: area, error: areaError } = await supabase
        .from('areas')
        .select('nombrearea, rolarea')
        .eq('idarea', usuario.idarea)
        .single();

      if (areaError || !area) {
        return null;
      }

      return {
        idusuario: usuario.idusuario,
        idarea: usuario.idarea,
        nombrearea: area.nombrearea,
        rolarea: area.rolarea
      };
    } catch (error) {
      console.error('Error al obtener información del rol del usuario:', error);
      return null;
    }
  }

  static checkScreenAccess(
    screenName: string, 
    userRole: string, 
    userArea: string
  ): UserScreenAccess {
    // Configuración de permisos por pantalla basada en los datos reales
    const screenPermissions: { [key: string]: ScreenPermission } = {
      'explore': {
        screenName: 'explore',
        allowedRoles: ['Asesor', 'Jefe de Ventas', 'jefe de coordinacion', 'jefe de control', 'jefe de caja', 'superSu', 'administrador'],
        allowedAreas: ['Ventas', 'Coordinación', 'Control Escolar', 'Caja', 'Administrador']
      },
      'altaAlumno': {
        screenName: 'altaAlumno',
        allowedRoles: ['Asesor', 'Jefe de Ventas', 'jefe de coordinacion'],
        allowedAreas: ['Ventas', 'Coordinación']
      },
      'altaUsuario': {
        screenName: 'altaUsuario',
        allowedRoles: ['superSu', 'administrador', 'director'],
        allowedAreas: ['superSu', 'Administrador', 'Dirección']
      },
      'gestionPeticiones': {
        screenName: 'gestionPeticiones',
        allowedRoles: ['Asesor', 'Jefe de Ventas', 'jefe de coordinacion'],
        allowedAreas: ['Ventas', 'Coordinación']
      },
      'notificaciones': {
        screenName: 'notificaciones',
        allowedRoles: ['Asesor', 'Jefe de Ventas', 'jefe de coordinacion', 'jefe de control', 'jefe de caja', 'superSu', 'administrador', 'director'],
        allowedAreas: ['Ventas', 'Coordinación', 'Control Escolar', 'Caja', 'Administrador', 'Dirección']
      }
    };

    const permission = screenPermissions[screenName];
    
    if (!permission) {
      return {
        hasAccess: false,
        reason: 'Pantalla no configurada en permisos'
      };
    }

    // Comparación directa sin transformar a lower case
    const hasRoleAccess = (permission.allowedRoles || []).includes(userRole || '');
    const hasAreaAccess = !permission.allowedAreas || (permission.allowedAreas || []).includes(userArea || '');

    const hasAccess = hasRoleAccess && hasAreaAccess;

    return {
      hasAccess,
      reason: hasAccess ? undefined : 'Rol o área no autorizada para esta pantalla'
    };
  }
} 