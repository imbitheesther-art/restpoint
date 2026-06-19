import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

/* ============================================================
   REST POINT — Staff sign in
   Same system as the marketing site: ink, bone, brass, verdigris.
   Fraunces for display, Inter for UI, JetBrains Mono for labels.
   This is internal tooling for directors and staff — confident,
   quiet, no glow orbs, no emoji, no shouting caps.
   ============================================================ */

const C = {
  ink: '#15171A',
  bone: '#FAF8F4',
  bone2: '#F3EFE6',
  brass: '#8B7355',
  brassLight: '#A98F6E',
  verdigris: '#3D4F47',
  line: '#E3DDD0',
  lineDark: 'rgba(250,248,244,0.14)',
  gray: '#6B6862',
  grayLight: 'rgba(250,248,244,0.62)',
  red: '#9B4A3F',
  redBg: '#F7ECE9',
  redLine: '#E8D2CC',
};

const Mark = ({ size = 24, color = C.ink }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="1" />
    <path d="M16 8.5V23.5M9.5 16H22.5" stroke={color} strokeWidth="1" />
    <circle cx="16" cy="16" r="2.5" fill={color} />
  </svg>
);

const I = {
  eye:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  check:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
  lock:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  branches: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M6 8.5V15.5M8.3 7.2 15.7 10.8M8.3 16.8 15.7 13.2"/></svg>,
  cloud:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M18 18H6a4 4 0 0 1-1-7.87A5.5 5.5 0 0 1 15.5 8a4.5 4.5 0 0 1 2.5 8.4"/></svg>,
  log:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>,
};

