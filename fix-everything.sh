#!/bin/bash
# ============================================
# RestPoint FIX EVERYTHING — One script to fix ALL Docker issues
# Based on working SIASA-HUB architecture pattern
# Run: ./fix-everything.sh
# Should complete in < 3 minutes
# ============================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         RESTPOINT — FIX EVERYTHING (Docker Edition)        ║"
echo "║         Based on SIASA-HUB proven architecture              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

START_TIME=$(date +%s)

# ─── Step 1: Fix tenant-service duplicate exports ────────────────────────────
echo -e "${YELLOW}[1/8]${NC} Fixing tenant-service duplicate exports..."
if grep -q "export { getMainTenantMigrations, getBranchMigrations };" services/tenant-service/services/all-service-migrations.ts 2>/dev/null; then
    sed -i '/^export { getMainTenantMigrations, getBranchMigrations };$/d' services/tenant-service/services/all-service-migrations.ts
    echo -e "  ${GREEN}✓${NC} Removed duplicate exports from all-service-migrations.ts"
else
    echo -e "  ${GREEN}✓${NC} No duplicate exports found (already fixed)"
fi

# ─── Step 2: Enable Docker BuildKit ──────────────────────────────────────────
echo -e "${YELLOW}[2/8]${NC} Enabling Docker BuildKit for fast parallel builds..."
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
echo -e "  ${GREEN}✓${NC} DOCKER_BUILDKIT=1, COMPOSE_DOCKER_CLI_BUILD=1"

# ─── Step 3: Clean up Docker environment ──────────────────────────────────────
echo -e "${YELLOW}[3/8]${NC} Cleaning up Docker environment..."
echo -e "  Stopping all running containers..."
docker compose down --remove-orphans 2>/dev/null || true

# Kill any leftover containers from the restpoint project
docker ps -q --filter "name=restpoint_" | xargs -r docker rm -f 2>/dev/null || true

# Remove old images to force fresh build with new Dockerfiles
echo -e "  Removing old images to force fresh builds..."
docker images -q --filter "reference=restpoint_*" | xargs -r docker rmi -f 2>/dev/null || true

# Prune build cache
docker builder prune -f 2>/dev/null || true
echo -e "  ${GREEN}✓${NC} Docker environment cleaned"

# ─── Step 4: Ensure .dockerignore files exist ─────────────────────────────────
echo -e "${YELLOW}[4/8]${NC} Ensuring .dockerignore files exist..."

if [ ! -f ".dockerignore" ]; then
    cat > .dockerignore << 'DOCKERIGNORE'
# Git
.git/
.gitignore
.gitattributes
.gitmodules

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.yarn/
.pnpm/

# Build artifacts
dist/
build/
*.tsbuildinfo
**/dist/**
**/build/**

# Environment files
.env
.env.*
!.env.example
!.env.production

# IDE
.idea/
.vscode/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# Docker
.dockerignore
docker-compose*.yml
Dockerfile*
**/Dockerfile*

# Logs
logs/
*.log

# Test
coverage/
.nyc_output/
__tests__/
__mocks__/
**/*.test.*
**/*.spec.*

# Documentation
docs/
*.md
!README.md
DOCKERIGNORE
    echo -e "  ${GREEN}✓${NC} Created root .dockerignore"
else
    echo -e "  ${GREEN}✓${NC} Root .dockerignore exists"
fi

if [ ! -f "FrontendClient/client/.dockerignore" ]; then
    cat > FrontendClient/client/.dockerignore << 'FE_DOCKERIGNORE'
node_modules/
npm-debug.log*
dist/
build/
.env
.env.*
!.env.example
.git/
.gitignore
*.md
.DS_Store
Thumbs.db
.dockerignore
Dockerfile
FE_DOCKERIGNORE
    echo -e "  ${GREEN}✓${NC} Created frontend .dockerignore"
else
    echo -e "  ${GREEN}✓${NC} Frontend .dockerignore exists"
fi

# ─── Step 5: Build all services with BuildKit ─────────────────────────────────
echo -e "${YELLOW}[5/8]${NC} Building all services with BuildKit (parallel)..."
echo -e "  ${CYAN}This will use cached layers for fast rebuilds${NC}"

# Build infrastructure first (no dependencies on our code)
echo -e "  Pulling infrastructure images..."
docker pull mariadb:10.11 &
docker pull redis:7-alpine &
docker pull rabbitmq:3-management-alpine &
docker pull nginx:alpine &
wait
echo -e "  ${GREEN}✓${NC} Infrastructure images ready"

