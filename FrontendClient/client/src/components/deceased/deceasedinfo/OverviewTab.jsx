import React from 'react';
import styled from 'styled-components';
import { C, formatDate } from './theme';
import env from '../../../utils/config/env';



const SectionHead = styled.div`
  background: ${C.black}; color: white; padding: 8px 16px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; margin-bottom: 24px; border-radius: 2px;
  display: flex; align-items: center; gap: 8px;
  span { opacity: 0.5; font-size: 10px; }
  ${p => p.$mt0 && 'margin-top: 0;'}
`;

const DetailGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const DetailBox = styled.div`
  background: ${C.bgSection}; border: 1px solid ${C.borderLight};
  border-radius: 6px; padding: 16px; min-width: 0;
  ${p => p.$full && 'grid-column: span 2;'}
  @media (max-width: 768px) { grid-column: span 1 !important; }
`;

const DetailLabel = styled.span`
  font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: ${C.gray}; margin-bottom: 6px; display: block;
`;

const DetailValue = styled.div`
  font-size: 15px; font-weight: 600; color: ${C.black}; word-break: break-word;
  ${p => p.$muted && `color: ${C.gray}; font-weight: 500;`}
`;

const StatusTag = styled.span`
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
  border-radius: 4px; font-size: 12px; font-weight: 700;
  background: ${p => p.$success ? C.successBg : C.warningBg};
  color: ${p => p.$success ? C.success : C.warning};
  border: 1px solid ${p => p.$success ? '#a7f3d0' : '#fde68a'};
`;

const OverviewTab = ({ deceased, nextOfKin }) => {
  const d = deceased || {};
  const name = d.full_name || d.name || 'Unknown';
  const sex = d.sex || d.gender || '';

  // Construct full signature URL
  const getSignatureUrl = (signaturePath) => {
    if (!signaturePath) return null;
    // If it's already a base64 data URL, return as-is
    if (signaturePath.startsWith('data:image')) {
      return signaturePath;
    }
    // If it already has a full URL, return as-is
    if (signaturePath.startsWith('http')) {
      return signaturePath;
    }
    // If it's a relative path starting with /uploads/, prepend API_GATEWAY_URL
    // The API gateway routes /uploads to the tenant-service
    if (signaturePath.startsWith('/uploads/')) {
      return `${env.API_GATEWAY_URL}${signaturePath}`;
    }
    // If it's a relative path starting with uploads/ (no leading slash), prepend API_GATEWAY_URL
    if (signaturePath.startsWith('uploads/')) {
      return `${env.API_GATEWAY_URL}/${signaturePath}`;
    }
    // Default: treat as relative path
    return `${env.API_GATEWAY_URL}/${signaturePath}`;
  };

  const signatureUrl = getSignatureUrl(d.signature);

  return (
    <>
      <SectionHead $mt0><span>01</span> Personal Information</SectionHead>
      <DetailGrid>
        <DetailBox><DetailLabel>Full Legal Name</DetailLabel><DetailValue>{name}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>National ID Number</DetailLabel><DetailValue>{d.national_id || d.id_number || '—'}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Date of Birth</DetailLabel><DetailValue>{formatDate(d.date_of_birth || d.dob)}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Age</DetailLabel><DetailValue>{d.age ? `${d.age} Years` : '—'}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Sex</DetailLabel><DetailValue>{sex || '—'}</DetailValue></DetailBox>
      </DetailGrid>

      <SectionHead><span>02</span> Embalming & Body Status</SectionHead>
      <DetailGrid>
        <DetailBox>
          <DetailLabel>Embalming Status</DetailLabel>
          <DetailValue>
            <StatusTag $success={d.admission_status === 'embalmed'} $warning={d.admission_status !== 'embalmed'}>
              {d.admission_status === 'embalmed' ? '✓ Embalmed' : 'Pending Embalming'}
            </StatusTag>
          </DetailValue>
        </DetailBox>
        <DetailBox><DetailLabel>Date Admitted</DetailLabel><DetailValue>{formatDate(d.date_admitted)}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Current Storage Location</DetailLabel><DetailValue>{d.chamber_assigned || '—'}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Body Status</DetailLabel><DetailValue>{d.body_status || 'In Morgue'}</DetailValue></DetailBox>
      </DetailGrid>

      <SectionHead><span>03</span> Next of Kin Details</SectionHead>
      <DetailGrid>
        <DetailBox><DetailLabel>NOK Full Name</DetailLabel><DetailValue>{nextOfKin?.full_name || '—'}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Relationship</DetailLabel><DetailValue>{nextOfKin?.relationship || '—'}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Telephone Number</DetailLabel><DetailValue>{nextOfKin?.contact || '—'}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Alternative Phone</DetailLabel><DetailValue>{nextOfKin?.alternative_phone || '—'}</DetailValue></DetailBox>
        <DetailBox $full><DetailLabel>Physical Address</DetailLabel><DetailValue>{nextOfKin?.address || '—'}</DetailValue></DetailBox>
        {signatureUrl && (
          <DetailBox $full>
            <DetailLabel>Next of Kin Signature</DetailLabel>
            <DetailValue>
              <img 
                src={signatureUrl} 
                alt="Next of Kin Signature" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '4px',
                  marginTop: '8px'
                }} 
              />
            </DetailValue>
          </DetailBox>
        )}
      </DetailGrid>
    </>
  );
};

export default OverviewTab;