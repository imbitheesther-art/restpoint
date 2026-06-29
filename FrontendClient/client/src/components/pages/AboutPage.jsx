import React from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  ink: '#15171A',
  bone: '#FAF8F4',
  bone2: '#F3EFE6',
  brass: '#8B7355',
  brassLight: '#A98F6E',
  verdigris: '#3D4F47',
  line: '#E3DDD0',
  gray: '#6B6862',
  grayLight: 'rgba(250,248,244,0.62)',
};

const Mark = ({ size = 28, color = C.ink }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="1" />
    <path d="M16 8.5V23.5M9.5 16H22.5" stroke={color} strokeWidth="1" />
    <circle cx="16" cy="16" r="2.5" fill={color} />
  </svg>
);

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.bone, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; color: ${C.gray}; background: ${C.bone}; -webkit-font-smoothing: antialiased; }
        h1, h2, h3 { font-family: 'Fraunces', serif; font-weight: 500; letter-spacing: -0.01em; color: ${C.ink}; }
        h1 { font-size: clamp(2.2rem, 5vw, 3.2rem); line-height: 1.08; }
        h2 { font-size: clamp(1.5rem, 3vw, 2rem); line-height: 1.2; margin-bottom: 1rem; }
        p { line-height: 1.8; font-size: 1rem; color: ${C.gray}; }
        a { color: ${C.brass}; text-decoration: none; transition: color 0.2s; }
        a:hover { color: ${C.brassLight}; }
        .label-mono { font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; letter-spacing: 0.1em; text-transform: uppercase; color: ${C.brass}; margin-bottom: 1rem; display: block; }
        .wrap { max-width: 800px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2rem); }
        @media (max-width: 760px) { .about-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(250,248,244,0.92)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${C.line}`, padding: '1.1rem 0',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Mark size={20} />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.05rem', fontWeight: 500, color: C.ink }}>Rest Point</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => navigate('/')} style={{ background: 'transparent', color: C.ink, border: `1px solid ${C.ink}`, padding: '.55rem 1.1rem', borderRadius: '2px', fontSize: '.78rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all .2s' }}>← Home</button>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: '100px', paddingBottom: '4rem' }}>
        {/* Hero Section */}
        <section style={{ padding: '3rem 0 2rem', borderBottom: `1px solid ${C.line}` }}>
          <div className="wrap">
            <span className="label-mono">About</span>
            <h1>Built for funeral homes that take their reputation seriously.</h1>
            <p style={{ marginTop: '1.5rem', fontSize: '1.05rem', maxWidth: '640px' }}>
              Rest Point is the system of record for funeral homes across East Africa — case management, family communication, dispatch, documents, and billing, run with the same care you bring to every service.
            </p>
          </div>
        </section>

        {/* The Story */}
        <section style={{ padding: '3rem 0' }}>
          <div className="wrap">
            <h2>The Story</h2>
            <p>
              One day, I found myself at a funeral home, standing beside a loved one. The mortician told me the cause of death was acute kidney and diabetes. Just a few words. Just a line. Just spoken by mouth.
            </p>
            <p style={{ marginTop: '1.2rem' }}>
              No report. No document. Nothing to hold. Nothing to read.
            </p>
            <p style={{ marginTop: '1.2rem' }}>
              I left that place with questions. I wanted to see the full report. I wanted to understand exactly what happened. I didn't want to be told — I wanted to read it for myself, on my phone, in my own time, with clarity and dignity.
            </p>
            <p style={{ marginTop: '1.2rem' }}>
              That moment changed everything.
            </p>
            <p style={{ marginTop: '1.2rem' }}>
              I realized that families deserve more than words spoken in a room. They deserve access. They deserve transparency. They deserve the complete picture — not just what they're told, but what the data actually says.
            </p>
            <p style={{ marginTop: '1.2rem' }}>
              So I built Rest Point.
            </p>
            <p style={{ marginTop: '1.2rem' }}>
              Not for the morticians. Not for the system. For the families. For the ones left behind. For anyone who has ever sat in a funeral home and wondered: What really happened?
            </p>
            <p style={{ marginTop: '1.2rem' }}>
              Rest Point gives families the full report — the actual data, the complete picture — right on their phone. Because in moments of loss, truth matters.
            </p>
            <p style={{ marginTop: '1.2rem' }}>
              That is why Rest Point exists. That is the story.
            </p>
          </div>
        </section>

        {/* About Welt Tallis Technologies */}
        <section style={{ padding: '3rem 0', background: C.ink, color: C.bone }}>
          <div className="wrap">
            <span className="label-mono" style={{ color: C.brassLight }}>About Welt Tallis Technologies</span>
            <h2 style={{ color: C.bone }}>The company behind Rest Point.</h2>
            <p style={{ color: C.grayLight, maxWidth: '640px' }}>
              Welt Tallis Technologies is a software company dedicated to building robust, scalable platforms for African businesses. Rest Point is our flagship product — a complete operating system for funeral homes.
            </p>
            <p style={{ color: C.grayLight, maxWidth: '640px', marginTop: '1.2rem' }}>
              We understand that technology infrastructure is extremely expensive — costs run into millions of shillings. We are dedicated to making it affordable for our clients without compromising on quality, security, or reliability.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
              {[
                ['Affordable Infrastructure', 'We understand technology costs millions. We are dedicated to making it affordable for African businesses.'],
                ['Microservices', 'Decoupled, independently deployed services for every domain.'],
                ['Multi‑tenancy', 'Isolated tenant databases with shared infrastructure.'],
                ['Encryption', 'AES‑256 at rest, TLS 1.3 in transit, end‑to‑end.'],
                ['Zero downtime', 'Rolling deployments, health checks, and circuit breakers.'],
                ['Google Drive Backup', 'Automated backups to your own Google Drive. Your data stays yours.'],
              ].map(([title, desc]) => (
                <div key={title} style={{ borderTop: `1px solid ${C.lineDark}`, paddingTop: '1rem' }}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1rem', color: C.bone, fontWeight: 500, marginBottom: '.3rem' }}>{title}</div>
                  <p style={{ fontSize: '.85rem', color: C.grayLight, maxWidth: '100%' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section style={{ padding: '3rem 0' }}>
          <div className="wrap">
            <h2>Our Mission</h2>
            <p>
              Our biggest responsibility is to <strong>protect your data at all costs</strong>. We do not share your data with anyone. We do not manipulate your data. Your data is backed up to your own Google Drive, a NAS device attached to your network, and our secure infrastructure. You never need to worry about anything.
            </p>
            <p style={{ marginTop: '1.2rem' }}>
              We combine deep technical expertise with a commitment to data protection, reliability, and user experience. Rest Point is built and maintained with the highest standards of security and professionalism.
            </p>
          </div>
        </section>

        {/* Related Products - Welt Tallis Technologies ecosystem */}
        <section style={{ padding: '3rem 0', borderTop: `1px solid ${C.line}` }}>
          <div className="wrap">
            <span className="label-mono">Our Ecosystem</span>
            <h2>More from Welt Tallis Technologies.</h2>

            {/* Rest Point */}
            <div style={{ marginTop: '2rem', background: C.bone2, border: `1px solid ${C.line}`, borderRadius: '4px', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '.8rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '4px', background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.bone, fontFamily: "'Fraunces', serif", fontSize: '1.2rem', fontWeight: 600 }}>RP</div>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.2rem', color: C.ink, fontWeight: 500 }}>Rest Point</div>
                  <div style={{ fontSize: '.8rem', color: C.gray }}>Funeral home operating system</div>
                </div>
              </div>
              <p style={{ fontSize: '.9rem', marginBottom: '1rem' }}>
                Rest Point is the complete operating system for funeral homes — case management, family communication, dispatch, and billing in one dignified platform.
              </p>
              <a href="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '.78rem', letterSpacing: '0.03em',
                color: C.brass, textDecoration: 'none', borderBottom: `1px solid ${C.line}`,
                paddingBottom: '.15rem', transition: 'all .2s',
              }}
                onMouseEnter={(e) => e.target.style.color = C.brassLight}
                onMouseLeave={(e) => e.target.style.color = C.brass}
              >
                Visit Rest Point →
              </a>
            </div>

            {/* Builders Nation - Separate platform */}
            <div style={{ marginTop: '1.5rem', background: C.bone2, border: `1px solid ${C.line}`, borderRadius: '4px', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '.8rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '4px', background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.bone, fontFamily: "'Fraunces', serif", fontSize: '1.2rem', fontWeight: 600 }}>BN</div>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.2rem', color: C.ink, fontWeight: 500 }}>Builders Nation</div>
                  <div style={{ fontSize: '.8rem', color: C.gray }}>Youth technology & engineering platform</div>
                </div>
              </div>
              <p style={{ fontSize: '.9rem', marginBottom: '1rem' }}>
                Builders Nation is a separate platform that immerses young minds into the world of technology, engineering, and sustainability using real remote-controlled simulations.
              </p>
              <a href="https://buildersnation.netlify.app/" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '.78rem', letterSpacing: '0.03em',
                color: C.brass, textDecoration: 'none', borderBottom: `1px solid ${C.line}`,
                paddingBottom: '.15rem', transition: 'all .2s',
              }}
                onMouseEnter={(e) => e.target.style.color = C.brassLight}
                onMouseLeave={(e) => e.target.style.color = C.brass}
              >
                Visit Builders Nation →
              </a>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section style={{ padding: '3rem 0', borderTop: `1px solid ${C.line}` }}>
          <div className="wrap" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '.88rem', color: C.gray }}>
              <a href="mailto:info@restpoint.co.ke" style={{ color: C.brass }}>info@restpoint.co.ke</a>
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: C.ink, color: C.grayLight, padding: '3.5rem 0 2rem' }}>
        <div className="wrap" style={{ maxWidth: '1080px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '3rem', paddingBottom: '2.6rem', borderBottom: `1px solid rgba(250,248,244,0.12)` }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <Mark size={20} color={C.bone} />
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.1rem', color: C.bone }}>Rest Point</span>
              </div>
              <p style={{ maxWidth: '320px', fontSize: '0.88rem', color: C.grayLight }}>The operating system for funeral homes that take their reputation seriously. Built by Welt Tallis Technologies.</p>
            </div>
            <div>
              <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.74rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.brassLight, marginBottom: '1.2rem', fontWeight: 400 }}>Platform</h4>
              <a href="/#capabilities" className="footer-link" style={{ display: 'block', fontSize: '0.88rem', color: C.grayLight, marginBottom: '0.7rem', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = C.grayLight}>Capabilities</a>
              <a href="/#pricing" className="footer-link" style={{ display: 'block', fontSize: '0.88rem', color: C.grayLight, marginBottom: '0.7rem', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = C.grayLight}>Pricing</a>
              <a href="/#faq" className="footer-link" style={{ display: 'block', fontSize: '0.88rem', color: C.grayLight, marginBottom: '0.7rem', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = C.grayLight}>Questions</a>
            </div>
            <div>
              <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.74rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.brassLight, marginBottom: '1.2rem', fontWeight: 400 }}>Company</h4>
              <a onClick={() => navigate('/about')} style={{ display: 'block', fontSize: '0.88rem', color: C.grayLight, marginBottom: '0.7rem', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = C.grayLight}>About</a>
              <a onClick={() => navigate('/contact')} style={{ display: 'block', fontSize: '0.88rem', color: C.grayLight, marginBottom: '0.7rem', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = C.grayLight}>Contact</a>
              <a onClick={() => navigate('/privacy')} style={{ display: 'block', fontSize: '0.88rem', color: C.grayLight, marginBottom: '0.7rem', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = C.grayLight}>Privacy policy</a>
              <a onClick={() => navigate('/terms')} style={{ display: 'block', fontSize: '0.88rem', color: C.grayLight, marginBottom: '0.7rem', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = C.grayLight}>Terms</a>
              <a onClick={() => navigate('/account-deletion')} style={{ display: 'block', fontSize: '0.88rem', color: C.grayLight, marginBottom: '0.7rem', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = C.grayLight}>Account deletion</a>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'rgba(250,248,244,0.45)', paddingTop: '1.6rem', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div>© 2026 Rest Point. All rights reserved.</div>
            <div>Built for African funeral professionals</div>
          </div>
        </div>
      </footer>
    </div>
  );
}