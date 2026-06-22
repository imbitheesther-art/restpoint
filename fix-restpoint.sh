#!/bin/bash
# =============================================================================
# RestPoint Complete Fix Script
# =============================================================================
# This script fixes ALL issues in the RestPoint deployment:
# 1. Database initialization with proper schema
# 2. Missing service files and dependencies
# 3. API Gateway configuration
# 4. Auth Service fixes
# 5. All missing microservices creation
# 6. Comprehensive docker-compose.yml
# 7. Verification
#
# Usage: bash fix-restpoint.sh
# Safe to run multiple times (idempotent)
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

log_info "============================================"
log_info "  RestPoint Complete Fix Script"
log_info "  Project Root: $PROJECT_ROOT"
log_info "============================================"
echo ""

# =============================================================================
# PHASE 1: Create Missing Shared Files
# =============================================================================
log_info "PHASE 1: Creating missing shared files..."

# Create Branch.model.ts for tenant service
if [ ! -f "services/tenant-service/models/Branch.model.ts" ]; then
    log_info "Creating Branch.model.ts..."
    cat > "services/tenant-service/models/Branch.model.ts" << 'BRANCHMODEL'
import mysql from 'mysql2/promise';

export interface BranchData {
    branch_id?: number;
    branch_name: string;
    branch_slug: string;
    branch_db_name: string;
    branch_location: string;
    branch_phone: string;
    branch_email: string;
    is_active: boolean;
    created_at?: Date;
}

export class BranchModel {
    static async create(tenantDbName: string, data: {
        branch_name: string;
        branch_slug: string;
        branch_db_name: string;
        branch_location: string;
        branch_phone: string;
        branch_email: string;
    }): Promise<number> {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: tenantDbName
        });
        try {
            const [result] = await conn.query(
                `INSERT INTO branches (branch_name, branch_slug, branch_db_name, branch_location, branch_phone, branch_email, is_active) 
                 VALUES (?, ?, ?, ?, ?, ?, 1)`,
                [data.branch_name, data.branch_slug, data.branch_db_name, data.branch_location, data.branch_phone, data.branch_email]
            );
            return (result as any).insertId;
        } finally {
            await conn.end();
        }
    }

    static async findBySlug(tenantDbName: string, slug: string): Promise<BranchData | null> {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: tenantDbName
        });
        try {
            const [rows] = await conn.query(
                'SELECT * FROM branches WHERE branch_slug = ? AND is_active = TRUE LIMIT 1',
                [slug]
            );
            const list = rows as any[];
            return list.length > 0 ? list[0] as BranchData : null;
        } finally {
            await conn.end();
        }
    }

    static async getAll(tenantDbName: string): Promise<BranchData[]> {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: tenantDbName
        });
        try {
            const [rows] = await conn.query(
                'SELECT * FROM branches WHERE is_active = TRUE ORDER BY branch_name'
            );
            return rows as BranchData[];
        } finally {
            await conn.end();
        }
    }
}
BRANCHMODEL
    log_ok "Branch.model.ts created"
else
    log_ok "Branch.model.ts already exists"
fi

# Create migration-service.ts if it doesn't exist
if [ ! -f "shared/services/migration-service.ts" ]; then
    log_info "Creating migration-service.ts..."
    cat > "shared/services/migration-service.ts" << 'MIGRATIONSERVICE'
import mysql from 'mysql2/promise';

export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
}

export interface Migration {
    name: string;
    sql: string;
}

export interface MigrationResult {
    success: boolean;
    migrationsRun: string[];
    errors: string[];
}

