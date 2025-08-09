import { UserScreenAccess } from '@/models/permisos/screenPermissionsModel';
import { ScreenPermissionsService } from '@/services/permisos/screenPermissionsService';

export class ScreenPermissionsController {
  static async checkUserScreenAccess(email: string, screenName: string): Promise<UserScreenAccess> {
    try {
      if (!email) {
        return {
          hasAccess: false,
          reason: 'Usuario no autenticado'
        };
      }

      const userRoleInfo = await ScreenPermissionsService.getUserRoleInfo(email);
      
      if (!userRoleInfo) {
        return {
          hasAccess: false,
          reason: 'No se pudo obtener información del usuario'
        };
      }

      const userRole = userRoleInfo.rolarea || 'asesor';
      const userArea = userRoleInfo.nombrearea || '';

      return ScreenPermissionsService.checkScreenAccess(screenName, userRole, userArea);

    } catch (error) {
      console.error('Error al verificar permisos de pantalla:', error);
      return {
        hasAccess: false,
        reason: 'Error al verificar permisos'
      };
    }
  }

  static async getUserRoleInfo(email: string) {
    try {
      return await ScreenPermissionsService.getUserRoleInfo(email);
    } catch (error) {
      console.error('Error al obtener información del rol:', error);
      return null;
    }
  }
} 