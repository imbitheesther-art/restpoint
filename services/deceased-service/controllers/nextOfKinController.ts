import { Request, Response } from "express";
import { NextOfKinModel } from "../models/NextOfKin";
import Logger from "../../../packages/shared-logger/src/index";
import redisService from "../../../packages/shared-services/dist/redisService";

const SERVICE_NAME = 'nextofkin-service';

// ============================================
// VALIDATION
// ============================================

const validateNextOfKinData = (data: any): string[] => {
    const errors: string[] = [];

    if (!data.deceased_id) {
        errors.push("deceased_id is required");
    }

    if (!data.full_name) {
        errors.push("full_name is required");
    }

    if (!data.relationship) {
        errors.push("relationship is required");
    }

    if (!data.contact) {
        errors.push("contact is required");
    }

    if (data.contact && !/^(\+254|0)[17]\d{8}$/.test(data.contact)) {
        errors.push("Invalid Kenyan contact number format");
    }

    return errors;
};

// ============================================
// REGISTER NEXT OF KIN
// ============================================

export const nextOfKinRegister = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const {
            deceased_id,
            full_name,
            relationship,
            contact
        } = req.body;

        const tenantSlug = (req as any).tenantSlug || "unknown";
        const tenantId = (req as any).tenant?.id;

        const errors = validateNextOfKinData({
            deceased_id,
            full_name,
            relationship,
            contact
        });

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const createData = {
            deceased_id,
            full_name,
            relationship,
            contact
        };

        const result = await NextOfKinModel.create(req, createData);

        if (!result) {
            return res.status(500).json({
                success: false,
                message: "Failed to register next of kin"
            });
        }

        // ==============================
        // INVALIDATE CACHE
        // ==============================
        if (tenantSlug && tenantId) {
            await redisService.serviceDel('deceased-service', tenantSlug, `nextofkin:deceased:${deceased_id}`);
            await redisService.serviceDel('deceased-service', tenantSlug, `nextofkin:list:${tenantId}`);
            Logger.info(`[Cache] 🧹 Next of kin cache invalidated for ${tenantSlug}`);
        }

        return res.status(201).json({
            success: true,
            message: "Next of kin registered successfully",
            data: {
                deceased_id,
                full_name,
                relationship,
                contact
            }
        });

    } catch (error: any) {
        Logger.error("Register next of kin error: " + (error as Error).message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ============================================
// GET NEXT OF KIN BY DECEASED ID
// ============================================

export const getNextOfKinByDeceasedId = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const deceased_id = req.params.deceased_id || req.query.deceased_id as string;
        const tenantSlug = (req as any).tenantSlug || "unknown";

        if (!deceased_id) {
            return res.status(400).json({
                success: false,
                message: "deceased_id is required"
            });
        }

        // ==============================
        // CHECK CACHE
        // ==============================
        const cacheKey = `nextofkin:deceased:${deceased_id}`;
        const cached = await redisService.serviceGet('deceased-service', tenantSlug, cacheKey);

        if (cached) {
            Logger.info(`[Cache]  Next of kin cache hit for deceased ${deceased_id}`);
            return res.status(200).json({
                success: true,
                source: "cache",
                count: cached.length,
                data: cached
            });
        }

        const rows = await NextOfKinModel.getByDeceasedId(req, String(deceased_id));

        const formattedData = rows.map((item: any) => ({
            id: item.id,
            deceased_id: item.deceased_id,
            full_name: item.full_name,
            relationship: item.relationship,
            contact: item.contact,
            email: item.email || null,
            alternative_phone: item.alternative_phone || null,
            id_number: item.id_number || null,
            id_type: item.id_type || null,
            address: item.address || null,
            is_primary: item.is_primary || false,
            is_notified: item.is_notified || false,
            created_at: item.created_at
        }));

        // ==============================
        // STORE IN CACHE
        // ==============================
        await redisService.serviceSet(
            'deceased-service',
            tenantSlug,
            cacheKey,
            formattedData,
            300 // 5 minutes TTL
        );

        return res.status(200).json({
            success: true,
            source: "database",
            count: rows.length,
            data: formattedData
        });

    } catch (error: any) {
        Logger.error("Get next of kin error: " + (error as Error).message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ============================================
// UPDATE NEXT OF KIN
// ============================================

export const updateNextOfKin = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { id } = req.params;
        const tenantSlug = (req as any).tenantSlug || "unknown";
        const tenantId = (req as any).tenant?.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Next of kin id required"
            });
        }

        const {
            full_name,
            relationship,
            contact
        } = req.body;

        const updateData: any = {};

        if (full_name !== undefined) updateData.full_name = full_name;
        if (relationship !== undefined) updateData.relationship = relationship;
        if (contact !== undefined) updateData.contact = contact;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields supplied"
            });
        }

        const result = await NextOfKinModel.update(req, Number(id), updateData);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Next of kin not found"
            });
        }

        // ==============================
        // INVALIDATE CACHE
        // ==============================
        if (tenantSlug && tenantId) {
            // Get the deceased_id from the result to invalidate specific cache
            const record = await NextOfKinModel.getById(req, Number(id));
            if (record && record.deceased_id) {
                await redisService.serviceDel('deceased-service', tenantSlug, `nextofkin:deceased:${record.deceased_id}`);
            }
            await redisService.serviceDel('deceased-service', tenantSlug, `nextofkin:list:${tenantId}`);
            Logger.info(`[Cache]  Next of kin cache invalidated for ${tenantSlug}`);
        }

        return res.status(200).json({
            success: true,
            message: "Next of kin updated successfully"
        });

    } catch (error: any) {
        Logger.error("Update next of kin error: " + (error as Error).message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ============================================
// DELETE NEXT OF KIN
// ============================================

export const deleteNextOfKin = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { id } = req.params;
        const tenantSlug = (req as any).tenantSlug || "unknown";
        const tenantId = (req as any).tenant?.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Next of kin id required"
            });
        }

        // Get the record first to get deceased_id for cache invalidation
        const record = await NextOfKinModel.getById(req, Number(id));

        const result = await NextOfKinModel.delete(req, Number(id));

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Next of kin not found"
            });
        }

        // ==============================
        // INVALIDATE CACHE
        // ==============================
        if (tenantSlug && tenantId) {
            if (record && record.deceased_id) {
                await redisService.serviceDel('deceased-service', tenantSlug, `nextofkin:deceased:${record.deceased_id}`);
            }
            await redisService.serviceDel('deceased-service', tenantSlug, `nextofkin:list:${tenantId}`);
            Logger.info(`[Cache]  Next of kin cache invalidated for ${tenantSlug}`);
        }

        return res.status(200).json({
            success: true,
            message: "Next of kin deleted successfully"
        });

    } catch (error: any) {
        Logger.error("Delete next of kin error: " + (error as Error).message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ============================================
// MARK AS NOTIFIED
// ============================================

export const markAsNotified = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { id } = req.params;
        const tenantSlug = (req as any).tenantSlug || "unknown";
        const tenantId = (req as any).tenant?.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Next of kin id required"
            });
        }

        const updateData: import("../models/NextOfKin").UpdateNextOfKinDTO = { is_notified: true };
        const result = await NextOfKinModel.update(req, Number(id), updateData);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Next of kin not found"
            });
        }

        // ==============================
        // INVALIDATE CACHE
        // ==============================
        if (tenantSlug && tenantId) {
            const record = await NextOfKinModel.getById(req, Number(id));
            if (record && record.deceased_id) {
                await redisService.serviceDel('deceased-service', tenantSlug, `nextofkin:deceased:${record.deceased_id}`);
            }
            await redisService.serviceDel('deceased-service', tenantSlug, `nextofkin:list:${tenantId}`);
            Logger.info(`[Cache]  Next of kin cache invalidated for ${tenantSlug}`);
        }

        return res.status(200).json({
            success: true,
            message: "Next of kin marked as notified successfully"
        });

    } catch (error: any) {
        Logger.error("Mark as notified error: " + (error as Error).message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};