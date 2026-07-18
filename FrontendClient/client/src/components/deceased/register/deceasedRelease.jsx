import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ENDPOINTS } from '../../../api/endpoints';
import env from '../../../utils/config/env';
import ReusableSignaturePad from '../../../utils/signature/signaturepad';
import {
    UserPlus,
    Check,
    Loader2,
    AlertTriangle,
    XCircle,
    CheckCircle,
    X,
    FileText,
    Clock,
    User,
    ArrowLeft,
    RotateCcw,
    Truck,
    Send,
    MapPin,
    Calendar,
    UserCheck,
} from 'lucide-react';
import styled, { keyframes } from 'styled-components';

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

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: ${COLORS.bg};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: ${COLORS.text};
`;

const Header = styled.div`
  background: ${COLORS.surface};
  border-bottom: 1px solid ${COLORS.border};
  padding: 1.25rem 2rem;
  box-shadow: ${COLORS.shadowSm};
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.375rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: ${COLORS.text};
`;

const Subtitle = styled.p`
  color: ${COLORS.textSecondary};
  font-size: 0.8125rem;
  margin: 0.25rem 0 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

const BackButton = styled.button`
  background: ${COLORS.surface};
  color: ${COLORS.primary};
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
    border-color: ${COLORS.primary};
  }
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
`;

const Card = styled.div`
  background: ${COLORS.surface};
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowSm};
  border: 1px solid ${COLORS.border};
  overflow: hidden;
  margin-bottom: 1rem;
`;

const CardHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${COLORS.bg};
`;

const CardTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardBody = styled.div`
  padding: 1.25rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.375rem;
  font-size: 0.8125rem;
  color: ${COLORS.text};

  .required {
    color: ${COLORS.danger};
    margin-left: 0.25rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  font-size: 0.8125rem;
  color: ${COLORS.text};
  background: ${COLORS.surface};
  transition: ${COLORS.transition};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.accentGlow};
  }

  &:disabled {
    background: ${COLORS.bg};
    color: ${COLORS.textSecondary};
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  font-size: 0.8125rem;
  color: ${COLORS.text};
  background: ${COLORS.surface};
  transition: ${COLORS.transition};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.accentGlow};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  font-size: 0.8125rem;
  color: ${COLORS.text};
  background: ${COLORS.surface};
  transition: ${COLORS.transition};
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.accentGlow};
  }
`;

const ErrorMessage = styled.span`
  color: ${COLORS.danger};
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
`;

const AlertBox = styled.div`
  padding: 0.75rem 1rem;
  border-radius: ${COLORS.radiusSm};
  font-size: 0.8125rem;
  font-weight: 500;
  text-align: center;
  margin-bottom: 1rem;
  background: ${props => {
        if (props.$type === 'error') return COLORS.dangerLight;
        if (props.$type === 'success') return COLORS.successLight;
        return COLORS.infoLight;
    }};
  color: ${props => {
        if (props.$type === 'error') return COLORS.danger;
        if (props.$type === 'success') return COLORS.success;
        return COLORS.info;
    }};
  border: 1px solid ${props => {
        if (props.$type === 'error') return 'rgba(239, 68, 68, 0.2)';
        if (props.$type === 'success') return 'rgba(16, 185, 129, 0.2)';
        return 'rgba(59, 130, 246, 0.2)';
    }};
`;

const SignatureWrapper = styled.div`
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  padding: 1rem;
  background: ${COLORS.bg};
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${COLORS.border};
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

const DeceasedReleaseForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const sigPadRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({
        isVisible: false, type: 'info', title: '', message: '',
    });
    const [deceasedData, setDeceasedData] = useState(null);
    const [isLoadingDeceased, setIsLoadingDeceased] = useState(false);
    const [showDispatchModal, setShowDispatchModal] = useState(false);

    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    const initialFormData = {
        admission_number: location.state?.permitNumber || '',
        date_admitted: new Date().toISOString().split('T')[0],
        time_received: getCurrentTime(),
        full_name: '',
        gender: '',
        age: '',
        date_of_birth: '',
        date_of_death: '',
        cause_of_death: '',
        body_status: 'Released',
        contact_person: '',
        id_number: '',
        tel_number: '',
        release_date: new Date().toISOString().split('T')[0],
        release_time: getCurrentTime(),
        released_by: '',
        release_notes: '',
    };

    const [formData, setFormData] = useState(initialFormData);

    // Fetch deceased data if ID is provided
    useEffect(() => {
        const fetchDeceasedData = async () => {
            const deceasedId = id || location.state?.deceasedId;
            if (!deceasedId) return;

            setIsLoadingDeceased(true);
            try {
                const tenantSlug = getTenantSlug();
                const response = await fetch(`${env.FULL_API_URL}${ENDPOINTS.DECEASED.DETAIL(deceasedId)}`, {
                    headers: {
                        'x-tenant-slug': tenantSlug,
                        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
                    },
                });

                const result = await response.json();
                if (response.ok && result.data) {
                    setDeceasedData(result.data);
                    // Pre-fill form with existing data
                    setFormData(prev => ({
                        ...prev,
                        ...result.data,
                        release_date: new Date().toISOString().split('T')[0],
                        release_time: getCurrentTime(),
                    }));
                }
            } catch (error) {
                console.error('Error fetching deceased data:', error);
            } finally {
                setIsLoadingDeceased(false);
            }
        };

        fetchDeceasedData();
    }, [id, location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.date_admitted) newErrors.date_admitted = 'Date admitted is required';
        if (!formData.time_received) newErrors.time_received = 'Time received is required';
        if (!formData.release_date) newErrors.release_date = 'Release date is required';
        if (!formData.released_by.trim()) newErrors.released_by = 'Released by is required';
        if (sigPadRef.current?.isEmpty()) {
            newErrors.signature = 'Signature is required to proceed';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const tenantSlug = getTenantSlug();
            const signatureData = sigPadRef.current?.toDataURL();
            const deceasedId = id || location.state?.deceasedId;

            const payload = {
                ...formData,
                age: formData.age ? parseInt(formData.age, 10) : null,
                signature: signatureData,
                status: 'released',
                release_date: formData.release_date,
                release_time: formData.release_time,
                released_by: formData.released_by,
                release_notes: formData.release_notes,
            };

            const endpoint = deceasedId
                ? `${env.FULL_API_URL}${ENDPOINTS.DECEASED.UPDATE(deceasedId)}`
                : `${env.FULL_API_URL}${ENDPOINTS.DECEASED.CREATE}`;

            const response = await fetch(endpoint, {
                method: deceasedId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-slug': tenantSlug,
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Release failed');
            }

            setNotification({
                isVisible: true,
                type: 'success',
                title: 'Release Successful',
                message: `Deceased record has been ${deceasedId ? 'updated' : 'registered'} and released.`,
            });

            setTimeout(() => {
                navigate(`/tenant/${tenantSlug}/all-deceased`);
            }, 2000);

        } catch (error) {
            setNotification({
                isVisible: true,
                type: 'error',
                title: 'Release Failed',
                message: error.message || 'Something went wrong.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDispatchBody = () => {
        const deceasedId = id || location.state?.deceasedId;
        if (deceasedId) {
            navigate(`/tenant/${getTenantSlug()}/dispatch/${deceasedId}`, {
                state: { deceasedData }
            });
        } else {
            alert('Please save the deceased record first before dispatching');
        }
    };

    const handleClear = () => {
        setFormData(initialFormData);
        setErrors({});
        sigPadRef.current?.clear();
    };

    if (isLoadingDeceased) {
        return (
            <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader2 size={32} color={COLORS.primary} className="animate-spin" />
            </Container>
        );
    }

    return (
        <Container>
            {notification.isVisible && (
                <AlertBox $type={notification.type}>
                    {notification.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    <strong>{notification.title}:</strong> {notification.message}
                </AlertBox>
            )}

            <Header>
                <HeaderContent>
                    <div>
                        <Title>
                            <UserCheck size={24} />
                            {id || location.state?.deceasedId ? 'Release Deceased' : 'Register Deceased'}
                        </Title>
                        <Subtitle>
                            {deceasedData ? `Processing: ${deceasedData.full_name}` : 'Fill in the required details'}
                            {deceasedData?.deceased_id && <span> • ID: {deceasedData.deceased_id}</span>}
                        </Subtitle>
                    </div>
                    <HeaderActions>
                        {deceasedData && (
                            <PrimaryButton onClick={handleDispatchBody}>
                                <Truck size={15} /> Dispatch Body
                            </PrimaryButton>
                        )}
                        <SecondaryButton onClick={handleClear}>
                            <RotateCcw size={15} /> Clear
                        </SecondaryButton>
                        <BackButton onClick={() => navigate(-1)}>
                            <ArrowLeft size={15} /> Back
                        </BackButton>
                    </HeaderActions>
                </HeaderContent>
            </Header>

            <MainContent>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} noValidate>
                    {/* Admission Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <FileText size={16} />
                                Admission Details
                            </CardTitle>
                        </CardHeader>
                        <CardBody>
                            <FormGrid>
                                <FormGroup>
                                    <Label>Admission Number</Label>
                                    <Input
                                        type="text"
                                        name="admission_number"
                                        value={formData.admission_number}
                                        onChange={handleChange}
                                        disabled
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Date Admitted <span className="required">*</span></Label>
                                    <Input
                                        type="date"
                                        name="date_admitted"
                                        value={formData.date_admitted}
                                        onChange={handleChange}
                                        className={errors.date_admitted ? 'drf-input-err' : ''}
                                    />
                                    {errors.date_admitted && <ErrorMessage>{errors.date_admitted}</ErrorMessage>}
                                </FormGroup>
                                <FormGroup>
                                    <Label>Time Received <span className="required">*</span></Label>
                                    <Input
                                        type="time"
                                        name="time_received"
                                        value={formData.time_received}
                                        onChange={handleChange}
                                        className={errors.time_received ? 'drf-input-err' : ''}
                                    />
                                    {errors.time_received && <ErrorMessage>{errors.time_received}</ErrorMessage>}
                                </FormGroup>
                            </FormGrid>
                        </CardBody>
                    </Card>

                    {/* Deceased Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <User size={16} />
                                Deceased Information
                            </CardTitle>
                        </CardHeader>
                        <CardBody>
                            <FormGrid>
                                <FormGroup style={{ gridColumn: '1 / -1' }}>
                                    <Label>Full Name <span className="required">*</span></Label>
                                    <Input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Enter full name"
                                        className={errors.full_name ? 'drf-input-err' : ''}
                                    />
                                    {errors.full_name && <ErrorMessage>{errors.full_name}</ErrorMessage>}
                                </FormGroup>
                                <FormGroup>
                                    <Label>Gender <span className="required">*</span></Label>
                                    <Select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className={errors.gender ? 'drf-input-err' : ''}
                                    >
                                        <option value="" disabled>Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </Select>
                                    {errors.gender && <ErrorMessage>{errors.gender}</ErrorMessage>}
                                </FormGroup>
                                <FormGroup>
                                    <Label>Age</Label>
                                    <Input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="e.g. 45"
                                        min="0"
                                        max="150"
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Date of Birth</Label>
                                    <Input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleChange}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Date of Death</Label>
                                    <Input
                                        type="date"
                                        name="date_of_death"
                                        value={formData.date_of_death}
                                        onChange={handleChange}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Body Status</Label>
                                    <Select
                                        name="body_status"
                                        value={formData.body_status}
                                        onChange={handleChange}
                                    >
                                        <option value="" disabled>Select status</option>
                                        <option value="In Morgue">In Morgue</option>
                                        <option value="Pending Autopsy">Pending Autopsy</option>
                                        <option value="Released">Released</option>
                                        <option value="Transferred">Transferred</option>
                                    </Select>
                                </FormGroup>
                                <FormGroup style={{ gridColumn: '1 / -1' }}>
                                    <Label>Cause of Death</Label>
                                    <TextArea
                                        name="cause_of_death"
                                        value={formData.cause_of_death}
                                        onChange={handleChange}
                                        placeholder="Brief description if known..."
                                        rows="2"
                                    />
                                </FormGroup>
                            </FormGrid>
                        </CardBody>
                    </Card>

                    {/* Contact & Identification */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <FileText size={16} />
                                Contact & Identification
                            </CardTitle>
                        </CardHeader>
                        <CardBody>
                            <FormGrid>
                                <FormGroup>
                                    <Label>Contact Person</Label>
                                    <Input
                                        type="text"
                                        name="contact_person"
                                        value={formData.contact_person}
                                        onChange={handleChange}
                                        placeholder="Next of kin"
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>ID Number</Label>
                                    <Input
                                        type="text"
                                        name="id_number"
                                        value={formData.id_number}
                                        onChange={handleChange}
                                        placeholder="National ID / Passport"
                                    />
                                </FormGroup>
                                <FormGroup style={{ gridColumn: '1 / -1' }}>
                                    <Label>Tel Number</Label>
                                    <Input
                                        type="tel"
                                        name="tel_number"
                                        value={formData.tel_number}
                                        onChange={handleChange}
                                        placeholder="+254 7XX XXX XXX"
                                    />
                                </FormGroup>
                            </FormGrid>
                        </CardBody>
                    </Card>

                    {/* Release Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <CheckCircle size={16} />
                                Release Information
                            </CardTitle>
                        </CardHeader>
                        <CardBody>
                            <FormGrid>
                                <FormGroup>
                                    <Label>Release Date <span className="required">*</span></Label>
                                    <Input
                                        type="date"
                                        name="release_date"
                                        value={formData.release_date}
                                        onChange={handleChange}
                                        className={errors.release_date ? 'drf-input-err' : ''}
                                    />
                                    {errors.release_date && <ErrorMessage>{errors.release_date}</ErrorMessage>}
                                </FormGroup>
                                <FormGroup>
                                    <Label>Release Time <span className="required">*</span></Label>
                                    <Input
                                        type="time"
                                        name="release_time"
                                        value={formData.release_time}
                                        onChange={handleChange}
                                    />
                                </FormGroup>
                                <FormGroup style={{ gridColumn: '1 / -1' }}>
                                    <Label>Released By <span className="required">*</span></Label>
                                    <Input
                                        type="text"
                                        name="released_by"
                                        value={formData.released_by}
                                        onChange={handleChange}
                                        placeholder="Name of person releasing the body"
                                        className={errors.released_by ? 'drf-input-err' : ''}
                                    />
                                    {errors.released_by && <ErrorMessage>{errors.released_by}</ErrorMessage>}
                                </FormGroup>
                                <FormGroup style={{ gridColumn: '1 / -1' }}>
                                    <Label>Release Notes</Label>
                                    <TextArea
                                        name="release_notes"
                                        value={formData.release_notes}
                                        onChange={handleChange}
                                        placeholder="Any additional notes about the release..."
                                        rows="3"
                                    />
                                </FormGroup>
                            </FormGrid>
                        </CardBody>
                    </Card>

                    {/* Signature */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <CheckCircle size={16} />
                                Authorization Signature
                            </CardTitle>
                        </CardHeader>
                        <CardBody>
                            <SignatureWrapper>
                                <ReusableSignaturePad
                                    ref={sigPadRef}
                                    penColor="#1A1D24"
                                    placeholder="Sign here to authorize release"
                                    showSave={false}
                                />
                                {errors.signature && (
                                    <ErrorMessage style={{ marginTop: '0.5rem' }}>{errors.signature}</ErrorMessage>
                                )}
                            </SignatureWrapper>
                        </CardBody>
                    </Card>

                    {/* Actions */}
                    <ActionsContainer>
                        <SecondaryButton type="button" onClick={() => navigate(-1)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Check size={15} />
                                    {id || location.state?.deceasedId ? 'Update & Release' : 'Register & Release'}
                                </>
                            )}
                        </PrimaryButton>
                    </ActionsContainer>
                </form>
            </MainContent>
        </Container>
    );
};

export default DeceasedReleaseForm;