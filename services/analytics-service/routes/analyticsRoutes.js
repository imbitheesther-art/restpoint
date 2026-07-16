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
router.get('/analytics/deceased/count', deceasedAnalytics.getDeceasedCount);
router.get('/analytics/deceased/status', deceasedAnalytics.getCaseStatusDistribution);
router.get('/analytics/deceased/trends', deceasedAnalytics.getDeceasedTrends);

// Booking & Hearse analytics
router.get('/analytics/bookings/counts', bookingAnalytics.getBookingCounts);
router.get('/analytics/hearse/fleet', bookingAnalytics.getHearseFleetStatus);

// Revenue analytics
router.get('/analytics/revenue/summary', revenueAnalytics.getRevenueSummary);
router.get('/analytics/revenue/trends', revenueAnalytics.getMonthlyRevenueTrends);

// Coffin analytics
router.get('/analytics/coffins/inventory', coffinAnalytics.getCoffinInventorySummary);
router.get('/analytics/coffins/sales', coffinAnalytics.getCoffinSales);

// Chemical analytics
router.get('/analytics/chemicals/stock', chemicalAnalytics.getChemicalStockSummary);
router.get('/analytics/chemicals/trends', chemicalAnalytics.getChemicalUsageTrends);

// Workshop analytics
router.get('/analytics/workshop/summary', workshopAnalytics.getWorkshopSummary);
router.get('/analytics/workshop/production', workshopAnalytics.getWorkshopProductionStatus);

// Vehicle analytics
router.get('/analytics/vehicle/analytics', getComprehensiveVehicleAnalytics);

// ============================================================
// COMPREHENSIVE DASHBOARD - aggregates all into one response
// ============================================================
router.get('/analytics/dashboard/comprehensive', comprehensiveDashboard.getComprehensiveDashboard);
router.get('/analytics/dashboard/compare', comprehensiveDashboard.getComparisonDashboard);

// Legacy route - backward compatibility
router.get('/analytics/mortuary-analytics', comprehensiveDashboard.getComprehensiveDashboard);

module.exports = router;