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

    console.log('🔍 Controller: Verificando peticiones duplicadas...');
    // Verificar que no existe una petición duplicada
    const existeDuplicada = await CambioCarreraModel.verificarPeticionDuplicada(peticion);
    if (existeDuplicada) {
      console.log('❌ Controller: Petición duplicada detectada');
      throw new Error('Ya existe una petición similar para este alumno. No se pueden crear peticiones duplicadas.');
    }

    console.log('🔍 Controller: Verificando trámites pendientes...');
    // Verificar que el alumno no tiene trámites pendientes
    const { tieneTramitesPendientes, tramitesPendientes } = await CambioCarreraModel.verificarTramitesPendientes(peticion.alumno_id);
    if (tieneTramitesPendientes) {
      console.log('❌ Controller: Alumno tiene trámites pendientes');
      throw new Error(`No se puede crear la petición. El alumno tiene trámites pendientes: ${tramitesPendientes.join(', ')}`);
    }

    console.log('✅ Controller: Todas las validaciones pasaron, creando petición...');
    const resultado = await CambioCarreraModel.crearPeticion(peticion);
    console.log('✅ Controller: Petición creada exitosamente');
    return resultado;
  }

  // Verificar si un usuario pertenece a Control Escolar
  static async esControlEscolar(userEmail: string): Promise<boolean> {
    console.log('🔍 Controller: Verificando si es Control Escolar para usuario:', userEmail);
    const resultado = await CambioCarreraModel.esControlEscolar(userEmail);
    console.log('📋 Controller: Resultado verificación Control Escolar:', resultado);
    return resultado;
  }

  // Obtener documentos faltantes de un alumno
  static async obtenerDocumentosFaltantes(alumno_id: number): Promise<{
    documentosFaltantes: string[];
    documentosSubidos: string[];
    documentosInfo: any[];
  }> {
    console.log('🔍 Controller: Obteniendo documentos faltantes para alumno:', alumno_id);
    const resultado = await CambioCarreraModel.obtenerDocumentosFaltantes(alumno_id);
    console.log('📋 Controller: Documentos faltantes obtenidos:', resultado);
    return resultado;
  }

  // Agregar documento faltante (solo Control Escolar)
  static async agregarDocumentoFaltante(
    alumno_id: number,
    tipo_documento: string,
    url_archivo: string,
    userEmail: string
  ): Promise<boolean> {
    console.log('🔍 Controller: Agregando documento faltante...');
    console.log('📋 Controller: Datos - Alumno:', alumno_id, 'Tipo:', tipo_documento, 'Usuario:', userEmail);
    
    const resultado = await CambioCarreraModel.agregarDocumentoFaltante(alumno_id, tipo_documento, url_archivo, userEmail);
    console.log('✅ Controller: Documento agregado exitosamente');
    return resultado;
  }

  // Actualizar status del alumno cuando todos los documentos estén completos
  static async actualizarStatusAlumno(alumno_id: number): Promise<boolean> {
    console.log('🔍 Controller: Actualizando status del alumno:', alumno_id);
    const resultado = await CambioCarreraModel.actualizarStatusAlumno(alumno_id);
    console.log('📋 Controller: Resultado actualización status:', resultado);
    return resultado;
  }

  // Verificar si un alumno tiene trámites pendientes
  static async verificarTramitesPendientes(alumno_id: number): Promise<{
    tieneTramitesPendientes: boolean;
    tramitesPendientes: string[];
    status: string;
    documentosFaltantes: string[];
  }> {
    console.log('🔍 Controller: Verificando trámites pendientes para alumno:', alumno_id);
    const resultado = await CambioCarreraModel.verificarTramitesPendientes(alumno_id);
    console.log('📋 Controller: Resultado verificación trámites:', resultado);
    return resultado;
  }

  // Obtener historial de peticiones de cambio de carrera de un alumno
  static async obtenerHistorialPeticiones(alumno_id: number): Promise<any[]> {
    console.log('🔍 Controller: Obteniendo historial de peticiones para alumno:', alumno_id);
    const historial = await CambioCarreraModel.obtenerHistorialPeticiones(alumno_id);
    console.log('📋 Controller: Historial obtenido:', historial.length, 'peticiones');
    return historial;
  }

  // Obtener peticiones pendientes de un alumno específico
  static async obtenerPeticionesPendientesAlumno(alumno_id: number): Promise<any[]> {
    console.log('🔍 Controller: Obteniendo peticiones pendientes para alumno:', alumno_id);
    const peticiones = await CambioCarreraModel.obtenerPeticionesPendientesAlumno(alumno_id);
    console.log('📋 Controller: Peticiones pendientes obtenidas:', peticiones.length);
    return peticiones;
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