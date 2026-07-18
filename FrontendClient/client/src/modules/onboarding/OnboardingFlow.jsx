import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, Menu, X, ArrowRight, Eye, EyeOff,
  Upload, Plus, Trash2, Check, AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import { io } from 'socket.io-client';
import Footer from '../../components/layout/Footer';
import env from '../../utils/config/env';

const C = {
  ink: '#15171A',
  bone: '#FAF8F4',
  bone2: '#F3EFE6',
  brass: '#8B7355',
  brassLight: '#A98F6E',
  verdigris: '#3D4F47',
  verdigrisDark: '#2E3F37',
  verdigrisLight: '#4D6359',
  verdigrisTint: '#EBEFEF',
  line: '#E3DDD0',
  lineDark: 'rgba(250,248,244,0.14)',
  gray: '#6B6862',
  grayLight: 'rgba(250,248,244,0.62)',
  accent: '#C77B5E',
  red: '#9B4A3F',
  redBg: '#F7ECE9',
  success: '#475A43',
  successBg: '#EEF3EC',
};

const STEPS = [
  { key: 'org', label: 'Organization', description: 'Basic details' },
  { key: 'security', label: 'Security', description: 'Create password' },
  { key: 'review', label: 'Review', description: 'Verify info' },
];

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('8+ characters');
  if (!/[A-Z]/.test(password)) errors.push('1 uppercase');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('1 special char');
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
  if (strength === 0) return C.gray;
  if (strength === 1) return C.red;
  if (strength === 2) return C.brass;
  return C.verdigris;
};

const getPasswordStrengthText = (strength) => {
  const texts = ['Enter password', 'Weak', 'Medium', 'Strong'];
  return texts[strength] || 'Strong';
};

const Mark = ({ size = 28, color = C.verdigris }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="1.5" />
    <path d="M16 8V24M8 16H24" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="16" r="3.5" fill={color} />
  </svg>
);

const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callback();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
};

