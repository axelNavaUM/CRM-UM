import { CambioCarreraController } from '@/controller/cambioCarrera/cambioCarreraController';
import { create } from 'zustand';

// Interfaces
export interface PeticionCambioCarrera {
  id?: number;
  alumno_id: number;
  asesor_id: number;
  carrera_actual_id: number;
  carrera_nueva_id: number;
  ciclo_actual_id: number;
  ciclo_nuevo_id: number;
  grupo_actual: string;
  grupo_nuevo: string;
  motivo: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fecha_solicitud?: string;
  fecha_resolucion?: string;
  jefe_aprobador_id?: number;
  contraseña_aprobador?: string;
  comentarios?: string;
}

export interface Notificacion {
  id?: number;
  usuario_id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion?: string;
  datos_adicionales?: any;
}

export interface PeticionConDetalles extends PeticionCambioCarrera {
  alumno?: {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    matricula: string;
  };
  asesor?: {
    idusuario: number;
    nombreusuario: string;
    apellido: string;
  };
  carrera_actual?: {
    id: number;
    nombre: string;
  };
  carrera_nueva?: {
    id: number;
    nombre: string;
  };
  ciclo_actual?: {
    id: number;
    nombre: string;
  };
  ciclo_nuevo?: {
    id: number;
    nombre: string;
  };
  jefe_aprobador?: {
    idusuario: number;
    nombreusuario: string;
    apellido: string;
  };
}

interface CambioCarreraStore {
  peticiones: PeticionCambioCarrera[];
  notificaciones: Notificacion[];
  notificacionesNoLeidas: number;
  isLoading: boolean;
  error: string | null;
  historialPeticiones: any[];
  tramitesPendientes: {
    tieneTramitesPendientes: boolean;
    tramitesPendientes: string[];
    status: string;
    documentosFaltantes: string[];
  } | null;
  documentosFaltantes: {
    documentosFaltantes: string[];
    documentosSubidos: string[];
    documentosInfo: any[];
  } | null;
  esControlEscolar: boolean;

  fetchPeticionesPorAsesor: (asesor_id: number) => Promise<void>;
  fetchPeticionesPendientes: () => Promise<void>;
  crearPeticion: (peticion: Omit<PeticionCambioCarrera, 'id' | 'estado' | 'fecha_solicitud'>) => Promise<{ success: boolean; error?: string }>;
  aprobarPeticion: (peticion_id: number, jefe_id: number, contraseña_jefe: string) => Promise<{ success: boolean; error?: string }>;
  rechazarPeticion: (peticion_id: number, jefe_id: number, contraseña_jefe: string, comentarios?: string) => Promise<{ success: boolean; error?: string }>;
  marcarNotificacionLeida: (notificacion_id: number) => Promise<void>;
  fetchNotificaciones: (usuario_id: number) => Promise<void>;
  fetchNotificacionesNoLeidas: (usuario_id: number) => Promise<void>;
  verificarTramitesPendientes: (alumno_id: number) => Promise<void>;
  obtenerHistorialPeticiones: (alumno_id: number) => Promise<void>;
  obtenerPeticionesPendientesAlumno: (alumno_id: number) => Promise<any[]>;
  verificarEsControlEscolar: (userEmail: string) => Promise<void>;
  obtenerDocumentosFaltantes: (alumno_id: number) => Promise<void>;
  agregarDocumentoFaltante: (alumno_id: number, tipo_documento: string, url_archivo: string, userEmail: string) => Promise<{ success: boolean; error?: string }>;
  actualizarStatusAlumno: (alumno_id: number) => Promise<{ success: boolean; error?: string }>;

  clearError: () => void;
}

