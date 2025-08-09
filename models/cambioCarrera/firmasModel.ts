import { supabase } from '@/services/supabase/supaConf';

export interface Firma {
  id: number;
  peticion_id: number;
  area_id: number;
  usuario_firmante_id?: number;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fecha_firma?: string;
  contraseña_usada?: string;
  comentarios?: string;
  created_at: string;
  // Campos adicionales para el frontend
  area_nombre?: string;
  area_rol?: string;
  firmante_nombre?: string;
  firmante_email?: string;
}

export interface PeticionConFirmas {
  id: number;
  alumno_id: number;
  asesor_id: number;
  carrera_actual_id: number;
  carrera_nueva_id: number;
  ciclo_actual_id: number;
  ciclo_nuevo_id: number;
  motivo: string;
  estado: string;
  fecha_creacion: string;
  fecha_resolucion?: string;
  // Datos del alumno
  alumno_nombre?: string;
  alumno_apellidos?: string;
  carrera_actual_nombre?: string;
  carrera_nueva_nombre?: string;
  ciclo_actual_nombre?: string;
  ciclo_nuevo_nombre?: string;
  // Firmas
  firmas: Firma[];
  // Estadísticas
  firmas_pendientes: number;
  firmas_aprobadas: number;
  firmas_rechazadas: number;
  total_firmas: number;
}

// Función auxiliar para obtener datos de carreras y ciclos
const obtenerDatosAdicionales = async (peticiones: any[]) => {
  const carrerasIds = new Set<number>();
  const ciclosIds = new Set<number>();
  
  peticiones.forEach(peticion => {
    carrerasIds.add(peticion.carrera_actual_id);
    carrerasIds.add(peticion.carrera_nueva_id);
    ciclosIds.add(peticion.ciclo_actual_id);
    ciclosIds.add(peticion.ciclo_nuevo_id);
  });

  // Obtener carreras
  const { data: carreras } = await supabase
    .from('carreras')
    .select('id, nombre')
    .in('id', Array.from(carrerasIds));

  // Obtener ciclos
  const { data: ciclos } = await supabase
    .from('ciclos')
    .select('id, nombre')
    .in('id', Array.from(ciclosIds));

  // Crear mapas para acceso rápido
  const carrerasMap = new Map(carreras?.map(c => [c.id, c.nombre]) || []);
  const ciclosMap = new Map(ciclos?.map(c => [c.id, c.nombre]) || []);

  return { carrerasMap, ciclosMap };
};

// Obtener todas las peticiones con sus firmas
export const obtenerPeticionesConFirmas = async (): Promise<PeticionConFirmas[]> => {
  try {
    const { data: peticiones, error } = await supabase
      .from('peticiones_cambio_carrera')
      .select(`
        *,
        alumnos!inner(
          nombre,
          apellidos
        )
      `)
      .order('fecha_solicitud', { ascending: false });

    if (error) throw error;

    // Obtener datos adicionales de carreras y ciclos
    const { carrerasMap, ciclosMap } = await obtenerDatosAdicionales(peticiones);

    // Obtener firmas para cada petición
    const peticionesConFirmas = await Promise.all(
      peticiones.map(async (peticion) => {
        const { data: firmas } = await supabase
          .from('firmas_cambio_carrera')
          .select(`
            *,
            areas!inner(nombrearea, rolarea),
            usuariosum!usuario_firmante_id(nombreusuario, apellido, correoinstitucional)
          `)
          .eq('peticion_id', peticion.id);

        const firmasFormateadas = firmas?.map(firma => ({
          ...firma,
          area_nombre: firma.areas?.nombrearea,
          area_rol: firma.areas?.rolarea,
          firmante_nombre: firma.usuariosum ? 
            `${firma.usuariosum.nombreusuario} ${firma.usuariosum.apellido}`.trim() : 
            undefined,
          firmante_email: firma.usuariosum?.correoinstitucional
        })) || [];

        const firmasPendientes = firmasFormateadas.filter(f => f.estado === 'pendiente').length;
        const firmasAprobadas = firmasFormateadas.filter(f => f.estado === 'aprobada').length;
        const firmasRechazadas = firmasFormateadas.filter(f => f.estado === 'rechazada').length;

        return {
          ...peticion,
          alumno_nombre: peticion.alumnos?.nombre,
          alumno_apellidos: peticion.alumnos?.apellidos,
          carrera_actual_nombre: carrerasMap.get(peticion.carrera_actual_id),
          carrera_nueva_nombre: carrerasMap.get(peticion.carrera_nueva_id),
          ciclo_actual_nombre: ciclosMap.get(peticion.ciclo_actual_id),
          ciclo_nuevo_nombre: ciclosMap.get(peticion.ciclo_nuevo_id),
          firmas: firmasFormateadas,
          firmas_pendientes: firmasPendientes,
          firmas_aprobadas: firmasAprobadas,
          firmas_rechazadas: firmasRechazadas,
          total_firmas: firmasFormateadas.length
        };
      })
    );

    return peticionesConFirmas;
  } catch (error) {
    console.error('Error al obtener peticiones con firmas:', error);
    throw error;
  }
};

