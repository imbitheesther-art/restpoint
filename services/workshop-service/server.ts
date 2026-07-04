/**
 * Workshop Service - Coffin building, materials, and production tracking
 * Multi-tenant aware with tenant resolution middleware
 */

import 'dotenv/config';
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
app.use(cors());
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
                    }
                } catch (e) {
                    console.log('[WORKSHOP] Branch resolution skipped:', (e as Error).message);
                }
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
// ROUTES - Mount workshop routes
// ============================================
app.use('/api/v1/restpoint/workshop', workshopRouter);

// Health check
app.get('/api/health', (_req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// AUTO-MIGRATION: Ensure workshop tables exist
// ============================================
const WORKSHOP_TABLES_SQL = `
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
  selling_price DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  profit DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  delivery_date DATE,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orders_status (status),
  INDEX idx_orders_date (order_date)
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
`;

async function ensureWorkshopTables(dbName: string) {
    let connection;
    try {
        // @ts-ignore - dynamic import for shared module
        const { getTenantDB } = await import('../../shared/dbConfig.js');
        const pool = await getTenantDB(dbName);
        connection = await pool.getConnection();

        const statements = WORKSHOP_TABLES_SQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && s.toUpperCase().startsWith('CREATE'));

        for (const statement of statements) {
            try {
                await connection.query(statement + ';');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                console.warn(`[WORKSHOP] Table creation warning: ${errorMessage}`);
            }
        }

        console.log(`[WORKSHOP] Workshop tables ensured in database: ${dbName}`);
        return true;
    } catch (error: any) {
        console.error(`[WORKSHOP] Failed to ensure workshop tables in ${dbName}:`, error.message);
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