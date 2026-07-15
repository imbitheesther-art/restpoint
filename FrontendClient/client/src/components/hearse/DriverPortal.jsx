import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Car,
    RefreshCw,
    CheckCircle,
    Phone,
    MapPin,
    LogOut,
    Calendar,
    Clock,
    AlertCircle,
    Truck,
    Loader2,
    Zap,
    CircleDot
} from 'lucide-react';
import env from '../../config/env';

const API_BASE_URL = env.FULL_API_URL;

// ─── Utility Helpers ───────────────────────────────────────────────
const getTenantSlug = () =>
    localStorage.getItem('tenantSlug') || sessionStorage.getItem('tenantSlug') || '';

const getUser = () => {
    try {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : {};
    } catch {
        return {};
    }
};

const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : 'N/A';

const genId = (id) => `BK-${String(id).padStart(4, '0')}`;

const getAuthHeaders = () => {
    const slug = getTenantSlug();
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const headers = { 'x-tenant-slug': slug };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
};

// ─── Status Configs ────────────────────────────────────────────────
const STATUS_CONFIG = {
    booked: { label: 'Booked', color: '#2563eb', bg: '#eff6ff', accent: 'linear-gradient(90deg, #3b82f6, #06b6d4)' },
    in_transit: { label: 'In Transit', color: '#0891b2', bg: '#ecfeff', accent: 'linear-gradient(90deg, #06b6d4, #10b981)' },
    completed: { label: 'Completed', color: '#16a34a', bg: '#f0fdf4', accent: 'linear-gradient(90deg, #10b981, #22c55e)' },
    cancelled: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2', accent: 'linear-gradient(90deg, #ef4444, #f97316)' },
    postponed: { label: 'Postponed', color: '#ca8a04', bg: '#fefce8', accent: 'linear-gradient(90deg, #f59e0b, #eab308)' },
};

const LEAVE_STATUS_CONFIG = {
    approved: { color: '#16a34a', bg: '#f0fdf4' },
    rejected: { color: '#dc2626', bg: '#fef2f2' },
    pending: { color: '#ca8a04', bg: '#fefce8' },
};

// ─── Premium Animations & Styles ───────────────────────────────────
const globalStyles = `
  @keyframes fadeInUp {
    from { transform: translateY(30px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideDown {
    from { transform: translateY(-100%); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.4; }
    50%      { opacity: 0.7; }
  }
  
  * { -webkit-tap-highlight-color: transparent; }
  
  .fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
  .spin { animation: spin 1s linear infinite; }
  .toast-slide { animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
  
  .premium-card {
    background: #ffffff;
    border-radius: 20px;
    position: relative;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    /* Multi-layered shadow for depth */
    box-shadow: 
      0 4px 6px -1px rgba(0, 0, 0, 0.05),
      0 20px 50px -12px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  .premium-card:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 10px 15px -3px rgba(0, 0, 0, 0.05),
      0 30px 60px -15px rgba(0, 0, 0, 0.7),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }
`;

// ─── Reusable Components ───────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { label: 'UNKNOWN', color: '#666', bg: '#f3f4f6' };
    return (
        <span
            style={{
                background: cfg.bg,
                color: cfg.color,
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
            }}
        >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.color }} />
            {cfg.label}
        </span>
    );
};

const LeaveStatusBadge = ({ status }) => {
    const s = (status || 'pending').toLowerCase();
    const cfg = LEAVE_STATUS_CONFIG[s] || LEAVE_STATUS_CONFIG.pending;
    return (
        <span
            style={{
                background: cfg.bg,
                color: cfg.color,
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.68rem',
                fontWeight: 700,
            }}
        >
            {s.toUpperCase()}
        </span>
    );
};

