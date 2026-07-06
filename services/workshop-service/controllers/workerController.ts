import { Request, Response } from "express"
import { safeTenantQuery, safeTenantExecute } from '../database/db'
import bcrypt from 'bcryptjs'

/* 
    @route  GET /api/workshop/workers
    @desc   Get all workers
*/
const getWorkers = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const [rows] = await safeTenantQuery(tenantDb,
            "SELECT id, first_name, last_name, email, role, phone, created_at FROM users WHERE role IN ('worker', 'manager') ORDER BY first_name ASC"
        );
        res.json(rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/* 
    @route  POST /api/workshop/workers
    @desc   Create a new worker
*/
const createWorker = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const { first_name, last_name, email, password, role, phone } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const insertResult: any = await safeTenantExecute(tenantDb,
            `INSERT INTO users (first_name, last_name, email, password, role, phone)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, email, hashedPassword, role || 'worker', phone]
        );

        const newWorker: any = await safeTenantQuery(tenantDb,
            "SELECT id, first_name, last_name, email, role, phone, created_at FROM users WHERE id = ?",
            [insertResult.insertId]
        );

        res.status(201).json(newWorker[0]);
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

/* 
    @route  PATCH /api/workshop/workers/:id
    @desc   Update a worker
*/
const updateWorker = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const allowedFields = ['first_name', 'last_name', 'email', 'role', 'phone'];
        const updates: string[] = [];
        const values: any[] = [];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(req.body[field]);
            }
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            updates.push('password = ?');
            values.push(hashedPassword);
        }

        if (!updates.length) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        values.push(req.params.id);
        const updateResult: any = await safeTenantExecute(tenantDb,
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (!updateResult.affectedRows) {
            return res.status(404).json({ error: 'Worker not found' });
        }

        const [updated] = await safeTenantQuery(tenantDb,
            "SELECT id, first_name, last_name, email, role, phone, created_at FROM users WHERE id = ?",
            [req.params.id]
        );

        res.json(updated[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/* 
    @route  DELETE /api/workshop/workers/:id
    @desc   Delete a worker
*/
const deleteWorker = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) {
            return res.status(400).json({ error: 'Tenant database not resolved' });
        }

        const deleteResult: any = await safeTenantExecute(tenantDb, 'DELETE FROM users WHERE id = ? AND role IN ("worker", "manager")', [req.params.id]);
        if (!deleteResult.affectedRows) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        res.json({ message: 'Worker deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export {
    getWorkers,
    createWorker,
    updateWorker,
    deleteWorker
};