/**
 * AuthController: Registration, Login, Logout, Organization details
 * * ARCHITECTURE: Per-branch database model
 * - Main tenant DB stores users, settings, branch-to-DB mapping
 * - Each branch gets its own database
 * - Login uses x-tenant-slug header to identify the tenant
 */
import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { TenantModel } from '../models/Tenant.model';
import { Request, Response } from 'express';
import logger from '@montezuma/shared-logger';

export class AuthController {
  /**
   * POST /organization — Register a new tenant with per-branch databases
   */
  async createOrganization(req: Request, res: Response): Promise<void> {
    try {
      const { tenant_name, email, password, full_name, phone, location, country, branches } = req.body;

      // FIXED: Added full_name check to match the error message
      if (!tenant_name || !email || !password || !full_name) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: tenant_name, email, password, full_name'
        });
        return;
      }
      if (password.length < 6) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        return;
      }
      if (branches && Array.isArray(branches)) {
        for (const branch of branches) {
          if (!branch.branch_name) {
            res.status(400).json({ success: false, message: 'Each branch must have a name' });
            return;
          }
        }
      }

      const result = await TenantModel.registerTenant({
        tenant_name, email, password, full_name,
        phone: phone || null, location: location || null, country: country || null,
        branches: branches || []
      });

      res.status(201).json({
        success: true,
        message: 'Tenant registered successfully',
        data: { token: result.token, tenant: result.tenant, user: { email, full_name, role: 'admin' } }
      });
    } catch (error: any) {
      logger.error({
        service: "tenant-service",
        controller: "AuthController",
        function: "createOrganization",
        message: "Registration error",
        error: error.message,
        stack: error.stack,
      });
      if (error.message === 'Tenant slug already exists') {
        res.status(409).json({ success: false, message: 'An organization with this name already exists' });
        return;
      }
      res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
  }

  /**
   * POST /login — Authenticate via identifier (email or username) + x-tenant-slug header
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        res.status(400).json({ success: false, message: 'Email/username and password are required' });
        return;
      }
      const tenantSlug = req.headers['x-tenant-slug'] as string;
      if (!tenantSlug) {
        res.status(400).json({ success: false, message: 'Tenant slug required (x-tenant-slug header)' });
        return;
      }

      const tenant = await TenantModel.findBySubdomain(tenantSlug);
      if (!tenant) {
        res.status(401).json({ success: false, message: 'Invalid tenant or credentials' });
        return;
      }

      const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: tenant.db_name
      });

      try {
        const [users] = await conn.query(
          'SELECT * FROM users WHERE (email = ? OR full_name = ?) AND is_active = TRUE', [identifier, identifier]
        );
        const userList = users as any[];
        if (userList.length === 0) {
          res.status(401).json({ success: false, message: 'Invalid email or password' });
          return;
        }
        const user = userList[0];
        if (!(await bcrypt.compare(password, user.password_hash))) {
          res.status(401).json({ success: false, message: 'Invalid email or password' });
          return;
        }
        await conn.query('UPDATE users SET last_login_at = NOW() WHERE user_id = ?', [user.user_id]);

        // FIXED: Explicitly stringified JWT Secret fallbacks to prevent undefined runtime typing crashes
        const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_fallback';
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET || jwtSecret;

        const token = jwt.sign(
          { userId: user.user_id, tenantId: tenant.tenant_id, tenantSlug: tenant.tenant_slug, email: user.email, role: user.role },
          jwtSecret, { expiresIn: '7d' }
        );
        const refreshToken = jwt.sign(
          { userId: user.user_id, tenantSlug: tenant.tenant_slug },
          refreshSecret, { expiresIn: '30d' }
        );
        await conn.query(
          'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
          [user.user_id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
        );

        res.json({
          success: true, message: 'Login successful',
          data: {
            token, refreshToken,
            tenant: { tenantId: tenant.tenant_id, tenantName: tenant.tenant_name, tenantSlug: tenant.tenant_slug, country: tenant.country },
            user: { userId: user.user_id, email: user.email, fullName: user.full_name, role: user.role }
          }
        });
      } finally {
        await conn.end();
      }
    } catch (error: any) {
      logger.error({
        service: "tenant-service",
        controller: "AuthController",
        function: "login",
        message: "Login failed",
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
  }

  /**
   * POST /logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken;
      if (refreshToken) {
        const user = (req as any).user;
        if (user?.tenantSlug) {
          const tenant = await TenantModel.findBySubdomain(user.tenantSlug);
          if (tenant) {
            const conn = await mysql.createConnection({
              host: process.env.DB_HOST || 'localhost',
              port: parseInt(process.env.DB_PORT || '3306'),
              user: process.env.DB_USER || 'root',
              password: process.env.DB_PASSWORD || '',
              database: tenant.db_name
            });
            try {
              await conn.query('UPDATE refresh_tokens SET is_active = FALSE WHERE token = ?', [refreshToken]);
            } finally {
              await conn.end();
            }
          }
        }
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
      logger.error({
        service: "tenant-service",
        controller: "AuthController",
        function: "logout",
        message: "Logout failed",
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ success: false, message: 'Logout failed', error: error.message });
    }
  }

  /**
   * GET /organization
   */
  async getOrganization(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      if (!user?.tenantSlug) {
        res.status(401).json({
          success: false,
          message: 'Authentication required. Please login.'
        });
        return;
      }

      const tenant = await TenantModel.findBySubdomain(user.tenantSlug);
      if (!tenant) {
        res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
        return;
      }

      const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: tenant.db_name
      });

      try {
        const [branches] = await conn.query('SELECT * FROM branches');

        res.json({
          success: true,
          data: {
            organization: {
              tenantId: tenant.tenant_id,
              tenantName: tenant.tenant_name,
              tenantSlug: tenant.tenant_slug,
              country: tenant.country,
              location: tenant.location,
              email: tenant.email,
              phone: tenant.phone
            },
            branches: branches
          }
        });
      } finally {
        await conn.end();
      }
    } catch (error: any) {
      logger.error({
        service: "tenant-service",
        controller: "AuthController",
        function: "getOrganization",
        message: "Failed to retrieve organization details",
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve organization details',
        error: error.message
      });
    }
  }
}