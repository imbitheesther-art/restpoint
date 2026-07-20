import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styled, { keyframes, css } from 'styled-components';
import {
  FlaskConical, Clock, Calendar, Users, TrendingUp, AlertTriangle,
  ArrowUp, ArrowDown, RefreshCw, Filter, Download, Beaker,
  Activity, ChevronRight, Zap, RotateCw, Package, BarChart3
} from '../../utils/icons/icons';

const API_GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_GATEWAY_URL}`;

// ═══════════════════════════════════════════════════════════════════════════
//  TOKENS
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
  primaryLight: '#93C5FD',
  success: '#059669',
  successBg: '#ECFDF5',
  successLight: '#6EE7B7',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  warningLight: '#FCD34D',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  dangerLight: '#FCA5A5',
  purple: '#7C3AED',
  purpleBg: '#F5F3FF',
  purpleLight: '#C4B5FD',
  cyan: '#0891B2',
  cyanBg: '#ECFEFF',
  cyanLight: '#67E8F9',
  orange: '#EA580C',
  orangeBg: '#FFF7ED',
  orangeLight: '#FDBA74',
  pink: '#DB2777',
  pinkBg: '#FDF2F8',
  pinkLight: '#F9A8D4',
  teal: '#0D9488',
  tealBg: '#F0FDFA',
  tealLight: '#5EEAD4',
  chartColors: ['#2563EB', '#7C3AED', '#0891B2', '#059669', '#D97706', '#DC2626', '#DB2777', '#EA580C'],
};

// ═══════════════════════════════════════════════════════════════════════════
//  ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const countUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`;

