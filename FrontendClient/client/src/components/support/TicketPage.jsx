import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../api/axios';
import env from '../../config/env';

// ============================================================
// REST POINT — Support Tickets Portal
// Full ticketing system with real-time responses
// ============================================================

const C = {
    ink: '#0F1117',
    bone: '#FCFAFA',
    bone2: '#F6F3F0',
    brass: '#9A7B5A',
    brassLight: '#B8966E',
    verdigris: '#3F5549',
    verdigrisDark: '#2E4036',
    verdigrisLight: '#5A7A68',
    line: '#E8E3DA',
    lineDark: '#2A2D35',
    gray: '#78736B',
    grayLight: '#B8B3AB',
    white: '#FFFFFF',
    error: '#D94A4A',
    success: '#3E8E5C',
    shadow: '0 4px 24px rgba(15,17,23,0.06)',
    shadowHover: '0 8px 32px rgba(15,17,23,0.10)',
    radius: '12px',
    radiusSm: '8px',
};

const STATUS_CONFIG = {
    open: { color: C.brass, bg: 'rgba(154,123,90,0.10)', label: 'Open', icon: '○' },
    in_progress: { color: C.verdigris, bg: 'rgba(63,85,73,0.10)', label: 'In Progress', icon: '◐' },
    resolved: { color: C.success, bg: 'rgba(62,142,92,0.10)', label: 'Resolved', icon: '✓' },
    closed: { color: C.gray, bg: 'rgba(120,115,107,0.10)', label: 'Closed', icon: '✕' },
};

const TYPE_CONFIG = {
    bug: { label: 'Bug Report', icon: '🐛' },
    feature: { label: 'Feature Request', icon: '💡' },
    help: { label: 'Need Help', icon: '🆘' },
    other: { label: 'Other', icon: '📋' },
};

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || env.API_GATEWAY_URL || 'http://localhost:8010';

