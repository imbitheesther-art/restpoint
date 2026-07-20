import { Request, Response } from 'express';
import { DateTime } from 'luxon';
import crypto from 'crypto';
import { safeTenantQuery, safeTenantExecute } from '../../../shared/dbConfig';
import Logger from '../../../packages/shared-logger/src/index';
import { getKenyaTimeISO, getKenyaDate } from '../../../packages/shared-utils/dist/timestamps';
import generateUniqueDeceasedId from '../utils/deceasedId';
import redisService from '../../../packages/shared-services/src/redisService';

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
        const tenantId = (req as any).tenant?.id;
        const tenantSlug = (req as any).tenantSlug || "unknown";

        if (!dbName || !tenantId) {
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
        const cached = await redisService.serviceGet(SERVICE_NAME, tenantSlug, cacheKey);

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
        let whereClause = `WHERE (is_deleted = 0 OR is_deleted IS NULL)`;
        const params: any[] = [];

        if (typeof search === "string" && search.trim()) {
            whereClause += ` AND (full_name LIKE ? OR deceased_id LIKE ? OR national_id LIKE ?)`;
            const keyword = `%${search}%`;
            params.push(keyword, keyword, keyword);
        }

        const countQuery = `SELECT COUNT(*) total FROM deceased ${whereClause}`;
        const countResult = await safeTenantQuery(dbName, countQuery, params);
        const total = Number((countResult as any)[0]?.total || 0);

        const query = `
            SELECT
                deceased_id,
                full_name,
                cause_of_death,
                date_of_birth,
                national_id,
                received_from,
                permit_no,
                age,
                time_received,
                body_status,
                contact_person,
                tell_no,
                gender,
                county,
                status,
                portal_slug,
                created_at,
                updated_at
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
            SERVICE_NAME,
            tenantSlug,
            cacheKey,
            responseData,
            300 // 5 minutes TTL
        );

        return res.status(200).json(responseData);

    } catch (error: any) {
        Logger.error({
            message: "getAllDeceased failed",
            error
        });
        return res.status(500).json({
            success: false,
            message: "Internal server error"
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
        const cached = await redisService.serviceGet(SERVICE_NAME, tenantSlug, cacheKey);

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
            AND (is_deleted IS NULL OR is_deleted = FALSE)
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
            SERVICE_NAME,
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
        Logger.error('getDeceasedById error:', error);
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

        // Invalidate cache
        await redisService.serviceDel(SERVICE_NAME, tenantSlug, `deceased:detail:${id}`);
        await redisService.serviceDel(SERVICE_NAME, tenantSlug, `deceased:list:${tenantId}`);
        await redisService.serviceDel(SERVICE_NAME, tenantSlug, `deceased:stats:${tenantId}`);

        return res.status(200).json({
            success: true,
            message: 'Deceased record updated successfully',
            data: {
                id,
                updated_fields: fields.map(f => f.split('=')[0].trim())
            }
        });

    } catch (error: any) {
        Logger.error('updateDeceased error:', error);
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
            UPDATE deceased 
            SET is_deleted = TRUE, deleted_at = NOW() 
            WHERE ${isNumeric ? 'id = ?' : 'deceased_id = ?'} 
            LIMIT 1
        `;
        const result = await safeTenantExecute(dbName, deleteQuery, [isNumeric ? parseInt(id, 10) : id]);

        // Invalidate cache
        await redisService.serviceDel(SERVICE_NAME, tenantSlug, `deceased:detail:${id}`);
        await redisService.serviceDel(SERVICE_NAME, tenantSlug, `deceased:list:${tenantId}`);
        await redisService.serviceDel(SERVICE_NAME, tenantSlug, `deceased:stats:${tenantId}`);

        return res.status(200).json({
            success: true,
            message: 'Deceased record deleted successfully'
        });

    } catch (error: any) {
        Logger.error('deleteDeceased error:', error);
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
    deleteDeceased
};