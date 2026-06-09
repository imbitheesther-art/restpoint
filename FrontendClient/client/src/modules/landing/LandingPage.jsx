import React, { useState, useEffect, useRef } from 'react';

// ─── Palette: Absolute Minimalist Jet Black & Vivid Green ──────────────────────
const C = {
  bg:       '#000000',
  bg2:      '#050505',
  bg3:      '#0a0a0a',
  border:   '#141414',
  border2:  '#222222',
  dim:      '#2e2e2e',
  muted:    '#666666',
  mid:      '#999999',
  light:    '#e1e1e1',
  white:    '#ffffff',
  green:    '#1db954',
  greenDim: '#0a3216',
  greenGlow:'rgba(29,185,84,0.06)',
  greenBorder:'rgba(29,185,84,0.18)',
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  tracking: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  embalming: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5">
      <path d="M20 12v4M4 12v4M12 4v4M12 16v4M8 8h8M8 16h8"/>
      <rect x="6" y="8" width="12" height="8" rx="1"/>
    </svg>
  ),
  certificates: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  chat: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  obituaries: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5">
      <path d="M4 4h16v16H4z"/>
      <line x1="8" y1="8" x2="16" y2="8"/>
      <line x1="8" y1="12" x2="12" y2="12"/>
    </svg>
  ),
  payments: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
      <circle cx="16" cy="14" r="1" fill={C.green}/>
    </svg>
  ),
  user: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth="1">
      <circle cx="12" cy="8" r="4"/>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    </svg>
  ),
};

const portalFeatures = [
  { icon: Icons.tracking, label: 'Real-time Tracking' },
  { icon: Icons.embalming, label: 'Embalming Progress' },
  { icon: Icons.certificates, label: 'Digital Certificates' },
  { icon: Icons.chat, label: 'Direct Chat' },
  { icon: Icons.obituaries, label: 'Obituaries' },
  { icon: Icons.payments, label: 'Online Payments' },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────
const useInView = (threshold = 0.05) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const Reveal = ({ children, delay = 0, style = {}, className = '' }) => {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      ...style,
    }}>{children}</div>
  );
};

const PulseDot = ({ size = 6 }) => (
  <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0 }}>
    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.green, opacity: 0.4, animation: 'pulseRing 2.5s cubic-bezier(0.16,1,0.3,1) infinite' }} />
    <span style={{ width: size * 0.6, height: size * 0.6, borderRadius: '50%', background: C.green, display: 'block' }} />
  </span>
);

const Counter = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (value === prev.current) return;
    const diff = value - prev.current; const steps = 12; let i = 0;
    const id = setInterval(() => {
      i++; setDisplay(Math.round(prev.current + (diff * i) / steps));
      if (i >= steps) { clearInterval(id); prev.current = value; }
    }, 30);
    return () => clearInterval(id);
  }, [value]);
  return <span>{typeof display === 'number' ? display.toLocaleString() : display}</span>;
};

