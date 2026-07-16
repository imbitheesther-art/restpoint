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
    booked: { label: 'Booked', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', accent: 'linear-gradient(90deg, #ef4444, #f97316)', dotGlow: 'rgba(248,113,113,0.5)' },
    in_transit: { label: 'In Transit', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)', accent: 'linear-gradient(90deg, #22c55e, #10b981)', dotGlow: 'rgba(74,222,128,0.5)' },
    completed: { label: 'Completed', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)', accent: 'linear-gradient(90deg, #10b981, #14b8a6)', dotGlow: 'rgba(52,211,153,0.5)' },
    cancelled: { label: 'Cancelled', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)', accent: 'linear-gradient(90deg, #f97316, #eab308)', dotGlow: 'rgba(251,146,60,0.5)' },
    postponed: { label: 'Postponed', color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.25)', accent: 'linear-gradient(90deg, #eab308, #f59e0b)', dotGlow: 'rgba(250,204,21,0.5)' },
};

const LEAVE_STATUS_CONFIG = {
    approved: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.2)' },
    rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
    pending: { color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.2)' },
};

// ─── Premium Animations & Styles ───────────────────────────────────
const globalStyles = `
  @keyframes fadeInUp {
    from { transform: translateY(24px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes toastIn {
    0%   { transform: translateY(-100%); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes toastOut {
    0%   { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-100%); opacity: 0; }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50%      { opacity: 0.6; transform: scale(1.05); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes dotPulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.4; }
  }
  
  * { -webkit-tap-highlight-color: transparent; }
  *::-webkit-scrollbar { width: 6px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
  
  .fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
  .spin { animation: spin 1s linear infinite; }
  .toast-in { animation: toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .toast-out { animation: toastOut 0.3s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
  .dot-pulse { animation: dotPulse 1.5s ease-in-out infinite; }
  
  .glass-card {
    background: linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    position: relative;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .glass-card:hover {
    border-color: rgba(255,255,255,0.1);
    transform: translateY(-2px);
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.5);
  }
`;

// ─── Reusable Components ───────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { label: 'UNKNOWN', color: '#666', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', dotGlow: 'rgba(255,255,255,0.3)' };
    return (
        <span
            style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.color,
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textTransform: 'uppercase',
            }}
        >
            <span className="dot-pulse" style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: cfg.color,
                boxShadow: `0 0 8px ${cfg.dotGlow}`
            }} />
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
                border: `1px solid ${cfg.border}`,
                color: cfg.color,
                padding: '5px 12px',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
            }}
        >
            {s}
        </span>
    );
};

const Toast = ({ type, message, onClose }) => {
    if (!message) return null;
    const isError = type === 'error';
    const color = isError ? '#f87171' : '#4ade80';
    const bgColor = isError ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)';
    const borderColor = isError ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)';

    // Auto-dismiss
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (onClose) onClose();
        }, 3200);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    return (
        <div
            className="toast-in"
            style={{
                position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
                padding: '14px 24px',
                background: 'rgba(10, 10, 12, 0.85)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: `1px solid ${borderColor}`,
                borderRadius: '16px',
                color: color,
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'center',
                boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${isError ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)'}`,
                maxWidth: '90vw',
                whiteSpace: 'nowrap',
            }}
        >
            {isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            {message}
        </div>
    );
};

