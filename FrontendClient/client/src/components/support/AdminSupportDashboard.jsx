import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api, ENDPOINTS } from '../../api';
import { MessageSquare, Clock, CheckCircle, AlertCircle, Send, X, Eye, RefreshCw, Filter } from 'lucide-react';

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

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

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

const Card = styled.div`
  background: ${COLORS.white};
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid ${COLORS.border};
  padding: 2rem;
  margin-bottom: 1.5rem;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.625rem 0.875rem;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  font-size: 0.9rem;
  color: ${COLORS.text};
  background: ${COLORS.white};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${COLORS.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${COLORS.bg};
  border-bottom: 1px solid ${COLORS.border};
`;

const Td = styled.td`
  padding: 1rem;
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
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
        switch (props.$status) {
            case 'open': return '#FEF3C7';
            case 'in_progress': return '#DBEAFE';
            case 'resolved': return '#D1FAE5';
            case 'closed': return '#F3F4F6';
            default: return COLORS.bg;
        }
    }};
  color: ${props => {
        switch (props.$status) {
            case 'open': return '#92400E';
            case 'in_progress': return '#1E40AF';
            case 'resolved': return '#065F46';
            case 'closed': return '#6B7280';
            default: return COLORS.textSecondary;
        }
    }};
`;

const PriorityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
        switch (props.$priority) {
            case 'urgent': return '#FEE2E2';
            case 'high': return '#FED7AA';
            case 'medium': return '#FEF3C7';
            case 'low': return '#D1FAE5';
            default: return COLORS.bg;
        }
    }};
  color: ${props => {
        switch (props.$priority) {
            case 'urgent': return '#991B1B';
            case 'high': return '#9A3412';
            case 'medium': return '#92400E';
            case 'low': return '#065F46';
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
  max-width: 700px;
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

  &:hover {
    color: ${COLORS.text};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${COLORS.textSecondary};

  svg {
    margin-bottom: 1rem;
    opacity: 0.3;
  }
`;

const AdminSupportDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await api.get(ENDPOINTS.SUPPORT.ALL_TICKETS);
            if (response?.data?.success) {
                setTickets(response.data.tickets || []);
            }
        } catch (err) {
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewTicket = async (ticket) => {
        setSelectedTicket(ticket);
        try {
            const response = await api.get(`${ENDPOINTS.SUPPORT.TICKETS}/${ticket.ticket_id}/replies`);
            if (response?.data?.success) {
                setReplies(response.data.replies || []);
            }
        } catch (err) {
            console.error('Error fetching replies:', err);
        }
    };

    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            await api.patch(`${ENDPOINTS.SUPPORT.TICKETS}/${ticketId}/status`, { status: newStatus });
            fetchTickets();
            if (selectedTicket && selectedTicket.ticket_id === ticketId) {
                setSelectedTicket({ ...selectedTicket, status: newStatus });
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        try {
            await api.post(`${ENDPOINTS.SUPPORT.TICKETS}/${selectedTicket.ticket_id}/reply`, {
                message: replyMessage,
                userType: 'admin'
            });

            setReplyMessage('');
            const response = await api.get(`${ENDPOINTS.SUPPORT.TICKETS}/${selectedTicket.ticket_id}/replies`);
            if (response?.data?.success) {
                setReplies(response.data.replies || []);
            }
        } catch (err) {
            console.error('Error adding reply:', err);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open': return <AlertCircle size={16} color={COLORS.warning} />;
            case 'in_progress': return <Clock size={16} color={COLORS.info} />;
            case 'resolved': return <CheckCircle size={16} color={COLORS.success} />;
            case 'closed': return <CheckCircle size={16} color={COLORS.textSecondary} />;
            default: return null;
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredTickets = tickets.filter(ticket => {
        if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
        if (filterPriority !== 'all' && ticket.priority !== filterPriority) return false;
        return true;
    });

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        in_progress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
    };

    if (loading) {
        return (
            <Container>
                <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.textSecondary }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTop: '3px solid #C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                    <p>Loading tickets...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <div>
                    <Title>Support Dashboard</Title>
                    <Subtitle>Manage and respond to support tickets</Subtitle>
                </div>
                <Button $variant="primary" onClick={fetchTickets}>
                    <RefreshCw size={18} />
                    Refresh
                </Button>
            </Header>

            {/* Stats */}
            <StatsGrid>
                <StatCard>
                    <StatIcon $color={COLORS.info}>
                        <MessageSquare size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatLabel>Total Tickets</StatLabel>
                        <StatValue>{stats.total}</StatValue>
                    </StatContent>
                </StatCard>

                <StatCard>
                    <StatIcon $color={COLORS.warning}>
                        <AlertCircle size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatLabel>Open</StatLabel>
                        <StatValue>{stats.open}</StatValue>
                    </StatContent>
                </StatCard>

                <StatCard>
                    <StatIcon $color={COLORS.primary}>
                        <Clock size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatLabel>In Progress</StatLabel>
                        <StatValue>{stats.in_progress}</StatValue>
                    </StatContent>
                </StatCard>

                <StatCard>
                    <StatIcon $color={COLORS.success}>
                        <CheckCircle size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatLabel>Resolved</StatLabel>
                        <StatValue>{stats.resolved}</StatValue>
                    </StatContent>
                </StatCard>
            </StatsGrid>

            {/* Filters */}
            <Card>
                <FilterBar>
                    <FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </FilterSelect>

                    <FilterSelect value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                        <option value="all">All Priority</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </FilterSelect>
                </FilterBar>

                {filteredTickets.length === 0 ? (
                    <EmptyState>
                        <MessageSquare size={48} />
                        <p>No tickets found.</p>
                    </EmptyState>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <Th>Ticket ID</Th>
                                <Th>Tenant</Th>
                                <Th>Subject</Th>
                                <Th>Priority</Th>
                                <Th>Status</Th>
                                <Th>Created</Th>
                                <Th>Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTickets.map((ticket) => (
                                <Tr key={ticket.ticket_id}>
                                    <Td>#{ticket.ticket_id}</Td>
                                    <Td>{ticket.tenant_name || ticket.tenant_slug}</Td>
                                    <Td>{ticket.subject}</Td>
                                    <Td>
                                        <PriorityBadge $priority={ticket.priority || 'medium'}>
                                            {ticket.priority || 'medium'}
                                        </PriorityBadge>
                                    </Td>
                                    <Td>
                                        <Badge $status={ticket.status}>
                                            {getStatusIcon(ticket.status)}
                                            {ticket.status.replace('_', ' ')}
                                        </Badge>
                                    </Td>
                                    <Td>{formatDate(ticket.created_at)}</Td>
                                    <Td>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <ActionIcon title="View Details" onClick={() => handleViewTicket(ticket)}>
                                                <Eye size={16} />
                                            </ActionIcon>
                                        </div>
                                    </Td>
                                </Tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <Modal>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Ticket #{selectedTicket.ticket_id}</ModalTitle>
                            <CloseButton onClick={() => setSelectedTicket(null)}>
                                <X size={20} />
                            </CloseButton>
                        </ModalHeader>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>{selectedTicket.subject}</h3>

                            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: COLORS.bg, borderRadius: '8px' }}>
                                    <span style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>Tenant:</span>
                                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{selectedTicket.tenant_name || selectedTicket.tenant_slug}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: COLORS.bg, borderRadius: '8px' }}>
                                    <span style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>Status:</span>
                                    <select
                                        value={selectedTicket.status}
                                        onChange={(e) => handleStatusChange(selectedTicket.ticket_id, e.target.value)}
                                        style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid ' + COLORS.border }}
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: COLORS.bg, borderRadius: '8px' }}>
                                    <span style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>Priority:</span>
                                    <PriorityBadge $priority={selectedTicket.priority || 'medium'}>
                                        {selectedTicket.priority || 'medium'}
                                    </PriorityBadge>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: COLORS.bg, borderRadius: '8px' }}>
                                    <span style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>Type:</span>
                                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{selectedTicket.type || 'help'}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: COLORS.bg, borderRadius: '8px' }}>
                                    <span style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>Created:</span>
                                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{formatDate(selectedTicket.created_at)}</span>
                                </div>
                            </div>

                            <div style={{ padding: '1rem', background: COLORS.bg, borderRadius: '8px' }}>
                                <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '0.9rem', color: COLORS.textSecondary }}>Message:</h4>
                                <p style={{ margin: 0, lineHeight: '1.6' }}>{selectedTicket.message}</p>
                            </div>
                        </div>

                        {/* Replies */}
                        {replies.length > 0 && (
                            <div style={{ marginTop: '2rem', borderTop: '1px solid ' + COLORS.border, paddingTop: '1.5rem' }}>
                                <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Replies</h4>
                                {replies.map((reply) => (
                                    <div key={reply.reply_id} style={{ padding: '1rem', background: COLORS.bg, borderRadius: '8px', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                            <span style={{ fontWeight: 600, color: COLORS.text }}>
                                                {reply.user_type === 'admin' ? 'Support Team' : 'Tenant User'}
                                            </span>
                                            <span style={{ color: COLORS.textSecondary }}>{formatDate(reply.created_at)}</span>
                                        </div>
                                        <p style={{ margin: 0, lineHeight: '1.5' }}>{reply.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Reply Form */}
                        {selectedTicket.status !== 'closed' && (
                            <div style={{ marginTop: '2rem', borderTop: '1px solid ' + COLORS.border, paddingTop: '1.5rem' }}>
                                <form onSubmit={handleReply}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: COLORS.text, marginBottom: '0.5rem' }}>
                                            Add Reply
                                        </label>
                                        <textarea
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            placeholder="Type your response..."
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '0.625rem 0.875rem',
                                                border: '1px solid ' + COLORS.border,
                                                borderRadius: '8px',
                                                fontSize: '0.9rem',
                                                minHeight: '120px',
                                                resize: 'vertical',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    </div>
                                    <Button type="submit" $variant="primary" disabled={!replyMessage.trim()}>
                                        <Send size={16} />
                                        Send Reply
                                    </Button>
                                </form>
                            </div>
                        )}
                    </ModalContent>
                </Modal>
            )}
        </Container>
    );
};

export default AdminSupportDashboard;