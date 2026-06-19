import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ============================================================
   REST POINT — Funeral home operating system
   Design direction: enterprise-grade, dignified, ledger-inspired.
   Palette: ink, bone, brass, verdigris. No gradients, no emoji,
   no card-bounce. Motion is a single orchestrated entrance.
   ============================================================ */

const C = {
  ink: '#15171A',
  bone: '#FAF8F4',
  bone2: '#F3EFE6',
  brass: '#8B7355',
  brassLight: '#A98F6E',
  verdigris: '#3D4F47',
  verdigrisDark: '#2E3F37',
  line: '#E3DDD0',
  lineDark: 'rgba(250,248,244,0.14)',
  gray: '#6B6862',
  grayLight: 'rgba(250,248,244,0.62)',
};

/* ---------- Reveal-on-scroll ---------- */
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShown(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, shown];
}

const Reveal = ({ children, delay = 0, style = {}, className = '' }) => {
  const [ref, shown] = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: shown ? 1 : 0,
      transform: shown ? 'translateY(0)' : 'translateY(18px)',
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      ...style
    }}>
      {children}
    </div>
  );
};

/* ---------- Mark ---------- */
const Mark = ({ size = 28, color = C.ink }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="1" />
    <path d="M16 8.5V23.5M9.5 16H22.5" stroke={color} strokeWidth="1" />
    <circle cx="16" cy="16" r="2.5" fill={color} />
  </svg>
);

/* ---------- FAQ ---------- */
const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: `1px solid ${C.line}`, padding: '1.6rem 0' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', background: 'none', border: 'none', padding: 0,
          textAlign: 'left', cursor: 'pointer', display: 'flex',
          justifyContent: 'space-between', alignItems: 'baseline', gap: '1.5rem'
        }}
      >
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.08rem', color: C.ink, fontWeight: 500 }}>{q}</span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', color: C.brass,
          flexShrink: 0, transition: 'transform 0.3s', transform: open ? 'rotate(45deg)' : 'rotate(0deg)'
        }}>+</span>
      </button>
      {open && (
        <p style={{ marginTop: '1rem', maxWidth: '600px', animation: 'fadeIn 0.4s ease' }}>{a}</p>
      )}
    </div>
  );
};

/* ---------- Showcase row ---------- */
const Showcase = ({ no, title, desc, reverse, children }) => (
  <Reveal
    className="showcase-row"
    style={{ gridTemplateColumns: reverse ? '1fr 0.92fr' : '0.92fr 1fr' }}
  >
    <div style={{ order: reverse ? 2 : 1 }}>
      <div className="label" style={{ marginBottom: '0.9rem' }}>No. {no}</div>
      <h3 style={{ marginBottom: '0.8rem' }}>{title}</h3>
      <p style={{ maxWidth: '420px' }}>{desc}</p>
    </div>
    <div style={{ order: reverse ? 1 : 2 }}>{children}</div>
  </Reveal>
);

/* ---------- Mock: Family portal ---------- */
const MockPortal = () => (
  <div className="mock-frame mock-frame--phone">
    <div className="mock-topline">
      <span className="label" style={{ color: C.brassLight }}>Mwangi family</span>
      <span className="label" style={{ color: 'rgba(250,248,244,0.45)' }}>Via SMS link</span>
    </div>
    <div className="mock-status">Arranged</div>
    <div className="mock-rows">
      <div className="mock-row">
        <span>Burial permit.pdf</span>
        <span className="mock-action">Download</span>
      </div>
      <div className="mock-row">
        <span>Service invoice</span>
        <span className="mock-action">KES 84,000</span>
      </div>
      <div className="mock-row">
        <span>Outstanding balance</span>
        <span className="mock-action mock-action--pay">Pay now</span>
      </div>
    </div>
  </div>
);

