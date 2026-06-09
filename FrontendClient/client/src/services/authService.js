import api from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export const authService = {
  login: async (credentials) => {
    const response = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post(ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post(ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get(ENDPOINTS.AUTH.ME);
    return response.data;
  },

  verify: async () => {
    const response = await api.post(ENDPOINTS.AUTH.VERIFY);
    return response.data;
  },
  
  checkStatus: async () => {
    const response = await api.get(ENDPOINTS.AUTH.STATUS);
    return response.data;
  }
};

export default authService;
