#!/bin/bash
# ============================================
# Add Monitoring Middleware to ALL Services
# ============================================
# This script patches every service to add:
# - /health endpoint
# - /ready endpoint  
# - /metrics endpoint
# - Request tracking middleware
# - Error tracking
#
# Run on your server from /opt/restpoint
# ============================================

set -e

echo "=========================================="
echo "Adding Monitoring to ALL Services"
echo "=========================================="
echo ""

# First, install prom-client in shared directory
echo "📦 Installing prom-client..."
cd /opt/restpoint
npm install prom-client --save
echo "✅ prom-client installed"
echo ""

# List of all services to patch
SERVICES=(
  "api-gateway:server.js"
  "auth-service:server.js"
  "tenant-service:server.ts"
  "deceased-service:server.ts"
  "invoice-service:server.js"
  "coffin-service:server.js"
  "analytics-service:server.js"
  "documents-service:server.js"
  "bodycheckout-service:server.js"
  "extra-services:server.js"
  "leave-service:server.js"
  "socketio-service:server.js"
  "billing-service:server.js"
  "hearse-service:server.js"
  "chemical-service:server.js"
  "notification-service:server.js"
  "workshop-service:server.ts"
  "support-service:server.js"
)

# Create a patch template
MONITORING_CODE='// ============================================
// MONITORING - Health, Metrics, Request Tracking
// ============================================
const monitoring = require('./shared/monitoring-middleware');
const SERVICE_NAME = process.env.SERVICE_NAME || path.basename(__dirname);

// Add monitoring middleware (tracks all requests)
app.use(monitoring.middleware(SERVICE_NAME));

// Health check endpoint
app.get(["/health", "/ready"], monitoring.healthHandler);

// Readiness probe
app.get("/ready", monitoring.readyHandler);

// Prometheus metrics endpoint
app.get("/metrics", monitoring.metricsHandler);

// Setup global error handlers
monitoring.setupGlobalHandlers(SERVICE_NAME);

// Start background monitoring
monitoring.startEventLoopMonitoring(SERVICE_NAME);
monitoring.startMemoryMonitoring(SERVICE_NAME);
// ============================================'

echo "📝 Patching service files..."

for service_info in "${SERVICES[@]}"; do
  # Split service name and server file
  SERVICE_DIR=$(echo $service_info | cut -d: -f1)
  SERVER_FILE=$(echo $service_info | cut -d: -f2)
  SERVICE_PATH="/opt/restpoint/services/$SERVICE_DIR/$SERVER_FILE"
  
  if [ -f "$SERVICE_PATH" ]; then
    echo ""
    echo "📁 $SERVICE_DIR ($SERVER_FILE)"
    
    # Create backup
    cp "$SERVICE_PATH" "${SERVICE_PATH}.bak"
    echo "  Backup created: ${SERVER_FILE}.bak"
    
    # Check if monitoring is already added
    if grep -q "monitoring-middleware" "$SERVICE_PATH"; then
      echo "  ✅ Already has monitoring - skipping"
      continue
    fi
    
    # Find where to insert - after last require/import statement
    if [[ "$SERVER_FILE" == *.ts ]]; then
      # TypeScript file - add after imports
      awk '
        /^import / { last_import_line = NR }
        { lines[NR] = $0 }
        END {
          for (i = 1; i <= NR; i++) {
            print lines[i]
            if (i == last_import_line) {
              print ""
              print "// Monitoring - health, metrics, request tracking"
              print "import monitoring from \"../../shared/monitoring-middleware\";"
              print "const SERVICE_NAME = process.env.SERVICE_NAME || \""'"'"'$SERVICE_DIR'"'"'";"'"'"
              print ""
              print "app.use(monitoring.middleware(SERVICE_NAME));"
              print "app.get(\"/health\", monitoring.healthHandler);"
              print "app.get(\"/ready\", monitoring.readyHandler);"
              print "app.get(\"/metrics\", monitoring.metricsHandler);"
              print "monitoring.setupGlobalHandlers(SERVICE_NAME);"
              print "monitoring.startEventLoopMonitoring(SERVICE_NAME);"
              print "monitoring.startMemoryMonitoring(SERVICE_NAME);"
            }
          }
        }
      ' "$SERVICE_PATH" > "${SERVICE_PATH}.tmp"
      mv "${SERVICE_PATH}.tmp" "$SERVICE_PATH"
      echo "  ✅ Added monitoring to TypeScript file"
    else
      # JavaScript file - add after requires
      awk '
        /^const .* = require\(/ { last_require_line = NR }
        { lines[NR] = $0 }
        END {
          for (i = 1; i <= NR; i++) {
            print lines[i]
            if (i == last_require_line) {
              print ""
              print "// Monitoring - health, metrics, request tracking"
              print "const monitoring = require(\"../../shared/monitoring-middleware\");"
              print "const SERVICE_NAME = process.env.SERVICE_NAME || \"'"'"'$SERVICE_DIR'"'"'";"'"'"
              print ""
              print "app.use(monitoring.middleware(SERVICE_NAME));"
              print "app.get(\"/health\", monitoring.healthHandler);"
              print "app.get(\"/ready\", monitoring.readyHandler);"
              print "app.get(\"/metrics\", monitoring.metricsHandler);"
              print "monitoring.setupGlobalHandlers(SERVICE_NAME);"
              print "monitoring.startEventLoopMonitoring(SERVICE_NAME);"
              print "monitoring.startMemoryMonitoring(SERVICE_NAME);"
            }
          }
        }
      ' "$SERVICE_PATH" > "${SERVICE_PATH}.tmp"
      mv "${SERVICE_PATH}.tmp" "$SERVICE_PATH"
      echo "  ✅ Added monitoring to JavaScript file"
    fi
    
    # Verify the file was patched correctly
    echo "  Verifying endpoints..."
    if grep -q "/health" "$SERVICE_PATH" && grep -q "/metrics" "$SERVICE_PATH"; then
      echo "  ✅ Health and metrics endpoints verified"
    else
      echo "  ❌ Failed to add endpoints - restoring backup"
      cp "${SERVICE_PATH}.bak" "$SERVICE_PATH"
    fi
    
  else
    echo "⚠️  File not found: $SERVICE_PATH"
  fi
done

echo ""
echo "=========================================="
echo "✅ Monitoring added to all services!"
echo "=========================================="
echo ""
echo "Now restart all services:"
echo "  cd /opt/restpoint && docker compose restart"
echo ""
echo "Then verify metrics endpoints:"
echo '  for port in 5000 5001 5002 5003 5005 5006 5009 5011 5015 5016 5017 5018 5020 5023 5105 5111 6969 8111; do'
echo '    echo "Service on $port: $(curl -s -o /dev/null -w %{http_code} http://84.247.183.53:$port/health)"'
echo '  done'
echo ""
echo "Prometheus will now auto-discover all services!"