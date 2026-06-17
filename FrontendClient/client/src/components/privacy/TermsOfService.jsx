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
        <p style={{ color: C.char500, fontSize: '0.85rem', marginBottom: '2rem' }}>Last updated: June 2026</p>

        <div style={{ background: 'rgba(166,124,82,0.06)', border: `1px solid rgba(166,124,82,0.2)`, borderRadius: '10px', padding: '1rem', marginBottom: '2rem', fontSize: '0.85rem', color: C.char700 }}>
          <strong>Important:</strong> Rest Point handles sensitive deceased and family data. By using this platform, you agree to strict data protection obligations. Violations may result in immediate account suspension.
        </div>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>1. Acceptance of Terms</h2>
        <p style={{ color: C.char700 }}>By accessing or using Rest Point ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Platform. These Terms constitute a binding agreement between you (the funeral home, "Customer") and Rest Point ("we", "us", "our").</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>2. Description of Service</h2>
        <p style={{ color: C.char700 }}>Rest Point provides a cloud-based mortuary management SaaS platform. Features include case management, family portal, document generation, billing, marketplace, memorial services, and related tools. We reserve the right to modify, suspend, or discontinue features with notice.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>3. Account Registration & Security</h2>
        <p style={{ color: C.char700 }}>You must provide accurate, complete information. You are solely responsible for maintaining the confidentiality of your login credentials. Notify us immediately of unauthorized access. We are not liable for losses from unauthorized account use.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>4. Data Protection & Privacy</h2>
        <p style={{ color: C.char700 }}>We process data on your behalf as a Data Processor. You are the Data Controller. Both parties comply with the Kenya Data Protection Act, 2019. You must obtain all necessary consents from families. We implement encryption, access controls, and audit trails. See our <a href="/privacy" style={{ color: C.gold }}>Privacy Policy</a>.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>5. Data Deletion & Account Termination</h2>
        <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
          <p style={{ color: '#DC2626', fontWeight: 600, marginBottom: '0.5rem' }}>⚠️ Account Deletion Policy</p>
          <p style={{ color: C.char700 }}>Upon account deletion request or account termination:</p>
          <ul style={{ color: C.char700, paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>All customer data is permanently deleted within 30 days of account closure.</li>
            <li>Deletion includes deceased records, family information, billing data, documents, and all associated files.</li>
            <li>Data is erased from all production databases, backups, and cached storage.</li>
            <li>A final data export (CSV/JSON) will be provided within 7 days of request.</li>
            <li>Backup copies are purged within the next backup rotation cycle (max 90 days).</li>
            <li>Once deleted, data <strong>cannot be recovered</strong> under any circumstances.</li>
            <li>Account holders may request verification of deletion in writing.</li>
          </ul>
        </div>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>6. Payment Terms</h2>
        <p style={{ color: C.char700 }}>Setup Fee: KES 1,000 (one-time). Monthly subscription: KES 9,500 single-tenant or KES 18,500 multi-tenant. Payments due monthly. 5-day grace period. Late payment may result in suspension. Reactivation: KES 1,000. All fees in KES.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>7. Acceptable Use</h2>
        <p style={{ color: C.char700 }}>You agree not to: misuse the platform for unlawful purposes, upload malicious code, attempt unauthorized access, share accounts, or use platform data for purposes beyond funeral home management. Violation results in immediate termination without refund.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>8. Limitation of Liability</h2>
        <p style={{ color: C.char700 }}>To the maximum extent permitted by law, Rest Point shall not be liable for indirect, incidental, or consequential damages. Our total liability is limited to fees paid in the 12 months preceding the claim. We are not liable for data loss from customer error or third-party services.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>9. Indemnification</h2>
        <p style={{ color: C.char700 }}>You agree to indemnify and hold Rest Point harmless from claims arising from: your use of the platform, violation of these Terms, violation of any law or third-party right, or mishandling of family data.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>10. Termination</h2>
        <p style={{ color: C.char700 }}>Either party may terminate with 30 days written notice. We may terminate immediately for violation of these Terms. Upon termination, your access is revoked and data deletion process begins per Section 5.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>11. Governing Law</h2>
        <p style={{ color: C.char700 }}>These Terms are governed by the laws of the Republic of Kenya. Any disputes shall be resolved through arbitration in Nairobi, Kenya, in accordance with the Arbitration Act, 1995.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>12. Changes to Terms</h2>
        <p style={{ color: C.char700 }}>We may update these Terms. Material changes will be notified via email and platform notice. Continued use after changes constitutes acceptance.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>13. Contact</h2>
        <p style={{ color: C.char700 }}>Email: <a href="mailto:legal@restpoint.co.ke" style={{ color: C.gold }}>legal@restpoint.co.ke</a><br/>Data requests: <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>privacy@restpoint.co.ke</a></p>
      </div>
    </div>
  );
}