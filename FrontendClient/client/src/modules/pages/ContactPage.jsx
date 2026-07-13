import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, Menu, X, ArrowRight, Mail, MessageCircle,
  Linkedin, ShieldCheck, Globe
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
          <button onClick={() => { navigate('/contact'); setOpen(false); }} className="mobile-link" style={{ color: C.brass, fontWeight: 600 }}>Contact</button>
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

export default function ContactPage() {
  const navigate = useNavigate();

  const goLogin = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); };
  const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
  const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

  const contactMethods = [
    {
      icon: Mail,
      title: 'General Inquiries',
      desc: 'info@restpoint.co.ke',
      href: 'mailto:info@restpoint.co.ke',
      iconColor: C.brass,
      external: false
    },
    {
      icon: ShieldCheck,
      title: 'Data & Privacy Requests',
      desc: 'privacy@restpoint.co.ke',
      href: 'mailto:privacy@restpoint.co.ke',
      iconColor: C.verdigris,
      external: false
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      desc: 'Chat with our team directly',
      href: 'https://wa.me/254700000000',
      iconColor: '#25D366',
      external: true
    },
    {
      icon: Linkedin,
      title: 'LinkedIn',
      desc: 'Follow Rest Point for updates',
      href: 'https://www.linkedin.com/company/restpoint',
      iconColor: '#0A66C2',
      external: true
    },
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
        
        .btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 1.9rem;font-size:0.9rem;font-weight:500;font-family:'Inter',sans-serif;border:1px solid transparent;border-radius:8px;cursor:pointer;transition:all 0.3s ease;white-space:nowrap;text-decoration:none}
        .btn-dark{background:${C.ink};color:${C.bone}}
        .btn-dark:hover{background:${C.verdigris};transform:translateY(-2px);box-shadow:0 10px 20px rgba(21,23,26,0.15)}
        
        .wrap{max-width:1180px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
        .section{padding:clamp(4rem,8vw,6rem)0}
        
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
        .hero-glow{position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 30% 40%,rgba(61,79,71,0.3) 0%,transparent 60%);pointer-events:none}
        .hero-content{max-width:800px;position:relative;z-index:1}
        .hero-desc{font-size:1.2rem;max-width:600px;margin-bottom:0;color:rgba(255,255,255,0.8);line-height:1.8}
        
        /* Contact Grid */
        .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:3rem}
        .contact-card{display:flex;align-items:center;gap:1.2rem;background:${C.bone};border:1px solid ${C.line};padding:1.8rem;border-radius:12px;text-decoration:none;transition:all 0.3s ease;color:${C.ink}}
        .contact-card:hover{transform:translateY(-4px);border-color:${C.verdigrisLight};box-shadow:0 15px 30px rgba(21,23,26,0.06)}
        .contact-icon-box{width:48px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        
        .info-box{margin-top:3rem;padding:2rem;background:${C.bone2};border:1px solid ${C.line};border-radius:12px;text-align:center}
        .contact-link{color:${C.brass};text-decoration:none;font-weight:500;transition:color 0.2s}
        .contact-link:hover{color:${C.brassLight}}
        
        @media(max-width:800px){.nav-links{display:none}.nav-cta{display:none}.mobile-nav{display:flex;gap:0.5rem;align-items:center}}
        @media(max-width:768px){
          .contact-grid{grid-template-columns:1fr}
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
            <button onClick={() => navigate('/contact')} className="nav-link" style={{ color: C.brass, fontWeight: 600 }}>Contact</button>
            <PolicyDropdown navigate={navigate} goTerms={goTerms} />
          </div>
          <div className="nav-cta">
            <button onClick={goLogin} className="nav-link" style={{ paddingRight: '0.5rem' }}>Log in</button>
            <button onClick={goStart} className="btn btn-dark" style={{ padding: '0.7rem 1.2rem' }}>Request access</button>
          </div>
          <MobileMenu navigate={navigate} goTerms={goTerms} goLogin={goLogin} goStart={goStart} />
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-grid-bg"></div>
          <div className="hero-glow"></div>
          <div className="wrap hero-content">
            <Reveal>
              <div className="mono-label" style={{ marginBottom: '1rem' }}>Contact Us</div>
              <h1 style={{ color: C.bone }}>We're here when you need us.</h1>
              <p className="hero-desc">
                Reach out to the Rest Point team through any of the channels below. We respond promptly to every inquiry.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="section" style={{ paddingTop: '4rem' }}>
          <div className="wrap">
            <div className="contact-grid">
              {contactMethods.map((method, i) => (
                <Reveal key={i} delay={i * 100}>
                  <a
                    href={method.href}
                    target={method.external ? '_blank' : undefined}
                    rel={method.external ? 'noopener noreferrer' : undefined}
                    className="contact-card"
                  >
                    <div className="contact-icon-box" style={{ background: `${method.iconColor}15`, color: method.iconColor }}>
                      <method.icon size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{method.title}</h3>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: C.gray }}>{method.desc}</p>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>

            <Reveal delay={400}>
              <div className="info-box">
                <p style={{ fontSize: '1rem' }}>
                  Built with care by <strong style={{ color: C.ink }}>Welt Tallis Technologies</strong>.<br />
                  Email us directly at <a href="mailto:info@restpoint.co.ke" className="contact-link">info@restpoint.co.ke</a>
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer goTerms={goTerms} />
    </div>
  );
}