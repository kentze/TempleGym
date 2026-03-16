import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { UserProfile } from '@templegym/types';

const TOKEN_KEY = 'templegym_jwt';

interface AuthState {
  token:           string | null;
  user:            UserProfile | null;
  isAuthenticated: boolean;
  setToken:        (token: string) => Promise<void>;
  setUser:         (user: UserProfile) => void;
  logout:          () => Promise<void>;
  rehydrate:       () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token:           null,
  user:            null,
  isAuthenticated: false,

  setToken: async (token) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  rehydrate: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) set({ token, isAuthenticated: true });
    return token;
  },
}));
