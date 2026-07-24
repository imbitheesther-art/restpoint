import { Request, Response } from "express";
import { safeTenantQuery } from "../../../shared/dbConfig";
import generateAdmissionNumber from "./generateAdmissionNumber";
import Logger from "../../../packages/shared-logger/src/index";

/**
 * GET /admission-number/:gender
 * Pre-generates an admission number based on the deceased's gender.
 * Queries the database for the next sequence number for this tenant.
 */
export const getAdmissionNumber = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const gender = (req.params.gender as string) || "M";
        const dbName = (req as any).tenant?.db_name;
        const tenantSlug = (req as any).tenantSlug || "unknown";

        if (!dbName) {
            return res.status(400).json({
                success: false,
                message: "Tenant database not configured"
            });
        }

        // Get the current max sequence number for this tenant across all genders
        const countQuery = `SELECT COUNT(*) as total FROM deceased WHERE (is_deleted = 0 OR is_deleted IS NULL)`;
        const countResult = await safeTenantQuery(dbName, countQuery);
        const total = Number((countResult as any)[0]?.total || 0);
        const nextSequence = total + 1;

        const admissionNumber = generateAdmissionNumber(gender, nextSequence);

        Logger.info({
            message: `Admission number generated for ${gender}: ${admissionNumber}`,
            tenantSlug,
            sequence: nextSequence
        });

        return res.status(200).json({
            success: true,
            data: {
                admission_number: admissionNumber,
                sequence: nextSequence,
                gender
            }
        });

    } catch (error: any) {
        Logger.error({
            message: "Error generating admission number",
            error
        });

        return res.status(500).json({
            success: false,
            message: "Failed to generate admission number"
        });
    }
};