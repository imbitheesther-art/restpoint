/**
 * Validate that a tenant exists and is active.
 *
 * @param {string} tenantSlug - The tenant slug to validate
 * @returns {Promise<{active: boolean, tenant?: object, reason?: string}>}
 */
export function validateTenantActive(tenantSlug: string): Promise<{
    active: boolean;
    tenant?: object;
    reason?: string;
}>;
//# sourceMappingURL=tenancy.d.ts.map