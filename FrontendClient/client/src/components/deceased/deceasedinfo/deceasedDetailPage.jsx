import React, { useState, useEffect, lazy, Suspense, Component, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import styled, { keyframes } from 'styled-components';

import ScannerComponent from '../../scanner/ScannerComponent';

const API_GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_GATEWAY_URL}/api/v1/restpoint`;

// Professional color scheme inspired by Bootstrap/POS
const COLORS = {
  primary: '#1a5f7a',
  primaryLight: '#2c8ac9',
  primaryDark: '#134b5f',
  white: '#FFFFFF',
  bg: '#f5f7fa',
  surface: '#ffffff',
  border: '#d1d5db',
  borderLight: '#e5e7eb',
  text: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  success: '#10b981',
  successLight: '#d1fae5',
  successDark: '#059669',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningDark: '#d97706',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  dangerDark: '#dc2626',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  infoDark: '#2563eb',
  accent: '#3b82f6',
  accentHover: '#2563eb',
  accentGlow: 'rgba(59, 130, 246, 0.1)',
  radius: '8px',
  radiusSm: '6px',
  radiusXs: '4px',
  shadowSm: '0 1px 2px rgba(0, 0, 0, 0.04)',
  shadowMd: '0 4px 6px rgba(0, 0, 0, 0.06)',
  shadowLg: '0 10px 15px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.15s ease',
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  min-height: 100vh;
  background: ${COLORS.bg};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: ${COLORS.text};
`;

const Header = styled.div`
  background: ${COLORS.surface};
  border-bottom: 1px solid ${COLORS.border};
  padding: 1.25rem 2rem;
  box-shadow: ${COLORS.shadowSm};
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const HeaderTitle = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.h1`
  font-size: 1.375rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: ${COLORS.text};
`;

const Subtitle = styled.p`
  color: ${COLORS.textSecondary};
  font-size: 0.8125rem;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${COLORS.primary};
  color: ${COLORS.white};
  border: none;
  border-radius: ${COLORS.radiusSm};
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: ${COLORS.transition};
  box-shadow: ${COLORS.shadowSm};

  &:hover {
    background: ${COLORS.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${COLORS.shadowMd};
  }
`;

const SecondaryButton = styled.button`
  background: ${COLORS.surface};
  color: ${COLORS.text};
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: ${COLORS.transition};

  &:hover {
    background: ${COLORS.bg};
    border-color: ${COLORS.textSecondary};
  }
`;

const BackButton = styled.button`
  background: ${COLORS.surface};
  color: ${COLORS.primary};
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: ${COLORS.transition};

  &:hover {
    background: ${COLORS.bg};
    border-color: ${COLORS.primary};
  }
`;

const MainLayout = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.25rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 1024px) {
    order: -1;
  }
`;

const Card = styled.div`
  background: ${COLORS.surface};
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowSm};
  border: 1px solid ${COLORS.border};
  overflow: hidden;
  animation: ${fadeIn} 0.25s ease-out;
`;

const CardHeader = styled.div`
  padding: 0.875rem 1.125rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${COLORS.bg};
`;

const CardTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardBody = styled.div`
  padding: 1.125rem;
`;

const ProfileCard = styled.div`
  background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%);
  color: ${COLORS.white};
  padding: 1.25rem;
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowMd};
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 1rem;
`;

const ProfileAvatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLORS.white};
  font-size: 1.75rem;
  font-weight: 600;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

const ProfileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProfileName = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
`;

const ProfileMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: ${COLORS.radiusXs};
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.$bgColor || COLORS.success};
  color: ${COLORS.white};
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
`;

const QuickStatItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem;
  border-radius: ${COLORS.radiusSm};
  border: 1px solid rgba(255, 255, 255, 0.15);
`;

const QuickStatLabel = styled.div`
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const QuickStatValue = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background: ${COLORS.bg};
  border-radius: ${COLORS.radius};
  margin-bottom: 1rem;
  border: 1px solid ${COLORS.border};
