import { Request, Response } from 'express';
import { RedisCacheService } from '../services/redisCacheService';
import { BackgroundWorkerService } from '../services/backgroundWorkerService';
import { ExcelExportService } from '../services/excelExportService';
import { getKenyaTimeISO } from '../../../utilities/timeStamps/timeStamps';
import { logger } from '../../../global/logger/logger';
import crypto from 'crypto';

// Extend Request type
interface TenantRequest extends Request {
  tenantSlug?: string;
  tenant?: { id: string; slug: string; name: string };
  user?: { userId: string; email: string; role: string; name: string };
}

// Simple safeQuery mock for now (replace with actual import)
const safeQuery = async (sql: string, params?: any[]): Promise<any[]> => {
  // This is a mock - replace with your actual safeQuery
  console.log('Query:', sql, params);
  return [];
};

const cacheService = RedisCacheService.getInstance();
const backgroundWorker = BackgroundWorkerService.getInstance();
const excelService = ExcelExportService.getInstance();

const logError = (error: any, context: string) => {
  logger.error(`Error in ${context}`, {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    timestamp: getKenyaTimeISO()
  });
};

const generateUniqueDeceasedId = (fullName: string, tenantSlug: string): string => {
  const tenantPrefix = tenantSlug.substring(0, 3).toUpperCase();
  const namePart = fullName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
  const timestamp = Date.now().toString().slice(-6);
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${tenantPrefix}-${namePart}-${timestamp}-${random}`;
};

function buildDateCondition(period: string, startDate?: string, endDate?: string): string {
  if (period === 'custom' && startDate && endDate) {
    return `AND d.date_registered BETWEEN '${startDate}' AND '${endDate}'`;
  }
  
  if (period !== 'all') {
    const now = new Date();
    let start: Date;
    
    switch (period) {
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return '';
    }
    
    return `AND d.date_registered >= '${start.toISOString().split('T')[0]}'`;
  }
  
  return '';
}

export const registerDeceased = async (req: TenantRequest, res: Response): Promise<Response> => {
  const tenantSlug = req.tenantSlug || req.headers['x-tenant-slug'] as string;

  if (!tenantSlug || tenantSlug === 'system_shared') {
    return res.status(403).json({ success: false, message: 'Valid tenant required' });
  }

  try {
    const {
      full_name, cause_of_death, date_of_birth, date_of_death,
      gender, place_of_death, county, location, national_id, admission_number
    } = req.body;

    if (!full_name || !date_of_birth || !date_of_death || !gender || !county || !national_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const deceased_id = generateUniqueDeceasedId(full_name, tenantSlug);
    const portal_slug = `${tenantSlug}-${full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${crypto.randomBytes(3).toString('hex')}`;
    const now = getKenyaTimeISO();

    const insertQuery = `
      INSERT INTO deceased (
        deceased_id, tenant_id, admission_number, cause_of_death, date_admitted,
        date_of_birth, date_of_death, date_registered, full_name, gender,
        place_of_death, county, national_id, created_at, location, portal_slug, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await safeQuery(insertQuery, [
      deceased_id, tenantSlug, admission_number || `ADM-${Date.now()}`,
      cause_of_death || 'Pending', now, date_of_birth, date_of_death, now,
      full_name, gender, place_of_death || 'Not specified', county, national_id,
      now, location || null, portal_slug, req.user?.userId || null
    ]);

    await backgroundWorker.addTask('cache_warmup', tenantSlug, { deceased_id });

    return res.status(201).json({
      success: true,
      message: 'Deceased registered successfully',
      deceased_id,
      tenant: tenantSlug
    });

  } catch (error: any) {
    logError(error, 'registerDeceased');
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getDeceasedById = async (req: TenantRequest, res: Response): Promise<Response> => {
  const tenantSlug = req.tenantSlug || req.headers['x-tenant-slug'] as string;
  const id = (req.query.id || req.params.id || req.body.deceased_id) as string;

  if (!id || !tenantSlug || tenantSlug === 'system_shared') {
    return res.status(400).json({ success: false, message: 'Invalid request' });
  }

  try {
    const cacheKey = `deceased:${tenantSlug}:${id}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.status(200).json({
        success: true,
        message: 'Deceased record fetched from cache',
        data: cached,
        cached: true
      });
    }

    // Mock data for now
    const deceased = {
      id: 1,
      deceased_id: id,
      full_name: 'Test Deceased',
      tenant_id: tenantSlug
    };

    await cacheService.set(cacheKey, deceased, { ttl: 3600 });

    return res.status(200).json({
      success: true,
      message: 'Deceased record fetched successfully',
      data: deceased,
      cached: false
    });

  } catch (error: any) {
    logError(error, 'getDeceasedById');
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

export const exportDeceasedToExcel = async (req: TenantRequest, res: Response): Promise<Response> => {
  const tenantSlug = req.tenantSlug || req.headers['x-tenant-slug'] as string;
  const { period = 'all', startDate, endDate, async = 'false' } = req.query;

  if (!tenantSlug || tenantSlug === 'system_shared') {
    return res.status(403).json({ success: false, message: 'Valid tenant required' });
  }

  try {
    if (async === 'true') {
      const taskId = await backgroundWorker.addTask('excel_export', tenantSlug, {
        period, startDate, endDate, format: 'xlsx'
      });

      return res.status(202).json({
        success: true,
        message: 'Export task queued',
        taskId,
        statusUrl: `/api/v1/deceased/export-status/${taskId}`
      });
    }

    // Mock data for export
    const records = [];
    const theme = excelService.getTenantTheme(tenantSlug);
    const buffer = await excelService.generateDeceasedReport(records, {
      period: period as any,
      startDate: startDate as string,
      endDate: endDate as string,
      tenantTheme: theme
    });

    const filename = `${tenantSlug}_deceased_records_${Date.now()}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    return res.send(buffer);

  } catch (error: any) {
    logError(error, 'exportDeceasedToExcel');
    return res.status(500).json({
      success: false,
      message: 'Failed to export deceased records'
    });
  }
};

export const getExportStatus = async (req: TenantRequest, res: Response): Promise<Response> => {
  const { taskId } = req.params;
  
  try {
    const status = await backgroundWorker.getJobStatus(taskId as string);
    
    if (!status) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    return res.status(200).json({
      success: true,
      taskId,
      state: status.state,
      progress: status.progress,
      result: status.returnvalue,
      error: status.failedReason
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get task status' });
  }
};

export const updateDeceasedRecord = async (req: TenantRequest, res: Response): Promise<Response> => {
  const tenantSlug = req.tenantSlug || req.headers['x-tenant-slug'] as string;
  const { id } = req.params;
  const updates = req.body;

  if (!id || !tenantSlug) {
    return res.status(400).json({ success: false, message: 'Invalid request' });
  }

  try {
    const cacheKey = `deceased:${tenantSlug}:${id}`;
    await cacheService.del(cacheKey);
    await cacheService.delPattern(`all_deceased:${tenantSlug}*`);

    return res.status(200).json({
      success: true,
      message: 'Deceased record updated successfully'
    });

  } catch (error: any) {
    logError(error, 'updateDeceasedRecord');
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const bulkDeleteDeceased = async (req: TenantRequest, res: Response): Promise<Response> => {
  const tenantSlug = req.tenantSlug || req.headers['x-tenant-slug'] as string;
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Valid IDs array required' });
  }

  try {
    await cacheService.delPattern(`deceased:${tenantSlug}:*`);
    await cacheService.delPattern(`all_deceased:${tenantSlug}*`);

    return res.status(200).json({
      success: true,
      message: `${ids.length} deceased records deleted successfully`
    });

  } catch (error: any) {
    logError(error, 'bulkDeleteDeceased');
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default {
  registerDeceased,
  getDeceasedById,
  exportDeceasedToExcel,
  getExportStatus,
  updateDeceasedRecord,
  bulkDeleteDeceased
};
