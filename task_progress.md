# RestPoint Monorepo Audit & Fix - Task Progress

## Issues Found

### Critical Import Path Errors
- [ ] **Hearse Controller**: `../../../configurations/sqlConfig/db` should be `../../../../configurations/sqlConfig/db` (wrong depth)
- [ ] **Invoice Controller**: `../../shared/config/db` should be `../../../shared/config/db` (wrong depth)
- [ ] **Notification Service**: `lookupTenantDatabase is not a function` - function is named `lookupTenantDb`

### Dockerfile Issues
- [ ] **Hearse Dockerfile**: CMD uses `tsx` but tsx installed globally before USER switch - needs `npx tsx`
- [ ] **Invoice Dockerfile**: Uses `npm install --legacy-peer-deps` instead of `npm ci`; doesn't build shared packages
- [ ] **All Dockerfiles**: Need to standardize build process, ensure shared packages are built

### Package.json Issues
- [ ] **Root package.json**: Missing workspace dependencies, incorrect workspace configuration
- [ ] **Service package.json files**: Missing shared package dependencies

### Runtime Issues
- [ ] **Analytics Service**: Redis connects to 127.0.0.1 instead of container hostname
- [ ] **MariaDB**: Access denied for restpoint_user - password mismatch
- [ ] **Missing compiled files**: Shared packages not built before services start

### Build Order
- [ ] Determine correct build order: shared packages first, then services