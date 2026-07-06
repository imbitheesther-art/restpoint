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
        h2 { font-size: 1.15rem; line-height: 1.3; margin-top: 2.2rem; margin-bottom: 0.75rem; }
        p { line-height: 1.7; font-size: 0.95rem; margin-bottom: 1rem; }
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
          background: ${C.bone2};
          border-left: 3px solid ${C.verdigris};
        }

        .highlight-box {
          border: 1px solid ${C.verdigris};
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
          background: ${C.bone2};
          border-left: 3px solid ${C.verdigris};
        }

        .contact-box {
          background: linear-gradient(135deg, ${C.verdigrisDark}, ${C.verdigris});
          color: ${C.bone};
          padding: 1.5rem 1.7rem;
          margin-top: 1rem;
        }

        ul { padding-left: 1.5rem; line-height: 1.8; font-size: 0.95rem; margin-bottom: 1rem; }
        li { margin-bottom: 0.4rem; }

        .migration-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.95rem;
        }
        .migration-table th, .migration-table td {
          border: 1px solid ${C.line};
          padding: 0.75rem 1rem;
          text-align: left;
        }
        .migration-table th {
          background: ${C.bone2};
          color: ${C.ink};
          font-weight: 600;
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
            <div className="label" style={{ marginBottom: '0.8rem', color: C.brass }}>Operations</div>
            <h1>Data Migration Policy</h1>
            <p style={{ color: C.gray, fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: '2rem' }}>
              Last updated: June 2026
            </p>
          </Reveal>

          {/* Intro Summary */}
          <Reveal delay={100}>
            <div className="summary-box">
              <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Your History Matters</h2>
              <p style={{ color: C.ink, fontSize: '0.95rem', margin: 0 }}>
                For many funeral homes, decades of operational history exist in paper records, spreadsheets, accounting software, or legacy mortuary management systems. Those records represent thousands of families served and years of institutional knowledge. When you migrate to RestPoint, you are trusting us with that history.
              </p>
            </div>
          </Reveal>

          {/* Our Migration Approach */}
          <Reveal delay={150}>
            <h2>Our Migration Approach</h2>
            <p>
              Data migration is a specialized service that combines automation with careful manual verification. While many parts of the migration process are automated, every migration also requires human review to ensure information is transferred accurately.
            </p>
            <p>
              This process is intentionally thorough because every funeral home stores information differently, and no two datasets are exactly alike. Our objective is accuracy not speed at the expense of your records.
            </p>
          </Reveal>

          {/* Commitment Box */}
          <Reveal delay={200}>
            <div className="highlight-box">
              <p style={{ color: C.ink, margin: 0 }}>
                <strong>Our Commitment:</strong> We take this responsibility seriously. Every migration is handled with strict confidentiality, careful verification, and professional attention to detail. All migration personnel operate under a Non-Disclosure Agreement (NDA), and your data is processed solely for the purpose of completing your migration.
              </p>
            </div>
          </Reveal>

          {/* Data Preparation */}
          <Reveal delay={250}>
            <h2>Data Preparation</h2>
            <p>
              Many funeral homes are moving from manual records or older software that stores information differently from RestPoint. Before importing your data, we:
            </p>
            <ul>
              <li>Review and organize your existing records.</li>
              <li>Map your data to the appropriate RestPoint fields.</li>
              <li>Remove duplicate or invalid records where possible.</li>
              <li>Validate relationships between records.</li>
              <li>Populate required system fields that may not exist in your current records.</li>
            </ul>
            <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>
              Where information is genuinely unavailable, required fields may be populated with <strong>NULL</strong> values or appropriate system defaults to maintain database integrity and prevent migration failures.
            </p>
          </Reveal>

          {/* Secure Data Transfer */}
          <Reveal delay={300}>
            <h2>Secure Data Transfer</h2>
            <p>We offer several secure methods for submitting migration data:</p>

            <h3 style={{ fontSize: '1rem', marginTop: '1rem', color: C.ink }}>Option 1 — Personal Collection</h3>
            <p>For organizations within a reasonable travel distance, a RestPoint representative can collect your data in person using an encrypted, password-protected flash drive.</p>

            <h3 style={{ fontSize: '1rem', marginTop: '1rem', color: C.ink }}>Option 2 — Encrypted ZIP File</h3>
            <p>You may send your migration files as a password-protected ZIP archive via email. For security reasons, <strong>the ZIP password must never be included in the same email.</strong> Instead, the password should be shared through a separate communication channel, such as WhatsApp or a phone call.</p>

            <h3 style={{ fontSize: '1rem', marginTop: '1rem', color: C.ink }}>Option 3 — Secure Upload Portal</h3>
            <p>For larger datasets that cannot be conveniently transferred by email, we can provide access to a secure upload portal where your files can be uploaded directly.</p>
          </Reveal>

          {/* Confidentiality */}
          <Reveal delay={350}>
            <h2>Confidentiality & Data Protection</h2>
            <p>Your migration data remains your property at all times. We strictly adhere to the following guardrails:</p>
            <ul>
              <li>Treat all migration data as confidential.</li>
              <li>Process information only for migration purposes.</li>
              <li>Restrict access to authorized migration personnel.</li>
              <li>Never share or sell your information.</li>
              <li>Protect all transferred files using secure handling procedures.</li>
              <li>Require confidentiality from everyone involved in the migration process.</li>
            </ul>
          </Reveal>

          {/* Migration Timeline & Table */}
          <Reveal delay={400}>
            <h2>Migration Timeline</h2>
            <p>Migration timelines depend on the size, quality, and complexity of your data. Typical timeframes include:</p>

            <table className="migration-table">
              <thead>
                <tr>
                  <th>Migration Type</th>
                  <th>Estimated Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Single Branch</strong></td>
                  <td>Approximately <strong>3 weeks</strong></td>
                </tr>
                <tr>
                  <td><strong>Multi-Branch Organization</strong></td>
                  <td>Approximately <strong>1–2 months</strong></td>
                </tr>
              </tbody>
            </table>

            <p>If additional data cleaning or verification is required, the timeline may be adjusted in consultation with your organization.</p>
          </Reveal>

          {/* Business Continuity */}
          <Reveal delay={450}>
            <h2>Business Continuity</h2>
            <p>
              Migration activities are planned to minimize disruption to your daily operations. In most cases, your organization continues using its existing processes while migration work takes place in the background. Final cutover to RestPoint is scheduled at a mutually agreed time to reduce operational impact.
            </p>
          </Reveal>

          {/* Migration Fees */}
          <Reveal delay={500}>
            <h2>Migration Fees</h2>
            <p>
              Data migration is a professional service involving data analysis, cleansing, mapping, validation, testing, and verification. Migration services <strong>start from KES 50,000 (approximately USD 390)</strong>.
            </p>
            <p>Final pricing depends on your structural footprint, historical volume, record hygiene metrics, and source platform architecture. A comprehensive customized quotation is provided before work begins.</p>
          </Reveal>

          {/* Post-Migration Verification */}
          <Reveal delay={550}>
            <h2>Post-Migration & Retention</h2>
            <p>
              After migration is complete, your submitted migration files are retained securely for <strong>30 days</strong> to allow post-migration verification and the resolution of any migration-related queries.
            </p>
            <p>
              After the 30-day verification window closes, raw configuration materials, portal pipelines, secure archives, and working data structures are permanently scrubbed from our systems to reduce long term compliance overhead.
            </p>
          </Reveal>

          {/* Questions Contact Box */}
          <Reveal delay={600}>
            <h2>Questions or Coordination?</h2>
            <div className="contact-box">
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                Contact our specialized operations deployment desk:
              </p>
              <p style={{ margin: '0.5rem 0 0 0' }}>
                <a href="mailto:support@restpoint.co.ke" style={{ color: C.brassLight, textDecoration: 'none', fontWeight: 500 }}>
                  support@restpoint.co.ke
                </a>
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                Migration scoping requests are typically evaluated within 2 business days.
              </p>
            </div>
          </Reveal>

          {/* Footer */}
          <footer>
            <span>© {new Date().getFullYear()} Rest Point. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="/terms">Terms of Service</a>
              <a href="/privacy">Privacy Policy</a>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}