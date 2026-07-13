const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../../../services/app-global/middlewares/authMiddleware');

// Import all small analytics controllers
const deceasedAnalytics = require('../controllers/deceasedAnalytics');
const bookingAnalytics = require('../controllers/bookingAnalytics');
const revenueAnalytics = require('../controllers/revenueAnalytics');
const coffinAnalytics = require('../controllers/coffinAnalytics');
const chemicalAnalytics = require('../controllers/chemicalAnalytics');
const workshopAnalytics = require('../controllers/workshopAnalytics');
const comprehensiveDashboard = require('../controllers/comprehensiveDashboard');
const { getComprehensiveVehicleAnalytics } = require('../controllers/analytics');

// Analytics routes use optional auth - dashboard is read-only data
router.use(optionalAuth);

// ============================================================
// INDIVIDUAL ANALYTICS ENDPOINTS - each fetches one thing
// ============================================================

// Deceased analytics
router.get('/deceased/count', deceasedAnalytics.getDeceasedCount);
router.get('/deceased/status', deceasedAnalytics.getCaseStatusDistribution);
router.get('/deceased/trends', deceasedAnalytics.getDeceasedTrends);

// Booking & Hearse analytics
router.get('/bookings/counts', bookingAnalytics.getBookingCounts);
router.get('/hearse/fleet', bookingAnalytics.getHearseFleetStatus);

// Revenue analytics
router.get('/revenue/summary', revenueAnalytics.getRevenueSummary);
router.get('/revenue/trends', revenueAnalytics.getMonthlyRevenueTrends);

// Coffin analytics
router.get('/coffins/inventory', coffinAnalytics.getCoffinInventorySummary);
router.get('/coffins/sales', coffinAnalytics.getCoffinSales);

// Chemical analytics
router.get('/chemicals/stock', chemicalAnalytics.getChemicalStockSummary);
router.get('/chemicals/trends', chemicalAnalytics.getChemicalUsageTrends);

// Workshop analytics
router.get('/workshop/summary', workshopAnalytics.getWorkshopSummary);
router.get('/workshop/production', workshopAnalytics.getWorkshopProductionStatus);

// Vehicle analytics
router.get('/vehicle/analytics', getComprehensiveVehicleAnalytics);

// ============================================================
// COMPREHENSIVE DASHBOARD - aggregates all into one response
// ============================================================
router.get('/dashboard/comprehensive', comprehensiveDashboard.getComprehensiveDashboard);

// Legacy route - backward compatibility
router.get('/mortuary-analytics', comprehensiveDashboard.getComprehensiveDashboard);

module.exports = router;