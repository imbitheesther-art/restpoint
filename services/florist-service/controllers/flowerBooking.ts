/**
 * Flower Booking Controller
 * Handles CRUD operations for flower bookings and customers
 */

// @ts-ignore
import { getTenantDB, safeTenantQuery, safeTenantExecute } from '../../../shared/dbConfig.js';

interface Booking {
    id?: number;
    booking_id: string;
    flower_type: string;
    flower_description?: string;
    service_type: string;
    customer: string;
    customer_phone?: string;
    customer_email?: string;
    deceased_name?: string;
    branch: string;
    delivery_date: string;
    delivery_time: string;
    delivery_address?: string;
    invoice_number?: string;
    amount: number;
    status: string;
    notes?: string;
    urgent?: boolean | number;
    branch_id?: number;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
}

interface Customer {
    id?: number;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    total_orders?: number;
    total_spent?: number;
    branch_id?: number;
    created_at?: string;
    updated_at?: string;
}

// ============================================
// BOOKINGS
// ============================================

/**
 * GET /florist/bookings
 * List all flower bookings with optional filters
 */
export const getBookings = async (req: any, res: any) => {
    try {
        const dbName = req.tenant?.db_name || process.env.DB_NAME || 'restpoint_main';
        const { status, branch, flower_type, date_from, date_to, search, page = '1', limit = '20' } = req.query;

        let whereClause = 'WHERE 1=1';
        const params: any[] = [];

        if (status) {
            whereClause += ' AND status = ?';
            params.push(status);
        }
        if (branch) {
            whereClause += ' AND branch = ?';
            params.push(branch);
        }
        if (flower_type) {
            whereClause += ' AND flower_type = ?';
            params.push(flower_type);
        }
        if (date_from) {
            whereClause += ' AND delivery_date >= ?';
            params.push(date_from);
        }
        if (date_to) {
            whereClause += ' AND delivery_date <= ?';
            params.push(date_to);
        }
        if (search) {
            whereClause += ' AND (customer LIKE ? OR booking_id LIKE ? OR invoice_number LIKE ? OR deceased_name LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Count total
        const countResult = await safeTenantQuery(
            dbName,
            `SELECT COUNT(*) as total FROM flower_bookings ${whereClause}`,
            params
        );
        const total = countResult[0]?.total || 0;

        // Paginate
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        const bookings = await safeTenantQuery(
            dbName,
            `SELECT * FROM flower_bookings ${whereClause} ORDER BY delivery_date DESC, delivery_time ASC LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );

        res.json({
            success: true,
            data: bookings,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error: any) {
        console.error('[FLORIST] Error fetching bookings:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch bookings', message: error.message });
    }
};

/**
 * GET /florist/bookings/:id
 * Get a single booking by ID
 */
export const getBookingById = async (req: any, res: any) => {
    try {
        const dbName = req.tenant?.db_name || process.env.DB_NAME || 'restpoint_main';
        const { id } = req.params;

        const bookings = await safeTenantQuery(
            dbName,
            'SELECT * FROM flower_bookings WHERE id = ? OR booking_id = ? LIMIT 1',
            [id, id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        res.json({ success: true, data: bookings[0] });
    } catch (error: any) {
        console.error('[FLORIST] Error fetching booking:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch booking', message: error.message });
    }
};

/**
 * POST /florist/bookings
 * Create a new flower booking
 */
export const createBooking = async (req: any, res: any) => {
    try {
        const dbName = req.tenant?.db_name || process.env.DB_NAME || 'restpoint_main';
        const {
            flower_type, flower_description, service_type, customer,
            customer_phone, customer_email, deceased_name, branch,
            delivery_date, delivery_time, delivery_address, amount,
            notes, urgent
        } = req.body;

        // Validation
        if (!flower_type || !service_type || !customer || !branch || !delivery_date || !delivery_time) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: flower_type, service_type, customer, branch, delivery_date, delivery_time'
            });
        }

        // Generate booking ID
        const countResult = await safeTenantQuery(
            dbName,
            'SELECT COUNT(*) as total FROM flower_bookings'
        );
        const count = countResult[0]?.total || 0;
        const booking_id = `FLW-${24000 + count + 1}`;
        const invoice_number = `INV-${24000 + count + 1}`;

        const result = await safeTenantQuery(
            dbName,
            `INSERT INTO flower_bookings 
            (booking_id, flower_type, flower_description, service_type, customer, 
             customer_phone, customer_email, deceased_name, branch, 
             delivery_date, delivery_time, delivery_address, invoice_number, 
             amount, status, notes, urgent, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
            [
                booking_id, flower_type, flower_description || '', service_type, customer,
                customer_phone || '', customer_email || '', deceased_name || '', branch,
                delivery_date, delivery_time, delivery_address || '', invoice_number,
                amount || 0, notes || '', urgent ? 1 : 0, req.tenantSlug || 'system'
            ]
        );

        // Update customer stats if customer exists
        try {
            const existingCustomers = await safeTenantQuery(
                dbName,
                'SELECT id FROM flower_customers WHERE name = ? AND phone = ? LIMIT 1',
                [customer, customer_phone || '']
            );

            if (existingCustomers.length > 0) {
                await safeTenantQuery(
                    dbName,
                    'UPDATE flower_customers SET total_orders = total_orders + 1, total_spent = total_spent + ? WHERE id = ?',
                    [amount || 0, existingCustomers[0].id]
                );
            } else {
                await safeTenantQuery(
                    dbName,
                    'INSERT INTO flower_customers (name, phone, email, total_orders, total_spent) VALUES (?, ?, ?, 1, ?)',
                    [customer, customer_phone || '', customer_email || '', amount || 0]
                );
            }
        } catch (e) {
            console.log('[FLORIST] Customer stats update skipped:', (e as Error).message);
        }

        const newBooking = await safeTenantQuery(
            dbName,
            'SELECT * FROM flower_bookings WHERE booking_id = ? LIMIT 1',
            [booking_id]
        );

        res.status(201).json({ success: true, data: newBooking[0], message: 'Booking created successfully' });
    } catch (error: any) {
        console.error('[FLORIST] Error creating booking:', error.message);
        res.status(500).json({ success: false, error: 'Failed to create booking', message: error.message });
    }
};

/**
 * PUT /florist/bookings/:id
 * Update an existing booking
 */
export const updateBooking = async (req: any, res: any) => {
    try {
        const dbName = req.tenant?.db_name || process.env.DB_NAME || 'restpoint_main';
        const { id } = req.params;
        const updates = req.body;

        // Check booking exists
        const existing = await safeTenantQuery(
            dbName,
            'SELECT * FROM flower_bookings WHERE id = ? OR booking_id = ? LIMIT 1',
            [id, id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        // Build SET clause dynamically
        const allowedFields = [
            'flower_type', 'flower_description', 'service_type', 'customer',
            'customer_phone', 'customer_email', 'deceased_name', 'branch',
            'delivery_date', 'delivery_time', 'delivery_address', 'amount',
            'status', 'notes', 'urgent'
        ];

        const setClauses: string[] = [];
        const params: any[] = [];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                setClauses.push(`${field} = ?`);
                params.push(field === 'urgent' ? (updates[field] ? 1 : 0) : updates[field]);
            }
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ success: false, error: 'No valid fields to update' });
        }

        params.push(existing[0].id);

        await safeTenantQuery(
            dbName,
            `UPDATE flower_bookings SET ${setClauses.join(', ')} WHERE id = ?`,
            params
        );

        const updated = await safeTenantQuery(
            dbName,
            'SELECT * FROM flower_bookings WHERE id = ? LIMIT 1',
            [existing[0].id]
        );

        res.json({ success: true, data: updated[0], message: 'Booking updated successfully' });
    } catch (error: any) {
        console.error('[FLORIST] Error updating booking:', error.message);
        res.status(500).json({ success: false, error: 'Failed to update booking', message: error.message });
    }
};

