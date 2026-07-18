import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Car, RefreshCw, CheckCircle, Phone, LogOut, Calendar,
    Clock, AlertCircle, Truck, Loader2, Zap, Navigation, ArrowRight,
    Route, Sun, Moon, CloudSun, User, Shield, Timer, CalendarDays
} from 'lucide-react';
import { useSocket } from '../../utils/context/socketContext';
import env from '../../utils/config/env';

const API_BASE_URL = env.FULL_API_URL;

const getTenantSlug = () =>
    localStorage.getItem('tenantSlug') || sessionStorage.getItem('tenantSlug') || '';

const getUser = () => {
    try { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : {}; }
    catch { return {}; }
};

const fmtTime = (d) =>
    d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--';

const fmtDateShort = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';

const genId = (id) => `BK-${String(id).padStart(4, '0')}`;

const getAuthHeaders = () => {
    const slug = getTenantSlug();
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const headers = { 'x-tenant-slug': slug };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

function getNairobiNow() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
}

/* ─── Relative date helper — the key improvement ─────────────── */
function relativeDate(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const now = getNairobiNow();

    const tStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const nStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = tStart - nStart;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const timeStr = target.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const fullDate = target.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (diffDays === 0) {
        return { label: 'Today', sub: timeStr, urgency: 'now', full: fullDate, color: '#FF6A28' };
    } else if (diffDays === 1) {
        return { label: 'Tomorrow', sub: timeStr, urgency: 'soon', full: fullDate, color: '#0A84FF' };
    } else if (diffDays === 2) {
        return { label: 'In 2 days', sub: fullDate + ' · ' + timeStr, urgency: 'upcoming', full: fullDate, color: '#71717A' };
    } else if (diffDays === 3) {
        return { label: 'In 3 days', sub: fullDate + ' · ' + timeStr, urgency: 'upcoming', full: fullDate, color: '#71717A' };
    } else if (diffDays === 4) {
        return { label: 'In 4 days', sub: fullDate + ' · ' + timeStr, urgency: 'upcoming', full: fullDate, color: '#71717A' };
    } else if (diffDays > 4 && diffDays <= 7) {
        return { label: `In ${diffDays} days`, sub: fullDate + ' · ' + timeStr, urgency: 'later', full: fullDate, color: '#A1A1AA' };
    } else if (diffDays > 7) {
        return { label: fullDate, sub: timeStr, urgency: 'later', full: fullDate, color: '#A1A1AA' };
    } else if (diffDays === -1) {
        return { label: 'Yesterday', sub: timeStr, urgency: 'past', full: fullDate, color: '#A1A1AA' };
    } else if (diffDays < -1) {
        return { label: `${Math.abs(diffDays)} days ago`, sub: fullDate, urgency: 'past', full: fullDate, color: '#D4D4D8' };
    }
    return { label: fullDate, sub: timeStr, urgency: 'later', full: fullDate, color: '#A1A1AA' };
}

/* ─── Get the best date field from a booking ──────────────────── */
function getTripDate(b) {
    return b.scheduled_date || b.pickup_date || b.booking_date || b.date || b.created_at || null;
}

const useGreeting = () => {
    const [now, setNow] = useState(() => getNairobiNow());
    useEffect(() => {
        const i = setInterval(() => setNow(getNairobiNow()), 20000);
        return () => clearInterval(i);
    }, []);

    const h = now.getHours();
    let text, icon, sub;
    if (h >= 5 && h < 12) { text = 'Good Morning'; icon = Sun; sub = 'Rise and drive safe today'; }
    else if (h >= 12 && h < 14) { text = 'Good Afternoon'; icon = Sun; sub = 'Hope the roads are kind'; }
    else if (h >= 14 && h < 17) { text = 'Good Afternoon'; icon = CloudSun; sub = 'Almost there, stay strong'; }
    else if (h >= 17 && h < 20) { text = 'Good Evening'; icon = Moon; sub = 'Heading home soon?'; }
    else if (h >= 20 && h < 23) { text = 'Good Evening'; icon = Moon; sub = 'Long day? Rest well'; }
    else { text = 'Working Late'; icon = Moon; sub = 'Take care on the night road'; }

    return {
        text, icon, sub,
        timeStr: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        dateStr: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
        dayNum: now.getDate(),
        monthShort: now.toLocaleDateString('en-US', { month: 'short' }),
        weekdayShort: now.toLocaleDateString('en-US', { weekday: 'short' }),
    };
};