function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authPopupData, setAuthPopupData] = useState({ success: false, message: '' });
  const [loaded, setLoaded] = useState(false);
  const [nightBlocked, setNightBlocked] = useState(false);

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 60); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token === 'undefined' || token === 'null') {
      localStorage.clear();
    }
  }, []);

  // Night-time access restriction: block logins between midnight and 4 AM (EAT)
  useEffect(() => {
    const checkNightRestriction = () => {
      const now = new Date();
      // Convert to East Africa Time (UTC+3)
      const eatHour = (now.getUTCHours() + 3) % 24;
      if (eatHour >= 0 && eatHour < 4) {
        setNightBlocked(true);
      } else {
        setNightBlocked(false);
      }
    };
    checkNightRestriction();
    const interval = setInterval(checkNightRestriction, 60000); // check every minute
    return () => clearInterval(interval);
  }, []);

  const setCookie = (name, value, days) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Block login during night hours (midnight to 4 AM EAT)
    if (nightBlocked) {
      setMessage({ type: 'error', text: 'Access is restricted between midnight and 4 AM (EAT). This is a security measure to protect your data. Please try again during business hours.' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (!identifier.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Enter both your email and password.' });
      setIsLoading(false);
      return;
    }

    try {
      const data = await authApi.login({
        email: identifier.trim(),
        password: password.trim()
      });

      if (data && data.success) {
        const token = data.accessToken || data.token;

        if (!token) {
          throw new Error('No token received from server');
        }

        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('loginTime', new Date().toISOString());

        if (data.tenant) {
          localStorage.setItem('tenant', JSON.stringify(data.tenant));
          if (data.tenant.tenantSlug) localStorage.setItem('tenantSlug', data.tenant.tenantSlug);
          if (data.tenant.tenantId) localStorage.setItem('tenantId', data.tenant.tenantId.toString());
          if (data.tenant.dbName) localStorage.setItem('dbName', data.tenant.dbName);
        }
        if (data.tenantSlug) localStorage.setItem('tenantSlug', data.tenantSlug);
        if (data.user?.role) localStorage.setItem('userRole', data.user.role);

        setCookie('authToken', token, 7);
        if (data.user?.role) setCookie('userRole', data.user.role, 7);
        if (data.tenant?.tenantSlug) setCookie('tenantSlug', data.tenant.tenantSlug, 7);

        setMessage({ type: 'success', text: 'Signed in. Taking you to the dashboard.' });
        setAuthPopupData({ success: true, message: `Welcome, ${data.user?.fullName || 'there'}.` });
        setShowAuthPopup(true);

        setTimeout(() => {
          setShowAuthPopup(false);
          navigate('/dashboard');
        }, 1400);

      } else {
        setMessage({ type: 'error', text: data?.message || 'Those credentials did not match our records.' });
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'We could not reach the server. Please try again.' });
      setIsLoading(false);
    }
  };

  const hasError = message.type === 'error';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;background:${C.bone};}
        body{overflow-x:hidden;background:${C.bone};color:${C.gray};font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
        ::selection{background:rgba(139,115,85,0.18);color:${C.ink};}

        .lg-inp:focus{outline:none;border-color:${C.brass}!important;box-shadow:0 0 0 3px rgba(139,115,85,0.12);}

        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeUp .45s cubic-bezier(0.16,1,0.3,1) both;}

        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{width:14px;height:14px;border:2px solid rgba(250,248,244,0.35);border-top-color:${C.bone};border-radius:50%;animation:spin .65s linear infinite;display:inline-block;}

        .label-mono{font-family:'JetBrains Mono',monospace;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:${C.brass};}

        @media (max-width: 860px) {
          .login-grid { grid-template-columns: 1fr !important; }
          .login-left { display: none !important; }
          .login-right { padding: 2.4rem 1.8rem !important; }
        }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
        background: 'rgba(250,248,244,0.92)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${C.line}`, padding: '1.1rem 0',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Mark size={20} />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.05rem', fontWeight: 500, color: C.ink }}>Rest Point</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="label-mono">Staff sign in</span>
            <button
              onClick={() => navigate('/register')}
              style={{ background: C.ink, color: C.bone, border: 'none', padding: '.6rem 1.2rem', borderRadius: '2px', fontSize: '.8rem', fontWeight: 500, cursor: 'pointer', transition: 'background .2s', fontFamily: "'Inter', sans-serif" }}
              onMouseEnter={(e) => { e.target.style.background = '#000'; }}
              onMouseLeave={(e) => { e.target.style.background = C.ink; }}
            >Start trial</button>
          </div>
        </div>
      </nav>

      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '76px', paddingBottom: '2rem', background: C.bone }}>
        <div style={{
          maxWidth: '980px', width: '100%', margin: '0 auto', padding: '1.5rem',
          opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)'
        }}>
          <div className="login-grid" style={{ display: 'grid', gridTemplateColumns: '0.95fr 1fr', border: `1px solid ${C.line}`, boxShadow: '0 30px 70px -24px rgba(21,23,26,0.18)' }}>

            {/* Left panel — case record visual, ink */}
            <div className="login-left" style={{ background: C.ink, padding: '3rem 2.6rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="label-mono" style={{ marginBottom: '2.2rem' }}>Case No. 0142 · Status — arranged</div>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2rem', fontWeight: 500, color: C.bone, marginBottom: '.9rem', lineHeight: 1.15 }}>
                  The register, kept by your team.
                </h1>
                <p style={{ fontSize: '.92rem', color: C.grayLight, lineHeight: 1.7, maxWidth: '300px' }}>
                  Sign in to manage cases, dispatch, documents, and billing across every branch you run.
                </p>
              </div>

              <div style={{ borderTop: `1px solid ${C.lineDark}`, paddingTop: '1.6rem' }}>
                {[
                  [I.lock, 'Encrypted at rest and in transit'],
                  [I.branches, 'Unlimited branches, one account'],
                  [I.cloud, 'Synced in real time, every device'],
                  [I.log, 'Every change kept in the audit log'],
                ].map(([icon, label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.85rem', color: C.brassLight }}>
                    {icon}
                    <span style={{ fontSize: '.82rem', color: C.grayLight, fontFamily: "'Inter', sans-serif" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel — form, bone */}
            <div className="login-right" style={{ background: C.bone, padding: '3rem 2.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div className="label-mono" style={{ marginBottom: '.7rem' }}>Welcome back</div>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', fontWeight: 500, color: C.ink, marginBottom: '.3rem' }}>Sign in to your account</h2>
                <p style={{ fontSize: '.86rem', color: C.gray }}>Enter your credentials to open the dashboard.</p>
              </div>

              <form onSubmit={handleLogin}>
                {message.text && (
                  <div className="fade-in" style={{
                    background: message.type === 'error' ? C.redBg : '#EEF3EC',
                    border: `1px solid ${message.type === 'error' ? C.redLine : '#DCE6D9'}`,
                    color: message.type === 'error' ? C.red : '#475A43',
                    padding: '.75rem .9rem', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '.82rem',
                    display: 'flex', alignItems: 'center', gap: '.5rem',
                  }}>
                    {message.type === 'error' ? null : I.check} {message.text}
                  </div>
                )}

                <div style={{ marginBottom: '1.1rem' }}>
                  <label className="label-mono" style={{ display: 'block', marginBottom: '.55rem', color: C.gray }}>Email address</label>
                  <input
                    type="email" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="director@yourfuneralhome.co.ke"
                    className="lg-inp"
                    style={{
                      width: '100%', padding: '.78rem .9rem', background: '#fff',
                      border: `1px solid ${hasError && !identifier ? C.red : C.line}`,
                      borderRadius: '4px', fontSize: '.92rem', color: C.ink,
                      transition: 'all .2s', fontFamily: "'Inter', sans-serif",
                    }}
                  />
                  {hasError && !identifier && <div style={{ color: C.red, fontSize: '.74rem', marginTop: '.3rem' }}>Email is required.</div>}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label-mono" style={{ display: 'block', marginBottom: '.55rem', color: C.gray }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="lg-inp"
                      style={{
                        width: '100%', padding: '.78rem 2.6rem .78rem .9rem', background: '#fff',
                        border: `1px solid ${hasError && !password ? C.red : C.line}`,
                        borderRadius: '4px', fontSize: '.92rem', color: C.ink,
                        transition: 'all .2s', fontFamily: "'Inter', sans-serif",
                      }}
                    />
                    <button
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '.7rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.gray, padding: '.2rem', display: 'flex' }}
                      onMouseEnter={(e) => e.target.style.color = C.ink}
                      onMouseLeave={(e) => e.target.style.color = C.gray}
                    >
                      {showPassword ? I.eyeOff : I.eye}
                    </button>
                  </div>
                  {hasError && !password && <div style={{ color: C.red, fontSize: '.74rem', marginTop: '.3rem' }}>Password is required.</div>}
                </div>

                <button
                  type="submit" disabled={isLoading}
                  style={{
                    width: '100%', background: isLoading ? C.line : C.ink, color: isLoading ? C.gray : C.bone,
                    border: 'none', padding: '.85rem', borderRadius: '2px', fontSize: '.88rem', fontWeight: 500,
                    cursor: isLoading ? 'default' : 'pointer', transition: 'background .2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={(e) => { if (!isLoading) e.target.style.background = '#000'; }}
                  onMouseLeave={(e) => { if (!isLoading) e.target.style.background = C.ink; }}
                >
                  {isLoading ? (<><span className="spinner" />Signing in…</>) : 'Sign in'}
                </button>

                <div style={{ marginTop: '1.1rem', textAlign: 'center' }}>
                  <button
                    type="button" onClick={() => navigate('/forgot-password')}
                    style={{ background: 'none', border: 'none', color: C.gray, cursor: 'pointer', fontSize: '.82rem', fontFamily: "'Inter', sans-serif", textDecoration: 'underline', textDecorationColor: C.line }}
                    onMouseEnter={(e) => e.target.style.color = C.ink}
                    onMouseLeave={(e) => e.target.style.color = C.gray}
                  >
                    Forgot your password?
                  </button>
                </div>

                <div style={{ marginTop: '1.1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '.82rem', color: C.gray }}>
                    Don't have an account?{' '}
                    <button
                      type="button" onClick={() => navigate('/register')}
                      style={{ background: 'none', border: 'none', color: C.brass, cursor: 'pointer', fontSize: '.82rem', fontWeight: 500, fontFamily: "'Inter', sans-serif", textDecoration: 'underline', textDecorationColor: C.line }}
                      onMouseEnter={(e) => e.target.style.color = C.brassLight}
                      onMouseLeave={(e) => e.target.style.color = C.brass}
                    >
                      Start a free trial
                    </button>
                  </p>
                </div>

                <div style={{ marginTop: '.9rem', paddingTop: '.9rem', borderTop: `1px solid ${C.line}`, textAlign: 'center' }}>
                  <p style={{ fontSize: '.8rem', color: C.gray }}>
                    Are you a family member?{' '}
                    <button
                      type="button" onClick={() => navigate('/portal/login')}
                      style={{ background: 'none', border: 'none', color: C.verdigris, cursor: 'pointer', fontSize: '.8rem', fontWeight: 500, fontFamily: "'Inter', sans-serif", textDecoration: 'underline', textDecorationColor: C.line }}
                    >
                      Open the family portal
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {showAuthPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(21,23,26,0.88)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
        }}>
          <div className="fade-in" style={{
            background: C.bone, border: `1px solid ${C.line}`, padding: '2.4rem',
            textAlign: 'center', maxWidth: '360px', width: '100%',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%', background: C.bone2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.3rem', color: C.verdigris,
            }}>
              {I.check}
            </div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.3rem', color: C.ink, marginBottom: '.5rem', fontWeight: 500 }}>
              {authPopupData.success ? 'Welcome' : 'Signing in…'}
            </h3>
            <p style={{ fontSize: '.86rem', color: C.gray, lineHeight: 1.6 }}>{authPopupData.message}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: C.ink, color: C.grayLight, padding: '3.5rem 0 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.75rem' }}>
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
              <a href="/#capabilities" style={{ display: 'block', fontSize: '0.88rem', color: C.grayLight, marginBottom: '0.7rem', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = C.grayLight}>Capabilities</a>
              <a href="/#pricing" style={{ display: 'block', fontSize: '0.88rem', color: C.grayLight, marginBottom: '0.7rem', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = C.grayLight}>Pricing</a>
              <a href="/#faq" style={{ display: 'block', fontSize: '0.88rem', color: C.grayLight, marginBottom: '0.7rem', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = C.grayLight}>Questions</a>
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
    </>
  );
}

export default LoginPage;