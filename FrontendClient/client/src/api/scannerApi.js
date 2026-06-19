import axios from 'axios';

// Centralized Scanner Service API Configuration
const SCANNER_API_BASE_URL = process.env.REACT_APP_SCANNER_API_URL || 'http://localhost:2024/api/v1/scanner';

// Create axios instance for scanner service
const scannerApi = axios.create({
  baseURL: SCANNER_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for tenant slug
scannerApi.interceptors.request.use(
  (config) => {
    const tenantSlug = localStorage.getItem('tenantSlug') || 
                       localStorage.getItem('tenant_slug') ||
                       (() => {
                         try {
                           const user = JSON.parse(localStorage.getItem('user') || '{}');
                           return user.tenantSlug || user.tenant?.slug || 'default';
                         } catch {
                           return 'default';
                         }
                       })();
    
    if (tenantSlug && tenantSlug !== 'default') {
      config.headers['x-tenant-slug'] = tenantSlug;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Scanner Management APIs
export const getScanners = async () => {
  const response = await scannerApi.get('/scanners');
  return response.data;
};

export const getScannerStatus = async (scannerId) => {
  const response = await scannerApi.get(`/scanners/${scannerId}/status`);
  return response.data;
};

export const initiateScan = async (scanParams) => {
  const response = await scannerApi.post(`/scanners/${scanParams.scanner_id}/scan`, {
    deceased_id: scanParams.deceased_id,
    document_type: scanParams.document_type,
    scanner_id: scanParams.scanner_id,
    format: scanParams.format || 'pdf',
    dpi: scanParams.dpi || 300,
    color_mode: scanParams.color_mode || 'color',
    pages: scanParams.pages || 1,
  });
  return response.data;
};

// Document Upload APIs
export const uploadScannedDocument = async (formData) => {
  const response = await scannerApi.post('/scans/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadMobileScan = async (scanData) => {
  const response = await scannerApi.post('/mobile/upload', scanData);
  return response.data;
};

export const processMobileScan = async (mobileData) => {
  const response = await scannerApi.post('/mobile/scan', mobileData);
  return response.data;
};

// Document Management APIs
export const getDocuments = async (deceasedId) => {
  const response = await scannerApi.get(`/documents/${deceasedId}`);
  return response.data;
};

export const downloadDocument = async (documentId) => {
  const response = await scannerApi.get(`/documents/download/${documentId}`);
  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await scannerApi.delete(`/documents/${documentId}`);
  return response.data;
};

// Health Check
export const checkHealth = async () => {
  const response = await scannerApi.get('/health');
  return response.data;
};

// WebSocket connection for real-time scan status
export const createScanWebSocket = (scanId, onMessage, onError, onClose) => {
  const wsUrl = `${SCANNER_API_BASE_URL.replace('/api/v1/scanner', '')}/api/v1/scanner/ws/scan/${scanId}`;
  const ws = new WebSocket(wsUrl);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (onMessage) onMessage(data);
  };
  
  ws.onerror = (error) => {
    if (onError) onError(error);
  };
  
  ws.onclose = () => {
    if (onClose) onClose();
  };
  
  return ws;
};

export default scannerApi;