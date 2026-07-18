import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import env from '../../utils/config/env';
import { ENDPOINTS } from '../../api/endpoints';

const THEME = {
    colors: {
        ink: '#15171A',
        bone: '#FAF8F4',
        bone2: '#F3EFE6',
        brass: '#8B7355',
        brassHover: '#A98F6E',
        verdigris: '#3D4F47',
        line: '#E3DDD0',
        gray: '#6B6862',
        white: '#FFFFFF',
        success: '#475A43',
        successBg: '#EEF3EC',
        red: '#9B4A3F',
        redBg: '#F7ECE9',
        shadow: 'rgba(21,23,26,0.12)',
    },
    spacing: {
        xs: '0.3rem',
        sm: '0.55rem',
        md: '0.78rem',
        lg: '1.1rem',
        xl: '1.5rem',
        xxl: '2rem',
    },
};

export default function SettingsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);

    const [userForm, setUserForm] = useState({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        role: 'staff',
        branch_id: '',
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setCurrentUser(user);

            // Redirect drivers to driver portal
            if (user.role === 'driver') {
                navigate('/driver-portal');
                return;
            }
        }
        loadData();
    }, [navigate]);

    const loadData = async () => {
        try {
            const tenantSlug = localStorage.getItem('tenantSlug');

            const [settingsRes, usersRes, branchesRes] = await Promise.all([
                api.get(ENDPOINTS.TENANT.SETTINGS(tenantSlug)),
                api.get(ENDPOINTS.TENANT.USERS(tenantSlug)),
                api.get(ENDPOINTS.TENANT.BRANCHES(tenantSlug)),
            ]);

            setSettings(settingsRes.data.data);
            setUsers(usersRes.data.data || []);
            setBranches(branchesRes.data.data || []);
        } catch (error) {
            console.error('Failed to load settings:', error);
            setError('Failed to load settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const tenantSlug = localStorage.getItem('tenantSlug');

            const payload = {
                ...userForm,
                branch_id: userForm.branch_id || null,
            };

            await api.post(ENDPOINTS.TENANT.CREATE_USER(tenantSlug), payload);
            setShowAddUserModal(false);
            setUserForm({ email: '', password: '', full_name: '', phone: '', role: 'staff', branch_id: '' });
            loadData();
        } catch (error) {
            console.error('Failed to add user:', error);
            alert(error.response?.data?.message || 'Failed to add user');
        }
    };

    const isMultiTenant = settings?.deploymentType === 'multi';
    const isAdmin = currentUser?.role === 'admin';
    const isManager = currentUser?.role === 'manager' || isAdmin;

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: THEME.colors.bone }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid ' + THEME.colors.line, borderTopColor: THEME.colors.brass, borderRadius: '50%', animation: 'spin 0.65s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ color: THEME.colors.gray, fontSize: '0.88rem' }}>Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: THEME.colors.bone }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

            {/* Header */}
            <div style={{ background: THEME.colors.white, borderBottom: `1px solid ${THEME.colors.line}`, padding: '1.5rem 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.5rem', fontWeight: 600, color: THEME.colors.ink, marginBottom: '0.25rem' }}>
                            Settings
                        </h1>
                        <p style={{ fontSize: '0.85rem', color: THEME.colors.gray }}>
                            {isMultiTenant ? 'Multi-Branch Organization' : 'Single Location'} • {settings?.branchCount} {isMultiTenant ? 'branches' : 'location'}
                        </p>
                    </div>
                    {isManager && (
                        <button
                            onClick={() => setShowAddUserModal(true)}
                            style={{
                                padding: '0.6rem 1.2rem',
                                background: THEME.colors.brass,
                                color: THEME.colors.white,
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            + Add User
                        </button>
                    )}
                </div>
            </div>

            {/* Organization Info Banner */}
            <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
                <div style={{
                    padding: '1.25rem 1.5rem',
                    background: THEME.colors.white,
                    border: `1px solid ${THEME.colors.line}`,
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                }}>
                    <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: THEME.colors.ink, marginBottom: '1rem' }}>
                        Organization Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <p style={{ fontSize: '0.72rem', color: THEME.colors.gray, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Organization Name</p>
                            <p style={{ fontSize: '0.88rem', color: THEME.colors.ink, fontWeight: 500 }}>{settings?.tenantName}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.72rem', color: THEME.colors.gray, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Location</p>
                            <p style={{ fontSize: '0.88rem', color: THEME.colors.ink, fontWeight: 500 }}>{settings?.location || 'Not specified'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.72rem', color: THEME.colors.gray, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Country</p>
                            <p style={{ fontSize: '0.88rem', color: THEME.colors.ink, fontWeight: 500 }}>{settings?.country || 'Not specified'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.72rem', color: THEME.colors.gray, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Email</p>
                            <p style={{ fontSize: '0.88rem', color: THEME.colors.ink, fontWeight: 500 }}>{settings?.email || 'Not specified'}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: `1px solid ${THEME.colors.line}` }}>
                    {isManager && (
                        <button
                            onClick={() => setActiveTab('users')}
                            style={{
                                padding: '0.75rem 1.25rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: `2px solid ${activeTab === 'users' ? THEME.colors.brass : 'transparent'}`,
                                color: activeTab === 'users' ? THEME.colors.ink : THEME.colors.gray,
                                fontSize: '0.88rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                fontFamily: "'Inter', sans-serif",
                                marginBottom: '-1px',
                            }}
                        >
                            Users & Roles
                        </button>
                    )}
                    {isMultiTenant && (
                        <button
                            onClick={() => setActiveTab('branches')}
                            style={{
                                padding: '0.75rem 1.25rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: `2px solid ${activeTab === 'branches' ? THEME.colors.brass : 'transparent'}`,
                                color: activeTab === 'branches' ? THEME.colors.ink : THEME.colors.gray,
                                fontSize: '0.88rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                fontFamily: "'Inter', sans-serif",
                                marginBottom: '-1px',
                            }}
                        >
                            Branches
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('analytics')}
                        style={{
                            padding: '0.75rem 1.25rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: `2px solid ${activeTab === 'analytics' ? THEME.colors.brass : 'transparent'}`,
                            color: activeTab === 'analytics' ? THEME.colors.ink : THEME.colors.gray,
                            fontSize: '0.88rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif",
                            marginBottom: '-1px',
                        }}
                    >
                        Analytics
                    </button>
                </div>

                {/* Tab Content */}
                <div style={{
                    background: THEME.colors.white,
                    border: `1px solid ${THEME.colors.line}`,
                    borderRadius: '8px',
                    padding: '1.5rem',
                }}>
                    {activeTab === 'users' && isManager && (
                        <div>
                            <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.1rem', fontWeight: 600, color: THEME.colors.ink, marginBottom: '1rem' }}>
                                User Management
                            </h3>
                            {users.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: THEME.colors.gray }}>
                                    <p style={{ fontSize: '0.88rem', marginBottom: '0.5rem' }}>No users registered yet</p>
                                    <p style={{ fontSize: '0.82rem' }}>Click "Add User" to create your first user account</p>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: `2px solid ${THEME.colors.line}` }}>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: THEME.colors.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: THEME.colors.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: THEME.colors.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                                                {isMultiTenant && <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: THEME.colors.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Branch</th>}
                                                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: THEME.colors.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.user_id} style={{ borderBottom: `1px solid ${THEME.colors.line}` }}>
                                                    <td style={{ padding: '0.75rem', fontSize: '0.88rem', color: THEME.colors.ink }}>{user.full_name}</td>
                                                    <td style={{ padding: '0.75rem', fontSize: '0.88rem', color: THEME.colors.gray }}>{user.email}</td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <span style={{
                                                            padding: '0.25rem 0.6rem',
                                                            background: user.role === 'admin' ? THEME.colors.redBg : THEME.colors.bone2,
                                                            color: user.role === 'admin' ? THEME.colors.red : THEME.colors.ink,
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 500,
                                                            textTransform: 'capitalize',
                                                        }}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    {isMultiTenant && (
                                                        <td style={{ padding: '0.75rem', fontSize: '0.88rem', color: THEME.colors.gray }}>
                                                            {user.branch_name || '—'}
                                                        </td>
                                                    )}
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <span style={{
                                                            padding: '0.25rem 0.6rem',
                                                            background: THEME.colors.successBg,
                                                            color: THEME.colors.success,
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 500,
                                                        }}>
                                                            Active
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'branches' && isMultiTenant && (
                        <div>
                            <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.1rem', fontWeight: 600, color: THEME.colors.ink, marginBottom: '1rem' }}>
                                Branch Management
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                {branches.map((branch) => (
                                    <div key={branch.branch_id} style={{
                                        padding: '1.25rem',
                                        background: THEME.colors.bone,
                                        border: `1px solid ${THEME.colors.line}`,
                                        borderRadius: '8px',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                            <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: THEME.colors.ink }}>
                                                {branch.branch_name}
                                            </h4>
                                            <span style={{
                                                padding: '0.2rem 0.5rem',
                                                background: THEME.colors.successBg,
                                                color: THEME.colors.success,
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                fontWeight: 500,
                                            }}>
                                                Active
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.82rem', color: THEME.colors.gray, marginBottom: '0.5rem' }}>
                                            Slug: {branch.branch_slug}
                                        </p>
                                        {branch.branch_location && (
                                            <p style={{ fontSize: '0.82rem', color: THEME.colors.gray, marginBottom: '0.5rem' }}>
                                                📍 {branch.branch_location}
                                            </p>
                                        )}
                                        {branch.branch_phone && (
                                            <p style={{ fontSize: '0.82rem', color: THEME.colors.gray }}>
                                                📞 {branch.branch_phone}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div>
                            <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.1rem', fontWeight: 600, color: THEME.colors.ink, marginBottom: '1rem' }}>
                                Analytics Dashboard
                            </h3>
                            <div style={{
                                padding: '3rem',
                                background: THEME.colors.bone2,
                                border: `2px dashed ${THEME.colors.line}`,
                                borderRadius: '8px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                                <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', fontWeight: 600, color: THEME.colors.ink, marginBottom: '0.5rem' }}>
                                    {isMultiTenant ? 'Comprehensive Analytics' : 'Basic Analytics'}
                                </h4>
                                <p style={{ fontSize: '0.88rem', color: THEME.colors.gray, maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
                                    {isMultiTenant
                                        ? 'View comprehensive analytics across all branches including deceased registrations, revenue, and operational metrics.'
                                        : 'View basic analytics for your single location including registrations and key metrics.'}
                                </p>
                                <button
                                    onClick={() => navigate('/analytics')}
                                    style={{
                                        marginTop: '1.5rem',
                                        padding: '0.75rem 1.5rem',
                                        background: THEME.colors.brass,
                                        color: THEME.colors.white,
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '0.88rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    View Analytics
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            {showAddUserModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(21,23,26,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem',
                }}>
                    <div style={{
                        background: THEME.colors.white,
                        borderRadius: '8px',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.25rem', fontWeight: 600, color: THEME.colors.ink }}>
                                Add New User
                            </h2>
                            <button
                                onClick={() => setShowAddUserModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    color: THEME.colors.gray,
                                    cursor: 'pointer',
                                    lineHeight: 1,
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleAddUser}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: THEME.colors.ink, marginBottom: '0.4rem' }}>
                                    Full Name <span style={{ color: THEME.colors.red }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={userForm.full_name}
                                    onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.6rem',
                                        border: `1px solid ${THEME.colors.line}`,
                                        borderRadius: '4px',
                                        fontSize: '0.88rem',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: THEME.colors.ink, marginBottom: '0.4rem' }}>
                                    Email <span style={{ color: THEME.colors.red }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.6rem',
                                        border: `1px solid ${THEME.colors.line}`,
                                        borderRadius: '4px',
                                        fontSize: '0.88rem',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: THEME.colors.ink, marginBottom: '0.4rem' }}>
                                    Password <span style={{ color: THEME.colors.red }}>*</span>
                                </label>
                                <input
                                    type="password"
                                    value={userForm.password}
                                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                    required
                                    minLength={6}
                                    style={{
                                        width: '100%',
                                        padding: '0.6rem',
                                        border: `1px solid ${THEME.colors.line}`,
                                        borderRadius: '4px',
                                        fontSize: '0.88rem',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: THEME.colors.ink, marginBottom: '0.4rem' }}>
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={userForm.phone}
                                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.6rem',
                                        border: `1px solid ${THEME.colors.line}`,
                                        borderRadius: '4px',
                                        fontSize: '0.88rem',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: THEME.colors.ink, marginBottom: '0.4rem' }}>
                                    Role <span style={{ color: THEME.colors.red }}>*</span>
                                </label>
                                <select
                                    value={userForm.role}
                                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.6rem',
                                        border: `1px solid ${THEME.colors.line}`,
                                        borderRadius: '4px',
                                        fontSize: '0.88rem',
                                        fontFamily: "'Inter', sans-serif",
                                        background: THEME.colors.white,
                                    }}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="staff">Staff</option>
                                    <option value="user">User</option>
                                    <option value="driver">Driver</option>
                                </select>
                            </div>

                            {isMultiTenant && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: THEME.colors.ink, marginBottom: '0.4rem' }}>
                                        Branch
                                    </label>
                                    <select
                                        value={userForm.branch_id}
                                        onChange={(e) => setUserForm({ ...userForm, branch_id: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem',
                                            border: `1px solid ${THEME.colors.line}`,
                                            borderRadius: '4px',
                                            fontSize: '0.88rem',
                                            fontFamily: "'Inter', sans-serif",
                                            background: THEME.colors.white,
                                        }}
                                    >
                                        <option value="">Select a branch</option>
                                        {branches.map((branch) => (
                                            <option key={branch.branch_id} value={branch.branch_id}>
                                                {branch.branch_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddUserModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'transparent',
                                        color: THEME.colors.gray,
                                        border: `1px solid ${THEME.colors.line}`,
                                        borderRadius: '4px',
                                        fontSize: '0.88rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: THEME.colors.brass,
                                        color: THEME.colors.white,
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '0.88rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    Add User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}