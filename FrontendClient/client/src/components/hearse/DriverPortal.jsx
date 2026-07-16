import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    CircleDot,
    Navigation,
    ChevronRight,
    Star,
    Activity,
    Shield,
    Award,
    Gauge,
    Fuel,
    Wind,
    User,
    Bell,
    Settings,
    Search,
    Eye,
    MoreHorizontal,
    ArrowRight,
    Target,
    Compass,
    Route
} from 'lucide-react';
import env from '../../config/env';

const API_BASE_URL = env.FULL_API_URL;

// ─── Utility ─────────────────────────────────────────────────────
const getTenantSlug = () =>
    localStorage.getItem('tenantSlug') || sessionStorage.getItem('tenantSlug') || '';

const getUser = () => {
    try {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : {};
    } catch { return {}; }
};

const fmtTime = (d) =>
    d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--';

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';

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

// ─── Premium Status Config ────────────────────────────────────────
const STATUS = {
    booked: {
        label: 'Booked', icon: Clock, color: '#f87171',
        gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
        glow: 'rgba(248,113,113,0.35)', bg: 'rgba(248,113,113,0.08)',
        border: 'rgba(248,113,113,0.2)',
        dotBg: 'rgba(248,113,113,0.15)',
    },
    in_transit: {
        label: 'In Transit', icon: Navigation, color: '#4ade80',
        gradient: 'linear-gradient(135deg, #22c55e, #10b981)',
        glow: 'rgba(74,222,128,0.35)', bg: 'rgba(74,222,128,0.08)',
        border: 'rgba(74,222,128,0.2)',
        dotBg: 'rgba(74,222,128,0.15)',
    },
    completed: {
        label: 'Completed', icon: CheckCircle, color: '#34d399',
        gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
        glow: 'rgba(52,211,153,0.35)', bg: 'rgba(52,211,153,0.08)',
        border: 'rgba(52,211,153,0.2)',
        dotBg: 'rgba(52,211,153,0.15)',
    },
    cancelled: {
        label: 'Cancelled', icon: AlertCircle, color: '#fb923c',
        gradient: 'linear-gradient(135deg, #f97316, #eab308)',
        glow: 'rgba(251,146,60,0.35)', bg: 'rgba(251,146,60,0.08)',
        border: 'rgba(251,146,60,0.2)',
        dotBg: 'rgba(251,146,60,0.15)',
    },
    postponed: {
        label: 'Postponed', icon: Clock, color: '#facc15',
        gradient: 'linear-gradient(135deg, #eab308, #f59e0b)',
        glow: 'rgba(250,204,21,0.35)', bg: 'rgba(250,204,21,0.08)',
        border: 'rgba(250,204,21,0.2)',
        dotBg: 'rgba(250,204,21,0.15)',
    },
};

