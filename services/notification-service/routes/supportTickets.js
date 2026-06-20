const express = require('express');
const router = express.Router();
const { safeMasterQuery } = require('../../../shared/dbConfig');
const { sendTicketNotification } = require('../services/resendEmailService');

// Create a support ticket
router.post('/api/v1/restpoint/support/tickets', async (req, res) => {
  try {
    const { type, subject, message, tenantName, userEmail, userName } = req.body;
    const tenantSlug = req.headers['x-tenant-slug'] || 'system_shared';
    
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    const [result] = await safeMasterQuery(
      `INSERT INTO tenant_tracking.support_tickets (tenant_slug, tenant_name, user_email, user_name, type, subject, message)
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

// Get support tickets (for admin dashboard)
router.get('/api/v1/restpoint/support/tickets', async (req, res) => {
  try {
    const [tickets] = await safeMasterQuery(
      'SELECT * FROM tenant_tracking.support_tickets ORDER BY created_at DESC LIMIT 100'
    );

    res.json({ success: true, tickets });
  } catch (error) {
    console.error('[Support] Error fetching tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

// Update ticket status
router.patch('/api/v1/restpoint/support/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await safeMasterQuery(
      'UPDATE tenant_tracking.support_tickets SET status = ? WHERE ticket_id = ?',
      [status, id]
    );

    res.json({ success: true, message: 'Ticket updated' });
  } catch (error) {
    console.error('[Support] Error updating ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to update ticket' });
  }
});

module.exports = router;