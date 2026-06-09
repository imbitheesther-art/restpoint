import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaHeart, 
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaShoppingCart,
  FaVideo,
  FaBell,
  FaHome,
  FaCog,
  FaFileMedical,
  FaClock,
  FaCalendarDay,
  FaInfoCircle,
  FaChevronRight,
  FaStar,
  FaDownload,
  FaUsers
} from 'react-icons/fa';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Main Container
const DashboardContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1626 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

// Header Styles
const Header = styled.header`
background: linear-gradient(135deg, #d7d2cc 0%, #304352 100%);


  color: white;
  padding: 40px 25px 30px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
`;

const UserWelcome = styled.div`
  flex: 1;
  min-width: 200px;
`;

const WelcomeText = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SubWelcome = styled.p`
  opacity: 0.9;
  font-size: 16px;
  font-weight: 300;
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 12px 20px;
  border-radius: 12px;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

// Status Card
const StatusCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${fadeIn} 0.6s ease-out;
`;

const StatusIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
`;

const StatusInfo = styled.div`
  flex: 1;
`;

const StatusTitle = styled.h3`
  font-size: 16px;
  color: #4a5568;
  margin-bottom: 8px;
  font-weight: 600;
`;

const StatusValue = styled.p`
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatusBadge = styled.span`
  background: ${props => props.variant === 'success' ? '#48bb78' : '#e53e3e'};
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
`;

// Content Area
const Content = styled.div`
  flex: 1;
  padding: 25px;
  overflow-y: auto;
  padding-bottom: 100px;
    overflow-y: auto;
min-height:  100vh;
  
`;

const Section = styled.section`
  margin-bottom: 35px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const SectionTitle = styled.h2`
  font-size: 22px;
  color: #2d3748;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
`;

const SectionSubtitle = styled.p`
  color: #718096;
  font-size: 14px;
  margin-top: -10px;
  margin-bottom: 15px;
`;

// Card Components
const InfoCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 15px;
  border-left: 5px solid #2d4fe6ff;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f7fafc;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: #718096;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const InfoValue = styled.span`
  color: #2d3748;
  font-weight: 600;
  text-align: right;
  flex: 1;
`;

// Stats Grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin: 20px 0;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  border-top: 5px solid ${props => props.color || '#667eea'};
  animation: ${slideIn} 0.6s ease-out;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-3px);
  }
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: ${props => props.color || '#2d3748'};
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

// Action Buttons
const ActionButton = styled.button`
  width: 100%;
  padding: 18px;
  background: ${props => props.variant === 'primary' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : props.variant === 'danger' 
    ? 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)'
    : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'};
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 25px;
  padding: 35px;
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(34, 197, 94, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  color: #22c55e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: #22c55e;
    color: #0a0e27;
    transform: rotate(90deg);
  }
`;

const ModalTitle = styled.h2`
  color: #22c55e;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 24px;
`;

// Casket Styles
const CasketGrid = styled.div`
  display: grid;
  gap: 20px;
  margin-top: 20px;
`;

const CasketCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    border-color: #667eea;
  }
`;

const CasketImage = styled.div`
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
`;

const CasketInfo = styled.div`
  flex: 1;
`;

const CasketName = styled.h4`
  font-size: 18px;
  color: #2d3748;
  margin-bottom: 8px;
  font-weight: 700;
`;

const CasketPrice = styled.p`
  font-size: 24px;
  font-weight: 800;
  color: #48bb78;
  margin-bottom: 8px;
`;

const CasketFeatures = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
`;

const FeatureTag = styled.span`
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(34, 197, 94, 0.3);
`;

const CasketDescription = styled.p`
  font-size: 14px;
  color: #d1d5db;
  line-height: 1.4;
`;

const BookButton = styled.button`
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
  }
`;

// Booking Styles
const BookingCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

const BookingForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 15px;
  color: #4a5568;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Select = styled.select`
  padding: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    outline: none;
  }
`;

const Input = styled.input`
  padding: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    outline: none;
  }
