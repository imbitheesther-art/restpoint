import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/socketContext';
import { api, ENDPOINTS } from '../../api';
import { Calendar, Clock, Users, FileText, AlertCircle, CheckCircle, XCircle, TrendingUp, X } from 'lucide-react';

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${COLORS.white};
  border-radius: 14px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${COLORS.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${COLORS.text};
  }
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  font-size: 0.9rem;
  color: ${COLORS.text};
  min-height: 150px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 1.5rem;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }
`;

const ModalButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => props.$variant === 'primary' ? `
    background: ${COLORS.primary};
    color: ${COLORS.white};

    &:hover:not(:disabled) {
      background: ${COLORS.primaryLight};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  ` : `
    background: ${COLORS.white};
    color: ${COLORS.text};
    border: 1px solid ${COLORS.border};

    &:hover {
      background: ${COLORS.bg};
    }
  `}
`;

const LeaveDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [usersOnLeave, setUsersOnLeave] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [rejectModal, setRejectModal] = useState({ show: false, leaveId: null, reason: '' });
  const [approveModal, setApproveModal] = useState({ show: false, leaveId: null });
  const [detailModal, setDetailModal] = useState({ show: false, leave: null });
  const { socket, connected } = useSocket();
  const tenantSlug = localStorage.getItem('tenantSlug') || 'default';

  useEffect(() => {
    fetchData();
  }, []);

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

  const fetchData = async () => {
    try {
      const [statsRes, leavesRes, onLeaveRes] = await Promise.all([
        api.get(ENDPOINTS.LEAVE.STATS).catch((err) => {
          console.error('Stats API error:', err);
          return { data: null };
        }),
        api.get(ENDPOINTS.LEAVE.ALL).catch((err) => {
          console.error('All leaves API error:', err);
          return { data: { data: [] } };
        }),
        api.get(ENDPOINTS.LEAVE.USERS_ON_LEAVE).catch((err) => {
          console.error('Users on leave API error:', err);
          return { data: { data: [] } };
        }),
      ]);

      console.log('Stats response:', statsRes);
      console.log('Leaves response:', leavesRes);
      console.log('Users on leave response:', onLeaveRes);

      // Extract data from nested response structure
      const statsData = statsRes?.data?.data || statsRes?.data || null;
      const leavesData = leavesRes?.data?.data || leavesRes?.data || [];
      const usersOnLeaveData = onLeaveRes?.data?.data || onLeaveRes?.data || [];

      setStats(statsData);
      setLeaves(Array.isArray(leavesData) ? leavesData : []);
      setUsersOnLeave(Array.isArray(usersOnLeaveData) ? usersOnLeaveData : []);
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (leaveId) => {
    setApproveModal({ show: true, leaveId });
  };

  const handleApproveConfirm = async () => {
    try {
      await api.patch(ENDPOINTS.LEAVE.UPDATE_STATUS(approveModal.leaveId), {
        status: 'approved',
        approved_by: 1 // TODO: Get from auth context
      });
      setApproveModal({ show: false, leaveId: null });
      fetchData();
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('Failed to approve leave: ' + error.message);
    }
  };

  const handleViewDetails = (leave) => {
    setDetailModal({ show: true, leave });
  };

  const handleReject = async (leaveId) => {
    setRejectModal({ show: true, leaveId, reason: '' });
  };

  const submitRejection = async () => {
    if (!rejectModal.reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await api.patch(ENDPOINTS.LEAVE.UPDATE_STATUS(rejectModal.leaveId), {
        status: 'rejected',
        rejection_reason: rejectModal.reason,
        approved_by: 1
      });
      setRejectModal({ show: false, leaveId: null, reason: '' });
      fetchData();
    } catch (error) {
      console.error('Error rejecting leave:', error);
      alert('Failed to reject leave');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} color={COLORS.success} />;
      case 'rejected': return <XCircle size={16} color={COLORS.danger} />;
      case 'pending': return <Clock size={16} color={COLORS.warning} />;
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

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.textSecondary }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTop: '3px solid #C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p>Loading leave data...</p>
        </div>
      </Container>
    );
  }

  const safeStats = stats || {};
  const safeLeaves = leaves || [];

  return (
    <Container>
      <Header>
        <div>
          <Title>Leave Management Dashboard</Title>
          <Subtitle>Admin dashboard for managing employee leave requests and approvals</Subtitle>
        </div>
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

      {/* Stats */}
      <StatsGrid>
        <StatCard>
          <StatIcon $color={COLORS.info}>
            <FileText size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Total Requests</StatLabel>
            <StatValue>{safeStats.total || 0}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color={COLORS.warning}>
            <Clock size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Pending Approval</StatLabel>
            <StatValue>{safeStats.pending || 0}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color={COLORS.success}>
            <Users size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>On Leave Today</StatLabel>
            <StatValue>{safeStats.on_leave || 0}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color={COLORS.primary}>
            <TrendingUp size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>This Month</StatLabel>
            <StatValue>{safeLeaves.filter(l => {
              const date = new Date(l.created_at);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}</StatValue>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Users On Leave Today */}
      {usersOnLeave.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionTitle>
              <AlertCircle size={20} />
              Currently On Leave
            </SectionTitle>
          </SectionHeader>
          <Table>
            <thead>
              <tr>
                <Th>Employee</Th>
                <Th>Department</Th>
                <Th>Leave Type</Th>
                <Th>Dates</Th>
                <Th>Contact</Th>
              </tr>
            </thead>
            <tbody>
              {usersOnLeave.map((leave) => (
                <Tr key={leave.id}>
                  <Td>{leave.name || 'Unknown'}</Td>
                  <Td>{leave.department || '-'}</Td>
                  <Td>
                    <LeaveTypeBadge $type={leave.leave_type}>
                      {leave.leave_type}
                    </LeaveTypeBadge>
                  </Td>
                  <Td>{formatDate(leave.start_date)} - {formatDate(leave.end_date)}</Td>
                  <Td>{leave.email}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Section>
      )}

      {/* All Leaves */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            <Calendar size={20} />
            Leave Requests
          </SectionTitle>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  background: activeTab === tab ? COLORS.primary : COLORS.white,
                  color: activeTab === tab ? COLORS.white : COLORS.textSecondary,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  textTransform: 'capitalize'
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </SectionHeader>

        {safeLeaves.length === 0 ? (
          <EmptyState>
            <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
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
              {safeLeaves
                .filter(leave => activeTab === 'all' || leave.status === activeTab)
                .map((leave) => (
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {getStatusIcon(leave.status)}
                        <Badge $status={leave.status}>
                          {leave.status}
                        </Badge>
                      </div>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <ActionIcon title="View Details" onClick={() => handleViewDetails(leave)}>
                          <FileText size={16} />
                        </ActionIcon>
                        {leave.status === 'pending' && (
                          <>
                            <ActionIcon title="Approve" onClick={() => handleApproveClick(leave.id)}>
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

      {/* Rejection Modal */}
      {rejectModal.show && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Reject Leave Request</ModalTitle>
              <CloseButton onClick={() => setRejectModal({ show: false, leaveId: null, reason: '' })}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <p style={{ marginBottom: '1rem', color: COLORS.textSecondary }}>
              Please provide a reason for rejecting this leave request:
            </p>
            <ModalTextarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="Enter rejection reason..."
              autoFocus
            />
            <ModalButtonGroup>
              <Button
                type="button"
                onClick={() => setRejectModal({ show: false, leaveId: null, reason: '' })}
              >
                Cancel
              </Button>
              <Button
                type="button"
                $variant="primary"
                onClick={submitRejection}
                disabled={!rejectModal.reason.trim()}
              >
                Reject Leave
              </Button>
            </ModalButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {/* Approve Confirmation Modal */}
      {approveModal.show && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Approve Leave Request</ModalTitle>
              <CloseButton onClick={() => setApproveModal({ show: false, leaveId: null })}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <p style={{ marginBottom: '1rem', color: COLORS.textSecondary }}>
              Are you sure you want to approve this leave request?
            </p>
            <ModalButtonGroup>
              <Button
                type="button"
                onClick={() => setApproveModal({ show: false, leaveId: null })}
              >
                Cancel
              </Button>
              <Button
                type="button"
                $variant="primary"
                onClick={handleApproveConfirm}
              >
                Approve Leave
              </Button>
            </ModalButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {/* Leave Details Modal */}
      {detailModal.show && detailModal.leave && (
        <Modal>
          <ModalContent style={{ maxWidth: '600px' }}>
            <ModalHeader>
              <ModalTitle>Leave Request Details</ModalTitle>
              <CloseButton onClick={() => setDetailModal({ show: false, leave: null })}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, color: COLORS.text }}>
                Employee Information
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: COLORS.bg, borderRadius: '8px' }}>
                  <span style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>Name:</span>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{detailModal.leave.name || 'Unknown'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: COLORS.bg, borderRadius: '8px' }}>
                  <span style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>Email:</span>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{detailModal.leave.email || '-'}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, color: COLORS.text }}>
                Leave Details
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: COLORS.bg, borderRadius: '8px' }}>
                  <span style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>Leave Type:</span>
                  <LeaveTypeBadge $type={detailModal.leave.leave_type}>{detailModal.leave.leave_type}</LeaveTypeBadge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: COLORS.bg, borderRadius: '8px' }}>
                  <span style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>Start Date:</span>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{formatDate(detailModal.leave.start_date)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: COLORS.bg, borderRadius: '8px' }}>
                  <span style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>End Date:</span>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{formatDate(detailModal.leave.end_date)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: COLORS.bg, borderRadius: '8px' }}>
                  <span style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>Total Days:</span>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{detailModal.leave.days} days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: COLORS.bg, borderRadius: '8px' }}>
                  <span style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>Status:</span>
                  <Badge $status={detailModal.leave.status}>{detailModal.leave.status}</Badge>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, color: COLORS.text }}>
                Reason
              </h3>
              <div style={{ padding: '0.75rem', background: COLORS.bg, borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {detailModal.leave.reason || 'No reason provided'}
              </div>
            </div>

            {detailModal.leave.supporting_document && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, color: COLORS.text }}>
                  Supporting Document
                </h3>
                <a
                  href={detailModal.leave.supporting_document}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: COLORS.bg,
                    borderRadius: '8px',
                    color: COLORS.primary,
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  <FileText size={16} />
                  View Document
                </a>
              </div>
            )}

            {detailModal.leave.rejection_reason && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, color: COLORS.danger }}>
                  Rejection Reason
                </h3>
                <div style={{ padding: '0.75rem', background: '#FEE2E2', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.5', color: '#991B1B' }}>
                  {detailModal.leave.rejection_reason}
                </div>
              </div>
            )}

            <ModalButtonGroup>
              <Button
                type="button"
                onClick={() => setDetailModal({ show: false, leave: null })}
              >
                Close
              </Button>
            </ModalButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default LeaveDashboard;