import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

// ============================================================
// PROFESSIONAL ONBOARDING FLOW
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
    verdigrisDark: '#2E3F37',
    line: '#E3DDD0',
    lineDark: '#2C2F33',
    gray: '#6B6862',
    grayLight: 'rgba(250,248,244,0.62)',
    red: '#9B4A3F',
    redBg: '#F7ECE9',
    redLine: '#E8D2CC',
    white: '#FFFFFF',
    success: '#475A43',
    successBg: '#EEF3EC',
    successLine: '#DCE6D9',
    shadow: 'rgba(21,23,26,0.12)',
    overlay: 'rgba(21,23,26,0.88)',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    displayFamily: "'Fraunces', serif",
    monoFamily: "'JetBrains Mono', monospace",
    heroTitle: 'clamp(1.4rem, 2.5vw, 2rem)',
    sectionTitle: '1.5rem',
    body: '0.88rem',
    small: '0.82rem',
    tiny: '0.7rem',
  },
  spacing: {
    xs: '0.3rem',
    sm: '0.55rem',
    md: '0.78rem',
    lg: '1.1rem',
    xl: '1.5rem',
    xxl: '2rem',
    xxxl: '2.5rem',
  },
  borderRadius: {
    sm: '2px',
    md: '4px',
    lg: '8px',
    xl: '12px',
    full: '50%',
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
  },
};

// Step Configuration
const STEPS = [
  { 
    key: 'org', 
    label: 'Organization',
    description: 'Basic details about your funeral home'
  },
  { 
    key: 'security', 
    label: 'Security',
    description: 'Create a secure password for your team'
  },
  { 
    key: 'review', 
    label: 'Review',
    description: 'Verify your information before creating your account'
  },
];

// Utility Functions
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character');
  return errors;
};

const getPasswordStrength = (password) => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  return strength;
};

const getPasswordStrengthColor = (strength) => {
  if (strength === 0) return THEME.colors.gray;
  if (strength === 1) return THEME.colors.red;
  if (strength === 2) return THEME.colors.brass;
  return THEME.colors.verdigris;
};