function generateTicketNumber() {
    const prefix = 'RPT';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return d.toLocaleDateString('en-KE', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function TicketPage() {
    const navigate = useNavigate();
    const { slug } = useParams();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);
    const socketRef = useRef(null);
    const notificationTimer = useRef(null);
    const replyEndRef = useRef(null);
    const detailsRef = useRef(null);

    // New ticket form
    const [showNewTicket, setShowNewTicket] = useState(false);
    const [newTicketSubject, setNewTicketSubject] = useState('');
    const [newTicketMessage, setNewTicketMessage] = useState('');
    const [newTicketType, setNewTicketType] = useState('help');
    const [newTicketSubmitting, setNewTicketSubmitting] = useState(false);
    const [newTicketErrors, setNewTicketErrors] = useState({});

    const tenantSlug = slug || localStorage.getItem('tenantSlug') || 'system_shared';

    const showNotification = useCallback((msg, type = 'response') => {
        setNotification({ message: msg, type, time: Date.now() });
        if (notificationTimer.current) clearTimeout(notificationTimer.current);
        notificationTimer.current = setTimeout(() => setNotification(null), 5000);
    }, []);

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/support/tickets?tenant=' + tenantSlug, {
                headers: { 'x-tenant-slug': tenantSlug },
            });
            if (res.data?.success && Array.isArray(res.data.tickets)) {
                setTickets(res.data.tickets);
            } else if (Array.isArray(res.data)) {
                setTickets(res.data);
            }
        } catch (err) {
            console.warn('[Tickets] Failed to fetch:', err);
        } finally {
            setLoading(false);
        }
    }, [tenantSlug]);

    // Socket connection for real-time ticket updates
    useEffect(() => {
        const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
        const socket = io(SOCKET_URL, {
            auth: { token, tenantSlug },
            transports: ['websocket', 'polling'],
            reconnection: true,
        });

        socket.on('connect', () => {
            console.log('[TicketSocket] Connected');
            socket.emit('join-tenant', { tenantSlug, userId: 'ticket-page' });
        });

        socket.on('ticket_response', (data) => {
            console.log('[TicketSocket] Response received:', data);
            if (data.tenant_slug === tenantSlug || !data.tenant_slug) {
                showNotification(data.message || 'New response on your ticket');
                fetchTickets();
            }
        });

        socket.on('ticket_updated', (data) => {
            console.log('[TicketSocket] Ticket updated:', data);
            fetchTickets();
        });

        socket.on('disconnect', () => {
            console.log('[TicketSocket] Disconnected');
        });

        socketRef.current = socket;

        return () => {
            socket.off('ticket_response');
            socket.off('ticket_updated');
            socket.disconnect();
        };
    }, [tenantSlug, fetchTickets, showNotification]);

    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 30000);
        return () => clearInterval(interval);
    }, [fetchTickets]);

    useEffect(() => {
        if (replyEndRef.current) {
            replyEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedTicket]);

    const goHome = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (slug) {
            navigate(`/tenant/${slug}/all-deceased`);
        } else {
            navigate('/');
        }
    };

    const handleSelectTicket = (ticket) => {
        setSelectedTicket(ticket);
        setReplyText('');
    };

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicket) return;
        setReplying(true);
        try {
            await api.post('/support/tickets/' + selectedTicket.ticket_id + '/reply', {
                message: replyText.trim(),
                userType: 'tenant',
            }, {
                headers: { 'x-tenant-slug': tenantSlug },
            });
            setReplyText('');
            showNotification('Reply sent ✓', 'success');
            fetchTickets();
        } catch (err) {
            showNotification('Failed to send reply', 'error');
        } finally {
            setReplying(false);
        }
    };

    const handleNewTicketSubmit = async (e) => {
        e.preventDefault();
        const errors = {};
        if (!newTicketSubject.trim()) errors.subject = 'Subject is required';
        if (!newTicketMessage.trim()) errors.message = 'Message is required';
        if (newTicketMessage.trim().length < 10) errors.message = 'Message must be at least 10 characters';
        setNewTicketErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setNewTicketSubmitting(true);
        try {
            const userStr = localStorage.getItem('user');
            let userEmail = '';
            let userName = '';
            try {
                const user = JSON.parse(userStr || '{}');
                userEmail = user.email || user.Email || '';
                userName = user.full_name || user.fullName || user.name || '';
            } catch (e) { }

            const ticketNumber = generateTicketNumber();

            await api.post('/support/tickets', {
                type: newTicketType,
                subject: `[${ticketNumber}] ${newTicketSubject.trim()}`,
                message: newTicketMessage.trim(),
                ticket_number: ticketNumber,
                tenantName: localStorage.getItem('tenantName') || 'Unknown',
                userEmail,
                userName,
            }, {
                headers: { 'x-tenant-slug': tenantSlug },
            });

            showNotification(`Ticket ${ticketNumber} submitted! We'll respond shortly.`, 'success');
            setShowNewTicket(false);
            setNewTicketSubject('');
            setNewTicketMessage('');
            setNewTicketType('help');
            fetchTickets();
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to submit ticket', 'error');
        } finally {
            setNewTicketSubmitting(false);
        }
    };

    const getTicketNumber = (ticket) => {
        const match = ticket.subject?.match(/^\[([^\]]+)\]/);
        if (match) return match[1];
        return `#${(ticket.ticket_id || ticket.id || '').toString().slice(-6).toUpperCase()}`;
    };

    const cleanSubject = (subject) => {
        return subject?.replace(/^\[[^\]]+\]\s*/, '') || '';
    };

    // Stats
    const openCount = tickets.filter(t => (t.status || 'open') === 'open').length;
    const inProgressCount = tickets.filter(t => (t.status || 'open') === 'in_progress').length;
    const resolvedCount = tickets.filter(t => (t.status || 'open') === 'resolved').length;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; color: ${C.ink}; background: ${C.bone}; -webkit-font-smoothing: antialiased; }

        .tp-container { min-height: 100vh; display: flex; flex-direction: column; }
        .tp-wrap { max-width: 1200px; margin: 0 auto; padding: 0 clamp(1rem, 4vw, 2rem); width: 100%; }

        .tp-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(252,250,250,0.92); backdrop-filter: blur(16px) saturate(1.4);
          border-bottom: 1px solid ${C.line};
        }
        .tp-nav-inner { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; }
        .tp-logo {
          display: flex; align-items: center; gap: 0.6rem;
          font-weight: 700; font-size: 1.05rem; color: ${C.ink}; cursor: pointer;
          letter-spacing: -0.02em;
        }
        .tp-logo svg { flex-shrink: 0; }

        .tp-btn {
          display: inline-flex; align-items: center; gap: 0.45rem;
          padding: 0.6rem 1.2rem; font-size: 0.82rem; font-weight: 600;
          font-family: 'Inter', sans-serif;
          border: none; border-radius: ${C.radiusSm};
          cursor: pointer; transition: all 0.2s ease;
          letter-spacing: 0.01em; white-space: nowrap;
        }
        .tp-btn-primary { background: ${C.ink}; color: ${C.bone}; }
        .tp-btn-primary:hover { background: #1A1D24; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15,17,23,0.2); }
        .tp-btn-ghost { background: transparent; color: ${C.ink}; border: 1px solid ${C.line}; }
        .tp-btn-ghost:hover { background: ${C.bone2}; border-color: ${C.brass}; }
        .tp-btn-sm { padding: 0.45rem 0.9rem; font-size: 0.78rem; }
        .tp-btn-success { background: ${C.success}; color: white; }
        .tp-btn-success:hover { background: #2D7A48; transform: translateY(-1px); }

        .tp-notification {
          position: fixed; top: 68px; left: 50%; transform: translateX(-50%);
          z-index: 200; padding: 0.6rem 1.2rem;
          font-size: 0.82rem; font-weight: 500;
          border-radius: ${C.radiusSm};
          animation: tpSlideDown 0.3s ease;
          box-shadow: ${C.shadow};
          display: flex; align-items: center; gap: 0.5rem;
          max-width: min(90vw, 600px);
        }
        @keyframes tpSlideDown { from { transform: translateX(-50%) translateY(-20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
        @keyframes tpFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes tpSpin { to { transform: rotate(360deg); } }

        .tp-spinner {
          width: 20px; height: 20px;
          border: 2px solid ${C.line}; border-top: 2px solid ${C.brass};
          border-radius: 50%; animation: tpSpin 0.6s linear infinite;
          display: inline-block;
        }

        .tp-stat-card {
          background: ${C.white};
          border: 1px solid ${C.line};
          border-radius: ${C.radius};
          padding: 1rem 1.25rem;
          display: flex; align-items: center; gap: 0.75rem;
          transition: all 0.2s ease;
        }
        .tp-stat-card:hover { border-color: ${C.brass}; box-shadow: ${C.shadowHover}; }
        .tp-stat-dot {
          width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
        }
        .tp-stat-number { font-size: 1.5rem; font-weight: 700; color: ${C.ink}; line-height: 1; }
        .tp-stat-label { font-size: 0.75rem; color: ${C.gray}; font-weight: 500; }

        .tp-list { display: flex; flex-direction: column; gap: 0.35rem; }
        .tp-card {
          background: ${C.white};
          border: 1px solid ${C.line};
          border-radius: ${C.radius};
          padding: 1.1rem 1.25rem;
          cursor: pointer;
          transition: all 0.2s ease;
          animation: tpFadeIn 0.3s ease;
        }
        .tp-card:hover { border-color: ${C.brassLight}; box-shadow: ${C.shadow}; }
        .tp-card.active {
          border-color: ${C.brass};
          border-left: 3px solid ${C.brass};
          background: ${C.bone2};
        }

        .tp-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          display: inline-flex; align-items: center; gap: 0.3rem;
        }

        .tp-ticket-number {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: ${C.grayLight};
          letter-spacing: 0.02em;
        }

        .tp-detail {
          background: ${C.white};
          border: 1px solid ${C.line};
          border-radius: ${C.radius};
          overflow: hidden;
          animation: tpFadeIn 0.3s ease;
          position: sticky; top: 80px;
        }
        .tp-detail-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid ${C.line};
          background: ${C.bone2};
        }
        .tp-detail-body { padding: 1.5rem; }
        .tp-detail-footer { padding: 1.25rem 1.5rem; border-top: 1px solid ${C.line}; }

        .tp-reply {
          padding: 1rem 0;
          border-bottom: 1px solid ${C.line};
          animation: tpFadeIn 0.3s ease;
        }
        .tp-reply:last-child { border-bottom: none; }
        .tp-reply-meta { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; }
        .tp-reply-author { font-weight: 600; font-size: 0.82rem; color: ${C.ink}; }
        .tp-reply-time { font-size: 0.72rem; color: ${C.grayLight}; font-family: 'JetBrains Mono', monospace; }
        .tp-reply-text { font-size: 0.88rem; line-height: 1.6; color: ${C.ink}; }

        .tp-textarea {
          width: 100%;
          padding: 0.7rem 0.85rem;
          border: 1px solid ${C.line};
          border-radius: ${C.radiusSm};
          font-size: 0.85rem;
          font-family: 'Inter', sans-serif;
          color: ${C.ink};
          background: ${C.bone};
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
        }
        .tp-textarea:focus { border-color: ${C.brass}; }
        .tp-input {
          width: 100%;
          padding: 0.65rem 0.85rem;
          border: 1px solid ${C.line};
          border-radius: ${C.radiusSm};
          font-size: 0.85rem;
          font-family: 'Inter', sans-serif;
          color: ${C.ink};
          background: ${C.bone};
          outline: none;
          transition: border-color 0.2s;
        }
        .tp-input:focus { border-color: ${C.brass}; }
        .tp-input.error { border-color: ${C.error}; }

        .tp-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(15,17,23,0.6); backdrop-filter: blur(8px);
          z-index: 300;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: tpFadeIn 0.2s ease;
        }
        .tp-modal {
          background: ${C.bone};
          border-radius: ${C.radius};
          max-width: 520px; width: 100%;
          max-height: 90vh; overflow-y: auto;
          animation: tpFadeIn 0.3s ease;
        }
        .tp-modal-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid ${C.line};
          display: flex; justify-content: space-between; align-items: center;
        }
        .tp-modal-header h2 { font-size: 1rem; font-weight: 700; color: ${C.ink}; }
        .tp-modal-body { padding: 1.5rem; }
        .tp-modal-close {
          background: none; border: 1px solid ${C.line};
          width: 32px; height: 32px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: ${C.gray}; font-size: 1rem;
          transition: all 0.2s;
        }
        .tp-modal-close:hover { border-color: ${C.error}; color: ${C.error}; }

        .tp-type-btn {
          padding: 0.5rem 0.75rem;
          border: 1px solid ${C.line};
          border-radius: ${C.radiusSm};
          cursor: pointer; font-size: 0.78rem; font-weight: 500;
          display: flex; align-items: center; gap: 0.35rem;
          transition: all 0.2s;
          background: ${C.white};
          color: ${C.gray};
          font-family: 'Inter', sans-serif;
          flex: 1; justify-content: center;
        }
        .tp-type-btn:hover { border-color: ${C.brassLight}; }
        .tp-type-btn.active { border-color: ${C.brass}; background: ${C.bone2}; color: ${C.ink}; font-weight: 600; }

        .tp-empty {
          text-align: center; padding: 3rem 1.5rem;
          border: 1px dashed ${C.line};
          border-radius: ${C.radius};
          color: ${C.gray};
        }

        .tp-tag {
          display: inline-flex; align-items: center; gap: 0.3rem;
          font-size: 0.72rem; font-weight: 500;
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          background: ${C.bone2};
          color: ${C.gray};
        }

        @media (max-width: 768px) {
          .tp-grid { grid-template-columns: 1fr !important; }
          .tp-detail { position: static; }
          .tp-stats { flex-wrap: wrap; }
        }
      `}</style>

            <div className="tp-container">
                {/* Notification */}
                {notification && (
                    <div className="tp-notification" style={{
                        background: notification.type === 'error' ? '#FDE8E8' :
                            notification.type === 'success' ? '#E8F5E9' : '#F0EDE4',
                        color: notification.type === 'error' ? '#B91C1C' :
                            notification.type === 'success' ? '#1B5E20' : C.ink,
                        border: `1px solid ${notification.type === 'error' ? '#FECACA' :
                            notification.type === 'success' ? '#C6F6D5' : C.line}`,
                    }}>
                        {notification.type === 'response' && '🔔 '}
                        {notification.type === 'success' && '✓ '}
                        {notification.type === 'error' && '✕ '}
                        {notification.message}
                    </div>
                )}

                {/* Navigation */}
                <nav className="tp-nav">
                    <div className="tp-wrap">
                        <div className="tp-nav-inner">
                            <div className="tp-logo" onClick={goHome}>
                                <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                                    <rect x="1" y="1" width="30" height="30" rx="6" stroke={C.ink} strokeWidth="1.2" />
                                    <path d="M16 8V24M9 16H23" stroke={C.ink} strokeWidth="1.2" strokeLinecap="round" />
                                    <circle cx="16" cy="16" r="3" fill={C.ink} />
                                </svg>
                                <span>Rest Point Support</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="tp-btn tp-btn-primary tp-btn-sm" onClick={() => setShowNewTicket(true)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    New Ticket
                                </button>
                                <button className="tp-btn tp-btn-ghost tp-btn-sm" onClick={fetchTickets}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 4v6h6M23 20v-6h-6" />
                                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                                    </svg>
                                    Refresh
                                </button>
                                <button className="tp-btn tp-btn-ghost tp-btn-sm" onClick={goHome}>← Back</button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main style={{ flex: 1, paddingTop: '1.5rem', paddingBottom: '3rem' }}>
                    <div className="tp-wrap">
                        {/* Header */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{
                                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
                                letterSpacing: '0.12em', textTransform: 'uppercase',
                                color: C.brass, marginBottom: '0.4rem',
                            }}>
                                🎫 Support Desk
                            </div>
                            <h1 style={{
                                fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
                                color: C.ink, letterSpacing: '-0.03em', marginBottom: '0.25rem',
                            }}>
                                My Tickets
                            </h1>
                            <p style={{ color: C.gray, fontSize: '0.88rem', lineHeight: 1.6 }}>
                                Track, manage, and respond to your support tickets. Responses appear in real time.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="tp-stats" style={{
                            display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap',
                        }}>
                            <div className="tp-stat-card" style={{ flex: 1, minWidth: '120px' }}>
                                <div className="tp-stat-dot" style={{ background: C.brass }} />
                                <div>
                                    <div className="tp-stat-number">{openCount}</div>
                                    <div className="tp-stat-label">Open</div>
                                </div>
                            </div>
                            <div className="tp-stat-card" style={{ flex: 1, minWidth: '120px' }}>
                                <div className="tp-stat-dot" style={{ background: C.verdigris }} />
                                <div>
                                    <div className="tp-stat-number">{inProgressCount}</div>
                                    <div className="tp-stat-label">In Progress</div>
                                </div>
                            </div>
                            <div className="tp-stat-card" style={{ flex: 1, minWidth: '120px' }}>
                                <div className="tp-stat-dot" style={{ background: C.success }} />
                                <div>
                                    <div className="tp-stat-number">{resolvedCount}</div>
                                    <div className="tp-stat-label">Resolved</div>
                                </div>
                            </div>
                            <div className="tp-stat-card" style={{ flex: 1, minWidth: '120px' }}>
                                <div className="tp-stat-dot" style={{ background: C.grayLight }} />
                                <div>
                                    <div className="tp-stat-number">{tickets.length}</div>
                                    <div className="tp-stat-label">Total</div>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: C.gray }}>
                                <div className="tp-spinner" style={{ margin: '0 auto 1rem' }} />
                                <p style={{ fontSize: '0.85rem' }}>Loading tickets...</p>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="tp-empty">
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎫</div>
                                <p style={{ fontSize: '1rem', fontWeight: 600, color: C.ink, marginBottom: '0.5rem' }}>No support tickets yet</p>
                                <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                                    Have an issue or question? Create your first ticket and we'll get back to you.
                                </p>
                                <button className="tp-btn tp-btn-primary" onClick={() => setShowNewTicket(true)}>
                                    Create Your First Ticket
                                </button>
                            </div>
                        ) : (
                            <div className="tp-grid" style={{
                                display: 'grid', gridTemplateColumns: selectedTicket ? '1.2fr 1fr' : '1fr',
                                gap: '1.25rem', alignItems: 'start',
                            }}>
                                {/* Ticket List */}
                                <div>
                                    {tickets.map((ticket, i) => (
                                        <div key={ticket.ticket_id || ticket.id}
                                            className={`tp-card${selectedTicket?.ticket_id === ticket.ticket_id ? ' active' : ''}`}
                                            onClick={() => handleSelectTicket(ticket)}
                                            style={{ animationDelay: `${i * 0.05}s` }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <span className="tp-badge" style={{
                                                        color: STATUS_CONFIG[ticket.status]?.color || C.brass,
                                                        background: STATUS_CONFIG[ticket.status]?.bg || 'rgba(154,123,90,0.10)',
                                                    }}>
                                                        {STATUS_CONFIG[ticket.status]?.icon || '○'} {STATUS_CONFIG[ticket.status]?.label || 'Open'}
                                                    </span>
                                                    <span className="tp-ticket-number">{getTicketNumber(ticket)}</span>
                                                </div>
                                                <span style={{
                                                    fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem',
                                                    color: C.grayLight, whiteSpace: 'nowrap',
                                                }}>
                                                    {formatDate(ticket.created_at)}
                                                </span>
                                            </div>
                                            <h3 style={{
                                                fontSize: '0.92rem', fontWeight: 600, color: C.ink,
                                                marginBottom: '0.25rem', lineHeight: 1.4,
                                            }}>
                                                {cleanSubject(ticket.subject)}
                                            </h3>
                                            <p style={{
                                                fontSize: '0.82rem', color: C.gray, lineHeight: 1.5,
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden', marginBottom: '0.4rem',
                                            }}>
                                                {ticket.message}
                                            </p>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <span className="tp-tag">
                                                    {TYPE_CONFIG[ticket.type]?.icon || '📋'} {TYPE_CONFIG[ticket.type]?.label || ticket.type || 'Help'}
                                                </span>
                                                {ticket.reply_count > 0 && (
                                                    <span className="tp-tag">
                                                        💬 {ticket.reply_count} response{ticket.reply_count !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                                {ticket.tenant_name && (
                                                    <span className="tp-tag">{ticket.tenant_name}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Detail Panel */}
                                {selectedTicket && (
                                    <div className="tp-detail" ref={detailsRef}>
                                        <div className="tp-detail-header">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span className="tp-badge" style={{
                                                        color: STATUS_CONFIG[selectedTicket.status]?.color || C.brass,
                                                        background: STATUS_CONFIG[selectedTicket.status]?.bg || 'rgba(154,123,90,0.10)',
                                                    }}>
                                                        {STATUS_CONFIG[selectedTicket.status]?.icon || '○'} {STATUS_CONFIG[selectedTicket.status]?.label || 'Open'}
                                                    </span>
                                                    <span className="tp-ticket-number" style={{ color: C.gray, fontSize: '0.75rem' }}>
                                                        {getTicketNumber(selectedTicket)}
                                                    </span>
                                                </div>
                                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: C.grayLight }}>
                                                    {formatDate(selectedTicket.created_at)}
                                                </span>
                                            </div>
                                            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: C.ink, lineHeight: 1.4 }}>
                                                {cleanSubject(selectedTicket.subject)}
                                            </h2>
                                        </div>

                                        <div className="tp-detail-body">
                                            {/* Original message */}
                                            <div className="tp-reply">
                                                <div className="tp-reply-meta">
                                                    <span className="tp-reply-author">You</span>
                                                    <span className="tp-reply-time">{formatDate(selectedTicket.created_at)}</span>
                                                    <span className="tp-tag">
                                                        {TYPE_CONFIG[selectedTicket.type]?.icon} {TYPE_CONFIG[selectedTicket.type]?.label || selectedTicket.type}
                                                    </span>
                                                </div>
                                                <div className="tp-reply-text">{selectedTicket.message}</div>
                                            </div>

                                            {/* Replies */}
                                            {selectedTicket.replies?.map((reply, idx) => (
                                                <div className="tp-reply" key={idx}>
                                                    <div className="tp-reply-meta">
                                                        <span className="tp-reply-author" style={{
                                                            color: reply.userType === 'admin' || reply.is_admin ? C.brass : C.ink,
                                                        }}>
                                                            {reply.is_admin || reply.userType === 'admin' ? 'Rest Point Support' : 'You'}
                                                        </span>
                                                        {reply.is_admin && (
                                                            <span className="tp-badge" style={{
                                                                color: C.brass, background: 'rgba(154,123,90,0.10)', fontSize: '0.6rem',
                                                            }}>
                                                                STAFF
                                                            </span>
                                                        )}
                                                        <span className="tp-reply-time">{formatDate(reply.created_at)}</span>
                                                    </div>
                                                    <div className="tp-reply-text">{reply.message}</div>
                                                </div>
                                            ))}
                                            <div ref={replyEndRef} />

                                            {/* Reply Form */}
                                            {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                                                <form onSubmit={handleSubmitReply} style={{ marginTop: '1rem' }}>
                                                    <label style={{
                                                        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
                                                        letterSpacing: '0.06em', textTransform: 'uppercase',
                                                        color: C.gray, marginBottom: '0.4rem', display: 'block',
                                                    }}>
                                                        Add a reply
                                                    </label>
                                                    <textarea
                                                        className="tp-textarea"
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Type your message here..."
                                                        rows={3}
                                                    />
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                                        <button
                                                            type="submit"
                                                            disabled={!replyText.trim() || replying}
                                                            className="tp-btn tp-btn-primary tp-btn-sm"
                                                            style={{ opacity: !replyText.trim() || replying ? 0.5 : 1 }}
                                                        >
                                                            {replying ? (
                                                                <><span className="tp-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Sending...</>
                                                            ) : (
                                                                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg> Send Reply</>
                                                            )}
                                                        </button>
                                                    </div>
                                                </form>
                                            )}

                                            {selectedTicket.status === 'resolved' && (
                                                <div style={{
                                                    padding: '0.85rem 1rem', marginTop: '1rem',
                                                    background: STATUS_CONFIG.resolved.bg,
                                                    border: '1px solid ' + STATUS_CONFIG.resolved.color,
                                                    borderRadius: C.radiusSm, color: STATUS_CONFIG.resolved.color,
                                                    fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                }}>
                                                    <span style={{ fontSize: '1.1rem' }}>✓</span>
                                                    <span>This ticket has been resolved. Need further help? Create a new ticket.</span>
                                                </div>
                                            )}

                                            {selectedTicket.status === 'closed' && (
                                                <div style={{
                                                    padding: '0.85rem 1rem', marginTop: '1rem',
                                                    background: STATUS_CONFIG.closed.bg,
                                                    border: '1px solid ' + STATUS_CONFIG.closed.color,
                                                    borderRadius: C.radiusSm, color: STATUS_CONFIG.closed.color,
                                                    fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                }}>
                                                    <span style={{ fontSize: '1.1rem' }}>✕</span>
                                                    <span>This ticket has been closed. Please create a new ticket for new issues.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                {/* Footer */}
                <footer style={{
                    borderTop: '1px solid ' + C.line,
                    padding: '1rem 0',
                    marginTop: 'auto',
                }}>
                    <div className="tp-wrap" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.78rem', color: C.gray }}>
                            © 2026 Rest Point. All rights reserved.
                        </span>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <a href="/privacy" style={{ fontSize: '0.78rem', color: C.gray, textDecoration: 'none' }}>Privacy</a>
                            <a href="/terms" style={{ fontSize: '0.78rem', color: C.gray, textDecoration: 'none' }}>Terms</a>
                            <a href="/support" style={{ fontSize: '0.78rem', color: C.gray, textDecoration: 'none' }}>Support</a>
                        </div>
                    </div>
                </footer>
            </div>

            {/* New Ticket Modal */}
            {showNewTicket && (
                <div className="tp-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowNewTicket(false); }}>
                    <div className="tp-modal">
                        <div className="tp-modal-header">
                            <h2>🎫 Create New Ticket</h2>
                            <button className="tp-modal-close" onClick={() => setShowNewTicket(false)}>✕</button>
                        </div>
                        <div className="tp-modal-body">
                            <div style={{
                                padding: '0.6rem 0.8rem', background: 'rgba(63,85,73,0.06)',
                                border: '1px solid rgba(63,85,73,0.2)', borderRadius: C.radiusSm,
                                marginBottom: '1.25rem', fontSize: '0.78rem', color: C.verdigris,
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                            }}>
                                <span>📧</span>
                                <span>Or email us directly at <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>info@restpoint.co.ke</strong></span>
                            </div>

                            <form onSubmit={handleNewTicketSubmit}>
                                {/* Ticket Type */}
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
                                    letterSpacing: '0.06em', textTransform: 'uppercase',
                                    color: C.gray, marginBottom: '0.4rem',
                                }}>
                                    What's this about?
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '1.25rem' }}>
                                    {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                                        <button key={key} type="button"
                                            className={`tp-type-btn${newTicketType === key ? ' active' : ''}`}
                                            onClick={() => setNewTicketType(key)}
                                        >
                                            <span>{config.icon}</span> {config.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Subject */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{
                                        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
                                        letterSpacing: '0.06em', textTransform: 'uppercase',
                                        color: C.gray, marginBottom: '0.35rem',
                                    }}>
                                        Subject <span style={{ color: C.error }}>*</span>
                                    </div>
                                    <input
                                        className={`tp-input${newTicketErrors.subject ? ' error' : ''}`}
                                        value={newTicketSubject}
                                        onChange={(e) => { setNewTicketSubject(e.target.value); setNewTicketErrors(p => ({ ...p, subject: '' })); }}
                                        placeholder="Brief description of your issue"
                                    />
                                    {newTicketErrors.subject && (
                                        <p style={{ fontSize: '0.72rem', color: C.error, marginTop: '0.2rem' }}>{newTicketErrors.subject}</p>
                                    )}
                                </div>

                                {/* Message */}
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <div style={{
                                        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
                                        letterSpacing: '0.06em', textTransform: 'uppercase',
                                        color: C.gray, marginBottom: '0.35rem',
                                    }}>
                                        Message <span style={{ color: C.error }}>*</span>
                                    </div>
                                    <textarea
                                        className={`tp-textarea${newTicketErrors.message ? ' error' : ''}`}
                                        value={newTicketMessage}
                                        onChange={(e) => { setNewTicketMessage(e.target.value); setNewTicketErrors(p => ({ ...p, message: '' })); }}
                                        placeholder="Describe your issue in detail. Minimum 10 characters."
                                        rows={5}
                                    />
                                    {newTicketErrors.message && (
                                        <p style={{ fontSize: '0.72rem', color: C.error, marginTop: '0.2rem' }}>{newTicketErrors.message}</p>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={newTicketSubmitting}
                                    className="tp-btn tp-btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', opacity: newTicketSubmitting ? 0.6 : 1 }}
                                >
                                    {newTicketSubmitting ? (
                                        <><span className="tp-spinner" style={{ width: '16px', height: '16px' }} /> Submitting Ticket...</>
                                    ) : (
                                        <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg> Submit Ticket</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}