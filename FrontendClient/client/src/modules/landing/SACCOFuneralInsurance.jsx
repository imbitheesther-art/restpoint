import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Check, ArrowRight, ChevronDown, Menu, X, Users, Building, Quote
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

export default function SACCOFuneralInsurance() {
    const navigate = useNavigate();
    const [loaded, setLoaded] = useState(false);
    const [openFAQ, setOpenFAQ] = useState(null);

    const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
    const goContact = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/contact'); };
    const goLogin = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); };
    const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

    useEffect(() => {
        document.title = 'SACCO Funeral Insurance Software | SASRA Compliant | Rest Point Kenya';
        setTimeout(() => setLoaded(true), 60);
    }, []);

    const faqs = [
        {
            q: 'How does SACCO funeral insurance software work?',
            a: 'Our SACCO funeral insurance software automates premium collection, member registration, claims processing, and benefit disbursement. It integrates with M-Pesa for seamless payments and provides SASRA-compliant reporting for regulatory compliance.'
        },
        {
            q: 'Is the software SASRA compliant?',
            a: 'Yes! Rest Point is designed to meet SASRA (Sacco Societies Regulatory Authority) requirements. We provide comprehensive audit trails, financial reporting, member data protection, and transaction records that satisfy regulatory standards.'
        },
        {
            q: 'Can we manage multiple branches?',
            a: 'Absolutely. Rest Point supports multi-branch SACCOs with centralized control and local autonomy. Each branch can manage its members and transactions while headquarters gets unified reporting and oversight.'
        },
        {
            q: 'How does M-Pesa integration work for SACCO collections?',
            a: 'Rest Point integrates seamlessly with M-Pesa for premium collection, loan offsetting, and benefit disbursement. Members can pay via M-Pesa Paybill or Lipa Na M-Pesa, and the system automatically reconciles payments in real-time.'
        },
        {
            q: 'What about member eligibility tracking?',
            a: 'The software automatically tracks member eligibility based on contribution history, waiting periods, and membership status. It sends alerts for arrears and generates eligibility reports for management decisions.'
        },
        {
            q: 'Can we customize benefit calculations?',
            a: 'Yes, Rest Point allows you to configure benefit calculation rules based on contribution amount, membership duration, and other criteria. The system automatically calculates benefits when claims are approved.'
        },
        {
            q: 'What is covered in the Farewell Plan Insurance?',
            a: 'The Farewell Plan Insurance covers funeral expenses including coffin costs, transportation, mortuary fees, burial/cremation costs, and administrative expenses. The plan provides comprehensive coverage to ease the financial burden on families during their time of loss.'
        },
        {
            q: 'Who can I include in my Farewell Insurance Plan?',
            a: 'You can include your spouse, children, parents, and extended family members in your Farewell Insurance Plan. The plan is designed to cover your immediate family and dependents, ensuring comprehensive protection for all your loved ones.'
        },
        {
            q: 'Who is an Extended Family member?',
            a: 'Extended Family members include siblings, grandparents, grandchildren, in-laws, and other dependents who are financially reliant on you. The Farewell Plan allows you to cover these additional family members for comprehensive protection.'
        },
        {
            q: 'How much does this cover cost?',
            a: 'The Farewell Plan is affordable and flexible, with premiums starting from as little as KES 500 per month for basic coverage. We offer various tiers to suit different budgets and coverage needs. Contact our sales team for a personalized quote based on your family size and coverage requirements.'
        },
        {
            q: 'Whom are we partnering with for Farewell Plan?',
            a: 'Rest Point partners with leading insurance providers in Kenya to bring you the Farewell Plan. Our partners include reputable insurance companies regulated by the Insurance Regulatory Authority of Kenya (IRA), ensuring your coverage is secure and claims are paid promptly.'
        }
    ];

    const benefits = [
        'SASRA-compliant reporting and audit trails',
        'Automated premium collection via M-Pesa',
        'Multi-branch management with centralized control',
        'Member eligibility tracking and alerts',
        'Streamlined claims processing (24-48 hours)',
        'Loan offset for funeral benefits',
        'Comprehensive financial reporting',
        'Member self-service portal',
        'Beneficiary and dependant management',
        '24/7 priority support for enterprise clients'
    ];

    const stats = [
        { num: '150+', label: 'SACCOs using Rest Point' },
        { num: '70%', label: 'Reduction in admin time' },
        { num: '48hrs', label: 'Average claims processing' },
        { num: '100%', label: 'SASRA compliance' }
    ];

    const steps = [
        { num: '1', title: 'Member Registration', desc: 'Register members with complete details, beneficiary designations, and dependant information. Bulk import from Excel supported.' },
        { num: '2', title: 'Premium Collection', desc: 'Automated M-Pesa integration for premium collection. Track payments, send reminders, and manage arrears in real-time.' },
        { num: '3', title: 'Claims Processing', desc: 'Fast claims processing with automated verification, committee approvals, and benefit disbursement within 24-48 hours.' }
    ];

    const testimonials = [
        { quote: 'Rest Point transformed our funeral insurance management. M-Pesa integration works flawlessly, and SASRA compliance is now effortless.', name: 'James Kipchoge', role: 'CEO, Uwezo SACCO, Nairobi' },
        { quote: 'We reduced claims processing from 2 weeks to 2 days. Member satisfaction has increased dramatically with faster benefit disbursement.', name: 'Grace Wanjiru', role: 'Operations Manager, Jamii SACCO, Kisumu' },
        { quote: 'Multi-branch management is seamless. We now have complete visibility across all our 12 branches with unified reporting.', name: 'Peter Mwangi', role: 'Finance Director, Mwalimu SACCO, Mombasa' }
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
        
        .btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 1.9rem;font-size:0.9rem;font-weight:500;font-family:'Inter',sans-serif;border:1px solid transparent;border-radius:8px;cursor:pointer;transition:all 0.3s ease;white-space:nowrap}
        .btn-brass{background:${C.brass};color:${C.bone};border:none}
        .btn-brass:hover{background:${C.brassLight};transform:translateY(-2px);box-shadow:0 10px 20px rgba(139,115,85,0.25)}
        .btn-ghost{background:transparent;color:${C.bone};border:1px solid rgba(250,248,244,0.3)}
        .btn-ghost:hover{background:rgba(250,248,244,0.1);border-color:${C.bone}}
        
        .wrap{max-width:1180px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
        .section{padding:clamp(4rem,8vw,6rem)0}
        .section-alt{background:${C.bone2}}
        
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
        
        /* Hero Mockup */
        .hero-mockup{background:rgba(255,255,255,0.03);border:1px solid ${C.lineDark};border-radius:16px;padding:2rem;backdrop-filter:blur(10px);box-shadow:0 30px 60px rgba(0,0,0,0.3)}
        .mockup-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid ${C.lineDark}}
        .mockup-title{font-family:'Fraunces',serif;color:${C.bone};font-size:1.1rem}
        .mockup-badge{font-size:0.7rem;font-family:'JetBrains Mono',monospace;color:#4CAF50;background:rgba(40,200,64,0.1);padding:0.3rem 0.6rem;border-radius:4px;border:1px solid rgba(40,200,64,0.3)}
        .mockup-amount{font-size:2.2rem;font-family:'Fraunces',serif;color:${C.bone};margin-bottom:0.5rem}
        .mockup-label{font-size:0.75rem;color:rgba(255,255,255,0.5);font-family:'JetBrains Mono',monospace;margin-bottom:1.5rem}
        .mockup-row{display:flex;justify-content:space-between;padding:0.8rem 0;border-bottom:1px solid ${C.lineDark};font-size:0.85rem;color:rgba(255,255,255,0.8)}
        .mockup-row:last-child{border-bottom:none}
        .mockup-status{color:${C.brass};font-family:'JetBrains Mono',monospace;font-size:0.75rem}

        /* Stats */
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem}
        .stat-card{text-align:center;padding:2rem 1rem;background:${C.bone};border:1px solid ${C.line};border-radius:12px;transition:all 0.3s ease}
        .stat-card:hover{transform:translateY(-5px);border-color:${C.verdigrisLight};box-shadow:0 15px 30px rgba(21,23,26,0.06)}
        .stat-num{font-size:clamp(1.8rem,4vw,2.5rem);font-weight:600;color:${C.verdigris};font-family:'Fraunces',serif;margin-bottom:0.5rem}
        .stat-label{font-size:0.9rem;color:${C.gray};font-family:'Inter',sans-serif}
        
        /* Benefits */
        .benefits-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:3rem}
        .benefit-card{background:${C.bone};padding:1.5rem;border-radius:12px;border:1px solid ${C.line};display:flex;gap:0.8rem;align-items:flex-start;transition:all 0.3s ease}
        .benefit-card:hover{border-color:${C.verdigrisLight};transform:translateY(-2px)}
        
        /* Steps */
        .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-top:3rem}
        .step-card{text-align:center;padding:2.5rem 2rem;background:${C.bone};border:1px solid ${C.line};border-radius:12px;transition:all 0.3s ease}
        .step-card:hover{transform:translateY(-5px);border-color:${C.verdigrisLight};box-shadow:0 15px 30px rgba(21,23,26,0.06)}
        .step-num{width:56px;height:56px;border-radius:50%;background:${C.verdigris};color:${C.bone};display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-family:'Fraunces',serif;font-size:1.4rem;font-weight:600;box-shadow:0 8px 20px rgba(61,79,71,0.3)}
        .step-title{color:${C.verdigris};font-weight:600;margin-bottom:0.8rem}
        
        /* Testimonials */
        .testimonial-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-top:3rem}
        .testimonial-card{background:${C.bone};padding:2.5rem;border-radius:12px;border:1px solid ${C.line};position:relative;transition:all 0.3s ease}
        .testimonial-card:hover{transform:translateY(-5px);box-shadow:0 15px 30px rgba(21,23,26,0.06)}
        .quote-icon{color:${C.bone2};position:absolute;top:20px;right:20px;opacity:0.5}
        .testimonial-text{font-style:italic;color:${C.gray};margin-bottom:1.5rem;font-size:0.95rem;line-height:1.7}
        .testimonial-name{font-weight:600;color:${C.ink};font-size:0.95rem}
        .testimonial-role{font-size:0.85rem;color:${C.gray};margin-top:0.25rem}
        
        /* FAQ */
        .faq-container{max-width:800px;margin:0 auto}
        .faq-item{border-bottom:1px solid ${C.line};padding:1.5rem 0}
        .faq-question{width:100%;text-align:left;background:none;border:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-family:'Fraunces',serif;font-size:1.1rem;color:${C.ink};padding:0.5rem 0;transition:color 0.2s}
        .faq-question:hover{color:${C.verdigris}}
        .faq-answer{max-height:0;overflow:hidden;transition:max-height 0.3s ease, padding 0.3s ease;color:${C.gray};line-height:1.7;font-size:0.95rem}
        .faq-item.active .faq-answer{max-height:200px;padding-top:1rem}
        
        /* CTA Section */
        .cta-wrapper{background:${C.bone};padding:0 0 clamp(4rem,8vw,7rem)}
        .cta-card{position:relative;background:linear-gradient(135deg,#000000 0%,${C.verdigrisDark} 100%);border-radius:24px;padding:clamp(3rem,6vw,5rem) 2rem;text-align:center;overflow:hidden;border:1px solid ${C.lineDark};box-shadow:0 40px 80px -20px rgba(21,23,26,0.3)}
        .cta-card::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background-image:radial-gradient(circle at 50% 0%,rgba(139,115,85,0.15) 0%,transparent 50%),linear-gradient(rgba(250,248,244,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(250,248,244,0.03) 1px,transparent 1px);background-size:100% 100%,40px 40px,40px 40px;pointer-events:none}
        .cta-content{position:relative;z-index:2;max-width:700px;margin:0 auto}
        .cta-content h2{color:${C.bone};margin-bottom:1.5rem;font-size:clamp(2rem,4.5vw,3rem);line-height:1.2}
        .cta-content p{color:rgba(250,248,244,0.8);font-size:1.1rem;line-height:1.8;margin-bottom:2.5rem}
        .cta-buttons{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
        
        @media(max-width:900px){
          .hero-content{grid-template-columns:1fr;gap:3rem}
          .stats-grid{grid-template-columns:repeat(2,1fr)}
          .benefits-grid{grid-template-columns:1fr}
          .steps-grid{grid-template-columns:1fr}
          .testimonial-grid{grid-template-columns:1fr}
        }
        @media(max-width:800px){.nav-links{display:none}.nav-cta{display:none}.mobile-nav{display:flex;gap:0.5rem;align-items:center}}
        @media(max-width:480px){
          .hero-buttons{flex-direction:column;width:100%}
          .hero-buttons .btn{width:100%;justify-content:center}
          .stats-grid{grid-template-columns:1fr}
          .cta-buttons{flex-direction:column;width:100%}
          .cta-buttons .btn{width:100%;justify-content:center}
        }
      `}</style>

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
                        <button onClick={goStart} className="btn btn-brass" style={{ padding: '0.7rem 1.2rem' }}>Request access</button>
                    </div>
                    <MobileMenu navigate={navigate} goTerms={goTerms} goLogin={goLogin} goStart={goStart} />
                </div>
            </nav>

            {/* Hero */}
            <section className="hero">
                <div className="hero-grid-bg"></div>
                <div className="hero-glow"></div>
                <div className="wrap hero-content">
                    <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
                        <div className="mono-label" style={{ marginBottom: '1.5rem', color: C.brass }}>
                            <Building size={14} /> For SACCOs & Credit Cooperatives
                        </div>
                        <h1>SACCO Funeral Insurance Software</h1>
                        <p className="hero-desc">Streamline your SACCO's funeral insurance and welfare management with SASRA-compliant software. Automate premium collection, process claims faster, and serve your members with transparency.</p>
                        <div className="hero-buttons">
                            <button className="btn btn-brass" onClick={goStart}>Start Free Trial <ArrowRight size={16} /></button>
                            <button className="btn btn-ghost" onClick={goContact}>Contact Sales</button>
                        </div>
                    </div>
                    <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 200ms' }}>
                        <div className="hero-mockup">
                            <div className="mockup-header">
                                <span className="mockup-title">Welfare Fund</span>
                                <span className="mockup-badge">SASRA Compliant</span>
                            </div>
                            <div className="mockup-amount">KES 4,250,000</div>
                            <div className="mockup-label">TOTAL ACTIVE PREMIUMS</div>
                            <div className="mockup-row">
                                <span>James Kipchoge</span>
                                <span className="mockup-status">Paid</span>
                            </div>
                            <div className="mockup-row">
                                <span>Grace Wanjiru</span>
                                <span className="mockup-status">Paid</span>
                            </div>
                            <div className="mockup-row">
                                <span>Peter Mwangi</span>
                                <span className="mockup-status" style={{ color: C.accent }}>Arrears</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
                <div className="wrap">
                    <div className="stats-grid">
                        {stats.map((stat, i) => (
                            <div key={i} className="stat-card">
                                <div className="stat-num">{stat.num}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="section section-alt">
                <div className="wrap">
                    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                        <div className="mono-label" style={{ marginBottom: '1rem' }}>Features</div>
                        <h2>Complete SACCO Funeral Management</h2>
                        <p>Everything you need to manage funeral insurance and welfare schemes for your members</p>
                    </div>
                    <div className="benefits-grid">
                        {benefits.map((benefit, i) => (
                            <div key={i} className="benefit-card">
                                <Check size={20} color={C.verdigris} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span style={{ fontSize: '0.95rem', color: C.gray }}>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section">
                <div className="wrap">
                    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                        <div className="mono-label" style={{ marginBottom: '1rem' }}>How It Works</div>
                        <h2>Built for SACCO Success</h2>
                    </div>
                    <div className="steps-grid">
                        {steps.map((step, i) => (
                            <div key={i} className="step-card">
                                <div className="step-num">{step.num}</div>
                                <h3 className="step-title">{step.title}</h3>
                                <p style={{ fontSize: '0.95rem' }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="section section-alt">
                <div className="wrap">
                    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                        <div className="mono-label" style={{ marginBottom: '1rem' }}>Social Proof</div>
                        <h2>Trusted by Leading SACCOs</h2>
                        <p>Join 150+ SACCOs across Kenya</p>
                    </div>
                    <div className="testimonial-grid">
                        {testimonials.map((t, i) => (
                            <div key={i} className="testimonial-card">
                                <Quote className="quote-icon" size={40} />
                                <p className="testimonial-text">"{t.quote}"</p>
                                <div className="testimonial-name">{t.name}</div>
                                <div className="testimonial-role">{t.role}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="section">
                <div className="wrap">
                    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        <div className="mono-label" style={{ marginBottom: '1rem' }}>FAQ</div>
                        <h2>Frequently Asked Questions</h2>
                    </div>
                    <div className="faq-container">
                        {faqs.map((faq, i) => (
                            <div key={i} className={`faq-item ${openFAQ === i ? 'active' : ''}`}>
                                <button className="faq-question" onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                                    <span>{faq.q}</span>
                                    <ChevronDown size={20} color={C.brass} style={{ transform: openFAQ === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', flexShrink: 0 }} />
                                </button>
                                <div className="faq-answer">{faq.a}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-wrapper">
                <div className="wrap">
                    <div className="cta-card">
                        <div className="cta-content">
                            <div className="mono-label" style={{ color: C.brass, marginBottom: '1.5rem' }}>Get Started Today</div>
                            <h2>Ready to Transform Your SACCO's Funeral Insurance Management?</h2>
                            <p>Join 150+ SACCOs across Kenya using Rest Point to serve their members with efficiency and transparency.</p>
                            <div className="cta-buttons">
                                <button className="btn btn-brass" onClick={goStart}>Start Free Trial <ArrowRight size={18} /></button>
                                <button className="btn btn-ghost" onClick={goContact}>Schedule Demo</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer goTerms={goTerms} />
        </div>
    );
}