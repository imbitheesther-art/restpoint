import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { DateTime } from 'luxon';
import PDFDocument from 'pdfkit';

import { safeTenantExecute, safeTenantQuery, resolveDatabase } from '../../../shared/dbConfig';

interface TenantRequest extends Request {
    tenantSlug?: string;
}

const nowNairobi = (): string => {
    return DateTime.now().setZone('Africa/Nairobi').toFormat('yyyy-MM-dd HH:mm:ss');
};

const formatFacilityName = (tenantSlug: string): string => {
    if (!tenantSlug || tenantSlug === 'system_shared') return 'RestPoint Mortuary';
    return tenantSlug
        .replace(/[-_]/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
        .join(' ');
};

const ensurePostmortemTable = async (dbName: string): Promise<void> => {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS postmortem (
            id INT AUTO_INCREMENT PRIMARY KEY,
            deceased_id VARCHAR(100) NOT NULL,
            pathologist_name VARCHAR(255),
            external_pathologist_name VARCHAR(255),
            external_pathologist_mobile VARCHAR(20),
            external_pathologist_id VARCHAR(50),
            examination_summary TEXT,
            cause_of_death TEXT,
            immediate_cause_of_death TEXT,
            underlying_cause_of_death TEXT,
            contributing_conditions TEXT,
            manner_of_death VARCHAR(50),
            requesting_authority VARCHAR(100),
            findings JSON,
            head_findings TEXT,
            chest_findings TEXT,
            abdomen_findings TEXT,
            extremities_findings TEXT,
            toxicology_findings TEXT,
            custom_findings JSON,
            report_pdf_url VARCHAR(500),
            staff_username VARCHAR(255),
            mortuary_name VARCHAR(255),
            status VARCHAR(50) DEFAULT 'pending',
            requested_by VARCHAR(255),
            requested_at DATETIME,
            completed_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_by INT,
            updated_by INT,
            FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
            INDEX idx_deceased_id (deceased_id),
            INDEX idx_status (status),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    try {
        await safeTenantExecute(dbName, createTableSQL, []);
        console.log(`Postmortem table ensured for database: ${dbName}`);
    } catch (error) {
        console.error(`Failed to create postmortem table:`, error);
        throw error;
    }
};

export const requestPostmortem = async (req: TenantRequest, res: Response): Promise<Response> => {
    const tenantSlug = req.headers['x-slug'] as string || req.headers['x-tenant-slug'] as string || req.tenantSlug;
    if (!tenantSlug || tenantSlug === 'system_shared') {
        return res.status(400).json({ success: false, message: 'Valid tenant required. Please provide x-tenant-slug header' });
    }
    try {
        const { deceased_id, reason, requested_by } = req.body;
        if (!deceased_id || !reason || !requested_by) {
            return res.status(400).json({ success: false, message: 'deceased_id, reason, and requested_by are required' });
        }
        const dbName = await resolveDatabase(tenantSlug);
        if (!dbName) {
            return res.status(404).json({ success: false, message: `No database configured for tenant: ${tenantSlug}` });
        }
        await ensurePostmortemTable(dbName);
        const now = nowNairobi();
        const requestId = `PMREQ-${Date.now()}-${deceased_id}`;
        const existingQuery = 'SELECT id FROM postmortem WHERE deceased_id = ?';
        const existing = await safeTenantQuery(dbName, existingQuery, [deceased_id]);
        if (existing && (existing as any[]).length > 0) {
            const updateQuery = `UPDATE postmortem SET status = 'pending', requested_by = ?, requested_at = ?, requesting_authority = ?, updated_at = ? WHERE deceased_id = ?`;
            await safeTenantExecute(dbName, updateQuery, [requested_by, now, reason, now, deceased_id]);
        } else {
            const insertQuery = `INSERT INTO postmortem (deceased_id, status, requested_by, requested_at, requesting_authority, examination_summary, created_at, updated_at) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?)`;
            await safeTenantExecute(dbName, insertQuery, [deceased_id, requested_by, now, reason, reason, now, now]);
        }
        
        // Emit socket event for real-time update
        emitPostmortemUpdate(tenantSlug, deceased_id, { status: 'pending', requested_by, requested_at: now, requesting_authority: reason });
        
        return res.status(200).json({ success: true, message: 'Postmortem request submitted successfully', data: { requestId, deceased_id, status: 'pending' } });
    } catch (error: any) {
        console.error('Error in requestPostmortem:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const savePostmortem = async (req: TenantRequest, res: Response): Promise<Response> => {
    const tenantSlug = req.headers['x-slug'] as string || req.headers['x-tenant-slug'] as string || req.tenantSlug;

    if (!tenantSlug || tenantSlug === 'system_shared') {
        return res.status(400).json({
            success: false,
            message: 'Valid tenant required. Please provide x-tenant-slug header'
        });
    }

    try {
        const {
            deceased_id,
            pathologist_name,
            external_pathologist_name,
            external_pathologist_mobile,
            external_pathologist_id,
            examination_summary,
            cause_of_death,
            immediate_cause_of_death,
            underlying_cause_of_death,
            contributing_conditions,
            manner_of_death,
            requesting_authority,
            findings,
            head_findings,
            chest_findings,
            abdomen_findings,
            extremities_findings,
            toxicology_findings,
            custom_findings,
            staff_username,
            mortuary_name
        } = req.body;

        if (!deceased_id) {
            return res.status(400).json({
                success: false,
                message: 'deceased_id is required'
            });
        }

        const dbName = await resolveDatabase(tenantSlug);

        if (!dbName) {
            return res.status(404).json({
                success: false,
                message: `No database configured for tenant: ${tenantSlug}`
            });
        }

        await ensurePostmortemTable(dbName);

        const existingQuery = 'SELECT id FROM postmortem WHERE deceased_id = ?';
        const existing = await safeTenantQuery(dbName, existingQuery, [deceased_id]);

        const now = nowNairobi();

        if (existing && (existing as any[]).length > 0) {
            const updateQuery = `
                UPDATE postmortem SET
                    pathologist_name = ?,
                    external_pathologist_name = ?,
                    external_pathologist_mobile = ?,
                    external_pathologist_id = ?,
                    examination_summary = ?,
                    cause_of_death = ?,
                    immediate_cause_of_death = ?,
                    underlying_cause_of_death = ?,
                    contributing_conditions = ?,
                    manner_of_death = ?,
                    requesting_authority = ?,
                    findings = ?,
                    head_findings = ?,
                    chest_findings = ?,
                    abdomen_findings = ?,
                    extremities_findings = ?,
                    toxicology_findings = ?,
                    custom_findings = ?,
                    staff_username = ?,
                    mortuary_name = ?,
                    updated_at = ?
                WHERE deceased_id = ?
            `;

            await safeTenantExecute(dbName, updateQuery, [
                pathologist_name,
                external_pathologist_name,
                external_pathologist_mobile,
                external_pathologist_id,
                examination_summary,
                cause_of_death,
                immediate_cause_of_death,
                underlying_cause_of_death,
                contributing_conditions,
                manner_of_death,
                requesting_authority,
                typeof findings === 'string' ? findings : JSON.stringify(findings),
                head_findings || null,
                chest_findings || null,
                abdomen_findings || null,
                extremities_findings || null,
                toxicology_findings || null,
                custom_findings || null,
                staff_username || null,
                mortuary_name || null,
                now,
                deceased_id
            ]);
            
            // Emit socket event for real-time update
            emitPostmortemUpdate(tenantSlug, deceased_id, { status: 'completed', pathologist_name, cause_of_death, manner_of_death, completed_at: now });

            return res.status(200).json({
                success: true,
                message: 'Postmortem data saved successfully',
                data: { deceased_id }
            });
        } else {
            const insertQuery = `
                INSERT INTO postmortem (
                    deceased_id, pathologist_name, external_pathologist_name,
                    external_pathologist_mobile, external_pathologist_id,
                    examination_summary, cause_of_death, immediate_cause_of_death,
                    underlying_cause_of_death, contributing_conditions, manner_of_death,
                    requesting_authority, findings, 
                    head_findings, chest_findings, abdomen_findings, extremities_findings, toxicology_findings,
                    custom_findings,
                    staff_username, mortuary_name, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await safeTenantExecute(dbName, insertQuery, [
                deceased_id,
                pathologist_name,
                external_pathologist_name,
                external_pathologist_mobile,
                external_pathologist_id,
                examination_summary,
                cause_of_death,
                immediate_cause_of_death,
                underlying_cause_of_death,
                contributing_conditions,
                manner_of_death,
                requesting_authority,
                typeof findings === 'string' ? findings : JSON.stringify(findings),
                head_findings || null,
                chest_findings || null,
                abdomen_findings || null,
                extremities_findings || null,
                toxicology_findings || null,
                custom_findings || null,
                staff_username || null,
                mortuary_name || null,
                now,
                now
            ]);
            
            // Emit socket event for real-time update
            emitPostmortemUpdate(tenantSlug, deceased_id, { status: 'completed', pathologist_name, cause_of_death, manner_of_death, completed_at: now });

            return res.status(201).json({
                success: true,
                message: 'Postmortem data saved successfully',
                data: { id: (result as any).insertId, deceased_id }
            });
        }
    } catch (error: any) {
        console.error('Error in savePostmortem:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Emit socket event for real-time updates via socketio-service
const emitPostmortemUpdate = async (tenantSlug: string, deceasedId: string, data: any) => {
    // Use the correct port from .env (5018) not 8010
    const socketioServiceUrl = process.env.SOCKETIO_SERVICE_URL || 'http://localhost:5018';
    
    console.log('[POSTMORTEM] 📤 Attempting to emit notification:', {
        tenantSlug,
        deceasedId,
        status: data.status,
        socketioServiceUrl,
        envUrl: process.env.SOCKETIO_SERVICE_URL,
        timestamp: new Date().toISOString()
    });
    
    try {
        // Dynamically import axios (it's in dependencies)
        const axios = require('axios');
        
        // Validate tenant slug for the emit endpoint
        if (!tenantSlug || tenantSlug === 'system_shared') {
            console.warn('[POSTMORTEM] ⚠️ Skipping emit - no valid tenant slug');
            return;
        }
        
        // Emit postmortem update event
        try {
            console.log('[POSTMORTEM] 📤 Emitting postmortem-updated event...');
            const response = await axios.post(`${socketioServiceUrl}/emit/postmortem-updated`, {
                tenantSlug,
                data: {
                    deceasedId,
                    data,
                    timestamp: new Date().toISOString()
                }
            }, { 
                timeout: 5000,
                headers: { 'Content-Type': 'application/json' }
            });
            
            console.log('[POSTMORTEM] ✅ Successfully emitted postmortem-updated:', {
                status: response.status,
                data: response.data
            });
        } catch (error) {
            console.error('[POSTMORTEM] ❌ Failed to emit postmortem-updated:', {
                error: error.message,
                code: error.code,
                url: `${socketioServiceUrl}/emit/postmortem-updated`
            });
        }
        
        // Emit high-priority notification for postmortem completion
        if (data.status === 'completed') {
            const notificationPayload = {
                tenantSlug,
                data: {
                    id: `postmortem-${Date.now()}`,
                    type: 'postmortem_completed',
                    title: 'Postmortem Completed',
                    message: `Postmortem examination has been completed for deceased ID: ${deceasedId}`,
                    fullContent: `Postmortem Status: Completed\nDeceased ID: ${deceasedId}\nPathologist: ${data.pathologist_name || 'N/A'}\nCause of Death: ${data.cause_of_death || 'N/A'}\nManner of Death: ${data.manner_of_death || 'N/A'}\nCompleted At: ${data.completed_at || 'N/A'}`,
                    priority: 'high',
                    data: {
                        deceased_id: deceasedId,
                        status: 'completed',
                        pathologist_name: data.pathologist_name,
                        cause_of_death: data.cause_of_death,
                        manner_of_death: data.manner_of_death,
                        completed_at: data.completed_at
                    },
                    timestamp: new Date().toISOString(),
                    expiresAt: Date.now() + (2 * 60 * 60 * 1000) // 2 hours TTL
                }
            };
            
            console.log('[POSTMORTEM] 📤 Notification payload:', JSON.stringify(notificationPayload, null, 2));
            
            try {
                const response = await axios.post(`${socketioServiceUrl}/emit/postmortem-completed`, notificationPayload, { 
                    timeout: 5000,
                    headers: { 'Content-Type': 'application/json' }
                });
                
                console.log('[POSTMORTEM] ✅ Successfully emitted postmortem-completed notification:', {
                    status: response.status,
                    data: response.data
                });
            } catch (error) {
                console.error('[POSTMORTEM] ❌ Failed to emit postmortem-completed notification:', {
                    error: error.message,
                    code: error.code,
                    url: `${socketioServiceUrl}/emit/postmortem-completed`,
                    stack: error.stack,
                    response: error.response?.data,
                    statusCode: error.response?.status
                });
                
                // Try localhost fallback if Docker DNS fails
                if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                    try {
                        console.log('[POSTMORTEM] 🔁 Trying localhost fallback on port 5018...');
                        const fallbackResponse = await axios.post(`http://localhost:5018/emit/postmortem-completed`, notificationPayload, { 
                            timeout: 5000,
                            headers: { 'Content-Type': 'application/json' }
                        });
                        console.log('[POSTMORTEM] ✅ Successfully emitted via localhost fallback:', {
                            status: fallbackResponse.status,
                            data: fallbackResponse.data
                        });
                    } catch (fallbackError) {
                        console.error('[POSTMORTEM] ❌ Localhost fallback also failed:', {
                            error: fallbackError.message,
                            code: fallbackError.code,
                            response: fallbackError.response?.data
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('[POSTMORTEM] ❌ Socket emit error:', error);
    }
};

export const getPostmortemByDeceasedId = async (req: TenantRequest, res: Response): Promise<Response> => {
    const tenantSlug = req.headers['x-slug'] as string || req.headers['x-tenant-slug'] as string || req.tenantSlug;
    const { deceased_id } = req.params;

    if (!deceased_id || !tenantSlug) {
        return res.status(400).json({
            success: false,
            message: 'deceased_id and tenant are required'
        });
    }

    try {
        const dbName = await resolveDatabase(tenantSlug);
        if (!dbName) {
            return res.status(404).json({
                success: false,
                message: `No database configured for tenant: ${tenantSlug}`
            });
        }

        await ensurePostmortemTable(dbName);

        const selectQuery = `
            SELECT 
                id, deceased_id, pathologist_name, external_pathologist_name,
                external_pathologist_mobile, external_pathologist_id,
                examination_summary, cause_of_death, immediate_cause_of_death,
                underlying_cause_of_death, contributing_conditions, manner_of_death,
                requesting_authority, findings, 
                head_findings, chest_findings, abdomen_findings, extremities_findings, toxicology_findings,
                custom_findings, report_pdf_url,
                created_at, updated_at
            FROM postmortem
            WHERE deceased_id = ?
        `;

        const records = await safeTenantQuery(dbName, selectQuery, [deceased_id]);

        if (!records || (records as any[]).length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Postmortem record not found'
            });
        }

        const postmortem = (records as any[])[0];
        
        if (postmortem.findings && typeof postmortem.findings === 'string') {
            try {
                postmortem.findings = JSON.parse(postmortem.findings);
            } catch (e) {
                // Keep as is if not valid JSON
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Postmortem record fetched successfully',
            data: postmortem
        });
    } catch (error: any) {
        console.error('❌ Error in getPostmortemByDeceasedId:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

export const updatePostmortem = async (req: TenantRequest, res: Response): Promise<Response> => {
    const tenantSlug = req.headers['x-slug'] as string || req.headers['x-tenant-slug'] as string || req.tenantSlug;
    const { id } = req.params;

    if (!id || !tenantSlug) {
        return res.status(400).json({
            success: false,
            message: 'id and tenant are required'
        });
    }

    try {
        const dbName = await resolveDatabase(tenantSlug);
        if (!dbName) {
            return res.status(404).json({
                success: false,
                message: `No database configured for tenant: ${tenantSlug}`
            });
        }

        const updates = req.body;
        const allowedFields = [
            'pathologist_name', 'external_pathologist_name', 'external_pathologist_mobile',
            'external_pathologist_id', 'examination_summary', 'cause_of_death',
            'immediate_cause_of_death', 'underlying_cause_of_death', 'contributing_conditions',
            'manner_of_death', 'requesting_authority', 'findings', 'report_pdf_url'
        ];

        const fields: string[] = [];
        const values: any[] = [];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(field === 'findings' && typeof updates[field] === 'object' 
                    ? JSON.stringify(updates[field])
                    : updates[field]);
            }
        }

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        fields.push('updated_at = ?');
        values.push(nowNairobi());
        values.push(id);

        const updateQuery = `UPDATE postmortem SET ${fields.join(', ')} WHERE id = ?`;
        await safeTenantExecute(dbName, updateQuery, values);

        return res.status(200).json({
            success: true,
            message: 'Postmortem record updated successfully'
        });
    } catch (error: any) {
        console.error('Error in updatePostmortem:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

/**
 * Generate postmortem PDF - Compact Grid Layout
 */


export const generatePostmortemPDF = async (req: TenantRequest, res: Response): Promise<void> => {
    const tenantSlug = req.headers['x-slug'] as string || req.headers['x-tenant-slug'] as string || req.tenantSlug;
    const { deceased_id } = req.params;

    if (!deceased_id || !tenantSlug) {
        res.status(400).json({ success: false, message: 'deceased_id and tenant are required' });
        return;
    }

    try {
        const dbName = await resolveDatabase(tenantSlug);
        if (!dbName) {
            res.status(404).json({ success: false, message: `No database configured for tenant: ${tenantSlug}` });
            return;
        }

        const postmortemQuery = `
            SELECT 
                immediate_cause_of_death,
                underlying_cause_of_death,
                manner_of_death,
                examination_summary,
                external_pathologist_name,
                pathologist_name,
                external_pathologist_id
            FROM postmortem 
            WHERE deceased_id = ?
        `;
        const postmortemResults = await safeTenantQuery(dbName, postmortemQuery, [deceased_id]);

        if (!postmortemResults || (postmortemResults as any[]).length === 0) {
            res.status(404).json({ success: false, message: 'Postmortem record not found' });
            return;
        }

        const postmortem = (postmortemResults as any[])[0];

        const deceasedQuery = `
            SELECT 
                full_name,
                date_of_death,
                signature
            FROM deceased 
            WHERE deceased_id = ?
        `;
        const deceasedResults = await safeTenantQuery(dbName, deceasedQuery, [deceased_id]);
        const deceased = deceasedResults && (deceasedResults as any[]).length > 0 ? (deceasedResults as any[])[0] : null;

        const facilityName = formatFacilityName(tenantSlug);
        const reportDate = DateTime.now().setZone('Africa/Nairobi').toFormat('yyyy-MM-dd');
        const reportRef = `ME-${deceased_id}-${DateTime.now().toFormat('yyyyMMdd')}`;
        const fullTimestamp = DateTime.now().setZone('Africa/Nairobi').toFormat('yyyy-MM-dd hh:mm:ss a');

        const immediateCause = postmortem.immediate_cause_of_death || 'Pending determination';
        const underlyingCause = postmortem.underlying_cause_of_death || 'Pending determination';
        const mannerOfDeath = postmortem.manner_of_death || 'Natural';
        const pathStatement = postmortem.examination_summary || 'No additional statement provided.';
        const examinerName = postmortem.external_pathologist_name || postmortem.pathologist_name || 'Dr. Alex Mercer, M.D.';
        const examinerTitle = postmortem.external_pathologist_id ? 'M.D., Forensic Pathologist' : 'Chief Medical Examiner';

        const deceasedIdStr = typeof deceased_id === 'string' ? deceased_id : String(deceased_id);
        const fullName = deceased?.full_name || 'Unknown';

        // Load Signature Image Buffer
        let signatureBuffer: Buffer | null = null;
        const signaturePath = deceased?.signature;
        
        if (signaturePath && typeof signaturePath === 'string' && !signaturePath.startsWith('data:image')) {
            try {
                const relativePath = signaturePath.replace(/^\/uploads\//, '');
                const uploadsBase = process.env.UPLOADS_BASE_DIR || path.resolve(process.cwd(), 'uploads');
                const fsPath = path.join(uploadsBase, relativePath);

                if (fs.existsSync(fsPath)) {
                    signatureBuffer = fs.readFileSync(fsPath);
                }
            } catch (sigError) {
                console.warn(`[PDF] Failed to load signature:`, sigError);
            }
        }

        const doc = new PDFDocument({
            size: 'LETTER',
            margin: 0,
            info: {
                Title: 'Official Autopsy Report',
                Author: facilityName,
                Subject: 'Autopsy Report'
            }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="autopsy-${deceasedIdStr}.pdf"`);
        doc.pipe(res);

        const PAGE_WIDTH = doc.page.width;   // 612
        const PAGE_HEIGHT = doc.page.height; // 792
        const MARGIN = 48;
        const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2); // 516

        // Pre-calculate heights to distribute space across page
        doc.font('Helvetica').fontSize(9.5);
        const statementTextHeight = doc.heightOfString(pathStatement, { width: CONTENT_WIDTH - 28, lineGap: 3 });
        const statementBoxHeight = Math.max(90, Math.min(200, statementTextHeight + 24));
        const verticalGap = statementTextHeight < 80 ? 24 : 16;

        // ========== WATERMARK ==========
        doc.save();
        doc.translate(PAGE_WIDTH / 2, PAGE_HEIGHT / 2);
        doc.rotate(-35);
        doc.fontSize(80);
        doc.fillOpacity(0.025);
        doc.font('Helvetica-Bold');
        doc.fillColor('#000000');
        doc.text('OFFICIAL COPY', -250, -40, { align: 'center', width: 500 });
        doc.restore();

        let y = 48;

        // ========== 1. TOP HEADER BAR ==========
        // Shield Icon
        doc.save();
        doc.strokeColor('#0a0a0a');
        doc.lineWidth(2.2);
        const lx = MARGIN, ly = y;
        doc.moveTo(lx + 12, ly + 2).lineTo(lx + 22, ly + 6).lineTo(lx + 22, ly + 18)
           .bezierCurveTo(lx + 22, ly + 26, lx + 12, ly + 31, lx + 12, ly + 33)
           .bezierCurveTo(lx + 12, ly + 31, lx + 2, ly + 26, lx + 2, ly + 18)
           .lineTo(lx + 2, ly + 6).closePath().stroke();
        doc.moveTo(lx + 12, ly + 8).lineTo(lx + 12, ly + 24);
        doc.moveTo(lx + 4, ly + 16).lineTo(lx + 20, ly + 16);
        doc.stroke();
        doc.restore();

        // Smaller, refined title (Reduced from 20pt -> 16pt)
        doc.font('Helvetica-Bold').fontSize(16).fillColor('#0a0a0a');
        doc.text('OFFICIAL AUTOPSY REPORT', MARGIN + 32, y + 6);

        // Top Right Meta Block (Expanded width & increased spacing to avoid line collisions)
        const metaWidth = 180;
        const metaX = PAGE_WIDTH - MARGIN - metaWidth;
        
        doc.font('Helvetica-Bold').fontSize(7).fillColor('#888888');
        doc.text('CASE NUMBER', metaX, y, { width: metaWidth, align: 'right' });
        
        doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1a1a1a');
        const refHeight = doc.heightOfString(reportRef, { width: metaWidth });
        doc.text(reportRef, metaX, y + 9, { width: metaWidth, align: 'right' });

        const dateMetaY = y + 11 + refHeight;
        doc.font('Helvetica-Bold').fontSize(7).fillColor('#888888');
        doc.text('DATE ISSUED', metaX, dateMetaY, { width: metaWidth, align: 'right' });
        doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1a1a1a');
        doc.text(reportDate, metaX, dateMetaY + 9, { width: metaWidth, align: 'right' });

        y = Math.max(y + 48, dateMetaY + 22);
        
        doc.strokeColor('#0a0a0a').lineWidth(2);
        doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).stroke();

        y += verticalGap;

        // ========== 2. FACILITY & DECEDENT GRID ==========
        const colWidth = (CONTENT_WIDTH - 24) / 2;
        const rightColX = MARGIN + colWidth + 24;

        // Facility Block (Dynamically measured height to prevent pushing address into facility name)
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a1a1a');
        const facNameHeight = doc.heightOfString(facilityName, { width: colWidth });
        doc.text(facilityName, MARGIN, y, { width: colWidth });

        let addressY = y + facNameHeight + 3;
        doc.font('Helvetica').fontSize(8.5).fillColor('#444444');
        doc.text('1234 Memorial Drive', MARGIN, addressY, { width: colWidth });
        doc.text('Suite 500, Metro City, ST 12345', MARGIN, addressY + 12, { width: colWidth });
        doc.text('Phone: (555) 123-4567 | Fax: (555) 123-9876', MARGIN, addressY + 24, { width: colWidth });

        // Deceased Grid
        doc.font('Helvetica-Bold').fontSize(7).fillColor('#777777');
        doc.text('DECEASED NAME', rightColX, y, { width: colWidth, align: 'right' });
        
        doc.font('Helvetica-Bold').fontSize(11.5).fillColor('#1a1a1a');
        doc.text(fullName, rightColX, y + 9, { width: colWidth, align: 'right' });
        doc.strokeColor('#d0d0d0').lineWidth(0.8)
           .moveTo(rightColX + colWidth - 200, y + 24)
           .lineTo(rightColX + colWidth, y + 24).stroke();

        doc.font('Helvetica-Bold').fontSize(7).fillColor('#777777');
        doc.text('ADMISSION NO.', rightColX, y + 30, { width: colWidth, align: 'right' });

        doc.font('Helvetica-Bold').fontSize(11.5).fillColor('#1a1a1a');
        doc.text(deceasedIdStr, rightColX, y + 39, { width: colWidth, align: 'right' });
        doc.strokeColor('#d0d0d0').lineWidth(0.8)
           .moveTo(rightColX + colWidth - 200, y + 54)
           .lineTo(rightColX + colWidth, y + 54).stroke();

        y += Math.max(facNameHeight + 38, 62) + (verticalGap / 2);

        // ========== 3. SECTION 01: CAUSE OF DEATH ==========
        doc.fillColor('#0a0a0a').rect(MARGIN, y, CONTENT_WIDTH, 18).fill();
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
        doc.text('01', MARGIN + 8, y + 5);
        doc.text('OFFICIAL DETERMINATION OF DEATH', MARGIN + 28, y + 5);

        y += 24;

        // Immediate Cause
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#777777');
        doc.text('IMMEDIATE CAUSE', MARGIN, y);
        y += 10;

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#0a0a0a');
        doc.text('a.', MARGIN, y);
        doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#0a0a0a');
        const immLines = doc.heightOfString(immediateCause, { width: CONTENT_WIDTH - 20 });
        doc.text(immediateCause, MARGIN + 18, y, { width: CONTENT_WIDTH - 18, height: 28, ellipsis: true });
        
        y += Math.min(immLines, 28) + 3;
        doc.strokeColor('#0a0a0a').lineWidth(1).moveTo(MARGIN + 18, y).lineTo(PAGE_WIDTH - MARGIN, y).stroke();

        y += 6;

        // Arrow Pointer
        doc.font('Helvetica-Oblique').fontSize(7.5).fillColor('#555555');
        doc.text('↓ Due to (or as a consequence of)', MARGIN + 18, y);

        y += 14;

        // Underlying Cause
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#777777');
        doc.text('UNDERLYING CAUSE', MARGIN, y);
        y += 10;

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#0a0a0a');
        doc.text('b.', MARGIN, y);
        doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#0a0a0a');
        const undLines = doc.heightOfString(underlyingCause, { width: CONTENT_WIDTH - 20 });
        doc.text(underlyingCause, MARGIN + 18, y, { width: CONTENT_WIDTH - 18, height: 28, ellipsis: true });

        y += Math.min(undLines, 28) + 3;
        doc.strokeColor('#0a0a0a').lineWidth(1).moveTo(MARGIN + 18, y).lineTo(PAGE_WIDTH - MARGIN, y).stroke();

        y += 14;

        // Manner of Death Radio Grid
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#777777');
        doc.text('MANNER OF DEATH', MARGIN, y);
        y += 12;

        const manners = ['Natural', 'Accident', 'Suicide', 'Homicide', 'Undetermined'];
        let mX = MARGIN;
        const itemGap = CONTENT_WIDTH / 5;

        for (const m of manners) {
            const isChecked = m.toLowerCase() === mannerOfDeath.toLowerCase();

            doc.save();
            doc.strokeColor('#0a0a0a').lineWidth(1.2);
            doc.circle(mX + 5, y + 4, 5);
            if (isChecked) {
                doc.fillColor('#0a0a0a').fill();
                doc.fillColor('#ffffff').circle(mX + 5, y + 4, 1.8).fill();
            } else {
                doc.stroke();
            }
            doc.restore();

            doc.font('Helvetica-Bold').fontSize(9).fillColor('#1a1a1a');
            doc.text(m, mX + 14, y);
            mX += itemGap;
        }

        y += 24 + (verticalGap / 2);

        // ========== 4. SECTION 02: PATHOLOGIST STATEMENT ==========
        doc.fillColor('#0a0a0a').rect(MARGIN, y, CONTENT_WIDTH, 18).fill();
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
        doc.text('02', MARGIN + 8, y + 5);
        doc.text('PATHOLOGIST STATEMENT & EXAMINATION SUMMARY', MARGIN + 28, y + 5);

        y += 24;

        // Narrative Box
        doc.save();
        doc.fillColor('#fbfbfb').rect(MARGIN, y, CONTENT_WIDTH, statementBoxHeight).fill();
        doc.strokeColor('#e0e0e0').lineWidth(0.8).rect(MARGIN, y, CONTENT_WIDTH, statementBoxHeight).stroke();
        doc.strokeColor('#0a0a0a').lineWidth(3).moveTo(MARGIN, y).lineTo(MARGIN, y + statementBoxHeight).stroke();
        doc.restore();

        doc.font('Helvetica').fontSize(9.5).fillColor('#1a1a1a');
        doc.text(pathStatement, MARGIN + 12, y + 10, {
            width: CONTENT_WIDTH - 24,
            height: statementBoxHeight - 20,
            ellipsis: true,
            lineGap: 3
        });

        y += statementBoxHeight + verticalGap;

        // ========== 5. SIGNATURE & STAMP BLOCK ==========
        const sigBlockY = Math.max(y, 615);

        // Left Side: Certified Signature Meta
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#777777');
        doc.text('CERTIFIED BY — FORENSIC PATHOLOGIST', MARGIN, sigBlockY);

        // Expanded Signature Image Size (Increased width for better visibility)
        let sigHeightOffset = 52;
        if (signatureBuffer) {
            try {
                doc.image(signatureBuffer, MARGIN, sigBlockY + 10, { fit: [280, 55] });
                sigHeightOffset = 64;
            } catch (err) {
                doc.font('Helvetica-Oblique').fontSize(14).fillColor('#1a1a1a');
                doc.text(examinerName, MARGIN, sigBlockY + 14);
            }
        } else {
            doc.font('Helvetica-Oblique').fontSize(14).fillColor('#1a1a1a');
            doc.text(examinerName, MARGIN, sigBlockY + 14);
        }

        doc.strokeColor('#0a0a0a').lineWidth(1)
           .moveTo(MARGIN, sigBlockY + sigHeightOffset + 2)
           .lineTo(MARGIN + 280, sigBlockY + sigHeightOffset + 2).stroke();

        doc.font('Helvetica-Bold').fontSize(7).fillColor('#777777');
        doc.text('NAME / TITLE', MARGIN, sigBlockY + sigHeightOffset + 6);
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#1a1a1a');
        doc.text(`${examinerName}, ${examinerTitle}`, MARGIN, sigBlockY + sigHeightOffset + 15);

        // Right Side: Custom Blue Stamp Seal
        const stampRadius = 38;
        const stampX = PAGE_WIDTH - MARGIN - stampRadius - 15;
        const stampY = sigBlockY + stampRadius;

        doc.save();
        doc.translate(stampX, stampY);
        doc.rotate(-8);

        doc.strokeColor('#170C79').lineWidth(2.2).circle(0, 0, stampRadius).stroke();
        doc.strokeColor('#170C79').lineWidth(1).circle(0, 0, stampRadius - 3.5).stroke();

        doc.fillColor('#170C79').font('Helvetica-Bold').fontSize(8);
        doc.text('CERTIFIED', -stampRadius, -16, { width: stampRadius * 2, align: 'center' });
        doc.font('Helvetica').fontSize(7);
        doc.text('Medical', -stampRadius, -6, { width: stampRadius * 2, align: 'center' });
        doc.text('Examiner', -stampRadius, 3, { width: stampRadius * 2, align: 'center' });
        doc.text('Official', -stampRadius, 12, { width: stampRadius * 2, align: 'center' });

        doc.restore();

        doc.save();
        doc.translate(stampX, stampY + stampRadius + 5);
        doc.rotate(-8);
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#170C79');
        doc.text(examinerName, -60, 0, { width: 120, align: 'center' });
        doc.restore();

        // ========== 6. CLEAN FOOTER (NON-OVERLAPPING) ==========
        const footerY = 754;

        doc.strokeColor('#e5e5e5').lineWidth(0.8)
           .moveTo(MARGIN, footerY)
           .lineTo(PAGE_WIDTH - MARGIN, footerY).stroke();

        // Left Side Footer Block
        doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#777777');
        doc.text('REPORT GENERATED: ', MARGIN, footerY + 8, { width: 180, continued: true });
        doc.font('Helvetica').fillColor('#aaaaaa').text(fullTimestamp);

        // Center Title
        doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#aaaaaa');
        doc.text('OFFICIAL AUTOPSY REPORT', MARGIN, footerY + 8, { width: CONTENT_WIDTH, align: 'center' });

        // Right Side Footer Block (Right aligned, fixed width 200px)
        doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#777777');
        doc.text('DIGITALLY SIGNED: ', PAGE_WIDTH - MARGIN - 200, footerY + 8, { width: 200, align: 'right', continued: true });
        doc.font('Helvetica').fillColor('#aaaaaa').text(reportDate);

        doc.end();

    } catch (error: any) {
        console.error('Error in generatePostmortemPDF:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};