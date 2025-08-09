import { supabase } from '@/services/supabase/supaConf';

export class CambioCarreraService {
  // Actualizar status del alumno cuando todos los documentos estén completos
  static async actualizarStatusAlumno(alumno_id: number): Promise<boolean> {
    try {
      // Obtener documentos faltantes
      const { documentosFaltantes } = await this.obtenerDocumentosFaltantes(alumno_id);
      
      // Si no hay documentos faltantes, cambiar status a 'activo'
      if (documentosFaltantes.length === 0) {
        const { error } = await supabase
          .from('alumnos')
          .update({ status: 'activo' })
          .eq('id', alumno_id);
        
        if (error) throw error;
        
        console.log('✅ Status del alumno actualizado a "activo"');
        return true;
      } else {
        console.log('⚠️ Alumno aún tiene documentos faltantes:', documentosFaltantes);
        return false;
      }
    } catch (error) {
      console.error('Error al actualizar status del alumno:', error);
      return false;
    }
  }

  // Verificar si un usuario pertenece a Control Escolar
  static async esControlEscolar(userEmail: string): Promise<boolean> {
    try {
      const { data: usuario } = await supabase
        .from('usuariosum')
        .select('idarea')
        .eq('correoinstitucional', userEmail)
        .single();

      if (!usuario?.idarea) return false;

      const { data: area } = await supabase
        .from('areas')
        .select('rolarea')
        .eq('idarea', usuario.idarea)
        .single();

      return area?.rolarea === 'jefe de control';
    } catch (error) {
      console.error('Error al verificar si es Control Escolar:', error);
      return false;
    }
  }

  // Obtener documentos faltantes de un alumno
  static async obtenerDocumentosFaltantes(alumno_id: number): Promise<{
    documentosFaltantes: string[];
    documentosSubidos: string[];
    documentosInfo: any[];
  }> {
    try {
      // Obtener documentos subidos del alumno
      const { data: documentosSubidos, error: docsError } = await supabase
        .from('documentos_alumno')
        .select('tipo_documento, url_archivo, fecha_subida')
        .eq('alumno_id', alumno_id);

      if (docsError) throw docsError;

      // Definir documentos requeridos
      const documentosRequeridos = [
        { tipo: 'acta', nombre: 'Acta de nacimiento' },
        { tipo: 'certificado_prepa', nombre: 'Certificado de preparatoria' },
        { tipo: 'formato_pago', nombre: 'Comprobante de pago' }
      ];

      const documentosSubidosTipos = documentosSubidos?.map(d => d.tipo_documento) || [];
      const documentosFaltantes = documentosRequeridos
        .filter(doc => !documentosSubidosTipos.includes(doc.tipo))
        .map(doc => doc.nombre);

      const documentosSubidosNombres = documentosRequeridos
        .filter(doc => documentosSubidosTipos.includes(doc.tipo))
        .map(doc => doc.nombre);

      return {
        documentosFaltantes,
        documentosSubidos: documentosSubidosNombres,
        documentosInfo: documentosSubidos || []
      };
    } catch (error) {
      console.error('Error al obtener documentos faltantes:', error);
      return {
        documentosFaltantes: [],
        documentosSubidos: [],
        documentosInfo: []
      };
    }
  }

