import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';
import api from '../api/axios';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const bellRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const ud = localStorage.getItem('user');
        if (ud) try { setUser(JSON.parse(ud)); } catch (e) { }
        fetchNotifications();
    }, []);

    useEffect(() => {
        const h = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) && bellRef.current && !bellRef.current.contains(e.target)) setShowNotifications(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const r = await api.get('/api/v1/restpoint/notifications');
            if (r.data?.success) {
                const d = r.data.data || [];
                setNotifications(d);
                setUnreadCount(d.filter(n => !n.read).length);
            }
        } catch (e) { setNotifications([]); }
        finally { setLoading(false); }
    };

    const markAsRead = async (id) => {
        try {
            await api.put('/api/v2/restpoint/notifications/' + id + '/read');
            setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(p => Math.max(0, p - 1));
        } catch (e) { }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/api/v1/restpoint/notifications/read-all');
            setNotifications(p => p.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (e) { }
    };

    const getInitials = (n) => {
        if (!n) return 'U';
        return n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatTime = (d) => {
        if (!d) return '';
        const dt = new Date(d);
        const df = Date.now() - dt;
        if (df < 60000) return 'Just now';
        if (df < 3600000) return Math.floor(df / 60000) + 'm ago';
        if (df < 86400000) return Math.floor(df / 3600000) + 'h ago';
        return dt.toLocaleDateString();
    };

    const userName = user?.full_name || user?.name || user?.username || 'User';
    const userRole = user?.role || '';

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px',
            background: '#FFFFFF', borderBottom: '1px solid #E8ECF0',
            justifyContent: 'flex-end', position: 'sticky', top: 0, zIndex: 40
        }}>
            <div ref={bellRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button onClick={() => setShowNotifications(!showNotifications)}
                    style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: '8px', borderRadius: '8px', color: '#6B7280', position: 'relative'
                    }} title="Notifications">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute', top: 0, right: 0,
                            background: '#EF4444', color: 'white', fontSize: '10px',
                            fontWeight: 700, minWidth: '16px', height: '16px',
                            borderRadius: '8px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', padding: '0 4px',
                            transform: 'translate(25%, -25%)'
                        }}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                {showNotifications && (
                    <div ref={dropdownRef} style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                        width: '360px', maxHeight: '480px', background: '#FFFFFF',
                        borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                        border: '1px solid #E8ECF0', overflow: 'hidden', zIndex: 1000
                    }}>
                        <div style={{
                            padding: '12px 16px', borderBottom: '1px solid #E8ECF0',
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', background: '#F9FAFB'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1A1D24' }}>
                                Notifications
                                {unreadCount > 0 && (
                                    <span style={{
                                        marginLeft: '8px', background: '#EF4444', color: 'white',
                                        fontSize: '11px', fontWeight: 600, padding: '1px 6px',
                                        borderRadius: '10px'
                                    }}>
                                        {unreadCount} new
                                    </span>
                                )}
                            </h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} style={{
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    fontSize: '12px', color: '#3B82F6', fontWeight: 500,
                                    padding: '4px 8px', borderRadius: '6px'
                                }}>Mark all read</button>
                            )}
                        </div>

                        <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                            {loading ? (
                                <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                                    Loading notifications...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9CA3AF' }}>
                                    <Bell size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                    <p style={{ margin: 0, fontSize: '13px' }}>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} onClick={() => !n.read && markAsRead(n.id)}
                                        style={{
                                            padding: '12px 16px', borderBottom: '1px solid #F3F4F6',
                                            cursor: 'pointer', background: n.read ? '#FFFFFF' : '#EFF6FF',
                                            display: 'flex', gap: '10px', alignItems: 'flex-start'
                                        }}>
                                        <div style={{ marginTop: '2px', flexShrink: 0 }}>
                                            {n.type === 'success' ? <CheckCircle size={16} color="#10B981" /> :
                                                n.type === 'error' ? <AlertCircle size={16} color="#EF4444" /> :
                                                    n.type === 'warning' ? <AlertCircle size={16} color="#F59E0B" /> :
                                                        <Info size={16} color="#3B82F6" />}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{
                                                margin: 0, fontSize: '13px',
                                                fontWeight: n.read ? 400 : 600,
                                                color: '#1A1D24', lineHeight: 1.4
                                            }}>{n.title || n.message}</p>
                                            {n.message && n.title && (
                                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                                                    {n.message}
                                                </p>
                                            )}
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                marginTop: '4px', fontSize: '11px', color: '#9CA3AF'
                                            }}>
                                                <Clock size={10} />
                                                <span>{formatTime(n.created_at || n.timestamp)}</span>
                                            </div>
                                        </div>
                                        {!n.read && (
                                            <div style={{
                                                width: '8px', height: '8px', borderRadius: '50%',
                                                background: '#3B82F6', flexShrink: 0, marginTop: '6px'
                                            }} />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '4px 8px', borderRadius: '8px', cursor: 'pointer'
            }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0A2463 0%, #1A3A7A 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 600, fontSize: '12px'
                }}>
                    {getInitials(userName)}
                </div>
                <div style={{ lineHeight: 1.2 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1D24' }}>{userName}</div>
                    {userRole && <div style={{ fontSize: '11px', color: '#6B7280' }}>{userRole}</div>}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;