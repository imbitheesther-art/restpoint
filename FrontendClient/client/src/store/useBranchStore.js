// ============================================
// BRANCH STORE
// Manages current selected branch for multi-tenant
// Branch is read from URL ?branch= parameter
// ============================================
import { create } from 'zustand';

const useBranchStore = create((set, get) => ({
    currentBranch: null,       // { id, name, slug, database, isPrimary }
    availableBranches: [],     // All branches for this tenant
    loading: false,
    error: null,

    setCurrentBranch: (branch) => {
        // Persist branch slug to localStorage for API calls
        if (branch?.slug) {
            localStorage.setItem('branchSlug', branch.slug);
            localStorage.setItem('branchDb', branch.database || '');
        }
        set({ currentBranch: branch, error: null });
    },

    setAvailableBranches: (branches) => set({
        availableBranches: branches,
        loading: false,
    }),

    setLoading: (status) => set({ loading: status }),
    setError: (error) => set({ error, loading: false }),

    clearBranch: () => {
        localStorage.removeItem('branchSlug');
        localStorage.removeItem('branchDb');
        set({ currentBranch: null, availableBranches: [], error: null });
    },

    // Get branch slug from URL query params
    getBranchFromUrl: () => {
        if (typeof window === 'undefined') return null;
        const params = new URLSearchParams(window.location.search);
        return params.get('branch');
    },

    // Find branch by slug in available branches
    findBranchBySlug: (slug) => {
        const { availableBranches } = get();
        return availableBranches.find(b => b.slug === slug) || null;
    },

    // Check if current branch is primary
    isPrimaryBranch: () => {
        const { currentBranch } = get();
        return currentBranch?.isPrimary === true;
    },
}));

export default useBranchStore;