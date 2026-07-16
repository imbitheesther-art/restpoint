// Load service-specific .env first (has PORT=5023), then root .env for shared config
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const { safeTenantQuery, safeTenantExecute, resolveDatabase, getTenantDB, getRootPool } = require('../../shared/dbConfig');
const { validateTenantActive } = require('../../shared/tenancy');
const Logger = require('../../services/app-global/middlewares/serviceDiscovery').Logger;
const mysql = require('mysql2/promise');
const asyncHandler = require('express-async-handler');

const restpointRoutes = require('./routes/hearseRoutes');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
    cors: {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
});

app.set('io', io);

// Middleware
const corsOptions = {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-slug', 'x-tenant-id', 'x-user-id', 'x-branch-id', 'x-branch-code']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO connection handling
io.on('connection', (socket) => {
    Logger.info(`Socket connected: ${socket.id}`);

    socket.on('join_branch', (branchId) => {
        socket.join(`branch_${branchId}`);
        Logger.info(`Socket ${socket.id} joined branch ${branchId}`);
    });
    socket.on('join_admin', () => {
        socket.join('admin');
        Logger.info(`Socket ${socket.id} joined admin room`);
    });
    socket.on('disconnect', () => {
        Logger.info(`Socket disconnected: ${socket.id}`);
    });
});

// Tenant Middleware - supports both tenant slugs and branch database name slugs
app.use(async (req, res, next) => {
    try {
        let tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-slug'] || 'system_shared';
        const branchId = req.headers['x-branch-id'] || null;

        req.tenantSlug = tenantSlug;
        req.branchId = branchId;

        Logger.info(`[HEARSE] ${req.method} ${req.path} - Tenant: ${tenantSlug}`);

        if (tenantSlug === 'system_shared') {
            req.tenant = {
                db_name: process.env.DB_NAME || 'restpoint_main',
                tenant_id: 1,
                name: 'System Shared'
            };
            return next();
        }

        // Resolve database directly — no active-status blocking
        let dbName = await resolveDatabase(tenantSlug);

        // Fallback: try converting slug to db name (e.g. mumo-feuneral-nairobi → mumo_feuneral_nairobi)
        if (!dbName) {
            dbName = tenantSlug.replace(/-/g, '_');
        }

        // For branch-level slugs (e.g. mumo-feuneral-machakos), resolve the parent tenant slug
        // so that safeQuery() and other tenant-aware functions work correctly.
        // We also store the list of ALL branch database names for this tenant (for cross-branch queries).
        let resolvedTenantSlug = tenantSlug;
        let allBranchDbs = null;
        if (dbName && tenantSlug !== 'system_shared') {
            try {
                const rootPool = await getRootPool();
                // First try direct lookup in tenants table (main branch)
                const [tenantRows] = await rootPool.query(
                    'SELECT tenant_slug, id FROM tenant_tracking.tenants WHERE db_name = ? AND status = "active" LIMIT 1',
                    [dbName]
                );
                if (tenantRows && tenantRows.length > 0) {
                    resolvedTenantSlug = tenantRows[0].tenant_slug;
                    const tenantId = tenantRows[0].id;
                    // Get all branch databases for this tenant
                    const [branchRows] = await rootPool.query(
                        'SELECT branch_slug, branch_db_name FROM tenant_tracking.branch_tracking WHERE tenant_id = ?',
                        [tenantId]
                    );
                    allBranchDbs = branchRows.map(r => r.branch_db_name).filter(Boolean);
                    Logger.info(`[HEARSE] Found ${allBranchDbs.length} branch databases for tenant ${resolvedTenantSlug}`);
                } else {
                    // Fallback: check if this slug is a branch slug in branch_tracking
                    const [branchRows] = await rootPool.query(
                        `SELECT bt.branch_db_name, bt.tenant_id, t.tenant_slug 
                         FROM tenant_tracking.branch_tracking bt
                         JOIN tenant_tracking.tenants t ON bt.tenant_id = t.id
                         WHERE bt.branch_slug = ?`,
                        [tenantSlug]
                    );
                    if (branchRows && branchRows.length > 0) {
                        const row = branchRows[0];
                        resolvedTenantSlug = row.tenant_slug;
                        // Get all sibling branch databases
                        const [siblingRows] = await rootPool.query(
                            'SELECT branch_slug, branch_db_name FROM tenant_tracking.branch_tracking WHERE tenant_id = ?',
                            [row.tenant_id]
                        );
                        allBranchDbs = siblingRows.map(r => r.branch_db_name).filter(Boolean);
                        Logger.info(`[HEARSE] Branch slug ${tenantSlug} resolved to tenant ${resolvedTenantSlug}, ${allBranchDbs.length} branches`);
                    }
                }
            } catch (e) {
                Logger.warn(`[HEARSE] Could not resolve parent tenant: ${e.message}`);
            }
        }

        req.tenantSlug = resolvedTenantSlug;
        req.currentDbName = dbName;
        req.allBranchDbs = allBranchDbs;
        req.tenant = {
            db_name: dbName,
            tenant_slug: resolvedTenantSlug,
            name: resolvedTenantSlug,
            all_branch_dbs: allBranchDbs
        };

        Logger.info(`[HEARSE] Tenant resolved: ${dbName} (slug: ${resolvedTenantSlug})`);

        // Resolve branch if not provided
        if (!req.branchId && dbName) {
            try {
                const branches = await safeTenantQuery(
                    dbName,
                    'SELECT branch_id FROM branches LIMIT 1'
                );
                if (branches.length > 0) {
                    req.branchId = branches[0].branch_id.toString();
                    Logger.info(`[HEARSE] Branch resolved: ${req.branchId}`);
                }
            } catch (e) {
                Logger.error(`[HEARSE] Branch resolution skipped: ${e.message}`);
            }
        }

        next();
    } catch (error) {
        // Even on error, fall through with a default db rather than blocking
        Logger.error(`[HEARSE] Tenant resolution error: ${error.message}`);
        const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-slug'] || 'system_shared';
        req.tenant = {
            db_name: process.env.DB_NAME || 'restpoint_main',
            tenant_slug: tenantSlug,
            name: tenantSlug
        };
        next();
    }
});

// ============================================================
// TENANT CONFIG/SETTINGS/BRANCHES ROUTES
// These are served directly here because the frontend app (useAppInitialization)
// calls /tenants/:slug/config, /tenant/:slug/settings, /tenant/:slug/branches
// to determine single vs multi-tenant mode BEFORE other API calls.
// The API gateway routes 'tenants' and 'tenant' prefixes here.
// ============================================================

// GET /tenants/:tenantSlug/config - Tenant configuration (deployment type, etc.)
app.get('/tenants/:tenantSlug/config', asyncHandler(async (req, res) => {
    const { tenantSlug } = req.params;

    try {
        // Resolve tenant from slug
        const rootPool = await getRootPool();
        const [tenantRows] = await rootPool.query(
            'SELECT * FROM tenant_tracking.tenants WHERE tenant_slug = ? AND status = "active" LIMIT 1',
            [tenantSlug]
        );

        if (!tenantRows || tenantRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }

        const tenant = tenantRows[0];

        // Get branch count
        let branchCount = 0;
        try {
            const pool = await getTenantDB(tenant.db_name);
            const [branches] = await pool.query('SELECT COUNT(*) as count FROM branches WHERE is_active = TRUE');
            branchCount = branches[0]?.count || 0;
        } catch (e) {
            // Branch table may not exist
        }

        // Get deployment type
        let deploymentType = branchCount > 1 ? 'multi' : 'single';

        res.json({
            success: true,
            data: {
                deploymentType,
                branchCount,
                tenantName: tenant.tenant_name,
                tenantSlug: tenant.tenant_slug,
                country: tenant.country,
                location: tenant.location,
                email: tenant.email
            }
        });
    } catch (error) {
        Logger.error(`[HEARSE] /tenants/:slug/config error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
}));

// GET /tenant/:tenantSlug/settings - Tenant settings (simplified, for frontend)
app.get('/tenant/:tenantSlug/settings', asyncHandler(async (req, res) => {
    const { tenantSlug } = req.params;

    try {
        // Use the already-set req.tenant from middleware if available
        if (req.tenant && req.tenant.tenant_slug === tenantSlug) {
            let branchCount = 0;
            try {
                const branches = await safeTenantQuery(
                    req.tenant.db_name,
                    'SELECT COUNT(*) as count FROM branches WHERE is_active = TRUE'
                );
                branchCount = branches[0]?.count || 0;
            } catch (e) { }

            return res.json({
                success: true,
                data: {
                    deploymentType: branchCount > 1 ? 'multi' : 'single',
                    branchCount,
                    tenantName: req.tenant.tenant_name || req.tenant.name,
                    tenantSlug: req.tenant.tenant_slug || tenantSlug,
                    country: req.tenant.country || 'Kenya',
                    location: req.tenant.location || '',
                    email: req.tenant.email || ''
                }
            });
        }

        // Fallback: look up via root pool
        const rootPool = await getRootPool();
        const [tenantRows] = await rootPool.query(
            'SELECT * FROM tenant_tracking.tenants WHERE tenant_slug = ? AND status = "active" LIMIT 1',
            [tenantSlug]
        );

        if (!tenantRows || tenantRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }

        const tenant = tenantRows[0];
        let branchCount = 0;
        try {
            const pool = await getTenantDB(tenant.db_name);
            const [branches] = await pool.query('SELECT COUNT(*) as count FROM branches WHERE is_active = TRUE');
            branchCount = branches[0]?.count || 0;
        } catch (e) { }

        res.json({
            success: true,
            data: {
                deploymentType: branchCount > 1 ? 'multi' : 'single',
                branchCount,
                tenantName: tenant.tenant_name,
                tenantSlug: tenant.tenant_slug,
                country: tenant.country,
                location: tenant.location,
                email: tenant.email
            }
        });
    } catch (error) {
        Logger.error(`[HEARSE] /tenant/:slug/settings error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
}));

// GET /tenant/:tenantSlug/branches - Get branches for a tenant
app.get('/tenant/:tenantSlug/branches', asyncHandler(async (req, res) => {
    const { tenantSlug } = req.params;

    try {
        let dbName = req.tenant?.db_name;

        if (!dbName) {
            const rootPool = await getRootPool();
            const [tenantRows] = await rootPool.query(
                'SELECT db_name FROM tenant_tracking.tenants WHERE tenant_slug = ? AND status = "active" LIMIT 1',
                [tenantSlug]
            );
            if (!tenantRows || tenantRows.length === 0) {
                return res.status(404).json({ success: false, message: 'Tenant not found' });
            }
            dbName = tenantRows[0].db_name;
        }

        const branches = await safeTenantQuery(
            dbName,
            'SELECT branch_id, branch_name, branch_location, branch_slug, branch_phone, branch_email, is_active FROM branches ORDER BY branch_name ASC'
        );

        res.json({
            success: true,
            data: branches || []
        });
    } catch (error) {
        Logger.error(`[HEARSE] /tenant/:slug/branches error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
}));

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
Logger.info('Registered Routes:');
app._router.stack.forEach((layer) => {
    if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        Logger.info(`  ${methods}  ${layer.route.path}`);
    }
    if (layer.name === 'router' && layer.handle.stack) {
        layer.handle.stack.forEach((l) => {
            if (l.route) {
                const methods = Object.keys(l.route.methods).join(', ').toUpperCase();
                Logger.info(`  ${methods}  ${l.route.path}`);
            }
        });
    }
});

// 404 handler
app.use((req, res) => {
    Logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
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
    Logger.error('Unhandled Error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5002;
server.listen(PORT, '0.0.0.0', () => {


});

module.exports = { app, server, io };