import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_GATEWAY_URL}/api/v1/restpoint`;

const COLORS = {
  primary: '#1a5f7a',
  primaryDark: '#134b5f',
  white: '#FFFFFF',
  bg: '#f5f7fa',
  surface: '#ffffff',
  border: '#d1d5db',
  text: '#111827',
  textSecondary: '#6b7280',
  success: '#10b981',
  successDark: '#059669',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  radius: '8px',
  radiusSm: '6px',
  shadowSm: '0 1px 2px rgba(0, 0, 0, 0.04)',
  shadowMd: '0 4px 6px rgba(0, 0, 0, 0.06)',
  shadowLg: '0 10px 15px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.15s ease',
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
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

const Subtitle = styled.p`
  color: ${COLORS.textSecondary};
  font-size: 0.8125rem;
  margin: 0.25rem 0 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${props => props.$bg || COLORS.primary};
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

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${COLORS.shadowMd};
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SummaryCard = styled.div`
  background: ${COLORS.surface};
  border-left: 4px solid ${props => props.$border || COLORS.primary};
  padding: 1.25rem;
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowSm};
  transition: ${COLORS.transition};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${COLORS.shadowMd};
  }

  .label {
    font-size: 0.75rem;
    color: ${COLORS.textSecondary};
    margin-bottom: 0.375rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .value {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${COLORS.text};
  }

  .subtext {
    font-size: 0.6875rem;
    color: ${COLORS.textSecondary};
    margin-top: 0.25rem;
  }
`;

