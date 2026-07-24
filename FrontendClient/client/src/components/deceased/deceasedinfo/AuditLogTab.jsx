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

const DataTable = styled.table`
  width: 100%; border-collapse: collapse;
  th { text-align: left; font-size: 11px; text-transform: uppercase; color: ${C.gray}; padding: 8px 12px; border-bottom: 2px solid ${C.borderLight}; white-space: nowrap; }
  td { padding: 12px; font-size: 13px; border-bottom: 1px solid ${C.borderLight}; vertical-align: middle; }
`;

const AuditLogTab = ({ deceased, postmortem, charges, payments, releaseData }) => {
  const d = deceased || {};

  const auditLog = [
    // 1. Admission / Record Created
    {
      action: 'Record Created (Admission Intake)',
      user: d.receiving_officer || d.admitted_by || 'System',
      role: 'Receiving Officer',
      timestamp: d.created_at || d.admission_time,
    },

    // 2. Embalming status change
    ...(d.embalmed
      ? [{
          action: 'Body Embalmed',
          user: d.embalmed_by || d.admitted_by || 'System',
          role: 'Mortician',
          timestamp: d.embalmed_date || d.updated_at,
        }]
      : []),

    // 3. Postmortem
    ...(postmortem?.status === 'completed'
      ? [{
          action: 'Postmortem Results Saved',
          user: postmortem.pathologist_name || 'Unknown',
          role: 'Pathologist',
          timestamp: postmortem.completed_at || postmortem.updated_at,
        }]
      : []),

    // 4. Postmortem requested
    ...(postmortem?.status === 'pending'
      ? [{
          action: 'Postmortem Requested',
          user: postmortem.requested_by || 'System',
          role: 'Requesting Authority',
          timestamp: postmortem.requested_at || postmortem.created_at,
        }]
      : []),

    // 5. Charges added
    ...(Array.isArray(charges) && charges.length > 0
      ? charges.map(c => ({
          action: `Charge Added: ${c.description || c.charge_name || 'Service Charge'} ($${parseFloat(c.amount || c.charge_amount || 0).toFixed(2)})`,
          user: c.created_by || c.added_by || d.admitted_by || 'System',
          role: 'Billing Officer',
          timestamp: c.created_at || c.updated_at,
        }))
      : []),

    // 6. Payments recorded
    ...(Array.isArray(payments) && payments.length > 0
      ? payments.map(p => ({
          action: `Payment Recorded: $${parseFloat(p.amount || 0).toFixed(2)} (${p.payment_method || p.method || 'N/A'})`,
          user: p.received_by || p.processed_by || d.admitted_by || 'System',
          role: 'Cashier',
          timestamp: p.payment_date || p.created_at,
        }))
      : []),

    // 7. Body Release
    ...(releaseData
      ? [{
          action: `Body Released to: ${releaseData.released_to || releaseData.receiver_name || 'Unknown'}`,
          user: releaseData.released_by || releaseData.authorized_by || 'System',
          role: 'Authorized Officer',
          timestamp: releaseData.released_at || releaseData.created_at,
        }]
      : []),

    // 8. Body status changes
    ...(d.body_status && d.body_status !== 'admitted'
      ? [{
          action: `Body Status Changed: ${d.body_status}`,
          user: d.updated_by || d.admitted_by || 'System',
          role: 'Mortuary Attendant',
          timestamp: d.updated_at,
        }]
      : []),
  ].filter(Boolean);

  return (
    <>
      <SectionHead $mt0><span>01</span> System Audit Trail</SectionHead>
      <div style={{ overflowX: 'auto', border: `1px solid ${C.borderLight}`, borderRadius: 6 }}>
        <DataTable style={{ marginTop: 0 }}>
          <thead>
            <tr>
              <th>Action Performed</th>
              <th>User</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {auditLog.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: C.gray, padding: 20 }}>No audit records found</td></tr>
            ) : auditLog.map((log, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{log.action}</td>
                <td>
                  <strong>{log.user}</strong>
                  <br />
                  <span style={{ fontSize: 11, color: C.gray }}>{log.role}</span>
                </td>
                <td style={{ color: C.gray, fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(log.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
    </>
  );
};

export default AuditLogTab;