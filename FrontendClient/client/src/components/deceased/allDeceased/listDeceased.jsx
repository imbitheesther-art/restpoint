import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Filter,
  Download,
  QrCode,
  MoreVertical,
  ChevronDown,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import styled, { keyframes } from 'styled-components';
import ExportModal from '../ExportModal';

const API_GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_GATEWAY_URL}`;

// Bootstrap-inspired color scheme
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

const slideInRight = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
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

const Title = styled.h1`
  font-size: 1.375rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: ${COLORS.text};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  background: ${COLORS.primary};
  color: ${COLORS.white};
  border: none;
  border-radius: ${COLORS.radiusSm};
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
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
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  transition: ${COLORS.transition};

  &:hover {
    background: ${COLORS.bg};
    border-color: ${COLORS.textSecondary};
  }
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
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
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${COLORS.bg};
  flex-wrap: wrap;
  gap: 0.75rem;
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
  padding: 1.25rem;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  font-size: 0.8125rem;
  color: ${COLORS.text};
  background: ${COLORS.surface};
  min-width: 250px;
  transition: ${COLORS.transition};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.accentGlow || 'rgba(59, 130, 246, 0.1)'};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
`;

const TableHead = styled.thead`
  background: ${COLORS.bg};
  border-bottom: 1px solid ${COLORS.border};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${COLORS.border};
  transition: ${COLORS.transition};

  &:hover {
    background: ${COLORS.bg};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 0.875rem 1rem;
  color: ${COLORS.text};
  vertical-align: middle;
`;

const TableHeader = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: ${COLORS.textSecondary};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.$variant) {
      case 'success': return COLORS.successLight;
      case 'warning': return COLORS.warningLight;
      case 'danger': return COLORS.dangerLight;
      case 'info': return COLORS.infoLight;
      default: return COLORS.borderLight;
    }
  }};
  color: ${props => {
    switch (props.$variant) {
      case 'success': return COLORS.successDark;
      case 'warning': return COLORS.warningDark;
      case 'danger': return COLORS.dangerDark;
      case 'info': return COLORS.infoDark;
      default: return COLORS.textSecondary;
    }
  }};
`;

const ActionIconButton = styled.button`
  background: transparent;
  border: none;
  color: ${COLORS.textSecondary};
  cursor: pointer;
  padding: 0.375rem;
  border-radius: ${COLORS.radiusXs};
  transition: ${COLORS.transition};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${COLORS.border};
    color: ${props => props.$danger ? COLORS.danger : COLORS.primary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: ${COLORS.textSecondary};

  svg {
    width: 3rem;
    height: 3rem;
    margin-bottom: 1rem;
    opacity: 0.4;
  }

  h4 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
    color: ${COLORS.text};
  }

  p {
    font-size: 0.8125rem;
    margin: 0;
    color: ${COLORS.textSecondary};
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
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

const DeceasedList = () => {
  const [deceasedList, setDeceasedList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchDeceasedList = useCallback(async () => {
    try {
      setIsLoading(true);
      const tenantSlug = getTenantSlug();
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      const response = await axios.get(`${BASE_URL}/deceased/deceased-all`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-tenant-slug': tenantSlug,
        },
      });

      const data = response.data?.data || response.data || [];
      setDeceasedList(data);
      setFilteredList(data);
    } catch (error) {
      console.error('Error fetching deceased list:', error);
      setDeceasedList([]);
      setFilteredList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeceasedList();
  }, [fetchDeceasedList]);

  useEffect(() => {
    let filtered = deceasedList;

    if (searchTerm) {
      filtered = filtered.filter(deceased =>
        deceased.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deceased.deceased_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(deceased => deceased.status === statusFilter);
    }

    setFilteredList(filtered);
  }, [searchTerm, statusFilter, deceasedList]);

  const handleExport = async (exportOptions) => {
    setIsExporting(true);
    try {
      const tenantSlug = getTenantSlug();
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      // Build query parameters
      const params = new URLSearchParams();
      if (exportOptions.startDate) params.append('startDate', exportOptions.startDate);
      if (exportOptions.endDate) params.append('endDate', exportOptions.endDate);
      if (exportOptions.format) params.append('format', exportOptions.format);
      if (exportOptions.columns && exportOptions.columns.length > 0) {
        params.append('columns', exportOptions.columns.join(','));
      }
      if (exportOptions.includeFilters) {
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
      }

      const response = await axios.get(`${BASE_URL}/deceased/export?${params.toString()}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-tenant-slug': tenantSlug,
        },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `deceased_report_${new Date().toISOString().split('T')[0]}.${exportOptions.format || 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      const tenantSlug = getTenantSlug();
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      await axios.delete(`${BASE_URL}/deceased/${id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-tenant-slug': tenantSlug,
        },
      });

      setDeceasedList(prev => prev.filter(item => item.deceased_id !== id && item.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting deceased:', error);
      alert('Failed to delete record');
    }
  };

  const getDaysInMortuary = (admissionDate) => {
    if (!admissionDate) return 0;
    const admitted = new Date(admissionDate);
    const today = new Date();
    const diffTime = today - admitted;
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const openDrawer = (record) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRecord(null);
  };

  if (isLoading) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <Title>
              <User size={24} />
              Deceased Records
            </Title>
          </HeaderContent>
        </Header>
        <LoadingOverlay>
          <RefreshCw size={32} color={COLORS.primary} className="animate-spin" />
        </LoadingOverlay>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>
            <User size={24} />
            Deceased Records
          </Title>
          <HeaderActions>
            <SecondaryButton onClick={fetchDeceasedList}>
              <RefreshCw size={15} /> Refresh
            </SecondaryButton>
            <SecondaryButton onClick={() => setShowExportModal(true)}>
              <FileSpreadsheet size={15} /> Export
            </SecondaryButton>
            <PrimaryButton as={Link} to="/deceased/new">
              <Plus size={15} /> New Record
            </PrimaryButton>
          </HeaderActions>
        </HeaderContent>
      </Header>

      <MainContent>
        <Card>
          <CardHeader>
            <CardTitle>
              <Filter size={16} />
              Filters & Search
            </CardTitle>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <SearchInput
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid ' + COLORS.border,
                  borderRadius: COLORS.radiusSm,
                  fontSize: '0.8125rem',
                  color: COLORS.text,
                  background: COLORS.surface,
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="released">Released</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>
          </CardHeader>

          <CardBody>
            {filteredList.length === 0 ? (
              <EmptyState>
                <User size={48} />
                <h4>No deceased records found</h4>
                <p>Try adjusting your search or filters</p>
              </EmptyState>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>ID</TableHeader>
                      <TableHeader>Name</TableHeader>
                      <TableHeader>Date Admitted</TableHeader>
                      <TableHeader>Days in Mortuary</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Total Charges</TableHeader>
                      <TableHeader style={{ textAlign: 'right' }}>Actions</TableHeader>
                    </TableRow>
                  </TableHead>
                  <tbody>
                    {filteredList.map((deceased) => {
                      const daysInMortuary = getDaysInMortuary(deceased.date_admitted);
                      const isOverdue = daysInMortuary > 30;

                      return (
                        <TableRow key={deceased.deceased_id || deceased.id}>
                          <TableCell>
                            <div style={{ fontWeight: 500, fontSize: '0.75rem', color: COLORS.textSecondary }}>
                              {deceased.deceased_id || deceased.id || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div style={{ fontWeight: 500 }}>{deceased.full_name || 'Unknown'}</div>
                            {deceased.burial_type && (
                              <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary, marginTop: '0.125rem' }}>
                                {deceased.burial_type}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {deceased.date_admitted ? new Date(deceased.date_admitted).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge $variant={isOverdue ? 'danger' : daysInMortuary > 14 ? 'warning' : 'success'}>
                              {isOverdue ? <AlertTriangle size={12} /> : <Clock size={12} />}
                              {daysInMortuary} days
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge $variant={
                              deceased.status === 'released' ? 'success' :
                                deceased.status === 'transferred' ? 'info' : 'warning'
                            }>
                              {deceased.status === 'active' && <Clock size={12} />}
                              {deceased.status === 'released' && <CheckCircle size={12} />}
                              {deceased.status || 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <strong>{deceased.total_mortuary_charge || 0} {deceased.currency || 'KES'}</strong>
                          </TableCell>
                          <TableCell>
                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                              <ActionIconButton
                                onClick={() => openDrawer(deceased)}
                                title="View Details"
                              >
                                <Eye size={16} />
                              </ActionIconButton>
                              <ActionIconButton
                                as={Link}
                                to={`/deceased/${deceased.deceased_id || deceased.id}/edit`}
                                title="Edit"
                              >
                                <Edit size={16} />
                              </ActionIconButton>
                              <ActionIconButton
                                onClick={() => handleDelete(deceased.deceased_id || deceased.id)}
                                title="Delete"
                                $danger
                              >
                                <Trash2 size={16} />
                              </ActionIconButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>
      </MainContent>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          isExporting={isExporting}
          filters={{
            search: searchTerm,
            status: statusFilter,
          }}
        />
      )}

      {/* Side Drawer Overlay */}
      {drawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            zIndex: 9998,
            animation: 'fadeIn 0.12s ease-out',
            backdropFilter: 'blur(3px)',
          }}
          onClick={closeDrawer}
        />
      )}

      {/* Side Drawer */}
      {drawerOpen && selectedRecord && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '480px',
            maxWidth: '100%',
            background: COLORS.surface,
            boxShadow: COLORS.shadowLg,
            zIndex: 9999,
            transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInRight 0.3s ease',
          }}
        >
          {/* Drawer Header */}
          <div style={{
            padding: '1.25rem',
            borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: COLORS.bg,
          }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, color: COLORS.text }}>
                Deceased Details
              </h2>
              <p style={{ fontSize: '0.8125rem', color: COLORS.textSecondary, margin: '0.25rem 0 0' }}>
                {selectedRecord.deceased_id || selectedRecord.id || 'N/A'}
              </p>
            </div>
            <button
              onClick={closeDrawer}
              style={{
                background: 'transparent',
                border: 'none',
                color: COLORS.textSecondary,
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
            {/* Basic Information */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: COLORS.textSecondary, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Basic Information
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: COLORS.bg, borderRadius: '0.375rem', border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                    Full Name
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: COLORS.text }}>
                    {selectedRecord.full_name || 'Unknown'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: COLORS.bg, borderRadius: '0.375rem', border: `1px solid ${COLORS.border}` }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                      Date Admitted
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: COLORS.text }}>
                      {selectedRecord.date_admitted ? new Date(selectedRecord.date_admitted).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', background: COLORS.bg, borderRadius: '0.375rem', border: `1px solid ${COLORS.border}` }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                      Days in Mortuary
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: COLORS.text }}>
                      {getDaysInMortuary(selectedRecord.date_admitted)} days
                    </div>
                  </div>
                </div>

                {selectedRecord.burial_type && (
                  <div style={{ padding: '0.75rem', background: COLORS.bg, borderRadius: '0.375rem', border: `1px solid ${COLORS.border}` }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                      Burial Type
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: COLORS.text }}>
                      {selectedRecord.burial_type}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status and Charges */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: COLORS.textSecondary, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Status & Charges
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: COLORS.bg, borderRadius: '0.375rem', border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                    Status
                  </div>
                  <Badge $variant={
                    selectedRecord.status === 'released' ? 'success' :
                      selectedRecord.status === 'transferred' ? 'info' : 'warning'
                  }>
                    {selectedRecord.status === 'active' && <Clock size={12} />}
                    {selectedRecord.status === 'released' && <CheckCircle size={12} />}
                    {selectedRecord.status || 'Active'}
                  </Badge>
                </div>

                <div style={{ padding: '0.75rem', background: COLORS.bg, borderRadius: '0.375rem', border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                    Total Charges
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600, color: COLORS.text }}>
                    {selectedRecord.total_mortuary_charge || 0} {selectedRecord.currency || 'KES'}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(selectedRecord.cause_of_death || selectedRecord.notes) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: COLORS.textSecondary, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Additional Information
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {selectedRecord.cause_of_death && (
                    <div style={{ padding: '0.75rem', background: COLORS.bg, borderRadius: '0.375rem', border: `1px solid ${COLORS.border}` }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                        Cause of Death
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: COLORS.text }}>
                        {selectedRecord.cause_of_death}
                      </div>
                    </div>
                  )}

                  {selectedRecord.notes && (
                    <div style={{ padding: '0.75rem', background: '#fffbeb', borderRadius: '0.375rem', border: '1px solid #fde68a' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                        Notes
                      </div>
                      <div style={{ fontSize: '0.875rem', color: COLORS.text, lineHeight: '1.5' }}>
                        {selectedRecord.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div style={{
            padding: '1rem 1.25rem',
            borderTop: `1px solid ${COLORS.border}`,
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => {
                closeDrawer();
                window.location.href = `/deceased/${selectedRecord.deceased_id || selectedRecord.id}`;
              }}
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                background: COLORS.primary,
                color: COLORS.white,
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
              }}
            >
              <Eye size={15} /> View Full Details
            </button>
            <button
              onClick={() => {
                closeDrawer();
                window.location.href = `/deceased/${selectedRecord.deceased_id || selectedRecord.id}/edit`;
              }}
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                background: COLORS.surface,
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '0.375rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
              }}
            >
              <Edit size={15} /> Edit
            </button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          isExporting={isExporting}
          filters={{
            search: searchTerm,
            status: statusFilter,
          }}
        />
      )}
    </Container>
  );
};

export default DeceasedList;