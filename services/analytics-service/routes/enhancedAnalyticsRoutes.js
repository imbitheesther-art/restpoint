const express = require('express');
const router = express.Router();
const enhancedAnalyticsController = require('../controllers/enhancedAnalytics');
const backgroundAnalyticsController = require('../controllers/backgroundAnalytics');

// Import authentication middleware
const { protect, authorizeAny } = require('../../../services/app-global/middlewares/authMiddleware');

// All enhanced analytics routes require authentication
router.use(protect);
router.use(authorizeAny);

// Dashboard endpoints
router.get('/dashboard', enhancedAnalyticsController.getDashboard);
router.get('/monthly', enhancedAnalyticsController.getMonthlyAnalytics);
router.get('/yearly', enhancedAnalyticsController.getYearlyAnalytics);

// Background job endpoints (run heavy analytics asynchronously)
// Start a background dashboard job (returns jobId)
router.post('/dashboard/background', backgroundAnalyticsController.startDashboardBackground);
// Check job status/result
router.get('/background/jobs/:id', backgroundAnalyticsController.getJobStatus);

// Report endpoints
router.get('/report', enhancedAnalyticsController.getComprehensiveReport);
router.post('/report/save', enhancedAnalyticsController.saveReport);
router.get('/reports', enhancedAnalyticsController.getSavedReports);

// Export endpoints
router.post('/export/pdf', enhancedAnalyticsController.exportPDF);
router.post('/export/excel', enhancedAnalyticsController.exportExcel);
router.post('/export/csv', enhancedAnalyticsController.exportCSV);

module.exports = router;
