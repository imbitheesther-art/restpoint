import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import slugify from 'slugify';
import { getMainTenantMigrations, getBranchMigrations } from '../../../shared/services/all-service-migrations';
import { MigrationService } from '../../../shared/services/migration-service';
import { getSoftDeleteMigrations } from '../../../shared/services/soft-delete-migrations';
import * as dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

export interface RegisterTenantData {
    tenant_name: string;
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    location?: string;
    country?: string;
    deployment_type?: 'single' | 'multi';
    branches?: Array<{
        branch_name: string;
        branch_location: string;
        branch_phone: string;
        branch_email: string;
    }>;
}

export interface Tenant {
    tenant_id: number;
    tenant_name: string;
    tenant_slug: string;
    db_name: string;
    email: string;
    phone: string | null;
    location: string | null;
    country: string | null;
    logo_url: string | null;
    status: 'active' | 'suspended' | 'deleted';
    subscription_status: 'active' | 'trial' | 'suspended' | 'cancelled';
    subscription_expires_at: Date | null;
    deployment_type: 'single' | 'multi';
    created_at: Date;
    updated_at: Date;
}

export interface BranchInfo {
    branch_id: number;
    branch_name: string;
    branch_slug: string;
    branch_db_name: string;
    branch_location: string | null;
    branch_phone: string | null;
    branch_email: string | null;
    is_active: boolean;
    created_at: Date;
}

// ============================================
// CONFIGURATION HELPERS
// ============================================

function getDbConfig() {
    return {
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'restpoint_user',
        password: process.env.DB_PASSWORD || 'RestPointUser2024',
    };
}

// FIXED: Auth plugins for all connections
// Handles both mysql_native_password and unknown plugins (like auth_gssapi_client)
// that MariaDB may request during the handshake
const AUTH_PLUGINS: any = {
    // Catch-all for unknown auth plugins (e.g., auth_gssapi_client)
    // Falls back to mysql_native_password authentication
    auth_gssapi_client: () => {
        return (pluginData: Buffer) => {
            // Return empty buffer to signal fallback to mysql_native_password
            return Buffer.from([]);
        };
    }
};

// ============================================
// CONNECTION POOL - ✅ FIXED LINE 329
// ============================================

let serverPool: mysql.Pool | null = null;

async function getServerPool(): Promise<mysql.Pool> {
    if (!serverPool) {
        // ✅ FIXED: Add auth plugins to the pool
        serverPool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'restpoint_user',
            password: process.env.DB_PASSWORD || 'RestPointUser2024',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            // ✅ CRITICAL FIX: Auth plugins for MariaDB compatibility
            authPlugins: AUTH_PLUGINS,
        } as any);
        console.log('✅ Tenant service server pool created');

        // Test connection
        try {
            const conn = await serverPool.getConnection();
            console.log('✅ Database connection verified');
            conn.release();
        } catch (error: any) {
            console.error('❌ Database connection failed:', error.message);
            console.error('💡 Check your .env file for correct credentials');
        }
    }
    return serverPool;
}

// ============================================
// HELPERS
// ============================================

function generateSlug(tenantName: string): string {
    const slugifyFn = typeof slugify === 'function' ? slugify : (slugify as any).default;
    // Remove "tenant" prefix if present to avoid duplication
    const cleanedName = tenantName.replace(/^tenant\s+/i, '').trim();
    return slugifyFn(cleanedName, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
        trim: true
    });
}

// ✅ FIXED: getTenantConnection with auth plugins
async function getTenantConnection(dbName: string) {
    return mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'restpoint_user',
        password: process.env.DB_PASSWORD || 'RestPointUser2024',
        database: dbName,
        multipleStatements: true,
        authPlugins: AUTH_PLUGINS,
    } as any);
}

// ✅ Get branch connection with auth plugins
async function getBranchConnection(dbName: string) {
    return mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'restpoint_user',
        password: process.env.DB_PASSWORD || 'RestPointUser2024',
        database: dbName,
        authPlugins: AUTH_PLUGINS,
    } as any);
}

// ============================================
// WEBSOCKET PROGRESS TRACKING
// ============================================

const SOCKET_SERVICE_URL = process.env.SOCKET_SERVICE_URL || 'http://localhost:8010';