# Build services in parallel (they share the same base image)
echo -e "  Building application services..."
docker compose build --parallel 2>&1 | tail -20 || true
echo -e "  ${GREEN}✓${NC} Build complete"

# ─── Step 6: Start all services ──────────────────────────────────────────────
echo -e "${YELLOW}[6/8]${NC} Starting all services..."
docker compose up -d --remove-orphans 2>&1 || true
echo -e "  ${GREEN}✓${NC} Services started"

# ─── Step 7: Wait for health checks ──────────────────────────────────────────
echo -e "${YELLOW}[7/8]${NC} Waiting for services to become healthy..."
echo -e "  (This may take 30-60 seconds for database initialization)"

# Wait for infrastructure first
echo -e "  Waiting for MariaDB..."
for i in $(seq 1 30); do
    if docker compose exec -T mariadb mariadb-admin ping --silent 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} MariaDB is ready"
        break
    fi
    sleep 2
done

echo -e "  Waiting for Redis..."
for i in $(seq 1 15); do
    if docker compose exec -T redis redis-cli -a "${REDIS_PASSWORD:-RestPointRedis2024}" ping 2>/dev/null | grep -q PONG; then
        echo -e "  ${GREEN}✓${NC} Redis is ready"
        break
    fi
    sleep 2
done

echo -e "  Waiting for RabbitMQ..."
for i in $(seq 1 15); do
    if docker compose exec -T rabbitmq rabbitmq-diagnostics -q ping 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} RabbitMQ is ready"
        break
    fi
    sleep 2
done

# Wait for application services
echo -e "  Waiting for API Gateway..."
for i in $(seq 1 20); do
    if curl -sf http://localhost:5000/health > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} API Gateway is healthy"
        break
    fi
    sleep 3
done

echo -e "  Waiting for Auth Service..."
for i in $(seq 1 20); do
    if curl -sf http://localhost:5001/health > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} Auth Service is healthy"
        break
    fi
    sleep 3
done

echo -e "  Waiting for Tenant Service..."
for i in $(seq 1 20); do
    if curl -sf http://localhost:5002/health > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} Tenant Service is healthy"
        break
    fi
    sleep 3
done

echo -e "  Waiting for Frontend..."
for i in $(seq 1 15); do
    if curl -sf http://localhost:8082/ > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} Frontend is serving"
        break
    fi
    sleep 3
done

# ─── Step 8: Verify everything ────────────────────────────────────────────────
echo -e "${YELLOW}[8/8]${NC} Verifying all services..."
echo ""

# Show docker ps
echo -e "${BOLD}Docker Container Status:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -30
echo ""

# Check health endpoints
echo -e "${BOLD}Health Check Results:${NC}"
for service in "localhost:5000/health" "localhost:5001/health" "localhost:5002/health" "localhost:8082/"; do
    if curl -sf "http://$service" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} http://$service"
    else
        echo -e "  ${RED}✗${NC} http://$service"
    fi
done

# Check for unhealthy containers
UNHEALTHY=$(docker ps --filter "health=unhealthy" --format "{{.Names}}" 2>/dev/null || true)
if [ -n "$UNHEALTHY" ]; then
    echo ""
    echo -e "${RED}⚠ UNHEALTHY CONTAINERS:${NC}"
    echo "$UNHEALTHY" | while read -r name; do
        echo -e "  ${RED}✗${NC} $name"
    done
    echo ""
    echo -e "${YELLOW}Tip: Check logs with: docker logs <container_name>${NC}"
else
    echo ""
    echo -e "${GREEN}${BOLD}✓ All containers are healthy!${NC}"
fi

# ─── Summary ──────────────────────────────────────────────────────────────────
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════╗"
echo "║                    FIX COMPLETE!                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "  Duration: ${BOLD}${MINUTES}m ${SECONDS}s${NC}"
echo -e "  Frontend: ${BOLD}http://localhost:8082${NC}"
echo -e "  API:      ${BOLD}http://localhost:5000${NC}"
echo ""
echo -e "${YELLOW}Quick commands:${NC}"
echo -e "  docker compose logs -f --tail=50    # Watch all logs"
echo -e "  docker compose ps                    # Check all services"
echo -e "  docker compose down                  # Stop everything"
echo ""
echo -e "${GREEN}${BOLD}RestPoint is now running!${NC}"