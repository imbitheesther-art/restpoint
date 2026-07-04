import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import env from '../../config/env';

const UserProfile = () => {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const bellRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
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
            const r = await api.get(ENDPOINTS.NOTIFICATION.BASE + '/notifications');
            if (r.data?.success) {
                const d = r.data.data || [];
                setNotifications(d);
                setUnreadCount(d.filter(n => !n.is_read).length);
            }
        } catch (e) {
            console.warn('Could not fetch notifications:', e.message);
            setNotifications([]);
        }
        finally { setLoading(false); }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(ENDPOINTS.NOTIFICATION.BASE + '/notifications/' + id + '/read');
            setNotifications(p => p.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            setUnreadCount(p => Math.max(0, p - 1));
        } catch (e) { }
    };

    const markAllAsRead = async () => {
        try {
            await api.put(ENDPOINTS.NOTIFICATION.BASE + '/notifications/mark-all-read');
            setNotifications(p => p.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (e) { }
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

    return (
        <div style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 1000
        }}>
            <div ref={bellRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    style={{

                        border: '2px solid #E8ECF0',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        color: '#ff0a0a',
                        position: 'relative',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Notifications">
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '-3px',
                            right: '-3px',
                            background: '#EF4444',
                            color: 'white',
                            fontSize: '9px',
                            fontWeight: 700,
                            minWidth: '16px',
                            height: '16px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 3px',
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                        }}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                    <div ref={dropdownRef} style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '360px',
                        maxHeight: '480px',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        border: '1px solid #E8ECF0',
                        overflow: 'hidden',
                        zIndex: 1001
                    }}>
                        <div style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #E8ECF0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#F9FAFB'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1A1D24' }}>
                                Notifications
                                {unreadCount > 0 && (
                                    <span style={{
                                        marginLeft: '6px',
                                        background: '#EF4444',
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        padding: '1px 6px',
                                        borderRadius: '8px'
                                    }}>
                                        {unreadCount} new
                                    </span>
                                )}
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                        color: '#3B82F6',
                                        fontWeight: 500,
                                        padding: '3px 6px',
                                        borderRadius: '4px'
                                    }}>
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div style={{ overflowY: 'auto', maxHeight: '380px' }}>
                            {loading ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF', fontSize: '12px' }}>
                                    Loading notifications...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div style={{ padding: '28px 16px', textAlign: 'center', color: '#9CA3AF' }}>
                                    <Bell size={24} style={{ marginBottom: '6px', opacity: 0.5 }} />
                                    <p style={{ margin: 0, fontSize: '12px' }}>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map(n => {
                                    const isNotificationRead = n.is_read === 1 || n.is_read === true;
                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => !isNotificationRead && markAsRead(n.id)}
                                            style={{
                                                padding: '10px 14px',
                                                borderBottom: '1px solid #F3F4F6',
                                                cursor: 'pointer',
                                                background: isNotificationRead ? '#FFFFFF' : '#EFF6FF',
                                                display: 'flex',
                                                gap: '8px',
                                                alignItems: 'flex-start'
                                            }}>
                                            <div style={{ marginTop: '2px', flexShrink: 0 }}>
                                                {n.type === 'success' ? <CheckCircle size={14} color="#10B981" /> :
                                                    n.type === 'error' ? <AlertCircle size={14} color="#EF4444" /> :
                                                        n.type === 'warning' ? <AlertCircle size={14} color="#F59E0B" /> :
                                                            <Info size={14} color="#3B82F6" />}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '12px',
                                                    fontWeight: isNotificationRead ? 400 : 600,
                                                    color: '#1A1D24',
                                                    lineHeight: 1.4
                                                }}>{n.message || n.title}</p>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '3px',
                                                    marginTop: '3px',
                                                    fontSize: '10px',
                                                    color: '#9CA3AF'
                                                }}>
                                                    <Clock size={9} />
                                                    <span>{formatTime(n.created_at || n.timestamp)}</span>
                                                </div>
                                            </div>
                                            {!isNotificationRead && (
                                                <div style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    background: '#3B82F6',
                                                    flexShrink: 0,
                                                    marginTop: '5px'
                                                }} />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;