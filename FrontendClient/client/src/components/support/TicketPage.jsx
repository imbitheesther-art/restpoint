import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../api/axios';
import env from '../../config/env';

const SOCKET_URL = import.meta.env.VITE_SOCKETIO_URL || 'http://localhost:5018';

const C = {
    ink: '#0F1117',
    bone: '#FCFAFA',
    bone2: '#F6F3F0',
    brass: '#9A7B5A',
    brassLight: '#B8966E',
    verdigris: '#3F5549',
    line: '#E8E3DA',
    gray: '#78736B',
    grayLight: '#B8B3AB',
    white: '#FFFFFF',
    success: '#3E8E5C',
    error: '#D94A4A',
};

const STATUS = {
    open: { color: C.brass, bg: 'rgba(154,123,90,0.10)', label: 'Open' },
    in_progress: { color: C.verdigris, bg: 'rgba(63,85,73,0.10)', label: 'In Progress' },
    resolved: { color: C.success, bg: 'rgba(62,142,92,0.10)', label: 'Resolved' },
    closed: { color: C.gray, bg: 'rgba(120,115,107,0.10)', label: 'Closed' },
};

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
    const notifTimer = useRef(null);
    const replyEndRef = useRef(null);

    // New question form
    const [question, setQuestion] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const tenantSlug = slug || localStorage.getItem('tenantSlug') || 'system_shared';

    const notify = useCallback((msg, type = 'response') => {
        setNotification({ message: msg, type, time: Date.now() });
        if (notifTimer.current) clearTimeout(notifTimer.current);
        notifTimer.current = setTimeout(() => setNotification(null), 5000);
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

    useEffect(() => {
        const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
        const socket = io(SOCKET_URL, {
            auth: { token, tenantSlug },
            transports: ['websocket', 'polling'],
            reconnection: true,
        });
        socket.on('connect', () => {
            socket.emit('join-tenant', { tenantSlug, userId: 'ticket-page' });
        });
        socket.on('ticket_response', (data) => {
            if (data.tenant_slug === tenantSlug || !data.tenant_slug) {
                notify('🔔 New response on your ticket!');
                fetchTickets();
            }
        });
        socket.on('ticket_updated', () => fetchTickets());
        socketRef.current = socket;
        return () => { socket.off('ticket_response'); socket.off('ticket_updated'); socket.disconnect(); };
    }, [tenantSlug, fetchTickets, notify]);

    useEffect(() => { fetchTickets(); const i = setInterval(fetchTickets, 30000); return () => clearInterval(i); }, [fetchTickets]);
    useEffect(() => { replyEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selectedTicket]);

    const goHome = () => {
        if (slug) navigate(`/tenant/${slug}/all-deceased`);
        else navigate('/');
    };

    const handleSubmitQuestion = async (e) => {
        e.preventDefault();
        if (!question.trim() || question.trim().length < 5) {
            notify('Please write at least 5 characters', 'error');
            return;
        }
        setSubmitting(true);
        try {
            const userStr = localStorage.getItem('user');
            let userEmail = '', userName = '';
            try { const u = JSON.parse(userStr || '{}'); userEmail = u.email || ''; userName = u.full_name || u.name || ''; } catch (e) { }

            await api.post('/support/tickets', {
                type: 'help',
                subject: question.trim().substring(0, 100),
                message: question.trim(),
                tenantName: localStorage.getItem('tenantName') || 'Unknown',
                userEmail, userName,
            }, { headers: { 'x-tenant-slug': tenantSlug } });

            notify('✓ Question sent! We\'ll respond shortly.', 'success');
            setQuestion('');
            setShowForm(false);
            fetchTickets();
        } catch (err) {
            notify('Failed to send. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicket) return;
        setReplying(true);
        try {
            await api.post('/support/tickets/' + selectedTicket.ticket_id + '/reply', {
                message: replyText.trim(), userType: 'tenant',
            }, { headers: { 'x-tenant-slug': tenantSlug } });
            setReplyText('');
            notify('✓ Reply sent', 'success');
            fetchTickets();
        } catch (err) {
            notify('Failed to send reply', 'error');
        } finally {
            setReplying(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: C.bone, fontFamily: "'Inter', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${C.bone}; }
        .tp-card { background: ${C.white}; border: 1px solid ${C.line}; border-radius: 12px; padding: 1.25rem; cursor: pointer; transition: all 0.2s; }
        .tp-card:hover { border-color: ${C.brassLight}; box-shadow: 0 4px 16px rgba(15,17,23,0.06); }
        .tp-card.active { border-color: ${C.brass}; border-left: 3px solid ${C.brass}; background: ${C.bone2}; }
        .tp-badge { font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 0.3rem; }
        .tp-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid ${C.line}; border-radius: 8px; font-size: 0.9rem; font-family: 'Inter', sans-serif; color: ${C.ink}; background: ${C.bone}; outline: none; resize: vertical; transition: border-color 0.2s; }
        .tp-input:focus { border-color: ${C.brass}; }
        .tp-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.2rem; font-size: 0.85rem; font-weight: 600; font-family: 'Inter', sans-serif; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .tp-btn-primary { background: ${C.ink}; color: ${C.bone}; }
        .tp-btn-primary:hover { background: #1A1D24; transform: translateY(-1px); }
        .tp-btn-ghost { background: transparent; color: ${C.ink}; border: 1px solid ${C.line}; }
        .tp-btn-ghost:hover { background: ${C.bone2}; border-color: ${C.brass}; }
        .tp-btn-sm { padding: 0.45rem 0.9rem; font-size: 0.78rem; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-in { animation: fadeIn 0.3s ease; }
      `}</style>

            {/* Notification */}
            {notification && (
                <div style={{
                    position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 200,
                    padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500,
                    background: notification.type === 'error' ? '#FDE8E8' : notification.type === 'success' ? '#E8F5E9' : '#F0EDE4',
                    color: notification.type === 'error' ? '#B91C1C' : notification.type === 'success' ? '#1B5E20' : C.ink,
                    border: '1px solid ' + (notification.type === 'error' ? '#FECACA' : notification.type === 'success' ? '#C6F6D5' : C.line),
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)', animation: 'fadeIn 0.3s ease',
                }}>
                    {notification.message}
                </div>
            )}

            {/* Nav */}
            <div style={{ borderBottom: '1px solid ' + C.line, background: 'rgba(252,250,250,0.92)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', color: C.ink, cursor: 'pointer' }}>
                        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                            <rect x="1" y="1" width="30" height="30" rx="6" stroke={C.ink} strokeWidth="1.2" />
                            <path d="M16 8V24M9 16H23" stroke={C.ink} strokeWidth="1.2" strokeLinecap="round" />
                            <circle cx="16" cy="16" r="3" fill={C.ink} />
                        </svg>
                        <span>Restpoint Support</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="tp-btn tp-btn-primary tp-btn-sm" onClick={() => setShowForm(!showForm)}>
                            {showForm ? '✕ Close' : '+ Ask a Question'}
                        </button>
                        <button className="tp-btn tp-btn-ghost tp-btn-sm" onClick={goHome}>← Back</button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>
                {/* Ask Question Form */}
                {showForm && (
                    <div className="fade-in" style={{
                        background: C.white, border: '1px solid ' + C.line, borderRadius: '12px',
                        padding: '1.5rem', marginBottom: '1.5rem',
                    }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: C.ink, marginBottom: '0.25rem' }}>Ask a Question</h2>
                        <p style={{ fontSize: '0.82rem', color: C.gray, marginBottom: '1rem' }}>
                            Have an issue or question? We'll get back to you as soon as possible.
                        </p>
                        <form onSubmit={handleSubmitQuestion}>
                            <textarea
                                className="tp-input"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Describe your issue or question in detail..."
                                rows={4}
                                style={{ marginBottom: '0.75rem' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" className="tp-btn tp-btn-ghost tp-btn-sm" onClick={() => { setShowForm(false); setQuestion(''); }}>Cancel</button>
                                <button type="submit" disabled={submitting || question.trim().length < 5} className="tp-btn tp-btn-primary tp-btn-sm" style={{ opacity: submitting || question.trim().length < 5 ? 0.5 : 1 }}>
                                    {submitting ? <><span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} /> Sending...</> : 'Send Question'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Header */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.ink, marginBottom: '0.2rem' }}>My Questions</h1>
                    <p style={{ fontSize: '0.85rem', color: C.gray }}>
                        {tickets.length > 0 ? `${tickets.length} question${tickets.length !== 1 ? 's' : ''} · Responses appear instantly` : 'Ask a question and track responses here'}
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: C.gray }}>
                        <div style={{ width: '28px', height: '28px', border: '2px solid ' + C.line, borderTop: '2px solid ' + C.brass, borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 0.75rem' }} />
                        <p style={{ fontSize: '0.85rem' }}>Loading...</p>
                    </div>
                )}

                {/* Empty */}
                {!loading && tickets.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', border: '1px dashed ' + C.line, borderRadius: '12px', color: C.gray }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💬</div>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: C.ink, marginBottom: '0.25rem' }}>No questions yet</p>
                        <p style={{ fontSize: '0.82rem', marginBottom: '1rem' }}>Have an issue? Ask a question and we'll respond quickly.</p>
                        <button className="tp-btn tp-btn-primary" onClick={() => setShowForm(true)}>Ask a Question</button>
                    </div>
                )}

                {/* Ticket List */}
                {!loading && tickets.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {tickets.map((ticket) => (
                            <div key={ticket.ticket_id || ticket.id}
                                className={`tp-card${selectedTicket?.ticket_id === ticket.ticket_id ? ' active' : ''}`}
                                onClick={() => setSelectedTicket(selectedTicket?.ticket_id === ticket.ticket_id ? null : ticket)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        <span className="tp-badge" style={{ color: STATUS[ticket.status]?.color || C.brass, background: STATUS[ticket.status]?.bg || 'rgba(154,123,90,0.10)' }}>
                                            {STATUS[ticket.status]?.label || 'Open'}
                                        </span>
                                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: C.grayLight }}>
                                            #{ticket.ticket_id}
                                        </span>
                                    </div>
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: C.grayLight, whiteSpace: 'nowrap' }}>
                                        {formatDate(ticket.created_at)}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.88rem', color: C.ink, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {ticket.message || ticket.subject}
                                </p>
                                {ticket.reply_count > 0 && (
                                    <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: C.verdigris, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <span>💬 {ticket.reply_count} response{ticket.reply_count !== 1 ? 's' : ''}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Detail Panel */}
                {selectedTicket && (
                    <div className="fade-in" style={{
                        marginTop: '1.25rem', background: C.white, border: '1px solid ' + C.line,
                        borderRadius: '12px', overflow: 'hidden',
                    }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid ' + C.line, background: C.bone2 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span className="tp-badge" style={{ color: STATUS[selectedTicket.status]?.color || C.brass, background: STATUS[selectedTicket.status]?.bg || 'rgba(154,123,90,0.10)' }}>
                                        {STATUS[selectedTicket.status]?.label || 'Open'}
                                    </span>
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: C.gray }}>#{selectedTicket.ticket_id}</span>
                                </div>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: C.grayLight }}>{formatDate(selectedTicket.created_at)}</span>
                            </div>
                            <p style={{ fontSize: '0.88rem', color: C.ink, lineHeight: 1.5 }}>{selectedTicket.message || selectedTicket.subject}</p>
                        </div>

                        <div style={{ padding: '1.25rem 1.5rem' }}>
                            {/* Replies */}
                            {selectedTicket.replies?.map((reply, idx) => (
                                <div key={idx} style={{ padding: '0.75rem 0', borderBottom: idx < selectedTicket.replies.length - 1 ? '1px solid ' + C.line : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: reply.is_admin || reply.userType === 'admin' ? C.brass : C.ink }}>
                                            {reply.is_admin || reply.userType === 'admin' ? 'Support Team' : 'You'}
                                        </span>
                                        {reply.is_admin && <span className="tp-badge" style={{ color: C.brass, background: 'rgba(154,123,90,0.10)', fontSize: '0.6rem' }}>STAFF</span>}
                                        <span style={{ fontSize: '0.68rem', color: C.grayLight, fontFamily: "'JetBrains Mono', monospace" }}>{formatDate(reply.created_at)}</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: C.ink }}>{reply.message}</p>
                                </div>
                            ))}
                            <div ref={replyEndRef} />

                            {/* Reply Form */}
                            {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                                <form onSubmit={handleReply} style={{ marginTop: '0.75rem' }}>
                                    <textarea
                                        className="tp-input"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your reply..."
                                        rows={2}
                                        style={{ marginBottom: '0.5rem' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="submit" disabled={!replyText.trim() || replying} className="tp-btn tp-btn-primary tp-btn-sm" style={{ opacity: !replyText.trim() || replying ? 0.5 : 1 }}>
                                            {replying ? 'Sending...' : 'Send Reply'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {selectedTicket.status === 'resolved' && (
                                <div style={{ padding: '0.75rem 1rem', marginTop: '0.75rem', background: 'rgba(62,142,92,0.08)', border: '1px solid rgba(62,142,92,0.2)', borderRadius: '8px', fontSize: '0.82rem', color: C.success, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    ✓ This question has been resolved. Need more help? Ask a new question.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}