import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Car, RefreshCw, CheckCircle, Phone, MapPin, LogOut, Calendar,
    Clock, AlertCircle, Truck, Loader2, Zap, Navigation, ChevronRight,
    Route, Sun, Moon, CloudSun, User, ArrowRight, Shield, Star,
    TrendingUp, Package
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

/* ─── REAL-TIME GREETING (updates every minute) ──────────────── */
const useGreeting = () => {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(interval);
    }, []);

    const h = now.getHours();
    let text, icon, period;

    if (h >= 5 && h < 12) {
        text = 'Good Morning'; icon = Sun; period = 'morning';
    } else if (h >= 12 && h < 17) {
        text = 'Good Afternoon'; icon = CloudSun; period = 'afternoon';
    } else if (h >= 17 && h < 21) {
        text = 'Good Evening'; icon = Moon; period = 'evening';
    } else {
        text = 'Good Night'; icon = Moon; period = 'night';
    }

    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return { text, icon, period, timeStr, dateStr };
};

/* ─── LIGHT COLOR SYSTEM ──────────────────────────────────────── */
const C = {
    bg: '#F5F6FA',
    bgWarm: '#FAFAF8',
    card: '#FFFFFF',
    cardHover: '#FDFDFD',
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E8EBF0',
    borderLight: '#F0F1F4',
    primary: '#059669',
    primaryDark: '#047857',
    primaryLight: '#ECFDF5',
    primaryBorder: '#A7F3D0',
    primarySubtle: '#D1FAE5',
    blue: '#2563EB',
    blueLight: '#EFF6FF',
    blueBorder: '#BFDBFE',
    amber: '#D97706',
    amberLight: '#FFFBEB',
    amberBorder: '#FDE68A',
    red: '#DC2626',
    redLight: '#FEF2F2',
    redBorder: '#FECACA',
    purple: '#7C3AED',
    purpleLight: '#F5F3FF',
    purpleBorder: '#DDD6FE',
    shadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    shadowMd: '0 4px 12px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)',
    shadowLg: '0 10px 30px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)',
    plateBg: '#FFFFFF',
    plateText: '#1F2937',
    plateBorder: '#D1D5DB',
};

/* ─── Status Config ───────────────────────────────────────────── */
const STATUS = {
    booked: {
        label: 'Booked', color: C.amber, bg: C.amberLight,
        border: C.amberBorder, dotColor: '#F59E0B', icon: Clock,
    },
    in_transit: {
        label: 'In Transit', color: C.blue, bg: C.blueLight,
        border: C.blueBorder, dotColor: '#3B82F6', icon: Navigation,
    },
    completed: {
        label: 'Completed', color: C.primary, bg: C.primaryLight,
        border: C.primaryBorder, dotColor: '#10B981', icon: CheckCircle,
    },
    cancelled: {
        label: 'Cancelled', color: C.red, bg: C.redLight,
        border: C.redBorder, dotColor: '#EF4444', icon: AlertCircle,
    },
    postponed: {
        label: 'Postponed', color: C.purple, bg: C.purpleLight,
        border: C.purpleBorder, dotColor: '#8B5CF6', icon: Clock,
    },
};

const LEAVE_STATUS = {
    approved: { color: C.primary, bg: C.primaryLight, border: C.primaryBorder, label: 'Approved' },
    rejected: { color: C.red, bg: C.redLight, border: C.redBorder, label: 'Rejected' },
    pending: { color: C.amber, bg: C.amberLight, border: C.amberBorder, label: 'Pending' },
};