`;

const Tab = styled.button`
  flex: 1;
  border: none;
  background: ${props => props.$active ? COLORS.surface : 'transparent'};
  color: ${props => props.$active ? COLORS.primary : COLORS.textSecondary};
  padding: 0.5rem 0.75rem;
  border-radius: ${COLORS.radiusSm};
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: ${COLORS.transition};
  box-shadow: ${props => props.$active ? COLORS.shadowSm : 'none'};

  &:hover {
    background: ${props => props.$active ? COLORS.surface : 'rgba(255, 255, 255, 0.5)'};
  }
`;

const TabContent = styled.div`
  animation: ${fadeIn} 0.2s ease-out;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.625rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  padding: 0.75rem;
  background: ${COLORS.bg};
  border-radius: ${COLORS.radiusSm};
  border: 1px solid ${COLORS.border};
  transition: ${COLORS.transition};

  &:hover {
    border-color: ${COLORS.primary};
    box-shadow: 0 1px 3px rgba(26, 95, 122, 0.06);
  }
`;

const InfoLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${COLORS.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${COLORS.text};
  word-break: break-word;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 1.5rem;
  color: ${COLORS.textSecondary};

  svg {
    width: 2rem;
    height: 2rem;
    margin-bottom: 0.5rem;
    opacity: 0.4;
  }

  h4 {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
    color: ${COLORS.text};
  }

  p {
    font-size: 0.75rem;
    margin: 0;
    color: ${COLORS.textSecondary};
  }
`;

const SectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 0.625rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: ${fadeIn} 0.12s ease-out;
  backdrop-filter: blur(3px);
`;

const ModalContent = styled.div`
  background: ${COLORS.surface};
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowLg};
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${COLORS.bg};

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: ${COLORS.text};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ModalButton = styled.button`
  background: transparent;
  border: none;
  color: ${COLORS.textSecondary};
  cursor: pointer;
  padding: 0.375rem;
  border-radius: ${COLORS.radiusXs};
  transition: ${COLORS.transition};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${COLORS.border};
    color: ${COLORS.text};
  }
`;

const ModalBody = styled.div`
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
`;

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

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

    return config;
  },
  (error) => Promise.reject(error)
);

const Loader = lazy(() =>
  import('../../loader/loader').catch(() => ({
    default: () => <div>Loading...</div>,
  }))
);

const DeceasedInfoSection = lazy(() =>
  import('../deceasedInfoSection').catch(() => ({
    default: () => <div>Deceased Info component not available</div>,
  }))
);

const NextOfKinSection = lazy(() =>
  import('../../next-kin/nextOfKIn').catch(() => ({
    default: () => <div>Next of Kin component not available</div>,
  }))
);

const MortuaryProgress = lazy(() =>
  import('../../modals/mortuaryProgress').catch(() => ({
    default: () => <div>Progress component not available</div>,
  }))
);

const CoffinAssignment = lazy(() =>
  import('../../coffins/coffinAssignment').catch(() => ({
    default: () => <div>Coffin Assignment component not available</div>,
  }))
);

const DispatchSection = lazy(() =>
  import('../../dispatch/dispatchSection')
);

const PostmortemSection = lazy(() =>
  import('./PostmortemSection').catch(() => ({
    default: () => <div>Postmortem component not available</div>,
  }))
);

const DocumentUpload = lazy(() =>
  import('../../documents/DocumentUpload').catch(() => ({
    default: () => <div>Document Upload component not available</div>,
  }))
);

const DeceasedFinancialDetails = lazy(() =>
  import('./deceasedFinancialDetails').catch(() => ({
    default: () => <div>Financial Details component not available</div>,
  }))
);

const ExtraChargeForm = lazy(() =>
  import('../extraCharges/ExtraChargeForm').catch(() => ({
    default: () => null,
  }))
);

const PaymentForm = lazy(() =>
  import('../payments/PaymentForm').catch(() => ({
    default: () => null,
  }))
);

const DeceasedInfoModal = lazy(() =>
  import('../../modals/deceasedinfomodal').catch(() => ({
    default: () => null,
  }))
);

