#!/bin/bash

# =============================================================================
# Bundle Shared Utilities into Each Service
# =============================================================================
# This script copies essential utilities from shared packages into each service
# to make services self-contained and prevent cross-dependency failures.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PACKAGES_DIR="$PROJECT_ROOT/packages"
SERVICES_DIR="$PROJECT_ROOT/services"

echo "========================================"
echo "  Bundle Service Utilities"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Services to update
SERVICES=(
    "api-gateway"
    "auth-service"
    "tenant-service"
    "deceased-service"
    "billing-service"
    "notification-service"
    "documents-service"
    "socketio-service"
    "mpesa-service"
    "invoice-service"
    "marketplace-service"
    "coffin-service"
    "analytics-service"
    "bodycheckout-service"
    "edocuments-service"
    "calender-service"
    "chemical-service"
    "extra-services"
    "call-service"
    "qrcode-service"
    "portal-service"
    "visitors-service"
)

# =============================================================================
# Create Local Utilities Directory Structure
# =============================================================================

echo -e "${BLUE}Creating local utilities structure...${NC}"

for service in "${SERVICES[@]}"; do
    service_dir="$SERVICES_DIR/$service"
    
    if [ ! -d "$service_dir" ]; then
        echo -e "${YELLOW}  Skipping $service (directory not found)${NC}"
        continue
    fi
    
    # Create local utils directory
    mkdir -p "$service_dir/utils"
    mkdir -p "$service_dir/utils/logger"
    mkdir -p "$service_dir/utils/helpers"
    mkdir -p "$service_dir/utils/config"
    
    echo -e "${GREEN}  ✓ Created utils structure for $service${NC}"
done

echo ""

# =============================================================================
# Copy Logger Utilities
# =============================================================================

echo -e "${BLUE}Copying logger utilities...${NC}"

if [ -d "$PACKAGES_DIR/shared-logger/src" ]; then
    for service in "${SERVICES[@]}"; do
        service_dir="$SERVICES_DIR/$service"
        
        if [ ! -d "$service_dir" ]; then
            continue
        fi
        
        # Copy logger implementation
        if [ -f "$PACKAGES_DIR/shared-logger/src/index.js" ]; then
            cp "$PACKAGES_DIR/shared-logger/src/index.js" "$service_dir/utils/logger/index.js"
            echo -e "${GREEN}  ✓ Copied logger to $service${NC}"
        fi
    done
fi

echo ""

# =============================================================================
# Copy Helper Utilities
# =============================================================================

echo -e "${BLUE}Copying helper utilities...${NC}"

