import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ENDPOINTS } from '../../../api/endpoints';
import env from '../../../utils/config/env';
import ReusableSignaturePad from '../../../utils/signature/signaturepad';
import { Check, Loader2, XCircle, CheckCircle, X, FileText, User, ArrowLeft, RotateCcw, Truck, UserCheck } from '../../utils/icons/icons';
import styled, { keyframes } from 'styled-components';

// Neutral color scheme matching the HTML design exactly
const COLORS = {
    black: '#0a0a0a',
    dark: '#1a1a1a',
    mid: '#444444',
    gray: '#777777',
    lightGray: '#aaaaaa',
    border: '#c8c8c8',
    borderLight: '#e0e0e0',
    bgField: '#f7f7f5',
    bgAccent: '#f0eeea',
    bgSection: '#fafaf9',
    white: '#FFFFFF',
    bg: '#f5f7fa',
    surface: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    success: '#10b981',
    successLight: '#d1fae5',
    danger: '#ef4444',
    dangerLight: '#fee2e2',
    info: '#3b82f6',
    infoLight: '#dbeafe',
    infoDark: '#2563eb',
    radius: '8px',
    radiusSm: '6px',
    shadowSm: '0 1px 2px rgba(0, 0, 0, 0.04)',
    shadowMd: '0 4px 6px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.15s ease',
};

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components - Professional neutral design
const Container = styled.div`
  min-height: 100vh;
  background: #d5d3cf;
  font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: ${COLORS.dark};
  font-size: 10.5px;
  line-height: 1.5;
`;

const Page = styled.div`
  max-width: 8.5in;
  margin: 24px auto;
  background: white;
  box-shadow: 0 2px 20px rgba(0,0,0,0.12);
  position: relative;
  padding: 0.55in 0.6in;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 48px);
`;

const Header = styled.div`
  background: ${COLORS.surface};
  border-bottom: 2.5px solid ${COLORS.black};
  padding: 1.25rem 2rem;
  margin-bottom: 1rem;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-family: 'Merriweather', Georgia, serif;
  font-size: 1.375rem;
  font-weight: 700;
  margin: 0;
  color: ${COLORS.black};
  text-transform: uppercase;
  letter-spacing: 0.01em;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-family: 'Merriweather', Georgia, serif;
  font-size: 0.8125rem;
  font-weight: 400;
  font-style: italic;
  color: ${COLORS.mid};
  margin: 0.25rem 0 0;
`;

const SaasBrand = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${COLORS.gray};
  margin-bottom: 0.25rem;
`;

const ReleaseIdBlock = styled.div`
  text-align: right;
  margin-bottom: 0.5rem;
`;

const ReleaseIdLabel = styled.div`
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${COLORS.gray};
  margin-bottom: 0.125rem;
`;

const ReleaseIdValue = styled.div`
  font-family: 'Source Sans 3', monospace;
  font-size: 1.125rem;
  font-weight: 700;
  color: ${COLORS.black};
  letter-spacing: 0.08em;
`;

const TopMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
`;

const TopMetaItem = styled.div`
  text-align: right;
`;

const TopMetaLabel = styled.div`
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${COLORS.lightGray};
  margin-bottom: 0.125rem;
`;

const TopMetaValue = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${COLORS.dark};
`;

const SubLine = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.3125rem 0;
  border-bottom: 0.5px solid ${COLORS.borderLight};
  margin-bottom: 1rem;
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${COLORS.lightGray};
`;

const Section = styled.div`
  margin-bottom: 1rem;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.625rem;
  padding: 0.375rem 0.625rem;
  background: ${COLORS.black};
  color: white;
  border-radius: 2px;
`;

const SectionNum = styled.span`
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  opacity: 0.5;
`;

const SectionTitle = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const SectionBody = styled.div`
  padding: 0 0.125rem;
`;

const Row = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const Col = styled.div`
  flex: 1;
  min-width: 0;
`;

const Col2 = styled.div`
  flex: 2;
  min-width: 0;
`;

const Col05 = styled.div`
  flex: 0.5;
  min-width: 0;
`;

const Col06 = styled.div`
  flex: 0.6;
  min-width: 0;
`;

const Col04 = styled.div`
  flex: 0.4;
  min-width: 0;
`;

const Label = styled.label`
  display: block;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${COLORS.gray};
  margin-bottom: 0.1875rem;
`;

