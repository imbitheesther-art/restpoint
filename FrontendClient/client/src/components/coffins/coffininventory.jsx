import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled, { keyframes } from 'styled-components';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import env from '../../utils/config/env';
import { getTenantSlug } from '../../utils/globalAuth';

const API = env.FULL_API_URL;

// ─── Styled Components ──────────────────────────────────────────────
const Container = styled.div`
  font-family: 'DM Sans', -apple-system, sans-serif;
  color: #1e293b;
  background: #f0f2f5;
  min-height: 100vh;
  padding: 22px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 22px;
`;

const StatCard = styled.div`
  background: #fff;
  border: 1px solid #e8ecf1;
  border-radius: 12px;
  padding: 18px;
  transition: box-shadow 0.2s;
  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
`;

const StatIcon = styled.div`
  width: 36px; height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: ${props => props.$c === 'teal' ? '#ccfbf1' : 
    props.$c === 'grn' ? '#dcfce7' : props.$c === 'blu' ? '#dbeafe' :
    props.$c === 'red' ? '#fee2e2' : props.$c === 'amb' ? '#fef3c7' : '#ffedd5'};
  color: ${props => props.$c === 'teal' ? '#0d9488' : 
    props.$c === 'grn' ? '#16a34a' : props.$c === 'blu' ? '#2563eb' :
    props.$c === 'red' ? '#dc2626' : props.$c === 'amb' ? '#d97706' : '#ea580c'};
`;

const StatValue = styled.div`font-size: 26px; font-weight: 700; line-height: 1; margin-bottom: 3px;`;
const StatLabel = styled.div`font-size: 11px; color: #94a3b8; font-weight: 500;`;
const StatChange = styled.div`
  display: inline-flex; align-items: center; gap: 2px; font-size: 10px;
  font-weight: 600; margin-top: 6px; padding: 2px 6px; border-radius: 4px;
  color: ${props => props.$up ? '#16a34a' : '#dc2626'};
  background: ${props => props.$up ? '#dcfce7' : '#fee2e2'};
`;

const Alert = styled.div`
  display: flex; align-items: center; gap: 8px; padding: 8px 10px;
  border-radius: 8px; margin-bottom: 10px; font-size: 10px; border: 1px solid;
  background: ${p => p.$t === 'warning' ? '#fef3c7' : p.$t === 'error' ? '#fee2e2' : p.$t === 'info' ? '#dbeafe' : '#dcfce7'};
  border-color: ${p => p.$t === 'warning' ? 'rgba(217,119,6,.2)' : p.$t === 'error' ? 'rgba(220,38,38,.2)' : p.$t === 'info' ? 'rgba(37,99,235,.2)' : 'rgba(22,163,74,.2)'};
  color: ${p => p.$t === 'warning' ? '#d97706' : p.$t === 'error' ? '#dc2626' : p.$t === 'info' ? '#2563eb' : '#16a34a'};
`;

const Card = styled.div`background: #fff; border: 1px solid #e8ecf1; border-radius: 12px; overflow: hidden;`;
const CardHeader = styled.div`display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid #e8ecf1;`;
const CardTitle = styled.h3`font-size: 13px; font-weight: 600; margin: 0;`;
const CardBody = styled.div`padding: 16px;`;

const TabsContainer = styled.div`
  display: flex; gap: 3px; margin-bottom: 18px; flex-wrap: wrap;
`;
const Tab = styled.button`
  padding: 8px 18px; border-radius: 8px 8px 0 0; border: none;
  font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit;
  background: ${p => p.$active ? '#fff' : 'transparent'};
  color: ${p => p.$active ? '#0d9488' : '#64748b'};
  border-bottom: ${p => p.$active ? '2px solid #0d9488' : '2px solid transparent'};
  transition: all 0.15s;
  &:hover { color: #0d9488; }
`;

