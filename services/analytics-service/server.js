const path = require('path');
// Must load .env FIRST before any other module that reads process.env
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const helmet = require('helmet');
const { safeQuery } = require('../../shared/database');
const { validateTenantActive } = require('../../shared/tenancy');
const analyticsRoutes = require('./routes/analyticsRoutes');
const enhancedAnalyticsRoutes = require('./routes/enhancedAnalyticsRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5012;

// CORS - allow frontend dev server and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-slug', 'x-tenant-id', 'x-branch-id', 'x-branch-slug', 'x-user-id']
}));

// Socket.IO setup for real-time analytics updates
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.set('io', io);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Tenant Resolution Middleware - handles both single-tenant and multi-branch
app.use(async (req, res, next) => {
  const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-tenant-id'] || 'system_shared';
  const branchId = req.headers['x-branch-id'] || req.query.branchId || null;

  req.tenantSlug = tenantSlug;
  req.branchId = branchId;

  if (tenantSlug !== 'system_shared') {
    const tenantStatus = await validateTenantActive(tenantSlug);
    if (!tenantStatus.active) {
      // If tenant is not found (404) - block the request
      if (tenantStatus.reason && tenantStatus.reason.includes('not found')) {
        return res.status(404).json({ success: false, message: tenantStatus.reason });
      }
      // If DB connection error (Docker not running / network) - allow for development
      if (tenantStatus.reason && tenantStatus.reason.includes('Error validating')) {
        console.warn(`[Tenant] DB unavailable, allowing request for "${tenantSlug}" (dev mode)`);
        req.tenant = { id: tenantSlug, db_name: tenantSlug, tenant_slug: tenantSlug };
        return next();
      }
      // If inactive tenant - block
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
    service: 'analytics-service',
    tenant: req.tenantSlug,
    timestamp: new Date().toISOString()
  });
});

// Analytics routes - all under /api/v1/restpoint
app.use('/api/v1/restpoint', analyticsRoutes);

// Enhanced analytics routes
app.use('/api/v1/analytics', enhancedAnalyticsRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Join tenant-specific room for targeted updates
  socket.on('join_tenant', (tenantSlug) => {
    if (tenantSlug) {
      socket.join(`tenant_${tenantSlug}`);
      console.log(`[Socket.IO] ${socket.id} joined tenant: ${tenantSlug}`);
    }
  });

  // Join dashboard room for real-time dashboard updates
  socket.on('join_dashboard', () => {
    socket.join('dashboard');
    console.log(`[Socket.IO] ${socket.id} joined dashboard room`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Periodic dashboard data push (every 30 seconds)
setInterval(async () => {
  try {
    // This will be called by the comprehensive dashboard controller
    // when clients request it. For now, just keep the connection alive.
    io.to('dashboard').emit('heartbeat', {
      timestamp: new Date().toISOString(),
      message: 'Analytics service alive'
    });
  } catch (error) {
    console.error('[Socket.IO] Heartbeat error:', error.message);
  }
}, 30000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`analytics-service is running on port ${PORT} with Socket.IO`);
});