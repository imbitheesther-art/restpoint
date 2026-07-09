import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../layout/Footer';

/* ============================================================
   REST POINT — Release Management Policy
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

export default function ReleasePolicy() {
  const navigate = useNavigate();
  const goHome = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: ${C.gray}; background: ${C.bone}; -webkit-font-smoothing: antialiased; }

        h1, h2, h3 { font-family: 'Fraunces', serif; font-weight: 500; letter-spacing: -0.01em; color: ${C.ink}; }
        h1 { font-size: clamp(2rem, 4vw, 2.6rem); line-height: 1.12; }
        h2 { font-size: 1.15rem; line-height: 1.3; margin-top: 2.2rem; margin-bottom: 0.75rem; }
        p { line-height: 1.7; font-size: 0.95rem; margin-bottom: 1rem; }
        a { color: inherit; }

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

        .summary-box {
          border: 1px solid ${C.line};
          padding: 1.5rem 1.7rem;
          margin-bottom: 2rem;
        }

        .quote-box {
          border-left: 2px solid ${C.brass};
          padding-left: 1.25rem;
          margin: 2rem 0;
          font-style: italic;
        }

        .signoff-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid ${C.line};
        }

        ul { padding-left: 1.5rem; line-height: 1.8; font-size: 0.95rem; margin-bottom: 1rem; }
        li { margin-bottom: 0.4rem; }

        .schedule-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }
        .schedule-card {
          background: ${C.bone2};
          padding: 1.25rem;
          border-radius: 2px;
          border: 1px solid transparent;
        }
        .schedule-card:hover {
          border-color: ${C.line};
        }

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
        <div className="wrap" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

          {/* Header */}
          <Reveal>
            <div className="label" style={{ marginBottom: '0.8rem', color: C.brass }}>Engineering</div>
            <h1>Release Management Policy</h1>
            <p style={{ color: C.gray, fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: '2rem' }}>
              Last updated: June 2026
            </p>
          </Reveal>

          {/* Our Philosophy */}
          <Reveal delay={100}>
            <div className="summary-box">
              <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Our Philosophy</h2>
              <p style={{ color: C.ink, fontSize: '0.95rem', margin: 0 }}>
                At RestPoint, every release is designed with one objective: <strong>Improve the platform without disrupting your operations.</strong> Every update is planned, thoroughly tested, and reviewed before deployment. We prioritize stability, security, and absolute reliability over frequent, volatile releases.
              </p>
            </div>
          </Reveal>

          {/* What We Release */}
          <Reveal delay={150}>
            <h2>What We Release</h2>
            <p>To keep RestPoint operating at peak performance, engineering artifacts are structured across four core classifications:</p>
            <ul>
              <li><strong>Security Updates</strong>  Protocols and hotfixes deployed to continuously safeguard your platform and sensitive records.</li>
              <li><strong>Bug Fixes</strong>  targeted structural resolutions designed to eliminate technical friction and enhance platform reliability.</li>
              <li><strong>Feature Releases</strong>  New functional pipelines, workflows, and tools developed directly from partner funeral home feedback.</li>
              <li><strong>Maintenance Updates</strong> Code optimizations, underlying infrastructure scalability tweaks, and engine tuning.</li>
            </ul>
          </Reveal>

          {/* Release Schedule Grid */}
          <Reveal delay={200}>
            <h2>Release Windows</h2>
            <p>To shield your day-to-day work from interruptions, deployments are restricted to off-peak periods whenever possible:</p>

            <div className="schedule-grid">
              <div className="schedule-card">
                <div className="label" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Morning Block</div>
                <strong style={{ color: C.ink, dplay: 'block', fontSize: '1.1rem' }}>Before 9:00 AM</strong>
              </div>
              <div className="schedule-card">
                <div className="label" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Evening Block</div>
                <strong style={{ color: C.ink, display: 'block', fontSize: '1.1rem' }}>After 4:00 PM</strong>
              </div>
              <div className="schedule-card">
                <div className="label" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Weekend Block</div>
                <strong style={{ color: C.ink, display: 'block', fontSize: '1.1rem' }}>Saturdays & Sundays</strong>
              </div>
            </div>

            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: C.gray }}>
              *Note: Critical threat mitigation or severe infrastructure security anomalies may bypass standard windows and be deployed immediately to secure platform integrity.
            </p>
          </Reveal>

          {/* Testing Protocols */}
          <Reveal delay={250}>
            <h2>Quality Assurance & Rollback Strategy</h2>
            <p>
              Every artifact undergoes multi-stage continuous integration (CI) pipelines, isolated staging validation, and meticulous automated testing suites before hitting production.
            </p>
            <p>
              In the rare event that an unforeseen regression surfaces post-deployment, our infrastructure utilizes a zero-downtime rollback strategy. We can instantly revert the environment to its last-known-stable state to guarantee operational continuity.
            </p>
          </Reveal>

          {/* Notifications */}
          <Reveal delay={300}>
            <h2>Communications & Transparency</h2>
            <p>
              We believe in transparent engineering. Major architectural milestones, new module additions, or planned infrastructure expansions are broadcast to user administrators well in advance, accompanied by comprehensive release manifests. Minor patches, hotfixes, or performance optimizations are seamlessly introduced in the background without requiring user intervention.
            </p>
          </Reveal>

          {/* Philosophy Statement */}
          <Reveal delay={350}>
            <div className="quote-box">
              <p style={{ color: C.ink, fontSize: '1.05rem', margin: 0, fontFamily: "'Fraunces', serif" }}>
                "Software should make your work easier—not interrupt it. That principle guides every single release we ship to production."
              </p>
            </div>
          </Reveal>

          {/* Engineering Governance Sign-off */}
          <Reveal delay={400}>
            <div className="signoff-grid">
              <div>
                <div className="label" style={{ fontSize: '0.65rem' }}>Prepared By</div>
                <h3 style={{ fontSize: '1rem', marginTop: '0.25rem' }}>Mumo Lead</h3>
                <p style={{ fontSize: '0.85rem', color: C.gray, margin: 0 }}>Lead Software Engineer</p>
              </div>
              <div>
                <div className="label" style={{ fontSize: '0.65rem' }}>Reviewed & Approved By</div>
                <h3 style={{ fontSize: '1rem', marginTop: '0.25rem' }}>Welt Tallis</h3>
                <p style={{ fontSize: '0.85rem', color: C.gray, margin: 0 }}>Chief Technology Officer (CTO)</p>
              </div>
            </div>
          </Reveal>

        </div>
      </main>
      <Footer />
    </>
  );
}