import React, { useState, useEffect, lazy, Suspense, Component, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Toast notifications disabled to prevent crashes
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import {
  QrCode,
  RefreshCw,
  ArrowLeft,
  User,
  Info,
  AlertTriangle,
  CheckCircle,
  Users,
  DollarSign,
  FileText,
  Box,
  Truck,
  Menu,
  X,
  Activity,
  LogOut,
  Settings,
  Download,
  Printer,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
  Building2,
} from 'lucide-react';
import styled, { keyframes } from 'styled-components';

// Import Scanner Component
import ScannerComponent from '../scanner/ScannerComponent';

// API Gateway URL - Centralized
const API_GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_GATEWAY_URL}/api/v1/restpoint`;

// Colors - Elegant vintage palette
const Colors = {
  ink: '#15171A',
  bone: '#FAF8F4',
  bone2: '#F3EFE6',
  brass: '#8B7355',
  brassLight: '#A98F6E',
  verdigris: '#3D4F47',
  verdigrisDark: '#2E3F37',
  verdigrisLight: '#4D6359',
  verdigrisTint: '#EBEFEF',
  line: '#E3DDD0',
  lineDark: 'rgba(250,248,244,0.14)',
  gray: '#6B6862',
  grayLight: 'rgba(250,248,244,0.62)',
  accent: '#C77B5E',
  primaryDark: '#15171A',
  primaryGradient: 'linear-gradient(135deg, #3D4F47 0%, #2E3F37 100%)',
  accentRed: '#C77B5E',
  accentRedGradient: 'linear-gradient(135deg, #C77B5E 0%, #A66B52 100%)',
  accentBlue: '#3D4F47',
  accentBlueGradient: 'linear-gradient(135deg, #3D4F47 0%, #2E3F37 100%)',
  accentPurple: '#8B7355',
  accentPurpleGradient: 'linear-gradient(135deg, #8B7355 0%, #6B5A45 100%)',
  lightGray: '#FAF8F4',
  mediumGray: '#E3DDD0',
  darkGray: '#15171A',
  chargeSetting: '#8B7355',
  chargeSettingGradient: 'linear-gradient(135deg, #8B7355 0%, #6B5A45 100%)',
  successGreen: '#4D6359',
  successGreenGradient: 'linear-gradient(135deg, #4D6359 0%, #3D4F47 100%)',
  dangerRed: '#C77B5E',
  warningYellow: '#8B7355',
  warningYellowGradient: 'linear-gradient(135deg, #8B7355 0%, #6B5A45 100%)',
  infoBlue: '#4D6359',
  infoBluGradient: 'linear-gradient(135deg, #4D6359 0%, #3D4F47 100%)',
  textMuted: '#6B6862',
  cardBg: '#FAF8F4',
  cardShadow: '0 4px 20px rgba(21, 23, 26, 0.08)',
  cardShadowHover: '0 12px 35px rgba(21, 23, 26, 0.12)',
  borderColor: '#E3DDD0',
  borderColorLight: '#F3EFE6',
};

// Keyframes animations for smooth transitions
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Styled Components
const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${Colors.lightGray} 0%, #f1f5f9 100%);
  padding: 0.75rem 0.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: ${Colors.darkGray};
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 768px) {
    padding: 0.5rem 0.375rem;
  }
`;

