const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  createUser,
  getMe,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Rate limiting for auth endpoints
const authLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// Apply rate limiting to login endpoint
router.post('/login', authLimiter, login);
router.post('/register', register);
router.post('/refresh', refresh);
router.get('/me', getMe);
router.post('/change-password', changePassword);

// Protected routes - require authentication
router.post('/logout', protect, logout);
router.post('/users', protect, createUser);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