const StatCard = ({ value, label, color, icon: Icon }) => (
    <div
        className="glass-card"
        style={{
            flex: 1,
            padding: '22px 14px',
            textAlign: 'center',
            cursor: 'default',
            overflow: 'hidden',
        }}
    >
        <div style={{
            position: 'absolute', top: 0, left: '25%', right: '25%', height: '2px',
            background: color, borderRadius: '0 0 2px 2px', opacity: 0.7
        }} />
        <div style={{
            width: '42px', height: '42px', borderRadius: '14px',
            background: `${color}12`,
            border: `1px solid ${color}20`,
            color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
        }}>
            <Icon size={20} />
        </div>
        <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1, marginBottom: '8px', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
        <div style={{ fontSize: '0.68rem', color: '#52525b', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {label}
        </div>
    </div>
);

// ─── Main Booking Card ─────────────────────────────────────────────
const BookingCard = ({ booking, onStatusChange }) => {
    const b = booking;
    const cfg = STATUS_CONFIG[b.status] || {};

    return (
        <div className="glass-card" style={{ padding: '0', marginBottom: '18px', overflow: 'hidden' }}>
            {/* Left Accent Bar */}
            <div style={{
                position: 'absolute', top: '16px', bottom: '16px', left: 0, width: '3px',
                background: cfg.accent || 'rgba(255,255,255,0.1)',
                borderRadius: '0 3px 3px 0',
            }} />

            <div style={{ padding: '24px 24px 24px 26px' }}>
                {/* Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                    <div>
                        <div style={{
                            color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 800,
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            letterSpacing: '0.02em'
                        }}>
                            {genId(b.booking_id)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '5px', fontWeight: 500 }}>
                            {fmtDate(b.created_at)}
                        </div>
                    </div>
                    <StatusBadge status={b.status} />
                </div>

                {/* Client Info */}
                <div style={{ marginBottom: '22px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#fafafa', marginBottom: '10px' }}>
                        {b.client_name}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Phone size={15} style={{ color: '#52525b' }} />
                        {b.client_phone}
                    </div>
                </div>

                {/* Details Grid */}
                <div style={{
                    display: 'flex', gap: '16px', marginBottom: '26px',
                    padding: '16px 18px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '14px',
                }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Destination</span>
                        <div style={{ fontSize: '0.88rem', color: '#d4d4d8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <MapPin size={14} style={{ color: '#f87171', flexShrink: 0 }} /> {b.destination}
                        </div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Vehicle</span>
                        <div style={{ fontSize: '0.88rem', color: '#d4d4d8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <Truck size={14} style={{ color: '#4ade80', flexShrink: 0 }} /> {b.plate_number || b.number_plate || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    {b.status === 'booked' && (
                        <button
                            onClick={() => onStatusChange(b.booking_id, 'in_transit')}
                            style={{
                                flex: 1, padding: '15px', border: 'none', borderRadius: '14px', cursor: 'pointer',
                                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                color: '#ffffff', fontWeight: 700, fontSize: '0.88rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                boxShadow: '0 8px 24px -4px rgba(220, 38, 38, 0.35)',
                                transition: 'all 0.2s ease',
                                letterSpacing: '0.01em',
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
                                flex: 1, padding: '15px', border: 'none', borderRadius: '14px', cursor: 'pointer',
                                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                color: '#ffffff', fontWeight: 700, fontSize: '0.88rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                boxShadow: '0 8px 24px -4px rgba(22, 163, 74, 0.35)',
                                transition: 'all 0.2s ease',
                                letterSpacing: '0.01em',
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
    <div className="glass-card" style={{
        padding: '20px 22px', marginBottom: '12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
        <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9', marginBottom: '7px' }}>
                {leave.leave_type || 'Leave'}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#52525b', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
    const navigate = useNavigate();
    const slug = getTenantSlug();

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '70px 20px', color: '#52525b' }}>
            <Loader2 size={32} className="spin" style={{ marginBottom: '16px' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Loading leaves...</div>
        </div>
    );
    if (leaves.length === 0) return (
        <div className="glass-card" style={{ textAlign: 'center', padding: '70px 20px', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px'
            }}>
                <Calendar size={28} style={{ color: '#3f3f46' }} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#a1a1aa', marginBottom: '16px' }}>No leave applications</div>
            <button
                onClick={() => navigate(`/tenant/${slug}/leaves/apply`)}
                style={{
                    padding: '13px 28px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px -4px rgba(220,38,38,0.35)',
                    transition: 'all 0.2s ease',
                }}
            >
                Apply for Leave
            </button>
        </div>
    );
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button
                    onClick={() => navigate(`/tenant/${slug}/leaves/apply`)}
                    style={{
                        padding: '11px 20px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                        color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 6px 18px -4px rgba(220,38,38,0.3)',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <Calendar size={15} /> Apply Leave
                </button>
            </div>
            {leaves.map((l, i) => (
                <div key={l.id || i} className="fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                    <LeaveCard leave={l} />
                </div>
            ))}
        </div>
    );
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
            setTimeout(() => setSuccess(''), 3200);
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
            background: '#09090b',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <style>{globalStyles}</style>

            {/* ═══════ AMBIENT BACKGROUND ═══════ */}
            <div style={{
                position: 'fixed', top: '-30%', right: '-20%', width: '800px', height: '800px',
                borderRadius: '50%', background: 'rgba(220, 38, 38, 0.04)',
                filter: 'blur(140px)', pointerEvents: 'none', zIndex: 0,
                animation: 'pulseGlow 10s ease-in-out infinite'
            }} />
            <div style={{
                position: 'fixed', bottom: '-25%', left: '-20%', width: '700px', height: '700px',
                borderRadius: '50%', background: 'rgba(22, 163, 74, 0.03)',
                filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0,
                animation: 'pulseGlow 12s ease-in-out infinite 3s'
            }} />
            <div style={{
                position: 'fixed', top: '40%', left: '50%', width: '500px', height: '500px',
                borderRadius: '50%', background: 'rgba(250, 204, 21, 0.015)',
                filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0,
                transform: 'translate(-50%, -50%)',
                animation: 'pulseGlow 14s ease-in-out infinite 5s'
            }} />

            {/* Toast — centered pill, auto-dismisses */}
            <Toast type="error" message={error} onClose={() => setError('')} />
            <Toast type="success" message={success} onClose={() => setSuccess('')} />

            <div style={{ position: 'relative', zIndex: 1 }}>

                {/* ═══════ HEADER ═══════ */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 50,
                    background: 'rgba(9, 9, 11, 0.7)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                }}>
                    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 6px 20px -2px rgba(220, 38, 38, 0.4)',
                            }}>
                                <Car size={22} color="#fff" />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fafafa', letterSpacing: '-0.02em' }}>DriverHub</div>
                                <div style={{ fontSize: '0.58rem', color: '#3f3f46', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{slug}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button onClick={() => loadBookings(true)} disabled={refreshing} style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                color: '#52525b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}>
                                <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
                            </button>

                            <button onClick={handleLogout} style={{
                                padding: '9px 18px', borderRadius: '12px',
                                background: 'rgba(248,113,113,0.06)',
                                border: '1px solid rgba(248,113,113,0.15)',
                                color: '#f87171', fontSize: '0.8rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', gap: '8px',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}>
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main style={{ maxWidth: '640px', margin: '0 auto', padding: '36px 24px 80px' }}>

                    {/* ═══════ WELCOME ═══════ */}
                    <div className="fade-in-up" style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div style={{
                                fontSize: '0.78rem', color: '#52525b', fontWeight: 700,
                                marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.14em',
                            }}>
                                {getGreeting()}
                            </div>
                            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', color: '#fafafa' }}>
                                {user?.name || 'Driver'}
                            </h1>
                            <p style={{ margin: '12px 0 0', fontSize: '0.9rem', color: '#52525b', fontWeight: 500 }}>
                                You have <span style={{ color: '#f87171', fontWeight: 700 }}>{activeBookings.length} active trip{activeBookings.length !== 1 ? 's' : ''}</span> today
                            </p>
                        </div>

                        {/* Avatar */}
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '58px', height: '58px', borderRadius: '18px',
                                background: 'linear-gradient(135deg, #dc2626, #16a34a)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#ffffff', fontSize: '1.05rem', fontWeight: 800,
                                boxShadow: '0 12px 30px -4px rgba(0,0,0,0.5)',
                                border: '2px solid rgba(255,255,255,0.06)',
                            }}>
                                {initials}
                            </div>
                            <div style={{
                                position: 'absolute', bottom: '-2px', right: '-2px',
                                width: '18px', height: '18px', borderRadius: '50%',
                                background: '#4ade80', border: '3px solid #09090b',
                                boxShadow: '0 0 12px rgba(74, 222, 128, 0.5)',
                            }} />
                        </div>
                    </div>

                    {/* ═══════ STATS ═══════ */}
                    <div className="fade-in-up" style={{ display: 'flex', gap: '12px', marginBottom: '36px', animationDelay: '0.08s' }}>
                        <StatCard value={activeBookings.length} label="Active" color="#f87171" icon={Zap} />
                        <StatCard value={inTransitCount} label="Transit" color="#4ade80" icon={CircleDot} />
                        <StatCard value={completedCount} label="Done" color="#34d399" icon={CheckCircle} />
                    </div>

                    {/* ═══════ TABS ═══════ */}
                    <div className="fade-in-up" style={{
                        display: 'flex', gap: '4px', marginBottom: '28px',
                        padding: '4px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        animationDelay: '0.12s',
                    }}>
                        {[
                            { key: 'bookings', label: 'Active Bookings', count: activeBookings.length },
                            { key: 'leaves', label: 'My Leaves', count: leaves.length },
                        ].map(tab => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        flex: 1, padding: '13px', border: 'none', borderRadius: '13px',
                                        background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                                        color: isActive ? '#f1f5f9' : '#3f3f46',
                                        fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: isActive ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                                    }}
                                >
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span style={{
                                            fontSize: '0.68rem', fontWeight: 800, padding: '3px 9px', borderRadius: '8px',
                                            background: isActive ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                                            color: isActive ? (tab.key === 'bookings' ? '#f87171' : '#4ade80') : '#3f3f46',
                                        }}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* ═══════ CONTENT ═══════ */}
                    <div className="fade-in-up" style={{ animationDelay: '0.16s' }}>
                        {activeTab === 'bookings' ? (
                            loadingBookings ? (
                                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#3f3f46' }}>
                                    <Loader2 size={36} className="spin" style={{ marginBottom: '18px' }} />
                                    <div style={{ fontSize: '0.92rem', fontWeight: 500 }}>Syncing bookings...</div>
                                </div>
                            ) : activeBookings.length === 0 ? (
                                <div className="glass-card" style={{ textAlign: 'center', padding: '80px 20px', border: '1px dashed rgba(255,255,255,0.06)' }}>
                                    <div style={{
                                        width: '68px', height: '68px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 22px',
                                    }}>
                                        <Car size={30} style={{ color: '#27272a' }} />
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#71717a', marginBottom: '8px' }}>All Clear</div>
                                    <div style={{ fontSize: '0.88rem', color: '#3f3f46' }}>No active trips right now</div>
                                </div>
                            ) : (
                                activeBookings.map((b, i) => (
                                    <div key={b.booking_id} className="fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
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