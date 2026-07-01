# Bulletproof Database Connection Manager

## Overview

The `ConnectionManager` is a production-ready, defense-in-depth database connection manager for RestPoint's Database-per-Tenant MariaDB architecture. It solves the "Too many connections" problem by strictly controlling the number of open connections across all microservices.

## Quick Start

### Installation

The ConnectionManager is part of the `@restpoint/shared` package. Import it in any service:

```typescript
// Modern import (recommended for TypeScript services)
import { connectionManager } from '../../shared/connectionManager';

// Or default import
import cm from '../../shared/connectionManager';
```

### Basic Usage

```typescript
// SELECT query
const users = await connectionManager.query(
  'tenant_acme_corp',       // tenant database name
  'SELECT * FROM users WHERE active = ?',
  [true]
);

// INSERT/UPDATE/DELETE
const result = await connectionManager.execute(
  'tenant_acme_corp',
  'UPDATE users SET name = ? WHERE id = ?',
  ['Alice', 42]
);
// result.affectedRows -> number
```

### Legacy Compatibility (migrating from dbConfig.ts)

If your service currently uses `safeTenantQuery` / `safeTenantExecute`:

```typescript
// Before (old)
import { safeTenantQuery } from '../../shared/dbConfig';

// After (new) — same signature!
import { safeQuery } from '../../shared/connectionManager';
const rows = await safeQuery('tenant_db', 'SELECT 1');
```

---

## Architecture & Design

### 6 Design Goals

| # | Goal | Implementation |
|---|------|---------------|
| 1 | **Thread-Safe Singleton** | Private constructor + static `getInstance()`. One instance per process. |
| 2 | **LRU Pool Eviction** | Idle pools evicted after 5 minutes (configurable). Background timer checks every 60s. |
| 3 | **Strict Hard Caps** | Max 3 connections per tenant pool. Extra queries queue with 10s timeout. |
| 4 | **Keep-Alive & Dead Pruning** | `SELECT 1` validation before every query. Dead connections pruned automatically. |
| 5 | **Absolute Error Isolation** | `try/catch/finally` guarantees connection release. Cross-tenant isolation. |
| 6 | **Unified Query Method** | `query(tenantDbName, sql, params)` and `execute(tenantDbName, sql, params)`. |

### Memory Safety Guarantees

- **No unclosed pools**: Eviction timer drains idle pools + graceful shutdown
- **No dangling connections**: mysql2 `idleTimeout` + custom eviction timer
- **No "Too many connections"**: Hard cap of 3 conns × ~10 tenants = ~30 connections max
- **No "Broken pipe" errors**: `SELECT 1` validation before every query
- **No cross-tenant contamination**: Isolated pools, each with its own connection limit
- **No connection leaks**: `finally` block ALWAYS releases connections

### Connection Flow

```
Service Code
    │
    ▼
connectionManager.query('tenant_db', 'SELECT ?', [1])
    │
    ├── Check shutdown flag (reject if true)
    ├── Validate tenantDbName parameter
    │
    ├── getOrCreatePool('tenant_db')
    │   ├── Check poolCache Map
    │   ├── Hit: update LRU, return pool
    │   └── Miss: createPool({connectionLimit: 3, ...})
    │         ├── Register pool event listeners
    │         ├── Run 'SELECT 1' warm-up test
    │         └── Add to poolCache + LRU order
    │
    ├── acquireConnection(pool)
    │   ├── Race: pool.getConnection() vs 10s timeout
    │   └── Fail fast if pool exhausted
    │
    ├── validateConnection(conn)
    │   ├── Execute 'SELECT 1'
    │   ├── Fail: prune dead connection
    │   └── Pass: continue
    │
    ├── Execute actual query
    ├── Update LRU timestamp
    │
    ├── Success: return rows
    ├── Error: wrap, log, throw safe error
    │
    └── FINALLY: connection.release() (ALWAYS)
```

---

## Configuration

### Default Values

| Parameter | Default | Description |
|-----------|---------|-------------|
| `maxConnectionsPerTenant` | 3 | Strict max concurrent connections per tenant DB |
| `maxQueuePerTenant` | 5 | Max queued queries when pool exhausted |
| `queueTimeoutMs` | 10,000 | Max wait time in queue (ms) |
| `idleTimeoutMinutes` | 5 | Pool evicted after this idle time |
| `evictionCheckIntervalMs` | 60,000 | How often eviction timer checks (ms) |
| `connectionTimeoutMs` | 5,000 | Max time to establish TCP connection (ms) |
| `acquireTimeoutMs` | 10,000 | Max time to get connection from pool (ms) |
| `idleConnectionTimeoutMs` | 30,000 | mysql2 closes idle TCP after this (ms) |

Connection parameters come from environment variables:
- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 3306)
- `DB_USER` (default: root)
- `DB_PASSWORD` (default: '')

