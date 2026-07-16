const { safeTenantQuery, safeTenantExecute } = require('../../../shared/dbConfig');

// ============================================
// GET ALL CHEMICALS (with analytics per item)
// ============================================
exports.getAll = async (req, res) => {
  try {
    const { category, active, search } = req.query;
    const tenantDb = req.tenant?.db_name;

    if (!tenantDb) {
      return res.status(400).json({ success: false, message: 'Tenant database not resolved' });
    }

    let sql = `SELECT c.*, 
               (SELECT COALESCE(SUM(quantity_used), 0) FROM deceased_chemical_usage WHERE chemical_id = c.id AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as total_used_30d,
               (SELECT COALESCE(SUM(quantity_used), 0) FROM deceased_chemical_usage WHERE chemical_id = c.id AND DATE(created_at) = CURDATE()) as used_today,
               CASE WHEN c.current_stock <= c.min_stock_level THEN 1 ELSE 0 END as is_low_stock
               FROM chemicals c WHERE c.is_active = 1`;
    const params = [];

    if (category) { sql += ' AND c.category = ?'; params.push(category); }
    if (active !== 'false') { sql += ' AND c.is_active = 1'; }
    if (search) { sql += ' AND (c.name LIKE ? OR c.batch_number LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    sql += ' ORDER BY c.name ASC';

    const rows = await safeTenantQuery(tenantDb, sql, params);

    // Map to frontend format
    const data = rows.map(r => ({
      chemical_id: r.id,
      chemical_uid: `CH-${String(r.id).padStart(4, '0')}`,
      chemical_name: r.name,
      category: r.category,
      unit: r.unit,
      quantity_available: r.current_stock,
      current_stock: r.current_stock,
      min_stock_level: r.min_stock_level,
      reorder_level: r.reorder_level,
      unit_cost: r.unit_cost,
      hazard_level: r.hazard_level || 'low',
      supplier: r.supplier,
      batch_number: r.batch_number,
      total_used: r.total_used_30d,
      used_today: r.used_today,
      is_low_stock: r.is_low_stock,
      avg_usage_per_embalming: '0.00',
      estimate_days_remaining: '0',
      notes: r.notes,
      created_at: r.created_at,
      updated_at: r.updated_at
    }));

    res.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error('[chemicalController.getAll]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET SINGLE CHEMICAL
// ============================================
exports.getById = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const rows = await safeTenantQuery(tenantDb, 'SELECT * FROM chemicals WHERE id = ? AND is_active = 1', [req.params.id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Chemical not found' });

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// CREATE NEW CHEMICAL
// ============================================
exports.create = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const { name, category, unit, current_stock, min_stock_level, reorder_level, unit_cost, hazard_level, supplier, batch_number, notes } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Chemical name is required' });

    const effectiveCategory = category ? category.toLowerCase() : 'embalming';
    const effectiveUnit = unit || 'liters';
    const effectiveHazard = hazard_level ? hazard_level.toLowerCase() : 'low';
    const initialQty = parseFloat(current_stock) || 0;

    const result = await safeTenantExecute(tenantDb,
      `INSERT INTO chemicals (name, category, unit, current_stock, min_stock_level, reorder_level, unit_cost, hazard_level, supplier, batch_number, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, effectiveCategory, effectiveUnit, initialQty, min_stock_level || 0, reorder_level || 0, unit_cost || 0, effectiveHazard, supplier || null, batch_number || null, notes || null]
    );

    // Log initial stock as received transaction if quantity > 0
    if (initialQty > 0) {
      await safeTenantExecute(tenantDb,
        `INSERT INTO chemical_transactions (chemical_id, transaction_type, quantity, unit, previous_stock, new_stock, notes) 
         VALUES (?, 'received', ?, ?, 0, ?, 'Initial stock on creation')`,
        [result.insertId, initialQty, effectiveUnit, initialQty]
      );
    }

    res.status(201).json({ success: true, message: 'Chemical created successfully', id: result.insertId });
  } catch (error) {
    console.error('[chemicalController.create]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// UPDATE CHEMICAL
// ============================================
exports.update = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const { name, category, unit, min_stock_level, reorder_level, unit_cost, hazard_level, supplier, batch_number, notes } = req.body;

    await safeTenantExecute(tenantDb,
      `UPDATE chemicals SET name=COALESCE(?,name), category=COALESCE(?,category), unit=COALESCE(?,unit),
       min_stock_level=COALESCE(?,min_stock_level), reorder_level=COALESCE(?,reorder_level), 
       unit_cost=COALESCE(?,unit_cost), hazard_level=COALESCE(?,hazard_level),
       supplier=COALESCE(?,supplier), batch_number=COALESCE(?,batch_number),
       notes=COALESCE(?,notes)
       WHERE id=? AND is_active=1`,
      [name, category, unit, min_stock_level, reorder_level, unit_cost, hazard_level, supplier, batch_number, notes, req.params.id]
    );

    res.json({ success: true, message: 'Chemical updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// DELETE CHEMICAL (soft delete)
// ============================================
exports.remove = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    await safeTenantExecute(tenantDb, 'UPDATE chemicals SET is_active=0 WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Chemical removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// RECEIVE STOCK
// ============================================
exports.receiveStock = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const { quantity, notes } = req.body;
    if (!quantity || parseFloat(quantity) <= 0) return res.status(400).json({ success: false, message: 'Valid quantity required' });

    const chem = await safeTenantQuery(tenantDb, 'SELECT id, current_stock, unit FROM chemicals WHERE id=? AND is_active=1', [req.params.id]);
    if (!chem.length) return res.status(404).json({ success: false, message: 'Chemical not found' });

    const previousStock = parseFloat(chem[0].current_stock);
    const qty = parseFloat(quantity);
    const newStock = previousStock + qty;

    await safeTenantExecute(tenantDb, 'UPDATE chemicals SET current_stock=? WHERE id=?', [newStock, req.params.id]);
    await safeTenantExecute(tenantDb,
      `INSERT INTO chemical_transactions (chemical_id, transaction_type, quantity, unit, previous_stock, new_stock, notes)
       VALUES (?, 'received', ?, ?, ?, ?, ?)`,
      [req.params.id, qty, chem[0].unit, previousStock, newStock, notes || 'Stock received']
    );

    res.json({ success: true, message: 'Stock received successfully', previous_stock: previousStock, new_stock: newStock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ADJUST STOCK
// ============================================
exports.adjustStock = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const { new_quantity, reason } = req.body;
    if (new_quantity === undefined || parseFloat(new_quantity) < 0) return res.status(400).json({ success: false, message: 'Valid new_quantity required' });

    const chem = await safeTenantQuery(tenantDb, 'SELECT id, current_stock, unit FROM chemicals WHERE id=? AND is_active=1', [req.params.id]);
    if (!chem.length) return res.status(404).json({ success: false, message: 'Chemical not found' });

    const previousStock = parseFloat(chem[0].current_stock);
    const newQty = parseFloat(new_quantity);

    await safeTenantExecute(tenantDb, 'UPDATE chemicals SET current_stock=? WHERE id=?', [newQty, req.params.id]);
    await safeTenantExecute(tenantDb,
      `INSERT INTO chemical_transactions (chemical_id, transaction_type, quantity, unit, previous_stock, new_stock, notes)
       VALUES (?, 'adjusted', ?, ?, ?, ?, ?)`,
      [req.params.id, Math.abs(newQty - previousStock), chem[0].unit, previousStock, newQty, reason || 'Manual stock adjustment']
    );

    res.json({ success: true, message: 'Stock adjusted successfully', previous_stock: previousStock, new_stock: newQty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET TRANSACTIONS FOR A CHEMICAL
// ============================================
exports.getTransactions = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const sql = `SELECT ct.*, c.name as chemical_name FROM chemical_transactions ct 
               JOIN chemicals c ON c.id = ct.chemical_id
               WHERE ct.chemical_id = ?
               ORDER BY ct.created_at DESC LIMIT 100`;

    const rows = await safeTenantQuery(tenantDb, sql, [req.params.id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// DASHBOARD SUMMARY
// ============================================
exports.getDashboardSummary = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const [totalChemicals] = await safeTenantQuery(tenantDb, 'SELECT COUNT(*) as total FROM chemicals WHERE is_active=1');
    const [lowStock] = await safeTenantQuery(tenantDb, 'SELECT COUNT(*) as total FROM chemicals WHERE is_active=1 AND current_stock <= min_stock_level');
    const [recentUsage] = await safeTenantQuery(tenantDb,
      `SELECT COALESCE(SUM(quantity_used), 0) as total FROM deceased_chemical_usage 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );
    const recentTransactions = await safeTenantQuery(tenantDb,
      `SELECT ct.*, c.name as chemical_name FROM chemical_transactions ct 
       JOIN chemicals c ON c.id = ct.chemical_id
       ORDER BY ct.created_at DESC LIMIT 10`
    );
    const topUsed = await safeTenantQuery(tenantDb,
      `SELECT c.id, c.name, c.unit, COALESCE(SUM(dcu.quantity_used),0) as total_used
       FROM chemicals c LEFT JOIN deceased_chemical_usage dcu ON dcu.chemical_id = c.id
       AND dcu.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       WHERE c.is_active=1 GROUP BY c.id ORDER BY total_used DESC LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        total_chemicals: totalChemicals?.total || 0,
        low_stock_count: lowStock?.total || 0,
        total_usage_30d: recentUsage?.total || 0,
        recent_transactions: recentTransactions || [],
        top_used_chemicals: topUsed || []
      }
    });
  } catch (error) {
    console.error('[chemicalController.getDashboardSummary]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET LOW STOCK ALERTS
// ============================================
exports.getLowStockAlerts = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const sql = `SELECT id, name, category, unit, current_stock, min_stock_level,
                (current_stock - min_stock_level) as deficit
               FROM chemicals 
               WHERE is_active=1 AND current_stock <= min_stock_level
               ORDER BY (current_stock / min_stock_level) ASC`;

    const rows = await safeTenantQuery(tenantDb, sql);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// CHEMICAL ANALYTICS
// ============================================
exports.getChemicalAnalytics = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const sql = `
      SELECT c.id as chemical_id, c.name as chemical_name, c.category, c.unit, 
             c.current_stock, c.min_stock_level, c.reorder_level, c.hazard_level,
             COALESCE((SELECT SUM(quantity_used) FROM deceased_chemical_usage 
                       WHERE chemical_id = c.id AND DATE(created_at) = CURDATE()), 0) as used_today,
             COALESCE((SELECT SUM(quantity_used) FROM deceased_chemical_usage 
                       WHERE chemical_id = c.id AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)), 0) as total_used_30d,
             CASE WHEN c.current_stock <= c.min_stock_level THEN 1 ELSE 0 END as is_low_stock,
             c.created_at
      FROM chemicals c
      WHERE c.is_active = 1
      ORDER BY c.name ASC`;

    const rows = await safeTenantQuery(tenantDb, sql);

    // Calculate analytics
    const data = rows.map(r => {
      const usedToday = parseFloat(r.used_today) || 0;
      const used30d = parseFloat(r.total_used_30d) || 0;
      const currentStock = parseFloat(r.current_stock) || 0;
      const dailyAvg = used30d > 0 ? used30d / 30 : 0;
      const avgPerEmbalming = usedToday > 0 ? (usedToday / Math.max(1, usedToday)) : 0;

      let daysRemaining = 999;
      let daysRemainingDisplay = '999+';
      if (dailyAvg > 0) {
        daysRemaining = currentStock / dailyAvg;
        daysRemainingDisplay = daysRemaining < 1 ? '<1' : Math.round(daysRemaining).toString();
      }

      return {
        chemical_id: r.chemical_id,
        chemical_name: r.chemical_name,
        category: r.category,
        unit: r.unit,
        current_stock: currentStock,
        min_stock_level: parseFloat(r.min_stock_level) || 0,
        reorder_level: parseFloat(r.reorder_level) || 0,
        hazard_level: r.hazard_level,
        used_today: usedToday,
        total_used_30d: used30d,
        avg_usage_per_embalming: avgPerEmbalming.toFixed(2),
        estimate_days_remaining: daysRemainingDisplay,
        actual_days_remaining: daysRemaining.toFixed(1),
        is_low_stock: r.is_low_stock
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('[chemicalController.getChemicalAnalytics]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// BRANCH USAGE DATA
// ============================================
exports.getUsageByBranch = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const branchId = req.params.branchId || req.branchId;
    if (!branchId) return res.status(400).json({ success: false, message: 'Branch ID required' });

    const rows = await safeTenantQuery(tenantDb,
      `SELECT dcu.*, c.name as chemical_name, c.unit, c.category,
              c.hazard_level,
              dcu.deceased_id
       FROM deceased_chemical_usage dcu
       JOIN chemicals c ON c.id = dcu.chemical_id
       WHERE dcu.branch_id = ?
       ORDER BY dcu.created_at DESC
       LIMIT 50`,
      [branchId]
    );

    // Map to frontend format
    const data = rows.map(r => ({
      usage_id: r.id,
      deceased_id: r.deceased_id,
      deceased_name: `Deceased #${r.deceased_id}`,
      chemical_id: r.chemical_id,
      chemical_name: r.chemical_name,
      category: r.category,
      unit: r.unit,
      quantity_used: r.quantity_used,
      used_by: r.used_by,
      usage_notes: r.usage_notes,
      used_at: r.created_at
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('[chemicalController.getUsageByBranch]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// PPE REQUESTS
// ============================================
exports.createPPERequest = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const { item_name, quantity_requested, requested_by } = req.body;
    if (!item_name || !quantity_requested || !requested_by) {
      return res.status(400).json({ success: false, message: 'item_name, quantity_requested, and requested_by are required' });
    }

    const result = await safeTenantExecute(tenantDb,
      `INSERT INTO ppe_requests (item_name, quantity_requested, requested_by)
       VALUES (?, ?, ?)`,
      [item_name, parseInt(quantity_requested), requested_by]
    );

    res.status(201).json({ success: true, message: 'PPE request submitted successfully', id: result.insertId });
  } catch (error) {
    console.error('[chemicalController.createPPERequest]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPPERequests = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const sql = `SELECT * FROM ppe_requests ORDER BY created_at DESC LIMIT 50`;

    const rows = await safeTenantQuery(tenantDb, sql);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('[chemicalController.getPPERequests]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePPERequest = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const { status, quantity_approved, notes } = req.body;

    await safeTenantExecute(tenantDb,
      `UPDATE ppe_requests SET status=COALESCE(?,status), quantity_approved=COALESCE(?,quantity_approved), 
       notes=COALESCE(?,notes) WHERE id=?`,
      [status, quantity_approved, notes, req.params.id]
    );

    res.json({ success: true, message: 'PPE request updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// CHEMICAL TRANSFERS BETWEEN BRANCHES
// ============================================
exports.createTransfer = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const { chemical_id, to_branch_id, quantity, notes } = req.body;

    if (!chemical_id || !to_branch_id || !quantity) {
      return res.status(400).json({ success: false, message: 'chemical_id, to_branch_id, and quantity are required' });
    }

    // Check stock availability
    const chem = await safeTenantQuery(tenantDb,
      'SELECT id, current_stock, unit FROM chemicals WHERE id=? AND is_active=1',
      [chemical_id]
    );
    if (!chem.length) return res.status(404).json({ success: false, message: 'Chemical not found' });

    const qty = parseFloat(quantity);
    if (parseFloat(chem[0].current_stock) < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${chem[0].current_stock} ${chem[0].unit}`
      });
    }

    const result = await safeTenantExecute(tenantDb,
      `INSERT INTO chemical_transfers (chemical_id, to_branch_id, quantity, unit, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [chemical_id, to_branch_id, qty, chem[0].unit, notes || null]
    );

    res.status(201).json({ success: true, message: 'Transfer request created', id: result.insertId });
  } catch (error) {
    console.error('[chemicalController.createTransfer]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTransfers = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const sql = `SELECT ct.*, c.name as chemical_name, c.unit
               FROM chemical_transfers ct
               JOIN chemicals c ON c.id = ct.chemical_id
               ORDER BY ct.created_at DESC LIMIT 50`;

    const rows = await safeTenantQuery(tenantDb, sql);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('[chemicalController.getTransfers]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveTransfer = async (req, res) => {
  try {
    const tenantDb = req.tenant?.db_name;
    if (!tenantDb) return res.status(400).json({ success: false, message: 'Tenant database not resolved' });

    const { status } = req.body;

    const transfer = await safeTenantQuery(tenantDb,
      'SELECT * FROM chemical_transfers WHERE id=? AND status="pending"',
      [req.params.id]
    );
    if (!transfer.length) return res.status(404).json({ success: false, message: 'Transfer not found or already processed' });

    const t = transfer[0];

    if (status === 'completed') {
      // Deduct from source branch
      const fromChem = await safeTenantQuery(tenantDb,
        'SELECT id, current_stock FROM chemicals WHERE id=? AND is_active=1',
        [t.chemical_id]
      );
      if (fromChem.length) {
        const newFromStock = parseFloat(fromChem[0].current_stock) - parseFloat(t.quantity);
        await safeTenantExecute(tenantDb, 'UPDATE chemicals SET current_stock=? WHERE id=?', [newFromStock, fromChem[0].id]);
        await safeTenantExecute(tenantDb,
          `INSERT INTO chemical_transactions (chemical_id, transaction_type, quantity, unit, previous_stock, new_stock, notes)
           VALUES (?, 'transferred', ?, ?, ?, ?, ?)`,
          [t.chemical_id, t.quantity, t.unit, fromChem[0].current_stock, newFromStock, `Transferred to branch #${t.to_branch_id}`]
        );
      }

      // Add to destination branch
      const toChem = await safeTenantQuery(tenantDb,
        'SELECT id, current_stock FROM chemicals WHERE id=? AND is_active=1',
        [t.chemical_id]
      );
      if (toChem.length) {
        const newToStock = parseFloat(toChem[0].current_stock) + parseFloat(t.quantity);
        await safeTenantExecute(tenantDb, 'UPDATE chemicals SET current_stock=? WHERE id=?', [newToStock, toChem[0].id]);
        await safeTenantExecute(tenantDb,
          `INSERT INTO chemical_transactions (chemical_id, transaction_type, quantity, unit, previous_stock, new_stock, notes)
           VALUES (?, 'received', ?, ?, ?, ?, ?)`,
          [t.chemical_id, t.quantity, t.unit, toChem[0].current_stock, newToStock, `Received from branch #${t.from_branch_id}`]
        );
      }
    }

    await safeTenantExecute(tenantDb,
      'UPDATE chemical_transfers SET status=? WHERE id=?',
      [status || 'approved', req.params.id]
    );

    res.json({ success: true, message: `Transfer ${status || 'approved'} successfully` });
  } catch (error) {
    console.error('[chemicalController.approveTransfer]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};