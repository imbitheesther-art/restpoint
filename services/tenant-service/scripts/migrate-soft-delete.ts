/**
 * @file services/tenant-service/scripts/migrate-soft-delete.ts
 * SOFT DELETE MIGRATION SCRIPT FOR EXISTING TENANTS
 * 
 * This script adds soft delete columns to all tables in existing tenant databases.
 * Run this script when deploying the soft delete module to production.
 * 
 * Usage:
 *   npm run migrate:soft-delete
 *   or
 *   npx ts-node services/tenant-service/scripts/migrate-soft-delete.ts
 * 
 * Options:
 *   --tenant=<slug>     Migrate specific tenant only
 *   --dry-run           Show what would be migrated without executing
 *   --force             Skip confirmation prompts
 */

import * as mysql from 'mysql2/promise';
import { getSoftDeleteMigrations } from '../../../shared/services/soft-delete-migrations';
import { MigrationService } from '../../../shared/services/migration-service';

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const SPECIFIC_TENANT = process.argv.find(arg => arg.startsWith('--tenant='))?.split('=')[1];

const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
};

interface TenantInfo {
    tenant_id: number;
    tenant_name: string;
    tenant_slug: string;
    db_name: string;
}

async function getAllTenants(): Promise<TenantInfo[]> {
    const conn = await mysql.createConnection({
        ...connectionConfig,
        database: 'tenant_tracking'
    });

    try {
        const [rows] = await conn.query(
            'SELECT tenant_id, tenant_name, tenant_slug, db_name FROM tenants WHERE status = "active" ORDER BY created_at DESC'
        );
        return rows as TenantInfo[];
    } finally {
        await conn.end();
    }
}

async function getTenantBySlug(slug: string): Promise<TenantInfo | null> {
    const conn = await mysql.createConnection({
        ...connectionConfig,
        database: 'tenant_tracking'
    });

    try {
        const [rows] = await conn.query(
            'SELECT tenant_id, tenant_name, tenant_slug, db_name FROM tenants WHERE tenant_slug = ? AND status = "active" LIMIT 1',
            [slug]
        );
        const tenantList = rows as TenantInfo[];
        return tenantList.length > 0 ? tenantList[0] : null;
    } finally {
        await conn.end();
    }
}

