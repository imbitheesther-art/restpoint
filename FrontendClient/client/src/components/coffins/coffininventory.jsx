import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
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
  Diamond, CheckSquare, XSquare, Loader2
} from 'lucide-react';

// ─── Color Palette (Elegant Vintage) ───────────────────────────────────────
const Colors = {
  ink: '#15171A',
  bone: '#FAF8F4',
  bone2: '#F3EFE6',
  brass: '#8B7355',
  brassHover: '#A98F6E',
  brassLight: '#C4B89A',
  verdigris: '#3D4F47',
  verdigrisDark: '#2E3F37',
  line: '#E3DDD0',
  lineDark: '#2C2F33',
  gray: '#6B6862',
  grayLight: 'rgba(250,248,244,0.62)',
  red: '#9B4A3F',
  redBg: '#F7ECE9',
  redLine: '#E8D2CC',
  white: '#FFFFFF',
  success: '#475A43',
  successBg: '#EEF3EC',
  successLine: '#DCE6D9',
  shadow: 'rgba(21,23,26,0.12)',
  overlay: 'rgba(21,23,26,0.88)',
  textMuted: '#8B8882',
  darkGray: '#2C2F33',
  primaryDark: '#15171A',
  accentTeal: '#3D4F47',
  infoBlue: '#5B7B8A',
  dangerRed: '#9B4A3F',
  mediumGray: '#E3DDD0',
  lightGray: '#F3EFE6',
  successGreen: '#475A43',
  warningAmber: '#A68B5B',
  warningBg: '#F8F3E8',
  warningLine: '#EDE4D0',
};

// ─── Animations ────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideInFromTop = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ─── Styled Components ─────────────────────────────────────────────────────

const PageContainer = styled.div`
  background: ${Colors.bone};
  min-height: 100vh;
  padding: 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: ${Colors.gray};
  flex-wrap: wrap;

  a {
    color: ${Colors.brass};
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: color 0.2s;

    &:hover {
      color: ${Colors.brassHover};
    }
  }

  span {
    color: ${Colors.textMuted};
  }

  svg {
    width: 14px;
    height: 14px;
  }

  .separator {
    color: ${Colors.mediumGray};
  }
`;

const Card = styled.div`
  background: ${Colors.white};
  border-radius: 1.25rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid ${Colors.mediumGray};
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out;
  margin-bottom: 1.5rem;
`;

const CardHeader = styled.div`
  background: linear-gradient(135deg, ${Colors.ink} 0%, ${Colors.verdigrisDark} 100%);
  color: ${Colors.bone};
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  border-bottom: 1px solid ${Colors.lineDark};

  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  h4 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: 0.5px;
  }

  svg {
    color: ${Colors.brassLight};
    width: 24px;
    height: 24px;
  }

  @media (max-width: 576px) {
    h4 { font-size: 1.125rem; }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 0.25rem;
  background: rgba(255,255,255,0.1);
  padding: 0.25rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255,255,255,0.15);
`;

const ViewToggleButton = styled.button`
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: none;
  background: ${props => props.$active ? Colors.bone : 'transparent'};
  color: ${props => props.$active ? Colors.ink : Colors.bone};
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.$active ? Colors.bone : 'rgba(255,255,255,0.15)'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid ${Colors.mediumGray};
  background: ${Colors.white};
  color: ${Colors.darkGray};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 38px;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: ${Colors.brass};
  }

  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

  svg { width: 16px; height: 16px; }

  &.primary {
    background: linear-gradient(135deg, ${Colors.brass} 0%, ${Colors.brassHover} 100%);
    color: ${Colors.white};
    border-color: transparent;
    box-shadow: 0 4px 6px -1px rgba(139, 115, 85, 0.3);

    &:hover {
      box-shadow: 0 10px 20px -5px rgba(139, 115, 85, 0.4);
      border-color: transparent;
    }
  }

  &.danger {
    background: linear-gradient(135deg, ${Colors.red} 0%, #7A3A30 100%);
    color: white;
    border-color: transparent;

    &:hover {
      box-shadow: 0 10px 20px -5px rgba(155, 74, 63, 0.3);
      border-color: transparent;
    }
  }

  &.ghost {
    background: transparent;
    border-color: transparent;
    color: ${Colors.bone};

    &:hover {
      background: rgba(255,255,255,0.1);
      border-color: transparent;
      transform: none;
      box-shadow: none;
    }
  }

  &.sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
    min-height: 32px;

    svg { width: 14px; height: 14px; }
  }

  &.icon-only {
    padding: 0.5rem;
    min-height: 36px;
    min-width: 36px;
    justify-content: center;
  }

  @media (max-width: 576px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
    min-height: 34px;
    svg { width: 14px; height: 14px; }
  }
`;

