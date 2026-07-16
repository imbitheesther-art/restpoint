import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore user from localStorage without validation
        // The API interceptor will handle token refresh automatically when needed
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser({
                    token,
                    isAuthenticated: true,
                    ...parsedUser
                });
            } catch (error) {
                // Invalid stored data, clear it
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            if (response.data?.success) {
                const { token, refreshToken, user: userData } = response.data.data || response.data;

                localStorage.setItem('authToken', token);
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }
                if (userData) {
                    localStorage.setItem('user', JSON.stringify(userData));
                }

                setUser({
                    token,
                    isAuthenticated: true,
                    ...userData
                });

                return { success: true };
            }
            return { success: false, message: response.data?.message || 'Login failed' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
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
            setUser(null);
        }
    };

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