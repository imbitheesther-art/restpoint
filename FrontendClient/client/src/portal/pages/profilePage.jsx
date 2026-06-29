import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Heart,
  Shield,
  Home,
  DollarSign,
  Tag,
  Clock,
  Award,
  Navigation,
  Star,
  FileText,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  background-image: url('/public/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

`;

const GlassCard = styled.div`
  background: rgba(16, 16, 20, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  padding: 1rem;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.5),
    0 1px 0 rgba(255, 255, 255, 0.05) inset,
    0 -1px 0 rgba(0, 0, 0, 0.6) inset;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  position: relative;
`;

const Name = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0.5rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const StatusContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin: 1rem 0;
  flex-wrap: wrap;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.status === 'Ready' 
    ? 'linear-gradient(135deg, rgba(72, 187, 120, 0.15), rgba(72, 187, 120, 0.05))' 
    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))'};
  color: ${props => props.status === 'Ready' ? '#48bb78' : '#f59e0b'};
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid ${props => props.status === 'Ready' 
    ? 'rgba(72, 187, 120, 0.3)' 
    : 'rgba(245, 158, 11, 0.3)'};
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;

const DeceasedId = styled.div`
  color: #94a3b8;
  font-size: 0.85rem;
  font-family: 'SF Mono', 'Courier New', monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin: 1.5rem 0;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.05);
    border-color: rgba(102, 126, 234, 0.2);
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Section = styled.div`
  margin-bottom: 1.25rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(102, 126, 234, 0.3);
  }
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconWrapper = styled.span`
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.4rem;
  border-radius: 10px;
`;

const Content = styled.div`
  padding: ${props => props.isOpen ? '1rem 0' : '0'};
  max-height: ${props => props.isOpen ? '2000px' : '0'};
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(102, 126, 234, 0.2);
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

const Value = styled.span`
  color: white;
  font-weight: 600;
  text-align: right;
  font-size: 0.9rem;
  flex: 1;
`;

const MapContainer = styled.div`
  border-radius: 16px;
  overflow: hidden;
  margin: 1rem 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Map = styled.iframe`
  width: 100%;
  height: 180px;
  border: none;
  filter: grayscale(30%) contrast(1.1) brightness(0.9);
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${props => {
    switch(props.variant) {
      case 'danger': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'premium': return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }};
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      switch(props.variant) {
        case 'danger': return '0 10px 20px rgba(239, 68, 68, 0.3)';
        case 'premium': return '0 10px 20px rgba(139, 92, 246, 0.3)';
        default: return '0 10px 20px rgba(102, 126, 234, 0.3)';
      }
    }};
  }
`;

const NextOfKinCard = styled.div`
  background: rgba(102, 126, 234, 0.05);
  border-radius: 14px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.08);
    border-color: rgba(102, 126, 234, 0.2);
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem;
  color: white;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #667eea;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto 1rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
  text-align: center;
