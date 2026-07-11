import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Twitter, Linkedin, Github, Mail, ArrowRight } from 'lucide-react';

const C = {
    ink: '#000000', // Pure Black
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    brassLight: '#A98F6E',
    verdigris: '#3D4F47',
    verdigrisDark: '#2E3F37',
    verdigrisLight: '#4D6359',
    verdigrisTint: '#EBEFEF',
    line: '#E3DDD0',
    // Subtle white lines for pure black bg
    lineDark: 'rgba(255,255,255,0.08)',
    gray: '#8A8780',
    grayLight: 'rgba(255,255,255,0.6)',
    accent: '#C77B5E',
};

const Mark = ({ size = 24, color = C.bone }) => (
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

const PolicyDropdown = ({ goTerms }) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useOutsideClick(ref, () => setOpen(false));

    const policies = [
        { label: 'Terms of Service', action: goTerms },
        { label: 'Privacy Policy', action: () => navigate('/privacy') },
        { label: 'Data Migration Policy', action: () => navigate('/data-migration') },
        { label: 'SLA Policy', action: () => navigate('/sla') },
        { label: 'Release Notes', action: () => navigate('/releases') },
        { label: 'Account Deletion', action: () => navigate('/account-deletion') },
    ];

    return (
        <div ref={ref} style={{ position: 'relative', marginBottom: '0.8rem' }}>
            <button
                onClick={() => setOpen(!open)}
                className="footer-link"
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
                <div className="footer-dropdown-menu">
                    {policies.map((policy, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                policy.action();
                                setOpen(false);
                            }}
                            className="footer-dropdown-item"
                        >
                            {policy.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const FooterLink = ({ onClick, children, isPrimary = false }) => (
    <button
        onClick={onClick}
        className={`footer-link ${isPrimary ? 'primary' : ''}`}
    >
        {children}
    </button>
);

const Footer = ({ goTerms }) => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const handleNav = (path) => {
        if (goTerms && path === '/terms') {
            goTerms();
        } else {
            navigate(path);
        }
    };

    return (
        <footer className="footer-container">
            <div className="footer-glow" />
            <div className="footer-grid-bg" />

            <div className="wrap footer-wrap">
                <style>{`
                    .footer-container {
                        background: #000000; /* Completely Black */
                        color: ${C.grayLight};
                        padding: clamp(4rem, 8vw, 6rem) 0 2rem;
                        border-top: 1px solid ${C.lineDark};
                        position: relative;
                        overflow: hidden;
                        font-family: 'Inter', sans-serif;
                    }
                    .footer-glow {
                        position: absolute;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: radial-gradient(circle at 30% 0%, rgba(61,79,71,0.3) 0%, transparent 60%);
                        pointer-events: none;
                    }
                    .footer-grid-bg {
                        position: absolute;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
                        background-size: 40px 40px;
                        pointer-events: none;
                        mask-image: linear-gradient(to bottom, black, transparent 80%);
                        -webkit-mask-image: linear-gradient(to bottom, black, transparent 80%);
                    }
                    .footer-wrap {
                        position: relative;
                        z-index: 2;
                        max-width: 1180px;
                        margin: 0 auto;
                        padding: 0 clamp(1.25rem, 5vw, 2.5rem);
                    }
                    
                    /* Top Section: Brand & Newsletter */
                    .footer-top {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        gap: 4rem;
                        padding-bottom: 4rem;
                        border-bottom: 1px solid ${C.lineDark};
                        margin-bottom: 4rem;
                        flex-wrap: wrap;
                    }
                    .footer-brand-block { flex: 1.5; min-width: 300px; }
                    .footer-brand-mark {
                        display: flex; align-items: center; gap: 0.7rem;
                        font-family: 'Fraunces', serif; font-size: 1.4rem;
                        color: ${C.bone}; font-weight: 500; margin-bottom: 1rem;
                        letter-spacing: -0.02em;
                    }
                    .footer-desc {
                        font-size: 0.9rem; color: ${C.grayLight};
                        line-height: 1.7; max-width: 380px;
                        opacity: 0.8; margin-bottom: 1.5rem;
                    }
                    .footer-status {
                        display: inline-flex; align-items: center; gap: 0.6rem;
                        font-size: 0.75rem; color: ${C.grayLight};
                        background: rgba(255,255,255,0.05); padding: 0.4rem 0.8rem;
                        border-radius: 20px; border: 1px solid ${C.lineDark};
                    }
                    .status-dot {
                        width: 8px; height: 8px; border-radius: 50%;
                        background: #4CAF50; display: inline-block;
                        box-shadow: 0 0 10px #4CAF50; animation: pulse 2s infinite;
                    }
                    .social-row { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
                    .social-icon {
                        width: 36px; height: 36px; border-radius: 8px;
                        background: rgba(255,255,255,0.05); border: 1px solid ${C.lineDark};
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.grayLight}; transition: all 0.2s ease; cursor: pointer;
                    }
                    .social-icon:hover {
                        background: ${C.verdigris}; border-color: ${C.verdigrisLight};
                        color: ${C.bone}; transform: translateY(-2px);
                    }
                    
                    .footer-newsletter { flex: 1; min-width: 300px; }
                    .newsletter-title {
                        font-family: 'Fraunces', serif; font-size: 1.6rem;
                        color: ${C.bone}; margin-bottom: 0.5rem; font-weight: 500;
                    }
                    .newsletter-sub {
                        font-size: 0.9rem; color: ${C.grayLight};
                        margin-bottom: 1.5rem; opacity: 0.8; line-height: 1.6;
                    }
                    .newsletter-form {
                        display: flex; gap: 0.5rem; background: rgba(255,255,255,0.04);
                        border: 1px solid ${C.lineDark}; border-radius: 8px;
                        padding: 4px; transition: all 0.2s;
                    }
                    .newsletter-form:focus-within {
                        border-color: ${C.brass};
                        box-shadow: 0 0 0 3px rgba(139,115,85,0.2);
                    }
                    .newsletter-input {
                        flex: 1; background: transparent; border: none; outline: none;
                        color: ${C.bone}; padding: 0.75rem 1rem; font-size: 0.9rem;
                        font-family: 'Inter', sans-serif;
                    }
                    .newsletter-input::placeholder { color: rgba(255,255,255,0.4); }
                    .newsletter-btn {
                        background: ${C.brass}; color: ${C.bone}; border: none;
                        padding: 0.75rem 1.5rem; border-radius: 6px; font-size: 0.85rem;
                        font-weight: 600; cursor: pointer; transition: all 0.2s ease;
                        display: flex; align-items: center; gap: 0.4rem;
                    }
                    .newsletter-btn:hover {
                        background: ${C.brassLight}; transform: translateY(-1px);
                    }
                    
                    /* Middle Section: Link Columns */
                    .footer-content {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 2rem;
                        margin-bottom: 4rem;
                    }
                    .footer-col h4 {
                        font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
                        letter-spacing: 0.14em; text-transform: uppercase;
                        color: ${C.brassLight}; margin-bottom: 1.5rem; font-weight: 600;
                    }
                    .footer-link {
                        display: block; width: 100%; text-align: left;
                        background: none; border: none; cursor: pointer;
                        font-size: 0.88rem; color: ${C.grayLight}; padding: 0;
                        margin-bottom: 0.8rem; font-family: 'Inter', sans-serif;
                        transition: all 0.2s ease; transform: translateX(0);
                    }
                    .footer-link:hover {
                        color: ${C.bone}; transform: translateX(4px);
                    }
                    .footer-link.primary {
                        color: ${C.bone}; font-weight: 500; margin-bottom: 1rem;
                    }
                    
                    .footer-dropdown-menu {
                        position: absolute; bottom: 100%; left: 0; background: #050505;
                        border: 1px solid ${C.lineDark}; border-radius: 8px; min-width: 240px;
                        margin-bottom: 0.75rem; z-index: 1000;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.8); overflow: hidden;
                    }
                    .footer-dropdown-item {
                        width: 100%; padding: 0.8rem 1.2rem; background: none; border: none;
                        text-align: left; cursor: pointer; font-size: 0.85rem; color: ${C.grayLight};
                        border-bottom: 1px solid ${C.lineDark}; transition: all 0.2s;
                        font-family: 'Inter', sans-serif;
                    }
                    .footer-dropdown-item:last-child { border-bottom: none; }
                    .footer-dropdown-item:hover { background: rgba(255,255,255,0.05); color: ${C.bone}; }
                    
                    /* Bottom Bar */
                    .footer-bottom {
                        display: flex; justify-content: space-between; align-items: center;
                        font-size: 0.78rem; color: ${C.grayLight}; opacity: 0.7;
                        padding-top: 2rem; border-top: 1px solid ${C.lineDark};
                    }
                    .footer-legal-links { display: flex; gap: 1.5rem; }
                    .legal-link {
                        background: none; border: none; cursor: pointer; color: inherit;
                        font-size: inherit; font-family: inherit; transition: color 0.2s;
                    }
                    .legal-link:hover { color: ${C.bone}; }
                    
                    @keyframes pulse {
                        0% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.6; transform: scale(0.9); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                    
                    @media (max-width: 900px) {
                        .footer-content { grid-template-columns: repeat(2, 1fr) !important; gap: 2.5rem !important; }
                        .footer-top { flex-direction: column; gap: 3rem; }
                    }
                    @media (max-width: 600px) {
                        .footer-content { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
                        .footer-bottom { flex-direction: column !important; gap: 1rem !important; text-align: center !important; }
                        .footer-legal-links { flex-wrap: wrap; justify-content: center; }
                    }
                `}</style>

                {/* Top: Brand & Newsletter */}
                <div className="footer-top">
                    <div className="footer-brand-block">
                        <div className="footer-brand-mark">
                            <Mark size={28} color={C.bone} />
                            Rest Point
                        </div>
                        <p className="footer-desc">
                            The operating system for funeral homes that take their reputation seriously. Built by Welt Tallis Technologies.
                        </p>
                        <div className="footer-status">
                            <span className="status-dot" />
                            All systems operational
                        </div>
                        <div className="social-row">
                            <div className="social-icon"><Twitter size={16} /></div>
                            <div className="social-icon"><Linkedin size={16} /></div>
                            <div className="social-icon"><Github size={16} /></div>
                            <div className="social-icon"><Mail size={16} /></div>
                        </div>
                    </div>

                    <div className="footer-newsletter">
                        <div className="newsletter-title">Stay updated</div>
                        <p className="newsletter-sub">Get product updates, industry insights, and resources delivered directly to your inbox.</p>
                        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                className="newsletter-input"
                                placeholder="you@funeralhome.com"
                            />
                            <button type="submit" className="newsletter-btn">
                                Subscribe <ArrowRight size={14} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Middle: Links Grid */}
                <div className="footer-content">
                    <div className="footer-col">
                        <h4>Software Solutions</h4>
                        <FooterLink onClick={() => handleNav('/')} isPrimary>RestPoint Complete</FooterLink>
                        <FooterLink onClick={() => handleNav('/solutions/churches')}>Church Welfare</FooterLink>
                        <FooterLink onClick={() => handleNav('/solutions/saccos')}>SACCO Funeral</FooterLink>
                        <FooterLink onClick={() => handleNav('/solutions/chamas')}>Chama Management</FooterLink>
                        <FooterLink onClick={() => handleNav('/solutions/funeral-homes')}>Funeral Home OS</FooterLink>
                        <FooterLink onClick={() => handleNav('/mortuary-management-software')}>Mortuary Management</FooterLink>
                        <FooterLink onClick={() => handleNav('/hospital-mortuary-software')}>Hospital Mortuary</FooterLink>
                        <FooterLink onClick={() => handleNav('/funeral-home-management-software')}>Funeral Home ERP</FooterLink>
                        <FooterLink onClick={() => handleNav('/hearse-management')}>Hearse Management</FooterLink>
                        <FooterLink onClick={() => handleNav('/mortuary-billing')}>Mortuary Billing</FooterLink>
                        <FooterLink onClick={() => handleNav('/pricing')}>Pricing</FooterLink>
                    </div>

                    <div className="footer-col">
                        <h4>Resources</h4>
                        <FooterLink onClick={() => handleNav('/blog/funeral-welfare-management')}>Welfare Guide</FooterLink>
                        <FooterLink onClick={() => handleNav('/blog/bereavement-management')}>Bereavement Ops</FooterLink>
                        <FooterLink onClick={() => handleNav('/blog/member-contributions')}>Contributions</FooterLink>
                        <FooterLink onClick={() => handleNav('/templates')}>Free Templates</FooterLink>
                        <FooterLink onClick={() => handleNav('/calculators')}>Calculators</FooterLink>
                    </div>

                    <div className="footer-col">
                        <h4>Company</h4>
                        <FooterLink onClick={() => handleNav('/about-welt-tallis')}>About Welt Tallis</FooterLink>
                        <FooterLink onClick={() => handleNav('/contact')}>Contact Sales</FooterLink>
                        <FooterLink onClick={() => handleNav('/partners')}>Partners</FooterLink>
                    </div>

                    <div className="footer-col">
                        <h4>Legal & Policies</h4>
                        <PolicyDropdown goTerms={goTerms} />
                        <FooterLink onClick={() => handleNav('/security')}>Security Overview</FooterLink>
                        <FooterLink onClick={() => handleNav('/cookies')}>Cookie Settings</FooterLink>
                        <FooterLink onClick={() => handleNav('/gdpr')}>GDPR Compliance</FooterLink>
                    </div>
                </div>

                {/* Bottom: Copyright & Micro Links */}
                <div className="footer-bottom">
                    <span>&copy; {currentYear} Welt Tallis Technologies. All rights reserved.</span>
                    <div className="footer-legal-links">
                        <button className="legal-link" onClick={goTerms}>Terms</button>
                        <button className="legal-link" onClick={() => navigate('/privacy')}>Privacy</button>
                        <button className="legal-link" onClick={() => navigate('/security')}>Security</button>
                        <button className="legal-link" onClick={() => navigate('/status')}>Status</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;