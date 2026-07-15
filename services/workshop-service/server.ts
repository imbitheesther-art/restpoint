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
import { initSocket } from './socket';
import { workshopRouter } from './controllers/routes/workshopRouter';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware
const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:8082').split(',');
    if (!origin || allowedOrigins.some(o => origin.includes(o.replace(/https?:\/\//, '')))) {
        return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS: ' + origin));
};

app.use(cors({
    origin: corsOrigin,
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

    // For non-system tenants, validate
    try {
        // @ts-ignore - dynamic import for shared module
        const { validateTenantActive } = await import('../../shared/tenancy.js');
        const tenantStatus = await validateTenantActive(tenantSlug);

        if (!tenantStatus.active) {
            console.log(`[WORKSHOP] Tenant ${tenantSlug} not active: ${tenantStatus.reason}`);
            return res.status(403).json({
                success: false,
                message: tenantStatus.reason || 'Tenant not active'
            });
        }

        req.tenant = tenantStatus.tenant;
        console.log(`[WORKSHOP] Tenant validated: ${tenantStatus.tenant.db_name}`);

        // Resolve branch if not provided
        if (!req.branchId && tenantStatus.tenant?.db_name) {
            const lastDash = tenantSlug.lastIndexOf('-');
            if (lastDash > 0) {
                const branchPart = tenantSlug.substring(lastDash + 1);
                try {
                    // @ts-ignore - dynamic import for shared module
                    const { safeTenantQuery } = await import('../../shared/dbConfig.js');
                    const branches = await safeTenantQuery(
                        tenantStatus.tenant.db_name,
                        'SELECT branch_id FROM branches WHERE branch_slug LIKE ? OR branch_name LIKE ? LIMIT 1',
                        [`%${branchPart}%`, `%${branchPart}%`]
                    );
                    if (branches.length > 0) {
                        req.branchId = branches[0].branch_id.toString();
                        console.log(`[WORKSHOP] Branch resolved: ${req.branchId}`);
                    } else {
                        console.log(`[WORKSHOP] No branch found for "${branchPart}", using single-tenant mode (no branch filter)`);
                    }
                } catch (e) {
                    console.log('[WORKSHOP] Branch resolution skipped:', (e as Error).message);
                }
            } else {
                console.log(`[WORKSHOP] Single-tenant mode detected (no dash in slug), using main DB without branch filter`);
            }
        }

        // Ensure workshop tables exist in tenant database
        if (tenantStatus.tenant?.db_name) {
            try {
                await ensureWorkshopTables(tenantStatus.tenant.db_name);
            } catch (tableError: any) {
                console.error(`[WORKSHOP] Warning: Could not ensure tables in ${tenantStatus.tenant.db_name}:`, tableError.message);
                // Don't fail the request, tables might already exist
            }
        }
    } catch (err: any) {
        console.error('[WORKSHOP] Tenant resolution error:', err.message);

        // In development, allow fallback
        if (process.env.NODE_ENV === 'development') {
            console.log('[WORKSHOP] Development fallback: Using default tenant');
            req.tenant = {
                db_name: process.env.DB_NAME || 'restpoint_main',
                tenant_id: 1,
                name: 'Development Fallback'
            };
            return next();
        }

        return res.status(500).json({
            success: false,
            message: 'Tenant resolution failed: ' + err.message
        });
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
// AUTO-MIGRATION: Ensure workshop tables exist
// ============================================
const WORKSHOP_TABLES_SQL = `
-- Add id column if it doesn't exist (for tables created before id column was added)
ALTER TABLE coffin_orders ADD COLUMN IF NOT EXISTS id INT AUTO_INCREMENT PRIMARY KEY FIRST;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS id INT AUTO_INCREMENT PRIMARY KEY FIRST;
ALTER TABLE material_usage ADD COLUMN IF NOT EXISTS id INT AUTO_INCREMENT PRIMARY KEY FIRST;
ALTER TABLE production_stages ADD COLUMN IF NOT EXISTS id INT AUTO_INCREMENT PRIMARY KEY FIRST;
ALTER TABLE worker_assignments ADD COLUMN IF NOT EXISTS id INT AUTO_INCREMENT PRIMARY KEY FIRST;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'worker',
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coffin_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  deceased_name VARCHAR(255) NOT NULL,
  coffin_type VARCHAR(50) DEFAULT 'standard',
  dimensions TEXT,
  color VARCHAR(100),
  interior_fabric VARCHAR(100),
  notes TEXT,
  instructions TEXT,
  selling_price DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  profit DECIMAL(10,2) DEFAULT 0,
  due_date DATE,
  priority VARCHAR(20) DEFAULT 'normal',
  branch_id INT DEFAULT NULL,
  hold_reason TEXT,
  created_by VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  delivery_date DATE,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orders_status (status),
  INDEX idx_orders_date (order_date),
  INDEX idx_orders_branch (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'pieces',
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) DEFAULT 0,
  min_stock_level DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_materials_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS material_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coffin_order_id INT NOT NULL,
  material_id INT NOT NULL,
  quantity_used DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coffin_order_id) REFERENCES coffin_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
  INDEX idx_usage_order (coffin_order_id),
  INDEX idx_usage_material (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS production_stages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coffin_order_id INT NOT NULL,
  stage VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  notes TEXT,
  FOREIGN KEY (coffin_order_id) REFERENCES coffin_orders(id) ON DELETE CASCADE,
  UNIQUE KEY uk_order_stage (coffin_order_id, stage),
  INDEX idx_stages_order (coffin_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS worker_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coffin_order_id INT NOT NULL,
  user_id INT NOT NULL,
  stage VARCHAR(50) NOT NULL,
  hours_worked DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  FOREIGN KEY (coffin_order_id) REFERENCES coffin_orders(id) ON DELETE CASCADE,
  INDEX idx_assignments_order (coffin_order_id),
  INDEX idx_assignments_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS costing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coffin_order_id INT NOT NULL UNIQUE,
  materials_cost DECIMAL(10,2) DEFAULT 0,
  labor_cost DECIMAL(10,2) DEFAULT 0,
  overhead_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) DEFAULT 0,
  profit DECIMAL(10,2) DEFAULT 0,
  profit_margin DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (coffin_order_id) REFERENCES coffin_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS design_specifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coffin_order_id INT NOT NULL UNIQUE,
  design_name VARCHAR(255),
  description TEXT,
  specifications JSON,
  design_files JSON,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (coffin_order_id) REFERENCES coffin_orders(id) ON DELETE CASCADE,
  INDEX idx_design_order (coffin_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS material_intake (
  id INT AUTO_INCREMENT PRIMARY KEY,
  material_id INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  supplier VARCHAR(255),
  invoice_number VARCHAR(100),
  notes TEXT,
  received_by VARCHAR(255),
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
  INDEX idx_intake_material (material_id),
  INDEX idx_intake_date (received_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

async function ensureWorkshopTables(dbName: string) {
    let connection;
    try {
        // @ts-ignore - dynamic import for shared module
        const { getTenantDB } = await import('../../shared/dbConfig.js');
        const pool = await getTenantDB(dbName);
        connection = await pool.getConnection();

        console.log(`[WORKSHOP] Ensuring workshop tables in: ${dbName}`);

        const statements = WORKSHOP_TABLES_SQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`[WORKSHOP] Found ${statements.length} SQL statements to execute`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (!statement) continue;

            try {
                await connection.query(statement + ';');
                const match = statement.match(/(?:TABLE|COLUMN)\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
                const objectName = match ? match[1] : 'unknown';
                console.log(`[WORKSHOP] ✓ ${objectName} (${i + 1}/${statements.length})`);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                // Ignore "duplicate key" and "already exists" errors
                if (errorMessage.includes('Duplicate') || errorMessage.includes('already exists')) {
                    console.log(`[WORKSHOP] - ${errorMessage.split('.')[0]} (already exists)`);
                } else {
                    console.warn(`[WORKSHOP] Warning (${i + 1}/${statements.length}): ${errorMessage}`);
                }
            }
        }

        console.log(`[WORKSHOP] ✅ Workshop tables ensured in database: ${dbName}`);
        return true;
    } catch (error: any) {
        console.error(`[WORKSHOP] ❌ Failed to ensure workshop tables in ${dbName}:`, error.message);
        return false;
    } finally {
        if (connection) await connection.release();
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
        // @ts-ignore - dynamic import for shared module
        const { safeTenantQuery } = await import('../../shared/dbConfig.js');
        const tenants = await safeTenantQuery(mainDb, 'SELECT db_name, name FROM tenants WHERE is_active = 1');

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