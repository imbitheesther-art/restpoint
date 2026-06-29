import React, { useState } from 'react';
import styled from 'styled-components';

const Colors = {
  primaryDark: '#1a202c',
  white: '#FFFFFF',
  lightGray: '#f7fafc',
  mediumGray: '#e2e8f0',
  darkGray: '#4a5568',
  teal: '#319795',
  purple: '#805ad5',
  warningYellow: '#ed8936'
};

const ServicesContainer = styled.div`
  padding: 0.5rem 0;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${Colors.primaryDark};
  margin-bottom: 1rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding: 0.25rem 0;
`;

const Tab = styled.button`
  padding: 0.75rem 1rem;
  background: ${props => props.active ? Colors.teal : Colors.white};
  color: ${props => props.active ? Colors.white : Colors.darkGray};
  border: none;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.8rem;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
`;

const ServiceCard = styled.div`
  background: ${Colors.white};
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid ${Colors.mediumGray};
`;

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const ServiceInfo = styled.div`
  flex: 1;
`;

const ServiceName = styled.h3`
  font-weight: 600;
  color: ${Colors.primaryDark};
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
`;

const ServiceType = styled.p`
  color: ${Colors.teal};
  font-weight: 600;
  font-size: 0.7rem;
  margin-bottom: 0.5rem;
`;

const ServiceDescription = styled.p`
  color: ${Colors.darkGray};
  font-size: 0.8rem;
  line-height: 1.4;
  margin-bottom: 0.75rem;
`;

const ServicePrice = styled.div`
  text-align: right;
`;

const Price = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${Colors.primaryDark};
  margin-bottom: 0.5rem;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: ${Colors.darkGray};
`;

const StarRating = styled.span`
  color: ${Colors.warningYellow};
`;

const ContactInfo = styled.div`
  background: ${Colors.lightGray};
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 0.75rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: ${Colors.darkGray};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #22c55e;
  color: ${Colors.white};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #16a34a;
  }
`;

const ServicesPage = () => {
  const [activeTab, setActiveTab] = useState('funeral');

  const funeralServices = [
    { 
      id: 1, 
      name: 'Serenity Funeral Home', 
      service: 'Full Funeral Services', 
      price: 'KSH 2,500 - KSH 5,000',
      rating: 4.8,
      contact: '+1 (555) 123-4567',
      email: 'contact@serenityfh.com',
      description: 'Complete funeral arrangements including viewing, ceremony, and burial services'
    }
  ];

  const cateringServices = [
    { 
      id: 1, 
      name: 'Heavenly Catering Co.', 
      service: 'Funeral Reception Catering', 
      price: '$25 - $75 per person',
      rating: 4.7,
      contact: '+1 (555) 345-6789',
      email: 'events@heavenlycatering.com',
      description: 'Elegant catering services for funeral receptions and gatherings'
    }
  ];

  const directors = [
    { 
      id: 1, 
      name: 'James Wilson', 
      title: 'Licensed Funeral Director',
      experience: '15 years',
      contact: '+1 (555) 567-8901',
      email: 'jwilson@serenityfh.com',
      description: 'Specialized in traditional funeral services and grief counseling'
    }
  ];

  const renderServices = () => {
    switch (activeTab) {
      case 'funeral':
        return funeralServices.map(service => (
          <ServiceCard key={service.id}>
            <ServiceHeader>
              <ServiceInfo>
                <ServiceName>{service.name}</ServiceName>
                <ServiceType>Funeral Home</ServiceType>
                <ServiceDescription>{service.description}</ServiceDescription>
              </ServiceInfo>
              <ServicePrice>
                <Price>{service.price}</Price>
                <Rating>
                  <StarRating>★★★★★</StarRating>
                  <span>{service.rating}</span>
                </Rating>
              </ServicePrice>
            </ServiceHeader>
            
            <ContactInfo>
              <ContactItem>📞 {service.contact}</ContactItem>
              <ContactItem>✉️ {service.email}</ContactItem>
            </ContactInfo>
            
            <ActionButton>Contact Service</ActionButton>
          </ServiceCard>
        ));
      
      case 'catering':
        return cateringServices.map(service => (
          <ServiceCard key={service.id}>
            <ServiceHeader>
              <ServiceInfo>
                <ServiceName>{service.name}</ServiceName>
                <ServiceType>Catering Service</ServiceType>
                <ServiceDescription>{service.description}</ServiceDescription>
              </ServiceInfo>
              <ServicePrice>
                <Price>{service.price}</Price>
                <Rating>
                  <StarRating>★★★★★</StarRating>
                  <span>{service.rating}</span>
                </Rating>
              </ServicePrice>
            </ServiceHeader>
            
            <ContactInfo>
              <ContactItem>📞 {service.contact}</ContactItem>
              <ContactItem>✉️ {service.email}</ContactItem>
            </ContactInfo>
            
            <ActionButton>Get Quote</ActionButton>
          </ServiceCard>
        ));
      
      case 'directors':
        return directors.map(director => (
          <ServiceCard key={director.id}>
            <ServiceHeader>
              <ServiceInfo>
                <ServiceName>{director.name}</ServiceName>
                <ServiceType>{director.title}</ServiceType>
                <ServiceDescription>{director.description}</ServiceDescription>
              </ServiceInfo>
              <ServicePrice>
                <div style={{ fontSize: '0.7rem', color: Colors.teal, fontWeight: '600' }}>
                  {director.experience} experience
                </div>
              </ServicePrice>
            </ServiceHeader>
            
            <ContactInfo>
              <ContactItem>📞 {director.contact}</ContactItem>
              <ContactItem>✉️ {director.email}</ContactItem>
            </ContactInfo>
            
            <ActionButton>Contact Director</ActionButton>
          </ServiceCard>
        ));
      
      default:
        return null;
    }
  };

  return (
    <ServicesContainer>
      <SectionTitle>⚡ Services</SectionTitle>
      
      <TabContainer>
        <Tab 
          active={activeTab === 'funeral'} 
          onClick={() => setActiveTab('funeral')}
        >
          Funeral Homes
        </Tab>
        <Tab 
          active={activeTab === 'catering'} 
          onClick={() => setActiveTab('catering')}
        >
          Catering
        </Tab>
        <Tab 
          active={activeTab === 'directors'} 
          onClick={() => setActiveTab('directors')}
        >
          Directors
        </Tab>
      </TabContainer>

      {renderServices()}
    </ServicesContainer>
  );
};

export default ServicesPage;