import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import api from '../../api/axios';

// ─── Animations ──────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
  50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

// ─── Color Palette ───────────────────────────────────────────────────
const Colors = {
  primary: '#3B82F6',
  primaryDark: '#1E40AF',
  primaryLight: '#60A5FA',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  
  dark: {
    bg: '#0F172A',
    card: '#1E293B',
    border: '#334155',
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      muted: '#64748B'
    }
  }
};

// ─── Styled Components ───────────────────────────────────────────────
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${Colors.dark.bg} 0%, #1a202c 100%);
  color: ${Colors.dark.text.primary};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.6s ease-out;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const HeaderLeft = styled.div`
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.secondary} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
  }
  
  .last-update {
    color: ${Colors.dark.text.secondary};
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const RefreshToggle = styled.button`
  background: ${props => props.active ? Colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : Colors.primary};
  border: 2px solid ${Colors.primary};
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${Colors.primary};
    color: white;
    transform: translateY(-2px);
  }
  
  ${props => props.active && `
    animation: ${glow} 2s infinite;
  `}
`;

const RefreshButton = styled.button`
  background: linear-gradient(135deg, ${Colors.secondary} 0%, #7C3AED 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
  }
`;

const DashboardTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: ${Colors.dark.card};
  padding: 0.5rem;
  border-radius: 16px;
  animation: ${fadeIn} 0.8s ease-out;
  overflow-x: auto;
  
  @media (max-width: 768px) {
    flex-wrap: nowrap;
  }
`;

const TabButton = styled.button`
  flex: 1;
  min-width: 120px;
  background: ${props => props.active ? Colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : Colors.dark.text.secondary};
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.active ? Colors.primary : 'rgba(59, 130, 246, 0.1)'};
    color: ${props => props.active ? 'white' : Colors.primary};
  }
  
  .tab-badge {
    background: ${Colors.danger};
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 20px;
    font-size: 0.75rem;
    margin-left: auto;
  }
`;

const TabContent = styled.div`
  animation: ${fadeIn} 0.6s ease-out;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, ${Colors.dark.card} 0%, #273449 100%);
  border: 1px solid ${Colors.dark.border};
  border-radius: 20px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    border-color: ${Colors.primary};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${props => props.color || Colors.primary} 0%, ${props => props.colorEnd || Colors.primaryDark} 100%);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

const StatusBadge = styled.span`
  background: ${props => {
    switch(props.status) {
      case 'active': return Colors.success;
      case 'trial': return Colors.info;
      case 'suspended': return Colors.warning;
      case 'cancelled': case 'deleted': return Colors.danger;
      default: return Colors.dark.text.muted;
    }
  }};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const MetricValue = styled.div`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, ${Colors.dark.text.primary} 0%, ${Colors.dark.text.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const MetricLabel = styled.div`
  color: ${Colors.dark.text.secondary};
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

// ─── Tenant List Styles ──────────────────────────────────────────────
const TenantTableContainer = styled.div`
  background: ${Colors.dark.card};
  border: 1px solid ${Colors.dark.border};
  border-radius: 20px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid ${Colors.dark.border};
  
  h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
  }
  
  .search-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: ${Colors.dark.bg};
    border: 1px solid ${Colors.dark.border};
    border-radius: 10px;
    padding: 0.5rem 1rem;
    
    input {
      background: transparent;
      border: none;
      color: ${Colors.dark.text.primary};
      font-size: 0.9rem;
      outline: none;
      width: 200px;
      
      &::placeholder {
        color: ${Colors.dark.text.muted};
      }
    }
  }
`;

const TenantRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.5fr;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${Colors.dark.border};
  transition: all 0.3s ease;
  animation: ${slideIn} 0.3s ease-out;
  animation-delay: ${props => props.delay || '0s'};
  
  &:hover {
    background: rgba(59, 130, 246, 0.05);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
`;

const TenantName = styled.div`
  .name {
    font-weight: 700;
    font-size: 1rem;
    color: ${Colors.dark.text.primary};
  }
  
  .email {
    color: ${Colors.dark.text.muted};
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }
  
  .location {
    color: ${Colors.dark.text.secondary};
    font-size: 0.8rem;
    margin-top: 0.15rem;
  }
`;

const TenantStat = styled.div`
  text-align: center;
  
  .stat-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${Colors.primary};
  }
  
  .stat-label {
    font-size: 0.75rem;
    color: ${Colors.dark.text.muted};
    margin-top: 0.25rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  ${props => props.variant === 'suspend' && `
    background: ${Colors.warning};
    color: white;
    &:hover:not(:disabled) { background: #D97706; transform: translateY(-1px); }
  `}
  
  ${props => props.variant === 'activate' && `
    background: ${Colors.success};
    color: white;
    &:hover:not(:disabled) { background: #059669; transform: translateY(-1px); }
  `}
  
  ${props => props.variant === 'stop' && `
    background: ${Colors.danger};
    color: white;
    &:hover:not(:disabled) { background: #DC2626; transform: translateY(-1px); }
  `}
  
  ${props => props.variant === 'view' && `
    background: ${Colors.primary};
    color: white;
    &:hover:not(:disabled) { background: ${Colors.primaryDark}; transform: translateY(-1px); }
  `}
`;

// ─── Detail Modal ────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${Colors.dark.card};
  border: 1px solid ${Colors.dark.border};
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 2rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${Colors.dark.border};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${Colors.primary};
    border-radius: 3px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }
  
  .close-btn {
    background: ${Colors.danger};
    color: white;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  
  .label {
    color: ${Colors.dark.text.muted};
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
  }
  
  .value {
    color: ${Colors.dark.text.primary};
    font-weight: 600;
    font-size: 1.1rem;
  }
`;

// ─── Loading & Empty States ──────────────────────────────────────────
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  flex-direction: column;
  gap: 1rem;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid ${Colors.primary};
  borderTop: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: ${Colors.dark.text.secondary};
`;

const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return 'KES 0';
  return `KES ${new Intl.NumberFormat().format(Math.round(amount))}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ─── Main Component ──────────────────────────────────────────────────
const PerformanceDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [toast, setToast] = useState(null);

  // ─── Show toast notification ──────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ─── Fetch dashboard stats ────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/restpoint/system-admin/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  }, []);

  // ─── Fetch all tenants ────────────────────────────────────────────
  const fetchTenants = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/restpoint/system-admin/tenants');
      if (response.data.success) {
        setTenants(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  }, []);

  // ─── Initial data load ────────────────────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchTenants()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchDashboard, fetchTenants]);

  // ─── Auto-refresh ─────────────────────────────────────────────────
  useEffect(() => {
    if (isAutoRefresh) {
      const interval = setInterval(() => {
        fetchDashboard();
        fetchTenants();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh, fetchDashboard, fetchTenants]);

  // ─── Suspend tenant ───────────────────────────────────────────────
  const handleSuspend = async (tenantId, tenantName) => {
    if (!window.confirm(`Are you sure you want to SUSPEND "${tenantName}"? All users will be deactivated.`)) return;
    
    setActionLoading(tenantId);
    try {
      const response = await api.post(`/api/v1/restpoint/system-admin/tenants/${tenantId}/suspend`);
      if (response.data.success) {
        showToast(`"${tenantName}" has been suspended`, 'warning');
        await Promise.all([fetchDashboard(), fetchTenants()]);
      }
    } catch (error) {
      showToast('Failed to suspend tenant', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Activate tenant ──────────────────────────────────────────────
  const handleActivate = async (tenantId, tenantName) => {
    if (!window.confirm(`Activate "${tenantName}"? All users will be re-enabled.`)) return;
    
    setActionLoading(tenantId);
    try {
      const response = await api.post(`/api/v1/restpoint/system-admin/tenants/${tenantId}/activate`);
      if (response.data.success) {
        showToast(`"${tenantName}" has been activated`, 'success');
        await Promise.all([fetchDashboard(), fetchTenants()]);
      }
    } catch (error) {
      showToast('Failed to activate tenant', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Stop (soft-delete) tenant ────────────────────────────────────
  const handleStop = async (tenantId, tenantName) => {
    if (!window.confirm(`⚠️ WARNING: This will STOP "${tenantName}" entirely. This is a soft-delete. Continue?`)) return;
    
    setActionLoading(tenantId);
    try {
      const response = await api.post(`/api/v1/restpoint/system-admin/tenants/${tenantId}/stop`);
      if (response.data.success) {
        showToast(`"${tenantName}" has been stopped`, 'error');
        await Promise.all([fetchDashboard(), fetchTenants()]);
      }
    } catch (error) {
      showToast('Failed to stop tenant', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ─── View tenant details ──────────────────────────────────────────
  const handleViewDetails = async (tenantId) => {
    try {
      const response = await api.get(`/api/v1/restpoint/system-admin/tenants/${tenantId}`);
      if (response.data.success) {
        setDetailModal(response.data.data);
      }
    } catch (error) {
      showToast('Failed to load tenant details', 'error');
    }
  };

  // ─── Filter tenants ───────────────────────────────────────────────
  const filteredTenants = tenants.filter(t => {
    const term = searchTerm.toLowerCase();
    return (
      t.tenant_name?.toLowerCase().includes(term) ||
      t.email?.toLowerCase().includes(term) ||
      t.country?.toLowerCase().includes(term) ||
      t.status?.toLowerCase().includes(term)
    );
  });

  // ─── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardContainer>
        <LoadingContainer>
          <Spinner />
          <p style={{ color: Colors.dark.text.secondary }}>Loading System Admin Dashboard...</p>
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  const { overview, subscriptions } = dashboardData || {};

  return (
    <DashboardContainer>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 2000,
          padding: '1rem 2rem',
          borderRadius: '12px',
          background: toast.type === 'success' ? Colors.success : toast.type === 'warning' ? Colors.warning : Colors.danger,
          color: 'white',
          fontWeight: 600,
          animation: 'fadeIn 0.3s ease-out',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <DashboardHeader>
        <HeaderLeft>
          <h1>🚀 System Administrator</h1>
          <p className="last-update">
            Last updated: {new Date().toLocaleTimeString()}
            {overview && ` • ${overview.totalTenants} tenants total`}
          </p>
        </HeaderLeft>
        
        <HeaderControls>
          <RefreshToggle 
            active={isAutoRefresh}
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
          >
            🔄 Auto-refresh: {isAutoRefresh ? 'ON' : 'OFF'}
          </RefreshToggle>
          <RefreshButton onClick={() => { setLoading(true); Promise.all([fetchDashboard(), fetchTenants()]).then(() => setLoading(false)); }}>
            ↻ Refresh Now
          </RefreshButton>
        </HeaderControls>
      </DashboardHeader>

      {/* Tabs */}
      <DashboardTabs>
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          📊 Overview
        </TabButton>
        <TabButton active={activeTab === 'tenants'} onClick={() => setActiveTab('tenants')}>
          🏢 All Tenants
          {tenants.length > 0 && <span className="tab-badge">{tenants.length}</span>}
        </TabButton>
        <TabButton active={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')}>
          💳 Subscriptions
        </TabButton>
        <TabButton active={activeTab === 'earnings'} onClick={() => setActiveTab('earnings')}>
          💰 Earnings
        </TabButton>
      </DashboardTabs>

      {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
      {activeTab === 'overview' && overview && (
        <TabContent>
          <OverviewGrid>
            <MetricCard color={Colors.primary} colorEnd={Colors.primaryDark}>
              <CardHeader>
                <h3>🏢 Total Tenants</h3>
                <StatusBadge status="active">LIVE</StatusBadge>
              </CardHeader>
              <MetricValue>{overview.totalTenants}</MetricValue>
              <MetricLabel>All registered organizations</MetricLabel>
            </MetricCard>

            <MetricCard color={Colors.success} colorEnd="#059669">
              <CardHeader>
                <h3>✅ Active Tenants</h3>
                <StatusBadge status="active">ACTIVE</StatusBadge>
              </CardHeader>
              <MetricValue>{overview.activeTenants}</MetricValue>
              <MetricLabel>Currently running</MetricLabel>
            </MetricCard>

            <MetricCard color={Colors.warning} colorEnd="#D97706">
              <CardHeader>
                <h3>⚠️ Suspended</h3>
                <StatusBadge status="suspended">SUSPENDED</StatusBadge>
              </CardHeader>
              <MetricValue>{overview.suspendedTenants}</MetricValue>
              <MetricLabel>Temporarily stopped</MetricLabel>
            </MetricCard>

            <MetricCard color={Colors.info} colorEnd="#0891B2">
              <CardHeader>
                <h3>👥 Total Users</h3>
                <StatusBadge status="trial">ALL</StatusBadge>
              </CardHeader>
              <MetricValue>{overview.totalUsers}</MetricValue>
              <MetricLabel>Across all tenants</MetricLabel>
            </MetricCard>

            <MetricCard color={Colors.secondary} colorEnd="#7C3AED">
              <CardHeader>
                <h3>⚰️ Total Deceased</h3>
                <StatusBadge status="trial">RECORDS</StatusBadge>
              </CardHeader>
              <MetricValue>{overview.totalDeceased}</MetricValue>
              <MetricLabel>Records managed</MetricLabel>
            </MetricCard>

            <MetricCard color={Colors.danger} colorEnd="#DC2626">
              <CardHeader>
                <h3>💰 Total Revenue</h3>
                <StatusBadge status="active">EARNINGS</StatusBadge>
              </CardHeader>
              <MetricValue style={{ fontSize: '2rem' }}>{formatCurrency(overview.totalRevenue)}</MetricValue>
              <MetricLabel>Platform-wide revenue</MetricLabel>
            </MetricCard>
          </OverviewGrid>

          {/* Subscription breakdown */}
          {subscriptions && (
            <div style={{ 
              background: Colors.dark.card, 
              borderRadius: '20px', 
              padding: '2rem',
              border: `1px solid ${Colors.dark.border}`,
              marginBottom: '2rem'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>💳 Subscription Breakdown</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: Colors.success }}>{subscriptions.active}</div>
                  <div style={{ color: Colors.dark.text.secondary }}>Active</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: Colors.info }}>{subscriptions.trial}</div>
                  <div style={{ color: Colors.dark.text.secondary }}>Trial</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: Colors.warning }}>{subscriptions.suspended}</div>
                  <div style={{ color: Colors.dark.text.secondary }}>Suspended</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: Colors.danger }}>{subscriptions.cancelled}</div>
                  <div style={{ color: Colors.dark.text.secondary }}>Cancelled</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent tenants */}
          {dashboardData?.recentTenants && (
            <div style={{ 
              background: Colors.dark.card, 
              borderRadius: '20px', 
              padding: '2rem',
              border: `1px solid ${Colors.dark.border}`
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>🕐 Recent Tenants</h3>
              {dashboardData.recentTenants.map((t, i) => (
                <div key={t.tenant_id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: i < dashboardData.recentTenants.length - 1 ? `1px solid ${Colors.dark.border}` : 'none',
                  animation: `${slideIn} 0.3s ease-out`,
                  animationDelay: `${i * 0.05}s`,
                }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.tenant_name}</div>
                    <div style={{ color: Colors.dark.text.muted, fontSize: '0.85rem' }}>{t.email}</div>
                  </div>
                  <StatusBadge status={t.status}>{t.status}</StatusBadge>
                </div>
              ))}
            </div>
          )}
        </TabContent>
      )}

      {/* ═══════════════ TENANTS TAB ═══════════════ */}
      {activeTab === 'tenants' && (
        <TabContent>
          <TenantTableContainer>
            <TableHeader>
              <h3>🏢 All Tenants ({filteredTenants.length})</h3>
              <div className="search-box">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </TableHeader>
            
            {/* Column headers */}
            <TenantRow style={{ 
              borderBottom: `2px solid ${Colors.dark.border}`,
              fontWeight: 700,
              fontSize: '0.85rem',
              color: Colors.dark.text.muted,
              textTransform: 'uppercase',
            }}>
              <div>Tenant</div>
              <div style={{ textAlign: 'center' }}>Users</div>
              <div style={{ textAlign: 'center' }}>Deceased</div>
              <div style={{ textAlign: 'center' }}>Status</div>
              <div style={{ textAlign: 'center' }}>Subscription</div>
              <div style={{ textAlign: 'center' }}>Actions</div>
            </TenantRow>

            {filteredTenants.length === 0 ? (
              <EmptyState>
                <h3>No tenants found</h3>
                <p>{searchTerm ? 'Try a different search term' : 'No tenants registered yet'}</p>
              </EmptyState>
            ) : (
              filteredTenants.map((tenant, index) => (
                <TenantRow key={tenant.tenant_id} delay={`${index * 0.03}s`}>
                  <TenantName>
                    <div className="name">{tenant.tenant_name}</div>
                    <div className="email">{tenant.email}</div>
                    <div className="location">📍 {tenant.country || 'Unknown'} • Created {formatDate(tenant.created_at)}</div>
                  </TenantName>
                  
                  <TenantStat>
                    <div className="stat-value">{tenant.stats?.totalUsers || 0}</div>
                    <div className="stat-label">Users</div>
                  </TenantStat>
                  
                  <TenantStat>
                    <div className="stat-value">{tenant.stats?.totalDeceased || 0}</div>
                    <div className="stat-label">Records</div>
                  </TenantStat>
                  
                  <div style={{ textAlign: 'center' }}>
                    <StatusBadge status={tenant.status}>{tenant.status}</StatusBadge>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <StatusBadge status={tenant.subscription_status}>{tenant.subscription_status}</StatusBadge>
                  </div>
                  
                  <ActionButtons>
                    <ActionBtn variant="view" onClick={() => handleViewDetails(tenant.tenant_id)}>
                      👁️ View
                    </ActionBtn>
                    
                    {(tenant.status === 'active' || tenant.subscription_status === 'active' || tenant.subscription_status === 'trial') ? (
                      <ActionBtn 
                        variant="suspend" 
                        onClick={() => handleSuspend(tenant.tenant_id, tenant.tenant_name)}
                        disabled={actionLoading === tenant.tenant_id}
                      >
                        ⏸️ Suspend
                      </ActionBtn>
                    ) : (
                      <ActionBtn 
                        variant="activate" 
                        onClick={() => handleActivate(tenant.tenant_id, tenant.tenant_name)}
                        disabled={actionLoading === tenant.tenant_id}
                      >
                        ▶️ Activate
                      </ActionBtn>
                    )}
                    
                    <ActionBtn 
                      variant="stop" 
                      onClick={() => handleStop(tenant.tenant_id, tenant.tenant_name)}
                      disabled={actionLoading === tenant.tenant_id || tenant.status === 'deleted'}
                    >
                      🛑 Stop
                    </ActionBtn>
                  </ActionButtons>
                </TenantRow>
              ))
            )}
          </TenantTableContainer>
        </TabContent>
      )}

      {/* ═══════════════ SUBSCRIPTIONS TAB ═══════════════ */}
      {activeTab === 'subscriptions' && (
        <TabContent>
          <div style={{ 
            background: Colors.dark.card, 
            borderRadius: '20px', 
            padding: '2rem',
            border: `1px solid ${Colors.dark.border}`
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>💳 Subscription Management</h3>
            
            {tenants.length === 0 ? (
              <EmptyState><h3>No tenants found</h3></EmptyState>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tenants.map((tenant, index) => (
                  <div key={tenant.tenant_id} style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    alignItems: 'center',
                    padding: '1rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    border: `1px solid ${Colors.dark.border}`,
                    animation: `${slideIn} 0.3s ease-out`,
                    animationDelay: `${index * 0.03}s`,
                    '@media (max-width: 768px)': {
                      gridTemplateColumns: '1fr',
                    }
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{tenant.tenant_name}</div>
                      <div style={{ color: Colors.dark.text.muted, fontSize: '0.85rem' }}>{tenant.email}</div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <StatusBadge status={tenant.subscription_status}>{tenant.subscription_status}</StatusBadge>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: Colors.dark.text.secondary, fontSize: '0.8rem' }}>Expires</div>
                      <div style={{ fontWeight: 600 }}>{formatDate(tenant.subscription_expires_at)}</div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: Colors.dark.text.secondary, fontSize: '0.8rem' }}>Revenue</div>
                      <div style={{ fontWeight: 600, color: Colors.success }}>
                        {formatCurrency(tenant.stats?.totalRevenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabContent>
      )}

      {/* ═══════════════ EARNINGS TAB ═══════════════ */}
      {activeTab === 'earnings' && (
        <TabContent>
          <OverviewGrid>
            <MetricCard color={Colors.success} colorEnd="#059669">
              <CardHeader>
                <h3>💰 Total Platform Revenue</h3>
              </CardHeader>
              <MetricValue style={{ fontSize: '2rem' }}>{formatCurrency(overview?.totalRevenue || 0)}</MetricValue>
              <MetricLabel>Across all tenants</MetricLabel>
            </MetricCard>
            
            <MetricCard color={Colors.primary} colorEnd={Colors.primaryDark}>
              <CardHeader>
                <h3>📊 Average per Tenant</h3>
              </CardHeader>
              <MetricValue style={{ fontSize: '2rem' }}>
                {formatCurrency(overview?.activeTenants ? (overview.totalRevenue / overview.activeTenants) : 0)}
              </MetricValue>
              <MetricLabel>Active tenant average</MetricLabel>
            </MetricCard>
          </OverviewGrid>

          <div style={{ 
            background: Colors.dark.card, 
            borderRadius: '20px', 
            padding: '2rem',
            border: `1px solid ${Colors.dark.border}`
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>💰 Revenue by Tenant</h3>
            
            {tenants.filter(t => t.status !== 'deleted').length === 0 ? (
              <EmptyState><h3>No active tenants</h3></EmptyState>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tenants
                  .filter(t => t.status !== 'deleted')
                  .sort((a, b) => (b.stats?.totalRevenue || 0) - (a.stats?.totalRevenue || 0))
                  .map((tenant, index) => {
                    const revenue = tenant.stats?.totalRevenue || 0;
                    const maxRevenue = Math.max(...tenants.map(t => t.stats?.totalRevenue || 0), 1);
                    const barWidth = (revenue / maxRevenue) * 100;
                    
                    return (
                      <div key={tenant.tenant_id} style={{
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        animation: `${slideIn} 0.3s ease-out`,
                        animationDelay: `${index * 0.03}s`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <div>
                            <span style={{ fontWeight: 700 }}>{tenant.tenant_name}</span>
                            <span style={{ color: Colors.dark.text.muted, marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                              ({tenant.stats?.totalUsers || 0} users, {tenant.stats?.totalDeceased || 0} records)
                            </span>
                          </div>
                          <span style={{ fontWeight: 700, color: Colors.success, fontSize: '1.1rem' }}>
                            {formatCurrency(revenue)}
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: Colors.dark.border,
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${barWidth}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${Colors.success} 0%, ${Colors.primary} 100%)`,
                            borderRadius: '4px',
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </TabContent>
      )}

      {/* ═══════════════ DETAIL MODAL ═══════════════ */}
      {detailModal && (
        <ModalOverlay onClick={() => setDetailModal(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>🏢 {detailModal.tenant_name}</h2>
              <button className="close-btn" onClick={() => setDetailModal(null)}>✕</button>
            </ModalHeader>
            
            <DetailGrid>
              <DetailItem>
                <div className="label">Email</div>
                <div className="value">{detailModal.email}</div>
              </DetailItem>
              <DetailItem>
                <div className="label">Phone</div>
                <div className="value">{detailModal.phone || 'N/A'}</div>
              </DetailItem>
              <DetailItem>
                <div className="label">Location</div>
                <div className="value">{detailModal.location || 'N/A'}</div>
              </DetailItem>
              <DetailItem>
                <div className="label">Country</div>
                <div className="value">{detailModal.country || 'N/A'}</div>
              </DetailItem>
              <DetailItem>
                <div className="label">Status</div>
                <div className="value"><StatusBadge status={detailModal.status}>{detailModal.status}</StatusBadge></div>
              </DetailItem>
              <DetailItem>
                <div className="label">Subscription</div>
                <div className="value"><StatusBadge status={detailModal.subscription_status}>{detailModal.subscription_status}</StatusBadge></div>
              </DetailItem>
              <DetailItem>
                <div className="label">Created</div>
                <div className="value">{formatDate(detailModal.created_at)}</div>
              </DetailItem>
              <DetailItem>
                <div className="label">Database</div>
                <div className="value" style={{ fontSize: '0.85rem' }}>{detailModal.db_name}</div>
              </DetailItem>
            </DetailGrid>

            {/* Stats */}
            {detailModal.stats && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>📊 Statistics</h3>
                <DetailGrid>
                  <DetailItem>
                    <div className="label">Total Users</div>
                    <div className="value">{detailModal.stats.users?.length || 0}</div>
                  </DetailItem>
                  <DetailItem>
                    <div className="label">Total Deceased Records</div>
                    <div className="value">{detailModal.stats.totalDeceased}</div>
                  </DetailItem>
                  <DetailItem>
                    <div className="label">Total Branches</div>
                    <div className="value">{detailModal.stats.branches?.length || 0}</div>
                  </DetailItem>
                  <DetailItem>
                    <div className="label">Total Revenue</div>
                    <div className="value" style={{ color: Colors.success }}>{formatCurrency(detailModal.stats.totalRevenue)}</div>
                  </DetailItem>
                </DetailGrid>
              </div>
            )}

            {/* Users list */}
            {detailModal.stats?.users?.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>👥 Users</h3>
                {detailModal.stats.users.map((user, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: `1px solid ${Colors.dark.border}`,
                  }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{user.full_name}</span>
                      <span style={{ color: Colors.dark.text.muted, marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                        {user.email}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem',
                        background: user.role === 'admin' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        color: user.role === 'admin' ? Colors.secondary : Colors.primary,
                        fontWeight: 600,
                      }}>
                        {user.role}
                      </span>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: user.is_active ? Colors.success : Colors.danger,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </DashboardContainer>
  );
};

export default PerformanceDashboard;