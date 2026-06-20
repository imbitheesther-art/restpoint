const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 8016;

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'extra-services',
    timestamp: new Date().toISOString()
  });
});

// Extra charges routes
app.get('/api/v1/restpoint/extra-charges', (req, res) => {
  res.json({
    success: true,
    message: 'Extra services endpoint',
    timestamp: new Date().toISOString()
  });
});

// Currency update endpoint
app.get('/api/v1/restpoint/extra/currency', (req, res) => {
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
