import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { TenantModel } from '../models/Tenant.model';
import { Router, Request, Response } from 'express';

const router = Router();

// ═══════════════════════════════════════════════════════════════════
// OnboardingController class - used by onboardingRoutes.ts
// ═══════════════════════════════════════════════════════════════════
export class OnboardingController {
  async createOrganization(req: Request, res: Response): Promise<void> {
    try {
      const {
        tenant_name,
        email,
        password,
        full_name,
        phone,
        location,
        country,
        branches
      } = req.body;

      // Validate required fields
      if (!tenant_name || !email || !password || !full_name) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: tenant_name, email, password, full_name'
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
        return;
      }

      // Validate branches if provided
      if (branches && Array.isArray(branches)) {
        for (const branch of branches) {
          if (!branch.branch_name) {
            res.status(400).json({
              success: false,
              message: 'Each branch must have a name'
            });
            return;
          }
        }
      }

      // Register the tenant
      const result = await TenantModel.registerTenant({
        tenant_name,
        email,
        password,
        full_name,
        phone: phone || null,
        location: location || null,
        country: country || null,
        branches: branches || []
      });

      res.status(201).json({
        success: true,
        message: 'Tenant registered successfully',
        data: {
          token: result.token,
          tenant: result.tenant,
          user: {
            email: email,
            full_name: full_name,
            role: 'admin'
          }
        }
      });
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      if (error.message === 'Tenant slug already exists') {
        res.status(409).json({
          success: false,
          message: 'An organization with this name already exists'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }

      // Find the tenant by email
      const tenant = await TenantModel.findByEmail(email);
      if (!tenant) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Connect to the tenant's database to verify user credentials
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: tenant.db_name
      });

      try {
        const [users] = await conn.query(
          'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
          [email]
        );
        const userList = users as any[];

        if (userList.length === 0) {
          res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
          return;
        }

        const user = userList[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
          res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
          return;
        }

        // Update last login
        await conn.query(
          'UPDATE users SET last_login_at = NOW() WHERE user_id = ?',
          [user.user_id]
        );

        // Generate JWT token
        const token = jwt.sign(
          {
            userId: user.user_id,
            tenantId: tenant.tenant_id,
            tenantSlug: tenant.tenant_slug,
            email: user.email,
            role: user.role,
            branchId: user.branch_id
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        // Generate refresh token
        const refreshToken = jwt.sign(
          { userId: user.user_id, tenantSlug: tenant.tenant_slug },
          process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key',
          { expiresIn: '30d' }
        );

        // Store refresh token
        const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await conn.query(
          'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
          [user.user_id, refreshToken, refreshExpiry]
        );

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            token,
            refreshToken,
            tenant: {
              tenantId: tenant.tenant_id,
              tenantName: tenant.tenant_name,
              tenantSlug: tenant.tenant_slug,
              country: tenant.country
            },
            user: {
              userId: user.user_id,
              email: user.email,
              fullName: user.full_name,
              role: user.role,
              branchId: user.branch_id
            }
          }
        });
      } finally {
        await conn.end();
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const refreshToken = req.body.refreshToken;

      if (refreshToken) {
        // Attempt to invalidate the refresh token across tenant databases
        // Find tenant from user context
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
            try {
              await conn.query(
                'UPDATE refresh_tokens SET is_active = FALSE WHERE token = ?',
                [refreshToken]
              );
            } finally {
              await conn.end();
            }
          }
        }
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message
      });
    }
  }

  async getOrganization(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user || !user.tenantSlug) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
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

      // Get branches count
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
          branches: branches,
          branchCount: branches.length
        }
      });
    } catch (error: any) {
      console.error('❌ Get organization error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch organization',
        error: error.message
      });
    }
  }
}

