const express = require('express');
const {
  applyForLeave,
  getAllLeaves,
  getMyLeaves,
  getLeaveById,
  updateLeaveStatus,
  cancelLeave,
  uploadDocument,
  getLeaveStats,
  getUsersOnLeave
} = require('./leaveController');

const { protect, authorizeAny } = require('../app-global/middlewares/authMiddleware');

const router = express.Router();

// ============================================
// LEAVE REQUESTS
// ============================================

// Apply for leave
router.post('/apply', applyForLeave);

// Get all leaves (Admin)
router.get('/all', getAllLeaves);

// Get my leaves (Employee)
router.get('/my-leaves', getMyLeaves);

// Get leave by ID
router.get('/:id', getLeaveById);

// Update leave status (Approve/Reject)
router.patch('/:id/status', updateLeaveStatus);

// Cancel leave
router.patch('/:id/cancel', cancelLeave);

// Upload supporting document
router.post('/:id/upload-document', uploadDocument);

// ============================================
// DASHBOARD & STATS
// ============================================

// Get leave statistics
router.get('/stats/overview', getLeaveStats);

// Get users currently on leave
router.get('/users/on-leave', getUsersOnLeave);

module.exports = router;