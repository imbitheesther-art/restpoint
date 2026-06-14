import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/*
  REST POINT
  ──────────────────────────────────────
  Premium Funeral Home Management Platform
  Built by Welt Tallis Technologies
  
  Design: Enterprise SaaS + Compassionate Family Experience
  Palette:
    Navy depth     #0A1F3D  (trust, stability, buttons)
    Charcoal       #1F2937  (text, authority)
    Cloud white    #F9FAFB  (clean, modern)
    Warm gold      #A67C52  (dignity, warmth, accents)
    Sage accent    #6B7280  (secondary, calm)
    Emerald        #059669  (trust, life)
  Typography:
    Lora           — refined serif for headlines
    Inter          — clean sans for body & UI
  Signature: Memorial Board as luminous beacon connecting families globally
*/

const C = {
  navy900: '#0A1F3D',
  navy800: '#0F2847',
  navy700: '#1a3a52',
  navy50:  '#F9FAFB',
  char900: '#111827',
  char700: '#374151',
  char600: '#4B5563',
  char500: '#6B7280',
  char300: '#D1D5DB',
  char200: '#E5E7EB',
  char100: '#F3F4F6',
  gold:    '#A67C52',
  goldL:   '#C9A876',
  goldD:   '#8B6340',
  emerald: '#059669',
  emeraldL:'#10B981',
  rose:    '#DC2626',
  amber:   '#F59E0B',
};

const Icons = {
  arrow:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  check:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  lock:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  shield:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  users:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  zap:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  file:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="13" x2="8" y2="13"/><line x1="12" y1="17" x2="8" y2="17"/></svg>,
  globe:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  heart:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  menu:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  flame:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>,
  star:    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

function Candle({ name, message, lit, onLight, delay = 0 }) {
  return (
    <div
      onClick={onLight}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        cursor: lit ? 'default' : 'pointer', gap: '.6rem',
        animation: `fadeInUp 0.6s ease ${delay}ms both`,
      }}
    >
      <div style={{ position: 'relative', height: '56px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        {lit ? (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)',
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)',
              animation: 'glow 2.2s ease-in-out infinite',
            }} />
            <div style={{
              width: '12px', height: '30px',
              background: `radial-gradient(ellipse at 50% 80%, #F59E0B 0%, #FBBF24 40%, #F97316 100%)`,
              borderRadius: '50% 50% 30% 30%',
              animation: 'flame 1.8s ease-in-out infinite',
              filter: 'blur(0.5px)',
              boxShadow: `0 0 14px #F59E0B, 0 0 28px rgba(245,158,11,0.35)`,
            }} />
            <div style={{
              position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)',
              width: '5px', height: '12px',
              background: `radial-gradient(ellipse, #FEF3C7 0%, #FBBF24 60%, transparent 100%)`,
              borderRadius: '50%',
              animation: 'flicker 1.3s ease-in-out infinite reverse',
            }} />
          </div>
        ) : (
          <div style={{
            width: '18px', height: '18px', borderRadius: '50%',
            border: `2px dashed ${C.char200}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.char300, fontSize: '.7rem',
          }}>+</div>
        )}
      </div>
      <div style={{
        width: '16px', height: '56px', borderRadius: '3px 3px 2px 2px',
        background: lit
          ? `linear-gradient(180deg, #FEF3C7 0%, #FCD34D 30%, #F59E0B 70%, #B45309 100%)`
          : `linear-gradient(180deg, ${C.char200} 0%, ${C.char300} 100%)`,
        position: 'relative', boxShadow: lit ? `0 0 24px rgba(245,158,11,0.3)` : 'none',
        transition: 'all 0.6s ease',
      }}>
        <div style={{
          position: 'absolute', top: '-7px', left: '50%', transform: 'translateX(-50%)',
          width: '2.5px', height: '7px',
          background: lit ? '#78350F' : C.char300,
          borderRadius: '1px',
        }} />
      </div>
      <div style={{
        fontFamily: "'Lora', serif",
        fontSize: '.75rem', color: lit ? C.gold : C.char300,
        textAlign: 'center', maxWidth: '80px', lineHeight: 1.3,
        transition: 'color 0.4s ease',
        fontStyle: 'italic', fontWeight: 500,
      }}>{name}</div>
      {lit && message && (
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '.62rem', color: C.char500,
          textAlign: 'center', maxWidth: '88px', lineHeight: 1.4,
          animation: 'fadeInUp 0.5s ease',
        }}>"{message}"</div>
      )}
    </div>
  );
}

