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
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_CODE: '/auth/verify-code',
    RESET_PASSWORD: '/auth/reset-password',
  },
  TENANT: {
    BASE: '/tenant',
    ONBOARDING: '/tenant/onboarding',
    ORGANIZATION: '/tenant/onboarding/organization',
    REGISTER: '/tenants/register',
    LOGIN: '/tenant/onboarding/login',
    CONFIG: (slug) => `/tenants/${slug}/config`,
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
    CREATE: '/deceased/register-deceased',
    POSTMORTEM: '/deceased/postmortem',
    COFFIN: '/deceased/coffin',
    LIST: '/deceased/deceased-all',
    DETAIL: (id) => `/deceased/deceased-id/${id}`,
    QR: (id) => `/deceased/${id}/qrcode`,
    CHECKOUT: (id) => `/deceased/${id}/checkout`,
    NEXT_OF_KIN: (id) => `/deceased/${id}/next-of-kin`,
    DOCUMENTS: (id) => `/deceased/${id}/documents`,
    DISPATCH: (id) => `/deceased/${id}/dispatch`,
  },
  MPESA: {
    STKPUSH: '/mpesa/stkpush',
    PAYMENT: '/mpesa/payment',
    CALLBACK: '/mpesa/callback',
  },
  INVOICE: {
    BASE: '/invoices',
    LIST: '/invoices',
    ALL_DECEASED: '/invoices/all-deceased',
    DETAIL: (id) => `/invoices/${id}`,
    DECEASED_FINANCIALS: (id) => `/invoices/deceased-financials/${id}`,
    CREATE: '/invoices',
    SYSTEM_INVOICE: '/invoices/system-invoice',
    PAYMENT: '/invoices/payment',
    EXTRA_CHARGE: '/invoices/extra-charge',
    UPDATE: (id) => `/invoices/${id}`,
    DELETE: (id) => `/invoices/${id}`,
    PDF: (id) => `/invoices/${id}/download`,
  },
  COFFINS: {
    BASE: '/coffins',
    LIST: '/coffins/list',
    CREATE: '/coffins/create',
    UPDATE: (id) => `/coffins/update/${id}`,
    DELETE: (id) => `/coffins/delete/${id}`,
    DETAIL: (id) => `/coffins/detail/${id}`,
    ASSIGN: '/coffins/assign',
    ASSIGNMENTS: '/coffins/assignments',
    EXPORT: '/coffins/export',
    USAGE: '/coffins/usage',
    STOCK: (id) => `/coffins/${id}/stock`,
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
    LOGIN: '/portal/login',
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
    CREATE: '/call/create',
  },
  SOCKETIO: {
    BASE: '/socketio',
    CONNECT: '/socket.io',
  },
  PUBLIC: {
    REQUEST_ACCESS: (slug) => `/public/${slug}/request-access`,
    HEARSE_BOOK: (slug) => `/public/${slug}/hearse-book`,
  },
  USERS: {
    REGISTER: '/users/register',
  },
  SUPPORT: {
    TICKETS: '/support/tickets',
  },
  EMBALMING: {
    LIST: '/embalming',
    CREATE: '/embalming/create',
    DETAIL: (id) => `/embalming/${id}`,
  },
  HEARSE: {
    CREATE: '/hearse/create',
    DISPATCH: '/hearse/dispatch',
  },
  CHEMICALS: {
    CREATE: '/chemicals/create',
    USAGE: '/chemicals/usage',
    INVENTORY: '/chemicals/inventory',
  },
};

export default ENDPOINTS;