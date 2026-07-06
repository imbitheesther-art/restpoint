import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ============================================================
   REST POINT — Service Level Agreement (SLA)
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

export default function SLAPolicy() {
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
        .logo { display: flex; align-items: center; gap: 0.65rem; font-family: 'Fraunces', serif; font-size: 1.15rem; font-weight: 500; color: ${C.ink}; text-decoration: none; }
        .logo-mark {
          width: 32px; height: 32px; background: ${C.verdigris}; border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'JetBrains Mono', monospace; font-weight: 500; color: ${C.bone};
          font-size: 0.85rem;
        }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a { font-family: 'Inter', sans-serif; font-size: 0.85rem; color: ${C.gray}; text-decoration: none; transition: color 0.2s; }
        .nav-links a:hover { color: ${C.brass}; }

        main {
          padding-top: 100px;
          min-height: 100vh;
        }

        h1 { margin-top: 3rem; margin-bottom: 1rem; }
        .subtitle { color: ${C.gray}; font-size: 1.1rem; max-width: 720px; margin-bottom: 3rem; opacity: 0.85; }
        .meta { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: ${C.brass}; margin-bottom: 2rem; letter-spacing: 0.05em; }

        .section { margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid ${C.line}; }
        .section:first-of-type { border-top: none; padding-top: 0; margin-top: 2rem; }

        ul { padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; line-height: 1.7; font-size: 0.95rem; }

        strong { color: ${C.ink}; font-weight: 600; }

        .commitment-box {
          background: ${C.verdigris};
          color: ${C.bone};
          padding: 2rem;
          border-radius: 4px;
          margin: 2rem 0;
          line-height: 1.7;
          font-size: 0.95rem;
        }
        .commitment-box p { color: ${C.bone}; line-height: 1.7; font-size: 0.95rem; }
        .commitment-box strong { color: ${C.bone}; }
        .commitment-box h3 {
          color: ${C.bone};
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .feature-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: ${C.bone2};
          border-radius: 4px;
          border-left: 3px solid ${C.verdigris};
        }
        .feature-icon {
          font-size: 1.2rem;
          line-height: 1;
        }

        /* SLA Table */
        .sla-table-wrap {
          overflow-x: auto;
          margin: 2rem 0;
          border-radius: 4px;
          border: 1px solid ${C.line};
          box-shadow: 0 4px 24px rgba(21,23,26,0.06);
        }
        .sla-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
        }
        .sla-table thead th {
          background: ${C.verdigris};
          color: ${C.bone};
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 0.9rem 1.1rem;
          text-align: left;
          white-space: nowrap;
        }
        .sla-table thead th:first-child { border-radius: 4px 0 0 0; }
        .sla-table thead th:last-child { border-radius: 0 4px 0 0; }
        .sla-table tbody td {
          padding: 0.85rem 1.1rem;
          border-bottom: 1px solid ${C.line};
          vertical-align: top;
        }
        .sla-table tbody tr:last-child td { border-bottom: none; }
        .sla-table tbody tr:nth-child(even) { background: ${C.bone2}; }
        .sla-table tbody tr:nth-child(odd) { background: #fff; }
        .sla-table tbody tr:hover { background: #EAE6DA; }
        .sla-table .priority-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .sla-table .icon { font-size: 1rem; }

        .highlight-box {
          background: #fff;
          border: 1px solid ${C.line};
          border-left: 4px solid ${C.brass};
          padding: 1.5rem;
          border-radius: 4px;
          margin: 1.5rem 0;
          font-size: 0.95rem;
          line-height: 1.7;
        }

        .contact-box {
          background: ${C.bone2};
          padding: 1.5rem;
          border-radius: 4px;
          margin: 2rem 0;
          border: 1px solid ${C.line};
        }

        footer {
          margin-top: 4rem;
          padding: 2rem 0;
          border-top: 1px solid ${C.line};
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        footer span { font-size: 0.85rem; opacity: 0.7; }
        footer a {
          font-size: 0.85rem;
          color: #fff;
          text-decoration: none;
          padding: 0.5rem 1rem;
          background: ${C.ink};
          border-radius: 2px;
          transition: background 0.2s;
        }
        footer a:hover { background: ${C.verdigris}; }

        .hero-header {
          border-bottom: 1px solid ${C.line};
          padding-bottom: 2rem;
          margin-bottom: 2rem;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: ${C.brass};
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          margin-bottom: 1.5rem;
          font-family: 'Inter', sans-serif;
          transition: color 0.2s;
        }
        .back-btn:hover { color: ${C.ink}; }

        @media (max-width: 768px) {
          .sla-table thead th,
          .sla-table tbody td { padding: 0.6rem 0.8rem; font-size: 0.8rem; }
          .nav-links { display: none; }
        }
      `}</style>

      <nav>
        <div className="wrap nav-wrap">
          <a href="/" className="logo" onClick={(e) => { e.preventDefault(); goHome(); }}>
            <div className="logo-mark">R</div>
            Rest Point
          </a>
          <ul className="nav-links">
            <li><a href="/" onClick={(e) => { e.preventDefault(); goHome(); }}>Home</a></li>
            <li><a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy</a></li>
            <li><a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms</a></li>
            <li><a href="/sla" onClick={(e) => { e.preventDefault(); navigate('/sla'); }}>SLA</a></li>
            <li><a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact</a></li>
          </ul>
        </div>
      </nav>

      <main>
        <div className="wrap">
          <button className="back-btn" onClick={goHome}>← Back to Home</button>

          <Reveal>
            <div className="hero-header">
              <span className="meta">POLICY · SERVICE LEVEL AGREEMENT</span>
              <h1>Service Level Agreement (SLA)</h1>
              <p className="subtitle">
                Our commitment to keeping your operations running with secure, reliable, and highly available infrastructure.
              </p>
            </div>
          </Reveal>

          {/* Our Commitment */}
          <Reveal delay={100}>
            <div className="section">
              <h2>Our Commitment</h2>
              <p>
                When an organization chooses RestPoint, they are doing far more than purchasing software—they are
                entrusting us with one of the most critical parts of their daily operations.
              </p>
              <p>
                We understand that a mortuary never stops operating. Admissions, deceased registration, billing,
                dispatch, body tracking, and releases can happen at any hour of the day or night. Every minute
                of availability matters.
              </p>
              <p>
                That level of trust is something we never take for granted.
              </p>
              <p>
                Our commitment is simple: <strong>keep your operations running.</strong>
              </p>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="commitment-box">
              <p>
                Our engineering and support teams work continuously to maintain a secure, reliable, and highly
                available platform that your staff can depend on every day. We proactively monitor system
                performance, perform preventive maintenance, and respond rapidly to any issue that could affect
                your operations.
              </p>
              <p>
                We target <strong>99.9% monthly uptime</strong>, with the goal of ensuring your team has
                uninterrupted access to the system whenever it is needed. Through our advanced PM2 cluster deployment
                architecture, we achieve <strong>zero-downtime deployments</strong> for system updates and
                maintenance—meaning your operations continue without interruption during software updates.
              </p>
              <p>
                When you trust RestPoint, you gain more than a software provider—you gain a technology partner
                that understands the importance of every operation, every record, and every family you serve.
              </p>
            </div>
          </Reveal>

          {/* System Availability */}
          <Reveal delay={100}>
            <div className="section">
              <h2>System Availability</h2>
              <div className="feature-list">
                <div className="feature-item">
                  <span className="feature-icon">●</span>
                  <div>
                    <strong>99.9% Target Monthly Uptime</strong>
                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', opacity: 0.85 }}>
                      Industry-leading reliability target for mission-critical access.
                    </p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">◉</span>
                  <div>
                    <strong>Zero-Downtime Deployments</strong>
                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', opacity: 0.85 }}>
                      PM2 cluster architecture ensures updates happen without service interruption.
                    </p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">◈</span>
                  <div>
                    <strong>24/7 System Monitoring</strong>
                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', opacity: 0.85 }}>
                      Continuous surveillance of all infrastructure and services.
                    </p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">◉</span>
                  <div>
                    <strong>Performance Optimization</strong>
                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', opacity: 0.85 }}>
                      Ongoing security updates and speed enhancements.
                    </p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">◉</span>
                  <div>
                    <strong>Rapid Incident Response</strong>
                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', opacity: 0.85 }}>
                      Immediate action against critical service interruptions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Planned Maintenance */}
          <Reveal delay={150}>
            <div className="section">
              <h2>Planned Maintenance</h2>
              <p>
                To avoid disrupting your operations, scheduled maintenance is normally performed at times that
                least affect your workflow.
              </p>
              <ul>
                <li>Outside business hours (before <strong>9:00 AM</strong> or after <strong>4:00 PM</strong>)</li>
                <li>On weekends whenever possible</li>
              </ul>
              <p>
                Where practical, advance notice will be provided before any planned maintenance is scheduled.
              </p>
            </div>
          </Reveal>

          {/* Incident Response */}
          <Reveal delay={200}>
            <div className="section">
              <h2>Incident Response</h2>
              <p>
                When something goes wrong, speed and clarity matter. Our incident response framework ensures
                fast initial reactions and clear timelines for resolution.
              </p>
              <div className="sla-table-wrap">
                <table className="sla-table">
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Description</th>
                      <th>Initial Response</th>
                      <th>Target Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="priority-badge">
                        <span className="icon">🔴</span> Critical
                      </td>
                      <td>Complete system outage or users cannot access the platform.</td>
                      <td><strong>Immediate (0-15 min)</strong></td>
                      <td>Engineers work continuously until service is restored.</td>
                    </tr>
                    <tr>
                      <td className="priority-badge">
                        <span className="icon">🟠</span> High
                      </td>
                      <td>Essential functions such as Deceased Registration, Billing, Dispatch, or Body Management are unavailable.</td>
                      <td><strong>Within 15 minutes</strong></td>
                      <td><strong>Within 1 hour</strong></td>
                    </tr>
                    <tr>
                      <td className="priority-badge">
                        <span className="icon">🟡</span> Medium
                      </td>
                      <td>Non-critical feature affected with an available workaround.</td>
                      <td><strong>Within 1 hour</strong></td>
                      <td><strong>Within 4 business hours</strong></td>
                    </tr>
                    <tr>
                      <td className="priority-badge">
                        <span className="icon">🟢</span> Low
                      </td>
                      <td>Minor issues, cosmetic defects, reports, or enhancement requests.</td>
                      <td><strong>Within 4 business hours</strong></td>
                      <td><strong>Within 3 business days</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>

          {/* Our Promise */}
          <Reveal delay={250}>
            <div className="section">
              <h2>Our Promise</h2>
              <p>
                At RestPoint, reliability is not a feature—it is a responsibility.
              </p>
              <p>
                We understand that when our system is unavailable, your work does not simply slow down—it can
                affect the smooth operation of your entire organization. That is why we invest in resilient
                infrastructure, proactive monitoring, rapid incident response, and continuous improvements to
                deliver the dependable service you expect.
              </p>
              <p>
                Our <strong>PM2 cluster deployment architecture</strong> ensures that system updates and
                maintenance occur without any service interruption. New code is deployed seamlessly while
                existing operations continue uninterrupted, guaranteeing zero downtime during updates.
              </p>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="highlight-box">
              <p>
                Every update we release, every improvement we make, and every support request we answer is
                guided by one principle:
              </p>
              <p style={{ marginTop: '0.75rem', fontWeight: 500 }}>
                "Your operations should never have to stop because of your software."
              </p>
              <p style={{ marginTop: '0.75rem' }}>
                Through our <strong>zero-downtime deployment architecture</strong>, we ensure that software
                updates, maintenance, and improvements happen seamlessly—without interrupting your critical
                mortuary operations. Your staff can continue their work without interruption, even during
                system updates.
              </p>
            </div>
          </Reveal>

          {/* Contact */}
          <Reveal delay={350}>
            <h2>SLA Questions?</h2>
            <div className="contact-box">
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                Questions about uptime, zero-downtime deployments, incidents, or maintenance schedules?
              </p>
              <p style={{ margin: '0.5rem 0 0 0' }}>
                Email us at{' '}
                <a href="mailto:support@restpoint.co.ke" style={{ color: C.brassLight, textDecoration: 'none' }}>
                  support@restpoint.co.ke
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
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy Policy</a>
              <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms of Service</a>
              <a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact</a>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
