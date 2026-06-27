# Migration Guide: Workspace Dependencies → Published Packages

This guide explains how to migrate services from local workspace dependencies to published `@montezuma/*` packages.

## Overview

**Before (Monorepo):**
```json
{
  "dependencies": {
    "@montezuma/shared-config": "file:../../packages/shared-config",
    "@montezuma/shared-logger": "file:../../packages/shared-logger",
    "@montezuma/shared-services": "file:../../packages/shared-services",
    "@montezuma/shared-utils": "file:../../packages/shared-utils"
  }
}
```

**After (Published Packages):**
```json
{
  "dependencies": {
    "@montezuma/shared-config": "^1.0.0",
    "@montezuma/shared-logger": "^1.0.0",
    "@montezuma/shared-services": "^1.0.0",
    "@montezuma/shared-utils": "^1.0.0"
  }
}
```

## Step-by-Step Migration

### 1. Publish Shared Packages

First, ensure all shared packages are published to your registry:

```bash
cd packages

# Build all packages
yarn install
yarn build

# Publish each package
cd shared-config && npm publish && cd ..
cd shared-logger && npm publish && cd ..
cd shared-utils && npm publish && cd ..
cd shared-services && npm publish && cd ..
```

Verify they're available:
```bash
npm view @montezuma/shared-config
npm view @montezuma/shared-logger
npm view @montezuma/shared-utils
npm view @montezuma/shared-services
```

### 2. Update Service package.json

For each service, replace workspace dependencies with versioned dependencies.

#### Example: tenant-service

**Before:**
```json
{
  "dependencies": {
    "@montezuma/shared-config": "file:../../packages/shared-config",
    "@montezuma/shared-logger": "file:../../packages/shared-logger",
    "@montezuma/shared-services": "file:../../packages/shared-services",
    "@montezuma/shared-utils": "file:../../packages/shared-utils"
  }
}
```

**After:**
```json
{
  "dependencies": {
    "@montezuma/shared-config": "^1.0.0",
    "@montezuma/shared-logger": "^1.0.0",
    "@montezuma/shared-services": "^1.0.0",
    "@montezuma/shared-utils": "^1.0.0"
  }
}
```

### 3. Update All Services

Run this script to update all services at once:

```bash
#!/bin/bash
# update-services.sh

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

for service in "${SERVICES[@]}"; do
  echo "Updating $service..."
  
  cd services/$service
  
  # Replace workspace dependencies with versioned dependencies
  sed -i 's|"@montezuma/shared-config": "file:../../packages/shared-config"|"@montezuma/shared-config": "^1.0.0"|g' package.json
  sed -i 's|"@montezuma/shared-logger": "file:../../packages/shared-logger"|"@montezuma/shared-logger": "^1.0.0"|g' package.json
  sed -i 's|"@montezuma/shared-services": "file:../../packages/shared-services"|"@montezuma/shared-services": "^1.0.0"|g' package.json
  sed -i 's|"@montezuma/shared-utils": "file:../../packages/shared-utils"|"@montezuma/shared-utils": "^1.0.0"|g' package.json
  
  cd ../..
done

echo "All services updated!"
```

**For Windows (PowerShell):**
```powershell
# update-services.ps1

$services = @(
  "analytics-service",
  "api-gateway",
  "auth-service",
  "billing-service",
  "bodycheckout-service",
  "calender-service",
  "call-service",
  "chemical-service",
  "coffin-service",
  "deceased-service",
  "documents-service",
  "edocuments-service",
  "extra-services",
  "invoice-service",
  "marketplace-service",
  "mpesa-service",
  "notification-service",
  "portal-service",
  "qrcode-service",
  "scanner-service",
  "socketio-service",
  "tenant-service",
  "visitors-service"
)

foreach ($service in $services) {
  Write-Host "Updating $service..."
  
  $pkgJson = "services/$service/package.json"
  $content = Get-Content $pkgJson -Raw
  
  $content = $content -replace '"@montezuma/shared-config": "file:../../packages/shared-config"', '"@montezuma/shared-config": "^1.0.0"'
  $content = $content -replace '"@montezuma/shared-logger": "file:../../packages/shared-logger"', '"@montezuma/shared-logger": "^1.0.0"'
  $content = $content -replace '"@montezuma/shared-services": "file:../../packages/shared-services"', '"@montezuma/shared-services": "^1.0.0"'
  $content = $content -replace '"@montezuma/shared-utils": "file:../../packages/shared-utils"', '"@montezuma/shared-utils": "^1.0.0"'
  
  Set-Content $pkgJson $content
}

Write-Host "All services updated!"
```

### 4. Install Dependencies

```bash
# From root directory
yarn install

# Or for each service individually
cd services/tenant-service && yarn install
cd services/auth-service && yarn install
# ... repeat for all services
```

### 5. Verify Installation

```bash
# Check that packages are installed from registry, not workspace
cd services/tenant-service
yarn list @montezuma/shared-config
yarn list @montezuma/shared-logger
yarn list @montezuma/shared-services
yarn list @montezuma/shared-utils

# Should show version like: @montezuma/shared-config@1.0.0
# NOT: @montezuma/shared-config@workspace:*
```

