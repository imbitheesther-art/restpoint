import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, Menu, X, ArrowRight, ShieldCheck, FileArchive,
  Upload, UserCheck, Mail
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
            <button key={i} onClick={() => { p.onClick(); setOpen(false); }} className={`dropdown-item ${p.label === 'Data Migration Policy' ? 'active' : ''}`}>
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

export default function DataMigrationPolicy() {
  const navigate = useNavigate();

  const goLogin = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); };
  const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
  const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

  const transferOptions = [
    { icon: UserCheck, title: 'Personal Collection', desc: 'For organizations within a reasonable travel distance, a RestPoint representative can collect your data in person using an encrypted, password-protected flash drive.' },
    { icon: FileArchive, title: 'Encrypted ZIP File', desc: 'You may send your migration files as a password-protected ZIP archive via email. For security reasons, the ZIP password must never be included in the same email. Instead, the password should be shared through a separate communication channel, such as WhatsApp or a phone call.' },
    { icon: Upload, title: 'Secure Upload Portal', desc: 'For larger datasets that cannot be conveniently transferred by email, we can provide access to a secure upload portal where your files can be uploaded directly.' }
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
        .lead-text { font-size: 1.2rem; line-height: 1.8; color: ${C.gray}; margin-bottom: 2rem; }
        
        /* Cards */
        .card { background: ${C.bone}; border: 1px solid ${C.line}; border-radius: 12px; padding: 2.5rem; transition: all 0.3s ease; }
        .card-highlight { border-left: 4px solid ${C.verdigris}; }
        .card-accent { border-left: 4px solid ${C.brass}; background: ${C.bone2}; }
        
        /* List */
        .styled-list { list-style: none; padding: 0; margin: 0 0 1.5rem 0; }
        .styled-list li { display: flex; gap: 1rem; align-items: flex-start; padding: 0.8rem 0; border-bottom: 1px solid ${C.line}; }
        .styled-list li:last-child { border-bottom: none; }
        .list-bullet { width: 6px; height: 6px; border-radius: 50%; background: ${C.verdigris}; margin-top: 9px; flex-shrink: 0; }
        
        /* Transfer Options */
        .option-card { display: flex; gap: 1.5rem; padding: 2rem; background: ${C.bone}; border: 1px solid ${C.line}; border-radius: 12px; margin-bottom: 1.5rem; transition: all 0.3s ease; }
        .option-card:hover { border-color: ${C.verdigrisLight}; box-shadow: 0 10px 20px rgba(21,23,26,0.04); }
        .option-icon { width: 48px; height: 48px; background: ${C.verdigrisTint}; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: ${C.verdigris}; flex-shrink: 0; }
        
        /* Table */
        .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 2rem 0; border-radius: 12px; border: 1px solid ${C.line}; }
        table { width: 100%; border-collapse: collapse; font-size: 0.95rem; min-width: 400px; }
        thead tr { background: ${C.ink}; color: ${C.bone}; }
        th { padding: 1rem 1.5rem; text-align: left; font-weight: 600; font-family: 'Inter', sans-serif; }
        td { padding: 1rem 1.5rem; border-bottom: 1px solid ${C.line}; }
        tr:last-child td { border-bottom: none; }
        tbody tr:nth-child(even) { background: ${C.bone2}; }
        
        /* CTA Contact Box */
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
          .option-card { flex-direction: column; gap: 1rem; }
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
              <h1 style={{ color: C.bone }}>Data Migration Policy</h1>
              <p className="hero-desc">
                For many funeral homes, decades of operational history exist in paper records, spreadsheets, or legacy systems. When you migrate to RestPoint, you are trusting us with that history.
              </p>
              <div className="hero-meta">
                <span>Last updated: June 2026</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Content */}
        <div className="blog-content">

          {/* Intro Summary */}
          <Reveal>
            <div className="card card-highlight" style={{ marginBottom: '3rem' }}>
              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Your History Matters</h2>
              <p style={{ color: C.gray }}>
                Those records represent thousands of families served and years of institutional knowledge. This document outlines how we handle, protect, and transition your data into the RestPoint ecosystem.
              </p>
            </div>
          </Reveal>

          {/* Our Migration Approach */}
          <Reveal>
            <h2>Our Migration Approach</h2>
            <p>
              Data migration is a specialized service that combines automation with careful manual verification. While many parts of the migration process are automated, every migration also requires human review to ensure information is transferred accurately.
            </p>
            <p>
              This process is intentionally thorough because every funeral home stores information differently, and no two datasets are exactly alike. Our objective is accuracy—not speed at the expense of your records.
            </p>
          </Reveal>

          {/* Commitment Box */}
          <Reveal delay={100}>
            <div className="card card-accent" style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <ShieldCheck size={24} color={C.brass} style={{ flexShrink: 0, marginTop: '4px' }} />
                <div>
                  <h3 style={{ margin: 0, marginBottom: '0.5rem', color: C.ink }}>Our Commitment</h3>
                  <p style={{ margin: 0 }}>
                    We take this responsibility seriously. Every migration is handled with strict confidentiality, careful verification, and professional attention to detail. All migration personnel operate under a Non-Disclosure Agreement (NDA), and your data is processed solely for the purpose of completing your migration.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Data Preparation */}
          <Reveal>
            <h2>Data Preparation</h2>
            <p>
              Many funeral homes are moving from manual records or older software that stores information differently from RestPoint. Before importing your data, we:
            </p>
            <ul className="styled-list">
              <li><span className="list-bullet"></span><span>Review and organize your existing records.</span></li>
              <li><span className="list-bullet"></span><span>Map your data to the appropriate RestPoint fields.</span></li>
              <li><span className="list-bullet"></span><span>Remove duplicate or invalid records where possible.</span></li>
              <li><span className="list-bullet"></span><span>Validate relationships between records.</span></li>
              <li><span className="list-bullet"></span><span>Populate required system fields that may not exist in your current records.</span></li>
            </ul>
            <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>
              Where information is genuinely unavailable, required fields may be populated with <strong>NULL</strong> values or appropriate system defaults to maintain database integrity and prevent migration failures.
            </p>
          </Reveal>

          {/* Secure Data Transfer */}
          <Reveal>
            <h2>Secure Data Transfer</h2>
            <p>We offer several secure methods for submitting migration data:</p>

            <div style={{ marginTop: '2rem' }}>
              {transferOptions.map((option, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="option-card">
                    <div className="option-icon">
                      <option.icon size={24} />
                    </div>
                    <div>
                      <h3 style={{ marginBottom: '0.5rem' }}>{option.title}</h3>
                      <p style={{ fontSize: '0.95rem', margin: 0 }}>{option.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>

          {/* Confidentiality */}
          <Reveal>
            <h2>Confidentiality & Data Protection</h2>
            <p>Your migration data remains your property at all times. We strictly adhere to the following guardrails:</p>
            <ul className="styled-list">
              <li><span className="list-bullet"></span><span>Treat all migration data as confidential.</span></li>
              <li><span className="list-bullet"></span><span>Process information only for migration purposes.</span></li>
              <li><span className="list-bullet"></span><span>Restrict access to authorized migration personnel.</span></li>
              <li><span className="list-bullet"></span><span>Never share or sell your information.</span></li>
              <li><span className="list-bullet"></span><span>Protect all transferred files using secure handling procedures.</span></li>
              <li><span className="list-bullet"></span><span>Require confidentiality from everyone involved in the migration process.</span></li>
            </ul>
          </Reveal>

          {/* Migration Timeline & Table */}
          <Reveal>
            <h2>Migration Timeline</h2>
            <p>Migration timelines depend on the size, quality, and complexity of your data. Typical timeframes include:</p>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Migration Type</th>
                    <th>Estimated Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Single Branch</strong></td>
                    <td>Approximately <strong>3 weeks</strong></td>
                  </tr>
                  <tr>
                    <td><strong>Multi-Branch Organization</strong></td>
                    <td>Approximately <strong>1–2 months</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>If additional data cleaning or verification is required, the timeline may be adjusted in consultation with your organization.</p>
          </Reveal>

          {/* Business Continuity */}
          <Reveal>
            <h2>Business Continuity</h2>
            <p>
              Migration activities are planned to minimize disruption to your daily operations. In most cases, your organization continues using its existing processes while migration work takes place in the background. Final cutover to RestPoint is scheduled at a mutually agreed time to reduce operational impact.
            </p>
          </Reveal>

          {/* Migration Fees */}
          <Reveal>
            <h2>Migration Fees</h2>
            <p>
              Data migration is a professional service involving data analysis, cleansing, mapping, validation, testing, and verification. Migration services <strong>start from KES 50,000 (approximately USD 390)</strong>.
            </p>
            <p>Final pricing depends on your structural footprint, historical volume, record hygiene metrics, and source platform architecture. A comprehensive customized quotation is provided before work begins.</p>
          </Reveal>

          {/* Post-Migration Verification */}
          <Reveal>
            <h2>Post-Migration & Retention</h2>
            <p>
              After migration is complete, your submitted migration files are retained securely for <strong>30 days</strong> to allow post-migration verification and the resolution of any migration-related queries.
            </p>
            <p>
              After the 30-day verification window closes, raw configuration materials, portal pipelines, secure archives, and working data structures are permanently scrubbed from our systems to reduce long term compliance overhead.
            </p>
          </Reveal>

          {/* CTA / Contact Box */}
          <Reveal>
            <div className="cta-card">
              <div className="cta-content">
                <div className="mono-label" style={{ color: C.brass, marginBottom: '1.5rem' }}>Need Help?</div>
                <h2>Questions or Coordination?</h2>
                <p>Contact our specialized operations deployment desk. Migration scoping requests are typically evaluated within 2 business days.</p>
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