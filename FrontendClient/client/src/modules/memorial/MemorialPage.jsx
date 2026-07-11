import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, Globe, MessageCircle, Camera, Shield, Star, Sparkles, ChevronRight, ExternalLink } from 'lucide-react';

const C = {
    ink: '#15171A',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    brassLight: '#A98F6E',
    brassPale: 'rgba(139,115,85,0.08)',
    brassPaleBorder: 'rgba(139,115,85,0.15)',
    verdigris: '#3D4F47',
    verdigrisDark: '#2E3F37',
    verdigrisLight: '#4D6359',
    verdigrisPale: 'rgba(61,79,71,0.06)',
    verdigrisPaleBorder: 'rgba(61,79,71,0.15)',
    accent: '#C77B5E',
    accentPale: 'rgba(199,123,94,0.08)',
    line: '#E3DDD0',
    lineMid: 'rgba(0,0,0,0.09)',
    gray: '#6B6862',
    text: '#1A1A1A',
    textSec: '#5C5C5C',
    textTer: '#8A8780',
    white: '#FFFFFF',
};

/* ---------- Animated Realistic Candle with fire ---------- */
const CandleIcon = ({ lit = true, size = 48 }) => (
    <svg width={size} height={size * 1.33} viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="16" y="28" width="16" height="30" rx="2" fill={C.bone} stroke={C.brassLight} strokeWidth="0.5" />
        <ellipse cx="24" cy="28" rx="8" ry="3" fill={C.bone2} stroke={C.brassLight} strokeWidth="0.5" />
        <line x1="24" y1="28" x2="24" y2="20" stroke={C.ink} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 40C14 40 12 42 14 44C16 46 14 48 14 48" stroke={C.brassLight} strokeWidth="0.8" fill="none" />
        <path d="M34 36C34 36 32 38 34 40C36 42 34 44 34 44" stroke={C.brassLight} strokeWidth="0.8" fill="none" />
        {lit && (
            <>
                <defs>
                    <radialGradient id="fg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <circle cx="24" cy="14" r="14" fill="url(#fg)">
                    <animate attributeName="r" values="14;16;12;14" dur="2s" repeatCount="indefinite" />
                </circle>
                <path d="M24 4C24 4 19 10 19 14C19 17 21 18 24 18C27 18 29 17 29 14C29 10 24 4 24 4Z" fill="#FF8C00" opacity="0.6">
                    <animate attributeName="d" values="M24 4C24 4 19 10 19 14C19 17 21 18 24 18C27 18 29 17 29 14C29 10 24 4 24 4Z;M24 3C24 3 18 10 18 14C18 17 21 19 24 19C27 19 30 17 30 14C30 10 24 3 24 3Z;M24 4C24 4 19 10 19 14C19 17 21 18 24 18C27 18 29 17 29 14C29 10 24 4 24 4Z" dur="0.8s" repeatCount="indefinite" />
                </path>
                <path d="M24 7C24 7 21 11 21 13C21 15 22.5 16 24 16C25.5 16 27 15 27 13C27 11 24 7 24 7Z" fill="#FFD700" opacity="0.9">
                    <animate attributeName="d" values="M24 7C24 7 21 11 21 13C21 15 22.5 16 24 16C25.5 16 27 15 27 13C27 11 24 7 24 7Z;M24 6C24 6 20 11 20 13C20 15 22.5 17 24 17C25.5 17 28 15 28 13C28 11 24 6 24 6Z;M24 7C24 7 21 11 21 13C21 15 22.5 16 24 16C25.5 16 27 15 27 13C27 11 24 7 24 7Z" dur="0.6s" repeatCount="indefinite" />
                </path>
                <circle cx="24" cy="10" r="1.5" fill="#FFF8DC" opacity="0.8">
                    <animate attributeName="r" values="1.5;2;1" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;1;0.6" dur="1.5s" repeatCount="indefinite" />
                </circle>
            </>
        )}
    </svg>
);

/* ---------- Intersection Observer hook ---------- */
const useInView = (threshold = 0.15) => {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView];
};

