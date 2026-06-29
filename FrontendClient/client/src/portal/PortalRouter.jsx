import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Wraps the family portal app so /portal/* routes render it
// with its own tab-based navigation (dashboard, billing, docs, etc.)
const PortalAppWithAuth = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

const PortalRouter = () => (
  <Routes>
    <Route path="/" element={<Navigate to="login" replace />} />
    <Route path="/login" element={<PortalAppWithAuth />} />
    <Route path="/dashboard" element={<PortalAppWithAuth />} />
    <Route path="/billing" element={<PortalAppWithAuth />} />
    <Route path="/documents" element={<PortalAppWithAuth />} />
    <Route path="/profile" element={<PortalAppWithAuth />} />
    <Route path="/services" element={<PortalAppWithAuth />} />
    <Route path="/marketplace" element={<PortalAppWithAuth />} />
    <Route path="/payments" element={<PortalAppWithAuth />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default PortalRouter;
