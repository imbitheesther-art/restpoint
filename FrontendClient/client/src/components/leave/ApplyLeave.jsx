import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { api, ENDPOINTS } from '../../api';
import { Calendar, FileText, Upload, X, User, Mail, MapPin, Briefcase, History } from '../../utils/icons/icons';

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
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
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
  transition: border-color 0.2s;

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
  cursor: pointer;

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

const FileUpload = styled.div`
  border: 2px dashed ${COLORS.border};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${COLORS.primary};
    background: ${COLORS.bg};
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: ${COLORS.bg};
  border-radius: 8px;
  margin-top: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
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

const UserInfoCard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.25rem;
  background: ${COLORS.bg};
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const UserInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserInfoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${COLORS.primary};
  color: ${COLORS.white};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const UserInfoContent = styled.div`
  flex: 1;
`;

const UserInfoLabel = styled.div`
  font-size: 0.75rem;
  color: ${COLORS.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const UserInfoValue = styled.div`
  font-size: 0.9rem;
  color: ${COLORS.text};
  font-weight: 500;
`;

const DocumentsList = styled.div`
  margin-top: 1rem;
`;

const DocumentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${COLORS.bg};
  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

const DocumentName = styled.div`
  flex: 1;
  font-size: 0.9rem;
  color: ${COLORS.text};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${COLORS.danger};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`;

const ApplyLeave = () => {
    const navigate = useNavigate();
    const tenantSlug = localStorage.getItem('tenantSlug') || 'system_shared';
    const [formData, setFormData] = useState({
        leave_type: 'annual',
        priority: 'medium',
        start_date: '',
        end_date: '',
        reason: '',
        is_half_day: false,
        // User information fields
        user_name: '',
        user_email: '',
        user_branch: '',
        user_role: ''
    });
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        // Load user information from localStorage as default values
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const tenantData = JSON.parse(localStorage.getItem('tenantData') || '{}');

            setFormData(prev => ({
                ...prev,
                user_name: user.name || user.first_name + ' ' + user.last_name || '',
                user_email: user.email || '',
                user_branch: tenantData.branch_name || tenantData.branchSlug || '',
                user_role: user.role || user.roles?.[0] || ''
            }));
        } catch (e) {
            console.error('Error loading user info:', e);
        }
    }, []);

    const getUserId = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.id || user.userId || 1;
        } catch {
            return 1;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const submitData = {
                ...formData,
                user_id: getUserId()
            };

            // ENDPOINTS.LEAVE.APPLY is a function: (slug) => `/leaves/${slug}/apply`
            const endpoint = typeof ENDPOINTS.LEAVE.APPLY === 'function'
                ? ENDPOINTS.LEAVE.APPLY(tenantSlug)
                : ENDPOINTS.LEAVE.APPLY;
            const response = await api.post(endpoint, submitData);

            if (response?.data?.status === 'success') {
                setSuccess('Leave request submitted successfully!');
                setShowSuccess(true);

                // Reset form but keep user information
                setFormData(prev => ({
                    ...prev,
                    leave_type: 'annual',
                    priority: 'medium',
                    start_date: '',
                    end_date: '',
                    reason: '',
                    is_half_day: false
                }));
                setDocuments([]);

                // Hide success message after 5 seconds
                setTimeout(() => {
                    setShowSuccess(false);
                    setSuccess('');
                }, 5000);
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to submit leave request');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        const newDocuments = files.map(file => ({
            file,
            name: file.name,
            size: file.size
        }));
        setDocuments([...documents, ...newDocuments]);
        // Reset input
        e.target.value = '';
    };

    const removeDocument = (index) => {
        setDocuments(documents.filter((_, i) => i !== index));
    };

    const calculateDays = () => {
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return days > 0 ? days : 0;
        }
        return 0;
    };

    return (
        <Container>
            <Header>
                <HeaderContent>
                    <Title>Apply for Leave</Title>
                    <Subtitle>Submit a new leave request</Subtitle>
                </HeaderContent>
                <Button
                    $variant="secondary"
                    onClick={() => navigate(`/tenant/${tenantSlug}/leaves/my-leaves`)}
                    style={{ marginTop: '0.25rem', width: 'auto' }}
                >
                    <History size={18} />
                    My Leaves
                </Button>
            </Header>

            {/* User Information Card - All fields editable */}
            <Card>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, color: COLORS.text }}>
                    Your Information
                </h3>
                <UserInfoCard>
                    <FormGroup>
                        <Label htmlFor="user_name">Full Name <RequiredLabel>*</RequiredLabel></Label>
                        <Input
                            type="text"
                            id="user_name"
                            value={formData.user_name}
                            onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                            placeholder="Enter your full name"
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="user_email">Email Address <RequiredLabel>*</RequiredLabel></Label>
                        <Input
                            type="email"
                            id="user_email"
                            value={formData.user_email}
                            onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                            placeholder="Enter your email address"
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="user_branch">Branch <RequiredLabel>*</RequiredLabel></Label>
                        <Input
                            type="text"
                            id="user_branch"
                            value={formData.user_branch}
                            onChange={(e) => setFormData({ ...formData, user_branch: e.target.value })}
                            placeholder="Enter your branch"
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="user_role">Role <RequiredLabel>*</RequiredLabel></Label>
                        <Input
                            type="text"
                            id="user_role"
                            value={formData.user_role}
                            onChange={(e) => setFormData({ ...formData, user_role: e.target.value })}
                            placeholder="Enter your role"
                            required
                        />
                    </FormGroup>
                </UserInfoCard>
            </Card>

            {/* Leave Application Form */}
            <Card>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                {success && <SuccessMessage>{success}</SuccessMessage>}

                <form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label htmlFor="leave_type">
                            Leave Type <RequiredLabel>*</RequiredLabel>
                        </Label>
                        <Select
                            id="leave_type"
                            value={formData.leave_type}
                            onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                            required
                        >
                            <option value="annual">Annual Leave</option>
                            <option value="sick">Sick Leave</option>
                            <option value="maternity">Maternity Leave</option>
                            <option value="paternity">Paternity Leave</option>
                            <option value="compassionate">Compassionate Leave</option>
                            <option value="study">Study Leave</option>
                            <option value="unpaid">Unpaid Leave</option>
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="priority">
                            Priority <RequiredLabel>*</RequiredLabel>
                        </Label>
                        <Select
                            id="priority"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            required
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="emergency">Emergency</option>
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="start_date">
                            Start Date <RequiredLabel>*</RequiredLabel>
                        </Label>
                        <Input
                            type="date"
                            id="start_date"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="end_date">
                            End Date <RequiredLabel>*</RequiredLabel>
                        </Label>
                        <Input
                            type="date"
                            id="end_date"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            min={formData.start_date}
                            required
                        />
                    </FormGroup>

                    {calculateDays() > 0 && (
                        <div style={{
                            padding: '0.75rem',
                            background: COLORS.bg,
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem',
                            color: COLORS.textSecondary
                        }}>
                            <Calendar size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            Total days: <strong>{calculateDays()}</strong>
                        </div>
                    )}

                    <FormGroup>
                        <Label htmlFor="reason">
                            Reason <RequiredLabel>*</RequiredLabel>
                        </Label>
                        <Textarea
                            id="reason"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="Please provide a reason for your leave request..."
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Supporting Documents (Optional)</Label>
                        <label htmlFor="document-upload">
                            <FileUpload>
                                <Upload size={32} color={COLORS.textSecondary} style={{ marginBottom: '0.5rem' }} />
                                <div style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>
                                    Click to upload documents
                                </div>
                                <div style={{ color: COLORS.textSecondary, fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                    PDF, JPG, PNG (Max 5MB each) - You can upload multiple files
                                </div>
                            </FileUpload>
                        </label>
                        <FileInput
                            id="document-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            multiple
                            onChange={handleFileChange}
                        />
                        {documents.length > 0 && (
                            <DocumentsList>
                                {documents.map((doc, index) => (
                                    <DocumentItem key={index}>
                                        <FileText size={16} color={COLORS.info} />
                                        <DocumentName>{doc.name}</DocumentName>
                                        <span style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
                                            {(doc.size / 1024).toFixed(1)} KB
                                        </span>
                                        <RemoveButton
                                            type="button"
                                            onClick={() => removeDocument(index)}
                                        >
                                            <X size={16} />
                                        </RemoveButton>
                                    </DocumentItem>
                                ))}
                            </DocumentsList>
                        )}
                    </FormGroup>

                    <ButtonGroup>
                        <Button
                            type="button"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            $variant="primary"
                            disabled={loading || !formData.leave_type || !formData.start_date || !formData.end_date || !formData.reason}
                        >
                            {loading ? 'Submitting...' : 'Submit Leave Request'}
                        </Button>
                    </ButtonGroup>
                </form>
            </Card>
        </Container>
    );
};

export default ApplyLeave;