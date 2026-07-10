import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../layout/Footer';

const C = {
  ink: '#15171A',
  bone: '#FAF8F4',
  bone2: '#F3EFE6',
  brass: '#8B7355',
  brassLight: '#A98F6E',
  verdigris: '#3D4F47',
  verdigrisDark: '#2E3F37',
  verdigrisLight: '#4D6359',
  line: '#E3DDD0',
  lineDark: 'rgba(250,248,244,0.14)',
  gray: '#6B6862',
  grayLight: 'rgba(250,248,244,0.62)',
  grayDark: '#4A4844',
  accent: '#C77B5E',
};

function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShown(true); obs.disconnect(); } },
      { threshold: 0.1 }
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
      transform: shown ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      ...style
    }}>
      {children}
    </div>
  );
};

const Mark = ({ size = 28, color = C.verdigris }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="1.5" />
    <path d="M16 8V24M8 16H24" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="16" r="3.5" fill={color} />
  </svg>
);

export default function ReleasePolicy() {
  const navigate = useNavigate();
  const goHome = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); };

  const scheduleCards = [
    {
      label: 'Morning Block', value: 'Before 9:00 AM', icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )
    },
    {
      label: 'Evening Block', value: 'After 4:00 PM', icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )
    },
    {
      label: 'Weekend Block', value: 'Saturdays & Sundays', icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
  ];

  const releaseTypes = [
    { title: 'Security Updates', desc: 'Protocols and hotfixes deployed to continuously safeguard your platform and sensitive records.' },
    { title: 'Bug Fixes', desc: 'Targeted structural resolutions designed to eliminate technical friction and enhance platform reliability.' },
    { title: 'Feature Releases', desc: 'New functional pipelines, workflows, and tools developed directly from partner funeral home feedback.' },
    { title: 'Maintenance Updates', desc: 'Code optimizations, underlying infrastructure scalability tweaks, and engine tuning.' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: ${C.gray}; background: ${C.bone}; -webkit-font-smoothing: antialiased; }

        h1, h2, h3 { font-family: 'Fraunces', serif; font-weight: 500; letter-spacing: -0.01em; color: ${C.ink}; }
        h1 { font-size: clamp(2.2rem, 5vw, 3rem); line-height: 1.08; }
        h2 { font-size: clamp(1.25rem, 2.5vw, 1.5rem); line-height: 1.25; margin-bottom: 0.8rem; }
        h3 { font-size: 1.05rem; line-height: 1.35; margin-bottom: 0.5rem; }
        p { line-height: 1.75; font-size: 0.95rem; margin-bottom: 1rem; }
        a { color: inherit; }
        strong { color: ${C.ink}; font-weight: 600; }

        .label { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; color: ${C.brass}; font-weight: 500; }
        .wrap { max-width: 1080px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2.5rem); }

        /* ── Nav ── */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(250,248,244,0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid ${C.line};
          padding: 1.2rem 0; transition: all 0.4s ease;
        }
        nav.scrolled { background: rgba(250,248,244,0.96); box-shadow: 0 1px 12px rgba(21,23,26,0.06); }
        .nav-wrap { display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 0.7rem; font-family: 'Fraunces', serif; font-size: 1.3rem; font-weight: 500; color: ${C.ink}; cursor: pointer; transition: opacity 0.3s; text-decoration: none; }
        .logo:hover { opacity: 0.8; }
        .nav-links { display: flex; gap: 2.5rem; align-items: center; list-style: none; }
        .nav-links a { font-size: 0.85rem; color: ${C.gray}; text-decoration: none; transition: color 0.2s; position: relative; padding: 0.5rem 0; }
        .nav-links a::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 1.5px; background: ${C.verdigris}; transition: width 0.3s ease; }
        .nav-links a:hover { color: ${C.verdigris}; }
        .nav-links a:hover::after { width: 100%; }
        .nav-cta { display: flex; gap: 0.75rem; }

        /* ── Hero Banner ── */
        .hero-banner {
          background: ${C.verdigrisDark};
          padding: clamp(6rem, 12vw, 9rem) 0 clamp(3rem, 6vw, 4.5rem);
          position: relative; overflow: hidden;
          margin-top: 60px;
        }
        .hero-banner-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(250,248,244,0.05) 1px, transparent 1px);
          background-size: 28px 28px; pointer-events: none;
        }
        .hero-banner-glow {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(61,79,71,0.2) 0%, transparent 60%);
          top: -200px; right: -100px; pointer-events: none;
        }
        .hero-banner-glow2 {
          position: absolute; width: 350px; height: 350px; border-radius: 50%;
          background: radial-gradient(circle, rgba(139,115,85,0.1) 0%, transparent 60%);
          bottom: -100px; left: -80px; pointer-events: none;
        }
        .hero-banner .wrap { position: relative; z-index: 1; }
        .hero-banner h1 { color: ${C.bone}; margin: 0 0 1rem 0; }
        .hero-banner .subtitle { color: rgba(250,248,244,0.55); font-size: 1.1rem; max-width: 620px; margin: 0; line-height: 1.8; }
        .hero-banner .meta { color: rgba(250,248,244,0.35); }
        .back-link {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.82rem; color: rgba(250,248,244,0.4);
          text-decoration: none; margin-bottom: 2rem;
          transition: color 0.2s; cursor: pointer;
          font-family: 'Inter', sans-serif; background: none; border: none; padding: 0;
        }
        .back-link:hover { color: rgba(250,248,244,0.8); }
        .back-link svg { transition: transform 0.2s; }
        .back-link:hover svg { transform: translateX(-3px); }

        /* ── Content ── */
        main { background: ${C.bone}; }
        .content-area { padding: clamp(3rem, 6vw, 5rem) 0; }

        .section { margin-top: 3.5rem; }
        .section:first-child { margin-top: 0; }
        .section-divider { height: 1px; background: ${C.line}; margin: 3rem 0; }

        .section-label {
          display: inline-flex; align-items: center; gap: 0.6rem;
          margin-bottom: 1.5rem;
        }
        .section-label-line { width: 24px; height: 1px; background: ${C.line}; }

        /* ── Philosophy Box ── */
        .philosophy-box {
          background: ${C.white}; border: 1px solid ${C.line};
          border-radius: 16px; padding: clamp(1.8rem, 3vw, 2.2rem);
          position: relative; overflow: hidden;
        }
        .philosophy-box::before {
          content: ''; position: absolute; top: 0; left: 0; bottom: 0;
          width: 4px; background: linear-gradient(180deg, ${C.verdigris}, ${C.brass});
          border-radius: 4px 0 0 4px;
        }
        .philosophy-box h2 { margin-top: 0; }

        /* ── Release Type Cards ── */
        .type-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 1rem; margin: 2rem 0;
        }
        .type-card {
          background: ${C.white}; border: 1px solid ${C.line};
          border-radius: 14px; padding: 1.5rem;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          position: relative; overflow: hidden;
        }
        .type-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, ${C.verdigris}, transparent);
          opacity: 0; transition: opacity 0.4s ease;
        }
        .type-card:hover {
          border-color: rgba(61,79,71,0.25);
          transform: translateY(-3px);
          box-shadow: 0 10px 28px -6px rgba(61,79,71,0.1), 0 0 0 1px rgba(61,79,71,0.06);
        }
        .type-card:hover::before { opacity: 1; }
        .type-number {
          font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
          color: ${C.verdigris}; letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 0.6rem; opacity: 0.7;
        }
        .type-title {
          font-family: 'Inter', sans-serif; font-size: 0.95rem; font-weight: 600;
          color: ${C.ink}; margin-bottom: 0.45rem; letter-spacing: -0.01em;
        }
        .type-desc { font-size: 0.88rem; color: ${C.gray}; line-height: 1.65; margin: 0; }

        /* ── Schedule Cards ── */
        .schedule-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1rem; margin: 2rem 0;
        }
        .schedule-card {
          background: ${C.white}; border: 1px solid ${C.line};
          border-radius: 14px; padding: 1.6rem;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          position: relative; overflow: hidden;
        }
        .schedule-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, ${C.brass}, transparent);
          opacity: 0; transition: opacity 0.4s ease;
        }
        .schedule-card:hover {
          border-color: rgba(139,115,85,0.3);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px -8px rgba(139,115,85,0.12), 0 0 0 1px rgba(139,115,85,0.08);
        }
        .schedule-card:hover::before { opacity: 1; }
        .schedule-icon {
          width: 42px; height: 42px; border-radius: 11px;
          background: ${C.bone2}; color: ${C.brass};
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.1rem; transition: all 0.4s ease;
        }
        .schedule-card:hover .schedule-icon {
          background: ${C.brass}; color: ${C.bone};
          box-shadow: 0 4px 16px rgba(139,115,85,0.25);
        }
        .schedule-value {
          font-family: 'Inter', sans-serif; font-size: 1.05rem; font-weight: 600;
          color: ${C.ink}; margin-top: 0.3rem; letter-spacing: -0.01em;
        }

        /* ── Quote Box ── */
        .quote-box {
          background: ${C.verdigrisDark}; border-radius: 16px;
          padding: clamp(2rem, 3vw, 2.5rem);
          margin: 3rem 0; position: relative; overflow: hidden;
        }
        .quote-box::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(rgba(250,248,244,0.04) 1px, transparent 1px);
          background-size: 24px 24px; pointer-events: none;
        }
        .quote-box::after {
          content: ''; position: absolute; bottom: -80px; right: -80px;
          width: 250px; height: 250px; border-radius: 50%;
          background: radial-gradient(circle, rgba(139,115,85,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .quote-box > * { position: relative; z-index: 1; }
        .quote-accent {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, ${C.verdigrisLight}, ${C.brass}, ${C.verdigrisLight});
          background-size: 200% 100%; animation: grad-shift 4s ease infinite;
        }
        .quote-mark {
          font-family: 'Fraunces', serif; font-size: 3rem; line-height: 1;
          color: rgba(250,248,244,0.1); margin-bottom: 0.5rem;
        }
        .quote-text {
          color: rgba(250,248,244,0.75); font-size: 1.1rem; line-height: 1.7;
          font-family: 'Fraunces', serif; font-style: italic; margin: 0;
        }

        /* ── Note Box ── */
        .note-box {
          background: ${C.bone2}; border: 1px solid ${C.line};
          border-radius: 10px; padding: 1rem 1.2rem;
          margin-top: 1.5rem; font-size: 0.88rem;
          color: ${C.grayDark}; line-height: 1.65;
          display: flex; align-items: flex-start; gap: 0.7rem;
        }
        .note-icon {
          flex-shrink: 0; width: 18px; height: 18px;
          color: ${C.brass}; margin-top: 2px;
        }

        /* ── Sign-off ── */
        .signoff-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 1rem; margin-top: 2rem;
        }
        .signoff-card {
          background: ${C.white}; border: 1px solid ${C.line};
          border-radius: 14px; padding: 1.6rem;
          transition: all 0.3s ease;
        }
        .signoff-card:hover {
          border-color: rgba(61,79,71,0.2);
          box-shadow: 0 6px 20px -4px rgba(21,23,26,0.06);
        }
        .signoff-name {
          font-family: 'Inter', sans-serif; font-size: 1rem; font-weight: 600;
          color: ${C.ink}; margin-top: 0.4rem; letter-spacing: -0.01em;
        }
        .signoff-role { font-size: 0.85rem; color: ${C.gray}; margin: 0; }

        /* ── Footer ── */
        .policy-footer {
          margin-top: 4rem; padding: 2rem 0;
          border-top: 1px solid ${C.line};
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 1rem;
        }
        .policy-footer span { font-size: 0.82rem; color: ${C.grayDark}; opacity: 0.6; }
        .footer-links { display: flex; gap: 0.6rem; flex-wrap: wrap; }
        .footer-link {
          font-size: 0.82rem; color: ${C.gray}; text-decoration: none;
          padding: 0.55rem 1.1rem; border: 1px solid ${C.line};
          border-radius: 8px; transition: all 0.25s ease;
          font-family: 'Inter', sans-serif; background: none; cursor: pointer;
        }
        .footer-link:hover {
          background: ${C.ink}; color: ${C.bone}; border-color: ${C.ink};
        }

        @keyframes grad-shift { 0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%} }

        @media (max-width: 768px) {
          .nav-links, .nav-cta { display: none; }
          .type-grid { grid-template-columns: 1fr; }
          .schedule-grid { grid-template-columns: 1fr; }
          .signoff-grid { grid-template-columns: 1fr; }
          .policy-footer { flex-direction: column; align-items: flex-start; }
          .footer-links { width: 100%; }
          .footer-link { flex: 1; text-align: center; justify-content: center; }
        }
      `}</style>

      <nav id="release-nav">
        <div className="wrap nav-wrap">
          <a href="/" className="logo" onClick={(e) => { e.preventDefault(); goHome(); }}>
            <Mark size={28} />
            Rest Point
          </a>
          <ul className="nav-links">
            <li><a href="/" onClick={(e) => { e.preventDefault(); goHome(); }}>Home</a></li>
            <li><a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy</a></li>
            <li><a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms</a></li>
            <li><a href="/sla" onClick={(e) => { e.preventDefault(); navigate('/sla'); }}>SLA</a></li>
            <li><a href="/security" onClick={(e) => { e.preventDefault(); navigate('/security'); }}>Security</a></li>
            <li><a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact</a></li>
          </ul>
          <div className="nav-cta">
            <button className="footer-link" onClick={goHome} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>← Back</button>
          </div>
        </div>
      </nav>

      <main>
        {/* ════ Hero Banner ════ */}
        <div className="hero-banner">
          <div className="hero-banner-grid" />
          <div className="hero-banner-glow" />
          <div className="hero-banner-glow2" />
          <div className="wrap">
            <button className="back-link" onClick={goHome}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            <Reveal>
              <span className="label meta" style={{ display: 'block', marginBottom: '1.5rem' }}>
                Engineering · Release Management
              </span>
              <h1>Release Management Policy</h1>
              <p className="subtitle">
                How we ship updates to production — planned, tested, and zero-disruption.
              </p>
            </Reveal>
          </div>
        </div>

        {/* ════ Content ════ */}
        <div className="content-area">
          <div className="wrap">

            {/* Philosophy */}
            <Reveal>
              <div className="section">
                <div className="section-label">
                  <div className="section-label-line" />
                  <span className="label">Philosophy</span>
                </div>
                <div className="philosophy-box">
                  <h2>Our Approach</h2>
                  <p style={{ margin: 0 }}>
                    At RestPoint, every release is designed with one objective: <strong>Improve the platform without disrupting your operations.</strong> Every update is planned, thoroughly tested, and reviewed before deployment. We prioritize stability, security, and absolute reliability over frequent, volatile releases.
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="section-divider" />

            {/* What We Release */}
            <Reveal delay={100}>
              <div className="section">
                <div className="section-label">
                  <div className="section-label-line" />
                  <span className="label">Classifications</span>
                </div>
                <h2>What We Release</h2>
                <p>To keep RestPoint operating at peak performance, engineering artifacts are structured across four core classifications:</p>
                <div className="type-grid">
                  {releaseTypes.map((t, i) => (
                    <div className="type-card" key={i}>
                      <div className="type-number">Type {String(i + 1).padStart(2, '0')}</div>
                      <div className="type-title">{t.title}</div>
                      <p className="type-desc">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <div className="section-divider" />

            {/* Release Schedule */}
            <Reveal delay={150}>
              <div className="section">
                <div className="section-label">
                  <div className="section-label-line" />
                  <span className="label">Schedule</span>
                </div>
                <h2>Release Windows</h2>
                <p>To shield your day-to-day work from interruptions, deployments are restricted to off-peak periods whenever possible:</p>

                <div className="schedule-grid">
                  {scheduleCards.map((s, i) => (
                    <div className="schedule-card" key={i}>
                      <div className="schedule-icon">{s.icon}</div>
                      <div className="label" style={{ fontSize: '0.65rem' }}>{s.label}</div>
                      <div className="schedule-value">{s.value}</div>
                    </div>
                  ))}
                </div>

                <div className="note-box">
                  <svg className="note-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>
                    Critical threat mitigation or severe infrastructure security anomalies may bypass standard windows and be deployed immediately to secure platform integrity.
                  </span>
                </div>
              </div>
            </Reveal>

            <div className="section-divider" />

            {/* Testing */}
            <Reveal delay={200}>
              <div className="section">
                <div className="section-label">
                  <div className="section-label-line" />
                  <span className="label">Quality</span>
                </div>
                <h2>Quality Assurance & Rollback Strategy</h2>
                <p>
                  Every artifact undergoes multi-stage continuous integration (CI) pipelines, isolated staging validation, and meticulous automated testing suites before hitting production.
                </p>
                <p>
                  In the rare event that an unforeseen regression surfaces post-deployment, our infrastructure utilizes a zero-downtime rollback strategy. We can instantly revert the environment to its last-known-stable state to guarantee operational continuity.
                </p>
              </div>
            </Reveal>

            <div className="section-divider" />

            {/* Communications */}
            <Reveal delay={250}>
              <div className="section">
                <div className="section-label">
                  <div className="section-label-line" />
                  <span className="label">Transparency</span>
                </div>
                <h2>Communications & Transparency</h2>
                <p>
                  We believe in transparent engineering. Major architectural milestones, new module additions, or planned infrastructure expansions are broadcast to user administrators well in advance, accompanied by comprehensive release manifests. Minor patches, hotfixes, or performance optimizations are seamlessly introduced in the background without requiring user intervention.
                </p>
              </div>
            </Reveal>

            {/* Quote */}
            <Reveal delay={300}>
              <div className="quote-box">
                <div className="quote-accent" />
                <div className="quote-mark">"</div>
                <p className="quote-text">
                  Software should make your work easier — not interrupt it. That principle guides every single release we ship to production.
                </p>
              </div>
            </Reveal>

            <div className="section-divider" />

            {/* Sign-off */}
            <Reveal delay={350}>
              <div className="section">
                <div className="section-label">
                  <div className="section-label-line" />
                  <span className="label">Governance</span>
                </div>
                <h2>Engineering Sign-off</h2>
                <div className="signoff-grid">
                  <div className="signoff-card">
                    <div className="label" style={{ fontSize: '0.65rem' }}>Prepared By</div>
                    <div className="signoff-name">Mumo Lead</div>
                    <p className="signoff-role">Lead Software Engineer</p>
                  </div>
                  <div className="signoff-card">
                    <div className="label" style={{ fontSize: '0.65rem' }}>Reviewed & Approved By</div>
                    <div className="signoff-name">Welt Tallis</div>
                    <p className="signoff-role">Chief Technology Officer (CTO)</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <footer className="policy-footer">
              <span>© 2026 Rest Point. All rights reserved.</span>
              <div className="footer-links">
                <button className="footer-link" onClick={() => navigate('/privacy')}>Privacy Policy</button>
                <button className="footer-link" onClick={() => navigate('/terms')}>Terms of Service</button>
                <button className="footer-link" onClick={() => navigate('/contact')}>Contact</button>
              </div>
            </footer>
          </div>
        </div>
      </main>

      <script>{`
        const nav = document.getElementById('release-nav');
        window.addEventListener('scroll', () => {
          nav.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
      `}</script>
    </>
  );
} 