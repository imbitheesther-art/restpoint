require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');

const app = express();
// FIX 1: Harmonized default port to match the Gateway's internal mapping
const PORT = process.env.PORT || 5001;

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'https://restpoint.co.ke',
        'https://app.restpoint.co.ke'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Tenant-Id'],
    exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware for parsing incoming requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// HEALTH CHECK
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'auth-service',
        timestamp: new Date().toISOString()
    });
});

// =============================================================================
// FIX 2: CLEAN ROOT MOUNTING FOR THE GATEWAY
// =============================================================================
// Your Gateway sends clean rewritten paths (e.g., '/auth/login').
// To avoid path doubling errors (like '/auth/auth/login'), we mount the router 
// at the root domain '/' path level as a catch-all fallback handler.
app.use('/', authRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found inside auth-service`
    });
});

// Global Error handler
app.use((err, req, res, next) => {
    if (err.type === 'request.aborted' || (err.message && err.message.includes('aborted'))) {
        console.warn(`[Warning] ${new Date().toISOString()} Request to ${req.url} was aborted.`);
        if (!res.headersSent) {
            return res.status(400).json({
                success: false,
                message: 'Request aborted or connection closed unexpectedly.'
            });
        }
        return;
    }

    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong inside auth-service!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 [auth-service] running cleanly on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});