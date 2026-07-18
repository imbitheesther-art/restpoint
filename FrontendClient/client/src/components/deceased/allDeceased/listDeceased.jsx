import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Loader2,
  PlusCircle,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Users,
  Microscope,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  Calendar,
  Filter,
  FileText,
  X,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExportModal from '../ExportModal';

import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';

const Colors = {
  primaryDark: '#2C3E50',
  accentBlue: '#1e293b',
  white: '#FFFFFF',
  lightGray: '#F7F9FB',
  mediumGray: '#E9ECEF',
  darkGray: '#1e293b',
  successGreen: '#1DB954',
  dangerRed: '#C0392B',
  kinSuccess: '#00A896',
  kinDanger: '#E71D36',
  autopsySuccess: '#6A0572',
  autopsyDanger: '#FF9F1C',
  warningYellow: '#F39C12',
  infoBlue: '#1e293b',
  tableBorder: '#E9ECEF',
  headerBg: '#1e293b',
  hoverGray: '#F0F3F5',
  statusReceived: '#6A0572',
  statusUnderCare: '#F39C12',
  statusReady: '#1DB954',
  statusCompleted: '#C0392B',
  red: '#dc3545',
};

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: ${Colors.lightGray};
  padding: 0;
  font-family: 'Inter', sans-serif;
  animation: ${fadeIn} 0.6s ease-out;
`;

const ContentWrapper = styled.div`
  max-width: 1800px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (max-width: 768px) {
    padding: 0.625rem;
    gap: 0.625rem;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.625rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    width: 100%;
    order: 2;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${Colors.primaryDark};
  letter-spacing: -0.05em;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  white-space: nowrap;

  svg {
    color: ${Colors.accentBlue};
    width: 2rem;
    height: 2rem;
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;
    order: 1;
    width: 100%;

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  max-width: 480px;
  min-width: 0;

  @media (max-width: 768px) {
    max-width: 100%;
    width: 100%;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;

  input {
    width: 100%;
    padding: 0.6rem 2.25rem 0.6rem 2.5rem;
    border: 1px solid ${Colors.mediumGray};
    border-radius: 0.5rem;
    font-size: 0.85rem;
    color: ${Colors.darkGray};
    transition: all 0.2s ease;
    background-color: ${Colors.white};

    &:focus {
      outline: none;
      border-color: ${Colors.accentBlue};
      box-shadow: 0 0 0 3px rgba(5, 102, 141, 0.12);
    }

    &::placeholder {
      color: #9ca3af;
      font-size: 0.8rem;
    }

    @media (max-width: 480px) {
      padding: 0.55rem 2rem 0.55rem 2.25rem;
      font-size: 0.82rem;
    }
  }

  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    width: 1rem;
    height: 1rem;
    pointer-events: none;
  }
`;

const ClearSearchButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  transition: all 0.15s;

  &:hover {
    background-color: ${Colors.mediumGray};
    color: ${Colors.dangerRed};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    order: 3;

    button {
      flex: 1;
      min-width: 0;
      justify-content: center;
    }
  }

  @media (max-width: 400px) {
    flex-direction: column;
    gap: 0.375rem;
  }
`;

const PageGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: ${(props) => (props.$panelOpen ? '1.2fr 0.8fr' : '1fr')};

  @media (max-width: 1140px) {
    grid-template-columns: 1fr;
  }
`;

const DrawerOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
`;

const DrawerOverlayOpen = styled(DrawerOverlay)`
  opacity: 1;
  pointer-events: auto;
`;

const Drawer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 520px;
  max-width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: ${Colors.white};
  z-index: 10001;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DrawerOpen = styled(Drawer)`
  transform: translateX(0);
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${Colors.tableBorder};
  flex-shrink: 0;
`;

const DrawerTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${Colors.primaryDark};
  margin: 0 0 0.25rem;
`;

const DrawerSubtitle = styled.div`
  font-size: 0.82rem;
  color: ${Colors.darkGray};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DrawerBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${Colors.lightGray};
    border-radius: 0.5rem;
  }

  &::-webkit-scrollbar-thumb {
    background: ${Colors.mediumGray};
    border-radius: 0.5rem;

    &:hover {
      background: ${Colors.accentBlue};
    }
  }
`;

const DrawerIconBtn = styled.button`
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: ${Colors.darkGray};
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${Colors.lightGray};
    color: ${Colors.primaryDark};
  }
`;

const DrawerSection = styled.div`
  background: ${Colors.lightGray};
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
`;

const DrawerSectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${Colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const DrawerDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const DrawerDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DrawerDetailLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${Colors.darkGray};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.25rem;
`;

const DrawerDetailValue = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${Colors.primaryDark};
  word-break: break-word;
`;

const DrawerActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 1.25rem;
  border-top: 1px solid ${Colors.tableBorder};
`;

const DrawerButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;
  min-height: 40px;

  ${(props) =>
    props.$primary
      ? css`
          background: ${Colors.accentBlue};
          color: ${Colors.white};

          &:hover:not(:disabled) {
            background: #04597b;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(5, 102, 141, 0.2);
          }
        `
      : css`
          background: ${Colors.white};
          color: ${Colors.darkGray};
          border: 1px solid ${Colors.tableBorder};

          &:hover:not(:disabled) {
            background: ${Colors.lightGray};
            border-color: ${Colors.accentBlue};
          }
        `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${Colors.tableBorder};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${Colors.primaryDark};
  flex: 1;
`;

const ModalSubtitle = styled.div`
  font-size: 0.85rem;
  color: ${Colors.darkGray};
  margin-top: 0.25rem;
`;

const CloseModalButton = styled.button`
  border: none;
  background: transparent;
  color: ${Colors.darkGray};
  cursor: pointer;
  font-size: 2rem;
  line-height: 1;
  padding: 0.25rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${Colors.lightGray};
    color: ${Colors.dangerRed};
    transform: rotate(90deg);
  }
