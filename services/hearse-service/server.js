require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const { safeTenantQuery, safeTenantExecute, resolveDatabase, getTenantDB } = require('../../shared/dbConfig');
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

// Tenant Middleware - supports both tenant slugs and branch database name slugs
app.use(async (req, res, next) => {
    try {
        let tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-slug'] || 'system_shared';
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

        // Step 1: Try direct tenant lookup
        let tenantStatus = await validateTenantActive(tenantSlug);
        let resolvedDbName = null;

        // Step 2: If not found as tenant, try to resolve the database
        // IMPORTANT: For hearse data that should be shared across all branches,
        // we MUST use the MAIN tenant database, NOT a branch-specific database.
        // The main tenant DB has the branches table and hearses shared by all branches.
        if (!tenantStatus.active) {
            console.log(`[HEARSE] Not a direct tenant slug, trying database resolution for: ${tenantSlug}`);

            // FIRST TRY: Check tenant_tracking.branch_tracking to find the MAIN tenant DB
            // This is the most reliable way - branch_slug may match the slug sent from frontend
            try {
                const rootPool = await require('../../shared/dbConfig').getRootPool();
                const [branchRows] = await rootPool.query(
                    `SELECT b.branch_db_name, t.db_name as tenant_db_name, t.tenant_slug 
                     FROM tenant_tracking.branch_tracking b
                     JOIN tenant_tracking.tenants t ON b.tenant_id = t.tenant_id
                     WHERE (b.branch_slug = ? OR b.branch_db_name = ?) AND t.status = 'active'
                     LIMIT 1`,
                    [tenantSlug, tenantSlug]
                );

                if (branchRows && branchRows.length > 0) {
                    resolvedDbName = branchRows[0].tenant_db_name;
                    console.log(`[HEARSE] Found branch in branch_tracking: ${tenantSlug} → main tenant DB: ${resolvedDbName}`);
                }
            } catch (e) {
                console.log(`[HEARSE] branch_tracking lookup failed: ${e.message}`);
            }

            // SECOND TRY: resolveDatabase() which supports branch slug patterns
            if (!resolvedDbName) {
                resolvedDbName = await resolveDatabase(tenantSlug);
            }

            // THIRD TRY: The slug itself IS a database name (main tenant DB or branch DB)
            if (!resolvedDbName) {
                console.log(`[HEARSE] Trying slug "${tenantSlug}" directly as database name...`);
                try {
                    const testPool = require('mysql2/promise').createPool({
                        host: process.env.DB_HOST || '127.0.0.1',
                        port: parseInt(process.env.DB_PORT || '3306'),
                        user: process.env.DB_USER || 'restpoint_user',
                        password: process.env.DB_PASSWORD || 'RestPointUser2024',
                        database: tenantSlug,
                        waitForConnections: true,
                        connectionLimit: 2,
                        queueLimit: 0,
                    });
                    const [result] = await testPool.query('SELECT 1');
                    if (result) {
                        resolvedDbName = tenantSlug;
                        console.log(`[HEARSE] Direct database connection successful: ${resolvedDbName}`);
                    }
                    await testPool.end().catch(() => { });
                } catch (dbErr) {
                    console.log(`[HEARSE] Direct database connection failed: ${dbErr.message}`);
                }
            }

            // FOURTH TRY: Cross-tenant search across all branches tables
            if (!resolvedDbName) {
                try {
                    const rootPool = await require('../../shared/dbConfig').getRootPool();
                    const [allTenants] = await rootPool.query(
                        'SELECT tenant_slug, db_name FROM tenant_tracking.tenants WHERE status = "active"'
                    );

                    for (const t of allTenants) {
                        try {
                            const pool = await require('../../shared/dbConfig').getTenantDB(t.db_name);
                            const [branchRows] = await pool.query(
                                `SELECT branch_db_name FROM branches WHERE branch_slug = ? OR branch_db_name = ? LIMIT 1`,
                                [tenantSlug, tenantSlug]
                            );
                            if (branchRows && branchRows.length > 0) {
                                resolvedDbName = t.db_name;
                                console.log(`[HEARSE] Found branch "${tenantSlug}" in tenant "${t.tenant_slug}" → main DB: ${resolvedDbName}`);
                                break;
                            }
                        } catch (tenantErr) {
                            // Skip tenants we can't query
                        }
                    }
                } catch (e) {
                    console.log(`[HEARSE] Cross-tenant branch search failed: ${e.message}`);
                }
            }

            if (resolvedDbName) {
                // Found the database - look up the tenant that owns it
                const rootPool = await require('../../shared/dbConfig').getRootPool();
                const [tenants] = await rootPool.query(
                    `SELECT * FROM tenant_tracking.tenants WHERE db_name = ? OR tenant_slug = ? LIMIT 1`,
                    [resolvedDbName, tenantSlug]
                );

                if (tenants && tenants.length > 0) {
                    tenantStatus = { active: true, tenant: tenants[0] };
                    console.log(`[HEARSE] Resolved "${tenantSlug}" → tenant: ${tenantStatus.tenant.tenant_name} (db: ${tenantStatus.tenant.db_name})`);
                } else {
                    // Fallback: use resolved DB name directly as tenant
                    tenantStatus = {
                        active: true,
                        tenant: {
                            db_name: resolvedDbName,
                            tenant_id: 0,
                            tenant_name: tenantSlug,
                            tenant_slug: tenantSlug
                        }
                    };
                    console.log(`[HEARSE] Using resolved database directly: ${resolvedDbName}`);
                }
            }
        }

        if (!tenantStatus.active) {
            return res.status(403).json({
                status: 'error',
                message: tenantStatus.reason || 'Tenant not active'
            });
        }

        req.tenant = tenantStatus.tenant;
        console.log(`[HEARSE] Tenant validated: ${req.tenant.db_name}`);

        // Resolve branch if not provided
        if (!req.branchId && req.tenant?.db_name) {
            try {
                const branches = await safeTenantQuery(
                    req.tenant.db_name,
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
    console.log(` Route not found: ${req.method} ${req.originalUrl}`);
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
    console.error(' Unhandled Error:', err);
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