const FEATURES = [
  { icon: Icons.zap, title: 'Case Management', desc: 'Track every service from first call to final arrangements. Real-time updates, timeline tracking, and complete case history.' },
  { icon: Icons.heart, title: 'Family Portal', desc: 'Secure access for families to documents, updates, approvals, and communication—all via SMS link, no app needed.' },
  { icon: Icons.file, title: 'Document Editor', desc: 'Create, edit, and manage forms with integrated canvas-based tools. Templates for permits, certificates, and custom documents.' },
  { icon: Icons.globe, title: 'Marketplace', desc: 'Integrated platform for flowers, keepsakes, catering, and partner services. New revenue streams for your funeral home.' },
  { icon: Icons.users, title: 'Team Collaboration', desc: 'Coordinate staff, directors, and administrators in real time with role-based access and activity audit trails.' },
  { icon: Icons.zap, title: 'Reporting & Analytics', desc: 'Monitor operations, revenue, and performance from one dashboard. Real-time insights into business metrics.' },
];

const TESTIMONIALS = [
  { author: 'Sarah Chen', role: 'Director, Eternal Rest Funeral Home', text: 'Welt Tallis cut our administrative time by 60%. Families are more satisfied, and our team is less stressed. This is exactly what we needed.', stat: '60% time savings' },
  { author: 'James Okonkwo', role: 'Manager, Heritage Services', text: 'The Family Portal has been transformative. Families feel more informed and in control. We\'ve seen a significant increase in 5-star reviews.', stat: '45% more 5-star reviews' },
  { author: 'Maria Santos', role: 'Owner, Compassionate Care Mortuary', text: 'The marketplace integration has opened new revenue opportunities. We\'re now earning additional income while serving families better.', stat: '+$8K/month revenue' },
];

const TRUST = [
  { icon: Icons.lock, title: 'Bank-Level Security', desc: 'Enterprise-grade encryption, role-based access, and secure cloud infrastructure.' },
  { icon: Icons.shield, title: '99.9% Uptime', desc: 'Redundant systems, daily backups, and disaster recovery. Your families depend on us.' },
  { icon: Icons.file, title: 'Compliance Ready', desc: 'Built for HIPAA, GDPR, and local regulations. Audit trails for every action.' },
  { icon: Icons.globe, title: 'Global Reach', desc: 'Support families worldwide. Families anywhere can light candles and stay connected.' },
];

const INITIAL_CANDLES = [
  { name: 'Michael R.', message: 'Forever in our hearts', lit: true },
  { name: 'Elena S.', message: 'Rest peacefully', lit: true },
  { name: 'Light one', message: '', lit: false },
  { name: 'James P.', message: 'Your legacy lives on', lit: true },
  { name: 'Light one', message: '', lit: false },
  { name: 'Grace T.', message: 'In loving memory', lit: true },
  { name: 'Light one', message: '', lit: false },
  { name: 'David W.', message: 'Always remembered', lit: true },
];

