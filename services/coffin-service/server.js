const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { safeQuery } = require('../../shared/database');
const { validateTenantActive } = require('../../shared/tenancy');
const coffinRoutes = require('./routes/coffinRoutes.cjs');
const { errorHandler, notFoundHandler } = require('../../global/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 8108;

app.use(cors());
app.use(helmet());
app.use(express.json());

// Tenant Resolution Middleware
app.use(async (req, res, next) => {
  const tenantSlug = req.headers['x-tenant-slug'] || 'system_shared';
  req.tenantSlug = tenantSlug;

  if (tenantSlug !== 'system_shared') {
    const tenantStatus = await validateTenantActive(tenantSlug);
    if (!tenantStatus.active) {
      return res.status(403).json({ success: false, message: tenantStatus.reason });
    }
    req.tenant = tenantStatus.tenant;
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'coffin-service',
    tenant: req.tenantSlug,
    timestamp: new Date().toISOString()
  });
});

// ==============================
// MOUNT ROUTES - Clean root mount
// ==============================
// The API Gateway strips /api/v1/restpoint/coffins prefix and forwards clean paths
// So we mount at / and routes use clean paths like /, /register, /list, etc.
app.use('/', coffinRoutes);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`coffin-service is running on port ${PORT}`);
});