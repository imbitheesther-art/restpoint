import { Request, Response } from "express";
import { safeTenantExecute } from "../../../shared/dbConfig";
import Logger from "../../../packages/shared-logger/src/index";
import { getKenyaTimeISO } from "../../../packages/shared-utils/dist/timestamps";
import generateUniqueDeceasedId from "../utils/deceasedId";
import * as z from "zod";

// Redis service with universal notifications
import redisService, { NotificationType, NotificationPriority } from "../../../packages/shared-services/src/redisService";

const SERVICE_NAME = 'deceased-service';

// ============================================
// VALIDATION SCHEMA
// ============================================

const registerDeceasedSchema = z.object({
    full_name: z.string().min(4, "Full name must have at least 4 characters"),
    cause_of_death: z.string().min(3, "Cause of death is required"),
    date_of_birth: z.string().optional().nullable(),
    national_id: z.string().min(8, "National ID must have at least 8 characters"),
    received_from: z.string().optional().nullable(),
    permit_no: z.string().optional().nullable(),
    age: z.number().int().min(0),
    time_received: z.string(),
    body_status: z.string(),
    contact_person: z.string(),
    tell_no: z.string(),
    gender: z.string().optional().nullable(),
    date_of_death: z.string().optional().nullable(),
    signature: z.string().optional().nullable(),
});

// ============================================
// REGISTER DECEASED
// ============================================

export const registerNewDeceased = async (
    req: Request,
    res: Response
): Promise<Response> => {
    let tenantId: string | undefined;
    let tenantSlug: string | undefined;
    let full_name = "";
    let deceased_id = "";

    try {
        const tenant = (req as any).tenant;
        const dbName = tenant?.db_name;
        tenantId = tenant?.id;
        tenantSlug = (req as any).tenantSlug || "unknown";

        if (!dbName) {
            Logger.warn({ message: "Missing tenant database information" });
            return res.status(400).json({
                success: false,
                message: "Please provide valid X-tenant headers"
            });
        }

        // ==============================
        // VALIDATE BODY
        // ==============================

        const validation = registerDeceasedSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                errors: validation.error.flatten().fieldErrors
            });
        }

        const data = validation.data;
        full_name = data.full_name;

        // ==============================
        // CREATE ID
        // ==============================

        deceased_id = generateUniqueDeceasedId(full_name, tenantSlug);
        const now = getKenyaTimeISO();

        // ==============================
        // INSERT RECORD
        // ==============================

        const insertQuery = `
            INSERT INTO deceased
            (
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
                date_of_death,
                signature,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await safeTenantExecute(
            dbName,
            insertQuery,
            [
                deceased_id,
                data.full_name,
                data.cause_of_death,
                data.date_of_birth || null,
                data.national_id,
                data.received_from || null,
                data.permit_no || null,
                data.age,
                data.time_received,
                data.body_status,
                data.contact_person,
                data.tell_no,
                data.gender || null,
                data.date_of_death || null,
                data.signature || null,
                now
            ]
        );

        Logger.info({ message: `Deceased registered ${deceased_id}` });

        // ==============================
        // SEND NOTIFICATION - SUCCESS (1 hour TTL)
        // ==============================

        if (tenantSlug) {
            // Register service with 1-hour TTL for notifications
            redisService.registerService({
                name: SERVICE_NAME,
                maxMemoryMB: 10,
                softLimitMB: 8,
                notificationTTL: 3600, // 1 hour
                balanceTTL: 300,
            });

            await redisService.storeNotification(
                tenantSlug,
                SERVICE_NAME,
                {
                    id: `notif_${Date.now()}_${deceased_id}`,
                    tenantSlug,
                    type: NotificationType.SUCCESS,
                    priority: NotificationPriority.HIGH,
                    title: "Deceased Registered Successfully",
                    message: `${data.full_name} has been received.`,
                    data: {
                        deceased_id,
                        full_name: data.full_name,
                        gender: data.gender,
                        age: data.age,
                        tenantId
                    },
                    source: SERVICE_NAME,
                }
            );
        }

        // ==============================
        // INVALIDATE CACHE
        // ==============================

        if (tenantSlug && tenantId) {
            await redisService.serviceDel(SERVICE_NAME, tenantSlug, `deceased:list:${tenantId}`);
            await redisService.serviceDel(SERVICE_NAME, tenantSlug, `deceased:stats:${tenantId}`);
            Logger.info(`[Cache]  Cache invalidated for tenant ${tenantSlug}`);
        }

        return res.status(201).json({
            success: true,
            message: "Deceased registered successfully",
            deceased_id
        });

    } catch (error: any) {
        Logger.error({
            message: "Error registering deceased",
            error
        });

        // ==============================
        // SEND NOTIFICATION - ERROR (1 hour TTL)
        // ==============================

        if (tenantSlug) {
            redisService.registerService({
                name: SERVICE_NAME,
                maxMemoryMB: 10,
                softLimitMB: 8,
                notificationTTL: 3600, // 1 hour
                balanceTTL: 300,
            });

            await redisService.storeNotification(
                tenantSlug,
                SERVICE_NAME,
                {
                    id: `notif_error_${Date.now()}`,
                    tenantSlug,
                    type: NotificationType.ERROR,
                    priority: NotificationPriority.CRITICAL,
                    title: "Deceased Registration Failed",
                    message: `Registration failed for ${full_name || 'unknown'}`,
                    data: {
                        deceased_id: deceased_id || null,
                        full_name: full_name || null,
                        tenantId,
                        error: error.message || 'Unknown error'
                    },
                    source: SERVICE_NAME,
                }
            );
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};