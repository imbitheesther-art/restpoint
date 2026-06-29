// src/components/StatusPage.jsx
import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { 
  StatusCard, StatusItem, StatusLabel, StatusValue, PageTitle
} from './StyledComponents';

const StatusPage = ({ data }) => {
  return (
    <>
      <PageTitle><FaInfoCircle /> Deceased Status</PageTitle>
      <StatusCard>
        <h4>Welcome {data.next_of_kin}</h4>
        <p>Here is your loved one's information:</p>
        <StatusItem>
          <StatusLabel>Deceased ID:</StatusLabel>
          <StatusValue>{data.deceased_id}</StatusValue>
        </StatusItem>
        <StatusItem>
          <StatusLabel>Full Name:</StatusLabel>
          <StatusValue>{data.deceased_name}</StatusValue>
        </StatusItem>
        {/* ... (other status items) ... */}
        <StatusItem>
          <StatusLabel>Status:</StatusLabel>
          <StatusValue>{data.portal_status || "N/A"}</StatusValue>
        </StatusItem>
        <StatusItem>
          <StatusLabel>Remarks:</StatusLabel>
          <StatusValue>{data.portal_remarks || "N/A"}</StatusValue>
        </StatusItem>
        <StatusItem>
          <StatusLabel>Relationship:</StatusLabel>
          <StatusValue>{data.relationship || "N/A"}</StatusValue>
        </StatusItem>
      </StatusCard>
    </>
  );
};

export default StatusPage;