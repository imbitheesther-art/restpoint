import React from 'react';
import styled from 'styled-components';








import { COLORS } from '../styles/theme.jsx';

const Section = styled.div`
  background: ${COLORS.cardBg};
  border-radius: 14px;
  border: 1px solid ${COLORS.border};
  margin-bottom: 1.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
`;

const SectionHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 1rem; font-weight: 600; color: ${COLORS.text};
  margin: 0; display: flex; align-items: center; gap: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  padding: 1.25rem;
`;

const ActionBtn = styled.button`
  padding: 1rem;
  border: 1px solid ${COLORS.border};
  border-radius: 12px;
  background: ${COLORS.cardBg};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  font-family: inherit;
  &:hover {
    border-color: ${COLORS.accent};
    background: ${COLORS.accent}08;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212,168,67,0.15);
  }
  svg { color: ${COLORS.accent}; transition: transform 0.2s; }
  &:hover svg { transform: scale(1.1); }
`;

const Label = styled.span`
  font-size: 0.75rem; font-weight: 500;
  color: ${COLORS.textSecondary}; text-align: center;
`;

const QuickActions = ({ onNewOrder, onPrintJobCard, onDesignStudio, onStockIntake, onAssignWorker, onViewDetails, onAnalytics }) => {
  const actions = [
    { icon: Plus, label: 'New Order', onClick: onNewOrder },
    { icon: Printer, label: 'Print Job Card', onClick: onPrintJobCard },
    { icon: FileImage, label: 'Design Studio', onClick: onDesignStudio },
    { icon: Package, label: 'Stock Intake', onClick: onStockIntake },
    { icon: Users, label: 'Assign Worker', onClick: onAssignWorker },
    { icon: Eye, label: 'View Details', onClick: onViewDetails },
    { icon: BarChart3, label: 'Analytics', onClick: onAnalytics },
  ];
  return (
    <Section>
      <SectionHeader>
        <SectionTitle><BarChart3 size={18} /> Quick Actions</SectionTitle>
      </SectionHeader>
      <Grid>
        {actions.map((a, i) => (
          <ActionBtn key={i} onClick={a.onClick}>
            <a.icon size={24} />
            <Label>{a.label}</Label>
          </ActionBtn>
        ))}
      </Grid>
    </Section>
  );
};

export default QuickActions;