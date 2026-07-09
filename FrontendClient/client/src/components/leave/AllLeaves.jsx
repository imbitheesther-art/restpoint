import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSocket } from '../../context/socketContext';
import { api, ENDPOINTS } from '../../api';
import { Calendar, Clock, Users, FileText, AlertCircle, CheckCircle, XCircle, TrendingUp, Filter } from 'lucide-react';

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
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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

const ActionButton = styled.button`
  background: ${COLORS.primary};
  color: ${COLORS.white};
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: ${COLORS.primaryLight};
  }
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
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${COLORS.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${COLORS.bg};
  border-bottom: 1px solid ${COLORS.border};
`;

const Td = styled.td`
  padding: 1rem 1.5rem;
  font-size: 0.9rem;
  color: ${COLORS.text};
  border-bottom: 1px solid ${COLORS.border};
`;

const Tr = styled.tr`
  &:hover {
    background: ${COLORS.bg};
  }

  &:last-child td {
    border-bottom: none;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
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

const LeaveTypeBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
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

const ActionIcon = styled.button`
  background: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: ${COLORS.textSecondary};
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.bg};
    color: ${props => props.$danger ? COLORS.danger : COLORS.primary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${COLORS.textSecondary};
`;

const FilterBar = styled.div`
  padding: 1rem 1.5rem;
  background: ${COLORS.bg};
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  font-size: 0.9rem;
  color: ${COLORS.text};
  background: ${COLORS.white};
  cursor: pointer;
`;

const AllLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    leave_type: '',
    start_date: '',
    end_date: ''
  });
  const { socket, connected } = useSocket();

  useEffect(() => {
    fetchLeaves();
  }, [filters]);

  // Real-time socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleLeaveCreated = (leave) => {
      if (leave) setLeaves(prev => [leave, ...(prev || [])]);
    };

    const handleLeaveUpdated = (leave) => {
      if (leave) setLeaves(prev => (prev || []).map(l => l && l.id === leave.id ? leave : l));
    };

    socket.on('leave:created', handleLeaveCreated);
    socket.on('leave:updated', handleLeaveUpdated);

    return () => {
      socket.off('leave:created', handleLeaveCreated);
      socket.off('leave:updated', handleLeaveUpdated);
    };
  }, [socket]);

  const fetchLeaves = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.leave_type) params.append('leave_type', filters.leave_type);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const response = await api.get(`${ENDPOINTS.LEAVE.ALL}?${params.toString()}`);
      setLeaves(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      await api.patch(ENDPOINTS.LEAVE.UPDATE_STATUS(leaveId), {
        status: 'approved',
        approved_by: 1
      });
      fetchLeaves();
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('Failed to approve leave');
    }
  };

  const handleReject = async (leaveId) => {
    try {
      const reason = prompt('Enter rejection reason:');
      if (!reason) return;

      await api.patch(ENDPOINTS.LEAVE.UPDATE_STATUS(leaveId), {
        status: 'rejected',
        rejection_reason: reason,
        approved_by: 1
      });
      fetchLeaves();
    } catch (error) {
      console.error('Error rejecting leave:', error);
      alert('Failed to reject leave');
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

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.textSecondary }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTop: '3px solid #C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p>Loading leaves...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <Title>All Leave Requests</Title>
          <Subtitle>View and manage all employee leave requests</Subtitle>
        </div>
        <ActionButton onClick={() => window.location.href = '/leaves/apply'}>
          <Calendar size={18} />
          Apply for Leave
        </ActionButton>
      </Header>

      {!connected && (
        <div style={{
          padding: '0.75rem 1rem',
          background: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '8px',
          marginBottom: '1rem',
          color: '#92400E',
          fontSize: '0.9rem'
        }}>
          ⚠️ Real-time updates disconnected. Changes may not sync automatically.
        </div>
      )}

      <Section>
        <SectionHeader>
          <SectionTitle>
            <FileText size={20} />
            Leave Requests ({leaves.length})
          </SectionTitle>
        </SectionHeader>

        <FilterBar>
          <FilterSelect
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </FilterSelect>

          <FilterSelect
            value={filters.leave_type}
            onChange={(e) => setFilters({ ...filters, leave_type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="annual">Annual</option>
            <option value="sick">Sick</option>
            <option value="maternity">Maternity</option>
            <option value="paternity">Paternity</option>
            <option value="compassionate">Compassionate</option>
            <option value="study">Study</option>
            <option value="unpaid">Unpaid</option>
          </FilterSelect>

          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
            placeholder="Start date"
          />

          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
            placeholder="End date"
          />
        </FilterBar>

        {leaves.length === 0 ? (
          <EmptyState>
            <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>No leave requests found.</p>
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Employee</Th>
                <Th>Leave Type</Th>
                <Th>Dates</Th>
                <Th>Days</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <Tr key={leave.id}>
                  <Td>
                    <div>
                      <div style={{ fontWeight: 500 }}>{leave.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>{leave.email}</div>
                    </div>
                  </Td>
                  <Td>
                    <LeaveTypeBadge $type={leave.leave_type}>
                      {leave.leave_type}
                    </LeaveTypeBadge>
                  </Td>
                  <Td>
                    <div style={{ fontSize: '0.85rem' }}>
                      {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                    </div>
                  </Td>
                  <Td>{leave.days}</Td>
                  <Td>
                    <Badge $status={leave.status}>
                      {leave.status}
                    </Badge>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {leave.status === 'pending' && (
                        <>
                          <ActionIcon title="Approve" onClick={() => handleApprove(leave.id)}>
                            <CheckCircle size={16} color={COLORS.success} />
                          </ActionIcon>
                          <ActionIcon title="Reject" $danger onClick={() => handleReject(leave.id)}>
                            <XCircle size={16} color={COLORS.danger} />
                          </ActionIcon>
                        </>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    </Container>
  );
};

export default AllLeaves;