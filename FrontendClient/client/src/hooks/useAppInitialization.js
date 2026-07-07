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

    // Handle branch routing for multi-tenant - BULLETPROOF VERSION WITH MULTIPLE FALLBACKS
    useEffect(() => {
        if (!isAuthenticated || deploymentLoading || deploymentType === null) {
            return;
        }

        const currentPath = location.pathname;

        // Skip for public pages
        const publicPaths = ['/login', '/register', '/forgot-password', '/', '/privacy', '/terms', '/security', '/about', '/contact', '/support', '/why-us'];
        const isPublicPage = publicPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));

        if (isPublicPage) {
            return;
        }

        // For multi-tenant, ensure user is always on their tenant path
        if (deploymentType === 'multi') {
            // FALLBACK 1: Try to get tenantSlug from localStorage
            let tenantSlug = localStorage.getItem('tenantSlug');

            // FALLBACK 2: If not in localStorage, try to get from user object
            if (!tenantSlug && user?.tenantSlug) {
                tenantSlug = user.tenantSlug;
                localStorage.setItem('tenantSlug', tenantSlug);
            }

            // FALLBACK 3: If still no tenantSlug, try to get from URL
            if (!tenantSlug) {
                const urlParts = currentPath.split('/');
                if (urlParts.length >= 3 && urlParts[1] === 'tenant') {
                    tenantSlug = urlParts[2];
                    localStorage.setItem('tenantSlug', tenantSlug);
                }
            }

            // CRITICAL: If we still don't have tenantSlug, we can't route
            if (!tenantSlug) {
                console.error('No tenantSlug available anywhere, cannot route user');
                return;
            }

            // Check if we're on the correct tenant path
            const expectedPath = `/tenant/${tenantSlug}`;
            const isOnCorrectPath = currentPath.startsWith(expectedPath);

            // If not on correct path, redirect immediately
            if (!isOnCorrectPath) {
                console.log(`Redirecting to tenant path: ${expectedPath}/all-deceased`);
                navigate(`/tenant/${tenantSlug}/all-deceased`, { replace: true });
                return;
            }

            // We're on the correct path - set branch info if available
            if (user?.branchSlug) {
                const branch = useBranchStore.getState().findBranchBySlug(user.branchSlug);
                if (branch) {
                    setCurrentBranch(branch);
                }
            }
        }
    }, [isAuthenticated, deploymentType, deploymentLoading, location.pathname, navigate, setCurrentBranch, user]);

    return {
        deploymentType,
        deploymentLoading,
        currentBranch,
        isAuthenticated,
        user,
    };
};