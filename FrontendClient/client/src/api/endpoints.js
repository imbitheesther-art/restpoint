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
    const branchSlug = localStorage.getItem('branchSlug') || sessionStorage.getItem('branchSlug');
    const branchId = localStorage.getItem('branchId') || sessionStorage.getItem('branchId');

    if (tenantSlug) headers['x-tenant-slug'] = tenantSlug;
    if (tenantId) headers['x-tenant-id'] = tenantId;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (branchSlug) headers['x-branch-slug'] = branchSlug;
    if (branchId) headers['x-branch-id'] = branchId;
  } catch (e) {
    // localStorage not available
  }
  return headers;
};

// Helper to build branch-aware URLs for multi-tenant using database name
export const buildBranchUrl = (tenantSlug, dbName, path) => {
  if (!tenantSlug || !dbName) return path;
  return `/tenant/${tenantSlug}/${dbName}${path}`;
};

// All service endpoint definitions
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    REFRESH: '/refresh',
    LOGOUT: '/logout',
    ME: '/me',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_CODE: '/verify-code',
    RESET_PASSWORD: '/reset-password',
  },
  TENANT: {
    BASE: '/tenant',
    ONBOARDING: '/onboarding',
    ORGANIZATION: '/onboarding/organization',
    REGISTER: '/tenants/register',
    LOGIN: '/onboarding/login',
    CONFIG: (slug) => `/tenants/${slug}/config`,
    SETTINGS: (slug) => `/tenant/${slug}/settings`,
    USERS: (slug) => `/tenant/${slug}/users`,
    BRANCHES: (slug) => `/tenant/${slug}/branches`,
    CREATE_USER: (slug) => `/tenant/${slug}/users/register`,
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
    CHARGE_SETTINGS: (id) => `/deceased/charge-settings/${id}`,
    UPDATE_CHARGE_SETTINGS: (id) => `/deceased/charge-settings/${id}`,
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
    BASE: '/hearses',
    CREATE: '/hearses',
    LIST: '/hearses',
    DETAIL: (id) => `/hearses/${id}`,
    UPDATE: (id) => `/hearses/${id}`,
    DELETE: (id) => `/hearses/${id}`,
    AVAILABLE: '/hearses/available',
    CROSS_BRANCH: '/hearses/available/cross-branch',
  },
  CHEMICALS: {
    CREATE: '/chemicals/create',
    USAGE: '/chemicals/usage',
    INVENTORY: '/chemicals/inventory',
  },
  WORKSHOP: {
    BASE: '/workshop',
    ORDERS: '/workshop/orders',
    ORDER_DETAIL: (id) => `/workshop/orders/${id}`,
    MATERIALS: '/workshop/materials',
    MATERIAL_USE: '/workshop/materials/use',
    MATERIAL_INTAKE: '/workshop/materials/intake',
    MATERIAL_INTAKE_HISTORY: '/workshop/materials/intake',
    WORKERS: '/workshop/workers',
    STAGES: (orderId) => `/workshop/orders/${orderId}/stages`,
    ASSIGN_WORKER: (orderId) => `/workshop/orders/${orderId}/assign`,
    REPORTS: {
      DAILY: '/workshop/reports/daily',
      WEEKLY: '/workshop/reports/weekly',
      INVENTORY: '/workshop/reports/inventory',
      PRODUCTION: '/workshop/reports/production',
      COSTING: '/workshop/reports/costing',
    },
    WORK_ORDER: {
      PDF: (id) => `/workshop/orders/${id}/work-order/pdf`,
    },
    DESIGN: {
      SAVE: (id) => `/workshop/orders/${id}/design`,
      GET: (id) => `/workshop/orders/${id}/design`,
    },
    PRODUCTION: {
      ASSIGN_WORKER: (orderId) => `/workshop/orders/${orderId}/assign-worker`,
      USE_MATERIAL: (orderId) => `/workshop/orders/${orderId}/use-material`,
      UPDATE_STATUS: (orderId) => `/workshop/orders/${orderId}/status`,
      TODAY_COMPLETED: '/workshop/orders/today/completed',
      TIMELINE: (orderId) => `/workshop/orders/${orderId}/timeline`,
      COMPLETE_STAGE: (orderId, stageId) => `/workshop/orders/${orderId}/complete-stage/${stageId}`,
    },
  },
  LEAVE: {
    BASE: '/leaves',
    APPLY: '/leaves/apply',
    ALL: '/leaves/all',
    MY_LEAVES: '/leaves/my-leaves',
    DETAIL: (id) => `/leaves/${id}`,
    UPDATE_STATUS: (id) => `/leaves/${id}/status`,
    CANCEL: (id) => `/leaves/${id}/cancel`,
    UPLOAD_DOCUMENT: (id) => `/leaves/${id}/upload-document`,
    STATS: '/leaves/stats/overview',
    USERS_ON_LEAVE: '/leaves/users/on-leave',
  },
};

export default ENDPOINTS;