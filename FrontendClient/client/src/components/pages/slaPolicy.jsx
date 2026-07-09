import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, Menu, X, ArrowRight, ShieldCheck, Server,
  Zap, Activity, Clock, Mail
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
  red: '#9B4A3F',
  orange: '#D97843',
  yellow: '#C9A227',
  green: '#475A43',
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
            <button key={i} onClick={() => { p.onClick(); setOpen(false); }} className={`dropdown-item ${p.label === 'SLA Policy' ? 'active' : ''}`}>
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
          <button onClick={() => { navigate('/contact'); setOpen(false); }} className="mobile-link">Contact</button>
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

export default function SLAPolicy() {
  const navigate = useNavigate();

  const goLogin = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); };
  const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
  const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

  const availabilityFeatures = [
    { icon: Activity, title: '99.9% Target Monthly Uptime', desc: 'Industry-leading reliability target for mission critical access.' },
    { icon: Zap, title: 'Zero-Downtime Deployments', desc: 'PM2 cluster architecture ensures updates happen without service interruption.' },
    { icon: Server, title: '24/7 System Monitoring', desc: 'Continuous surveillance of all infrastructure and services.' },
    { icon: ShieldCheck, title: 'Performance Optimization', desc: 'Ongoing security updates and speed enhancements.' },
    { icon: Clock, title: 'Rapid Incident Response', desc: 'Immediate action against critical service interruptions.' }
  ];

  const slaTiers = [
    { priority: 'Critical', color: C.red, desc: 'Complete system outage or users cannot access the platform.', response: 'Immediate (0-15 min)', resolution: 'Engineers work continuously until service is restored.' },
    { priority: 'High', color: C.orange, desc: 'Essential functions such as Registration, Billing, or Dispatch are unavailable.', response: 'Within 15 minutes', resolution: 'Within 1 hour' },
    { priority: 'Medium', color: C.yellow, desc: 'Non-critical feature affected with an available workaround.', response: 'Within 1 hour', resolution: 'Within 4 business hours' },
    { priority: 'Low', color: C.green, desc: 'Minor issues, cosmetic defects, reports, or enhancement requests.', response: 'Within 4 business hours', resolution: 'Within 3 business days' }
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
        h2{font-size:clamp(1.6rem,3.5vw,2rem);line-height:1.2;margin-top:3rem;margin-bottom:1.5rem}
        h3{font-size:1.1rem;margin-bottom:0.5rem;color:${C.ink}}
        p{line-height:1.75;font-size:1rem;color:${C.gray};margin-bottom:1.2rem}
        strong { color: ${C.ink}; font-weight: 600; }
        
        .mono-label{font-family:'JetBrains Mono',monospace;font-size:0.75rem;letter-spacing:0.14em;text-transform:uppercase;color:${C.brass};font-weight:500;display:inline-flex;align-items:center;gap:0.5rem}
        
        .btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 1.9rem;font-size:0.9rem;font-weight:500;font-family:'Inter',sans-serif;border:1px solid transparent;border-radius:8px;cursor:pointer;transition:all 0.3s ease;white-space:nowrap;text-decoration:none}
        .btn-dark{background:${C.ink};color:${C.bone}}
        .btn-dark:hover{background:${C.verdigris};transform:translateY(-2px);box-shadow:0 10px 20px rgba(21,23,26,0.15)}
        
        .wrap{max-width:1180px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
        
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
        .dropdown-item:hover, .dropdown-item.active{background:${C.bone2};color:${C.ink}}
        
        .mobile-menu-container{position:absolute;top:100%;right:0;background:${C.bone};border:1px solid ${C.line};border-radius:8px;min-width:280px;margin-top:0.75rem;z-index:1000;box-shadow:0 20px 40px rgba(21,23,26,0.08);overflow:hidden}
        .mobile-link{display:block;width:100%;padding:0.9rem 1.2rem;background:none;border:none;text-align:left;cursor:pointer;font-size:0.88rem;color:${C.gray};text-decoration:none;border-bottom:1px solid ${C.line};font-family:'Inter',sans-serif;transition:background 0.2s}
        .mobile-link:hover{background:${C.bone2}}
        .mobile-policies-header{padding:0.5rem 0;border-bottom:1px solid ${C.line};background:${C.bone2}}

        /* Hero */
        .hero{padding-top:140px;padding-bottom:clamp(3rem,6vw,5rem);position:relative;overflow:hidden;background:#000000;color:${C.bone}}
        .hero-grid-bg{position:absolute;top:0;left:0;right:0;bottom:0;background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;mask-image:linear-gradient(to bottom,black,transparent 80%);-webkit-mask-image:linear-gradient(to bottom,black,transparent 80%)}
        .hero-glow{position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 30% 40%,rgba(61,79,71,0.3) 0%,transparent 60%);pointer-events:none}
        .hero-content{max-width:850px;position:relative;z-index:1}
        .hero-desc{font-size:1.2rem;max-width:700px;margin-bottom:0;color:rgba(255,255,255,0.8);line-height:1.8}
        .hero-meta { color: ${C.grayLight}; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; margin-top: 1.5rem; }
        
        /* Content Layout */
        .blog-content { max-width: 850px; margin: 0 auto; padding: 5rem clamp(1.25rem, 5vw, 2.5rem); }
        
        /* Cards */
        .card { background: ${C.bone}; border: 1px solid ${C.line}; border-radius: 12px; padding: 2.5rem; transition: all 0.3s ease; margin-bottom: 2rem; }
        .card-highlight { border-left: 4px solid ${C.verdigris}; }
        .card-accent { border-left: 4px solid ${C.brass}; background: ${C.bone2}; }
        
        /* Feature Grid */
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .feature-card { background: ${C.bone}; border: 1px solid ${C.line}; padding: 1.5rem; border-radius: 12px; transition: all 0.3s ease; }
        .feature-card:hover { transform: translateY(-4px); border-color: ${C.verdigrisLight}; box-shadow: 0 10px 20px rgba(21,23,26,0.04); }
        .feature-icon { width: 40px; height: 40px; background: ${C.verdigrisTint}; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: ${C.verdigris}; margin-bottom: 1rem; }
        
        /* List */
        .styled-list { list-style: none; padding: 0; margin: 0 0 1.5rem 0; }
        .styled-list li { display: flex; gap: 1rem; align-items: flex-start; padding: 0.8rem 0; border-bottom: 1px solid ${C.line}; }
        .styled-list li:last-child { border-bottom: none; }
        .list-bullet { width: 6px; height: 6px; border-radius: 50%; background: ${C.verdigris}; margin-top: 9px; flex-shrink: 0; }
        
        /* Table */
        .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 2rem 0; border-radius: 12px; border: 1px solid ${C.line}; }
        table { width: 100%; border-collapse: collapse; font-size: 0.95rem; min-width: 600px; }
        thead tr { background: ${C.ink}; color: ${C.bone}; }
        th { padding: 1rem 1.5rem; text-align: left; font-weight: 600; font-family: 'Inter', sans-serif; }
        td { padding: 1rem 1.5rem; border-bottom: 1px solid ${C.line}; vertical-align: top; }
        tr:last-child td { border-bottom: none; }
        tbody tr:nth-child(even) { background: ${C.bone2}; }
        
        .priority-badge { display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 600; white-space: nowrap; }
        .priority-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        
        /* CTA Box */
        .cta-card { position: relative; background: linear-gradient(135deg, #000000 0%, ${C.verdigrisDark} 100%); border-radius: 24px; padding: clamp(2.5rem, 5vw, 4rem) 2rem; text-align: center; overflow: hidden; border: 1px solid ${C.lineDark}; box-shadow: 0 40px 80px -20px rgba(21,23,26,0.3); margin-top: 4rem; }
        .cta-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 50% 0%, rgba(139,115,85,0.15) 0%, transparent 50%), linear-gradient(rgba(250,248,244,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(250,248,244,0.03) 1px, transparent 1px); background-size: 100% 100%, 40px 40px, 40px 40px; pointer-events: none; }
        .cta-content { position: relative; z-index: 2; max-width: 600px; margin: 0 auto; }
        .cta-content h2 { color: ${C.bone}; margin-bottom: 1.5rem; font-size: clamp(1.8rem, 4vw, 2.4rem); line-height: 1.2; }
        .cta-content p { color: rgba(250,248,244,0.8); font-size: 1.1rem; line-height: 1.8; margin-bottom: 2rem; }
        .contact-email { display: inline-flex; align-items: center; gap: 0.5rem; color: ${C.brassLight}; text-decoration: none; font-weight: 600; font-size: 1.1rem; transition: color 0.2s; }
        .contact-email:hover { color: ${C.bone}; }
        
        @media(max-width:800px){.nav-links{display:none}.nav-cta{display:none}.mobile-nav{display:flex;gap:0.5rem;align-items:center}}
        @media(max-width:768px){
          .card { padding: 1.5rem; }
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
            <button onClick={() => navigate('/contact')} className="nav-link">Contact</button>
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
              <div className="mono-label" style={{ marginBottom: '1rem' }}>Operations Policy</div>
              <h1 style={{ color: C.bone }}>Service Level Agreement (SLA)</h1>
              <p className="hero-desc">
                Our commitment to keeping your operations running with secure, reliable, and highly available infrastructure.
              </p>
              <div className="hero-meta">
                <span>Last updated: June 2026</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Content */}
        <div className="blog-content">

          {/* Our Commitment */}
          <Reveal>
            <h2>Our Commitment</h2>
            <p>
              When an organization chooses RestPoint, they are doing far more than purchasing software—they are entrusting us with one of the most critical parts of their daily operations.
            </p>
            <p>
              We understand that a mortuary never stops operating. Admissions, deceased registration, billing, dispatch, body tracking, and releases can happen at any hour of the day or night. Every minute of availability matters.
            </p>
            <p>
              That level of trust is something we never take for granted. Our commitment is simple: <strong>keep your operations running.</strong>
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="card card-highlight">
              <p style={{ margin: 0 }}>
                Our engineering and support teams work continuously to maintain a secure, reliable, and highly available platform that your staff can depend on every day. We proactively monitor system performance, perform preventive maintenance, and respond rapidly to any issue that could affect your operations.
              </p>
              <p style={{ marginTop: '1rem' }}>
                We target <strong>99.9% monthly uptime</strong>, with the goal of ensuring your team has uninterrupted access to the system whenever it is needed. Through our advanced PM2 cluster deployment architecture, we achieve <strong>zero-downtime deployments</strong> for system updates and maintenance—meaning your operations continue without interruption during software updates.
              </p>
            </div>
          </Reveal>

          {/* System Availability */}
          <Reveal>
            <h2>System Availability</h2>
            <div className="feature-grid">
              {availabilityFeatures.map((feat, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon">
                    <feat.icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{feat.title}</h3>
                  <p style={{ fontSize: '0.9rem', margin: 0 }}>{feat.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Planned Maintenance */}
          <Reveal>
            <h2>Planned Maintenance</h2>
            <p>
              To avoid disrupting your operations, scheduled maintenance is normally performed at times that least affect your workflow.
            </p>
            <ul className="styled-list">
              <li><span className="list-bullet"></span><span>Outside business hours (before <strong>9:00 AM</strong> or after <strong>4:00 PM</strong>)</span></li>
              <li><span className="list-bullet"></span><span>On weekends whenever possible</span></li>
              <li><span className="list-bullet"></span><span>Advance notice will be provided before any planned maintenance is scheduled</span></li>
            </ul>
          </Reveal>

          {/* Incident Response */}
          <Reveal>
            <h2>Incident Response</h2>
            <p>
              When something goes wrong, speed and clarity matter. Our incident response framework ensures fast initial reactions and clear timelines for resolution.
            </p>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Description</th>
                    <th>Initial Response</th>
                    <th>Target Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  {slaTiers.map((tier, i) => (
                    <tr key={i}>
                      <td>
                        <span className="priority-badge">
                          <span className="priority-dot" style={{ background: tier.color }}></span>
                          {tier.priority}
                        </span>
                      </td>
                      <td>{tier.desc}</td>
                      <td><strong>{tier.response}</strong></td>
                      <td>{tier.resolution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          {/* Our Promise */}
          <Reveal>
            <h2>Our Promise</h2>
            <p>
              At RestPoint, reliability is not a feature—it is a responsibility. We understand that when our system is unavailable, your work does not simply slow down; it can affect the smooth operation of your entire organization.
            </p>
            <p>
              Our <strong>PM2 cluster deployment architecture</strong> ensures that system updates and maintenance occur without any service interruption. New code is deployed seamlessly while existing operations continue uninterrupted, guaranteeing zero downtime during updates.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="card card-accent">
              <p style={{ margin: 0, fontSize: '1.1rem', fontFamily: "'Fraunces', serif", color: C.ink, lineHeight: 1.6 }}>
                "Your operations should never have to stop because of your software."
              </p>
              <p style={{ marginTop: '1rem', marginBottom: 0 }}>
                Through our <strong>zero-downtime deployment architecture</strong>, we ensure that software updates, maintenance, and improvements happen seamlessly—without interrupting your critical mortuary operations. Your staff can continue their work without interruption, even during system updates.
              </p>
            </div>
          </Reveal>

          {/* CTA / Contact Box */}
          <Reveal>
            <div className="cta-card">
              <div className="cta-content">
                <div className="mono-label" style={{ color: C.brass, marginBottom: '1.5rem' }}>Need Help?</div>
                <h2>SLA Questions?</h2>
                <p>Questions about uptime, zero-downtime deployments, incidents, or maintenance schedules? We typically respond within 2 business days.</p>
                <a href="mailto:support@restpoint.co.ke" className="contact-email">
                  <Mail size={20} /> support@restpoint.co.ke
                </a>
              </div>
            </div>
          </Reveal>

        </div>
      </main>
      <Footer goTerms={goTerms} />
    </div>
  );
}