/* ---------- Mock: Dispatch & fuel ---------- */
const MockDispatch = () => {
  const [distance, setDistance] = useState(38);
  const [rate, setRate] = useState(195);
  const consumption = 0.12;
  const litres = distance * consumption;
  const cost = Math.round(litres * rate);
  return (
    <div className="mock-frame">
      <div className="mock-topline">
        <span className="label" style={{ color: C.brassLight }}>Route — Karen to Lang'ata</span>
        <span className="label" style={{ color: 'rgba(250,248,244,0.45)' }}>Hearse 02</span>
      </div>
      <div className="mock-calc-row">
        <label className="mock-calc-label" htmlFor="dist">Distance (km)</label>
        <input id="dist" type="range" min="2" max="120" step="1" value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="mock-range" />
        <span className="mock-calc-val">{distance}</span>
      </div>
      <div className="mock-calc-row">
        <label className="mock-calc-label" htmlFor="rate">Fuel rate (KES/L)</label>
        <input id="rate" type="range" min="150" max="250" step="1" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="mock-range" />
        <span className="mock-calc-val">{rate}</span>
      </div>
      <div className="mock-calc-result">
        <span className="label" style={{ color: 'rgba(250,248,244,0.5)' }}>Estimated trip cost</span>
        <span className="mock-result-num">KES {cost.toLocaleString()}</span>
      </div>
    </div>
  );
};

/* ---------- Mock: Documents ---------- */
const MockDocument = () => (
  <div className="mock-frame mock-frame--paper">
    <div className="mock-doc-head">
      <span className="label" style={{ color: C.brass }}>Burial permit</span>
      <span className="label" style={{ color: C.gray }}>Draft</span>
    </div>
    <div className="mock-doc-line"><span>Deceased</span><span>J. Otieno</span></div>
    <div className="mock-doc-line"><span>Date of service</span><span>14 Jul 2026</span></div>
    <div className="mock-doc-line"><span>Cemetery</span><span>Lang'ata Cemetery</span></div>
    <div className="mock-doc-line"><span>Authorised by</span><span>—</span></div>
    <div className="mock-doc-sign">Awaiting signature</div>
  </div>
);

