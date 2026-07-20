import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, ArrowRight, ArrowUpRight, ShieldCheck, Users, Zap, CheckCircle, Code2, Server, Settings, Trophy, Building2, Smartphone } from '../../utils/icons/icons';
import Footer from '../../components/layout/Footer';

const C = {
    ink: '#15171A', bone: '#FAF8F4', bone2: '#F3EFE6',
    brass: '#8B7355', brassLight: '#A98F6E',
    verdigris: '#3D4F47', verdigrisDark: '#2E3F37', verdigrisLight: '#4D6359', verdigrisTint: '#EBEFEF',
    line: '#E3DDD0', lineDark: 'rgba(250,248,244,0.14)',
    gray: '#6B6862', grayLight: 'rgba(250,248,244,0.62)', grayDark: '#4A4844',
    accent: '#C77B5E',
};

function useReveal() {
    const ref = useRef(null);
    const [shown, setShown] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } },
            { threshold: 0.08 }
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
            ...style,
        }}>{children}</div>
    );
};

const RevealDir = ({ children, delay = 0, from = 'up', style = {}, className = '' }) => {
    const [ref, shown] = useReveal();
    const tf = { up: 'translateY(40px)', left: 'translateX(50px)', right: 'translateX(-50px)', scale: 'scale(0.94)' };
    return (
        <div ref={ref} className={className} style={{
            opacity: shown ? 1 : 0,
            transform: shown ? 'none' : tf[from] || tf.up,
            transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
            ...style,
        }}>{children}</div>
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
    const cbRef = useRef(callback);
    cbRef.current = callback;
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) cbRef.current(); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [ref]);
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
            <div className="policy-dropdown" style={{
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
                pointerEvents: open ? 'auto' : 'none',
            }}>
                <div className="policy-dropdown-inner">
                    {policies.map((p, i) => (
                        <button key={i} onClick={() => { p.onClick(); setOpen(false); }} className="policy-dropdown-item">
                            <span>{p.label}</span>
                            <ArrowRight size={13} className="policy-item-arrow" />
                        </button>
                    ))}
                </div>
            </div>
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
    const [scrolled, setScrolled] = useState(false);

    const goLogin = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); };
    const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
    const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

    useEffect(() => { document.title = 'About Welt Tallis | Software Development Company'; }, []);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="page-container">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500&display=swap');
                *{margin:0;padding:0;box-sizing:border-box}
                html{scroll-behavior:smooth}
                body{font-family:'Inter',sans-serif;color:${C.gray};background:${C.bone};-webkit-font-smoothing:antialiased}
                h1,h2,h3{font-family:'Fraunces',serif;font-weight:500;letter-spacing:-0.01em;color:${C.ink}}
                h1{font-size:clamp(2.5rem,6vw,4.2rem);line-height:1.08;margin-bottom:1.4rem}
                h2{font-size:clamp(1.9rem,4vw,2.5rem);line-height:1.2}
                h3{font-size:1.2rem;margin-bottom:0.6rem;color:${C.ink}}
                p{line-height:1.75;font-size:1rem;color:${C.gray}}
                a{color:inherit;text-decoration:none}
                .mono-label{font-family:'JetBrains Mono',monospace;font-size:0.7rem;letter-spacing:0.14em;text-transform:uppercase;color:${C.brass};font-weight:500}
                .label{font-family:'JetBrains Mono',monospace;font-size:0.74rem;letter-spacing:0.14em;text-transform:uppercase;color:${C.brass};font-weight:500}

                .btn{display:inline-flex;align-items:center;gap:0.5rem;padding:0.95rem 1.9rem;font-size:0.9rem;font-weight:500;font-family:'Inter',sans-serif;border:1px solid transparent;border-radius:8px;cursor:pointer;transition:all 0.3s ease;white-space:nowrap;letter-spacing:0.01em}
                .btn-dark{background:${C.ink};color:${C.bone}}
                .btn-dark:hover{background:${C.verdigris};transform:translateY(-2px);box-shadow:0 10px 20px rgba(21,23,26,0.15)}
                .btn-line{background:transparent;color:${C.ink};border-color:${C.line}}
                .btn-line:hover{background:${C.ink};color:${C.bone};border-color:${C.ink}}
                .btn-brass{background:${C.brass};color:${C.bone};border:none}
                .btn-brass:hover{background:${C.brassLight};transform:translateY(-2px);box-shadow:0 10px 20px rgba(139,115,85,0.25)}
                .btn-ghost{background:transparent;color:${C.bone};border:1px solid rgba(250,248,244,0.2)}
                .btn-ghost:hover{background:rgba(250,248,244,0.08);border-color:rgba(250,248,244,0.4)}
                .wrap{max-width:1180px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}

                nav{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(250,248,244,0.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid ${C.line};padding:1.2rem 0;transition:all 0.4s ease}
                nav.scrolled{background:rgba(250,248,244,0.96);box-shadow:0 1px 12px rgba(21,23,26,0.06)}
                .nav-wrap{display:flex;justify-content:space-between;align-items:center}
                .logo{display:flex;align-items:center;gap:0.7rem;font-family:'Fraunces',serif;font-size:1.3rem;font-weight:500;color:${C.ink};cursor:pointer;transition:opacity 0.3s}
                .logo:hover{opacity:0.8}
                .nav-links{display:flex;gap:2.5rem;align-items:center}
                .nav-link{font-size:0.85rem;color:${C.gray};text-decoration:none;cursor:pointer;transition:color 0.2s;background:transparent;border:none;font-family:'Inter',sans-serif;padding:0.5rem 0;position:relative}
                .nav-link::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1.5px;background:${C.verdigris};transition:width 0.3s ease}
                .nav-link:hover{color:${C.verdigris}}
                .nav-link:hover::after{width:100%}
                .nav-cta{display:flex;gap:0.75rem;align-items:center}
                .mobile-nav{display:none}

                .policy-dropdown{position:absolute;top:calc(100% + 8px);right:0;background:${C.bone};border:1px solid ${C.line};border-radius:12px;min-width:280px;z-index:1000;box-shadow:0 24px 48px rgba(21,23,26,0.12);overflow:hidden;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);transform-origin:top right}
                .policy-dropdown-inner{padding:0.4rem}
                .policy-dropdown-item{width:100%;padding:0.75rem 1rem;background:none;border:none;text-align:left;cursor:pointer;font-size:0.84rem;color:${C.gray};border-radius:8px;transition:all 0.2s;font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:space-between}
                .policy-dropdown-item:hover{background:${C.bone2};color:${C.ink}}
                .policy-item-arrow{color:${C.gray};opacity:0;transform:translateX(-4px);transition:all 0.2s}
                .policy-dropdown-item:hover .policy-item-arrow{opacity:1;transform:translateX(0);color:${C.verdigris}}

                .mobile-menu-container{position:absolute;top:100%;right:0;background:${C.bone};border:1px solid ${C.line};border-radius:8px;min-width:280px;margin-top:0.75rem;z-index:1000;box-shadow:0 20px 40px rgba(21,23,26,0.08);overflow:hidden}
                .mobile-link{display:block;width:100%;padding:0.9rem 1.2rem;background:none;border:none;text-align:left;cursor:pointer;font-size:0.88rem;color:${C.gray};text-decoration:none;border-bottom:1px solid ${C.line};font-family:'Inter',sans-serif;transition:background 0.2s}
                .mobile-link:hover{background:${C.bone2}}
                .mobile-policies-header{padding:0.5rem 0;border-bottom:1px solid ${C.line};background:${C.bone2}}

                /* ── Hero ── */
                .about-hero{padding-top:160px;padding-bottom:clamp(4rem,8vw,7rem);position:relative;overflow:hidden;background:#0A0A0A}
                .about-hero-grid-bg{position:absolute;inset:0;background-image:radial-gradient(rgba(250,248,244,0.05) 1px,transparent 1px);background-size:28px 28px;pointer-events:none}
                .about-hero-glow{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(61,79,71,0.12) 0%,transparent 60%);top:-200px;left:10%;pointer-events:none}
                .about-hero-watermark{position:absolute;bottom:-10%;right:-5%;font-family:'Fraunces',serif;font-size:clamp(5rem,14vw,12rem);font-weight:700;color:rgba(250,248,244,0.02);pointer-events:none;white-space:nowrap;letter-spacing:-0.03em;user-select:none}
                .about-hero-content{position:relative;z-index:2;max-width:800px}
                .about-hero-content h1{color:${C.bone};font-size:clamp(2.6rem,6.5vw,4.5rem);line-height:1.06;font-weight:600}
                .about-hero-content .hero-accent{background:linear-gradient(135deg,${C.bone} 0%,${C.brassLight} 50%,${C.bone} 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradient-text 4s ease infinite}
                .about-hero-desc{color:rgba(250,248,244,0.55);font-size:1.15rem;max-width:620px;margin:1.8rem 0 2.5rem;line-height:1.85}
                .about-hero-buttons{display:flex;gap:1rem;flex-wrap:wrap}

                /* ── What We Do ── */
                .what-we-do{padding:clamp(5rem,10vw,7rem) 0;background:${C.bone};border-top:1px solid ${C.line}}
                .capabilities-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:${C.line};margin-top:3.5rem;border:1px solid ${C.line};border-radius:12px;overflow:hidden}
                .capability-cell{background:${C.bone};padding:clamp(1.8rem,3vw,2.5rem);transition:all 0.4s ease;position:relative}
                .capability-cell:hover{background:${C.bone2}}
                .capability-cell::after{content:'';position:absolute;bottom:0;left:1.5rem;right:1.5rem;height:2px;background:${C.verdigris};transform:scaleX(0);transition:transform 0.4s ease;transform-origin:left}
                .capability-cell:hover::after{transform:scaleX(1)}
                .capability-num{font-family:'JetBrains Mono',monospace;font-size:0.65rem;color:rgba(107,104,98,0.4);letter-spacing:0.1em;margin-bottom:1rem}
                .capability-icon{width:44px;height:44px;border-radius:10px;background:${C.verdigrisTint};display:flex;align-items:center;justify-content:center;margin-bottom:1.2rem;color:${C.verdigris};transition:all 0.3s ease}
                .capability-cell:hover .capability-icon{background:${C.verdigris};color:${C.bone}}
                .capability-title{font-family:'Inter',sans-serif;font-size:1rem;font-weight:600;color:${C.ink};margin-bottom:0.6rem}
                .capability-desc{font-size:0.85rem;color:${C.gray};line-height:1.65}

                /* ── Products ── */
                .products-section{padding:clamp(5rem,10vw,7rem) 0;background:#0A0A0A;position:relative;overflow:hidden}
                .products-grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(61,79,71,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(61,79,71,0.03) 1px,transparent 1px);background-size:48px 48px;pointer-events:none}
                .product-card{position:relative;background:rgba(250,248,244,0.03);border:1px solid rgba(250,248,244,0.07);border-radius:20px;overflow:hidden;transition:all 0.5s cubic-bezier(0.16,1,0.3,1)}
                .product-card:hover{border-color:rgba(250,248,244,0.15);transform:translateY(-6px);box-shadow:0 20px 50px rgba(0,0,0,0.3)}
                .product-card-glow{position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(139,115,85,0.4),transparent);opacity:0;transition:opacity 0.5s}
                .product-card:hover .product-card-glow{opacity:1}
                .product-image-wrap{position:relative;overflow:hidden}
                .product-image-wrap img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 6s ease}
                .product-card:hover .product-image-wrap img{transform:scale(1.05)}
                .product-image-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(10,10,10,0.9) 100%);pointer-events:none}
                .product-body{padding:clamp(1.5rem,3vw,2.5rem);position:relative;z-index:2}
                .product-badge{display:inline-flex;align-items:center;gap:0.4rem;padding:0.35rem 0.9rem;border-radius:50px;font-size:0.65rem;font-family:'JetBrains Mono',monospace;letter-spacing:0.1em;text-transform:uppercase;font-weight:500;border:1px solid rgba(250,248,244,0.1);color:rgba(250,248,244,0.6);margin-bottom:1.2rem;background:rgba(250,248,244,0.04)}
                .product-title{font-family:'Fraunces',serif;font-size:clamp(1.5rem,3vw,2rem);color:${C.bone};margin-bottom:0.8rem;font-weight:600;line-height:1.2}
                .product-desc{color:rgba(250,248,244,0.5);font-size:0.92rem;line-height:1.75;margin-bottom:1.8rem}
                .product-link{display:inline-flex;align-items:center;gap:0.5rem;color:${C.brassLight};font-size:0.88rem;font-weight:500;transition:all 0.3s ease;cursor:pointer;background:none;border:none;font-family:'Inter',sans-serif;padding:0}
                .product-link:hover{color:${C.bone};gap:0.8rem}
                .product-link-arrow{transition:transform 0.3s ease}
                .product-link:hover .product-link-arrow{transform:translateX(4px)}

                /* ── Team ── */
                .team-section{padding:clamp(5rem,10vw,7rem) 0;background:${C.bone};border-top:1px solid ${C.line}}
                .team-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-top:3.5rem;max-width:960px}
                .team-member{background:${C.bone};border:1px solid ${C.line};border-radius:16px;padding:clamp(2rem,3vw,3rem);transition:all 0.5s cubic-bezier(0.16,1,0.3,1);position:relative;overflow:hidden}
                .team-member:hover{transform:translateY(-6px);box-shadow:0 20px 50px rgba(21,23,26,0.08);border-color:${C.verdigrisLight}}
                .team-member::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;transform:scaleX(0);transition:transform 0.5s ease;transform-origin:left}
                .team-member:hover::before{transform:scaleX(1)}
                .team-member-lead::before{background:linear-gradient(90deg,${C.verdigris},${C.brass})}
                .team-member-ml::before{background:linear-gradient(90deg,${C.brass},${C.accent})}
                .team-avatar-wrap{display:flex;align-items:center;gap:1.2rem;margin-bottom:1.5rem}
                .team-avatar{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:1.4rem;color:${C.bone};font-weight:600;flex-shrink:0}
                .team-member-lead .team-avatar{background:linear-gradient(135deg,${C.verdigris},${C.verdigrisDark})}
                .team-member-ml .team-avatar{background:linear-gradient(135deg,${C.brass},${C.accent})}
                .team-name{font-family:'Inter',sans-serif;font-size:1.15rem;font-weight:700;color:${C.ink};letter-spacing:-0.01em}
                .team-role{font-size:0.78rem;font-family:'JetBrains Mono',monospace;letter-spacing:0.08em;color:${C.brass};margin-top:0.15rem;text-transform:uppercase}
                .team-bio{font-size:0.9rem;color:${C.gray};line-height:1.7}
                .team-tech-tags{display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:1.2rem}
                .team-tech-tag{padding:0.3rem 0.7rem;border-radius:4px;font-size:0.68rem;font-family:'JetBrains Mono',monospace;letter-spacing:0.05em;background:${C.bone2};color:${C.grayDark};border:1px solid ${C.line}}

                /* ── CTA ── */
                .cta-wrapper{background:${C.bone};padding:clamp(4rem,8vw,7rem) 0}
                .cta-card{position:relative;background:linear-gradient(135deg,${C.ink} 0%,${C.verdigrisDark} 100%);border-radius:24px;padding:clamp(3rem,6vw,5rem) 2rem;overflow:hidden;border:1px solid ${C.lineDark};box-shadow:0 40px 80px -20px rgba(21,23,26,0.3)}
                .cta-card::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background-image:radial-gradient(circle at 50% 0%,rgba(139,115,85,0.15) 0%,transparent 50%),linear-gradient(rgba(250,248,244,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(250,248,244,0.03) 1px,transparent 1px);background-size:100% 100%,40px 40px,40px 40px;pointer-events:none}
                .cta-content{position:relative;z-index:2;max-width:700px}
                .cta-content h2{color:${C.bone};margin-bottom:1.5rem;font-size:clamp(2rem,4.5vw,3rem);line-height:1.2}
                .cta-content p{color:rgba(250,248,244,0.8);font-size:1.1rem;line-height:1.8;margin-bottom:2.5rem}
                .cta-buttons{display:flex;gap:1rem;flex-wrap:wrap}

                @keyframes gradient-text{0%{background-position:0% center}50%{background-position:100% center}100%{background-position:0% center}}

                @media(max-width:900px){
                    .capabilities-grid{grid-template-columns:1fr 1fr}
                }
                @media(max-width:800px){.nav-links{display:none}.nav-cta{display:none}.mobile-nav{display:flex;gap:0.5rem;align-items:center}}
                @media(max-width:768px){
                    .capabilities-grid{grid-template-columns:1fr}
                    .team-grid{grid-template-columns:1fr;max-width:100%}
                    .about-hero-buttons{flex-direction:column;width:100%}
                    .about-hero-buttons .btn{width:100%;justify-content:center}
                    .cta-buttons{flex-direction:column;width:100%}
                    .cta-buttons .btn{width:100%;justify-content:center}
                }
                @media(max-width:480px){
                    .about-hero{padding-top:120px}
                    .btn{padding:0.8rem 1.2rem!important;font-size:0.8rem!important}
                }
            `}</style>

            <main>
                <nav className={scrolled ? 'scrolled' : ''}>
                    <div className="wrap nav-wrap">
                        <div className="logo" onClick={() => navigate('/')}>
                            <Mark size={24} color={C.ink} />
                            Rest Point
                        </div>
                        <div className="nav-links">
                            <button onClick={() => navigate('/')} className="nav-link">Home</button>
                            <button onClick={() => navigate('/about-welt-tallis')} className="nav-link" style={{ color: C.verdigris, fontWeight: 600 }}>About</button>
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

                {/* ── Hero ── */}
                <section className="about-hero">
                    <div className="about-hero-grid-bg" />
                    <div className="about-hero-glow" />
                    <div className="about-hero-watermark">WELT TALLIS</div>
                    <div className="wrap">
                        <div className="about-hero-content">
                            <Reveal>
                                <div className="mono-label" style={{ color: 'rgba(250,248,244,0.35)', marginBottom: '1.5rem', letterSpacing: '0.2em' }}>SOFTWARE DEVELOPMENT COMPANY</div>
                                <h1>We build software that <span className="hero-accent">solves real problems</span></h1>
                                <p className="about-hero-desc">
                                    Welt Tallis is a software development company designing and engineering products for industries that matter — funeral services, insurance, and STEM education. We don't build toys. We build systems people depend on.
                                </p>
                                <div className="about-hero-buttons">
                                    <button className="btn btn-brass" onClick={goStart}>Explore our products <ArrowRight size={16} /></button>
                                    <button className="btn btn-ghost" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>View products</button>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ── What We Do ── */}
                <section className="what-we-do">
                    <div className="wrap">
                        <Reveal style={{ maxWidth: '600px' }}>
                            <div className="label" style={{ marginBottom: '1rem' }}>What We Do</div>
                            <h2>End-to-end product engineering</h2>
                            <p style={{ marginTop: '1rem', color: C.gray }}>
                                From requirements gathering to deployment and maintenance, we handle the full lifecycle of every product we ship.
                            </p>
                        </Reveal>
                        <div className="capabilities-grid">
                            {[
                                { num: '01', icon: Code2, title: 'Software Architecture', desc: 'Designing system architectures that are scalable, maintainable, and built to handle real-world complexity from day one.' },
                                { num: '02', icon: MonitorSmartphone, title: 'Frontend Engineering', desc: 'Building responsive, performant interfaces with modern frameworks that users actually enjoy interacting with.' },
                                { num: '03', icon: Server, title: 'Backend Engineering', desc: 'Engineering robust APIs, database layers, and server infrastructure that power everything under the hood.' },
                                { num: '04', icon: Brain, title: 'AI & Machine Learning', desc: 'Developing and deploying ML algorithms — from predictive models to intelligent automation — that make products smarter.' },
                                { num: '05', icon: Cpu, title: 'Embedded & IoT', desc: 'Hardware-software integrations for remote-controlled simulations and real-time sensor systems.' },
                                { num: '06', icon: ShieldCheck, title: 'Security & Infrastructure', desc: 'Bank-grade encryption, access controls, CI/CD pipelines, and monitoring for reliable 99.9% uptime.' },
                            ].map((cap, i) => (
                                <Reveal key={i} delay={i * 60}>
                                    <div className="capability-cell">
                                        <div className="capability-num">{cap.num}</div>
                                        <div className="capability-icon"><cap.icon size={20} /></div>
                                        <div className="capability-title">{cap.title}</div>
                                        <div className="capability-desc">{cap.desc}</div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Products ── */}
                <section id="products" className="products-section">
                    <div className="products-grid-bg" />
                    <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
                        <Reveal style={{ maxWidth: '600px' }}>
                            <div className="mono-label" style={{ color: 'rgba(250,248,244,0.35)', marginBottom: '1rem', letterSpacing: '0.2em' }}>OUR PRODUCTS</div>
                            <h2 style={{ color: C.bone }}>Built under the Welt Tallis umbrella</h2>
                        </Reveal>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginTop: '3.5rem' }}>
                            {/* RestPoint */}
                            <RevealDir from="left" delay={0}>
                                <div className="product-card">
                                    <div className="product-card-glow" />
                                    <div className="product-image-wrap" style={{ height: '220px' }}>
                                        <img src="/landing.png" alt="RestPoint Dashboard" />
                                        <div className="product-image-overlay" />
                                    </div>
                                    <div className="product-body">
                                        <div className="product-badge">
                                            <Building2 size={12} /> Funeral Home OS
                                        </div>
                                        <h3 className="product-title">RestPoint</h3>
                                        <p className="product-desc">
                                            A complete operational platform for funeral homes and welfare organizations. Case management, family portals, smart dispatch, fleet tracking, funeral insurance administration, and billing — all in one system.
                                        </p>
                                        <button className="product-link" onClick={() => navigate('/')}>
                                            Explore RestPoint <ArrowUpRight size={16} className="product-link-arrow" />
                                        </button>
                                    </div>
                                </div>
                            </RevealDir>

                            {/* Builders Nation */}
                            <RevealDir from="right" delay={150}>
                                <div className="product-card">
                                    <div className="product-card-glow" />
                                    <div className="product-image-wrap" style={{ height: '220px' }}>
                                        <img src="https://ik.imagekit.io/hpxdsrhk7/images/port.png?updatedAt=1756099580308" alt="Builders Nation" />
                                        <div className="product-image-overlay" />
                                    </div>
                                    <div className="product-body">
                                        <div className="product-badge">
                                            <GraduationCap size={12} /> STEM Education
                                        </div>
                                        <h3 className="product-title">Builders Nation</h3>
                                        <p className="product-desc">
                                            Introducing young kids to the world of technology, engineering, and sustainability through real remote-controlled simulations. Hands-on learning that bridges the gap between theory and real-world application.
                                        </p>
                                        <button className="product-link" onClick={() => window.open('https://buildersnation.netlify.app/', '_blank', 'noopener,noreferrer')}>
                                            Visit Builders Nation <ArrowUpRight size={16} className="product-link-arrow" />
                                        </button>
                                    </div>
                                </div>
                            </RevealDir>
                        </div>
                    </div>
                </section>

                {/* ── Team ── */}
                <section className="team-section">
                    <div className="wrap">
                        <Reveal style={{ maxWidth: '550px' }}>
                            <div className="label" style={{ marginBottom: '1rem' }}>The Team</div>
                            <h2>Small team. Outsized ambition.</h2>
                            <p style={{ marginTop: '1rem', color: C.gray }}>
                                Every product we ship is designed, engineered, and maintained by this team.
                            </p>
                        </Reveal>

                        <div className="team-grid">
                            {/* Peter Mumo */}
                            <RevealDir from="left" delay={0}>
                                <div className="team-member team-member-lead">
                                    <div className="team-avatar-wrap">
                                        <div className="team-avatar">PM</div>
                                        <div>
                                            <div className="team-name">Peter Mumo</div>
                                            <div className="team-role">CTO & Software Architect</div>
                                        </div>
                                    </div>
                                    <p className="team-bio">
                                        Peter defines the technical direction of every Welt Tallis product. He architects the systems, designs the data models, and crafts the solutions that make our platforms reliable at scale. He engineers both the backend infrastructure and the frontend experiences users interact with daily. A STEM kid enthusiast at heart, he built Builders Nation to give the next generation the hands-on engineering exposure he wishes he had growing up.
                                    </p>
                                    <div className="team-tech-tags">
                                        {['System Design', 'Backend', 'Frontend', 'Cloud Architecture', 'API Design', 'DevOps'].map(t => (
                                            <span key={t} className="team-tech-tag">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </RevealDir>

                            {/* Cyrus Musyoka */}
                            <RevealDir from="right" delay={150}>
                                <div className="team-member team-member-ml">
                                    <div className="team-avatar-wrap">
                                        <div className="team-avatar">CM</div>
                                        <div>
                                            <div className="team-name">Cyrus Musyoka</div>
                                            <div className="team-role">Software & ML Engineer</div>
                                        </div>
                                    </div>
                                    <p className="team-bio">
                                        Cyrus develops and deploys the AI and machine learning algorithms that make our products intelligent. From predictive analytics and natural language processing to smart automation workflows, he builds the intelligence layer that turns raw data into actionable decisions across both RestPoint and Builders Nation.
                                    </p>
                                    <div className="team-tech-tags">
                                        {['Machine Learning', 'AI Algorithms', 'Python', 'Data Engineering', 'NLP', 'Predictive Models'].map(t => (
                                            <span key={t} className="team-tech-tag">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </RevealDir>
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="cta-wrapper">
                    <div className="wrap">
                        <Reveal>
                            <div className="cta-card">
                                <div className="cta-content">
                                    <div className="mono-label" style={{ color: C.brass, marginBottom: '1.5rem' }}>WORK WITH US</div>
                                    <h2>Have a problem worth solving?</h2>
                                    <p>We're always interested in challenging projects that require deep engineering. If you're building something meaningful, we should talk.</p>
                                    <div className="cta-buttons">
                                        <button className="btn btn-brass" onClick={goStart} style={{ padding: '1.1rem 2.5rem', fontSize: '1rem' }}>
                                            Start a conversation <ArrowRight size={18} />
                                        </button>
                                        <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ padding: '1.1rem 2.5rem', fontSize: '1rem' }}>
                                            Back to RestPoint
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