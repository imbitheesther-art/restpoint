const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// These routes will work for:
// /login, /auth/login, /api/v1/restpoint/auth/login
// Because of how the router is mounted

// Public routes
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/register', register);

// Also handle root level requests
router.post('/api/v1/restpoint/auth/login', login);
router.post('/api/v1/restpoint/auth/logout', logout);
router.post('/api/v1/restpoint/auth/refresh', refresh);
router.post('/api/v1/restpoint/auth/register', register);

// Also handle /auth prefix
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.post('/auth/refresh', refresh);
router.post('/auth/register', register);

module.exports = router;