import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  Package, TrendingUp, AlertTriangle, CheckCircle, Search,
  Beaker, Plus, X, Save, History, Shield, FlaskConical,
  RefreshCw, Zap, Syringe, Truck, ArrowRight, TestTube2,
  ClipboardList, ChevronDown, CircleDot
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const COLORS = {
  primaryDark: '#1E293B',
  accentBlue: '#3B82F6',
  successGreen: '#10B981',
  dangerRed: '#DC2626',
  warningYellow: '#F59E0B',
  infoBlue: '#0EA5E9',
  light: '#F8FAFC',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const modalSlideUp = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const pulseSoft = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

/* ═══════════════════════════════════════════════════════════
   STYLED COMPONENTS
   ═══════════════════════════════════════════════════════════ */

const Page = styled.div`
  padding: 12px;
  background: ${COLORS.light};
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: ${COLORS.textPrimary};
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 28px 32px;
    max-width: 1100px;
    margin: 0 auto;
  }
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 22px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
  }
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${COLORS.textPrimary};

  @media (min-width: 768px) {
    font-size: 26px;
  }

  svg {
    color: ${COLORS.accentBlue};
  }
`;

const HeaderBtns = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  white-space: nowrap;

  background: ${({ $variant }) =>
    $variant === 'blue' ? COLORS.accentBlue :
      $variant === 'green' ? COLORS.successGreen :
        $variant === 'amber' ? COLORS.warningYellow :
          COLORS.cardBg};
  color: ${({ $variant }) => ($variant ? '#fff' : COLORS.textPrimary)};
  border: ${({ $variant }) => ($variant ? 'none' : `1px solid ${COLORS.border}`)};
  box-shadow: ${({ $variant }) => $variant ? `0 2px 8px ${$variant === 'blue' ? 'rgba(59,130,246,0.25)' : $variant === 'green' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}` : 'none'};

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.08);
  }

  &:active { transform: scale(0.97); }

  @media (min-width: 768px) {
    padding: 10px 18px;
    font-size: 14px;
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 22px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 28px;
  }
`;

const StatCard = styled.div`
  background: ${COLORS.cardBg};
  border-radius: 14px;
  padding: 16px;
  border: 1px solid ${COLORS.border};
  animation: ${fadeIn} 0.5s ease-out both;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  }
`;

const StatTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${COLORS.textSecondary};
`;

const StatNum = styled.div`
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
  color: ${({ $color }) => $color || COLORS.textPrimary};
  letter-spacing: -0.02em;
`;

const Tabs = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 18px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 2px;

  &::-webkit-scrollbar { display: none; }
`;

const Tab = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  white-space: nowrap;
  border: 1.5px solid ${({ $active }) => $active ? COLORS.accentBlue : COLORS.border};
  background: ${({ $active }) => $active ? COLORS.accentBlue : COLORS.cardBg};
  color: ${({ $active }) => $active ? '#fff' : COLORS.textSecondary};
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover { transform: translateY(-1px); }
`;

const Section = styled.div`
  background: ${COLORS.cardBg};
  border-radius: 14px;
  padding: 18px;
  border: 1px solid ${COLORS.border};
  animation: ${fadeIn} 0.5s ease-out both;
  animation-delay: 0.05s;

  @media (min-width: 768px) {
    padding: 22px;
  }
`;

const SectionHead = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 750;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${COLORS.textPrimary};

  svg { color: ${COLORS.accentBlue}; }

  @media (min-width: 768px) { font-size: 17px; }
`;

const SearchBox = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${COLORS.textTertiary};
    pointer-events: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 1.5px solid ${COLORS.border};
  border-radius: 10px;
  font-size: 14px;
  background: ${COLORS.light};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${COLORS.accentBlue};
    box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
    background: #fff;
  }

  @media (min-width: 768px) { width: 280px; }
`;

/* Chemical Card */
const ChemCard = styled.div`
  background: ${COLORS.cardBg};
  border-radius: 14px;
  padding: 18px;
  border: 1px solid ${COLORS.border};
  margin-bottom: 12px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    border-color: #CBD5E1;
  }
`;

const ChemHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
  gap: 10px;
`;

const ChemName = styled.div`
  font-size: 15px;
  font-weight: 750;
  color: ${COLORS.textPrimary};
  display: flex;
  align-items: center;
  gap: 8px;

  svg { color: ${COLORS.accentBlue}; flex-shrink: 0; }
