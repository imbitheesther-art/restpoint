import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

// ============================================================
// COMPLETE PROFESSIONAL ONBOARDING FLOW
// Self-contained, no external dependencies, fully functional
// ============================================================

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
};

const STEPS = [
  { key: 'org', label: 'Organization', description: 'Basic details about your funeral home' },
  { key: 'security', label: 'Security', description: 'Create a secure password' },
  { key: 'review', label: 'Review', description: 'Verify your information' },
];

// Utilities
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  const texts = ['Enter password', 'Weak', 'Medium', 'Strong'];
  return texts[strength] || 'Strong';
};

// Components
const Logo = ({ size = 20, color = THEME.colors.ink }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="1" />
    <path d="M16 8.5V23.5M9.5 16H22.5" stroke={color} strokeWidth="1" />
    <circle cx="16" cy="16" r="2.5" fill={color} />
  </svg>
);

const Spinner = () => (
  <span style={{
    width: '14px',
    height: '14px',
    border: '2px solid rgba(250,248,244,0.35)',
    borderTopColor: THEME.colors.bone,
    borderRadius: '50%',
    animation: 'spin 0.65s linear infinite',
    display: 'inline-block',
  }} />
);

const AlertMessage = ({ type, text }) => {
  if (!text) return null;
  
  const config = {
    error: { bg: THEME.colors.redBg, border: THEME.colors.redLine, color: THEME.colors.red },
    success: { bg: THEME.colors.successBg, border: THEME.colors.successLine, color: THEME.colors.success },
  };
  
  const style = config[type] || config.error;
  
  return (
    <div style={{
      background: style.bg,
      border: `1px solid ${style.border}`,
      color: style.color,
      padding: THEME.spacing.md,
      borderRadius: THEME.borderRadius.md,
      fontSize: '0.82rem',
      fontWeight: 500,
      marginBottom: THEME.spacing.lg,
    }}>
      {text}
    </div>
  );
};

