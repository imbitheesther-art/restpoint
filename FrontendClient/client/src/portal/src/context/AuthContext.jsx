import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify token on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const result = await api.verifyToken();
        if (result.valid) {
          setIsAuthenticated(true);
          setUser(result.user || {
            deceased_id: localStorage.getItem('deceased_id'),
            name: localStorage.getItem('user_name') || 'User'
          });
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('session_token');
          localStorage.removeItem('deceased_id');
          localStorage.removeItem('user_name');
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = useCallback(async (identifier) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.loginAPI(identifier);
      
      if (response.status === 'success') {
        const userData = response.deceased || response.user || {};
        
        // Store auth data
        localStorage.setItem('session_token', response.session_token);
        localStorage.setItem('deceased_id', userData.deceased_id || userData.id);
        localStorage.setItem('user_name', userData.full_name || userData.name || 'User');
        
        setUser({
          deceased_id: userData.deceased_id || userData.id,
          name: userData.full_name || userData.name,
          email: userData.email,
          phone: userData.phone,
          ...userData
        });
        
        setIsAuthenticated(true);
        return { success: true, data: response };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logoutAPI();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('session_token');
      localStorage.removeItem('deceased_id');
      localStorage.removeItem('user_name');
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
