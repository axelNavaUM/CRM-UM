import { create } from 'zustand';

type User = {
  email: string;
  name?: string;
  avatarUrl?: string;
};

type SessionState = {
  user: User | null;
  setSession: (user: User) => void;
  logout: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  setSession: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
