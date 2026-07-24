import { Request, Response, NextFunction } from 'express';
import Logger from '../../../packages/shared-logger/dist/index';
import { getTenantDB } from '../../../shared/dbConfig';

// GET /body-release/checkout/:id - Get specific release by ID
export const getReleaseController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] as string || req.headers['X-tenant-slug'] as string;
    const { id } = req.params;

    if (!tenantSlug) {
      res.status(400).json({
        success: false,
        message: 'Tenant slug is required'
      });
      return;
    }

    const db = await getTenantDB(tenantSlug);
    const query = `
      SELECT * FROM body_releases
      WHERE release_id = ? AND tenant_slug = ?
      LIMIT 1
    `;

    const [rows] = await db.execute(query, [id, tenantSlug]);
    const results = rows as any[];

    if (!results || results.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Release not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: results[0]
    });
  } catch (error: any) {
    Logger.error({
      message: 'Error fetching release',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /body-release/checkout/by-admission/:admissionNumber - Get release by admission number
export const getReleaseByAdmissionController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] as string || req.headers['X-tenant-slug'] as string;
    const { admissionNumber } = req.params;

    if (!tenantSlug) {
      res.status(400).json({ success: false, message: 'Tenant slug is required' });
      return;
    }

    if (!admissionNumber) {
      res.status(400).json({ success: false, message: 'Admission number is required' });
      return;
    }

    const db = await getTenantDB(tenantSlug);
    const query = `SELECT * FROM body_releases WHERE admission_number = ? AND tenant_slug = ? LIMIT 1`;
    const [rows] = await db.execute(query, [admissionNumber, tenantSlug]);
    const results = rows as any[];

    if (!results || results.length === 0) {
      res.status(404).json({ success: false, message: 'Release not found for this admission number' });
      return;
    }

    res.status(200).json({ success: true, data: results[0] });
  } catch (error: any) {
    Logger.error({ message: 'Error fetching release by admission', error: error.message });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /body-release/checkout - List all releases
export const listReleasesController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] as string || req.headers['X-tenant-slug'] as string;

    if (!tenantSlug) {
      res.status(400).json({
        success: false,
        message: 'Tenant slug is required'
      });
      return;
    }

    const { page = '1', limit = '50', search = '' } = req.query;
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 50, 1), 100);

    const offset = (pageNumber - 1) * limitNumber;
    let whereClause = `WHERE tenant_slug = ?`;
    const params: any[] = [tenantSlug];

    if (search && typeof search === 'string' && search.trim()) {
      whereClause += ` AND (release_id LIKE ? OR name_of_deceased LIKE ? OR admission_number LIKE ?)`;
      const keyword = `%${search}%`;
      params.push(keyword, keyword, keyword);
    }

    const db = await getTenantDB(tenantSlug);
    
    const countQuery = `SELECT COUNT(*) as total FROM body_releases ${whereClause}`;
    const [countRows] = await db.execute(countQuery, params);
    const countResults = countRows as any[];
    const total = Number(countResults[0]?.total || 0);

    const query = `
      SELECT * FROM body_releases
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [releases] = await db.execute(query, [...params, limitNumber, offset]);
    const releaseResults = releases as any[];

    res.status(200).json({
      success: true,
      data: releaseResults || [],
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error: any) {
    Logger.error({
      message: 'Error fetching releases',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};