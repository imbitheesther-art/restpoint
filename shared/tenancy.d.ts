/**
 * Validate that a tenant exists and is active.
 *
 * @param {string} tenantSlug - The tenant slug to validate
 * @returns {Promise<{active: boolean, tenant?: {db_name?: string, tenant_id?: number, name?: string, [key: string]: any}, reason?: string}>}
 */
export function validateTenantActive(tenantSlug: string): Promise<{
    active: boolean;
    tenant?: { db_name?: string; tenant_id?: number; name?: string; [key: string]: any };
    reason?: string;
}>;
//# sourceMappingURL=tenancy.d.ts.map