import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../layout/Footer';

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

const LinkedInIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const EmailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export default function ContactPage() {
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.bone, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; color: ${C.gray}; background: ${C.bone}; -webkit-font-smoothing: antialiased; }
        h1, h2, h3 { font-family: 'Fraunces', serif; font-weight: 500; letter-spacing: -0.01em; color: ${C.ink}; }
        h1 { font-size: clamp(2.2rem, 5vw, 3.2rem); line-height: 1.08; }
        p { line-height: 1.8; font-size: 1rem; color: ${C.gray}; }
        a { transition: all 0.2s; }
        .label-mono { font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; letter-spacing: 0.1em; text-transform: uppercase; color: ${C.brass}; margin-bottom: 1rem; display: block; }
        .wrap { max-width: 800px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2rem); }
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
        <section style={{ padding: '3rem 0 2rem', borderBottom: `1px solid ${C.line}` }}>
          <div className="wrap">
            <span className="label-mono">Contact</span>
            <h1>We're here when you need us.</h1>
            <p style={{ marginTop: '1.5rem', fontSize: '1.05rem', maxWidth: '560px' }}>
              Reach out to the Rest Point team through any of the channels below. We respond promptly to every inquiry.
            </p>
          </div>
        </section>

        <section style={{ padding: '3rem 0' }}>
          <div className="wrap">
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Email - info */}
              <a href="mailto:info@restpoint.co.ke" style={{
                display: 'flex', alignItems: 'center', gap: '1.2rem',
                background: C.bone2, border: `1px solid ${C.line}`,
                padding: '1.5rem 2rem', borderRadius: '4px',
                textDecoration: 'none', transition: 'all 0.2s',
                color: C.ink,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.brass; e.currentTarget.style.boxShadow = '0 2px 12px rgba(139,115,85,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ color: C.brass, display: 'flex', alignItems: 'center' }}><EmailIcon /></div>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.05rem', fontWeight: 500, color: C.ink }}>General inquiries</div>
                  <div style={{ fontSize: '.88rem', color: C.gray, marginTop: '.15rem' }}>info@restpoint.co.ke</div>
                </div>
              </a>

              {/* Email - privacy */}
              <a href="mailto:privacy@restpoint.co.ke" style={{
                display: 'flex', alignItems: 'center', gap: '1.2rem',
                background: C.bone2, border: `1px solid ${C.line}`,
                padding: '1.5rem 2rem', borderRadius: '4px',
                textDecoration: 'none', transition: 'all 0.2s',
                color: C.ink,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.brass; e.currentTarget.style.boxShadow = '0 2px 12px rgba(139,115,85,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ color: C.brass, display: 'flex', alignItems: 'center' }}><EmailIcon /></div>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.05rem', fontWeight: 500, color: C.ink }}>Data & privacy requests</div>
                  <div style={{ fontSize: '.88rem', color: C.gray, marginTop: '.15rem' }}>privacy@restpoint.co.ke</div>
                </div>
              </a>

              {/* WhatsApp */}
              <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: '1.2rem',
                background: C.bone2, border: `1px solid ${C.line}`,
                padding: '1.5rem 2rem', borderRadius: '4px',
                textDecoration: 'none', transition: 'all 0.2s',
                color: C.ink,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.brass; e.currentTarget.style.boxShadow = '0 2px 12px rgba(139,115,85,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ color: '#25D366', display: 'flex', alignItems: 'center' }}><WhatsAppIcon /></div>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.05rem', fontWeight: 500, color: C.ink }}>WhatsApp</div>
                  <div style={{ fontSize: '.88rem', color: C.gray, marginTop: '.15rem' }}>Chat with our team directly</div>
                </div>
              </a>

              {/* LinkedIn */}
              <a href="https://www.linkedin.com/company/restpoint" target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: '1.2rem',
                background: C.bone2, border: `1px solid ${C.line}`,
                padding: '1.5rem 2rem', borderRadius: '4px',
                textDecoration: 'none', transition: 'all 0.2s',
                color: C.ink,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.brass; e.currentTarget.style.boxShadow = '0 2px 12px rgba(139,115,85,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ color: '#0A66C2', display: 'flex', alignItems: 'center' }}><LinkedInIcon /></div>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.05rem', fontWeight: 500, color: C.ink }}>LinkedIn</div>
                  <div style={{ fontSize: '.88rem', color: C.gray, marginTop: '.15rem' }}>Follow Rest Point for updates</div>
                </div>
              </a>
            </div>

            <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: C.bone2, border: `1px solid ${C.line}`, borderRadius: '4px' }}>
              <p style={{ fontSize: '.88rem', textAlign: 'center' }}>
                Built with care by <strong>Welt Tallis Technologies</strong>.<br />
                <a href="mailto:info@restpoint.co.ke" style={{ color: C.brass, textDecoration: 'none' }}>info@restpoint.co.ke</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}