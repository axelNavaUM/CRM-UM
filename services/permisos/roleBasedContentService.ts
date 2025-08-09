import { DashboardMetrics, UserRoleInfo } from '@/models/permisos/roleBasedContentModel';
import { supabase } from '@/services/supabase/supaConf';

export class RoleBasedContentService {
  static async getUserRoleInfo(email: string): Promise<UserRoleInfo | null> {
    try {
      console.log('[DEBUG] Buscando usuario con email:', email);
      
      // Obtener información del usuario y su área
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuariosum')
        .select('idusuario, idarea')
        .eq('correoinstitucional', email)
        .single();

      console.log('[DEBUG] Resultado de búsqueda de usuario:', { usuario, usuarioError });

      if (usuarioError || !usuario?.idarea) {
        console.log('[DEBUG] Error o usuario no encontrado:', usuarioError);
        return null;
      }

      console.log('[DEBUG] Usuario encontrado, buscando área con idarea:', usuario.idarea);

      // Obtener información del área
      const { data: area, error: areaError } = await supabase
        .from('areas')
        .select('nombrearea, rolarea')
        .eq('idarea', usuario.idarea)
        .single();

      console.log('[DEBUG] Resultado de búsqueda de área:', { area, areaError });

      if (areaError || !area) {
        console.log('[DEBUG] Error o área no encontrada:', areaError);
        return null;
      }

      const userRoleInfo = {
        idusuario: usuario.idusuario,
        idarea: usuario.idarea,
        nombrearea: area.nombrearea,
        rolarea: area.rolarea
      };

      console.log('[DEBUG] Información del rol del usuario obtenida:', userRoleInfo);

      return userRoleInfo;
    } catch (error) {
      console.error('Error al obtener información del rol del usuario:', error);
      return null;
    }
  }

  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Obtener métricas de registros por asesor
      const { data: registrationsByAdvisor } = await supabase
        .from('alumnos')
        .select('asesor_id, id, status')
        .not('asesor_id', 'is', null);

      const registrationsByAdvisorMap: { [key: string]: number } = {};
      registrationsByAdvisor?.forEach(alumno => {
        const advisorId = alumno.asesor_id?.toString() || 'Sin Asesor';
        registrationsByAdvisorMap[advisorId] = (registrationsByAdvisorMap[advisorId] || 0) + 1;
      });

      // Obtener métricas de peticiones por asesor
      const { data: petitionsByAdvisor } = await supabase
        .from('peticiones_cambio_carrera')
        .select('asesor_id, id, estado')
        .not('asesor_id', 'is', null);

      const petitionsByAdvisorMap: { [key: string]: number } = {};
      petitionsByAdvisor?.forEach(peticion => {
        const advisorId = peticion.asesor_id?.toString() || 'Sin Asesor';
        petitionsByAdvisorMap[advisorId] = (petitionsByAdvisorMap[advisorId] || 0) + 1;
      });

      // Obtener totales
      const totalRegistrations = registrationsByAdvisor?.length || 0;
      const pendingRegistrations = registrationsByAdvisor?.filter(a => a.status === 'pendiente').length || 0;
      const totalPetitions = petitionsByAdvisor?.length || 0;
      const pendingPetitions = petitionsByAdvisor?.filter(p => p.estado === 'pendiente').length || 0;

      return {
        totalRegistrations,
        pendingRegistrations,
        totalPetitions,
        pendingPetitions,
        registrationsByAdvisor: registrationsByAdvisorMap,
        petitionsByAdvisor: petitionsByAdvisorMap
      };
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
} 