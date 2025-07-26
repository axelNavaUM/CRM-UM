// ===========================================
// 1. hooks/permisos/usePermisos.ts (HOOK - Bloqueo de estado de acceso)
// ===========================================
import { PermisosController } from '@/controller/permisos/permisosController';
import type { CreatePermisoData, CreatePoliticaRLSData, UpdatePermisoData, UpdatePoliticaRLSData } from '@/services/permisos/permisosService';
import { usePermisosStore } from '@/store/permisos/permisosStore';
import { useEffect } from 'react';

export const usePermisos = () => {
  const {
    permisos,
    politicasRLS,
    areasConPermisos,
    isLoading,
    error,
    fetchPermisos,
    createPermiso,
    updatePermiso,
    deletePermiso,
    fetchPoliticasRLS,
    createPoliticaRLS,
    updatePoliticaRLS,
    deletePoliticaRLS,
    fetchAreasConPermisos,
    getPermisoById,
    getPoliticaById,
    setError
  } = usePermisosStore();

  // Cargar datos al montar el hook
  useEffect(() => {
    fetchPermisos();
    fetchPoliticasRLS();
    fetchAreasConPermisos();
  }, []);

  // Métodos del hook - Permisos
  const handleCreatePermiso = async (permisoData: CreatePermisoData) => {
    try {
      await createPermiso(permisoData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const handleUpdatePermiso = async (id: number, permisoData: UpdatePermisoData) => {
    try {
      await updatePermiso(id, permisoData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const handleDeletePermiso = async (id: number) => {
    try {
      await deletePermiso(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  // Método para actualizar área (permisos)
  const handleUpdateArea = async (areaId: number, updates: any) => {
    try {
      // Usar el controlador de áreas para actualizar
      const { AreasController } = await import('@/controller/areas/areasController');
      await AreasController.update(areaId, updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  // Métodos del hook - Políticas RLS
  const handleCreatePoliticaRLS = async (politicaData: CreatePoliticaRLSData) => {
    try {
      await createPoliticaRLS(politicaData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const handleUpdatePoliticaRLS = async (id: number, politicaData: UpdatePoliticaRLSData) => {
    try {
      await updatePoliticaRLS(id, politicaData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const handleDeletePoliticaRLS = async (id: number) => {
    try {
      await deletePoliticaRLS(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  // Métodos de refresh
  const handleRefreshPermisos = async () => {
    try {
      await fetchPermisos();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const handleRefreshPoliticasRLS = async () => {
    try {
      await fetchPoliticasRLS();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const handleRefreshAreasConPermisos = async () => {
    try {
      await fetchAreasConPermisos();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Utilidades
  const getTiposPermiso = () => {
    return PermisosController.getTiposPermiso();
  };

  const getTablasDisponibles = () => {
    return PermisosController.getTablasDisponibles();
  };

  const formatTipoPermiso = (tipo: string) => {
    return PermisosController.formatTipoPermiso(tipo);
  };

  const generatePoliticaRLSExample = (tabla: string, areaId: number) => {
    return PermisosController.generatePoliticaRLSExample(tabla, areaId);
  };

  const getPermisoByIdLocal = (id: number) => {
    return usePermisosStore.getState().getPermisoById(id);
  };

  const getPoliticaByIdLocal = (id: number) => {
    return usePermisosStore.getState().getPoliticaById(id);
  };

  // Verificar si un usuario tiene un permiso específico
  const verificarPermisoUsuario = async (email: string, permisoNombre: string): Promise<boolean> => {
    try {
      return await PermisosController.verificarPermisoUsuario(email, permisoNombre);
    } catch (error) {
      console.error('Error al verificar permiso:', error);
      return false;
    }
  };

  // Verificar si un usuario es super su
  const verificarSuperSu = async (email: string): Promise<boolean> => {
    try {
      return await PermisosController.verificarSuperSu(email);
    } catch (error) {
      console.error('Error al verificar super su:', error);
      return false;
    }
  };

  return {
    // Estado
    permisos,
    politicasRLS,
    areasConPermisos,
    isLoading,
    error,
    
    // Métodos - Permisos
    createPermiso: handleCreatePermiso,
    updatePermiso: handleUpdatePermiso,
    deletePermiso: handleDeletePermiso,
    refreshPermisos: handleRefreshPermisos,
    
    // Métodos - Políticas RLS
    createPoliticaRLS: handleCreatePoliticaRLS,
    updatePoliticaRLS: handleUpdatePoliticaRLS,
    deletePoliticaRLS: handleDeletePoliticaRLS,
    refreshPoliticasRLS: handleRefreshPoliticasRLS,
    
    // Métodos - Utilidades
    refreshAreasConPermisos: handleRefreshAreasConPermisos,
    clearError,
    updateArea: handleUpdateArea,
    
    // Utilidades
    getPermisoById: getPermisoByIdLocal,
    getPoliticaById: getPoliticaByIdLocal,
    getTiposPermiso,
    getTablasDisponibles,
    formatTipoPermiso,
    generatePoliticaRLSExample,
    
    // Verificación de permisos
    verificarPermisoUsuario,
    verificarSuperSu,
  };
};