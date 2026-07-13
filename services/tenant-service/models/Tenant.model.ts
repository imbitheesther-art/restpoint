import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import slugify from 'slugify';
import { getMainTenantMigrations, getBranchMigrations, getSingleTenantMigrations, getAllTenantMigrations } from '../../../shared/services/all-service-migrations';
import { MigrationService } from '../../../shared/services/migration-service';
import * as dotenv from 'dotenv';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

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
// CONNECTION POOL
// ============================================

let serverPool: mysql.Pool | null = null;

async function getServerPool(): Promise<mysql.Pool> {
    if (!serverPool) {
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
            authPlugins: AUTH_PLUGINS,
        } as any);


        try {
            const conn = await serverPool.getConnection();

            conn.release();
        } catch (error: any) {
            console.error(' Database connection failed:', error.message);
            console.error(' Check your .env file for correct credentials');
        }
    }
    return serverPool;
}

// ============================================
// HELPERS
// ============================================

function generateSlug(tenantName: string): string {
    const slugifyFn = typeof slugify === 'function' ? slugify : (slugify as any).default;
    const cleanedName = tenantName.replace(/^tenant\s+/i, '').trim();
    return slugifyFn(cleanedName, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
        trim: true
    });
}

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
// UPLOAD DIRECTORY CREATION
// ============================================

const UPLOAD_SUBDIRS = [
    'logos',
    'employees',
    'chemicals',
    'documents',
    'images',
    'deceased',
    'receipts',
    'reports',
    'contracts',
    'signatures'
];

async function createTenantUploadDirectories(tenantSlug: string): Promise<void> {
    const baseDir = path.join(process.cwd(), 'uploads', 'tenants', tenantSlug);

    // Create base tenant directory
    fs.mkdirSync(baseDir, { recursive: true });
    console.log(`📂 Created base upload directory: ${baseDir}`);

    // Create all subdirectories
    for (const subdir of UPLOAD_SUBDIRS) {
        const dirPath = path.join(baseDir, subdir);
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`   📁 Created: ${subdir}/`);
    }

    // Create .gitkeep files to ensure empty directories are tracked
    for (const subdir of UPLOAD_SUBDIRS) {
        const gitkeepPath = path.join(baseDir, subdir, '.gitkeep');
        if (!fs.existsSync(gitkeepPath)) {
            fs.writeFileSync(gitkeepPath, '');
        }
    }

    console.log(`✅ All upload directories created for tenant: ${tenantSlug}`);
}

// ============================================
// CREATE TENANT DATABASE
// ============================================

