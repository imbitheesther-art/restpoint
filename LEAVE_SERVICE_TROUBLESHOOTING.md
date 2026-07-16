# Leave Service 500 Error - Troubleshooting Guide

## Issue
The leave service is returning 500 Internal Server Error when trying to apply for leave:
```
POST https://restpoint.co.ke/api/v1/restpoint/leaves/mumo-feuneral-nairobi/apply
Status: 500 Internal Server Error
```

## Root Cause
The routing is now working correctly (no more 404), but the service is crashing because:
1. The `leave_requests` table doesn't exist in the tenant database
2. The `users` table is missing required columns (`annual_leave_balance`, `name`, `email`)
3. The auto-migration is failing silently

## Immediate Fix Steps

### 1. Check Leave Service Logs
```bash
# SSH to your server
ssh user@your-server

# Check the leave service logs for the actual error
docker logs restpoint_leave_service --tail 100

# Look for errors like:
# - "Table 'mumo_feuneral_nairobi.leave_requests' doesn't exist"
# - "Unknown column 'annual_leave_balance' in 'field list'"
# - "Unknown column 'name' in 'field list'"
```

### 2. Manually Run Migration
The auto-migration on startup might be failing. Run it manually:

```bash
# Execute migration script inside the leave-service container
docker exec -it restpoint_leave_service node migrate-tenant-tables.js

# Or if you need to migrate a specific tenant database
docker exec -it restpoint_leave_service node migrate-tenant-tables.js mumo-feuneral-nairobi
```

### 3. Verify Tables Exist
```bash
# Connect to MariaDB
docker exec -it restpoint_mariadb mysql -u root -p

# Check if leave_requests table exists in the tenant database
USE mumo_feuneral_nairobi;
SHOW TABLES LIKE 'leave_requests';

# Check if users table has required columns
DESCRIBE users;
```

### 4. Manual SQL Fix (if needed)
If the tables/columns don't exist, run this SQL:

```sql
-- Use the tenant database
USE mumo_feuneral_nairobi;

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  leave_type VARCHAR(50) NOT NULL,
  priority ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days DECIMAL(5,2) NOT NULL,
  reason TEXT,
  supporting_document VARCHAR(500),
  is_half_day BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending',
  rejection_reason TEXT,
  approved_by INT NULL,
  approved_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_leave_user (user_id),
  INDEX idx_leave_status (status),
  INDEX idx_leave_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add required columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS annual_leave_balance DECIMAL(5,2) DEFAULT 21.00;

-- Update existing users with default balance
UPDATE users SET annual_leave_balance = 21.00 WHERE annual_leave_balance IS NULL;
```

### 5. Restart Leave Service
After fixing the database:

```bash
docker-compose restart leave-service

# Check logs to confirm it started successfully
docker logs restpoint_leave_service --tail 50
```

## Improved Error Handling (Code Fix)

The issue is that the migration errors are being caught and logged as warnings, but the service continues to start even though the tables don't exist. Let me improve the error handling:

<write_to_file>
<path>services/leave-service/server.js</path>
<content>
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
    origin: true,
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
      try {
        await migrateTenantTables(tenantStatus.tenant.db_name);
        console.log(`[LEAVE] ✅ Auto-migration successful for ${tenantStatus.tenant.db_name}`);
      } catch (err) {
        console.error(`[LEAVE] ❌ Auto-migration failed for ${tenantStatus.tenant.db_name}:`, err.message);
        // Don't fail the request, but log the error prominently
      }
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
      authPlugins: {
        auth_gssapi_client: function () {
          return function () {
            throw new Error('GSSAPI not supported - use mysql_native_password');
          };
        },
      },
      connectTimeout: 10000,
      acquireTimeout: 10000,
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
  const migrationSuccess = await ensureLeaveTables(mainDb);
  
  if (!migrationSuccess) {
    console.warn(`⚠️  Warning: Initial migration failed for ${mainDb}. Tables will be created on first request.`);
  }

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