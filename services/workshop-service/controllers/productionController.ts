import { Request, Response } from "express"
import { safeTenantQuery, safeTenantExecute } from '../database/db'
// @ts-ignore - socket module types not fully declared
import { getIO } from '../socket'

const getAssignments = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const rows = await safeTenantQuery(tenantDb,
            `SELECT wa.*, u.first_name, u.last_name 
             FROM worker_assignments wa 
             JOIN users u ON wa.user_id = u.id 
             ORDER BY wa.assigned_at DESC`
        );
        res.json(rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const getStages = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const rows = await safeTenantQuery(tenantDb,
            'SELECT * FROM production_stages WHERE coffin_order_id = ? ORDER BY FIELD(stage, "design","cutting","assembly","polishing","finishing")',
            [req.params.orderId]
        );
        res.json(rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const updateStage = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const allowedFields = ['status', 'started_at', 'completed_at', 'notes'];
        const updateFields: string[] = [];
        const values: any[] = [];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                values.push(req.body[field]);
            }
        }

        if (!updateFields.length) return res.status(400).json({ error: 'No valid fields to update' });

        values.push(req.params.stageId);
        const updateResult: any = await safeTenantExecute(tenantDb,
            `UPDATE production_stages SET ${updateFields.join(', ')} WHERE id = ?`, values
        );

        if (!updateResult.affectedRows) return res.status(404).json({ error: 'Stage not found' });

        const rows: any = await safeTenantQuery(tenantDb, 'SELECT * FROM production_stages WHERE id = ?', [req.params.stageId]);

        const io = getIO();
        io.emit('production:stage:updated', rows[0]);

        res.json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const assignWorker = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const { user_id, stage, notes } = req.body;
        const { orderId } = req.params;

        const insertResult: any = await safeTenantExecute(tenantDb,
            `INSERT INTO worker_assignments (coffin_order_id, user_id, stage, notes)
             VALUES (?, ?, ?, ?)`,
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

const updateAssignment = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const allowedFields = ['hours_worked', 'notes', 'completed_at'];
        const updates: string[] = [];
        const values: any[] = [];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(req.body[field]);
            }
        }

        if (!updates.length) return res.status(400).json({ error: 'No valid fields to update' });

        values.push(req.params.id);
        const updateResult: any = await safeTenantExecute(tenantDb,
            `UPDATE worker_assignments SET ${updates.join(', ')} WHERE id = ?`, values
        );

        if (!updateResult.affectedRows) return res.status(404).json({ error: 'Assignment not found' });

        const rows: any = await safeTenantQuery(tenantDb,
            `SELECT wa.*, u.first_name, u.last_name FROM worker_assignments wa 
             JOIN users u ON wa.user_id = u.id WHERE wa.id = ?`,
            [req.params.id]
        );

        const io = getIO();
        io.emit('worker:assignment:updated', rows[0]);

        res.json(rows[0]);
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
