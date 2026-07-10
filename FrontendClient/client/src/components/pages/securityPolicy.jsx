import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function SecurityPolicy() {
    const navigate = useNavigate();
    const goHome = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); };

    const pillars = [
        {
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            ),
            title: 'Data Encryption at Rest',
            desc: 'Full storage volumes leverage industry-standard cryptographic encryption at rest, keeping records unreadable to unauthorized hardware targets.',
        },
        {
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            ),
            title: 'Multi-Tenant Isolation',
            desc: 'Database level boundaries ensure each tenant operates their own isolated database instance. Cross-tenant parameters cannot intersect.',
        },
        {
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
            ),
            title: 'Family Data Masking',
            desc: 'Sensitive family records and kinship details undergo strict field-level data masking to protect privacy across generalized dashboards.',
        },
        {
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
            title: 'Rate Limiting',
            desc: 'Aggressive application and network layer rate limiting prevents API brute forcing and localized traffic amplification vectors.',
        },
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
                code { font-family: 'JetBrains Mono', monospace; font-size: 0.85em; background: ${C.bone2}; padding: 0.15em 0.4em; border-radius: 4px; }

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
                .section-divider {
                    height: 1px; background: ${C.line}; margin: 3rem 0;
                }

                .section-label {
                    display: inline-flex; align-items: center; gap: 0.6rem;
                    margin-bottom: 1.5rem;
                }
                .section-label-line {
                    width: 24px; height: 1px; background: ${C.line};
                }

                /* ── Pillar Cards ── */
                .pillar-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    margin: 2rem 0;
                }
                .pillar-card {
                    background: ${C.white};
                    border: 1px solid ${C.line};
                    border-radius: 14px;
                    padding: 1.6rem;
                    transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
                    position: relative; overflow: hidden;
                }
                .pillar-card::before {
                    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
                    background: linear-gradient(90deg, transparent, ${C.brass}, transparent);
                    opacity: 0; transition: opacity 0.4s ease;
                }
                .pillar-card:hover {
                    border-color: rgba(139,115,85,0.3);
                    transform: translateY(-4px);
                    box-shadow: 0 12px 32px -8px rgba(139,115,85,0.12), 0 0 0 1px rgba(139,115,85,0.08);
                }
                .pillar-card:hover::before { opacity: 1; }
                .pillar-icon {
                    width: 44px; height: 44px; border-radius: 11px;
                    background: ${C.bone2}; color: ${C.brass};
                    display: flex; align-items: center; justify-content: center;
                    margin-bottom: 1.1rem; transition: all 0.4s ease;
                }
                .pillar-card:hover .pillar-icon {
                    background: ${C.brass}; color: ${C.bone};
                    box-shadow: 0 4px 16px rgba(139,115,85,0.25);
                }
                .pillar-title {
                    font-family: 'Inter', sans-serif; font-size: 0.95rem; font-weight: 600;
                    color: ${C.ink}; margin-bottom: 0.45rem; letter-spacing: -0.01em;
                }
                .pillar-desc { font-size: 0.88rem; color: ${C.gray}; line-height: 1.65; margin: 0; }

                /* ── Sub-sections ── */
                .sub-section { margin-top: 2rem; }
                .sub-section h3 {
                    font-family: 'Inter', sans-serif; font-size: 0.95rem; font-weight: 600;
                    color: ${C.ink}; margin-bottom: 0.6rem; letter-spacing: -0.01em;
                    display: flex; align-items: center; gap: 0.6rem;
                }
                .sub-section h3::before {
                    content: ''; width: 6px; height: 6px; border-radius: 50%;
                    background: ${C.verdigris}; flex-shrink: 0;
                }

                /* ── Lists ── */
                .styled-list { padding-left: 0; list-style: none; margin: 1rem 0; }
                .styled-list li {
                    padding: 1rem 1rem 1rem 1.5rem;
                    position: relative; font-size: 0.93rem; line-height: 1.7;
                    border-left: 2px solid ${C.line};
                    margin-bottom: 0;
                }
                .styled-list li + li { margin-top: 0.5rem; }
                .styled-list li::before {
                    content: ''; position: absolute; left: -5px; top: 1.15rem;
                    width: 8px; height: 8px; border-radius: 50%;
                    background: ${C.bone}; border: 2px solid ${C.verdigris};
                }

                /* ── Commitment Box ── */
                .commitment-box {
                    background: ${C.verdigrisDark};
                    border-radius: 16px; padding: clamp(2rem, 3vw, 2.5rem);
                    margin: 3rem 0; position: relative; overflow: hidden;
                }
                .commitment-box::before {
                    content: ''; position: absolute; inset: 0;
                    background-image: radial-gradient(rgba(250,248,244,0.04) 1px, transparent 1px);
                    background-size: 24px 24px; pointer-events: none;
                }
                .commitment-box::after {
                    content: ''; position: absolute; top: -80px; right: -80px;
                    width: 250px; height: 250px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(61,79,71,0.25) 0%, transparent 60%);
                    pointer-events: none;
                }
                .commitment-box > * { position: relative; z-index: 1; }
                .commitment-box h3 { color: ${C.bone}; font-size: 1.15rem; margin-bottom: 0.8rem; }
                .commitment-box h3::before { background: rgba(250,248,244,0.4) !important; }
                .commitment-box p { color: rgba(250,248,244,0.65); font-size: 0.93rem; margin-bottom: 0; }
                .commitment-box strong { color: rgba(250,248,244,0.85); }
                .commitment-accent {
                    position: absolute; top: 0; left: 0; right: 0; height: 3px;
                    background: linear-gradient(90deg, ${C.verdigrisLight}, ${C.brass}, ${C.verdigrisLight});
                    background-size: 200% 100%; animation: grad-shift 4s ease infinite;
                }

                /* ── Contact Box ── */
                .contact-box {
                    background: ${C.white}; border: 1px solid ${C.line};
                    border-radius: 14px; padding: clamp(1.8rem, 3vw, 2.2rem);
                    margin: 2rem 0; position: relative; overflow: hidden;
                }
                .contact-box::before {
                    content: ''; position: absolute; top: 0; left: 0; bottom: 0;
                    width: 4px; background: linear-gradient(180deg, ${C.verdigris}, ${C.brass});
                    border-radius: 4px 0 0 4px;
                }
                .contact-box p { margin-bottom: 0.5rem; }
                .contact-email {
                    color: ${C.brass}; text-decoration: none; font-weight: 500;
                    transition: color 0.2s; position: relative;
                }
                .contact-email::after {
                    content: ''; position: absolute; bottom: -2px; left: 0;
                    width: 0; height: 1px; background: ${C.brassLight};
                    transition: width 0.3s ease;
                }
                .contact-email:hover { color: ${C.brassLight}; }
                .contact-email:hover::after { width: 100%; }
                .contact-note { font-size: 0.82rem; color: ${C.grayDark}; opacity: 0.7; margin-top: 0.6rem !important; }

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
                    .nav-links { display: none; }
                    .pillar-grid { grid-template-columns: 1fr; }
                    .policy-footer { flex-direction: column; align-items: flex-start; }
                    .footer-links { width: 100%; }
                    .footer-link { flex: 1; text-align: center; justify-content: center; }
                }
            `}</style>

            <nav id="policy-nav">
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
                                Policy · Infrastructure Security
                            </span>
                            <h1>Security Policy</h1>
                            <p className="subtitle">
                                How we protect sensitive operations, safeguard deceased records, and maintain rigorous baseline architectures.
                            </p>
                        </Reveal>
                    </div>
                </div>

                {/* ════ Content ════ */}
                <div className="content-area">
                    <div className="wrap">

                        {/* Core Philosophy */}
                        <Reveal>
                            <div className="section">
                                <div className="section-label">
                                    <div className="section-label-line" />
                                    <span className="label">Philosophy</span>
                                </div>
                                <h2>Data Sovereignty & Dignity</h2>
                                <p>
                                    Managing mortuary operations, digital identity tags, chain-of-custody ledgers, and billing information requires strict data defense paradigms. RestPoint treats system security not merely as compliance, but as an operational necessity.
                                </p>
                                <p>
                                    Our structural protocols ensure data remains heavily isolated, audit trails are strictly immutable, and access tiers are aggressively structured.
                                </p>
                            </div>
                        </Reveal>

                        <div className="section-divider" />

                        {/* Core Pillars */}
                        <Reveal delay={100}>
                            <div className="section">
                                <div className="section-label">
                                    <div className="section-label-line" />
                                    <span className="label">Core Pillars</span>
                                </div>
                                <h2>Security Foundations</h2>
                                <div className="pillar-grid">
                                    {pillars.map((p, i) => (
                                        <div className="pillar-card" key={i}>
                                            <div className="pillar-icon">{p.icon}</div>
                                            <div className="pillar-title">{p.title}</div>
                                            <p className="pillar-desc">{p.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Reveal>

                        <div className="section-divider" />

                        {/* Infrastructure Protection */}
                        <Reveal delay={150}>
                            <div className="section">
                                <div className="section-label">
                                    <div className="section-label-line" />
                                    <span className="label">Perimeter</span>
                                </div>
                                <h2>Network & Perimeter Defense</h2>

                                <div className="sub-section">
                                    <h3>Cloudflare Tunnel & Firewalls</h3>
                                    <p>
                                        All public routes route through enterprise network filters and native firewalls. Using <strong>cloudflared</strong> tunnels, internal application ports remain completely invisible to the open internet, restricting inbound traffic strictly to verified edge requests.
                                    </p>
                                </div>

                                <div className="sub-section">
                                    <h3>Brute-Force Prevention via Fail2ban</h3>
                                    <p>
                                        Automated connection logs are monitored seamlessly by <strong>fail2ban</strong> protection systems. Infrastructure endpoints instantly block hosts displaying anomalous automated patterns or systemic login failures.
                                    </p>
                                </div>

                                <div className="sub-section">
                                    <h3>Application Vulnerability Mitigation (XSS & Injection)</h3>
                                    <p>
                                        The application core enforces strict data validation schemas to safeguard input routes. Contextual encoding patterns protect operational portals against Cross-Site Scripting (XSS) and database level manipulation vulnerabilities.
                                    </p>
                                </div>
                            </div>
                        </Reveal>

                        <div className="section-divider" />

                        {/* Secrets */}
                        <Reveal delay={200}>
                            <div className="section">
                                <div className="section-label">
                                    <div className="section-label-line" />
                                    <span className="label">Authentication</span>
                                </div>
                                <h2>Secrets & Authentication Management</h2>
                                <p>
                                    We approach access paths and internal configurations through an explicit minimal footprint strategy:
                                </p>
                                <ul className="styled-list">
                                    <li><strong>Cryptographically Salted Passwords:</strong> Access credentials are processed via rigorous one-way hashing models alongside unique, randomized salts. Passwords are never stored or logged in plain text.</li>
                                    <li><strong>Isolated .env Secret Keys:</strong> Environment level configurations, encryption strings, and webhook secrets live inside strictly locked <code>.env</code> key arrays, decoupled completely from the application build source.</li>
                                </ul>
                            </div>
                        </Reveal>

                        {/* Commitment Box */}
                        <Reveal delay={250}>
                            <div className="commitment-box">
                                <div className="commitment-accent" />
                                <h3>Incident Response Commitment</h3>
                                <p>
                                    If a potential vulnerability layer or unsanctioned system data shift is flagged, our infrastructure response protocol mobilizes instantly. Operational engineering teams isolate anomalous traffic signatures immediately, establishing containment controls and detailing mitigation parameters.
                                </p>
                            </div>
                        </Reveal>

                        <div className="section-divider" />

                        {/* Contact */}
                        <Reveal delay={300}>
                            <div className="section">
                                <div className="section-label">
                                    <div className="section-label-line" />
                                    <span className="label">Contact</span>
                                </div>
                                <h2>Disclosures & Inquiries</h2>
                                <div className="contact-box">
                                    <p>
                                        Have you identified a potential risk profile or require clarification regarding enterprise infrastructure configurations?
                                    </p>
                                    <p>
                                        Reach our response desk directly at{' '}
                                        <a href="mailto:security@restpoint.co.ke" className="contact-email">
                                            security@restpoint.co.ke
                                        </a>
                                    </p>
                                    <p className="contact-note">
                                        Vulnerability reports receive high-priority engineer reviews within 24 hours.
                                    </p>
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
                const nav = document.getElementById('policy-nav');
                window.addEventListener('scroll', () => {
                    nav.classList.toggle('scrolled', window.scrollY > 50);
                }, { passive: true });
            `}</script>
        </>
    );
}