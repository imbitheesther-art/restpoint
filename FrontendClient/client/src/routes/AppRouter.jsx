import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, useParams, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useTenantStore } from '../store/useTenantStore';
import { tenantApi } from '../api/tenant.api';
import ModernSidebar from '../components/layout/ModernSidebar';
import PortalRouter from '../portal/PortalRouter';

const LandingPage = lazy(() => import('../modules/landing/LandingPage'));
const OnboardingFlow = lazy(() => import('../modules/onboarding/OnboardingFlow'));
const PrivacyPolicy = lazy(() => import('../components/privacy/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../components/privacy/TermsOfService'));
const AccountDeletion = lazy(() => import('../components/privacy/AccountDeletion'));
const DataMigrationPolicy = lazy(() => import('../components/privacy/DataMigrationPolicy'));
const SecurityPolicy = lazy(() => import('../components/privacy/securityPolicy'));
const SLAPolicy = lazy(() => import('../components/privacy/slaPolicy'));
const ReleasePolicy = lazy(() => import('../components/privacy/releasePolicy'));
const TicketPage = lazy(() => import('../components/support/TicketPage'));
const WhyUsPage = lazy(() => import('../components/pages/WhyUsPage'));
const AboutPage = lazy(() => import('../components/pages/AboutPage'));
const ContactPage = lazy(() => import('../components/pages/ContactPage'));
const LoginPage = lazy(() => import('../components/auth/login'));
const PortalLoginPage = lazy(() => import('../components/auth/PortalLogin'));
const ForgotPassword = lazy(() => import('../components/auth/ForgotPassword'));
const Notifications = lazy(() => import('../components/notifications/notifications'));
const InvoiceManager = lazy(() => import('../components/invoices/invoicemanager'));
const DocumentsPage = lazy(() => import('../components/documents/documentspage'));
const DeceasedRegistrationForm = lazy(() => import('../components/deceasedinfo/registerDeceased'));
const RegisterCoffin = lazy(() => import('../components/coffins/registerCoffin'));
const CoffinInventory = lazy(() => import('../components/coffins/coffininventory'));
const AllDeceasedPage = lazy(() => import('../components/deceasedinfo/listDeceased'));
const NotFound = lazy(() => import('../components/common/NotFound'));
const DeceasedDetails = lazy(() => import('../components/deceasedprofile/deceasedDetailPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const DeceasedInfoSection = lazy(() => import('../components/deceasedinfo/deceasedInfoSection'));
const MarketplacePage = lazy(() => import('../components/marketplace/MarketplacePage'));
const UploadProduct = lazy(() => import('../components/marketplace/UploadProduct'));
const SettingsPage = lazy(() => import('../components/settings/SettingsPage'));
const ReleaseFormPage = lazy(() => import('../components/releaseform/ReleaseFormPage'));
const UserManagement = lazy(() => import('../components/user/users'));
const PublicMemorialPage = lazy(() => import('../components/memorial/PublicMemorialPage'));
const CalendarPage = lazy(() => import('../components/calender/CalendarPage'));
const EDocumentsPage = lazy(() => import('../components/edocuments/EDocumentsPage'));
const ReportGenerator = lazy(() => import('../components/reports/reportGenerator'));
const CallPage = lazy(() => import('../components/call/CallPage'));
const ChemicalsPage = lazy(() => import('../components/chemicals/chemicals'));

const RouteLoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F7F9FB' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTop: '3px solid #C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
      <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  const location = useLocation();
  if (!token || !user || token === 'undefined' || token === 'null') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tenantSlug');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
};

const DashboardLayout = ({ children, tenantData }) => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('tenantSlug');
    navigate('/login');
  };
  const handleSidebarToggle = (isOpen) => setSidebarOpen(isOpen);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const marginLeft = isMobile ? '0' : (sidebarOpen ? '260px' : '56px');
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F9FB' }}>
      <ModernSidebar tenantData={tenantData} userData={{ name: user?.full_name || user?.name, role: user?.role || 'Administrator' }} onLogout={handleLogout} onToggle={handleSidebarToggle} />
      <main style={{ flex: 1, marginLeft, padding: '2rem', minHeight: '100vh', background: '#F7F9FB', transition: 'margin-left 0.3s ease' }}>
        <Suspense fallback={<RouteLoadingFallback />}>{children}</Suspense>
      </main>
    </div>
  );
};

