/**
 * Workshop Service - Socket.io Setup with Room-based Broadcasting
 */

import { Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocket = (server: Server) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`[WORKSHOP] Client connected: ${socket.id}`);

        // Join tenant-specific room
        socket.on('join_tenant', (tenantSlug: string) => {
            socket.join(`tenant:${tenantSlug}`);
            console.log(`[WORKSHOP] Socket ${socket.id} joined tenant room: ${tenantSlug}`);
        });

        // Join branch-specific room
        socket.on('join_branch', (branchId: string) => {
            socket.join(`branch:${branchId}`);
            console.log(`[WORKSHOP] Socket ${socket.id} joined branch room: ${branchId}`);
        });

        // Join admin room for system-wide notifications
        socket.on('join_admin', () => {
            socket.join('admin');
            console.log(`[WORKSHOP] Socket ${socket.id} joined admin room`);
        });

        socket.on('disconnect', () => {
            console.log(`[WORKSHOP] Client disconnected: ${socket.id}`);
        });
    });

    console.log('[WORKSHOP] Socket.io initialized with room support');
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Helper function to emit to specific tenant room
export const emitToTenant = (tenantSlug: string, event: string, data: any) => {
    if (io) {
        io.to(`tenant:${tenantSlug}`).emit(event, data);
    }
};

// Helper function to emit to specific branch room
export const emitToBranch = (branchId: string, event: string, data: any) => {
    if (io) {
        io.to(`branch:${branchId}`).emit(event, data);
    }
};

// Helper function to emit to all connected clients
export const emitToAll = (event: string, data: any) => {
    if (io) {
        io.emit(event, data);
    }
};
