
import { create } from 'zustand';

export const useTenantStore = create((set) => ({
    tenantData: null,
    features: {}, // Feature flags
    isLoading: true,
    error: null,

    setTenantData: (data) => set({ tenantData: data, features: data.features || {}, isLoading: false }),
    setLoading: (status) => set({ isLoading: status }),
    setError: (error) => set({ error, isLoading: false }),
    clearTenant: () => set({ tenantData: null, features: {}, isLoading: false, error: null }),
}));