const progressFill = keyframes`
  from { width: 0%; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

// ═══════════════════════════════════════════════════════════════════════════
//  MOCK DATA (replace with API)
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_USAGE_DISTRIBUTION = [
  { name: 'Formaldehyde', percentage: 32, volume: '48L', color: T.chartColors[0] },
  { name: 'Disinfectant', percentage: 24, volume: '36L', color: T.chartColors[1] },
  { name: 'Embalming Fluid', percentage: 18, volume: '27L', color: T.chartColors[2] },
  { name: 'Preservative', percentage: 14, volume: '21L', color: T.chartColors[3] },
  { name: 'Cleaning Agents', percentage: 8, volume: '12L', color: T.chartColors[4] },
  { name: 'Others', percentage: 4, volume: '6L', color: T.chartColors[5] },
];

const MOCK_GOALS = [
  { label: 'Restock Threshold', current: 78, target: 100, unit: '%', color: T.primary, lightColor: T.primaryLight, bgColor: T.primaryBg },
  { label: 'Usage Efficiency', current: 88, target: 100, unit: '%', color: T.success, lightColor: T.successLight, bgColor: T.successBg },
  { label: 'Pickup Compliance', current: 65, target: 100, unit: '%', color: T.warning, lightColor: T.warningLight, bgColor: T.warningBg },
  { label: 'Waste Reduction', current: 42, target: 100, unit: '%', color: T.purple, lightColor: T.purpleLight, bgColor: T.purpleBg },
];

const MOCK_ACTIVITY = [
  {
    id: 1, person: 'Dr. Ochieng', chemical: 'Formaldehyde (5L)', action: 'Picked up',
    time: '2 hours ago', date: new Date(), daysSinceLast: 4, avgInterval: 3.5,
    avatarColor: T.chartColors[0], type: 'pickup' as const,
  },
  {
    id: 2, person: 'Mary Wambui', chemical: 'Disinfectant (10L)', action: 'Picked up',
    time: '5 hours ago', date: new Date(Date.now() - 18000000), daysSinceLast: 7, avgInterval: 6.2,
    avatarColor: T.chartColors[1], type: 'pickup' as const,
  },
  {
    id: 3, person: 'James Mwangi', chemical: 'Embalming Fluid (3L)', action: 'Picked up',
    time: '1 day ago', date: new Date(Date.now() - 86400000), daysSinceLast: 12, avgInterval: 10.0,
    avatarColor: T.chartColors[2], type: 'pickup' as const,
  },
  {
    id: 4, person: 'Dr. Akinyi', chemical: 'Preservative (2L)', action: 'Picked up',
    time: '2 days ago', date: new Date(Date.now() - 172800000), daysSinceLast: 5, avgInterval: 4.8,
    avatarColor: T.chartColors[3], type: 'pickup' as const,
  },
  {
    id: 5, person: 'Peter Otieno', chemical: 'Formaldehyde (8L)', action: 'Picked up',
    time: '3 days ago', date: new Date(Date.now() - 259200000), daysSinceLast: 15, avgInterval: 14.0,
    avatarColor: T.chartColors[4], type: 'pickup' as const,
  },
  {
    id: 6, person: 'Grace Njeri', chemical: 'Disinfectant (5L)', action: 'Picked up',
    time: '4 days ago', date: new Date(Date.now() - 345600000), daysSinceLast: 3, avgInterval: 3.2,
    avatarColor: T.chartColors[5], type: 'pickup' as const,
  },
  {
    id: 7, person: 'Samuel Karanja', chemical: 'Cleaning Agents (15L)', action: 'Picked up',
    time: '5 days ago', date: new Date(Date.now() - 432000000), daysSinceLast: 21, avgInterval: 18.5,
    avatarColor: T.chartColors[6], type: 'pickup' as const,
  },
];

const MOCK_PICKUP_FREQUENCY = [
  { range: '0-3 days', count: 12, percentage: 35, color: T.success },
  { range: '4-7 days', count: 10, percentage: 29, color: T.primary },
  { range: '8-14 days', count: 7, percentage: 21, color: T.warning },
  { range: '15+ days', count: 5, percentage: 15, color: T.danger },
];

const MOCK_STAFF_ANALYSIS = [
  { name: 'Dr. Ochieng', pickups: 24, avgDays: 3.5, avgVolume: '5.2L', trend: 'down' as const, color: T.chartColors[0] },
  { name: 'Mary Wambui', pickups: 18, avgDays: 6.2, avgVolume: '8.1L', trend: 'up' as const, color: T.chartColors[1] },
  { name: 'James Mwangi', pickups: 12, avgDays: 10.0, avgVolume: '4.8L', trend: 'down' as const, color: T.chartColors[2] },
  { name: 'Dr. Akinyi', pickups: 20, avgDays: 4.8, avgVolume: '3.5L', trend: 'up' as const, color: T.chartColors[3] },
  { name: 'Peter Otieno', pickups: 8, avgDays: 14.0, avgVolume: '9.3L', trend: 'down' as const, color: T.chartColors[4] },
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
  max-width: 1400px;
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

const TitleGroup = styled.div``;

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${T.text};
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

  &:hover { background: ${T.surfaceHover}; border-color: ${T.textMuted}; }

  ${props => props.$variant === 'primary' && css`
    background: ${T.primary}; color: white; border-color: ${T.primary};
    &:hover { background: #1D4ED8; box-shadow: 0 1px 3px rgba(37,99,235,0.3); }
  `}
`;

// ─── Stat Cards ────────────────────────────────────────────────────────────

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.875rem;
  margin-bottom: 1.25rem;
  animation: ${fadeIn} 0.25s ease-out;

  @media (max-width: 1100px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const StatCard = styled.div`
  background: ${T.surface};
  border: 1px solid ${T.border};
  border-radius: 10px;
  padding: 1rem 1.125rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.15s ease;
  animation: ${fadeIn} 0.3s ease-out;

  &:hover {
    border-color: ${T.textMuted};
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transform: translateY(-1px);
  }
`;

const StatInfo = styled.div``;

const StatLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 500;
  color: ${T.textSecondary};
  margin-bottom: 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
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
  margin-top: 0.375rem;
  color: ${props => props.$up ? T.success : T.danger};
`;

const StatIcon = styled.div<{ $color: string; $bg: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$bg};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

// ─── Chart Grid ────────────────────────────────────────────────────────────

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
  margin-bottom: 1.25rem;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const ChartCard = styled.div`
  background: ${T.surface};
  border: 1px solid ${T.border};
  border-radius: 10px;
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ChartCardHeader = styled.div`
  padding: 0.875rem 1.125rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${T.borderLight};
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

const ChartSubtitle = styled.span`
  font-size: 0.6875rem;
  color: ${T.textMuted};
  font-weight: 500;
`;

const ChartBody = styled.div`
  padding: 1.125rem;
`;

// ─── Donut Chart (SVG) ──────────────────────────────────────────────────────

const DonutWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const DonutSvg = styled.svg`
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.04));
`;

const DonutCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`;

