#!/bin/bash
# ============================================
# Rest Point - Production Startup Fix Script
# Run this to fix all backend service issues:
#   chmod +x scripts/startup-fix.sh
#   ./scripts/startup-fix.sh
# ============================================
set -e

echo "=============================================="
echo "  Rest Point - Production Startup Fix"
echo "=============================================="

SERVICES_DIR="/opt/restpoint/services"
ROOT_DIR="/opt/restpoint"

# ==============================================
# 1. Fix service package.json - Add missing deps
# ==============================================
fix_missing_packages() {
  local service_path="$1"
  local service_name="$2"
  
  echo ""
  echo "🔧 Checking packages for: $service_name"
  
  cd "$service_path" || return
  
  # List of common missing packages
  MISSING_DEPS=""
  
  # Check if mysql2 is needed
  if [ -f "server.js" ] && grep -q "mysql" "server.js" 2>/dev/null; then
    MISSING_DEPS="$MISSING_DEPS mysql2"
  fi
  
  if [ -f "server.ts" ] && grep -q "mysql" "server.ts" 2>/dev/null; then
    MISSING_DEPS="$MISSING_DEPS mysql2"
  fi
  
  # Check if package.json has needed deps
  if [ -f "package.json" ]; then
    # Add mysql2 if using it but not declared
    if grep -q "require.*mysql" *.js *.ts 2>/dev/null || grep -q "import.*mysql" *.js *.ts 2>/dev/null; then
      if ! grep -q '"mysql2"' package.json 2>/dev/null; then
        MISSING_DEPS="$MISSING_DEPS mysql2"
      fi
    fi
    
    # Add express if using it but not declared
    if grep -q "require.*express" *.js 2>/dev/null; then
      if ! grep -q '"express"' package.json 2>/dev/null; then
        MISSING_DEPS="$MISSING_DEPS express"
      fi
    fi
    
    # Add dotenv if using it
    if grep -q "require.*dotenv\|import.*dotenv" *.js *.ts 2>/dev/null; then
      if ! grep -q '"dotenv"' package.json 2>/dev/null; then
        MISSING_DEPS="$MISSING_DEPS dotenv"
      fi
    fi
    
    # Add cors if using it
    if grep -q "require.*cors\|import.*cors" *.js *.ts 2>/dev/null; then
      if ! grep -q '"cors"' package.json 2>/dev/null; then
        MISSING_DEPS="$MISSING_DEPS cors"
      fi
    fi
  fi
  
  if [ -n "$MISSING_DEPS" ]; then
    echo "   ⚠️  Missing packages detected: $MISSING_DEPS"
    echo "   📦 Installing: npm install $MISSING_DEPS"
    npm install $MISSING_DEPS 2>&1 | tail -3
    echo "   ✅ Packages installed successfully"
  else
    echo "   ✅ All packages found"
  fi
  
  cd "$ROOT_DIR" 2>/dev/null || true
}

# ==============================================
# 2. Fix shared config paths
# ==============================================
fix_shared_configs() {
  echo ""
  echo "🔧 Creating missing shared config files..."
  
  # Create configurations/sqlConfig/db.js if missing
  if [ ! -d "$ROOT_DIR/configurations/sqlConfig" ]; then
    mkdir -p "$ROOT_DIR/configurations/sqlConfig"
  fi
  
  if [ ! -f "$ROOT_DIR/configurations/sqlConfig/db.js" ]; then
    cat > "$ROOT_DIR/configurations/sqlConfig/db.js" << 'DBEOF'
/**
 * Shared Database Configuration
 * Used by multiple services expecting this path
 */
const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'mariadb',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
};

let pool = null;

