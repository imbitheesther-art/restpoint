// Session Management Utility

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

let sessionTimeoutId = null;
let sessionWarningId = null;
let activityTimeout = null;

// Setup session monitoring
export const setupSessionMonitoring = (onSessionExpired) => {
  // Clear any existing timers
  clearSessionMonitoring();
  
  // Reset session on user activity
  const resetSessionTimer = () => {
    clearTimeout(sessionTimeoutId);
    clearTimeout(sessionWarningId);
    
    // Warn user 5 minutes before timeout
    sessionWarningId = setTimeout(() => {
      console.warn('Session will expire soon');
      // Could show a warning modal here
    }, SESSION_TIMEOUT - 5 * 60 * 1000);
    
    // Session expires
    sessionTimeoutId = setTimeout(() => {
      onSessionExpired();
      console.log('Session expired due to inactivity');
    }, SESSION_TIMEOUT);
  };
  
  // Listen for user activity
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  
  events.forEach(event => {
    document.addEventListener(event, resetSessionTimer, true);
  });
  
  // Initial timer
  resetSessionTimer();
  
  // Return cleanup function
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, resetSessionTimer, true);
    });
    clearSessionMonitoring();
  };
};

// Clear session monitoring
export const clearSessionMonitoring = () => {
  clearTimeout(sessionTimeoutId);
  clearTimeout(sessionWarningId);
  clearTimeout(activityTimeout);
};

// Check if token is valid (check expiry)
export const isTokenValid = () => {
  const token = localStorage.getItem('session_token');
  const tokenExpiry = localStorage.getItem('token_expiry');
  
  if (!token || !tokenExpiry) {
    return false;
  }
  
  return parseInt(tokenExpiry) > Date.now();
};

// Store token with expiry
export const storeToken = (token, expiresIn = 3600) => {
  localStorage.setItem('session_token', token);
  localStorage.setItem('token_expiry', Date.now() + expiresIn * 1000);
};

// Refresh token
export const refreshToken = async (api) => {
  try {
    const result = await api.verifyToken();
    if (result.valid && result.new_token) {
      storeToken(result.new_token, result.expires_in);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// Setup automatic token refresh
export const setupTokenRefresh = (api, onRefreshFailed) => {
  const refreshInterval = setInterval(async () => {
    const isValid = await refreshToken(api);
    if (!isValid) {
      clearInterval(refreshInterval);
      onRefreshFailed();
    }
  }, TOKEN_REFRESH_INTERVAL);
  
  return () => clearInterval(refreshInterval);
};

// Get remaining session time in seconds
export const getRemainingSessionTime = () => {
  const tokenExpiry = localStorage.getItem('token_expiry');
  if (!tokenExpiry) return 0;
  
  const remaining = parseInt(tokenExpiry) - Date.now();
  return Math.max(0, Math.floor(remaining / 1000));
};

// Logout (clear session)
export const clearSession = () => {
  localStorage.removeItem('session_token');
  localStorage.removeItem('token_expiry');
  localStorage.removeItem('deceased_id');
  localStorage.removeItem('user_name');
  clearSessionMonitoring();
};

export default {
  setupSessionMonitoring,
  clearSessionMonitoring,
  isTokenValid,
  storeToken,
  refreshToken,
  setupTokenRefresh,
  getRemainingSessionTime,
  clearSession
};
