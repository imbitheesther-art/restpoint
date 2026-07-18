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
import env from '../../utils/config/env';

// ─── Color Palette ─────────────────────────────────────────────────────────
const C = {
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
  shadow: 'rgba(21,23,26,0.08)',
  overlay: 'rgba(21,23,26,0.88)',
  muted: '#8B8882',
  darkGray: '#2C2F33',
  infoBlue: '#5B7B8A',
  warningAmber: '#A68B5B',
  warningBg: '#F8F3E8',
  warningLine: '#EDE4D0',
  medGray: '#E3DDD0',
  lightGray: '#F3EFE6',
};

// ─── Animations ────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;
const slideInTop = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ─── Page ─────────────────────────────────────────────────────────────────
const Page = styled.div`
  background: ${C.bone};
  min-height: 100vh;
  padding: 1rem 1.25rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  @media (max-width: 768px) { padding: 0.625rem; }
`;

const Crumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.875rem;
  font-size: 0.78rem;
  color: ${C.muted};
  a {
    color: ${C.brass};
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.2rem;
    &:hover { color: ${C.brassHover}; }
    svg { width: 12px; height: 12px; }
  }
  .sep { color: ${C.medGray}; margin: 0 0.1rem; }
`;

// ─── Card Shell ────────────────────────────────────────────────────────────
const Card = styled.div`
  background: ${C.white};
  border-radius: 8px;
  box-shadow: 0 1px 4px ${C.shadow};
  border: 1px solid ${C.medGray};
  overflow: hidden;
  animation: ${fadeIn} 0.4s ease-out;
`;

const Head = styled.div`
  background: ${C.ink};
  color: ${C.bone};
  padding: 0.7rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.6rem;
  @media (max-width: 768px) {
    padding: 0.6rem 0.75rem;
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeadLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  h4 {
    font-size: 0.9rem;
    font-weight: 700;
    margin: 0;
  }
  svg { color: ${C.brassLight}; width: 18px; height: 18px; }
`;

const HeadRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 2px;
  background: rgba(255,255,255,0.08);
  padding: 2px;
  border-radius: 6px;
`;

const VTBtn = styled.button`
  padding: 0.3rem;
  border-radius: 4px;
  border: none;
  background: ${p => p.$on ? C.bone : 'transparent'};
  color: ${p => p.$on ? C.ink : 'rgba(255,255,255,0.5)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.15s;
  &:hover { background: ${p => p.$on ? C.bone : 'rgba(255,255,255,0.12)'}; }
  svg { width: 14px; height: 14px; }
`;

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid ${C.medGray};
  background: ${C.white};
  color: ${C.darkGray};
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  line-height: 1.4;
  &:hover {
    border-color: ${C.brass};
    box-shadow: 0 1px 4px ${C.shadow};
  }
  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
  svg { width: 13px; height: 13px; }

  &.primary {
    background: ${C.brass};
    color: ${C.white};
    border-color: transparent;
    &:hover { background: ${C.brassHover}; border-color: transparent; box-shadow: 0 2px 8px rgba(139,115,85,0.25); }
  }
  &.danger {
    background: ${C.red};
    color: white;
    border-color: transparent;
    &:hover { border-color: transparent; }
  }
  &.ghost {
    background: transparent;
    border-color: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.6);
    &:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); box-shadow: none; transform: none; }
  }
  @media (max-width: 576px) { font-size: 0.7rem; padding: 0.25rem 0.5rem; svg { width: 12px; height: 12px; } }
`;

const Body = styled.div`
  padding: 0.875rem 1rem;
  @media (max-width: 768px) { padding: 0.625rem 0.75rem; }
  @media (max-width: 576px) { padding: 0.5rem 0.625rem; }
`;

// ─── Stats ─────────────────────────────────────────────────────────────────
const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
  margin-bottom: 0.875rem;
  @media (max-width: 992px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 576px) { gap: 0.4rem; }
`;

const Stat = styled.div`
  background: ${p => p.$bg};
  border-radius: 6px;
  padding: 0.65rem 0.75rem;
  color: ${C.bone};
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  transition: box-shadow 0.2s;
  &:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 100%);
    pointer-events: none;
  }
  @media (max-width: 576px) { padding: 0.5rem 0.6rem; }
`;

const StatIcon = styled.div`
  background: rgba(255,255,255,0.15);
  border-radius: 5px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.4rem;
  svg { width: 14px; height: 14px; }
`;

const StatVal = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 0.1rem;
  @media (max-width: 576px) { font-size: 0.9rem; }
