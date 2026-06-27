# Self-Contained Services Guide

## Problem

Services depending on shared packages (`@montezuma/shared-*`) can break if:
- Packages aren't built/published before services start
- Package versions have conflicts
- Registry is unavailable
- One service's dependency breaks another

## Solution: Local Utilities

Each service gets its own copy of essential utilities, making it **fully self-contained**.

## Implementation

### Option 1: Quick Fix - Use Global Utils (Recommended)

The service registry utilities are already in `global/` and don't depend on shared packages:

```javascript
// Instead of: const { Logger } = require('@montezuma/shared-logger');
// Use: Simple inline logger
const Logger = {
  info: (msg, data) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg, data) => console.error(`[ERROR] ${msg}`, data || ''),
  warn: (msg, data) => console.warn(`[WARN] ${msg}`, data || ''),
};

// Service registry is in global/ and has no shared package dependencies
const { registerService, deregisterService } = require('../../global/config/serviceRegistry');
```

### Option 2: Bundle Utilities (Automated)

Run the bundling script to copy utilities into each service:

```bash
# Windows (Git Bash)
bash scripts/bundle-service-utilities.sh

# Or manually copy for a specific service
cp global/config/serviceRegistry.js services/auth-service/utils/registry/
cp global/config/consulClient.js services/auth-service/utils/registry/
cp global/middlewares/serviceDiscovery.js services/auth-service/utils/registry/
```

Then use in your service:

```javascript
// services/auth-service/server.js
const { registerService, deregisterService } = require('./utils/registry/serviceRegistry');
const { Logger } = require('./utils/logger');
```

### Option 3: Inline Critical Utilities

For maximum reliability, inline critical utilities directly in each service:

```javascript
// services/auth-service/server.js

// =============================================================================
// LOGGER (Self-contained, no dependencies)
// =============================================================================
const Logger = {
  info: (m, d) => console.log(`[INFO] ${m}`, d || ''),
  error: (m, d) => console.error(`[ERROR] ${m}`, d || ''),
  warn: (m, d) => console.warn(`[WARN] ${m}`, d || ''),
  debug: (m, d) => console.debug(`[DEBUG] ${m}`, d || ''),
};

// =============================================================================
// SERVICE REGISTRY (Self-contained, no shared package dependencies)
// =============================================================================
const { getConsulClient } = require('../../global/config/consulClient');

async function registerWithConsul() {
  const consul = getConsulClient();
  const serviceName = process.env.SERVICE_NAME || 'auth-service';
  const port = parseInt(process.env.PORT) || 5000;
  
  try {
    await consul.registerService({
      ID: `${serviceName}-${process.env.HOSTNAME || 'local'}`,
      Name: serviceName,
      Tags: ['restpoint', 'microservice', process.env.NODE_ENV || 'development'],
      Address: process.env.HOST || '0.0.0.0',
      Port: port,
      Check: {
        HTTP: `http://localhost:${port}/health`,
        Interval: '10s',
        Timeout: '5s',
        DeregisterCriticalServiceAfter: '30s',
      },
    });
    Logger.info(`Registered ${serviceName} with Consul`);
  } catch (error) {
    Logger.warn(`Consul registration failed: ${error.message}`);
  }
}

// =============================================================================
// REST OF YOUR SERVICE CODE
// =============================================================================
```

## Service Registry Utilities (No Shared Dependencies)

These files in `global/` have **ZERO** dependencies on shared packages:

```
global/config/consulClient.js          - Consul client (only depends on axios)
global/config/serviceRegistry.js       - Service registration helper
global/middlewares/serviceDiscovery.js - API gateway discovery middleware
```

They only require:
- `axios` (HTTP client) - already in most services
- `http` (Node.js built-in)
- `os` (Node.js built-in)

## Migration Guide

### Step 1: Identify Shared Package Dependencies

Check your service's package.json:

```bash
cat services/auth-service/package.json | grep "@montezuma"
```

### Step 2: Replace with Local Alternatives

**Before (depends on shared packages):**
```javascript
const { Logger } = require('@montezuma/shared-logger');
const { dbConfig } = require('@montezuma/shared-config');
const { FileStorageService } = require('@montezuma/shared-services');
```

**After (self-contained):**
```javascript
// Logger - inline or use global
const Logger = {
  info: (m, d) => console.log(`[INFO] ${m}`, d || ''),
  error: (m, d) => console.error(`[ERROR] ${m}`, d || ''),
};

// Database config - keep in service
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// File storage - inline if needed
const FileStorageService = {
  upload: async (file) => { /* implementation */ },
  delete: async (path) => { /* implementation */ },
};

