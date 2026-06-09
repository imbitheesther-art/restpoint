/**
 * @file shared/tenancy.ts
 * Tenant validation, scoping middleware, and query helpers.
 *
 * SECURITY FIX:
 * - scopeQuery previously injected tenantId via string interpolation.
 *   Now returns parameterized query + updated params array to prevent SQL injection.
 * - validateTenantActive returns typed TenantValidationResult
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { TenantRecord, TenantValidationResult } from '../apps/global/types/index';
import { TenantIsolationError } from '../apps/global/types/errors';
import { RowDataPacket } from 'mysql2/promise';

const { safeQueryOne } = require('./database') as {
  safeQueryOne: <T extends RowDataPacket>(sql: string, params: unknown[]) => Promise<T | null>;
};

// ============================================================
// TENANT VALIDATION
// ============================================================

/**
 * Validates if a tenant exists and is currently active.
 * Returns typed TenantValidationResult — never throws.
 */
export async function validateTenantActive(tenantSlug: string): Promise<TenantValidationResult> {
  if (!tenantSlug || tenantSlug.trim() === '') {
    return { active: false, reason: 'Tenant identifier missing' };
  }

  try {
    const tenant = await safeQueryOne<TenantRecord & RowDataPacket>(
      `SELECT tenant_id as id, tenant_slug as slug, tenant_name as organization_name, 
              CASE WHEN status = 'active' THEN 1 ELSE 0 END as is_active, 
              subscription_status, subscription_expires_at 
       FROM tenants WHERE tenant_slug = ?`,
      [tenantSlug],
    );

    if (!tenant) {
      return { active: false, reason: 'Tenant not found' };
    }

    if (tenant.is_active !== 1) {
      return { active: false, reason: 'Tenant is suspended/inactive' };
    }

    if (tenant.subscription_expires_at && new Date(tenant.subscription_expires_at) < new Date()) {
      return { active: false, reason: 'Tenant subscription has expired' };
    }

    return { active: true, tenant };
  } catch (error) {
    console.error('validateTenantActive error:', error);
    return { active: false, reason: 'Internal tenant verification failure' };
  }
}

// ============================================================
// TENANT MIDDLEWARE
// ============================================================

/**
 * requireTenant — enforces that x-tenant-slug header is present and active.
 * Sets req.tenantId, req.tenantSlug, req.tenant on success.
 */
export const requireTenant: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const tenantSlug = req.headers['x-tenant-slug'] as string | undefined;

  if (!tenantSlug) {
    res.status(400).json({ success: false, message: 'Missing x-tenant-slug header' });
    return;
  }

  const tenantStatus = await validateTenantActive(tenantSlug);

  if (!tenantStatus.active) {
    res.status(403).json({ success: false, message: tenantStatus.reason ?? 'Tenant access denied' });
    return;
  }

  req.tenantId = tenantStatus.tenant!.id;
  req.tenantSlug = tenantStatus.tenant!.slug;
  req.tenant = tenantStatus.tenant!;
  next();
};

/**
 * injectTenantId — optionally resolves the tenant without rejecting the request.
 * For shared/public platform admin endpoints.
 */
export const injectTenantId: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const tenantSlug = req.headers['x-tenant-slug'] as string | undefined;

  if (tenantSlug) {
    const tenantStatus = await validateTenantActive(tenantSlug);
    if (tenantStatus.active && tenantStatus.tenant) {
      req.tenantId = tenantStatus.tenant.id;
      req.tenantSlug = tenantStatus.tenant.slug;
      req.tenant = tenantStatus.tenant;
    }
  }

  next();
};

// ============================================================
// PARAMETERIZED QUERY SCOPING
// ============================================================

/**
 * Returns a parameterized SQL string and updated params array scoped to a tenant.
 *
 * SECURITY FIX: Previously used string interpolation (SQL injection risk).
 * Now returns parameterized form using ? placeholder.
 *
 * @example
 * const { sql: scopedSql, params: scopedParams } = scopeQuery(
 *   'SELECT * FROM deceased WHERE status = ?',
 *   [tenantId],
 *   'active'  // additional param for existing ?
 * );
 * await safeQuery(scopedSql, scopedParams);
 */
export function scopeQuery(
  sql: string,
  tenantId: number,
  ...additionalParams: unknown[]
): { sql: string; params: unknown[] } {
  const upperSql = sql.toUpperCase();

  if (upperSql.includes('WHERE')) {
    const whereIdx = upperSql.indexOf('WHERE');
    const part1 = sql.substring(0, whereIdx + 5); // include "WHERE"
    const part2 = sql.substring(whereIdx + 5);
    return {
      sql: `${part1} tenant_id = ? AND ${part2}`,
      params: [tenantId, ...additionalParams],
    };
  }

  // Handle ORDER BY / LIMIT
  const orderIdx = upperSql.indexOf('ORDER BY');
  const limitIdx = upperSql.indexOf('LIMIT');
  let insertIdx = sql.length;
  if (orderIdx !== -1) insertIdx = Math.min(insertIdx, orderIdx);
  if (limitIdx !== -1) insertIdx = Math.min(insertIdx, limitIdx);

  const part1 = sql.substring(0, insertIdx);
  const part2 = sql.substring(insertIdx);

  return {
    sql: `${part1} WHERE tenant_id = ? ${part2}`,
    params: [tenantId, ...additionalParams],
  };
}

// ============================================================
// CommonJS-compatible exports
// ============================================================

module.exports = {
  validateTenantActive,
  requireTenant,
  injectTenantId,
  scopeQuery,
};
