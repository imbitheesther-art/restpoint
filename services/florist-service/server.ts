/**
 * Florist Service - Flower booking management for funeral homes
 * Multi-tenant aware with tenant resolution middleware
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import express from 'express';
import cors from 'cors';
import { flowerBookingRouter } from './routes/flowerBookingRoutes';

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

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

        // Ensure florist tables exist
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
// AUTO-MIGRATION: Ensure florist tables exist
// ============================================
const FLORIST_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS flower_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL UNIQUE,
  flower_type VARCHAR(100) NOT NULL,
  flower_description TEXT,
  service_type VARCHAR(100) NOT NULL,
  customer VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  deceased_name VARCHAR(255),
  branch VARCHAR(255) NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time VARCHAR(20) NOT NULL,
  delivery_address TEXT,
  invoice_number VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  urgent TINYINT(1) DEFAULT 0,
  branch_id INT DEFAULT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_bookings_status (status),
  INDEX idx_bookings_date (delivery_date),
  INDEX idx_bookings_branch (branch),
  INDEX idx_bookings_customer (customer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS flower_customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  notes TEXT,
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  branch_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customers_name (name),
  INDEX idx_customers_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

async function ensureFloristTables(dbName: string) {
    let connection;
    try {
        // @ts-ignore
        const { getTenantDB } = await import('../../shared/dbConfig.js');
        const pool = await getTenantDB(dbName);
        connection = await pool.getConnection();

        console.log(`[FLORIST] Ensuring florist tables in: ${dbName}`);

        const statements = FLORIST_TABLES_SQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (!statement) continue;

            try {
                await connection.query(statement + ';');
                const match = statement.match(/TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
                const objectName = match ? match[1] : 'unknown';
                console.log(`[FLORIST] ✓ ${objectName} (${i + 1}/${statements.length})`);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                if (errorMessage.includes('Duplicate') || errorMessage.includes('already exists')) {
                    console.log(`[FLORIST] - ${errorMessage.split('.')[0]} (already exists)`);
                } else {
                    console.warn(`[FLORIST] Warning (${i + 1}/${statements.length}): ${errorMessage}`);
                }
            }
        }

        console.log(`[FLORIST] ✅ Florist tables ensured in database: ${dbName}`);
        return true;
    } catch (error: any) {
        console.error(`[FLORIST] ❌ Failed to ensure florist tables in ${dbName}:`, error.message);
        return false;
    } finally {
        if (connection) await connection.release();
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
        // @ts-ignore
        const { getRootPool } = await import('../../shared/dbConfig.js');
        const rootPool = await getRootPool();
        const [tenantRows] = await rootPool.query('SELECT db_name, name FROM tenant_tracking.tenants WHERE status = "active"');
        const tenants = tenantRows as Array<{ db_name: string; name: string }>;

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