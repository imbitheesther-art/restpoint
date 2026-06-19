import React from 'react';
import { useNavigate } from 'react-router-dom';

const C = { navy900: '#0A1F3D', gold: '#A67C52', emerald: '#059669', char700: '#374151', char600: '#4B5563', char500: '#6B7280', char200: '#E5E7EB', char100: '#F3F4F6', navy50: '#F9FAFB' };

export default function TermsOfService() {
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.navy50, minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');`}</style>
      <nav style={{ padding: '1rem 2rem', borderBottom: `1px solid ${C.char200}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/')} style={{ background: C.navy900, color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Back</button>
        <span style={{ fontFamily: "'Lora', serif", fontWeight: 600, color: C.navy900, fontSize: '1.1rem' }}>Rest Point — Terms of Service</span>
      </nav>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem', lineHeight: 1.8 }}>
        <h1 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '2rem', marginBottom: '0.5rem' }}>Terms of Service</h1>
        <p style={{ color: C.char500, fontSize: '0.85rem', marginBottom: '2rem' }}>Last updated: June 2026 · Rest Point v2</p>

        <div style={{ background: 'rgba(166,124,82,0.06)', border: `1px solid rgba(166,124,82,0.2)`, borderRadius: '10px', padding: '1.25rem', marginBottom: '2rem' }}>
          <p style={{ color: C.navy900, fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Built by Welt Tallis Technologies</p>
          <p style={{ color: C.char700, fontSize: '0.9rem' }}>Rest Point is <strong>version 2</strong> of the platform. Version 3 will bring payment and card integration. Version 4 will be the definitive stable build of the entire system. Our biggest responsibility is to <strong>protect your data at all costs</strong>. We do not share your data with anyone. We do not manipulate your data. You never need to worry about anything — your data is backed up to your own Google Drive, a NAS device attached to your network, and our secure infrastructure. Built for integration across Africa with scale, security, and stability — zero downtime.</p>
        </div>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>1. Acceptance of Terms</h2>
        <p style={{ color: C.char700 }}>By accessing or using Rest Point ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Platform. These Terms constitute a binding agreement between you (the funeral home, "Customer") and Rest Point ("we", "us", "our"), built and maintained by <strong>Welt Tallis Technologies</strong>.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>2. Description of Service</h2>
        <p style={{ color: C.char700 }}>Rest Point provides a cloud-based mortuary management SaaS platform. Features include case management, family portal, document generation, billing, marketplace, memorial services, and related tools. We reserve the right to modify, suspend, or discontinue features with notice. <strong>v3</strong> will introduce payment and card integration. <strong>v4</strong> will be the definitive stable build of the entire system.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>3. Account Registration & Security</h2>
        <p style={{ color: C.char700 }}>You must provide accurate, complete information. You are solely responsible for maintaining the confidentiality of your login credentials. Notify us immediately of unauthorized access. We are not liable for losses from unauthorized account use.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>4. Data Protection & Privacy</h2>
        <p style={{ color: C.char700 }}>We process data on your behalf as a Data Processor. You are the Data Controller. We do not share your data with anyone. We do not manipulate your data. We implement encryption, access controls, and audit trails. Your data is backed up to your own Google Drive, a NAS device on your network, and our secure infrastructure. See our <a href="/privacy" style={{ color: C.gold }}>Privacy Policy</a>.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>5. Data Deletion & Account Termination</h2>
        <p style={{ color: C.char700 }}>We do not delete client data unless the client has explicitly requested deletion in writing. Even then, the process takes <strong>up to 2 months</strong> because we take data protection seriously. Clients have the right to request their data at any time, request corrections, and request data in portable format. See our <a href="/account-deletion" style={{ color: C.gold }}>Account Deletion Policy</a>.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>6. Payment Terms</h2>
        <p style={{ color: C.char700 }}>Setup Fee: KES 1,000 (one-time). Monthly subscription: KES 9,500 single-tenant or KES 18,500 multi-tenant. Payments due monthly. 5-day grace period. Late payment may result in suspension. Reactivation: KES 1,000. All fees in KES.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>7. Acceptable Use</h2>
        <p style={{ color: C.char700 }}>You agree not to: misuse the platform for unlawful purposes, upload malicious code, attempt unauthorized access, share accounts, or use platform data for purposes beyond funeral home management. Violation results in immediate termination without refund.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>8. Limitation of Liability</h2>
        <p style={{ color: C.char700 }}>To the maximum extent permitted by law, Rest Point shall not be liable for indirect, incidental, or consequential damages. Our total liability is limited to fees paid in the 12 months preceding the claim. We are not liable for data loss from customer error or third-party services.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>9. Indemnification</h2>
        <p style={{ color: C.char700 }}>You agree to indemnify and hold Rest Point harmless from claims arising from: your use of the platform, violation of these Terms, violation of any law or third-party right, or mishandling of family data.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>10. Termination</h2>
        <p style={{ color: C.char700 }}>Either party may terminate with 30 days written notice. We may terminate immediately for violation of these Terms. Upon termination, your access is revoked and data deletion process begins per our Account Deletion Policy.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>11. Governing Law</h2>
        <p style={{ color: C.char700 }}>These Terms are governed by the laws of the Republic of Kenya. Any disputes shall be resolved through arbitration in Nairobi, Kenya, in accordance with the Arbitration Act, 1995.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>12. Changes to Terms</h2>
        <p style={{ color: C.char700 }}>We may update these Terms. Material changes will be notified via email and platform notice. Continued use after changes constitutes acceptance.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>13. Contact</h2>
        <p style={{ color: C.char700 }}>
          Email: <a href="mailto:legal@restpoint.co.ke" style={{ color: C.gold }}>legal@restpoint.co.ke</a><br/>
          Data requests: <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>privacy@restpoint.co.ke</a><br/>
          Built with care by <strong>Welt Tallis Technologies</strong>
        </p>
      </div>
    </div>
  );
}