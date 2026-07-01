/**
 * @file shared/services/migration-service.ts
 * PRODUCTION-READY: Shared Migration Service with MariaDB auth fix
 */

import mysql from 'mysql2/promise';

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

export class MigrationService {
  private masterPool: mysql.Pool | null = null;

  /**
   * ✅ FIXED: Get auth plugins configuration for MariaDB
   */
  private getAuthPlugins() {
    return {
      mysql_native_password: () => {
        return (pluginData: Buffer) => {
          return Buffer.from('mysql_native_password_auth_data');
        };
      }
    };
  }

  /**
   * ✅ FIXED: Create connection with auth plugins
   */
  private async createConnection(dbName: string, config: Omit<DatabaseConfig, 'database'>): Promise<mysql.Connection> {
    return mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: dbName,
      multipleStatements: true,
      authPlugins: this.getAuthPlugins(),
    });
  }

  /**
   * ✅ FIXED: Create pool with auth plugins
   */
  private createPool(dbName: string, config: Omit<DatabaseConfig, 'database'>): mysql.Pool {
    return mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      authPlugins: this.getAuthPlugins(),
    });
  }

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
      authPlugins: this.getAuthPlugins(),
    });

    const conn = await this.masterPool.getConnection();
    conn.release();
    console.log(`[MigrationService] ✅ Master connection established: ${config.host}:${config.port}/${config.database || 'N/A'}`);
  }

  private getMasterPool(): mysql.Pool {
    if (!this.masterPool) {
      throw new Error('[MigrationService] Master connection not initialized. Call initializeMasterConnection() first.');
    }
    return this.masterPool;
  }

  /**
   * ✅ FIXED: Run migrations with proper auth
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
      // ✅ Use createPool with auth plugins
      connection = this.createPool(dbName, connectionConfig);

      // Ensure migrations tracking table exists
      await this.ensureMigrationsTable(connection);

      // Get already-executed migration names
      const executedMigrations = await this.getExecutedMigrations(connection);
      console.log(`[MigrationService] Database "${dbName}": ${executedMigrations.size} previously executed migration(s)`);

      for (const migration of migrations) {
        if (executedMigrations.has(migration.name)) {
          console.log(`[MigrationService] ⏭️ Skipping already executed: ${migration.name}`);
          continue;
        }

        try {
          console.log(`[MigrationService] 🔄 Running migration: ${migration.name} on ${dbName}`);
          await connection.query(migration.sql);
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
        }
      }
    } catch (error: any) {
      const errorMsg = `Failed to connect to database "${dbName}": ${error.message}`;
      console.error(`[MigrationService] ❌ ${errorMsg}`);
      result.errors.push(errorMsg);
      result.success = false;
    } finally {
      if (connection) {
        await connection.end().catch(() => { });
      }
    }

    return result;
  }

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
        authPlugins: this.getAuthPlugins(),
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
        await connection.end().catch(() => { });
      }
    }
  }

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
        authPlugins: this.getAuthPlugins(),
      });

      await this.ensureMigrationsTable(connection);
      const executedMigrations = await this.getExecutedMigrations(connection);

      const executedList = Array.from(executedMigrations).reverse().slice(0, count);

      for (const migrationName of executedList) {
        const migration = migrations.find(m => m.name === migrationName);
        if (!migration) {
          console.warn(`[MigrationService] ⚠️ Migration "${migrationName}" not found in list. Skipping.`);
          continue;
        }

        try {
          console.log(`[MigrationService] 🔄 Rolling back migration: ${migrationName} from ${dbName}`);
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
        await connection.end().catch(() => { });
      }
    }

    return result;
  }

  private async ensureMigrationsTable(connection: mysql.Pool): Promise<void> {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  private async getExecutedMigrations(connection: mysql.Pool): Promise<Set<string>> {
    const [rows] = await connection.query('SELECT migration_name FROM migrations ORDER BY id ASC');
    const executed = new Set<string>();
    for (const row of rows as any[]) {
      executed.add(row.migration_name);
    }
    return executed;
  }

  async close(): Promise<void> {
    if (this.masterPool) {
      await this.masterPool.end().catch(() => { });
      this.masterPool = null;
      console.log('[MigrationService] 🔌 Master connection closed');
    }
  }
}

export default MigrationService;