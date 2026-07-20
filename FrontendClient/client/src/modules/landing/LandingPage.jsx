import { useState, useEffect, useRef, Children } from 'react';
import { useNavigate } from 'react-router-dom';

import { ChevronDown, Menu, Check, ShieldCheck, Server, Zap, ArrowRight, X, FileText, Download, MapPin, Truck, Activity, Users, TrendingUp, Search, Newspaper, ExternalLink, LayoutDashboard, Lock, Globe, Layers } from '../../utils/icons/icons';

import Footer from '../../components/layout/Footer';
import LandingPageSEO from '../seo/LandingPageSEO';

import   C    from  '../../utils/colors/index'


/* ═══════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════ */
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

// FIXED: Stable callback ref prevents dropdown from breaking
const useOutsideClick = (ref, callback) => {
  const cbRef = useRef(callback);
  cbRef.current = callback;
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) cbRef.current();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref]);
};

/* ═══════════════════════════════════════
   ANIMATION COMPONENTS
   ═══════════════════════════════════════ */
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
  const tf = { up: 'translateY(40px)', down: 'translateY(-40px)', left: 'translateX(50px)', right: 'translateX(-50px)', scale: 'scale(0.92)' };
  return (
    <div ref={ref} className={className} style={{
      opacity: shown ? 1 : 0,
      transform: shown ? 'none' : tf[from] || tf.up,
      transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      ...style,
    }}>{children}</div>
  );
};

