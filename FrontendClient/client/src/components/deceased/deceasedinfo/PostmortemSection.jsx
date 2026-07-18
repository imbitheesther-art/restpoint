import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
    Activity,
    PlusCircle,
    Calendar,
    User,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Download,
    Printer,
    Edit,
    Trash2,
    Eye,
    Stethoscope,
    ClipboardList,
} from 'lucide-react';
import api from '../../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Professional color scheme matching flower bookings
const COLORS = {
    primary: '#0A2463',
    primaryLight: '#1A3A7A',
    white: '#FFFFFF',
    bg: '#F5F7FA',
    border: '#E8ECF0',
    borderLight: '#F3F4F6',
    text: '#1A1D24',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#E74C3C',
    dangerLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    accent: '#3B82F6',
    accentHover: '#2563eb',
    accentGlow: 'rgba(59, 130, 246, 0.1)',
    radius: '14px',
    radiusSm: '8px',
    radiusXs: '6px',
    shadowSm: '0 1px 4px rgba(0, 0, 0, 0.06)',
    shadowMd: '0 4px 12px rgba(0, 0, 0, 0.08)',
    shadowLg: '0 12px 32px rgba(0, 0, 0, 0.12)',
    transition: 'all 0.2s ease',
};

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const Card = styled.div`
    background: ${COLORS.white};
    border-radius: ${COLORS.radius};
    box-shadow: ${COLORS.shadowSm};
    border: 1px solid ${COLORS.border};
    overflow: hidden;
    animation: ${fadeIn} 0.5s ease-out;
`;

const CardHeader = styled.div`
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid ${COLORS.border};
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CardTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    color: ${COLORS.text};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const CardBody = styled.div`
    padding: 1.5rem;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem 1.5rem;
    color: ${COLORS.textSecondary};

    svg {
        width: 3rem;
        height: 3rem;
        margin-bottom: 1rem;
        opacity: 0.4;
    }

    h4 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 0.5rem;
        color: ${COLORS.text};
    }

    p {
        font-size: 0.875rem;
        margin: 0;
        color: ${COLORS.textSecondary};
    }
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border-radius: ${COLORS.radiusSm};
    font-size: 0.875rem;
    font-weight: 600;
    border: 2px solid ${COLORS.border};
    background: ${COLORS.white};
    color: ${COLORS.text};
    cursor: pointer;
    transition: ${COLORS.transition};
    min-height: 40px;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${COLORS.shadowMd};
        border-color: ${COLORS.accent};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
    }

    svg {
        width: 16px;
        height: 16px;
    }

    &.primary {
        background: ${COLORS.accent};
        color: ${COLORS.white};
        border-color: transparent;

        &:hover {
            background: ${COLORS.accentHover};
            border-color: transparent;
        }
    }

    &.success {
        background: ${COLORS.success};
        color: ${COLORS.white};
        border-color: transparent;

        &:hover {
            background: #059669;
            border-color: transparent;
        }
    }

    &.danger {
        background: ${COLORS.danger};
        color: white;
        border-color: transparent;

        &:hover {
            background: #a93226;
            border-color: transparent;
        }
    }
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const InfoItem = styled.div`
    padding: 1rem;
    background: ${COLORS.bg};
    border-radius: ${COLORS.radiusSm};
    border: 1px solid ${COLORS.border};
    transition: ${COLORS.transition};

    &:hover {
        border-color: ${COLORS.primary};
        box-shadow: 0 2px 8px rgba(10, 36, 99, 0.08);
    }
`;

const InfoLabel = styled.div`
    font-size: 0.75rem;
    font-weight: 600;
    color: ${COLORS.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
`;

const InfoValue = styled.div`
    font-size: 1rem;
    font-weight: 600;
    color: ${COLORS.text};
    word-break: break-word;
`;

const StatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.875rem;
    border-radius: ${COLORS.radiusSm};
    font-size: 0.875rem;
    font-weight: 500;
    background: ${props => {
        switch (props.$status) {
            case 'completed': return COLORS.successLight;
            case 'pending': return COLORS.warningLight;
            case 'in_progress': return COLORS.infoLight;
            case 'cancelled': return COLORS.dangerLight;
            default: return COLORS.border;
        }
    }};
    color: ${props => {
        switch (props.$status) {
            case 'completed': return COLORS.success;
            case 'pending': return COLORS.warning;
            case 'in_progress': return COLORS.info;
            case 'cancelled': return COLORS.danger;
            default: return COLORS.textSecondary;
        }
    }};
