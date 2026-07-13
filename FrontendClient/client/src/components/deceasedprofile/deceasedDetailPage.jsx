import React, { useState, useEffect, lazy, Suspense, Component, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  QrCode,
  RefreshCw,
  ArrowLeft,
  User,
  Info,
  AlertTriangle,
  CheckCircle,
  Users,
  TrendingUp,
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
import styled from 'styled-components';

import ScannerComponent from '../scanner/ScannerComponent';

const API_GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_GATEWAY_URL}/api/v1/restpoint`;

// Clean, professional color scheme like leaves page
const COLORS = {
  primary: '#0A2463',
  primaryLight: '#1A3A7A',
  white: '#FFFFFF',
  bg: '#F5F7FA',
  border: '#E8ECF0',
  text: '#1A1D24',
  textSecondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#E74C3C',
  info: '#3B82F6',
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  background: ${COLORS.bg};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${COLORS.text};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${COLORS.textSecondary};
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
`;

const ActionButton = styled.button`
  background: ${COLORS.primary};
  color: ${COLORS.white};
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: ${COLORS.primaryLight};
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${COLORS.white};
  color: ${COLORS.primary};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.bg};
    border-color: ${COLORS.primary};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (min-width: 992px) {
    grid-template-columns: 65% 35%;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Card = styled.div`
  background: ${COLORS.white};
  padding: 1.5rem;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid ${COLORS.border};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${COLORS.border};
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${props => props.$bgColor || COLORS.primary};
  color: ${COLORS.white};
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const BadgesContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const Section = styled.div`
  background: ${COLORS.white};
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid ${COLORS.border};
  margin-bottom: 1.5rem;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 1.5rem;
`;

const ModalContent = styled.div`
  background: ${COLORS.white};
  border-radius: 14px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${COLORS.border};

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: ${COLORS.text};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ModalButton = styled.button`
  background: none;
  border: none;
  color: ${COLORS.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: ${COLORS.danger};
    transform: rotate(90deg);
  }
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
  import('../../components/loader/loader').catch(() => ({
    default: () => <div>Loading...</div>,
  }))
);

const DeceasedInfoSection = lazy(() =>
  import('../deceasedinfo/deceasedInfoSection').catch(() => ({
    default: () => <div>Deceased Info component not available</div>,
  }))
);

const NextOfKinSection = lazy(() =>
  import('../next-kin/nextOfKIn').catch(() => ({
    default: () => <div>Next of Kin component not available</div>,
  }))
);

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

const DocumentUpload = lazy(() =>
  import('../documents/DocumentUpload').catch(() => ({
    default: () => <div>Document Upload component not available</div>,
  }))
);

const DeceasedFinancialDetails = lazy(() =>
  import('./deceasedFinancialDetails').catch(() => ({
    default: () => <div>Financial Details component not available</div>,
  }))
);

const ExtraChargeForm = lazy(() =>
  import('./ExtraChargeForm').catch(() => ({
    default: () => null,
  }))
);

