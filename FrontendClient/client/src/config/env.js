// src/config/env.js
// Centralized configuration for the application environment
// ALL services import from here - single source of truth

const env = {
  // API Gateway URL - all requests go through the gateway
  // In production (nginx proxy), use relative path /api/
  // The nginx rewrite rule will transform /api/* to /api/v1/restpoint/*
  // In development, use the API Gateway directly
  API_URL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000'),

  // API Gateway base path for all microservices
  API_GATEWAY_URL: import.meta.env.VITE_API_GATEWAY_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000'),

  // Base path for all RestPoint API endpoints (CLEAN ROUTES - NO PREFIX)
  API_BASE_PATH: '',

  // Full API base URL (gateway + base path)
  get FULL_API_URL() {
    // In production, nginx handles the /api to /api/v1/restpoint rewrite
    // So we just need the base API_URL
    if (import.meta.env.PROD) {
      return this.API_URL;
    }
    return `${this.API_GATEWAY_URL}${this.API_BASE_PATH}`;
  },

  // Timeout for API requests in milliseconds
  API_TIMEOUT: 30000,

  // Hearse service API URL (direct access for driver portal)
  HEARSE_API_URL: import.meta.env.VITE_HEARSE_API_URL || (import.meta.env.PROD ? '/api/hearse' : 'http://localhost:5002'),

  // Workshop service API URL (direct access for workshop dashboard)
  WORKSHOP_API_URL: import.meta.env.VITE_WORKSHOP_API_URL || (import.meta.env.PROD ? '/api/workshop' : 'http://localhost:6969'),

  // WebSocket URL for real-time features (socketio-service port 5018)
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5018',

  // Feature flags
  FEATURES: {
    ENABLE_ANALYTICS: true,
  }
};

export default env;
