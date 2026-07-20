import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Activity, Plus, Calendar, Clock, User, FileText, CheckCircle, AlertTriangle, Send, Loader2, Stethoscope, ClipboardList } from '../../utils/icons/icons';
import axios from 'axios';
import { getTenantSlug, getAuthToken } from '../../../utils/globalAuth';
import { ToastContainer } from 'react-toastify';
import { showToast } from '../../../utils/toast';

const API_GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_GATEWAY_URL}/api/v1/restpoint`;


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
    const [postmortemData, setPostmortemData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [showFindingsForm, setShowFindingsForm] = useState(false);
    const [requestForm, setRequestForm] = useState({
        reason: '',
        requested_by: '',
        priority: 'normal',
    });
    const [findingsForm, setFindingsForm] = useState({
        pathologist_name: '',
        examination_summary: '',
        cause_of_death: '',
        immediate_cause_of_death: '',
        underlying_cause_of_death: '',
        contributing_conditions: '',
        manner_of_death: '',
        findings: {},
        head_findings: '',
        chest_findings: '',
        abdomen_findings: '',
        extremities_findings: '',
        toxicology_findings: '',
        status: 'completed',
    });

    useEffect(() => {
        fetchPostmortemRequests();
        fetchPostmortemData();
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
            const data = response.data?.data || response.data || [];
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching postmortem requests:', error);
            setRequests([]);
        }
    };

    const fetchPostmortemData = async () => {
        if (!deceasedId) return;
        try {
            const tenantSlug = getTenantSlug();
            const response = await axios.get(
                `${BASE_URL}/postmortem/${deceasedId}`,
                {
                    headers: { 'x-tenant-slug': tenantSlug }
                }
            );
            if (response.data?.success && response.data?.data) {
                setPostmortemData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching postmortem data:', error);
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
            const response = await axios.post(
                `${BASE_URL}/postmortem/request`,
                {
                    deceased_id: deceasedId,
                    ...requestForm,
                },
                {
                    headers: { 'x-tenant-slug': tenantSlug }
                }
            );
            if (response.data?.success) {
                showToast.success('Postmortem request submitted successfully');
                setShowRequestForm(false);
                setRequestForm({ reason: '', requested_by: '', priority: 'normal' });
                await fetchPostmortemRequests();
                await fetchPostmortemData();
                onUpdate?.();
            }
        } catch (error) {
            console.error('Error requesting postmortem:', error);
            showToast.error('Failed to submit postmortem request');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFindingsSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const tenantSlug = getTenantSlug();
            const response = await axios.post(
                `${BASE_URL}/postmortem/save`,
                {
                    deceased_id: deceasedId,
                    ...findingsForm,
                },
                {
                    headers: { 'x-tenant-slug': tenantSlug }
                }
            );
            if (response.data?.success) {
                showToast.success('Postmortem findings saved successfully');
                setShowFindingsForm(false);
                await fetchPostmortemData();
                await fetchPostmortemRequests();
                onUpdate?.();
                // Auto-generate PDF
                if (findingsForm.status === 'completed') {
                    setTimeout(() => {
                        window.open(`${BASE_URL}/postmortem/${deceasedId}/pdf`, '_blank');
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Error saving postmortem findings:', error);
            showToast.error('Failed to save postmortem findings');
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

    const hasPendingPostmortem = postmortemData?.status === 'pending';
    const hasCompletedPostmortem = postmortemData?.status === 'completed';
    const hasRequests = requests.length > 0 || hasPendingPostmortem;

    return (
        <Container>
      <ToastContainer position="top-right" />
            {/* Show pending postmortem status */}
            {hasPendingPostmortem && !hasCompletedPostmortem && (
                <RequestCard style={{ borderColor: COLORS.warning, background: COLORS.warningLight }}>
                    <RequestHeader>
                        <RequestTitle>
                            <Clock size={16} color={COLORS.warning} />
                            Postmortem Pending
                        </RequestTitle>
                        <StatusBadge $status="pending">
                            {getStatusIcon('pending')}
                            Pending
                        </StatusBadge>
                    </RequestHeader>
                    <InfoRow>
                        <User size={14} />
                        <div>
                            <strong>Requested By:</strong> {postmortemData.requested_by || 'Unknown'}
                        </div>
                    </InfoRow>
                    <InfoRow>
                        <Calendar size={14} />
                        <div>
                            <strong>Requested At:</strong> {postmortemData.requested_at ? new Date(postmortemData.requested_at).toLocaleString() : 'N/A'}
                        </div>
                    </InfoRow>
                    {postmortemData.requesting_authority && (
                        <InfoRow>
                            <FileText size={14} />
                            <div>
                                <strong>Reason:</strong> {postmortemData.requesting_authority}
                            </div>
                        </InfoRow>
                    )}
                </RequestCard>
            )}

            {/* Show completed postmortem */}
            {hasCompletedPostmortem && (
                <RequestCard style={{ borderColor: COLORS.success, background: COLORS.successLight }}>
                    <RequestHeader>
                        <RequestTitle>
                            <CheckCircle size={16} color={COLORS.success} />
                            Postmortem Completed
                        </RequestTitle>
                        <StatusBadge $status="completed">
                            {getStatusIcon('completed')}
                            Completed
                        </StatusBadge>
                    </RequestHeader>
                    <InfoRow>
                        <Stethoscope size={14} />
                        <div>
                            <strong>Pathologist:</strong> {postmortemData.pathologist_name || 'Not specified'}
                        </div>
                    </InfoRow>
                    <InfoRow>
                        <Calendar size={14} />
                        <div>
                            <strong>Completed At:</strong> {postmortemData.completed_at ? new Date(postmortemData.completed_at).toLocaleString() : 'N/A'}
                        </div>
                    </InfoRow>
                    {postmortemData.cause_of_death && (
                        <InfoRow>
                            <ClipboardList size={14} />
                            <div>
                                <strong>Cause of Death:</strong> {postmortemData.cause_of_death}
                            </div>
                        </InfoRow>
                    )}
                    <PrimaryButton
                        onClick={() => window.open(`${BASE_URL}/postmortem/${deceasedId}/pdf`, '_blank')}
                        style={{ marginTop: '0.75rem' }}
                    >
                        <FileText size={16} /> Download PDF Report
                    </PrimaryButton>
                </RequestCard>
            )}

            {/* Request new postmortem */}
            {!hasPendingPostmortem && !hasCompletedPostmortem && !showRequestForm && (
                <EmptyState>
                    <Activity size={48} />
                    <h4>No Postmortem Record</h4>
                    <p>Request a postmortem examination for {deceasedData?.full_name || 'the deceased'}</p>
                    <PrimaryButton onClick={() => setShowRequestForm(true)} style={{ marginTop: '1rem' }}>
                        <Plus size={16} /> Request Postmortem
                    </PrimaryButton>
                </EmptyState>
            )}

            {/* Request Form */}
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
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8125rem', color: COLORS.text }}>
                                Reason for Postmortem *
                            </label>
                            <textarea
                                value={requestForm.reason}
                                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                                placeholder="Enter reason for postmortem examination"
                                required
                                style={{
                                    width: '100%', padding: '0.5rem 0.75rem', border: '1px solid ' + COLORS.border,
                                    borderRadius: COLORS.radiusSm, fontSize: '0.8125rem', color: COLORS.text,
                                    background: COLORS.surface, minHeight: '80px', resize: 'vertical'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8125rem', color: COLORS.text }}>
                                Requested By *
                            </label>
                            <input
                                type="text"
                                value={requestForm.requested_by}
                                onChange={(e) => setRequestForm({ ...requestForm, requested_by: e.target.value })}
                                placeholder="Your name"
                                required
                                style={{
                                    width: '100%', padding: '0.5rem 0.75rem', border: '1px solid ' + COLORS.border,
                                    borderRadius: COLORS.radiusSm, fontSize: '0.8125rem', color: COLORS.text,
                                    background: COLORS.surface
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8125rem', color: COLORS.text }}>
                                Priority
                            </label>
                            <select
                                value={requestForm.priority}
                                onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.5rem 0.75rem', border: '1px solid ' + COLORS.border,
                                    borderRadius: COLORS.radiusSm, fontSize: '0.8125rem', color: COLORS.text,
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
                                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> Submit Request</>}
                            </PrimaryButton>
                            <SecondaryButton type="button" onClick={() => { setShowRequestForm(false); setRequestForm({ reason: '', requested_by: '', priority: 'normal' }); }}>
                                Cancel
                            </SecondaryButton>
                        </div>
                    </form>
                </div>
            )}

            {/* Findings Form - Only show when postmortem is pending */}
            {hasPendingPostmortem && showFindingsForm && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: COLORS.surface,
                    borderRadius: COLORS.radiusSm,
                    border: `2px solid ${COLORS.primary}`
                }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600, color: COLORS.primary }}>
                        <Stethoscope size={16} style={{ marginRight: '0.5rem' }} />
                        Enter Postmortem Findings
                    </h4>
                    <form onSubmit={handleFindingsSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8125rem', color: COLORS.text }}>
                                Pathologist Name *
                            </label>
                            <input
                                type="text"
                                value={findingsForm.pathologist_name}
                                onChange={(e) => setFindingsForm({ ...findingsForm, pathologist_name: e.target.value })}
                                placeholder="Enter pathologist name"
                                required
                                style={{
                                    width: '100%', padding: '0.5rem 0.75rem', border: '1px solid ' + COLORS.border,
                                    borderRadius: COLORS.radiusSm, fontSize: '0.8125rem', color: COLORS.text,
                                    background: COLORS.bg
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8125rem', color: COLORS.text }}>
                                Examination Summary *
                            </label>
                            <textarea
                                value={findingsForm.examination_summary}
                                onChange={(e) => setFindingsForm({ ...findingsForm, examination_summary: e.target.value })}
                                placeholder="Enter examination summary"
                                required
                                rows={3}
                                style={{
                                    width: '100%', padding: '0.5rem 0.75rem', border: '1px solid ' + COLORS.border,
                                    borderRadius: COLORS.radiusSm, fontSize: '0.8125rem', color: COLORS.text,
                                    background: COLORS.bg, minHeight: '80px', resize: 'vertical'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8125rem', color: COLORS.text }}>
                                Cause of Death *
                            </label>
                            <input
                                type="text"
                                value={findingsForm.cause_of_death}
                                onChange={(e) => setFindingsForm({ ...findingsForm, cause_of_death: e.target.value })}
                                placeholder="Primary cause of death"
                                required
                                style={{
                                    width: '100%', padding: '0.5rem 0.75rem', border: '1px solid ' + COLORS.border,
                                    borderRadius: COLORS.radiusSm, fontSize: '0.8125rem', color: COLORS.text,
                                    background: COLORS.bg
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8125rem', color: COLORS.text }}>
                                Manner of Death
                            </label>
                            <select
                                value={findingsForm.manner_of_death}
                                onChange={(e) => setFindingsForm({ ...findingsForm, manner_of_death: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.5rem 0.75rem', border: '1px solid ' + COLORS.border,
                                    borderRadius: COLORS.radiusSm, fontSize: '0.8125rem', color: COLORS.text,
                                    background: COLORS.bg
                                }}
                            >
                                <option value="">Select manner of death</option>
                                <option value="Natural">Natural</option>
                                <option value="Accident">Accident</option>
                                <option value="Homicide">Homicide</option>
                                <option value="Suicide">Suicide</option>
                                <option value="Undetermined">Undetermined</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <PrimaryButton type="submit" disabled={isLoading}>
                                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><CheckCircle size={16} /> Complete Postmortem</>}
                            </PrimaryButton>
                            <SecondaryButton type="button" onClick={() => setShowFindingsForm(false)}>
                                Cancel
                            </SecondaryButton>
                        </div>
                    </form>
                </div>
            )}

            {/* Button to show findings form when pending */}
            {hasPendingPostmortem && !showFindingsForm && (
                <PrimaryButton
                    onClick={() => setShowFindingsForm(true)}
                    style={{ width: '100%', marginTop: '0.75rem' }}
                >
                    <Stethoscope size={16} /> Enter Postmortem Findings
                </PrimaryButton>
            )}
        </Container>
    );
};

export default PostmortemSection;