import { Permiso, PermisosModel, PoliticaRLS } from '@/models/permisos/permisosModel';

export interface CreatePermisoData {
  nombre: string;
  descripcion: string;
  tipo: 'pantalla' | 'funcion' | 'dato';
  area_id: number;
  activo: boolean;
}

export interface UpdatePermisoData {
  nombre?: string;
  descripcion?: string;
  tipo?: 'pantalla' | 'funcion' | 'dato';
  activo?: boolean;
}

export interface CreatePoliticaRLSData {
  nombre: string;
  tabla: string;
  politica: string;
  area_id: number;
  activo: boolean;
}

export interface UpdatePoliticaRLSData {
  nombre?: string;
  tabla?: string;
  politica?: string;
  activo?: boolean;
}

export class PermisosService {
  // Validaciones
  static validatePermisoData(data: CreatePermisoData): void {
    if (!data.nombre || data.nombre.trim().length === 0) {
      throw new Error('El nombre del permiso es obligatorio');
    }
    if (!data.descripcion || data.descripcion.trim().length === 0) {
      throw new Error('La descripción del permiso es obligatoria');
    }
    if (!['pantalla', 'funcion', 'dato'].includes(data.tipo)) {
      throw new Error('El tipo de permiso debe ser: pantalla, funcion o dato');
    }
    if (!data.area_id || data.area_id <= 0) {
      throw new Error('El área es obligatoria');
    }

    // Validación específica según el tipo
    if (data.tipo === 'funcion') {
      if (!this.validarFuncionDisponible(data.nombre)) {
        const funcionesDisponibles = this.getFuncionesDisponibles().slice(0, 5).join(', ');
        throw new Error(`La función "${data.nombre}" no existe en el sistema. Funciones disponibles: ${funcionesDisponibles}...`);
      }
    } else if (data.tipo === 'dato') {
      if (!this.validarDatoDisponible(data.nombre)) {
        const datosDisponibles = this.getDatosDisponibles().slice(0, 5).join(', ');
        throw new Error(`El dato "${data.nombre}" no existe en el sistema. Datos disponibles: ${datosDisponibles}...`);
      }
    }
  }

  static validatePoliticaRLSData(data: CreatePoliticaRLSData): void {
    if (!data.nombre || data.nombre.trim().length === 0) {
      throw new Error('El nombre de la política es obligatorio');
    }
    if (!data.tabla || data.tabla.trim().length === 0) {
      throw new Error('La tabla es obligatoria');
    }
    if (!data.politica || data.politica.trim().length === 0) {
      throw new Error('La política SQL es obligatoria');
    }
    if (!data.area_id || data.area_id <= 0) {
      throw new Error('El área es obligatoria');
    }
  }

  // Transformaciones
  static transformPermisoData(data: CreatePermisoData): Omit<Permiso, 'id' | 'created_at' | 'updated_at'> {
    return {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
      tipo: data.tipo,
      area_id: data.area_id,
      activo: data.activo
    };
  }

  static transformPoliticaRLSData(data: CreatePoliticaRLSData): Omit<PoliticaRLS, 'id' | 'created_at' | 'updated_at'> {
    return {
      nombre: data.nombre.trim(),
      tabla: data.tabla.trim(),
      politica: data.politica.trim(),
      area_id: data.area_id,
      activo: data.activo
    };
  }

