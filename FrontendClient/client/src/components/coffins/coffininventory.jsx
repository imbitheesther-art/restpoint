import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  Search, Plus, Edit, Trash2, Eye, Package, AlertTriangle,
  Filter, Download, Upload, Box, Database, RotateCw, Settings,
  Flame, XCircle, Trophy, ChevronLeft, ChevronRight, BarChart3,
  Users, Tag, DollarSign, Warehouse, Image as ImageIcon,
  Calendar, User, Truck, Layers, Clock, PersonStanding,
  Save, Users as UsersIcon, FileSpreadsheet, Grid3x3, List,
  Home, ChevronDown, ShoppingBag, Star, Heart, Share2,
  MoreHorizontal, CheckCircle, AlertCircle, Info, MinusCircle,
  PlusCircle, RefreshCw, Printer, FileText, ArrowUpDown,
  ArrowUp, ArrowDown, SearchX, SlidersHorizontal, Maximize2,
  Diamond, CheckSquare, XSquare, Loader2, ClipboardList,
  Phone, Mail, MapPin, FileSignature, StickyNote
} from 'lucide-react';
import env from '../../utils/config/env';

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

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

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
  padding: 1.5rem;
`;

const TabContainer = styled.div`
  background: ${COLORS.surface};
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowSm};
  border: 1px solid ${COLORS.border};
  overflow: hidden;
  margin-bottom: 1rem;
`;

const TabHeader = styled.div`
  display: flex;
  background: ${COLORS.bg};
  border-bottom: 1px solid ${COLORS.border};
`;

const TabButton = styled.button`
  flex: 1;
  padding: 0.875rem 1.25rem;
  background: transparent;
  border: none;
  color: ${COLORS.textSecondary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: ${COLORS.transition};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;

  &:hover {
    color: ${COLORS.primary};
    background: ${COLORS.surface};
  }

  ${props => props.$active && `
    color: ${COLORS.primary};
    border-bottom-color: ${COLORS.primary};
    background: ${COLORS.surface};
    font-weight: 600;
  `}
`;

const TabContent = styled.div`
  padding: 1.25rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: ${COLORS.surface};
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowSm};
  border: 1px solid ${COLORS.border};
  padding: 1.25rem;
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
  padding: 1rem 1.25rem;
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
    box-shadow: 0 0 0 3px ${COLORS.accentGlow};
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
    box-shadow: 0 0 0 3px ${COLORS.accentGlow};
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
    switch (props.$status) {
      case 'available': return COLORS.successLight;
      case 'booked': return COLORS.warningLight;
      case 'in-store': return COLORS.infoLight;
      default: return COLORS.borderLight;
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'available': return COLORS.successDark;
      case 'booked': return COLORS.warningDark;
      case 'in-store': return COLORS.infoDark;
      default: return COLORS.textSecondary;
    }
  }};
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
  width: 600px;
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
  padding: 1.25rem;
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
  padding: 1.25rem;
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

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.375rem;
  font-size: 0.8125rem;
  color: ${COLORS.text};

  .required {
    color: ${COLORS.danger};
    margin-left: 0.25rem;
  }
`;

const Input = styled.input`
  width: 100%;
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
    box-shadow: 0 0 0 3px ${COLORS.accentGlow};
  }

  &:disabled {
    background: ${COLORS.bg};
    color: ${COLORS.textSecondary};
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  font-size: 0.8125rem;
  color: ${COLORS.text};
  background: ${COLORS.surface};
  transition: ${COLORS.transition};
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.accentGlow};
  }
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