export default function App() {
  const navigate = useNavigate();
  const [candles, setCandles] = useState(INITIAL_CANDLES);
  const [candleName, setCandleName] = useState('');
  const [litCount, setLitCount] = useState(INITIAL_CANDLES.filter(c => c.lit).length);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const lightCandle = (idx) => {
    if (candles[idx].lit) return;
    const name = candleName.trim() || 'Anonymous';
    setCandles(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], name, message: 'In our hearts', lit: true };
      return next;
    });
    setLitCount(c => c + 1);
    setCandleName('');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; background: ${C.navy50}; }
        body { font-family: 'Inter', sans-serif; color: ${C.char700}; background: ${C.navy50}; -webkit-font-smoothing: antialiased; }
        ::selection { background: rgba(166, 124, 82, 0.15); color: ${C.gold}; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${C.navy50}; }
        ::-webkit-scrollbar-thumb { background: ${C.char300}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.gold}; }
        .wrap { max-width: 1200px; margin: 0 auto; padding: 0 clamp(1rem, 5vw, 2.5rem); }
        .section { padding: clamp(4rem, 10vw, 7rem) 0; }
        h1, h2, h3 { font-family: 'Lora', serif; font-weight: 500; line-height: 1.2; }
        h1 { font-size: clamp(2.5rem, 8vw, 4.5rem); }
        h2 { font-size: clamp(1.8rem, 6vw, 3.2rem); }
        h3 { font-size: clamp(1.2rem, 3vw, 1.8rem); }
        .eyebrow { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: ${C.gold}; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .eyebrow::before { content: ''; width: 16px; height: 1px; background: currentColor; }
        .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1.75rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border: none; border-radius: 8px; cursor: pointer; transition: all 0.22s; white-space: nowrap; font-family: 'Inter', sans-serif; }
        .btn-primary { background: ${C.navy900}; color: white; box-shadow: 0 4px 16px -4px rgba(10, 31, 61, 0.4); }
        .btn-primary:hover { background: ${C.navy800}; transform: translateY(-2px); box-shadow: 0 8px 24px -4px rgba(10, 31, 61, 0.6); }
        .btn-secondary { background: transparent; color: ${C.navy900}; border: 1.5px solid ${C.navy900}; }
        .btn-secondary:hover { background: rgba(10, 31, 61, 0.05); }
        .btn-text { background: none; color: ${C.navy900}; padding: 0.5rem 0; }
        .btn-text:hover { opacity: 0.8; }
        .divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, ${C.char200} 20%, ${C.char200} 80%, transparent); }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border-bottom: 1px solid ${C.char200}; padding: 1.2rem 0; }
        .nav-wrap { display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; font-weight: 700; color: ${C.navy900}; font-family: 'Lora', serif; }
        .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: ${C.emerald}; }
        .nav-links { display: flex; gap: 2.5rem; }
        @media (max-width: 768px) { .nav-links { display: none; } }
        .nav-link { font-size: 0.75rem; font-weight: 600; color: ${C.char600}; text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: ${C.gold}; }
        .nav-cta { display: flex; gap: 1rem; }
        @media (max-width: 768px) { .nav-cta { display: flex; gap: 0.5rem; } }
        .hamburger { display: none; background: none; border: none; cursor: pointer; color: ${C.navy900}; padding: 0.5rem; font-size: 1.5rem; }
        @media (max-width: 768px) { .hamburger { display: block; } }
        .hero { padding: clamp(6rem, 12vw, 8rem) 0 clamp(3rem, 6vw, 4rem); background: linear-gradient(135deg, ${C.navy50} 0%, rgba(5, 150, 105, 0.03) 100%); position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; inset: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="%23f3f4f6" width="80" height="80"/><circle cx="40" cy="40" r="2" fill="%23e5e7eb"/></svg>'); opacity: 0.5; pointer-events: none; }
        .hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; position: relative; z-index: 1; }
        @media (max-width: 768px) { .hero-inner { grid-template-columns: 1fr; gap: 2rem; } }
        .hero-text h1 { color: ${C.navy900}; margin-bottom: 1.5rem; }
        .hero-text p { font-size: 1rem; color: ${C.char700}; line-height: 1.7; margin-bottom: 1.5rem; }
        .hero-cta { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
        @media (max-width: 640px) { .hero-cta { flex-wrap: nowrap; gap: 0.75rem; } .hero-cta .btn { flex: 1; padding: 0.7rem 1rem; font-size: 0.65rem; } }
        .hero-trust { display: flex; gap: 1.5rem; font-size: 0.85rem; color: ${C.char600}; flex-wrap: wrap; }
        .hero-trust-item { display: flex; align-items: center; gap: 0.5rem; }
        .trust-icon { color: ${C.emerald}; flex-shrink: 0; }
        .hero-image { position: relative; }
        .dashboard-shell { background: white; border: 1px solid ${C.char200}; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.08); }
        .chrome { display: flex; gap: 0.5rem; align-items: center; padding: 0.75rem 1rem; background: ${C.char100}; border-bottom: 1px solid ${C.char200}; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .d-red { background: #FF5F57; } .d-yellow { background: #FEBC2E; } .d-green { background: #28C840; }
        .url { flex: 1; background: white; border-radius: 4px; padding: 0.4rem 0.7rem; font-size: 0.65rem; color: ${C.char500}; font-family: monospace; }
        .dash-img { width: 100%; height: auto; display: block; background: linear-gradient(135deg, ${C.char100}, ${C.navy50}); min-height: 300px; }
        .trust-section { background: white; padding: clamp(4rem, 8vw, 6rem) 0; border-top: 1px solid ${C.char200}; border-bottom: 1px solid ${C.char200}; }
        .trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; }
        @media (max-width: 1024px) { .trust-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .trust-grid { grid-template-columns: 1fr; } }
        .trust-card { padding: 2rem; text-align: center; }
        .trust-icon-lg { font-size: 2.5rem; margin-bottom: 1rem; color: ${C.gold}; }
        .trust-card h3 { font-size: 1.1rem; margin-bottom: 0.75rem; color: ${C.navy900}; }
        .trust-card p { font-size: 0.9rem; color: ${C.char600}; line-height: 1.6; }
        .features-section { background: ${C.navy50}; }
        .features-header { text-align: center; margin-bottom: 4rem; }
        .features-header h2 { color: ${C.navy900}; margin-bottom: 1rem; }
        .features-header p { font-size: 1rem; color: ${C.char700}; max-width: 600px; margin: 0 auto; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        @media (max-width: 1024px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .features-grid { grid-template-columns: 1fr; } }
        .feature-card { background: white; padding: 2rem; border-radius: 12px; border: 1px solid ${C.char200}; transition: all 0.3s; }
        .feature-card:hover { border-color: ${C.gold}; transform: translateY(-4px); box-shadow: 0 12px 36px -8px rgba(166, 124, 82, 0.2); }
        .feature-icon { font-size: 2.2rem; margin-bottom: 1rem; color: ${C.gold}; }
        .feature-card h3 { margin-bottom: 0.75rem; color: ${C.navy900}; }
        .feature-card p { font-size: 0.9rem; color: ${C.char600}; line-height: 1.6; }
        .family-section { background: linear-gradient(135deg, rgba(5, 150, 105, 0.05) 0%, rgba(166, 124, 82, 0.03) 100%); }
        .family-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        @media (max-width: 768px) { .family-inner { grid-template-columns: 1fr; gap: 2rem; } }
        .family-text h2 { color: ${C.navy900}; margin-bottom: 1.5rem; }
        .family-text p { font-size: 1rem; color: ${C.char700}; line-height: 1.7; margin-bottom: 1.5rem; }
        .family-benefits { display: flex; flex-direction: column; gap: 1rem; }
        .benefit-item { display: flex; gap: 1rem; }
        .benefit-item span { color: ${C.emerald}; font-weight: 600; font-size: 1.2rem; flex-shrink: 0; }
        .family-image { position: relative; background: white; border-radius: 12px; padding: 2rem; border: 1px solid ${C.char200}; }
        .family-image p { text-align: center; color: ${C.char500}; font-style: italic; }
        .marketplace-section { background: white; position: relative; overflow: hidden; }
        .marketplace-section::before { content: ''; position: absolute; top: -40%; right: -20%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(5, 150, 105, 0.1) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }
        .marketplace-inner { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        @media (max-width: 768px) { .marketplace-inner { grid-template-columns: 1fr; } }
        .marketplace-text h2 { color: ${C.navy900}; margin-bottom: 1.5rem; }
        .marketplace-text p { font-size: 1rem; color: ${C.char700}; line-height: 1.7; margin-bottom: 1.5rem; }
        .marketplace-cta { display: flex; gap: 1rem; flex-wrap: wrap; }
        .marketplace-image { background: linear-gradient(135deg, ${C.char100}, ${C.navy50}); border-radius: 12px; border: 1px solid ${C.char200}; min-height: 300px; display: flex; align-items: center; justify-content: center; color: ${C.char500}; }
        .memorial-section { background: linear-gradient(180deg, ${C.navy900} 0%, ${C.navy800} 50%, ${C.navy900} 100%); color: white; position: relative; overflow: hidden; }
        .memorial-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 60%, rgba(5, 150, 105, 0.08) 0%, transparent 60%); pointer-events: none; }
        .memorial-inner { position: relative; z-index: 1; text-align: center; }
        .memorial-header { margin-bottom: 1.5rem; }
        .memorial-header h2 { color: white; }
        .memorial-quote { font-family: 'Lora', serif; font-size: 1.2rem; font-style: italic; color: rgba(255, 255, 255, 0.9); max-width: 600px; margin: 0 auto 2.5rem; line-height: 1.8; }
        .candle-input-row { display: flex; gap: 0.75rem; justify-content: center; margin-bottom: 2rem; flex-wrap: wrap; }
        .candle-input { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 0.75rem 1rem; color: white; font-family: 'Inter', sans-serif; font-size: 0.9rem; outline: none; transition: border-color 0.2s; min-width: 250px; }
        .candle-input::placeholder { color: rgba(255, 255, 255, 0.5); }
        .candle-input:focus { border-color: ${C.gold}; }
        .candle-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 1.5rem 1rem; justify-items: center; margin: 2rem 0; }
        @media (max-width: 1024px) { .candle-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 640px) { .candle-grid { grid-template-columns: repeat(3, 1fr); } }
        .candle-counter { display: flex; align-items: center; gap: 1rem; justify-content: center; margin: 2rem 0; font-size: 0.85rem; color: rgba(255, 255, 255, 0.7); }
        .candle-counter span { color: ${C.gold}; font-weight: 700; font-size: 1.2rem; }
        .memorial-cta { background: rgba(166, 124, 82, 0.15); border: 1px solid rgba(166, 124, 82, 0.3); border-radius: 12px; padding: 2rem; margin-top: 2rem; }
        .memorial-cta h3 { color: white; margin-bottom: 1rem; }
        .memorial-cta p { color: rgba(255, 255, 255, 0.8); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; }
        .testimonials-section { background: ${C.navy50}; }
        .testimonials-header { text-align: center; margin-bottom: 3rem; }
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        @media (max-width: 1024px) { .testimonials-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .testimonials-grid { grid-template-columns: 1fr; } }
        .testimonial-card { background: white; padding: 2rem; border-radius: 12px; border: 1px solid ${C.char200}; }
        .testimonial-stat { font-size: 1.4rem; font-weight: 700; color: ${C.gold}; margin-bottom: 1rem; }
        .testimonial-text { font-size: 0.95rem; color: ${C.char700}; line-height: 1.7; margin-bottom: 1.5rem; font-style: italic; }
        .testimonial-author { font-weight: 600; color: ${C.navy900}; font-size: 0.9rem; }
        .testimonial-role { font-size: 0.8rem; color: ${C.char600}; }
        .security-section { background: white; position: relative; overflow: hidden; }
        .security-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        @media (max-width: 768px) { .security-inner { grid-template-columns: 1fr; } }
        .security-text h2 { color: ${C.navy900}; margin-bottom: 1.5rem; }
        .security-items { display: flex; flex-direction: column; gap: 1.5rem; }
        .security-item { display: flex; gap: 1rem; }
        .security-item-icon { color: ${C.emerald}; font-size: 1.4rem; flex-shrink: 0; }
        .security-item h4 { color: ${C.navy900}; margin-bottom: 0.25rem; font-size: 0.95rem; }
        .security-item p { font-size: 0.85rem; color: ${C.char600}; }
        .security-image { background: linear-gradient(135deg, ${C.char100}, ${C.navy50}); border-radius: 12px; border: 1px solid ${C.char200}; min-height: 300px; display: flex; align-items: center; justify-content: center; color: ${C.char500}; }
        .pricing-section { background: linear-gradient(135deg, rgba(5, 150, 105, 0.05) 0%, rgba(166, 124, 82, 0.03) 100%); }
        .pricing-header { text-align: center; margin-bottom: 3rem; }
        .pricing-header h2 { color: ${C.navy900}; }
        .pricing-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; max-width: 900px; margin: 0 auto; }
        @media (max-width: 768px) { .pricing-grid { grid-template-columns: 1fr; } }
        .pricing-card { background: white; padding: 2.5rem; border-radius: 12px; border: 1px solid ${C.char200}; position: relative; }
        .pricing-card.featured { border-color: ${C.gold}; box-shadow: 0 20px 40px -10px rgba(166, 124, 82, 0.2); }
        .pricing-badge { position: absolute; top: -12px; left: 2rem; background: ${C.gold}; color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; }
        .pricing-label { font-size: 0.8rem; color: ${C.gold}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
        .pricing-amount { font-size: 2.5rem; font-weight: 700; color: ${C.navy900}; margin-bottom: 0.25rem; }
        .pricing-period { font-size: 0.85rem; color: ${C.char600}; margin-bottom: 1.5rem; }
        .pricing-divider { height: 1px; background: ${C.char200}; margin: 1.5rem 0; }
        .pricing-item { display: flex; gap: 0.75rem; font-size: 0.9rem; color: ${C.char700}; margin-bottom: 0.75rem; }
        .pricing-item-icon { color: ${C.emerald}; flex-shrink: 0; margin-top: 2px; }
        .pricing-cta { width: 100%; margin-top: 2rem; }
        .cta-final { background: linear-gradient(135deg, ${C.navy900} 0%, ${C.navy800} 100%); color: white; text-align: center; position: relative; overflow: hidden; }
        .cta-final::before { content: ''; position: absolute; inset: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="%230F2847" width="80" height="80"/><circle cx="40" cy="40" r="1.5" fill="%231A3A52"/></svg>'); opacity: 0.3; pointer-events: none; }
        .cta-final-inner { position: relative; z-index: 1; max-width: 700px; margin: 0 auto; }
        .cta-final h2 { color: white; margin-bottom: 1rem; }
        .cta-final p { font-size: 1rem; color: rgba(255, 255, 255, 0.9); margin-bottom: 2rem; line-height: 1.7; }
        .cta-final-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        footer { background: ${C.navy900}; color: white; border-top: 1px solid ${C.navy800}; padding: 4rem 0 2rem; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; margin-bottom: 3rem; }
        @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; } }
        .footer-col h4 { font-family: 'Lora', serif; margin-bottom: 1.5rem; }
        .footer-col p { font-size: 0.9rem; line-height: 1.6; opacity: 0.8; margin-bottom: 1rem; }
        .footer-link { display: block; font-size: 0.85rem; color: rgba(255, 255, 255, 0.7); margin-bottom: 0.75rem; transition: color 0.2s; text-decoration: none; }
        .footer-link:hover { color: ${C.gold}; }
        .footer-divider { height: 1px; background: ${C.navy800}; margin: 2rem 0; }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: rgba(255, 255, 255, 0.6); flex-wrap: wrap; gap: 1rem; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes flame { 0%, 100% { transform: scaleX(1) scaleY(1) rotate(-1deg); } 25% { transform: scaleX(1.04) scaleY(0.97) rotate(1deg); } 50% { transform: scaleX(0.97) scaleY(1.04) rotate(-0.5deg); } 75% { transform: scaleX(1.03) scaleY(0.98) rotate(0.8deg); } }
        @keyframes flicker { 0%, 100% { opacity: 1; transform: scale(1); } 30% { opacity: 0.85; transform: scale(0.96); } 60% { opacity: 0.95; transform: scale(1.03); } 80% { opacity: 0.8; transform: scale(0.97); } }
        @keyframes glow { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
        @media (max-width: 480px) {
          h1 { font-size: 1.8rem; } h2 { font-size: 1.4rem; } h3 { font-size: 1.1rem; }
          .btn { padding: 0.65rem 1.1rem; font-size: 0.65rem; }
          .candle-input { min-width: 160px; font-size: 0.85rem; }
          .hero-cta .btn { flex: 1; padding: 0.65rem 0.75rem; }
          .hero-trust { flex-direction: column; gap: 0.6rem; font-size: 0.8rem; }
          .candle-grid { gap: 1rem 0.75rem; }
          .cta-final-buttons { flex-direction: column; gap: 0.75rem; }
          .cta-final-buttons .btn { width: 100%; }
        }
      `}</style>

      <nav>
        <div className="wrap nav-wrap">
          <div className="logo">
            <span className="logo-dot" />
            <span>Rest Point</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Platform</a>
            <a href="#family" className="nav-link">Family Portal</a>
            <a href="#marketplace" className="nav-link">Marketplace</a>
            <a href="#security" className="nav-link">Security</a>
            <a href="#pricing" className="nav-link">Pricing</a>
          </div>
          <div className="nav-cta">
            <button className="btn btn-text" onClick={() => navigate('/login')}>Log In</button>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>Start Free Trial {Icons.arrow}</button>
          </div>
          <button className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{Icons.menu}</button>
        </div>
      </nav>

      <main style={{ paddingTop: '60px' }}>
        <section className="hero">
          <div className="wrap">
            <div className="hero-inner">
              <div className="hero-text">
                <div className="eyebrow">{Icons.star} Modern Funeral Home Management</div>
                <h1>One platform. Complete peace of mind.</h1>
                <p>Manage funeral operations, serve families through a dedicated portal, create documents with integrated tools, and grow revenue through our marketplace—all in one secure place.</p>
                <div className="hero-cta">
                  <button className="btn btn-primary" onClick={() => navigate('/register')}>Start Free Trial {Icons.arrow}</button>
                  <button className="btn btn-secondary" onClick={() => navigate('/register')}>Watch Tour {Icons.arrow}</button>
                </div>
                <div className="hero-trust">
                  <div className="hero-trust-item"><span className="trust-icon">{Icons.check}</span>30-day free trial</div>
                  <div className="hero-trust-item"><span className="trust-icon">{Icons.check}</span>No credit card needed</div>
                  <div className="hero-trust-item"><span className="trust-icon">{Icons.check}</span>Full onboarding support</div>
                </div>
              </div>
              <div className="hero-image">
                <div className="dashboard-shell">
                  <div className="chrome">
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <div className="dot d-red" /><div className="dot d-yellow" /><div className="dot d-green" />
                    </div>
                    <div className="url">tallis.app/dashboard</div>
                  </div>
                  <div className="dash-img" style={{ minHeight: 'auto' }}>
                    <img src="/dashboard-preview.png" alt="Dashboard Preview" style={{ width: '100%', height: 'auto', display: 'block' }}
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div style=\"padding: 3rem; text-align: center;\">📊 Dashboard Preview</div>'; }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-section">
          <div className="wrap">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ color: C.navy900, marginBottom: '0.5rem' }}>Built for Funeral Professionals</h2>
              <p style={{ color: C.char600, fontSize: '1rem' }}>Enterprise-grade reliability meets compassionate family service.</p>
            </div>
            <div className="trust-grid">
              {TRUST.map((item, idx) => (
                <div key={idx} className="trust-card">
                  <div className="trust-icon-lg">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" style={{ margin: '0' }} />

        <section id="features" className="section features-section">
          <div className="wrap">
            <div className="features-header">
              <div className="eyebrow">{Icons.zap} Core Platform</div>
              <h2>Everything Your Funeral Home Needs</h2>
              <p>Six integrated modules designed around the real workflows of modern funeral homes. No context-switching, no data silos.</p>
            </div>
            <div className="features-grid">
              {FEATURES.map((f, idx) => (
                <div key={idx} className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div className="logo-dot" />
                <h4 style={{ margin: 0 }}>Rest Point</h4>
              </div>
              <p>Enterprise funeral home management platform built for compassion, compliance, and growth. Built by Welt Tallis Technologies.</p>
            </div>
          </div>
          <div className="footer-divider" />
          <div className="footer-bottom">
            <div>© 2024 Rest Point by Welt Tallis Technologies. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </>
  );
}