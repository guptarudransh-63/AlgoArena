import { create } from 'zustand';
import { authApi } from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const { data } = await authApi.getMe();
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ error: null });
    const { data } = await authApi.login(credentials);
    set({ user: data.data.user, isAuthenticated: true });
    return data;
  },

  register: async (userData) => {
    set({ error: null });
    const { data } = await authApi.register(userData);
    set({ user: data.data.user, isAuthenticated: true });
    return data;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
