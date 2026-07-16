import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Car, RefreshCw, CheckCircle, Phone, MapPin, LogOut, Calendar,
    Clock, AlertCircle, Truck, Loader2, Zap, Navigation, ArrowRight,
    Route, Sun, Moon, CloudSun, User, Shield, Star, Coffee, Flame, Wind, Eye
} from 'lucide-react';
import env from '../../config/env';

const API_BASE_URL = env.FULL_API_URL;

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

/* ─── Nairobi time ────────────────────────────────────────────── */
function getNairobiNow() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
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
    };
};

/* ─── Minimal dark palette ───────────────────────────────────── */
const T = {
    bg: '#0C0E12',
    card: '#14161C',
    raised: '#1A1D24',
    surface: '#1F2229',
    border: '#252830',
    borderHi: '#2E323C',
    text: '#E4E6EB',
    textSec: '#8B909A',
    textDim: '#51565F',
    accent: '#34D399',
    accentDim: '#1A3D2F',
    blue: '#60A5FA',
    blueDim: '#1A2E4A',
    amber: '#FBBF24',
    amberDim: '#3A2E0A',
    rose: '#F87171',
    roseDim: '#3A1515',
    violet: '#A78BFA',
    violetDim: '#2A1F4A',
};

/* ─── Status colors (only for small indicators) ───────────────── */
const STATUS = {
    booked: { label: 'Booked', color: T.amber, dot: '#FBBF24' },
    in_transit: { label: 'In Transit', color: T.blue, dot: '#60A5FA' },
    completed: { label: 'Completed', color: T.accent, dot: '#34D399' },
    cancelled: { label: 'Cancelled', color: T.rose, dot: '#F87171' },
    postponed: { label: 'Postponed', color: T.violet, dot: '#A78BFA' },
};

const LEAVE = {
    approved: { color: T.accent, dim: T.accentDim, label: 'Approved' },
    rejected: { color: T.rose, dim: T.roseDim, label: 'Rejected' },
    pending: { color: T.amber, dim: T.amberDim, label: 'Pending' },
};

/* ─── Animations ──────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.25;transform:scale(.65)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes toastIn{from{opacity:0;transform:translateY(-10px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}

*{-webkit-tap-highlight-color:transparent;box-sizing:border-box;margin:0;padding:0}
.a-up{animation:up .45s cubic-bezier(.22,1,.36,1) forwards;opacity:0}
.a-spin{animation:spin .75s linear infinite}
.a-pulse{animation:pulse 1.5s ease-in-out infinite}
.a-toast{animation:toastIn .3s ease forwards}

input,select,textarea,button{font-family:inherit}
`;

/* ─── Toast ───────────────────────────────────────────────────── */
const Toast = ({ type, message, onClose }) => {
    if (!message) return null;
    const err = type === 'error';
    const c = err ? T.rose : T.accent;
    const bg = err ? T.roseDim : T.accentDim;
    const Icon = err ? AlertCircle : CheckCircle;

    useEffect(() => {
        const t = setTimeout(() => onClose?.(), 3200);
        return () => clearTimeout(t);
    }, [message, onClose]);

    return (
        <div className="a-toast" style={{
            position: 'fixed', top: 14, left: 14, right: 14, zIndex: 9999,
            padding: '12px 16px', borderRadius: 12,
            background: bg, border: `1px solid ${c}25`,
            color: c, fontSize: '.84rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 9,
            boxShadow: '0 10px 30px rgba(0,0,0,.5)',
            fontFamily: "'DM Sans',sans-serif", maxWidth: 380, margin: '0 auto',
        }}>
            <Icon size={18} strokeWidth={2.5} />
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
                borderRadius: 4, padding: '3px 10px', position: 'relative',
                boxShadow: '0 1px 4px rgba(0,0,0,.3)',
            }}>
                {[['t', 'l'], ['t', 'r'], ['b', 'l'], ['b', 'r']].map(([v, h], i) => (
                    <div key={i} style={{
                        position: 'absolute', [v === 't' ? 'top' : 'bottom']: 3,
                        [h === 'l' ? 'left' : 'right']: 4,
                        width: 3, height: 3, borderRadius: '50%',
                        background: '#94A3B8', boxShadow: 'inset 0 .5px 1px rgba(0,0,0,.25)',
                    }} />
                ))}
                <div style={{
                    fontFamily: "Arial,sans-serif", fontSize: '.78rem',
                    fontWeight: 900, color: '#1E293B', letterSpacing: '.1em',
                    textAlign: 'center', minWidth: 46,
                }}>{n}</div>
            </div>
            {model && <span style={{ fontSize: '.56rem', color: T.textDim, fontWeight: 600 }}>{model}</span>}
        </div>
    );
};

