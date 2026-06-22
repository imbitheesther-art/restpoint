import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

// ============================================================
// PREMIUM STAFF LOGIN — Bank-Grade Professional Design
// Elegant, secure, dignified
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
    line: '#E3DDD0',
    lineDark: 'rgba(250,248,244,0.14)',
    gray: '#6B6862',
    grayLight: 'rgba(250,248,244,0.62)',
    red: '#9B4A3F',
    redBg: '#F7ECE9',
    redLine: '#E8D2CC',
    success: '#475A43',
    successBg: '#EEF3EC',
    white: '#FFFFFF',
    shadow: 'rgba(21,23,26,0.08)',
    shadowMed: 'rgba(21,23,26,0.12)',
    shadowLg: 'rgba(21,23,26,0.18)',
  },
  typography: {
    display: "'Fraunces', serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
};

// Logo
const Logo = ({ size = 24, color = THEME.colors.ink }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="1.2" />
    <path d="M16 8.5V23.5M9.5 16H22.5" stroke={color} strokeWidth="1.2" />
    <circle cx="16" cy="16" r="2.5" fill={color} />
  </svg>
);

const Spinner = () => (
  <span style={{
    width: '16px',
    height: '16px',
    border: '2px solid rgba(250,248,244,0.3)',
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
      padding: '0.95rem 1.1rem',
      borderRadius: '8px',
      fontSize: '0.88rem',
      fontWeight: 500,
      lineHeight: 1.5,
      animation: 'slideDown 0.3s cubic-bezier(0.16,1,0.3,1) both',
      marginBottom: '1.5rem',
    }} role="alert" aria-live="polite">
      {text}
    </div>
  );
};

