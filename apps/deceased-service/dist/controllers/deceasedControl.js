"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDeleteDeceased = exports.updateDeceasedRecord = exports.getExportStatus = exports.exportDeceasedToExcel = exports.getDeceasedById = exports.registerDeceased = void 0;
const redisCacheService_1 = require("../services/redisCacheService");
const backgroundWorkerService_1 = require("../services/backgroundWorkerService");
const excelExportService_1 = require("../services/excelExportService");
const db_1 = require("../../../configurations/sqlConfig/db");
const timeStamps_1 = require("../../../utilities/timeStamps/timeStamps");
const logger_1 = require("../../../global/logger/logger");
const crypto_1 = __importDefault(require("crypto"));
const cacheService = redisCacheService_1.RedisCacheService.getInstance();
const backgroundWorker = backgroundWorkerService_1.BackgroundWorkerService.getInstance();
const excelService = excelExportService_1.ExcelExportService.getInstance();
// Helper functions
const logError = (error, context) => {
    logger_1.logger.error(`Error in ${context}`, {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        timestamp: (0, timeStamps_1.getKenyaTimeISO)()
    });
};
const generateUniqueDeceasedId = (fullName, tenantSlug) => {
    const tenantPrefix = tenantSlug.substring(0, 3).toUpperCase();
    const namePart = fullName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    const timestamp = Date.now().toString().slice(-6);
    const random = crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
    return `${tenantPrefix}-${namePart}-${timestamp}-${random}`;
};
// Register Deceased
const registerDeceased = async (req, res) => {
    const tenantSlug = req.tenantSlug || req.headers['x-tenant-slug'];
    if (!tenantSlug || tenantSlug === 'system_shared') {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }
    try {
        const { full_name, cause_of_death, date_of_birth, date_of_death, gender, place_of_death, county, location, national_id, admission_number } = req.body;
        if (!full_name || !date_of_birth || !date_of_death || !gender || !county || !national_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        const deceased_id = generateUniqueDeceasedId(full_name, tenantSlug);
        const portal_slug = `${tenantSlug}-${full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${crypto_1.default.randomBytes(3).toString('hex')}`;
        const now = (0, timeStamps_1.getKenyaTimeISO)();
        const insertQuery = `
      INSERT INTO deceased (
        deceased_id, tenant_id, admission_number, cause_of_death, date_admitted,
        date_of_birth, date_of_death, date_registered, full_name, gender,
        place_of_death, county, national_id, created_at, location, portal_slug, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await (0, db_1.safeQuery)(insertQuery, [
            deceased_id, tenantSlug, admission_number || `ADM-${Date.now()}`,
            cause_of_death || 'Pending', now, date_of_birth, date_of_death, now,
            full_name, gender, place_of_death || 'Not specified', county, national_id,
            now, location || null, portal_slug, req.user?.userId || null
        ]);
        // Queue background cache warmup
        await backgroundWorker.addTask('cache_warmup', tenantSlug, { deceased_id });
        return res.status(201).json({
            success: true,
            message: 'Deceased registered successfully',
            deceased_id,
            tenant: tenantSlug
        });
    }
    catch (error) {
        logError(error, 'registerDeceased');
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.registerDeceased = registerDeceased;
// Get Deceased by ID with Redis Cache
const getDeceasedById = async (req, res) => {
    const tenantSlug = req.tenantSlug || req.headers['x-tenant-slug'];
    const id = (req.query.id || req.params.id || req.body.deceased_id);
    if (!id || !tenantSlug || tenantSlug === 'system_shared') {
        return res.status(400).json({ success: false, message: 'Invalid request' });
    }
    try {
        const cacheKey = `deceased:${tenantSlug}:${id}`;
        // Try Redis cache first
        let cached = await cacheService.get(cacheKey);
        if (cached) {
            return res.status(200).json({
                success: true,
                message: 'Deceased record fetched from cache',
                data: cached,
                cached: true
            });
        }
        // Fetch from database
        const deceasedRows = await (0, db_1.safeQuery)(`SELECT d.*, u.name AS registered_by_name 
       FROM deceased d
       LEFT JOIN users u ON d.created_by = u.id
       WHERE (d.deceased_id = ? OR d.id = ?) AND d.tenant_id = ? AND d.is_deleted = FALSE`, [id, id, tenantSlug]);
        if (!deceasedRows.length) {
            return res.status(404).json({ success: false, message: 'Deceased record not found' });
        }
        const deceased = deceasedRows[0];
        // Cache for future requests
        await cacheService.set(cacheKey, deceased, { ttl: 3600, tenant: tenantSlug });
        return res.status(200).json({
            success: true,
            message: 'Deceased record fetched successfully',
            data: deceased,
            cached: false
        });
    }
    catch (error) {
        logError(error, 'getDeceasedById');
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};
exports.getDeceasedById = getDeceasedById;
// Export to Excel with Background Processing
const exportDeceasedToExcel = async (req, res) => {
    const tenantSlug = req.tenantSlug || req.headers['x-tenant-slug'];
    const { period = 'all', startDate, endDate, async = 'false' } = req.query;
    if (!tenantSlug || tenantSlug === 'system_shared') {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }
    try {
        // For async export, queue the task
        if (async === 'true') {
            const taskId = await backgroundWorker.addTask('excel_export', tenantSlug, {
                period,
                startDate,
                endDate,
                format: 'xlsx'
            });
            return res.status(202).json({
                success: true,
                message: 'Export task queued',
                taskId,
                statusUrl: `/api/v1/deceased/export-status/${taskId}`
            });
        }
        // Synchronous export
        const dateCondition = buildDateCondition(period, startDate, endDate);
        const query = `
      SELECT 
        d.id, d.deceased_id, d.admission_number, d.full_name, d.gender,
        d.date_of_birth, d.date_of_death, d.date_registered, d.cause_of_death,
        d.place_of_death, d.county, d.status, d.coffin_status, d.dispatch_date,
        d.total_mortuary_charge, d.currency, d.is_embalmed, d.national_id,
        COALESCE(SUM(ec.amount), 0) as extra_charges_amount,
        COUNT(DISTINCT nk.id) as next_of_kin_count
      FROM deceased d
      LEFT JOIN extra_charges ec ON d.deceased_id = ec.deceased_id AND ec.status != 'Cancelled'
      LEFT JOIN next_of_kin nk ON d.deceased_id = nk.deceased_id
      WHERE d.tenant_id = ? AND d.is_deleted = FALSE ${dateCondition}
      GROUP BY d.deceased_id
      ORDER BY d.date_registered DESC
      LIMIT 10000
    `;
        const records = await (0, db_1.safeQuery)(query, [tenantSlug]);
        const theme = excelService.getTenantTheme(tenantSlug);
        const buffer = await excelService.generateDeceasedReport(records, {
            period: period,
            startDate: startDate,
            endDate: endDate,
            tenantTheme: theme
        });
        const filename = `${tenantSlug}_deceased_records_${Date.now()}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        return res.send(buffer);
    }
    catch (error) {
        logError(error, 'exportDeceasedToExcel');
        return res.status(500).json({
            success: false,
            message: 'Failed to export deceased records'
        });
    }
};
exports.exportDeceasedToExcel = exportDeceasedToExcel;
// Get export task status
const getExportStatus = async (req, res) => {
    const { taskId } = req.params;
    try {
        const status = await backgroundWorker.getJobStatus(taskId);
        if (!status) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        return res.status(200).json({
            success: true,
            taskId,
            state: status.state,
            progress: status.progress,
            result: status.returnvalue,
            error: status.failedReason
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to get task status' });
    }
};
exports.getExportStatus = getExportStatus;
// Helper function
function buildDateCondition(period, startDate, endDate) {
    if (period === 'custom' && startDate && endDate) {
        return `AND d.date_registered BETWEEN '${startDate}' AND '${endDate}'`;
    }
    if (period !== 'all') {
        const now = new Date();
        let start;
        switch (period) {
            case 'month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                start = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            case 'year':
                start = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                return '';
        }
        return `AND d.date_registered >= '${start.toISOString().split('T')[0]}'`;
    }
    return '';
}
// Update Deceased Record with Cache Invalidation
const updateDeceasedRecord = async (req, res) => {
    const tenantSlug = req.tenantSlug || req.headers['x-tenant-slug'];
    const { id } = req.params;
    const updates = req.body;
    if (!id || !tenantSlug) {
        return res.status(400).json({ success: false, message: 'Invalid request' });
    }
    try {
        // Build dynamic update query
        const allowedFields = ['full_name', 'gender', 'date_of_birth', 'date_of_death',
            'cause_of_death', 'place_of_death', 'status', 'coffin_status'];
        const updateFields = [];
        const updateValues = [];
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                updateValues.push(updates[field]);
            }
        }
        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }
        updateFields.push('updated_at = ?');
        updateValues.push((0, timeStamps_1.getKenyaTimeISO)());
        updateValues.push(id, id, tenantSlug);
        const updateQuery = `
      UPDATE deceased 
      SET ${updateFields.join(', ')}
      WHERE (deceased_id = ? OR id = ?) AND tenant_id = ? AND is_deleted = FALSE
    `;
        await (0, db_1.safeQuery)(updateQuery, updateValues);
        // Invalidate Redis cache
        const cacheKey = `deceased:${tenantSlug}:${id}`;
        await cacheService.del(cacheKey);
        await cacheService.delPattern(`all_deceased:${tenantSlug}*`);
        return res.status(200).json({
            success: true,
            message: 'Deceased record updated successfully'
        });
    }
    catch (error) {
        logError(error, 'updateDeceasedRecord');
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.updateDeceasedRecord = updateDeceasedRecord;
// Bulk Delete with Cache Invalidation
const bulkDeleteDeceased = async (req, res) => {
    const tenantSlug = req.tenantSlug || req.headers['x-tenant-slug'];
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'Valid IDs array required' });
    }
    try {
        const placeholders = ids.map(() => '?').join(',');
        const deleteQuery = `
      UPDATE deceased 
      SET is_deleted = TRUE, deleted_at = ?, deleted_by = ?
      WHERE (deceased_id IN (${placeholders}) OR id IN (${placeholders})) 
        AND tenant_id = ? AND is_deleted = FALSE
    `;
        const params = [...ids, ...ids, (0, timeStamps_1.getKenyaTimeISO)(), req.user?.userId || null, tenantSlug];
        await (0, db_1.safeQuery)(deleteQuery, params);
        // Invalidate all caches for this tenant
        await cacheService.delPattern(`deceased:${tenantSlug}:*`);
        await cacheService.delPattern(`all_deceased:${tenantSlug}*`);
        return res.status(200).json({
            success: true,
            message: `${ids.length} deceased records deleted successfully`
        });
    }
    catch (error) {
        logError(error, 'bulkDeleteDeceased');
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.bulkDeleteDeceased = bulkDeleteDeceased;
exports.default = {
    registerDeceased: exports.registerDeceased,
    getDeceasedById: exports.getDeceasedById,
    exportDeceasedToExcel: exports.exportDeceasedToExcel,
    getExportStatus: exports.getExportStatus,
    updateDeceasedRecord: exports.updateDeceasedRecord,
    bulkDeleteDeceased: exports.bulkDeleteDeceased
};
