import { DashboardMetrics, RoleBasedContent } from '@/models/permisos/roleBasedContentModel';
import { RoleBasedContentService } from '@/services/permisos/roleBasedContentService';

export class RoleBasedContentController {
  static async determineContentByRole(email: string): Promise<RoleBasedContent> {
    console.log('[DEBUG] determineContentByRole llamado con email:', email);
    
    if (!email) {
      console.log('[DEBUG] No hay email, retornando contenido por defecto');
      return this.getDefaultContent();
    }

    try {
      const userRoleInfo = await RoleBasedContentService.getUserRoleInfo(email);
      
      console.log('[DEBUG] userRoleInfo obtenido:', userRoleInfo);
      
      if (!userRoleInfo) {
        console.log('[DEBUG] No se pudo obtener userRoleInfo, retornando contenido por defecto');
        return this.getDefaultContent();
      }

      const userRole = userRoleInfo.rolarea || 'asesor';
      const userArea = userRoleInfo.nombrearea || '';

      console.log('[DEBUG] Rol y área del usuario:', { userRole, userArea });

      // Determinar contenido basado en el rol
      let contentConfig: RoleBasedContent = {
        showCareerChangePetitions: false,
        showLogs: false,
        showStudentsByGroups: false,
        showStudentsWithMissingDocuments: false,
        showStudentsWithPendingPayments: false,
        showAsesorStudents: false,
        showMetrics: false,
        showDefaultContent: true,
        role: userRole,
        area: userArea
      };

      const matchesAny = (value: string, patterns: RegExp[]) => patterns.some(p => p.test(value || ''));

      if (matchesAny(userRole, [/^asesor\b/i, /^asesor\s+ventas/i, /^asesor\s+del\s+área\s+ventas/i])) {
        // Mostrar alumnos del asesor y permitir también ver peticiones si aplica
        contentConfig = {
          ...contentConfig,
          showAsesorStudents: true,
          showCareerChangePetitions: true,
          showDefaultContent: false,
        };
      } else if (matchesAny(userRole, [/^super\s*su$/i, /^supersu$/i, /^administrador$/i])) {
        contentConfig = {
          ...contentConfig,
          showLogs: true,
          showDefaultContent: false,
        };
      } else if (matchesAny(userRole, [/^jefe\s+de\s+coordinaci[óo]n$/i, /^coordinador$/i])) {
        contentConfig = {
          ...contentConfig,
          showStudentsByGroups: true,
          showCareerChangePetitions: true,
          showDefaultContent: false,
        };
      } else if (matchesAny(userRole, [/^jefe\s+de\s+control$/i, /^control\s+escolar$/i])) {
        contentConfig = {
          ...contentConfig,
          showStudentsWithMissingDocuments: true,
          showDefaultContent: false,
        };
      } else if (matchesAny(userRole, [/^jefe\s+de\s+caja$/i, /^caja$/i])) {
        contentConfig = {
          ...contentConfig,
          showStudentsWithPendingPayments: true,
          showDefaultContent: false,
        };
      } else if (matchesAny(userRole, [/^jefe\s+de\s+ventas$/i])) {
        contentConfig = {
          ...contentConfig,
          showMetrics: true,
          showDefaultContent: false,
        };
      } else if (matchesAny(userRole, [/^director$/i])) {
        contentConfig = {
          ...contentConfig,
          showCareerChangePetitions: true,
          showDefaultContent: false,
        };
      } else {
        contentConfig = {
          ...contentConfig,
          showDefaultContent: true,
        };
      }

      console.log('[DEBUG] Configuración de contenido final:', contentConfig);
      return contentConfig;

    } catch (error) {
      console.error('Error al determinar contenido por rol:', error);
      return this.getDefaultContent();
    }
  }

  static async loadDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      return await RoleBasedContentService.getDashboardMetrics();
    } catch (error) {
      console.error('Error al cargar métricas:', error);
      return {
        totalRegistrations: 0,
        pendingRegistrations: 0,
        totalPetitions: 0,
        pendingPetitions: 0,
        registrationsByAdvisor: {},
        petitionsByAdvisor: {}
      };
    }
  }

  private static getDefaultContent(): RoleBasedContent {
    return {
      showCareerChangePetitions: false,
      showLogs: false,
      showStudentsByGroups: false,
      showStudentsWithMissingDocuments: false,
      showStudentsWithPendingPayments: false,
      showAsesorStudents: false,
      showMetrics: false,
      showDefaultContent: true,
      role: 'lector',
      area: ''
    };
  }
} 