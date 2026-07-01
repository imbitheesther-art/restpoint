import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronDown,
    Shield,
    Check,
    ArrowRight,
    Menu,
    Activity,
    Layers,
    Cpu,
    Clock,
    DollarSign,
    AlertCircle
} from 'lucide-react';
import Footer from '../../components/layout/Footer';

/* ============================================================
   REST POINT — Funeral home operating system
   Design direction: enterprise-grade, dignified, ledger-inspired.
   Palette: ink, bone, brass, verdigris.
   ============================================================ */

const C = {
    ink: '#15171A',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    brassLight: '#A98F6E',
    verdigris: '#3D4F47',
    verdigrisDark: '#2E3F37',
    verdigrisLight: '#4D6359',
    verdigrisTint: '#EBEFEF',
    line: '#E3DDD0',
    lineDark: 'rgba(250,248,244,0.14)',
    gray: '#6B6862',
    grayLight: 'rgba(250,248,244,0.62)',
    accent: '#C77B5E',
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
const Mark = ({ size = 28, color = C.verdigris }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="1" />
        <path d="M16 8.5V23.5M9.5 16H22.5" stroke={color} strokeWidth="1" />
        <circle cx="16" cy="16" r="2.5" fill={color} />
    </svg>
);

/* ---------- Policy Dropdown ---------- */
const PolicyDropdown = ({ navigate, goTerms }) => {
    const [open, setOpen] = useState(false);

    const policies = [
        { label: 'Terms of Service', onClick: goTerms },
        { label: 'Privacy Policy', onClick: () => navigate('/privacy') },
        { label: 'Data Migration Policy', onClick: () => navigate('/data-migration') },
        { label: 'SLA Policy', onClick: () => navigate('/sla') },
        { label: 'Release Notes', onClick: () => navigate('/releases') },
        { label: 'Account Deletion', onClick: () => navigate('/account-deletion') },
    ];

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                className="nav-link"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
                Policies
                <ChevronDown
                    size={14}
                    style={{
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                    }}
                />
            </button>
            {open && (
                <div
                    style={{
                        position: 'absolute', top: '100%', left: 0,
                        background: C.ink, border: `1px solid ${C.line}`,
                        borderRadius: '2px', minWidth: '240px', marginTop: '0.5rem',
                        zIndex: 1000, boxShadow: '0 10px 30px rgba(21,23,26,0.2)',
                    }}
                >
                    {policies.map((policy, idx) => (
                        <button
                            key={idx}
                            onClick={() => { policy.onClick(); setOpen(false); }}
                            style={{
                                width: '100%', padding: '0.8rem 1.1rem', background: 'none',
                                border: 'none', textAlign: 'left', cursor: 'pointer',
                                fontSize: '0.85rem', color: C.grayLight,
                                borderBottom: idx < policies.length - 1 ? `1px solid ${C.lineDark}` : 'none',
                                transition: 'background 0.2s, color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = `rgba(250,248,244,0.08)`;
                                e.target.style.color = C.bone;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'none';
                                e.target.style.color = C.grayLight;
                            }}
                        >
                            {policy.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ---------- Mobile Menu ---------- */
const MobileMenu = ({ navigate, goTerms, goLogin, goStart }) => {
    const [open, setOpen] = useState(false);

    const policies = [
        { label: 'Terms of Service', onClick: goTerms },
        { label: 'Privacy Policy', onClick: () => navigate('/privacy') },
        { label: 'Data Migration Policy', onClick: () => navigate('/data-migration') },
        { label: 'SLA Policy', onClick: () => navigate('/sla') },
        { label: 'Release Notes', onClick: () => navigate('/releases') },
        { label: 'Account Deletion', onClick: () => navigate('/account-deletion') },
    ];

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                className="nav-link"
                style={{ display: 'flex', alignItems: 'center', padding: '0.75rem' }}
            >
                <Menu size={22} />
            </button>
            {open && (
                <div
                    style={{
                        position: 'absolute', top: '100%', right: 0,
                        background: C.ink, border: `1px solid ${C.line}`,
                        borderRadius: '2px', minWidth: '220px', marginTop: '0.5rem',
                        zIndex: 1000, boxShadow: '0 10px 30px rgba(21,23,26,0.2)',
                    }}
                >
                    <button onClick={() => { navigate('/'); setOpen(false); }} style={{ width: '100%', padding: '0.8rem 1.1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: C.grayLight, borderBottom: `1px solid ${C.lineDark}` }}>Home</button>
                    <button onClick={() => { navigate('/about'); setOpen(false); }} style={{ width: '100%', padding: '0.8rem 1.1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: C.grayLight, borderBottom: `1px solid ${C.lineDark}` }}>About</button>
                    <div style={{ padding: '0.5rem 0', borderBottom: `1px solid ${C.lineDark}` }}>
                        <div style={{ padding: '0.4rem 1.1rem', fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', color: C.brass, opacity: 0.7 }}>Policies</div>
                        {policies.map((policy, idx) => (
                            <button key={idx} onClick={() => { policy.onClick(); setOpen(false); }} style={{ width: '100%', padding: '0.6rem 1.1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', color: C.grayLight, borderBottom: idx < policies.length - 1 ? `1px solid ${C.lineDark}` : 'none' }}>{policy.label}</button>
                        ))}
                    </div>
                    <button onClick={() => { goLogin(); setOpen(false); }} style={{ width: '100%', padding: '0.8rem 1.1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: C.grayLight, borderBottom: `1px solid ${C.lineDark}` }}>Log in</button>
                    <button onClick={() => { goStart(); setOpen(false); }} style={{ width: '100%', padding: '0.8rem 1.1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: C.grayLight }}>Request access</button>
                </div>
            )}
        </div>
    );
};

/* ---------- Interactive Claim Simulator Component ---------- */
const MockInsuranceEngine = () => {
    const [provider, setProvider] = useState('Old Mutual');
    const [status, setStatus] = useState('Idle');
    const [coverageAmount, setCoverageAmount] = useState(350000);

    const triggerVerification = () => {
        setStatus('Verifying');
        setTimeout(() => {
            setStatus('Approved');
        }, 2200);
    };

    return (
        <div style={{
            background: C.verdigrisDark,
            border: `1px solid ${C.verdigrisLight}`,
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            borderRadius: '2px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        }}>
            <div style={{ marginBottom: '1.4rem' }}>
                <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brass, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>INTEGRATED ASSURANCE ENGINE</div>
                <div style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.bone, marginBottom: '0.4rem' }}>Real-time Policy Matching</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(250,248,244,0.6)' }}>Bridge the gap between funeral home ledgers & carriers.</div>
            </div>

            <div style={{ borderTop: `1px solid rgba(250,248,244,0.14)`, paddingTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", color: C.brassLight, marginBottom: '0.4rem' }}>SELECT UNDERWRITER</label>
                    <select
                        value={provider}
                        onChange={(e) => { setProvider(e.target.value); setStatus('Idle'); }}
                        style={{ width: '100%', background: C.ink, border: `1px solid ${C.verdigrisLight}`, color: C.bone, padding: '0.6rem', fontSize: '0.85rem', outline: 'none' }}
                    >
                        <option value="Old Mutual">Old Mutual Funeral Cover</option>
                        <option value="CIC Insurance">CIC Group Standard Plan</option>
                        <option value="Britam">Britam Jamii Premium</option>
                        <option value="Sanlam">Sanlam Corporate Assurance</option>
                    </select>
                </div>

                <div>
                    <div style={{ display: 'flex', justifyWith: 'space-between', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", color: C.brassLight, marginBottom: '0.4rem' }}>
                        <span>ASSURED CAP</span>
                        <span style={{ color: C.bone }}>KES {coverageAmount.toLocaleString()}</span>
                    </div>
                    <input
                        type="range" min="100000" max="1000000" step="50000"
                        value={coverageAmount}
                        onChange={(e) => { setCoverageAmount(Number(e.target.value)); setStatus('Idle'); }}
                        style={{ width: '100%', height: '2px', background: 'rgba(250,248,244,0.2)', outline: 'none', cursor: 'pointer' }}
                    />
                </div>

                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderLeft: `2px solid ${status === 'Approved' ? C.accent : status === 'Verifying' ? C.brass : C.lineDark}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: C.grayLight }}>Claim Status</span>
                        <span style={{
                            fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", padding: '0.2rem 0.6rem',
                            background: status === 'Approved' ? 'rgba(199,123,94,0.2)' : status === 'Verifying' ? 'rgba(139,115,85,0.2)' : 'rgba(250,248,244,0.05)',
                            color: status === 'Approved' ? C.accent : status === 'Verifying' ? C.brassLight : C.grayLight
                        }}>
                            {status === 'Idle' ? 'READY TO DISPATCH' : status === 'Verifying' ? 'SWIFT DISPATCH ROUTING...' : 'DISPATCH ACKNOWLEDGED'}
                        </span>
                    </div>
                    {status === 'Approved' && (
                        <div style={{ fontSize: '0.78rem', color: C.bone, marginTop: '0.6rem', lineHeight: '1.4' }}>
                            ✓ Guarantee of Payment generated against {provider}. KES {Math.round(coverageAmount * 0.4).toLocaleString()} liquidity advance cleared for inmediato payouts.
                        </div>
                    )}
                </div>

                <button
                    onClick={triggerVerification}
                    disabled={status !== 'Idle'}
                    style={{
                        width: '100%', padding: '0.75rem', background: status === 'Approved' ? C.verdigrisLight : C.brass,
                        border: 'none', color: C.bone, fontSize: '0.8rem', fontWeight: 500,
                        cursor: status !== 'Idle' ? 'default' : 'pointer', fontFamily: "'JetBrains Mono', monospace",
                        transition: 'background 0.2s'
                    }}
                >
                    {status === 'Idle' ? 'Test Instant Verification' : status === 'Verifying' ? 'Querying API Gateways...' : 'Verification Complete'}
                </button>
            </div>
        </div>
    );
};

export default function InsurancePage() {
    const [loaded, setLoaded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 60);
        return () => clearTimeout(t);
    }, []);

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
        h1 { font-size: clamp(2.6rem, 6vw, 4.2rem); line-height: 1.1; margin-bottom: 1.4rem; }
        h2 { font-size: clamp(1.8rem, 4vw, 2.4rem); line-height: 1.2; }
        h3 { font-size: 1.25rem; margin-bottom: 0.6rem; color: ${C.ink}; }
        p { line-height: 1.75; font-size: 1rem; color: ${C.gray}; }

        .wrap { max-width: 1140px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2.5rem); }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          background: rgba(250,248,244,0.96); backdrop-filter: blur(12px);
          border-bottom: 1px solid ${C.line}; padding: 1.2rem 0;
        }
        .nav-wrap { display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 0.7rem; font-family: 'Fraunces', serif; font-size: 1.25rem; font-weight: 500; color: ${C.ink}; cursor: pointer; }
        .nav-links { display: flex; gap: 2.2rem; align-items: center; }
        .nav-link {
          font-size: 0.85rem; color: ${C.gray}; text-decoration: none; cursor: pointer;
          transition: color 0.2s; background: transparent; border: none; font-family: 'Inter', sans-serif;
        }
        .nav-link:hover { color: ${C.verdigris}; }
        .nav-cta { display: flex; gap: 0.75rem; }
        .mobile-nav { display: none; }
        @media (max-width: 800px) { 
          .nav-links { display: none; } 
          .nav-cta { display: none; }
          .mobile-nav { display: flex; gap: 0.5rem; align-items: center; }
        }

        .btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.85rem 1.8rem; font-size: 0.85rem; font-weight: 500;
          border: 1px solid transparent; border-radius: 2px;
          cursor: pointer; transition: all 0.25s ease; white-space: nowrap;
        }
        .btn-dark { background: ${C.ink}; color: ${C.bone}; }
        .btn-dark:hover { background: ${C.verdigris}; }
        .btn-line { background: transparent; color: ${C.ink}; border-color: ${C.ink}; }
        .btn-line:hover { background: ${C.ink}; color: ${C.bone}; }

        .grid-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2.5rem; margin-top: 3.5rem; }
        .metric-card {
          border-left: 1px solid ${C.line}; padding: 0.5rem 0 0.5rem 1.5rem;
        }
        .metric-num { font-family: 'JetBrains Mono', monospace; font-size: 2.2rem; color: ${C.verdigris}; font-weight: 500; margin-bottom: 0.2rem; }

        .feature-block {
          background: ${C.bone2}; border: 1px solid ${C.line}; padding: 2.5rem; border-radius: 2px;
          display: flex; flex-direction: column; justify-content: space-between;
        }
      `}</style>

            {/* ---------- Header Navigation ---------- */}
            <nav>
                <div className="wrap nav-wrap">
                    <div className="logo" onClick={() => navigate('/')}>
                        <Mark size={26} color={C.ink} />
                        <span>Rest Point</span>
                    </div>
                    <div className="nav-links">
                        <button onClick={() => navigate('/')} className="nav-link">Features</button>
                        <button onClick={() => navigate('/about')} className="nav-link">About Infrastructure</button>
                        <button onClick={() => navigate('/insurance')} className="nav-link" style={{ color: C.brass, fontWeight: 600 }}>Insurance Brokers</button>
                        <PolicyDropdown navigate={navigate} goTerms={goTerms} />
                    </div>
                    <div className="nav-cta">
                        <button onClick={goLogin} className="nav-link" style={{ paddingRight: '0.5rem' }}>Log in</button>
                        <button onClick={goStart} className="btn btn-dark">Request access</button>
                    </div>
                    <div className="mobile-nav">
                        <MobileMenu navigate={navigate} goTerms={goTerms} goLogin={goLogin} goStart={goStart} />
                    </div>
                </div>
            </nav>

            {/* ---------- Hero Section ---------- */}
            <section style={{ paddingTop: '160px', paddingBottom: '5rem', background: `linear-gradient(to bottom, ${C.bone} 0%, ${C.bone2} 100%)` }}>
                <div className="wrap">
                    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', letterSpacing: '0.12em', color: C.brass, textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>BROKERAGE INTEGRATION MODULE</div>
                            <h1>Bridge the Funeral Assurance Deficit.</h1>
                            <p style={{ fontSize: '1.1rem', marginBottom: '2.2rem', maxWidth: '540px' }}>
                                Rest Point found systemic liquidity caps averaging **KES 250k–900k per family ledger**. Our modular infrastructure turns funeral operating hubs into authorized assurance nodes, validating cover claims and unlocking immediate underwriter payouts.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button onClick={goStart} className="btn btn-dark">
                                    Integrate API Brokerage <ArrowRight size={14} />
                                </button>
                                <a href="#mechanics" className="btn btn-line">Read Ledger Specs</a>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <MockInsuranceEngine />
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Analytics / Discovery Metrics ---------- */}
            <section style={{ borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, background: C.bone, padding: '4rem 0' }}>
                <div className="wrap">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem' }}>
                        <div className="metric-card">
                            <div className="metric-num">KES 900K</div>
                            <p style={{ fontSize: '0.88rem', fontWeight: 500, color: C.ink }}>Maximum Cover Deficit Discovered</p>
                            <p style={{ fontSize: '0.8rem', color: C.gray, marginTop: '0.2rem' }}>Identified across regional family ledger balance audits.</p>
                        </div>
                        <div className="metric-card">
                            <div className="metric-num">&lt; 15 Min</div>
                            <p style={{ fontSize: '0.88rem', fontWeight: 500, color: C.ink }}>Claim Pipeline Verification</p>
                            <p style={{ fontSize: '0.8rem', color: C.gray, marginTop: '0.2rem' }}>Bypassing administrative phone tags via instant carrier endpoints.</p>
                        </div>
                        <div className="metric-card">
                            <div className="metric-num">0%</div>
                            <p style={{ fontSize: '0.88rem', fontWeight: 500, color: C.ink }}>Reconciliation Variances</p>
                            <p style={{ fontSize: '0.8rem', color: C.gray, marginTop: '0.2rem' }}>Automatic escrow matching from policy approval directly to active cases.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Technical Mechanics Architecture ---------- */}
            <section id="mechanics" style={{ padding: '6rem 0', background: C.bone }}>
                <div className="wrap">
                    <Reveal>
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: C.brass, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>LEDGER MECHANICS</div>
                            <h2>Unified Claims Processing. Architecture built for operational dignity.</h2>
                        </div>
                    </Reveal>

                    <div className="grid-cards">
                        <Reveal delay={100} className="feature-block">
                            <div>
                                <div style={{ color: C.verdigris, marginBottom: '1.2rem' }}><Shield size={28} strokeWidth={1.5} /></div>
                                <h3>Automated Policy Querying</h3>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Input national registry variables or coverage identifiers once. Rest Point connects with key underwriter database mirrors across East Africa to instantly index verified policy riders.
                                </p>
                            </div>
                        </Reveal>

                        <Reveal delay={200} className="feature-block">
                            <div>
                                <div style={{ color: C.verdigris, marginBottom: '1.2rem' }}><Layers size={28} strokeWidth={1.5} /></div>
                                <h3>Advanced Reconciliation</h3>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Eliminate spreadsheet discrepancies. Approved claim structures auto-inject directly into invoice parameters, distributing credit transparently across vault storage, mortuary management, and logistics items.
                                </p>
                            </div>
                        </Reveal>

                        <Reveal delay={300} className="feature-block">
                            <div>
                                <div style={{ color: C.verdigris, marginBottom: '1.2rem' }}><Cpu size={28} strokeWidth={1.5} /></div>
                                <h3>Underwriter Liquidity Dispatch</h3>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Bypass standard 48-hour cash retention loops. Rest Point issues digital guarantees of payment, allowing funeral homes to dispatch transport setups and secure permits with confirmed fiscal visibility.
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ---------- Carrier Ecosystem ---------- */}
            <section style={{ padding: '5rem 0', background: C.ink, color: C.bone }}>
                <div className="wrap">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: C.brassLight, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>CARRIER NETWORKS</div>
                            <h2 style={{ color: C.bone, marginBottom: '1.2rem' }}>Compatible Underwriter Standards</h2>
                            <p style={{ color: C.grayLight, fontSize: '0.95rem' }}>
                                Rest Point integrates seamlessly with standard corporate enterprise API platforms. If your underwriter uses legacy systems or manual claim channels, our operational clearing system provides automated template routing via secure file structures.
                            </p>
                        </div>
                        <div style={{ background: 'rgba(250,248,244,0.03)', border: `1px solid ${C.lineDark}`, padding: '2rem', borderRadius: '2px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { name: 'REST/JSON Direct API Connectors', desc: 'Real-time query endpoints for instant digital claim authorization loops.' },
                                    { name: 'ISO 20022 Financial Document Formats', desc: 'Secure message validation mapping directly into clearing networks.' },
                                    { name: 'Automated Secure SFTP Remittance Logs', desc: 'Nightly asynchronous parsing for legacy systems lacking active API connections.' }
                                ].map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '1rem', borderBottom: idx < 2 ? `1px solid ${C.lineDark}` : 'none', paddingBottom: idx < 2 ? '1rem' : '0' }}>
                                        <div style={{ color: C.brassLight, paddingTop: '0.2rem' }}><Check size={16} /></div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: C.bone, marginBottom: '0.2rem' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: C.grayLight }}>{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Footer Section ---------- */}
            <Footer />
        </>
    );
}