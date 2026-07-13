const asyncHandler = require('express-async-handler');
const { safeTenantQuery, resolveDatabase, lookupTenantDatabase } = require('../../../shared/dbConfig');
const { logger } = require('@montezuma/shared-logger');

/**
 * Aggregated comprehensive dashboard - calls all small controllers internally
 */
const getComprehensiveDashboard = asyncHandler(async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-tenant-id'] || 'system_shared';
    const branchId = req.headers['x-branch-id'] || req.query.branchId || null;
    const resolveSlug = branchId ? `${tenantSlug}-${branchId}` : tenantSlug;
    let dbName;
    try {
        dbName = await resolveDatabase(resolveSlug) || await lookupTenantDatabase(tenantSlug);
    } catch (err) {
        console.warn(`[Dashboard] DB unavailable for ${tenantSlug}, returning empty data`);
    }

    const startTime = Date.now();

    // If DB is not available (Docker not running), return empty data structure
    if (!dbName) {
        return res.status(200).json({
            success: true,
            data: {
                deceased: { total: 0, thisMonth: 0, thisWeek: 0, today: 0, active: 0, released: 0, caseStatus: [], monthlyTrends: [] },
                bookings: { total: 0, thisWeek: 0, today: 0, booked: 0, completed: 0, fleet: { available: 0, booked: 0, maintenance: 0, total: 0 } },
                revenue: { total: '0.00', collected: '0.00', outstanding: '0.00', currentMonth: '0.00', collectionRate: 0, monthlyTrends: [] },
                coffins: { totalTypes: 0, totalStock: 0, totalValue: '0.00', sales: [] },
                chemicals: { recent: [], usageTrends: [] },
                workshop: { orders: { total: 0, completed: 0, pending: 0, revenue: '0.00', profit: '0.00' }, production: [] },
                metadata: { currency: 'KES', executionTime: 0, timestamp: new Date().toISOString(), note: 'Database unavailable - Docker not running' }
            },
            metadata: { requestId, timestamp: new Date().toISOString(), executionTime: 0 }
        });
    }

    try {
        // Run all analytics queries in parallel for speed
        const [
            deceasedCount,
            caseStatus,
            deceasedTrends,
            bookingCounts,
            hearseFleet,
            revenueSummary,
            revenueTrends,
            coffinInventory,
            coffinSales,
            chemicalStock,
            chemicalTrends,
            workshopSummary,
            workshopProduction
        ] = await Promise.allSettled([
            safeTenantQuery(dbName, `SELECT COUNT(*) as total, COUNT(CASE WHEN MONTH(date_admitted)=MONTH(CURDATE()) AND YEAR(date_admitted)=YEAR(CURDATE()) THEN 1 END) as this_month, COUNT(CASE WHEN WEEK(date_admitted)=WEEK(CURDATE()) AND YEAR(date_admitted)=YEAR(CURDATE()) THEN 1 END) as this_week, COUNT(CASE WHEN DATE(date_admitted)=CURDATE() THEN 1 END) as today, COUNT(CASE WHEN status IN ('Under Care','Admitted','Received') THEN 1 END) as active, COUNT(CASE WHEN status IN ('Released','Dispatched','Completed') THEN 1 END) as released FROM deceased`),
            safeTenantQuery(dbName, `SELECT COALESCE(status,'Unknown') as status, COUNT(*) as count FROM deceased GROUP BY status ORDER BY count DESC`),
            safeTenantQuery(dbName, `SELECT DATE_FORMAT(date_admitted,'%b %Y') as month_label, COUNT(*) as count FROM deceased WHERE date_admitted >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY DATE_FORMAT(date_admitted,'%Y-%m'), DATE_FORMAT(date_admitted,'%b %Y') ORDER BY DATE_FORMAT(date_admitted,'%Y-%m') ASC`),
            safeTenantQuery(dbName, `SELECT COUNT(*) as total, COUNT(CASE WHEN WEEK(booking_date)=WEEK(CURDATE()) AND YEAR(booking_date)=YEAR(CURDATE()) THEN 1 END) as this_week, COUNT(CASE WHEN DATE(booking_date)=CURDATE() THEN 1 END) as today, COUNT(CASE WHEN status='booked' THEN 1 END) as booked, COUNT(CASE WHEN status='completed' THEN 1 END) as completed FROM hearse_bookings`),
            safeTenantQuery(dbName, `SELECT COALESCE(status,'unknown') as status, COUNT(*) as count FROM hearses GROUP BY status`),
            safeTenantQuery(dbName, `SELECT COALESCE(SUM(total_mortuary_charge),0) as total_revenue, COALESCE(SUM(CASE WHEN status IN ('Released','Dispatched','Completed') THEN total_mortuary_charge ELSE 0 END),0) as collected, COALESCE(SUM(COALESCE(balance,0)),0) as outstanding, COALESCE(SUM(CASE WHEN MONTH(date_admitted)=MONTH(CURDATE()) AND YEAR(date_admitted)=YEAR(CURDATE()) THEN total_mortuary_charge ELSE 0 END),0) as current_month FROM deceased`),
            safeTenantQuery(dbName, `SELECT DATE_FORMAT(date_admitted,'%b %Y') as month, COALESCE(SUM(total_mortuary_charge),0) as revenue, COUNT(*) as cases FROM deceased WHERE date_admitted >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY DATE_FORMAT(date_admitted,'%Y-%m'), DATE_FORMAT(date_admitted,'%b %Y') ORDER BY DATE_FORMAT(date_admitted,'%Y-%m') ASC`),
            safeTenantQuery(dbName, `SELECT COUNT(*) as total_types, COALESCE(SUM(COALESCE(quantity,0)),0) as total_stock, COALESCE(SUM(COALESCE(exact_price,0)*COALESCE(quantity,0)),0) as total_value FROM coffins`),
            safeTenantQuery(dbName, `SELECT c.type, COUNT(dc.coffin_id) as sold, COALESCE(SUM(c.exact_price),0) as revenue FROM coffins c LEFT JOIN deceased_coffin dc ON c.coffin_id=dc.coffin_id GROUP BY c.coffin_id, c.type ORDER BY sold DESC LIMIT 10`),
            safeTenantQuery(dbName, `SELECT COALESCE(chemical_type,'Unknown') as chemical, COALESCE(SUM(COALESCE(quantity_used,0)),0) as total_used, COALESCE(unit,'units') as unit FROM chemicals_usage WHERE usage_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY chemical_type, unit ORDER BY total_used DESC`),
            safeTenantQuery(dbName, `SELECT COALESCE(chemical_type,'Unknown') as chemical, MONTH(usage_date) as month_num, DATE_FORMAT(usage_date,'%b') as month, COALESCE(SUM(COALESCE(quantity_used,0)),0) as qty FROM chemicals_usage WHERE usage_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY chemical_type, MONTH(usage_date), DATE_FORMAT(usage_date,'%b') ORDER BY chemical_type, month_num`),
            safeTenantQuery(dbName, `SELECT COUNT(*) as total_orders, SUM(CASE WHEN status IN ('completed','delivered') THEN 1 ELSE 0 END) as completed, COALESCE(SUM(selling_price),0) as revenue, COALESCE(SUM(profit),0) as profit FROM coffin_orders`),
            safeTenantQuery(dbName, `SELECT stage, COUNT(*) as total, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed, SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) as in_progress FROM production_stages GROUP BY stage ORDER BY FIELD(stage,'design','cutting','assembly','polishing','finishing')`)
        ]);

        // Safely extract values from Promise.allSettled results
        const extractValue = (result, index = 0) => {
            if (result.status === 'fulfilled') {
                const data = result.value;
                return data && data[index] ? data[index] : data[0] || data || {};
            }
            return {};
        };
        const extractArray = (result) => {
            if (result.status === 'fulfilled') return result.value || [];
            return [];
        };

        const dc = extractValue(deceasedCount, 0);
        const cs = extractArray(caseStatus);
        const dt = extractArray(deceasedTrends);
        const bc = extractValue(bookingCounts, 0);
        const hf = extractArray(hearseFleet);
        const rs = extractValue(revenueSummary, 0);
        const rt = extractArray(revenueTrends);
        const ci = extractValue(coffinInventory, 0);
        const csl = extractArray(coffinSales);
        const chs = extractArray(chemicalStock);
        const cht = extractArray(chemicalTrends);
        const ws = extractValue(workshopSummary, 0);
        const wp = extractArray(workshopProduction);

        // Build fleet status map
        const fleetMap = {};
        (hf || []).forEach(r => { fleetMap[r.status] = r.count; });

        // Build response
        const data = {
            deceased: {
                total: dc?.total || 0,
                thisMonth: dc?.this_month || 0,
                thisWeek: dc?.this_week || 0,
                today: dc?.today || 0,
                active: dc?.active || 0,
                released: dc?.released || 0,
                caseStatus: (cs || []).map(r => ({ status: r.status, count: r.count })),
                monthlyTrends: (dt || []).map(r => ({ month: r.month_label, count: r.count }))
            },
            bookings: {
                total: bc?.total || 0,
                thisWeek: bc?.this_week || 0,
                today: bc?.today || 0,
                booked: bc?.booked || 0,
                completed: bc?.completed || 0,
                fleet: {
                    available: fleetMap['available'] || 0,
                    booked: fleetMap['booked'] || 0,
                    maintenance: fleetMap['maintenance'] || 0,
                    total: Object.values(fleetMap).reduce((a, b) => a + b, 0)
                }
            },
            revenue: {
                total: parseFloat(rs?.total_revenue || 0).toFixed(2),
                collected: parseFloat(rs?.collected || 0).toFixed(2),
                outstanding: parseFloat(rs?.outstanding || 0).toFixed(2),
                currentMonth: parseFloat(rs?.current_month || 0).toFixed(2),
                collectionRate: rs?.total_revenue > 0 ? ((rs.collected / rs.total_revenue) * 100).toFixed(1) : 0,
                monthlyTrends: (rt || []).map(r => ({ month: r.month, revenue: parseFloat(r.revenue || 0).toFixed(2), cases: r.cases || 0 }))
            },
            coffins: {
                totalTypes: ci?.total_types || 0,
                totalStock: ci?.total_stock || 0,
                totalValue: parseFloat(ci?.total_value || 0).toFixed(2),
                sales: (csl || []).map(r => ({ type: r.type || 'Unknown', sold: r.sold || 0, revenue: parseFloat(r.revenue || 0).toFixed(2) }))
            },
            chemicals: {
                recent: (chs || []).map(r => ({ chemical: r.chemical, totalUsed: parseFloat(r.total_used || 0).toFixed(1), unit: r.unit })),
                usageTrends: (cht || []).map(r => ({ chemical: r.chemical, month: r.month, quantity: parseFloat(r.qty || 0).toFixed(1) }))
            },
            workshop: {
                orders: {
                    total: ws?.total_orders || 0,
                    completed: ws?.completed || 0,
                    pending: (ws?.total_orders || 0) - (ws?.completed || 0),
                    revenue: parseFloat(ws?.revenue || 0).toFixed(2),
                    profit: parseFloat(ws?.profit || 0).toFixed(2)
                },
                production: (wp || []).map(r => ({ stage: r.stage, total: r.total || 0, completed: r.completed || 0, inProgress: r.in_progress || 0 }))
            },
            metadata: {
                currency: 'KES',
                executionTime: Date.now() - startTime,
                timestamp: new Date().toISOString()
            }
        };

        // Emit to Socket.IO for real-time updates
        const io = req.app && req.app.get('io');
        if (io) {
            io.emit('dashboard_update', { type: 'DASHBOARD_UPDATE', data, timestamp: new Date().toISOString() });
        }

        res.status(200).json({
            success: true,
            data,
            metadata: { requestId, timestamp: new Date().toISOString(), executionTime: Date.now() - startTime }
        });
    } catch (error) {
        logger.error(`[${requestId}] Comprehensive dashboard error:`, error);
        res.status(500).json({ success: false, message: error.message, metadata: { requestId, timestamp: new Date().toISOString() } });
    }
});

module.exports = { getComprehensiveDashboard };