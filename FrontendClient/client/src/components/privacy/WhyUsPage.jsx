import React from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  navy900: '#0A1F3D', gold: '#A67C52', emerald: '#059669',
  char700: '#374151', char600: '#4B5563', char500: '#6B7280',
  char200: '#E5E7EB', char100: '#F3F4F6', naval50: '#F9FAFB',
};

const Svg = ({ d, sw = 2, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const Icons = {
  clock: <Svg d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />,
  heart: <Svg d={<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>} />,
  dollar: <Svg d={<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>} />,
  shield: <Svg d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>} />,
  globe: <Svg d={<><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>} />,
  award: <Svg d={<><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>} />,
  sms: <Svg d={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>} />,
  truck: <Svg d={<><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>} />,
  lock: <Svg d={<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>} />,
  check: <Svg d={<><polyline points="20 6 9 17 4 12"/></>} size={18} sw={2.5} />,
};

const REASONS = [
  { icon: Icons.clock, title: 'Save 60% Admin Time', desc: 'Automate scheduling, billing, and docs. Your team focuses on families, not paperwork.' },
  { icon: Icons.heart, title: 'Family Portal — No App', desc: 'Families get a secure link via SMS. Track progress, view documents, pay M-PESA. No download.' },
  { icon: Icons.dollar, title: 'New Revenue for Your Home', desc: 'Help families memorialize digitally — light candles, leave memories. You earn, they heal.' },
  { icon: Icons.shield, title: 'Enterprise Security', desc: 'Bank-level encryption, role-based access, full audit trails. Data you can trust.' },
  { icon: Icons.globe, title: 'Digital Memorial Candles', desc: 'Light a candle. Leave a memory. Dedicated to dignity — every life leaves a mark.' },
  { icon: Icons.award, title: 'Built for African Mortuaries', desc: 'M-PESA, local SMS, multi-tenant. Designed for Kenya, Uganda, Tanzania.' },
  { icon: Icons.sms, title: 'SMS Link — Not SMS Spam', desc: 'Families get one secure link. No app. No spam. Just connection when it matters.' },
  { icon: Icons.truck, title: 'GPS Hearse Tracking', desc: 'Real-time location with fuel consumption tracking. Families get arrival alerts. Cut 70% of "where is the hearse?" calls.' },
  { icon: Icons.lock, title: 'Data You Control', desc: 'Postmortem, autopsy, medical records — encrypted and masked. Only your staff sees.' },
];

export default function WhyUsPage() {
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.naval50, minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');`}</style>
      <nav style={{ padding: '1rem 2rem', borderBottom: `1px solid ${C.char200}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/')} style={{ background: C.navy900, color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Back</button>
        <span style={{ fontFamily: "'Lora', serif", fontWeight: 600, color: C.navy900, fontSize: '1.1rem' }}>Rest Point — Why Choose Us</span>
      </nav>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '2.5rem', marginBottom: '1rem' }}>9 Reasons Funeral Homes Love Us</h1>
          <p style={{ color: C.char600, fontSize: '1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>Join 100+ funeral homes across East Africa already transforming their operations with Rest Point.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr)', gap: '1.5rem' }}>
          {REASONS.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: `1px solid ${C.char200}`, transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(166,124,82,0.2)'; e.currentTarget.style.borderColor = C.gold; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.char200; }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(166,124,82,0.1)', color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.icon}</div>
              <div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', fontWeight: 600, color: C.navy900, marginBottom: '0.5rem' }}>{r.title}</h3>
                <p style={{ fontSize: '0.9rem', color: C.char600, lineHeight: 1.6 }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button onClick={() => navigate('/register')} style={{ padding: '1rem 2.5rem', background: C.gold, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px -4px rgba(166,124,82,0.4)' }}>
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}