const PasswordInput = ({ label, value, onChange, showPassword, onToggle, hasError, errorMessage, disabled, placeholder }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div style={{ marginBottom: THEME.spacing.lg }}>
      <label style={{
        display: 'block',
        fontFamily: THEME.typography.monoFamily,
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: THEME.colors.gray,
        marginBottom: THEME.spacing.sm,
      }}>
        {label} <span style={{ color: THEME.colors.red }}>*</span>
      </label>
      <div style={{
        position: 'relative',
        border: `1px solid ${hasError ? THEME.colors.red : isFocused ? THEME.colors.brass : THEME.colors.line}`,
        borderRadius: THEME.borderRadius.md,
        background: THEME.colors.white,
        transition: 'all 0.2s',
        boxShadow: isFocused ? `0 0 0 3px rgba(139,115,85,0.12)` : 'none',
      }}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            padding: `${THEME.spacing.md} ${THEME.spacing.xxl} ${THEME.spacing.md} ${THEME.spacing.md}`,
            background: 'transparent',
            border: 'none',
            borderRadius: THEME.borderRadius.md,
            fontSize: '0.88rem',
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
        >
          {showPassword ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {errorMessage && (
        <span style={{ display: 'block', color: THEME.colors.red, fontSize: '0.7rem', marginTop: THEME.spacing.xs }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
};

const StepIndicator = ({ currentStep, onStepClick }) => {
  const progressPercentage = (currentStep / (STEPS.length - 1)) * 100;
  
  return (
    <div style={{ position: 'relative', padding: '2rem 0 2.5rem', marginBottom: '1.5rem' }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '8%',
        right: '8%',
        height: '2px',
        background: THEME.colors.line,
        transform: 'translateY(-50%)',
      }} />
      
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '8%',
        height: '2px',
        background: THEME.colors.brass,
        width: `${progressPercentage}%`,
        transform: 'translateY(-50%)',
        transition: 'width 0.4s ease',
      }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: isCompleted ? 'pointer' : 'default' }} onClick={() => isCompleted && onStepClick(index)}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: (isCompleted || isCurrent) ? THEME.colors.brass : THEME.colors.bone,
                border: `2px solid ${(isCompleted || isCurrent) ? THEME.colors.brass : THEME.colors.line}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: (isCompleted || isCurrent) ? THEME.colors.white : THEME.colors.gray,
                fontSize: '0.72rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}>
                {isCompleted ? '✓' : index + 1}
              </div>
              <div style={{ marginTop: '0.4rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: THEME.colors.ink, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {step.label}
                </div>
                <div style={{ fontSize: '0.68rem', color: THEME.colors.gray, marginTop: '0.15rem', maxWidth: '120px' }}>
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FileUpload = ({ label, preview, onUpload, error }) => {
  const handleClick = () => document.getElementById('file-upload').click();
  
  return (
    <div style={{ marginBottom: THEME.spacing.lg }}>
      <label style={{
        display: 'block',
        fontFamily: THEME.typography.monoFamily,
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: THEME.colors.gray,
        marginBottom: THEME.spacing.sm,
      }}>
        {label} <span style={{ color: THEME.colors.red }}>*</span>
      </label>
      <div onClick={handleClick} style={{
        width: '80px',
        height: '80px',
        margin: '0 auto',
        border: `2px dashed ${error ? THEME.colors.red : preview ? THEME.colors.brass : THEME.colors.line}`,
        borderRadius: '50%',
        background: THEME.colors.bone2,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'all 0.25s',
      }}>
        {preview ? (
          <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={THEME.colors.gray} strokeWidth="1.4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span style={{ fontSize: '0.7rem', color: THEME.colors.gray }}>Click</span>
          </div>
        )}
      </div>
      <input id="file-upload" type="file" accept="image/jpeg,image/png,image/jpg,image/svg+xml" onChange={onUpload} style={{ display: 'none' }} />
      {error && <span style={{ display: 'block', color: THEME.colors.red, fontSize: '0.7rem', marginTop: THEME.spacing.xs }}>{error}</span>}
      <span style={{ display: 'block', textAlign: 'center', fontSize: '0.68rem', color: THEME.colors.gray, marginTop: THEME.spacing.sm }}>
        PNG, JPG or SVG (max 10MB)
      </span>
    </div>
  );
};

const ReviewItem = ({ label, value }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${THEME.spacing.md} ${THEME.spacing.lg}`,
    borderBottom: `1px solid ${THEME.colors.line}`,
    fontSize: '0.82rem',
  }}>
    <span style={{ color: THEME.colors.gray }}>{label}</span>
    <span style={{ color: THEME.colors.ink, fontWeight: 500 }}>{value || '—'}</span>
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

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  }, [errors]);

  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: 'File size must be less than 10MB' }));
      return;
    }
    
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
      setErrors(prev => ({ ...prev, logo: 'Only JPG, PNG, or SVG allowed' }));
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
    if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name required';
    if (!formData.email.trim()) newErrors.email = 'Email required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Valid email required';
    if (!formData.location.trim()) newErrors.location = 'Location required';
    if (!logoFile && !logoPreview) newErrors.logo = 'Logo required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, logoFile, logoPreview]);

  const validateStep2 = useCallback(() => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Password required';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) newErrors.password = `Must have: ${passwordErrors.join(', ')}`;
    }
    if (!formData.verifyPassword) {
      newErrors.verifyPassword = 'Please confirm password';
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
      setErrors({ terms: 'You must agree to terms' });
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
      
      const response = await api.post('/api/tenant/onboarding/organization', submitData, {
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
  }, [formData, logoFile, agreeTerms, navigate, logoPreview]);

  const passwordStrength = getPasswordStrength(formData.password);

  const goToLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const goToTerms = useCallback(() => navigate('/terms'), [navigate]);
  const goToPrivacy = useCallback(() => navigate('/privacy'), [navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${THEME.colors.bone}; color: ${THEME.colors.gray}; font-family: ${THEME.typography.fontFamily}; -webkit-font-smoothing: antialiased; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .fade-in { animation: fadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 300,
        background: 'rgba(250,248,244,0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${THEME.colors.line}`,
        padding: '1rem 0',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', background: 'none', border: 'none' }} onClick={() => window.scrollTo({ top: 0 })}>
            <Logo size={20} />
            <span style={{ fontFamily: THEME.typography.displayFamily, fontSize: '1rem', fontWeight: 500, color: THEME.colors.ink }}>Rest Point</span>
          </button>
          <button onClick={goToLogin} style={{
            background: 'transparent',
            color: THEME.colors.ink,
            border: `1px solid ${THEME.colors.ink}`,
            padding: '0.4rem 1rem',
            fontSize: '0.78rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            borderRadius: THEME.borderRadius.sm,
          }} onMouseEnter={(e) => { e.target.style.background = THEME.colors.ink; e.target.style.color = THEME.colors.bone; }} onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = THEME.colors.ink; }}>
            Log in
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={{ paddingTop: '70px', flex: 1 }}>
        <section style={{ padding: '2rem 0 1rem' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.75rem' }}>
            
            {/* Step Indicator */}
            <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease' }}>
              <StepIndicator currentStep={currentStep} onStepClick={(index) => { if (index < currentStep) { setCurrentStep(index); window.scrollTo({ top: 0, behavior: 'smooth' }); } }} />
            </div>

            {/* Card */}
            <div style={{
              background: THEME.colors.white,
              border: `1px solid ${THEME.colors.line}`,
              padding: THEME.spacing.xxxl,
              boxShadow: '0 20px 60px -16px ' + THEME.colors.shadow,
              borderRadius: THEME.borderRadius.lg,
              marginBottom: '1.5rem',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(18px)',
              transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
            }}>
              
              {/* Header */}
              <div style={{ marginBottom: THEME.spacing.xxl }}>
                <h1 style={{
                  fontFamily: THEME.typography.displayFamily,
                  fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                  fontWeight: 500,
                  color: THEME.colors.ink,
                  marginBottom: THEME.spacing.sm,
                  lineHeight: 1.15,
                }}>
                  {currentStep === 0 && <>Tell us about your <span style={{ color: THEME.colors.brass, fontStyle: 'italic' }}>organization</span></>}
                  {currentStep === 1 && <>Secure your <span style={{ color: THEME.colors.brass, fontStyle: 'italic' }}>account</span></>}
                  {currentStep === 2 && <>Review and <span style={{ color: THEME.colors.brass, fontStyle: 'italic' }}>confirm</span></>}
                </h1>
                <p style={{ fontSize: '0.88rem', color: THEME.colors.gray, lineHeight: 1.6 }}>
                  {currentStep === 0 && 'Basic details so families and your team know who they\'re working with.'}
                  {currentStep === 1 && 'A password only your team will use to sign in to Rest Point.'}
                  {currentStep === 2 && 'Check everything looks right, then create your account.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <AlertMessage type="success" text={apiSuccess} />
                <AlertMessage type="error" text={apiError} />

                {/* Step 0 */}
                {currentStep === 0 && (
                  <div className="fade-in">
                    <FileUpload label="Organization logo" preview={logoPreview} onUpload={handleLogoUpload} error={errors.logo} />

                    <div style={{ marginBottom: THEME.spacing.lg }}>
                      <label style={{
                        display: 'block',
                        fontFamily: THEME.typography.monoFamily,
                        fontSize: '0.7rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: THEME.colors.gray,
                        marginBottom: THEME.spacing.sm,
                      }}>
                        Organization name <span style={{ color: THEME.colors.red }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleChange}
                        placeholder="e.g., Nairobi Funeral Home"
                        style={{
                          width: '100%',
                          padding: `${THEME.spacing.md} ${THEME.spacing.md}`,
                          fontSize: '0.88rem',
                          fontFamily: THEME.typography.fontFamily,
                          border: `1px solid ${errors.organizationName ? THEME.colors.red : THEME.colors.line}`,
                          borderRadius: THEME.borderRadius.md,
                          background: THEME.colors.bone,
                          color: THEME.colors.ink,
                          outline: 'none',
                          transition: 'all 0.2s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = THEME.colors.brass}
                        onBlur={(e) => e.target.style.borderColor = errors.organizationName ? THEME.colors.red : THEME.colors.line}
                        disabled={isSubmitting}
                      />
                      {errors.organizationName && <span style={{ display: 'block', color: THEME.colors.red, fontSize: '0.7rem', marginTop: THEME.spacing.xs }}>{errors.organizationName}</span>}
                    </div>

                    <div style={{ marginBottom: THEME.spacing.lg }}>
                      <label style={{
                        display: 'block',
                        fontFamily: THEME.typography.monoFamily,
                        fontSize: '0.7rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: THEME.colors.gray,
                        marginBottom: THEME.spacing.sm,
                      }}>
                        Email <span style={{ color: THEME.colors.red }}>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="info@funeralhome.co.ke"
                        style={{
                          width: '100%',
                          padding: `${THEME.spacing.md} ${THEME.spacing.md}`,
                          fontSize: '0.88rem',
                          fontFamily: THEME.typography.fontFamily,
                          border: `1px solid ${errors.email ? THEME.colors.red : THEME.colors.line}`,
                          borderRadius: THEME.borderRadius.md,
                          background: THEME.colors.bone,
                          color: THEME.colors.ink,
                          outline: 'none',
                          transition: 'all 0.2s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = THEME.colors.brass}
                        onBlur={(e) => e.target.style.borderColor = errors.email ? THEME.colors.red : THEME.colors.line}
                        disabled={isSubmitting}
                      />
                      {errors.email && <span style={{ display: 'block', color: THEME.colors.red, fontSize: '0.7rem', marginTop: THEME.spacing.xs }}>{errors.email}</span>}
                    </div>

                    <div style={{ marginBottom: THEME.spacing.lg }}>
                      <label style={{
                        display: 'block',
                        fontFamily: THEME.typography.monoFamily,
                        fontSize: '0.7rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: THEME.colors.gray,
                        marginBottom: THEME.spacing.sm,
                      }}>
                        Location <span style={{ color: THEME.colors.red }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Nairobi, Kenya"
                        style={{
                          width: '100%',
                          padding: `${THEME.spacing.md} ${THEME.spacing.md}`,
                          fontSize: '0.88rem',
                          fontFamily: THEME.typography.fontFamily,
                          border: `1px solid ${errors.location ? THEME.colors.red : THEME.colors.line}`,
                          borderRadius: THEME.borderRadius.md,
                          background: THEME.colors.bone,
                          color: THEME.colors.ink,
                          outline: 'none',
                          transition: 'all 0.2s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = THEME.colors.brass}
                        onBlur={(e) => e.target.style.borderColor = errors.location ? THEME.colors.red : THEME.colors.line}
                        disabled={isSubmitting}
                      />
                      {errors.location && <span style={{ display: 'block', color: THEME.colors.red, fontSize: '0.7rem', marginTop: THEME.spacing.xs }}>{errors.location}</span>}
                    </div>
                  </div>
                )}

                {/* Step 1 */}
                {currentStep === 1 && (
                  <div className="fade-in">
                    <PasswordInput
                      label="Password"
                      value={formData.password}
                      onChange={(e) => handleChange({ target: { name: 'password', value: e.target.value } })}
                      showPassword={showPassword}
                      onToggle={() => setShowPassword(!showPassword)}
                      hasError={!!errors.password}
                      errorMessage={errors.password}
                      disabled={isSubmitting}
                      placeholder="Create a strong password"
                    />
                    
                    {formData.password && (
                      <div style={{ marginBottom: THEME.spacing.lg }}>
                        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                          {[1, 2, 3].map((level) => (
                            <div key={level} style={{
                              flex: 1,
                              height: '3px',
                              background: passwordStrength >= level ? getPasswordStrengthColor(passwordStrength) : THEME.colors.line,
                              borderRadius: '2px',
                              transition: 'background 0.2s',
                            }} />
                          ))}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: getPasswordStrengthColor(passwordStrength) }}>
                          {getPasswordStrengthText(passwordStrength)} password
                        </div>
                      </div>
                    )}

                    <PasswordInput
                      label="Verify password"
                      value={formData.verifyPassword}
                      onChange={(e) => handleChange({ target: { name: 'verifyPassword', value: e.target.value } })}
                      showPassword={showVerifyPassword}
                      onToggle={() => setShowVerifyPassword(!showVerifyPassword)}
                      hasError={!!errors.verifyPassword || !!errors.passwordMatch}
                      errorMessage={errors.verifyPassword || errors.passwordMatch}
                      disabled={isSubmitting}
                      placeholder="Confirm your password"
                    />
                    
                    {formData.verifyPassword && formData.password === formData.verifyPassword && formData.password && (
                      <div style={{ fontSize: '0.7rem', color: THEME.colors.verdigris, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Passwords match
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2 */}
                {currentStep === 2 && (
                  <div className="fade-in">
                    <div style={{ border: `1px solid ${THEME.colors.line}`, borderRadius: THEME.borderRadius.md, overflow: 'hidden', marginBottom: THEME.spacing.lg }}>
                      <div style={{ padding: `${THEME.spacing.md} ${THEME.spacing.lg}`, background: THEME.colors.bone, borderBottom: `1px solid ${THEME.colors.line}`, fontSize: '0.82rem', fontWeight: 600, color: THEME.colors.ink }}>
                        Organization Details
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '1rem 1.1rem', borderBottom: `1px solid ${THEME.colors.line}` }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: THEME.colors.bone2, flexShrink: 0, border: `1px solid ${THEME.colors.line}` }}>
                          {logoPreview && <img src={logoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 500, color: THEME.colors.ink }}>{formData.organizationName || '—'}</div>
                          <div style={{ fontSize: '0.76rem', color: THEME.colors.gray }}>{formData.location || '—'}</div>
                        </div>
                      </div>
                      <ReviewItem label="Email" value={formData.email} />
                      <ReviewItem label="Password" value="••••••••••" />
                    </div>

                    <div style={{ marginBottom: THEME.spacing.lg }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: THEME.spacing.sm, cursor: 'pointer', fontSize: '0.82rem', color: THEME.colors.gray, lineHeight: 1.5 }}>
                        <input type="checkbox" checked={agreeTerms} onChange={(e) => { setAgreeTerms(e.target.checked); if (errors.terms) setErrors(prev => ({ ...prev, terms: '' })); }} style={{ width: '1rem', height: '1rem', cursor: 'pointer', marginTop: '0.15rem', accentColor: THEME.colors.brass }} disabled={isSubmitting} />
                        <span>
                          I agree to the{' '}
                          <button type="button" onClick={goToTerms} style={{ background: 'none', border: 'none', color: THEME.colors.gray, cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</button>
                          {' '}and{' '}
                          <button type="button" onClick={goToPrivacy} style={{ background: 'none', border: 'none', color: THEME.colors.gray, cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</button>.
                        </span>
                      </label>
                      {errors.terms && <span style={{ display: 'block', color: THEME.colors.red, fontSize: '0.7rem', marginTop: THEME.spacing.xs }}>{errors.terms}</span>}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
                  {currentStep > 0 && (
                    <button type="button" onClick={goBack} style={{
                      background: 'transparent',
                      color: THEME.colors.ink,
                      border: `1px solid ${THEME.colors.line}`,
                      padding: '0.7rem 1.2rem',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      fontFamily: THEME.typography.fontFamily,
                      borderRadius: THEME.borderRadius.sm,
                      transition: 'all 0.2s',
                    }} onMouseEnter={(e) => e.target.style.borderColor = THEME.colors.ink} onMouseLeave={(e) => e.target.style.borderColor = THEME.colors.line}>
                      Back
                    </button>
                  )}
                  
                  {currentStep < STEPS.length - 1 ? (
                    <button type="button" onClick={goNext} style={{
                      flex: 1,
                      padding: `${THEME.spacing.md} ${THEME.spacing.lg}`,
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      fontFamily: THEME.typography.fontFamily,
                      border: 'none',
                      borderRadius: THEME.borderRadius.sm,
                      cursor: 'pointer',
                      background: THEME.colors.ink,
                      color: THEME.colors.bone,
                      transition: 'background 0.2s',
                      minHeight: '48px',
                    }} onMouseEnter={(e) => e.target.style.background = '#000'} onMouseLeave={(e) => e.target.style.background = THEME.colors.ink}>
                      Continue
                    </button>
                  ) : (
                    <button type="submit" disabled={isSubmitting || !agreeTerms} style={{
                      flex: 1,
                      padding: `${THEME.spacing.md} ${THEME.spacing.lg}`,
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      fontFamily: THEME.typography.fontFamily,
                      border: 'none',
                      borderRadius: THEME.borderRadius.sm,
                      cursor: isSubmitting || !agreeTerms ? 'not-allowed' : 'pointer',
                      background: THEME.colors.ink,
                      color: THEME.colors.bone,
                      transition: 'background 0.2s',
                      minHeight: '48px',
                      opacity: isSubmitting || !agreeTerms ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem',
                    }} onMouseEnter={(e) => !isSubmitting && !agreeTerms && (e.target.style.background = '#000')} onMouseLeave={(e) => !isSubmitting && !agreeTerms && (e.target.style.background = THEME.colors.ink)}>
                      {isSubmitting && <Spinner />}
                      <span>{isSubmitting ? 'Creating account...' : 'Create account'}</span>
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Trust Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease 200ms', marginBottom: '1.5rem' }}>
              {[['Encrypted', 'AES-256'], ['Security', 'Enterprise'], ['Cloud', 'Contabo']].map(([label, sub]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', border: `1px solid ${THEME.colors.line}`, padding: '0.25rem 0.65rem', fontSize: '0.68rem', color: THEME.colors.gray, background: THEME.colors.white, borderRadius: THEME.borderRadius.sm }}>
                  <span style={{ color: THEME.colors.brass, fontSize: '0.7rem' }}>●</span>
                  <span style={{ fontWeight: 500, color: THEME.colors.ink }}>{label}</span>
                  <span>{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: THEME.colors.ink, color: THEME.colors.grayLight, padding: `${THEME.spacing.xxl} 0 ${THEME.spacing.xl}`, marginTop: 'auto' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: THEME.spacing.xxl, paddingBottom: THEME.spacing.xxl, borderBottom: `1px solid ${THEME.colors.lineDark}` }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: THEME.spacing.md }}>
                  <Logo size={18} color={THEME.colors.bone} />
                  <span style={{ fontFamily: THEME.typography.displayFamily, fontSize: '1rem', color: THEME.colors.bone }}>Rest Point</span>
                </div>
                <p style={{ maxWidth: '260px', fontSize: '0.82rem', color: THEME.colors.grayLight, lineHeight: 1.6 }}>
                  The complete mortuary operating system, built for East Africa.
                </p>
              </div>
              <div>
                <h4 style={{ fontFamily: THEME.typography.monoFamily, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: THEME.colors.brassHover, marginBottom: THEME.spacing.lg }}>Product</h4>
                {['Features', 'Family portal', 'Marketplace', 'Pricing'].map(link => (
                  <div key={link} style={{ display: 'block', fontSize: '0.82rem', color: THEME.colors.grayLight, marginBottom: THEME.spacing.sm, cursor: 'pointer' }}>{link}</div>
                ))}
              </div>
              <div>
                <h4 style={{ fontFamily: THEME.typography.monoFamily, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: THEME.colors.brassHover, marginBottom: THEME.spacing.lg }}>Legal</h4>
                <div onClick={goToPrivacy} style={{ display: 'block', fontSize: '0.82rem', color: THEME.colors.grayLight, marginBottom: THEME.spacing.sm, cursor: 'pointer' }}>Privacy policy</div>
                <div onClick={goToTerms} style={{ display: 'block', fontSize: '0.82rem', color: THEME.colors.grayLight, marginBottom: THEME.spacing.sm, cursor: 'pointer' }}>Terms of service</div>
              </div>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(250,248,244,0.45)', paddingTop: THEME.spacing.xl }}>
              © {new Date().getFullYear()} Rest Point. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}