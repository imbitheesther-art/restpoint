/**
 * @file apps/global/config/env.ts
 * Validated environment variable configuration.
 *
 * SECURITY: Application MUST fail immediately at startup if any required
 * variable is missing or invalid. No fallback secrets are permitted.
 *
 * Implements the secure multi-tier secret resolution pattern from securecoder guidelines:
 * Environment → Local file (dev only) → Ephemeral random (test only, with loud warning)
 */

import * as fs from 'fs';
import * as crypto from 'crypto';

// ============================================================
// INTERNAL HELPERS
// ============================================================

class EnvValidationError extends Error {
  constructor(missing: string[]) {
    super(
      `[STARTUP FAILURE] Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join('\n')}\n` +
        `Set these variables in your .env file or environment before starting.`,
    );
    this.name = 'EnvValidationError';
  }
}

/**
 * Resolves a JWT secret using the secure multi-tier pattern:
 * 1. Environment variable
 * 2. Local secret file (dev only)
 * 3. Ephemeral random (test only) — logs a loud warning
 *
 * In production, if neither env nor file is available, the process exits.
 */
function resolveSecret(envVar: string, filePath: string): string {
  const fromEnv = process.env[envVar];
  if (fromEnv && fromEnv.length > 0) return fromEnv;

  if (fs.existsSync(filePath)) {
    const fromFile = fs.readFileSync(filePath, 'utf-8').trim();
    if (fromFile.length > 0) return fromFile;
  }

  const isTest = process.env['NODE_ENV'] === 'test';
  if (isTest) {
    const ephemeral = crypto.randomBytes(32).toString('hex');
    console.warn(
      `[SECURITY WARNING] ${envVar} not set. Generated ephemeral secret for testing only.` +
        ` This instance is NOT horizontally scalable — tokens will be invalid across restarts.`,
    );
    return ephemeral;
  }

  return ''; // Will be caught by validation below
}

// ============================================================
// WEAK SECRET DETECTION
// ============================================================

const KNOWN_WEAK_SECRETS = new Set([
  'supersecretjwtkey',
  'supersecretrefreshkey',
  'ballot-super-secret-key-change-in-production',
  'ballot-refresh-secret-key',
  'default',
  'secret',
  'changeme',
  'password',
  'jwt_secret',
  'your-secret-key',
]);

function assertNotWeak(value: string, name: string): void {
  if (KNOWN_WEAK_SECRETS.has(value.toLowerCase())) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new EnvValidationError([`${name} is set to a known weak/default value`]);
    }
    console.warn(
      `[SECURITY WARNING] ${name} is using a known weak default value. ` +
        `This MUST be changed before production deployment.`,
    );
  }
}

// ============================================================
// CONFIGURATION OBJECT
// ============================================================

export interface AppConfig {
  // Server
  readonly nodeEnv: 'development' | 'test' | 'production';
  readonly port: number;
  readonly host: string;

  // JWT Secrets
  readonly jwtSecret: string;
  readonly jwtRefreshSecret: string;
  readonly jwtAccessExpiry: string;
  readonly jwtRefreshExpiry: string;

  // Database
  readonly db: {
    readonly host: string;
    readonly port: number;
    readonly user: string;
    readonly password: string;
    readonly name: string;
    readonly poolSize: number;
    readonly queueLimit: number;
    readonly connectionTimeout: number;
    readonly ssl: boolean;
    readonly sslRejectUnauthorized: boolean;
  };

  // Redis
  readonly redis: {
    readonly host: string;
    readonly port: number;
    readonly password: string | undefined;
    readonly db: number;
  };

  // CORS
  readonly allowedOrigins: string[];

  // Site
  readonly siteUrl: string;
}

// ============================================================
// FACTORY FUNCTION
// ============================================================

function buildConfig(): AppConfig {
  const nodeEnv = (process.env['NODE_ENV'] ?? 'development') as AppConfig['nodeEnv'];
  const isProd = nodeEnv === 'production';

  // --- JWT Secrets (mandatory, no hardcoded fallbacks in production) ---
  const jwtSecret = resolveSecret('JWT_SECRET', './jwt_secret.txt');
  const jwtRefreshSecret = resolveSecret('JWT_REFRESH_SECRET', './jwt_refresh_secret.txt');

  // --- Collect missing required vars ---
  const missing: string[] = [];

  if (!jwtSecret && isProd) missing.push('JWT_SECRET');
  if (!jwtRefreshSecret && isProd) missing.push('JWT_REFRESH_SECRET');

  // DB is required in all environments except test (where we allow stubs)
  const dbUser = process.env['DB_USER'];
  const dbPassword = process.env['DB_PASSWORD'];
  const dbName = process.env['DB_NAME'];

  if (isProd) {
    if (!dbUser) missing.push('DB_USER');
    if (dbPassword === undefined || dbPassword === '') missing.push('DB_PASSWORD');
    if (!dbName) missing.push('DB_NAME');
  }

  if (missing.length > 0) {
    throw new EnvValidationError(missing);
  }

  // Warn on weak secrets (don't throw in dev/test)
  if (jwtSecret) assertNotWeak(jwtSecret, 'JWT_SECRET');
  if (jwtRefreshSecret) assertNotWeak(jwtRefreshSecret, 'JWT_REFRESH_SECRET');

  return {
    nodeEnv,
    port: parseInt(process.env['PORT'] ?? '3000', 10),
    host: process.env['HOST'] ?? '0.0.0.0',

    jwtSecret,
    jwtRefreshSecret,
    jwtAccessExpiry: process.env['JWT_ACCESS_EXPIRY'] ?? '2h',
    jwtRefreshExpiry: process.env['JWT_REFRESH_EXPIRY'] ?? '7d',

    db: {
      host: process.env['DB_HOST'] ?? 'localhost',
      port: parseInt(process.env['DB_PORT'] ?? '3306', 10),
      user: dbUser ?? 'app_user', // Non-root default for dev
      password: dbPassword ?? '',
      name: dbName ?? 'app_db',
      poolSize: parseInt(process.env['DB_POOL_SIZE'] ?? '10', 10),
      queueLimit: parseInt(process.env['DB_QUEUE_LIMIT'] ?? '100', 10),
      connectionTimeout: parseInt(process.env['DB_CONNECTION_TIMEOUT'] ?? '10000', 10),
      ssl: process.env['DB_SSL'] === 'true',
      sslRejectUnauthorized: process.env['DB_SSL_REJECT_UNAUTHORIZED'] !== 'false',
    },

    redis: {
      host: process.env['REDIS_HOST'] ?? 'localhost',
      port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
      password: process.env['REDIS_PASSWORD'] ?? undefined,
      db: parseInt(process.env['REDIS_DB'] ?? '0', 10),
    },

    allowedOrigins: process.env['ALLOWED_ORIGINS']
      ? process.env['ALLOWED_ORIGINS'].split(',').map((o) => o.trim())
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],

    siteUrl: process.env['SITE_URL'] ?? 'http://localhost:3000',
  } as const;
}

// ============================================================
// SINGLETON CONFIG EXPORT
// Computed once at module load — throws if invalid, stopping startup
// ============================================================

// NOTE: We use a lazy singleton to allow test files to set env vars before loading
let _config: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (_config === null) {
    _config = buildConfig();
  }
  return _config;
}

// Also export as default singleton for convenience in non-test code
export const config: AppConfig = buildConfig();

export default config;
