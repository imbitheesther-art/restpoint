const asyncHandler = require('express-async-handler');
const { safeTenantQuery, resolveDatabase, lookupTenantDatabase } = require('../../../shared/dbConfig');

// Simple inline logger (avoid external dependency)
const logger = { error: (...args) => console.error('[Dashboard]', ...args), warn: (...args) => console.warn('[Dashboard]', ...args), info: (...args) => console.log('[Dashboard]', ...args) };

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
                coffins: { totalTypes: 0, totalStock: 0, totalValue: '0.00', sales: [] },
                chemicals: { recent: [], usageTrends: [], lowStock: [], expiringSoon: [], topUsed: [] },
                workshop: { orders: { total: 0, completed: 0, pending: 0, profit: '0.00' }, production: [] },
                hearses: { mostBooked: [], usageStats: [] },
                revenue: { total30d: '0.00', collected30d: '0.00', outstanding30d: '0.00' },
                ppeRequests: [],
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
            coffinInventory,
            coffinSales,
            chemicalStock,
            chemicalTrends,
            workshopSummary,
            workshopProduction,
            mostBookedHearses,
            lowStockChemicals,
            expiringChemicals,
            revenueData,
            chemicalUsageByBranch,
            hearseUsageStats
        ] = await Promise.allSettled([
            safeTenantQuery(dbName, `SELECT COUNT(*) as total, COUNT(CASE WHEN MONTH(date_admitted)=MONTH(CURDATE()) AND YEAR(date_admitted)=YEAR(CURDATE()) THEN 1 END) as this_month, COUNT(CASE WHEN WEEK(date_admitted)=WEEK(CURDATE()) AND YEAR(date_admitted)=YEAR(CURDATE()) THEN 1 END) as this_week, COUNT(CASE WHEN DATE(date_admitted)=CURDATE() THEN 1 END) as today, COUNT(CASE WHEN status IN ('Under Care','Admitted','Received') THEN 1 END) as active, COUNT(CASE WHEN status IN ('Released','Dispatched','Completed') THEN 1 END) as released FROM deceased`),
            safeTenantQuery(dbName, `SELECT COALESCE(status,'Unknown') as status, COUNT(*) as count FROM deceased GROUP BY status ORDER BY count DESC`),
            safeTenantQuery(dbName, `SELECT DATE_FORMAT(date_admitted,'%b %Y') as month_label, COUNT(*) as count FROM deceased WHERE date_admitted >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY DATE_FORMAT(date_admitted,'%Y-%m'), DATE_FORMAT(date_admitted,'%b %Y') ORDER BY DATE_FORMAT(date_admitted,'%Y-%m') ASC`),
            safeTenantQuery(dbName, `SELECT COUNT(*) as total, COUNT(CASE WHEN WEEK(booking_date)=WEEK(CURDATE()) AND YEAR(booking_date)=YEAR(CURDATE()) THEN 1 END) as this_week, COUNT(CASE WHEN DATE(booking_date)=CURDATE() THEN 1 END) as today, COUNT(CASE WHEN status='booked' THEN 1 END) as booked, COUNT(CASE WHEN status='completed' THEN 1 END) as completed FROM hearse_bookings`),
            safeTenantQuery(dbName, `SELECT COALESCE(status,'unknown') as status, COUNT(*) as count FROM hearses GROUP BY status`),
            safeTenantQuery(dbName, `SELECT COUNT(*) as total_types, COALESCE(SUM(COALESCE(quantity,0)),0) as total_stock, COALESCE(SUM(COALESCE(exact_price,0)*COALESCE(quantity,0)),0) as total_value FROM coffins`),
            safeTenantQuery(dbName, `SELECT c.type, COUNT(dc.coffin_id) as sold, COALESCE(SUM(c.exact_price),0) as revenue FROM coffins c LEFT JOIN deceased_coffin dc ON c.coffin_id=dc.coffin_id GROUP BY c.coffin_id, c.type ORDER BY sold DESC LIMIT 10`),
            safeTenantQuery(dbName, `SELECT COALESCE(name,'Unknown') as chemical, COALESCE(current_stock,0) as available, COALESCE(min_stock_level,0) as min_level, COALESCE(unit,'units') as unit FROM chemicals WHERE is_active = 1 ORDER BY available ASC LIMIT 10`),
            safeTenantQuery(dbName, `SELECT COALESCE(name,'Unknown') as chemical, MONTH(created_at) as month_num, DATE_FORMAT(created_at,'%b') as month, COALESCE(SUM(COALESCE(quantity_used,0)),0) as qty FROM deceased_chemical_usage dcu JOIN chemicals c ON c.id = dcu.chemical_id WHERE dcu.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY c.name, MONTH(dcu.created_at), DATE_FORMAT(dcu.created_at,'%b') ORDER BY c.name, month_num`),
            safeTenantQuery(dbName, `SELECT COUNT(*) as total_orders, SUM(CASE WHEN status IN ('completed','delivered') THEN 1 ELSE 0 END) as completed, COALESCE(SUM(profit),0) as profit FROM coffin_orders`),
            safeTenantQuery(dbName, `SELECT stage, COUNT(*) as total, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed, SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) as in_progress FROM production_stages GROUP BY stage ORDER BY FIELD(stage,'design','cutting','assembly','polishing','finishing')`),
            safeTenantQuery(dbName, `SELECT h.id, h.hearse_name, h.plate_number, h.branch_id, b.branch_name, COUNT(hb.id) as total_bookings, SUM(CASE WHEN hb.status='completed' THEN 1 ELSE 0 END) as completed_trips FROM hearses h LEFT JOIN hearse_bookings hb ON hb.hearse_id = h.id LEFT JOIN branches b ON h.branch_id = b.branch_id GROUP BY h.id, h.hearse_name, h.plate_number, h.branch_id, b.branch_name ORDER BY total_bookings DESC LIMIT 10`),
            safeTenantQuery(dbName, `SELECT id, name, category, unit, current_stock, min_stock_level, (current_stock - min_stock_level) as deficit FROM chemicals WHERE is_active = 1 AND current_stock <= min_stock_level ORDER BY (current_stock / min_stock_level) ASC LIMIT 10`),
            safeTenantQuery(dbName, `SELECT id, name, unit, current_stock, min_stock_level, created_at FROM chemicals WHERE is_active = 1 AND DATEDIFF(NOW(), created_at) >= 180 ORDER BY created_at ASC LIMIT 10`),
            safeTenantQuery(dbName, `SELECT COALESCE(SUM(total_charge),0) as total_revenue, COALESCE(SUM(paid_amount),0) as total_collected FROM hearse_bookings WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`),
            safeTenantQuery(dbName, `SELECT c.name, c.category, c.unit, COALESCE(SUM(dcu.quantity_used),0) as total_used, COUNT(DISTINCT dcu.deceased_id) as patient_count FROM chemicals c JOIN deceased_chemical_usage dcu ON dcu.chemical_id = c.id WHERE dcu.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY c.id, c.name, c.category, c.unit ORDER BY total_used DESC LIMIT 10`),
            safeTenantQuery(dbName, `SELECT h.id, h.hearse_name, h.plate_number, h.status, DATEDIFF(NOW(), COALESCE(h.service_due_date, h.created_at)) as days_since_service, (SELECT COUNT(*) FROM hearse_bookings WHERE hearse_id = h.id) as total_trips, (SELECT COUNT(*) FROM hearse_bookings WHERE hearse_id = h.id AND status='completed') as completed_trips FROM hearses h ORDER BY completed_trips DESC LIMIT 10`)
        ]);

        // Safely extract values from Promise.allSettled results
        const extractValue = (result, index = 0) => {
            if (result.status === 'fulfilled') {
                const data = result.value;
                if (data && data.length > 0 && data[index]) {
                    return data[index];
                }
                if (data && data.length > 0) {
                    return data[0];
                }
                return data || {};
            }
            return {};
        };

        const extractArray = (result) => {
            if (result.status === 'fulfilled') {
                return result.value || [];
            }
            return [];
        };

        const dc = extractValue(deceasedCount, 0);
        const cs = extractArray(caseStatus);
        const dt = extractArray(deceasedTrends);
        const bc = extractValue(bookingCounts, 0);
        const hf = extractArray(hearseFleet);
        const ci = extractValue(coffinInventory, 0);
        const csl = extractArray(coffinSales);
        const chs = extractArray(chemicalStock);
        const cht = extractArray(chemicalTrends);
        const ws = extractValue(workshopSummary, 0);
        const wp = extractArray(workshopProduction);
        const mbh = extractArray(mostBookedHearses);
        const lsc = extractArray(lowStockChemicals);
        const expc = extractArray(expiringChemicals);
        const rd = extractValue(revenueData, 0);
        const cub = extractArray(chemicalUsageByBranch);
        const hus = extractArray(hearseUsageStats);

        // Build fleet status map
        const fleetMap = {};
        if (hf && Array.isArray(hf)) {
            hf.forEach(r => {
                if (r && r.status !== undefined) {
                    fleetMap[r.status] = r.count || 0;
                }
            });
        }

        // Build response
        const data = {
            deceased: {
                total: dc?.total || 0,
                thisMonth: dc?.this_month || 0,
                thisWeek: dc?.this_week || 0,
                today: dc?.today || 0,
                active: dc?.active || 0,
                released: dc?.released || 0,
                caseStatus: Array.isArray(cs) ? cs.map(r => ({ status: r.status || 'Unknown', count: r.count || 0 })) : [],
                monthlyTrends: Array.isArray(dt) ? dt.map(r => ({ month: r.month_label || 'Unknown', count: r.count || 0 })) : []
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
                    total: Object.values(fleetMap).reduce((a, b) => a + b, 0) || 0
                }
            },
            coffins: {
                totalTypes: ci?.total_types || 0,
                totalStock: ci?.total_stock || 0,
                totalValue: parseFloat(ci?.total_value || 0).toFixed(2),
                sales: Array.isArray(csl) ? csl.map(r => ({ type: r.type || 'Unknown', sold: r.sold || 0, revenue: parseFloat(r.revenue || 0).toFixed(2) })) : []
            },
            chemicals: {
                recent: Array.isArray(chs) ? chs.map(r => ({ chemical: r.chemical || 'Unknown', available: parseFloat(r.available || 0).toFixed(1), minLevel: parseFloat(r.min_level || 0).toFixed(1), unit: r.unit || 'units' })) : [],
                usageTrends: Array.isArray(cht) ? cht.map(r => ({ chemical: r.chemical || 'Unknown', month: r.month || 'Unknown', quantity: parseFloat(r.qty || 0).toFixed(1) })) : [],
                lowStock: Array.isArray(lsc) ? lsc.map(r => ({ id: r.id, name: r.name || 'Unknown', category: r.category || '', unit: r.unit || 'units', currentStock: parseFloat(r.current_stock || 0), minLevel: parseFloat(r.min_stock_level || 0), deficit: parseFloat(r.deficit || 0) })) : [],
                expiringSoon: Array.isArray(expc) ? expc.map(r => ({ id: r.id, name: r.name || 'Unknown', unit: r.unit || 'units', currentStock: parseFloat(r.current_stock || 0), created: r.created_at })) : [],
                topUsed: Array.isArray(cub) ? cub.map(r => ({ name: r.name || 'Unknown', category: r.category || '', unit: r.unit || 'units', totalUsed: parseFloat(r.total_used || 0), patients: r.patient_count || 0 })) : []
            },
            workshop: {
                orders: {
                    total: ws?.total_orders || 0,
                    completed: ws?.completed || 0,
                    pending: (ws?.total_orders || 0) - (ws?.completed || 0),
                    revenue: parseFloat(ws?.revenue || 0).toFixed(2),
                    profit: parseFloat(ws?.profit || 0).toFixed(2)
                },
                production: Array.isArray(wp) ? wp.map(r => ({ stage: r.stage || 'Unknown', total: r.total || 0, completed: r.completed || 0, inProgress: r.in_progress || 0 })) : []
            },
            hearses: {
                mostBooked: Array.isArray(mbh) ? mbh.map(r => ({
                    id: r.id,
                    name: r.hearse_name || 'Unnamed',
                    plate: r.plate_number || 'N/A',
                    branchId: r.branch_id,
                    branchName: r.branch_name || `Branch ${r.branch_id}`,
                    totalBookings: parseInt(r.total_bookings) || 0,
                    completedTrips: parseInt(r.completed_trips) || 0
                })) : [],
                usageStats: Array.isArray(hus) ? hus.map(r => ({
                    id: r.id,
                    name: r.hearse_name || 'Unnamed',
                    plate: r.plate_number || 'N/A',
                    status: r.status || 'unknown',
                    daysSinceService: parseInt(r.days_since_service) || 0,
                    totalTrips: parseInt(r.total_trips) || 0,
                    completedTrips: parseInt(r.completed_trips) || 0
                })) : []
            },
            revenue: {
                total30d: parseFloat(rd?.total_revenue || 0).toFixed(2),
                collected30d: parseFloat(rd?.total_collected || 0).toFixed(2),
                outstanding30d: (parseFloat(rd?.total_revenue || 0) - parseFloat(rd?.total_collected || 0)).toFixed(2)
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
        res.status(200).json({
            success: true,
            data: {
                deceased: { total: 0, thisMonth: 0, thisWeek: 0, today: 0, active: 0, released: 0, caseStatus: [], monthlyTrends: [] },
                bookings: { total: 0, thisWeek: 0, today: 0, booked: 0, completed: 0, fleet: { available: 0, booked: 0, maintenance: 0, total: 0 } },
                coffins: { totalTypes: 0, totalStock: 0, totalValue: '0.00', sales: [] },
                chemicals: { recent: [], usageTrends: [], lowStock: [], expiringSoon: [], topUsed: [] },
                workshop: { orders: { total: 0, completed: 0, pending: 0, profit: '0.00' }, production: [] },
                hearses: { mostBooked: [], usageStats: [] },
                revenue: { total30d: '0.00', collected30d: '0.00', outstanding30d: '0.00' },
                ppeRequests: [],
                metadata: { currency: 'KES', executionTime: Date.now() - startTime, timestamp: new Date().toISOString(), error: error.message }
            },
            metadata: { requestId, timestamp: new Date().toISOString(), executionTime: Date.now() - startTime }
        });
    }
});

