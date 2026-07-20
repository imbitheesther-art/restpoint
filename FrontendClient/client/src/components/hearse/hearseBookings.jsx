import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useSocket } from '../../utils/context/socketContext';
import env from '../../utils/config/env';
import ReusableCalendar from '../../utils/calender/calender';
import useAuthStore from '../../utils/store/useAuthStore';
import { Truck, Car, Clock, Check, Search, Plus, RefreshCw, MoreVertical, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, List, Grid, X, Calendar, MapPin, Phone, User, Filter } from '../../utils/icons/icons';

const API_BASE_URL = import.meta.env.PROD
  ? 'https://restpoint.co.ke/api/v1/restpoint'
  : (env.FULL_API_URL || 'http://localhost:5000/api/v1/restpoint');
const RESULTS_PER_PAGE = 10;

const STATUS_CONFIG = {
  pending: { label: 'Pending', progress: 10, color: '#f59e0b', bg: '#fef3c7', dotColor: '#f59e0b' },
  booked: { label: 'Booked', progress: 25, color: '#3b82f6', bg: '#dbeafe', dotColor: '#3b82f6' },
  in_transit: { label: 'In Transit', progress: 60, color: '#ec4899', bg: '#fce7f3', dotColor: '#ec4899' },
  completed: { label: 'Completed', progress: 100, color: '#10b981', bg: '#d1fae5', dotColor: '#10b981' },
  cancelled: { label: 'Cancelled', progress: 0, color: '#ef4444', bg: '#fee2e2', dotColor: '#ef4444' },
  postponed: { label: 'Postponed', progress: 15, color: '#f59e0b', bg: '#fef3c7', dotColor: '#f59e0b' },
  maintenance: { label: 'Maintenance', progress: 0, color: '#8b5cf6', bg: '#f3e8ff', dotColor: '#8b5cf6' },
};
const STATUS_LIST = Object.keys(STATUS_CONFIG);

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

const formatDateStr = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
const fmtDateOnly = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
const genId = (id, plateNumber) => {
  if (!id) return 'N/A';
  const idStr = id.toString();
  if (idStr.startsWith('BK-')) return idStr;
  const timestamp = Date.now().toString().slice(-6);
  let baseId;
  if (plateNumber) {
    baseId = plateNumber.replace(/[^A-Z0-9]/gi, '').slice(0, 6);
  } else {
    baseId = Math.floor(1000 + Math.random() * 9000).toString();
  }
  return `BK-${baseId}${timestamp}`;
};

const getTenantSlug = () => localStorage.getItem('tenantSlug') || localStorage.getItem('tenant_slug') || 'default';
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('authToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  const headers = { 'x-tenant-slug': getTenantSlug() };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const Icons = {
  truck: <Truck size={16} />,
  car: <Car size={16} />,
  search: <Search size={16} />,
  plus: <Plus size={16} />,
  refresh: <RefreshCw size={16} />,
  moreV: <MoreVertical size={16} />,
  clock: <Clock size={16} />,
  check: <Check size={16} />,
  chevLeft: <ChevronLeft size={16} />,
  chevRight: <ChevronRight size={16} />,
  chevFirst: <ChevronFirst size={16} />,
  chevLast: <ChevronLast size={16} />,
  list: <List size={16} />,
  grid: <Grid size={16} />,
  x: <X size={16} />,
};

