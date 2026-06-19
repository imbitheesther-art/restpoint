/**
 * CORS Middleware
 * Provides CORS configuration for all services
 */
const cors = require('cors');

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'x-csrf-token',
    'x-tenant-slug',
    'x-tenant-id',
    'Origin',
    'Accept'
  ]
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;