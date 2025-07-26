import { AreasController } from '@/controller/areas/areasController';
import type { CreateAreaData, UpdateAreaData } from '@/services/areas/areasService';
import { useAreasStore } from '@/store/areas/areasStore';
import { useEffect } from 'react';

export const useAreas = () => {
  const {
    areas,
    isLoading,
    error,
    fetchAreas,
    createArea,
    updateArea,
    deleteArea,
    getAreaById,
    setError
  } = useAreasStore();

  // Cargar áreas al montar el hook
  useEffect(() => {
    fetchAreas();
  }, []);

  // Métodos del hook
  const handleCreateArea = async (areaData: CreateAreaData) => {
    try {
      await createArea(areaData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const handleUpdateArea = async (idarea: number, areaData: UpdateAreaData) => {
    try {
      await updateArea(idarea, areaData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const handleDeleteArea = async (idarea: number) => {
    try {
      await deleteArea(idarea);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const handleRefreshAreas = async () => {
    try {
      await fetchAreas();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Utilidades
  const getPermisosDisponibles = () => {
    return AreasController.getPermisosDisponibles();
  };

  const formatPermisoName = (permiso: string) => {
    return AreasController.formatPermisoName(permiso);
  };

  const getAreaByIdLocal = (idarea: number) => {
    return useAreasStore.getState().getAreaById(idarea);
  };

  return {
    // Estado
    areas,
    isLoading,
    error,
    
    // Métodos
    createArea: handleCreateArea,
    updateArea: handleUpdateArea,
    deleteArea: handleDeleteArea,
    refreshAreas: handleRefreshAreas,
    clearError,
    
    // Utilidades
    getAreaById: getAreaByIdLocal,
    getPermisosDisponibles,
    formatPermisoName,
  };
}; 