// Obtener peticiones pendientes de firma para un usuario
export const obtenerPeticionesPendientesFirma = async (userEmail: string): Promise<PeticionConFirmas[]> => {
  try {
    // Obtener el área del usuario
    const { data: usuario } = await supabase
      .from('usuariosum')
      .select('idarea, idusuario')
      .eq('correoinstitucional', userEmail)
      .single();

    if (!usuario?.idarea) {
      // Si es superSU o admin, puede ver todas las peticiones
      return obtenerPeticionesConFirmas();
    }

    // Obtener peticiones donde el usuario tiene firmas pendientes
    const { data: firmasPendientes, error } = await supabase
      .from('firmas_cambio_carrera')
      .select(`
        peticion_id,
        peticiones_cambio_carrera!inner(
          *,
          alumnos!inner(nombre, apellidos)
        )
      `)
      .eq('area_id', usuario.idarea)
      .eq('estado', 'pendiente');

    if (error) throw error;

    // Obtener datos adicionales de carreras y ciclos
    const peticiones = firmasPendientes.map(f => f.peticiones_cambio_carrera);
    const { carrerasMap, ciclosMap } = await obtenerDatosAdicionales(peticiones);

    // Obtener firmas completas para cada petición
    const peticionesConFirmas = await Promise.all(
      firmasPendientes.map(async (firma) => {
        const { data: firmas } = await supabase
          .from('firmas_cambio_carrera')
          .select(`
            *,
            areas!inner(nombrearea, rolarea),
            usuariosum!usuario_firmante_id(nombreusuario, apellido, correoinstitucional)
          `)
          .eq('peticion_id', firma.peticion_id);

        const firmasFormateadas = firmas?.map(f => ({
          ...f,
          area_nombre: f.areas?.nombrearea,
          area_rol: f.areas?.rolarea,
          firmante_nombre: f.usuariosum ? 
            `${f.usuariosum.nombreusuario} ${f.usuariosum.apellido}`.trim() : 
            undefined,
          firmante_email: f.usuariosum?.correoinstitucional
        })) || [];

        const firmasPendientes = firmasFormateadas.filter(f => f.estado === 'pendiente').length;
        const firmasAprobadas = firmasFormateadas.filter(f => f.estado === 'aprobada').length;
        const firmasRechazadas = firmasFormateadas.filter(f => f.estado === 'rechazada').length;

        return {
          ...firma.peticiones_cambio_carrera,
          alumno_nombre: firma.peticiones_cambio_carrera.alumnos?.nombre,
          alumno_apellidos: firma.peticiones_cambio_carrera.alumnos?.apellidos,
          carrera_actual_nombre: carrerasMap.get(firma.peticiones_cambio_carrera.carrera_actual_id),
          carrera_nueva_nombre: carrerasMap.get(firma.peticiones_cambio_carrera.carrera_nueva_id),
          ciclo_actual_nombre: ciclosMap.get(firma.peticiones_cambio_carrera.ciclo_actual_id),
          ciclo_nuevo_nombre: ciclosMap.get(firma.peticiones_cambio_carrera.ciclo_nuevo_id),
          firmas: firmasFormateadas,
          firmas_pendientes: firmasPendientes,
          firmas_aprobadas: firmasAprobadas,
          firmas_rechazadas: firmasRechazadas,
          total_firmas: firmasFormateadas.length
        };
      })
    );

    return peticionesConFirmas;
  } catch (error) {
    console.error('Error al obtener peticiones pendientes de firma:', error);
    throw error;
  }
};

