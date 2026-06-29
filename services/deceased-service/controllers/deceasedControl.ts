import { Request, Response } from 'express';
import { DateTime } from 'luxon';
import crypto from 'crypto';
import axios from 'axios';
import mysql from 'mysql2/promise';
import ExcelExportService from '../services/excelExportService';
import { resolveDatabase, safeTenantQuery, safeTenantExecute, getRootPool } from '../../../shared/dbConfig';
import logger from '@montezuma/shared-logger';
import { CircuitBreaker, getCircuitBreaker } from '../../../shared/utils/circuitBreaker';

// Module-level Circuit Breaker for Notification Service
// Threshold=2 failures -> OPEN, recovery=15s before HALF_OPEN probe.
const notificationBreaker = getCircuitBreaker('notification-service', {
    failureThreshold: 2,
    recoveryTimeout: 15_000,
});

interface TenantRequest extends Request {
    tenantSlug?: string;
    dbName?: string | null;
    user?: { email?: string; id?: number };
}

const nowNairobi = (): string => {
    return DateTime.now().setZone('Africa/Nairobi').toFormat('yyyy-MM-dd HH:mm:ss');
};

const nowMs = (): number => {
    return DateTime.now().toMillis();
};

const logError = (error: any, context: string) => {
    console.error(`�?O Error in ${context}:`, {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        timestamp: nowNairobi()
    });
};

/**
 * Extract tenant slug from request - consistent across all handlers
 */
const getTenantSlug = (req: any): string | undefined => {
    return (req as any).headers['x-slug'] as string
        || (req as any).headers['x-tenant-slug'] as string
        || req.tenantSlug;
};

/**
 * Standardized tenant validation
 */
const validateTenant = (tenantSlug?: string): Response | null => {
    if (!tenantSlug || tenantSlug === 'system_shared') {
        return null; // caller handles
    }
    return null; // valid
};

/**
 * Validate tenant and resolve database - common pattern used by all handlers
 */
const resolveTenantDb = async (tenantSlug: string): Promise<string | null> => {
    if (!tenantSlug || tenantSlug === 'system_shared') return null;
    return await resolveDatabase(tenantSlug);
};

/**
 * Build standardized error response
 */
const tenantError = (res: Response, status: number, message: string, error?: string) => {
    return res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && error ? { error } : {})
    });
};

