require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 8001;

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

// Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// ============================================
// ROUTES — mount at ALL possible paths
// ============================================
// When proxied through API gateway: /api/v1/restpoint/auth/*
// When accessed directly: /v1/restpoint/auth/* (gateway strips /api)
// When accessed at root: /login (direct dev access)
app.use('/api/v1/restpoint/auth', authRoutes);
app.use('/v1/restpoint/auth', authRoutes);
app.use('/restpoint/auth', authRoutes);
app.use('/auth', authRoutes);
app.use(authRoutes);

// 404 handler
app.use((req, res) => {

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

});
