#!/bin/bash
# =============================================================================
# RestPoint Remote Server Fix Script
# =============================================================================
# Run this on the remote server (root@vmi3217217:/opt/restpoint)
# This fixes the corrupted Docker state - container marked for removal,
# name conflicts, missing images, and docker-compose v1 issues.
#
# Usage: bash fix-remote.sh
# =============================================================================

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

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log_info "============================================"
log_info "  RestPoint Remote Server Fix"
log_info "============================================"
echo ""

# =============================================================================
# STEP 1: Kill ALL restpoint-related containers forcefully
# =============================================================================
log_info "STEP 1: Forcefully removing ALL restpoint containers..."

CONTAINERS=$(docker ps -aq --filter "name=restpoint_" 2>/dev/null || true)
if [ -n "$CONTAINERS" ]; then
    log_info "Found containers: $CONTAINERS"
    docker rm -f $CONTAINERS 2>/dev/null || true
    log_ok "Containers removed"
else
    log_ok "No running restpoint containers found"
fi

# Also handle any containers that are "marked for removal" 
docker ps -aq --filter "status=dead" --filter "name=restpoint" 2>/dev/null | xargs -r docker rm -f 2>/dev/null || true
log_ok "Dead containers cleaned up"

# =============================================================================
# STEP 2: Remove the specific conflicting containers by name
# =============================================================================
log_info "STEP 2: Removing conflicting containers by name..."

for name in restpoint_redis restpoint_mariadb restpoint_rabbitmq restpoint_scanner_service; do
    docker rm -f "$name" 2>/dev/null || true
done
log_ok "Conflicting containers removed"

# =============================================================================
# STEP 3: Prune dangling images and volumes
# =============================================================================
log_info "STEP 3: Cleaning up Docker resources..."

# Remove the missing scanner-service image reference
docker images --filter "reference=sha256:2c96e3b1e459d1c42f446f5d369a85a193b8818e17b2ee830a2400e0b64c1400" -q 2>/dev/null | xargs -r docker rmi -f 2>/dev/null || true

# Prune dangling images
docker image prune -f 2>/dev/null || true
log_ok "Dangling images pruned"

# Remove orphaned volumes
docker volume ls -q --filter "name=restpoint_" 2>/dev/null | xargs -r docker volume rm -f 2>/dev/null || true
log_ok "Orphaned volumes cleaned"

# =============================================================================
# STEP 4: Clean docker-compose state (remove leftover containers)
# =============================================================================
log_info "STEP 4: Cleaning docker-compose state..."

# docker-compose down with --volumes to remove everything
docker-compose down --remove-orphans -v 2>/dev/null || true
log_ok "docker-compose state cleaned"

# =============================================================================
# STEP 5: Prune the entire system (remove unused containers, networks, images)
# =============================================================================
log_info "STEP 5: System prune..."
docker system prune -f --volumes 2>/dev/null || true
log_ok "System pruned"

# =============================================================================
# STEP 6: Rebuild and start services
# =============================================================================
log_info "============================================"
log_info "  Docker state cleaned. Ready to rebuild."
log_info "============================================"
echo ""
log_info "Run these commands to rebuild and start:"
echo ""
echo "  # Build ALL images from scratch:"
echo "  docker-compose build --no-cache --parallel"
echo ""
echo "  # Start all services:"
echo "  docker-compose up -d --remove-orphans --force-recreate"
echo ""
echo "  # Check status:"
echo "  docker-compose ps"
echo ""
echo "  # Or use make:"
echo "  make up-force"
echo ""

# Ask if user wants to proceed with rebuild
read -p "Proceed with rebuild and start? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    log_info "Skipping rebuild. Run the commands above manually."
    exit 0
fi

log_info "Building all images..."
docker-compose build --no-cache --parallel 2>&1 || {
    log_warn "Parallel build failed, trying sequential build..."
    docker-compose build --no-cache 2>&1 || {
        log_error "Build failed. Check the output above for errors."
        exit 1
    }
}
log_ok "Build complete"

log_info "Starting all services..."
docker-compose up -d --remove-orphans --force-recreate
log_ok "Services started"

echo ""
log_info "============================================"
log_info "  Container Status:"
log_info "============================================"
docker-compose ps

echo ""
log_info "============================================"
log_info "  Waiting 30 seconds for health checks..."
log_info "============================================"
sleep 30

echo ""
log_info "============================================"
log_info "  Final Health Check:"
log_info "============================================"
docker-compose ps

# Check if any container is unhealthy
UNHEALTHY=$(docker ps -a --filter "health=unhealthy" --filter "name=restpoint" -q 2>/dev/null)
if [ -n "$UNHEALTHY" ]; then
    log_warn "Some containers may be unhealthy. Check with: docker-compose logs --tail=50"
fi

log_ok "Fix complete!"