const generateUniqueDeceasedId = (fullName: string, tenantSlug: string): string => {
    const sanitizedTenant = tenantSlug.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
    const namePart = fullName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') || 'XXX';
    const timestamp = nowMs().toString().slice(-6);
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${sanitizedTenant}-${namePart}-${timestamp}-${random}`;
};

/**
 * Ensure deceased table exists in tenant database
 * NOTE: Table does NOT include tenant_slug column because each tenant 
 * has their own isolated database, making tenant_slug redundant at row level.
 */
const ensureDeceasedTable = async (dbName: string, tenantSlug: string): Promise<void> => {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS deceased (
            id INT AUTO_INCREMENT PRIMARY KEY,
            deceased_id VARCHAR(100) UNIQUE NOT NULL,
            admission_number VARCHAR(100),
            cause_of_death TEXT,
            date_admitted DATETIME,
            date_of_birth DATE,
            date_of_death DATE,
            date_registered DATETIME,
            full_name VARCHAR(255) NOT NULL,
            gender VARCHAR(20),
            place_of_death VARCHAR(255),
            county VARCHAR(100),
            national_id VARCHAR(50),
            created_at DATETIME,
            location TEXT,
            portal_slug VARCHAR(255) UNIQUE,
            created_by INT,
            status VARCHAR(50) DEFAULT 'active',
            total_mortuary_charge DECIMAL(10,2),
            currency VARCHAR(3) DEFAULT 'KES',
            burial_type VARCHAR(50),
            dispatch_date DATE,
            extra_charges_amount DECIMAL(10,2) DEFAULT 0,
            next_of_kin_count INT DEFAULT 0,
            is_embalmed BOOLEAN DEFAULT FALSE,
            INDEX idx_deceased_id (deceased_id),
            INDEX idx_full_name (full_name),
            INDEX idx_date_registered (date_registered),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    try {
        await safeTenantExecute(dbName, createTableSQL, []);
        console.log(`�o. Deceased table ensured for tenant: ${tenantSlug} in database: ${dbName}`);
    } catch (error) {
        console.error(`�?O Failed to create deceased table for tenant ${tenantSlug}:`, error);
        throw error;
    }
};

/**
 * Register a new deceased person
 * POST /api/v1/restpoint/deceased/register-deceased
 * 
 * Multi-tenant flow:
 * 1. Extract tenantSlug from header
 * 2. Look up tenant's database via resolveDatabase()
 * 3. Execute query on tenant's isolated database
 * 4. Notification is sent with tenant context header
 */
export const registerDeceased = async (req: TenantRequest, res: Response): Promise<Response> => {
    const tenantSlug = getTenantSlug(req);

    console.log('Register deceased request received');
    console.log('Tenant slug:', tenantSlug);
    console.log('Request body:', { ...req.body, national_id: req.body.national_id ? '***' : undefined });

    if (!tenantSlug || tenantSlug === 'system_shared') {
        return tenantError(res, 400, 'Valid tenant required. Please provide x-tenant-slug header');
    }

    try {
        const {
            full_name,
            cause_of_death,
            date_of_birth,
            date_of_death,
            gender,
            place_of_death,
            county,
            location,
            national_id,
            admission_number,
            date_admitted,
        } = req.body;

        // Validate required fields
        const missingFields: string[] = [];
        if (!full_name?.trim()) missingFields.push('full_name');
        if (!date_of_birth) missingFields.push('date_of_birth');
        if (!date_of_death) missingFields.push('date_of_death');
        if (!gender) missingFields.push('gender');
        if (!county?.trim()) missingFields.push('county');
        if (!national_id?.trim()) missingFields.push('national_id');

        if (missingFields.length > 0) {
            return tenantError(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
        }

        // Resolve database from unified x-slug (single-branch or multi-branch)
        console.log(`Resolving database for slug: ${tenantSlug}`);
        const dbName = await resolveTenantDb(tenantSlug);

        if (!dbName) {
            return tenantError(res, 404, `No database configured for: ${tenantSlug}. Please onboard the tenant first.`);
        }

        logger.info({ message: ` Using database: ${dbName}` })


        // Ensure the deceased table exists in the tenant's database
        await ensureDeceasedTable(dbName, tenantSlug);

        const deceased_id = generateUniqueDeceasedId(full_name, tenantSlug);
        const portal_slug = `${tenantSlug}-${full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${crypto.randomBytes(3).toString('hex')}`;
        const now = nowNairobi();
        const admissionNum = admission_number || `ADM-${Date.now()}`;
        const admittedDate = date_admitted || now;
        const createdBy = (req as any).user?.id || null;

        console.log(`dY"? Inserting deceased record with ID: ${deceased_id} into database: ${dbName}`);

        const insertQuery = `
            INSERT INTO deceased (
                deceased_id, admission_number, cause_of_death, date_admitted,
                date_of_birth, date_of_death, date_registered, full_name, gender,
                place_of_death, county, national_id, created_at, location, portal_slug, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await safeTenantExecute(dbName, insertQuery, [
            deceased_id,
            admissionNum,
            cause_of_death || 'Pending',
            admittedDate,
            date_of_birth,
            date_of_death,
            now,
            full_name.trim(),
            gender,
            place_of_death || 'Not specified',
            county.trim(),
            national_id.trim(),
            now,
            location || null,
            portal_slug,
            createdBy
        ]);

        console.log(` Deceased registered successfully in database ${dbName}. Insert ID: ${result.insertId}`);

        // Create notification for new deceased registration (non-blocking)
        const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8111';
        axios.post(`${notificationServiceUrl}/api/v1/restpoint/notification/notifications`, {
            deceased_id,
            type: 'new_body',
            message: `New body registered: ${full_name.trim()} (ID: ${deceased_id})`
        }, {
            headers: {
                'x-tenant-slug': tenantSlug,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        }).catch(err => {
            console.warn('? Could not create notification:', err.message);
        });

        return res.status(201).json({
            success: true,
            message: 'Deceased registered successfully',
            data: {
                id: result.insertId,
                deceased_id,
                portal_slug,
                full_name: full_name.trim(),
                tenant: tenantSlug,
                admission_number: admissionNum
            }
        });

    } catch (error: any) {
        console.error('�?O Error in registerDeceased:', error);
        logError(error, 'registerDeceased');
        return tenantError(res, 500, 'Internal Server Error', error.message);
    }
};

/**
 * Get all deceased records for a tenant
 * GET /api/v1/restpoint/deceased/deceased-all
 * 
 * Multi-tenant: queries tenant's isolated database only
 */
export const getAllDeceased = async (req: TenantRequest, res: Response): Promise<Response> => {
    const tenantSlug = getTenantSlug(req);

    console.log('dY"< Get all deceased request for slug:', tenantSlug);

    if (!tenantSlug || tenantSlug === 'system_shared') {
        return tenantError(res, 400, 'Valid tenant required. Please provide x-slug header');
    }

    try {
        const dbName = await resolveTenantDb(tenantSlug);
        if (!dbName) {
            return tenantError(res, 404, `No database configured for tenant: ${tenantSlug}`);
        }

        const { search = '', page = '1', limit = '50' } = req.query;
        const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
        const offset = (pageNum - 1) * limitNum;

        let whereClause = 'WHERE 1=1';
        let params: any[] = [];

        if (search && typeof search === 'string' && search.trim()) {
            whereClause += ' AND (full_name LIKE ? OR deceased_id LIKE ? OR national_id LIKE ?)';
            const searchPattern = `%${search.trim()}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        const countQuery = `SELECT COUNT(*) as total FROM deceased ${whereClause}`;
        const countResult = await safeTenantQuery(dbName, countQuery, params);
        const total = (countResult as any)[0]?.total || 0;

        const selectQuery = `
            SELECT 
                id, deceased_id, full_name, date_of_death, date_of_birth,
                gender, county, status, place_of_death, date_admitted,
                date_registered, portal_slug, national_id, cause_of_death, location,
                admission_number, total_mortuary_charge, currency, burial_type,
                extra_charges_amount, next_of_kin_count, is_embalmed
            FROM deceased
            ${whereClause}
            ORDER BY date_registered DESC, id DESC
            LIMIT ? OFFSET ?
        `;

        const records = await safeTenantQuery(dbName, selectQuery, [...params, limitNum, offset]);

        return res.status(200).json({
            success: true,
            message: 'Deceased records fetched successfully',
            data: records,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.max(1, Math.ceil(total / limitNum))
            }
        });

    } catch (error: any) {
        console.error('�?O Error in getAllDeceased:', error);
        logError(error, 'getAllDeceased');
        return tenantError(res, 500, 'Internal Server Error');
    }
};

