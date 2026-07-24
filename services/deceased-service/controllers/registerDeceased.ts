import { Request, Response } from "express";
import { safeTenantExecute, safeTenantQuery } from "../../../shared/dbConfig";
import Logger from "../../../packages/shared-logger/src/index";
import { getKenyaTimeISO } from "../../../packages/shared-utils/dist/timestamps";
import generateUniqueDeceasedId from "../utils/deceasedId";
import generateAdmissionNumber from "../utils/generateAdmissionNumber";
import { processSignature } from "../utils/uploadSignature";
import * as z from "zod";
import sharp from "sharp";
import redisService from "../../../packages/shared-services/dist/redisService";

const SERVICE_NAME = 'deceased-service';

// ============================================
// VALIDATION SCHEMA
// ============================================

const registerDeceasedSchema = z.object({
    full_name: z.string().min(4, "Full name must have at least 4 characters"),
    cause_of_death: z.string().optional().nullable(),
    date_of_birth: z.string().optional().nullable(),
    national_id: z.string().optional().nullable(),
    received_from: z.string().optional().nullable(),
    permit_no: z.string().optional().nullable(),
    age: z.number().int().min(0).optional().nullable(),
    time_received: z.string().optional().nullable(),
    body_status: z.string().optional().nullable(),
    contact_person: z.string().optional().nullable(),
    tell_no: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    date_of_death: z.string().optional().nullable(),
    signature: z.string().optional().nullable(),
    place_of_death: z.string().optional().nullable(),
    physician: z.string().optional().nullable(),
    id_type: z.string().optional().nullable(),
    alternative_phone: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    receiving_officer: z.string().optional().nullable(),
    verified_by: z.string().optional().nullable(),
    relationship: z.string().optional().nullable(),
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
        // SAVE SIGNATURE AS PNG FILE
        // ==============================

        let signaturePath = null;
        if (data.signature && data.signature.startsWith('data:image/png;base64,')) {
            try {
                Logger.info({ message: "Saving signature as PNG file" });
                const base64Data = data.signature.replace(/^data:image\/png;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');

                signaturePath = await processSignature(buffer, `sig_${deceased_id}`, tenantSlug);
                Logger.info({
                    message: "Signature saved as PNG file",
                    path: signaturePath,
                    size: `${(buffer.length / 1024).toFixed(2)} KB`
                });
            } catch (sigError) {
                Logger.warn({
                    message: "Failed to save signature as file, storing inline",
                    error: sigError
                });
                // Fallback: compress and store inline
                try {
                    const base64Data = data.signature.replace(/^data:image\/png;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    const compressedBuffer = await sharp(buffer)
                        .resize(400, 200, { fit: 'inside', withoutEnlargement: true })
                        .png({ quality: 60, compressionLevel: 9 })
                        .toBuffer();
                    signaturePath = `data:image/png;base64,${compressedBuffer.toString('base64')}`;
                } catch {
                    signaturePath = data.signature;
                }
            }
        }

        // ==============================
        // GENERATE ADMISSION NUMBER
        // ==============================

        const countQuery = `SELECT COUNT(*) as total FROM deceased WHERE (is_deleted = 0 OR is_deleted IS NULL)`;
        const countResult = await safeTenantQuery(dbName, countQuery);
        const total = Number((countResult as any)[0]?.total || 0);
        const nextSequence = total + 1;
        const admission_number = generateAdmissionNumber(data.gender || "M", nextSequence);

        // ==============================
        // INSERT RECORD
        // ==============================

        // Insert deceased with all fields
        const insertQuery = `
            INSERT INTO deceased
            (
                deceased_id,
                admission_number,
                full_name,
                gender,
                age,
                date_of_birth,
                date_of_death,
                date_admitted,
                time_received,
                cause_of_death,
                place_of_death,
                physician,
                body_status,
                national_id,
                id_type,
                email,
                phone_number,
                alternative_phone,
                received_from,
                receiving_officer,
                signature,
                verified_by,
                relationship,
                permit_number,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await safeTenantExecute(
            dbName,
            insertQuery,
            [
                deceased_id,
                admission_number,
                data.full_name,
                data.gender || null,
                data.age || 0,
                data.date_of_birth || null,
                data.date_of_death || null,
                now,
                data.time_received || null,
                data.cause_of_death || null,
                data.place_of_death || null,
                data.physician || null,
                data.body_status || 'Normal Condition',
                data.national_id || null,
                data.id_type || null,
                data.email || null,
                data.tell_no || null,
                data.alternative_phone || null,
                data.received_from || null,
                data.receiving_officer || null,
                signaturePath,
                data.verified_by || null,
                data.relationship || null,
                data.permit_no || null,
                now
            ]
        );

        Logger.info({ message: `Deceased registered ${deceased_id} - Admission: ${admission_number}` });

        // ==============================
        // INVALIDATE CACHE
        // ==============================
        if (tenantSlug && tenantId) {
            await redisService.serviceDel('deceased-service', tenantSlug, `deceased:detail:${deceased_id}`);
            await redisService.serviceDel('deceased-service', tenantSlug, `deceased:list:${tenantId}`);
            Logger.info(`[Cache] 🧹 Deceased cache invalidated for ${tenantSlug}`);
        }

        // Auto-register next of kin if contact details provided
        let nextOfKinRegistered = false;
        if (data.contact_person || data.tell_no) {
            try {
                const nextOfKinData = {
                    deceased_id,
                    full_name: data.contact_person || 'Not Provided',
                    relationship: data.relationship || 'Not Specified',
                    contact: data.tell_no || '',
                    email: data.email || null,
                    alternative_phone: data.alternative_phone || null,
                    id_number: data.national_id || null,
                    id_type: data.id_type || null,
                    address: null,
                    is_primary: true,
                    created_by: data.verified_by || null
                };

                const { NextOfKinModel } = await import('../models/NextOfKin.js');
                await NextOfKinModel.create(req, nextOfKinData);
                nextOfKinRegistered = true;
                Logger.info({ message: `Next of kin auto-registered for ${deceased_id}` });
            } catch (nextOfKinError) {
                Logger.warn({
                    message: `Failed to auto-register next of kin for ${deceased_id}`,
                    error: nextOfKinError
                });
            }
        }

        return res.status(201).json({
            success: true,
            message: "Deceased registered successfully",
            deceased_id,
            admission_number,
            signature_path: signaturePath,
            next_of_kin_registered: nextOfKinRegistered,
            data: {
                deceased_id,
                admission_number,
                full_name: data.full_name,
                gender: data.gender,
                contact_person: data.contact_person,
                relationship: data.relationship
            }
        });

    } catch (error: any) {
        Logger.error({
            message: "Error registering deceased",
            error: error.message || error
        });

        return res.status(500).json({
            success: false,
            message: error.sqlMessage || error.message || "Internal server error"
        });
    }
};