const PaymentForm = lazy(() =>
  import('./PaymentForm').catch(() => ({
    default: () => null,
  }))
);

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
  <div style={{ padding: '1rem', textAlign: 'center', color: COLORS.textSecondary }}>
    <RefreshCw size={20} className="animate-spin" style={{ marginRight: '0.5rem' }} />
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
          padding: '1.5rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '14px',
          color: COLORS.danger,
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
  const [showExtraChargesModal, setShowExtraChargesModal] = useState(false);
  const [showExtraChargeForm, setShowExtraChargeForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
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

      const response = await apiClient.get(`/deceased/${id}`, {
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

      const [paymentsRes, chargesRes, invoicesRes] = await Promise.all([
        apiClient.get(`/payments/${currentDeceasedId}`, {
          headers: { 'x-tenant-slug': tenantSlug }
        }).catch(err => ({ data: { data: [] } })),
        apiClient.get(`/extra-charges/${currentDeceasedId}`, {
          headers: { 'x-tenant-slug': tenantSlug }
        }).catch(err => ({ data: { data: [] } })),
        apiClient.get(`/invoices/${currentDeceasedId}`, {
          headers: { 'x-tenant-slug': tenantSlug }
        }).catch(err => ({ data: { data: [] } }))
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
  const ageInfo = calculateAge(deceasedData?.date_of_birth, deceasedData?.date_of_death);

  if (isLoading && !showLoader) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <RefreshCw size={32} color={COLORS.primary} className="animate-spin" />
      </Container>
    );
  }

  if (!deceasedData && !isLoading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <AlertTriangle size={48} color={COLORS.danger} />
          <h3 style={{ margin: '1rem 0 0.5rem', color: COLORS.text }}>Failed to load details</h3>
          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: COLORS.textSecondary }}>
            ID: {id}
          </p>
          <BackButton onClick={() => navigate(-1)} style={{ marginTop: '1.5rem' }}>
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
        <div>
          <Title>{deceasedData?.full_name || 'Deceased Details'}</Title>
          <Subtitle>Ref: {deceasedData?.deceased_id || id} • Total: {deceasedData?.total_mortuary_charge || 0} {deceasedData?.currency || 'KES'}</Subtitle>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <ActionButton onClick={() => setShowScannerModal(true)}>
            <QrCode size={16} /> Scan
          </ActionButton>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </BackButton>
          <ActionButton onClick={handleRefresh}>
            <RefreshCw size={16} /> Refresh
          </ActionButton>
        </div>
      </Header>

      {/* Primary Badges */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Badge $bgColor={daysInMortuary > 30 ? COLORS.danger : COLORS.success} onClick={() => setShowDeceasedInfoModal(true)}>
            {daysInMortuary > 30 ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
            Status: {deceasedData?.status || 'Active'}
          </Badge>
          <Badge $bgColor={COLORS.info} onClick={() => setShowProgressModal(true)}>
            <Activity size={14} />
            Days: {daysInMortuary}
          </Badge>
          <Badge $bgColor={COLORS.primary} onClick={() => setShowFinancialModal(true)}>
            <DollarSign size={14} />
            Charges: {deceasedData?.total_mortuary_charge || 0} {deceasedData?.currency || 'KES'}
          </Badge>
          <Badge $bgColor="#8B7355" onClick={() => setShowNextOfKinModal(true)}>
            <Users size={14} />
            Next of Kin
          </Badge>
          <Badge $bgColor={COLORS.warning} onClick={() => setShowExtraChargesModal(true)}>
            <TrendingUp size={14} />
            Extra Charges
          </Badge>
          <Badge $bgColor="#6B7280" onClick={openChargeSettingsModal}>
            <Settings size={14} />
            Charge Settings
          </Badge>
          <Badge $bgColor={COLORS.info} onClick={navigateToDocuments}>
            <FileText size={14} />
            Documents
          </Badge>
          <Badge $bgColor={COLORS.success} onClick={navigateToReleaseForm}>
            <LogOut size={14} />
            Release Form
          </Badge>
        </div>
      </Card>

      <ContentGrid>
        <MainContent>
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
        </MainContent>

        <SidebarContent>
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
              <MortuaryProgress
                key={`progress-${refreshKey}`}
                daysInMortuary={daysInMortuary}
                dispatchDate={deceasedData?.dispatch_date}
                isOverdue={daysInMortuary > 30}
              />
            </Suspense>
          </Card>
        </SidebarContent>
      </ContentGrid>

      {/* Financial Details - Full Width */}
      <Card>
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
      </Card>

      {/* Modals */}
      <Suspense fallback={null}>
        {showDeceasedInfoModal && (
          <ModalOverlay onClick={() => setShowDeceasedInfoModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><Info size={20} /> Personal Information</h3>
                <ModalButton onClick={() => setShowDeceasedInfoModal(false)}>
                  <X size={24} />
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
                <h3><Users size={20} /> Next of Kin</h3>
                <ModalButton onClick={() => setShowNextOfKinModal(false)}>
                  <X size={24} />
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
                <h3><DollarSign size={20} /> Financial Details</h3>
                <ModalButton onClick={() => setShowFinancialModal(false)}>
                  <X size={24} />
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
                <h3><FileText size={20} /> Payment History</h3>
                <ModalButton onClick={() => setShowPaymentHistoryModal(false)}>
                  <X size={24} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <PaymentHistoryModal
                  isOpen={showPaymentHistoryModal}
                  onClose={() => setShowPaymentHistoryModal(false)}
                  deceasedData={deceasedData}
                  deceasedId={currentDeceasedId}
                />
              </Suspense>
            </ModalContent>
          </ModalOverlay>
        )}
        {showChargeSettingsModal && (
          <ModalOverlay onClick={() => setShowChargeSettingsModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><Settings size={20} /> Charge Settings</h3>
                <ModalButton onClick={() => setShowChargeSettingsModal(false)}>
                  <X size={24} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <ChargeSettingsModal
                  isOpen={showChargeSettingsModal}
                  onClose={() => setShowChargeSettingsModal(false)}
                  deceasedId={currentDeceasedId}
                  deceasedData={deceasedData}
                  onUpdate={fetchDeceasedData}
                />
              </Suspense>
            </ModalContent>
          </ModalOverlay>
        )}
        {showExtraChargesModal && (
          <ModalOverlay onClick={() => setShowExtraChargesModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><TrendingUp size={20} /> Extra Charges</h3>
                <ModalButton onClick={() => setShowExtraChargesModal(false)}>
                  <X size={24} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <ExtraChargesModal
                  isOpen={showExtraChargesModal}
                  onClose={() => setShowExtraChargesModal(false)}
                  deceased={deceasedData}
                  onRefresh={fetchDeceasedData}
                />
              </Suspense>
            </ModalContent>
          </ModalOverlay>
        )}
        {showExtraChargeForm && (
          <ModalOverlay onClick={() => setShowExtraChargeForm(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><DollarSign size={20} /> Add Extra Charge</h3>
                <ModalButton onClick={() => setShowExtraChargeForm(false)}>
                  <X size={24} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <ExtraChargeForm
                  deceased={deceasedData}
                  onClose={() => setShowExtraChargeForm(false)}
                  onSubmit={async (formData) => {
                    try {
                      const tenantSlug = getTenantSlug();
                      const response = await apiClient.post(`/extra-charges`, formData, {
                        headers: { 'x-tenant-slug': tenantSlug }
                      });
                      if (response.data?.success) {
                        setShowExtraChargeForm(false);
                        fetchDeceasedData();
                      }
                    } catch (error) {
                      console.error('Error adding extra charge:', error);
                    }
                  }}
                  isLoading={isLoadingFinancial}
                />
              </Suspense>
            </ModalContent>
          </ModalOverlay>
        )}
        {showPaymentForm && (
          <ModalOverlay onClick={() => setShowPaymentForm(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><Wallet size={20} /> Record Payment</h3>
                <ModalButton onClick={() => setShowPaymentForm(false)}>
                  <X size={24} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <PaymentForm
                  deceased={deceasedData}
                  onClose={() => setShowPaymentForm(false)}
                  onSubmit={async (formData) => {
                    try {
                      const tenantSlug = getTenantSlug();
                      const response = await apiClient.post(`/payments`, formData, {
                        headers: { 'x-tenant-slug': tenantSlug }
                      });
                      if (response.data?.success) {
                        setShowPaymentForm(false);
                        fetchDeceasedData();
                      }
                    } catch (error) {
                      console.error('Error recording payment:', error);
                    }
                  }}
                  isLoading={isLoadingFinancial}
                />
              </Suspense>
            </ModalContent>
          </ModalOverlay>
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
        {showScannerModal && (
          <ModalOverlay onClick={() => setShowScannerModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3><QrCode size={20} /> Document Scanner</h3>
                <ModalButton onClick={() => setShowScannerModal(false)}>
                  <X size={24} />
                </ModalButton>
              </ModalHeader>
              <Suspense fallback={<LoadingFallback />}>
                <ScannerComponent
                  key={`scanner-${refreshKey}`}
                  deceasedId={currentDeceasedId}
                  deceasedData={deceasedData}
                  onScanComplete={handleScanComplete}
                  onUploadSuccess={handleDocumentUploadSuccess}
                />
              </Suspense>
            </ModalContent>
          </ModalOverlay>
        )}
      </Suspense>
    </Container>
  );
};

export default DeceasedDetails;