async function createCompleteTenantDatabase(
    tenantName: string,
    dbName: string,
    email: string,
    password_hash: string,
    full_name: string,
    phone: string | null,
    country: string | null,
    location: string | null,
    branches: Array<{ branch_name: string; branch_location: string; branch_phone: string; branch_email: string }> | undefined,
    deploymentType: 'single' | 'multi'
): Promise<{ dbName: string; branches: Array<{ branch_name: string; branch_slug: string; branch_db_name: string }> }> {
    const serverConn = await getServerPool();
    const migrationService = new MigrationService();

    const dbConfig = {
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'restpoint_user',
        password: process.env.DB_PASSWORD || 'RestPointUser2024',
        authPlugins: AUTH_PLUGINS
    };

    const dbUser = process.env.DB_USER || 'restpoint_user';

    const branchList = (branches && branches.length > 0) ? branches : [
        { branch_name: tenantName, branch_location: location || 'Main Location', branch_phone: phone || '', branch_email: email }
    ];

    const subdomain = dbName;
    const firstBranch = branchList[0];
    const branchData: Array<{ branch_name: string; branch_slug: string; branch_db_name: string }> = [];

    console.log(`📦 Creating primary database: ${dbName}`);
    await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await serverConn.query(`GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${dbUser}'@'%'`);
    await emitOnboardingProgress(subdomain, 'Database created', 10, `Primary database ${dbName} created`);

    // ============================================================
    // FIX: ALL migrations run on the PRIMARY database
    // ============================================================
    // For single-tenant: use getSingleTenantMigrations() (no Workshop)
    // For multi-tenant MAIN branch: use getMainTenantMigrations() (includes Workshop)
    // For multi-tenant sub-branches: use getBranchMigrations() (no Workshop)

    const isMultiTenant = deploymentType === 'multi';
    const isFirstBranch = true; // Primary DB is always the first/main branch

    let primaryMigrations;
    if (isMultiTenant && isFirstBranch) {
        // MAIN branch in multi-tenant: ALL migrations including Workshop
        primaryMigrations = getMainTenantMigrations();
        console.log(`📋 Using MAIN branch migrations (includes Workshop) for: ${dbName}`);
    } else if (isMultiTenant && !isFirstBranch) {
        // Sub-branch in multi-tenant: ALL migrations EXCEPT Workshop
        primaryMigrations = getBranchMigrations();
        console.log(`📋 Using sub-branch migrations (no Workshop) for: ${dbName}`);
    } else {
        // Single tenant: ALL migrations EXCEPT Workshop
        primaryMigrations = getSingleTenantMigrations();
        console.log(`📋 Using single-tenant migrations (no Workshop) for: ${dbName}`);
    }

    const totalMigrations = primaryMigrations.length;
    let completedMigrations = 0;

    const migrationResult = await migrationService.runTenantMigrations(dbName, primaryMigrations, dbConfig, (migrationName) => {
        completedMigrations++;
        const progress = 15 + Math.floor((completedMigrations / totalMigrations) * 30);
        emitOnboardingProgress(subdomain, `Running migrations (${completedMigrations}/${totalMigrations})`, progress, migrationName);
    });
    if (!migrationResult.success) {
        console.error(`❌ Migration errors for ${dbName}:`, migrationResult.errors);
        throw new Error(`Failed to create tenant database: ${migrationResult.errors.join(', ')}`);
    }
    console.log(`✅ Primary database ready: ${migrationResult.migrationsRun.length} migrations executed`);

    await emitOnboardingProgress(subdomain, 'Setting up', 70, 'Creating branches and admin user');

    const tenantConn = await getTenantConnection(dbName);

    try {
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

        // ─── FIRST BRANCH: points to primary DB ────────────────────────
        const firstBranchSlugFull = dbName;
        await tenantConn.query(
            `INSERT INTO branches (branch_name, branch_slug, branch_db_name, branch_location, branch_phone, branch_email, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [firstBranch.branch_name, firstBranchSlugFull, dbName, firstBranch.branch_location || '', firstBranch.branch_phone || '', firstBranch.branch_email || '']
        );

        branchData.push({
            branch_name: firstBranch.branch_name,
            branch_slug: firstBranchSlugFull,
            branch_db_name: dbName,
        });

        console.log(`✅ Primary branch "${firstBranch.branch_name}" → DB: ${dbName} (slug: ${firstBranchSlugFull})`);

        // ─── ADDITIONAL BRANCHES: create separate DBs ─────────────────
        for (let i = 1; i < branchList.length; i++) {
            const branch = branchList[i];
            const branchDbName = `${generateSlug(tenantName)}-${generateSlug(branch.branch_name)}`;
            const branchSlug = branchDbName;

            await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${branchDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            await serverConn.query(`GRANT ALL PRIVILEGES ON \`${branchDbName}\`.* TO '${dbUser}'@'%'`);

            // ============================================================
            // FIX: ALL migrations run on EVERY branch database
            // Sub-branches get ALL migrations EXCEPT Workshop
            // ============================================================
            const branchMigrations = getBranchMigrations();
            console.log(`📋 Running ALL migrations (${branchMigrations.length} total) for branch DB: ${branchDbName}`);

            let branchCompletedMigrations = 0;
            const branchResult = await migrationService.runTenantMigrations(branchDbName, branchMigrations, dbConfig, (migrationName) => {
                branchCompletedMigrations++;
                console.log(`   📦 Branch migration ${branchCompletedMigrations}/${branchMigrations.length}: ${migrationName}`);
            });

            if (!branchResult.success) {
                const errorMsg = `Failed to run migrations for branch database ${branchDbName}: ${branchResult.errors.join(', ')}`;
                console.error(`❌ ${errorMsg}`);
                // Rollback - drop the database if migrations failed
                try {
                    await serverConn.query(`DROP DATABASE IF EXISTS \`${branchDbName}\``);
                    console.log(`   🗑️ Rolled back: dropped database ${branchDbName}`);
                } catch (rollbackErr) {
                    console.error(`   ⚠️ Failed to rollback database ${branchDbName}:`, rollbackErr.message);
                }
                throw new Error(errorMsg);
            }
            console.log(`✅ Branch migrations completed: ${branchResult.migrationsRun.length} migrations executed for ${branchDbName}`);

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

            console.log(`✅ Branch "${branch.branch_name}" created (db: ${branchDbName}, slug: ${branchSlug})`);
        }

        await tenantConn.query(`
            INSERT INTO activity_logs (user_id, action, details)
            VALUES (1, 'TENANT_CREATED', ?)
        `, [`Tenant ${subdomain} created with ${branchData.length} branch(es)`]);

        console.log(`✅ Tenant setup complete: ${subdomain}`);
        console.log(`   📁 Primary DB: ${dbName}`);
        branchData.forEach(b => console.log(`      - ${b.branch_name} (slug: ${b.branch_slug}, db: ${b.branch_db_name})`));

        await emitOnboardingProgress(subdomain, 'Finalizing', 95, 'Setup complete');
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

        const branchList = (branches && branches.length > 0) ? branches : [
            { branch_name: tenant_name, branch_location: location || 'Main Location', branch_phone: phone || '', branch_email: email }
        ];
        const firstBranch = branchList[0];
        const firstBranchSlug = generateSlug(firstBranch.branch_name);

        const dbName = branchList.length > 1
            ? `${generateSlug(tenant_name)}-${firstBranchSlug}`
            : generateSlug(tenant_name);

        const subdomain = dbName;
        const password_hash = await bcrypt.hash(password, 10);
        const serverConn = await getServerPool();

        // Step 1: Create tracking database
        await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`tenant_tracking\``);

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

        const [existing] = await serverConn.query(
            'SELECT tenant_id FROM tenant_tracking.tenants WHERE tenant_slug = ?',
            [subdomain]
        );
        if (Array.isArray(existing) && existing.length > 0) {
            throw new Error('Tenant slug already exists');
        }

        const finalDeploymentType = deployment_type || ((branches && branches.length > 1) ? 'multi' : 'single');

        const { branches: branchData } = await createCompleteTenantDatabase(
            tenant_name, dbName, email, password_hash, full_name,
            phone || null, country || null, location || null, branches,
            finalDeploymentType
        );

        await emitOnboardingProgress(subdomain, 'Registering tenant', 98, 'Saving tenant record');

        const [columns] = await serverConn.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'tenant_tracking' 
            AND TABLE_NAME = 'tenants' 
            AND COLUMN_NAME = 'deployment_type'
        `);

        const hasDeploymentTypeColumn = Array.isArray(columns) && columns.length > 0;

        let result;
        if (hasDeploymentTypeColumn) {
            const [insertResult] = await serverConn.query(
                `INSERT INTO tenant_tracking.tenants (tenant_name, tenant_slug, db_name, email, phone, location, country, status, subscription_status, deployment_type)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'trial', ?)`,
                [tenant_name, subdomain, dbName, email, phone || null, location || null, country || null, finalDeploymentType]
            );
            result = insertResult;
        } else {
            const [insertResult] = await serverConn.query(
                `INSERT INTO tenant_tracking.tenants (tenant_name, tenant_slug, db_name, email, phone, location, country, status, subscription_status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'trial')`,
                [tenant_name, subdomain, dbName, email, phone || null, location || null, country || null]
            );
            result = insertResult;

            try {
                await serverConn.query(`ALTER TABLE tenant_tracking.tenants ADD COLUMN deployment_type ENUM('single', 'multi') DEFAULT 'single' AFTER subscription_expires_at`);
                await serverConn.query(`UPDATE tenant_tracking.tenants SET deployment_type = ? WHERE tenant_id = ?`, [finalDeploymentType, (result as any).insertId]);
            } catch (alterErr) {
                console.warn('Could not add deployment_type column:', alterErr.message);
            }
        }

        const tenantId = (result as any).insertId;

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

        // ============================================================
        // FIX: Create upload directories for the tenant
        // ============================================================
        try {
            await createTenantUploadDirectories(tenant.tenant_slug);
            console.log(`📂 Tenant upload directories created for: ${tenant.tenant_slug}`);
        } catch (folderError: any) {
            console.error(`❌ Failed to create tenant upload directories: ${folderError.message}`);
            // Abort tenant creation if folder creation fails
            throw new Error(`Failed to create tenant upload directories: ${folderError.message}`);
        }

        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { userId: 1, tenantId: tenant.tenant_id, tenantSlug: tenant.tenant_slug, email: email, role: 'admin' },
            process.env.JWT_SECRET || 'RestPointJWTSecret2024ChangeMe',
            { expiresIn: '7d' }
        );

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

        try {
            await serverConn.query(`
                CREATE TABLE IF NOT EXISTS tenant_tracking.users (
                    user_id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    phone VARCHAR(20),
                    role VARCHAR(50) DEFAULT 'admin',
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

        try {
            const tenantConnForUser = await getTenantConnection(dbName);
            try {
                const [branchRows] = await tenantConnForUser.query(
                    'SELECT branch_id FROM branches WHERE is_active = TRUE ORDER BY branch_id ASC LIMIT 1'
                );
                const branches = branchRows as any[];
                const primaryBranchId = branches.length > 0 ? branches[0].branch_id : null;

                await tenantConnForUser.query(`
                    INSERT INTO users (email, password_hash, full_name, phone, role, branch_id, is_verified, is_active)
                    VALUES (?, ?, ?, ?, 'admin', ?, 1, 1)
                `, [email, password_hash, full_name, phone || '', primaryBranchId]);
                console.log(`✅ Admin user created in tenant database for login control (branch_id: ${primaryBranchId})`);
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

        const branchDbName = `${tenantDbName}-${generateSlug(branch.branch_name)}`;
        const branchSlug = branchDbName;

        await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${branchDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

        // ============================================================
        // FIX: ALL migrations run on EVERY new branch database
        // Sub-branches get ALL migrations EXCEPT Workshop
        // ============================================================
        const branchMigrations = getBranchMigrations();
        const dbConfig = {
            host: process.env.DB_HOST || '127.0.0.1',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'restpoint_user',
            password: process.env.DB_PASSWORD || 'RestPointUser2024',
            authPlugins: AUTH_PLUGINS
        };

        console.log(`📋 Running ALL migrations (${branchMigrations.length} total) for new branch DB: ${branchDbName}`);

        let completedBranchMigrations = 0;
        const branchResult = await migrationService.runTenantMigrations(branchDbName, branchMigrations, dbConfig, (migrationName) => {
            completedBranchMigrations++;
            console.log(`   📦 Branch migration ${completedBranchMigrations}/${branchMigrations.length}: ${migrationName}`);
        });

        if (!branchResult.success) {
            const errorMsg = `Failed to run migrations for branch database ${branchDbName}: ${branchResult.errors.join(', ')}`;
            console.error(`❌ ${errorMsg}`);
            // Rollback - drop the database if migrations failed
            try {
                await serverConn.query(`DROP DATABASE IF EXISTS \`${branchDbName}\``);
                console.log(`   🗑️ Rolled back: dropped database ${branchDbName}`);
            } catch (rollbackErr) {
                console.error(`   ⚠️ Failed to rollback database ${branchDbName}:`, rollbackErr.message);
            }
            throw new Error(errorMsg);
        }
        console.log(`✅ Branch migrations completed: ${branchResult.migrationsRun.length} migrations executed for ${branchDbName}`);

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