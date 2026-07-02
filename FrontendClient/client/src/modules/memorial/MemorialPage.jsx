import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, ArrowRight, Menu, Heart, Globe, Shield, MessageCircle, Image } from 'lucide-react';
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

/* ---------- Mark ---------- */
const Mark = ({ size = 28, color = C.verdigris }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="1" />
        <path d="M16 8.5V23.5M9.5 16H22.5" stroke={color} strokeWidth="1" />
        <circle cx="16" cy="16" r="2.5" fill={color} />
    </svg>
);

/* ---------- Realistic SVG Candle with animated fire ---------- */
const CandleIcon = ({ lit = true, size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Candle body */}
        <rect x="16" y="28" width="16" height="30" rx="2" fill={C.bone} stroke={C.brassLight} strokeWidth="0.5" />
        {/* Candle top wax */}
        <ellipse cx="24" cy="28" rx="8" ry="3" fill={C.bone2} stroke={C.brassLight} strokeWidth="0.5" />
        {/* Wick */}
        <line x1="24" y1="28" x2="24" y2="20" stroke={C.ink} strokeWidth="1.5" strokeLinecap="round" />
        {/* Drip lines */}
        <path d="M14 40C14 40 12 42 14 44C16 46 14 48 14 48" stroke={C.brassLight} strokeWidth="0.8" fill="none" />
        <path d="M34 36C34 36 32 38 34 40C36 42 34 44 34 44" stroke={C.brassLight} strokeWidth="0.8" fill="none" />
        {/* Flame glow */}
        {lit && (
            <>
                <defs>
                    <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <circle cx="24" cy="14" r="14" fill="url(#flameGlow)">
                    <animate attributeName="r" values="14;16;12;14" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* Outer flame */}
                <path d="M24 4C24 4 19 10 19 14C19 17 21 18 24 18C27 18 29 17 29 14C29 10 24 4 24 4Z" fill="#FF8C00" opacity="0.6">
                    <animate attributeName="d" values="
                        M24 4C24 4 19 10 19 14C19 17 21 18 24 18C27 18 29 17 29 14C29 10 24 4 24 4Z;
                        M24 3C24 3 18 10 18 14C18 17 21 19 24 19C27 19 30 17 30 14C30 10 24 3 24 3Z;
                        M24 4C24 4 19 10 19 14C19 17 21 18 24 18C27 18 29 17 29 14C29 10 24 4 24 4Z" dur="0.8s" repeatCount="indefinite" />
                </path>
                {/* Inner flame */}
                <path d="M24 7C24 7 21 11 21 13C21 15 22.5 16 24 16C25.5 16 27 15 27 13C27 11 24 7 24 7Z" fill="#FFD700" opacity="0.9">
                    <animate attributeName="d" values="
                        M24 7C24 7 21 11 21 13C21 15 22.5 16 24 16C25.5 16 27 15 27 13C27 11 24 7 24 7Z;
                        M24 6C24 6 20 11 20 13C20 15 22.5 17 24 17C25.5 17 28 15 28 13C28 11 24 6 24 6Z;
                        M24 7C24 7 21 11 21 13C21 15 22.5 16 24 16C25.5 16 27 15 27 13C27 11 24 7 24 7Z" dur="0.6s" repeatCount="indefinite" />
                </path>
                {/* Light sparkle */}
                <circle cx="24" cy="10" r="1.5" fill="#FFF8DC" opacity="0.8">
                    <animate attributeName="r" values="1.5;2;1" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;1;0.6" dur="1.5s" repeatCount="indefinite" />
                </circle>
            </>
        )}
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
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        background: C.ink,
                        border: `1px solid ${C.line}`,
                        borderRadius: '2px',
                        minWidth: '240px',
                        marginTop: '0.5rem',
                        zIndex: 1000,
                        boxShadow: '0 10px 30px rgba(21,23,26,0.2)',
                    }}
                >
                    {policies.map((policy, idx) => (
                        <button
                            key={idx}
                            onClick={() => { policy.onClick(); setOpen(false); }}
                            style={{
                                width: '100%',
                                padding: '0.8rem 1.1rem',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                color: C.grayLight,
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
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        background: C.ink,
                        border: `1px solid ${C.line}`,
                        borderRadius: '2px',
                        minWidth: '220px',
                        marginTop: '0.5rem',
                        zIndex: 1000,
                        boxShadow: '0 10px 30px rgba(21,23,26,0.2)',
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

export default function MemorialPage() {
    const [loaded, setLoaded] = useState(false);
    const [candles, setCandles] = useState(14);
    const [message, setMessage] = useState('');
    const [lighted, setLighted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 60);
        return () => clearTimeout(t);
    }, []);

    const handleLight = () => {
        if (!lighted && message.trim()) {
            setCandles(candles + 1);
            setLighted(true);
        }
    };

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
        .btn-brass { background: ${C.brass}; color: ${C.bone}; border: none; }
        .btn-brass:hover { background: ${C.brassLight}; }
      `}</style>

            {/* Navigation */}
            <nav>
                <div className="wrap nav-wrap">
                    <div className="logo" onClick={() => navigate('/')}>
                        <Mark size={26} color={C.ink} />
                        <span>Rest Point</span>
                    </div>
                    <div className="nav-links">
                        <button onClick={() => navigate('/')} className="nav-link">Features</button>
                        <button onClick={() => navigate('/about')} className="nav-link">About</button>
                        <button onClick={() => navigate('/insurance')} className="nav-link">Insurance</button>
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

            <main>
                {/* Hero Section */}
                <section style={{ paddingTop: '160px', paddingBottom: '5rem', background: C.verdigrisDark, color: C.bone }}>
                    <div className="wrap">
                        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', letterSpacing: '0.12em', color: C.brass, textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>
                                ONLINE MEMORIAL
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <CandleIcon lit={true} size={80} />
                            </div>
                            <h1 style={{ color: C.bone, marginBottom: '1.5rem' }}>
                                Light a candle. Honor a life.
                            </h1>
                            <p style={{ fontSize: '1.2rem', color: C.grayLight, lineHeight: '1.8', maxWidth: '700px', margin: '0 auto 2rem' }}>
                                In a digital age, we bring the timeless tradition of candle lighting to the web.
                                Create a lasting memorial where family and friends can gather, share memories, and find comfort together.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Interactive Memorial Demo */}
                <section style={{ padding: '6rem 0', background: C.bone }}>
                    <div className="wrap">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: C.brass, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>HOW IT WORKS</div>
                                <h2 style={{ marginBottom: '1rem' }}>The power of a single candle</h2>
                                <p style={{ fontSize: '1.05rem', marginBottom: '1.5rem', lineHeight: '1.8' }}>
                                    Lighting a candle is a universal symbol of remembrance. Now, families can do this together online,
                                    no matter where they are in the world.
                                </p>
                                <p style={{ marginBottom: '2rem', lineHeight: '1.8' }}>
                                    Each candle lit represents a life remembered, a moment shared, and a community united in grief and love.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[
                                        'Create a memorial page in minutes',
                                        'Share the link with family and friends',
                                        'Light candles and leave messages',
                                        'Share photos and cherished memories',
                                        'Receive condolences from loved ones'
                                    ].map((feature, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(61,79,71,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Check size={14} color={C.verdigris} />
                                            </div>
                                            <span style={{ fontSize: '0.95rem' }}>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Interactive Demo */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <div style={{
                                    background: C.verdigrisDark,
                                    border: `1px solid ${C.verdigrisLight}`,
                                    padding: '2rem',
                                    maxWidth: '400px',
                                    width: '100%',
                                    borderRadius: '4px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                }}>
                                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brass, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>ONLINE MEMORIAL</div>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                            <CandleIcon lit={true} size={56} />
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontFamily: "'Fraunces', serif", color: C.bone, marginBottom: '0.4rem' }}>{candles} candles lit</div>
                                        <div style={{ fontSize: '0.85rem', color: C.grayLight }}>In loving memory</div>
                                    </div>

                                    <div style={{ borderTop: `1px solid ${C.lineDark}`, paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                                        <textarea
                                            placeholder="Leave a message of condolence..."
                                            value={message}
                                            onChange={(e) => { setMessage(e.target.value); setLighted(false); }}
                                            style={{
                                                width: '100%', background: 'transparent', border: 'none', color: C.bone,
                                                fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', resize: 'none',
                                                outline: 'none', minHeight: '4rem', marginBottom: '1rem'
                                            }}
                                        />
                                        <button
                                            onClick={handleLight}
                                            disabled={!message.trim() || lighted}
                                            style={{
                                                width: '100%', padding: '0.75rem', background: lighted ? C.brass : 'transparent',
                                                color: C.bone, border: `1px solid ${C.brass}`, cursor: lighted ? 'default' : 'pointer',
                                                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', letterSpacing: '0.06em', fontWeight: 500,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                            }}
                                        >
                                            {lighted ? (
                                                <>Candle lit - Thank you</>
                                            ) : (
                                                <><CandleIcon lit={false} size={20} /> Light a candle</>
                                            )}
                                        </button>
                                    </div>

                                    <div style={{ borderTop: `1px solid ${C.lineDark}`, paddingTop: '1.5rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: C.grayLight, marginBottom: '1rem' }}>Recent Messages</div>
                                        {[
                                            { name: 'Sarah M.', message: 'Forever in our hearts' },
                                            { name: 'James K.', message: 'Rest in peace' },
                                            { name: 'Mary W.', message: 'Gone but never forgotten' }
                                        ].map((msg, idx) => (
                                            <div key={idx} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'rgba(250,248,244,0.03)', borderRadius: '4px', borderLeft: `2px solid ${C.brass}` }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 500, color: C.bone, marginBottom: '0.25rem' }}>{msg.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: C.grayLight, fontStyle: 'italic' }}>"{msg.message}"</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why It Matters */}
                <section style={{ padding: '6rem 0', background: C.bone2 }}>
                    <div className="wrap">
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: C.brass, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>WHY IT MATTERS</div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>The importance of digital memorials</h2>
                            <p style={{ fontSize: '1.05rem', color: C.gray, maxWidth: '700px', margin: '0 auto' }}>
                                In times of loss, distance should not prevent us from coming together to remember and honor our loved ones.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: `1px solid ${C.line}` }}>
                                <div style={{ width: '48px', height: '48px', background: 'rgba(139,115,85,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <CandleIcon lit={true} size={28} />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>A Timeless Tradition</h3>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Lighting candles has been a symbol of remembrance across cultures for centuries. Now, this tradition continues online,
                                    allowing anyone, anywhere to participate in honoring a life.
                                </p>
                            </div>

                            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: `1px solid ${C.line}` }}>
                                <div style={{ width: '48px', height: '48px', background: 'rgba(61,79,71,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <Globe size={24} color={C.verdigris} />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Global Community</h3>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Family members spread across the world can come together in one place. No travel required, no time constraints—just
                                    a shared moment of remembrance whenever and wherever they choose.
                                </p>
                            </div>

                            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: `1px solid ${C.line}` }}>
                                <div style={{ width: '48px', height: '48px', background: 'rgba(199,123,94,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <Heart size={24} color={C.accent} />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Healing Together</h3>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Sharing memories and lighting candles together provides comfort and closure. It's a simple yet powerful way to support
                                    one another through grief and celebrate a life well-lived.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section style={{ padding: '6rem 0', background: C.verdigrisDark, color: C.bone }}>
                    <div className="wrap">
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: C.brass, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>FEATURES</div>
                            <h2 style={{ color: C.bone, marginBottom: '1rem' }}>Everything you need to honor a life</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                            <div style={{ background: 'rgba(250,248,244,0.05)', padding: '2rem', borderRadius: '8px', border: `1px solid ${C.verdigrisLight}` }}>
                                <div style={{ width: '48px', height: '48px', background: 'rgba(250,248,244,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <CandleIcon lit={true} size={28} />
                                </div>
                                <h3 style={{ color: C.bone, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Digital Candles</h3>
                                <p style={{ color: C.grayLight, fontSize: '0.9rem' }}>Light an unlimited number of candles. Each one represents a life remembered and a moment of reflection.</p>
                            </div>

                            <div style={{ background: 'rgba(250,248,244,0.05)', padding: '2rem', borderRadius: '8px', border: `1px solid ${C.verdigrisLight}` }}>
                                <div style={{ width: '48px', height: '48px', background: 'rgba(250,248,244,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <MessageCircle size={24} color={C.brass} />
                                </div>
                                <h3 style={{ color: C.bone, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Condolence Messages</h3>
                                <p style={{ color: C.grayLight, fontSize: '0.9rem' }}>Leave heartfelt messages. Family and friends can read and share their grief and fond memories.</p>
                            </div>

                            <div style={{ background: 'rgba(250,248,244,0.05)', padding: '2rem', borderRadius: '8px', border: `1px solid ${C.verdigrisLight}` }}>
                                <div style={{ width: '48px', height: '48px', background: 'rgba(250,248,244,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <Image size={24} color={C.brass} />
                                </div>
                                <h3 style={{ color: C.bone, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Photo Gallery</h3>
                                <p style={{ color: C.grayLight, fontSize: '0.9rem' }}>Upload and share photos throughout the memorial. Create a visual tribute that celebrates their life.</p>
                            </div>

                            <div style={{ background: 'rgba(250,248,244,0.05)', padding: '2rem', borderRadius: '8px', border: `1px solid ${C.verdigrisLight}` }}>
                                <div style={{ width: '48px', height: '48px', background: 'rgba(250,248,244,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <Shield size={24} color={C.brass} />
                                </div>
                                <h3 style={{ color: C.bone, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Private & Secure</h3>
                                <p style={{ color: C.grayLight, fontSize: '0.9rem' }}>Control who can view and contribute. Keep the memorial private or share it with the world.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section style={{ padding: '5rem 0', background: C.bone }}>
                    <div className="wrap">
                        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
                            <h2 style={{ marginBottom: '1rem' }}>Ready to create a lasting tribute?</h2>
                            <p style={{ fontSize: '1.1rem', color: C.gray, marginBottom: '2rem' }}>
                                Give families the gift of remembrance. Set up an online memorial for your funeral home today.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button className="btn btn-dark" onClick={goStart}>
                                    Get started <ArrowRight size={18} />
                                </button>
                                <button className="btn btn-line" onClick={() => navigate('/')}>
                                    Back to home
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer navigate={navigate} goTerms={goTerms} />
        </>
    );
}