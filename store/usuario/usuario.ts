// ===========================================
// 1. store/usuario/usuario.ts (Store - Definiendo usuario y Área de permisos y roles)
// ===========================================
import { create } from 'zustand';

// INTERFAZ USUARIO
export interface Usuariosum {
  idusuario: number;
  nombreusuario: string;
  apellido: string;
  correoinstitucional: string;
  password: string;
  matricula: number;
  telefono: number;
  idarea: number;
  reporta_a?: number | null;
  pin?: string | null;
  estado?: string | null;
}

// INTERFAZ ÁREA
export interface Area {
  idarea: number;
  nombrearea: string;
  rolarea: string;
  permisos: Record<string, boolean>;
}

// STORE DE USUARIO
interface UsuarioState {
  usuario: Usuariosum | null;
  isLoading: boolean;
  error: string | null;
  setUsuario: (usuario: Usuariosum | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUsuarioStore = create<UsuarioState>((set) => ({
  usuario: null,
  isLoading: false,
  error: null,
  setUsuario: (usuario) => set({ usuario }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