`;

const ModalTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${Colors.tableBorder};
  padding-bottom: 0.5rem;
`;

const ModalTab = styled.button`
  border: none;
  background: transparent;
  color: ${(props) => (props.$active ? Colors.accentBlue : Colors.darkGray)};
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: ${Colors.lightGray};
  }

  ${(props) =>
    props.$active &&
    css`
      &::after {
        content: '';
        position: absolute;
        bottom: -0.5rem;
        left: 0;
        right: 0;
        height: 2px;
        background: ${Colors.accentBlue};
        border-radius: 1px;
      }
    `}
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const ModalSection = styled.div`
  background: ${Colors.lightGray};
  border-radius: 0.75rem;
  padding: 1.25rem;
`;

const ModalSectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: ${Colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModalDetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ModalDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ModalDetailLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${Colors.darkGray};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ModalDetailValue = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${Colors.primaryDark};
  word-break: break-word;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid ${Colors.tableBorder};
`;

const ModalButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${(props) =>
    props.$primary
      ? css`
          background: ${Colors.accentBlue};
          color: ${Colors.white};

          &:hover {
            background: #04597b;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(5, 102, 141, 0.2);
          }
        `
      : props.$danger
        ? css`
          background: ${Colors.dangerRed};
          color: ${Colors.white};

          &:hover {
            background: #a93226;
          }
        `
        : css`
          background: ${Colors.white};
          color: ${Colors.darkGray};
          border: 1px solid ${Colors.tableBorder};

          &:hover {
            background: ${Colors.lightGray};
            border-color: ${Colors.accentBlue};
          }
        `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const PrimaryButton = styled.button`
  ${({ refresh }) =>
    refresh &&
    css`
      background-color: ${Colors.dangerRed};
      &:hover { background-color: #a93226; }
    `}
  ${({ primary }) =>
    primary &&
    css`
      background-color: ${Colors.accentBlue};
      &:hover { background-color: #04597b; }
    `}

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem 0.85rem;
  border-radius: 0.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${Colors.white};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  line-height: 1.4;
  min-height: 38px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  }
  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  svg {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    padding: 0.55rem 0.65rem;
    font-size: 0.78rem;
    min-height: 40px;

    svg {
      width: 0.95rem;
      height: 0.95rem;
    }
  }
`;

const PanelActionButton = styled(PrimaryButton)`
  width: 100%;
  justify-content: center;
`;

const ReportButton = styled(PrimaryButton)`
  background-color: #6a0572;
  &:hover { background-color: #5a0462; }
`;

const StyledCard = styled.div`
  background-color: ${Colors.white};
  border-radius: 0.6rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid ${Colors.tableBorder};
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: ${Colors.white};
  border-radius: 0.6rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  flex-wrap: nowrap;
  overflow-x: auto;
  white-space: nowrap;

  &::-webkit-scrollbar { height: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${Colors.mediumGray}; border-radius: 2px; }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.625rem;
    padding: 0.75rem;
    border-radius: 0;
    box-shadow: none;
    border: none;
    background: transparent;
    max-height: 0;
    padding: 0 0.75rem;
    overflow: hidden;
    transition: max-height 0.3s ease, padding 0.3s ease;

    ${({ $show }) =>
    $show &&
    css`
      max-height: 500px;
      padding: 0.75rem;
      border: 1px solid ${Colors.tableBorder};
      border-radius: 0.6rem;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
      background: ${Colors.white};
    `}
  }
`;

const MobileFilterToggle = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.65rem 0.875rem;
    background-color: ${Colors.white};
    border-radius: 0.5rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    border: 1px solid ${Colors.tableBorder};
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
    color: ${Colors.primaryDark};
    transition: background 0.15s;

    &:active {
      background: ${Colors.hoverGray};
    }

    svg {
      color: ${Colors.accentBlue};
      width: 1.1rem;
      height: 1.1rem;
      transition: transform 0.2s;
    }

    ${({ $open }) =>
    $open &&
    css`
      svg {
        transform: rotate(180deg);
      }
    `}
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;

    &:not(:first-child) {
      border-top: 1px solid ${Colors.mediumGray};
      padding-top: 0.625rem;
    }
  }
`;

const FilterLabel = styled.label`
  font-weight: 600;
  color: ${Colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  white-space: nowrap;

  svg {
    color: ${Colors.accentBlue};
    width: 0.95rem;
    height: 0.95rem;
  }

  @media (max-width: 768px) {
    font-size: 0.78rem;
    min-width: 70px;
  }
`;

const InputStyle = css`
  padding: 0.5rem 0.7rem;
  border: 1px solid ${Colors.mediumGray};
  border-radius: 0.4rem;
  font-size: 0.82rem;
  color: ${Colors.darkGray};
  transition: all 0.2s ease;
  background-color: ${Colors.white};

  &:focus {
    outline: none;
    border-color: ${Colors.accentBlue};
    box-shadow: 0 0 0 2px rgba(5, 102, 141, 0.1);
  }

  @media (max-width: 768px) {
    padding: 0.45rem 0.6rem;
    font-size: 0.78rem;
  }
`;

const YearFilterInput = styled.div`
  position: relative;
  min-width: 110px;
  max-width: 130px;

  input {
    ${InputStyle}
    width: 100%;
    padding-right: 0.6rem;
  }

  .year-select-container {
    position: relative;
    display: flex;
  }

  select {
    ${InputStyle}
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 10;
    appearance: none;
  }

  @media (max-width: 768px) {
    min-width: 90px;
    max-width: 110px;
  }
`;

const FilterSelect = styled.select`
  ${InputStyle}
  padding-right: 1.75rem;
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  min-width: 110px;

  @media (max-width: 768px) {
    min-width: 0;
    flex: 1;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  width: 100%;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-track { background: ${Colors.mediumGray}; }
  &::-webkit-scrollbar-thumb { background: ${Colors.accentBlue}; border-radius: 2px; }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead th {
    background-color: ${Colors.headerBg};
    color: ${Colors.white};
    padding: 0.7rem 0.875rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    text-align: left;
    border-bottom: 2px solid ${Colors.accentBlue};
    white-space: nowrap;

    &:first-child { border-top-left-radius: 0.6rem; }
    &:last-child { border-top-right-radius: 0.6rem; }
    &.text-center { text-align: center; }
  }

  tbody tr {
    background-color: ${Colors.white};
    transition: background 0.15s;
    border-bottom: 1px solid ${Colors.tableBorder};
    cursor: pointer;

    &:hover { background-color: ${Colors.hoverGray}; }
    &.selected { background-color: #dbeafe; }
    &:last-child { border-bottom: none; }

    td {
      padding: 0.7rem 0.875rem;
      color: ${Colors.darkGray};
      font-size: 0.82rem;
      font-weight: 500;
      vertical-align: middle;

      &:nth-child(2) {
        color: #6c757d;
        font-weight: 400;
      }
    }
  }

  @media (max-width: 768px) {
    thead { display: none; }

    tbody tr {
      display: block;
      margin-bottom: 0;
      border: 1px solid ${Colors.tableBorder};
      border-radius: 0.5rem;
      padding: 0;
      background: ${Colors.white};
    }

    tbody td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.45rem 0;
      border: none;
      font-size: 0.78rem;

      &:before {
        content: attr(data-label);
        font-weight: 600;
        color: ${Colors.primaryDark};
        text-transform: uppercase;
        font-size: 0.7rem;
        letter-spacing: 0.03em;
        min-width: 70px;
        flex-shrink: 0;
      }

      &.mobile-full {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.4rem;
        padding: 0.45rem 0;

        &:before {
          align-self: flex-start;
        }
      }
    }
  }
`;

const StatusIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  margin: auto;
  background-color: ${(props) => {
    const c =
      props.status === 'success'
        ? props.type === 'kin' ? Colors.kinSuccess : props.type === 'autopsy' ? Colors.autopsySuccess : Colors.successGreen
        : props.type === 'kin' ? Colors.kinDanger : props.type === 'autopsy' ? Colors.autopsyDanger : Colors.dangerRed;
    return `${c}18`;
  }};

  svg {
    color: ${(props) =>
    props.status === 'success'
      ? props.type === 'kin' ? Colors.kinSuccess : props.type === 'autopsy' ? Colors.autopsySuccess : Colors.successGreen
      : props.type === 'kin' ? Colors.kinDanger : props.type === 'autopsy' ? Colors.autopsyDanger : Colors.dangerRed};
    width: 1.1rem;
    height: 1.1rem;
  }

  @media (max-width: 768px) {
    width: 1.75rem;
    height: 1.75rem;

    svg {
      width: 0.95rem;
      height: 0.95rem;
    }
  }
`;

const StatusPill = styled.span`
  display: inline-flex;
  padding: 0.25rem 0.55rem;
  border-radius: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.02em;
  white-space: nowrap;

  ${({ status }) => {
    let bg, color;
    switch (status ? status.toLowerCase() : '') {
      case 'received': case 'new': bg = Colors.statusReceived; color = Colors.white; break;
      case 'undercare': case 'pending': case 'inprogress': bg = Colors.statusUnderCare; color = Colors.darkGray; break;
      case 'ready': case 'awaitingcollection': bg = Colors.statusReady; color = Colors.white; break;
      case 'completed': case 'released': case 'discharged': bg = Colors.statusCompleted; color = Colors.white; break;
      default: bg = Colors.mediumGray; color = Colors.darkGray;
    }
    return css`background-color: ${bg}; color: ${color};`;
  }}

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.2rem 0.45rem;
  }
`;

const AnimatedLoader2 = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

const ViewDetailsButton = styled(PrimaryButton)`
  padding: 0.4rem 0.7rem;
  font-size: 0.72rem;
  border-radius: 0.35rem;
  background-color: ${Colors.infoBlue};
  min-height: 32px;

  &:hover {
    background-color: #2980b9;
  }

  svg {
    width: 0.85rem;
    height: 0.85rem;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 0.55rem;
    font-size: 0.78rem;
    min-height: 38px;
    border-radius: 0.4rem;
  }
`;

const WarningMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background-color: rgba(243, 156, 18, 0.08);
  border-left: 3px solid ${Colors.warningYellow};
  padding: 0.5rem 0.875rem;
  border-radius: 0.35rem;
  color: ${Colors.darkGray};
  font-weight: 500;
  animation: ${fadeIn} 0.4s ease-out;
  white-space: nowrap;
  font-size: 0.8rem;

  svg {
    color: ${Colors.warningYellow};
    width: 1.1rem;
    height: 1.1rem;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    white-space: normal;
    font-size: 0.75rem;
  }
`;

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  gap: 1rem;
  color: ${Colors.darkGray};
  font-size: 0.85rem;

  svg {
    width: 2.5rem;
    height: 2.5rem;
  }

  @media (max-width: 768px) {
    padding: 2.5rem 1rem;
    font-size: 0.8rem;

    svg {
      width: 2rem;
      height: 2rem;
    }
  }
`;

const Paginator = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.875rem;
  background-color: ${Colors.white};
  border-radius: 0.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid ${Colors.tableBorder};
  border-bottom: 2px solid ${Colors.accentBlue};
  flex-wrap: wrap;
  gap: 0.625rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
    padding: 0.625rem;
  }
`;

const PaginatorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${Colors.darkGray};

  @media (max-width: 768px) {
    justify-content: space-between;
    font-size: 0.72rem;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    overflow-x: auto;
    max-width: 100%;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 2px;

    &::-webkit-scrollbar { height: 2px; }
    &::-webkit-scrollbar-thumb { background: ${Colors.mediumGray}; border-radius: 1px; }
  }
`;

const PaginationButton = styled.button`
  background-color: ${(props) => (props.active ? Colors.accentBlue : Colors.white)};
  color: ${(props) => (props.active ? Colors.white : Colors.darkGray)};
  border: 1px solid ${(props) => (props.active ? Colors.accentBlue : Colors.mediumGray)};
  border-radius: 0.3rem;
  padding: 0.35rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background-color: rgba(30, 41, 59, 0.08);
    color: ${Colors.accentBlue};
    border-color: ${Colors.accentBlue};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  svg {
    width: 0.85rem;
    height: 0.85rem;
  }
`;

const ItemsPerPageSelect = styled(FilterSelect)`
  min-width: auto;
  padding: 0.35rem 1.5rem 0.35rem 0.5rem;
  font-size: 0.75rem;
`;

const RecordsInfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${Colors.darkGray};

  @media (max-width: 768px) {
    font-size: 0.75rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.375rem;
  }
`;

const MobileCard = styled.div`
  background-color: ${Colors.white};
  border-radius: 0.5rem;
  padding: 0.875rem;
  margin-bottom: 0.625rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid ${Colors.tableBorder};
  animation: ${fadeIn} 0.25s ease-out;
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.625rem;
  padding-bottom: 0.625rem;
  border-bottom: 1px solid ${Colors.mediumGray};
`;

const MobileCardTitle = styled.h3`
  font-size: 0.92rem;
  font-weight: 700;
  color: ${Colors.primaryDark};
  margin: 0;
  flex: 1;
  line-height: 1.3;
`;

const MobileCardDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
`;

const MobileDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;

  .label {
    font-weight: 600;
    color: ${Colors.primaryDark};
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }

  .value {
    color: ${Colors.darkGray};
    font-weight: 500;
    text-align: right;
    word-break: break-word;
  }
`;

const MobileStatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
`;

const MobileKinRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;

  span {
    font-size: 0.78rem;
    font-weight: 600;
    color: ${Colors.darkGray};
  }
`;

const extractYear = (dateString) => {
  if (!dateString) return null;
  try {
    const year = new Date(dateString).getFullYear().toString();
    return year === 'NaN' ? null : year;
  } catch (e) {
    return null;
  }
};

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

const AllDeceasedPage = () => {
  const navigate = useNavigate();
  const [allDeceasedRecords, setAllDeceasedRecords] = useState([]);
  const [filteredDeceasedRecords, setFilteredDeceasedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [autopsyFilter, setAutopsyFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedDeceased, setSelectedDeceased] = useState(null);
  const [selectedDeceasedProfile, setSelectedDeceasedProfile] = useState(null);
  const [selectedModalTab, setSelectedModalTab] = useState('overview');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchSelectedDeceasedProfile = async (record) => {
    const deceasedId = record.deceased_id || record.id;
    setModalLoading(true);
    setModalError(null);
    setSelectedModalTab('overview');
    try {
      const response = await api.get(ENDPOINTS.DECEASED.DETAIL(deceasedId));
      const profile = response.data?.data || response.data || record;
      setSelectedDeceasedProfile(profile);
    } catch (error) {
      console.error('Error loading deceased profile:', error);
      setSelectedDeceasedProfile(record);
      setModalError('Unable to load detailed profile. Showing summary only.');
    } finally {
      setModalLoading(false);
    }
  };

  const openProfileModal = async (record) => {
    setSelectedDeceased(record);
    setModalOpen(true);
    await fetchSelectedDeceasedProfile(record);
  };

  const closeProfileModal = () => {
    setModalOpen(false);
    setSelectedDeceased(null);
    setSelectedDeceasedProfile(null);
    setModalError(null);
  };

  const handleViewDetailsClick = async (record, event) => {
    if (event) event.stopPropagation();
    await openProfileModal(record);
  };

  const handleViewMoreClick = () => {
    if (!selectedDeceased) return;
    const tenantSlug = getTenantSlug();
    navigate(`/tenant/${tenantSlug}/deceased/${selectedDeceased.deceased_id || selectedDeceased.id}`);
  };

  const handleModalTabChange = (tab) => {
    setSelectedModalTab(tab);
  };

  const getModalValue = (key) => {
    const record = selectedDeceasedProfile || selectedDeceased;
    if (!record) return 'N/A';
    const value = record[key];
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string' && value.trim() === '') return 'N/A';
    return value;
  };

  const uniqueYears = useMemo(() => {
    const years = allDeceasedRecords
      .map((record) => extractYear(record.created_at))
      .filter((year) => year !== null);
    return [...new Set(years)].sort((a, b) => b - a);
  }, [allDeceasedRecords]);

  const fetchDeceased = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(ENDPOINTS.DECEASED.LIST);
      const result = response.data;
      const records = result.data;

      if (Array.isArray(records)) {
        const normalizedRecords = records
          .map((record) => ({
            ...record,
            current_status: record.status,
            has_kin: Boolean(record.has_kin),
            has_autopsy: Boolean(record.has_autopsy),
            deceased_id: record.deceased_id || record.id,
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setAllDeceasedRecords(normalizedRecords);
        setFilteredDeceasedRecords(normalizedRecords);
      } else {
        setError(result.message || 'No deceased records found.');
        setAllDeceasedRecords([]);
        setFilteredDeceasedRecords([]);
      }
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching deceased records:', err);
      setError('Failed to load deceased records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeceased();
  }, []);

  const handleExport = async (exportOptions) => {
    setExporting(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('period', exportOptions.period);
      if (exportOptions.startDate) queryParams.append('startDate', exportOptions.startDate);
      if (exportOptions.endDate) queryParams.append('endDate', exportOptions.endDate);
      if (exportOptions.includeFilters) {
        if (statusFilter !== 'all') queryParams.append('status', statusFilter);
        if (autopsyFilter !== 'all') queryParams.append('autopsy', autopsyFilter);
        if (yearFilter !== 'all') queryParams.append('year', yearFilter);
        if (searchTerm) queryParams.append('search', searchTerm);
      }
      queryParams.append('format', exportOptions.format);

      const url = `/deceased/export?${queryParams.toString()}`;
      const response = await api.get(url, { responseType: 'blob' });

      const blob = new Blob([response.data], {
        type: exportOptions.format === 'csv'
          ? 'text/csv'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `deceased_report_${new Date().toISOString().split('T')[0]}.${exportOptions.format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Report exported successfully!');
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error(error.response?.data?.message || 'Failed to export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    let currentFiltered = allDeceasedRecords;
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFiltered = currentFiltered.filter(
        (record) =>
          (record.full_name && record.full_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (record.admission_number && record.admission_number.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    if (autopsyFilter === 'performed') {
      currentFiltered = currentFiltered.filter((record) => record.has_autopsy === true);
    } else if (autopsyFilter === 'notPerformed') {
      currentFiltered = currentFiltered.filter((record) => record.has_autopsy === false);
    }
    if (yearFilter !== 'all' && yearFilter.length === 4 && /^\d+$/.test(yearFilter)) {
      currentFiltered = currentFiltered.filter((record) => {
        const recordYear = extractYear(record.created_at);
        return recordYear === yearFilter;
      });
    }
    if (statusFilter !== 'all') {
      currentFiltered = currentFiltered.filter((record) => {
        const status = (record.status || '').toLowerCase();
        switch (statusFilter) {
          case 'received':
            return status.includes('received') || status.includes('new');
          case 'underCare':
            return status.includes('undercare') || status.includes('pending') || status.includes('inprogress');
          case 'ready':
            return status.includes('ready') || status.includes('awaitingcollection');
          case 'completed':
            return status.includes('completed') || status.includes('released') || status.includes('discharged');
          default:
            return true;
        }
      });
    }
    setFilteredDeceasedRecords(currentFiltered);
    setCurrentPage(1);
  }, [searchTerm, autopsyFilter, yearFilter, statusFilter, allDeceasedRecords]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const totalPages = Math.ceil(filteredDeceasedRecords.length / itemsPerPage);
  const indexOfLastRecord = currentPage * itemsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
  const currentRecords = filteredDeceasedRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleNewRegistrationClick = () => {
    const tenantSlug = getTenantSlug();
    navigate(`/tenant/${tenantSlug}/deceased/register`);
  };

  const handleYearChange = (value) => {
    if (value === 'all' || (value.length <= 4 && /^\d*$/.test(value))) {
      setYearFilter(value);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setAutopsyFilter('all');
    setYearFilter('all');
    setStatusFilter('all');
  };

  const toggleFilters = () => setShowFilters(!showFilters);

  const generatePaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <PaginationButton key={i} active={currentPage === i} onClick={() => handlePageChange(i)}>{i}</PaginationButton>
        );
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          buttons.push(
            <PaginationButton key={i} active={currentPage === i} onClick={() => handlePageChange(i)}>{i}</PaginationButton>
          );
        }
        buttons.push(<span key="e1" style={{ padding: '0.35rem', color: Colors.darkGray }}>...</span>);
        buttons.push(
          <PaginationButton key={totalPages} active={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationButton>
        );
      } else if (currentPage >= totalPages - 2) {
        buttons.push(<PaginationButton key={1} active={currentPage === 1} onClick={() => handlePageChange(1)}>1</PaginationButton>);
        buttons.push(<span key="e2" style={{ padding: '0.35rem', color: Colors.darkGray }}>...</span>);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          buttons.push(
            <PaginationButton key={i} active={currentPage === i} onClick={() => handlePageChange(i)}>{i}</PaginationButton>
          );
        }
      } else {
        buttons.push(<PaginationButton key={1} active={currentPage === 1} onClick={() => handlePageChange(1)}>1</PaginationButton>);
        buttons.push(<span key="e3" style={{ padding: '0.35rem', color: Colors.darkGray }}>...</span>);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          buttons.push(
            <PaginationButton key={i} active={currentPage === i} onClick={() => handlePageChange(i)}>{i}</PaginationButton>
          );
        }
        buttons.push(<span key="e4" style={{ padding: '0.35rem', color: Colors.darkGray }}>...</span>);
        buttons.push(
          <PaginationButton key={totalPages} active={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationButton>
        );
      }
    }
    return buttons;
  };

  const renderMobileCard = (record) => (
    <MobileCard key={record.id} onClick={() => openProfileModal(record)}>
      <MobileCardHeader>
        <MobileCardTitle>{record.full_name || 'Unknown'}</MobileCardTitle>
        <StatusPill status={record.status}>{record.status || 'Unknown'}</StatusPill>
      </MobileCardHeader>
      <MobileCardDetails>
        <MobileDetailRow>
          <span className="label">Admission</span>
          <span className="value">{record.admission_number || 'N/A'}</span>
        </MobileDetailRow>
        <MobileDetailRow>
          <span className="label">Date of Death</span>
          <span className="value">{record.date_of_death ? new Date(record.date_of_death).toLocaleDateString() : 'N/A'}</span>
        </MobileDetailRow>
        <MobileDetailRow>
          <span className="label">Created</span>
          <span className="value">{record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}</span>
        </MobileDetailRow>
      </MobileCardDetails>
      <MobileStatusRow>
        <MobileKinRow>
          <span>Next of Kin</span>
          <StatusIcon type="kin" status={record.has_kin ? 'success' : 'danger'}>
            {record.has_kin ? <CheckCircle size={14} /> : <XCircle size={14} />}
          </StatusIcon>
        </MobileKinRow>
      </MobileStatusRow>
      <ViewDetailsButton onClick={(e) => { e.stopPropagation(); handleViewDetailsClick(record, e); }}>
        <Eye size={14} /> View Details
      </ViewDetailsButton>
    </MobileCard>
  );

  const renderTableRow = (record) => (
    <tr key={record.id} onClick={() => openProfileModal(record)}>
      <td data-label="Full Name">{record.full_name || 'Unknown'}</td>
      <td data-label="Admission No">{record.admission_number || 'N/A'}</td>
      <td data-label="Date of Death">{record.date_of_death ? new Date(record.date_of_death).toLocaleDateString() : 'N/A'}</td>
      <td data-label="Created">{record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}</td>
      <td data-label="Status" className="text-center"><StatusPill status={record.status}>{record.status || 'Unknown'}</StatusPill></td>
      <td data-label="Next of Kin" className="text-center">
        <StatusIcon type="kin" status={record.has_kin ? 'success' : 'danger'}>
          {record.has_kin ? <CheckCircle size={16} /> : <XCircle size={16} />}
        </StatusIcon>
      </td>
      <td data-label="Actions" className="text-center">
        <ViewDetailsButton onClick={(e) => handleViewDetailsClick(record, e)}>
          <Eye size={14} /> View Details
        </ViewDetailsButton>
      </td>
    </tr>
  );

  return (
    <AppContainer>
      <ToastContainer position="top-right" autoClose={3000} />

      <ContentWrapper>
        <HeaderSection>
          <Title>
            <ClipboardList />
            Deceased Records
          </Title>

          <HeaderLeft>
            <SearchBarContainer>
              <SearchInputWrapper>
                <Search />
                <input
                  type="text"
                  placeholder="Search by name or admission number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <ClearSearchButton onClick={clearSearch} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)' }}>
                    <X size={14} />
                  </ClearSearchButton>
                )}
              </SearchInputWrapper>
            </SearchBarContainer>
          </HeaderLeft>

          <ButtonGroup>
            <PrimaryButton refresh onClick={fetchDeceased} disabled={loading}>
              {loading ? <AnimatedLoader2 size={16} /> : <RefreshCw size={16} />}
              <span>Refresh</span>
            </PrimaryButton>
            <ReportButton onClick={() => setShowExportModal(true)} disabled={loading || filteredDeceasedRecords.length === 0}>
              <FileText size={16} />
              <span>Export</span>
            </ReportButton>
            <PrimaryButton primary onClick={handleNewRegistrationClick}>
              <PlusCircle size={16} />
              <span>Add New</span>
            </PrimaryButton>
          </ButtonGroup>
        </HeaderSection>

        <PageGrid>
          <div>
            {!loading && !error && filteredDeceasedRecords.length > 0 && (
              <Paginator>
                <PaginatorInfo>
                  <span>
                    {indexOfFirstRecord + 1}–{Math.min(indexOfLastRecord, filteredDeceasedRecords.length)} of {filteredDeceasedRecords.length}
                  </span>
                  <ItemsPerPageSelect value={itemsPerPage} onChange={handleItemsPerPageChange}>
                    <option value={5}>5/page</option>
                    <option value={10}>10/page</option>
                    <option value={20}>20/page</option>
                    <option value={50}>50/page</option>
                  </ItemsPerPageSelect>
                </PaginatorInfo>
                <PaginationControls>
                  <PaginationButton onClick={() => handlePageChange(1)} disabled={currentPage === 1}>First</PaginationButton>
                  <PaginationButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft /></PaginationButton>
                  {generatePaginationButtons()}
                  <PaginationButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight /></PaginationButton>
                  <PaginationButton onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>Last</PaginationButton>
                </PaginationControls>
              </Paginator>
            )}

            <MobileFilterToggle onClick={toggleFilters} $open={showFilters}>
              <span>Filters</span>
              <Filter />
            </MobileFilterToggle>

            <FilterContainer $show={showFilters}>
              <FilterGroup>
                <FilterLabel><Calendar />Year</FilterLabel>
                <YearFilterInput>
                  <div className="year-select-container">
                    <input type="text" placeholder="YYYY" value={yearFilter === 'all' ? '' : yearFilter} onChange={(e) => handleYearChange(e.target.value)} maxLength={4} />
                    <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                      <option value="all">All Years</option>
                      {uniqueYears.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </div>
                </YearFilterInput>
              </FilterGroup>
              <FilterGroup>
                <FilterLabel><AlertTriangle />Status</FilterLabel>
                <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="received">Received</option>
                  <option value="underCare">Under Care</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                </FilterSelect>
              </FilterGroup>
              <FilterGroup>
                <PrimaryButton onClick={clearAllFilters} style={{ fontSize: '0.78rem', padding: '0.4rem 0.65rem', minHeight: 'auto' }}>Clear All</PrimaryButton>
              </FilterGroup>
            </FilterContainer>

            {!loading && filteredDeceasedRecords.length > 0 && (
              <RecordsInfoBar>
                <span>Showing {filteredDeceasedRecords.length} of {allDeceasedRecords.length} records</span>
                {filteredDeceasedRecords.length === 0 && allDeceasedRecords.length > 0 && (
                  <WarningMessage><AlertTriangle />No records match your current filters</WarningMessage>
                )}
              </RecordsInfoBar>
            )}

            {loading && (
              <CenteredContainer>
                <AnimatedLoader2 size={36} color={Colors.accentBlue} />
                <div>Loading deceased records...</div>
              </CenteredContainer>
            )}

            {error && !loading && (
              <CenteredContainer>
                <AlertTriangle size={36} color={Colors.dangerRed} />
                <div>{error}</div>
                <PrimaryButton onClick={fetchDeceased}><RefreshCw size={16} />Try Again</PrimaryButton>
              </CenteredContainer>
            )}

            {!loading && !error && (
              <>
                {!isMobile && filteredDeceasedRecords.length > 0 && (
                  <StyledCard>
                    <TableContainer>
                      <StyledTable>
                        <thead>
                          <tr>
                            <th>Full Name</th><th>Admission No</th><th>Date of Death</th><th>Created</th>
                            <th className="text-center">Status</th><th className="text-center">Next of Kin</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>{currentRecords.map(renderTableRow)}</tbody>
                      </StyledTable>
                    </TableContainer>
                  </StyledCard>
                )}
                {isMobile && filteredDeceasedRecords.length > 0 && <div>{currentRecords.map(renderMobileCard)}</div>}
                {!loading && filteredDeceasedRecords.length === 0 && allDeceasedRecords.length > 0 && (
                  <CenteredContainer>
                    <ClipboardList size={36} color={Colors.mediumGray} />
                    <div>No records found matching your filters</div>
                    <PrimaryButton onClick={clearAllFilters}>Clear Filters</PrimaryButton>
                  </CenteredContainer>
                )}
                {!loading && allDeceasedRecords.length === 0 && (
                  <CenteredContainer>
                    <Users size={36} color={Colors.mediumGray} />
                    <div>No deceased records found</div>
                    <PrimaryButton primary onClick={handleNewRegistrationClick}><PlusCircle size={16} />Add First Record</PrimaryButton>
                  </CenteredContainer>
                )}
              </>
            )}
          </div>

          {modalOpen && selectedDeceased && (
            <>
              <DrawerOverlayOpen onClick={closeProfileModal} />
              <DrawerOpen>
                <DrawerHeader>
                  <div>
                    <DrawerTitle>{selectedDeceased?.full_name || 'Deceased Profile'}</DrawerTitle>
                    <DrawerSubtitle>
                      <StatusPill status={selectedDeceased?.status}>{selectedDeceased?.status || 'Unknown'}</StatusPill>
                      <span>Admission: {selectedDeceased?.admission_number || 'N/A'} • Ref: {selectedDeceased?.deceased_id || 'N/A'}</span>
                    </DrawerSubtitle>
                  </div>
                  <DrawerIconBtn onClick={closeProfileModal} aria-label="Close drawer">
                    <X size={20} />
                  </DrawerIconBtn>
                </DrawerHeader>

                <DrawerBody>
                  {modalLoading && (
                    <CenteredContainer>
                      <AnimatedLoader2 size={40} color={Colors.accentBlue} />
                      <div>Loading profile...</div>
                    </CenteredContainer>
                  )}

                  {!!modalError && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.75rem 1rem',
                      background: '#fef3c7',
                      borderLeft: '3px solid #f59e0b',
                      borderRadius: '0.5rem',
                      color: '#92400e',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      marginBottom: '1rem'
                    }}>
                      <AlertTriangle size={18} />
                      {modalError}
                    </div>
                  )}

                  {!modalLoading && !modalError && selectedDeceased && (
                    <>
                      {selectedModalTab === 'overview' && (
                        <>
                          <DrawerSection>
                            <DrawerSectionTitle>
                              <User size={16} />
                              Profile Summary
                            </DrawerSectionTitle>
                            <DrawerDetailGrid>
                              <DrawerDetailItem>
                                <DrawerDetailLabel>Full Name</DrawerDetailLabel>
                                <DrawerDetailValue>{getModalValue('full_name') || 'Unknown'}</DrawerDetailValue>
                              </DrawerDetailItem>
                              <DrawerDetailItem>
                                <DrawerDetailLabel>Reference ID</DrawerDetailLabel>
                                <DrawerDetailValue>{getModalValue('deceased_id') || 'N/A'}</DrawerDetailValue>
                              </DrawerDetailItem>
                              <DrawerDetailItem>
                                <DrawerDetailLabel>Date of Death</DrawerDetailLabel>
                                <DrawerDetailValue>
                                  {getModalValue('date_of_death') ? new Date(getModalValue('date_of_death')).toLocaleDateString() : 'N/A'}
                                </DrawerDetailValue>
                              </DrawerDetailItem>
                              <DrawerDetailItem>
                                <DrawerDetailLabel>Date Admitted</DrawerDetailLabel>
                                <DrawerDetailValue>
                                  {getModalValue('date_admitted') ? new Date(getModalValue('date_admitted')).toLocaleDateString() : 'N/A'}
                                </DrawerDetailValue>
                              </DrawerDetailItem>
                              <DrawerDetailItem>
                                <DrawerDetailLabel>Status</DrawerDetailLabel>
                                <DrawerDetailValue>{getModalValue('status') || 'Unknown'}</DrawerDetailValue>
                              </DrawerDetailItem>
                              <DrawerDetailItem>
                                <DrawerDetailLabel>Gender</DrawerDetailLabel>
                                <DrawerDetailValue>{getModalValue('gender') || 'N/A'}</DrawerDetailValue>
                              </DrawerDetailItem>
                              <DrawerDetailItem>
                                <DrawerDetailLabel>Next of Kin</DrawerDetailLabel>
                                <DrawerDetailValue>{getModalValue('has_kin') ? 'Yes' : 'No'}</DrawerDetailValue>
                              </DrawerDetailItem>
                              <DrawerDetailItem>
                                <DrawerDetailLabel>Autopsy</DrawerDetailLabel>
                                <DrawerDetailValue>{getModalValue('has_autopsy') ? 'Performed' : 'Not performed'}</DrawerDetailValue>
                              </DrawerDetailItem>
                            </DrawerDetailGrid>
                          </DrawerSection>

                          <DrawerSection>
                            <DrawerSectionTitle>
                              <Info size={16} />
                              Additional Information
                            </DrawerSectionTitle>
                            <DrawerDetailGrid>
                              <DrawerDetailItem>
                                <DrawerDetailLabel>Admission Number</DrawerDetailLabel>
                                <DrawerDetailValue>{getModalValue('admission_number') || 'N/A'}</DrawerDetailValue>
                              </DrawerDetailItem>
                              <DrawerDetailItem>
                                <DrawerDetailLabel>Year</DrawerDetailLabel>
                                <DrawerDetailValue>
                                  {getModalValue('created_at') ? new Date(getModalValue('created_at')).getFullYear() : 'N/A'}
                                </DrawerDetailValue>
                              </DrawerDetailItem>
                              <DrawerDetailItem>
                                <DrawerDetailLabel>Place of Death</DrawerDetailLabel>
                                <DrawerDetailValue>{getModalValue('place_of_death') || 'N/A'}</DrawerDetailValue>
                              </DrawerDetailItem>
                              <DrawerDetailItem>
                                <DrawerDetailLabel>Cause of Death</DrawerDetailLabel>
                                <DrawerDetailValue>{getModalValue('cause_of_death') || 'N/A'}</DrawerDetailValue>
                              </DrawerDetailItem>
                            </DrawerDetailGrid>
                          </DrawerSection>
                        </>
                      )}

                      {selectedModalTab === 'financials' && (
                        <DrawerSection>
                          <DrawerSectionTitle>
                            <DollarSign size={16} />
                            Financial Summary
                          </DrawerSectionTitle>
                          <DrawerDetailGrid>
                            <DrawerDetailItem>
                              <DrawerDetailLabel>Total Charges</DrawerDetailLabel>
                              <DrawerDetailValue>{getModalValue('total_mortuary_charge') || 0} KES</DrawerDetailValue>
                            </DrawerDetailItem>
                            <DrawerDetailItem>
                              <DrawerDetailLabel>Currency</DrawerDetailLabel>
                              <DrawerDetailValue>{getModalValue('currency') || 'KES'}</DrawerDetailValue>
                            </DrawerDetailItem>
                            <DrawerDetailItem>
                              <DrawerDetailLabel>Balance</DrawerDetailLabel>
                              <DrawerDetailValue>{getModalValue('balance') ?? 'N/A'}</DrawerDetailValue>
                            </DrawerDetailItem>
                            <DrawerDetailItem>
                              <DrawerDetailLabel>Total Payments</DrawerDetailLabel>
                              <DrawerDetailValue>{getModalValue('total_payments') || 0} KES</DrawerDetailValue>
                            </DrawerDetailItem>
                          </DrawerDetailGrid>
                        </DrawerSection>
                      )}

                      {selectedModalTab === 'documents' && (
                        <DrawerSection>
                          <DrawerSectionTitle>
                            <FileText size={16} />
                            Documents
                          </DrawerSectionTitle>
                          <div style={{ color: '#4b5563', fontSize: '0.95rem' }}>
                            {selectedDeceasedProfile?.documents?.length > 0
                              ? `${selectedDeceasedProfile.documents.length} document${selectedDeceasedProfile.documents.length === 1 ? '' : 's'} available.`
                              : 'No documents attached yet.'}
                          </div>
                        </DrawerSection>
                      )}

                      {selectedModalTab === 'next_of_kin' && (
                        <DrawerSection>
                          <DrawerSectionTitle>
                            <Users size={16} />
                            Next of Kin
                          </DrawerSectionTitle>
                          {selectedDeceasedProfile?.next_of_kin?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {selectedDeceasedProfile.next_of_kin.map((kin, index) => (
                                <div key={index} style={{
                                  padding: '0.75rem',
                                  background: Colors.white,
                                  borderRadius: '0.5rem',
                                  border: `1px solid ${Colors.tableBorder}`
                                }}>
                                  <div style={{ fontWeight: 600, color: Colors.primaryDark, marginBottom: '0.25rem' }}>
                                    {kin.name || `Contact ${index + 1}`}
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: Colors.darkGray }}>
                                    {kin.phone && <div>Phone: {kin.phone}</div>}
                                    {kin.relation && <div>Relation: {kin.relation}</div>}
                                    {kin.email && <div>Email: {kin.email}</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ color: '#4b5563', fontSize: '0.95rem' }}>No next of kin details available.</div>
                          )}
                        </DrawerSection>
                      )}

                      <DrawerActions>
                        <DrawerButton $primary onClick={handleViewMoreClick}>
                          <Eye size={16} />
                          View Full Details
                        </DrawerButton>
                        <DrawerButton onClick={closeProfileModal}>Close</DrawerButton>
                      </DrawerActions>
                    </>
                  )}
                </DrawerBody>
              </DrawerOpen>
            </>
          )}
        </PageGrid>

        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          isExporting={exporting}
          filters={{
            status: statusFilter,
            autopsy: autopsyFilter,
            year: yearFilter,
            search: searchTerm,
          }}
        />
      </ContentWrapper>
    </AppContainer>
  );
};

export default AllDeceasedPage;