import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

// ============================================================
// PROFESSIONAL FAMILY PORTAL LOGIN
// Clean, maintainable, accessible design
// ============================================================

// Design System Constants
const THEME = {
  colors: {
    primary: '#1a1a2e',
    secondary: '#c9a84c',
    secondaryHover: '#a8883a',
    secondaryLight: '#e8d5a3',
    background: '#f7f5f0',
    cardBg: '#ffffff',
    textPrimary: '#1a1a2e',
    textSecondary: '#4a4a5a',
    textMuted: '#8a8a9a',
    border: '#e8e4de',
    error: '#9e2a2b',
    errorBg: '#fdf0ef',
    errorBorder: '#f5d6d6',
    success: '#2d6a4f',
    successBg: '#eef6ef',
    successBorder: '#d4e6d6',
    white: '#ffffff',
    shadow: 'rgba(26, 26, 46, 0.10)',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heroTitle: '20px',
    heroSubtitle: '18px',
    body: '14px',
    small: '12px',
    tiny: '11px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '40px',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
  },
};

// Utility Functions
const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
};

const getRawPhone = (formatted) => formatted.replace(/\D/g, '');

const isValidPhone = (phone) => {
  const raw = getRawPhone(phone);
  return raw.length >= 10;
};

// Custom Hooks
const useFormState = (initialState) => {
  const [state, setState] = useState(initialState);
  
  const update = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const reset = useCallback(() => {
    setState(initialState);
  }, [initialState]);
  
  return [state, update, reset];
};

// Sub-Components
const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 34 34" fill="none" aria-hidden="true">
    <circle cx="17" cy="17" r="15.5" stroke={THEME.colors.secondary} strokeWidth="1.5" />
    <path d="M17 9V25M9 17H25" stroke={THEME.colors.secondary} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="17" cy="17" r="3" fill={THEME.colors.secondary} />
  </svg>
);

const Spinner = () => (
  <span className="spinner" aria-label="Loading" />
);

const AlertMessage = ({ type, text }) => {
  if (!text) return null;
  
  const styles = {
    error: {
      background: THEME.colors.errorBg,
      color: THEME.colors.error,
      border: `1px solid ${THEME.colors.errorBorder}`,
    },
    success: {
      background: THEME.colors.successBg,
      color: THEME.colors.success,
      border: `1px solid ${THEME.colors.successBorder}`,
    },
  };
  
  return (
    <div 
      className="alert-message"
      style={styles[type] || styles.error}
      role="alert"
      aria-live="polite"
    >
      {text}
    </div>
  );
};

const Footer = () => (
  <footer className="portal-footer">
    <p className="footer-text">
      Need help? Contact your funeral home.
    </p>
    <nav className="footer-links" aria-label="Legal and contact links">
      <a href="/privacy" className="footer-link">Privacy</a>
      <span className="footer-divider" aria-hidden="true">|</span>
      <a href="/terms" className="footer-link">Terms</a>
      <span className="footer-divider" aria-hidden="true">|</span>
      <a href="/contact" className="footer-link">Contact</a>
    </nav>
  </footer>
);

