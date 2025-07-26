import { CambioCarreraModel } from '@/models/cambioCarrera/cambioCarreraModel';

export class CambioCarreraController {
  // Crear una nueva petición de cambio de carrera
  static async crearPeticion(peticion: any): Promise<any> {
    console.log('🎮 Controller: Iniciando crearPeticion...');
    console.log('📋 Controller: Datos de petición:', peticion);
    
    // Validaciones básicas
    if (!peticion.alumno_id || !peticion.asesor_id || !peticion.carrera_nueva_id || !peticion.ciclo_nuevo_id) {
      console.log('❌ Controller: Faltan campos obligatorios');
      throw new Error('Faltan campos obligatorios para crear la petición');
    }

    if (!peticion.motivo || peticion.motivo.trim().length === 0) {
      console.log('❌ Controller: Motivo vacío');
      throw new Error('El motivo del cambio de carrera es obligatorio');
    }

    console.log('🔍 Controller: Verificando que el alumno existe...');
    // Verificar que el alumno existe
    const alumnoExiste = await CambioCarreraModel.verificarAlumno(peticion.alumno_id);
    if (!alumnoExiste) {
      console.log('❌ Controller: Alumno no existe');
      throw new Error('El alumno especificado no existe');
    }

    console.log('🔍 Controller: Verificando que la carrera existe...');
    // Verificar que la nueva carrera existe
    const carreraExiste = await CambioCarreraModel.verificarCarrera(peticion.carrera_nueva_id);
    if (!carreraExiste) {
      console.log('❌ Controller: Carrera no existe');
      throw new Error('La nueva carrera especificada no existe');
    }

    console.log('🔍 Controller: Verificando que el ciclo existe...');
    // Verificar que el nuevo ciclo existe
    const cicloExiste = await CambioCarreraModel.verificarCiclo(peticion.ciclo_nuevo_id);
    if (!cicloExiste) {
      console.log('❌ Controller: Ciclo no existe');
      throw new Error('El nuevo ciclo especificado no existe');
    }

    console.log('✅ Controller: Todas las validaciones pasaron, creando petición...');
    // Crear la petición
    const resultado = await CambioCarreraModel.crearPeticion(peticion);
    console.log('✅ Controller: Petición creada exitosamente:', resultado);
    return resultado;
  }

  // Obtener peticiones por asesor
  static async getPeticionesPorAsesor(asesor_id: number): Promise<any[]> {
    if (!asesor_id) {
      throw new Error('ID de asesor es requerido');
    }

    return await CambioCarreraModel.getPeticionesPorAsesor(asesor_id);
  }

  // Obtener todas las peticiones pendientes
  static async getPeticionesPendientes(): Promise<any[]> {
    return await CambioCarreraModel.getPeticionesPendientes();
  }

  // Obtener una petición específica
  static async getPeticion(id: number): Promise<any> {
    if (!id) {
      throw new Error('ID de petición es requerido');
    }

    return await CambioCarreraModel.getPeticion(id);
  }

  // Aprobar petición de cambio de carrera
  static async aprobarPeticion(peticion_id: number, jefe_id: number, contraseña_jefe: string): Promise<boolean> {
    if (!peticion_id || !jefe_id || !contraseña_jefe) {
      throw new Error('Todos los campos son requeridos para aprobar la petición');
    }

    // Verificar que la petición existe y está pendiente
    const peticion = await CambioCarreraModel.getPeticion(peticion_id);
    if (peticion.estado !== 'pendiente') {
      throw new Error('La petición no está en estado pendiente');
    }

    // Verificar que el jefe tiene permisos
    const esJefeVentas = await CambioCarreraModel.verificarJefeVentas(jefe_id, contraseña_jefe);
    if (!esJefeVentas) {
      throw new Error('Credenciales de jefe inválidas o sin permisos suficientes');
    }

    return await CambioCarreraModel.aprobarPeticion(peticion_id, jefe_id, contraseña_jefe);
  }

  // Rechazar petición de cambio de carrera
  static async rechazarPeticion(peticion_id: number, jefe_id: number, contraseña_jefe: string, comentarios?: string): Promise<boolean> {
    if (!peticion_id || !jefe_id || !contraseña_jefe) {
      throw new Error('Todos los campos son requeridos para rechazar la petición');
    }

    // Verificar que la petición existe y está pendiente
    const peticion = await CambioCarreraModel.getPeticion(peticion_id);
    if (peticion.estado !== 'pendiente') {
      throw new Error('La petición no está en estado pendiente');
    }

    // Verificar que el jefe tiene permisos
    const esJefeVentas = await CambioCarreraModel.verificarJefeVentas(jefe_id, contraseña_jefe);
    if (!esJefeVentas) {
      throw new Error('Credenciales de jefe inválidas o sin permisos suficientes');
    }

    return await CambioCarreraModel.rechazarPeticion(peticion_id, jefe_id, contraseña_jefe, comentarios);
  }

  // Obtener notificaciones de un usuario
  static async getNotificaciones(usuario_id: number): Promise<any[]> {
    if (!usuario_id) {
      throw new Error('ID de usuario es requerido');
    }

    return await CambioCarreraModel.getNotificaciones(usuario_id);
  }

  // Marcar notificación como leída
  static async marcarNotificacionLeida(notificacion_id: number): Promise<void> {
    if (!notificacion_id) {
      throw new Error('ID de notificación es requerido');
    }

    return await CambioCarreraModel.marcarNotificacionLeida(notificacion_id);
  }

  // Obtener cantidad de notificaciones no leídas
  static async getNotificacionesNoLeidas(usuario_id: number): Promise<number> {
    if (!usuario_id) {
      throw new Error('ID de usuario es requerido');
    }

    return await CambioCarreraModel.getNotificacionesNoLeidas(usuario_id);
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
    if (!alumno_id || !carrera_actual || !carrera_nueva || !ciclo_actual || !ciclo_nuevo || !grupo_actual || !grupo_nuevo || !matricula) {
      throw new Error('Todos los parámetros son requeridos para mover archivos');
    }

    return await CambioCarreraModel.moverArchivosAlumno(
      alumno_id, 
      carrera_actual, 
      carrera_nueva,
      ciclo_actual,
      ciclo_nuevo,
      grupo_actual,
      grupo_nuevo,
      matricula
    );
  }
} 