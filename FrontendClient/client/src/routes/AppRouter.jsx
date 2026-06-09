import React, { useEffect } from 'react';
import { Routes, Route, useParams, Navigate, useNavigate } from 'react-router-dom';
import { useTenantStore } from '../store/useTenantStore';
import { tenantApi } from '../api/tenant.api';
import LoginPage from '../components/auth/login';

import LandingPage from '../modules/landing/LandingPage';
import OnboardingFlow from '../modules/onboarding/OnboardingFlow';
import Notifications from '../components/notifications/notifications';
import InvoiceManager from '../components/invoices/invoicemanager';
import ReportGenerator from '../components/reports/reportGenarte';
import DocumentsPage from '../components/documents/documentspage';
import DeceasedRegistrationForm from '../components/deceasedinfo/registerDeceased';
import RegisterCoffin from '../components/coffins/registerCoffin';
import CoffinInventory from '../components/coffins/coffininventory';
import PerformanceDashboard from '../components/performanceDashboard/performmnce';
import AllDeceasedPage from '../components/deceasedinfo/listDeceased';

// Protected Route wrapper - checks for valid token
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  if (!token || !user || token === 'undefined' || token === 'null') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Dashboard Layout with Sidebar
const DashboardLayout = ({ children, tenantData }) => {
  const navigate = useNavigate();
  const { slug } = useParams();
  
  const menuItems = [
    { name: 'Dashboard', path: `dashboard`, icon: '📊' },
    { name: 'All Deceased', path: `all-deceased`, icon: '👤' },
    { name: 'Register Deceased', path: `deceased/register`, icon: '✚' },
    { name: 'Coffin Inventory', path: `coffins`, icon: '⚰️' },
    { name: 'Register Coffin', path: `coffins/register`, icon: '📦' },
    { name: 'Documents', path: `documents`, icon: '📄' },
    { name: 'Invoices', path: `invoices`, icon: '💰' },
    { name: 'Reports', path: `reports`, icon: '📈' },
    { name: 'Notifications', path: `notifications`, icon: '🔔' },
    { name: 'Performance', path: `performance`, icon: '🎯' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(`/t/${slug}/${path}`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F9FB' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        backgroundColor: tenantData?.primaryColor || '#1e293b',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            {tenantData?.logo ? (
              <img src={tenantData.logo} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            ) : (
              <div style={{
                width: '32px',
                height: '32px',
                background: '#C9A84C',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}>RP</div>
            )}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{tenantData?.name || 'Rest Point'}</h2>
          </div>
          <p style={{ fontSize: '0.7rem', opacity: 0.7 }}>{tenantData?.location || 'Mortuary Management'}</p>
        </div>
        
        <nav style={{ flex: 1, padding: '0 1rem' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    marginBottom: '0.25rem',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: '#EF4444',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '280px', padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
};

// Floating Search Panel Component
const FloatingSearchPanel = ({ slug }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/v1/restpoint/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      {/* Floating Search Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#C9A84C',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.5rem',
          boxShadow: '0 4px 12px rgba(201, 168, 76, 0.3)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Search Assistance"
      >
        🔍
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 1000,
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              width: '100%',
              maxWidth: '500px',
              borderRadius: '16px 16px 0 0',
              padding: '1.5rem',
              boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Search</h3>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Search deceased, invoices, documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '0.875rem',
                  marginBottom: '0.75rem',
                }}
              />
              <button
                type="submit"
                disabled={isSearching}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#C9A84C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                }}
              >
                {isSearching ? '🔄 Searching...' : '🔍 Search'}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.875rem', color: '#6C757D', marginBottom: '0.75rem' }}>
                  Results ({searchResults.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {searchResults.map((result, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#F7F9FB',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F7F9FB'}
                    >
                      <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem' }}>
                        {result.name || result.title}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#6C757D' }}>
                        {result.type || 'Unknown'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isSearching && searchQuery && searchResults.length === 0 && (
              <p style={{ textAlign: 'center', color: '#6C757D', fontSize: '0.875rem' }}>
                No results found
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Tenant Dashboard Home (Dashboard Stats)
const TenantDashboardHome = () => {
  const { tenantData } = useTenantStore();
  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Welcome back, {tenantData?.name || 'Mortuary'}!
      </h1>
      <p style={{ color: '#6C757D', marginBottom: '2rem' }}>
        Here's what's happening with your operations today.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: '#6C757D', marginBottom: '0.5rem' }}>Active Cases</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>24</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: '#6C757D', marginBottom: '0.5rem' }}>Pending Billing</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>KES 345,000</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: '#6C757D', marginBottom: '0.5rem' }}>This Month</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>42</p>
        </div>
      </div>
    </div>
  );
};

// Tenant Resolver Component
const TenantResolver = () => {
  const { slug } = useParams();
  const { setTenantData, setLoading, error, setError, tenantData, loading } = useTenantStore();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchTenant = async () => {
      setLoading(true);
      try {
        const data = await tenantApi.getBranding(slug);
        setTenantData(data);
        document.documentElement.style.setProperty('--tenant-primary', data.primaryColor);
        document.title = `${data.name} | REST POINT`;
      } catch (err) {
        console.error('Tenant fetch error:', err);
        setError('Tenant not found');
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) fetchTenant();
  }, [slug, setTenantData, setLoading, setError]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return <Navigate to="/login" replace />;
  }

  if (!token || token === 'undefined' || token === 'null') {
    return <Navigate to="/login" replace />;
  }

  return <TenantDashboardRoutes tenantData={tenantData} />;
};

// Tenant Dashboard Routes
const TenantDashboardRoutes = ({ tenantData }) => {
  const { slug } = useParams();
  
  return (
    <>
      {/* Floating Search Panel */}
      <FloatingSearchPanel slug={slug} />
      
      <Routes>
        {/* Default route - redirect to deceased (all deceased records) */}
        <Route path="/" element={<Navigate to="all-deceased" replace />} />
        
        {/* Dashboard - can be accessed at /dashboard */}
        <Route path="dashboard" element={
          <DashboardLayout tenantData={tenantData}>
            <TenantDashboardHome />
          </DashboardLayout>
        } />
        
        {/* Deceased Records - Now the main/default page */}
        <Route path="all-deceased" element={
          <DashboardLayout tenantData={tenantData}>
            <AllDeceasedPage />
          </DashboardLayout>
        } />
        
        <Route path="deceased" element={
          <DashboardLayout tenantData={tenantData}>
            <AllDeceasedPage />
          </DashboardLayout>
        } />
        
        <Route path="deceased/register" element={
          <DashboardLayout tenantData={tenantData}>
            <DeceasedRegistrationForm />
          </DashboardLayout>
        } />
        
        <Route path="coffins" element={
          <DashboardLayout tenantData={tenantData}>
            <CoffinInventory />
          </DashboardLayout>
        } />
        
        <Route path="coffins/register" element={
          <DashboardLayout tenantData={tenantData}>
            <RegisterCoffin />
          </DashboardLayout>
        } />
        
        <Route path="documents" element={
          <DashboardLayout tenantData={tenantData}>
            <DocumentsPage />
          </DashboardLayout>
        } />
        
        <Route path="invoices" element={
          <DashboardLayout tenantData={tenantData}>
            <InvoiceManager />
          </DashboardLayout>
        } />
        
        <Route path="reports" element={
          <DashboardLayout tenantData={tenantData}>
            <ReportGenerator />
          </DashboardLayout>
        } />
        
        <Route path="notifications" element={
          <DashboardLayout tenantData={tenantData}>
            <Notifications />
          </DashboardLayout>
        } />
        
        <Route path="performance" element={
          <DashboardLayout tenantData={tenantData}>
            <PerformanceDashboard />
          </DashboardLayout>
        } />
        
        <Route path="*" element={<Navigate to={`/t/${slug}/all-deceased`} replace />} />
      </Routes>
    </>
  );
};

// Main App Router
const AppRouter = () => {
  const token = localStorage.getItem('authToken');
  const isAuthenticated = token && token !== 'undefined' && token !== 'null';

  console.log('🔐 Auth state:', { isAuthenticated, hasToken: !!token, path: window.location.pathname });

  return (
    <Routes>
      {/* Public Routes - No authentication needed */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<OnboardingFlow />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes - Require authentication */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <DashboardRedirect />
        </ProtectedRoute>
      } />
      
      {/* Tenant Routes - Require authentication */}
      <Route path="/t/:slug/*" element={
        <ProtectedRoute>
          <TenantResolver />
        </ProtectedRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Dashboard Redirect after login
const DashboardRedirect = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const tenantSlugFromStorage = localStorage.getItem('tenantSlug');
  
  useEffect(() => {
    // Get tenant slug - prefer from storage (set by login API), then from user object
    const tenantSlug = tenantSlugFromStorage || user.organization?.slug || user.tenantSlug || user.tenant?.slug || 'default';
    console.log('📍 Redirecting to tenant:', tenantSlug);
    // Redirect to all-deceased page (now the default)
    navigate(`/t/${tenantSlug}/all-deceased`, { replace: true });
  }, [navigate, user, tenantSlugFromStorage]);
  
  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#6C757D' }}>
    🔄 Loading dashboard...
  </div>;
};

export default AppRouter;