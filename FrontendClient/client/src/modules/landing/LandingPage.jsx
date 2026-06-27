import { useState, useEffect, useRef } from 'react';
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

/* ---------- Footer social icons ---------- */
const IconX = (p) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M18.146 3h3.04l-6.64 7.59L22.5 21h-6.118l-4.79-6.27L5.99 21H2.948l7.103-8.12L1.5 3h6.273l4.33 5.73L18.146 3Zm-1.067 16.2h1.685L7.01 4.71H5.2l11.879 14.49Z" fill="currentColor"/>
  </svg>
);
const IconLinkedIn = (p) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.55 4.78 5.87V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.97V21h-4V9Z" fill="currentColor"/>
  </svg>
);
const IconWhatsApp = (p) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.47 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" fill="currentColor"/>
  </svg>
);

const SocialLink = ({ href, label, children }) => (
  <a
    href={href}
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
    className="social-link"
  >
    {children}
  </a>
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
    style={{ display: 'grid', gridTemplateColumns: reverse ? '1fr 0.92fr' : '0.92fr 1fr', gap: '3.2rem', alignItems: 'center' }}
  >
    <div style={{ order: reverse ? 2 : 1 }}>
      <div className="label" style={{ marginBottom: '0.9rem' }}>No. {no}</div>
      <h3 style={{ marginBottom: '0.8rem', fontSize: '1.5rem' }}>{title}</h3>
      <p style={{ maxWidth: '420px' }}>{desc}</p>
    </div>
    <div style={{ order: reverse ? 1 : 2 }}>{children}</div>
  </Reveal>
);

/* ---------- Mock Components ---------- */
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

const MockMemorialBoard = () => {
  const [candles, setCandles] = useState(12);
  const [message, setMessage] = useState('');
  const [lighted, setLighted] = useState(false);

  const handleLightCandle = () => {
    if (!lighted && message.trim()) {
      setCandles(candles + 1);
      setLighted(true);
    }
  };

  return (
    <div className="mock-frame">
      <div className="mock-topline">
        <span className="label" style={{ color: C.brassLight }}>Digital memorial</span>
        <span className="label" style={{ color: 'rgba(250,248,244,0.45)' }}>In memory</span>
      </div>
      <div className="mock-status" style={{ fontSize: '1rem', marginBottom: '0.8rem' }}>
        {candles} candles lit
      </div>
      <div className="mock-candles">
        {[...Array(Math.min(candles, 8))].map((_, i) => (
          <span key={i} className="candle-icon" style={{ fontSize: '1.4rem', marginRight: '0.4rem' }}>A</span>
        ))}
        {candles > 8 && <span style={{ color: C.brassLight, fontSize: '0.8rem' }}>+{candles - 8} more</span>}
      </div>
      <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(250,248,244,0.14)', paddingTop: '1rem' }}>
        <textarea
          placeholder="Write a message of condolence..."
          value={message}
          onChange={(e) => { setMessage(e.target.value); setLighted(false); }}
          style={{
            width: '100%', background: 'transparent', border: 'none', color: C.bone,
            fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', resize: 'none',
            outline: 'none', minHeight: '3rem'
          }}
        />
        <button
          onClick={handleLightCandle}
          disabled={!message.trim() || lighted}
          style={{
            marginTop: '0.6rem', padding: '0.5rem 1.2rem', background: lighted ? C.brass : 'transparent',
            color: C.bone, border: `1px solid ${C.brass}`, cursor: lighted ? 'default' : 'pointer',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', letterSpacing: '0.06em'
          }}
        >
          {lighted ? 'Candle lit' : 'Light a candle'}
        </button>
      </div>
    </div>
  );
};

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

