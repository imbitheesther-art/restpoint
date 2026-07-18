import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    Activity,
    Plus,
    Calendar,
    Clock,
    User,
    FileText,
    CheckCircle,
    AlertTriangle,
    Send,
    Loader2,
} from 'lucide-react';
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

const RequestCard = styled.div`
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

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const RequestTitle = styled.div`
  font-weight: 600;
  font-size: 0.9375rem;
  color: ${COLORS.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
        switch (props.$status) {
            case 'completed': return COLORS.successLight;
            case 'pending': return COLORS.warningLight;
            case 'in_progress': return COLORS.infoLight;
            default: return COLORS.borderLight;
        }
    }};
  color: ${props => {
        switch (props.$status) {
            case 'completed': return COLORS.successDark;
            case 'pending': return COLORS.warningDark;
            case 'in_progress': return COLORS.infoDark;
            default: return COLORS.textSecondary;
        }
    }};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-size: 0.8125rem;
  color: ${COLORS.textSecondary};

  svg {
    width: 14px;
    height: 14px;
    color: ${COLORS.primary};
    flex-shrink: 0;
    margin-top: 0.125rem;
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

  &:disabled {
    background: ${COLORS.textMuted};
    cursor: not-allowed;
    transform: none;
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

const PostmortemSection = ({ deceasedId, deceasedData, onUpdate }) => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestForm, setRequestForm] = useState({
        reason: '',
        requested_by: '',
        priority: 'normal',
    });

    useEffect(() => {
        fetchPostmortemRequests();
    }, [deceasedId]);

    const fetchPostmortemRequests = async () => {
        if (!deceasedId) return;

        try {
            const tenantSlug = getTenantSlug();
            const response = await axios.get(
                `${BASE_URL}/autopsy/${deceasedId}`,
                {
                    headers: { 'x-tenant-slug': tenantSlug }
                }
            );
            setRequests(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Error fetching postmortem requests:', error);
            setRequests([]);
        }
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        if (!requestForm.reason || !requestForm.requested_by) {
            alert('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            const tenantSlug = getTenantSlug();
            await axios.post(
                `${BASE_URL}/autopsy/${deceasedId}`,
                {
                    ...requestForm,
                    status: 'pending',
                    request_date: new Date().toISOString(),
                },
                {
                    headers: { 'x-tenant-slug': tenantSlug }
                }
            );

            setShowRequestForm(false);
            setRequestForm({ reason: '', requested_by: '', priority: 'normal' });
            fetchPostmortemRequests();
            onUpdate?.();
        } catch (error) {
            console.error('Error requesting postmortem:', error);
            alert('Failed to submit postmortem request');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle size={14} />;
            case 'in_progress': return <Activity size={14} />;
            case 'pending': return <Clock size={14} />;
            default: return <AlertTriangle size={14} />;
        }
    };

    if (requests.length === 0 && !showRequestForm) {
        return (
            <Container>
                <EmptyState>
                    <Activity size={48} />
                    <h4>No Postmortem Requests</h4>
                    <p>Request a postmortem examination for {deceasedData?.full_name || 'the deceased'}</p>
                    <PrimaryButton onClick={() => setShowRequestForm(true)} style={{ marginTop: '1rem' }}>
                        <Plus size={16} /> Request Postmortem
                    </PrimaryButton>
                </EmptyState>
            </Container>
        );
    }

    return (
        <Container>
            {requests.map((request) => (
                <RequestCard key={request.autopsy_id || request.id}>
                    <RequestHeader>
                        <RequestTitle>
                            <Activity size={16} color={COLORS.primary} />
                            Postmortem Request
                        </RequestTitle>
                        <StatusBadge $status={request.status}>
                            {getStatusIcon(request.status)}
                            {request.status?.replace('_', ' ') || 'Pending'}
                        </StatusBadge>
                    </RequestHeader>

                    <InfoRow>
                        <FileText size={14} />
                        <div>
                            <strong>Reason:</strong> {request.reason || 'Not specified'}
                        </div>
                    </InfoRow>

                    <InfoRow>
                        <User size={14} />
                        <div>
                            <strong>Requested By:</strong> {request.requested_by || 'Unknown'}
                        </div>
                    </InfoRow>

                    <InfoRow>
                        <Calendar size={14} />
                        <div>
                            <strong>Request Date:</strong> {request.request_date ? new Date(request.request_date).toLocaleDateString() : 'N/A'}
                        </div>
                    </InfoRow>

                    {request.priority && (
                        <InfoRow>
                            <AlertTriangle size={14} />
                            <div>
                                <strong>Priority:</strong> {request.priority}
                            </div>
                        </InfoRow>
                    )}

                    {request.notes && (
                        <InfoRow>
                            <FileText size={14} />
                            <div>
                                <strong>Notes:</strong> {request.notes}
                            </div>
                        </InfoRow>
                    )}
                </RequestCard>
            ))}

            {!showRequestForm && (
                <PrimaryButton onClick={() => setShowRequestForm(true)} style={{ width: '100%', marginTop: '0.75rem' }}>
                    <Plus size={16} /> Request Postmortem
                </PrimaryButton>
            )}

            {showRequestForm && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: COLORS.bg,
                    borderRadius: COLORS.radiusSm,
                    border: `1px solid ${COLORS.border}`
                }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600, color: COLORS.text }}>
                        New Postmortem Request
                    </h4>
                    <form onSubmit={handleRequestSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                fontWeight: 600,
                                marginBottom: '0.375rem',
                                fontSize: '0.8125rem',
                                color: COLORS.text
                            }}>
                                Reason for Postmortem *
                            </label>
                            <textarea
                                value={requestForm.reason}
                                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                                placeholder="Enter reason for postmortem examination"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    border: '1px solid ' + COLORS.border,
                                    borderRadius: COLORS.radiusSm,
                                    fontSize: '0.8125rem',
                                    color: COLORS.text,
                                    background: COLORS.surface,
                                    minHeight: '80px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                fontWeight: 600,
                                marginBottom: '0.375rem',
                                fontSize: '0.8125rem',
                                color: COLORS.text
                            }}>
                                Requested By *
                            </label>
                            <input
                                type="text"
                                value={requestForm.requested_by}
                                onChange={(e) => setRequestForm({ ...requestForm, requested_by: e.target.value })}
                                placeholder="Your name"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    border: '1px solid ' + COLORS.border,
                                    borderRadius: COLORS.radiusSm,
                                    fontSize: '0.8125rem',
                                    color: COLORS.text,
                                    background: COLORS.surface
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                fontWeight: 600,
                                marginBottom: '0.375rem',
                                fontSize: '0.8125rem',
                                color: COLORS.text
                            }}>
                                Priority
                            </label>
                            <select
                                value={requestForm.priority}
                                onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    border: '1px solid ' + COLORS.border,
                                    borderRadius: COLORS.radiusSm,
                                    fontSize: '0.8125rem',
                                    color: COLORS.text,
                                    background: COLORS.surface
                                }}
                            >
                                <option value="normal">Normal</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <PrimaryButton type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} /> Submit Request
                                    </>
                                )}
                            </PrimaryButton>
                            <SecondaryButton
                                type="button"
                                onClick={() => {
                                    setShowRequestForm(false);
                                    setRequestForm({ reason: '', requested_by: '', priority: 'normal' });
                                }}
                            >
                                Cancel
                            </SecondaryButton>
                        </div>
                    </form>
                </div>
            )}
        </Container>
    );
};

const SecondaryButton = styled.button`
  background: ${COLORS.surface};
  color: ${COLORS.text};
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  transition: ${COLORS.transition};

  &:hover {
    background: ${COLORS.bg};
    border-color: ${COLORS.textSecondary};
  }
`;

export default PostmortemSection;