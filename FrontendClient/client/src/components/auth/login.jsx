import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

// ============================================================
// PROFESSIONAL STAFF LOGIN
// Clean, maintainable, accessible design
// ============================================================

// Design System Constants
const THEME = {
  colors: {
    ink: '#15171A',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    brassHover: '#A98F6E',
    verdigris: '#3D4F47',
    line: '#E3DDD0',
    lineDark: 'rgba(250,248,244,0.14)',
    gray: '#6B6862',
    grayLight: 'rgba(250,248,244,0.62)',
    red: '#9B4A3F',
    redBg: '#F7ECE9',
    redLine: '#E8D2CC',
    white: '#FFFFFF',
    success: '#475A43',
    successBg: '#EEF3EC',
    successLine: '#DCE6D9',
    shadow: 'rgba(21,23,26,0.18)',
    overlay: 'rgba(21,23,26,0.88)',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    displayFamily: "'Fraunces', serif",
    monoFamily: "'JetBrains Mono', monospace",
    heroTitle: '2rem',
    sectionTitle: '1.5rem',
    body: '0.92rem',
    small: '0.82rem',
    tiny: '0.74rem',
  },
  spacing: {
    xs: '0.3rem',
    sm: '0.55rem',
    md: '0.78rem',
    lg: '1.1rem',
    xl: '1.5rem',
    xxl: '2rem',
    xxxl: '2.6rem',
  },
  borderRadius: {
    sm: '2px',
    md: '4px',
    lg: '8px',
    xl: '12px',
  },
  breakpoints: {
    mobile: '860px',
    tablet: '1024px',
    desktop: '1280px',
  },
};

// Utility Functions
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const isValidPassword = (password) => {
  return password.length >= 6;
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
const Logo = ({ size = 20, color = THEME.colors.ink }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="1" />
    <path d="M16 8.5V23.5M9.5 16H22.5" stroke={color} strokeWidth="1" />
    <circle cx="16" cy="16" r="2.5" fill={color} />
  </svg>
);

const Spinner = () => (
  <span className="spinner" aria-label="Loading" />
);

const AlertMessage = ({ type, text }) => {
  if (!text) return null;
  
  const config = {
    error: {
      bg: THEME.colors.redBg,
      border: THEME.colors.redLine,
      color: THEME.colors.red,
      icon: null,
    },
    success: {
      bg: THEME.colors.successBg,
      border: THEME.colors.successLine,
      color: THEME.colors.success,
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ),
    },
  };
  
  const style = config[type] || config.error;
  
  return (
    <div 
      className="alert-message"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
      }}
      role="alert"
      aria-live="polite"
    >
      {style.icon && <span style={{ marginRight: '0.5rem' }}>{style.icon}</span>}
      {text}
    </div>
  );
};