export const useCambioCarreraStore = create<CambioCarreraStore>((set, get) => ({
  peticiones: [],
  notificaciones: [],
  notificacionesNoLeidas: 0,
  isLoading: false,
  error: null,
  historialPeticiones: [],
  tramitesPendientes: null,
  documentosFaltantes: null,
  esControlEscolar: false,

  fetchPeticionesPorAsesor: async (asesor_id: number) => {
    set({ isLoading: true, error: null });
    try {
      const peticiones = await CambioCarreraController.getPeticionesPorAsesor(asesor_id);
      set({ peticiones, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchPeticionesPendientes: async () => {
    set({ isLoading: true, error: null });
    try {
      const peticiones = await CambioCarreraController.getPeticionesPendientes();
      set({ peticiones, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
    }
  },

  crearPeticion: async (peticion) => {
    console.log('🏪 Store: Iniciando crearPeticion...');
    console.log('📋 Store: Datos de petición:', peticion);
    
    set({ isLoading: true, error: null });
    try {
      console.log('🚀 Store: Llamando al controller...');
      await CambioCarreraController.crearPeticion(peticion);
      console.log('✅ Store: Petición creada exitosamente');
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      console.error('❌ Store: Error al crear petición:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al crear petición';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  aprobarPeticion: async (peticion_id: number, jefe_id: number, contraseña_jefe: string) => {
    set({ isLoading: true, error: null });
    try {
      await CambioCarreraController.aprobarPeticion(peticion_id, jefe_id, contraseña_jefe);
      // Recargar peticiones pendientes
      await get().fetchPeticionesPendientes();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al aprobar petición';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  rechazarPeticion: async (peticion_id: number, jefe_id: number, contraseña_jefe: string, comentarios?: string) => {
    set({ isLoading: true, error: null });
    try {
      await CambioCarreraController.rechazarPeticion(peticion_id, jefe_id, contraseña_jefe, comentarios);
      // Recargar peticiones pendientes
      await get().fetchPeticionesPendientes();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al rechazar petición';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchNotificaciones: async (usuario_id: number) => {
    set({ isLoading: true, error: null });
    try {
      const notificaciones = await CambioCarreraController.getNotificaciones(usuario_id);
      set({ notificaciones, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener notificaciones';
      set({ error: errorMessage, isLoading: false });
    }
  },

  marcarNotificacionLeida: async (notificacion_id: number) => {
    try {
      await CambioCarreraController.marcarNotificacionLeida(notificacion_id);
      // Actualizar estado local
      set(state => ({
        notificaciones: state.notificaciones.map(n => 
          n.id === notificacion_id ? { ...n, leida: true } : n
        )
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al marcar notificación';
      set({ error: errorMessage });
    }
  },

  fetchNotificacionesNoLeidas: async (usuario_id: number) => {
    try {
      const count = await CambioCarreraController.getNotificacionesNoLeidas(usuario_id);
      set({ notificacionesNoLeidas: count });
    } catch (error) {
      console.error('Error al obtener notificaciones no leídas:', error);
    }
  },

  verificarTramitesPendientes: async (alumno_id: number) => {
    set({ isLoading: true, error: null });
    try {
      const resultado = await CambioCarreraController.verificarTramitesPendientes(alumno_id);
      set({ tramitesPendientes: resultado, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
    }
  },

  obtenerHistorialPeticiones: async (alumno_id: number) => {
    set({ isLoading: true, error: null });
    try {
      const historial = await CambioCarreraController.obtenerHistorialPeticiones(alumno_id);
      set({ historialPeticiones: historial, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
    }
  },

  obtenerPeticionesPendientesAlumno: async (alumno_id: number) => {
    try {
      const peticiones = await CambioCarreraController.obtenerPeticionesPendientesAlumno(alumno_id);
      return peticiones;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage });
      return [];
    }
  },

  verificarEsControlEscolar: async (userEmail: string) => {
    set({ isLoading: true, error: null });
    try {
      const resultado = await CambioCarreraController.esControlEscolar(userEmail);
      set({ esControlEscolar: resultado, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
    }
  },

  obtenerDocumentosFaltantes: async (alumno_id: number) => {
    set({ isLoading: true, error: null });
    try {
      const resultado = await CambioCarreraController.obtenerDocumentosFaltantes(alumno_id);
      set({ documentosFaltantes: resultado, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
    }
  },

  agregarDocumentoFaltante: async (alumno_id: number, tipo_documento: string, url_archivo: string, userEmail: string) => {
    set({ isLoading: true, error: null });
    try {
      await CambioCarreraController.agregarDocumentoFaltante(alumno_id, tipo_documento, url_archivo, userEmail);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  actualizarStatusAlumno: async (alumno_id: number) => {
    set({ isLoading: true, error: null });
    try {
      const resultado = await CambioCarreraController.actualizarStatusAlumno(alumno_id);
      set({ isLoading: false });
      return { success: resultado };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
})); 