const Card = styled.div`
  background: ${COLORS.surface};
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowSm};
  border: 1px solid ${COLORS.border};
  overflow: hidden;
  margin-bottom: 1.25rem;
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

const Badge = styled.span`
  background: ${props => props.$bg || COLORS.primary};
  color: ${COLORS.white};
  padding: 0.25rem 0.625rem;
  border-radius: 1rem;
  font-size: 0.6875rem;
  font-weight: 600;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;

  thead {
    background: ${props => props.$header || COLORS.primary};
    color: ${COLORS.white};

    th {
      padding: 0.625rem 0.75rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
  }

  tbody tr {
    border-bottom: 1px solid ${COLORS.border};
    transition: background 0.2s ease;

    &:hover {
      background: ${COLORS.bg};
    }

    td {
      padding: 0.625rem 0.75rem;
      color: ${COLORS.text};
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 600;
  background: ${props => {
    if (props.$status === 'paid') return '#D1FAE5';
    if (props.$status === 'partial') return '#FEF3C7';
    if (props.$status === 'pending' || props.$status === 'unpaid') return '#FEE2E2';
    return '#E5E7EB';
  }};
  color: ${props => {
    if (props.$status === 'paid') return '#065F46';
    if (props.$status === 'partial') return '#92400E';
    if (props.$status === 'pending' || props.$status === 'unpaid') return '#DC2626';
    return '#374151';
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: ${COLORS.textSecondary};

  .icon { font-size: 2.5rem; margin-bottom: 0.75rem; opacity: 0.5; }
  p { margin: 0.25rem 0; font-size: 0.875rem; }
  .subtext { font-size: 0.75rem; color: ${COLORS.textSecondary}; }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$color || COLORS.primary};
  cursor: pointer;
  padding: 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: 0.25rem;

  &:hover:not(:disabled) {
    background: ${props => props.$bg || COLORS.bg};
    transform: scale(1.1);
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }
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
  backdrop-filter: blur(3px);
`;

const ModalContent = styled.div`
  background: ${COLORS.surface};
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowLg};
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${COLORS.bg};

  h3 { margin: 0; font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
`;

const ModalBody = styled.div`
  padding: 1.25rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid ${COLORS.border};
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 600;
    color: ${COLORS.text};
    margin-bottom: 0.375rem;
  }
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border-radius: 0.5rem;
  border: 1px solid ${COLORS.border};
  font-size: 0.875rem;
  font-family: inherit;
  transition: ${COLORS.transition};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px rgba(26, 95, 122, 0.1);
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border-radius: 0.5rem;
  border: 1px solid ${COLORS.border};
  font-size: 0.875rem;
  font-family: inherit;
  background: ${COLORS.white};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px rgba(26, 95, 122, 0.1);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid ${props => props.$variant === 'primary' ? COLORS.primary : props.$variant === 'danger' ? COLORS.danger : COLORS.border};
  background: ${props => props.$variant === 'primary' ? COLORS.primary : props.$variant === 'danger' ? COLORS.danger : COLORS.white};
  color: ${props => (props.$variant === 'primary' || props.$variant === 'danger') ? COLORS.white : COLORS.text};
  cursor: pointer;
  transition: ${COLORS.transition};
  font-family: inherit;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${COLORS.shadowMd};
  }

  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  color: ${COLORS.textSecondary};
`;

const getTenantSlug = () => {
  return localStorage.getItem('tenantSlug') || localStorage.getItem('tenant_slug') || 'default';
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  const tenantSlug = getTenantSlug();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (tenantSlug && tenantSlug !== 'default') config.headers['x-tenant-slug'] = tenantSlug;
  return config;
});

const FinancialDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deceased, setDeceased] = useState(null);
  const [payments, setPayments] = useState([]);
  const [extraCharges, setExtraCharges] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [totals, setTotals] = useState({
    total_charges: 0, mortuary_charges: 0, extra_charges: 0,
    total_payments: 0, balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const tenantSlug = getTenantSlug();
      const headers = { 'x-tenant-slug': tenantSlug };

      const [deceasedRes, paymentsRes, chargesRes, invoicesRes] = await Promise.all([
        axios.get(`${BASE_URL}/deceased/${id}`, { headers }).catch(() => ({ data: { data: null } })),
        apiClient.get(`/invoices/payments/${id}`, { headers }).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/invoices/extra-charges/${id}`, { headers }).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/invoices/deceased/${id}`, { headers }).catch(() => ({ data: { data: [] } }))
      ]);

      const decData = deceasedRes.data?.data || deceasedRes.data || {};
      const payData = paymentsRes.data?.data || [];
      const chgData = chargesRes.data?.data || [];
      const invData = invoicesRes.data?.data || [];

      setDeceased(decData);
      setPayments(payData);
      setExtraCharges(chgData);
      setInvoices(invData);

      const mortuaryCharges = parseFloat(decData?.total_mortuary_charge || decData?.billing || 0);
      const extraChargesTotal = chgData.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
      const totalPayments = payData.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
      const totalCharges = mortuaryCharges + extraChargesTotal;

      setTotals({
        total_charges: totalCharges,
        mortuary_charges: mortuaryCharges,
        extra_charges: extraChargesTotal,
        total_payments: totalPayments,
        balance: totalCharges - totalPayments
      });
    } catch (err) {
      console.error('Error fetching financial data:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (icon, title) => {
    Swal.fire({ toast: true, position: 'top-end', icon, title, showConfirmButton: false, timer: 3000, timerProgressBar: true });
  };

  const handleRecordPayment = async (formData) => {
    setSubmitting(true);
    try {
      const response = await apiClient.post('/invoices/payment', {
        deceased_id: id,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        reference_code: formData.reference_code,
        description: formData.description
      });

      if (response.data?.status === 'success') {
        showToast('success', 'Payment recorded successfully!');
        setShowPaymentModal(false);
        fetchData();
      } else {
        throw new Error(response.data?.message || 'Failed to record payment');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCharge = async (formData) => {
    setSubmitting(true);
    try {
      const response = await apiClient.post('/invoices/extra-charge', {
        deceased_id: id,
        charge_type: formData.charge_type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        notes: formData.notes,
        service_date: formData.service_date
      });

      if (response.data?.status === 'success') {
        showToast('success', 'Extra charge added successfully!');
        setShowChargeModal(false);
        fetchData();
      } else {
        throw new Error(response.data?.message || 'Failed to add charge');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to add charge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCharge = async (chargeId) => {
    const result = await Swal.fire({
      title: 'Delete Extra Charge?',
      text: 'This will be permanently removed',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiClient.delete(`/invoices/extra-charge/${chargeId}`);
      if (response.data?.status === 'success' || response.data?.success) {
        showToast('success', 'Charge deleted successfully!');
        fetchData();
      } else {
        throw new Error('Failed to delete charge');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to delete charge');
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    const result = await Swal.fire({
      title: 'Delete Invoice?',
      text: 'This will be permanently removed',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiClient.delete(`/invoices/${invoiceId}`);
      if (response.data?.status === 'success') {
        showToast('success', 'Invoice deleted successfully!');
        fetchData();
      } else {
        throw new Error('Failed to delete invoice');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to delete invoice');
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await apiClient.get(`/invoices/${invoiceId}/download`, { responseType: 'blob' });
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
      showToast('success', 'Invoice downloaded!');
    } catch (err) {
      showToast('error', 'Failed to download invoice');
    }
  };

  const handlePrintInvoice = async (invoiceId) => {
    try {
      const response = await apiClient.get(`/invoices/${invoiceId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => setTimeout(() => printWindow.print(), 500);
      }
    } catch (err) {
      showToast('error', 'Failed to print invoice');
    }
  };

  // Payment Form Modal
  const PaymentModal = () => {
    const [form, setForm] = useState({
      amount: '', payment_method: 'Cash', reference_code: '', description: `Payment for ${deceased?.full_name || 'deceased'}`
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!form.amount || parseFloat(form.amount) <= 0) {
        showToast('error', 'Please enter a valid amount');
        return;
      }
      handleRecordPayment(form);
    };

    return (
      <ModalOverlay onClick={() => setShowPaymentModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <h3>💰 Record Payment</h3>
            <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
          </ModalHeader>
          <ModalBody>
            <div style={{ background: '#EFF6FF', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              <strong>Recording payment for:</strong> {deceased?.full_name || 'Unknown'} ({deceased?.deceased_id || id})
            </div>
            <form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup>
                  <label>Amount (KES) *</label>
                  <FormInput type="number" step="0.01" min="0" placeholder="0.00" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                </FormGroup>
                <FormGroup>
                  <label>Payment Method *</label>
                  <FormSelect value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                    <option value="Cash">Cash</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Card</option>
                  </FormSelect>
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <label>Reference Code</label>
                  <FormInput type="text" placeholder="Optional" value={form.reference_code}
                    onChange={(e) => setForm({ ...form, reference_code: e.target.value })} />
                </FormGroup>
                <FormGroup>
                  <label>Description</label>
                  <FormInput type="text" value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </FormGroup>
              </FormRow>
              <ModalFooter style={{ padding: '1rem 0 0', borderTop: `1px solid ${COLORS.border}`, marginTop: '1rem' }}>
                <Button type="button" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                <Button type="submit" $variant="primary" disabled={submitting}>
                  {submitting ? 'Recording...' : '💰 Record Payment'}
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  };

  // Extra Charge Form Modal
  const ChargeModal = () => {
    const [form, setForm] = useState({
      charge_type: '', amount: '', description: '', notes: '', service_date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!form.charge_type || !form.amount || parseFloat(form.amount) <= 0) {
        showToast('error', 'Please fill in all required fields');
        return;
      }
      handleAddCharge(form);
    };

    return (
      <ModalOverlay onClick={() => setShowChargeModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <h3>📋 Add Extra Charge</h3>
            <button onClick={() => setShowChargeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup>
                  <label>Charge Type *</label>
                  <FormInput type="text" placeholder="e.g., Transportation, Special Casket" value={form.charge_type}
                    onChange={(e) => setForm({ ...form, charge_type: e.target.value })} required />
                </FormGroup>
                <FormGroup>
                  <label>Amount (KES) *</label>
                  <FormInput type="number" step="0.01" min="0" placeholder="0.00" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <label>Service Date</label>
                  <FormInput type="date" value={form.service_date}
                    onChange={(e) => setForm({ ...form, service_date: e.target.value })} />
                </FormGroup>
                <FormGroup>
                  <label>Description</label>
                  <FormInput type="text" placeholder="Brief description" value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <label>Notes</label>
                <FormInput type="text" placeholder="Additional notes (optional)" value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </FormGroup>
              <ModalFooter style={{ padding: '1rem 0 0', borderTop: `1px solid ${COLORS.border}`, marginTop: '1rem' }}>
                <Button type="button" onClick={() => setShowChargeModal(false)}>Cancel</Button>
                <Button type="submit" $variant="primary" disabled={submitting}>
                  {submitting ? 'Adding...' : '📋 Add Charge'}
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading financial details...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <div>
            <Title>
              💰 Financial Details
              {deceased?.full_name && <span style={{ fontSize: '0.875rem', color: COLORS.textSecondary, fontWeight: 400 }}> - {deceased.full_name}</span>}
            </Title>
            <Subtitle>Ref: {deceased?.deceased_id || id} • Manage payments, charges, and invoices</Subtitle>
          </div>
          <HeaderActions>
            <ActionButton $bg={COLORS.successDark} onClick={() => setShowPaymentModal(true)}>
              💳 Record Payment
            </ActionButton>
            <ActionButton $bg={COLORS.warning} onClick={() => setShowChargeModal(true)}>
              📋 Add Charge
            </ActionButton>
            <BackButton onClick={() => navigate(-1)}>← Back</BackButton>
          </HeaderActions>
        </HeaderContent>
      </Header>

      <MainLayout>
        {/* Summary Cards */}
        <SummaryGrid>
          <SummaryCard $border={COLORS.primary}>
            <div className="label">Total Charges</div>
            <div className="value">KES {totals.total_charges.toLocaleString()}</div>
            <div className="subtext">Base: KES {totals.mortuary_charges.toLocaleString()} • Extra: KES {totals.extra_charges.toLocaleString()}</div>
          </SummaryCard>
          <SummaryCard $border={COLORS.successDark}>
            <div className="label">Total Payments</div>
            <div className="value">KES {totals.total_payments.toLocaleString()}</div>
            <div className="subtext">{payments.length} payment(s)</div>
          </SummaryCard>
          <SummaryCard $border={totals.balance > 0 ? COLORS.warning : COLORS.info}>
            <div className="label" style={{ color: totals.balance > 0 ? COLORS.warning : COLORS.info }}>
              {totals.balance > 0 ? 'Balance Due' : 'Fully Paid'}
            </div>
            <div className="value" style={{ color: totals.balance > 0 ? COLORS.danger : COLORS.successDark }}>
              KES {Math.abs(totals.balance).toLocaleString()}
            </div>
            <div className="subtext">{invoices.length} invoice(s)</div>
          </SummaryCard>
          <SummaryCard $border={COLORS.textSecondary}>
            <div className="label">Status</div>
            <div className="value">
              <StatusBadge $status={totals.balance > 0 ? 'pending' : 'paid'}>
                {totals.balance > 0 ? '⏳ Pending' : '✅ Paid'}
              </StatusBadge>
            </div>
            <div className="subtext">{extraCharges.length} extra charge(s)</div>
          </SummaryCard>
        </SummaryGrid>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>💳 Payment History</CardTitle>
            <Badge $bg={COLORS.successDark}>{payments.length} payments</Badge>
          </CardHeader>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {payments.length === 0 ? (
              <EmptyState>
                <div className="icon">💳</div>
                <p>No payments recorded</p>
                <p className="subtext">Click "Record Payment" to add one</p>
              </EmptyState>
            ) : (
              <Table $header={COLORS.successDark}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.payment_id || payment.id}>
                      <td>{new Date(payment.payment_date || payment.created_at).toLocaleDateString()}</td>
                      <td><strong style={{ color: COLORS.successDark }}>KES {parseFloat(payment.amount || 0).toLocaleString()}</strong></td>
                      <td><span style={{ background: '#E5E7EB', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.6875rem' }}>{payment.payment_method}</span></td>
                      <td style={{ color: COLORS.textSecondary, fontSize: '0.75rem' }}>{payment.reference_code || payment.reference_number || 'N/A'}</td>
                      <td style={{ fontSize: '0.75rem', color: COLORS.textSecondary }}>{payment.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </Card>

        {/* Extra Charges */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Extra Charges</CardTitle>
            <Badge $bg={COLORS.warning}>{extraCharges.length} charges</Badge>
          </CardHeader>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {extraCharges.length === 0 ? (
              <EmptyState>
                <div className="icon">📋</div>
                <p>No extra charges</p>
                <p className="subtext">Click "Add Charge" to add one</p>
              </EmptyState>
            ) : (
              <Table $header={COLORS.warning}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {extraCharges.map((charge) => (
                    <tr key={charge.id || charge.charge_id}>
                      <td><strong>{charge.charge_type}</strong></td>
                      <td><strong style={{ color: COLORS.warning }}>KES {parseFloat(charge.amount || 0).toLocaleString()}</strong></td>
                      <td>
                        <div>{charge.description}</div>
                        {charge.notes && <div style={{ fontSize: '0.6875rem', color: COLORS.textSecondary }}>{charge.notes}</div>}
                      </td>
                      <td style={{ fontSize: '0.75rem' }}>{new Date(charge.service_date || charge.created_at).toLocaleDateString()}</td>
                      <td>
                        <IconButton $color={COLORS.danger} onClick={() => handleDeleteCharge(charge.id || charge.charge_id)} title="Delete">
                          🗑️
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>🧾 Invoices</CardTitle>
            <Badge $bg={COLORS.primary}>{invoices.length} invoices</Badge>
          </CardHeader>
          <div style={{ overflowX: 'auto' }}>
            {invoices.length === 0 ? (
              <EmptyState>
                <div className="icon">🧾</div>
                <p>No invoices generated yet</p>
                <p className="subtext">Generate an invoice from the deceased profile</p>
              </EmptyState>
            ) : (
              <Table $header={COLORS.primary}>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id || invoice.invoice_id}>
                      <td><strong>{invoice.invoice_number}</strong></td>
                      <td style={{ fontSize: '0.75rem' }}>{new Date(invoice.created_at).toLocaleDateString()}</td>
                      <td><strong style={{ color: COLORS.info }}>KES {parseFloat(invoice.total_amount || 0).toLocaleString()}</strong></td>
                      <td>
                        <StatusBadge $status={invoice.payment_status || 'unpaid'}>
                          {invoice.payment_status || 'unpaid'}
                        </StatusBadge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <IconButton $color={COLORS.info} onClick={() => handleDownloadInvoice(invoice.id || invoice.invoice_id)} title="Download">
                            ⬇️
                          </IconButton>
                          <IconButton $color={COLORS.text} onClick={() => handlePrintInvoice(invoice.id || invoice.invoice_id)} title="Print">
                            🖨️
                          </IconButton>
                          <IconButton $color={COLORS.danger} onClick={() => handleDeleteInvoice(invoice.id || invoice.invoice_id)} title="Delete">
                            🗑️
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </Card>
      </MainLayout>

      {/* Modals */}
      {showPaymentModal && <PaymentModal />}
      {showChargeModal && <ChargeModal />}
    </Container>
  );
};

export default FinancialDetailsPage;
