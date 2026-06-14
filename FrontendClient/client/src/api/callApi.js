import axios from 'axios';
import { ENDPOINTS } from './endpoints';
import { io } from 'socket.io-client';

// Call service runs on its own port (8120), NOT through the API Gateway
const CALL_SERVICE_URL = import.meta.env.VITE_CALL_SERVICE_URL || 'http://localhost:8120';

// Dedicated axios instance for the call service
const callApiClient = axios.create({
  baseURL: CALL_SERVICE_URL,
  timeout: 10000,
});

// Helper to get auth headers from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  const slug = localStorage.getItem('tenantSlug');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (slug) {
    headers['x-tenant-slug'] = slug;
  }
  return headers;
};

// Get or create a call room for a tenant/mortuary
export const getTenantCallRoom = async (tenantSlug) => {
  const headers = getAuthHeaders();
  const response = await callApiClient.get(ENDPOINTS.CALL.ROOM(tenantSlug), { headers });
  return response.data;
};

// List all active call rooms (admin)
export const listActiveCallRooms = async () => {
  const headers = getAuthHeaders();
  const response = await callApiClient.get(ENDPOINTS.CALL.ROOMS, { headers });
  return response.data;
};

// Initiate a call to another tenant (cross-mortuary)
export const callTenant = async (targetTenantSlug, callerTenantSlug) => {
  const headers = getAuthHeaders();
  const response = await callApiClient.post(ENDPOINTS.CALL.CALL_TENANT, 
    { targetTenantSlug, callerTenantSlug }, 
    { headers }
  );
  return response.data;
};

// Create a WebSocket connection for the call room
export const createCallSocket = (tenantSlug, userId, userName, token) => {
  const socket = io(CALL_SERVICE_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[CallSocket] Connected to call service');
    
    // Join the tenant's call room
    socket.emit('join-call-room', {
      tenantSlug,
      userId,
      userName,
      token,
    });
  });

  socket.on('connect_error', (error) => {
    console.error('[CallSocket] Connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[CallSocket] Disconnected:', reason);
  });

  socket.on('error-message', (data) => {
    console.error('[CallSocket] Server error:', data.message);
  });

  return socket;
};

export default callApiClient;