const TenantDashboardHome = () => {
  const { tenantData } = useTenantStore();
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1a1a1a' }}>Welcome back, {tenantData?.name || 'User'}!</h1>
      <p style={{ color: '#6B7280', marginBottom: '2rem', fontSize: '0.9rem' }}>Here's what's happening with your operations today.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Active Cases</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1a1a1a' }}>24</p>
        </div>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Pending Bill</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1a1a1a' }}>KES 12,500</p>
        </div>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>New Registrations</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1a1a1a' }}>7</p>
        </div>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>This Month</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1a1a1a' }}>42</p>
        </div>
      </div>
    </div>
  );
};

const TenantResolver = () => {
  const { slug } = useParams();
  const { setTenantData, setLoading, error, setError, tenantData } = useTenantStore();
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();
  const cacheKey = `tenant_cache_${slug}`;

  useEffect(() => {
    let cancelled = false;
    const fetchTenant = async () => {
      const memoryCache = (window.__tenantCache ||= {});
      const cached = memoryCache[cacheKey];
      if (cached && Date.now() - cached.timestamp < 300000) {
        if (!cancelled) {
          setTenantData(cached.data);
          document.documentElement.style.setProperty('--tenant-primary', cached.data.primaryColor || '#2b5a82');
          document.title = `${cached.data.name || slug} | REST POINT`;
        }
        return;
      }
      try {
        const data = await tenantApi.getBranding(slug);
        if (!cancelled) {
          const safeData = data || {};
          memoryCache[cacheKey] = { data: safeData, timestamp: Date.now() };
          setTenantData(safeData);
          document.documentElement.style.setProperty('--tenant-primary', safeData.primaryColor || '#2b5a82');
          document.title = `${safeData.name || slug} | REST POINT`;
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Tenant fetch error:', err);
          setError('Tenant not found: ' + err.message);
          navigate('/login', { replace: true });
        }
      }
    };
    if (slug && token) { fetchTenant(); } else if (!token) { navigate('/login', { replace: true }); }
    return () => { cancelled = true; };
  }, [slug, setTenantData, setError, token, navigate, cacheKey]);

  if (!token || token === 'undefined' || token === 'null') {
    return <Navigate to="/login" replace />;
  }
  return <TenantDashboardRoutes tenantData={tenantData || {}} />;
};

