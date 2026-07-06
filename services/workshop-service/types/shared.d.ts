declare module '@restpoint/shared' {
    export function safeTenantQuery(tenantDb: string, query: string, params?: any[]): Promise<any[]>;
    export function safeTenantExecute(tenantDb: string, query: string, params?: any[]): Promise<any>;
    export function getTenantDB(tenantSlug: string): Promise<string>;
}

declare module '@restpoint/connectionManager' {
    export function getIO(): any;
}