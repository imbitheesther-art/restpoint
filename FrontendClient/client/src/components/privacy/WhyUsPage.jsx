import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ============================================================
   REST POINT — Why Choose Us
   Styled to match LandingPage: ink / bone / brass / verdigris
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

const Svg = ({ d, sw = 2, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const Icons = {
  clock: <Svg d={<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>} />,
  heart: <Svg d={<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />} />,
  dollar: <Svg d={<><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>} />,
  shield: <Svg d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />} />,
  globe: <Svg d={<><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>} />,
  award: <Svg d={<><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>} />,
  sms: <Svg d={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />,
  truck: <Svg d={<><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>} />,
  lock: <Svg d={<><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>} />,
  check: <Svg d={<><polyline points="20 6 9 17 4 12" /></>} size={18} sw={2.5} />,
};

const REASONS = [
  { icon: Icons.clock, title: 'Save 60% Time', desc: 'Automate scheduling, billing, and docs. Your team focuses on families, not paperwork.' },
  { icon: Icons.heart, title: 'Family Portal', desc: 'Families get a secure link. Track progress, view documents, No download   Dedicated to dignity.' },
  { icon: Icons.dollar, title: 'Memorial  Portal', desc: 'Help families memorialize digitally light candles, leave memories. Thats how  they heal.' },
  { icon: Icons.shield, title: 'Enterprise Security', desc: 'Bank-level encryption, role-based access, full audit trails. Data you can trust.' },
  { icon: Icons.globe, title: 'Digital Memorial Candles', desc: 'Light a candle. Leave a memory. Dedicated to dignity .' },
  { icon: Icons.award, title: 'Built for African Mortuaries', desc: 'M-PESA, local SMS, multi-tenant. Designed for Kenya, Uganda, Tanzania.' },
  { icon: Icons.sms, title: 'SMS Link — Not SMS Spam', desc: 'Families get one secure link. No app. No spam. Just connection when it matters.' },
  { icon: Icons.lock, title: 'Data You Control', desc: 'Postmortem, autopsy, medical records  encrypted and important   fields   masked. Only your staff sees.' },
];

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

export default function WhyUsPage() {
  const navigate = useNavigate();
  const goHome = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); };
  const goRegister = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: ${C.gray}; background: ${C.bone}; -webkit-font-smoothing: antialiased; }

        h1, h2, h3 { font-family: 'Fraunces', serif; font-weight: 500; letter-spacing: -0.01em; color: ${C.ink}; }
        h1 { font-size: clamp(2rem, 4.4vw, 2.8rem); line-height: 1.12; }
        h2 { font-size: 1.15rem; line-height: 1.3; }
        p { line-height: 1.7; font-size: 0.95rem; }
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

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(250,248,244,0.92); backdrop-filter: blur(10px);
          border-bottom: 1px solid ${C.line};
          padding: 1.15rem 0;
        }
        .nav-wrap { display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 0.65rem; font-family: 'Fraunces', serif; font-size: 1.15rem; font-weight: 500; color: ${C.ink}; cursor: pointer; }

        .content-block { padding-top: 92px; }

        .reason-card {
          display: flex; gap: 1rem;
          padding: 1.5rem;
          border: 1px solid ${C.line};
          transition: all 0.3s ease;
          cursor: default;
        }
        .reason-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -8px rgba(139,115,85,0.15);
          border-color: ${C.brass};
        }

        .icon-box {
          width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: ${C.brass};
          border: 1px solid ${C.line};
        }

        .hr { height: 1px; background: ${C.line}; margin: 1.5rem 0; }

        footer { 
          margin-top: 4rem; 
          padding-top: 1.5rem; 
          border-top: 1px solid ${C.line};
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.8rem;
          color: ${C.gray};
        }
        footer a { color: ${C.gray}; text-decoration: none; }
        footer a:hover { color: ${C.ink}; }
      `}</style>

      {/* Navigation */}
      <nav>
        <div className="wrap nav-wrap">
          <div className="logo" onClick={goHome}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14.5" stroke={C.ink} strokeWidth="1" />
              <path d="M16 8.5V23.5M9.5 16H22.5" stroke={C.ink} strokeWidth="1" />
              <circle cx="16" cy="16" r="2.5" fill={C.ink} />
            </svg>
            <span>Rest Point</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-line" onClick={goHome} style={{ padding: '0.65rem 1.3rem', fontSize: '0.8rem' }}>← Back</button>
          </div>
        </div>
      </nav>

      <main className="content-block">
        <div className="wrap" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
          {/* Header */}
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div className="label" style={{ marginBottom: '1rem', color: C.brass }}>Why Rest Point</div>
              <h1>9 Reasons Funeral Homes Love Us</h1>
              <p style={{ color: C.gray, fontSize: '1rem', maxWidth: '600px', margin: '1rem auto 0', lineHeight: 1.7 }}>
                Join 100+ funeral homes across East Africa already transforming their operations with Rest Point.
              </p>
            </div>
          </Reveal>

          {/* Reasons Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {REASONS.map((r, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="reason-card">
                  <div className="icon-box">{r.icon}</div>
                  <div>
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1rem', fontWeight: 500, color: C.ink, marginBottom: '0.5rem' }}>{r.title}</h2>
                    <p style={{ fontSize: '0.9rem', color: C.gray, lineHeight: 1.6 }}>{r.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA */}
          <Reveal delay={600}>
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <div className="hr" style={{ marginBottom: '2.5rem' }} />
              <button className="btn btn-dark" onClick={goRegister} style={{ padding: '1rem 2.5rem', fontSize: '0.9rem' }}>
                Start Free Trial
              </button>
            </div>
          </Reveal>

          {/* Footer */}
          <footer>
            <span>© 2026 Rest Point. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}