`;

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
    background: ${COLORS.white};
    border-radius: ${COLORS.radius};
    box-shadow: ${COLORS.shadowLg};
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: ${fadeIn} 0.3s ease-out;
`;

const ModalHeader = styled.div`
    padding: 1.5rem;
    border-bottom: 1px solid ${COLORS.border};
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: ${COLORS.bg};

    h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: ${COLORS.text};
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
`;

const ModalButton = styled.button`
    background: transparent;
    border: none;
    color: ${COLORS.textSecondary};
    cursor: pointer;
    padding: 0.5rem;
    border-radius: ${COLORS.radiusXs};
    transition: ${COLORS.transition};
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: ${COLORS.border};
        color: ${COLORS.text};
    }
`;

const ModalBody = styled.div`
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
`;

const FormGroup = styled.div`
    margin-bottom: 1.25rem;
`;

const Label = styled.label`
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: ${COLORS.text};
    margin-bottom: 0.5rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 1px solid ${COLORS.border};
    border-radius: ${COLORS.radiusSm};
    font-size: 0.875rem;
    color: ${COLORS.text};
    transition: ${COLORS.transition};
    background: ${COLORS.white};

    &:focus {
        outline: none;
        border-color: ${COLORS.accent};
        box-shadow: 0 0 0 3px ${COLORS.accentGlow};
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 1px solid ${COLORS.border};
    border-radius: ${COLORS.radiusSm};
    font-size: 0.875rem;
    color: ${COLORS.text};
    transition: ${COLORS.transition};
    background: ${COLORS.white};
    min-height: 120px;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: ${COLORS.accent};
        box-shadow: 0 0 0 3px ${COLORS.accentGlow};
    }
`;

const Select = styled.select`
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 1px solid ${COLORS.border};
    border-radius: ${COLORS.radiusSm};
    font-size: 0.875rem;
    color: ${COLORS.text};
    transition: ${COLORS.transition};
    background: ${COLORS.white};

    &:focus {
        outline: none;
        border-color: ${COLORS.accent};
        box-shadow: 0 0 0 3px ${COLORS.accentGlow};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
    justify-content: flex-end;
`;

const Loader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    color: ${COLORS.accent};

    svg {
        animation: ${spin} 1s linear infinite;
    }

    .loader-text {
        margin-top: 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: ${COLORS.textSecondary};
    }