const DonutTotal = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${T.text};
  line-height: 1;
`;

const DonutTotalLabel = styled.div`
  font-size: 0.625rem;
  color: ${T.textMuted};
  margin-top: 0.125rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const LegendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
`;

const LegendDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: ${props => props.$color};
  flex-shrink: 0;
`;

const LegendName = styled.div`
  flex: 1;
  font-size: 0.75rem;
  color: ${T.textBody};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const LegendValue = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${T.text};
  white-space: nowrap;
`;

const LegendPct = styled.div`
  font-size: 0.6875rem;
  color: ${T.textMuted};
  width: 32px;
  text-align: right;
`;

// ─── Progress Bars (Goals) ─────────────────────────────────────────────────

const GoalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const GoalItem = styled.div``;

const GoalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.375rem;
`;

const GoalLabel = styled.div`
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${T.textBody};
`;

const GoalValue = styled.div`
  font-size: 0.8125rem;
  font-weight: 700;
  color: ${T.text};
`;

const ProgressBarBg = styled.div`
  height: 8px;
  background: ${T.borderLight};
  border-radius: 10px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ $color: string; $width: number }>`
  height: 100%;
  border-radius: 10px;
  background: ${props => props.$color};
  width: ${props => props.$width}%;
  animation: ${progressFill} 0.8s ease-out;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3));
    border-radius: 0 10px 10px 0;
  }
`;

// ─── Frequency Chart (Horizontal Bars) ──────────────────────────────────────

const FreqItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  &:last-child { margin-bottom: 0; }
`;

const FreqLabel = styled.div`
  width: 70px;
  font-size: 0.75rem;
  color: ${T.textSecondary};
  text-align: right;
  flex-shrink: 0;
`;

const FreqBarBg = styled.div`
  flex: 1;
  height: 28px;
  background: ${T.borderLight};
  border-radius: 6px;
  overflow: hidden;
  position: relative;
`;

const FreqBarFill = styled.div<{ $color: string; $width: number }>`
  height: 100%;
  border-radius: 6px;
  background: ${props => props.$color};
  width: ${props => props.$width}%;
  animation: ${progressFill} 0.6s ease-out;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.5rem;
  min-width: fit-content;
  transition: width 0.3s ease;
`;

const FreqBarLabel = styled.span`
  font-size: 0.6875rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
`;

const FreqCount = styled.div`
  width: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${T.text};
  flex-shrink: 0;
`;

// ─── Activity Feed ──────────────────────────────────────────────────────────

const ActivityFeed = styled.div`
  display: flex;
  flex-direction: column;
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${T.borderLight};
  animation: ${slideIn} 0.25s ease-out;

  &:last-child { border-bottom: none; }
`;

const ActivityAvatar = styled.div<{ $color: string }>`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const ActivityPerson = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${T.text};
`;

const ActivityTime = styled.span`
  font-size: 0.6875rem;
  color: ${T.textMuted};
  white-space: nowrap;
`;

const ActivityDesc = styled.div`
  font-size: 0.75rem;
  color: ${T.textSecondary};
  margin-top: 0.0625rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActivityMeta = styled.div`
  display: flex;
  gap: 0.375rem;
  margin-top: 0.375rem;
  flex-wrap: wrap;
`;

const MetaTag = styled.span<{ $type: 'info' | 'warn' | 'success' | 'danger' }>`
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.4375rem;
  border-radius: 4px;

  ${props => {
    const map = {
      info: { bg: T.primaryBg, color: T.primary },
      warn: { bg: T.warningBg, color: T.warning },
      success: { bg: T.successBg, color: T.success },
      danger: { bg: T.dangerBg, color: T.danger },
    };
    const s = map[props.$type];
    return css`background: ${s.bg}; color: ${s.color};`;
  }}
`;

