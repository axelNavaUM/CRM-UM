import { create } from 'zustand';

type User = {
  email: string;
  name?: string;
  avatarUrl?: string;
};

type Session = {
  user: User;
  token?: string; 
};

type SessionState = {
  session: Session | null;
  setSession: (session: Session) => void;
  logout: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  logout: () => set({ session: null }),
}));