// Service registry - use global (no shared package dependency)
const { registerService, deregisterService } = require('../../global/config/serviceRegistry');
```

### Step 3: Update docker-compose.yml

Ensure services have required environment variables:

```yaml
services:
  auth-service:
    environment:
      - SERVICE_NAME=auth-service
      - SERVICE_VERSION=1.0.0
      - CONSUL_HOST=http://restpoint_consul:8500
      - PORT=5000
      # Database config (service-specific)
      - DB_HOST=restpoint_mariadb
      - DB_PORT=3306
      - DB_USER=restpoint_user
      - DB_PASSWORD=RestPointUser2024
```

### Step 4: Test Service Independence

```bash
# Start only Consul
docker-compose -f docker-compose.yml -f docker-compose.registry.yml up -d consul

# Start a single service (should work without shared packages)
docker-compose up -d auth-service

# Check it registered with Consul
curl http://localhost:8500/v1/health/service/auth-service

# Test the service
curl http://localhost:5000/health
```

## Benefits of Self-Contained Services

✅ **No Shared Package Dependencies** - Services don't break when packages fail  
✅ **Independent Deployment** - Each service can be deployed separately  
✅ **Faster Startup** - No need to build/publish packages first  
✅ **Easier Debugging** - All code is in one place  
✅ **No Version Conflicts** - Each service uses its own version  
✅ **Offline Development** - Services work without registry access  
✅ **Simpler CI/CD** - No package build/publish step needed  

## What Still Uses Shared Packages?

You can keep shared packages for:
- **TypeScript type definitions** (if using TypeScript)
- **Complex business logic** shared across many services
- **Database schemas/migrations**

But make services work **without** them as a fallback.

## Example: Complete Self-Contained Service

```javascript
// services/auth-service/server.js

const express = require('express');
const { registerService, deregisterService } = require('../../global/config/serviceRegistry');

const app = express();
const PORT = process.env.PORT || 5000;
const SERVICE_NAME = process.env.SERVICE_NAME || 'auth-service';

// =============================================================================
// SELF-CONTAINED LOGGER (No shared package dependency)
// =============================================================================
const Logger = {
  info: (m, d) => console.log(`[INFO] ${m}`, d || ''),
  error: (m, d) => console.error(`[ERROR] ${m}`, d || ''),
  warn: (m, d) => console.warn(`[WARN] ${m}`, d || ''),
};

// =============================================================================
// SERVICE REGISTRATION (Uses global/ - no shared packages)
// =============================================================================
async function initialize() {
  try {
    // Register with Consul (no shared package dependency)
    await registerService();
    Logger.info('Service registered with Consul');
  } catch (error) {
    Logger.warn('Consul registration failed, continuing anyway');
  }

  // Start server
  app.listen(PORT, () => {
    Logger.info(`Service running on port ${PORT}`);
  });
}

// =============================================================================
// HEALTH CHECK (Required for Consul)
// =============================================================================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: SERVICE_NAME,
    status: 'healthy',
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

// =============================================================================
// YOUR ROUTES
// =============================================================================
app.get('/', (req, res) => {
  res.json({ service: SERVICE_NAME, version: '1.0.0' });
});

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================
process.on('SIGINT', async () => {
  Logger.info('Shutting down...');
  await deregisterService();
  process.exit(0);
});

// =============================================================================
// START
// =============================================================================
initialize();
```

## Checklist for Each Service

- [ ] Remove `@montezuma/shared-*` dependencies from package.json (or make optional)
- [ ] Inline logger utility
- [ ] Inline or localize config utilities
- [ ] Use `global/config/serviceRegistry.js` for Consul (no shared deps)
- [ ] Ensure `/health` endpoint exists
- [ ] Test service starts without shared packages: `docker-compose up auth-service`
- [ ] Verify service registers with Consul: `curl http://localhost:8500/v1/health/service/auth-service`

## Troubleshooting

### Service won't start without shared packages

```bash
# Check what's failing
docker-compose logs auth-service

# Find shared package imports
grep -r "@montezuma" services/auth-service/

# Replace with local alternatives
```

### Module not found errors

```bash
# Ensure global/ utilities are accessible
docker-compose exec auth-service ls -la global/config/

# Check require paths are correct
# Use relative paths: ../../global/config/...
```

## Summary

**Key Principle:** Services should work **standalone** without any shared packages.

The service registry implementation in `global/` is already self-contained and has no shared package dependencies. Use it as a model for making other utilities self-contained.

**Minimum Requirement:** Each service needs:
1. Inline logger (5 lines of code)
2. Service registry from `global/` (already done)
3. `/health` endpoint
4. Environment variables for Consul

That's it! Services will now be fully independent and won't break due to shared package issues.