/* ─── PALETTE ─────────────────────────────────────────────────── */
const T = {
    bg: '#FFFFFF',
    card: '#111113',
    raised: '#1C1C1F',
    border: '#2C2C30',
    text: '#FFFFFF',
    textSec: '#A1A1AA',
    textDim: '#63636E',
    accent: '#FF6A28',
    green: '#30D158',
    blue: '#0A84FF',
    amber: '#FFD60A',
    rose: '#FF453A',
    violet: '#BF5AF2',
    surfaceBg: '#F8F8FA',
    divider: '#EDEDF0',
    textDark: '#18181B',
    textMuted: '#71717A',
    textLight: '#A1A1AA',
};

const STATUS = {
    booked: { label: 'Booked', color: T.amber, dot: T.amber },
    in_transit: { label: 'In Transit', color: T.blue, dot: T.blue },
    completed: { label: 'Completed', color: T.green, dot: T.green },
    cancelled: { label: 'Cancelled', color: T.rose, dot: T.rose },
    postponed: { label: 'Postponed', color: T.violet, dot: T.violet },
};

const LEAVE = {
    approved: { color: T.green, label: 'Approved' },
    rejected: { color: T.rose, label: 'Rejected' },
    pending: { color: T.amber, label: 'Pending' },
};

/* ─── Animations ──────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,500&display=swap');

@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.25;transform:scale(.65)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes toastIn{from{opacity:0;transform:translateY(-10px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(255,106,40,0)}50%{box-shadow:0 0 0 8px rgba(255,106,40,.1)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}

*{-webkit-tap-highlight-color:transparent;box-sizing:border-box;margin:0;padding:0}
.a-up{animation:up .4s cubic-bezier(.22,1,.36,1) forwards;opacity:0}
.a-spin{animation:spin .7s linear infinite}
.a-pulse{animation:pulse 1.4s ease-in-out infinite}
.a-toast{animation:toastIn .3s ease forwards}
.a-glow{animation:glow 2s ease-in-out infinite}
input,select,textarea,button{font-family:inherit}
::-webkit-scrollbar{width:0;display:none}
`;

/* ─── Toast ───────────────────────────────────────────────────── */
const Toast = ({ type, message, onClose }) => {
    if (!message) return null;
    const err = type === 'error';
    const c = err ? T.rose : T.green;
    const bg = err ? '#3A1515' : '#153A1E';
    const Icon = err ? AlertCircle : CheckCircle;
    useEffect(() => { const t = setTimeout(() => onClose?.(), 3200); return () => clearTimeout(t); }, [message, onClose]);
    return (
        <div className="a-toast" style={{
            position: 'fixed', top: 14, left: 14, right: 14, zIndex: 9999,
            padding: '13px 16px', borderRadius: 14, background: bg,
            border: `1px solid ${c}30`, color: c, fontSize: '.84rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 9,
            boxShadow: '0 12px 40px rgba(0,0,0,.35)',
            fontFamily: "'DM Sans',sans-serif", maxWidth: 400, margin: '0 auto',
        }}>
            <Icon size={17} strokeWidth={2.5} />
            <span style={{ flex: 1 }}>{message}</span>
        </div>
    );
};

/* ─── Plate ───────────────────────────────────────────────────── */
const Plate = ({ number, model }) => {
    if (!number) return null;
    const n = number.replace(/\s+/g, '').toUpperCase();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{
                background: '#E8ECF0', border: '1.5px solid #94A3B8',
                borderRadius: 5, padding: '3px 10px', position: 'relative',
                boxShadow: '0 1px 3px rgba(0,0,0,.12)',
            }}>
                {[['t', 'l'], ['t', 'r'], ['b', 'l'], ['b', 'r']].map(([v, h], i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        [v === 't' ? 'top' : 'bottom']: 3, [h === 'l' ? 'left' : 'right']: 4,
                        width: 3, height: 3, borderRadius: '50%', background: '#94A3B8',
                    }} />
                ))}
                <div style={{
                    fontFamily: "Arial,sans-serif", fontSize: '.76rem',
                    fontWeight: 900, color: '#1E293B', letterSpacing: '.1em',
                    textAlign: 'center', minWidth: 44,
                }}>{n}</div>
            </div>
            {model && <span style={{ fontSize: '.55rem', color: T.textDim, fontWeight: 600 }}>{model}</span>}
        </div>
    );
};

