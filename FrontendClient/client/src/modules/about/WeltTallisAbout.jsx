import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronDown, Menu, X, ArrowRight, Target, Heart, Globe,
    ShieldCheck, Users, Zap, CheckCircle, Star
} from 'lucide-react';
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

export default function WeltTallisAbout() {
    const navigate = useNavigate();

    const goLogin = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); };
    const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
    const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

    useEffect(() => { document.title = 'About Welt Tallis | Transforming Lives Through Technology — RestPoint'; }, []);

    const teamMembers = [
        { name: "Esther Imbithe", role: "Lead Developer", desc: "Full-stack engineer passionate about building solutions that make a real difference." },
        { name: "Peter Mumo", role: "CTO & Software Architect", desc: "Leads technical strategy and architecture, building robust and scalable solutions." },
        { name: "Mary Wanjiku", role: "Operations Lead", desc: "Ensures seamless delivery and 24/7 support for all our clients." }
    ];

    return (
        <div className="page-container">
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
        .hero{padding-top:140px;padding-bottom:clamp(4rem,8vw,6rem);position:relative;overflow:hidden;text-align:center;background:radial-gradient(circle at 50% 0%, rgba(61,79,71,0.05) 0%, transparent 60%)}
        .hero-desc{font-size:1.1rem;max-width:640px;margin:0 auto 2.5rem;color:${C.gray};line-height:1.8}
        .hero-buttons{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
        
        /* Sections */
        .section{padding:clamp(4rem,8vw,6rem)0}
        .section-dark{background:${C.ink};color:${C.bone};padding:clamp(4rem,8vw,6rem)0;position:relative;overflow:hidden}
        .section-dark h2, .section-dark h3{color:${C.bone}}
        .section-dark p{color:rgba(250,248,244,0.7)}
        
        /* Feature Cards */
        .feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;margin-top:3rem}
        .feature-card{background:${C.bone};border:1px solid ${C.line};padding:2rem;border-radius:8px;transition:all 0.3s ease}
        .feature-card:hover{transform:translateY(-5px);box-shadow:0 15px 30px rgba(21,23,26,0.06);border-color:${C.verdigrisLight}}
        .feature-icon{width:48px;height:48px;background:${C.verdigrisTint};border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:1.2rem;color:${C.verdigris}}
        
        .dark-card{background:rgba(250,248,244,0.04);border:1px solid ${C.lineDark};padding:2.5rem;border-radius:8px;transition:all 0.3s ease;height:100%}
        .dark-card:hover{transform:translateY(-5px);background:rgba(250,248,244,0.06);border-color:${C.verdigrisLight}}
        .dark-icon{width:48px;height:48px;background:rgba(61,79,71,0.3);border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:1.2rem;color:${C.brass}}
        
        /* Team Cards */
        .team-card{background:${C.bone};border:1px solid ${C.line};padding:2rem;border-radius:8px;text-align:center;transition:all 0.3s ease}
        .team-card:hover{transform:translateY(-5px);box-shadow:0 15px 30px rgba(21,23,26,0.06);border-color:${C.verdigrisLight}}
        .team-avatar{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg, ${C.verdigris}, ${C.verdigrisDark});margin:0 auto 1.2rem;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:2rem;color:${C.bone};font-weight:600}
        
        /* CTA Section */
        .cta-wrapper { background: ${C.bone}; padding: clamp(4rem, 8vw, 7rem) 0; }
        .cta-card { 
          position: relative; 
          background: linear-gradient(135deg, ${C.ink} 0%, ${C.verdigrisDark} 100%); 
          border-radius: 24px; 
          padding: clamp(3rem, 6vw, 5rem) 2rem; 
          text-align: center; 
          overflow: hidden; 
          border: 1px solid ${C.lineDark}; 
          box-shadow: 0 40px 80px -20px rgba(21,23,26,0.3);
        }
        .cta-card::before { 
          content: ''; 
          position: absolute; 
          top: 0; left: 0; right: 0; bottom: 0; 
          background-image: radial-gradient(circle at 50% 0%, rgba(139,115,85,0.15) 0%, transparent 50%), linear-gradient(rgba(250,248,244,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(250,248,244,0.03) 1px, transparent 1px); 
          background-size: 100% 100%, 40px 40px, 40px 40px; 
          pointer-events: none; 
        }
        .cta-content { position: relative; z-index: 2; max-width: 700px; margin: 0 auto; }
        .cta-content h2 { color: ${C.bone}; margin-bottom: 1.5rem; font-size: clamp(2rem, 4.5vw, 3rem); line-height: 1.2; }
        .cta-content p { color: rgba(250,248,244,0.8); font-size: 1.1rem; line-height: 1.8; margin-bottom: 2.5rem; }
        .cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .btn-brass{background:${C.brass};color:${C.bone};border:none}
        .btn-brass:hover{background:${C.brassLight};transform:translateY(-2px);box-shadow:0 10px 20px rgba(139,115,85,0.25)}
        .btn-ghost { background: transparent; color: ${C.bone}; border: 1px solid rgba(250,248,244,0.3); }
        .btn-ghost:hover { background: rgba(250,248,244,0.1); border-color: ${C.bone}; }

        @media(max-width:800px){.nav-links{display:none}.nav-cta{display:none}.mobile-nav{display:flex;gap:0.5rem;align-items:center}}
        @media(max-width:768px){
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
                            <button onClick={() => navigate('/')} className="nav-link">Home</button>
                            <button onClick={() => navigate('/about-welt-tallis')} className="nav-link" style={{ color: C.brass, fontWeight: 600 }}>About</button>
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
                    <div className="wrap">
                        <Reveal>
                            <div className="mono-label" style={{ marginBottom: '1rem' }}>About Welt Tallis</div>
                            <h1>Transforming <span style={{ color: C.brass }}>Human Life</span> Through Technology</h1>
                            <p className="hero-desc">
                                We are a team of dedicated technologists building dignified digital solutions for funeral homes, welfare organizations, and communities across Kenya.
                            </p>
                            <div className="hero-buttons">
                                <button className="btn btn-dark" onClick={goStart}>Get Started <ArrowRight size={16} /></button>
                                <button className="btn btn-line" onClick={() => navigate('/contact')}>Contact Us</button>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="section" style={{ paddingTop: '2rem' }}>
                    <div className="wrap">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                            <Reveal>
                                <div className="feature-card" style={{ height: '100%' }}>
                                    <div className="feature-icon"><Target size={24} /></div>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Our Mission</h3>
                                    <p style={{ fontSize: '1rem', lineHeight: 1.8 }}>
                                        We build technology that serves humanity. Our mission is to empower organizations with powerful, affordable digital tools that simplify complex processes, so they can focus on what truly matters — caring for their communities with dignity and compassion.
                                    </p>
                                </div>
                            </Reveal>
                            <Reveal delay={150}>
                                <div className="feature-card" style={{ height: '100%', background: C.bone2 }}>
                                    <div className="feature-icon" style={{ background: 'rgba(139,115,85,0.1)', color: C.brass }}><Globe size={24} /></div>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Our Vision</h3>
                                    <p style={{ fontSize: '1rem', lineHeight: 1.8 }}>
                                        A world where every organization, regardless of size or budget, has access to world-class technology that amplifies their impact and helps them serve their communities with excellence and compassion.
                                    </p>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* Products */}
                <section className="section" style={{ background: C.bone2, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
                    <div className="wrap">
                        <Reveal style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                            <div className="label" style={{ marginBottom: '1rem' }}>What We Build</div>
                            <h2>Our suite of products designed to make a difference</h2>
                        </Reveal>
                        <div className="feature-grid">
                            {[
                                { icon: Heart, title: 'RestPoint', desc: 'Complete funeral home management system — from registration to dispatch, billing, and reporting.' },
                                { icon: Users, title: 'Welfare Management', desc: 'Digital platform for churches, SACCOS, and chamas to manage member welfare contributions and payouts.' },
                                { icon: ShieldCheck, title: 'Memorial Portal', desc: 'Beautiful online memorial spaces where families can honor loved ones and receive condolences.' },
                                { icon: Zap, title: 'Automation Tools', desc: 'Smart workflow automation that reduces manual effort and eliminates errors in daily operations.' },
                            ].map((product, i) => (
                                <Reveal key={i} delay={i * 100}>
                                    <div className="feature-card">
                                        <div className="feature-icon">
                                            <product.icon size={24} />
                                        </div>
                                        <h3>{product.title}</h3>
                                        <p style={{ fontSize: '0.92rem', lineHeight: 1.7 }}>{product.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Impact - Dark Section */}
                <section className="section-dark">
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }}></div>
                    <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                            <Reveal>
                                <div className="mono-label" style={{ color: C.brass, marginBottom: '1rem' }}>Our Impact</div>
                                <h2 style={{ marginBottom: '1.5rem' }}>Technology that serves humanity</h2>
                                <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
                                    Every product we create is designed with a single purpose: to make a positive difference in people's lives. We measure our success not by the complexity of our code, but by the simplicity and dignity we bring to the people we serve.
                                </p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '2rem', fontFamily: "'Fraunces', serif", color: C.bone }}>99.9%</div>
                                        <div className="mono-label" style={{ color: C.grayLight }}>Platform Uptime</div>
                                    </div>
                                    <div style={{ borderLeft: `1px solid ${C.lineDark}`, paddingLeft: '1rem' }}>
                                        <div style={{ fontSize: '2rem', fontFamily: "'Fraunces', serif", color: C.bone }}>500+</div>
                                        <div className="mono-label" style={{ color: C.grayLight }}>Organizations Served</div>
                                    </div>
                                </div>
                            </Reveal>
                            <Reveal delay={150} className="impact-list">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {[
                                        'From funeral homes to welfare organizations, we provide the technological foundation that allows our clients to focus on what truly matters.',
                                        'Our platform handles thousands of critical operations daily, ensuring our clients never miss a beat.',
                                        'We bring simplicity and dignity to the families and communities we ultimately serve.'
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                            <CheckCircle size={20} style={{ color: C.brass, flexShrink: 0, marginTop: '4px' }} />
                                            <p style={{ color: 'rgba(250,248,244,0.8)', fontSize: '1rem' }}>{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* Team */}
                <section className="section">
                    <div className="wrap">
                        <Reveal style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
                            <div className="label" style={{ marginBottom: '1rem' }}>Meet the Team</div>
                            <h2>Passionate people building technology that matters</h2>
                        </Reveal>
                        <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                            {teamMembers.map((member, i) => (
                                <Reveal key={i} delay={i * 100}>
                                    <div className="team-card">
                                        <div className="team-avatar">{member.name[0]}</div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{member.name}</h3>
                                        <p style={{ color: C.brass, fontSize: '0.85rem', fontWeight: 500, marginBottom: '1rem' }}>{member.role}</p>
                                        <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{member.desc}</p>
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
                                    <h2>Ready to Transform Your Operations?</h2>
                                    <p>Join the growing community of organizations using RestPoint to serve their communities with dignity, efficiency, and compassion.</p>
                                    <div className="cta-buttons">
                                        <button className="btn btn-brass" onClick={goStart} style={{ padding: '1.1rem 2.5rem', fontSize: '1rem' }}>
                                            Start Free Trial <ArrowRight size={18} />
                                        </button>
                                        <button className="btn btn-ghost" onClick={() => navigate('/solutions/funeral-homes')} style={{ padding: '1.1rem 2.5rem', fontSize: '1rem' }}>
                                            Learn More
                                        </button>
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
}