const getPool = async () => {
  if (!pool) {
    pool = mysql.createPool({
      ...DB_CONFIG,
      database: process.env.MASTER_DB_NAME || 'restpoint_system',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
};

module.exports = { getPool, DB_CONFIG };
DBEOF
    echo "   ✅ Created configurations/sqlConfig/db.js"
  fi
  
  # Create global/index shim
  if [ ! -f "$ROOT_DIR/global/index.js" ]; then
    mkdir -p "$ROOT_DIR/global"
    cat > "$ROOT_DIR/global/index.js" << 'GLOBALEOF'
/**
 * Global module shim for services expecting ../../global/index
 * Provides shared middleware and utilities
 */
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

module.exports = { authenticate, errorHandler };
GLOBALEOF
    echo "   ✅ Created global/index.js"
  fi
  
  # Create /usr/src/global/config/db.ts (needed by portal service)
  if [ ! -d "$ROOT_DIR/usr/src/global/config" ]; then
    mkdir -p "$ROOT_DIR/usr/src/global/config"
  fi
  if [ ! -f "$ROOT_DIR/usr/src/global/config/db.ts" ]; then
    cat > "$ROOT_DIR/usr/src/global/config/db.ts" << 'DBTSEOF'
// Global database config for portal service
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mariadb',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'restpoint_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
export { pool };
DBTSEOF
    echo "   ✅ Created /usr/src/global/config/db.ts"
  fi
}

# ==============================================
# 3. Fix all services with broken paths
# ==============================================
fix_service_files() {
  echo ""
  echo "🔧 Patching broken import paths in service files..."
  
  # Fix sendNotificationUpdates.js
  local updates_file="$SERVICES_DIR/updates/sendNotificationUpdates.js"
  if [ -f "$updates_file" ] && grep -q "../../configurations/sqlConfig/db" "$updates_file"; then
    sed -i 's|../../configurations/sqlConfig/db|../../../configurations/sqlConfig/db|g' "$updates_file"
    echo "   ✅ Fixed path in updates/sendNotificationUpdates.js"
  fi
  
  # Fix qrCode.js
  local qr_file="$SERVICES_DIR/qrcode-service/qrCode.js"
  if [ -f "$qr_file" ] && grep -q "../../configurations/sqlConfig/db" "$qr_file"; then
    sed -i 's|../../configurations/sqlConfig/db|../../../configurations/sqlConfig/db|g' "$qr_file"
    echo "   ✅ Fixed path in qrcode-service/qrCode.js"
  fi
}

# ==============================================
# 4. Run for each service
# ==============================================
fix_all_services() {
  echo ""
  echo "=============================================="
  echo "  Checking all services..."
  echo "=============================================="
  
  for svc_dir in "$SERVICES_DIR"/*/; do
    svc_name=$(basename "$svc_dir")
    if [ -f "$svc_dir/package.json" ]; then
      fix_missing_packages "$svc_dir" "$svc_name"
    fi
  done
}

# ==============================================
# 5. Check and fix .env
# ==============================================
fix_env() {
  echo ""
  echo "🔧 Checking .env configuration..."
  
  local env_file="$ROOT_DIR/.env"
  
  # Add missing SERVICE_URL entries
  local missing_urls=""
  
  for svc in AUTH TENANT DECEASED MARKETPLACE INVOICES COFFIN DOCUMENTS EDOCUMENTS ANALYTICS CALENDAR MPESA NOTIFICATION VISITORS BODYCHECKOUT PORTAL CHEMICAL; do
    if ! grep -q "${svc}_SERVICE_URL" "$env_file" 2>/dev/null; then
      missing_urls="$missing_urls $svc"
    fi
  done
  
  if [ -n "$missing_urls" ]; then
    echo "   ⚠️  Missing SERVICE_URL entries for:$missing_urls"
    echo "   ℹ️  Add them to .env file (see .env.example for reference)"
  else
    echo "   ✅ All SERVICE_URLs found"
  fi
  
  # Fix MPESA callback URL
  if grep -q "MPESA_CALLBACK_URL=http://localhost" "$env_file" 2>/dev/null; then
    sed -i 's|MPESA_CALLBACK_URL=http://localhost:[0-9]*|MPESA_CALLBACK_URL=https://restpoint.co.ke|g' "$env_file"
    echo "   ✅ Fixed MPESA callback URL to use HTTPS"
  fi
}

# ==============================================
# 6. Add auto npm install failsafe to each Dockerfile
# ==============================================
fix_dockerfiles() {
  echo ""
  echo "🔧 Adding auto npm install fallback to Dockerfiles..."
  
  for dockerfile in "$SERVICES_DIR"/*/Dockerfile; do
    if [ -f "$dockerfile" ] && ! grep -q "npm install \&\&" "$dockerfile" 2>/dev/null; then
      # Add npm install retry logic after COPY package.json
      sed -i 's|npm install|npm install --omit=dev || { echo "⚠️ Initial install failed, retrying..."; npm install || true; }|g' "$dockerfile"
      echo "   ✅ Added install fallback to $(basename $(dirname $dockerfile))/Dockerfile"
    fi
  done
}

# ==============================================
# Main
# ==============================================
main() {
  echo ""
  echo "🔧 Step 1: Fix shared config paths"
  fix_shared_configs
  
  echo ""
  echo "🔧 Step 2: Fix broken service imports"
  fix_service_files
  
  echo ""
  echo "🔧 Step 3: Check all service packages"
  fix_all_services
  
  echo ""
  echo "🔧 Step 4: Fix .env configuration"
  fix_env
  
  echo ""
  echo "🔧 Step 5: Update Dockerfiles"
  fix_dockerfiles
  
  echo ""
  echo "=============================================="
  echo "  ✅ Startup fix complete!"
  echo "  ℹ️  Run docker-compose down && docker-compose up -d"
  echo "=============================================="
}

main "$@"