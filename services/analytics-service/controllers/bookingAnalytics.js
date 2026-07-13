const asyncHandler = require('express-async-handler');
const { safeTenantQuery, resolveDatabase, lookupTenantDatabase } = require('../../../shared/dbConfig');
const { logger } = require('@montezuma/shared-logger');

/**
 * Get booking counts - total, this week, today, by status
 */
const getBookingCounts = asyncHandler(async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-tenant-id'] || 'system_shared';
    const branchId = req.headers['x-branch-id'] || req.query.branchId || null;
    const resolveSlug = branchId ? `${tenantSlug}-${branchId}` : tenantSlug;
    const dbName = await resolveDatabase(resolveSlug) || await lookupTenantDatabase(tenantSlug);

    if (!dbName) {
        return res.status(404).json({ success: false, message: 'Tenant database not found' });
    }

    try {
        const [result] = await safeTenantQuery(dbName, `
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN WEEK(booking_date) = WEEK(CURDATE()) AND YEAR(booking_date) = YEAR(CURDATE()) THEN 1 END) as this_week,
        COUNT(CASE WHEN DATE(booking_date) = CURDATE() THEN 1 END) as today,
        COUNT(CASE WHEN status = 'booked' THEN 1 END) as booked,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN status IN ('in_progress', 'in_transit') THEN 1 END) as in_progress
      FROM hearse_bookings
    `);

        res.status(200).json({
            success: true,
            data: {
                total: result?.total_bookings || 0,
                thisWeek: result?.this_week || 0,
                today: result?.today || 0,
                booked: result?.booked || 0,
                completed: result?.completed || 0,
                cancelled: result?.cancelled || 0,
                inProgress: result?.in_progress || 0
            },
            metadata: { requestId, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        logger.error(`[${requestId}] Booking counts error:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Get hearse fleet status - available, booked, maintenance counts
 */
const getHearseFleetStatus = asyncHandler(async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-tenant-id'] || 'system_shared';
    const dbName = await resolveDatabase(tenantSlug) || await lookupTenantDatabase(tenantSlug);

    if (!dbName) {
        return res.status(404).json({ success: false, message: 'Tenant database not found' });
    }

    try {
        const results = await safeTenantQuery(dbName, `
      SELECT 
        COALESCE(status, 'unknown') as status,
        COUNT(*) as count
      FROM hearses
      GROUP BY status
    `);

        const statusMap = {};
        (results || []).forEach(r => { statusMap[r.status] = r.count; });

        res.status(200).json({
            success: true,
            data: {
                available: statusMap['available'] || 0,
                booked: statusMap['booked'] || 0,
                maintenance: statusMap['maintenance'] || 0,
                total: Object.values(statusMap).reduce((a, b) => a + b, 0)
            },
            metadata: { requestId, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        logger.error(`[${requestId}] Hearse fleet error:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = {
    getBookingCounts,
    getHearseFleetStatus
};