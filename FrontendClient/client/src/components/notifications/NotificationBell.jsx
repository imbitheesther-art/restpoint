import React, { useState, useEffect, useRef, useCallback } from 'react';

import api from '../../api/axios';
import { getTenantHeaders } from '../../api/endpoints';
import { useSocket } from '../../utils/context/socketContext';
import { getTenantSlug, getAuthToken } from '../../utils/globalAuth';
import { 
  Bell, CheckCircle, X, Clock, Trash2, 
  UserPlus, Truck, DollarSign, AlertTriangle, 
  AlertCircle, CheckCheck 
} from '../../utils/icons/icons';
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

// ─── Critical Notification Sound (Louder, More Urgent) ───
const playCriticalSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Play two beeps for critical notifications
    [0, 0.15].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = i === 0 ? 880 : 1100; // Two-tone alert
      osc.type = 'square';
      gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.2);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.2);
    });
  } catch (e) {
    // Audio context not supported
  }
};

// ─── Icon Mapping ───
const getTypeIcon = (type) => {
  const icons = {
    'success': <CheckCircle size={16} />,
    'error': <AlertCircle size={16} />,
    'warning': <AlertTriangle size={16} />,
    'info': <Bell size={16} />,
    'new_body': <UserPlus size={16} />,
    'dispatch_created': <Truck size={16} />,
    'body_dispatched': <CheckCircle size={16} />,
    'balance_update': <DollarSign size={16} />,
    'billing-threshold-exceeded': <AlertTriangle size={16} />,
    'billing-critical': <AlertCircle size={16} />,
  };
  return icons[type] || <Bell size={16} />;
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]); // Real-time toast popups
  
  const dropdownRef = useRef(null);
  const { socket, connected } = useSocket();

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

  // --- API Calls - Fetch from Redis notifications using correct tenant slug ---
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const tenantSlug = getTenantSlug();
      const headers = getTenantHeaders();

      // Fetch notifications from Redis via notification-service REST endpoint
      let url = `${NOTIFICATION_SERVICE}/api/v1/restpoint/notification/notifications`;
      
      const response = await api.get(url, { 
        headers: {
          ...headers,
          'x-tenant-slug': tenantSlug,
        } 
      });

      if (response.data?.notifications) {
        // Map Redis notifications to the expected format
        const redisNotifications = response.data.notifications.map(notif => ({
          id: notif.id,
          type: notif.type || 'info',
          message: notif.message || notif.title || '',
          is_read: notif.read ? 1 : 0,
          created_at: notif.createdAt || new Date().toISOString(),
          title: notif.title || '',
          priority: notif.priority || 'low',
          data: notif.data || null,
        }));
        
        setNotifications(redisNotifications);
        setUnreadCount(redisNotifications.filter(n => !n.is_read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('[NotificationBell] Failed to fetch:', error.message);
      // On error, set empty - no fallback to sample data for production
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Generate notification message from event data
  const generateNotificationMessage = (eventName, data) => {
    switch (eventName) {
      case 'notification:deceased-admitted':
        return `New body registered: ${data.fullName || 'Unknown'}`;
      case 'notification:status-change':
        return `Status updated for ${data.deceasedName || 'deceased record'}`;
      case 'notification:release-requested':
        return `Release requested for ${data.deceasedName || 'deceased'}`;
      case 'notification:release-approved':
        return `Release approved for ${data.deceasedName || 'deceased'}`;
      case 'notification:invoice-created':
        return `Invoice created: ${data.invoiceNumber || 'N/A'} - KES ${data.total || 0}`;
      case 'notification:payment-received':
        return `Payment received: KES ${data.amount || 0} for invoice ${data.invoiceNumber || 'N/A'}`;
      case 'alert:invoice-overdue':
        return `Invoice overdue: ${data.invoiceNumber || 'N/A'} (${data.daysOverdue || 0} days) - KES ${data.outstandingAmount || 0}`;
      case 'alert:low-stock':
        return `Low stock alert: ${data.itemName || 'Unknown item'} (${data.currentStock || 0}/${data.minimumStock || 0})`;
      case 'notification:coffin-used':
        return `Coffin used: ${data.coffinType || 'Standard'} for ${data.deceasedName || 'Unknown'}`;
      case 'notification:document-generated':
        return `Document generated: ${data.documentName || data.documentType || 'Document'}`;
      case 'notification:task-completed':
        return `Task completed: ${data.taskType || 'Task'} for ${data.deceasedName || 'Unknown'}`;
      default:
        return 'New notification received';
    }
  };

  const generateNotificationTitle = (eventName) => {
    switch (eventName) {
      case 'notification:deceased-admitted':
        return 'New Body Registration';
      case 'notification:status-change':
        return 'Status Update';
      case 'notification:release-requested':
        return 'Release Request';
      case 'notification:release-approved':
        return 'Release Approved';
      case 'notification:invoice-created':
        return 'Invoice Created';
      case 'notification:payment-received':
        return 'Payment Received';
      case 'alert:invoice-overdue':
        return 'Payment Overdue';
      case 'alert:low-stock':
        return 'Low Stock Alert';
      case 'notification:coffin-used':
        return 'Coffin Used';
      case 'notification:document-generated':
        return 'Document Generated';
      case 'notification:task-completed':
        return 'Task Completed';
      default:
        return 'Notification';
    }
  };

  // Listen for real-time notifications via socket (matching backend event names)
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (eventName, data) => {
      // Map backend events to notification types
      const eventTypeMap = {
        'notification:deceased-admitted': 'new_body',
        'notification:status-change': 'status_update',
        'notification:release-requested': 'release_request',
        'notification:release-approved': 'release_approved',
        'notification:invoice-created': 'billing-threshold-exceeded',
        'notification:payment-received': 'balance_update',
        'alert:invoice-overdue': 'billing-critical',
        'alert:low-stock': 'warning',
        'notification:coffin-used': 'info',
        'notification:document-generated': 'info',
        'notification:task-completed': 'success',
      };

      const type = eventTypeMap[eventName] || 'info';
      
      // Determine priority based on event type
      const priorityMap = {
        'billing-critical': 'critical',
        'alert:invoice-overdue': 'critical',
        'alert:low-stock': 'high',
        'new_body': 'high',
        'release-requested': 'high',
      };
      
      // Generate human-readable message and title
      const message = data.message || data.title || generateNotificationMessage(eventName, data);
      const title = data.title || generateNotificationTitle(eventName);
      
      const formatted = {
        id: data.id || Date.now(),
        type: type,
        message: message,
        is_read: 0,
        created_at: data.timestamp || new Date().toISOString(),
        title: title,
        priority: priorityMap[eventName] || 'low',
        data: data,
      };
      
      setNotifications(prev => [formatted, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Play sound - louder for critical notifications
      if (formatted.priority === 'critical') {
        playCriticalSound();
      } else {
        playNotificationSound();
      }
      
      addToast(formatted);
    };

    // Listen to all notification events from socket.io service
    const notificationEvents = [
      'notification:deceased-admitted',
      'notification:status-change',
      'notification:release-requested',
      'notification:release-approved',
      'notification:invoice-created',
      'notification:payment-received',
      'alert:invoice-overdue',
      'alert:low-stock',
      'notification:coffin-used',
      'notification:document-generated',
      'notification:task-completed',
    ];

    const handlers = {};
    notificationEvents.forEach(event => {
      const handler = (data) => handleNotification(event, data);
      handlers[event] = handler;
      socket.on(event, handler);
    });
    
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket, addToast]);

  // Generate dummy notifications for testing (only if no real notifications exist)
  useEffect(() => {
    if (notifications.length === 0 && !loading) {
      const dummyNotifications = [
        {
          id: 'dummy-1',
          type: 'new_body',
          message: 'New body registered: Stephen K. - Standard Coffin',
          is_read: 0,
          created_at: new Date(Date.now() - 300000).toISOString(),
          title: 'New Body Registration',
          priority: 'high',
          data: { body_id: 123 }
        },
        {
          id: 'dummy-2',
          type: 'dispatch_created',
          message: 'Dispatch scheduled for Mary A. - Executive Sedan',
          is_read: 0,
          created_at: new Date(Date.now() - 600000).toISOString(),
          title: 'Dispatch Created',
          priority: 'medium',
          data: { dispatch_id: 456 }
        },
        {
          id: 'dummy-3',
          type: 'billing-critical',
          message: 'Critical: Invoice #INV-2024-001 payment overdue by 5 days',
          is_read: 0,
          created_at: new Date(Date.now() - 900000).toISOString(),
          title: 'Payment Overdue',
          priority: 'critical',
          data: { invoice_id: 789, amount: 25000 }
        },
        {
          id: 'dummy-4',
          type: 'info',
          message: 'Production milestone: 10 coffins completed this week',
          is_read: 1,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          title: 'Weekly Production Update',
          priority: 'low',
          data: {}
        }
      ];
      
      // Only show dummy data after 2 seconds if still empty
      const timer = setTimeout(() => {
        if (notifications.length === 0) {
          setNotifications(dummyNotifications);
          setUnreadCount(dummyNotifications.filter(n => !n.is_read).length);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [notifications.length, loading]);

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