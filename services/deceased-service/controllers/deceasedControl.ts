import { Request, Response } from 'express';
import { DateTime } from 'luxon';
import crypto from 'crypto';
import { resolveDatabase, safeTenantQuery, safeTenantExecute } from '../../../shared/dbConfig';

// ============================================
// TYPES
// ============================================
interface TenantRequest extends Request {
    tenantSlug?: string;
    dbName?: string | null;
    user?: { email?: string; id?: number };
}

// ============================================
// LOGGER
// ============================================
const logger = {
    info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data || ''),
    error: (msg: string, data?: any) => console.error(`[ERROR] ${msg}`, data || ''),
    warn: (msg: string, data?: any) => console.warn(`[WARN] ${msg}`, data || ''),
    debug: (msg: string, data?: any) => console.debug(`[DEBUG] ${msg}`, data || ''),
};

// ============================================
// HELPERS
// ============================================
const nowNairobi = (): string => {
    return DateTime.now().setZone('Africa/Nairobi').toFormat('yyyy-MM-dd HH:mm:ss');
};

const generateUniqueDeceasedId = (fullName: string, tenantSlug: string): string => {
    const sanitizedTenant = tenantSlug.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
    const namePart = fullName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') || 'XXX';
    const timestamp = Date.now().toString().slice(-6);
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${sanitizedTenant}-${namePart}-${timestamp}-${random}`;
};

const getTenantSlug = (req: any): string | undefined => {
    return req.headers['x-slug'] as string
        || req.headers['x-tenant-slug'] as string
        || req.tenantSlug;
};

// Extract tenant slug from URL path (fallback)
const extractTenantSlugFromUrl = (req: any): string | undefined => {
    try {
        const path = req.path || req.url || '';
        // Match patterns like /tenant/{slug}/... or /api/v1/restpoint/tenant/{slug}/...
        const match = path.match(/\/(?:api\/v1\/restpoint\/)?tenant\/([^\/]+)/);
        if (match && match[1]) {
            return match[1];
        }
    } catch (e) {
        // Ignore errors
    }
    return undefined;
};

const resolveTenantDb = async (tenantSlug: string): Promise<string | null> => {
    if (!tenantSlug || tenantSlug === 'system_shared') return null;
    return await resolveDatabase(tenantSlug);
};

const tenantError = (res: Response, status: number, message: string, error?: string) => {
    return res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && error ? { error } : {})
    });
};

const logError = (error: any, context: string) => {
    console.error(`❌ Error in ${context}:`, {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        timestamp: nowNairobi()
    });
};

// ============================================
// REGISTER DECEASED
// ============================================
export const registerDeceased = async (req: Request, res: Response): Promise<Response> => {
    let tenantSlug = getTenantSlug(req);

    // Fallback: try to extract from URL
    if (!tenantSlug || tenantSlug === 'system_shared') {
        tenantSlug = extractTenantSlugFromUrl(req);
    }

    if (!tenantSlug || tenantSlug === 'system_shared') {
        return res.status(400).json({
            success: false,
            message: 'Valid tenant required. Please provide x-tenant-slug header or include tenant slug in URL path (e.g., /tenant/{slug}/deceased)'
        });
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
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const dbName = await resolveTenantDb(tenantSlug);
        if (!dbName) {
            return res.status(404).json({
                success: false,
                message: `No database configured for: ${tenantSlug}`
            });
        }

        // Ensure table exists
        await ensureDeceasedTable(dbName, tenantSlug);

        const deceased_id = generateUniqueDeceasedId(full_name, tenantSlug);
        const portal_slug = `${tenantSlug}-${full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${crypto.randomBytes(3).toString('hex')}`;
        const now = nowNairobi();
        const admissionNum = admission_number || `ADM-${Date.now()}`;
        const admittedDate = date_admitted || now;

        const insertQuery = `
            INSERT INTO deceased (
                deceased_id, admission_number, cause_of_death, date_admitted,
                date_of_birth, date_of_death, date_registered, full_name, gender,
                place_of_death, county, national_id, created_at, location, portal_slug
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            portal_slug
        ]);

        logger.info(`✅ Deceased registered: ${deceased_id}`);

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
        logger.error('registerDeceased error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// GET ALL DECEASED
// ============================================

export const getAllDeceased = async (req: Request, res: Response): Promise<Response> => {
    let tenantSlug = getTenantSlug(req);

    // Fallback: try to extract from URL
    if (!tenantSlug || tenantSlug === 'system_shared') {
        tenantSlug = extractTenantSlugFromUrl(req);
    }

    if (!tenantSlug || tenantSlug === 'system_shared') {
        console.error('[getAllDeceased] Missing or invalid tenant slug:', {
            tenantSlug,
            path: req.path,
            headers: req.headers,
            hasXTenantSlug: !!req.headers['x-tenant-slug'],
            hasXSlug: !!req.headers['x-slug']
        });
        return res.status(400).json({
            success: false,
            message: 'Valid tenant required. Please provide x-tenant-slug header or include tenant slug in URL path (e.g., /tenant/{slug}/deceased)',
            debug: process.env.NODE_ENV === 'development' ? {
                receivedTenantSlug: tenantSlug,
                path: req.path,
                hasXTenantSlugHeader: !!req.headers['x-tenant-slug'],
                hasXSlugHeader: !!req.headers['x-slug']
            } : undefined
        });
    }

    try {
        const dbName = await resolveTenantDb(tenantSlug);
        if (!dbName) {
            return res.status(404).json({
                success: false,
                message: `No database configured for tenant: ${tenantSlug}`
            });
        }

        const { search = '', page = '1', limit = '50' } = req.query;
        const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
        const offset = (pageNum - 1) * limitNum;

        let whereClause = 'WHERE (is_deleted IS NULL OR is_deleted = FALSE)';
        let params: any[] = [];

        const hasSearch = search && typeof search === 'string' && search.trim();

        if (hasSearch) {
            const searchPattern = `%${search.trim()}%`;
            whereClause += ' AND (full_name LIKE ? OR deceased_id LIKE ? OR national_id LIKE ?)';
            params.push(searchPattern, searchPattern, searchPattern);
        }

        // ✅ Get total count
        const countQuery = `SELECT COUNT(*) as total FROM deceased ${whereClause}`;
        const countResult = await safeTenantQuery(dbName, countQuery, params);
        const total = (countResult as any)[0]?.total || 0;

        // ✅ FIXED: Remove 'id' column - use deceased_id as identifier
        const selectQuery = `
            SELECT 
                deceased_id,
                full_name, 
                date_of_death, 
                date_of_birth,
                gender, 
                county, 
                status, 
                place_of_death, 
                date_admitted,
                date_registered, 
                portal_slug, 
                national_id, 
                cause_of_death, 
                location,
                admission_number, 
                total_mortuary_charge, 
                currency, 
                burial_type,
                extra_charges_amount, 
                next_of_kin_count, 
                is_embalmed
            FROM deceased
            ${whereClause}
            ORDER BY date_registered DESC, deceased_id DESC
            LIMIT ? OFFSET ?
        `;

        const records = await safeTenantQuery(dbName, selectQuery, [...params, limitNum, offset]);

        return res.status(200).json({
            success: true,
            message: 'Deceased records fetched successfully',
            data: records || [],
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.max(1, Math.ceil(total / limitNum))
            }
        });

    } catch (error: any) {
        logger.error('getAllDeceased error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// GET DECEASED BY ID
// ============================================
export const getDeceasedById = async (req: Request, res: Response): Promise<Response> => {
    let tenantSlug = getTenantSlug(req);

    // Fallback: try to extract from URL
    if (!tenantSlug || tenantSlug === 'system_shared') {
        tenantSlug = extractTenantSlugFromUrl(req);
    }

    // Handle id as string | string[]
    const rawId = req.params.id;
    const id = (() => {
        if (Array.isArray(rawId)) return rawId.length > 0 ? String(rawId[0]) : '';
        if (typeof rawId === 'string') return rawId;
        if (rawId != null) return String(rawId);
        return '';
    })();

    if (!id || !tenantSlug || tenantSlug === 'system_shared') {
        return res.status(400).json({
            success: false,
            message: 'Invalid request: tenant and id required'
        });
    }

    try {
        const dbName = await resolveTenantDb(tenantSlug);
        if (!dbName) {
            return res.status(404).json({
                success: false,
                message: `No database configured for tenant: ${tenantSlug}`
            });
        }

        const isNumeric = /^\d+$/.test(id);

        // ✅ FIXED: Remove 'id' column - use deceased_id as identifier
        const selectQuery = `
            SELECT 
                deceased_id, full_name, date_of_death, date_of_birth,
                gender, county, status, place_of_death, date_admitted,
                date_registered, portal_slug, national_id, cause_of_death, location,
                admission_number, total_mortuary_charge, currency,
                burial_type, dispatch_date, created_at,
                extra_charges_amount, next_of_kin_count, is_embalmed
            FROM deceased
            WHERE ${isNumeric ? 'id = ?' : 'deceased_id = ?'}
            AND (is_deleted IS NULL OR is_deleted = FALSE)
            LIMIT 1
        `;

        const records = await safeTenantQuery(dbName, selectQuery, [isNumeric ? parseInt(id, 10) : id]);
        const deceased = records && records.length > 0 ? records[0] : null;

        if (!deceased) {
            return res.status(404).json({
                success: false,
                message: 'Deceased record not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Deceased record fetched successfully',
            data: deceased
        });

    } catch (error: any) {
        logger.error('getDeceasedById error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// UPDATE DECEASED
// ============================================
export const updateDeceased = async (req: Request, res: Response): Promise<Response> => {
    let tenantSlug = getTenantSlug(req);

    // Fallback: try to extract from URL
    if (!tenantSlug || tenantSlug === 'system_shared') {
        tenantSlug = extractTenantSlugFromUrl(req);
    }

    // Handle id as string | string[]
    const rawId = req.params.id;
    const id = (() => {
        if (Array.isArray(rawId)) return rawId.length > 0 ? String(rawId[0]) : '';
        if (typeof rawId === 'string') return rawId;
        if (rawId != null) return String(rawId);
        return '';
    })();

    if (!id || !tenantSlug || tenantSlug === 'system_shared') {
        return res.status(400).json({
            success: false,
            message: 'Invalid request: tenant and id required'
        });
    }

    try {
        const dbName = await resolveTenantDb(tenantSlug);
        if (!dbName) {
            return res.status(404).json({
                success: false,
                message: `No database configured for tenant: ${tenantSlug}`
            });
        }

        const updates = req.body;
        const isNumeric = /^\d+$/.test(id);

        // Check if record exists - ✅ FIXED: Remove 'id' from SELECT
        const checkQuery = `
            SELECT deceased_id FROM deceased 
            WHERE ${isNumeric ? 'id = ?' : 'deceased_id = ?'} 
            AND (is_deleted IS NULL OR is_deleted = FALSE)
        `;
        const checkResult = await safeTenantQuery(dbName, checkQuery, [isNumeric ? parseInt(id, 10) : id]);
        if (!checkResult || (checkResult as any[]).length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Deceased record not found'
            });
        }

        // Allowed fields
        const allowedFields = new Set([
            'full_name', 'cause_of_death', 'location', 'status',
            'burial_location', 'burial_date', 'total_mortuary_charge',
            'extra_charges_amount', 'is_embalmed', 'dispatch_date',
            'county', 'place_of_death', 'gender'
        ]);

        const fields: string[] = [];
        const values: any[] = [];

        for (const [field, value] of Object.entries(updates)) {
            if (allowedFields.has(field) && value !== undefined) {
                fields.push(`${field} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(isNumeric ? parseInt(id, 10) : id);
        const updateQuery = `
            UPDATE deceased 
            SET ${fields.join(', ')}, updated_at = NOW() 
            WHERE ${isNumeric ? 'id = ?' : 'deceased_id = ?'} 
            LIMIT 1
        `;
        await safeTenantExecute(dbName, updateQuery, values);

        return res.status(200).json({
            success: true,
            message: 'Deceased record updated successfully',
            data: {
                id,
                updated_fields: fields.map(f => f.split('=')[0].trim())
            }
        });

    } catch (error: any) {
        logger.error('updateDeceased error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// DELETE DECEASED (SOFT DELETE)
// ============================================
export const deleteDeceased = async (req: Request, res: Response): Promise<Response> => {
    let tenantSlug = getTenantSlug(req);

    // Fallback: try to extract from URL
    if (!tenantSlug || tenantSlug === 'system_shared') {
        tenantSlug = extractTenantSlugFromUrl(req);
    }

    // Handle id as string | string[]
    const rawId = req.params.id;
    const id = (() => {
        if (Array.isArray(rawId)) return rawId.length > 0 ? String(rawId[0]) : '';
        if (typeof rawId === 'string') return rawId;
        if (rawId != null) return String(rawId);
        return '';
    })();

    if (!id || !tenantSlug || tenantSlug === 'system_shared') {
        return res.status(400).json({
            success: false,
            message: 'Invalid request: tenant and id required'
        });
    }

    try {
        const dbName = await resolveTenantDb(tenantSlug);
        if (!dbName) {
            return res.status(404).json({
                success: false,
                message: `No database configured for tenant: ${tenantSlug}`
            });
        }

        const isNumeric = /^\d+$/.test(id);

        // Check if record exists - ✅ FIXED: Remove 'id' from SELECT
        const checkQuery = `
            SELECT deceased_id FROM deceased 
            WHERE ${isNumeric ? 'id = ?' : 'deceased_id = ?'} 
            AND (is_deleted IS NULL OR is_deleted = FALSE)
        `;
        const checkResult = await safeTenantQuery(dbName, checkQuery, [isNumeric ? parseInt(id, 10) : id]);
        if (!checkResult || (checkResult as any[]).length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Deceased record not found or already deleted'
            });
        }

        const softDeleteQuery = `
            UPDATE deceased 
            SET is_deleted = TRUE, status = 'deleted', updated_at = NOW() 
            WHERE ${isNumeric ? 'id = ?' : 'deceased_id = ?'} 
            AND (is_deleted IS NULL OR is_deleted = FALSE)
        `;
        await safeTenantExecute(dbName, softDeleteQuery, [isNumeric ? parseInt(id, 10) : id]);

        return res.status(200).json({
            success: true,
            message: 'Deceased record deleted successfully'
        });

    } catch (error: any) {
        logger.error('deleteDeceased error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// GET DECEASED STATS
// ============================================
export const getDeceasedStats = async (req: Request, res: Response): Promise<Response> => {
    let tenantSlug = getTenantSlug(req);

    // Fallback: try to extract from URL
    if (!tenantSlug || tenantSlug === 'system_shared') {
        tenantSlug = extractTenantSlugFromUrl(req);
    }

    if (!tenantSlug || tenantSlug === 'system_shared') {
        return res.status(400).json({
            success: false,
            message: 'Valid tenant required'
        });
    }

    try {
        const dbName = await resolveTenantDb(tenantSlug);
        if (!dbName) {
            return res.status(404).json({
                success: false,
                message: `No database configured for tenant: ${tenantSlug}`
            });
        }

        const statsQuery = `
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male,
                COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female,
                COUNT(CASE WHEN status = 'dispatched' THEN 1 END) as dispatched,
                COUNT(CASE WHEN is_embalmed = 1 THEN 1 END) as embalmed,
                COUNT(CASE WHEN next_of_kin_count > 0 THEN 1 END) as has_next_of_kin,
                COUNT(DISTINCT county) as counties,
                COALESCE(SUM(total_mortuary_charge), 0) as total_charges,
                COALESCE(SUM(extra_charges_amount), 0) as total_extra_charges
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
        logger.error('getDeceasedStats error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// EXPORT DECEASED TO EXCEL
// ============================================
export const exportDeceasedToExcel = async (req: Request, res: Response): Promise<Response> => {
    const tenantSlug = getTenantSlug(req);

    if (!tenantSlug || tenantSlug === 'system_shared') {
        return res.status(400).json({
            success: false,
            message: 'Valid tenant required'
        });
    }

    try {
        // TODO: Implement Excel export
        return res.status(501).json({
            success: false,
            message: 'Excel export not implemented yet'
        });

    } catch (error: any) {
        logger.error('exportDeceasedToExcel error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// GET EXPORT HISTORY
// ============================================
export const getExportHistory = async (req: Request, res: Response): Promise<Response> => {
    const tenantSlug = getTenantSlug(req);

    if (!tenantSlug || tenantSlug === 'system_shared') {
        return res.status(400).json({
            success: false,
            message: 'Valid tenant required'
        });
    }

    try {
        // TODO: Implement export history
        return res.status(501).json({
            success: false,
            message: 'Export history not implemented yet'
        });

    } catch (error: any) {
        logger.error('getExportHistory error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// ENSURE DECEASED TABLE
// ============================================
const ensureDeceasedTable = async (dbName: string, tenantSlug: string): Promise<void> => {
    try {
        // Check if table exists
        const checkQuery = `
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'deceased'
        `;
        const result = await safeTenantQuery(dbName, checkQuery, [dbName]);
        const tableExists = (result as any[])[0]?.count > 0;

        if (!tableExists) {
            // Create table with full schema
            const createTableSQL = `
                CREATE TABLE deceased (
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
                    is_deleted BOOLEAN DEFAULT FALSE,
                    updated_at DATETIME,
                    INDEX idx_deceased_id (deceased_id),
                    INDEX idx_full_name (full_name),
                    INDEX idx_date_registered (date_registered),
                    INDEX idx_status (status),
                    INDEX idx_is_deleted (is_deleted)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `;
            await safeTenantExecute(dbName, createTableSQL, []);
            logger.info(`✅ Created deceased table in ${dbName}`);
        } else {
            // Table exists - check and add missing columns
            logger.info(`🔍 Checking deceased table schema in ${dbName}...`);

            const alterCommands: string[] = [];

            // Check each required column and add if missing
            const columnChecks = [
                { column: 'date_of_birth', definition: 'DATE NULL AFTER date_admitted' },
                { column: 'date_of_death', definition: 'DATE NULL AFTER date_of_birth' },
                { column: 'date_registered', definition: 'DATETIME NULL AFTER date_of_death' },
                { column: 'gender', definition: 'VARCHAR(20) NULL AFTER full_name' },
                { column: 'place_of_death', definition: 'VARCHAR(255) NULL AFTER gender' },
                { column: 'county', definition: 'VARCHAR(100) NULL AFTER place_of_death' },
                { column: 'national_id', definition: 'VARCHAR(50) NULL AFTER county' },
                { column: 'location', definition: 'TEXT NULL AFTER national_id' },
                { column: 'portal_slug', definition: 'VARCHAR(255) UNIQUE NULL AFTER location' },
                { column: 'status', definition: 'VARCHAR(50) DEFAULT \'active\' AFTER created_by' },
                { column: 'total_mortuary_charge', definition: 'DECIMAL(10,2) NULL AFTER status' },
                { column: 'currency', definition: 'VARCHAR(3) DEFAULT \'KES\' AFTER total_mortuary_charge' },
                { column: 'burial_type', definition: 'VARCHAR(50) NULL AFTER currency' },
                { column: 'dispatch_date', definition: 'DATE NULL AFTER burial_type' },
                { column: 'extra_charges_amount', definition: 'DECIMAL(10,2) DEFAULT 0 AFTER dispatch_date' },
                { column: 'next_of_kin_count', definition: 'INT DEFAULT 0 AFTER extra_charges_amount' },
                { column: 'is_embalmed', definition: 'BOOLEAN DEFAULT FALSE AFTER next_of_kin_count' },
                { column: 'is_deleted', definition: 'BOOLEAN DEFAULT FALSE AFTER is_embalmed' }
            ];

            for (const colCheck of columnChecks) {
                const columnQuery = `
                    SELECT COUNT(*) as count 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = ? 
                    AND TABLE_NAME = 'deceased' 
                    AND COLUMN_NAME = ?
                `;
                const colResult = await safeTenantQuery(dbName, columnQuery, [dbName, colCheck.column]);
                const columnExists = (colResult as any[])[0]?.count > 0;

                if (!columnExists) {
                    alterCommands.push(`ADD COLUMN ${colCheck.column} ${colCheck.definition}`);
                }
            }

            // Execute ALTER TABLE if there are missing columns
            if (alterCommands.length > 0) {
                const alterSQL = `ALTER TABLE deceased ${alterCommands.join(', ')}`;
                await safeTenantExecute(dbName, alterSQL, []);
                logger.info(`✅ Added ${alterCommands.length} missing columns to deceased table in ${dbName}`);
            } else {
                logger.info(`✅ Deceased table schema is up to date in ${dbName}`);
            }
        }
    } catch (error) {
        logger.error(`Failed to ensure deceased table in ${dbName}:`, error);
        throw error;
    }
};

// ============================================
// EXPORT ALL
// ============================================
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