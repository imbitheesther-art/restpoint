const asyncHandler = require('express-async-handler');
const { safeTenantQuery, resolveDatabase, lookupTenantDatabase } = require('../../../shared/dbConfig');
const { logger } = require('@montezuma/shared-logger');

/**
 * Get revenue summary - total, collected, outstanding, current month
 */
const getRevenueSummary = asyncHandler(async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-tenant-id'] || 'system_shared';
    const dbName = await resolveDatabase(tenantSlug) || await lookupTenantDatabase(tenantSlug);

    if (!dbName) {
        return res.status(404).json({ success: false, message: 'Tenant database not found' });
    }

    try {
        const [result] = await safeTenantQuery(dbName, `
      SELECT 
        COALESCE(SUM(total_mortuary_charge), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status IN ('Released','Dispatched','Completed') THEN total_mortuary_charge ELSE 0 END), 0) as collected_revenue,
        COALESCE(SUM(COALESCE(balance, 0)), 0) as total_outstanding,
        COALESCE(SUM(CASE WHEN MONTH(date_admitted) = MONTH(CURDATE()) AND YEAR(date_admitted) = YEAR(CURDATE()) THEN total_mortuary_charge ELSE 0 END), 0) as current_month_revenue,
        COUNT(CASE WHEN COALESCE(balance, 0) > 0 THEN 1 END) as pending_payments_count
      FROM deceased
    `);

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: parseFloat(result?.total_revenue || 0).toFixed(2),
                collectedRevenue: parseFloat(result?.collected_revenue || 0).toFixed(2),
                totalOutstanding: parseFloat(result?.total_outstanding || 0).toFixed(2),
                currentMonthRevenue: parseFloat(result?.current_month_revenue || 0).toFixed(2),
                pendingPayments: result?.pending_payments_count || 0,
                collectionRate: result?.total_revenue > 0
                    ? ((result.collected_revenue / result.total_revenue) * 100).toFixed(1)
                    : 0
            },
            metadata: { requestId, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        logger.error(`[${requestId}] Revenue summary error:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Get monthly revenue trends - last 12 months
 */
const getMonthlyRevenueTrends = asyncHandler(async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-tenant-id'] || 'system_shared';
    const dbName = await resolveDatabase(tenantSlug) || await lookupTenantDatabase(tenantSlug);

    if (!dbName) {
        return res.status(404).json({ success: false, message: 'Tenant database not found' });
    }

    try {
        const results = await safeTenantQuery(dbName, `
      SELECT 
        DATE_FORMAT(date_admitted, '%Y-%m') as month_key,
        DATE_FORMAT(date_admitted, '%b %Y') as month_label,
        COALESCE(SUM(total_mortuary_charge), 0) as revenue,
        COUNT(*) as cases_count,
        COALESCE(SUM(COALESCE(balance, 0)), 0) as outstanding
      FROM deceased 
      WHERE date_admitted >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(date_admitted, '%Y-%m'), DATE_FORMAT(date_admitted, '%b %Y')
      ORDER BY DATE_FORMAT(date_admitted, '%Y-%m') ASC
    `);

        res.status(200).json({
            success: true,
            data: (results || []).map(r => ({
                month: r.month_label,
                revenue: parseFloat(r.revenue || 0).toFixed(2),
                cases: r.cases_count || 0,
                outstanding: parseFloat(r.outstanding || 0).toFixed(2)
            })),
            metadata: { requestId, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        logger.error(`[${requestId}] Revenue trends error:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = {
    getRevenueSummary,
    getMonthlyRevenueTrends
};