### Custom Configuration

```typescript
import { ConnectionManager } from '../../shared/connectionManager';

// Custom config (only on first call — later calls ignore config)
const cm = ConnectionManager.getInstance({
  maxConnectionsPerTenant: 5,     // Allow more connections for high-traffic services
  idleTimeoutMinutes: 10,         // Keep pools alive longer
  acquireTimeoutMs: 15_000,       // More patient queue wait
});
```

---

## Health Check Endpoint

Expose the connection manager health for monitoring:

```typescript
import { connectionManager } from '../../shared/connectionManager';

// In your Express/Fastify health check route:
app.get('/health/db', (req, res) => {
  res.json(connectionManager.getHealth());
});

// Returns:
// {
//   "status": "HEALTHY",
//   "totalPools": 3,
//   "totalConnectionsCreated": 12,
//   "totalConnectionsDestroyed": 4,
//   "estimatedOpenConnections": 8,
//   "config": { ... },
//   "pools": [
//     {
//       "tenantDbName": "tenant_acme",
//       "activeConnections": 2,
//       "idleMs": 15000,
//       "ageMs": 3600000
//     }
//   ],
//   "lruOrder": ["tenant_acme", "tenant_beta"]
// }
```

---

## Graceful Shutdown

The ConnectionManager automatically registers SIGTERM, SIGINT, and SIGQUIT handlers. When the process receives one of these signals:

1. Set shutdown flag (rejects all new queries)
2. Stop the eviction timer
3. Drain all pools (with 10s timeout per pool)
4. Close all connections
5. Clear all caches

### Manual Shutdown

```typescript
// For testing or controlled restarts
await ConnectionManager.resetInstance();

// Or via the instance
await connectionManager.shutdown();
```

---

## Monitoring & Observability

### Log Messages

The ConnectionManager emits structured log messages with emoji prefixes:

| Prefix | Meaning |
|--------|---------|
| 🔐 | Singleton initialization |
| 🆕 | Instance created |
| ✅ | Pool created and verified |
| 🔗 | New TCP connection established |
| ⏳ | Query queued (pool exhausted) |
| 🧹 | Eviction cycle running |
| 🐢 | Slow query (>1 second) |
| ⚠️ | Warning (dead connection, release error) |
| 🔴 | Error (query failure, pool error) |
| 🛑 | Shutdown sequence |
| 📊 | Shutdown statistics |

### Active Connection Count

```typescript
const active = connectionManager.getActiveConnectionCount();
console.log(`Active connections: ${active}`);
```

---

## Migrating from dbConfig.ts

### Current dbConfig.ts methods → ConnectionManager equivalents

| Old Method | New Method | Notes |
|------------|------------|-------|
| `safeTenantQuery(dbName, sql, params)` | `connectionManager.query()` or `safeQuery()` | Same signature |
| `safeTenantExecute(dbName, sql, params)` | `connectionManager.execute()` or `safeExecute()` | Same signature |
| `getTenantDB(dbName)` | Automatic via `connectionManager.query()` | No need to manage pools directly |
| `closeTenantDB(dbName)` | Automatic via LRU eviction | Pools close themselves when idle |
| `closeAllConnections()` | `connectionManager.shutdown()` | Graceful drain + close |

### Migration Strategy

1. **Phase 1**: Replace direct `safeTenantQuery` calls with `connectionManager.query()` in high-traffic services.
2. **Phase 2**: Update all services to use the singleton (pass `req` context if needed for tenant resolution).
3. **Phase 3**: Remove old `dbConfig.ts` pool management code.

---

## Troubleshooting

### "Too many connections" still occurring

Check MariaDB's `max_connections` vs ConnectionManager's caps:
```sql
SHOW VARIABLES LIKE 'max_connections';
```
If MariaDB allows 151 connections, the ConnectionManager's 3 conns × 10 tenants = 30 is well within limits.

### Queries timing out waiting for connection

Increase `maxConnectionsPerTenant` for the specific service:
```typescript
const cm = ConnectionManager.getInstance({ maxConnectionsPerTenant: 5 });
```

### "Broken pipe" errors persisting

Ensure `enableKeepAlive: true` is set and `idleTimeout` is reasonable. The `SELECT 1` validation should catch dead connections; check MariaDB's `wait_timeout` and `interactive_timeout`.

### Connection pool not evicting

Check if `activeConnections > 0` for the pool. Pools with active connections are not evicted. The next eviction cycle (60s later) will check again.

---

## File Structure

```
shared/
├── connectionManager.ts    ← NEW: The complete ConnectionManager
├── connectionManager.md   ← THIS FILE: documentation
├── database.js            ← EXISTS: compatibility shim (can re-export from connectionManager)
├── dbConfig.ts            ← EXISTS: current connection logic (to be deprecated)
└── tenancy.js             ← EXISTS: tenant validation utility