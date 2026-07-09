import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, Check } from 'lucide-react';
import Footer from '../../components/layout/Footer';
import LandingPageSEO from '../../components/seo/LandingPageSEO';

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

function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShown(true); obs.disconnect(); } },
      { threshold: 0.15 }
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
      transform: shown ? 'translateY(0)' : 'translateY(18px)',
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      ...style
    }}>
      {children}
    </div>
  );
};

const Mark = ({ size = 28, color = C.verdigris }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="1" />
    <path d="M16 8.5V23.5M9.5 16H22.5" stroke={color} strokeWidth="1" />
    <circle cx="16" cy="16" r="2.5" fill={color} />
  </svg>
);

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
      <button onClick={() => setOpen(!open)} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        Policies<ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, background: C.ink, border: `1px solid ${C.line}`, borderRadius: '2px', minWidth: '240px', marginTop: '0.5rem', zIndex: 1000, boxShadow: '0 10px 30px rgba(21,23,26,0.2)' }}>
          {policies.map((p, i) => (
            <button key={i} onClick={() => { p.onClick(); setOpen(false); }}
              style={{ width: '100%', padding: '0.8rem 1.1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: C.grayLight, borderBottom: i < policies.length - 1 ? `1px solid ${C.lineDark}` : 'none' }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(250,248,244,0.08)'; e.target.style.color = C.bone; }}
              onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = C.grayLight; }}
            >{p.label}</button>
          ))}
        </div>
      )}
    </div>
  );
};

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
      <button onClick={() => setOpen(!open)} className="nav-link" style={{ display: 'flex', alignItems: 'center', padding: '0.75rem' }}>
        <Menu size={22} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, background: C.ink, border: `1px solid ${C.line}`, borderRadius: '2px', minWidth: '220px', marginTop: '0.5rem', zIndex: 1000, boxShadow: '0 10px 30px rgba(21,23,26,0.2)' }}>
          <a href="#features" onClick={() => setOpen(false)} style={{ display: 'block', padding: '0.8rem 1.1rem', color: C.grayLight, textDecoration: 'none', fontSize: '0.85rem', borderBottom: `1px solid ${C.lineDark}` }}>Features</a>
          <a href="#pricing" onClick={() => setOpen(false)} style={{ display: 'block', padding: '0.8rem 1.1rem', color: C.grayLight, textDecoration: 'none', fontSize: '0.85rem', borderBottom: `1px solid ${C.lineDark}` }}>Pricing</a>
          <button onClick={() => { navigate('/about'); setOpen(false); }} style={{ width: '100%', padding: '0.8rem 1.1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: C.grayLight, borderBottom: `1px solid ${C.lineDark}` }}>About</button>
          <div style={{ padding: '0.5rem 0', borderBottom: `1px solid ${C.lineDark}` }}>
            <div style={{ padding: '0.4rem 1.1rem', fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', color: C.brass, opacity: 0.7 }}>Policies</div>
            {policies.map((p, i) => (
              <button key={i} onClick={() => { p.onClick(); setOpen(false); }} style={{ width: '100%', padding: '0.6rem 1.1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', color: C.grayLight, borderBottom: i < policies.length - 1 ? `1px solid ${C.lineDark}` : 'none' }}>{p.label}</button>
            ))}
          </div>
          <button onClick={() => { goLogin(); setOpen(false); }} style={{ width: '100%', padding: '0.8rem 1.1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: C.grayLight, borderBottom: `1px solid ${C.lineDark}` }}>Log in</button>
          <button onClick={() => { goStart(); setOpen(false); }} style={{ width: '100%', padding: '0.8rem 1.1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: C.grayLight }}>Request access</button>
        </div>
      )}
    </div>
  );
};

const MockDocuments = () => (
  <div style={{ background: C.bone2, border: `1px solid ${C.line}`, padding: '3rem', maxWidth: '100%', width: '100%', borderRadius: '2px' }}>
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '0.85rem', fontFamily: "'JetBrains Mono', monospace", color: C.verdigris, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>CASE FILE</div>
      <div style={{ fontSize: '1.6rem', fontFamily: "'Fraunces', serif", color: C.ink }}>Otieno, J.</div>
      <div style={{ fontSize: '0.9rem', color: C.gray }}>4 documents</div>
    </div>
    <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: '1.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: `1px solid ${C.line}`, fontSize: '0.95rem', color: C.gray }}>
        <span>Death certificate.pdf</span>
        <span style={{ fontSize: '0.85rem', fontFamily: "'JetBrains Mono', monospace", color: C.verdigris }}>Verified</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: `1px solid ${C.line}`, fontSize: '0.95rem', color: C.gray }}>
        <span>Burial permit.pdf</span>
        <span style={{ fontSize: '0.85rem', fontFamily: "'JetBrains Mono', monospace", color: C.brass }}>Pending</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', fontSize: '0.95rem', color: C.gray }}>
        <span>Police abstract.pdf</span>
        <span style={{ fontSize: '0.85rem', fontFamily: "'JetBrains Mono', monospace", color: '#C77B5E' }}>Missing</span>
      </div>
    </div>
  </div>
);

const MockInsurance = () => (
  <div style={{ background: C.verdigrisDark, border: `1px solid ${C.verdigrisLight}`, padding: '3rem', maxWidth: '100%', width: '100%', borderRadius: '2px' }}>
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '0.85rem', fontFamily: "'JetBrains Mono', monospace", color: C.brass, letterSpacing: '0.1em', marginBottom: '1rem' }}>FUNERAL INSURANCE</div>
      <div style={{ fontSize: '1.6rem', fontFamily: "'Fraunces', serif", color: C.bone, lineHeight: 1.3 }}>Last respect expenses covered</div>
    </div>
    <div style={{ borderTop: `1px solid rgba(250,248,244,0.14)`, paddingTop: '1.2rem' }}>
      <p style={{ color: 'rgba(250,248,244,0.75)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.2rem' }}>
        Rest Point streamlines funeral insurance claims — from member contributions to automated benefit disbursements. Purpose-built for churches, SACCOs, chamas, and organizations across Kenya.
      </p>
    </div>
    <button onClick={() => window.location.href = '/insurance'} style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem', background: C.brass, border: 'none', color: C.bone, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em' }}>Learn about funeral insurance</button>
  </div>
);

