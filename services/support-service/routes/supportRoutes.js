const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

// Create a support ticket (public - anyone can submit)
router.post('/tickets', supportController.createTicket);

// Get tickets for a specific tenant
router.get('/tickets', supportController.getTickets);

// Get all support tickets (admin view)
router.get('/tickets/all', supportController.getAllTickets);

// Reply to a ticket
router.post('/tickets/:id/reply', supportController.replyToTicket);

// Update ticket status
router.patch('/tickets/:id', supportController.updateTicketStatus);

// Get replies for a ticket
router.get('/tickets/:id/replies', supportController.getTicketReplies);

module.exports = router;