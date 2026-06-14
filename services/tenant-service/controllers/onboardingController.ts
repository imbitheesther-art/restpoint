import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { TenantModel } from '../models/Tenant.model';
import { Router, Request, Response } from 'express';

const router = Router();

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