async function emitOnboardingProgress(tenantSlug: string, step: string, progress: number, details?: string) {
    try {
        // Use Promise.allSettled to handle multiple concurrent requests
        await Promise.allSettled([
            axios.post(`${SOCKET_SERVICE_URL}/emit/onboarding-progress`, {
                tenantSlug,
                data: {
                    step,
                    progress,
                    details,
                    timestamp: new Date().toISOString()
                }
            }).catch(err => console.warn(`⚠️ Socket emit failed: ${err.message}`))
        ]);
    } catch (error) {
        // Silently fail - progress tracking is optional
    }
}

// ============================================
// CREATE TENANT DATABASE
// ============================================

async function createCompleteTenantDatabase(
    tenantName: string,
    subdomain: string,
    email: string,
    password_hash: string,
    full_name: string,
    phone: string | null,
    country: string | null,
    location: string | null,
    branches: Array<{ branch_name: string; branch_location: string; branch_phone: string; branch_email: string }> | undefined
): Promise<{ dbName: string; branches: Array<{ branch_name: string; branch_slug: string; branch_db_name: string }> }> {
    // ✅ FIXED: Clean database name without "tenant_" prefix showing in UI
    const dbName = subdomain.replace(/-/g, '_');
    const branchData: Array<{ branch_name: string; branch_slug: string; branch_db_name: string }> = [];

    const serverConn = await getServerPool();
    const migrationService = new MigrationService();

    // ✅ Config with auth plugins for migration service
    const dbConfig = {
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'restpoint_user',
        password: process.env.DB_PASSWORD || 'RestPointUser2024',
        authPlugins: AUTH_PLUGINS
    };

    console.log(`📦 Creating tenant database: ${dbName}`);
    await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await emitOnboardingProgress(subdomain, 'Database created', 10, `Tenant database ${dbName} created`);

    // Grant permissions - use string concatenation
    const dbUser = process.env.DB_USER || 'restpoint_user';
    await serverConn.query(`GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${dbUser}'@'%'`);
    await serverConn.query('FLUSH PRIVILEGES');
    console.log(`✅ Database permissions granted for ${dbName}`);
    await emitOnboardingProgress(subdomain, 'Database configured', 15, 'Permissions granted');

    // Run migrations
    const allMigrations = getMainTenantMigrations();
    const totalMigrations = allMigrations.length;
    let completedMigrations = 0;

    // Create a wrapper to track migration progress
    const migrationResult = await migrationService.runTenantMigrations(dbName, allMigrations, dbConfig, (migrationName) => {
        completedMigrations++;
        const progress = 15 + Math.floor((completedMigrations / totalMigrations) * 30);
        emitOnboardingProgress(subdomain, `Running migrations (${completedMigrations}/${totalMigrations})`, progress, migrationName);
    });
    if (!migrationResult.success) {
        console.error(`❌ Migration errors for ${dbName}:`, migrationResult.errors);
        throw new Error(`Failed to create tenant database: ${migrationResult.errors.join(', ')}`);
    }
    console.log(`✅ Tenant database ready: ${migrationResult.migrationsRun.length} migrations executed`);
    await emitOnboardingProgress(subdomain, 'Core migrations complete', 50, `${migrationResult.migrationsRun.length} tables created`);

    // Apply soft delete migrations
    const softDeleteMigrations = getSoftDeleteMigrations();
    const totalSoftDelete = softDeleteMigrations.length;
    let completedSoftDelete = 0;

    const softDeleteResult = await migrationService.runTenantMigrations(dbName, softDeleteMigrations, dbConfig, (migrationName) => {
        completedSoftDelete++;
        const progress = 50 + Math.floor((completedSoftDelete / totalSoftDelete) * 15);
        emitOnboardingProgress(subdomain, `Enabling features (${completedSoftDelete}/${totalSoftDelete})`, progress, migrationName);
    });
    if (!softDeleteResult.success) {
        console.warn(`⚠️ Continuing without soft delete support for some tables`);
    } else {
        console.log(`✅ Soft delete enabled: ${softDeleteResult.migrationsRun.length} tables protected`);
    }

    await emitOnboardingProgress(subdomain, 'Setting up tenant', 70, 'Creating admin user and branches');

    // Connect to tenant DB for seeding
    const tenantConn = await getTenantConnection(dbName);

    try {
        // Insert default settings
        await tenantConn.query(`
            INSERT IGNORE INTO mortuary_settings (setting_key, setting_value) VALUES 
            ('mortuary_name', ?),
            ('subdomain', ?),
            ('country', ?),
            ('timezone', 'Africa/Nairobi'),
            ('currency', 'KES'),
            ('date_format', 'YYYY-MM-DD'),
            ('time_format', '24h')
        `, [tenantName, subdomain, country || 'Kenya']);
        console.log(`✅ Default settings inserted`);
        await emitOnboardingProgress(subdomain, 'Configuring settings', 73, 'Default settings applied');

        // ✅ FIXED: Create branches with clean slugs and separate databases
        const branchList = (branches && branches.length > 0) ? branches : [
            { branch_name: tenantName, branch_location: location || 'Main Location', branch_phone: phone || '', branch_email: email }
        ];

        for (const branch of branchList) {
            // ✅ FIXED: Clean branch slug without timestamp
            const branchSlug = `branch-${generateSlug(branch.branch_name)}`;
            // ✅ NEW: Each branch gets its own database
            const branchDbName = `${dbName}_${generateSlug(branch.branch_name)}`.replace(/-/g, '_');

            // Create branch database
            await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${branchDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            await serverConn.query(`GRANT ALL PRIVILEGES ON \`${branchDbName}\`.* TO '${dbUser}'@'%'`);

            // Run branch migrations
            const branchMigrations = getBranchMigrations();
            const branchMigrationResult = await migrationService.runTenantMigrations(branchDbName, branchMigrations, dbConfig, (migrationName) => {
                console.log(`   📦 Branch migration: ${migrationName}`);
            });

            if (!branchMigrationResult.success) {
                console.error(`❌ Branch migration errors for ${branchDbName}:`, branchMigrationResult.errors);
            } else {
                console.log(`   ✅ Branch database ready: ${branchMigrationResult.migrationsRun.length} migrations executed`);
            }

            // Insert into main tenant's branches table
            await tenantConn.query(
                `INSERT INTO branches (branch_name, branch_slug, branch_db_name, branch_location, branch_phone, branch_email, is_active) 
                 VALUES (?, ?, ?, ?, ?, ?, 1)`,
                [branch.branch_name, branchSlug, branchDbName, branch.branch_location || '', branch.branch_phone || '', branch.branch_email || '']
            );

            branchData.push({
                branch_name: branch.branch_name,
                branch_slug: branchSlug,
                branch_db_name: branchDbName,
            });

            console.log(`✅ Branch "${branch.branch_name}" created (slug: ${branchSlug}, db: ${branchDbName})`);
        }

        // Log activity
        await tenantConn.query(`
            INSERT INTO activity_logs (user_id, action, details)
            VALUES (1, 'TENANT_CREATED', ?)
        `, [`Tenant ${dbName} created with ${branchData.length} branch(es): ${branchData.map(b => b.branch_name).join(', ')}`]);

        console.log(`✅ Tenant setup complete: ${dbName}`);
        console.log(`   📋 Branches: ${branchData.length}`);
        branchData.forEach(b => console.log(`      - ${b.branch_name} (slug: ${b.branch_slug}, db: ${b.branch_db_name})`));

        await emitOnboardingProgress(subdomain, 'Finalizing setup', 95, 'Branch tracking created');
    } finally {
        await tenantConn.end();
    }

    await emitOnboardingProgress(subdomain, 'Complete', 100, 'Tenant setup successful');
    return { dbName, branches: branchData };
}

// ============================================
// TENANT MODEL
// ============================================

export class TenantModel {
    static async registerTenant(data: RegisterTenantData): Promise<{ tenant: Tenant; token: string }> {
        const { tenant_name, email, password, full_name, phone, location, country, deployment_type, branches } = data;

        const subdomain = generateSlug(tenant_name);
        const password_hash = await bcrypt.hash(password, 10);

        const serverConn = await getServerPool();

        // Step 1: Create tracking database
        await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`tenant_tracking\``);

        // Ensure tenants table exists with correct schema
        await serverConn.query(`
            CREATE TABLE IF NOT EXISTS tenant_tracking.tenants (
                tenant_id INT PRIMARY KEY AUTO_INCREMENT,
                tenant_name VARCHAR(255) NOT NULL,
                tenant_slug VARCHAR(255) UNIQUE NOT NULL,
                db_name VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                location TEXT,
                country VARCHAR(100),
                logo_url VARCHAR(500),
                status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
                subscription_status ENUM('active', 'trial', 'suspended', 'cancelled') DEFAULT 'trial',
                subscription_expires_at TIMESTAMP NULL,
                deployment_type ENUM('single', 'multi') DEFAULT 'single',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_deployment_type (deployment_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Add missing columns if they don't exist (for existing databases)
        const [missingColumns] = await serverConn.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'tenant_tracking' 
            AND TABLE_NAME = 'tenants' 
            AND COLUMN_NAME IN ('country', 'deployment_type')
        `);

        const existingColumns = Array.isArray(missingColumns)
            ? missingColumns.map((col: any) => col.COLUMN_NAME)
            : [];

        if (!existingColumns.includes('country')) {
            try {
                await serverConn.query(`ALTER TABLE tenant_tracking.tenants ADD COLUMN country VARCHAR(100) NULL AFTER location`);
            } catch (e) { /* column may already exist */ }
        }

        if (!existingColumns.includes('deployment_type')) {
            try {
                await serverConn.query(`ALTER TABLE tenant_tracking.tenants ADD COLUMN deployment_type ENUM('single', 'multi') DEFAULT 'single' AFTER subscription_expires_at`);
            } catch (e) { /* column may already exist */ }
        }

        // Create branch tracking table
        await serverConn.query(`
            CREATE TABLE IF NOT EXISTS tenant_tracking.branch_tracking (
                branch_tracking_id INT PRIMARY KEY AUTO_INCREMENT,
                tenant_id INT NOT NULL,
                branch_id INT NOT NULL,
                branch_name VARCHAR(255) NOT NULL,
                branch_slug VARCHAR(255) NOT NULL,
                branch_db_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tenant_id) REFERENCES tenant_tracking.tenants(tenant_id) ON DELETE CASCADE,
                INDEX idx_tenant_id (tenant_id),
                INDEX idx_branch_slug (branch_slug)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Step 2: Check if tenant slug exists
        const [existing] = await serverConn.query(
            'SELECT tenant_id FROM tenant_tracking.tenants WHERE tenant_slug = ?',
            [subdomain]
        );
        if (Array.isArray(existing) && existing.length > 0) {
            throw new Error('Tenant slug already exists');
        }

        // Step 3: Create complete tenant
        const { dbName, branches: branchData } = await createCompleteTenantDatabase(
            tenant_name, subdomain, email, password_hash, full_name,
            phone || null, country || null, location || null, branches
        );

        await emitOnboardingProgress(subdomain, 'Registering tenant', 98, 'Saving tenant record');

        // Step 4: Register tenant in tracking table
        // Use deployment_type from request if provided, otherwise infer from branch count
        const finalDeploymentType = deployment_type || ((branches && branches.length > 1) ? 'multi' : 'single');
        const [result] = await serverConn.query(
            `INSERT INTO tenant_tracking.tenants (tenant_name, tenant_slug, db_name, email, phone, location, country, status, subscription_status, deployment_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'trial', ?)`,
            [tenant_name, subdomain, dbName, email, phone || null, location || null, country || null, finalDeploymentType]
        );

        const tenantId = (result as any).insertId;

        // Step 5: Get the created tenant
        const [tenants] = await serverConn.query<mysql.RowDataPacket[]>(
            'SELECT * FROM tenant_tracking.tenants WHERE tenant_id = ?',
            [tenantId]
        );
        const tenantRow = Array.isArray(tenants) && tenants.length > 0 ? tenants[0] : null;
        if (!tenantRow) throw new Error('Failed to create tenant');

        const tenant: Tenant = {
            tenant_id: tenantRow.tenant_id,
            tenant_name: tenantRow.tenant_name,
            tenant_slug: tenantRow.tenant_slug,
            db_name: tenantRow.db_name,
            email: tenantRow.email,
            phone: tenantRow.phone || null,
            location: tenantRow.location || null,
            country: tenantRow.country || null,
            logo_url: tenantRow.logo_url || null,
            status: tenantRow.status || 'active',
            subscription_status: tenantRow.subscription_status || 'trial',
            subscription_expires_at: tenantRow.subscription_expires_at || null,
            deployment_type: tenantRow.deployment_type || 'single',
            created_at: tenantRow.created_at,
            updated_at: tenantRow.updated_at
        };

        // Step 6: Create tenant folder structure
        try {
            const { createTenantFolders, initializeUploadsDirectory } = require('../../global/services/fileStorageService');
            await initializeUploadsDirectory();
            const folderResult = await createTenantFolders(tenant.tenant_slug);
            if (folderResult.success) console.log(`📂 Tenant folders created`);
        } catch (folderError: any) {
            console.warn(`⚠️ Could not create tenant folders: ${folderError.message}`);
        }

        // Step 7: Generate JWT token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { userId: 1, tenantId: tenant.tenant_id, tenantSlug: tenant.tenant_slug, email: email, role: 'admin' },
            process.env.JWT_SECRET || 'RestPointJWTSecret2024ChangeMe',
            { expiresIn: '7d' }
        );

        // Step 8: Insert branch tracking records
        try {
            const tenantDbConn = await getTenantConnection(dbName);
            try {
                const [branchRows] = await tenantDbConn.query(
                    'SELECT branch_id, branch_name, branch_slug, branch_db_name FROM branches WHERE is_active = TRUE'
                );
                const branches = branchRows as any[];

                for (const branch of branches) {
                    await serverConn.query(`
                        INSERT INTO tenant_tracking.branch_tracking 
                        (tenant_id, branch_id, branch_name, branch_slug, branch_db_name) 
                        VALUES (?, ?, ?, ?, ?)
                    `, [tenantId, branch.branch_id, branch.branch_name, branch.branch_slug, branch.branch_db_name || null]);
                }
                console.log(`✅ Branch tracking records created: ${branches.length} branches tracked`);
            } finally {
                await tenantDbConn.end();
            }
        } catch (trackingError: any) {
            console.warn(`⚠️ Could not create branch tracking records: ${trackingError.message}`);
        }

        // Step 9: Create admin user in tenant_tracking database for authentication
        // This allows auth service to find users across all tenants
        try {
            await serverConn.query(`
                CREATE TABLE IF NOT EXISTS tenant_tracking.users (
                    user_id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    phone VARCHAR(20),
                    role ENUM('admin', 'manager', 'staff', 'user') DEFAULT 'admin',
                    tenant_id INT NOT NULL,
                    branch_id INT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    is_verified BOOLEAN DEFAULT TRUE,
                    last_login_at TIMESTAMP NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_email (email),
                    INDEX idx_tenant_id (tenant_id),
                    INDEX idx_role (role),
                    FOREIGN KEY (tenant_id) REFERENCES tenant_tracking.tenants(tenant_id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            await serverConn.query(`
                INSERT INTO tenant_tracking.users (email, password_hash, full_name, phone, role, tenant_id, is_verified, is_active)
                VALUES (?, ?, ?, ?, 'admin', ?, 1, 1)
            `, [email, password_hash, full_name, phone || '', tenantId]);
            console.log(`✅ Admin user created in tenant_tracking for authentication`);
            await emitOnboardingProgress(subdomain, 'Creating admin user', 90, `Admin user ${email} created`);
        } catch (userError: any) {
            console.warn(`⚠️ Could not create tenant_tracking user: ${userError.message}`);
        }

        // Step 10: Create admin user in tenant database for login control
        // Users are stored in the tenant database, auth service will query tenant_tracking.tenants first,
        // then connect to the tenant database to verify credentials
        try {
            const tenantConnForUser = await getTenantConnection(dbName);
            try {
                await tenantConnForUser.query(`
                    INSERT INTO users (email, password_hash, full_name, phone, role, branch_id, is_verified, is_active)
                    VALUES (?, ?, ?, ?, 'admin', NULL, 1, 1)
                `, [email, password_hash, full_name, phone || '']);
                console.log(`✅ Admin user created in tenant database for login control`);
            } finally {
                await tenantConnForUser.end();
            }
        } catch (userError: any) {
            console.warn(`⚠️ Could not create admin user: ${userError.message}`);
        }

        console.log(`✅ Tenant registered: ${tenant.tenant_name} (${tenant.tenant_slug})`);
        console.log(`📁 Main DB: ${tenant.db_name}`);
        console.log(`🌍 Country: ${tenant.country || 'Not specified'}`);
        console.log(`🏢 Branches: ${branchData.length}`);
        branchData.forEach(b => console.log(`   📋 ${b.branch_name} (slug: ${b.branch_slug}, db: ${b.branch_db_name})`));

        await emitOnboardingProgress(subdomain, 'Setup complete', 100, 'Redirecting to dashboard');

        return { tenant, token };
    }

    // ─── Branch Operations ──────────────────────────────────────────────

    static async getBranches(tenantDbName: string): Promise<BranchInfo[]> {
        const conn = await getTenantConnection(tenantDbName);
        try {
            const [rows] = await conn.query(
                'SELECT branch_id, branch_name, branch_slug, branch_db_name, branch_location, branch_phone, branch_email, is_active, created_at FROM branches WHERE is_active = TRUE ORDER BY branch_name'
            );
            return (rows as any[]).map((r: any) => ({
                branch_id: r.branch_id,
                branch_name: r.branch_name,
                branch_slug: r.branch_slug,
                branch_db_name: r.branch_db_name,
                branch_location: r.branch_location || null,
                branch_phone: r.branch_phone || null,
                branch_email: r.branch_email || null,
                is_active: !!r.is_active,
                created_at: r.created_at
            }));
        } finally {
            await conn.end();
        }
    }

    static async addBranch(tenantDbName: string, branch: {
        branch_name: string;
        branch_location: string;
        branch_phone: string;
        branch_email: string;
    }): Promise<{ branch_id: number; branch_db_name: string }> {
        const serverConn = await getServerPool();
        const migrationService = new MigrationService();

        const branchSlug = `branch-${generateSlug(branch.branch_name)}`;
        const branchDbName = `${tenantDbName.replace('tenant_', '')}_${generateSlug(branch.branch_name)}`.replace(/-/g, '_');

        // Create branch database
        await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${branchDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

        // Run branch migrations
        const branchMigrations = getBranchMigrations();
        const dbConfig = {
            host: process.env.DB_HOST || '127.0.0.1',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'restpoint_user',
            password: process.env.DB_PASSWORD || 'RestPointUser2024',
            authPlugins: AUTH_PLUGINS
        };

        let completedBranchMigrations = 0;
        const branchResult = await migrationService.runTenantMigrations(branchDbName, branchMigrations, dbConfig, (migrationName) => {
            completedBranchMigrations++;
            console.log(`   📦 Branch migration ${completedBranchMigrations}/${branchMigrations.length}: ${migrationName}`);
        });
        if (!branchResult.success) {
            console.error(`❌ Branch migration errors for ${branchDbName}:`, branchResult.errors);
        }

        // Insert into main tenant's branches table
        const conn = await getTenantConnection(tenantDbName);
        try {
            const [result] = await conn.query(
                `INSERT INTO branches (branch_name, branch_slug, branch_db_name, branch_location, branch_phone, branch_email, is_active) 
                 VALUES (?, ?, ?, ?, ?, ?, 1)`,
                [branch.branch_name, branchSlug, branchDbName, branch.branch_location || '', branch.branch_phone || '', branch.branch_email || '']
            );
            return { branch_id: (result as any).insertId, branch_db_name: branchDbName };
        } finally {
            await conn.end();
        }
    }

    // ─── Base Charges Operations ────────────────────────────────────────

    static async getBaseCharges(branchDbName: string): Promise<any[]> {
        const conn = await getBranchConnection(branchDbName);
        try {
            const [rows] = await conn.query('SELECT * FROM base_charges ORDER BY charge_category');
            return rows as any[];
        } finally {
            await conn.end();
        }
    }

    static async upsertBaseCharge(branchDbName: string, charge: {
        charge_id?: number;
        charge_name: string;
        charge_description: string;
        amount: number;
        charge_category: string;
        is_mandatory: boolean;
    }): Promise<any> {
        const conn = await getBranchConnection(branchDbName);
        try {
            if (charge.charge_id) {
                await conn.query(
                    'UPDATE base_charges SET charge_name=?, charge_description=?, amount=?, charge_category=?, is_mandatory=? WHERE charge_id=?',
                    [charge.charge_name, charge.charge_description, charge.amount, charge.charge_category, charge.is_mandatory, charge.charge_id]
                );
                return charge.charge_id;
            } else {
                const [result] = await conn.query(
                    'INSERT INTO base_charges (charge_name, charge_description, amount, charge_category, is_mandatory) VALUES (?, ?, ?, ?, ?)',
                    [charge.charge_name, charge.charge_description, charge.amount, charge.charge_category, charge.is_mandatory]
                );
                return (result as any).insertId;
            }
        } finally {
            await conn.end();
        }
    }

    // ─── Marketplace Operations ─────────────────────────────────────────

    static async getMarketplaceProducts(branchDbName: string): Promise<any[]> {
        const conn = await getBranchConnection(branchDbName);
        try {
            const [rows] = await conn.query('SELECT * FROM marketplace_products WHERE is_available = TRUE ORDER BY created_at DESC');
            return rows as any[];
        } finally {
            await conn.end();
        }
    }

    static async createOrder(branchDbName: string, order: {
        customer_name: string;
        customer_phone: string;
        customer_email?: string;
        deceased_id?: number;
        items: Array<{ product_id: number; quantity: number; unit_price: number }>;
        notes?: string;
    }): Promise<number> {
        const conn = await getBranchConnection(branchDbName);
        try {
            const totalAmount = order.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
            const [result] = await conn.query(
                `INSERT INTO marketplace_orders (customer_name, customer_phone, customer_email, deceased_id, total_amount, notes, order_status)
                 VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
                [order.customer_name, order.customer_phone, order.customer_email || null, order.deceased_id || null, totalAmount, order.notes || null]
            );
            const orderId = (result as any).insertId;
            for (const item of order.items) {
                await conn.query(
                    'INSERT INTO marketplace_order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
                    [orderId, item.product_id, item.quantity, item.unit_price]
                );
            }
            return orderId;
        } finally {
            await conn.end();
        }
    }

    // ─── Tenant Lookup Methods ──────────────────────────────────────────

    static async findBySubdomain(slug: string): Promise<Tenant | null> {
        const serverConn = await getServerPool();
        const [tenants] = await serverConn.query<mysql.RowDataPacket[]>(
            'SELECT * FROM tenant_tracking.tenants WHERE tenant_slug = ? AND status = "active"',
            [slug]
        );
        const tenantRow = Array.isArray(tenants) && tenants.length > 0 ? tenants[0] : null;
        if (!tenantRow) return null;
        return {
            tenant_id: tenantRow.tenant_id,
            tenant_name: tenantRow.tenant_name,
            tenant_slug: tenantRow.tenant_slug,
            db_name: tenantRow.db_name,
            email: tenantRow.email,
            phone: tenantRow.phone || null,
            location: tenantRow.location || null,
            country: tenantRow.country || null,
            logo_url: tenantRow.logo_url || null,
            status: tenantRow.status || 'active',
            subscription_status: tenantRow.subscription_status || 'trial',
            subscription_expires_at: tenantRow.subscription_expires_at || null,
            deployment_type: tenantRow.deployment_type || 'single',
            created_at: tenantRow.created_at,
            updated_at: tenantRow.updated_at
        };
    }

    static async findById(tenantId: number): Promise<Tenant | null> {
        const serverConn = await getServerPool();
        const [tenants] = await serverConn.query<mysql.RowDataPacket[]>(
            'SELECT * FROM tenant_tracking.tenants WHERE tenant_id = ?',
            [tenantId]
        );
        const tenantRow = Array.isArray(tenants) && tenants.length > 0 ? tenants[0] : null;
        if (!tenantRow) return null;
        return {
            tenant_id: tenantRow.tenant_id,
            tenant_name: tenantRow.tenant_name,
            tenant_slug: tenantRow.tenant_slug,
            db_name: tenantRow.db_name,
            email: tenantRow.email,
            phone: tenantRow.phone || null,
            location: tenantRow.location || null,
            country: tenantRow.country || null,
            logo_url: tenantRow.logo_url || null,
            status: tenantRow.status || 'active',
            subscription_status: tenantRow.subscription_status || 'trial',
            subscription_expires_at: tenantRow.subscription_expires_at || null,
            deployment_type: tenantRow.deployment_type || 'single',
            created_at: tenantRow.created_at,
            updated_at: tenantRow.updated_at
        };
    }

    static async findByEmail(email: string): Promise<Tenant | null> {
        const serverConn = await getServerPool();
        const [tenants] = await serverConn.query<mysql.RowDataPacket[]>(
            'SELECT * FROM tenant_tracking.tenants WHERE email = ? AND status = "active"',
            [email]
        );
        const tenantRow = Array.isArray(tenants) && tenants.length > 0 ? tenants[0] : null;
        if (!tenantRow) return null;
        return {
            tenant_id: tenantRow.tenant_id,
            tenant_name: tenantRow.tenant_name,
            tenant_slug: tenantRow.tenant_slug,
            db_name: tenantRow.db_name,
            email: tenantRow.email,
            phone: tenantRow.phone || null,
            location: tenantRow.location || null,
            country: tenantRow.country || null,
            logo_url: tenantRow.logo_url || null,
            status: tenantRow.status || 'active',
            subscription_status: tenantRow.subscription_status || 'trial',
            subscription_expires_at: tenantRow.subscription_expires_at || null,
            deployment_type: tenantRow.deployment_type || 'single',
            created_at: tenantRow.created_at,
            updated_at: tenantRow.updated_at
        };
    }

    static async updateStatus(tenantId: number, status: 'active' | 'suspended' | 'deleted'): Promise<void> {
        const serverConn = await getServerPool();
        await serverConn.query(
            'UPDATE tenant_tracking.tenants SET status = ?, updated_at = NOW() WHERE tenant_id = ?',
            [status, tenantId]
        );
    }

    static async getAllTenants(): Promise<Tenant[]> {
        const serverConn = await getServerPool();
        const [tenants] = await serverConn.query<mysql.RowDataPacket[]>(
            'SELECT * FROM tenant_tracking.tenants ORDER BY created_at DESC'
        );
        return (tenants || []).map((tenantRow: any) => ({
            tenant_id: tenantRow.tenant_id,
            tenant_name: tenantRow.tenant_name,
            tenant_slug: tenantRow.tenant_slug,
            db_name: tenantRow.db_name,
            email: tenantRow.email,
            phone: tenantRow.phone || null,
            location: tenantRow.location || null,
            country: tenantRow.country || null,
            logo_url: tenantRow.logo_url || null,
            status: tenantRow.status || 'active',
            subscription_status: tenantRow.subscription_status || 'trial',
            subscription_expires_at: tenantRow.subscription_expires_at || null,
            deployment_type: tenantRow.deployment_type || 'single',
            created_at: tenantRow.created_at,
            updated_at: tenantRow.updated_at
        }));
    }

    static async getTenantDatabase(tenantId: number): Promise<mysql.Connection | null> {
        const tenant = await this.findById(tenantId);
        if (!tenant) return null;
        return getTenantConnection(tenant.db_name);
    }

    static async getBranchDbName(tenantDbName: string, branchSlug: string): Promise<string | null> {
        const conn = await getTenantConnection(tenantDbName);
        try {
            const [rows] = await conn.query(
                'SELECT branch_db_name FROM branches WHERE branch_slug = ? AND is_active = TRUE LIMIT 1',
                [branchSlug]
            );
            const list = rows as any[];
            return list.length > 0 ? list[0].branch_db_name : null;
        } finally {
            await conn.end();
        }
    }

    // ─── Portal Login ─────────────────────────────────────────────────────

    static async findDeceasedByPhone(phone: string): Promise<{
        tenant: Tenant;
        deceased: any;
        branch: any;
    } | null> {
        const allTenants = await this.getAllTenants();

        for (const tenant of allTenants) {
            try {
                const mainConn = await getTenantConnection(tenant.db_name);

                const [branchRows] = await mainConn.query(
                    'SELECT branch_db_name, branch_name, branch_slug FROM branches WHERE is_active = TRUE'
                );
                await mainConn.end();

                const branches = branchRows as any[];

                for (const branch of branches) {
                    try {
                        const branchConn = await getBranchConnection(branch.branch_db_name);

                        const [rows] = await branchConn.query(
                            'SELECT d.* FROM deceased d WHERE d.next_of_kin_phone = ? LIMIT 1',
                            [phone]
                        );
                        await branchConn.end();

                        const deceasedArray = rows as any[];
                        if (deceasedArray.length > 0) {
                            return {
                                tenant,
                                deceased: deceasedArray[0],
                                branch: { branch_name: branch.branch_name, branch_slug: branch.branch_slug, branch_db_name: branch.branch_db_name }
                            };
                        }
                    } catch (err) {
                        continue;
                    }
                }
            } catch (err) {
                continue;
            }
        }
        return null;
    }
}