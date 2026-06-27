import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ============================================================
   REST POINT — Data Migration Policy
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

export default function DataMigrationPolicy() {
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
        h2 { font-size: 1.15rem; line-height: 1.3; margin-top: 2.2rem; }
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

        .summary-box {
          border: 1px solid ${C.line};
          padding: 1.5rem 1.7rem;
          margin-bottom: 2rem;
        }

        .highlight-box {
          border: 1px solid ${C.verdigris};
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
        }

        .contact-box {
          background: ${C.ink};
          color: ${C.grayLight};
          padding: 1.5rem 1.7rem;
          margin-top: 1rem;
        }

        ul { padding-left: 1.5rem; line-height: 1.8; font-size: 0.95rem; }
        li { margin-bottom: 0.4rem; }

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
            <div className="label" style={{ marginBottom: '0.8rem', color: C.brass }}>Privacy</div>
            <h1>Privacy Policy</h1>
            <p style={{ color: C.gray, fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: '2rem' }}>
              Last updated: June 2026
            </p>
          </Reveal>

          {/* Summary */}
          <Reveal delay={100}>
            <div className="summary-box">
              <p style={{ color: C.ink, fontSize: '0.95rem', margin: 0 }}>
                <strong>Your Data Belongs to You:</strong> We keep your data safe, we never sell it, we don't profile users,
                and you're always in control. Questions? Email{' '}
                <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.brass, fontWeight: 500 }}>
                  privacy@restpoint.co.ke
                </a>
              </p>
            </div>
          </Reveal>

          {/* What we collect */}
          <Reveal delay={150}>
            <h2>What We Collect</h2>
            <p>
              We collect only what's needed to run the platform:
            </p>
            <ul>
              <li><strong>Funeral home staff:</strong> Name, email, phone, and login credentials (encrypted)</li>
              <li><strong>Families we serve:</strong> Names, dates of birth/death, family contacts, and ID documents — provided by your funeral home</li>
              <li><strong>Technical data:</strong> Basic usage and device information to improve the platform</li>
            </ul>
          </Reveal>

          {/* No profiling */}
          <Reveal delay={200}>
            <div className="highlight-box">
              <p style={{ color: C.ink, margin: 0 }}>
                <strong>We do not do data profiling.</strong> We don't analyze, segment, or build profiles
                of our users or the families we serve. Data is used only to operate the platform.
              </p>
            </div>
          </Reveal>

          {/* How we use data */}
          <Reveal delay={250}>
            <h2>How We Use Your Data</h2>
            <p>
              We use your information only to:
            </p>
            <ul>
              <li>Provide and improve the platform</li>
              <li>Support funeral homes and families</li>
              <li>Keep data secure</li>
              <li>Meet legal requirements</li>
            </ul>
            <p>
              We <strong>never</strong> use your data for advertising, marketing, or any purpose outside
              of running the platform.
            </p>
          </Reveal>

          {/* Data sharing */}
          <Reveal delay={300}>
            <h2>Who We Share Data With</h2>
            <p>
              We keep your data private. We only share it with:
            </p>
            <ul>
              <li><strong>Your funeral home</strong> — they control their data</li>
              <li><strong>Secure hosting providers</strong> — who protect your data</li>
              <li><strong>Legal authorities</strong> — only if required by Kenyan law</li>
            </ul>
            <p>
              We <strong>never</strong> sell your data to anyone.
            </p>
          </Reveal>

          {/* Data backup */}
          <Reveal delay={350}>
            <h2>Your Data Backup</h2>
            <p>
              Every document, permit, invoice, and report is automatically backed up to your organization's
              Google Drive. You own this backup — it remains accessible even if you leave Rest Point.
            </p>
          </Reveal>

          {/* Data retention */}
          <Reveal delay={400}>
            <h2>How Long We Keep Data</h2>
            <p>
              We keep your data as long as your funeral home uses Rest Point. If you request deletion:
            </p>
            <ul>
              <li>We provide a final copy of all data before deletion</li>
              <li>We delete your data from our systems within 30–60 days</li>
              <li>Your Google Drive backup remains intact — you keep that copy</li>
              <li>Once deleted from our systems, data cannot be recovered</li>
            </ul>
          </Reveal>

          {/* Your rights */}
          <Reveal delay={450}>
            <h2>Your Rights</h2>
            <p>
              You can access, correct, export, or request deletion of your data anytime.
              Email us at{' '}
              <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.brass }}>
                privacy@restpoint.co.ke
              </a>
            </p>
          </Reveal>

          {/* Security */}
          <Reveal delay={500}>
            <h2>How We Keep Data Safe</h2>
            <ul>
              <li>End-to-end encryption for all data</li>
              <li>Role-based access control</li>
              <li>Audit trails for all data access</li>
              <li>Automatic session timeouts</li>
              <li>Regular security monitoring</li>
            </ul>
          </Reveal>

          {/* Questions */}
          <Reveal delay={550}>
            <h2>Questions?</h2>
            <div className="contact-box">
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                Contact our privacy team:
              </p>
              <p style={{ margin: '0.5rem 0 0 0' }}>
                <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.brassLight, textDecoration: 'none' }}>
                  privacy@restpoint.co.ke
                </a>
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                We typically respond within 2 business days
              </p>
            </div>
          </Reveal>

          {/* Footer */}
          <footer>
            <span>© 2026 Rest Point. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="/terms">Terms of Service</a>
              <a href="/contact">Contact</a>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}