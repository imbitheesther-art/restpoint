import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { HelmetProvider } from 'react-helmet-async';
import AppRouter from './routes/AppRouter';
import { initManifest } from './services/manifestService';
import { SocketProvider } from './context/socketContext';
import { useAppInitialization } from './hooks/useAppInitialization';
import InstallPrompt from './components/pwa/InstallPrompt';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000,
      gcTime: 1800000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  useAppInitialization();
  const hostname = window.location.hostname;
  const isTenantSubdomain = hostname !== 'localhost' && hostname !== 'restpoint.co.ke';
  const routeElement = <QueryClientProvider client={queryClient}><SocketProvider><AppRouter /></SocketProvider></QueryClientProvider>;
  if (isTenantSubdomain) {
    const tenantSlug = hostname.split('.')[0];
    return (
      <Routes>
        <Route path="/" element={<Navigate to={`/tenant/${tenantSlug}`} replace />} />
        <Route path="*" element={routeElement} />
      </Routes>
    );
  }
  return (
    <HelmetProvider>
      {routeElement}

      <InstallPrompt />
    </HelmetProvider>
  );
};

const App = () => {
  useEffect(() => { initManifest(); }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service_worker.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration.scope);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