`;

const ChemMeta = styled.div`
  font-size: 12px;
  color: ${COLORS.textTertiary};
  margin-top: 3px;
  font-weight: 500;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;

  background: ${({ $low }) => $low ? '#FEF2F2' : '#F0FDF4'};
  color: ${({ $low }) => $low ? '#DC2626' : '#16A34A'};
  border: 1px solid ${({ $low }) => $low ? '#FECACA' : '#BBF7D0'};

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    ${({ $low }) => $low && css`animation: ${pulseSoft} 1.4s ease-in-out infinite;`}
  }
`;

const StockGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 12px;
  background: ${COLORS.light};
  border-radius: 10px;
  margin-bottom: 14px;
`;

const StockItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StockLbl = styled.div`
  font-size: 10.5px;
  color: ${COLORS.textTertiary};
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StockVal = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: ${COLORS.textPrimary};
`;

/* Health bar */
const HealthWrap = styled.div`
  margin-bottom: 12px;
`;

const HealthTrack = styled.div`
  width: 100%;
  height: 7px;
  background: ${COLORS.border};
  border-radius: 4px;
  overflow: hidden;
`;

const HealthFill = styled.div`
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease, background 0.5s ease;
  width: ${({ $pct }) => Math.min(100, Math.max(0, $pct))}%;
  background: ${({ $pct }) =>
    $pct >= 80 ? '#10B981' :
      $pct >= 60 ? '#22C55E' :
        $pct >= 40 ? '#F59E0B' :
          $pct >= 20 ? '#F97316' : '#EF4444'};
  box-shadow: ${({ $pct }) => $pct < 20 ? '0 0 8px rgba(239,68,68,0.4)' : 'none'};
`;

const HealthLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 11px;
  font-weight: 650;
`;

const HealthPct = styled.span`
  color: ${({ $pct }) =>
    $pct >= 60 ? '#10B981' :
      $pct >= 40 ? '#F59E0B' :
        $pct >= 20 ? '#F97316' : '#EF4444'};
`;

const HealthStatus = styled.span`
  color: ${({ $pct }) =>
    $pct >= 80 ? '#10B981' :
      $pct >= 60 ? '#22C55E' :
        $pct >= 40 ? '#F59E0B' :
          $pct >= 20 ? '#F97316' : '#EF4444'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 10px;
`;

const UsageBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: ${COLORS.light};
  border-radius: 8px;
  margin-bottom: 14px;
  font-size: 13px;
`;

const UsageLabel = styled.span`
  color: ${COLORS.textSecondary};
  font-weight: 600;
`;

const UsageVal = styled.span`
  color: ${COLORS.accentBlue};
  font-weight: 750;
`;

const CardActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const IconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 12px;
  border: 1.5px solid ${COLORS.border};
  border-radius: 10px;
  background: ${COLORS.cardBg};
  color: ${COLORS.textSecondary};
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${COLORS.accentBlue};
    color: ${COLORS.accentBlue};
    background: ${COLORS.light};
  }

  &:active { transform: scale(0.97); }
`;

/* Table */
const Tbl = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TblHead = styled.tr`
  border-bottom: 2px solid ${COLORS.border};
`;

const Th = styled.th`
  padding: 10px 10px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  color: ${COLORS.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 12px 10px;
  font-size: 13px;
  color: ${COLORS.textPrimary};
  border-bottom: 1px solid ${COLORS.borderLight || '#F1F5F9'};
  white-space: nowrap;
`;

const TdWrap = styled(Td)`
  white-space: normal;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${COLORS.textSecondary};
`;

/* Empty State */
const Empty = styled.div`
  text-align: center;
  padding: 50px 24px;
`;

const EmptyIconWrap = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${COLORS.light};
  border: 1.5px solid ${COLORS.border};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: ${COLORS.textTertiary};
`;

const EmptyTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${COLORS.textPrimary};
  margin: 0 0 6px;
`;

const EmptyDesc = styled.p`
  font-size: 13px;
  color: ${COLORS.textTertiary};
  margin: 0;
  line-height: 1.6;
`;

/* Loading */
const LoadingWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${COLORS.border};
  border-top-color: ${COLORS.accentBlue};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled.p`
  font-size: 14px;
  color: ${COLORS.textSecondary};
  font-weight: 500;
  margin: 0;
`;

/* ─── MODAL ──────────────────────────────────────────────────── */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  overflow-y: auto;
`;

const ModalBox = styled.div`
  background: ${COLORS.cardBg};
  border-radius: 18px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: ${modalSlideUp} 0.3s ease-out;
  display: flex;
  flex-direction: column;
`;

const ModalHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 22px 0;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 750;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  color: ${COLORS.textPrimary};

  svg { color: ${COLORS.accentBlue}; }
`;

const CloseBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid ${COLORS.border};
  background: ${COLORS.light};
  color: ${COLORS.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #FEE2E2;
    color: ${COLORS.dangerRed};
    border-color: #FECACA;
  }
`;

const ModalBody = styled.div`
  padding: 0 22px 22px;
  overflow-y: auto;
  flex: 1;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-bottom: 14px;

  @media (min-width: 500px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 12.5px;
  font-weight: 650;
  color: ${COLORS.textPrimary};
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1.5px solid ${COLORS.border};
  border-radius: 9px;
  font-size: 14px;
  transition: all 0.2s;
  background: #fff;

  &:focus {
    outline: none;
    border-color: ${COLORS.accentBlue};
    box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1.5px solid ${COLORS.border};
  border-radius: 9px;
  font-size: 14px;
  background: #fff;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${COLORS.accentBlue};
    box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
  }
`;

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1.5px solid ${COLORS.border};
  border-radius: 9px;
  font-size: 14px;
  min-height: 76px;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${COLORS.accentBlue};
    box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
  }
