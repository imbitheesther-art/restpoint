const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const { autoInitSystemAdmin } = require('./scripts/auto-init-system-admin');

const app = express();
// FIX 1: Harmonized default port to match the Gateway's internal mapping
const PORT = process.env.PORT || 5001;

// CORS configuration
const corsOptions = {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Tenant-Id'],
    exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware for parsing incoming requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// HEALTH CHECK
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'auth-service',
        timestamp: new Date().toISOString()
    });
});

// DB readiness check
const { checkDBConnection } = require('./scripts/dbHealth');
app.get('/health/db', async (req, res) => {
    try {
        const result = await checkDBConnection();
        if (result.ok) {
            return res.status(200).json({ ok: true, message: 'Database reachable' });
        }
        const err = result.error || {};
        // Provide limited error details in production
        const msg = process.env.NODE_ENV === 'development' ? (err.message || String(err)) : 'Database unreachable';
        return res.status(503).json({ ok: false, message: msg });
    } catch (error) {
        return res.status(503).json({ ok: false, message: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : 'Database unreachable' });
    }
});

// =============================================================================
// FIX 2: MOUNT ROUTES WITH /auth PREFIX FOR GATEWAY
// =============================================================================
// The Gateway sends requests with /auth prefix (e.g., '/auth/login')
// Mount the router at /auth to match these paths
app.use('/auth', authRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found inside auth-service`
    });
});

// Global Error handler
app.use((err, req, res, next) => {
    if (err.type === 'request.aborted' || (err.message && err.message.includes('aborted'))) {
        console.warn(`[Warning] ${new Date().toISOString()} Request to ${req.url} was aborted.`);
        if (!res.headersSent) {
            return res.status(400).json({
                success: false,
                message: 'Request aborted or connection closed unexpectedly.'
            });
        }
        return;
    }

    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong inside auth-service!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Startup sequence: auto-init system admin and verify DB before starting server
(async () => {
    const { spawn } = require('child_process');

    async function runBootstrapIfAdminAvailable() {
        const adminUser = process.env.DB_ADMIN_USER || process.env.ROOT_DB_USER;
        const adminPass = process.env.DB_ADMIN_PASSWORD || process.env.ROOT_DB_PASSWORD;
        if (!adminUser || !adminPass) {
            console.log('No DB admin credentials provided; skipping auto-provisioning.');
            return false;
        }

        console.log('Admin credentials detected; attempting to run bootstrap script to provision database and user...');

        return new Promise((resolve, reject) => {
            const env = Object.assign({}, process.env, {
                DB_ADMIN_USER: adminUser,
                DB_ADMIN_PASSWORD: adminPass,
            });

            const child = spawn(process.execPath, ['scripts/bootstrap-db.js'], { env, cwd: __dirname, stdio: ['ignore', 'pipe', 'pipe'] });

            child.stdout.on('data', (data) => console.log(`[bootstrap] ${data.toString().trim()}`));
            child.stderr.on('data', (data) => console.error(`[bootstrap] ${data.toString().trim()}`));

            child.on('error', (err) => reject(err));
            child.on('close', (code) => {
                if (code === 0) {
                    console.log('Bootstrap script completed successfully');
                    resolve(true);
                } else {
                    reject(new Error('Bootstrap script failed with exit code ' + code));
                }
            });
        });
    }

    try {
        // First attempt to initialize using the runtime DB user (restpoint_user)
        let initResult;
        try {
            initResult = await autoInitSystemAdmin();
            if (!initResult.success) {
                // If init failed due to access denied, attempt bootstrap if possible
                const isAccessDenied = initResult.message && initResult.message.toLowerCase().includes('access denied');
                if (isAccessDenied) {
                    console.warn('Detected DB access denied during auto-init.');
                    const bootAttempt = await runBootstrapIfAdminAvailable();
                    if (bootAttempt) {
                        // Retry initialization after bootstrap
                        initResult = await autoInitSystemAdmin();
                    } else {
                        console.error('No admin credentials available to bootstrap DB. Exiting to allow operator intervention.');
                        process.exit(1);
                    }
                } else {
                    console.warn('⚠️ System admin auto-initialization failed:', initResult.message);
                }
            } else {
                console.log('✅ System admin auto-initialization complete');
            }
        } catch (err) {
            // handle thrown errors (e.g., connection errors, access denied exceptions)
            const isAccessDenied = err && (err.code === 'ER_ACCESS_DENIED_ERROR' || (err.message && err.message.toLowerCase().includes('access denied')));
            if (isAccessDenied) {
                console.warn('Detected DB access denied on initial auto-init (exception).');
                try {
                    const booted = await runBootstrapIfAdminAvailable();
                    if (!booted) {
                        console.error('No admin credentials available to bootstrap DB. Exiting.');
                        process.exit(1);
                    }
                    // Retry init after bootstrapping
                    const retryResult = await autoInitSystemAdmin();
                    if (!retryResult.success) {
                        console.error('Initialization still failed after bootstrap:', retryResult.message);
                        process.exit(1);
                    }
                    console.log('✅ System admin auto-initialization complete after bootstrap');
                } catch (bootstrapErr) {
                    console.error('Bootstrap attempt failed:', bootstrapErr && bootstrapErr.message ? bootstrapErr.message : bootstrapErr);
                    process.exit(1);
                }
            } else {
                console.error('❌ System admin auto-initialization error:', err && err.message ? err.message : err);
                console.error('❌ Make sure the database user "restpoint_user" exists and has proper permissions');
                console.error('❌ Run this SQL in MySQL if needed:');
                console.error('   CREATE USER IF NOT EXISTS \'restpoint_user\'@\'localhost\' IDENTIFIED BY \'RestPointUser2024\';');
                console.error('   GRANT ALL PRIVILEGES ON *.* TO \'restpoint_user\'@\'localhost\' WITH GRANT OPTION;');
                console.error('   FLUSH PRIVILEGES;');
                process.exit(1);
            }
        }
    } catch (error) {
        console.error('❌ System admin auto-initialization error:', error && error.message ? error.message : error);
        console.error('❌ Make sure the database user "restpoint_user" exists and has proper permissions');
        console.error('❌ Run this SQL in MySQL if needed:');
        console.error('   CREATE USER IF NOT EXISTS \'restpoint_user\'@\'localhost\' IDENTIFIED BY \'RestPointUser2024\';');
        console.error('   GRANT ALL PRIVILEGES ON *.* TO \'restpoint_user\'@\'localhost\' WITH GRANT OPTION;');
        console.error('   FLUSH PRIVILEGES;');
        process.exit(1);
    }

    // Start Server - listen on 0.0.0.0 for external access
    const HOST = process.env.HOST || '0.0.0.0';
    app.listen(PORT, HOST, () => {
        console.log(`🚀 [auth-service] running cleanly on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
})();
