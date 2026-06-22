// src/config/env.js
// Centralized configuration for the application environment
// ALL services import from here - single source of truth

const env = {
  // In production (nginx proxy), use relative path /api/
  // In development, use the API Gateway
  // Can be overridden with VITE_API_URL env var
  API_URL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000'),
  
  // API Gateway base path for all microservices
  API_GATEWAY_URL: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000',
  
  // Base path for all RestPoint API endpoints
  API_BASE_PATH: '/api/v1/restpoint',
  
  // Full API base URL (gateway + base path)
  get FULL_API_URL() {
    return `${this.API_GATEWAY_URL}${this.API_BASE_PATH}`;
  },
  
  // Timeout for API requests in milliseconds
  API_TIMEOUT: 30000,
  
  // Feature flags
  FEATURES: {
    ENABLE_ANALYTICS: true,
  }
};

export default env;