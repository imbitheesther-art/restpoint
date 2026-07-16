import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Car, RefreshCw, CheckCircle, Phone, MapPin, LogOut, Calendar,
    Clock, AlertCircle, Truck, Loader2, Zap, Navigation, ChevronRight,
    Route, Sun, Moon, CloudSun, User, ArrowRight, CircleDot, Shield
} from 'lucide-react';
import env from '../../config/env';

const API_BASE_URL = env.FULL_API_URL;

/* ─── Utility ─────────────────────────────────────────────────── */
const getTenantSlug = () =>
    localStorage.getItem('tenantSlug') || sessionStorage.getItem('tenantSlug') || '';

const getUser = () => {
    try { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : {}; }
    catch { return {}; }
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
    if (h < 12) return { text: 'Good Morning', icon: Sun, period: 'morning' };
    if (h < 17) return { text: 'Good Afternoon', icon: CloudSun, period: 'afternoon' };
    return { text: 'Good Evening', icon: Moon, period: 'evening' };
};

/* ─── Color System ────────────────────────────────────────────── */
const THEME = {
    bg: '#0f1117',
    bgCard: '#181a22',
    bgCardHover: '#1e2029',
    bgInput: '#12141b',
    border: 'rgba(255,255,255,0.06)',
    borderLight: 'rgba(255,255,255,0.04)',
    text: '#e8eaed',
    textSecondary: '#9aa0a6',
    textMuted: '#5f6368',
    accent: '#e8a838',
    accentLight: 'rgba(232,168,56,0.12)',
    accentBorder: 'rgba(232,168,56,0.25)',
    success: '#34d399',
    successLight: 'rgba(52,211,153,0.10)',
    successBorder: 'rgba(52,211,153,0.20)',
    danger: '#f87171',
    dangerLight: 'rgba(248,113,113,0.10)',
    dangerBorder: 'rgba(248,113,113,0.20)',
    warning: '#fbbf24',
    warningLight: 'rgba(251,191,36,0.10)',
    warningBorder: 'rgba(251,191,36,0.20)',
    info: '#60a5fa',
    infoLight: 'rgba(96,165,250,0.10)',
    infoBorder: 'rgba(96,165,250,0.20)',
    plateBg: '#ffffff',
    plateText: '#1a1a2e',
    plateBorder: '#c0c4cc',
};

/* ─── Status Config ───────────────────────────────────────────── */
const STATUS = {
    booked: {
        label: 'Booked', color: THEME.warning, bg: THEME.warningLight,
        border: THEME.warningBorder, icon: Clock, dotColor: '#fbbf24',
    },
    in_transit: {
        label: 'In Transit', color: THEME.info, bg: THEME.infoLight,
        border: THEME.infoBorder, icon: Navigation, dotColor: '#60a5fa',
    },
    completed: {
        label: 'Completed', color: THEME.success, bg: THEME.successLight,
        border: THEME.successBorder, icon: CheckCircle, dotColor: '#34d399',
    },
    cancelled: {
        label: 'Cancelled', color: THEME.danger, bg: THEME.dangerLight,
        border: THEME.dangerBorder, icon: AlertCircle, dotColor: '#f87171',
    },
    postponed: {
        label: 'Postponed', color: '#c084fc', bg: 'rgba(192,132,252,0.10)',
        border: 'rgba(192,132,252,0.20)', icon: Clock, dotColor: '#c084fc',
    },
};

const LEAVE_STATUS = {
    approved: { color: THEME.success, bg: THEME.successLight, border: THEME.successBorder, label: 'Approved' },
    rejected: { color: THEME.danger, bg: THEME.dangerLight, border: THEME.dangerBorder, label: 'Rejected' },
    pending: { color: THEME.warning, bg: THEME.warningLight, border: THEME.warningBorder, label: 'Pending' },
};

