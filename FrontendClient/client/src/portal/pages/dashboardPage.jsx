import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  CreditCard, 
  Phone, 
  ClipboardCheck, 
  FileText,
  LogOut,
  Clock,
  Download,
  Upload,
  AlertCircle,
  Users,
  User,
  FileCheck,
  MessageCircle,
  Smartphone,
  Building,
  BanknoteIcon,
  QrCode,
  Copy,
  ArrowLeft,
  Shield,
  CheckCircle,
  Send
} from 'lucide-react';

const Colors = {
  primaryDark: '#2C3E50',
  accentBlue: '#05668D',
  white: '#FFFFFF',
  lightGray: '#F8F9FA',
  mediumGray: '#E9ECEF',
  darkGray: '#6C757D',
  
  // Softer, more comforting colors
  softTeal: '#88CCEE',
  warmGray: '#F1F3F4',
  gentleBlue: '#E3F2FD',
  softGreen: '#E8F5E9',
  lightPurple: '#F3E5F5',
  paleYellow: '#FFF9C4',
  
  // New colors for requested features
  kinDanger: '#E71D36',        // Vibrant red for support
  autopsySuccess: '#6A0572',   // Deep purple for payments
  whatsappGreen: '#25D366',    // WhatsApp green
  bankBlue: '#1E3A8A',         // Bank blue
  mpesaPurple: '#662D91',      // M-PESA purple
  successGreen: '#00B894'      // Success green
};

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(rgba(44, 62, 80, 0.22), rgba(44, 62, 80, 0.34)), 
              url('/background.jpg') center/cover fixed;
  padding: 1rem;
  color: ${Colors.white};
  padding-bottom: 0px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const WelcomeText = styled.div`
  h1 {
    font-size: 1.2rem;
    font-weight: 500;
    margin-bottom: 0.3rem;
  }
  p {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.8);
  }
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: ${Colors.white};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 0.8rem 0.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  min-height: 65px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: ${props => props.clickable ? 'translateY(-3px)' : 'none'};
    box-shadow: ${props => props.clickable ? '0 6px 20px rgba(0,0,0,0.15)' : '0 4px 16px rgba(0,0,0,0.1)'};
    background: ${props => props.clickable ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.95)'};
  }
  
  &:active {
    transform: ${props => props.clickable ? 'translateY(-1px)' : 'none'};
  }
`;

const StatValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: ${Colors.primaryDark};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${Colors.darkGray};
  font-weight: 400;
`;

const Section = styled.section`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 500;
  color: ${Colors.white};
  margin-bottom: 1rem;
  padding-left: 0.5rem;
  border-left: 3px solid ${Colors.softTeal};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
  margin-bottom: 1.5rem;
`;

const ActionButton = styled.button`
  background: ${props => {
    if (props.isPayment) return `linear-gradient(135deg, ${Colors.autopsySuccess} 0%, #8B4CDB 100%)`;
    if (props.isSupport) return `linear-gradient(135deg, ${Colors.kinDanger} 0%, #FF6B8B 100%)`;
    return 'rgba(255, 255, 255, 0.95)';
  }};
  border: ${props => props.isPayment || props.isSupport ? 'none' : '1px solid rgba(255, 255, 255, 0.3)'};
  padding: 0.7rem 0.3rem;
  border-radius: 10px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 60px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
    background: ${props => {
      if (props.isPayment) return `linear-gradient(135deg, #8B4CDB 0%, ${Colors.autopsySuccess} 100%)`;
      if (props.isSupport) return `linear-gradient(135deg, #FF6B8B 0%, ${Colors.kinDanger} 100%)`;
      return 'rgba(255, 255, 255, 1)';
    }};
  }
`;

const ActionIcon = styled.div`
  margin-bottom: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
    color: ${props => props.isPayment || props.isSupport ? Colors.white : 'inherit'};
  }
`;

const ActionText = styled.div`
  font-size: 0.7rem;
  font-weight: 500;
  color: ${props => props.isPayment || props.isSupport ? Colors.white : Colors.primaryDark};
  line-height: 1.2;
