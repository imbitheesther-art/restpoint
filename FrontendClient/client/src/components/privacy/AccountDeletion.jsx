import React from 'react';
import { useNavigate } from 'react-router-dom';

const C = { navy900: '#0A1F3D', gold: '#A67C52', emerald: '#059669', char700: '#374151', char600: '#4B5563', char500: '#6B7280', char200: '#E5E7EB', char100: '#F3F4F6', navy50: '#F9FAFB' };

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
        <p style={{ color: C.char500, fontSize: '0.85rem', marginBottom: '2rem' }}>Last updated: June 2026 · Rest Point v2</p>

        <div style={{ background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: '10px', padding: '1.25rem', marginBottom: '2rem' }}>
          <p style={{ color: C.emerald, fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Pricing for Account Deletion</p>
          <p style={{ color: C.char700, fontSize: '0.9rem' }}>
            <strong>Setup fee:</strong> KES 1,000 (one-time, covers administrative processing)<br />
            <strong>Deletion processing fee:</strong> KES 2,500 (covers verification, data export, and permanent removal)<br />
            <strong>Data export:</strong> Provided within 7 days of request (CSV/JSON format)<br />
            <strong>Total cost:</strong> KES 3,500 (one-time, billed upon completion of deletion)
          </p>
        </div>

        <div style={{ background: 'rgba(166,124,82,0.06)', border: '1px solid rgba(166,124,82,0.2)', borderRadius: '10px', padding: '1.25rem', marginBottom: '2rem' }}>
          <p style={{ color: C.char700, fontSize: '0.9rem' }}>Account deletion is taken seriously. The process takes <strong>up to 2 months</strong> to ensure no data is lost and you have ample time to change your mind. A complete data export is provided within 7 days, and all backup copies are purged within 90 days.</p>
        </div>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>1. Your Data Is Yours</h2>
        <p style={{ color: C.char700 }}>We do not delete client data unless the client has explicitly requested deletion in writing. Even then, the process takes time because we take data protection seriously. We do not share, sell, or manipulate your data in any way. Your data stays yours — always.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>2. Requesting Deletion</h2>
        <p style={{ color: C.char700 }}>To request account deletion, you must submit a written request to <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>privacy@restpoint.co.ke</a> from the registered account email. We will verify your identity before processing any deletion request.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>3. Deletion Timeline</h2>
        <p style={{ color: C.char700 }}>Once a written deletion request is received and verified, the full deletion process takes <strong>up to 2 months</strong>. This is intentional — we want to ensure no data is lost and that you have ample time to change your mind.</p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li><strong>Within 7 days:</strong> Final data export (CSV/JSON) provided to account holder</li>
          <li><strong>Within 30–60 days:</strong> All production data permanently deleted after verification period</li>
          <li><strong>Within 90 days:</strong> Backup copies purged from all systems</li>
        </ul>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>4. Data Export</h2>
        <p style={{ color: C.char700 }}>Before deletion, we will provide a complete data export. This includes: deceased records, documents, billing history, and configuration. The export will be delivered as CSV and JSON files via secure download link. You have 14 days to download after notification.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>5. Your Rights</h2>
        <p style={{ color: C.char700 }}>Clients have the right to request their data at any time, request corrections to inaccurate data, and request data in portable format (CSV/JSON). You may also request that we restrict processing of your data. To exercise these rights: <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>privacy@restpoint.co.ke</a>. We respond promptly.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>6. Irreversibility</h2>
        <p style={{ color: C.char700 }}>Once the deletion process is complete, data cannot be recovered. We do not retain any copies. New accounts created after deletion will start with an empty database. We recommend downloading all data before confirming deletion.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>7. Backup & Redundancy</h2>
        <p style={{ color: C.char700 }}>Your data is backed up in multiple places: your own <strong>Google Drive</strong> (automatically synced), a <strong>NAS device</strong> (physical storage attached to your network), and our secure infrastructure. Even if something happens to our servers, your data remains safe and accessible through your own backups.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>8. Contact</h2>
        <p style={{ color: C.char700 }}>
          Deletion requests: <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>privacy@restpoint.co.ke</a><br/>
          General inquiries: <a href="mailto:info@restpoint.co.ke" style={{ color: C.gold }}>info@restpoint.co.ke</a><br/>
          
        </p>
      </div>
    </div>
  );
}