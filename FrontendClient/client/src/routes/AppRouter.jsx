import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, useParams, Navigate, useNavigate, useLocation } from 'react-router-dom';

import { tenantApi } from '../api/tenant.api';
import { useTenantStore } from '../modules/seo/useTenantStore';
import ModernSidebar from '../components/layout/ModernSidebar';
import UserProfile from '../components/layout/userProfile';
import FooterComponent from '../components/layout/globalFooter';

import Loader from '../components/loader/loader';




const LandingPage = lazy(() => import('../modules/landing/LandingPage'));
const ChurchFuneralWelfare = lazy(() => import('../modules/landing/ChurchFuneralWelfare'));
const SACCOFuneralInsurance = lazy(() => import('../modules/landing/SACCOFuneralInsurance'));
const ChamaWelfareManagement = lazy(() => import('../modules/landing/ChamaWelfareManagement'));
const FuneralHomeSoftware = lazy(() => import('../modules/landing/FuneralHomeSoftware'));
const OnboardingFlow = lazy(() => import('../modules/onboarding/OnboardingFlow'));
const InsurancePage = lazy(() => import('../modules/insurance/insurance'));
const MemorialPage = lazy(() => import('../modules/memorial/MemorialPage'));

// SEO Pages - Topic Cluster
const MortuaryManagementSoftware = lazy(() => import('../modules/seo/MortuaryManagementSoftware'));
const FuneralHomeManagementSoftware = lazy(() => import('../modules/seo/FuneralHomeManagementSoftware'));
const HospitalMortuarySoftware = lazy(() => import('../modules/seo/HospitalMortuarySoftware'));
const HearseManagementSoftware = lazy(() => import('../modules/seo/HearseManagementSoftware'));
const MortuaryBillingSoftware = lazy(() => import('../modules/seo/MortuaryBillingSoftware'));
const PricingPage = lazy(() => import('../modules/seo/PricingPage'));

// Blog and Resource Pages
const FuneralWelfareGuide = lazy(() => import('../modules/blog/FuneralWelfareGuide'));
const BereavementManagementGuide = lazy(() => import('../modules/blog/BereavementManagementGuide'));
const MemberContributionsGuide = lazy(() => import('../modules/blog/MemberContributionsGuide'));

// Comparison Pages
const RestPointVsExcel = lazy(() => import('../modules/compare/RestPointVsExcel'));
const ManualVsDigital = lazy(() => import('../modules/compare/ManualVsDigital'));
const BestChurchSoftwareKenya = lazy(() => import('../modules/compare/BestChurchSoftwareKenya'));
const BestSACCOWelfareSoftware = lazy(() => import('../modules/compare/BestSACCOWelfareSoftware'));

// Tools and Resources
const CalculatorsPage = lazy(() => import('../modules/resources/CalculatorsPage'));
const TemplatesPage = lazy(() => import('../modules/resources/TemplatesPage'));
const GlossaryPage = lazy(() => import('../modules/resources/GlossaryPage'));
const LogsPage = lazy(() => import('../modules/resources/LogsPage'));

// Location Pages
const LocationPage = lazy(() => import('../modules/locations/LocationPage'));
const NairobiFuneralWelfare = lazy(() => import('../modules/locations/NairobiFuneralWelfare'));

