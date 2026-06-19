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
          <p style={{ color: C.navy900, fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Built by Welt Tallis Technologies</p>
          <p style={{ color: C.char700, fontSize: '0.9rem' }}>Rest Point is built and maintained by <strong>Welt Tallis Technologies</strong>. This is <strong>version 2</strong> of the platform. Version 3 will bring payment and card integration. Version 4 will be the definitive stable build of the entire system. Our biggest responsibility is to <strong>protect your data at all costs</strong>. You never need to worry about anything — your data is backed up to your own Google Drive, a NAS device attached to your network, and our secure infrastructure. We do not share your data with anyone. We do not manipulate your data.</p>
        </div>

        <div style={{ background: 'rgba(166,124,82,0.06)', border: '1px solid rgba(166,124,82,0.2)', borderRadius: '10px', padding: '1.25rem', marginBottom: '2rem' }}>
          <p style={{ color: C.navy900, fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Our Promise to You</p>
          <p style={{ color: C.char700, fontSize: '0.9rem' }}>Rest Point is built and maintained by <strong>Welt Tallis Technologies</strong>. This is <strong>version 2</strong> of the platform. Version 3 will bring payment and card integration. Version 4 will be the definitive stable build of the entire system. Our biggest responsibility is to <strong>protect your data at all costs</strong>. You never need to worry about anything — your data is backed up to your own Google Drive, a NAS device attached to your network, and our secure infrastructure. We do not share your data with anyone. We do not manipulate your data.</p>
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

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>8. Built for Africa — Scale, Security, Stability</h2>
        <p style={{ color: C.char700 }}>Rest Point is built for integration across Africa. We prioritise <strong>scale, security, and stability</strong> above all else. Our infrastructure is designed for <strong>zero downtime</strong>. We are committed to ensuring your operations never skip a beat.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>9. Pricing for Deletion</h2>
        <p style={{ color: C.char700 }}>The following fees apply to account deletion requests:</p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li><strong>Setup fee:</strong> KES 1,000 (one-time, administrative processing)</li>
          <li><strong>Deletion processing fee:</strong> KES 2,500 (covers verification, data export, and permanent removal)</li>
          <li><strong>Data export:</strong> Free — included in the deletion process (CSV/JSON format, delivered within 7 days)</li>
          <li><strong>Total:</strong> KES 3,500 (one-time, billed upon completion of deletion)</li>
        </ul>
        <p style={{ color: C.char700, marginTop: '0.7rem' }}>Payment must be received before deletion processing begins. All fees are in KES and are non-refundable once the deletion process has commenced.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>10. Contact</h2>
        <p style={{ color: C.char700 }}>
          Deletion requests: <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>privacy@restpoint.co.ke</a><br/>
          Data Protection Officer: <a href="mailto:dpo@restpoint.co.ke" style={{ color: C.gold }}>dpo@restpoint.co.ke</a><br/>
          General inquiries: <a href="mailto:info@restpoint.co.ke" style={{ color: C.gold }}>info@restpoint.co.ke</a><br/>
          Built with care by <strong>Welt Tallis Technologies</strong>
        </p>
      </div>
    </div>
  );
}