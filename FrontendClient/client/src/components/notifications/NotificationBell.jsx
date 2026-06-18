import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { Bell, X, CheckCheck, Clock, AlertTriangle, Info, Calendar, CheckCircle2 } from 'lucide-react';
import { useParams } from 'react-router-dom';

// ============================================
// CONFIGURATION
// ============================================
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://weltcoverv1-insurancesystem.onrender.com';
const NOTIFICATION_API = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/notification`
  : 'http://localhost:8000/api/v1/restpoint/notification';
const POLL_INTERVAL = 30000; // 30 seconds fallback polling

// ============================================
// STYLED COMPONENTS
// ============================================
const styles = {
  wrapper: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  },
  bellButton: {
    position: 'relative',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    color: '#64748B',
  },
  badge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    background: '#EF4444',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '10px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
    border: '2px solid white',
  },
  panel: {
    position: 'absolute',
    top: '100%',
    right: '0',
    width: '360px',
    maxHeight: '480px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #E2E8F0',
    zIndex: 1000,
    overflow: 'hidden',
    marginTop: '8px',
    animation: 'slideDown 0.2s ease',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #E2E8F0',
    background: '#F8FAFC',
  },
  panelTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1E293B',
  },
  unreadCount: {
    fontSize: '11px',
    color: '#94A3B8',
    marginLeft: '6px',
  },
  markAllBtn: {
    background: 'none',
    border: 'none',
    color: '#3B82F6',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  list: {
    overflowY: 'auto',
    maxHeight: '400px',
  },
  item: (isRead, type) => ({
    display: 'flex',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid #F1F5F9',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    background: isRead ? 'white' : '#EFF6FF',
    opacity: isRead ? 0.7 : 1,
  }),
  iconWrapper: (type) => ({
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: getIconBg(type),
    color: getIconColor(type),
  }),
  content: {
    flex: 1,
    minWidth: 0,
  },
  message: {
    fontSize: '13px',
    color: '#334155',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  time: {
    fontSize: '11px',
    color: '#94A3B8',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#94A3B8',
  },
  emptyIcon: {
    marginBottom: '8px',
    opacity: 0.5,
  },
  emptyText: {
    fontSize: '13px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94A3B8',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
  },
  notificationDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#3B82F6',
    flexShrink: 0,
    marginTop: '4px',
  },
};

function getIconBg(type) {
  const map = {
    'task-completed': '#DCFCE7',
    'calendar_completed': '#DCFCE7',
    'new_body': '#DBEAFE',
    billing: '#FEF3C7',
    payment: '#DCFCE7',
    dispatch: '#F3E8FF',
    default: '#F1F5F9',
  };
  return map[type] || map.default;
}

function getIconColor(type) {
  const map = {
    'task-completed': '#16A34A',
    'calendar_completed': '#16A34A',
    'new_body': '#2563EB',
    billing: '#D97706',
    payment: '#16A34A',
    dispatch: '#9333EA',
    default: '#64748B',
  };
  return map[type] || map.default;
}

function getIcon(type) {
  switch (type) {
    case 'task-completed':
    case 'calendar_completed':
      return <CheckCircle2 size={16} />;
    case 'new_body':
      return <Info size={16} />;
    case 'billing':
    case 'billing-critical':
    case 'billing-threshold-exceeded':
      return <AlertTriangle size={16} />;
    case 'payment':
      return <CheckCheck size={16} />;
    default:
      return <Bell size={16} />;
  }
}

function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// ============================================
// MAIN COMPONENT
// ============================================
const NotificationBell = () => {
  const { slug } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const socketRef = useRef(null);

  // Get tenant slug
  const tenantSlug = slug || 
    localStorage.getItem('tenantSlug') || 
    (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').tenantSlug; } catch { return ''; }})();

  // Get auth token
  const getToken = () => localStorage.getItem('authToken') || localStorage.getItem('accessToken') || localStorage.getItem('token');

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const token = getToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (tenantSlug) headers['x-tenant-slug'] = tenantSlug;

      const response = await fetch(`${NOTIFICATION_API}/notifications?tenant=${tenantSlug}`, { headers });
      const result = await response.json();
      
      if (result.success && result.data) {
        setNotifications(result.data);
        setUnreadCount(result.data.filter(n => !n.is_read && !n.isRead).length);
      }
    } catch (err) {
      console.warn('[NotificationBell] Fetch error:', err.message);
    }
  }, [tenantSlug]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id) => {
    try {
      const token = getToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (tenantSlug) headers['x-tenant-slug'] = tenantSlug;

      await fetch(`${NOTIFICATION_API}/notifications/${id}/read`, { method: 'PUT', headers });
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: 1, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('[NotificationBell] Mark read error:', err.message);
    }
  }, [tenantSlug]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = getToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (tenantSlug) headers['x-tenant-slug'] = tenantSlug;

      await fetch(`${NOTIFICATION_API}/notifications/mark-all-read`, { method: 'PUT', headers });
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('[NotificationBell] Mark all read error:', err.message);
    }
  }, [tenantSlug]);

  // Handle incoming real-time notification
  const handleNotification = useCallback((data) => {
    const newNotif = {
      id: data.id || Date.now(),
      deceased_id: data.deceasedId || data.deceased_id,
      type: data.type || data.event || 'info',
      message: data.message || data.title || 'New notification',
      created_at: data.timestamp || new Date().toISOString(),
      is_read: 0,
      isRead: false,
    };

    setNotifications(prev => {
      // Don't add duplicates
      if (prev.some(n => n.id === newNotif.id)) return prev;
      return [newNotif, ...prev].slice(0, 50); // Keep max 50
    });
    setUnreadCount(prev => prev + 1);
  }, []);

  // Setup socket connection
  useEffect(() => {
    if (!tenantSlug) return;

    const token = getToken();
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      auth: { token, tenant_slug: tenantSlug },
      query: { tenant_slug: tenantSlug }
    });

    socket.on('connect', () => {
      socket.emit('join_tenant', { tenant_slug: tenantSlug });
    });

    // Listen for all notification types
    const events = [
      'new_notification', 'notification:task-completed', 'notification:deceased-admitted',
      'notification:status-change', 'notification:release-approved', 'notification:release-requested',
      'notification:payment-received', 'notification:invoice-created', 'alert:invoice-overdue',
      'alert:low-stock', 'notification:document-generated', 'notification:coffin-used',
      'deceased_created', 'dispatch_updated', 'billing_event', 'ready_for_dispatch',
    ];

    events.forEach(event => {
      socket.on(event, (data) => {
        handleNotification({ ...data, type: event, event });
      });
    });

    socketRef.current = socket;

    return () => {
      socket.emit('leave_tenant', { tenant_slug: tenantSlug });
      events.forEach(event => socket.off(event));
      socket.disconnect();
    };
  }, [tenantSlug, handleNotification]);

  // Initial fetch + polling fallback
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close panel on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [slug]);

  return (
    <div ref={panelRef} style={styles.wrapper}>
      <button
        style={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        title={`Notifications (${unreadCount} unread)`}
        onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={styles.panelTitle}>Notifications</span>
              {unreadCount > 0 && (
                <span style={styles.unreadCount}>({unreadCount} new)</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {unreadCount > 0 && (
                <button style={styles.markAllBtn} onClick={markAllAsRead}>
                  Mark all read
                </button>
              )}
              <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <X size={14} />
              </button>
            </div>
          </div>

          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <Bell size={32} />
                </div>
                <div style={styles.emptyText}>No notifications yet</div>
              </div>
            ) : (
              notifications.map((n) => {
                const isRead = n.is_read === 1 || n.isRead === true;
                const type = n.type?.replace('notification:', '').replace('alert:', '') || 'info';
                return (
                  <div
                    key={n.id}
                    style={styles.item(isRead, type)}
                    onClick={() => { if (!isRead) markAsRead(n.id); }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isRead ? '#F8FAFC' : '#DBEAFE'}
                    onMouseLeave={(e) => e.currentTarget.style.background = isRead ? 'white' : '#EFF6FF'}
                  >
                    <div style={styles.iconWrapper(type)}>
                      {getIcon(type)}
                    </div>
                    <div style={styles.content}>
                      <div style={styles.message}>{n.message}</div>
                      <div style={styles.time}>
                        <Clock size={10} />
                        {getTimeAgo(n.created_at || n.createdAt || n.timestamp)}
                      </div>
                    </div>
                    {!isRead && <div style={styles.notificationDot} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Keyframe animation */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;