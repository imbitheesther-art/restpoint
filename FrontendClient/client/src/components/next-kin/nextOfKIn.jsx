import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Users, Plus, Edit, Trash2, Phone, Mail, MapPin, User, AlertCircle, RefreshCw } from '../../utils/icons/icons';
import axios from 'axios';

const API_GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_GATEWAY_URL}/api/v1/restpoint`;

// Bootstrap-inspired color scheme
const COLORS = {
  primary: '#1a5f7a',
  primaryLight: '#2c8ac9',
  primaryDark: '#134b5f',
  white: '#FFFFFF',
  bg: '#f5f7fa',
  surface: '#ffffff',
  border: '#d1d5db',
  borderLight: '#e5e7eb',
  text: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  success: '#10b981',
  successLight: '#d1fae5',
  successDark: '#059669',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningDark: '#d97706',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  dangerDark: '#dc2626',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  infoDark: '#2563eb',
  accent: '#3b82f6',
  accentHover: '#2563eb',
  accentGlow: 'rgba(59, 130, 246, 0.1)',
  radius: '8px',
  radiusSm: '6px',
  radiusXs: '4px',
  shadowSm: '0 1px 2px rgba(0, 0, 0, 0.04)',
  shadowMd: '0 4px 6px rgba(0, 0, 0, 0.06)',
  shadowLg: '0 10px 15px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.15s ease',
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  animation: ${fadeIn} 0.25s ease-out;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1.5rem;
  color: ${COLORS.textSecondary};

  svg {
    width: 2.5rem;
    height: 2.5rem;
    margin-bottom: 0.75rem;
    opacity: 0.4;
  }

  h4 {
    font-size: 0.9375rem;
    font-weight: 600;
    margin: 0 0 0.375rem;
    color: ${COLORS.text};
  }

  p {
    font-size: 0.8125rem;
    margin: 0;
    color: ${COLORS.textSecondary};
  }
`;

const KinCard = styled.div`
  background: ${COLORS.bg};
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  padding: 1rem;
  margin-bottom: 0.75rem;
  transition: ${COLORS.transition};

  &:hover {
    border-color: ${COLORS.primary};
    box-shadow: 0 2px 6px rgba(26, 95, 122, 0.06);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const KinHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const KinName = styled.div`
  font-weight: 600;
  font-size: 0.9375rem;
  color: ${COLORS.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RelationshipBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${COLORS.primaryLight}20;
  color: ${COLORS.primaryDark};
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-size: 0.8125rem;
  color: ${COLORS.textSecondary};

  svg {
    width: 14px;
    height: 14px;
    color: ${COLORS.primary};
    flex-shrink: 0;
  }

  a {
    color: ${COLORS.primary};
    text-decoration: none;
    transition: ${COLORS.transition};

    &:hover {
      color: ${COLORS.primaryDark};
      text-decoration: underline;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.375rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${COLORS.border};
`;

const ActionButton = styled.button`
  background: ${COLORS.surface};
  color: ${COLORS.text};
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusXs};
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: ${COLORS.transition};

  &:hover {
    background: ${props => props.$danger ? COLORS.danger : COLORS.primary};
    color: ${COLORS.white};
    border-color: ${props => props.$danger ? COLORS.danger : COLORS.primary};
  }
`;

const PrimaryButton = styled.button`
  background: ${COLORS.primary};
  color: ${COLORS.white};
  border: none;
  border-radius: ${COLORS.radiusSm};
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  transition: ${COLORS.transition};
  box-shadow: ${COLORS.shadowSm};

  &:hover {
    background: ${COLORS.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${COLORS.shadowMd};
  }
`;

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

const NextOfKinSection = ({ nextOfKin = [], deceasedName, onUpdate }) => {
  const [kinList, setKinList] = useState(nextOfKin);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setKinList(nextOfKin);
  }, [nextOfKin]);

  const handleDelete = async (kinId) => {
    if (!window.confirm('Are you sure you want to remove this next of kin?')) {
      return;
    }

    setIsLoading(true);
    try {
      const tenantSlug = getTenantSlug();
      await axios.delete(`${BASE_URL}/next-of-kin/${kinId}`, {
        headers: {
          'x-tenant-slug': tenantSlug,
        },
      });

      setKinList(prev => prev.filter(kin => kin.kin_id !== kinId && kin.id !== kinId));
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting next of kin:', error);
      alert('Failed to remove next of kin');
    } finally {
      setIsLoading(false);
    }
  };

  if (!kinList || kinList.length === 0) {
    return (
      <Container>
        <EmptyState>
          <Users size={48} />
          <h4>No Next of Kin Added</h4>
          <p>Add family members or next of kin for {deceasedName || 'the deceased'}</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      {kinList.map((kin) => (
        <KinCard key={kin.kin_id || kin.id}>
          <KinHeader>
            <KinName>
              <User size={16} color={COLORS.primary} />
              {kin.full_name || 'Unknown'}
            </KinName>
            <RelationshipBadge>
              {kin.relationship || 'Family'}
            </RelationshipBadge>
          </KinHeader>

          {kin.phone && (
            <ContactItem>
              <Phone size={14} />
              <a href={`tel:${kin.phone}`}>{kin.phone}</a>
            </ContactItem>
          )}

          {kin.email && (
            <ContactItem>
              <Mail size={14} />
              <a href={`mailto:${kin.email}`}>{kin.email}</a>
            </ContactItem>
          )}

          {kin.address && (
            <ContactItem>
              <MapPin size={14} />
              <span>{kin.address}</span>
            </ContactItem>
          )}

          <ActionButtons>
            <ActionButton onClick={() => handleDelete(kin.kin_id || kin.id)} $danger>
              <Trash2 size={14} /> Remove
            </ActionButton>
          </ActionButtons>
        </KinCard>
      ))}
    </Container>
  );
};

export default NextOfKinSection;