/* ---------- Mock: Storefront ---------- */
const MockStorefront = () => (
  <div className="mock-frame">
    <div className="mock-topline">
      <span className="label" style={{ color: C.brassLight }}>Storefront</span>
      <span className="label" style={{ color: 'rgba(250,248,244,0.45)' }}>100% kept by your home</span>
    </div>
    <div className="mock-product"><span>Mahogany casket — classic</span><span>KES 65,000</span></div>
    <div className="mock-product"><span>Full service package</span><span>KES 140,000</span></div>
    <div className="mock-product"><span>Memorial keepsake set</span><span>KES 6,500</span></div>
  </div>
);

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [billingYearly, setBillingYearly] = useState(false);
  const navigate = useNavigate();
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 60); return () => clearTimeout(t); }, []);

  const goLogin = () => navigate('/login');
  const goStart = () => navigate('/register');
  const goAbout = () => navigate('/about');
  const goPortalLogin = () => navigate('/portal/login');
  const goPrivacy = () => navigate('/privacy');
  const goTerms = () => navigate('/terms');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: ${C.gray}; background: ${C.bone}; -webkit-font-smoothing: antialiased; }

        h1, h2, h3 { font-family: 'Fraunces', serif; font-weight: 500; letter-spacing: -0.01em; color: ${C.ink}; }
        h1 { font-size: clamp(2.6rem, 6.4vw, 4.4rem); line-height: 1.06; }
        h2 { font-size: clamp(1.9rem, 4.2vw, 2.6rem); line-height: 1.18; }
        h3 { font-size: 1.3rem; line-height: 1.3; }
        p { line-height: 1.7; font-size: 1rem; }

        a { color: inherit; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInSoft { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.74rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${C.brass};
        }

        .btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.85rem 1.7rem; font-size: 0.85rem; font-weight: 500;
          font-family: 'Inter', sans-serif;
          border: 1px solid transparent; border-radius: 2px;
          cursor: pointer; transition: all 0.25s ease; white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .btn-dark { background: ${C.ink}; color: ${C.bone}; }
        .btn-dark:hover { background: #000; }
        .btn-line { background: transparent; color: ${C.ink}; border-color: ${C.ink}; }
        .btn-line:hover { background: ${C.ink}; color: ${C.bone}; }
        .btn-on-dark { background: transparent; color: ${C.bone}; border-color: ${C.lineDark}; }
        .btn-on-dark:hover { background: rgba(250,248,244,0.08); border-color: rgba(250,248,244,0.4); }
        .btn-brass { background: ${C.brass}; color: ${C.bone}; }
        .btn-brass:hover { background: ${C.brassLight}; }

        .wrap { max-width: 1080px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2rem); }
        .section { padding: clamp(4.5rem, 9vw, 6.5rem) 0; }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(250,248,244,0.92); backdrop-filter: blur(10px);
          border-bottom: 1px solid ${C.line};
          padding: 1.15rem 0;
        }
        .nav-wrap { display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 0.65rem; font-family: 'Fraunces', serif; font-size: 1.15rem; font-weight: 500; color: ${C.ink}; cursor: pointer; }
        .nav-links { display: flex; gap: 2.4rem; }
        .nav-link { font-size: 0.84rem; color: ${C.gray}; text-decoration: none; cursor: pointer; transition: color 0.2s; }
        .nav-link:hover { color: ${C.ink}; }
        .nav-cta { display: flex; gap: 0.75rem; }
        @media (max-width: 760px) { .nav-links { display: none; } }

        .hero { padding-top: 152px; padding-bottom: clamp(3rem, 6vw, 4rem); position: relative; }
        .hero-rule { height: 1px; background: ${C.line}; margin-bottom: 2.4rem; }
        .hero-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 4rem; align-items: end; }
        @media (max-width: 860px) { .hero-grid { grid-template-columns: 1fr; gap: 2.2rem; } }
        .hero-desc { font-size: 1.08rem; max-width: 420px; margin-top: 1.6rem; color: ${C.gray}; }
        .hero-buttons { display: flex; gap: 0.9rem; margin-top: 2.4rem; flex-wrap: wrap; }

        .frame {
          aspect-ratio: 4/5; background: ${C.ink}; position: relative; overflow: hidden;
          border: 1px solid ${C.line};
        }
        .frame-grain { position: absolute; inset: 0; opacity: 0.5; background-image: radial-gradient(circle at 30% 20%, rgba(139,115,85,0.18), transparent 55%); }
        .frame-label { position: absolute; bottom: 1.4rem; left: 1.4rem; right: 1.4rem; display: flex; flex-direction: column; align-items: flex-start; gap: .6rem; }

        .mock-frame {
          background: ${C.ink}; border: 1px solid ${C.line}; padding: 1.6rem 1.7rem 1.8rem;
          max-width: 420px;
        }
        .mock-frame--phone { max-width: 300px; }
        .mock-topline { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.2rem; }
        .mock-status {
          display: inline-block; font-family: 'Fraunces', serif; font-size: 1.3rem; color: ${C.bone};
          margin-bottom: 1.2rem; font-weight: 500;
        }
        .mock-rows { border-top: 1px solid rgba(250,248,244,0.14); }
        .mock-row {
          display: flex; justify-content: space-between; align-items: center; gap: 1rem;
          padding: 0.85rem 0; border-bottom: 1px solid rgba(250,248,244,0.14);
          font-size: 0.84rem; color: ${C.grayLight};
        }
        .mock-action { font-family: 'JetBrains Mono', monospace; font-size: 0.76rem; color: ${C.brassLight}; }
        .mock-action--pay { color: ${C.bone}; background: ${C.brass}; padding: 0.3rem 0.7rem; }

        .mock-calc-row { display: grid; grid-template-columns: 110px 1fr 44px; align-items: center; gap: 0.9rem; margin-bottom: 1.1rem; }
        .mock-calc-label { font-size: 0.78rem; color: ${C.grayLight}; }
        .mock-calc-val { font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; color: ${C.bone}; text-align: right; }
        .mock-range {
          -webkit-appearance: none; width: 100%; height: 1px; background: rgba(250,248,244,0.25);
          outline: none; cursor: pointer;
        }
        .mock-range::-webkit-slider-thumb {
          -webkit-appearance: none; width: 13px; height: 13px; border-radius: 50%;
          background: ${C.brassLight}; cursor: pointer;
        }
        .mock-range::-moz-range-thumb { width: 13px; height: 13px; border-radius: 50%; background: ${C.brassLight}; border: none; cursor: pointer; }
        .mock-calc-result {
          display: flex; justify-content: space-between; align-items: baseline;
          border-top: 1px solid rgba(250,248,244,0.14); padding-top: 1.1rem; margin-top: 0.6rem;
        }
        .mock-result-num { font-family: 'Fraunces', serif; font-size: 1.5rem; color: ${C.bone}; font-weight: 500; }

        .mock-frame--paper { background: ${C.bone2}; border-color: ${C.line}; }
        .mock-doc-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.2rem; padding-bottom: 1rem; border-bottom: 1px solid ${C.line}; }
        .mock-doc-line { display: flex; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid ${C.line}; font-size: 0.85rem; color: ${C.ink}; }
        .mock-doc-line span:first-child { color: ${C.gray}; }
        .mock-doc-sign { margin-top: 1.2rem; font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; letter-spacing: 0.06em; text-transform: uppercase; color: ${C.brass}; }

        .mock-product { display: flex; justify-content: space-between; padding: 0.85rem 0; border-bottom: 1px solid rgba(250,248,244,0.14); font-size: 0.86rem; color: ${C.grayLight}; }
        .mock-product span:last-child { color: ${C.bone}; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }

        @media (max-width: 760px) { .mock-frame { max-width: 100%; } }

        .proof { border-top: 1px solid ${C.line}; border-bottom: 1px solid ${C.line}; padding: 2.6rem 0; }
        .proof-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 640px) { .proof-grid { grid-template-columns: 1fr; gap: 1.6rem; } }
        .proof-item { text-align: left; padding: 0 1.5rem; border-left: 1px solid ${C.line}; }
        .proof-item:first-child { border-left: none; padding-left: 0; }
        @media (max-width: 640px) { .proof-item { border-left: none; padding-left: 0; } }
        .proof-num { font-family: 'JetBrains Mono', monospace; font-size: 1.9rem; color: ${C.ink}; margin-bottom: 0.3rem; }
        .proof-cap { font-size: 0.85rem; color: ${C.gray}; }

        .section-head { max-width: 620px; margin-bottom: 1rem; }
        .section-head p { margin-top: 1rem; font-size: 1.05rem; }

        .dark-section { background: ${C.ink}; color: ${C.grayLight}; }
        .dark-section h2, .dark-section h3 { color: ${C.bone}; }
        .dark-section p { color: ${C.grayLight}; }

        .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid ${C.line}; margin-top: 2.6rem; }
        @media (max-width: 760px) { .pricing-grid { grid-template-columns: 1fr; } }
        .pricing-col { padding: 2.6rem; }
        .pricing-col + .pricing-col { border-left: 1px solid ${C.line}; }
        @media (max-width: 760px) { .pricing-col + .pricing-col { border-left: none; border-top: 1px solid ${C.line}; } }
        .pricing-col.featured { background: ${C.ink}; }
        .pricing-col.featured h3, .pricing-col.featured .price { color: ${C.bone}; }
        .pricing-col.featured .label { color: ${C.brassLight}; }
        .pricing-col.featured p, .pricing-col.featured li { color: ${C.grayLight}; }
        .price { font-family: 'Fraunces', serif; font-size: 2.4rem; font-weight: 500; color: ${C.ink}; margin: 0.7rem 0 0.2rem; }
        .price-period { font-size: 0.82rem; color: ${C.gray}; }
        .price-savings { font-size: 0.72rem; color: ${C.brass}; font-weight: 500; margin-top: -0.1rem; }
        .pricing-col.featured .price-savings { color: ${C.brassLight}; }
        .pricing-billing-toggle { display: flex; gap: 0.4rem; margin-top: 1.4rem; justify-content: center; }
        .pricing-billing-btn { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; letter-spacing: 0.08em; padding: 0.5rem 1rem; border: 1px solid ${C.line}; background: transparent; color: ${C.gray}; cursor: pointer; transition: all .2s; }
        .pricing-billing-btn.active { background: ${C.ink}; color: ${C.bone}; border-color: ${C.ink}; }
        .pricing-list { list-style: none; margin: 2rem 0; padding: 0; border-top: 1px solid ${C.line}; }
        .pricing-col.featured .pricing-list { border-top: 1px solid rgba(250,248,244,0.16); }
        .pricing-list li { padding: 0.85rem 0; border-bottom: 1px solid ${C.line}; font-size: 0.92rem; display: flex; gap: 0.7rem; }
        .pricing-col.featured .pricing-list li { border-bottom: 1px solid rgba(250,248,244,0.16); }
        .pricing-list li::before { content: '—'; color: ${C.brass}; flex-shrink: 0; }

        .showcase-row { display: grid; gap: 3.2rem; align-items: center; padding: 3rem 0; border-top: 1px solid ${C.line}; }
        @media (max-width: 760px) {
          .showcase-row { grid-template-columns: 1fr !important; gap: 1.6rem; }
          .showcase-row > div { order: 0 !important; }
        }

        .cta-section { background: ${C.verdigris}; color: ${C.bone}; text-align: left; padding: clamp(4rem, 9vw, 5.5rem) 0; }
        .cta-section h2 { color: ${C.bone}; max-width: 600px; }
        .cta-section p { color: rgba(250,248,244,0.78); max-width: 480px; margin-top: 1.2rem; font-size: 1.05rem; }
        .cta-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 2rem; flex-wrap: wrap; }
        .cta-buttons { display: flex; gap: 0.9rem; flex-wrap: wrap; }

        footer { background: ${C.ink}; color: ${C.grayLight}; padding: 3.5rem 0 2rem; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 3rem; padding-bottom: 2.6rem; border-bottom: 1px solid rgba(250,248,244,0.12); }
        @media (max-width: 700px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; } }
        .footer-col h4 { font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; letter-spacing: 0.1em; text-transform: uppercase; color: ${C.brassLight}; margin-bottom: 1.2rem; font-weight: 400; }
        .footer-link { display: block; font-size: 0.88rem; color: ${C.grayLight}; margin-bottom: 0.7rem; text-decoration: none; cursor: pointer; transition: color 0.2s; }
        .footer-link:hover { color: ${C.bone}; }
        .footer-bottom { display: flex; justify-content: space-between; font-size: 0.78rem; color: rgba(250,248,244,0.45); padding-top: 1.6rem; flex-wrap: wrap; gap: 0.8rem; }

        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>

      {/* Navigation */}
      <nav>
        <div className="wrap nav-wrap">
          <div className="logo"><Mark size={22} /><span>Rest Point</span></div>
          <div className="nav-links">
            <a href="#capabilities" className="nav-link">Capabilities</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#faq" className="nav-link">Questions</a>
          </div>
          <div className="nav-cta">
            <button className="btn btn-line" onClick={goLogin} style={{ padding: '0.65rem 1.3rem', fontSize: '0.8rem' }}>Log in</button>
            <button className="btn btn-dark" onClick={goStart} style={{ padding: '0.65rem 1.3rem', fontSize: '0.8rem' }}>Request access</button>
          </div>
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="wrap">
            <div style={{
              opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(14px)',
              transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)'
            }}>
              <div className="label" style={{ marginBottom: '1.4rem' }}>Funeral home operating system — est. partners across East Africa</div>
              <div className="hero-rule" />
            </div>
            <div className="hero-grid">
              <div style={{
                opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(18px)',
                transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 100ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 100ms'
              }}>
                <h1>A record worthy of the families you serve.</h1>
                <p className="hero-desc">
                  Rest Point is the system of record for funeral homes that take their reputation seriously — case management, family communication, dispatch, and billing, run with the same care you bring to every service.
                </p>
                <div className="hero-buttons">
                  <button className="btn btn-dark" onClick={goStart}>Request access</button>
                  <button className="btn btn-line" onClick={goLogin}>See how it works</button>
                </div>
              </div>
              <div style={{
                opacity: loaded ? 1 : 0, transform: loaded ? 'scale(1)' : 'scale(0.97)',
                transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1) 180ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) 180ms'
              }}>
                <div style={{
                  aspectRatio: '16/10', position: 'relative', overflow: 'hidden',
                  border: `1px solid ${C.line}`, background: C.ink,
                  borderRadius: '4px',
                }}>
                  <img src="/landing.png" alt="Rest Point Dashboard" style={{
                    width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(21,23,26,0.92) 45%)',
                    padding: '1.6rem', display: 'flex', flexDirection: 'column', gap: '.4rem',
                  }}>
                    <span className="label" style={{ color: C.brassLight, fontSize: '.72rem' }}>Case No. 0142 — Status: Arranged</span>
                    <span className="label" style={{ color: 'rgba(250,248,244,0.65)', fontSize: '.64rem' }}>Deceased: J. Otieno · Est. 1974 · Lang'ata Cemetery</span>
                    <span className="label" style={{ color: 'rgba(250,248,244,0.5)', fontSize: '.6rem' }}>Documentation: Complete · Balance: KES 0 · Family notified</span>
                    <span className="label" style={{ color: 'rgba(250,248,244,0.38)', fontSize: '.56rem' }}>Google Drive backup: Synced · Last updated 14 Jul 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Proof */}
        <section className="proof">
          <div className="wrap">
            <div className="proof-grid">
              <div className="proof-item">
                <div className="proof-num">100+</div>
                <div className="proof-cap">Funeral homes on Rest Point</div>
              </div>
              <div className="proof-item">
                <div className="proof-num">50,000+</div>
                <div className="proof-cap">Families served through the platform</div>
              </div>
              <div className="proof-item">
                <div className="proof-num">99.9%</div>
                <div className="proof-cap">Platform uptime, every month</div>
              </div>
            </div>
          </div>
        </section>

        {/* Seven entries — six + Google Drive backup */}
        <section id="capabilities" className="section">
          <div className="wrap">
            <Reveal>
              <div className="section-head">
                <div className="label" style={{ marginBottom: '0.9rem' }}>The register</div>
                <h2>Seven entries. One system of record.</h2>
                <p>Everything a funeral home runs on, kept in one place — built for how your team actually works.</p>
              </div>
            </Reveal>

            <div>
              {[
                [0,   "01", "Case management",    "Every service tracked from first call to final arrangements, with a clear record of who did what, and when."],
                [40,  "02", "Family portal",      "Families follow progress, review documents, and pay invoices through a private SMS link — no app, no account to remember."],
                [80,  "03", "Dispatch & fleet",   "GPS tracking and fuel estimation for every hearse movement, so the cost of a service is known before it's billed."],
                [120, "04", "Documents",          "Permits, certificates, and invoices generated from templates your home already trusts, ready to sign in minutes."],
                [220, "05", "Google Drive backup", "Every document, permit, invoice, and report is automatically stored as a secure copy in your own Google Drive. Your data stays yours — accessible even offline, on any device, independent of Rest Point."],
                [160, "06", "Team & roles",       "Directors, drivers, and embalmers work from a shared calendar with permissions matched to their responsibility."],
                [200, "07", "Storefront",         "Caskets, packages, and memorial keepsakes sold directly to families, with full revenue kept by your home."],
              ].map(([delay, no, title, desc], idx) => {
                const hasBg = idx % 2 === 0;
                return (
                  <Reveal key={no} delay={delay}>
                    <div style={{
                      padding: '2.4rem 1.6rem',
                      margin: hasBg ? '0 -1.6rem' : '0',
                      background: hasBg ? `linear-gradient(135deg, ${C.verdigris} 0%, ${C.verdigrisDark} 100%)` : 'transparent',
                      color: hasBg ? C.bone : 'inherit',
                      borderRadius: '4px',
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: '2rem' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: hasBg ? C.brassLight : C.brass, letterSpacing: '0.02em', paddingTop: '0.2rem' }}>
                          No. {no}
                        </div>
                        <div>
                          <h3 style={{ color: hasBg ? C.bone : C.ink, marginBottom: '0.6rem', fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: '1.3rem' }}>{title}</h3>
                          <p style={{ maxWidth: '560px', color: hasBg ? 'rgba(250,248,244,0.82)' : C.gray, lineHeight: 1.7, fontSize: '1rem' }}>{desc}</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Showcase — four capabilities in detail */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Reveal>
              <div className="section-head">
                <div className="label" style={{ marginBottom: '0.9rem' }}>A closer look</div>
                <h2>Four entries, opened up.</h2>
                <p>The parts families and finance teams actually touch — shown as they run, not described from a distance.</p>
              </div>
            </Reveal>

            <Showcase no="02" title="Family portal"
              desc="One private link, sent by SMS, gives a family everything they need: live status, downloadable documents, and a way to settle the balance. No app to install, no password to lose.">
              <MockPortal />
            </Showcase>

            <Showcase no="03" title="Dispatch & fuel" reverse
              desc="Every hearse movement is logged with distance and a fuel rate, so the estimated cost of a trip is known before the bill is written. Try the calculator — drag the distance or the fuel rate and watch the estimate update.">
              <MockDispatch />
            </Showcase>

            <Showcase no="04" title="Document editor"
              desc="Permits, certificates, and invoices are generated from templates already familiar to your team, with the fields that matter laid out clearly and ready for signature.">
              <MockDocument />
            </Showcase>

            <Showcase no="07" title="Storefront" reverse
              desc="List caskets, service packages, and memorial keepsakes for families to purchase directly. Every shilling of that revenue stays with your home — there is no commission on sales.">
              <MockStorefront />
            </Showcase>
          </div>
        </section>

        {/* Dark statement section */}
        <section className="section dark-section">
          <div className="wrap" style={{ maxWidth: '720px' }}>
            <Reveal>
              <div className="label" style={{ color: C.brassLight, marginBottom: '1.4rem' }}>Why it's built this way</div>
              <h2 style={{ fontStyle: 'italic', fontWeight: 500 }}>
                Families remember how they were treated long after they forget what was said. The systems behind that care should be just as deliberate.
              </h2>
              <p style={{ marginTop: '1.6rem', maxWidth: '560px' }}>
                Rest Point exists because the software available to funeral homes was built for everything except funeral homes. We built the register first, and the features around it.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="section">
          <div className="wrap">
            <Reveal>
              <div className="section-head">
                <div className="label" style={{ marginBottom: '0.9rem' }}>Account types</div>
                <h2>Two ways to hold an account.</h2>
                <p>One rate, billed monthly. No setup tricks, no commissions on family payments.</p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="pricing-billing-toggle">
                <button className={`pricing-billing-btn${!billingYearly ? ' active' : ''}`} onClick={() => setBillingYearly(false)}>Monthly</button>
                <button className={`pricing-billing-btn${billingYearly ? ' active' : ''}`} onClick={() => setBillingYearly(true)}>Yearly <span style={{ fontSize: '.6rem', color: C.brassLight, fontWeight: 600 }}>Save ~15%</span></button>
              </div>

              <div className="pricing-grid" style={{ marginTop: '1rem' }}>
                <div className="pricing-col">
                  <div className="label">Single branch</div>
                  <div className="price">{billingYearly ? 'KES 96,900' : 'KES 9,500'}</div>
                  <div className="price-period">{billingYearly ? 'per year' : 'per month'}</div>
                  {billingYearly && <div className="price-savings">Save KES 17,100</div>}
                  <ul className="pricing-list">
                    <li>One location</li>
                    <li>Family portal by SMS</li>
                    <li>Standard billing & invoicing</li>
                    <li>Email support</li>
                    <li>All core capabilities</li>
                  </ul>
                  <button className="btn btn-line" onClick={goStart} style={{ width: '100%', justifyContent: 'center' }}>Get started</button>
                </div>
                <div className="pricing-col featured">
                  <div className="label">Multi-branch</div>
                  <div className="price">{billingYearly ? 'KES 188,700' : 'KES 18,500'}</div>
                  <div className="price-period">{billingYearly ? 'per year' : 'per month'}</div>
                  {billingYearly && <div className="price-savings">Save KES 33,300</div>}
                  <ul className="pricing-list">
                    <li>Unlimited branches and records</li>
                    <li>Dispatch tracking & fuel estimation</li>
                    <li>Storefront marketplace</li>
                    <li>Priority support, 24 hours</li>
                    <li>A dedicated account manager</li>
                  </ul>
                  <button className="btn btn-brass" onClick={goStart} style={{ width: '100%', justifyContent: 'center' }}>Request access</button>
                </div>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <p style={{ marginTop: '1.6rem', fontSize: '0.88rem' }}>
                Setup and training: KES 10,000 per branch, one time. Thirty-day trial. No card required to start.
              </p>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section" style={{ paddingTop: 0 }}>
          <div className="wrap" style={{ maxWidth: '720px' }}>
            <Reveal>
              <div className="section-head">
                <div className="label" style={{ marginBottom: '0.9rem' }}>Questions</div>
                <h2>What homes ask before they switch.</h2>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div>
                <FAQItem q="How long does it take to get running?" a="Most homes are fully operating within two to three days. We handle onboarding and train your team directly, on your own cases." />
                <FAQItem q="Is our data secure?" a="Yes. Infrastructure is SOC 2 compliant, with encryption at rest and in transit, and access controlled by role." />
                <FAQItem q="Can we bring our existing records over?" a="Yes, at no extra cost. Migration is handled by our team with no downtime and no loss of historical records." />
                <FAQItem q="Do families need to install anything?" a="No. Families receive a private link by SMS and use it in any browser — nothing to download, no account to create." />
                <FAQItem q="What support is included?" a="Every account includes email support. Multi-branch accounts add 24-hour priority support and a named account manager." />
                <FAQItem q="Is my data backed up to Google Drive?" a="Yes. Every document, permit, invoice, and report is automatically synced to your organization's Google Drive. You own the data — it remains accessible even if you leave Rest Point." />
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="wrap">
            <Reveal>
              <div className="cta-row">
                <div>
                  <h2>Ready to put your home's record in order?</h2>
                  <p>Join the funeral homes across Kenya and East Africa already running on Rest Point.</p>
                </div>
                <div className="cta-buttons">
                  <button className="btn btn-brass" onClick={goStart}>Request access</button>
                  <button className="btn btn-on-dark" onClick={goLogin}>Schedule a demo</button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <Mark size={20} color={C.bone} />
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.1rem', color: C.bone }}>Rest Point</span>
              </div>
              <p style={{ maxWidth: '320px', fontSize: '0.88rem' }}>The operating system for funeral homes that take their reputation seriously. Built by Welt Tallis Technologies.</p>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <a href="#capabilities" className="footer-link">Capabilities</a>
              <a href="#pricing" className="footer-link">Pricing</a>
              <a href="#faq" className="footer-link">Questions</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a className="footer-link" onClick={goAbout}>About</a>
              <a className="footer-link" href="mailto:info@restpoint.co.ke">Contact</a>
              <a className="footer-link" onClick={goPrivacy}>Privacy policy</a>
              <a className="footer-link" onClick={goTerms}>Terms</a>
              <a className="footer-link" href="/account-deletion">Account deletion</a>
            </div>
          </div>
          <div className="footer-bottom">
            <div>© 2026 Rest Point. All rights reserved.</div>
            <div>Built for African funeral professionals</div>
          </div>
        </div>
      </footer>
    </>
  );
}