const TenantDashboardRoutes = ({ tenantData }) => {
  const { slug } = useParams();
  return (
    <Routes>
      <Route path="/" element={<Navigate to="all-deceased" replace />} />
      <Route path="/dashboard" element={<DashboardLayout tenantData={tenantData}><DashboardPage /></DashboardLayout>} />
      <Route path="all-deceased" element={<DashboardLayout tenantData={tenantData}><AllDeceasedPage /></DashboardLayout>} />
      <Route path="deceased" element={<DashboardLayout tenantData={tenantData}><AllDeceasedPage /></DashboardLayout>} />
      <Route path="deceased/register" element={<DashboardLayout tenantData={tenantData}><DeceasedRegistrationForm /></DashboardLayout>} />
      <Route path="deceased/:id" element={<DashboardLayout tenantData={tenantData}><DeceasedDetails /></DashboardLayout>} />
      <Route path="deceased-details/:id" element={<DashboardLayout tenantData={tenantData}><DeceasedDetails /></DashboardLayout>} />
      <Route path="coffins" element={<DashboardLayout tenantData={tenantData}><CoffinInventory /></DashboardLayout>} />
      <Route path="coffins/register" element={<DashboardLayout tenantData={tenantData}><RegisterCoffin /></DashboardLayout>} />
      <Route path="documents" element={<DashboardLayout tenantData={tenantData}><DocumentsPage /></DashboardLayout>} />
      <Route path="invoices" element={<DashboardLayout tenantData={tenantData}><InvoiceManager /></DashboardLayout>} />
      <Route path="calendar" element={<DashboardLayout tenantData={tenantData}><CalendarPage /></DashboardLayout>} />
      <Route path="edocuments" element={<DashboardLayout tenantData={tenantData}><EDocumentsPage /></DashboardLayout>} />
      <Route path="reports" element={<DashboardLayout tenantData={tenantData}><ReportGenerator /></DashboardLayout>} />
      <Route path="chemicals" element={<DashboardLayout tenantData={tenantData}><ChemicalsPage /></DashboardLayout>} />
      <Route path="notifications" element={<DashboardLayout tenantData={tenantData}><Notifications /></DashboardLayout>} />
      <Route path="marketplace" element={<DashboardLayout tenantData={tenantData}><MarketplacePage /></DashboardLayout>} />
      <Route path="marketplace/upload" element={<DashboardLayout tenantData={tenantData}><UploadProduct /></DashboardLayout>} />
      <Route path="settings" element={<DashboardLayout tenantData={tenantData}><SettingsPage /></DashboardLayout>} />
      <Route path="release-form/:id" element={<DashboardLayout tenantData={tenantData}><ReleaseFormPage /></DashboardLayout>} />
      <Route path="memorial/:deceasedId" element={<DashboardLayout tenantData={tenantData}><PublicMemorialPage /></DashboardLayout>} />
      <Route path="memorial/:deceasedId/:token" element={<DashboardLayout tenantData={tenantData}><PublicMemorialPage /></DashboardLayout>} />
      <Route path="users" element={<DashboardLayout tenantData={tenantData}><UserManagement /></DashboardLayout>} />
      <Route path="call" element={<DashboardLayout tenantData={tenantData}><CallPage /></DashboardLayout>} />
      <Route path="hearse" element={<DashboardLayout tenantData={tenantData}><div style={{ padding: '2rem', textAlign: 'center' }}><h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Hearse Management</h1><p style={{ color: '#6B7280', marginTop: '0.5rem' }}>Hearse management module coming soon.</p></div></DashboardLayout>} />
      <Route path="*" element={<DashboardLayout tenantData={tenantData}><NotFound /></DashboardLayout>} />
    </Routes>
  );
};

const DashboardRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;
  useEffect(() => {
    const tenantSlug = localStorage.getItem('tenantSlug');
    const userStr = localStorage.getItem('user');
    let userSlug = '';
    if (userStr) { try { const user = JSON.parse(userStr); userSlug = user.organization?.slug || user.tenantSlug || user.tenant?.slug; } catch (e) { console.error('Error parsing user', e); } }
    const finalSlug = tenantSlug || userSlug || 'default';
    if (from && from !== '/login' && from !== '/') { navigate(`/tenant/${finalSlug}${from}`, { replace: true }); } else { navigate(`/tenant/${finalSlug}/all-deceased`, { replace: true }); }
  }, [navigate, location]);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#6B7280' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTop: '3px solid #C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p>Loading dashboard...</p>
      </div>
    </div>
  );
};

const AppRouter = () => (
  <Suspense fallback={<RouteLoadingFallback />}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<OnboardingFlow />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/portal" element={<Navigate to="/portal/login" replace />} />
      <Route path="/portal/login" element={<PortalLoginPage />} />
      <Route path="/portal/*" element={<PortalRouter />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/account-deletion" element={<AccountDeletion />} />
      <Route path="/data-migration" element={<DataMigrationPolicy />} />
      <Route path="/security" element={<SecurityPolicy />} />
      <Route path="/sla" element={<SLAPolicy />} />
      <Route path="/releases" element={<ReleasePolicy />} />
      <Route path="/why-us" element={<WhyUsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/support" element={<TicketPage />} />
      <Route path="/support/:slug" element={<TicketPage />} />
      <Route path="/dashboard/*" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
      <Route path="/tenant/:slug/*" element={<ProtectedRoute><TenantResolver /></ProtectedRoute>} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  </Suspense>
);

export default AppRouter;