const MockHearse = () => (
  <div style={{ background: C.ink, border: `1px solid ${C.line}`, padding: '3rem', maxWidth: '100%', width: '100%', borderRadius: '2px' }}>
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '0.85rem', fontFamily: "'JetBrains Mono', monospace", color: C.brassLight, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>HEARSE MANAGEMENT</div>
      <div style={{ fontSize: '1.6rem', fontFamily: "'Fraunces', serif", color: C.bone, lineHeight: 1.3 }}>Reliable fleet & dispatch</div>
    </div>
    <div style={{ borderTop: `1px solid rgba(250,248,244,0.14)`, paddingTop: '1.2rem' }}>
      <p style={{ color: 'rgba(250,248,244,0.75)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.2rem' }}>
        Effective hearse management helps a funeral home provide reliable, professional, and respectful transportation services. Assign hearses to funerals efficiently.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.2rem' }}>
        <div style={{ background: 'rgba(250,248,244,0.06)', padding: '0.8rem', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.72rem', color: C.brassLight, marginBottom: '0.3rem' }}>SCHEDULING</div>
          <div style={{ fontSize: '0.85rem', color: C.bone }}>Avoid conflicts</div>
        </div>
        <div style={{ background: 'rgba(250,248,244,0.06)', padding: '0.8rem', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.72rem', color: C.brassLight, marginBottom: '0.3rem' }}>TRACKING</div>
          <div style={{ fontSize: '0.85rem', color: C.bone }}>Daily, weekly, monthly</div>
        </div>
        <div style={{ background: 'rgba(250,248,244,0.06)', padding: '0.8rem', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.72rem', color: C.brassLight, marginBottom: '0.3rem' }}>INSURANCE</div>
          <div style={{ fontSize: '0.85rem', color: C.bone }}>Track renewal dates</div>
        </div>
        <div style={{ background: 'rgba(250,248,244,0.06)', padding: '0.8rem', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.72rem', color: C.brassLight, marginBottom: '0.3rem' }}>AVAILABILITY</div>
          <div style={{ fontSize: '0.85rem', color: C.bone }}>View hearse status</div>
        </div>
      </div>
    </div>
  </div>
);

const MockDispatch = () => {
  const [distance, setDistance] = useState(38);
  const [rate, setRate] = useState(195);
  const cost = Math.round(distance * 0.12 * rate);
  return (
    <div style={{ background: C.ink, border: `1px solid ${C.line}`, padding: '2.8rem', maxWidth: '520px', borderRadius: '2px' }}>
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brassLight, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>SMART DISPATCH</div>
        <div style={{ fontSize: '1.3rem', fontFamily: "'Fraunces', serif", color: C.bone }}>Hearse 02 Karen to Lang'ata</div>
      </div>
      <div style={{ borderTop: `1px solid rgba(250,248,244,0.14)`, paddingTop: '1rem' }}>
        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.78rem', color: C.grayLight }}>
            <span>Distance (km)</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.bone }}>{distance}</span>
          </div>
          <input type="range" min="2" max="120" value={distance} onChange={(e) => setDistance(Number(e.target.value))} style={{ width: '100%', height: '2px', background: 'rgba(250,248,244,0.2)', outline: 'none', cursor: 'pointer' }} />
        </div>
        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.78rem', color: C.grayLight }}>
            <span>Fuel rate (KES/L)</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.bone }}>{rate}</span>
          </div>
          <input type="range" min="150" max="250" value={rate} onChange={(e) => setRate(Number(e.target.value))} style={{ width: '100%', height: '2px', background: 'rgba(250,248,244,0.2)', outline: 'none', cursor: 'pointer' }} />
        </div>
        <div style={{ borderTop: `1px solid rgba(250,248,244,0.14)`, paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: '0.78rem', color: C.grayLight }}>Trip cost (auto billed)</span>
          <span style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.bone, fontWeight: 600 }}>KES {cost.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

const MockPortal = () => (
  <div style={{ background: C.ink, border: `1px solid ${C.line}`, padding: '3rem', maxWidth: '100%', width: '100%', borderRadius: '2px' }}>
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '0.85rem', fontFamily: "'JetBrains Mono', monospace", color: C.brassLight, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>MWANGI FAMILY</div>
      <div style={{ fontSize: '1.6rem', fontFamily: "'Fraunces', serif", color: C.bone, marginBottom: '0.4rem' }}>Arrangements confirmed</div>
    </div>
    <div style={{ borderTop: `1px solid rgba(250,248,244,0.14)`, paddingTop: '1.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: `1px solid rgba(250,248,244,0.14)`, fontSize: '0.95rem', color: C.grayLight }}>
        <span>Burial permit.pdf</span>
        <span style={{ fontSize: '0.85rem', color: C.brassLight }}>Download</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: `1px solid rgba(250,248,244,0.14)`, fontSize: '0.95rem', color: C.grayLight }}>
        <span>Service invoice</span>
        <span style={{ fontSize: '0.85rem', fontFamily: "'JetBrains Mono', monospace", color: C.bone }}>KES 84,000</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', fontSize: '0.95rem', color: C.grayLight }}>
        <span>Outstanding balance</span>
        <button style={{ padding: '0.4rem 0.9rem', background: C.verdigris, border: `1px solid ${C.verdigrisLight}`, color: C.bone, fontSize: '0.82rem', cursor: 'pointer', fontWeight: 500 }}>Pay now</button>
      </div>
    </div>
  </div>
);

const Showcase = ({ no, title, desc, reverse, children }) => (
  <Reveal className="showcase-mobile" style={{
    display: 'grid',
    gridTemplateColumns: reverse ? '1fr 1.2fr' : '1.2fr 1fr',
    gap: '3.5rem',
    alignItems: 'center',
    marginBottom: '5rem',
  }}>
    <div className="showcase-text" style={{ order: reverse ? 2 : 1 }}>
      <div style={{ fontSize: '0.85rem', fontFamily: "'JetBrains Mono', monospace", color: C.verdigris, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>Module {no}</div>
      <h2 style={{ fontSize: '2rem', fontFamily: "'Fraunces', serif", color: C.ink, marginBottom: '1rem', lineHeight: 1.2 }}>{title}</h2>
      <p style={{ fontSize: '1.05rem', maxWidth: '480px', color: C.gray, lineHeight: 1.8 }}>{desc}</p>
    </div>
    <div className="showcase-visual" style={{ order: reverse ? 1 : 2, display: 'flex', justifyContent: reverse ? 'flex-start' : 'flex-end' }}>
      {children}
    </div>
  </Reveal>
);

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  const goLogin = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); };
  const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
  const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };
  const goAbout = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/about'); };

  const plans = [
    {
      name: 'Single Tenant',
      monthly: '9,200',
      annual: '101,200',
      color: C.verdigris,
      features: ['Up to 20 users', 'Unlimited cases & documents', 'Family portal', 'Analytics & reporting', 'Case management & billing', 'Standard support', 'Daily backups'],
    },
    {
      name: 'Multi-Tenant',
      monthly: '18,900',
      annual: '189,000',
      color: C.brass,
      featured: true,
      features: ['Unlimited users', 'Unlimited cases & documents', 'All Single features +', 'Advanced analytics', 'Priority 24/7 support', 'Custom integrations', 'Hourly backups'],
    },
  ];

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 60); return () => clearTimeout(t); }, []);

  return (
    <>
      <LandingPageSEO />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@0,9..144,500;0,9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',sans-serif;color:${C.gray};background:${C.bone};-webkit-font-smoothing:antialiased}
        h1,h2,h3{font-family:'Fraunces',serif;font-weight:500;letter-spacing:-0.01em;color:${C.ink}}
        h1{font-size:clamp(2.8rem,6.5vw,4.6rem);line-height:1.05;margin-bottom:1.4rem}
        h2{font-size:clamp(1.9rem,4vw,2.5rem);line-height:1.2}
        p{line-height:1.7;font-size:1rem}
        a{color:inherit;text-decoration:none}
        .label{font-family:'JetBrains Mono',monospace;font-size:0.74rem;letter-spacing:0.12em;text-transform:uppercase;color:${C.brass}}
        .btn{display:inline-flex;align-items:center;gap:0.5rem;padding:0.9rem 1.9rem;font-size:0.85rem;font-weight:500;font-family:'Inter',sans-serif;border:1px solid transparent;border-radius:2px;cursor:pointer;transition:all 0.25s ease;white-space:nowrap;letter-spacing:0.01em}
        .btn-dark{background:${C.ink};color:${C.bone}}
        .btn-dark:hover{background:${C.verdigris}}
        .btn-line{background:transparent;color:${C.ink};border-color:${C.ink}}
        .btn-line:hover{background:${C.ink};color:${C.bone}}
        .btn-brass{background:${C.brass};color:${C.bone};border:none}
        .btn-brass:hover{background:${C.brassLight}}
        .wrap{max-width:1140px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
        nav{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(250,248,244,0.96);backdrop-filter:blur(12px);border-bottom:1px solid ${C.line};padding:1.2rem 0}
        .nav-wrap{display:flex;justify-content:space-between;align-items:center}
        .logo{display:flex;align-items:center;gap:0.7rem;font-family:'Fraunces',serif;font-size:1.25rem;font-weight:500;color:${C.ink};cursor:pointer}
        .nav-links{display:flex;gap:2.2rem;align-items:center}
        .nav-link{font-size:0.85rem;color:${C.gray};text-decoration:none;cursor:pointer;transition:color 0.2s;background:transparent;border:none;font-family:'Inter',sans-serif}
        .nav-link:hover{color:${C.verdigris}}
        .nav-cta{display:flex;gap:0.75rem}
        .mobile-nav{display:none}
        @media(max-width:800px){.nav-links{display:none}.nav-cta{display:none}.mobile-nav{display:flex;gap:0.5rem;align-items:center}}
        .hero{padding-top:120px;padding-bottom:clamp(3rem,6vw,5rem)}
        .hero-grid{display:grid;grid-template-columns:1.1fr 0.9fr;gap:3rem;align-items:center}
        @media(max-width:768px){.hero-grid{grid-template-columns:1fr;gap:2rem}}
        .hero-desc{font-size:1rem;max-width:100%;margin-bottom:1.5rem;color:${C.gray};line-height:1.7}
        .hero-buttons{display:flex;gap:0.75rem;flex-wrap:wrap}
        .proof{border-top:1px solid ${C.line};border-bottom:1px solid ${C.line};background:${C.bone2};padding:clamp(2.5rem,5vw,3.5rem)0}
        .proof-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem}
        @media(max-width:768px){.proof-grid{grid-template-columns:1fr;gap:1.5rem}}
        .proof-item{text-align:center;padding:0 1rem;border-left:1px solid ${C.line}}
        .proof-item:first-child{border-left:none;padding-left:1rem}
        @media(max-width:768px){.proof-item{border-left:none;padding:0}.proof-item:first-child{padding-left:0}}
        .proof-num{font-family:'JetBrains Mono',monospace;font-size:clamp(1.8rem,4vw,2.2rem);color:${C.verdigris};font-weight:600;margin-bottom:0.4rem}
        .proof-cap{font-size:0.85rem;color:${C.ink};font-weight:500}
        .section{padding:clamp(3rem,6vw,5rem)0}
        .insurance-section{background:${C.verdigrisDark};padding:clamp(5rem,10vw,7rem)0}
        .insurance-content{max-width:640px}
        .insurance-heading{color:${C.bone};margin-bottom:1.2rem}
        .infra-section{background:${C.bone2};padding:clamp(3rem,6vw,5rem)0}
        .infra-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;margin-top:2rem}
        .pricing-section{padding:clamp(3rem,6vw,5rem)0;background:${C.bone}}
        .pricing-header{text-align:center;margin-bottom:2.5rem;padding:0 1rem}
        .pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem}
        .pricing-card{border:2px solid ${C.verdigris};padding:1.8rem;position:relative;border-radius:8px;transition:all 0.25s ease;background:${C.bone}}
        .pricing-card.featured{background:${C.verdigrisDark};border-color:${C.brass};transform:scale(1.02);box-shadow:0 20px 40px rgba(21,23,26,0.12)}
        @media(max-width:768px){.pricing-card.featured{transform:none}}
        .pricing-badge{position:absolute;top:-12px;left:1rem;background:${C.brass};color:${C.bone};padding:0.3rem 0.75rem;font-size:0.7rem;font-family:'JetBrains Mono',monospace;letter-spacing:0.08em;border-radius:20px;font-weight:500}
        .pricing-name{font-size:1.2rem;font-family:'Fraunces',serif;margin-bottom:0.4rem}
        .pricing-amount{font-size:clamp(2rem,5vw,2.6rem);font-family:'Fraunces',serif;font-weight:600;margin-bottom:0.25rem;letter-spacing:-0.02em}
        .pricing-period{font-size:0.85rem;color:${C.grayLight};margin-bottom:1.2rem}
        .pricing-btn{width:100%;padding:0.8rem;margin-bottom:1.5rem;font-size:0.85rem;font-weight:600;cursor:pointer;border-radius:6px;transition:all 0.2s}
        .pricing-features{list-style:none;padding:0;margin:0}
        .pricing-feature{display:flex;gap:0.7rem;margin-bottom:0.75rem;font-size:0.85rem;align-items:flex-start}
        .pricing-feature svg{flex-shrink:0;margin-top:2px}
        .about-section{background:${C.bone};padding:clamp(3rem,6vw,4rem)0;border-top:1px solid ${C.line};border-bottom:1px solid ${C.line}}
        .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center}
        @media(max-width:768px){.about-grid{grid-template-columns:1fr;gap:2rem}}
        .cta-section{background:${C.verdigrisDark};padding:clamp(3rem,6vw,5rem)0;border-top:1px solid ${C.verdigrisLight};border-bottom:1px solid ${C.verdigrisLight}}
        .cta-content{max-width:700px;text-align:center;margin:0 auto;padding:0 1rem}
        .cta-content h2{color:${C.bone};margin-bottom:1rem;font-size:clamp(1.5rem,4vw,2rem)}
        .cta-content p{color:rgba(250,248,244,0.75);font-size:1rem;line-height:1.7;margin-bottom:1.5rem}
        .cta-buttons{display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap}
        footer{background:${C.ink};color:${C.grayLight};padding:clamp(3rem,6vw,5rem)0 2rem;border-top:2px solid ${C.verdigrisLight};position:relative;overflow:hidden}
        .footer-content{display:grid;grid-template-columns:2fr 1fr 1fr 1.2fr;gap:2.5rem;margin-bottom:3rem}
        @media(max-width:1024px){.footer-content{grid-template-columns:2fr 1fr 1fr;gap:2rem}}
        @media(max-width:768px){.footer-content{grid-template-columns:1fr;gap:1.5rem}}
        .footer-col h4{font-family:'JetBrains Mono',monospace;font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:${C.verdigrisTint};margin-bottom:1rem;font-weight:600;opacity:0.7}
        .footer-col a,.footer-col button{display:block;font-size:0.82rem;color:${C.grayLight};text-decoration:none;margin-bottom:0.5rem;background:none;border:none;cursor:pointer;transition:color 0.2s;text-align:left;padding:0;line-height:1.5}
        .footer-col a:hover,.footer-col button:hover{color:${C.verdigrisTint}}
        .footer-brand{font-family:'Fraunces',serif;font-size:1.3rem;color:${C.bone};font-weight:500;margin-bottom:0.5rem;letter-spacing:-0.02em}
        .footer-desc{font-size:0.85rem;color:${C.grayLight};line-height:1.7;max-width:100%;opacity:0.8}
        .footer-bottom{display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;color:${C.grayLight};padding-top:1.2rem;border-top:1px solid ${C.lineDark}}
        @media(max-width:600px){.footer-bottom{flex-direction:column;gap:0.75rem;text-align:center}}
        /* Mobile fixes: single column, better stacking */
        @media(max-width:768px){
          .hero{padding-top:100px}
          .hero-desc{font-size:0.95rem}
          .hero-buttons{flex-direction:column;width:100%}
          .hero-buttons .btn{width:100%;justify-content:center}
          .section{padding:2.5rem 0}
          .infra-grid{grid-template-columns:1fr!important;gap:1.5rem!important}
          .pricing-grid{grid-template-columns:1fr!important;gap:1rem!important}
          .pricing-card{padding:1.5rem!important}
          .pricing-amount{font-size:1.8rem!important}
          .cta-buttons{flex-direction:column;width:100%}
          .cta-buttons .btn{width:100%;justify-content:center}
          .nav-wrap{padding:0.5rem 0}
          .logo{font-size:1.1rem}
          .showcase-mobile{grid-template-columns:1fr!important;gap:1.5rem!important;margin-bottom:3rem!important}
          .showcase-mobile .showcase-text{order:2!important}
          .showcase-mobile .showcase-visual{order:1!important;justify-content:center!important}
          .showcase-mobile h2{font-size:1.5rem!important}
          .showcase-mobile p{font-size:0.95rem!important;max-width:100%!important}
          .mock-card{max-width:100%!important;padding:1.5rem!important;width:100%!important}
        }
        @media(max-width:480px){
          .hero{padding-top:90px}
          h1{font-size:2rem!important}
          h2{font-size:1.4rem!important}
          .hero-desc{font-size:0.9rem}
          .btn{padding:0.7rem 1.2rem!important;font-size:0.8rem!important}
          .pricing-card{padding:1.2rem!important}
          .pricing-feature{font-size:0.8rem!important}
          .footer-content{gap:1rem!important}
        }
      `}</style>

      <nav>
        <div className="wrap nav-wrap">
          <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Mark size={24} /><span>Rest Point</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <PolicyDropdown navigate={navigate} goTerms={goTerms} />
            <button onClick={goAbout} className="nav-link">About</button>
          </div>
          <div className="nav-cta">
            <button className="btn btn-line" onClick={goLogin} style={{ padding: '0.65rem 1.4rem', fontSize: '0.8rem' }}>Log in</button>
            <button className="btn btn-dark" onClick={goStart} style={{ padding: '0.65rem 1.4rem', fontSize: '0.8rem' }}>Request access</button>
          </div>
          <div className="mobile-nav">
            <button className="btn btn-line" onClick={goLogin} style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem' }}>Log in</button>
            <MobileMenu navigate={navigate} goTerms={goTerms} goLogin={goLogin} goStart={goStart} />
          </div>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="wrap">
            <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
              <div style={{ display: 'inline-block', marginBottom: '1.6rem', padding: '0.6rem 1rem', background: 'rgba(61,79,71,0.1)' }}>
                <span className="label" style={{ color: C.verdigris }}>Funeral Home OS & Welfare Platform</span>
              </div>
              <h1>A record worthy of the families you serve.</h1>
            </div>
            <div className="hero-grid">
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 100ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 100ms' }}>
                <p className="hero-desc">Rest Point is the complete platform for funeral homes and welfare organizations. Manage cases, coordinate funeral insurance claims, track member contributions, and serve families with the same care you bring to every service. Trusted by funeral homes, churches, SACCOs, and welfare groups across Kenya.</p>
                <div className="hero-buttons">
                  <button className="btn btn-dark" onClick={goStart}>Request access</button>
                  <button className="btn btn-line" onClick={goLogin}>See how it works</button>
                </div>
              </div>
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 200ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 200ms', width: '100%' }}>
                <div style={{ background: C.verdigrisDark, border: `1px solid ${C.verdigrisLight}`, padding: '2rem', borderRadius: '4px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brass, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>DASHBOARD PREVIEW</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                      <div><div style={{ fontSize: '2rem', fontFamily: "'Fraunces', serif", color: C.bone, fontWeight: 600 }}>24</div><div style={{ fontSize: '0.72rem', color: C.grayLight }}>Active Cases</div></div>
                      <div><div style={{ fontSize: '2rem', fontFamily: "'Fraunces', serif", color: C.bone, fontWeight: 600 }}>KES 84K</div><div style={{ fontSize: '0.72rem', color: C.grayLight }}>Pending Bill</div></div>
                      <div><div style={{ fontSize: '2rem', fontFamily: "'Fraunces', serif", color: C.bone, fontWeight: 600 }}>7</div><div style={{ fontSize: '0.72rem', color: C.grayLight }}>New Today</div></div>
                    </div>
                  </div>
                  <div style={{ borderTop: `1px solid ${C.lineDark}`, paddingTop: '1.5rem' }}>
                    {[{ name: 'Otieno Family', status: 'In Progress', dot: C.verdigrisLight }, { name: 'Mwangi Family', status: 'Documents Pending', dot: C.brass }, { name: 'Kamau Family', status: 'KES 120,000', dot: C.accent }].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: i < 2 ? `1px solid ${C.lineDark}` : 'none', fontSize: '0.84rem', color: C.grayLight }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.dot, display: 'inline-block' }} />
                          {item.name}
                        </span>
                        <span style={{ color: C.brass }}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="section">
          <div className="wrap">
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div className="label" style={{ marginBottom: '1rem' }}>Features</div>
                <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '1rem' }}>Everything you need to operate with dignity</h2>
                <p style={{ maxWidth: '600px', margin: '0 auto', color: C.gray }}>From case management to funeral insurance integration, Rest Point provides the tools funeral homes and welfare organizations need to serve families efficiently.</p>
              </div>
            </Reveal>
            <Showcase no="01" title="Case management that respects your workflow" desc="Track every detail from first call to final settlement. Rest Point keeps case files organized, documents verified, and families informed." reverse={false}><MockDocuments /></Showcase>
            <Showcase no="02" title="Family portal & online memorials" desc="Give families secure access to arrangements, documents, and billing. Light a candle, leave a condolence, and stay connected." reverse={true}><MockPortal /></Showcase>
            <Showcase no="03" title="Smart dispatch & billing" desc="Optimize hearse routes, calculate costs automatically, and bill with precision. Rest Point turns logistics into a competitive advantage." reverse={false}><MockDispatch /></Showcase>
            <Showcase no="04" title="Hearse management module" desc="Effective hearse management helps a funeral home provide reliable, professional, and respectful transportation services. Assign hearses to funerals efficiently. Avoid scheduling conflicts." reverse={true}><MockHearse /></Showcase>
          </div>
        </section>

        <section style={{ background: C.verdigrisDark, padding: 'clamp(5rem,10vw,7rem) 0' }}>
          <div className="wrap">
            <div style={{ maxWidth: '700px' }}>
              <Reveal>
                <div className="label" style={{ color: C.brass, marginBottom: '1rem' }}>Funeral Insurance & Welfare Management</div>
                <h2 style={{ color: C.bone, marginBottom: '1.5rem', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', lineHeight: 1.3 }}>We understand the pain and financial burden families face</h2>
                <p style={{ color: 'rgba(250,248,244,0.75)', lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                  Families go through immense pain when they lose a loved one, only to be burdened with huge hospital bills and funeral expenses. We break down these barriers by bringing comprehensive funeral insurance solutions directly to your funeral home, chama, SACCO, or church.
                </p>
                <p style={{ color: 'rgba(250,248,244,0.75)', lineHeight: 1.8, marginBottom: '2.5rem', fontSize: '1.05rem' }}>
                  Rest Point now includes comprehensive funeral insurance management and welfare scheme administration tools. Perfect for churches, SACCOs, chamas, companies, and NGOs.
                </p>
                <button className="btn btn-brass" onClick={() => window.location.href = '/insurance'} style={{ fontSize: '1rem', padding: '1rem 2.5rem' }}>
                  Learn about funeral insurance
                </button>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="pricing" className="pricing-section">
          <div className="wrap">
            <div className="pricing-header">
              <div className="label" style={{ marginBottom: '1rem' }}>Pricing</div>
              <h2 style={{ marginBottom: '1rem' }}>Simple, transparent pricing</h2>
              <p style={{ color: C.gray, maxWidth: '500px', margin: '0 auto' }}>Choose the plan that fits your organization. All plans include core features with no hidden fees.</p>
            </div>
            <div className="pricing-grid">
              {plans.map((plan, i) => (
                <div key={i} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
                  {plan.featured && <div className="pricing-badge">MOST POPULAR</div>}
                  <div className="pricing-name" style={{ color: plan.featured ? C.bone : C.ink }}>{plan.name}</div>
                  <div className="pricing-amount" style={{ color: plan.featured ? C.bone : C.ink }}>KES {plan.monthly}<span className="pricing-period">/month</span></div>
                  <button className="pricing-btn" style={{ background: plan.featured ? C.brass : C.ink, color: C.bone }}>Get started</button>
                  <ul className="pricing-features">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="pricing-feature">
                        <Check size={18} color={plan.featured ? C.brass : C.verdigris} />
                        <span style={{ color: plan.featured ? C.bone : C.gray }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="wrap">
            <div className="cta-content">
              <h2>Ready to transform your funeral home or welfare organization?</h2>
              <p>Join 500+ organizations across Kenya using Rest Point to manage cases, process insurance claims, and administer welfare schemes with confidence.</p>
              <div className="cta-buttons">
                <button className="btn btn-brass" onClick={goStart}>Start free trial</button>
                <button className="btn btn-line" style={{ color: C.bone, borderColor: C.bone }} onClick={goAbout}>Contact sales</button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}