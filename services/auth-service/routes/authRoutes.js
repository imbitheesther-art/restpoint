const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  createUser,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refresh);
router.get('/me', getMe);

// Protected routes - require authentication
router.post('/logout', protect, logout);
router.post('/users', protect, createUser); // Create additional users

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
