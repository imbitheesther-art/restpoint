import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: (userData) => set({ user: userData, isAuthenticated: true, isLoading: false }),
    logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
    setLoading: (status) => set({ isLoading: status }),
}));