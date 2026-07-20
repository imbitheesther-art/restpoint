import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Plus, Edit, Trash2, Eye, RefreshCw, AlertTriangle,
  CheckCircle, Clock, User, Calendar, Filter, Download,
  MoreVertical, ChevronDown, FileSpreadsheet, X, Mail, Phone, MapPin, Copy
} from '../../utils/icons/icons';
import styled, { keyframes, css } from 'styled-components';
import ExportModal from '../ExportModal';

const API_GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_GATEWAY_URL}`;

// ═══════════════════════════════════════════════════════════════════════════
//  DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════

const T = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceHover: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  text: '#0F172A',
  textBody: '#334155',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textFaint: '#CBD5E1',
  primary: '#2563EB',
  primaryBg: '#EFF6FF',
  primaryHover: '#1D4ED8',
  success: '#059669',
  successBg: '#ECFDF5',
  successBorder: '#A7F3D0',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  dangerBorder: '#FECACA',
  info: '#2563EB',
  infoBg: '#EFF6FF',
  infoBorder: '#BFDBFE',
  purple: '#7C3AED',
  purpleBg: '#F5F3FF',
  avatarColors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#06B6D4', '#F97316'],
};

// ═══════════════════════════════════════════════════════════════════════════
//  ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInRight = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const fadeInOverlay = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ═══════════════════════════════════════════════════════════════════════════
//  STYLED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const Page = styled.div`
  min-height: 100vh;
  background: ${T.bg};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: ${T.text};
`;

const PageHeader = styled.div`
  background: ${T.surface};
  border-bottom: 1px solid ${T.border};
  padding: 1.125rem 1.75rem;
`;

const PageHeaderInner = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: ${T.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 0.8125rem;
  color: ${T.textSecondary};
  margin: 0.125rem 0 0 1.75rem;
  max-width: 1320px;
  margin-left: auto;
  margin-right: auto;
  padding-bottom: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const Btn = styled.button<{ $variant?: 'primary' | 'secondary' | 'ghost' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4375rem 0.875rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid ${T.border};
  background: ${T.surface};
  color: ${T.textBody};
  white-space: nowrap;

  &:hover {
    background: ${T.surfaceHover};
    border-color: ${T.textMuted};
  }

  ${props => props.$variant === 'primary' && css`
    background: ${T.primary};
    color: white;
    border-color: ${T.primary};

    &:hover {
      background: ${T.primaryHover};
      border-color: ${T.primaryHover};
      box-shadow: 0 1px 3px rgba(37, 99, 235, 0.3);
    }
  `}
`;

const Main = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: 1.25rem 1.75rem 2rem;
`;

const Card = styled.div`
  background: ${T.surface};
  border: 1px solid ${T.border};
  border-radius: 10px;
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease-out;
`;

const CardTop = styled.div`
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid ${T.borderLight};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const CardTopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
`;

const CardTopLabel = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${T.text};
`;

const CountBadge = styled.span`
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  background: ${T.primaryBg};
  color: ${T.primary};
`;

const CardTopRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.625rem;
  color: ${T.textMuted};
  display: flex;
  pointer-events: none;
