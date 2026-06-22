require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 8001;

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
