import { create } from 'zustand';

type SessionState = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  // Agrega aquí otros flags o datos temporales de UI/sesión si los necesitas
};

export const useSessionStore = create<SessionState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
