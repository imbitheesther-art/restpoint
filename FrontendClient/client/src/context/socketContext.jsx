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
        const socketUrl = env.SOCKET_URL || 'http://localhost:5001';

        // Connect to hearse service Socket.IO server
        const socketInstance = io(socketUrl, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        socketInstance.on('connect', () => {
            console.log('🔌 Socket connected:', socketInstance.id);
            setConnected(true);
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
            console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
            setConnected(true);
        });

        socketInstance.on('reconnect_error', (error) => {
            console.error('Socket reconnection error:', error.message);
        });

        socketInstance.on('reconnect_failed', () => {
            console.error('❌ Socket reconnection failed after all attempts');
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