const Input = styled.input`
  width: 100%;
  height: 1.75rem;
  border: 1px solid ${COLORS.border};
  border-radius: 2px;
  padding: 0 0.5rem;
  font-family: 'Source Sans 3', sans-serif;
  font-size: 0.6875rem;
  color: ${COLORS.dark};
  background: ${COLORS.bgField};
  transition: border-color 0.15s;

  &:focus {
    outline: none;
    border-color: ${COLORS.black};
    box-shadow: 0 0 0 1.5px rgba(0,0,0,0.08);
  }

  &:disabled {
    background: ${COLORS.bgSection};
    color: ${COLORS.textSecondary};
    cursor: not-allowed;
  }
`;

const InputLg = styled(Input)`
  height: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
`;

const Select = styled.select`
  width: 100%;
  height: 1.75rem;
  border: 1px solid ${COLORS.border};
  border-radius: 2px;
  padding: 0 0.5rem;
  font-family: 'Source Sans 3', sans-serif;
  font-size: 0.6875rem;
  color: ${COLORS.dark};
  background: ${COLORS.bgField};
  transition: border-color 0.15s;

  &:focus {
    outline: none;
    border-color: ${COLORS.black};
    box-shadow: 0 0 0 1.5px rgba(0,0,0,0.08);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 2.75rem;
  border: 1px solid ${COLORS.border};
  border-radius: 2px;
  padding: 0.375rem 0.5rem;
  font-family: 'Source Sans 3', sans-serif;
  font-size: 0.625rem;
  color: ${COLORS.dark};
  background: ${COLORS.bgField};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${COLORS.black};
    box-shadow: 0 0 0 1.5px rgba(0,0,0,0.08);
  }
`;

const CheckGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.125rem;
`;

const CheckItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.3125rem;
  font-size: 0.625rem;
  color: ${COLORS.mid};
  cursor: pointer;
  padding: 0.1875rem 0;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  width: 0.875rem;
  height: 0.875rem;
  border: 1.5px solid ${COLORS.border};
  background: white;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  border-radius: 2px;

  &:checked {
    background: ${COLORS.black};
    border-color: ${COLORS.black};
  }

  &:checked::after {
    content: '';
    position: absolute;
    top: 0.0625rem;
    left: 0.25rem;
    width: 0.25rem;
    height: 0.5rem;
    border: solid white;
    border-width: 0 1.5px 1.5px 0;
    transform: rotate(45deg);
  }
`;

const Radio = styled.input.attrs({ type: 'radio' })`
  appearance: none;
  width: 0.875rem;
  height: 0.875rem;
  border: 1.5px solid ${COLORS.border};
  background: white;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  border-radius: 50%;

  &:checked {
    border-color: ${COLORS.black};
  }

  &:checked::after {
    content: '';
    position: absolute;
    top: 0.1875rem;
    left: 0.1875rem;
    width: 0.4375rem;
    height: 0.4375rem;
    border-radius: 50%;
    background: ${COLORS.black};
  }
`;

const ErrorMessage = styled.span`
  color: ${COLORS.danger};
  font-size: 0.6875rem;
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
    const type = props.type || 'info';
    if (type === 'error') return COLORS.dangerLight;
    if (type === 'success') return COLORS.successLight;
    return COLORS.infoLight;
  }};
  color: ${props => {
    const type = props.type || 'info';
    if (type === 'error') return COLORS.danger;
    if (type === 'success') return COLORS.success;
    return COLORS.infoDark;
  }};
  border: 1px solid ${props => {
    const type = props.type || 'info';
    if (type === 'error') return 'rgba(239, 68, 68, 0.2)';
    if (type === 'success') return 'rgba(16, 185, 129, 0.2)';
    return 'rgba(59, 130, 246, 0.2)';
  }};
`;

const SignatureWrapper = styled.div`
  border: 1px solid ${COLORS.border};
  border-radius: 2px;
  padding: 1rem;
  background: ${COLORS.bgField};
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 0.5px solid ${COLORS.borderLight};
`;

const ReleaseIdDisplay = styled.div`
  background: ${COLORS.bgSection};
  border: 1px solid ${COLORS.border};
  border-radius: 2px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ReleaseIdLabel = styled.span`
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${COLORS.gray};
`;

const ReleaseIdValue = styled.span`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${COLORS.black};
  font-family: 'Courier New', monospace;
  letter-spacing: 0.08em;
