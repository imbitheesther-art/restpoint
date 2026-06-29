/**
 * @file shared/dbConfig.ts
 * CENTRALIZED DATABASE CONFIGURATION — Single source of truth for ALL services
 */
import mysql from 'mysql2/promise';
export declare const getRootPool: () => Promise<mysql.Pool>;
export declare const lookupTenantDatabase: (tenantSlug: string) => Promise<string | null>;
export declare const resolveDatabase: (slug: string) => Promise<string | null>;
export declare const getTenantDB: (tenantDbName: string) => Promise<mysql.Pool>;
export declare const getTenantDBBySlug: (tenantSlug: string) => Promise<mysql.Pool | null>;
export declare const query: (req: any, sql: string, params?: any[]) => Promise<any[]>;
export declare const execute: (req: any, sql: string, params?: any[]) => Promise<mysql.ResultSetHeader>;
export declare const safeTenantQuery: (dbName: string, sql: string, params?: any[]) => Promise<any[]>;
export declare const safeTenantExecute: (dbName: string, sql: string, params?: any[]) => Promise<mysql.ResultSetHeader>;
export declare const closeTenantDB: (tenantDbName: string) => Promise<void>;
export declare const closeAllConnections: () => Promise<void>;
declare const _default: {
    getRootPool: () => Promise<mysql.Pool>;
    lookupTenantDatabase: (tenantSlug: string) => Promise<string | null>;
    resolveDatabase: (slug: string) => Promise<string | null>;
    getTenantDB: (tenantDbName: string) => Promise<mysql.Pool>;
    getTenantDBBySlug: (tenantSlug: string) => Promise<mysql.Pool | null>;
    query: (req: any, sql: string, params?: any[]) => Promise<any[]>;
    execute: (req: any, sql: string, params?: any[]) => Promise<mysql.ResultSetHeader>;
    safeTenantQuery: (dbName: string, sql: string, params?: any[]) => Promise<any[]>;
    safeTenantExecute: (dbName: string, sql: string, params?: any[]) => Promise<mysql.ResultSetHeader>;
    closeTenantDB: (tenantDbName: string) => Promise<void>;
    closeAllConnections: () => Promise<void>;
};
export default _default;
//# sourceMappingURL=dbConfig.d.ts.map