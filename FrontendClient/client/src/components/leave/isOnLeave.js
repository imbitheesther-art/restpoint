import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSocket } from '../../utils/context/socketContext';
import { api, ENDPOINTS } from '../../api';
import { Users, AlertCircle, Calendar } from '../../utils/icons/icons';

const COLORS = {
  primary: '#0A2463',
  primaryLight: '#1A3A7A',
  white: '#FFFFFF',
  bg: '#F5F7FA',
  border: '#E8ECF0',
  text: '#1A1D24',
  textSecondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#E74C3C',
  info: '#3B82F6',
};

const Container = styled.div`
  background: ${COLORS.white};
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid ${COLORS.border};
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.$color || COLORS.warning};
  color: ${COLORS.white};
`;

const LeaveItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: ${COLORS.bg};
  margin-bottom: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #E8ECF0;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${COLORS.primary};
  color: ${COLORS.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
`;

const LeaveInfo = styled.div`
  flex: 1;
`;

const LeaveName = styled.div`
  font-weight: 500;
  color: ${COLORS.text};
  font-size: 0.9rem;
`;

const LeaveDetails = styled.div`
  font-size: 0.8rem;
  color: ${COLORS.textSecondary};
  margin-top: 0.25rem;
`;

const LeaveTypeTag = styled.span`
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  background: ${props => {
    switch (props.$type) {
      case 'sick': return '#FEE2E2';
      case 'maternity': return '#FCE7F3';
      case 'paternity': return '#DBEAFE';
      case 'annual': return '#D1FAE5';
      default: return COLORS.bg;
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'sick': return '#991B1B';
      case 'maternity': return '#9D174D';
      case 'paternity': return '#1E40AF';
      case 'annual': return '#065F46';
      default: return COLORS.textSecondary;
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${COLORS.textSecondary};
`;

const IsOnLeaveWidget = () => {
  const [usersOnLeave, setUsersOnLeave] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket, connected } = useSocket();

  useEffect(() => {
    fetchUsersOnLeave();
  }, []);

  // Real-time socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleLeaveUpdated = (leave) => {
      if (leave && leave.status === 'approved') {
        fetchUsersOnLeave();
      }
    };

    socket.on('leave:updated', handleLeaveUpdated);

    return () => {
      socket.off('leave:updated', handleLeaveUpdated);
    };
  }, [socket]);

  const fetchUsersOnLeave = async () => {
    try {
      const response = await api.get(ENDPOINTS.LEAVE.USERS_ON_LEAVE);
      setUsersOnLeave(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching users on leave:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: COLORS.textSecondary }}>
          <div style={{ width: '30px', height: '30px', border: '3px solid #E5E7EB', borderTop: '3px solid #C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p>Loading...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <AlertCircle size={20} color={COLORS.warning} />
          Currently On Leave
        </Title>
        <Badge $color={COLORS.warning}>
          <Users size={12} />
          {usersOnLeave.length}
        </Badge>
      </Header>

      {!connected && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '6px',
          marginBottom: '1rem',
          color: '#92400E',
          fontSize: '0.8rem'
        }}>
          ⚠️ Real-time updates disconnected
        </div>
      )}

      {usersOnLeave.length === 0 ? (
        <EmptyState>
          <Calendar size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
          <p style={{ fontSize: '0.9rem' }}>No one is on leave today</p>
        </EmptyState>
      ) : (
        <div>
          {usersOnLeave.map((leave) => (
            <LeaveItem key={leave.id}>
              <Avatar>
                {getInitials(leave.first_name, leave.last_name)}
              </Avatar>
              <LeaveInfo>
                <LeaveName>
                  {leave.first_name} {leave.last_name}
                </LeaveName>
                <LeaveDetails>
                  {leave.department || 'No department'} • {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                </LeaveDetails>
              </LeaveInfo>
              <LeaveTypeTag $type={leave.leave_type}>
                {leave.leave_type}
              </LeaveTypeTag>
            </LeaveItem>
          ))}
        </div>
      )}
    </Container>
  );
};

export default IsOnLeaveWidget;