const CardBody = styled.div`
  padding: 1.5rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 576px) {
    padding: 0.75rem;
  }
`;

// ─── Stats Cards ───────────────────────────────────────────────────────────

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
`;

const StatCard = styled.div`
  background: ${props => props.$bg || `linear-gradient(135deg, ${Colors.verdigris} 0%, ${Colors.verdigrisDark} 100%)`};
  border-radius: 1rem;
  padding: 1.25rem;
  color: ${Colors.bone};
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }

  @media (max-width: 576px) {
    padding: 0.875rem;
  }
`;

const StatIcon = styled.div`
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  backdrop-filter: blur(10px);

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 576px) {
    width: 36px;
    height: 36px;
    svg { width: 16px; height: 16px; }
  }
`;

const StatValue = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  line-height: 1.2;

  @media (max-width: 576px) {
    font-size: 1.25rem;
  }
`;

const StatLabel = styled.small`
  font-size: 0.8125rem;
  opacity: 0.9;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  display: block;
`;

// ─── Alert ─────────────────────────────────────────────────────────────────

const AlertBox = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 0.875rem;
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 0.5s ease-out;
  border-left: 4px solid ${Colors.red};
  background: ${Colors.redBg};
  color: ${Colors.red};

  svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  .alert-content {
    flex: 1;
    strong {
      display: block;
      margin-bottom: 0.25rem;
    }
    small {
      opacity: 0.85;
    }
  }

  .alert-close {
    background: none;
    border: none;
    color: ${Colors.red};
    cursor: pointer;
    padding: 0.25rem;
    opacity: 0.6;
    transition: opacity 0.2s;

    &:hover { opacity: 1; }
  }
`;

// ─── Search & Filters ──────────────────────────────────────────────────────

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 200px 200px;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const SearchWrapper = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${Colors.textMuted};
    width: 16px;
    height: 16px;
    pointer-events: none;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.75rem;
  border-radius: 0.75rem;
  border: 2px solid ${Colors.mediumGray};
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: ${Colors.white};
  color: ${Colors.ink};
  font-family: inherit;

  &:focus {
    border-color: ${Colors.brass};
    box-shadow: 0 0 0 4px rgba(139, 115, 85, 0.1);
    outline: none;
    transform: translateY(-1px);
  }

  &::placeholder {
    color: ${Colors.textMuted};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.625rem 1rem;
  border-radius: 0.75rem;
  border: 2px solid ${Colors.mediumGray};
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: ${Colors.white};
  color: ${Colors.ink};
  font-family: inherit;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6862' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;

  &:focus {
    border-color: ${Colors.brass};
    box-shadow: 0 0 0 4px rgba(139, 115, 85, 0.1);
    outline: none;
  }
`;

// ─── Table ─────────────────────────────────────────────────────────────────

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 0.875rem;
  border: 1px solid ${Colors.mediumGray};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;

  thead th {
    background: ${Colors.bone2};
    border-bottom: 2px solid ${Colors.mediumGray};
    padding: 0.875rem 1rem;
    font-weight: 700;
    color: ${Colors.ink};
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: left;
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tbody td {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid ${Colors.mediumGray};
    vertical-align: middle;
    color: ${Colors.darkGray};
    transition: background 0.2s ease;
  }

  tbody tr {
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      background: ${Colors.bone};
    }

    &:last-child td {
      border-bottom: none;
    }
  }

  @media (max-width: 768px) {
    font-size: 0.8125rem;
    thead th, tbody td { padding: 0.75rem; }
  }
`;

const ProductCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
`;

const ProductImage = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 0.625rem;
  overflow: hidden;
  border: 2px solid ${Colors.mediumGray};
  background: ${Colors.bone2};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    color: ${Colors.textMuted};
    width: 20px;
    height: 20px;
  }