const PolicyDropdown = ({ navigate, goTerms }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const policies = [
    { label: 'Terms of Service', onClick: goTerms },
    { label: 'Privacy Policy', onClick: () => navigate('/privacy') },
    { label: 'Security Policy', onClick: () => navigate('/security') },
    { label: 'Data Migration Policy', onClick: () => navigate('/data-migration') },
    { label: 'SLA Policy', onClick: () => navigate('/sla') },
    { label: 'Release Notes', onClick: () => navigate('/releases') },
    { label: 'Account Deletion', onClick: () => navigate('/account-deletion') },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        Policies<ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
      </button>
      {open && (
        <div className="dropdown-menu">
          {policies.map((p, i) => (
            <button key={i} onClick={() => { p.onClick(); setOpen(false); }} className="dropdown-item">
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MobileMenu = ({ navigate, goTerms, goLogin, goStart }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const policies = [
    { label: 'Terms of Service', onClick: goTerms },
    { label: 'Privacy Policy', onClick: () => navigate('/privacy') },
    { label: 'Data Migration Policy', onClick: () => navigate('/data-migration') },
    { label: 'SLA Policy', onClick: () => navigate('/sla') },
    { label: 'Release Notes', onClick: () => navigate('/releases') },
    { label: 'Account Deletion', onClick: () => navigate('/account-deletion') },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }} className="mobile-nav">
      <button onClick={() => setOpen(!open)} className="nav-link" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && (
        <div className="mobile-menu-container">
          <button onClick={() => { navigate('/'); setOpen(false); }} className="mobile-link">Home</button>
          <button onClick={() => { navigate('/about-welt-tallis'); setOpen(false); }} className="mobile-link">About</button>
          <div className="mobile-policies-header">
            <div className="mono-label" style={{ color: C.brass, padding: '0.6rem 1.2rem' }}>Policies</div>
            {policies.map((p, i) => (
              <button key={i} onClick={() => { p.onClick(); setOpen(false); }} className="mobile-link" style={{ paddingLeft: '2rem', fontSize: '0.82rem' }}>{p.label}</button>
            ))}
          </div>
          <button onClick={() => { goLogin(); setOpen(false); }} className="mobile-link">Log in</button>
          <button onClick={() => { goStart(); setOpen(false); }} className="mobile-link" style={{ color: C.verdigris, fontWeight: 600 }}>Request access</button>
        </div>
      )}
    </div>
  );
};

const Spinner = () => (
  <span className="spinner" />
);

const AlertMessage = ({ type, text }) => {
  if (!text) return null;
  const config = {
    error: { bg: C.redBg, border: C.red, color: C.red },
    success: { bg: C.successBg, border: C.success, color: C.success },
  };
  const style = config[type] || config.error;
  return (
    <div className="alert-message" style={{ background: style.bg, borderColor: style.border, color: style.color }}>
      <AlertCircle size={16} />
      <span>{text}</span>
    </div>
  );
};

const PasswordInput = ({ label, value, onChange, showPassword, onToggle, hasError, errorMessage, disabled, placeholder }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="form-group">
      <label className="form-label">{label} <span style={{ color: C.red }}>*</span></label>
      <div className="input-wrapper" style={{ border: `1px solid ${hasError ? C.red : isFocused ? C.brass : C.line}`, boxShadow: isFocused ? `0 0 0 3px rgba(139,115,85,0.12)` : 'none' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="form-input"
          style={{ paddingRight: '2.5rem' }}
        />
        <button type="button" onClick={onToggle} disabled={disabled} className="input-icon-btn">
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errorMessage && <span className="form-error">{errorMessage}</span>}
    </div>
  );
};

const StepIndicator = ({ currentStep, onStepClick }) => {
  const progressPercentage = (currentStep / (STEPS.length - 1)) * 100;

  return (
    <div className="step-indicator">
      <div className="step-line-bg" />
      <div className="step-line-fg" style={{ width: `${progressPercentage}%` }} />

      <div className="step-circles">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.key} className="step-item" onClick={() => isCompleted && onStepClick(index)} style={{ cursor: isCompleted ? 'pointer' : 'default' }}>
              <div className={`step-circle ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                {isCompleted ? <Check size={14} /> : index + 1}
              </div>
              <div className="step-text">
                <div className="step-label">{step.label}</div>
                <div className="step-desc">{step.description}</div>
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
    <div className="form-group">
      <label className="form-label">{label} <span style={{ color: C.red }}>*</span></label>
      <div onClick={handleClick} className="file-upload-circle" style={{ border: `2px dashed ${error ? C.red : preview ? C.brass : C.line}` }}>
        {preview ? (
          <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="file-upload-placeholder">
            <Upload size={24} color={C.gray} />
            <span>Click</span>
          </div>
        )}
      </div>
      <input id="file-upload" type="file" accept="image/jpeg,image/png,image/jpg,image/svg+xml" onChange={onUpload} style={{ display: 'none' }} />
      {error && <span className="form-error">{error}</span>}
      <span className="file-upload-hint">PNG, JPG or SVG (max 10MB)</span>
    </div>
  );
};

const ReviewItem = ({ label, value }) => (
  <div className="review-item">
    <span className="review-label">{label}</span>
    <span className="review-value">{value || '—'}</span>
  </div>
);

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
  const [socket, setSocket] = useState(null);
  const [progress, setProgress] = useState({ step: '', percent: 0, details: '' });

  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    location: '',
    password: '',
    verifyPassword: '',
    branchName: '',
    deploymentType: 'multi',
  });

  const [branches, setBranches] = useState([{ name: '', location: '' }]);
  const [errors, setErrors] = useState({});

  const goLogin = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); };
  const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
  const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!env.SOCKET_URL) return;
    const newSocket = io(env.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('onboarding-progress', (data) => {
      setProgress({
        step: data.step || '',
        percent: data.progress || 0,
        details: data.details || ''
      });
    });

    setSocket(newSocket);
    return () => newSocket.close();
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

    if (formData.deploymentType === 'multi') {
      const validBranches = branches.filter(b => b.name.trim());
      if (validBranches.length === 0) newErrors.branches = 'At least one branch with a name is required';
    } else {
      if (!formData.branchName.trim()) newErrors.branchName = 'Primary branch name required';
    }

    if (!logoFile && !logoPreview) newErrors.logo = 'Logo required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, logoFile, logoPreview, branches]);

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
      newErrors.verifyPassword = 'Passwords do not match';
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
    if (currentStep < 2) {
      goNext();
      return;
    }
    if (!agreeTerms) {
      setErrors({ terms: 'You must agree to terms' });
      return;
    }

    setIsSubmitting(true);
    setApiError('');
    setApiSuccess('');
    setProgress({ step: 'Initializing...', percent: 0, details: '' });

    try {
      const submitData = new FormData();
      submitData.append('organizationName', formData.organizationName);
      submitData.append('email', formData.email);
      submitData.append('location', formData.location);
      submitData.append('password', formData.password);
      submitData.append('deploymentType', formData.deploymentType);
      submitData.append('termsAccepted', agreeTerms);
      if (logoFile) submitData.append('logo', logoFile);

      if (formData.deploymentType === 'multi') {
        submitData.append('branches', JSON.stringify(branches.filter(b => b.name.trim())));
      } else {
        submitData.append('branchName', formData.branchName);
      }

      const tenantSlug = formData.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (socket && socket.connected) {
        socket.emit('join-tenant', { tenantSlug, userId: 'temp', userRole: 'admin' });
      }

      const response = await api.post('/onboarding/organization', submitData, {
        headers: { 'Content-Type': 'multipart/form-data', 'x-tenant-slug': '' },
        timeout: 300000,
      });

      if (response.data.success || response.status === 200 || response.status === 201) {
        setApiSuccess(response.data.message || 'Organization setup completed! Redirecting...');
        setProgress({ step: 'Complete!', percent: 100, details: 'Redirecting to dashboard...' });

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
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Setup failed.');
      }
    } catch (error) {
      setIsSubmitting(false);
      setProgress({ step: '', percent: 0, details: '' });
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
  }, [formData, logoFile, agreeTerms, navigate, logoPreview, currentStep, goNext, socket]);

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="page-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',sans-serif;color:${C.gray};background:${C.bone};-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fraunces',serif;font-weight:500;letter-spacing:-0.01em;color:${C.ink}}
        p{line-height:1.75;font-size:1rem;color:${C.gray}}
        
        .mono-label{font-family:'JetBrains Mono',monospace;font-size:0.75rem;letter-spacing:0.14em;text-transform:uppercase;color:${C.brass};font-weight:500;display:inline-flex;align-items:center;gap:0.5rem}
        
        .btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 1.9rem;font-size:0.9rem;font-weight:500;font-family:'Inter',sans-serif;border:1px solid transparent;border-radius:8px;cursor:pointer;transition:all 0.3s ease;white-space:nowrap;letter-spacing:0.01em}
        .btn-brass{background:${C.brass};color:${C.bone};border:none}
        .btn-brass:hover{background:${C.brassLight};transform:translateY(-2px);box-shadow:0 10px 20px rgba(139,115,85,0.25)}
        .btn-ghost{background:transparent;color:${C.bone};border:1px solid rgba(250,248,244,0.3)}
        .btn-ghost:hover{background:rgba(250,248,244,0.1);border-color:${C.bone}}
        
        .wrap{max-width:1180px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
        
        nav{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(250,248,244,0.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid ${C.line};padding:1.2rem 0}
        .nav-wrap{display:flex;justify-content:space-between;align-items:center}
        .logo{display:flex;align-items:center;gap:0.7rem;font-family:'Fraunces',serif;font-size:1.3rem;font-weight:500;color:${C.ink};cursor:pointer}
        .nav-links{display:flex;gap:2.5rem;align-items:center}
        .nav-link{font-size:0.85rem;color:${C.gray};text-decoration:none;cursor:pointer;transition:color 0.2s;background:transparent;border:none;font-family:'Inter',sans-serif;padding:0.5rem 0}
        .nav-link:hover{color:${C.verdigris}}
        .nav-cta{display:flex;gap:0.75rem;align-items:center}
        .mobile-nav{display:none}
        
        .dropdown-menu{position:absolute;top:100%;left:0;background:${C.bone};border:1px solid ${C.line};border-radius:8px;min-width:260px;margin-top:0.75rem;z-index:1000;box-shadow:0 20px 40px rgba(21,23,26,0.08);overflow:hidden}
        .dropdown-item{width:100%;padding:0.9rem 1.2rem;background:none;border:none;text-align:left;cursor:pointer;font-size:0.85rem;color:${C.gray};border-bottom:1px solid ${C.line};transition:all 0.2s;font-family:'Inter',sans-serif}
        .dropdown-item:last-child{border-bottom:none}
        .dropdown-item:hover{background:${C.bone2};color:${C.ink}}
        
        .mobile-menu-container{position:absolute;top:100%;right:0;background:${C.bone};border:1px solid ${C.line};border-radius:8px;min-width:280px;margin-top:0.75rem;z-index:1000;box-shadow:0 20px 40px rgba(21,23,26,0.08);overflow:hidden}
        .mobile-link{display:block;width:100%;padding:0.9rem 1.2rem;background:none;border:none;text-align:left;cursor:pointer;font-size:0.88rem;color:${C.gray};text-decoration:none;border-bottom:1px solid ${C.line};font-family:'Inter',sans-serif;transition:background 0.2s}
        .mobile-link:hover{background:${C.bone2}}
        .mobile-policies-header{padding:0.5rem 0;border-bottom:1px solid ${C.line};background:${C.bone2}}

        /* Main Layout */
        .main-content { padding-top: 100px; padding-bottom: 4rem; flex: 1; display: flex; justify-content: center; }
        .form-card { background: ${C.bone}; border: 1px solid ${C.line}; padding: clamp(1.5rem, 4vw, 2.5rem); box-shadow: 0 20px 40px -15px rgba(21,23,26,0.1); border-radius: 16px; width: 100%; max-width: 640px; }
        
        /* Step Indicator */
        .step-indicator { position: relative; padding: 2rem 0 2.5rem; margin-bottom: 1.5rem; }
        .step-line-bg { position: absolute; top: 20px; left: 20px; right: 20px; height: 2px; background: ${C.line}; z-index: 0; }
        .step-line-fg { position: absolute; top: 20px; left: 20px; height: 2px; background: ${C.brass}; width: 0%; z-index: 1; transition: width 0.4s ease; }
        .step-circles { display: flex; justify-content: space-between; position: relative; z-index: 2; }
        .step-item { display: flex; flex-direction: column; align-items: center; width: 33.33%; }
        .step-circle { width: 40px; height: 40px; border-radius: 50%; background: ${C.bone}; border: 2px solid ${C.line}; display: flex; align-items: center; justify-content: center; color: ${C.gray}; font-size: 0.8rem; font-weight: 600; transition: all 0.3s ease; }
        .step-circle.completed { background: ${C.brass}; border-color: ${C.brass}; color: ${C.bone}; }
        .step-circle.current { border-color: ${C.brass}; color: ${C.brass}; box-shadow: 0 0 0 4px rgba(139,115,85,0.1); }
        .step-text { text-align: center; margin-top: 0.5rem; }
        .step-label { font-size: 0.8rem; font-weight: 600; color: ${C.ink}; }
        .step-desc { font-size: 0.7rem; color: ${C.gray}; }
        
        /* Form Elements */
        .form-group { margin-bottom: 1.5rem; }
        .form-label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: ${C.gray}; margin-bottom: 0.5rem; }
        .input-wrapper { position: relative; border: 1px solid ${C.line}; border-radius: 8px; background: ${C.bone}; transition: all 0.2s; }
        .form-input { width: 100%; padding: 0.8rem 1rem; background: transparent; border: none; border-radius: 8px; font-size: 0.9rem; color: ${C.ink}; font-family: 'Inter', sans-serif; outline: none; }
        .form-input::placeholder { color: ${C.gray}; }
        .input-icon-btn { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: ${C.gray}; padding: 0.5rem; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
        .input-icon-btn:hover { color: ${C.ink}; }
        .form-error { display: block; color: ${C.red}; font-size: 0.75rem; margin-top: 0.3rem; }
        
        .alert-message { display: flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid; font-size: 0.85rem; font-weight: 500; margin-bottom: 1.5rem; }
        
        /* File Upload */
        .file-upload-circle { width: 80px; height: 80px; margin: 0 auto; border-radius: 50%; background: ${C.bone2}; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; transition: all 0.25s; }
        .file-upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
        .file-upload-hint { display: block; text-align: center; font-size: 0.7rem; color: ${C.gray}; margin-top: 0.5rem; }
        
        /* Radio Cards */
        .radio-card { flex: 1; display: flex; align-items: center; gap: 0.5rem; padding: 1rem; background: ${C.bone}; border: 2px solid ${C.line}; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .radio-card.active { border-color: ${C.brass}; }
        
        /* Branch Card */
        .branch-card { padding: 1rem; background: ${C.bone}; border-radius: 8px; border: 1px solid ${C.line}; margin-bottom: 1rem; }
        
        .review-item { display: flex; justify-content: space-between; padding: 0.8rem 1rem; border-bottom: 1px solid ${C.line}; font-size: 0.85rem; }
        .review-item:last-child { border-bottom: none; }
        .review-label { color: ${C.gray}; }
        .review-value { color: ${C.ink}; font-weight: 500; }
        
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(250,248,244,0.35); border-top-color: ${C.bone}; border-radius: 50%; animation: spin 0.65s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
        
        @media(max-width:800px){.nav-links{display:none}.nav-cta{display:none}.mobile-nav{display:flex;gap:0.5rem;align-items:center}}
        @media(max-width:600px){
          * { 
            max-width: 100vw !important;
            box-sizing: border-box !important;
          }
          
          html, body {
            overflow-x: hidden !important;
            width: 100vw !important;
            min-width: unset !important;
          }
          
          .page-container {
            overflow-x: hidden !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          
          .main-content { 
            padding-top: 65px !important; 
            padding-bottom: 1.5rem !important; 
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          
          .wrap {
            width: 100% !important;
            min-width: 0 !important;
            padding: 0 0.5rem !important;
            max-width: 100% !important;
          }
          
          .form-card { 
            padding: 0.85rem !important; 
            margin: 0 !important;
            border-radius: 10px !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
          }
          
          .step-indicator { 
            padding: 0.75rem 0 1.25rem !important; 
            margin-bottom: 0.75rem !important;
          }
          
          .step-circle { 
            width: 26px !important; 
            height: 26px !important; 
            font-size: 0.6rem !important;
            flex-shrink: 0;
          }
          
          .step-line-bg { 
            left: 13px !important; 
            right: 13px !important; 
            top: 13px !important; 
          }
          
          .step-line-fg { 
            left: 13px !important; 
            top: 13px !important; 
          }
          
          .step-text { 
            display: none !important; 
          }
          
          .step-circles {
            display: flex !important;
            justify-content: space-between !important;
            padding: 0 0.25rem !important;
          }
          
          h1 { 
            font-size: 1.15rem !important; 
            line-height: 1.25 !important;
            margin-bottom: 0.4rem !important;
            word-wrap: break-word !important;
          }
          
          p {
            font-size: 0.8rem !important;
            line-height: 1.5 !important;
            word-wrap: break-word !important;
          }
          
          .form-group { 
            margin-bottom: 0.85rem !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          
          .form-label { 
            font-size: 0.6rem !important;
            margin-bottom: 0.35rem !important;
            word-wrap: break-word !important;
          }
          
          .form-input { 
            padding: 0.65rem 0.7rem !important;
            font-size: 0.8rem !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          
          .input-wrapper {
            border-radius: 6px !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          
          .file-upload-circle { 
            width: 45px !important; 
            height: 45px !important; 
          }
          
          .file-upload-placeholder {
            transform: scale(0.85);
          }
          
          .file-upload-placeholder span {
            font-size: 0.6rem !important;
          }
          
          .branch-card { 
            padding: 0.5rem !important; 
            margin-bottom: 0.6rem !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          
          .review-item { 
            padding: 0.5rem 0.6rem !important; 
            font-size: 0.7rem !important; 
            flex-direction: column !important;
            gap: 0.2rem !important;
            width: 100% !important;
          }
          
          .btn {
            padding: 0.7rem 1rem !important;
            font-size: 0.75rem !important;
            max-width: 100% !important;
          }
          
          .radio-card {
            padding: 0.65rem !important;
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          
          .radio-card div:nth-child(2) div:first-child {
            font-size: 0.75rem !important;
          }
          
          .radio-card div:nth-child(2) div:last-child {
            font-size: 0.65rem !important;
          }
          
          .alert-message {
            font-size: 0.7rem !important;
            padding: 0.5rem 0.7rem !important;
            word-wrap: break-word !important;
          }
          
          .form-footer {
            margin-top: 1.25rem !important;
            padding-top: 0.85rem !important;
            flex-direction: column-reverse !important;
            gap: 0.75rem !important;
          }
          
          .form-footer button {
            width: 100% !important;
            justify-content: center !important;
          }
          
          .mono-label {
            font-size: 0.6rem !important;
          }
          
          nav {
            padding: 0.7rem 0 !important;
          }
          
          .logo {
            font-size: 1rem !important;
            gap: 0.4rem !important;
          }
          
          .logo svg {
            width: 18px !important;
            height: 18px !important;
          }
          
          .nav-wrap {
            padding: 0 0.5rem !important;
          }
          
          .mobile-menu-container {
            min-width: 250px !important;
            right: -0.5rem !important;
            max-width: 90vw !important;
          }
          
          .dropdown-menu {
            min-width: 220px !important;
            max-width: 90vw !important;
          }
          
          .radio-cards-container {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
          
          .radio-cards-container > label {
            width: 100% !important;
          }
          
          .file-upload-hint {
            font-size: 0.6rem !important;
          }
          
          .review-label,
          .review-value {
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
          }
          
          .input-icon-btn {
            padding: 0.4rem !important;
          }
        }
        
        @media(max-width:380px){
          .form-card {
            padding: 0.75rem !important;
          }
          
          h1 {
            font-size: 1.05rem !important;
          }
          
          .btn {
            padding: 0.6rem 0.85rem !important;
            font-size: 0.7rem !important;
          }
          
          .step-circle {
            width: 22px !important;
            height: 22px !important;
            font-size: 0.55rem !important;
          }
          
          .step-line-bg,
          .step-line-fg {
            left: 11px !important;
            right: 11px !important;
            top: 11px !important;
          }
          
          .form-input {
            padding: 0.6rem 0.65rem !important;
            font-size: 0.75rem !important;
          }
          
          .form-label {
            font-size: 0.55rem !important;
          }
        }
      `}</style>

      {/* Navbar */}
      <nav>
        <div className="wrap nav-wrap">
          <div className="logo" onClick={() => navigate('/')}>
            <Mark size={24} color={C.ink} />
            Rest Point
          </div>
          <div className="nav-links">
            <button onClick={() => navigate('/')} className="nav-link">Home</button>
            <PolicyDropdown navigate={navigate} goTerms={goTerms} />
          </div>
          <div className="nav-cta">
            <button onClick={goLogin} className="nav-link" style={{ paddingRight: '0.5rem' }}>Log in</button>
          </div>
          <MobileMenu navigate={navigate} goTerms={goTerms} goLogin={goLogin} goStart={goStart} />
        </div>
      </nav>

      {/* Main Container */}
      <main className="main-content">
        <div className="wrap" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="form-card">
            <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease' }}>
              <StepIndicator currentStep={currentStep} onStepClick={(index) => setCurrentStep(index)} />
            </div>

            {/* Progress Bar */}
            {isSubmitting && progress.percent > 0 && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: C.bone2, borderRadius: '8px', border: `1px solid ${C.line}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: C.ink }}>{progress.step}</span>
                  <span className="mono-label" style={{ color: C.brass }}>{progress.percent}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: C.line, borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress.percent}%`, height: '100%', background: `linear-gradient(90deg, ${C.brass}, ${C.verdigris})`, borderRadius: '3px', transition: 'width 0.4s ease' }} />
                </div>
                {progress.details && <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: C.gray, fontStyle: 'italic' }}>{progress.details}</div>}
              </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                {currentStep === 0 && <>Tell us about your <span style={{ color: C.brass, fontStyle: 'italic' }}>organization</span></>}
                {currentStep === 1 && <>Secure your <span style={{ color: C.brass, fontStyle: 'italic' }}>account</span></>}
                {currentStep === 2 && <>Review and <span style={{ color: C.brass, fontStyle: 'italic' }}>confirm</span></>}
              </h1>
              <p style={{ fontSize: '0.9rem' }}>
                {currentStep === 0 && "Basic details so families and your team know who they're working with."}
                {currentStep === 1 && 'A password only your team will use to sign in to Rest Point.'}
                {currentStep === 2 && 'Check everything looks right, then create your account.'}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <AlertMessage type="success" text={apiSuccess} />
              <AlertMessage type="error" text={apiError} />

              {/* Step 0 Content */}
              {currentStep === 0 && (
                <div className="fade-in">
                  <FileUpload label="Organization logo" preview={logoPreview} onUpload={handleLogoUpload} error={errors.logo} />

                  <div className="form-group">
                    <label className="form-label">Organization name <span style={{ color: C.red }}>*</span></label>
                    <div className="input-wrapper" style={{ border: `1px solid ${errors.organizationName ? C.red : C.line}` }}>
                      <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} placeholder="e.g., Nairobi Funeral Home" className="form-input" disabled={isSubmitting} />
                    </div>
                    {errors.organizationName && <span className="form-error">{errors.organizationName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email <span style={{ color: C.red }}>*</span></label>
                    <div className="input-wrapper" style={{ border: `1px solid ${errors.email ? C.red : C.line}` }}>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="info@funeralhome.co.ke" className="form-input" disabled={isSubmitting} />
                    </div>
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location <span style={{ color: C.red }}>*</span></label>
                    <div className="input-wrapper" style={{ border: `1px solid ${errors.location ? C.red : C.line}` }}>
                      <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Nairobi, Kenya" className="form-input" disabled={isSubmitting} />
                    </div>
                    {errors.location && <span className="form-error">{errors.location}</span>}
                  </div>

                  <div className="form-group" style={{ padding: '1rem', background: C.bone2, borderRadius: '8px', border: `1px solid ${C.line}` }}>
                    <label className="form-label" style={{ marginBottom: '0.5rem' }}>Deployment Type <span style={{ color: C.red }}>*</span></label>
                    <div className="radio-cards-container" style={{ display: 'flex', gap: '0.75rem' }}>
                      <label className={`radio-card ${formData.deploymentType === 'single' ? 'active' : ''}`}>
                        <input type="radio" name="deploymentType" value="single" checked={formData.deploymentType === 'single'} onChange={handleChange} style={{ accentColor: C.brass }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: C.ink }}>Single Tenant</div>
                          <div style={{ fontSize: '0.7rem', color: C.gray, marginTop: '0.15rem' }}>One location</div>
                        </div>
                      </label>
                      <label className={`radio-card ${formData.deploymentType === 'multi' ? 'active' : ''}`}>
                        <input type="radio" name="deploymentType" value="multi" checked={formData.deploymentType === 'multi'} onChange={handleChange} style={{ accentColor: C.brass }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: C.ink }}>Multi Tenant</div>
                          <div style={{ fontSize: '0.7rem', color: C.gray, marginTop: '0.15rem' }}>Multiple branches</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {formData.deploymentType === 'multi' ? (
                    <div className="form-group" style={{ padding: '1rem', background: C.bone2, borderRadius: '8px', border: `1px solid ${C.line}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <label className="form-label" style={{ margin: 0 }}>Branches <span style={{ color: C.red }}>*</span></label>
                        <button type="button" onClick={() => setBranches([...branches, { name: '', location: '' }])} className="btn-brass" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '4px', color: C.bone, background: C.brass, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Plus size={14} /> Add Branch
                        </button>
                      </div>
                      {errors.branches && <span className="form-error">{errors.branches}</span>}
                      {branches.map((branch, index) => (
                        <div key={index} className="branch-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.8rem', color: C.ink }}>Branch {index + 1}</span>
                            {branches.length > 1 && (
                              <button type="button" onClick={() => setBranches(branches.filter((_, i) => i !== index))} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <Trash2 size={12} /> Remove
                              </button>
                            )}
                          </div>
                          <div className="input-wrapper" style={{ marginBottom: '0.5rem' }}>
                            <input type="text" placeholder="Branch name" value={branch.name} onChange={(e) => { const newBranches = [...branches]; newBranches[index].name = e.target.value; setBranches(newBranches); }} className="form-input" />
                          </div>
                          <div className="input-wrapper">
                            <input type="text" placeholder="Branch location" value={branch.location} onChange={(e) => { const newBranches = [...branches]; newBranches[index].location = e.target.value; setBranches(newBranches); }} className="form-input" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Branch Name <span style={{ color: C.red }}>*</span></label>
                      <div className="input-wrapper" style={{ border: `1px solid ${errors.branchName ? C.red : C.line}` }}>
                        <input type="text" name="branchName" value={formData.branchName} onChange={handleChange} placeholder="e.g., Main Branch" className="form-input" disabled={isSubmitting} />
                      </div>
                      {errors.branchName && <span className="form-error">{errors.branchName}</span>}
                    </div>
                  )}
                </div>
              )}

              {/* Step 1 Content */}
              {currentStep === 1 && (
                <div className="fade-in">
                  <PasswordInput label="Password" value={formData.password} onChange={(e) => handleChange({ target: { name: 'password', value: e.target.value } })} showPassword={showPassword} onToggle={() => setShowPassword(!showPassword)} hasError={!!errors.password} errorMessage={errors.password} disabled={isSubmitting} placeholder="Create a strong password" />

                  {formData.password && (
                    <div className="form-group">
                      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                        {[1, 2, 3].map((level) => (
                          <div key={level} style={{ flex: 1, height: '4px', background: level <= passwordStrength ? getPasswordStrengthColor(passwordStrength) : C.line, borderRadius: '2px', transition: 'background 0.3s' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: getPasswordStrengthColor(passwordStrength), fontWeight: 500 }}>
                        Strength: {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                  )}

                  <PasswordInput label="Verify Password" value={formData.verifyPassword} onChange={(e) => handleChange({ target: { name: 'verifyPassword', value: e.target.value } })} showPassword={showVerifyPassword} onToggle={() => setShowVerifyPassword(!showVerifyPassword)} hasError={!!errors.verifyPassword} errorMessage={errors.verifyPassword} disabled={isSubmitting} placeholder="Confirm your password" />
                </div>
              )}

              {/* Step 2 Content */}
              {currentStep === 2 && (
                <div className="fade-in">
                  <div style={{ border: `1px solid ${C.line}`, borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                    <ReviewItem label="Organization" value={formData.organizationName} />
                    <ReviewItem label="Email Contact" value={formData.email} />
                    <ReviewItem label="Location" value={formData.location} />
                    <ReviewItem label="Primary Branch" value={formData.deploymentType === 'multi' ? (branches[0]?.name || '—') : formData.branchName} />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <input type="checkbox" id="terms" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} style={{ marginTop: '0.25rem', accentColor: C.brass }} />
                    <label htmlFor="terms" style={{ fontSize: '0.85rem', color: C.gray, lineHeight: 1.5 }}>
                      I agree to the <span style={{ color: C.brass, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/terms')}>Terms of Service</span> and <span style={{ color: C.brass, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/privacy')}>Privacy Policy</span>.
                    </label>
                  </div>
                  {errors.terms && <span className="form-error" style={{ marginBottom: '1rem' }}>{errors.terms}</span>}
                </div>
              )}

              {/* Footer Buttons */}
              <div className="form-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${C.line}` }}>
                {currentStep > 0 ? (
                  <button type="button" onClick={goBack} disabled={isSubmitting} style={{ background: 'transparent', color: C.gray, border: 'none', padding: '0.6rem 1.2rem', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
                    Back
                  </button>
                ) : <div />}

                <button type="submit" disabled={isSubmitting} className="btn btn-brass" style={{ padding: '0.7rem 1.5rem', fontSize: '0.85rem' }}>
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      <span>Setting up... {progress.percent}%</span>
                    </>
                  ) : currentStep === 2 ? 'Complete Setup' : 'Continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer goTerms={goTerms} />
    </div>
  );
}