const getPasswordStrengthText = (strength) => {
  if (strength === 0) return 'Enter password';
  if (strength === 1) return 'Weak';
  if (strength === 2) return 'Medium';
  return 'Strong';
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

const PasswordInput = ({ 
  label, 
  value, 
  onChange, 
  showPassword, 
  onToggle, 
  hasError, 
  errorMessage,
  disabled,
  placeholder 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="input-group">
      <label className="input-label">
        {label} <span style={{ color: THEME.colors.red }}>*</span>
      </label>
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
          placeholder={placeholder}
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
      {errorMessage && (
        <span className="error-text">{errorMessage}</span>
      )}
    </div>
  );
};

const StepIndicator = ({ currentStep, onStepClick }) => {
  const progressPercentage = (currentStep / (STEPS.length - 1)) * 100;
  
  return (
    <div className="step-indicator-container">
      <div className="step-progress-bg" />
      <div 
        className="step-progress-fill" 
        style={{ width: `${progressPercentage}%` }}
      />
      
      <div className="step-items">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div 
              key={step.key} 
              className={`step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              onClick={() => isCompleted && onStepClick(index)}
              style={{ cursor: isCompleted ? 'pointer' : 'default' }}
            >
              <div className="step-circle">
                {isCompleted ? '✓' : index + 1}
              </div>
              <div className="step-label">
                <div className="step-title">{step.label}</div>
                <div className="step-description">{step.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FileUpload = ({ label, preview, onUpload, error }) => {
  const handleClick = () => {
    document.getElementById('file-upload').click();
  };
  
  return (
    <div className="file-upload-group">
      <label className="input-label">
        {label} <span style={{ color: THEME.colors.red }}>*</span>
      </label>
      <div 
        className="file-upload-area"
        style={{
          border: `2px dashed ${error ? THEME.colors.red : preview ? THEME.colors.brass : THEME.colors.line}`,
          borderRadius: THEME.borderRadius.full,
          background: THEME.colors.bone2,
          cursor: 'pointer',
        }}
        onClick={handleClick}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="file-preview" />
        ) : (
          <div className="file-upload-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={THEME.colors.gray} strokeWidth="1.4" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span style={{ fontSize: THEME.typography.small, color: THEME.colors.gray }}>
              Click to upload
            </span>
          </div>
        )}
      </div>
      <input
        id="file-upload"
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/svg+xml"
        onChange={onUpload}
        style={{ display: 'none' }}
      />
      {error && <span className="error-text">{error}</span>}
      <span className="file-hint">PNG, JPG or SVG (max 10MB)</span>
    </div>
  );
};

const ReviewSection = ({ title, children }) => (
  <div className="review-section">
    <h3 className="review-title">{title}</h3>
    {children}
  </div>
);

const ReviewItem = ({ label, value }) => (
  <div className="review-item">
    <span className="review-label">{label}</span>
    <span className="review-value">{value || '—'}</span>
  </div>
);

// Main Component
export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    location: '',
    password: '',
    verifyPassword: '',
  });

  const [errors, setErrors] = useState({});

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear password match error
    if (name === 'password' || name === 'verifyPassword') {
      if (errors.passwordMatch) {
        setErrors(prev => ({ ...prev, passwordMatch: '' }));
      }
    }
    
    setApiError('');
  }, [errors]);

  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: 'Logo size should be less than 10MB' }));
      return;
    }
    
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
      setErrors(prev => ({ ...prev, logo: 'Only JPG, PNG, or SVG images are allowed' }));
      return;
    }
    
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
    setErrors(prev => ({ ...prev, logo: '' }));
  }, []);

  const validateStep1 = useCallback(() => {
    const newErrors = {};
    
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!logoFile && !logoPreview) {
      newErrors.logo = 'Organization logo is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, logoFile, logoPreview]);

  const validateStep2 = useCallback(() => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = `Password must have: ${passwordErrors.join(', ')}`;
      }
    }
    
    if (!formData.verifyPassword) {
      newErrors.verifyPassword = 'Please verify your password';
    } else if (formData.password !== formData.verifyPassword) {
      newErrors.passwordMatch = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const goNext = useCallback(() => {
    if (currentStep === 0 && !validateStep1()) return;
    if (currentStep === 1 && !validateStep2()) return;
    
    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, validateStep1, validateStep2]);

  const goBack = useCallback(() => {
    setErrors({});
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!agreeTerms) {
      setErrors({ terms: 'You must agree to the terms and conditions' });
      return;
    }
    
    setIsSubmitting(true);
    setApiError('');
    setApiSuccess('');
    
    try {
      const submitData = new FormData();
      submitData.append('organizationName', formData.organizationName);
      submitData.append('email', formData.email);
      submitData.append('location', formData.location);
      submitData.append('password', formData.password);
      submitData.append('termsAccepted', agreeTerms);
      if (logoFile) submitData.append('logo', logoFile);
      
      const response = await api.post('/api/v1/restpoint/tenant/onboarding/organization', submitData, {
        headers: { 'Content-Type': 'multipart/form-data', 'x-tenant-slug': '' },
        timeout: 30000,
      });
      
      if (response.data.success || response.status === 200 || response.status === 201) {
        setApiSuccess(response.data.message || 'Organization setup completed! Redirecting...');
        
        const onboardingData = {
          organizationName: formData.organizationName,
          email: formData.email,
          location: formData.location,
          logo: logoPreview,
          organizationId: response.data.organizationId,
          userId: response.data.userId,
          completedAt: new Date().toISOString(),
        };
        
        localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
        localStorage.setItem('onboardingComplete', 'true');
        if (response.data.token) localStorage.setItem('authToken', response.data.token);
        if (response.data.user) localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setTimeout(() => {
          setIsSubmitting(false);
          navigate('/login');
        }, 1800);
      } else {
        throw new Error(response.data.message || 'Setup failed.');
      }
    } catch (error) {
      setIsSubmitting(false);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || 'Server error';
        
        if (status === 409) setApiError('Organization with this email already exists.');
        else if (status === 400) setApiError(message || 'Invalid data provided.');
        else if (status === 500) setApiError('Server error. Please try again later.');
        else setApiError(message || `Error ${status}`);
      } else if (error.request) {
        setApiError('Network error. Please check your connection.');
      } else {
        setApiError(error.message || 'An unexpected error occurred.');
      }
    }
  }, [formData, logoFile, agreeTerms, navigate]);

  const passwordStrength = getPasswordStrength(formData.password);

  const goToLogin = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/login');
  }, [navigate]);

  const goToTerms = useCallback(() => navigate('/terms'), [navigate]);
  const goToPrivacy = useCallback(() => navigate('/privacy'), [navigate]);

  return (
    <div className="onboarding-page">
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
        
        .onboarding-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .fade-in {
          animation: fadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
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
          padding: 1rem 0;
        }
        
        .navbar-content {
          max-width: 900px;
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
          font-size: 1rem;
          font-weight: 500;
          color: ${THEME.colors.ink};
        }
        
        .btn-outline {
          background: transparent;
          color: ${THEME.colors.ink};
          border: 1px solid ${THEME.colors.ink};
          padding: 0.4rem 1rem;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: ${THEME.typography.fontFamily};
          border-radius: ${THEME.borderRadius.sm};
        }
        
        .btn-outline:hover {
          background: ${THEME.colors.ink};
          color: ${THEME.colors.bone};
        }
        
        /* Step Indicator */
        .step-indicator-container {
          position: relative;
          padding: 2rem 0 2.5rem;
          margin-bottom: 1.5rem;
        }
        
        .step-progress-bg {
          position: absolute;
          top: 50%;
          left: 8%;
          right: 8%;
          height: 2px;
          background: ${THEME.colors.line};
          transform: translateY(-50%);
          z-index: 0;
        }
        
        .step-progress-fill {
          position: absolute;
          top: 50%;
          left: 8%;
          height: 2px;
          background: ${THEME.colors.brass};
          transform: translateY(-50%);
          z-index: 0;
          transition: width 0.4s ease;
        }
        
        .step-items {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.3s ease;
        }
        
        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${THEME.colors.bone};
          border: 2px solid ${THEME.colors.line};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${THEME.colors.gray};
          font-size: 0.72rem;
          font-weight: 600;
          transition: all 0.3s ease;
          font-family: ${THEME.typography.fontFamily};
        }
        
        .step-item.completed .step-circle,
        .step-item.current .step-circle {
          background: ${THEME.colors.brass};
          border-color: ${THEME.colors.brass};
          color: ${THEME.colors.white};
        }
        
        .step-label {
          margin-top: 0.4rem;
          text-align: center;
        }
        
        .step-title {
          font-size: 0.72rem;
          color: ${THEME.colors.ink};
          font-weight: 600;
          white-space: nowrap;
        }
        
        .step-description {
          font-size: 0.68rem;
          color: ${THEME.colors.gray};
          margin-top: 0.15rem;
          max-width: 120px;
        }
        
        /* Main Card */
        .main-card {
          background: ${THEME.colors.white};
          border: 1px solid ${THEME.colors.line};
          padding: ${THEME.spacing.xxxl};
          box-shadow: 0 20px 60px -16px ${THEME.colors.shadow};
          border-radius: ${THEME.borderRadius.lg};
          margin-bottom: 1.5rem;
        }
        
        .card-header {
          margin-bottom: ${THEME.spacing.xxl};
        }
        
        .card-title {
          font-family: ${THEME.typography.displayFamily};
          font-size: ${THEME.typography.heroTitle};
          font-weight: 500;
          color: ${THEME.colors.ink};
          margin-bottom: ${THEME.spacing.sm};
          line-height: 1.15;
        }
        
        .card-subtitle {
          font-size: ${THEME.typography.body};
          color: ${THEME.colors.gray};
          line-height: 1.6;
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
          background: ${THEME.colors.bone};
          color: ${THEME.colors.ink};
          transition: all 0.2s;
          outline: none;
        }
        
        .input-field:focus {
          border-color: ${THEME.colors.brass};
          box-shadow: 0 0 0 3px rgba(139,115,85,0.12);
          background: ${THEME.colors.white};
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
        
        /* File Upload */
        .file-upload-group {
          margin-bottom: ${THEME.spacing.lg};
        }
        
        .file-upload-area {
          width: 80px;
          height: 80px;
          margin: 0 auto;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.25s;
        }
        
        .file-upload-area:hover {
          transform: scale(1.05);
        }
        
        .file-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .file-upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
        }
        
        .file-hint {
          display: block;
          text-align: center;
          font-size: ${THEME.typography.tiny};
          color: ${THEME.colors.gray};
          margin-top: ${THEME.spacing.sm};
        }
        
        /* Password Strength */
        .password-strength {
          margin-top: ${THEME.spacing.sm};
        }
        
        .strength-bar {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 0.25rem;
        }
        
        .strength-segment {
          flex: 1;
          height: 3px;
          background: ${THEME.colors.line};
          border-radius: 2px;
          transition: background 0.2s;
        }
        
        .strength-text {
          font-size: 0.7rem;
          color: ${THEME.colors.gray};
        }
        
        /* Buttons */
        .btn-primary {
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
        
        .btn-primary:hover:not(:disabled) {
          background: #000;
        }
        
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          background: transparent;
          color: ${THEME.colors.ink};
          border: 1px solid ${THEME.colors.line};
          padding: 0.7rem 1.2rem;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: ${THEME.typography.fontFamily};
          border-radius: ${THEME.borderRadius.sm};
          transition: border-color 0.2s;
        }
        
        .btn-secondary:hover {
          border-color: ${THEME.colors.ink};
        }
        
        .btn-link {
          background: none;
          border: none;
          color: ${THEME.colors.gray};
          cursor: pointer;
          font-size: ${THEME.typography.small};
          font-family: ${THEME.typography.fontFamily};
          text-decoration: underline;
          text-decorationColor: ${THEME.colors.line};
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
        
        /* Review Section */
        .review-section {
          border: 1px solid ${THEME.colors.line};
          border-radius: ${THEME.borderRadius.md};
          overflow: hidden;
          margin-bottom: ${THEME.spacing.lg};
        }
        
        .review-title {
          padding: ${THEME.spacing.md} ${THEME.spacing.lg};
          background: ${THEME.colors.bone};
          border-bottom: 1px solid ${THEME.colors.line};
          font-size: ${THEME.typography.small};
          font-weight: 600;
          color: ${THEME.colors.ink};
        }
        
        .review-item {
          display: flex;
          justify-content: space-between;
          padding: ${THEME.spacing.md} ${THEME.spacing.lg};
          border-bottom: 1px solid ${THEME.colors.line};
          font-size: ${THEME.typography.small};
        }
        
        .review-item:last-child {
          border-bottom: none;
        }
        
        .review-label {
          color: ${THEME.colors.gray};
        }
        
        .review-value {
          color: ${THEME.colors.ink};
          font-weight: 500;
        }
        
        /* Checkbox */
        .checkbox-group {
          margin-bottom: ${THEME.spacing.lg};
        }
        
        .checkbox-label {
          display: flex;
          alignItems: flex-start;
          gap: ${THEME.spacing.sm};
          cursor: pointer;
          font-size: ${THEME.typography.small};
          color: ${THEME.colors.gray};
          line-height: 1.5;
        }
        
        .checkbox-input {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
          margin-top: 0.15rem;
          flex-shrink: 0;
          accent-color: ${THEME.colors.brass};
        }
        
        /* Trust Badges */
        .trust-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          justify-content: center;
          opacity: loaded ? 1 : 0;
          transition: opacity 0.6s ease 200ms;
          margin-bottom: 1.5rem;
        }
        
        .trust-badge {
          display: flex;
          alignItems: center;
          gap: 0.35rem;
          border: 1px solid ${THEME.colors.line};
          padding: 0.25rem 0.65rem;
          font-size: 0.68rem;
          color: ${THEME.colors.gray};
          background: ${THEME.colors.white};
          border-radius: ${THEME.borderRadius.sm};
        }
        
        .trust-badge-dot {
          color: ${THEME.colors.brass};
          font-size: 0.7rem;
        }
        
        .trust-badge-label {
          font-weight: 500;
          color: ${THEME.colors.ink};
        }
        
        /* Footer */
        .site-footer {
          background: ${THEME.colors.ink};
          color: ${THEME.colors.grayLight};
          padding: ${THEME.spacing.xxl} 0 ${THEME.spacing.xl};
          margin-top: auto;
        }
        
        .footer-content {
          max-width: 900px;
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
          gap: 0.5rem;
          margin-bottom: ${THEME.spacing.md};
        }
        
        .footer-brand-text {
          font-family: ${THEME.typography.displayFamily};
          font-size: 1rem;
          color: ${THEME.colors.bone};
        }
        
        .footer-description {
          max-width: 260px;
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
        
        .footer-link {
          display: block;
          font-size: ${THEME.typography.small};
          color: ${THEME.colors.grayLight};
          margin-bottom: ${THEME.spacing.sm};
          cursor: pointer;
          transition: color 0.2s;
          background: none;
          border: none;
          font-family: ${THEME.typography.fontFamily};
          text-align: left;
        }
        
        .footer-link:hover {
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
        
        /* Responsive */
        @media (max-width: ${THEME.breakpoints.mobile}) {
          .step-description {
            display: none;
          }
          
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: ${THEME.spacing.xl};
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
          
          .btn-primary,
          .btn-secondary {
            transition: none;
          }
        }
        
        .input-field:focus-visible,
        .btn-primary:focus-visible,
        .btn-secondary:focus-visible,
        .btn-link:focus-visible {
          outline: 2px solid ${THEME.colors.brass};
          outline-offset: 2px;
        }
      `}</style>

      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-content">
          <button 
            className="navbar-brand"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Go to homepage"
          >
            <Logo size={20} />
            <span className="navbar-brand-text">Rest Point</span>
          </button>
          <button onClick={goToLogin} className="btn-outline">
            Log in
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ paddingTop: '70px', flex: 1 }}>
        <section style={{ padding: '2rem 0 1rem' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.75rem' }}>
            
            {/* Step Indicator */}
            <div style={{ 
              opacity: loaded ? 1 : 0, 
              transition: 'opacity .6s ease',
            }}>
              <StepIndicator 
                currentStep={currentStep} 
                onStepClick={(index) => {
                  if (index < currentStep) {
                    setCurrentStep(index);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              />
            </div>

            {/* Main Card */}
            <div 
              className="main-card fade-in"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(18px)',
                transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              {/* Header */}
              <div className="card-header">
                <h1 className="card-title">
                  {currentStep === 0 && <>Tell us about your <span style={{ color: THEME.colors.brass, fontStyle: 'italic' }}>organization</span></>}
                  {currentStep === 1 && <>Secure your <span style={{ color: THEME.colors.brass, fontStyle: 'italic' }}>account</span></>}
                  {currentStep === 2 && <>Review and <span style={{ color: THEME.colors.brass, fontStyle: 'italic' }}>confirm</span></>}
                </h1>
                <p className="card-subtitle">
                  {currentStep === 0 && 'Basic details so families and your team know who they\'re working with.'}
                  {currentStep === 1 && 'A password only your team will use to sign in to Rest Point.'}
                  {currentStep === 2 && 'Check everything looks right, then create your account.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <AlertMessage 
                  type="success" 
                  text={apiSuccess} 
                />
                <AlertMessage 
                  type="error" 
                  text={apiError} 
                />

                {/* Step 0 - Organization */}
                {currentStep === 0 && (
                  <div className="step-pane fade-in">
                    <FileUpload
                      label="Organization logo"
                      preview={logoPreview}
                      onUpload={handleLogoUpload}
                      error={errors.logo}
                    />

                    <div className="form-section">
                      <label htmlFor="organizationName" className="input-label">
                        Organization name <span style={{ color: THEME.colors.red }}>*</span>
                      </label>
                      <input
                        id="organizationName"
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleChange}
                        placeholder="e.g., Nairobi Funeral Home"
                        className="input-field"
                        disabled={isSubmitting}
                      />
                      {errors.organizationName && <span className="error-text">{errors.organizationName}</span>}
                    </div>

                    <div className="form-section">
                      <label htmlFor="email" className="input-label">
                        Email address <span style={{ color: THEME.colors.red }}>*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="info@funeralhome.co.ke"
                        className="input-field"
                        disabled={isSubmitting}
                        autoComplete="email"
                      />
                      {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <div className="form-section">
                      <label htmlFor="location" className="input-label">
                        Location <span style={{ color: THEME.colors.red }}>*</span>
                      </label>
                      <input
                        id="location"
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Nairobi, Kenya"
                        className="input-field"
                        disabled={isSubmitting}
                      />
                      {errors.location && <span className="error-text">{errors.location}</span>}
                    </div>
                  </div>
                )}

                {/* Step 1 - Security */}
                {currentStep === 1 && (
                  <div className="step-pane fade-in">
                    <PasswordInput
                      label="Password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      showPassword={showPassword}
                      onToggle={() => setShowPassword(!showPassword)}
                      hasError={!!errors.password}
                      errorMessage={errors.password}
                      disabled={isSubmitting}
                      placeholder="Create a strong password"
                    />
                    
                    {formData.password && (
                      <div className="password-strength">
                        <div className="strength-bar">
                          {[1, 2, 3].map((level) => (
                            <div
                              key={level}
                              className="strength-segment"
                              style={{
                                background: passwordStrength >= level 
                                  ? getPasswordStrengthColor(passwordStrength) 
                                  : THEME.colors.line,
                              }}
                            />
                          ))}
                        </div>
                        <div className="strength-text" style={{ color: getPasswordStrengthColor(passwordStrength) }}>
                          {getPasswordStrengthText(passwordStrength)} password
                        </div>
                      </div>
                    )}

                    <PasswordInput
                      label="Verify password"
                      name="verifyPassword"
                      value={formData.verifyPassword}
                      onChange={handleChange}
                      showPassword={showVerifyPassword}
                      onToggle={() => setShowVerifyPassword(!showVerifyPassword)}
                      hasError={!!errors.verifyPassword || !!errors.passwordMatch}
                      errorMessage={errors.verifyPassword || errors.passwordMatch}
                      disabled={isSubmitting}
                      placeholder="Confirm your password"
                    />
                    
                    {formData.verifyPassword && formData.password === formData.verifyPassword && formData.password && (
                      <div style={{ 
                        fontSize: '0.7rem', 
                        color: THEME.colors.verdigris, 
                        marginTop: '0.3rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Passwords match
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2 - Review */}
                {currentStep === 2 && (
                  <div className="step-pane fade-in">
                    <ReviewSection title="Organization Details">
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.9rem',
                        padding: '1rem 1.1rem',
                        borderBottom: `1px solid ${THEME.colors.line}`,
                      }}>
                        <div style={{ 
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          background: THEME.colors.bone2,
                          flexShrink: 0,
                          border: `1px solid ${THEME.colors.line}`,
                        }}>
                          {logoPreview && <img src={logoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 500, color: THEME.colors.ink }}>
                            {formData.organizationName || '—'}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: THEME.colors.gray }}>
                            {formData.location || '—'}
                          </div>
                        </div>
                      </div>
                      <ReviewItem label="Email" value={formData.email} />
                      <ReviewItem label="Password" value="••••••••••" />
                    </ReviewSection>

                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => {
                            setAgreeTerms(e.target.checked);
                            if (errors.terms) {
                              setErrors(prev => ({ ...prev, terms: '' }));
                            }
                          }}
                          className="checkbox-input"
                          disabled={isSubmitting}
                        />
                        <span>
                          I agree to the{' '}
                          <button type="button" onClick={goToTerms} className="btn-link">
                            Terms of Service
                          </button>
                          {' '}and{' '}
                          <button type="button" onClick={goToPrivacy} className="btn-link">
                            Privacy Policy
                          </button>
                          . I confirm that I am authorized to set up an organization account.
                        </span>
                      </label>
                      {errors.terms && <span className="error-text">{errors.terms}</span>}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
                  {currentStep > 0 && (
                    <button 
                      type="button" 
                      onClick={goBack}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                  )}
                  
                  {currentStep < STEPS.length - 1 ? (
                    <button 
                      type="button" 
                      onClick={goNext}
                      className="btn-primary"
                      style={{ flex: 1 }}
                    >
                      Continue
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={isSubmitting || !agreeTerms}
                      className="btn-primary"
                      style={{ flex: 1 }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {isSubmitting && <Spinner />}
                        <span>{isSubmitting ? 'Creating account...' : 'Create account'}</span>
                      </span>
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Trust Badges */}
            <div className="trust-badges">
              {[['Encrypted', 'AES-256'], ['Security', 'Enterprise'], ['Cloud', 'Contabo']].map(([label, sub]) => (
                <div key={label} className="trust-badge">
                  <span className="trust-badge-dot">●</span>
                  <span className="trust-badge-label">{label}</span>
                  <span>{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="site-footer">
          <div className="footer-content">
            <div className="footer-grid">
              <div>
                <div className="footer-brand">
                  <Logo size={18} color={THEME.colors.bone} />
                  <span className="footer-brand-text">Rest Point</span>
                </div>
                <p className="footer-description">
                  The complete mortuary operating system, built for East Africa.
                </p>
              </div>
              <div>
                <h4 className="footer-heading">Product</h4>
                <div className="footer-link">Features</div>
                <div className="footer-link">Family portal</div>
                <div className="footer-link">Marketplace</div>
                <div className="footer-link">Pricing</div>
              </div>
              <div>
                <h4 className="footer-heading">Legal</h4>
                <div onClick={goPrivacy} className="footer-link">Privacy policy</div>
                <div onClick={goTerms} className="footer-link">Terms of service</div>
                <div className="footer-link">Security</div>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© {new Date().getFullYear()} Rest Point Technologies. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}