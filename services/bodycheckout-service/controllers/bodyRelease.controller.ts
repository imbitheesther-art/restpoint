import { Request, Response, NextFunction } from 'express';
import * as Zod from 'zod';
import axios from 'axios';
import Logger from '../../../packages/shared-logger/dist/index';
import { generateDatedCheckoutId } from '../utilities/generateCheckoutId';
import { getTenantDB } from '../../../shared/dbConfig';

// Validation schema
const releaseBodySchema = Zod.z.object({
  id_number: Zod.z.string().min(1, "ID number is required"),
  next_kin: Zod.z.string().min(1, "Next of kin is required"),
  tell_number: Zod.z.string().min(1, "Telephone number is required"),
  terms_accepted: Zod.z.boolean().refine(val => val === true, {
    message: "Terms must be accepted"
  }),
  everything_paid: Zod.z.boolean(),
  admission_number: Zod.z.string().optional(),
  date_of_removal: Zod.z.string().optional(),
  time_of_removal: Zod.z.string().optional(),
  name_of_deceased: Zod.z.string().optional(),
  permit_number: Zod.z.string().optional(),
  mode_of_transport: Zod.z.string().optional(),
  relationship: Zod.z.string().optional(),
  signature: Zod.z.string().optional(),
  staff_name: Zod.z.string().optional(),
  staff_signature: Zod.z.string().optional(),
  received_by: Zod.z.string().optional(),
  items_returned: Zod.z.string().optional(),
  notes: Zod.z.string().optional()
});

// Helper function to format date for MySQL (YYYY-MM-DD)
const formatDateForMySQL = (dateStr?: string): string | null => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  } catch {
    return null;
  }
};

// Helper function to format datetime for MySQL (YYYY-MM-DD HH:MM:SS)
const formatDateTimeForMySQL = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

// Helper function to format time for MySQL (HH:MM:SS)
const formatTimeForMySQL = (timeStr?: string): string | null => {
  if (!timeStr) return null;
  try {
    // If time is in ISO format, extract just the time part
    if (timeStr.includes('T')) {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().slice(11, 19);
    }
    // If time is already in HH:MM:SS format, return as is
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr;
    }
    // If time is in HH:MM format, add :00 seconds
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      return `${timeStr}:00`;
    }
    return null;
  } catch {
    return null;
  }
};

// POST /body-release/checkout - Create new release
export const releaseBodyController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] as string || req.headers['X-tenant-slug'] as string;
    
    if (!tenantSlug) {
      res.status(400).json({
        success: false,
        message: 'Tenant slug is required'
      });
      return;
    }

    // Validate request body
    const validatedData = releaseBodySchema.parse(req.body);
    
    // Generate release ID
    const releaseId = generateDatedCheckoutId();
    Logger.info(`[RELEASE] Generated release ID: ${releaseId} for tenant: ${tenantSlug}`);

    // Get current datetime in MySQL format
    const currentDateTime = formatDateTimeForMySQL(new Date());

    // Prepare data for insertion with properly formatted dates
    const releaseData = {
      release_id: releaseId,
      tenant_slug: tenantSlug,
      admission_number: validatedData.admission_number || null,
      name_of_deceased: validatedData.name_of_deceased || null,
      next_kin: validatedData.next_kin,
      id_number: validatedData.id_number,
      tell_number: validatedData.tell_number,
      relationship: validatedData.relationship || null,
      date_of_removal: formatDateForMySQL(validatedData.date_of_removal),
      time_of_removal: formatTimeForMySQL(validatedData.time_of_removal),
      permit_number: validatedData.permit_number || null,
      mode_of_transport: validatedData.mode_of_transport || null,
      terms_accepted: validatedData.terms_accepted ? 1 : 0,
      everything_paid: validatedData.everything_paid ? 1 : 0,
      signature: validatedData.signature || null,
      staff_name: validatedData.staff_name || null,
      staff_signature: validatedData.staff_signature || null,
      received_by: validatedData.received_by || null,
      items_returned: validatedData.items_returned || null,
      notes: validatedData.notes || null,
      created_at: currentDateTime
    };

    // Log the formatted data for debugging
    Logger.info(`[RELEASE] Formatted date_of_removal: ${releaseData.date_of_removal}`);
    Logger.info(`[RELEASE] Formatted time_of_removal: ${releaseData.time_of_removal}`);
    Logger.info(`[RELEASE] Formatted created_at: ${releaseData.created_at}`);

    // Save to database - direct database lookup by slug
    const db = await getTenantDB(tenantSlug);
    const query = `
      INSERT INTO body_releases (
        release_id, tenant_slug, admission_number, name_of_deceased,
        next_kin, id_number, tell_number, relationship,
        date_of_removal, time_of_removal, permit_number, mode_of_transport,
        terms_accepted, everything_paid, signature, staff_name, staff_signature,
        received_by, items_returned, notes,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      releaseData.release_id,
      releaseData.tenant_slug,
      releaseData.admission_number,
      releaseData.name_of_deceased,
      releaseData.next_kin,
      releaseData.id_number,
      releaseData.tell_number,
      releaseData.relationship,
      releaseData.date_of_removal,
      releaseData.time_of_removal,
      releaseData.permit_number,
      releaseData.mode_of_transport,
      releaseData.terms_accepted,
      releaseData.everything_paid,
      releaseData.signature,
      releaseData.staff_name,
      releaseData.staff_signature,
      releaseData.received_by,
      releaseData.items_returned,
      releaseData.notes,
      releaseData.created_at
    ];

    await db.execute(query, params);
    Logger.info(`[RELEASE] Successfully created release: ${releaseId} in database: ${tenantSlug}`);

    // Update deceased status if admission number is provided
    if (validatedData.admission_number) {
      try {
        // Call deceased service API to update status
        const deceasedServiceUrl = process.env.DECEASED_SERVICE_URL || 'http://deceased-service:5003';
        await axios.post(
          `${deceasedServiceUrl}/deceased/update-status`,
          {
            admission_number: validatedData.admission_number,
            body_status: 'Released',
            is_embalmed: true
          },
          {
            headers: {
              'x-tenant-slug': tenantSlug,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        );
        Logger.info(`[RELEASE] Updated deceased status to Released via API for admission: ${validatedData.admission_number}`);
      } catch (error) {
        Logger.error(`[RELEASE] Failed to update deceased status: ${error.message}`);
        // Don't fail the release if status update fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Body release created successfully',
      data: {
        release_id: releaseData.release_id,
        admission_number: releaseData.admission_number,
        name_of_deceased: releaseData.name_of_deceased,
        next_kin: releaseData.next_kin,
        id_number: releaseData.id_number,
        tell_number: releaseData.tell_number,
        relationship: releaseData.relationship,
        date_of_removal: releaseData.date_of_removal,
        time_of_removal: releaseData.time_of_removal,
        permit_number: releaseData.permit_number,
        mode_of_transport: releaseData.mode_of_transport,
        terms_accepted: !!releaseData.terms_accepted,
        everything_paid: !!releaseData.everything_paid,
        created_at: releaseData.created_at
      }
    });
  } catch (error: any) {
    Logger.error({
      message: 'Error creating body release',
      error: error.message,
      stack: error.stack
    });

    if (error instanceof Zod.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues
      });
      return;
    }

    // Check for database-specific errors
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        success: false,
        message: 'A release with this ID already exists'
      });
      return;
    }

    if (error.code === 'ER_NO_REFERENCED_ROW' || error.code === 'ER_NO_REFERENCED_ROW_2') {
      res.status(400).json({
        success: false,
        message: 'Invalid admission number or deceased record not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};