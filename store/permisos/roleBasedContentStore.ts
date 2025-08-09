import { RoleBasedContentController } from '@/controller/permisos/roleBasedContentController';
import { DashboardMetrics, RoleBasedContent } from '@/models/permisos/roleBasedContentModel';
import { create } from 'zustand';

interface RoleBasedContentState {
  content: RoleBasedContent;
  metrics: DashboardMetrics;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadContentByRole: (email: string) => Promise<void>;
  loadMetrics: () => Promise<void>;
  resetState: () => void;
}

export const useRoleBasedContentStore = create<RoleBasedContentState>((set, get) => ({
  content: {
    showCareerChangePetitions: false,
    showLogs: false,
    showStudentsByGroups: false,
    showStudentsWithMissingDocuments: false,
    showStudentsWithPendingPayments: false,
    showAsesorStudents: false,
    showMetrics: false,
    showDefaultContent: true,
    role: 'lector',
    area: ''
  },
  metrics: {
    totalRegistrations: 0,
    pendingRegistrations: 0,
    totalPetitions: 0,
    pendingPetitions: 0,
    registrationsByAdvisor: {},
    petitionsByAdvisor: {}
  },
  isLoading: false,
  error: null,

  loadContentByRole: async (email: string) => {
    console.log('[DEBUG] loadContentByRole llamado con email:', email);
    
    // Evitar cargar si ya está cargando
    const currentState = get();
    if (currentState.isLoading) {
      console.log('[DEBUG] Ya está cargando, saltando petición duplicada');
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const content = await RoleBasedContentController.determineContentByRole(email);
      console.log('[DEBUG] Contenido obtenido del controlador:', content);
      set({ content, isLoading: false });
      
      // Si el contenido incluye métricas, cargarlas
      if (content.showMetrics) {
        await get().loadMetrics();
      }
    } catch (error) {
      console.error('[DEBUG] Error en loadContentByRole:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar contenido',
        isLoading: false 
      });
    }
  },

  loadMetrics: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const metrics = await RoleBasedContentController.loadDashboardMetrics();
      set({ metrics, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar métricas',
        isLoading: false 
      });
    }
  },

  resetState: () => {
    set({
      content: {
        showCareerChangePetitions: false,
        showLogs: false,
        showStudentsByGroups: false,
        showStudentsWithMissingDocuments: false,
        showStudentsWithPendingPayments: false,
        showAsesorStudents: false,
        showMetrics: false,
        showDefaultContent: true,
        role: 'lector',
        area: ''
      },
      metrics: {
        totalRegistrations: 0,
        pendingRegistrations: 0,
        totalPetitions: 0,
        pendingPetitions: 0,
        registrationsByAdvisor: {},
        petitionsByAdvisor: {}
      },
      isLoading: false,
      error: null
    });
  }
})); 