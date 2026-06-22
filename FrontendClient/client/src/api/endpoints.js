// Centralized API Endpoints Configuration
// All microservice endpoints are defined here
// Import env for base URL configuration

import env from '../config/env';

// Helper to build full API URLs
export const buildUrl = (service, path = '') => {
  return `${env.FULL_API_URL}/${service}${path}`;
};

// Helper to get tenant headers for multi-tenant isolation
export const getTenantHeaders = () => {
  const headers = {};
  try {
    const tenantSlug = localStorage.getItem('tenantSlug') || sessionStorage.getItem('tenantSlug');
    const tenantId = localStorage.getItem('tenantId') || sessionStorage.getItem('tenantId');
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    
    if (tenantSlug) headers['x-tenant-slug'] = tenantSlug;
    if (tenantId) headers['x-tenant-id'] = tenantId;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch (e) {
    // localStorage not available
  }
  return headers;
};

// All service endpoint definitions
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  TENANT: {
    BASE: '/tenant',
    ONBOARDING: '/tenant/onboarding',
    ORGANIZATION: '/tenant/onboarding/organization',
    BRANCHES: '/tenant/branches',
  },
  MARKETPLACE: {
    PRODUCTS: '/marketplace/products',
    CATEGORIES: '/marketplace/categories',
    CART: '/marketplace/cart',
    ORDERS: '/marketplace/orders',
    UPLOAD: '/marketplace/upload',
  },
  DECEASED: {
    BASE: '/deceased',
    CREATE: '/deceased/create',
    POSTMORTEM: '/deceased/postmortem',
    COFFIN: '/deceased/coffin',
  },
  MPESA: {
    STKPUSH: '/mpesa/stkpush',
    PAYMENT: '/mpesa/payment',
    CALLBACK: '/mpesa/callback',
  },
  INVOICE: {
    BASE: '/invoices',
    GENERATE: '/invoices/generate',
    PAYMENTS: '/invoices/payments',
  },
  COFFIN: {
    BASE: '/coffins',
    ASSIGN: '/coffins/assign',
    USAGE: '/coffins/usage',
  },
  BILLING: {
    BASE: '/billing',
    CHARGES: '/billing/charges',
    PAYMENTS: '/billing/payments',
  },
  DOCUMENTS: {
    BASE: '/documents',
    UPLOAD: '/documents/upload',
  },
  NOTIFICATION: {
    BASE: '/notification',
    SEND: '/notification/send',
  },
  ANALYTICS: {
    BASE: '/analytics',
    DASHBOARD: '/analytics/dashboard',
    PERFORMANCE: '/analytics/performance',
  },
  VISITORS: {
    BASE: '/visitors',
    LOG: '/visitors/log',
  },
  CALENDAR: {
    BASE: '/calendar',
    EVENTS: '/calendar/events',
  },
  PORTAL: {
    BASE: '/portal',
    MEMORIAL: '/portal/memorial',
    CONDOLENCES: '/portal/condolences',
  },
  QRCODE: {
    BASE: '/qrcode',
    GENERATE: '/qrcode/generate',
  },
  BODYCHECKOUT: {
    BASE: '/bodycheckout',
    CHECKOUT: '/bodycheckout/checkout',
  },
  EDOCUMENTS: {
    BASE: '/edocuments',
    DOCUMENTS: '/edocuments/documents',
  },
  CHEMICAL: {
    BASE: '/chemicals',
    INVENTORY: '/chemicals/inventory',
  },
  EXTRA: {
    BASE: '/extra',
    SERVICES: '/extra/services',
  },
  CALL: {
    BASE: '/call',
    LOGS: '/call/logs',
  },
  SOCKETIO: {
    BASE: '/socketio',
    CONNECT: '/socket.io',
  },
};

export default ENDPOINTS;