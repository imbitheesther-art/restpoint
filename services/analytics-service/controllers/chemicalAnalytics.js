const asyncHandler = require('express-async-handler');
const { safeTenantQuery, resolveDatabase, lookupTenantDatabase } = require('../../../shared/dbConfig');
const { logger } = require('@montezuma/shared-logger');

/**
 * Get chemical stock levels - current stock, usage rates, low stock alerts
 */
const getChemicalStockSummary = asyncHandler(async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-tenant-id'] || 'system_shared';
    const dbName = await resolveDatabase(tenantSlug) || await lookupTenantDatabase(tenantSlug);

    if (!dbName) {
        return res.status(404).json({ success: false, message: 'Tenant database not found' });
    }

    try {
        const results = await safeTenantQuery(dbName, `
      SELECT 
        COALESCE(chemical_type, 'Unknown') as chemical_type,
        COALESCE(SUM(COALESCE(quantity_used, 0)), 0) as total_used,
        COALESCE(unit, 'units') as unit,
        COUNT(*) as usage_records,
        MAX(usage_date) as last_used
      FROM chemicals_usage
      WHERE usage_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY chemical_type, unit
      ORDER BY total_used DESC
    `);

        res.status(200).json({
            success: true,
            data: (results || []).map(r => ({
                chemical: r.chemical_type,
                totalUsed: parseFloat(r.total_used || 0).toFixed(1),
                unit: r.unit,
                usageRecords: r.usage_records || 0,
                lastUsed: r.last_used || null
            })),
            metadata: { requestId, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        logger.error(`[${requestId}] Chemical stock error:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Get chemical usage trends - monthly usage for last 12 months
 */
const getChemicalUsageTrends = asyncHandler(async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-tenant-id'] || 'system_shared';
    const dbName = await resolveDatabase(tenantSlug) || await lookupTenantDatabase(tenantSlug);

    if (!dbName) {
        return res.status(404).json({ success: false, message: 'Tenant database not found' });
    }

    try {
        const results = await safeTenantQuery(dbName, `
      SELECT 
        COALESCE(chemical_type, 'Unknown') as chemical_type,
        MONTH(usage_date) as month_num,
        DATE_FORMAT(usage_date, '%b') as month_label,
        COALESCE(SUM(COALESCE(quantity_used, 0)), 0) as quantity,
        COALESCE(unit, 'units') as unit
      FROM chemicals_usage
      WHERE usage_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY chemical_type, MONTH(usage_date), DATE_FORMAT(usage_date, '%b'), unit
      ORDER BY chemical_type, month_num
    `);

        res.status(200).json({
            success: true,
            data: (results || []).map(r => ({
                chemical: r.chemical_type,
                month: r.month_label,
                quantity: parseFloat(r.quantity || 0).toFixed(1),
                unit: r.unit
            })),
            metadata: { requestId, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        logger.error(`[${requestId}] Chemical trends error:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = {
    getChemicalStockSummary,
    getChemicalUsageTrends
};