/* ─── Global Animations ───────────────────────────────────────── */
const globalStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.3; transform: scale(0.7); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(12px); }
    to { opacity: 1; transform: translateX(0); }
  }

  * {
    -webkit-tap-highlight-color: transparent;
    box-sizing: border-box;
  }

  .dp-fade-up {
    animation: fadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    opacity: 0;
  }
  .dp-spin { animation: spin 0.8s linear infinite; }
  .dp-pulse { animation: pulseDot 1.5s ease-in-out infinite; }
  .dp-slide-down { animation: slideDown 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .dp-slide-right { animation: slideInRight 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

  input, select, textarea, button {
    font-family: inherit;
  }
`;

/* ─── Toast ───────────────────────────────────────────────────── */
const Toast = ({ type, message, onClose }) => {
    if (!message) return null;
    const isError = type === 'error';
    const color = isError ? C.red : C.primary;
    const bg = isError ? C.redLight : C.primaryLight;
    const border = isError ? C.redBorder : C.primaryBorder;
    const Icon = isError ? AlertCircle : CheckCircle;

    useEffect(() => {
        const t = setTimeout(() => onClose?.(), 3500);
        return () => clearTimeout(t);
    }, [message, onClose]);

    return (
        <div className="dp-slide-down" style={{
            position: 'fixed', top: 16, left: 16, right: 16, zIndex: 9999,
            padding: '14px 18px', borderRadius: 14,
            background, border: `1.5px solid ${border}`,
            color, fontSize: '0.88rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: C.shadowLg, fontFamily: 'inherit',
            maxWidth: 420, margin: '0 auto',
        }}>
            <Icon size={20} strokeWidth={2.5} />
            <span style={{ flex: 1 }}>{message}</span>
        </div>
    );
};

/* ─── License Plate ───────────────────────────────────────────── */
const LicensePlate = ({ number, model }) => {
    if (!number) return null;
    const clean = number.replace(/\s+/g, '').toUpperCase();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{
                background: C.plateBg,
                border: `2px solid ${C.plateBorder}`,
                borderRadius: 6, padding: '4px 12px',
                position: 'relative',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(0,0,0,0.04)',
            }}>
                <div style={{
                    position: 'absolute', top: 4, left: 5, width: 4, height: 4,
                    borderRadius: '50%', background: '#D1D5DB',
                    boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.2)',
                }} />
                <div style={{
                    position: 'absolute', top: 4, right: 5, width: 4, height: 4,
                    borderRadius: '50%', background: '#D1D5DB',
                    boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.2)',
                }} />
                <div style={{
                    position: 'absolute', bottom: 4, left: 5, width: 4, height: 4,
                    borderRadius: '50%', background: '#D1D5DB',
                    boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.2)',
                }} />
                <div style={{
                    position: 'absolute', bottom: 4, right: 5, width: 4, height: 4,
                    borderRadius: '50%', background: '#D1D5DB',
                    boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.2)',
                }} />
                <div style={{
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    fontSize: '0.85rem', fontWeight: 900, color: C.plateText,
                    letterSpacing: '0.1em', textAlign: 'center', minWidth: 52,
                }}>
                    {clean}
                </div>
            </div>
            {model && (
                <span style={{ fontSize: '0.6rem', color: C.textTertiary, fontWeight: 600 }}>
                    {model}
                </span>
            )}
        </div>
    );
};

/* ─── Status Badge ────────────────────────────────────────────── */
const StatusBadge = ({ status, size = 'md' }) => {
    const cfg = STATUS[status] || {
        label: status || 'Unknown', color: C.textTertiary,
        bg: '#F9FAFB', border: C.border, dotColor: C.textTertiary,
    };
    const isTransit = status === 'in_transit';
    const sm = size === 'sm';

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: sm ? '3px 10px' : '5px 14px', borderRadius: 100,
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            color: cfg.color, fontSize: sm ? '0.62rem' : '0.7rem', fontWeight: 700,
            letterSpacing: '0.03em', textTransform: 'uppercase',
        }}>
            <span style={{
                width: sm ? 5 : 6, height: sm ? 5 : 6, borderRadius: '50%',
                background: cfg.dotColor,
                boxShadow: `0 0 6px ${cfg.dotColor}50`,
                className: isTransit ? 'dp-pulse' : undefined,
            }} />
            {cfg.label}
        </span>
    );
};

/* ─── Quick Stat ──────────────────────────────────────────────── */
const QuickStat = ({ value, label, color, bgColor, icon: Icon, pulse }) => (
    <div style={{
        flex: 1, padding: '16px 10px', textAlign: 'center',
        background: C.card, borderRadius: 14,
        border: `1px solid ${C.borderLight}`,
        boxShadow: C.shadow, position: 'relative',
    }}>
        <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: bgColor, color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 10px', position: 'relative',
        }}>
            <Icon size={17} strokeWidth={2.2} />
            {pulse && (
                <span className="dp-pulse" style={{
                    position: 'absolute', top: -2, right: -2,
                    width: 9, height: 9, borderRadius: '50%',
                    background: color, border: '2px solid ' + C.card,
                }} />
            )}
        </div>
        <div style={{
            fontSize: '1.6rem', fontWeight: 800, color: C.text,
            lineHeight: 1, marginBottom: 4,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em',
        }}>
            {value}
        </div>
        <div style={{
            fontSize: '0.58rem', color: C.textTertiary, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
            {label}
        </div>
    </div>
);

/* ─── Trip Card ───────────────────────────────────────────────── */
const TripCard = ({ booking, onStatusChange, index }) => {
    const b = booking;
    const cfg = STATUS[b.status] || {};

    return (
        <div className="dp-fade-up" style={{
            background: C.card, borderRadius: 18,
            marginBottom: 14, overflow: 'hidden',
            border: `1px solid ${C.borderLight}`,
            boxShadow: C.shadow,
            animationDelay: `${(index || 0) * 0.05}s`,
        }}>
            {/* Status accent line */}
            <div style={{
                height: 3.5, background: cfg.color || C.primary, opacity: 0.85,
            }} />

            <div style={{ padding: '18px 18px 20px' }}>
                {/* Top: ID + Status */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 16,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 11,
                            background: cfg.bg || C.primaryLight,
                            border: `1px solid ${cfg.border || C.primaryBorder}`,
                            color: cfg.color || C.primary,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Truck size={17} strokeWidth={2.2} />
                        </div>
                        <div>
                            <div style={{
                                color: C.text, fontSize: '0.84rem', fontWeight: 800,
                                fontFamily: "'SF Mono', 'Fira Code', monospace",
                                letterSpacing: '0.02em',
                            }}>
                                {genId(b.booking_id)}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: C.textTertiary, marginTop: 1 }}>
                                {fmtDate(b.created_at)} · {fmtTime(b.created_at)}
                            </div>
                        </div>
                    </div>
                    <StatusBadge status={b.status} size="sm" />
                </div>

                {/* Client */}
                <div style={{
                    marginBottom: 14, padding: '12px 14px',
                    background: '#FAFBFC', borderRadius: 12,
                    border: `1px solid ${C.borderLight}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: C.text, marginBottom: 3 }}>
                            {b.client_name}
                        </div>
                        {b.client_phone && (
                            <div style={{
                                fontSize: '0.78rem', color: C.textSecondary,
                                display: 'flex', alignItems: 'center', gap: 5,
                            }}>
                                <Phone size={12} /> {b.client_phone}
                            </div>
                        )}
                    </div>
                    <div style={{
                        width: 36, height: 36, borderRadius: 50,
                        background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                        color: C.primary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <User size={15} />
                    </div>
                </div>

                {/* Route */}
                <div style={{
                    marginBottom: 14, padding: '14px',
                    background: '#FAFBFC', borderRadius: 12,
                    border: `1px solid ${C.borderLight}`,
                }}>
                    <div style={{ display: 'flex', gap: 11 }}>
                        {/* Route dots + line */}
                        <div style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', paddingTop: 1,
                        }}>
                            <div style={{
                                width: 20, height: 20, borderRadius: '50%',
                                background: '#FEF2F2', border: '2px solid #FCA5A5',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
                            </div>
                            <div style={{
                                width: 1.5, flex: 1, minHeight: 28, margin: '3px 0',
                                background: 'repeating-linear-gradient(to bottom, #D1D5DB 0px, #D1D5DB 3px, transparent 3px, transparent 7px)',
                            }} />
                            <div style={{
                                width: 20, height: 20, borderRadius: '50%',
                                background: '#ECFDF5', border: '2px solid #6EE7B7',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                            </div>
                        </div>

                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            justifyContent: 'space-between', gap: 10,
                        }}>
                            <div>
                                <div style={{
                                    fontSize: '0.58rem', color: C.textTertiary, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2,
                                }}>Pickup</div>
                                <div style={{ fontSize: '0.82rem', color: C.text, fontWeight: 600 }}>
                                    {b.from_location || b.destination || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '0.58rem', color: C.textTertiary, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2,
                                }}>Destination</div>
                                <div style={{ fontSize: '0.82rem', color: C.text, fontWeight: 600 }}>
                                    {b.destination || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle row */}
                    <div style={{
                        height: 1, background: C.borderLight, margin: '12px 0',
                    }} />
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 9,
                                background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                                color: C.primary,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Car size={15} />
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '0.56rem', color: C.textTertiary, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.08em',
                                }}>Vehicle</div>
                                <div style={{ fontSize: '0.78rem', color: C.text, fontWeight: 700, marginTop: 1 }}>
                                    {b.vehicle_name || b.model || 'Assigned'}
                                </div>
                            </div>
                        </div>
                        <LicensePlate number={b.plate_number || b.number_plate} model={b.model} />
                    </div>
                </div>

                {/* Action button */}
                <div>
                    {b.status === 'booked' && (
                        <button
                            onClick={() => onStatusChange(b.booking_id, 'in_transit')}
                            style={{
                                width: '100%', padding: '15px', border: 'none', borderRadius: 14,
                                cursor: 'pointer', background: C.primary, color: '#FFFFFF',
                                fontWeight: 700, fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: `0 4px 14px -2px ${C.primary}40`,
                                transition: 'all 0.2s ease',
                                fontFamily: 'inherit',
                            }}
                            activeStyle={{ transform: 'scale(0.98)', opacity: 0.9 }}
                        >
                            <Zap size={19} strokeWidth={2.5} />
                            Accept Trip
                            <ArrowRight size={16} style={{ opacity: 0.6 }} />
                        </button>
                    )}
                    {b.status === 'in_transit' && (
                        <button
                            onClick={() => onStatusChange(b.booking_id, 'completed')}
                            style={{
                                width: '100%', padding: '15px', border: 'none', borderRadius: 14,
                                cursor: 'pointer', background: C.blue, color: '#FFFFFF',
                                fontWeight: 700, fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: `0 4px 14px -2px ${C.blue}40`,
                                transition: 'all 0.2s ease',
                                fontFamily: 'inherit',
                            }}
                            activeStyle={{ transform: 'scale(0.98)', opacity: 0.9 }}
                        >
                            <CheckCircle size={19} strokeWidth={2.5} />
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
            background: C.card, borderRadius: 14, padding: '14px 16px',
            marginBottom: 10, display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', border: `1px solid ${C.borderLight}`,
            boxShadow: C.shadow,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: cfg.bg, border: `1px solid ${cfg.border}`,
                    color: cfg.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Calendar size={17} />
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: C.text, marginBottom: 3 }}>
                        {leave.leave_type || 'Leave'}
                    </div>
                    <div style={{
                        fontSize: '0.72rem', color: C.textTertiary,
                        display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                        <Clock size={11} />
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
                padding: '3px 12px', borderRadius: 100,
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                color: cfg.color, fontSize: '0.6rem', fontWeight: 700,
                letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
                {cfg.label}
            </span>
        </div>
    );
};

