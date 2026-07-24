import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { C, formatDate } from './theme';
import api from '../../../api/axios';
import { getTenantHeaders } from '../../../api/endpoints';

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

const Btn = styled.button`
  padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 13px;
  cursor: pointer; border: 1px solid ${C.border}; background: white; color: ${C.dark};
  transition: 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-family: 'Source Sans 3', sans-serif;
  &:hover { background: ${C.bgField}; border-color: ${C.gray}; }
  ${p => p.$primary && `background: ${C.black}; color: white; border-color: ${C.black};
    &:hover { background: ${C.dark}; }`}
  ${p => p.$danger && `background: ${C.danger}; color: white; border-color: ${C.danger};
    &:hover { background: #b91c1c; }`}
`;

const ReleaseTab = ({ deceased, nextOfKin, deceasedId }) => {
  const navigate = useNavigate();
  const d = deceased || {};
  const [releaseData, setReleaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFinalizeRelease = () => {
    const slug = localStorage.getItem('tenantSlug') || 'system_shared';
    navigate(`/tenant/${slug}/release-form/${deceasedId}`, {
      state: { deceasedData: deceased }
    });
  };

  // Fetch release data
  useEffect(() => {
    const fetchReleaseData = async () => {
      if (!deceasedId) return;
      
      setIsLoading(true);
      try {
        const tenantSlug = localStorage.getItem('tenantSlug');
        const admissionNumber = d.admission_number || d.admission_no || deceasedId;
        
        // Try 1: Fetch by admission number (most reliable)
        try {
          const byAdmissionRes = await api.get(`/body-release/by-admission/${admissionNumber}`, {
            headers: {
              ...getTenantHeaders(),
              'x-tenant-slug': tenantSlug
            }
          });
          if (byAdmissionRes.data?.success && byAdmissionRes.data?.data) {
            setReleaseData(byAdmissionRes.data.data);
            setIsLoading(false);
            return;
          }
        } catch (e) { /* not found by admission */ }

        // Try 2: Fetch by deceased ID
        try {
          const directResponse = await api.get(`/body-release/checkout/${deceasedId}`, {
            headers: {
              ...getTenantHeaders(),
              'x-tenant-slug': tenantSlug
            }
          });
          if (directResponse.data?.success && directResponse.data?.data) {
            setReleaseData(directResponse.data.data);
            setIsLoading(false);
            return;
          }
        } catch (e) { /* not found by id */ }

        // Try 3: Fetch all releases and find by admission_number or name
        const response = await api.get('/body-release/checkout', {
          headers: {
            ...getTenantHeaders(),
            'x-tenant-slug': tenantSlug
          }
        });
        
        if (response.data?.success && response.data?.data) {
          const deceasedRelease = response.data.data.find((release) => 
            release.admission_number === admissionNumber || 
            release.admission_number === deceasedId || 
            release.name_of_deceased === d.full_name ||
            release.name_of_deceased === d.name_of_deceased
          );
          if (deceasedRelease) {
            setReleaseData(deceasedRelease);
          }
        }
      } catch (error) {
        console.error('Error fetching release data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReleaseData();
  }, [deceasedId, d.full_name, d.name_of_deceased, d.admission_number, d.admission_no]);

  return (
    <>
      <SectionHead $mt0><span>01</span> Release Details</SectionHead>
      <DetailGrid>
        <DetailBox><DetailLabel>Scheduled Release Date</DetailLabel><DetailValue>{releaseData?.date_of_removal ? formatDate(releaseData.date_of_removal) : 'Not scheduled'}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Scheduled Release Time</DetailLabel><DetailValue>{releaseData?.time_of_removal || '—'}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Authorized By (NOK)</DetailLabel><DetailValue>{releaseData?.next_kin || nextOfKin?.full_name || nextOfKin?.name || '—'}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Relationship to Deceased</DetailLabel><DetailValue>{releaseData?.relationship || nextOfKin?.relationship || '—'}</DetailValue></DetailBox>
      </DetailGrid>

      <SectionHead><span>02</span> Transportation Details</SectionHead>
      <DetailGrid>
        <DetailBox><DetailLabel>Permit Number</DetailLabel><DetailValue>{releaseData?.permit_number || '—'}</DetailValue></DetailBox>
        <DetailBox><DetailLabel>Mode of Transport</DetailLabel><DetailValue>{releaseData?.mode_of_transport || 'Hearse / Van'}</DetailValue></DetailBox>
        <DetailBox $full><DetailLabel>Transport Carrier / Driver Name</DetailLabel><DetailValue>{releaseData?.transport_carrier || '—'}</DetailValue></DetailBox>
        <DetailBox $full><DetailLabel>Final Destination</DetailLabel><DetailValue>{releaseData?.final_destination || '—'}</DetailValue></DetailBox>
      </DetailGrid>

      <SectionHead><span>03</span> Release Checklist</SectionHead>
      <DetailGrid>
        <DetailBox $full>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: C.success, fontSize: 18 }}>✓</span>
            <DetailValue style={{ fontSize: 14 }}>All financials cleared (or payment plan agreed)</DetailValue>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: C.success, fontSize: 18 }}>✓</span>
            <DetailValue style={{ fontSize: 14 }}>Burial permit obtained</DetailValue>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.gray, fontSize: 18 }}>○</span>
            <DetailValue $muted style={{ fontSize: 14 }}>Identification by Next of Kin (Pending)</DetailValue>
          </div>
        </DetailBox>
      </DetailGrid>

      <div style={{ textAlign: 'center', marginTop: 32, padding: 24, border: `2px dashed ${C.border}`, borderRadius: 8 }}>
        <h3 style={{ fontFamily: "'Merriweather', serif", marginBottom: 12, color: C.black }}>Final Authorization</h3>
        <p style={{ color: C.gray, marginBottom: 16 }}>Ensure all checklist items are complete before releasing the body.</p>
        <Btn $danger style={{ padding: '12px 32px', fontSize: 16 }} onClick={handleFinalizeRelease}>Finalize & Release Body</Btn>
      </div>
    </>
  );
};

export default ReleaseTab;