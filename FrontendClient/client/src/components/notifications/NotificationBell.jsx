import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/axios';
import { getTenantHeaders } from '../../api/endpoints';
import { useSocket } from '../../utils/context/socketContext';
import { getTenantSlug, getAuthToken } from '../../utils/globalAuth';
import { 
  Bell, CheckCircle, X, Clock, Trash2, 
  UserPlus, Truck, DollarSign, AlertTriangle, 
  AlertCircle, CheckCheck, ChevronDown
} from '../../utils/icons/icons';
import './NotificationBell.css';

const NOTIFICATION_SERVICE = '/notification';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [expandedId, setExpandedId] = useState(null); // Track which notification is expanded
  
  const dropdownRef = useRef(null);
  const audioRef = useRef(null); // Ref for the audio element
  const { socket, connected } = useSocket();

  // --- Play Notification Sound from audio.mp3 ---
  const playNotificationSound = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // Rewind to start
        audioRef.current.play().catch(e => console.warn("Audio playback failed:", e));
      }
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  }, []);

  // --- Icon Mapping ---
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

  // --- Toast Management ---
  const addToast = useCallback((notification) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...notification, toastId: id }]);
    playNotificationSound(); // Play audio.mp3 on new toast
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.toastId !== id));
    }, 6000); // Auto-remove after 6 seconds
  }, [playNotificationSound]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.toastId !== id));
  };

  // --- API Calls ---
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const tenantSlug = getTenantSlug();
      const headers = getTenantHeaders();
      const url = `${NOTIFICATION_SERVICE}/notifications`;
      
      const response = await api.get(url, { 
        headers: { ...headers, 'x-tenant-slug': tenantSlug },
        // Prevent service worker from caching
        params: { _t: Date.now() }
      });

      if (response.data?.notifications) {
        const redisNotifications = response.data.notifications.map(notif => ({
          id: notif.id,
          type: notif.type || 'info',
          message: notif.message || notif.title || '',
          fullContent: notif.fullContent || notif.message || 'No additional details provided.',
          is_read: notif.read ? 1 : 0,
          created_at: notif.createdAt || new Date().toISOString(),
          title: notif.title || 'Notification',
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
      // Silently handle notification service errors (service may not be running)
      // Only log in development mode
      if (import.meta.env.DEV) {
        console.warn('[NotificationBell] Service unavailable:', error.message);
      }
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      const headers = getTenantHeaders();
      await api.put(`${NOTIFICATION_SERVICE}/notifications/${id}/read`, {}, { headers });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    try {
      const headers = getTenantHeaders();
      await api.put(`${NOTIFICATION_SERVICE}/notifications/mark-all-read`, {}, { headers });
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
      await api.delete(`${NOTIFICATION_SERVICE}/notifications/${id}`, { headers });
      const deleted = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (deleted && !deleted.is_read) setUnreadCount(prev => Math.max(0, prev - 1));
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Real-time Socket Listener
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (eventName, data) => {
      console.log('[NOTIFICATION] 🔔 Socket event received:', {
        eventName,
        data,
        timestamp: new Date().toISOString()
      });

      const eventTypeMap = {
        'notification:deceased-admitted': 'new_body',
        'notification:status-change': 'info',
        'notification:release-requested': 'warning',
        'notification:invoice-created': 'balance_update',
        'alert:invoice-overdue': 'billing-critical',
        'alert:low-stock': 'warning',
        'notification:postmortem-completed': 'success',
      };

      const type = eventTypeMap[eventName] || 'info';
      const title = data.title || eventName.split(':').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const message = data.message || `New event: ${title}`;
      const fullContent = data.fullContent || data.details || message;
      
      const formatted = {
        id: data.id || Date.now(),
        type,
        message,
        fullContent,
        is_read: 0,
        created_at: data.timestamp || new Date().toISOString(),
        title,
        priority: data.priority || 'low',
        data,
      };
      
      console.log('[NOTIFICATION] ✅ Formatted notification:', formatted);
      
      setNotifications(prev => [formatted, ...prev]);
      setUnreadCount(prev => prev + 1);
      addToast(formatted);
    };

    const notificationEvents = [
      'notification:deceased-admitted', 'notification:status-change',
      'notification:release-requested', 'notification:invoice-created',
      'notification:payment-received', 'alert:invoice-overdue',
      'alert:low-stock', 'notification:coffin-used',
      'notification:body-released', 'notification:postmortem-completed',
    ];

    console.log('[NOTIFICATION] 📡 Registering socket listeners for events:', notificationEvents);

    const handlers = {};
    notificationEvents.forEach(event => {
      const handler = (data) => handleNotification(event, data);
      handlers[event] = handler;
      socket.on(event, handler);
      console.log(`[NOTIFICATION] 📡 Registered listener for: ${event}`);
    });
    
    console.log('[NOTIFICATION] ✅ All socket listeners registered successfully');

    return () => {
      console.log('[NOTIFICATION] 🧹 Cleaning up socket listeners');
      Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
    };
  }, [socket, addToast]);


  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setExpandedId(null);
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
      'new_body': '#3B82F6', 'autopsy_done': '#8B5CF6', 'dispatch_created': '#F59E0B',
      'body_dispatched': '#10B981', 'balance_update': '#6366F1', 'billing-critical': '#EF4444',
    };
    return colors[type] || '#6B7280';
  };

  const handleItemClick = (notif) => {
    if (!notif.is_read) markAsRead(notif.id);
    setExpandedId(expandedId === notif.id ? null : notif.id);
  };

  return (
    <>
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} src="/audio/alert.mp3" preload="auto" />

      {/* ─── Real-Time Toast Popups ─── */}
      <div className="nb-toast-container">
        {toasts.map((toast) => (
          <div key={toast.toastId} className="nb-toast" onClick={() => removeToast(toast.toastId)}>
            <div className="nb-toast-icon" style={{ background: `${getTypeColor(toast.type)}20`, color: getTypeColor(toast.type) }}>
              {getTypeIcon(toast.type)}
            </div>
            <div className="nb-toast-content">
              <p className="nb-toast-title">{toast.title}</p>
              <p className="nb-toast-message">{toast.message}</p>
              <span className="nb-toast-time"><Clock size={10} /> Just now</span>
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
            <span className="nb-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
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
              <div className="nb-empty nb-loading">Loading notifications...</div>
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
                  className={`nb-item ${!notif.is_read ? 'nb-unread' : ''} ${expandedId === notif.id ? 'nb-expanded' : ''}`}
                  onClick={() => handleItemClick(notif)}
                >
                  <div 
                    className="nb-item-icon" 
                    style={{ background: `${getTypeColor(notif.type)}15`, color: getTypeColor(notif.type) }}
                  >
                    {getTypeIcon(notif.type)}
                  </div>
                  
                  <div className="nb-item-content">
                    <div className="nb-item-top">
                      <p className="nb-item-title">{notif.title}</p>
                      <span className="nb-item-time"><Clock size={10} /> {formatTime(notif.created_at)}</span>
                    </div>
                    <p className="nb-item-message">{notif.message}</p>
                    
                    {/* Expandable Full Content */}
                    {expandedId === notif.id && (
                      <div className="nb-item-details">
                        <div className="nb-detail-divider"></div>
                        <p className="nb-detail-text">{notif.fullContent}</p>
                        {notif.data && Object.keys(notif.data).length > 0 && (
                          <div className="nb-detail-meta">
                            <strong>Metadata:</strong>
                            <pre>{JSON.stringify(notif.data, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    )}

                    {expandedId !== notif.id && (
                      <div className="nb-expand-hint">
                        Click to read more <ChevronDown size={12} />
                      </div>
                    )}
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