import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api, ENDPOINTS } from '../../api';
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, Send, X, Mail, User, Tag } from 'lucide-react';

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
  max-width: 1200px;
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

const Card = styled.div`
  background: ${COLORS.white};
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid ${COLORS.border};
  padding: 2rem;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${COLORS.text};
  margin-bottom: 0.5rem;
`;

const RequiredLabel = styled.span`
  color: ${COLORS.danger};
  margin-left: 0.25rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  font-size: 0.9rem;
  color: ${COLORS.text};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  font-size: 0.9rem;
  color: ${COLORS.text};
  background: ${COLORS.white};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  font-size: 0.9rem;
  color: ${COLORS.text};
  min-height: 120px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }
`;

const ErrorMessage = styled.div`
  padding: 0.75rem;
  background: #FEE2E2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  color: #991B1B;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  padding: 0.75rem;
  background: #D1FAE5;
  border: 1px solid #A7F3D0;
  border-radius: 8px;
  color: #065F46;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const TicketsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TicketItem = styled.div`
  padding: 1.25rem;
  background: ${COLORS.bg};
  border-radius: 10px;
  border: 1px solid ${COLORS.border};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${COLORS.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
`;

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.75rem;
`;

const TicketSubject = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
  flex: 1;
`;

const TicketMeta = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.85rem;
  color: ${COLORS.textSecondary};
`;

const TicketMessage = styled.p`
  color: ${COLORS.textSecondary};
  font-size: 0.9rem;
  margin: 0.5rem 0;
  line-height: 1.5;
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
  max-width: 600px;
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

const TicketDetail = styled.div`
  margin-bottom: 1.5rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: ${COLORS.bg};
  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

const DetailLabel = styled.span`
  color: ${COLORS.textSecondary};
  font-size: 0.9rem;
`;

const DetailValue = styled.span`
  font-weight: 500;
  font-size: 0.9rem;
`;

const RepliesSection = styled.div`
  margin-top: 2rem;
  border-top: 1px solid ${COLORS.border};
  padding-top: 1.5rem;
`;

const ReplyItem = styled.div`
  padding: 1rem;
  background: ${COLORS.bg};
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const ReplyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
`;

const ReplyAuthor = styled.span`
  font-weight: 600;
  color: ${COLORS.text};
`;

const ReplyDate = styled.span`
  color: ${COLORS.textSecondary};
`;

const ReplyMessage = styled.p`
  color: ${COLORS.text};
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
`;

const ReplyForm = styled.div`
  margin-top: 1rem;
`;

const SupportPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        type: 'help',
        subject: '',
        message: '',
        priority: 'medium'
    });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await api.get(ENDPOINTS.SUPPORT.TICKETS);
            if (response?.data?.success) {
                setTickets(response.data.tickets || []);
            }
        } catch (err) {
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const tenantData = JSON.parse(localStorage.getItem('tenantData') || '{}');

            const response = await api.post(ENDPOINTS.SUPPORT.CREATE_TICKET, {
                ...formData,
                userEmail: user.email,
                userName: user.name || `${user.first_name} ${user.last_name}`,
                tenantName: tenantData.name || tenantData.tenantName
            });

            if (response?.data?.success) {
                setSuccess('Ticket submitted successfully! We will respond shortly.');
                setFormData({ type: 'help', subject: '', message: '', priority: 'medium' });
                setShowForm(false);
                fetchTickets();
                setTimeout(() => setSuccess(''), 5000);
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to submit ticket');
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

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await api.post(`${ENDPOINTS.SUPPORT.TICKETS}/${selectedTicket.ticket_id}/reply`, {
                message: replyMessage,
                userType: 'tenant'
            });

            setReplyMessage('');
            // Refresh replies
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
                    <Title>Support</Title>
                    <Subtitle>Get help from our support team</Subtitle>
                </div>
                <Button $variant="primary" onClick={() => setShowForm(!showForm)}>
                    <Plus size={18} />
                    New Ticket
                </Button>
            </Header>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            {showForm && (
                <Card>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
                        Create Support Ticket
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label htmlFor="type">Type <RequiredLabel>*</RequiredLabel></Label>
                            <Select
                                id="type"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="help">Help</option>
                                <option value="bug">Bug Report</option>
                                <option value="feature">Feature Request</option>
                                <option value="outage">System Outage</option>
                                <option value="other">Other</option>
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="priority">Priority <RequiredLabel>*</RequiredLabel></Label>
                            <Select
                                id="priority"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="subject">Subject <RequiredLabel>*</RequiredLabel></Label>
                            <Input
                                type="text"
                                id="subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Brief description of your issue"
                                required
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="message">Message <RequiredLabel>*</RequiredLabel></Label>
                            <Textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Please provide detailed information about your issue..."
                                required
                            />
                        </FormGroup>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <Button
                                type="button"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                $variant="primary"
                                disabled={!formData.subject || !formData.message}
                            >
                                Submit Ticket
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {tickets.length === 0 ? (
                <Card>
                    <EmptyState>
                        <MessageSquare size={48} />
                        <p>No support tickets yet.</p>
                        <p style={{ fontSize: '0.85rem' }}>Click "New Ticket" to create your first support request.</p>
                    </EmptyState>
                </Card>
            ) : (
                <TicketsList>
                    {tickets.map((ticket) => (
                        <TicketItem key={ticket.ticket_id} onClick={() => handleViewTicket(ticket)}>
                            <TicketHeader>
                                <TicketSubject>{ticket.subject}</TicketSubject>
                                <Badge $status={ticket.status}>
                                    {getStatusIcon(ticket.status)}
                                    {ticket.status.replace('_', ' ')}
                                </Badge>
                            </TicketHeader>
                            <TicketMessage>{ticket.message}</TicketMessage>
                            <TicketMeta>
                                <PriorityBadge $priority={ticket.priority || 'medium'}>
                                    <Tag size={12} />
                                    {ticket.priority || 'medium'}
                                </PriorityBadge>
                                <span>#{ticket.ticket_id}</span>
                                <span>•</span>
                                <span>{formatDate(ticket.created_at)}</span>
                            </TicketMeta>
                        </TicketItem>
                    ))}
                </TicketsList>
            )}

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

                        <TicketDetail>
                            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>{selectedTicket.subject}</h3>

                            <DetailRow>
                                <DetailLabel>Status:</DetailLabel>
                                <DetailValue>
                                    <Badge $status={selectedTicket.status}>
                                        {getStatusIcon(selectedTicket.status)}
                                        {selectedTicket.status.replace('_', ' ')}
                                    </Badge>
                                </DetailValue>
                            </DetailRow>

                            <DetailRow>
                                <DetailLabel>Priority:</DetailLabel>
                                <DetailValue>
                                    <PriorityBadge $priority={selectedTicket.priority || 'medium'}>
                                        {selectedTicket.priority || 'medium'}
                                    </PriorityBadge>
                                </DetailValue>
                            </DetailRow>

                            <DetailRow>
                                <DetailLabel>Type:</DetailLabel>
                                <DetailValue>{selectedTicket.type || 'help'}</DetailValue>
                            </DetailRow>

                            <DetailRow>
                                <DetailLabel>Created:</DetailLabel>
                                <DetailValue>{formatDate(selectedTicket.created_at)}</DetailValue>
                            </DetailRow>

                            <div style={{ marginTop: '1rem', padding: '1rem', background: COLORS.bg, borderRadius: '8px' }}>
                                <DetailLabel style={{ display: 'block', marginBottom: '0.5rem' }}>Message:</DetailLabel>
                                <p style={{ margin: 0, lineHeight: '1.6' }}>{selectedTicket.message}</p>
                            </div>
                        </TicketDetail>

                        {/* Replies */}
                        {replies.length > 0 && (
                            <RepliesSection>
                                <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Replies</h4>
                                {replies.map((reply) => (
                                    <ReplyItem key={reply.reply_id}>
                                        <ReplyHeader>
                                            <ReplyAuthor>
                                                {reply.user_type === 'admin' ? 'Support Team' : 'You'}
                                            </ReplyAuthor>
                                            <ReplyDate>{formatDate(reply.created_at)}</ReplyDate>
                                        </ReplyHeader>
                                        <ReplyMessage>{reply.message}</ReplyMessage>
                                    </ReplyItem>
                                ))}
                            </RepliesSection>
                        )}

                        {/* Reply Form */}
                        {selectedTicket.status !== 'closed' && (
                            <ReplyForm>
                                <form onSubmit={handleReply}>
                                    <FormGroup>
                                        <Label htmlFor="reply">Add Reply</Label>
                                        <Textarea
                                            id="reply"
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            required
                                        />
                                    </FormGroup>
                                    <Button type="submit" $variant="primary" disabled={!replyMessage.trim()}>
                                        <Send size={16} />
                                        Send Reply
                                    </Button>
                                </form>
                            </ReplyForm>
                        )}
                    </ModalContent>
                </Modal>
            )}
        </Container>
    );
};

export default SupportPage;