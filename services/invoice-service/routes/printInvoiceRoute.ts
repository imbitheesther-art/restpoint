const express = require('express');
const router = express.Router();
// @ts-ignore - authMiddleware is JavaScript, not TypeScript
const { protect, authorizeAny } = require('../../../global/middlewares/authMiddleware');
// @ts-ignore - Controller is JavaScript, not TypeScript
const printInvoiceCtrl = require('../controllers/printinvoice');

// Apply authentication to all routes
router.use(protect);
router.use(authorizeAny);

// Make sure this comes AFTER /invoices/:id or any similar route
router.post('/invoices/:id/print', printInvoiceCtrl.printInvoice);

module.exports = router;
