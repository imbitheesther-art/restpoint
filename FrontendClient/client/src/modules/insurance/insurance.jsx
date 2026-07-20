import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, Check, ArrowRight, X, ShieldCheck, Activity, Layers, DollarSign, Users, FileText, Zap } from '../../utils/icons/icons';
import Footer from '../../components/layout/Footer';

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

// Hook for scroll reveal animations
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
            transform: shown ? 'translateY(0)' : 'translateY(30px)',
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

const useOutsideClick = (ref, callback) => {
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) callback();
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [ref, callback]);
};

const PolicyDropdown = ({ navigate, goTerms }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useOutsideClick(ref, () => setOpen(false));

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
        <div ref={ref} style={{ position: 'relative' }}>
            <button onClick={() => setOpen(!open)} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Policies<ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
            </button>
            {open && (
                <div className="dropdown-menu">
                    {policies.map((p, i) => (
                        <button key={i} onClick={() => { p.onClick(); setOpen(false); }} className="dropdown-item">
                            {p.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const MobileMenu = ({ navigate, goTerms, goLogin, goStart }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useOutsideClick(ref, () => setOpen(false));

    const policies = [
        { label: 'Terms of Service', onClick: goTerms },
        { label: 'Privacy Policy', onClick: () => navigate('/privacy') },
        { label: 'Data Migration Policy', onClick: () => navigate('/data-migration') },
        { label: 'SLA Policy', onClick: () => navigate('/sla') },
        { label: 'Release Notes', onClick: () => navigate('/releases') },
        { label: 'Account Deletion', onClick: () => navigate('/account-deletion') },
    ];

    return (
        <div ref={ref} style={{ position: 'relative' }} className="mobile-nav">
            <button onClick={() => setOpen(!open)} className="nav-link" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                {open ? <X size={22} /> : <Menu size={22} />}
            </button>
            {open && (
                <div className="mobile-menu-container">
                    <button onClick={() => { navigate('/'); setOpen(false); }} className="mobile-link">Home</button>
                    <button onClick={() => { navigate('/about'); setOpen(false); }} className="mobile-link">About</button>
                    <button onClick={() => { navigate('/insurance'); setOpen(false); }} className="mobile-link" style={{ color: C.brass, fontWeight: 600 }}>Insurance Brokers</button>
                    <div className="mobile-policies-header">
                        <div className="mono-label" style={{ color: C.brass, padding: '0.6rem 1.2rem' }}>Policies</div>
                        {policies.map((p, i) => (
                            <button key={i} onClick={() => { p.onClick(); setOpen(false); }} className="mobile-link" style={{ paddingLeft: '2rem', fontSize: '0.82rem' }}>{p.label}</button>
                        ))}
                    </div>
                    <button onClick={() => { goLogin(); setOpen(false); }} className="mobile-link">Log in</button>
                    <button onClick={() => { goStart(); setOpen(false); }} className="mobile-link" style={{ color: C.verdigris, fontWeight: 600 }}>Request access</button>
                </div>
            )}
        </div>
    );
};

// High-fidelity App Window wrapper
const AppWindow = ({ title, children, dark = false }) => (
    <div className={`app-window ${dark ? 'dark' : 'light'}`}>
        <div className="window-header">
            <div style={{ display: 'flex', gap: '0.4rem' }}>
                <span className="window-dot" style={{ background: '#FF5F57' }}></span>
                <span className="window-dot" style={{ background: '#FEBC2E' }}></span>
                <span className="window-dot" style={{ background: '#28C840' }}></span>
            </div>
            <span className="window-title">{title}</span>
            <div style={{ width: '40px' }}></div>
        </div>
        <div className="window-body">{children}</div>
    </div>
);

const InsuranceMockup = () => (
    <div className="mock-inner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
                <div className="mono-label" style={{ color: C.brassLight }}>FUNERAL COVER</div>
                <div style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.bone, marginTop: '0.3rem' }}>Family Portal</div>
            </div>
            <div className="avatar" style={{ background: C.brass }}>JO</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-card">
                <Users size={16} color={C.brass} />
                <div className="stat-value">4</div>
                <div className="stat-label">Dependents</div>
            </div>
            <div className="stat-card">
                <ShieldCheck size={16} color={C.brass} />
                <div className="stat-value">150K</div>
                <div className="stat-label">Coverage</div>
            </div>
        </div>

        <div className="mock-list-header" style={{ color: C.grayLight, borderBottom: `1px solid ${C.lineDark}` }}>
            <span>Recent Contributions</span>
            <span>Status</span>
        </div>

        <div className="mock-row" style={{ borderBottom: `1px solid ${C.lineDark}` }}>
            <span style={{ color: C.bone, fontSize: '0.9rem' }}>March Premium</span>
            <span className="status-badge" style={{ color: C.bone, background: 'rgba(40,200,64,0.15)', border: '1px solid rgba(40,200,64,0.3)' }}>Paid</span>
        </div>
        <div className="mock-row" style={{ borderBottom: `1px solid ${C.lineDark}` }}>
            <span style={{ color: C.bone, fontSize: '0.9rem' }}>February Premium</span>
            <span className="status-badge" style={{ color: C.bone, background: 'rgba(40,200,64,0.15)', border: '1px solid rgba(40,200,64,0.3)' }}>Paid</span>
        </div>
        <div className="mock-row" style={{ borderBottom: 'none' }}>
            <span style={{ color: C.bone, fontSize: '0.9rem' }}>April Premium</span>
            <span className="status-badge" style={{ color: C.accent, background: 'rgba(199,123,94,0.15)', border: '1px solid rgba(199,123,94,0.3)' }}>Pending</span>
        </div>
    </div>
);

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

    const benefits = [
        { icon: ShieldCheck, title: 'Secure Family Portal', desc: 'Families register securely, add dependents, and manage their funeral cover online anytime, anywhere.' },
        { icon: Activity, title: 'Real-Time Tracking', desc: 'Families see their contributions grow in real-time. Staff monitor collections, claims, and processing instantly.' },
        { icon: Layers, title: 'Complete Dashboard', desc: 'Staff get a powerful dashboard with real-time collections, claims processing, and document management all in one place.' },
    ];

    const steps = [
        { num: '1', title: 'Register Online', desc: 'Families sign up securely through the portal and add their dependents in minutes.' },
        { num: '2', title: 'Make Contributions', desc: 'Track contributions in real-time. Watch savings grow with full transparency via STK push.' },
        { num: '3', title: 'Submit Claims', desc: 'When needed, submit claims digitally with all documents attached. Fast and hassle-free.' },
        { num: '4', title: 'Get Paid Fast', desc: 'Claims are verified and processed quickly. Families get support when they need it most.' },
    ];

    const teamFeatures = [
        { icon: Activity, title: 'Real-Time Dashboard', desc: 'Monitor collections, claims, and processing status in real-time. Make informed decisions with live data.' },
        { icon: FileText, title: 'Document Management', desc: 'Upload, track, and manage all insurance documents in one secure location. Never lose paperwork again.' },
        { icon: DollarSign, title: 'Claims Processing', desc: 'Streamline claims from submission to payout. Automated workflows reduce processing time significantly.' },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',sans-serif;color:${C.gray};background:${C.bone};-webkit-font-smoothing:antialiased}
        h1,h2,h3{font-family:'Fraunces',serif;font-weight:500;letter-spacing:-0.01em;color:${C.ink}}
        h1{font-size:clamp(2.5rem,6vw,4rem);line-height:1.1;margin-bottom:1.4rem}
        h2{font-size:clamp(1.9rem,4vw,2.5rem);line-height:1.2}
        h3{font-size:1.2rem;margin-bottom:0.6rem;color:${C.ink}}
        p{line-height:1.75;font-size:1rem;color:${C.gray}}
        a{color:inherit;text-decoration:none}
        
        .mono-label{font-family:'JetBrains Mono',monospace;font-size:0.7rem;letter-spacing:0.14em;text-transform:uppercase;color:${C.brass};font-weight:500}
        .label{font-family:'JetBrains Mono',monospace;font-size:0.74rem;letter-spacing:0.14em;text-transform:uppercase;color:${C.brass};font-weight:500}
        
        /* Buttons */
        .btn{display:inline-flex;align-items:center;gap:0.5rem;padding:0.95rem 1.9rem;font-size:0.9rem;font-weight:500;font-family:'Inter',sans-serif;border:1px solid transparent;border-radius:8px;cursor:pointer;transition:all 0.3s ease;white-space:nowrap;letter-spacing:0.01em}
        .btn-dark{background:${C.ink};color:${C.bone}}
        .btn-dark:hover{background:${C.verdigris};transform:translateY(-2px);box-shadow:0 10px 20px rgba(21,23,26,0.15)}
        .btn-line{background:transparent;color:${C.ink};border-color:${C.line}}
        .btn-line:hover{background:${C.ink};color:${C.bone};border-color:${C.ink}}
        .btn-brass{background:${C.brass};color:${C.bone};border:none}
        .btn-brass:hover{background:${C.brassLight};transform:translateY(-2px);box-shadow:0 10px 20px rgba(139,115,85,0.25)}
        
        .wrap{max-width:1180px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
        
        /* Navigation */
        nav{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(250,248,244,0.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid ${C.line};padding:1.2rem 0}
        .nav-wrap{display:flex;justify-content:space-between;align-items:center}
        .logo{display:flex;align-items:center;gap:0.7rem;font-family:'Fraunces',serif;font-size:1.3rem;font-weight:500;color:${C.ink};cursor:pointer}
        .nav-links{display:flex;gap:2.5rem;align-items:center}
        .nav-link{font-size:0.85rem;color:${C.gray};text-decoration:none;cursor:pointer;transition:color 0.2s;background:transparent;border:none;font-family:'Inter',sans-serif;padding:0.5rem 0}
        .nav-link:hover{color:${C.verdigris}}
        .nav-cta{display:flex;gap:0.75rem;align-items:center}
        .mobile-nav{display:none}
        
        .dropdown-menu{position:absolute;top:100%;left:0;background:${C.bone};border:1px solid ${C.line};border-radius:8px;min-width:260px;margin-top:0.75rem;z-index:1000;box-shadow:0 20px 40px rgba(21,23,26,0.08);overflow:hidden}
        .dropdown-item{width:100%;padding:0.9rem 1.2rem;background:none;border:none;text-align:left;cursor:pointer;font-size:0.85rem;color:${C.gray};border-bottom:1px solid ${C.line};transition:all 0.2s;font-family:'Inter',sans-serif}
        .dropdown-item:last-child{border-bottom:none}
        .dropdown-item:hover{background:${C.bone2};color:${C.ink}}
        
        .mobile-menu-container{position:absolute;top:100%;right:0;background:${C.bone};border:1px solid ${C.line};border-radius:8px;min-width:280px;margin-top:0.75rem;z-index:1000;box-shadow:0 20px 40px rgba(21,23,26,0.08);overflow:hidden}
        .mobile-link{display:block;width:100%;padding:0.9rem 1.2rem;background:none;border:none;text-align:left;cursor:pointer;font-size:0.88rem;color:${C.gray};text-decoration:none;border-bottom:1px solid ${C.line};font-family:'Inter',sans-serif;transition:background 0.2s}
        .mobile-link:hover{background:${C.bone2}}
        .mobile-policies-header{padding:0.5rem 0;border-bottom:1px solid ${C.line};background:${C.bone2}}

        /* Hero */
        .hero{padding-top:140px;padding-bottom:clamp(4rem,8vw,6rem);position:relative;overflow:hidden;background:linear-gradient(to bottom, ${C.bone} 0%, ${C.bone2} 100%)}
        .hero-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:4rem;align-items:center;position:relative;z-index:1}
        .hero-desc{font-size:1.1rem;max-width:540px;margin-bottom:2rem;color:${C.gray};line-height:1.8}
        .hero-buttons{display:flex;gap:1rem;flex-wrap:wrap}
        
        /* App Window Mockups */
        .app-window{border-radius:12px;overflow:hidden;box-shadow:0 30px 60px -15px rgba(21,23,26,0.2);border:1px solid ${C.line};width:100%;transition:transform 0.4s cubic-bezier(0.16,1,0.3,1)}
        .app-window:hover{transform:translateY(-8px)}
        .window-header{display:flex;align-items:center;justify-content:space-between;padding:0.8rem 1.2rem;border-bottom:1px solid ${C.line};background:${C.bone2}}
        .window-dot{width:10px;height:10px;border-radius:50%;display:inline-block}
        .window-title{font-size:0.72rem;font-family:'JetBrains Mono',monospace;color:${C.gray};letter-spacing:0.05em}
        .window-body{padding:2rem;background:${C.bone}}
        .app-window.dark .window-header{border-bottom:1px solid ${C.lineDark};background:rgba(0,0,0,0.2)}
        .app-window.dark .window-body{background:${C.ink}}
        .app-window.dark .window-title{color:${C.grayLight}}
        
        .mock-inner{padding:0.5rem}
        .mock-list-header{display:flex;justify-content:space-between;font-size:0.7rem;font-family:'JetBrains Mono',monospace;color:${C.gray};padding-bottom:0.5rem;border-bottom:1px solid ${C.line};margin-bottom:0.5rem}
        .mock-row{display:flex;justify-content:space-between;align-items:center;padding:1rem 0;border-bottom:1px solid ${C.line};font-size:0.9rem}
        .status-badge{font-size:0.7rem;font-family:'JetBrains Mono',monospace;padding:0.3rem 0.6rem;border-radius:4px;font-weight:500}
        .avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:${C.bone};font-family:'Fraunces',serif;font-weight:600;font-size:0.9rem}
        
        .stat-card{background:rgba(250,248,244,0.04);border:1px solid ${C.lineDark};border-radius:8px;padding:1rem}
        .stat-value{font-size:1.4rem;font-family:'Fraunces',serif;color:${C.bone};margin-top:0.5rem}
        .stat-label{font-size:0.7rem;color:${C.grayLight};font-family:'JetBrains Mono',monospace;margin-top:0.2rem;letter-spacing:0.1em}

        /* Sections */
        .section{padding:clamp(4rem,8vw,6rem)0}
        .section-dark{background:${C.ink};color:${C.bone};padding:clamp(4rem,8vw,6rem)0}
        .section-dark h2, .section-dark h3{color:${C.bone}}
        .section-dark p{color:rgba(250,248,244,0.7)}
        
        /* Feature Cards */
        .feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem;margin-top:3rem}
        .feature-card{background:${C.bone};border:1px solid ${C.line};padding:2rem;border-radius:8px;transition:all 0.3s ease}
        .feature-card:hover{transform:translateY(-5px);box-shadow:0 15px 30px rgba(21,23,26,0.06);border-color:${C.verdigrisLight}}
        .feature-icon{width:48px;height:48px;background:${C.verdigrisTint};border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:1.2rem}
        
        .dark-card{background:rgba(250,248,244,0.04);border:1px solid ${C.lineDark};padding:2rem;border-radius:8px;transition:all 0.3s ease}
        .dark-card:hover{transform:translateY(-5px);background:rgba(250,248,244,0.06);border-color:${C.verdigrisLight}}
        .dark-icon{width:48px;height:48px;background:rgba(61,79,71,0.3);border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:1.2rem}
        
        /* Steps */
        .steps-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:2rem;position:relative}
        .step-card{text-align:center;padding:2rem;position:relative}
        .step-num{width:56px;height:56px;background:${C.verdigris};color:${C.bone};border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-family:'Fraunces',serif;font-size:1.4rem;font-weight:600;box-shadow:0 8px 20px rgba(61,79,71,0.3)}
        
        @media(max-width:800px){.nav-links{display:none}.nav-cta{display:none}.mobile-nav{display:flex;gap:0.5rem;align-items:center}}
        @media(max-width:768px){
          .hero-grid{grid-template-columns:1fr;gap:3rem}
          .hero-buttons{flex-direction:column;width:100%}
          .hero-buttons .btn{width:100%;justify-content:center}
        }
      `}</style>

            <main>
                {/* Navigation */}
                <nav>
                    <div className="wrap nav-wrap">
                        <div className="logo" onClick={() => navigate('/')}>
                            <Mark size={24} color={C.ink} />
                            Rest Point
                        </div>
                        <div className="nav-links">
                            <button onClick={() => navigate('/')} className="nav-link">Features</button>
                            <button onClick={() => navigate('/about')} className="nav-link">About Infrastructure</button>
                            <button onClick={() => navigate('/insurance')} className="nav-link" style={{ color: C.brass, fontWeight: 600 }}>Insurance Brokers</button>
                            <PolicyDropdown navigate={navigate} goTerms={goTerms} />
                        </div>
                        <div className="nav-cta">
                            <button onClick={goLogin} className="nav-link" style={{ paddingRight: '0.5rem' }}>Log in</button>
                            <button onClick={goStart} className="btn btn-dark" style={{ padding: '0.7rem 1.2rem' }}>Request access</button>
                        </div>
                        <MobileMenu navigate={navigate} goTerms={goTerms} goLogin={goLogin} goStart={goStart} />
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="hero">
                    <div className="wrap">
                        <div className="hero-grid">
                            <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
                                <div className="mono-label" style={{ marginBottom: '1rem' }}>FUNERAL INSURANCE MADE SIMPLE</div>
                                <h1>Easing the burden when families need it most.</h1>
                                <p className="hero-desc">
                                    We understand the financial strain families go through when they lose a loved one. There's also a technology gap in this space that we are solving. That's why we're introducing a digital portal that helps funeral homes offer families a better way buy plans, pay directly from their phones using STK push, add dependents, and track contributions in real-time. No more chasing payments or wondering where things stand.
                                </p>
                                <div className="hero-buttons">
                                    <button className="btn btn-dark" onClick={goStart}>Get Started <ArrowRight size={16} /></button>
                                    <button className="btn btn-line" onClick={goLogin}>See How It Works</button>
                                </div>
                            </div>
                            <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 200ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 200ms', width: '100%' }}>
                                <AppWindow title="restpoint.app/insurance" dark>
                                    <InsuranceMockup />
                                </AppWindow>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key Benefits */}
                <section className="section">
                    <div className="wrap">
                        <Reveal style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                            <div className="label" style={{ marginBottom: '1rem' }}>Why Choose Us</div>
                            <h2>Everything you need in one platform</h2>
                            <p style={{ marginTop: '1rem' }}>Rest Point provides a comprehensive suite of tools to modernize your funeral insurance operations.</p>
                        </Reveal>
                        <div className="feature-grid">
                            {benefits.map((feat, i) => (
                                <Reveal key={i} delay={i * 100}>
                                    <div className="feature-card">
                                        <div className="feature-icon">
                                            <feat.icon size={24} color={C.verdigris} />
                                        </div>
                                        <h3>{feat.title}</h3>
                                        <p style={{ fontSize: '0.92rem', lineHeight: 1.7 }}>{feat.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="section" style={{ background: C.bone2, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
                    <div className="wrap">
                        <Reveal style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 4rem' }}>
                            <div className="label" style={{ marginBottom: '1rem' }}>How It Works</div>
                            <h2>Simple, transparent, and fast</h2>
                            <p style={{ marginTop: '1rem' }}>From registration to claims, everything is streamlined for families and funeral homes.</p>
                        </Reveal>
                        <div className="steps-grid">
                            {steps.map((step, i) => (
                                <Reveal key={i} delay={i * 100}>
                                    <div className="step-card">
                                        <div className="step-num">{step.num}</div>
                                        <h3>{step.title}</h3>
                                        <p style={{ fontSize: '0.92rem' }}>{step.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* For Funeral Homes */}
                <section className="section-dark">
                    <div className="wrap">
                        <Reveal style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                            <div className="mono-label" style={{ color: C.brass, marginBottom: '1rem' }}>For Funeral Homes</div>
                            <h2>Powerful tools for your team</h2>
                            <p style={{ marginTop: '1rem' }}>Everything you need to manage insurance operations efficiently.</p>
                        </Reveal>
                        <div className="feature-grid">
                            {teamFeatures.map((feat, i) => (
                                <Reveal key={i} delay={i * 100}>
                                    <div className="dark-card">
                                        <div className="dark-icon">
                                            <feat.icon size={24} color={C.brass} />
                                        </div>
                                        <h3>{feat.title}</h3>
                                        <p style={{ fontSize: '0.92rem', lineHeight: 1.7 }}>{feat.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="section" style={{ background: C.bone }}>
                    <div className="wrap">
                        <Reveal style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto', padding: '3rem 2rem', background: C.bone2, borderRadius: '12px', border: `1px solid ${C.line}` }}>
                            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '1rem' }}>Ready to modernize your insurance operations?</h2>
                            <p style={{ marginBottom: '2rem' }}>Join the leading funeral homes using Rest Point to provide dignity and transparency to families.</p>
                            <button className="btn btn-brass" onClick={goStart} style={{ padding: '1rem 2.2rem', fontSize: '0.95rem' }}>
                                Request Access <ArrowRight size={16} />
                            </button>
                        </Reveal>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}