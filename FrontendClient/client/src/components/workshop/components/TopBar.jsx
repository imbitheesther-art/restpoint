import React from 'react';
import styled from 'styled-components';
import { Bell, Settings, Activity } from '../../utils/icons/icons';
import { COLORS, LiveDot } from '../styles/theme.jsx';

// ============================================================
// TOP BAR - Workshop header with branding and status
// ============================================================

const TopBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%);
  border-radius: 16px;
  color: ${COLORS.white};
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%);
    border-radius: 50%;
  }

  &:after {
    content: '🔨';
    position: absolute;
    right: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 4rem;
    opacity: 0.15;
  }
`;

const BrandSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1;
`;

const LogoIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${COLORS.accent};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(212,168,67,0.3);
`;

const BrandText = styled.div`
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
  }
  p {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.7);
    margin: 0;
  }
`;

const TopActions = styled.div`
  display: flex;
  gap: 0.75rem;
  z-index: 1;
`;

const TopButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
  color: ${COLORS.white};
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255,255,255,0.2);
    border-color: rgba(255,255,255,0.3);
  }
`;

const TopBar = ({ connected, onRefresh, onSettings }) => {
  return (
    <TopBarContainer>
      <BrandSection>
        <LogoIcon>🔨</LogoIcon>
        <BrandText>
          <h1>Workshop Production Floor</h1>
          <p>Coffin Manufacturing & Custom Design Facility</p>
        </BrandText>
      </BrandSection>
      <TopActions>
        {!connected && (
          <TopButton style={{ borderColor: COLORS.warning, color: COLORS.warning }}>
            <Activity size={14} /> Offline
          </TopButton>
        )}
        {connected && (
          <TopButton style={{ borderColor: COLORS.successBg, color: COLORS.successBg }}>
            <LiveDot $active /> Live
          </TopButton>
        )}
        <TopButton onClick={onRefresh}><Activity size={14} /></TopButton>
        <TopButton onClick={onSettings}><Bell size={14} /></TopButton>
        <TopButton onClick={onSettings}><Settings size={14} /></TopButton>
      </TopActions>
    </TopBarContainer>
  );
};

export default TopBar;