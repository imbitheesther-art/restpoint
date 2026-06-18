#!/bin/bash
# ============================================
# RestPoint Gateway - Route Diagnostic Script
# ============================================
# Usage: bash scripts/diagnose-routes.sh
# Run this on the VPS to debug routing issues
# ============================================

set -e

GATEWAY_CONTAINER="restpoint_gateway"
GATEWAY_PORT=5000
GATEWAY_URL="http://localhost:${GATEWAY_PORT}"

echo "============================================"
echo "  RESTPOINT GATEWAY ROUTE DIAGNOSTIC"
echo "  $(date -R)"
echo "============================================"
echo ""

# ----------------
# 1. CHECK CONTAINER STATUS
# ----------------
echo "[1/8] Checking container status..."
echo "----------------------------------------"
if docker ps --format '{{.Names}} {{.Status}}' | grep -q "${GATEWAY_CONTAINER}"; then
    echo "✅ Gateway container is running"
    docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -E "(NAMES|${GATEWAY_CONTAINER}|restpoint_)"
else
    echo "❌ Gateway container NOT running!"
    docker ps -a --format 'table {{.Names}}\t{{.Status}}' | grep -E "(NAMES|${GATEWAY_CONTAINER}|restpoint_)" 2>/dev/null || echo "(No restpoint containers found)"
fi
echo ""

# ----------------
# 2. SHOW ALL REGISTERED ROUTES
# ----------------
echo "[2/8] Showing all registered gateway routes..."
echo "----------------------------------------"
docker exec ${GATEWAY_CONTAINER} curl -s http://localhost:5000/api/v1/debug/routes 2>/dev/null | python -m json.tool 2>/dev/null || {
    echo "⚠️  /api/v1/debug/routes not available, showing route config from server..."
    docker exec ${GATEWAY_CONTAINER} grep -A 2 "var routes = \[" /app/services/api-gateway/server.js | head -5
}
echo ""

# ----------------
# 3. TEST GATEWAY HEALTH
# ----------------
echo "[3/8] Testing gateway health endpoints..."
echo "----------------------------------------"
echo "→ GET /health"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:5000/health || echo "FAILED"
echo ""
echo "→ GET /api/v1/health"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:5000/api/v1/health || echo "FAILED"
echo ""
echo ""

# ----------------
# 4. TEST EACH SERVICE DIRECTLY
# ----------------
echo "[4/8] Testing direct connectivity to each backend service..."
echo "----------------------------------------"

# Get all service URLs from the gateway environment
SERVICE_URLS=$(docker exec ${GATEWAY_CONTAINER} env | grep -E "_SERVICE_URL=" | sort)
echo "${SERVICE_URLS}" | while read line; do
    SERVICE_NAME=$(echo "$line" | cut -d= -f1 | sed 's/_SERVICE_URL//' | tr '[:upper:]' '[:lower:]')
    SERVICE_URL=$(echo "$line" | cut -d= -f2)
    
    echo -n "→ ${SERVICE_NAME}: ${SERVICE_URL}/health → "
    HTTP_CODE=$(docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "${SERVICE_URL}/health" 2>/dev/null || echo "FAILED")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ HTTP ${HTTP_CODE}"
    else
        echo "❌ HTTP ${HTTP_CODE}"
    fi
done
echo ""

# ----------------
# 5. TEST SPECIFIC ENDPOINTS THROUGH GATEWAY
# ----------------
echo "[5/8] Testing key endpoints through gateway..."
echo "----------------------------------------"

echo "→ Auth: POST /api/v1/restpoint/auth/login"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    -X POST http://localhost:5000/api/v1/restpoint/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}' || echo "FAILED"
echo ""

echo "→ Tenant Onboarding: POST /api/v1/restpoint/tenant/onboarding/organization"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    -X POST http://localhost:5000/api/v1/restpoint/tenant/onboarding/organization \
    -H "Content-Type: application/json" \
    -d '{"orgName":"TestOrg"}' || echo "FAILED"
echo ""

echo "→ Deceased: GET /api/v1/restpoint/deceased"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/deceased || echo "FAILED"
echo ""

echo "→ Marketplace: GET /api/v1/restpoint/marketplace"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/marketplace || echo "FAILED"
echo ""

echo "→ Invoices: GET /api/v1/restpoint/invoices"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/invoices || echo "FAILED"
echo ""