const PrivacyPolicy = lazy(() => import('../modules/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../modules/pages/TermsOfService'));
const AccountDeletion = lazy(() => import('../modules/pages/AccountDeletion'));
const DataMigrationPolicy = lazy(() => import('../modules/pages/DataMigrationPolicy'));
const SecurityPolicy = lazy(() => import('../modules/pages/securityPolicy'));
const SLAPolicy = lazy(() => import('../modules/pages/slaPolicy'));
const ReleasePolicy = lazy(() => import('../modules/pages/releasePolicy'));
const CookiesPolicy = lazy(() => import('../modules/pages/CookiesPolicy'));
const SupportPage = lazy(() => import('../components/support/SupportPage'));
const AdminSupportDashboard = lazy(() => import('../components/support/AdminSupportDashboard'));
const WhyUsPage = lazy(() => import('../modules/pages/WhyUsPage'));
const AboutPage = lazy(() => import('../modules/pages/AboutPage'));
const ContactPage = lazy(() => import('../modules/pages/ContactPage'));
const WeltTallisAbout = lazy(() => import('../modules/about/WeltTallisAbout'));
const LoginPage = lazy(() => import('../components/auth/login'));
const PortalLoginPage = lazy(() => import('../components/auth/PortalLogin'));
const ForgotPassword = lazy(() => import('../components/auth/ForgotPassword'));
const ChangePassword = lazy(() => import('../components/auth/changePassword'));
const InvoiceManager = lazy(() => import('../components/invoices/invoicemanager'));
const DocumentsPage = lazy(() => import('../components/documents/documentspage'));
const DeceasedRegistrationForm = lazy(() => import('../components/deceasedinfo/registerDeceased'));
const RegisterCoffin = lazy(() => import('../components/coffins/registerCoffin'));
const CoffinInventory = lazy(() => import('../components/coffins/coffininventory'));
const CoffinDetails = lazy(() => import('../components/coffins/coffinDetails'));
const AllDeceasedPage = lazy(() => import('../components/deceasedinfo/listDeceased'));
const NotFound = lazy(() => import('../components/layout/notFound'));
const DeceasedDetails = lazy(() => import('../components/deceasedprofile/deceasedDetailPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const DeceasedInfoSection = lazy(() => import('../components/deceasedinfo/deceasedInfoSection'));

const SettingsPage = lazy(() => import('../components/settings/SettingsPage'));
const ReleaseFormPage = lazy(() => import('../components/releaseform/ReleaseFormPage'));
const UserManagement = lazy(() => import('../components/modals/users'));
const PublicMemorialPage = lazy(() => import('../components/memorial/PublicMemorialPage'));



const ChemicalManagementDashboard = lazy(() => import('../components/chemicals/chemicals'));
const WorkshopDashboard = lazy(() => import('../components/workshop/pages/WorkshopDashboard'));

const HearseBookings = lazy(() => import('../components/hearse/hearseBookings'));
const DriverPortal = lazy(() => import('../components/hearse/DriverPortal'));
const LeaveDashboard = lazy(() => import('../components/leave/Dashboard'));
const ApplyLeave = lazy(() => import('../components/leave/ApplyLeave'));


const RouteLoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F7F9FB' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTop: '3px solid #C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
      <Loader text="Loading..." size="medium" color="primary" />
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
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return false;
    }
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? saved === 'true' : true;
  });
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
  const marginLeft = isMobile ? '0' : (sidebarOpen ? '240px' : '68px');
  const contentPadding = sidebarOpen ? '2rem' : '1.5rem';
  const footerMarginLeft = isMobile ? '0' : (sidebarOpen ? '240px' : '68px');
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F9FB', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <ModernSidebar tenantData={tenantData} userData={{ name: user?.full_name || user?.name, role: user?.role || 'Administrator' }} onLogout={handleLogout} onToggle={handleSidebarToggle} />
        <main style={{ flex: 1, marginLeft, padding: contentPadding, minHeight: 'calc(100vh - 60px)', background: '#F7F9FB', transition: 'margin-left 0.3s ease, padding 0.3s ease' }}>
          {/* Top Bar with Notification Bell */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0 0 1rem 0',
            gap: '1rem',
          }}>
          </div>
          <Suspense fallback={<RouteLoadingFallback />}>{children}</Suspense>
        </main>
      </div>
      <div style={{ marginLeft: footerMarginLeft, transition: 'margin-left 0.3s ease' }}>
        <UserProfile />
        <FooterComponent />
      </div>
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
        // Get tenantSlug from localStorage for API calls
        const tenantSlug = localStorage.getItem('tenantSlug');

        // Fetch branding/config info using tenantSlug
        const data = await tenantApi.getBranding(tenantSlug || slug);

        // Fetch deployment settings (deploymentType, branchCount, etc.)
        const settingsResult = await tenantApi.getTenantSettings();
        const settings = settingsResult?.data || {};

        // Fetch branches to determine if multi-tenant
        const branchesResult = await tenantApi.getBranches();
        const branches = branchesResult?.data || branchesResult || [];
        const branchCount = Array.isArray(branches) ? branches.length : 0;

        // CRITICAL: Trust the backend's deploymentType setting from the database
        // The backend already knows if this is a multi-tenant deployment
        // Only use branch detection as a fallback if backend doesn't provide deploymentType
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        const hasBranchAssignment = user?.branchId !== null && user?.branchId !== undefined;
        const isMultiBranch = hasBranchAssignment || branchCount > 1;

        if (!cancelled) {
          // Merge branding data with deployment settings
          // Priority: 1) Backend settings, 2) Backend branding data, 3) Branch detection fallback
          const safeData = {
            ...(data || {}),
            name: data?.name || settings?.tenantName || slug,
            deploymentType: settings?.deploymentType || data?.deploymentType || (isMultiBranch ? 'multi' : 'single'),
            branchCount: branchCount,
            branches: data?.branches || branches || (branchCount > 0 ? [{ name: settings?.tenantName || slug }] : []),
            tenantName: settings?.tenantName || data?.name || slug,
            tenantSlug: settings?.tenantSlug || slug,
            country: settings?.country || data?.country,
            location: settings?.location || data?.location,
            email: settings?.email || data?.email
          };

          memoryCache[cacheKey] = { data: safeData, timestamp: Date.now() };
          setTenantData(safeData);
          document.documentElement.style.setProperty('--tenant-primary', safeData.primaryColor || '#2b5a82');
          document.title = `${safeData.name || slug} | REST POINT`;

          // Save deployment type to localStorage for sidebar to use
          if (safeData.deploymentType) {
            localStorage.setItem('deploymentType', safeData.deploymentType);
          }
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

// Role-based access control helper
const RoleBasedRoute = ({ children, allowedRoles, userRole }) => {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/tenant/default/dashboard" replace />;
  }
  return children;
};

