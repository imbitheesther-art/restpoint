// Type declarations for shared modules
declare module '../../shared/tenancy.js' {
    export async function validateTenantActive(tenantSlug: string): Promise<{
        active: boolean;
        reason?: string;
        tenant?: {
            db_name: string;
            tenant_id: number;
            name: string;
        };
    }>;
}

declare module '../../shared/dbConfig.js' {
    export async function safeTenantQuery(tenantDb: string, query: string, params?: any[]): Promise<any[]>;
    export async function safeTenantExecute(tenantDb: string, query: string, params?: any[]): Promise<any>;
    export async function getTenantDB(tenantDb: string): Promise<any>;
}