`;

const FullSpan = styled.div`
  @media (min-width: 500px) {
    grid-column: 1 / -1;
  }
`;

const ModalFoot = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 18px;
`;

const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 11px 16px;
  border-radius: 10px;
  background: ${COLORS.accentBlue};
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(59,130,246,0.25);

  &:hover:not(:disabled) {
    background: #2563EB;
    transform: translateY(-1px);
  }

  &:active { transform: scale(0.97); }

  &:disabled {
    background: #94A3B8;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const GhostBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 16px;
  border-radius: 10px;
  background: ${COLORS.cardBg};
  color: ${COLORS.textSecondary};
  border: 1.5px solid ${COLORS.border};
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: ${COLORS.light}; }
  &:active { transform: scale(0.97); }
`;

/* ─── HELPERS ─────────────────────────────────────────────────── */

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  : 'N/A';

const getHealthPct = (chemical) => {
  if (!chemical.min_stock_level || chemical.min_stock_level <= 0) {
    return chemical.quantity_available > 0 ? 100 : 0;
  }
  return Math.round((chemical.quantity_available / chemical.min_stock_level) * 100);
};

const getHealthLabel = (pct) => {
  if (pct >= 200) return 'Excellent';
  if (pct >= 150) return 'Good';
  if (pct >= 100) return 'Adequate';
  if (pct >= 50) return 'Low';
  return 'Critical';
};

/* PPE status badge colors */
const ppeStatusColors = {
  pending: { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706' },
  approved: { bg: '#EFF6FF', border: '#BFDBFE', color: '#2563EB' },
  rejected: { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626' },
  fulfilled: { bg: '#F0FDF4', border: '#BBF7D0', color: '#16A34A' },
};

const PPEBadge = ({ status }) => {
  const c = ppeStatusColors[status] || ppeStatusColors.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      fontSize: '10.5px', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.03em',
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      <span className="dot" style={{
        width: 5, height: 5, borderRadius: '50%',
        background: 'currentColor',
      }} />
      {status || 'Unknown'}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

const ChemicalManagementDashboard = () => {
  const [chemicals, setChemicals] = useState([]);
  const [usageData, setUsageData] = useState([]);
  const [ppeRequests, setPPERequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showPPEModal, setShowPPEModal] = useState(false);
  const [selectedChemical, setSelectedChemical] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    total_chemicals: 0,
    low_stock_count: 0,
    total_usage_30d: 0,
    recent_transactions: [],
    top_used_chemicals: [],
  });

  const [formData, setFormData] = useState({
    name: '', category: 'embalming', unit: 'liters',
    current_stock: '', min_stock_level: '', reorder_level: '',
    unit_cost: '', hazard_level: 'low', notes: '',
    jerican_capacity: '', jericans_received: '',
  });

  const [usageFormData, setUsageFormData] = useState({
    chemical_id: '', quantity_used: '', used_by: '',
    usage_notes: '', deceased_id: '',
  });

  const [ppeFormData, setPPEFormData] = useState({
    item_name: '', quantity_requested: '', requested_by: '', notes: '',
  });

  /* ─── Fetches ──────────────────────────────────────────────── */
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchChemicals(), fetchUsageData(), fetchPPERequests(), fetchDashboardStats()]);
    setLoading(false);
  };

  const fetchChemicals = async () => {
    try {
      const r = await api.get('/chemicals');
      if (r.data.success) setChemicals(r.data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchUsageData = async () => {
    try {
      const r = await api.get('/chemicals/usage/branch/1');
      if (r.data.success) setUsageData(r.data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchPPERequests = async () => {
    try {
      const r = await api.get('/chemicals/ppe-requests/branch/1');
      if (r.data.success) setPPERequests(r.data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchDashboardStats = async () => {
    try {
      const r = await api.get('/chemicals/dashboard/summary/1');
      if (r.data.success) setDashboardStats(r.data.data);
    } catch (e) { console.error(e); }
  };

  /* ─── Handlers ─────────────────────────────────────────────── */
  const handleAddChemical = async (e) => {
    e.preventDefault();
    try {
      if (selectedChemical) {
        const quantityToAdd = parseFloat(formData.current_stock) || 0;
        if (quantityToAdd <= 0) {
          toast.error('Please enter a valid quantity to add.');
          return;
        }

        const payload = {
          quantity: quantityToAdd,
          notes: formData.notes || `Added stock to ${selectedChemical.chemical_name}`
        };

        const r = await api.post(`/chemicals/${selectedChemical.chemical_id}/receive`, payload);
        if (r.data.success) {
          toast.success('Stock added successfully');
          setShowAddModal(false);
          resetForms();
          await fetchChemicals();
          await fetchDashboardStats();
        }
        return;
      }

      const payload = {
        name: formData.name,
        category: formData.category.toLowerCase(),
        unit: formData.unit,
        current_stock: parseFloat(formData.current_stock) || 0,
        min_stock_level: parseFloat(formData.min_stock_level) || 0,
        reorder_level: parseFloat(formData.reorder_level) || 0,
        unit_cost: parseFloat(formData.unit_cost) || 0,
        hazard_level: formData.hazard_level.toLowerCase(),
        notes: formData.notes || null,
      };

      const r = await api.post('/chemicals', payload);
      if (r.data.success) {
        toast.success('Chemical added successfully');
        setShowAddModal(false);
        resetForms();
        await fetchChemicals();
        await fetchDashboardStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRecordUsage = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        chemical_id: parseInt(usageFormData.chemical_id),
        quantity_used: parseFloat(usageFormData.quantity_used),
        used_by: usageFormData.used_by,
        usage_notes: usageFormData.usage_notes,
        deceased_id: usageFormData.deceased_id || null,
      };

      const r = await api.post('/chemicals/usage', payload);
      if (r.data.success) {
        toast.success('Usage recorded successfully');
        setShowUsageModal(false);
        resetForms();
        await fetchChemicals();
        await fetchUsageData();
        await fetchDashboardStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePPERequest = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        item_name: ppeFormData.item_name,
        quantity_requested: parseInt(ppeFormData.quantity_requested),
        requested_by: ppeFormData.requested_by,
        notes: ppeFormData.notes,
        branch_id: 1,
      };

      const r = await api.post('/chemicals/ppe-requests', payload);
      if (r.data.success) {
        toast.success('PPE request submitted successfully');
        setShowPPEModal(false);
        resetForms();
        await fetchPPERequests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetForms = () => {
    setFormData({
      name: '', category: 'embalming', unit: 'liters',
      current_stock: '', min_stock_level: '', reorder_level: '',
      unit_cost: '', hazard_level: 'low', notes: '',
      jerican_capacity: '', jericans_received: '',
    });
    setUsageFormData({ chemical_id: '', quantity_used: '', used_by: '', usage_notes: '', deceased_id: '' });
    setPPEFormData({ item_name: '', quantity_requested: '', requested_by: '', notes: '' });
    setSelectedChemical(null);
  };

  const openUsageForChemical = (chem) => {
    setSelectedChemical(chem);
    setUsageFormData(prev => ({ ...prev, chemical_id: String(chem.chemical_id) }));
    setShowUsageModal(true);
  };

  const openAddStockForChemical = (chem) => {
    setSelectedChemical(chem);
    setFormData(prev => ({
      ...prev,
      name: chem.chemical_name,
      category: chem.category,
      unit: chem.unit,
      current_stock: '',
      min_stock_level: String(chem.min_stock_level),
      reorder_level: String(chem.reorder_level),
      unit_cost: '',
      hazard_level: chem.hazard_level || 'low',
      notes: '',
      jerican_capacity: chem.jerican_capacity ? String(chem.jerican_capacity) : '',
      jericans_received: '',
    }));
    setShowAddModal(true);
  };

  /* ─── Filter ───────────────────────────────────────────────── */
  const filteredChemicals = chemicals.filter(c =>
    c.chemical_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = dashboardStats.low_stock_count || 0;

  /* ─── Loading ──────────────────────────────────────────────── */
  if (loading) {
    return (
      <Page>
        <LoadingWrap>
          <Spinner />
          <LoadingText>Loading chemical inventory...</LoadingText>
        </LoadingWrap>
      </Page>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <Page>

      {/* ─── Header ──────────────────────────────────────────── */}
      <PageHeader>
        <PageTitle>
          <Beaker size={22} />
          Chemical Inventory
        </PageTitle>
        <HeaderBtns>
          <Btn $variant="blue" onClick={() => { setSelectedChemical(null); resetForms(); setShowAddModal(true); }}>
            <Plus size={16} />
            <span className="btn-label">Add Chemical</span>
          </Btn>
          <Btn $variant="green" onClick={() => { setSelectedChemical(null); resetForms(); setShowUsageModal(true); }}>
            <FlaskConical size={16} />
            <span className="btn-label">Record Usage</span>
          </Btn>
          <Btn $variant="amber" onClick={() => { resetForms(); setShowPPEModal(true); }}>
            <Shield size={16} />
            <span className="btn-label">PPE Request</span>
          </Btn>
        </HeaderBtns>
      </PageHeader>

      {/* ─── Stats ───────────────────────────────────────────── */}
      <StatsRow>
        <StatCard style={{ animationDelay: '0s' }}>
          <StatTop>
            <StatLabel>Total Chemicals</StatLabel>
            <Package size={18} color={COLORS.accentBlue} />
          </StatTop>
          <StatNum>{chemicals.length}</StatNum>
        </StatCard>
        <StatCard style={{ animationDelay: '0.05s' }}>
          <StatTop>
            <StatLabel>Low Stock</StatLabel>
            <AlertTriangle size={18} color={lowStockCount > 0 ? COLORS.dangerRed : COLORS.textTertiary} />
          </StatTop>
          <StatNum $color={lowStockCount > 0 ? COLORS.dangerRed : COLORS.textPrimary}>
            {lowStockCount}
          </StatNum>
        </StatCard>
        <StatCard style={{ animationDelay: '0.1s' }}>
          <StatTop>
            <StatLabel>Usage (30d)</StatLabel>
            <TrendingUp size={18} color={COLORS.successGreen} />
          </StatTop>
          <StatNum>{dashboardStats.total_usage_30d || 0}<span style={{ fontSize: '14px', fontWeight: 600, color: COLORS.textTertiary, marginLeft: 2 }}>L</span></StatNum>
        </StatCard>
        <StatCard style={{ animationDelay: '0.15s' }}>
          <StatTop>
            <StatLabel>PPE Requests</StatLabel>
            <Shield size={18} color={COLORS.warningYellow} />
          </StatTop>
          <StatNum>{ppeRequests.length}</StatNum>
        </StatCard>
      </StatsRow>

      {/* ─── Tabs ────────────────────────────────────────────── */}
      <Tabs>
        <Tab $active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>
          <Package size={15} /> Inventory
        </Tab>
        <Tab $active={activeTab === 'usage'} onClick={() => setActiveTab('usage')}>
          <History size={15} /> Usage History
        </Tab>
        <Tab $active={activeTab === 'ppe'} onClick={() => setActiveTab('ppe')}>
          <Shield size={15} /> PPE Requests
        </Tab>
      </Tabs>

      {/* ══════════════════════════════════════════════════════
          INVENTORY TAB
         ══════════════════════════════════════════════════════ */}
      {activeTab === 'inventory' && (
        <Section>
          <SectionHead>
            <SectionTitle><Package size={18} /> Chemical Stock</SectionTitle>
            <SearchBox>
              <Search size={16} />
              <SearchInput
                placeholder="Search chemicals..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </SearchBox>
          </SectionHead>

          {filteredChemicals.length === 0 ? (
            <Empty>
              <EmptyIconWrap><TestTube2 size={26} /></EmptyIconWrap>
              <EmptyTitle>No chemicals found</EmptyTitle>
              <EmptyDesc>Add your first chemical to get started</EmptyDesc>
            </Empty>
          ) : (
            filteredChemicals.map(chem => {
              const pct = getHealthPct(chem);
              const isLow = chem.is_low_stock === 1;
              return (
                <ChemCard key={chem.chemical_id}>
                  <ChemHead>
                    <div>
                      <ChemName><Beaker size={16} />{chem.chemical_name}</ChemName>
                      <ChemMeta>ID: {chem.chemical_uid} · {chem.category}</ChemMeta>
                    </div>
                    <Badge $low={isLow}>
                      <span className="dot" />
                      {isLow ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </ChemHead>

                  <StockGrid>
                    <StockItem>
                      <StockLbl>Available</StockLbl>
                      <StockVal>{chem.quantity_available} {chem.unit}</StockVal>
                    </StockItem>
                    <StockItem>
                      <StockLbl>Min Level</StockLbl>
                      <StockVal>{chem.min_stock_level} {chem.unit}</StockVal>
                    </StockItem>
                    {chem.jerican_capacity && (
                      <StockItem>
                        <StockLbl>Jerican Size</StockLbl>
                        <StockVal>{chem.jerican_capacity}L</StockVal>
                      </StockItem>
                    )}
                    {chem.jericans_received > 0 && (
                      <StockItem>
                        <StockLbl>Jericans</StockLbl>
                        <StockVal>{chem.jericans_received}</StockVal>
                      </StockItem>
                    )}
                  </StockGrid>

                  <HealthWrap>
                    <HealthTrack>
                      <HealthFill $pct={pct} />
                    </HealthTrack>
                    <HealthLabels>
                      <HealthPct $pct={pct}>{chem.min_stock_level > 0 ? `${pct}%` : 'N/A'}</HealthPct>
                      <HealthStatus $pct={pct}>{chem.min_stock_level > 0 ? getHealthLabel(pct) : (chem.quantity_available > 0 ? 'Healthy' : 'Empty')}</HealthStatus>
                    </HealthLabels>
                  </HealthWrap>

                  <UsageBar>
                    <UsageLabel>Usage (30 days):</UsageLabel>
                    <UsageVal>{chem.total_used || 0} {chem.unit}</UsageVal>
                  </UsageBar>

                  <CardActions>
                    <IconBtn onClick={() => openUsageForChemical(chem)}>
                      <FlaskConical size={15} /> Use
                    </IconBtn>
                    <IconBtn onClick={() => openAddStockForChemical(chem)}>
                      <Plus size={15} /> Add Stock
                    </IconBtn>
                  </CardActions>
                </ChemCard>
              );
            })
          )}
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════
          USAGE HISTORY TAB
         ══════════════════════════════════════════════════════ */}
      {activeTab === 'usage' && (
        <Section>
          <SectionHead>
            <SectionTitle><History size={18} /> Usage History</SectionTitle>
          </SectionHead>

          {usageData.length === 0 ? (
            <Empty>
              <EmptyIconWrap><ClipboardList size={26} /></EmptyIconWrap>
              <EmptyTitle>No usage records</EmptyTitle>
              <EmptyDesc>Usage history will appear here after recording chemical usage</EmptyDesc>
            </Empty>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Tbl>
                <thead>
                  <TblHead>
                    <Th>Date</Th>
                    <Th>Chemical</Th>
                    <Th>Quantity</Th>
                    <Th>Used By</Th>
                    <Th>Notes</Th>
                  </TblHead>
                </thead>
                <tbody>
                  {usageData.slice(0, 30).map(u => (
                    <tr key={u.usage_id} style={{ borderBottom: `1px solid #F1F5F9` }}>
                      <Td>{fmtDate(u.used_at)}</Td>
                      <Td style={{ fontWeight: 650 }}>{u.chemical_name}</Td>
                      <Td>{u.quantity_used} {u.unit}</Td>
                      <Td>{u.used_by || '—'}</Td>
                      <TdWrap>{u.usage_notes || '—'}</TdWrap>
                    </tr>
                  ))}
                </tbody>
              </Tbl>
            </div>
          )}
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════
          PPE REQUESTS TAB
         ══════════════════════════════════════════════════════ */}
      {activeTab === 'ppe' && (
        <Section>
          <SectionHead>
            <SectionTitle><Shield size={18} /> PPE Requests</SectionTitle>
          </SectionHead>

          {ppeRequests.length === 0 ? (
            <Empty>
              <EmptyIconWrap><Shield size={26} /></EmptyIconWrap>
              <EmptyTitle>No PPE requests</EmptyTitle>
              <EmptyDesc>Submit new requests using the PPE Request button above</EmptyDesc>
            </Empty>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Tbl>
                <thead>
                  <TblHead>
                    <Th>Date</Th>
                    <Th>Item</Th>
                    <Th>Qty</Th>
                    <Th>Requested By</Th>
                    <Th>Status</Th>
                  </TblHead>
                </thead>
                <tbody>
                  {ppeRequests.map(req => (
                    <tr key={req.id} style={{ borderBottom: `1px solid #F1F5F9` }}>
                      <Td>{fmtDate(req.created_at)}</Td>
                      <Td style={{ fontWeight: 650 }}>{req.item_name}</Td>
                      <Td>{req.quantity_requested}</Td>
                      <Td>{req.requested_by}</Td>
                      <Td><PPEBadge status={req.status} /></Td>
                    </tr>
                  ))}
                </tbody>
              </Tbl>
            </div>
          )}
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════
          ADD CHEMICAL MODAL
         ══════════════════════════════════════════════════════ */}
      {showAddModal && (
        <Overlay onClick={() => setShowAddModal(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalHead>
              <ModalTitle>
                <Plus size={20} />
                {selectedChemical ? 'Add Stock' : 'Add Chemical'}
              </ModalTitle>
              <CloseBtn onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </CloseBtn>
            </ModalHead>
            <ModalBody>
              <form onSubmit={handleAddChemical}>
                <FormRow>
                  <Field>
                    <Label>Chemical Name *</Label>
                    <Input
                      placeholder="e.g., Formaldehyde Solution"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required={!selectedChemical}
                      disabled={!!selectedChemical}
                    />
                  </Field>
                  <Field>
                    <Label>Category *</Label>
                    <Input
                      placeholder="e.g., embalming, disinfectant"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      required={!selectedChemical}
                      disabled={!!selectedChemical}
                    />
                  </Field>
                  <Field>
                    <Label>Unit *</Label>
                    <Input
                      placeholder="e.g., liters, kg, ml"
                      value={formData.unit}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}
                      required={!selectedChemical}
                      disabled={!!selectedChemical}
                    />
                  </Field>
                  <Field>
                    <Label>{selectedChemical ? 'Stock to Add *' : 'Initial Stock *'}</Label>
                    <Input
                      type="number" step="0.01" placeholder="0.00"
                      value={formData.current_stock}
                      onChange={e => setFormData({ ...formData, current_stock: e.target.value })}
                      required
                    />
                  </Field>
                  <Field>
                    <Label>Min Stock Level *</Label>
                    <Input
                      type="number" step="0.01" placeholder="0.00"
                      value={formData.min_stock_level}
                      onChange={e => setFormData({ ...formData, min_stock_level: e.target.value })}
                      required
                    />
                  </Field>
                  <Field>
                    <Label>Reorder Level *</Label>
                    <Input
                      type="number" step="0.01" placeholder="0.00"
                      value={formData.reorder_level}
                      onChange={e => setFormData({ ...formData, reorder_level: e.target.value })}
                      required
                    />
                  </Field>
                  <Field>
                    <Label>Unit Cost</Label>
                    <Input
                      type="number" step="0.01" placeholder="0.00"
                      value={formData.unit_cost}
                      onChange={e => setFormData({ ...formData, unit_cost: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <Label>Hazard Level</Label>
                    <Select
                      value={formData.hazard_level}
                      onChange={e => setFormData({ ...formData, hazard_level: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Select>
                  </Field>
                  {formData.unit.toLowerCase() !== 'liters' && (
                    <>
                      <Field>
                        <Label>Jerican Capacity (L)</Label>
                        <Input
                          type="number" step="0.01" placeholder="e.g., 20"
                          value={formData.jerican_capacity}
                          onChange={e => setFormData({ ...formData, jerican_capacity: e.target.value })}
                        />
                      </Field>
                      <Field>
                        <Label>Jericans Received</Label>
                        <Input
                          type="number" placeholder="0"
                          value={formData.jericans_received}
                          onChange={e => setFormData({ ...formData, jericans_received: e.target.value })}
                        />
                      </Field>
                    </>
                  )}
                  <FullSpan>
                    <Field>
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Additional notes..."
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </Field>
                  </FullSpan>
                </FormRow>
                <ModalFoot>
                  <GhostBtn type="button" onClick={() => setShowAddModal(false)}>Cancel</GhostBtn>
                  <PrimaryBtn type="submit">
                    <Save size={16} />
                    {selectedChemical ? 'Add Stock' : 'Save Chemical'}
                  </PrimaryBtn>
                </ModalFoot>
              </form>
            </ModalBody>
          </ModalBox>
        </Overlay>
      )}

      {/* ══════════════════════════════════════════════════════
          RECORD USAGE MODAL
         ══════════════════════════════════════════════════════ */}
      {showUsageModal && (
        <Overlay onClick={() => setShowUsageModal(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalHead>
              <ModalTitle><FlaskConical size={20} /> Record Usage</ModalTitle>
              <CloseBtn onClick={() => setShowUsageModal(false)}><X size={16} /></CloseBtn>
            </ModalHead>
            <ModalBody>
              <form onSubmit={handleRecordUsage}>
                <FormRow>
                  <Field>
                    <Label>Chemical *</Label>
                    <Select
                      value={usageFormData.chemical_id}
                      onChange={e => setUsageFormData({ ...usageFormData, chemical_id: e.target.value })}
                      required
                    >
                      <option value="">Select chemical...</option>
                      {chemicals.map(c => (
                        <option key={c.chemical_id} value={c.chemical_id}>
                          {c.chemical_name} ({c.quantity_available} {c.unit} available)
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field>
                    <Label>Quantity Used *</Label>
                    <Input
                      type="number" step="0.01" placeholder="0.00"
                      value={usageFormData.quantity_used}
                      onChange={e => setUsageFormData({ ...usageFormData, quantity_used: e.target.value })}
                      required
                    />
                  </Field>
                  <Field>
                    <Label>Used By</Label>
                    <Input
                      placeholder="Staff name"
                      value={usageFormData.used_by}
                      onChange={e => setUsageFormData({ ...usageFormData, used_by: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <Label>Deceased ID (Optional)</Label>
                    <Input
                      placeholder="Deceased #"
                      value={usageFormData.deceased_id}
                      onChange={e => setUsageFormData({ ...usageFormData, deceased_id: e.target.value })}
                    />
                  </Field>
                  <FullSpan>
                    <Field>
                      <Label>Usage Notes</Label>
                      <Textarea
                        placeholder="Notes about this usage..."
                        value={usageFormData.usage_notes}
                        onChange={e => setUsageFormData({ ...usageFormData, usage_notes: e.target.value })}
                      />
                    </Field>
                  </FullSpan>
                </FormRow>
                <ModalFoot>
                  <GhostBtn type="button" onClick={() => setShowUsageModal(false)}>Cancel</GhostBtn>
                  <PrimaryBtn type="submit"><Save size={16} /> Record Usage</PrimaryBtn>
                </ModalFoot>
              </form>
            </ModalBody>
          </ModalBox>
        </Overlay>
      )}

      {/* ══════════════════════════════════════════════════════
          PPE REQUEST MODAL
         ══════════════════════════════════════════════════════ */}
      {showPPEModal && (
        <Overlay onClick={() => setShowPPEModal(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalHead>
              <ModalTitle><Shield size={20} /> Request PPE</ModalTitle>
              <CloseBtn onClick={() => setShowPPEModal(false)}><X size={16} /></CloseBtn>
            </ModalHead>
            <ModalBody>
              <form onSubmit={handlePPERequest}>
                <FormRow>
                  <Field>
                    <Label>Item Name *</Label>
                    <Input
                      placeholder="e.g., Nitrile Gloves, N95 Masks"
                      value={ppeFormData.item_name}
                      onChange={e => setPPEFormData({ ...ppeFormData, item_name: e.target.value })}
                      required
                    />
                  </Field>
                  <Field>
                    <Label>Quantity *</Label>
                    <Input
                      type="number" placeholder="0"
                      value={ppeFormData.quantity_requested}
                      onChange={e => setPPEFormData({ ...ppeFormData, quantity_requested: e.target.value })}
                      required
                    />
                  </Field>
                  <Field>
                    <Label>Requested By *</Label>
                    <Input
                      placeholder="Your name"
                      value={ppeFormData.requested_by}
                      onChange={e => setPPEFormData({ ...ppeFormData, requested_by: e.target.value })}
                      required
                    />
                  </Field>
                  <FullSpan>
                    <Field>
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Additional notes..."
                        value={ppeFormData.notes}
                        onChange={e => setPPEFormData({ ...ppeFormData, notes: e.target.value })}
                      />
                    </Field>
                  </FullSpan>
                </FormRow>
                <ModalFoot>
                  <GhostBtn type="button" onClick={() => setShowPPEModal(false)}>Cancel</GhostBtn>
                  <PrimaryBtn type="submit"><Save size={16} /> Submit Request</PrimaryBtn>
                </ModalFoot>
              </form>
            </ModalBody>
          </ModalBox>
        </Overlay>
      )}
    </Page>
  );
};

export default ChemicalManagementDashboard;