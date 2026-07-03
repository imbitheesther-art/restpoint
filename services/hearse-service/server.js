const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();



const restpointRoutes = require('./routes/hearseRoutes');

const app = express();
const server = http.createServer(app);

// ============================================================
// Socket.IO — every branch connects to the SAME server instance,
// so io.emit() below reaches ALL branches simultaneously.
// This is what replaces the manual phone-call check.
// ============================================================
const io = new Server(server, {
    cors: {
        origin: '*', // restrict to your branch app domains in production
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
});

// Make io available inside controllers via req.app.get('io')
app.set('io', io);

// ============================================================
// Middleware
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded hearse images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// Socket.IO connection handling
// ============================================================
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Optional: let a branch join a room so you can target
    // branch-specific events later (e.g. driver dashboards)
    socket.on('join_branch', (branchId) => {
        socket.join(`branch_${branchId}`);
        console.log(` Socket ${socket.id} joined branch_${branchId}`);
    });

    socket.on('join_admin', () => {
        socket.join('admin');
        console.log(`Socket ${socket.id} joined admin room`);
    });

    socket.on('disconnect', () => {
        console.log(` Client disconnected: ${socket.id}`);
    });
});

// ============================================================
// Tenant Middleware - Set database context for each request
// ============================================================
app.use(async (req, res, next) => {
    try {
        // Extract tenant slug from headers (set by API gateway)
        const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-slug'];

        if (tenantSlug) {
            // Set the tenant database for this request
            await safeTenantQuery('SELECT 1');
            console.log(`[Tenant] Database set to: ${tenantSlug}`);
        } else {
            console.warn('[Tenant] No tenant slug found in headers');
        }

        next();
    } catch (error) {
        console.error('[Tenant] Error setting database:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to initialize tenant database',
            error: error.message
        });
    }
});

// ============================================================
// Routes - Mount at root since API Gateway strips /api/v1/restpoint prefix
// ============================================================
app.use('/', restpointRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'success', message: 'Server is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ status: 'error', message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Unhandled Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error.', error: err.message });
});

// ============================================================
// Start server
// ============================================================
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Socket.IO ready for real-time cross-branch updates`);
});

module.exports = { app, server, io };