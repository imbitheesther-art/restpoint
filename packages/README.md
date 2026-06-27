# @montezuma Shared Packages

Production-grade shared packages for the Montezuma Mortuary SaaS platform. These packages are published to a private npm registry and consumed by all microservices.

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| `@montezuma/shared-config` | Database, tenancy, and environment configuration | 1.0.0 |
| `@montezuma/shared-logger` | Winston-based logging utility | 1.0.0 |
| `@montezuma/shared-services` | Shared services (file storage, etc.) | 1.0.0 |
| `@montezuma/shared-utils` | Utility functions (time, formatting, helpers) | 1.0.0 |

## Installation

Services install these packages from the private registry:

```bash
yarn add @montezuma/shared-config@^1.0.0
yarn add @montezuma/shared-logger@^1.0.0
yarn add @montezuma/shared-services@^1.0.0
yarn add @montezuma/shared-utils@^1.0.0
```

## Development

### Prerequisites

- Node.js >= 22.0.0
- Yarn >= 1.22.0
- Private npm registry access (Verdaccio, Nexus, Artifactory, etc.)

### Setup

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Run tests (if available)
yarn test
```

### Building Individual Packages

```bash
cd packages/shared-config && yarn build
cd packages/shared-logger && yarn build
cd packages/shared-utils && yarn build
cd packages/shared-services && yarn build
```

## Publishing

See [PUBLISH.md](./PUBLISH.md) for complete publishing instructions.

### Quick Publish

```bash
# Build all packages
yarn install
yarn build

# Publish each package
cd shared-config && npm publish && cd ..
cd shared-logger && npm publish && cd ..
cd shared-utils && npm publish && cd ..
cd shared-services && npm publish && cd ..
```

## Migration from Workspace Dependencies

See [MIGRATION.md](./MIGRATION.md) for migrating services from local workspace dependencies to published packages.

### Quick Migration

```bash
# Update all services at once (PowerShell)
powershell -File packages/update-services.ps1

# Or manually update each service's package.json:
# Replace: "file:../../packages/shared-config"
# With: "^1.0.0"
```

## Package Details

### @montezuma/shared-config

Shared configuration for database connections, tenancy management, and environment setup.

**Key Exports:**
- Database configuration
- Tenancy middleware
- Environment variable management
- MySQL connection pooling

**Dependencies:**
- `dotenv` - Environment variable loading
- `mysql2` - MySQL client

### @montezuma/shared-logger

Centralized logging utility using Winston.

**Key Exports:**
- Logger instance
- Log formatting utilities
- Transport configuration
- Log level management

**Dependencies:**
- `dotenv` - Environment variable loading
- `winston` - Logging library

### @montezuma/shared-services

Shared business services used across multiple microservices.

**Key Exports:**
- File storage service
- RabbitMQ connection management
- Redis connection management
- Common business logic

**Dependencies:**
- `amqplib` - RabbitMQ client
- `redis` - Redis client

### @montezuma/shared-utils

Common utility functions and helpers.

**Key Exports:**
- Time/date utilities (using Luxon)
- String formatting helpers
- Validation utilities
- Common helper functions

**Dependencies:**
- `luxon` - Date/time library

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Private npm Registry                  │
│  ┌──────────────┬──────────────┬──────────┬──────────┐ │
│  │ shared-config│ shared-logger│shared-   │shared-   │ │
│  │   1.0.0      │   1.0.0      │services  │utils     │ │
│  │              │              │1.0.0     │1.0.0     │ │
│  └──────────────┴──────────────┴──────────┴──────────┘ │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ yarn add @montezuma/*
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────┴────┐      ┌────┴────┐      ┌────┴────┐
   │ tenant  │      │  auth   │      │ billing │
   │ service │      │ service │      │ service │
   └─────────┘      └─────────┘      └─────────┘
```

## Versioning Strategy

We use **Semantic Versioning (SemVer)**:

- **Major (X.0.0)**: Breaking changes
- **Minor (0.X.0)**: New features, backward compatible
- **Patch (0.0.X)**: Bug fixes, no API changes

### Version Compatibility

Services should use caret ranges for flexibility:

```json
{
  "dependencies": {
    "@montezuma/shared-config": "^1.0.0"
  }
}
```

This allows patch and minor updates automatically, but requires manual upgrade for major versions.

## Best Practices

### For Package Maintainers

1. **Always run tests before publishing**
2. **Update CHANGELOG.md** for every release
3. **Follow semver strictly** - don't break APIs in patch/minor releases
4. **Document all exports** with JSDoc comments
5. **Keep packages focused** - single responsibility principle
6. **Minimize dependencies** - avoid dependency bloat
7. **Use TypeScript** - provide type definitions

### For Service Developers

1. **Pin major versions** in production: `"@montezuma/shared-config": "^1.0.0"`
2. **Test upgrades in staging** before production
3. **Read CHANGELOG.md** before upgrading
4. **Don't modify shared packages** - submit PRs instead
5. **Report issues** with specific package versions

## CI/CD

Packages are automatically published via GitHub Actions when changes are pushed to `main`:

```yaml
# .github/workflows/publish-packages.yml
name: Publish Shared Packages
on:
  push:
    branches: [main]
    paths: ['packages/**']
```

## Registry Configuration

The `@montezuma` scope is configured in `packages/.npmrc`:

```bash
@montezuma:registry=https://npm.your-company.com
//npm.your-company.com/:_authToken=${NPM_TOKEN}
```

**Note:** Update the registry URL to match your private npm registry.

## Troubleshooting

### Package not found

```bash
# Check registry configuration
npm config get @montezuma:registry

# Verify package exists
npm view @montezuma/shared-config
```

### Build failures

```bash
# Clean and rebuild
yarn clean
yarn install
yarn build
```

### Type errors in services

```bash
# Ensure packages are built with declarations
cd packages/shared-config
yarn build

# Reinstall in service
cd services/tenant-service
yarn install
```

## Contributing

1. Create a feature branch
2. Make changes to the relevant package
3. Update version according to semver
4. Update CHANGELOG.md
5. Submit PR with description of changes
6. After merge, CI/CD will publish automatically

## License

ISC

## Support

- **Documentation**: See [PUBLISH.md](./PUBLISH.md) and [MIGRATION.md](./MIGRATION.md)
- **Issues**: Report via GitHub Issues
- **Registry Access**: Contact platform team