const FadeUp = ({ children, delay = 0, className = '' }) => {
    const [ref, inView] = useInView();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(40px)',
                transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
};

const SectionLabel = ({ children }) => (
    <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem',
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: C.brass, marginBottom: '1.25rem',
    }}>
        <span style={{ width: 24, height: 1, background: C.brass, display: 'inline-block' }} />
        {children}
    </div>
);

const SectionHeading = ({ children, sub }) => (
    <div style={{ marginBottom: '3.5rem' }}>
        <h2 style={{
            fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            color: C.text, fontWeight: 500, lineHeight: 1.2,
            letterSpacing: '-0.02em', marginBottom: sub ? '1rem' : 0,
        }}>{children}</h2>
        {sub && <p style={{ fontSize: '1.05rem', color: C.textSec, lineHeight: 1.7, maxWidth: 620 }}>{sub}</p>}
    </div>
);

export default function MemorialPage() {
    const navigate = useNavigate();
    const [candleCount, setCandleCount] = useState(23);
    const [message, setMessage] = useState('');
    const [lighted, setLighted] = useState(false);
    const [demoCandles, setDemoCandles] = useState([
        { name: 'Sarah M.', msg: 'Forever in our hearts mama. We miss you dearly ❤️', lit: true },
        { name: 'James K.', msg: 'Rest in perfect peace. Your legacy lives on.', lit: true },
        { name: 'Mary W.', msg: 'Gone but never forgotten. Thank you for everything.', lit: true },
        { name: 'Peter O.', msg: 'You raised a beautiful family. We honor your memory.', lit: false },
    ]);

    const handleLight = () => {
        if (!lighted && message.trim()) {
            setCandleCount(prev => prev + 1);
            setLighted(true);
            setDemoCandles(prev => [{ name: 'You', msg: message, lit: true }, ...prev.slice(0, 3)]);
        }
    };

    const features = [
        { icon: <CandleIcon lit={true} size={32} />, title: 'Digital Candle Lighting', desc: 'Friends and family can light virtual candles from anywhere in the world. Each candle glows with an animated flame, creating a beautiful tribute.' },
        { icon: <MessageCircle size={22} />, title: 'Condolence Messages', desc: 'Leave heartfelt messages, share memories, and read tributes from loved ones. Every message becomes part of the memorial story.' },
        { icon: <Camera size={22} />, title: 'Photo Gallery', desc: 'Create a visual journey through photos and memories. Upload images that celebrate the life and legacy of your loved one.' },
        { icon: <Globe size={22} />, title: 'Global Access', desc: 'Share a private link with family anywhere in the world. No apps to download, no accounts needed for visitors to participate.' },
        { icon: <Shield size={22} />, title: 'Private & Dignified', desc: 'Full privacy controls. You decide who can view, light candles, and leave messages. Keep it intimate or open to all.' },
        { icon: <Heart size={22} />, title: 'Lasting Legacy', desc: 'The memorial stays live forever. A permanent digital space where memories are preserved with dignity for generations to come.' },
    ];

    const benefits = [
        { icon: <Sparkles size={24} />, title: 'Beautiful & Dignified', desc: 'Elegant design that honors your loved one with the respect they deserve. Every detail crafted with care.', stat: 'Premium', statLabel: 'Design' },
        { icon: <Star size={24} />, title: 'Affordable at KES 4,000', desc: 'A one-time fee of only KES 4,000 for a permanent online memorial. No monthly subscriptions, no hidden costs.', stat: 'KES 4,000', statLabel: 'One-time fee' },
        { icon: <Globe size={24} />, title: 'Reach Everyone', desc: 'Family in the diaspora, friends abroad - everyone can participate regardless of distance or time zone.', stat: 'Global', statLabel: 'Access' },
        { icon: <Shield size={24} />, title: 'Safe & Secure', desc: 'Your memories are protected. Full control over privacy settings with the ability to moderate messages and photos.', stat: 'Private', statLabel: 'Control' },
    ];

    const relatedLinks = [
        { to: '/mortuary-management-software', label: 'Mortuary Management Software' },
        { to: '/funeral-home-management-software', label: 'Funeral Home ERP' },
        { to: '/hospital-mortuary-software', label: 'Hospital Mortuary Software' },
        { to: '/hearse-management', label: 'Hearse Management Software' },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: ${C.textSec}; background: ${C.white}; -webkit-font-smoothing: antialiased; }

        .mp-wrap { max-width: 1180px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2.5rem); }
        .mp-divider { height: 1px; background: linear-gradient(90deg, transparent, ${C.line} 20%, ${C.line} 80%, transparent); }

        .mp-btn-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: ${C.verdigris}; color: ${C.white}; border: none;
          padding: 0.85rem 2rem; border-radius: 8px;
          font-size: 0.9rem; font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.25s ease;
        }
        .mp-btn-primary:hover { background: ${C.verdigrisLight}; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(61,79,71,0.3); }

        .mp-btn-outline {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: transparent; color: ${C.textSec};
          border: 1px solid ${C.line}; padding: 0.85rem 2rem;
          border-radius: 8px; font-size: 0.9rem; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.25s ease;
        }
        .mp-btn-outline:hover { border-color: ${C.textTer}; color: ${C.text}; transform: translateY(-2px); }

        .mp-btn-gold {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: ${C.brass}; color: ${C.white}; border: none;
          padding: 0.85rem 2rem; border-radius: 8px;
          font-size: 0.9rem; font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.25s ease;
        }
        .mp-btn-gold:hover { background: ${C.brassLight}; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(139,115,85,0.3); }

        .mp-related-link {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 1rem 1.25rem;
          background: ${C.bone};
          border: 1px solid ${C.line};
          border-radius: 10px;
          font-size: 0.85rem; color: ${C.textSec};
          transition: all 0.25s ease;
          cursor: pointer; text-decoration: none;
        }
        .mp-related-link:hover {
          background: ${C.white};
          border-color: ${C.verdigrisPaleBorder};
          color: ${C.text};
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
        }
        .mp-related-link svg { flex-shrink: 0; color: ${C.verdigris}; opacity: 0.5; transition: opacity 0.2s; }
        .mp-related-link:hover svg { opacity: 1; }
      `}</style>

            <div className="mp-page" style={{ background: C.white, color: C.textSec, fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
                {/* ═══════════ HERO ═══════════ */}
                <section style={{
                    position: 'relative',
                    padding: 'clamp(6rem, 12vw, 10rem) 0 clamp(5rem, 10vw, 8rem)',
                    overflow: 'hidden',
                    background: C.verdigrisDark,
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(ellipse 70% 60% at 20% 15%, rgba(199,123,94,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 85% 85%, rgba(139,115,85,0.08) 0%, transparent 60%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                        maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 70%)',
                        WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div className="mp-wrap">
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <FadeUp>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '0.72rem', color: C.brass, letterSpacing: '0.02em',
                                    marginBottom: '2rem',
                                }}>
                                    <span>Home</span>
                                    <ChevronRight size={12} />
                                    <span>Online Memorial</span>
                                </div>
                            </FadeUp>

                            <FadeUp delay={80}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    <CandleIcon lit={true} size={96} />
                                </div>
                            </FadeUp>

                            <FadeUp delay={160}>
                                <h1 style={{
                                    fontFamily: "'Fraunces', serif",
                                    fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
                                    color: C.bone,
                                    fontWeight: 500,
                                    lineHeight: 1.1,
                                    letterSpacing: '-0.03em',
                                    marginBottom: '1.25rem',
                                    textAlign: 'center',
                                }}>
                                    <span style={{
                                        background: 'linear-gradient(135deg, #C77B5E, #E8A838)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}>Digital Memorial</span><br />
                                    Services Kenya
                                </h1>
                            </FadeUp>

                            <FadeUp delay={240}>
                                <p style={{
                                    fontSize: '1.1rem',
                                    color: 'rgba(250,248,244,0.8)',
                                    lineHeight: 1.8,
                                    marginBottom: '1rem',
                                    textAlign: 'center',
                                    maxWidth: 700,
                                    margin: '0 auto 1.5rem',
                                }}>
                                    We help families mourn from anywhere. Give your loved ones a dignified online memorial where
                                    friends and family worldwide can share memories, light candles, and leave messages of love.
                                </p>
                            </FadeUp>

                            <FadeUp delay={320}>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    background: 'rgba(250,248,244,0.08)',
                                    border: '1px solid rgba(250,248,244,0.15)',
                                    borderRadius: '12px',
                                    padding: '1rem 2rem',
                                    margin: '0 auto 2.5rem',
                                    textAlign: 'center',
                                    justifyContent: 'center',
                                    width: 'fit-content',
                                    display: 'block',
                                }}>
                                    <span style={{
                                        fontFamily: "'Fraunces', serif",
                                        fontSize: '2rem',
                                        color: C.brass,
                                        fontWeight: 500,
                                    }}>KES 4,000</span>
                                    <span style={{ color: 'rgba(250,248,244,0.6)', fontSize: '0.85rem', marginLeft: '0.75rem' }}>
                                        one-time fee · permanent online memorial · no hidden costs
                                    </span>
                                </div>
                            </FadeUp>

                            <FadeUp delay={400}>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <button className="mp-btn-primary" onClick={() => navigate('/register')}>
                                        Create a Memorial <ArrowRight size={16} />
                                    </button>
                                    <button className="mp-btn-outline" style={{ color: C.bone, borderColor: 'rgba(250,248,244,0.3)' }} onClick={() => navigate('/contact')}>
                                        Talk to Us <ExternalLink size={14} />
                                    </button>
                                </div>
                            </FadeUp>
                        </div>
                    </div>
                </section>

                <div className="mp-divider" />

                {/* ═══════════ WHAT IS ═══════════ */}
                <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 0', background: C.white }}>
                    <div className="mp-wrap">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
                            <div>
                                <FadeUp>
                                    <SectionLabel>Overview</SectionLabel>
                                    <SectionHeading sub="A beautiful online space where families gather to honor and remember their loved ones with dignity.">
                                        What is a Digital Memorial?
                                    </SectionHeading>
                                </FadeUp>
                                <FadeUp delay={100}>
                                    <p style={{ fontSize: '1rem', lineHeight: 1.8, color: C.textSec, marginBottom: '1.25rem' }}>
                                        A <strong>digital memorial</strong> is an online tribute page where family and friends can
                                        come together to celebrate the life of a loved one. In today's world, families are spread
                                        across Kenya and the diaspora — a physical gathering isn't always possible for everyone.
                                    </p>
                                </FadeUp>
                                <FadeUp delay={200}>
                                    <p style={{ fontSize: '1rem', lineHeight: 1.8, color: C.textSec, marginBottom: '1.25rem' }}>
                                        Our <strong>online memorial service</strong> provides a permanent digital space where
                                        people can <strong>light virtual candles</strong>, share memories, leave condolence messages,
                                        upload photos, and find comfort together — <strong>all from anywhere in the world</strong>.
                                    </p>
                                </FadeUp>
                                <FadeUp delay={300}>
                                    <p style={{ fontSize: '1rem', lineHeight: 1.8, color: C.textSec }}>
                                        For just <strong>KES 4,000</strong>, you get a lasting tribute that honors your loved one
                                        with the dignity they deserve. No monthly fees, no ads, just a beautiful memorial that lasts forever.
                                    </p>
                                </FadeUp>
                            </div>

                            <div>
                                <FadeUp delay={200}>
                                    <div style={{
                                        background: C.bone,
                                        border: `1px solid ${C.line}`,
                                        borderRadius: '14px',
                                        padding: '2rem',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            content: '',
                                            position: 'absolute', top: '-50%', right: '-50%',
                                            width: '200%', height: '200%',
                                            background: 'radial-gradient(circle at 70% 30%, rgba(61,79,71,0.06) 0%, transparent 50%)',
                                            pointerEvents: 'none',
                                        }} />
                                        {[
                                            { num: '01', title: 'Create Memorial Page', desc: 'Set up in minutes with photos and details' },
                                            { num: '02', title: 'Share with Family', desc: 'Send the private link to loved ones worldwide' },
                                            { num: '03', title: 'Light Candles Together', desc: 'Friends light virtual candles with animated flames' },
                                            { num: '04', title: 'Share Memories', desc: 'Photos, messages, and tributes from everyone' },
                                            { num: '05', title: 'Find Comfort', desc: 'A lasting space for grief, healing, and remembrance' },
                                        ].map((item, i) => (
                                            <div key={i} style={{
                                                display: 'flex', alignItems: 'flex-start', gap: '1rem',
                                                padding: '1rem 0',
                                                borderBottom: i < 4 ? `1px solid ${C.line}` : 'none',
                                                position: 'relative',
                                            }}>
                                                <div style={{
                                                    fontFamily: "'JetBrains Mono', monospace",
                                                    fontSize: '0.7rem', color: C.verdigris,
                                                    background: C.verdigrisPale,
                                                    border: `1px solid ${C.verdigrisPaleBorder}`,
                                                    width: '28px', height: '28px', borderRadius: '6px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0, marginTop: '2px',
                                                }}>{item.num}</div>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', color: C.text, fontWeight: 600, marginBottom: '0.25rem' }}>{item.title}</div>
                                                    <div style={{ fontSize: '0.82rem', color: C.textTer, lineHeight: 1.6 }}>{item.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </FadeUp>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mp-divider" />

                {/* ═══════════ DEMO / INTERACTIVE ═══════════ */}
                <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 0', background: C.verdigrisDark, position: 'relative' }}>
                    <div style={{
                        position: 'absolute', top: '30%', left: '40%', transform: 'translate(-50%, -50%)',
                        width: '700px', height: '500px',
                        background: 'radial-gradient(ellipse, rgba(199,123,94,0.06) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    <div className="mp-wrap" style={{ position: 'relative', zIndex: 2 }}>
                        <FadeUp>
                            <SectionLabel>Experience It</SectionLabel>
                            <h2 style={{
                                fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                                color: C.bone, fontWeight: 500, lineHeight: 1.2,
                                letterSpacing: '-0.02em', marginBottom: '1rem',
                            }}>
                                Light a Candle. Leave a Message.
                            </h2>
                            <p style={{ fontSize: '1.05rem', color: 'rgba(250,248,244,0.7)', lineHeight: 1.7, maxWidth: 620, marginBottom: '3.5rem' }}>
                                Try it yourself. This is exactly what your loved ones will experience — a beautiful, dignified space to remember.
                            </p>
                        </FadeUp>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
                            <FadeUp delay={100}>
                                <div style={{
                                    background: 'rgba(250,248,244,0.05)',
                                    border: `1px solid ${C.verdigrisLight}`,
                                    borderRadius: '14px',
                                    padding: '2rem',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <CandleIcon lit={true} size={64} />
                                    </div>
                                    <div style={{ fontSize: '2rem', fontFamily: "'Fraunces', serif", color: C.bone, marginBottom: '0.3rem' }}>{candleCount}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'rgba(250,248,244,0.6)', marginBottom: '1.5rem' }}>candles lit in loving memory</div>

                                    <div style={{ borderTop: `1px solid ${C.verdigrisLight}`, paddingTop: '1.5rem' }}>
                                        <textarea
                                            placeholder="Write a message of condolence..."
                                            value={message}
                                            onChange={(e) => { setMessage(e.target.value); setLighted(false); }}
                                            style={{
                                                width: '100%', background: 'transparent', border: 'none', color: C.bone,
                                                fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', resize: 'none',
                                                outline: 'none', minHeight: '3.5rem', marginBottom: '1rem',
                                            }}
                                        />
                                        <button
                                            onClick={handleLight}
                                            disabled={!message.trim() || lighted}
                                            style={{
                                                width: '100%', padding: '0.85rem',
                                                background: lighted ? C.brass : 'transparent',
                                                color: C.bone,
                                                border: `1px solid ${C.brass}`,
                                                borderRadius: '8px',
                                                cursor: lighted ? 'default' : 'pointer',
                                                fontFamily: "'JetBrains Mono', monospace",
                                                fontSize: '0.8rem', letterSpacing: '0.06em', fontWeight: 500,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                            }}
                                        >
                                            {lighted ? (
                                                <>✨ Candle Lit — Thank You</>
                                            ) : (
                                                <><CandleIcon lit={false} size={20} /> Light a Candle</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </FadeUp>

                            <FadeUp delay={200}>
                                <div style={{
                                    background: 'rgba(250,248,244,0.03)',
                                    border: `1px solid ${C.verdigrisLight}`,
                                    borderRadius: '14px',
                                    padding: '2rem',
                                }}>
                                    <div style={{ fontSize: '0.9rem', color: C.brass, fontFamily: "'JetBrains Mono', monospace", marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
                                        Recent Messages from Loved Ones
                                    </div>
                                    {demoCandles.map((c, idx) => (
                                        <div key={idx} style={{
                                            marginBottom: '1rem',
                                            padding: '1rem',
                                            background: c.lit ? 'rgba(250,248,244,0.05)' : 'transparent',
                                            borderRadius: '8px',
                                            borderLeft: `2px solid ${c.lit ? C.brass : C.verdigrisLight}`,
                                            opacity: c.lit ? 1 : 0.5,
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: C.bone }}>{c.name}</span>
                                                {c.lit && <span style={{ fontSize: '0.65rem', color: C.brass, fontFamily: "'JetBrains Mono', monospace" }}>🕯️ lit a candle</span>}
                                            </div>
                                            <div style={{ fontSize: '0.82rem', color: 'rgba(250,248,244,0.7)', fontStyle: 'italic' }}>
                                                "{c.msg}"
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FadeUp>
                        </div>
                    </div>
                </section>

                <div className="mp-divider" />

                {/* ═══════════ FEATURES ═══════════ */}
                <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 0', position: 'relative', background: C.bone }}>
                    <div style={{
                        position: 'absolute', top: '30%', left: '40%', transform: 'translate(-50%, -50%)',
                        width: '700px', height: '500px',
                        background: 'radial-gradient(ellipse, rgba(139,115,85,0.06) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    <div className="mp-wrap" style={{ position: 'relative', zIndex: 2 }}>
                        <FadeUp>
                            <SectionLabel>Features</SectionLabel>
                            <SectionHeading sub="Everything you need to create a lasting and dignified online memorial.">
                                What's Included in Our Digital Memorial Service
                            </SectionHeading>
                        </FadeUp>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '1.25rem',
                        }}>
                            {features.map((f, i) => (
                                <FadeUp key={i} delay={i * 80}>
                                    <div style={{
                                        background: C.white,
                                        border: `1px solid ${C.line}`,
                                        borderRadius: '12px',
                                        padding: '1.75rem 1.5rem',
                                        transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            content: '', position: 'absolute',
                                            top: 0, left: 0, right: 0, height: '2px',
                                            background: 'linear-gradient(90deg, transparent, #C77B5E, transparent)',
                                            opacity: 0, transition: 'opacity 0.35s ease',
                                        }} />
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '9px',
                                            background: C.verdigrisPale,
                                            border: `1px solid ${C.verdigrisPaleBorder}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: C.verdigris,
                                            marginBottom: '1.1rem',
                                        }}>{f.icon}</div>
                                        <h3 style={{ fontSize: '0.95rem', color: C.text, fontWeight: 600, marginBottom: '0.6rem', lineHeight: 1.3 }}>
                                            {f.title}
                                        </h3>
                                        <p style={{ fontSize: '0.82rem', color: C.textTer, lineHeight: 1.65 }}>
                                            {f.desc}
                                        </p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mp-divider" />

                {/* ═══════════ BENEFITS ═══════════ */}
                <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 0', background: C.white }}>
                    <div className="mp-wrap">
                        <FadeUp>
                            <SectionLabel>Why Choose Us</SectionLabel>
                            <SectionHeading sub="Give your loved ones the memorial they deserve — affordable, dignified, and accessible to everyone.">
                                Why Rest Point for Digital Memorials?
                            </SectionHeading>
                        </FadeUp>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                            {benefits.map((b, i) => (
                                <FadeUp key={i} delay={i * 100}>
                                    <div style={{
                                        background: C.bone,
                                        border: `1px solid ${C.line}`,
                                        borderRadius: '12px',
                                        padding: '2rem',
                                        display: 'flex',
                                        gap: '1.5rem',
                                        alignItems: 'flex-start',
                                        transition: 'all 0.35s ease',
                                    }}>
                                        <div style={{ flexShrink: 0 }}>
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '12px',
                                                background: C.white,
                                                border: `1px solid ${C.line}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: C.verdigris, marginBottom: '0.75rem',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                            }}>{b.icon}</div>
                                            <div>
                                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.4rem', color: C.text, fontWeight: 500, lineHeight: 1 }}>{b.stat}</div>
                                                <div style={{ fontSize: '0.7rem', color: C.textTer, marginTop: '0.2rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>{b.statLabel}</div>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '1.05rem', color: C.text, fontWeight: 600, marginBottom: '0.6rem' }}>{b.title}</h3>
                                            <p style={{ fontSize: '0.88rem', color: C.textSec, lineHeight: 1.7 }}>{b.desc}</p>
                                        </div>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mp-divider" />

                {/* ═══════════ PRICING ═══════════ */}
                <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 0', background: C.white }}>
                    <div className="mp-wrap">
                        <FadeUp>
                            <div style={{
                                position: 'relative',
                                background: 'linear-gradient(135deg, #FAF8F4 0%, #F3EFE6 100%)',
                                border: `1px solid ${C.line}`,
                                borderRadius: '20px',
                                padding: 'clamp(3rem, 6vw, 5rem)',
                                textAlign: 'center',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    content: '', position: 'absolute', inset: 0,
                                    background: 'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(199,123,94,0.08) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 80% 80%, rgba(61,79,71,0.06) 0%, transparent 70%)',
                                    pointerEvents: 'none',
                                }} />
                                <div style={{
                                    content: '', position: 'absolute', inset: 0,
                                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)',
                                    backgroundSize: '32px 32px',
                                    pointerEvents: 'none',
                                    maskImage: 'radial-gradient(ellipse 70% 70% at center, black, transparent)',
                                    WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at center, black, transparent)',
                                }} />
                                <div style={{ position: 'relative', zIndex: 2 }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <CandleIcon lit={true} size={56} />
                                    </div>
                                    <h2 style={{
                                        fontFamily: "'Fraunces', serif",
                                        fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                                        color: C.text, fontWeight: 500,
                                        marginBottom: '1rem',
                                    }}>
                                        Give Them a Memorial with Dignity
                                    </h2>
                                    <p style={{ fontSize: '1.05rem', color: C.textSec, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 1.5rem' }}>
                                        For just <strong style={{ color: C.brass }}>KES 4,000</strong>, create a permanent online memorial
                                        where family and friends can gather, share memories, light candles, and find comfort — from anywhere in the world.
                                    </p>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                                        marginBottom: '2rem', flexWrap: 'wrap',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: C.textTer }}>
                                            <Heart size={14} color={C.accent} /> Permanent memorial
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: C.textTer }}>
                                            <Globe size={14} color={C.verdigris} /> Global access
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: C.textTer }}>
                                            <Shield size={14} color={C.brass} /> Private & secure
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                        <button className="mp-btn-gold" onClick={() => navigate('/register')}>
                                            Create a Memorial Now <ArrowRight size={16} />
                                        </button>
                                        <button className="mp-btn-outline" onClick={() => navigate('/contact')}>
                                            Talk to Us <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </section>

                <div className="mp-divider" />

                {/* ═══════════ RELATED ═══════════ */}
                <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 0', background: C.white }}>
                    <div className="mp-wrap">
                        <FadeUp>
                            <SectionLabel>Explore</SectionLabel>
                            <SectionHeading sub="">Learn More About Our Services</SectionHeading>
                        </FadeUp>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            {relatedLinks.map((r, i) => (
                                <FadeUp key={i} delay={i * 80}>
                                    <a href={r.to} className="mp-related-link">
                                        <ChevronRight size={14} />
                                        {r.label}
                                    </a>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}