if [ -d "$PACKAGES_DIR/shared-utils/src" ]; then
    for service in "${SERVICES[@]}"; do
        service_dir="$SERVICES_DIR/$service"
        
        if [ ! -d "$service_dir" ]; then
            continue
        fi
        
        # Copy all utility files
        for file in "$PACKAGES_DIR/shared-utils/src"/*.js; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                cp "$file" "$service_dir/utils/helpers/$filename"
                echo -e "${GREEN}  ✓ Copied $filename to $service${NC}"
            fi
        done
    done
fi

echo ""

# =============================================================================
# Copy Config Utilities
# =============================================================================

echo -e "${BLUE}Copying config utilities...${NC}"

if [ -d "$PACKAGES_DIR/shared-config/src" ]; then
    for service in "${SERVICES[@]}"; do
        service_dir="$SERVICES_DIR/$service"
        
        if [ ! -d "$service_dir" ]; then
            continue
        fi
        
        # Copy config files (excluding database-specific ones)
        for file in "$PACKAGES_DIR/shared-config/src"/*.js; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                # Skip database config - each service should have its own
                if [[ ! "$filename" =~ (database|db|connection) ]]; then
                    cp "$file" "$service_dir/utils/config/$filename"
                    echo -e "${GREEN}  ✓ Copied $filename to $service${NC}"
                fi
            fi
        done
    done
fi

echo ""

# =============================================================================
# Copy Service Registry Utilities (NEW)
# =============================================================================

echo -e "${BLUE}Copying service registry utilities...${NC}"

REGISTRY_FILES=(
    "global/config/consulClient.js"
    "global/config/serviceRegistry.js"
    "global/middlewares/serviceDiscovery.js"
)

for service in "${SERVICES[@]}"; do
    service_dir="$SERVICES_DIR/$service"
    
    if [ ! -d "$service_dir" ]; then
        continue
    fi
    
    # Create registry utils directory
    mkdir -p "$service_dir/utils/registry"
    
    # Copy registry files
    for file in "${REGISTRY_FILES[@]}"; do
        src_file="$PROJECT_ROOT/$file"
        if [ -f "$src_file" ]; then
            filename=$(basename "$file")
            cp "$src_file" "$service_dir/utils/registry/$filename"
            echo -e "${GREEN}  ✓ Copied $filename to $service/utils/registry${NC}"
        fi
    done
done

echo ""

# =============================================================================
# Create Local require() Wrappers
# =============================================================================

echo -e "${BLUE}Creating local require() wrappers...${NC}"

for service in "${SERVICES[@]}"; do
    service_dir="$SERVICES_DIR/$service"
    
    if [ ! -d "$service_dir" ]; then
        continue
    fi
    
    # Create utils/index.js that exports all local utilities
    cat > "$service_dir/utils/index.js" << 'EOF'
// =============================================================================
// LOCAL UTILITIES - Self-contained utilities for this service
// =============================================================================
// These utilities are bundled directly into the service to prevent
// cross-dependency failures from shared packages.

// Logger
const Logger = require('./logger/index.js');

// Helpers
const helpers = {};
const helperFiles = require('fs').readdirSync('./utils/helpers');
helperFiles.forEach(file => {
  if (file.endsWith('.js') && file !== 'index.js') {
    const name = file.replace('.js', '');
    helpers[name] = require('./helpers/' + file);
  }
});

// Config (non-database)
const config = {};
const configFiles = require('fs').readdirSync('./utils/config');
configFiles.forEach(file => {
  if (file.endsWith('.js') && file !== 'index.js') {
    const name = file.replace('.js', '');
    config[name] = require('./config/' + file);
  }
});

// Service Registry (NEW)
const registry = {};
try {
  registry.consulClient = require('./registry/consulClient.js');
  registry.serviceRegistry = require('./registry/serviceRegistry.js');
  registry.serviceDiscovery = require('./registry/serviceDiscovery.js');
} catch (e) {
  console.warn('[UTILS] Service registry utilities not available:', e.message);
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  Logger,
  helpers,
  config,
  registry,
};

// Convenience exports
module.exports.getLogger = () => Logger;
module.exports.registerService = () => registry.serviceRegistry?.registerService || (() => Promise.resolve(false));
module.exports.deregisterService = () => registry.serviceRegistry?.deregisterService || (() => Promise.resolve(false));
EOF

    echo -e "${GREEN}  ✓ Created utils/index.js for $service${NC}"
done

echo ""

# =============================================================================
# Create package.json Dependencies Section
# =============================================================================

echo -e "${BLUE}Creating package.json helper...${NC}"

cat > "$PROJECT_ROOT/scripts/add-local-utils.js" << 'EOF'
// =============================================================================
// Add Local Utils to package.json
// =============================================================================

const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '..', 'services');
const services = fs.readdirSync(servicesDir).filter(dir => 
  fs.existsSync(path.join(servicesDir, dir, 'utils', 'index.js'))
);

services.forEach(service => {
  const packageJsonPath = path.join(servicesDir, service, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.warn(`Skipping ${service}: package.json not found`);
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add local utils as a file dependency
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.dependencies['@montezuma/local-utils'] = 'file:../../scripts/local-utils-package.json';
  
  // Write back
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✓ Updated ${service}/package.json`);
});

console.log('\nDone! Run "yarn install" in each service to use local utils.');
EOF

node "$PROJECT_ROOT/scripts/add-local-utils.js"

echo ""

# =============================================================================
# Summary
# =============================================================================

echo "========================================"
echo "  Bundling Complete!"
echo "========================================"
echo ""
echo -e "${GREEN}✓ Utilities bundled into all services${NC}"
echo ""
echo "What was done:"
echo "  1. Created utils/ directory in each service"
echo "  2. Copied logger utilities"
echo "  3. Copied helper utilities"
echo "  4. Copied config utilities"
echo "  5. Copied service registry utilities (NEW)"
echo "  6. Created local require() wrappers"
echo ""
echo "Next steps:"
echo "  1. Update service imports to use local utils:"
echo "     const { Logger } = require('./utils');"
echo ""
echo "  2. Test services work independently:"
echo "     docker-compose up -d auth-service"
echo ""
echo "  3. Services are now self-contained and won't break"
echo "   if shared packages have issues!"
echo ""
echo -e "${BLUE}Benefits:${NC}"
echo "  ✓ No dependency on shared packages"
echo "  ✓ Services can run independently"
echo "  ✓ No cross-service breakage"
echo "  ✓ Easier debugging"
echo "  ✓ Faster deployments"
echo ""