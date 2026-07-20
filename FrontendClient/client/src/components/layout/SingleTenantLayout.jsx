import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Users, Package, X, LogOut } from '../../utils/icons/icons';

const menuItems = [
    { path: '/all-deceased', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/deceased', label: 'Deceased', icon: Users },
    { path: '/coffins', label: 'Coffins', icon: Package },
];

export default function SingleTenantLayout({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get tenant slug from localStorage
    const getTenantSlug = () => {
        return localStorage.getItem('tenantSlug') || '';
    };

    const tenantSlug = getTenantSlug();

    const handleNavigation = (path) => {
        // Navigate to full tenant path
        const fullPath = tenantSlug ? `/tenant/${tenantSlug}${path}` : path;
        navigate(fullPath);
        setIsOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('onboardingData');
        localStorage.removeItem('onboardingComplete');
        navigate('/login');
        setIsOpen(false);
    };

    const floatingNavStyle = {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 1000,
    };

    const navButtonStyle = {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: '#3D4F47',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
    };

    const menuOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
        animation: 'fadeIn 0.2s ease',
    };

    const menuContainerStyle = {
        position: 'fixed',
        bottom: '6rem',
        right: '2rem',
        background: 'white',
        borderRadius: '12px',
        padding: '0.5rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        zIndex: 1001,
        minWidth: '200px',
        animation: 'slideUp 0.3s ease',
    };

    const menuItemStyle = (isActive) => ({
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'none',
        border: 'none',
        color: '#1A1D24',
        fontSize: '0.9rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        textAlign: 'left',
        background: isActive ? '#f3efe6' : 'none',
        color: isActive ? '#3D4F47' : '#1A1D24',
        fontWeight: isActive ? '600' : '400',
    });

    const iconWrapperStyle = {
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* Main Content */}
            <main style={{ paddingBottom: '100px' }}>
                {children}
            </main>

            {/* Floating Navigation */}
            <div style={floatingNavStyle}>
                {isOpen && (
                    <>
                        <div style={menuOverlayStyle} onClick={() => setIsOpen(false)} />
                        <div style={menuContainerStyle}>
                            {menuItems.map((item) => {
                                const currentPath = location.pathname;
                                const isActive = currentPath === item.path ||
                                    currentPath === `/${tenantSlug}${item.path}` ||
                                    currentPath.endsWith(item.path);
                                return (
                                    <div
                                        key={item.path}
                                        onClick={() => handleNavigation(item.path)}
                                        style={menuItemStyle(isActive)}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = '#f3efe6';
                                                e.currentTarget.style.color = '#3D4F47';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'none';
                                                e.currentTarget.style.color = '#1A1D24';
                                            }
                                        }}
                                    >
                                        <div style={iconWrapperStyle}>
                                            <item.icon size={20} />
                                        </div>
                                        <span>{item.label}</span>
                                    </div>
                                );
                            })}

                            {/* Logout Button */}
                            <div
                                onClick={handleLogout}
                                style={{
                                    ...menuItemStyle(false),
                                    marginTop: '0.5rem',
                                    borderTop: '1px solid #e3ddd0',
                                    paddingTop: '0.75rem',
                                    color: '#9B4A3F',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f7ece9';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'none';
                                }}
                            >
                                <div style={iconWrapperStyle}>
                                    <LogOut size={20} />
                                </div>
                                <span>Logout</span>
                            </div>
                        </div>
                    </>
                )}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    style={navButtonStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#2E3F37';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#3D4F47';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    {isOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
                </div>
            </div>
        </div>
    );
}