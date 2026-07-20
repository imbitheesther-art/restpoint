import { Request, Response } from "express";
import { NextOfKinModel } from "../models/NextOfKin";
import Logger from "../../../packages/shared-logger/src/index";
import redisService from "../../../packages/shared-services/src/redisService";

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
            await redisService.serviceDel(SERVICE_NAME, tenantSlug, `nextofkin:deceased:${deceased_id}`);
            await redisService.serviceDel(SERVICE_NAME, tenantSlug, `nextofkin:list:${tenantId}`);
            Logger.info(`[Cache] 🧹 Next of kin cache invalidated for ${tenantSlug}`);
        }

        // ==============================
        // SEND NOTIFICATION
        // ==============================
        if (tenantSlug) {
            await redisService.storeNotification(
                tenantSlug,
                SERVICE_NAME,
                {
                    id: `notif_${Date.now()}_${deceased_id}`,
                    type: 'success',
                    priority: 'high',
                    title: "✅ Next of Kin Registered",
                    message: `${full_name} registered as next of kin for deceased ${deceased_id}`,
                    data: {
                        deceased_id,
                        full_name,
                        relationship,
                        contact
                    },
                    source: SERVICE_NAME,
                    target: "admin"
                }
            );
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
        Logger.error("Register next of kin error:", error.message);
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
        const { deceased_id } = req.query;
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
        const cached = await redisService.serviceGet(SERVICE_NAME, tenantSlug, cacheKey);

        if (cached) {
            Logger.info(`[Cache] 📦 Next of kin cache hit for deceased ${deceased_id}`);
            return res.status(200).json({
                success: true,
                source: "cache",
                count: cached.length,
                data: cached
            });
        }

        const rows = await NextOfKinModel.getByDeceasedId(req, String(deceased_id));

        const formattedData = rows.map((item: any) => ({
            deceased_id: item.deceased_id,
            full_name: item.full_name,
            relationship: item.relationship,
            contact: item.contact
        }));

        // ==============================
        // STORE IN CACHE
        // ==============================
        await redisService.serviceSet(
            SERVICE_NAME,
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
        Logger.error("Get next of kin error:", error.message);
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
                await redisService.serviceDel(SERVICE_NAME, tenantSlug, `nextofkin:deceased:${record.deceased_id}`);
            }
            await redisService.serviceDel(SERVICE_NAME, tenantSlug, `nextofkin:list:${tenantId}`);
            Logger.info(`[Cache] 🧹 Next of kin cache invalidated for ${tenantSlug}`);
        }

        // ==============================
        // SEND NOTIFICATION
        // ==============================
        if (tenantSlug) {
            await redisService.storeNotification(
                tenantSlug,
                SERVICE_NAME,
                {
                    id: `notif_update_${Date.now()}`,
                    type: 'info',
                    priority: 'medium',
                    title: "📝 Next of Kin Updated",
                    message: `Next of kin record ${id} has been updated`,
                    data: {
                        id,
                        updated_fields: Object.keys(updateData)
                    },
                    source: SERVICE_NAME,
                    target: "admin"
                }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Next of kin updated successfully"
        });

    } catch (error: any) {
        Logger.error("Update next of kin error:", error.message);
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
                await redisService.serviceDel(SERVICE_NAME, tenantSlug, `nextofkin:deceased:${record.deceased_id}`);
            }
            await redisService.serviceDel(SERVICE_NAME, tenantSlug, `nextofkin:list:${tenantId}`);
            Logger.info(`[Cache] 🧹 Next of kin cache invalidated for ${tenantSlug}`);
        }

        // ==============================
        // SEND NOTIFICATION
        // ==============================
        if (tenantSlug) {
            await redisService.storeNotification(
                tenantSlug,
                SERVICE_NAME,
                {
                    id: `notif_delete_${Date.now()}`,
                    type: 'warning',
                    priority: 'medium',
                    title: "🗑️ Next of Kin Deleted",
                    message: `Next of kin record ${id} has been deleted`,
                    data: { id },
                    source: SERVICE_NAME,
                    target: "admin"
                }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Next of kin deleted successfully"
        });

    } catch (error: any) {
        Logger.error("Delete next of kin error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};