const NextOfKinModal = lazy(() =>
  import('../../modals/nextofKinModal').catch(() => ({
    default: () => null,
  }))
);

const FinancialDetailsModal = lazy(() =>
  import('../../modals/financialdetailsmodal').catch(() => ({
    default: () => null,
  }))
);

const PaymentHistoryModal = lazy(() =>
  import('../../modals/paymenthistoryModals').catch(() => ({
    default: () => null,
  }))
);

const ChargeSettingsModal = lazy(() =>
  import('../ChargeSettingsModal').catch(() => ({
    default: () => null,
  }))
);

const LoadingFallback = () => (
  <div style={{ padding: '1rem', textAlign: 'center', color: COLORS.textSecondary }}>
    <RefreshCw size={16} className="animate-spin" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
    Loading...
  </div>
);

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
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: COLORS.radius,
          color: COLORS.danger,
          textAlign: 'center'
        }}>
          <AlertTriangle size={18} style={{ marginBottom: '0.375rem' }} />
          <p style={{ margin: 0, fontSize: '0.8125rem' }}>
            {this.props.errorMessage || 'Something went wrong loading this component.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

const DeceasedDetails = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const [deceasedData, setDeceasedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coffins, setCoffins] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [showDeceasedInfoModal, setShowDeceasedInfoModal] = useState(false);
  const [showNextOfKinModal, setShowNextOfKinModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [showChargeSettingsModal, setShowChargeSettingsModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showExtraChargesModal, setShowExtraChargesModal] = useState(false);
  const [showExtraChargeForm, setShowExtraChargeForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [financialData, setFinancialData] = useState({
    payments: [],
    extraCharges: [],
    invoices: [],
    totals: {
      total_charges: 0,
      mortuary_charges: 0,
      extra_charges: 0,
      total_payments: 0,
      balance: 0
    }
  });
  const [isLoadingFinancial, setIsLoadingFinancial] = useState(false);
  const [financialActionLoading, setFinancialActionLoading] = useState(false);

  const getDeceasedId = () => deceasedData?.deceased_id || deceasedData?.id || id;
  const currentDeceasedId = getDeceasedId();

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
    try {
      const tenantSlug = getTenantSlug();

      if (tenantSlug && tenantSlug !== 'default') {
        localStorage.setItem('tenantSlug', tenantSlug);
      }

      const response = await axios.get(`${BASE_URL}/deceased/${id}`, {
        headers: {
          'x-tenant-slug': tenantSlug,
        },
      });

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
      setDeceasedData({
        deceased_id: id,
        full_name: 'Unknown',
        total_mortuary_charge: 0,
        currency: 'KES',
        burial_type: 'Burial',
        next_of_kin: [],
        documents: [],
        charges: [],
        dispatch: null,
        status: 'active',
      });
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

  const fetchFinancialData = useCallback(async () => {
    if (!currentDeceasedId) return;

    setIsLoadingFinancial(true);
    try {
      const tenantSlug = getTenantSlug();
      const headers = { 'x-tenant-slug': tenantSlug };

      // Use the invoice service endpoints for financial data
      const [paymentsRes, chargesRes, invoicesRes] = await Promise.all([
        apiClient.get(`/invoices/payments/${currentDeceasedId}`, { headers })
          .catch(err => ({ data: { data: [] } })),
        apiClient.get(`/invoices/extra-charges/${currentDeceasedId}`, { headers })
          .catch(err => ({ data: { data: [] } })),
        apiClient.get(`/invoices/deceased/${currentDeceasedId}`, { headers })
          .catch(err => ({ data: { data: [] } }))
      ]);

      const payments = paymentsRes.data?.data || [];
      const extraCharges = chargesRes.data?.data || [];
      const invoices = invoicesRes.data?.data || [];

      const mortuaryCharges = deceasedData?.total_mortuary_charge || 0;
      const extraChargesTotal = extraCharges.reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
      const totalCharges = mortuaryCharges + extraChargesTotal;
      const totalPayments = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
      const balance = totalCharges - totalPayments;

      setFinancialData({
        payments,
        extraCharges,
        invoices,
        totals: {
          total_charges: totalCharges,
          mortuary_charges: mortuaryCharges,
          extra_charges: extraChargesTotal,
          total_payments: totalPayments,
          balance
        }
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setIsLoadingFinancial(false);
    }
  }, [currentDeceasedId, deceasedData]);

  // Financial action handlers connected to invoice backend
  const handleCreatePayment = async (paymentData) => {
    setFinancialActionLoading(true);
    try {
      const tenantSlug = getTenantSlug();
      const response = await apiClient.post('/invoices/payment', {
        deceased_id: paymentData.deceased_id || currentDeceasedId,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        reference_code: paymentData.reference_code,
        description: paymentData.description
      }, {
        headers: { 'x-tenant-slug': tenantSlug }
      });

      if (response.data?.status === 'success') {
        setShowPaymentForm(false);
        fetchFinancialData();
        return { success: true, message: 'Payment recorded successfully' };
      }
      throw new Error(response.data?.message || 'Failed to record payment');
    } catch (error) {
      console.error('Error recording payment:', error);
      return { success: false, message: error.response?.data?.message || error.message || 'Failed to record payment' };
    } finally {
      setFinancialActionLoading(false);
    }
  };

  const handleAddExtraCharge = async (chargeData) => {
    setFinancialActionLoading(true);
    try {
      const tenantSlug = getTenantSlug();
      const response = await apiClient.post('/invoices/extra-charge', {
        deceased_id: chargeData.deceased_id || currentDeceasedId,
        charge_type: chargeData.charge_type,
        amount: chargeData.amount,
        description: chargeData.description,
        notes: chargeData.notes,
        service_date: chargeData.service_date
      }, {
        headers: { 'x-tenant-slug': tenantSlug }
      });

      if (response.data?.status === 'success') {
        setShowExtraChargeForm(false);
        fetchFinancialData();
        return { success: true, message: 'Extra charge added successfully' };
      }
      throw new Error(response.data?.message || 'Failed to add extra charge');
    } catch (error) {
      console.error('Error adding extra charge:', error);
      return { success: false, message: error.response?.data?.message || error.message || 'Failed to add extra charge' };
    } finally {
      setFinancialActionLoading(false);
    }
  };

  const handleDeleteExtraCharge = async (chargeId) => {
    try {
      const tenantSlug = getTenantSlug();
      const response = await apiClient.delete(`/invoices/extra-charge/${chargeId}`, {
        headers: { 'x-tenant-slug': tenantSlug }
      });

      if (response.data?.status === 'success' || response.data?.success) {
        fetchFinancialData();
        return { success: true };
      }
      throw new Error('Failed to delete charge');
    } catch (error) {
      console.error('Error deleting extra charge:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const handleEditExtraCharge = async (charge) => {
    setShowExtraChargeForm(true);
    // Pass the charge data to the form for editing
    return charge;
  };

  const handleViewInvoice = async (invoiceId) => {
    try {
      const tenantSlug = getTenantSlug();
      const response = await apiClient.get(`/invoices/${invoiceId}`, {
        headers: { 'x-tenant-slug': tenantSlug }
      });
      return response.data?.data || null;
    } catch (error) {
      console.error('Error viewing invoice:', error);
      return null;
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const tenantSlug = getTenantSlug();
      const response = await apiClient.get(`/invoices/${invoiceId}/download`, {
        headers: { 'x-tenant-slug': tenantSlug },
        responseType: 'blob'
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = `invoice-${invoiceId}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+?)"?$/);
        if (match) filename = match[1];
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      console.error('Error downloading invoice:', error);
      return { success: false, message: 'Failed to download invoice' };
    }
  };

  const handlePrintInvoice = async (invoiceId) => {
    try {
      const tenantSlug = getTenantSlug();
      const response = await apiClient.get(`/invoices/${invoiceId}/download`, {
        headers: { 'x-tenant-slug': tenantSlug },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => printWindow.print(), 500);
        };
      }
      return { success: true };
    } catch (error) {
      console.error('Error printing invoice:', error);
      return { success: false, message: 'Failed to print invoice' };
    }
  };

  const handleEditInvoice = async (invoiceId) => {
    console.log('Edit invoice:', invoiceId);
    // Could open an edit modal
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      const tenantSlug = getTenantSlug();
      const response = await apiClient.delete(`/invoices/${invoiceId}`, {
        headers: { 'x-tenant-slug': tenantSlug }
      });

      if (response.data?.status === 'success') {
        fetchFinancialData();
        return { success: true };
      }
      throw new Error('Failed to delete invoice');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  useEffect(() => {
    if (id) {
      fetchDeceasedData();
      fetchCoffins();
      fetchFinancialData();
    }
  }, [id, fetchDeceasedData, fetchCoffins, fetchFinancialData]);

  const handleRefresh = () => {
    fetchDeceasedData();
    fetchCoffins();
    setRefreshKey(prev => prev + 1);
  };

  const handleDocumentUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
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
  const ageInfo = calculateAge(deceasedData?.date_of_birth, deceasedData?.date_of_death);

  if (isLoading && !showLoader) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <RefreshCw size={24} color={COLORS.primary} className="animate-spin" />
      </Container>
    );
  }

  if (!deceasedData && !isLoading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <AlertTriangle size={36} color={COLORS.danger} />
          <h3 style={{ margin: '1rem 0 0.5rem', color: COLORS.text, fontSize: '1.125rem' }}>Failed to load details</h3>
          <p style={{ margin: '0.25rem 0', fontSize: '0.8125rem', color: COLORS.textSecondary }}>
            ID: {id}
          </p>
          <BackButton onClick={() => navigate(-1)} style={{ marginTop: '1.25rem' }}>
            <ArrowLeft size={16} /> Go Back
          </BackButton>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {showLoader && (
        <Suspense fallback={null}>
          <Loader message="Loading..." />
        </Suspense>
      )}

      <Header>
        <HeaderContent>
          <HeaderTitle>
            <Title>
              <User size={22} />
              {deceasedData?.full_name || 'Deceased Details'}
            </Title>
            <Subtitle>Ref: {deceasedData?.deceased_id || id} • Total: {deceasedData?.total_mortuary_charge || 0} {deceasedData?.currency || 'KES'}</Subtitle>
          </HeaderTitle>
          <HeaderActions>
            <ActionButton onClick={() => setShowScannerModal(true)}>
              <QrCode size={15} /> Scan
            </ActionButton>
            <SecondaryButton onClick={handleRefresh}>
              <RefreshCw size={15} /> Refresh
            </SecondaryButton>
            <BackButton onClick={() => navigate(-1)}>
              <ArrowLeft size={15} /> Back
            </BackButton>
          </HeaderActions>
        </HeaderContent>
      </Header>

      <MainLayout>
        <MainContent>
          <TabsContainer>
            <Tab $active={activeSection === 'overview'} onClick={() => setActiveSection('overview')}>
              Overview
            </Tab>
            <Tab $active={activeSection === 'documents'} onClick={() => setActiveSection('documents')}>
              Documents
            </Tab>
            <Tab $active={activeSection === 'financials'} onClick={() => setActiveSection('financials')}>
              Financials
            </Tab>
            <Tab $active={activeSection === 'postmortem'} onClick={() => setActiveSection('postmortem')}>
              Postmortem
            </Tab>
            <Tab $active={activeSection === 'dispatch'} onClick={() => setActiveSection('dispatch')}>
              Dispatch
            </Tab>
          </TabsContainer>

          <TabContent>
            {activeSection === 'overview' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle><Info size={16} /> Personal Information</CardTitle>
                    <ActionButton onClick={() => setShowDeceasedInfoModal(true)} style={{ background: COLORS.primary }}>
                      <Download size={15} /> View Full Info
                    </ActionButton>
                  </CardHeader>
                  <CardBody>
                    <Suspense fallback={<LoadingFallback />}>
                      <DeceasedInfoSection
                        deceasedData={deceasedData}
                        ageInfo={ageInfo}
                      />
                    </Suspense>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle><Users size={16} /> Next of Kin</CardTitle>
                    <ActionButton onClick={() => setShowNextOfKinModal(true)} style={{ background: COLORS.primary }}>
                      <Download size={15} /> View All
                    </ActionButton>
                  </CardHeader>
                  <CardBody>
                    <Suspense fallback={<LoadingFallback />}>
                      <NextOfKinSection
                        nextOfKin={deceasedData?.next_of_kin}
                        deceasedName={deceasedData?.full_name}
                      />
                    </Suspense>
                  </CardBody>
                </Card>
              </>
            )}

            {activeSection === 'documents' && (
              <Card>
                <CardHeader>
                  <CardTitle><FileText size={16} /> Documents</CardTitle>
                </CardHeader>
                <CardBody>
                  <Suspense fallback={<LoadingFallback />}>
                    <DocumentUpload
                      key={`documents-${refreshKey}`}
                      deceasedId={currentDeceasedId}
                      deceasedData={deceasedData}
                      onUploadSuccess={handleDocumentUploadSuccess}
                    />
                  </Suspense>
                </CardBody>
              </Card>
            )}

            {activeSection === 'financials' && (
              <Card>
                <CardHeader>
                  <CardTitle><DollarSign size={16} /> Financial Details</CardTitle>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <ActionButton onClick={() => setShowPaymentForm(true)} style={{ background: COLORS.success }}>
                      <Download size={15} /> Add Payment
                    </ActionButton>
                    <ActionButton onClick={() => setShowExtraChargeForm(true)} style={{ background: COLORS.warning }}>
                      <TrendingUp size={15} /> Add Charge
                    </ActionButton>
                  </div>
                </CardHeader>
                <CardBody>
                  <Suspense fallback={<LoadingFallback />}>
                    <DeceasedFinancialDetails
                      key={`financial-${refreshKey}`}
                      financialDetails={{
                        deceased: deceasedData,
                        payments: financialData.payments,
                        extraCharges: financialData.extraCharges,
                        invoices: financialData.invoices,
                        totals: financialData.totals
                      }}
                      selectedDeceased={deceasedData}
                      onBack={() => { }}
                      onCreatePayment={() => setShowPaymentForm(true)}
                      onAddCharge={() => setShowExtraChargeForm(true)}
                      onDownloadInvoice={() => { }}
                      onViewInvoice={() => { }}
                      onEditInvoice={() => { }}
                      onPrintInvoice={() => { }}
                      onEditExtraCharge={() => { }}
                      onDeleteExtraCharge={() => { }}
                    />
                  </Suspense>
                </CardBody>
              </Card>
            )}

            {activeSection === 'dispatch' && (
              <Card>
                <CardHeader>
                  <CardTitle><Truck size={16} /> Dispatch</CardTitle>
                </CardHeader>
                <CardBody>
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
                </CardBody>
              </Card>
            )}

            {activeSection === 'postmortem' && (
              <Card>
                <CardHeader>
                  <CardTitle><Activity size={16} /> Postmortem Examination</CardTitle>
                  <ActionButton onClick={() => setShowPostmortemRequestModal(true)} style={{ background: COLORS.primary }}>
                    <PlusCircle size={15} /> Request Postmortem
                  </ActionButton>
                </CardHeader>
                <CardBody>
                  <Suspense fallback={<LoadingFallback />}>
                    <ErrorBoundary fallback={<div>Failed to load Postmortem data</div>}>
                      <PostmortemSection
                        deceasedId={currentDeceasedId}
                        deceasedData={deceasedData}
                        onUpdate={fetchDeceasedData}
                      />
                    </ErrorBoundary>
                  </Suspense>
                </CardBody>
              </Card>
            )}
          </TabContent>
        </MainContent>

        <Sidebar>
          <ProfileCard>
            <ProfileHeader>
              <ProfileAvatar>
                {deceasedData?.full_name ? deceasedData.full_name.charAt(0).toUpperCase() : '?'}
              </ProfileAvatar>
              <ProfileInfo>
                <ProfileName>{deceasedData?.full_name || 'Unknown'}</ProfileName>
                <ProfileMeta>
                  <StatusBadge $bgColor={daysInMortuary > 30 ? COLORS.danger : COLORS.success}>
                    {daysInMortuary > 30 ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                    {deceasedData?.status || 'Active'}
                  </StatusBadge>
                </ProfileMeta>
              </ProfileInfo>
            </ProfileHeader>

            <QuickStats>
              <QuickStatItem>
                <QuickStatLabel>Days in Mortuary</QuickStatLabel>
                <QuickStatValue>{daysInMortuary}</QuickStatValue>
              </QuickStatItem>
              <QuickStatItem>
                <QuickStatLabel>Age</QuickStatLabel>
                <QuickStatValue>{ageInfo.years !== 'N/A' ? `${ageInfo.years} yrs` : 'N/A'}</QuickStatValue>
              </QuickStatItem>
              <QuickStatItem>
                <QuickStatLabel>Total Charges</QuickStatLabel>
                <QuickStatValue>{deceasedData?.total_mortuary_charge || 0} {deceasedData?.currency || 'KES'}</QuickStatValue>
              </QuickStatItem>
              <QuickStatItem>
                <QuickStatLabel>Balance</QuickStatLabel>
                <QuickStatValue>{financialData.totals.balance || 0} {deceasedData?.currency || 'KES'}</QuickStatValue>
              </QuickStatItem>
            </QuickStats>
          </ProfileCard>

          <Card>
            <CardHeader>
              <CardTitle><Box size={16} /> Coffin Assignment</CardTitle>
            </CardHeader>
            <CardBody>
              <Suspense fallback={<LoadingFallback />}>
                <CoffinAssignment
                  key={`coffin-${refreshKey}`}
                  deceasedId={currentDeceasedId}
                  deceasedData={deceasedData}
                  coffins={coffins}
                  onUpdate={fetchDeceasedData}
                />
              </Suspense>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle><Activity size={16} /> Mortuary Progress</CardTitle>
            </CardHeader>
            <CardBody>
              <Suspense fallback={<LoadingFallback />}>
                <MortuaryProgress
                  key={`progress-${refreshKey}`}
                  daysInMortuary={daysInMortuary}
                  dispatchDate={deceasedData?.dispatch_date}
                  isOverdue={daysInMortuary > 30}
                />
              </Suspense>
            </CardBody>
          </Card>
        </Sidebar>
      </MainLayout>

      {/* Modals */}
      <Suspense fallback={null}>
        {showDeceasedInfoModal && (
          <ModalOverlay onClick={() => setShowDeceasedInfoModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><Info size={18} /> Personal Information</h3>
                <ModalButton onClick={() => setShowDeceasedInfoModal(false)}>
                  <X size={18} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <DeceasedInfoModal
                  isOpen={showDeceasedInfoModal}
                  onClose={() => setShowDeceasedInfoModal(false)}
                  deceased={deceasedData}
                  ageInfo={ageInfo}
                />
              </Suspense>
            </ModalContent>
          </ModalOverlay>
        )}
        {showNextOfKinModal && (
          <ModalOverlay onClick={() => setShowNextOfKinModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><Users size={18} /> Next of Kin</h3>
                <ModalButton onClick={() => setShowNextOfKinModal(false)}>
                  <X size={18} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <NextOfKinModal
                  isOpen={showNextOfKinModal}
                  onClose={() => setShowNextOfKinModal(false)}
                  nextOfKin={deceasedData?.next_of_kin}
                />
              </Suspense>
            </ModalContent>
          </ModalOverlay>
        )}
        {showFinancialModal && (
          <ModalOverlay onClick={() => setShowFinancialModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><DollarSign size={18} /> Financial Details</h3>
                <ModalButton onClick={() => setShowFinancialModal(false)}>
                  <X size={18} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <FinancialDetailsModal
                  isOpen={showFinancialModal}
                  onClose={() => setShowFinancialModal(false)}
                  deceasedData={deceasedData}
                />
              </Suspense>
            </ModalContent>
          </ModalOverlay>
        )}
        {showPaymentHistoryModal && (
          <ModalOverlay onClick={() => setShowPaymentHistoryModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><FileText size={18} /> Payment History</h3>
                <ModalButton onClick={() => setShowPaymentHistoryModal(false)}>
                  <X size={18} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <PaymentHistoryModal
                  isOpen={showPaymentHistoryModal}
                  onClose={() => setShowPaymentHistoryModal(false)}
                  payments={financialData.payments}
                />
              </Suspense>
            </ModalContent>
          </ModalOverlay>
        )}
        {showChargeSettingsModal && (
          <ModalOverlay onClick={() => setShowChargeSettingsModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><Activity size={18} /> Charge Settings</h3>
                <ModalButton onClick={() => setShowChargeSettingsModal(false)}>
                  <X size={18} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <ChargeSettingsModal
                  isOpen={showChargeSettingsModal}
                  onClose={() => setShowChargeSettingsModal(false)}
                  deceasedData={deceasedData}
                  onUpdate={fetchDeceasedData}
                />
              </Suspense>
            </ModalContent>
          </ModalOverlay>
        )}
        {showProgressModal && (
          <ModalOverlay onClick={() => setShowProgressModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><Activity size={18} /> Mortuary Progress</h3>
                <ModalButton onClick={() => setShowProgressModal(false)}>
                  <X size={18} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <MortuaryProgress
                  daysInMortuary={daysInMortuary}
                  dispatchDate={deceasedData?.dispatch_date}
                  isOverdue={daysInMortuary > 30}
                />
              </Suspense>
            </ModalContent>
          </ModalOverlay>
        )}
        {showExtraChargesModal && (
          <ModalOverlay onClick={() => setShowExtraChargesModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><TrendingUp size={18} /> Extra Charges</h3>
                <ModalButton onClick={() => setShowExtraChargesModal(false)}>
                  <X size={18} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <ErrorBoundary fallback={<div>Failed to load Extra Charges</div>}>
                  <ExtraChargeForm
                    deceased={deceasedData}
                    onClose={() => setShowExtraChargesModal(false)}
                    onSuccess={fetchFinancialData}
                  />
                </ErrorBoundary>
              </Suspense>
            </ModalContent>
          </ModalOverlay>
        )}
        {showExtraChargeForm && (
          <ModalOverlay onClick={() => setShowExtraChargeForm(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><TrendingUp size={18} /> Add Extra Charge</h3>
                <ModalButton onClick={() => setShowExtraChargeForm(false)}>
                  <X size={18} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <ExtraChargeForm
                  deceased={deceasedData}
                  onClose={() => setShowExtraChargeForm(false)}
                  onSuccess={fetchFinancialData}
                />
              </Suspense>
            </ModalContent>
          </ModalOverlay>
        )}
        {showPaymentForm && (
          <ModalOverlay onClick={() => setShowPaymentForm(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><DollarSign size={18} /> Record Payment</h3>
                <ModalButton onClick={() => setShowPaymentForm(false)}>
                  <X size={18} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <PaymentForm
                  deceased={deceasedData}
                  onClose={() => setShowPaymentForm(false)}
                  onSuccess={fetchFinancialData}
                />
              </Suspense>
            </ModalContent>
          </ModalOverlay>
        )}
        {showScannerModal && (
          <ModalOverlay onClick={() => setShowScannerModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><QrCode size={18} /> Scan QR Code</h3>
                <ModalButton onClick={() => setShowScannerModal(false)}>
                  <X size={18} />
                </ModalButton>
              </ModalHeader>
              <ScannerComponent
                onScanComplete={handleScanComplete}
                onClose={() => setShowScannerModal(false)}
              />
            </ModalContent>
          </ModalOverlay>
        )}
      </Suspense>
    </Container>
  );
};

export default DeceasedDetails;