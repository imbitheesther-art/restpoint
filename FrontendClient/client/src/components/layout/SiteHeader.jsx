import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from '../../utils/icons/icons';
import { C } from '../../styles/theme';

const SiteHeader = ({ transparent = false, hideSignIn = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setMenuOpen(false); }, [location]);

    const navLinks = [
        { label: 'Home', path: '/' },
        { label: 'Churches', path: '/solutions/churches' },
        { label: 'SACCOs', path: '/solutions/saccos' },
        { label: 'Chamas', path: '/solutions/chamas' },
        { label: 'Funeral Homes', path: '/solutions/funeral-homes' },
        { label: 'About', path: '/about-welt-tallis' },
        { label: 'Contact', path: '/contact' },
    ];

    const bg = transparent && !scrolled ? 'transparent' : `rgba(21,23,26,0.95)`;
    const border = transparent && !scrolled ? 'transparent' : C.lineDark;

    return (
        <>
            {/* ─── Nav Bar ────────────────────────────────────────── */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                background: bg,
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderBottom: `1px solid ${border}`,
                padding: '0 clamp(1rem, 4vw, 2rem)',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.3s ease, border-color 0.3s ease',
            }}>
                {/* Logo */}
                <div onClick={() => navigate('/')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: `linear-gradient(135deg, ${C.verdigris}, ${C.verdigrisLight})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: C.bone, fontSize: '0.8rem', fontWeight: 800
                    }}>RP</div>
                    <span style={{ fontWeight: 600, fontSize: '1rem', color: C.bone, display: 'none' }} className="rp-logo-text">RestPoint</span>
                </div>

                {/* Desktop Nav Links */}
                <div style={{
                    display: 'flex', gap: '0.25rem', alignItems: 'center', flex: 1, justifyContent: 'center',
                }} className="rp-desktop-nav">
                    {navLinks.map((link, idx) => (
                        <button key={idx} onClick={() => navigate(link.path)}
                            style={{
                                padding: '0.4rem 0.75rem', borderRadius: '6px',
                                background: 'transparent', border: 'none',
                                color: location.pathname === link.path ? C.bone : C.grayLight,
                                fontSize: '0.82rem', fontWeight: location.pathname === link.path ? 600 : 400,
                                cursor: 'pointer', whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = C.bone; }}
                            onMouseLeave={e => { if (location.pathname !== link.path) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.grayLight; } }}>
                            {link.label}
                        </button>
                    ))}
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                    {!hideSignIn && (
                        <button onClick={() => navigate('/login')}
                            style={{
                                padding: '0.45rem 1rem', borderRadius: '8px',
                                border: `1px solid ${C.verdigrisLight}`,
                                background: 'transparent', color: C.bone,
                                fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            className="rp-signin-btn"
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                            Sign In
                        </button>
                    )}
                    <button onClick={() => navigate('/register')}
                        style={{
                            padding: '0.45rem 1rem', borderRadius: '8px', border: 'none',
                            background: `linear-gradient(135deg, ${C.verdigris}, ${C.verdigrisDark})`,
                            color: C.bone, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        className="rp-start-btn"
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                        Get Started
                    </button>
                    <button onClick={() => setMenuOpen(!menuOpen)}
                        style={{
                            background: 'none', border: 'none', color: C.bone,
                            cursor: 'pointer', padding: '0.25rem', display: 'none',
                        }}
                        className="rp-mobile-toggle">
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* ─── Mobile Drawer ───────────────────────────────────── */}
            <div style={{
                position: 'fixed', top: 64, right: menuOpen ? 0 : '-100%',
                width: '300px', maxWidth: '85vw',
                height: 'calc(100vh - 64px)', background: C.ink, zIndex: 999,
                borderLeft: `1px solid ${C.lineDark}`,
                transition: 'right 0.4s cubic-bezier(0.16,1,0.3,1)',
                padding: '1.25rem', overflowY: 'auto',
            }}>
                {navLinks.map((link, idx) => (
                    <button key={idx} onClick={() => { navigate(link.path); setMenuOpen(false); }}
                        style={{
                            display: 'block', width: '100%', padding: '0.85rem 1rem',
                            marginBottom: '0.25rem',
                            background: location.pathname === link.path ? 'rgba(61,79,71,0.2)' : 'transparent',
                            border: location.pathname === link.path ? `1px solid ${C.verdigrisLight}30` : `1px solid ${C.lineDark}`,
                            borderRadius: '10px', color: C.bone,
                            fontSize: '0.95rem', fontWeight: location.pathname === link.path ? 600 : 400,
                            textAlign: 'left', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}>
                        {link.label}
                    </button>
                ))}
                <div style={{ height: '1px', background: C.lineDark, margin: '1rem 0' }} />
                <button onClick={() => { navigate('/register'); setMenuOpen(false); }}
                    style={{
                        display: 'block', width: '100%', padding: '0.85rem 1rem',
                        background: `linear-gradient(135deg, ${C.verdigris}, ${C.verdigrisDark})`,
                        border: 'none', borderRadius: '10px', color: C.bone,
                        fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                        textAlign: 'center',
                    }}>
                    Get Started Free <ArrowRight size={16} style={{ display: 'inline', marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                </button>
            </div>

            {/* ─── Overlay ─────────────────────────────────────────── */}
            {menuOpen && (
                <div onClick={() => setMenuOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.6)' }} />
            )}

            {/* ─── Responsive Styles ──────────────────────────────── */}
            <style>{`
                @media (max-width: 768px) {
                    .rp-desktop-nav { display: none !important; }
                    .rp-signin-btn { display: none !important; }
                    .rp-start-btn { display: none !important; }
                    .rp-mobile-toggle { display: flex !important; }
                    .rp-logo-text { display: inline !important; }
                }
                @media (min-width: 769px) {
                    .rp-mobile-toggle { display: none !important; }
                }
            `}</style>
        </>
    );
};

export default SiteHeader;