const TableWrapper = styled.div`
  background: #fff; border: 1px solid #e8ecf1; border-radius: 12px; overflow: hidden;
`;
const TableToolbar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-bottom: 1px solid #e8ecf1; gap: 8px; flex-wrap: wrap;
`;
const SearchBox = styled.div`
  display: flex; align-items: center; gap: 5px; background: #f8fafc;
  border: 1px solid #e8ecf1; border-radius: 6px; padding: 5px 9px; width: 180px;
  &:focus-within { border-color: #0d9488; }
  input {
    border: none; outline: none; background: transparent; font-size: 11px;
    color: #1e293b; width: 100%; font-family: inherit;
  }
`;
const FilterButtons = styled.div`display: flex; gap: 3px; flex-wrap: wrap;`;
const FilterButton = styled.button`
  padding: 3px 9px; border-radius: 5px; border: 1px solid #e8ecf1;
  background: ${p => p.$on ? '#0d9488' : '#fff'};
  color: ${p => p.$on ? '#fff' : '#64748b'};
  font-size: 9px; cursor: pointer; font-family: inherit; font-weight: 500;
  transition: all 0.1s;
  &:hover { border-color: #0d9488; color: ${p => p.$on ? '#fff' : '#0d9488'}; }
`;

const Table = styled.table`width: 100%; border-collapse: collapse;`;
const Th = styled.th`
  text-align: left; padding: 9px 12px; font-size: 9px; text-transform: uppercase;
  letter-spacing: 1px; color: #94a3b8; border-bottom: 1px solid #e8ecf1;
  font-weight: 600; background: #f8fafc;
`;
const Td = styled.td`
  padding: 9px 12px; font-size: 11px; border-bottom: 1px solid #e8ecf1;
  color: #64748b; vertical-align: middle;
  &:last-child { text-align: right; }
`;
const Tr = styled.tr`
  &:hover { background: #f8fafc; }
  &:last-child td { border-bottom: none; }
`;

const Button = styled.button`
  display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px;
  border-radius: 6px; border: none; font-size: 10px; font-weight: 600;
  cursor: pointer; font-family: inherit; white-space: nowrap;
  background: ${p => p.$primary ? '#0d9488' : p.$danger ? '#fee2e2' : p.$success ? '#dcfce7' : '#f1f5f9'};
  color: ${p => p.$primary ? '#fff' : p.$danger ? '#dc2626' : p.$success ? '#16a34a' : '#64748b'};
  &:hover {
    background: ${p => p.$primary ? '#0f766e' : p.$danger ? '#dc2626' : p.$success ? '#16a34a' : '#e2e8f0'};
    color: ${p => p.$primary || p.$danger || p.$success ? '#fff' : '#1e293b'};
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const IconBtn = styled.button`
  width: 24px; height: 24px; padding: 0; display: inline-flex; align-items: center;
  justify-content: center; border-radius: 5px; border: 1px solid #e8ecf1;
  background: #fff; color: #94a3b8; cursor: pointer; font-size: 9px;
  transition: all 0.1s; margin: 0 1px;
  &:hover { border-color: #0d9488; color: #0d9488; }
`;

const Tag = styled.span`
  display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px;
  border-radius: 4px; font-size: 9px; font-weight: 600;
  background: ${p => p.$available ? '#dcfce7' : p.$low ? '#fef3c7' : p.$out ? '#fee2e2' : 
    p.$booked ? '#dbeafe' : p.$pending ? '#fef3c7' : p.$completed ? '#dcfce7' : 
    p.$paid ? '#dcfce7' : p.$unpaid ? '#fee2e2' : '#f1f5f9'};
  color: ${p => p.$available ? '#16a34a' : p.$low ? '#d97706' : p.$out ? '#dc2626' : 
    p.$booked ? '#2563eb' : p.$pending ? '#d97706' : p.$completed ? '#16a34a' : 
    p.$paid ? '#16a34a' : p.$unpaid ? '#dc2626' : '#64748b'};
`;

const EmptyState = styled.div`
  text-align: center; padding: 30px 12px; color: #94a3b8;
  p { font-size: 11px; }
`;

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.3);
  backdrop-filter: blur(3px); z-index: 200;
  display: ${p => p.$open ? 'flex' : 'none'};
  align-items: center; justify-content: center; padding: 14px;
`;
const ModalDialog = styled.div`
  background: #fff; border: 1px solid #e8ecf1; border-radius: 12px;
  width: 100%; max-width: ${p => p.$w || '540px'}; max-height: 85vh;
  overflow-y: auto; box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  animation: modalIn 0.2s;
  @keyframes modalIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;
const ModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-bottom: 1px solid #e8ecf1;
`;
const ModalTitle = styled.h3`font-size: 15px; font-weight: 600; margin: 0;`;
const ModalClose = styled.button`
  width: 26px; height: 26px; border-radius: 6px; border: 1px solid #e8ecf1;
  background: #fff; color: #94a3b8; cursor: pointer; display: flex;
  align-items: center; justify-content: center; font-size: 10px;
  &:hover { border-color: #dc2626; color: #dc2626; background: #fee2e2; }
`;
const ModalBody = styled.div`padding: 18px;`;
const ModalFooter = styled.div`
  display: flex; justify-content: flex-end; gap: 5px;
  padding: 10px 18px; border-top: 1px solid #e8ecf1;
`;

const FormGroup = styled.div`margin-bottom: 12px;`;
const FormRow = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 9px;`;
const FormLabel = styled.label`
  display: block; font-size: 9px; color: #94a3b8; margin-bottom: 3px;
  text-transform: uppercase; letter-spacing: 1px; font-weight: 600;
`;
const FormInput = styled.input`
  width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid #e8ecf1;
  background: #fff; color: #1e293b; font-size: 11px; font-family: inherit;
  outline: none; box-sizing: border-box;
  &:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.08); }
`;
const FormSelect = styled.select`
  width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid #e8ecf1;
  background: #fff; color: #1e293b; font-size: 11px; font-family: inherit;
  outline: none; cursor: pointer; box-sizing: border-box;
  &:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.08); }
`;
const FormTextarea = styled.textarea`
  width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid #e8ecf1;
  background: #fff; color: #1e293b; font-size: 11px; font-family: inherit;
  outline: none; resize: vertical; min-height: 50px; box-sizing: border-box;
  &:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.08); }
`;

const LoadingSpinner = styled.div`
  display: flex; align-items: center; justify-content: center; padding: 60px;
  color: #94a3b8; font-size: 13px; gap: 10px;
  &::before {
    content: ''; width: 20px; height: 20px; border: 2px solid #e8ecf1;
    border-top-color: #0d9488; border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ─── Helpers ────────────────────────────────────────────────────────
const getStockStatus = (stock) => {
  if (stock <= 0) return { label: 'Out of Stock', cls: 'out' };
  if (stock <= 2) return { label: 'Low Stock', cls: 'low' };
  return { label: 'Available', cls: 'available' };
};

const getBookingStatus = (status) => {
  const map = {
    pending: { label: 'Pending', cls: 'pending' },
    booked: { label: 'Booked', cls: 'booked' },
    completed: { label: 'Completed', cls: 'completed' },
    cancelled: { label: 'Cancelled', cls: 'unpaid' },
    approved: { label: 'Approved', cls: 'booked' },
    rejected: { label: 'Rejected', cls: 'out' },
    transferring: { label: 'Transferring', cls: 'pending' },
    delivered: { label: 'Delivered', cls: 'completed' }
  };
  return map[status] || map.pending;
};

const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const COFFIN_TYPES = {
  Traditional: '⚰️', Modern: '🪦', Religious: '✝️',
  'Eco-Friendly': '🌿', Child: '🕊️', Veteran: '🎖️'
};

// ─── Main Component ──────────────────────────────────────────────────
const CoffinDashboard = () => {
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Data from backend
  const [coffins, setCoffins] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stockRequests, setStockRequests] = useState([]);
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState(null);

  // Filters
  const [inventoryFilter, setInventoryFilter] = useState('all');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [modal, setModal] = useState({ open: false, type: '', data: {} });
  const [submitLoading, setSubmitLoading] = useState(false);

  // ─── API Calls ──────────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const tenantSlug = getTenantSlug();

      // Fetch branches
      let branchList = [];
      try {
        const brRes = await api.get('/coffins/bookings?limit=0');
        // Try to get branches from tenant info
        const tenantRes = await api.get(`/tenant/${tenantSlug}/settings`).catch(() => null);
        if (tenantRes?.data?.branches) {
          branchList = tenantRes.data.branches;
        }
      } catch (e) { /* ignore */ }

      // Default branch if none
      if (branchList.length === 0) {
        branchList = [{ id: 1, name: 'Main Branch', color: '#0d9488' }];
      }
      setBranches(branchList);
      setCurrentBranch(branchList[0]?.id || 1);

      // Fetch coffins
      const coffinRes = await api.get('/coffins/list');
      if (coffinRes.data?.success && coffinRes.data?.data) {
        setCoffins(coffinRes.data.data);
      }

      // Fetch bookings
      const bookingRes = await api.get('/coffins/bookings');
      if (bookingRes.data?.success && bookingRes.data?.data) {
        setBookings(bookingRes.data.data);
      }

      // Fetch stock requests
      const stockRes = await api.get('/coffins/stock-requests');
      if (stockRes.data?.success && stockRes.data?.data) {
        setStockRequests(stockRes.data.data);
      }

    } catch (error) {
      console.error('Error fetching coffin data:', error);
      toast.error('Failed to load coffin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // ─── Create Coffin ──────────────────────────────────────────────────
  const handleCreateCoffin = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = modal.data;
      const res = await api.post('/coffins/create', {
        name: data.name, sku: data.sku, type: data.type,
        material: data.material, price: parseFloat(data.price),
        stock: parseInt(data.stock) || 0, notes: data.notes,
        branch_id: currentBranch
      });
      if (res.data?.success) {
        toast.success('Coffin created successfully');
        setModal({ open: false, type: '', data: {} });
        fetchAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coffin');
    } finally { setSubmitLoading(false); }
  };

  // ─── Create Booking ─────────────────────────────────────────────────
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const d = modal.data;
      const res = await api.post('/coffins/bookings', {
        client_name: d.client_name, client_phone: d.client_phone,
        deceased_name: d.deceased_name, coffin_id: d.coffin_id,
        service_date: d.service_date, notes: d.notes,
        paid: d.paid || false, specifications: d.specifications || []
      });
      if (res.data?.success) {
        toast.success('Booking created successfully');
        setModal({ open: false, type: '', data: {} });
        fetchAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally { setSubmitLoading(false); }
  };

  // ─── Create Stock Request ──────────────────────────────────────────
  const handleCreateStockRequest = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const d = modal.data;
      const res = await api.post('/coffins/stock-requests', {
        from_branch_id: currentBranch,
        to_branch_id: d.to_branch_id,
        coffin_id: d.coffin_id, quantity: parseInt(d.quantity) || 1,
        client_name: d.client_name, client_phone: d.client_phone,
        deceased_name: d.deceased_name, service_date: d.service_date,
        notes: d.notes
      });
      if (res.data?.success) {
        toast.success('Stock request sent');
        setModal({ open: false, type: '', data: {} });
        fetchAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create request');
    } finally { setSubmitLoading(false); }
  };

  // ─── Approve / Reject Stock Request ────────────────────────────────
  const handleStockAction = async (id, action) => {
    try {
      const res = await api.post(`/coffins/stock-requests/${id}/${action}`);
      if (res.data?.success) {
        toast.success(`Request ${action}ed successfully`);
        fetchAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} request`);
    }
  };

  // ─── Update Booking Status ──────────────────────────────────────────
  const handleBookingStatus = async (id, status) => {
    try {
      const res = await api.patch(`/coffins/bookings/${id}/status`, { status });
      if (res.data?.success) {
        toast.success(`Booking ${status}`);
        fetchAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update booking');
    }
  };

  // ─── Delete Coffin ──────────────────────────────────────────────────
  const handleDeleteCoffin = async (id) => {
    if (!confirm('Are you sure you want to delete this coffin?')) return;
    try {
      const res = await api.delete(`/coffins/delete/${id}`);
      if (res.data?.success) {
        toast.success('Coffin deleted');
        fetchAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete coffin');
    }
  };

  // ─── Filtered Data ──────────────────────────────────────────────────
  const branchCoffins = coffins.filter(c => 
    !currentBranch || c.branch_id === currentBranch || c.branch_id == currentBranch
  );
  const branchBookings = bookings.filter(b =>
    !currentBranch || b.branch_id === currentBranch || b.branch_id == currentBranch
  );

  const filteredCoffins = branchCoffins.filter(c => {
    if (searchQuery && !c.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.sku?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (inventoryFilter === 'available') return c.stock > 2;
    if (inventoryFilter === 'low') return c.stock > 0 && c.stock <= 2;
    if (inventoryFilter === 'out') return c.stock <= 0;
    return true;
  });

  const filteredBookings = branchBookings.filter(b => {
    if (searchQuery && !b.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !b.deceased_name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (bookingFilter === 'unpaid') return !b.paid;
    if (bookingFilter !== 'all') return b.status === bookingFilter;
    return true;
  });

  const incomingRequests = stockRequests.filter(r => r.to_branch_id == currentBranch);
  const outgoingRequests = stockRequests.filter(r => r.from_branch_id == currentBranch);

  const totalStock = branchCoffins.reduce((s, c) => s + (parseInt(c.stock) || 0), 0);
  const lowStock = branchCoffins.filter(c => c.stock > 0 && c.stock <= 2).length;
  const outOfStock = branchCoffins.filter(c => c.stock <= 0).length;
  const pendingBookingsCount = branchBookings.filter(b => b.status === 'pending').length;
  const totalRevenue = branchBookings.filter(b => b.paid && b.status !== 'cancelled')
    .reduce((s, b) => s + (parseFloat(b.coffin_price || b.price) || 0), 0);

  // ─── Modals ─────────────────────────────────────────────────────────
  const openModal = (type, data = {}) => setModal({ open: true, type, data });
  const closeModal = () => setModal({ open: false, type: '', data: {} });

  if (loading) {
    return <Container><LoadingSpinner>Loading coffin inventory...</LoadingSpinner></Container>;
  }

  return (
    <Container>
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Tabs */}
      <TabsContainer>
        <Tab $active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>Dashboard</Tab>
        <Tab $active={tab === 'inventory'} onClick={() => setTab('inventory')}>Inventory</Tab>
        <Tab $active={tab === 'bookings'} onClick={() => setTab('bookings')}>Bookings</Tab>
        <Tab $active={tab === 'requests'} onClick={() => setTab('requests')}>Stock Requests</Tab>
      </TabsContainer>

      {/* ========== DASHBOARD TAB ========== */}
      {tab === 'dashboard' && (
        <>
          {/* Alerts */}
          <div>
            {outOfStock > 0 && (
              <Alert $t="error"><strong>{outOfStock} item(s) out of stock</strong> — Consider cross-branch requests</Alert>
            )}
            {lowStock > 0 && (
              <Alert $t="warning"><strong>{lowStock} item(s) low on stock</strong></Alert>
            )}
            {pendingBookingsCount > 0 && (
              <Alert $t="info"><strong>{pendingBookingsCount} pending booking(s)</strong> — Action required</Alert>
            )}
          </div>

          <StatsGrid>
            <StatCard>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <StatIcon $c="teal">$</StatIcon>
              </div>
              <StatValue>KES {totalRevenue.toLocaleString()}</StatValue>
              <StatLabel>Total Revenue</StatLabel>
            </StatCard>
            <StatCard>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <StatIcon $c="grn">📦</StatIcon>
              </div>
              <StatValue>{totalStock}</StatValue>
              <StatLabel>Total in Stock</StatLabel>
            </StatCard>
            <StatCard>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <StatIcon $c="blu">📅</StatIcon>
              </div>
              <StatValue>{branchBookings.length}</StatValue>
              <StatLabel>Total Bookings</StatLabel>
            </StatCard>
            <StatCard>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <StatIcon $c="red">⏳</StatIcon>
              </div>
              <StatValue>{branchBookings.filter(b => !b.paid && b.status !== 'cancelled').length}</StatValue>
              <StatLabel>Unpaid</StatLabel>
            </StatCard>
          </StatsGrid>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Card style={{ flex: '1 1 300px' }}>
              <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
              <CardBody>
                {branchBookings.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: 12 }}>No recent bookings</p>
                ) : (
                  branchBookings.slice(0, 5).map(b => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 11 }}>
                      <span style={{ fontWeight: 500 }}>{b.client_name || 'N/A'}</span>
                      <Tag $pending={b.status === 'pending'} $completed={b.status === 'completed'} $booked={b.status === 'booked'}>
                        {b.status || 'pending'}
                      </Tag>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
            <Card style={{ flex: '1 1 300px' }}>
              <CardHeader><CardTitle>Stock Status</CardTitle></CardHeader>
              <CardBody>
                <p style={{ color: '#94a3b8', fontSize: 12 }}>Available: {branchCoffins.filter(c => c.stock > 2).length}</p>
                <p style={{ color: '#d97706', fontSize: 12 }}>Low Stock: {lowStock}</p>
                <p style={{ color: '#dc2626', fontSize: 12 }}>Out of Stock: {outOfStock}</p>
              </CardBody>
            </Card>
          </div>
        </>
      )}

      {/* ========== INVENTORY TAB ========== */}
      {tab === 'inventory' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
              Inventory — <span style={{ color: '#94a3b8', fontWeight: 400 }}>{branches.find(b => b.id == currentBranch)?.name || 'All'}</span>
            </h3>
            <Button $primary onClick={() => openModal('coffin', { type: 'Traditional', stock: 0, price: 0 })}>+ Add Coffin</Button>
          </div>

          <TableWrapper>
            <TableToolbar>
              <SearchBox>
                <input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </SearchBox>
              <FilterButtons>
                <FilterButton $on={inventoryFilter === 'all'} onClick={() => setInventoryFilter('all')}>All</FilterButton>
                <FilterButton $on={inventoryFilter === 'available'} onClick={() => setInventoryFilter('available')}>Available</FilterButton>
                <FilterButton $on={inventoryFilter === 'low'} onClick={() => setInventoryFilter('low')}>Low</FilterButton>
                <FilterButton $on={inventoryFilter === 'out'} onClick={() => setInventoryFilter('out')}>Out</FilterButton>
              </FilterButtons>
            </TableToolbar>
            <Table>
              <thead><tr>
                <Th>Coffin</Th><Th>Type</Th><Th>Material</Th><Th>Price</Th><Th>Stock</Th><Th>Status</Th><Th>Branch</Th><Th></Th>
              </tr></thead>
              <tbody>
                {filteredCoffins.length === 0 ? (
                  <tr><td colSpan={8}><EmptyState><p>No coffins found</p></EmptyState></td></tr>
                ) : filteredCoffins.map(coffin => {
                  const st = getStockStatus(coffin.stock);
                  const branch = branches.find(b => b.id == coffin.branch_id);
                  return (
                    <tr key={coffin.coffin_id || coffin.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 6, overflow: 'hidden', border: '1px solid #e8ecf1', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                            {COFFIN_TYPES[coffin.type] || '⚰️'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: '#1e293b', fontSize: 11 }}>{coffin.name}</div>
                            <div style={{ fontSize: 8, color: '#94a3b8', letterSpacing: '0.5px' }}>{coffin.sku}</div>
                          </div>
                        </div>
                      </td>
                      <Td>{coffin.type}</Td>
                      <Td>{coffin.material}</Td>
                      <Td style={{ fontWeight: 500, color: '#1e293b' }}>KES {parseFloat(coffin.price).toLocaleString()}</Td>
                      <Td style={{ fontWeight: coffin.stock <= 2 ? 700 : 400, color: coffin.stock <= 2 ? '#dc2626' : '#64748b' }}>{coffin.stock}</Td>
                      <Td><Tag $available={st.cls === 'available'} $low={st.cls === 'low'} $out={st.cls === 'out'}>{st.label}</Tag></Td>
                      <Td>{branch?.name || 'N/A'}</Td>
                      <Td>
                        <IconBtn onClick={() => handleDeleteCoffin(coffin.coffin_id || coffin.id)} title="Delete">✕</IconBtn>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrapper>
        </>
      )}

      {/* ========== BOOKINGS TAB ========== */}
      {tab === 'bookings' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
              Bookings — <span style={{ color: '#94a3b8', fontWeight: 400 }}>{branches.find(b => b.id == currentBranch)?.name || 'All'}</span>
            </h3>
            <Button $primary onClick={() => openModal('booking', { service_date: new Date().toISOString().split('T')[0] })}>+ New Booking</Button>
          </div>

          <TableWrapper>
            <TableToolbar>
              <SearchBox>
                <input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </SearchBox>
              <FilterButtons>
                <FilterButton $on={bookingFilter === 'all'} onClick={() => setBookingFilter('all')}>All</FilterButton>
                <FilterButton $on={bookingFilter === 'pending'} onClick={() => setBookingFilter('pending')}>Pending</FilterButton>
                <FilterButton $on={bookingFilter === 'booked'} onClick={() => setBookingFilter('booked')}>Booked</FilterButton>
                <FilterButton $on={bookingFilter === 'completed'} onClick={() => setBookingFilter('completed')}>Completed</FilterButton>
                <FilterButton $on={bookingFilter === 'unpaid'} onClick={() => setBookingFilter('unpaid')}>Unpaid</FilterButton>
              </FilterButtons>
            </TableToolbar>
            <Table>
              <thead><tr>
                <Th>ID</Th><Th>Client</Th><Th>Deceased</Th><Th>Coffin</Th><Th>Date</Th><Th>Paid</Th><Th>Status</Th><Th></Th>
              </tr></thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr><td colSpan={8}><EmptyState><p>No bookings found</p></EmptyState></td></tr>
                ) : filteredBookings.map(b => {
                  const st = getBookingStatus(b.status);
                  const coffin = coffins.find(c => (c.coffin_id || c.id) == b.coffin_id);
                  return (
                    <tr key={b.id}>
                      <Td style={{ fontWeight: 600, color: '#1e293b' }}>#{b.id}</Td>
                      <Td style={{ fontWeight: 500, color: '#1e293b' }}>{b.client_name}</Td>
                      <Td>{b.deceased_name}</Td>
                      <Td>{coffin?.name || 'N/A'}</Td>
                      <Td>{formatDate(b.service_date)}</Td>
                      <Td><Tag $paid={b.paid} $unpaid={!b.paid}>{b.paid ? 'Paid' : 'Unpaid'}</Tag></Td>
                      <Td><Tag $pending={st.cls === 'pending'} $completed={st.cls === 'completed'} $booked={st.cls === 'booked'} $unpaid={st.cls === 'unpaid'}>{st.label}</Tag></Td>
                      <Td>
                        {b.status === 'pending' && (
                          <>
                            <IconBtn onClick={() => handleBookingStatus(b.id, 'booked')} title="Approve">✓</IconBtn>
                            <IconBtn onClick={() => handleBookingStatus(b.id, 'cancelled')} title="Cancel" style={{ borderColor: '#dc2626', color: '#dc2626' }}>✕</IconBtn>
                          </>
                        )}
                        {b.status === 'booked' && (
                          <IconBtn onClick={() => handleBookingStatus(b.id, 'completed')} title="Complete">✓</IconBtn>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrapper>
        </>
      )}

      {/* ========== STOCK REQUESTS TAB ========== */}
      {tab === 'requests' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Stock Requests</h3>
            <Button $primary onClick={() => openModal('stockRequest', { quantity: 1 })}>+ New Request</Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Incoming */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px' }}>Incoming</h4>
              <TableWrapper>
                <Table>
                  <thead><tr><Th>ID</Th><Th>From</Th><Th>Coffin</Th><Th>Qty</Th><Th>Status</Th><Th></Th></tr></thead>
                  <tbody>
                    {incomingRequests.length === 0 ? (
                      <tr><td colSpan={6}><EmptyState><p>No incoming requests</p></EmptyState></td></tr>
                    ) : incomingRequests.map(r => {
                      const from = branches.find(b => b.id == r.from_branch_id);
                      const coffin = coffins.find(c => (c.coffin_id || c.id) == r.coffin_id);
                      const st = getBookingStatus(r.status);
                      return (
                        <tr key={r.id}>
                          <Td style={{ fontWeight: 600 }}>#{r.id}</Td>
                          <Td>{from?.name || 'N/A'}</Td>
                          <Td>{coffin?.name || 'N/A'}</Td>
                          <Td>{r.quantity || 1}</Td>
                          <Td><Tag $pending={st.cls === 'pending'} $completed={st.cls === 'completed'} $booked={st.cls === 'booked'}>{st.label}</Tag></Td>
                          <Td>
                            {r.status === 'pending' && (
                              <>
                                <IconBtn style={{ borderColor: '#16a34a', color: '#16a34a' }} onClick={() => handleStockAction(r.id, 'approve')} title="Approve">✓</IconBtn>
                                <IconBtn style={{ borderColor: '#dc2626', color: '#dc2626' }} onClick={() => handleStockAction(r.id, 'reject')} title="Reject">✕</IconBtn>
                              </>
                            )}
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </TableWrapper>
            </div>

            {/* Outgoing */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px' }}>Outgoing</h4>
              <TableWrapper>
                <Table>
                  <thead><tr><Th>ID</Th><Th>To</Th><Th>Coffin</Th><Th>Qty</Th><Th>Status</Th></tr></thead>
                  <tbody>
                    {outgoingRequests.length === 0 ? (
                      <tr><td colSpan={5}><EmptyState><p>No outgoing requests</p></EmptyState></td></tr>
                    ) : outgoingRequests.map(r => {
                      const to = branches.find(b => b.id == r.to_branch_id);
                      const coffin = coffins.find(c => (c.coffin_id || c.id) == r.coffin_id);
                      const st = getBookingStatus(r.status);
                      return (
                        <tr key={r.id}>
                          <Td style={{ fontWeight: 600 }}>#{r.id}</Td>
                          <Td>{to?.name || 'N/A'}</Td>
                          <Td>{coffin?.name || 'N/A'}</Td>
                          <Td>{r.quantity || 1}</Td>
                          <Td><Tag $pending={st.cls === 'pending'} $completed={st.cls === 'completed'} $booked={st.cls === 'booked'}>{st.label}</Tag></Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </TableWrapper>
            </div>
          </div>
        </>
      )}

      {/* ========== MODALS ========== */}

      {/* Coffin Create Modal */}
      <ModalOverlay $open={modal.open && modal.type === 'coffin'} onClick={closeModal}>
        <ModalDialog onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Add New Coffin</ModalTitle>
            <ModalClose onClick={closeModal}>✕</ModalClose>
          </ModalHeader>
          <form onSubmit={handleCreateCoffin}>
            <ModalBody>
              <FormRow>
                <FormGroup>
                  <FormLabel>Name *</FormLabel>
                  <FormInput required value={modal.data.name || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, name: e.target.value } })} placeholder="Mahogany Heritage" />
                </FormGroup>
                <FormGroup>
                  <FormLabel>SKU *</FormLabel>
                  <FormInput required value={modal.data.sku || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, sku: e.target.value } })} placeholder="MH-001" />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <FormLabel>Type *</FormLabel>
                  <FormSelect required value={modal.data.type || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, type: e.target.value } })}>
                    <option value="">Select type</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Modern">Modern</option>
                    <option value="Religious">Religious</option>
                    <option value="Eco-Friendly">Eco-Friendly</option>
                    <option value="Child">Child</option>
                    <option value="Veteran">Veteran</option>
                  </FormSelect>
                </FormGroup>
                <FormGroup>
                  <FormLabel>Material *</FormLabel>
                  <FormInput required value={modal.data.material || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, material: e.target.value } })} placeholder="Solid Mahogany" />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <FormLabel>Price (KES) *</FormLabel>
                  <FormInput required type="number" value={modal.data.price || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, price: e.target.value } })} />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Stock</FormLabel>
                  <FormInput type="number" value={modal.data.stock || 0} onChange={e => setModal({ ...modal, data: { ...modal.data, stock: parseInt(e.target.value) || 0 } })} />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <FormLabel>Notes</FormLabel>
                <FormTextarea value={modal.data.notes || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, notes: e.target.value } })} placeholder="Any notes..." />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button type="button" onClick={closeModal}>Cancel</Button>
              <Button $primary type="submit" disabled={submitLoading}>{submitLoading ? 'Saving...' : 'Save Coffin'}</Button>
            </ModalFooter>
          </form>
        </ModalDialog>
      </ModalOverlay>

      {/* Booking Create Modal */}
      <ModalOverlay $open={modal.open && modal.type === 'booking'} onClick={closeModal}>
        <ModalDialog onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>New Booking</ModalTitle>
            <ModalClose onClick={closeModal}>✕</ModalClose>
          </ModalHeader>
          <form onSubmit={handleCreateBooking}>
            <ModalBody>
              <FormRow>
                <FormGroup>
                  <FormLabel>Client Name *</FormLabel>
                  <FormInput required value={modal.data.client_name || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, client_name: e.target.value } })} />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Client Phone</FormLabel>
                  <FormInput value={modal.data.client_phone || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, client_phone: e.target.value } })} />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <FormLabel>Deceased Name *</FormLabel>
                <FormInput required value={modal.data.deceased_name || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, deceased_name: e.target.value } })} />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <FormLabel>Coffin *</FormLabel>
                  <FormSelect required value={modal.data.coffin_id || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, coffin_id: e.target.value } })}>
                    <option value="">Select coffin</option>
                    {branchCoffins.filter(c => c.stock > 0).map(c => (
                      <option key={c.coffin_id || c.id} value={c.coffin_id || c.id}>{c.name} — KES {parseFloat(c.price).toLocaleString()}</option>
                    ))}
                  </FormSelect>
                </FormGroup>
                <FormGroup>
                  <FormLabel>Service Date *</FormLabel>
                  <FormInput required type="date" value={modal.data.service_date || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, service_date: e.target.value } })} />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <FormLabel>Notes</FormLabel>
                <FormTextarea value={modal.data.notes || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, notes: e.target.value } })} />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button type="button" onClick={closeModal}>Cancel</Button>
              <Button $primary type="submit" disabled={submitLoading}>{submitLoading ? 'Saving...' : 'Create Booking'}</Button>
            </ModalFooter>
          </form>
        </ModalDialog>
      </ModalOverlay>

      {/* Stock Request Modal */}
      <ModalOverlay $open={modal.open && modal.type === 'stockRequest'} onClick={closeModal}>
        <ModalDialog onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>New Stock Request</ModalTitle>
            <ModalClose onClick={closeModal}>✕</ModalClose>
          </ModalHeader>
          <form onSubmit={handleCreateStockRequest}>
            <ModalBody>
              <FormRow>
                <FormGroup>
                  <FormLabel>Request To *</FormLabel>
                  <FormSelect required value={modal.data.to_branch_id || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, to_branch_id: e.target.value } })}>
                    <option value="">Select branch</option>
                    {branches.filter(b => b.id != currentBranch).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </FormSelect>
                </FormGroup>
                <FormGroup>
                  <FormLabel>Coffin *</FormLabel>
                  <FormSelect required value={modal.data.coffin_id || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, coffin_id: e.target.value } })}>
                    <option value="">Select coffin</option>
                    {coffins.filter(c => c.stock > 0).map(c => (
                      <option key={c.coffin_id || c.id} value={c.coffin_id || c.id}>{c.name}</option>
                    ))}
                  </FormSelect>
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <FormLabel>Quantity</FormLabel>
                  <FormInput type="number" min={1} value={modal.data.quantity || 1} onChange={e => setModal({ ...modal, data: { ...modal.data, quantity: parseInt(e.target.value) || 1 } })} />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Client Name</FormLabel>
                  <FormInput value={modal.data.client_name || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, client_name: e.target.value } })} />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <FormLabel>Client Phone</FormLabel>
                  <FormInput value={modal.data.client_phone || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, client_phone: e.target.value } })} />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Deceased Name</FormLabel>
                  <FormInput value={modal.data.deceased_name || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, deceased_name: e.target.value } })} />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <FormLabel>Notes</FormLabel>
                <FormTextarea value={modal.data.notes || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, notes: e.target.value } })} />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button type="button" onClick={closeModal}>Cancel</Button>
              <Button $primary type="submit" disabled={submitLoading}>{submitLoading ? 'Sending...' : 'Send Request'}</Button>
            </ModalFooter>
          </form>
        </ModalDialog>
      </ModalOverlay>
    </Container>
  );
};

export default CoffinDashboard;