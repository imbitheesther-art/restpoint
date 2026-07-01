import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ============================================================
   REST POINT — Security Policy
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

export default function SecurityPolicy() {
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
        h3 { font-size: 1.1rem; line-height: 1.3; margin-top: 1.2rem; margin-bottom: 0.5rem; }
        p { line-height: 1.7; font-size: 0.95rem; margin-bottom: 1rem; }
        a { color: inherit; }

        .label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.74rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${C.brass};
        }

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

        ul { padding-left: 1.5rem; margin-bottom: 1rem; }
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
        .commitment-box p { color: ${C.bone}; line-height: 1.7; font-size: 0.95rem; margin-bottom: 0; }
        .commitment-box p + p { margin-top: 1rem; }
        .commitment-box strong { color: ${C.bone}; }

        .feature-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          padding: 1rem;
          background: ${C.bone2};
          border-radius: 4px;
          border-left: 3px solid ${C.brass};
        }
        .feature-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        .highlight-box {
          background: #fff;
          border: 1px solid ${C.line};
          border-left: 4px solid ${C.verdigris};
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
                        <li><a href="/security" onClick={(e) => { e.preventDefault(); navigate('/security'); }}>Security</a></li>
                        <li><a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact</a></li>
                    </ul>
                </div>
            </nav>

            <main>
                <div className="wrap">
                    <button className="back-btn" onClick={goHome}>← Back to Home</button>

                    <Reveal>
                        <div className="hero-header">
                            <span className="meta">POLICY · INFRASTRUCTURE SECURITY</span>
                            <h1>Security Policy</h1>
                            <p className="subtitle">
                                How we protect sensitive operations, safeguard deceased records, and maintain rigorous baseline architectures.
                            </p>
                        </div>
                    </Reveal>

                    {/* Core Philosophy */}
                    <Reveal delay={100}>
                        <div className="section">
                            <h2>Data Sovereignty & Dignity</h2>
                            <p>
                                Managing mortuary operations, digital identity tags, chain-of-custody ledgers, and billing information requires strict data defense paradigms. RestPoint treats system security not merely as compliance, but as an operational necessity.
                            </p>
                            <p>
                                Our structural protocols ensure data remains heavily isolated, audit trails are strictly immutable, and access tiers are aggressively structured.
                            </p>
                        </div>
                    </Reveal>

                    {/* Core Pillars Grid */}
                    <Reveal delay={150}>
                        <div className="feature-list">
                            <div className="feature-item">
                                <span className="feature-icon-container">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.brass} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </span>
                                <div>
                                    <strong>Data Encryption at Rest</strong>
                                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', opacity: 0.85 }}>
                                        Full storage volumes leverage industry-standard cryptographic encryption at rest, keeping records unreadable to unauthorized hardware targets.
                                    </p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon-container">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.brass} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    </svg>
                                </span>
                                <div>
                                    <strong>Multi-Tenant Isolation</strong>
                                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', opacity: 0.85 }}>
                                        Database level boundaries ensure each tenant operates their own isolated database instance. Cross-tenant parameters cannot intersect.
                                    </p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon-container">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.brass} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                </span>
                                <div>
                                    <strong>Family Data Masking</strong>
                                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', opacity: 0.85 }}>
                                        Sensitive family records and kinship details undergo strict field-level data masking to protect privacy across generalized dashboards.
                                    </p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon-container">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.brass} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                </span>
                                <div>
                                    <strong>Rate Limiting</strong>
                                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', opacity: 0.85 }}>
                                        Aggressive application and network layer rate limiting prevents API brute forcing and localized traffic amplification vectors.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    {/* Infrastructure Protection */}
                    <Reveal delay={200}>
                        <div className="section">
                            <h2>Network & Perimeter Defense</h2>
                            <h3>Cloudflare Tunnel & Firewalls</h3>
                            <p>
                                All public routes route through enterprise network filters and native firewalls. Using <strong>cloudflared</strong> tunnels, internal application ports remain completely invisible to the open internet, restricting inbound traffic strictly to verified edge requests.
                            </p>
                            <h3>Brute-Force Prevention via Fail2ban</h3>
                            <p>
                                Automated connection logs are monitored seamlessly by <strong>fail2ban</strong> protection systems. Infrastructure endpoints instantly block hosts displaying anomalous automated patterns or systemic login failures.
                            </p>
                            <h3>Application Vulnerability Mitigation (XSS & Injection)</h3>
                            <p>
                                The application core enforces strict data validation schemas to safeguard input routes. Contextual encoding patterns protect operational portals against Cross-Site Scripting (XSS) and database level manipulation vulnerabilities.
                            </p>
                        </div>
                    </Reveal>

                    {/* Environment and Passwords */}
                    <Reveal delay={250}>
                        <div className="section">
                            <h2>Secrets & Authentication Management</h2>
                            <p>
                                We approach access paths and internal configurations through an explicit minimal footprint strategy:
                            </p>
                            <ul>
                                <li><strong>Cryptographically Salted Passwords:</strong> Access credentials are processed via rigorous one-way hashing models alongside unique, randomized salts. Passwords are never stored or logged in plain text.</li>
                                <li><strong>Isolated .env Secret Keys:</strong> Environment level configurations, encryption strings, and webhook secrets live inside strictly locked <code>.env</code> key arrays, decoupled completely from the application build source.</li>
                            </ul>
                        </div>
                    </Reveal>

                    {/* Banner Statement */}
                    <Reveal delay={300}>
                        <div className="commitment-box">
                            <h3>Incident Response Commitment</h3>
                            <p>
                                If a potential vulnerability layer or unsanctioned system data shift is flagged, our infrastructure response protocol mobilizes instantly. Operational engineering teams isolate anomalous traffic signatures immediately, establishing containment controls and detailing mitigation parameters.
                            </p>
                        </div>
                    </Reveal>

                    {/* Report Path */}
                    <Reveal delay={350}>
                        <h2>Disclosures & Inquiries</h2>
                        <div className="contact-box">
                            <p style={{ margin: 0, fontSize: '0.95rem' }}>
                                Have you identified a potential risk profile or require clarification regarding enterprise infrastructure configurations?
                            </p>
                            <p style={{ margin: '0.5rem 0 0 0' }}>
                                Reach our response desk directly at:{' '}
                                <a href="mailto:security@restpoint.co.ke" style={{ color: C.brassLight, textDecoration: 'none', fontWeight: 500 }}>
                                    security@restpoint.co.ke
                                </a>
                            </p>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                                Vulnerability reports receive high-priority engineer reviews within 24 hours.
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