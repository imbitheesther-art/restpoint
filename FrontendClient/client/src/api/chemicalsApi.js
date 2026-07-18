/**
 * Chemical Management API Service
 * Handles all chemical-related API calls with tenant/branch context
 * Uses centralized API config for consistent routing
 */

import env from '../utils/config/env';

const API_BASE = `${env.FULL_API_URL}/chemicals`;

const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        const tenantSlug = localStorage.getItem('tenantSlug') || sessionStorage.getItem('tenantSlug');
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const branchId = localStorage.getItem('branch_id');

        if (tenantSlug) headers['x-tenant-slug'] = tenantSlug;
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (branchId) headers['x-branch-id'] = branchId;
    } catch (e) {
        // localStorage not available
    }

    return headers;
};

const handleResponse = async (response) => {
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'API request failed');
    }
    return result;
};

// ============================================
// CHEMICAL INVENTORY
// ============================================

export const fetchChemicals = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}?${query}` : API_BASE;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
};

export const fetchChemicalById = async (id) => {
    const response = await fetch(`${API_BASE}/${id}`, { headers: getHeaders() });
    return handleResponse(response);
};

export const createChemical = async (data) => {
    const response = await fetch(API_BASE, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const updateChemical = async (id, data) => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const deleteChemical = async (id) => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    return handleResponse(response);
};

// ============================================
// STOCK OPERATIONS
// ============================================

export const receiveStock = async (id, quantity, notes = '') => {
    const response = await fetch(`${API_BASE}/${id}/receive`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ quantity, notes }),
    });
    return handleResponse(response);
};

export const adjustStock = async (id, new_quantity, reason = '') => {
    const response = await fetch(`${API_BASE}/${id}/adjust`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ new_quantity, reason }),
    });
    return handleResponse(response);
};

export const fetchTransactions = async (id) => {
    const response = await fetch(`${API_BASE}/${id}/transactions`, { headers: getHeaders() });
    return handleResponse(response);
};

// ============================================
// USAGE TRACKING
// ============================================

export const recordUsage = async (data) => {
    const response = await fetch(`${API_BASE}/usage`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const fetchUsageByDeceased = async (deceasedId) => {
    const response = await fetch(`${API_BASE}/usage/deceased/${deceasedId}`, { headers: getHeaders() });
    return handleResponse(response);
};

export const fetchUsageReport = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/usage/report?${query}` : `${API_BASE}/usage/report`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
};

// ============================================
// BRANCH-SPECIFIC
// ============================================

export const fetchBranchUsage = async (branchId) => {
    const response = await fetch(`${API_BASE}/usage/branch/${branchId}`, { headers: getHeaders() });
    return handleResponse(response);
};

export const fetchChemicalAnalytics = async (branchId) => {
    const url = branchId ? `${API_BASE}/analytics/${branchId}` : `${API_BASE}/analytics`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
};

export const fetchDashboardSummary = async (branchId) => {
    const url = branchId ? `${API_BASE}/dashboard/summary/${branchId}` : `${API_BASE}/dashboard/summary`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
};

// ============================================
// LOW STOCK ALERTS
// ============================================

export const fetchLowStockAlerts = async () => {
    const response = await fetch(`${API_BASE}/alerts/low-stock`, { headers: getHeaders() });
    return handleResponse(response);
};

// ============================================
// PPE REQUESTS
// ============================================

export const createPPERequest = async (data) => {
    const response = await fetch(`${API_BASE}/ppe-requests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const fetchPPERequests = async (branchId) => {
    const url = branchId ? `${API_BASE}/ppe-requests/${branchId}` : `${API_BASE}/ppe-requests`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
};

export const updatePPERequest = async (id, data) => {
    const response = await fetch(`${API_BASE}/ppe-requests/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

// ============================================
// CHEMICAL TRANSFERS (between branches)
// ============================================

export const createTransfer = async (data) => {
    const response = await fetch(`${API_BASE}/transfers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const fetchTransfers = async (branchId) => {
    const url = branchId ? `${API_BASE}/transfers/${branchId}` : `${API_BASE}/transfers`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
};

export const approveTransfer = async (id, status) => {
    const response = await fetch(`${API_BASE}/transfers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
    });
    return handleResponse(response);
};