import React from 'react';
import { useNavigate } from 'react-router-dom';

const C = { navy900: '#0A1F3D', gold: '#A67C52', emerald: '#059669', char700: '#374151', char600: '#4B5563', char500: '#6B7280', char200: '#E5E7EB', char100: '#F3F4F6', navy50: '#F9FAFB' };

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.navy50, minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');`}</style>
      <nav style={{ padding: '1rem 2rem', borderBottom: `1px solid ${C.char200}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/')} style={{ background: C.navy900, color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Back</button>
        <span style={{ fontFamily: "'Lora', serif", fontWeight: 600, color: C.navy900, fontSize: '1.1rem' }}>Rest Point — Privacy Policy</span>
      </nav>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem', lineHeight: 1.8 }}>
        <h1 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '2rem', marginBottom: '0.5rem' }}>Privacy Policy</h1>
        <p style={{ color: C.char500, fontSize: '0.85rem', marginBottom: '2rem' }}>Last updated: June 2026 · Rest Point v2</p>

        <div style={{ background: 'rgba(166,124,82,0.06)', border: `1px solid rgba(166,124,82,0.2)`, borderRadius: '10px', padding: '1.25rem', marginBottom: '2rem' }}>
          <p style={{ color: C.navy900, fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Built by Welt Tallis Technologies</p>
          <p style={{ color: C.char700, fontSize: '0.9rem' }}>Rest Point is <strong>version 2</strong> of the platform. Version 3 will bring payment and card integration. Version 4 will be the definitive stable build of the entire system. Our biggest responsibility is to <strong>protect your data at all costs</strong>. We do not share your data with anyone. We do not manipulate your data. You never need to worry about anything — your data is backed up to your own Google Drive, a NAS device attached to your network, and our secure infrastructure. Built for integration across Africa with scale, security, and stability — zero downtime.</p>
        </div>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>1. Our Role</h2>
        <p style={{ color: C.char700 }}>Rest Point is a software platform provided to funeral homes. We process personal data on behalf of our customers (the funeral homes), who are the Data Controllers. We do not use your data for our own purposes. We never sell, rent, or trade personal data. We do not share your data with anyone. We do not manipulate your data.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>2. What We Collect</h2>
        <p style={{ color: C.char700 }}><strong>Funeral Home Staff:</strong> Name, email, phone, username, password (hashed), billing info.</p>
        <p style={{ color: C.char700 }}><strong>Deceased & Families (on behalf of funeral homes):</strong> Name, date of birth/death, cause of death, religious beliefs, next of kin details, identification documents.</p>
        <p style={{ color: C.char700 }}><strong>Technical:</strong> IP address, browser type, pages visited, cookies for essential functionality and analytics.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>3. How We Use Information</h2>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>To provide, maintain and improve the platform</li>
          <li>To manage accounts and provide customer support</li>
          <li>For security monitoring and fraud prevention</li>
          <li>To comply with legal obligations</li>
          <li><strong>We never use your data for advertising, profiling, or any purpose beyond platform operation</strong></li>
        </ul>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>4. Data Sharing</h2>
        <p style={{ color: C.char700 }}>We do not share your data with anyone. The only exceptions are: authorized service providers (hosting, payment processors) under strict NDA, the funeral home that controls the data, and legal authorities when required by Kenyan law. In the event of a merger or acquisition, data may be transferred with notice and consent requirements.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>5. Data Security</h2>
        <p style={{ color: C.char700 }}>We implement: end-to-end encryption (AES-256 at rest, TLS 1.3 in transit), role-based access control with granular permissions, complete audit trails for all data access, automatic session timeout, regular security audits, firewalls, and intrusion detection. Postmortem reports, autopsy results, cause of death, and medical records are encrypted and automatically masked in API responses. Your data is backed up to your own Google Drive, a NAS device on your network, and our secure infrastructure.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>6. Data Retention & Deletion</h2>
        <p style={{ color: C.char700 }}>We retain data as long as your account is active. We do not delete client data unless the client has explicitly requested deletion in writing. Even then, the process takes <strong>up to 2 months</strong> because we take data protection seriously. Upon account termination or deletion request, all data is permanently deleted within 30–60 days. A final export is provided within 7 days of request. Backup copies are purged within 90 days. Once deleted, data cannot be recovered. See our <a href="/account-deletion" style={{ color: C.gold }}>Account Deletion Policy</a>.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>7. Your Rights</h2>
        <p style={{ color: C.char700 }}>Clients have the right to request their data at any time, request corrections to inaccurate data, request deletion ("right to be forgotten"), receive data in portable format (CSV/JSON), restrict processing, and withdraw consent. To exercise these rights: <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>privacy@restpoint.co.ke</a>. We respond promptly.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>8. International Transfers</h2>
        <p style={{ color: C.char700 }}>Your information may be stored on secure servers located outside Kenya. We ensure appropriate safeguards as required by applicable law, including Standard Contractual Clauses. Rest Point is built for integration across Africa with scale, security, and stability — zero downtime.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>9. Cookies</h2>
        <p style={{ color: C.char700 }}>We use essential cookies for authentication and platform functionality. Analytics cookies are used with your consent. You can control cookies through your browser settings.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>10. Changes to This Policy</h2>
        <p style={{ color: C.char700 }}>We may update this policy. Material changes will be notified via email and platform notice. Continued use after changes constitutes acceptance.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>11. Contact</h2>
        <p style={{ color: C.char700 }}>
          Data Protection Officer: <a href="mailto:dpo@restpoint.co.ke" style={{ color: C.gold }}>dpo@restpoint.co.ke</a><br/>
          Privacy Requests: <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>privacy@restpoint.co.ke</a><br/>
          Built with care by <strong>Welt Tallis Technologies</strong>
        </p>
      </div>
    </div>
  );
}