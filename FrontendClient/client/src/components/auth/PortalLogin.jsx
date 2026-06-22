import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

// ============================================================
// PREMIUM FAMILY PORTAL LOGIN — Bank-Grade Design
// Luxury aesthetic, dignified, secure, professional
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
  },
  typography: {
    display: "'Fraunces', serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
};

// Logo Component
const Logo = ({ size = 24, color = THEME.colors.ink }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="1.2" />
    <path d="M16 8.5V23.5M9.5 16H22.5" stroke={color} strokeWidth="1.2" />
    <circle cx="16" cy="16" r="2.5" fill={color} />
  </svg>
);

// Spinner
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

// Alert Component
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
      padding: '0.9rem 1rem',
      borderRadius: '6px',
      fontSize: '0.85rem',
      fontWeight: 500,
      lineHeight: 1.5,
      animation: 'slideDown 0.3s cubic-bezier(0.16,1,0.3,1) both',
      marginBottom: '1.2rem',
    }} role="alert" aria-live="polite">
      {text}
    </div>
  );
};

// Main Component
export default function PortalLoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  const getRawPhone = (formatted) => formatted.replace(/\D/g, '');
  const isValidPhone = (p) => getRawPhone(p).length >= 10;

  const handlePhoneChange = useCallback((e) => {
    setPhone(formatPhoneNumber(e.target.value));
    if (message.text) setMessage({ type: '', text: '' });
  }, [message.text]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!isValidPhone(phone)) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const rawPhone = getRawPhone(phone);
      const data = await authApi.portalLogin({ phone: rawPhone });
      
      if (data?.success) {
        localStorage.setItem('sessionToken', data.sessionToken || data.session_token);
        localStorage.setItem('tenantSlug', data.tenantSlug);
        if (data.deceased?.deceased_id) {
          localStorage.setItem('deceasedId', data.deceased.deceased_id);
        }
        
        setMessage({ type: 'success', text: 'Link sent! Check your SMS.' });
        setTimeout(() => navigate('/portal/dashboard'), 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: data?.message || 'Phone number not found. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Portal login error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Connection error. Please check and try again.' 
      });
    } finally {
      setLoading(false);
    }
  }, [phone, navigate, message.text]);

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
        
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        input:focus-visible, button:focus-visible {
          outline: 2px solid ${THEME.colors.brass};
          outline-offset: 2px;
        }
      `}</style>

      {/* Navigation Bar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.2rem 2rem',
        background: THEME.colors.white,
        borderBottom: `1px solid ${THEME.colors.line}`,
        animation: mounted ? 'fadeIn 0.5s ease 0ms both' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
          <Logo size={22} color={THEME.colors.brass} />
          <span style={{
            fontFamily: THEME.typography.display,
            fontSize: '1.1rem',
            fontWeight: 500,
            color: THEME.colors.ink,
            letterSpacing: '-0.5px',
          }}>Rest Point</span>
        </div>
        <span style={{ fontSize: '0.75rem', fontFamily: THEME.typography.mono, letterSpacing: '0.1em', textTransform: 'uppercase', color: THEME.colors.brass }}>
          Family Portal
        </span>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{
          width: '100%',
          maxWidth: '460px',
          animation: mounted ? 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 100ms both' : 'none',
        }}>
          
          {/* Card */}
          <div style={{
            background: THEME.colors.white,
            borderRadius: '12px',
            border: `1px solid ${THEME.colors.line}`,
            padding: '2.5rem 2rem',
            boxShadow: `0 20px 60px -16px ${THEME.colors.shadow}, 0 4px 12px ${THEME.colors.shadowMed}`,
          }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2.2rem' }}>
              <div style={{
                fontFamily: THEME.typography.display,
                fontSize: '2rem',
                fontWeight: 500,
                color: THEME.colors.ink,
                marginBottom: '0.4rem',
                lineHeight: 1.1,
              }}>
                Your Arrangement
              </div>
              <p style={{
                fontSize: '0.95rem',
                color: THEME.colors.gray,
                lineHeight: 1.6,
                maxWidth: '320px',
                margin: '0 auto',
              }}>
                Enter your phone number to access your family's care details, documents, and payment information.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <AlertMessage type={message.type} text={message.text} />

              {/* Phone Input */}
              <div style={{ marginBottom: '1.8rem' }}>
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="0712 345 678"
                  disabled={loading}
                  autoFocus
                  autoComplete="tel"
                  style={{
                    width: '100%',
                    padding: '1rem 1.1rem',
                    fontSize: '1rem',
                    fontFamily: THEME.typography.body,
                    border: `2px solid ${THEME.colors.line}`,
                    borderRadius: '8px',
                    background: THEME.colors.bone2,
                    color: THEME.colors.ink,
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    fontWeight: '500',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = THEME.colors.brass;
                    e.target.style.background = THEME.colors.white;
                    e.target.style.boxShadow = `0 0 0 4px rgba(139,115,85,0.12)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = THEME.colors.line;
                    e.target.style.background = THEME.colors.bone2;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <span style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: THEME.colors.gray,
                  marginTop: '0.5rem',
                  lineHeight: 1.4,
                }}>
                  The number you registered with the funeral home
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isValidPhone(phone)}
                style={{
                  width: '100%',
                  padding: '1rem 1.2rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  fontFamily: THEME.typography.body,
                  border: 'none',
                  borderRadius: '8px',
                  background: loading || !isValidPhone(phone) 
                    ? THEME.colors.grayLight 
                    : THEME.colors.verdigris,
                  color: THEME.colors.bone,
                  cursor: loading || !isValidPhone(phone) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.7rem',
                  minHeight: '52px',
                  opacity: loading || !isValidPhone(phone) ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading && isValidPhone(phone)) {
                    e.target.style.background = THEME.colors.verdigrisDark;
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = `0 8px 20px rgba(61,79,71,0.25)`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && isValidPhone(phone)) {
                    e.target.style.background = THEME.colors.verdigris;
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {loading && <Spinner />}
                <span>{loading ? 'Sending your link...' : 'Send me my link'}</span>
              </button>
            </form>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              margin: '1.8rem 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: THEME.colors.line }} />
              <span style={{ fontSize: '0.8rem', color: THEME.colors.gray }}>or</span>
              <div style={{ flex: 1, height: '1px', background: THEME.colors.line }} />
            </div>

            {/* Alternative Contact */}
            <div style={{
              padding: '1.2rem 1.4rem',
              background: THEME.colors.bone2,
              borderRadius: '8px',
              fontSize: '0.9rem',
              color: THEME.colors.gray,
              lineHeight: 1.6,
              textAlign: 'center',
            }}>
              Need help? <a href="/contact" style={{ color: THEME.colors.brass, fontWeight: 600, textDecoration: 'none' }}>Contact your funeral home</a> directly.
            </div>

            {/* Security Info */}
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
              textAlign: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Secured & Encrypted • Your data is private</span>
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
              { icon: '🔒', label: 'Encrypted' },
              { icon: '✓', label: 'Verified' },
              { icon: '🛡️', label: 'Secure' },
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
            <a 
              key={link.label}
              href={link.href} 
              style={{
                fontSize: '0.8rem',
                color: THEME.colors.gray,
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.color = THEME.colors.brass}
              onMouseLeave={(e) => e.target.style.color = THEME.colors.gray}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <p style={{ fontSize: '0.75rem', color: THEME.colors.gray, margin: 0 }}>
          © 2026 Rest Point. All rights reserved. Built for East African families.
        </p>
      </footer>
    </div>
  );
}