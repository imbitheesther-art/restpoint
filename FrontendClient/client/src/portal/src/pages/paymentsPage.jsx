import React from 'react';
import styled from 'styled-components';
import { 
  ArrowLeft,
  Smartphone,
  Wallet,
  Copy,
  Shield,
  Phone,
  MessageCircle,
  CheckCircle,
  Banknote,
  QrCode
} from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  background: 
    linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.33)),
    url('/public/background.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 0.8rem;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: #94a3b8;
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.5;
`;

const MainCard = styled.div`
  max-width: 500px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const IconWrapper = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #662D91 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.25rem 0;
`;

const CardDescription = styled.p`
  font-size: 0.9rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const DetailItem = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const DetailLabel = styled.div`
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DetailValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CopyButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const QRCodeSection = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  margin: 1.5rem 0;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const QRCodePlaceholder = styled.div`
  width: 150px;
  height: 150px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  svg {
    width: 50px;
    height: 50px;
    color: #8b5cf6;
  }
`;

const QRInstruction = styled.p`
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const StepNumber = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #662D91 0%, #8b5cf6 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
`;

const StepText = styled.p`
  font-size: 0.9rem;
  color: white;
  margin: 0;
  line-height: 1.4;
`;

const PaymentButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  margin: 1.5rem 0;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
  }
`;

const SupportSection = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SupportTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const SupportActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
`;

const SupportButton = styled.button`
  background: ${props => props.variant === 'whatsapp' ? '#25D366' : '#ef4444'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.variant === 'whatsapp' 
      ? '0 8px 20px rgba(37, 211, 102, 0.3)' 
      : '0 8px 20px rgba(239, 68, 68, 0.3)'};
  }
`;

const SecurityNote = styled.div`
  text-align: center;
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  svg {
    width: 16px;
    height: 16px;
    color: #3b82f6;
  }
`;

const PaymentsPage = ({ onNavigate }) => {
  const handleBack = () => {
    if (onNavigate) {
      onNavigate('profile');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied!');
    });
  };

  const handleCallSupport = () => {
    window.location.href = `tel:+254740045355`;
  };

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent("Hello, I need help with payment.");
    window.open(`https://wa.me/254740045355?text=${message}`, '_blank');
  };

  const handlePayment = () => {
    alert('Complete payment using the M-PESA details below. Save your receipt for verification.');
  };

  const mpesaSteps = [
    'Go to M-PESA menu on your phone',
    'Select "Lipa na M-PESA" option',
    'Enter Paybill number: 123456',
    'Enter your full name as Account Number',
    'Enter payment amount',
    'Confirm with your M-PESA PIN'
  ];

  return (
    <Container>
      <BackButton onClick={handleBack}>
        <ArrowLeft size={16} />
        Back
      </BackButton>

      <Header>
        <Title>Make Payment</Title>
        <Subtitle>
          Complete your payment using M-PESA. Save the receipt for verification.
        </Subtitle>
      </Header>

      <MainCard>
        <Card>
          <CardHeader>
            <IconWrapper>
              <Smartphone size={24} />
            </IconWrapper>
            <div>
              <CardTitle>M-PESA Payment</CardTitle>
              <CardDescription>Instant mobile money payment</CardDescription>
            </div>
          </CardHeader>

          <DetailsGrid>
            <DetailItem>
              <DetailLabel>
                <Banknote size={14} />
                Paybill Number
              </DetailLabel>
              <DetailValue>
                123456
                <CopyButton onClick={() => copyToClipboard('123456')}>
                  <Copy size={12} />
                  Copy
                </CopyButton>
              </DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>
                <Wallet size={14} />
                Account Number
              </DetailLabel>
              <DetailValue>
                Your Full Name
                <CopyButton onClick={() => copyToClipboard('Your Full Name')}>
                  <Copy size={12} />
                  Copy
                </CopyButton>
              </DetailValue>
            </DetailItem>
          </DetailsGrid>

          <QRCodeSection>
            <QRCodePlaceholder>
              <QrCode size={50} />
            </QRCodePlaceholder>
            <QRInstruction>Scan QR code for instant payment</QRInstruction>
          </QRCodeSection>

          <div style={{ marginBottom: '1.5rem' }}>
            <CardTitle style={{ fontSize: '1rem', marginBottom: '1rem' }}>
              How to Pay
            </CardTitle>
            <StepsList>
              {mpesaSteps.map((step, index) => (
                <StepItem key={index}>
                  <StepNumber>{index + 1}</StepNumber>
                  <StepText>{step}</StepText>
                </StepItem>
              ))}
            </StepsList>
          </div>

          <PaymentButton onClick={handlePayment}>
            <CheckCircle size={20} />
            Complete Payment
          </PaymentButton>
        </Card>

        <SupportSection>
          <SupportTitle>
            <Phone size={18} />
            Need Help?
          </SupportTitle>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Contact our support team for assistance
          </p>
          
          <SupportActions>
            <SupportButton onClick={handleCallSupport}>
              <Phone size={16} />
              Call
            </SupportButton>
            <SupportButton onClick={handleWhatsAppSupport} variant="whatsapp">
              <MessageCircle size={16} />
              WhatsApp
            </SupportButton>
          </SupportActions>
        </SupportSection>

        <SecurityNote>
          <Shield size={16} />
          All payments are secured with encryption
        </SecurityNote>
      </MainCard>
    </Container>
  );
};

export default PaymentsPage;