/**
 * PATCH /florist/bookings/:id/status
 * Update booking status only
 */
export const updateBookingStatus = async (req: any, res: any) => {
    try {
        const dbName = req.tenant?.db_name || process.env.DB_NAME || 'restpoint_main';
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const result = await safeTenantExecute(
            dbName,
            'UPDATE flower_bookings SET status = ? WHERE id = ? OR booking_id = ?',
            [status, id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        const updated = await safeTenantQuery(
            dbName,
            'SELECT * FROM flower_bookings WHERE id = ? OR booking_id = ? LIMIT 1',
            [id, id]
        );

        res.json({ success: true, data: updated[0], message: `Status updated to ${status}` });
    } catch (error: any) {
        console.error('[FLORIST] Error updating booking status:', error.message);
        res.status(500).json({ success: false, error: 'Failed to update status', message: error.message });
    }
};

/**
 * DELETE /florist/bookings/:id
 * Delete a booking
 */
export const deleteBooking = async (req: any, res: any) => {
    try {
        const dbName = req.tenant?.db_name || process.env.DB_NAME || 'restpoint_main';
        const { id } = req.params;

        const result = await safeTenantExecute(
            dbName,
            'DELETE FROM flower_bookings WHERE id = ? OR booking_id = ?',
            [id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        res.json({ success: true, message: 'Booking deleted successfully' });
    } catch (error: any) {
        console.error('[FLORIST] Error deleting booking:', error.message);
        res.status(500).json({ success: false, error: 'Failed to delete booking', message: error.message });
    }
};

// ============================================
// DASHBOARD / STATS
// ============================================

/**
 * GET /florist/stats
 * Get dashboard statistics
 */
export const getStats = async (req: any, res: any) => {
    try {
        const dbName = req.tenant?.db_name || process.env.DB_NAME || 'restpoint_main';

        const totalResult = await safeTenantQuery(dbName, 'SELECT COUNT(*) as total FROM flower_bookings');
        const total = totalResult[0]?.total || 0;

        const statusCounts = await safeTenantQuery(
            dbName,
            `SELECT status, COUNT(*) as count FROM flower_bookings GROUP BY status`
        );

        const statusMap: Record<string, number> = {};
        statusCounts.forEach((row: any) => { statusMap[row.status] = row.count; });

        const revenueResult = await safeTenantQuery(
            dbName,
            'SELECT COALESCE(SUM(amount), 0) as total_revenue FROM flower_bookings WHERE status != "cancelled"'
        );
        const totalRevenue = revenueResult[0]?.total_revenue || 0;

        // Upcoming (future deliveries, not delivered/cancelled)
        const upcomingResult = await safeTenantQuery(
            dbName,
            `SELECT COUNT(*) as count FROM flower_bookings 
             WHERE delivery_date >= CURDATE() AND status NOT IN ('delivered', 'cancelled')`
        );
        const upcoming = upcomingResult[0]?.count || 0;

        // Today's deliveries
        const todayResult = await safeTenantQuery(
            dbName,
            `SELECT COUNT(*) as count FROM flower_bookings WHERE delivery_date = CURDATE()`
        );
        const todayDeliveries = todayResult[0]?.count || 0;

        // Monthly revenue (current month)
        const monthlyResult = await safeTenantQuery(
            dbName,
            `SELECT COALESCE(SUM(amount), 0) as revenue FROM flower_bookings 
             WHERE MONTH(delivery_date) = MONTH(CURDATE()) AND YEAR(delivery_date) = YEAR(CURDATE())
             AND status != 'cancelled'`
        );
        const monthlyRevenue = monthlyResult[0]?.revenue || 0;

        // Urgent bookings
        const urgentResult = await safeTenantQuery(
            dbName,
            `SELECT COUNT(*) as count FROM flower_bookings WHERE urgent = 1 AND status NOT IN ('delivered', 'cancelled')`
        );
        const urgent = urgentResult[0]?.count || 0;

        res.json({
            success: true,
            data: {
                total,
                pending: statusMap['pending'] || 0,
                confirmed: statusMap['confirmed'] || 0,
                preparing: statusMap['preparing'] || 0,
                delivering: statusMap['delivering'] || 0,
                delivered: statusMap['delivered'] || 0,
                cancelled: statusMap['cancelled'] || 0,
                inProgress: (statusMap['confirmed'] || 0) + (statusMap['preparing'] || 0) + (statusMap['delivering'] || 0),
                totalRevenue,
                monthlyRevenue,
                upcoming,
                todayDeliveries,
                urgent
            }
        });
    } catch (error: any) {
        console.error('[FLORIST] Error fetching stats:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch stats', message: error.message });
    }
};

/**
 * GET /florist/stats/monthly-trend
 * Get monthly booking trend for last 6 months
 */
export const getMonthlyTrend = async (req: any, res: any) => {
    try {
        const dbName = req.tenant?.db_name || process.env.DB_NAME || 'restpoint_main';

        const trend = await safeTenantQuery(
            dbName,
            `SELECT 
                DATE_FORMAT(delivery_date, '%Y-%m') as month,
                COUNT(*) as count,
                COALESCE(SUM(amount), 0) as revenue
             FROM flower_bookings
             WHERE delivery_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
             GROUP BY DATE_FORMAT(delivery_date, '%Y-%m')
             ORDER BY month ASC`
        );

        res.json({ success: true, data: trend });
    } catch (error: any) {
        console.error('[FLORIST] Error fetching monthly trend:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch trend', message: error.message });
    }
};

// ============================================
// CUSTOMERS
// ============================================

/**
 * GET /florist/customers
 * List all flower customers
 */
export const getCustomers = async (req: any, res: any) => {
    try {
        const dbName = req.tenant?.db_name || process.env.DB_NAME || 'restpoint_main';
        const { search, page = '1', limit = '20' } = req.query;

        let whereClause = 'WHERE 1=1';
        const params: any[] = [];

        if (search) {
            whereClause += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        const countResult = await safeTenantQuery(
            dbName,
            `SELECT COUNT(*) as total FROM flower_customers ${whereClause}`,
            params
        );
        const total = countResult[0]?.total || 0;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        const customers = await safeTenantQuery(
            dbName,
            `SELECT * FROM flower_customers ${whereClause} ORDER BY total_orders DESC, name ASC LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );

        res.json({
            success: true,
            data: customers,
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
        });
    } catch (error: any) {
        console.error('[FLORIST] Error fetching customers:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch customers', message: error.message });
    }
};

/**
 * GET /florist/customers/:id
 * Get a single customer with their bookings
 */
export const getCustomerById = async (req: any, res: any) => {
    try {
        const dbName = req.tenant?.db_name || process.env.DB_NAME || 'restpoint_main';
        const { id } = req.params;

        const customers = await safeTenantQuery(
            dbName,
            'SELECT * FROM flower_customers WHERE id = ? LIMIT 1',
            [id]
        );

        if (customers.length === 0) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }

        // Get customer's bookings
        const bookings = await safeTenantQuery(
            dbName,
            'SELECT * FROM flower_bookings WHERE customer = ? ORDER BY delivery_date DESC LIMIT 50',
            [customers[0].name]
        );

        res.json({ success: true, data: { ...customers[0], bookings } });
    } catch (error: any) {
        console.error('[FLORIST] Error fetching customer:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch customer', message: error.message });
    }
};