/* ─── Global Styles ───────────────────────────────────────────── */
const globalStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes toastSlide {
    from { opacity: 0; transform: translateY(-14px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes glow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }
  @keyframes gentleFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
  *::-webkit-scrollbar { width: 5px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 3px; }

  .fade-up { animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; opacity: 0; }
  .spin { animation: spin 0.9s linear infinite; }
  .pulse-dot { animation: pulseDot 1.6s ease-in-out infinite; }
  .toast-anim { animation: toastSlide 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .glow-anim { animation: glow 4s ease-in-out infinite; }
`;

/* ─── Toast ───────────────────────────────────────────────────── */
const Toast = ({ type, message, onClose }) => {
    if (!message) return null;
    const isError = type === 'error';
    const color = isError ? THEME.danger : THEME.success;
    const bg = isError ? THEME.dangerLight : THEME.successLight;
    const border = isError ? THEME.dangerBorder : THEME.successBorder;
    const Icon = isError ? AlertCircle : CheckCircle;

    useEffect(() => {
        const t = setTimeout(() => onClose?.(), 3200);
        return () => clearTimeout(t);
    }, [message, onClose]);

    return (
        <div className="toast-anim" style={{
            position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
            padding: '12px 24px', borderRadius: 14,
            background: `linear-gradient(135deg, ${bg}, rgba(15,17,23,0.95))`,
            backdropFilter: 'blur(20px)', border: `1px solid ${border}`,
            color, fontSize: '0.85rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: `0 12px 40px rgba(0,0,0,0.5)`,
            fontFamily: 'inherit',
        }}>
            <Icon size={18} /> {message}
        </div>
    );
};

/* ─── License Plate Component ─────────────────────────────────── */
const LicensePlate = ({ number, model }) => {
    if (!number) return null;
    const clean = number.replace(/\s+/g, '').toUpperCase();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
                background: THEME.plateBg,
                border: `2.5px solid ${THEME.plateBorder}`,
                borderRadius: 8,
                padding: '5px 14px',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}>
                {/* Screw dots */}
                <div style={{
                    position: 'absolute', top: 5, left: 6,
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#b0b4bc', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
                }} />
                <div style={{
                    position: 'absolute', top: 5, right: 6,
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#b0b4bc', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
                }} />
                <div style={{
                    position: 'absolute', bottom: 5, left: 6,
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#b0b4bc', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
                }} />
                <div style={{
                    position: 'absolute', bottom: 5, right: 6,
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#b0b4bc', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
                }} />

                <div style={{
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    fontSize: '1rem', fontWeight: 900, color: THEME.plateText,
                    letterSpacing: '0.12em',
                    textShadow: '0 1px 0 rgba(255,255,255,0.3)',
                    textAlign: 'center', minWidth: 60,
                }}>
                    {clean}
                </div>
            </div>
            {model && (
                <span style={{ fontSize: '0.62rem', color: THEME.textMuted, fontWeight: 600, letterSpacing: '0.04em' }}>
                    {model}
                </span>
            )}
        </div>
    );
};

/* ─── Status Pill ─────────────────────────────────────────────── */
const StatusPill = ({ status }) => {
    const cfg = STATUS[status] || {
        label: status || 'Unknown', color: THEME.textMuted,
        bg: 'rgba(255,255,255,0.04)', border: THEME.border, dotColor: THEME.textMuted,
    };
    const isTransit = status === 'in_transit';

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 14px', borderRadius: 100,
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            color: cfg.color, fontSize: '0.68rem', fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
            <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: cfg.dotColor,
                boxShadow: `0 0 8px ${cfg.dotColor}`,
                className: isTransit ? 'pulse-dot' : undefined,
            }} />
            {cfg.label}
        </span>
    );
};

/* ─── Stat Box ────────────────────────────────────────────────── */
const StatBox = ({ value, label, color, icon: Icon }) => (
    <div style={{
        flex: 1, padding: '20px 12px', textAlign: 'center',
        background: THEME.bgCard, borderRadius: 16,
        border: `1px solid ${THEME.border}`,
        transition: 'all 0.3s ease',
    }}>
        <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `${color}10`, border: `1px solid ${color}20`,
            color, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', position: 'relative',
        }}>
            <Icon size={18} />
            {label === 'Active' && (
                <span className="pulse-dot" style={{
                    position: 'absolute', top: -2, right: -2,
                    width: 9, height: 9, borderRadius: '50%',
                    background: color, border: '2px solid ' + THEME.bgCard,
                }} />
            )}
        </div>
        <div style={{
            fontSize: '1.75rem', fontWeight: 800, color: THEME.text,
            lineHeight: 1, marginBottom: 6, fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.03em',
        }}>
            {value}
        </div>
        <div style={{
            fontSize: '0.6rem', color: THEME.textMuted, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
            {label}
        </div>
    </div>
);

/* ─── Booking Card ────────────────────────────────────────────── */
const BookingCard = ({ booking, onStatusChange, index }) => {
    const b = booking;
    const cfg = STATUS[b.status] || {};

    return (
        <div style={{
            background: THEME.bgCard, borderRadius: 20,
            marginBottom: 16, overflow: 'hidden',
            border: `1px solid ${THEME.border}`,
            transition: 'all 0.3s ease',
            animationDelay: `${(index || 0) * 0.06}s`,
        }}>
            {/* Top accent bar */}
            <div style={{
                height: 3,
                background: `linear-gradient(90deg, ${cfg.color || THEME.accent}, transparent)`,
                opacity: 0.7,
            }} />

            <div style={{ padding: '22px 20px 20px' }}>
                {/* Header row */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 18,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: `${cfg.color || THEME.accent}10`,
                            border: `1px solid ${cfg.color || THEME.accent}18`,
                            color: cfg.color || THEME.accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Truck size={18} />
                        </div>
                        <div>
                            <div style={{
                                color: THEME.text, fontSize: '0.88rem', fontWeight: 800,
                                fontFamily: "'SF Mono', 'Fira Code', monospace",
                                letterSpacing: '0.02em',
                            }}>
                                {genId(b.booking_id)}
                            </div>
                            <div style={{
                                fontSize: '0.68rem', color: THEME.textMuted, marginTop: 2,
                            }}>
                                {fmtDate(b.created_at)} · {fmtTime(b.created_at)}
                            </div>
                        </div>
                    </div>
                    <StatusPill status={b.status} />
                </div>

                {/* Client info */}
                <div style={{
                    marginBottom: 16, padding: '14px 16px',
                    background: THEME.bgInput, borderRadius: 14,
                    border: `1px solid ${THEME.borderLight}`,
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: THEME.text, marginBottom: 5 }}>
                                {b.client_name}
                            </div>
                            <div style={{
                                fontSize: '0.8rem', color: THEME.textSecondary,
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                <Phone size={13} style={{ color: THEME.textMuted }} />
                                {b.client_phone || 'No phone'}
                            </div>
                        </div>
                        <div style={{
                            width: 38, height: 38, borderRadius: 12,
                            background: THEME.accentLight,
                            border: `1px solid ${THEME.accentBorder}`,
                            color: THEME.accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <User size={16} />
                        </div>
                    </div>
                </div>

                {/* Route + Vehicle */}
                <div style={{
                    marginBottom: 20, padding: '16px',
                    background: THEME.bgInput, borderRadius: 14,
                    border: `1px solid ${THEME.borderLight}`,
                }}>
                    {/* Route */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        {/* Dotted line */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 }}>
                            <div style={{
                                width: 22, height: 22, borderRadius: '50%',
                                background: 'rgba(248,113,113,0.12)', border: '2px solid rgba(248,113,113,0.35)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f87171' }} />
                            </div>
                            <div style={{
                                width: 2, flex: 1, minHeight: 30, margin: '4px 0',
                                background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 3px, transparent 3px, transparent 7px)',
                            }} />
                            <div style={{
                                width: 22, height: 22, borderRadius: '50%',
                                background: 'rgba(52,211,153,0.12)', border: '2px solid rgba(52,211,153,0.35)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399' }} />
                            </div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                            <div>
                                <div style={{ fontSize: '0.6rem', color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                                    Pickup
                                </div>
                                <div style={{ fontSize: '0.85rem', color: THEME.text, fontWeight: 600 }}>
                                    {b.from_location || b.destination || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.6rem', color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                                    Destination
                                </div>
                                <div style={{ fontSize: '0.85rem', color: THEME.text, fontWeight: 600 }}>
                                    {b.destination || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle / Plate divider */}
                    <div style={{
                        height: 1, background: THEME.border, marginBottom: 14,
                    }} />

                    {/* Vehicle info row */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 10,
                                background: THEME.accentLight,
                                border: `1px solid ${THEME.accentBorder}`,
                                color: THEME.accent,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Car size={16} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.6rem', color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Assigned Vehicle
                                </div>
                                <div style={{ fontSize: '0.82rem', color: THEME.text, fontWeight: 700, marginTop: 2 }}>
                                    {b.vehicle_name || b.model || 'Vehicle'}
                                </div>
                            </div>
                        </div>
                        <LicensePlate number={b.plate_number || b.number_plate} model={b.model} />
                    </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                    {b.status === 'booked' && (
                        <button
                            onClick={() => onStatusChange(b.booking_id, 'in_transit')}
                            style={{
                                flex: 1, padding: '14px', border: 'none', borderRadius: 14,
                                cursor: 'pointer',
                                background: THEME.accent,
                                color: '#1a1a2e', fontWeight: 800, fontSize: '0.85rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: `0 6px 24px -4px ${THEME.accent}40`,
                                transition: 'all 0.25s ease',
                                letterSpacing: '0.01em',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.filter = 'brightness(1.1)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.filter = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <Zap size={18} />
                            Accept Trip
                            <ArrowRight size={15} style={{ opacity: 0.6 }} />
                        </button>
                    )}
                    {b.status === 'in_transit' && (
                        <button
                            onClick={() => onStatusChange(b.booking_id, 'completed')}
                            style={{
                                flex: 1, padding: '14px', border: 'none', borderRadius: 14,
                                cursor: 'pointer',
                                background: THEME.success,
                                color: '#0f1117', fontWeight: 800, fontSize: '0.85rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: `0 6px 24px -4px ${THEME.success}40`,
                                transition: 'all 0.25s ease',
                                letterSpacing: '0.01em',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.filter = 'brightness(1.1)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.filter = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <CheckCircle size={18} />
                            Complete Trip
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─── Leave Card ──────────────────────────────────────────────── */
const LeaveCard = ({ leave }) => {
    const s = (leave.status || 'pending').toLowerCase();
    const cfg = LEAVE_STATUS[s] || LEAVE_STATUS.pending;

    return (
        <div style={{
            background: THEME.bgCard, borderRadius: 16, padding: '16px 18px',
            marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: `1px solid ${THEME.border}`,
            transition: 'all 0.2s ease',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: cfg.bg, border: `1px solid ${cfg.border}`,
                    color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Calendar size={18} />
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: THEME.text, marginBottom: 4 }}>
                        {leave.leave_type || 'Leave'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: THEME.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={12} />
                        {leave.start_date
                            ? new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'N/A'}
                        {' — '}
                        {leave.end_date
                            ? new Date(leave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                    </div>
                </div>
            </div>
            <span style={{
                padding: '4px 14px', borderRadius: 100,
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                color: cfg.color, fontSize: '0.65rem', fontWeight: 700,
                letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
                {cfg.label}
            </span>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN DRIVER PORTAL
   ═══════════════════════════════════════════════════════════════ */
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
    const greeting = getGreeting();
    const GreetingIcon = greeting.icon;

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
            setTimeout(() => setSuccess(''), 3000);
            loadBookings(true);
        } catch { setError('Failed to update status.'); setTimeout(() => setError(''), 3500); }
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

    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div style={{
            minHeight: '100vh',
            background: THEME.bg,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            color: THEME.text,
            position: 'relative', overflow: 'hidden',
        }}>
            <style>{globalStyles}</style>

            {/* Subtle ambient glow */}
            <div className="glow-anim" style={{
                position: 'fixed', top: '-30%', right: '-20%',
                width: 700, height: 700, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(232,168,56,0.04) 0%, transparent 65%)',
                filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
            }} />
            <div className="glow-anim" style={{
                position: 'fixed', bottom: '-20%', left: '-15%',
                width: 600, height: 600, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(96,165,250,0.03) 0%, transparent 65%)',
                filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
                animationDelay: '2s',
            }} />

            {/* Toast */}
            <Toast type="error" message={error} onClose={() => setError('')} />
            <Toast type="success" message={success} onClose={() => setSuccess('')} />

            <div style={{ position: 'relative', zIndex: 1 }}>

                {/* ═══ HEADER ═══ */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 50,
                    background: 'rgba(15,17,23,0.85)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderBottom: `1px solid ${THEME.border}`,
                }}>
                    <div style={{
                        maxWidth: 580, margin: '0 auto',
                        padding: '14px 20px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12,
                                background: THEME.accent,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 4px 16px -2px ${THEME.accent}35`,
                            }}>
                                <Car size={19} color="#1a1a2e" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: THEME.text, letterSpacing: '-0.01em' }}>
                                    DriverHub
                                </div>
                                <div style={{ fontSize: '0.55rem', color: THEME.textMuted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    {slug}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <button
                                onClick={() => loadBookings(true)}
                                disabled={refreshing}
                                style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: THEME.bgCard, border: `1px solid ${THEME.border}`,
                                    color: THEME.textSecondary, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = THEME.accentBorder}
                                onMouseLeave={e => e.currentTarget.style.borderColor = THEME.border}
                            >
                                <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '8px 16px', borderRadius: 10,
                                    background: THEME.dangerLight,
                                    border: `1px solid ${THEME.dangerBorder}`,
                                    color: THEME.danger, fontSize: '0.75rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.16)'}
                                onMouseLeave={e => e.currentTarget.style.background = THEME.dangerLight}
                            >
                                <LogOut size={13} /> Exit
                            </button>
                        </div>
                    </div>
                </header>

                <main style={{ maxWidth: 580, margin: '0 auto', padding: '28px 20px 100px' }}>

                    {/* ═══ GREETING SECTION ═══ */}
                    <div className="fade-up" style={{ marginBottom: 28 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                {/* Time & Date */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    marginBottom: 14,
                                }}>
                                    <div style={{
                                        padding: '5px 12px', borderRadius: 8,
                                        background: THEME.accentLight,
                                        border: `1px solid ${THEME.accentBorder}`,
                                        color: THEME.accent,
                                        fontSize: '0.7rem', fontWeight: 700,
                                        display: 'flex', alignItems: 'center', gap: 6,
                                    }}>
                                        <GreetingIcon size={13} />
                                        {greeting.text}
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: THEME.textMuted, fontWeight: 600 }}>
                                        {currentTime}
                                    </span>
                                </div>

                                {/* Driver name */}
                                <h1 style={{
                                    margin: 0, fontSize: '2rem', fontWeight: 800,
                                    lineHeight: 1.1, letterSpacing: '-0.03em',
                                    color: THEME.text, marginBottom: 6,
                                }}>
                                    {user?.name || 'Driver'}
                                </h1>

                                {/* Date line */}
                                <div style={{ fontSize: '0.8rem', color: THEME.textMuted, fontWeight: 500, marginBottom: 10 }}>
                                    {currentDate}
                                </div>

                                {/* Trip summary */}
                                <div style={{
                                    fontSize: '0.82rem', color: THEME.textSecondary, fontWeight: 500,
                                    display: 'flex', alignItems: 'center', gap: 6,
                                }}>
                                    {activeBookings.length > 0 ? (
                                        <>
                                            <span className="pulse-dot" style={{
                                                width: 7, height: 7, borderRadius: '50%',
                                                background: THEME.accent, display: 'inline-block',
                                            }} />
                                            <span style={{ color: THEME.accent, fontWeight: 700 }}>
                                                {activeBookings.length} active trip{activeBookings.length !== 1 ? 's' : ''}
                                            </span>
                                            {' waiting for you'}
                                        </>
                                    ) : (
                                        'No active trips — all clear'
                                    )}
                                </div>
                            </div>

                            {/* Avatar */}
                            <div style={{
                                width: 56, height: 56, borderRadius: 16,
                                background: `linear-gradient(135deg, ${THEME.accent}, #d97706)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#1a1a2e', fontSize: '1.05rem', fontWeight: 800,
                                boxShadow: `0 8px 28px -4px ${THEME.accent}30`,
                                flexShrink: 0, marginLeft: 16,
                                position: 'relative',
                            }}>
                                {initials}
                                <div style={{
                                    position: 'absolute', bottom: -2, right: -2,
                                    width: 16, height: 16, borderRadius: '50%',
                                    background: THEME.success, border: '3px solid ' + THEME.bg,
                                    boxShadow: `0 0 12px ${THEME.success}60`,
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* ═══ DRIVER INFO STRIP ═══ */}
                    {user?.phone && (
                        <div className="fade-up" style={{
                            animationDelay: '0.05s',
                            display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap',
                        }}>
                            <div style={{
                                padding: '10px 16px', borderRadius: 12,
                                background: THEME.bgCard, border: `1px solid ${THEME.border}`,
                                display: 'flex', alignItems: 'center', gap: 8,
                                fontSize: '0.78rem',
                            }}>
                                <Phone size={14} style={{ color: THEME.textMuted }} />
                                <span style={{ color: THEME.textSecondary, fontWeight: 600 }}>{user.phone}</span>
                            </div>
                            {user?.vehicle_number && (
                                <div style={{
                                    padding: '10px 16px', borderRadius: 12,
                                    background: THEME.bgCard, border: `1px solid ${THEME.border}`,
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    fontSize: '0.78rem',
                                }}>
                                    <Car size={14} style={{ color: THEME.textMuted }} />
                                    <span style={{ color: THEME.textSecondary, fontWeight: 600 }}>{user.vehicle_number}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ STATS ═══ */}
                    <div className="fade-up" style={{
                        display: 'flex', gap: 8, marginBottom: 28,
                        animationDelay: '0.08s',
                    }}>
                        <StatBox value={activeBookings.length} label="Active" color={THEME.accent} icon={Zap} />
                        <StatBox value={inTransitCount} label="In Transit" color={THEME.info} icon={Navigation} />
                        <StatBox value={completedCount} label="Done" color={THEME.success} icon={CheckCircle} />
                    </div>

                    {/* ═══ TABS ═══ */}
                    <div className="fade-up" style={{
                        display: 'flex', gap: 4, marginBottom: 20,
                        padding: 4, background: THEME.bgCard,
                        borderRadius: 14, border: `1px solid ${THEME.border}`,
                        animationDelay: '0.1s',
                    }}>
                        {[
                            { key: 'bookings', label: 'Trips', icon: Route, count: activeBookings.length },
                            { key: 'leaves', label: 'Leaves', icon: Calendar, count: leaves.length },
                        ].map(tab => {
                            const isActive = activeTab === tab.key;
                            const Icon = tab.icon;
                            const tabColor = tab.key === 'bookings' ? THEME.accent : THEME.success;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        flex: 1, padding: '12px 8px', borderRadius: 11,
                                        background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        border: isActive ? `1px solid ${tabColor}25` : '1px solid transparent',
                                        color: isActive ? THEME.text : THEME.textMuted,
                                        fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                        transition: 'all 0.25s ease',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    <Icon size={14} style={{ color: isActive ? tabColor : undefined }} />
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span style={{
                                            fontSize: '0.6rem', fontWeight: 800,
                                            padding: '2px 7px', borderRadius: 6,
                                            background: isActive ? `${tabColor}15` : 'rgba(255,255,255,0.03)',
                                            color: isActive ? tabColor : THEME.textMuted,
                                        }}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* ═══ CONTENT ═══ */}
                    <div className="fade-up" style={{ animationDelay: '0.14s' }}>
                        {activeTab === 'bookings' ? (
                            loadingBookings ? (
                                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                                    <div style={{
                                        width: 48, height: 48, margin: '0 auto 18px',
                                        borderRadius: 14, background: THEME.bgCard,
                                        border: `1px solid ${THEME.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Loader2 size={24} className="spin" style={{ color: THEME.textMuted }} />
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: THEME.textSecondary }}>
                                        Loading trips...
                                    </div>
                                </div>
                            ) : activeBookings.length === 0 ? (
                                <div style={{
                                    textAlign: 'center', padding: '70px 24px',
                                    background: THEME.bgCard, borderRadius: 20,
                                    border: `1px dashed ${THEME.border}`,
                                }}>
                                    <div style={{
                                        width: 64, height: 64, borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${THEME.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 20px',
                                    }}>
                                        <Car size={28} style={{ color: THEME.textMuted }} />
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: THEME.textSecondary, marginBottom: 8, letterSpacing: '-0.01em' }}>
                                        All Clear
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: THEME.textMuted, lineHeight: 1.6 }}>
                                        No active trips right now.<br />You'll be notified when a new booking arrives.
                                    </div>
                                </div>
                            ) : (
                                activeBookings.map((b, i) => (
                                    <div key={b.booking_id} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                        <BookingCard booking={b} onStatusChange={handleStatusChange} index={i} />
                                    </div>
                                ))
                            )
                        ) : (
                            loadingLeaves ? (
                                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                                    <div style={{
                                        width: 48, height: 48, margin: '0 auto 18px',
                                        borderRadius: 14, background: THEME.bgCard,
                                        border: `1px solid ${THEME.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Loader2 size={24} className="spin" style={{ color: THEME.textMuted }} />
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: THEME.textSecondary }}>
                                        Loading leaves...
                                    </div>
                                </div>
                            ) : leaves.length === 0 ? (
                                <div style={{
                                    textAlign: 'center', padding: '70px 24px',
                                    background: THEME.bgCard, borderRadius: 20,
                                    border: `1px dashed ${THEME.border}`,
                                }}>
                                    <div style={{
                                        width: 64, height: 64, borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${THEME.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 20px',
                                    }}>
                                        <Calendar size={28} style={{ color: THEME.textMuted }} />
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: THEME.textSecondary, marginBottom: 8 }}>
                                        No Leaves
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: THEME.textMuted }}>
                                        You haven't submitted any leave requests yet.
                                    </div>
                                </div>
                            ) : (
                                leaves.map((leave, i) => (
                                    <div key={leave.id || i} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                                        <LeaveCard leave={leave} />
                                    </div>
                                ))
                            )
                        )}
                    </div>

                    {/* ═══ FOOTER ═══ */}
                    <div style={{
                        textAlign: 'center', padding: '40px 0 0',
                        borderTop: `1px solid ${THEME.borderLight}`,
                        marginTop: 40,
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            marginBottom: 6,
                        }}>
                            <Shield size={12} style={{ color: THEME.textMuted }} />
                            <span style={{ fontSize: '0.68rem', color: THEME.textMuted, fontWeight: 600 }}>
                                Secure Driver Portal
                            </span>
                        </div>
                        <div style={{ fontSize: '0.6rem', color: THEME.textMuted, fontWeight: 500, opacity: 0.6 }}>
                            DriverHub v2.0 · {slug}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DriverPortal;