/* ─── Status pill ─────────────────────────────────────────────── */
const Pill = ({ status }) => {
    const s = STATUS[status] || { label: status || '?', color: T.textDim, dot: T.textDim };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 11px', borderRadius: 100,
            background: `${s.color}10`, border: `1px solid ${s.color}20`,
            color: s.color, fontSize: '.6rem', fontWeight: 700,
            letterSpacing: '.04em', textTransform: 'uppercase',
        }}>
            <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: s.dot,
                boxShadow: `0 0 6px ${s.dot}40`,
                className: status === 'in_transit' ? 'a-pulse' : undefined,
            }} />
            {s.label}
        </span>
    );
};

/* ─── Stat ────────────────────────────────────────────────────── */
const Stat = ({ value, label, color, icon: Icon, pulse }) => (
    <div style={{
        flex: 1, padding: '16px 10px', textAlign: 'center',
        background: T.card, borderRadius: 14, border: `1px solid ${T.border}`,
        position: 'relative',
    }}>
        <div style={{
            width: 16, height: 16, borderRadius: '50%',
            background: `${T.rose}12`, border: `1.5px solid ${T.rose}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            <Icon size={16} strokeWidth={2} />
            {pulse && <span className="a-pulse" style={{
                position: 'absolute', top: -2, right: -2,
                width: 8, height: 8, borderRadius: '50%',
                background: color, border: '2px solid ' + T.card,
            }} />}
        </div>
        <div style={{
            fontSize: '1.5rem', fontWeight: 800, color: T.text,
            lineHeight: 1, marginBottom: 4,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-.03em',
        }}>{value}</div>
        <div style={{
            fontSize: '.54rem', color: T.textDim, fontWeight: 700,
            letterSpacing: '.1em', textTransform: 'uppercase',
        }}>{label}</div>
    </div>
);

/* ─── Trip card ───────────────────────────────────────────────── */
const TripCard = ({ booking, onStatusChange, i }) => {
    const b = booking;
    const sc = STATUS[b.status] || {};
    const accent = sc.color || T.accent;

    return (
        <div className="a-up" style={{
            background: T.card, borderRadius: 16,
            marginBottom: 12, overflow: 'hidden',
            border: `1px solid ${T.border}`,
            animationDelay: `${(i || 0) * .05}s`,
        }}>
            {/* thin accent line */}
            <div style={{ height: 2.5, background: accent, opacity: .7 }} />

            <div style={{ padding: '16px 16px 18px' }}>
                {/* header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 14,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 16, height: 16, borderRadius: '50%',
                            background: `${T.accent}12`, border: `1.5px solid ${T.accent}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <Truck size={16} strokeWidth={2} />
                        </div>
                        <div>
                            <div style={{
                                color: T.text, fontSize: '.8rem', fontWeight: 800,
                                fontFamily: "'SF Mono','Fira Code',monospace", letterSpacing: '.02em',
                            }}>{genId(b.booking_id)}</div>
                            <div style={{ fontSize: '.6rem', color: T.textDim, marginTop: 1 }}>
                                {fmtDate(b.created_at)} · {fmtTime(b.created_at)}
                            </div>
                        </div>
                    </div>
                    <Pill status={b.status} />
                </div>

                {/* client */}
                <div style={{
                    marginBottom: 12, padding: '11px 13px',
                    background: T.raised, borderRadius: 11,
                    border: `1px solid ${T.border}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '.95rem', color: T.text, marginBottom: 2 }}>
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
                        width: 34, height: 34, borderRadius: 50,
                        background: `${accent}10`, border: `1px solid ${accent}15`,
                        color: accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <User size={14} />
                    </div>
                </div>

                {/* route */}
                <div style={{
                    marginBottom: 12, padding: '13px',
                    background: T.raised, borderRadius: 11,
                    border: `1px solid ${T.border}`,
                }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', paddingTop: 1,
                        }}>
                            <div style={{
                                width: 16, height: 16, borderRadius: '50%',
                                background: `${T.rose}12`, border: '1.5px solid ${T.rose}30`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.rose }} />
                            </div>
                            <div style={{
                                width: 1.5, flex: 1, minHeight: 24, margin: '3px 0',
                                background: `repeating-linear-gradient(to bottom,${T.border} 0px,${T.border} 3px,transparent 3px,transparent 7px)`,
                            }} />
                            <div style={{
                                width: 16, height: 16, borderRadius: '50%',
                                background: `${T.accent}12`, border: '1.5px solid ${T.accent}30`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.accent }} />
                            </div>
                        </div>
                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            justifyContent: 'space-between', gap: 8,
                        }}>
                            <div>
                                <div style={{ fontSize: '.52rem', color: T.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 1 }}>Pickup</div>
                                <div style={{ fontSize: '.78rem', color: T.text, fontWeight: 600 }}>{b.from_location || b.destination || 'N/A'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '.52rem', color: T.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 1 }}>Destination</div>
                                <div style={{ fontSize: '.78rem', color: T.text, fontWeight: 600 }}>{b.destination || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ height: 1, background: T.border, margin: '10px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 7,
                                background: `${accent}08`, border: `1px solid ${accent}12`,
                                color: accent,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Car size={13} />
                            </div>
                            <div>
                                <div style={{ fontSize: '.48rem', color: T.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Vehicle</div>
                                <div style={{ fontSize: '.74rem', color: T.text, fontWeight: 700, marginTop: 1 }}>{b.vehicle_name || b.model || 'Assigned'}</div>
                            </div>
                        </div>
                        <Plate number={b.plate_number || b.number_plate} model={b.model} />
                    </div>
                </div>

                {/* action */}
                {b.status === 'booked' && (
                    <button onClick={() => onStatusChange(b.booking_id, 'in_transit')} style={{
                        width: '100%', padding: '14px', border: 'none', borderRadius: 12,
                        cursor: 'pointer', background: accent, color: '#0C0E12',
                        fontWeight: 800, fontSize: '.86rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        boxShadow: `0 4px 16px -2px ${accent}35`,
                        transition: 'all .15s', fontFamily: "'DM Sans',sans-serif",
                    }}>
                        <Zap size={17} strokeWidth={2.5} /> Accept Trip
                        <ArrowRight size={14} style={{ opacity: .4 }} />
                    </button>
                )}
                {b.status === 'in_transit' && (
                    <button onClick={() => onStatusChange(b.booking_id, 'completed')} style={{
                        width: '100%', padding: '14px', border: 'none', borderRadius: 12,
                        cursor: 'pointer', background: T.accent, color: '#0C0E12',
                        fontWeight: 800, fontSize: '.86rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        boxShadow: `0 4px 16px -2px ${T.accent}35`,
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
    return (
        <div style={{
            background: T.card, borderRadius: 12, padding: '13px 15px',
            marginBottom: 8, display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', border: `1px solid ${T.border}`,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${c.color}10`, border: `1px solid ${c.color}18`,
                    color: c.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Calendar size={16} />
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '.82rem', color: T.text, marginBottom: 2 }}>
                        {leave.leave_type || 'Leave'}
                    </div>
                    <div style={{ fontSize: '.68rem', color: T.textDim, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={10} />
                        {leave.start_date ? new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                        {' — '}
                        {leave.end_date ? new Date(leave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </div>
                </div>
            </div>
            <span style={{
                padding: '2px 10px', borderRadius: 100,
                background: `${c.color}10`, border: `1px solid ${c.color}18`,
                color: c.color, fontSize: '.56rem', fontWeight: 700,
                letterSpacing: '.04em', textTransform: 'uppercase',
            }}>{c.label}</span>
        </div>
    );
};

/* ─── Empty ───────────────────────────────────────────────────── */
const Empty = ({ icon: Icon, title, sub }) => (
    <div style={{
        textAlign: 'center', padding: '56px 24px',
        background: T.card, borderRadius: 16, border: `1px dashed ${T.border}`,
    }}>
        <div style={{
            width: 50, height: 50, borderRadius: '50%',
            background: T.raised, border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color: T.textDim,
        }}><Icon size={22} /></div>
        <div style={{ fontSize: '.95rem', fontWeight: 800, color: T.textSec, marginBottom: 5 }}>{title}</div>
        <div style={{ fontSize: '.78rem', color: T.textDim, lineHeight: 1.5 }}>{sub}</div>
    </div>
);

const Loading = ({ text }) => (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{
            width: 40, height: 40, margin: '0 auto 14px',
            borderRadius: 12, background: T.raised, border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Loader2 size={20} className="a-spin" style={{ color: T.textDim }} /></div>
        <div style={{ fontSize: '.82rem', fontWeight: 600, color: T.textSec, fontFamily: "'DM Sans',sans-serif" }}>{text}</div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
const DriverPortal = () => {
    const navigate = useNavigate();
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
            color: T.text, WebkitFontSmoothing: 'antialiased',
        }}>
            <style>{css}</style>
            <Toast type="error" message={error} onClose={() => setError('')} />
            <Toast type="success" message={success} onClose={() => setSuccess('')} />

            {/* header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(12,14,18,.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: `1px solid ${T.border}`,
            }}>
                <div style={{
                    maxWidth: 500, margin: '0 auto', padding: '11px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 9,
                            background: T.accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 2px 10px ${T.accent}25`,
                        }}>
                            <Car size={16} color="#0C0E12" strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={{ fontSize: '.86rem', fontWeight: 800, color: T.text, letterSpacing: '-.01em' }}>RestPoint</div>
                            <div style={{ fontSize: '.48rem', color: T.textDim, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>Nairobi · Driver</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <button onClick={() => loadB(true)} disabled={refreshing} style={{
                            width: 34, height: 34, borderRadius: 9,
                            background: T.raised, border: `1px solid ${T.border}`,
                            color: T.textSec, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                        }}>
                            <RefreshCw size={14} className={refreshing ? 'a-spin' : ''} />
                        </button>
                        <button onClick={logout} style={{
                            padding: '7px 12px', borderRadius: 9,
                            background: T.roseDim, border: `1px solid ${T.rose}20`,
                            color: T.rose, fontSize: '.68rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                        }}>
                            <LogOut size={12} /><span className="dp-logout-text">Exit</span>
                        </button>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px 110px' }}>

                {/* greeting */}
                <div className="a-up" style={{ marginBottom: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                        <div style={{
                            padding: '4px 10px', borderRadius: 8,
                            background: `${T.accent}10`, border: `1px solid ${T.accent}18`,
                            color: T.accent, fontSize: '.66rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: 5,
                        }}>
                            <GI size={12} />{g.text}
                        </div>
                        <div style={{
                            padding: '4px 9px', borderRadius: 8,
                            background: T.raised, border: `1px solid ${T.border}`,
                            color: T.textSec, fontSize: '.66rem', fontWeight: 650,
                        }}>
                            {g.timeStr} EAT
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{
                                margin: 0, fontSize: '1.7rem', fontWeight: 800,
                                lineHeight: 1.1, letterSpacing: '-.03em', color: T.text, marginBottom: 4,
                            }}>{first}</h1>
                            <div style={{ fontSize: '.74rem', color: T.textDim, fontWeight: 500, marginBottom: 4 }}>{g.dateStr}</div>
                            <div style={{ fontSize: '.72rem', color: T.textSec, fontWeight: 500, fontStyle: 'italic', opacity: .7 }}>{g.sub}</div>
                        </div>
                        <div style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: `linear-gradient(145deg,${T.accent},${T.accent}AA)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#0C0E12', fontSize: '.92rem', fontWeight: 800,
                            boxShadow: `0 4px 14px ${T.accent}20`,
                            flexShrink: 0, marginLeft: 14, position: 'relative',
                        }}>
                            {ini}
                            <div style={{
                                position: 'absolute', bottom: -1, right: -1,
                                width: 13, height: 13, borderRadius: '50%',
                                background: T.accent, border: '2px solid ' + T.bg,
                            }} />
                        </div>
                    </div>

                    {active.length > 0 && (
                        <div style={{
                            marginTop: 14, padding: '10px 13px',
                            background: T.amberDim, border: `1px solid ${T.amber}18`,
                            borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <span className="a-pulse" style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: T.amber, flexShrink: 0,
                                boxShadow: `0 0 8px ${T.amber}40`,
                            }} />
                            <span style={{ fontSize: '.74rem', color: T.amber, fontWeight: 650 }}>
                                <strong>{active.length}</strong> trip{active.length !== 1 ? 's' : ''} waiting
                            </span>
                        </div>
                    )}
                </div>

                {/* stats */}
                <div className="a-up" style={{
                    display: 'flex', gap: 7, marginBottom: 22, animationDelay: '.06s',
                }}>
                    <Stat value={active.length} label="Active" color={T.amber} icon={Zap} pulse={active.length > 0} />
                    <Stat value={transit} label="En Route" color={T.blue} icon={Navigation} />
                    <Stat value={done} label="Done" color={T.accent} icon={CheckCircle} />
                </div>

                {/* tabs */}
                <div className="a-up" style={{
                    display: 'flex', gap: 2, marginBottom: 16,
                    padding: 3, background: T.card, borderRadius: 12, border: `1px solid ${T.border}`,
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
                                flex: 1, padding: '10px 5px', borderRadius: 10,
                                background: on ? T.raised : 'transparent',
                                border: on ? `1px solid ${t.c}20` : '1px solid transparent',
                                color: on ? T.text : T.textDim,
                                fontWeight: 700, fontSize: '.74rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                transition: 'all .15s', fontFamily: "'DM Sans',sans-serif",
                            }}>
                                <Icon size={13} style={{ color: on ? t.c : undefined }} />
                                {t.l}
                                {t.n > 0 && (
                                    <span style={{
                                        fontSize: '.54rem', fontWeight: 800, padding: '1px 5px',
                                        borderRadius: 5, background: on ? `${t.c}12` : 'rgba(255,255,255,.02)',
                                        color: on ? t.c : T.textDim,
                                    }}>{t.n}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* content */}
                <div className="a-up" style={{ animationDelay: '.12s' }}>
                    {tab === 'bookings' ? (
                        loadingB ? <Loading text="Loading trips..." /> :
                            active.length === 0 ? <Empty icon={Car} title="All Clear" sub="No active trips. You'll be notified when one arrives." /> :
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

                {/* footer */}
                <div style={{
                    textAlign: 'center', padding: '32px 0 0',
                    borderTop: `1px solid ${T.border}`, marginTop: 28,
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4,
                    }}>
                        <Shield size={10} style={{ color: T.textDim }} />
                        <span style={{ fontSize: '.58rem', color: T.textDim, fontWeight: 600 }}>Secure · Encrypted</span>
                    </div>
                    <div style={{ fontSize: '.48rem', color: T.textDim, fontWeight: 500, opacity: .4 }}>
                        RestPoint v2.0 · {slug} · Nairobi
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DriverPortal;