`;

const ProductInfo = styled.div`
  h6 {
    font-size: 0.9375rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    color: ${Colors.ink};
    line-height: 1.3;
  }

  p {
    font-size: 0.75rem;
    color: ${Colors.textMuted};
    margin: 0;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const PriceBox = styled.div`
  white-space: nowrap;

  .old {
    font-size: 0.75rem;
    color: ${Colors.textMuted};
    text-decoration: line-through;
    display: block;
  }

  .new {
    font-weight: 700;
    color: ${Colors.red};
    font-size: 0.9375rem;
  }
`;

const StockBar = styled.div`
  width: 100px;
  height: 6px;
  background: ${Colors.mediumGray};
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.375rem;
`;

const StockFill = styled.div`
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${props =>
    props.$percentage > 50
      ? `linear-gradient(90deg, ${Colors.success}, #5A6E55)`
      : props.$percentage > 20
        ? `linear-gradient(90deg, ${Colors.warningAmber}, #C4A86A)`
        : `linear-gradient(90deg, ${Colors.red}, #B85A4F)`};
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;

  background: ${props =>
    props.$variant === 'danger' ? Colors.redBg :
      props.$variant === 'warning' ? Colors.warningBg :
        Colors.successBg};
  color: ${props =>
    props.$variant === 'danger' ? Colors.red :
      props.$variant === 'warning' ? Colors.warningAmber :
        Colors.success};

  border: 1px solid ${props =>
    props.$variant === 'danger' ? Colors.redLine :
      props.$variant === 'warning' ? Colors.warningLine :
        Colors.successLine};
`;

const ActionsCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 0.5rem;
  border: 1px solid ${Colors.mediumGray};
  background: ${Colors.white};
  color: ${Colors.darkGray};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  }

  svg { width: 16px; height: 16px; }

  &.view { &:hover { border-color: ${Colors.verdigris}; color: ${Colors.verdigris}; } }
  &.edit { &:hover { border-color: ${Colors.brass}; color: ${Colors.brass}; } }
  &.delete { &:hover { border-color: ${Colors.red}; color: ${Colors.red}; } }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none !important;
  }
`;

// ─── Grid View ─────────────────────────────────────────────────────────────

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const CoffinCard = styled.div`
  background: ${Colors.white};
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid ${Colors.mediumGray};
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.5s ease-out;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    border-color: ${Colors.brass};
  }
`;

const CoffinCardImage = styled.div`
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-bottom: 1px solid ${Colors.mediumGray};
  background: ${Colors.bone2};
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  ${CoffinCard}:hover & img {
    transform: scale(1.05);
  }

  svg {
    color: ${Colors.textMuted};
    width: 48px;
    height: 48px;
  }
`;

const CoffinCardBody = styled.div`
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CoffinCardTitle = styled.h5`
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: ${Colors.ink};
  line-height: 1.3;
`;

const CoffinCardText = styled.p`
  font-size: 0.8125rem;
  color: ${Colors.textMuted};
  margin: 0 0 0.375rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    color: ${Colors.brass};
  }
`;

const CoffinCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${Colors.mediumGray};
`;

// ─── Pagination ────────────────────────────────────────────────────────────

const PaginationRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0 0;
  margin-top: 1rem;
  border-top: 1px solid ${Colors.mediumGray};
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
`;

const PageInfo = styled.div`
  font-size: 0.875rem;
  color: ${Colors.textMuted};
`;

const PageButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  border: 1px solid ${props => props.$active ? Colors.brass : Colors.mediumGray};
  background: ${props => props.$active ? Colors.brass : Colors.white};
  color: ${props => props.$active ? Colors.white : Colors.darkGray};
  font-weight: ${props => props.$active ? '700' : '500'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${Colors.brass};
    background: ${props => props.$active ? Colors.brassHover : Colors.bone};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg { width: 16px; height: 16px; }
`;

