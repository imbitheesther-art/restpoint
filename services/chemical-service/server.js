const dotenv = require('dotenv');
const path = require('path');

// Load .env from chemical-service directory
dotenv.config({ path: path.join(__dirname, '.env'), override: true });
// Also load global .env as fallback
dotenv.config({ path: path.join(__dirname, '../../.env'), override: false });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { safeTenantQuery, safeTenantExecute } = require('../../shared/dbConfig');
const { validateTenantActive } = require('../../shared/tenancy');
const chemicalRoutes = require('./routes/chemicalRoutes');

const app = express();
const PORT = process.env.PORT || 5016;

// Enable CORS for gateway
app.use(cors({
  origin: '*', // In production, restrict this
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-slug', 'x-tenant-slug', 'x-tenant-id', 'x-user-id', 'Origin', 'X-Requested-With', 'Accept'],
}));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(express.json());

// ============================================
// TENANT + BRANCH RESOLUTION MIDDLEWARE (FIXED)
// ============================================
app.use(async (req, res, next) => {
  // Get tenant from headers or use default
  const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-slug'] || 'system_shared';
  const branchId = req.headers['x-branch-id'] || null;

  req.tenantSlug = tenantSlug;
  req.branchId = branchId;

  console.log(`[CHEMICAL] Request: ${req.method} ${req.path}`);
  console.log(`[CHEMICAL] Tenant: ${tenantSlug}, Branch: ${branchId}`);

  // For system_shared, skip tenant validation and use default DB
  if (tenantSlug === 'system_shared') {
    console.log('[CHEMICAL] Using system_shared tenant (bypassing validation)');
    req.tenant = {
      db_name: process.env.DB_NAME || 'restpoint_main',
      tenant_id: 1,
      name: 'System Shared'
    };
    return next();
  }

  // For non-system tenants, validate
  try {
    console.log(`[CHEMICAL] Validating tenant: ${tenantSlug}`);
    const tenantStatus = await validateTenantActive(tenantSlug);

    if (!tenantStatus.active) {
      console.log(`[CHEMICAL] Tenant ${tenantSlug} not active: ${tenantStatus.reason}`);
      return res.status(403).json({
        success: false,
        message: tenantStatus.reason || 'Tenant not active'
      });
    }

    req.tenant = tenantStatus.tenant;
    console.log(`[CHEMICAL] Tenant validated: ${tenantStatus.tenant.db_name}`);

    // Auto-migrate: Ensure chemical tables exist in this tenant's database
    if (tenantStatus.tenant?.db_name) {
      ensureChemicalTables(tenantStatus.tenant.db_name).catch(err => {
        console.warn(`[CHEMICAL] Auto-migration warning for ${tenantStatus.tenant.db_name}:`, err.message);
      });
    }

    // Resolve branch if not provided
    if (!req.branchId && tenantStatus.tenant?.db_name) {
      const lastDash = tenantSlug.lastIndexOf('-');
      if (lastDash > 0) {
        const branchPart = tenantSlug.substring(lastDash + 1);
        try {
          const branches = await safeTenantQuery(
            tenantStatus.tenant.db_name,
            'SELECT branch_id FROM branches WHERE branch_slug LIKE ? OR branch_name LIKE ? LIMIT 1',
            [`%${branchPart}%`, `%${branchPart}%`]
          );
          if (branches.length > 0) {
            req.branchId = branches[0].branch_id.toString();
            console.log(`[CHEMICAL] Branch resolved: ${req.branchId}`);
          }
        } catch (e) {
          console.log('[CHEMICAL] Branch resolution skipped:', e.message);
        }
      }
    }
  } catch (err) {
    console.error('[CHEMICAL] Tenant resolution error:', err.message);

    // In development, allow fallback
    if (process.env.NODE_ENV === 'development') {
      console.log('[CHEMICAL] Development fallback: Using default tenant');
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
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'chemical-service',
    version: '1.0.0',
    tenant: req.tenantSlug,
    branchId: req.branchId,
    db_name: req.tenant?.db_name || 'unknown',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// TEST ENDPOINT (for debugging)
// ============================================
app.get('/api/v1/restpoint/chemicals/test', (req, res) => {
  res.json({
    success: true,
    message: 'Chemical service is running!',
    tenant: req.tenant,
    tenantSlug: req.tenantSlug,
    branchId: req.branchId,
    headers: {
      'x-tenant-slug': req.headers['x-tenant-slug'],
      'x-branch-id': req.headers['x-branch-id'],
      'authorization': req.headers.authorization ? 'Present' : 'Not present'
    }
  });
});

// ============================================
// ROUTES - Mount chemical routes at /chemicals
// ============================================
// The API Gateway strips /api/v1/restpoint/chemicals prefix and forwards clean paths
// So we need to mount at /chemicals to handle the full path
app.use('/chemicals', chemicalRoutes);

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  console.log(`[CHEMICAL] 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    available_endpoints: [
      '/health',
      '/api/v1/restpoint/chemicals',
      '/api/v1/restpoint/chemicals/test',
      '/api/v1/restpoint/chemicals/:id',
      '/api/v1/restpoint/chemicals/analytics',
      '/api/v1/restpoint/chemicals/ppe-requests',
      '/api/v1/restpoint/chemicals/transfers'
    ]
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error(`[CHEMICAL ERROR] ${err.message}`);
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ============================================
// AUTO-MIGRATION: Ensure chemical tables exist
// ============================================
const CHEMICAL_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS chemicals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL DEFAULT 1,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'embalming',
  unit VARCHAR(50) NOT NULL DEFAULT 'liters',
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_stock_level DECIMAL(10,2) DEFAULT 0,
  reorder_level DECIMAL(10,2) DEFAULT 0,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  hazard_level ENUM('low', 'medium', 'high') DEFAULT 'low',
  supplier VARCHAR(255) DEFAULT NULL,
  batch_number VARCHAR(100) DEFAULT NULL,
  expiry_date DATE DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_chemicals_branch (branch_id),
  INDEX idx_chemicals_category (category),
  INDEX idx_chemicals_active (is_active),
  INDEX idx_chemicals_hazard (hazard_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chemical_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chemical_id INT NOT NULL,
  branch_id INT NOT NULL DEFAULT 1,
  transaction_type ENUM('received', 'consumed', 'adjusted', 'wasted', 'transferred') NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'liters',
  previous_stock DECIMAL(10,2) NOT NULL,
  new_stock DECIMAL(10,2) NOT NULL,
  reference_type VARCHAR(50) DEFAULT NULL,
  reference_id INT DEFAULT NULL,
  performed_by INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chemical_id) REFERENCES chemicals(id) ON DELETE CASCADE,
  INDEX idx_transactions_chemical (chemical_id),
  INDEX idx_transactions_branch (branch_id),
  INDEX idx_transactions_type (transaction_type),
  INDEX idx_transactions_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS deceased_chemical_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL DEFAULT 1,
  deceased_id INT DEFAULT NULL,
  chemical_id INT NOT NULL,
  quantity_used DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'liters',
  transaction_id INT DEFAULT NULL,
  used_by INT DEFAULT NULL,
  usage_notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chemical_id) REFERENCES chemicals(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES chemical_transactions(id) ON DELETE SET NULL,
  INDEX idx_usage_deceased (deceased_id),
  INDEX idx_usage_chemical (chemical_id),
  INDEX idx_usage_branch (branch_id),
  INDEX idx_usage_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chemical_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL DEFAULT 1,
  chemical_id INT NOT NULL,
  alert_threshold DECIMAL(10,2) DEFAULT NULL,
  is_triggered TINYINT(1) DEFAULT 0,
  resolved_at TIMESTAMP NULL DEFAULT NULL,
  resolved_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chemical_id) REFERENCES chemicals(id) ON DELETE CASCADE,
  UNIQUE KEY uk_chemical_alert (chemical_id, branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ppe_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL DEFAULT 1,
  item_name VARCHAR(255) NOT NULL,
  quantity_requested INT NOT NULL DEFAULT 1,
  quantity_approved INT DEFAULT NULL,
  status ENUM('pending', 'approved', 'rejected', 'fulfilled') DEFAULT 'pending',
  requested_by VARCHAR(255) NOT NULL,
  approved_by INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ppe_branch (branch_id),
  INDEX idx_ppe_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chemical_transfers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chemical_id INT NOT NULL,
  from_branch_id INT NOT NULL,
  to_branch_id INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'liters',
  status ENUM('pending', 'approved', 'completed', 'cancelled') DEFAULT 'pending',
  requested_by INT DEFAULT NULL,
  approved_by INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (chemical_id) REFERENCES chemicals(id) ON DELETE CASCADE,
  INDEX idx_transfer_from (from_branch_id),
  INDEX idx_transfer_to (to_branch_id),
  INDEX idx_transfer_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

async function ensureChemicalTables(dbName) {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
    });

    // Extract individual CREATE TABLE statements using regex (skips comments)
    const createRegex = /CREATE TABLE IF NOT EXISTS \w+[\s\S]*?\)\s*ENGINE=InnoDB[^;]*;/gi;
    let match;
    let count = 0;
    while ((match = createRegex.exec(CHEMICAL_TABLES_SQL)) !== null) {
      try {
        await connection.query(match[0]);
        const tableName = match[0].match(/CREATE TABLE IF NOT EXISTS (\w+)/i)?.[1] || 'unknown';
        console.log(`  ✅ Table '${tableName}' ensured in ${dbName}`);
        count++;
      } catch (err) {
        console.warn(`  ⚠️ Table creation warning: ${err.message}`);
      }
    }

    console.log(`✅ Chemical tables ensured in database: ${dbName} (${count} tables)`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to ensure chemical tables in ${dbName}:`, error.message);
    return false;
  } finally {
    if (connection) await connection.end().catch(() => { });
  }
}

// ============================================
// START SERVER
// ============================================
async function startServer() {
  // Run auto-migration on the main database
  const mainDb = process.env.DB_NAME || 'restpoint_main';
  console.log(`🔧 Running auto-migration for chemical tables in: ${mainDb}`);
  await ensureChemicalTables(mainDb);

  app.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log(`🧪 Chemical Service`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   DB: ${process.env.DB_NAME || 'not configured'}`);
    console.log('========================================');
  });
}

startServer();

module.exports = app;
