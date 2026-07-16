import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Car, RefreshCw, CheckCircle, Phone, MapPin, LogOut, Calendar,
    Clock, AlertCircle, Truck, Loader2, Zap, Navigation, ArrowRight,
    Route, Sun, Moon, CloudSun, User, Shield, Star, Coffee,
    Flame, Wind, Eye
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

/* ─── NAIROBI TIME GREETING ───────────────────────────────────── */
const useGreeting = () => {
    const [now, setNow] = useState(() => getNairobiNow());

    useEffect(() => {
        const interval = setInterval(() => setNow(getNairobiNow()), 15000);
        return () => clearInterval(interval);
    }, []);

    const h = now.getHours();
    let text, icon, subtext;

    if (h >= 5 && h < 12) {
        text = 'Good Morning'; icon = Sun;
        subtext = 'Rise and drive safe today';
    } else if (h >= 12 && h < 14) {
        text = 'Good Afternoon'; icon = Sun;
        subtext = 'Hope the roads are kind';
    } else if (h >= 14 && h < 17) {
        text = 'Good Afternoon'; icon = CloudSun;
        subtext = 'Almost there, stay strong';
    } else if (h >= 17 && h < 20) {
        text = 'Good Evening'; icon = Moon;
        subtext = 'Heading home soon?';
    } else if (h >= 20 && h < 23) {
        text = 'Good Evening'; icon = Moon;
        subtext = 'Long day? Rest well';
    } else {
        text = 'Working Late'; icon = Moon;
        subtext = 'Take care on the night road';
    }

    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
    });

    return { text, icon, subtext, timeStr, dateStr, hour: h };
};

function getNairobiNow() {
    const str = new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' });
    return new Date(str);
}

/* ─── RICH COLOR SYSTEM ──────────────────────────────────────── */
const P = {
    bg: '#0E1117',
    bgCard: '#161B22',
    bgElevated: '#1C2129',
    surface: '#21262D',
    text: '#F0F2F5',
    textSec: '#9BA4B0',
    textMuted: '#5E6670',
    border: '#2A3140',
    borderLight: '#1E252E',

    emerald: '#2DD4A0',
    emeraldDark: '#0D3D2E',
    emeraldMid: '#134E3A',
    emeraldGlow: 'rgba(45, 212, 160, 0.15)',

    ocean: '#38BDF8',
    oceanDark: '#0C2D4A',
    oceanMid: '#133B5C',
    oceanGlow: 'rgba(56, 189, 248, 0.15)',

    amber: '#FBBF24',
    amberDark: '#3D2E06',
    amberMid: '#4A3A0A',
    amberGlow: 'rgba(251, 191, 36, 0.12)',

    rose: '#FB7185',
    roseDark: '#3D0F17',
    roseMid: '#4A1520',
    roseGlow: 'rgba(251, 113, 133, 0.12)',

    violet: '#A78BFA',
    violetDark: '#1E153D',
    violetMid: '#2A1F4E',
    violetGlow: 'rgba(167, 139, 250, 0.12)',

    plateBg: '#F8FAFC',
    plateText: '#0F172A',
    plateBorder: '#64748B',
};

/* ─── STATUS → CARD THEME ────────────────────────────────────── */
const STATUS = {
    booked: {
        label: 'Booked', color: P.amber, dotColor: '#FBBF24',
        cardBg: P.amberDark, cardBorder: P.amberMid,
        glow: P.amberGlow, accentLine: '#F59E0B',
    },
    in_transit: {
        label: 'In Transit', color: P.ocean, dotColor: '#38BDF8',
        cardBg: P.oceanDark, cardBorder: P.oceanMid,
        glow: P.oceanGlow, accentLine: '#0EA5E9',
    },
    completed: {
        label: 'Completed', color: P.emerald, dotColor: '#2DD4A0',
        cardBg: P.emeraldDark, cardBorder: P.emeraldMid,
        glow: P.emeraldGlow, accentLine: '#10B981',
    },
    cancelled: {
        label: 'Cancelled', color: P.rose, dotColor: '#FB7185',
        cardBg: P.roseDark, cardBorder: P.roseMid,
        glow: P.roseGlow, accentLine: '#F43F5E',
    },
    postponed: {
        label: 'Postponed', color: P.violet, dotColor: '#A78BFA',
        cardBg: P.violetDark, cardBorder: P.violetMid,
        glow: P.violetGlow, accentLine: '#8B5CF6',
    },
};

