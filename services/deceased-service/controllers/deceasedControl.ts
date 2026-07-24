import { Request, Response } from 'express';
import { DateTime } from 'luxon';
import * as crypto from 'crypto';
import { safeTenantQuery, safeTenantExecute } from '../../../shared/dbConfig';
import Logger from '../../../packages/shared-logger/src/index';
import { getKenyaTimeISO, getKenyaDate } from '../../../packages/shared-utils/dist/timestamps';
import generateUniqueDeceasedId from '../utils/deceasedId';
import redisService from '../../../packages/shared-services/dist/redisService';

const SERVICE_NAME = 'deceased-service';

// ============================================
// TYPES
// ============================================
interface TenantRequest extends Request {
    tenantSlug?: string;
    dbName?: string | null;
    user?: { email?: string; id?: number };
}

// ============================================
// GET ALL DECEASED
// ============================================
export const getAllDeceased = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const dbName = (req as any).tenant?.db_name;
        const tenantId = (req as any).tenant?.id ?? (req as any).tenant?.tenant_id;
        const tenantSlug = (req as any).tenantSlug || "unknown";

        if (!dbName || tenantId === undefined || tenantId === null) {
            return res.status(400).json({
                success: false,
                message: "Tenant information missing"
            });
        }

        const {
            search = "",
            page = "1",
            limit = "50"
        } = req.query;

        const pageNumber = Math.max(Number(page) || 1, 1);
        const limitNumber = Math.min(Math.max(Number(limit) || 50, 1), 100);

        // ============================
        // REDIS CACHE KEY
        // ============================
        const cacheKey = `deceased:list:${tenantId}:page:${pageNumber}:limit:${limitNumber}:search:${search}`;

        // Try to get from cache
        const cached = await redisService.serviceGet('deceased-service', tenantSlug, cacheKey);

        if (cached) {
            Logger.info({ message: "Deceased records served from Redis" });
            return res.status(200).json({
                success: true,
                source: "cache",
                ...cached
            });
        }

        // ============================
        // DATABASE QUERY
        // ============================
        const offset = (pageNumber - 1) * limitNumber;
        let whereClause = ``;
        const params: any[] = [];

        if (typeof search === "string" && search.trim()) {
            whereClause = `WHERE (full_name LIKE ? OR deceased_id LIKE ?)`;
            const keyword = `%${search}%`;
            params.push(keyword, keyword);
        }

        const countQuery = `SELECT COUNT(*) total FROM deceased ${whereClause}`;
        const countResult = await safeTenantQuery(dbName, countQuery, params);
        const total = Number((countResult as any)[0]?.total || 0);

        const query = `
            SELECT *
            FROM deceased
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;

        const records = await safeTenantQuery(dbName, query, [...params, limitNumber, offset]);

        const responseData = {
            success: true,
            source: "database",
            data: records || [],
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            }
        };

        // ============================
        // SAVE TO REDIS
        // ============================
        await redisService.serviceSet(
            'deceased-service',
            tenantSlug,
            cacheKey,
            responseData,
            300 // 5 minutes TTL
        );

        return res.status(200).json(responseData);

    } catch (error: any) {
        console.error('[DECEASED] getAllDeceased raw error:', error?.message || error?.sqlMessage || JSON.stringify(error));
        Logger.error({
            message: "getAllDeceased failed",
            error: error?.message || error?.sqlMessage || String(error)
        });
        return res.status(500).json({
            success: false,
            message: error?.sqlMessage || error?.message || "Internal server error"
        });
    }
};

// ============================================
// GET DECEASED BY ID
// ============================================
export const getDeceasedById = async (req: Request, res: Response): Promise<Response> => {
    const rawId = req.params.id;
    const id = (() => {
        if (Array.isArray(rawId)) return rawId.length > 0 ? String(rawId[0]) : '';
        if (typeof rawId === 'string') return rawId;
        if (rawId != null) return String(rawId);
        return '';
    })();

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Invalid request: id required'
        });
    }

    try {
        const dbName = (req as any).tenant?.db_name;
        const tenantSlug = (req as any).tenantSlug || "unknown";

        if (!dbName) {
            return res.status(400).json({
                success: false,
                message: 'No database configured. Please provide x-tenant-slug header.'
            });
        }

        // Try cache first
        const cacheKey = `deceased:detail:${id}`;
        const cached = await redisService.serviceGet('deceased-service', tenantSlug, cacheKey);

        if (cached) {
            Logger.info({ message: `Deceased ${id} served from Redis` });
            return res.status(200).json({
                success: true,
                source: "cache",
                data: cached
            });
        }

        const isNumeric = /^\d+$/.test(id);
        const query = `
            SELECT *
            FROM deceased
            WHERE ${isNumeric ? 'id = ?' : 'deceased_id = ?'}
            LIMIT 1
        `;

        const records = await safeTenantQuery(dbName, query, [isNumeric ? parseInt(id, 10) : id]);
        const deceased = records && records.length > 0 ? records[0] : null;

        if (!deceased) {
            return res.status(404).json({
                success: false,
                message: 'Deceased record not found'
            });
        }

        // Cache the result
        await redisService.serviceSet(
            'deceased-service',
            tenantSlug,
            cacheKey,
            deceased,
            600 // 10 minutes TTL
        );

        return res.status(200).json({
            success: true,
            message: 'Deceased record fetched successfully',
            data: deceased
        });

    } catch (error: any) {
        Logger.error('getDeceasedById error: ' + (error as Error).message);
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
    const rawId = req.params.id;
    const id = (() => {
        if (Array.isArray(rawId)) return rawId.length > 0 ? String(rawId[0]) : '';
        if (typeof rawId === 'string') return rawId;
        if (rawId != null) return String(rawId);
        return '';
    })();

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Invalid request: id required'
        });
    }

    try {
        const dbName = (req as any).tenant?.db_name;
        const tenantSlug = (req as any).tenantSlug || "unknown";
        const tenantId = (req as any).tenant?.id;

        if (!dbName) {
            return res.status(400).json({
                success: false,
                message: 'No database configured. Please provide x-tenant-slug header.'
            });
        }

        const updates = req.body;
        const isNumeric = /^\d+$/.test(id);

        // Check if record exists
        const checkQuery = `
            SELECT deceased_id FROM deceased 
            WHERE ${isNumeric ? 'id = ?' : 'deceased_id = ?'} 
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

        // Invalidate cache
        await redisService.serviceDel('deceased-service', tenantSlug, `deceased:detail:${id}`);
        await redisService.serviceDel('deceased-service', tenantSlug, `deceased:list:${tenantId}`);
        await redisService.serviceDel('deceased-service', tenantSlug, `deceased:stats:${tenantId}`);

        return res.status(200).json({
            success: true,
            message: 'Deceased record updated successfully',
            data: {
                id,
                updated_fields: fields.map(f => f.split('=')[0].trim())
            }
        });

    } catch (error: any) {
        Logger.error('updateDeceased error: ' + (error as Error).message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// DELETE DECEASED
// ============================================
export const deleteDeceased = async (req: Request, res: Response): Promise<Response> => {
    const rawId = req.params.id;
    const id = (() => {
        if (Array.isArray(rawId)) return rawId.length > 0 ? String(rawId[0]) : '';
        if (typeof rawId === 'string') return rawId;
        if (rawId != null) return String(rawId);
        return '';
    })();

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Invalid request: id required'
        });
    }

    try {
        const dbName = (req as any).tenant?.db_name;
        const tenantSlug = (req as any).tenantSlug || "unknown";
        const tenantId = (req as any).tenant?.id;

        if (!dbName) {
            return res.status(400).json({
                success: false,
                message: 'No database configured. Please provide x-tenant-slug header.'
            });
        }

        const isNumeric = /^\d+$/.test(id);
        const deleteQuery = `
            DELETE FROM deceased
            WHERE ${isNumeric ? 'id = ?' : 'deceased_id = ?'} 
            LIMIT 1
        `;
        const result = await safeTenantExecute(dbName, deleteQuery, [isNumeric ? parseInt(id, 10) : id]);

        // Invalidate cache
        await redisService.serviceDel('deceased-service', tenantSlug, `deceased:detail:${id}`);
        await redisService.serviceDel('deceased-service', tenantSlug, `deceased:list:${tenantId}`);
        await redisService.serviceDel('deceased-service', tenantSlug, `deceased:stats:${tenantId}`);

        return res.status(200).json({
            success: true,
            message: 'Deceased record deleted successfully'
        });

    } catch (error: any) {
        Logger.error('deleteDeceased error: ' + (error as Error).message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// UPDATE DECEASED STATUS (for cross-service calls)
// ============================================
export const updateDeceasedStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { admission_number, body_status, is_embalmed } = req.body;
        const dbName = (req as any).tenant?.db_name;

        if (!dbName) {
            return res.status(400).json({
                success: false,
                message: 'No database configured'
            });
        }

        if (!admission_number) {
            return res.status(400).json({
                success: false,
                message: 'Admission number is required'
            });
        }

        // Build dynamic update query
        const updates: string[] = [];
        const values: any[] = [];

        if (body_status) {
            updates.push('body_status = ?');
            values.push(body_status);
        }

        if (is_embalmed !== undefined) {
            updates.push('is_embalmed = ?');
            values.push(is_embalmed ? 1 : 0);
        }

        updates.push('updated_at = NOW()');

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        values.push(admission_number);

        const updateQuery = `
            UPDATE deceased 
            SET ${updates.join(', ')} 
            WHERE admission_number = ?
        `;

        const result = await safeTenantExecute(dbName, updateQuery, values);

        // Invalidate cache
        const tenantSlug = (req as any).tenantSlug || "unknown";
        const tenantId = (req as any).tenant?.id;
        await redisService.serviceDel('deceased-service', tenantSlug, `deceased:list:${tenantId}`);
        await redisService.serviceDel('deceased-service', tenantSlug, `deceased:stats:${tenantId}`);

        return res.status(200).json({
            success: true,
            message: 'Deceased status updated successfully'
        });

    } catch (error: any) {
        Logger.error('updateDeceasedStatus error: ' + (error as Error).message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// EXPORT ALL
// ============================================
export default {
    getAllDeceased,
    getDeceasedById,
    updateDeceased,
    deleteDeceased,
    updateDeceasedStatus
};
