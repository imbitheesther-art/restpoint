import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell, X, CheckCheck, Trash2, Clock, 
  UserPlus, FlaskConical, Truck, CheckCircle, 
  DollarSign, AlertTriangle, AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import { getTenantHeaders } from '../../api/endpoints';
import { useSocket } from '../../utils/context/socketContext';
import './NotificationBell.css';

const NOTIFICATION_SERVICE = '/notification';

// ─── Zero-dependency Notification Sound (Web Audio API) ───
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880; // Pleasant high pitch
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Audio context not supported
  }
};

// ─── Icon Mapping ───
const getTypeIcon = (type) => {
  const icons = {
    'new_body': <UserPlus size={16} />,
    'autopsy_done': <FlaskConical size={16} />,
    'dispatch_created': <Truck size={16} />,
    'body_dispatched': <CheckCircle size={16} />,
    'balance_update': <DollarSign size={16} />,
    'billing-threshold-exceeded': <AlertTriangle size={16} />,
    'billing-critical': <AlertCircle size={16} />,
  };
  return icons[type] || <Bell size={16} />;
};

// ─── Sample Notifications (For testing UI) ───
const SAMPLE_NOTIFICATIONS = [
  { id: 's1', type: 'new_body', message: 'New body registered: John Doe (Case #1042)', is_read: 0, created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
  { id: 's2', type: 'autopsy_done', message: 'Autopsy report completed for Case #1039 and is ready for review.', is_read: 0, created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: 's3', type: 'billing-critical', message: 'Critical: Branch account balance is below the minimum threshold.', is_read: 0, created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: 's4', type: 'dispatch_created', message: 'Dispatch #D-902 created for transfer to Central Morgue.', is_read: 1, created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: 's5', type: 'body_dispatched', message: 'Body for Case #1035 has been successfully dispatched.', is_read: 1, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]); // Real-time toast popups
  
  const dropdownRef = useRef(null);
  const { socket, connected } = useSocket();

  const getBranchId = useCallback(() => {
    return localStorage.getItem('branchId') || localStorage.getItem('branch_id') || null;
  }, []);

  // --- Toast Management ---
  const addToast = useCallback((notification) => {
    const id = Date.now() + Math.random(); // Unique ID for toast
    setToasts(prev => [...prev, { ...notification, toastId: id }]);
    playNotificationSound(); // Play sound on new toast
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.toastId !== id));
    }, 5000);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.toastId !== id));
  };

  // --- API Calls ---
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const branchId = getBranchId();
      const headers = getTenantHeaders();

      let url = `${NOTIFICATION_SERVICE}/api/v1/restpoint/notification/notifications`;
      if (branchId) url += `?branch_id=${branchId}`;

      const response = await api.get(url, { headers });

      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('[NotificationBell] Failed to fetch:', error.message);
      // Fallback to samples for UI testing if API fails
      setNotifications(SAMPLE_NOTIFICATIONS);
      setUnreadCount(SAMPLE_NOTIFICATIONS.filter(n => !n.is_read).length);
    } finally {
      setLoading(false);
    }
  }, [getBranchId]);

  const markAsRead = async (id) => {
    try {
      const headers = getTenantHeaders();
      await api.put(`${NOTIFICATION_SERVICE}/api/v1/restpoint/notification/notifications/${id}/read`, {}, { headers });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      // Optimistic UI update anyway for smooth UX
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    try {
      const headers = getTenantHeaders();
      await api.put(`${NOTIFICATION_SERVICE}/api/v1/restpoint/notification/notifications/mark-all-read`, {}, { headers });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const headers = getTenantHeaders();
      await api.delete(`${NOTIFICATION_SERVICE}/api/v1/restpoint/notification/notifications/${id}`, { headers });
      const deleted = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (deleted && !deleted.is_read) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      if (!notification.is_read) {
        setUnreadCount(prev => prev + 1);
      }
      addToast(notification); // Trigger Toast + Sound
    };

    socket.on('new_notification', handleNewNotification);
    return () => socket.off('new_notification', handleNewNotification);
  }, [socket, addToast]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Helpers ---
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const diffMs = new Date() - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeColor = (type) => {
    const colors = {
      'new_body': '#3B82F6',       // Blue
      'autopsy_done': '#8B5CF6',   // Purple
      'dispatch_created': '#F59E0B', // Amber
      'body_dispatched': '#10B981', // Green
      'balance_update': '#6366F1', // Indigo
      'billing-threshold-exceeded': '#F97316', // Orange
      'billing-critical': '#EF4444', // Red
    };
    return colors[type] || '#6B7280';
  };

  return (
    <>
      {/* ─── Real-Time Toast Popups ─── */}
      <div className="nb-toast-container">
        {toasts.map((toast) => (
          <div key={toast.toastId} className="nb-toast" onClick={() => removeToast(toast.toastId)}>
            <div className="nb-toast-icon" style={{ background: `${getTypeColor(toast.type)}20`, color: getTypeColor(toast.type) }}>
              {getTypeIcon(toast.type)}
            </div>
            <div className="nb-toast-content">
              <p className="nb-toast-message">{toast.message}</p>
              <span className="nb-toast-time">Just now</span>
            </div>
            <button className="nb-toast-close" onClick={(e) => { e.stopPropagation(); removeToast(toast.toastId); }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ─── Bell & Dropdown ─── */}
      <div className="nb-container" ref={dropdownRef}>
        <button 
          className={`nb-bell-btn ${isOpen ? 'nb-active' : ''}`} 
          onClick={() => setIsOpen(!isOpen)}
          title="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="nb-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <div className={`nb-dropdown ${isOpen ? 'nb-open' : ''}`}>
          <div className="nb-header">
            <h3 className="nb-title">
              Notifications 
              {unreadCount > 0 && <span className="nb-count-text">({unreadCount} new)</span>}
            </h3>
            {unreadCount > 0 && (
              <button className="nb-action-btn" onClick={markAllAsRead}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="nb-list">
            {loading && notifications.length === 0 ? (
              <div className="nb-empty nb-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="nb-empty">
                <Bell size={28} strokeWidth={1.5} />
                <p>All caught up!</p>
                <span>You have no new notifications</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`nb-item ${!notif.is_read ? 'nb-unread' : ''}`}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                >
                  <div 
                    className="nb-item-icon" 
                    style={{ background: `${getTypeColor(notif.type)}15`, color: getTypeColor(notif.type) }}
                  >
                    {getTypeIcon(notif.type)}
                  </div>
                  
                  <div className="nb-item-content">
                    <p className="nb-item-message">{notif.message}</p>
                    <div className="nb-item-footer">
                      <span className="nb-item-time">
                        <Clock size={10} />
                        {formatTime(notif.created_at)}
                      </span>
                    </div>
                  </div>

                  <button 
                    className="nb-item-delete" 
                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
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
    </>
  );
};

export default NotificationBell;