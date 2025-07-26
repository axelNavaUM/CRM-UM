import { AreasController } from '@/controller/areas/areasController';
import { create } from 'zustand';

export interface Area {
  idarea: number;
  nombrearea: string;
  rolarea?: string;
  permisos?: Record<string, boolean>;
}

interface CreateAreaData {
  nombrearea: string;
  rolarea: string;
  permisos: Record<string, boolean>;
}

interface AreasStore {
  areas: Area[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAreas: () => Promise<void>;
  createArea: (areaData: CreateAreaData) => Promise<{ success: boolean; error?: string }>;
  updateArea: (idarea: number, areaData: Partial<Area>) => Promise<{ success: boolean; error?: string }>;
  deleteArea: (idarea: number) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export const useAreasStore = create<AreasStore>((set, get) => ({
  areas: [],
  isLoading: false,
  error: null,

  fetchAreas: async () => {
    set({ isLoading: true, error: null });
    try {
      const areas = await AreasController.getAll();
      set({ areas, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createArea: async (areaData) => {
    set({ isLoading: true, error: null });
    try {
      await AreasController.create(areaData);
      await get().fetchAreas();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear área';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateArea: async (idarea, areaData) => {
    set({ isLoading: true, error: null });
    try {
      await AreasController.update(idarea, areaData);
      await get().fetchAreas();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar área';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteArea: async (idarea) => {
    set({ isLoading: true, error: null });
    try {
      await AreasController.delete(idarea);
      await get().fetchAreas();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar área';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
})); 