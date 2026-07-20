import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, ArrowRight, ClipboardList, CalendarClock, Users, Wallet, FileText, BarChart3, MoreVertical } from '../../utils/icons/icons';
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
                    <button onClick={() => { navigate('/about-welt-tallis'); setOpen(false); }} className="mobile-link">About</button>
                    <button onClick={() => { navigate('/insurance'); setOpen(false); }} className="mobile-link">Insurance Brokers</button>
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

const CaseManagementMockup = () => (
    <div className="mock-inner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
                <div className="mono-label" style={{ color: C.verdigris }}>CASE FILES</div>
                <div style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.ink, marginTop: '0.3rem' }}>Active Services</div>
            </div>
            <button className="action-btn"><MoreHorizontal size={16} /></button>
        </div>

        <div className="mock-list-header">
            <span>Family Name</span>
            <span>Status</span>
        </div>

        <div className="mock-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div className="avatar" style={{ background: C.verdigris }}>JO</div>
                <span style={{ color: C.ink }}>Otieno Family</span>
            </div>
            <span className="status-badge verified">In Progress</span>
        </div>
        <div className="mock-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div className="avatar" style={{ background: C.brass }}>MW</div>
                <span style={{ color: C.ink }}>Mwangi Family</span>
            </div>
            <span className="status-badge pending">Pending Docs</span>
        </div>
        <div className="mock-row" style={{ borderBottom: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div className="avatar" style={{ background: C.accent }}>KA</div>
                <span style={{ color: C.ink }}>Kamau Family</span>
            </div>
            <span className="status-badge missing">Billing Due</span>
        </div>
    </div>
);

const FuneralHomeSoftware = () => {
    const navigate = useNavigate();

    const goLogin = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); };
    const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
    const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

    const features = [
        { icon: ClipboardList, title: 'Case Management', desc: 'Track every case from initial call through to final service with complete timeline visibility.' },
        { icon: CalendarClock, title: 'Scheduling', desc: 'Coordinate viewings, services, and staff assignments with an intuitive calendar system.' },
        { icon: Users, title: 'Family Portal', desc: 'Give families secure access to arrangements, updates, and important documents.' },
        { icon: Wallet, title: 'Financial Management', desc: 'Handle billing, payments, and accounting with integrated financial tools.' },
        { icon: FileText, title: 'Document Generation', desc: 'Create permits, certificates, and custom documents automatically.' },
        { icon: BarChart3, title: 'Analytics & Reports', desc: 'Gain insights into your operations with comprehensive reporting dashboards.' },
    ];

    return (
        <div className="page-container">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',sans-serif;color:${C.gray};background:${C.bone};-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fraunces',serif;font-weight:500;letter-spacing:-0.01em;color:${C.ink}}
        h1{font-size:clamp(2.2rem,5vw,3.5rem);line-height:1.1;margin-bottom:1.5rem}
        h2{font-size:clamp(1.8rem,4vw,2.5rem);line-height:1.2;margin-bottom:1.5rem}
        h3{font-size:1.2rem;margin-bottom:0.6rem;color:${C.ink}}
        p{line-height:1.75;font-size:1rem;color:${C.gray}}
        
        .mono-label{font-family:'JetBrains Mono',monospace;font-size:0.75rem;letter-spacing:0.14em;text-transform:uppercase;color:${C.brass};font-weight:500;display:inline-flex;align-items:center;gap:0.5rem}
        .label{font-family:'JetBrains Mono',monospace;font-size:0.74rem;letter-spacing:0.14em;text-transform:uppercase;color:${C.brass};font-weight:500}
        
        .btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 1.9rem;font-size:0.9rem;font-weight:500;font-family:'Inter',sans-serif;border:1px solid transparent;border-radius:8px;cursor:pointer;transition:all 0.3s ease;white-space:nowrap;letter-spacing:0.01em}
        .btn-dark{background:${C.ink};color:${C.bone}}
        .btn-dark:hover{background:${C.verdigris};transform:translateY(-2px);box-shadow:0 10px 20px rgba(21,23,26,0.15)}
        .btn-line{background:transparent;color:${C.ink};border-color:${C.line}}
        .btn-line:hover{background:${C.ink};color:${C.bone};border-color:${C.ink}}
        .btn-brass{background:${C.brass};color:${C.bone};border:none}
        .btn-brass:hover{background:${C.brassLight};transform:translateY(-2px);box-shadow:0 10px 20px rgba(139,115,85,0.25)}
        .btn-ghost{background:transparent;color:${C.bone};border:1px solid rgba(250,248,244,0.3)}
        .btn-ghost:hover{background:rgba(250,248,244,0.1);border-color:${C.bone}}
        
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
        .hero{padding-top:140px;padding-bottom:clamp(4rem,8vw,6rem);position:relative;overflow:hidden;background:#000000;color:${C.bone}}
        .hero-grid-bg{position:absolute;top:0;left:0;right:0;bottom:0;background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;mask-image:linear-gradient(to bottom,black,transparent 80%);-webkit-mask-image:linear-gradient(to bottom,black,transparent 80%)}
        .hero-glow{position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 20% 50%,rgba(61,79,71,0.3) 0%,transparent 60%);pointer-events:none}
        .hero-content{display:grid;grid-template-columns:1.2fr 0.8fr;gap:4rem;align-items:center;position:relative;z-index:1}
        .hero-desc{font-size:1.1rem;max-width:540px;margin-bottom:2rem;color:rgba(255,255,255,0.8);line-height:1.8}
        .hero-buttons{display:flex;gap:1rem;flex-wrap:wrap}
        .hero h1{color:${C.bone}}
        
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
        .file-icon{width:32px;height:32px;background:${C.bone2};border-radius:6px;display:flex;align-items:center;justify-content:center}
        .status-badge{font-size:0.7rem;font-family:'JetBrains Mono',monospace;padding:0.3rem 0.6rem;border-radius:4px;font-weight:500}
        .status-badge.verified{color:${C.verdigris};background:${C.verdigrisTint}}
        .status-badge.pending{color:${C.brass};background:rgba(139,115,85,0.1)}
        .status-badge.missing{color:${C.accent};background:rgba(199,123,94,0.1)}
        .avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:${C.bone};font-family:'Fraunces',serif;font-weight:600;font-size:0.8rem}
        .action-btn{background:${C.bone2};border:1px solid ${C.line};border-radius:6px;padding:0.4rem;cursor:pointer;display:flex;align-items:center;justify-content:center;color:${C.ink};transition:all 0.2s}
        .action-btn:hover{background:${C.ink};color:${C.bone}}

        /* Sections */
        .section{padding:clamp(4rem,8vw,6rem)0}
        .section-alt{background:${C.bone2}}
        
        /* Feature Cards */
        .feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem;margin-top:3rem}
        .feature-card{background:${C.bone};border:1px solid ${C.line};padding:2rem;border-radius:8px;transition:all 0.3s ease}
        .feature-card:hover{transform:translateY(-5px);box-shadow:0 15px 30px rgba(21,23,26,0.06);border-color:${C.verdigrisLight}}
        .feature-icon{width:48px;height:48px;background:${C.verdigrisTint};border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:1.2rem;color:${C.verdigris}}
        
        /* CTA Section */
        .cta-wrapper{background:${C.bone};padding:0 0 clamp(4rem,8vw,7rem)}
        .cta-card{position:relative;background:linear-gradient(135deg,#000000 0%,${C.verdigrisDark} 100%);border-radius:24px;padding:clamp(3rem,6vw,5rem) 2rem;text-align:center;overflow:hidden;border:1px solid ${C.lineDark};box-shadow:0 40px 80px -20px rgba(21,23,26,0.3)}
        .cta-card::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background-image:radial-gradient(circle at 50% 0%,rgba(139,115,85,0.15) 0%,transparent 50%),linear-gradient(rgba(250,248,244,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(250,248,244,0.03) 1px,transparent 1px);background-size:100% 100%,40px 40px,40px 40px;pointer-events:none}
        .cta-content{position:relative;z-index:2;max-width:700px;margin:0 auto}
        .cta-content h2{color:${C.bone};margin-bottom:1.5rem;font-size:clamp(2rem,4.5vw,3rem);line-height:1.2}
        .cta-content p{color:rgba(250,248,244,0.8);font-size:1.1rem;line-height:1.8;margin-bottom:2.5rem}
        .cta-buttons{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}

        @media(max-width:800px){.nav-links{display:none}.nav-cta{display:none}.mobile-nav{display:flex;gap:0.5rem;align-items:center}}
        @media(max-width:900px){
          .hero-content{grid-template-columns:1fr;gap:3rem}
        }
        @media(max-width:768px){
          .hero-buttons{flex-direction:column;width:100%}
          .hero-buttons .btn{width:100%;justify-content:center}
          .cta-buttons{flex-direction:column;width:100%}
          .cta-buttons .btn{width:100%;justify-content:center}
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
                            <button onClick={() => navigate('/')} className="nav-link">Home</button>
                            <button onClick={() => navigate('/about-welt-tallis')} className="nav-link">About</button>
                            <button onClick={() => navigate('/insurance')} className="nav-link">Insurance Brokers</button>
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
                    <div className="hero-grid-bg"></div>
                    <div className="hero-glow"></div>
                    <div className="wrap hero-content">
                        <div>
                            <div className="mono-label" style={{ marginBottom: '1.5rem', color: C.brass }}>
                                <Users size={14} /> Built for Funeral Homes
                            </div>
                            <h1>The Operating System for <span style={{ color: C.brass }}>Modern Funeral Homes</span></h1>
                            <p className="hero-desc">Streamline operations, honor families, and grow your business with purpose-built software designed exclusively for funeral home professionals.</p>
                            <div className="hero-buttons">
                                <button className="btn btn-brass" onClick={goStart}>Start Free Trial <ArrowRight size={16} /></button>
                                <button className="btn btn-ghost" onClick={() => navigate('/contact')}>Book Demo</button>
                            </div>
                        </div>
                        <div style={{ width: '100%' }}>
                            <AppWindow title="restpoint.app/cases">
                                <CaseManagementMockup />
                            </AppWindow>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="section">
                    <div className="wrap">
                        <Reveal style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                            <div className="label" style={{ marginBottom: '1rem' }}>Features</div>
                            <h2>Everything You Need to Run Your Funeral Home</h2>
                            <p>From first call to final service, Rest Point has you covered.</p>
                        </Reveal>
                        <div className="feature-grid">
                            {features.map((feature, i) => (
                                <Reveal key={i} delay={i * 100}>
                                    <div className="feature-card">
                                        <div className="feature-icon">
                                            <feature.icon size={24} />
                                        </div>
                                        <h3>{feature.title}</h3>
                                        <p style={{ fontSize: '0.92rem', lineHeight: 1.7 }}>{feature.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-wrapper">
                    <div className="wrap">
                        <Reveal>
                            <div className="cta-card">
                                <div className="cta-content">
                                    <div className="mono-label" style={{ color: C.brass, marginBottom: '1.5rem' }}>Get Started Today</div>
                                    <h2>Ready to Transform Your Funeral Home?</h2>
                                    <p>Join hundreds of funeral homes already using Rest Point to serve families better.</p>
                                    <div className="cta-buttons">
                                        <button className="btn btn-brass" onClick={goStart}>Get Started Today <ArrowRight size={18} /></button>
                                        <button className="btn btn-ghost" onClick={() => navigate('/contact')}>Contact Sales</button>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>
            <Footer goTerms={goTerms} />
        </div>
    );
};

export default FuneralHomeSoftware;