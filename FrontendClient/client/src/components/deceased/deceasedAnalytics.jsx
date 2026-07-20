import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  User, Clock, CheckCircle, AlertTriangle, X, Eye, Edit,
  ArrowUp, ArrowDown, RefreshCw, Download, Filter, FlaskConical,
  Truck, Calendar, MapPin, Phone, Mail, Activity, ChevronRight,
  FileText, ClipboardList, Zap, BarChart3, TrendingUp, Copy
} from '../../utils/icons/icons';

const API_GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_GATEWAY_URL}`;

// ═══════════════════════════════════════════════════════════════════════════
//  TOKENS
// ═══════════════════════════════════════════════════════════════════════════

const T = {
  bg: '#F8FAFC', surface: '#FFFFFF', surfaceHover: '#F1F5F9',
  border: '#E2E8F0', borderLight: '#F1F5F9',
  text: '#0F172A', textBody: '#334155', textSecondary: '#64748B',
  textMuted: '#94A3B8', textFaint: '#CBD5E1',
  primary: '#2563EB', primaryBg: '#EFF6FF', primaryLight: '#93C5FD',
  success: '#059669', successBg: '#ECFDF5', successBorder: '#A7F3D0',
  warning: '#D97706', warningBg: '#FFFBEB', warningBorder: '#FDE68A',
  danger: '#DC2626', dangerBg: '#FEF2F2', dangerBorder: '#FECACA',
  info: '#2563EB', infoBg: '#EFF6FF', infoBorder: '#BFDBFE',
  purple: '#7C3AED', purpleBg: '#F5F3FF',
  cyan: '#0891B2', cyanBg: '#ECFEFF',
  teal: '#0D9488', tealBg: '#F0FDFA',
  orange: '#EA580C', orangeBg: '#FFF7ED',
  pink: '#DB2777', pinkBg: '#FDF2F8',
  slate: '#475569', slateBg: '#F1F5F9',
  chartColors: ['#2563EB', '#7C3AED', '#0891B2', '#059669', '#D97706', '#DC2626', '#DB2777', '#EA580C', '#0D9488', '#6366F1'],
};

// ═══════════════════════════════════════════════════════════════════════════
//  ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

const fadeIn = keyframes`from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); }`;
const slideInRight = keyframes`from { transform:translateX(100%); } to { transform:translateX(0); }`;
const fadeInOverlay = keyframes`from { opacity:0; } to { opacity:1; }`;
const barGrow = keyframes`from { transform:scaleX(0); } to { transform:scaleX(1); }`;
const countUp = keyframes`from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); }`;
const spin = keyframes`to { transform:rotate(360deg); }`;
const progressFill = keyframes`from { width:0%; }`;

// ═══════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface DeceasedRecord {
  deceased_id: string;
  full_name: string;
  date_of_death: string;
  date_admitted: string;
  status: string;
  burial_type: string;
  cause_of_death: string;
  gender: string;
  age: number;
  id_number: string;
  total_charges: number;
  currency: string;
  postmortem_requested: boolean;
  postmortem_done: boolean;
  postmortem_date: string | null;
  dispatched: boolean;
  dispatched_date: string | null;
  spaced: boolean;
  spaced_date: string | null;
  body_status: string;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  next_of_kin_email: string;
  address: string;
  notes: string;
  requesting_authority: string;
  pathologist_name: string;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MOCK DATA — Replace with API
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_DATA: DeceasedRecord[] = [
  {
    deceased_id: 'DEC-2401', full_name: 'John Ochieng', date_of_death: '2025-01-15',
    date_admitted: '2025-01-16', status: 'active', burial_type: 'Burial',
    cause_of_death: 'Cardiac arrest', gender: 'Male', age: 67, id_number: '12345678',
    total_charges: 185000, currency: 'KES',
    postmortem_requested: true, postmortem_done: true, postmortem_date: '2025-01-17',
    dispatched: false, dispatched_date: null, spaced: false, spaced_date: null,
    body_status: 'Preserved', next_of_kin_name: 'Peter Ochieng',
    next_of_kin_phone: '0712345678', next_of_kin_email: 'peter@email.com',
    address: 'Nairobi, Kenya', notes: 'Routine case. Family notified.',
    requesting_authority: 'Nairobi Central Police', pathologist_name: 'Dr. Kamau',
  },
  {
    deceased_id: 'DEC-2402', full_name: 'Mary Wanjiku', date_of_death: '2025-01-18',
    date_admitted: '2025-01-19', status: 'active', burial_type: 'Cremation',
    cause_of_death: 'Pneumonia', gender: 'Female', age: 72, id_number: '23456789',
    total_charges: 210000, currency: 'KES',
    postmortem_requested: true, postmortem_done: true, postmortem_date: '2025-01-20',
    dispatched: false, dispatched_date: null, spaced: false, spaced_date: null,
    body_status: 'Preserved', next_of_kin_name: 'Grace Wanjiku',
    next_of_kin_phone: '0723456789', next_of_kin_email: 'grace@email.com',
    address: 'Mombasa Rd, Nairobi', notes: '',
    requesting_authority: 'Nairobi Central Police', pathologist_name: 'Dr. Kamau',
  },
  {
    deceased_id: 'DEC-2403', full_name: 'James Mwangi', date_of_death: '2025-01-20',
    date_admitted: '2025-01-21', status: 'dispatched', burial_type: 'Burial',
    cause_of_death: 'Road traffic accident', gender: 'Male', age: 45, id_number: '34567890',
    total_charges: 320000, currency: 'KES',
    postmortem_requested: true, postmortem_done: true, postmortem_date: '2025-01-22',
    dispatched: true, dispatched_date: '2025-01-23', spaced: true, spaced_date: '2025-01-23',
    body_status: 'Dispatched', next_of_kin_name: 'Susan Mwangi',
    next_of_kin_phone: '0734567890', next_of_kin_email: 'susan@email.com',
    address: 'Kisumu, Kenya', notes: 'Coroner case. Full autopsy performed.',
    requesting_authority: 'Kisumu Police Station', pathologist_name: 'Dr. Akinyi',
  },
  {
    deceased_id: 'DEC-2404', full_name: 'Grace Akinyi', date_of_death: '2025-01-22',
    date_admitted: '2025-01-23', status: 'active', burial_type: 'Burial',
    cause_of_death: 'Natural causes', gender: 'Female', age: 89, id_number: '45678901',
    total_charges: 155000, currency: 'KES',
    postmortem_requested: true, postmortem_done: false, postmortem_date: null,
    dispatched: false, dispatched_date: null, spaced: false, spaced_date: null,
    body_status: 'Awaiting postmortem', next_of_kin_name: 'Joseph Akinyi',
    next_of_kin_phone: '0745678901', next_of_kin_email: 'joseph@email.com',
    address: 'Nakuru, Kenya', notes: 'Elderly patient. Postmortem pending pathologist availability.',
    requesting_authority: 'Nakuru Hospital', pathologist_name: 'Dr. Ochieng',
  },
  {
    deceased_id: 'DEC-2405', full_name: 'Peter Otieno', date_of_death: '2025-01-24',
    date_admitted: '2025-01-25', status: 'released', burial_type: 'Cremation',
    cause_of_death: 'Cancer', gender: 'Male', age: 58, id_number: '56789012',
    total_charges: 275000, currency: 'KES',
    postmortem_requested: true, postmortem_done: true, postmortem_date: '2025-01-25',
    dispatched: true, dispatched_date: '2025-01-26', spaced: true, spaced_date: '2025-01-26',
    body_status: 'Cremated', next_of_kin_name: 'Alice Otieno',
    next_of_kin_phone: '0756789012', next_of_kin_email: 'alice@email.com',
    address: 'Eldoret, Kenya', notes: 'Family requested immediate cremation.',
    requesting_authority: 'Eldoret Hospital', pathologist_name: 'Dr. Kamau',
  },
  {
    deceased_id: 'DEC-2406', full_name: 'Sarah Njeri', date_of_death: '2025-01-26',
    date_admitted: '2025-01-27', status: 'active', burial_type: 'Burial',
    cause_of_death: 'Kidney failure', gender: 'Female', age: 54, id_number: '67890123',
    total_charges: 195000, currency: 'KES',
    postmortem_requested: false, postmortem_done: false, postmortem_date: null,
    dispatched: false, dispatched_date: null, spaced: false, spaced_date: null,
    body_status: 'Admitted', next_of_kin_name: 'David Njeri',
    next_of_kin_phone: '0767890123', next_of_kin_email: 'david@email.com',
    address: 'Thika, Kenya', notes: 'Postmortem not yet requested by family.',
    requesting_authority: '', pathologist_name: '',
  },
  {
    deceased_id: 'DEC-2407', full_name: 'Samuel Karanja', date_of_death: '2025-01-28',
    date_admitted: '2025-01-28', status: 'active', burial_type: 'Burial',
    cause_of_death: 'Diabetes complications', gender: 'Male', age: 71, id_number: '78901234',
    total_charges: 168000, currency: 'KES',
    postmortem_requested: true, postmortem_done: true, postmortem_date: '2025-01-29',
    dispatched: false, dispatched_date: null, spaced: false, spaced_date: null,
    body_status: 'Preserved', next_of_kin_name: 'Ruth Karanja',
    next_of_kin_phone: '0778901234', next_of_kin_email: 'ruth@email.com',
    address: 'Nairobi, Kenya', notes: '',
    requesting_authority: 'Nairobi Central Police', pathologist_name: 'Dr. Akinyi',
  },
  {
    deceased_id: 'DEC-2408', full_name: 'Agnes Wambui', date_of_death: '2025-01-29',
    date_admitted: '2025-01-30', status: 'dispatched', burial_type: 'Burial',
    cause_of_death: 'Hypertension', gender: 'Female', age: 80, id_number: '89012345',
    total_charges: 240000, currency: 'KES',
    postmortem_requested: true, postmortem_done: true, postmortem_date: '2025-01-30',
    dispatched: true, dispatched_date: '2025-01-31', spaced: true, spaced_date: '2025-01-31',
    body_status: 'Dispatched', next_of_kin_name: 'Michael Wambui',
    next_of_kin_phone: '0789012345', next_of_kin_email: 'michael@email.com',
    address: 'Kiambu, Kenya', notes: 'Natural death. No suspicious circumstances.',
    requesting_authority: 'Kiambu Police', pathologist_name: 'Dr. Ochieng',
  },
  {
    deceased_id: 'DEC-2409', full_name: 'Daniel Kiprop', date_of_death: '2025-02-01',
    date_admitted: '2025-02-02', status: 'active', burial_type: 'Burial',
    cause_of_death: 'TB complications', gender: 'Male', age: 38, id_number: '90123456',
    total_charges: 178000, currency: 'KES',
    postmortem_requested: true, postmortem_done: false, postmortem_date: null,
    dispatched: false, dispatched_date: null, spaced: false, spaced_date: null,
    body_status: 'Awaiting postmortem', next_of_kin_name: 'Florence Kiprop',
    next_of_kin_phone: '0790123456', next_of_kin_email: 'florence@email.com',
    address: 'Uasin Gishu, Kenya', notes: 'Infectious disease protocol.',
    requesting_authority: 'Moi Teaching Hospital', pathologist_name: 'Dr. Kamau',
  },
  {
    deceased_id: 'DEC-2410', full_name: 'Lucy Nyambura', date_of_death: '2025-02-03',
    date_admitted: '2025-02-04', status: 'released', burial_type: 'Cremation',
    cause_of_death: 'Stroke', gender: 'Female', age: 65, id_number: '01234567',
    total_charges: 260000, currency: 'KES',
    postmortem_requested: true, postmortem_done: true, postmortem_date: '2025-02-04',
    dispatched: true, dispatched_date: '2025-02-05', spaced: true, spaced_date: '2025-02-05',
    body_status: 'Cremated', next_of_kin_name: 'Thomas Nyambura',
    next_of_kin_phone: '0701234567', next_of_kin_email: 'thomas@email.com',
    address: 'Nairobi, Kenya', notes: '',
    requesting_authority: 'Nairobi Central Police', pathologist_name: 'Dr. Akinyi',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
//  STYLED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const Page = styled.div`
  min-height: 100vh;
  background: ${T.bg};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: ${T.text};
  padding: 1.25rem 1.75rem;
  max-width: 1440px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  animation: ${fadeIn} 0.2s ease-out;