  // Agregar documento faltante (solo Control Escolar)
  static async agregarDocumentoFaltante(
    alumno_id: number,
    tipo_documento: string,
    url_archivo: string,
    userEmail: string
  ): Promise<boolean> {
    try {
      // Verificar que el usuario es Control Escolar
      const esControlEscolar = await this.esControlEscolar(userEmail);
      if (!esControlEscolar) {
        throw new Error('Solo el personal de Control Escolar puede agregar documentos');
      }

      // Verificar que el documento no existe ya
      const { data: documentoExistente } = await supabase
        .from('documentos_alumno')
        .select('id')
        .eq('alumno_id', alumno_id)
        .eq('tipo_documento', tipo_documento)
        .single();

      if (documentoExistente) {
        throw new Error('Este documento ya fue subido anteriormente');
      }

      // Insertar el documento
      const { error } = await supabase
        .from('documentos_alumno')
        .insert({
          alumno_id,
          tipo_documento,
          url_archivo,
          fecha_subida: new Date().toISOString()
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error al agregar documento faltante:', error);
      throw error;
    }
  }

  // Verificar si un alumno tiene trámites pendientes
  static async verificarTramitesPendientes(alumno_id: number): Promise<{
    tieneTramitesPendientes: boolean;
    tramitesPendientes: string[];
    status: string;
    documentosFaltantes: string[];
  }> {
    try {
      // Verificar el status del alumno
      const { data: alumno, error: alumnoError } = await supabase
        .from('alumnos')
        .select('status')
        .eq('id', alumno_id)
        .single();

      if (alumnoError) throw alumnoError;

      const tramitesPendientes: string[] = [];
      let tieneTramitesPendientes = false;

      // Si el alumno está pendiente, tiene trámites pendientes
      if (alumno.status === 'pendiente') {
        tieneTramitesPendientes = true;
        tramitesPendientes.push('Registro de alumno pendiente');
      }

      // Verificar si tiene peticiones de cambio de carrera pendientes
      const { data: peticionesPendientes, error: peticionesError } = await supabase
        .from('peticiones_cambio_carrera')
        .select('id, estado, fecha_solicitud')
        .eq('alumno_id', alumno_id)
        .eq('estado', 'pendiente');

      if (peticionesError) throw peticionesError;

      if (peticionesPendientes && peticionesPendientes.length > 0) {
        tieneTramitesPendientes = true;
        tramitesPendientes.push('Petición de cambio de carrera pendiente');
      }

      // Obtener documentos faltantes
      const { documentosFaltantes } = await this.obtenerDocumentosFaltantes(alumno_id);
      if (documentosFaltantes.length > 0) {
        tieneTramitesPendientes = true;
        tramitesPendientes.push(`Documentos faltantes: ${documentosFaltantes.join(', ')}`);
      }

      return {
        tieneTramitesPendientes,
        tramitesPendientes,
        status: alumno.status,
        documentosFaltantes
      };
    } catch (error) {
      console.error('Error al verificar trámites pendientes:', error);
      return {
        tieneTramitesPendientes: false,
        tramitesPendientes: [],
        status: 'activo',
        documentosFaltantes: []
      };
    }
  }

  // Obtener historial de peticiones de cambio de carrera de un alumno
  static async obtenerHistorialPeticiones(alumno_id: number): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('peticiones_cambio_carrera')
        .select(`
          *,
          carrera_actual:carreras!carrera_actual_id(id, nombre),
          carrera_nueva:carreras!carrera_nueva_id(id, nombre),
          ciclo_actual:ciclos!ciclo_actual_id(id, nombre),
          ciclo_nuevo:ciclos!ciclo_nuevo_id(id, nombre),
          asesor:usuariosum!asesor_id(idusuario, nombreusuario, apellido),
          jefe_aprobador:usuariosum!jefe_aprobador_id(idusuario, nombreusuario, apellido)
        `)
        .eq('alumno_id', alumno_id)
        .order('fecha_solicitud', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener historial de peticiones:', error);
      return [];
    }
  }

  // Obtener peticiones pendientes de un alumno específico
  static async obtenerPeticionesPendientesAlumno(alumno_id: number): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('peticiones_cambio_carrera')
        .select(`
          *,
          carrera_actual:carreras!carrera_actual_id(id, nombre),
          carrera_nueva:carreras!carrera_nueva_id(id, nombre),
          ciclo_actual:ciclos!ciclo_actual_id(id, nombre),
          ciclo_nuevo:ciclos!ciclo_nuevo_id(id, nombre),
          asesor:usuariosum!asesor_id(idusuario, nombreusuario, apellido)
        `)
        .eq('alumno_id', alumno_id)
        .eq('estado', 'pendiente')
        .order('fecha_solicitud', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener peticiones pendientes del alumno:', error);
      return [];
    }
  }

