#!/bin/bash
set -e

# Update all services to use published @montezuma packages
# This script replaces workspace dependencies with versioned dependencies

SERVICES=(
  "analytics-service"
  "api-gateway"
  "auth-service"
  "billing-service"
  "bodycheckout-service"
  "calender-service"
  "call-service"
  "chemical-service"
  "coffin-service"
  "deceased-service"
  "documents-service"
  "edocuments-service"
  "extra-services"
  "invoice-service"
  "marketplace-service"
  "mpesa-service"
  "notification-service"
  "portal-service"
  "qrcode-service"
  "scanner-service"
  "socketio-service"
  "tenant-service"
  "visitors-service"
)

echo "========================================"
echo "Updating services to use published packages"
echo "========================================"
echo ""

UPDATED_COUNT=0
SKIPPED_COUNT=0

for service in "${SERVICES[@]}"; do
  PKG_JSON="services/$service/package.json"
  
  # Check if service exists
  if [ ! -f "$PKG_JSON" ]; then
    echo "⚠️  Skipping $service (package.json not found)"
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    continue
  fi
  
  # Create backup
  cp "$PKG_JSON" "$PKG_JSON.backup"
  
  # Replace workspace dependencies with versioned dependencies
  sed -i 's|"@montezuma/shared-config": "file:../../packages/shared-config"|"@montezuma/shared-config": "^1.0.0"|g' "$PKG_JSON"
  sed -i 's|"@montezuma/shared-logger": "file:../../packages/shared-logger"|"@montezuma/shared-logger": "^1.0.0"|g' "$PKG_JSON"
  sed -i 's|"@montezuma/shared-services": "file:../../packages/shared-services"|"@montezuma/shared-services": "^1.0.0"|g' "$PKG_JSON"
  sed -i 's|"@montezuma/shared-utils": "file:../../packages/shared-utils"|"@montezuma/shared-utils": "^1.0.0"|g' "$PKG_JSON"
  
  # Check if any changes were made
  if ! diff -q "$PKG_JSON.backup" "$PKG_JSON" > /dev/null; then
    echo "✅ Updated $service"
    UPDATED_COUNT=$((UPDATED_COUNT + 1))
    rm "$PKG_JSON.backup"
  else
    echo "⏭️  Skipping $service (already using published packages)"
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    rm "$PKG_JSON.backup"
  fi
done

echo ""
echo "========================================"
echo "Summary"
echo "========================================"
echo "Updated: $UPDATED_COUNT services"
echo "Skipped: $SKIPPED_COUNT services"
echo ""
echo "Next steps:"
echo "1. Review changes in service package.json files"
echo "2. Run 'npm install' from root or each service directory"
echo "3. Test services with 'npm run dev' or 'npm run build'"
echo "4. Publish shared packages if not already done"
echo ""