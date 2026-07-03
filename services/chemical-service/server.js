const dotenv = require('dotenv');
const path = require('path');

// Load .env from chemical-service directory
dotenv.config({ path: path.join(__dirname, '.env'), override: true });
// Also load global .env as fallback
dotenv.config({ path: path.join(__dirname, '../../.env'), override: false });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
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
      db_name: process.env.DB_NAME || 'restpoint_db',
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
        db_name: process.env.DB_NAME || 'restpoint_db',
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
// ROUTES - Mount chemical routes
// ============================================
app.use('/api/v1/restpoint/chemicals', chemicalRoutes);

// Also support root path for testing
app.get('/chemicals', (req, res) => {
  res.json({
    success: true,
    message: 'Chemical service is running. Use /api/v1/restpoint/chemicals for API endpoints.',
    tenant: req.tenant?.db_name || 'unknown'
  });
});

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
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log(`🧪 Chemical Service`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DB: ${process.env.DB_NAME || 'not configured'}`);
  console.log('========================================');
});

module.exports = app;