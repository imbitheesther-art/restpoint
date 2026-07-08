import { Request, Response } from "express"
import { safeTenantQuery, safeTenantExecute } from '../database/db'
// @ts-ignore - socket module types not fully declared
import { getIO } from '../socket'

/*                  
    @route  GET /api/workshop/orders
    @desc   Get all coffin orders with optional filters
*/
const getOrders = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        let query = `
            SELECT co.*, 
                COALESCE((SELECT SUM(wa.hours_worked) FROM worker_assignments wa WHERE wa.coffin_order_id = co.id), 0) as total_labor_hours
            FROM coffin_orders co
            WHERE 1=1
        `;
        const params: any[] = [];

        if (req.query.status) {
            query += ' AND co.status = ?';
            params.push(req.query.status);
        }
        if (req.query.from_date) {
            query += ' AND co.order_date >= ?';
            params.push(req.query.from_date);
        }
        if (req.query.to_date) {
            query += ' AND co.order_date <= ?';
            params.push(req.query.to_date);
        }

        query += ' ORDER BY co.created_at DESC';

        const rows = await safeTenantQuery(tenantDb, query, params);
        res.json(rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/* 
    @route  GET /api/workshop/orders/:id
    @desc   Get a single coffin order with full details
*/
const getOrder = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const orders: any = await safeTenantQuery(tenantDb,
            'SELECT * FROM coffin_orders WHERE id = ?',
            [req.params.id]
        );

        if (!orders.length) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orders[0];

        // Get production stages
        const stages: any = await safeTenantQuery(tenantDb,
            'SELECT * FROM production_stages WHERE coffin_order_id = ? ORDER BY FIELD(stage, "design","cutting","assembly","polishing","finishing")',
            [req.params.id]
        );

        // Get worker assignments
        const assignments: any = await safeTenantQuery(tenantDb,
            `SELECT wa.*, u.first_name, u.last_name 
             FROM worker_assignments wa 
             JOIN users u ON wa.user_id = u.user_id 
             WHERE wa.coffin_order_id = ?`,
            [req.params.id]
        );

        // Get material usage
        const materials: any = await safeTenantQuery(tenantDb,
            `SELECT mu.*, m.name as material_name, m.category 
             FROM material_usage mu 
             JOIN materials m ON mu.material_id = m.id 
             WHERE mu.coffin_order_id = ?`,
            [req.params.id]
        );

        // Get costing
        const costing: any = await safeTenantQuery(tenantDb,
            'SELECT * FROM costing WHERE coffin_order_id = ?',
            [req.params.id]
        );

        res.json({
            ...order,
            stages,
            assignments,
            materials_used: materials,
            costing: costing[0] || null
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/* 
    @route  POST /api/workshop/orders
    @desc   Create a new coffin order
*/
const createOrder = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const {
            customer_name, customer_phone, customer_email,
            deceased_name, coffin_type, dimensions,
            color, interior_fabric, notes, instructions,
            selling_price, delivery_date, due_date, priority, branch_id
        } = req.body;

        // Convert empty delivery_date to null to avoid MySQL date error
        const processedDeliveryDate = delivery_date === '' ? null : delivery_date;

        // Generate simple order number
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const seq = Math.floor(Math.random() * 900) + 100;
        const order_number = `CFN-${dateStr}-${seq}`;

        const insertResult: any = await safeTenantExecute(tenantDb,
            `INSERT INTO coffin_orders 
            (order_number, customer_name, customer_phone, customer_email, deceased_name, 
             coffin_type, dimensions, color, interior_fabric, notes, instructions,
             selling_price, delivery_date, due_date, priority, branch_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [order_number, customer_name, customer_phone, customer_email, deceased_name,
                coffin_type || 'standard', dimensions, color, interior_fabric, notes, instructions || '',
                selling_price || 0, processedDeliveryDate, due_date || null, priority || 'normal', branch_id || 1]
        );

        const orderId = insertResult.insertId;

        // Create initial production stages
        const stages = ['design', 'cutting', 'assembly', 'polishing', 'finishing'];
        for (const stage of stages) {
            await safeTenantExecute(tenantDb,
                'INSERT INTO production_stages (coffin_order_id, stage) VALUES (?, ?)',
                [orderId, stage]
            );
        }

        // Create initial costing record
        await safeTenantExecute(tenantDb,
            'INSERT INTO costing (coffin_order_id, selling_price) VALUES (?, ?)',
            [orderId, selling_price || 0]
        );

        const newOrders: any = await safeTenantQuery(tenantDb, 'SELECT * FROM coffin_orders WHERE id = ?', [orderId]);

        const io = getIO();
        io.emit('order:created', { id: orderId, order_number });

        res.status(201).json(newOrders[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/* 
    @route  PATCH /api/workshop/orders/:id
    @desc   Update a coffin order
*/
const updateOrder = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const allowedFields = [
            'customer_name', 'customer_phone', 'customer_email', 'deceased_name',
            'coffin_type', 'dimensions', 'color', 'interior_fabric', 'notes',
            'instructions', 'status', 'selling_price', 'delivery_date', 'due_date',
            'priority', 'branch_id', 'hold_reason', 'created_by'
        ];

        const updates: string[] = [];
        const values: any[] = [];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                // Convert empty delivery_date to null to avoid MySQL date error
                if ((field === 'delivery_date' || field === 'due_date') && req.body[field] === '') {
                    updates.push(`${field} = ?`);
                    values.push(null);
                } else {
                    updates.push(`${field} = ?`);
                    values.push(req.body[field]);
                }
            }
        }

        if (!updates.length) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        values.push(req.params.id);
        const updateResult: any = await safeTenantExecute(tenantDb,
            `UPDATE coffin_orders SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (!updateResult.affectedRows) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // If status changed to completed, update costing
        if (req.body.status === 'completed') {
            await updateCosting(tenantDb, Number(req.params.id));
        }

        const updatedOrders: any = await safeTenantQuery(tenantDb, 'SELECT * FROM coffin_orders WHERE id = ?', [req.params.id]);

        const io = getIO();
        io.emit('order:updated', updatedOrders[0]);

        res.json(updatedOrders[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/* 
    @route  DELETE /api/workshop/orders/:id
    @desc   Delete a coffin order
*/
const deleteOrder = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const deleteResult: any = await safeTenantExecute(tenantDb, 'DELETE FROM coffin_orders WHERE id = ?', [req.params.id]);
        if (!deleteResult.affectedRows) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const io = getIO();
        io.emit('order:deleted', { id: Number(req.params.id) });

        res.json({ message: 'Order deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Helper: Update costing for an order
async function updateCosting(tenantDb: string, orderId: number) {
    const materialsCost: any = await safeTenantQuery(tenantDb,
        'SELECT COALESCE(SUM(total_cost), 0) as total FROM material_usage WHERE coffin_order_id = ?',
        [orderId]
    );

    const laborCost: any = await safeTenantQuery(tenantDb,
        `SELECT COALESCE(SUM(wa.hours_worked * 15), 0) as total 
         FROM worker_assignments wa WHERE wa.coffin_order_id = ?`,
        [orderId]
    );

    const overheadCost = Number(materialsCost[0].total) * 0.1; // 10% overhead

    await safeTenantExecute(tenantDb,
        `UPDATE costing SET materials_cost = ?, labor_cost = ?, overhead_cost = ? WHERE coffin_order_id = ?`,
        [materialsCost[0].total, laborCost[0].total, overheadCost, orderId]
    );

    // Update coffin_orders total_cost and profit
    const costing: any = await safeTenantQuery(tenantDb, 'SELECT * FROM costing WHERE coffin_order_id = ?', [orderId]);
    if (costing.length) {
        const c = costing[0];
        await safeTenantExecute(tenantDb,
            'UPDATE coffin_orders SET total_cost = ?, profit = ? WHERE id = ?',
            [c.total_cost, c.profit, orderId]
        );
    }
}

export {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder
};