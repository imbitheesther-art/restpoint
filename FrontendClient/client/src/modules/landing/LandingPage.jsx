import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Mail, Phone, MapPin, Cloud, Lock, Zap, Check, X, Users, Building, Heart, Shield, BookOpen, ArrowRight, ExternalLink, Menu } from 'lucide-react';
import Footer from '../../components/layout/Footer';

/* ============================================================
   REST POINT — Funeral home operating system
   Design direction: enterprise-grade, dignified, ledger-inspired.
   Palette: ink, bone, brass, verdigris.
   ============================================================ */

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

/* ---------- Reveal-on-scroll ---------- */
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

/* ---------- Mark ---------- */
const Mark = ({ size = 28, color = C.verdigris }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="1" />
    <path d="M16 8.5V23.5M9.5 16H22.5" stroke={color} strokeWidth="1" />
    <circle cx="16" cy="16" r="2.5" fill={color} />
  </svg>
);

/* ---------- Policy Dropdown ---------- */
const PolicyDropdown = ({ navigate, goTerms }) => {
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
      <button
        onClick={() => setOpen(!open)}
        className="nav-link"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
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
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: C.ink,
            border: `1px solid ${C.line}`,
            borderRadius: '2px',
            minWidth: '240px',
            marginTop: '0.5rem',
            zIndex: 1000,
            boxShadow: '0 10px 30px rgba(21,23,26,0.2)',
          }}
        >
          {policies.map((policy, idx) => (
            <button
              key={idx}
              onClick={() => {
                policy.onClick();
                setOpen(false);
              }}
              style={{
                width: '100%',
                padding: '0.8rem 1.1rem',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: C.grayLight,
                borderBottom: idx < policies.length - 1 ? `1px solid ${C.lineDark}` : 'none',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = `rgba(250,248,244,0.08)`;
                e.target.style.color = C.bone;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = C.grayLight;
              }}
            >
              {policy.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- Mobile Menu ---------- */
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
      <button
        onClick={() => setOpen(!open)}
        className="nav-link"
        style={{ display: 'flex', alignItems: 'center', padding: '0.75rem' }}
      >
        <Menu size={22} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: C.ink,
            border: `1px solid ${C.line}`,
            borderRadius: '2px',
            minWidth: '220px',
            marginTop: '0.5rem',
            zIndex: 1000,
            boxShadow: '0 10px 30px rgba(21,23,26,0.2)',
          }}
        >
          <a href="#features" onClick={() => setOpen(false)} style={{ display: 'block', padding: '0.8rem 1.1rem', color: C.grayLight, textDecoration: 'none', fontSize: '0.85rem', borderBottom: `1px solid ${C.lineDark}` }}>Features</a>
          <a href="#pricing" onClick={() => setOpen(false)} style={{ display: 'block', padding: '0.8rem 1.1rem', color: C.grayLight, textDecoration: 'none', fontSize: '0.85rem', borderBottom: `1px solid ${C.lineDark}` }}>Pricing</a>
          <button onClick={() => { navigate('/about'); setOpen(false); }} style={{ width: '100%', padding: '0.8rem 1.1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: C.grayLight, borderBottom: `1px solid ${C.lineDark}` }}>About</button>
          <div style={{ padding: '0.5rem 0', borderBottom: `1px solid ${C.lineDark}` }}>
            <div style={{ padding: '0.4rem 1.1rem', fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', color: C.brass, opacity: 0.7 }}>Policies</div>
            {policies.map((policy, idx) => (
              <button key={idx} onClick={() => { policy.onClick(); setOpen(false); }} style={{ width: '100%', padding: '0.6rem 1.1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', color: C.grayLight, borderBottom: idx < policies.length - 1 ? `1px solid ${C.lineDark}` : 'none' }}>{policy.label}</button>
            ))}
          </div>
          <button onClick={() => { goLogin(); setOpen(false); }} style={{ width: '100%', padding: '0.8rem 1.1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: C.grayLight, borderBottom: `1px solid ${C.lineDark}` }}>Log in</button>
          <button onClick={() => { goStart(); setOpen(false); }} style={{ width: '100%', padding: '0.8rem 1.1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: C.grayLight }}>Request access</button>
        </div>
      )}
    </div>
  );
};

/* ---------- Mock Components ---------- */
const MockPortal = () => (
  <div style={{
    background: C.ink,
    border: `1px solid ${C.line}`,
    padding: '1.6rem',
    maxWidth: '340px',
    borderRadius: '2px',
  }}>
    <div style={{ marginBottom: '1.2rem' }}>
      <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brassLight, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>MWANGI FAMILY</div>
      <div style={{ fontSize: '1.3rem', fontFamily: "'Fraunces', serif", color: C.bone, marginBottom: '0.4rem' }}>Arrangements confirmed</div>
      <div style={{ fontSize: '0.78rem', color: C.grayLight }}>SMS link sent to family</div>
    </div>
    <div style={{ borderTop: `1px solid rgba(250,248,244,0.14)`, paddingTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: `1px solid rgba(250,248,244,0.14)`, fontSize: '0.84rem', color: C.grayLight }}>
        <span>Burial permit.pdf</span>
        <span style={{ fontSize: '0.76rem', color: C.brassLight }}>Download</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: `1px solid rgba(250,248,244,0.14)`, fontSize: '0.84rem', color: C.grayLight }}>
        <span>Service invoice</span>
        <span style={{ fontSize: '0.76rem', fontFamily: "'JetBrains Mono', monospace", color: C.bone }}>KES 84,000</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', fontSize: '0.84rem', color: C.grayLight }}>
        <span>Outstanding balance</span>
        <button style={{ padding: '0.3rem 0.7rem', background: C.verdigris, border: `1px solid ${C.verdigrisLight}`, color: C.bone, fontSize: '0.72rem', cursor: 'pointer', fontWeight: 500 }}>Pay now</button>
      </div>
    </div>
  </div>
);

const MockMemorial = () => {
  const [candles, setCandles] = useState(14);
  const [message, setMessage] = useState('');
  const [lighted, setLighted] = useState(false);

  const handleLight = () => {
    if (!lighted && message.trim()) {
      setCandles(candles + 1);
      setLighted(true);
    }
  };

  return (
    <div style={{
      background: C.verdigrisDark,
      border: `1px solid ${C.verdigrisLight}`,
      padding: '1.6rem',
      maxWidth: '340px',
      borderRadius: '2px',
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brass, letterSpacing: '0.1em', marginBottom: '0.6rem' }}>ONLINE MEMORIAL</div>
        <div style={{ fontSize: '1.3rem', fontFamily: "'Fraunces', serif", color: C.bone, marginBottom: '0.4rem' }}>{candles} candles lit</div>
        <div style={{ fontSize: '0.78rem', color: 'rgba(250,248,244,0.6)' }}>In loving memory</div>
      </div>
      <div style={{ marginTop: '1rem', borderTop: `1px solid rgba(250,248,244,0.14)`, paddingTop: '1rem' }}>
        <textarea
          placeholder="Leave a message of condolence..."
          value={message}
          onChange={(e) => { setMessage(e.target.value); setLighted(false); }}
          style={{
            width: '100%', background: 'transparent', border: 'none', color: C.bone,
            fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', resize: 'none',
            outline: 'none', minHeight: '3rem', marginBottom: '0.8rem'
          }}
        />
        <button
          onClick={handleLight}
          disabled={!message.trim() || lighted}
          style={{
            padding: '0.5rem 1.2rem', background: lighted ? C.brass : 'transparent',
            color: C.bone, border: `1px solid ${C.brass}`, cursor: lighted ? 'default' : 'pointer',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', letterSpacing: '0.06em', fontWeight: 500
          }}
        >
          {lighted ? 'Candle lit' : 'Light a candle'}
        </button>
      </div>
    </div>
  );
};

const MockDispatch = () => {
  const [distance, setDistance] = useState(38);
  const [rate, setRate] = useState(195);
  const cost = Math.round(distance * 0.12 * rate);

  return (
    <div style={{
      background: C.ink,
      border: `1px solid ${C.line}`,
      padding: '1.6rem',
      maxWidth: '340px',
      borderRadius: '2px',
    }}>
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brassLight, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>SMART DISPATCH</div>
        <div style={{ fontSize: '1.3rem', fontFamily: "'Fraunces', serif", color: C.bone }}>Hearse 02 — Karen to Lang'ata</div>
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
          <span style={{ fontSize: '0.78rem', color: C.grayLight }}>Trip cost (auto-billed)</span>
          <span style={{ fontSize: '1.4rem', fontFamily: "'Fraunces', serif", color: C.bone, fontWeight: 600 }}>KES {cost.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

const MockDocuments = () => (
  <div style={{
    background: C.bone2,
    border: `1px solid ${C.line}`,
    padding: '1.6rem',
    maxWidth: '340px',
    borderRadius: '2px',
  }}>
    <div style={{ marginBottom: '1.2rem' }}>
      <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.verdigris, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>CASE FILE</div>
      <div style={{ fontSize: '1.3rem', fontFamily: "'Fraunces', serif", color: C.ink }}>Otieno, J.</div>
      <div style={{ fontSize: '0.78rem', color: C.gray }}>4 documents · Document tracking</div>
    </div>
    <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: `1px solid ${C.line}`, fontSize: '0.84rem', color: C.gray }}>
        <span>Death certificate.pdf</span>
        <span style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.verdigris }}>✓ Verified</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: `1px solid ${C.line}`, fontSize: '0.84rem', color: C.gray }}>
        <span>Burial permit.pdf</span>
        <span style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brass }}>⊙ Pending</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', fontSize: '0.84rem', color: C.gray }}>
        <span>Police abstract.pdf</span>
        <span style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: '#C77B5E' }}>✗ Missing</span>
      </div>
    </div>
  </div>
);

