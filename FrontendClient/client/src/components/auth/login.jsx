import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

// ============================================================
// REST POINT LOGIN — Clean, simple, elegant
// ============================================================

const THEME = {
  colors: {
    ink: '#15171A',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    brassLight: '#A98F6E',
    verdigris: '#3D4F47',
    verdigrisDark: '#2E3F37',
    verdigrisLight: '#4D6359',
    line: '#E3DDD0',
    gray: '#6B6862',
    red: '#9B4A3F',
    redBg: '#F7ECE9',
    redLine: '#E8D2CC',
    success: '#475A43',
    successBg: '#EEF3EC',
    white: '#FFFFFF',
    shadow: 'rgba(21,23,26,0.08)',
    shadowMed: 'rgba(21,23,26,0.12)',
  },
  typography: {
    display: "'Fraunces', serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
};

const Logo = ({ size = 24, color = THEME.colors.ink }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="1.2" />
    <path d="M16 8.5V23.5M9.5 16H22.5" stroke={color} strokeWidth="1.2" />
    <circle cx="16" cy="16" r="2.5" fill={color} />
  </svg>
);

const Spinner = () => (
  <span style={{
    width: '18px',
    height: '18px',
    border: '2.5px solid rgba(250,248,244,0.3)',
    borderTopColor: THEME.colors.bone,
    borderRadius: '50%',
    animation: 'spin 0.65s linear infinite',
    display: 'inline-block',
  }} />
);

const AlertMessage = ({ type, text }) => {
  if (!text) return null;

  const config = {
    error: { bg: THEME.colors.redBg, color: THEME.colors.red, border: THEME.colors.redLine },
    success: { bg: THEME.colors.successBg, color: THEME.colors.success, border: '#DCE6D9' },
  };
  const style = config[type] || config.error;

  return (
    <div style={{
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      padding: '0.8rem 1rem',
      borderRadius: '8px',
      fontSize: '0.82rem',
      fontWeight: 500,
      lineHeight: 1.5,
      animation: 'slideDown 0.3s cubic-bezier(0.16,1,0.3,1) both',
      marginBottom: '1.2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
    }} role="alert">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {type === 'error' ? (
          <circle cx="12" cy="12" r="10" />
        ) : (
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        )}
        {type === 'error' ? (
          <line x1="12" y1="8" x2="12" y2="12" />
        ) : (
          <polyline points="20 6 9 17 4 12" />
        )}
        {type === 'error' && <line x1="12" y1="16" x2="12.01" y2="16" />}
      </svg>
      <span>{text}</span>
    </div>
  );
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [mounted, setMounted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successName, setSuccessName] = useState('');

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('authToken');
    if (token && token !== 'undefined' && token !== 'null') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = validateEmail(email) && password.length >= 6;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Please enter both email and password.' });
      return;
    }

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await authApi.login({
        email: email.trim(),
        password: password.trim(),
      });

      if (data && data.success) {
        const token = data.accessToken || data.token;
        if (!token) throw new Error('No token received');

        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('loginTime', new Date().toISOString());

        if (data.tenant) {
          localStorage.setItem('tenant', JSON.stringify(data.tenant));
          if (data.tenant.tenantSlug) localStorage.setItem('tenantSlug', data.tenant.tenantSlug);
          if (data.tenant.tenantId) localStorage.setItem('tenantId', data.tenant.tenantId.toString());
        }
        if (data.user?.dbName) localStorage.setItem('dbName', data.user.dbName);
        if (data.deploymentType) localStorage.setItem('deploymentType', data.deploymentType);
        if (data.user?.role) localStorage.setItem('userRole', data.user.role);

        setSuccessName(data.user?.fullName || 'Director');
        setShowSuccess(true);

        setTimeout(() => {
          // Navigate to tenant dashboard - tenant slug already contains branch info
          // BULLETPROOF: Multiple fallbacks to ensure navigation never fails
          const tenantSlug = data.tenant?.tenantSlug || data.user?.tenantSlug || 'default';

          // Save to localStorage as backup
          if (tenantSlug && tenantSlug !== 'default') {
            localStorage.setItem('tenantSlug', tenantSlug);
          }

          // Always navigate to tenant path
          navigate(`/tenant/${tenantSlug}/all-deceased`, { replace: true });
        }, 1600);
      } else {
        setMessage({
          type: 'error',
          text: data?.message || 'Invalid credentials. Please try again.'
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Connection error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }, [email, password, navigate]);

  const hasError = message.type === 'error';

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: THEME.typography.body,
      background: THEME.colors.bone,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${THEME.colors.bone}; }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .login-container {
          width: 100%;
          max-width: 880px;
          display: flex;
          background: ${THEME.colors.white};
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(21,23,26,0.10), 0 8px 24px rgba(21,23,26,0.05);
          min-height: 480px;
          max-height: 90vh;
        }

        .login-sidebar {
          width: 300px;
          background: linear-gradient(145deg, #15171A 0%, #2E3F37 100%);
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
          overflow: hidden;
        }
        .login-sidebar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: url('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80');
          background-size: cover;
          background-position: center;
          opacity: 0.07;
          mix-blend-mode: overlay;
        }
        .login-sidebar::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(ellipse at 30% 50%, rgba(61,79,71,0.1) 0%, transparent 70%);
        }
        .sidebar-content {
          position: relative;
          z-index: 1;
          color: ${THEME.colors.bone};
          text-align: center;
        }
        .sidebar-content .brand-mark {
          margin-bottom: 1.5rem;
        }
        .sidebar-content h1 {
          font-family: ${THEME.typography.display};
          font-size: 1.3rem;
          font-weight: 500;
          line-height: 1.3;
          margin-bottom: 0.6rem;
          letter-spacing: '-0.02em';
        }
        .sidebar-content p {
          font-size: 0.82rem;
          line-height: 1.6;
          opacity: 0.65;
        }

        .login-form {
          flex: 1;
          padding: 2.5rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: ${THEME.colors.white};
        }

        .login-form .form-header {
          margin-bottom: 1.8rem;
        }
        .login-form .form-header h2 {
          font-family: ${THEME.typography.display};
          font-size: 1.5rem;
          font-weight: 500;
          color: ${THEME.colors.ink};
          margin-bottom: 0.2rem;
          letter-spacing: '-0.02em';
        }
        .login-form .form-header p {
          font-size: 0.88rem;
          color: ${THEME.colors.gray};
        }

        .login-form .form-footer {
          margin-top: 1.2rem;
          padding-top: 1rem;
          border-top: 1px solid ${THEME.colors.line};
          text-align: center;
          font-size: 0.75rem;
          color: ${THEME.colors.gray};
        }

        .encrypted-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-top: 0.6rem;
          font-size: 0.6rem;
          font-family: ${THEME.typography.mono};
          letter-spacing: 0.05em;
          color: ${THEME.colors.gray};
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
            max-height: none;
            min-height: auto;
            border-radius: 16px;
          }
          .login-sidebar {
            width: 100%;
            padding: 1.8rem 1.5rem;
            min-height: 140px;
          }
          .login-form {
            padding: 2rem 1.5rem;
          }
          .login-form .form-header h2 {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 480px) {
          .login-container {
            border-radius: 12px;
          }
          .login-sidebar {
            padding: 1.5rem 1rem;
            min-height: 120px;
          }
          .login-form {
            padding: 1.5rem 1rem;
          }
          .sidebar-content h1 {
            font-size: 1.1rem;
          }
        }

        input:focus-visible, button:focus-visible {
          outline: 2px solid ${THEME.colors.brass};
          outline-offset: 2px;
        }
      `}</style>

      <div className="login-container">
        {/* SIDEBAR */}
        <div className="login-sidebar">
          <div className="sidebar-content">
            <div className="brand-mark">
              <Logo size={36} color={THEME.colors.brassLight} />
            </div>
            <h1>Rest Point</h1>
            <p>Sign in to access your funeral home registry.</p>
          </div>
        </div>

        {/* FORM */}
        <div className="login-form">
          <div className="form-header">
            <h2>Sign in to the registry</h2>
            <p>Enter your credentials to access your funeral home dashboard.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <AlertMessage type={message.type} text={message.text} />

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.7rem',
                fontFamily: THEME.typography.mono,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: THEME.colors.brass,
                marginBottom: '0.3rem',
                fontWeight: 600,
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (message.text) setMessage({ type: '', text: '' });
                }}
                placeholder="director@funeralhome.co.ke"
                disabled={loading}
                autoFocus
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  fontSize: '0.9rem',
                  fontFamily: THEME.typography.body,
                  border: `2px solid ${hasError && !email ? THEME.colors.red : THEME.colors.line}`,
                  borderRadius: '8px',
                  background: THEME.colors.bone2,
                  color: THEME.colors.ink,
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = THEME.colors.brass;
                  e.target.style.background = THEME.colors.white;
                  e.target.style.boxShadow = `0 0 0 3px rgba(139,115,85,0.08)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = hasError && !email ? THEME.colors.red : THEME.colors.line;
                  e.target.style.background = THEME.colors.bone2;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {hasError && !email && (
                <span style={{
                  display: 'block',
                  color: THEME.colors.red,
                  fontSize: '0.7rem',
                  marginTop: '0.3rem',
                  fontWeight: 500,
                }}>
                  Email is required.
                </span>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.7rem',
                fontFamily: THEME.typography.mono,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: THEME.colors.brass,
                marginBottom: '0.3rem',
                fontWeight: 600,
              }}>
                Password
              </label>
              <div style={{
                position: 'relative',
                border: `2px solid ${hasError && !password ? THEME.colors.red : THEME.colors.line}`,
                borderRadius: '8px',
                background: THEME.colors.bone2,
                transition: 'all 0.2s ease',
              }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (message.text) setMessage({ type: '', text: '' });
                  }}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '0.7rem 2.6rem 0.7rem 1rem',
                    fontSize: '0.9rem',
                    fontFamily: THEME.typography.body,
                    border: 'none',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: THEME.colors.ink,
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.parentElement.style.borderColor = THEME.colors.brass;
                    e.target.parentElement.style.background = THEME.colors.white;
                    e.target.parentElement.style.boxShadow = `0 0 0 3px rgba(139,115,85,0.08)`;
                  }}
                  onBlur={(e) => {
                    e.target.parentElement.style.borderColor = hasError && !password ? THEME.colors.red : THEME.colors.line;
                    e.target.parentElement.style.background = THEME.colors.bone2;
                    e.target.parentElement.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    color: THEME.colors.gray,
                    padding: '0.3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s ease',
                    opacity: loading ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => { if (!loading) e.target.style.color = THEME.colors.brass; }}
                  onMouseLeave={(e) => { e.target.style.color = THEME.colors.gray; }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {hasError && !password && (
                <span style={{
                  display: 'block',
                  color: THEME.colors.red,
                  fontSize: '0.7rem',
                  marginTop: '0.3rem',
                  fontWeight: 500,
                }}>
                  Password is required.
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              style={{
                width: '100%',
                padding: '0.75rem 1.2rem',
                fontSize: '0.88rem',
                fontWeight: 600,
                fontFamily: THEME.typography.body,
                border: 'none',
                borderRadius: '8px',
                background: loading || !isFormValid ? THEME.colors.grayLight : THEME.colors.verdigris,
                color: THEME.colors.bone,
                cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                minHeight: '44px',
                opacity: loading || !isFormValid ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading && isFormValid) {
                  e.target.style.background = THEME.colors.verdigrisDark;
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = `0 6px 20px rgba(46,63,55,0.25)`;
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && isFormValid) {
                  e.target.style.background = THEME.colors.verdigris;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <Spinner />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}>
            <button
              onClick={() => navigate('/forgot-password')}
              style={{
                background: 'none',
                border: 'none',
                color: THEME.colors.brass,
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontFamily: THEME.typography.body,
                fontWeight: 500,
                transition: 'all 0.2s ease',
                padding: '0.2rem',
              }}
              onMouseEnter={(e) => e.target.style.color = THEME.colors.brassLight}
              onMouseLeave={(e) => e.target.style.color = THEME.colors.brass}
            >
              Forgot password?
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: 'none',
                border: 'none',
                color: THEME.colors.verdigris,
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontFamily: THEME.typography.body,
                fontWeight: 500,
                transition: 'all 0.2s ease',
                padding: '0.2rem',
              }}
              onMouseEnter={(e) => e.target.style.color = THEME.colors.verdigrisDark}
              onMouseLeave={(e) => e.target.style.color = THEME.colors.verdigris}
            >
              Start free trial
            </button>
          </div>

          {/* Footer with encrypted badge */}
          <div className="form-footer">
            <span>Family member? </span>
            <button
              onClick={() => navigate('/portal/login')}
              style={{
                background: 'none',
                border: 'none',
                color: THEME.colors.verdigris,
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline',
                fontFamily: THEME.typography.body,
                transition: 'color 0.2s ease',
                fontSize: '0.78rem',
                padding: '0.2rem',
              }}
              onMouseEnter={(e) => e.target.style.color = THEME.colors.verdigrisDark}
              onMouseLeave={(e) => e.target.style.color = THEME.colors.verdigris}
            >
              Access family portal
            </button>

            <div className="encrypted-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Encrypted connection</span>
              <span style={{ opacity: 0.3, margin: '0 0.3rem' }}>·</span>
              <span>© 2026 Rest Point</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(21,23,26,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease both',
        }}>
          <div style={{
            background: THEME.colors.white,
            borderRadius: '14px',
            padding: '2.5rem 2.2rem 2.2rem',
            textAlign: 'center',
            maxWidth: '320px',
            width: '90%',
            animation: 'popIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
            boxShadow: `0 40px 80px rgba(21,23,26,0.3)`,
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: THEME.colors.successBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: THEME.colors.success,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 style={{
              fontFamily: THEME.typography.display,
              fontSize: '1.3rem',
              color: THEME.colors.ink,
              marginBottom: '0.3rem',
              fontWeight: 500,
            }}>
              Welcome, {successName}
            </h3>
            <p style={{
              fontSize: '0.85rem',
              color: THEME.colors.gray,
              lineHeight: 1.5,
              marginBottom: '1.2rem',
            }}>
              Redirecting to your dashboard...
            </p>
            <div style={{
              width: '60%',
              height: '3px',
              background: THEME.colors.line,
              borderRadius: '2px',
              margin: '0 auto',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: THEME.colors.verdigris,
                borderRadius: '2px',
                animation: 'shimmer 1.2s ease infinite',
                backgroundSize: '200% 100%',
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}