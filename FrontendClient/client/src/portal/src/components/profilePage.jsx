import React from 'react';
import { FaUser, FaSignOutAlt, FaNotesMedical, FaHospital } from 'react-icons/fa';
import styled from 'styled-components';

// Styled Components for ProfilePage
const ProfileContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #8B5FBF 0%, #00C6AF 100%);
  }
`;

const ProfileHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h2`
  color: #5A3D80;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 1.5rem;
  font-family: 'Playfair Display', serif;
  font-weight: 600;
  font-size: 1.8rem;
`;

const SectionDivider = styled.hr`
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, #8B5FBF, transparent);
  margin: 2rem 0;
`;

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #F0F0F0;

  &:last-child {
    border-bottom: none;
  }
`;

const StatusLabel = styled.span`
  font-weight: 600;
  color: #4A5568;
  font-size: 1rem;
`;

const StatusValue = styled.span`
  color: #2D3748;
  text-align: right;
  font-weight: 500;
  max-width: 60%;
  word-break: break-word;
`;

const CasketCard = styled.div`
  background: linear-gradient(135deg, #F8F5F9 0%, #F0F7F5 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  border-left: 4px solid #8B5FBF;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: ${props => props.marginTop || '1rem'};
  background: ${props => 
    props.variant === 'logout' 
      ? 'linear-gradient(135deg, #FF7E5F 0%, #FF6B8B 100%)' 
      : 'linear-gradient(135deg, #8B5FBF 0%, #00C6AF 100%)'
  };
  color: white;
  box-shadow: 0 4px 15px rgba(139, 95, 191, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 95, 191, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &.autopsy-btn {
    background: linear-gradient(135deg, #00C6AF 0%, #0072FF 100%);
  }
`;

// ProfilePage Component
const ProfilePage = ({ data, onLogout, onOpenAutopsy }) => {
  return (
    <ProfileContainer>
      <ProfileHeader>
        <PageTitle>
          <FaUser /> Deceased Details
        </PageTitle>
      </ProfileHeader>

      <StatusItem>
        <StatusLabel>Deceased Name:</StatusLabel>
        <StatusValue>{data?.deceased_name || "N/A"}</StatusValue>
      </StatusItem>
      
      <StatusItem>
        <StatusLabel>Date of Death:</StatusLabel>
        <StatusValue>{data?.date_of_death || "N/A"}</StatusValue>
      </StatusItem>
      
      <StatusItem>
        <StatusLabel>Cause of Death:</StatusLabel>
        <StatusValue>{data?.cause_of_death || "N/A"}</StatusValue>
      </StatusItem>
      
      <StatusItem>
        <StatusLabel>Date Admitted:</StatusLabel>
        <StatusValue>
          {data?.date_admitted ? new Date(data.date_admitted).toLocaleDateString() : "N/A"}
        </StatusValue>
      </StatusItem>

      {data?.mortuary && (
        <>
          <SectionDivider />
          <PageTitle>
            <FaHospital /> Mortuary Details
          </PageTitle>
          
          <CasketCard>
            <StatusItem>
              <StatusLabel>Name:</StatusLabel>
              <StatusValue>{data.mortuary.name}</StatusValue>
            </StatusItem>
            
            <StatusItem>
              <StatusLabel>Phone:</StatusLabel>
              <StatusValue>{data.mortuary.phone}</StatusValue>
            </StatusItem>
            
            <StatusItem>
              <StatusLabel>Address:</StatusLabel>
              <StatusValue>{data.mortuary.address}</StatusValue>
            </StatusItem>
          </CasketCard>
        </>
      )}

      {data?.autopsy_findings && (
        <ActionButton onClick={onOpenAutopsy} className="autopsy-btn">
          <FaNotesMedical /> 
          Read Autopsy Findings
        </ActionButton>
      )}

      <ActionButton onClick={onLogout} variant="logout">
        <FaSignOutAlt /> 
        Logout
      </ActionButton>
    </ProfileContainer>
  );
};

export default ProfilePage;