/* ─── Status pill ─────────────────────────────────────────────── */
const Pill = ({ status }) => {
    const s = STATUS[status] || { label: status || '?', color: T.textDim, dot: T.textDim };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 11px', borderRadius: 100,
            background: `${s.color}18`, border: `1px solid ${s.color}25`,
            color: s.color, fontSize: '.6rem', fontWeight: 700,
            letterSpacing: '.05em', textTransform: 'uppercase',
        }}>
            <span style={{
                width: 5, height: 5, borderRadius: '50%', background: s.dot,
                boxShadow: `0 0 6px ${s.dot}50`,
                className: status === 'in_transit' ? 'a-pulse' : undefined,
            }} />
            {s.label}
        </span>
    );
};

/* ─── Stat card ───────────────────────────────────────────────── */
const Stat = ({ value, label, color, icon: Icon, pulse }) => (
    <div style={{
        flex: 1, padding: '20px 8px', textAlign: 'center',
        background: T.card, borderRadius: 18,
        border: `1px solid ${T.border}`,
        position: 'relative',
    }}>
        <div style={{
            width: 42, height: 42, borderRadius: 13,
            background: `${color}14`, border: `1px solid ${color}22`,
            color, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 13px', position: 'relative',
        }}>
            <Icon size={18} strokeWidth={2} />
            {pulse && (
                <span className="a-pulse" style={{
                    position: 'absolute', top: -2, right: -2,
                    width: 10, height: 10, borderRadius: '50%',
                    background: color, border: '2.5px solid ' + T.card,
                }} />
            )}
        </div>
        <div style={{
            fontSize: '1.75rem', fontWeight: 900, color: T.text,
            lineHeight: 1, marginBottom: 6,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-.04em',
        }}>{value}</div>
        <div style={{
            fontSize: '.5rem', color: T.textDim, fontWeight: 700,
            letterSpacing: '.14em', textTransform: 'uppercase',
        }}>{label}</div>
    </div>
);

