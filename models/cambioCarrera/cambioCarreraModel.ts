import { CambioCarreraService } from '@/services/cambioCarrera/cambioCarreraService';

export class CambioCarreraModel {
  // Crear una nueva petición de cambio de carrera
  static async crearPeticion(peticion: any): Promise<any> {
    return await CambioCarreraService.crearPeticion(peticion);
  }

  // Verificar si ya existe una petición duplicada
  static async verificarPeticionDuplicada(peticion: any): Promise<boolean> {
    return await CambioCarreraService.verificarPeticionDuplicada(peticion);
  }

  // Verificar si un alumno tiene trámites pendientes
  static async verificarTramitesPendientes(alumno_id: number): Promise<{
    tieneTramitesPendientes: boolean;
    tramitesPendientes: string[];
    status: string;
    documentosFaltantes: string[];
  }> {
    return await CambioCarreraService.verificarTramitesPendientes(alumno_id);
  }

  // Obtener historial de peticiones de cambio de carrera de un alumno
  static async obtenerHistorialPeticiones(alumno_id: number): Promise<any[]> {
    return await CambioCarreraService.obtenerHistorialPeticiones(alumno_id);
  }

  // Obtener peticiones pendientes de un alumno específico
  static async obtenerPeticionesPendientesAlumno(alumno_id: number): Promise<any[]> {
    return await CambioCarreraService.obtenerPeticionesPendientesAlumno(alumno_id);
  }

  // Verificar si un usuario pertenece a Control Escolar
  static async esControlEscolar(userEmail: string): Promise<boolean> {
    return await CambioCarreraService.esControlEscolar(userEmail);
  }

  // Obtener documentos faltantes de un alumno
  static async obtenerDocumentosFaltantes(alumno_id: number): Promise<{
    documentosFaltantes: string[];
    documentosSubidos: string[];
    documentosInfo: any[];
  }> {
    return await CambioCarreraService.obtenerDocumentosFaltantes(alumno_id);
  }

  // Agregar documento faltante (solo Control Escolar)
  static async agregarDocumentoFaltante(
    alumno_id: number,
    tipo_documento: string,
    url_archivo: string,
    userEmail: string
  ): Promise<boolean> {
    return await CambioCarreraService.agregarDocumentoFaltante(alumno_id, tipo_documento, url_archivo, userEmail);
  }

  // Actualizar status del alumno cuando todos los documentos estén completos
  static async actualizarStatusAlumno(alumno_id: number): Promise<boolean> {
    return await CambioCarreraService.actualizarStatusAlumno(alumno_id);
  }

  // Obtener peticiones por asesor
  static async getPeticionesPorAsesor(asesor_id: number): Promise<any[]> {
    return await CambioCarreraService.getPeticionesPorAsesor(asesor_id);
  }

  // Obtener todas las peticiones pendientes
  static async getPeticionesPendientes(): Promise<any[]> {
    return await CambioCarreraService.getPeticionesPendientes();
  }

  // Obtener una petición específica
  static async getPeticion(id: number): Promise<any> {
    return await CambioCarreraService.getPeticion(id);
  }

  // Aprobar petición de cambio de carrera
  static async aprobarPeticion(peticion_id: number, jefe_id: number, contraseña_jefe: string): Promise<boolean> {
    return await CambioCarreraService.aprobarPeticion(peticion_id, jefe_id, contraseña_jefe);
  }

  // Rechazar petición de cambio de carrera
  static async rechazarPeticion(peticion_id: number, jefe_id: number, contraseña_jefe: string, comentarios?: string): Promise<boolean> {
    return await CambioCarreraService.rechazarPeticion(peticion_id, jefe_id, contraseña_jefe, comentarios);
  }

  // Obtener notificaciones de un usuario
  static async getNotificaciones(usuario_id: number): Promise<any[]> {
    return await CambioCarreraService.getNotificaciones(usuario_id);
  }

  // Marcar notificación como leída
  static async marcarNotificacionLeida(notificacion_id: number): Promise<void> {
    return await CambioCarreraService.marcarNotificacionLeida(notificacion_id);
  }

  // Obtener cantidad de notificaciones no leídas
  static async getNotificacionesNoLeidas(usuario_id: number): Promise<number> {
    return await CambioCarreraService.getNotificacionesNoLeidas(usuario_id);
  }

  // Verificar si un usuario es jefe de ventas
  static async verificarJefeVentas(jefe_id: number, contraseña: string): Promise<boolean> {
    return await CambioCarreraService.verificarJefeVentas(jefe_id, contraseña);
  }

  // Verificar que un alumno existe
  static async verificarAlumno(alumno_id: number): Promise<boolean> {
    return await CambioCarreraService.verificarAlumno(alumno_id);
  }

  // Verificar que una carrera existe
  static async verificarCarrera(carrera_id: number): Promise<boolean> {
    return await CambioCarreraService.verificarCarrera(carrera_id);
  }

  // Verificar que un ciclo existe
  static async verificarCiclo(ciclo_id: number): Promise<boolean> {
    return await CambioCarreraService.verificarCiclo(ciclo_id);
  }

  // Mover archivos del alumno en el bucket cuando se aprueba el cambio
  static async moverArchivosAlumno(
    alumno_id: number, 
    carrera_actual: string, 
    carrera_nueva: string,
    ciclo_actual: string,
    ciclo_nuevo: string,
    grupo_actual: string,
    grupo_nuevo: string,
    matricula: string
  ): Promise<void> {
    try {
      const { supabase } = await import('@/services/supabase/supaConf');
      
      // Construir rutas
      const rutaActual = [
        'ventas', carrera_actual, ciclo_actual, grupo_actual, matricula
      ].map(s => s.replace(/\s+/g, '_').toLowerCase()).join('/');

      const rutaNueva = [
        'ventas', carrera_nueva, ciclo_nuevo, grupo_nuevo, matricula
      ].map(s => s.replace(/\s+/g, '_').toLowerCase()).join('/');

      // Listar archivos en la carpeta actual
      const { data: archivos, error: listError } = await supabase
        .storage
        .from('crmum')
        .list(rutaActual);

      if (listError) {
        console.warn('Error al listar archivos:', listError);
        return;
      }

      if (!archivos || archivos.length === 0) {
        console.log('No hay archivos para mover');
        return;
      }

      // Mover cada archivo
      for (const archivo of archivos) {
        if (archivo.name === '.placeholder.txt') continue; // Saltar placeholder

        const rutaOrigen = `${rutaActual}/${archivo.name}`;
        const rutaDestino = `${rutaNueva}/${archivo.name}`;

        // Copiar archivo a nueva ubicación
        const { error: copyError } = await supabase
          .storage
          .from('crmum')
          .copy(rutaOrigen, rutaDestino);

        if (copyError) {
          console.warn(`Error al copiar ${archivo.name}:`, copyError);
          continue;
        }

        // Eliminar archivo original
        const { error: deleteError } = await supabase
          .storage
          .from('crmum')
          .remove([rutaOrigen]);

        if (deleteError) {
          console.warn(`Error al eliminar ${archivo.name}:`, deleteError);
        }
      }

      // Crear placeholder en nueva carpeta
      const { error: placeholderError } = await supabase
        .storage
        .from('crmum')
        .upload(`${rutaNueva}/.placeholder.txt`, new Blob(['placeholder']), {
          upsert: true,
          contentType: 'text/plain'
        });

      if (placeholderError) {
        console.warn('Error al crear placeholder en nueva carpeta:', placeholderError);
      }

    } catch (error) {
      console.error('Error al mover archivos:', error);
      throw error;
    }
  }
} 