require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const { safeTenantQuery, safeTenantExecute } = require('../../shared/dbConfig');
const { validateTenantActive } = require('../../shared/tenancy');

const restpointRoutes = require('./routes/hearseRoutes');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
});

app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    socket.on('join_branch', (branchId) => {
        socket.join(`branch_${branchId}`);
        console.log(`Socket ${socket.id} joined branch_${branchId}`);
    });
    socket.on('join_admin', () => {
        socket.join('admin');
        console.log(`Socket ${socket.id} joined admin room`);
    });
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Tenant Middleware
app.use(async (req, res, next) => {
    try {
        const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-slug'] || 'system_shared';
        const branchId = req.headers['x-branch-id'] || null;

        req.tenantSlug = tenantSlug;
        req.branchId = branchId;

        console.log(`[HEARSE] ${req.method} ${req.path} - Tenant: ${tenantSlug}`);

        if (tenantSlug === 'system_shared') {
            req.tenant = {
                db_name: process.env.DB_NAME || 'restpoint_db',
                tenant_id: 1,
                name: 'System Shared'
            };
            return next();
        }

        const tenantStatus = await validateTenantActive(tenantSlug);
        if (!tenantStatus.active) {
            return res.status(403).json({
                status: 'error',
                message: tenantStatus.reason || 'Tenant not active'
            });
        }

        req.tenant = tenantStatus.tenant;
        console.log(`[HEARSE] Tenant validated: ${tenantStatus.tenant.db_name}`);

        // Resolve branch if not provided
        if (!req.branchId && tenantStatus.tenant?.db_name) {
            try {
                const branches = await safeTenantQuery(
                    tenantStatus.tenant.db_name,
                    'SELECT branch_id FROM branches LIMIT 1'
                );
                if (branches.length > 0) {
                    req.branchId = branches[0].branch_id.toString();
                    console.log(`[HEARSE] Branch resolved: ${req.branchId}`);
                }
            } catch (e) {
                console.log('[HEARSE] Branch resolution skipped:', e.message);
            }
        }

        next();
    } catch (error) {
        console.error('[HEARSE] Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to initialize tenant database',
            error: error.message
        });
    }
});

// ============================================================
// Routes - Mount at root for clean path forwarding from gateway
// ============================================================
// The API Gateway strips /api/v1/restpoint prefix and forwards clean paths
// So we mount at / and routes use clean paths like /hearses, /hearse-bookings, etc.
app.use('/', restpointRoutes);

// Health checks
app.get('/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'Hearse Service is running',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Hearse Service',
        endpoints: {
            hearses: 'POST/GET /hearses',
            hearse_detail: 'PUT/DELETE /hearses/:id',
            available: 'GET /hearses/available',
            bookings: 'POST/GET /hearse-bookings',
            drivers: 'GET /all-drivers',
            health: 'GET /health'
        }
    });
});

// ============================================================
// Debug: Print all registered routes
// ============================================================
console.log('\n Registered Routes:');
app._router.stack.forEach((layer) => {
    if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        console.log(`   ${methods}  ${layer.route.path}`);
    }
    if (layer.name === 'router' && layer.handle.stack) {
        layer.handle.stack.forEach((l) => {
            if (l.route) {
                const methods = Object.keys(l.route.methods).join(', ').toUpperCase();
                console.log(`   ${methods}  ${l.route.path}`);
            }
        });
    }
});
console.log('');

// 404 handler
app.use((req, res) => {
    console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found.`,
        available_endpoints: {
            hearses: 'POST/GET /hearses',
            hearse_detail: 'PUT/DELETE /hearses/:id',
            available: 'GET /hearses/available',
            bookings: 'POST/GET /hearse-bookings',
            drivers: 'GET /all-drivers',
            health: 'GET /health'
        }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Unhandled Error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5002;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Socket.IO ready for real-time cross-branch updates`);
    console.log(`\n📋 Available Endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/`);
    console.log(`   GET  http://localhost:${PORT}/health`);
    console.log(`   POST http://localhost:${PORT}/hearses`);
    console.log(`   GET  http://localhost:${PORT}/hearses`);
    console.log(`   GET  http://localhost:${PORT}/hearses/available`);
    console.log(`   POST http://localhost:${PORT}/hearse-bookings`);
    console.log(`   GET  http://localhost:${PORT}/hearse-bookings\n`);
});

module.exports = { app, server, io };