import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

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
        // Connect to hearse service Socket.IO server
        const socketInstance = io('http://localhost:5001', {
            transports: ['websocket', 'polling'],
            autoConnect: true,
        });

        socketInstance.on('connect', () => {
            console.log('🔌 Socket connected:', socketInstance.id);
            setConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setConnected(false);
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            if (socketInstance) {
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