// src/config/env.js
// Centralized configuration for the application environment
// ALL services import from here - single source of truth

const env = {
  // CRITICAL FIX: In production (nginx proxy), use relative path /api/
  // The nginx rewrite rule will transform /api/* to /api/v1/restpoint/*
  // In development, use the API Gateway directly
  // Can be overridden with VITE_API_URL env var
  API_URL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000'),

  // API Gateway base path for all microservices
  API_GATEWAY_URL: import.meta.env.VITE_API_GATEWAY_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000'),

  // Base path for all RestPoint API endpoints
  API_BASE_PATH: '/api/v1/restpoint',

  // Hearse service direct URL (bypass API gateway for CORS issues)
  HEARSE_SERVICE_URL: import.meta.env.VITE_HEARSE_SERVICE_URL || 'http://localhost:5002',

  // Full API base URL (gateway + base path)
  get FULL_API_URL() {
    // In production, nginx handles the /api to /api/v1/restpoint rewrite
    // So we just need the base API_URL
    if (import.meta.env.PROD) {
      return this.API_URL;
    }
    return `${this.API_GATEWAY_URL}${this.API_BASE_PATH}`;
  },

  // Hearse API URL (direct to hearse service to avoid CORS)
  get HEARSE_API_URL() {
    if (import.meta.env.PROD) {
      return `${this.API_URL}/hearse-bookings`;
    }
    return `${this.HEARSE_SERVICE_URL}/api/v1/restpoint`;
  },

  // Timeout for API requests in milliseconds
  API_TIMEOUT: 30000,

  // WebSocket URL for real-time features (hearse service port 5002)
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002',

  // Feature flags
  FEATURES: {
    ENABLE_ANALYTICS: true,
  }
};

export default env;
