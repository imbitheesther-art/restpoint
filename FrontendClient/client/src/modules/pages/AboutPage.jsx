import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, ArrowRight, ExternalLink, Server, Lock, Zap, Box, Layers, ShieldCheck } from '../../utils/icons/icons';
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

export default function AboutPage() {
  const navigate = useNavigate();

  const goLogin = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); };
  const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
  const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

  const infraFeatures = [
    { icon: Server, title: 'Affordable Infrastructure', desc: 'We understand technology costs millions. We are dedicated to making it affordable for African businesses.' },
    { icon: Layers, title: 'Microservices', desc: 'Decoupled, independently deployed services for every domain.' },
    { icon: Cpu, title: 'Multi-tenancy', desc: 'Isolated tenant databases with shared infrastructure.' },
    { icon: Lock, title: 'Encryption', desc: 'AES-256 at rest, TLS 1.3 in transit, end-to-end.' },
    { icon: Zap, title: 'Zero Downtime', desc: 'Rolling deployments, health checks, and circuit breakers.' },
    { icon: Cloud, title: 'Google Drive Backup', desc: 'Automated backups to your own Google Drive. Your data stays yours.' },
  ];

  return (
    <div className="page-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',sans-serif;color:${C.gray};background:${C.bone};-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fraunces',serif;font-weight:500;letter-spacing:-0.01em;color:${C.ink}}
        h1{font-size:clamp(2.2rem,5vw,3.5rem);line-height:1.15;margin-bottom:1.5rem}
        h2{font-size:clamp(1.8rem,4vw,2.5rem);line-height:1.2;margin-bottom:1.5rem}
        h3{font-size:1.2rem;margin-bottom:0.6rem;color:${C.ink}}
        p{line-height:1.75;font-size:1rem;color:${C.gray}}
        
        .mono-label{font-family:'JetBrains Mono',monospace;font-size:0.75rem;letter-spacing:0.14em;text-transform:uppercase;color:${C.brass};font-weight:500;display:inline-flex;align-items:center;gap:0.5rem}
        
        .btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 1.9rem;font-size:0.9rem;font-weight:500;font-family:'Inter',sans-serif;border:1px solid transparent;border-radius:8px;cursor:pointer;transition:all 0.3s ease;white-space:nowrap;text-decoration:none}
        .btn-dark{background:${C.ink};color:${C.bone}}
        .btn-dark:hover{background:${C.verdigris};transform:translateY(-2px);box-shadow:0 10px 20px rgba(21,23,26,0.15)}
        
        .wrap{max-width:1180px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
        .section{padding:clamp(4rem,8vw,6rem)0}
        .section-dark{background:#000000;color:${C.bone};padding:clamp(4rem,8vw,6rem)0;position:relative;overflow:hidden}
        
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
        .hero{padding-top:140px;padding-bottom:clamp(3rem,6vw,5rem);position:relative;overflow:hidden;border-bottom:1px solid ${C.line}}
        .hero-grid-bg{position:absolute;top:0;left:0;right:0;bottom:0;background-image:linear-gradient(rgba(21,23,26,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(21,23,26,0.02) 1px,transparent 1px);background-size:40px 40px;pointer-events:none}
        .hero-content{max-width:880px;position:relative;z-index:1}
        .hero-desc{font-size:1.2rem;max-width:680px;margin-bottom:0;color:${C.gray};line-height:1.8}
        
        /* Story Section */
        .story-container{max-width:760px;margin:0 auto}
        .story-text{font-size:1.15rem;line-height:1.9;color:${C.grayDark || C.gray};margin-bottom:1.8rem}
        .story-text:first-of-type::first-letter{font-family:'Fraunces',serif;font-size:3.5rem;float:left;line-height:0.8;padding:0.3rem 0.8rem 0 0;color:${C.verdigris}}
        
        /* Dark Section */
        .dark-grid-bg{position:absolute;top:0;left:0;right:0;bottom:0;background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;mask-image:linear-gradient(to bottom,black,transparent 80%);-webkit-mask-image:linear-gradient(to bottom,black,transparent 80%)}
        .dark-glow{position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 30% 20%,rgba(61,79,71,0.3) 0%,transparent 60%);pointer-events:none}
        
        .infra-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;margin-top:3rem}
        .infra-card{background:rgba(255,255,255,0.04);border:1px solid ${C.lineDark};padding:2rem;border-radius:12px;transition:all 0.3s ease}
        .infra-card:hover{transform:translateY(-5px);background:rgba(255,255,255,0.06);border-color:${C.verdigrisLight}}
        .infra-icon{width:48px;height:48px;background:rgba(61,79,71,0.3);border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:1.2rem;color:${C.brass}}
        
        /* Ecosystem */
        .ecosystem-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-top:3rem}
        .ecosystem-card{background:${C.bone};border:1px solid ${C.line};padding:2.5rem;border-radius:16px;transition:all 0.3s ease;display:flex;flex-direction:column}
        .ecosystem-card:hover{transform:translateY(-5px);border-color:${C.verdigrisLight};box-shadow:0 15px 30px rgba(21,23,26,0.06)}
        .ecosystem-header{display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem}
        .ecosystem-icon{width:56px;height:56px;border-radius:12px;background:${C.ink};display:flex;align-items:center;justify-content:center;color:${C.bone}}
        
        .link-arrow{display:inline-flex;align-items:center;gap:.4rem;font-family:'JetBrains Mono',monospace;font-size:.78rem;letter-spacing:0.03em;color:${C.brass};text-decoration:none;border-bottom:1px solid ${C.line};padding-bottom:.15rem;transition:all .2s;margin-top:auto}
        .link-arrow:hover{color:${C.brassLight};border-color:${C.brass}}
        
        .contact-link{color:${C.brass};text-decoration:none;font-weight:500;transition:color 0.2s}
        .contact-link:hover{color:${C.brassLight}}
        
        @media(max-width:800px){.nav-links{display:none}.nav-cta{display:none}.mobile-nav{display:flex;gap:0.5rem;align-items:center}}
        @media(max-width:768px){
          .ecosystem-grid{grid-template-columns:1fr}
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

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-grid-bg"></div>
          <div className="wrap hero-content">
            <Reveal>
              <div className="mono-label" style={{ marginBottom: '1rem' }}>About Rest Point</div>
              <h1>Built for funeral homes that take their reputation seriously.</h1>
              <p className="hero-desc">
                Rest Point is the system of record for funeral homes across East Africa — case management, family communication, dispatch, documents, and billing, run with the same care you bring to every service.
              </p>
            </Reveal>
          </div>
        </section>

        {/* The Story */}
        <section className="section">
          <div className="wrap story-container">
            <Reveal>
              <h2 style={{ marginBottom: '2.5rem' }}>The Story</h2>
              <p className="story-text">
                One day, I found myself at a funeral home, standing beside a loved one. The mortician told me the cause of death was acute kidney and diabetes. Just a few words. Just a line. Just spoken by mouth.
              </p>
              <p className="story-text">
                No report. No document. Nothing to hold. Nothing to read.
              </p>
              <p className="story-text">
                I left that place with questions. I wanted to see the full report. I wanted to understand exactly what happened. I didn't want to be told — I wanted to read it for myself, on my phone, in my own time, with clarity and dignity.
              </p>
              <p className="story-text">
                That moment changed everything.
              </p>
              <p className="story-text">
                I realized that families deserve more than words spoken in a room. They deserve access. They deserve transparency. They deserve the complete picture — not just what they're told, but what the data actually says.
              </p>
              <p className="story-text">
                So I built Rest Point.
              </p>
              <p className="story-text">
                Not for the morticians. Not for the system. For the families. For the ones left behind. For anyone who has ever sat in a funeral home and wondered: What really happened?
              </p>
              <p className="story-text">
                Rest Point gives families the full report — the actual data, the complete picture — right on their phone. Because in moments of loss, truth matters.
              </p>
              <p className="story-text" style={{ fontWeight: 500, color: C.ink }}>
                That is why Rest Point exists. That is the story.
              </p>
            </Reveal>
          </div>
        </section>

        {/* About Welt Tallis Technologies (Dark Section) */}
        <section className="section-dark">
          <div className="dark-grid-bg"></div>
          <div className="dark-glow"></div>
          <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
            <Reveal style={{ maxWidth: '680px' }}>
              <div className="mono-label" style={{ color: C.brass, marginBottom: '1rem' }}>About Welt Tallis Technologies</div>
              <h2 style={{ color: C.bone }}>The company behind Rest Point.</h2>
              <p style={{ color: C.grayLight, fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                Welt Tallis Technologies is a software company dedicated to building robust, scalable platforms for African businesses. Rest Point is our flagship product — a complete operating system for funeral homes.
              </p>
              <p style={{ color: C.grayLight, fontSize: '1.1rem', lineHeight: 1.8 }}>
                We understand that technology infrastructure is extremely expensive — costs run into millions of shillings. We are dedicated to making it affordable for our clients without compromising on quality, security, or reliability.
              </p>
            </Reveal>

            <div className="infra-grid">
              {infraFeatures.map((feat, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="infra-card">
                    <div className="infra-icon">
                      <feat.icon size={24} />
                    </div>
                    <h3 style={{ color: C.bone, fontSize: '1.1rem', marginBottom: '0.6rem' }}>{feat.title}</h3>
                    <p style={{ fontSize: '0.92rem', color: C.grayLight, lineHeight: 1.7 }}>{feat.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="section">
          <div className="wrap story-container">
            <Reveal>
              <div className="mono-label" style={{ marginBottom: '1rem' }}>Our Mission</div>
              <h2>Protecting your data at all costs.</h2>
              <p className="story-text" style={{ fontSize: '1.1rem' }}>
                Our biggest responsibility is to <strong style={{ color: C.ink }}>protect your data at all costs</strong>. We do not share your data with anyone. We do not manipulate your data. Your data is backed up to your own Google Drive, a NAS device attached to your network, and our secure infrastructure. You never need to worry about anything.
              </p>
              <p className="story-text" style={{ fontSize: '1.1rem' }}>
                We combine deep technical expertise with a commitment to data protection, reliability, and user experience. Rest Point is built and maintained with the highest standards of security and professionalism.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Ecosystem */}
        <section className="section" style={{ background: C.bone2, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
          <div className="wrap">
            <Reveal style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <div className="mono-label" style={{ marginBottom: '1rem' }}>Our Ecosystem</div>
              <h2>More from Welt Tallis Technologies.</h2>
            </Reveal>
            <div className="ecosystem-grid">
              <Reveal delay={100}>
                <div className="ecosystem-card">
                  <div className="ecosystem-header">
                    <div className="ecosystem-icon">
                      <Mark size={28} color={C.bone} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0 }}>Rest Point</h3>
                      <p style={{ fontSize: '0.85rem', margin: 0 }}>Funeral home operating system</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                    Rest Point is the complete operating system for funeral homes — case management, family communication, dispatch, and billing in one dignified platform.
                  </p>
                  <a href="/" className="link-arrow">
                    Visit Rest Point <ArrowRight size={14} />
                  </a>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="ecosystem-card">
                  <div className="ecosystem-header">
                    <div className="ecosystem-icon" style={{ background: C.verdigris }}>
                      <Cpu size={24} color={C.bone} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0 }}>Builders Nation</h3>
                      <p style={{ fontSize: '0.85rem', margin: 0 }}>Youth technology & engineering</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                    Builders Nation is a separate platform that immerses young minds into the world of technology, engineering, and sustainability using real remote-controlled simulations.
                  </p>
                  <a href="https://buildersnation.netlify.app/" target="_blank" rel="noopener noreferrer" className="link-arrow">
                    Visit Builders Nation <ExternalLink size={14} />
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="section" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
          <div className="wrap" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', color: C.gray }}>
              Contact us at <a href="mailto:info@restpoint.co.ke" className="contact-link">info@restpoint.co.ke</a>
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer goTerms={goTerms} />
    </div>
  );
}