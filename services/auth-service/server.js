require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ============================================
// CORS — allow all headers the frontend sends
// ============================================
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-CSRF-Token',
        'x-csrf-token',
        'x-tenant-slug',
        'x-tenant-id',
        'x-request-timestamp',
        'x-client-id',
        'x-session-fingerprint',
        'X-Client-ID',
        'X-Session-Fingerprint',
        'Origin',
        'X-Requested-With',
        'Accept'
    ]
}));

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

// ============================================
// ROUTES — mount at ALL possible paths
// ============================================
// When proxied through API gateway: /api/v1/restpoint/auth/*
// When accessed directly: /v1/restpoint/auth/* (gateway strips /api)
// When accessed at root: /login (direct dev access)
app.use('/api/v1/restpoint/auth', authRoutes);
app.use('/v1/restpoint/auth', authRoutes);
app.use('/restpoint/auth', authRoutes);
app.use(authRoutes);

// 404 handler
app.use((req, res) => {
    console.log(`❌ 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        message: `Route ${req.url} not found`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Auth service running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Auth routes are ready`);
    console.log(`📍 Listening on: http://localhost:${PORT}\n`);
});