const ContentGrid = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;

  @media (min-width: 992px) {
    grid-template-columns: 65% 35%;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const HeaderCard = styled.div`
  background: ${Colors.primaryGradient};
  color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: ${Colors.cardShadow};
  animation: ${slideInLeft} 0.5s ease-out;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${Colors.cardShadowHover};
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  color: ${Colors.dangerRed};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.375rem;

  &:hover {
    color: ${Colors.infoBlue};
  }
`;

const Card = styled.div`
  background: ${Colors.white};
  padding: 0.75rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid ${Colors.line};
  animation: ${fadeIn} 0.6s ease-out;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    border-color: ${Colors.brass};
  }
`;

const CardTitle = styled.h4`
  font-size: 0.5625rem;
  font-weight: 700;
  margin: 0 0 0.0625rem 0;
  padding-bottom: 0.03125rem;
  border-bottom: 1px solid ${Colors.accentBlue}05;
  display: flex;
  align-items: center;
  gap: 0.15rem;
  color: ${Colors.primaryDark};
  letter-spacing: -0.2px;

  svg {
    stroke-width: 2;
    width: 9px;
    height: 9px;
    color: ${Colors.accentBlue};
  }
`;

const ClickableBadge = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background: ${(props) => props.$bgColor};
  border: none;
  cursor: pointer;
  flex: 1;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-transform: capitalize;
  letter-spacing: 0.3px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
    filter: brightness(1.1);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    stroke-width: 2.5;
    width: 12px;
    height: 12px;
  }

  @media (max-width: 640px) {
    padding: 0.5rem 0.625rem;
    font-size: 0.7rem;
  }
`;

const BadgesContainer = styled.div`
  display: flex;
  gap: 0.625rem;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 1rem;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 0.625rem;
  width: 100%;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const HeaderTopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
`;

const NameChargesContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const MobileNavButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  background: ${Colors.accentBlue};
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.375rem;
  cursor: pointer;

  &:hover {
    background: ${Colors.infoBlue};
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileNavOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, ${(props) => (props.$isOpen ? '0.5' : '0')});
  z-index: 9998;
  display: ${(props) => (props.$isOpen ? 'block' : 'none')};
  transition: background 0.3s ease;
`;

const MobileNavContainer = styled.div`
  position: fixed;
  top: 0;
  left: ${(props) => (props.$isOpen ? '0' : '-100%')};
  width: 85%;
  max-width: 300px;
  height: 100vh;
  background: ${Colors.primaryGradient};
  z-index: 9999;
  transition: left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  padding: 1rem;
  box-shadow: 2px 0 10px rgba(0,0,0,0.2);
`;

const MobileNavHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${Colors.borderColor};
  margin-bottom: 0.75rem;

  h3 {
    color: white;
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
`;

const MobileNavSection = styled.div`
  margin-bottom: 1rem;

  h4 {
    color: ${Colors.infoBlue};
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    font-weight: 600;
  }
`;

const MobileNavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 0.25rem;
  color: white;
  cursor: pointer;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  svg {
    width: 14px;
    height: 14px;
  }

  .badge {
    margin-left: auto;
    background: ${(props) => props.badgeColor || Colors.successGreen};
    color: white;
    padding: 0.125rem 0.375rem;
    border-radius: 1rem;
    font-size: 0.625rem;
    font-weight: 600;
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${Colors.borderColor};

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: ${Colors.primaryDark};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ModalButton = styled.button`
  background: none;
  border: none;
  color: ${Colors.textMuted};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: ${Colors.dangerRed};
    transform: rotate(90deg);
  }