// ─── Loading & Empty States ────────────────────────────────────────────────

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: ${Colors.brass};

  svg {
    animation: ${spin} 1s linear infinite;
    width: 32px;
    height: 32px;
  }

  p {
    margin-top: 1rem;
    font-size: 0.9375rem;
    color: ${Colors.textMuted};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;

  svg {
    width: 64px;
    height: 64px;
    color: ${Colors.mediumGray};
    margin-bottom: 1rem;
  }

  h5 {
    font-size: 1.125rem;
    font-weight: 700;
    color: ${Colors.ink};
    margin: 0 0 0.5rem 0;
  }

  p {
    font-size: 0.875rem;
    color: ${Colors.textMuted};
    margin: 0 0 1.5rem 0;
  }
`;

// ─── Toast ─────────────────────────────────────────────────────────────────

const ToastContainer = styled.div`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (max-width: 576px) {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
`;

const ToastItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.125rem;
  border-radius: 0.75rem;
  background: ${props => props.$type === 'success' ? Colors.success : Colors.red};
  color: ${Colors.white};
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  animation: ${slideInFromTop} 0.3s ease-out;
  font-size: 0.875rem;
  font-weight: 500;
  max-width: 360px;

  svg { width: 18px; height: 18px; flex-shrink: 0; }

  .toast-close {
    background: none;
    border: none;
    color: rgba(255,255,255,0.8);
    cursor: pointer;
    padding: 0.125rem;
    margin-left: auto;
    transition: color 0.2s;
    &:hover { color: white; }
  }

  @media (max-width: 576px) {
    max-width: 100%;
    font-size: 0.8125rem;
  }
`;

// ─── Modal ─────────────────────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${Colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease-out;
  backdrop-filter: blur(4px);
`;

const ModalBox = styled.div`
  background: ${Colors.white};
  border-radius: 1.25rem;
  width: 100%;
  max-width: ${props => props.$size === 'lg' ? '800px' : '500px'};
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
  animation: ${fadeIn} 0.3s ease-out;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${Colors.mediumGray}; border-radius: 3px; }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${Colors.mediumGray};

  h5 {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  svg { width: 20px; height: 20px; color: ${Colors.brass}; }
`;

const ModalClose = styled.button`
  background: none;
  border: none;
  color: ${Colors.textMuted};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s;

  &:hover {
    background: ${Colors.bone2};
    color: ${Colors.ink};
  }

  svg { width: 20px; height: 20px; }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid ${Colors.mediumGray};
`;

// ─── Form ──────────────────────────────────────────────────────────────────

const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 600;
    color: ${Colors.darkGray};
    margin-bottom: 0.375rem;
  }
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border-radius: 0.625rem;
  border: 2px solid ${Colors.mediumGray};
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: ${Colors.white};
  color: ${Colors.ink};
  font-family: inherit;

  &:focus {
    border-color: ${Colors.brass};
    box-shadow: 0 0 0 4px rgba(139, 115, 85, 0.1);
    outline: none;
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

// ─── Assignments List ──────────────────────────────────────────────────────

const AssignmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const AssignmentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: ${Colors.bone};
  border-radius: 0.75rem;
  border: 1px solid ${Colors.mediumGray};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${Colors.brassLight};
    background: ${Colors.white};
  }

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const AssignmentInfo = styled.div`
  h6 {
    font-size: 0.9375rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    color: ${Colors.ink};
  }

  small {
    font-size: 0.8125rem;
    color: ${Colors.textMuted};
  }
`;

// ─── Main Component ────────────────────────────────────────────────────────

function CoffinInventory() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [coffins, setCoffins] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [lowStockCoffins, setLowStockCoffins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCoffin, setSelectedCoffin] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [toast, setToast] = useState(null);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const [viewMode, setViewMode] = useState('table');

  const audioRef = useRef(null);

  const getTenantSlug = () => {
    return slug ||
      localStorage.getItem('tenantSlug') ||
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

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio('../../../../public/audio/notification-bells.mp3');
    if (audioRef.current) audioRef.current.volume = 0.3;
  }, []);

  const totalCoffins = useMemo(() => coffins.length, [coffins]);
  const totalStock = useMemo(() => coffins.reduce((sum, c) => sum + (c.quantity || 0), 0), [coffins]);
  const outOfStockCoffins = useMemo(() => coffins.filter(c => (c.quantity || 0) <= 0), [coffins]);
  const totalInventoryValue = useMemo(() => (
    coffins.reduce((sum, c) => sum + ((c.quantity || 0) * (parseFloat(c.exact_price) || 0)), 0)
  ), [coffins]);

  const stats = useMemo(() => [
    {
      title: "Total Models",
      value: totalCoffins,
      icon: <Box size={20} />,
      bg: `linear-gradient(135deg, ${Colors.verdigris} 0%, ${Colors.verdigrisDark} 100%)`,
      description: "Unique coffin models"
    },
    {
      title: "Total Valuation",
      value: `Ksh ${totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: <Trophy size={20} />,
      bg: `linear-gradient(135deg, ${Colors.brass} 0%, ${Colors.brassHover} 100%)`,
      description: "Inventory value"
    },
    {
      title: "Total Stock",
      value: totalStock,
      icon: <Database size={20} />,
      bg: `linear-gradient(135deg, ${Colors.success} 0%, #5A6E55 100%)`,
      description: "Units in inventory"
    },
    {
      title: "Out of Stock",
      value: outOfStockCoffins.length,
      icon: <XCircle size={20} />,
      bg: `linear-gradient(135deg, ${Colors.red} 0%, #7A3A30 100%)`,
      description: "Need restocking"
    }
  ], [totalCoffins, totalInventoryValue, totalStock, outOfStockCoffins.length]);

  const filteredCoffins = useMemo(() => {
    let filtered = coffins;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(coffin =>
        coffin.type?.toLowerCase().includes(term) ||
        coffin.custom_id?.toLowerCase().includes(term) ||
        coffin.material?.toLowerCase().includes(term) ||
        coffin.color?.toLowerCase().includes(term) ||
        coffin.supplier?.toLowerCase().includes(term)
      );
    }
    if (statusFilter === 'low') {
      filtered = filtered.filter(c => (c.quantity || 0) > 0 && (c.quantity || 0) <= 5);
    } else if (statusFilter === 'out') {
      filtered = filtered.filter(c => (c.quantity || 0) <= 0);
    } else if (statusFilter === 'in-stock') {
      filtered = filtered.filter(c => (c.quantity || 0) > 5);
    }
    return filtered;
  }, [coffins, searchTerm, statusFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCoffins = filteredCoffins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCoffins.length / itemsPerPage);

  const playAlertSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => { });
    }
  }, []);

  const checkLowStock = useCallback(() => {
    const alerts = coffins.filter(c => {
      const stock = c.quantity || 0;
      return stock > 0 && stock <= 5;
    });
    setLowStockCoffins(alerts);
    if (alerts.length > 0 && !hasPlayedSound) {
      playAlertSound();
      setHasPlayedSound(true);
      showToast('Low stock detected for some coffins!', 'error');
      setTimeout(() => setHasPlayedSound(false), 30000);
    }
  }, [coffins, showToast, playAlertSound, hasPlayedSound]);

  const fetchCoffins = useCallback(async () => {
    setLoading(true);
    try {
      const api = (await import('../../api/axios')).default;
      const { ENDPOINTS } = await import('../../api/endpoints');
      const response = await api.get(ENDPOINTS.COFFINS.LIST, { timeout: 10000 });
      if (response.data.success) {
        const processedCoffins = (response.data.data || []).map(coffin => {
          let images = [];
          if (Array.isArray(coffin.image_urls)) images = coffin.image_urls;
          else if (typeof coffin.image_urls === 'string') images = coffin.image_urls.split(',').map(u => u.trim());
          if (coffin.images && Array.isArray(coffin.images)) images = [...images, ...coffin.images];
          images = [...new Set(images)].filter(u => u && u.trim() !== '');
          return { ...coffin, images, primary_image: coffin.primary_image || images[0] || null };
        });
        setCoffins(processedCoffins);
        setLastUpdated(new Date());
        showToast('Data loaded successfully!', 'success');
      } else {
        throw new Error(response.data.message || 'Failed to fetch coffins');
      }
    } catch (error) {
      console.error('Failed to load coffin data:', error);
      showToast('Failed to load data from server', 'error');
      setCoffins([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchRecentAssignments = useCallback(async () => {
    setAssignmentsLoading(true);
    try {
      const api = (await import('../../api/axios')).default;
      const { ENDPOINTS } = await import('../../api/endpoints');
      const response = await api.get(ENDPOINTS.COFFINS.ASSIGNMENTS);
      if (response.data.success) {
        setRecentAssignments(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load recent assignments:', error);
      setRecentAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  }, []);

  const handleExportToExcel = async () => {
    setExporting(true);
    try {
      const api = (await import('../../api/axios')).default;
      const { ENDPOINTS } = await import('../../api/endpoints');
      const response = await api.get(ENDPOINTS.COFFINS.EXPORT, { responseType: 'blob' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `coffin-inventory-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Excel report downloaded successfully!', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Failed to export Excel report', 'error');
    } finally {
      setExporting(false);
    }
  };

  const forceRefresh = useCallback(async () => {
    setCoffins([]);
    setLowStockCoffins([]);
    setHasPlayedSound(false);
    await fetchCoffins();
    await fetchRecentAssignments();
  }, [fetchCoffins, fetchRecentAssignments]);

  useEffect(() => {
    fetchCoffins();
    fetchRecentAssignments();
  }, [fetchCoffins, fetchRecentAssignments]);

  useEffect(() => {
    if (coffins.length > 0) checkLowStock();
  }, [coffins, checkLowStock]);

  const handleAddCoffin = () => {
    const tenantSlug = getTenantSlug();
    navigate(`/tenant/${tenantSlug}/coffins/register`);
  };

  const handleDelete = (coffin) => {
    setSelectedCoffin(coffin);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const api = (await import('../../api/axios')).default;
      const { ENDPOINTS } = await import('../../api/endpoints');
      const response = await api.delete(ENDPOINTS.COFFINS.DELETE(selectedCoffin.coffin_id));
      if (response.data.success) {
        setCoffins(coffins.filter(c => c.coffin_id !== selectedCoffin.coffin_id));
        showToast('Coffin deleted successfully!', 'success');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'error');
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
      size: coffin.size || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const api = (await import('../../api/axios')).default;
      const { ENDPOINTS } = await import('../../api/endpoints');
      const response = await api.put(ENDPOINTS.COFFINS.UPDATE(selectedCoffin.coffin_id), editFormData);
      if (response.data.success) {
        setCoffins(coffins.map(c =>
          c.coffin_id === selectedCoffin.coffin_id ? { ...c, ...editFormData } : c
        ));
        showToast('Coffin updated successfully!', 'success');
        setShowEditModal(false);
        setSelectedCoffin(null);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      showToast('Update failed', 'error');
    }
  };

  const handleViewDetails = (coffin) => {
    const tenantSlug = getTenantSlug();
    navigate(`/tenant/${tenantSlug}/coffins/${coffin.coffin_id}/details`);
  };

  const getStockPercentage = (stock) => Math.min((stock / 20) * 100, 100);
  const getStockVariant = (stock) => {
    if (stock === 0) return 'danger';
    if (stock <= 5) return 'warning';
    return 'success';
  };

  const renderCoffinImage = (coffin) => {
    let images = [];
    if (Array.isArray(coffin.image_urls)) images = coffin.image_urls;
    else if (typeof coffin.image_urls === 'string') images = coffin.image_urls.split(',').map(u => u.trim());
    if (coffin.images && Array.isArray(coffin.images)) images = [...images, ...coffin.images];
    images = [...new Set(images)].filter(u => u && u.trim() !== '');
    const src = images[0];
    if (src) {
      return (
        <img
          src={src.startsWith('http') ? src : `http://localhost:4000${src}`}
          alt={coffin.type}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      );
    }
    return <Package size={20} />;
  };

  const renderCoffinImageUrl = (coffin) => {
    let images = [];
    if (Array.isArray(coffin.image_urls)) images = coffin.image_urls;
    else if (typeof coffin.image_urls === 'string') images = coffin.image_urls.split(',').map(u => u.trim());
    if (coffin.images && Array.isArray(coffin.images)) images = [...images, ...coffin.images];
    images = [...new Set(images)].filter(u => u && u.trim() !== '');
    return images[0] || null;
  };

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <BreadcrumbNav>
        <Link to="/dashboard"><Home size={14} /> Dashboard</Link>
        <span className="separator">/</span>
        <span>Coffin Inventory</span>
      </BreadcrumbNav>

      <Card>
        <CardHeader>
          <HeaderTitle>
            <Package />
            <h4>⚰️ Coffin Inventory</h4>
          </HeaderTitle>
          <HeaderActions>
            <ViewToggle>
              <ViewToggleButton $active={viewMode === 'table'} onClick={() => setViewMode('table')}>
                <List />
              </ViewToggleButton>
              <ViewToggleButton $active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
                <Grid3x3 />
              </ViewToggleButton>
            </ViewToggle>
            <Button className="ghost sm" onClick={forceRefresh}>
              <RefreshCw size={14} /> Refresh
            </Button>
            <Button className="ghost sm" onClick={() => setShowAssignmentsModal(true)}>
              <UsersIcon size={14} /> Assigned
            </Button>
            <Button className="primary sm" onClick={handleAddCoffin}>
              <Plus size={14} /> Add Coffin
            </Button>
          </HeaderActions>
        </CardHeader>

        <CardBody>
          {/* Low Stock Alert */}
          {lowStockCoffins.length > 0 && (
            <AlertBox>
              <AlertTriangle />
              <div className="alert-content">
                <strong>Low Stock Alert</strong>
                <small>{lowStockCoffins.length} coffin(s) need attention</small>
              </div>
              <button className="alert-close" onClick={() => setLowStockCoffins([])}>
                <XCircle size={16} />
              </button>
            </AlertBox>
          )}

          {/* Statistics */}
          <StatsRow>
            {stats.map((stat, index) => (
              <StatCard key={index} $bg={stat.bg}>
                <StatIcon>{stat.icon}</StatIcon>
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{stat.title}</StatLabel>
              </StatCard>
            ))}
          </StatsRow>

          {/* Search & Filters */}
          <FilterRow>
            <SearchWrapper>
              <Search />
              <Input
                type="text"
                placeholder="Search coffins by name, ID, material..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </SearchWrapper>
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </Select>
            <Button onClick={handleExportToExcel} disabled={exporting || coffins.length === 0}>
              {exporting ? <Loader2 size={14} /> : <FileSpreadsheet size={14} />}
              Export
            </Button>
          </FilterRow>

          {/* Content */}
          {loading ? (
            <LoadingState>
              <Loader2 size={32} />
              <p>Loading inventory...</p>
            </LoadingState>
          ) : filteredCoffins.length === 0 ? (
            <EmptyState>
              <Package />
              <h5>No coffins found</h5>
              <p>Try adjusting your search or filters</p>
              <Button className="primary" onClick={handleAddCoffin}>
                <Plus size={14} /> Add First Coffin
              </Button>
            </EmptyState>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <GridContainer>
              {currentCoffins.map((coffin) => {
                const stock = coffin.quantity || 0;
                const stockVariant = getStockVariant(stock);
                const imgSrc = renderCoffinImageUrl(coffin);
                return (
                  <CoffinCard key={coffin.coffin_id}>
                    <CoffinCardImage>
                      {imgSrc ? (
                        <img
                          src={imgSrc.startsWith('http') ? imgSrc : `http://localhost:4000${imgSrc}`}
                          alt={coffin.type}
                          onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16.5 9.4 7.55 4.24a1 1 0 0 0-1.1 0L2 6.5l11 6 11-6-4.45-2.26Z"/><path d="M2 12.5 13 18l11-5.5"/><path d="M13 18V8"/></svg>'; }}
                        />
                      ) : (
                        <Package size={48} />
                      )}
                    </CoffinCardImage>
                    <CoffinCardBody>
                      <CoffinCardTitle>{coffin.type}</CoffinCardTitle>
                      <CoffinCardText>
                        <Tag size={14} />
                        ID: {coffin.custom_id || `COFF-${coffin.coffin_id}`}
                      </CoffinCardText>
                      <CoffinCardText>
                        <Layers size={14} />
                        {coffin.material || 'N/A'}
                      </CoffinCardText>
                      <CoffinCardText>
                        <DollarSign size={14} />
                        Ksh {parseInt(coffin.exact_price || 0).toLocaleString()}
                      </CoffinCardText>
                      <CoffinCardFooter>
                        <Badge $variant={stockVariant}>
                          {stock} units
                        </Badge>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <ActionButton className="view" onClick={() => handleViewDetails(coffin)}>
                            <Eye size={14} />
                          </ActionButton>
                          <ActionButton className="edit" onClick={() => handleEdit(coffin)}>
                            <Edit size={14} />
                          </ActionButton>
                        </div>
                      </CoffinCardFooter>
                    </CoffinCardBody>
                  </CoffinCard>
                );
              })}
            </GridContainer>
          ) : (
            /* Table View */
            <>
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>ID</th>
                      <th>Category</th>
                      <th>Brand</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCoffins.map((coffin) => {
                      const stock = coffin.quantity || 0;
                      const stockPercentage = getStockPercentage(stock);
                      const stockVariant = getStockVariant(stock);
                      const imgSrc = renderCoffinImageUrl(coffin);
                      return (
                        <tr key={coffin.coffin_id} onClick={() => handleViewDetails(coffin)}>
                          <td>
                            <ProductCell>
                              <ProductImage>
                                {imgSrc ? (
                                  <img
                                    src={imgSrc.startsWith('http') ? imgSrc : `http://localhost:4000${imgSrc}`}
                                    alt={coffin.type}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <Package size={20} />
                                )}
                              </ProductImage>
                              <ProductInfo>
                                <h6>{coffin.type}</h6>
                                <p>{coffin.material} coffin - {coffin.color || 'Standard'} color</p>
                              </ProductInfo>
                            </ProductCell>
                          </td>
                          <td><code style={{ color: Colors.textMuted, fontSize: '0.8125rem' }}>{coffin.custom_id || `COFF-${coffin.coffin_id}`}</code></td>
                          <td>{coffin.material || 'N/A'}</td>
                          <td>{coffin.supplier || 'N/A'}</td>
                          <td>
                            <PriceBox>
                              <span className="new">Ksh {parseInt(coffin.exact_price || 0).toLocaleString()}</span>
                            </PriceBox>
                          </td>
                          <td>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600 }}>{stock}</span>
                                <small style={{ color: Colors.textMuted }}>{Math.round(stockPercentage)}%</small>
                              </div>
                              <StockBar>
                                <StockFill $percentage={stockPercentage} style={{ width: `${stockPercentage}%` }} />
                              </StockBar>
                            </div>
                          </td>
                          <td>
                            <Badge $variant={stockVariant}>
                              {stockVariant === 'danger' ? <XCircle size={12} /> :
                                stockVariant === 'warning' ? <AlertTriangle size={12} /> :
                                  <CheckCircle size={12} />}
                              {stockVariant === 'danger' ? 'Out' :
                                stockVariant === 'warning' ? 'Low' : 'In Stock'}
                            </Badge>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <ActionsCell>
                              <ActionButton className="view" onClick={() => handleViewDetails(coffin)}>
                                <Eye size={14} />
                              </ActionButton>
                              <ActionButton className="edit" onClick={() => handleEdit(coffin)}>
                                <Edit size={14} />
                              </ActionButton>
                              <ActionButton
                                className="delete"
                                onClick={() => handleDelete(coffin)}
                                disabled={stock > 0}
                              >
                                <Trash2 size={14} />
                              </ActionButton>
                            </ActionsCell>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </TableWrapper>

              {/* Pagination */}
              {totalPages > 1 && (
                <PaginationRow>
                  <PageInfo>
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredCoffins.length)} of {filteredCoffins.length}
                  </PageInfo>
                  <PageButtons>
                    <PageButton onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                      <ChevronLeft size={16} />
                    </PageButton>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <PageButton
                          key={pageNum}
                          $active={currentPage === pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </PageButton>
                      );
                    })}
                    <PageButton onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                      <ChevronRight size={16} />
                    </PageButton>
                  </PageButtons>
                </PaginationRow>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Assignments Modal */}
      {showAssignmentsModal && (
        <ModalOverlay onClick={() => setShowAssignmentsModal(false)}>
          <ModalBox $size="lg" onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h5><UsersIcon /> Recently Assigned Coffins</h5>
              <ModalClose onClick={() => setShowAssignmentsModal(false)}>
                <XCircle size={20} />
              </ModalClose>
            </ModalHeader>
            <ModalBody>
              {assignmentsLoading ? (
                <LoadingState>
                  <Loader2 size={24} />
                  <p>Loading assignments...</p>
                </LoadingState>
              ) : recentAssignments.length === 0 ? (
                <EmptyState style={{ padding: '2rem' }}>
                  <Package size={48} />
                  <h5>No recent assignments</h5>
                  <p>No coffins have been assigned yet</p>
                </EmptyState>
              ) : (
                <AssignmentList>
                  {recentAssignments.map((assignment) => (
                    <AssignmentItem key={assignment.assignment_id}>
                      <AssignmentInfo>
                        <h6>{assignment.deceased_name || 'Unknown'}</h6>
                        <small>{assignment.coffin_type || 'N/A'} • {assignment.material || 'N/A'}</small>
                      </AssignmentInfo>
                      <Badge $variant="success">
                        <CheckSquare size={12} /> Assigned
                      </Badge>
                    </AssignmentItem>
                  ))}
                </AssignmentList>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setShowAssignmentsModal(false)}>Close</Button>
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <ModalOverlay onClick={() => setShowDeleteModal(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h5><Trash2 /> Confirm Deletion</h5>
              <ModalClose onClick={() => setShowDeleteModal(false)}>
                <XCircle size={20} />
              </ModalClose>
            </ModalHeader>
            <ModalBody>
              <p>Delete <strong>{selectedCoffin?.type}</strong>? This action cannot be undone.</p>
              {selectedCoffin?.quantity > 0 && (
                <AlertBox style={{ marginBottom: 0 }}>
                  <Info size={18} />
                  <div className="alert-content">
                    <small>Cannot delete - coffin still has stock remaining</small>
                  </div>
                </AlertBox>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button className="danger" onClick={confirmDelete} disabled={selectedCoffin?.quantity > 0}>
                <Trash2 size={14} /> Delete
              </Button>
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <ModalOverlay onClick={() => setShowEditModal(false)}>
          <ModalBox $size="lg" onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h5><Edit /> Edit Coffin</h5>
              <ModalClose onClick={() => setShowEditModal(false)}>
                <XCircle size={20} />
              </ModalClose>
            </ModalHeader>
            <form onSubmit={handleEditSubmit}>
              <ModalBody>
                <FormRow>
                  <FormGroup>
                    <label>Model Type</label>
                    <FormInput
                      value={editFormData.type}
                      onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Material</label>
                    <FormInput
                      value={editFormData.material}
                      onChange={(e) => setEditFormData({ ...editFormData, material: e.target.value })}
                      required
                    />
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <label>Price (Ksh)</label>
                    <FormInput
                      type="number"
                      value={editFormData.exact_price}
                      onChange={(e) => setEditFormData({ ...editFormData, exact_price: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Quantity</label>
                    <FormInput
                      type="number"
                      value={editFormData.quantity}
                      onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                      required
                    />
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <label>Supplier</label>
                    <FormInput
                      value={editFormData.supplier}
                      onChange={(e) => setEditFormData({ ...editFormData, supplier: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Color</label>
                    <FormInput
                      value={editFormData.color}
                      onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                    />
                  </FormGroup>
                </FormRow>
              </ModalBody>
              <ModalFooter>
                <Button type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button type="submit" className="primary">
                  <Save size={14} /> Update Coffin
                </Button>
              </ModalFooter>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Toast */}
      {toast && (
        <ToastContainer>
          <ToastItem $type={toast.type}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
            <button className="toast-close" onClick={() => setToast(null)}>
              <XCircle size={16} />
            </button>
          </ToastItem>
        </ToastContainer>
      )}
    </PageContainer>
  );
}

export default CoffinInventory;