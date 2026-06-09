const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { safeQuery } = require('../../shared/database');
const { validateTenantActive } = require('../../shared/tenancy');
const driverDispatchRoutes = require('./routes/driverDispatchRoutes');
const bookHearseRoutes = require('./routes/bookhearse');

const app = express();
const PORT = process.env.PORT || 8109;

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
    service: 'hearse-service',
    tenant: req.tenantSlug,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/restpoint', driverDispatchRoutes);
app.use('/api/v1/restpoint', bookHearseRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`hearse-service is running on port ${PORT}`);
});
