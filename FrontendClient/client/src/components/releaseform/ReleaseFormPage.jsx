import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Check, Loader2, CheckCircle, X, FileText, User,
  RotateCcw, ShieldCheck, AlertCircle, ArrowRight, Calendar, Clock, Phone, IdCard
} from '../../utils/icons/icons';
import ReusableSignaturePad from '../../utils/signature/signaturepad';

import styled, { keyframes } from 'styled-components';
import { useTenantStore } from '../../modules/seo/useTenantStore';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';

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
  font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: ${COLORS.dark};
  font-size: 10.5px;
  line-height: 1.5;
  padding: 0;
`;

const Page = styled.div`
  max-width: 100%;
  margin: 0;
  background: white;
  position: relative;
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.div`
  background: ${COLORS.surface};
  border-bottom: 2.5px solid ${COLORS.black};
  padding: 1rem 0;
  margin-bottom: 1rem;
`;

const HeaderContent = styled.div`
  max-width: 100%;
  margin: 0;
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

const SignatureWrapper = styled.div`
  border: 1px solid ${COLORS.border};
  border-radius: 2px;
  padding: 1rem;
  background: ${COLORS.bgField};
  margin-top: 0.5rem;
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

const getLoggedInUserEmail = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.email || user.userEmail || '';
  } catch {
    return '';
  }
};

const ReleaseFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantData } = useTenantStore();
  const [deceasedData, setDeceasedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [releaseId, setReleaseId] = useState('');
  const sigPadRef = useRef(null);

  const [formData, setFormData] = useState({
    releasedTo: '',
    relationship: '',
    idNumber: '',
    phoneNumber: '',
    releaseDate: new Date().toISOString().split('T')[0],
    releaseTime: '',
    permitNumber: '',
    itemsReturned: '',
    notes: '',
    receivedBy: '',
    staffName: getLoggedInUserEmail(),
    docsConfirmed: false,
    allDocsComplete: false,
  });
  const [recipientSignature, setRecipientSignature] = useState(null);

  useEffect(() => {
    if (location.state?.deceasedData) {
      setDeceasedData(location.state.deceasedData);
      setIsLoading(false);
    } else {
      fetchDeceasedData();
    }
  }, [id]);

  // Auto-fill current time on component mount
  useEffect(() => {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setFormData(prev => ({ ...prev, releaseTime: currentTime }));
  }, []);

  const fetchDeceasedData = async () => {
    try {
      const tenantSlug = getTenantSlug();
      if (!tenantSlug) {
        toast.error('Tenant information not found');
        setIsLoading(false);
        return;
      }

      const deceasedEndpoint = `${ENDPOINTS.DECEASED.DETAIL(id)}`;
      const response = await api.get(deceasedEndpoint, {
        headers: { 'x-tenant-slug': tenantSlug },
      });
      const data = response.data?.data || response.data || {};
      setDeceasedData(data);
    } catch (error) {
      console.error('Error fetching deceased data:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load deceased information';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.releasedTo.trim()) errors.push('Released To name is required');
    if (!formData.relationship) errors.push('Relationship to Deceased is required');
    if (!formData.idNumber.trim()) errors.push('ID Number is required');
    if (!formData.phoneNumber.trim()) errors.push('Phone Number is required');
    if (!formData.releaseDate) errors.push('Release Date is required');
    if (!formData.releaseTime) errors.push('Release Time is required');
    if (!formData.receivedBy.trim()) errors.push('Received By name is required');
    if (!formData.staffName) errors.push('Staff name is required');
    if (!formData.docsConfirmed) errors.push('Please confirm all documentation is complete');
    if (!recipientSignature) errors.push('Recipient signature is required');

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const tenantSlug = getTenantSlug();
      if (!tenantSlug) {
        toast.error('Tenant information not found');
        setIsSubmitting(false);
        return;
      }

      const releaseData = {
        ...formData,
        transport_carrier: formData.transportCarrier || '',
        vehicle_id: formData.vehicleId || '',
        final_destination: formData.finalDestination || '',
        deceasedId: id,
        admission_number: deceasedData?.admission_number,
        name_of_deceased: deceasedData?.full_name,
        id_number: formData.idNumber,
        next_kin: formData.releasedTo,
        tell_number: formData.phoneNumber,
        relationship: formData.relationship,
        date_of_removal: formData.releaseDate,
        time_of_removal: formData.releaseTime,
        signature: recipientSignature,
        staff_name: formData.staffName,
        terms_accepted: formData.docsConfirmed,
        everything_paid: formData.allDocsComplete,
      };

      const response = await api.post(
        '/body-release/checkout',
        releaseData,
        {
          headers: {
            'x-tenant-slug': tenantSlug,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.data?.success) {
        const generatedReleaseId = response.data?.data?.release_id;
        setReleaseId(generatedReleaseId);
        toast.success('Deceased released successfully!');
        setTimeout(() => navigate(-1), 2000);
      }
    } catch (error) {
      console.error('Error releasing deceased:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to release deceased. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} color={COLORS.black} className="animate-spin" />
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: COLORS.gray }}>Loading release form...</p>
        </div>
      </Container>
    );
  }

  if (!deceasedData) {
    return (
      <Container>
        <Page>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <AlertCircle size={48} color={COLORS.red} style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: COLORS.dark, marginBottom: '0.5rem' }}>Deceased Not Found</h2>
            <p style={{ color: COLORS.textSecondary, marginBottom: '1.5rem' }}>Unable to load deceased information</p>
            <BackButton onClick={() => navigate(-1)}>
              <ArrowRight size={16} /> Go Back
            </BackButton>
          </div>
        </Page>
      </Container>
    );
  }

  const now = new Date();
  const dateIssued = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeIssued = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  
  // Time-based greeting
  const getGreeting = () => {
    const hour = now.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Container>
      <ToastContainer position="top-right" autoClose={3000} />

      <Page>
        {/* Top Bar */}
        <Header>
          <HeaderContent>
            <div>
              <SaasBrand>Authorization Body Removal</SaasBrand>
              <Title>{getGreeting()}</Title>
              <Subtitle>Our heartfelt condolences to you and your family. Please complete the information below to authorize the respectful release and transportation of your loved one.</Subtitle>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <ReleaseIdBlock>
                <ReleaseIdLabel>Release ID</ReleaseIdLabel>
                <ReleaseIdValue>{releaseId || 'Generating...'}</ReleaseIdValue>
              </ReleaseIdBlock>
              <TopMeta>
                <TopMetaItem>
                  <TopMetaLabel>Date</TopMetaLabel>
                  <TopMetaValue>{dateIssued}</TopMetaValue>
                </TopMetaItem>
                <TopMetaItem>
                  <TopMetaLabel>Time</TopMetaLabel>
                  <TopMetaValue>{timeIssued}</TopMetaValue>
                </TopMetaItem>
              </TopMeta>
            </div>
          </HeaderContent>
        </Header>

        <SubLine>
          <span>Confidential Legal Document</span>
          <span>This form constitutes a binding legal authorization</span>
        </SubLine>

        <form onSubmit={handleSubmit} noValidate>
          {/* Section 1: Deceased Information */}
          <Section>
            <SectionHead>
              <SectionNum>01</SectionNum>
              <SectionTitle>Deceased Information</SectionTitle>
            </SectionHead>
            <SectionBody>
              <Row>
                <Col2>
                  <Label>Full Legal Name of Deceased</Label>
                  <InputLg type="text" value={deceasedData?.full_name || ''} readOnly />
                </Col2>
                <Col04>
                  <Label>Admission No.</Label>
                  <InputLg type="text" value={deceasedData?.admission_number || id} readOnly />
                </Col04>
              </Row>
              <Row>
                <Col>
                  <Label>Date of Birth</Label>
                  <Input type="text" value={deceasedData?.date_of_birth ? new Date(deceasedData.date_of_birth).toLocaleDateString() : ''} readOnly />
                </Col>
                <Col>
                  <Label>Date of Death</Label>
                  <Input type="text" value={deceasedData?.date_of_death ? new Date(deceasedData.date_of_death).toLocaleDateString() : ''} readOnly />
                </Col>
                <Col05>
                  <Label>Age</Label>
                  <Input type="text" value={deceasedData?.age || ''} readOnly />
                </Col05>
                <Col05>
                  <Label>Sex</Label>
                  <Input type="text" value={deceasedData?.gender || ''} readOnly />
                </Col05>
              </Row>
            </SectionBody>
          </Section>

          {/* Section 2: Next of Kin */}
          <Section>
            <SectionHead>
              <SectionNum>02</SectionNum>
              <SectionTitle>Next of Kin / Authorizing Party</SectionTitle>
            </SectionHead>
            <SectionBody>
              <Row>
                <Col2>
                  <Label>Next of Kin Full Name *</Label>
                  <Input type="text" name="releasedTo" value={formData.releasedTo} onChange={handleInputChange} placeholder="Last, First, Middle" required />
                </Col2>
                <Col>
                  <Label>Relationship *</Label>
                  <Select name="relationship" value={formData.relationship} onChange={handleInputChange} required>
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="other">Other</option>
                  </Select>
                </Col>
              </Row>
              <Row>
                <Col2>
                  <Label>Telephone No. *</Label>
                  <Input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="(XXX) XXX-XXXX" required />
                </Col2>
              </Row>
              <Row>
                <Col>
                  <Label>ID Number (Govt. Issued) *</Label>
                  <Input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} placeholder="Driver's License / State ID No." required />
                </Col>
              </Row>
            </SectionBody>
          </Section>

          {/* Section 3: Removal Details */}
          <Section>
            <SectionHead>
              <SectionNum>03</SectionNum>
              <SectionTitle>Removal & Transportation Details</SectionTitle>
            </SectionHead>
            <SectionBody>
              <HighlightRow>
                <Row>
                  <Col>
                    <Label>Date of Removal *</Label>
                    <Input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleInputChange} required />
                  </Col>
                  <Col06>
                    <Label>Time of Removal *</Label>
                    <Input type="time" name="releaseTime" value={formData.releaseTime} onChange={handleInputChange} required />
                  </Col06>
                  <Col>
                    <Label>Permit Number</Label>
                    <Input type="text" name="permitNumber" value={formData.permitNumber || ''} onChange={handleInputChange} placeholder="Permit No." />
                  </Col>
                </Row>
              </HighlightRow>

              <Row>
                <Col>
                  <Label>Mode of Transport</Label>
                  <CheckGrid>
                    <CheckItem><Radio name="transport" value="hearse" checked readOnly /> Hearse / Van</CheckItem>
                    <CheckItem><Radio name="transport" value="air" readOnly /> Air Transport</CheckItem>
                    <CheckItem><Radio name="transport" value="rail" readOnly /> Rail</CheckItem>
                    <CheckItem><Radio name="transport" value="private" readOnly /> Private Vehicle</CheckItem>
                    <CheckItem><Radio name="transport" value="courier" readOnly /> Courier Service</CheckItem>
                    <CheckItem><Radio name="transport" value="other" readOnly /> Other</CheckItem>
                  </CheckGrid>
                </Col>
              </Row>

              <Row>
                <Col2>
                  <Label>Transport Carrier / Driver Name</Label>
                  <Input type="text" name="transportCarrier" placeholder="Company Name or Driver Full Name" />
                </Col2>
                <Col>
                  <Label>Vehicle / Carrier ID</Label>
                  <Input type="text" name="vehicleId" placeholder="Vehicle Plate / Carrier Ref. No." />
                </Col>
              </Row>

              <Row>
                <Col>
                  <Label>Final Destination</Label>
                  <Input type="text" name="finalDestination" placeholder="Cemetery, Mausoleum, Scattering Location, or Other Final Disposition Site" />
                </Col>
              </Row>
            </SectionBody>
          </Section>

          {/* Section 4: Authorizations */}
          <Section>
            <SectionHead>
              <SectionNum>04</SectionNum>
              <SectionTitle>Authorizations</SectionTitle>
            </SectionHead>
            <SectionBody>
              <CheckGrid>
                <CheckItem><Checkbox checked readOnly /> Release remains from place of death</CheckItem>
                <CheckItem><Checkbox checked readOnly /> Authorize transportation as specified above</CheckItem>
                <CheckItem><Checkbox readOnly /> Embalming authorized</CheckItem>
                <CheckItem><Checkbox readOnly /> Cremation authorized</CheckItem>
                <CheckItem><Checkbox readOnly /> Pacemaker / implant removal</CheckItem>
                <CheckItem><Checkbox readOnly /> Out-of-state transport</CheckItem>
                <CheckItem><Checkbox readOnly /> Release medical records</CheckItem>
                <CheckItem><Checkbox readOnly /> Hold remains for pickup</CheckItem>
              </CheckGrid>
            </SectionBody>
          </Section>

          {/* Section 5: Signatures */}
          <Section>
            <SectionHead>
              <SectionNum>05</SectionNum>
              <SectionTitle>Signatures & Acknowledgments</SectionTitle>
            </SectionHead>
            <SectionBody>
              <Row>
                <Col>
                  <Label>Received By (Name) *</Label>
                  <Input type="text" name="receivedBy" value={formData.receivedBy} onChange={handleInputChange} placeholder="Name of person receiving" required />
                  <SignatureWrapper>
                    <Label>Signature *</Label>
                    <ReusableSignaturePad
                      penColor="#000080"
                      penWidth={2.5}
                      placeholder="Sign here"
                      onChange={setRecipientSignature}
                      style={{ height: '120px' }}
                    />
                  </SignatureWrapper>
                </Col>
              </Row>
            </SectionBody>
          </Section>

          {/* Section 6: Documentation Checklist */}
          <Section>
            <SectionHead>
              <SectionNum>06</SectionNum>
              <SectionTitle>Documentation Checklist</SectionTitle>
            </SectionHead>
            <SectionBody>
              <CheckGrid>
                <CheckItem><Checkbox name="docsConfirmed" checked={formData.docsConfirmed} onChange={handleInputChange} required /> All required documents verified and complete</CheckItem>
                <CheckItem><Checkbox name="allDocsComplete" checked={formData.allDocsComplete} onChange={handleInputChange} /> Medical records released</CheckItem>
                <CheckItem><Checkbox readOnly checked /> Death certificate issued</CheckItem>
                <CheckItem><Checkbox readOnly checked /> ID verified</CheckItem>
                <CheckItem><Checkbox readOnly /> Postmortem report attached (if applicable)</CheckItem>
              </CheckGrid>
            </SectionBody>
          </Section>

          {/* Legal Text */}
          <LegalBlock>
            <LegalText><strong>DECLARATION:</strong> I, the undersigned, being the legally authorized next of kin or duly appointed representative of the above-named deceased, do hereby authorize the release, removal, and transportation of the remains from the stated place of death to the specified destination and final destination as indicated in this document.</LegalText>
            <LegalText><strong>CERTIFICATION OF AUTHORITY:</strong> I certify that I possess the legal right and authority to make this authorization under applicable state and local laws. I affirm that no other person holds a superior legal claim to the disposition of these remains.</LegalText>
            <LegalText><strong>INDEMNIFICATION:</strong> I hereby release, indemnify, and hold harmless the funeral home, its officers, directors, employees, agents, assignees, and any contracted transport provider from and against any and all claims, liabilities, damages, costs, and expenses arising out of or related to this authorization.</LegalText>
          </LegalBlock>

          {/* Notice Bar */}
          <NoticeBar>
            <NoticeBarText>
              <strong>NOTICE:</strong> This document is a legal authorization for the release and transportation of human remains. It should be retained in the permanent records of both the releasing facility and the receiving facility.
            </NoticeBarText>
          </NoticeBar>

          {/* Actions */}
          <ActionsContainer>
            <BackButton type="button" onClick={() => navigate(-1)}>
              Cancel
            </BackButton>
            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={16} /> Confirm Release
                </>
              )}
            </PrimaryButton>
          </ActionsContainer>
        </form>

        <Footer>
          <FooterLeft>Funeral OS Release Form — Generated {dateIssued}</FooterLeft>
          <FooterRight>RP . Page 1 of 1 — Original</FooterRight>
        </Footer>
      </Page>
    </Container>
  );
};

export default ReleaseFormPage;