`;

const TextArea = styled.textarea`
  padding: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
  font-family: inherit;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    outline: none;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  padding: 18px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(72, 187, 120, 0.4);
  }
`;

// Bottom Navigation
const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-around;
  padding: 18px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

const NavItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: ${props => props.active ? '#667eea' : '#a0aec0'};
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 15px;
  position: relative;

  &:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }

  ${props => props.active && `
    background: rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  `}
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -2px;
  right: 5px;
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  animation: ${pulse} 2s infinite;
`;

const NavIconWrapper = styled.div`
  position: relative;
`;

// Enhanced Dashboard Component
const Dashboard = ({ userData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [caskets, setCaskets] = useState([]);
  const [notifications, setNotifications] = useState(3);
  const [showAutopsyModal, setShowAutopsyModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    visitType: 'physical',
    date: '',
    time: '',
    numberOfPeople: 1,
    specialRequests: ''
  });

  // Enhanced mock data for deceased
  const deceasedData = {
    name: "Margaret Johnson",
    age: 67,
    dateOfDeath: "September 15, 2025",
    timeOfDeath: "14:30",
    causeOfDeath: "Accidental Death - Road Traffic Accident",
    location: "Nairobi West Hospital",
    dateAdmitted: "September 15, 2025",
    daysInMortuary: 11,
    
    mortuary: {
      name: "Welt Rest Funeral Home",
      address: "123 Memorial Drive, City Square, Nairobi",
      phone: "+254 (547) 400 453 55",
      contact: "Mr P. Mumo (Director General)",
      email: "contact@weltrest.co.ke",
      hours: "24/7",
      rating: "4.8/5"
    },
    
    status: "In Care 24/7",
    lastUpdate: "04:00",
    condition: "Stable",
    
    autopsy: {
      performed: true,
      date: "September 16, 2025",
      pathologist: "Dr. Sarah Kimani",
      summary: "Complete post-mortem examination conducted",
      findings: "Multiple traumatic injuries consistent with road traffic accident. No pre-existing medical conditions contributing to death. Internal organs preserved appropriately. Body maintained in excellent condition for viewing.",
      status: "Report Available",
      downloadUrl: "#"
    },
    
    nextOfKin: {
      name: "James Johnson",
      relationship: "Son",
      contact: "+254 712 345 678",
      email: "james.johnson@email.com"
    },
    
    services: {
      embalming: "Completed",
      dressing: "Scheduled",
      makeup: "Scheduled",
      viewing: "Available"
    }
  };

  // Fetch caskets from backend (mock data)
  useEffect(() => {
    const fetchCaskets = async () => {
      setTimeout(() => {
        setCaskets([
          {
            id: 1,
            name: "Classic Oak Casket",
            price: "KSh 249,999",
            description: "Solid oak construction with velvet interior, brass handles, and personalized nameplate.",
            image: "⚰️",
            features: ["Solid Wood", "Velvet Interior", "Brass Handles", "10-Year Warranty"],
            rating: 4.8
          },
          {
            id: 2,
            name: "Mahogany Premium",
            price: "KSh 399,999",
            description: "Luxurious mahogany with brass fittings, silk interior, and custom engraving.",
            image: "🏺",
            features: ["Premium Wood", "Silk Interior", "Custom Engraving", "Lifetime Warranty"],
            rating: 4.9
          },
          {
            id: 3,
            name: "Eco-Friendly Willow",
            price: "KSh 179,999",
            description: "Sustainable willow with organic cotton lining, biodegradable materials.",
            image: "🌿",
            features: ["Eco-Friendly", "Biodegradable", "Cotton Lining", "Lightweight"],
            rating: 4.6
          },
          {
            id: 4,
            name: "Steel Standard",
            price: "KSh 129,999",
            description: "Durable steel construction with satin finish and secure sealing.",
            image: "🔩",
            features: ["Durable Steel", "Satin Finish", "Secure Seal", "Affordable"],
            rating: 4.4
          }
        ]);
      }, 1000);
    };

    if (activeTab === 'caskets') {
      fetchCaskets();
    }
  }, [activeTab]);

  const handleBookCasket = (casketId) => {
    const casket = caskets.find(c => c.id === casketId);
    alert(`Booking confirmed for: ${casket.name}\nPrice: ${casket.price}\nOur funeral director will contact you within 24 hours.`);
  };

  const handleVisitBooking = (e) => {
    e.preventDefault();
    alert(`Visit booking submitted!\n\nDate: ${bookingForm.date}\nTime: ${bookingForm.time}\nType: ${bookingForm.visitType}\nNumber of People: ${bookingForm.numberOfPeople}\n\nWe will confirm your appointment within 2 hours.`);
    setBookingForm({
      visitType: 'physical',
      date: '',
      time: '',
      numberOfPeople: 1,
      specialRequests: ''
    });
  };

  const handleFormChange = (e) => {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value
    });
  };

  const AutopsyModal = () => (
    <ModalOverlay onClick={() => setShowAutopsyModal(false)}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={() => setShowAutopsyModal(false)}>×</CloseButton>
        <ModalTitle>
          <FaFileMedical />
          Autopsy Report Details
        </ModalTitle>
        
        <InfoCard>
          <InfoRow>
            <InfoLabel><FaCalendarDay /> Date Performed</InfoLabel>
            <InfoValue>{deceasedData.autopsy.date}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel><FaUser /> Pathologist</InfoLabel>
            <InfoValue>{deceasedData.autopsy.pathologist}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel><FaInfoCircle /> Status</InfoLabel>
            <InfoValue>
              <StatusBadge variant="success">{deceasedData.autopsy.status}</StatusBadge>
            </InfoValue>
          </InfoRow>
        </InfoCard>

        <SectionTitle style={{ marginTop: '25px', fontSize: '20px' }}>
          Findings Summary
        </SectionTitle>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '12px', 
          fontSize: '15px',
          lineHeight: '1.6',
          borderLeft: '4px solid #667eea'
        }}>
          {deceasedData.autopsy.findings}
        </div>

        <ActionButton 
          variant="primary"
          onClick={() => window.open(deceasedData.autopsy.downloadUrl, '_blank')}
          style={{ marginTop: '25px' }}
        >
          <FaDownload />
          Download Full Report (PDF)
        </ActionButton>
      </ModalContent>
    </ModalOverlay>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <Section>
              <SectionTitle>
                <FaUser />
                Deceased Information
                <StatusBadge variant="success" style={{ fontSize: '12px', marginLeft: '10px' }}>
                  {deceasedData.condition}
                </StatusBadge>
              </SectionTitle>
              
              <StatsGrid>
                <StatCard color="#667eea">
                  <StatNumber color="#667eea">{deceasedData.age}</StatNumber>
                  <StatLabel>Age at Passing</StatLabel>
                </StatCard>
                
                <StatCard color="#48bb78">
                  <StatNumber color="#48bb78">{deceasedData.daysInMortuary}</StatNumber>
                  <StatLabel>Days in Care</StatLabel>
                </StatCard>

                <StatCard color="#ed8936">
                  <StatNumber color="#ed8936">24/7</StatNumber>
                  <StatLabel>Monitoring</StatLabel>
                </StatCard>
              </StatsGrid>

              <InfoCard>
                <InfoRow>
                  <InfoLabel><FaUser /> Full Name</InfoLabel>
                  <InfoValue>{deceasedData.name}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel><FaCalendarAlt /> Date of Passing</InfoLabel>
                  <InfoValue>{deceasedData.dateOfDeath}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel><FaClock /> Time of Passing</InfoLabel>
                  <InfoValue>{deceasedData.timeOfDeath}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel><FaInfoCircle /> Cause of Death</InfoLabel>
                  <InfoValue style={{ fontSize: '14px', textAlign: 'left' }}>{deceasedData.causeOfDeath}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel><FaMapMarkerAlt /> Location</InfoLabel>
                  <InfoValue>{deceasedData.location}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel><FaCalendarDay /> Date Admitted</InfoLabel>
                  <InfoValue>{deceasedData.dateAdmitted}</InfoValue>
                </InfoRow>
              </InfoCard>

              {deceasedData.autopsy.performed && (
                <ActionButton 
                  variant="danger"
                  onClick={() => setShowAutopsyModal(true)}
                >
                  <FaFileMedical />
                  View Autopsy Report
                </ActionButton>
              )}
            </Section>

            <Section>
              <SectionTitle>
                <FaMapMarkerAlt />
                Mortuary Details
              </SectionTitle>
              <SectionSubtitle>24/7 professional care and support</SectionSubtitle>
              <InfoCard>
                <InfoRow>
                  <InfoLabel>Funeral Home</InfoLabel>
                  <InfoValue>
                    {deceasedData.mortuary.name}
                    <div style={{ fontSize: '12px', color: '#48bb78', fontWeight: '600' }}>
                      ⭐ {deceasedData.mortuary.rating}
                    </div>
                  </InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Contact Person</InfoLabel>
                  <InfoValue>{deceasedData.mortuary.contact}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel><FaPhone /> Phone</InfoLabel>
                  <InfoValue>{deceasedData.mortuary.phone}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue style={{ fontSize: '14px' }}>{deceasedData.mortuary.email}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Operating Hours</InfoLabel>
                  <InfoValue>{deceasedData.mortuary.hours}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Address</InfoLabel>
                  <InfoValue style={{ fontSize: '14px', textAlign: 'left' }}>{deceasedData.mortuary.address}</InfoValue>
                </InfoRow>
              </InfoCard>
            </Section>

            <Section>
              <SectionTitle>
                <FaUsers />
                Next of Kin
              </SectionTitle>
              <InfoCard>
                <InfoRow>
                  <InfoLabel>Name</InfoLabel>
                  <InfoValue>{deceasedData.nextOfKin.name}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Relationship</InfoLabel>
                  <InfoValue>{deceasedData.nextOfKin.relationship}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Contact</InfoLabel>
                  <InfoValue>{deceasedData.nextOfKin.contact}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue style={{ fontSize: '14px' }}>{deceasedData.nextOfKin.email}</InfoValue>
                </InfoRow>
              </InfoCard>
            </Section>
          </>
        );

      case 'caskets':
        return (
          <Section>
            <SectionTitle>
              <FaShoppingCart />
              Available Caskets
            </SectionTitle>
            <SectionSubtitle>Premium selection with various price points</SectionSubtitle>
            <CasketGrid>
              {caskets.map(casket => (
                <CasketCard key={casket.id}>
                  <CasketImage>{casket.image}</CasketImage>
                  <CasketInfo>
                    <CasketName>{casket.name}</CasketName>
                    <CasketPrice>{casket.price}</CasketPrice>
                    <CasketFeatures>
                      {casket.features.map((feature, index) => (
                        <FeatureTag key={index}>{feature}</FeatureTag>
                      ))}
                    </CasketFeatures>
                    <CasketDescription>{casket.description}</CasketDescription>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                      <FaStar color="#FFD700" />
                      <span style={{ fontSize: '14px', color: '#718096' }}>{casket.rating}</span>
                    </div>
                  </CasketInfo>
                  <BookButton onClick={() => handleBookCasket(casket.id)}>
                    Select Casket
                  </BookButton>
                </CasketCard>
              ))}
            </CasketGrid>
          </Section>
        );

      case 'visits':
        return (
          <Section>
            <SectionTitle>
              <FaVideo />
              Body Visit Booking
            </SectionTitle>
            <SectionSubtitle>Schedule a physical or virtual viewing</SectionSubtitle>
            <BookingCard>
              <BookingForm onSubmit={handleVisitBooking}>
                <FormGroup>
                  <FormLabel>
                    <FaVideo />
                    Visit Type
                  </FormLabel>
                  <Select name="visitType" value={bookingForm.visitType} onChange={handleFormChange}>
                    <option value="physical">Physical Visit</option>
                    <option value="online">Online Video Call</option>
                    <option value="both">Both Physical and Online</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <FormLabel>
                    <FaCalendarAlt />
                    Preferred Date
                  </FormLabel>
                  <Input 
                    type="date" 
                    name="date"
                    value={bookingForm.date}
                    onChange={handleFormChange}
                    required 
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>
                    <FaClock />
                    Preferred Time
                  </FormLabel>
                  <Input 
                    type="time" 
                    name="time"
                    value={bookingForm.time}
                    onChange={handleFormChange}
                    required 
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>
                    <FaUsers />
                    Number of People
                  </FormLabel>
                  <Select 
                    name="numberOfPeople"
                    value={bookingForm.numberOfPeople}
                    onChange={handleFormChange}
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <FormLabel>Special Requests</FormLabel>
                  <TextArea 
                    name="specialRequests"
                    value={bookingForm.specialRequests}
                    onChange={handleFormChange}
                    placeholder="Any special requirements, religious considerations, or specific arrangements..."
                  />
                </FormGroup>

                <SubmitButton type="submit">
                  <FaCalendarAlt />
                  Book Visit Appointment
                </SubmitButton>
              </BookingForm>
            </BookingCard>
          </Section>
        );

      case 'notifications':
        return (
          <Section>
            <SectionTitle>
              <FaBell />
              Notifications & Updates
            </SectionTitle>
            <SectionSubtitle>Latest updates about your loved one</SectionSubtitle>
            <InfoCard>
              <InfoRow>
                <InfoLabel>
                  <FaBell color="#667eea" />
                  New Message from Director
                </InfoLabel>
                <InfoValue>2 hours ago</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>
                  <FaCalendarAlt color="#48bb78" />
                  Visit Confirmed
                </InfoLabel>
                <InfoValue>Tomorrow at 14:00</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>
                  <FaFileMedical color="#ed8936" />
                  Document Ready
                </InfoLabel>
                <InfoValue>Death certificate available</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>
                  <FaHeart color="#e53e3e" />
                  Condition Update
                </InfoLabel>
                <InfoValue>Body preservation excellent</InfoValue>
              </InfoRow>
            </InfoCard>
          </Section>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <UserWelcome>
            <WelcomeText>Welcome, {userData?.name || 'Family Member'}</WelcomeText>
            <SubWelcome>We're here to support you during this difficult time</SubWelcome>
          </UserWelcome>
          <LogoutButton onClick={onLogout}>
            <FaSignOutAlt />
            Logout
          </LogoutButton>
        </HeaderContent>

        <StatusCard>
          <StatusIcon>
            <FaHeart />
          </StatusIcon>
          <StatusInfo>
            <StatusTitle>Current Status</StatusTitle>
            <StatusValue>
              {deceasedData.status} • Last update: {deceasedData.lastUpdate}
              <StatusBadge variant="success">Active Monitoring</StatusBadge>
            </StatusValue>
          </StatusInfo>
        </StatusCard>
      </Header>

      <Content>
        {renderContent()}
      </Content>

      {showAutopsyModal && <AutopsyModal />}

      <BottomNav>
        <NavItem 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          <FaHome size={22} />
          Overview
        </NavItem>
        
        <NavItem 
          active={activeTab === 'caskets'} 
          onClick={() => setActiveTab('caskets')}
        >
          <FaShoppingCart size={22} />
          Caskets
        </NavItem>
        
        <NavItem 
          active={activeTab === 'visits'} 
          onClick={() => setActiveTab('visits')}
        >
          <FaVideo size={22} />
          Visits
        </NavItem>
        
        <NavItem 
          active={activeTab === 'notifications'} 
          onClick={() => setActiveTab('notifications')}
        >
          <NavIconWrapper>
            <FaBell size={22} />
            {notifications > 0 && <NotificationBadge>{notifications}</NotificationBadge>}
          </NavIconWrapper>
          Updates
        </NavItem>
      </BottomNav>
    </DashboardContainer>
  );
};

export default Dashboard;