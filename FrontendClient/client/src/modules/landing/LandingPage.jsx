import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, Menu, Check, ShieldCheck, Server, Zap, ArrowRight, X,
  FileText, Download, MapPin, Truck, Activity, Users, TrendingUp
} from 'lucide-react';
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
  grayDark: '#4A4844',
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

// Hook for closing dropdowns on outside click
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
          <a href="#features" onClick={() => setOpen(false)} className="mobile-link">Features</a>
          <a href="#pricing" onClick={() => setOpen(false)} className="mobile-link">Pricing</a>
          <button onClick={() => { navigate('/about'); setOpen(false); }} className="mobile-link">About</button>
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

// High-fidelity App Window wrapper
const AppWindow = ({ title, children, dark = false }) => (
  <div className={`app-window ${dark ? 'dark' : 'light'}`}>
    <div className="window-header">
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <span className="window-dot" style={{ background: '#FF5F57' }}></span>
        <span className="window-dot" style={{ background: '#FEBC2E' }}></span>
        <span className="window-dot" style={{ background: '#28C840' }}></span>
      </div>
      <span className="window-title">{title}</span>
      <div style={{ width: '40px' }}></div>
    </div>
    <div className="window-body">{children}</div>
  </div>
);

const MockDocuments = () => (
  <div className="mock-inner">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <div>
        <div className="mono-label" style={{ color: C.verdigris }}>CASE FILE</div>
        <div style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.ink, marginTop: '0.3rem' }}>Otieno, J.</div>
      </div>
      <div className="avatar" style={{ background: C.verdigris }}>JO</div>
    </div>

    <div className="mock-list-header">
      <span>Document Name</span>
      <span>Status</span>
    </div>

    <div className="mock-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div className="file-icon"><FileText size={16} color={C.verdigris} /></div>
        <span style={{ color: C.ink }}>Death certificate.pdf</span>
      </div>
      <span className="status-badge verified">Verified</span>
    </div>
    <div className="mock-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div className="file-icon"><FileText size={16} color={C.brass} /></div>
        <span style={{ color: C.ink }}>Burial permit.pdf</span>
      </div>
      <span className="status-badge pending">Pending</span>
    </div>
    <div className="mock-row" style={{ borderBottom: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div className="file-icon"><FileText size={16} color={C.accent} /></div>
        <span style={{ color: C.ink }}>Police abstract.pdf</span>
      </div>
      <span className="status-badge missing">Missing</span>
    </div>
  </div>
);

const MockPortal = () => (
  <div className="mock-inner">
    <div style={{ marginBottom: '1.5rem' }}>
      <div className="mono-label" style={{ color: C.verdigris }}>MWANGI FAMILY</div>
      <div style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.ink, marginTop: '0.3rem' }}>Arrangements confirmed</div>
    </div>

    <div className="mock-row" style={{ borderBottom: `1px solid ${C.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div className="file-icon"><FileText size={16} color={C.brass} /></div>
        <span style={{ color: C.ink }}>Burial permit.pdf</span>
      </div>
      <button className="action-btn"><Download size={14} /></button>
    </div>
    <div className="mock-row" style={{ borderBottom: `1px solid ${C.line}` }}>
      <span style={{ color: C.ink, fontSize: '0.9rem' }}>Service invoice</span>
      <span className="status-badge neutral">KES 84,000</span>
    </div>
    <div className="mock-row" style={{ borderBottom: 'none' }}>
      <span style={{ color: C.ink, fontSize: '0.9rem', fontWeight: 600 }}>Outstanding balance</span>
      <button className="pay-btn">Pay KES 12,500</button>
    </div>
  </div>
);

const MockDispatch = () => {
  const [distance, setDistance] = useState(38);
  const [rate, setRate] = useState(195);
  const cost = Math.round(distance * 0.12 * rate);

  return (
    <div className="mock-inner">
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="mono-label" style={{ color: C.brassLight }}>SMART DISPATCH</div>
        <div style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.bone, marginTop: '0.3rem' }}>Route Optimization</div>
      </div>

      {/* Visual Map Route */}
      <div className="map-visual">
        <div className="map-pin"><MapPin size={16} color={C.bone} /></div>
        <div className="map-line"></div>
        <div className="map-pin" style={{ background: C.accent }}><MapPin size={16} color={C.bone} /></div>
        <div className="map-truck"><Truck size={20} color={C.brass} /></div>
      </div>

      <div className="slider-group">
        <div className="slider-row">
          <span>Distance (km)</span>
          <span className="slider-value">{distance}</span>
        </div>
        <input type="range" min="2" max="120" value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="custom-range" />
      </div>

      <div className="slider-group">
        <div className="slider-row">
          <span>Fuel rate (KES/L)</span>
          <span className="slider-value">{rate}</span>
        </div>
        <input type="range" min="150" max="250" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="custom-range" />
      </div>

      <div className="dispatch-footer">
        <span>Auto-billed Trip Cost</span>
        <span className="cost-value">KES {cost.toLocaleString()}</span>
      </div>
    </div>
  );
};

const MockHearse = () => (
  <div className="mock-inner">
    <div style={{ marginBottom: '1.5rem' }}>
      <div className="mono-label" style={{ color: C.brassLight }}>FLEET STATUS</div>
      <div style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.bone, marginTop: '0.3rem' }}>Live Fleet Tracking</div>
    </div>

    <div className="fleet-card">
      <div className="fleet-info">
        <div className="fleet-icon"><Truck size={18} color={C.bone} /></div>
        <div>
          <div style={{ color: C.bone, fontSize: '0.9rem', fontWeight: 500 }}>Hearse 01 - Benz</div>
          <div style={{ color: C.grayLight, fontSize: '0.75rem' }}>KDA 123A</div>
        </div>
      </div>
      <span className="fleet-status available">Available</span>
    </div>

    <div className="fleet-card">
      <div className="fleet-info">
        <div className="fleet-icon" style={{ background: 'rgba(199,123,94,0.2)' }}><Truck size={18} color={C.accent} /></div>
        <div>
          <div style={{ color: C.bone, fontSize: '0.9rem', fontWeight: 500 }}>Hearse 02 - Toyota</div>
          <div style={{ color: C.grayLight, fontSize: '0.75rem' }}>KDB 456B</div>
        </div>
      </div>
      <span className="fleet-status dispatched">Dispatched</span>
    </div>

    <div className="fleet-card" style={{ borderBottom: 'none' }}>
      <div className="fleet-info">
        <div className="fleet-icon" style={{ background: 'rgba(139,115,85,0.2)' }}><Truck size={18} color={C.brass} /></div>
        <div>
          <div style={{ color: C.bone, fontSize: '0.9rem', fontWeight: 500 }}>Hearse 03 - Nissan</div>
          <div style={{ color: C.grayLight, fontSize: '0.75rem' }}>KDC 789C</div>
        </div>
      </div>
      <span className="fleet-status maintenance">Maintenance</span>
    </div>
  </div>
);

const MockInsurance = () => (
  <div className="mock-inner">
    <div style={{ marginBottom: '1.5rem' }}>
      <div className="mono-label" style={{ color: C.brassLight }}>WELFARE SCHEME</div>
      <div style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.bone, marginTop: '0.3rem' }}>Contributions & Payouts</div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
      <div className="stat-card">
        <Users size={16} color={C.brass} />
        <div className="stat-value">320</div>
        <div className="stat-label">Active Members</div>
      </div>
      <div className="stat-card">
        <TrendingUp size={16} color={C.brass} />
        <div className="stat-value">150K</div>
        <div className="stat-label">Total Coverage</div>
      </div>
    </div>

    <div className="chart-container">
      <div className="chart-bar" style={{ height: '40%' }}></div>
      <div className="chart-bar" style={{ height: '65%' }}></div>
      <div className="chart-bar" style={{ height: '50%' }}></div>
      <div className="chart-bar" style={{ height: '85%', background: C.brass }}></div>
      <div className="chart-bar" style={{ height: '70%' }}></div>
      <div className="chart-bar" style={{ height: '90%', background: C.brass }}></div>
    </div>

    <div className="progress-section">
      <div className="progress-header">
        <span>Monthly Claims Processed</span>
        <span>72%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill"></div>
      </div>
    </div>
  </div>
);

const Showcase = ({ no, title, desc, reverse, children }) => (
  <Reveal className="showcase-mobile" style={{
    display: 'grid',
    gridTemplateColumns: reverse ? '1fr 1.1fr' : '1.1fr 1fr',
    gap: '4rem',
    alignItems: 'center',
    marginBottom: '6rem',
  }}>
    <div className="showcase-text" style={{ order: reverse ? 2 : 1 }}>
      <div className="mono-label" style={{ color: C.verdigris, fontSize: '0.78rem', marginBottom: '1.2rem' }}>Module {no}</div>
      <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginBottom: '1.2rem', lineHeight: 1.25 }}>{title}</h2>
      <p style={{ fontSize: '1.05rem', maxWidth: '480px', color: C.gray, lineHeight: 1.8 }}>{desc}</p>
    </div>
    <div className="showcase-visual" style={{ order: reverse ? 1 : 2, display: 'flex', justifyContent: reverse ? 'flex-start' : 'flex-end' }}>
      {children}
    </div>
  </Reveal>
);

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [billing, setBilling] = useState('monthly');
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
      features: ['Up to 20 users', 'Unlimited cases & documents', 'Family portal', 'Analytics & reporting', 'Case management & billing', 'Standard support', 'Daily backups'],
    },
    {
      name: 'Multi-Tenant',
      monthly: '18,900',
      annual: '189,000',
      featured: true,
      features: ['Unlimited users', 'Unlimited cases & documents', 'All Single features +', 'Advanced analytics', 'Priority 24/7 support', 'Custom integrations', 'Hourly backups'],
    },
  ];

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 60); return () => clearTimeout(t); }, []);

  const infraFeatures = [
    { icon: ShieldCheck, title: 'Bank-grade Security', desc: 'Role-based access, audit logs, and end-to-end encryption ensure data remains protected and compliant.' },
    { icon: Server, title: 'Reliable Infrastructure', desc: '99.9% uptime guarantee with automated daily backups. Your data is always available when you need it.' },
    { icon: Zap, title: 'Seamless Integrations', desc: 'Connect with local payment gateways, accounting software, and communication tools effortlessly.' },
  ];

  return (
    <>
      <LandingPageSEO />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',sans-serif;color:${C.gray};background:${C.bone};-webkit-font-smoothing:antialiased}
        h1,h2,h3{font-family:'Fraunces',serif;font-weight:500;letter-spacing:-0.01em;color:${C.ink}}
        h1{font-size:clamp(2.8rem,6.5vw,4.6rem);line-height:1.05;margin-bottom:1.4rem}
        h2{font-size:clamp(1.9rem,4vw,2.5rem);line-height:1.2}
        p{line-height:1.7;font-size:1rem}
        a{color:inherit;text-decoration:none}
        
        .mono-label{font-family:'JetBrains Mono',monospace;font-size:0.7rem;letter-spacing:0.14em;text-transform:uppercase;color:${C.brass};font-weight:500}
        .label{font-family:'JetBrains Mono',monospace;font-size:0.74rem;letter-spacing:0.14em;text-transform:uppercase;color:${C.brass};font-weight:500}
        
        /* Buttons */
        .btn{display:inline-flex;align-items:center;gap:0.5rem;padding:0.95rem 1.9rem;font-size:0.9rem;font-weight:500;font-family:'Inter',sans-serif;border:1px solid transparent;border-radius:8px;cursor:pointer;transition:all 0.3s ease;white-space:nowrap;letter-spacing:0.01em}
        .btn-dark{background:${C.ink};color:${C.bone}}
        .btn-dark:hover{background:${C.verdigris};transform:translateY(-2px);box-shadow:0 10px 20px rgba(21,23,26,0.15)}
        .btn-line{background:transparent;color:${C.ink};border-color:${C.line}}
        .btn-line:hover{background:${C.ink};color:${C.bone};border-color:${C.ink}}
        .btn-brass{background:${C.brass};color:${C.bone};border:none}
        .btn-brass:hover{background:${C.brassLight};transform:translateY(-2px);box-shadow:0 10px 20px rgba(139,115,85,0.25)}
        
        .wrap{max-width:1180px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
        
        /* Navigation */
        nav{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(250,248,244,0.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid ${C.line};padding:1.2rem 0}
        .nav-wrap{display:flex;justify-content:space-between;align-items:center}
        .logo{display:flex;align-items:center;gap:0.7rem;font-family:'Fraunces',serif;font-size:1.3rem;font-weight:500;color:${C.ink};cursor:pointer}
        .nav-links{display:flex;gap:2.5rem;align-items:center}
        .nav-link{font-size:0.85rem;color:${C.gray};text-decoration:none;cursor:pointer;transition:color 0.2s;background:transparent;border:none;font-family:'Inter',sans-serif;padding:0.5rem 0}
        .nav-link:hover{color:${C.verdigris}}
        .nav-cta{display:flex;gap:0.75rem}
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
        .hero{padding-top:140px;padding-bottom:clamp(4rem,8vw,6rem);position:relative;overflow:hidden}
        .hero::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 20% 50%,rgba(61,79,71,0.06) 0%,transparent 50%),radial-gradient(circle at 80% 80%,rgba(139,115,85,0.05) 0%,transparent 50%);pointer-events:none}
        .hero-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:4rem;align-items:center;position:relative;z-index:1}
        .hero-desc{font-size:1.1rem;max-width:540px;margin-bottom:2rem;color:${C.gray};line-height:1.8}
        .hero-buttons{display:flex;gap:1rem;flex-wrap:wrap}
        
        /* App Window Mockups */
        .app-window{border-radius:12px;overflow:hidden;box-shadow:0 30px 60px -15px rgba(21,23,26,0.2);border:1px solid ${C.line};width:100%;transition:transform 0.4s cubic-bezier(0.16,1,0.3,1)}
        .app-window:hover{transform:translateY(-8px)}
        .window-header{display:flex;align-items:center;justify-content:space-between;padding:0.8rem 1.2rem;border-bottom:1px solid ${C.line};background:${C.bone2}}
        .window-dot{width:10px;height:10px;border-radius:50%;display:inline-block}
        .window-title{font-size:0.72rem;font-family:'JetBrains Mono',monospace;color:${C.gray};letter-spacing:0.05em}
        .window-body{padding:2rem;background:${C.bone}}
        .app-window.dark .window-header{border-bottom:1px solid ${C.lineDark};background:rgba(0,0,0,0.2)}
        .app-window.dark .window-body{background:${C.ink}}
        .app-window.dark .window-title{color:${C.grayLight}}
        
        .mock-inner{padding:0.5rem}
        
        /* Light Mock Elements */
        .mock-list-header{display:flex;justify-content:space-between;font-size:0.7rem;font-family:'JetBrains Mono',monospace;color:${C.gray};padding-bottom:0.5rem;border-bottom:1px solid ${C.line};margin-bottom:0.5rem}
        .mock-row{display:flex;justify-content:space-between;align-items:center;padding:1rem 0;border-bottom:1px solid ${C.line};font-size:0.9rem}
        .file-icon{width:32px;height:32px;background:${C.bone2};border-radius:6px;display:flex;align-items:center;justify-content:center}
        .status-badge{font-size:0.7rem;font-family:'JetBrains Mono',monospace;padding:0.3rem 0.6rem;border-radius:4px;font-weight:500}
        .status-badge.verified{color:${C.verdigris};background:${C.verdigrisTint}}
        .status-badge.pending{color:${C.brass};background:rgba(139,115,85,0.1)}
        .status-badge.missing{color:${C.accent};background:rgba(199,123,94,0.1)}
        .status-badge.neutral{color:${C.ink};background:${C.bone2}}
        .avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:${C.bone};font-family:'Fraunces',serif;font-weight:600;font-size:0.9rem}
        .action-btn{background:${C.bone2};border:1px solid ${C.line};border-radius:6px;padding:0.4rem;cursor:pointer;display:flex;align-items:center;justify-content:center;color:${C.ink};transition:all 0.2s}
        .action-btn:hover{background:${C.ink};color:${C.bone}}
        .pay-btn{background:${C.verdigris};color:${C.bone};border:none;padding:0.5rem 1rem;border-radius:6px;font-size:0.8rem;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif}
        
        /* Dark Mock Elements */
        .slider-group{margin-bottom:1.5rem}
        .slider-row{display:flex;justify-content:space-between;margin-bottom:0.6rem;font-size:0.8rem;color:${C.grayLight}}
        .slider-value{font-family:'JetBrains Mono',monospace;color:${C.bone};font-weight:500}
        .custom-range{width:100%;height:4px;-webkit-appearance:none;appearance:none;background:rgba(250,248,244,0.2);outline:none;cursor:pointer;border-radius:2px}
        .custom-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;background:${C.brass};border-radius:50%;cursor:pointer;border:3px solid ${C.ink}}
        .custom-range::-moz-range-thumb{width:16px;height:16px;background:${C.brass};border-radius:50%;cursor:pointer;border:3px solid ${C.ink}}
        .dispatch-footer{display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid ${C.lineDark};padding-top:1.2rem;margin-top:0.5rem}
        .cost-value{font-size:1.6rem;font-family:'Fraunces',serif;color:${C.bone};font-weight:600}
        
        .map-visual{position:relative;height:120px;background:rgba(250,248,244,0.04);border:1px solid ${C.lineDark};border-radius:8px;margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between;padding:0 2rem;overflow:hidden}
        .map-visual::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background-image:linear-gradient(rgba(250,248,244,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(250,248,244,0.03) 1px,transparent 1px);background-size:20px 20px}
        .map-pin{width:32px;height:32px;border-radius:50%;background:${C.verdigris};display:flex;align-items:center;justify-content:center;z-index:2;box-shadow:0 4px 10px rgba(0,0,0,0.3)}
        .map-line{position:absolute;left:32px;right:32px;height:2px;background:linear-gradient(90deg,${C.verdigris},${C.accent});z-index:1}
        .map-truck{position:absolute;left:40%;background:${C.ink};padding:0.5rem;border-radius:6px;border:1px solid ${C.lineDark};z-index:3;animation:truckMove 3s infinite alternate ease-in-out}
        @keyframes truckMove{from{left:30%}to{left:60%}}
        
        .fleet-card{display:flex;justify-content:space-between;align-items:center;padding:1rem 0;border-bottom:1px solid ${C.lineDark}}
        .fleet-info{display:flex;align-items:center;gap:0.8rem}
        .fleet-icon{width:36px;height:36px;background:rgba(61,79,71,0.3);border-radius:8px;display:flex;align-items:center;justify-content:center}
        .fleet-status{font-size:0.72rem;font-family:'JetBrains Mono',monospace;padding:0.3rem 0.6rem;border-radius:4px;font-weight:500}
        .fleet-status.available{color:${C.bone};background:rgba(40,200,64,0.15);border:1px solid rgba(40,200,64,0.3)}
        .fleet-status.dispatched{color:${C.bone};background:rgba(199,123,94,0.15);border:1px solid rgba(199,123,94,0.3)}
        .fleet-status.maintenance{color:${C.bone};background:rgba(139,115,85,0.15);border:1px solid rgba(139,115,85,0.3)}
        
        .stat-card{background:rgba(250,248,244,0.04);border:1px solid ${C.lineDark};border-radius:8px;padding:1rem}
        .stat-value{font-size:1.4rem;font-family:'Fraunces',serif;color:${C.bone};margin-top:0.5rem}
        .stat-label{font-size:0.7rem;color:${C.grayLight};font-family:'JetBrains Mono',monospace;margin-top:0.2rem;letter-spacing:0.1em}
        .chart-container{display:flex;align-items:flex-end;justify-content:space-between;height:80px;gap:0.5rem;margin-bottom:1.5rem;padding:0 0.5rem}
        .chart-bar{width:100%;background:rgba(250,248,244,0.1);border-radius:4px 4px 0 0;transition:height 0.5s ease}
        .progress-section{margin-top:1rem}
        .progress-header{display:flex;justify-content:space-between;font-size:0.8rem;color:${C.grayLight};margin-bottom:0.5rem}
        .progress-track{width:100%;height:6px;background:rgba(250,248,244,0.1);border-radius:3px;overflow:hidden}
        .progress-fill{width:72%;height:100%;background:${C.brass};border-radius:3px}

        /* Sections */
        .section{padding:clamp(4rem,8vw,6rem)0}
        .showcase-mobile{display:grid;grid-template-columns:1.1fr 1fr;gap:4rem;align-items:center;margin-bottom:6rem}
        
        /* Proof Stats */
        .proof{border-top:1px solid ${C.line};border-bottom:1px solid ${C.line};background:${C.bone2};padding:clamp(2.5rem,5vw,3.5rem)0}
        .proof-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem}
        .proof-item{text-align:center;padding:0 1rem;border-left:1px solid ${C.line}}
        .proof-item:first-child{border-left:none}
        .proof-num{font-family:'JetBrains Mono',monospace;font-size:clamp(1.8rem,4vw,2.4rem);color:${C.verdigris};font-weight:600;margin-bottom:0.4rem}
        .proof-cap{font-size:0.85rem;color:${C.ink};font-weight:500}
        
        /* Insurance Section */
        .insurance-section{background:linear-gradient(135deg,${C.verdigrisDark} 0%,${C.ink} 100%);padding:clamp(5rem,10vw,7rem)0;position:relative;overflow:hidden}
        .insurance-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:4rem;align-items:center}
        
        /* Infra Section */
        .infra-section{background:${C.bone2};padding:clamp(3rem,6vw,5rem)0}
        .infra-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem;margin-top:3rem}
        .infra-card{background:${C.bone};border:1px solid ${C.line};padding:2rem;border-radius:8px;transition:all 0.3s ease}
        .infra-card:hover{transform:translateY(-5px);box-shadow:0 15px 30px rgba(21,23,26,0.06);border-color:${C.verdigrisLight}}
        
        /* About Section */
        .about-section{background:${C.bone};padding:clamp(3rem,6vw,4rem)0;border-top:1px solid ${C.line}}
        .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
        
        /* Pricing */
        .pricing-section{padding:clamp(4rem,8vw,6rem)0;background:${C.bone};border-top:1px solid ${C.line}}
        .pricing-header{text-align:center;margin-bottom:2.5rem;padding:0 1rem}
        .billing-toggle{display:inline-flex;align-items:center;background:${C.bone2};border-radius:50px;padding:4px;margin:2rem 0;border:1px solid ${C.line}}
        .billing-btn{padding:0.6rem 1.5rem;border:none;background:transparent;cursor:pointer;font-size:0.85rem;color:${C.gray};border-radius:50px;transition:all 0.3s ease;font-family:'Inter',sans-serif;font-weight:500}
        .billing-btn.active{background:${C.ink};color:${C.bone};box-shadow:0 4px 10px rgba(21,23,26,0.1)}
        .pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1.5rem;max-width:800px;margin:0 auto}
        .pricing-card{border:1px solid ${C.line};padding:2rem;position:relative;border-radius:8px;transition:all 0.3s ease;background:${C.bone}}
        .pricing-card:hover{transform:translateY(-5px);box-shadow:0 20px 40px rgba(21,23,26,0.08)}
        .pricing-card.featured{background:${C.verdigrisDark};border-color:${C.brass};box-shadow:0 20px 40px rgba(46,63,55,0.2)}
        .pricing-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${C.brass};color:${C.bone};padding:0.3rem 1rem;font-size:0.65rem;font-family:'JetBrains Mono',monospace;letter-spacing:0.08em;border-radius:20px;font-weight:500}
        .pricing-name{font-size:1.2rem;font-family:'Fraunces',serif;margin-bottom:0.4rem}
        .pricing-amount{font-size:clamp(2rem,5vw,2.6rem);font-family:'Fraunces',serif;font-weight:600;margin-bottom:0.25rem;letter-spacing:-0.02em}
        .pricing-period{font-size:0.85rem;color:${C.gray};font-family:'Inter',sans-serif;font-weight:400;margin-left:0.2rem}
        .pricing-card.featured .pricing-period{color:rgba(250,248,244,0.6)}
        .pricing-btn{width:100%;padding:0.9rem;margin-bottom:1.5rem;font-size:0.85rem;font-weight:600;cursor:pointer;border-radius:6px;transition:all 0.2s;border:1px solid transparent;font-family:'Inter',sans-serif}
        .pricing-features{list-style:none;padding:0;margin:0}
        .pricing-feature{display:flex;gap:0.7rem;margin-bottom:0.8rem;font-size:0.88rem;align-items:flex-start}
        .pricing-feature svg{flex-shrink:0;margin-top:2px}
        
        /* CTA Section */
        .cta-wrapper { background: ${C.bone}; padding: clamp(4rem, 8vw, 7rem) 0; }
        .cta-card { 
          position: relative; 
          background: linear-gradient(135deg, ${C.ink} 0%, ${C.verdigrisDark} 100%); 
          border-radius: 24px; 
          padding: clamp(3rem, 6vw, 5rem) 2rem; 
          text-align: center; 
          overflow: hidden; 
          border: 1px solid ${C.lineDark}; 
          box-shadow: 0 40px 80px -20px rgba(21,23,26,0.3);
        }
        .cta-card::before { 
          content: ''; 
          position: absolute; 
          top: 0; left: 0; right: 0; bottom: 0; 
          background-image: radial-gradient(circle at 50% 0%, rgba(139,115,85,0.15) 0%, transparent 50%), linear-gradient(rgba(250,248,244,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(250,248,244,0.03) 1px, transparent 1px); 
          background-size: 100% 100%, 40px 40px, 40px 40px; 
          pointer-events: none; 
        }
        .cta-content { position: relative; z-index: 2; max-width: 700px; margin: 0 auto; }
        .cta-content h2 { color: ${C.bone}; margin-bottom: 1.5rem; font-size: clamp(2rem, 4.5vw, 3rem); line-height: 1.2; }
        .cta-content p { color: rgba(250,248,244,0.8); font-size: 1.1rem; line-height: 1.8; margin-bottom: 2.5rem; }
        .cta-avatars { display: flex; justify-content: center; margin-bottom: 2.5rem; }
        .avatar-circle { 
          width: 48px; 
          height: 48px; 
          border-radius: 50%; 
          border: 2px solid ${C.ink}; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: ${C.bone}; 
          font-family: 'Fraunces', serif; 
          font-weight: 600; 
          margin-left: -15px; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        .avatar-circle:first-child { margin-left: 0; }
        .cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .btn-ghost { background: transparent; color: ${C.bone}; border: 1px solid rgba(250,248,244,0.3); }
        .btn-ghost:hover { background: rgba(250,248,244,0.1); border-color: ${C.bone}; }
        .cta-microcopy { margin-top: 1.5rem; font-size: 0.8rem; color: rgba(250,248,244,0.5); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; }

        /* Responsive */
        @media(max-width:800px){.nav-links{display:none}.nav-cta{display:none}.mobile-nav{display:flex;gap:0.5rem;align-items:center}}
        @media(max-width:768px){
          .hero-grid{grid-template-columns:1fr;gap:3rem}
          .showcase-mobile{grid-template-columns:1fr!important;gap:2rem!important;margin-bottom:4rem!important}
          .showcase-mobile .showcase-text{order:2!important}
          .showcase-mobile .showcase-visual{order:1!important;justify-content:center!important}
          .proof-grid{grid-template-columns:1fr;gap:1.5rem}
          .proof-item{border-left:none;padding:0}
          .insurance-grid{grid-template-columns:1fr;gap:2rem}
          .about-grid{grid-template-columns:1fr;gap:2rem}
          .hero-buttons{flex-direction:column;width:100%}
          .hero-buttons .btn{width:100%;justify-content:center}
          .cta-buttons{flex-direction:column;width:100%}
          .cta-buttons .btn{width:100%;justify-content:center}
          .window-body{padding:1.5rem}
        }
        @media(max-width:480px){
          .hero{padding-top:100px}
          .btn{padding:0.8rem 1.2rem!important;font-size:0.8rem!important}
        }
      `}</style>

      <main>
        {/* Navigation */}
        <nav>
          <div className="wrap nav-wrap">
            <div className="logo" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); }}>
              <Mark size={24} />
              Rest Point
            </div>
            <div className="nav-links">
              <a href="#features" className="nav-link">Features</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <button onClick={goAbout} className="nav-link">About</button>
              <PolicyDropdown navigate={navigate} goTerms={goTerms} />
            </div>
            <div className="nav-cta">
              <button className="btn btn-line" onClick={goLogin} style={{ padding: '0.7rem 1.2rem' }}>Log in</button>
              <button className="btn btn-dark" onClick={goStart} style={{ padding: '0.7rem 1.2rem' }}>Request access</button>
            </div>
            <MobileMenu navigate={navigate} goTerms={goTerms} goLogin={goLogin} goStart={goStart} />
          </div>
        </nav>

        {/* Hero Section */}
        <section className="hero">
          <div className="wrap">
            <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
              <div style={{ display: 'inline-block', marginBottom: '2rem', padding: '0.7rem 1.2rem', background: 'rgba(61,79,71,0.08)', borderRadius: '4px', border: `1px solid ${C.line}` }}>
                <span className="label" style={{ color: C.verdigris }}>Funeral Home OS & Welfare Platform</span>
              </div>
              <h1 style={{ fontSize: 'clamp(2.5rem,7vw,5rem)', lineHeight: 1.08, maxWidth: '900px' }}>A record worthy of the families you serve.</h1>
            </div>
            <div className="hero-grid">
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 100ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 100ms' }}>
                <p className="hero-desc">Rest Point is the complete platform for funeral homes and welfare organizations. Manage cases, coordinate funeral insurance claims, track member contributions, and serve families with the same care you bring to every service.</p>
                <div className="hero-buttons">
                  <button className="btn btn-dark" onClick={goStart}>Request access <ArrowRight size={16} /></button>
                  <button className="btn btn-line" onClick={goLogin}>See how it works</button>
                </div>
              </div>
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 200ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 200ms', width: '100%' }}>
                <AppWindow title="restpoint.app/dashboard" dark>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div className="mono-label" style={{ color: C.brass, marginBottom: '1rem' }}>DASHBOARD PREVIEW</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
                      <div><div style={{ fontSize: '1.8rem', fontFamily: "'Fraunces', serif", color: C.bone, fontWeight: 600 }}>24</div><div className="mono-label" style={{ color: C.grayLight, fontSize: '0.68rem' }}>ACTIVE CASES</div></div>
                      <div><div style={{ fontSize: '1.8rem', fontFamily: "'Fraunces', serif", color: C.bone, fontWeight: 600 }}>84K</div><div className="mono-label" style={{ color: C.grayLight, fontSize: '0.68rem' }}>PENDING BILL</div></div>
                      <div><div style={{ fontSize: '1.8rem', fontFamily: "'Fraunces', serif", color: C.bone, fontWeight: 600 }}>7</div><div className="mono-label" style={{ color: C.grayLight, fontSize: '0.68rem' }}>NEW TODAY</div></div>
                    </div>
                  </div>
                  <div style={{ borderTop: `1px solid ${C.lineDark}`, paddingTop: '1.5rem' }}>
                    {[{ name: 'Otieno Family', status: 'In Progress', dot: C.verdigrisLight }, { name: 'Mwangi Family', status: 'Documents Pending', dot: C.brass }, { name: 'Kamau Family', status: 'KES 120,000', dot: C.accent }].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: i < 2 ? `1px solid ${C.lineDark}` : 'none', fontSize: '0.85rem', color: C.grayLight }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.dot, display: 'inline-block' }} />
                          {item.name}
                        </span>
                        <span style={{ color: C.brass }}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </AppWindow>
              </div>
            </div>
          </div>
        </section>

        {/* Stats / Proof */}
        <section className="proof">
          <div className="wrap proof-grid">
            {[
              { num: '500+', cap: 'Organizations onboarded' },
              { num: '12K+', cap: 'Cases managed monthly' },
              { num: '99.9%', cap: 'Platform uptime' }
            ].map((p, i) => (
              <div key={i} className="proof-item">
                <div className="proof-num">{p.num}</div>
                <div className="proof-cap">{p.cap}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="section">
          <div className="wrap">
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <div className="label" style={{ marginBottom: '1rem' }}>Features</div>
                <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '1rem' }}>Everything you need to operate with dignity</h2>
                <p style={{ maxWidth: '600px', margin: '0 auto', color: C.gray }}>From case management to funeral insurance integration, Rest Point provides the tools funeral homes and welfare organizations need to serve families efficiently.</p>
              </div>
            </Reveal>

            <Showcase no="01" title="Case management that respects your workflow" desc="Track every detail from first call to final settlement. Rest Point keeps case files organized, documents verified, and families informed." reverse={false}>
              <AppWindow title="restpoint.app/cases"><MockDocuments /></AppWindow>
            </Showcase>

            <Showcase no="02" title="Family portal & online memorials" desc="Give families secure access to arrangements, documents, and billing. Light a candle, leave a condolence, and stay connected." reverse={true}>
              <AppWindow title="restpoint.app/portal"><MockPortal /></AppWindow>
            </Showcase>

            <Showcase no="03" title="Smart dispatch & billing" desc="Optimize hearse routes, calculate costs automatically, and bill with precision. Rest Point turns logistics into a competitive advantage." reverse={false}>
              <AppWindow title="restpoint.app/dispatch" dark><MockDispatch /></AppWindow>
            </Showcase>

            <Showcase no="04" title="Hearse management module" desc="Effective hearse management helps a funeral home provide reliable, professional, and respectful transportation services. Assign hearses to funerals efficiently. Avoid scheduling conflicts." reverse={true}>
              <AppWindow title="restpoint.app/fleet" dark><MockHearse /></AppWindow>
            </Showcase>
          </div>
        </section>

        {/* Insurance Section */}
        <section className="insurance-section">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 30% 50%, rgba(139,115,85,0.15) 0%, transparent 60%)', pointerEvents: 'none' }}></div>
          <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
            <div className="insurance-grid">
              <Reveal>
                <div className="label" style={{ color: C.brass, marginBottom: '1.2rem' }}>Funeral Insurance & Welfare Management</div>
                <h2 style={{ color: C.bone, marginBottom: '1.8rem', fontSize: 'clamp(2rem, 4.5vw, 2.8rem)', lineHeight: 1.25 }}>We understand the pain and financial burden families face</h2>
                <p style={{ color: 'rgba(250,248,244,0.8)', lineHeight: 1.9, marginBottom: '1.8rem', fontSize: '1.05rem' }}>
                  Families go through immense pain when they lose a loved one, only to be burdened with huge hospital bills and funeral expenses. We break down these barriers by bringing comprehensive funeral insurance solutions directly to your funeral home, chama, SACCO, or church.
                </p>
                <p style={{ color: 'rgba(250,248,244,0.8)', lineHeight: 1.9, marginBottom: '2.5rem', fontSize: '1.05rem' }}>
                  Rest Point now includes comprehensive funeral insurance management and welfare scheme administration tools. Perfect for churches, SACCOs, chamas, companies, and NGOs.
                </p>
                <button className="btn btn-brass" onClick={() => window.location.href = '/insurance'} style={{ fontSize: '0.9rem', padding: '1rem 2rem' }}>
                  Learn about funeral insurance <ArrowRight size={16} />
                </button>
              </Reveal>
              <Reveal delay={150}>
                <AppWindow title="restpoint.app/insurance" dark><MockInsurance /></AppWindow>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Infrastructure Section */}
        <section className="infra-section">
          <div className="wrap">
            <Reveal style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <div className="label" style={{ marginBottom: '1rem' }}>Enterprise-Grade Infrastructure</div>
              <h2>Built for scale, secured by design</h2>
              <p style={{ color: C.gray, marginTop: '1rem' }}>Rest Point is built on modern infrastructure to ensure your data is safe, accessible, and scalable as your organization grows.</p>
            </Reveal>
            <div className="infra-grid">
              {infraFeatures.map((feat, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="infra-card">
                    <div style={{ width: '48px', height: '48px', background: C.verdigrisTint, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem' }}>
                      <feat.icon size={24} color={C.verdigris} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.6rem', fontFamily: "'Inter', sans-serif", fontWeight: 600, color: C.ink }}>{feat.title}</h3>
                    <p style={{ fontSize: '0.92rem', color: C.gray, lineHeight: 1.7 }}>{feat.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="about-section">
          <div className="wrap about-grid">
            <Reveal>
              <div className="label" style={{ marginBottom: '1rem' }}>Our Mission</div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '1.5rem' }}>Rest Point was created to bring peace to families during their darkest moments.</h2>
              <p style={{ color: C.gray, marginBottom: '1.5rem', lineHeight: 1.8 }}>We recognized a gap in how funeral homes and welfare groups manage operations. The paperwork, the miscommunication, the delayed claims—it all adds unnecessary stress to grieving families.</p>
              <p style={{ color: C.gray, marginBottom: '2rem', lineHeight: 1.8 }}>Our platform streamlines the entire process so you can focus on what truly matters: providing compassionate care and supporting families with dignity and respect.</p>
              <button className="btn btn-line" onClick={goAbout}>Learn more about us</button>
            </Reveal>
            <Reveal delay={100} style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: C.bone2, padding: '2.5rem', borderRadius: '12px', border: `1px solid ${C.line}`, maxWidth: '420px', width: '100%', boxShadow: '0 15px 30px rgba(21,23,26,0.05)' }}>
                <div style={{ fontSize: '3rem', fontFamily: "'Fraunces', serif", color: C.verdigris, lineHeight: 1, marginBottom: '1rem' }}>"</div>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: '1.2rem', color: C.ink, lineHeight: 1.6, marginBottom: '2rem' }}>Rest Point has revolutionized how we handle cases and insurance claims. We now serve families faster and with more transparency.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: `1px solid ${C.line}`, paddingTop: '1.5rem' }}>
                  <div style={{ width: '48px', height: '48px', background: C.verdigris, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.bone, fontFamily: "'Fraunces', serif", fontSize: '1.2rem', fontWeight: 600 }}>W</div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: C.ink }}>Wanjiru K.</div>
                    <div style={{ fontSize: '0.85rem', color: C.gray }}>Director, Peacedale Funeral Home</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="pricing-section">
          <div className="wrap">
            <div className="pricing-header">
              <div className="label" style={{ marginBottom: '1rem' }}>Pricing</div>
              <h2>Simple, transparent pricing</h2>
              <p style={{ color: C.gray, maxWidth: '500px', margin: '1rem auto 0' }}>Choose the plan that fits your organization. All plans include core features with no hidden fees.</p>

              <div className="billing-toggle">
                <button className={`billing-btn ${billing === 'monthly' ? 'active' : ''}`} onClick={() => setBilling('monthly')}>Monthly</button>
                <button className={`billing-btn ${billing === 'annual' ? 'active' : ''}`} onClick={() => setBilling('annual')}>Annual (Save 2 months)</button>
              </div>
            </div>

            <div className="pricing-grid">
              {plans.map((plan, i) => (
                <div key={i} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
                  {plan.featured && <div className="pricing-badge">MOST POPULAR</div>}
                  <div className="pricing-name" style={{ color: plan.featured ? C.bone : C.ink }}>{plan.name}</div>
                  <div className="pricing-amount" style={{ color: plan.featured ? C.bone : C.ink }}>
                    KES {billing === 'monthly' ? plan.monthly : plan.annual}
                    <span className="pricing-period">/{billing === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                  <button
                    className="pricing-btn"
                    style={{
                      background: plan.featured ? C.brass : C.ink,
                      color: C.bone,
                      border: plan.featured ? 'none' : `1px solid ${C.ink}`
                    }}
                    onClick={goStart}
                  >Get started</button>
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

        {/* CTA Section */}
        <section className="cta-wrapper">
          <div className="wrap">
            <Reveal>
              <div className="cta-card">
                <div className="cta-content">
                  <div className="mono-label" style={{ color: C.brass, marginBottom: '1.5rem' }}>Get Started Today</div>
                  <h2>Ready to transform your funeral home or welfare organization?</h2>
                  <p>Join 500+ organizations across Kenya using Rest Point to manage cases, process insurance claims, and administer welfare schemes with confidence.</p>

                  <div className="cta-avatars">
                    <span className="avatar-circle" style={{ background: C.verdigris }}>W</span>
                    <span className="avatar-circle" style={{ background: C.brass }}>O</span>
                    <span className="avatar-circle" style={{ background: C.accent }}>M</span>
                    <span className="avatar-circle" style={{ background: C.verdigrisLight }}>K</span>
                    <span className="avatar-circle" style={{ background: C.brassLight }}>+</span>
                  </div>

                  <div className="cta-buttons">
                    <button className="btn btn-brass" onClick={goStart} style={{ padding: '1.1rem 2.5rem', fontSize: '1rem' }}>
                      Start free trial <ArrowRight size={18} />
                    </button>
                    <button className="btn btn-ghost" onClick={goAbout} style={{ padding: '1.1rem 2.5rem', fontSize: '1rem' }}>
                      Contact sales
                    </button>
                  </div>

                  <div className="cta-microcopy">14-day free trial · No credit card required · Cancel anytime</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}