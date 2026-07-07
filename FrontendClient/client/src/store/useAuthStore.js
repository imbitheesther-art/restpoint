// ============================================
// AUTH STORE
// Manages authentication state with branch awareness
// For multi-tenant: stores branch_id and validates branch access
// ============================================
import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
    user: null,               // { id, email, fullName, role, branchId, branchSlug, tenantSlug, tenantId }
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    login: (userData, token, refreshToken) => {
        // Persist to localStorage
        localStorage.setItem('authToken', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.tenantSlug) localStorage.setItem('tenantSlug', userData.tenantSlug);

        set({
            user: userData,
            token,
            refreshToken: refreshToken || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
        });
    },

    logout: () => {
        // Clear all auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tenantSlug');
        localStorage.removeItem('branchSlug');
        localStorage.removeItem('branchDb');

        set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
    },

    setLoading: (status) => set({ isLoading: status }),
    setError: (error) => set({ error, isLoading: false }),

    // Initialize from localStorage (called on app startup)
    initialize: () => {
        try {
            const token = localStorage.getItem('authToken');
            const userStr = localStorage.getItem('user');

            if (token && userStr) {
                const user = JSON.parse(userStr);
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        } catch (e) {
            console.error('Auth initialization error:', e);
            set({ isLoading: false });
        }
    },

    // Check if user belongs to a specific branch
    belongsToBranch: (branchId) => {
        const { user } = get();
        if (!user) return false;
        // Single tenant: no branch restriction
        if (!user.branchId) return true;
        return user.branchId === branchId;
    },

    // Check if user can manage users (admin in primary branch)
    canManageUsers: () => {
        const { user } = get();
        if (!user) return false;
        return user.role === 'admin';
    },
}));

export default useAuthStore;