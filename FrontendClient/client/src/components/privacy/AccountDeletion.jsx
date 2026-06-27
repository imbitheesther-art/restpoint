import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ============================================================
   REST POINT — Account Deletion
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

export default function AccountDeletion() {
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
        h3 { font-size: 1.1rem; line-height: 1.3; }
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
        .section { padding: clamp(3rem, 6vw, 4.5rem) 0; }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(250,248,244,0.92); backdrop-filter: blur(10px);
          border-bottom: 1px solid ${C.line};
          padding: 1.15rem 0;
        }
        .nav-wrap { display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 0.65rem; font-family: 'Fraunces', serif; font-size: 1.15rem; font-weight: 500; color: ${C.ink}; cursor: pointer; }
        .nav-link { font-size: 0.84rem; color: ${C.gray}; text-decoration: none; cursor: pointer; transition: color 0.2s; background: transparent; border: none; }

        .content-block { padding-top: 92px; }

        .rule { height: 1px; background: ${C.line}; margin: 1.5rem 0; }

        .summary-box {
          border: 1px solid ${C.line};
          padding: 1.5rem 1.7rem;
          margin-bottom: 2rem;
        }

        .fee-box {
          border: 1px solid ${C.verdigris};
          padding: 1.5rem 1.7rem;
          margin-bottom: 2rem;
        }

        .contact-box {
          background: ${C.ink};
          color: ${C.grayLight};
          padding: 1.5rem 1.7rem;
          margin-top: 1rem;
        }

        ul, ol { padding-left: 1.5rem; line-height: 1.8; font-size: 0.95rem; }
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
            <div className="label" style={{ marginBottom: '0.8rem', color: C.brass }}>Account Deletion</div>
            <h1>Account Deletion</h1>
            <p style={{ color: C.gray, fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: '2rem' }}>
              Last updated: June 2026
            </p>
          </Reveal>

          {/* Summary */}
          <Reveal delay={100}>
            <div className="summary-box">
              <p style={{ color: C.ink, fontSize: '0.95rem', margin: 0 }}>
                <strong>Simple version:</strong> You can delete your account anytime. We take up to 60 days
                to complete deletion. You'll receive a full copy of your data before we remove anything.
                Your Google Drive backup remains yours.
              </p>
            </div>
          </Reveal>

          {/* Fees */}
          <Reveal delay={150}>
            <div className="fee-box">
              <p style={{ color: C.verdigris, fontWeight: 600, fontSize: '1rem', marginBottom: '0.6rem', fontFamily: "'Fraunces', serif" }}>
                Deletion Fees
              </p>
              <ul style={{ color: C.ink, margin: 0 }}>
                <li><strong>Setup fee:</strong> KES 1,000 (one-time)</li>
                <li><strong>Processing fee:</strong> KES 2,500 (covers verification and data export)</li>
                <li><strong>Total:</strong> KES 3,500 (one-time payment)</li>
              </ul>
            </div>
          </Reveal>

          {/* How to request */}
          <Reveal delay={200}>
            <h2>How to Request Deletion</h2>
            <p>
              To delete your account:
            </p>
            <ol>
              <li>Email us at <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.brass }}>privacy@restpoint.co.ke</a></li>
              <li>Use the email address registered with your account</li>
              <li>Tell us you want to delete your account</li>
              <li>We'll verify your identity to make sure it's really you</li>
            </ol>
          </Reveal>

          {/* Timeline */}
          <Reveal delay={250}>
            <h2>Deletion Timeline</h2>
            <p>
              We take up to <strong>60 days</strong> to complete deletion. This gives you time to change
              your mind and ensures everything is done safely.
            </p>
            <ul>
              <li><strong>Within 7 days:</strong> We send you a complete copy of your data</li>
              <li><strong>Within 30–60 days:</strong> We delete your data from our systems</li>
              <li><strong>Within 90 days:</strong> We delete your data from backups</li>
            </ul>
          </Reveal>

          {/* Data export */}
          <Reveal delay={300}>
            <h2>Getting Your Data First</h2>
            <p>
              Before we delete anything, we give you a complete copy of your data:
            </p>
            <ul>
              <li>All deceased records</li>
              <li>All documents and permits</li>
              <li>Billing and payment history</li>
              <li>Account settings and preferences</li>
            </ul>
            <p>
              We'll send you a secure download link. You have <strong>14 days</strong> to download
              your data before it expires.
            </p>
          </Reveal>

          {/* What happens to backups */}
          <Reveal delay={350}>
            <h2>What Happens to Your Backups</h2>
            <p>
              When you delete your account:
            </p>
            <ul>
              <li><strong>Our systems:</strong> Data is permanently deleted within 60 days</li>
              <li><strong>Your Google Drive:</strong> Backup remains intact — you keep this copy</li>
              <li><strong>Your NAS:</strong> Any local backups you made remain yours</li>
            </ul>
            <p>
              We don't delete your Google Drive backup because it's your data. You can access it
              anytime through your Google account.
            </p>
          </Reveal>

          {/* After deletion */}
          <Reveal delay={400}>
            <h2>After Deletion</h2>
            <p>
              Once the deletion process is complete:
            </p>
            <ul>
              <li>Data cannot be recovered from our systems</li>
              <li>We keep no copies</li>
              <li>New accounts start with an empty database</li>
              <li>Your Google Drive backup remains accessible</li>
            </ul>
          </Reveal>

          {/* Questions */}
          <Reveal delay={450}>
            <h2>Questions?</h2>
            <div className="contact-box">
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                Have questions about deleting your account?
              </p>
              <p style={{ margin: '0.5rem 0 0 0' }}>
                Email us at{' '}
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
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}