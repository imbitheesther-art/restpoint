#!/bin/bash
# ============================================
# RestPoint Gateway - Rollback Script
# ============================================
# Usage: bash scripts/rollback-gateway.sh
# Run this if the deployment breaks anything
# ============================================

set -e

GATEWAY_CONTAINER="restpoint_gateway"
GATEWAY_DIR="/app/services/api-gateway"
BACKUP_DIR="/app/backups/gateway"

echo "============================================"
echo "  RESTPOINT GATEWAY ROLLBACK"
echo "  $(date -R)"
echo "============================================"
echo ""

# List available backups
echo "Available backups:"
ls -lh ${BACKUP_DIR}/ 2>/dev/null || echo "No backups found in ${BACKUP_DIR}"
echo ""

# Get the latest backup
LATEST_BACKUP=$(ls -t ${BACKUP_DIR}/server.js.backup.* 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backups found! Cannot rollback."
    exit 1
fi

echo "Latest backup: ${LATEST_BACKUP}"
echo ""

# Confirm rollback
echo "Are you sure you want to rollback? (yes/no)"
read -r CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Rollback cancelled."
    exit 0
fi

# ----------------
# 1. RESTORE BACKUP
# ----------------
echo "[1/4] Restoring backup..."
echo "----------------------------------------"
docker cp ${LATEST_BACKUP} ${GATEWAY_CONTAINER}:${GATEWAY_DIR}/server.js
echo "✅ Backup restored"
echo ""

# ----------------
# 2. RESTART GATEWAY
# ----------------
echo "[2/4] Restarting gateway..."
echo "----------------------------------------"
docker restart ${GATEWAY_CONTAINER}
echo "⏳ Waiting for gateway to start..."
sleep 5
echo ""

# ----------------
# 3. VERIFY
# ----------------
echo "[3/4] Verifying gateway is healthy..."
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
    echo "❌ Gateway failed to become healthy even after rollback!"
    echo "   Check logs: docker logs ${GATEWAY_CONTAINER}"
    exit 1
fi
echo ""

# ----------------
# 4. QUICK TEST
# ----------------
echo "[4/4] Quick endpoint test..."
echo "----------------------------------------"
echo -n "→ Health: "
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:5000/health
echo ""

echo -n "→ Tenant: "
docker exec ${GATEWAY_CONTAINER} curl -s -o /dev/null -w "HTTP %{http_code}" \
    http://localhost:5000/api/v1/restpoint/tenant
echo ""

echo ""
echo "============================================"
echo "  ROLLBACK COMPLETE"
echo "============================================"
echo ""
echo "Monitor logs: docker logs -f ${GATEWAY_CONTAINER}"
echo ""