const api = {
  getBookings: async () => {
    const r = await fetch(`${API_BASE_URL}/hearse-bookings?t=${Date.now()}`, { headers: getAuthHeaders() });
    if (!r.ok) throw new Error('Failed');
    return (await r.json()).bookings || [];
  },
  getBranches: async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/tenant/${getTenantSlug()}/branches`, { headers: getAuthHeaders() });
      return r.ok ? (await r.json()).data || [] : [];
    } catch { return []; }
  },
  getAllHearses: async () => {
    const r = await fetch(`${API_BASE_URL}/hearses`, { headers: getAuthHeaders() });
    return r.ok ? (await r.json()).hearses || [] : [];
  },
  updateStatus: async (id, status) => {
    const h = getAuthHeaders(); h['Content-Type'] = 'application/json';
    const r = await fetch(`${API_BASE_URL}/hearse-bookings/${id}/status`, { method: 'PUT', headers: h, body: JSON.stringify({ status }) });
    if (!r.ok) throw new Error('Failed');
    return r.json();
  },
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: ${COLORS.bg};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: ${COLORS.text};
`;

const Header = styled.div`
  background: ${COLORS.surface};
  border-bottom: 1px solid ${COLORS.border};
  padding: 1rem 1.25rem;
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

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${COLORS.successLight};
  color: ${COLORS.successDark};
  margin-left: 0.75rem;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${COLORS.success};
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
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

  &:disabled {
    background: ${COLORS.textMuted};
    cursor: not-allowed;
    transform: none;
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
  padding: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: ${props => props.$bg || COLORS.surface};
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowSm};
  border: 1px solid ${COLORS.border};
  padding: 1rem;
  transition: ${COLORS.transition};

  &:hover {
    box-shadow: ${COLORS.shadowMd};
    transform: translateY(-2px);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const StatLabel = styled.div`
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${COLORS.textSecondary};
`;

const StatIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${COLORS.radiusSm};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$bg};
  color: ${props => props.$color};
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${COLORS.text};
  line-height: 1.2;
  margin-bottom: 0.25rem;
`;

const StatSubtext = styled.div`
  font-size: 0.75rem;
  color: ${COLORS.textSecondary};
`;

const FilterCard = styled.div`
  background: ${COLORS.surface};
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowSm};
  border: 1px solid ${COLORS.border};
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: ${props => props.$marginBottom || '0'};
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  font-size: 0.8125rem;
  color: ${COLORS.text};
  background: ${COLORS.surface};
  transition: ${COLORS.transition};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.accentGlow || 'rgba(59, 130, 246, 0.1)'};
  }
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  font-size: 0.8125rem;
  color: ${COLORS.text};
  background: ${COLORS.surface};
  cursor: pointer;
  transition: ${COLORS.transition};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.accentGlow || 'rgba(59, 130, 246, 0.1)'};
  }
`;

const PillGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
`;

const Pill = styled.button`
  padding: 0.375rem 0.75rem;
  border: 1px solid ${COLORS.border};
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: ${COLORS.transition};
  background: ${COLORS.surface};
  color: ${COLORS.textSecondary};

  &:hover {
    background: ${COLORS.bg};
    border-color: ${COLORS.primary};
    color: ${COLORS.primary};
  }

  ${props => props.$active && `
    background: ${COLORS.primary};
    color: ${COLORS.white};
    border-color: ${COLORS.primary};
  `}
`;

const TableCard = styled.div`
  background: ${COLORS.surface};
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowSm};
  border: 1px solid ${COLORS.border};
  overflow: hidden;
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
  cursor: pointer;
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

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    const cfg = STATUS_CONFIG[props.$status];
    return cfg ? cfg.bg : COLORS.borderLight;
  }};
  color: ${props => {
    const cfg = STATUS_CONFIG[props.$status];
    return cfg ? cfg.color : COLORS.textSecondary;
  }};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => {
    const cfg = STATUS_CONFIG[props.$status];
    return cfg ? cfg.dotColor : COLORS.textMuted;
  }};
  }
`;

const ActionButton = styled.button`
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
    color: ${COLORS.text};
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

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid ${COLORS.border};
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const PageInfo = styled.span`
  font-size: 0.8rem;
  color: ${COLORS.textSecondary};
`;

const PageButtons = styled.div`
  display: flex;
  gap: 0.25rem;
  align-items: center;
`;

const PageButton = styled.button`
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  background: ${COLORS.surface};
  color: ${COLORS.textSecondary};
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: ${COLORS.transition};

  &:hover:not(:disabled) {
    background: ${COLORS.bg};
    border-color: ${COLORS.primary};
    color: ${COLORS.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${props => props.$active && `
    background: ${COLORS.primary};
    color: ${COLORS.white};
    border-color: ${COLORS.primary};
  `}
`;

const DrawerOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9998;
  animation: ${fadeIn} 0.12s ease-out;
  backdrop-filter: blur(3px);
`;

const Drawer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 480px;
  max-width: 100%;
  background: ${COLORS.surface};
  box-shadow: ${COLORS.shadowLg};
  z-index: 9999;
  transform: translateX(${props => props.$open ? '0' : '100%'});
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
`;

const DrawerHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${COLORS.bg};
`;

const DrawerTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: ${COLORS.text};
`;

const DrawerSubtitle = styled.p`
  font-size: 0.8125rem;
  color: ${COLORS.textSecondary};
  margin: 0.25rem 0 0;
`;

const DrawerBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const DrawerFooter = styled.div`
  padding: 1rem 1.25rem;
  border-top: 1px solid ${COLORS.border};
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const DetailItem = styled.div`
  padding: 0.75rem;
  background: ${COLORS.bg};
  border-radius: ${COLORS.radiusSm};
  border: 1px solid ${COLORS.border};
