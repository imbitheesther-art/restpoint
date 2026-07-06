import { Request, Response } from "express"
import { safeTenantQuery, safeTenantExecute } from '../database/db'
// @ts-ignore - socket module types not fully declared
import { getIO } from '../socket'

const assignWorkerToOrder = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const { orderId, user_id, stage, notes } = req.body;

        const insertResult: any = await safeTenantExecute(tenantDb,
            `INSERT INTO worker_assignments (coffin_order_id, user_id, stage, notes, hours_worked, assigned_at)
             VALUES (?, ?, ?, ?, 0, NOW())`,
            [orderId, user_id, stage, notes]
        );

        const rows: any = await safeTenantQuery(tenantDb,
            `SELECT wa.*, u.first_name, u.last_name FROM worker_assignments wa 
             JOIN users u ON wa.user_id = u.id WHERE wa.id = ?`,
            [insertResult.insertId]
        );

        const io = getIO();
        io.emit('worker:assigned', rows[0]);

        res.status(201).json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const recordMaterialUsage = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const { orderId, material_id, quantity_used, unit_cost, notes } = req.body;

        const insertResult: any = await safeTenantExecute(tenantDb,
            `INSERT INTO material_usage (coffin_order_id, material_id, quantity_used, unit_cost, notes, used_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [orderId, material_id, quantity_used, unit_cost, notes]
        );

        // Deduct from inventory
        await safeTenantExecute(tenantDb,
            'UPDATE materials SET quantity = quantity - ? WHERE id = ?',
            [quantity_used, material_id]
        );

        const rows: any = await safeTenantQuery(tenantDb,
            `SELECT mu.*, m.name as material_name FROM material_usage mu 
             JOIN materials m ON mu.material_id = m.id WHERE mu.id = ?`,
            [insertResult.insertId]
        );

        const io = getIO();
        io.emit('material:used', rows[0]);

        res.status(201).json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const { orderId } = req.params;
        const { status } = req.body;

        const updateResult: any = await safeTenantExecute(tenantDb,
            'UPDATE coffin_orders SET status = ? WHERE id = ?',
            [status, orderId]
        );

        if (!updateResult.affectedRows) return res.status(404).json({ error: 'Order not found' });

        const rows: any = await safeTenantQuery(tenantDb, 'SELECT * FROM coffin_orders WHERE id = ?', [orderId]);

        const io = getIO();
        io.emit('order:status:changed', rows[0]);

        res.json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const getTodayCompletedOrders = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const today = new Date().toISOString().slice(0, 10);
        const rows = await safeTenantQuery(tenantDb,
            'SELECT * FROM coffin_orders WHERE status = "completed" AND DATE(updated_at) = ?',
            [today]
        );
        res.json(rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const getOrderTimeline = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const { orderId } = req.params;

        // Get stages timeline
        const stages: any = await safeTenantQuery(tenantDb,
            'SELECT * FROM production_stages WHERE coffin_order_id = ? ORDER BY created_at',
            [orderId]
        );

        // Get worker assignments timeline
        const assignments: any = await safeTenantQuery(tenantDb,
            'SELECT * FROM worker_assignments WHERE coffin_order_id = ? ORDER BY assigned_at',
            [orderId]
        );

        res.json({ stages, assignments });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const completeProductionStage = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const { stageId } = req.params;
        const { hours_worked, notes } = req.body;

        const updateResult: any = await safeTenantExecute(tenantDb,
            'UPDATE production_stages SET status = "completed", completed_at = NOW(), notes = ? WHERE id = ?',
            [notes, stageId]
        );

        if (!updateResult.affectedRows) return res.status(404).json({ error: 'Stage not found' });

        const rows: any = await safeTenantQuery(tenantDb, 'SELECT * FROM production_stages WHERE id = ?', [stageId]);

        const io = getIO();
        io.emit('production:stage:done', rows[0]);

        res.json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export {
    assignWorkerToOrder,
    recordMaterialUsage,
    updateOrderStatus,
    getTodayCompletedOrders,
    getOrderTimeline,
    completeProductionStage
};