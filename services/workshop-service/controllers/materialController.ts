import { Request, Response } from "express"
import { safeTenantQuery, safeTenantExecute } from '../database/db'
// @ts-ignore - socket module types not fully declared
import { getIO } from '../socket'

const getMaterials = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const rows = await safeTenantQuery(tenantDb, 'SELECT * FROM materials ORDER BY category, name');
        res.json(rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const getMaterial = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const rows: any = await safeTenantQuery(tenantDb, 'SELECT * FROM materials WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Material not found' });
        res.json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const createMaterial = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const { name, category, unit, quantity, unit_price, min_stock_level, description } = req.body;

        const insertResult: any = await safeTenantExecute(tenantDb,
            `INSERT INTO materials (name, category, unit, quantity, unit_price, min_stock_level, description)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, category, unit, quantity || 0, unit_price || 0, min_stock_level || 0, description]
        );

        const rows: any = await safeTenantQuery(tenantDb, 'SELECT * FROM materials WHERE id = ?', [insertResult.insertId]);

        const io = getIO();
        io.emit('material:created', rows[0]);

        res.status(201).json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const updateMaterial = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const allowedFields = ['name', 'category', 'unit', 'quantity', 'unit_price', 'min_stock_level', 'description'];
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
            `UPDATE materials SET ${updates.join(', ')} WHERE id = ?`, values
        );

        if (!updateResult.affectedRows) return res.status(404).json({ error: 'Material not found' });

        const rows: any = await safeTenantQuery(tenantDb, 'SELECT * FROM materials WHERE id = ?', [req.params.id]);

        const io = getIO();
        io.emit('material:updated', rows[0]);

        res.json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const deleteMaterial = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const deleteResult: any = await safeTenantExecute(tenantDb, 'DELETE FROM materials WHERE id = ?', [req.params.id]);
        if (!deleteResult.affectedRows) return res.status(404).json({ error: 'Material not found' });

        const io = getIO();
        io.emit('material:deleted', { id: Number(req.params.id) });

        res.json({ message: 'Material deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const useMaterial = async (req: Request, res: Response) => {
    try {
        const tenantDb = (req as any).tenant?.db_name;
        if (!tenantDb) return res.status(400).json({ error: 'Tenant database not resolved' });

        const { coffin_order_id, material_id, quantity_used, notes } = req.body;

        // Check stock
        const materialRows: any = await safeTenantQuery(tenantDb,
            'SELECT * FROM materials WHERE id = ? FOR UPDATE', [material_id]
        );
        if (!materialRows.length) return res.status(404).json({ error: 'Material not found' });

        const material = materialRows[0];
        if (material.quantity < quantity_used) {
            return res.status(400).json({
                error: `Insufficient stock. Available: ${material.quantity} ${material.unit}, Requested: ${quantity_used}`
            });
        }

        // Get unit cost
        const unitCost = material.unit_price;

        // Record usage
        const insertResult: any = await safeTenantExecute(tenantDb,
            `INSERT INTO material_usage (coffin_order_id, material_id, quantity_used, unit_cost, notes)
             VALUES (?, ?, ?, ?, ?)`,
            [coffin_order_id, material_id, quantity_used, unitCost, notes]
        );

        // Deduct from inventory
        await safeTenantExecute(tenantDb,
            'UPDATE materials SET quantity = quantity - ? WHERE id = ?',
            [quantity_used, material_id]
        );

        // Update order costing
        const totalCost = quantity_used * unitCost;
        await safeTenantExecute(tenantDb,
            'UPDATE coffin_orders SET total_cost = COALESCE(total_cost, 0) + ? WHERE id = ?',
            [totalCost, coffin_order_id]
        );

        const rows: any = await safeTenantQuery(tenantDb,
            `SELECT mu.*, m.name as material_name FROM material_usage mu 
             JOIN materials m ON mu.material_id = m.id WHERE mu.id = ?`,
            [insertResult.insertId]
        );

        const io = getIO();
        io.emit('material:used', rows[0]);

        // Check low stock
        const updatedMaterial: any = await safeTenantQuery(tenantDb,
            'SELECT * FROM materials WHERE id = ?', [material_id]
        );
        if (updatedMaterial[0] && updatedMaterial[0].quantity <= updatedMaterial[0].min_stock_level) {
            io.emit('material:low-stock', updatedMaterial[0]);
        }

        res.status(201).json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export {
    getMaterials,
    getMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    useMaterial
};