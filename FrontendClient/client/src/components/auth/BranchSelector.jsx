// ============================================
// BRANCH SELECTOR PAGE
// Shown when user navigates to login without ?branch= parameter
// in multi-tenant mode. User must select a branch to continue.
// ============================================
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useDeploymentStore from '../../store/useDeploymentStore';
import useBranchStore from '../../store/useBranchStore';
import { tenantApi } from '../../api/tenant.api';

const BranchSelector = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { deploymentType, tenantName, tenantSlug } = useDeploymentStore();
    const { availableBranches, setAvailableBranches, setCurrentBranch, loading } = useBranchStore();
    const [localLoading, setLocalLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadBranches = async () => {
            try {
                setLocalLoading(true);
                // Fetch branches from the tenant service
                const response = await tenantApi.getBranches();
                if (response?.success && response?.data) {
                    const branches = response.data.map((b) => ({
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
            } catch (err) {
                setError('Failed to load branches. Please try again.');
                console.error('Branch load error:', err);
            } finally {
                setLocalLoading(false);
            }
        };

        loadBranches();
    }, [setAvailableBranches]);

    const handleSelectBranch = (branch) => {
        setCurrentBranch(branch);
        // Navigate to login with branch parameter
        navigate(`/login?branch=${branch.slug}`, { replace: true });
    };

    if (localLoading || loading) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.spinner} />
                    <p style={styles.loadingText}>Loading branches...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <h2 style={styles.errorTitle}>Error</h2>
                    <p style={styles.errorText}>{error}</p>
                    <button style={styles.retryButton} onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Select Branch</h1>
                    <p style={styles.subtitle}>
                        {tenantName || 'Organization'} has multiple branches.
                        <br />
                        Please select which branch you want to access.
                    </p>
                </div>

                <div style={styles.branchList}>
                    {availableBranches.length === 0 ? (
                        <p style={styles.noBranches}>No branches available.</p>
                    ) : (
                        availableBranches
                            .filter((b) => b.isActive)
                            .map((branch) => (
                                <button
                                    key={branch.id}
                                    style={styles.branchCard}
                                    onClick={() => handleSelectBranch(branch)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#C9A84C';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={styles.branchInfo}>
                                        <div style={styles.branchIcon}>
                                            {branch.isPrimary ? '🏢' : '📍'}
                                        </div>
                                        <div style={styles.branchDetails}>
                                            <h3 style={styles.branchName}>
                                                {branch.name}
                                                {branch.isPrimary && (
                                                    <span style={styles.primaryBadge}>Primary</span>
                                                )}
                                            </h3>
                                            {branch.location && (
                                                <p style={styles.branchLocation}>{branch.location}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span style={styles.arrow}>→</span>
                                </button>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '1rem',
    },
    card: {
        background: 'white',
        borderRadius: '16px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#1a1a1a',
        marginBottom: '0.5rem',
    },
    subtitle: {
        fontSize: '0.9rem',
        color: '#6B7280',
        lineHeight: 1.5,
    },
    branchList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    branchCard: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        background: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
        width: '100%',
        fontSize: 'inherit',
        fontFamily: 'inherit',
    },
    branchInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    branchIcon: {
        fontSize: '1.5rem',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F3F4F6',
        borderRadius: '10px',
    },
    branchDetails: {
        display: 'flex',
        flexDirection: 'column',
    },
    branchName: {
        fontSize: '1rem',
        fontWeight: 600,
        color: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    primaryBadge: {
        fontSize: '0.65rem',
        background: '#C9A84C',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '4px',
        fontWeight: 600,
    },
    branchLocation: {
        fontSize: '0.8rem',
        color: '#6B7280',
        marginTop: '2px',
    },
    arrow: {
        fontSize: '1.2rem',
        color: '#9CA3AF',
    },
    noBranches: {
        textAlign: 'center',
        color: '#6B7280',
        padding: '2rem',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '3px solid #E5E7EB',
        borderTop: '3px solid #C9A84C',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 1rem',
    },
    loadingText: {
        textAlign: 'center',
        color: '#6B7280',
    },
    errorTitle: {
        fontSize: '1.2rem',
        fontWeight: 600,
        color: '#DC2626',
        marginBottom: '0.5rem',
        textAlign: 'center',
    },
    errorText: {
        textAlign: 'center',
        color: '#6B7280',
        marginBottom: '1rem',
    },
    retryButton: {
        display: 'block',
        margin: '0 auto',
        padding: '0.75rem 2rem',
        background: '#C9A84C',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 600,
    },
};

export default BranchSelector;