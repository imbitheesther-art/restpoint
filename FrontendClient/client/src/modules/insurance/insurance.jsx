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
        { label: 'Security Policy', onClick: () => navigate('/security') },
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

/* ---------- Insurance Providers Display ---------- */
const MockInsuranceEngine = () => {
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
                <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brass, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>INTEGRATED INSURANCE PROVIDERS</div>
                <div style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.bone, marginBottom: '0.4rem' }}>Trusted Partners</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(250,248,244,0.6)' }}>Working with leading insurance companies</div>
            </div>

            <div style={{ borderTop: `1px solid rgba(250,248,244,0.14)`, paddingTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {[
                    { name: 'Old Mutual', plan: 'Funeral Cover' },
                    { name: 'CIC Insurance', plan: 'Group Standard Plan' },
                    { name: 'Britam', plan: 'Jamii Premium' },
                    { name: 'Sanlam', plan: 'Corporate Assurance' }
                ].map((insurer, idx) => (
                    <div key={idx} style={{
                        background: 'rgba(250,248,244,0.05)',
                        padding: '1rem',
                        borderRadius: '4px',
                        border: `1px solid ${C.verdigrisLight}`
                    }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: C.bone, marginBottom: '0.2rem' }}>{insurer.name}</div>
                        <div style={{ fontSize: '0.75rem', color: C.grayLight }}>{insurer.plan}</div>
                    </div>
                ))}
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
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', letterSpacing: '0.12em', color: C.brass, textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>FUNERAL INSURANCE MADE SIMPLE</div>
                            <h1>Easing the burden when families need it most.</h1>
                            <p style={{ fontSize: '1.1rem', marginBottom: '2.2rem', maxWidth: '540px' }}>
                                We understand the <strong>financial strain</strong> families go through when they lose a loved one  there's also a <strong>technology gap</strong> in this space that we are solving. That's why we're introducing a <strong>digital portal</strong> that helps funeral homes offer families a better way buy plans, <strong>pay directly from their phones using STK push</strong>, add dependents, and <strong>track contributions in real-time</strong>. No more chasing payments or wondering where things stand.
                            </p>

                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
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
                                    <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brass, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>FOR FUNERAL HOMES</div>
                                    <div style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.bone, marginBottom: '0.4rem' }}>Complete Insurance Management</div>
                                    <div style={{ fontSize: '0.78rem', color: 'rgba(250,248,244,0.6)' }}>Everything you need in one platform</div>
                                </div>
                                <div style={{ borderTop: `1px solid rgba(250,248,244,0.14)`, paddingTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    <div style={{ background: 'rgba(250,248,244,0.05)', padding: '1rem', borderRadius: '4px', border: `1px solid ${C.verdigrisLight}` }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: C.bone, marginBottom: '0.2rem' }}>Family Portal</div>
                                        <div style={{ fontSize: '0.75rem', color: C.grayLight }}>Secure registration & management</div>
                                    </div>
                                    <div style={{ background: 'rgba(250,248,244,0.05)', padding: '1rem', borderRadius: '4px', border: `1px solid ${C.verdigrisLight}` }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: C.bone, marginBottom: '0.2rem' }}>Real-Time Dashboard</div>
                                        <div style={{ fontSize: '0.75rem', color: C.grayLight }}>Track collections & claims live</div>
                                    </div>
                                    <div style={{ background: 'rgba(250,248,244,0.05)', padding: '1rem', borderRadius: '4px', border: `1px solid ${C.verdigrisLight}` }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: C.bone, marginBottom: '0.2rem' }}>Claims Processing</div>
                                        <div style={{ fontSize: '0.75rem', color: C.grayLight }}>Streamlined & automated</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Key Benefits ---------- */}
            <section style={{ borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, background: C.bone, padding: '4rem 0' }}>
                <div className="wrap">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: C.brass, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>WHY CHOOSE US</div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Everything you need in one platform</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: `1px solid ${C.line}` }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(61,79,71,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                <Shield size={24} color={C.verdigris} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Secure Family Portal</h3>
                            <p style={{ fontSize: '0.9rem' }}>Families register securely, add dependents, and manage their funeral cover online anytime, anywhere.</p>
                        </div>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: `1px solid ${C.line}` }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(61,79,71,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                <Activity size={24} color={C.verdigris} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Real-Time Tracking</h3>
                            <p style={{ fontSize: '0.9rem' }}>Families see their contributions grow in real-time. Staff monitor collections, claims, and processing instantly.</p>
                        </div>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: `1px solid ${C.line}` }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(61,79,71,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                <Layers size={24} color={C.verdigris} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Complete Dashboard</h3>
                            <p style={{ fontSize: '0.9rem' }}>Staff get a powerful dashboard with real-time collections, claims processing, and document management all in one place.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- How It Works ---------- */}
            <section style={{ padding: '6rem 0', background: C.bone }}>
                <div className="wrap">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: C.brass, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>HOW IT WORKS</div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Simple, transparent, and fast</h2>
                        <p style={{ fontSize: '1rem', color: C.gray, maxWidth: '600px', margin: '0 auto' }}>From registration to claims, everything is streamlined for families and funeral homes.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '64px', height: '64px', background: C.verdigris, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: C.bone, fontSize: '1.5rem', fontWeight: 600 }}>1</div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Register Online</h3>
                            <p style={{ fontSize: '0.9rem' }}>Families sign up securely through the portal and add their dependents in minutes.</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '64px', height: '64px', background: C.verdigris, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: C.bone, fontSize: '1.5rem', fontWeight: 600 }}>2</div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Make Contributions</h3>
                            <p style={{ fontSize: '0.9rem' }}>Track contributions in real-time. Watch savings grow with full transparency.</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '64px', height: '64px', background: C.verdigris, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: C.bone, fontSize: '1.5rem', fontWeight: 600 }}>3</div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Submit Claims</h3>
                            <p style={{ fontSize: '0.9rem' }}>When needed, submit claims digitally with all documents attached. Fast and hassle-free.</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '64px', height: '64px', background: C.brass, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: C.bone, fontSize: '1.5rem', fontWeight: 600 }}>4</div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Get Paid Fast</h3>
                            <p style={{ fontSize: '0.9rem' }}>Claims are verified and processed quickly. Families get support when they need it most.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- For Funeral Homes ---------- */}
            <section style={{ padding: '5rem 0', background: C.verdigrisDark, color: C.bone }}>
                <div className="wrap">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: C.brass, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>FOR FUNERAL HOMES</div>
                        <h2 style={{ color: C.bone, marginBottom: '1rem' }}>Powerful tools for your team</h2>
                        <p style={{ color: C.grayLight, fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>Everything you need to manage insurance operations efficiently.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        <div style={{ background: 'rgba(250,248,244,0.05)', padding: '2rem', borderRadius: '8px', border: `1px solid ${C.verdigrisLight}` }}>
                            <Activity size={32} color={C.brass} style={{ marginBottom: '1rem' }} />
                            <h3 style={{ color: C.bone, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Real-Time Dashboard</h3>
                            <p style={{ color: C.grayLight, fontSize: '0.9rem' }}>Monitor collections, claims, and processing status in real-time. Make informed decisions with live data.</p>
                        </div>
                        <div style={{ background: 'rgba(250,248,244,0.05)', padding: '2rem', borderRadius: '8px', border: `1px solid ${C.verdigrisLight}` }}>
                            <Layers size={32} color={C.brass} style={{ marginBottom: '1rem' }} />
                            <h3 style={{ color: C.bone, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Document Management</h3>
                            <p style={{ color: C.grayLight, fontSize: '0.9rem' }}>Upload, track, and manage all insurance documents in one secure location. Never lose paperwork again.</p>
                        </div>
                        <div style={{ background: 'rgba(250,248,244,0.05)', padding: '2rem', borderRadius: '8px', border: `1px solid ${C.verdigrisLight}` }}>
                            <DollarSign size={32} color={C.brass} style={{ marginBottom: '1rem' }} />
                            <h3 style={{ color: C.bone, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Claims Processing</h3>
                            <p style={{ color: C.grayLight, fontSize: '0.9rem' }}>Streamline claims from submission to payout. Automated workflows reduce processing time significantly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Footer Section ---------- */}
            <Footer />
        </>
    );
}