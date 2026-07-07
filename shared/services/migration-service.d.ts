/**
 * @file shared/services/migration-service.ts
 * PRODUCTION-READY: Shared Migration Service
 *
 * Centralized migration runner for all tenant databases.
 * Tracks executed migrations in a `migrations` table per tenant database.
 *
 * Usage:
 *   const service = new MigrationService();
 *   await service.initializeMasterConnection(config);
 *   const result = await service.runTenantMigrations(dbName, migrations, connectionConfig);
 *   await service.close();
 */
export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database?: string;
}
export interface Migration {
    name: string;
    sql: string;
}
export interface MigrationResult {
    success: boolean;
    migrationsRun: string[];
    errors: string[];
}
export declare class MigrationService {
    private masterPool;
    /**
     * Initialize the master database connection pool.
     * Used to list tenants and orchestrate migrations.
     */
    initializeMasterConnection(config: DatabaseConfig): Promise<void>;
    /**
     * Get the master pool, creating it if necessary.
     */
    private getMasterPool;
    /**
     * Run all pending migrations against a specific tenant database.
     *
     * - Creates the `migrations` tracking table if it doesn't exist.
     * - Skips migrations that have already been executed.
     * - Executes each migration SQL in order.
     * - Records successful migrations in the tracking table.
     *
     * @param dbName  The tenant database name.
     * @param migrations  Ordered array of migration objects ({ name, sql }).
     * @param connectionConfig  Database connection config (without database name).
     * @param onProgress  Optional callback function called after each migration completes.
     * @returns MigrationResult with details of what ran and any errors.
     */
    runTenantMigrations(dbName: string, migrations: Migration[], connectionConfig: Omit<DatabaseConfig, 'database'>, onProgress?: (migrationName: string) => void): Promise<MigrationResult>;
    /**
     * Run a single migration by name against a specific tenant database.
     */
    runSingleMigration(dbName: string, migration: Migration, connectionConfig: Omit<DatabaseConfig, 'database'>): Promise<MigrationResult>;
    /**
     * Get migration status for a tenant database.
     */
    getMigrationStatus(dbName: string, connectionConfig: Omit<DatabaseConfig, 'database'>): Promise<{
        executed: string[];
        totalInTable: number;
    }>;
    /**
     * Rollback the last N migrations from a tenant database.
     */
    rollbackMigrations(dbName: string, migrations: Migration[], count: number, connectionConfig: Omit<DatabaseConfig, 'database'>): Promise<MigrationResult>;
    /**
     * Ensure the migrations tracking table exists.
     */
    private ensureMigrationsTable;
    /**
     * Get the set of already-executed migration names.
     */
    private getExecutedMigrations;
    /**
     * Close all connections.
     */
    close(): Promise<void>;
}
export default MigrationService;
//# sourceMappingURL=migration-service.d.ts.map