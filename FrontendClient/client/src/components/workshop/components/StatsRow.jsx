import React from 'react';
import styled from 'styled-components';
import { ClipboardList, Hammer, DollarSign, Clock, Package, Users } from 'lucide-react';
import { COLORS } from '../styles/theme.jsx';

// ============================================================
// STATS ROW - Dashboard statistics cards from real data
// ============================================================

const StatsRowContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: ${COLORS.cardBg};
  border-radius: 14px;
  padding: 1.25rem;
  border: 1px solid ${COLORS.border};
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.$color || COLORS.primary};
    border-radius: 0 2px 2px 0;
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color || COLORS.primary}15;
  color: ${props => props.$color || COLORS.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.p`
  font-size: 0.7rem;
  color: ${COLORS.textMuted};
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
`;

const StatValue = styled.p`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${COLORS.text};
  margin: 0;
  line-height: 1.2;
`;

const StatSub = styled.div`
  font-size: 0.7rem;
  color: ${COLORS.textMuted};
  margin-top: 0.15rem;
`;

const StatsRow = ({ stats }) => {
  const statConfigs = [
    { label: 'Total Orders', value: stats?.totalOrders || 0, sub: `${stats?.todayCompleted || 0} completed today`, icon: ClipboardList, color: COLORS.primary },
    { label: 'In Production', value: stats?.inProductionOrders || 0, sub: `${stats?.completedOrders || 0} total completed`, icon: Hammer, color: COLORS.accent },
    { label: 'Revenue', value: `KES ${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`, sub: 'From all orders', icon: DollarSign, color: COLORS.success },
    { label: 'Active Orders', value: stats?.activeOrders || 0, sub: 'Currently in progress', icon: Clock, color: COLORS.stationDesign },
    { label: 'Materials', value: stats?.totalMaterials || 0, sub: `${stats?.lowStockMaterials || 0} low stock`, icon: Package, color: COLORS.info },
    { label: 'Workers', value: stats?.totalWorkers || 0, sub: 'Available workforce', icon: Users, color: COLORS.stationPolishing },
  ];

  return (
    <StatsRowContainer>
      {statConfigs.map((stat, i) => (
        <StatCard key={i} $color={stat.color}>
          <StatIcon $color={stat.color}>
            <stat.icon size={24} />
          </StatIcon>
          <StatInfo>
            <StatLabel>{stat.label}</StatLabel>
            <StatValue>{stat.value}</StatValue>
            <StatSub>{stat.sub}</StatSub>
          </StatInfo>
        </StatCard>
      ))}
    </StatsRowContainer>
  );
};

export default StatsRow;