`;

const StatLbl = styled.small`
  font-size: 0.65rem;
  opacity: 0.8;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
`;

// ─── Alert ─────────────────────────────────────────────────────────────────
const Alert = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  border-radius: 5px;
  margin-bottom: 0.75rem;
  border-left: 3px solid ${C.red};
  background: ${C.redBg};
  color: ${C.red};
  font-size: 0.78rem;
  animation: ${fadeIn} 0.3s ease-out;
  svg { flex-shrink: 0; width: 15px; height: 15px; }
  .msg { flex: 1; strong { display: block; font-size: 0.75rem; margin-bottom: 0.1rem; } small { opacity: 0.8; font-size: 0.72rem; } }
  .close { background: none; border: none; color: ${C.red}; cursor: pointer; padding: 2px; opacity: 0.5; &:hover { opacity: 1; } svg { width: 14px; height: 14px; } }
`;

// ─── Filters ───────────────────────────────────────────────────────────────
const Filters = styled.div`
  display: grid;
  grid-template-columns: 1fr 160px 160px;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  @media (max-width: 768px) { grid-template-columns: 1fr; gap: 0.375rem; }
`;

const SearchWrap = styled.div`
  position: relative;
  svg {
    position: absolute;
    left: 0.65rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${C.muted};
    width: 14px;
    height: 14px;
    pointer-events: none;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.4rem 0.65rem 0.4rem 2rem;
  border-radius: 5px;
  border: 1px solid ${C.medGray};
  font-size: 0.78rem;
  background: ${C.white};
  color: ${C.ink};
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus { border-color: ${C.brass}; box-shadow: 0 0 0 2px rgba(139,115,85,0.08); outline: none; }
  &::placeholder { color: ${C.muted}; }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.4rem 1.75rem 0.4rem 0.65rem;
  border-radius: 5px;
  border: 1px solid ${C.medGray};
  font-size: 0.78rem;
  background: ${C.white};
  color: ${C.ink};
  font-family: inherit;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236B6862' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.6rem center;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus { border-color: ${C.brass}; box-shadow: 0 0 0 2px rgba(139,115,85,0.08); outline: none; }
`;

// ─── Table ────────────────────────────────────────────────────────────────
const TblWrap = styled.div`
  overflow-x: auto;
  border: 1px solid ${C.medGray};
  border-radius: 6px;
`;

const Tbl = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;

  thead th {
    background: ${C.bone2};
    border-bottom: 1px solid ${C.medGray};
    padding: 0.5rem 0.65rem;
    font-weight: 700;
    color: ${C.ink};
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: left;
    white-space: nowrap;
  }

  tbody td {
    padding: 0.5rem 0.65rem;
    border-bottom: 1px solid ${C.medGray};
    vertical-align: middle;
    color: ${C.darkGray};
  }

  tbody tr { transition: background 0.1s; cursor: pointer; &:hover { background: ${C.bone}; } &:last-child td { border-bottom: none; } }

  @media (max-width: 768px) { font-size: 0.72rem; thead th, tbody td { padding: 0.4rem 0.5rem; } }
`;

const ProdCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 180px;
`;

const ProdImg = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid ${C.medGray};
  background: ${C.bone2};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  img { width: 100%; height: 100%; object-fit: cover; }
  svg { color: ${C.muted}; width: 14px; height: 14px; }
