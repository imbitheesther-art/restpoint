import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { C, formatDate } from './theme';
import RouteOptimizer from '../../hearse/RouteOptimizer';
import api from '../../../api/axios';

const SectionHead = styled.div`
  background: ${C.black}; color: white; padding: 8px 16px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; margin-bottom: 24px; border-radius: 2px;
  display: flex; align-items: center; gap: 8px;
  span { opacity: 0.5; font-size: 10px; }
  ${p => p.$mt0 && 'margin-top: 0;'}
`;

const Btn = styled.button`
  padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 13px;
  cursor: pointer; border: 1px solid ${C.border}; background: white; color: ${C.dark};
  transition: 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-family: 'Source Sans 3', sans-serif;
  &:hover { background: ${C.bgField}; border-color: ${C.gray}; }
  ${p => p.$primary && `background: ${C.black}; color: white; border-color: ${C.black};
    &:hover { background: ${C.dark}; }`}
  ${p => p.$sm && `padding: 6px 12px; font-size: 12px;`}
`;

const DataTable = styled.table`
  width: 100%; border-collapse: collapse;
  th { text-align: left; font-size: 11px; text-transform: uppercase; color: ${C.gray}; padding: 8px 12px; border-bottom: 2px solid ${C.borderLight}; white-space: nowrap; }
  td { padding: 12px; font-size: 13px; border-bottom: 1px solid ${C.borderLight}; vertical-align: middle; }
`;

const StatusTag = styled.span`
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
  border-radius: 4px; font-size: 12px; font-weight: 700;
  background: ${p => p.$info ? C.infoBg : C.bgField};
  color: ${p => p.$info ? C.info : C.gray};
  border: 1px solid ${p => p.$info ? '#bfdbfe' : C.borderLight};
`;

const RouteCalcBtn = styled.button`
  padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 13px;
  cursor: pointer; border: 1px solid #0c2530; background: #0c2530; color: #ffffff;
  transition: 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-family: 'Source Sans 3', sans-serif;
  &:hover { background: #0d2d3a; border-color: #0d2d3a; }
`;

const DocumentsTab = ({ documents, deceasedId }) => {
  const [showRouteOptimizer, setShowRouteOptimizer] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const docs = Array.isArray(documents) ? documents : [];
  const fileInputRef = useRef(null);

  const handleUploadDocument = async (e) => {
    const file = e.target.files?.[0];
    console.log('[DocumentsTab] File selected:', file?.name, 'deceasedId:', deceasedId);
    
    if (!file || !deceasedId) {
      console.error('[DocumentsTab] Missing file or deceasedId:', { file, deceasedId });
      alert('Missing file or deceased ID');
      return;
    }

    setIsUploading(true);
    try {
      const tenantSlug = localStorage.getItem('tenantSlug') || localStorage.getItem('tenant_slug');
      console.log('[DocumentsTab] Uploading to:', '/documents/upload', 'with tenant:', tenantSlug);
      
      const formData = new FormData();
      formData.append('document', file);
      formData.append('deceasedId', deceasedId);

      // Upload directly to documents service (different origin, no credentials)
      const response = await api.post(`http://localhost:8112/v1/restpoint/documents/${deceasedId}/upload`, formData, {
        headers: {
          'x-tenant-slug': tenantSlug,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: false
      });

      console.log('[DocumentsTab] Upload response:', response.data);
      
      if (response.data?.success) {
        alert('Document uploaded successfully');
        window.location.reload();
      } else {
        alert(response.data?.message || 'Failed to upload document');
      }
    } catch (error) {
      console.error('[DocumentsTab] Error uploading document:', error);
      alert(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileUpload = () => {
    console.log('[DocumentsTab] Upload button clicked');
    if (fileInputRef.current) {
      console.log('[DocumentsTab] Triggering file input click');
      fileInputRef.current.click();
    } else {
      console.error('[DocumentsTab] File input ref is null');
    }
  };

  return (
    <>
      {showRouteOptimizer && <RouteOptimizer onClose={() => setShowRouteOptimizer(false)} />}
      <SectionHead $mt0><span>01</span> Uploaded Documents</SectionHead>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleUploadDocument}
          disabled={isUploading}
          style={{ display: 'none' }}
        />
        <Btn 
          $primary 
          onClick={triggerFileUpload} 
          disabled={isUploading}
          style={{ cursor: 'pointer' }}
        >
          {isUploading ? 'Uploading...' : '+ Upload Document'}
        </Btn>
        <Btn>Scan Document</Btn>
        <RouteCalcBtn onClick={() => setShowRouteOptimizer(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          Route Calculations
        </RouteCalcBtn>
      </div>
      <div style={{ overflowX: 'auto', border: `1px solid ${C.borderLight}`, borderRadius: 6 }}>
        <DataTable style={{ marginTop: 0 }}>
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Type</th>
              <th>Uploaded Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: C.gray, padding: 20 }}>No documents uploaded</td></tr>
            ) : docs.map((doc, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{doc.name || doc.file_name}</td>
                <td><StatusTag $info>{doc.type || 'Document'}</StatusTag></td>
                <td>{formatDate(doc.created_at)}</td>
                <td style={{ textAlign: 'right' }}>
                  <Btn $sm>View</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
    </>
  );
};

export default DocumentsTab;