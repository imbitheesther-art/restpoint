import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import slugify from 'slugify';
import { getMainTenantMigrations, getBranchMigrations } from '../../../shared/services/all-service-migrations';
import { MigrationService } from '../../../shared/services/migration-service';

export interface RegisterTenantData {
    tenant_name: string;
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    location?: string;
    country?: string;
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

// Connection pool to MariaDB server (NO DATABASE SELECTED)
let serverPool: mysql.Pool | null = null;

async function getServerPool(): Promise<mysql.Pool> {
    if (!serverPool) {
        serverPool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
        });
        console.log('✅ Tenant service server pool created');
    }
    return serverPool;
}

function generateSlug(tenantName: string): string {
    const slugifyFn = typeof slugify === 'function' ? slugify : (slugify as any).default;
    return slugifyFn(tenantName, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
        trim: true
    });
}

const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
};

/**
 * Create a complete tenant: main DB + one DB per branch.
 * 
 * ARCHITECTURE:
 * - tenant_tracking.tenants.db_name → points to MAIN tenant DB (tenant_{slug})
 * - Main tenant DB contains: users, branches (with branch_db_name), settings, tokens, logs
 * - Each branch gets its OWN database: deceased, charges, marketplace, chemicals, etc.
 * - Branch DB name format: {tenant_slug}_{branch_slug}
 * - All services use lookupTenantDatabase(slug) → main DB, then query branches table for branch DB
 */
async function createCompleteTenantDatabase(
    tenantName: string, 
    subdomain: string, 
    email: string, 
    password_hash: string, 
    full_name: string, 
    phone: string | null,
    country: string | null,
    location: string | null,
    branches: Array<{branch_name: string; branch_location: string; branch_phone: string; branch_email: string}> | undefined
): Promise<{ dbName: string; branches: Array<{ branch_name: string; branch_slug: string }> }> {
    const dbName = `tenant_${subdomain}`.replace(/-/g, '_');
    const branchData: Array<{ branch_name: string; branch_slug: string }> = [];
    
    const serverConn = await getServerPool();
    const migrationService = new MigrationService();
    
    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Create MAIN tenant database (tenant_{slug})
    // CRITICAL: This database contains ALL tables for complete data isolation
    // - users, branches, settings, deceased, coffins, invoices, documents, etc.
    // - Each tenant gets their own database - NO shared data
    // ═══════════════════════════════════════════════════════════════
    console.log(`📦 Creating tenant database: ${dbName}`);
    await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    // CRITICAL: Grant permissions to restpoint_user for the new tenant database
    await serverConn.query(`GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO 'restpoint_user'@'%'`);
    await serverConn.query('FLUSH PRIVILEGES');
    console.log(`✅ Database permissions granted for ${dbName}`);
    
    // Run ALL migrations in the main tenant database
    // This includes: users, deceased, coffins, invoices, documents, marketplace, etc.
    const allMigrations = getMainTenantMigrations();
    const migrationResult = await migrationService.runTenantMigrations(dbName, allMigrations, connectionConfig);
    if (!migrationResult.success) {
        console.error(`❌ Migration errors for ${dbName}:`, migrationResult.errors);
        throw new Error(`Failed to create tenant database: ${migrationResult.errors.join(', ')}`);
    }
    console.log(`✅ Tenant database ready: ${migrationResult.migrationsRun.length} migrations executed`);
    
    // Connect to tenant DB for seeding
    const tenantConn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: dbName,
        multipleStatements: true
    });
    
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
        
        // Create admin user in tenant DB
        await tenantConn.query(`
            INSERT INTO users (email, password_hash, full_name, phone, role, is_verified, is_active)
            VALUES (?, ?, ?, ?, 'admin', 1, 1)
        `, [email, password_hash, full_name, phone]);
        console.log(`✅ Admin user created`);
        
        // ═══════════════════════════════════════════════════════════════
        // STEP 2: Create branch records (logical divisions, NOT separate databases)
        // Branches are tracked in the branches table but all data is in the main DB
        // ═══════════════════════════════════════════════════════════════
        const branchList = (branches && branches.length > 0) ? branches : [
            { branch_name: tenantName, branch_location: location || 'Main Location', branch_phone: phone || '', branch_email: email }
        ];
        
        for (const branch of branchList) {
            const branchSlug = generateSlug(branch.branch_name) + '-' + Date.now().toString(36);
            
            // Insert branch record in tenant DB (no separate database!)
            const [branchResult] = await tenantConn.query(
                `INSERT INTO branches (branch_name, branch_slug, branch_location, branch_phone, branch_email, is_active) 
                 VALUES (?, ?, ?, ?, ?, 1)`,
                [branch.branch_name, branchSlug, branch.branch_location || '', branch.branch_phone || '', branch.branch_email || '']
            );
            
            const branchId = (branchResult as any).insertId;
            
            branchData.push({
                branch_name: branch.branch_name,
                branch_slug: branchSlug,
            });
            
            console.log(`✅ Branch "${branch.branch_name}" created (slug: ${branchSlug})`);
        }
        
        // Log activity
        await tenantConn.query(`
            INSERT INTO activity_logs (user_id, action, details)
            VALUES (1, 'TENANT_CREATED', ?)
        `, [`Tenant ${dbName} created with ${branchData.length} branch(es): ${branchData.map(b => b.branch_name).join(', ')}`]);
        
        console.log(`✅ Tenant setup complete: ${dbName}`);
        console.log(`   📋 Branches: ${branchData.length}`);
        branchData.forEach(b => console.log(`      - ${b.branch_name} (slug: ${b.branch_slug})`));
    } finally {
        await tenantConn.end();
    }
    
    return { dbName, branches: branchData };
}

