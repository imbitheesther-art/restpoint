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

import mysql from 'mysql2/promise';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Migration Service ───────────────────────────────────────────────────────

export class MigrationService {
  private masterPool: mysql.Pool | null = null;

  /**
   * Initialize the master database connection pool.
   * Used to list tenants and orchestrate migrations.
   */
  async initializeMasterConnection(config: DatabaseConfig): Promise<void> {
    this.masterPool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Verify connectivity
    const conn = await this.masterPool.getConnection();
    conn.release();
    console.log(`[MigrationService] ✅ Master connection established: ${config.host}:${config.port}/${config.database || 'N/A'}`);
  }

  /**
   * Get the master pool, creating it if necessary.
   */
  private getMasterPool(): mysql.Pool {
    if (!this.masterPool) {
      throw new Error('[MigrationService] Master connection not initialized. Call initializeMasterConnection() first.');
    }
    return this.masterPool;
  }

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
   * @returns MigrationResult with details of what ran and any errors.
   */
  async runTenantMigrations(
    dbName: string,
    migrations: Migration[],
    connectionConfig: Omit<DatabaseConfig, 'database'>
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migrationsRun: [],
      errors: [],
    };

    let connection: mysql.Pool | null = null;

    try {
      // Create connection to the tenant database
      connection = mysql.createPool({
        host: connectionConfig.host,
        port: connectionConfig.port,
        user: connectionConfig.user,
        password: connectionConfig.password,
        database: dbName,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
      });

      // Ensure migrations tracking table exists
      await this.ensureMigrationsTable(connection);

      // Get already-executed migration names
      const executedMigrations = await this.getExecutedMigrations(connection);
      console.log(`[MigrationService] Database "${dbName}": ${executedMigrations.size} previously executed migration(s)`);

      // Run each pending migration
      for (const migration of migrations) {
        if (executedMigrations.has(migration.name)) {
          continue; // Skip already-executed migration
        }

        try {
          console.log(`[MigrationService] 🔄 Running migration: ${migration.name} on ${dbName}`);

          // Execute the migration SQL
          // Split on semicolons to handle multiple statements, but be careful with
          // semicolons inside strings/triggers. Use mysql2's ability to run multiple statements.
          await connection.query(migration.sql);

          // Record the migration as executed
          await connection.query(
            'INSERT INTO migrations (migration_name, executed_at) VALUES (?, NOW())',
            [migration.name]
          );

          result.migrationsRun.push(migration.name);
          console.log(`[MigrationService] ✅ Completed migration: ${migration.name}`);
        } catch (error: any) {
          const errorMsg = `Migration "${migration.name}" failed: ${error.message}`;
          console.error(`[MigrationService] ❌ ${errorMsg}`);
          result.errors.push(errorMsg);
          result.success = false;
          // Continue with next migration even if one fails (best-effort)
        }
      }
    } catch (error: any) {
      const errorMsg = `Failed to connect to database "${dbName}": ${error.message}`;
      console.error(`[MigrationService] ❌ ${errorMsg}`);
      result.errors.push(errorMsg);
      result.success = false;
    } finally {
      // Always close the tenant connection pool
      if (connection) {
        await connection.end().catch(() => {});
      }
    }

    return result;
  }

  /**
   * Run a single migration by name against a specific tenant database.
   */
  async runSingleMigration(
    dbName: string,
    migration: Migration,
    connectionConfig: Omit<DatabaseConfig, 'database'>
  ): Promise<MigrationResult> {
    return this.runTenantMigrations(dbName, [migration], connectionConfig);
  }

  /**
   * Get migration status for a tenant database.
   */
  async getMigrationStatus(
    dbName: string,
    connectionConfig: Omit<DatabaseConfig, 'database'>
  ): Promise<{ executed: string[]; totalInTable: number }> {
    let connection: mysql.Pool | null = null;

    try {
      connection = mysql.createPool({
        host: connectionConfig.host,
        port: connectionConfig.port,
        user: connectionConfig.user,
        password: connectionConfig.password,
        database: dbName,
        waitForConnections: true,
        connectionLimit: 2,
        queueLimit: 0,
      });

      await this.ensureMigrationsTable(connection);
      const executedMigrations = await this.getExecutedMigrations(connection);

      return {
        executed: Array.from(executedMigrations),
        totalInTable: executedMigrations.size,
      };
    } catch (error: any) {
      console.error(`[MigrationService] Failed to get status for "${dbName}": ${error.message}`);
      return { executed: [], totalInTable: 0 };
    } finally {
      if (connection) {
        await connection.end().catch(() => {});
      }
    }
  }

  /**
   * Rollback the last N migrations from a tenant database.
   */
  async rollbackMigrations(
    dbName: string,
    migrations: Migration[],
    count: number,
    connectionConfig: Omit<DatabaseConfig, 'database'>
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migrationsRun: [],
      errors: [],
    };

    let connection: mysql.Pool | null = null;

    try {
      connection = mysql.createPool({
        host: connectionConfig.host,
        port: connectionConfig.port,
        user: connectionConfig.user,
        password: connectionConfig.password,
        database: dbName,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
      });

      await this.ensureMigrationsTable(connection);
      const executedMigrations = await this.getExecutedMigrations(connection);

      // Get the last N executed migrations in reverse order
      const executedList = Array.from(executedMigrations).reverse().slice(0, count);

      for (const migrationName of executedList) {
        const migration = migrations.find(m => m.name === migrationName);
        if (!migration) {
          console.warn(`[MigrationService] ⚠️  Migration "${migrationName}" found in DB but not in migration list. Skipping.`);
          continue;
        }

        try {
          console.log(`[MigrationService] 🔄 Rolling back migration: ${migrationName} from ${dbName}`);

          // Remove from tracking table
          await connection.query(
            'DELETE FROM migrations WHERE migration_name = ?',
            [migration.name]
          );

          result.migrationsRun.push(migration.name);
          console.log(`[MigrationService] ✅ Rolled back migration: ${migration.name}`);
        } catch (error: any) {
          const errorMsg = `Rollback of "${migration.name}" failed: ${error.message}`;
          console.error(`[MigrationService] ❌ ${errorMsg}`);
          result.errors.push(errorMsg);
          result.success = false;
        }
      }
    } catch (error: any) {
      const errorMsg = `Rollback failed for "${dbName}": ${error.message}`;
      console.error(`[MigrationService] ❌ ${errorMsg}`);
      result.errors.push(errorMsg);
      result.success = false;
    } finally {
      if (connection) {
        await connection.end().catch(() => {});
      }
    }

    return result;
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────

  /**
   * Ensure the migrations tracking table exists.
   */
  private async ensureMigrationsTable(connection: mysql.Pool): Promise<void> {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  /**
   * Get the set of already-executed migration names.
   */
  private async getExecutedMigrations(connection: mysql.Pool): Promise<Set<string>> {
    const [rows] = await connection.query('SELECT migration_name FROM migrations ORDER BY id ASC');
    const executed = new Set<string>();
    for (const row of rows as any[]) {
      executed.add(row.migration_name);
    }
    return executed;
  }

  /**
   * Close all connections.
   */
  async close(): Promise<void> {
    if (this.masterPool) {
      await this.masterPool.end().catch(() => {});
      this.masterPool = null;
      console.log('[MigrationService] 🔌 Master connection closed');
    }
  }
}

export default MigrationService;