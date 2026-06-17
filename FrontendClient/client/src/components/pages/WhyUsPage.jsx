import React from 'react';
import { useNavigate } from 'react-router-dom';

const C = { navy900: '#0A1F3D', gold: '#A67C52', emerald: '#059669', char700: '#374151', char600: '#4B5563', char500: '#6B7280', char200: '#E5E7EB', char100: '#F3F4F6', navy50: '#F9FAFB' };

export default function WhyUsPage() {
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.navy50, minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');`}</style>
      <nav style={{ padding: '1rem 2rem', borderBottom: `1px solid ${C.char200}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/')} style={{ background: C.navy900, color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Back</button>
        <span style={{ fontFamily: "'Lora', serif", fontWeight: 600, color: C.navy900, fontSize: '1.1rem' }}>Rest Point — Why Choose Us</span>
      </nav>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>Why Choose Rest Point?</h1>
        <p style={{ color: C.char500, fontSize: '1rem', textAlign: 'center', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem' }}>We're not just another software company. We're funeral professionals who understand your challenges and built the solution we wish we had.</p>

        <div style={{ display: 'grid', gap: '2rem', marginBottom: '3rem' }}>
          {[
            { title: 'Built by Funeral Professionals', desc: 'Our team has over 20 years of combined experience in the funeral industry. We understand the unique challenges you face daily—from managing multiple deceased records to coordinating with families during difficult times.' },
            { title: '100% Kenyan, for Kenya', desc: 'Designed specifically for the Kenyan funeral industry. We understand local requirements, M-PESA integration, SMS notifications, and compliance with Kenyan regulations. No generic foreign software that doesn\'t fit your workflow.' },
            { title: 'Zero Learning Curve', desc: 'If you can use a smartphone, you can use Rest Point. Our interface is intuitive and designed for real-world use. Your staff will be productive from day one—no 3-month training required.' },
            { title: '24/7 Local Support', desc: 'We\'re based in Kenya and available when you need us. Phone, WhatsApp, email—we respond within hours, not days. No overseas support centers with 48-hour response times.' },
            { title: 'Your Data Stays Yours', desc: 'We never sell, share, or use your data for anything other than running your system. Complete privacy with end-to-end encryption. You own your data—period.' },
            { title: 'One Platform, Everything Integrated', desc: 'No more 5 different systems that don\'t talk to each other. Rest Point handles case management, billing, documents, dispatch, family portal, and more—all in one seamless platform.' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: `1px solid ${C.char200}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.3rem', marginBottom: '0.75rem' }}>{item.title}</h3>
              <p style={{ color: C.char700, lineHeight: 1.7, fontSize: '0.95rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ background: `linear-gradient(135deg, ${C.navy900} 0%, ${C.navy800} 100%)`, padding: '3rem', borderRadius: '20px', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: '2rem', marginBottom: '1rem' }}>Ready to Transform Your Funeral Home?</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem' }}>Join 100+ funeral homes across Kenya already using Rest Point to streamline operations and serve families better.</p>
          <button onClick={() => navigate('/register')} style={{ background: C.gold, color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 4px 16px rgba(166,124,82,0.4)' }}>Start Free Trial</button>
        </div>
      </div>
    </div>
  );
}