const MockStorefront = () => (
  <div style={{
    background: C.ink,
    border: `1px solid ${C.line}`,
    padding: '1.6rem',
    maxWidth: '340px',
    borderRadius: '2px',
  }}>
    <div style={{ marginBottom: '1.2rem' }}>
      <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brassLight, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>ONLINE STOREFRONT</div>
      <div style={{ fontSize: '1.3rem', fontFamily: "'Fraunces', serif", color: C.bone }}>Caskets & packages</div>
      <div style={{ fontSize: '0.78rem', color: C.grayLight }}>0% processing fees</div>
    </div>
    <div style={{ borderTop: `1px solid rgba(250,248,244,0.14)`, paddingTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: `1px solid rgba(250,248,244,0.14)`, fontSize: '0.84rem', color: C.grayLight }}>
        <span>Mahogany casket — classic</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.76rem', color: C.bone }}>KES 65,000</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: `1px solid rgba(250,248,244,0.14)`, fontSize: '0.84rem', color: C.grayLight }}>
        <span>Full service package</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.76rem', color: C.bone }}>KES 140,000</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', fontSize: '0.84rem', color: C.grayLight }}>
        <span>Memorial wreath set</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.76rem', color: C.bone }}>KES 6,500</span>
      </div>
    </div>
  </div>
);

