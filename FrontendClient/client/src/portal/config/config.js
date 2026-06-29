// Environment Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1/restpoint/portal';
export const APP_NAME = 'LEE Funeral Home Portal';
export const APP_DESCRIPTION = 'Providing Clarity in Difficult Times';
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
export const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
