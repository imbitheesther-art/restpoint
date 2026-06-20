#!/bin/bash
# Validate all Dockerfiles have required structure

set -e

echo "🔍 Validating Dockerfiles..."
echo ""

ERRORS=0
SERVICES=(
  "auth-service"
  "tenant-service"
  "deceased-service"
  "marketplace-service"
  "invoice-service"
  "coffin-service"
  "documents-service"
  "edocuments-service"
  "analytics-service"
  "calender-service"
  "mpesa-service"
  "notification-service"
  "qrcode-service"
  "socketio-service"
  "visitors-service"
  "bodycheckout-service"
  "extra-services"
  "call-service"
  "portal-service"
  "chemical-service"
  "billing-service"
)

for service in "${SERVICES[@]}"; do
  DOCKERFILE="services/${service}/Dockerfile"
  
  if [ ! -f "$DOCKERFILE" ]; then
    echo "❌ MISSING: $DOCKERFILE"
    ERRORS=$((ERRORS + 1))
    continue
  fi
  
  # Check required elements
  checks=(
    "FROM node:20-alpine"
    "WORKDIR /usr/src/app"
    "COPY package.json tsconfig.base.json"
    "COPY packages/shared-utils/package.json"
    "COPY packages/shared-config/package.json"
    "COPY packages/shared-logger/package.json"
    "COPY packages/shared-services/package.json"
    "COPY services/${service}/package.json"
    "RUN npm install --legacy-peer-deps"
    "COPY configurations/"
    "COPY packages/"
    "COPY shared/"
    "COPY global/"
    "RUN cd packages/shared-config && npm run build"
    "RUN cd packages/shared-logger && npm run build"
    "RUN cd packages/shared-utils && npm run build"
    "RUN cd packages/shared-services && npm run build"
    "COPY services/${service}/"
    "EXPOSE 5000"
    "ENV PORT=5000"
    "CMD"
  )
  
  service_errors=0
  for check in "${checks[@]}"; do
    if ! grep -q "$check" "$DOCKERFILE"; then
      echo "⚠️  $DOCKERFILE missing: $check"
      service_errors=$((service_errors + 1))
    fi
  done
  
  if [ $service_errors -eq 0 ]; then
    echo "✅ $service"
  else
    echo "⚠️  $service ($service_errors issues)"
    ERRORS=$((ERRORS + service_errors))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
  echo "✅ All Dockerfiles validated successfully!"
  exit 0
else
  echo "❌ Found $ERRORS issues across Dockerfiles"
  exit 1
fi