/* ─── Empty State ─────────────────────────────────────────────── */
const EmptyState = ({ icon: Icon, title, subtitle }) => (
    <div style={{
        textAlign: 'center', padding: '60px 24px',
        background: C.card, borderRadius: 18,
        border: `1.5px dashed ${C.border}`,
    }}>
        <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: C.bg, border: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px', color: C.textTertiary,
        }}>
            <Icon size={26} />
        </div>
        <div style={{
            fontSize: '1.05rem', fontWeight: 800, color: C.textSecondary,
            marginBottom: 6, letterSpacing: '-0.01em',
        }}>
            {title}
        </div>
        <div style={{ fontSize: '0.82rem', color: C.textTertiary, lineHeight: 1.6 }}>
            {subtitle}
        </div>
    </div>
);

/* ─── Loading Spinner ─────────────────────────────────────────── */
const LoadingState = ({ text }) => (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{
            width: 44, height: 44, margin: '0 auto 16px',
            borderRadius: 13, background: C.bg,
            border: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Loader2 size={22} className="dp-spin" style={{ color: C.textTertiary }} />
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.textSecondary }}>
            {text || 'Loading...'}
        </div>
    </div>
);

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
    const greeting = useGreeting();
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
        } catch {
            setError('Failed to update status.');
            setTimeout(() => setError(''), 3500);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tenantSlug');
        localStorage.removeItem('refreshToken');
        sessionStorage.clear();
        navigate('/login');
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
            minHeight: '100dvh',
            background: C.bg,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            color: C.text,
            position: 'relative',
            WebkitFontSmoothing: 'antialiased',
        }}>
            <style>{globalStyles}</style>

            {/* Toast */}
            <Toast type="error" message={error} onClose={() => setError('')} />
            <Toast type="success" message={success} onClose={() => setSuccess('')} />

            {/* ═══ STICKY HEADER ═══ */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                borderBottom: `1px solid ${C.borderLight}`,
            }}>
                <div style={{
                    maxWidth: 520, margin: '0 auto',
                    padding: '12px 18px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 11,
                            background: C.primary,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 3px 10px -1px ${C.primary}30`,
                        }}>
                            <Car size={18} color="#fff" strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={{
                                fontSize: '0.92rem', fontWeight: 800, color: C.text,
                                letterSpacing: '-0.01em',
                            }}>
                                RestPoint
                            </div>
                            <div style={{
                                fontSize: '0.52rem', color: C.textTertiary, fontWeight: 600,
                                letterSpacing: '0.08em', textTransform: 'uppercase',
                            }}>
                                Driver Portal
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                            onClick={() => loadBookings(true)}
                            disabled={refreshing}
                            style={{
                                width: 38, height: 38, borderRadius: 11,
                                background: C.bg, border: `1px solid ${C.border}`,
                                color: C.textSecondary, display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            <RefreshCw size={15} className={refreshing ? 'dp-spin' : ''} />
                        </button>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '8px 14px', borderRadius: 11,
                                background: C.redLight, border: `1px solid ${C.redBorder}`,
                                color: C.red, fontSize: '0.72rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', gap: 5,
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            <LogOut size={13} />
                            <span className="dp-logout-text">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: 520, margin: '0 auto', padding: '20px 18px 120px' }}>

                {/* ═══ GREETING ═══ */}
                <div className="dp-fade-up" style={{ marginBottom: 22 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12,
                    }}>
                        <div style={{
                            padding: '4px 11px', borderRadius: 8,
                            background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                            color: C.primary, fontSize: '0.68rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: 5,
                        }}>
                            <GreetingIcon size={13} />
                            {greeting.text}
                        </div>
                        <span style={{ fontSize: '0.68rem', color: C.textTertiary, fontWeight: 600 }}>
                            {greeting.timeStr}
                        </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{
                                margin: 0, fontSize: '1.75rem', fontWeight: 800,
                                lineHeight: 1.1, letterSpacing: '-0.03em',
                                color: C.text, marginBottom: 4,
                            }}>
                                {user?.name || 'Driver'}
                            </h1>
                            <div style={{ fontSize: '0.78rem', color: C.textTertiary, fontWeight: 500 }}>
                                {greeting.dateStr}
                            </div>
                        </div>

                        {/* Avatar */}
                        <div style={{
                            width: 50, height: 50, borderRadius: 15,
                            background: `linear-gradient(135deg, ${C.primary}, #10B981)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '0.95rem', fontWeight: 800,
                            boxShadow: `0 4px 16px -2px ${C.primary}25`,
                            flexShrink: 0, position: 'relative',
                        }}>
                            {initials}
                            <div style={{
                                position: 'absolute', bottom: -1, right: -1,
                                width: 14, height: 14, borderRadius: '50%',
                                background: C.primary, border: '2.5px solid #fff',
                                boxShadow: `0 0 0 1px ${C.primaryBorder}`,
                            }} />
                        </div>
                    </div>

                    {/* Active trip banner */}
                    {activeBookings.length > 0 && (
                        <div style={{
                            marginTop: 14, padding: '10px 14px',
                            background: C.amberLight, border: `1px solid ${C.amberBorder}`,
                            borderRadius: 11, display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <span className="dp-pulse" style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: '#F59E0B', flexShrink: 0,
                                boxShadow: '0 0 8px #F59E0B50',
                            }} />
                            <span style={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 600 }}>
                                <strong>{activeBookings.length}</strong> trip{activeBookings.length !== 1 ? 's' : ''} waiting for your action
                            </span>
                        </div>
                    )}
                </div>

                {/* ═══ STATS ═══ */}
                <div className="dp-fade-up" style={{
                    display: 'flex', gap: 8, marginBottom: 22,
                    animationDelay: '0.06s',
                }}>
                    <QuickStat
                        value={activeBookings.length} label="Active"
                        color={C.amber} bgColor={C.amberLight}
                        icon={Zap} pulse={activeBookings.length > 0}
                    />
                    <QuickStat
                        value={inTransitCount} label="En Route"
                        color={C.blue} bgColor={C.blueLight}
                        icon={Navigation}
                    />
                    <QuickStat
                        value={completedCount} label="Done"
                        color={C.primary} bgColor={C.primaryLight}
                        icon={CheckCircle}
                    />
                </div>

                {/* ═══ TABS ═══ */}
                <div className="dp-fade-up" style={{
                    display: 'flex', gap: 3, marginBottom: 18,
                    padding: 3, background: C.bg,
                    borderRadius: 13, border: `1px solid ${C.borderLight}`,
                    animationDelay: '0.09s',
                }}>
                    {[
                        { key: 'bookings', label: 'Trips', icon: Route, count: activeBookings.length },
                        { key: 'leaves', label: 'Leaves', icon: Calendar, count: leaves.length },
                    ].map(tab => {
                        const isActive = activeTab === tab.key;
                        const Icon = tab.icon;
                        const tabColor = tab.key === 'bookings' ? C.primary : C.purple;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    flex: 1, padding: '11px 6px', borderRadius: 11,
                                    background: isActive ? C.card : 'transparent',
                                    border: isActive ? `1.5px solid ${tabColor}30` : '1.5px solid transparent',
                                    color: isActive ? C.text : C.textTertiary,
                                    fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'inherit',
                                    boxShadow: isActive ? C.shadow : 'none',
                                }}
                            >
                                <Icon size={14} style={{ color: isActive ? tabColor : undefined }} />
                                {tab.label}
                                {tab.count > 0 && (
                                    <span style={{
                                        fontSize: '0.58rem', fontWeight: 800,
                                        padding: '1px 6px', borderRadius: 6,
                                        background: isActive ? `${tabColor}12` : 'rgba(0,0,0,0.03)',
                                        color: isActive ? tabColor : C.textTertiary,
                                    }}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ═══ CONTENT ═══ */}
                <div className="dp-fade-up" style={{ animationDelay: '0.12s' }}>
                    {activeTab === 'bookings' ? (
                        loadingBookings ? (
                            <LoadingState text="Loading trips..." />
                        ) : activeBookings.length === 0 ? (
                            <EmptyState
                                icon={Car}
                                title="All Clear"
                                subtitle="No active trips right now. You'll be notified when a new booking arrives."
                            />
                        ) : (
                            activeBookings.map((b, i) => (
                                <TripCard
                                    key={b.booking_id}
                                    booking={b}
                                    onStatusChange={handleStatusChange}
                                    index={i}
                                />
                            ))
                        )
                    ) : (
                        loadingLeaves ? (
                            <LoadingState text="Loading leaves..." />
                        ) : leaves.length === 0 ? (
                            <EmptyState
                                icon={Calendar}
                                title="No Leaves"
                                subtitle="You haven't submitted any leave requests yet."
                            />
                        ) : (
                            leaves.map((leave, i) => (
                                <div key={leave.id || i} className="dp-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                                    <LeaveCard leave={leave} />
                                </div>
                            ))
                        )
                    )}
                </div>

                {/* ═══ FOOTER ═══ */}
                <div style={{
                    textAlign: 'center', padding: '36px 0 0',
                    borderTop: `1px solid ${C.borderLight}`, marginTop: 32,
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        marginBottom: 4,
                    }}>
                        <Shield size={11} style={{ color: C.textTertiary }} />
                        <span style={{ fontSize: '0.65rem', color: C.textTertiary, fontWeight: 600 }}>
                            Secure Driver Portal
                        </span>
                    </div>
                    <div style={{ fontSize: '0.55rem', color: C.textTertiary, fontWeight: 500, opacity: 0.6 }}>
                        RestPoint v2.0 · {slug}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DriverPortal;