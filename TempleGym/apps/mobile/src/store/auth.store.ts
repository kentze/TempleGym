import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { UserProfile } from '@templegym/types';

const TOKEN_KEY = 'templegym_jwt';

// expo-secure-store is not available on web — fall back to localStorage
const storage = {
  async get(key: string) {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string) {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    return SecureStore.setItemAsync(key, value);
  },
  async del(key: string) {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
    return SecureStore.deleteItemAsync(key);
  },
};

interface AuthState {
  token:              string | null;
  user:               UserProfile | null;
  isAuthenticated:    boolean;
  sessionExpired:     boolean;
  setToken:           (token: string) => Promise<void>;
  setUser:            (user: UserProfile) => void;
  logout:             () => Promise<void>;
  rehydrate:          () => Promise<string | null>;
  setSessionExpired:  (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token:           null,
  user:            null,
  isAuthenticated: false,
  sessionExpired:  false,

  setToken: async (token) => {
    await storage.set(TOKEN_KEY, token);
    set({ token, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    await storage.del(TOKEN_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  rehydrate: async () => {
    const token = await storage.get(TOKEN_KEY);
    if (token) set({ token, isAuthenticated: true });
    return token;
  },

  setSessionExpired: (value) => set({ sessionExpired: value }),
}));