// ─── POST /api/v2/restpoint/tenants/register ─────────────────────
router.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      tenant_name,
      email,
      password,
      full_name,
      phone,
      location,
      country,
      branches
    } = req.body;

    // Validate required fields
    if (!tenant_name || !email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tenant_name, email, password, full_name'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Validate branches if provided
    if (branches && Array.isArray(branches)) {
      for (const branch of branches) {
        if (!branch.branch_name) {
          return res.status(400).json({
            success: false,
            message: 'Each branch must have a name'
          });
        }
      }
    }

    // Register the tenant
    const result = await TenantModel.registerTenant({
      tenant_name,
      email,
      password,
      full_name,
      phone: phone || null,
      location: location || null,
      country: country || null,
      branches: branches || []
    });

    return res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        token: result.token,
        tenant: result.tenant,
        user: {
          email: email,
          full_name: full_name,
          role: 'admin'
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    
    if (error.message === 'Tenant slug already exists') {
      return res.status(409).json({
        success: false,
        message: 'An organization with this name already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// ─── GET /api/v2/restpoint/tenants/branches ───────────────────────
router.get('/branches', async (req: Request, res: Response) => {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] as string || req.query.slug as string;
    if (!tenantSlug) {
      return res.status(400).json({ success: false, message: 'Tenant slug required' });
    }

    const tenant = await TenantModel.findBySubdomain(tenantSlug);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const branches = await TenantModel.getBranches(tenant.db_name);
    return res.json({ success: true, data: { branches } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/v2/restpoint/tenants/branches ──────────────────────
router.post('/branches', async (req: Request, res: Response) => {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] as string;
    if (!tenantSlug) {
      return res.status(400).json({ success: false, message: 'Tenant slug required' });
    }

    const tenant = await TenantModel.findBySubdomain(tenantSlug);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const { branch_name, branch_location, branch_phone, branch_email } = req.body;
    if (!branch_name) {
      return res.status(400).json({ success: false, message: 'Branch name required' });
    }

    const branchId = await TenantModel.addBranch(tenant.db_name, {
      branch_name,
      branch_location: branch_location || '',
      branch_phone: branch_phone || '',
      branch_email: branch_email || ''
    });

    return res.status(201).json({ success: true, data: { branch_id: branchId } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/v2/restpoint/tenants/charges ─────────────────────────
router.get('/charges', async (req: Request, res: Response) => {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] as string;
    if (!tenantSlug) {
      return res.status(400).json({ success: false, message: 'Tenant slug required' });
    }

    const tenant = await TenantModel.findBySubdomain(tenantSlug);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const charges = await TenantModel.getBaseCharges(tenant.db_name);
    return res.json({ success: true, data: { charges } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/v2/restpoint/tenants/charges ────────────────────────
router.post('/charges', async (req: Request, res: Response) => {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] as string;
    if (!tenantSlug) {
      return res.status(400).json({ success: false, message: 'Tenant slug required' });
    }

    const tenant = await TenantModel.findBySubdomain(tenantSlug);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const { charge_id, charge_name, charge_description, amount, charge_category, is_mandatory, branch_id } = req.body;
    if (!charge_name) {
      return res.status(400).json({ success: false, message: 'Charge name required' });
    }

    const id = await TenantModel.upsertBaseCharge(tenant.db_name, {
      charge_id,
      charge_name,
      charge_description: charge_description || '',
      amount: amount || 0,
      charge_category: charge_category || 'other',
      is_mandatory: is_mandatory || false,
      branch_id: branch_id || null
    });

    return res.status(charge_id ? 200 : 201).json({ success: true, data: { charge_id: id } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/v2/restpoint/portal/lookup ──────────────────────────
// Portal login: find deceased by next-of-kin phone number
router.get('/portal/lookup', async (req: Request, res: Response) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number required' });
    }

    const result = await TenantModel.findDeceasedByPhone(phone as string);
    if (!result) {
      return res.status(404).json({ success: false, message: 'No deceased found with this phone number' });
    }

    // Generate a session token for portal access
    const sessionToken = jwt.sign(
      {
        tenantId: result.tenant.tenant_id,
        tenantSlug: result.tenant.tenant_slug,
        deceasedId: result.deceased.deceased_id,
        type: 'portal'
      },
      process.env.JWT_SECRET || 'portal-secret-key',
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      data: {
        sessionToken,
        tenant: {
          tenantId: result.tenant.tenant_id,
          tenantSlug: result.tenant.tenant_slug,
          tenantName: result.tenant.tenant_name,
          country: result.tenant.country
        },
        deceased: {
          deceased_id: result.deceased.deceased_id,
          full_name: result.deceased.full_name,
          date_of_death: result.deceased.date_of_death
        },
        branch: result.branch ? {
          branch_id: result.branch.branch_id,
          branch_name: result.branch.branch_name,
          branch_location: result.branch.branch_location,
          branch_phone: result.branch.branch_phone
        } : null
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/v2/restpoint/marketplace/products ───────────────────
router.get('/marketplace/products', async (req: Request, res: Response) => {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] as string || req.query.slug as string;
    if (!tenantSlug) {
      return res.status(400).json({ success: false, message: 'Tenant slug required' });
    }

    const tenant = await TenantModel.findBySubdomain(tenantSlug);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const products = await TenantModel.getMarketplaceProducts(tenant.db_name);
    return res.json({ success: true, data: { products } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/v2/restpoint/marketplace/orders ────────────────────
router.post('/marketplace/orders', async (req: Request, res: Response) => {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] as string || req.body.tenantSlug;
    if (!tenantSlug) {
      return res.status(400).json({ success: false, message: 'Tenant slug required' });
    }

    const tenant = await TenantModel.findBySubdomain(tenantSlug);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const { customer_name, customer_phone, customer_email, deceased_id, delivery_branch_id, items, notes } = req.body;
    if (!customer_name || !customer_phone || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Customer name, phone, and items required' });
    }

    const orderId = await TenantModel.createOrder(tenant.db_name, {
      customer_name,
      customer_phone,
      customer_email,
      deceased_id,
      delivery_branch_id,
      items,
      notes
    });

    return res.status(201).json({ success: true, data: { order_id: orderId } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