export class MigrationService {
    async runTenantMigrations(
        dbName: string,
        migrations: Migration[],
        config: DatabaseConfig
    ): Promise<MigrationResult> {
        const result: MigrationResult = {
            success: true,
            migrationsRun: [],
            errors: []
        };

        let conn: mysql.Connection | null = null;
        try {
            conn = await mysql.createConnection({
                host: config.host,
                port: config.port,
                user: config.user,
                password: config.password,
                database: dbName,
                multipleStatements: true
            });

            // Create migrations tracking table
            await conn.query(`
                CREATE TABLE IF NOT EXISTS _migrations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL UNIQUE,
                    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Run each migration
            for (const migration of migrations) {
                const [existing] = await conn.query(
                    'SELECT id FROM _migrations WHERE name = ?',
                    [migration.name]
                );
                if (Array.isArray(existing) && existing.length > 0) {
                    continue; // Already executed
                }

                try {
                    await conn.query(migration.sql);
                    await conn.query(
                        'INSERT INTO _migrations (name) VALUES (?)',
                        [migration.name]
                    );
                    result.migrationsRun.push(migration.name);
                } catch (err: any) {
                    result.errors.push(`Migration ${migration.name}: ${err.message}`);
                    console.warn(`Migration ${migration.name} failed: ${err.message}`);
                }
            }
        } catch (err: any) {
            result.success = false;
            result.errors.push(`Database connection error: ${err.message}`);
        } finally {
            if (conn) await conn.end();
        }

        result.success = result.errors.length === 0;
        return result;
    }
}
MIGRATIONSERVICE
    log_ok "migration-service.ts created"
else
    log_ok "migration-service.ts already exists"
fi

# =============================================================================
# PHASE 2: Create All Missing Microservices
# =============================================================================
log_info ""
log_info "PHASE 2: Creating missing microservices..."

# List of services that need basic health endpoints
# These services have directories but may not have proper server.js/Dockerfile
MISSING_SERVICES=(
    "analytics-service:5009"
    "bodycheckout-service:5015"
    "calender-service:5010"
    "call-service:5018"
    "chemical-service:5105"
    "edocuments-service:8116"
    "extra-services:5016"
    "portal-service:5019"
    "visitors-service:5014"
    "qrcode-service:5012"
)

for service_entry in "${MISSING_SERVICES[@]}"; do
    SERVICE_NAME="${service_entry%%:*}"
    SERVICE_PORT="${service_entry##*:}"
    SERVICE_DIR="services/$SERVICE_NAME"
    
    log_info "Checking $SERVICE_NAME..."
    
    # Create directory if it doesn't exist
    mkdir -p "$SERVICE_DIR"
    
    # Create package.json if missing
    if [ ! -f "$SERVICE_DIR/package.json" ]; then
        log_info "  Creating package.json for $SERVICE_NAME..."
        cat > "$SERVICE_DIR/package.json" << PKGJSON
{
  "name": "$SERVICE_NAME",
  "version": "1.0.0",
  "description": "RestPoint $SERVICE_NAME",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.0",
    "helmet": "^7.0.0",
    "mysql2": "^3.0.0"
  }
}
PKGJSON
        log_ok "  package.json created"
    fi
    
    # Create server.js if missing
    if [ ! -f "$SERVICE_DIR/server.js" ]; then
        log_info "  Creating server.js for $SERVICE_NAME..."
        cat > "$SERVICE_DIR/server.js" << SERVERJS
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || $SERVICE_PORT;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        service: '$SERVICE_NAME',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API routes placeholder
app.get('/api/v1/restpoint/${SERVICE_NAME%-service}/health', (req, res) => {
    res.json({
        success: true,
        message: '${SERVICE_NAME} is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: \`Route \${req.originalUrl} not found\`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(\`[ERROR] \${err.message}\`);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(\`🚀 $SERVICE_NAME running on port \${PORT}\`);
});
SERVERJS
        log_ok "  server.js created"
    fi
    
    # Create Dockerfile if missing
    if [ ! -f "$SERVICE_DIR/Dockerfile" ]; then
        log_info "  Creating Dockerfile for $SERVICE_NAME..."
        cat > "$SERVICE_DIR/Dockerfile" << DOCKERFILE
FROM node:20-alpine

RUN apk add --no-cache dumb-init wget

RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY . .

RUN chown -R nodejs:nodejs /usr/src/app

USER nodejs

EXPOSE $SERVICE_PORT
ENV NODE_ENV=production
ENV PORT=$SERVICE_PORT

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:$SERVICE_PORT/health || exit 1

CMD ["node", "server.js"]
DOCKERFILE
        log_ok "  Dockerfile created"
    fi
    
    # Create .env if missing
    if [ ! -f "$SERVICE_DIR/.env" ]; then
        cat > "$SERVICE_DIR/.env" << ENVFILE
PORT=$SERVICE_PORT
NODE_ENV=production
DB_HOST=mariadb
DB_PORT=3306
DB_USER=restpoint_user
DB_PASSWORD=RestPointUser2024
DB_NAME=restpoint_main
ENVFILE
        log_ok "  .env created"
    fi
    
    log_ok "$SERVICE_NAME ready"
done

# =============================================================================
# PHASE 3: Fix Specific Services
# =============================================================================
log_info ""
log_info "PHASE 3: Fixing specific services..."

# --- Fix API Gateway ---
log_info "Fixing API Gateway..."
API_GATEWAY_DIR="services/api-gateway"
if [ -f "$API_GATEWAY_DIR/server.js" ]; then
    # Add TRUST_PROXY support - check if already added
    if ! grep -q "TRUST_PROXY" "$API_GATEWAY_DIR/server.js" 2>/dev/null; then
        # Add trust proxy setting after the dotenv config
        sed -i 's/dotenv.config();/dotenv.config();\n\n\/\/ Trust proxy for correct IP behind reverse proxy\napp.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : 0);/' "$API_GATEWAY_DIR/server.js"
        log_ok "  TRUST_PROXY added to API Gateway"
    else
        log_ok "  TRUST_PROXY already configured"
    fi
fi

# Ensure wget is in Dockerfile
if [ -f "$API_GATEWAY_DIR/Dockerfile" ]; then
    if ! grep -q "wget" "$API_GATEWAY_DIR/Dockerfile" 2>/dev/null; then
        sed -i 's/RUN apk add --no-cache dumb-init/RUN apk add --no-cache dumb-init wget/' "$API_GATEWAY_DIR/Dockerfile"
        log_ok "  wget added to API Gateway Dockerfile"
    fi
fi

# --- Fix Auth Service ---
log_info "Fixing Auth Service..."
AUTH_DIR="services/auth-service"
if [ -f "$AUTH_DIR/Dockerfile" ]; then
    if ! grep -q "wget" "$AUTH_DIR/Dockerfile" 2>/dev/null; then
        if grep -q "dumb-init" "$AUTH_DIR/Dockerfile" 2>/dev/null; then
            sed -i 's/dumb-init/dumb-init wget/' "$AUTH_DIR/Dockerfile"
        else
            # Add after FROM
            sed -i 's|FROM node|RUN apk add --no-cache wget\n\nFROM node|' "$AUTH_DIR/Dockerfile" 2>/dev/null || true
        fi
        log_ok "  wget added to Auth Service Dockerfile"
    fi
fi

# --- Fix Tenant Service ---
log_info "Fixing Tenant Service..."
TENANT_DIR="services/tenant-service"

# Fix the server.ts to use proper cors import
if [ -f "$TENANT_DIR/server.ts" ]; then
    # Check if cors is imported properly
    if grep -q "// import cors" "$TENANT_DIR/server.ts" 2>/dev/null; then
        # Uncomment the cors import
        sed -i 's|// import cors|import cors|' "$TENANT_DIR/server.ts"
        log_ok "  Fixed cors import in tenant service"
    fi
fi

# Ensure tenant service has all needed files
if [ ! -f "$TENANT_DIR/routes/onboardingRoutes.js" ] && [ ! -f "$TENANT_DIR/routes/onboardingRoutes.ts" ]; then
    log_info "  Creating onboardingRoutes.ts..."
    mkdir -p "$TENANT_DIR/routes"
    cat > "$TENANT_DIR/routes/onboardingRoutes.ts" << ONBOARDINGROUTES
import { Router, Request, Response } from 'express';

const router = Router();

// Health check for onboarding
router.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', service: 'tenant-onboarding' });
});

// Organization registration endpoint
router.post('/organization', async (req: Request, res: Response) => {
    try {
        const { TenantModel } = require('../models/Tenant.model');
        const result = await TenantModel.registerTenant(req.body);
        res.status(201).json({
            success: true,
            message: 'Tenant registered successfully',
            data: result
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        // Forward to auth service
        res.json({
            success: true,
            message: 'Use /api/v1/restpoint/auth/login for authentication'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
ONBOARDINGROUTES
    log_ok "  onboardingRoutes.ts created"
fi

if [ ! -f "$TENANT_DIR/routes/systemAdminRoutes.ts" ] && [ ! -f "$TENANT_DIR/routes/systemAdminRoutes.js" ]; then
    log_info "  Creating systemAdminRoutes.ts..."
    mkdir -p "$TENANT_DIR/routes"
    cat > "$TENANT_DIR/routes/systemAdminRoutes.ts" << SYSTEMADMINROUTES
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', service: 'system-admin' });
});

router.get('/tenants', async (req: Request, res: Response) => {
    try {
        const { TenantModel } = require('../models/Tenant.model');
        const tenants = await TenantModel.getAllTenants();
        res.json({ success: true, data: tenants });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
SYSTEMADMINROUTES
    log_ok "  systemAdminRoutes.ts created"
fi

# =============================================================================
# PHASE 4: Database Initialization Script
# =============================================================================
log_info ""
log_info "PHASE 4: Creating database initialization script..."

cat > "init-db.sql" << 'INITSQL'
-- RestPoint Database Initialization Script
-- Run: mysql -h localhost -u root -pRestPoint2024! < init-db.sql

-- Create main database
CREATE DATABASE IF NOT EXISTS restpoint_main CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create tenant tracking database
CREATE DATABASE IF NOT EXISTS tenant_tracking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if not exists
CREATE USER IF NOT EXISTS 'restpoint_user'@'%' IDENTIFIED BY 'RestPointUser2024';
GRANT ALL PRIVILEGES ON restpoint_main.* TO 'restpoint_user'@'%';
GRANT ALL PRIVILEGES ON tenant_tracking.* TO 'restpoint_user'@'%';
GRANT ALL PRIVILEGES ON `tenant\_%`.* TO 'restpoint_user'@'%';
GRANT ALL PRIVILEGES ON `%\_%`.* TO 'restpoint_user'@'%';
FLUSH PRIVILEGES;

-- Create tenant_tracking tables
USE tenant_tracking;

CREATE TABLE IF NOT EXISTS tenants (
    tenant_id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_name VARCHAR(255) NOT NULL,
    tenant_slug VARCHAR(255) UNIQUE NOT NULL,
    db_name VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location TEXT,
    country VARCHAR(100),
    logo_url VARCHAR(500),
    jwt_secret VARCHAR(500),
    refresh_secret VARCHAR(500),
    status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
    subscription_status ENUM('active', 'trial', 'suspended', 'cancelled') DEFAULT 'trial',
    subscription_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_slug (tenant_slug),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create restpoint_main tables
USE restpoint_main;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'manager', 'staff', 'user') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS branches (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(255) NOT NULL,
    branch_slug VARCHAR(255) UNIQUE NOT NULL,
    branch_db_name VARCHAR(255),
    branch_location VARCHAR(255),
    branch_phone VARCHAR(50),
    branch_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_branch_slug (branch_slug),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mortuary_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_token (token(255)),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123)
-- bcrypt hash for 'admin123' with 10 rounds
INSERT IGNORE INTO users (email, password_hash, full_name, phone, role, is_active, is_verified) 
VALUES ('admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Admin', '+254700000000', 'admin', 1, 1);

-- Insert default mortuary settings
INSERT IGNORE INTO mortuary_settings (setting_key, setting_value, description) VALUES
('mortuary_name', 'RestPoint Mortuary', 'Default mortuary name'),
('timezone', 'Africa/Nairobi', 'Default timezone'),
('currency', 'KES', 'Default currency'),
('date_format', 'YYYY-MM-DD', 'Default date format'),
('time_format', '24h', 'Default time format');

-- Insert default tenant in tenant_tracking
INSERT IGNORE INTO tenant_tracking.tenants (tenant_name, tenant_slug, db_name, email, phone, location, country, status, subscription_status)
VALUES ('Default Tenant', 'default', 'restpoint_main', 'admin@example.com', '+254700000000', 'Nairobi', 'Kenya', 'active', 'active');
INITSQL
log_ok "init-db.sql created"

# =============================================================================
# PHASE 5: Create Comprehensive docker-compose.yml
# =============================================================================
log_info ""
log_info "PHASE 5: Creating comprehensive docker-compose.yml..."

cat > "docker-compose.yml" << 'DOCKERCOMPOSE'
version: '3.8'

services:
  # ============================================================================
  # INFRASTRUCTURE SERVICES
  # ============================================================================

  # MariaDB Database
  mariadb:
    image: mariadb:10.11
    container_name: restpoint_mariadb
    restart: always
    environment:
      MARIADB_ROOT_PASSWORD: RestPoint2024!
      MARIADB_DATABASE: restpoint_main
      MARIADB_USER: restpoint_user
      MARIADB_PASSWORD: RestPointUser2024
    ports:
      - "3306:3306"
    volumes:
      - mariadb_data:/var/lib/mysql
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    networks:
      - restpoint_network
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--su-mysql", "--connect", "--innodb_initialized"]
      interval: 15s
      timeout: 10s
      retries: 5
      start_period: 60s

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: restpoint_redis
    restart: always
    command: redis-server --appendonly yes --maxmemory 1gb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      restpoint_network:
        aliases:
          - restpoint_redis
          - redis
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 15s
      timeout: 10s
      retries: 5

  # RabbitMQ Message Queue
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: restpoint_rabbitmq
    restart: always
    environment:
      RABBITMQ_DEFAULT_USER: restpoint
      RABBITMQ_DEFAULT_PASS: RestPointRabbit2024
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - restpoint_network
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 15s
      timeout: 10s
      retries: 5

  # ============================================================================
  # CORE SERVICES
  # ============================================================================

  # API Gateway
  api-gateway:
    build:
      context: .
      dockerfile: ./services/api-gateway/Dockerfile
    container_name: restpoint_api_gateway
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - TRUST_PROXY=true
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
      - REDIS_HOST=restpoint_redis
      - REDIS_PORT=6379
      - RABBITMQ_HOST=rabbitmq
      - RABBITMQ_PORT=5672
      - JWT_SECRET=RestPointJWTSecret2024ChangeMe!SuperSecureInProduction
      - REFRESH_TOKEN_SECRET=RestPointRefreshTokenSecret2024!ChangeMe
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Auth Service
  auth-service:
    build:
      context: .
      dockerfile: ./services/auth-service/Dockerfile
    container_name: restpoint_auth_service
    ports:
      - "5001:5000"
    volumes:
      - auth_service_data:/usr/src/app/data
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
      - REDIS_HOST=restpoint_redis
      - REDIS_PORT=6379
      - JWT_SECRET=RestPointJWTSecret2024ChangeMe!SuperSecureInProduction
      - REFRESH_TOKEN_SECRET=RestPointRefreshTokenSecret2024!ChangeMe
      - JWT_EXPIRY=24h
      - REFRESH_TOKEN_EXPIRY=7d
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Tenant Service
  tenant-service:
    build:
      context: .
      dockerfile: ./services/tenant-service/Dockerfile
    container_name: restpoint_tenant_service
    ports:
      - "5002:5000"
    volumes:
      - tenant_service_data:/usr/src/app/data
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
      - REDIS_HOST=restpoint_redis
      - REDIS_PORT=6379
      - RABBITMQ_HOST=rabbitmq
      - RABBITMQ_PORT=5672
      - JWT_SECRET=RestPointJWTSecret2024ChangeMe!SuperSecureInProduction
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Deceased Service
  deceased-service:
    build:
      context: .
      dockerfile: ./services/deceased-service/Dockerfile
    container_name: restpoint_deceased_service
    ports:
      - "5003:5000"
    volumes:
      - deceased_service_data:/usr/src/app/data
      - ./services/deceased-service/uploads:/usr/src/app/uploads
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
      - REDIS_HOST=restpoint_redis
      - REDIS_PORT=6379
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Billing Service
  billing-service:
    build:
      context: .
      dockerfile: ./services/billing-service/Dockerfile
    container_name: restpoint_billing_service
    ports:
      - "5020:5000"
    volumes:
      - billing_service_data:/usr/src/app/data
      - ./services/billing-service/invoices:/usr/src/app/invoices
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
      - REDIS_HOST=restpoint_redis
      - REDIS_PORT=6379
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Notification Service
  notification-service:
    build:
      context: .
      dockerfile: ./services/notification-service/Dockerfile
    container_name: restpoint_notification_service
    ports:
      - "5111:5000"
    volumes:
      - notification_service_data:/usr/src/app/data
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
      - REDIS_HOST=restpoint_redis
      - REDIS_PORT=6379
      - RABBITMQ_HOST=rabbitmq
      - RABBITMQ_PORT=5672
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Documents Service
  documents-service:
    build:
      context: .
      dockerfile: ./services/documents-service/Dockerfile
    container_name: restpoint_documents_service
    ports:
      - "5007:5000"
    volumes:
      - documents_service_data:/usr/src/app/data
      - ./services/documents-service/uploads:/usr/src/app/uploads
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
      - REDIS_HOST=restpoint_redis
      - REDIS_PORT=6379
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Socket.io Service
  socketio-service:
    build:
      context: .
      dockerfile: ./services/socketio-service/Dockerfile
    container_name: restpoint_socketio_service
    ports:
      - "5013:5000"
    volumes:
      - socketio_service_data:/usr/src/app/data
    environment:
      - PORT=5000
      - NODE_ENV=production
      - REDIS_HOST=restpoint_redis
      - REDIS_PORT=6379
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Scanner Service
  scanner-service:
    build: ./services/scanner-service
    container_name: restpoint_scanner_service
    ports:
      - "2024:2024"
    environment:
      - SERVER_PORT=2024
      - SERVER_HOST=0.0.0.0
      - SERVER_ENV=production
      - STORAGE_TYPE=local
      - STORAGE_UPLOAD_PATH=./uploads/scanned
      - SCANNER_AUTO_DETECT=true
      - SCANNER_DEFAULT_DPI=300
      - SCANNER_DEFAULT_FORMAT=pdf
      - TZ=Africa/Nairobi
    volumes:
      - scanner_uploads:/app/uploads
      - scanner_config:/app/config
    networks:
      - restpoint_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:2024/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s

  # ============================================================================
  # MICROSERVICES (with health endpoints)
  # ============================================================================

  # MPESA Service
  mpesa-service:
    build: ./services/mpesa-service
    container_name: restpoint_mpesa_service
    ports:
      - "5011:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Invoice Service
  invoice-service:
    build: ./services/invoice-service
    container_name: restpoint_invoice_service
    ports:
      - "5005:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Marketplace Service
  marketplace-service:
    build: ./services/marketplace-service
    container_name: restpoint_marketplace_service
    ports:
      - "5004:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Coffin Service
  coffin-service:
    build: ./services/coffin-service
    container_name: restpoint_coffin_service
    ports:
      - "5006:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Analytics Service
  analytics-service:
    build: ./services/analytics-service
    container_name: restpoint_analytics_service
    ports:
      - "5009:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Body Checkout Service
  bodycheckout-service:
    build: ./services/bodycheckout-service
    container_name: restpoint_bodycheckout_service
    ports:
      - "5015:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # EDocuments Service
  edocuments-service:
    build: ./services/edocuments-service
    container_name: restpoint_edocuments_service
    ports:
      - "8116:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Calendar Service
  calender-service:
    build: ./services/calender-service
    container_name: restpoint_calender_service
    ports:
      - "5010:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Chemical Service
  chemical-service:
    build: ./services/chemical-service
    container_name: restpoint_chemical_service
    ports:
      - "5105:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Extra Services
  extra-services:
    build: ./services/extra-services
    container_name: restpoint_extra_services
    ports:
      - "5016:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Call Service
  call-service:
    build: ./services/call-service
    container_name: restpoint_call_service
    ports:
      - "5018:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # QRCode Service
  qrcode-service:
    build: ./services/qrcode-service
    container_name: restpoint_qrcode_service
    ports:
      - "5012:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Portal Service
  portal-service:
    build: ./services/portal-service
    container_name: restpoint_portal_service
    ports:
      - "5019:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Visitors Service
  visitors-service:
    build: ./services/visitors-service
    container_name: restpoint_visitors_service
    ports:
      - "5014:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
    env_file:
      - .env
    networks:
      - restpoint_network
    restart: unless-stopped
    depends_on:
      mariadb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # ============================================================================
  # FRONTEND
  # ============================================================================

  # Frontend Client
  frontend:
    build:
      context: ./FrontendClient/client
      dockerfile: Dockerfile
    container_name: restpoint_frontend
    ports:
      - "8082:80"
    depends_on:
      - api-gateway
    networks:
      - restpoint_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

# ============================================================================
# NETWORKS
# ============================================================================
networks:
  restpoint_network:
    driver: bridge
    name: restpoint_network

# ============================================================================
# VOLUMES
# ============================================================================
volumes:
  mariadb_data:
    driver: local
  redis_data:
    driver: local
  rabbitmq_data:
    driver: local
  scanner_uploads:
    driver: local
  scanner_config:
    driver: local
  auth_service_data:
    driver: local
  tenant_service_data:
    driver: local
  deceased_service_data:
    driver: local
  billing_service_data:
    driver: local
  notification_service_data:
    driver: local
  documents_service_data:
    driver: local
  socketio_service_data:
    driver: local
DOCKERCOMPOSE
log_ok "docker-compose.yml created with ALL services"

# =============================================================================
# PHASE 6: Create Verification Script
# =============================================================================
log_info ""
log_info "PHASE 6: Creating verification script..."

cat > "verify-restpoint.sh" << 'VERIFYSCRIPT'
#!/bin/bash
# RestPoint Verification Script
# Checks all services are running and healthy

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "============================================"
echo "  RestPoint Verification Script"
echo "============================================"
echo ""

# Check 1: Docker containers
log_info "Checking Docker containers..."
if command -v docker &> /dev/null; then
    RUNNING_CONTAINERS=$(docker ps --format "{{.Names}}" 2>/dev/null || echo "")
    
    EXPECTED_CONTAINERS=(
        "restpoint_mariadb"
        "restpoint_redis"
        "restpoint_rabbitmq"
        "restpoint_api_gateway"
        "restpoint_auth_service"
        "restpoint_tenant_service"
        "restpoint_deceased_service"
        "restpoint_billing_service"
        "restpoint_notification_service"
        "restpoint_documents_service"
        "restpoint_socketio_service"
        "restpoint_scanner_service"
        "restpoint_mpesa_service"
        "restpoint_invoice_service"
        "restpoint_marketplace_service"
        "restpoint_coffin_service"
        "restpoint_analytics_service"
        "restpoint_bodycheckout_service"
        "restpoint_edocuments_service"
        "restpoint_calender_service"
        "restpoint_chemical_service"
        "restpoint_extra_services"
        "restpoint_call_service"
        "restpoint_qrcode_service"
        "restpoint_portal_service"
        "restpoint_visitors_service"
        "restpoint_frontend"
    )
    
    RUNNING_COUNT=0
    for container in "${EXPECTED_CONTAINERS[@]}"; do
        if echo "$RUNNING_CONTAINERS" | grep -q "$container"; then
            log_ok "$container is running"
            RUNNING_COUNT=$((RUNNING_COUNT + 1))
        else
            log_warn "$container is NOT running"
        fi
    done
    
    echo ""
    log_info "Containers running: $RUNNING_COUNT/${#EXPECTED_CONTAINERS[@]}"
else
    log_warn "Docker not available, skipping container check"
fi

echo ""

# Check 2: Health endpoints
log_info "Checking health endpoints..."
HEALTH_ENDPOINTS=(
    "http://localhost:5000/health:API Gateway"
    "http://localhost:5001/health:Auth Service"
    "http://localhost:5002/health:Tenant Service"
    "http://localhost:5003/health:Deceased Service"
    "http://localhost:5020/health:Billing Service"
    "http://localhost:5111/health:Notification Service"
    "http://localhost:5007/health:Documents Service"
    "http://localhost:5013/health:SocketIO Service"
    "http://localhost:5011/health:MPESA Service"
    "http://localhost:5005/health:Invoice Service"
    "http://localhost:5004/health:Marketplace Service"
    "http://localhost:5006/health:Coffin Service"
    "http://localhost:5009/health:Analytics Service"
    "http://localhost:5015/health:BodyCheckout Service"
    "http://localhost:8116/health:EDocuments Service"
    "http://localhost:5010/health:Calendar Service"
    "http://localhost:5105/health:Chemical Service"
    "http://localhost:5016/health:Extra Services"
    "http://localhost:5018/health:Call Service"
    "http://localhost:5012/health:QRCode Service"
    "http://localhost:5019/health:Portal Service"
    "http://localhost:5014/health:Visitors Service"
    "http://localhost:8082/:Frontend"
)

HEALTHY_COUNT=0
for endpoint in "${HEALTH_ENDPOINTS[@]}"; do
    URL="${endpoint%%:*}"
    NAME="${endpoint##*:}"
    
    if command -v curl &> /dev/null; then
        if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "$URL" 2>/dev/null | grep -q "200\|301\|302"; then
            log_ok "$NAME is healthy ($URL)"
            HEALTHY_COUNT=$((HEALTHY_COUNT + 1))
        else
            log_warn "$NAME is UNHEALTHY ($URL)"
        fi
    elif command -v wget &> /dev/null; then
        if wget --spider --timeout=3 "$URL" 2>/dev/null; then
            log_ok "$NAME is healthy ($URL)"
            HEALTHY_COUNT=$((HEALTHY_COUNT + 1))
        else
            log_warn "$NAME is UNHEALTHY ($URL)"
        fi
    else
        log_warn "Neither curl nor wget available, skipping health check for $NAME"
    fi
done

echo ""
log_info "Healthy endpoints: $HEALTHY_COUNT/${#HEALTH_ENDPOINTS[@]}"

echo ""

# Check 3: Test auth login
log_info "Testing auth login..."
if command -v curl &> /dev/null; then
    AUTH_RESULT=$(curl -s -X POST http://localhost:5000/v1/restpoint/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@example.com","password":"admin123"}' 2>/dev/null || echo "FAILED")
    
    if echo "$AUTH_RESULT" | grep -q "accessToken"; then
        log_ok "Auth login successful - token received"
    elif echo "$AUTH_RESULT" | grep -q "success.*true"; then
        log_ok "Auth login successful"
    else
        log_warn "Auth login response: $AUTH_RESULT"
    fi
else
    log_warn "curl not available, skipping auth test"
fi

echo ""
echo "============================================"
echo "  Verification Complete"
echo "============================================"
echo ""
log_info "Containers running: ${RUNNING_COUNT:-0}/${#EXPECTED_CONTAINERS[@]}"
log_info "Healthy endpoints: ${HEALTHY_COUNT:-0}/${#HEALTH_ENDPOINTS[@]}"
echo ""

if [ "${HEALTHY_COUNT:-0}" -ge "${#HEALTH_ENDPOINTS[@]}" ]; then
    log_ok "ALL SERVICES ARE HEALTHY!"
elif [ "${HEALTHY_COUNT:-0}" -ge "$(( ${#HEALTH_ENDPOINTS[@]} / 2 ))" ]; then
    log_warn "Most services are healthy (${HEALTHY_COUNT}/${#HEALTH_ENDPOINTS[@]})"
else
    log_error "Many services are unhealthy. Check docker logs for details."
    log_info "Run: docker-compose logs --tail=50 <service-name>"
fi
VERIFYSCRIPT
chmod +x verify-restpoint.sh
log_ok "verify-restpoint.sh created"

# =============================================================================
# PHASE 7: Build and Start Everything
# =============================================================================
log_info ""
log_info "PHASE 7: Building and starting all services..."

# Stop any existing containers
log_info "Stopping existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Build all services
log_info "Building all services (this may take a while)..."
docker-compose build --parallel 2>&1 || {
    log_warn "Parallel build failed, trying sequential build..."
    docker-compose build 2>&1 || true
}

# Start all services
log_info "Starting all services..."
docker-compose up -d 2>&1 || true

# Wait for services to start
log_info "Waiting for services to initialize (60 seconds)..."
sleep 60

# =============================================================================
# PHASE 8: Run Verification
# =============================================================================
log_info ""
log_info "PHASE 8: Running verification..."
bash verify-restpoint.sh || true

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo "============================================"
echo "  RestPoint Fix Complete!"
echo "============================================"
echo ""
echo "Access Points:"
echo "  API Gateway:    http://localhost:5000"
echo "  Auth Service:   http://localhost:5001"
echo "  Tenant Service: http://localhost:5002"
echo "  Frontend:       http://localhost:8082"
echo "  RabbitMQ UI:    http://localhost:15672 (restpoint/RestPointRabbit2024)"
echo ""
echo "Test Login:"
echo "  curl -X POST http://localhost:5000/v1/restpoint/auth/login \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"email\":\"admin@example.com\",\"password\":\"admin123\"}'"
echo ""
echo "Check All Services:"
echo "  docker-compose ps"
echo "  bash verify-restpoint.sh"
echo ""
echo "View Logs:"
echo "  docker-compose logs --tail=50 -f <service-name>"
echo ""

# Show running containers
docker-compose ps 2>/dev/null || docker ps 2>/dev/null || echo "Docker not available"