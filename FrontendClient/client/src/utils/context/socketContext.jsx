import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import env from '../config/env';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }

    return context;
    
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // Use centralized env config for socket URL
        // Default to hearse service on port 5002 for real-time hearse updates
        // Falls back to workshop service if SOCKET_URL is explicitly set
        const socketUrl = env.SOCKET_URL || 'http://localhost:5002';

        console.log('[Socket] Connecting to:', socketUrl);

        // Connect to Socket.IO server (workshop service by default)
        const socketInstance = io(socketUrl, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            // Add CORS and other options for better compatibility
            withCredentials: false,
            extraHeaders: {
                'x-tenant-slug': localStorage.getItem('tenantSlug') || localStorage.getItem('tenant_slug') || 'default'
            }
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            setConnected(true);

            // Tenant info
            const tenantSlug = localStorage.getItem('tenantSlug') || localStorage.getItem('tenant_slug') || 'default';
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : {};
            const userId = user?.user_id || user?.userId || null;
            const userRole = user?.role || null;

            // Emit both modern and legacy join events to support mixed server implementations
            // Modern central socket service expects kebab-case joining with payload
            try {
                socketInstance.emit('join-tenant', { tenantSlug, userId, userRole });
                console.log('[Socket] Emitted join-tenant to central socket service', { tenantSlug, userId });
            } catch (e) { console.warn('Failed to emit join-tenant', e); }

            // Legacy services (some microservices) still listen for underscore events — emit those too
            try {
                socketInstance.emit('join_tenant', tenantSlug);
                console.log('[Socket] Emitted legacy join_tenant', tenantSlug);
            } catch (e) { /* ignore */ }

            // Join branch rooms (both kebab-case and underscore) so branch-scoped updates are received
            const branchId = localStorage.getItem('branchId') || localStorage.getItem('branch_id');
            if (branchId) {
                try {
                    socketInstance.emit('join-branch', { tenantSlug, branchId });
                } catch (e) { /* ignore */ }
                try {
                    socketInstance.emit('join_branch', branchId);
                    console.log('[Socket] Joined branch room (legacy):', branchId);
                } catch (e) { /* ignore */ }
            }

            // Also request to join admin room if user role indicates admin
            if (userRole && String(userRole).toLowerCase().includes('admin')) {
                try { socketInstance.emit('join-admin'); } catch (e) { }
            }
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            setConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            setConnected(false);
        });

        socketInstance.on('reconnect', (attemptNumber) => {
            console.log(' Socket reconnected after', attemptNumber, 'attempts');
            setConnected(true);
        });

        socketInstance.on('reconnect_error', (error) => {
            console.error('Socket reconnection error:', error.message);
        });

        socketInstance.on('reconnect_failed', () => {
            console.error(' Socket reconnection failed after all attempts');
            setConnected(false);
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            if (socketInstance) {
                socketInstance.removeAllListeners();
                socketInstance.disconnect();
            }
        };
    }, []);

    const value = {
        socket,
        connected,
        joinBranch: (branchId) => {
            if (socket && branchId) {
                socket.emit('join_branch', branchId);
            }
        },
        joinAdmin: () => {
            if (socket) {
                socket.emit('join_admin');
            }
        },
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};