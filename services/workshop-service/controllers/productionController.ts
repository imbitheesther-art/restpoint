import { Request, Response } from "express"
import { safeTenantQuery, safeTenantExecute } from '../database/db.js'
// @ts-ignore - socket module types not fully declared
import { getIO } from '../socket.js'

/* 
    @route  GET /api/workshop/orders/:orderId/stages
    @desc   Get production stages for an order
*/
const getStages = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const [rows] = await safeTenantQuery(tenantDb,
            'SELECT * FROM production_stages WHERE coffin_order_id = ? ORDER BY FIELD(stage, "design","cutting","assembly","polishing","finishing")',
            [req.params.orderId]
        );
        res.json(rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/* 
    @route  PATCH /api/workshop/orders/:orderId/stages/:stageId
    @desc   Update a production stage status
*/
const updateStage = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const { status, notes } = req.body;
        const { orderId, stageId } = req.params;

        const updateFields: string[] = ['status = ?'];
        const values: any[] = [status];

        if (status === 'in_progress') {
            updateFields.push('started_at = COALESCE(started_at, NOW())');
        }
        if (status === 'completed') {
            updateFields.push('completed_at = NOW()');
        }
        if (notes !== undefined) {
            updateFields.push('notes = ?');
            values.push(notes);
        }

        values.push(stageId);
        const [result] = await safeTenantExecute(tenantDb,
            `UPDATE production_stages SET ${updateFields.join(', ')} WHERE id = ?`,
            values
        );

        if (!(result as any).affectedRows) {
            return res.status(404).json({ error: 'Stage not found' });
        }

        // Get the updated stage info
        const [stages] = await safeTenantQuery(tenantDb,
            'SELECT * FROM production_stages WHERE id = ?',
            [stageId]
        );
        const stage = (stages as any[])[0];

        // If stage completed, check if all stages are completed to update order status
        if (status === 'completed') {
            const [allStages] = await safeTenantQuery(tenantDb,
                'SELECT status FROM production_stages WHERE coffin_order_id = ?',
                [orderId]
            );

            const allCompleted = (allStages as any[]).every((s: any) => s.status === 'completed');
            if (allCompleted) {
                await safeTenantExecute(tenantDb,
                    "UPDATE coffin_orders SET status = 'completed' WHERE id = ?",
                    [orderId]
                );
            } else {
                // Move to next stage
                const stageOrder = ['design', 'cutting', 'assembly', 'polishing', 'finishing'];
                const currentIndex = stageOrder.indexOf(stage.stage);
                if (currentIndex < stageOrder.length - 1) {
                    const nextStage = stageOrder[currentIndex + 1];
                    await safeTenantExecute(tenantDb,
                        "UPDATE coffin_orders SET status = ? WHERE id = ?",
                        [nextStage, orderId]
                    );
                }
            }
        } else if (status === 'in_progress') {
            await safeTenantExecute(tenantDb,
                "UPDATE coffin_orders SET status = ? WHERE id = ?",
                [stage.stage, orderId]
            );
        }

        const [updatedStage] = await safeTenantQuery(tenantDb, 'SELECT * FROM production_stages WHERE id = ?', [stageId]);
        const [updatedOrder] = await safeTenantQuery(tenantDb, 'SELECT * FROM coffin_orders WHERE id = ?', [orderId]);

        const io = getIO();
        io.emit('stage:updated', { stage: (updatedStage as any[])[0], order: (updatedOrder as any[])[0] });

        res.json({
            stage: (updatedStage as any[])[0],
            order: (updatedOrder as any[])[0]
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/* 
    @route  POST /api/workshop/orders/:orderId/assign
    @desc   Assign a worker to a production stage
*/
const assignWorker = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const { user_id, stage, notes } = req.body;
        const { orderId } = req.params;

        const [result] = await safeTenantExecute(tenantDb,
            `INSERT INTO worker_assignments (coffin_order_id, user_id, stage, notes)
             VALUES (?, ?, ?, ?)`,
            [orderId, user_id, stage, notes]
        );

        const [assignment] = await safeTenantQuery(tenantDb,
            `SELECT wa.*, u.first_name, u.last_name 
             FROM worker_assignments wa 
             JOIN users u ON wa.user_id = u.id 
             WHERE wa.id = ?`,
            [(result as any).insertId]
        );

        const io = getIO();
        io.emit('worker:assigned', (assignment as any[])[0]);

        res.status(201).json((assignment as any[])[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/* 
    @route  PATCH /api/workshop/assignments/:id
    @desc   Update worker assignment (log hours, mark complete)
*/
const updateAssignment = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const { hours_worked, completed_at, notes } = req.body;
        const updates: string[] = [];
        const values: any[] = [];

        if (hours_worked !== undefined) {
            updates.push('hours_worked = ?');
            values.push(hours_worked);
        }
        if (completed_at !== undefined) {
            updates.push('completed_at = ?');
            values.push(completed_at);
        } else if (hours_worked !== undefined) {
            updates.push('completed_at = NOW()');
        }
        if (notes !== undefined) {
            updates.push('notes = ?');
            values.push(notes);
        }

        if (!updates.length) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        values.push(req.params.id);
        const [result] = await safeTenantExecute(tenantDb,
            `UPDATE worker_assignments SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (!(result as any).affectedRows) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        const [updated] = await safeTenantQuery(tenantDb,
            `SELECT wa.*, u.first_name, u.last_name 
             FROM worker_assignments wa 
             JOIN users u ON wa.user_id = u.id 
             WHERE wa.id = ?`,
            [req.params.id]
        );

        res.json((updated as any[])[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/* 
    @route  GET /api/workshop/assignments
    @desc   Get all worker assignments
*/
const getAssignments = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        let query = `
            SELECT wa.*, u.first_name, u.last_name, co.order_number, co.customer_name
            FROM worker_assignments wa
            JOIN users u ON wa.user_id = u.id
            JOIN coffin_orders co ON wa.coffin_order_id = co.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (req.query.user_id) {
            query += ' AND wa.user_id = ?';
            params.push(req.query.user_id);
        }
        if (req.query.stage) {
            query += ' AND wa.stage = ?';
            params.push(req.query.stage);
        }

        query += ' ORDER BY wa.assigned_at DESC';
        const rows = await safeTenantQuery(tenantDb, query, params);
        res.json(rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export {
    getStages,
    updateStage,
    assignWorker,
    updateAssignment,
    getAssignments
};