/**
 * Fetch comparative data between N branches dynamically
 * Compares: deceased, hearses, bookings, chemicals, coffins across branches
 */
const getComparisonDashboard = asyncHandler(async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-tenant-id'] || 'system_shared';
    let { branches } = req.query;

    if (!branches) {
        const { branch1, branch2 } = req.query;
        if (branch1 && branch2) {
            branches = branch1 + ',' + branch2;
        } else {
            return res.status(400).json({ success: false, message: 'branches query parameter is required (comma separated).' });
        }
    }

    const branchList = branches.split(',').map(b => b.trim()).filter(Boolean);
    if (branchList.length < 2) {
        return res.status(400).json({ success: false, message: 'Please provide at least 2 branches to compare.' });
    }

    const startTime = Date.now();

    const fetchBranchData = async (branchId) => {
        const resolveSlug = tenantSlug + '-' + branchId;
        let dbName;
        try {
            dbName = await resolveDatabase(resolveSlug) || await lookupTenantDatabase(tenantSlug);
        } catch (err) {
            console.warn('[Dashboard] DB unavailable for comparison ' + resolveSlug);
        }

        if (!dbName) return null;

        // Fetch ALL data for this branch in parallel
        const [
            deceasedStats,
            deceasedMonthly,
            deceasedCauses,
            bookingStats,
            hearseStatus,
            hearseMostBooked,
            hearseBookingsByBranch,
            coffinStats,
            chemicalLowStock,
            chemicalUsage,
            revenueSummary,
            branchInfo
        ] = await Promise.allSettled([
            // Deceased stats
            safeTenantQuery(dbName, `SELECT COUNT(*) as total, COUNT(CASE WHEN MONTH(date_admitted)=MONTH(CURDATE()) AND YEAR(date_admitted)=YEAR(CURDATE()) THEN 1 END) as this_month, COUNT(CASE WHEN WEEK(date_admitted)=WEEK(CURDATE()) AND YEAR(date_admitted)=YEAR(CURDATE()) THEN 1 END) as this_week FROM deceased WHERE branch_id = ?`, [branchId]),
            // Monthly deceased trends
            safeTenantQuery(dbName, `SELECT DATE_FORMAT(date_admitted,'%b %Y') as month, COUNT(*) as count FROM deceased WHERE date_admitted >= DATE_SUB(NOW(), INTERVAL 12 MONTH) AND branch_id = ? GROUP BY DATE_FORMAT(date_admitted,'%Y-%m'), DATE_FORMAT(date_admitted,'%b %Y') ORDER BY DATE_FORMAT(date_admitted,'%Y-%m') ASC`, [branchId]),
            // Causes of death
            safeTenantQuery(dbName, `SELECT COALESCE(cause_of_death, 'Unknown') as cause, COUNT(*) as count FROM deceased WHERE branch_id = ? GROUP BY cause_of_death ORDER BY count DESC`, [branchId]),
            // Booking stats
            safeTenantQuery(dbName, `SELECT COUNT(*) as total, COUNT(CASE WHEN status='booked' THEN 1 END) as active, COUNT(CASE WHEN status='completed' THEN 1 END) as completed, COUNT(CASE WHEN status='cancelled' THEN 1 END) as cancelled FROM hearse_bookings hb JOIN hearses h ON hb.hearse_id = h.id WHERE h.branch_id = ?`, [branchId]),
            // Hearse fleet
            safeTenantQuery(dbName, `SELECT COUNT(*) as total, SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) as available, SUM(CASE WHEN status='booked' THEN 1 ELSE 0 END) as booked, SUM(CASE WHEN status='maintenance' THEN 1 ELSE 0 END) as maintenance FROM hearses WHERE branch_id = ?`, [branchId]),
            // Most booked hearses
            safeTenantQuery(dbName, `SELECT h.id, h.hearse_name, h.plate_number, COUNT(hb.id) as total_bookings, SUM(CASE WHEN hb.status='completed' THEN 1 ELSE 0 END) as completed_trips FROM hearses h LEFT JOIN hearse_bookings hb ON hb.hearse_id = h.id WHERE h.branch_id = ? GROUP BY h.id, h.hearse_name, h.plate_number ORDER BY total_bookings DESC LIMIT 5`, [branchId]),
            // Revenue from bookings
            safeTenantQuery(dbName, `SELECT COALESCE(SUM(total_charge),0) as total_revenue, COALESCE(SUM(paid_amount),0) as collected FROM hearse_bookings hb JOIN hearses h ON hb.hearse_id = h.id WHERE h.branch_id = ? AND hb.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`, [branchId]),
            // Coffin stock
            safeTenantQuery(dbName, `SELECT COUNT(*) as types, COALESCE(SUM(quantity),0) as total_stock, COALESCE(SUM(exact_price * quantity),0) as total_value FROM coffins WHERE is_deleted = 0`),
            // Low stock chemicals
            safeTenantQuery(dbName, `SELECT COUNT(*) as low_stock_count FROM chemicals WHERE branch_id = ? AND is_active = 1 AND current_stock <= min_stock_level`, [branchId]),
            // Chemical usage
            safeTenantQuery(dbName, `SELECT COALESCE(SUM(dcu.quantity_used),0) as total_chemical_used FROM deceased_chemical_usage dcu JOIN chemicals c ON c.id = dcu.chemical_id WHERE c.branch_id = ? AND dcu.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`, [branchId]),
            // Revenue from extra charges
            safeTenantQuery(dbName, `SELECT COALESCE(SUM(amount),0) as extra_revenue, COALESCE(SUM(CASE WHEN status='paid' THEN amount ELSE 0 END),0) as collected FROM extra_charges WHERE branch_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`, [branchId]),
            // Branch info
            safeTenantQuery(dbName, `SELECT branch_id, branch_name, branch_code, branch_location, branch_phone FROM branches WHERE branch_id = ?`, [branchId])
        ]);

        const extractVal = (result, idx = 0) => {
            if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
                return result.value[idx] || result.value[0] || {};
            }
            return {};
        };
        const extractArr = (result) => {
            if (result.status === 'fulfilled') return result.value || [];
            return [];
        };

        const ds = extractVal(deceasedStats, 0);
        const dm = extractArr(deceasedMonthly);
        const dc = extractArr(deceasedCauses);
        const bs = extractVal(bookingStats, 0);
        const hs = extractVal(hearseStatus, 0);
        const hm = extractArr(hearseMostBooked);
        const hb = extractVal(hearseBookingsByBranch, 0);
        const cs = extractVal(coffinStats, 0);
        const cl = extractVal(chemicalLowStock, 0);
        const cu = extractVal(chemicalUsage, 0);
        const rs = extractVal(revenueSummary, 0);
        const bi = extractArr(branchInfo);

        const branchName = (bi && bi.length > 0) ? (bi[0].branch_name || `Branch ${branchId}`) : `Branch ${branchId}`;
        const branchCode = (bi && bi.length > 0) ? (bi[0].branch_code || '') : '';

        return {
            branchId: parseInt(branchId),
            branchName: branchName,
            branchCode: branchCode,
            branchLocation: (bi && bi.length > 0) ? (bi[0].branch_location || '') : '',
            branchPhone: (bi && bi.length > 0) ? (bi[0].branch_phone || '') : '',
            deceased: {
                total: parseInt(ds.total) || 0,
                thisMonth: parseInt(ds.this_month) || 0,
                thisWeek: parseInt(ds.this_week) || 0,
                monthly: Array.isArray(dm) ? dm.map(r => ({ month: r.month || 'Unknown', count: parseInt(r.count) || 0 })) : [],
                causes: Array.isArray(dc) ? dc.map(r => ({ cause: r.cause || 'Unknown', count: parseInt(r.count) || 0 })) : []
            },
            hearses: {
                total: parseInt(hs.total) || 0,
                available: parseInt(hs.available) || 0,
                booked: parseInt(hs.booked) || 0,
                maintenance: parseInt(hs.maintenance) || 0,
                mostBooked: Array.isArray(hm) ? hm.map(r => ({
                    id: r.id,
                    name: r.hearse_name || 'Unnamed',
                    plate: r.plate_number || 'N/A',
                    totalBookings: parseInt(r.total_bookings) || 0,
                    completedTrips: parseInt(r.completed_trips) || 0
                })) : []
            },
            bookings: {
                total: parseInt(bs.total) || 0,
                active: parseInt(bs.active) || 0,
                completed: parseInt(bs.completed) || 0,
                cancelled: parseInt(bs.cancelled) || 0
            },
            coffins: {
                types: parseInt(cs.types) || 0,
                totalStock: parseInt(cs.total_stock) || 0,
                totalValue: parseFloat(cs.total_value || 0).toFixed(2)
            },
            chemicals: {
                lowStockCount: parseInt(cl.low_stock_count) || 0,
                totalUsed30d: parseFloat(cu.total_chemical_used || 0).toFixed(1)
            },
            revenue: {
                total30d: parseFloat(hb.total_revenue || 0) + parseFloat(rs.extra_revenue || 0),
                collected30d: parseFloat(hb.collected || 0) + parseFloat(rs.collected || 0),
                outstanding: (parseFloat(hb.total_revenue || 0) + parseFloat(rs.extra_revenue || 0)) - (parseFloat(hb.collected || 0) + parseFloat(rs.collected || 0))
            }
        };
    };

    const results = await Promise.all(branchList.map(async (bid) => {
        const data = await fetchBranchData(bid);
        return { branchId: bid, data };
    }));

    const validResults = results.filter(r => r.data !== null);
    if (validResults.length === 0) {
        return res.status(500).json({ success: false, message: 'Failed to fetch data for the requested branches. They may not exist or DB connection failed.' });
    }

    const mappedData = {};
    validResults.forEach(r => {
        mappedData[r.branchId] = r.data;
    });

    // Generate insights and comparisons
    let maxDeceasedBranch = null, maxDeceasedCount = -1;
    let maxBookingsBranch = null, maxBookingsCount = -1;
    let maxRevenueBranch = null, maxRevenueVal = -1;
    let mostBookedHearseOverall = null, maxHearseBookings = -1;
    const recommendations = [];

    const branchDataArr = Object.values(mappedData);

    branchDataArr.forEach(b => {
        const decCount = b.deceased?.total || 0;
        if (decCount > maxDeceasedCount) { maxDeceasedCount = decCount; maxDeceasedBranch = b; }

        const bookCount = b.bookings?.total || 0;
        if (bookCount > maxBookingsCount) { maxBookingsCount = bookCount; maxBookingsBranch = b; }

        const revVal = b.revenue?.total30d || 0;
        if (revVal > maxRevenueVal) { maxRevenueVal = revVal; maxRevenueBranch = b; }

        // Check each hearse for most booked overall
        (b.hearses?.mostBooked || []).forEach(h => {
            if (h.totalBookings > maxHearseBookings) {
                maxHearseBookings = h.totalBookings;
                mostBookedHearseOverall = { ...h, branchName: b.branchName };
            }
        });

        if (b.hearses?.available === 0 && b.hearses?.total > 0) {
            recommendations.push(`⚠️ ${b.branchName}: All hearses are currently booked. Consider fleet expansion.`);
        }
        if (b.chemicals?.lowStockCount > 3) {
            recommendations.push(`🔴 ${b.branchName}: ${b.chemicals.lowStockCount} chemicals are below minimum stock. Reorder urgently.`);
        }
        if (b.deceased?.thisMonth > (b.deceased?.total / 12) * 1.5) {
            recommendations.push(`📈 ${b.branchName}: Deceased cases this month (${b.deceased.thisMonth}) are significantly above average.`);
        }
    });

    // Build comparison metrics
    const comparison = {
        deceasedVolume: {
            highest: maxDeceasedBranch ? { branchName: maxDeceasedBranch.branchName, count: maxDeceasedCount } : null,
            lowest: maxDeceasedBranch ? { branchName: branchDataArr.reduce((a, b) => (a.deceased?.total || 0) < (b.deceased?.total || 0) ? a : b).branchName, count: Math.min(...branchDataArr.map(b => b.deceased?.total || 0)) } : null
        },
        bookingVolume: {
            highest: maxBookingsBranch ? { branchName: maxBookingsBranch.branchName, count: maxBookingsCount } : null
        },
        revenue: {
            highest: maxRevenueBranch ? { branchName: maxRevenueBranch.branchName, amount: maxRevenueVal.toFixed(2) } : null
        },
        mostBookedHearse: mostBookedHearseOverall ? {
            name: mostBookedHearseOverall.name,
            plate: mostBookedHearseOverall.plate,
            branchName: mostBookedHearseOverall.branchName,
            totalBookings: mostBookedHearseOverall.totalBookings,
            completedTrips: mostBookedHearseOverall.completedTrips
        } : null,
        fleetAvailability: branchDataArr.map(b => ({
            branchName: b.branchName,
            available: b.hearses?.available || 0,
            total: b.hearses?.total || 0,
            utilizationRate: b.hearses?.total > 0 ? Math.round(((b.hearses?.total - b.hearses?.available) / b.hearses?.total) * 100) : 0
        }))
    };

    res.status(200).json({
        success: true,
        data: {
            branches: mappedData,
            insights: {
                winner: maxDeceasedBranch
                    ? `${maxDeceasedBranch.branchName} is handling the highest volume (${maxDeceasedCount} deceased cases).`
                    : 'Performance is evenly distributed across branches.',
                topPerformer: {
                    deceasedVolume: maxDeceasedBranch ? maxDeceasedBranch.branchName : 'N/A',
                    bookingVolume: maxBookingsBranch ? maxBookingsBranch.branchName : 'N/A',
                    revenue: maxRevenueBranch ? maxRevenueBranch.branchName : 'N/A',
                    mostBookedHearse: mostBookedHearseOverall ? `${mostBookedHearseOverall.name} (${mostBookedHearseOverall.plate}) - ${mostBookedHearseOverall.branchName}` : 'N/A'
                },
                recommendations: recommendations.length > 0
                    ? recommendations
                    : ['✅ All branches are operating nominally. Monitor seasonal trends.'],
                comparison
            }
        },
        metadata: { requestId, timestamp: new Date().toISOString(), executionTime: Date.now() - startTime }
    });
});

module.exports = { getComprehensiveDashboard, getComparisonDashboard };