  // Operaciones de negocio - Permisos
  static async getAllPermisos(): Promise<Permiso[]> {
    try {
      return await PermisosModel.getAllPermisos();
    } catch (error) {
      throw new Error(`Error en el servicio al obtener permisos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async getPermisosByArea(areaId: number): Promise<Permiso[]> {
    try {
      return await PermisosModel.getPermisosByArea(areaId);
    } catch (error) {
      throw new Error(`Error en el servicio al obtener permisos del área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async createPermiso(data: CreatePermisoData): Promise<Permiso> {
    try {
      this.validatePermisoData(data);
      const transformedData = this.transformPermisoData(data);
      return await PermisosModel.createPermiso(transformedData);
    } catch (error) {
      throw new Error(`Error en el servicio al crear permiso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async updatePermiso(id: number, data: UpdatePermisoData): Promise<void> {
    try {
      const transformedData = {
        ...(data.nombre && { nombre: data.nombre.trim() }),
        ...(data.descripcion && { descripcion: data.descripcion.trim() }),
        ...(data.tipo && { tipo: data.tipo }),
        ...(data.activo !== undefined && { activo: data.activo })
      };
      await PermisosModel.updatePermiso(id, transformedData);
    } catch (error) {
      throw new Error(`Error en el servicio al actualizar permiso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async deletePermiso(id: number): Promise<void> {
    try {
      await PermisosModel.deletePermiso(id);
    } catch (error) {
      throw new Error(`Error en el servicio al eliminar permiso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Operaciones de negocio - Políticas RLS
  static async getAllPoliticasRLS(): Promise<PoliticaRLS[]> {
    try {
      return await PermisosModel.getAllPoliticasRLS();
    } catch (error) {
      throw new Error(`Error en el servicio al obtener políticas RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async getPoliticasByArea(areaId: number): Promise<PoliticaRLS[]> {
    try {
      return await PermisosModel.getPoliticasByArea(areaId);
    } catch (error) {
      throw new Error(`Error en el servicio al obtener políticas del área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async createPoliticaRLS(data: CreatePoliticaRLSData): Promise<PoliticaRLS> {
    try {
      this.validatePoliticaRLSData(data);
      const transformedData = this.transformPoliticaRLSData(data);
      return await PermisosModel.createPoliticaRLS(transformedData);
    } catch (error) {
      throw new Error(`Error en el servicio al crear política RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async updatePoliticaRLS(id: number, data: UpdatePoliticaRLSData): Promise<void> {
    try {
      const transformedData = {
        ...(data.nombre && { nombre: data.nombre.trim() }),
        ...(data.tabla && { tabla: data.tabla.trim() }),
        ...(data.politica && { politica: data.politica.trim() }),
        ...(data.activo !== undefined && { activo: data.activo })
      };
      await PermisosModel.updatePoliticaRLS(id, transformedData);
    } catch (error) {
      throw new Error(`Error en el servicio al actualizar política RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static async deletePoliticaRLS(id: number): Promise<void> {
    try {
      await PermisosModel.deletePoliticaRLS(id);
    } catch (error) {
      throw new Error(`Error en el servicio al eliminar política RLS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Utilidades
  static async getAreasConPermisos(): Promise<any[]> {
    try {
      return await PermisosModel.getAreasConPermisos();
    } catch (error) {
      throw new Error(`Error en el servicio al obtener áreas con permisos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static getTiposPermiso(): string[] {
    return ['pantalla', 'funcion', 'dato'];
  }

  static getTablasDisponibles(): string[] {
    return ['usuariosum', 'areas', 'alumnos', 'carreras', 'ciclos', 'pagos', 'documentos_alumno'];
  }

  // Nuevos métodos para validar funciones y datos disponibles
  static getFuncionesDisponibles(): string[] {
    return [
      // Funciones de búsqueda
      'globalSearch',
      'searchAlumnos',
      'searchUsuariosUM',
      'searchAlumnosByMatricula',
      'searchConfiguraciones',
      'getSearchSuggestions',
      
      // Funciones de cambio de carrera
      'actualizarStatusAlumno',
      'esControlEscolar',
      'obtenerDocumentosFaltantes',
      'agregarDocumentoFaltante',
      'verificarTramitesPendientes',
      'obtenerHistorialPeticiones',
      'obtenerPeticionesPendientesAlumno',
      'verificarPeticionDuplicada',
      'crearPeticion',
      'getPeticionesPorAsesor',
      'getPeticionesPendientes',
      'getPeticion',
      'aprobarPeticion',
      'rechazarPeticion',
      'getNotificaciones',
      'marcarNotificacionLeida',
      'getNotificacionesNoLeidas',
      'verificarJefeVentas',
      'verificarAlumno',
      'verificarCarrera',
      'verificarCiclo',
      
      // Funciones de áreas
      'getAllAreas',
      'getAreaById',
      'createArea',
      'updateArea',
      'deleteArea',
      'getPermisosDisponibles',
      'formatPermisoName',
      
      // Funciones de autenticación
      'googleSignIn',
      'googleAuthService',
      
      // Funciones de persistencia
      'guardarRegistro',
      'leerRegistro',
      'limpiarRegistro',
      
      // Funciones de archivos
      'subirArchivosBucket',
      'validarArchivo',
      'crearCarpetaAlumno'
    ];
  }

  static getDatosDisponibles(): string[] {
    return [
      // Datos de alumnos
      'alumnos',
      'alumnos_activos',
      'alumnos_pendientes',
      'alumnos_con_documentos_faltantes',
      'alumnos_con_pagos_pendientes',
      
      // Datos de usuarios
      'usuariosum',
      'usuarios_por_area',
      'usuarios_activos',
      
      // Datos de áreas
      'areas',
      'areas_con_permisos',
      'areas_activas',
      
      // Datos de carreras
      'carreras',
      'carreras_activas',
      'carreras_por_area',
      
      // Datos de ciclos
      'ciclos',
      'ciclos_activos',
      'ciclos_por_carrera',
      
      // Datos de peticiones
      'cambio_carrera',
      'peticiones_pendientes',
      'peticiones_aprobadas',
      'peticiones_rechazadas',
      'peticiones_por_asesor',
      
      // Datos de documentos
      'documentos_alumno',
      'documentos_faltantes',
      'documentos_subidos',
      
      // Datos de pagos
      'pagos',
      'pagos_pendientes',
      'pagos_completados',
      
      // Datos de notificaciones
      'notificaciones',
      'notificaciones_no_leidas',
      'notificaciones_por_usuario',
      
      // Datos de firmas
      'firmas',
      'firmas_pendientes',
      'firmas_completadas'
    ];
  }

  static validarFuncionDisponible(funcion: string): boolean {
    const funcionesDisponibles = this.getFuncionesDisponibles();
    return funcionesDisponibles.includes(funcion);
  }

  static validarDatoDisponible(dato: string): boolean {
    const datosDisponibles = this.getDatosDisponibles();
    return datosDisponibles.includes(dato);
  }

  static getFuncionesDisponiblesConDescripcion(): Record<string, string> {
    return {
      // Funciones de búsqueda
      'globalSearch': 'Búsqueda global en el sistema',
      'searchAlumnos': 'Búsqueda específica de alumnos',
      'searchUsuariosUM': 'Búsqueda de usuarios UM',
      'searchAlumnosByMatricula': 'Búsqueda de alumnos por matrícula',
      'searchConfiguraciones': 'Búsqueda en configuraciones',
      'getSearchSuggestions': 'Obtener sugerencias de búsqueda',
      
      // Funciones de cambio de carrera
      'actualizarStatusAlumno': 'Actualizar estado del alumno',
      'esControlEscolar': 'Verificar si es Control Escolar',
      'obtenerDocumentosFaltantes': 'Obtener documentos faltantes',
      'agregarDocumentoFaltante': 'Agregar documento faltante',
      'verificarTramitesPendientes': 'Verificar trámites pendientes',
      'obtenerHistorialPeticiones': 'Obtener historial de peticiones',
      'obtenerPeticionesPendientesAlumno': 'Obtener peticiones pendientes del alumno',
      'verificarPeticionDuplicada': 'Verificar petición duplicada',
      'crearPeticion': 'Crear nueva petición',
      'getPeticionesPorAsesor': 'Obtener peticiones por asesor',
      'getPeticionesPendientes': 'Obtener peticiones pendientes',
      'getPeticion': 'Obtener petición específica',
      'aprobarPeticion': 'Aprobar petición',
      'rechazarPeticion': 'Rechazar petición',
      'getNotificaciones': 'Obtener notificaciones',
      'marcarNotificacionLeida': 'Marcar notificación como leída',
      'getNotificacionesNoLeidas': 'Obtener notificaciones no leídas',
      'verificarJefeVentas': 'Verificar jefe de ventas',
      'verificarAlumno': 'Verificar alumno',
      'verificarCarrera': 'Verificar carrera',
      'verificarCiclo': 'Verificar ciclo',
      
      // Funciones de áreas
      'getAllAreas': 'Obtener todas las áreas',
      'getAreaById': 'Obtener área por ID',
      'createArea': 'Crear nueva área',
      'updateArea': 'Actualizar área',
      'deleteArea': 'Eliminar área',
      'getPermisosDisponibles': 'Obtener permisos disponibles',
      'formatPermisoName': 'Formatear nombre de permiso',
      
      // Funciones de autenticación
      'googleSignIn': 'Inicio de sesión con Google',
      'googleAuthService': 'Servicio de autenticación Google',
      
      // Funciones de persistencia
      'guardarRegistro': 'Guardar registro local',
      'leerRegistro': 'Leer registro local',
      'limpiarRegistro': 'Limpiar registro local',
      
      // Funciones de archivos
      'subirArchivosBucket': 'Subir archivos al bucket',
      'validarArchivo': 'Validar archivo',
      'crearCarpetaAlumno': 'Crear carpeta del alumno'
    };
  }

  static getDatosDisponiblesConDescripcion(): Record<string, string> {
    return {
      // Datos de alumnos
      'alumnos': 'Todos los alumnos del sistema',
      'alumnos_activos': 'Alumnos con estado activo',
      'alumnos_pendientes': 'Alumnos con estado pendiente',
      'alumnos_con_documentos_faltantes': 'Alumnos con documentos faltantes',
      'alumnos_con_pagos_pendientes': 'Alumnos con pagos pendientes',
      
      // Datos de usuarios
      'usuariosum': 'Todos los usuarios UM',
      'usuarios_por_area': 'Usuarios organizados por área',
      'usuarios_activos': 'Usuarios activos',
      
      // Datos de áreas
      'areas': 'Todas las áreas del sistema',
      'areas_con_permisos': 'Áreas con permisos asignados',
      'areas_activas': 'Áreas activas',
      
      // Datos de carreras
      'carreras': 'Todas las carreras',
      'carreras_activas': 'Carreras activas',
      'carreras_por_area': 'Carreras por área',
      
      // Datos de ciclos
      'ciclos': 'Todos los ciclos',
      'ciclos_activos': 'Ciclos activos',
      'ciclos_por_carrera': 'Ciclos por carrera',
      
      // Datos de peticiones
      'cambio_carrera': 'Peticiones de cambio de carrera',
      'peticiones_pendientes': 'Peticiones pendientes',
      'peticiones_aprobadas': 'Peticiones aprobadas',
      'peticiones_rechazadas': 'Peticiones rechazadas',
      'peticiones_por_asesor': 'Peticiones por asesor',
      
      // Datos de documentos
      'documentos_alumno': 'Documentos de alumnos',
      'documentos_faltantes': 'Documentos faltantes',
      'documentos_subidos': 'Documentos subidos',
      
      // Datos de pagos
      'pagos': 'Todos los pagos',
      'pagos_pendientes': 'Pagos pendientes',
      'pagos_completados': 'Pagos completados',
      
      // Datos de notificaciones
      'notificaciones': 'Todas las notificaciones',
      'notificaciones_no_leidas': 'Notificaciones no leídas',
      'notificaciones_por_usuario': 'Notificaciones por usuario',
      
      // Datos de firmas
      'firmas': 'Todas las firmas',
      'firmas_pendientes': 'Firmas pendientes',
      'firmas_completadas': 'Firmas completadas'
    };
  }

  static formatTipoPermiso(tipo: string): string {
    const formatos = {
      pantalla: 'Pantalla',
      funcion: 'Función',
      dato: 'Dato'
    };
    return formatos[tipo as keyof typeof formatos] || tipo;
  }

  static generatePoliticaRLSExample(tabla: string, areaId: number): string {
    return `CREATE POLICY "policy_${tabla}_area_${areaId}" ON public.${tabla} FOR ALL USING (auth.uid() IN (SELECT auth_uid FROM usuariosum WHERE idarea = ${areaId}));`;
  }

  // Verificar si un usuario tiene un permiso específico
  static async verificarPermisoUsuario(email: string, permisoNombre: string): Promise<boolean> {
    try {
      const { supabase } = await import('@/services/supabase/supaConf');
      
      // Obtener el usuario y su área
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuariosum')
        .select('idarea')
        .eq('correoinstitucional', email)
        .single();

      if (usuarioError || !usuario) {
        console.log('Usuario no encontrado:', email);
        return false;
      }

      // Si el usuario no tiene área asignada, verificar si es super su
      if (!usuario.idarea) {
        // Verificar si es super su (todos los permisos)
        return true;
      }

      // Obtener el área y verificar si tiene el permiso
      const { data: area, error: areaError } = await supabase
        .from('areas')
        .select('permisos')
        .eq('idarea', usuario.idarea)
        .single();

      if (areaError || !area) {
        console.log('Área no encontrada para usuario:', email);
        return false;
      }

      // Verificar si el área tiene el permiso en su JSON de permisos
      if (area.permisos && typeof area.permisos === 'object') {
        return area.permisos[permisoNombre] === true;
      }

      return false;
    } catch (error) {
      console.error('Error al verificar permiso:', error);
      return false;
    }
  }

  // Verificar si un usuario es super su (tiene todos los permisos)
  static async verificarSuperSu(email: string): Promise<boolean> {
    try {
      const { supabase } = await import('@/services/supabase/supaConf');
      
      // Obtener el usuario
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuariosum')
        .select('idarea')
        .eq('correoinstitucional', email)
        .single();

      if (usuarioError || !usuario) {
        return false;
      }

      // Si no tiene área asignada, es super su
      return !usuario.idarea;
    } catch (error) {
      console.error('Error al verificar super su:', error);
      return false;
    }
  }

  // Verificar si un usuario puede acceder a una pantalla específica
  static async verificarAccesoScreen(email: string, screenName: string): Promise<boolean> {
    try {
      const { supabase } = await import('@/services/supabase/supaConf');
      
      // Obtener el usuario y su área
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuariosum')
        .select('idarea')
        .eq('correoinstitucional', email)
        .single();

      if (usuarioError || !usuario) {
        console.log('Usuario no encontrado:', email);
        return false;
      }

      // Si el usuario no tiene área asignada, es super su (todos los permisos)
      if (!usuario.idarea) {
        return true;
      }

      // Obtener el área y verificar si tiene el permiso para la pantalla
      const { data: area, error: areaError } = await supabase
        .from('areas')
        .select('permisos')
        .eq('idarea', usuario.idarea)
        .single();

      if (areaError || !area) {
        console.log('Área no encontrada para usuario:', email);
        return false;
      }

      // Mapeo de pantallas a permisos
      const screenPermissionMap: Record<string, string> = {
        'home': 'leer',
        'explore': 'busqueda',
        'gestionPeticiones': 'editar',
        'altaAlumno': 'alta_alumnos',
        'altaUsuario': 'alta_usuarios',
        'notificaciones': 'leer',
        'search': 'busqueda'
      };

      const requiredPermission = screenPermissionMap[screenName];
      if (!requiredPermission) {
        console.log('Pantalla no mapeada:', screenName);
        return false;
      }

      // Verificar si el área tiene el permiso en su JSON de permisos
      if (area.permisos && typeof area.permisos === 'object') {
        return area.permisos[requiredPermission] === true;
      }

      return false;
    } catch (error) {
      console.error('Error al verificar acceso a pantalla:', error);
      return false;
    }
  }

  // Obtener las pantallas accesibles para un usuario
  static async obtenerPantallasAccesibles(email: string): Promise<string[]> {
    try {
      const { supabase } = await import('@/services/supabase/supaConf');
      
      // Obtener el usuario y su área
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuariosum')
        .select('idarea')
        .eq('correoinstitucional', email)
        .single();

      if (usuarioError || !usuario) {
        console.log('Usuario no encontrado:', email);
        return ['home']; // Solo acceso a inicio
      }

      // Si el usuario no tiene área asignada, es super su (todas las pantallas)
      if (!usuario.idarea) {
        return ['home', 'explore', 'gestionPeticiones', 'altaAlumno', 'altaUsuario', 'notificaciones', 'search'];
      }

      // Obtener el área y sus permisos
      const { data: area, error: areaError } = await supabase
        .from('areas')
        .select('permisos')
        .eq('idarea', usuario.idarea)
        .single();

      if (areaError || !area) {
        console.log('Área no encontrada para usuario:', email);
        return ['home']; // Solo acceso a inicio
      }

      const pantallasAccesibles: string[] = ['home']; // Inicio siempre accesible

      // Verificar permisos y agregar pantallas correspondientes
      if (area.permisos && typeof area.permisos === 'object') {
        const permisos = area.permisos;

        if (permisos.busqueda === true) {
          pantallasAccesibles.push('explore', 'search');
        }

        if (permisos.editar === true) {
          pantallasAccesibles.push('gestionPeticiones');
        }

        if (permisos.alta_alumnos === true) {
          pantallasAccesibles.push('altaAlumno');
        }

        if (permisos.alta_usuarios === true) {
          pantallasAccesibles.push('altaUsuario');
        }

        if (permisos.leer === true) {
          pantallasAccesibles.push('notificaciones');
        }
      }

      return pantallasAccesibles;
    } catch (error) {
      console.error('Error al obtener pantallas accesibles:', error);
      return ['home']; // Solo acceso a inicio en caso de error
    }
  }
}