echo "→ Mpesa: GET /api/v1/restpoint/mpesa"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/mpesa || echo "FAILED"
echo ""

echo "→ Documents: GET /api/v1/restpoint/documents"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/documents || echo "FAILED"
echo ""

echo "→ Analytics: GET /api/v1/restpoint/analytics"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/analytics || echo "FAILED"
echo ""

echo "→ Notification: GET /api/v1/restpoint/notification"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/notification || echo "FAILED"
echo ""

echo "→ Coffin: GET /api/v1/restpoint/coffin"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/coffin || echo "FAILED"
echo ""

echo "→ Calendar: GET /api/v1/restpoint/calendar"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/calendar || echo "FAILED"
echo ""

echo "→ Portal: GET /api/v1/restpoint/portal"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/portal || echo "FAILED"
echo ""

echo "→ E-Documents: GET /api/v1/restpoint/edocuments"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/edocuments || echo "FAILED"
echo ""

echo "→ Visitors: GET /api/v1/restpoint/visitors"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/visitors || echo "FAILED"
echo ""

echo "→ Body Checkout: GET /api/v1/restpoint/bodycheckout"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/bodycheckout || echo "FAILED"
echo ""

echo "→ Chemicals: GET /api/v1/restpoint/chemicals"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/chemicals || echo "FAILED"
echo ""

echo "→ Embalming: GET /api/v1/restpoint/embalming"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/embalming || echo "FAILED"
echo ""

echo "→ Performance: GET /api/v1/restpoint/performance"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/performance || echo "FAILED"
echo ""

echo "→ Users: GET /api/v1/restpoint/users"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/users || echo "FAILED"
echo ""

echo "→ System Admin: GET /api/v1/restpoint/system-admin"
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/system-admin || echo "FAILED"
echo ""

echo ""
# ----------------
# 6. VERBOSE TENANT ONBOARDING TEST
# ----------------
echo "[6/8] VERBOSE TEST: Tenant onboarding endpoint..."
echo "----------------------------------------"
echo "→ Simulating: POST /api/v1/restpoint/tenant/onboarding/organization"
echo ""

# Test with verbose output
docker exec ${GATEWAY_CONTAINER} sh -c '
echo "--- REQUEST ---"
echo "POST /api/v1/restpoint/tenant/onboarding/organization"
echo "Host: app.restpoint.co.ke"
echo "Content-Type: application/json"
echo ""
echo "--- RESPONSE ---"
curl -v -s \
    -X POST http://localhost:5000/api/v1/restpoint/tenant/onboarding/organization \
    -H "Content-Type: application/json" \
    -H "Host: app.restpoint.co.ke" \
    -d "{\"organizationName\":\"TestOrg\",\"adminEmail\":\"admin@test.com\",\"adminPassword\":\"test123\"}" \
    2>&1
echo ""
echo "--- END VERBOSE TEST ---"
' 2>/dev/null || echo "⚠️ Could not execute verbose test"

echo ""
# ----------------
# 7. SHOW GATEWAY LOGS FOR LAST MINUTE
# ----------------
echo "[7/8] Last 20 lines of gateway logs..."
echo "----------------------------------------"
docker logs ${GATEWAY_CONTAINER} --tail 20 2>&1 || echo "⚠️ Could not fetch logs"
echo ""

# ----------------
# 8. ROUTE MATCHING ANALYSIS
# ----------------
echo "[8/8] Route matching analysis..."
echo "----------------------------------------"
echo "Testing how Express matches sub-paths:"
echo ""
echo "Path: /api/v1/restpoint/tenant/onboarding/organization"
echo "  → Matches route: /api/v1/restpoint/tenant  (app.use() matches all sub-paths)"
echo "  → Forwards to: http://tenant-service:5002/api/v1/restpoint/tenant/onboarding/organization"
echo "  → Tenant service has: app.use('/api/v1/restpoint/tenant/onboarding', onboardingRoutes)"
echo ""
echo "Path: /api/v1/restpoint/auth/login/refresh"
echo "  → Matches route: /api/v1/restpoint/auth"
echo "  → Forwards to: http://auth-service:5001/api/v1/restpoint/auth/login/refresh"
echo "  → Auth service has: app.use('/api/v1/restpoint/auth', authRoutes)"
echo ""
echo "============================================"
echo "  DIAGNOSTIC COMPLETE"
echo "============================================"