### 6. Test Services

```bash
# Test each service
cd services/tenant-service
yarn typecheck
yarn build

# Start service
yarn dev
```

## Handling Breaking Changes

When you need to make breaking changes to shared packages:

### 1. Bump Major Version

```bash
cd packages/shared-config
npm version major  # 1.0.0 → 2.0.0
npm publish
```

### 2. Update All Services

```bash
# Update all services to use new major version
yarn upgrade @montezuma/shared-config@^2.0.0
yarn upgrade @montezuma/shared-logger@^2.0.0
yarn upgrade @montezuma/shared-services@^2.0.0
yarn upgrade @montezuma/shared-utils@^2.0.0
```

### 3. Fix Breaking Changes

Update service code to work with new API:

```typescript
// Before (v1.x)
import { Database } from '@montezuma/shared-config'
const db = new Database()

// After (v2.x)
import { createDatabase } from '@montezuma/shared-config'
const db = createDatabase()
```

## Rollback Strategy

If a published version has issues:

### 1. Republish Previous Version

```bash
# Not possible to overwrite, must bump patch version
cd packages/shared-config
npm version patch  # 1.0.1 → 1.0.2 (with fixes)
npm publish
```

### 2. Pin Services to Working Version

```json
{
  "dependencies": {
    "@montezuma/shared-config": "1.0.0"  // Exact version, no updates
  }
}
```

### 3. Use Yarn Resolutions (Emergency)

```json
{
  "resolutions": {
    "@montezuma/shared-config": "1.0.0",
    "@montezuma/shared-logger": "1.0.0",
    "@montezuma/shared-services": "1.0.0",
    "@montezuma/shared-utils": "1.0.0"
  }
}
```

## CI/CD Updates

### Update GitHub Actions

**Before:**
```yaml
- name: Install dependencies
  run: yarn install
  # Workspaces automatically link local packages
```

**After:**
```yaml
- name: Configure npm registry
  run: |
    echo "@montezuma:registry=https://npm.your-company.com" >> ~/.npmrc
    echo "//npm.your-company.com/:_authToken=${NPM_TOKEN}" >> ~/.npmrc

- name: Install dependencies
  run: yarn install
  # Installs from registry
```

### Update Dockerfiles

**Before:**
```dockerfile
COPY package.json yarn.lock ./
RUN yarn install  # Uses workspaces
COPY . .
```

**After:**
```dockerfile
# Configure registry
RUN echo "@montezuma:registry=https://npm.your-company.com" >> ~/.npmrc

COPY package.json yarn.lock ./
RUN yarn install  # Installs from registry
COPY . .
```

## Environment Variables

Add to `.env` or CI/CD secrets:

```bash
# .env
NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NPM_REGISTRY=https://npm.your-company.com
```

## Verification Checklist

- [ ] All shared packages published to registry
- [ ] All services updated to use versioned dependencies
- [ ] `yarn install` works without errors
- [ ] No `file:` references in package.json files
- [ ] Services build successfully
- [ ] Services start without errors
- [ ] Type checking passes
- [ ] Tests pass
- [ ] CI/CD pipeline updated
- [ ] Dockerfiles updated
- [ ] Documentation updated

## Common Issues

### Issue: "Cannot find module '@montezuma/shared-config'"

**Solution:**
```bash
# Ensure registry is configured
npm config get @montezuma:registry

# Reinstall
rm -rf node_modules
yarn install
```

### Issue: "Package not found"

**Solution:**
```bash
# Verify package exists in registry
npm view @montezuma/shared-config

# If not found, publish it first
cd packages/shared-config
npm publish
```

### Issue: "Version not found"

**Solution:**
```bash
# Check available versions
npm view @montezuma/shared-config versions

# Use exact version if needed
"@montezuma/shared-config": "1.0.0"
```

### Issue: "Workspace protocol still used"

**Solution:**
```bash
# Check for workspace: protocol
grep -r "workspace:" services/*/package.json

# Remove workspaces from root package.json if migrating fully
# Delete "workspaces" array from root package.json
```

## Benefits After Migration

✅ **Fully decoupled services** - No build-order dependency  
✅ **Independent deployments** - Deploy services without rebuilding shared packages  
✅ **Stable versions** - Pin to specific versions for production  
✅ **Faster CI/CD** - No need to build entire monorepo  
✅ **Clear ownership** - Each package has its own lifecycle  
✅ **Easier testing** - Test against published versions  
✅ **Better scaling** - Add new services without monorepo overhead  

## Next Steps

1. ✅ Publish all shared packages
2. ✅ Update all services
3. ✅ Update CI/CD pipelines
4. ✅ Update Dockerfiles
5. ✅ Train team on new workflow
6. ✅ Set up monitoring for package usage
7. ✅ Create changelog process
8. ✅ Establish versioning policy

## Support

For issues or questions:
- Check [PUBLISH.md](./PUBLISH.md) for publishing help
- Review package READMEs for API changes
- Contact platform team for registry access