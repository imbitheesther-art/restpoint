import { Request, Response } from "express"
import { safeTenantQuery } from '../database/db'

/* 
    @route  GET /api/workshop/reports/daily
    @desc   Get daily production report
*/
const getDailyReport = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const date = req.query.date || new Date().toISOString().slice(0, 10);

        const [orders]: any = await safeTenantQuery(tenantDb,
            `SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN status IN ('completed','delivered') THEN 1 ELSE 0 END) as completed_orders,
                SUM(CASE WHEN status NOT IN ('completed','delivered') THEN 1 ELSE 0 END) as pending_orders,
                COALESCE(SUM(selling_price), 0) as total_revenue,
                COALESCE(SUM(total_cost), 0) as total_cost,
                COALESCE(SUM(profit), 0) as total_profit
             FROM coffin_orders 
             WHERE DATE(order_date) = ?`,
            [date]
        );

        const [materialsUsed]: any = await safeTenantQuery(tenantDb,
            `SELECT m.name, m.category, SUM(mu.quantity_used) as total_used, m.unit
             FROM material_usage mu
             JOIN materials m ON mu.material_id = m.id
             WHERE DATE(mu.used_at) = ?
             GROUP BY m.id, m.name, m.category, m.unit`,
            [date]
        );

        // Get orders in progress today
        const [inProgress]: any = await safeTenantQuery(tenantDb,
            `SELECT id, order_number, customer_name, status 
             FROM coffin_orders 
             WHERE DATE(order_date) = ? OR DATE(updated_at) = ?
             ORDER BY updated_at DESC`,
            [date, date]
        );

        res.json({
            report_date: date,
            summary: orders[0] || {
                total_orders: 0,
                completed_orders: 0,
                pending_orders: 0,
                total_revenue: 0,
                total_cost: 0,
                total_profit: 0
            },
            materials_used: materialsUsed,
            orders: inProgress
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/* 
    @route  GET /api/workshop/reports/weekly
    @desc   Get weekly production report
*/
const getWeeklyReport = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const endDate = req.query.end_date || new Date().toISOString().slice(0, 10);
        const startDate = req.query.start_date || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        const [dailyStats]: any = await safeTenantQuery(tenantDb,
            `SELECT 
                DATE(order_date) as date,
                COUNT(*) as orders_count,
                COALESCE(SUM(selling_price), 0) as revenue,
                COALESCE(SUM(profit), 0) as profit
             FROM coffin_orders
             WHERE DATE(order_date) BETWEEN ? AND ?
             GROUP BY DATE(order_date)
             ORDER BY date ASC`,
            [startDate, endDate]
        );

        const [summary]: any = await safeTenantQuery(tenantDb,
            `SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(selling_price), 0) as total_revenue,
                COALESCE(SUM(total_cost), 0) as total_cost,
                COALESCE(SUM(profit), 0) as total_profit
             FROM coffin_orders
             WHERE DATE(order_date) BETWEEN ? AND ?`,
            [startDate, endDate]
        );

        res.json({
            start_date: startDate,
            end_date: endDate,
            summary: summary[0] || {
                total_orders: 0,
                total_revenue: 0,
                total_cost: 0,
                total_profit: 0
            },
            daily_breakdown: dailyStats
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/* 
    @route  GET /api/workshop/reports/inventory
    @desc   Get inventory status report
*/
const getInventoryReport = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const [materials]: any = await safeTenantQuery(tenantDb,
            `SELECT 
                category,
                COUNT(*) as total_items,
                SUM(quantity * unit_price) as total_value,
                SUM(CASE WHEN quantity <= min_stock_level THEN 1 ELSE 0 END) as low_stock_items
             FROM materials
             GROUP BY category
             ORDER BY category`
        );

        const [lowStock]: any = await safeTenantQuery(tenantDb,
            `SELECT * FROM materials WHERE quantity <= min_stock_level ORDER BY (quantity - min_stock_level) ASC`
        );

        const [recentUsage]: any = await safeTenantQuery(tenantDb,
            `SELECT m.name, m.category, SUM(mu.quantity_used) as total_used, m.unit
             FROM material_usage mu
             JOIN materials m ON mu.material_id = m.id
             WHERE mu.used_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY m.id, m.name, m.category, m.unit
             ORDER BY total_used DESC`
        );

        res.json({
            summary_by_category: materials,
            low_stock_alerts: lowStock,
            recent_usage_7days: recentUsage
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/* 
    @route  GET /api/workshop/reports/production
    @desc   Get production performance report
*/
const getProductionReport = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const [stageStats]: any = await safeTenantQuery(tenantDb,
            `SELECT 
                stage,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
             FROM production_stages
             GROUP BY stage
             ORDER BY FIELD(stage, "design","cutting","assembly","polishing","finishing")`
        );

        const [workerPerformance]: any = await safeTenantQuery(tenantDb,
            `SELECT 
                u.id, u.first_name, u.last_name,
                COUNT(wa.id) as total_assignments,
                COALESCE(SUM(wa.hours_worked), 0) as total_hours,
                COALESCE(AVG(wa.hours_worked), 0) as avg_hours_per_task
             FROM users u
             LEFT JOIN worker_assignments wa ON u.id = wa.user_id
             WHERE u.role IN ('worker', 'manager')
             GROUP BY u.id, u.first_name, u.last_name
             ORDER BY total_hours DESC`
        );

        const [orderStatus]: any = await safeTenantQuery(tenantDb,
            `SELECT 
                status,
                COUNT(*) as count
             FROM coffin_orders
             GROUP BY status
             ORDER BY FIELD(status, "pending","design","cutting","assembly","polishing","finishing","completed","delivered")`
        );

        res.json({
            stage_distribution: stageStats,
            worker_performance: workerPerformance,
            order_status_summary: orderStatus
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/* 
    @route  GET /api/workshop/reports/costing
    @desc   Get costing analysis report
*/
const getCostingReport = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const [costingData]: any = await safeTenantQuery(tenantDb,
            `SELECT 
                co.id, co.order_number, co.customer_name, co.coffin_type, co.status,
                c.materials_cost, c.labor_cost, c.overhead_cost, c.total_cost,
                c.selling_price, c.profit, c.profit_margin
             FROM costing c
             JOIN coffin_orders co ON c.coffin_order_id = co.id
             ORDER BY c.created_at DESC
             LIMIT 50`
        );

        const [averages]: any = await safeTenantQuery(tenantDb,
            `SELECT 
                coffin_type,
                COUNT(*) as order_count,
                COALESCE(AVG(total_cost), 0) as avg_cost,
                COALESCE(AVG(selling_price), 0) as avg_price,
                COALESCE(AVG(profit), 0) as avg_profit,
                COALESCE(AVG(profit_margin), 0) as avg_margin
             FROM costing c
             JOIN coffin_orders co ON c.coffin_order_id = co.id
             WHERE co.status IN ('completed', 'delivered')
             GROUP BY coffin_type`
        );

        res.json({
            recent_orders: costingData,
            averages_by_type: averages
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export {
    getDailyReport,
    getWeeklyReport,
    getInventoryReport,
    getProductionReport,
    getCostingReport
};