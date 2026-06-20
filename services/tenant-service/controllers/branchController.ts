import * as mysql from 'mysql2/promise';
import { TenantModel } from '../models/Tenant.model';
import { Request, Response } from 'express';

/**
 * BranchController: Handles branch CRUD with per-branch database architecture.
 * Each branch gets its OWN database.
 */
export class BranchController {
  /**
   * GET /branches — List all branches for a tenant (with their db names)
   */
  async listBranches(req: Request, res: Response): Promise<void> {
    try {
      const tenantSlug = req.headers['x-tenant-slug'] as string || req.query.slug as string;
      if (!tenantSlug) {
        res.status(400).json({ success: false, message: 'Tenant slug required' });
        return;
      }

      const tenant = await TenantModel.findBySubdomain(tenantSlug);
      if (!tenant) {
        res.status(404).json({ success: false, message: 'Tenant not found' });
        return;
      }

      const branches = await TenantModel.getBranches(tenant.db_name);
      res.json({ success: true, data: { branches } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /branches — Create a new branch (creates a dedicated database)
   */
  async createBranch(req: Request, res: Response): Promise<void> {
    try {
      const tenantSlug = req.headers['x-tenant-slug'] as string;
      if (!tenantSlug) {
        res.status(400).json({ success: false, message: 'Tenant slug required' });
        return;
      }

      const tenant = await TenantModel.findBySubdomain(tenantSlug);
      if (!tenant) {
        res.status(404).json({ success: false, message: 'Tenant not found' });
        return;
      }

      const { branch_name, branch_location, branch_phone, branch_email } = req.body;
      if (!branch_name) {
        res.status(400).json({ success: false, message: 'Branch name required' });
        return;
      }

      const result = await TenantModel.addBranch(tenant.db_name, {
        branch_name,
        branch_location: branch_location || '',
        branch_phone: branch_phone || '',
        branch_email: branch_email || ''
      });

      res.status(201).json({
        success: true,
        data: {
          branch_id: result.branch_id,
          branch_db_name: result.branch_db_name,
          message: `Branch "${branch_name}" created with its own database: ${result.branch_db_name}`
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}