`;

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PageDesc = styled.p`
  font-size: 0.8125rem;
  color: ${T.textSecondary};
  margin: 0.25rem 0 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const Btn = styled.button<{ $variant?: 'primary' | 'secondary' }>`
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
  &:hover { background: ${T.surfaceHover}; border-color: ${T.textMuted}; }
  ${props => props.$variant === 'primary' && css`
    background: ${T.primary}; color: white; border-color: ${T.primary};
    &:hover { background: #1D4ED8; box-shadow: 0 1px 3px rgba(37,99,235,0.3); }
  `}
`;

// ─── Stats Grid ────────────────────────────────────────────────────────────

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  animation: ${fadeIn} 0.25s ease-out;
  @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
`;

const StatCard = styled.div`
  background: ${T.surface};
  border: 1px solid ${T.border};
  border-radius: 10px;
  padding: 0.875rem 1rem;
  transition: all 0.15s ease;
  &:hover { border-color: ${T.textMuted}; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
`;

const StatLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 500;
  color: ${T.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.375rem;
  font-weight: 700;
  color: ${T.text};
  line-height: 1;
  animation: ${countUp} 0.4s ease-out;
`;

const StatChange = styled.div<{ $up?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.1875rem;
  font-size: 0.6875rem;
  font-weight: 600;
  margin-top: 0.25rem;
  color: ${props => props.$up ? T.success : T.danger};
`;

// ─── Chart Grid (3 panels like reference) ───────────────────────────────────

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.875rem;
  margin-bottom: 1.25rem;
  @media (max-width: 1100px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const ChartCard = styled.div`
  background: ${T.surface};
  border: 1px solid ${T.border};
  border-radius: 10px;
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ChartHeader = styled.div`
  padding: 0.875rem 1.125rem;
  border-bottom: 1px solid ${T.borderLight};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChartTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${T.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const ChartSub = styled.span`
  font-size: 0.6875rem;
  color: ${T.textMuted};
  font-weight: 500;
`;

const ChartBody = styled.div`
  padding: 1rem 1.125rem;
`;

// ─── Metric Summary (top of each panel, like reference image) ─────────────

const MetricRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid ${T.borderLight};
`;

const MetricBox = styled.div`
  flex: 1;
`;

const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${T.text};
  line-height: 1;
`;

const MetricLabel = styled.div`
  font-size: 0.6875rem;
  color: ${T.textMuted};
  margin-top: 0.125rem;
`;

const MetricChange = styled.span<{ $up?: boolean }>`
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${props => props.$up ? T.success : T.danger};
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  margin-left: 0.375rem;
`;

// ─── Horizontal Bar ───────────────────────────────────────────────────────

const HBarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.625rem;
  cursor: pointer;
  padding: 0.375rem 0.5rem;
  border-radius: 6px;
  transition: background 0.12s ease;
  &:hover { background: ${T.surfaceHover}; }
  &:last-child { margin-bottom: 0; }
`;

const HBarLabel = styled.div`
  width: 100px;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${T.textBody};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
`;

const HBarTrack = styled.div`
  flex: 1;
  height: 24px;
  background: ${T.borderLight};
  border-radius: 5px;
  overflow: hidden;
`;

const HBarFill = styled.div<{ $color: string; $width: number }>`
  height: 100%;
  border-radius: 5px;
  background: ${props => props.$color};
  width: ${props => Math.min(props.$width, 100)}%;
  min-width: 4px;
  animation: ${barGrow} 0.6s ease-out backwards;
  transition: width 0.3s ease;
`;

const HBarValue = styled.div`
  width: 52px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${T.text};
  text-align: right;
  flex-shrink: 0;
`;

// ─── Status Dots ───────────────────────────────────────────────────────────

const StatusDot = styled.span<{ $color: string }>`
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${props => props.$color};
  margin-right: 0.375rem;
  flex-shrink: 0;
`;

// ─── Legend ────────────────────────────────────────────────────────────────

const LegendRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  margin-top: 0.875rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${T.borderLight};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3125rem;
  font-size: 0.6875rem;
  color: ${T.textSecondary};
`;

const LegendDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: ${props => props.$color};
`;

// ─── Drawer ──────────────────────────────────────────────────────────────

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
  width: 520px;
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
  margin: 0 0 0.125rem;
`;

const DrawerId = styled.span`
  font-size: 0.6875rem;
  color: ${T.textMuted};
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

const SectionTitle = styled.h4`
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
  gap: 0.5rem;
`;

const FieldCard = styled.div<{ $highlight?: boolean }>`
  padding: 0.625rem 0.75rem;
  background: ${props => props.$highlight ? T.warningBg : T.bg};
  border: 1px solid ${props => props.$highlight ? T.warningBorder : T.borderLight};
  border-radius: 7px;
  grid-column: ${props => props.$highlight ? '1 / -1' : 'auto'};
`;

const FieldLabel = styled.div`
  font-size: 0.625rem;
  font-weight: 600;
  color: ${T.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.125rem;
`;

const FieldValue = styled.div`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${T.text};
`;

// ─── Timeline ────────────────────────────────────────────────────────────

const Timeline = styled.div`
  position: relative;
  padding-left: 1.25rem;
`;

const TimelineLine = styled.div`
  position: absolute;
  left: 7px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: ${T.border};
`;

const TimelineItem = styled.div`
  position: relative;
  padding-bottom: 1rem;
  display: flex;
  gap: 0.75rem;
`;

const TimelineDot = styled.div<{ $color: string; $done: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid ${props => props.$color};
  background: ${props => props.$done ? props.$color : T.surface};
  flex-shrink: 0;
  margin-top: 2px;
  position: relative;
  z-index: 1;
`;

const TimelineContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const TimelineTitle = styled.div`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${T.text};
`;

const TimelineDesc = styled.div`
  font-size: 0.75rem;
  color: ${T.textSecondary};
  margin-top: 0.0625rem;
`;

const TimelineTime = styled.div`
  font-size: 0.6875rem;
  color: ${T.textMuted};
  margin-top: 0.125rem;
`;

// ─── Status Pill ──────────────────────────────────────────────────────────

const StatusPill = styled.span<{ $type: 'done' | 'pending' | 'not_done' | 'dispatched' | 'spaced' | 'active' | 'released' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.6875rem;
  font-weight: 600;
  ${props => {
    const map: Record<string, { bg: string; color: string; border: string }> = {
      done: { bg: T.successBg, color: T.success, border: T.successBorder },
      pending: { bg: T.warningBg, color: T.warning, border: T.warningBorder },
      not_done: { bg: T.dangerBg, color: T.danger, border: T.dangerBorder },
      dispatched: { bg: T.infoBg, color: T.info, border: T.infoBorder },
      spaced: { bg: T.purpleBg, color: T.purple, border: '#DDD6FE' },
      active: { bg: T.warningBg, color: T.warning, border: T.warningBorder },
      released: { bg: T.tealBg, color: T.teal, border: '#99F6E4' },
    };
    const s = map[props.$type] || map.active;
    return css`background: ${s.bg}; color: ${s.color}; border: 1px solid ${s.border};`;
  }}
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
    background: ${T.primary}; color: white; border-color: ${T.primary};
    &:hover { background: #1D4ED8; }
  `}
`;

const LoadingWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 0.75rem;
`;

// ═══════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const getInitials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
const getAvatarColor = (n: string) => { let h = 0; for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h); return T.chartColors[Math.abs(h) % T.chartColors.length]; };
const getDays = (d: string) => d ? Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000)) : 0;
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n: number) => `${Number(n || 0).toLocaleString()}`;
const getBarWidth = (days: number) => Math.min((days / 40) * 100, 100);