`;

// Helper function to get tenant slug
const getTenantSlug = () => {
  return localStorage.getItem('tenantSlug') ||
    localStorage.getItem('tenant_slug') ||
    (() => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.tenantSlug || user.tenant?.slug || 'default';
      } catch {
        return 'default';
      }
    })();
};

// Create axios instance with default headers
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add tenant slug header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    const tenantSlug = getTenantSlug();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantSlug && tenantSlug !== 'default') {
      config.headers['x-tenant-slug'] = tenantSlug;
    }

    console.log('📡 API Request:', config.method, config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================================
// LAZY LOADED COMPONENTS - Organized by feature area
// ============================================================================

// Core UI Components
const Loader = lazy(() =>
  import('../../components/loader/loader').catch(() => ({
    default: () => <div>Loading...</div>,
  }))
);

// Deceased Information Components
const DeceasedInfoSection = lazy(() =>
  import('../deceasedinfo/deceasedInfoSection').catch(() => ({
    default: () => <div>Deceased Info component not available</div>,
  }))
);

// Next of Kin Components
const NextOfKinSection = lazy(() =>
  import('../next-kin/nextOfKIn').catch(() => ({
    default: () => <div>Next of Kin component not available</div>,
  }))
);

// Mortuary Operations Components
const MortuaryProgress = lazy(() =>
  import('../modals/mortuaryProgress').catch(() => ({
    default: () => <div>Progress component not available</div>,
  }))
);
const CoffinAssignment = lazy(() =>
  import('../coffins/coffinAssignment').catch(() => ({
    default: () => <div>Coffin Assignment component not available</div>,
  }))
);
const DispatchSection = lazy(() =>
  import('../dispatch/dispatchSection')
);

// Documents & Financial Components
const DocumentUpload = lazy(() =>
  import('../documents/DocumentUpload').catch(() => ({
    default: () => <div>Document Upload component not available</div>,
  }))
);

// Modal Components
const DeceasedInfoModal = lazy(() =>
  import('../modals/deceasedinfomodal').catch(() => ({
    default: () => null,
  }))
);
const NextOfKinModal = lazy(() =>
  import('../modals/nextofKinModal').catch(() => ({
    default: () => null,
  }))
);
const FinancialDetailsModal = lazy(() =>
  import('../modals/financialdetailsmodal').catch(() => ({
    default: () => null,
  }))
);
const PaymentHistoryModal = lazy(() =>
  import('../modals/paymenthistoryModals').catch(() => ({
    default: () => null,
  }))
);
const ChargeSettingsModal = lazy(() =>
  import('./ChargeSettingsModal').catch(() => ({
    default: () => null,
  }))
);

const LoadingFallback = () => (
  <div
    style={{
      padding: '0.75rem',
      color: Colors.textMuted,
      textAlign: 'center',
      fontSize: '0.875rem',
    }}
  >
    <RefreshCw size={16} className="animate-spin" style={{ marginRight: '0.25rem' }} />
    Loading...
  </div>
);

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '1rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.5rem',
          color: Colors.dangerRed,
          textAlign: 'center'
        }}>
          <AlertTriangle size={24} style={{ marginBottom: '0.5rem' }} />
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            {this.props.errorMessage || 'Something went wrong loading this component.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DeceasedDetails = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const [deceasedData, setDeceasedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coffins, setCoffins] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showDeceasedInfoModal, setShowDeceasedInfoModal] = useState(false);
  const [showNextOfKinModal, setShowNextOfKinModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [showChargeSettingsModal, setShowChargeSettingsModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const showExternalLoader = () => setShowLoader(true);
  const hideExternalLoader = () => setShowLoader(false);

  const navigateToReleaseForm = () => {
    showExternalLoader();
    setTimeout(() => {
      if (deceasedData) {
        hideExternalLoader();
        const tenantSlug = getTenantSlug();
        navigate(`/tenant/${tenantSlug}/release-form/${currentDeceasedId}`, {
          state: { deceasedData },
        });
      } else {
        hideExternalLoader();
        console.error('Unable to load deceased data');
      }
    }, 500);
  };

  const openChargeSettingsModal = () => {
    setShowChargeSettingsModal(true);
  };

  const navigateToDocuments = () => {
    const tenantSlug = getTenantSlug();
    navigate(`/tenant/${tenantSlug}/documents/${currentDeceasedId}`);
  };

  const fetchDeceasedData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/deceased/${id}`);
      console.log('📦 API Response:', response.data);

      const apiData = response.data?.data || response.data || {};

      const normalizedData = {
        ...apiData,
        deceased_id: apiData.deceased_id || apiData.id || apiData._id || id,
        full_name: apiData.full_name || 'Unknown',
        total_mortuary_charge: apiData.total_mortuary_charge || 0,
        currency: apiData.currency || 'KES',
        burial_type: apiData.burial_type || 'Burial',
        next_of_kin: apiData.next_of_kin || [],
        documents: apiData.documents || [],
        charges: apiData.charges || [],
        dispatch: apiData.dispatch || null,
        status: apiData.status || 'active',
      };

      setDeceasedData(normalizedData);
    } catch (error) {
      console.error('Error fetching deceased details:', error);
      setDeceasedData(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchCoffins = useCallback(async () => {
    try {
      const tenantSlug = getTenantSlug();
      const response = await axios.get(
        `${API_GATEWAY_URL}/api/v1/restpoint/coffins/all-coffins`,
        {
          headers: {
            'x-tenant-slug': tenantSlug,
          },
        }
      );
      setCoffins(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching coffins:', error);
      setCoffins([]);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchDeceasedData();
      fetchCoffins();
    }
  }, [id, fetchDeceasedData, fetchCoffins]);

  const handleRefresh = () => {
    fetchDeceasedData();
    fetchCoffins();
    setRefreshKey(prev => prev + 1);
  };

  const handleDocumentUploadSuccess = () => {
    fetchDeceasedData();
  };

  const handleScanComplete = (scanData) => {
    fetchDeceasedData();
  };

  const calculateAge = (dob, dod) => {
    if (!dob || !dod) return { years: 'N/A', category: 'Unknown' };
    const birthDate = new Date(dob);
    const deathDate = new Date(dod);

    let years = deathDate.getFullYear() - birthDate.getFullYear();
    const m = deathDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && deathDate.getDate() < birthDate.getDate())) years--;

    let category = 'Unknown';
    if (years < 13) category = 'Child';
    else if (years < 18) category = 'Teenager';
    else if (years < 25) category = 'Young Adult';
    else if (years < 40) category = 'Adult';
    else if (years < 60) category = 'Middle-Aged';
    else category = 'Elderly';

    return { years, category };
  };

  const getDaysInMortuary = (admissionDate) => {
    if (!admissionDate) return 0;
    const admitted = new Date(admissionDate);
    const today = new Date();
    const diffTime = today - admitted;
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const daysInMortuary = getDaysInMortuary(deceasedData?.date_admitted);
  const getDeceasedId = () => deceasedData?.deceased_id || deceasedData?.id || id;
  const currentDeceasedId = getDeceasedId();
  const ageInfo = calculateAge(deceasedData?.date_of_birth, deceasedData?.date_of_death);

  const mobileNavItems = {
    information: [
      {
        icon: <Info size={14} />,
        label: 'Deceased Info',
        action: () => setShowDeceasedInfoModal(true),
        badge: 'View',
      },
      {
        icon: <Users size={14} />,
        label: 'Next of Kin',
        action: () => setShowNextOfKinModal(true),
        badge: deceasedData?.next_of_kin?.length || 0,
      },
    ],
    actions: [
      {
        icon: <QrCode size={14} />,
        label: 'QR Code',
        action: () => navigate(`/qr-code/${currentDeceasedId}`),
        badge: 'View',
      },
      {
        icon: <DollarSign size={14} />,
        label: 'Financial',
        action: () => setShowFinancialModal(true),
        badge: 'View',
      },
      {
        icon: <FileText size={14} />,
        label: 'Documents',
        action: navigateToDocuments,
        badge: deceasedData?.documents?.length || 0,
      },
      {
        icon: <LogOut size={14} />,
        label: 'Release Form',
        action: navigateToReleaseForm,
        badge: 'New',
      },
    ],
  };

  const primaryBadges = [
    {
      text: `Status: ${deceasedData?.status || 'Active'}`,
      color: daysInMortuary > 30 ? Colors.dangerRed : Colors.successGreen,
      icon: daysInMortuary > 30 ? <AlertTriangle size={12} /> : <CheckCircle size={12} />,
      onClick: () => setShowDeceasedInfoModal(true),
    },
    {
      text: `Days: ${daysInMortuary}`,
      color: Colors.accentBlue,
      icon: <Activity size={12} />,
      onClick: () => setShowProgressModal(true),
    },
    {
      text: `Charges: ${deceasedData?.total_mortuary_charge || 0} ${deceasedData?.currency || 'KES'}`,
      color: Colors.accentBlue,
      icon: <DollarSign size={12} />,
      onClick: () => setShowFinancialModal(true),
    },
  ];

  const secondaryBadges = [
    {
      text: 'Next of Kin',
      color: Colors.accentPurple,
      icon: <Users size={12} />,
      onClick: () => setShowNextOfKinModal(true),
    },
    {
      text: 'Charge Settings',
      color: Colors.chargeSetting,
      icon: <Settings size={12} />,
      onClick: openChargeSettingsModal,
    },
    {
      text: 'Documents',
      color: Colors.warningYellow,
      icon: <FileText size={12} />,
      onClick: navigateToDocuments,
    },
    {
      text: 'Release Form',
      color: Colors.successGreen,
      icon: <LogOut size={12} />,
      onClick: navigateToReleaseForm,
    },
  ];

  if (isLoading && !showLoader) {
    return (
      <AppContainer
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <RefreshCw size={32} color={Colors.accentBlue} className="animate-spin" />
      </AppContainer>
    );
  }

  if (!deceasedData && !isLoading) {
    return (
      <AppContainer style={{ padding: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertTriangle size={48} color={Colors.dangerRed} />
          <h3 style={{ margin: '1rem 0 0.5rem' }}>Failed to load details</h3>
          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: Colors.textMuted }}>
            ID: {id}
          </p>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Go Back
          </BackButton>
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      {showLoader && (
        <Suspense fallback={null}>
          <Loader message="Loading..." />
        </Suspense>
      )}

      <MobileNavOverlay $isOpen={mobileNavOpen} onClick={() => setMobileNavOpen(false)} />
      <MobileNavContainer $isOpen={mobileNavOpen}>
        <MobileNavHeader>
          <h3>Quick Actions</h3>
          <MobileNavButton onClick={() => setMobileNavOpen(false)}>
            <X size={18} />
          </MobileNavButton>
        </MobileNavHeader>
        {Object.entries(mobileNavItems).map(([section, items]) => (
          <MobileNavSection key={section}>
            <h4>{section === 'information' ? 'Information' : 'Actions'}</h4>
            {items.map((item, index) => (
              <MobileNavItem
                key={index}
                onClick={() => {
                  item.action();
                  setMobileNavOpen(false);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && <span className="badge">{item.badge}</span>}
              </MobileNavItem>
            ))}
          </MobileNavSection>
        ))}
      </MobileNavContainer>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', gap: '0.25rem', marginBottom: '0.5rem' }}>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back
        </BackButton>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <BackButton onClick={handleRefresh}>
            <RefreshCw size={14} /> Refresh
          </BackButton>
          <MobileNavButton onClick={() => setMobileNavOpen(true)}>
            <Menu size={18} />
          </MobileNavButton>
        </div>
      </div>

      <HeaderCard>
        <HeaderTopSection>
          <NameChargesContainer>
            <h2 style={{ margin: 0, display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '1.1rem' }}>
              <User size={16} /> {deceasedData?.full_name}
            </h2>
            <div style={{ fontSize: '0.875rem' }}>
              Total: {deceasedData?.total_mortuary_charge || 0} {deceasedData?.currency || 'KES'}
            </div>
          </NameChargesContainer>
        </HeaderTopSection>

        <BadgesContainer>
          <BadgeRow>
            {primaryBadges.map((badge, index) => (
              <ClickableBadge key={index} $bgColor={badge.color} onClick={badge.onClick}>
                {badge.icon} {badge.text}
              </ClickableBadge>
            ))}
          </BadgeRow>
          <BadgeRow>
            {secondaryBadges.map((badge, index) => (
              <ClickableBadge key={index} $bgColor={badge.color} onClick={badge.onClick}>
                {badge.icon} {badge.text}
              </ClickableBadge>
            ))}
          </BadgeRow>
        </BadgesContainer>
      </HeaderCard>

      <ContentGrid>
        <MainContent>
          <Card>
            <Suspense fallback={<LoadingFallback />}>
              <DeceasedInfoSection
                key={`deceased-${refreshKey}`}
                deceasedId={currentDeceasedId}
                deceased={deceasedData}
                ageInfo={ageInfo}
                onUpdate={fetchDeceasedData}
              />
            </Suspense>
          </Card>

          <Card>
            <Suspense fallback={<LoadingFallback />}>
              <ScannerComponent
                key={`scanner-${refreshKey}`}
                deceasedId={currentDeceasedId}
                deceasedData={deceasedData}
                onScanComplete={handleScanComplete}
                onUploadSuccess={handleDocumentUploadSuccess}
              />
            </Suspense>
          </Card>

          <Card>
            <Suspense fallback={<LoadingFallback />}>
              <DocumentUpload
                key={`documents-${refreshKey}`}
                deceasedId={currentDeceasedId}
                deceasedData={deceasedData}
                onUploadSuccess={handleDocumentUploadSuccess}
              />
            </Suspense>
          </Card>
        </MainContent>

        <SidebarContent>
          <Card>
            <Suspense fallback={<LoadingFallback />}>
              <MortuaryProgress
                key={`progress-${refreshKey}`}
                daysInMortuary={daysInMortuary}
                dispatchDate={deceasedData?.dispatch_date}
                isOverdue={daysInMortuary > 30}
              />
            </Suspense>
          </Card>

          <Card>
            <Suspense fallback={<LoadingFallback />}>
              <NextOfKinSection
                key={`nextofkin-${refreshKey}`}
                deceasedId={currentDeceasedId}
                nextOfKin={deceasedData?.next_of_kin}
                onUpdate={fetchDeceasedData}
              />
            </Suspense>
          </Card>

          <Card>
            <Suspense fallback={<LoadingFallback />}>
              <CoffinAssignment
                key={`coffin-${refreshKey}`}
                deceasedId={currentDeceasedId}
                deceasedData={deceasedData}
                coffins={coffins}
                onUpdate={fetchDeceasedData}
              />
            </Suspense>
          </Card>

          <Card>
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary fallback={<div>Failed to load Dispatch component</div>}>
                <DispatchSection
                  key={`dispatch-${refreshKey}`}
                  deceasedId={currentDeceasedId}
                  dispatchData={deceasedData?.dispatch}
                  onUpdate={fetchDeceasedData}
                />
              </ErrorBoundary>
            </Suspense>
          </Card>
        </SidebarContent>
      </ContentGrid>

      {/* Modals */}
      <Suspense fallback={null}>
        {showDeceasedInfoModal && (
          <DeceasedInfoModal
            isOpen={showDeceasedInfoModal}
            onClose={() => setShowDeceasedInfoModal(false)}
            deceased={deceasedData}
            ageInfo={ageInfo}
          />
        )}
        {showNextOfKinModal && (
          <NextOfKinModal
            isOpen={showNextOfKinModal}
            onClose={() => setShowNextOfKinModal(false)}
            nextOfKin={deceasedData?.next_of_kin}
          />
        )}
        {showFinancialModal && (
          <FinancialDetailsModal
            isOpen={showFinancialModal}
            onClose={() => setShowFinancialModal(false)}
            deceasedData={deceasedData}
          />
        )}
        {showPaymentHistoryModal && (
          <PaymentHistoryModal
            isOpen={showPaymentHistoryModal}
            onClose={() => setShowPaymentHistoryModal(false)}
            deceasedData={deceasedData}
            deceasedId={currentDeceasedId}
          />
        )}
        {showChargeSettingsModal && (
          <ChargeSettingsModal
            isOpen={showChargeSettingsModal}
            onClose={() => setShowChargeSettingsModal(false)}
            deceasedId={currentDeceasedId}
            deceasedData={deceasedData}
            onUpdate={fetchDeceasedData}
          />
        )}
        {showProgressModal && (
          <ModalOverlay onClick={() => setShowProgressModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><Activity size={20} /> Mortuary Progress</h3>
                <ModalButton onClick={() => setShowProgressModal(false)}>
                  <X size={24} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <MortuaryProgress
                  key={`progress-${refreshKey}`}
                  daysInMortuary={daysInMortuary}
                  dispatchDate={deceasedData?.dispatch_date}
                  isOverdue={daysInMortuary > 30}
                />
              </Suspense>
            </ModalContent>
          </ModalOverlay>
        )}
      </Suspense>
    </AppContainer>
  );
};

export default DeceasedDetails;