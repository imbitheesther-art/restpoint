#!/bin/sh
# ============================================
# docker-startup.sh
# Universal startup script for all REST Point Docker containers
# Ensures shared dependencies are available before starting the service
# ============================================

set -e

echo "🚀 [Startup] Initializing service..."

# Ensure required global dependencies are available
echo "📦 [Startup] Checking shared dependencies..."

# Install critical shared dependencies if not already present
for dep in "mysql2" "jsonwebtoken" "dotenv"; do
  if ! node -e "require('$dep')" 2>/dev/null; then
    echo "   Installing missing dependency: $dep"
    npm install --no-save "$dep" 2>/dev/null || true
  fi
done

# Ensure shared modules directory exists
if [ -d "/usr/src/app/shared" ]; then
  echo "✅ [Startup] Shared modules found at /usr/src/app/shared"
  # Install dependencies for shared modules if they have a package.json
  if [ -f "/usr/src/app/shared/package.json" ]; then
    cd /usr/src/app/shared && npm install --no-save --production 2>/dev/null || true
    cd /usr/src/app
  fi
fi

# Ensure global modules directory exists
if [ -d "/usr/src/app/global" ]; then
  echo "✅ [Startup] Global modules found at /usr/src/app/global"
fi

echo "✅ [Startup] Ready to start service"
echo ""

# Execute the CMD from Dockerfile
exec "$@"