`;

const ProfilePage = () => {
  const [openSections, setOpenSections] = useState({
    personal: true,
    nextOfKin: false,
    location: false,
    billing: false
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deceasedData, setDeceasedData] = useState(null);
  const [nextOfKinData, setNextOfKinData] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDeceasedData();
  }, []);

  const fetchDeceasedData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const deceasedId = localStorage.getItem('deceased_id');
      
      if (!deceasedId) {
        throw new Error('No deceased ID found. Please select a record first.');
      }

      const response = await axios.get(
        `/api/v1/restpoint/portal/info/${deceasedId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        setDeceasedData(response.data.data.deceased);
        setNextOfKinData(response.data.data.nextOfKin || []);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleShareLocation = () => {
    if (deceasedData?.location) {
      navigator.clipboard.writeText(deceasedData.location);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateAge = () => {
    if (!deceasedData?.date_of_birth || !deceasedData?.date_of_death) return 'N/A';
    const birth = new Date(deceasedData.date_of_birth);
    const death = new Date(deceasedData.date_of_death);
    const age = death.getFullYear() - birth.getFullYear();
    const monthDiff = death.getMonth() - birth.getMonth();
    return monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate()) 
      ? `${age - 1} years` 
      : `${age} years`;
  };

  const calculateDaysInCare = () => {
    if (!deceasedData?.date_admitted) return 'N/A';
    const admission = new Date(deceasedData.date_admitted);
    const now = new Date();
    const diffTime = Math.abs(now - admission);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays}d`;
  };

  if (loading) {
    return (
      <Container>
        <GlassCard>
          <LoadingContainer>
            <Spinner />
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Loading Profile</h3>
            <p style={{ color: '#94a3b8' }}>Fetching deceased information...</p>
          </LoadingContainer>
        </GlassCard>
      </Container>
    );
  }

  if (error || !deceasedData) {
    return (
      <Container>
        <GlassCard>
          <ErrorMessage>
            <AlertCircle size={24} style={{ marginBottom: '1rem' }} />
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#fca5a5' }}>Unable to Load Data</h4>
            <p>{error || 'No data available'}</p>
            <ActionButton 
              onClick={fetchDeceasedData}
              style={{ marginTop: '1rem' }}
            >
              <RefreshCw size={16} />
              Try Again
            </ActionButton>
          </ErrorMessage>
        </GlassCard>
      </Container>
    );
  }

  return (
    <Container>
      <GlassCard>
        <HeaderSection>
          <Name>{deceasedData.full_name}</Name>
          
          <StatusContainer>
            <StatusBadge status={deceasedData.status}>
              {deceasedData.status}
            </StatusBadge>
            <DeceasedId>
              ID: {deceasedData.deceased_id}
            </DeceasedId>
          </StatusContainer>
        </HeaderSection>

        <StatsGrid>
          <StatCard>
            <StatValue>{calculateAge()}</StatValue>
            <StatLabel>Age</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{nextOfKinData.length}</StatValue>
            <StatLabel>Next of Kin</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{calculateDaysInCare()}</StatValue>
            <StatLabel>In Care</StatLabel>
          </StatCard>
        </StatsGrid>

        <Section>
          <SectionHeader onClick={() => toggleSection('personal')}>
            <SectionTitle>
              <IconWrapper><Users size={18} /></IconWrapper>
              Personal Information
            </SectionTitle>
            {openSections.personal ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
          </SectionHeader>
          <Content isOpen={openSections.personal}>
            <InfoGrid>
              <InfoCard>
                <InfoRow>
                  <Label><Calendar size={14} /> Date of Birth</Label>
                  <Value>{formatDate(deceasedData.date_of_birth)}</Value>
                </InfoRow>
                <InfoRow>
                  <Label><Heart size={14} /> Date of Death</Label>
                  <Value>{formatDate(deceasedData.date_of_death)}</Value>
                </InfoRow>
                <InfoRow>
                  <Label><Tag size={14} /> Gender</Label>
                  <Value>{deceasedData.gender}</Value>
                </InfoRow>
              </InfoCard>
              
              <InfoCard>
                <InfoRow>
                  <Label><Shield size={14} /> National ID</Label>
                  <Value>{deceasedData.national_id || 'N/A'}</Value>
                </InfoRow>
                <InfoRow>
                  <Label><Home size={14} /> Burial Type</Label>
                  <Value>{deceasedData.burial_type}</Value>
                </InfoRow>
                <InfoRow>
                  <Label><Clock size={14} /> Admission Date</Label>
                  <Value>{formatDate(deceasedData.date_admitted)}</Value>
                </InfoRow>
              </InfoCard>
              
              <InfoCard>
                <InfoRow>
                  <Label>Cause of Death</Label>
                  <Value style={{ color: '#f59e0b' }}>{deceasedData.cause_of_death || 'Not specified'}</Value>
                </InfoRow>
                <InfoRow>
                  <Label>Place of Death</Label>
                  <Value>{deceasedData.place_of_death || 'Not specified'}</Value>
                </InfoRow>
              </InfoCard>
            </InfoGrid>
          </Content>
        </Section>

        <Section>
          <SectionHeader onClick={() => toggleSection('nextOfKin')}>
            <SectionTitle>
              <IconWrapper><Users size={18} /></IconWrapper>
              Next of Kin ({nextOfKinData.length})
            </SectionTitle>
            {openSections.nextOfKin ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
          </SectionHeader>
          <Content isOpen={openSections.nextOfKin}>
            {nextOfKinData.length > 0 ? (
              nextOfKinData.map((kin) => (
                <NextOfKinCard key={kin.id}>
                  <InfoRow style={{ marginBottom: '0.5rem', borderBottom: 'none' }}>
                    <Label>Full Name</Label>
                    <Value style={{ color: '#a5b4fc' }}>{kin.full_name}</Value>
                  </InfoRow>
                  <InfoRow>
                    <Label>Relationship</Label>
                    <Value>{kin.relationship}</Value>
                  </InfoRow>
                  <InfoRow>
                    <Label>Contact</Label>
                    <Value>{kin.contact}</Value>
                  </InfoRow>
                  {kin.email && (
                    <InfoRow>
                      <Label>Email</Label>
                      <Value style={{ fontSize: '0.85rem' }}>{kin.email}</Value>
                    </InfoRow>
                  )}
                </NextOfKinCard>
              ))
            ) : (
              <InfoCard style={{ textAlign: 'center', padding: '2rem' }}>
                <Users size={32} color="#94a3b8" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ color: '#94a3b8', margin: 0 }}>No next of kin information available</p>
              </InfoCard>
            )}
          </Content>
        </Section>

        <Section>
          <SectionHeader onClick={() => toggleSection('location')}>
            <SectionTitle>
              <IconWrapper><MapPin size={18} /></IconWrapper>
              Location & Mortuary
            </SectionTitle>
            {openSections.location ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
          </SectionHeader>
          <Content isOpen={openSections.location}>
            <InfoGrid>
              <InfoCard>
                <InfoRow>
                  <Label>County</Label>
                  <Value>{deceasedData.county || 'N/A'}</Value>
                </InfoRow>
                <InfoRow>
                  <Label>Location</Label>
                  <Value>{deceasedData.location || 'N/A'}</Value>
                </InfoRow>
              </InfoCard>
              
              <InfoCard>
                <InfoRow>
                  <Label>Cold Room</Label>
                  <Value>{deceasedData.cold_room_no || 'N/A'}</Value>
                </InfoRow>
                <InfoRow>
                  <Label>Tray Number</Label>
                  <Value>{deceasedData.tray_no || 'N/A'}</Value>
                </InfoRow>
                <InfoRow>
                  <Label>Embalmed</Label>
                  <Value style={{ color: deceasedData.is_embalmed ? '#48bb78' : '#f59e0b' }}>
                    {deceasedData.is_embalmed ? 'Yes' : 'No'}
                  </Value>
                </InfoRow>
              </InfoCard>
              
              {deceasedData.location && (
                <>
                  <MapContainer>
                    <Map
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(deceasedData.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      loading="lazy"
                      title="Location Map"
                    />
                  </MapContainer>
                  
                  <ActionButton onClick={handleShareLocation}>
                    <Copy size={18} />
                    {copied ? 'Address Copied!' : 'Share Location Address'}
                  </ActionButton>
                </>
              )}
            </InfoGrid>
          </Content>
        </Section>

        <Section>
          <SectionHeader onClick={() => toggleSection('billing')}>
            <SectionTitle>
              <IconWrapper><DollarSign size={18} /></IconWrapper>
              Financial Information
            </SectionTitle>
            {openSections.billing ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
          </SectionHeader>
          <Content isOpen={openSections.billing}>
            <InfoGrid>
              <InfoCard>
                <InfoRow>
                  <Label>Total Billing</Label>
                  <Value style={{ color: '#48bb78', fontSize: '1.1rem' }}>
                    {deceasedData.currency} {parseFloat(deceasedData.billing).toLocaleString()}
                  </Value>
                </InfoRow>
                <InfoRow>
                  <Label>Mortuary Charges</Label>
                  <Value>
                    {deceasedData.currency} {parseFloat(deceasedData.total_mortuary_charge).toLocaleString()}
                  </Value>
                </InfoRow>
                <InfoRow>
                  <Label>Daily Rate (USD)</Label>
                  <Value>${deceasedData.usd_charge_rate} / day</Value>
                </InfoRow>
              </InfoCard>
            </InfoGrid>
          </Content>
        </Section>

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
         
          
          <ActionButton variant="danger">
            <Shield size={18} />
            Emergency Support
          </ActionButton>
        </div>
      </GlassCard>
    </Container>
  );
};

export default ProfilePage;