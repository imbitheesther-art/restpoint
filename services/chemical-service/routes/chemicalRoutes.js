const express = require('express');
const router = express.Router();
const chemicalController = require('../controllers/chemicalController');
const usageController = require('../controllers/usageController');

// Optional auth middleware (chemical service works with tenant header, not JWT)
const optionalAuth = (req, res, next) => {
    // If Authorization header exists, try to decode user info
    // but don't block if it's missing (tenant header is primary auth)
    next();
};

// ============================================
// CHEMICAL INVENTORY ROUTES
// ============================================
// NOTE: Specific routes MUST come BEFORE wildcard /:id routes
// to prevent Express from matching "analytics", "transfers" etc. as :id

// Get all chemicals (with low stock flag, usage data)
router.get('/', chemicalController.getAll);

// Create new chemical
router.post('/', chemicalController.create);

// ============================================
// STOCK TRANSACTIONS
// ============================================

// Receive stock (add to inventory)
router.post('/:id/receive', chemicalController.receiveStock);

// Adjust stock (manual correction)
router.post('/:id/adjust', chemicalController.adjustStock);

// Get transaction history for a chemical
router.get('/:id/transactions', chemicalController.getTransactions);

// ============================================
// DECEASED CHEMICAL USAGE
// ============================================

// Record chemical usage on a deceased
router.post('/usage', usageController.recordUsage);

// Get all chemicals used on a specific deceased
router.get('/usage/deceased/:deceasedId', usageController.getByDeceased);

// Get all deceased that have used a specific chemical
router.get('/usage/chemical/:chemicalId', usageController.getDeceasedByChemical);

// Get full usage report (all deceased + chemicals used)
router.get('/usage/report', usageController.getUsageReport);

// ============================================
// BRANCH-SPECIFIC ENDPOINTS
// ============================================

// Get dashboard summary for a branch
router.get('/dashboard/summary/:branchId', chemicalController.getDashboardSummary);

// Get dashboard summary (no branch param - uses header)
router.get('/dashboard/summary', chemicalController.getDashboardSummary);

// Get chemical analytics for a branch
router.get('/analytics/:branchId', chemicalController.getChemicalAnalytics);

// Get chemical analytics (no branch param - uses header)
router.get('/analytics', chemicalController.getChemicalAnalytics);

// Get usage data for a branch
router.get('/usage/branch/:branchId', chemicalController.getUsageByBranch);

// ============================================
// LOW STOCK ALERTS
// ============================================

// Low stock alerts
router.get('/alerts/low-stock', chemicalController.getLowStockAlerts);

// ============================================
// PPE REQUESTS
// ============================================

// Create PPE request
router.post('/ppe-requests', chemicalController.createPPERequest);

// Get PPE requests (optionally by branch)
router.get('/ppe-requests/:branchId', chemicalController.getPPERequests);

// Get all PPE requests
router.get('/ppe-requests', chemicalController.getPPERequests);

// Update PPE request status
router.put('/ppe-requests/:id', chemicalController.updatePPERequest);

// ============================================
// CHEMICAL TRANSFERS (between branches)
// ============================================

// Create transfer request
router.post('/transfers', chemicalController.createTransfer);

// Get transfers (optionally by branch)
router.get('/transfers/:branchId', chemicalController.getTransfers);

// Get all transfers
router.get('/transfers', chemicalController.getTransfers);

// Approve/reject/complete a transfer
router.put('/transfers/:id', chemicalController.approveTransfer);

// ============================================
// WILDCARD ROUTES (must come AFTER all specific routes)
// ============================================

// Get single chemical by ID
router.get('/:id', chemicalController.getById);

// Update chemical
router.put('/:id', chemicalController.update);

// Delete chemical (soft delete)
router.delete('/:id', chemicalController.remove);

module.exports = router;