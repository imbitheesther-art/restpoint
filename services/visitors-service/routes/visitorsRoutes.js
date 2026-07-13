const express = require('express');
const router = express.Router();
const {
  registerVisitor,
  getRecentVisitors,
  getOnlineBookings,
  processBooking,
} = require('../controllers/visitorsControl');

// Import authentication middleware
const { protect, authorizeAny } = require('../../../services/app-global/middlewares/authMiddleware');

// Public route - visitors can register themselves
router.post('/register-visitor', registerVisitor);

// Protected routes - any authenticated user can access
router.get('/recent-visitors', protect, authorizeAny, getRecentVisitors);
router.get('/online-bookings', protect, authorizeAny, getOnlineBookings);
router.post('/process-booking/:id', protect, authorizeAny, processBooking);

module.exports = router;
