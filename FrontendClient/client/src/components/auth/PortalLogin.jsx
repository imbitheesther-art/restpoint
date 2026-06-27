
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

const THEME = {
  colors: {
    ink: '#15171A',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    verdigris: '#3D4F47',
    verdigrisDark: '#2E3F37',
    line: '#E3DDD0',
    gray: '#6B6862',
    grayLight: 'rgba(21,23,26,0.04)',
    red: '#9B4A3F',
    redBg: '#F7ECE9',
    redLine: '#E8D2CC',
    success: '#475A43',
    successBg: '#EEF3EC',
    white: '#FFFFFF',
    shadow: 'rgba(21,23,26,0.06)',
    shadowMed: 'rgba(21,23,26,0.10)',
  },
  typography: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
};

const Spinner = () => (
  <span style={{
    width: '18px',
    height: '18px',
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
      padding: '0.9rem 1.1rem',
      borderRadius: '8px',
      fontSize: '0.85rem',
      fontWeight: 500,
      lineHeight: 1.5,
      animation: 'slideDown 0.3s cubic-bezier(0.16,1,0.3,1) both',
      marginBottom: '1.5rem',
    }} role="alert" aria-live="polite">
      {text}
    </div>
  );
};

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

        setMessage({ type: 'success', text: 'Secure access link generated. Transferring...' });
        setTimeout(() => navigate('/portal/dashboard'), 1500);
      } else {
        setMessage({
          type: 'error',
          text: data?.message || 'The specified identity reference could not be verified.'
        });
      }
    } catch (error) {
      console.error('Portal login error:', error);
      setMessage({
        type: 'error',
        text: 'System connection latency. Please verify connection and retry.'
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
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${THEME.colors.bone}; margin: 0; }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        input:focus-visible, button:focus-visible {
          outline: 2px solid ${THEME.colors.brass};
          outline-offset: 2px;
        }
      `}</style>

      <div style={{
        width: '100%',
        maxWidth: '480px',
        animation: mounted ? 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both' : 'none',
      }}>

        {/* Bank-style card with image on top */}
        <div style={{
          background: THEME.colors.white,
          borderRadius: '20px',
          border: `1px solid ${THEME.colors.line}`,
          overflow: 'hidden',
          boxShadow: `0 24px 48px -12px ${THEME.colors.shadow}, 0 4px 16px ${THEME.colors.shadowMed}`,
        }}>

          {/* Large hero image on top */}
          <div style={{
            width: '100%',
            background: THEME.colors.verdigris,
            padding: '2.5rem 2rem',
            textAlign: 'center',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src="/familyportal.png"
              alt="Rest Point Family Portal"
              style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                margin: '0 auto',
                maxHeight: '160px',
                objectFit: 'contain',
                filter: 'brightness(1) drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              }}
            />
          </div>

          {/* Form content below image */}
          <div style={{
            padding: '2.5rem 2.2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <AlertMessage type={message.type} text={message.text} />

              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontFamily: THEME.typography.mono,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: THEME.colors.brass,
                  marginBottom: '0.6rem',
                  fontWeight: 500,
                }}>
                  Registered Phone Identity
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
                    padding: '1.1rem 1.2rem',
                    fontSize: '1.05rem',
                    fontFamily: THEME.typography.body,
                    border: `1px solid ${THEME.colors.line}`,
                    borderRadius: '8px',
                    background: THEME.colors.bone2,
                    color: THEME.colors.ink,
                    transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                    outline: 'none',
                    fontWeight: '500',
                    letterSpacing: '0.02em'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = THEME.colors.brass;
                    e.target.style.background = THEME.colors.white;
                    e.target.style.boxShadow = `0 0 0 4px rgba(139,115,85,0.08)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = THEME.colors.line;
                    e.target.style.background = THEME.colors.bone2;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !isValidPhone(phone)}
                style={{
                  width: '100%',
                  padding: '1.1rem 1.5rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  fontFamily: THEME.typography.body,
                  border: 'none',
                  borderRadius: '8px',
                  background: loading || !isValidPhone(phone)
                    ? 'rgba(61, 79, 71, 0.45)'
                    : THEME.colors.verdigris,
                  color: THEME.colors.bone,
                  cursor: loading || !isValidPhone(phone) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.7rem',
                  minHeight: '54px',
                }}
                onMouseEnter={(e) => {
                  if (!loading && isValidPhone(phone)) {
                    e.target.style.background = THEME.colors.verdigrisDark;
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = `0 12px 24px -6px rgba(61,79,71,0.3)`;
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
                <span>{loading ? 'Authorizing Access Link...' : 'Request Secure Access Link'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}