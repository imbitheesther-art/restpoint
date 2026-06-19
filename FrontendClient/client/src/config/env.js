// src/config/env.js

// Centralized configuration for the application environment

const env = {
  // In production (nginx proxy), use relative path /api/
  // In development, use localhost:8000
  // Can be overridden with VITE_API_URL env var
  API_URL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8000'),
  
  // Timeout for API requests in milliseconds
  API_TIMEOUT: 30000,
  
  // Feature flags could go here
  FEATURES: {
    ENABLE_ANALYTICS: true,
  }
};

export default env;
