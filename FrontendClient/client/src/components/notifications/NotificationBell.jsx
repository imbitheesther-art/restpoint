import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, CheckCheck, Trash2, Clock } from 'lucide-react';
import api from '../../api/axios';
import { getTenantHeaders } from '../../api/endpoints';
import { useSocket } from '../../context/socketContext';

const NOTIFICATION_SERVICE = '/notification';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const { socket, connected } = useSocket();

    // Get branch ID from localStorage
    const getBranchId = useCallback(() => {
        return localStorage.getItem('branchId') || localStorage.getItem('branch_id') || null;
    }, []);

    // Fetch notifications from the API
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const branchId = getBranchId();
            const headers = getTenantHeaders();

            let url = `${NOTIFICATION_SERVICE}/api/v1/restpoint/notification/notifications`;
            if (branchId) {
                url += `?branch_id=${branchId}`;
            }

            const response = await api.get(url, { headers });

            if (response.data?.success && response.data?.data) {
                setNotifications(response.data.data);
                const unread = response.data.data.filter(n => !n.is_read).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error('[NotificationBell] Failed to fetch notifications:', error.message);
        } finally {
            setLoading(false);
        }
    }, [getBranchId]);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();

        // Poll every 30 seconds as fallback
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Listen for real-time notifications via Socket.IO
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification) => {
            console.log('[NotificationBell] New notification received:', notification);
            setNotifications(prev => [notification, ...prev]);
            if (!notification.is_read) {
                setUnreadCount(prev => prev + 1);
            }
        };

        socket.on('new_notification', handleNewNotification);

        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket]);

    // Mark a single notification as read
    const markAsRead = async (id) => {
        try {
            const headers = getTenantHeaders();
            await api.put(
                `${NOTIFICATION_SERVICE}/api/v1/restpoint/notification/notifications/${id}/read`,
                {},
                { headers }
            );

            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('[NotificationBell] Failed to mark as read:', error.message);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            const headers = getTenantHeaders();
            await api.put(
                `${NOTIFICATION_SERVICE}/api/v1/restpoint/notification/notifications/mark-all-read`,
                {},
                { headers }
            );

            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (error) {
            console.error('[NotificationBell] Failed to mark all as read:', error.message);
        }
    };

    // Delete a notification
    const deleteNotification = async (id) => {
        try {
            const headers = getTenantHeaders();
            await api.delete(
                `${NOTIFICATION_SERVICE}/api/v1/restpoint/notification/notifications/${id}`,
                { headers }
            );

            const deleted = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (deleted && !deleted.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('[NotificationBell] Failed to delete notification:', error.message);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // Get icon color based on notification type
    const getTypeColor = (type) => {
        const colors = {
            'new_body': '#3D4F47',
            'autopsy_done': '#8B7355',
            'dispatch_created': '#C77B5E',
            'body_dispatched': '#4D6359',
            'balance_update': '#A98F6E',
            'billing-threshold-exceeded': '#E8A838',
            'billing-critical': '#E74C3C',
        };
        return colors[type] || '#6B7280';
    };

    // Get icon emoji based on notification type
    const getTypeIcon = (type) => {
        const icons = {
            'new_body': '🆕',
            'autopsy_done': '🔬',
            'dispatch_created': '🚚',
            'body_dispatched': '✅',
            'balance_update': '💰',
            'billing-threshold-exceeded': '⚠️',
            'billing-critical': '🚨',
        };
        return icons[type] || '📋';
    };

    const styles = {
        container: {
            position: 'relative',
            display: 'inline-block',
        },
        bellButton: {
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            color: '#6B7280',
            transition: 'all 0.2s ease',
        },
        badge: {
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: '#E74C3C',
            color: 'white',
            fontSize: '0.6rem',
            fontWeight: 700,
            minWidth: '16px',
            height: '16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 2px 4px rgba(231, 76, 60, 0.3)',
        },
        dropdown: {
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: '0',
            width: '360px',
            maxHeight: '480px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid #E8ECF0',
            zIndex: 1000,
            overflow: 'hidden',
            display: isOpen ? 'block' : 'none',
        },
        header: {
            padding: '12px 16px',
            borderBottom: '1px solid #E8ECF0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerTitle: {
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#1A1D24',
        },
        headerActions: {
            display: 'flex',
            gap: '8px',
        },
        actionButton: {
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease',
        },
        list: {
            maxHeight: '400px',
            overflowY: 'auto',
        },
        notificationItem: (isRead) => ({
            padding: '12px 16px',
            borderBottom: '1px solid #F3F4F6',
            cursor: 'pointer',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            background: isRead ? 'transparent' : 'rgba(61, 79, 71, 0.04)',
            transition: 'all 0.2s ease',
        }),
        iconWrapper: {
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '1rem',
        },
        content: {
            flex: 1,
            minWidth: 0,
        },
        message: {
            fontSize: '0.82rem',
            color: '#1A1D24',
            lineHeight: 1.4,
            marginBottom: '4px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
        },
        time: {
            fontSize: '0.7rem',
            color: '#9CA3AF',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
        },
        deleteButton: {
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            color: '#D1D5DB',
            opacity: 0,
            transition: 'all 0.2s ease',
            flexShrink: 0,
        },
        emptyState: {
            padding: '32px 16px',
            textAlign: 'center',
            color: '#9CA3AF',
            fontSize: '0.85rem',
        },
        loadingState: {
            padding: '16px',
            textAlign: 'center',
            color: '#9CA3AF',
            fontSize: '0.85rem',
        },
    };

    return (
        <div ref={dropdownRef} style={styles.container}>
            <button
                style={styles.bellButton}
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={styles.badge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <div style={styles.dropdown}>
                <div style={styles.header}>
                    <span style={styles.headerTitle}>
                        Notifications
                        {unreadCount > 0 && (
                            <span style={{ color: '#6B7280', fontWeight: 400, fontSize: '0.8rem', marginLeft: '6px' }}>
                                ({unreadCount} unread)
                            </span>
                        )}
                    </span>
                    <div style={styles.headerActions}>
                        {unreadCount > 0 && (
                            <button
                                style={styles.actionButton}
                                onClick={markAllAsRead}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                title="Mark all as read"
                            >
                                <CheckCheck size={14} />
                                Mark all read
                            </button>
                        )}
                    </div>
                </div>

                <div style={styles.list}>
                    {loading && notifications.length === 0 ? (
                        <div style={styles.loadingState}>Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div style={styles.emptyState}>
                            <Bell size={32} style={{ marginBottom: '8px', opacity: 0.3 }} />
                            <div>No notifications yet</div>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                style={styles.notificationItem(notification.is_read)}
                                onClick={() => {
                                    if (!notification.is_read) {
                                        markAsRead(notification.id);
                                    }
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#F9FAFB';
                                    const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                                    if (deleteBtn) deleteBtn.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                    if (!notification.is_read) {
                                        e.currentTarget.style.background = 'rgba(61, 79, 71, 0.04)';
                                    } else {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                    const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                                    if (deleteBtn) deleteBtn.style.opacity = '0';
                                }}
                            >
                                <div style={{
                                    ...styles.iconWrapper,
                                    background: `${getTypeColor(notification.type)}15`,
                                }}>
                                    {getTypeIcon(notification.type)}
                                </div>
                                <div style={styles.content}>
                                    <div style={styles.message}>
                                        {notification.message}
                                    </div>
                                    <div style={styles.time}>
                                        <Clock size={10} />
                                        {formatTime(notification.created_at)}
                                    </div>
                                </div>
                                <button
                                    className="delete-btn"
                                    style={styles.deleteButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.color = '#E74C3C'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = '#D1D5DB'; }}
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationBell;