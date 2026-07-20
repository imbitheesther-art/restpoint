/**
 * Example usage of Toast and Global Auth utilities
 * This file demonstrates how to use the toast notification system
 * and global authentication utilities throughout the application
 */

import { showToast, toastEventBus } from './toast';
import { 
  getCurrentUser, 
  getUserId, 
  getUserEmail, 
  getTenantSlug,
  isAuthenticated,
  hasRole,
  isAdmin,
  useGlobalAuth 
} from './globalAuth';

// Example: Using toast notifications
export const demonstrateToastUsage = () => {
  // Success toast
  showToast.success('Operation completed successfully!');
  
  // Error toast
  showToast.error('Something went wrong!');
  
  // Warning toast
  showToast.warning('Please review before proceeding');
  
  // Info toast
  showToast.info('New updates available');
  
  // Loading toast with promise
  showToast.promise(
    fetchData(),
    {
      loading: 'Loading data...',
      success: 'Data loaded successfully!',
      error: 'Failed to load data',
    }
  );
};

// Example: Using global auth utilities
export const demonstrateAuthUsage = () => {
  // Check if user is authenticated
  if (isAuthenticated()) {
    const user = getCurrentUser();
    const userId = getUserId();
    const email = getUserEmail();
    const tenantSlug = getTenantSlug();
    
    console.log('User:', user);
    console.log('User ID:', userId);
    console.log('Email:', email);
    console.log('Tenant:', tenantSlug);
    
    // Check roles
    if (isAdmin()) {
      console.log('User is admin');
    }
    
    if (hasRole('manager')) {
      console.log('User is a manager');
    }
  }
};

// Example: Listening to toast events
export const setupToastEventListeners = () => {
  // Listen for success toasts
  const unsubscribeSuccess = toastEventBus.on('toast:success', (data) => {
    console.log('Success toast shown:', data.message);
    // You can add analytics tracking here
  });
  
  // Listen for error toasts
  const unsubscribeError = toastEventBus.on('toast:error', (data) => {
    console.log('Error toast shown:', data.message);
    // You can log errors to monitoring service here
  });
  
  // Cleanup listeners when needed
  return () => {
    unsubscribeSuccess();
    unsubscribeError();
  };
};

// Example: Using the React hook in a component
export const ExampleComponent = () => {
  // Use the global auth hook
  const authState = useGlobalAuth();
  
  const handleAction = () => {
    if (authState.isAuthenticated) {
      showToast.success(`Welcome back, ${authState.userEmail}!`);
    } else {
      showToast.error('Please login to continue');
    }
  };
  
  return (
    <div>
      <p>User: {authState.userEmail}</p>
      <p>Role: {authState.userRole}</p>
      <p>Tenant: {authState.tenantSlug}</p>
      <button onClick={handleAction}>Test Toast</button>
    </div>
  );
};

// Mock function for demonstration
const fetchData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: 'example' });
    }, 2000);
  });
};

export default {
  demonstrateToastUsage,
  demonstrateAuthUsage,
  setupToastEventListeners,
  ExampleComponent,
};