  // Verificar si ya existe una petición similar
  static async verificarPeticionDuplicada(peticion: any): Promise<boolean> {
    const { data, error } = await supabase
      .from('peticiones_cambio_carrera')
      .select('id, estado')
      .eq('alumno_id', peticion.alumno_id)
      .eq('carrera_actual_id', peticion.carrera_actual_id)
      .eq('carrera_nueva_id', peticion.carrera_nueva_id)
      .eq('ciclo_actual_id', peticion.ciclo_actual_id)
      .eq('ciclo_nuevo_id', peticion.ciclo_nuevo_id)
      .in('estado', ['pendiente', 'aprobada'])
      .limit(1);

    if (error) {
      console.error('Error al verificar petición duplicada:', error);
      return false;
    }

    return data && data.length > 0;
  }

  // Crear una nueva petición de cambio de carrera
  static async crearPeticion(peticion: any): Promise<any> {
    // Verificar si ya existe una petición similar
    const existeDuplicada = await this.verificarPeticionDuplicada(peticion);
    if (existeDuplicada) {
      throw new Error('Ya existe una petición similar para este alumno. No se pueden crear peticiones duplicadas.');
    }

    // Verificar si el alumno tiene trámites pendientes
    const { tieneTramitesPendientes, tramitesPendientes } = await this.verificarTramitesPendientes(peticion.alumno_id);
    if (tieneTramitesPendientes) {
      throw new Error(`No se puede crear la petición. El alumno tiene trámites pendientes: ${tramitesPendientes.join(', ')}`);
    }

    const { data, error } = await supabase
      .from('peticiones_cambio_carrera')
      .insert({
        ...peticion,
        estado: 'pendiente'
      })
      .select()
      .single();
    
    if (error) throw error;

    // Notificaciones: crear notificación para roles objetivo (sin depender de triggers)
    try {
      // 1) Determinar destinatarios por rol de área
      const { data: areas } = await supabase
        .from('areas')
        .select('idarea, rolarea');
      const normalize = (v?: string) => (v || '').toLowerCase();
      const targetRoles = new Set(['jefe de ventas','director']);
      const targetAreaIds = (areas || [])
        .filter(a => targetRoles.has(normalize(a.rolarea)))
        .map(a => a.idarea);

      const { data: destinatarios } = await supabase
        .from('usuariosum')
        .select('idusuario, idarea')
        .in('idarea', targetAreaIds.length > 0 ? targetAreaIds : [-1]);

      // 2) Construir mensaje y payload
      const notifs = (destinatarios || []).map(u => ({
        usuario_id: u.idusuario,
        tipo: 'cambio_carrera',
        titulo: 'Nueva petición de cambio de carrera',
        mensaje: 'Se ha creado una nueva petición de cambio de carrera para su revisión.',
        datos_adicionales: {
          peticion_id: data.id,
          alumno_id: peticion.alumno_id,
          asesor_id: peticion.asesor_id
        }
      }));

      if (notifs.length > 0) {
        await supabase.from('notificaciones').insert(notifs);
      }
    } catch (e) {
      // Falla silenciosa de notificaciones para no bloquear la creación
    }

    return data;
  }

