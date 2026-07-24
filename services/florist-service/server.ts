/**
 * Florist Service - Flower booking management for funeral homes
 * Multi-tenant aware with tenant resolution middleware
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import express from 'express';
import cors from 'cors';
import knex from 'knex';
import { flowerBookingRouter } from './routes/flowerBookingRoutes';

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// ============================================
// DATABASE CONNECTION
// ============================================
let floristKnex: knex.Knex | null = null;

const initDatabase = async () => {
    try {
        const DB_HOST = process.env.DB_HOST || 'localhost';
        const DB_USER = process.env.DB_USER || 'root';
        const DB_PASSWORD = process.env.DB_PASSWORD || '';
        const DB_NAME = process.env.DB_NAME || 'restpoint_main';

        floristKnex = knex({
            client: 'mysql2',
            connection: {
                host: DB_HOST,
                user: DB_USER,
                password: DB_PASSWORD,
                database: DB_NAME,
            },
            pool: { min: 2, max: 10 },
        });

        console.log('[FLORIST] Database connection initialized');
        
        // Run migrations using Knex
        await runMigrations();
    } catch (error: any) {
        console.error('[FLORIST] Database initialization failed:', error.message);
        process.exit(1);
    }
};

const runMigrations = async () => {
    if (!floristKnex) return;
    try {
        // Run Knex migrations
        const knexConfig = require('./knexfile.js');
        const migrationKnex = knex(knexConfig.development);
        
        // Check if migrations table exists
        const hasMigrationsTable = await migrationKnex.schema.hasTable('knex_migrations');
        if (!hasMigrationsTable) {
            await migrationKnex.migrate.latest();
            console.log('[FLORIST] Knex migrations completed successfully');
        } else {
            // Check if florist migrations have been run
            const hasFlowerBookings = await migrationKnex.schema.hasTable('flower_bookings');
            if (!hasFlowerBookings) {
                await migrationKnex.migrate.latest();
                console.log('[FLORIST] Knex migrations completed successfully');
            } else {
                console.log('[FLORIST] Migrations already up to date');
            }
        }
        
        await migrationKnex.destroy();
    } catch (error: any) {
        console.error('[FLORIST] Migration failed:', error.message);
    }
};

// ============================================
// TENANT RESOLUTION MIDDLEWARE
// ============================================
app.use(async (req: any, res: any, next: any) => {
    const tenantSlug = (req.headers['x-tenant-slug'] || req.headers['x-slug'] || 'system_shared') as string;
    const branchId = req.headers['x-branch-id'] || null;

    req.tenantSlug = tenantSlug;
    req.branchId = branchId;

    console.log(`[FLORIST] Request: ${req.method} ${req.path}`);
    console.log(`[FLORIST] Tenant: ${tenantSlug}, Branch: ${branchId}`);

    if (tenantSlug === 'system_shared') {
        console.log('[FLORIST] Using system_shared tenant (bypassing validation)');
        req.tenant = {
            db_name: process.env.DB_NAME || 'restpoint_main',
            tenant_id: 1,
            name: 'System Shared'
        };
        return next();
    }

    try {
        // @ts-ignore
        const { resolveDatabase, safeTenantQuery } = await import('../../shared/dbConfig.js');

        let dbName = await resolveDatabase(tenantSlug);

        if (!dbName) {
            dbName = tenantSlug.replace(/-/g, '_');
        }

        req.tenant = {
            db_name: dbName,
            tenant_slug: tenantSlug,
            name: tenantSlug
        };
        console.log(`[FLORIST] Tenant resolved: ${dbName}`);

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
                        console.log(`[FLORIST] Branch resolved: ${req.branchId}`);
                    }
                } catch (e) {
                    console.log('[FLORIST] Branch resolution skipped:', (e as Error).message);
                }
            }
        }

        // Ensure florist tables exist in tenant database
        if (dbName) {
            try {
                await ensureFloristTables(dbName);
            } catch (tableError: any) {
                console.error(`[FLORIST] Warning: Could not ensure tables in ${dbName}:`, tableError.message);
            }
        }
    } catch (err: any) {
        console.error('[FLORIST] Tenant resolution error:', err.message);
        req.tenant = {
            db_name: process.env.DB_NAME || 'restpoint_main',
            tenant_slug: tenantSlug,
            name: tenantSlug
        };
    }

    next();
});

// ============================================
// ROUTES
// ============================================
console.log('[FLORIST] Registering routes...');
app.use('/florist', flowerBookingRouter);

// Health check
app.get('/api/health', (_req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// AUTO-MIGRATION: Ensure florist tables exist in tenant databases
// ============================================
async function ensureFloristTables(dbName: string) {
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

        console.log(`[FLORIST] Ensuring florist tables in: ${dbName}`);

        // Check if tables already exist
        const hasFlowerBookings = await tenantKnex.schema.hasTable('flower_bookings');
        const hasFlowerCustomers = await tenantKnex.schema.hasTable('flower_customers');
        const hasFlowerPackages = await tenantKnex.schema.hasTable('flower_packages');
        const hasDeliveryZones = await tenantKnex.schema.hasTable('delivery_zones');

        if (!hasFlowerBookings || !hasFlowerCustomers || !hasFlowerPackages || !hasDeliveryZones) {
            // Run the migration for this tenant
            const { up } = await import('./migrations/20240622000001_create_flower_bookings_tables.js');
            await up(tenantKnex);
            console.log(`[FLORIST] ✅ Florist tables created in: ${dbName}`);
        } else {
            console.log(`[FLORIST] ✓ Florist tables already exist in: ${dbName}`);
        }

        await tenantKnex.destroy();
        return true;
    } catch (error: any) {
        console.error(`[FLORIST] ❌ Failed to ensure florist tables in ${dbName}:`, error.message);
        return false;
    }
}

// ============================================
// START SERVER
// ============================================
async function startServer() {
    const mainDb = process.env.DB_NAME || 'restpoint_main';
    console.log(`[FLORIST] Running auto-migration for florist tables in: ${mainDb}`);
    await ensureFloristTables(mainDb);

    console.log('[FLORIST] Checking for tenant databases to migrate...');
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

        console.log(`[FLORIST] Found ${tenants.length} active tenant(s)`);

        for (const tenant of tenants) {
            console.log(`[FLORIST] Migrating tenant: ${tenant.name} (${tenant.db_name})`);
            const success = await ensureFloristTables(tenant.db_name);
            if (success) {
                console.log(`[FLORIST] ✅ Successfully migrated: ${tenant.name}`);
            } else {
                console.error(`[FLORIST] ❌ Failed to migrate: ${tenant.name}`);
            }
        }

        await tempKnex.destroy();
    } catch (error) {
        console.error('[FLORIST] Tenant migration error:', error);
    }

    const PORT = Number(process.env.PORT) || 7070;

    app.listen(PORT, '0.0.0.0', () => {
        console.log('========================================');
        console.log(`🌺 Florist Service`);
        console.log(`   Port: ${PORT}`);
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   DB: ${process.env.DB_NAME || 'not configured'}`);
        console.log('========================================');
    });
}

startServer();

export default app;