/* ─── Date badge — the new prominent date display ─────────────── */
const DateBadge = ({ booking }) => {
    const dateStr = getTripDate(booking);
    const rel = relativeDate(dateStr);
    if (!rel) return null;

    const isUrgent = rel.urgency === 'now';
    const isSoon = rel.urgency === 'soon';
    const isPast = rel.urgency === 'past';

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            background: isUrgent ? `${T.accent}12` : isSoon ? `${T.blue}10` : T.raised,
            borderRadius: 12,
            border: `1px solid ${isUrgent ? T.accent + '20' : isSoon ? T.blue + '18' : T.border}`,
            marginBottom: 14,
        }}>
            <div style={{
                width: 38, height: 38, borderRadius: 11,
                background: isUrgent ? `${T.accent}18` : isSoon ? `${T.blue}15` : `${T.textDim}10`,
                border: `1px solid ${isUrgent ? T.accent + '25' : isSoon ? T.blue + '20' : T.border}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
            }}>
                {dateStr && (
                    <>
                        <span style={{
                            fontSize: '.5rem', fontWeight: 700, color: rel.color,
                            textTransform: 'uppercase', lineHeight: 1, letterSpacing: '.05em',
                        }}>
                            {new Date(dateStr).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span style={{
                            fontSize: '.95rem', fontWeight: 900, color: rel.color,
                            lineHeight: 1.1,
                        }}>
                            {new Date(dateStr).getDate()}
                        </span>
                    </>
                )}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontSize: '.82rem', fontWeight: 800, color: rel.color, marginBottom: 2,
                    display: 'flex', alignItems: 'center', gap: 6,
                }}>
                    {isUrgent && <span className="a-pulse" style={{
                        width: 6, height: 6, borderRadius: '50%', background: T.accent,
                        boxShadow: `0 0 8px ${T.accent}50`, flexShrink: 0,
                    }} />}
                    {rel.label}
                </div>
                <div style={{ fontSize: '.68rem', color: T.textDim, fontWeight: 500 }}>{rel.sub}</div>
            </div>
            {isUrgent && (
                <div style={{
                    padding: '4px 9px', borderRadius: 7,
                    background: `${T.accent}20`, border: `1px solid ${T.accent}25`,
                    color: T.accent, fontSize: '.52rem', fontWeight: 800,
                    letterSpacing: '.06em', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: 4,
                }}>
                    <Timer size={9} /> Due
                </div>
            )}
            {isSoon && (
                <div style={{
                    padding: '4px 9px', borderRadius: 7,
                    background: `${T.blue}15`, border: `1px solid ${T.blue}20`,
                    color: T.blue, fontSize: '.52rem', fontWeight: 800,
                    letterSpacing: '.06em', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: 4,
                }}>
                    <CalendarDays size={9} /> Soon
                </div>
            )}
            {isPast && (
                <div style={{
                    padding: '4px 9px', borderRadius: 7,
                    background: `${T.textDim}10`, border: `1px solid ${T.border}`,
                    color: T.textDim, fontSize: '.52rem', fontWeight: 800,
                    letterSpacing: '.06em', textTransform: 'uppercase',
                }}>
                    Past
                </div>
            )}
        </div>
    );
};

/* ─── Trip card ───────────────────────────────────────────────── */
const TripCard = ({ booking, onStatusChange, i }) => {
    const b = booking;
    const sc = STATUS[b.status] || {};
    const accent = sc.color || T.accent;

    return (
        <div className="a-up" style={{
            background: T.card, borderRadius: 22,
            marginBottom: 14, overflow: 'hidden',
            border: `1px solid ${T.border}`,
            animationDelay: `${(i || 0) * .05}s`,
            boxShadow: '0 2px 16px rgba(0,0,0,.07)',
        }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}50)` }} />
            <div style={{ padding: '18px 18px 20px' }}>

                {/* header row */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 4,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 11,
                            background: `${accent}14`, border: `1px solid ${accent}20`,
                            color: accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Truck size={17} strokeWidth={2} />
                        </div>
                        <div>
                            <div style={{
                                color: T.text, fontSize: '.84rem', fontWeight: 800,
                                fontFamily: "'SF Mono','Fira Code',monospace", letterSpacing: '.02em',
                            }}>{genId(b.booking_id)}</div>
                            <div style={{ fontSize: '.58rem', color: T.textDim, marginTop: 1, fontWeight: 500 }}>
                                Created {fmtDateShort(b.created_at)} at {fmtTime(b.created_at)}
                            </div>
                        </div>
                    </div>
                    <Pill status={b.status} />
                </div>

                {/* ─── DATE BADGE — prominent ─── */}
                <DateBadge booking={b} />

                {/* client */}
                <div style={{
                    marginBottom: 14, padding: '13px 15px',
                    background: T.raised, borderRadius: 14,
                    border: `1px solid ${T.border}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.46rem', color: T.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 3 }}>Client</div>
                        <div style={{ fontWeight: 800, fontSize: '.96rem', color: T.text, marginBottom: 3 }}>
                            {b.client_name}
                        </div>
                        {b.client_phone && (
                            <div style={{
                                fontSize: '.74rem', color: T.textSec,
                                display: 'flex', alignItems: 'center', gap: 5,
                            }}>
                                <Phone size={11} style={{ opacity: .5 }} /> {b.client_phone}
                            </div>
                        )}
                    </div>
                    <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: `${accent}10`, border: `1px solid ${accent}15`,
                        color: accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginLeft: 12,
                    }}>
                        <User size={15} />
                    </div>
                </div>

                {/* route */}
                <div style={{
                    marginBottom: 14, padding: '14px',
                    background: T.raised, borderRadius: 14,
                    border: `1px solid ${T.border}`,
                }}>
                    <div style={{ display: 'flex', gap: 11 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 1 }}>
                            <div style={{
                                width: 16, height: 16, borderRadius: '50%',
                                background: `${T.rose}14`, border: '1.5px solid ' + `${T.rose}28`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.rose }} />
                            </div>
                            <div style={{
                                width: 1.5, flex: 1, minHeight: 28, margin: '4px 0',
                                background: `repeating-linear-gradient(to bottom,${T.border} 0px,${T.border} 3px,transparent 3px,transparent 7px)`,
                            }} />
                            <div style={{
                                width: 16, height: 16, borderRadius: '50%',
                                background: `${T.green}14`, border: '1.5px solid ' + `${T.green}28`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.green }} />
                            </div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
                            <div>
                                <div style={{ fontSize: '.46rem', color: T.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 2 }}>Pickup</div>
                                <div style={{ fontSize: '.8rem', color: T.text, fontWeight: 600, lineHeight: 1.3 }}>{b.from_location || b.destination || 'N/A'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '.46rem', color: T.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 2 }}>Destination</div>
                                <div style={{ fontSize: '.8rem', color: T.text, fontWeight: 600, lineHeight: 1.3 }}>{b.destination || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ height: 1, background: T.border, margin: '13px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 9,
                                background: `${accent}10`, border: `1px solid ${accent}14`,
                                color: accent,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Car size={14} />
                            </div>
                            <div>
                                <div style={{ fontSize: '.44rem', color: T.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em' }}>Vehicle</div>
                                <div style={{ fontSize: '.76rem', color: T.text, fontWeight: 700, marginTop: 1 }}>{b.vehicle_name || b.model || 'Assigned'}</div>
                            </div>
                        </div>
                        <Plate number={b.plate_number || b.number_plate} model={b.model} />
                    </div>
                </div>

                {/* action buttons */}
                {b.status === 'booked' && (
                    <button onClick={() => onStatusChange(b.booking_id, 'in_transit')} className="a-glow" style={{
                        width: '100%', padding: '15px', border: 'none', borderRadius: 14,
                        cursor: 'pointer',
                        background: `linear-gradient(135deg, ${T.accent}, #E05520)`,
                        color: '#FFFFFF', fontWeight: 800, fontSize: '.88rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: `0 6px 24px -4px ${T.accent}40`,
                        transition: 'all .15s', fontFamily: "'DM Sans',sans-serif",
                    }}>
                        <Zap size={17} strokeWidth={2.5} /> Accept Trip
                        <ArrowRight size={14} style={{ opacity: .5 }} />
                    </button>
                )}
                {b.status === 'in_transit' && (
                    <button onClick={() => onStatusChange(b.booking_id, 'completed')} style={{
                        width: '100%', padding: '15px', border: 'none', borderRadius: 14,
                        cursor: 'pointer',
                        background: `linear-gradient(135deg, ${T.green}, #22A844)`,
                        color: '#FFFFFF', fontWeight: 800, fontSize: '.88rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: `0 6px 24px -4px ${T.green}35`,
                        transition: 'all .15s', fontFamily: "'DM Sans',sans-serif",
                    }}>
                        <CheckCircle size={17} strokeWidth={2.5} /> Complete Trip
                    </button>
                )}
            </div>
        </div>
    );
};

