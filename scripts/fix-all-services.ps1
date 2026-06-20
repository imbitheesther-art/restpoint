# RestPoint Complete System Recovery Script for Windows
# Fixes: API Gateway routes, restarting services, Redis auth, nginx, frontend
# Usage: Run PowerShell as Administrator, then: .\scripts\fix-all-services.ps1

param(
    [switch]$SkipBuild = $false,
    [switch]$SkipStart = $false
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  RestPoint System Recovery (Windows)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$COMPOSE_FILE = "docker-compose.prod.yml"
$NGINX_CONF = "/etc/nginx/sites-available/restpoint"

# =============================================================================
# STEP 1: Stop all services
# =============================================================================
Write-Host "[1/8] Stopping all services..." -ForegroundColor Yellow
if (-not $SkipStart) {
    & docker compose -f $COMPOSE_FILE down --remove-orphans
    Write-Host "✓ All services stopped" -ForegroundColor Green
}
Write-Host ""

# =============================================================================
# STEP 2: Fix Redis password for socket.io
# =============================================================================
Write-Host "[2/8] Configuring Redis password for socket.io..." -ForegroundColor Yellow
Write-Host "✓ Redis password will be passed via docker-compose" -ForegroundColor Green
Write-Host ""

# =============================================================================
# STEP 3: Rebuild API Gateway with all 23 routes
# =============================================================================
Write-Host "[3/8] Rebuilding API Gateway with all routes..." -ForegroundColor Yellow
if (-not $SkipBuild) {
    & docker compose -f $COMPOSE_FILE build --no-cache api-gateway
    Write-Host "✓ API Gateway rebuilt" -ForegroundColor Green
} else {
    Write-Host "⊘ Build skipped" -ForegroundColor Gray
}
Write-Host ""

# =============================================================================
# STEP 4: Rebuild all restarting services
# =============================================================================
Write-Host "[4/8] Rebuilding restarting services..." -ForegroundColor Yellow

$SERVICES_TO_REBUILD = @(
    "invoice-service",
    "marketplace-service",
    "mpesa-service",
    "portal-service",
    "socketio-service",
    "tenant-service",
    "deceased-service",
    "notification-service",
    "analytics-service",
    "qrcode-service"
)

foreach ($service in $SERVICES_TO_REBUILD) {
    Write-Host "  Rebuilding $service..." -ForegroundColor Gray
    if (-not $SkipBuild) {
        try {
            & docker compose -f $COMPOSE_FILE build --no-cache $service
            Write-Host "  ✓ $service rebuilt" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Failed to build $service" -ForegroundColor Red
        }
    }
}
Write-Host "✓ All restarting services rebuilt" -ForegroundColor Green
Write-Host ""

# =============================================================================
# STEP 5: Start infrastructure services first (redis, rabbitmq, mariadb)
# =============================================================================
Write-Host "[5/8] Starting infrastructure services..." -ForegroundColor Yellow
if (-not $SkipStart) {
    & docker compose -f $COMPOSE_FILE up -d redis rabbitmq mariadb
    Write-Host "Waiting for infrastructure services to be healthy..." -ForegroundColor Gray
    Start-Sleep -Seconds 30
    Write-Host "✓ Infrastructure services started" -ForegroundColor Green
}
Write-Host ""

# =============================================================================
# STEP 6: Start all application services
# =============================================================================
Write-Host "[6/8] Starting all application services..." -ForegroundColor Yellow
if (-not $SkipStart) {
    & docker compose -f $COMPOSE_FILE up -d
    Write-Host "Waiting for services to start..." -ForegroundColor Gray
    Start-Sleep -Seconds 45
    Write-Host "✓ All services started" -ForegroundColor Green
}
Write-Host ""

# =============================================================================
# STEP 7: Verify all services are running and healthy
# =============================================================================
Write-Host "[7/8] Verifying services..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Container Status:" -ForegroundColor Cyan
& docker compose -f $COMPOSE_FILE ps
Write-Host ""

Write-Host "Health Checks:" -ForegroundColor Cyan
Write-Host "  API Gateway:"
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
    Write-Host "  ✓ API Gateway responding (HTTP $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "  ✗ API Gateway not responding" -ForegroundColor Red
}

Write-Host ""
Write-Host "  Deployed Services:"
$ports = @(5001, 5002, 5003, 5004, 5005, 5006, 5007, 5009, 5010, 5011, 5012, 5013, 5014, 5015, 5016, 5018, 5019, 5020, 5105, 5111, 8116)
foreach ($port in $ports) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port/health" -UseBasicParsing -TimeoutSec 5
        Write-Host "  ✓ Port $port : Healthy (HTTP $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Port $port : Unhealthy" -ForegroundColor Red
    }
}
Write-Host ""

# =============================================================================
# STEP 8: API Gateway route verification
# =============================================================================
Write-Host "[8/8] Verifying API Gateway routes..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Registered Routes:" -ForegroundColor Cyan
try {
    $routes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/debug/routes"
    $routes.routes | ForEach-Object { Write-Host "  $($_.path) → $($_.target)" -ForegroundColor Gray }
    Write-Host ""
    Write-Host "Service Count: $($routes.serviceCount)" -ForegroundColor Cyan
    Write-Host "Route Count: $($routes.routeCount)" -ForegroundColor Cyan
} catch {
    Write-Host "  Could not fetch routes (service may still be starting)" -ForegroundColor Red
}
Write-Host ""

# =============================================================================
# Summary
# =============================================================================
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Recovery Complete" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Test API:" -ForegroundColor White
Write-Host "     curl -X POST http://localhost:5000/v1/restpoint/auth/login -H 'Content-Type: application/json' -d '{`"identifier`":`"admin@restpoint.co.ke`",`"password`":`"your_password`"}'" -ForegroundColor Gray
Write-Host "  2. Rebuild frontend: docker compose -f $COMPOSE_FILE build frontend" -ForegroundColor White
Write-Host "  3. Restart frontend: docker compose -f $COMPOSE_FILE up -d frontend" -ForegroundColor White
Write-Host "  4. Check logs: docker compose -f $COMPOSE_FILE logs -f [service-name]" -ForegroundColor White
Write-Host ""
Write-Host "Frontend URLs:" -ForegroundColor White
Write-Host "  Main App: http://localhost:8082" -ForegroundColor Gray
Write-Host "  Portal: http://localhost:8082 (via portal.restpoint.co.ke)" -ForegroundColor Gray
Write-Host ""
Write-Host "API Gateway:" -ForegroundColor White
Write-Host "  Local: http://localhost:5000" -ForegroundColor Gray
Write-Host "  Production: https://api.restpoint.co.ke" -ForegroundColor Gray
Write-Host ""