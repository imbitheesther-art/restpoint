const express = require('express');
const router = express.Router();
const {
  getMortuaryAnalytics,
  getComprehensiveVehicleAnalytics,
} = require('../controllers/analytics');

// Import authentication middleware
const { protect, authorizeAny } = require('../../../global/middlewares/authMiddleware');

// All analytics routes require authentication
router.get('/analytics/mortuary-analytics', protect, authorizeAny, getMortuaryAnalytics);
router.get('/vehicle-analytics', protect, authorizeAny, getComprehensiveVehicleAnalytics);

module.exports = router;
