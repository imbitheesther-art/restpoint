// ============================================
// APP INITIALIZATION HOOK
// Runs on app startup to detect deployment type and branch
// ============================================
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useDeploymentStore from '../store/useDeploymentStore';
import useBranchStore from '../store/useBranchStore';
import useAuthStore from '../store/useAuthStore';
import { tenantApi } from '../api/tenant.api';

export const useAppInitialization = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { setDeployment, setLoading: setDeploymentLoading, deploymentType, loading: deploymentLoading } = useDeploymentStore();
    const { setCurrentBranch, setAvailableBranches, getBranchFromUrl, currentBranch } = useBranchStore();
    const { initialize: initAuth, isAuthenticated, user } = useAuthStore();

    // Initialize auth store from localStorage
    useEffect(() => {
        initAuth();
    }, [initAuth]);

    // Fetch deployment settings and branch data
    useEffect(() => {
        const fetchDeploymentInfo = async () => {
            try {
                setDeploymentLoading(true);

                // Get tenant slug from URL or localStorage
                const urlParams = new URLSearchParams(location.search);
                const urlSlug = urlParams.get('slug') || location.pathname.split('/')[2];
                const storedSlug = localStorage.getItem('tenantSlug');
                const tenantSlug = urlSlug || storedSlug;

                // Fetch tenant settings (deployment type, branch count, etc.)
                // Pass tenant slug to detect multi-tenant mode
                const settingsResult = await tenantApi.getTenantSettings(tenantSlug);
                const settings = settingsResult?.data || {};

                if (settings?.deploymentType) {
                    setDeployment({
                        deploymentType: settings.deploymentType,
                        branchCount: settings.branchCount || 0,
                        tenantName: settings.tenantName || '',
                        tenantSlug: settings.tenantSlug || tenantSlug || '',
                    });

                    // If multi-tenant, fetch available branches
                    if (settings.deploymentType === 'multi') {
                        const branchesResult = await tenantApi.getBranches();
                        if (branchesResult?.success && branchesResult?.data) {
                            const branches = branchesResult.data.map((b) => ({
                                id: b.branch_id,
                                name: b.branch_name,
                                slug: b.branch_slug,
                                database: b.branch_db_name,
                                location: b.branch_location,
                                phone: b.branch_phone,
                                email: b.branch_email,
                                isPrimary: b.is_primary || false,
                                isActive: b.is_active,
                            }));
                            setAvailableBranches(branches);
                        }
                    }
                } else {
                    // Default to single tenant if no settings found
                    setDeployment({
                        deploymentType: 'single',
                        branchCount: 0,
                        tenantName: settings?.tenantName || '',
                        tenantSlug: settings?.tenantSlug || tenantSlug || '',
                    });
                }
            } catch (err) {
                console.error('Failed to fetch deployment info:', err);
                // Default to single tenant on error
                setDeployment({
                    deploymentType: 'single',
                    branchCount: 0,
                    tenantName: '',
                    tenantSlug: '',
                });
            } finally {
                setDeploymentLoading(false);
            }
        };

        fetchDeploymentInfo();
    }, [setDeployment, setAvailableBranches, setDeploymentLoading, location.pathname, location.search]);

    // Handle branch routing for multi-tenant
    useEffect(() => {
        if (!isAuthenticated || deploymentLoading || deploymentType === null) {
            return;
        }

        const branchFromUrl = getBranchFromUrl();
        const currentPath = location.pathname;

        // Skip for public pages
        const publicPaths = ['/login', '/register', '/forgot-password', '/', '/privacy', '/terms', '/security', '/about', '/contact', '/support', '/why-us'];
        const isPublicPage = publicPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));

        if (isPublicPage) {
            return;
        }

        // Multi-tenant: require branch in URL
        if (deploymentType === 'multi') {
            if (!branchFromUrl) {
                // Redirect to branch selector
                navigate('/select-branch', { replace: true });
                return;
            }

            // Set current branch from URL
            const branch = useBranchStore.getState().findBranchBySlug(branchFromUrl);
            if (branch) {
                setCurrentBranch(branch);
            }
        }
    }, [isAuthenticated, deploymentType, deploymentLoading, location.pathname, navigate, getBranchFromUrl, setCurrentBranch]);

    return {
        deploymentType,
        deploymentLoading,
        currentBranch,
        isAuthenticated,
        user,
    };
};