const PasswordInput = ({ value, onChange, showPassword, onToggle, hasError, disabled }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{
        display: 'block',
        fontSize: '0.8rem',
        fontFamily: THEME.typography.mono,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: THEME.colors.brass,
        marginBottom: '0.6rem',
        fontWeight: 600,
      }}>
        Password
      </label>
      <div style={{
        position: 'relative',
        border: `2px solid ${hasError ? THEME.colors.red : isFocused ? THEME.colors.brass : THEME.colors.line}`,
        borderRadius: '8px',
        background: THEME.colors.white,
        transition: 'all 0.2s ease',
        boxShadow: isFocused ? `0 0 0 4px rgba(139,115,85,0.12)` : 'none',
      }}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter your password"
          disabled={disabled}
          style={{
            width: '100%',
            padding: '1rem 2.6rem 1rem 1.1rem',
            fontSize: '0.95rem',
            fontFamily: THEME.typography.body,
            border: 'none',
            borderRadius: '8px',
            background: 'transparent',
            color: THEME.colors.ink,
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          style={{
            position: 'absolute',
            right: '0.6rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: THEME.colors.gray,
            padding: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => !disabled && (e.target.style.color = THEME.colors.brass)}
          onMouseLeave={(e) => !disabled && (e.target.style.color = THEME.colors.gray)}
        >
          {showPassword ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {hasError && !value && (
        <span style={{ display: 'block', color: THEME.colors.red, fontSize: '0.75rem', marginTop: '0.4rem' }}>
          Password is required.
        </span>
      )}
    </div>
  );
};

// Main Component
export default function StaffLoginPage() {
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

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isFormValid = validateEmail(email) && password.length >= 6;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Enter both email and password.' });
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
        if (data.user?.role) localStorage.setItem('userRole', data.user.role);

        setSuccessName(data.user?.fullName || 'Director');
        setShowSuccess(true);

        setTimeout(() => {
          navigate('/dashboard');
        }, 1600);
      } else {
        setMessage({ 
          type: 'error', 
          text: data?.message || 'Credentials did not match our records.' 
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
      background: THEME.colors.bone,
      fontFamily: THEME.typography.body,
      display: 'flex',
      flexDirection: 'column',
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
        
        input:focus-visible, button:focus-visible {
          outline: 2px solid ${THEME.colors.brass};
          outline-offset: 2px;
        }
      `}</style>

      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.2rem 2rem',
        background: THEME.colors.white,
        borderBottom: `1px solid ${THEME.colors.line}`,
        animation: mounted ? 'fadeIn 0.5s ease 0ms both' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Logo size={22} color={THEME.colors.brass} />
          <span style={{
            fontFamily: THEME.typography.display,
            fontSize: '1.1rem',
            fontWeight: 500,
            color: THEME.colors.ink,
            letterSpacing: '-0.5px',
          }}>Rest Point</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: THEME.typography.mono, letterSpacing: '0.1em', textTransform: 'uppercase', color: THEME.colors.brass }}>
            Staff Portal
          </span>
          <button onClick={() => navigate('/register')} style={{
            padding: '0.6rem 1.2rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            border: `1px solid ${THEME.colors.brass}`,
            background: 'transparent',
            color: THEME.colors.brass,
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            fontFamily: THEME.typography.body,
          }} onMouseEnter={(e) => { e.target.style.background = THEME.colors.brass; e.target.style.color = THEME.colors.white; }} onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = THEME.colors.brass; }}>
            Start trial
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          animation: mounted ? 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 100ms both' : 'none',
        }}>
          
          {/* Card */}
          <div style={{
            background: THEME.colors.white,
            borderRadius: '12px',
            border: `1px solid ${THEME.colors.line}`,
            padding: '2.8rem 2.2rem',
            boxShadow: `0 20px 60px -16px ${THEME.colors.shadow}, 0 4px 12px ${THEME.colors.shadowMed}`,
          }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2.4rem' }}>
              <div style={{
                fontFamily: THEME.typography.display,
                fontSize: '2.1rem',
                fontWeight: 500,
                color: THEME.colors.ink,
                marginBottom: '0.6rem',
                lineHeight: 1.1,
              }}>
                Welcome back
              </div>
              <p style={{
                fontSize: '0.95rem',
                color: THEME.colors.gray,
                lineHeight: 1.6,
              }}>
                Sign in to manage your funeral home's operations with Rest Point.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <AlertMessage type={message.type} text={message.text} />

              {/* Email Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontFamily: THEME.typography.mono,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: THEME.colors.brass,
                  marginBottom: '0.6rem',
                  fontWeight: 600,
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (message.text) setMessage({ type: '', text: '' }); }}
                  placeholder="director@yourfuneralhome.co.ke"
                  disabled={loading}
                  autoFocus
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '1rem 1.1rem',
                    fontSize: '0.95rem',
                    fontFamily: THEME.typography.body,
                    border: `2px solid ${hasError && !email ? THEME.colors.red : THEME.colors.line}`,
                    borderRadius: '8px',
                    background: THEME.colors.bone2,
                    color: THEME.colors.ink,
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = THEME.colors.brass; e.target.style.background = THEME.colors.white; e.target.style.boxShadow = `0 0 0 4px rgba(139,115,85,0.12)`; }}
                  onBlur={(e) => { e.target.style.borderColor = hasError && !email ? THEME.colors.red : THEME.colors.line; e.target.style.background = THEME.colors.bone2; e.target.style.boxShadow = 'none'; }}
                />
                {hasError && !email && (
                  <span style={{ display: 'block', color: THEME.colors.red, fontSize: '0.75rem', marginTop: '0.4rem' }}>
                    Email is required.
                  </span>
                )}
              </div>

              {/* Password Input */}
              <PasswordInput
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (message.text) setMessage({ type: '', text: '' }); }}
                showPassword={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                hasError={hasError}
                disabled={loading}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isFormValid}
                style={{
                  width: '100%',
                  padding: '1rem 1.2rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  fontFamily: THEME.typography.body,
                  border: 'none',
                  borderRadius: '8px',
                  background: loading || !isFormValid ? THEME.colors.grayLight : THEME.colors.verdigris,
                  color: THEME.colors.bone,
                  cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.7rem',
                  minHeight: '52px',
                  opacity: loading || !isFormValid ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading && isFormValid) {
                    e.target.style.background = THEME.colors.verdigrisDark;
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = `0 8px 20px rgba(46,63,55,0.25)`;
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
                {loading && <Spinner />}
                <span>{loading ? 'Signing in...' : 'Sign in'}</span>
              </button>
            </form>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              margin: '2rem 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: THEME.colors.line }} />
              <span style={{ fontSize: '0.8rem', color: THEME.colors.gray }}>or</span>
              <div style={{ flex: 1, height: '1px', background: THEME.colors.line }} />
            </div>

            {/* Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <button onClick={() => navigate('/forgot-password')} style={{
                background: 'none',
                border: 'none',
                color: THEME.colors.brass,
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontFamily: THEME.typography.body,
                fontWeight: 500,
                textDecoration: 'underline',
                transition: 'color 0.2s ease',
              }} onMouseEnter={(e) => e.target.style.color = THEME.colors.brassLight} onMouseLeave={(e) => e.target.style.color = THEME.colors.brass}>
                Forgot your password?
              </button>
              <button onClick={() => navigate('/register')} style={{
                background: 'none',
                border: 'none',
                color: THEME.colors.brass,
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontFamily: THEME.typography.body,
                fontWeight: 500,
                textDecoration: 'underline',
                transition: 'color 0.2s ease',
              }} onMouseEnter={(e) => e.target.style.color = THEME.colors.brassLight} onMouseLeave={(e) => e.target.style.color = THEME.colors.brass}>
                Start a free trial
              </button>
            </div>

            {/* Family Portal Link */}
            <div style={{
              marginTop: '1.8rem',
              paddingTop: '1.8rem',
              borderTop: `1px solid ${THEME.colors.line}`,
              textAlign: 'center',
              fontSize: '0.9rem',
              color: THEME.colors.gray,
            }}>
              Family member? <button onClick={() => navigate('/portal/login')} style={{
                background: 'none',
                border: 'none',
                color: THEME.colors.verdigris,
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline',
                fontFamily: THEME.typography.body,
                transition: 'color 0.2s ease',
              }} onMouseEnter={(e) => e.target.style.color = THEME.colors.verdigrisDark} onMouseLeave={(e) => e.target.style.color = THEME.colors.verdigris}>
                Access the family portal
              </button>
            </div>

            {/* Security Badge */}
            <div style={{
              marginTop: '1.8rem',
              paddingTop: '1.8rem',
              borderTop: `1px solid ${THEME.colors.line}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: THEME.colors.gray,
              fontFamily: THEME.typography.mono,
              letterSpacing: '0.05em',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Enterprise-grade security</span>
            </div>
          </div>

          {/* Trust Badges */}
          <div style={{
            display: 'flex',
            gap: '0.8rem',
            justifyContent: 'center',
            marginTop: '2rem',
            flexWrap: 'wrap',
            animation: mounted ? 'fadeIn 0.6s ease 300ms both' : 'none',
          }}>
            {[
              { icon: '🔐', label: 'Encrypted' },
              { icon: '✓', label: 'Verified' },
              { icon: '⚡', label: 'Fast' },
            ].map((badge) => (
              <div key={badge.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                background: THEME.colors.white,
                border: `1px solid ${THEME.colors.line}`,
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: THEME.colors.gray,
                fontWeight: 500,
              }}>
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(21,23,26,0.88)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: THEME.colors.white,
            borderRadius: '12px',
            padding: '2.5rem',
            textAlign: 'center',
            maxWidth: '360px',
            animation: 'popIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: THEME.colors.successBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.2rem',
              color: THEME.colors.success,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 style={{
              fontFamily: THEME.typography.display,
              fontSize: '1.4rem',
              color: THEME.colors.ink,
              marginBottom: '0.6rem',
              fontWeight: 500,
            }}>
              Welcome, {successName}
            </h3>
            <p style={{ fontSize: '0.9rem', color: THEME.colors.gray, lineHeight: 1.6 }}>
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${THEME.colors.line}`,
        padding: '1.5rem 2rem',
        textAlign: 'center',
        background: THEME.colors.white,
        animation: mounted ? 'fadeIn 0.5s ease 400ms both' : 'none',
      }}>
        <nav style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
            { label: 'Support', href: '/support' },
          ].map((link) => (
            <a key={link.label} href={link.href} style={{
              fontSize: '0.8rem',
              color: THEME.colors.gray,
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }} onMouseEnter={(e) => e.target.style.color = THEME.colors.brass} onMouseLeave={(e) => e.target.style.color = THEME.colors.gray}>
              {link.label}
            </a>
          ))}
        </nav>
        <p style={{ fontSize: '0.75rem', color: THEME.colors.gray, margin: 0 }}>
          © 2026 Rest Point. All rights reserved. Built for East African funeral professionals.
        </p>
      </footer>
    </div>
  );
}