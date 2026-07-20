import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



import styled from 'styled-components';
import { useTenantStore } from '../../modules/seo/useTenantStore';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';

const Colors = {
  primary: '#1a1a1a',
  primaryGradient: 'linear-gradient(135deg, #3D4F47 0%, #2E3F37 100%)',
  accent: '#8B7355',
  accentHover: '#A98F6E',
  success: '#475A43',
  danger: '#9B4A3F',
  warning: '#8B7355',
  lightGray: '#FAF8F4',
  mediumGray: '#E3DDD0',
  darkGray: '#1a1a1a',
  textMuted: '#6B6862',
  cardBg: '#FFFFFF',
  borderColor: '#E3DDD0',
  inputBg: '#FFFFFF',
  inputFocus: '#8B7355',
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  background: ${Colors.lightGray};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${Colors.accent};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${Colors.darkGray};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Card = styled.div`
  background: ${Colors.cardBg};
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid ${Colors.borderColor};
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${Colors.darkGray};
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid ${Colors.accent}20;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${Colors.darkGray};
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${Colors.borderColor};
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${Colors.accent};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${Colors.borderColor};
  border-radius: 0.5rem;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${Colors.accent};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${Colors.borderColor};
  border-radius: 0.5rem;
  font-size: 0.95rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${Colors.accent};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${Colors.borderColor};
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;

  ${(props) =>
    props.variant === 'primary'
      ? `
    background: ${Colors.accent};
    color: white;
    &:hover { background: #2563eb; }
  `
      : props.variant === 'success'
        ? `
    background: ${Colors.success};
    color: white;
    &:hover { background: #059669; }
  `
        : props.variant === 'gold'
          ? `
    background: linear-gradient(135deg, #A67C52 0%, #C9A876 100%);
    color: white;
    &:hover { opacity: 0.9; }
  `
          : `
    background: ${Colors.mediumGray};
    color: ${Colors.darkGray};
    &:hover { background: #cbd5e1; }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${Colors.borderColor};

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: ${Colors.textMuted};
  font-size: 0.875rem;
`;

const InfoValue = styled.span`
  font-weight: 500;
  color: ${Colors.darkGray};
  font-size: 0.95rem;
`;

const SignatureBox = styled.div`
  border: 2px dashed ${Colors.borderColor};
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  margin-top: 1rem;
  background: ${Colors.lightGray};
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) =>
    props.status === 'dispatched'
      ? '#dcfce7'
      : props.status === 'pending'
        ? '#fef3c7'
        : '#fee2e2'};
  color: ${(props) =>
    props.status === 'dispatched'
      ? '#166534'
      : props.status === 'pending'
        ? '#92400e'
        : '#991b1b'};
`;

const TenantHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  color: white;
`;

const TenantLogo = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: contain;
  background: rgba(255,255,255,0.1);
  padding: 4px;
`;

const TenantLogoPlaceholder = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: linear-gradient(135deg, #A67C52 0%, #C9A876 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
`;

// Helper to get tenant slug
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

const ReleaseFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantData } = useTenantStore();
  const [deceasedData, setDeceasedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    releasedTo: '',
    relationship: '',
    idNumber: '',
    phoneNumber: '',
    releaseDate: new Date().toISOString().split('T')[0],
    releaseTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    itemsReturned: '',
    notes: '',
    receivedBy: '',
    witnessName: '',
  });

  useEffect(() => {
    // Check if data was passed via navigation state
    if (location.state?.deceasedData) {
      setDeceasedData(location.state.deceasedData);
      setIsLoading(false);
    } else {
      fetchDeceasedData();
    }
  }, [id]);

  const fetchDeceasedData = async () => {
    try {
      const tenantSlug = getTenantSlug();
      if (!tenantSlug) {
        toast.error('Tenant information not found');
        setIsLoading(false);
        return;
      }

      console.log('Fetching deceased data for ID:', id, 'Tenant:', tenantSlug);
      const deceasedEndpoint = `${ENDPOINTS.DECEASED.DETAIL(id)}`;
      const response = await api.get(deceasedEndpoint, {
        headers: { 'x-tenant-slug': tenantSlug },
      });
      const data = response.data?.data || response.data || {};
      console.log('Deceased data fetched:', data);
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        deceasedId: id,
        status: 'dispatched',
        releasedAt: new Date().toISOString(),
      };

      console.log('Submitting release form:', releaseData);

      const dispatchEndpoint = `${ENDPOINTS.DECEASED.BASE}/dispatch/${id}`;
      const response = await api.post(
        dispatchEndpoint,
        releaseData,
        {
          headers: {
            'x-tenant-slug': tenantSlug,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('Release successful:', response.data);
      toast.success('Deceased released successfully!');
      setTimeout(() => navigate(-1), 2000);
    } catch (error) {
      console.error('Error releasing deceased:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to release deceased. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const tenantName = tenantData?.name || 'Rest Point Funeral Home';
    const tenantLogo = tenantData?.logo || '';
    const tenantPhone = tenantData?.phone || '';
    const tenantEmail = tenantData?.email || '';
    const tenantLocation = tenantData?.location || '';

    const printContent = `<!DOCTYPE html>
<html><head><title>Release Form - ${deceasedData?.full_name || 'Deceased'}</title>
<style>
@page { margin: 1.5cm; size: A4; }
body { font-family: Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; }
.header { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #A67C52; padding-bottom: 16px; margin-bottom: 24px; }
.logo { width: 64px; height: 64px; border-radius: 12px; object-fit: contain; }
.logo-ph { width: 64px; height: 64px; border-radius: 12px; background: #A67C52; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 800; }
.tenant-info h1 { margin: 0; font-size: 20px; } .tenant-info p { margin: 2px 0; font-size: 12px; color: #64748b; }
.title { text-align: center; font-size: 18px; font-weight: 700; margin: 24px 0; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
.section { margin-bottom: 20px; } .section h3 { font-size: 14px; color: #A67C52; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
.info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dotted #e2e8f0; font-size: 13px; }
.info-label { color: #64748b; } .info-value { font-weight: 600; }
.signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 32px; }
.sig-box { border-top: 2px solid #1e293b; padding-top: 8px; text-align: center; font-size: 12px; color: #64748b; }
.footer { margin-top: 32px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
</style></head><body>
<div class="header">
${tenantLogo ? `<img src="${tenantLogo}" class="logo" alt="Logo" />` : '<div class="logo-ph">RP</div>'}
<div class="tenant-info"><h1>${tenantName}</h1>${tenantPhone ? `<p>📞 ${tenantPhone}</p>` : ''}${tenantEmail ? `<p>📧 ${tenantEmail}</p>` : ''}${tenantLocation ? `<p>📍 ${tenantLocation}</p>` : ''}</div>
</div>
<div class="title">📋 RELEASE FORM</div>
<div class="section"><h3>Deceased Information</h3><div class="info-grid">
<div class="info-row"><span class="info-label">Full Name:</span><span class="info-value">${deceasedData?.full_name || 'N/A'}</span></div>
<div class="info-row"><span class="info-label">Deceased ID:</span><span class="info-value">${deceasedData?.deceased_id || id}</span></div>
<div class="info-row"><span class="info-label">Date of Death:</span><span class="info-value">${deceasedData?.date_of_death ? new Date(deceasedData.date_of_death).toLocaleDateString() : 'N/A'}</span></div>
<div class="info-row"><span class="info-label">Gender:</span><span class="info-value">${deceasedData?.gender || 'N/A'}</span></div>
<div class="info-row"><span class="info-label">County:</span><span class="info-value">${deceasedData?.county || 'N/A'}</span></div>
<div class="info-row"><span class="info-label">Status:</span><span class="info-value">${deceasedData?.status || 'N/A'}</span></div>
</div></div>
<div class="section"><h3>Release Details</h3><div class="info-grid">
<div class="info-row"><span class="info-label">Released To:</span><span class="info-value">${formData.releasedTo || 'N/A'}</span></div>
<div class="info-row"><span class="info-label">Relationship:</span><span class="info-value">${formData.relationship || 'N/A'}</span></div>
<div class="info-row"><span class="info-label">ID Number:</span><span class="info-value">${formData.idNumber || 'N/A'}</span></div>
<div class="info-row"><span class="info-label">Phone:</span><span class="info-value">${formData.phoneNumber || 'N/A'}</span></div>
<div class="info-row"><span class="info-label">Release Date:</span><span class="info-value">${formData.releaseDate || 'N/A'}</span></div>
<div class="info-row"><span class="info-label">Release Time:</span><span class="info-value">${formData.releaseTime || 'N/A'}</span></div>
</div>
${formData.itemsReturned ? `<p style="font-size:13px"><strong>Items Returned:</strong> ${formData.itemsReturned}</p>` : ''}
${formData.notes ? `<p style="font-size:13px"><strong>Notes:</strong> ${formData.notes}</p>` : ''}
</div>
<div class="signature-grid">
<div><div class="sig-box">Received By: ${formData.receivedBy || '________________'}</div></div>
<div><div class="sig-box">Witness: ${formData.witnessName || '________________'}</div></div>
</div>
<div class="footer">Generated by ${tenantName} • ${new Date().toLocaleString()}</div>
</body></html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
    toast.success('Release form generated!');
  };

  if (isLoading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: Colors.textMuted }}>Loading release form...</p>
        </div>
      </Container>
    );
  }

  if (!deceasedData) {
    return (
      <Container>
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <AlertCircle size={48} color={Colors.danger} style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: Colors.darkGray, marginBottom: '0.5rem' }}>Deceased Not Found</h2>
            <p style={{ color: Colors.textMuted, marginBottom: '1.5rem' }}>Unable to load deceased information</p>
            <Button variant="primary" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Go Back
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Tenant Header */}
      <TenantHeader>
        {tenantData?.logo ? (
          <TenantLogo src={tenantData.logo} alt={tenantData.name} />
        ) : (
          <TenantLogoPlaceholder>{(tenantData?.name || 'RP').slice(0, 2).toUpperCase()}</TenantLogoPlaceholder>
        )}
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{tenantData?.name || 'Funeral Home'}</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.7 }}>
            {tenantData?.location && `📍 ${tenantData.location}`}
            {tenantData?.phone && ` • 📞 ${tenantData.phone}`}
            {tenantData?.email && ` • 📧 ${tenantData.email}`}
          </p>
        </div>
      </TenantHeader>

      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back
        </BackButton>
        <Title>
          <FileText size={24} /> Release Form
        </Title>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button variant="gold" onClick={() => setIsEditing(!isEditing)}>
            <Edit3 size={16} /> {isEditing ? 'Preview' : 'Edit'}
          </Button>
          <Button variant="secondary" onClick={handlePrint}>
            <Print size={16} /> Print
          </Button>
          <Button variant="secondary" onClick={handleDownloadPDF}>
            <Download size={16} /> Generate PDF
          </Button>
        </div>
      </Header>

      <Card>
        <CardTitle><User size={18} /> Deceased Information</CardTitle>
        <Grid>
          <InfoRow>
            <InfoLabel>Full Name</InfoLabel>
            <InfoValue>{deceasedData.full_name || 'N/A'}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Deceased ID</InfoLabel>
            <InfoValue>{deceasedData.deceased_id || id}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Date of Death</InfoLabel>
            <InfoValue>{deceasedData.date_of_death ? new Date(deceasedData.date_of_death).toLocaleDateString() : 'N/A'}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Gender</InfoLabel>
            <InfoValue>{deceasedData.gender || 'N/A'}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>County</InfoLabel>
            <InfoValue>{deceasedData.county || 'N/A'}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Status</InfoLabel>
            <StatusBadge status={deceasedData.status || 'pending'}>
              {deceasedData.status || 'Pending'}
            </StatusBadge>
          </InfoRow>
        </Grid>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardTitle><Users size={18} /> Release Details</CardTitle>
          <Grid>
            <FormGroup>
              <Label><User size={14} /> Released To (Full Name) *</Label>
              <Input
                type="text"
                name="releasedTo"
                value={formData.releasedTo}
                onChange={handleInputChange}
                placeholder="Enter full name of person receiving the deceased"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label><Users size={14} /> Relationship to Deceased *</Label>
              <Select
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
                required
              >
                <option value="">Select relationship</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="child">Child</option>
                <option value="sibling">Sibling</option>
                <option value="other-family">Other Family</option>
                <option value="funeral-director">Funeral Director</option>
                <option value="legal-representative">Legal Representative</option>
                <option value="other">Other</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label><IdCard size={14} /> ID Number *</Label>
              <Input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                placeholder="Enter ID/Passport number"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label><Phone size={14} /> Phone Number *</Label>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label><Calendar size={14} /> Release Date *</Label>
              <Input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label><Clock size={14} /> Release Time *</Label>
              <Input
                type="time"
                name="releaseTime"
                value={formData.releaseTime}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          </Grid>

          <FormGroup>
            <Label><Truck size={14} /> Items Returned</Label>
            <TextArea
              name="itemsReturned"
              value={formData.itemsReturned}
              onChange={handleInputChange}
              placeholder="List any personal effects, documents, or items being returned with the deceased..."
              rows={3}
            />
          </FormGroup>

          <FormGroup>
            <Label>Additional Notes</Label>
            <TextArea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes or comments..."
              rows={3}
            />
          </FormGroup>
        </Card>

        <Card>
          <CardTitle><Signature size={18} /> Signatures</CardTitle>
          <Grid>
            <FormGroup>
              <Label>Received By (Name) *</Label>
              <Input
                type="text"
                name="receivedBy"
                value={formData.receivedBy}
                onChange={handleInputChange}
                placeholder="Name of person receiving"
                required
              />
              <SignatureBox>
                <p style={{ color: Colors.textMuted, fontSize: '0.875rem', margin: 0 }}>
                  Signature will be captured digitally or on print
                </p>
              </SignatureBox>
            </FormGroup>
            <FormGroup>
              <Label>Witness Name</Label>
              <Input
                type="text"
                name="witnessName"
                value={formData.witnessName}
                onChange={handleInputChange}
                placeholder="Witness name (optional)"
              />
              <SignatureBox>
                <p style={{ color: Colors.textMuted, fontSize: '0.875rem', margin: 0 }}>
                  Witness signature
                </p>
              </SignatureBox>
            </FormGroup>
          </Grid>
        </Card>

        <ButtonGroup>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={18} /> Confirm Release
              </>
            )}
          </Button>
        </ButtonGroup>
      </form>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
          button { display: none !important; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Container>
  );
};

export default ReleaseFormPage;
