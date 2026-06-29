// API Service for Portal Backend Communication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1/restpoint/portal';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const session_token = localStorage.getItem('session_token');
  return {
    'Content-Type': 'application/json',
    ...(session_token && { 'Authorization': `Bearer ${session_token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }
  return data;
};

// Login API
export const loginAPI = async (identifier) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier })
  });
  return handleResponse(response);
};

// Get Dashboard Data - Family specific
export const getDashboardData = async () => {
  const deceasedId = localStorage.getItem('deceased_id');
  if (!deceasedId) throw new Error('No deceased ID found');
  
  const response = await fetch(`${API_BASE_URL}/dashboard/${deceasedId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Get Billing Information
export const getBillingData = async () => {
  const deceasedId = localStorage.getItem('deceased_id');
  if (!deceasedId) throw new Error('No deceased ID found');
  
  const response = await fetch(`${API_BASE_URL}/billing/${deceasedId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Get Family Profile
export const getProfileData = async () => {
  const deceasedId = localStorage.getItem('deceased_id');
  if (!deceasedId) throw new Error('No deceased ID found');
  
  const response = await fetch(`${API_BASE_URL}/profile/${deceasedId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Update Profile
export const updateProfileData = async (profileData) => {
  const deceasedId = localStorage.getItem('deceased_id');
  if (!deceasedId) throw new Error('No deceased ID found');
  
  const response = await fetch(`${API_BASE_URL}/profile/${deceasedId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
  return handleResponse(response);
};

// Get Documents
export const getDocuments = async () => {
  const deceasedId = localStorage.getItem('deceased_id');
  if (!deceasedId) throw new Error('No deceased ID found');
  
  const response = await fetch(`${API_BASE_URL}/documents/${deceasedId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Upload Document
export const uploadDocument = async (file, documentType) => {
  const deceasedId = localStorage.getItem('deceased_id');
  if (!deceasedId) throw new Error('No deceased ID found');
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);
  
  const response = await fetch(`${API_BASE_URL}/documents/${deceasedId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('session_token')}`
    },
    body: formData
  });
  return handleResponse(response);
};

// Get Payment History
export const getPaymentHistory = async () => {
  const deceasedId = localStorage.getItem('deceased_id');
  if (!deceasedId) throw new Error('No deceased ID found');
  
  const response = await fetch(`${API_BASE_URL}/payments/${deceasedId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Create Payment
export const createPayment = async (paymentData) => {
  const deceasedId = localStorage.getItem('deceased_id');
  if (!deceasedId) throw new Error('No deceased ID found');
  
  const response = await fetch(`${API_BASE_URL}/payments/${deceasedId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(paymentData)
  });
  return handleResponse(response);
};

// Get Marketplace Products
export const getMarketplaceProducts = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.search) queryParams.append('search', filters.search);
  
  const response = await fetch(`${API_BASE_URL}/marketplace/products?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Add to Cart
export const addToCart = async (productId, quantity = 1) => {
  const deceasedId = localStorage.getItem('deceased_id');
  if (!deceasedId) throw new Error('No deceased ID found');
  
  const response = await fetch(`${API_BASE_URL}/cart/${deceasedId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ product_id: productId, quantity })
  });
  return handleResponse(response);
};

// Get Cart
export const getCart = async () => {
  const deceasedId = localStorage.getItem('deceased_id');
  if (!deceasedId) throw new Error('No deceased ID found');
  
  const response = await fetch(`${API_BASE_URL}/cart/${deceasedId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Remove from Cart
export const removeFromCart = async (cartItemId) => {
  const deceasedId = localStorage.getItem('deceased_id');
  if (!deceasedId) throw new Error('No deceased ID found');
  
  const response = await fetch(`${API_BASE_URL}/cart/${deceasedId}/${cartItemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Verify Token
export const verifyToken = async () => {
  const session_token = localStorage.getItem('session_token');
  const deceasedId = localStorage.getItem('deceased_id');
  
  if (!session_token || !deceasedId) {
    return { valid: false };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/verify-token`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ deceased_id: deceasedId })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Logout
export const logoutAPI = async () => {
  const deceasedId = localStorage.getItem('deceased_id');
  
  try {
    if (deceasedId) {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ deceased_id: deceasedId })
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export default {
  loginAPI,
  getDashboardData,
  getBillingData,
  getProfileData,
  updateProfileData,
  getDocuments,
  uploadDocument,
  getPaymentHistory,
  createPayment,
  getMarketplaceProducts,
  addToCart,
  getCart,
  removeFromCart,
  verifyToken,
  logoutAPI
};
