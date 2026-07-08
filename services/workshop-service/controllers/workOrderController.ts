import { Request, Response } from "express"
import { safeTenantQuery, safeTenantExecute } from '../database/db'

const createWorkOrder = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const { coffin_order_id, design_name, description, specifications, design_files, status } = req.body;

        const insertResult: any = await safeTenantExecute(tenantDb,
            `INSERT INTO design_specifications (coffin_order_id, design_name, description, specifications, design_files, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [coffin_order_id, design_name, description, specifications, design_files, status || 'pending']
        );

        const rows: any = await safeTenantQuery(tenantDb,
            'SELECT * FROM design_specifications WHERE id = ?',
            [insertResult.insertId]
        );

        res.status(201).json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const saveDesignSpec = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        // Use order ID from URL params (route: /orders/:id/design)
        const coffin_order_id = req.params.id;
        const { design_name, description, specifications, design_files, status } = req.body;

        if (!coffin_order_id) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        const insertResult: any = await safeTenantExecute(tenantDb,
            `INSERT INTO design_specifications (coffin_order_id, design_name, description, specifications, design_files, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [coffin_order_id, design_name, description, specifications, design_files, status || 'pending']
        );

        const rows: any = await safeTenantQuery(tenantDb,
            'SELECT * FROM design_specifications WHERE id = ?',
            [insertResult.insertId]
        );

        res.status(201).json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const getDesignSpec = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const rows = await safeTenantQuery(tenantDb,
            'SELECT * FROM design_specifications WHERE coffin_order_id = ?',
            [req.params.id]
        );
        res.json(rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const generateWorkOrderPDF = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const rows: any = await safeTenantQuery(tenantDb,
            'SELECT * FROM coffin_orders WHERE id = ?',
            [req.params.id]
        );

        if (!rows.length) return res.status(404).json({ error: 'Order not found' });

        // Return order data for PDF generation (frontend will generate PDF)
        res.json({ order: rows[0] });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const getMaterialIntakeHistory = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const rows = await safeTenantQuery(tenantDb,
            'SELECT mi.*, m.name as material_name FROM material_intake mi JOIN materials m ON mi.material_id = m.id ORDER BY mi.created_at DESC'
        );
        res.json(rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const recordMaterialIntake = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const { material_id, quantity, unit_cost, supplier, invoice_number, notes, received_by } = req.body;

        const insertResult: any = await safeTenantExecute(tenantDb,
            `INSERT INTO material_intake (material_id, quantity, unit_cost, supplier, invoice_number, notes, received_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [material_id, quantity, unit_cost, supplier, invoice_number, notes, received_by]
        );

        // Update material quantity
        await safeTenantExecute(tenantDb,
            'UPDATE materials SET quantity = quantity + ? WHERE id = ?',
            [quantity, material_id]
        );

        const rows: any = await safeTenantQuery(tenantDb,
            'SELECT * FROM material_intake WHERE id = ?',
            [insertResult.insertId]
        );

        res.status(201).json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export {
    createWorkOrder,
    recordMaterialIntake,
    saveDesignSpec,
    getDesignSpec,
    generateWorkOrderPDF,
    getMaterialIntakeHistory
};