const TenantDashboardRoutes = ({ tenantData }) => {
  const { slug } = useParams();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const userRole = user?.role || 'user';

  // Always use DashboardLayout with sidebar for all users
  const Layout = DashboardLayout;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="all-deceased" replace />} />

      {/* Dashboard - Available to all authenticated users */}
      <Route path="dashboard" element={<Layout tenantData={tenantData}><DashboardPage /></Layout>} />

      {/* Analytics - Available to all authenticated users */}
      <Route path="analytics" element={<Layout tenantData={tenantData}><DashboardPage /></Layout>} />

      {/* Deceased Management - Available to admin, manager, staff, user */}
      <Route path="all-deceased" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff', 'user']} userRole={userRole}>
          <Layout tenantData={tenantData}><AllDeceasedPage /></Layout>
        </RoleBasedRoute>
      } />
      <Route path="deceased" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff', 'user']} userRole={userRole}>
          <Layout tenantData={tenantData}><AllDeceasedPage /></Layout>
        </RoleBasedRoute>
      } />
      <Route path="deceased/register" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff']} userRole={userRole}>
          <Layout tenantData={tenantData}><DeceasedRegistrationForm /></Layout>
        </RoleBasedRoute>
      } />
      <Route path="deceased/:id" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff', 'user']} userRole={userRole}>
          <Layout tenantData={tenantData}><DeceasedDetails /></Layout>
        </RoleBasedRoute>
      } />
      <Route path="deceased-details/:id" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff', 'user']} userRole={userRole}>
          <Layout tenantData={tenantData}><DeceasedDetails /></Layout>
        </RoleBasedRoute>
      } />

      {/* Coffins - Available to admin, manager, staff */}
      <Route path="coffins" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff']} userRole={userRole}>
          <Layout tenantData={tenantData}><CoffinInventory /></Layout>
        </RoleBasedRoute>
      } />
      <Route path="coffins/register" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff']} userRole={userRole}>
          <Layout tenantData={tenantData}><RegisterCoffin /></Layout>
        </RoleBasedRoute>
      } />
      <Route path="coffins/:coffinId/details" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff']} userRole={userRole}>
          <Layout tenantData={tenantData}><CoffinDetails /></Layout>
        </RoleBasedRoute>
      } />

      {/* Documents - Available to admin, manager, staff, user */}
      <Route path="documents/:deceasedId" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff', 'user']} userRole={userRole}>
          <Layout tenantData={tenantData}><DocumentsPage /></Layout>
        </RoleBasedRoute>
      } />

      {/* Invoices - Available to admin, manager, staff */}
      <Route path="invoices" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff']} userRole={userRole}>
          <Layout tenantData={tenantData}><InvoiceManager /></Layout>
        </RoleBasedRoute>
      } />

      {/* Chemicals - Available to admin, manager, staff */}
      <Route path="chemicals" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff']} userRole={userRole}>
          <Layout tenantData={tenantData}><ChemicalManagementDashboard /></Layout>
        </RoleBasedRoute>
      } />

      {/* Workshop - Available to admin, manager, staff */}
      <Route path="workshop" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff']} userRole={userRole}>
          <Layout tenantData={tenantData}><WorkshopDashboard /></Layout>
        </RoleBasedRoute>
      } />

      {/* Settings - Available to admin and manager only */}
      <Route path="settings" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager']} userRole={userRole}>
          <Layout tenantData={tenantData}><SettingsPage /></Layout>
        </RoleBasedRoute>
      } />

      {/* Release Form - Available to admin, manager, staff */}
      <Route path="release-form/:id" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff']} userRole={userRole}>
          <Layout tenantData={tenantData}><ReleaseFormPage /></Layout>
        </RoleBasedRoute>
      } />

      {/* Memorial - Public access */}
      <Route path="memorial/:deceasedId" element={<Layout tenantData={tenantData}><PublicMemorialPage /></Layout>} />
      <Route path="memorial/:deceasedId/:token" element={<Layout tenantData={tenantData}><PublicMemorialPage /></Layout>} />

      {/* User Management - Available to admin and manager only */}
      <Route path="users" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager']} userRole={userRole}>
          <Layout tenantData={tenantData}><UserManagement /></Layout>
        </RoleBasedRoute>
      } />

      {/* Hearse - Available to admin, manager, staff */}
      <Route path="hearse" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff']} userRole={userRole}>
          <Layout tenantData={tenantData}><HearseBookings /></Layout>
        </RoleBasedRoute>
      } />

      {/* Driver Portal - Only for drivers */}
      <Route path="driver-portal" element={
        <RoleBasedRoute allowedRoles={['driver']} userRole={userRole}>
          <Layout tenantData={tenantData}><DriverPortal /></Layout>
        </RoleBasedRoute>
      } />

      {/* Leave Management - Available to all except drivers */}
      <Route path="leaves" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff', 'user']} userRole={userRole}>
          <Layout tenantData={tenantData}><LeaveDashboard /></Layout>
        </RoleBasedRoute>
      } />
      <Route path="leaves/apply" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff', 'user']} userRole={userRole}>
          <Layout tenantData={tenantData}><ApplyLeave /></Layout>
        </RoleBasedRoute>
      } />

      {/* Support - Available to all */}
      <Route path="support" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager', 'staff', 'user']} userRole={userRole}>
          <Layout tenantData={tenantData}><SupportPage /></Layout>
        </RoleBasedRoute>
      } />

      {/* Admin Support Dashboard - Available to admin and manager only */}
      <Route path="support-dashboard" element={
        <RoleBasedRoute allowedRoles={['admin', 'manager']} userRole={userRole}>
          <Layout tenantData={tenantData}><AdminSupportDashboard /></Layout>
        </RoleBasedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<Layout tenantData={tenantData}><NotFound /></Layout>} />
    </Routes>
  );
};

