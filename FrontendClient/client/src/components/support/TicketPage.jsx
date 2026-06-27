import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../api/axios';
import env from '../../config/env';

/* ============================================================
   REST POINT — Support Tickets
   Styled to match LandingPage: ink / bone / brass / verdigris
   Real-time socket updates per tenant
   ============================================================ */

const C = {
    ink: '#15171A',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    brassLight: '#A98F6E',
    verdigris: '#3D4F47',
    verdigrisDark: '#2E3F37',
    line: '#E3DDD0',
    lineDark: 'rgba(250,248,244,0.14)',
    gray: '#6B6862',
    grayLight: 'rgba(250,248,244,0.62)',
};

const STATUS_COLORS = {
    open: C.brass,
    in_progress: C.verdigris,
    resolved: '#4B7B5E',
    closed: C.gray,
};

const TYPE_LABELS = {
    bug: 'Bug Report',
    feature: 'Feature Request',
    help: 'Need Help',
    other: 'Other',
};

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || env.API_GATEWAY_URL || 'http://localhost:8010';

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

    const tenantSlug = slug || localStorage.getItem('tenantSlug') || 'system_shared';

    const showNotification = useCallback((msg, type = 'response') => {
        setNotification({ message: msg, type, time: Date.now() });
        if (notificationTimer.current) clearTimeout(notificationTimer.current);
        notificationTimer.current = setTimeout(() => setNotification(null), 6000);
    }, []);

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/v2/restpoint/support/tickets?tenant=' + tenantSlug, {
                headers: { 'x-tenant-slug': tenantSlug }
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

    // Initial fetch
    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 30000);
        return () => clearInterval(interval);
    }, [fetchTickets]);

    const goHome = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (slug) {
            navigate(`/tenant/${slug}/all-deceased`);
        } else {
            navigate('/');
        }
    };

    const handleNewTicket = () => {
        navigate(slug ? `/tenant/${slug}/support/new` : '/support/new');
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
            await api.post('/api/v2/restpoint/support/tickets/' + selectedTicket.ticket_id + '/reply', {
                message: replyText.trim(),
                userType: 'tenant',
            }, {
                headers: { 'x-tenant-slug': tenantSlug }
            });
            setReplyText('');
            showNotification('Reply sent', 'success');
            fetchTickets();
        } catch (err) {
            showNotification('Failed to send reply', 'error');
        } finally {
            setReplying(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-KE', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const statusLabel = (status) => {
        const map = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' };
        return map[status] || status || 'Open';
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: ${C.gray}; background: ${C.bone}; -webkit-font-smoothing: antialiased; }

        h1, h2, h3 { font-family: 'Fraunces', serif; font-weight: 500; letter-spacing: -0.01em; color: ${C.ink}; }
        h1 { font-size: clamp(1.6rem, 3.6vw, 2.2rem); line-height: 1.12; }
        p { line-height: 1.7; font-size: 0.95rem; }

        .label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.74rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${C.brass};
        }

        .btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.85rem 1.7rem; font-size: 0.85rem; font-weight: 500;
          font-family: 'Inter', sans-serif;
          border: 1px solid transparent; border-radius: 2px;
          cursor: pointer; transition: all 0.25s ease; white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .btn-dark { background: ${C.ink}; color: ${C.bone}; }
        .btn-dark:hover { background: #000; }
        .btn-line { background: transparent; color: ${C.ink}; border-color: ${C.ink}; }
        .btn-line:hover { background: ${C.ink}; color: ${C.bone}; }
        .btn-sm { padding: 0.55rem 1.1rem; font-size: 0.78rem; }

        .wrap { max-width: 1080px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2rem); }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(250,248,244,0.92); backdrop-filter: blur(10px);
          border-bottom: 1px solid ${C.line};
          padding: 1.15rem 0;
        }
        .nav-wrap { display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 0.65rem; font-family: 'Fraunces', serif; font-size: 1.15rem; font-weight: 500; color: ${C.ink}; cursor: pointer; }

        .content-block { padding-top: 92px; }

        .notification-bar {
          position: fixed; top: 76px; left: 0; right: 0; z-index: 99;
          padding: 0.75rem 1rem; text-align: center;
          font-size: 0.85rem; font-weight: 500;
          animation: slideDown 0.35s ease;
        }
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .ticket-card {
          border: 1px solid ${C.line};
          padding: 1.25rem 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background: ${C.bone};
        }
        .ticket-card:hover {
          border-color: ${C.brass};
          background: ${C.bone2};
        }
        .ticket-card.active {
          border-color: ${C.brass};
          border-left: 3px solid ${C.brass};
        }

        .status-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          padding: 0.2rem 0.6rem;
          border: 1px solid;
          display: inline-block;
        }

        .detail-panel {
          border: 1px solid ${C.line};
          padding: 1.5rem;
          background: ${C.bone};
        }

        .reply-item {
          padding: 0.85rem 0;
          border-bottom: 1px solid ${C.line};
        }
        .reply-item:last-child { border-bottom: none; }

        hr { border: none; height: 1px; background: ${C.line}; margin: 1rem 0; }

        footer { 
          margin-top: 4rem; 
          padding: 1.5rem 0; 
          border-top: 1px solid ${C.line};
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.8rem;
          color: ${C.gray};
        }
        footer a { color: ${C.gray}; text-decoration: none; }
        footer a:hover { color: ${C.ink}; }
      `}</style>

            {/* Notification bar */}
            {notification && (
                <div className="notification-bar" style={{
                    background: notification.type === 'error' ? '#FDE8E8' :
                        notification.type === 'success' ? '#E8F5E9' : '#F0EDE4',
                    color: notification.type === 'error' ? '#B91C1C' :
                        notification.type === 'success' ? '#1B5E20' : C.ink,
                    borderBottom: `1px solid ${notification.type === 'error' ? '#FECACA' :
                        notification.type === 'success' ? '#C6F6D5' : C.line}`,
                }}>
                    {notification.type === 'response' && '🔔 '}
                    {notification.type === 'success' && '✓ '}
                    {notification.type === 'error' && '✕ '}
                    {notification.message}
                </div>
            )}

            {/* Navigation */}
            <nav>
                <div className="wrap nav-wrap">
                    <div className="logo" onClick={goHome}>
                        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="14.5" stroke={C.ink} strokeWidth="1" />
                            <path d="M16 8.5V23.5M9.5 16H22.5" stroke={C.ink} strokeWidth="1" />
                            <circle cx="16" cy="16" r="2.5" fill={C.ink} />
                        </svg>
                        <span>Rest Point</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-dark btn-sm" onClick={handleNewTicket}>+ New Ticket</button>
                        <button className="btn btn-line btn-sm" onClick={goHome}>← Back</button>
                    </div>
                </div>
            </nav>

            <main className="content-block">
                <div className="wrap" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
                    {/* Header */}
                    <div className="label" style={{ marginBottom: '0.5rem', color: C.brass }}>Support</div>
                    <h1>My Support Tickets</h1>
                    <p style={{ color: C.gray, fontSize: '0.85rem', marginTop: '0.3rem', marginBottom: '2rem' }}>
                        Track your tickets in real time. Responses appear instantly.
                    </p>

                    {/* Ticket count */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        {['open', 'in_progress', 'resolved', 'closed'].map(s => {
                            const count = tickets.filter(t => (t.status || 'open') === s).length;
                            return (
                                <div key={s} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: C.gray,
                                }}>
                                    <span style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: s === 'open' ? C.brass : s === 'in_progress' ? C.verdigris :
                                            s === 'resolved' ? '#4B7B5E' : C.gray,
                                    }} />
                                    {statusLabel(s)}: <strong style={{ color: C.ink }}>{count}</strong>
                                </div>
                            );
                        })}
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: C.gray }}>
                            <div style={{
                                width: '32px', height: '32px', margin: '0 auto 1rem',
                                border: '2px solid ' + C.line, borderTop: '2px solid ' + C.brass,
                                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                            }} />
                            Loading tickets...
                        </div>
                    ) : tickets.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '3rem 1.5rem',
                            border: '1px solid ' + C.line, color: C.gray,
                        }}>
                            <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>No support tickets yet.</p>
                            <button className="btn btn-dark" onClick={handleNewTicket}>Create your first ticket</button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                            {/* Ticket List */}
                            <div>
                                {tickets.map(ticket => (
                                    <div key={ticket.ticket_id || ticket.id} className={`ticket-card${selectedTicket?.ticket_id === ticket.ticket_id ? ' active' : ''}`}
                                        onClick={() => handleSelectTicket(ticket)}
                                        style={{ marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                                            <span className="status-badge" style={{
                                                color: STATUS_COLORS[ticket.status] || C.brass,
                                                borderColor: STATUS_COLORS[ticket.status] || C.brass,
                                            }}>
                                                {statusLabel(ticket.status)}
                                            </span>
                                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: C.gray }}>
                                                {formatDate(ticket.created_at)}
                                            </span>
                                        </div>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                                            {ticket.subject}
                                        </h3>
                                        <p style={{ fontSize: '0.82rem', color: C.gray, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {ticket.message}
                                        </p>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <span className="label" style={{ fontSize: '0.65rem', color: C.gray }}>
                                                {TYPE_LABELS[ticket.type] || ticket.type || 'Help'}
                                            </span>
                                            {ticket.tenant_name && (
                                                <span className="label" style={{ fontSize: '0.65rem', color: C.gray }}>
                                                    {ticket.tenant_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Detail Panel */}
                            {selectedTicket && (
                                <div className="detail-panel">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                                        <div>
                                            <span className="status-badge" style={{
                                                color: STATUS_COLORS[selectedTicket.status] || C.brass,
                                                borderColor: STATUS_COLORS[selectedTicket.status] || C.brass,
                                                marginRight: '0.5rem',
                                            }}>
                                                {statusLabel(selectedTicket.status)}
                                            </span>
                                            <span className="label" style={{ fontSize: '0.65rem', color: C.gray }}>
                                                #{selectedTicket.ticket_id || selectedTicket.id}
                                            </span>
                                        </div>
                                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: C.gray }}>
                                            {formatDate(selectedTicket.created_at)}
                                        </span>
                                    </div>

                                    <h2 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{selectedTicket.subject}</h2>
                                    <p style={{ fontSize: '0.9rem', color: C.ink, lineHeight: 1.7, marginBottom: '1rem' }}>
                                        {selectedTicket.message}
                                    </p>

                                    <div className="label" style={{ color: C.brass, marginBottom: '0.5rem' }}>
                                        Type: {TYPE_LABELS[selectedTicket.type] || selectedTicket.type || 'Help'}
                                    </div>
                                    {selectedTicket.user_email && (
                                        <div className="label" style={{ color: C.gray, fontSize: '0.65rem', marginBottom: '1rem' }}>
                                            Contact: {selectedTicket.user_email}
                                        </div>
                                    )}

                                    <hr />

                                    {/* Reply Section - only for open/in_progress tickets */}
                                    {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                                        <form onSubmit={handleSubmitReply}>
                                            <label className="label" style={{ color: C.ink, marginBottom: '0.5rem', display: 'block' }}>
                                                Add a reply
                                            </label>
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Type your reply here..."
                                                rows={3}
                                                style={{
                                                    width: '100%', padding: '0.7rem 0.85rem',
                                                    border: '1px solid ' + C.line,
                                                    fontSize: '0.85rem', fontFamily: "'Inter', sans-serif",
                                                    color: C.ink, background: C.bone, resize: 'vertical',
                                                    outline: 'none', marginBottom: '0.75rem',
                                                }}
                                            />
                                            <button type="submit" disabled={!replyText.trim() || replying}
                                                className="btn btn-dark btn-sm"
                                                style={{ opacity: !replyText.trim() || replying ? 0.5 : 1 }}>
                                                {replying ? 'Sending...' : 'Send Reply'}
                                            </button>
                                        </form>
                                    )}

                                    {selectedTicket.status === 'resolved' && (
                                        <div style={{ padding: '1rem', border: '1px solid ' + C.verdigris, color: C.verdigris, fontSize: '0.85rem' }}>
                                            ✓ This ticket has been resolved. If you need further assistance, please create a new ticket.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer>
                <div className="wrap" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <span>© 2026 Rest Point. All rights reserved.</span>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <a href="/privacy">Privacy Policy</a>
                        <a href="/terms">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </>
    );
}