// ============================================
// AUTH STORE
// Uses sessionStorage for access token (cleared on tab close)
// Uses httpOnly cookies for refresh token via withCredentials
// Auto-refresh every 10 minutes
// ============================================
import { create } from 'zustand';
import { startTokenRefresh, stopTokenRefresh, forceLogout } from '../api/axios';

const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    login: (userData, token) => {
        // Store in sessionStorage only (cleared on tab close)
        if (token) sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('user', JSON.stringify(userData));
        if (userData.tenantSlug) localStorage.setItem('tenantSlug', userData.tenantSlug);
        if (userData.branchId) localStorage.setItem('branchId', userData.branchId);
        if (userData.dbName) localStorage.setItem('dbName', userData.dbName);

        set({
            user: userData,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
        });

        // Start auto-refresh every 10 minutes
        startTokenRefresh();
    },

    logout: () => {
        // Stop auto-refresh
        stopTokenRefresh();

        // Clear sessionStorage (access token, user data)
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');

        // Clear localStorage (non-sensitive metadata only)
        localStorage.removeItem('tenantSlug');
        localStorage.removeItem('branchSlug');
        localStorage.removeItem('branchId');
        localStorage.removeItem('dbName');

        set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
    },

    setLoading: (status) => set({ isLoading: status }),
    setError: (error) => set({ error, isLoading: false }),

    // Initialize from sessionStorage (called on app startup)
    initialize: () => {
        try {
            const token = sessionStorage.getItem('authToken');
            const userStr = sessionStorage.getItem('user');

            if (token && userStr) {
                const user = JSON.parse(userStr);
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });

                // Start auto-refresh every 10 minutes
                startTokenRefresh();
            } else {
                set({ isLoading: false });
            }
        } catch (e) {
            console.error('Auth initialization error:', e);
            set({ isLoading: false });
        }
    },

    // Force logout (used when token refresh fails)
    forceLogout: () => {
        stopTokenRefresh();
        forceLogout(); // This redirects to /login
    },

    // Check if user belongs to a specific branch
    belongsToBranch: (branchId) => {
        const { user } = get();
        if (!user) return false;
        if (!user.branchId) return true;
        return user.branchId === branchId;
    },

    canManageUsers: () => {
        const { user } = get();
        if (!user) return false;
        return user.role === 'admin';
    },
}));

export default useAuthStore;