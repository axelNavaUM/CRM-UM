import { usePermisos } from '@/hooks/permisos/usePermisos';
import { supabase } from '@/services/supabase/supaConf';
import { useCambioCarreraStore } from '@/store/cambioCarrera/cambioCarreraStore';
import { useEffect } from 'react';

export const useCambioCarrera = (user?: any) => {
  const {
    peticiones,
    notificaciones,
    notificacionesNoLeidas,
    isLoading,
    error,
    historialPeticiones,
    tramitesPendientes,
    documentosFaltantes,
    esControlEscolar,
    fetchPeticionesPorAsesor,
    fetchPeticionesPendientes,
    crearPeticion,
    aprobarPeticion,
    rechazarPeticion,
    fetchNotificaciones,
    marcarNotificacionLeida,
    fetchNotificacionesNoLeidas,
    verificarTramitesPendientes,
    obtenerHistorialPeticiones,
    obtenerPeticionesPendientesAlumno,
    verificarEsControlEscolar,
    obtenerDocumentosFaltantes,
    agregarDocumentoFaltante,
    actualizarStatusAlumno,
    clearError
  } = useCambioCarreraStore();

  const { verificarPermisoUsuario, verificarSuperSu } = usePermisos();

  // Función para obtener el rol del usuario actual
  const getUserRole = async () => {
    if (!user?.email) return null;
    
    try {
      // Primero verificar si es super su
      const esSuperSu = await verificarSuperSu(user.email);
      if (esSuperSu) {
        return {
          rol: 'super_su',
          idusuario: null,
          tienePermisos: true
        };
      }

      const { data: usuario } = await supabase
        .from('usuariosum')
        .select('idusuario, idarea')
        .eq('correoinstitucional', user.email)
        .single();

      if (!usuario?.idarea) return null;

      const { data: area } = await supabase
        .from('areas')
        .select('rolarea')
        .eq('idarea', usuario.idarea)
        .single();

      return {
        rol: area?.rolarea || 'asesor',
        idusuario: usuario.idusuario,
        tienePermisos: true
      };
    } catch (error) {
      console.error('Error al obtener rol del usuario:', error);
      return null;
    }
  };

  // Función para verificar si el usuario puede crear peticiones
  const puedeCrearPeticiones = async (): Promise<boolean> => {
    if (!user?.email) return false;
    
    try {
      // Verificar si es super su
      const esSuperSu = await verificarSuperSu(user.email);
      if (esSuperSu) return true;

      // Verificar permisos específicos que ya existen en la BD
      const tienePermisoEditar = await verificarPermisoUsuario(user.email, 'editar');
      const tienePermisoActualizar = await verificarPermisoUsuario(user.email, 'actualizar');
      const tienePermisoAltaAlumnos = await verificarPermisoUsuario(user.email, 'alta_alumnos');
      
      if (tienePermisoEditar || tienePermisoActualizar || tienePermisoAltaAlumnos) return true;

      // Verificar por rol (fallback)
      const userInfo = await getUserRole();
      const normalize = (v?: string) => (v || '').toLowerCase();
      const rol = normalize(userInfo?.rol);
      return rol === 'asesor' || rol === 'jefe de ventas' || rol === 'jefe de control' || rol === 'control escolar';
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  };

  // Función para verificar si el usuario puede aprobar peticiones
  const puedeAprobarPeticiones = async (): Promise<boolean> => {
    if (!user?.email) return false;
    
    try {
      // Verificar si es super su
      const esSuperSu = await verificarSuperSu(user.email);
      if (esSuperSu) return true;

      // Verificar permisos específicos que ya existen en la BD
      const tienePermisoEditar = await verificarPermisoUsuario(user.email, 'editar');
      const tienePermisoActualizar = await verificarPermisoUsuario(user.email, 'actualizar');
      const tienePermisoUpdate = await verificarPermisoUsuario(user.email, 'update');
      
      if (tienePermisoEditar || tienePermisoActualizar || tienePermisoUpdate) return true;

      // Verificar por rol (fallback)
      const userInfo = await getUserRole();
      return userInfo?.rol === 'jefe de ventas';
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  };

  // Función para cargar datos según el rol
  const loadDataByRole = async () => {
    const userInfo = await getUserRole();
    if (!userInfo) return;

    if (userInfo.rol === 'jefe de ventas' || userInfo.rol === 'super_su') {
      await fetchPeticionesPendientes();
    } else {
      await fetchPeticionesPorAsesor(userInfo.idusuario);
    }

    // Cargar notificaciones
    await fetchNotificaciones(userInfo.idusuario);
    await fetchNotificacionesNoLeidas(userInfo.idusuario);
  };

  // Función para crear petición de cambio de carrera
  const handleCrearPeticion = async (peticionData: {
    alumno_id: number;
    carrera_actual_id: number;
    carrera_nueva_id: number;
    ciclo_actual_id: number;
    ciclo_nuevo_id: number;
    grupo_actual: string;
    grupo_nuevo: string;
    motivo: string;
  }) => {
    const puedeCrear = await puedeCrearPeticiones();
    
    if (!puedeCrear) {
      throw new Error('No tienes permisos para crear peticiones de cambio de carrera');
    }

    // Obtener el asesor_id del usuario autenticado
    let asesor_id = 0;
    if (user?.email) {
      try {
        const { data: usuario } = await supabase
          .from('usuariosum')
          .select('idusuario')
          .eq('correoinstitucional', user.email)
          .single();
        
        if (usuario) {
          asesor_id = usuario.idusuario;
        }
      } catch (error) {
        console.error('Error al obtener asesor_id:', error);
        throw new Error('No se pudo obtener la información del usuario');
      }
    }
    
    const result = await crearPeticion({
      ...peticionData,
      asesor_id: asesor_id
    });

    if (result.success) {
      await loadDataByRole();
    }

    return result;
  };

  // Función para aprobar petición (solo jefes o super su)
  const handleAprobarPeticion = async (peticion_id: number, contraseña_jefe: string) => {
    const puedeAprobar = await puedeAprobarPeticiones();
    if (!puedeAprobar) {
      throw new Error('No tienes permisos para aprobar peticiones');
    }

    const userInfo = await getUserRole();
    const result = await aprobarPeticion(peticion_id, userInfo?.idusuario || 0, contraseña_jefe);
    
    if (result.success) {
      // Recargar datos
      await loadDataByRole();
    }

    return result;
  };

  // Función para rechazar petición (solo jefes o super su)
  const handleRechazarPeticion = async (peticion_id: number, contraseña_jefe: string, comentarios?: string) => {
    const puedeAprobar = await puedeAprobarPeticiones();
    if (!puedeAprobar) {
      throw new Error('No tienes permisos para rechazar peticiones');
    }

    const userInfo = await getUserRole();
    const result = await rechazarPeticion(peticion_id, userInfo?.idusuario || 0, contraseña_jefe, comentarios);
    
    if (result.success) {
      // Recargar datos
      await loadDataByRole();
    }

    return result;
  };

  // Función para marcar notificación como leída
  const handleMarcarNotificacionLeida = async (notificacion_id: number) => {
    await marcarNotificacionLeida(notificacion_id);
    // Recargar contador de notificaciones no leídas
    const userInfo = await getUserRole();
    if (userInfo) {
      await fetchNotificacionesNoLeidas(userInfo.idusuario);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (user?.email) {
      loadDataByRole();
    }
  }, [user?.email]);

  return {
    // Estado
    peticiones,
    notificaciones,
    notificacionesNoLeidas,
    isLoading,
    error,
    historialPeticiones,
    tramitesPendientes,
    documentosFaltantes,
    esControlEscolar,
    
    // Funciones
    getUserRole,
    loadDataByRole,
    handleCrearPeticion,
    handleAprobarPeticion,
    handleRechazarPeticion,
    handleMarcarNotificacionLeida,
    verificarTramitesPendientes,
    obtenerHistorialPeticiones,
    obtenerPeticionesPendientesAlumno,
    verificarEsControlEscolar,
    obtenerDocumentosFaltantes,
    agregarDocumentoFaltante,
    actualizarStatusAlumno,
    clearError,
    
    // Verificación de permisos
    puedeCrearPeticiones,
    puedeAprobarPeticiones
  };
}; 