/**
 * Get deceased record by ID
 * GET /api/v1/restpoint/deceased/deceased-id/:id
 * 
 * Multi-tenant: searches within tenant's isolated database
 * Supports both numeric `id` and string `deceased_id`
 */
export const getDeceasedById = async (req: TenantRequest, res: Response): Promise<Response> => {
    const tenantSlug = getTenantSlug(req);
    const rawId = req.params.id || req.query.id;
    const id = (() => {
        if (Array.isArray(rawId)) return rawId.length > 0 ? String(rawId[0]) : '';
        if (typeof rawId === 'string') return rawId;
        if (rawId != null) return String(rawId);
        return '';
    })();

    console.log(`dY"< Get deceased by ID: ${id} for tenant: ${tenantSlug}`);

    if (!id || !tenantSlug) {
        return tenantError(res, 400, 'Invalid request: tenant and id required');
    }

    if (tenantSlug === 'system_shared') {
        return tenantError(res, 400, 'Valid tenant required');
    }

    try {
        const dbName = await resolveTenantDb(tenantSlug);
        if (!dbName) {
            return tenantError(res, 404, `No database configured for tenant: ${tenantSlug}`);
        }

        let deceased = null;
        const isNumeric = /^\d+$/.test(id);

        const selectQuery = `
            SELECT 
                id, deceased_id, full_name, date_of_death, date_of_birth,
                gender, county, status, place_of_death, date_admitted,
                date_registered, portal_slug, national_id, cause_of_death, location,
                admission_number, total_mortuary_charge, currency,
                burial_type, dispatch_date, created_at,
                extra_charges_amount, next_of_kin_count, is_embalmed
            FROM deceased
            WHERE ${isNumeric ? 'id = ?' : 'deceased_id = ?'}
        `;

        const records = await safeTenantQuery(dbName, selectQuery, [isNumeric ? parseInt(id) : id]);
        if (records && records.length > 0) deceased = records[0];

        if (!deceased) {
            return tenantError(res, 404, 'Deceased record not found');
        }

        return res.status(200).json({
            success: true,
            message: 'Deceased record fetched successfully',
            data: deceased
        });

    } catch (error: any) {
        console.error('�?O Error in getDeceasedById:', error);
        logError(error, 'getDeceasedById');
        return tenantError(res, 500, 'Internal Server Error');
    }
};