// System Admin Route Guard
const SystemAdminRoute = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  // Only allow systemadmin role
  if (user?.role !== 'systemadmin') {
    return <Navigate to="/tenant/default/dashboard" replace />;
  }

  // Render the system admin dashboard
  const AdminSys = lazy(() => import('../components/support/adminsys'));
  return <AdminSys />;
};

const DashboardRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};

    // Check if user is system admin - redirect to system admin dashboard
    if (user?.role === 'systemadmin') {
      navigate('/system-admin', { replace: true });
      return;
    }

    // Normal tenant flow
    const tenantSlug = localStorage.getItem('tenantSlug');
    let userTenantSlug = '';
    if (userStr) { try { const u = JSON.parse(userStr); userTenantSlug = u.tenantSlug || ''; } catch (e) { console.error('Error parsing user', e); } }
    const finalSlug = tenantSlug || userTenantSlug || 'default';
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
      <Route path="/solutions/churches" element={<ChurchFuneralWelfare />} />
      <Route path="/solutions/saccos" element={<SACCOFuneralInsurance />} />
      <Route path="/solutions/chamas" element={<ChamaWelfareManagement />} />
      <Route path="/solutions/funeral-homes" element={<FuneralHomeSoftware />} />
      <Route path="/register" element={<OnboardingFlow />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/portal" element={<Navigate to="/portal/login" replace />} />
      <Route path="/insurance" element={<InsurancePage />} />
      <Route path="/memorial" element={<MemorialPage />} />
      <Route path="/portal/login" element={<PortalLoginPage />} />

      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/security" element={<SecurityPolicy />} />
      <Route path="/account-deletion" element={<AccountDeletion />} />
      <Route path="/data-migration" element={<DataMigrationPolicy />} />
      <Route path="/security" element={<SecurityPolicy />} />
      <Route path="/sla" element={<SLAPolicy />} />
      <Route path="/releases" element={<ReleasePolicy />} />
      <Route path="/cookies" element={<CookiesPolicy />} />
      <Route path="/why-us" element={<WhyUsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/about-welt-tallis" element={<WeltTallisAbout />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/support/:slug" element={<SupportPage />} />

      {/* System Admin Dashboard - Protected route for systemadmin role */}
      <Route path="/system-admin" element={
        <ProtectedRoute>
          <SystemAdminRoute />
        </ProtectedRoute>
      } />

      // SEO Topic Cluster Routes
      <Route path="/mortuary-management-software" element={<MortuaryManagementSoftware />} />
      <Route path="/funeral-home-management-software" element={<FuneralHomeManagementSoftware />} />
      <Route path="/hospital-mortuary-software" element={<HospitalMortuarySoftware />} />
      <Route path="/hearse-management" element={<HearseManagementSoftware />} />
      <Route path="/mortuary-billing" element={<MortuaryBillingSoftware />} />
      <Route path="/pricing" element={<PricingPage />} />

      // Blog and Resource Routes
      <Route path="/blog/funeral-welfare-management" element={<FuneralWelfareGuide />} />
      <Route path="/blog/bereavement-management" element={<BereavementManagementGuide />} />
      <Route path="/blog/member-contributions" element={<MemberContributionsGuide />} />

      // Comparison Routes
      <Route path="/compare/restpoint-vs-excel" element={<RestPointVsExcel />} />
      <Route path="/compare/manual-vs-digital" element={<ManualVsDigital />} />
      <Route path="/compare/best-church-software-kenya" element={<BestChurchSoftwareKenya />} />
      <Route path="/compare/best-sacco-welfare-software" element={<BestSACCOWelfareSoftware />} />

      // Tools and Resources Routes
      <Route path="/calculators" element={<CalculatorsPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/glossary" element={<GlossaryPage />} />
      <Route path="/resources/logs" element={<LogsPage />} />

      // Location Routes
      <Route path="/locations/nairobi" element={<NairobiFuneralWelfare />} />
      <Route path="/locations/:city" element={<LocationPage />} />
      <Route path="/dashboard/*" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
      <Route path="/tenant/:slug/*" element={<ProtectedRoute><TenantResolver /></ProtectedRoute>} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  </Suspense>
);

export default AppRouter;

