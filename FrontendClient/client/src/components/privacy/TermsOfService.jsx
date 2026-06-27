import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ============================================================
   REST POINT — Terms of Service
   Styled to match LandingPage: ink / bone / brass / verdigris
   ============================================================ */

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

export default function TermsOfService() {
  const navigate = useNavigate();
  const goHome = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: ${C.gray}; background: ${C.bone}; -webkit-font-smoothing: antialiased; }

        h1, h2, h3 { font-family: 'Fraunces', serif; font-weight: 500; letter-spacing: -0.01em; color: ${C.ink}; }
        h1 { font-size: clamp(2rem, 4vw, 2.6rem); line-height: 1.12; }
        h2 { font-size: 1.15rem; line-height: 1.3; margin-top: 2.2rem; }
        h3 { font-size: 1.1rem; line-height: 1.3; }
        p { line-height: 1.7; font-size: 0.95rem; }
        a { color: inherit; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.74rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${C.brass};
        }

        .btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.85rem 1.7rem; font-size: 0.85rem; font-weight: 500;
          font-family: 'Inter', sans-serif;
          border: 1px solid transparent; border-radius: 2px;
          cursor: pointer; transition: all 0.25s ease; white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .btn-dark { background: ${C.ink}; color: ${C.bone}; }
        .btn-dark:hover { background: #000; }
        .btn-line { background: transparent; color: ${C.ink}; border-color: ${C.ink}; }
        .btn-line:hover { background: ${C.ink}; color: ${C.bone}; }

        .wrap { max-width: 1080px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2rem); }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(250,248,244,0.92); backdrop-filter: blur(10px);
          border-bottom: 1px solid ${C.line};
          padding: 1.15rem 0;
        }
        .nav-wrap { display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 0.65rem; font-family: 'Fraunces', serif; font-size: 1.15rem; font-weight: 500; color: ${C.ink}; cursor: pointer; }

        .content-block { padding-top: 92px; }

        .summary-box {
          border: 1px solid ${C.line};
          padding: 1.5rem 1.7rem;
          margin-bottom: 2rem;
        }

        .pricing-box {
          border: 1px solid ${C.line};
          padding: 1.5rem 1.7rem;
          margin-bottom: 1.5rem;
        }

        .payment-box {
          background: ${C.ink};
          color: ${C.grayLight};
          padding: 1.5rem 1.7rem;
          margin-top: 1.5rem;
        }

        .contact-box {
          background: ${C.ink};
          color: ${C.grayLight};
          padding: 1.5rem 1.7rem;
          margin-top: 1rem;
        }

        ul { padding-left: 1.5rem; line-height: 1.8; font-size: 0.95rem; }
        li { margin-bottom: 0.4rem; }

        footer { 
          margin-top: 4rem; 
          padding-top: 1.5rem; 
          border-top: 1px solid ${C.line};
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.8rem;
          color: ${C.gray};
        }
        footer a { color: ${C.gray}; text-decoration: none; }
        footer a:hover { color: ${C.ink}; }
      `}</style>

      {/* Navigation */}
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
          </div>
        </div>
      </nav>

      <main className="content-block">
        <div className="wrap" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
          {/* Header */}
          <Reveal>
            <div className="label" style={{ marginBottom: '0.8rem', color: C.brass }}>Legal</div>
            <h1>Terms of Service</h1>
            <p style={{ color: C.gray, fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: '2rem' }}>
              Last updated: June 2026
            </p>
          </Reveal>

          {/* Summary */}
          <Reveal delay={100}>
            <div className="summary-box">
              <p style={{ color: C.ink, fontSize: '0.95rem', margin: 0 }}>
                <strong>In short:</strong> These are the rules for using Rest Point. By using our platform,
                you agree to follow them. We keep things fair and transparent.
              </p>
            </div>
          </Reveal>

          {/* Agreement */}
          <Reveal delay={150}>
            <h2>Agreement</h2>
            <p>
              Payments are due monthly. Monthly subscribers have a 7-day grace period. Yearly subscribers have a one-month grace period. Late payments may result in
              suspension. Reactivation fee: KES 1,000.
            </p>
          </Reveal>

          {/* What we offer */}
          <Reveal delay={200}>
            <h2>What We Offer</h2>
            <p>
              Rest Point helps funeral homes manage their work efficiently:
            </p>
            <ul>
              <li>Case management</li>
              <li>Family portal for families to stay informed</li>
              <li>Document generation</li>
              <li>Billing and payments</li>
              <li>Marketplace for funeral services</li>
              <li>Memorial services management</li>
            </ul>
          </Reveal>

          {/* Your account */}
          <Reveal delay={250}>
            <h2>Your Account</h2>
            <p>
              When you sign up, you agree to:
            </p>
            <ul>
              <li>Provide accurate information</li>
              <li>Keep your login details safe</li>
              <li>Tell us immediately if someone accesses your account without permission</li>
            </ul>
            <p>
              You're responsible for everything that happens under your account.
            </p>
          </Reveal>

          {/* Data protection */}
          <Reveal delay={300}>
            <h2>Data Protection</h2>
            <p>
              We take data protection seriously. We never sell, share, or manipulate your data.
              All data is encrypted at rest and in transit. We apply field-level masking for sensitive
              information, restrict login access during off-hours, and use soft delete — data is never
              permanently removed, only deactivated for audit trails.
            </p>
            <p>
              For more details, see our <a href="/privacy" style={{ color: C.brass }}>Privacy Policy</a>.
            </p>
          </Reveal>

          {/* Pricing */}
          <Reveal delay={350}>
            <h2>Pricing</h2>
            <div className="pricing-box">
              <p style={{ margin: 0, color: C.ink }}>
                <strong>Setup Fee & Staff Training:</strong> KES 15,000 / Branch (one-time)
              </p>
              <p style={{ margin: '0.5rem 0', color: C.ink }}>
                <strong>Monthly Subscription:</strong>
              </p>
              <ul style={{ color: C.ink, paddingLeft: '1.5rem', margin: '0 0 1rem 0' }}>
                <li>KES 8,900 for single-tenant</li>
                <li>KES 17,800 for multi-tenant</li>
              </ul>
              <p style={{ margin: '0.5rem 0', color: C.ink }}>
                <strong>Yearly Subscription (Discounted):</strong>
              </p>
              <ul style={{ color: C.ink, paddingLeft: '1.5rem', margin: 0 }}>
                <li>KES 97,900 for single-tenant <span style={{ color: C.verdigris, fontSize: '0.85rem', fontWeight: 500 }}>(Includes 1 month free)</span></li>
                <li>KES 178,000 for multi-tenant <span style={{ color: C.verdigris, fontSize: '0.85rem', fontWeight: 500 }}>(Includes 2 months free)</span></li>
              </ul>
            </div>
            <p>
              Payments are due monthly with a 10-day grace period. Late payments may result in
              suspension. Reactivation fee: KES 1,000.
            </p>
          </Reveal>

          {/* Payment Methods */}
          <Reveal delay={400}>
            <div className="payment-box">
              <h3 style={{ fontFamily: "'Fraunces', serif", color: C.bone, fontSize: '1.1rem', marginTop: 0, marginBottom: '1rem' }}>
                How to Pay
              </h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', lineHeight: 1.7 }}>
                <strong style={{ color: C.brassLight }}>Payments (Kenya):</strong><br />
                M-Pesa Till Number: <strong style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', color: C.bone }}>5570316</strong>
              </p>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.7 }}>
                <strong style={{ color: C.brassLight }}>Payments (Outside Kenya):</strong><br />
                Bank details will be provided via email upon registration.
              </p>
            </div>
          </Reveal>

          {/* Training and Setup */}
          <Reveal delay={450}>
            <h2>Training and Setup</h2>
            <p>
              After full payment of the KES 15,000 training fee per branch, we schedule setup
              within 2 weeks. Physical training is provided on-site. Zoom calls and video tutorials
              are available for international clients only. Services begin only after setup is
              complete and full payment has been received.
            </p>
          </Reveal>

          {/* Rules */}
          <Reveal delay={500}>
            <h2>Rules of Use</h2>
            <p>
              Please don't use the platform for:
            </p>
            <ul>
              <li>Illegal activities</li>
              <li>Uploading harmful code or viruses</li>
              <li>Sharing your account with others</li>
              <li>Using data for anything other than funeral home management</li>
            </ul>
            <p>
              <strong>Important:</strong> Breaking these rules may lead to account termination without a refund.
            </p>
          </Reveal>

          {/* Cancellation */}
          <Reveal delay={550}>
            <h2>Cancellation</h2>
            <p>
              You can cancel your account anytime with 30 days written notice. We may cancel
              immediately if you break these terms. After cancellation, your access is removed
              and the data deletion process begins.
            </p>
          </Reveal>

          {/* Legal */}
          <Reveal delay={600}>
            <h2>Legal Matters</h2>
            <p>
              These terms follow the laws of Kenya. Any disputes will be resolved through
              arbitration in Nairobi, Kenya.
            </p>
          </Reveal>

          {/* Updates */}
          <Reveal delay={650}>
            <h2>Updates to Terms</h2>
            <p>
              We may update these terms occasionally. If we make important changes, we'll
              let you know by email or when you log in. Continued use means you accept the
              updated terms.
            </p>
          </Reveal>

          {/* Contact */}
          <Reveal delay={700}>
            <h2>Contact Us</h2>
            <div className="contact-box">
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                Questions about these terms?
              </p>
              <p style={{ margin: '0.5rem 0 0 0' }}>
                Email us at{' '}
                <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.brassLight, textDecoration: 'none' }}>
                  privacy@restpoint.co.ke
                </a>
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                We typically respond within 2 business days
              </p>
            </div>
          </Reveal>

          {/* Footer */}
          <footer>
            <span>© 2026 Rest Point. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="/privacy">Privacy Policy</a>
              <a href="/contact">Contact</a>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}