`;

const DetailLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${COLORS.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${COLORS.text};
  word-break: break-word;
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Toast = styled.div`
  padding: 0.875rem 1.25rem;
  border-radius: ${COLORS.radiusSm};
  font-size: 0.8125rem;
  font-weight: 500;
  box-shadow: ${COLORS.shadowMd};
  animation: ${fadeIn} 0.2s ease-out;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.type === 'error' ? COLORS.dangerLight : COLORS.successLight};
  color: ${props => props.type === 'error' ? COLORS.dangerDark : COLORS.successDark};
  border: 1px solid ${props => props.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'};
`;

const getTenantSlugFunc = getTenantSlug;

const HearseBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [allHearses, setAllHearses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(formatDateStr(new Date()));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [actionMenuId, setActionMenuId] = useState(null);
  const actionMenuRef = useRef(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [prefillDate, setPrefillDate] = useState('');
  const { socket } = useSocket();
  const { user } = useAuthStore();

  const [newForm, setNewForm] = useState({
    hearse_id: '', client_name: '', client_phone: '', from_location: '', to_location: '', booking_date: '', branch_id: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const showToast = useCallback((msg, type = 'success') => {
    setToasts(p => [...p, { id: Date.now(), message: msg, type }]);
  }, []);
  const removeToast = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);

  const getDateRange = useCallback((filter) => {
    const today = new Date(), ts = formatDateStr(today);
    switch (filter) {
      case 'today': return { start: ts, end: ts };
      case 'tomorrow': { const d = new Date(today); d.setDate(d.getDate() + 1); const s = formatDateStr(d); return { start: s, end: s }; }
      case 'thisWeek': { const dow = today.getDay(), mon = new Date(today); mon.setDate(today.getDate() - ((dow + 6) % 7)); const sun = new Date(mon); sun.setDate(mon.getDate() + 6); return { start: formatDateStr(mon), end: formatDateStr(sun) }; }
      case 'nextWeek': { const dow = today.getDay(), nm = new Date(today); nm.setDate(today.getDate() + (7 - ((dow + 6) % 7))); const ns = new Date(nm); ns.setDate(nm.getDate() + 6); return { start: formatDateStr(nm), end: formatDateStr(ns) }; }
      case 'thisMonth': return { start: formatDateStr(new Date(today.getFullYear(), today.getMonth(), 1)), end: formatDateStr(new Date(today.getFullYear(), today.getMonth() + 1, 0)) };
      case 'nextMonth': { const nm = today.getMonth() + 1, y = nm > 11 ? today.getFullYear() + 1 : today.getFullYear(), m = nm > 11 ? 0 : nm; return { start: formatDateStr(new Date(y, m, 1)), end: formatDateStr(new Date(y, m + 1, 0)) }; }
      default: return { start: null, end: null };
    }
  }, []);

  const handleDateFilter = useCallback((f) => { setDateFilter(f); setCurrentPage(1); }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bks, brs, hrs] = await Promise.all([api.getBookings(), api.getBranches(), api.getAllHearses()]);
      setBookings(bks);
      setBranches(brs);
      setAllHearses(hrs);
    } catch (e) { showToast('Failed to load data', 'error'); }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_booking', (d) => { setBookings(p => [d.booking, ...p]); showToast('New booking!'); });
    socket.on('booking_status_updated', (d) => { setBookings(p => p.map(b => b.booking_id === d.booking_id ? { ...b, status: d.status, ...d.booking } : b)); });
    socket.on('booking_postponed', () => loadData());
    return () => { socket.off('new_booking'); socket.off('booking_status_updated'); socket.off('booking_postponed'); };
  }, [socket, showToast, loadData]);

  const filtered = useMemo(() => {
    let result = [...bookings];
    if (filterStatus) result = result.filter(b => b.status === filterStatus);
    if (filterBranch) result = result.filter(b => String(b.branch_id) === String(filterBranch));
    if (dateFilter !== 'all') {
      const range = getDateRange(dateFilter);
      if (range.start && range.end) {
        result = result.filter(b => {
          const d = b.booking_date || b.estimated_departure_time || '';
          return d >= range.start && d <= range.end;
        });
      }
    }
    if (searchInput.trim()) {
      const q = searchInput.toLowerCase();
      result = result.filter(b =>
        (b.client_name || '').toLowerCase().includes(q) ||
        (b.booking_code || genId(b.booking_id) || '').toLowerCase().includes(q) ||
        (b.destination || '').toLowerCase().includes(q) ||
        (b.hearse_name || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [bookings, filterStatus, filterBranch, dateFilter, getDateRange, searchInput]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / RESULTS_PER_PAGE));
  const pageData = filtered.slice((currentPage - 1) * RESULTS_PER_PAGE, currentPage * RESULTS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [filterStatus, filterBranch, dateFilter, searchInput]);
  useEffect(() => {
    const handler = (e) => { if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) setActionMenuId(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending' || b.status === 'booked').length;
    const inProgress = bookings.filter(b => b.status === 'in_transit').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const active = bookings.filter(b => !['completed', 'cancelled'].includes(b.status)).length;
    return { total, pending, inProgress, completed, active };
  }, [bookings]);

  const openDrawer = useCallback((b) => { setSelectedBooking(b); setDrawerOpen(true); setActionMenuId(null); }, []);
  const closeDrawer = useCallback(() => { setDrawerOpen(false); setSelectedBooking(null); }, []);

  const changeStatus = useCallback(async (id, status) => {
    try {
      await api.updateStatus(id, status);
      setBookings(p => p.map(b => b.booking_id === id ? { ...b, status } : b));
      if (selectedBooking && (selectedBooking.booking_id === id || selectedBooking.id === id)) {
        setSelectedBooking(p => ({ ...p, status }));
      }
      showToast(`Status → ${STATUS_CONFIG[status].label}`);
      setActionMenuId(null);
    } catch { showToast('Failed to update', 'error'); }
  }, [selectedBooking, showToast]);

  const getNextStatuses = (status) => {
    switch (status) {
      case 'pending': return ['booked', 'cancelled'];
      case 'booked': return ['in_transit', 'cancelled'];
      case 'in_transit': return ['completed'];
      case 'completed': return [];
      case 'cancelled': return ['pending'];
      case 'postponed': return ['booked'];
      case 'maintenance': return ['booked'];
      default: return [];
    }
  };

  const openNewBooking = useCallback((date) => {
    const dateStr = date || '';
    setPrefillDate(dateStr);
    setNewForm({ hearse_id: '', client_name: '', client_phone: '', from_location: '', to_location: '', booking_date: dateStr, branch_id: '' });
    setNewBookingOpen(true);
  }, []);
  const closeNewBooking = useCallback(() => { setNewBookingOpen(false); setPrefillDate(''); }, []);

  const handleNewBooking = useCallback(async (e) => {
    e.preventDefault();
    if (!newForm.hearse_id || !newForm.client_name || !newForm.from_location || !newForm.to_location || !newForm.booking_date) {
      showToast('Please fill all required fields', 'error'); return;
    }
    setSubmitLoading(true);
    try {
      const headers = getAuthHeaders();
      headers['Content-Type'] = 'application/json';
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      if (user?.branch_id) headers['x-branch-id'] = user.branch_id;
      if (user?.email) headers['x-user-email'] = user.email;
      headers['x-user-name'] = user?.full_name || user?.username || user?.name || 'System';

      const requestBody = {
        hearse_id: newForm.hearse_id,
        client_name: newForm.client_name,
        client_phone: newForm.client_phone || '',
        from_location: newForm.from_location,
        to_location: newForm.to_location,
        from_timestamp: newForm.booking_date,
        booked_by: user?.email || 'system',
        branch_id: newForm.branch_id || user?.branch_id || '',
        branch_code: user?.branch_code || ''
      };

      const response = await fetch(`${API_BASE_URL}/hearse-bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      showToast('Booking created successfully!');
      closeNewBooking();
      await loadData();
    } catch (e) {
      showToast('Failed to create booking: ' + e.message, 'error');
    }
    setSubmitLoading(false);
  }, [newForm, showToast, closeNewBooking, loadData]);

  const calendarItems = useMemo(() => {
    return bookings.map(b => ({
      ...b,
      date: formatDateStr(b.booking_date || b.estimated_departure_time),
    }));
  }, [bookings]);

  const getBookingTime = useCallback((item) => {
    if (item.booking_date && item.booking_date.includes('T')) {
      return new Date(item.booking_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (item.estimated_departure_time) {
      return new Date(item.estimated_departure_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return '';
  }, []);

  const getBookingStatus = useCallback((item) => {
    const cfg = STATUS_CONFIG[item.status];
    if (!cfg) return null;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.25rem 0.6rem',
        borderRadius: '6px',
        fontSize: '0.68rem',
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}33`
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dotColor }} />
        {cfg.label}
      </span>
    );
  }, []);

  const getStatusColor = useCallback((item) => {
    return STATUS_CONFIG[item.status]?.dotColor || '#a8a29e';
  }, []);

  const getIsUrgent = useCallback((item) => {
    return item.status === 'booked' || item.status === 'in_transit';
  }, []);

  const renderPagination = () => {
    const btns = [];
    const btnStyle = { width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + COLORS.border, borderRadius: 6, background: COLORS.surface, color: COLORS.textSecondary, fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: COLORS.transition };
    const activeBtnStyle = { ...btnStyle, background: COLORS.primary, color: COLORS.white, borderColor: COLORS.primary };
    btns.push(
      <PageButton key="first" style={btnStyle} disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>{Icons.chevFirst}</PageButton>,
      <PageButton key="prev" style={btnStyle} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>{Icons.chevLeft}</PageButton>
    );
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1) {
        if (i === 3 || i === totalPages - 2) btns.push(<span key={`dots-${i}`} style={{ padding: '0 0.25rem', color: COLORS.textMuted, fontSize: '0.8rem' }}>…</span>);
        continue;
      }
      btns.push(<PageButton key={i} style={currentPage === i ? activeBtnStyle : btnStyle} onClick={() => setCurrentPage(i)} $active={currentPage === i}>{i}</PageButton>);
    }
    btns.push(
      <PageButton key="next" style={btnStyle} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>{Icons.chevRight}</PageButton>,
      <PageButton key="last" style={btnStyle} disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>{Icons.chevLast}</PageButton>
    );
    return btns;
  };

  if (loading) return (
    <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <RefreshCw size={32} color={COLORS.primary} className="animate-spin" />
    </Container>
  );

  const branchOptions = branches.length > 0 ? branches : [];

  return (
    <Container>
      <Header>
        <HeaderContent>
          <div>
            <Title>
              <Truck size={24} />
              Hearse Bookings
              <LiveBadge>Live</LiveBadge>
            </Title>
            <div style={{ fontSize: '0.8125rem', color: COLORS.textSecondary, marginTop: '0.25rem' }}>
              {stats.active} active booking{stats.active !== 1 ? 's' : ''}
            </div>
          </div>
          <HeaderActions>
            <SecondaryButton onClick={loadData}>
              {Icons.refresh} Refresh
            </SecondaryButton>
            <PrimaryButton onClick={() => openNewBooking('')}>
              {Icons.plus} New Booking
            </PrimaryButton>
          </HeaderActions>
        </HeaderContent>
      </Header>

      <MainContent>
        {/* Stats Cards */}
        <StatsGrid>
          <StatCard $bg="#f0f7f4">
            <StatHeader>
              <StatLabel>Total Bookings</StatLabel>
              <StatIcon $bg="#f0f7f4" $color="#266b52">{Icons.truck}</StatIcon>
            </StatHeader>
            <StatValue>{stats.total}</StatValue>
            <StatSubtext>All time</StatSubtext>
          </StatCard>

          <StatCard $bg="#dbeafe">
            <StatHeader>
              <StatLabel>Active</StatLabel>
              <StatIcon $bg={COLORS.infoLight} $color={COLORS.infoDark}>{Icons.car}</StatIcon>
            </StatHeader>
            <StatValue>{stats.active}</StatValue>
            <StatSubtext style={{ color: COLORS.info }}>In progress</StatSubtext>
          </StatCard>

          <StatCard $bg="#fef3c7">
            <StatHeader>
              <StatLabel>Pending</StatLabel>
              <StatIcon $bg={COLORS.warningLight} $color={COLORS.warningDark}>{Icons.clock}</StatIcon>
            </StatHeader>
            <StatValue>{stats.pending}</StatValue>
            <StatSubtext style={{ color: COLORS.warning }}>Needs attention</StatSubtext>
          </StatCard>

          <StatCard $bg="#fce7f3">
            <StatHeader>
              <StatLabel>In Transit</StatLabel>
              <StatIcon $bg="#fce7f3" $color="#db2777">{Icons.truck}</StatIcon>
            </StatHeader>
            <StatValue>{stats.inProgress}</StatValue>
            <StatSubtext style={{ color: '#db2777' }}>On the road</StatSubtext>
          </StatCard>

          <StatCard $bg="#d1fae5">
            <StatHeader>
              <StatLabel>Completed</StatLabel>
              <StatIcon $bg={COLORS.successLight} $color={COLORS.successDark}>{Icons.check}</StatIcon>
            </StatHeader>
            <StatValue>{stats.completed}</StatValue>
            <StatSubtext style={{ color: COLORS.success }}>Delivered</StatSubtext>
          </StatCard>
        </StatsGrid>

        {/* Filters */}
        <FilterCard>
          <FilterRow>
            <SearchInput
              type="text"
              placeholder="Search client, ID, destination..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
              <option value="">All Branches</option>
              {branchOptions.map((b) => (<option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>))}
              {branchOptions.length === 0 && <option value="">No branches</option>}
            </Select>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <ActionButton onClick={() => setViewMode('table')} style={{ background: viewMode === 'table' ? COLORS.primary : COLORS.surface, color: viewMode === 'table' ? COLORS.white : COLORS.textSecondary }}>
                {Icons.list}
              </ActionButton>
              <ActionButton onClick={() => setViewMode('calendar')} style={{ background: viewMode === 'calendar' ? COLORS.primary : COLORS.surface, color: viewMode === 'calendar' ? COLORS.white : COLORS.textSecondary }}>
                {Icons.grid}
              </ActionButton>
            </div>
          </FilterRow>

          <FilterRow $marginBottom="0.5rem">
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ minWidth: '180px' }}>
              <option value="">All Statuses</option>
              {STATUS_LIST.map((status) => {
                const cfg = STATUS_CONFIG[status];
                return (
                  <option key={status} value={status}>
                    {cfg?.label || status}
                  </option>
                );
              })}
            </Select>
          </FilterRow>
        </FilterCard>

        {/* Main Table */}
        <TableCard>
          {viewMode === 'table' && (
            <>
              <div style={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeader>Booking ID</TableHeader>
                      <TableHeader>Client</TableHeader>
                      <TableHeader>Destination</TableHeader>
                      <TableHeader>Hearse</TableHeader>
                      <TableHeader>Branch</TableHeader>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader style={{ width: 40 }}></TableHeader>
                    </tr>
                  </TableHead>
                  <tbody>
                    {pageData.map((b) => (
                      <TableRow key={b.booking_id || b.id} onClick={() => openDrawer(b)}>
                        <TableCell>
                          <span style={{ fontWeight: 500, fontSize: '0.75rem', color: COLORS.textSecondary }}>
                            {b.booking_code || genId(b.booking_id, b.plate_number || b.number_plate)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div style={{ fontWeight: 500 }}>{b.client_name}</div>
                          {b.client_phone && <div style={{ fontSize: '0.72rem', color: COLORS.textMuted, marginTop: '0.15rem' }}>{b.client_phone}</div>}
                        </TableCell>
                        <TableCell>
                          <div style={{ fontSize: '0.8125rem' }}>{b.destination || 'N/A'}</div>
                          {b.end_date && <div style={{ fontSize: '0.72rem', color: '#8b5cf6', marginTop: '0.15rem' }}>Multi-day → {fmtDateOnly(b.end_date)}</div>}
                        </TableCell>
                        <TableCell>
                          <span style={{ fontWeight: 500, fontSize: '0.75rem' }}>{b.plate_number || b.number_plate || 'N/A'}</span>
                          <div style={{ fontSize: '0.72rem', color: COLORS.textMuted, marginTop: '0.15rem' }}>{b.hearse_name || ''}</div>
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: COLORS.bg, borderRadius: '0.25rem' }}>
                            {b.branch_name || b.branch_code || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>{fmtDateOnly(b.booking_date || b.estimated_departure_time)}</div>
                          {b.delivery_time && <div style={{ fontSize: '0.72rem', color: COLORS.textMuted, marginTop: '0.15rem' }}>{b.delivery_time}</div>}
                        </TableCell>
                        <TableCell>
                          <StatusBadge $status={b.status}>
                            {STATUS_CONFIG[b.status]?.label || b.status}
                          </StatusBadge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div style={{ position: 'relative' }} ref={actionMenuId === (b.booking_id || b.id) ? actionMenuRef : null}>
                            <ActionButton onClick={() => setActionMenuId(actionMenuId === (b.booking_id || b.id) ? null : (b.booking_id || b.id))}>
                              {Icons.moreV}
                            </ActionButton>
                            {actionMenuId === (b.booking_id || b.id) && (
                              <div style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                background: COLORS.surface,
                                border: `1px solid ${COLORS.border}`,
                                borderRadius: COLORS.radiusSm,
                                boxShadow: COLORS.shadowLg,
                                minWidth: '180px',
                                zIndex: 1000,
                                marginTop: '0.25rem'
                              }}>
                                <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  Change Status
                                </div>
                                <select
                                  value=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      changeStatus(b.booking_id || b.id, e.target.value);
                                      setActionMenuId(null);
                                    }
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    border: 'none',
                                    background: COLORS.bg,
                                    color: COLORS.text,
                                    fontSize: '0.8125rem',
                                    cursor: 'pointer',
                                    borderRadius: '0.25rem',
                                    margin: '0.25rem 0'
                                  }}
                                >
                                  <option value="">Select status...</option>
                                  {getNextStatuses(b.status).map((s) => (
                                    <option key={s} value={s}>
                                      {STATUS_CONFIG[s]?.label || s}
                                    </option>
                                  ))}
                                </select>
                                <div style={{ height: 1, background: COLORS.border, margin: '0.25rem 0' }} />
                                <button
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    border: 'none',
                                    background: 'transparent',
                                    color: COLORS.text,
                                    fontSize: '0.8125rem',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                  }}
                                  onClick={() => openDrawer(b)}
                                  onMouseEnter={(e) => e.target.style.background = COLORS.bg}
                                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                  View Details
                                </button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </div>
              {pageData.length === 0 && (
                <EmptyState>
                  <Search size={48} />
                  <h4>No bookings found</h4>
                  <p>Try adjusting your search or filters</p>
                </EmptyState>
              )}
              <Pagination>
                <PageInfo>
                  {filtered.length > 0 ? `${(currentPage - 1) * RESULTS_PER_PAGE + 1}–${Math.min(currentPage * RESULTS_PER_PAGE, filtered.length)} of ${filtered.length} bookings` : '0 bookings'}
                </PageInfo>
                <PageButtons>{renderPagination()}</PageButtons>
              </Pagination>
            </>
          )}

          {viewMode === 'calendar' && (
            <div style={{ padding: '1rem' }}>
              <ReusableCalendar
                items={calendarItems}
                dateKey="date"
                idKey="booking_id"
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onItemClick={openDrawer}
                onAddForDate={(dateStr) => openNewBooking(dateStr)}
                showAddButton={true}
                addButtonText="Book"
                getStatusColor={getStatusColor}
                getIsUrgent={getIsUrgent}
                getItemTitle={(item) => item.client_name}
                getItemSubtitle={(item) => {
                  const time = getBookingTime(item);
                  const hearse = item.hearse_name || item.plate_number || '';
                  return time ? `${time}${hearse ? ' · ' + hearse : ''}` : hearse;
                }}
                getItemMeta={(item) => item.destination || ''}
                getItemStatus={getBookingStatus}
                accentColor={COLORS.primary}
              />
            </div>
          )}
        </TableCard>
      </MainContent>

      {/* Detail Drawer */}
      {drawerOpen && <DrawerOverlay onClick={closeDrawer} />}
      <Drawer $open={drawerOpen}>
        {selectedBooking && (
          <>
            <DrawerHeader>
              <div>
                <DrawerTitle>
                  {selectedBooking.booking_code || genId(selectedBooking.booking_id, selectedBooking.plate_number || selectedBooking.number_plate)}
                </DrawerTitle>
                <DrawerSubtitle>
                  <StatusBadge $status={selectedBooking.status}>
                    {STATUS_CONFIG[selectedBooking.status]?.label || selectedBooking.status}
                  </StatusBadge>
                </DrawerSubtitle>
              </div>
              <ActionButton onClick={closeDrawer}>{Icons.x}</ActionButton>
            </DrawerHeader>
            <DrawerBody>
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: COLORS.bg,
                borderRadius: COLORS.radiusSm,
                alignItems: 'center'
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: COLORS.radiusSm,
                  background: COLORS.infoLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: COLORS.info,
                  flexShrink: 0
                }}>
                  {Icons.truck}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.15rem' }}>
                    {selectedBooking.hearse_name || 'Vehicle'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      background: COLORS.surface,
                      borderRadius: '0.25rem',
                      border: `1px solid ${COLORS.border}`
                    }}>
                      {selectedBooking.plate_number || selectedBooking.number_plate || 'N/A'}
                    </span>
                    {selectedBooking.model && <span style={{ marginLeft: '0.5rem' }}>{selectedBooking.model}</span>}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: COLORS.primary, marginTop: '0.35rem' }}>
                    {selectedBooking.client_name}
                  </div>
                </div>
              </div>

              <DetailGrid>
                <DetailItem>
                  <DetailLabel>Client</DetailLabel>
                  <DetailValue>{selectedBooking.client_name}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Phone</DetailLabel>
                  <DetailValue>{selectedBooking.client_phone || '—'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>From</DetailLabel>
                  <DetailValue>{selectedBooking.from_location || '—'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>To</DetailLabel>
                  <DetailValue>{selectedBooking.to_location || '—'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Branch</DetailLabel>
                  <DetailValue>
                    {selectedBooking.branch_name || branchOptions.find(b => String(b.branch_id) === String(selectedBooking.branch_id))?.branch_name || selectedBooking.branch_code || '—'}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Date</DetailLabel>
                  <DetailValue>{fmtDateOnly(selectedBooking.booking_date || selectedBooking.estimated_departure_time)}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Status</DetailLabel>
                  <DetailValue>
                    <StatusBadge $status={selectedBooking.status}>
                      {STATUS_CONFIG[selectedBooking.status]?.label || selectedBooking.status}
                    </StatusBadge>
                  </DetailValue>
                </DetailItem>
                {selectedBooking.end_date && (
                  <DetailItem>
                    <DetailLabel>End Date</DetailLabel>
                    <DetailValue>{fmtDateOnly(selectedBooking.end_date)}</DetailValue>
                  </DetailItem>
                )}
                <DetailItem>
                  <DetailLabel>Booked By</DetailLabel>
                  <DetailValue>{selectedBooking.booked_by_name || selectedBooking.booked_by || user?.email || '—'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Created</DetailLabel>
                  <DetailValue>{fmtDate(selectedBooking.created_at)}</DetailValue>
                </DetailItem>
                {selectedBooking.updated_at && (
                  <DetailItem>
                    <DetailLabel>Updated</DetailLabel>
                    <DetailValue>{fmtDate(selectedBooking.updated_at)}</DetailValue>
                  </DetailItem>
                )}
              </DetailGrid>

              <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.textSecondary, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Quick Actions
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {getNextStatuses(selectedBooking.status).map((s) => (
                    <PrimaryButton
                      key={s}
                      onClick={() => changeStatus(selectedBooking.booking_id || selectedBooking.id, s)}
                      style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
                    >
                      Move to {STATUS_CONFIG[s].label}
                    </PrimaryButton>
                  ))}
                </div>
              </div>
            </DrawerBody>
          </>
        )}
      </Drawer>

      {/* New Booking Drawer */}
      {newBookingOpen && <DrawerOverlay onClick={closeNewBooking} />}
      <Drawer $open={newBookingOpen} style={{ width: '600px' }}>
        <DrawerHeader style={{ background: COLORS.primaryDark }}>
          <div>
            <DrawerTitle style={{ color: COLORS.white }}>New Hearse Booking</DrawerTitle>
            <DrawerSubtitle style={{ color: 'rgba(255,255,255,0.7)' }}>Book a hearse for a funeral service trip</DrawerSubtitle>
          </div>
          <ActionButton onClick={closeNewBooking} style={{ color: COLORS.white }}>{Icons.x}</ActionButton>
        </DrawerHeader>
        <DrawerBody>
          <form onSubmit={handleNewBooking}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8125rem', color: COLORS.text }}>
                  Client Name *
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: COLORS.radiusSm,
                    fontSize: '0.8125rem',
                    color: COLORS.text,
                    background: COLORS.surface
                  }}
                  placeholder="Full name"
                  value={newForm.client_name}
                  onChange={e => setNewForm(p => ({ ...p, client_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8125rem', color: COLORS.text }}>
                  Phone
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: COLORS.radiusSm,
                    fontSize: '0.8125rem',
                    color: COLORS.text,
                    background: COLORS.surface
                  }}
                  placeholder="0712 345 678"
                  value={newForm.client_phone}
                  onChange={e => setNewForm(p => ({ ...p, client_phone: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8125rem', color: COLORS.text }}>
                  Select Hearse *
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: COLORS.radiusSm,
                    fontSize: '0.8125rem',
                    color: COLORS.text,
                    background: COLORS.surface
                  }}
                  value={newForm.hearse_id}
                  onChange={e => setNewForm(p => ({ ...p, hearse_id: e.target.value }))}
                  required
                >
                  <option value="">— Select —</option>
                  {allHearses.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.hearse_name || 'N/A'} — {h.plate_number || h.number_plate} {h.branch_name ? `(${h.branch_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8125rem', color: COLORS.text }}>
                  Booking Date *
                </label>
                <input
                  type="date"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: COLORS.radiusSm,
                    fontSize: '0.8125rem',
                    color: COLORS.text,
                    background: COLORS.surface
                  }}
                  value={newForm.booking_date}
                  onChange={e => setNewForm(p => ({ ...p, booking_date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8125rem', color: COLORS.text }}>
                  From Location *
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: COLORS.radiusSm,
                    fontSize: '0.8125rem',
                    color: COLORS.text,
                    background: COLORS.surface
                  }}
                  placeholder="e.g., Nairobi CBD"
                  value={newForm.from_location}
                  onChange={e => setNewForm(p => ({ ...p, from_location: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8125rem', color: COLORS.text }}>
                  To Location *
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: COLORS.radiusSm,
                    fontSize: '0.8125rem',
                    color: COLORS.text,
                    background: COLORS.surface
                  }}
                  placeholder="e.g., Karen Memorial Park"
                  value={newForm.to_location}
                  onChange={e => setNewForm(p => ({ ...p, to_location: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8125rem', color: COLORS.text }}>
                Branch
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: COLORS.radiusSm,
                  fontSize: '0.8125rem',
                  color: COLORS.text,
                  background: COLORS.surface
                }}
                value={newForm.branch_id}
                onChange={e => setNewForm(p => ({ ...p, branch_id: e.target.value }))}
              >
                <option value="">— Default —</option>
                {branchOptions.map(b => (
                  <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <SecondaryButton type="button" onClick={closeNewBooking}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={submitLoading}>
                {submitLoading ? 'Creating...' : 'Create Booking'}
              </PrimaryButton>
            </div>
          </form>
        </DrawerBody>
      </Drawer>

      {/* Toasts */}
      <ToastContainer>
        {toasts.map((t) => <Toast key={t.id} type={t.type} onDone={() => removeToast(t.id)}>{t.message}</Toast>)}
      </ToastContainer>
    </Container>
  );
};

export default HearseBookings;