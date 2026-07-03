/**
 * Workshop Service - Socket.io Setup
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

        socket.on('disconnect', () => {
            console.log(`[WORKSHOP] Client disconnected: ${socket.id}`);
        });
    });

    console.log('[WORKSHOP] Socket.io initialized');
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};