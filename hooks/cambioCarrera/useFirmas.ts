import { useAuth } from '@/context/AuthContext';
import {
    Firma,
    firmarPeticion,
    obtenerPeticionesConFirmas,
    obtenerPeticionesPendientesFirma,
    PeticionConFirmas,
    puedeFirmarPeticion
} from '@/models/cambioCarrera/firmasModel';
import { useCallback, useState } from 'react';

export const useFirmas = () => {
  const { user } = useAuth();
  const [peticiones, setPeticiones] = useState<PeticionConFirmas[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todas las peticiones (para superSU y admin)
  const cargarTodasLasPeticiones = useCallback(async () => {
    if (!user?.email) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await obtenerPeticionesConFirmas();
      setPeticiones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar peticiones');
      console.error('Error al cargar peticiones:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  // Obtener peticiones pendientes de firma para el usuario actual
  const cargarPeticionesPendientes = useCallback(async () => {
    if (!user?.email) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await obtenerPeticionesPendientesFirma(user.email);
      setPeticiones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar peticiones pendientes');
      console.error('Error al cargar peticiones pendientes:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  // Firmar una petición
  const firmarPeticionHandler = useCallback(async (
    peticionId: number,
    areaId: number,
    estado: 'aprobada' | 'rechazada',
    contraseña: string,
    comentarios?: string
  ) => {
    if (!user?.email) {
      throw new Error('Usuario no autenticado');
    }

    try {
      // Obtener el ID del usuario
      const { data: usuario } = await import('@/services/supabase/supaConf').then(({ supabase }) => 
        supabase
          .from('usuariosum')
          .select('idusuario')
          .eq('correoinstitucional', user.email)
          .single()
      );

      if (!usuario?.idusuario) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      const success = await firmarPeticion(
        peticionId,
        areaId,
        usuario.idusuario,
        estado,
        contraseña,
        comentarios
      );

      if (success) {
        // Recargar las peticiones
        await cargarPeticionesPendientes();
      }

      return success;
    } catch (err) {
      console.error('Error al firmar petición:', err);
      throw err;
    }
  }, [user?.email, cargarPeticionesPendientes]);

  // Verificar si el usuario puede firmar una petición específica
  const verificarPuedeFirmar = useCallback(async (peticionId: number): Promise<boolean> => {
    if (!user?.email) return false;
    
    try {
      return await puedeFirmarPeticion(user.email, peticionId);
    } catch (err) {
      console.error('Error al verificar si puede firmar:', err);
      return false;
    }
  }, [user?.email]);

  // Obtener estadísticas de las peticiones
  const obtenerEstadisticas = useCallback(() => {
    const total = peticiones.length;
    const pendientes = peticiones.filter(p => p.estado === 'pendiente').length;
    const aprobadas = peticiones.filter(p => p.estado === 'aprobada').length;
    const rechazadas = peticiones.filter(p => p.estado === 'rechazada').length;
    const enProceso = peticiones.filter(p => 
      p.estado === 'pendiente' && p.firmas_pendientes > 0 && p.firmas_rechazadas === 0
    ).length;

    return {
      total,
      pendientes,
      aprobadas,
      rechazadas,
      enProceso
    };
  }, [peticiones]);

  // Obtener petición por ID
  const obtenerPeticionPorId = useCallback((peticionId: number): PeticionConFirmas | undefined => {
    return peticiones.find(p => p.id === peticionId);
  }, [peticiones]);

  // Obtener firmas de una petición
  const obtenerFirmasDePeticion = useCallback((peticionId: number): Firma[] => {
    const peticion = obtenerPeticionPorId(peticionId);
    return peticion?.firmas || [];
  }, [obtenerPeticionPorId]);

  // Obtener firma específica del usuario actual
  const obtenerFirmaUsuario = useCallback((peticionId: number): Firma | undefined => {
    if (!user?.email) return undefined;
    
    const firmas = obtenerFirmasDePeticion(peticionId);
    return firmas.find(f => f.firmante_email === user.email);
  }, [user?.email, obtenerFirmasDePeticion]);

  return {
    // Estado
    peticiones,
    loading,
    error,
    
    // Acciones
    cargarTodasLasPeticiones,
    cargarPeticionesPendientes,
    firmarPeticion: firmarPeticionHandler,
    verificarPuedeFirmar,
    
    // Utilidades
    obtenerEstadisticas,
    obtenerPeticionPorId,
    obtenerFirmasDePeticion,
    obtenerFirmaUsuario,
    
    // Limpiar error
    limpiarError: () => setError(null)
  };
}; 