`;

const PostmortemSection = ({ deceasedId, deceasedData, onUpdate }) => {
    const [postmortemData, setPostmortemData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        doctor_name: '',
        examination_date: '',
        findings: '',
        cause_of_death: '',
        pathologist_notes: '',
        status: 'pending',
    });

    useEffect(() => {
        if (deceasedId) {
            fetchPostmortemData();
        }
    }, [deceasedId]);

    const fetchPostmortemData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/postmortem/${deceasedId}`);
            if (response.data?.data) {
                setPostmortemData(response.data.data);
            } else if (response.data) {
                setPostmortemData(response.data);
            }
        } catch (error) {
            console.error('Error fetching postmortem data:', error);
            // No postmortem data yet - this is normal
            setPostmortemData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                deceased_id: deceasedId,
                examination_date: formData.examination_date || new Date().toISOString().split('T')[0],
            };

            const response = await api.post('/postmortem/save', payload);

            if (response.data?.success || response.data) {
                toast.success('Postmortem request submitted successfully!');
                setShowRequestModal(false);
                setFormData({
                    doctor_name: '',
                    examination_date: '',
                    findings: '',
                    cause_of_death: '',
                    pathologist_notes: '',
                    status: 'pending',
                });
                await fetchPostmortemData();
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error('Error submitting postmortem request:', error);
            toast.error(error.response?.data?.message || 'Failed to submit postmortem request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!postmortemData?.id) return;

        if (!window.confirm('Are you sure you want to delete this postmortem record?')) {
            return;
        }

        try {
            await api.delete(`/postmortem/${postmortemData.id}`);
            toast.success('Postmortem record deleted successfully');
            setPostmortemData(null);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error deleting postmortem:', error);
            toast.error('Failed to delete postmortem record');
        }
    };

    const handleDownloadPDF = async () => {
        if (!postmortemData?.id) return;

        try {
            const response = await api.get(`/postmortem/${deceasedId}/pdf`, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `postmortem_${deceasedData?.full_name || 'report'}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success('PDF downloaded successfully!');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Failed to download PDF');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle size={14} />;
            case 'in_progress': return <Activity size={14} />;
            case 'cancelled': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardBody>
                    <Loader>
                        <Activity size={32} />
                        <span className="loader-text">Loading postmortem data...</span>
                    </Loader>
                </CardBody>
            </Card>
        );
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />

            {!postmortemData ? (
                <Card>
                    <CardBody>
                        <EmptyState>
                            <Activity size={48} />
                            <h4>No Postmortem Examination</h4>
                            <p>No postmortem examination has been requested for this deceased.</p>
                            <Button
                                className="primary"
                                onClick={() => setShowRequestModal(true)}
                                style={{ marginTop: '1rem' }}
                            >
                                <PlusCircle size={16} />
                                Request Postmortem
                            </Button>
                        </EmptyState>
                    </CardBody>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Stethoscope size={20} />
                            Postmortem Examination
                        </CardTitle>
                        <StatusBadge $status={postmortemData.status || 'pending'}>
                            {getStatusIcon(postmortemData.status || 'pending')}
                            {(postmortemData.status || 'pending').replace('_', ' ').toUpperCase()}
                        </StatusBadge>
                    </CardHeader>
                    <CardBody>
                        <InfoGrid>
                            <InfoItem>
                                <InfoLabel>
                                    <User size={14} />
                                    Doctor Name
                                </InfoLabel>
                                <InfoValue>{postmortemData.doctor_name || 'N/A'}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>
                                    <Calendar size={14} />
                                    Examination Date
                                </InfoLabel>
                                <InfoValue>
                                    {postmortemData.examination_date
                                        ? new Date(postmortemData.examination_date).toLocaleDateString()
                                        : 'N/A'}
                                </InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>
                                    <FileText size={14} />
                                    Cause of Death
                                </InfoLabel>
                                <InfoValue>{postmortemData.cause_of_death || 'N/A'}</InfoValue>
                            </InfoItem>
                            <InfoItem>
                                <InfoLabel>
                                    <Clock size={14} />
                                    Created
                                </InfoLabel>
                                <InfoValue>
                                    {postmortemData.created_at
                                        ? new Date(postmortemData.created_at).toLocaleString()
                                        : 'N/A'}
                                </InfoValue>
                            </InfoItem>
                        </InfoGrid>

                        {postmortemData.findings && (
                            <div style={{ marginTop: '1rem' }}>
                                <InfoLabel>
                                    <ClipboardList size={14} />
                                    Findings
                                </InfoLabel>
                                <div style={{
                                    padding: '1rem',
                                    background: COLORS.bg,
                                    borderRadius: COLORS.radiusSm,
                                    border: `1px solid ${COLORS.border}`,
                                    marginTop: '0.5rem'
                                }}>
                                    {postmortemData.findings}
                                </div>
                            </div>
                        )}

                        {postmortemData.pathologist_notes && (
                            <div style={{ marginTop: '1rem' }}>
                                <InfoLabel>
                                    <FileText size={14} />
                                    Pathologist Notes
                                </InfoLabel>
                                <div style={{
                                    padding: '1rem',
                                    background: COLORS.bg,
                                    borderRadius: COLORS.radiusSm,
                                    border: `1px solid ${COLORS.border}`,
                                    marginTop: '0.5rem'
                                }}>
                                    {postmortemData.pathologist_notes}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                            <Button
                                className="primary"
                                onClick={() => setShowViewModal(true)}
                            >
                                <Eye size={16} />
                                View Details
                            </Button>
                            <Button
                                className="success"
                                onClick={handleDownloadPDF}
                            >
                                <Download size={16} />
                                Download PDF
                            </Button>
                            <Button
                                onClick={() => setShowRequestModal(true)}
                            >
                                <Edit size={16} />
                                Update
                            </Button>
                            <Button
                                className="danger"
                                onClick={handleDelete}
                            >
                                <Trash2 size={16} />
                                Delete
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Request/Update Postmortem Modal */}
            {showRequestModal && (
                <ModalOverlay onClick={() => setShowRequestModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h3>
                                <Stethoscope size={20} />
                                {postmortemData ? 'Update Postmortem' : 'Request Postmortem Examination'}
                            </h3>
                            <ModalButton onClick={() => setShowRequestModal(false)}>
                                <X size={24} />
                            </ModalButton>
                        </ModalHeader>
                        <ModalBody>
                            <form onSubmit={handleSubmitRequest}>
                                <FormGroup>
                                    <Label>Doctor Name *</Label>
                                    <Input
                                        type="text"
                                        name="doctor_name"
                                        value={formData.doctor_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter doctor's name"
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>Examination Date *</Label>
                                    <Input
                                        type="date"
                                        name="examination_date"
                                        value={formData.examination_date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>Cause of Death *</Label>
                                    <Input
                                        type="text"
                                        name="cause_of_death"
                                        value={formData.cause_of_death}
                                        onChange={handleInputChange}
                                        placeholder="Enter cause of death"
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>Findings</Label>
                                    <TextArea
                                        name="findings"
                                        value={formData.findings}
                                        onChange={handleInputChange}
                                        placeholder="Enter examination findings..."
                                        rows="4"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>Pathologist Notes</Label>
                                    <TextArea
                                        name="pathologist_notes"
                                        value={formData.pathologist_notes}
                                        onChange={handleInputChange}
                                        placeholder="Enter additional notes..."
                                        rows="4"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>Status</Label>
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </Select>
                                </FormGroup>

                                <ButtonGroup>
                                    <Button
                                        type="button"
                                        onClick={() => setShowRequestModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : postmortemData ? 'Update' : 'Submit Request'}
                                    </Button>
                                </ButtonGroup>
                            </form>
                        </ModalBody>
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* View Details Modal */}
            {showViewModal && postmortemData && (
                <ModalOverlay onClick={() => setShowViewModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h3>
                                <Eye size={20} />
                                Postmortem Details
                            </h3>
                            <ModalButton onClick={() => setShowViewModal(false)}>
                                <X size={24} />
                            </ModalButton>
                        </ModalHeader>
                        <ModalBody>
                            <InfoGrid>
                                <InfoItem>
                                    <InfoLabel>
                                        <User size={14} />
                                        Doctor Name
                                    </InfoLabel>
                                    <InfoValue>{postmortemData.doctor_name || 'N/A'}</InfoValue>
                                </InfoItem>
                                <InfoItem>
                                    <InfoLabel>
                                        <Calendar size={14} />
                                        Examination Date
                                    </InfoLabel>
                                    <InfoValue>
                                        {postmortemData.examination_date
                                            ? new Date(postmortemData.examination_date).toLocaleDateString()
                                            : 'N/A'}
                                    </InfoValue>
                                </InfoItem>
                                <InfoItem>
                                    <InfoLabel>
                                        <Activity size={14} />
                                        Status
                                    </InfoLabel>
                                    <InfoValue>
                                        <StatusBadge $status={postmortemData.status || 'pending'}>
                                            {getStatusIcon(postmortemData.status || 'pending')}
                                            {(postmortemData.status || 'pending').replace('_', ' ').toUpperCase()}
                                        </StatusBadge>
                                    </InfoValue>
                                </InfoItem>
                                <InfoItem>
                                    <InfoLabel>
                                        <FileText size={14} />
                                        Cause of Death
                                    </InfoLabel>
                                    <InfoValue>{postmortemData.cause_of_death || 'N/A'}</InfoValue>
                                </InfoItem>
                            </InfoGrid>

                            {postmortemData.findings && (
                                <div style={{ marginTop: '1rem' }}>
                                    <InfoLabel>
                                        <ClipboardList size={14} />
                                        Findings
                                    </InfoLabel>
                                    <div style={{
                                        padding: '1rem',
                                        background: COLORS.bg,
                                        borderRadius: COLORS.radiusSm,
                                        border: `1px solid ${COLORS.border}`,
                                        marginTop: '0.5rem',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {postmortemData.findings}
                                    </div>
                                </div>
                            )}

                            {postmortemData.pathologist_notes && (
                                <div style={{ marginTop: '1rem' }}>
                                    <InfoLabel>
                                        <FileText size={14} />
                                        Pathologist Notes
                                    </InfoLabel>
                                    <div style={{
                                        padding: '1rem',
                                        background: COLORS.bg,
                                        borderRadius: COLORS.radiusSm,
                                        border: `1px solid ${COLORS.border}`,
                                        marginTop: '0.5rem',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {postmortemData.pathologist_notes}
                                    </div>
                                </div>
                            )}

                            <ButtonGroup>
                                <Button onClick={() => setShowViewModal(false)}>
                                    Close
                                </Button>
                                <Button
                                    className="success"
                                    onClick={handleDownloadPDF}
                                >
                                    <Download size={16} />
                                    Download PDF
                                </Button>
                            </ButtonGroup>
                        </ModalBody>
                    </ModalContent>
                </ModalOverlay>
            )}
        </>
    );
};

export default PostmortemSection;