const LEAVE_STATUS = {
    approved: { color: P.emerald, bg: P.emeraldDark, border: P.emeraldMid, label: 'Approved' },
    rejected: { color: P.rose, bg: P.roseDark, border: P.roseMid, label: 'Rejected' },
    pending: { color: P.amber, bg: P.amberDark, border: P.amberMid, label: 'Pending' },
};

/* ─── ANIMATIONS ──────────────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.25; transform: scale(0.65); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes toastIn {
    from { opacity: 0; transform: translateY(-12px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes breathe {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }
  @keyframes accentPulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  * {
    -webkit-tap-highlight-color: transparent;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .dp-fade-up {
    animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    opacity: 0;
  }
  .dp-spin { animation: spin 0.75s linear infinite; }
  .dp-pulse { animation: pulseDot 1.5s ease-in-out infinite; }
  .dp-toast { animation: toastIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .dp-breathe { animation: breathe 5s ease-in-out infinite; }
  .dp-accent-pulse { animation: accentPulse 3s ease-in-out infinite; }
`;

/* ─── Toast ───────────────────────────────────────────────────── */
const Toast = ({ type, message, onClose }) => {
    if (!message) return null;
    const isError = type === 'error';
    const c = isError ? P.rose : P.emerald;
    const bg = isError ? P.roseDark : P.emeraldDark;
    const border = isError ? P.roseMid : P.emeraldMid;
    const Icon = isError ? AlertCircle : CheckCircle;

    useEffect(() => {
        const t = setTimeout(() => onClose?.(), 3200);
        return () => clearTimeout(t);
    }, [message, onClose]);

    return (
        <div className="dp-toast" style={{
            position: 'fixed', top: 16, left: 16, right: 16, zIndex: 9999,
            padding: '13px 18px', borderRadius: 14,
            background: bg, border: `1.5px solid ${border}`,
            color: c, fontSize: '0.85rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            fontFamily: "'DM Sans', sans-serif",
            maxWidth: 400, margin: '0 auto',
            backdropFilter: 'blur(12px)',
        }}>
            <Icon size={19} strokeWidth={2.5} />
            <span style={{ flex: 1 }}>{message}</span>
        </div>
    );
};

/* ─── License Plate (dark card version) ──────────────────────── */
const LicensePlate = ({ number, model }) => {
    if (!number) return null;
    const clean = number.replace(/\s+/g, '').toUpperCase();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{
                background: P.plateBg,
                border: `2px solid ${P.plateBorder}`,
                borderRadius: 5, padding: '3px 10px',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}>
                {[[4, 5], [4, 'right']].map(([t, l], i) =>
                    ['left', 'right'].map(side =>
                        <div key={`${t}-${side}-${i}`} style={{
                            position: 'absolute', [side === 'left' ? 'left' : 'right']: 4,
                            [t === 4 ? 'top' : 'bottom']: 3,
                            width: 3.5, height: 3.5, borderRadius: '50%',
                            background: '#94A3B8',
                            boxShadow: 'inset 0 0.5px 1px rgba(0,0,0,0.3)',
                        }} />
                    )
                )}
                <div style={{
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    fontSize: '0.8rem', fontWeight: 900, color: P.plateText,
                    letterSpacing: '0.1em', textAlign: 'center', minWidth: 48,
                }}>
                    {clean}
                </div>
            </div>
            {model && (
                <span style={{ fontSize: '0.58rem', color: P.textMuted, fontWeight: 600 }}>
                    {model}
                </span>
            )}
        </div>
    );
};

/* ─── Status Pill ─────────────────────────────────────────────── */
const StatusPill = ({ status }) => {
    const cfg = STATUS[status] || {
        color: P.textMuted, dotColor: P.textMuted,
        label: status || 'Unknown',
    };
    const isTransit = status === 'in_transit';

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 100,
            background: `${cfg.color}18`, border: `1px solid ${cfg.color}30`,
            color: cfg.color, fontSize: '0.62rem', fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
            <span style={{
                width: 5.5, height: 5.5, borderRadius: '50%',
                background: cfg.dotColor,
                boxShadow: `0 0 8px ${cfg.dotColor}60`,
                className: isTransit ? 'dp-pulse' : undefined,
            }} />
            {cfg.label}
        </span>
    );
};

