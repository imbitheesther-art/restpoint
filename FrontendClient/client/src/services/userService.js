import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

export const userService = {
  getUsers: async (params = {}) => {
    const response = await api.get(ENDPOINTS.USERS.LIST, { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(ENDPOINTS.USERS.DETAIL(id));
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(ENDPOINTS.USERS.UPDATE(id), userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(ENDPOINTS.USERS.DELETE(id));
    return response.data;
  },

  registerUser: async (userData) => {
    const response = await api.post(ENDPOINTS.USERS.REGISTER, userData);
    return response.data;
  },

  getRoles: async () => {
    const response = await api.get(ENDPOINTS.USERS.ROLES);
    return response.data;
  },

  updateUserStatus: async (id, status) => {
    const response = await api.put(ENDPOINTS.USERS.STATUS(id), { status });
    return response.data;
  },

  updateUserPassword: async (id, password) => {
    const response = await api.put(ENDPOINTS.USERS.PASSWORD(id), { password });
    return response.data;
  }
};

export default userService;
