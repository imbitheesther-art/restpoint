import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  DollarSign,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  Package,
  Car,
  Flower,
  FileText,
  AlertCircle,
  Download,
  Receipt,
  Users,
  Shield
} from 'lucide-react';

const Colors = {
  primaryDark: '#1a202c',
  white: '#FFFFFF',
  lightGray: '#f7fafc',
  mediumGray: '#e2e8f0',
  darkGray: '#4a5568',
  successGreen: '#48bb78',
  dangerRed: '#f56565',
  warningYellow: '#ed8936',
  teal: '#319795',
  infoBlue: '#4299e1',
  purple: '#805ad5',
  pink: '#ed64a6'
};

const BillingContainer = styled.div`
  padding: 1rem;
  min-height: 100vh;
  color: ${Colors.white};
  padding-bottom: 80px;

  /* Background image */
  background-image: url('/public/background.jpg'); /* <-- replace with your image path */
  background-size: cover;        /* Make it cover the entire container */
  background-repeat: no-repeat;  /* Prevent repeating */
  background-position: center;   /* Center the image */
  background-attachment: fixed;  /* Stick the image when scrolling */
  
  /* Optional overlay for readability */
  &::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
 
    z-index: 0;
  }

  position: relative;
  z-index: 1;
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.6rem;
  font-weight: 500;
  color: ${Colors.white};
  margin-bottom: 0.3rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-weight: 300;
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1.5rem;
`;

const SummaryCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 0.8rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const SummaryTitle = styled.div`
  font-size: 0.75rem;
  color: ${Colors.darkGray};
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const SummaryAmount = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${Colors.primaryDark};
`;

const SummaryLabel = styled.div`
  font-size: 0.7rem;
  color: ${Colors.darkGray};
  margin-top: 0.2rem;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${Colors.mediumGray};
`;

const SectionIcon = styled.div`
  width: 24px;
  height: 24px;
  background: ${props => props.color || Colors.infoBlue};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 14px;
    height: 14px;
    color: white;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${Colors.primaryDark};
  margin: 0;
  flex: 1;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;

const ItemCard = styled.div`
  background: rgba(249, 250, 251, 0.8);
  border-radius: 8px;
  padding: 0.8rem;
  border-left: 3px solid ${props => props.color || Colors.infoBlue};
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const ItemName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${Colors.primaryDark};
  flex: 1;
`;

const ItemAmount = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${Colors.primaryDark};
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.8rem;
`;

const ItemDescription = styled.div`
  color: ${Colors.darkGray};
`;

const ItemMeta = styled.div`
  display: flex;
  gap: 1rem;
  color: ${Colors.darkGray};
  font-size: 0.75rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  svg {
    width: 10px;
    height: 10px;
  }
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.8rem;
  margin-top: 0.8rem;
  border-top: 2px solid ${Colors.mediumGray};
  font-weight: 600;
`;

const TotalLabel = styled.div`
  font-size: 0.9rem;
  color: ${Colors.primaryDark};
`;

const TotalAmount = styled.div`
  font-size: 1.1rem;
  color: ${Colors.primaryDark};
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1rem;
  color: ${Colors.white};
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin: 1.5rem 0;
`;

