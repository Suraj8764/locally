import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setRole: (role: UserRole) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      setToken: (token) => set({ token, isAuthenticated: !!token }),
      logout: () => set({ user: null, role: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'locally-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
