import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Mail, Phone, MapPin, Cloud, Lock, Zap, Check, X, Users, Building, Heart, Shield, BookOpen, ArrowRight, ExternalLink, Menu } from 'lucide-react';
import Footer from '../../components/layout/Footer';

/* ============================================================
   REST POINT — Funeral Home Operating System & Welfare Management
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
    { label: 'Security Policy', onClick: () => navigate('/security') },
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
    padding: '2.5rem',
    maxWidth: '520px',
    borderRadius: '2px',
  }}>
    <div style={{ marginBottom: '1.2rem' }}>
      <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brassLight, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>MWANGI FAMILY</div>
      <div style={{ fontSize: '1.3rem', fontFamily: "'Fraunces', serif", color: C.bone, marginBottom: '0.4rem' }}>Arrangements confirmed</div>
      <div style={{ fontSize: '0.78rem', color: C.grayLight }}>Online link for  Family</div>
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
      padding: '2.5rem',
      maxWidth: '520px',
      borderRadius: '2px',
    }}>
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ fontSize: '0.82rem', fontFamily: "'JetBrains Mono', monospace", color: C.brass, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>ONLINE MEMORIAL</div>
        <div style={{ fontSize: '1.6rem', fontFamily: "'Fraunces', serif", color: C.bone, marginBottom: '0.4rem' }}>{candles} candles lit</div>
        <div style={{ fontSize: '0.9rem', color: 'rgba(250,248,244,0.6)' }}>In loving memory</div>
      </div>
      <div style={{ marginTop: '1.2rem', borderTop: `1px solid rgba(250,248,244,0.14)`, paddingTop: '1rem' }}>
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
      padding: '2.2rem',
      maxWidth: '460px',
      borderRadius: '2px',
    }}>
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brassLight, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>SMART DISPATCH</div>
        <div style={{ fontSize: '1.3rem', fontFamily: "'Fraunces', serif", color: C.bone }}>Hearse 02  Karen to Lang'ata</div>
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

const MockDocuments = () => (
  <div style={{
    background: C.bone2,
    border: `1px solid ${C.line}`,
    padding: '2.2rem',
    maxWidth: '460px',
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
    padding: '2.2rem',
    maxWidth: '460px',
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
    padding: '2.2rem',
    maxWidth: '460px',
    borderRadius: '2px',
  }}>
    <div style={{ marginBottom: '1.2rem' }}>
      <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brass, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>INSURANCE CLAIM</div>
      <div style={{ fontSize: '1.3rem', fontFamily: "'Fraunces', serif", color: C.bone }}>Funeral Cover</div>
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

  // Update page title for SEO
  useEffect(() => {
    document.title = 'Rest Point | Funeral Home Operating System & Welfare Management Software Kenya';
  }, []);

  const goLogin = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); };
  const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
  const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };
  const goAbout = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/about'); };
  const goInsurance = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/insurance'); };
  const goFamilyPortal = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/family-portal'); };
  const goMemorial = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/memorial'); };

  const faqs = [
    {
      q: 'How are my case files backed up?',
      a: 'Rest Point performs automated daily backups across cloud servers. All data is encrypted with AES-256 at rest. You can initiate a full backup export anytime from settings. Backups are stored in multiple data centers for maximum resilience.'
    },
    {
      q: 'How long does backup restoration take?',
      a: 'Full restoration typically completes in 2 - 4 hours. Critical case data can be restored in under 15 minutes. Our SLA guarantees 99.9% uptime with automatic failover across multiple data centers.'
    },
    {
      q: 'Is Rest Point cloud based infrastructure?',
      a: 'Yes. Rest Point runs on enterprise grade cloud infrastructure .  Your system is always responsive whether you\'re handling 1 case or 100.'
    },
    {
      q: 'What about data security ?',
      a: 'We use AES-256 encryption for data at rest, TLS 1.3 for transit, and role-based access controls. Rest Point  undergoes regular security audits.'
    },
    {
      q: 'Can I integrate funeral insurance?',
      a: 'Yes. We\'ve discovered funeral cover gaps of KES 250k–900k per case. Rest Point offers seamless integration for funeral homes that want to become insurance a  complete   death care  package . Contact our team to discuss partnership options.'
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
        'Up to 20   users',
        'Unlimited cases & documents',
        'Family portal',
        'Analytics & reporting',
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
        'Unlimited  users',
        'Unlimited cases & documents',
        'All Single features +',
        'Advanced analytics & reporting',
        'Priority 24/7 support',
        'Custom integrations  & Adds on',
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

        .hero { padding-top: 120px; padding-bottom: clamp(3rem, 6vw, 5rem); }
        .hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 3rem; align-items: center; }
        @media (max-width: 768px) { .hero-grid { grid-template-columns: 1fr; gap: 2rem; } }
        .hero-desc { font-size: 1rem; max-width: 100%; margin-bottom: 1.5rem; color: ${C.gray}; line-height: 1.7; }
        .hero-buttons { display: flex; gap: 0.75rem; flex-wrap: wrap; }

        .hero-image {
          width: 100%;
          height: clamp(280px, 50vw, 400px);
          background: linear-gradient(135deg, ${C.verdigrisDark} 0%, ${C.verdigris} 100%);
          border: 1px solid ${C.line};
          border-radius: 4px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 1.5rem;
          color: ${C.bone};
          font-size: 0.85rem;
          text-align: center;
        }

        .proof { border-top: 1px solid ${C.line}; border-bottom: 1px solid ${C.line}; background: ${C.bone2}; padding: clamp(2.5rem, 5vw, 3.5rem) 0; }
        .proof-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        @media (max-width: 768px) { .proof-grid { grid-template-columns: 1fr; gap: 1.5rem; } }
        .proof-item { text-align: center; padding: 0 1rem; border-left: 1px solid ${C.line}; }
        .proof-item:first-child { border-left: none; padding-left: 1rem; }
        @media (max-width: 768px) { 
          .proof-item { border-left: none; padding: 0; }
          .proof-item:first-child { padding-left: 0; }
        }
        .proof-num { font-family: 'JetBrains Mono', monospace; font-size: clamp(1.8rem, 4vw, 2.2rem); color: ${C.verdigris}; font-weight: 600; margin-bottom: 0.4rem; }
        .proof-cap { font-size: 0.85rem; color: ${C.ink}; font-weight: 500; }

        .section { padding: clamp(3rem, 6vw, 5rem) 0; }

        .insurance-section { background: ${C.verdigrisDark}; padding: clamp(5rem, 10vw, 7rem) 0; }
        .insurance-content { max-width: 640px; }
        .insurance-heading { color: ${C.bone}; margin-bottom: 1.2rem; }
        .insurance-desc { color: 'rgba(250,248,244,0.75)'; line-height: 1.8; margin-bottom: 2rem; }

        .infra-section { background: ${C.bone2}; padding: clamp(3rem, 6vw, 5rem) 0; }
        .infra-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin-top: 2rem; }
        .infra-item { padding-right: 0.5rem; }
        .infra-item h3 { font-size: 1.1rem; margin-bottom: 0.6rem; }

        .faq-section { background: ${C.bone2}; padding: clamp(3rem, 6vw, 5rem) 0; }
        .faq-container { max-width: 100%; padding: 0 1rem; }
        .faq-item { border-top: 1px solid ${C.line}; padding: 1.2rem 0; }
        .faq-question { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; cursor: pointer; background: none; border: none; width: 100%; text-align: left; padding: 0; }
        .faq-q-text { font-family: 'Fraunces', serif; font-size: 1rem; color: ${C.ink}; font-weight: 500; }
        .faq-toggle { color: ${C.brass}; font-size: '1rem'; flex-shrink: 0; transition: transform 0.3s; }
        .faq-answer { margin-top: 0.8rem; color: ${C.gray}; line-height: 1.7; font-size: 0.95rem; }

        .pricing-section { padding: clamp(3rem, 6vw, 5rem) 0; background: ${C.bone}; }
        .pricing-header { text-align: center; margin-bottom: 2.5rem; padding: 0 1rem; }
        .pricing-toggle { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 2rem; }
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .pricing-card {
          border: 2px solid ${C.verdigris};
          padding: 1.8rem;
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
        @media (max-width: 768px) {
          .pricing-card.featured { transform: none; }
        }
        .pricing-card:not(.featured):hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(21,23,26,0.08);
        }
        .pricing-badge {
          position: absolute;
          top: -12px;
          left: 1rem;
          background: ${C.brass};
          color: ${C.bone};
          padding: 0.3rem 0.75rem;
          font-size: 0.7rem;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.08em;
          border-radius: 20px;
          font-weight: 500;
        }
        .pricing-name { font-size: 1.2rem; font-family: 'Fraunces', serif; margin-bottom: 0.4rem; }
        .pricing-amount { font-size: clamp(2rem, 5vw, 2.6rem); font-family: 'Fraunces', serif; font-weight: 600; margin-bottom: 0.25rem; letter-spacing: -0.02em; }
        .pricing-period { font-size: 0.85rem; color: ${C.grayLight}; margin-bottom: 1.2rem; }
        .pricing-savings { font-size: 0.82rem; margin-bottom: 1.5rem; padding: 0.7rem 0.9rem; border-radius: 4px; background: rgba(61,79,71,0.08); border: 1px solid ${C.line}; }
        .pricing-btn { width: 100%; padding: 0.8rem; margin-bottom: 1.5rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
        .pricing-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .pricing-features { list-style: none; padding: 0; margin: 0; }
        .pricing-feature { display: flex; gap: 0.7rem; margin-bottom: 0.75rem; font-size: 0.85rem; align-items: flex-start; }
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
          padding: clamp(3rem, 6vw, 5rem) 0;
          border-top: 1px solid ${C.verdigrisLight};
          border-bottom: 1px solid ${C.verdigrisLight};
        }
        .cta-content { max-width: 700px; text-align: center; margin: 0 auto; padding: 0 1rem; }
        .cta-content h2 { color: ${C.bone}; margin-bottom: 1rem; font-size: clamp(1.5rem, 4vw, 2rem); }
        .cta-content p { color: rgba(250,248,244,0.75); font-size: 1rem; line-height: 1.7; margin-bottom: 1.5rem; }
        .cta-buttons { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }

        footer {
          background: ${C.ink};
          color: ${C.grayLight};
          padding: clamp(3rem, 6vw, 5rem) 0 2rem;
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
          gap: 2.5rem;
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 1024px) {
          .footer-content { grid-template-columns: 2fr 1fr 1fr; gap: 2rem; }
        }
        @media (max-width: 768px) {
          .footer-content { grid-template-columns: 1fr; gap: 1.5rem; }
        }

        .footer-col h4 {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${C.verdigrisTint};
          margin-bottom: 1rem;
          font-weight: 600;
          opacity: 0.7;
        }

        .footer-col a,
        .footer-col button {
          display: block;
          font-size: 0.82rem;
          color: ${C.grayLight};
          text-decoration: none;
          margin-bottom: 0.5rem;
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
          font-size: 1.3rem;
          color: ${C.bone};
          font-weight: 500;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .footer-desc {
          font-size: 0.85rem;
          color: ${C.grayLight};
          line-height: 1.7;
          max-width: 100%;
          opacity: 0.8;
        }
        .footer-desc:hover { opacity: 1; }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: ${C.grayLight};
          margin-top: 0.4rem;
          opacity: 0.7;
        }
        .footer-status .dot {
          width: 6px;
          height: 6px;
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
          font-size: 0.75rem;
          color: ${C.grayLight};
          padding-top: 1.2rem;
          border-top: 1px solid ${C.lineDark};
          position: relative;
          z-index: 1;
        }

        @media (max-width: 600px) {
          .footer-bottom { flex-direction: column; gap: 0.75rem; text-align: center; }
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
                <span className="label" style={{ color: C.verdigris }}>Funeral Home Operating System & Welfare Management Platform</span>
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
                  Rest Point is the complete platform for funeral homes and welfare organizations. Manage cases, coordinate funeral insurance claims, track member contributions, and serve families with the same care you bring to every service. Trusted by funeral homes, churches, SACCOs, and welfare groups across Kenya.
                </p>
                <div className="hero-buttons">
                  <button className="btn btn-dark" onClick={goStart}>Request access</button>
                  <button className="btn btn-line" onClick={goLogin}>See how it works</button>
                </div>
              </div>

              <div style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 200ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 200ms',
                width: '100%',
                minHeight: '400px'
              }}>
                <div style={{
                  background: C.verdigrisDark,
                  border: `1px solid ${C.verdigrisLight}`,
                  padding: '2rem',
                  width: '100%',
                  height: '100%',
                  minHeight: '400px',
                  borderRadius: '4px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                  <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: C.brass, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>DASHBOARD PREVIEW</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontFamily: "'Fraunces', serif", color: C.bone, fontWeight: 600 }}>24</div>
                        <div style={{ fontSize: '0.72rem', color: C.grayLight }}>Active Cases</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontFamily: "'Fraunces', serif", color: C.bone, fontWeight: 600 }}>KES 84K</div>
                        <div style={{ fontSize: '0.72rem', color: C.grayLight }}>Pending Bill</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontFamily: "'Fraunces', serif", color: C.bone, fontWeight: 600 }}>7</div>
                        <div style={{ fontSize: '0.72rem', color: C.grayLight }}>New Today</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ borderTop: `1px solid ${C.lineDark}`, paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: `1px solid ${C.lineDark}`, fontSize: '0.84rem', color: C.grayLight }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.verdigrisLight, display: 'inline-block' }} />
                        Otieno Family
                      </span>
                      <span style={{ color: C.brass }}>In Progress</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: `1px solid ${C.lineDark}`, fontSize: '0.84rem', color: C.grayLight }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.brass, display: 'inline-block' }} />
                        Mwangi Family
                      </span>
                      <span style={{ color: C.brass }}>Documents Pending</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: `1px solid ${C.lineDark}`, fontSize: '0.84rem', color: C.grayLight }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.accent, display: 'inline-block' }} />
                        Kamau Family
                      </span>
                      <span style={{ color: C.bone, fontFamily: "'JetBrains Mono', monospace" }}>KES 120,000</span>
                    </div>
                  </div>
                </div>
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
                  <div className="proof-num">500+</div>
                  <div className="proof-cap">Funeral homes & welfare organizations</div>
                </div>
                <div className="proof-item">
                  <div className="proof-num">50K+</div>
                  <div className="proof-cap">Cases managed annually</div>
                </div>
                <div className="proof-item">
                  <div className="proof-num">99.9%</div>
                  <div className="proof-cap">Uptime SLA guarantee</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="section">
          <div className="wrap">
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div className="label" style={{ marginBottom: '1rem' }}>Features</div>
                <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '1rem' }}>Everything you need to operate with dignity</h2>
                <p style={{ maxWidth: '600px', margin: '0 auto', color: C.gray }}>From case management to funeral insurance integration, Rest Point provides the tools funeral homes and welfare organizations need to serve families efficiently.</p>
              </div>
            </Reveal>

            <Showcase no="01" title="Case management that respects your workflow" desc="Track every detail from first call to final settlement. Rest Point keeps case files organized, documents verified, and families informed—so you can focus on service, not paperwork." reverse={false}>
              <MockDocuments />
            </Showcase>

            <Showcase no="02" title="Family portal & online memorials" desc="Give families secure access to arrangements, documents, and billing. Light a candle, leave a condolence, and stay connected—even after the service." reverse={true}>
              <MockPortal />
            </Showcase>

            <Showcase no="03" title="Smart dispatch & billing" desc="Optimize hearse routes, calculate costs automatically, and bill with precision. Rest Point turns logistics into a competitive advantage." reverse={false}>
              <MockDispatch />
            </Showcase>

            <Showcase no="04" title="Funeral insurance & welfare management" desc="Streamline funeral insurance claims, manage welfare contributions, and automate benefit disbursements. Purpose-built for churches, SACCOs, chamas, and organizations across Kenya." reverse={true}>
              <MockInsurance />
            </Showcase>
          </div>
        </section>

        {/* INSURANCE & WELFARE SECTION */}
        <section className="insurance-section">
          <div className="wrap">
            <div className="insurance-detail-content">
              <Reveal>
                <div className="label" style={{ color: C.brass, marginBottom: '1rem' }}>Funeral Insurance & Welfare Management</div>
                <h2 className="insurance-heading">Complete funeral welfare management for organizations</h2>
                <p className="insurance-desc">
                  Rest Point now includes comprehensive <strong>funeral insurance management</strong> and <strong>welfare scheme administration</strong> tools. Perfect for churches, SACCOs, chamas, companies, and NGOs looking to digitize their funeral assistance programs.
                </p>
                <div className="insurance-highlight">
                  <p>
                    <strong>Key Features:</strong> M-Pesa integration for seamless contributions, automated claims processing, member registration & beneficiary management, premium tracking, payment reminders, SMS notifications, comprehensive financial reporting, and multi-branch support.
                  </p>
                </div>
                <p className="insurance-desc">
                  Join 200+ churches, SACCOs, and welfare groups across Kenya already using Rest Point to manage their funeral insurance and welfare schemes. Reduce administration time by 70% and ensure complete financial transparency.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
                  <button className="btn btn-brass" onClick={() => navigate('/solutions/churches')}>Church Funeral Welfare</button>
                  <button className="btn btn-brass" onClick={() => navigate('/solutions/saccos')}>SACCO Funeral Insurance</button>
                  <button className="btn btn-brass" onClick={() => navigate('/solutions/chamas')}>Chama Welfare Management</button>
                </div>
                <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(250,248,244,0.06)', borderLeft: `3px solid ${C.brass}` }}>
                  <p style={{ color: C.bone, marginBottom: '1rem', fontSize: '1.1rem' }}><strong>Learn more about funeral welfare management:</strong></p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <a href="/solutions/churches" style={{ color: C.brassLight, textDecoration: 'underline' }}>Church Funeral Welfare Software</a>
                    <span style={{ color: C.grayLight }}>|</span>
                    <a href="/solutions/saccos" style={{ color: C.brassLight, textDecoration: 'underline' }}>SACCO Funeral Insurance</a>
                    <span style={{ color: C.grayLight }}>|</span>
                    <a href="/solutions/chamas" style={{ color: C.brassLight, textDecoration: 'underline' }}>Chama Welfare Management</a>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* PRICING */}
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
                  <div className="pricing-name">{plan.name}</div>
                  <div className="pricing-amount">KES {plan.monthly.toLocaleString()}<span className="pricing-period">/month</span></div>
                  {plan.savings > 0 && (
                    <div className="pricing-savings">
                      Save KES {plan.savings * 10000} with annual billing
                    </div>
                  )}
                  <button className="pricing-btn" style={{ background: plan.featured ? C.brass : C.ink, color: C.bone }}>
                    Get started
                  </button>
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

        {/* CTA */}
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