const CoffinInventory = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [coffins, setCoffins] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCoffin, setSelectedCoffin] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCoffinDetailModal, setShowCoffinDetailModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [registerFormData, setRegisterFormData] = useState({
    type: '', material: '', size: '', color: '', quantity: '',
    exact_price: '', currency: 'KES', supplier: '', origin: '', category: 'locally_made',
    store_location: '', shelf_number: '', notes: ''
  });
  const [bookingFormData, setBookingFormData] = useState({
    client_name: '', client_phone: '', client_email: '', client_address: '',
    coffin_id: '', booking_date: '', event_date: '', special_requirements: '', notes: ''
  });
  const [registerImageFiles, setRegisterImageFiles] = useState([]);
  const [registerImagePreviews, setRegisterImagePreviews] = useState([]);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [activeTab, setActiveTab] = useState('inventory');

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const getTenantHeaders = () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const headers = { 'x-tenant-slug': getTenantSlug() };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  // Fetch coffins
  const fetchCoffins = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${env.FULL_API_URL}/api/v1/restpoint/coffins`, {
        headers: getTenantHeaders()
      });
      const result = await response.json();
      if (result.success || result.data) {
        const coffinsData = result.data || result.coffins || [];
        setCoffins(coffinsData);
        showToast('Coffins loaded successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to load coffins:', error);
      showToast('Failed to load coffins', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch(`${env.FULL_API_URL}/api/v1/restpoint/coffin-bookings`, {
        headers: getTenantHeaders()
      });
      const result = await response.json();
      if (result.success || result.data) {
        const bookingsData = result.data || result.bookings || [];
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  }, []);

  useEffect(() => {
    fetchCoffins();
    fetchBookings();
  }, [fetchCoffins, fetchBookings]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalModels = coffins.length;
    const totalStock = coffins.reduce((sum, c) => sum + (c.quantity || 0), 0);
    const inStore = coffins.filter(c => c.status === 'in-store').length;
    const available = coffins.filter(c => c.status === 'available' || !c.status).length;
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;

    return [
      { title: 'Total Models', value: totalModels, icon: <Box size={18} />, bg: COLORS.infoLight, color: COLORS.infoDark },
      { title: 'Total Stock', value: totalStock, icon: <Database size={18} />, bg: COLORS.successLight, color: COLORS.successDark },
      { title: 'In Store', value: inStore, icon: <Warehouse size={18} />, bg: '#fef3c7', color: COLORS.warningDark },
      { title: 'Available', value: available, icon: <CheckCircle size={18} />, bg: COLORS.successLight, color: COLORS.successDark },
      { title: 'Total Bookings', value: totalBookings, icon: <ClipboardList size={18} />, bg: '#fce7f3', color: '#db2777' },
      { title: 'Active Bookings', value: activeBookings, icon: <Calendar size={18} />, bg: COLORS.warningLight, color: COLORS.warningDark },
    ];
  }, [coffins, bookings]);

  // Filter coffins
  const filteredCoffins = useMemo(() => {
    let filtered = coffins;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(coffin =>
        coffin.type?.toLowerCase().includes(term) ||
        coffin.custom_id?.toLowerCase().includes(term) ||
        coffin.material?.toLowerCase().includes(term) ||
        coffin.supplier?.toLowerCase().includes(term) ||
        coffin.store_location?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter || (!c.status && statusFilter === 'available'));
    }
    return filtered;
  }, [coffins, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCoffins.length / itemsPerPage));
  const pageData = filteredCoffins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  // Handlers
  const handleAddCoffin = () => {
    setRegisterFormData({
      type: '', material: '', size: '', color: '', quantity: '',
      exact_price: '', currency: 'KES', supplier: '', origin: '', category: 'locally_made',
      store_location: '', shelf_number: '', notes: ''
    });
    setRegisterImageFiles([]);
    setRegisterImagePreviews([]);
    setRegisterError(null);
    setShowRegisterModal(true);
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError(null);

    if (!registerFormData.type || !registerFormData.material || !registerFormData.exact_price) {
      setRegisterError('Model, Material, and Price are required.');
      setRegisterLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(registerFormData).forEach(key => {
        if (registerFormData[key] !== '') formData.append(key, registerFormData[key]);
      });
      registerImageFiles.forEach(file => formData.append('images', file));

      const response = await fetch(`${env.FULL_API_URL}/api/v1/restpoint/coffins/register`, {
        method: 'POST',
        headers: getTenantHeaders(),
        body: formData
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Registration failed');

      showToast('Coffin registered successfully!', 'success');
      setShowRegisterModal(false);
      fetchCoffins();
    } catch (err) {
      setRegisterError(err.message || 'An unexpected error occurred.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleBookCoffin = (coffin) => {
    setBookingFormData({
      client_name: '', client_phone: '', client_email: '', client_address: '',
      coffin_id: coffin.coffin_id, booking_date: new Date().toISOString().split('T')[0],
      event_date: '', special_requirements: '', notes: ''
    });
    setSelectedCoffin(coffin);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);

    try {
      const response = await fetch(`${env.FULL_API_URL}/api/v1/restpoint/coffin-bookings`, {
        method: 'POST',
        headers: {
          ...getTenantHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingFormData)
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Booking failed');

      showToast('Coffin booked successfully!', 'success');
      setShowBookingModal(false);
      fetchBookings();
      fetchCoffins();
    } catch (err) {
      showToast(err.message || 'Booking failed', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDelete = (coffin) => {
    setSelectedCoffin(coffin);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${env.FULL_API_URL}/api/v1/restpoint/coffins/${selectedCoffin.coffin_id}`, {
        method: 'DELETE',
        headers: getTenantHeaders()
      });
      const result = await response.json();
      if (result.success) {
        setCoffins(coffins.filter(c => c.coffin_id !== selectedCoffin.coffin_id));
        showToast('Deleted successfully!', 'success');
      }
    } catch (error) {
      showToast('Delete failed', 'error');
    }
    setShowDeleteModal(false);
    setSelectedCoffin(null);
  };

  const handleEdit = (coffin) => {
    setSelectedCoffin(coffin);
    setEditFormData({
      type: coffin.type || '',
      material: coffin.material || '',
      exact_price: coffin.exact_price || '',
      quantity: coffin.quantity || '',
      supplier: coffin.supplier || '',
      color: coffin.color || '',
      size: coffin.size || '',
      store_location: coffin.store_location || '',
      shelf_number: coffin.shelf_number || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${env.FULL_API_URL}/api/v1/restpoint/coffins/${selectedCoffin.coffin_id}`, {
        method: 'PUT',
        headers: {
          ...getTenantHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });
      const result = await response.json();
      if (result.success) {
        setCoffins(coffins.map(c => c.coffin_id === selectedCoffin.coffin_id ? { ...c, ...editFormData } : c));
        showToast('Updated successfully!', 'success');
        setShowEditModal(false);
        setSelectedCoffin(null);
      }
    } catch (error) {
      showToast('Update failed', 'error');
    }
  };

  const handleViewDetails = (coffin) => {
    setSelectedCoffin(coffin);
    setShowCoffinDetailModal(true);
  };

  const renderPagination = () => {
    const btns = [];
    btns.push(
      <PageButton key="prev" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
        <ChevronLeft size={16} />
      </PageButton>
    );
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1) {
        if (i === 3 || i === totalPages - 2) btns.push(<span key={`dots-${i}`} style={{ padding: '0 0.25rem', color: COLORS.textMuted }}>…</span>);
        continue;
      }
      btns.push(<PageButton key={i} $active={currentPage === i} onClick={() => setCurrentPage(i)}>{i}</PageButton>);
    }
    btns.push(
      <PageButton key="next" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
        <ChevronRight size={16} />
      </PageButton>
    );
    return btns;
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <div>
            <Title>
              <Package size={24} />
              Coffin Management
            </Title>
            <div style={{ fontSize: '0.8125rem', color: COLORS.textSecondary, marginTop: '0.25rem' }}>
              Inventory & Booking System
            </div>
          </div>
          <HeaderActions>
            <SecondaryButton onClick={fetchCoffins}>
              <RefreshCw size={15} /> Refresh
            </SecondaryButton>
            <PrimaryButton onClick={handleAddCoffin}>
              <Plus size={15} /> Add Coffin
            </PrimaryButton>
          </HeaderActions>
        </HeaderContent>
      </Header>

      <MainContent>
        {/* Stats */}
        <StatsGrid>
          {stats.map((stat, index) => (
            <StatCard key={index}>
              <StatHeader>
                <StatLabel>{stat.title}</StatLabel>
                <StatIcon $bg={stat.bg} $color={stat.color}>{stat.icon}</StatIcon>
              </StatHeader>
              <StatValue>{stat.value}</StatValue>
              <StatSubtext>{stat.title.includes('Bookings') ? 'All time' : 'Current'}</StatSubtext>
            </StatCard>
          ))}
        </StatsGrid>

        {/* Tabs */}
        <TabContainer>
          <TabHeader>
            <TabButton $active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>
              <Warehouse size={16} /> Inventory
            </TabButton>
            <TabButton $active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')}>
              <ClipboardList size={16} /> Bookings ({bookings.length})
            </TabButton>
          </TabHeader>

          <TabContent>
            {activeTab === 'inventory' && (
              <>
                {/* Filters */}
                <FilterCard>
                  <FilterRow>
                    <SearchInput
                      type="text"
                      placeholder="Search by name, ID, material, location..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                    <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                      <option value="all">All Status</option>
                      <option value="available">Available</option>
                      <option value="in-store">In Store</option>
                      <option value="booked">Booked</option>
                    </Select>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <ActionButton onClick={() => setViewMode('table')} style={{ background: viewMode === 'table' ? COLORS.primary : COLORS.surface, color: viewMode === 'table' ? COLORS.white : COLORS.textSecondary }}>
                        <List size={16} />
                      </ActionButton>
                      <ActionButton onClick={() => setViewMode('grid')} style={{ background: viewMode === 'grid' ? COLORS.primary : COLORS.surface, color: viewMode === 'grid' ? COLORS.white : COLORS.textSecondary }}>
                        <Grid3x3 size={16} />
                      </ActionButton>
                    </div>
                  </FilterRow>
                </FilterCard>

                {/* Inventory Table/Grid */}
                <TableCard>
                  {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: COLORS.textSecondary }}>
                      <RefreshCw size={32} className="animate-spin" style={{ marginBottom: '1rem' }} />
                      <p>Loading inventory...</p>
                    </div>
                  ) : filteredCoffins.length === 0 ? (
                    <EmptyState>
                      <Package size={48} />
                      <h4>No coffins found</h4>
                      <p>Try adjusting your search or filters</p>
                    </EmptyState>
                  ) : viewMode === 'table' ? (
                    <>
                      <div style={{ overflowX: 'auto' }}>
                        <Table>
                          <TableHead>
                            <tr>
                              <TableHeader>Model</TableHeader>
                              <TableHeader>ID</TableHeader>
                              <TableHeader>Material</TableHeader>
                              <TableHeader>Location</TableHeader>
                              <TableHeader>Price</TableHeader>
                              <TableHeader>Stock</TableHeader>
                              <TableHeader>Status</TableHeader>
                              <TableHeader style={{ width: 120 }}>Actions</TableHeader>
                            </tr>
                          </TableHead>
                          <tbody>
                            {pageData.map((coffin) => (
                              <TableRow key={coffin.coffin_id}>
                                <TableCell>
                                  <div style={{ fontWeight: 500 }}>{coffin.type}</div>
                                  <div style={{ fontSize: '0.72rem', color: COLORS.textMuted }}>{coffin.supplier || 'N/A'}</div>
                                </TableCell>
                                <TableCell style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: COLORS.primary }}>
                                  {coffin.custom_id || `COFF-${coffin.coffin_id}`}
                                </TableCell>
                                <TableCell style={{ fontSize: '0.72rem' }}>{coffin.material || 'N/A'}</TableCell>
                                <TableCell style={{ fontSize: '0.72rem' }}>
                                  {coffin.store_location ? (
                                    <div>
                                      <div>{coffin.store_location}</div>
                                      {coffin.shelf_number && <div style={{ color: COLORS.textMuted }}>Shelf: {coffin.shelf_number}</div>}
                                    </div>
                                  ) : 'Not specified'}
                                </TableCell>
                                <TableCell style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                                  Ksh {parseInt(coffin.exact_price || 0).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{coffin.quantity || 0}</div>
                                </TableCell>
                                <TableCell>
                                  <StatusBadge $status={coffin.status || 'available'}>
                                    {coffin.status === 'in-store' ? 'In Store' : coffin.status === 'booked' ? 'Booked' : 'Available'}
                                  </StatusBadge>
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <ActionButton onClick={() => handleViewDetails(coffin)} title="View">
                                      <Eye size={14} />
                                    </ActionButton>
                                    <ActionButton onClick={() => handleBookCoffin(coffin)} title="Book">
                                      <Calendar size={14} />
                                    </ActionButton>
                                    <ActionButton onClick={() => handleEdit(coffin)} title="Edit">
                                      <Edit size={14} />
                                    </ActionButton>
                                    <ActionButton onClick={() => handleDelete(coffin)} title="Delete">
                                      <Trash2 size={14} />
                                    </ActionButton>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      {filteredCoffins.length > 0 && (
                        <Pagination>
                          <PageInfo>
                            Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredCoffins.length)} of {filteredCoffins.length}
                          </PageInfo>
                          <PageButtons>{renderPagination()}</PageButtons>
                        </Pagination>
                      )}
                    </>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', padding: '1rem' }}>
                      {pageData.map((coffin) => (
                        <div key={coffin.coffin_id} style={{
                          background: COLORS.bg,
                          border: '1px solid ' + COLORS.border,
                          borderRadius: COLORS.radiusSm,
                          padding: '1rem',
                          cursor: 'pointer',
                          transition: COLORS.transition
                        }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.primary; e.currentTarget.style.boxShadow = COLORS.shadowMd; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{coffin.type}</div>
                              <div style={{ fontSize: '0.72rem', color: COLORS.textMuted, fontFamily: 'monospace' }}>
                                {coffin.custom_id || `COFF-${coffin.coffin_id}`}
                              </div>
                            </div>
                            <StatusBadge $status={coffin.status || 'available'}>
                              {coffin.status === 'in-store' ? 'In Store' : coffin.status === 'booked' ? 'Booked' : 'Available'}
                            </StatusBadge>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary, marginBottom: '0.5rem' }}>
                            <div style={{ marginBottom: '0.25rem' }}><strong>Material:</strong> {coffin.material || 'N/A'}</div>
                            <div style={{ marginBottom: '0.25rem' }}><strong>Location:</strong> {coffin.store_location || 'Not specified'}</div>
                            <div style={{ marginBottom: '0.25rem' }}><strong>Price:</strong> <span style={{ color: COLORS.primary, fontWeight: 600 }}>Ksh {parseInt(coffin.exact_price || 0).toLocaleString()}</span></div>
                            <div><strong>Stock:</strong> {coffin.quantity || 0} units</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid ' + COLORS.border }}>
                            <ActionButton onClick={() => handleViewDetails(coffin)} style={{ flex: 1, padding: '0.5rem', border: '1px solid ' + COLORS.border, borderRadius: COLORS.radiusXs }}>
                              <Eye size={14} /> View
                            </ActionButton>
                            <ActionButton onClick={() => handleBookCoffin(coffin)} style={{ flex: 1, padding: '0.5rem', border: '1px solid ' + COLORS.primary, borderRadius: COLORS.radiusXs, color: COLORS.primary }}>
                              <Calendar size={14} /> Book
                            </ActionButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TableCard>
              </>
            )}

            {activeTab === 'bookings' && (
              <>
                <FilterCard>
                  <FilterRow>
                    <SearchInput
                      type="text"
                      placeholder="Search by client name, coffin model..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </FilterRow>
                </FilterCard>

                <TableCard>
                  {bookings.length === 0 ? (
                    <EmptyState>
                      <ClipboardList size={48} />
                      <h4>No bookings yet</h4>
                      <p>Coffin bookings will appear here</p>
                    </EmptyState>
                  ) : (
                    <>
                      <div style={{ overflowX: 'auto' }}>
                        <Table>
                          <TableHead>
                            <tr>
                              <TableHeader>Booking ID</TableHeader>
                              <TableHeader>Client</TableHeader>
                              <TableHeader>Coffin</TableHeader>
                              <TableHeader>Event Date</TableHeader>
                              <TableHeader>Status</TableHeader>
                              <TableHeader>Booked On</TableHeader>
                            </tr>
                          </TableHead>
                          <tbody>
                            {bookings.map((booking) => (
                              <TableRow key={booking.booking_id || booking.id}>
                                <TableCell style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: COLORS.primary }}>
                                  {booking.booking_code || `BK-${booking.booking_id}`}
                                </TableCell>
                                <TableCell>
                                  <div style={{ fontWeight: 500 }}>{booking.client_name}</div>
                                  <div style={{ fontSize: '0.72rem', color: COLORS.textMuted }}>{booking.client_phone}</div>
                                </TableCell>
                                <TableCell style={{ fontSize: '0.72rem' }}>{booking.coffin_type || 'N/A'}</TableCell>
                                <TableCell style={{ fontSize: '0.72rem' }}>{booking.event_date ? new Date(booking.event_date).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell>
                                  <StatusBadge $status={booking.status || 'pending'}>
                                    {booking.status || 'Pending'}
                                  </StatusBadge>
                                </TableCell>
                                <TableCell style={{ fontSize: '0.72rem' }}>
                                  {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </>
                  )}
                </TableCard>
              </>
            )}
          </TabContent>
        </TabContainer>
      </MainContent>

      {/* Register Modal */}
      {showRegisterModal && (
        <DrawerOverlay onClick={() => setShowRegisterModal(false)}>
          <Drawer $open={showRegisterModal} style={{ width: '700px' }}>
            <DrawerHeader>
              <div>
                <DrawerTitle>Register New Coffin</DrawerTitle>
                <DrawerSubtitle>Add a new coffin model to inventory</DrawerSubtitle>
              </div>
              <ActionButton onClick={() => setShowRegisterModal(false)}><XCircle size={20} /></ActionButton>
            </DrawerHeader>
            <DrawerBody>
              <form onSubmit={handleRegisterSubmit}>
                {registerError && (
                  <div style={{ padding: '0.75rem', background: COLORS.dangerLight, color: COLORS.dangerDark, borderRadius: COLORS.radiusSm, marginBottom: '1rem', fontSize: '0.8125rem' }}>
                    {registerError}
                  </div>
                )}
                <FormGroup>
                  <Label>Model Name <span className="required">*</span></Label>
                  <Input name="type" value={registerFormData.type} onChange={handleRegisterChange} placeholder="e.g., Premium Oak" required />
                </FormGroup>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <FormGroup>
                    <Label>Material <span className="required">*</span></Label>
                    <Input name="material" value={registerFormData.material} onChange={handleRegisterChange} placeholder="e.g., Oak, Pine" required />
                  </FormGroup>
                  <FormGroup>
                    <Label>Price (KES) <span className="required">*</span></Label>
                    <Input name="exact_price" type="number" value={registerFormData.exact_price} onChange={handleRegisterChange} placeholder="0" required />
                  </FormGroup>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <FormGroup>
                    <Label>Size</Label>
                    <Input name="size" value={registerFormData.size} onChange={handleRegisterChange} placeholder="e.g., 6ft" />
                  </FormGroup>
                  <FormGroup>
                    <Label>Color</Label>
                    <Input name="color" value={registerFormData.color} onChange={handleRegisterChange} placeholder="e.g., Dark Brown" />
                  </FormGroup>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <FormGroup>
                    <Label>Quantity</Label>
                    <Input name="quantity" type="number" value={registerFormData.quantity} onChange={handleRegisterChange} placeholder="1" />
                  </FormGroup>
                  <FormGroup>
                    <Label>Supplier</Label>
                    <Input name="supplier" value={registerFormData.supplier} onChange={handleRegisterChange} placeholder="Supplier name" />
                  </FormGroup>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <FormGroup>
                    <Label>Store Location</Label>
                    <Input name="store_location" value={registerFormData.store_location} onChange={handleRegisterChange} placeholder="e.g., Warehouse A" />
                  </FormGroup>
                  <FormGroup>
                    <Label>Shelf Number</Label>
                    <Input name="shelf_number" value={registerFormData.shelf_number} onChange={handleRegisterChange} placeholder="e.g., A-12" />
                  </FormGroup>
                </div>
                <FormGroup>
                  <Label>Notes</Label>
                  <TextArea name="notes" value={registerFormData.notes} onChange={handleRegisterChange} placeholder="Additional notes..." rows="3" />
                </FormGroup>
                <DrawerFooter>
                  <SecondaryButton type="button" onClick={() => setShowRegisterModal(false)}>Cancel</SecondaryButton>
                  <PrimaryButton type="submit" disabled={registerLoading}>
                    {registerLoading ? 'Registering...' : 'Register Coffin'}
                  </PrimaryButton>
                </DrawerFooter>
              </form>
            </DrawerBody>
          </Drawer>
        </DrawerOverlay>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedCoffin && (
        <DrawerOverlay onClick={() => setShowBookingModal(false)}>
          <Drawer $open={showBookingModal} style={{ width: '600px' }}>
            <DrawerHeader style={{ background: COLORS.primaryDark }}>
              <div>
                <DrawerTitle style={{ color: COLORS.white }}>Book Coffin</DrawerTitle>
                <DrawerSubtitle style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {selectedCoffin.type} - Ksh {parseInt(selectedCoffin.exact_price || 0).toLocaleString()}
                </DrawerSubtitle>
              </div>
              <ActionButton onClick={() => setShowBookingModal(false)} style={{ color: COLORS.white }}><XCircle size={20} /></ActionButton>
            </DrawerHeader>
            <DrawerBody>
              <form onSubmit={handleBookingSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <FormGroup>
                    <Label>Client Name <span className="required">*</span></Label>
                    <Input value={bookingFormData.client_name} onChange={(e) => setBookingFormData(p => ({ ...p, client_name: e.target.value }))} required />
                  </FormGroup>
                  <FormGroup>
                    <Label>Phone <span className="required">*</span></Label>
                    <Input value={bookingFormData.client_phone} onChange={(e) => setBookingFormData(p => ({ ...p, client_phone: e.target.value }))} required />
                  </FormGroup>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <FormGroup>
                    <Label>Email</Label>
                    <Input type="email" value={bookingFormData.client_email} onChange={(e) => setBookingFormData(p => ({ ...p, client_email: e.target.value }))} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Booking Date <span className="required">*</span></Label>
                    <Input type="date" value={bookingFormData.booking_date} onChange={(e) => setBookingFormData(p => ({ ...p, booking_date: e.target.value }))} required />
                  </FormGroup>
                </div>
                <FormGroup>
                  <Label>Event Date</Label>
                  <Input type="date" value={bookingFormData.event_date} onChange={(e) => setBookingFormData(p => ({ ...p, event_date: e.target.value }))} />
                </FormGroup>
                <FormGroup>
                  <Label>Client Address</Label>
                  <TextArea value={bookingFormData.client_address} onChange={(e) => setBookingFormData(p => ({ ...p, client_address: e.target.value }))} placeholder="Full address..." rows="2" />
                </FormGroup>
                <FormGroup>
                  <Label>Special Requirements</Label>
                  <TextArea value={bookingFormData.special_requirements} onChange={(e) => setBookingFormData(p => ({ ...p, special_requirements: e.target.value }))} placeholder="Any special requirements or customization..." rows="3" />
                </FormGroup>
                <FormGroup>
                  <Label>Additional Notes</Label>
                  <TextArea value={bookingFormData.notes} onChange={(e) => setBookingFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Additional notes..." rows="2" />
                </FormGroup>
                <DrawerFooter>
                  <SecondaryButton type="button" onClick={() => setShowBookingModal(false)}>Cancel</SecondaryButton>
                  <PrimaryButton type="submit" disabled={bookingLoading}>
                    {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                  </PrimaryButton>
                </DrawerFooter>
              </form>
            </DrawerBody>
          </Drawer>
        </DrawerOverlay>
      )}

      {/* Coffin Detail Modal */}
      {showCoffinDetailModal && selectedCoffin && (
        <DrawerOverlay onClick={() => setShowCoffinDetailModal(false)}>
          <Drawer $open={showCoffinDetailModal}>
            <DrawerHeader>
              <div>
                <DrawerTitle>{selectedCoffin.type}</DrawerTitle>
                <DrawerSubtitle>
                  <StatusBadge $status={selectedCoffin.status || 'available'}>
                    {selectedCoffin.status === 'in-store' ? 'In Store' : selectedCoffin.status === 'booked' ? 'Booked' : 'Available'}
                  </StatusBadge>
                </DrawerSubtitle>
              </div>
              <ActionButton onClick={() => setShowCoffinDetailModal(false)}><XCircle size={20} /></ActionButton>
            </DrawerHeader>
            <DrawerBody>
              <DetailGrid>
                <DetailItem>
                  <DetailLabel>Model ID</DetailLabel>
                  <DetailValue style={{ fontFamily: 'monospace' }}>{selectedCoffin.custom_id || `COFF-${selectedCoffin.coffin_id}`}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Material</DetailLabel>
                  <DetailValue>{selectedCoffin.material || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Size</DetailLabel>
                  <DetailValue>{selectedCoffin.size || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Color</DetailLabel>
                  <DetailValue>{selectedCoffin.color || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Price</DetailLabel>
                  <DetailValue style={{ color: COLORS.primary, fontWeight: 600 }}>
                    Ksh {parseInt(selectedCoffin.exact_price || 0).toLocaleString()}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Stock</DetailLabel>
                  <DetailValue>{selectedCoffin.quantity || 0} units</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Store Location</DetailLabel>
                  <DetailValue>{selectedCoffin.store_location || 'Not specified'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Shelf Number</DetailLabel>
                  <DetailValue>{selectedCoffin.shelf_number || 'Not specified'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Supplier</DetailLabel>
                  <DetailValue>{selectedCoffin.supplier || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Category</DetailLabel>
                  <DetailValue style={{ textTransform: 'capitalize' }}>{selectedCoffin.category?.replace('_', ' ') || 'N/A'}</DetailValue>
                </DetailItem>
              </DetailGrid>

              {selectedCoffin.notes && (
                <div style={{ padding: '1rem', background: COLORS.bg, borderRadius: COLORS.radiusSm, border: '1px solid ' + COLORS.border, marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.textSecondary, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Notes
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: COLORS.text }}>{selectedCoffin.notes}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <PrimaryButton onClick={() => { setShowCoffinDetailModal(false); handleBookCoffin(selectedCoffin); }} style={{ flex: 1 }}>
                  <Calendar size={15} /> Book This Coffin
                </PrimaryButton>
                <SecondaryButton onClick={() => { setShowCoffinDetailModal(false); handleEdit(selectedCoffin); }} style={{ flex: 1 }}>
                  <Edit size={15} /> Edit
                </SecondaryButton>
              </div>
            </DrawerBody>
          </Drawer>
        </DrawerOverlay>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCoffin && (
        <DrawerOverlay onClick={() => setShowEditModal(false)}>
          <Drawer $open={showEditModal}>
            <DrawerHeader>
              <div>
                <DrawerTitle>Edit Coffin</DrawerTitle>
                <DrawerSubtitle>Update coffin details</DrawerSubtitle>
              </div>
              <ActionButton onClick={() => setShowEditModal(false)}><XCircle size={20} /></ActionButton>
            </DrawerHeader>
            <DrawerBody>
              <form onSubmit={handleEditSubmit}>
                <FormGroup>
                  <Label>Model <span className="required">*</span></Label>
                  <Input value={editFormData.type} onChange={(e) => setEditFormData(p => ({ ...p, type: e.target.value }))} required />
                </FormGroup>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <FormGroup>
                    <Label>Material <span className="required">*</span></Label>
                    <Input value={editFormData.material} onChange={(e) => setEditFormData(p => ({ ...p, material: e.target.value }))} required />
                  </FormGroup>
                  <FormGroup>
                    <Label>Price <span className="required">*</span></Label>
                    <Input type="number" value={editFormData.exact_price} onChange={(e) => setEditFormData(p => ({ ...p, exact_price: e.target.value }))} required />
                  </FormGroup>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <FormGroup>
                    <Label>Quantity</Label>
                    <Input type="number" value={editFormData.quantity} onChange={(e) => setEditFormData(p => ({ ...p, quantity: e.target.value }))} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Color</Label>
                    <Input value={editFormData.color} onChange={(e) => setEditFormData(p => ({ ...p, color: e.target.value }))} />
                  </FormGroup>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <FormGroup>
                    <Label>Store Location</Label>
                    <Input value={editFormData.store_location} onChange={(e) => setEditFormData(p => ({ ...p, store_location: e.target.value }))} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Shelf Number</Label>
                    <Input value={editFormData.shelf_number} onChange={(e) => setEditFormData(p => ({ ...p, shelf_number: e.target.value }))} />
                  </FormGroup>
                </div>
                <DrawerFooter>
                  <SecondaryButton type="button" onClick={() => setShowEditModal(false)}>Cancel</SecondaryButton>
                  <PrimaryButton type="submit">Save Changes</PrimaryButton>
                </DrawerFooter>
              </form>
            </DrawerBody>
          </Drawer>
        </DrawerOverlay>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedCoffin && (
        <DrawerOverlay onClick={() => setShowDeleteModal(false)}>
          <Drawer $open={showDeleteModal} style={{ width: '420px' }}>
            <DrawerHeader>
              <DrawerTitle>Delete Coffin</DrawerTitle>
              <ActionButton onClick={() => setShowDeleteModal(false)}><XCircle size={20} /></ActionButton>
            </DrawerHeader>
            <DrawerBody>
              <p style={{ fontSize: '0.875rem', color: COLORS.textSecondary, margin: '0 0 1rem' }}>
                Are you sure you want to delete <strong>{selectedCoffin.type}</strong>? This action cannot be undone.
              </p>
            </DrawerBody>
            <DrawerFooter>
              <SecondaryButton onClick={() => setShowDeleteModal(false)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={confirmDelete} style={{ background: COLORS.danger }}>
                <Trash2 size={15} /> Delete
              </PrimaryButton>
            </DrawerFooter>
          </Drawer>
        </DrawerOverlay>
      )}

      {/* Toast */}
      {toast && (
        <ToastContainer>
          <Toast type={toast.type}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </Toast>
        </ToastContainer>
      )}
    </Container>
  );
};

export default CoffinInventory;