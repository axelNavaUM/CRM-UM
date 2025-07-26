import { supabase } from '@/services/supabase/supaConf';

export class CambioCarreraService {
  // Crear una nueva petición de cambio de carrera
  static async crearPeticion(peticion: any): Promise<any> {
    const { data, error } = await supabase
      .from('peticiones_cambio_carrera')
      .insert({
        ...peticion,
        estado: 'pendiente'
      })
      .select()
      .single();
    
    if (error) throw error;
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