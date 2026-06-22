import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { TenantModel } from '../models/Tenant.model';
import { Request, Response } from 'express';

/**
 * OnboardingController — handles tenant registration, login, logout, org info
 * 
 * NOTE: Branch management moved to branchController.ts
 * NOTE: Charges moved to billing service
 * NOTE: Marketplace routes to be migrated to marketplace service
 */
export class OnboardingController {
  async createOrganization(req: Request, res: Response): Promise<void> {
    try {
      const { 
        tenant_name, 
        tenant_slug, 
        email, 
        password, 
        full_name, 
        phone, 
        location, 
        country,
        termsAccepted,
        branches 
      } = req.body;

      // CRITICAL FIX: Validate terms acceptance
      if (!termsAccepted) {
        res.status(400).json({ 
          success: false, 
          errors: ['You must accept terms and conditions'] 
        });
        return;
      }

      if (!tenant_name || !email || !password || !full_name) {
        res.status(400).json({ success: false, message: 'Missing required fields: tenant_name, email, password, full_name' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        return;
      }

      if (branches && Array.isArray(branches)) {
        for (const branch of branches) {
          if (!branch.branch_name) { res.status(400).json({ success: false, message: 'Each branch must have a name' }); return; }
        }
      }

      const result = await TenantModel.registerTenant({
        tenant_name, email, password, full_name,
        phone: phone || null, location: location || null, country: country || null, branches: branches || []
      });

      res.status(201).json({
        success: true, message: 'Organization created successfully',
        data: { token: result.token, tenant: result.tenant, user: { email, full_name, role: 'admin' } }
      });
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      if (error.message === 'Tenant slug already exists') { res.status(409).json({ success: false, message: 'An organization with this name already exists' }); return; }
      res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
  }


 

  async login(req: Request, res: Response): Promise<void> {
    try {
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
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) { res.status(401).json({ success: false, message: 'Invalid email or password' }); return; }

        await conn.query('UPDATE users SET last_login_at = NOW() WHERE user_id = ?', [user.user_id]);

        const token = jwt.sign(
          { userId: user.user_id, tenantId: tenant.tenant_id, tenantSlug: tenant.tenant_slug, email: user.email, role: user.role, branchId: user.branch_id },
          process.env.JWT_SECRET, { expiresIn: '7d' }
        );
        const refreshToken = jwt.sign(
          { userId: user.user_id, tenantSlug: tenant.tenant_slug },
          process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' }
        );
        const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await conn.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.user_id, refreshToken, refreshExpiry]);

        res.json({
          success: true, message: 'Login successful',
          data: {
            token, refreshToken,
            tenant: { tenantId: tenant.tenant_id, tenantName: tenant.tenant_name, tenantSlug: tenant.tenant_slug, country: tenant.country },
            user: { userId: user.user_id, email: user.email, fullName: user.full_name, role: user.role, branchId: user.branch_id }
          }
        });
      } finally { await conn.end(); }
    } catch (error: any) {
      console.error('❌ Login error:', error);
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
              host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '3306'),
              user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: tenant.db_name
            });
            try { await conn.query('UPDATE refresh_tokens SET is_active = FALSE WHERE token = ?', [refreshToken]); } finally { await conn.end(); }
          }
        }
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) { res.status(500).json({ success: false, message: 'Logout failed', error: error.message }); }
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
            tenantId: tenant.tenant_id, tenantName: tenant.tenant_name, tenantSlug: tenant.tenant_slug, email: tenant.email,
            phone: tenant.phone, location: tenant.location, country: tenant.country, logoUrl: tenant.logo_url,
            status: tenant.status, subscriptionStatus: tenant.subscription_status, createdAt: tenant.created_at
          },
          branches, branchCount: branches.length
        }
      });
    } catch (error: any) { res.status(500).json({ success: false, message: 'Failed to fetch organization', error: error.message }); }
  }
}