import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  ink: '#15171A',
  bone: '#FAF8F4',
  bone2: '#F3EFE6',
  brass: '#8B7355',
  brassLight: '#A98F6E',
  verdigris: '#3D4F47',
  verdigrisDark: '#2E3F37',
  line: '#E3DDD0',
  lineDark: 'rgba(250,248,244,0.14)',
  gray: '#6B6862',
  grayLight: 'rgba(250,248,244,0.62)',
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

const Reveal = ({ children, delay = 0 }) => {
  const [ref, shown] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: shown ? 1 : 0,
      transform: shown ? 'translateY(0)' : 'translateY(18px)',
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const goHome = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); };
  const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: ${C.gray}; background: ${C.bone}; }
        h1, h2, h3 { font-family: 'Fraunces', serif; font-weight: 500; color: ${C.ink}; }
        h1 { font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1.12; }
        h2 { font-size: 1.15rem; line-height: 1.3; margin-top: 2.2rem; margin-bottom: 0.75rem; color: ${C.ink}; }
        p { line-height: 1.7; font-size: 0.95rem; margin-bottom: 1rem; }
        a { color: inherit; }
        .label { font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; letter-spacing: 0.12em; text-transform: uppercase; color: ${C.brass}; }
        .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1.7rem; font-size: 0.85rem; font-weight: 500; font-family: 'Inter', sans-serif; border: 1px solid transparent; border-radius: 2px; cursor: pointer; transition: all 0.25s ease; white-space: nowrap; letter-spacing: 0.01em; }
        .btn-dark { background: ${C.ink}; color: ${C.bone}; }
        .btn-dark:hover { background: #000; }
        .btn-line { background: transparent; color: ${C.ink}; border-color: ${C.ink}; }
        .btn-line:hover { background: ${C.ink}; color: ${C.bone}; }
        .wrap { max-width: 1080px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2rem); }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(250,248,244,0.92); backdrop-filter: blur(10px); border-bottom: 1px solid ${C.line}; padding: 1.15rem 0; }
        .nav-wrap { display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 0.65rem; font-family: 'Fraunces', serif; font-size: 1.15rem; font-weight: 500; color: ${C.ink}; cursor: pointer; }
        .content-block { padding-top: 92px; }
        .summary-box { border: 1px solid ${C.line}; padding: 1.5rem 1.7rem; margin-bottom: 2rem; background: ${C.bone2}; border-left: 3px solid ${C.brass}; }
        .contact-box { background: linear-gradient(135deg, ${C.verdigrisDark}, ${C.verdigris}); color: ${C.bone}; padding: 1.5rem 1.7rem; margin-top: 1rem; border-radius: 2px; }
        ul { padding-left: 1.5rem; line-height: 1.8; font-size: 0.95rem; margin-bottom: 1rem; }
        li { margin-bottom: 0.4rem; }
        footer { margin-top: 4rem; padding-top: 1.5rem; border-top: 1px solid ${C.line}; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; font-size: 0.8rem; color: ${C.gray}; }
        footer a { color: ${C.gray}; text-decoration: none; }
        footer a:hover { color: ${C.ink}; }
        .highlight-box { background: ${C.bone2}; border: 1px solid ${C.line}; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; border-left: 3px solid ${C.verdigris}; }
      `}</style>

      <nav>
        <div className="wrap nav-wrap">
          <div className="logo" onClick={goHome}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14.5" stroke={C.ink} strokeWidth="1" />
              <path d="M16 8.5V23.5M9.5 16H22.5" stroke={C.ink} strokeWidth="1" />
              <circle cx="16" cy="16" r="2.5" fill={C.ink} />
            </svg>
            <span>Rest Point</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-line" onClick={goHome} style={{ padding: '0.65rem 1.3rem', fontSize: '0.8rem' }}>← Back</button>
            <button className="btn btn-dark" onClick={goTerms} style={{ padding: '0.65rem 1.3rem', fontSize: '0.8rem' }}>Terms</button>
          </div>
        </div>
      </nav>

      <main className="content-block">
        <div className="wrap" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
          <Reveal>
            <div className="label" style={{ marginBottom: '0.8rem' }}>Legal</div>
            <h1>Privacy Policy</h1>
            <p style={{ color: C.gray, fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: '2rem' }}>Last updated: June 2026</p>
          </Reveal>

          <Reveal delay={100}>
            <div className="summary-box">
              <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Our Commitment to Privacy</h2>
              <p style={{ color: C.ink, fontSize: '0.95rem', margin: 0 }}>Rest Point is built on trust. We collect only the data needed to serve funeral homes and the families they care for. We never sell your data. Period.</p>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <h2>Information We Collect</h2>
            <p>We collect information that you provide directly to us, including funeral home details, case files, family contact information, and billing data. This information is essential for operating the Rest Point platform.</p>
          </Reveal>

          <Reveal delay={200}>
            <h2>How We Use Your Information</h2>
            <p>Your data is used exclusively to operate and improve the Rest Point platform. We use it to manage cases, process payments, communicate with families, and maintain your funeral home's records.</p>
          </Reveal>

          <Reveal delay={250}>
            <h2>Data Sharing</h2>
            <p>We do not sell, rent, or share your personal information with third parties for their marketing purposes. Data may be shared only with your explicit consent or as required by law.</p>
          </Reveal>

          <Reveal delay={300}>
            <div className="highlight-box">
              <p style={{ color: C.ink, margin: 0 }}><strong>Your Data Stays Yours:</strong> You retain full ownership of all data stored in Rest Point. You can export, transfer, or delete your data at any time. We never use your funeral home data to train models or serve advertisements.</p>
            </div>
          </Reveal>

          <Reveal delay={350}>
            <h2>Data Security</h2>
            <p>We implement industry-standard security measures including AES-256 encryption at rest, TLS 1.3 in transit, and role-based access controls. Regular security audits ensure your data remains protected.</p>
          </Reveal>

          <Reveal delay={400}>
            <h2>Contact</h2>
            <div className="contact-box">
              <p style={{ margin: 0, fontSize: '0.95rem' }}>For privacy-related inquiries:</p>
              <p style={{ margin: '0.5rem 0 0 0' }}><a href="mailto:privacy@restpoint.co.ke" style={{ color: C.brassLight, textDecoration: 'none', fontWeight: 500 }}>privacy@restpoint.co.ke</a></p>
            </div>
          </Reveal>

          <footer>
            <span>© {new Date().getFullYear()} Rest Point. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="/terms">Terms of Service</a>
              <a href="/privacy">Privacy Policy</a>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}