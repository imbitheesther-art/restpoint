export function safeQuery(sql: string, params?: any[], tenantSlug?: string | null): Promise<any[]>;
export function lookupTenantDb(tenantSlug: string): Promise<string | null>;
export function getTenantPool(tenantDbName: string): Promise<any>;
export function getRootPool(): Promise<any>;
export function closeAll(): Promise<void>;
export const DB_CONFIG: {
  host: string;
  port: number;
  user: string;
  password: string;
};