const MockInsurance = () => (
  <div style={{
    background: C.verdigrisDark,
    border: `1px solid ${C.verdigrisLight}`,
    padding: '1.6rem',
    maxWidth: '340px',
    borderRadius: '2px',
  }}>
    <div style={{ marginBottom: '1.2rem' }}>
      <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brass, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>INSURANCE CLAIM</div>
      <div style={{ fontSize: '1.3rem', fontFamily: "'Fraunces', serif", color: C.bone }}>Old Mutual Funeral Cover</div>
      <div style={{ fontSize: '0.78rem', color: 'rgba(250,248,244,0.6)' }}>Automated claim submission</div>
    </div>
    <div style={{ borderTop: `1px solid rgba(250,248,244,0.14)`, paddingTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: `1px solid rgba(250,248,244,0.14)`, fontSize: '0.84rem' }}>
        <span style={{ color: 'rgba(250,248,244,0.6)' }}>Policyholder</span>
        <span style={{ color: C.bone }}>J. Otieno</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: `1px solid rgba(250,248,244,0.14)`, fontSize: '0.84rem' }}>
        <span style={{ color: 'rgba(250,248,244,0.6)' }}>Policy</span>
        <span style={{ color: C.bone, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.76rem' }}>OM-44821-FC</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', fontSize: '0.84rem' }}>
        <span style={{ color: 'rgba(250,248,244,0.6)' }}>Claim amount</span>
        <span style={{ color: C.bone, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.76rem' }}>KES 84,000</span>
      </div>
    </div>
    <button style={{ width: '100%', marginTop: '1rem', padding: '0.65rem', background: C.brass, border: 'none', color: C.bone, fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>
      Submit claim
    </button>
  </div>
);

/* ---------- Showcase row ---------- */
const Showcase = ({ no, title, desc, reverse, children }) => (
  <Reveal
    style={{
      display: 'grid',
      gridTemplateColumns: reverse ? '1fr 0.85fr' : '0.85fr 1fr',
      gap: '3.5rem',
      alignItems: 'center',
      marginBottom: '5rem',
    }}
  >
    <div style={{ order: reverse ? 2 : 1 }}>
      <div style={{
        fontSize: '0.85rem',
        fontFamily: "'JetBrains Mono', monospace",
        color: C.verdigris,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: '1rem',
        fontWeight: 600,
      }}>Module {no}</div>
      <h2 style={{
        fontSize: '2rem',
        fontFamily: "'Fraunces', serif",
        color: C.ink,
        marginBottom: '1rem',
        lineHeight: 1.2,
      }}>{title}</h2>
      <p style={{
        fontSize: '1.05rem',
        maxWidth: '480px',
        color: C.gray,
        lineHeight: 1.8,
      }}>{desc}</p>
    </div>
    <div style={{ order: reverse ? 1 : 2, display: 'flex', justifyContent: reverse ? 'flex-start' : 'flex-end' }}>
      {children}
    </div>
  </Reveal>
);

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [billingYearly, setBillingYearly] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 60); return () => clearTimeout(t); }, []);

  const goLogin = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); };
  const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
  const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };
  const goAbout = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/about'); };
  const goInsurance = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/insurance'); };
  const goFamilyPortal = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/family-portal'); };

  const faqs = [
    {
      q: 'How are my case files backed up?',
      a: 'Rest Point performs automated daily backups across geo-redundant cloud servers. All data is encrypted with AES-256 at rest. You can initiate a full backup export anytime from settings. Backups are stored in multiple data centers for maximum resilience.'
    },
    {
      q: 'How long does backup restoration take?',
      a: 'Full restoration typically completes in 2–4 hours. Critical case data can be restored in under 15 minutes. Our SLA guarantees 99.9% uptime with automatic failover across multiple data centers.'
    },
    {
      q: 'Is Rest Point cloud-based infrastructure?',
      a: 'Yes. Rest Point runs on enterprise-grade cloud infrastructure with automatic scaling, geographic redundancy, and zero-downtime deployments. Your system is always responsive whether you\'re handling 1 case or 100.'
    },
    {
      q: 'What about data security and compliance?',
      a: 'We use AES-256 encryption for data at rest, TLS 1.3 for transit, and role-based access controls. Rest Point is ISO 27001 compliant, GDPR-ready, and undergoes regular security audits. All data stays in East African data centers.'
    },
    {
      q: 'Can I integrate funeral insurance?',
      a: 'Yes. We\'ve discovered funeral cover gaps of KES 250k–900k per case. Rest Point offers seamless integration for funeral homes that want to become insurance brokers or partners. Contact our team to discuss partnership options.'
    },
    {
      q: 'What if I need custom features?',
      a: 'Enterprise plans include dedicated support and custom development. Contact sales to discuss your funeral home\'s unique requirements and we\'ll build what you need.'
    },
  ];

  const plans = [
    {
      name: 'Single Tenant',
      monthly: 9200,
      annual: 101200,
      savings: 1,
      color: C.verdigris,
      features: [
        'Up to 3 users',
        'Unlimited cases & documents',
        'Family portal & SMS',
        'Case management & billing',
        'Standard support (business hours)',
        'Daily backups',
      ],
    },
    {
      name: 'Multi-Tenant',
      monthly: 18900,
      annual: 189000,
      savings: 2,
      color: C.brass,
      featured: true,
      features: [
        'Up to 15 users',
        'Unlimited cases & documents',
        'All Single features +',
        'Insurance claim integration',
        'Advanced analytics & reporting',
        'Priority 24/7 support',
        'Custom integrations',
        'Hourly backups',
      ],
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: ${C.gray}; background: ${C.bone}; -webkit-font-smoothing: antialiased; }

        h1, h2, h3 { font-family: 'Fraunces', serif; font-weight: 500; letter-spacing: -0.01em; color: ${C.ink}; }
        h1 { font-size: clamp(2.8rem, 6.5vw, 4.6rem); line-height: 1.05; margin-bottom: 1.4rem; }
        h2 { font-size: clamp(1.9rem, 4vw, 2.5rem); line-height: 1.2; }
        h3 { font-size: 1.3rem; }
        p { line-height: 1.7; font-size: 1rem; }

        a { color: inherit; text-decoration: none; }

        .label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.74rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${C.brass};
        }

        .btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.9rem 1.9rem; font-size: 0.85rem; font-weight: 500;
          font-family: 'Inter', sans-serif;
          border: 1px solid transparent; border-radius: 2px;
          cursor: pointer; transition: all 0.25s ease; white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .btn-dark { background: ${C.ink}; color: ${C.bone}; }
        .btn-dark:hover { background: ${C.verdigris}; }
        .btn-line { background: transparent; color: ${C.ink}; border-color: ${C.ink}; }
        .btn-line:hover { background: ${C.ink}; color: ${C.bone}; }
        .btn-brass { background: ${C.brass}; color: ${C.bone}; border: none; }
        .btn-brass:hover { background: ${C.brassLight}; }

        .wrap { max-width: 1140px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2.5rem); }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          background: rgba(250,248,244,0.96); backdrop-filter: blur(12px);
          border-bottom: 1px solid ${C.line};
          padding: 1.2rem 0;
        }
        .nav-wrap { display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 0.7rem; font-family: 'Fraunces', serif; font-size: 1.25rem; font-weight: 500; color: ${C.ink}; cursor: pointer; }
        .nav-links { display: flex; gap: 2.2rem; align-items: center; }
        .nav-link {
          font-size: 0.85rem;
          color: ${C.gray};
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s;
          background: transparent;
          border: none;
          font-family: 'Inter', sans-serif;
        }
        .nav-link:hover { color: ${C.verdigris}; }
        .nav-cta { display: flex; gap: 0.75rem; }
        .mobile-nav { display: none; }
        @media (max-width: 800px) { 
          .nav-links { display: none; } 
          .nav-cta { display: none; }
          .mobile-nav { display: flex; gap: 0.5rem; align-items: center; }
        }

        .hero { padding-top: 160px; padding-bottom: clamp(4rem, 8vw, 6rem); }
        .hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 4rem; align-items: center; }
        @media (max-width: 920px) { .hero-grid { grid-template-columns: 1fr; gap: 2.5rem; } }
        .hero-desc { font-size: 1.1rem; max-width: 520px; margin-bottom: 2.2rem; color: ${C.gray}; line-height: 1.75; }
        .hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }

        .hero-image {
          width: 100%;
          height: 400px;
          background: linear-gradient(135deg, ${C.verdigrisDark} 0%, ${C.verdigris} 100%);
          border: 1px solid ${C.line};
          border-radius: 4px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 2rem;
          color: ${C.bone};
          font-size: 0.85rem;
          text-align: center;
        }

        .proof { border-top: 1px solid ${C.line}; border-bottom: 1px solid ${C.line}; background: ${C.bone2}; padding: 3.5rem 0; }
        .proof-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 720px) { .proof-grid { grid-template-columns: 1fr; gap: 2rem; } }
        .proof-item { text-align: left; padding: 0 2rem; border-left: 1px solid ${C.line}; }
        .proof-item:first-child { border-left: none; padding-left: 0; }
        .proof-num { font-family: 'JetBrains Mono', monospace; font-size: 2.2rem; color: ${C.verdigris}; font-weight: 600; margin-bottom: 0.4rem; }
        .proof-cap { font-size: 0.9rem; color: ${C.ink}; font-weight: 500; }

        .section { padding: clamp(5rem, 10vw, 7rem) 0; }

        .insurance-section { background: ${C.verdigrisDark}; padding: clamp(5rem, 10vw, 7rem) 0; }
        .insurance-content { max-width: 640px; }
        .insurance-heading { color: ${C.bone}; margin-bottom: 1.2rem; }
        .insurance-desc { color: 'rgba(250,248,244,0.75)'; line-height: 1.8; margin-bottom: 2rem; }

        .infra-section { background: ${C.bone2}; padding: clamp(5rem, 10vw, 7rem) 0; }
        .infra-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem; margin-top: 3rem; }
        .infra-item { padding-right: 1rem; }
        .infra-item h3 { font-size: 1.2rem; margin-bottom: 0.8rem; }

        .faq-section { background: ${C.bone2}; padding: clamp(5rem, 10vw, 7rem) 0; }
        .faq-container { max-width: 700px; }
        .faq-item { border-top: 1px solid ${C.line}; padding: 1.8rem 0; }
        .faq-question { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; cursor: pointer; background: none; border: none; width: 100%; text-align: left; padding: 0; }
        .faq-q-text { font-family: 'Fraunces', serif; font-size: 1.1rem; color: ${C.ink}; font-weight: 500; }
        .faq-toggle { color: ${C.brass}; font-size: '1rem'; flex-shrink: 0; transition: transform 0.3s; }
        .faq-answer { margin-top: 1rem; color: ${C.gray}; line-height: 1.7; }

        .pricing-section { padding: clamp(5rem, 10vw, 7rem) 0; background: ${C.bone}; }
        .pricing-header { text-align: center; margin-bottom: 3.5rem; }
        .pricing-toggle { display: flex; align-items: center; justify-content: center; gap: 1.2rem; margin-bottom: 3rem; }
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 2.5rem; }
        .pricing-card {
          border: 2px solid ${C.verdigris};
          padding: 2.4rem;
          position: relative;
          border-radius: 8px;
          transition: all 0.25s ease;
          background: ${C.bone};
        }
        .pricing-card.featured {
          background: ${C.verdigrisDark};
          border-color: ${C.brass};
          transform: scale(1.02);
          box-shadow: 0 20px 40px rgba(21,23,26,0.12);
        }
        .pricing-card:not(.featured):hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(21,23,26,0.08);
        }
        .pricing-badge {
          position: absolute;
          top: -14px;
          left: 1.5rem;
          background: ${C.brass};
          color: ${C.bone};
          padding: 0.35rem 0.85rem;
          font-size: 0.72rem;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.08em;
          border-radius: 20px;
          font-weight: 500;
        }
        .pricing-name { font-size: 1.4rem; font-family: 'Fraunces', serif; margin-bottom: 0.5rem; }
        .pricing-amount { font-size: 2.6rem; font-family: 'Fraunces', serif; font-weight: 600; margin-bottom: 0.25rem; letter-spacing: -0.02em; }
        .pricing-period { font-size: 0.9rem; color: ${C.grayLight}; margin-bottom: 1.5rem; }
        .pricing-savings { font-size: 0.85rem; margin-bottom: 1.8rem; padding: 0.8rem 1rem; border-radius: 4px; background: rgba(61,79,71,0.08); border: 1px solid ${C.line}; }
        .pricing-btn { width: 100%; padding: 0.9rem; margin-bottom: 2rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
        .pricing-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .pricing-features { list-style: none; padding: 0; margin: 0; }
        .pricing-feature { display: flex; gap: 0.8rem; margin-bottom: 0.9rem; font-size: 0.88rem; align-items: flex-start; }
        .pricing-feature svg { flex-shrink: 0; margin-top: 2px; }

        .about-section { background: ${C.bone}; padding: clamp(3rem, 6vw, 4rem) 0; border-top: 1px solid ${C.line}; border-bottom: 1px solid ${C.line}; }
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
        @media (max-width: 768px) { .about-grid { grid-template-columns: 1fr; gap: 2rem; } }
        .about-content h2 { margin-bottom: 1rem; font-size: 1.8rem; }
        .about-content p { color: ${C.gray}; font-size: 1rem; line-height: 1.8; margin-bottom: 0.8rem; }
        .about-content p:last-of-type { margin-bottom: 1.5rem; }

        .insurance-detail-section { background: ${C.verdigrisDark}; padding: clamp(4rem, 8vw, 5rem) 0; }
        .insurance-detail-content { max-width: 700px; }
        .insurance-detail-content h2 { color: ${C.bone}; margin-bottom: 1.2rem; }
        .insurance-detail-content p { color: rgba(250,248,244,0.75); font-size: 1rem; line-height: 1.8; margin-bottom: 1.2rem; }
        .insurance-highlight { background: rgba(250,248,244,0.06); border-left: 3px solid ${C.brass}; padding: 1.2rem 1.8rem; margin: 1.2rem 0; }
        .insurance-highlight p { margin-bottom: 0; font-size: 0.95rem; }

        .cta-section {
          background: ${C.verdigrisDark};
          padding: 5rem 0;
          border-top: 1px solid ${C.verdigrisLight};
          border-bottom: 1px solid ${C.verdigrisLight};
        }
        .cta-content { max-width: 700px; text-align: center; margin: 0 auto; }
        .cta-content h2 { color: ${C.bone}; margin-bottom: 1.2rem; }
        .cta-content p { color: rgba(250,248,244,0.75); font-size: 1.1rem; line-height: 1.8; margin-bottom: 2rem; }
        .cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        footer {
          background: ${C.ink};
          color: ${C.grayLight};
          padding: 5rem 0 2rem;
          border-top: 2px solid ${C.verdigrisLight};
          position: relative;
          overflow: hidden;
        }
        footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 50%, rgba(61,79,71,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.2fr;
          gap: 3rem;
          margin-bottom: 4rem;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 1000px) {
          .footer-content { grid-template-columns: 2fr 1fr 1fr; gap: 2.5rem; }
        }
        @media (max-width: 700px) {
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
        }

        .footer-col h4 {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${C.verdigrisTint};
          margin-bottom: 1.2rem;
          font-weight: 600;
          opacity: 0.7;
        }

        .footer-col a,
        .footer-col button {
          display: block;
          font-size: 0.85rem;
          color: ${C.grayLight};
          text-decoration: none;
          margin-bottom: 0.6rem;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s, transform 0.2s;
          text-align: left;
          padding: 0;
          line-height: 1.5;
        }

        .footer-col a:hover,
        .footer-col button:hover {
          color: ${C.verdigrisTint};
          transform: translateX(4px);
        }

        .footer-brand {
          font-family: 'Fraunces', serif;
          font-size: 1.5rem;
          color: ${C.bone};
          font-weight: 500;
          margin-bottom: 0.6rem;
          letter-spacing: -0.02em;
        }

        .footer-desc {
          font-size: 0.88rem;
          color: ${C.grayLight};
          line-height: 1.7;
          max-width: 300px;
          opacity: 0.8;
        }
        .footer-desc:hover { opacity: 1; }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.78rem;
          color: ${C.grayLight};
          margin-top: 0.5rem;
          opacity: 0.7;
        }
        .footer-status .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4CAF50;
          display: inline-block;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }

        .footer-divider {
          height: 1px;
          background: ${C.lineDark};
          margin: 2.5rem 0;
          position: relative;
          z-index: 1;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.78rem;
          color: ${C.grayLight};
          padding-top: 1.5rem;
          border-top: 1px solid ${C.lineDark};
          position: relative;
          z-index: 1;
        }

        @media (max-width: 600px) {
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Navigation */}
      <nav>
        <div className="wrap nav-wrap">
          <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Mark size={24} />
            <span>Rest Point</span>
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
        {/* HERO */}
        <section className="hero">
          <div className="wrap">
            <div style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
            }}>
              <div style={{ display: 'inline-block', marginBottom: '1.6rem', padding: '0.6rem 1rem', background: 'rgba(61, 79, 71, 0.1)', border: `0px solid ${C.verdigrisLight}`, borderRadius: '0px' }}>
                <span className="label" style={{ color: C.verdigris }}>Operating system for funeral homes</span>
              </div>
              <h1>A record worthy of the families you serve.</h1>
            </div>

            <div className="hero-grid">
              <div style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 100ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 100ms',
              }}>
                <p className="hero-desc">
                  Rest Point is the system of record for funeral homes that take their reputation seriously  case management, family communication, dispatch, and billing, run with the same care you bring to every service.
                </p>
                <div className="hero-buttons">
                  <button className="btn btn-dark" onClick={goStart}>Request access</button>
                  <button className="btn btn-line" onClick={goLogin}>See how it works</button>
                </div>
              </div>

              <div className="hero-image" style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 200ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 200ms',
                position: 'relative', /* Allows absolute positioning if needed, or structured overflow */
                overflow: 'hidden',    /* Keeps the image rounded/contained if the card has border-radius */
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',        /* Forces the container to fill its grid space */
                minHeight: '400px'
              }}>



                {/* Added the image right below it */}
                <img
                  src="landing.png"
                  alt="Rest Point Dashboard Preview"
                  style={{ width: '100%', height: '100%', display: 'block', }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* PROOF */}
        <section className="proof">
          <div className="wrap">
            <Reveal>
              <div className="proof-grid">
                <div className="proof-item">
                  <div className="proof-num">100+</div>
                  <div className="proof-cap">Funeral homes on Rest Point</div>
                </div>
                <div className="proof-item">
                  <div className="proof-num">50k+</div>
                  <div className="proof-cap">Cases handled end-to-end</div>
                </div>
                <div className="proof-item">
                  <div className="proof-num">99.9%</div>
                  <div className="proof-cap">Uptime guaranteed</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* INFRASTRUCTURE SECTION */}
        <section className="infra-section">
          <div className="wrap">
            <Reveal>
              <h2>Built for reliability</h2>
              <p style={{ marginTop: '1rem', fontSize: '1.05rem', color: C.gray, maxWidth: '600px', marginBottom: '3rem' }}>
                Enterprise-grade cloud infrastructure, bank-level security, and 99.9% uptime guarantee.
              </p>
            </Reveal>

            <div className="infra-grid">
              <Reveal delay={100}>
                <div className="infra-item">
                  <Cloud size={32} color={C.verdigris} style={{ marginBottom: '1rem' }} />
                  <h3>Cloud-based infrastructure</h3>
                  <p style={{ color: C.gray, fontSize: '0.95rem', lineHeight: 1.6 }}>
                    Enterprise servers with automatic scaling, geographic redundancy, and zero-downtime deployments. Your system is always responsive.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={150}>
                <div className="infra-item">
                  <Lock size={32} color={C.verdigris} style={{ marginBottom: '1rem' }} />
                  <h3>Bank-grade security</h3>
                  <p style={{ color: C.gray, fontSize: '0.95rem', lineHeight: 1.6 }}>
                    AES-256 encryption at rest, TLS 1.3 in transit, ISO 27001 compliant, and role-based access controls. Audit-ready.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="infra-item">
                  <Zap size={32} color={C.verdigris} style={{ marginBottom: '1rem' }} />
                  <h3>99.9% uptime guarantee</h3>
                  <p style={{ color: C.gray, fontSize: '0.95rem', lineHeight: 1.6 }}>
                    Monitored 24/7 with automated failover across data centers. SLA-backed performance with daily backups.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* FEATURES - SYSTEM CAPABILITIES - MADE BIGGER */}
        <section className="section" id="features">
          <div className="wrap">
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div className="label" style={{ marginBottom: '0.5rem' }}>System capabilities</div>
                <h2 style={{ fontSize: '2.2rem' }}>Everything your funeral home needs</h2>
                <p style={{ fontSize: '1.1rem', color: C.gray, maxWidth: '600px', margin: '1rem auto 0' }}>
                  From case intake to family communication to dispatch — all in one system.
                </p>
              </div>
            </Reveal>

            <Showcase no="01" title="Family Portal" desc="Send families a single SMS link. They view case status, download documents, and pay balances by M-Pesa or card without calling your desk." reverse={false}>
              <MockPortal />
            </Showcase>

            <Showcase no="02" title="Digital memorial board" desc="Give families a place to gather, remember, and honour their loved ones. Light a digital candle, share a memory, and find comfort online." reverse={true}>
              <MockMemorial />
            </Showcase>

            <Showcase no="03" title="Insurance claim integration" desc="Submit funeral cover claims directly from the case file with all documents attached. Track approval status in real time without chasing insurers." reverse={false}>
              <MockInsurance />
            </Showcase>

            <Showcase no="04" title="Smart dispatch & logistics" desc="Log vehicle trips with auto-calculated fuel costs. Every dispatch is instantly billed to the right case so costs never slip through." reverse={true}>
              <MockDispatch />
            </Showcase>

            <Showcase no="05" title="Document & compliance vault" desc="Upload, verify, and track death certificates, permits, abstracts, and authorizations. Know instantly what's verified, pending, or missing." reverse={false}>
              <MockDocuments />
            </Showcase>

            <Showcase no="06" title="Google Drive backup" desc="Every document, permit, invoice, and report is automatically stored as a secure copy in your own Google Drive. Your data stays yours — accessible even offline, on any device, independent of Rest Point." reverse={true}>
              <div style={{
                background: C.ink,
                border: `1px solid ${C.line}`,
                padding: '1.6rem',
                maxWidth: '340px',
                borderRadius: '2px',
                color: C.bone,
              }}>
                <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brassLight, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>GOOGLE DRIVE BACKUP</div>
                <div style={{ fontSize: '1.1rem', fontFamily: "'Fraunces', serif", marginBottom: '0.5rem' }}>Your data, always yours</div>
                <div style={{ fontSize: '0.85rem', color: C.grayLight, lineHeight: 1.6 }}>
                  All documents, permits, invoices, and reports automatically backed up to your Google Drive. Accessible offline, on any device.
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${C.lineDark}` }}>
                  <span style={{ fontSize: '0.75rem', color: C.brassLight }}>✓ 12,847 documents backed up</span>
                </div>
              </div>
            </Showcase>
          </div>
        </section>

        {/* INSURANCE DETAIL SECTION */}
        <section className="insurance-detail-section">
          <div className="wrap">
            <Reveal>
              <div className="insurance-detail-content">
                <div className="label" style={{ color: C.brass, marginBottom: '1rem' }}>Insurance integration</div>
                <h2>Funeral insurance integration</h2>
                <p>
                  Funeral costs in Kenya range from <strong>KES 250,000 to KES 900,000+</strong>. Most families are financially unprepared.
                </p>
                <p>
                  By offering insurance, you provide complete death care — differentiating your home from competitors and building lasting trust.
                </p>
                <div className="insurance-highlight">
                  <p style={{ color: C.bone }}>
                    <strong>Quick integration:</strong> Ready within 30 working days.
                  </p>
                  <p style={{ color: 'rgba(250,248,244,0.6)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Insurance integration is a separate partnership. Contact us to discuss terms.
                  </p>
                </div>
                <button className="btn btn-brass" onClick={goInsurance}>
                  Learn more about insurance <ArrowRight size={18} />
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ABOUT SECTION - REDUCED, MOVED AFTER FEATURES */}
        <section className="about-section" id="about">
          <div className="wrap">
            <Reveal>
              <div className="about-grid">
                <div className="about-content">
                  <div className="label" style={{ marginBottom: '0.8rem' }}>About Rest Point</div>
                  <h2>Built for families and funeral professionals.</h2>
                  <p>
                    Rest Point is developed by <strong>Welt Tallis Technologies</strong> — a team that believes the best software is built by people who understand the work. We built the register first, and the features around it.
                  </p>
                  <p>
                    Every detail is designed to help funeral homes run with dignity, accuracy, and care.
                  </p>
                  <button className="btn btn-dark" onClick={goAbout} style={{ marginTop: '0.5rem' }}>
                    Read more <ArrowRight size={16} />
                  </button>
                </div>
                <div style={{
                  background: C.verdigrisDark,
                  border: `1px solid ${C.verdigrisLight}`,
                  borderRadius: '4px',
                  padding: '2.5rem 2rem',
                  color: C.bone,
                  textAlign: 'center',
                }}>
                  <Building size={40} style={{ color: C.brass, marginBottom: '0.8rem', opacity: 0.7 }} />
                  <div style={{ fontSize: '1.1rem', fontFamily: "'Fraunces', serif", marginBottom: '0.3rem' }}>Welt Tallis Technologies</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Built in Nairobi, for Africa</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq-section">
          <div className="wrap">
            <Reveal>
              <h2 style={{ marginBottom: '0.5rem' }}>Common questions</h2>
              <p style={{ fontSize: '1.05rem', color: C.gray, maxWidth: '600px', marginBottom: '3.5rem' }}>
                Everything you need to know about Rest Point's infrastructure, security, and features.
              </p>
            </Reveal>

            <div className="faq-container">
              {faqs.map((faq, idx) => (
                <Reveal key={idx} delay={idx * 50}>
                  <div className="faq-item">
                    <button
                      className="faq-question"
                      onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                    >
                      <span className="faq-q-text">{faq.q}</span>
                      <span className="faq-toggle" style={{ transform: openFAQ === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}>+</span>
                    </button>
                    {openFAQ === idx && (
                      <div className="faq-answer">{faq.a}</div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="pricing-section" id="pricing">
          <div className="wrap">
            <Reveal>
              <div className="pricing-header">
                <h2>Simple, transparent pricing</h2>
                <p style={{ marginTop: '1rem', fontSize: '1.05rem', color: C.gray, maxWidth: '600px', margin: '1rem auto 0' }}>
                  Pay monthly or save with annual billing. All plans include cloud infrastructure, daily backups, and 99.9% uptime.
                </p>
              </div>
            </Reveal>

            <div className="pricing-toggle">
              <span style={{ fontSize: '0.9rem', color: C.gray, fontWeight: billingYearly ? 400 : 600 }}>Monthly</span>
              <button
                onClick={() => setBillingYearly(!billingYearly)}
                style={{
                  padding: '0.4rem 0.9rem',
                  background: billingYearly ? C.verdigris : 'transparent',
                  border: `1px solid ${C.verdigris}`,
                  color: billingYearly ? C.bone : C.verdigris,
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  transition: 'all 0.25s',
                  borderRadius: '20px',
                }}
              >
                ANNUAL SAVE
              </button>
              <span style={{ fontSize: '0.9rem', color: C.gray, fontWeight: billingYearly ? 600 : 400 }}>Yearly</span>
            </div>

            <div className="pricing-grid">
              {plans.map((plan, idx) => (
                <Reveal key={idx} delay={idx * 100}>
                  <div className={`pricing-card ${plan.featured ? 'featured' : ''}`} style={{
                    background: plan.featured ? C.verdigrisDark : C.bone,
                    color: plan.featured ? C.bone : C.ink,
                    borderColor: plan.color,
                  }}>
                    {plan.featured && <div className="pricing-badge">RECOMMENDED</div>}
                    <h3 className="pricing-name" style={{ color: plan.featured ? C.bone : C.ink }}>{plan.name}</h3>
                    <div className="pricing-amount" style={{ color: plan.featured ? C.bone : C.ink }}>
                      KES {billingYearly ? (plan.annual).toLocaleString() : plan.monthly.toLocaleString()}
                    </div>
                    <p className="pricing-period" style={{ color: plan.featured ? 'rgba(250,248,244,0.7)' : C.gray }}>
                      {billingYearly ? 'per year' : 'per month'}
                    </p>
                    {billingYearly && (
                      <div className="pricing-savings" style={{
                        background: plan.featured ? 'rgba(250,248,244,0.08)' : 'rgba(61, 79, 71, 0.08)',
                        borderColor: plan.featured ? 'rgba(250,248,244,0.15)' : C.line,
                        color: plan.featured ? C.bone : C.ink,
                      }}>
                        Save <strong>{plan.savings} month{plan.savings > 1 ? 's' : ''}</strong> when you pay yearly
                      </div>
                    )}
                    <button
                      className="pricing-btn"
                      onClick={goStart}
                      style={{
                        background: plan.featured ? plan.color : C.ink,
                        color: plan.featured ? C.bone : C.bone,
                        border: `1px solid ${plan.color}`,
                        borderRadius: '6px',
                        fontWeight: 600,
                      }}
                    >
                      Get started
                    </button>
                    <ul className="pricing-features">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="pricing-feature">
                          <Check size={18} color={plan.color} />
                          <span style={{ color: plan.featured ? 'rgba(250,248,244,0.85)' : C.gray }}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="cta-section">
          <div className="wrap">
            <div className="cta-content">
              <h2>Ready to put your home's record in order?</h2>
              <p>
                Join the funeral homes across Kenya & Africa already running on Rest Point.
              </p>
              <div className="cta-buttons">
                <button className="btn btn-brass" onClick={goStart}>
                  Register your home <ArrowRight size={18} />
                </button>
                <button className="btn btn-line" onClick={goFamilyPortal} style={{ borderColor: C.bone, color: C.bone }}>
                  Family portal login
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer navigate={navigate} goTerms={goTerms} />
    </>
  );
}