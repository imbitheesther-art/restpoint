import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ENDPOINTS } from '../../../api/endpoints';
import env from '../../../utils/config/env';
import { ToastContainer, toast } from 'react-toastify';
import { getTenantSlug, getAuthToken } from '../../../utils/globalAuth';
import ReusableSignaturePad from '../../../utils/signature/signaturepad';
import { IDScannerComponent } from '../../../utils/idScanner.jsx?t=20250620';
import {
  Check, Loader2, CheckCircle, X, FileText, User,
  RotateCcw, ShieldCheck, AlertCircle, ArrowRight, Calendar, Clock, Phone, IdCard, ScanBarcode
} from '../../../utils/icons/icons';
import styled, { keyframes } from 'styled-components';

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
    red: '#c0392b',
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

const Container = styled.div`
  min-height: 100vh;
  background: #d5d3cf;
  font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: ${COLORS.dark};
  font-size: 10.5px;
  line-height: 1.5;
`;

const Page = styled.div`
  max-width: 100%;
  margin: 0;
  background: white;
  position: relative;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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

const AdmissionIdBlock = styled.div`
  text-align: right;
  margin-bottom: 0.5rem;
`;

const AdmissionIdLabel = styled.div`
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${COLORS.gray};
  margin-bottom: 0.125rem;
`;

const AdmissionIdValue = styled.div`
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

const Col15 = styled.div`
  flex: 1.5;
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
    background: #eeedeb;
    color: ${COLORS.gray};
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

const SigCard = styled.div`
  border: 1px solid ${COLORS.border};
  border-radius: 3px;
  overflow: hidden;
`;

const SigCardHead = styled.div`
  background: ${COLORS.bgAccent};
  padding: 0.3125rem 0.625rem;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${COLORS.gray};
  border-bottom: 1px solid ${COLORS.borderLight};
`;

const SigCardBody = styled.div`
  padding: 0.625rem;
`;

const SigCanvasWrap = styled.div`
  border: 1px dashed ${COLORS.border};
  border-radius: 2px;
  height: 5.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${COLORS.bgField};
  cursor: crosshair;
  position: relative;
  margin-bottom: 0.375rem;
  overflow: hidden;
`;

const SigPlaceholder = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.6875rem;
  color: ${COLORS.lightGray};
  font-style: italic;
  pointer-events: none;
  transition: opacity 0.2s;
`;

const SigLine = styled.div`
  border-bottom: 1px solid ${COLORS.dark};
  height: 2.375rem;
  margin-bottom: 0.25rem;
  position: relative;
`;

const SigMetaRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.375rem;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 0.5px solid ${COLORS.borderLight};
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

const HighlightRow = styled.div`
  background: ${COLORS.bgAccent};
  padding: 0.5rem 0.625rem;
  border-radius: 2px;
  margin-bottom: 0.5rem;
`;

const LegalBlock = styled.div`
  padding: 0.75rem 0.875rem;
  background: ${COLORS.bgSection};
  border: 1px solid ${COLORS.borderLight};
  border-left: 3px solid ${COLORS.black};
  border-radius: 0 3px 3px 0;
  margin-bottom: 0.625rem;
`;

const LegalText = styled.p`
  font-size: 0.6875rem;
  line-height: 1.65;
  color: ${COLORS.mid};
  margin-bottom: 0.375rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const NoticeBar = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  padding: 0.5rem 0.625rem;
  background: #fff9f0;
  border: 1px solid #f0e0c0;
  border-radius: 2px;
  margin-bottom: 0.75rem;
`;

const NoticeBarText = styled.div`
  font-size: 0.6875rem;
  color: ${COLORS.mid};
  line-height: 1.5;
`;

const FacilityUse = styled.div`
  padding: 0.625rem 0.75rem;
  background: #f0f3f7;
  border: 1px solid #d8dfe8;
  border-radius: 2px;
  margin-top: 0.625rem;
`;

const FacilityUseTitle = styled.div`
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #6a7d94;
  margin-bottom: 0.5rem;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 0.5px solid ${COLORS.borderLight};
  margin-top: auto;
`;

const FooterLeft = styled.div`
  font-size: 0.5625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${COLORS.lightGray};
`;

const FooterRight = styled.div`
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${COLORS.lightGray};
`;

