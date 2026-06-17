import React from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  navy900: '#0A1F3D', gold: '#A67C52', emerald: '#059669',
  char700: '#374151', char600: '#4B5563', char500: '#6B7280',
  char200: '#E5E7EB', char100: '#F3F4F6', naval50: '#F9FAFB',
};

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.naval50, minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');`}</style>
      <nav style={{ padding: '1rem 2rem', borderBottom: `1px solid ${C.char200}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/')} style={{ background: C.navy900, color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Back</button>
        <span style={{ fontFamily: "'Lora', serif", fontWeight: 600, color: C.navy900, fontSize: '1.1rem' }}>Rest Point — Privacy Policy</span>
      </nav>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem', lineHeight: 1.8 }}>
        <h1 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '2rem', marginBottom: '0.5rem' }}>Privacy Policy</h1>
        <p style={{ color: C.char500, fontSize: '0.85rem', marginBottom: '2rem' }}>Last updated: June 2026</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>1. Our Role</h2>
        <p style={{ color: C.char700 }}>Rest Point is a software platform provided to funeral homes. We process personal data on behalf of our customers (the funeral homes), who are the Data Controllers. We do not use your data for our own purposes.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>2. What We Collect</h2>
        <p style={{ color: C.char700 }}><strong>Funeral Home Staff:</strong> Name, email, phone, username, password, billing info.</p>
        <p style={{ color: C.char700 }}><strong>Deceased & Families (on behalf of funeral homes):</strong> Name, date of birth/death, cause of death, religious beliefs, next of kin details.</p>
        <p style={{ color: C.char700 }}><strong>Technical:</strong> IP address, browser type, pages visited, cookies for analytics.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>3. How We Use Information</h2>
        <p style={{ color: C.char700 }}>To provide, maintain and improve the platform. To manage accounts and provide support. For security and fraud prevention. To comply with legal obligations.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>4. How We Share Information</h2>
        <p style={{ color: C.char700 }}>We share data with: service providers (hosting, payment processors, analytics), funeral homes (they control the data), legal authorities when required by law. In the event of a merger, acquisition, or asset sale, your data may be transferred.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>5. Data Security</h2>
        <p style={{ color: C.char700 }}>We implement technical, administrative and physical safeguards to protect data from unauthorized access, disclosure or loss. However, no method of transmission over the Internet is 100% secure.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>6. Data Retention & Backup</h2>
        <p style={{ color: C.char700 }}>We retain personal information as long as your account is active or as needed to provide services. We will retain and use this information as necessary to comply with legal obligations, resolve disputes, and enforce agreements. We provide clients with copies of their data via their Google Drive for independent backup.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>7. Your Rights</h2>
        <p style={{ color: C.char700 }}>You have the right to: access your data, correct inaccurate data, request deletion ("right to be forgotten"), receive your data in portable format, and object to or restrict processing. To exercise these rights, email us at <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>privacy@restpoint.co.ke</a>.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>8. International Transfers</h2>
        <p style={{ color: C.char700 }}>Your information may be transferred to servers outside Kenya. We ensure appropriate safeguards are in place as required by the Data Protection Act.</p>

        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginTop: '2rem' }}>9. Contact</h2>
        <p style={{ color: C.char700 }}>Email: <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>privacy@restpoint.co.ke</a></p>
      </div>
    </div>
  );
}