const express = require('express');
const router = express.Router();
const axios = require('axios');
const { safeMasterQuery } = require('../../../shared/dbConfig');
const { sendTicketNotification } = require('../services/resendEmailService');

// Import authentication middleware
const { protect, authorizeAny } = require('../../../services/app-global/middlewares/authMiddleware');

const SOCKETIO_URL = process.env.SOCKETIO_SERVICE_URL || 'http://restpoint_socketio_service:5000';

// Helper to emit socket events for real-time updates
const emitSocketEvent = async (event, tenantSlug, data) => {
  try {
    await axios.post(`${SOCKETIO_URL}/emit/${event}`, {
      tenantSlug,
      data: { ...data, tenant_slug: tenantSlug }
    }).catch(() => { }); // fire-and-forget
  } catch (e) {
    // socket emission is non-critical
  }
};

// Create a support ticket (public - anyone can submit)
router.post('/api/v1/restpoint/support/tickets', async (req, res) => {
  try {
    const { type, subject, message, tenantName, userEmail, userName } = req.body;
    const tenantSlug = req.headers['x-tenant-slug'] || 'system_shared';

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    const [result] = await safeMasterQuery(
      `INSERT INTO support_tickets (tenant_slug, tenant_name, user_email, user_name, type, subject, message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tenantSlug, tenantName || 'Unknown Tenant', userEmail || '', userName || '', type || 'help', subject, message]
    );

    const ticketId = result?.insertId || Date.now();

    // Send email notification via Resend
    try {
      await sendTicketNotification({
        ticketId,
        subject,
        message,
        tenantName: tenantName || 'Unknown Tenant',
        userEmail: userEmail || 'No email provided',
      });
    } catch (emailErr) {
      console.error('Failed to send ticket email notification:', emailErr);
    }

    // Emit socket event so tenant page refreshes in real-time
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
});

// Get tickets for a specific tenant (public with tenant header)
router.get('/api/v1/restpoint/support/tickets', async (req, res) => {
  try {
    const tenantSlug = req.query.tenant || req.headers['x-tenant-slug'] || 'system_shared';
    const [tickets] = await safeMasterQuery(
      'SELECT * FROM support_tickets WHERE tenant_slug = ? ORDER BY created_at DESC LIMIT 100',
      [tenantSlug]
    );
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('[Support] Error fetching tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

// Get all support tickets (authenticated users only - admin view)
router.get('/api/v1/restpoint/support/tickets/all', protect, authorizeAny, async (req, res) => {
  try {
    const [tickets] = await safeMasterQuery(
      'SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 200'
    );
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('[Support] Error fetching all tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

// Reply to a ticket
router.post('/api/v1/restpoint/support/tickets/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, userType } = req.body;
    const tenantSlug = req.headers['x-tenant-slug'] || 'system_shared';

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Get ticket info for socket emission
    const [tickets] = await safeMasterQuery(
      'SELECT * FROM support_tickets WHERE ticket_id = ?',
      [id]
    );

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const ticket = tickets[0];

    // Store reply in ticket_replies table
    await safeMasterQuery(
      `INSERT INTO ticket_replies (ticket_id, user_type, message, tenant_slug)
       VALUES (?, ?, ?, ?)`,
      [id, userType || 'tenant', message.trim(), tenantSlug]
    );

    // Update ticket status to in_progress if it was open
    if (ticket.status === 'open') {
      await safeMasterQuery(
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
});

// Update ticket status (authenticated users only)
router.patch('/api/v1/restpoint/support/tickets/:id', protect, authorizeAny, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [tickets] = await safeMasterQuery(
      'SELECT * FROM support_tickets WHERE ticket_id = ?',
      [id]
    );

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    await safeMasterQuery(
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
});

// Get replies for a ticket
router.get('/api/v1/restpoint/support/tickets/:id/replies', async (req, res) => {
  try {
    const { id } = req.params;
    const [replies] = await safeMasterQuery(
      'SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC',
      [id]
    );

    res.json({ success: true, replies });
  } catch (error) {
    console.error('[Support] Error fetching replies:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch replies' });
  }
});

module.exports = router;