export class TenantModel {
    static async registerTenant(data: RegisterTenantData): Promise<{ tenant: Tenant; token: string }> {
        const { tenant_name, email, password, full_name, phone, location, country, branches } = data;
        
        const subdomain = generateSlug(tenant_name);
        const password_hash = await bcrypt.hash(password, 10);
        
        const serverConn = await getServerPool();
        
        // Step 1: Create the tenants tracking table if it doesn't exist
        await serverConn.query(`CREATE DATABASE IF NOT EXISTS tenant_tracking`);
        
        // Add country column if missing
        const [columns] = await serverConn.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = 'tenant_tracking' AND TABLE_NAME = 'tenants' AND COLUMN_NAME = 'country'`
        );
        if (!Array.isArray(columns) || columns.length === 0) {
            try {
                await serverConn.query(`ALTER TABLE tenant_tracking.tenants ADD COLUMN country VARCHAR(100) NULL AFTER location`);
            } catch (e) { /* column may already exist */ }
        }
        
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create branch_tracking table for tracking branches across tenants
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
        
        // Step 3: Create complete tenant with all tables in main database
        const { dbName, branches: branchData } = await createCompleteTenantDatabase(
            tenant_name, subdomain, email, password_hash, full_name,
            phone || null, country || null, location || null, branches
        );
        
        // Step 4: Register tenant in tracking table
        // IMPORTANT: db_name stores the MAIN tenant DB name (tenant_{slug})
        // Branch databases are found via the branches table inside the main DB
        const [result] = await serverConn.query(
            `INSERT INTO tenant_tracking.tenants (tenant_name, tenant_slug, db_name, email, phone, location, country, status, subscription_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'trial')`,
            [tenant_name, subdomain, dbName, email, phone || null, location || null, country || null]
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
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // Step 8: Insert branch tracking records
        try {
            const tenantDbConn = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306'),
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: dbName
            });
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
        
        console.log(`✅ Tenant registered: ${tenant.tenant_name} (${tenant.tenant_slug})`);
        console.log(`📁 Main DB: ${tenant.db_name}`);
        console.log(`🌍 Country: ${tenant.country || 'Not specified'}`);
        console.log(`🏢 Branches: ${branchData.length}`);
        branchData.forEach(b => console.log(`   📋 ${b.branch_name} (slug: ${b.branch_slug})`));
        
        return { tenant, token };
    }
    
    // ─── Branch Operations (with per-branch DB) ────────────────────────
    
    static async getBranches(tenantDbName: string): Promise<BranchInfo[]> {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: tenantDbName
        });
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
    
    /**
     * Add a new branch: creates a brand new database for the branch.
     */
    static async addBranch(tenantDbName: string, branch: {
        branch_name: string;
        branch_location: string;
        branch_phone: string;
        branch_email: string;
    }): Promise<{ branch_id: number; branch_db_name: string }> {
        const serverConn = await getServerPool();
        const migrationService = new MigrationService();
        
        const branchSlug = generateSlug(branch.branch_name) + '-' + Date.now().toString(36);
        const branchDbName = `${tenantDbName.replace('tenant_', '')}_${generateSlug(branch.branch_name)}`.replace(/-/g, '_');
        
        // Create branch database
        await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${branchDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        
        // Run branch migrations
        const branchMigrations = getBranchMigrations();
        const branchResult = await migrationService.runTenantMigrations(branchDbName, branchMigrations, connectionConfig);
        if (!branchResult.success) {
            console.error(`❌ Branch migration errors for ${branchDbName}:`, branchResult.errors);
        }
        
        // Insert into main tenant's branches table
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: tenantDbName
        });
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
    
    // ─── Base Charges Operations (on branch DB) ────────────────────────
    
    static async getBaseCharges(branchDbName: string): Promise<any[]> {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: branchDbName
        });
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
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: branchDbName
        });
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
    
    // ─── Marketplace Operations (on branch DB) ─────────────────────────
    
    static async getMarketplaceProducts(branchDbName: string): Promise<any[]> {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: branchDbName
        });
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
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: branchDbName
        });
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
    
    // ─── Tenant Lookup Methods ───────────────────────────────────────────
    
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
            created_at: tenantRow.created_at,
            updated_at: tenantRow.updated_at
        }));
    }
    
    static async getTenantDatabase(tenantId: number): Promise<mysql.Connection | null> {
        const tenant = await this.findById(tenantId);
        if (!tenant) return null;
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: tenant.db_name
        });
        return connection;
    }
    
    /**
     * Get branch database name from a tenant's main DB + branch slug.
     */
    static async getBranchDbName(tenantDbName: string, branchSlug: string): Promise<string | null> {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: tenantDbName
        });
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
    
    // ─── Portal Login: Find deceased by phone across ALL branches ─────
    
    static async findDeceasedByPhone(phone: string): Promise<{
        tenant: Tenant;
        deceased: any;
        branch: any;
    } | null> {
        const allTenants = await this.getAllTenants();
        
        for (const tenant of allTenants) {
            try {
                const mainConn = await mysql.createConnection({
                    host: process.env.DB_HOST || 'localhost',
                    port: parseInt(process.env.DB_PORT || '3306'),
                    user: process.env.DB_USER || 'root',
                    password: process.env.DB_PASSWORD || '',
                    database: tenant.db_name
                });
                
                const [branchRows] = await mainConn.query(
                    'SELECT branch_db_name, branch_name, branch_slug FROM branches WHERE is_active = TRUE'
                );
                await mainConn.end();
                
                const branches = branchRows as any[];
                
                // Search each branch database
                for (const branch of branches) {
                    try {
                        const branchConn = await mysql.createConnection({
                            host: process.env.DB_HOST || 'localhost',
                            port: parseInt(process.env.DB_PORT || '3306'),
                            user: process.env.DB_USER || 'root',
                            password: process.env.DB_PASSWORD || '',
                            database: branch.branch_db_name
                        });
                        
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