const LEAVE_STATUS = {
    approved: { color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', icon: CheckCircle },
    rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', icon: AlertCircle },
    pending: { color: '#facc15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.2)', icon: Clock },
};

// ─── Global Premium Styles ─────────────────────────────────────────
const globalStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }
  @keyframes floatSlow {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(1deg); }
    66% { transform: translateY(5px) rotate(-1deg); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.15; transform: scale(1); }
    50% { opacity: 0.3; transform: scale(1.02); }
  }
  @keyframes pulseDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.3; transform: scale(0.85); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0% { background-position: -300% 0; }
    100% { background-position: 300% 0; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes toastIn {
    0% { transform: translateY(-20px) scale(0.95); opacity: 0; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  @keyframes toastOut {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-20px) scale(0.95); opacity: 0; }
  }
  @keyframes breathe {
    0%, 100% { box-shadow: 0 0 20px rgba(248,113,113,0.15); }
    50% { box-shadow: 0 0 40px rgba(248,113,113,0.3); }
  }
  @keyframes routeDash {
    to { stroke-dashoffset: -24; }
  }
  @keyframes borderGlow {
    0%, 100% { border-color: rgba(255,255,255,0.06); }
    50% { border-color: rgba(255,255,255,0.12); }
  }

  * { -webkit-tap-highlight-color: transparent; }
  *::-webkit-scrollbar { width: 4px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 2px; }
  *::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }

  .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
  .slide-down { animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .scale-in { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .spin { animation: spin 1s linear infinite; }
  .toast-in { animation: toastIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .toast-out { animation: toastOut 0.3s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
  .pulse-dot { animation: pulseDot 1.8s ease-in-out infinite; }
  .breathe { animation: breathe 3s ease-in-out infinite; }

  .glass {
    background: linear-gradient(165deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.06);
  }
  .glass-strong {
    background: linear-gradient(165deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
    backdrop-filter: blur(32px) saturate(200%);
    -webkit-backdrop-filter: blur(32px) saturate(200%);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .card-hover {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .card-hover:hover {
    transform: translateY(-3px);
    border-color: rgba(255,255,255,0.12);
    box-shadow: 0 24px 60px -16px rgba(0,0,0,0.6);
  }
  .btn-press:active {
    transform: scale(0.96) !important;
  }
`;

// ─── Reusable Components ──────────────────────────────────────────

// Premium Status Badge with animated dot
const StatusBadge = ({ status, size = 'md' }) => {
    const cfg = STATUS[status] || {
        label: status || 'Unknown', color: '#71717a',
        gradient: 'linear-gradient(135deg, #52525b, #3f3f46)',
        glow: 'rgba(113,113,122,0.3)', bg: 'rgba(113,113,122,0.08)',
        border: 'rgba(113,113,122,0.2)', dotBg: 'rgba(113,113,122,0.15)',
    };
    const Icon = cfg.icon;
    const isLarge = size === 'lg';

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: isLarge ? '10px' : '7px',
            padding: isLarge ? '8px 18px' : '5px 12px',
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            borderRadius: '100px',
            color: cfg.color,
            fontSize: isLarge ? '0.82rem' : '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <span style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: '7px',
            }}>
                <span style={{
                    width: isLarge ? '8px' : '6px', height: isLarge ? '8px' : '6px',
                    borderRadius: '50%',
                    background: cfg.color,
                    boxShadow: `0 0 12px ${cfg.glow}`,
                    animation: status === 'in_transit' ? 'pulseDot 0.8s ease-in-out infinite' : 'pulseDot 2s ease-in-out infinite',
                }} />
                {cfg.label}
            </span>
        </span>
    );
};

// Toast Notifications
const Toast = ({ type, message, onClose }) => {
    if (!message) return null;
    const isError = type === 'error';
    const icon = isError ? AlertCircle : CheckCircle;
    const color = isError ? '#f87171' : '#4ade80';
    const borderColor = isError ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)';

    React.useEffect(() => {
        const timer = setTimeout(() => { if (onClose) onClose(); }, 3500);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    return (
        <div className="toast-in" style={{
            position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
            padding: '14px 28px',
            background: 'rgba(12, 12, 16, 0.92)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: `1px solid ${borderColor}`,
            borderRadius: '18px',
            color: color,
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center',
            boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 40px ${isError ? 'rgba(248,113,113,0.06)' : 'rgba(74,222,128,0.06)'}`,
            maxWidth: '88vw',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
        }}>
            {React.createElement(icon, { size: 20 })}
            {message}
        </div>
    );
};

// Stat Card with animated gradient bar
const StatCard = ({ value, label, color, icon: Icon, gradient }) => (
    <div className="glass card-hover" style={{
        flex: 1, padding: '24px 16px', textAlign: 'center', cursor: 'default',
        borderRadius: '20px', position: 'relative', overflow: 'hidden',
        minWidth: 0,
    }}>
        <div style={{
            position: 'absolute', top: 0, left: '15%', right: '15%', height: '2.5px',
            background: gradient || color,
            borderRadius: '0 0 3px 3px',
            opacity: 0.8,
        }} />
        <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: `${color}10`,
            border: `1px solid ${color}20`,
            color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            position: 'relative',
        }}>
            <Icon size={20} />
            {label === 'Active' && (
                <span style={{
                    position: 'absolute', top: '-2px', right: '-2px',
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 12px ${color}`,
                    animation: 'pulseDot 1.2s ease-in-out infinite',
                }} />
            )}
        </div>
        <div style={{
            fontSize: '2rem', fontWeight: 800, color: '#f1f5f9',
            lineHeight: 1, marginBottom: '8px',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.03em',
        }}>
            {value}
        </div>
        <div style={{
            fontSize: '0.65rem', color: '#52525b', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
            {label}
        </div>
    </div>
);

// Premium Booking Card with 3D feel
const BookingCard = ({ booking, onStatusChange, index }) => {
    const b = booking;
    const cfg = STATUS[b.status] || {};

    return (
        <div className="glass card-hover" style={{
            borderRadius: '24px', marginBottom: '20px', overflow: 'hidden',
            position: 'relative', animationDelay: `${(index || 0) * 0.07}s`,
        }}>
            {/* Animated gradient border */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                background: cfg.gradient || 'rgba(255,255,255,0.1)',
                opacity: 0.9,
            }} />

            {/* Glow accent */}
            <div style={{
                position: 'absolute', top: '-80px', right: '-40px',
                width: '200px', height: '200px', borderRadius: '50%',
                background: `${cfg.color}04`,
                filter: 'blur(60px)',
                pointerEvents: 'none',
            }} />

            <div style={{ padding: '24px 24px 22px' }}>
                {/* Top Row - ID & Status */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '20px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '38px', height: '38px', borderRadius: '12px',
                            background: `${cfg.color}10`,
                            border: `1px solid ${cfg.border || 'rgba(255,255,255,0.05)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: cfg.color || '#52525b',
                        }}>
                            {React.createElement(Truck, { size: 18 })}
                        </div>
                        <div>
                            <div style={{
                                color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 800,
                                fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                                letterSpacing: '0.02em',
                            }}>
                                {genId(b.booking_id)}
                            </div>
                            <div style={{
                                fontSize: '0.7rem', color: '#52525b',
                                marginTop: '3px', fontWeight: 500,
                            }}>
                                {fmtDate(b.created_at)} · {fmtTime(b.created_at)}
                            </div>
                        </div>
                    </div>
                    <StatusBadge status={b.status} />
                </div>

                {/* Client */}
                <div style={{
                    marginBottom: '20px', padding: '16px 18px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '16px',
                }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fafafa', marginBottom: '8px' }}>
                        {b.client_name}
                    </div>
                    <div style={{
                        fontSize: '0.85rem', color: '#71717a',
                        display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                        <Phone size={13} style={{ color: '#3f3f46' }} />
                        {b.client_phone || 'No phone'}
                    </div>
                </div>

                {/* Route Visualization */}
                <div style={{
                    display: 'flex', gap: '16px', marginBottom: '24px',
                    padding: '16px 18px',
                    background: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    position: 'relative',
                }}>
                    {/* Route line */}
                    <div style={{
                        position: 'absolute', left: '29px', top: '38px', bottom: '38px', width: '2px',
                        background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 4px, transparent 4px, transparent 8px)',
                    }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: 'rgba(248,113,113,0.12)', border: '2px solid rgba(248,113,113,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, position: 'relative', zIndex: 1,
                            }}>
                                <MapPin size={13} style={{ color: '#f87171' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.65rem', color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Pickup</div>
                                <div style={{ fontSize: '0.88rem', color: '#d4d4d8', fontWeight: 600 }}>
                                    {b.from_location || b.destination || 'N/A'}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, position: 'relative', zIndex: 1,
                            }}>
                                <MapPin size={13} style={{ color: '#4ade80' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.65rem', color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Destination</div>
                                <div style={{ fontSize: '0.88rem', color: '#d4d4d8', fontWeight: 600 }}>
                                    {b.destination || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle info */}
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', padding: '0 8px',
                        borderLeft: '1px solid rgba(255,255,255,0.04)',
                        minWidth: '70px',
                    }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: `${cfg.color}12`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: cfg.color || '#52525b', marginBottom: '6px',
                        }}>
                            <Car size={17} />
                        </div>
                        <div style={{
                            fontSize: '0.68rem', fontWeight: 700, color: '#d4d4d8',
                            textAlign: 'center', lineHeight: 1.3,
                        }}>
                            {b.plate_number || b.number_plate || '—'}
                        </div>
                        {b.model && (
                            <div style={{ fontSize: '0.6rem', color: '#3f3f46', marginTop: '2px' }}>
                                {b.model}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    {b.status === 'booked' && (
                        <button
                            onClick={() => onStatusChange(b.booking_id, 'in_transit')}
                            className="btn-press"
                            style={{
                                flex: 1, padding: '16px', border: 'none', borderRadius: '16px',
                                cursor: 'pointer',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                                color: '#ffffff', fontWeight: 700, fontSize: '0.88rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                boxShadow: '0 8px 28px -4px rgba(220, 38, 38, 0.4)',
                                transition: 'all 0.25s ease',
                                letterSpacing: '0.01em',
                                position: 'relative', overflow: 'hidden',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 36px -6px rgba(220, 38, 38, 0.5)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 28px -4px rgba(220, 38, 38, 0.4)';
                            }}
                        >
                            <Zap size={20} />
                            Accept Trip
                            <ArrowRight size={16} style={{ opacity: 0.7 }} />
                        </button>
                    )}
                    {b.status === 'in_transit' && (
                        <button
                            onClick={() => onStatusChange(b.booking_id, 'completed')}
                            className="btn-press"
                            style={{
                                flex: 1, padding: '16px', border: 'none', borderRadius: '16px',
                                cursor: 'pointer',
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                                color: '#ffffff', fontWeight: 700, fontSize: '0.88rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                boxShadow: '0 8px 28px -4px rgba(22, 163, 74, 0.4)',
                                transition: 'all 0.25s ease',
                                letterSpacing: '0.01em',
                                position: 'relative', overflow: 'hidden',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 36px -6px rgba(22, 163, 74, 0.5)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 28px -4px rgba(22, 163, 74, 0.4)';
                            }}
                        >
                            <CheckCircle size={20} />
                            Complete Trip
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Leave Card
const LeaveCard = ({ leave }) => {
    const s = (leave.status || 'pending').toLowerCase();
    const cfg = LEAVE_STATUS[s] || LEAVE_STATUS.pending;

    return (
        <div className="glass card-hover" style={{
            borderRadius: '18px', padding: '18px 22px', marginBottom: '12px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: cfg.bg, border: `1px solid ${cfg.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cfg.color,
                }}>
                    {React.createElement(Calendar, { size: 18 })}
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9', marginBottom: '5px' }}>
                        {leave.leave_type || 'Leave'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#52525b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={13} />
                        {leave.start_date ? new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                        {' — '}
                        {leave.end_date ? new Date(leave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </div>
                </div>
            </div>
            <div style={{
                padding: '4px 14px', borderRadius: '100px',
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                color: cfg.color, fontSize: '0.68rem', fontWeight: 700,
                letterSpacing: '0.03em', textTransform: 'uppercase',
            }}>
                {s}
            </div>
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
            const res = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/status`, {
                method: 'PUT', headers,
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error('Update failed');
            setSuccess(`Trip ${STATUS[status]?.label || status}`);
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

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'DR';

    return (
        <div style={{
            minHeight: '100vh',
            background: '#07070a',
            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            position: 'relative',
            overflow: 'hidden',
            color: '#f1f5f9',
        }}>
            <style>{globalStyles}</style>

            {/* ═══ Premium Ambient Background ═══ */}
            <div style={{
                position: 'fixed', top: '-20%', right: '-15%',
                width: '900px', height: '900px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)',
                filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0,
                animation: 'pulseGlow 12s ease-in-out infinite',
            }} />
            <div style={{
                position: 'fixed', bottom: '-25%', left: '-15%',
                width: '800px', height: '800px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)',
                filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0,
                animation: 'pulseGlow 14s ease-in-out infinite 3s',
            }} />
            <div style={{
                position: 'fixed', top: '50%', left: '50%',
                width: '600px', height: '600px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(250,204,21,0.015) 0%, transparent 70%)',
                filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0,
                transform: 'translate(-50%, -50%)',
                animation: 'pulseGlow 16s ease-in-out infinite 6s',
            }} />

            {/* Grid overlay */}
            <div style={{
                position: 'fixed', inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
                pointerEvents: 'none', zIndex: 0,
                opacity: 0.4,
            }} />

            {/* Toast */}
            <Toast type="error" message={error} onClose={() => setError('')} />
            <Toast type="success" message={success} onClose={() => setSuccess('')} />

            <div style={{ position: 'relative', zIndex: 1 }}>

                {/* ═══════ PREMIUM HEADER ═══════ */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 50,
                    background: 'rgba(7, 7, 10, 0.8)',
                    backdropFilter: 'blur(50px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(50px) saturate(200%)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                }}>
                    <div style={{
                        maxWidth: '640px', margin: '0 auto',
                        padding: '16px 24px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 8px 24px -4px rgba(220, 38, 38, 0.4)',
                                position: 'relative',
                            }}>
                                <Car size={20} color="#fff" />
                                <span style={{
                                    position: 'absolute', top: '-3px', right: '-3px',
                                    width: '10px', height: '10px', borderRadius: '50%',
                                    background: '#4ade80',
                                    border: '2px solid #07070a',
                                    boxShadow: '0 0 16px rgba(74,222,128,0.5)',
                                }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fafafa', letterSpacing: '-0.02em' }}>
                                    DriverHub
                                </div>
                                <div style={{ fontSize: '0.55rem', color: '#3f3f46', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                                    {slug}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                                onClick={() => loadBookings(true)}
                                disabled={refreshing}
                                style={{
                                    width: '38px', height: '38px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    color: '#52525b', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            >
                                <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
                            </button>

                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '9px 18px', borderRadius: '12px',
                                    background: 'rgba(248,113,113,0.06)',
                                    border: '1px solid rgba(248,113,113,0.12)',
                                    color: '#f87171', fontSize: '0.78rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(248,113,113,0.06)';
                                    e.currentTarget.style.borderColor = 'rgba(248,113,113,0.12)';
                                }}
                            >
                                <LogOut size={14} />
                                Exit
                            </button>
                        </div>
                    </div>
                </header>

                <main style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 20px 100px' }}>

                    {/* ═══════ WELCOME SECTION ═══════ */}
                    <div className="slide-up" style={{ marginBottom: '32px' }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                        }}>
                            <div>
                                <div style={{
                                    fontSize: '0.72rem', color: '#52525b', fontWeight: 700,
                                    marginBottom: '10px', textTransform: 'uppercase',
                                    letterSpacing: '0.14em',
                                }}>
                                    {getGreeting()}
                                </div>
                                <h1 style={{
                                    margin: 0, fontSize: '2.2rem', fontWeight: 800,
                                    lineHeight: 1, letterSpacing: '-0.03em',
                                    color: '#fafafa',
                                }}>
                                    {user?.name || 'Driver'}
                                </h1>
                                <p style={{ margin: '12px 0 0', fontSize: '0.85rem', color: '#52525b', fontWeight: 500 }}>
                                    {activeBookings.length > 0 ? (
                                        <>You have <span style={{ color: '#f87171', fontWeight: 700 }}>{activeBookings.length} active trip{activeBookings.length !== 1 ? 's' : ''}</span></>
                                    ) : (
                                        <>No active trips — you're all clear</>
                                    )}
                                </p>
                            </div>

                            {/* Premium Avatar */}
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '18px',
                                    background: 'linear-gradient(135deg, #dc2626 0%, #16a34a 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#ffffff', fontSize: '1.1rem', fontWeight: 800,
                                    boxShadow: '0 16px 36px -8px rgba(0,0,0,0.6), 0 0 40px rgba(220,38,38,0.08)',
                                    border: '2px solid rgba(255,255,255,0.06)',
                                    position: 'relative',
                                }}>
                                    {initials}
                                </div>
                                <div style={{
                                    position: 'absolute', bottom: '-2px', right: '-2px',
                                    width: '20px', height: '20px', borderRadius: '50%',
                                    background: '#4ade80',
                                    border: '3px solid #07070a',
                                    boxShadow: '0 0 20px rgba(74, 222, 128, 0.5)',
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* ═══════ STATS ROW ═══════ */}
                    <div className="slide-up" style={{
                        display: 'flex', gap: '10px', marginBottom: '32px',
                        animationDelay: '0.08s',
                    }}>
                        <StatCard
                            value={activeBookings.length}
                            label="Active"
                            color="#f87171"
                            icon={Zap}
                            gradient="linear-gradient(135deg, #ef4444, #f97316)"
                        />
                        <StatCard
                            value={inTransitCount}
                            label="In Transit"
                            color="#4ade80"
                            icon={Navigation}
                            gradient="linear-gradient(135deg, #22c55e, #10b981)"
                        />
                        <StatCard
                            value={completedCount}
                            label="Completed"
                            color="#34d399"
                            icon={CheckCircle}
                            gradient="linear-gradient(135deg, #10b981, #14b8a6)"
                        />
                    </div>

                    {/* ═══════ PREMIUM TAB BAR ═══════ */}
                    <div className="slide-up" style={{
                        display: 'flex', gap: '4px', marginBottom: '24px',
                        padding: '4px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '18px',
                        border: '1px solid rgba(255,255,255,0.04)',
                        animationDelay: '0.12s',
                    }}>
                        {[
                            { key: 'bookings', label: 'Trips', icon: Route, count: activeBookings.length },
                            { key: 'leaves', label: 'Leaves', icon: Calendar, count: leaves.length },
                        ].map(tab => {
                            const isActive = activeTab === tab.key;
                            const Icon = tab.icon;
                            const tabColor = tab.key === 'bookings' ? '#f87171' : '#4ade80';
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        flex: 1, padding: '14px 10px', border: 'none', borderRadius: '15px',
                                        background: isActive
                                            ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
                                            : 'transparent',
                                        color: isActive ? '#f1f5f9' : '#3f3f46',
                                        fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: isActive ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                                        position: 'relative',
                                    }}
                                >
                                    <Icon size={15} style={{ color: isActive ? tabColor : undefined }} />
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span style={{
                                            fontSize: '0.62rem', fontWeight: 800,
                                            padding: '2px 8px', borderRadius: '8px',
                                            background: isActive ? `${tabColor}15` : 'rgba(255,255,255,0.03)',
                                            color: isActive ? tabColor : '#3f3f46',
                                        }}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* ═══════ CONTENT ═══════ */}
                    <div className="slide-up" style={{ animationDelay: '0.16s' }}>
                        {activeTab === 'bookings' ? (
                            loadingBookings ? (
                                <div style={{ textAlign: 'center', padding: '90px 20px', color: '#3f3f46' }}>
                                    <div style={{
                                        width: '56px', height: '56px', margin: '0 auto 22px',
                                        borderRadius: '18px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Loader2 size={28} className="spin" style={{ color: '#52525b' }} />
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#52525b' }}>
                                        Loading your trips...
                                    </div>
                                </div>
                            ) : activeBookings.length === 0 ? (
                                <div className="glass" style={{
                                    textAlign: 'center', padding: '80px 24px',
                                    borderRadius: '24px',
                                    border: '1px dashed rgba(255,255,255,0.05)',
                                }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.015)',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 24px',
                                    }}>
                                        <Car size={36} style={{ color: '#27272a' }} />
                                    </div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#71717a', marginBottom: '10px', letterSpacing: '-0.02em' }}>
                                        All Clear
                                    </div>
                                    <div style={{ fontSize: '0.88rem', color: '#3f3f46', fontWeight: 500 }}>
                                        No active trips right now. <br />You'll be notified when a new booking arrives.
                                    </div>
                                </div>
                            ) : (
                                activeBookings.map((b, i) => (
                                    <div key={b.booking_id} className="slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
                                        <BookingCard booking={b} onStatusChange={handleStatusChange} index={i} />
                                    </div>
                                ))
                            )
                        ) : (
                            loadingLeaves ? (
                                <div style={{ textAlign: 'center', padding: '90px 20px', color: '#3f3f46' }}>
                                    <div style={{
                                        width: '56px', height: '56px', margin: '0 auto 22px',
                                        borderRadius: '18px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Loader2 size={28} className="spin" style={{ color: '#52525b' }} />
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#52525b' }}>
                                        Loading leaves...
                                    </div>
                                </div>
                            ) : leaves.length === 0 ? (
                                <div className="glass" style={{
                                    textAlign: 'center', padding: '70px 24px',
                                    borderRadius: '24px',
                                    border: '1px dashed rgba(255,255,255,0.05)',
                                }}>
                                    <div style={{
                                        width: '68px', height: '68px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.015)',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 20px',
                                    }}>
                                        <Calendar size={30} style={{ color: '#27272a' }} />
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#71717a', marginBottom: '16px', letterSpacing: '-0.02em' }}>
                                        No Leaves
                                    </div>
                                    <button
                                        onClick={() => navigate(`/tenant/${slug}/leaves/apply`)}
                                        className="btn-press"
                                        style={{
                                            padding: '14px 32px', borderRadius: '16px',
                                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                            color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 8px 24px -4px rgba(220,38,38,0.35)',
                                            transition: 'all 0.25s ease',
                                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 12px 32px -6px rgba(220,38,38,0.45)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(220,38,38,0.35)';
                                        }}
                                    >
                                        <Calendar size={16} />
                                        Apply for Leave
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                                        <button
                                            onClick={() => navigate(`/tenant/${slug}/leaves/apply`)}
                                            className="btn-press"
                                            style={{
                                                padding: '12px 22px', borderRadius: '14px',
                                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                boxShadow: '0 6px 20px -4px rgba(220,38,38,0.3)',
                                                transition: 'all 0.25s ease',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <Calendar size={15} /> New Leave
                                        </button>
                                    </div>
                                    {leaves.map((l, i) => (
                                        <div key={l.id || i} className="slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                            <LeaveCard leave={l} />
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>

                    {/* ═══════ BOTTOM PADDING ═══════ */}
                    <div style={{ height: '40px' }} />

                </main>
            </div>
        </div>
    );
};

export default DriverPortal;