const PasswordInput = ({ value, onChange, showPassword, onToggle, hasError, disabled }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="input-group">
      <label className="input-label">Password</label>
      <div 
        className="password-wrapper"
        style={{
          position: 'relative',
          border: `1px solid ${hasError ? THEME.colors.red : isFocused ? THEME.colors.brass : THEME.colors.line}`,
          borderRadius: THEME.borderRadius.md,
          background: THEME.colors.white,
          transition: 'all 0.2s',
          boxShadow: isFocused ? `0 0 0 3px rgba(139,115,85,0.12)` : 'none',
        }}
      >
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter your password"
          disabled={disabled}
          className="input-field"
          style={{
            width: '100%',
            padding: `${THEME.spacing.md} ${THEME.spacing.xxl} ${THEME.spacing.md} ${THEME.spacing.md}`,
            background: 'transparent',
            border: 'none',
            borderRadius: THEME.borderRadius.md,
            fontSize: THEME.typography.body,
            color: THEME.colors.ink,
            fontFamily: THEME.typography.fontFamily,
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          style={{
            position: 'absolute',
            right: THEME.spacing.sm,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: THEME.colors.gray,
            padding: THEME.spacing.xs,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => !disabled && (e.currentTarget.style.color = THEME.colors.ink)}
          onMouseLeave={(e) => !disabled && (e.currentTarget.style.color = THEME.colors.gray)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {hasError && !value && (
        <span className="error-text">Password is required.</span>
      )}
    </div>
  );
};

const FeatureItem = ({ icon, label }) => (
  <div className="feature-item">
    <span style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexShrink: 0,
      color: THEME.colors.brassLight 
    }}>
      {icon}
    </span>
    <span style={{ 
      fontSize: THEME.typography.small, 
      color: THEME.colors.grayLight,
      fontFamily: THEME.typography.fontFamily,
    }}>
      {label}
    </span>
  </div>
);

const FooterLink = ({ href, children, onClick }) => (
  <a 
    href={href} 
    onClick={onClick}
    style={{
      fontSize: THEME.typography.small,
      color: THEME.colors.grayLight,
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'color 0.2s',
      background: 'none',
      border: 'none',
      fontFamily: THEME.typography.fontFamily,
    }}
    onMouseEnter={(e) => e.target.style.color = THEME.colors.white}
    onMouseLeave={(e) => e.target.style.color = THEME.colors.grayLight}
  >
    {children}
  </a>
);

// Main Component
export default function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState, resetFormState] = useFormState({
    loading: false,
    message: { type: '', text: '' },
  });
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authPopupData, setAuthPopupData] = useState({ success: false, message: '' });
  const [loaded, setLoaded] = useState(false);
  const [nightBlocked, setNightBlocked] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(timer);
  }, []);

  // Clear invalid tokens
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token === 'undefined' || token === 'null') {
      localStorage.clear();
    }
  }, []);

  // Night-time access restriction (midnight to 4 AM EAT)
  useEffect(() => {
    const checkNightRestriction = () => {
      const now = new Date();
      const eatHour = (now.getUTCHours() + 3) % 24;
      setNightBlocked(eatHour >= 0 && eatHour < 4);
    };
    
    checkNightRestriction();
    const interval = setInterval(checkNightRestriction, 60000);
    return () => clearInterval(interval);
  }, []);

  const setCookie = useCallback((name, value, days) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Night block check
    if (nightBlocked) {
      setFormState({
        message: { 
          type: 'error', 
          text: 'Access is restricted between midnight and 4 AM (EAT). This is a security measure to protect your data. Please try again during business hours.' 
        },
      });
      return;
    }

    // Validation
    if (!identifier.trim() || !password.trim()) {
      setFormState({
        message: { type: 'error', text: 'Enter both your email and password.' },
      });
      return;
    }

    if (!validateEmail(identifier)) {
      setFormState({
        message: { type: 'error', text: 'Please enter a valid email address.' },
      });
      return;
    }

    setFormState({ loading: true, message: { type: '', text: '' } });

    try {
      const data = await authApi.login({
        email: identifier.trim(),
        password: password.trim(),
      });

      if (data && data.success) {
        const token = data.accessToken || data.token;

        if (!token) {
          throw new Error('No token received from server');
        }

        // Store authentication data
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

        // Set cookies
        setCookie('authToken', token, 7);
        if (data.user?.role) setCookie('userRole', data.user.role, 7);
        if (data.tenant?.tenantSlug) setCookie('tenantSlug', data.tenant.tenantSlug, 7);

        // Show success popup
        setAuthPopupData({ 
          success: true, 
          message: `Welcome, ${data.user?.fullName || 'there'}.` 
        });
        setShowAuthPopup(true);

        // Navigate after delay
        setTimeout(() => {
          setShowAuthPopup(false);
          navigate('/dashboard');
        }, 1400);

      } else {
        setFormState({
          message: { 
            type: 'error', 
            text: data?.message || 'Those credentials did not match our records.' 
          },
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setFormState({
        message: { 
          type: 'error', 
          text: err.response?.data?.message || 'We could not reach the server. Please try again.' 
        },
      });
    } finally {
      setFormState({ loading: false });
    }
  }, [identifier, password, nightBlocked, setFormState, setCookie, navigate]);

  const isLoading = formState.loading;
  const hasError = formState.message.type === 'error';
  const isFormValid = validateEmail(identifier) && isValidPassword(password);

  return (
    <div className="login-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        html {
          scroll-behavior: smooth;
          background: ${THEME.colors.bone};
        }
        
        body {
          overflow-x: hidden;
          background: ${THEME.colors.bone};
          color: ${THEME.colors.gray};
          font-family: ${THEME.typography.fontFamily};
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        ::selection {
          background: rgba(139,115,85,0.18);
          color: ${THEME.colors.ink};
        }
        
        .login-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(250,248,244,0.35);
          border-top-color: ${THEME.colors.bone};
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
          display: inline-block;
        }
        
        /* Navigation */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 300;
          background: rgba(250,248,244,0.92);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid ${THEME.colors.line};
          padding: 1.1rem 0;
        }
        
        .navbar-content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          cursor: pointer;
          background: none;
          border: none;
          font-family: inherit;
        }
        
        .navbar-brand-text {
          font-family: ${THEME.typography.displayFamily};
          font-size: 1.05rem;
          font-weight: 500;
          color: ${THEME.colors.ink};
        }
        
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .label-mono {
          font-family: ${THEME.typography.monoFamily};
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${THEME.colors.brass};
        }
        
        .btn-primary {
          background: ${THEME.colors.ink};
          color: ${THEME.colors.bone};
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: ${THEME.borderRadius.sm};
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
          font-family: ${THEME.typography.fontFamily};
        }
        
        .btn-primary:hover {
          background: #000;
        }
        
        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 76px 1.5rem 2rem;
          background: ${THEME.colors.bone};
        }
        
        .login-container {
          max-width: 980px;
          width: 100%;
          opacity: loaded ? 1 : 0;
          transform: loaded ? 'translateY(0)' : 'translateY(14px)';
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        
        .login-grid {
          display: grid;
          grid-template-columns: 0.95fr 1fr;
          border: 1px solid ${THEME.colors.line};
          box-shadow: 0 30px 70px -24px ${THEME.colors.shadow};
          border-radius: ${THEME.borderRadius.lg};
          overflow: hidden;
        }
        
        /* Left Panel */
        .login-left {
          background: ${THEME.colors.ink};
          padding: ${THEME.spacing.xxxl} ${THEME.spacing.xxxl};
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .left-header {
          margin-bottom: ${THEME.spacing.xxl};
        }
        
        .case-number {
          font-family: ${THEME.typography.monoFamily};
          font-size: ${THEME.typography.tiny};
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${THEME.colors.brassLight};
          margin-bottom: ${THEME.spacing.xxl};
        }
        
        .left-title {
          font-family: ${THEME.typography.displayFamily};
          font-size: ${THEME.typography.heroTitle};
          font-weight: 500;
          color: ${THEME.colors.bone};
          margin-bottom: ${THEME.spacing.md};
          line-height: 1.15;
        }
        
        .left-description {
          font-size: ${THEME.typography.body};
          color: ${THEME.colors.grayLight};
          line-height: 1.7;
          max-width: 300px;
        }
        
        .features-section {
          border-top: 1px solid ${THEME.colors.lineDark};
          padding-top: ${THEME.spacing.xl};
        }
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: ${THEME.spacing.sm};
          margin-bottom: ${THEME.spacing.md};
          color: ${THEME.colors.brassLight};
        }
        
        /* Right Panel */
        .login-right {
          background: ${THEME.colors.bone};
          padding: ${THEME.spacing.xxxl} ${THEME.spacing.xxl};
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .right-header {
          margin-bottom: ${THEME.spacing.xxl};
        }
        
        .right-label {
          font-family: ${THEME.typography.monoFamily};
          font-size: ${THEME.typography.tiny};
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${THEME.colors.gray};
          margin-bottom: ${THEME.spacing.sm};
        }
        
        .right-title {
          font-family: ${THEME.typography.displayFamily};
          font-size: ${THEME.typography.sectionTitle};
          font-weight: 500;
          color: ${THEME.colors.ink};
          margin-bottom: ${THEME.spacing.xs};
        }
        
        .right-subtitle {
          font-size: ${THEME.typography.small};
          color: ${THEME.colors.gray};
        }
        
        /* Form Elements */
        .form-section {
          margin-bottom: ${THEME.spacing.lg};
        }
        
        .input-label {
          display: block;
          font-family: ${THEME.typography.monoFamily};
          font-size: ${THEME.typography.tiny};
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${THEME.colors.gray};
          margin-bottom: ${THEME.spacing.sm};
        }
        
        .input-field {
          width: 100%;
          padding: ${THEME.spacing.md} ${THEME.spacing.md};
          font-size: ${THEME.typography.body};
          font-family: ${THEME.typography.fontFamily};
          border: 1px solid ${THEME.colors.line};
          border-radius: ${THEME.borderRadius.md};
          background: ${THEME.colors.white};
          color: ${THEME.colors.ink};
          transition: all 0.2s;
          outline: none;
        }
        
        .input-field:focus {
          border-color: ${THEME.colors.brass};
          box-shadow: 0 0 0 3px rgba(139,115,85,0.12);
        }
        
        .input-field:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .input-field::placeholder {
          color: ${THEME.colors.gray};
          opacity: 0.7;
        }
        
        .error-text {
          display: block;
          color: ${THEME.colors.red};
          font-size: ${THEME.typography.tiny};
          margin-top: ${THEME.spacing.xs};
        }
        
        .alert-message {
          padding: ${THEME.spacing.md};
          border-radius: ${THEME.borderRadius.md};
          font-size: ${THEME.typography.small};
          font-weight: 500;
          line-height: 1.4;
          margin-bottom: ${THEME.spacing.lg};
          display: flex;
          align-items: center;
          gap: ${THEME.spacing.sm};
        }
        
        /* Buttons */
        .btn-submit {
          width: 100%;
          padding: ${THEME.spacing.md} ${THEME.spacing.lg};
          font-size: ${THEME.typography.body};
          font-weight: 500;
          font-family: ${THEME.typography.fontFamily};
          border: none;
          border-radius: ${THEME.borderRadius.sm};
          cursor: pointer;
          background: ${THEME.colors.ink};
          color: ${THEME.colors.bone};
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${THEME.spacing.sm};
          min-height: 48px;
        }
        
        .btn-submit:hover:not(:disabled) {
          background: '#000';
        }
        
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-link {
          background: none;
          border: none;
          color: ${THEME.colors.gray};
          cursor: pointer;
          font-size: ${THEME.typography.small};
          font-family: ${THEME.typography.fontFamily};
          text-decoration: underline;
          text-decoration-color: ${THEME.colors.line};
          transition: color 0.2s;
        }
        
        .btn-link:hover {
          color: ${THEME.colors.ink};
        }
        
        .btn-link-accent {
          color: ${THEME.colors.brass};
          font-weight: 500;
        }
        
        .btn-link-accent:hover {
          color: ${THEME.colors.brassHover};
        }
        
        .btn-link-verdigris {
          color: ${THEME.colors.verdigris};
          font-weight: 500;
        }
        
        /* Footer */
        .site-footer {
          background: ${THEME.colors.ink};
          color: ${THEME.colors.grayLight};
          padding: ${THEME.spacing.xxl} 0 ${THEME.spacing.xl};
        }
        
        .footer-content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.75rem;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: ${THEME.spacing.xxl};
          padding-bottom: ${THEME.spacing.xxl};
          border-bottom: 1px solid ${THEME.colors.lineDark};
        }
        
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: ${THEME.spacing.md};
        }
        
        .footer-brand-text {
          font-family: ${THEME.typography.displayFamily};
          font-size: 1.1rem;
          color: ${THEME.colors.bone};
        }
        
        .footer-description {
          max-width: 320px;
          font-size: ${THEME.typography.small};
          color: ${THEME.colors.grayLight};
          line-height: 1.6;
        }
        
        .footer-heading {
          font-family: ${THEME.typography.monoFamily};
          font-size: ${THEME.typography.tiny};
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${THEME.colors.brassLight};
          margin-bottom: ${THEME.spacing.lg};
          font-weight: 400;
        }
        
        .footer-link-item {
          display: block;
          font-size: ${THEME.typography.small};
          color: ${THEME.colors.grayLight};
          margin-bottom: ${THEME.spacing.sm};
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s;
          background: none;
          border: none;
          font-family: ${THEME.typography.fontFamily};
          text-align: left;
        }
        
        .footer-link-item:hover {
          color: ${THEME.colors.white};
        }
        
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          font-size: ${THEME.typography.tiny};
          color: rgba(250,248,244,0.45);
          padding-top: ${THEME.spacing.xl};
          flex-wrap: wrap;
          gap: ${THEME.spacing.sm};
        }
        
        /* Popup Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${THEME.colors.overlay};
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: ${THEME.spacing.xxl};
        }
        
        .modal-content {
          background: ${THEME.colors.bone};
          border: 1px solid ${THEME.colors.line};
          padding: ${THEME.spacing.xxl};
          text-align: center;
          max-width: 360px;
          width: 100%;
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.5);
          border-radius: ${THEME.borderRadius.lg};
        }
        
        .modal-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: ${THEME.colors.bone2};
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto ${THEME.spacing.lg};
          color: ${THEME.colors.verdigris};
        }
        
        .modal-title {
          font-family: ${THEME.typography.displayFamily};
          font-size: 1.3rem;
          color: ${THEME.colors.ink};
          margin-bottom: ${THEME.spacing.sm};
          font-weight: 500;
        }
        
        .modal-text {
          font-size: ${THEME.typography.small};
          color: ${THEME.colors.gray};
          line-height: 1.6;
        }
        
        /* Responsive Design */
        @media (max-width: ${THEME.breakpoints.mobile}) {
          .login-grid {
            grid-template-columns: 1fr !important;
          }
          
          .login-left {
            display: none !important;
          }
          
          .login-right {
            padding: ${THEME.spacing.xxl} ${THEME.spacing.xl} !important;
          }
          
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: ${THEME.spacing.xl};
          }
        }
        
        @media (min-width: ${THEME.breakpoints.tablet}) {
          .login-grid {
            max-width: 1000px;
          }
        }
        
        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
        .fade-in {
          animation: none;
        }
          
          .spinner {
            animation: none;
          }
          
          .btn-submit {
            transition: none;
          }
        }
        
        .input-field:focus-visible,
        .btn-submit:focus-visible,
        .btn-link:focus-visible,
        .footer-link-item:focus-visible {
          outline: 2px solid ${THEME.colors.brass};
          outline-offset: 2px;
        }
      `}</style>

      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-content">
          <button 
            className="navbar-brand"
            onClick={() => navigate('/')}
            aria-label="Go to homepage"
          >
            <Logo size={20} />
            <span className="navbar-brand-text">Rest Point</span>
          </button>
          <div className="navbar-actions">
            <span className="label-mono">Staff sign in</span>
            <button
              onClick={() => navigate('/register')}
              className="btn-primary"
            >
              Start trial
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div 
          className="login-container"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div className="login-grid">
            {/* Left Panel */}
            <div className="login-left">
              <div className="left-header">
                <div className="case-number">Case No. 0142 · Status — arranged</div>
                <h1 className="left-title">
                  The register, kept by your team.
                </h1>
                <p className="left-description">
                  Sign in to manage cases, dispatch, documents, and billing across every branch you run.
                </p>
              </div>

              <div className="features-section">
                {[
                  {
                    icon: (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                        <rect x="3" y="11" width="18" height="11" rx="1" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    ),
                    label: 'Encrypted at rest and in transit',
                  },
                  {
                    icon: (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                        <circle cx="6" cy="6" r="2.5" />
                        <circle cx="6" cy="18" r="2.5" />
                        <circle cx="18" cy="12" r="2.5" />
                        <path d="M6 8.5V15.5M8.3 7.2l7.4 3.6M8.3 16.8l7.4-3.6" />
                      </svg>
                    ),
                    label: 'Unlimited branches, one account',
                  },
                  {
                    icon: (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                        <path d="M18 18H6a4 4 0 0 1-1-7.87A5.5 5.5 0 0 1 15.5 8a4.5 4.5 0 0 1 2.5 8.4" />
                      </svg>
                    ),
                    label: 'Synced in real time, every device',
                  },
                  {
                    icon: (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                        <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
                      </svg>
                    ),
                    label: 'Every change kept in the audit log',
                  },
                ].map(({ icon, label }) => (
                  <FeatureItem key={label} icon={icon} label={label} />
                ))}
              </div>
            </div>

            {/* Right Panel */}
            <div className="login-right">
              <div className="right-header">
                <div className="right-label">Welcome back</div>
                <h2 className="right-title">Sign in to your account</h2>
                <p className="right-subtitle">Enter your credentials to open the dashboard.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <AlertMessage 
                  type={formState.message.type} 
                  text={formState.message.text} 
                />

                <div className="form-section">
                  <label htmlFor="email" className="input-label">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="director@yourfuneralhome.co.ke"
                    disabled={isLoading}
                    className="input-field"
                    autoComplete="email"
                    autoFocus
                    aria-invalid={hasError && !identifier}
                    aria-describedby={hasError && !identifier ? 'email-error' : undefined}
                  />
                  {hasError && !identifier && (
                    <span id="email-error" className="error-text">Email is required.</span>
                  )}
                </div>

                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showPassword={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                  hasError={hasError}
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className="btn-submit"
                  aria-busy={isLoading}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {isLoading && <Spinner />}
                    <span>{isLoading ? 'Signing in…' : 'Sign in'}</span>
                  </span>
                </button>

                <div style={{ marginTop: THEME.spacing.lg, textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="btn-link"
                  >
                    Forgot your password?
                  </button>
                </div>

                <div style={{ marginTop: THEME.spacing.lg, textAlign: 'center' }}>
                  <p style={{ fontSize: THEME.typography.small, color: THEME.colors.gray }}>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="btn-link btn-link-accent"
                    >
                      Start a free trial
                    </button>
                  </p>
                </div>

                <div 
                  style={{ 
                    marginTop: THEME.spacing.md, 
                    paddingTop: THEME.spacing.md, 
                    borderTop: `1px solid ${THEME.colors.line}`,
                    textAlign: 'center',
                  }}
                >
                  <p style={{ fontSize: THEME.typography.small, color: THEME.colors.gray }}>
                    Are you a family member?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/portal/login')}
                      className="btn-link btn-link-verdigris"
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

      {/* Success Popup */}
      {showAuthPopup && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="modal-title">
              {authPopupData.success ? 'Welcome' : 'Signing in…'}
            </h3>
            <p className="modal-text">{authPopupData.message}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <Logo size={20} color={THEME.colors.bone} />
                <span className="footer-brand-text">Rest Point</span>
              </div>
              <p className="footer-description">
                The operating system for funeral homes that take their reputation seriously. Built by Welt Tallis Technologies.
              </p>
            </div>
            <div>
              <h4 className="footer-heading">Platform</h4>
              <FooterLink href="/#capabilities">Capabilities</FooterLink>
              <FooterLink href="/#pricing">Pricing</FooterLink>
              <FooterLink href="/#faq">Questions</FooterLink>
            </div>
            <div>
              <h4 className="footer-heading">Company</h4>
              <FooterLink onClick={() => navigate('/about')}>About</FooterLink>
              <FooterLink onClick={() => navigate('/contact')}>Contact</FooterLink>
              <FooterLink onClick={() => navigate('/privacy')}>Privacy policy</FooterLink>
              <FooterLink onClick={() => navigate('/terms')}>Terms</FooterLink>
              <FooterLink onClick={() => navigate('/account-deletion')}>Account deletion</FooterLink>
            </div>
          </div>
          <div className="footer-bottom">
            <div>© 2026 Rest Point. All rights reserved.</div>
            <div>Built for African funeral professionals</div>
          </div>
        </div>
      </footer>
    </div>
  );
}