`;

const PrimaryButton = styled.button`
  background: ${COLORS.black};
  color: ${COLORS.white};
  border: none;
  border-radius: ${COLORS.radiusSm};
  padding: 0.625rem 1.25rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: ${COLORS.transition};
  box-shadow: ${COLORS.shadowSm};

  &:hover {
    background: ${COLORS.dark};
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
  padding: 0.625rem 1.25rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: ${COLORS.transition};

  &:hover {
    background: ${COLORS.bg};
    border-color: ${COLORS.textSecondary};
  }
`;

const BackButton = styled.button`
  background: ${COLORS.surface};
  color: ${COLORS.text};
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  padding: 0.625rem 1.25rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: ${COLORS.transition};

  &:hover {
    background: ${COLORS.bg};
    border-color: ${COLORS.black};
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
    const [releaseId, setReleaseId] = useState('');
    const [deceasedList, setDeceasedList] = useState([]);
    const [isLoadingDeceasedList, setIsLoadingDeceasedList] = useState(false);

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
        next_kin: '',
        relationship: '',
        date_of_removal: new Date().toISOString().split('T')[0],
        permit_number: '',
        mode_of_transport: 'hearse',
        terms_accepted: false,
        everything_paid: false,
    };

    const [formData, setFormData] = useState(initialFormData);

    // Fetch deceased list for dropdown
    useEffect(() => {
        const fetchDeceasedList = async () => {
            const tenantSlug = getTenantSlug();
            setIsLoadingDeceasedList(true);
            try {
                const response = await fetch(`${env.FULL_API_URL}${ENDPOINTS.DECEASED.LIST}`, {
                    headers: {
                        'x-tenant-slug': tenantSlug,
                        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
                    },
                });

                const result = await response.json();
                if (response.ok && result.data) {
                    // Filter only deceased that are not released
                    const unreleased = result.data.filter((d: any) => 
                        d.body_status !== 'Released' && d.body_status !== 'Transferred'
                    );
                    setDeceasedList(unreleased || []);
                }
            } catch (error) {
                console.error('Error fetching deceased list:', error);
            } finally {
                setIsLoadingDeceasedList(false);
            }
        };

        fetchDeceasedList();
    }, []);

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
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAdmissionChange = (e) => {
        const admissionNumber = e.target.value;
        const selectedDeceased = deceasedList.find(d => d.admission_number === admissionNumber);
        
        setFormData(prev => ({
            ...prev,
            admission_number: admissionNumber,
            ...(selectedDeceased && {
                full_name: selectedDeceased.full_name || '',
                gender: selectedDeceased.gender || '',
                age: selectedDeceased.age || '',
                date_of_birth: selectedDeceased.date_of_birth || '',
                date_of_death: selectedDeceased.date_of_death || '',
                cause_of_death: selectedDeceased.cause_of_death || '',
                contact_person: selectedDeceased.contact_person || '',
                id_number: selectedDeceased.national_id || '',
                tel_number: selectedDeceased.tell_no || '',
            })
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.admission_number) newErrors.admission_number = 'Admission number is required';
        if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.date_admitted) newErrors.date_admitted = 'Date admitted is required';
        if (!formData.time_received) newErrors.time_received = 'Time received is required';
        if (!formData.release_date) newErrors.release_date = 'Release date is required';
        if (!formData.released_by.trim()) newErrors.released_by = 'Released by is required';
        if (!formData.next_kin.trim()) newErrors.next_kin = 'Next of kin is required';
        if (!formData.id_number.trim()) newErrors.id_number = 'ID number is required';
        if (!formData.tell_number.trim()) newErrors.tell_number = 'Telephone number is required';
        if (!formData.terms_accepted) newErrors.terms_accepted = 'You must accept the terms';
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

            const payload = {
                ...formData,
                age: formData.age ? parseInt(formData.age, 10) : null,
                signature: signatureData,
                name_of_deceased: formData.full_name,
                tell_number: formData.tel_number,
            };

            const response = await fetch(`${env.FULL_API_URL}${ENDPOINTS.BODYCHECKOUT.CHECKOUT}`, {
                method: 'POST',
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

            // Set the release ID from backend response
            if (result.data && result.data.release_id) {
                setReleaseId(result.data.release_id);
            }

            setNotification({
                isVisible: true,
                type: 'success',
                title: 'Release Successful',
                message: `Body release created successfully. Release ID: ${result.data?.release_id || 'Generated'}`,
            });

            setTimeout(() => {
                navigate(`/tenant/${tenantSlug}/all-deceased`);
            }, 3000);

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

    const handleClear = () => {
        setFormData(initialFormData);
        setErrors({});
        setReleaseId('');
        sigPadRef.current?.clear();
    };

    if (isLoadingDeceased) {
        return (
            <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader2 size={32} color={COLORS.black} className="animate-spin" />
            </Container>
        );
    }

    return (
        <Container>
            {notification.isVisible && (
                <AlertBox type={notification.type}>
                    {notification.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    <strong>{notification.title}:</strong> {notification.message}
                </AlertBox>
            )}

            <Page>
                {/* Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '0.625rem', borderBottom: '2.5px solid ' + COLORS.black, marginBottom: '0.375rem' }}>
                    <div>
                        <SaasBrand>FuneralOS — Release Management</SaasBrand>
                        <Title>Release of Remains</Title>
                        <Subtitle>Authorization for Removal & Transportation of Deceased</Subtitle>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <ReleaseIdBlock>
                            <ReleaseIdLabel>Release ID</ReleaseIdLabel>
                            <ReleaseIdValue>{releaseId || 'RLS-XXXXXX-XXXX'}</ReleaseIdValue>
                        </ReleaseIdBlock>
                        <TopMeta>
                            <TopMetaItem>
                                <TopMetaLabel>Date Issued</TopMetaLabel>
                                <TopMetaValue>{formData.release_date}</TopMetaValue>
                            </TopMetaItem>
                            <TopMetaItem>
                                <TopMetaLabel>Time</TopMetaLabel>
                                <TopMetaValue>{formData.release_time}</TopMetaValue>
                            </TopMetaItem>
                        </TopMeta>
                    </div>
                </div>

                <SubLine>
                    <span>Confidential Legal Document</span>
                    <span>This form constitutes a binding legal authorization</span>
                </SubLine>

                {/* Section 1: Admission Details */}
                <Section>
                    <SectionHead>
                        <SectionNum>01</SectionNum>
                        <SectionTitle>Admission Details</SectionTitle>
                    </SectionHead>
                    <SectionBody>
                        <Row>
                            <Col2>
                                <Label>Admission Number <span style={{ color: COLORS.danger }}>*</span></Label>
                                <Select
                                    name="admission_number"
                                    value={formData.admission_number}
                                    onChange={handleAdmissionChange}
                                    disabled={!!id || !!location.state?.deceasedId}
                                >
                                    <option value="">Select deceased record</option>
                                    {isLoadingDeceasedList ? (
                                        <option value="" disabled>Loading records...</option>
                                    ) : (
                                        deceasedList.map((deceased) => (
                                            <option key={deceased.deceased_id} value={deceased.admission_number}>
                                                {deceased.admission_number} - {deceased.full_name}
                                            </option>
                                        ))
                                    )}
                                </Select>
                                {errors.admission_number && <ErrorMessage>{errors.admission_number}</ErrorMessage>}
                            </Col2>
                            <Col06>
                                <Label>Date Admitted <span style={{ color: COLORS.danger }}>*</span></Label>
                                <Input
                                    type="date"
                                    name="date_admitted"
                                    value={formData.date_admitted}
                                    onChange={handleChange}
                                />
                                {errors.date_admitted && <ErrorMessage>{errors.date_admitted}</ErrorMessage>}
                            </Col06>
                            <Col06>
                                <Label>Time Received <span style={{ color: COLORS.danger }}>*</span></Label>
                                <Input
                                    type="time"
                                    name="time_received"
                                    value={formData.time_received}
                                    onChange={handleChange}
                                />
                                {errors.time_received && <ErrorMessage>{errors.time_received}</ErrorMessage>}
                            </Col06>
                        </Row>
                    </SectionBody>
                </Section>

                {/* Section 2: Deceased Information */}
                <Section>
                    <SectionHead>
                        <SectionNum>02</SectionNum>
                        <SectionTitle>Deceased Information</SectionTitle>
                    </SectionHead>
                    <SectionBody>
                        <Row>
                            <Col2>
                                <Label>Full Legal Name of Deceased <span style={{ color: COLORS.danger }}>*</span></Label>
                                <InputLg
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Last, First, Middle"
                                />
                                {errors.full_name && <ErrorMessage>{errors.full_name}</ErrorMessage>}
                            </Col2>
                            <Col04>
                                <Label>Sex</Label>
                                <Select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </Select>
                                {errors.gender && <ErrorMessage>{errors.gender}</ErrorMessage>}
                            </Col04>
                        </Row>
                        <Row>
                            <Col>
                                <Label>Date of Birth</Label>
                                <Input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col>
                                <Label>Date of Death</Label>
                                <Input
                                    type="date"
                                    name="date_of_death"
                                    value={formData.date_of_death}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col05>
                                <Label>Age</Label>
                                <Input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="Yrs"
                                    min="0"
                                    max="150"
                                />
                            </Col05>
                        </Row>
                        <Row>
                            <Col2>
                                <Label>Place of Death</Label>
                                <Input
                                    type="text"
                                    name="cause_of_death"
                                    value={formData.cause_of_death}
                                    onChange={handleChange}
                                    placeholder="Facility Name, Address"
                                />
                            </Col>
                            <Col>
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
                            </Col>
                        </Row>
                    </SectionBody>
                </Section>

                {/* Section 3: Next of Kin */}
                <Section>
                    <SectionHead>
                        <SectionNum>03</SectionNum>
                        <SectionTitle>Next of Kin / Authorizing Party</SectionTitle>
                    </SectionHead>
                    <SectionBody>
                        <Row>
                            <Col2>
                                <Label>Next of Kin Full Name <span style={{ color: COLORS.danger }}>*</span></Label>
                                <Input
                                    type="text"
                                    name="next_kin"
                                    value={formData.next_kin}
                                    onChange={handleChange}
                                    placeholder="Last, First, Middle"
                                />
                                {errors.next_kin && <ErrorMessage>{errors.next_kin}</ErrorMessage>}
                            </Col2>
                            <Col>
                                <Label>Relationship</Label>
                                <Input
                                    type="text"
                                    name="relationship"
                                    value={formData.relationship}
                                    onChange={handleChange}
                                    placeholder="Spouse, Child, Parent, etc."
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col2>
                                <Label>Address</Label>
                                <Input
                                    type="text"
                                    name="contact_person"
                                    value={formData.contact_person}
                                    onChange={handleChange}
                                    placeholder="Street Address, City, State, ZIP"
                                />
                            </Col>
                            <Col06>
                                <Label>Telephone No. <span style={{ color: COLORS.danger }}>*</span></Label>
                                <Input
                                    type="tel"
                                    name="tel_number"
                                    value={formData.tel_number}
                                    onChange={handleChange}
                                    placeholder="(XXX) XXX-XXXX"
                                />
                                {errors.tell_number && <ErrorMessage>{errors.tell_number}</ErrorMessage>}
                            </Col06>
                        </Row>
                        <Row>
                            <Col>
                                <Label>ID Number (Govt. Issued) <span style={{ color: COLORS.danger }}>*</span></Label>
                                <Input
                                    type="text"
                                    name="id_number"
                                    value={formData.id_number}
                                    onChange={handleChange}
                                    placeholder="Driver's License / State ID No."
                                />
                                {errors.id_number && <ErrorMessage>{errors.id_number}</ErrorMessage>}
                            </Col>
                        </Row>
                    </SectionBody>
                </Section>

                {/* Section 4: Removal & Transportation */}
                <Section>
                    <SectionHead>
                        <SectionNum>04</SectionNum>
                        <SectionTitle>Removal & Transportation Details</SectionTitle>
                    </SectionHead>
                    <SectionBody>
                        <Row>
                            <Col>
                                <Label>Date of Removal</Label>
                                <Input
                                    type="date"
                                    name="date_of_removal"
                                    value={formData.date_of_removal}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col06>
                                <Label>Time of Removal</Label>
                                <Input
                                    type="time"
                                    name="release_time"
                                    value={formData.release_time}
                                    onChange={handleChange}
                                />
                            </Col06>
                            <Col06>
                                <Label>Permit Number</Label>
                                <Input
                                    type="text"
                                    name="permit_number"
                                    value={formData.permit_number}
                                    onChange={handleChange}
                                    placeholder="Permit No."
                                />
                            </Col06>
                            <Col>
                                <Label>Mode of Transport</Label>
                                <Select
                                    name="mode_of_transport"
                                    value={formData.mode_of_transport}
                                    onChange={handleChange}
                                >
                                    <option value="hearse">Hearse / Van</option>
                                    <option value="air">Air Transport</option>
                                    <option value="rail">Rail</option>
                                    <option value="private">Private Vehicle</option>
                                    <option value="courier">Courier Service</option>
                                    <option value="other">Other</option>
                                </Select>
                            </Col>
                        </Row>
                    </SectionBody>
                </Section>

                {/* Section 5: Release Information */}
                <Section>
                    <SectionHead>
                        <SectionNum>05</SectionNum>
                        <SectionTitle>Release Information</SectionTitle>
                    </SectionHead>
                    <SectionBody>
                        <Row>
                            <Col>
                                <Label>Release Date <span style={{ color: COLORS.danger }}>*</span></Label>
                                <Input
                                    type="date"
                                    name="release_date"
                                    value={formData.release_date}
                                    onChange={handleChange}
                                />
                                {errors.release_date && <ErrorMessage>{errors.release_date}</ErrorMessage>}
                            </Col>
                            <Col>
                                <Label>Released By <span style={{ color: COLORS.danger }}>*</span></Label>
                                <Input
                                    type="text"
                                    name="released_by"
                                    value={formData.released_by}
                                    onChange={handleChange}
                                    placeholder="Name of person releasing the body"
                                />
                                {errors.released_by && <ErrorMessage>{errors.released_by}</ErrorMessage>}
                            </Col>
                        </Row>
                        <Row>
                            <Col2>
                                <Label>Release Notes</Label>
                                <TextArea
                                    name="release_notes"
                                    value={formData.release_notes}
                                    onChange={handleChange}
                                    placeholder="Any additional notes about the release..."
                                    rows="2"
                                />
                            </Col2>
                        </Row>
                    </SectionBody>
                </Section>

                {/* Section 6: Authorizations */}
                <Section>
                    <SectionHead>
                        <SectionNum>06</SectionNum>
                        <SectionTitle>Authorizations</SectionTitle>
                    </SectionHead>
                    <SectionBody>
                        <CheckGrid>
                            <CheckItem>
                                <Checkbox checked readOnly />
                                <span>Release remains from place of death</span>
                            </CheckItem>
                            <CheckItem>
                                <Checkbox checked readOnly />
                                <span>Authorize transportation as specified above</span>
                            </CheckItem>
                            <CheckItem>
                                <Checkbox />
                                <span>Embalming authorized</span>
                            </CheckItem>
                            <CheckItem>
                                <Checkbox />
                                <span>Cremation authorized</span>
                            </CheckItem>
                            <CheckItem>
                                <Checkbox />
                                <span>Pacemaker / implant removal</span>
                            </CheckItem>
                            <CheckItem>
                                <Checkbox />
                                <span>Out-of-state transport</span>
                            </CheckItem>
                            <CheckItem>
                                <Checkbox />
                                <span>Release medical records</span>
                            </CheckItem>
                            <CheckItem>
                                <Checkbox />
                                <span>Hold remains for pickup</span>
                            </CheckItem>
                        </CheckGrid>
                    </SectionBody>
                </Section>

                {/* Section 7: Terms & Conditions */}
                <Section>
                    <SectionHead>
                        <SectionNum>07</SectionNum>
                        <SectionTitle>Terms & Conditions</SectionTitle>
                    </SectionHead>
                    <SectionBody>
                        <div style={{ marginBottom: '0.75rem' }}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                                <Checkbox
                                    name="terms_accepted"
                                    checked={formData.terms_accepted}
                                    onChange={handleChange}
                                />
                                <span style={{ fontSize: '0.6875rem', color: COLORS.mid, lineHeight: '1.5' }}>
                                    I hereby authorize the release and transportation of the deceased. I certify that I am the legally authorized next of kin or representative and have the right to make this authorization.
                                </span>
                            </label>
                            {errors.terms_accepted && <ErrorMessage>{errors.terms_accepted}</ErrorMessage>}
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                                <Checkbox
                                    name="everything_paid"
                                    checked={formData.everything_paid}
                                    onChange={handleChange}
                                />
                                <span style={{ fontSize: '0.6875rem', color: COLORS.mid, lineHeight: '1.5' }}>
                                    I confirm that all outstanding charges and payments have been settled.
                                </span>
                            </label>
                        </div>
                    </SectionBody>
                </Section>

                {/* Section 8: Signature */}
                <Section>
                    <SectionHead>
                        <SectionNum>08</SectionNum>
                        <SectionTitle>Authorization Signature</SectionTitle>
                    </SectionHead>
                    <SectionBody>
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
                    </SectionBody>
                </Section>

                {/* Actions */}
                <ActionsContainer>
                    <SecondaryButton type="button" onClick={() => navigate(-1)}>
                        <ArrowLeft size={15} /> Back
                    </SecondaryButton>
                    <SecondaryButton type="button" onClick={handleClear}>
                        <RotateCcw size={15} /> Clear
                    </SecondaryButton>
                    <PrimaryButton type="button" onClick={handleSubmit} disabled={loading}>
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
            </Page>
        </Container>
    );
};

export default DeceasedReleaseForm;