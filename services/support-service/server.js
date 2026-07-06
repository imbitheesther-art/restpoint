require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const supportRoutes = require('./routes/supportRoutes');

const app = express();
const PORT = process.env.PORT || 8111;

// Middleware - Allow all origins for development
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`[Support] ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ success: true, service: 'support-service', status: 'ok', port: PORT });
});

// Routes - Mount at root for clean path forwarding from gateway
// The API Gateway strips /api/v1/restpoint/support prefix and forwards clean paths
app.use('/', supportRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('[Support] Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log(`  Support Service v1.0.0`);
    console.log(`  Running on http://0.0.0.0:${PORT}`);
    console.log('========================================');
});

module.exports = { app, server };