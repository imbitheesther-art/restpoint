
const express = require('express');
const router = express.Router();
const { protect, authorizeAny } = require('../../../services/app-global/middlewares/authMiddleware');

const hearseBookingController = require('../controllers/bookHerse');
const hearseController = require('../controllers/restpoint/hearseController');
// Apply authentication to all routes
router.use(protect);
router.use(authorizeAny);

// ============================================================
// HEARSE MANAGEMENT
// ============================================================

// Register new hearse with image upload
router.post('/hearses', hearseController.upload.single('image'), hearseController.registerHearse);

// Update hearse with optional image upload
router.put('/hearses/:id', hearseController.upload.single('image'), hearseController.updateHearse);

// Delete hearse
router.delete('/hearses/:id', hearseController.deleteHearse);

// Get all hearses with branch information
router.get('/hearses', hearseController.getAllHearses);

// Get available hearses in current branch
router.get('/hearses/available', hearseController.getAvailableHearses);

// Get available hearses across all branches (for cross-branch booking)
router.get('/hearses/available/cross-branch', hearseController.getAvailableHearsesCrossBranch);

// ============================================================
// HEARSE BOOKINGS
// ============================================================

router.get('/hearse-bookings/availability', hearseBookingController.getAvailabilityAcrossBranches);
router.get('/hearse-bookings/check-date', hearseBookingController.checkAvailabilityByDate);

router.post('/hearse-bookings', hearseBookingController.makeHearseBooking);
router.get('/hearse-bookings', hearseBookingController.getAllHearseBookings);

router.put('/hearse-bookings/:booking_id/assign-driver', hearseBookingController.assignDriverToBooking);
router.put('/hearse-bookings/:booking_id/status', hearseBookingController.updateBookingStatus);
router.patch('/hearse-bookings/:booking_id/postpone', hearseBookingController.postponeHearseBooking);

// ============================================================
// DRIVERS
// ============================================================
router.get('/all-drivers', hearseBookingController.getAllDrivers);
router.get('/drivers/:driver_id/bookings', hearseBookingController.getBookingsByDriver);
router.get('/drivers/:driver_id/dashboard', hearseBookingController.getDriverDashboard);

module.exports = router;