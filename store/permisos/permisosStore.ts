import { PermisosController } from '@/controller/permisos/permisosController';
import type { Permiso, PoliticaRLS } from '@/models/permisos/permisosModel';
import type { CreatePermisoData, CreatePoliticaRLSData, UpdatePermisoData, UpdatePoliticaRLSData } from '@/services/permisos/permisosService';
import { create } from 'zustand';

interface PermisosState {
  permisos: Permiso[];
  politicasRLS: PoliticaRLS[];
  areasConPermisos: any[];
  isLoading: boolean;
  error: string | null;
  
  // Setters
  setPermisos: (permisos: Permiso[]) => void;
  setPoliticasRLS: (politicas: PoliticaRLS[]) => void;
  setAreasConPermisos: (areas: any[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Permisos CRUD
  fetchPermisos: () => Promise<void>;
  createPermiso: (permisoData: CreatePermisoData) => Promise<void>;
  updatePermiso: (id: number, permisoData: UpdatePermisoData) => Promise<void>;
  deletePermiso: (id: number) => Promise<void>;
  
  // Políticas RLS CRUD
  fetchPoliticasRLS: () => Promise<void>;
  createPoliticaRLS: (politicaData: CreatePoliticaRLSData) => Promise<void>;
  updatePoliticaRLS: (id: number, politicaData: UpdatePoliticaRLSData) => Promise<void>;
  deletePoliticaRLS: (id: number) => Promise<void>;
  
  // Utilidades
  fetchAreasConPermisos: () => Promise<void>;
  getPermisoById: (id: number) => Permiso | null;
  getPoliticaById: (id: number) => PoliticaRLS | null;
}

export const usePermisosStore = create<PermisosState>((set, get) => ({
  permisos: [],
  politicasRLS: [],
  areasConPermisos: [],
  isLoading: false,
  error: null,

  // Setters
  setPermisos: (permisos) => set({ permisos }),
  setPoliticasRLS: (politicas) => set({ politicasRLS: politicas }),
  setAreasConPermisos: (areas) => set({ areasConPermisos: areas }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Permisos CRUD
  fetchPermisos: async () => {
    set({ isLoading: true, error: null });
    try {
      const permisos = await PermisosController.getAllPermisos();
      set({ permisos, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al cargar permisos',
        isLoading: false 
      });
    }
  },

  createPermiso: async (permisoData) => {
    set({ isLoading: true, error: null });
    try {
      const newPermiso = await PermisosController.createPermiso(permisoData);
      set((state) => ({
        permisos: [...state.permisos, newPermiso],
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al crear permiso',
        isLoading: false 
      });
    }
  },

  updatePermiso: async (id, permisoData) => {
    set({ isLoading: true, error: null });
    try {
      await PermisosController.updatePermiso(id, permisoData);
      set((state) => ({
        permisos: state.permisos.map(permiso => 
          permiso.id === id 
            ? { ...permiso, ...permisoData }
            : permiso
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al actualizar permiso',
        isLoading: false 
      });
    }
  },

  deletePermiso: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await PermisosController.deletePermiso(id);
      set((state) => ({
        permisos: state.permisos.filter(permiso => permiso.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al eliminar permiso',
        isLoading: false 
      });
    }
  },

  // Políticas RLS CRUD
  fetchPoliticasRLS: async () => {
    set({ isLoading: true, error: null });
    try {
      const politicas = await PermisosController.getAllPoliticasRLS();
      set({ politicasRLS: politicas, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al cargar políticas RLS',
        isLoading: false 
      });
    }
  },

  createPoliticaRLS: async (politicaData) => {
    set({ isLoading: true, error: null });
    try {
      const newPolitica = await PermisosController.createPoliticaRLS(politicaData);
      set((state) => ({
        politicasRLS: [...state.politicasRLS, newPolitica],
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al crear política RLS',
        isLoading: false 
      });
    }
  },

  updatePoliticaRLS: async (id, politicaData) => {
    set({ isLoading: true, error: null });
    try {
      await PermisosController.updatePoliticaRLS(id, politicaData);
      set((state) => ({
        politicasRLS: state.politicasRLS.map(politica => 
          politica.id === id 
            ? { ...politica, ...politicaData }
            : politica
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al actualizar política RLS',
        isLoading: false 
      });
    }
  },

  deletePoliticaRLS: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await PermisosController.deletePoliticaRLS(id);
      set((state) => ({
        politicasRLS: state.politicasRLS.filter(politica => politica.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al eliminar política RLS',
        isLoading: false 
      });
    }
  },

  // Utilidades
  fetchAreasConPermisos: async () => {
    set({ isLoading: true, error: null });
    try {
      const areas = await PermisosController.getAreasConPermisos();
      set({ areasConPermisos: areas, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al cargar áreas con permisos',
        isLoading: false 
      });
    }
  },

  getPermisoById: (id) => {
    const { permisos } = get();
    return permisos.find(permiso => permiso.id === id) || null;
  },

  getPoliticaById: (id) => {
    const { politicasRLS } = get();
    return politicasRLS.find(politica => politica.id === id) || null;
  },
})); 