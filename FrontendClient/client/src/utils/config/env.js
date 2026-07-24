   // src/config/env.js
// Centralized configuration for the application environment
// ALL services import from here - single source of truth

const env = {
  // API Gateway URL - all requests go through the gateway
  // FIXED: Production now includes /api/v1/restpoint prefix so requests arrive
  // with the correct path whether they go through nginx or directly to the gateway
  API_URL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://restpoint.co.ke/api/v1/restpoint' : 'http://localhost:5000'),

  // API Gateway base path for all microservices
  API_GATEWAY_URL: import.meta.env.VITE_API_GATEWAY_URL || (import.meta.env.PROD ? 'https://restpoint.co.ke' : 'http://localhost:5000'),

  // Base path for all RestPoint API endpoints
  API_BASE_PATH: import.meta.env.PROD ? '/api/v1/restpoint' : '/api/v1/restpoint',

  // Full API base URL (gateway + base path)
  get FULL_API_URL() {
    if (import.meta.env.PROD) {
      return 'https://restpoint.co.ke/api/v1/restpoint';
    }
    return `${this.API_GATEWAY_URL}${this.API_BASE_PATH}`;
  },

  // Timeout for API requests in milliseconds
  API_TIMEOUT: 30000,

  // Hearse service API URL (direct access for driver portal)
  HEARSE_API_URL: import.meta.env.VITE_HEARSE_API_URL || (import.meta.env.PROD ? 'https://restpoint.co.ke/api/v1/restpoint/hearse' : 'http://localhost:5002'),

  // Workshop service API URL (goes through API gateway for auth forwarding)
  // The gateway strips /api/v1/restpoint and routes /workshop* → workshop service
  // Final path after gateway: /workshop/materials → matches workshopRouter at /workshop
  WORKSHOP_API_URL: import.meta.env.VITE_WORKSHOP_API_URL || (import.meta.env.PROD ? 'https://restpoint.co.ke/api/v1/restpoint' : 'http://localhost:5000/api/v1/restpoint'),

  // WebSocket URL for real-time features (socketio-service port 5018)
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_SOCKETIO_URL || (import.meta.env.PROD ? 'https://restpoint.co.ke' : 'http://localhost:5018'),

  // Feature flags
  FEATURES: {
    ENABLE_ANALYTICS: true,
  }
};

export default env;