/**
 * Workshop Service - Coffin building, materials, and production tracking
 * Multi-tenant aware with tenant resolution middleware
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import express from 'express';
import cors from 'cors';
import http from 'http';
import knex from 'knex';
import { initSocket } from './socket';
import { workshopRouter } from './controllers/routes/workshopRouter';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware
const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // The API Gateway handles public CORS validation.
    // Internal microservices should allow all origins passed by the gateway.
    return callback(null, true);
};

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// ============================================
// TENANT RESOLUTION MIDDLEWARE
// ============================================
app.use(async (req: any, res: any, next: any) => {
    // Get tenant from headers or use default
    const tenantSlug = (req.headers['x-tenant-slug'] || req.headers['x-slug'] || 'system_shared') as string;
    const branchId = req.headers['x-branch-id'] || null;

    req.tenantSlug = tenantSlug;
    req.branchId = branchId;

    console.log(`[WORKSHOP] Request: ${req.method} ${req.path}`);
    console.log(`[WORKSHOP] Tenant: ${tenantSlug}, Branch: ${branchId}`);

    // For system_shared, skip tenant validation and use default DB
    if (tenantSlug === 'system_shared') {
        console.log('[WORKSHOP] Using system_shared tenant (bypassing validation)');
        req.tenant = {
            db_name: process.env.DB_NAME || 'restpoint_main',
            tenant_id: 1,
            name: 'System Shared'
        };
        return next();
    }

    // For non-system tenants — resolve database directly (no active-status blocking)
    try {
        // @ts-ignore
        const { resolveDatabase, safeTenantQuery } = await import('../../shared/dbConfig.js');

        let dbName = await resolveDatabase(tenantSlug);

        // Fallback: convert slug to db name pattern
        if (!dbName) {
            dbName = tenantSlug.replace(/-/g, '_');
        }

        req.tenant = {
            db_name: dbName,
            tenant_slug: tenantSlug,
            name: tenantSlug
        };
        console.log(`[WORKSHOP] Tenant resolved: ${dbName}`);

        // Resolve branch if not provided
        if (!req.branchId && dbName) {
            const lastDash = tenantSlug.lastIndexOf('-');
            if (lastDash > 0) {
                const branchPart = tenantSlug.substring(lastDash + 1);
                try {
                    const branches = await safeTenantQuery(
                        dbName,
                        'SELECT branch_id FROM branches WHERE branch_slug LIKE ? OR branch_name LIKE ? LIMIT 1',
                        [`%${branchPart}%`, `%${branchPart}%`]
                    );
                    if (branches.length > 0) {
                        req.branchId = branches[0].branch_id.toString();
                        console.log(`[WORKSHOP] Branch resolved: ${req.branchId}`);
                    } else {
                        console.log(`[WORKSHOP] No branch found for "${branchPart}", using single-tenant mode`);
                    }
                } catch (e) {
                    console.log('[WORKSHOP] Branch resolution skipped:', (e as Error).message);
                }
            } else {
                console.log(`[WORKSHOP] Single-tenant mode detected`);
            }
        }

        // Ensure workshop tables exist in tenant database
        if (dbName) {
            try {
                await ensureWorkshopTables(dbName);
            } catch (tableError: any) {
                console.error(`[WORKSHOP] Warning: Could not ensure tables in ${dbName}:`, tableError.message);
            }
        }
    } catch (err: any) {
        console.error('[WORKSHOP] Tenant resolution error:', err.message);
        // Always fall back to default DB rather than blocking
        req.tenant = {
            db_name: process.env.DB_NAME || 'restpoint_main',
            tenant_slug: tenantSlug,
            name: tenantSlug
        };
    }

    next();
});

// ============================================
// ROUTES - Mount workshop routes (CLEAN ROUTES - NO PREFIX)
// ============================================
console.log('[WORKSHOP] Registering routes...');
app.use('/workshop', workshopRouter);

// Log all registered routes for debugging
const logRoutes = (router, prefix = '') => {
    if (!router || !router.stack) {
        console.log('[WORKSHOP] No routes to log');
        return;
    }

    router.stack.forEach((layer) => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ');
            console.log(`[WORKSHOP] Route registered: ${methods} ${prefix}${layer.route.path}`);
        } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
            const path = layer.regexp.toString().replace(/\(/g, '').replace(/\)/g, '');
            logRoutes(layer.handle, prefix + path);
        }
    });
};

setTimeout(() => {
    console.log('[WORKSHOP] Registered routes:');
    logRoutes(workshopRouter, '/workshop');
}, 100);

// Health check
app.get('/api/health', (_req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// AUTO-MIGRATION: Ensure workshop tables exist in tenant databases
// ============================================
async function ensureWorkshopTables(dbName: string) {
    try {
        // Create a knex instance for the tenant database
        const tenantKnex = knex({
            client: 'mysql2',
            connection: {
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: dbName,
            },
            pool: { min: 1, max: 5 },
        });

        console.log(`[WORKSHOP] Ensuring workshop tables in: ${dbName}`);

        // Check if tables already exist
        const hasUsers = await tenantKnex.schema.hasTable('users');
        const hasOrders = await tenantKnex.schema.hasTable('coffin_orders');
        const hasMaterials = await tenantKnex.schema.hasTable('materials');

        if (!hasUsers || !hasOrders || !hasMaterials) {
            // Run the migration for this tenant
            const { up } = await import('./migrations/20240622000001_create_workshop_tables.js');
            await up(tenantKnex);
            console.log(`[WORKSHOP] ✅ Workshop tables created in: ${dbName}`);
        } else {
            console.log(`[WORKSHOP] ✓ Workshop tables already exist in: ${dbName}`);
        }

        await tenantKnex.destroy();
        return true;
    } catch (error: any) {
        console.error(`[WORKSHOP] ❌ Failed to ensure workshop tables in ${dbName}:`, error.message);
        return false;
    }
}

// ============================================
// START SERVER
// ============================================
async function startServer() {
    // Run auto-migration on the main database
    const mainDb = process.env.DB_NAME || 'restpoint_main';
    console.log(`[WORKSHOP] Running auto-migration for workshop tables in: ${mainDb}`);
    await ensureWorkshopTables(mainDb);

    // Run auto-migration on tenant databases
    console.log('[WORKSHOP] Checking for tenant databases to migrate...');
    try {
        // Create temporary knex instance to query tenants
        const tempKnex = knex({
            client: 'mysql2',
            connection: {
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: 'tenant_tracking',
            },
            pool: { min: 1, max: 5 },
        });

        const tenants = await tempKnex('tenants')
            .where({ status: 'active' })
            .select('db_name', 'name');

        console.log(`[WORKSHOP] Found ${tenants.length} active tenant(s)`);

        for (const tenant of tenants) {
            console.log(`[WORKSHOP] Migrating tenant: ${tenant.name} (${tenant.db_name})`);
            const success = await ensureWorkshopTables(tenant.db_name);
            if (success) {
                console.log(`[WORKSHOP] ✅ Successfully migrated: ${tenant.name}`);
            } else {
                console.error(`[WORKSHOP] ❌ Failed to migrate: ${tenant.name}`);
            }
        }

        await tempKnex.destroy();
    } catch (error) {
        console.error('[WORKSHOP] Tenant migration error:', error);
    }

    const PORT = Number(process.env.PORT) || 6969;

    server.listen(PORT, '0.0.0.0', () => {
        console.log('========================================');
        console.log(`🔧 Workshop Service`);
        console.log(`   Port: ${PORT}`);
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   DB: ${process.env.DB_NAME || 'not configured'}`);
        console.log('========================================');
    });
}

startServer();

export default app;