`;

const ProdInfo = styled.div`
  h6 { font-size: 0.8rem; font-weight: 600; margin: 0; color: ${C.ink}; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
  p { font-size: 0.68rem; color: ${C.muted}; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
`;

const Price = styled.div`
  .new { font-weight: 700; color: ${C.red}; font-size: 0.8rem; white-space: nowrap; }
`;

const StockBar = styled.div`
  width: 60px;
  height: 4px;
  background: ${C.medGray};
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.2rem;
`;

const StockFill = styled.div`
  height: 100%;
  border-radius: 2px;
  background: ${p => p.$pct > 50 ? C.success : p.$pct > 20 ? C.warningAmber : C.red};
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.45rem;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.2px;
  white-space: nowrap;
  background: ${p => p.$v === 'danger' ? C.redBg : p.$v === 'warning' ? C.warningBg : C.successBg};
  color: ${p => p.$v === 'danger' ? C.red : p.$v === 'warning' ? C.warningAmber : C.success};
  border: 1px solid ${p => p.$v === 'danger' ? C.redLine : p.$v === 'warning' ? C.warningLine : C.successLine};
`;

const Acts = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
`;

const ActBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  border: 1px solid ${C.medGray};
  background: ${C.white};
  color: ${C.darkGray};
  cursor: pointer;
  transition: all 0.15s;
  svg { width: 12px; height: 12px; }
  &.view:hover { border-color: ${C.verdigris}; color: ${C.verdigris}; }
  &.edit:hover { border-color: ${C.brass}; color: ${C.brass}; }
  &.del:hover { border-color: ${C.red}; color: ${C.red}; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
`;

// ─── Grid View ─────────────────────────────────────────────────────────────
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.6rem;
  @media (max-width: 576px) { grid-template-columns: 1fr; }
`;

const GCard = styled.div`
  background: ${C.white};
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px ${C.shadow};
  border: 1px solid ${C.medGray};
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s, border-color 0.2s;
  animation: ${fadeIn} 0.3s ease-out;
  &:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.08); border-color: ${C.brassLight}; }
`;

const GImg = styled.div`
  width: 100%;
  height: 120px;
  overflow: hidden;
  border-bottom: 1px solid ${C.medGray};
  background: ${C.bone2};
  display: flex;
  align-items: center;
  justify-content: center;
  img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
  ${GCard}:hover & img { transform: scale(1.03); }
  svg { color: ${C.muted}; width: 32px; height: 32px; }
`;

const GBody = styled.div`
  padding: 0.65rem 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const GTitle = styled.h5`
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0 0 0.4rem;
  color: ${C.ink};
  line-height: 1.3;
`;

const GText = styled.p`
  font-size: 0.7rem;
  color: ${C.muted};
  margin: 0 0 0.2rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  svg { flex-shrink: 0; width: 11px; height: 11px; color: ${C.brass}; }
`;

const GFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${C.medGray};
`;

// ─── Pagination ────────────────────────────────────────────────────────────
const PagRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0 0;
  margin-top: 0.6rem;
  border-top: 1px solid ${C.medGray};
  flex-wrap: wrap;
  gap: 0.5rem;
  @media (max-width: 576px) { flex-direction: column; align-items: stretch; text-align: center; }
`;

const PagInfo = styled.div`
  font-size: 0.72rem;
  color: ${C.muted};
`;

const PagBtns = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const PagBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid ${p => p.$on ? C.brass : C.medGray};
  background: ${p => p.$on ? C.brass : C.white};
  color: ${p => p.$on ? C.white : C.darkGray};
  font-weight: ${p => p.$on ? '700' : '500'};
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
  &:hover:not(:disabled) { border-color: ${C.brass}; background: ${p => p.$on ? C.brassHover : C.bone}; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
  svg { width: 13px; height: 13px; }
`;

// ─── States ────────────────────────────────────────────────────────────────
const Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  color: ${C.brass};
  svg { animation: ${spin} 0.8s linear infinite; width: 24px; height: 24px; }
  p { margin-top: 0.6rem; font-size: 0.8rem; color: ${C.muted}; }
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  svg { width: 40px; height: 40px; color: ${C.medGray}; margin-bottom: 0.6rem; }
  h5 { font-size: 0.9rem; font-weight: 700; color: ${C.ink}; margin: 0 0 0.25rem; }
  p { font-size: 0.78rem; color: ${C.muted}; margin: 0 0 0.875rem; }
`;

// ─── Toast ─────────────────────────────────────────────────────────────────
const ToastWrap = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  @media (max-width: 576px) { left: 0.75rem; right: 0.75rem; bottom: 0.75rem; }
`;

const ToastItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 5px;
  background: ${p => p.$t === 'success' ? C.success : C.red};
  color: ${C.white};
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  animation: ${slideInTop} 0.2s ease-out;
  font-size: 0.78rem;
  font-weight: 500;
  max-width: 300px;
  svg { width: 14px; height: 14px; flex-shrink: 0; }
  .x { background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 1px; margin-left: auto; &:hover { color: white; } svg { width: 14px; height: 14px; } }
  @media (max-width: 576px) { max-width: 100%; font-size: 0.72rem; }
`;

// ─── Modal ────────────────────────────────────────────────────────────────
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${C.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 0.75rem;
  animation: ${fadeIn} 0.15s ease-out;
  backdrop-filter: blur(3px);
`;

const MBox = styled.div`
  background: ${C.white};
  border-radius: 8px;
  width: 100%;
  max-width: ${p => p.$lg ? '640px' : '420px'};
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 16px 48px rgba(0,0,0,0.25);
  animation: ${fadeIn} 0.2s ease-out;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${C.medGray}; border-radius: 2px; }
`;

const MHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.875rem;
  border-bottom: 1px solid ${C.medGray};
  h5 { font-size: 0.85rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 0.35rem; }
  svg { width: 16px; height: 16px; color: ${C.brass}; }
`;

const MClose = styled.button`
  background: none;
  border: none;
  color: ${C.muted};
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  transition: all 0.15s;
  &:hover { background: ${C.bone2}; color: ${C.ink}; }
  svg { width: 16px; height: 16px; }
`;

const MBody = styled.div`padding: 0.875rem;`;

const MFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.6rem 0.875rem;
  border-top: 1px solid ${C.medGray};
`;

// ─── Form ──────────────────────────────────────────────────────────────────
const FGroup = styled.div`
  margin-bottom: 0.65rem;
  label { display: block; font-size: 0.72rem; font-weight: 600; color: ${C.darkGray}; margin-bottom: 0.2rem; }
`;

const FInput = styled.input`
  width: 100%;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  border: 1px solid ${C.medGray};
  font-size: 0.78rem;
  background: ${C.white};
  color: ${C.ink};
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus { border-color: ${C.brass}; box-shadow: 0 0 0 2px rgba(139,115,85,0.08); outline: none; }
`;

const FRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  @media (max-width: 576px) { grid-template-columns: 1fr; }
`;

// ─── Assignments ───────────────────────────────────────────────────────────
const AssignList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const AssignItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.65rem;
  background: ${C.bone};
  border-radius: 5px;
  border: 1px solid ${C.medGray};
  font-size: 0.78rem;
  transition: border-color 0.15s;
  &:hover { border-color: ${C.brassLight}; }
  h6 { font-size: 0.78rem; font-weight: 600; margin: 0 0 0.1rem; color: ${C.ink}; }
  small { font-size: 0.7rem; color: ${C.muted}; }
  @media (max-width: 576px) { flex-direction: column; align-items: flex-start; gap: 0.3rem; }
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
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [registerFormData, setRegisterFormData] = useState({
    type: '', material: '', size: '', color: '', quantity: '',
    exact_price: '', currency: 'KES', supplier: '', origin: '', category: 'locally_made'
  });
  const [registerImageFiles, setRegisterImageFiles] = useState([]);
  const [registerImagePreviews, setRegisterImagePreviews] = useState([]);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const fileInputRef = useRef(null);
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
    { title: "Total Models", value: totalCoffins, icon: <Box size={14} />, bg: `linear-gradient(135deg, ${C.verdigris}, ${C.verdigrisDark})` },
    { title: "Total Valuation", value: `Ksh ${totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: <Trophy size={14} />, bg: `linear-gradient(135deg, ${C.brass}, ${C.brassHover})` },
    { title: "Total Stock", value: totalStock, icon: <Database size={14} />, bg: `linear-gradient(135deg, ${C.success}, #5A6E55)` },
    { title: "Out of Stock", value: outOfStockCoffins.length, icon: <XCircle size={14} />, bg: `linear-gradient(135deg, ${C.red}, #7A3A30)` }
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
    if (audioRef.current) audioRef.current.play().catch(() => { });
  }, []);

  const checkLowStock = useCallback(() => {
    const alerts = coffins.filter(c => { const s = c.quantity || 0; return s > 0 && s <= 5; });
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
      if (response.data.success) setRecentAssignments(response.data.data || []);
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
      showToast('Excel report downloaded!', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Failed to export', 'error');
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

  useEffect(() => { fetchCoffins(); fetchRecentAssignments(); }, [fetchCoffins, fetchRecentAssignments]);
  useEffect(() => { if (coffins.length > 0) checkLowStock(); }, [coffins, checkLowStock]);

  const handleAddCoffin = () => {
    setRegisterFormData({ type: '', material: '', size: '', color: '', quantity: '', exact_price: '', currency: 'KES', supplier: '', origin: '', category: 'locally_made' });
    setRegisterImageFiles([]);
    setRegisterImagePreviews([]);
    setRegisterError(null);
    setShowRegisterModal(true);
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newFiles = [...registerImageFiles, ...files];
    const newPreviews = [...registerImagePreviews];
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === newFiles.length) setRegisterImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
    setRegisterImageFiles(newFiles);
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
    const formData = new FormData();
    Object.keys(registerFormData).forEach(key => { if (registerFormData[key] !== '') formData.append(key, registerFormData[key]); });
    try {
      const username = (() => { try { const u = JSON.parse(localStorage.getItem('user') || '{}'); return u.username || u.name || 'Admin'; } catch { return 'Admin'; } })();
      formData.append('created_by', username);
      registerImageFiles.forEach(file => formData.append('images', file));
      const env = await import('../../utils/config/env');
      const { ENDPOINTS } = await import('../../api/endpoints');
      const { getTenantHeaders } = await import('../../api/endpoints');
      const registerUrl = `${env.default.FULL_API_URL}${ENDPOINTS.COFFINS.BASE}/register`;
      const response = await fetch(registerUrl, { method: 'POST', headers: getTenantHeaders(), body: formData });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Registration failed');
      showToast('Coffin registered!', 'success');
      setShowRegisterModal(false);
      fetchCoffins();
    } catch (err) {
      setRegisterError(err.message || 'An unexpected error occurred.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleDelete = (coffin) => { setSelectedCoffin(coffin); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    try {
      const api = (await import('../../api/axios')).default;
      const { ENDPOINTS } = await import('../../api/endpoints');
      const response = await api.delete(ENDPOINTS.COFFINS.DELETE(selectedCoffin.coffin_id));
      if (response.data.success) {
        setCoffins(coffins.filter(c => c.coffin_id !== selectedCoffin.coffin_id));
        showToast('Deleted successfully!', 'success');
      } else throw new Error(response.data.message);
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'error');
    }
    setShowDeleteModal(false);
    setSelectedCoffin(null);
  };

  const handleEdit = (coffin) => {
    setSelectedCoffin(coffin);
    setEditFormData({ type: coffin.type || '', material: coffin.material || '', exact_price: coffin.exact_price || '', quantity: coffin.quantity || '', supplier: coffin.supplier || '', color: coffin.color || '', size: coffin.size || '' });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const api = (await import('../../api/axios')).default;
      const { ENDPOINTS } = await import('../../api/endpoints');
      const response = await api.put(ENDPOINTS.COFFINS.UPDATE(selectedCoffin.coffin_id), editFormData);
      if (response.data.success) {
        setCoffins(coffins.map(c => c.coffin_id === selectedCoffin.coffin_id ? { ...c, ...editFormData } : c));
        showToast('Updated successfully!', 'success');
        setShowEditModal(false);
        setSelectedCoffin(null);
      } else throw new Error(response.data.message);
    } catch (error) {
      showToast('Update failed', 'error');
    }
  };

  const handleViewDetails = (coffin) => {
    const tenantSlug = getTenantSlug();
    navigate(`/tenant/${tenantSlug}/coffins/${coffin.coffin_id}/details`);
  };

  const getStockPercentage = (stock) => Math.min((stock / 20) * 100, 100);
  const getStockVariant = (stock) => { if (stock === 0) return 'danger'; if (stock <= 5) return 'warning'; return 'success'; };

  const renderCoffinImageUrl = (coffin) => {
    let images = [];
    if (Array.isArray(coffin.image_urls)) images = coffin.image_urls;
    else if (typeof coffin.image_urls === 'string') images = coffin.image_urls.split(',').map(u => u.trim());
    if (coffin.images && Array.isArray(coffin.images)) images = [...images, ...coffin.images];
    images = [...new Set(images)].filter(u => u && u.trim() !== '');
    return images[0] || null;
  };

  return (
    <Page>
      <Crumb>
        <Link to="/dashboard"><Home size={12} /> Dashboard</Link>
        <span className="sep">/</span>
        <span>Coffin Inventory</span>
      </Crumb>

      <Card>
        <Head>
          <HeadLeft>
            <Package />
            <h4> Coffin Inventory</h4>
          </HeadLeft>
          <HeadRight>
            <ViewToggle>
              <VTBtn $on={viewMode === 'table'} onClick={() => setViewMode('table')}><List /></VTBtn>
              <VTBtn $on={viewMode === 'grid'} onClick={() => setViewMode('grid')}><Grid3x3 /></VTBtn>
            </ViewToggle>
            <Btn className="ghost" onClick={forceRefresh}><RefreshCw size={12} /> Refresh</Btn>
            <Btn className="ghost" onClick={() => setShowAssignmentsModal(true)}><UsersIcon size={12} /> Assigned</Btn>
            <Btn className="primary" onClick={handleAddCoffin}><Plus size={12} /> Add Coffin</Btn>
          </HeadRight>
        </Head>

        <Body>
          {lowStockCoffins.length > 0 && (
            <Alert>
              <AlertTriangle />
              <div className="msg">
                <strong>Low Stock Alert</strong>
                <small>{lowStockCoffins.length} coffin(s) need attention</small>
              </div>
              <button className="close" onClick={() => setLowStockCoffins([])}><XCircle /></button>
            </Alert>
          )}

          <Stats>
            {stats.map((s, i) => (
              <Stat key={i} $bg={s.bg}>
                <StatIcon>{s.icon}</StatIcon>
                <StatVal>{s.value}</StatVal>
                <StatLbl>{s.title}</StatLbl>
              </Stat>
            ))}
          </Stats>

          <Filters>
            <SearchWrap>
              <Search />
              <Input type="text" placeholder="Search by name, ID, material..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
            </SearchWrap>
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </Select>
            <Btn onClick={handleExportToExcel} disabled={exporting || coffins.length === 0}>
              {exporting ? <Loader2 size={12} /> : <FileSpreadsheet size={12} />} Export
            </Btn>
          </Filters>

          {loading ? (
            <Loading><Loader2 /><p>Loading inventory...</p></Loading>
          ) : filteredCoffins.length === 0 ? (
            <Empty>
              <Package />
              <h5>No coffins found</h5>
              <p>Try adjusting your search or filters</p>
              <Btn className="primary" onClick={handleAddCoffin}><Plus size={12} /> Add First Coffin</Btn>
            </Empty>
          ) : viewMode === 'grid' ? (
            <Grid>
              {currentCoffins.map((coffin) => {
                const stock = coffin.quantity || 0;
                const imgSrc = renderCoffinImageUrl(coffin);
                return (
                  <GCard key={coffin.coffin_id}>
                    <GImg>
                      {imgSrc ? (
                        <img src={imgSrc.startsWith('http') ? imgSrc : `${env.FULL_API_URL}${imgSrc}`} alt={coffin.type} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16.5 9.4 7.55 4.24a1 1 0 0 0-1.1 0L2 6.5l11 6 11-6-4.45-2.26Z"/><path d="M2 12.5 13 18l11-5.5"/><path d="M13 18V8"/></svg>'; }} />
                      ) : <Package size={32} />}
                    </GImg>
                    <GBody>
                      <GTitle>{coffin.type}</GTitle>
                      <GText><Tag size={11} />{coffin.custom_id || `COFF-${coffin.coffin_id}`}</GText>
                      <GText><Layers size={11} />{coffin.material || 'N/A'}</GText>
                      <GText><DollarSign size={11} />Ksh {parseInt(coffin.exact_price || 0).toLocaleString()}</GText>
                      <GFooter>
                        <Badge $v={getStockVariant(stock)}>{stock} units</Badge>
                        <div style={{ display: 'flex', gap: '0.2rem' }}>
                          <ActBtn className="view" onClick={() => handleViewDetails(coffin)}><Eye size={12} /></ActBtn>
                          <ActBtn className="edit" onClick={() => handleEdit(coffin)}><Edit size={12} /></ActBtn>
                        </div>
                      </GFooter>
                    </GBody>
                  </GCard>
                );
              })}
            </Grid>
          ) : (
            <TblWrap>
              <Tbl>
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
                    const imgSrc = renderCoffinImageUrl(coffin);
                    return (
                      <tr key={coffin.coffin_id} onClick={() => handleViewDetails(coffin)}>
                        <td>
                          <ProdCell>
                            <ProdImg>
                              {imgSrc ? (
                                <img src={imgSrc.startsWith('http') ? imgSrc : `${env.FULL_API_URL}${imgSrc}`} alt={coffin.type} onError={(e) => { e.target.style.display = 'none'; }} />
                              ) : <Package size={14} />}
                            </ProdImg>
                            <ProdInfo>
                              <h6>{coffin.type}</h6>
                              <p>{coffin.material || 'N/A'}</p>
                            </ProdInfo>
                          </ProdCell>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: C.brass }}>{coffin.custom_id || `COFF-${coffin.coffin_id}`}</td>
                        <td style={{ textTransform: 'capitalize', fontSize: '0.72rem' }}>{coffin.category?.replace('_', ' ') || 'N/A'}</td>
                        <td style={{ fontSize: '0.72rem' }}>{coffin.supplier || 'N/A'}</td>
                        <td><Price><span className="new">Ksh {parseInt(coffin.exact_price || 0).toLocaleString()}</span></Price></td>
                        <td>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{stock}</div>
                          <StockBar><StockFill $pct={getStockPercentage(stock)} style={{ width: `${getStockPercentage(stock)}%` }} /></StockBar>
                        </td>
                        <td><Badge $v={getStockVariant(stock)}>{stock === 0 ? 'Out' : stock <= 5 ? 'Low' : 'In Stock'}</Badge></td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <Acts>
                            <ActBtn className="view" onClick={() => handleViewDetails(coffin)}><Eye size={12} /></ActBtn>
                            <ActBtn className="edit" onClick={() => handleEdit(coffin)}><Edit size={12} /></ActBtn>
                            <ActBtn className="del" onClick={() => handleDelete(coffin)}><Trash2 size={12} /></ActBtn>
                          </Acts>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Tbl>
            </TblWrap>
          )}

          {filteredCoffins.length > 0 && (
            <PagRow>
              <PagInfo>Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredCoffins.length)} of {filteredCoffins.length}</PagInfo>
              <PagBtns>
                <PagBtn onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft /></PagBtn>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 2), currentPage + 1).map(page => (
                  <PagBtn key={page} $on={currentPage === page} onClick={() => setCurrentPage(page)}>{page}</PagBtn>
                ))}
                <PagBtn onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight /></PagBtn>
              </PagBtns>
            </PagRow>
          )}
        </Body>
      </Card>

      {/* Delete Modal */}
      {showDeleteModal && (
        <Overlay onClick={() => setShowDeleteModal(false)}>
          <MBox onClick={(e) => e.stopPropagation()}>
            <MHead>
              <h5><Trash2 size={16} /> Delete Coffin</h5>
              <MClose onClick={() => setShowDeleteModal(false)}><XCircle /></MClose>
            </MHead>
            <MBody>
              <p style={{ fontSize: '0.8rem', color: C.gray, margin: '0 0 1rem' }}>
                Are you sure you want to delete <strong>{selectedCoffin?.type}</strong>? This action cannot be undone.
              </p>
            </MBody>
            <MFooter>
              <Btn onClick={() => setShowDeleteModal(false)}>Cancel</Btn>
              <Btn className="danger" onClick={confirmDelete}><Trash2 size={12} /> Delete</Btn>
            </MFooter>
          </MBox>
        </Overlay>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <Overlay onClick={() => setShowEditModal(false)}>
          <MBox onClick={(e) => e.stopPropagation()}>
            <MHead>
              <h5><Edit size={16} /> Edit Coffin</h5>
              <MClose onClick={() => setShowEditModal(false)}><XCircle /></MClose>
            </MHead>
            <form onSubmit={handleEditSubmit}>
              <MBody>
                <FGroup><label>Model *</label><FInput name="type" value={editFormData.type} onChange={(e) => setEditFormData(p => ({ ...p, type: e.target.value }))} required /></FGroup>
                <FRow>
                  <FGroup><label>Material *</label><FInput name="material" value={editFormData.material} onChange={(e) => setEditFormData(p => ({ ...p, material: e.target.value }))} required /></FGroup>
                  <FGroup><label>Price *</label><FInput name="exact_price" type="number" value={editFormData.exact_price} onChange={(e) => setEditFormData(p => ({ ...p, exact_price: e.target.value }))} required /></FGroup>
                </FRow>
                <FRow>
                  <FGroup><label>Quantity</label><FInput name="quantity" type="number" value={editFormData.quantity} onChange={(e) => setEditFormData(p => ({ ...p, quantity: e.target.value }))} /></FGroup>
                  <FGroup><label>Color</label><FInput name="color" value={editFormData.color} onChange={(e) => setEditFormData(p => ({ ...p, color: e.target.value }))} /></FGroup>
                </FRow>
                <FRow>
                  <FGroup><label>Size</label><FInput name="size" value={editFormData.size} onChange={(e) => setEditFormData(p => ({ ...p, size: e.target.value }))} /></FGroup>
                  <FGroup><label>Supplier</label><FInput name="supplier" value={editFormData.supplier} onChange={(e) => setEditFormData(p => ({ ...p, supplier: e.target.value }))} /></FGroup>
                </FRow>
              </MBody>
              <MFooter>
                <Btn onClick={() => setShowEditModal(false)}>Cancel</Btn>
                <Btn className="primary" type="submit"><Save size={12} /> Save</Btn>
              </MFooter>
            </form>
          </MBox>
        </Overlay>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <Overlay onClick={() => setShowRegisterModal(false)}>
          <MBox $lg onClick={(e) => e.stopPropagation()}>
            <MHead>
              <h5><Plus size={16} /> Register Coffin</h5>
              <MClose onClick={() => setShowRegisterModal(false)}><XCircle /></MClose>
            </MHead>
            <form onSubmit={handleRegisterSubmit}>
              <MBody>
                {registerError && <Alert><AlertCircle /><div className="msg"><small>{registerError}</small></div></Alert>}
                <FGroup><label>Model Name *</label><FInput name="type" value={registerFormData.type} onChange={handleRegisterChange} placeholder="e.g., Premium Oak" required /></FGroup>
                <FRow>
                  <FGroup><label>Material *</label><FInput name="material" value={registerFormData.material} onChange={handleRegisterChange} placeholder="e.g., Oak, Pine" required /></FGroup>
                  <FGroup><label>Price (KES) *</label><FInput name="exact_price" type="number" value={registerFormData.exact_price} onChange={handleRegisterChange} placeholder="0" required /></FGroup>
                </FRow>
                <FRow>
                  <FGroup><label>Size</label><FInput name="size" value={registerFormData.size} onChange={handleRegisterChange} placeholder="e.g., 6ft" /></FGroup>
                  <FGroup><label>Color</label><FInput name="color" value={registerFormData.color} onChange={handleRegisterChange} placeholder="e.g., Dark Brown" /></FGroup>
                </FRow>
                <FRow>
                  <FGroup><label>Quantity</label><FInput name="quantity" type="number" value={registerFormData.quantity} onChange={handleRegisterChange} placeholder="1" /></FGroup>
                  <FGroup><label>Supplier</label><FInput name="supplier" value={registerFormData.supplier} onChange={handleRegisterChange} placeholder="Supplier name" /></FGroup>
                </FRow>
                <FRow>
                  <FGroup>
                    <label>Category</label>
                    <Select name="category" value={registerFormData.category} onChange={handleRegisterChange}>
                      <option value="locally_made">Locally Made</option>
                      <option value="imported">Imported</option>
                    </Select>
                  </FGroup>
                  <FGroup><label>Origin</label><FInput name="origin" value={registerFormData.origin} onChange={handleRegisterChange} placeholder="e.g., Nairobi" /></FGroup>
                </FRow>
                <FGroup>
                  <label>Images</label>
                  <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleRegisterFileChange} style={{ fontSize: '0.75rem' }} />
                </FGroup>
                {registerImagePreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {registerImagePreviews.map((src, i) => (
                      <img key={i} src={src} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, border: `1px solid ${C.medGray}` }} />
                    ))}
                  </div>
                )}
              </MBody>
              <MFooter>
                <Btn onClick={() => setShowRegisterModal(false)}>Cancel</Btn>
                <Btn className="primary" type="submit" disabled={registerLoading}>
                  {registerLoading ? <Loader2 size={12} /> : <Plus size={12} />} Register
                </Btn>
              </MFooter>
            </form>
          </MBox>
        </Overlay>
      )}

      {/* Assignments Modal */}
      {showAssignmentsModal && (
        <Overlay onClick={() => setShowAssignmentsModal(false)}>
          <MBox $lg onClick={(e) => e.stopPropagation()}>
            <MHead>
              <h5><Users size={16} /> Recent Assignments</h5>
              <MClose onClick={() => setShowAssignmentsModal(false)}><XCircle /></MClose>
            </MHead>
            <MBody>
              {assignmentsLoading ? (
                <Loading><Loader2 /><p>Loading assignments...</p></Loading>
              ) : recentAssignments.length === 0 ? (
                <Empty><Users /><h5>No assignments yet</h5><p>Assignments will appear here once coffins are allocated</p></Empty>
              ) : (
                <AssignList>
                  {recentAssignments.slice(0, 20).map((a, i) => (
                    <AssignItem key={i}>
                      <div>
                        <h6>{a.coffin_type || a.coffin_name || 'Coffin'}</h6>
                        <small>Assigned to: {a.assigned_to || a.client_name || 'N/A'}</small>
                      </div>
                      <Badge $v="success">{a.status || 'Assigned'}</Badge>
                    </AssignItem>
                  ))}
                </AssignList>
              )}
            </MBody>
          </MBox>
        </Overlay>
      )}

      {/* Toast */}
      {toast && (
        <ToastWrap>
          <ToastItem $t={toast.type}>
            {toast.type === 'success' ? <CheckCircle /> : <AlertCircle />}
            {toast.message}
            <button className="x" onClick={() => setToast(null)}><XCircle /></button>
          </ToastItem>
        </ToastWrap>
      )}
    </Page>
  );
}

export default CoffinInventory;