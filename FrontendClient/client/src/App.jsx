import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRouter from './routes/AppRouter';
import { initManifest } from './services/manifestService';
import { SocketProvider } from './context/socketContext';

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

const App = () => {
  useEffect(() => { initManifest(); }, []);
  const hostname = window.location.hostname;
  const isTenantSubdomain = hostname !== 'localhost' && hostname !== 'restpoint.co.ke';
  const routeElement = <QueryClientProvider client={queryClient}><SocketProvider><AppRouter /></SocketProvider></QueryClientProvider>;
  if (isTenantSubdomain) {
    const tenantSlug = hostname.split('.')[0];
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={`/tenant/${tenantSlug}`} replace />} />
          <Route path="*" element={routeElement} />
        </Routes>
      </BrowserRouter>
    );
  }
  return (
    <BrowserRouter>
      {routeElement}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </BrowserRouter>
  );
};

export default App;
