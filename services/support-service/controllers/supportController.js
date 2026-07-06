const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

// Auto-create tables on startup
(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        await conn.query(`
            CREATE TABLE IF NOT EXISTS support_tickets (
                ticket_id INT AUTO_INCREMENT PRIMARY KEY,
                tenant_slug VARCHAR(100) NOT NULL,
                tenant_name VARCHAR(255),
                user_email VARCHAR(255),
                user_name VARCHAR(255),
                type VARCHAR(50) DEFAULT 'help',
                subject VARCHAR(500) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_tenant (tenant_slug),
                INDEX idx_status (status),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        await conn.query(`
            CREATE TABLE IF NOT EXISTS ticket_replies (
                reply_id INT AUTO_INCREMENT PRIMARY KEY,
                ticket_id INT NOT NULL,
                user_type VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                tenant_slug VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
                INDEX idx_ticket (ticket_id),
                INDEX idx_tenant (tenant_slug)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        await conn.release();
        console.log('Support tables ready');
    } catch (err) {
        console.error(' Table init error:', err.message);
    }
})();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

const SOCKETIO_URL = process.env.SOCKETIO_SERVICE_URL || 'http://localhost:5018';

// Helper to emit socket events
const emitSocketEvent = async (event, tenantSlug, data) => {
    try {
        await axios.post(`${SOCKETIO_URL}/emit/${event}`, {
            tenantSlug,
            data: { ...data, tenant_slug: tenantSlug }
        }).catch(() => { });
    } catch (e) {
        // socket emission is non-critical
    }
};

// Create a support ticket
exports.createTicket = async (req, res) => {
    try {
        const { type, subject, message, tenantName, userEmail, userName } = req.body;
        const tenantSlug = req.headers['x-tenant-slug'] || 'system_shared';

        if (!subject || !message) {
            return res.status(400).json({ success: false, message: 'Subject and message are required' });
        }

        const [result] = await pool.query(
            `INSERT INTO support_tickets (tenant_slug, tenant_name, user_email, user_name, type, subject, message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [tenantSlug, tenantName || 'Unknown Tenant', userEmail || '', userName || '', type || 'help', subject, message]
        );

        const ticketId = result.insertId;

        // Emit socket event for real-time updates
        await emitSocketEvent('ticket_updated', tenantSlug, { ticketId, action: 'created' });

        console.log(`[Support] Ticket #${ticketId} created from ${tenantSlug}: ${subject}`);

        res.status(201).json({
            success: true,
            message: 'Ticket submitted successfully. Our team will review it shortly.',
            ticketId,
        });
    } catch (error) {
        console.error('[Support] Error creating ticket:', error);
        res.status(500).json({ success: false, message: 'Failed to submit ticket. Please try again.' });
    }
};

// Get tickets for a specific tenant
exports.getTickets = async (req, res) => {
    try {
        const tenantSlug = req.query.tenant || req.headers['x-tenant-slug'] || 'system_shared';
        const [tickets] = await pool.query(
            'SELECT * FROM support_tickets WHERE tenant_slug = ? ORDER BY created_at DESC LIMIT 100',
            [tenantSlug]
        );
        res.json({ success: true, tickets });
    } catch (error) {
        console.error('[Support] Error fetching tickets:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
    }
};

// Get all support tickets (admin view)
exports.getAllTickets = async (req, res) => {
    try {
        const [tickets] = await pool.query(
            'SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 200'
        );
        res.json({ success: true, tickets });
    } catch (error) {
        console.error('[Support] Error fetching all tickets:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
    }
};

// Reply to a ticket
exports.replyToTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, userType } = req.body;
        const tenantSlug = req.headers['x-tenant-slug'] || 'system_shared';

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // Get ticket info
        const [tickets] = await pool.query(
            'SELECT * FROM support_tickets WHERE ticket_id = ?',
            [id]
        );

        if (!tickets || tickets.length === 0) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        const ticket = tickets[0];

        // Store reply
        await pool.query(
            `INSERT INTO ticket_replies (ticket_id, user_type, message, tenant_slug)
       VALUES (?, ?, ?, ?)`,
            [id, userType || 'tenant', message.trim(), tenantSlug]
        );

        // Update ticket status if it was open
        if (ticket.status === 'open') {
            await pool.query(
                'UPDATE support_tickets SET status = ? WHERE ticket_id = ?',
                ['in_progress', id]
            );
        }

        // Emit socket events for real-time updates
        await emitSocketEvent('ticket_response', ticket.tenant_slug || tenantSlug, {
            ticketId: id,
            message: `New reply on ticket #${id}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
            userType: userType || 'tenant',
        });

        await emitSocketEvent('ticket_updated', ticket.tenant_slug || tenantSlug, {
            ticketId: id,
            action: 'replied',
        });

        console.log(`[Support] Reply added to ticket #${id} by ${userType || 'tenant'}`);

        res.json({ success: true, message: 'Reply added' });
    } catch (error) {
        console.error('[Support] Error replying to ticket:', error);
        res.status(500).json({ success: false, message: 'Failed to add reply' });
    }
};

// Update ticket status
exports.updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const [tickets] = await pool.query(
            'SELECT * FROM support_tickets WHERE ticket_id = ?',
            [id]
        );

        if (!tickets || tickets.length === 0) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        await pool.query(
            'UPDATE support_tickets SET status = ? WHERE ticket_id = ?',
            [status, id]
        );

        const ticket = tickets[0];
        await emitSocketEvent('ticket_updated', ticket.tenant_slug || 'system_shared', {
            ticketId: id,
            status,
            action: 'status_change',
        });

        res.json({ success: true, message: 'Ticket updated' });
    } catch (error) {
        console.error('[Support] Error updating ticket:', error);
        res.status(500).json({ success: false, message: 'Failed to update ticket' });
    }
};

// Get replies for a ticket
exports.getTicketReplies = async (req, res) => {
    try {
        const { id } = req.params;
        const [replies] = await pool.query(
            'SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC',
            [id]
        );

        res.json({ success: true, replies });
    } catch (error) {
        console.error('[Support] Error fetching replies:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch replies' });
    }
};