  // Obtener peticiones por asesor
  static async getPeticionesPorAsesor(asesor_id: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('peticiones_cambio_carrera')
      .select(`
        *,
        alumno:alumnos(id, nombre, apellidos, email, matricula),
        asesor:usuariosum!asesor_id(idusuario, nombreusuario, apellido),
        carrera_actual:carreras!carrera_actual_id(id, nombre),
        carrera_nueva:carreras!carrera_nueva_id(id, nombre),
        ciclo_actual:ciclos!ciclo_actual_id(id, nombre),
        ciclo_nuevo:ciclos!ciclo_nuevo_id(id, nombre),
        jefe_aprobador:usuariosum!jefe_aprobador_id(idusuario, nombreusuario, apellido)
      `)
      .eq('asesor_id', asesor_id)
      .order('fecha_solicitud', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Obtener todas las peticiones pendientes
  static async getPeticionesPendientes(): Promise<any[]> {
    const { data, error } = await supabase
      .from('peticiones_cambio_carrera')
      .select(`
        *,
        alumno:alumnos(id, nombre, apellidos, email, matricula),
        asesor:usuariosum!asesor_id(idusuario, nombreusuario, apellido),
        carrera_actual:carreras!carrera_actual_id(id, nombre),
        carrera_nueva:carreras!carrera_nueva_id(id, nombre),
        ciclo_actual:ciclos!ciclo_actual_id(id, nombre),
        ciclo_nuevo:ciclos!ciclo_nuevo_id(id, nombre),
        jefe_aprobador:usuariosum!jefe_aprobador_id(idusuario, nombreusuario, apellido)
      `)
      .eq('estado', 'pendiente')
      .order('fecha_solicitud', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Obtener una petición específica
  static async getPeticion(id: number): Promise<any> {
    const { data, error } = await supabase
      .from('peticiones_cambio_carrera')
      .select(`
        *,
        alumno:alumnos(id, nombre, apellidos, email, matricula),
        asesor:usuariosum!asesor_id(idusuario, nombreusuario, apellido),
        carrera_actual:carreras!carrera_actual_id(id, nombre),
        carrera_nueva:carreras!carrera_nueva_id(id, nombre),
        ciclo_actual:ciclos!ciclo_actual_id(id, nombre),
        ciclo_nuevo:ciclos!ciclo_nuevo_id(id, nombre),
        jefe_aprobador:usuariosum!jefe_aprobador_id(idusuario, nombreusuario, apellido)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Aprobar petición usando función RPC
  static async aprobarPeticion(peticion_id: number, jefe_id: number, contraseña_jefe: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('procesar_cambio_carrera', {
      peticion_id,
      jefe_id,
      contraseña_jefe
    });

    if (error) throw error;
    return data;
  }

  // Rechazar petición usando función RPC
  static async rechazarPeticion(peticion_id: number, jefe_id: number, contraseña_jefe: string, comentarios?: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('rechazar_cambio_carrera', {
      peticion_id,
      jefe_id,
      contraseña_jefe,
      comentarios: comentarios || null
    });

    if (error) throw error;
    return data;
  }

  // Obtener notificaciones de un usuario
  static async getNotificaciones(usuario_id: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', usuario_id)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Marcar notificación como leída
  static async marcarNotificacionLeida(notificacion_id: number): Promise<void> {
    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', notificacion_id);

    if (error) throw error;
  }

  // Obtener cantidad de notificaciones no leídas
  static async getNotificacionesNoLeidas(usuario_id: number): Promise<number> {
    const { count, error } = await supabase
      .from('notificaciones')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', usuario_id)
      .eq('leida', false);

    if (error) throw error;
    return count || 0;
  }

  // Verificar si un usuario es jefe de ventas
  static async verificarJefeVentas(jefe_id: number, contraseña: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('usuariosum')
      .select('idarea')
      .eq('idusuario', jefe_id)
      .eq('password', contraseña)
      .single();

    if (error || !data) return false;

    const { data: area, error: areaError } = await supabase
      .from('areas')
      .select('rolarea')
      .eq('idarea', data.idarea)
      .single();

    if (areaError || !area) return false;
    return area.rolarea === 'jefe de ventas';
  }

  // Verificar que un alumno existe
  static async verificarAlumno(alumno_id: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('alumnos')
      .select('id')
      .eq('id', alumno_id)
      .single();

    return !error && !!data;
  }

  // Verificar que una carrera existe
  static async verificarCarrera(carrera_id: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('carreras')
      .select('id')
      .eq('id', carrera_id)
      .single();

    return !error && !!data;
  }

  // Verificar que un ciclo existe
  static async verificarCiclo(ciclo_id: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('ciclos')
      .select('id')
      .eq('id', ciclo_id)
      .single();

    return !error && !!data;
  }
} 