const StaggerReveal = ({ children, stagger = 80, className = '', style = {} }) => {
  const [ref, shown] = useReveal();
  return (
    <div ref={ref} className={className} style={style}>
      {Children.map(children, (child, i) => (
        <div key={i} style={{
          opacity: shown ? 1 : 0,
          transform: shown ? 'translateY(0)' : 'translateY(25px)',
          transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${i * stagger}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * stagger}ms`,
        }}>{child}</div>
      ))}
    </div>
  );
};

const AnimatedNumber = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [ref, shown] = useReveal();
  useEffect(() => {
    if (!shown) return;
    let v = 0;
    const step = end / (duration / 16);
    const t = setInterval(() => {
      v += step;
      if (v >= end) { setCount(end); clearInterval(t); }
      else setCount(Math.floor(v));
    }, 16);
    return () => clearInterval(t);
  }, [shown, end, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ═══════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════ */
const Mark = ({ size = 28, color = C.verdigris }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="1.5" />
    <path d="M16 8V24M8 16H24" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="16" r="3.5" fill={color} />
  </svg>
);

const AppWindow = ({ title, children, dark = false }) => (
  <div className={`app-window ${dark ? 'dark' : 'light'}`}>
    <div className="window-header">
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <span className="window-dot" style={{ background: '#FF5F57' }} />
        <span className="window-dot" style={{ background: '#FEBC2E' }} />
        <span className="window-dot" style={{ background: '#28C840' }} />
      </div>
      <span className="window-title">{title}</span>
      <div style={{ width: '40px' }} />
    </div>
    <div className="window-body">{children}</div>
  </div>
);

const Marquee = ({ items, speed = 35 }) => (
  <div className="marquee-strip">
    <div className="marquee-track" style={{ animationDuration: `${speed}s` }}>
      {[...items, ...items, ...items, ...items].map((item, i) => (
        <span key={i} className="marquee-item">
          <span className="marquee-dot" />{item}
        </span>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════
   NAVIGATION (FIXED DROPDOWN)
   ═══════════════════════════════════════ */
const PolicyDropdown = ({ navigate, goTerms }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const policies = [
    { label: 'Terms of Service', onClick: goTerms, icon: FileText },
    { label: 'Privacy Policy', onClick: () => navigate('/privacy'), icon: Lock },
    { label: 'Security Policy', onClick: () => navigate('/security'), icon: ShieldCheck },
    { label: 'Data Migration Policy', onClick: () => navigate('/data-migration'), icon: Server },
    { label: 'SLA Policy', onClick: () => navigate('/sla'), icon: Zap },
    { label: 'Release Notes', onClick: () => navigate('/releases'), icon: Newspaper },
    { label: 'Account Deletion', onClick: () => navigate('/account-deletion'), icon: X },
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
              <p.icon size={15} className="policy-item-icon" />
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

/* ═══════════════════════════════════════
   MOCK COMPONENTS
   ═══════════════════════════════════════ */
const MockDocuments = () => (
  <div className="mock-inner">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <div><div className="mono-label" style={{ color: C.verdigris }}>CASE FILE</div><div style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.ink, marginTop: '0.3rem' }}>Otieno, J.</div></div>
      <div className="avatar" style={{ background: C.verdigris }}>JO</div>
    </div>
    <div className="mock-list-header"><span>Document Name</span><span>Status</span></div>
    {[{ n: 'Death certificate.pdf', c: C.verdigris, s: 'verified' }, { n: 'Burial permit.pdf', c: C.brass, s: 'pending' }, { n: 'Police abstract.pdf', c: C.accent, s: 'missing' }].map((d, i) => (
      <div key={i} className="mock-row" style={{ borderBottom: i < 2 ? `1px solid ${C.line}` : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><div className="file-icon"><FileText size={16} color={d.c} /></div><span style={{ color: C.ink }}>{d.n}</span></div>
        <span className={`status-badge ${d.s}`}>{d.s.charAt(0).toUpperCase() + d.s.slice(1)}</span>
      </div>
    ))}
  </div>
);

const MockPortal = () => (
  <div className="mock-inner">
    <div style={{ marginBottom: '1.5rem' }}><div className="mono-label" style={{ color: C.verdigris }}>MWANGI FAMILY</div><div style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.ink, marginTop: '0.3rem' }}>Arrangements confirmed</div></div>
    <div className="mock-row"><div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><div className="file-icon"><FileText size={16} color={C.brass} /></div><span style={{ color: C.ink }}>Burial permit.pdf</span></div><button className="action-btn"><Download size={14} /></button></div>
    <div className="mock-row"><span style={{ color: C.ink, fontSize: '0.9rem' }}>Service invoice</span><span className="status-badge neutral">KES 84,000</span></div>
    <div className="mock-row" style={{ borderBottom: 'none' }}><span style={{ color: C.ink, fontSize: '0.9rem', fontWeight: 600 }}>Outstanding balance</span><button className="pay-btn">Pay KES 12,500</button></div>
  </div>
);

const MockDispatch = () => {
  const [distance, setDistance] = useState(38);
  const [rate, setRate] = useState(195);
  return (
    <div className="mock-inner">
      <div style={{ marginBottom: '1.5rem' }}><div className="mono-label" style={{ color: C.brassLight }}>SMART DISPATCH</div><div style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.bone, marginTop: '0.3rem' }}>Route Optimization</div></div>
      <div className="map-visual"><div className="map-pin"><MapPin size={16} color={C.bone} /></div><div className="map-line" /><div className="map-pin" style={{ background: C.accent }}><MapPin size={16} color={C.bone} /></div><div className="map-truck"><Truck size={20} color={C.brass} /></div></div>
      <div className="slider-group"><div className="slider-row"><span>Distance (km)</span><span className="slider-value">{distance}</span></div><input type="range" min="2" max="120" value={distance} onChange={(e) => setDistance(+e.target.value)} className="custom-range" /></div>
      <div className="slider-group"><div className="slider-row"><span>Fuel rate (KES/L)</span><span className="slider-value">{rate}</span></div><input type="range" min="150" max="250" value={rate} onChange={(e) => setRate(+e.target.value)} className="custom-range" /></div>
      <div className="dispatch-footer"><span>Auto-billed Trip Cost</span><span className="cost-value">KES {Math.round(distance * 0.12 * rate).toLocaleString()}</span></div>
    </div>
  );
};

const MockHearse = () => (
  <div className="mock-inner">
    <div style={{ marginBottom: '1.5rem' }}><div className="mono-label" style={{ color: C.brassLight }}>FLEET STATUS</div><div style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.bone, marginTop: '0.3rem' }}>Live Fleet Tracking</div></div>
    {[{ n: 'Hearse 01 - Benz', p: 'KDA 123A', bg: 'rgba(61,79,71,0.3)', ic: C.bone, s: 'available' }, { n: 'Hearse 02 - Toyota', p: 'KDB 456B', bg: 'rgba(199,123,94,0.2)', ic: C.accent, s: 'dispatched' }, { n: 'Hearse 03 - Nissan', p: 'KDC 789C', bg: 'rgba(139,115,85,0.2)', ic: C.brass, s: 'maintenance' }].map((h, i) => (
      <div key={i} className="fleet-card" style={{ borderBottom: i < 2 ? `1px solid ${C.lineDark}` : 'none' }}>
        <div className="fleet-info"><div className="fleet-icon" style={{ background: h.bg }}><Truck size={18} color={h.ic} /></div><div><div style={{ color: C.bone, fontSize: '0.9rem', fontWeight: 500 }}>{h.n}</div><div style={{ color: C.grayLight, fontSize: '0.75rem' }}>{h.p}</div></div></div>
        <span className={`fleet-status ${h.s}`}>{h.s.charAt(0).toUpperCase() + h.s.slice(1)}</span>
      </div>
    ))}
  </div>
);

const MockInsurance = () => (
  <div className="mock-inner">
    <div style={{ marginBottom: '1.5rem' }}><div className="mono-label" style={{ color: C.brassLight }}>WELFARE SCHEME</div><div style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.bone, marginTop: '0.3rem' }}>Contributions & Payouts</div></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
      <div className="stat-card"><Users size={16} color={C.brass} /><div className="stat-value">320</div><div className="stat-label">Active Members</div></div>
      <div className="stat-card"><TrendingUp size={16} color={C.brass} /><div className="stat-value">150K</div><div className="stat-label">Total Coverage</div></div>
    </div>
    <div className="chart-container">{[40, 65, 50, 85, 70, 90].map((h, i) => <div key={i} className="chart-bar" style={{ height: `${h}%`, background: (i === 3 || i === 5) ? C.brass : undefined }} />)}</div>
    <div className="progress-section"><div className="progress-header"><span>Monthly Claims Processed</span><span>72%</span></div><div className="progress-track"><div className="progress-fill" /></div></div>
  </div>
);

const MockDocumentAutomation = () => {
  const [selectedDoc, setSelectedDoc] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const docs = [
    { name: 'Release Form', version: 'v3.2', color: C.verdigris },
    { name: 'Receipts', version: 'v2.1', color: C.brass },
  ];

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 1800);
  };

  return (
    <div className="mock-inner">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <div>
          <div className="mono-label" style={{ color: C.verdigris }}>DOCUMENT ENGINE</div>
          <div style={{ fontSize: '1.3rem', fontFamily: "'Fraunces', serif", color: C.bone, marginTop: '0.3rem' }}>Auto-Generate</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.3rem', fontFamily: "'Fraunces', serif", color: C.bone, fontWeight: 600 }}>1,247</div>
          <div style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: C.grayLight }}>docs this month</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.2rem' }}>
        {docs.map((d, i) => (
          <button key={i} onClick={() => { setSelectedDoc(i); setGenerated(false); }}
            className={`doc-template-btn ${selectedDoc === i ? 'active' : ''}`}
            style={{ '--tpl-color': d.color }}>
            <FileText size={14} />
            <span>{d.name}</span>
          </button>
        ))}
      </div>

      <div className="doc-preview" style={{ marginBottom: '1.2rem' }}>
        {generating ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.8rem 1rem', gap: '0.8rem' }}>
            <div className="doc-gen-spinner" />
            <span style={{ fontSize: '0.78rem', fontFamily: "'JetBrains Mono', monospace", color: C.grayLight }}>Generating...</span>
          </div>
        ) : generated ? (
          <>
            <div style={{ borderBottom: `1px solid ${C.lineDark}`, paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: C.bone }}>{docs[selectedDoc].name}</div>
              <div style={{ fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace", color: C.grayLight, marginTop: '0.2rem' }}>Template {docs[selectedDoc].version} · Auto-filled from case data</div>
            </div>
            <div style={{ fontSize: '0.82rem', color: C.grayLight, lineHeight: 1.8 }}>
              <div className="doc-field"><span>Deceased:</span> <strong style={{ color: C.bone }}>Otieno, James M.</strong></div>
              <div className="doc-field"><span>Date:</span> <strong style={{ color: C.bone }}>15 Jun 2025</strong></div>
              <div className="doc-field"><span>Ref:</span> <strong style={{ color: C.bone }}>RP-2025-0847</strong></div>
            </div>
            <div className="doc-signature-area">
              <div className="doc-sig-line" />
              <svg width="110" height="32" viewBox="0 0 110 32" fill="none" style={{ position: 'absolute', bottom: '8px', right: '14px' }}>
                <path d="M6 24 C10 10, 18 6, 26 18 S36 24, 44 14 S54 4, 64 16 S74 28, 84 12 S94 6, 104 20" stroke={C.verdigris} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.75" />
                <path d="M104 20 L107 16.5 M104 20 L101 16.5" stroke={C.verdigris} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                <span className="doc-sig-verified"><Check size={10} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />Digitally Signed</span>
                <span style={{ fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: C.grayLight }}>15 Jun 2025, 09:42</span>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', gap: '0.6rem' }}>
            <FileText size={28} color={C.lineDark} />
            <span style={{ fontSize: '0.82rem', color: C.grayLight }}>Select template & generate</span>
          </div>
        )}
      </div>

      <button onClick={handleGenerate} disabled={generating} className="doc-generate-btn">
        {generating ? 'Generating...' : 'Generate Document'}
      </button>
    </div>
  );
};

const Showcase = ({ no, title, desc, reverse, children }) => (
  <Reveal className="showcase-mobile" style={{ display: 'grid', gridTemplateColumns: reverse ? '1fr 1.1fr' : '1.1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '6rem' }}>
    <div className="showcase-text" style={{ order: reverse ? 2 : 1 }}>
      <div className="mono-label" style={{ color: C.verdigris, fontSize: '0.78rem', marginBottom: '1.2rem' }}>Module {no}</div>
      <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginBottom: '1.2rem', lineHeight: 1.25 }}>{title}</h2>
      <p style={{ fontSize: '1.05rem', maxWidth: '480px', color: C.gray, lineHeight: 1.8 }}>{desc}</p>
    </div>
    <div className="showcase-visual" style={{ order: reverse ? 1 : 2, display: 'flex', justifyContent: reverse ? 'flex-start' : 'flex-end' }}>{children}</div>
  </Reveal>
);

/* ═══════════════════════════════════════
   QUICK FIND
   ═══════════════════════════════════════ */
const QuickFindSection = () => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const items = [
    { icon: FileText, label: 'Case Management', desc: 'Track cases from first call to final settlement', color: C.verdigris, href: '#features' },
    { icon: Users, label: 'Family Portal', desc: 'Secure access for families to view arrangements', color: C.brass, href: '#features' },
    { icon: Truck, label: 'Dispatch & Fleet', desc: 'Smart route optimization and hearse tracking', color: C.accent, href: '#features' },
    { icon: ShieldCheck, label: 'Funeral Insurance', desc: 'Manage claims, contributions, and payouts', color: C.verdigrisLight, href: '#insurance' },
    { icon: Activity, label: 'Analytics & Reports', desc: 'Real-time insights into your operations', color: C.brassLight, href: '#features' },
    { icon: Server, label: 'Enterprise Security', desc: 'Bank-grade encryption and access controls', color: C.grayDark, href: '#infra' },
    { icon: FileText, label: 'Document Automation', desc: 'Auto-generate release forms, receipts, and certificates', color: C.verdigris, href: '#features' },
  ];
  const filtered = items.filter(it => it.label.toLowerCase().includes(query.toLowerCase()) || it.desc.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="quickfind-section">
      <div className="wrap">
        <Reveal style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', marginBottom: '0.8rem' }}>Looking for something in particular?</h2>
          <p style={{ color: C.gray, maxWidth: '500px', margin: '0 auto' }}>Quick access to every module in the Rest Point platform.</p>
        </Reveal>
        <Reveal delay={100} style={{ maxWidth: '560px', margin: '0 auto 3rem' }}>
          <div className={`search-bar ${focused ? 'focused' : ''}`}>
            <Search size={18} color={focused ? C.verdigris : C.gray} />
            <input type="text" placeholder="Search modules, features..." value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} className="search-input" />
            {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray, display: 'flex', padding: '4px' }}><X size={16} /></button>}
          </div>
        </Reveal>
        <div className="quickfind-grid">
          {filtered.map((item, i) => (
            <RevealDir key={item.label} delay={i * 80} from="up">
              <a href={item.href} className="quickfind-card" style={{ '--card-color': item.color }}>
                <div className="quickfind-icon-wrap"><item.icon size={20} color={item.color} /></div>
                <div><div className="quickfind-label">{item.label}</div><div className="quickfind-desc">{item.desc}</div></div>
                <ArrowRight size={16} className="quickfind-arrow" />
              </a>
            </RevealDir>
          ))}
        </div>
        {filtered.length === 0 && <Reveal style={{ textAlign: 'center', padding: '3rem 0' }}><p style={{ color: C.gray }}>No modules found for "<strong>{query}</strong>"</p></Reveal>}
      </div>
    </section>
  );
};


/* ═══════════════════════════════════════
   NEWSROOM
   ═══════════════════════════════════════ */
const NewsroomSection = () => {
  const articles = [
    { featured: true, category: 'COMING SOON', catColor: C.brass, title: 'RestPay: Unified Payment Processing', excerpt: 'We\'re introducing RestPay, our upcoming payment module that will integrate card payments alongside M-Pesa. Accept all major payment methods through a single, seamless platform. More payment options, less friction for families.', date: 'May 2026', cta: 'Get notified' },
    { category: 'PRODUCT', catColor: C.verdigris, title: 'Multi-Tenant Architecture Now Available', excerpt: 'Serve multiple funeral homes from a single instance with complete data isolation.', date: 'May 2026' },
    { category: 'COMING SOON', catColor: C.brass, title: 'M-Pesa Payments - Coming Soon', excerpt: 'Families will soon be able to pay directly through the portal via M-Pesa.', date: 'May 2026' },
  ];
  return (
    <section className="newsroom-section">
      <div className="wrap">
        <Reveal style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '3rem' }}>
          <Newspaper size={20} color={C.verdigris} />
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', margin: 0 }}>Newsroom</h2>
        </Reveal>
        <div className="newsroom-grid">
          {articles.filter(a => a.featured).map((a, i) => (
            <RevealDir key={i} from="left" delay={0}>
              <div className="newsroom-featured" style={{ '--glow-color': a.catColor }}>
                <div className="newsroom-featured-shine" />
                <div className="newsroom-cat" style={{ color: a.catColor }}><span className="newsroom-cat-dot" style={{ background: a.catColor }} />{a.category}</div>
                <h3 className="newsroom-featured-title">{a.title}</h3>
                <p className="newsroom-featured-excerpt">{a.excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: 'auto', paddingTop: '1.5rem' }}>
                  <span className="newsroom-date">{a.date}</span>
                  <button className="btn btn-brass" style={{ padding: '0.8rem 2rem', fontSize: '0.9rem', borderRadius: '50px' }}>{a.cta} <ArrowRight size={16} /></button>
                </div>
              </div>
            </RevealDir>
          ))}
          <div className="newsroom-side">
            {articles.filter(a => !a.featured).map((a, i) => (
              <RevealDir key={i} from="right" delay={(i + 1) * 150}>
                <a href="#" className="newsroom-card" style={{ '--card-accent': a.catColor }}>
                  <div className="newsroom-card-top">
                    <div className="newsroom-cat" style={{ color: a.catColor }}><span className="newsroom-cat-dot" style={{ background: a.catColor }} />{a.category}</div>
                    <ExternalLink size={14} className="newsroom-card-ext" />
                  </div>
                  <h4 className="newsroom-card-title">{a.title}</h4>
                  <p className="newsroom-card-excerpt">{a.excerpt}</p>
                  <span className="newsroom-date">{a.date}</span>
                </a>
              </RevealDir>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════ */
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [billing, setBilling] = useState('monthly');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const goLogin = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); };
  const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
  const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };
  const goAbout = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/about'); };

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 60); return () => clearTimeout(t); }, []);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 50); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);

  const plans = [
    { name: 'Single Tenant', monthly: '9,200', annual: '101,200', features: ['Up to 20 users', 'Unlimited cases & documents', 'Family portal', 'Analytics & reporting', 'Case management & billing', 'Standard support', 'Daily backups'] },
    { name: 'Multi-Tenant', monthly: '18,900', annual: '189,000', featured: true, features: ['Unlimited users', 'Unlimited cases & documents', 'All Single features +', 'Advanced analytics', 'Priority 24/7 support', 'Custom integrations', 'Hourly backups'] },
  ];

  const infraFeatures = [
    { icon: ShieldCheck, title: 'Bank-grade Security', desc: 'Role-based access, audit logs, and end-to-end encryption ensure data remains protected and compliant.' },
    { icon: Server, title: 'Reliable Infrastructure', desc: '99.9% uptime guarantee with automated daily backups. Your data is always available when you need it.' },
    { icon: Zap, title: 'Seamless Integrations', desc: 'Connect with local payment gateways, accounting software, and communication tools effortlessly.' },
  ];

  const marqueeItems = ['Case Management', 'Family Portal', 'Smart Dispatch', 'Fleet Tracking', 'Funeral Insurance', 'Billing & Invoicing', 'Analytics & Reports', 'Welfare Schemes'];

  return (
    <>
      <LandingPageSEO />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500&display=swap');
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

        .btn{display:inline-flex;align-items:center;gap:0.5rem;padding:0.95rem 1.9rem;font-size:0.9rem;font-weight:500;font-family:'Inter',sans-serif;border:1px solid transparent;border-radius:8px;cursor:pointer;transition:all 0.3s ease;white-space:nowrap;letter-spacing:0.01em}
        .btn-dark{background:${C.ink};color:${C.bone}}
        .btn-dark:hover{background:${C.verdigris};transform:translateY(-2px);box-shadow:0 10px 20px rgba(21,23,26,0.15)}
        .btn-line{background:transparent;color:${C.ink};border-color:${C.line}}
        .btn-line:hover{background:${C.ink};color:${C.bone};border-color:${C.ink}}
        .btn-brass{background:${C.brass};color:${C.bone};border:none}
        .btn-brass:hover{background:${C.brassLight};transform:translateY(-2px);box-shadow:0 10px 20px rgba(139,115,85,0.25)}
        .wrap{max-width:1180px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
        nav .wrap{overflow:visible!important}

        /* ── Nav ── */
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
        .nav-cta{display:flex;gap:0.75rem}
        .mobile-nav{display:none}

        /* ── Policy Dropdown (REDESIGNED) ── */
        .policy-dropdown{position:absolute;top:calc(100% + 8px);right:0;background:${C.bone};border:1px solid ${C.line};border-radius:12px;min-width:280px;z-index:1000;box-shadow:0 24px 48px rgba(21,23,26,0.12),0 0 0 1px rgba(21,23,26,0.03);overflow:hidden;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);transform-origin:top right}
        .policy-dropdown-inner{padding:0.4rem}
        .policy-dropdown-item{width:100%;padding:0.75rem 1rem;background:none;border:none;text-align:left;cursor:pointer;font-size:0.84rem;color:${C.gray};border-radius:8px;transition:all 0.2s;font-family:'Inter',sans-serif;display:flex;align-items:center;gap:0.75rem}
        .policy-dropdown-item:hover{background:${C.bone2};color:${C.ink}}
        .policy-item-icon{flex-shrink:0;color:${C.grayDark};transition:color 0.2s}
        .policy-dropdown-item:hover .policy-item-icon{color:${C.verdigris}}
        .policy-item-arrow{margin-left:auto;flex-shrink:0;color:${C.gray};opacity:0;transform:translateX(-4px);transition:all 0.2s}
        .policy-dropdown-item:hover .policy-item-arrow{opacity:1;transform:translateX(0);color:${C.verdigris}}

        .mobile-menu-container{position:absolute;top:100%;right:0;background:${C.bone};border:1px solid ${C.line};border-radius:8px;min-width:280px;margin-top:0.75rem;z-index:1000;box-shadow:0 20px 40px rgba(21,23,26,0.08);overflow:hidden}
        .mobile-link{display:block;width:100%;padding:0.9rem 1.2rem;background:none;border:none;text-align:left;cursor:pointer;font-size:0.88rem;color:${C.gray};text-decoration:none;border-bottom:1px solid ${C.line};font-family:'Inter',sans-serif;transition:background 0.2s}
        .mobile-link:hover{background:${C.bone2}}
        .mobile-policies-header{padding:0.5rem 0;border-bottom:1px solid ${C.line};background:${C.bone2}}

        /* ── Hero ── */
        .hero{padding-top:140px;padding-bottom:0;position:relative;overflow:hidden}
        .hero::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 20% 50%,rgba(61,79,71,0.06) 0%,transparent 50%),radial-gradient(circle at 80% 80%,rgba(139,115,85,0.05) 0%,transparent 50%);pointer-events:none}
        .hero-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:4rem;align-items:center;position:relative;z-index:1}
        .hero-desc{font-size:1.1rem;max-width:540px;margin-bottom:2rem;color:${C.gray};line-height:1.8}
        .hero-buttons{display:flex;gap:1rem;flex-wrap:wrap}

        /* ── Sales Banner ── */
        .sales-banner{position:relative;border-radius:16px;overflow:hidden;margin-top:3rem;box-shadow:0 30px 60px -15px rgba(21,23,26,0.2);border:1px solid ${C.line};animation:subtle-float 6s ease-in-out infinite}
        .sales-banner-img{width:100%;height:clamp(250px,35vw,420px);object-fit:cover;display:block;transition:transform 8s ease}
        .sales-banner:hover .sales-banner-img{transform:scale(1.03)}
        .sales-banner-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(21,23,26,0.88) 0%,rgba(21,23,26,0.45) 50%,rgba(21,23,26,0.1) 100%);pointer-events:none}
        .sales-banner-shine{position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(250,248,244,0.07),transparent);animation:shine 5s ease-in-out infinite 3s;pointer-events:none}
        .sales-banner-content{position:absolute;bottom:clamp(1.5rem,4vw,3rem);left:clamp(1.5rem,4vw,3rem);z-index:2;max-width:480px}

        /* ── Marquee ── */
        .marquee-strip{overflow:hidden;border-top:1px solid ${C.line};border-bottom:1px solid ${C.line};padding:0.9rem 0;background:#000000}
        .marquee-track{display:flex;width:max-content;animation:marquee 35s linear infinite}
        .marquee-item{display:inline-flex;align-items:center;gap:0.6rem;padding:0 1.8rem;font-size:0.78rem;color:#FFFFFF;font-family:'JetBrains Mono',monospace;white-space:nowrap;text-transform:uppercase;letter-spacing:0.1em}
        .marquee-dot{width:4px;height:4px;border-radius:50%;background:#FFFFFF;display:inline-block;flex-shrink:0}

        /* ── Quick Find ── */
        .quickfind-section{padding:clamp(4rem,8vw,6rem) 0;background:${C.bone}}
        .search-bar{display:flex;align-items:center;gap:0.8rem;padding:0.9rem 1.4rem;border:1.5px solid ${C.line};border-radius:12px;background:${C.bone};transition:all 0.35s ease;box-shadow:0 2px 8px rgba(21,23,26,0.03)}
        .search-bar.focused{border-color:${C.verdigris};box-shadow:0 4px 20px rgba(61,79,71,0.1),0 0 0 3px rgba(61,79,71,0.06)}
        .search-input{flex:1;border:none;outline:none;background:transparent;font-size:0.95rem;color:${C.ink};font-family:'Inter',sans-serif}
        .search-input::placeholder{color:${C.gray}}
        .quickfind-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:0.75rem}
        .quickfind-card{display:flex;align-items:center;gap:1rem;padding:1.2rem 1.4rem;border:1px solid ${C.line};border-radius:12px;background:${C.bone};cursor:pointer;transition:all 0.4s cubic-bezier(0.16,1,0.3,1);text-decoration:none}
        .quickfind-card:hover{border-color:var(--card-color);background:color-mix(in srgb,var(--card-color) 4%,${C.bone});transform:translateY(-3px);box-shadow:0 8px 24px color-mix(in srgb,var(--card-color) 12%,transparent)}
        .quickfind-icon-wrap{width:42px;height:42px;border-radius:10px;background:color-mix(in srgb,var(--card-color) 10%,${C.bone});display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.4s ease}
        .quickfind-card:hover .quickfind-icon-wrap{background:var(--card-color)}
        .quickfind-card:hover .quickfind-icon-wrap svg{color:${C.bone} !important}
        .quickfind-label{font-size:0.92rem;font-weight:600;color:${C.ink};margin-bottom:0.15rem}
        .quickfind-desc{font-size:0.78rem;color:${C.gray};line-height:1.4}
        .quickfind-arrow{margin-left:auto;flex-shrink:0;color:${C.gray};opacity:0;transform:translateX(-6px);transition:all 0.3s ease}
        .quickfind-card:hover .quickfind-arrow{opacity:1;transform:translateX(0);color:var(--card-color)}

        /* ══════════════════════════════════
           UNIFIED PLATFORM — REDESIGNED
           ══════════════════════════════════ */
        .unified-section{padding:clamp(5rem,10vw,8rem) 0;background:#0C0C0C;position:relative;overflow:hidden}
        .unified-bg-grid{position:absolute;inset:0;background-image:radial-gradient(rgba(250,248,244,0.06) 1px,transparent 1px);background-size:28px 28px;pointer-events:none}
        .unified-watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Fraunces',serif;font-size:clamp(6rem,18vw,16rem);font-weight:700;color:rgba(250,248,244,0.02);pointer-events:none;white-space:nowrap;letter-spacing:-0.03em;user-select:none}
        .unified-glow-1{position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(61,79,71,0.12) 0%,transparent 70%);top:-150px;right:-100px;pointer-events:none;animation:float-orb 15s ease-in-out infinite}
        .unified-glow-2{position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(139,115,85,0.08) 0%,transparent 70%);bottom:-100px;left:-80px;pointer-events:none;animation:float-orb 15s ease-in-out infinite -5s}
        .unified-heading{color:${C.bone};font-size:clamp(2.4rem,6vw,4.2rem);line-height:1.05;max-width:800px;margin:0 auto;font-weight:600}
        .unified-highlight{background:linear-gradient(135deg,#FAF8F4 0%,#A98F6E 40%,#4D9B7F 70%,#FAF8F4 100%);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradient-text 5s ease infinite}
        .unified-desc{color:rgba(250,248,244,0.5);font-size:1.1rem;max-width:520px;margin:1.5rem auto 0;line-height:1.8}

        .unified-bento-card{
          position:relative;background:rgba(250,248,244,0.03);border:1px solid rgba(250,248,244,0.07);
          border-radius:16px;padding:clamp(1.5rem,2.5vw,2.2rem);overflow:hidden;cursor:default;
          transition:all 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .unified-bento-card:hover{
          border-color:var(--card-glow);transform:translateY(-6px);
          box-shadow:0 16px 40px -8px var(--card-glow),0 0 0 1px var(--card-glow);
          background:rgba(250,248,244,0.05);
        }
        .unified-bento-glow-line{
          position:absolute;top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,transparent 0%,var(--card-glow) 50%,transparent 100%);
          opacity:0;transition:opacity 0.5s ease;
        }
        .unified-bento-card:hover .unified-bento-glow-line{opacity:1}
        .unified-bento-icon{
          width:48px;height:48px;border-radius:12px;background:var(--card-icon-bg);
          display:flex;align-items:center;justify-content:center;margin-bottom:1.2rem;
          transition:all 0.4s ease;
        }
        .unified-bento-card:hover .unified-bento-icon{
          transform:scale(1.08);box-shadow:0 0 20px var(--card-glow);
        }
        .unified-bento-title{font-family:'Inter',sans-serif;font-size:1rem;font-weight:600;color:${C.bone};margin-bottom:0.5rem;letter-spacing:-0.01em}
        .unified-bento-desc{font-size:0.85rem;color:rgba(250,248,244,0.45);line-height:1.65}
        .unified-bento-card:hover .unified-bento-desc{color:rgba(250,248,244,0.65)}

        .unified-cta-btn{
          background:transparent;color:${C.bone};border:1.5px solid rgba(250,248,244,0.2);
          padding:1rem 2.8rem;font-size:1rem;border-radius:50px;
          transition:all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .unified-cta-btn:hover{
          background:${C.bone};color:${C.ink};border-color:${C.bone};
          transform:translateY(-2px);box-shadow:0 12px 30px rgba(250,248,244,0.15);
        }
        .unified-micro{margin-top:1.2rem;font-size:0.78rem;color:rgba(250,248,244,0.3);font-family:'JetBrains Mono',monospace;letter-spacing:0.05em}

        /* ══════════════════════════════════
           INSURANCE — REDESIGNED (LIGHT)
           ══════════════════════════════════ */
        .insurance-section{
          padding:clamp(5rem,10vw,7rem) 0;background:${C.bone};
          border-top:1px solid ${C.line};position:relative;overflow:hidden;
        }
        .insurance-accent-bar{
          position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,${C.brass},${C.brassLight},${C.accent},${C.brass});
          background-size:200% 100%;animation:gradient-text 4s ease infinite;
        }
        .insurance-decor-circle{
          position:absolute;width:500px;height:500px;border-radius:50%;
          border:1px solid rgba(139,115,85,0.08);right:-200px;top:50%;transform:translateY(-50%);
          pointer-events:none;
        }
        .insurance-decor-circle::after{
          content:'';position:absolute;inset:40px;border-radius:50%;
          border:1px solid rgba(139,115,85,0.06);
        }
        .insurance-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:4rem;align-items:center;position:relative;z-index:1}
        .insurance-badge-row{display:flex;gap:0.6rem;flex-wrap:wrap;margin-bottom:2rem}
        .insurance-badge{
          display:inline-flex;align-items:center;gap:0.4rem;padding:0.4rem 1rem;
          border-radius:50px;font-size:0.72rem;font-family:'JetBrains Mono',monospace;
          letter-spacing:0.08em;text-transform:uppercase;font-weight:500;
          border:1px solid ${C.line};background:${C.bone2};color:${C.brass};
        }

        /* ══════════════════════════════════
           INFRASTRUCTURE — BLACK REDESIGN
           ══════════════════════════════════ */
        .infra-section{
          background:#0A0A0A;padding:clamp(5rem,10vw,7rem) 0;
          position:relative;overflow:hidden;border-top:1px solid rgba(250,248,244,0.06);
        }
        .infra-grid-bg{
          position:absolute;inset:0;
          background-image:
            linear-gradient(rgba(61,79,71,0.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(61,79,71,0.04) 1px,transparent 1px);
          background-size:48px 48px;pointer-events:none;
        }
        .infra-glow{
          position:absolute;width:600px;height:600px;border-radius:50%;
          background:radial-gradient(circle,rgba(61,79,71,0.1) 0%,transparent 60%);
          top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;
        }
        .infra-card-dark{
          background:rgba(250,248,244,0.03);border:1px solid rgba(250,248,244,0.08);
          padding:clamp(1.8rem,3vw,2.5rem);border-radius:16px;
          transition:all 0.5s cubic-bezier(0.16,1,0.3,1);position:relative;overflow:hidden;
        }
        .infra-card-dark::before{
          content:'';position:absolute;top:0;left:0;right:0;height:1px;
          background:linear-gradient(90deg,transparent,rgba(61,79,71,0.3),transparent);
          opacity:0;transition:opacity 0.5s ease;
        }
        .infra-card-dark:hover{
          border-color:rgba(61,79,71,0.35);background:rgba(250,248,244,0.05);
          transform:translateY(-6px);
          box-shadow:0 16px 40px -8px rgba(61,79,71,0.12),0 0 0 1px rgba(61,79,71,0.1);
        }
        .infra-card-dark:hover::before{opacity:1}
        .infra-icon-dark{
          width:52px;height:52px;border-radius:14px;
          background:rgba(61,79,71,0.12);border:1px solid rgba(61,79,71,0.15);
          display:flex;align-items:center;justify-content:center;margin-bottom:1.4rem;
          transition:all 0.4s ease;
        }
        .infra-card-dark:hover .infra-icon-dark{
          background:rgba(61,79,71,0.2);border-color:rgba(61,79,71,0.3);
          box-shadow:0 0 24px rgba(61,79,71,0.15);
        }
        .infra-title-dark{font-family:'Inter',sans-serif;font-size:1.1rem;font-weight:600;color:${C.bone};margin-bottom:0.7rem}
        .infra-desc-dark{font-size:0.9rem;color:rgba(250,248,244,0.45);line-height:1.75}
        .infra-card-dark:hover .infra-desc-dark{color:rgba(250,248,244,0.65)}

        /* ── App Window ── */
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

        /* ── Sections ── */
        .section{padding:clamp(4rem,8vw,6rem) 0}
        .showcase-mobile{display:grid;grid-template-columns:1.1fr 1fr;gap:4rem;align-items:center;margin-bottom:6rem}
        .proof{border-top:1px solid ${C.line};border-bottom:1px solid ${C.line};background:${C.bone2};padding:clamp(2.5rem,5vw,3.5rem) 0}
        .proof-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem}
        .proof-item{text-align:center;padding:0 1rem;border-left:1px solid ${C.line}}
        .proof-item:first-child{border-left:none}
        .proof-num{font-family:'JetBrains Mono',monospace;font-size:clamp(1.8rem,4vw,2.4rem);color:${C.verdigris};font-weight:600;margin-bottom:0.4rem}
        .proof-cap{font-size:0.85rem;color:${C.ink};font-weight:500}
        .about-section{background:${C.bone};padding:clamp(3rem,6vw,4rem) 0;border-top:1px solid ${C.line}}
        .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
        .pricing-section{padding:clamp(4rem,8vw,6rem) 0;background:${C.bone};border-top:1px solid ${C.line}}
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
        .pricing-card.featured .pricing-name,.pricing-card.featured .pricing-amount{color:${C.bone}}
        .pricing-card.featured .pricing-period{color:rgba(250,248,244,0.6)}
        .pricing-card.featured .pricing-feature{color:rgba(250,248,244,0.8)}
        .pricing-btn{width:100%;padding:0.9rem;margin-bottom:1.5rem;font-size:0.85rem;font-weight:600;cursor:pointer;border-radius:6px;transition:all 0.2s;border:1px solid transparent;font-family:'Inter',sans-serif}
        .pricing-features{list-style:none;padding:0;margin:0}
        .pricing-feature{display:flex;gap:0.7rem;margin-bottom:0.8rem;font-size:0.88rem;align-items:flex-start;color:${C.gray}}
        .pricing-feature svg{flex-shrink:0;margin-top:2px}

        /* ── CTA ── */
        .cta-wrapper{background:${C.bone};padding:clamp(4rem,8vw,7rem) 0}
        .cta-card{position:relative;background:linear-gradient(135deg,${C.ink} 0%,${C.verdigrisDark} 100%);border-radius:24px;padding:clamp(3rem,6vw,5rem) 2rem;text-align:center;overflow:hidden;border:1px solid ${C.lineDark};box-shadow:0 40px 80px -20px rgba(21,23,26,0.3)}
        .cta-card::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background-image:radial-gradient(circle at 50% 0%,rgba(139,115,85,0.15) 0%,transparent 50%),linear-gradient(rgba(250,248,244,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(250,248,244,0.03) 1px,transparent 1px);background-size:100% 100%,40px 40px,40px 40px;pointer-events:none}
        .cta-content{position:relative;z-index:2;max-width:700px;margin:0 auto}
        .cta-content h2{color:${C.bone};margin-bottom:1.5rem;font-size:clamp(2rem,4.5vw,3rem);line-height:1.2}
        .cta-content p{color:rgba(250,248,244,0.8);font-size:1.1rem;line-height:1.8;margin-bottom:2.5rem}
        .cta-avatars{display:flex;justify-content:center;margin-bottom:2.5rem}
        .avatar-circle{width:48px;height:48px;border-radius:50%;border:2px solid ${C.ink};display:flex;align-items:center;justify-content:center;color:${C.bone};font-family:'Fraunces',serif;font-weight:600;margin-left:-15px;box-shadow:0 4px 10px rgba(0,0,0,0.2)}
        .avatar-circle:first-child{margin-left:0}
        .cta-buttons{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
        .btn-ghost{background:transparent;color:${C.bone};border:1px solid rgba(250,248,244,0.3)}
        .btn-ghost:hover{background:rgba(250,248,244,0.1);border-color:${C.bone}}
        .cta-microcopy{margin-top:1.5rem;font-size:0.8rem;color:rgba(250,248,244,0.5);font-family:'JetBrains Mono',monospace;letter-spacing:0.05em}

        /* ── Newsroom ── */
        .newsroom-section{padding:clamp(4rem,8vw,6rem) 0;background:${C.bone};border-top:1px solid ${C.line}}
        .newsroom-grid{display:grid;grid-template-columns:1.3fr 1fr;gap:1.5rem;align-items:start}
        .newsroom-featured{position:relative;background:${C.ink};border-radius:16px;padding:clamp(2rem,4vw,3rem);display:flex;flex-direction:column;overflow:hidden;border:1px solid ${C.lineDark};transition:all 0.4s ease;min-height:380px}
        .newsroom-featured:hover{transform:translateY(-4px);box-shadow:0 20px 50px rgba(21,23,26,0.2)}
        .newsroom-featured-shine{position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(250,248,244,0.03),transparent);animation:shine 6s ease-in-out infinite 2s;pointer-events:none}
        .newsroom-cat{display:flex;align-items:center;gap:0.5rem;font-family:'JetBrains Mono',monospace;font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:1rem;font-weight:500}
        .newsroom-cat-dot{width:6px;height:6px;border-radius:50%;display:inline-block;animation:pulse-dot 2s ease-in-out infinite}
        .newsroom-featured-title{color:${C.bone};font-size:clamp(1.5rem,3vw,2rem);line-height:1.25;margin-bottom:1rem}
        .newsroom-featured-excerpt{color:rgba(250,248,244,0.7);font-size:0.95rem;line-height:1.8;flex:1}
        .newsroom-date{font-size:0.75rem;color:${C.gray};font-family:'JetBrains Mono',monospace;letter-spacing:0.05em}
        .newsroom-side{display:flex;flex-direction:column;gap:1rem}
        .newsroom-card{display:flex;flex-direction:column;padding:1.5rem;border:1px solid ${C.line};border-radius:12px;background:${C.bone};transition:all 0.4s cubic-bezier(0.16,1,0.3,1);cursor:pointer;text-decoration:none}
        .newsroom-card:hover{border-color:var(--card-accent);transform:translateY(-3px);box-shadow:0 8px 24px color-mix(in srgb,var(--card-accent) 10%,transparent)}
        .newsroom-card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:0.8rem}
        .newsroom-card-ext{color:${C.gray};opacity:0;transform:translate(-4px,4px);transition:all 0.3s ease}
        .newsroom-card:hover .newsroom-card-ext{opacity:1;transform:translate(0,0);color:var(--card-accent)}
        .newsroom-card-title{font-size:1rem;font-weight:600;color:${C.ink};margin-bottom:0.5rem;line-height:1.35;font-family:'Inter',sans-serif}
        .newsroom-card-excerpt{font-size:0.82rem;color:${C.gray};line-height:1.6;flex:1}

        /* ── Keyframes ── */
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-25%)}}
        @keyframes shine{0%{left:-100%}50%,100%{left:200%}}
        @keyframes subtle-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes float-orb{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(30px,-20px) scale(1.1)}50%{transform:translate(-20px,20px) scale(0.95)}75%{transform:translate(10px,10px) scale(1.05)}}
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.7)}}
        @keyframes gradient-text{0%{background-position:0% center}50%{background-position:100% center}100%{background-position:0% center}}
        @keyframes truckMove{from{left:30%}to{left:60%}}

        /* ── Responsive ── */
        @media(max-width:800px){.nav-links{display:none}.nav-cta{display:none}.mobile-nav{display:flex;gap:0.5rem;align-items:center}}
        @media(max-width:768px){
          .hero-grid{grid-template-columns:1fr;gap:2.5rem}
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
          .quickfind-grid{grid-template-columns:1fr}
          .newsroom-grid{grid-template-columns:1fr}
          .newsroom-featured{min-height:auto}
          .sales-banner-content{position:relative;bottom:auto;left:auto;padding:1.5rem;background:${C.ink}}
          .sales-banner-overlay{display:none}
          .unified-bento{grid-template-columns:1fr!important}
          .unified-bento-card{grid-column:span 1!important}
          .unified-heading{font-size:clamp(1.8rem,6vw,3rem)}
          .unified-watermark{font-size:clamp(4rem,14vw,8rem)}
          .insurance-decor-circle{display:none}
        }
        @media(max-width:480px){
          .hero{padding-top:100px}
          .btn{padding:0.8rem 1.2rem!important;font-size:0.8rem!important}
        }
      `}</style>

      <main>
        {/* ── Navigation ── */}
        <nav className={scrolled ? 'scrolled' : ''}>
          <div className="wrap nav-wrap">
            <div className="logo" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); }}>
              <Mark size={24} />Rest Point
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

        {/* ── Hero ── */}
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
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.dot, display: 'inline-block' }} />{item.name}</span>
                        <span style={{ color: C.brass }}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </AppWindow>
              </div>
            </div>
            <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1) 350ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) 350ms' }}>
              <div className="sales-banner" style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', marginTop: '3rem', boxShadow: '0 30px 60px -15px rgba(21,23,26,0.2)', border: `1px solid ${C.line}` }}>
                <img src="/sales-export-img.png" alt="Rest Point - Complete Software Solution" style={{ width: '100%', height: 'clamp(250px,35vw,420px)', objectFit: 'cover', display: 'block', transition: 'transform 8s ease' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'transparent', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(250,248,244,0.08), transparent)', animation: 'shine 5s ease-in-out infinite 3s', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: 'clamp(1.5rem,4vw,3rem)', left: 'clamp(1.5rem,4vw,3rem)', zIndex: 2, maxWidth: '550px' }}>
                  <div className="label" style={{ color: C.brass, marginBottom: '0.8rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Software Solution</div>
                  <h3 style={{ color: C.bone, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.8rem', maxWidth: '550px', lineHeight: 1.3, fontWeight: 600, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>Everything your funeral home needs, in one powerful platform</h3>
                  <button className="btn btn-brass" onClick={goStart} style={{ padding: '0.9rem 2rem', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>Explore the solution <ArrowRight size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Marquee items={marqueeItems} />
        <QuickFindSection />

        {/* ── Stats ── */}
        <section className="proof">
          <div className="wrap proof-grid">
            {[{ num: 500, suffix: '+', cap: 'Organizations onboarded' }, { num: 12, suffix: 'K+', cap: 'Cases managed monthly' }, { num: 99.9, suffix: '%', cap: 'Platform uptime' }].map((p, i) => (
              <div key={i} className="proof-item"><div className="proof-num"><AnimatedNumber end={p.num} suffix={p.suffix} /></div><div className="proof-cap">{p.cap}</div></div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
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
            <Showcase no="04" title="Hearse management module" desc="Effective hearse management helps a funeral home provide reliable, professional, and respectful transportation services." reverse={true}>
              <AppWindow title="restpoint.app/fleet" dark><MockHearse /></AppWindow>
            </Showcase>
            <Showcase no="05" title="Document automation engine" desc="Generate release forms, autopsy records, death certificates, and burial permits automatically. Digital signatures included." reverse={false}>
              <AppWindow title="restpoint.app/documents" dark><MockDocumentAutomation /></AppWindow>
            </Showcase>
          </div>
        </section>

        {/* ══════════════════════════════════
            INSURANCE — REDESIGNED (LIGHT)
            ══════════════════════════════════ */}
        <section id="insurance" className="insurance-section">
          <div className="insurance-accent-bar" />
          <div className="insurance-decor-circle" />
          <div className="wrap">
            <div className="insurance-grid">
              <Reveal>
                <div className="label" style={{ color: C.brass, marginBottom: '1rem' }}>Funeral Insurance & Welfare Management</div>
                <h2 style={{ marginBottom: '1.5rem', fontSize: 'clamp(2rem, 4.5vw, 2.8rem)', lineHeight: 1.25 }}>We understand the pain and financial burden families face</h2>
                <div className="insurance-badge-row">
                  {['Churches', 'SACCOs', 'Chamas', 'NGOs', 'Companies'].map(b => (
                    <span key={b} className="insurance-badge">{b}</span>
                  ))}
                </div>
                <p style={{ color: C.gray, lineHeight: 1.9, marginBottom: '1.5rem', fontSize: '1.02rem' }}>
                  Families go through immense pain when they lose a loved one, only to be burdened with huge hospital bills and funeral expenses. We break down these barriers by bringing comprehensive funeral insurance solutions directly to your organization.
                </p>
                <p style={{ color: C.gray, lineHeight: 1.9, marginBottom: '2.5rem', fontSize: '1.02rem' }}>
                  Rest Point now includes funeral insurance management and welfare scheme administration tools — claims, contributions, member tracking, and automated payouts all in one place.
                </p>
                <button className="btn btn-dark" onClick={() => navigate('/insurance')} style={{ padding: '1rem 2rem' }}>
                  Learn about funeral insurance <ArrowRight size={16} />
                </button>
              </Reveal>
              <Reveal delay={150}>
                <AppWindow title="restpoint.app/insurance" dark><MockInsurance /></AppWindow>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════
            INFRASTRUCTURE — BLACK REDESIGN
            ══════════════════════════════════ */}
        <section id="infra" className="infra-section">
          <div className="infra-grid-bg" />
          <div className="infra-glow" />
          <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
            <Reveal style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <div className="mono-label" style={{ color: 'rgba(250,248,244,0.35)', marginBottom: '1rem', letterSpacing: '0.2em' }}>Enterprise-Grade Infrastructure</div>
              <h2 style={{ color: C.bone, fontSize: 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '1rem' }}>Built for scale, secured by design</h2>
              <p style={{ color: 'rgba(250,248,244,0.45)', marginTop: '0.5rem', fontSize: '1.02rem', lineHeight: 1.8 }}>Modern infrastructure ensuring your data is safe, accessible, and scalable as your organization grows.</p>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.25rem', marginTop: '3.5rem' }}>
              {infraFeatures.map((feat, i) => (
                <Reveal key={i} delay={i * 120}>
                  <div className="infra-card-dark">
                    <div className="infra-icon-dark"><feat.icon size={24} color="#4D9B7F" /></div>
                    <h3 className="infra-title-dark">{feat.title}</h3>
                    <p className="infra-desc-dark">{feat.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={400} style={{ textAlign: 'center', marginTop: '3rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2rem', padding: '1.2rem 2.5rem', background: 'rgba(250,248,244,0.03)', border: '1px solid rgba(250,248,244,0.07)', borderRadius: '12px' }}>
                {[{ val: '99.9%', label: 'Uptime SLA' }, { val: '24/7', label: 'Monitoring' }, { val: 'AES-256', label: 'Encryption' }].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', color: '#4D9B7F', fontWeight: 600 }}>{s.val}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(250,248,244,0.35)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', marginTop: '0.2rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── About ── */}
        <section className="about-section">
          <div className="wrap about-grid">
            <Reveal>
              <div className="label" style={{ marginBottom: '1rem' }}>Our Mission</div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '1.5rem' }}>Rest Point was created to bring peace to families during their darkest moments.</h2>
              <p style={{ color: C.gray, marginBottom: '1.5rem', lineHeight: 1.8 }}>We recognized a gap in how funeral homes and welfare groups manage operations. The paperwork, the miscommunication, the delayed claims—it all adds unnecessary stress to grieving families.</p>
              <p style={{ color: C.gray, marginBottom: '2rem', lineHeight: 1.8 }}>Our platform streamlines the entire process so you can focus on what truly matters: providing compassionate care and supporting families with dignity and respect.</p>
              <button className="btn btn-line" onClick={goAbout}>Learn more about us</button>
            </Reveal>
            <Reveal delay={100} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ maxWidth: '280px', width: '100%' }}>
                <img src="/familyportal.png" alt="Rest Point Family Portal" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="pricing-section">
          <div className="wrap">
            <div className="pricing-header">
              <Reveal>
                <div className="label" style={{ marginBottom: '1rem' }}>Pricing</div>
                <h2>Simple, transparent pricing</h2>
              </Reveal>
              <div className="billing-toggle">
                <button className={`billing-btn ${billing === 'monthly' ? 'active' : ''}`} onClick={() => setBilling('monthly')}>Monthly</button>
                <button className={`billing-btn ${billing === 'annual' ? 'active' : ''}`} onClick={() => setBilling('annual')}>
                  Annual
                  <span className="save-badge">Save 14%</span>
                </button>
              </div>
            </div>
            <div className="pricing-grid">
              {plans.map((plan, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
                    {plan.featured && <div className="pricing-badge">MOST POPULAR</div>}
                    <div className="pricing-name">{plan.name}</div>
                    <div className="pricing-amount">
                      KES {billing === 'monthly' ? plan.monthly : plan.annual}
                      <span className="pricing-period">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                    <button
                      className={`pricing-btn ${plan.featured ? 'btn-brass' : 'btn-dark'}`}
                      onClick={goStart}
                    >Get started</button>
                    <ul className="pricing-features">
                      {plan.features.map((f, j) => (
                        <li key={j} className="pricing-feature">
                          <Check size={15} color={plan.featured ? '#A98F6E' : C.verdigris} />{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-wrapper">
          <div className="wrap">
            <Reveal>
              <div className="cta-card">
                <div className="cta-content">
                  <div className="cta-avatars">
                    {[
                      { bg: C.verdigris, t: 'JO' },
                      { bg: C.brass, t: 'MW' },
                      { bg: C.accent, t: 'KA' },
                      { bg: C.verdigrisLight, t: 'NO' },
                    ].map((a, i) => (
                      <div key={i} className="avatar-circle" style={{ background: a.bg }}>{a.t}</div>
                    ))}
                  </div>
                  <h2>Ready to transform how you serve families?</h2>
                  <p>Join 500+ organizations already using Rest Point to deliver dignified, efficient funeral services.</p>
                  <div className="cta-buttons">
                    <button className="btn btn-brass" onClick={goStart}>Request access <ArrowRight size={16} /></button>
                    <button className="btn btn-ghost" onClick={goLogin}>Log in</button>
                  </div>
                  <div className="cta-microcopy">Free onboarding · No credit card required · Cancel anytime</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Newsroom ── */}
        <NewsroomSection />

        <Footer />
      </main>
    </>
  );
}