`;

const SearchInput = styled.input`
  padding: 0.4375rem 0.75rem 0.4375rem 2rem;
  border: 1px solid ${T.border};
  border-radius: 6px;
  font-size: 0.8125rem;
  color: ${T.text};
  background: ${T.surface};
  width: 220px;
  transition: all 0.15s ease;

  &::placeholder { color: ${T.textMuted}; }
  &:focus {
    outline: none;
    border-color: ${T.primary};
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
`;

const SelectInput = styled.select`
  padding: 0.4375rem 1.75rem 0.4375rem 0.625rem;
  border: 1px solid ${T.border};
  border-radius: 6px;
  font-size: 0.8125rem;
  color: ${T.textBody};
  background: ${T.surface};
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  transition: all 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${T.primary};
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const THead = styled.thead``;

const TRow = styled.tr`
  border-bottom: 1px solid ${T.borderLight};
  transition: background 0.1s ease;

  &:last-child { border-bottom: none; }
  &:hover { background: ${T.surfaceHover}; }
`;

const TH = styled.th`
  padding: 0.625rem 1rem;
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${T.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${T.bg};
  border-bottom: 1px solid ${T.border};
  white-space: nowrap;
`;

const TD = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  color: ${T.textBody};
  vertical-align: middle;
  white-space: nowrap;
`;

// ─── Avatar ────────────────────────────────────────────────────────────────

const Avatar = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: 0.02em;
`;

// ─── Name Cell ────────────────────────────────────────────────────────────

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
`;

const NameInfo = styled.div`
  min-width: 0;
`;

const NameText = styled.div`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${T.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SubText = styled.div`
  font-size: 0.6875rem;
  color: ${T.textSecondary};
  margin-top: 0.0625rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// ─── ID Cell ──────────────────────────────────────────────────────────────

const IdCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const IdText = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${T.textSecondary};
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  background: ${T.bg};
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  border: 1px solid ${T.borderLight};
`;

const CopyBtn = styled.button`
  background: none;
  border: none;
  color: ${T.textMuted};
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  display: flex;
  opacity: 0;
  transition: all 0.12s ease;

  ${TRow}:hover & { opacity: 1; }
  &:hover { color: ${T.primary}; background: ${T.primaryBg}; }
`;

// ─── Status Badge ─────────────────────────────────────────────────────────

const StatusBadge = styled.span<{ $type: 'success' | 'warning' | 'danger' | 'info' | 'purple' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.01em;

  ${props => {
    const map = {
      success: { bg: T.successBg, color: T.success, border: T.successBorder },
      warning: { bg: T.warningBg, color: T.warning, border: T.warningBorder },
      danger:  { bg: T.dangerBg,  color: T.danger,  border: T.dangerBorder },
      info:    { bg: T.infoBg,    color: T.info,    border: T.infoBorder },
      purple:  { bg: T.purpleBg,  color: T.purple,  border: '#DDD6FE' },
    };
    const s = map[props.$type];
    return css`background: ${s.bg}; color: ${s.color}; border: 1px solid ${s.border};`;
  }}
`;

// ─── Days Badge ────────────────────────────────────────────────────────────

const DaysBadge = styled.span<{ $type: 'ok' | 'warn' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem 0.5rem;
  border-radius: 20px;
  font-size: 0.6875rem;
  font-weight: 600;

  ${props => {
    if (props.$type === 'danger') return css`background: ${T.dangerBg}; color: ${T.danger};`;
    if (props.$type === 'warn') return css`background: ${T.warningBg}; color: ${T.warning};`;
    return css`background: ${T.successBg}; color: ${T.success};`;
  }}
`;

// ─── Type Tag ─────────────────────────────────────────────────────────────

const TypeTag = styled.span`
  font-size: 0.6875rem;
  color: ${T.textSecondary};
  background: ${T.bg};
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  border: 1px solid ${T.borderLight};
`;

// ─── Charge Text ───────────────────────────────────────────────────────────

const ChargeText = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${T.text};
`;

const ChargeLabel = styled.span`
  font-size: 0.6875rem;
  color: ${T.textMuted};
  display: block;
`;

// ─── Action Buttons ────────────────────────────────────────────────────────

const ActionsCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.125rem;
  justify-content: flex-end;
`;

const ActionBtn = styled.button<{ $danger?: boolean }>`
  background: none;
  border: none;
  color: ${T.textMuted};
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s ease;

  &:hover {
    background: ${props => props.$danger ? T.dangerBg : T.primaryBg};
    color: ${props => props.$danger ? T.danger : T.primary};
  }
`;

// ─── Empty State ───────────────────────────────────────────────────────────

const EmptyWrap = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${T.bg};
  border: 1px solid ${T.border};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${T.textMuted};
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h4`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${T.text};
  margin: 0 0 0.375rem;
`;

const EmptyDesc = styled.p`
  font-size: 0.8125rem;
  color: ${T.textSecondary};
  margin: 0;
`;

// ─── Loading ───────────────────────────────────────────────────────────────

const LoadingWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 0.75rem;
`;

// ─── Drawer ────────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 9998;
  animation: ${fadeInOverlay} 0.15s ease-out;
`;

const Drawer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 460px;
  max-width: 100vw;
  background: ${T.surface};
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.08);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  animation: ${slideInRight} 0.25s ease-out;
`;

const DrawerHeader = styled.div`
  padding: 1.125rem 1.25rem;
  border-bottom: 1px solid ${T.border};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: ${T.bg};
`;

const DrawerTitle = styled.h2`
  font-size: 1.0625rem;
  font-weight: 700;
  color: ${T.text};
  margin: 0;
`;

const DrawerSubtitle = styled.p`
  font-size: 0.75rem;
  color: ${T.textSecondary};
  margin: 0.25rem 0 0;
  font-family: 'SF Mono', 'Fira Code', monospace;
`;

const DrawerClose = styled.button`
  background: ${T.surface};
  border: 1px solid ${T.border};
  color: ${T.textSecondary};
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s ease;

  &:hover { background: ${T.dangerBg}; color: ${T.danger}; border-color: ${T.dangerBorder}; }
`;

const DrawerBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
`;

const DrawerSection = styled.div`
  margin-bottom: 1.25rem;
`;

const DrawerSectionTitle = styled.h4`
  font-size: 0.6875rem;
  font-weight: 700;
  color: ${T.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.625rem;
  padding-bottom: 0.375rem;
  border-bottom: 1px solid ${T.borderLight};
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
`;

const FieldCard = styled.div`
  padding: 0.75rem;
  background: ${T.bg};
  border: 1px solid ${T.borderLight};
  border-radius: 8px;
`;

const FieldCardFull = styled(FieldCard)`
  grid-column: 1 / -1;
`;

const FieldLabel = styled.div`
  font-size: 0.625rem;
  font-weight: 600;
  color: ${T.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`;

const FieldValue = styled.div`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${T.text};
`;

const FieldValueLarge = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${T.text};
`;

const DrawerFooter = styled.div`
  padding: 1rem 1.25rem;
  border-top: 1px solid ${T.border};
  display: flex;
  gap: 0.5rem;
  background: ${T.surface};
`;

const DrawerBtn = styled.button<{ $primary?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid ${T.border};
  background: ${T.surface};
  color: ${T.textBody};

  &:hover { background: ${T.surfaceHover}; }

  ${props => props.$primary && css`
    background: ${T.primary};
    color: white;
    border-color: ${T.primary};
    &:hover { background: ${T.primaryHover}; }
  `}
`;

// ─── Contact Row (Drawer) ────────────────────────────────────────────────

const ContactRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${T.borderLight};

  &:last-child { border-bottom: none; }
`;

const ContactIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: ${T.primaryBg};
  color: ${T.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ContactText = styled.div`
  font-size: 0.8125rem;
  color: ${T.textBody};
`;

// ═══════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const getTenantSlug = () => {
  return localStorage.getItem('tenantSlug') ||
    localStorage.getItem('tenant_slug') ||
    (() => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.tenantSlug || user.tenant?.slug || 'default';
      } catch { return 'default'; }
    })();
};

const getInitials = (name: string) => {
  if (!name || name === 'Unknown') return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
};

const getAvatarColor = (name: string) => {
  if (!name) return T.avatarColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return T.avatarColors[Math.abs(hash) % T.avatarColors.length];
};

const getDaysInMortuary = (admissionDate: string) => {
  if (!admissionDate) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(admissionDate).getTime()) / 86400000));
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
};

const copyToClipboard = (text: string) => {
  navigator.clipboard?.writeText(text);
};

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const DeceasedList = () => {
  const [deceasedList, setDeceasedList] = useState<any[]>([]);
  const [filteredList, setFilteredList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const tenantSlug = getTenantSlug();

  // ─── Fetch ───────────────────────────────────────────────────────────
  const fetchDeceasedList = useCallback(async () => {
    try {
      setIsLoading(true);
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
  }, [tenantSlug]);

  useEffect(() => { fetchDeceasedList(); }, [fetchDeceasedList]);

  // ─── Filter ───────────────────────────────────────────────────────────
  useEffect(() => {
    let filtered = deceasedList;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.full_name?.toLowerCase().includes(q) ||
        d.deceased_id?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    setFilteredList(filtered);
  }, [searchTerm, statusFilter, deceasedList]);

  // ─── Export ───────────────────────────────────────────────────────────
  const handleExport = async (exportOptions: any) => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const params = new URLSearchParams();
      if (exportOptions.startDate) params.append('startDate', exportOptions.startDate);
      if (exportOptions.endDate) params.append('endDate', exportOptions.endDate);
      if (exportOptions.format) params.append('format', exportOptions.format);
      if (exportOptions.columns?.length) params.append('columns', exportOptions.columns.join(','));
      if (exportOptions.includeFilters) {
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
      }
      const response = await axios.get(`${BASE_URL}/deceased/export?${params.toString()}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '', 'x-tenant-slug': tenantSlug },
        responseType: 'blob',
      });
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
      alert('Failed to export data.');
    } finally {
      setIsExporting(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      await axios.delete(`${BASE_URL}/deceased/${id}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '', 'x-tenant-slug': tenantSlug },
      });
      setDeceasedList(prev => prev.filter(item => item.deceased_id !== id && item.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete record.');
    }
  };

  // ─── Drawer ───────────────────────────────────────────────────────────
  const openDrawer = (record: any) => { setSelectedRecord(record); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setSelectedRecord(null); };

  // ─── Status config ─────────────────────────────────────────────────────
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'released': return { type: 'success' as const, label: 'Released', icon: <CheckCircle size={11} /> };
      case 'transferred': return { type: 'info' as const, label: 'Transferred', icon: <Mail size={11} /> };
      case 'cancelled': return { type: 'danger' as const, label: 'Cancelled', icon: <X size={11} /> };
      case 'active':
      default: return { type: 'warning' as const, label: 'Active', icon: <Clock size={11} /> };
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  //  LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════

  if (isLoading) {
    return (
      <Page>
        <PageHeader>
          <PageHeaderInner>
            <PageTitle><User size={22} /> Deceased Records</PageTitle>
          </PageHeaderInner>
        </PageHeader>
        <LoadingWrap>
          <div style={{ animation: `${spin} 1s linear infinite` }}><RefreshCw size={28} color={T.primary} /></div>
          <span style={{ fontSize: '0.8125rem', color: T.textSecondary }}>Loading records...</span>
        </LoadingWrap>
      </Page>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <Page>
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <PageHeader>
        <PageHeaderInner>
          <PageTitle><User size={22} /> Deceased Records</PageTitle>
          <Actions>
            <Btn onClick={fetchDeceasedList}><RefreshCw size={14} /> Refresh</Btn>
            <Btn onClick={() => setShowExportModal(true)}><Download size={14} /> Export</Btn>
            <Btn $variant="primary" as={Link} to={`/tenant/${tenantSlug}/deceased/register`}>
              <Plus size={14} /> New Record
            </Btn>
          </Actions>
        </PageHeaderInner>
      </PageHeader>

      <Subtitle>Manage and track all deceased records across your facility</Subtitle>

      <Main>
        <Card>
          {/* ─── Card Top Bar ─────────────────────────────────────────── */}
          <CardTop>
            <CardTopLeft>
              <CardTopLabel>All Records</CardTopLabel>
              <CountBadge>{filteredList.length}</CountBadge>
            </CardTopLeft>
            <CardTopRight>
              <SearchBox>
                <SearchIcon><Search size={14} /></SearchIcon>
                <SearchInput
                  type="text"
                  placeholder="Search name or ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </SearchBox>
              <SelectInput value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="released">Released</option>
                <option value="transferred">Transferred</option>
                <option value="cancelled">Cancelled</option>
              </SelectInput>
            </CardTopRight>
          </CardTop>

          {/* ─── Table ───────────────────────────────────────────────── */}
          {filteredList.length === 0 ? (
            <EmptyWrap>
              <EmptyIcon><User size={24} /></EmptyIcon>
              <EmptyTitle>No records found</EmptyTitle>
              <EmptyDesc>Try adjusting your search or filter criteria</EmptyDesc>
            </EmptyWrap>
          ) : (
            <TableWrap>
              <Table>
                <THead>
                  <TRow>
                    <TH>Deceased</TH>
                    <TH>ID</TH>
                    <TH>Type</TH>
                    <TH>Admitted</TH>
                    <TH>Duration</TH>
                    <TH>Status</TH>
                    <TH>Charges</TH>
                    <TH style={{ textAlign: 'right' }}>Actions</TH>
                  </TRow>
                </THead>
                <tbody>
                  {filteredList.map((deceased) => {
                    const id = deceased.deceased_id || deceased.id;
                    const name = deceased.full_name || 'Unknown';
                    const days = getDaysInMortuary(deceased.date_admitted);
                    const statusCfg = getStatusConfig(deceased.status);
                    const avatarColor = getAvatarColor(name);
                    const initials = getInitials(name);
                    const isOverdue = days > 30;
                    const isWarn = days > 14 && !isOverdue;

                    return (
                      <TRow key={id}>
                        {/* Name + Avatar */}
                        <TD>
                          <NameCell>
                            <Avatar $color={avatarColor}>{initials}</Avatar>
                            <NameInfo>
                              <NameText>{name}</NameText>
                              <SubText>{deceased.burial_type || 'Standard'}</SubText>
                            </NameInfo>
                          </NameCell>
                        </TD>

                        {/* ID */}
                        <TD>
                          <IdCell>
                            <IdText>{id}</IdText>
                            <CopyBtn onClick={() => copyToClipboard(id)} title="Copy ID">
                              <Copy size={12} />
                            </CopyBtn>
                          </IdCell>
                        </TD>

                        {/* Type */}
                        <TD>
                          <TypeTag>{deceased.burial_type || 'Standard'}</TypeTag>
                        </TD>

                        {/* Date Admitted */}
                        <TD style={{ color: T.textSecondary }}>
                          {formatDate(deceased.date_admitted)}
                        </TD>

                        {/* Days */}
                        <TD>
                          <DaysBadge $type={isOverdue ? 'danger' : isWarn ? 'warn' : 'ok'}>
                            {isOverdue ? <AlertTriangle size={11} /> : <Clock size={11} />}
                            {days}d
                          </DaysBadge>
                        </TD>

                        {/* Status */}
                        <TD>
                          <StatusBadge $type={statusCfg.type}>
                            {statusCfg.icon}
                            {statusCfg.label}
                          </StatusBadge>
                        </TD>

                        {/* Charges */}
                        <TD>
                          <ChargeText>
                            {Number(deceased.total_mortuary_charge || 0).toLocaleString()}
                          </ChargeText>
                          <ChargeLabel>KES</ChargeLabel>
                        </TD>

                        {/* Actions */}
                        <TD>
                          <ActionsCell>
                            <ActionBtn onClick={() => openDrawer(deceased)} title="View">
                              <Eye size={15} />
                            </ActionBtn>
                            <ActionBtn as={Link} to={`/tenant/${tenantSlug}/deceased/${id}/edit`} title="Edit">
                              <Edit size={15} />
                            </ActionBtn>
                            <ActionBtn $danger onClick={() => handleDelete(id)} title="Delete">
                              <Trash2 size={15} />
                            </ActionBtn>
                            <ActionBtn title="More">
                              <MoreVertical size={15} />
                            </ActionBtn>
                          </ActionsCell>
                        </TD>
                      </TRow>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrap>
          )}
        </Card>
      </Main>

      {/* ─── Export Modal ────────────────────────────────────────────── */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          isExporting={isExporting}
          filters={{ search: searchTerm, status: statusFilter }}
        />
      )}

      {/* ─── Drawer Overlay ──────────────────────────────────────────── */}
      {drawerOpen && <Overlay onClick={closeDrawer} />}

      {/* ─── Drawer ─────────────────────────────────────────────────── */}
      {drawerOpen && selectedRecord && (
        <Drawer>
          <DrawerHeader>
            <div>
              <DrawerTitle>{selectedRecord.full_name || 'Unknown'}</DrawerTitle>
              <DrawerSubtitle>{selectedRecord.deceased_id || selectedRecord.id || '—'}</DrawerSubtitle>
            </div>
            <DrawerClose onClick={closeDrawer}><X size={16} /></DrawerClose>
          </DrawerHeader>

          <DrawerBody>
            {/* Status + Days row */}
            <DrawerSection>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <StatusBadge $type={getStatusConfig(selectedRecord.status).type}>
                  {getStatusConfig(selectedRecord.status).icon}
                  {getStatusConfig(selectedRecord.status).label}
                </StatusBadge>
                <DaysBadge $type={getDaysInMortuary(selectedRecord.date_admitted) > 30 ? 'danger' : getDaysInMortuary(selectedRecord.date_admitted) > 14 ? 'warn' : 'ok'}>
                  <Clock size={11} /> {getDaysInMortuary(selectedRecord.date_admitted)} days in mortuary
                </DaysBadge>
              </div>
            </DrawerSection>

            {/* Basic Info */}
            <DrawerSection>
              <DrawerSectionTitle>Basic Information</DrawerSectionTitle>
              <FieldGrid>
                <FieldCard>
                  <FieldLabel>Date Admitted</FieldLabel>
                  <FieldValue>{formatDate(selectedRecord.date_admitted)}</FieldValue>
                </FieldCard>
                <FieldCard>
                  <FieldLabel>Burial Type</FieldLabel>
                  <FieldValue>{selectedRecord.burial_type || '—'}</FieldValue>
                </FieldCard>
                <FieldCard>
                  <FieldLabel>Date of Death</FieldLabel>
                  <FieldValue>{formatDate(selectedRecord.date_of_death)}</FieldValue>
                </FieldCard>
                <FieldCard>
                  <FieldLabel>Age</FieldLabel>
                  <FieldValue>{selectedRecord.age || '—'}</FieldValue>
                </FieldCard>
                <FieldCard>
                  <FieldLabel>Gender</FieldLabel>
                  <FieldValue>{selectedRecord.gender || '—'}</FieldValue>
                </FieldCard>
                <FieldCard>
                  <FieldLabel>ID Number</FieldLabel>
                  <FieldValue>{selectedRecord.id_number || '—'}</FieldValue>
                </FieldCard>
              </FieldGrid>
            </DrawerSection>

            {/* Charges */}
            <DrawerSection>
              <DrawerSectionTitle>Charges</DrawerSectionTitle>
              <FieldCardFull>
                <FieldLabel>Total Mortuary Charges</FieldLabel>
                <FieldValueLarge>
                  {Number(selectedRecord.total_mortuary_charge || 0).toLocaleString()} KES
                </FieldValueLarge>
              </FieldCardFull>
            </DrawerSection>

            {/* Contact */}
            <DrawerSection>
              <DrawerSectionTitle>Contact Information</DrawerSectionTitle>
              <div style={{ background: T.bg, borderRadius: '8px', border: `1px solid ${T.borderLight}`, padding: '0.25rem 0.75rem' }}>
                {selectedRecord.next_of_kin_name && (
                  <ContactRow>
                    <ContactIcon><User size={13} /></ContactIcon>
                    <ContactText>{selectedRecord.next_of_kin_name}</ContactText>
                  </ContactRow>
                )}
                {selectedRecord.next_of_kin_phone && (
                  <ContactRow>
                    <ContactIcon><Phone size={13} /></ContactIcon>
                    <ContactText>{selectedRecord.next_of_kin_phone}</ContactText>
                  </ContactRow>
                )}
                {selectedRecord.next_of_kin_email && (
                  <ContactRow>
                    <ContactIcon><Mail size={13} /></ContactIcon>
                    <ContactText>{selectedRecord.next_of_kin_email}</ContactText>
                  </ContactRow>
                )}
                {selectedRecord.address && (
                  <ContactRow>
                    <ContactIcon><MapPin size={13} /></ContactIcon>
                    <ContactText>{selectedRecord.address}</ContactText>
                  </ContactRow>
                )}
                {!(selectedRecord.next_of_kin_name || selectedRecord.next_of_kin_phone || selectedRecord.next_of_kin_email || selectedRecord.address) && (
                  <div style={{ padding: '0.75rem 0', textAlign: 'center', color: T.textMuted, fontSize: '0.8125rem' }}>
                    No contact information on file
                  </div>
                )}
              </div>
            </DrawerSection>

            {/* Additional */}
            {(selectedRecord.cause_of_death || selectedRecord.notes) && (
              <DrawerSection>
                <DrawerSectionTitle>Additional Details</DrawerSectionTitle>
                {selectedRecord.cause_of_death && (
                  <FieldCardFull style={{ marginBottom: '0.625rem' }}>
                    <FieldLabel>Cause of Death</FieldLabel>
                    <FieldValue>{selectedRecord.cause_of_death}</FieldValue>
                  </FieldCardFull>
                )}
                {selectedRecord.notes && (
                  <div style={{
                    padding: '0.75rem',
                    background: T.warningBg,
                    borderRadius: '8px',
                    border: `1px solid ${T.warningBorder}`,
                  }}>
                    <FieldLabel>Notes</FieldLabel>
                    <div style={{ fontSize: '0.8125rem', color: T.textBody, lineHeight: '1.6', marginTop: '0.125rem' }}>
                      {selectedRecord.notes}
                    </div>
                  </div>
                )}
              </DrawerSection>
            )}
          </DrawerBody>

          <DrawerFooter>
            <DrawerBtn
              $primary
              onClick={() => {
                closeDrawer();
                window.location.href = `/tenant/${tenantSlug}/deceased/${selectedRecord.deceased_id || selectedRecord.id}`;
              }}
            >
              <Eye size={14} /> View Full
            </DrawerBtn>
            <DrawerBtn
              onClick={() => {
                closeDrawer();
                window.location.href = `/tenant/${tenantSlug}/deceased/${selectedRecord.deceased_id || selectedRecord.id}/edit`;
              }}
            >
              <Edit size={14} /> Edit
            </DrawerBtn>
          </DrawerFooter>
        </Drawer>
      )}
    </Page>
  );
};

export default DeceasedList;