// Main Component
export default function PortalLoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [formState, setFormState, resetFormState] = useFormState({
    loading: false,
    message: { type: '', text: '' },
  });

  const handlePhoneChange = useCallback((e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    // Clear error when user starts typing
    if (formState.message.text) {
      setFormState({ message: { type: '', text: '' } });
    }
  }, [formState.message.text, setFormState]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!isValidPhone(phone)) {
      setFormState({
        message: { 
          type: 'error', 
          text: 'Please enter a valid phone number (at least 10 digits).' 
        },
      });
      return;
    }

    setFormState({ loading: true, message: { type: '', text: '' } });

    try {
      const rawPhone = getRawPhone(phone);
      const data = await authApi.portalLogin({ phone: rawPhone });
      
      if (data?.success) {
        // Store authentication data
        localStorage.setItem('sessionToken', data.sessionToken || data.session_token);
        localStorage.setItem('tenantSlug', data.tenantSlug);
        localStorage.setItem('deceasedId', data.deceased?.deceased_id);
        
        // Navigate to dashboard
        navigate('/portal/dashboard');
      } else {
        setFormState({
          message: { 
            type: 'error', 
            text: data?.message || 'Phone number not found. Please try again.' 
          },
        });
      }
    } catch (error) {
      console.error('Portal login error:', error);
      setFormState({
        message: { 
          type: 'error', 
          text: 'Unable to connect to server. Please check your connection and try again.' 
        },
      });
    } finally {
      setFormState({ loading: false });
    }
  }, [phone, setFormState, navigate]);

  const isFormValid = isValidPhone(phone);
  const isLoading = formState.loading;

  return (
    <div className="portal-login-container">
      <style>{`
        /* ============================================
           GLOBAL STYLES
           ============================================ */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        .portal-login-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: ${THEME.colors.background};
          font-family: ${THEME.typography.fontFamily};
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* ============================================
           HERO IMAGE SECTION
           ============================================ */
        .hero-section {
          position: relative;
          width: 100%;
          height: 45vh;
          min-height: 280px;
          max-height: 420px;
          overflow: hidden;
          background: linear-gradient(135deg, ${THEME.colors.primary} 0%, #2a2a4e 100%);
        }
        
        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          opacity: 0.9;
        }
        
        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(26, 26, 46, 0.3) 0%,
            rgba(26, 26, 46, 0.1) 50%,
            rgba(26, 26, 46, 0.4) 100%
          );
        }
        
        /* ============================================
           CARD CONTAINER
           ============================================ */
        .card-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: ${THEME.spacing.lg} ${THEME.spacing.md} ${THEME.spacing.xxl};
          margin-top: -40px;
          position: relative;
          z-index: 1;
        }
        
        .login-card {
          width: 100%;
          max-width: 420px;
          background: ${THEME.colors.cardBg};
          border-radius: ${THEME.borderRadius.xl};
          padding: ${THEME.spacing.xxl} ${THEME.spacing.xl};
          box-shadow: 
            0 4px 6px ${THEME.colors.shadow},
            0 10px 40px ${THEME.colors.shadow};
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* ============================================
           HEADER SECTION
           ============================================ */
        .card-header {
          text-align: center;
          margin-bottom: ${THEME.spacing.xl};
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${THEME.spacing.sm};
          margin-bottom: ${THEME.spacing.md};
        }
        
        .logo-text {
          font-size: ${THEME.typography.heroTitle};
          font-weight: 700;
          color: ${THEME.colors.primary};
          letter-spacing: -0.5px;
        }
        
        .card-title {
          font-size: ${THEME.typography.heroSubtitle};
          font-weight: 600;
          color: ${THEME.colors.textPrimary};
          margin: ${THEME.spacing.xs} 0 ${THEME.spacing.sm};
        }
        
        .card-subtitle {
          font-size: ${THEME.typography.body};
          color: ${THEME.colors.textSecondary};
          line-height: 1.5;
          max-width: 280px;
          margin: 0 auto;
        }
        
        /* ============================================
           FORM ELEMENTS
           ============================================ */
        .form-group {
          margin-bottom: ${THEME.spacing.lg};
        }
        
        .form-label {
          display: block;
          font-size: ${THEME.typography.small};
          font-weight: 600;
          color: ${THEME.colors.textPrimary};
          margin-bottom: ${THEME.spacing.sm};
          letter-spacing: 0.3px;
        }
        
        .form-input {
          width: 100%;
          padding: ${THEME.spacing.md} ${THEME.spacing.md};
          font-size: ${THEME.typography.body};
          font-family: ${THEME.typography.fontFamily};
          border: 2px solid ${THEME.colors.border};
          border-radius: ${THEME.borderRadius.md};
          background: ${THEME.colors.background};
          color: ${THEME.colors.textPrimary};
          transition: all 0.2s ease;
          outline: none;
        }
        
        .form-input:focus {
          border-color: ${THEME.colors.secondary};
          background: ${THEME.colors.white};
          box-shadow: 0 0 0 4px rgba(201, 168, 76, 0.15);
        }
        
        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: ${THEME.colors.background};
        }
        
        .form-input::placeholder {
          color: ${THEME.colors.textMuted};
          opacity: 0.7;
        }
        
        .form-hint {
          display: block;
          font-size: ${THEME.typography.tiny};
          color: ${THEME.colors.textMuted};
          margin-top: ${THEME.spacing.sm};
          line-height: 1.4;
        }
        
        /* ============================================
           ALERT MESSAGES
           ============================================ */
        .alert-message {
          padding: ${THEME.spacing.md};
          border-radius: ${THEME.borderRadius.md};
          font-size: ${THEME.typography.small};
          font-weight: 500;
          line-height: 1.4;
          animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* ============================================
           BUTTONS
           ============================================ */
        .submit-button {
          width: 100%;
          padding: ${THEME.spacing.md} ${THEME.spacing.lg};
          font-size: ${THEME.typography.body};
          font-weight: 600;
          font-family: ${THEME.typography.fontFamily};
          border: none;
          border-radius: ${THEME.borderRadius.md};
          cursor: pointer;
          background: ${THEME.colors.secondary};
          color: ${THEME.colors.white};
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${THEME.spacing.sm};
          min-height: 52px;
        }
        
        .submit-button:hover:not(:disabled) {
          background: ${THEME.colors.secondaryHover};
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(201, 168, 76, 0.3);
        }
        
        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${THEME.spacing.sm};
        }
        
        /* ============================================
           SPINNER
           ============================================ */
        .spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: ${THEME.colors.white};
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* ============================================
           FOOTER
           ============================================ */
        .portal-footer {
          text-align: center;
          padding: ${THEME.spacing.md} ${THEME.spacing.md} ${THEME.spacing.sm};
          border-top: 1px solid ${THEME.colors.border};
          margin-top: ${THEME.spacing.lg};
        }
        
        .footer-text {
          font-size: ${THEME.typography.small};
          color: ${THEME.colors.textMuted};
          margin: 0 0 ${THEME.spacing.sm};
        }
        
        .footer-links {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: ${THEME.spacing.sm};
          flex-wrap: wrap;
        }
        
        .footer-link {
          font-size: ${THEME.typography.small};
          color: ${THEME.colors.textMuted};
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        
        .footer-link:hover {
          color: ${THEME.colors.textSecondary};
          text-decoration: underline;
        }
        
        .footer-divider {
          color: ${THEME.colors.border};
          user-select: none;
        }
        
        .security-badge {
          margin-top: ${THEME.spacing.md};
          font-size: ${THEME.typography.tiny};
          color: ${THEME.colors.textMuted};
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${THEME.spacing.xs};
        }
        
        /* ============================================
           RESPONSIVE DESIGN
           ============================================ */
        @media (min-width: ${THEME.breakpoints.mobile}) {
          .hero-section {
            height: 50vh;
            max-height: 500px;
          }
          
          .login-card {
            padding: ${THEME.spacing.xxl} ${THEME.spacing.xl};
          }
          
          .card-wrapper {
            padding: ${THEME.spacing.xl} ${THEME.spacing.lg} ${THEME.spacing.xxl};
          }
          
          .portal-footer {
            padding: ${THEME.spacing.md} ${THEME.spacing.md} ${THEME.spacing.sm};
          }
        }
        
        @media (min-width: ${THEME.breakpoints.tablet}) {
          .login-card {
            max-width: 440px;
          }
          
          .portal-footer {
            padding: ${THEME.spacing.md} ${THEME.spacing.md} ${THEME.spacing.sm};
          }
        }
        
        @media (min-width: ${THEME.breakpoints.desktop}) {
          .portal-login-container {
            max-width: 1440px;
            margin: 0 auto;
          }
          
          .portal-footer {
            padding: ${THEME.spacing.md} ${THEME.spacing.md} ${THEME.spacing.sm};
          }
        }
        
        /* ============================================
           ACCESSIBILITY
           ============================================ */
        @media (prefers-reduced-motion: reduce) {
          .login-card {
            animation: none;
          }
          
          .spinner {
            animation: none;
          }
          
          .submit-button {
            transition: none;
          }
        }
        
        /* Focus visible for keyboard navigation */
        .form-input:focus-visible,
        .submit-button:focus-visible,
        .footer-link:focus-visible {
          outline: 2px solid ${THEME.colors.secondary};
          outline-offset: 2px;
        }
      `}</style>

      {/* Hero Image Section */}
      <section className="hero-section" aria-label="Welcome banner">
        <img
          src="/familyportal.png"
          alt="Family Portal"
          className="hero-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="hero-overlay" aria-hidden="true" />
      </section>

      {/* Login Card */}
      <main className="card-wrapper">
        <div className="login-card">
          {/* Header */}
          <header className="card-header">
            <div className="logo-container">
              <Logo />
              <span className="logo-text">Rest Point</span>
            </div>
            <h1 className="card-title">Family Portal</h1>
            <p className="card-subtitle">
              Access your family's arrangements and stay connected
            </p>
          </header>

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="0712 345 678"
                disabled={isLoading}
                className="form-input"
                autoComplete="tel"
                autoFocus
                aria-describedby="phone-hint"
                aria-invalid={!isFormValid && phone.length > 0}
              />
              <span id="phone-hint" className="form-hint">
                Enter the phone number registered with the funeral home
              </span>
            </div>

            <AlertMessage 
              type={formState.message.type} 
              text={formState.message.text} 
            />

            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="submit-button"
              aria-busy={isLoading}
            >
              <span className="button-content">
                {isLoading && <Spinner />}
                <span>{isLoading ? 'Sending your link...' : 'Send me my private link'}</span>
              </span>
            </button>
          </form>

          {/* Footer */}
          <Footer />
          
          {/* Security Badge */}
          <div className="security-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Secured by Rest Point</span>
          </div>
        </div>
      </main>
    </div>
  );
}