const Toast = ({ type, message }) => {
    if (!message) return null;
    const isError = type === 'error';
    return (
        <div
            className="toast-slide"
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
                padding: '16px 24px',
                background: '#ffffff',
                borderBottom: `2px solid ${isError ? '#fecaca' : '#bbf7d0'}`,
                color: isError ? '#dc2626' : '#16a34a',
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
        >
            {isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            {message}
        </div>
    );
};

const StatCard = ({ value, label, color, icon: Icon }) => (
    <div
        className="premium-card"
        style={{
            flex: 1,
            padding: '24px 16px',
            textAlign: 'center',
            cursor: 'default',
            overflow: 'hidden'
        }}
    >
        {/* Subtle Top Gradient Line */}
        <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%', height: '3px',
            background: color, borderRadius: '0 0 4px 4px', opacity: 0.8
        }} />

        <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: `${color}15`, color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px'
        }}>
            <Icon size={20} />
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '6px' }}>{value}</div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {label}
        </div>
    </div>
);

// ─── Main Booking Card ─────────────────────────────────────────────
const BookingCard = ({ booking, onStatusChange }) => {
    const b = booking;
    const cfg = STATUS_CONFIG[b.status] || {};

    return (
        <div className="premium-card" style={{ padding: '0', marginBottom: '20px', overflow: 'hidden' }}>
            {/* Premium Left Accent Border */}
            <div style={{
                position: 'absolute', top: '20px', bottom: '20px', left: 0, width: '4px',
                background: cfg.accent || '#cbd5e1',
                borderRadius: '0 4px 4px 0'
            }} />

            <div style={{ padding: '24px 24px 24px 28px' }}>
                {/* Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <div style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.02em' }}>
                            {genId(b.booking_id)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>{fmtDate(b.created_at)}</div>
                    </div>
                    <StatusBadge status={b.status} />
                </div>

                {/* Client Info */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#020617', marginBottom: '8px' }}>
                        {b.client_name}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Phone size={15} style={{ color: '#cbd5e1' }} />
                        {b.client_phone}
                    </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '28px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destination</span>
                        <div style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} style={{ color: '#3b82f6', flexShrink: 0 }} /> {b.destination}
                        </div>
                    </div>
                    <div style={{ width: '1px', background: '#e2e8f0' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle</span>
                        <div style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Truck size={14} style={{ color: "#3b82f6", flexShrink: 0 }} /> {b.plate_number || b.number_plate || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    {b.status === 'booked' && (
                        <button
                            onClick={() => onStatusChange(b.booking_id, 'in_transit')}
                            style={{
                                flex: 1, padding: '16px', border: 'none', borderRadius: '14px', cursor: 'pointer',
                                background: '#0f172a',
                                color: '#ffffff', fontWeight: 700, fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Zap size={18} /> Accept Trip
                        </button>
                    )}
                    {b.status === 'in_transit' && (
                        <button
                            onClick={() => onStatusChange(b.booking_id, 'completed')}
                            style={{
                                flex: 1, padding: '16px', border: 'none', borderRadius: '14px', cursor: 'pointer',
                                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                color: '#ffffff', fontWeight: 700, fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.4)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <CheckCircle size={18} /> Mark Completed
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Leaves Section ────────────────────────────────────────────────
const LeaveCard = ({ leave }) => (
    <div className="premium-card" style={{ padding: '20px 24px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '6px' }}>
                {leave.leave_type || 'Leave'}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} />
                {leave.start_date ? new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                {' — '}
                {leave.end_date ? new Date(leave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
            </div>
        </div>
        <LeaveStatusBadge status={leave.status} />
    </div>
);

const LeaveSection = ({ leaves, loading }) => {
    if (loading) return (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <Loader2 size={32} className="spin" style={{ marginBottom: '16px' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Loading leaves...</div>
        </div>
    );
    if (leaves.length === 0) return (
        <div className="premium-card" style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed #e2e8f0' }}>
            <Calendar size={40} style={{ marginBottom: '16px', color: '#cbd5e1', display: 'inline-block' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>No leave applications</div>
            <div style={{ fontSize: '0.88rem', marginTop: '6px', color: '#94a3b8' }}>Your requests will appear here</div>
        </div>
    );
    return <div>{leaves.map(l => <LeaveCard key={l.id || l.leave_id} leave={l} />)}</div>;
};


// ─── MAIN DRIVER PORTAL ────────────────────────────────────────────
const DriverPortal = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [loadingLeaves, setLoadingLeaves] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('bookings');
    const [refreshing, setRefreshing] = useState(false);

    const slug = getTenantSlug();
    const user = getUser();

    const loadBookings = useCallback(async (silent = false) => {
        if (silent) setRefreshing(true); else setLoadingBookings(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/hearse-bookings?t=${Date.now()}`, { headers: getAuthHeaders() });
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                if (data.status === 'success' || data.bookings) setBookings(data.bookings || []);
                else setError(data.message || 'Failed to load bookings');
            } catch { setError('Invalid response from server'); }
        } catch (err) { setError(err.message || 'Network error'); }
        finally { setLoadingBookings(false); setRefreshing(false); }
    }, []);

    const loadLeaves = useCallback(async () => {
        setLoadingLeaves(true);
        try {
            const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
            const res = await fetch(`${API_BASE_URL}/leaves/my-leaves`, { headers });
            const data = await res.json();
            setLeaves(data?.leaves || data?.data || []);
        } catch { setLeaves([]); }
        finally { setLoadingLeaves(false); }
    }, []);

    useEffect(() => {
        if (!slug || slug === 'default') { setError('No tenant configured. Please log in again.'); return; }
        loadBookings();
        loadLeaves();
    }, [slug, loadBookings, loadLeaves]);

    const handleStatusChange = async (bookingId, status) => {
        try {
            const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
            const res = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/status`, { method: 'PUT', headers, body: JSON.stringify({ status }) });
            if (!res.ok) throw new Error('Update failed');
            setSuccess(`Trip marked as ${STATUS_CONFIG[status]?.label || status}`);
            setTimeout(() => setSuccess(''), 3000);
            loadBookings(true);
        } catch { setError('Failed to update status.'); setTimeout(() => setError(''), 4000); }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken'); localStorage.removeItem('user');
        localStorage.removeItem('tenantSlug'); localStorage.removeItem('refreshToken');
        sessionStorage.clear(); navigate('/login');
    };

    const activeBookings = bookings.filter(b => !['completed', 'cancelled', 'postponed'].includes(b.status));
    const inTransitCount = bookings.filter(b => b.status === 'in_transit').length;
    const completedCount = bookings.filter(b => b.status === 'completed').length;

    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'DR';

    return (
        <div style={{
            minHeight: '100vh',
            background: '#050507', // Rich deep black
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <style>{globalStyles}</style>

            {/* ═══════ AMBIENT BACKGROUND LIGHTING ═══════ */}
            <div style={{
                position: 'fixed', top: '-20%', right: '-15%', width: '700px', height: '700px',
                borderRadius: '50%', background: 'rgba(59, 130, 246, 0.04)',
                filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0,
                animation: 'pulse-glow 8s ease-in-out infinite'
            }} />
            <div style={{
                position: 'fixed', bottom: '-20%', left: '-15%', width: '600px', height: '600px',
                borderRadius: '50%', background: 'rgba(16, 185, 129, 0.03)',
                filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0,
                animation: 'pulse-glow 10s ease-in-out infinite 2s'
            }} />

            <Toast type="error" message={error} />
            <Toast type="success" message={success} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* ═══════ FROSTED GLASS HEADER ═══════ */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 50,
                    background: 'rgba(5, 5, 7, 0.6)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)'
                            }}>
                                <Car size={22} color="#fff" />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>DriverHub</div>
                                <div style={{ fontSize: '0.6rem', color: '#555', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{slug}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button onClick={() => loadBookings(true)} disabled={refreshing} style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                                <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
                            </button>

                            <button onClick={handleLogout} style={{
                                padding: '9px 18px', borderRadius: '12px',
                                background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)',
                                color: '#f87171', fontSize: '0.82rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s'
                            }}>
                                <LogOut size={15} /> Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px 80px' }}>

                    {/* ═══════ WELCOME SECTION ═══════ */}
                    <div className="fade-in-up" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                {getGreeting()}
                            </div>
                            <h1 style={{ margin: 0, fontSize: '2.4rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', color: '#ffffff' }}>
                                {user?.name || 'Driver'}
                            </h1>
                            <p style={{ margin: '10px 0 0', fontSize: '0.92rem', color: '#475569', fontWeight: 500 }}>
                                You have <span style={{ color: '#3b82f6', fontWeight: 700 }}>{activeBookings.length} active trip{activeBookings.length !== 1 ? 's' : ''}</span> today
                            </p>
                        </div>

                        {/* Premium Avatar */}
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '18px',
                                background: '#ffffff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#0f172a', fontSize: '1.1rem', fontWeight: 800,
                                boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                                border: '2px solid rgba(255,255,255,0.1)'
                            }}>
                                {initials}
                            </div>
                            <div style={{
                                position: 'absolute', bottom: '-2px', right: '-2px',
                                width: '18px', height: '18px', borderRadius: '50%',
                                background: '#10b981', border: '3px solid #050507',
                                boxShadow: '0 0 12px rgba(16, 185, 129, 0.5)'
                            }} />
                        </div>
                    </div>

                    {/* ═══════ STATS GRID ═══════ */}
                    <div className="fade-in-up" style={{ display: 'flex', gap: '14px', marginBottom: '36px', animationDelay: '0.1s' }}>
                        <StatCard value={activeBookings.length} label="Active" color="#3b82f6" icon={Zap} />
                        <StatCard value={inTransitCount} label="Transit" color="#06b6d4" icon={CircleDot} />
                        <StatCard value={completedCount} label="Done" color="#10b981" icon={CheckCircle} />
                    </div>

                    {/* ═══════ PREMIUM TABS ═══════ */}
                    <div className="fade-in-up" style={{
                        display: 'flex', gap: '6px', marginBottom: '28px',
                        padding: '5px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        animationDelay: '0.15s'
                    }}>
                        {[
                            { key: 'bookings', label: 'Active Bookings', count: activeBookings.length },
                            { key: 'leaves', label: 'My Leaves', count: leaves.length }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    flex: 1, padding: '14px', border: 'none', borderRadius: '12px',
                                    background: activeTab === tab.key ? '#ffffff' : 'transparent',
                                    color: activeTab === tab.key ? '#0f172a' : '#555555',
                                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: activeTab === tab.key ? '0 8px 24px rgba(0, 0, 0, 0.3)' : 'none'
                                }}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span style={{
                                        fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: '8px',
                                        background: activeTab === tab.key ? '#f1f5f9' : 'rgba(255,255,255,0.05)',
                                        color: activeTab === tab.key ? '#3b82f6' : '#666666'
                                    }}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ═══════ CONTENT AREA ═══════ */}
                    <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {activeTab === 'bookings' ? (
                            loadingBookings ? (
                                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#475569' }}>
                                    <Loader2 size={36} className="spin" style={{ marginBottom: '16px', color: '#333' }} />
                                    <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>Syncing bookings...</div>
                                </div>
                            ) : activeBookings.length === 0 ? (
                                <div className="premium-card" style={{ textAlign: 'center', padding: '80px 20px', border: '2px dashed #e2e8f0' }}>
                                    <div style={{
                                        width: '70px', height: '70px', borderRadius: '50%',
                                        background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 20px'
                                    }}>
                                        <Car size={32} style={{ color: '#cbd5e1' }} />
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>All Clear</div>
                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>No active trips right now</div>
                                </div>
                            ) : (
                                activeBookings.map((b, i) => (
                                    <div key={b.booking_id} className="fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                                        <BookingCard booking={b} onStatusChange={handleStatusChange} />
                                    </div>
                                ))
                            )
                        ) : (
                            <LeaveSection leaves={leaves} loading={loadingLeaves} />
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
};

export default DriverPortal;