const ScanButton = styled.button`
  height: 1.75rem;
  padding: 0 0.75rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${COLORS.gray};
  background: ${COLORS.bgField};
  border: 1px solid ${COLORS.border};
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3125rem;
  transition: all 0.15s;
  font-family: 'Source Sans 3', sans-serif;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    color: ${COLORS.dark};
    border-color: ${COLORS.black};
  }
`;

const ClearSigButton = styled.button`
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${COLORS.gray};
  background: none;
  border: 1px solid ${COLORS.borderLight};
  border-radius: 2px;
  padding: 0.125rem 0.5rem;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'Source Sans 3', sans-serif;

  &:hover {
    color: ${COLORS.dark};
    border-color: ${COLORS.border};
  }
`;


const DeceasedRegistrationForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sigPadRef1 = useRef(null);

    const [loading, setLoading] = useState(false);
    const [loadingAdmission, setLoadingAdmission] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showIdScanner, setShowIdScanner] = useState(false);
    const [admissionId, setAdmissionId] = useState('');

    // Get logged-in user email from storage
    const getLoggedInUserEmail = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.email || user.userEmail || '';
        } catch {
            return '';
        }
    };

    const initialFormData = {
        admission_number: location.state?.permitNumber || '',
        date_admitted: new Date().toISOString().split('T')[0],
        time_received: '',
        full_name: '',
        gender: '',
        age: '',
        date_of_birth: '',
        date_of_death: '',
        cause_of_death: '',
        body_status: '',
        place_of_death: '',
        contact_person: '',
        id_number: '',
        id_type: '',
        tel_number: '',
        alternative_phone: '',
        email: '',
        received_from: '',
        receiving_officer: '',
        signature: '',
        verified_by: getLoggedInUserEmail(),
        permit_number: '',
    };

    const [formData, setFormData] = useState(initialFormData);

    // Fetch admission number when gender changes
    useEffect(() => {
        if (!formData.gender) return;

        const fetchAdmissionNumber = async () => {
            setLoadingAdmission(true);
            try {
                const tenantSlug = getTenantSlug();
                const token = getAuthToken();
                const response = await fetch(
                    `${env.FULL_API_URL}${ENDPOINTS.DECEASED.ADMISSION_NUMBER(formData.gender)}`,
                    {
                        headers: {
                            'x-tenant-slug': tenantSlug,
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data?.admission_number) {
                        setAdmissionId(result.data.admission_number);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch admission number:', error);
            } finally {
                setLoadingAdmission(false);
            }
        };

        fetchAdmissionNumber();
    }, [formData.gender]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (message.text) setMessage({ type: '', text: '' });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.date_admitted) newErrors.date_admitted = 'Date admitted is required';
        if (!formData.time_received) newErrors.time_received = 'Time received is required';
        
        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        // Phone validation (Kenyan format: +254XXXXXXXXX or 07XXXXXXXX)
        if (formData.tel_number && !/^(\+254|0)[17]\d{8}$/.test(formData.tel_number.replace(/\s/g, ''))) {
            newErrors.tel_number = 'Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)';
        }
        
        // Alternative phone validation
        if (formData.alternative_phone && !/^(\+254|0)[17]\d{8}$/.test(formData.alternative_phone.replace(/\s/g, ''))) {
            newErrors.alternative_phone = 'Please enter a valid Kenyan phone number';
        }
        
        if (sigPadRef1.current?.isEmpty()) {
            newErrors.signature = 'Signature is required to proceed';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const tenantSlug = getTenantSlug();
            const token = getAuthToken();
            const signatureData = sigPadRef1.current?.toDataURL();

            const payload = {
                full_name: formData.full_name,
                cause_of_death: formData.cause_of_death,
                date_of_birth: formData.date_of_birth || null,
                national_id: formData.id_number,
                received_from: formData.received_from,
                age: formData.age ? parseInt(formData.age, 10) : 0,
                time_received: formData.time_received,
                body_status: formData.body_status || 'Normal Condition',
                contact_person: formData.contact_person,
                tell_no: formData.tel_number,
                gender: formData.gender,
                date_of_death: formData.date_of_death || null,
                place_of_death: formData.place_of_death || null,
                id_type: formData.id_type || null,
                alternative_phone: formData.alternative_phone || null,
                email: formData.email || null,
                receiving_officer: formData.receiving_officer || null,
                verified_by: formData.verified_by || null,
                relationship: formData.relationship || null,
                permit_no: formData.permit_number || null,
                date_admitted: formData.date_admitted,
                signature: signatureData,
            };

            const response = await fetch(`${env.FULL_API_URL}${ENDPOINTS.DECEASED.CREATE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-slug': tenantSlug,
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Registration failed');
            }

            // Show success message
            toast.success(`Successfully registered: ${formData.full_name}`);
            
            // Reset form for next registration
            setFormData({
                ...initialFormData,
                verified_by: getLoggedInUserEmail(),
            });
            setAdmissionId('');
            sigPadRef1.current?.clear();
            setErrors({});

        } catch (error) {
            toast.error(error.message || 'Registration failed. Please try again.');
            setMessage({
                type: 'error',
                text: error.message || 'Something went wrong. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        setFormData({
            ...initialFormData,
            verified_by: getLoggedInUserEmail(),
        });
        setErrors({});
        setMessage({ type: '', text: '' });
        setAdmissionId('');
        sigPadRef1.current?.clear();
    };

    const handleIdScanComplete = (scanResult) => {
        if (scanResult.success && scanResult.parsedFields) {
            const { idNumber, fullName, dateOfBirth, gender } = scanResult.parsedFields;

            setFormData(prev => ({
                ...prev,
                id_number: idNumber || prev.id_number,
                full_name: fullName || prev.full_name,
                date_of_birth: dateOfBirth || prev.date_of_birth,
                gender: gender || prev.gender,
            }));

            toast.success('ID card scanned successfully!');
        } else {
            toast.error('Failed to scan ID card. Please try again.');
        }
        setShowIdScanner(false);
    };

    if (loading && !showSuccess) {
        return (
            <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={48} color={COLORS.black} className="animate-spin" />
                    <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: COLORS.gray }}>Registering deceased...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <ToastContainer position="top-right" />

            <Page>
                {/* Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '0.625rem', borderBottom: '2.5px solid ' + COLORS.black, marginBottom: '0.375rem' }}>
                    <div>
                        <SaasBrand>Welcome & We are deeply sorry for your loss. </SaasBrand>
                        <Title>Admission Information</Title>
                        <Subtitle>Please provide the information needed to begin the admission process.</Subtitle>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <AdmissionIdBlock>
                            <AdmissionIdLabel>Admission ID</AdmissionIdLabel>
                            <AdmissionIdValue>
                                {loadingAdmission ? (
                                    <span style={{ fontSize: '0.75rem', color: COLORS.gray }}>Generating...</span>
                                ) : (
                                    admissionId || 'Select gender to generate'
                                )}
                            </AdmissionIdValue>
                        </AdmissionIdBlock>
                        <TopMeta>
                            <TopMetaItem>
                                <TopMetaLabel>Date</TopMetaLabel>
                                <TopMetaValue>{formData.date_admitted}</TopMetaValue>
                            </TopMetaItem>
                            <TopMetaItem>
                                <TopMetaLabel>Time</TopMetaLabel>
                                <TopMetaValue>{formData.time_received}</TopMetaValue>
                            </TopMetaItem>
                        </TopMeta>
                    </div>
                </div>

                <SubLine>
                    <span>Confidential Medical-Legal Record</span>
                    <span>This document constitutes an official intake record</span>
                </SubLine>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Section 1: Admission Details */}
                    <Section>
                        <SectionHead>
                            <SectionNum>01</SectionNum>
                            <SectionTitle>Admission Details</SectionTitle>
                        </SectionHead>
                        <SectionBody>
                            <HighlightRow>
                                <Row>
                                    <Col2>
                                        <Label>Admission Number</Label>
                                        <InputLg
                                            type="text"
                                            name="admission_number"
                                            value={admissionId || formData.admission_number}
                                            className="inp-disabled"
                                            placeholder="Auto-generated from gender"
                                            readOnly
                                            disabled
                                        />
                                    </Col2>
                                    <Col>
                                        <Label>Date Admitted <span style={{ color: COLORS.red }}>*</span></Label>
                                        <InputLg
                                            type="date"
                                            name="date_admitted"
                                            value={formData.date_admitted}
                                            onChange={handleChange}
                                        />
                                        {errors.date_admitted && <ErrorMessage>{errors.date_admitted}</ErrorMessage>}
                                    </Col>
                                    <Col06>
                                        <Label>Time Received <span style={{ color: COLORS.red }}>*</span></Label>
                                        <InputLg
                                            type="time"
                                            name="time_received"
                                            value={formData.time_received}
                                            onChange={handleChange}
                                        />
                                        {errors.time_received && <ErrorMessage>{errors.time_received}</ErrorMessage>}
                                    </Col06>
                                </Row>
                            </HighlightRow>
                            <Row>
                                <Col>
                                    <Label>Permit Number</Label>
                                    <Input
                                        type="text"
                                        name="permit_number"
                                        value={formData.permit_number}
                                        onChange={handleChange}
                                        placeholder="Permit/Reference Number"
                                    />
                                </Col>
                                <Col>
                                    <Label>Received From (Facility / Person)</Label>
                                    <Input
                                        type="text"
                                        name="received_from"
                                        value={formData.received_from}
                                        onChange={handleChange}
                                        placeholder="Hospital, Home, Police, Other"
                                    />
                                </Col>
                                <Col>
                                    <Label>Receiving Officer</Label>
                                    <Input
                                        type="text"
                                        name="receiving_officer"
                                        value={formData.receiving_officer}
                                        onChange={handleChange}
                                        placeholder="Officer / Staff Name"
                                    />
                                </Col>
                            </Row>
                        </SectionBody>
                    </Section>

                    {/* Section 2: Deceased Information */}
                    <Section>
                        <SectionHead>
                            <SectionNum>02</SectionNum>
                            <SectionTitle>Deceased Personal Information</SectionTitle>
                        </SectionHead>
                        <SectionBody>
                            <Row>
                                <Col2>
                                    <Label>Full Legal Name of Deceased <span style={{ color: COLORS.red }}>*</span></Label>
                                    <InputLg
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Last, First, Middle Name"
                                    />
                                    {errors.full_name && <ErrorMessage>{errors.full_name}</ErrorMessage>}
                                </Col2>
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
                                <Col05>
                                    <Label>Sex <span style={{ color: COLORS.red }}>*</span></Label>
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
                                </Col05>
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
                            </Row>
                            <Row>
                                <Col2>
                                    <Label>Place of Death</Label>
                                    <Input
                                        type="text"
                                        name="place_of_death"
                                        value={formData.place_of_death}
                                        onChange={handleChange}
                                        placeholder="Facility Name, Address, or Residence"
                                    />
                                </Col2>
                            </Row>
                            <Row>
                                <Col2>
                                    <Label>Cause of Death</Label>
                                    <TextArea
                                        name="cause_of_death"
                                        value={formData.cause_of_death}
                                        onChange={handleChange}
                                        placeholder="Preliminary cause if known — clinical notes, pending autopsy, etc."
                                        rows="2"
                                    />
                                </Col2>
                            </Row>
                            <Row>
                                <Col>
                                    <Label>Body Status (Optional)</Label>
                                    <Input
                                        type="text"
                                        name="body_status"
                                        value={formData.body_status}
                                        onChange={handleChange}
                                        placeholder="e.g. In Morgue, Pending Autopsy, etc."
                                    />
                                </Col>
                            </Row>
                        </SectionBody>
                    </Section>

                    {/* Section 3: Contact & ID */}
                    <Section>
                        <SectionHead>
                            <SectionNum>03</SectionNum>
                            <SectionTitle>Next of Kin — Contact & Identification</SectionTitle>
                        </SectionHead>
                        <SectionBody>
                            <Row>
                                <Col2>
                                    <Label>Next of Kin Full Name</Label>
                                    <Input
                                        type="text"
                                        name="contact_person"
                                        value={formData.contact_person}
                                        onChange={handleChange}
                                        placeholder="Last, First, Middle"
                                    />
                                </Col2>
                                <Col>
                                    <Label>Relationship to Deceased</Label>
                                    <Input
                                        type="text"
                                        name="relationship"
                                        value={formData.relationship}
                                        onChange={handleChange}
                                        placeholder="Spouse, Child, Parent, Sibling, etc."
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col15>
                                    <Label>ID Number (Government-Issued)</Label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Input
                                            type="text"
                                            name="id_number"
                                            value={formData.id_number}
                                            onChange={handleChange}
                                            placeholder="National ID / Passport / Driver's License No."
                                            style={{ flex: 1 }}
                                        />
                                        <ScanButton
                                            type="button"
                                            onClick={() => setShowIdScanner(true)}
                                            disabled={loading}
                                        >
                                            <ScanBarcode size={13} />
                                            Scan ID
                                        </ScanButton>
                                    </div>
                                </Col15>
                                <Col06>
                                    <Label>ID Type</Label>
                                    <Select
                                        name="id_type"
                                        value={formData.id_type}
                                        onChange={handleChange}
                                    >
                                        <option value="" disabled>Select</option>
                                        <option value="national-id">National ID</option>
                                        <option value="passport">Passport</option>
                                        <option value="voters-card">Voter's Card</option>
                                        <option value="other">Other</option>
                                    </Select>
                                </Col06>
                            </Row>
                            <Row>
                                <Col>
                                    <Label>Telephone Number</Label>
                                    <Input
                                        type="tel"
                                        name="tel_number"
                                        value={formData.tel_number}
                                        onChange={handleChange}
                                        placeholder="+254 7XX XXX XXX"
                                    />
                                </Col>
                                <Col>
                                    <Label>Alternative Phone</Label>
                                    <Input
                                        type="tel"
                                        name="alternative_phone"
                                        value={formData.alternative_phone}
                                        onChange={handleChange}
                                        placeholder="+254 7XX XXX XXX"
                                    />
                                </Col>
                            <Col06>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                />
                                {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                            </Col06>
                            </Row>
                        </SectionBody>
                    </Section>

                    {/* Section 4: Belongings */}
                    <Section>
                        <SectionHead>
                            <SectionNum>04</SectionNum>
                            <SectionTitle>Personal Effects & Valuables Inventory</SectionTitle>
                        </SectionHead>
                        <SectionBody>
                            <CheckGrid style={{ marginBottom: '0.5rem' }}>
                                <CheckItem><Checkbox type="checkbox" /> Wallet / Purse</CheckItem>
                                <CheckItem><Checkbox type="checkbox" /> Mobile Phone</CheckItem>
                                <CheckItem><Checkbox type="checkbox" /> Jewelry</CheckItem>
                                <CheckItem><Checkbox type="checkbox" /> Watch</CheckItem>
                                <CheckItem><Checkbox type="checkbox" /> Keys</CheckItem>
                                <CheckItem><Checkbox type="checkbox" /> Clothing</CheckItem>
                                <CheckItem><Checkbox type="checkbox" /> Eyewear</CheckItem>
                                <CheckItem><Checkbox type="checkbox" /> Dentures</CheckItem>
                                <CheckItem><Checkbox type="checkbox" /> Prosthetics</CheckItem>
                                <CheckItem><Checkbox type="checkbox" /> Medical Devices</CheckItem>
                                <CheckItem><Checkbox type="checkbox" /> Cash / Currency</CheckItem>
                                <CheckItem><Checkbox type="checkbox" /> Documents</CheckItem>
                                <CheckItem><Checkbox type="checkbox" /> None</CheckItem>
                                <CheckItem><Checkbox type="checkbox" /> Other (specify below)</CheckItem>
                            </CheckGrid>
                            <Row>
                                <Col2>
                                    <Label>Detailed Description / Additional Items</Label>
                                    <TextArea
                                        name="belongings_description"
                                        value={formData.belongings_description}
                                        onChange={handleChange}
                                        placeholder="List all items with description, quantity, and estimated value if applicable..."
                                        rows="2"
                                    />
                                </Col2>
                            </Row>
                        </SectionBody>
                    </Section>

                    {/* Section 5: Declaration */}
                    <Section>
                        <SectionHead>
                            <SectionNum>05</SectionNum>
                            <SectionTitle>Declaration & Authorization</SectionTitle>
                        </SectionHead>
                        <SectionBody>
                            <LegalBlock>
                                <LegalText>
                                    <strong>DECLARATION:</strong> I, the undersigned, being the legally authorized next of kin or duly appointed representative of the above-named deceased, do hereby confirm that the information provided in this intake record is true, accurate, and complete to the best of my knowledge. I authorize the admission and temporary custody of the remains by this facility for the purpose of preparation, safekeeping, and eventual disposition in accordance with applicable laws.
                                </LegalText>
                                <LegalText>
                                    <strong>LIABILITY:</strong> I understand that personal effects listed herein remain my responsibility to claim within thirty (30) days. Unclaimed items may be disposed of at the facility's discretion without further liability. I release the facility, its officers, employees, and agents from any claim arising from the handling, storage, or processing of the remains except in cases of proven gross negligence.
                                </LegalText>
                                <LegalText>
                                    <strong>IDENTITY:</strong> I confirm that I have presented a valid government-issued identification document as noted in Section 03, and that I possess the legal authority to authorize this intake.
                                </LegalText>
                            </LegalBlock>
                        </SectionBody>
                    </Section>

                    {/* Section 6: Signatures */}
                    <Section>
                        <SectionHead>
                            <SectionNum>06</SectionNum>
                            <SectionTitle>Signatures <span style={{ color: COLORS.red, fontWeight: 800 }}>*</span></SectionTitle>
                        </SectionHead>
                        <SectionBody>
                            <SigCard>
                                <SigCardHead>Authorized Signature</SigCardHead>
                                <SigCardBody>
                                    <SigCanvasWrap style={{ height: '8rem' }}>
                                        <ReusableSignaturePad
                                            ref={sigPadRef1}
                                            penColor="#000080"
                                            placeholder="Sign here"
                                            showSave={false}
                                        />
                                    </SigCanvasWrap>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.375rem' }}>
                                        <ClearSigButton
                                            type="button"
                                            onClick={() => sigPadRef1.current?.clear()}
                                        >
                                            Clear
                                        </ClearSigButton>
                                    </div>
                                </SigCardBody>
                            </SigCard>
                            {errors.signature && (
                                <ErrorMessage style={{ marginTop: '0.5rem' }}>{errors.signature}</ErrorMessage>
                            )}
                        </SectionBody>
                    </Section>

                    {/* Notice */}
                    <NoticeBar>
                        <div style={{ flexShrink: 0, width: '0.875rem', height: '0.875rem', marginTop: '0.0625rem' }}>
                            <AlertCircle size={14} />
                        </div>
                        <NoticeBarText>
                            <strong>Notice:</strong> Signature is mandatory to complete intake. This document must be retained in the deceased's permanent file for a minimum of five (5) years as required by law. A copy shall be provided to the authorizing party upon request.
                        </NoticeBarText>
                    </NoticeBar>

                    {/* Facility Use */}
                    <FacilityUse>
                        <FacilityUseTitle>For Facility Use Only</FacilityUseTitle>
                        <Row style={{ marginBottom: 0 }}>
                            <Col>
                                <Label>Verified By</Label>
                                <Input
                                    type="email"
                                    name="verified_by"
                                    value={formData.verified_by}
                                    onChange={handleChange}
                                    placeholder="user@email.com"
                                />
                            </Col>
                        </Row>
                    </FacilityUse>

                    {/* Actions */}
                    <ActionsContainer style={{ justifyContent: 'space-between' }}>
                        <SecondaryButton type="button" onClick={() => navigate(`/tenant/${getTenantSlug()}/all-deceased`)}>
                            <ArrowRight size={15} style={{ transform: 'rotate(180deg)' }} /> Back to All Deceased
                        </SecondaryButton>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <SecondaryButton type="button" onClick={handleClear} disabled={isSubmitting}>
                                <RotateCcw size={15} /> Clear Form
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={15} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Check size={15} />
                                        Register Deceased
                                    </>
                                )}
                            </PrimaryButton>
                        </div>
                    </ActionsContainer>
                </form>

                {/* Footer */}
                <Footer>
                    <FooterLeft>FuneralOS Intake Record — Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</FooterLeft>
                    <FooterRight>Page 1 of 1 — Original</FooterRight>
                </Footer>
            </Page>

            {/* ID Scanner Modal */}
            {showIdScanner && (
                <IDScannerComponent
                    onScanComplete={handleIdScanComplete}
                    onClose={() => setShowIdScanner(false)}
                    autoCapture={true}
                    captureDelay={3000}
                />
            )}
        </Container>
    );
}

export default DeceasedRegistrationForm;