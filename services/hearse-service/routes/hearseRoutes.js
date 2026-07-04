


const express = require('express');
const router = express.Router();

const hearseBookingController = require('../controllers/bookHerse');
const hearseController = require('../controllers/restpoint/hearseController');

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

// ⚠️ IMPORTANT: static/specific routes must come BEFORE '/hearse-bookings/:booking_id...'
// style dynamic routes, otherwise Express will try to match "availability"
// as a booking_id param and break this endpoint.
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