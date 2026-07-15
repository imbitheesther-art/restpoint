import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { TenantModel } from '../models/Tenant.model';
import provisionQueue from '../scripts/provisionQueue';
import { Request, Response } from 'express';
import logger from '@montezuma/shared-logger';

/**
 * OnboardingController — handles tenant registration, login, logout, org info
 * 
 * NOTE: Branch management moved to branchController.ts
 * NOTE: Charges moved to billing service
 * NOTE: Marketplace routes to be migrated to marketplace service
 */
export class OnboardingController {
  async createOrganization(req: Request, res: Response): Promise<void> {
    logger.info({
      service: "tenant-service",
      function: "createOrganization",
      message: "Organization registration started",
    });

    try {
      const {
        organizationName,
        tenant_name,
        email,
        password,
        full_name,
        phone,
        location,
        country,
        termsAccepted,
        branches,
        branchName,
        deploymentType
      } = req.body;

      if (!termsAccepted) {
        res.status(400).json({
          success: false,
          message: "You must accept terms and conditions",
        });
        return;
      }

      const finalTenantName = tenant_name || organizationName;
      const finalFullName = full_name || 'Admin User';

      if (!finalTenantName || !email || !password) {
        res.status(400).json({ success: false, message: 'Missing required fields: organization name, email, password' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        return;
      }

      let rawBranches = branches || [];
      if (branchName && !rawBranches.length) {
        rawBranches = [{ name: branchName, location: location || '' }];
      }

      const normalizedBranches = (rawBranches || []).map((branch: any) => ({
        branch_name: branch.branch_name || branch.name,
        branch_location: branch.branch_location || branch.location || '',
        branch_phone: branch.branch_phone || branch.phone || '',
        branch_email: branch.branch_email || branch.email || ''
      }));

      if (normalizedBranches && Array.isArray(normalizedBranches)) {
        for (const branch of normalizedBranches) {
          if (!branch.branch_name) {
            res.status(400).json({ success: false, message: 'Each branch must have a name' });
            return;
          }
        }
      }

      const finalDeploymentType = deploymentType || (normalizedBranches.length > 1 ? 'multi' : 'single');

      (async () => {
        try {
          try {
            const tenantTrackingDbHost = process.env.TENANT_TRACKING_DB_HOST || process.env.DB_HOST || '127.0.0.1';
            const tenantTrackingDbPort = parseInt(process.env.TENANT_TRACKING_DB_PORT || process.env.DB_PORT || '3306');
            const tenantTrackingDbUser = process.env.TENANT_TRACKING_DB_USER || process.env.DB_USER;
            const tenantTrackingDbPassword = process.env.TENANT_TRACKING_DB_PASSWORD || process.env.DB_PASSWORD;

            // First connect without database to create it if it doesn't exist
            const rootConn = await mysql.createConnection({
              host: tenantTrackingDbHost,
              port: tenantTrackingDbPort,
              user: tenantTrackingDbUser,
              password: tenantTrackingDbPassword,
              multipleStatements: true
            });

            try {
              // Create tenant_tracking database if it doesn't exist
              await rootConn.query('CREATE DATABASE IF NOT EXISTS tenant_tracking');

              // Grant privileges
              await rootConn.query("GRANT ALL PRIVILEGES ON tenant_tracking.* TO 'restpoint_user'@'%'");
              await rootConn.query("GRANT ALL PRIVILEGES ON `tenant_%`.* TO 'restpoint_user'@'%'");
              await rootConn.query("GRANT ALL PRIVILEGES ON `restpoint_%`.* TO 'restpoint_user'@'%'");
              await rootConn.query('FLUSH PRIVILEGES');
            } finally {
              await rootConn.end();
            }

            // Now connect to tenant_tracking database
            const serverConn = await mysql.createConnection({
              host: tenantTrackingDbHost,
              port: tenantTrackingDbPort,
              user: tenantTrackingDbUser,
              password: tenantTrackingDbPassword,
              database: 'tenant_tracking',
              multipleStatements: true
            });

            try {
              // Create provisioning_status table if it doesn't exist
              await serverConn.query(`
                CREATE TABLE IF NOT EXISTS provisioning_status (
                  tenant_slug VARCHAR(255) PRIMARY KEY,
                  status VARCHAR(50) DEFAULT 'pending',
                  progress INT DEFAULT 0,
                  details TEXT,
                  error_message TEXT,
                  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_status (status),
                  INDEX idx_started_at (started_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
              `);

              // Create tenants table if it doesn't exist
              await serverConn.query(`
                CREATE TABLE IF NOT EXISTS tenants (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  tenant_slug VARCHAR(255) NOT NULL UNIQUE,
                  db_name VARCHAR(255) NOT NULL,
                  organization_name VARCHAR(255) NOT NULL,
                  email VARCHAR(255),
                  phone VARCHAR(50),
                  address TEXT,
                  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                  subscription_plan ENUM('basic', 'free', 'premium') DEFAULT 'basic',
                  subscription_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                  subscription_expires_at TIMESTAMP NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_tenant_slug (tenant_slug),
                  INDEX idx_db_name (db_name),
                  INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
              `);

              // Create branches table if it doesn't exist
              await serverConn.query(`
                CREATE TABLE IF NOT EXISTS branches (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  tenant_slug VARCHAR(255) NOT NULL,
                  branch_slug VARCHAR(255) NOT NULL,
                  branch_name VARCHAR(255) NOT NULL,
                  branch_db_name VARCHAR(255) NOT NULL,
                  is_active BOOLEAN DEFAULT TRUE,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  FOREIGN KEY (tenant_slug) REFERENCES tenants(tenant_slug) ON DELETE CASCADE,
                  UNIQUE KEY unique_branch (tenant_slug, branch_slug),
                  INDEX idx_tenant_slug (tenant_slug),
                  INDEX idx_branch_slug (branch_slug)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
              `);

              // Insert system shared tenant if it doesn't exist
              await serverConn.query(`
                INSERT IGNORE INTO tenants (tenant_slug, db_name, organization_name, status)
                VALUES ('system_shared', 'restpoint_main', 'System Shared Database', 'active')
              `);

              const tenantSlug = finalTenantName.replace(/\s+/g, '-').toLowerCase();
              await serverConn.query(
                `INSERT INTO provisioning_status (tenant_slug, status, progress, details) VALUES (?, 'pending', 0, ?) ON DUPLICATE KEY UPDATE status='pending', progress=0, details=?`,
                [tenantSlug, 'Provisioning queued', 'Provisioning queued']
              );

              const payload = {
                tenant_name: finalTenantName,
                email,
                password,
                full_name: finalFullName,
                phone: phone || null,
                location: location || null,
                country: country || null,
                deployment_type: finalDeploymentType,
                branches: normalizedBranches,
                tenant_slug: tenantSlug
              };

              try {
                await provisionQueue.add('provision-tenant', payload, { attempts: 5, backoff: { type: 'exponential', delay: 10000 }, removeOnComplete: true, removeOnFail: false });
              } catch (qErr: any) {
                logger.warn({ service: 'tenant-service', controller: 'OnboardingController', function: 'createOrganization', message: 'Failed to enqueue provisioning job', error: qErr && qErr.message ? qErr.message : String(qErr) });
              }
            } finally {
              await serverConn.end();
            }
          } catch (err: any) {
            logger.warn({ service: 'tenant-service', controller: 'OnboardingController', function: 'createOrganization', message: 'Could not create provisioning_status row', error: err.message });
          }

          res.status(202).json({
            success: true,
            message: 'Organization provisioning started',
            data: {
              tenantSlug: finalTenantName.replace(/\s+/g, '-').toLowerCase(),
              note: 'Provisioning is running in the background. The UI will receive progress via socket events and can poll /onboarding/status/:tenantSlug as a fallback.'
            }
          });
          return;
        } catch (error: any) {
          logger.error({
            service: "tenant-service",
            controller: "OnboardingController",
            function: "createOrganization",
            message: "Organization registration failed",
            error: error.message,
            stack: error.stack,
          });

          if (error.message === 'Tenant slug already exists') { res.status(409).json({ success: false, message: 'An organization with this name already exists' }); return; }
          res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
        }
      })();
    } catch (error: any) {
      logger.error({
        service: "tenant-service",
        controller: "OnboardingController",
        function: "createOrganization",
        message: "Organization registration failed",
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
  }

  async getProvisioningStatus(req: Request, res: Response): Promise<void> {
    try {
      const tenantSlug = req.params.tenantSlug;
      if (!tenantSlug) { res.status(400).json({ success: false, message: 'tenantSlug is required' }); return; }

      const tenantTrackingDbHost = process.env.TENANT_TRACKING_DB_HOST || process.env.DB_HOST || '127.0.0.1';
      const tenantTrackingDbPort = parseInt(process.env.TENANT_TRACKING_DB_PORT || process.env.DB_PORT || '3306');
      const tenantTrackingDbUser = process.env.TENANT_TRACKING_DB_USER || process.env.DB_USER;
      const tenantTrackingDbPassword = process.env.TENANT_TRACKING_DB_PASSWORD || process.env.DB_PASSWORD;

      // First connect without database to create it if it doesn't exist
      const rootConn = await mysql.createConnection({
        host: tenantTrackingDbHost,
        port: tenantTrackingDbPort,
        user: tenantTrackingDbUser,
        password: tenantTrackingDbPassword,
        multipleStatements: true
      });

      try {
        await rootConn.query('CREATE DATABASE IF NOT EXISTS tenant_tracking');
        await rootConn.query("GRANT ALL PRIVILEGES ON tenant_tracking.* TO 'restpoint_user'@'%'");
        await rootConn.query('FLUSH PRIVILEGES');
      } finally {
        await rootConn.end();
      }

      const conn = await mysql.createConnection({
        host: tenantTrackingDbHost,
        port: tenantTrackingDbPort,
        user: tenantTrackingDbUser,
        password: tenantTrackingDbPassword,
        database: 'tenant_tracking'
      });

      try {
        // Ensure provisioning_status table exists
        await conn.query(`
          CREATE TABLE IF NOT EXISTS provisioning_status (
            tenant_slug VARCHAR(255) PRIMARY KEY,
            status VARCHAR(50) DEFAULT 'pending',
            progress INT DEFAULT 0,
            details TEXT,
            error_message TEXT,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_status (status),
            INDEX idx_started_at (started_at)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        const [rows] = await conn.query('SELECT tenant_slug, status, progress, details, error_message, started_at, updated_at FROM provisioning_status WHERE tenant_slug = ? LIMIT 1', [tenantSlug]);
        const list = Array.isArray(rows) ? rows as any[] : [];
        if (list.length === 0) { res.status(404).json({ success: false, message: 'No provisioning status found' }); return; }
        res.json({ success: true, data: list[0] });
      } finally {
        await conn.end();
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to get provisioning status', error: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      logger.info({
        service: "tenant-service",
        controller: "login",
        function: "login",
        message: "Login request received",
      });

      const { identifier, password } = req.body;
      if (!identifier || !password) { res.status(400).json({ success: false, message: 'Email/username and password are required' }); return; }

      const tenantSlug = req.headers['x-tenant-slug'] as string;
      if (!tenantSlug) { res.status(400).json({ success: false, message: 'Tenant slug required (x-tenant-slug header)' }); return; }

      const tenant = await TenantModel.findBySubdomain(tenantSlug);
      if (!tenant) { res.status(401).json({ success: false, message: 'Invalid tenant or credentials' }); return; }

      const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: tenant.db_name
      });

      try {
        const [users] = await conn.query('SELECT * FROM users WHERE (email = ? OR full_name = ?) AND is_active = TRUE', [identifier, identifier]);
        const userList = users as any[];
        if (userList.length === 0) { res.status(401).json({ success: false, message: 'Invalid email or password' }); return; }

        const user = userList[0];

        let branchSlug = null;
        if (user.branch_id) {
          try {
            const [branchRows] = await conn.query('SELECT branch_slug FROM branches WHERE branch_id = ?', [user.branch_id]);
            const branchList = branchRows as any[];
            if (branchList.length > 0) {
              branchSlug = branchList[0].branch_slug;
            }
          } catch (branchErr) {
            // Non-critical - branch lookup may fail if branches table doesn't exist
          }
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) { res.status(401).json({ success: false, message: 'Invalid email or password' }); return; }

        await conn.query('UPDATE users SET last_login_at = NOW() WHERE user_id = ?', [user.user_id]);

        const token = jwt.sign(
          { userId: user.user_id, tenantId: tenant.tenant_id, tenantSlug: tenant.tenant_slug, email: user.email, role: user.role, branchId: user.branch_id, branchSlug },
          process.env.JWT_SECRET, { expiresIn: '7d' }
        );
        const refreshToken = jwt.sign(
          { userId: user.user_id, tenantSlug: tenant.tenant_slug },
          process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' }
        );
        const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await conn.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.user_id, refreshToken, refreshExpiry]);

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            token,
            refreshToken,
            tenant: { tenantId: tenant.tenant_id, tenantName: tenant.tenant_name, tenantSlug: tenant.tenant_slug, country: tenant.country },
            user: { userId: user.user_id, email: user.email, fullName: user.full_name, role: user.role, branchId: user.branch_id, branchSlug }
          }
        });
      } finally { await conn.end(); }
    } catch (error: any) {
      logger.error({
        service: "tenant-service",
        controller: "OnboardingController",
        function: "login",
        message: "Login failed",
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken;
      if (refreshToken) {
        const user = (req as any).user;
        if (user && user.tenantSlug) {
          const tenant = await TenantModel.findBySubdomain(user.tenantSlug);
          if (tenant) {
            const conn = await mysql.createConnection({
              host: process.env.DB_HOST || 'localhost',
              port: parseInt(process.env.DB_PORT || '3306'),
              user: process.env.DB_USER || 'root',
              password: process.env.DB_PASSWORD || '',
              database: tenant.db_name
            });
            try { await conn.query('UPDATE refresh_tokens SET is_active = FALSE WHERE token = ?', [refreshToken]); } finally { await conn.end(); }
          }
        }
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Logout failed', error: error.message });
    }
  }

  async getOrganization(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user || !user.tenantSlug) { res.status(401).json({ success: false, message: 'Authentication required' }); return; }
      const tenant = await TenantModel.findBySubdomain(user.tenantSlug);
      if (!tenant) { res.status(404).json({ success: false, message: 'Organization not found' }); return; }
      const branches = await TenantModel.getBranches(tenant.db_name);
      res.json({
        success: true,
        data: {
          tenant: {
            tenantId: tenant.tenant_id,
            tenantName: tenant.tenant_name,
            tenantSlug: tenant.tenant_slug,
            email: tenant.email,
            phone: tenant.phone,
            location: tenant.location,
            country: tenant.country,
            logoUrl: tenant.logo_url,
            status: tenant.status,
            subscriptionStatus: tenant.subscription_status,
            createdAt: tenant.created_at
          },
          branches,
          branchCount: branches.length
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch organization', error: error.message });
    }
  }
}