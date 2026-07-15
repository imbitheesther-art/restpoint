import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { api, ENDPOINTS } from '../../api';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';

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
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background: ${COLORS.white};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 0.625rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLORS.text};
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.bg};
    color: ${COLORS.primary};
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${COLORS.text};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${COLORS.textSecondary};
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${COLORS.white};
  padding: 1.25rem;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid ${COLORS.border};
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color || COLORS.primary};
  color: ${COLORS.white};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.p`
  font-size: 0.7rem;
  color: ${COLORS.textSecondary};
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
`;

const StatValue = styled.p`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${COLORS.text};
  margin: 0;
`;

const Section = styled.div`
  background: ${COLORS.white};
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid ${COLORS.border};
  margin-bottom: 2rem;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${COLORS.border};
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LeavesList = styled.div`
  padding: 1.5rem;
`;

const LeaveCard = styled.div`
  padding: 1.25rem;
  border: 1px solid ${COLORS.border};
  border-radius: 12px;
  margin-bottom: 1rem;
  background: ${COLORS.white};
  transition: all 0.2s;

  &:hover {
    border-color: ${COLORS.primary};
    box-shadow: 0 4px 12px rgba(10, 36, 99, 0.08);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const LeaveCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
`;

const LeaveCardTitle = styled.div`
  flex: 1;
`;

const LeaveType = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${COLORS.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`;

const LeaveDates = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${COLORS.text};
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'approved': return '#D1FAE5';
      case 'rejected': return '#FEE2E2';
      case 'pending': return '#FEF3C7';
      case 'cancelled': return '#F3F4F6';
      default: return COLORS.bg;
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'approved': return '#065F46';
      case 'rejected': return '#991B1B';
      case 'pending': return '#92400E';
      case 'cancelled': return '#6B7280';
      default: return COLORS.textSecondary;
    }
  }};
`;

const LeaveCardContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const InfoItem = styled.div`
  padding: 0.75rem;
  background: ${COLORS.bg};
  border-radius: 8px;
`;

const InfoLabel = styled.div`
  font-size: 0.7rem;
  color: ${COLORS.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 0.95rem;
  color: ${COLORS.text};
  font-weight: 500;
`;

const ReasonBox = styled.div`
  padding: 0.75rem;
  background: ${COLORS.bg};
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${COLORS.text};
  margin-bottom: 1rem;
`;

const RejectionReasonBox = styled.div`
  padding: 0.75rem;
  background: #FEE2E2;
  border-left: 4px solid ${COLORS.danger};
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #991B1B;
  margin-bottom: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${COLORS.textSecondary};
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${COLORS.textSecondary};
`;

const getStatusIcon = (status) => {
  switch (status) {
    case 'approved': return <CheckCircle size={20} color="#10B981" />;
    case 'rejected': return <XCircle size={20} color="#E74C3C" />;
    case 'pending': return <Clock size={20} color="#F59E0B" />;
    default: return null;
  }
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const MyLeaves = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const tenantSlug = localStorage.getItem('tenantSlug') || 'system_shared';

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id ||
        JSON.parse(localStorage.getItem('user') || '{}').userId || 1;

      // Get tenant slug from localStorage
      const tenantSlug = localStorage.getItem('tenantSlug') || 'system_shared';

      const response = await api.get(ENDPOINTS.LEAVE.MY_LEAVES(tenantSlug));

      const leavesData = Array.isArray(response?.data?.data) ? response.data.data : [];
      setLeaves(leavesData);

      // Calculate stats
      const newStats = {
        total: leavesData.length,
        pending: leavesData.filter(l => l.status === 'pending').length,
        approved: leavesData.filter(l => l.status === 'approved').length,
        rejected: leavesData.filter(l => l.status === 'rejected').length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching my leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Loading>
          <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTop: '3px solid #C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p>Loading your leave requests...</p>
        </Loading>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(`/leaves/${tenantSlug}/apply`)} title="Go back to Apply Leave">
          <ArrowLeft size={20} />
        </BackButton>
        <HeaderContent>
          <Title>My Leave Applications</Title>
          <Subtitle>View all your leave requests and their status</Subtitle>
        </HeaderContent>
      </Header>

      {/* Stats */}
      <StatsGrid>
        <StatCard>
          <StatIcon $color={COLORS.info}>
            <Calendar size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Total Requests</StatLabel>
            <StatValue>{stats.total}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color={COLORS.warning}>
            <Clock size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Pending</StatLabel>
            <StatValue>{stats.pending}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color={COLORS.success}>
            <CheckCircle size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Approved</StatLabel>
            <StatValue>{stats.approved}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color={COLORS.danger}>
            <XCircle size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Rejected</StatLabel>
            <StatValue>{stats.rejected}</StatValue>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Leave Requests */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            <Calendar size={20} />
            Your Leave Requests
          </SectionTitle>
        </SectionHeader>

        {leaves.length === 0 ? (
          <EmptyState>
            <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>No leave requests found. <a href="/leaves/apply" style={{ color: COLORS.primary }}>Apply for leave now</a></p>
          </EmptyState>
        ) : (
          <LeavesList>
            {leaves.map((leave) => (
              <LeaveCard key={leave.id}>
                <LeaveCardHeader>
                  <LeaveCardTitle>
                    <LeaveType>{leave.leave_type}</LeaveType>
                    <LeaveDates>
                      {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                    </LeaveDates>
                  </LeaveCardTitle>
                  <Badge $status={leave.status}>
                    {getStatusIcon(leave.status)}
                    {leave.status}
                  </Badge>
                </LeaveCardHeader>

                <LeaveCardContent>
                  <InfoItem>
                    <InfoLabel>Total Days</InfoLabel>
                    <InfoValue>{leave.days} days</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Applied On</InfoLabel>
                    <InfoValue>{formatDate(leave.created_at)}</InfoValue>
                  </InfoItem>
                  {leave.approved_at && (
                    <InfoItem>
                      <InfoLabel>Approved On</InfoLabel>
                      <InfoValue>{formatDate(leave.approved_at)}</InfoValue>
                    </InfoItem>
                  )}
                  {leave.is_half_day && (
                    <InfoItem>
                      <InfoLabel>Type</InfoLabel>
                      <InfoValue>Half Day</InfoValue>
                    </InfoItem>
                  )}
                </LeaveCardContent>

                {leave.reason && (
                  <>
                    <InfoLabel style={{ marginBottom: '0.5rem' }}>Reason</InfoLabel>
                    <ReasonBox>
                      {leave.reason}
                    </ReasonBox>
                  </>
                )}

                {leave.rejection_reason && (
                  <>
                    <InfoLabel style={{ marginBottom: '0.5rem' }}>Rejection Reason</InfoLabel>
                    <RejectionReasonBox>
                      {leave.rejection_reason}
                    </RejectionReasonBox>
                  </>
                )}
              </LeaveCard>
            ))}
          </LeavesList>
        )}
      </Section>
    </Container>
  );
};

export default MyLeaves;
