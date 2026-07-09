const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql2/promise');
const { migrateTenantTables } = require('./migrate-tenant-tables');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO for real-time updates
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  }
});

app.set('io', io);

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-slug', 'x-tenant-id', 'x-user-id']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[LEAVE] Client connected: ${socket.id}`);

  socket.on('join_tenant', (tenantSlug) => {
    socket.join(`tenant_${tenantSlug}`);
    console.log(`[LEAVE] Socket ${socket.id} joined tenant_${tenantSlug}`);
  });

  socket.on('join_admin', () => {
    socket.join('admin');
    console.log(`[LEAVE] Socket ${socket.id} joined admin room`);
  });

  socket.on('disconnect', () => {
    console.log(`[LEAVE] Client disconnected: ${socket.id}`);
  });
});

// Tenant middleware
app.use(async (req, res, next) => {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-slug'] || 'system_shared';
    req.tenantSlug = tenantSlug;

    console.log(`[LEAVE] ${req.method} ${req.path} - Tenant: ${tenantSlug}`);

    if (tenantSlug === 'system_shared') {
      req.tenant = {
        db_name: process.env.DB_NAME || 'restpoint_main',
        tenant_id: 1,
        name: 'System Shared'
      };
      return next();
    }

    // Validate tenant
    const { validateTenantActive } = require('../../shared/tenancy');
    const tenantStatus = await validateTenantActive(tenantSlug);

    if (!tenantStatus.active) {
      return res.status(403).json({
        status: 'error',
        message: tenantStatus.reason || 'Tenant not active'
      });
    }

    req.tenant = tenantStatus.tenant;

    // Auto-migrate: Ensure leave tables exist in this tenant's database
    if (tenantStatus.tenant?.db_name) {
      migrateTenantTables(tenantStatus.tenant.db_name).catch(err => {
        console.warn(`[LEAVE] Auto-migration warning for ${tenantStatus.tenant.db_name}:`, err.message);
      });
    }

    next();
  } catch (error) {
    console.error('[LEAVE] Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initialize tenant database',
      error: error.message
    });
  }
});

// Routes
const leaveRoutes = require('./leaveRoutes');
app.use('/leaves', leaveRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'leave-service', timestamp: new Date().toISOString() });
});

// ============================================
// AUTO-MIGRATION: Ensure leave tables exist
// ============================================
async function ensureLeaveTables(dbName) {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
    });

    await migrateTenantTables(dbName);
    console.log(`✅ Leave tables ensured in database: ${dbName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to ensure leave tables in ${dbName}:`, error.message);
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
  console.log(`🔧 Running auto-migration for leave tables in: ${mainDb}`);
  await ensureLeaveTables(mainDb);

  const PORT = process.env.PORT || 5017;
  server.listen(PORT, () => {
    console.log('========================================');
    console.log(`📅 Leave Management Service`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('========================================');
  });
}

startServer();

module.exports = { app, server, io };