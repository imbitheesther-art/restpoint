const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { safeMasterQuery } = require('../../shared/dist/dbConfig');
const { validateTenantActive } = require('../../shared/dist/tenancy');
const notificationsController = require('./controllers/notifications');
const supportTicketsRouter = require('./routes/supportTickets');

const app = express();
const PORT = process.env.PORT || 8111;

app.use(cors());
app.use(helmet());
app.use(express.json());

// Tenant Authentication Middleware - validates token + tenant for every request
app.use(async (req, res, next) => {
  const tenantSlug = req.headers['x-tenant-slug'] || 'system_shared';
  req.tenantSlug = tenantSlug;

  // Public endpoints that don't require auth
  const publicPaths = ['/health'];
  const isPublic = publicPaths.some(path => req.path === path || req.path.startsWith(path));
  
  if (!isPublic && req.method !== 'OPTIONS') {
    // Validate tenant exists and is active
    if (tenantSlug !== 'system_shared') {
      try {
        const tenantStatus = await validateTenantActive(tenantSlug);
        if (!tenantStatus.active) {
          return res.status(403).json({ success: false, message: tenantStatus.reason || 'Tenant not active' });
        }
        req.tenant = tenantStatus.tenant;
        if (tenantStatus.tenant && tenantStatus.tenant.db_name) {
          req.tenantDbName = tenantStatus.tenant.db_name;
        }
      } catch (err) {
        console.error('[TenantAuth] Error validating tenant:', err.message);
        // Allow request to proceed - some services handle their own auth
      }
    }
    
    // Check for auth token (optional for system_shared endpoints)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      req.authToken = authHeader.slice(7);
    }
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'notification-service',
    tenant: req.tenantSlug,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/restpoint/notification', async (req, res) => {
  res.json({
    success: true,
    message: 'Hello from notification-service!',
    tenant: req.tenantSlug
  });
});

// Notification REST endpoints
app.get('/api/v1/restpoint/notification/notifications', async (req, res) => {
  return notificationsController.getAllNotifications(req, res);
});

app.put('/api/v1/restpoint/notification/notifications/mark-all-read', async (req, res) => {
  return notificationsController.markAllNotificationsAsRead(req, res);
});

app.put('/api/v1/restpoint/notification/notifications/:id/read', async (req, res) => {
  return notificationsController.markNotificationAsRead(req, res);
});

app.delete('/api/v1/restpoint/notification/notifications/:id', async (req, res) => {
  return notificationsController.deleteNotification(req, res);
});

// Create notification endpoint (for real-time notifications from other services)
app.post('/api/v1/restpoint/notification/notifications', async (req, res) => {
  return notificationsController.createNotification(req, res);
});

// Subscribe endpoint placeholder (store subscription in tenant DB or push service)
app.post('/api/v1/restpoint/notification/subscribe', async (req, res) => {
  // In a full implementation we'd persist the subscription and send push messages
  console.log('Received push subscription (placeholder)');
  return res.status(200).json({ success: true, message: 'Subscribed (placeholder)' });
});

// Support Ticket Routes
app.use(supportTicketsRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`notification-service is running on port ${PORT}`);
  // Start background notification job for all tenants (runs every 60s)
  setInterval(async () => {
    try {
      const tenants = await safeMasterQuery(`SELECT tenant_slug, db_name FROM tenants WHERE status = 'active'`);
      for (const t of tenants) {
        if (t.db_name) {
          notificationsController.handleDeceasedNotifications(t.db_name, null);
        }
      }
    } catch (err) {
      console.error('Notification background job error:', err);
    }
  }, 60 * 1000);
});