/* ─── Stat Tile (colored dark bg) ────────────────────────────── */
const StatTile = ({ value, label, color, darkBg, glowBg, icon: Icon, pulse }) => (
    <div style={{
        flex: 1, padding: '18px 10px', textAlign: 'center',
        background: darkBg, borderRadius: 16,
        border: `1px solid ${color}20`,
        position: 'relative', overflow: 'hidden',
    }}>
        {/* Subtle glow */}
        <div style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: 80, height: 80, borderRadius: '50%',
            background: glowBg, filter: 'blur(25px)',
            pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
            <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `${color}15`, border: `1px solid ${color}25`,
                color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px', position: 'relative',
            }}>
                <Icon size={18} strokeWidth={2.2} />
                {pulse && (
                    <span className="dp-pulse" style={{
                        position: 'absolute', top: -2, right: -2,
                        width: 9, height: 9, borderRadius: '50%',
                        background: color, border: '2px solid ' + darkBg,
                    }} />
                )}
            </div>
            <div style={{
                fontSize: '1.65rem', fontWeight: 800, color: P.text,
                lineHeight: 1, marginBottom: 4,
                fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em',
            }}>
                {value}
            </div>
            <div style={{
                fontSize: '0.56rem', color: P.textMuted, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
                {label}
            </div>
        </div>
    </div>
);

/* ─── Trip Card (dark, colored by status) ────────────────────── */
const TripCard = ({ booking, onStatusChange, index }) => {
    const b = booking;
    const cfg = STATUS[b.status] || {};
    const cardBg = cfg.cardBg || P.bgCard;
    const cardBorder = cfg.cardBorder || P.border;
    const glowColor = cfg.glow || 'transparent';
    const accentLine = cfg.accentLine || P.emerald;

    return (
        <div className="dp-fade-up" style={{
            background: cardBg, borderRadius: 18,
            marginBottom: 14, overflow: 'hidden',
            border: `1px solid ${cardBorder}`,
            animationDelay: `${(index || 0) * 0.06}s`,
            position: 'relative',
        }}>
            {/* Background glow */}
            <div style={{
                position: 'absolute', top: '-40px', left: '-20px',
                width: 160, height: 160, borderRadius: '50%',
                background: glowColor, filter: 'blur(50px)',
                pointerEvents: 'none', opacity: 0.6,
            }} />

            {/* Accent line */}
            <div style={{
                height: 3, background: accentLine, opacity: 0.9,
            }} />

            <div style={{ padding: '18px 18px 20px', position: 'relative' }}>
                {/* Top row */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 16,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 11,
                            background: `${accentLine}18`, border: `1px solid ${accentLine}30`,
                            color: accentLine,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Truck size={17} strokeWidth={2.2} />
                        </div>
                        <div>
                            <div style={{
                                color: P.text, fontSize: '0.82rem', fontWeight: 800,
                                fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                                letterSpacing: '0.02em',
                            }}>
                                {genId(b.booking_id)}
                            </div>
                            <div style={{ fontSize: '0.62rem', color: P.textMuted, marginTop: 2 }}>
                                {fmtDate(b.created_at)} · {fmtTime(b.created_at)}
                            </div>
                        </div>
                    </div>
                    <StatusPill status={b.status} />
                </div>

                {/* Client */}
                <div style={{
                    marginBottom: 14, padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)', borderRadius: 12,
                    border: `1px solid rgba(255,255,255,0.04)`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: P.text, marginBottom: 3 }}>
                            {b.client_name}
                        </div>
                        {b.client_phone && (
                            <div style={{
                                fontSize: '0.76rem', color: P.textSec,
                                display: 'flex', alignItems: 'center', gap: 5,
                            }}>
                                <Phone size={12} style={{ opacity: 0.6 }} /> {b.client_phone}
                            </div>
                        )}
                    </div>
                    <div style={{
                        width: 36, height: 36, borderRadius: 50,
                        background: `${accentLine}15`, border: `1px solid ${accentLine}25`,
                        color: accentLine,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <User size={15} />
                    </div>
                </div>

                {/* Route */}
                <div style={{
                    marginBottom: 14, padding: '14px',
                    background: 'rgba(255,255,255,0.03)', borderRadius: 12,
                    border: `1px solid rgba(255,255,255,0.04)`,
                }}>
                    <div style={{ display: 'flex', gap: 11 }}>
                        <div style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', paddingTop: 1,
                        }}>
                            <div style={{
                                width: 18, height: 18, borderRadius: '50%',
                                background: 'rgba(251,113,133,0.15)', border: '2px solid rgba(251,113,133,0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#FB7185' }} />
                            </div>
                            <div style={{
                                width: 1.5, flex: 1, minHeight: 26, margin: '3px 0',
                                background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 3px, transparent 3px, transparent 7px)',
                            }} />
                            <div style={{
                                width: 18, height: 18, borderRadius: '50%',
                                background: 'rgba(45,212,160,0.15)', border: '2px solid rgba(45,212,160,0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2DD4A0' }} />
                            </div>
                        </div>
                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            justifyContent: 'space-between', gap: 10,
                        }}>
                            <div>
                                <div style={{
                                    fontSize: '0.55rem', color: P.textMuted, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2,
                                }}>Pickup</div>
                                <div style={{ fontSize: '0.8rem', color: P.text, fontWeight: 600 }}>
                                    {b.from_location || b.destination || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '0.55rem', color: P.textMuted, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2,
                                }}>Destination</div>
                                <div style={{ fontSize: '0.8rem', color: P.text, fontWeight: 600 }}>
                                    {b.destination || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '11px 0' }} />

                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: 8,
                                background: `${accentLine}12`, border: `1px solid ${accentLine}20`,
                                color: accentLine,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Car size={14} />
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '0.5rem', color: P.textMuted, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.08em',
                                }}>Vehicle</div>
                                <div style={{ fontSize: '0.76rem', color: P.text, fontWeight: 700, marginTop: 1 }}>
                                    {b.vehicle_name || b.model || 'Assigned'}
                                </div>
                            </div>
                        </div>
                        <LicensePlate number={b.plate_number || b.number_plate} model={b.model} />
                    </div>
                </div>

                {/* Action */}
                {b.status === 'booked' && (
                    <button
                        onClick={() => onStatusChange(b.booking_id, 'in_transit')}
                        style={{
                            width: '100%', padding: '15px', border: 'none', borderRadius: 14,
                            cursor: 'pointer',
                            background: `linear-gradient(135deg, ${accentLine}, ${accentLine}CC)`,
                            color: '#fff', fontWeight: 800, fontSize: '0.88rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: `0 6px 20px -2px ${accentLine}50`,
                            transition: 'all 0.2s ease',
                            fontFamily: "'DM Sans', sans-serif",
                            letterSpacing: '0.01em',
                        }}
                    >
                        <Zap size={18} strokeWidth={2.5} />
                        Accept Trip
                        <ArrowRight size={15} style={{ opacity: 0.5 }} />
                    </button>
                )}
                {b.status === 'in_transit' && (
                    <button
                        onClick={() => onStatusChange(b.booking_id, 'completed')}
                        style={{
                            width: '100%', padding: '15px', border: 'none', borderRadius: 14,
                            cursor: 'pointer',
                            background: `linear-gradient(135deg, ${P.emerald}, ${P.emerald}CC)`,
                            color: '#fff', fontWeight: 800, fontSize: '0.88rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: `0 6px 20px -2px ${P.emerald}50`,
                            transition: 'all 0.2s ease',
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        <CheckCircle size={18} strokeWidth={2.5} />
                        Complete Trip
                    </button>
                )}
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
            background: cfg.bg, borderRadius: 14, padding: '14px 16px',
            marginBottom: 10, display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', border: `1px solid ${cfg.border}`,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: `${cfg.color}12`, border: `1px solid ${cfg.color}25`,
                    color: cfg.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Calendar size={17} />
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: P.text, marginBottom: 3 }}>
                        {leave.leave_type || 'Leave'}
                    </div>
                    <div style={{
                        fontSize: '0.7rem', color: P.textMuted,
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
                background: `${cfg.color}12`, border: `1px solid ${cfg.color}25`,
                color: cfg.color, fontSize: '0.58rem', fontWeight: 700,
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
        background: P.bgCard, borderRadius: 18,
        border: `1.5px dashed ${P.border}`,
    }}>
        <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: P.surface, border: `1px solid ${P.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px', color: P.textMuted,
        }}>
            <Icon size={24} />
        </div>
        <div style={{
            fontSize: '1rem', fontWeight: 800, color: P.textSec,
            marginBottom: 6, letterSpacing: '-0.01em',
        }}>
            {title}
        </div>
        <div style={{ fontSize: '0.8rem', color: P.textMuted, lineHeight: 1.6 }}>
            {subtitle}
        </div>
    </div>
);

/* ─── Loading ─────────────────────────────────────────────────── */
const LoadingState = ({ text }) => (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{
            width: 44, height: 44, margin: '0 auto 16px',
            borderRadius: 13, background: P.surface,
            border: `1px solid ${P.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Loader2 size={22} className="dp-spin" style={{ color: P.textMuted }} />
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: P.textSec, fontFamily: "'DM Sans', sans-serif" }}>
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
            setSuccess(`Trip marked as ${STATUS[status]?.label || status}`);
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

    const firstName = user?.name ? user.name.split(' ')[0] : 'Driver';

    return (
        <div style={{
            minHeight: '100vh',
            minHeight: '100dvh',
            background: P.bg,
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            color: P.text,
            position: 'relative',
            WebkitFontSmoothing: 'antialiased',
        }}>
            <style>{globalStyles}</style>

            {/* Ambient glows */}
            <div className="dp-breathe" style={{
                position: 'fixed', top: '-20%', right: '-15%',
                width: 500, height: 500, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(45,212,160,0.04) 0%, transparent 65%)',
                filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
            }} />
            <div className="dp-breathe" style={{
                position: 'fixed', bottom: '-15%', left: '-10%',
                width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(56,189,248,0.03) 0%, transparent 65%)',
                filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
                animationDelay: '2.5s',
            }} />

            {/* Toast */}
            <Toast type="error" message={error} onClose={() => setError('')} />
            <Toast type="success" message={success} onClose={() => setSuccess('')} />

            <div style={{ position: 'relative', zIndex: 1 }}>

                {/* ═══ HEADER ═══ */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 50,
                    background: 'rgba(14,17,23,0.82)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    borderBottom: `1px solid ${P.borderLight}`,
                }}>
                    <div style={{
                        maxWidth: 520, margin: '0 auto',
                        padding: '12px 18px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 11,
                                background: `linear-gradient(135deg, ${P.emerald}, ${P.emerald}CC)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 3px 12px ${P.emerald}30`,
                            }}>
                                <Car size={18} color="#fff" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '0.9rem', fontWeight: 800, color: P.text,
                                    letterSpacing: '-0.01em',
                                }}>
                                    RestPoint
                                </div>
                                <div style={{
                                    fontSize: '0.5rem', color: P.textMuted, fontWeight: 700,
                                    letterSpacing: '0.1em', textTransform: 'uppercase',
                                }}>
                                    Nairobi · Driver
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <button
                                onClick={() => loadBookings(true)}
                                disabled={refreshing}
                                style={{
                                    width: 38, height: 38, borderRadius: 11,
                                    background: P.surface, border: `1px solid ${P.border}`,
                                    color: P.textSec, display: 'flex',
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
                                    background: P.roseDark, border: `1px solid ${P.roseMid}`,
                                    color: P.rose, fontSize: '0.7rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                            >
                                <LogOut size={13} />
                                <span className="dp-logout-text">Exit</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main style={{ maxWidth: 520, margin: '0 auto', padding: '22px 18px 120px' }}>

                    {/* ═══ GREETING — warm & human ═══ */}
                    <div className="dp-fade-up" style={{ marginBottom: 24 }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                        }}>
                            <div style={{
                                padding: '5px 12px', borderRadius: 9,
                                background: `${P.emerald}12`, border: `1px solid ${P.emerald}25`,
                                color: P.emerald, fontSize: '0.7rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                <GreetingIcon size={13} />
                                {greeting.text}
                            </div>
                            <div style={{
                                padding: '5px 10px', borderRadius: 9,
                                background: P.surface, border: `1px solid ${P.border}`,
                                color: P.textSec, fontSize: '0.7rem', fontWeight: 650,
                            }}>
                                {greeting.timeStr} EAT
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h1 style={{
                                    margin: 0, fontSize: '1.8rem', fontWeight: 800,
                                    lineHeight: 1.1, letterSpacing: '-0.03em',
                                    color: P.text, marginBottom: 5,
                                }}>
                                    {firstName}
                                </h1>
                                <div style={{ fontSize: '0.78rem', color: P.textMuted, fontWeight: 500, marginBottom: 6 }}>
                                    {greeting.dateStr}
                                </div>
                                <div style={{
                                    fontSize: '0.76rem', color: P.textSec, fontWeight: 500,
                                    fontStyle: 'italic', opacity: 0.8,
                                }}>
                                    {greeting.subtext}
                                </div>
                            </div>

                            {/* Avatar */}
                            <div style={{
                                width: 52, height: 52, borderRadius: 16,
                                background: `linear-gradient(145deg, ${P.emerald}, ${P.ocean})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: '1rem', fontWeight: 800,
                                boxShadow: `0 6px 20px -2px ${P.emerald}30`,
                                flexShrink: 0, marginLeft: 16,
                                position: 'relative',
                            }}>
                                {initials}
                                <div style={{
                                    position: 'absolute', bottom: -1, right: -1,
                                    width: 15, height: 15, borderRadius: '50%',
                                    background: P.emerald, border: '2.5px solid ' + P.bg,
                                    boxShadow: `0 0 10px ${P.emerald}50`,
                                }} />
                            </div>
                        </div>

                        {/* Active trip alert */}
                        {activeBookings.length > 0 && (
                            <div style={{
                                marginTop: 16, padding: '11px 14px',
                                background: P.amberDark, border: `1px solid ${P.amberMid}`,
                                borderRadius: 12, display: 'flex', alignItems: 'center', gap: 9,
                            }}>
                                <span className="dp-accent-pulse" style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: P.amber, flexShrink: 0,
                                    boxShadow: `0 0 10px ${P.amber}50`,
                                }} />
                                <span style={{ fontSize: '0.78rem', color: P.amber, fontWeight: 650 }}>
                                    <strong>{activeBookings.length}</strong> trip{activeBookings.length !== 1 ? 's' : ''} need{activeBookings.length === 1 ? 's' : ''} your attention
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ═══ STATS — colored dark tiles ═══ */}
                    <div className="dp-fade-up" style={{
                        display: 'flex', gap: 8, marginBottom: 24,
                        animationDelay: '0.06s',
                    }}>
                        <StatTile
                            value={activeBookings.length} label="Active"
                            color={P.amber} darkBg={P.amberDark} glowBg={P.amberGlow}
                            icon={Zap} pulse={activeBookings.length > 0}
                        />
                        <StatTile
                            value={inTransitCount} label="En Route"
                            color={P.ocean} darkBg={P.oceanDark} glowBg={P.oceanGlow}
                            icon={Navigation}
                        />
                        <StatTile
                            value={completedCount} label="Done"
                            color={P.emerald} darkBg={P.emeraldDark} glowBg={P.emeraldGlow}
                            icon={CheckCircle}
                        />
                    </div>

                    {/* ═══ TABS ═══ */}
                    <div className="dp-fade-up" style={{
                        display: 'flex', gap: 3, marginBottom: 18,
                        padding: 3, background: P.bgCard,
                        borderRadius: 13, border: `1px solid ${P.border}`,
                        animationDelay: '0.09s',
                    }}>
                        {[
                            { key: 'bookings', label: 'Trips', icon: Route, count: activeBookings.length, color: P.emerald },
                            { key: 'leaves', label: 'Leaves', icon: Calendar, count: leaves.length, color: P.violet },
                        ].map(tab => {
                            const isActive = activeTab === tab.key;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        flex: 1, padding: '11px 6px', borderRadius: 11,
                                        background: isActive ? P.surface : 'transparent',
                                        border: isActive ? `1.5px solid ${tab.color}30` : '1.5px solid transparent',
                                        color: isActive ? P.text : P.textMuted,
                                        fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                        transition: 'all 0.2s ease',
                                        fontFamily: "'DM Sans', sans-serif",
                                    }}
                                >
                                    <Icon size={14} style={{ color: isActive ? tab.color : undefined }} />
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span style={{
                                            fontSize: '0.56rem', fontWeight: 800,
                                            padding: '1px 6px', borderRadius: 6,
                                            background: isActive ? `${tab.color}18` : 'rgba(255,255,255,0.03)',
                                            color: isActive ? tab.color : P.textMuted,
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
                                <LoadingState text="Loading your trips..." />
                            ) : activeBookings.length === 0 ? (
                                <EmptyState
                                    icon={Car}
                                    title="All Clear"
                                    subtitle="No active trips right now. You'll be notified when a new booking comes in."
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
                        borderTop: `1px solid ${P.borderLight}`, marginTop: 32,
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            marginBottom: 5,
                        }}>
                            <Shield size={11} style={{ color: P.textMuted }} />
                            <span style={{
                                fontSize: '0.62rem', color: P.textMuted, fontWeight: 600,
                                fontFamily: "'DM Sans', sans-serif",
                            }}>
                                Secure · Encrypted
                            </span>
                        </div>
                        <div style={{
                            fontSize: '0.52rem', color: P.textMuted, fontWeight: 500,
                            opacity: 0.5, fontFamily: "'DM Sans', sans-serif",
                        }}>
                            RestPoint v2.0 · {slug} · Nairobi
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DriverPortal;