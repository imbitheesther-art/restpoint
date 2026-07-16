import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

/**
 * Read user state from storage synchronously.
 * Checks both localStorage and sessionStorage for cross-compatibility.
 */
const restoreUserFromStorage = () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (token && token !== 'undefined' && token !== 'null' && userData) {
        try {
            const parsedUser = JSON.parse(userData);
            return {
                token,
                isAuthenticated: true,
                ...parsedUser
            };
        } catch (error) {
            // Invalid stored data
        }
    }
    return null;
};

export const AuthProvider = ({ children }) => {
    // Initialize state synchronously from storage so ProtectedRoute
    // sees the correct user state on first render (not deferred via useEffect)
    const [user, setUser] = useState(() => restoreUserFromStorage());
    const [loading, setLoading] = useState(false);

    // Re-check storage on mount (catches cases where storage was updated
    // after initial render, e.g. by authApi.login() called from login.jsx)
    useEffect(() => {
        const restored = restoreUserFromStorage();
        if (restored && !user) {
            setUser(restored);
        }
        setLoading(false);

        // Listen for storage changes (authApi/login.jsx stores tokens directly)
        // This ensures AuthContext stays in sync when login happens outside this context
        const handleStorageChange = (event) => {
            if (event.key === 'authToken' || event.key === 'user' || event.key === null) {
                const restored = restoreUserFromStorage();
                if (restored) {
                    setUser(restored);
                } else {
                    setUser(null);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const login = useCallback(async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const data = response.data;
            if (data?.success) {
                // Backend returns: { accessToken, refreshToken, user: {...}, ... }
                const accessToken = data.accessToken || data.token;
                const refreshTokenVal = data.refreshToken;
                const userData = data.user;

                if (!accessToken) {
                    return { success: false, message: 'No token received from server' };
                }

                // Store in BOTH storages for cross-compatibility
                localStorage.setItem('authToken', accessToken);
                sessionStorage.setItem('authToken', accessToken);
                if (refreshTokenVal) {
                    localStorage.setItem('refreshToken', refreshTokenVal);
                    sessionStorage.setItem('refreshToken', refreshTokenVal);
                }
                if (userData) {
                    localStorage.setItem('user', JSON.stringify(userData));
                    sessionStorage.setItem('user', JSON.stringify(userData));
                }

                setUser({
                    token: accessToken,
                    isAuthenticated: true,
                    ...userData
                });

                // Return the full data object so login page can extract tenantSlug, user, etc.
                return data;
            }
            return { success: false, message: data?.message || 'Login failed' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            // Call logout endpoint to invalidate refresh token on server
            await api.post('/auth/logout');
        } catch (error) {
            // Continue with local logout even if server request fails
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('user');
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
