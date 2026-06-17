import React from 'react';
import { useNavigate } from 'react-router-dom';

const C = { navy900: '#0A1F3D', gold: '#A67C52', char700: '#374151', char500: '#6B7280', char200: '#E5E7EB', navy50: '#F9FAFB' };

export default function AccountDeletion() {
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.navy50, minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');`}</style>
      <nav style={{ padding: '1rem 2rem', borderBottom: `1px solid ${C.char200}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/')} style={{ background: C.navy900, color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Back</button>
        <span style={{ fontFamily: "'Lora', serif", fontWeight: 600, color: C.navy900, fontSize: '1.1rem' }}>Rest Point — Account Deletion Policy</span>
      </nav>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem', lineHeight: 1.8 }}>
        <h1 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '2rem', marginBottom: '0.5rem' }}>Account Deletion Policy</h1>
        <p style={{ color: C.char500, fontSize: '0.85rem', marginBottom: '2rem' }}>Last updated: June 2026</p>

        <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '1.25rem', marginBottom: '2rem' }}>
          <p style={{ color: '#DC2626', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>⚠️ Important: Data Deletion is Permanent</p>
          <p style={{ color: C.char700, fontSize: '0.9rem' }}>Once your account and associated data are deleted, they <strong>cannot be recovered</strong> under any circumstances. Please ensure you have exported all necessary data before proceeding.</p>
        </div>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>1. Requesting Deletion</h2>
        <p style={{ color: C.char700 }}>Account deletion requests must be submitted in writing to <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>privacy@restpoint.co.ke</a> from the registered account email. We will verify your identity before processing.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>2. What Gets Deleted</h2>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>All deceased records and case history</li>
          <li>Family contact information and next of kin details</li>
          <li>All uploaded documents, permits, certificates, and files</li>
          <li>Billing history, invoices, and payment records</li>
          <li>User accounts and staff profiles</li>
          <li>Configuration, branding, and settings</li>
          <li>Audit logs associated with your account</li>
        </ul>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>3. Deletion Timeline</h2>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li><strong>Within 7 days:</strong> Final data export (CSV/JSON) provided to account holder</li>
          <li><strong>Within 30 days:</strong> All production data permanently deleted</li>
          <li><strong>Within 90 days:</strong> Backup copies purged from all systems</li>
        </ul>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>4. Data Export</h2>
        <p style={{ color: C.char700 }}>Before deletion, we will provide a complete data export. This includes: deceased records, documents, billing history, and configuration. The export will be delivered as CSV and JSON files via secure download link. You have 14 days to download after notification.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>5. Irreversibility</h2>
        <p style={{ color: C.char700 }}>Once the deletion process is complete, data cannot be recovered. We do not retain any copies. New accounts created after deletion will start with an empty database. We recommend downloading all data before requesting deletion.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>6. Exceptions</h2>
        <p style={{ color: C.char700 }}>We may retain certain data if required by Kenyan law (e.g., tax records, legal holds). You will be notified of any retained data and the legal basis for retention.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>7. Contact</h2>
        <p style={{ color: C.char700 }}>
          Deletion requests: <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>privacy@restpoint.co.ke</a><br/>
          Data Protection Officer: <a href="mailto:dpo@restpoint.co.ke" style={{ color: C.gold }}>dpo@restpoint.co.ke</a>
        </p>
      </div>
    </div>
  );
}