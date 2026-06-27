# Publishing Shared Packages

This guide explains how to publish the `@montezuma/*` shared packages to your private npm registry.

## Prerequisites

1. **Private npm registry** set up (Verdaccio, Nexus, Artifactory, or npm Enterprise)
2. **NPM_TOKEN** with publish permissions for the `@montezuma` scope
3. **Registry URL** configured in `.npmrc`

## Package Registry Setup

### Option 1: Verdaccio (Local Development)

```bash
# Install and run Verdaccio locally
npm install -g verdaccio
verdaccio

# Configure .npmrc for local Verdaccio
@montezuma:registry=http://localhost:4873
//localhost:4873/:_authToken=${NPM_TOKEN}
```

### Option 2: Private Registry (Production)

Update `packages/.npmrc` with your registry URL:

```bash
@montezuma:registry=https://npm.your-company.com
//npm.your-company.com/:_authToken=${NPM_TOKEN}
```

## Publishing Workflow

### 1. Build All Packages

```bash
cd packages
yarn install
yarn build
```

Or build individually:

```bash
cd packages/shared-config && yarn build
cd packages/shared-logger && yarn build
cd packages/shared-utils && yarn build
cd packages/shared-services && yarn build
```

### 2. Version Bump (Semantic Versioning)

Follow semver strictly:

- **Patch** (1.0.1): Bug fixes, no breaking changes
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

```bash
# Using npm
npm version patch  # or minor, major
git add -A
git commit -m "chore: bump version to 1.0.1"
git push

# Or manually edit package.json version in each package
```

### 3. Publish to Registry

```bash
# Publish all packages
cd packages/shared-config && npm publish
cd packages/shared-logger && npm publish
cd packages/shared-utils && npm publish
cd packages/shared-services && npm publish

# Or use a script (see below)
```

### 4. Automated Publish Script

Create `packages/publish-all.sh`:

```bash
#!/bin/bash
set -e

echo "Publishing @montezuma shared packages..."

# Ensure you're logged in
npm whoami

# Publish each package
for pkg in shared-config shared-logger shared-utils shared-services; do
  echo "Publishing @montezuma/$pkg..."
  cd $pkg
  npm publish --access public
  cd ..
done

echo "All packages published successfully!"
```

Make executable:
```bash
chmod +x packages/publish-all.sh
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/publish-packages.yml`:

```yaml
name: Publish Shared Packages

on:
  push:
    branches:
      - main
    paths:
      - 'packages/**'
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          registry-url: 'https://npm.your-company.com'
          
      - name: Install dependencies
        run: yarn install
        
      - name: Build packages
        run: |
          cd packages/shared-config && yarn build
          cd packages/shared-logger && yarn build
          cd packages/shared-utils && yarn build
          cd packages/shared-services && yarn build
          
      - name: Publish packages
        run: |
          cd packages/shared-config && npm publish
          cd packages/shared-logger && npm publish
          cd packages/shared-utils && npm publish
          cd packages/shared-services && npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Versioning Strategy

### Independent Versioning (Recommended)

Each package has its own version:

```
@montezuma/shared-config: 1.2.0
@montezuma/shared-logger: 1.1.0
@montezuma/shared-utils: 1.3.0
@montezuma/shared-services: 1.0.0
```

**Pros**: Fine-grained control, smaller updates
**Cons**: More complex dependency management

### Lockstep Versioning

All packages share the same version:

```
@montezuma/shared-config: 1.0.0
@montezuma/shared-logger: 1.0.0
@montezuma/shared-utils: 1.0.0
@montezuma/shared-services: 1.0.0
```

**Pros**: Simpler, all packages updated together
**Cons**: Must publish all packages even for small changes

## Best Practices

1. **Always run tests before publishing**
2. **Update CHANGELOG.md** for each release
3. **Tag releases in git**: `git tag v1.0.1 && git push --tags`
4. **Use semantic versioning** strictly
5. **Document breaking changes** in README
6. **Publish from CI/CD only** (not locally) for production
7. **Use `--access public`** for public registries

## Troubleshooting

### "Package not found" error

```bash
# Check registry configuration
npm config get @montezuma:registry

# Verify you're logged in
npm whoami

# Check package exists
npm view @montezuma/shared-config
```

### "403 Forbidden" error

- Verify NPM_TOKEN has publish permissions
- Check package name is available
- Ensure you're using correct registry URL

### Build failures

```bash
# Clean and rebuild
yarn clean
yarn install
yarn build
```

## Migration from Workspace Dependencies

See [MIGRATION.md](./MIGRATION.md) for updating services to use published packages.