const getStatusType = (r: DeceasedRecord) => {
  if (r.status === 'released') return 'released' as const;
  if (r.status === 'dispatched') return 'dispatched' as const;
  if (r.postmortem_done) return 'done' as const;
  if (r.postmortem_requested) return 'pending' as const;
  return 'not_done' as const;
};

const getBarColor = (r: DeceasedRecord) => {
  if (r.status === 'released') return T.teal;
  if (r.status === 'dispatched') return T.info;
  if (r.postmortem_done) return T.success;
  if (r.postmortem_requested) return T.warning;
  return T.danger;
};

const getPostmortemStatus = (r: DeceasedRecord) => {
  if (r.postmortem_done) return { label: 'Completed', type: 'done' as const };
  if (r.postmortem_requested) return { label: 'Pending', type: 'pending' as const };
  return { label: 'Not Requested', type: 'not_done' as const };
};

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const DeceasedAnalytics = () => {
  const [data, setData] = useState<DeceasedRecord[]>(MOCK_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DeceasedRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Replace with API call:
  // useEffect(() => {
  //   const fetchData = async () => {
  //     setIsLoading(true);
  //     const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  //     const slug = localStorage.getItem('tenantSlug');
  //     const res = await axios.get(`${BASE_URL}/deceased/analytics`, { headers: { ... } });
  //     setData(res.data);
  //     setIsLoading(false);
  //   };
  //   fetchData();
  // }, []);

  // ─── Computed Stats ───────────────────────────────────────────────────
  const total = data.length;
  const pmRequested = data.filter(d => d.postmortem_requested).length;
  const pmDone = data.filter(d => d.postmortem_done).length;
  const dispatched = data.filter(d => d.dispatched).length;
  const spaced = data.filter(d => d.spaced).length;
  const released = data.filter(d => d.status === 'released').length;
  const avgDays = total > 0 ? Math.round(data.reduce((s, d) => s + getDays(d.date_admitted), 0) / total) : 0;
  const totalRevenue = data.reduce((s, d) => s + (d.total_charges || 0), 0);

  // ─── Panel 2: Disposition breakdown ─────────────────────────────────────
  const dispositionData = [
    { label: 'Dispatched', count: dispatched, color: T.info },
    { label: 'Spaced', count: spaced, color: T.purple },
    { label: 'Released', count: released, color: T.teal },
    { label: 'In Mortuary', count: total - dispatched - released, color: T.warning },
  ];
  const maxDisposition = Math.max(...dispositionData.map(d => d.count), 1);

  // ─── Panel 3: Postmortem completion ────────────────────────────────────
  const pmData = [
    { label: 'Completed', count: pmDone, color: T.success },
    { label: 'Pending', count: pmRequested - pmDone, color: T.warning },
    { label: 'Not Requested', count: total - pmRequested, color: T.danger },
  ];
  const maxPm = Math.max(...pmData.map(d => d.count), 1);

  // ─── Drawer handlers ───────────────────────────────────────────────────
  const openDrawer = (record: DeceasedRecord) => { setSelectedRecord(record); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setSelectedRecord(null); };

  // ═══════════════════════════════════════════════════════════════════════
  //  LOADING
  // ═══════════════════════════════════════════════════════════════════════

  if (isLoading) {
    return (
      <Page>
        <LoadingWrap>
          <div style={{ animation: `${spin} 1s linear infinite` }}><RefreshCw size={28} color={T.primary} /></div>
          <span style={{ fontSize: '0.8125rem', color: T.textSecondary }}>Loading analytics...</span>
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
        <div>
          <PageTitle><BarChart3 size={22} /> Deceased Analytics</PageTitle>
          <PageDesc>Track postmortem, dispatch, spacing and disposition for each deceased record</PageDesc>
        </div>
        <HeaderActions>
          <Btn><Download size={14} /> Export</Btn>
          <Btn onClick={() => window.location.reload()}><RefreshCw size={14} /> Refresh</Btn>
        </HeaderActions>
      </PageHeader>

      {/* ─── Stat Cards ──────────────────────────────────────────────── */}
      <StatsGrid>
        <StatCard>
          <StatLabel>Total Deceased</StatLabel>
          <StatValue>{total}</StatValue>
          <StatChange $up={true}><ArrowUp size={11} /> This period</StatChange>
        </StatCard>
        <StatCard>
          <StatLabel>Postmortem Done</StatLabel>
          <StatValue>{pmDone}/{pmRequested}</StatValue>
          <StatChange $up={pmDone > 0}><ArrowUp size={11} /> {pmRequested > 0 ? Math.round((pmDone / pmRequested) * 100) : 0}%</StatChange>
        </StatCard>
        <StatCard>
          <StatLabel>Dispatched</StatLabel>
          <StatValue>{dispatched}</StatValue>
          <StatChange $up={dispatched > 0}><ArrowUp size={11} /> {total > 0 ? Math.round((dispatched / total) * 100) : 0}%</StatChange>
        </StatCard>
        <StatCard>
          <StatLabel>Released</StatLabel>
          <StatValue>{released}</StatValue>
          <StatChange $up={released > 0}><ArrowUp size={11} /> {total > 0 ? Math.round((released / total) * 100) : 0}%</StatChange>
        </StatCard>
        <StatCard>
          <StatLabel>Avg. Days</StatLabel>
          <StatValue>{avgDays}d</StatValue>
          <StatChange $up={avgDays <= 10}><ArrowDown size={11} /> +2d vs last</StatChange>
        </StatCard>
      </StatsGrid>

      {/* ─── 3-Panel Chart Grid ──────────────────────────────────────────── */}
      <ChartGrid>
        {/* ─── Panel 1: Per-Deceased Bar Chart ────────────────────────── */}
        <ChartCard>
          <ChartHeader>
            <ChartTitle><Activity size={15} /> Per-Deceased Overview</ChartTitle>
            <ChartSub>Click for details</ChartSub>
          </ChartHeader>
          <ChartBody>
            <MetricRow>
              <MetricBox>
                <MetricValue>{fmtMoney(totalRevenue)}</MetricValue>
                <MetricLabel>Total Charges (KES)</MetricLabel>
              </MetricBox>
              <MetricBox>
                <MetricValue style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {totalRevenue > (totalRevenue - 15000) ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  {fmtMoney(Math.abs(totalRevenue - 15000))}
                </MetricValue>
                <MetricChange $up={totalRevenue > (totalRevenue - 15000)}>vs last</MetricChange>
              </MetricBox>
            </MetricRow>

            {data.map((record, i) => {
              const days = getDays(record.date_admitted);
              const barW = getBarWidth(days);
              const color = getBarColor(record);
              const initials = getInitials(record.full_name);
              const avatarColor = getAvatarColor(record.full_name);
              return (
                <HBarItem key={record.deceased_id} onClick={() => openDrawer(record)}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: avatarColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, flexShrink: 0 }}>
                    {initials}
                  </div>
                  <HBarLabel title={record.full_name}>{record.full_name}</HBarLabel>
                  <HBarTrack>
                    <HBarFill $color={color} $width={barW} style={{ animationDelay: `${i * 0.06}s` }} />
                  </HBarTrack>
                  <HBarValue>{days}d</HBarValue>
                </HBarItem>
              );
            })}

            <LegendRow>
              <LegendItem><LegendDot $color={T.success} /> Postmortem done</LegendItem>
              <LegendItem><LegendDot $color={T.warning} /> Awaiting PM</LegendItem>
              <LegendItem><LegendDot $color={T.danger} /> No PM requested</LegendItem>
              <LegendItem><LegendDot $color={T.info} /> Dispatched</LegendItem>
              <LegendItem><LegendDot $color={T.teal} /> Released</LegendItem>
            </LegendRow>
          </ChartBody>
        </ChartCard>

        {/* ─── Panel 2: Disposition Status ──────────────────────────────── */}
        <ChartCard>
          <ChartHeader>
            <ChartTitle><Truck size={15} /> Disposition Status</ChartTitle>
            <ChartSub>{total} total</ChartSub>
          </ChartHeader>
          <ChartBody>
            <MetricRow>
              <MetricBox>
                <MetricValue>{dispatched + spaced + released}</MetricValue>
                <MetricLabel>Processed</MetricLabel>
              </MetricBox>
              <MetricBox>
                <MetricValue style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ArrowUp size={14} /> {total > 0 ? Math.round(((dispatched + spaced + released) / total) * 100) : 0}%
                </MetricValue>
                <MetricChange $up={true}>Completion rate</MetricChange>
              </MetricBox>
            </MetricRow>

            {dispositionData.map((item, i) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
                <div style={{ width: 70, fontSize: '0.75rem', color: T.textSecondary, textAlign: 'right', flexShrink: 0 }}>{item.label}</div>
                <div style={{ flex: 1, height: '22px', background: T.borderLight, borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '5px', background: item.color, width: `${(item.count / maxDisposition) * 100}%`, animation: `${barGrow} 0.5s ease-out ${i * 0.1}s backwards`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem', minWidth: item.count > 0 ? '24px' : '0' }}>
                    {item.count > 0 && <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'white' }}>{item.count}</span>}
                  </div>
                </div>
              </div>
            ))}
          </ChartBody>
        </ChartCard>

        {/* ─── Panel 3: Postmortem Completion ─────────────────────────────── */}
        <ChartCard>
          <ChartHeader>
            <ChartTitle><FlaskConical size={15} /> Postmortem Status</ChartTitle>
            <ChartSub>{pmRequested} requested</ChartSub>
          </ChartHeader>
          <ChartBody>
            <MetricRow>
              <MetricBox>
                <MetricValue>{pmRequested > 0 ? Math.round((pmDone / pmRequested) * 100) : 0}%</MetricValue>
                <MetricLabel>Completion rate</MetricLabel>
              </MetricBox>
              <MetricBox>
                <MetricValue style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ArrowUp size={14} /> {pmRequested - pmDone} pending
                </MetricValue>
                <MetricChange $up={(pmRequested - pmDone) <= 2}>Needs attention</MetricChange>
              </MetricBox>
            </MetricRow>

            {pmData.map((item, i) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
                <div style={{ width: 90, fontSize: '0.75rem', color: T.textSecondary, display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: 'flex-end', flexShrink: 0 }}>
                  <StatusDot $color={item.color} />
                  {item.label}
                </div>
                <div style={{ flex: 1, height: '22px', background: T.borderLight, borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '5px', background: item.color, width: `${maxPm > 0 ? (item.count / maxPm) * 100 : 0}%`, animation: `${barGrow} 0.5s ease-out ${i * 0.1}s backwards`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem', minWidth: item.count > 0 ? '24px' : '0' }}>
                    {item.count > 0 && <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'white' }}>{item.count}</span>}
                  </div>
                </div>
              </div>
            ))}

            {/* Pending list */}
            {pmRequested - pmDone > 0 && (
              <div style={{ marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: `1px solid ${T.borderLight}` }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                  Awaiting Postmortem
                </div>
                {data.filter(d => d.postmortem_requested && !d.postmortem_done).map(d => (
                  <div key={d.deceased_id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0', marginBottom: '0.375rem', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.12s ease', background: 'transparent', ':hover': { background: T.surfaceHover } }} onClick={() => openDrawer(d)}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: getAvatarColor(d.full_name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, flexShrink: 0 }}>
                      {getInitials(d.full_name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 500, color: T.textBody, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.full_name}</div>
                      <div style={{ fontSize: '0.625rem', color: T.textMuted }}>{getDays(d.date_admitted)}d in mortuary</div>
                    </div>
                    <ChevronRight size={14} color={T.textFaint} style={{ flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            )}
          </ChartBody>
        </ChartCard>
      </ChartGrid>

      {/* ─── Drawer ────────────────────────────────────────────────────── */}
      {drawerOpen && selectedRecord && (
        <>
          <Overlay onClick={closeDrawer} />
          <Drawer>
            <DrawerHeader>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: getAvatarColor(selectedRecord.full_name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                    {getInitials(selectedRecord.full_name)}
                  </div>
                  <DrawerTitle>{selectedRecord.full_name}</DrawerTitle>
                </div>
                <DrawerId>{selectedRecord.deceased_id}</DrawerId>
              </div>
              <DrawerClose onClick={closeDrawer}><X size={16} /></DrawerClose>
            </DrawerHeader>

            <DrawerBody>
              {/* Quick Status Row */}
              <DrawerSection>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  <StatusPill $type={getPostmortemStatus(selectedRecord).type}>
                    <FlaskConical size={10} /> {getPostmortemStatus(selectedRecord).label}
                  </StatusPill>
                  {selectedRecord.dispatched && <StatusPill $type="dispatched"><Truck size={10} /> Dispatched</StatusPill>}
                  {selectedRecord.spaced && <StatusPill $type="spaced"><MapPin size={10} /> Spaced</StatusPill>}
                  <StatusPill $type={selectedRecord.status as any}><Clock size={10} /> {selectedRecord.status}</StatusPill>
                  <StatusPill $type={selectedRecord.body_status === 'Preserved' ? 'done' : selectedRecord.body_status === 'Dispatched' ? 'dispatched' : selectedRecord.body_status === 'Cremated' ? 'released' : 'pending'}>
                    <Activity size={10} /> {selectedRecord.body_status || 'Admitted'}
                  </StatusPill>
                </div>
              </DrawerSection>

              {/* Personal Details */}
              <DrawerSection>
                <SectionTitle>Personal Information</SectionTitle>
                <FieldGrid>
                  <FieldCard><FieldLabel>Full Name</FieldLabel><FieldValue>{selectedRecord.full_name}</FieldValue></FieldCard>
                  <FieldCard><FieldLabel>Age / Gender</FieldLabel><FieldValue>{selectedRecord.age}yr {selectedRecord.gender}</FieldValue></FieldCard>
                  <FieldCard><FieldLabel>Date of Death</FieldLabel><FieldValue>{fmtDate(selectedRecord.date_of_death)}</FieldValue></FieldCard>
                  <FieldCard><FieldLabel>Date Admitted</FieldLabel><FieldValue>{fmtDate(selectedRecord.date_admitted)}</FieldValue></FieldCard>
                  <FieldCard><FieldLabel>Days in Mortuary</FieldLabel><FieldValue>{getDays(selectedRecord.date_admitted)} days</FieldValue></FieldCard>
                  <FieldCard><FieldLabel>Burial Type</FieldLabel><FieldValue>{selectedRecord.burial_type || '—'}</FieldValue></FieldCard>
                  <FieldCard><FieldLabel>ID Number</FieldLabel><FieldValue>{selectedRecord.id_number || '—'}</FieldValue></FieldCard>
                  <FieldCard $highlight><FieldLabel>Cause of Death</FieldLabel><FieldValue>{selectedRecord.cause_of_death || '—'}</FieldValue></FieldCard>
                </FieldGrid>
              </DrawerSection>

              {/* Postmortem Details */}
              <DrawerSection>
                <SectionTitle>Postmortem Details</SectionTitle>
                <FieldGrid>
                  <FieldCard><FieldLabel>Requested</FieldLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <StatusDot $color={selectedRecord.postmortem_requested ? T.success : T.danger} />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: selectedRecord.postmortem_requested ? T.success : T.danger }}>
                        {selectedRecord.postmortem_requested ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </FieldCard>
                  <FieldCard><FieldLabel>Completed</FieldLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <StatusDot $color={selectedRecord.postmortem_done ? T.success : T.danger} />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: selectedRecord.postmortem_done ? T.success : T.danger }}>
                        {selectedRecord.postmortem_done ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </FieldCard>
                  <FieldCard><FieldLabel>PM Date</FieldLabel><FieldValue>{selectedRecord.postmortem_date ? fmtDate(selectedRecord.postmortem_date) : '—'}</FieldValue></FieldCard>
                  <FieldCard><FieldLabel>Pathologist</FieldLabel><FieldValue>{selectedRecord.pathologist_name || '—'}</FieldValue></FieldCard>
                  <FieldCard $highlight><FieldLabel>Requesting Authority</FieldLabel><FieldValue>{selectedRecord.requesting_authority || '—'}</FieldValue></FieldCard>
                </FieldGrid>
              </DrawerSection>

              {/* Dispatch & Spacing */}
              <DrawerSection>
                <SectionTitle>Dispatch & Spacing</SectionTitle>
                <FieldGrid>
                  <FieldCard><FieldLabel>Dispatched</FieldLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <StatusDot $color={selectedRecord.dispatched ? T.info : T.danger} />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: selectedRecord.dispatched ? T.info : T.danger }}>
                        {selectedRecord.dispatched ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </FieldCard>
                  <FieldCard><FieldLabel>Dispatch Date</FieldLabel><FieldValue>{selectedRecord.dispatched_date ? fmtDate(selectedRecord.dispatched_date) : '—'}</FieldValue></FieldCard>
                  <FieldCard><FieldLabel>Spaced</FieldLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <StatusDot $color={selectedRecord.spaced ? T.purple : T.danger} />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: selectedRecord.spaced ? T.purple : T.danger }}>
                        {selectedRecord.spaced ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </FieldCard>
                  <FieldCard><FieldLabel>Spaced Date</FieldLabel><FieldValue>{selectedRecord.spaced_date ? fmtDate(selectedRecord.spaced_date) : '—'}</FieldValue></FieldCard>
                </FieldGrid>
              </DrawerSection>

              {/* Charges */}
              <DrawerSection>
                <SectionTitle>Charges</SectionTitle>
                <FieldCard $highlight>
                  <FieldLabel>Total Charges</FieldLabel>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: T.text }}>
                    {fmtMoney(selectedRecord.total_charges)} {selectedRecord.currency || 'KES'}
                  </div>
                </FieldCard>
              </DrawerSection>

              {/* Timeline */}
              <DrawerSection>
                <SectionTitle>Event Timeline</SectionTitle>
                <Timeline>
                  <TimelineLine />
                  {[
                    { label: 'Date of Death', desc: fmtDate(selectedRecord.date_of_death), time: selectedRecord.date_of_death, done: true, color: T.danger },
                    { label: 'Admitted to Mortuary', desc: fmtDate(selectedRecord.date_admitted), time: selectedRecord.date_admitted, done: true, color: T.warning },
                    ...(selectedRecord.postmortem_requested ? [{ label: 'Postmortem Requested', desc: 'By ' + (selectedRecord.requesting_authority || 'Authority'), time: selectedRecord.postmortem_done ? selectedRecord.postmortem_date : 'Pending', done: selectedRecord.postmortem_done, color: T.primary }] : []),
                    ...(selectedRecord.postmortem_done ? [{ label: 'Postmortem Completed', desc: 'By ' + (selectedRecord.pathologist_name || 'Pathologist'), time: selectedRecord.postmortem_date, done: true, color: T.success }] : []),
                    ...(selectedRecord.dispatched ? [{ label: 'Body Dispatched', desc: 'To burial/cremation site', time: selectedRecord.dispatched_date, done: true, color: T.info }] : []),
                    ...(selectedRecord.spaced ? [{ label: 'Body Spaced', desc: 'Preparation for disposition', time: selectedRecord.spaced_date, done: true, color: T.purple }] : []),
                    ...(selectedRecord.status === 'released' ? [{ label: 'Released', desc: 'To next of kin', time: '', done: true, color: T.teal }] : []),
                  ].filter(Boolean).map((evt, i) => (
                    <TimelineItem key={i}>
                      <TimelineDot $color={evt.color} $done={evt.done} />
                      <TimelineContent>
                        <TimelineTitle>{evt.label}</TimelineTitle>
                        <TimelineDesc>{evt.desc}</TimelineDesc>
                        {evt.time && <TimelineTime>{evt.time}</TimelineTime>}
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </DrawerSection>

              {/* Contact */}
              <DrawerSection>
                <SectionTitle>Next of Kin</SectionTitle>
                <div style={{ background: T.bg, borderRadius: '8px', border: `1px solid ${T.borderLight}`, padding: '0.5rem 0.75rem' }}>
                  {selectedRecord.next_of_kin_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0', borderBottom: `1px solid ${T.borderLight}` }}>
                      <div style={{ width: 26, height: 26, borderRadius: '6px', background: T.primaryBg, color: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={13} /></div>
                      <span style={{ fontSize: '0.8125rem', color: T.textBody }}>{selectedRecord.next_of_kin_name}</span>
                    </div>
                  )}
                  {selectedRecord.next_of_kin_phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0', borderBottom: `1px solid ${T.borderLight}` }}>
                      <div style={{ width: 26, height: 26, borderRadius: '6px', background: T.successBg, color: T.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={13} /></div>
                      <span style={{ fontSize: '0.8125rem', color: T.textBody }}>{selectedRecord.next_of_kin_phone}</span>
                    </div>
                  )}
                  {selectedRecord.next_of_kin_email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '6px', background: T.infoBg, color: T.info, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={13} /></div>
                      <span style={{ fontSize: '0.8125rem', color: T.textBody }}>{selectedRecord.next_of_kin_email}</span>
                    </div>
                  )}
                  {selectedRecord.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '6px', background: T.warningBg, color: T.warning, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={13} /></div>
                      <span style={{ fontSize: '0.8125rem', color: T.textBody }}>{selectedRecord.address}</span>
                    </div>
                  )}
                  {!(selectedRecord.next_of_kin_name || selectedRecord.next_of_kin_phone || selectedRecord.next_of_kin_email || selectedRecord.address) && (
                    <div style={{ padding: '0.75rem 0', textAlign: 'center', color: T.textMuted, fontSize: '0.8125rem' }}>No contact on file</div>
                  )}
                </div>
              </DrawerSection>

              {/* Notes */}
              {selectedRecord.notes && (
                <DrawerSection>
                  <SectionTitle>Notes</SectionTitle>
                  <div style={{ padding: '0.625rem 0.75rem', background: T.warningBg, borderRadius: '7px', border: `1px solid ${T.warningBorder}` }}>
                    <div style={{ fontSize: '0.8125rem', color: T.textBody, lineHeight: '1.6' }}>{selectedRecord.notes}</div>
                  </div>
                </DrawerSection>
              )}
            </DrawerBody>

            <DrawerFooter>
              <DrawerBtn $primary onClick={() => { closeDrawer(); window.location.href = `/deceased/${selectedRecord.deceased_id}`; }}>
                <Eye size={14} /> View Full
              </DrawerBtn>
              <DrawerBtn onClick={() => { closeDrawer(); window.location.href = `/deceased/${selectedRecord.deceased_id}/edit`; }}>
                <Edit size={14} /> Edit
              </DrawerBtn>
            </DrawerFooter>
          </Drawer>
        </>
      )}
    </Page>
  );
};

export default DeceasedAnalytics;