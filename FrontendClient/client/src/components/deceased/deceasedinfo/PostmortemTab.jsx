import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTenantSlug } from '../../../utils/globalAuth';
import { getTenantHeaders } from '../../../api/endpoints';
import env from '../../../utils/config/env';
import styled from 'styled-components';
import { C, formatDate } from './theme';

const SectionHead = styled.div`
  background: ${C.black}; color: white; padding: 8px 16px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; margin-bottom: 24px; border-radius: 2px;
  display: flex; align-items: center; gap: 8px;
  span { opacity: 0.5; font-size: 10px; }
  ${p => p.$mt0 && 'margin-top: 0;'}
  ${p => p.$mt4 && 'margin-top: 32px;'}
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
  ${p => p.$body && `font-weight: 500; line-height: 1.6; font-size: 14px; color: ${C.mid};`}
`;

const Btn = styled.button`
  padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 13px;
  cursor: pointer; border: 1px solid ${C.border}; background: white; color: ${C.dark};
  transition: 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-family: 'Source Sans 3', sans-serif;
  &:hover { background: ${C.bgField}; border-color: ${C.gray}; }
  ${p => p.$primary && `background: ${C.black}; color: white; border-color: ${C.black};
    &:hover { background: ${C.dark}; }`}
`;

const PostmortemTab = ({ postmortem, deceasedId }) => {
  const navigate = useNavigate();
  const pm = postmortem || {};
  const tenantSlug = getTenantSlug();

  const hasData = pm.immediate_cause_of_death || pm.manner_of_death || pm.examination_summary;

  const openForm = () => {
    navigate(`/tenant/${tenantSlug}/postmortem-form/${deceasedId}`);
  };

  const generatePDF = async () => {
    try {
      const headers = getTenantHeaders();
      const url = `${env.FULL_API_URL}/postmortem/${deceasedId}/pdf`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...headers,
          'Accept': 'application/pdf',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to generate PDF (${response.status})`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');

      // Clean up the blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 10 }}>
        {hasData && (
          <Btn onClick={openForm}>Edit Examination</Btn>
        )}
        <Btn $primary onClick={openForm}>
          {hasData ? '+ New Examination' : '+ Fill Examination Form'}
        </Btn>
      </div>

      <SectionHead $mt0><span>01</span> Official Determination of Death</SectionHead>
      <DetailGrid>
        <DetailBox $full><DetailLabel>Immediate Cause of Death</DetailLabel><DetailValue>{pm.immediate_cause_of_death || '—'}</DetailValue></DetailBox>
        <DetailBox $full><DetailLabel>Underlying Cause of Death</DetailLabel><DetailValue>{pm.underlying_cause_of_death || '—'}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Manner of Death</DetailLabel><DetailValue>{pm.manner_of_death || '—'}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Contributing Conditions</DetailLabel><DetailValue>{pm.contributing_conditions || '—'}</DetailValue></DetailBox>
      </DetailGrid>

      <SectionHead><span>02</span> Pathologist Statement</SectionHead>
      <DetailGrid>
        <DetailBox $full>
          <DetailLabel>Examination Summary</DetailLabel>
          <DetailValue $body>{pm.examination_summary || 'No statement provided.'}</DetailValue>
        </DetailBox>
      </DetailGrid>

      <SectionHead><span>03</span> Examiner Details</SectionHead>
      <DetailGrid>
        <DetailBox><DetailLabel>Examining Pathologist</DetailLabel><DetailValue>{pm.pathologist_name || pm.external_pathologist_name || '—'}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Date Completed</DetailLabel><DetailValue>{formatDate(pm.completed_at || pm.updated_at)}</DetailValue></DetailBox>
      </DetailGrid>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 10 }}>
        <Btn onClick={openForm}>Open Examination Form</Btn>
        <Btn $primary onClick={generatePDF}>Generate Full PDF Report</Btn>
      </div>
    </>
  );
};

export default PostmortemTab;