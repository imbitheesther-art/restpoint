// ============================================
// DEPLOYMENT STORE
// Manages deployment type (single/multi)
// Loaded on app startup from tenant settings
// ============================================
import { create } from 'zustand';

const useDeploymentStore = create((set) => ({
    deploymentType: null,      // 'single' | 'multi' | null
    branchCount: 0,
    tenantName: '',
    tenantSlug: '',
    loading: true,
    error: null,

    setDeployment: (config) => set({
        deploymentType: config.deploymentType,
        branchCount: config.branchCount || 0,
        tenantName: config.tenantName || '',
        tenantSlug: config.tenantSlug || '',
        loading: false,
        error: null,
    }),

    setLoading: (status) => set({ loading: status }),
    setError: (error) => set({ error, loading: false }),

    clearDeployment: () => set({
        deploymentType: null,
        branchCount: 0,
        tenantName: '',
        tenantSlug: '',
        loading: false,
        error: null,
    }),

    // Check if deployment is multi-tenant
    isMulti: () => {
        const state = useDeploymentStore.getState();
        return state.deploymentType === 'multi';
    },

    // Check if deployment is single-tenant
    isSingle: () => {
        const state = useDeploymentStore.getState();
        return state.deploymentType === 'single';
    },
}));

export default useDeploymentStore;