async function migrateTenant(tenant: TenantInfo): Promise<{ success: boolean; message: string }> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Migrating tenant: ${tenant.tenant_name} (${tenant.tenant_slug})`);
    console.log(`Database: ${tenant.db_name}`);
    console.log('='.repeat(60));

    if (DRY_RUN) {
        console.log('🔍 DRY RUN MODE - No changes will be made');
    }

    try {
        // Verify database exists
        const serverConn = await mysql.createConnection({
            ...connectionConfig,
            multipleStatements: true
        });

        try {
            const [databases] = await serverConn.query(
                `SHOW DATABASES WHERE \`Database\` = ?`,
                [tenant.db_name]
            );
            const dbList = databases as any[];

            if (dbList.length === 0) {
                return {
                    success: false,
                    message: `Database ${tenant.db_name} not found`
                };
            }

            console.log(`✅ Database exists: ${tenant.db_name}`);

            // Get soft delete migrations
            const softDeleteMigrations = getSoftDeleteMigrations();
            console.log(`📋 Found ${softDeleteMigrations.length} soft delete migrations to apply`);

            if (DRY_RUN) {
                console.log('\nMigrations that would be applied:');
                softDeleteMigrations.forEach((migration, index) => {
                    console.log(`  ${index + 1}. ${migration.name}`);
                });
                return {
                    success: true,
                    message: `DRY RUN: ${softDeleteMigrations.length} migrations ready to apply`
                };
            }

            // Run migrations
            const migrationService = new MigrationService();
            const result = await migrationService.runTenantMigrations(
                tenant.db_name,
                softDeleteMigrations,
                connectionConfig
            );

            if (!result.success) {
                console.error(`❌ Migration errors:`, result.errors);
                return {
                    success: false,
                    message: `Failed with ${result.errors.length} errors: ${result.errors.join(', ')}`
                };
            }

            console.log(`✅ Successfully applied ${result.migrationsRun.length} migrations`);
            result.migrationsRun.forEach(name => {
                console.log(`   ✓ ${name}`);
            });

            // Verify soft delete columns were added
            const verifyConn = await mysql.createConnection({
                ...connectionConfig,
                database: tenant.db_name
            });

            try {
                const [tables] = await verifyConn.query('SHOW TABLES');
                const tableList = tables as any[];

                let verifiedCount = 0;
                for (const tableRow of tableList) {
                    const tableName = Object.values(tableRow)[0] as string;

                    const [columns] = await verifyConn.query(`
                        SELECT COUNT(*) as count 
                        FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_SCHEMA = ? 
                        AND TABLE_NAME = ? 
                        AND COLUMN_NAME IN ('is_deleted', 'deleted_at', 'deleted_by')
                    `, [tenant.db_name, tableName]);

                    const columnResult = (columns as any[])[0];
                    if (columnResult.count === 3) {
                        verifiedCount++;
                    }
                }

                console.log(`\n✅ Verification: ${verifiedCount}/${tableList.length} tables have soft delete columns`);

                return {
                    success: true,
                    message: `Successfully migrated ${verifiedCount} tables`
                };
            } finally {
                await verifyConn.end();
            }

        } finally {
            await serverConn.end();
        }

    } catch (error: any) {
        console.error(`❌ Error migrating ${tenant.tenant_slug}:`, error.message);
        return {
            success: false,
            message: error.message
        };
    }
}

async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('SOFT DELETE MIGRATION TOOL');
    console.log('='.repeat(60));

    if (DRY_RUN) {
        console.log('⚠️  DRY RUN MODE - No actual changes will be made\n');
    }

    // Get list of tenants to migrate
    let tenants: TenantInfo[];

    if (SPECIFIC_TENANT) {
        console.log(`🔍 Looking for specific tenant: ${SPECIFIC_TENANT}`);
        const tenant = await getTenantBySlug(SPECIFIC_TENANT);
        if (!tenant) {
            console.error(`❌ Tenant not found: ${SPECIFIC_TENANT}`);
            process.exit(1);
        }
        tenants = [tenant];
    } else {
        console.log('📋 Fetching all active tenants...');
        tenants = await getAllTenants();
    }

    if (tenants.length === 0) {
        console.log('⚠️  No tenants found to migrate');
        process.exit(0);
    }

    console.log(`Found ${tenants.length} tenant(s) to migrate\n`);

    // Show tenants
    tenants.forEach((tenant, index) => {
        console.log(`  ${index + 1}. ${tenant.tenant_name} (${tenant.tenant_slug}) - ${tenant.db_name}`);
    });

    // Confirm unless force flag
    if (!DRY_RUN && !FORCE) {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise<string>((resolve) => {
            rl.question('\n  This will modify tenant databases. Continue? (yes/no): ', resolve);
        });

        rl.close();

        if (answer.toLowerCase() !== 'yes') {
            console.log('❌ Migration cancelled by user');
            process.exit(0);
        }
    }

    // Migrate each tenant
    const results = {
        success: 0,
        failed: 0,
        total: tenants.length
    };

    for (const tenant of tenants) {
        const result = await migrateTenant(tenant);

        if (result.success) {
            results.success++;
        } else {
            results.failed++;
            console.error(`❌ Failed: ${result.message}`);
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total tenants: ${results.total}`);
    console.log(`✅ Successful: ${results.success}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log('='.repeat(60) + '\n');

    if (results.failed > 0) {
        console.log('⚠️  Some migrations failed. Check the logs above for details.');
        process.exit(1);
    } else {
        console.log('✅ All migrations completed successfully!');
        process.exit(0);
    }
}

// Run the script
main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});