// ─── Staff Analysis Table ───────────────────────────────────────────────────

const StaffTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StaffTH = styled.th`
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${T.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid ${T.border};
`;

const StaffTR = styled.tr`
  border-bottom: 1px solid ${T.borderLight};
  transition: background 0.1s ease;

  &:last-child { border-bottom: none; }
  &:hover { background: ${T.surfaceHover}; }
`;

const StaffTD = styled.td`
  padding: 0.625rem 0.75rem;
  font-size: 0.8125rem;
  color: ${T.textBody};
  vertical-align: middle;
`;

const StaffNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StaffAvatar = styled.div<{ $color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const TrendBadge = styled.span<{ $up: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${props => props.$up ? T.success : T.danger};
`;

// ─── Full Width Card ────────────────────────────────────────────────────────

const FullCard = styled.div`
  background: ${T.surface};
  border: 1px solid ${T.border};
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1.25rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

// ─── Feedback Button ─────────────────────────────────────────────────────────

const FeedbackBtn = styled.button`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  background: ${T.primary};
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: all 0.15s ease;
  z-index: 50;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
  }
`;

// ─── Loading ───────────────────────────────────────────────────────────────

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

const getInitials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();

const getDaysLabel = (days: number) => {
  if (days <= 3) return { text: `${days}d gap`, type: 'success' as const };
  if (days <= 7) return { text: `${days}d gap`, type: 'info' as const };
  if (days <= 14) return { text: `${days}d gap`, type: 'warn' as const };
  return { text: `${days}d gap`, type: 'danger' as const };
};

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ChemicalInventoryAnalytics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');

  // Replace these with real API calls
  // const fetchAnalytics = useCallback(async () => { ... }, []);
  // useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // Using mock data for now — swap with API response
  const usageData = MOCK_USAGE_DISTRIBUTION;
  const goalsData = MOCK_GOALS;
  const activityData = MOCK_ACTIVITY;
  const frequencyData = MOCK_PICKUP_FREQUENCY;
  const staffData = MOCK_STAFF_ANALYSIS;

  // ─── Donut Chart Calculations ──────────────────────────────────────────
  const totalVolume = usageData.reduce((sum, d) => sum + parseInt(d.volume), 0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = -90; // Start at top

  const donutSlices = usageData.map((item) => {
    const angle = (item.percentage / 100) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const largeArc = angle > 180 ? 1 : 0;

    const x1 = 90 + radius * Math.cos(startRad);
    const y1 = 90 + radius * Math.sin(startRad);
    const x2 = 90 + radius * Math.cos(endRad);
    const y2 = 90 + radius * Math.sin(endRad);

    const d = angle >= 360
      ? ''
      : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

    return { ...item, d, startAngle, endAngle };
  });

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
        <TitleGroup>
          <PageTitle><FlaskConical size={22} /> Chemical Inventory Analytics</PageTitle>
          <PageDesc>Track usage, pickup patterns, and staff chemical inventory behavior</PageDesc>
        </TitleGroup>
        <HeaderActions>
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            style={{
              padding: '0.4375rem 1.75rem 0.4375rem 0.625rem',
              border: `1px solid ${T.border}`,
              borderRadius: '6px',
              fontSize: '0.8125rem',
              color: T.textBody,
              background: T.surface,
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last 1 year</option>
          </select>
          <Btn><Download size={14} /> Export</Btn>
          <Btn onClick={() => window.location.reload()}><RefreshCw size={14} /> Refresh</Btn>
        </HeaderActions>
      </PageHeader>

      {/* ─── Stat Cards ──────────────────────────────────────────────── */}
      <StatsGrid>
        <StatCard>
          <StatInfo>
            <StatLabel>Total Usage</StatLabel>
            <StatValue>{totalVolume}L</StatValue>
            <StatChange $up={true}>
              <ArrowUp size={12} /> 12% vs last period
            </StatChange>
          </StatInfo>
          <StatIcon $color={T.primary} $bg={T.primaryBg}><Beaker size={18} /></StatIcon>
        </StatCard>

        <StatCard>
          <StatInfo>
            <StatLabel>Total Pickups</StatLabel>
            <StatValue>{activityData.length + 28}</StatValue>
            <StatChange $up={true}>
              <ArrowUp size={12} /> 8% vs last period
            </StatChange>
          </StatInfo>
          <StatIcon $color={T.purple} $bg={T.purpleBg}><Package size={18} /></StatIcon>
        </StatCard>

        <StatCard>
          <StatInfo>
            <StatLabel>Avg. Interval</StatLabel>
            <StatValue>5.2d</StatValue>
            <StatChange $up={false}>
              <ArrowDown size={12} /> 0.8d longer
            </StatChange>
          </StatInfo>
          <StatIcon $color={T.warning} $bg={T.warningBg}><Clock size={18} /></StatIcon>
        </StatCard>

        <StatCard>
          <StatInfo>
            <StatLabel>Low Stock Alerts</StatLabel>
            <StatValue>3</StatValue>
            <StatChange $up={false}>
              <AlertTriangle size={12} /> Needs attention
            </StatChange>
          </StatInfo>
          <StatIcon $color={T.danger} $bg={T.dangerBg}><AlertTriangle size={18} /></StatIcon>
        </StatCard>
      </StatsGrid>

      {/* ─── Charts Row 1: Donut + Goals ─────────────────────────────── */}
      <ChartGrid>
        {/* Donut Chart */}
        <ChartCard>
          <ChartCardHeader>
            <ChartTitle>
              <FlaskConical size={15} /> Usage Distribution
            </ChartTitle>
            <ChartSubtitle>{totalVolume}L total</ChartSubtitle>
          </ChartCardHeader>
          <ChartBody>
            <DonutWrap>
              <div style={{ position: 'relative' }}>
                <DonutSvg width="180" height="180" viewBox="0 0 180 180">
                  {donutSlices.map((slice, i) => (
                    <path
                      key={i}
                      d={slice.d}
                      fill="none"
                      stroke={slice.color}
                      strokeWidth="28"
                      strokeLinecap="butt"
                    />
                  ))}
                </DonutSvg>
                <DonutCenter>
                  <DonutTotal>{totalVolume}L</DonutTotal>
                  <DonutTotalLabel>Total Used</DonutTotalLabel>
                </DonutCenter>
              </div>
              <LegendList>
                {usageData.map((item, i) => (
                  <LegendItem key={i}>
                    <LegendDot $color={item.color} />
                    <LegendName>{item.name}</LegendName>
                    <LegendValue>{item.volume}</LegendValue>
                    <LegendPct>{item.percentage}%</LegendPct>
                  </LegendItem>
                ))}
              </LegendList>
            </DonutWrap>
          </ChartBody>
        </ChartCard>

        {/* Goals / Progress */}
        <ChartCard>
          <ChartCardHeader>
            <ChartTitle>
              <Target size={15} /> Inventory Goals
            </ChartTitle>
            <ChartSubtitle>This period</ChartSubtitle>
          </ChartCardHeader>
          <ChartBody>
            <GoalList>
              {goalsData.map((goal, i) => (
                <GoalItem key={i}>
                  <GoalHeader>
                    <GoalLabel>{goal.label}</GoalLabel>
                    <GoalValue>{goal.current}{goal.unit}</GoalValue>
                  </GoalHeader>
                  <ProgressBarBg>
                    <ProgressBarFill $color={goal.color} $width={goal.current} />
                  </ProgressBarBg>
                </GoalItem>
              ))}
            </GoalList>
          </ChartBody>
        </ChartCard>
      </ChartGrid>

      {/* ─── Charts Row 2: Frequency + Activity ──────────────────────── */}
      <ChartGrid>
        {/* Pickup Frequency */}
        <ChartCard>
          <ChartCardHeader>
            <ChartTitle>
              <RotateCw size={15} /> Pickup Frequency
            </ChartTitle>
            <ChartSubtitle>Days between pickups</ChartSubtitle>
          </ChartCardHeader>
          <ChartBody>
            {frequencyData.map((item, i) => (
              <FreqItem key={i}>
                <FreqLabel>{item.range}</FreqLabel>
                <FreqBarBg>
                  <FreqBarFill $color={item.color} $width={item.percentage}>
                    {item.percentage > 15 && <FreqBarLabel>{item.percentage}%</FreqBarLabel>}
                  </FreqBarFill>
                </FreqBarBg>
                <FreqCount>{item.count}</FreqCount>
              </FreqItem>
            ))}
          </ChartBody>
        </ChartCard>

        {/* Recent Activity */}
        <ChartCard>
          <ChartCardHeader>
            <ChartTitle>
              <Activity size={15} /> Recent Pickups
            </ChartTitle>
            <ChartSubtitle>Last 7 days</ChartSubtitle>
          </ChartCardHeader>
          <ChartBody style={{ padding: '0.625rem 1.125rem' }}>
            <ActivityFeed>
              {activityData.slice(0, 5).map((item) => {
                const gapInfo = getDaysLabel(item.daysSinceLast);
                return (
                  <ActivityItem key={item.id}>
                    <ActivityAvatar $color={item.avatarColor}>
                      {getInitials(item.person)}
                    </ActivityAvatar>
                    <ActivityContent>
                      <ActivityTop>
                        <ActivityPerson>{item.person}</ActivityPerson>
                        <ActivityTime>{item.time}</ActivityTime>
                      </ActivityTop>
                      <ActivityDesc>{item.chemical} — {item.action}</ActivityDesc>
                      <ActivityMeta>
                        <MetaTag $type={gapInfo.type}>
                          <Clock size={9} /> {gapInfo.text}
                        </MetaTag>
                        <MetaTag $type="info">
                          <Zap size={9} /> Avg {item.avgInterval}d
                        </MetaTag>
                      </ActivityMeta>
                    </ActivityContent>
                  </ActivityItem>
                );
              })}
            </ActivityFeed>
          </ChartBody>
        </ChartCard>
      </ChartGrid>

      {/* ─── Staff Analysis Table ─────────────────────────────────────── */}
      <FullCard>
        <ChartCardHeader>
          <ChartTitle>
            <Users size={15} /> Staff Pickup Analysis
          </ChartTitle>
          <ChartSubtitle>Who picks what and how often</ChartSubtitle>
        </ChartCardHeader>
        <div style={{ overflowX: 'auto' }}>
          <StaffTable>
            <thead>
              <tr>
                <StaffTH>Staff Member</StaffTH>
                <StaffTH>Total Pickups</StaffTH>
                <StaffTH>Avg. Interval</StaffTH>
                <StaffTH>Avg. Volume</StaffTH>
                <StaffTH>Freq. Trend</StaffTH>
              </tr>
            </thead>
            <tbody>
              {staffData.map((staff, i) => (
                <StaffTR key={i}>
                  <StaffTD>
                    <StaffNameCell>
                      <StaffAvatar $color={staff.color}>{getInitials(staff.name)}</StaffAvatar>
                      <span style={{ fontWeight: 500 }}>{staff.name}</span>
                    </StaffNameCell>
                  </StaffTD>
                  <StaffTD style={{ fontWeight: 600 }}>{staff.pickups}</StaffTD>
                  <StaffTD>
                    <MetaTag $type={getDaysLabel(staff.avgDays).type}>
                      {staff.avgDays} days
                    </MetaTag>
                  </StaffTD>
                  <StaffTD>{staff.avgVolume}/pickup</StaffTD>
                  <StaffTD>
                    <TrendBadge $up={staff.trend === 'up'}>
                      {staff.trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {staff.trend === 'up' ? 'More frequent' : 'Less frequent'}
                    </TrendBadge>
                  </StaffTD>
                </StaffTR>
              ))}
            </tbody>
          </StaffTable>
        </div>
      </FullCard>

      {/* ─── Feedback Button ──────────────────────────────────────────── */}
      <FeedbackBtn>
        <MessageSquare size={15} /> Feedback
      </FeedbackBtn>
    </Page>
  );
};


export default ChemicalInventoryAnalytics;