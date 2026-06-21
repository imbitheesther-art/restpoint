import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './modules/landing/LandingPage';
import OnboardingFlow from './modules/onboarding/OnboardingFlow';
import LoginPage from './components/auth/login';
import AppRouter from './routes/AppRouter';
import { initManifest } from './services/manifestService';

// Simple wrapper for backward compatibility
const App = () => {
  // Initialize dynamic manifest on app load
  useEffect(() => {
    initManifest();
  }, []);

  // Check if we're using subdomain routing or path-based routing
  const hostname = window.location.hostname;
  const isTenantSubdomain = hostname !== 'localhost' && 
                             hostname !== 'restpoint.co.ke' && 
                             !hostname.startsWith('www.') &&
                             !hostname.includes('127.0.0.1') &&
                             !hostname.includes('trycloudflare.com'); // Ignore cloudflare tunnels for tenant logic

  // If using subdomain routing (tenant.domain.com)
  if (isTenantSubdomain) {
    // Extract tenant slug from subdomain
    const tenantSlug = hostname.split('.')[0];
    
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={`/tenant/${tenantSlug}`} replace />} />
          <Route path="*" element={<AppRouter />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Default: clean path-based routing (/tenant/tenant-slug)
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
};

export default App;