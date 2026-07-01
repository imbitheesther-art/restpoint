/**
 * Script to update existing tenant databases with missing columns
 * This fixes the "Unknown column 'date_of_birth'" error
 * 
 * Usage: npx ts-node services/tenant-service/scripts/update-existing-tenants.ts
 */

import * as mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// @ts-ignore - authPlugins type issue with mysql2
const MASTER_CONFIG: any = {
    host: process.env.MASTER_DB_HOST || 'localhost',
    user: process.env.MASTER_DB_USER || 'root',
    password: process.env.MASTER_DB_PASSWORD || '',
    database: process.env.MASTER_DB_NAME || 'tenant_tracking',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    authPlugins: {
        caching_sha2_password: () => Buffer.from('')
    }
};

interface Tenant {
    id: number;
    slug: string;
    db_name: string;
    organization_name: string;
    is_active: boolean;
}

async function updateTenantDatabases() {
    console.log('========================================');
    console.log('🔧 Updating Existing Tenant Databases');
    console.log('========================================\n');

    let masterConnection: mysql.Pool | null = null;

    try {
        // Connect to master database
        console.log('📡 Connecting to master database...');
        masterConnection = await mysql.createPool(MASTER_CONFIG);
        console.log('✅ Connected to master database\n');

        // Get all active tenants
        console.log('📋 Fetching all active tenants...');
        const result = await masterConnection.query<any[]>(
            'SELECT id, slug, db_name, organization_name, is_active FROM organizations WHERE is_active = TRUE'
        );
        const tenants = result[0] as any[];

        if (!tenants || tenants.length === 0) {
            console.log('⚠️  No active tenants found');
            return;
        }

        console.log(`✅ Found ${tenants.length} active tenant(s)\n`);

        // Update each tenant database
        let successCount = 0;
        let failCount = 0;

        for (const tenant of tenants) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`🏢 Processing: ${tenant.organization_name} (${tenant.slug})`);
            console.log(`   Database: ${tenant.db_name}`);
            console.log('='.repeat(60));

            try {
                // Create tenant-specific connection
                const tenantConfig = {
                    ...MASTER_CONFIG,
                    database: tenant.db_name,
                    authPlugins: {
                        caching_sha2_password: () => Buffer.from('')
                    }
                };

                const tenantConnection = await mysql.createPool(tenantConfig);

                try {
                    // Check if deceased table exists
                    const [tableCheck] = await tenantConnection.query<any[]>(
                        `SELECT COUNT(*) as count 
             FROM INFORMATION_SCHEMA.TABLES 
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'deceased'`,
                        [tenant.db_name]
                    );

                    const tableExists = tableCheck[0]?.count > 0;

                    if (!tableExists) {
                        console.log(`   ⏭️  Deceased table does not exist - skipping (will be created on first use)`);
                        await tenantConnection.end();
                        continue;
                    }

                    console.log(`   🔍 Checking deceased table schema...`);

                    // Check for missing columns
                    const [columns] = await tenantConnection.query<any[]>(
                        `SELECT COLUMN_NAME 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = 'deceased'
             ORDER BY ORDINAL_POSITION`,
                        [tenant.db_name]
                    );

                    const existingColumns = new Set(columns.map(col => col.COLUMN_NAME));
                    console.log(`   📊 Found ${existingColumns.size} existing columns`);

                    // Required columns and their definitions
                    const requiredColumns: { [key: string]: string } = {
                        'date_of_birth': 'DATE NULL AFTER date_admitted',
                        'date_of_death': 'DATE NULL AFTER date_of_birth',
                        'date_registered': 'DATETIME NULL AFTER date_of_death',
                        'gender': 'VARCHAR(20) NULL AFTER full_name',
                        'place_of_death': 'VARCHAR(255) NULL AFTER gender',
                        'county': 'VARCHAR(100) NULL AFTER place_of_death',
                        'national_id': 'VARCHAR(50) NULL AFTER county',
                        'location': 'TEXT NULL AFTER national_id',
                        'portal_slug': 'VARCHAR(255) UNIQUE NULL AFTER location',
                        'status': 'VARCHAR(50) DEFAULT \'active\' AFTER created_by',
                        'total_mortuary_charge': 'DECIMAL(10,2) NULL AFTER status',
                        'currency': 'VARCHAR(3) DEFAULT \'KES\' AFTER total_mortuary_charge',
                        'burial_type': 'VARCHAR(50) NULL AFTER currency',
                        'dispatch_date': 'DATE NULL AFTER burial_type',
                        'extra_charges_amount': 'DECIMAL(10,2) DEFAULT 0 AFTER dispatch_date',
                        'next_of_kin_count': 'INT DEFAULT 0 AFTER extra_charges_amount',
                        'is_embalmed': 'BOOLEAN DEFAULT FALSE AFTER next_of_kin_count',
                        'is_deleted': 'BOOLEAN DEFAULT FALSE AFTER is_embalmed'
                    };

                    // Find missing columns
                    const missingColumns = Object.keys(requiredColumns).filter(
                        col => !existingColumns.has(col)
                    );

                    if (missingColumns.length === 0) {
                        console.log(`   ✅ Schema is up to date - all required columns exist`);
                        await tenantConnection.end();
                        successCount++;
                        continue;
                    }

                    console.log(`   ⚠️  Missing ${missingColumns.length} column(s): ${missingColumns.join(', ')}`);
                    console.log(`   🔧 Adding missing columns...`);

                    // Add missing columns
                    const alterCommands = missingColumns.map(col =>
                        `ADD COLUMN ${col} ${requiredColumns[col]}`
                    );

                    const alterSQL = `ALTER TABLE deceased ${alterCommands.join(', ')}`;
                    await tenantConnection.query(alterSQL);

                    console.log(`   ✅ Successfully added ${missingColumns.length} column(s) to deceased table`);

                    // Verify the update
                    const [updatedColumns] = await tenantConnection.query<any[]>(
                        `SELECT COLUMN_NAME 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = 'deceased'
             ORDER BY ORDINAL_POSITION`,
                        [tenant.db_name]
                    );

                    console.log(`   📊 Updated table now has ${updatedColumns.length} columns`);

                    await tenantConnection.end();
                    successCount++;

                } catch (error: any) {
                    console.error(`   ❌ Error updating database: ${error.message}`);
                    if (error.code === 'ER_BAD_FIELD_ERROR') {
                        console.error(`   💡 Tip: The column might already exist or the table structure is different`);
                    }
                    await tenantConnection.end();
                    failCount++;
                }

            } catch (error: any) {
                console.error(`   ❌ Failed to connect to tenant database: ${error.message}`);
                failCount++;
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 UPDATE SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Successfully updated: ${successCount} tenant(s)`);
        console.log(`❌ Failed: ${failCount} tenant(s)`);
        console.log(`📋 Total processed: ${tenants.length} tenant(s)`);
        console.log('='.repeat(60));

        if (successCount > 0) {
            console.log('\n🎉 Update completed! All tenant databases are now up to date.');
            console.log('💡 You can now test the deceased registration feature.');
        }

        if (failCount > 0) {
            console.log('\n⚠️  Some tenants failed to update. Please check the errors above.');
        }

    } catch (error: any) {
        console.error('\n❌ Fatal error:', error.message);
        console.error(error);
    } finally {
        if (masterConnection) {
            await masterConnection.end();
            console.log('\n📡 Disconnected from master database');
        }
    }
}

// Run the update
updateTenantDatabases()
    .then(() => {
        console.log('\n✅ Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });