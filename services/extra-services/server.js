const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables from .env / .env.local before any middleware runs
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 8016;

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Import auth middleware after env is loaded
const { protect, authorizeAny } = require('../../global/middlewares/authMiddleware');

// Health check (no auth)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'extra-services',
    timestamp: new Date().toISOString()
  });
});

// Protected routes - require authentication
app.get('/api/v1/restpoint/extra-charges', protect, authorizeAny, (req, res) => {
  res.json({
    success: true,
    message: 'Extra services endpoint',
    timestamp: new Date().toISOString()
  });
});

// Currency update endpoint
app.get('/api/v1/restpoint/extra/currency', protect, authorizeAny, (req, res) => {
  res.json({
    success: true,
    message: 'Currency update endpoint',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Extra Services running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Extra Services shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Extra Services shutting down...');
  process.exit(0);
});
