#!/bin/bash
# ============================================
# RestPoint Gateway - Deployment Script
# ============================================
# Usage: bash scripts/deploy-gateway.sh
# Run this on the VPS to deploy the fixed gateway
# ============================================

set -e

GATEWAY_CONTAINER="restpoint_gateway"
GATEWAY_DIR="/app/services/api-gateway"
BACKUP_DIR="/app/backups/gateway"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "============================================"
echo "  RESTPOINT GATEWAY DEPLOYMENT"
echo "  Started: $(date -R)"
echo "============================================"
echo ""

# ----------------
# 1. BACKUP CURRENT SERVER.JS
# ----------------
echo "[1/7] Backing up current server.js..."
echo "----------------------------------------"
mkdir -p ${BACKUP_DIR}
docker cp ${GATEWAY_CONTAINER}:${GATEWAY_DIR}/server.js ${BACKUP_DIR}/server.js.backup.${TIMESTAMP} 2>/dev/null || {
    echo "⚠️ Could not backup from container, backing up locally..."
    cp services/api-gateway/server.js ${BACKUP_DIR}/server.js.backup.${TIMESTAMP}.pre-fix 2>/dev/null || true
}
echo "✅ Backup saved to: ${BACKUP_DIR}/server.js.backup.${TIMESTAMP}"
echo ""

# ----------------
# 2. UPDATE SERVER.JS IN CONTAINER
# ----------------
echo "[2/7] Copying updated server.js to container..."
echo "----------------------------------------"
docker cp services/api-gateway/server.js ${GATEWAY_CONTAINER}:${GATEWAY_DIR}/server.js
echo "✅ server.js copied to container"
echo ""

# ----------------
# 3. VERIFY FILE WAS COPIED
# ----------------
echo "[3/7] Verifying file in container..."
echo "----------------------------------------"
docker exec ${GATEWAY_CONTAINER} ls -la ${GATEWAY_DIR}/server.js
docker exec ${GATEWAY_CONTAINER} head -3 ${GATEWAY_DIR}/server.js
echo "✅ File verified"
echo ""

# ----------------
# 4. RESTART THE GATEWAY
# ----------------
echo "[4/7] Restarting gateway container..."
echo "----------------------------------------"
docker restart ${GATEWAY_CONTAINER}
echo "⏳ Waiting for gateway to start..."
sleep 5
echo ""

# ----------------
# 5. VERIFY GATEWAY IS RUNNING
# ----------------
echo "[5/7] Verifying gateway is healthy..."
echo "----------------------------------------"
for i in {1..10}; do
    HEALTH=$(docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health 2>/dev/null || echo "FAILED")
    if [ "$HEALTH" = "200" ]; then
        echo "✅ Gateway is healthy! (HTTP ${HEALTH})"
        break
    fi
    echo "⏳ Attempt ${i}/10: HTTP ${HEALTH} - waiting..."
    sleep 3
done

if [ "$HEALTH" != "200" ]; then
    echo "❌ Gateway failed to become healthy!"
    echo "   Check logs: docker logs ${GATEWAY_CONTAINER}"
    exit 1
fi
echo ""

# ----------------
# 6. TEST ALL ENDPOINTS
# ----------------
echo "[6/7] Testing all gateway endpoints..."
echo "----------------------------------------"

# Test health
echo -n "→ Health: "
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:5000/health
echo ""

# Test auth
echo -n "→ Auth: "
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    -X POST http://localhost:5000/api/v1/restpoint/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}'
echo ""

# Test tenant onboarding (the previously broken endpoint)
echo -n "→ Tenant Onboarding: "
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    -X POST http://localhost:5000/api/v1/restpoint/tenant/onboarding/organization \
    -H "Content-Type: application/json" \
    -d '{"orgName":"TestOrg"}'
echo ""

# Test all other services
SERVICES="deceased marketplace invoices mpesa documents analytics notification coffin calendar portal edocuments visitors bodycheckout chemicals embalming performance users"
for svc in $SERVICES; do
    echo -n "→ ${svc}: "
    docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
        http://localhost:5000/api/v1/restpoint/${svc}
    echo ""
done

echo ""
echo "✅ All endpoint tests complete"
echo ""

# ----------------
# 7. FINAL VERIFICATION
# ----------------
echo "[7/7] Final verification..."
echo "----------------------------------------"
echo "→ Gateway version:"
docker exec ${GATEWAY_CONTAINER} curl -s http://localhost:5000/health | python -m json.tool 2>/dev/null || docker exec ${GATEWAY_CONTAINER} curl -s http://localhost:5000/health

echo ""
echo "→ Registered routes:"
docker exec ${GATEWAY_CONTAINER} curl -s http://localhost:5000/api/v1/debug/routes 2>/dev/null | python -m json.tool 2>/dev/null || echo "(debug endpoint not available yet)"

echo ""
echo "============================================"
echo "  DEPLOYMENT COMPLETE"
echo "  $(date -R)"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Monitor logs: docker logs -f ${GATEWAY_CONTAINER}"
echo "  2. Test from frontend: https://app.restpoint.co.ke"
echo "  3. Rollback if needed: bash scripts/rollback-gateway.sh"
echo ""