const MockStorefront = () => (
  <div className="mock-frame">
    <div className="mock-topline">
      <span className="label" style={{ color: C.brassLight }}>Storefront</span>
      <span className="label" style={{ color: 'rgba(250,248,244,0.45)' }}>100% kept by your home</span>
    </div>
    <div className="mock-product"><span>Mahogany casket — classic</span><span>KES 65,000</span></div>
    <div className="mock-product"><span>Full service package</span><span>KES 140,000</span></div>
    <div className="mock-product"><span>Memorial keepsake set</span><span>KES 6,500</span></div>
    <div className="mock-product"><span>Obituary notice — premium</span><span>KES 3,500</span></div>
  </div>
);

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [billingYearly, setBillingYearly] = useState(false);
  const navigate = useNavigate();
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 60); return () => clearTimeout(t); }, []);

  const goLogin = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); };
  const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
  const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

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
        .nav-link { font-size: 0.84rem; color: ${C.gray}; text-decoration: none; cursor: pointer; transition: color 0.2s; background: transparent; border: none; }
        .nav-link:hover { color: ${C.ink}; }
        .nav-cta { display: flex; gap: 0.75rem; }
        @media (max-width: 760px) { .nav-links { display: none; } }

        .hero { padding-top: 152px; padding-bottom: clamp(3rem, 6vw, 4rem); position: relative; }
        .hero-rule { height: 1px; background: ${C.line}; margin-bottom: 2.4rem; }
        .hero-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 4rem; align-items: end; }
        @media (max-width: 860px) { .hero-grid { grid-template-columns: 1fr; gap: 2.2rem; } }
        .hero-desc { font-size: 1.08rem; max-width: 420px; margin-top: 1.6rem; color: ${C.gray}; }
        .hero-buttons { display: flex; gap: 0.9rem; margin-top: 2.4rem; flex-wrap: wrap; }

        .mock-frame {
          background: ${C.ink}; border: 1px solid ${C.line}; padding: 1.6rem 1.7rem 1.8rem;
          max-width: 420px; text-align: left;
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
        .mock-range { -webkit-appearance: none; width: 100%; height: 1px; background: rgba(250,248,244,0.25); outline: none; }
        .mock-calc-result {
          display: flex; justify-content: space-between; align-items: baseline;
          border-top: 1px solid rgba(250,248,244,0.14); padding-top: 1.1rem; margin-top: 0.6rem;
        }
        .mock-result-num { font-family: 'Fraunces', serif; font-size: 1.5rem; color: ${C.bone}; font-weight: 500; }

        .mock-frame--paper { background: ${C.bone2}; border-color: ${C.line}; }
        .mock-doc-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.2rem; padding-bottom: 1rem; border-bottom: 1px solid ${C.line}; }
        .mock-doc-line { display: flex; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid ${C.line}; font-size: 0.85rem; color: ${C.ink}; }
        .mock-doc-sign { margin-top: 1.2rem; font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; text-transform: uppercase; color: ${C.brass}; }

        .mock-product { display: flex; justify-content: space-between; padding: 0.85rem 0; border-bottom: 1px solid rgba(250,248,244,0.14); font-size: 0.86rem; color: ${C.grayLight}; }
        .mock-product span:last-child { color: ${C.bone}; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }

        .proof { border-top: 1px solid ${C.line}; border-bottom: 1px solid ${C.line}; padding: 2.6rem 0; }
        .proof-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 640px) { .proof-grid { grid-template-columns: 1fr; gap: 1.6rem; } }
        .proof-item { text-align: left; padding: 0 1.5rem; border-left: 1px solid ${C.line}; }
        .proof-item:first-child { border-left: none; padding-left: 0; }
        .proof-num { font-family: 'JetBrains Mono', monospace; font-size: 1.9rem; color: ${C.ink}; margin-bottom: 0.3rem; }
        .proof-cap { font-size: 0.85rem; color: ${C.gray}; }

        .showcase-section { padding: 4.5rem 0; }
        footer { background: ${C.ink}; color: ${C.grayLight}; padding: 4.2rem 0 1.5rem; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 3rem; padding-bottom: 3rem; }
        @media (max-width: 760px) { .footer-grid { grid-template-columns: 1fr; gap: 2rem; } }
        .footer-bottom { display: flex; justify-content: space-between; border-top: 1px solid ${C.lineDark}; padding-top: 1.5rem; font-size: 0.8rem; }
      `}</style>

      {/* Navigation */}
      <nav>
        <div className="wrap nav-wrap">
          <div className="logo"><Mark size={22} /><span>Rest Point</span></div>
          <div className="nav-links">
            <a href="#features" className="nav-link">System Features</a>
            <button className="nav-link" onClick={goTerms}>Terms</button>
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
            <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(14px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}>
              <div className="label" style={{ marginBottom: '1.4rem' }}>Funeral home operating system — trusted by homes across East Africa</div>
              <div className="hero-rule" />
            </div>
            <div className="hero-grid">
              <div>
                <h1>A record worthy of the families you serve.</h1>
                <p className="hero-desc">
                  Rest Point is the system of record for funeral homes that take their reputation seriously — case management, family communication, dispatch, and billing, run with the same care you bring to every service.
                </p>
                <div className="hero-buttons">
                  <button className="btn btn-dark" onClick={goStart}>Request access</button>
                  <button className="btn btn-line" onClick={goLogin}>See how it works</button>
                </div>
              </div>
              <div>
                <div style={{ aspectRatio: '16/10', position: 'relative', overflow: 'hidden', border: `1px solid ${C.line}`, background: C.ink, borderRadius: '4px' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.6rem', display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                    <span className="label" style={{ color: C.brassLight, fontSize: '.72rem' }}>Case No. 0142 — Status: Arranged</span>
                    <span className="label" style={{ color: 'rgba(250,248,244,0.65)', fontSize: '.64rem' }}>Deceased: J. Otieno · Est. 1974 · Lang'ata Cemetery</span>
                    <span className="label" style={{ color: 'rgba(250,248,244,0.5)', fontSize: '.6rem' }}>Documentation: Complete · Balance: KES 0 · Family notified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF SECTION */}
        <section className="proof">
          <div className="wrap">
            <div className="proof-grid">
              <div className="proof-item">
                <div className="proof-num">100+</div>
                <div className="proof-cap">Funeral homes on Rest Point</div>
              </div>
              <div className="proof-item">
                <div className="proof-num">50,000+</div>
                <div className="proof-cap">Ledger records maintained</div>
              </div>
              <div className="proof-item">
                <div className="proof-num">99.9%</div>
                <div className="proof-cap">System uptime achieved</div>
              </div>
            </div>
          </div>
        </section>

        {/* SHOWCASE SECTION */}
        <section id="features" className="showcase-section">
          <div className="wrap">
            <Showcase no="01" title="Family Portal Access" desc="Give families a transparent look into details, balances, and documents from an isolated interface." reverse={false}>
              <MockPortal />
            </Showcase>
            <Showcase no="02" title="Digital Memorial Board" desc="Allow extended loved ones to leave thoughts and virtually log remembrances gracefully." reverse={true}>
              <MockMemorialBoard />
            </Showcase>
            <Showcase no="03" title="Intelligent Vehicle Dispatch" desc="Plan trips from locations accurately using built-in logistics tracking variables." reverse={false}>
              <MockDispatch />
            </Showcase>
            <Showcase no="04" title="Document Compilation" desc="Track burial permits, coroner declarations, and missing dynamic details instantly." reverse={true}>
              <MockDocument />
            </Showcase>
            <Showcase no="05" title="Enterprise Storefront" desc="Seamlessly manage caskets, transport options, and premium packages out of the box." reverse={false}>
              <MockStorefront />
            </Showcase>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.2rem', color: C.bone, marginBottom: '1rem' }}>Rest Point</div>
              <p style={{ fontSize: '0.85rem', maxWidth: '300px' }}>Dignified infrastructure for modern funeral home management across East Africa.</p>
            </div>
            <div>
              <div className="label" style={{ color: C.brassLight, marginBottom: '1rem' }}>Product</div>
              <a href="#features" className="nav-link" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Features</a>
            </div>
            <div>
              <div className="label" style={{ color: C.brassLight, marginBottom: '1rem' }}>Legal</div>
              <button onClick={goTerms} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '0.85rem' }}>Terms of Service</button>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} Rest Point. All rights reserved.</span>
            <span>Nairobi, Kenya</span>
          </div>
        </div>
      </footer>
    </>
  );
}