// Verificar si un usuario ya firmó una petición
export const yaFirmoPeticion = async (userEmail: string, peticionId: number): Promise<boolean> => {
  try {
    const { data: usuario } = await supabase
      .from('usuariosum')
      .select('idarea, idusuario')
      .eq('correoinstitucional', userEmail)
      .single();

    if (!usuario) return false;

    // SuperSU y admin pueden firmar cualquier cosa, pero no pueden firmar múltiples veces
    if (!usuario.idarea) {
      // Verificar si ya firmó cualquier firma de esta petición
      const { data: firmaExistente } = await supabase
        .from('firmas_cambio_carrera')
        .select('id')
        .eq('peticion_id', peticionId)
        .eq('usuario_firmante_id', usuario.idusuario)
        .single();

      return !!firmaExistente;
    }

    // Verificar si el usuario ya firmó la firma de su área para esta petición
    const { data: firmaExistente } = await supabase
      .from('firmas_cambio_carrera')
      .select('id')
      .eq('peticion_id', peticionId)
      .eq('area_id', usuario.idarea)
      .eq('usuario_firmante_id', usuario.idusuario)
      .single();

    return !!firmaExistente;
  } catch (error) {
    console.error('Error al verificar si ya firmó:', error);
    return false;
  }
};

// Firmar una petición
export const firmarPeticion = async (
  peticionId: number,
  areaId: number,
  usuarioId: number,
  estado: 'aprobada' | 'rechazada',
  contraseña: string,
  comentarios?: string
): Promise<boolean> => {
  try {
    // Verificar si ya existe una firma para esta petición y área
    const { data: firmaExistente } = await supabase
      .from('firmas_cambio_carrera')
      .select('id, estado, usuario_firmante_id')
      .eq('peticion_id', peticionId)
      .eq('area_id', areaId)
      .single();

    if (firmaExistente) {
      // Si ya hay una firma y no está pendiente, no permitir modificar
      if (firmaExistente.estado !== 'pendiente') {
        throw new Error('Esta petición ya ha sido firmada y no puede ser modificada');
      }

      // Si ya hay un usuario_firmante_id, verificar que no sea el mismo usuario
      if (firmaExistente.usuario_firmante_id && firmaExistente.usuario_firmante_id !== usuarioId) {
        throw new Error('Esta petición ya está siendo procesada por otro usuario');
      }
    }

    const { error } = await supabase
      .from('firmas_cambio_carrera')
      .update({
        usuario_firmante_id: usuarioId,
        estado: estado,
        fecha_firma: new Date().toISOString(),
        contraseña_usada: contraseña,
        comentarios: comentarios
      })
      .eq('peticion_id', peticionId)
      .eq('area_id', areaId);

    if (error) throw error;

    // Si se aprobó, verificar si todas las firmas están completas
    if (estado === 'aprobada') {
      const { data: firmas } = await supabase
        .from('firmas_cambio_carrera')
        .select('estado')
        .eq('peticion_id', peticionId);

      const todasAprobadas = firmas?.every(f => f.estado === 'aprobada');
      
      if (todasAprobadas) {
        // Procesar el cambio de carrera
        const { error: procesarError } = await supabase
          .rpc('procesar_cambio_carrera_aprobado', { peticion_id_param: peticionId });
        
        if (procesarError) {
          console.error('Error al procesar cambio de carrera:', procesarError);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error al firmar petición:', error);
    throw error;
  }
};

// Verificar si un usuario puede firmar una petición
export const puedeFirmarPeticion = async (userEmail: string, peticionId: number): Promise<boolean> => {
  try {
    const { data: usuario } = await supabase
      .from('usuariosum')
      .select('idarea, idusuario')
      .eq('correoinstitucional', userEmail)
      .single();

    if (!usuario) return false;

    // Verificar si ya firmó esta petición
    const yaFirmo = await yaFirmoPeticion(userEmail, peticionId);
    if (yaFirmo) return false;

    // SuperSU y admin pueden firmar cualquier cosa
    if (!usuario.idarea) return true;

    // Verificar si el usuario tiene una firma pendiente para esta petición
    const { data: firma } = await supabase
      .from('firmas_cambio_carrera')
      .select('estado')
      .eq('peticion_id', peticionId)
      .eq('area_id', usuario.idarea)
      .eq('estado', 'pendiente')
      .single();

    return !!firma;
  } catch (error) {
    console.error('Error al verificar si puede firmar:', error);
    return false;
  }
}; 