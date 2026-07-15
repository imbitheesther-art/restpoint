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

const { protect, authorizeAny } = require('../../services/app-global/middlewares/authMiddleware');

const router = express.Router();

// ============================================
// LEAVE REQUESTS
// ============================================

// Apply for leave
router.post('/:tenantSlug/apply', applyForLeave);

// Get all leaves (Admin)
router.get('/:tenantSlug/all', getAllLeaves);

// Get my leaves (Employee)
router.get('/:tenantSlug/my-leaves', getMyLeaves);

// Get leave by ID
router.get('/:tenantSlug/:id', getLeaveById);

// Update leave status (Approve/Reject)
router.patch('/:tenantSlug/:id/status', updateLeaveStatus);

// Cancel leave
router.patch('/:tenantSlug/:id/cancel', cancelLeave);

// Upload supporting document
router.post('/:tenantSlug/:id/upload-document', uploadDocument);

// ============================================
// DASHBOARD & STATS
// ============================================

// Get leave statistics
router.get('/:tenantSlug/stats/overview', getLeaveStats);

// Get users currently on leave
router.get('/:tenantSlug/users/on-leave', getUsersOnLeave);

module.exports = router;