`;

const RecentActivity = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid ${Colors.mediumGray};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${Colors.gentleBlue};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  
  svg {
    width: 16px;
    height: 16px;
    color: ${Colors.accentBlue};
  }
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${Colors.primaryDark};
  font-weight: 500;
`;

const ActivityTime = styled.span`
  font-size: 0.75rem;
  color: ${Colors.darkGray};
`;

const SupportSection = styled.div`
  background: linear-gradient(135deg, ${Colors.gentleBlue} 0%, ${Colors.lightPurple} 100%);
  padding: 1.5rem;
  border-radius: 16px;
  margin-top: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
`;

const SupportTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.8rem;
  color: ${Colors.primaryDark};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const SupportText = styled.p`
  font-size: 0.85rem;
  color: ${Colors.darkGray};
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const SupportButton = styled.button`
  background: ${Colors.accentBlue};
  color: ${Colors.white};
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 25px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0 auto;
  
  &:hover {
    background: ${Colors.primaryDark};
    transform: translateY(-2px);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Sleek Contact Modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${Colors.white};
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const ModalTitle = styled.h3`
  color: ${Colors.primaryDark};
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.3rem;
  font-weight: 600;
`;

const ContactOption = styled.button`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  width: 100%;
  padding: 1.2rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: 14px;
  background: ${props => props.isWhatsApp ? Colors.whatsappGreen : Colors.gentleBlue};
  color: ${props => props.isWhatsApp ? Colors.white : Colors.primaryDark};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }
  
  svg {
    width: 22px;
    height: 22px;
  }
`;

const ContactNumber = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 0.2rem;
  letter-spacing: 0.5px;
`;

const Divider = styled.div`
  height: 1px;
  background: ${Colors.mediumGray};
  margin: 1.5rem 0;
  opacity: 0.5;
`;

const CloseButton = styled.button`
  background: transparent;
  color: ${Colors.darkGray};
  border: 1px solid ${Colors.mediumGray};
  padding: 0.8rem;
  border-radius: 12px;
  font-size: 0.9rem;
  cursor: pointer;
  width: 100%;
  margin-top: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${Colors.mediumGray};
    color: ${Colors.primaryDark};
  }
`;

// ==================== PAYMENTS PAGE ====================
const PaymentsContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(rgba(44, 62, 80, 0.22), rgba(44, 62, 80, 0.34)), 
              url('/background.jpg') center/cover fixed;
  padding: 1rem;
  color: ${Colors.white};
  padding-bottom: 80px;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: ${Colors.white};
  padding: 0.7rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateX(-5px);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const PaymentsHeader = styled.div`
  margin-bottom: 2rem;
`;

const PaymentsTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${Colors.white};
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const PaymentsSubtitle = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
`;

const PaymentMethodCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.8rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 36px rgba(0,0,0,0.15);
  }
`;

const MethodHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1.2rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid ${Colors.mediumGray};
`;

const MethodIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => {
    switch(props.type) {
      case 'mpesa': return `linear-gradient(135deg, ${Colors.mpesaPurple} 0%, #8B4CA8 100%)`;
      case 'bank': return `linear-gradient(135deg, ${Colors.bankBlue} 0%, #3B82F6 100%)`;
      default: return `linear-gradient(135deg, ${Colors.autopsySuccess} 0%, #9D4EDD 100%)`;
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  
  svg {
    width: 24px;
    height: 24px;
    color: ${Colors.white};
  }
`;

const MethodTitle = styled.div`
  flex: 1;
`;

const MethodName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${Colors.primaryDark};
  margin: 0;
`;

const MethodDescription = styled.p`
  font-size: 0.85rem;
  color: ${Colors.darkGray};
  margin: 0.3rem 0 0 0;
`;

const AccountDetails = styled.div`
  background: ${Colors.warmGray};
  border-radius: 12px;
  padding: 1.2rem;
  margin-top: 1.2rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-size: 0.9rem;
  color: ${Colors.darkGray};
  font-weight: 500;
`;

const DetailValue = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${Colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CopyButton = styled.button`
  background: ${Colors.mediumGray};
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
  color: ${Colors.primaryDark};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:hover {
    background: ${Colors.darkGray};
    color: ${Colors.white};
    transform: translateY(-1px);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const PaymentInstructions = styled.div`
  font-size: 0.9rem;
  color: ${Colors.darkGray};
  margin-top: 1.5rem;
  padding: 1.2rem;
  background: ${Colors.paleYellow};
  border-radius: 10px;
  border-left: 4px solid ${Colors.autopsySuccess};
`;

const InstructionItem = styled.li`
  margin-bottom: 0.6rem;
  line-height: 1.5;
  position: relative;
  padding-left: 1.5rem;
  
  &::before {
    content: '→';
    position: absolute;
    left: 0;
    color: ${Colors.autopsySuccess};
    font-weight: bold;
  }
`;

const QRCodeSection = styled.div`
  text-align: center;
  padding: 1.8rem;
  background: ${Colors.white};
  border-radius: 12px;
  margin-top: 1.8rem;
  border: 1px solid ${Colors.mediumGray};
`;

const QRCodePlaceholder = styled.div`
  width: 180px;
  height: 180px;
  margin: 0 auto 1.2rem;
  background: ${Colors.warmGray};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(0,0,0,0.1);
  
  svg {
    width: 50px;
    height: 50px;
    color: ${Colors.darkGray};
  }
`;

const ImportantNotes = styled.div`
  background: rgba(231, 29, 54, 0.08);
  border-radius: 16px;
  padding: 1.8rem;
  margin-top: 2rem;
  border: 1px solid rgba(231, 29, 54, 0.2);
`;

const NoteItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  svg {
    width: 20px;
    height: 20px;
    color: ${Colors.kinDanger};
    flex-shrink: 0;
    margin-top: 0.2rem;
  }
`;

const NoteText = styled.p`
  font-size: 0.9rem;
  color: ${Colors.primaryDark};
  margin: 0;
  line-height: 1.5;
`;

const DashboardPage = ({ userData, onLogout, onNavigate }) => {
  const [deceasedData, setDeceasedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [statistics, setStatistics] = useState({
    totalPending: 0,
    documentCount: 0,
    pendingItems: 0,
    vendorCount: 4
  });

  const phoneNumber = '+254740045355';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const deceasedId = localStorage.getItem('deceased_id');
      const sessionToken = localStorage.getItem('session_token');
      
      if (!deceasedId || !sessionToken) {
        throw new Error('Not authenticated');
      }

      // Fetch deceased info
      const infoResponse = await fetch(
        `/api/v1/restpoint/portal/info/${deceasedId}`,
        {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (infoResponse.ok) {
        const infoData = await infoResponse.json();
        setDeceasedData(infoData.data);
        
        // Calculate statistics
        const financialSummary = infoData.data?.financial_summary;
        const totalPending = financialSummary?.balance || 0;
        
        setStatistics(prev => ({
          ...prev,
          totalPending: parseFloat(totalPending)
        }));
      }

      // Fetch documents count
      const docsResponse = await fetch(
        `/api/v1/restpoint/portal/documents/${deceasedId}`,
        {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        setStatistics(prev => ({
          ...prev,
          documentCount: docsData.count || 0
        }));
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleNavigateToPayments = () => {
    if (onNavigate) {
      onNavigate('payments');
    }
  };

  const handleNavigateToDocuments = () => {
    if (onNavigate) {
      onNavigate('documents');
    }
  };

  const handleNavigateToProfile = () => {
    if (onNavigate) {
      onNavigate('profile');
    }
  };

  const handleNavigateToVendors = () => {
    if (onNavigate) {
      onNavigate('vendors');
    }
  };

  const handleBalanceDueClick = () => {
    handleNavigateToPayments();
  };

  const handleTotalDocumentsClick = () => {
    handleNavigateToDocuments();
  };

  const handleVendorsClick = () => {
    handleNavigateToVendors();
  };

  // Support handlers
  const handleSupportClick = () => {
    setShowContactModal(true);
  };

  const handleCallSupport = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent("Hello, I need support regarding funeral services.");
    window.open(`https://wa.me/${phoneNumber.replace('+', '')}?text=${message}`, '_blank');
  };

  const recentActivities = [
    { id: 1, icon: <CheckCircle />, text: 'Payment confirmation received', time: '1 hour ago' },
    { id: 2, icon: <FileCheck />, text: 'Document verification completed', time: '2 hours ago' },
    { id: 3, icon: <Download />, text: 'Payment received for service fee', time: '1 day ago' },
    { id: 4, icon: <Upload />, text: 'New documents uploaded', time: '3 days ago' }
  ];

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ textAlign: 'center', padding: '3rem', color: Colors.white }}>
          Loading dashboard...
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <WelcomeText>
          <h1>Welcome, {userData?.name || 'Guest'}</h1>
          <p>{userData?.relationship || 'Family Member'}</p>
        </WelcomeText>
        <LogoutButton onClick={onLogout}>
          <LogOut size={16} />
          Logout
        </LogoutButton>
      </Header>

      <StatsGrid>
        <StatCard 
          clickable={true} 
          onClick={handleBalanceDueClick}
          title="Click to view payments"
        >
          <StatValue>
            <CreditCard size={16} />
            KES {statistics.totalPending.toLocaleString()}
          </StatValue>
          <StatLabel>Balance Due</StatLabel>
        </StatCard>

        <StatCard 
          clickable={true} 
          onClick={handleTotalDocumentsClick}
          title="Click to manage documents"
        >
          <StatValue>
            <FileText size={16} />
            {statistics.documentCount}
          </StatValue>
          <StatLabel>Total Documents</StatLabel>
        </StatCard>

        <StatCard clickable={false}>
          <StatValue>
            <AlertCircle size={16} />
            {statistics.pendingItems}
          </StatValue>
          <StatLabel>Pending Items</StatLabel>
        </StatCard>

        <StatCard 
          clickable={true} 
          onClick={handleVendorsClick}
          title="Click to view vendors"
        >
          <StatValue>
            <Users size={16} />
            {statistics.vendorCount}
          </StatValue>
          <StatLabel>Active Vendors</StatLabel>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>
          <ClipboardCheck size={18} />
          Quick Actions
        </SectionTitle>
        <QuickActions>
          {/* Make Payment - Autopsy Success Purple */}
          <ActionButton 
            onClick={handleNavigateToPayments}
            title="Go to payments page"
            isPayment={true}
          >
            <ActionIcon isPayment={true}>
              <CreditCard size={20} />
            </ActionIcon>
            <ActionText isPayment={true}>Make Payment</ActionText>
          </ActionButton>

          {/* Contact Support - Kin Danger Red */}
          <ActionButton 
            onClick={handleSupportClick}
            isSupport={true}
          >
            <ActionIcon isSupport={true}>
              <Phone size={20} />
            </ActionIcon>
            <ActionText isSupport={true}>Contact Support</ActionText>
          </ActionButton>

          <ActionButton 
            onClick={handleNavigateToDocuments}
            title="Go to documents page"
          >
            <ActionIcon>
              <FileText size={20} />
            </ActionIcon>
            <ActionText>View Documents</ActionText>
          </ActionButton>

          <ActionButton 
            onClick={handleNavigateToProfile}
            title="Go to profile page"
          >
            <ActionIcon>
              <User size={20} />
            </ActionIcon>
            <ActionText>My Profile</ActionText>
          </ActionButton>
        </QuickActions>
      </Section>

      <Section>
        <SectionTitle>
          <Clock size={18} />
          Recent Activity
        </SectionTitle>
        <RecentActivity>
          {recentActivities.map(activity => (
            <ActivityItem key={activity.id}>
              <ActivityIcon>{activity.icon}</ActivityIcon>
              <ActivityContent>
                <ActivityText>{activity.text}</ActivityText>
                <ActivityTime>{activity.time}</ActivityTime>
              </ActivityContent>
            </ActivityItem>
          ))}
        </RecentActivity>
      </Section>

      <SupportSection>
        <SupportTitle>
          <Shield size={20} />
          Need immediate assistance?
        </SupportTitle>
        <SupportText>
          Our compassionate support team is available 24/7 to help with any questions or concerns. 
          We understand this is a difficult time and we're here to make things easier.
        </SupportText>
        <SupportButton onClick={handleSupportClick}>
          <Phone size={16} />
          Contact Support Team
        </SupportButton>
      </SupportSection>

      {/* Sleek Contact Modal */}
      {showContactModal && (
        <ModalOverlay onClick={() => setShowContactModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>How would you like to contact us?</ModalTitle>
            
            <ContactOption onClick={handleCallSupport}>
              <Phone size={22} />
              <div>
                <div>Call Us Now</div>
                <ContactNumber>{phoneNumber}</ContactNumber>
              </div>
              <Send size={18} />
            </ContactOption>
            
            <ContactOption onClick={handleWhatsAppSupport} isWhatsApp={true}>
              <MessageCircle size={22} />
              <div>
                <div>WhatsApp Message</div>
                <ContactNumber>{phoneNumber}</ContactNumber>
              </div>
              <Send size={18} />
            </ContactOption>
            
            <Divider />
            
            <div style={{ 
              fontSize: '0.85rem', 
              color: Colors.darkGray, 
              textAlign: 'center', 
              marginBottom: '1rem',
              fontStyle: 'italic'
            }}>
              24/7 Support • Average Response: 2 minutes
            </div>
            
            <CloseButton onClick={() => setShowContactModal(false)}>
              Close
            </CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </DashboardContainer>
  );
};

// ==================== PAYMENTS PAGE COMPONENT ====================
export const PaymentsPage = ({ userData, onNavigate }) => {
  const handleBackToDashboard = () => {
    if (onNavigate) {
      onNavigate('dashboard');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('✓ Copied to clipboard!');
    });
  };

  const paymentMethods = [
    {
      id: 1,
      type: 'bank',
      name: 'ABSA Bank Transfer',
      icon: <Building size={24} />,
      description: 'Direct bank transfer to ABSA account',
      details: [
        { label: 'Bank Name', value: 'ABSA Bank Kenya PLC' },
        { label: 'Account Name', value: 'Restpoint Funeral Services Ltd' },
        { label: 'Account Number', value: '2039001234' },
        { label: 'Branch', value: 'Westlands (020)' },
        { label: 'Swift Code', value: 'BARCKENX' }
      ],
      instructions: [
        'Go to your bank or mobile banking app',
        'Select "Send Money" or "Transfer"',
        'Enter the ABSA bank details above',
        'Use your full name as reference',
        'Save the transaction receipt'
      ]
    },
    {
      id: 2,
      type: 'mpesa',
      name: 'M-PESA Payment',
      icon: <Smartphone size={24} />,
      description: 'Instant payment via M-PESA',
      details: [
        { label: 'Paybill Number', value: '123456' },
        { label: 'Account Number', value: 'Your Full Name' },
        { label: 'Business Name', value: 'Restpoint Funeral' },
        { label: 'Till Number', value: '654321' }
      ],
      instructions: [
        'Go to M-PESA menu on your phone',
        'Select "Lipa na M-PESA"',
        'Choose "Paybill" option',
        'Enter Paybill: 123456',
        'Enter your name as Account Number',
        'Complete with your PIN'
      ]
    },
    {
      id: 3,
      type: 'bank',
      name: 'Bank Transfer - Any Bank',
      icon: <BanknoteIcon size={24} />,
      description: 'Transfer from any bank',
      details: [
        { label: 'Beneficiary Name', value: 'Restpoint Funeral Services' },
        { label: 'Bank', value: 'Any Commercial Bank' },
        { label: 'Account Number', value: '2039001234' },
        { label: 'Branch', value: 'Westlands' },
        { label: 'Reference', value: 'Your Name + Funeral' }
      ],
      instructions: [
        'Visit your bank branch',
        'Fill deposit slip with details above',
        'Use your name as transaction reference',
        'Get stamped receipt',
        'Send receipt copy to receipts@restpoint.co.ke'
      ]
    }
  ];

  return (
    <PaymentsContainer>
      <BackButton onClick={handleBackToDashboard}>
        <ArrowLeft size={18} />
        Back to Dashboard
      </BackButton>

      <PaymentsHeader>
        <PaymentsTitle>
          <CreditCard size={28} />
          Make a Payment
        </PaymentsTitle>
        <PaymentsSubtitle>
          Choose your preferred payment method below. All transactions are secure and encrypted.
        </PaymentsSubtitle>
      </PaymentsHeader>

      {paymentMethods.map((method) => (
        <PaymentMethodCard key={method.id}>
          <MethodHeader>
            <MethodIcon type={method.type}>
              {method.icon}
            </MethodIcon>
            <MethodTitle>
              <MethodName>{method.name}</MethodName>
              <MethodDescription>{method.description}</MethodDescription>
            </MethodTitle>
          </MethodHeader>

          <AccountDetails>
            {method.details.map((detail, index) => (
              <DetailRow key={index}>
                <DetailLabel>{detail.label}</DetailLabel>
                <DetailValue>
                  {detail.value}
                  <CopyButton onClick={() => copyToClipboard(detail.value)}>
                    <Copy size={14} />
                    Copy
                  </CopyButton>
                </DetailValue>
              </DetailRow>
            ))}
          </AccountDetails>

          <PaymentInstructions>
            <div style={{ 
              fontSize: '0.95rem', 
              fontWeight: '600', 
              color: Colors.primaryDark,
              marginBottom: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Send size={16} />
              How to Pay:
            </div>
            <ol style={{ margin: 0, paddingLeft: '0' }}>
              {method.instructions.map((instruction, index) => (
                <InstructionItem key={index}>{instruction}</InstructionItem>
              ))}
            </ol>
          </PaymentInstructions>

          {method.type === 'mpesa' && (
            <QRCodeSection>
              <div style={{ 
                marginBottom: '1rem', 
                color: Colors.primaryDark, 
                fontWeight: '600',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <QrCode size={20} />
                Scan to Pay with M-PESA
              </div>
              <QRCodePlaceholder>
                <QrCode size={50} />
              </QRCodePlaceholder>
              <div style={{ 
                fontSize: '0.85rem', 
                color: Colors.darkGray,
                marginTop: '1rem'
              }}>
                Open your phone camera and point at the QR code
              </div>
            </QRCodeSection>
          )}
        </PaymentMethodCard>
      ))}

      <ImportantNotes>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.8rem',
          marginBottom: '1.5rem',
          color: Colors.kinDanger,
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          <AlertCircle size={22} />
          Important Payment Information
        </div>
        
        <NoteItem>
          <Shield size={20} />
          <NoteText>
            <strong style={{ color: Colors.primaryDark }}>Security:</strong> All transactions are encrypted. Never share your PIN or passwords.
          </NoteText>
        </NoteItem>
        
        <NoteItem>
          <Clock size={20} />
          <NoteText>
            <strong style={{ color: Colors.primaryDark }}>Processing Time:</strong> Payments reflect within 1-2 hours during business hours.
          </NoteText>
        </NoteItem>
        
        <NoteItem>
          <FileText size={20} />
          <NoteText>
            <strong style={{ color: Colors.primaryDark }}>Receipts:</strong> Always keep transaction receipts. Email copies to receipts@restpoint.co.ke.
          </NoteText>
        </NoteItem>
        
        <NoteItem>
          <Phone size={20} />
          <NoteText>
            <strong style={{ color: Colors.primaryDark }}>Support:</strong> Need help? Call or WhatsApp +254740045355 for immediate assistance.
          </NoteText>
        </NoteItem>
      </ImportantNotes>
    </PaymentsContainer>
  );
};

export default DashboardPage;