const ErrorMessage = styled.div`
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: #ff4444;
  margin-bottom: 1rem;
  font-size: 0.85rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${Colors.darkGray};
  
  h3 {
    color: ${Colors.primaryDark};
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  
  p {
    font-size: 0.85rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const PrimaryButton = styled(ActionButton)`
  background: #22c55e;
  color: ${Colors.white};
  
  &:hover {
    background: #16a34a;
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: rgba(255, 255, 255, 0.9);
  color: ${Colors.primaryDark};
  border: 1px solid ${Colors.mediumGray};
  
  &:hover {
    background: ${Colors.white};
    transform: translateY(-1px);
  }
`;

const StatusBadge = styled.span`
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${props => {
    switch(props.status) {
      case 'Invoiced': return Colors.successGreen;
      case 'Assigned': return Colors.infoBlue;
      case 'Pending': return Colors.warningYellow;
      default: return Colors.darkGray;
    }
  }};
  color: white;
  margin-left: 0.5rem;
`;

const BillingPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billingData, setBillingData] = useState(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const deceasedId = localStorage.getItem('deceased_id');
      const sessionToken = localStorage.getItem('session_token');
      
      if (!deceasedId || !sessionToken) {
        setError('Please log in to view billing information');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/v1/restpoint/portal/services/${deceasedId}`,
        {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch billing data');
      }

      const data = await response.json();
      setBillingData(data.data);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return `KES ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <BillingContainer>
        <LoadingSpinner>
          <DollarSign size={20} style={{ marginBottom: '0.8rem' }} />
          <div>Loading billing information...</div>
        </LoadingSpinner>
      </BillingContainer>
    );
  }

  if (error) {
    return (
      <BillingContainer>
        <ErrorMessage>
          <strong>Error:</strong> {error}
        </ErrorMessage>
      </BillingContainer>
    );
  }

  if (!billingData) {
    return (
      <BillingContainer>
        <EmptyState>
          <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>📊</div>
          <h3>No billing data found</h3>
          <p>Please contact support for assistance</p>
        </EmptyState>
      </BillingContainer>
    );
  }

  const { deceased, coffin_info, vehicle_dispatch, extra_charges, summary } = billingData;

  return (
    <BillingContainer>
      <Header>
        <Title>Billing & Services</Title>
        <Subtitle>{deceased.full_name}</Subtitle>
      </Header>

      <SummaryCards>
        <SummaryCard>
          <SummaryTitle>
            <DollarSign size={12} />
            Total Charges
          </SummaryTitle>
          <SummaryAmount>{formatCurrency(summary.grand_total)}</SummaryAmount>
          <SummaryLabel>All services included</SummaryLabel>
        </SummaryCard>

        <SummaryCard>
          <SummaryTitle>
            <Package size={12} />
            Extra Charges
          </SummaryTitle>
          <SummaryAmount>{formatCurrency(summary.total_extra_charges)}</SummaryAmount>
          <SummaryLabel>{extra_charges.length} items</SummaryLabel>
        </SummaryCard>

        <SummaryCard>
          <SummaryTitle>
            <Car size={12} />
            Coffin
          </SummaryTitle>
          <SummaryAmount>{formatCurrency(summary.total_coffin)}</SummaryAmount>
          <SummaryLabel>{coffin_info.length} assigned</SummaryLabel>
        </SummaryCard>

        <SummaryCard>
          <SummaryTitle>
            <CreditCard size={12} />
            Mortuary
          </SummaryTitle>
          <SummaryAmount>{formatCurrency(summary.total_mortuary)}</SummaryAmount>
          <SummaryLabel>Storage charges</SummaryLabel>
        </SummaryCard>
      </SummaryCards>

      <Section>
        <SectionHeader>
          <SectionIcon color={Colors.teal}>
            <Package size={14} />
          </SectionIcon>
          <SectionTitle>Coffin Details</SectionTitle>
          <StatusBadge status="Assigned">Assigned</StatusBadge>
        </SectionHeader>
        
        {coffin_info.length > 0 ? (
          coffin_info.map((coffin, index) => (
            <ItemCard key={index} color={Colors.teal}>
              <ItemHeader>
                <ItemName>{coffin.type} ({coffin.category})</ItemName>
                <ItemAmount>{formatCurrency(coffin.exact_price)}</ItemAmount>
              </ItemHeader>
              <ItemDetails>
                <ItemDescription>{coffin.material}</ItemDescription>
                <ItemMeta>
                  <MetaItem>
                    <Calendar size={10} />
                    Assigned: {formatDate(coffin.assigned_date)}
                  </MetaItem>
                </ItemMeta>
              </ItemDetails>
            </ItemCard>
          ))
        ) : (
          <EmptyState>
            <p>No coffin assigned yet</p>
          </EmptyState>
        )}
      </Section>

      <Section>
        <SectionHeader>
          <SectionIcon color={Colors.infoBlue}>
            <Car size={14} />
          </SectionIcon>
          <SectionTitle>Vehicle Dispatch</SectionTitle>
        </SectionHeader>
        
        {vehicle_dispatch.length > 0 ? (
          vehicle_dispatch.map((dispatch, index) => (
            <ItemCard key={index} color={Colors.infoBlue}>
              <ItemHeader>
                <ItemName>Vehicle Dispatch</ItemName>
                <ItemAmount>{formatCurrency(dispatch.distance_km * 100)}</ItemAmount>
              </ItemHeader>
              <ItemDetails>
                <ItemDescription>
                  {dispatch.vehicle_plate} - {dispatch.driver_name}
                </ItemDescription>
                <ItemMeta>
                  <MetaItem>
                    <Calendar size={10} />
                    {formatDate(dispatch.dispatch_date)} {dispatch.dispatch_time}
                  </MetaItem>
                  <MetaItem>
                    <Car size={10} />
                    Distance: {dispatch.distance_km} km
                  </MetaItem>
                  <MetaItem>
                    <Users size={10} />
                    Driver: {dispatch.driver_name}
                  </MetaItem>
                </ItemMeta>
              </ItemDetails>
            </ItemCard>
          ))
        ) : (
          <EmptyState>
            <p>No vehicle dispatch scheduled</p>
          </EmptyState>
        )}
      </Section>

      <Section>
        <SectionHeader>
          <SectionIcon color={Colors.purple}>
            <FileText size={14} />
          </SectionIcon>
          <SectionTitle>Extra Charges</SectionTitle>
          <div style={{ fontSize: '0.8rem', color: Colors.darkGray }}>
            {extra_charges.length} items
          </div>
        </SectionHeader>
        
        <ItemsList>
          {extra_charges.map((charge) => (
            <ItemCard key={charge.id} color={Colors.purple}>
              <ItemHeader>
                <ItemName>{charge.charge_type}</ItemName>
                <ItemAmount>{formatCurrency(charge.amount)}</ItemAmount>
              </ItemHeader>
              <ItemDetails>
                <ItemDescription>{charge.description}</ItemDescription>
                <ItemMeta>
                  <MetaItem>
                    <Calendar size={10} />
                    {formatDate(charge.service_date)}
                  </MetaItem>
                  <MetaItem>
                    <CheckCircle size={10} />
                    Status: <StatusBadge status={charge.status} style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>
                      {charge.status}
                    </StatusBadge>
                  </MetaItem>
                  {charge.notes && (
                    <MetaItem>
                      <AlertCircle size={10} />
                      {charge.notes}
                    </MetaItem>
                  )}
                </ItemMeta>
              </ItemDetails>
            </ItemCard>
          ))}
        </ItemsList>

        <TotalRow>
          <TotalLabel>Total Extra Charges</TotalLabel>
          <TotalAmount>{formatCurrency(summary.total_extra_charges)}</TotalAmount>
        </TotalRow>
      </Section>

      <Section>
        <SectionHeader>
          <SectionIcon color={Colors.successGreen}>
            <DollarSign size={14} />
          </SectionIcon>
          <SectionTitle>Total Summary</SectionTitle>
        </SectionHeader>

        <ItemsList>
          <ItemCard color={Colors.successGreen}>
            <ItemHeader>
              <ItemName>Extra Charges Total</ItemName>
              <ItemAmount>{formatCurrency(summary.total_extra_charges)}</ItemAmount>
            </ItemHeader>
          </ItemCard>

          <ItemCard color={Colors.successGreen}>
            <ItemHeader>
              <ItemName>Coffin Charges</ItemName>
              <ItemAmount>{formatCurrency(summary.total_coffin)}</ItemAmount>
            </ItemHeader>
          </ItemCard>

          <ItemCard color={Colors.successGreen}>
            <ItemHeader>
              <ItemName>Mortuary Charges</ItemName>
              <ItemAmount>{formatCurrency(summary.total_mortuary)}</ItemAmount>
            </ItemHeader>
          </ItemCard>
        </ItemsList>

        <TotalRow>
          <TotalLabel>Grand Total</TotalLabel>
          <TotalAmount style={{ color: Colors.successGreen, fontSize: '1.3rem' }}>
            {formatCurrency(summary.grand_total)}
          </TotalAmount>
        </TotalRow>
      </Section>

      <ActionButtons>
        <PrimaryButton>
          <CreditCard size={14} />
          Make Payment
        </PrimaryButton>
        <SecondaryButton>
          <Download size={14} />
          Download Invoice
        </SecondaryButton>
      </ActionButtons>
    </BillingContainer>
  );
};

export default BillingPage;