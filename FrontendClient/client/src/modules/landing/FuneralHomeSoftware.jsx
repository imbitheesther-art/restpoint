import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Mail, Phone, MapPin, Cloud, Lock, Zap, Check, X, Users, Building, Heart, Shield, BookOpen, ArrowRight, ExternalLink, Menu } from 'lucide-react';
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
            transform: shown ? 'translateY(0)' : 'translateY(30px)',
            transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
            ...style
        }}>
            {children}
        </div>
    );
};

const FuneralHomeSoftware = () => {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div style={{ minHeight: '100vh', background: C.bone, color: C.ink, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            {/* NAV */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(250,248,244,0.92)', backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${C.line}`,
                padding: '1.1rem 2rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.35rem', fontWeight: 600, letterSpacing: '-0.02em', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    Rest Point
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {['Solutions', 'Resources', 'Pricing', 'Contact'].map(item => (
                        <a key={item} href="#" style={{ textDecoration: 'none', color: C.gray, fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}
                            onMouseEnter={e => e.target.style.color = C.ink}
                            onMouseLeave={e => e.target.style.color = C.gray}>
                            {item}
                        </a>
                    ))}
                    <button onClick={() => navigate('/register')} style={{
                        background: C.ink, color: C.bone, border: 'none', padding: '0.65rem 1.4rem',
                        borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600
                    }}>
                        Get Started
                    </button>
                </div>
            </nav>

            {/* HERO */}
            <section style={{
                padding: '7rem 2rem 6rem', textAlign: 'center',
                background: `linear-gradient(180deg, ${C.verdigrisTint} 0%, ${C.bone} 100%)`
            }}>
                <Reveal>
                    <div style={{
                        display: 'inline-block', background: C.ink, color: C.bone,
                        padding: '0.4rem 1.1rem', borderRadius: '999px', fontSize: '0.8rem',
                        fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '0.04em'
                    }}>
                        🏠 Built for Funeral Homes
                    </div>
                </Reveal>
                <Reveal delay={100}>
                    <h1 style={{
                        fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 700, lineHeight: 1.15,
                        maxWidth: '900px', margin: '0 auto 1.5rem', letterSpacing: '-0.03em'
                    }}>
                        The Operating System for <span style={{ color: C.verdigris }}>Modern Funeral Homes</span>
                    </h1>
                </Reveal>
                <Reveal delay={200}>
                    <p style={{
                        fontSize: '1.15rem', color: C.gray, maxWidth: '640px', margin: '0 auto 2.5rem',
                        lineHeight: 1.7
                    }}>
                        Streamline operations, honor families, and grow your business with purpose-built software designed exclusively for funeral home professionals.
                    </p>
                </Reveal>
                <Reveal delay={300}>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/register')} style={{
                            background: C.ink, color: C.bone, border: 'none', padding: '1rem 2.2rem',
                            borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
                        }}>
                            Start Free Trial
                        </button>
                        <button onClick={() => navigate('/contact')} style={{
                            background: 'transparent', color: C.ink, border: `2px solid ${C.ink}`,
                            padding: '1rem 2.2rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
                        }}>
                            Book Demo
                        </button>
                    </div>
                </Reveal>
            </section>

            {/* FEATURES GRID */}
            <section style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <Reveal>
                    <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                        Everything You Need to Run Your Funeral Home
                    </h2>
                    <p style={{ textAlign: 'center', color: C.gray, fontSize: '1.1rem', marginBottom: '4rem' }}>
                        From first call to final service, Rest Point has you covered.
                    </p>
                </Reveal>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {[
                        { icon: '📋', title: 'Case Management', desc: 'Track every case from initial call through to final service with complete timeline visibility.' },
                        { icon: '📅', title: 'Scheduling', desc: 'Coordinate viewings, services, and staff assignments with an intuitive calendar system.' },
                        { icon: '👥', title: 'Family Portal', desc: 'Give families secure access to arrangements, updates, and important documents.' },
                        { icon: '💼', title: 'Financial Management', desc: 'Handle billing, payments, and accounting with integrated financial tools.' },
                        { icon: '📄', title: 'Document Generation', desc: 'Create permits, certificates, and custom documents automatically.' },
                        { icon: '📊', title: 'Analytics & Reports', desc: 'Gain insights into your operations with comprehensive reporting dashboards.' },
                    ].map((feature, i) => (
                        <Reveal key={i} delay={i * 100}>
                            <div style={{
                                background: 'white', padding: '2rem', borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: `1px solid ${C.line}`,
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                            >
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>{feature.title}</h3>
                                <p style={{ color: C.gray, lineHeight: 1.6, fontSize: '0.95rem' }}>{feature.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{
                padding: '6rem 2rem', textAlign: 'center',
                background: `linear-gradient(135deg, ${C.verdigris} 0%, ${C.verdigrisDark} 100%)`, color: C.bone
            }}>
                <Reveal>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                        Ready to Transform Your Funeral Home?
                    </h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '2.5rem', opacity: 0.9 }}>
                        Join hundreds of funeral homes already using Rest Point to serve families better.
                    </p>
                    <button onClick={() => navigate('/register')} style={{
                        background: C.bone, color: C.ink, border: 'none', padding: '1.1rem 2.5rem',
                        borderRadius: '8px', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer'
                    }}>
                        Get Started Today
                    </button>
                </Reveal>
            </section>

            {/* FOOTER */}
            <Footer />
        </div>
    );
};

export default FuneralHomeSoftware;