import React from 'react';
import styled from 'styled-components';
import { C, formatDate } from './theme';

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
`;

  const AdmissionTab = ({ deceased }) => {
    const d = deceased || {};

    return (
      <>
        <SectionHead $mt0><span>01</span> Admission Specifics</SectionHead>
        <DetailGrid>
          <DetailBox><DetailLabel>Admission Number</DetailLabel><DetailValue>{d.admission_number || '—'}</DetailValue></DetailBox>
          <DetailBox><DetailLabel>Date Admitted</DetailLabel><DetailValue>{formatDate(d.date_admitted || d.created_at)}</DetailValue></DetailBox>
          <DetailBox><DetailLabel>Time Received</DetailLabel><DetailValue>{d.time_received || '—'}</DetailValue></DetailBox>
          <DetailBox><DetailLabel>Receiving Officer</DetailLabel><DetailValue>{d.receiving_officer || '—'}</DetailValue></DetailBox>
          <DetailBox $full><DetailLabel>Received From</DetailLabel><DetailValue>{d.received_from || '—'}</DetailValue></DetailBox>
        </DetailGrid>

        <SectionHead><span>02</span> Death Specifics</SectionHead>
        <DetailGrid>
          <DetailBox><DetailLabel>Date of Death</DetailLabel><DetailValue>{formatDate(d.date_of_death)}</DetailValue></DetailBox>
          <DetailBox><DetailLabel>Place of Death</DetailLabel><DetailValue>{d.place_of_death || '—'}</DetailValue></DetailBox>
          <DetailBox $full><DetailLabel>Cause of Death</DetailLabel><DetailValue>{d.cause_of_death || '—'}</DetailValue></DetailBox>
          <DetailBox><DetailLabel>Physician</DetailLabel><DetailValue>{d.physician || '—'}</DetailValue></DetailBox>
          <DetailBox><DetailLabel>Permit Number</DetailLabel><DetailValue>{d.permit_number || '—'}</DetailValue></DetailBox>
        </DetailGrid>
      </>
    );
  };

export default AdmissionTab;