import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu, X, Target, Heart, Globe, Shield,
    ArrowRight, Star, Users, Zap, CheckCircle
} from 'lucide-react';
import Footer from '../../components/layout/Footer';

/* ============================================================
   REST POINT — About Welt Tallis
   Styled to match DataMigrationPolicy: bone / ink / brass / verdigris
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
    lineDark: 'rgba(21,23,26,0.14)',
    gray: '#6B6862',
    grayLight: 'rgba(21,23,26,0.62)',
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

export default function WeltTallisAbout() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const goHome = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); };

    useEffect(() => { document.title = 'About Welt Tallis | Transforming Lives Through Technology — RestPoint'; }, []);

    const TeamCard = ({ name, role, desc, index }) => (
        <Reveal delay={index * 100}>
            <div style={{
                background: 'rgba(21,23,26,0.03)',
                border: `1px solid ${C.lineDark}`,
                borderRadius: '16px',
                padding: 'clamp(1.5rem, 3vw, 2rem)',
                textAlign: 'center',
                transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                cursor: 'default',
            }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = C.verdigris; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = C.lineDark; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `linear-gradient(135deg, ${C.verdigris}, ${C.verdigrisDark})`, margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: C.bone, fontWeight: 700 }}>{name[0]}</div>
                <h3 style={{ color: C.ink, fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{name}</h3>
                <p style={{ color: C.brass, fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.75rem' }}>{role}</p>
                <p style={{ color: C.gray, fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85 }}>{desc}</p>
            </div>
        </Reveal>
    );

    return (
        <div style={{ minHeight: '100vh', background: C.bone, color: C.ink, fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>

            {/* ─── Nav like LandingPage ──────────────────────────────── */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; overflow-x: hidden; }
        img, svg { max-width: 100%; height: auto; }
        ::selection { background: ${C.verdigris}; color: ${C.bone}; }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes pulse-glow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-glow { animation: pulse-glow 3s ease-in-out infinite; }
        nav .nav-link { font-size: 0.85rem; color: ${C.gray}; text-decoration: none; cursor: pointer; transition: color 0.2s; background: transparent; border: none; font-family: 'Inter', sans-serif; }
        nav .nav-link:hover { color: ${C.ink}; }
        @media (max-width: 800px) { .nav-desktop { display: none !important; } .nav-mobile { display: flex !important; } }
        @media (min-width: 801px) { .nav-desktop { display: flex !important; } .nav-mobile { display: none !important; } }
      `}</style>

            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                background: `rgba(250,248,244,0.95)`, backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${C.line}`,
                padding: '1rem 0',
            }}>
                <div style={{
                    maxWidth: '1140px', margin: '0 auto',
                    padding: '0 clamp(1.25rem, 5vw, 2.5rem)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div onClick={() => navigate('/')} style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        fontFamily: "'Fraunces', serif", fontSize: '1.15rem', fontWeight: 500,
                        color: C.ink, cursor: 'pointer',
                    }}>
                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="14.5" stroke={C.ink} strokeWidth="1" />
                            <path d="M16 8.5V23.5M9.5 16H22.5" stroke={C.ink} strokeWidth="1" />
                            <circle cx="16" cy="16" r="2.5" fill={C.verdigris} />
                        </svg>
                        <span>Rest Point</span>
                    </div>

                    {/* Desktop nav - like LandingPage */}
                    <div className="nav-desktop" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <button onClick={() => navigate('/')} className="nav-link">Home</button>
                        <button onClick={() => navigate('/solutions/funeral-homes')} className="nav-link">Solutions</button>
                        <button onClick={() => navigate('/contact')} className="nav-link">Contact</button>
                        <button onClick={() => navigate('/register')} style={{
                            padding: '0.55rem 1.3rem', fontSize: '0.8rem', fontWeight: 500,
                            fontFamily: "'Inter', sans-serif", borderRadius: '6px', border: 'none',
                            background: `linear-gradient(135deg, ${C.verdigris}, ${C.verdigrisDark})`,
                            color: C.bone, cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = ''}
                        >Get Started</button>
                    </div>

                    {/* Mobile hamburger - like LandingPage */}
                    <div className="nav-mobile" style={{ display: 'none', gap: '0.5rem', alignItems: 'center' }}>
                        <button onClick={() => navigate('/register')} style={{
                            padding: '0.4rem 0.85rem', borderRadius: '6px', border: 'none',
                            background: `linear-gradient(135deg, ${C.verdigris}, ${C.verdigrisDark})`,
                            color: C.bone, fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                        }}>Start</button>
                        <button onClick={() => setMenuOpen(!menuOpen)} style={{
                            background: 'none', border: 'none', color: C.ink, cursor: 'pointer', padding: '0.4rem'
                        }}>
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── Mobile Drawer ────────────────────────────────────── */}
            <div style={{
                position: 'fixed', top: 64, right: menuOpen ? 0 : '-100%', width: '280px', maxWidth: '85vw',
                height: 'calc(100vh - 64px)', background: C.bone, zIndex: 999,
                borderLeft: `1px solid ${C.line}`,
                transition: 'right 0.4s cubic-bezier(0.16,1,0.3,1)',
                padding: '1.5rem', overflowY: 'auto',
            }}>
                {[
                    { label: 'Home', path: '/' },
                    { label: 'Solutions', path: '/solutions/funeral-homes' },
                    { label: 'About', path: '/about-welt-tallis' },
                    { label: 'Contact', path: '/contact' },
                    { label: 'Get Started', path: '/register', highlight: true },
                ].map((item, idx) => (
                    <button key={idx} onClick={() => { navigate(item.path); setMenuOpen(false); }}
                        style={{
                            display: 'block', width: '100%', padding: '0.85rem 1rem', marginBottom: '0.25rem',
                            background: item.highlight ? `linear-gradient(135deg, ${C.verdigris}, ${C.verdigrisDark})` : 'rgba(21,23,26,0.03)',
                            border: item.highlight ? 'none' : `1px solid ${C.lineDark}`,
                            borderRadius: '10px', color: item.highlight ? C.bone : C.ink, fontSize: '0.95rem', fontWeight: item.highlight ? 600 : 400,
                            textAlign: 'left', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => { if (!item.highlight) e.currentTarget.style.background = 'rgba(21,23,26,0.06)'; }}
                        onMouseLeave={e => { if (!item.highlight) e.currentTarget.style.background = 'rgba(21,23,26,0.03)'; }}>
                        {item.label}
                    </button>
                ))}
            </div>

            {/* ─── Overlay ──────────────────────────────────────────── */}
            {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.3)' }} />}

            {/* ─── Hero ─────────────────────────────────────────────── */}
            <section style={{
                padding: 'clamp(5rem, 12vw, 8rem) clamp(1rem, 5vw, 2rem) clamp(3rem, 6vw, 5rem)',
                background: `radial-gradient(ellipse at 20% 40%, ${C.verdigris}08 0%, transparent 60%), radial-gradient(ellipse at 80% 60%, ${C.brass}08 0%, transparent 50%)`,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div className="animate-float" style={{ position: 'absolute', top: '10%', right: '5%', width: '120px', height: '120px', borderRadius: '50%', border: `1px solid ${C.verdigris}15`, opacity: 0.5 }} />
                <div className="animate-glow" style={{ position: 'absolute', bottom: '15%', left: '8%', width: '80px', height: '80px', borderRadius: '50%', border: `1px solid ${C.brass}12`, opacity: 0.4 }} />

                <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
                    <Reveal>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '2rem', background: `${C.verdigris}08`, border: `1px solid ${C.verdigris}20`, color: C.verdigris, fontSize: 'clamp(0.75rem, 1.2vw, 0.85rem)', fontWeight: 500, marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
                            <Heart size={14} /> About Welt Tallis
                        </div>
                    </Reveal>

                    <Reveal delay={100}>
                        <h1 style={{
                            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
                            fontWeight: 700,
                            lineHeight: 1.12,
                            letterSpacing: '-0.03em',
                            marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
                            color: C.ink,
                        }}>
                            Transforming{' '}
                            <span style={{ background: `linear-gradient(135deg, ${C.brass}, ${C.brassLight})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Human Life
                            </span>{' '}
                            Through Technology
                        </h1>
                    </Reveal>

                    <Reveal delay={200}>
                        <p style={{
                            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                            color: C.gray,
                            lineHeight: 1.8,
                            maxWidth: '600px',
                            margin: '0 auto clamp(2rem, 3vw, 3rem)',
                            opacity: 0.85,
                        }}>
                            We are a team of dedicated technologists building dignified digital solutions
                            for funeral homes, welfare organizations, and communities across Kenya.
                        </p>
                    </Reveal>

                    <Reveal delay={300}>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button onClick={() => navigate('/register')} style={{
                                padding: '0.85rem 2rem', borderRadius: '12px', border: 'none',
                                background: `linear-gradient(135deg, ${C.verdigris}, ${C.verdigrisDark})`,
                                color: C.bone, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                transition: 'all 0.3s ease',
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = ''}>
                                Get Started <ArrowRight size={18} />
                            </button>
                            <button onClick={() => navigate('/contact')} style={{
                                padding: '0.85rem 2rem', borderRadius: '12px',
                                border: `1px solid ${C.line}`, background: 'transparent',
                                color: C.ink, fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = C.bone; e.currentTarget.style.borderColor = C.ink; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.ink; e.currentTarget.style.borderColor = C.line; }}>
                                Contact Us
                            </button>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ─── Mission ──────────────────────────────────────────── */}
            <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 5vw, 2rem)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                        <Reveal>
                            <div style={{
                                background: `linear-gradient(135deg, ${C.verdigris}08, ${C.verdigris}04)`,
                                border: `1px solid ${C.verdigris}20`,
                                borderRadius: '20px',
                                padding: 'clamp(2rem, 3vw, 2.5rem)',
                                height: '100%',
                            }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${C.verdigris}, ${C.verdigrisDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: C.bone }}>
                                    <Target size={24} />
                                </div>
                                <h2 style={{ fontSize: 'clamp(1.3rem, 2vw, 1.6rem)', fontWeight: 700, marginBottom: '1rem', color: C.ink }}>Our Mission</h2>
                                <p style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)', color: C.gray, lineHeight: 1.8, opacity: 0.85 }}>
                                    We build technology that serves humanity. Our mission is to empower organizations
                                    with powerful, affordable digital tools that simplify complex processes, so they can
                                    focus on what truly matters — caring for their communities with dignity and compassion.
                                </p>
                            </div>
                        </Reveal>

                        <Reveal delay={150}>
                            <div style={{
                                background: `linear-gradient(135deg, ${C.brass}08, ${C.brass}04)`,
                                border: `1px solid ${C.brass}20`,
                                borderRadius: '20px',
                                padding: 'clamp(2rem, 3vw, 2.5rem)',
                                height: '100%',
                            }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${C.brass}, ${C.brassLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: C.bone }}>
                                    <Globe size={24} />
                                </div>
                                <h2 style={{ fontSize: 'clamp(1.3rem, 2vw, 1.6rem)', fontWeight: 700, marginBottom: '1rem', color: C.ink }}>Our Vision</h2>
                                <p style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)', color: C.gray, lineHeight: 1.8, opacity: 0.85 }}>
                                    A world where every organization, regardless of size or budget, has access to
                                    world-class technology that amplifies their impact and helps them serve their
                                    communities with excellence and compassion.
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ─── Products ─────────────────────────────────────────── */}
            <section style={{
                padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 5vw, 2rem)',
                background: `radial-gradient(ellipse at 50% 0%, ${C.verdigris}06 0%, transparent 60%)`,
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <Reveal>
                        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem', color: C.ink }}>What We Build</h2>
                        <p style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1.05rem)', color: C.gray, textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3rem)', opacity: 0.85 }}>Our suite of products designed to make a difference</p>
                    </Reveal>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                        {[
                            { icon: <Heart size={22} />, title: 'RestPoint', desc: 'Complete funeral home management system — from registration to dispatch, billing, and reporting.' },
                            { icon: <Users size={22} />, title: 'Welfare Management', desc: 'Digital platform for churches, SACCOS, and chamas to manage member welfare contributions and payouts.' },
                            { icon: <Shield size={22} />, title: 'Memorial Portal', desc: 'Beautiful online memorial spaces where families can honor loved ones and receive condolences.' },
                            { icon: <Zap size={22} />, title: 'Automation Tools', desc: 'Smart workflow automation that reduces manual effort and eliminates errors in daily operations.' },
                        ].map((product, idx) => (
                            <Reveal key={idx} delay={idx * 80}>
                                <div style={{
                                    background: 'rgba(21,23,26,0.02)',
                                    border: `1px solid ${C.lineDark}`,
                                    borderRadius: '16px',
                                    padding: 'clamp(1.5rem, 2.5vw, 2rem)',
                                    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                                    cursor: 'default',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = C.verdigris; e.currentTarget.style.background = 'rgba(61,79,71,0.06)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = C.lineDark; e.currentTarget.style.background = 'rgba(21,23,26,0.02)'; }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `linear-gradient(135deg, ${C.verdigris}, ${C.verdigrisDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: C.bone }}>{product.icon}</div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: C.ink }}>{product.title}</h3>
                                    <p style={{ fontSize: '0.9rem', color: C.gray, lineHeight: 1.7, opacity: 0.85 }}>{product.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Impact ───────────────────────────────────────────── */}
            <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 5vw, 2rem)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Reveal>
                        <div style={{
                            background: `linear-gradient(135deg, ${C.verdigris}08, ${C.verdigris}04)`,
                            border: `1px solid ${C.verdigris}20`,
                            borderRadius: '20px',
                            padding: 'clamp(2rem, 3vw, 3rem)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: `${C.brass}06` }} />
                            <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `${C.verdigris}06` }} />

                            <h2 style={{ fontSize: 'clamp(1.3rem, 2vw, 1.6rem)', fontWeight: 700, marginBottom: '1.5rem', color: C.ink, position: 'relative' }}>
                                <CheckCircle size={20} style={{ display: 'inline', marginRight: '0.5rem', color: C.verdigris, verticalAlign: 'middle' }} />
                                Our Impact
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                                {[
                                    'Every product we create is designed with a single purpose: to make a positive difference in people\'s lives.',
                                    'From funeral homes to welfare organizations, we provide the technological foundation that allows our clients to focus on what truly matters — caring for their communities.',
                                    'We measure our success not by the complexity of our code, but by the simplicity and dignity we bring to the people we serve.',
                                    'Our platform handles thousands of critical operations daily with 99.9% uptime, ensuring our clients never miss a beat.',
                                ].map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                        <Star size={16} style={{ color: C.brass, flexShrink: 0, marginTop: '4px' }} />
                                        <p style={{ fontSize: 'clamp(0.9rem, 1.1vw, 0.95rem)', color: C.gray, lineHeight: 1.7, opacity: 0.85 }}>{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ─── Team ──────────────────────────────────────────────── */}
            <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 5vw, 2rem)' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <Reveal>
                        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem', color: C.ink }}>Meet the Team</h2>
                        <p style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)', color: C.gray, textAlign: 'center', marginBottom: 'clamp(2rem, 3vw, 2.5rem)', opacity: 0.85 }}>Passionate people building technology that matters</p>
                    </Reveal>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                        <TeamCard name="Esther Imbithe" role="Lead Developer" desc="Full-stack engineer passionate about building solutions that make a real difference." index={0} />
                        <TeamCard name="Peter Mumo" role="CTO / Software Engineer / Software Solutions Architect" desc="Leads technical strategy and architecture, building robust and scalable solutions." index={1} />
                        <TeamCard name="Mary Wanjiku" role="Operations Lead" desc="Ensures seamless delivery and 24/7 support for all our clients." index={2} />
                    </div>
                </div>
            </section>

            {/* ─── CTA ──────────────────────────────────────────────── */}
            <section style={{
                padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 5vw, 2rem)',
                background: `linear-gradient(180deg, ${C.bone} 0%, ${C.verdigris}08 100%)`,
                textAlign: 'center',
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <Reveal>
                        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '1rem', color: C.ink }}>Ready to Transform Your Operations?</h2>
                        <p style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1.05rem)', color: C.gray, marginBottom: '2rem', opacity: 0.85, lineHeight: 1.7 }}>
                            Join the growing community of organizations using RestPoint to serve their communities
                            with dignity, efficiency, and compassion.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button onClick={() => navigate('/register')}
                                style={{
                                    padding: '1rem 2.5rem', borderRadius: '12px', border: 'none',
                                    background: `linear-gradient(135deg, ${C.verdigris}, ${C.verdigrisDark})`,
                                    color: C.bone, fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = ''}>
                                Start Free <ArrowRight size={20} />
                            </button>
                            <button onClick={() => navigate('/solutions/funeral-homes')}
                                style={{
                                    padding: '1rem 2.5rem', borderRadius: '12px',
                                    border: `1px solid ${C.line}`, background: 'transparent',
                                    color: C.ink, fontSize: '1rem', fontWeight: 500, cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = C.bone; e.currentTarget.style.borderColor = C.ink; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.ink; e.currentTarget.style.borderColor = C.line; }}>
                                Learn More
                            </button>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ─── Footer ───────────────────────────────────────────── */}
            <Footer goTerms={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); }} softwareVersion="v1.0.0" />
        </div>
    );
}