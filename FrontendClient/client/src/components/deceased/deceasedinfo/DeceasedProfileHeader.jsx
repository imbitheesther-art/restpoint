import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { C } from './theme';
import RouteOptimizer from '../../hearse/RouteOptimizer';

const BackBtn = styled.button`
  font-size: 14px; font-weight: 600; color: ${C.gray}; cursor: pointer;
  background: none; border: none; display: flex; align-items: center; gap: 8px;
  margin-bottom: 16px; padding: 0; font-family: 'Source Sans 3', sans-serif;
  &:hover { color: ${C.black}; }
`;

const ProfileHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
  h2 { font-family: 'Merriweather', serif; font-size: 28px; color: ${C.black}; margin: 0 0 4px; }
  p { color: ${C.gray}; font-size: 14px; margin: 0; }
`;

const HeaderActions = styled.div`
  display: flex; gap: 12px; flex-wrap: wrap;
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

const RouteCalcBtn = styled.button`
  padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 13px;
  cursor: pointer; border: 1px solid #0c2530; background: #0c2530; color: #ffffff;
  transition: 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-family: 'Source Sans 3', sans-serif;
  &:hover { background: #0d2d3a; border-color: #0d2d3a; }
`;

const DeceasedProfileHeader = ({ deceased, onBack, onTabSwitch }) => {
  const navigate = useNavigate();
  const { id: deceasedId } = useParams();
  const [showRouteOptimizer, setShowRouteOptimizer] = useState(false);
  const name = deceased?.full_name || deceased?.name || 'Unknown';
  const displayId = deceased?.deceased_id || deceased?.id;
  const admissionNo = deceased?.admission_number || deceased?.admission_no || '—';
  const navigateToReleaseForm = () => {
    const slug = localStorage.getItem('tenantSlug') || 'system_shared';
    navigate(`/tenant/${slug}/release-form/${deceasedId || displayId}`, {
      state: { deceasedData: deceased }
    });
  };

  return (
    <>
      {showRouteOptimizer && <RouteOptimizer onClose={() => setShowRouteOptimizer(false)} />}
      <BackBtn onClick={onBack}>← Back to List</BackBtn>
      <ProfileHeader>
        <div>
          <h2>{name}</h2>
          <p><span>{displayId}</span> | <span>{admissionNo}</span></p>
        </div>
        <HeaderActions>
          <RouteCalcBtn onClick={() => setShowRouteOptimizer(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Route Calculations
          </RouteCalcBtn>
          <Btn>Scan Docs</Btn>
          <Btn>Generate PDF</Btn>
          <Btn $danger onClick={navigateToReleaseForm}>Release Body</Btn>
        </HeaderActions>
      </ProfileHeader>
    </>
  );
};

export default DeceasedProfileHeader;