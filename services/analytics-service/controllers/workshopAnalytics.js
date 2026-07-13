const asyncHandler = require('express-async-handler');
const { safeTenantQuery, resolveDatabase, lookupTenantDatabase } = require('../../../shared/dbConfig');
const { logger } = require('@montezuma/shared-logger');

/**
 * Get workshop production summary - orders, revenue, materials
 */
const getWorkshopSummary = asyncHandler(async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-tenant-id'] || 'system_shared';
    const dbName = await resolveDatabase(tenantSlug) || await lookupTenantDatabase(tenantSlug);

    if (!dbName) {
        return res.status(404).json({ success: false, message: 'Tenant database not found' });
    }

    try {
        const [orderStats] = await safeTenantQuery(dbName, `
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status IN ('completed','delivered') THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status NOT IN ('completed','delivered') THEN 1 ELSE 0 END) as pending_orders,
        COALESCE(SUM(selling_price), 0) as total_revenue,
        COALESCE(SUM(total_cost), 0) as total_cost,
        COALESCE(SUM(profit), 0) as total_profit
      FROM coffin_orders
    `);

        const [materialValue] = await safeTenantQuery(dbName, `
      SELECT 
        COALESCE(SUM(quantity * unit_price), 0) as total_value,
        COUNT(*) as total_materials,
        SUM(CASE WHEN quantity <= min_stock_level THEN 1 ELSE 0 END) as low_stock
      FROM materials
    `);

        const [workerCount] = await safeTenantQuery(dbName, `
      SELECT COUNT(*) as count FROM users WHERE role IN ('worker', 'manager')
    `);

        const orderStatus = await safeTenantQuery(dbName, `
      SELECT status, COUNT(*) as count FROM coffin_orders
      GROUP BY status ORDER BY count DESC
    `);

        res.status(200).json({
            success: true,
            data: {
                orders: {
                    total: orderStats?.total_orders || 0,
                    completed: orderStats?.completed_orders || 0,
                    pending: orderStats?.pending_orders || 0,
                    byStatus: (orderStatus || []).map(s => ({ status: s.status, count: s.count }))
                },
                financials: {
                    totalRevenue: parseFloat(orderStats?.total_revenue || 0).toFixed(2),
                    totalCost: parseFloat(orderStats?.total_cost || 0).toFixed(2),
                    totalProfit: parseFloat(orderStats?.total_profit || 0).toFixed(2)
                },
                materials: {
                    totalValue: parseFloat(materialValue?.total_value || 0).toFixed(2),
                    totalMaterials: materialValue?.total_materials || 0,
                    lowStock: materialValue?.low_stock || 0
                },
                workers: workerCount?.count || 0
            },
            metadata: { requestId, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        logger.error(`[${requestId}] Workshop summary error:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Get workshop production stages status
 */
const getWorkshopProductionStatus = asyncHandler(async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-tenant-id'] || 'system_shared';
    const dbName = await resolveDatabase(tenantSlug) || await lookupTenantDatabase(tenantSlug);

    if (!dbName) {
        return res.status(404).json({ success: false, message: 'Tenant database not found' });
    }

    try {
        const stageStats = await safeTenantQuery(dbName, `
      SELECT 
        stage, COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM production_stages 
      GROUP BY stage
      ORDER BY FIELD(stage, 'design','cutting','assembly','polishing','finishing')
    `);

        res.status(200).json({
            success: true,
            data: (stageStats || []).map(s => ({
                stage: s.stage,
                total: s.total || 0,
                completed: s.completed || 0,
                inProgress: s.in_progress || 0,
                pending: s.pending || 0
            })),
            metadata: { requestId, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        logger.error(`[${requestId}] Workshop production error:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = {
    getWorkshopSummary,
    getWorkshopProductionStatus
};