/* ─── Leave card ──────────────────────────────────────────────── */
const LeaveCard = ({ leave }) => {
    const s = (leave.status || 'pending').toLowerCase();
    const c = LEAVE[s] || LEAVE.pending;

    const startDate = leave.start_date ? new Date(leave.start_date) : null;
    const endDate = leave.end_date ? new Date(leave.end_date) : null;
    const now = getNairobiNow();
    const relStart = relativeDate(leave.start_date);

    const daysCount = startDate && endDate
        ? Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
        : null;

    return (
        <div style={{
            background: T.card, borderRadius: 18, padding: '16px 18px',
            marginBottom: 10, display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', border: `1px solid ${T.border}`,
            boxShadow: '0 1px 8px rgba(0,0,0,.05)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `${c.color}12`, border: `1px solid ${c.color}20`,
                    color: c.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Calendar size={17} />
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '.86rem', color: T.text, marginBottom: 3 }}>
                        {leave.leave_type || 'Leave'}
                    </div>
                    <div style={{ fontSize: '.66rem', color: T.textDim, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={10} />
                        {startDate ? startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                        {' — '}
                        {endDate ? endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        {daysCount && daysCount > 0 && (
                            <span style={{
                                padding: '1px 6px', borderRadius: 5,
                                background: `${c.color}12`, color: c.color,
                                fontSize: '.56rem', fontWeight: 700,
                            }}>{daysCount}d</span>
                        )}
                    </div>
                    {relStart && (
                        <div style={{ fontSize: '.6rem', color: relStart.color, fontWeight: 600, marginTop: 2 }}>
                            {relStart.label}
                        </div>
                    )}
                </div>
            </div>
            <span style={{
                padding: '4px 12px', borderRadius: 100,
                background: `${c.color}12`, border: `1px solid ${c.color}22`,
                color: c.color, fontSize: '.56rem', fontWeight: 700,
                letterSpacing: '.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
            }}>{c.label}</span>
        </div>
    );
};

/* ─── Empty state ─────────────────────────────────────────────── */
const Empty = ({ icon: Icon, title, sub }) => (
    <div style={{
        textAlign: 'center', padding: '64px 28px',
        background: T.card, borderRadius: 22,
        border: `1px dashed ${T.border}`,
    }}>
        <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: T.raised, border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px', color: T.textDim,
        }}><Icon size={24} /></div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: T.textSec, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: '.78rem', color: T.textDim, lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>{sub}</div>
    </div>
);

const Loading = ({ text }) => (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{
            width: 44, height: 44, margin: '0 auto 16px',
            borderRadius: 14, background: T.card, border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,.05)',
        }}><Loader2 size={20} className="a-spin" style={{ color: T.accent }} /></div>
        <div style={{ fontSize: '.82rem', fontWeight: 600, color: T.textMuted, fontFamily: "'DM Sans',sans-serif" }}>{text}</div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
const DriverPortal = () => {
    const navigate = useNavigate();
    const { socket, connected } = useSocket();
    const [bookings, setBookings] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loadingB, setLoadingB] = useState(true);
    const [loadingL, setLoadingL] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tab, setTab] = useState('bookings');
    const [refreshing, setRefreshing] = useState(false);

    const slug = getTenantSlug();
    const user = getUser();
    const g = useGreeting();
    const GI = g.icon;

    const loadB = useCallback(async (silent = false) => {
        if (silent) setRefreshing(true); else setLoadingB(true);
        setError('');
        try {
            const r = await fetch(`${API_BASE_URL}/hearse-bookings?t=${Date.now()}`, { headers: getAuthHeaders() });
            const t = await r.text();
            try {
                const d = JSON.parse(t);
                if (d.status === 'success' || d.bookings) setBookings(d.bookings || []);
                else setError(d.message || 'Failed to load');
            } catch { setError('Invalid response'); }
        } catch (e) { setError(e.message || 'Network error'); }
        finally { setLoadingB(false); setRefreshing(false); }
    }, []);

    const loadL = useCallback(async () => {
        setLoadingL(true);
        try {
            const h = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
            const r = await fetch(`${API_BASE_URL}/leaves/my-leaves`, { headers: h });
            const d = await r.json();
            setLeaves(d?.leaves || d?.data || []);
        } catch { setLeaves([]); }
        finally { setLoadingL(false); }
    }, []);

    useEffect(() => {
        if (!slug || slug === 'default') { setError('No tenant configured.'); return; }
        loadB(); loadL();
    }, [slug, loadB, loadL]);

    // Real-time socket updates for bookings — live UI updates
    useEffect(() => {
        if (!socket || !connected) return;

        const handleNewBooking = (data) => {
            console.log('🔔 New booking received:', data);
            // Add the new booking to state instantly if it has booking data
            if (data.booking) {
                setBookings(prev => [data.booking, ...prev]);
            } else {
                loadB(true);
            }
            setRefreshing(false);
        };

        const handleStatusUpdate = (data) => {
            console.log('🔔 Booking status updated:', data);
            // Update the booking in state instantly without reload
            if (data.booking_id && data.status) {
                setBookings(prev => prev.map(b =>
                    b.booking_id === data.booking_id
                        ? { ...b, status: data.status, ...(data.booking || {}) }
                        : b
                ));
            } else {
                loadB(true);
            }
            setRefreshing(false);
        };

        const handleBookingPostponed = (data) => {
            console.log('🔔 Booking postponed:', data);
            loadB(true);
        };

        const handleHearseRegistered = (data) => {
            console.log('🔔 New hearse registered:', data);
        };

        socket.on('new_booking', handleNewBooking);
        socket.on('booking_status_updated', handleStatusUpdate);
        socket.on('booking_postponed', handleBookingPostponed);
        socket.on('hearse_registered', handleHearseRegistered);

        return () => {
            socket.off('new_booking', handleNewBooking);
            socket.off('booking_status_updated', handleStatusUpdate);
            socket.off('booking_postponed', handleBookingPostponed);
            socket.off('hearse_registered', handleHearseRegistered);
        };
    }, [loadB, socket, connected]);

    const changeStatus = async (id, s) => {
        try {
            const h = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
            const r = await fetch(`${API_BASE_URL}/hearse-bookings/${id}/status`, { method: 'PUT', headers: h, body: JSON.stringify({ status: s }) });
            if (!r.ok) throw new Error();
            setSuccess(`Trip ${STATUS[s]?.label || s}`);
            setTimeout(() => setSuccess(''), 3000);
            loadB(true);
        } catch { setError('Failed to update.'); setTimeout(() => setError(''), 3500); }
    };

    const logout = () => {
        localStorage.removeItem('authToken'); localStorage.removeItem('user');
        localStorage.removeItem('tenantSlug'); localStorage.removeItem('refreshToken');
        sessionStorage.clear(); navigate('/login');
    };

    const active = bookings.filter(b => !['completed', 'cancelled', 'postponed'].includes(b.status));
    const transit = bookings.filter(b => b.status === 'in_transit').length;
    const done = bookings.filter(b => b.status === 'completed').length;
    const ini = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'DR';
    const first = user?.name ? user.name.split(' ')[0] : 'Driver';

    return (
        <div style={{
            minHeight: '100vh', minHeight: '100dvh',
            background: T.bg,
            fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
            color: T.textDark, WebkitFontSmoothing: 'antialiased',
        }}>
            <style>{css}</style>
            <Toast type="error" message={error} onClose={() => setError('')} />
            <Toast type="success" message={success} onClose={() => setSuccess('')} />

            {/* ─── HEADER ─── */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(255,255,255,.88)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid ' + T.divider,
            }}>
                <div style={{
                    maxWidth: 520, margin: '0 auto', padding: '12px 18px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 11,
                            background: T.card,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 10px rgba(0,0,0,.1)',
                        }}>
                            <Car size={16} color={T.accent} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={{ fontSize: '.9rem', fontWeight: 900, color: T.textDark, letterSpacing: '-.01em' }}>RestPoint</div>
                            <div style={{ fontSize: '.46rem', color: T.textLight, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase' }}>Driver Portal</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button onClick={() => loadB(true)} disabled={refreshing} style={{
                            width: 38, height: 38, borderRadius: 11,
                            background: T.surfaceBg, border: '1px solid ' + T.divider,
                            color: T.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                        }}>
                            <RefreshCw size={14} className={refreshing ? 'a-spin' : ''} />
                        </button>
                        <button onClick={logout} style={{
                            padding: '8px 14px', borderRadius: 11,
                            background: T.surfaceBg, border: '1px solid rgba(255,69,58,.12)',
                            color: T.rose, fontSize: '.68rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                        }}>
                            <LogOut size={12} /><span>Exit</span>
                        </button>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: 520, margin: '0 auto', padding: '24px 18px 120px' }}>

                {/* ─── GREETING SECTION ─── */}
                <div className="a-up" style={{ marginBottom: 26 }}>
                    {/* date pill + time pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
                        <div style={{
                            padding: '5px 11px', borderRadius: 9,
                            background: T.surfaceBg, border: '1px solid ' + T.divider,
                            color: T.accent, fontSize: '.66rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: 5,
                        }}>
                            <GI size={12} />{g.text}
                        </div>
                        <div style={{
                            padding: '5px 10px', borderRadius: 9,
                            background: T.surfaceBg, border: '1px solid ' + T.divider,
                            color: T.textMuted, fontSize: '.66rem', fontWeight: 650,
                        }}>
                            {g.timeStr}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{
                                margin: 0, fontSize: '1.9rem', fontWeight: 900,
                                lineHeight: 1.1, letterSpacing: '-.04em', color: T.textDark, marginBottom: 6,
                            }}>{first}</h1>
                            <div style={{ fontSize: '.78rem', color: T.textMuted, fontWeight: 500, marginBottom: 2 }}>
                                {g.dateStr}
                            </div>
                            <div style={{ fontSize: '.72rem', color: T.textLight, fontWeight: 500, fontStyle: 'italic', opacity: .9 }}>
                                {g.sub}
                            </div>
                        </div>

                        {/* avatar with today's date */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 14 }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: 18,
                                background: `linear-gradient(145deg, ${T.accent}, #E05520)`,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                color: '#FFFFFF', boxShadow: `0 6px 22px ${T.accent}28`,
                                position: 'relative',
                            }}>
                                <span style={{ fontSize: '.42rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', opacity: .85, lineHeight: 1 }}>
                                    {g.monthShort}
                                </span>
                                <span style={{ fontSize: '1.3rem', fontWeight: 900, lineHeight: 1.1, marginTop: -1 }}>
                                    {g.dayNum}
                                </span>
                                <div style={{
                                    position: 'absolute', bottom: -2, right: -2,
                                    width: 15, height: 15, borderRadius: '50%',
                                    background: T.green, border: '2.5px solid ' + T.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <span style={{ fontSize: '.5rem', fontWeight: 900, color: '#FFF', lineHeight: 1 }}>
                                        {g.weekdayShort.charAt(0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* active trips banner */}
                    {active.length > 0 && (
                        <div style={{
                            marginTop: 18, padding: '12px 15px',
                            background: T.card, border: `1px solid ${T.border}`,
                            borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10,
                            boxShadow: '0 2px 10px rgba(0,0,0,.06)',
                        }}>
                            <span className="a-pulse" style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: T.amber, flexShrink: 0,
                                boxShadow: `0 0 10px ${T.amber}50`,
                            }} />
                            <span style={{ fontSize: '.78rem', color: T.amber, fontWeight: 700 }}>
                                <strong>{active.length}</strong> trip{active.length !== 1 ? 's' : ''} waiting for you
                            </span>
                            <ArrowRight size={14} style={{ color: T.textDim, marginLeft: 'auto' }} />
                        </div>
                    )}
                </div>

                {/* ─── STATS ─── */}
                <div className="a-up" style={{
                    display: 'flex', gap: 10, marginBottom: 26, animationDelay: '.06s',
                }}>
                    <Stat value={active.length} label="Active" color={T.accent} icon={Zap} pulse={active.length > 0} />
                    <Stat value={transit} label="En Route" color={T.blue} icon={Navigation} />
                    <Stat value={done} label="Done" color={T.green} icon={CheckCircle} />
                </div>

                {/* ─── TABS ─── */}
                <div className="a-up" style={{
                    display: 'flex', gap: 4, marginBottom: 18,
                    padding: 4, background: T.surfaceBg, borderRadius: 14,
                    border: '1px solid ' + T.divider,
                    animationDelay: '.09s',
                }}>
                    {[
                        { k: 'bookings', l: 'Trips', icon: Route, n: active.length, c: T.accent },
                        { k: 'leaves', l: 'Leaves', icon: Calendar, n: leaves.length, c: T.violet },
                    ].map(t => {
                        const on = tab === t.k;
                        const Icon = t.icon;
                        return (
                            <button key={t.k} onClick={() => setTab(t.k)} style={{
                                flex: 1, padding: '11px 6px', borderRadius: 11,
                                background: on ? T.card : 'transparent',
                                border: '1px solid transparent',
                                color: on ? T.text : T.textLight,
                                fontWeight: 700, fontSize: '.76rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                transition: 'all .2s', fontFamily: "'DM Sans',sans-serif",
                                boxShadow: on ? '0 2px 10px rgba(0,0,0,.1)' : 'none',
                            }}>
                                <Icon size={13} style={{ color: on ? t.c : undefined }} />
                                {t.l}
                                {t.n > 0 && (
                                    <span style={{
                                        fontSize: '.54rem', fontWeight: 800, padding: '1px 6px',
                                        borderRadius: 6, background: on ? `${t.c}20` : 'rgba(0,0,0,.04)',
                                        color: on ? t.c : T.textLight,
                                    }}>{t.n}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ─── CONTENT ─── */}
                <div className="a-up" style={{ animationDelay: '.12s' }}>
                    {tab === 'bookings' ? (
                        loadingB ? <Loading text="Loading trips..." /> :
                            active.length === 0 ? <Empty icon={Car} title="All Clear" sub="No active trips right now. You'll be notified when a new one is assigned." /> :
                                active.map((b, i) => <TripCard key={b.booking_id} booking={b} onStatusChange={changeStatus} i={i} />)
                    ) : (
                        loadingL ? <Loading text="Loading leaves..." /> :
                            leaves.length === 0 ? <Empty icon={Calendar} title="No Leaves" sub="No leave requests submitted yet." /> :
                                leaves.map((l, i) => (
                                    <div key={l.id || i} className="a-up" style={{ animationDelay: `${i * .04}s` }}>
                                        <LeaveCard leave={l} />
                                    </div>
                                ))
                    )}
                </div>

                {/* ─── FOOTER ─── */}
                <div style={{
                    textAlign: 'center', padding: '40px 0 0',
                    borderTop: '1px solid ' + T.divider, marginTop: 36,
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 5,
                    }}>
                        <Shield size={10} style={{ color: T.textLight }} />
                        <span style={{ fontSize: '.58rem', color: T.textLight, fontWeight: 600 }}>Secure · Encrypted</span>
                    </div>
                    <div style={{ fontSize: '.46rem', color: '#D4D4D8', fontWeight: 500 }}>
                        RestPoint v2.0 · {slug} · Nairobi
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DriverPortal;