/**
 * Update deceased record
 * PUT /api/v1/restpoint/deceased/update-deceased/:id
 * 
 * Multi-tenant: updates within tenant's isolated database
 * Only allows specific fields to be updated for security
 */
export const updateDeceased = async (req: TenantRequest, res: Response): Promise<Response> => {
    const tenantSlug = getTenantSlug(req);
    const { id } = req.params;

    if (!id || !tenantSlug || tenantSlug === 'system_shared') {
        return tenantError(res, 400, 'Invalid request: tenant and id required');
    }

    try {
        const dbName = await resolveTenantDb(tenantSlug);
        if (!dbName) {
            return tenantError(res, 404, `No database configured for tenant: ${tenantSlug}`);
        }

        const updates = req.body;
        const allowedFields: Record<string, string> = {
            'full_name': 'string',
            'cause_of_death': 'string',
            'location': 'string',
            'status': 'string',
            'burial_location': 'string',
            'burial_date': 'string',
            'total_mortuary_charge': 'number',
            'extra_charges_amount': 'number',
            'is_embalmed': 'boolean',
            'dispatch_date': 'string',
            'county': 'string',
            'place_of_death': 'string',
            'gender': 'string'
        };

        const fields: string[] = [];
        const values: any[] = [];

        for (const [field, expectedType] of Object.entries(allowedFields)) {
            if (updates[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(updates[field]);
            }
        }

        if (fields.length === 0) {
            return tenantError(res, 400, 'No valid fields to update');
        }

        values.push(id);
        const updateQuery = `UPDATE deceased SET ${fields.join(', ')} WHERE id = ?`;
        const result = await safeTenantExecute(dbName, updateQuery, values);

        if (result.affectedRows === 0) {
            return tenantError(res, 404, 'Deceased record not found');
        }

        return res.status(200).json({
            success: true,
            message: 'Deceased record updated successfully',
            data: { id, updated_fields: fields.map(f => f.split('=')[0].trim()) }
        });

    } catch (error: any) {
        console.error('�?O Error in updateDeceased:', error);
        logError(error, 'updateDeceased');
        return tenantError(res, 500, 'Internal Server Error');
    }
};

/**
 * Delete deceased record (SOFT DELETE)
 * DELETE /api/v1/restpoint/deceased/delete-deceased/:id
 * 
 * Changed from hard DELETE to soft delete to prevent data loss.
 * Multi-tenant: deletes within tenant's isolated database only
 */
export const deleteDeceased = async (req: TenantRequest, res: Response): Promise<Response> => {
    const tenantSlug = getTenantSlug(req);
    const { id } = req.params;

    if (!id || !tenantSlug || tenantSlug === 'system_shared') {
        return tenantError(res, 400, 'Invalid request: tenant and id required');
    }

    try {
        const dbName = await resolveTenantDb(tenantSlug);
        if (!dbName) {
            return tenantError(res, 404, `No database configured for tenant: ${tenantSlug}`);
        }

        // Soft delete: mark as deleted instead of removing
        // First ensure is_deleted column exists
        try {
            await safeTenantExecute(dbName,
                `ALTER TABLE deceased ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`,
                []);
        } catch (e) {
            // Column might already exist, ignore
        }

        const softDeleteQuery = `UPDATE deceased SET is_deleted = TRUE, status = 'deleted', updated_at = NOW() WHERE id = ? AND (is_deleted IS NULL OR is_deleted = FALSE)`;
        const result = await safeTenantExecute(dbName, softDeleteQuery, [id]);

        if (result.affectedRows === 0) {
            return tenantError(res, 404, 'Deceased record not found or already deleted');
        }

        return res.status(200).json({
            success: true,
            message: 'Deceased record deleted successfully'
        });

    } catch (error: any) {
        console.error('�?O Error in deleteDeceased:', error);
        logError(error, 'deleteDeceased');
        return tenantError(res, 500, 'Internal Server Error');
    }
};

/**
 * Get deceased statistics for dashboard
 * GET /api/v1/restpoint/deceased/stats
 * 
 * Multi-tenant: aggregates within tenant's isolated database
 */
export const getDeceasedStats = async (req: TenantRequest, res: Response): Promise<Response> => {
    const tenantSlug = getTenantSlug(req);

    if (!tenantSlug || tenantSlug === 'system_shared') {
        return tenantError(res, 400, 'Valid tenant required');
    }

    try {
        const dbName = await resolveTenantDb(tenantSlug);
        if (!dbName) {
            return tenantError(res, 404, `No database configured for tenant: ${tenantSlug}`);
        }

        const statsQuery = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as male,
                SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as female,
                SUM(CASE WHEN status = 'dispatched' THEN 1 ELSE 0 END) as dispatched,
                SUM(CASE WHEN is_embalmed = 1 THEN 1 ELSE 0 END) as embalmed,
                SUM(CASE WHEN next_of_kin_count > 0 THEN 1 ELSE 0 END) as has_next_of_kin,
                COUNT(DISTINCT county) as counties,
                SUM(total_mortuary_charge) as total_charges,
                SUM(extra_charges_amount) as total_extra_charges
            FROM deceased
            WHERE (is_deleted IS NULL OR is_deleted = FALSE)
        `;

        const result = await safeTenantQuery(dbName, statsQuery, []);
        const stats = (result as any[])[0] || {
            total: 0, active: 0, male: 0, female: 0, dispatched: 0,
            embalmed: 0, has_next_of_kin: 0, counties: 0,
            total_charges: 0, total_extra_charges: 0
        };

        return res.status(200).json({
            success: true,
            message: 'Statistics fetched successfully',
            data: stats
        });

    } catch (error: any) {
        console.error(' Error in getDeceasedStats:', error);
        logError(error, 'getDeceasedStats');
        return tenantError(res, 500, 'Internal Server Error');
    }
};

/**
 * Export deceased records to Excel
 * GET /api/v1/restpoint/deceased/export-excel
 * 
 * Multi-tenant: 
 * 1. Queries tenant's isolated database ONLY
 * 2. Uses tenant-specific theme/branding
 * 3. Saves export history to tenant's database
 * 4. File is stored in tenant-specific folder
 * 5. All exports are per-tenant with no data mixing
 */
export const exportDeceasedToExcel = async (req: TenantRequest, res: Response): Promise<Response> => {
    const tenantSlug = getTenantSlug(req);

    console.log('dY"S Export deceased records to Excel for tenant:', tenantSlug);

    if (!tenantSlug || tenantSlug === 'system_shared') {
        return tenantError(res, 400, 'Valid tenant required. Please provide x-tenant-slug header');
    }

    try {
        const dbName = await resolveTenantDb(tenantSlug);
        if (!dbName) {
            return tenantError(res, 404, `No database configured for tenant: ${tenantSlug}`);
        }

        // Get tenant name from tracking DB using shared pool (not a new connection)
        let tenantName = tenantSlug;
        try {
            const rootPool = await getRootPool();
            const [tenants] = await rootPool.query(
                'SELECT tenant_name FROM tenants WHERE tenant_slug = ? AND status = "active" LIMIT 1',
                [tenantSlug]
            );
            const tenantRows = tenants as any[];
            if (tenantRows.length > 0 && tenantRows[0].tenant_name) {
                tenantName = tenantRows[0].tenant_name;
            }
        } catch (err) {
            console.warn('Could not fetch tenant name:', err);
        }

        const { period = 'all', startDate, endDate } = req.query;

        // Build query with date filters - scoped to tenant's database
        let whereClause = 'WHERE (is_deleted IS NULL OR is_deleted = FALSE)';
        let params: any[] = [];

        if (period === 'custom' && startDate && endDate) {
            whereClause += ' AND date_registered BETWEEN ? AND ?';
            params.push(startDate, endDate);
        } else if (period === 'thisMonth') {
            const start = DateTime.now().startOf('month').toFormat('yyyy-MM-dd');
            const end = DateTime.now().endOf('month').toFormat('yyyy-MM-dd');
            whereClause += ' AND date_registered BETWEEN ? AND ?';
            params.push(start, end);
        } else if (period === 'thisYear') {
            const start = DateTime.now().startOf('year').toFormat('yyyy-MM-dd');
            const end = DateTime.now().endOf('year').toFormat('yyyy-MM-dd');
            whereClause += ' AND date_registered BETWEEN ? AND ?';
            params.push(start, end);
        }

        // Get records from tenant's database ONLY
        const selectQuery = `
            SELECT 
                id, deceased_id, admission_number, full_name, gender,
                date_of_birth, date_of_death, date_admitted, date_registered,
                cause_of_death, place_of_death, county, location, national_id,
                status, total_mortuary_charge, currency, burial_type, dispatch_date,
                extra_charges_amount, next_of_kin_count, is_embalmed
            FROM deceased
            ${whereClause}
            ORDER BY date_registered DESC
        `;

        const records = await safeTenantQuery(dbName, selectQuery, params);

        // Calculate period label
        let periodLabel = 'All Records';
        if (period === 'thisMonth') periodLabel = `${DateTime.now().toFormat('MMMM yyyy')}`;
        else if (period === 'thisYear') periodLabel = `Year ${DateTime.now().toFormat('yyyy')}`;
        else if (period === 'custom' && startDate && endDate) {
            periodLabel = `${DateTime.fromISO(startDate as string).toFormat('dd/MM/yyyy')} - ${DateTime.fromISO(endDate as string).toFormat('dd/MM/yyyy')}`;
        }

        // Get Excel export service
        const excelService = ExcelExportService.getInstance();
        const theme = excelService.getTenantTheme(tenantSlug);
        theme.companyName = tenantName;

        // Generate Excel with tenant branding
        const exportResult = await excelService.generateDeceasedReport(records, {
            period: period as any,
            startDate: startDate as string,
            endDate: endDate as string,
            tenantTheme: theme,
            format: 'xlsx'
        });

        // Save export history to tenant's isolated database
        try {
            const historyRecord = {
                id: 0,
                tenant_slug: tenantSlug,
                file_name: exportResult.history.file_name,
                file_size: exportResult.history.file_size,
                record_count: exportResult.history.record_count,
                generated_at: exportResult.history.generated_at,
                generated_by: (req as any).user?.email || 'System Administrator',
                period: periodLabel,
                status: 'success' as const
            };
            const historyId = await excelService.saveExportHistory(dbName, historyRecord);
            console.log(`dY"S Export history saved for tenant ${tenantSlug} with ID: ${historyId}`);
        } catch (historyError: any) {
            console.warn(`�s��,? Could not save export history: ${historyError.message}`);
            // Non-blocking: don't fail the export
        }

        const filename = `${tenantSlug}_deceased_report_${DateTime.now().toFormat('yyyyMMdd_HHmmss')}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', exportResult.buffer.length);

        return res.send(exportResult.buffer);

    } catch (error: any) {
        console.error('Error in exportDeceasedToExcel:', error);
        logError(error, 'exportDeceasedToExcel');
        return tenantError(res, 500, 'Internal Server Error', error.message);
    }
};

/**
 * Get export history for a tenant
 * GET /api/v1/restpoint/deceased/export-history
 * 
 * Multi-tenant: fetches history from tenant's isolated database ONLY
 * Tenant A can NEVER see Tenant B's export history
 */
export const getExportHistory = async (req: TenantRequest, res: Response): Promise<Response> => {
    const tenantSlug = getTenantSlug(req);

    console.log('dY"< Get export history for tenant:', tenantSlug);

    if (!tenantSlug || tenantSlug === 'system_shared') {
        return tenantError(res, 400, 'Valid tenant required. Please provide x-tenant-slug header');
    }

    try {
        const dbName = await resolveTenantDb(tenantSlug);
        if (!dbName) {
            return tenantError(res, 404, `No database configured for tenant: ${tenantSlug}`);
        }

        const { page = '1', limit = '20' } = req.query;
        const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));

        const excelService = ExcelExportService.getInstance();
        const result = await excelService.getExportHistory(dbName, tenantSlug, pageNum, limitNum);

        return res.status(200).json({
            success: true,
            message: 'Export history fetched successfully',
            data: result.records,
            pagination: {
                total: result.total,
                page: result.page,
                limit: limitNum,
                totalPages: result.totalPages
            }
        });

    } catch (error: any) {
        console.error('Error in getExportHistory:', error);
        logError(error, 'getExportHistory');
        return tenantError(res, 500, 'Internal Server Error');
    }
};

// Export all controllers
export default {
    registerDeceased,
    getAllDeceased,
    getDeceasedById,
    updateDeceased,
    deleteDeceased,
    getDeceasedStats,
    exportDeceasedToExcel,
    getExportHistory
};
