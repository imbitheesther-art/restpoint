import React, { useState } from 'react';
import styled from 'styled-components';
import { api, ENDPOINTS } from '../../api';
import { Calendar, FileText, Upload, X } from 'lucide-react';

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
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
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

const Card = styled.div`
  background: ${COLORS.white};
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid ${COLORS.border};
  padding: 2rem;
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

const ApplyLeave = () => {
    const [formData, setFormData] = useState({
        leave_type: 'annual',
        start_date: '',
        end_date: '',
        reason: '',
        is_half_day: false
    });
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

            const response = await api.post(ENDPOINTS.LEAVE.APPLY, submitData);

            if (response?.data?.status === 'success') {
                setSuccess('Leave request submitted successfully!');
                setFormData({
                    leave_type: 'annual',
                    start_date: '',
                    end_date: '',
                    reason: '',
                    is_half_day: false
                });
                setDocument(null);

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    window.location.href = '/leaves';
                }, 2000);
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to submit leave request');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setDocument(file);
        }
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
                <Title>Apply for Leave</Title>
                <Subtitle>Submit a new leave request</Subtitle>
            </Header>

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
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                            id="reason"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="Please provide a reason for your leave request..."
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Supporting Document (Optional)</Label>
                        <label htmlFor="document-upload">
                            <FileUpload>
                                <Upload size={32} color={COLORS.textSecondary} style={{ marginBottom: '0.5rem' }} />
                                <div style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>
                                    {document ? document.name : 'Click to upload a document'}
                                </div>
                                <div style={{ color: COLORS.textLight, fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                    PDF, JPG, PNG (Max 5MB)
                                </div>
                            </FileUpload>
                        </label>
                        <FileInput
                            id="document-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                        />
                        {document && (
                            <FileInfo>
                                <FileText size={16} color={COLORS.info} />
                                <span style={{ flex: 1, fontSize: '0.9rem' }}>{document.name}</span>
                                <button
                                    type="button"
                                    onClick={() => setDocument(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: COLORS.danger,
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </FileInfo>
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
                            disabled={loading || !formData.leave_type || !formData.start_date || !formData.end_date}
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