// ─── Workflows Mock Dataset ───────────────────────────────────────────────────
const WORKFLOWS = [
  { key: 'admissions', label: 'Admissions', sublabel: 'Records · QR · IDs',
    detailTitle: 'Digital admission & QR tagging', unit: 'admissions this month',
    detailDesc: 'Every body is admitted digitally in under 90 seconds. A unique QR code is generated and printed at the point of admission.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    events: [{ text: 'New admission — Odhiambo, J.', ref: 'ADM-0341 · Ward B' }, { text: 'QR tag printed — Kamau, P.', ref: 'ADM-0338' }] },
  { key: 'billing', label: 'Billing', sublabel: 'KES · USD · EUR',
    detailTitle: 'Automated daily charge runs', unit: 'accounts billed today',
    detailDesc: 'Storage fees calculated from admission date at midnight — every night, without manual input. Multi-currency support.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    events: [{ text: 'Nightly billing run — 342 accounts', ref: 'RUN-20250531' }, { text: 'Rate updated — VIP suite', ref: 'CFG-007' }] },
  { key: 'invoices', label: 'Invoices', sublabel: 'M-PESA · Card',
    detailTitle: 'Itemised invoices in one click', unit: 'invoices this month',
    detailDesc: 'Professional invoices with per-day itemisation and embedded payment links. Families pay directly from SMS.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    events: [{ text: 'Invoice #INV-2025-0892 sent', ref: 'Mwangi family' }, { text: 'Invoice #INV-2025-0891 paid', ref: 'Otieno family' }] },
  { key: 'payments', label: 'Payments', sublabel: 'STK Push',
    detailTitle: 'Real-time M-PESA reconciliation', unit: 'KES collected today',
    detailDesc: 'STK push, card, and bank transfers reconciled automatically. Receipts sent by SMS instantly.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=800&q=80',
    events: [{ text: 'M-PESA received — KES 15,000', ref: 'MP25XQ' }, { text: 'Card payment cleared', ref: 'VISA · Oduya' }] },
];

const WorkflowDashboard = () => {
  const [active, setActive] = useState(0);
  const [counts, setCounts] = useState({ admissions: 1247, billing: 342, invoices: 892, payments: 156000 });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive(p => (p + 1) % WORKFLOWS.length);
      setCounts(p => ({
        admissions: p.admissions + Math.floor(Math.random() * 2),
        billing: p.billing + Math.floor(Math.random() * 1),
        invoices: p.invoices + Math.floor(Math.random() * 2),
        payments: p.payments + Math.floor(Math.random() * 3000)
      }));
      setTick(p => p + 1);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const wf = WORKFLOWS[active];
  const countMap = { admissions: counts.admissions, billing: counts.billing, invoices: counts.invoices, payments: counts.payments };
  const sans = { fontFamily: '"DM Sans", system-ui, sans-serif' };
  const serif = { fontFamily: '"DM Serif Display", Georgia, serif' };

  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <PulseDot size={6} />
          <span style={{ ...sans, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, color: C.green }}>Live System Engine</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            ['Admissions', counts.admissions],
            ['Billings', counts.billing],
            ['Invoices', counts.invoices],
            ['KES collected', `${Math.round(counts.payments / 1000)}k`]
          ].map(([label, val]) => (
            <div key={label} style={{ textAlign: 'right' }}>
              <div style={{ ...sans, fontSize: '0.95rem', fontWeight: 600, color: C.white, lineHeight: 1 }}>{typeof val === 'string' ? val : val.toLocaleString()}</div>
              <div style={{ ...sans, fontSize: '0.58rem', color: C.muted, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: `1px solid ${C.border}`, background: C.bg }}>
        {WORKFLOWS.map((w, i) => (
          <button key={w.key} onClick={() => setActive(i)} style={{
            background: active === i ? C.bg2 : 'transparent', border: 'none',
            borderRight: i < 3 ? `1px solid ${C.border}` : 'none',
            borderBottom: `2px solid ${active === i ? C.green : 'transparent'}`,
            padding: '1rem 0.75rem', cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{ ...sans, fontSize: '0.75rem', fontWeight: 600, color: active === i ? C.white : C.muted, marginBottom: '2px' }}>{w.label}</div>
            <div style={{ ...sans, fontSize: '0.58rem', color: active === i ? C.green : C.muted }}>{w.sublabel}</div>
          </button>
        ))}
      </div>

      <div className="dash-panel">
        <div style={{ padding: '2rem' }} className="dash-left">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: C.greenGlow, border: `1px solid ${C.greenBorder}`, borderRadius: '4px', padding: '3px 8px', marginBottom: '1.25rem' }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: C.green }} />
            <span style={{ ...sans, fontSize: '0.58rem', color: C.green, fontWeight: 600, textTransform: 'uppercase' }}>Pipeline Normal</span>
          </div>
          <h4 style={{ ...serif, fontSize: '1.25rem', fontWeight: 400, color: C.white, marginBottom: '0.75rem' }}>{wf.detailTitle}</h4>
          <p style={{ ...sans, fontSize: '0.82rem', color: C.mid, lineHeight: 1.6, marginBottom: '1.5rem' }}>{wf.detailDesc}</p>
          
          <div style={{ width: '100%', height: '160px', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem', border: `1px solid ${C.border}` }}>
            <img src={wf.image} alt={wf.detailTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 500, color: C.white }}><Counter value={countMap[wf.key]} /></span>
            <span style={{ ...sans, fontSize: '0.68rem', color: C.muted, textTransform: 'uppercase' }}>{wf.unit}</span>
          </div>

          <div style={{ height: '2px', background: C.border, borderRadius: '1px', overflow: 'hidden' }}>
            <div key={tick} style={{ height: '100%', background: C.green, animation: 'dashFill 5s linear forwards' }} />
          </div>
        </div>

        <div style={{ padding: '2rem', background: C.bg3 }}>
          <p style={{ ...sans, fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: '1rem', fontWeight: 600 }}>Recent Events</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {wf.events.map((ev, i) => (
              <div key={i} style={{ background: C.bg2, borderRadius: '4px', padding: '0.8rem 1rem', borderLeft: `1px solid ${C.green}` }}>
                <div style={{ ...sans, fontSize: '0.78rem', color: C.white, fontWeight: 500 }}>{ev.text}</div>
                <div style={{ ...sans, fontSize: '0.62rem', color: C.muted }}>{ev.ref}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Constants ────────────────────────────────────────────────────────────────
const features = [
  { num: '01', title: 'Deceased Records & QR', body: 'Digital admissions with instant QR tagging. Every admission tracked, every record accessible in seconds.', stat: '< 90s', statLabel: 'avg. admission' },
  { num: '02', title: 'Autopsy & Embalming', body: 'Structured post-mortem workflows with digital sign-off chains.', stat: '100%', statLabel: 'compliance' },
  { num: '03', title: 'Smart Fleet Dispatch', body: 'Real-time vehicle dispatching with automatic route optimization.', stat: '3×', statLabel: 'faster dispatch' },
  { num: '04', title: 'M-PESA Billing', body: 'Automated daily charges, multi-currency support, one-tap M-PESA collection.', stat: 'KES 0', statLabel: 'manual work' },
  { num: '05', title: 'Family Portal', body: 'Families receive SMS login to track status, view documents, and pay online.', stat: '24/7', statLabel: 'access' },
  { num: '06', title: 'Analytics & Compliance', body: 'Real-time occupancy, revenue, and burial permit tracking for Kenyan regulations.', stat: '1-click', statLabel: 'reports' },
];

const marketplaceItems = [
  { name: 'Premium Floral Wreath', price: 'KES 3,500', category: 'Wreaths', sales: 234, img: '/flower.jpg' },
  { name: 'Elegant Memorial Caskets', price: 'KES 25,000', category: 'Caskets', sales: 89, img: '/cross.jpg' },
  { name: 'Obituary Design', price: 'KES 500', category: 'Printing', sales: 567, img: '/rest1.png' },
  { name: 'Burial Flowers', price: 'KES 2,000', category: 'Flowers', sales: 432, img: '/flower.png' },
];

const faqs = [
  { q: 'Does Rest Point support offline syncing?', a: 'Yes. Our progressive web app caches all forms locally and syncs automatically when connection is restored.' },
  { q: 'How does multi-branch isolation work?', a: 'Each branch receives a dedicated tenant environment with complete database isolation and custom branding.' },
  { q: 'Is it compliant with Kenyan regulations?', a: 'Built for Kenya. We cover burial permit tracking, county health integrations, and Kenyan documentation formats.' },
  { q: 'How does the Family Portal work?', a: 'Families receive a secure SMS link — no app download. They see real-time status and can pay directly.' },
];

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) element.scrollIntoView({ behavior: 'smooth' });
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('10000');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

  const navigate = (path) => { window.location.href = path; };

  useEffect(() => {
    setTimeout(() => setHeroReady(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const formatCard = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExpiry = v => { const d = v.replace(/\D/g,'').slice(0,4); return d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) : d; };

  const handleMpesa = () => {
    if (!phone.match(/^(07|01)\d{8}$/)) { alert('Enter a valid Kenyan phone number'); return; }
    alert(`STK Push sent to ${phone} — KES ${Number(amount).toLocaleString()}`);
    setMpesaOpen(false);
  };
  
  const handleCard = () => {
    if (cardNum.replace(/\s/g,'').length < 16) { alert('Enter a valid card number'); return; }
    alert(`Payment of KES ${Number(amount).toLocaleString()} processed`);
    setCardOpen(false);
  };

  const sans = { fontFamily: '"DM Sans", system-ui, sans-serif' };
  const serif = { fontFamily: '"DM Serif Display", Georgia, serif' };

    return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; background: ${C.bg}; }
        body { overflow-x: hidden; background: ${C.bg}; color: ${C.light}; }
        ::selection { background: ${C.greenDim}; color: ${C.green}; }

        @keyframes pulseRing { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(2.4); opacity: 0; } }
        @keyframes dashFill { from { width: 0%; } to { width: 100%; } }

        .nav-link { font-family: 'DM Sans', sans-serif; font-size: 0.82rem; letter-spacing: 0.08em; text-transform: uppercase; color: ${C.light}; text-decoration: none; cursor: pointer; transition: color 0.18s ease, transform 0.18s ease; }
        .nav-link:hover { color: ${C.green}; }

        .btn { font-family: 'DM Sans', sans-serif; font-size: 0.85rem; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; padding: 0.95rem 1.75rem; border-radius: 999px; cursor: pointer; transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease; border: none; }
        .btn-green { background: linear-gradient(135deg, ${C.green} 0%, #3de07a 100%); color: #000; box-shadow: 0 18px 40px rgba(29,185,84,0.22); }
        .btn-green:hover { transform: translateY(-3px); }
        .btn-outline { background: rgba(255,255,255,0.04); color: ${C.light}; border: 1px solid rgba(255,255,255,0.15); }
        .btn-outline:hover { color: ${C.green}; border-color: ${C.green}; background: rgba(29,185,84,0.08); }

        .desk-nav { display: none; align-items: center; }
        .mob-only { display: flex; align-items: center; justify-content: center; }

        .mobile-menu { position: fixed; inset: 0; background: ${C.bg}; z-index: 400; display: flex; flex-direction: column; overflow-y: auto; animation: slideDown 0.2s ease; }
        .mob-nav-link { font-family: 'DM Sans', sans-serif; font-size: 1rem; color: ${C.light}; text-decoration: none; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: block; cursor: pointer; }
        .mob-nav-link:hover { color: ${C.green}; }

        .hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 3rem; align-items: center; }
        .hero-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 1rem; box-shadow: 0 40px 80px rgba(0,0,0,0.35); }
        .hero-tag { display: inline-flex; align-items: center; gap: 0.65rem; background: rgba(29,185,84,0.12); border: 1px solid rgba(29,185,84,0.18); border-radius: 999px; padding: 0.7rem 1rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.18em; color: ${C.green}; }
        .hero-row { display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; }
        .hero-stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1rem 1.25rem; min-width: 160px; }

        .section { padding: 6rem 0; }
        .section.light { background: ${C.bg2}; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
        .feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem; }
        .feature-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.22); transition: transform 0.25s ease, border-color 0.25s ease; }
        .feature-card:hover { transform: translateY(-8px); border-color: rgba(29,185,84,0.25); }
        .market-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.25rem; }
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
        .faq-item { border-bottom: 1px solid rgba(255,255,255,0.08); }
        .faq-q { width: 100%; background: none; border: none; color: ${C.light}; text-align: left; padding: 1.5rem 0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'DM Sans', sans-serif; font-size: 1rem; }
        .faq-q:hover { color: ${C.green}; }
        .bottom-cta { background: rgba(29,185,84,0.08); border: 1px solid rgba(29,185,84,0.12); border-radius: 24px; padding: 3rem 2rem; }

        @keyframes slideDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 1024px) { .hero-grid { grid-template-columns: 1fr; } .feature-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .market-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 768px) { .container { padding: 0 1.25rem; } .hero-tag { width: fit-content; } .hero-row { justify-content: center; } .feature-grid, .market-grid { grid-template-columns: 1fr; } .desk-nav { display: none; } .mob-only { display: flex; } }
        @media (min-width: 1025px) { .desk-nav { display: flex; } .mob-only { display: none; } }
      `}</style>

      <div style={{ background: C.bg, color: C.light, minHeight: '100vh' }}>
        {menuOpen && (
          <div className="mobile-menu">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
              <span style={{ fontWeight: 700, color: C.white, letterSpacing: '0.08em' }}>Rest Point</span>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', color: C.light, cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
            </div>
            {['features', 'marketplace', 'pricing', 'faq'].map(section => (
              <div key={section} onClick={() => { scrollToSection(section); setMenuOpen(false); }} className="mob-nav-link">{section.charAt(0).toUpperCase() + section.slice(1)}</div>
            ))}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ width: '100%' }}>Log in</button>
              <button onClick={() => navigate('/register')} className="btn btn-green" style={{ width: '100%' }}>Start free trial</button>
            </div>
          </div>
        )}

        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300, backgroundColor: scrolled ? 'rgba(0,0,0,0.92)' : 'transparent', borderBottom: scrolled ? `1px solid rgba(255,255,255,0.08)` : '1px solid transparent', padding: '1rem 0', transition: 'all 0.25s ease', backdropFilter: 'saturate(180%) blur(16px)' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: C.green, display: 'grid', placeItems: 'center', color: '#000', fontWeight: 800 }}>RP</div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.12em', color: C.white }}>REST POINT</div>
                <div style={{ fontSize: '0.72rem', color: C.muted, letterSpacing: '0.14em' }}>Mortuary Ops</div>
              </div>
            </div>

            <div className="desk-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div onClick={() => scrollToSection('features')} className="nav-link">Features</div>
              <div onClick={() => scrollToSection('marketplace')} className="nav-link">Marketplace</div>
              <div onClick={() => scrollToSection('pricing')} className="nav-link">Pricing</div>
              <div onClick={() => scrollToSection('faq')} className="nav-link">FAQ</div>
              <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ padding: '0.65rem 1.15rem' }}>Log in</button>
              <button onClick={() => navigate('/register')} className="btn btn-green" style={{ padding: '0.65rem 1.15rem' }}>Start</button>
            </div>

            <button className="mob-only" onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ width: '22px', height: '2px', background: C.light, borderRadius: '2px' }} />
              <span style={{ width: '22px', height: '2px', background: C.light, borderRadius: '2px' }} />
            </button>
          </div>
        </nav>

        <main style={{ paddingTop: '100px' }}>
          <section style={{ padding: '6rem 0 4rem' }}>
            <div className="container">
              <div className="hero-grid">
                <div>
                  <div className="hero-tag">Trusted by modern funeral homes</div>
                  <h1 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 'clamp(2.75rem, 5vw, 4.5rem)', lineHeight: 1.02, marginTop: '1.5rem', marginBottom: '1.5rem', color: C.white }}>Run mortal care with confidence, speed and transparency.</h1>
                  <p style={{ fontSize: '1.05rem', color: C.mid, maxWidth: '680px', lineHeight: 1.7, marginBottom: '2rem' }}>From admission to billing, documents, family updates and marketplace sales — Rest Point centralizes every workflow for funeral homes that need reliability and dignity at scale.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <button onClick={() => navigate('/register')} className="btn btn-green">Start free trial</button>
                    <button onClick={() => scrollToSection('features')} className="btn btn-outline">See features</button>
                  </div>

                  <div className="hero-row">
                    {['Live admissions', 'Uptime SLA', 'Realtime invoices'].map((label, index) => (
                      <div key={label} className="hero-stat">
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: C.white, marginBottom: '0.35rem' }}>{index === 0 ? '400+' : index === 1 ? '99.99%' : '2M+'}</div>
                        <div style={{ fontSize: '0.82rem', color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hero-card">
                  <img src="/landing.png" alt="Rest Point Dashboard" style={{ width: '100%', borderRadius: '20px', display: 'block' }} />
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="section light">
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <p style={{ fontSize: '0.78rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: C.green, marginBottom: '1rem' }}>What makes us different</p>
                <h2 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, color: C.white }}>A single platform for every mortuary workflow.</h2>
              </div>

              <div className="feature-grid">
                {features.slice(0, 6).map((feat, i) => (
                  <div key={feat.num} className="feature-card" style={{ animation: `pulseRing 0.8s ease ${i * 0.08}s both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <span style={{ color: C.green, fontWeight: 700 }}>{feat.num}</span>
                      <span style={{ color: C.white, fontWeight: 700 }}>{feat.stat}</span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.85rem', color: C.white }}>{feat.title}</h3>
                    <p style={{ fontSize: '0.95rem', color: C.mid, lineHeight: 1.8 }}>{feat.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.78rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: C.green, marginBottom: '1rem' }}>Family portal</p>
                  <h2 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 'clamp(2rem, 3.6vw, 2.8rem)', color: C.white, marginBottom: '1.25rem' }}>Families get access without friction.</h2>
                  <p style={{ fontSize: '1rem', color: C.mid, lineHeight: 1.8, marginBottom: '2rem' }}>Secure links, real-time documents, billing and communication that keep families informed and reduce support overhead.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                    {portalFeatures.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', display: 'grid', placeItems: 'center', borderRadius: '12px', background: 'rgba(29,185,84,0.12)' }}>{item.icon()}</div>
                        <span style={{ fontSize: '0.95rem', color: C.light }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hero-card">
                  <img src="/familyportal.png" alt="Family Portal" style={{ width: '100%', borderRadius: '20px', display: 'block' }} />
                </div>
              </div>
            </div>
          </section>

          <section id="marketplace" className="section light">
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <p style={{ color: C.green, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '1rem', fontSize: '0.78rem' }}>Marketplace</p>
                <h2 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: C.white }}>Sell grief care and products with one storefront.</h2>
              </div>
              <div className="market-grid">
                {marketplaceItems.map((item, i) => (
                  <div key={i} className="mkt-card" style={{ animation: `dashFill 0.55s ease ${i * 0.07}s both` }}>
                    <div style={{ width: '100%', height: '170px', overflow: 'hidden' }}>
                      <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ fontSize: '0.75rem', color: C.green, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{item.category}</div>
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: C.white }}>{item.name}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: C.muted, fontSize: '0.88rem' }}>
                        <span>{item.sales} sold</span>
                        <span style={{ color: C.green, fontWeight: 700 }}>{item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="pricing" className="section">
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <p style={{ color: C.green, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '1rem', fontSize: '0.78rem' }}>Pricing</p>
                <h2 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: C.white }}>Flexible plans for mortuaries of any size.</h2>
                <p style={{ color: C.mid, maxWidth: '680px', margin: '1rem auto 0', lineHeight: 1.8 }}>Pick a plan that suits your branch count, operations and invoicing needs. Upgrade anytime without hidden fees.</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button onClick={() => setBillingCycle('monthly')} className="btn" style={{ background: billingCycle === 'monthly' ? C.green : 'transparent', color: billingCycle === 'monthly' ? '#000' : C.light, border: '1px solid rgba(255,255,255,0.12)' }}>Monthly</button>
                <button onClick={() => setBillingCycle('yearly')} className="btn" style={{ background: billingCycle === 'yearly' ? C.green : 'transparent', color: billingCycle === 'yearly' ? '#000' : C.light, border: '1px solid rgba(255,255,255,0.12)' }}>Yearly (save 10%)</button>
              </div>

              <div className="pricing-grid">
                {(() => {
                  const base = { standard: 7500, enterprise: 18000 };
                  const discount = 0.1;
                  const plans = [
                    { key: 'standard', title: 'Standard', description: 'Single branch operations', price: billingCycle === 'monthly' ? base.standard : Math.round(base.standard * 12 * (1 - discount)), suffix: billingCycle === 'monthly' ? '/month' : '/year', popular: false },
                    { key: 'enterprise', title: 'Enterprise', description: 'Multi-branch with advanced workflows', price: billingCycle === 'monthly' ? base.enterprise : Math.round(base.enterprise * 12 * (1 - discount)), suffix: billingCycle === 'monthly' ? '/month' : '/year', popular: true }
                  ];
                  return plans.map((plan, idx) => (
                    <div key={plan.key} className="feature-card" style={{ padding: '2rem', position: 'relative', border: plan.popular ? `1px solid ${C.green}` : '1px solid rgba(255,255,255,0.08)', background: plan.popular ? 'rgba(29,185,84,0.08)' : 'rgba(255,255,255,0.02)' }}>
                      {plan.popular && <div style={{ position: 'absolute', top: '-0.75rem', right: '1rem', background: C.green, color: '#000', padding: '0.45rem 0.85rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>Popular</div>}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.green, marginBottom: '0.75rem' }}>{plan.title}</div>
                        <div style={{ fontSize: '3rem', fontWeight: 800, color: C.white, lineHeight: 1 }}>{plan.price.toLocaleString()}</div>
                        <div style={{ fontSize: '0.95rem', color: C.muted, marginTop: '0.35rem' }}>{plan.suffix}</div>
                      </div>
                      <p style={{ color: C.light, lineHeight: 1.8, marginBottom: '1.75rem' }}>{plan.description}</p>
                      <button onClick={() => navigate('/register')} className="btn btn-green" style={{ width: '100%' }}>{billingCycle === 'monthly' ? 'Start monthly' : 'Start yearly'}</button>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </section>

          <section id="faq" className="section light">
            <div className="container" style={{ maxWidth: '820px' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: C.white }}>Your questions, answered.</h2>
              </div>
              <div>
                {faqs.map((faq, idx) => (
                  <div key={idx} className="faq-item">
                    <button className="faq-q" onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}>
                      <span>{faq.q}</span>
                      <span style={{ color: C.green, fontSize: '1.2rem', transition: 'transform 0.2s ease', transform: activeFaq === idx ? 'rotate(45deg)' : 'none' }}>+</span>
                    </button>
                    {activeFaq === idx && <p style={{ fontSize: '0.95rem', color: C.mid, lineHeight: 1.8, paddingBottom: '1.5rem' }}>{faq.a}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section" style={{ padding: '4rem 0' }}>
            <div className="container" style={{ maxWidth: '860px', margin: '0 auto' }}>
              <div className="bottom-cta">
                <h2 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: C.white, marginBottom: '1rem' }}>Ready to bring structure and dignity to your operations?</h2>
                <p style={{ color: C.mid, lineHeight: 1.8, marginBottom: '2rem' }}>Launch your account, create your tenant, and start managing admissions, documents, invoices, and family communications from one secure hub.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={() => navigate('/register')} className="btn btn-green">Start free trial</button>
                  <button onClick={() => navigate('/login')} className="btn btn-outline">Book a demo</button>
                </div>
              </div>
            </div>
          </section>

          <footer style={{ background: C.bg3, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem 0' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: C.white, marginBottom: '0.5rem' }}>Rest Point</div>
                <div style={{ fontSize: '0.78rem', color: C.muted }}>Built for mortuaries in East Africa.</div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: C.muted, fontSize: '0.8rem' }}>
                <span>Support</span>
                <span>Terms</span>
                <span>Privacy</span>
              </div>
              <div style={{ color: C.muted, fontSize: '0.8rem' }}>© {new Date().getFullYear()} Rest Point</div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}

