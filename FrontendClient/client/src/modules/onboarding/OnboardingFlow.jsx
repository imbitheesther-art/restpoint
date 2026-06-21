import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

/* ============================================================
   REST POINT — Onboarding (Redesigned)
   Clean, professional layout with:
   - Process steps on top as a horizontal progress bar
   - Main content in a centered card
   - Full-width footer card at the bottom
   ============================================================ */

const C = {
  ink: '#15171A', 
  bone: '#FAF8F4', 
  bone2: '#F3EFE6', 
  brass: '#8B7355', 
  brassLight: '#A98F6E',
  verdigris: '#3D4F47', 
  verdigrisDark: '#2E3F37', 
  line: '#E3DDD0', 
  lineDark: '#2C2F33',
  gray: '#6B6862', 
  grayLight: 'rgba(250,248,244,0.62)', 
  red: '#9B4A3F', 
  redBg: '#F7ECE9',
};

const I = {
  eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
  arr: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>,
  arrLeft: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>,
  upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  lock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>,
  fileCheck: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/></svg>,
  building: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/><path d="M9 9h0M9 13h0M9 17h0"/></svg>,
};

const STEPS = [
  { key: 'org', label: 'Organization' },
  { key: 'security', label: 'Security' },
  { key: 'review', label: 'Review' },
];

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  const [formData, setFormData] = useState({ 
    organizationName: '', 
    email: '', 
    location: '', 
    password: '', 
    verifyPassword: '' 
  });
  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    const errs = [];
    if (password.length < 8) errs.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errs.push('One uppercase letter');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errs.push('One special character');
    return errs;
  };

  const getPasswordStrength = (p) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(p)) s++;
    return s;
  };

  const getPasswordStrengthColor = (s) => s === 0 ? C.gray : s === 1 ? C.red : s === 2 ? C.brass : C.verdigris;
  const getPasswordStrengthText = (s) => s === 0 ? 'Enter password' : s === 1 ? 'Weak' : s === 2 ? 'Medium' : 'Strong';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'password' || name === 'verifyPassword') {
      if (errors.passwordMatch) setErrors(prev => ({ ...prev, passwordMatch: '' }));
    }
    setApiError('');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { 
      setErrors(prev => ({ ...prev, logo: 'Logo size should be less than 10MB' })); 
      return; 
    }
    if (!['image/jpeg','image/png','image/jpg','image/svg+xml'].includes(file.type)) { 
      setErrors(prev => ({ ...prev, logo: 'Only JPG, PNG, or SVG images are allowed' })); 
      return; 
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
    setErrors(prev => ({ ...prev, logo: '' }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!formData.organizationName.trim()) e.organizationName = 'Organization name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email is required';
    if (!formData.location.trim()) e.location = 'Location is required';
    if (!logoFile && !logoPreview) e.logo = 'Organization logo is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!formData.password) e.password = 'Password is required';
    else {
      const pe = validatePassword(formData.password);
      if (pe.length > 0) e.password = `Password must have: ${pe.join(', ')}`;
    }
    if (!formData.verifyPassword) e.verifyPassword = 'Please verify your password';
    else if (formData.password !== formData.verifyPassword) e.passwordMatch = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    setErrors({});
    setStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setErrors({});
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
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
          completedAt: new Date().toISOString() 
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
        const s = error.response.status, m = error.response.data?.message || error.response.data?.error || 'Server error';
        if (s === 409) setApiError('Organization with this email already exists.');
        else if (s === 400) setApiError(m || 'Invalid data provided.');
        else if (s === 500) setApiError('Server error. Please try again later.');
        else setApiError(m || `Error ${s}`);
      } else if (error.request) setApiError('Network error. Please check your connection.');
      else setApiError(error.message || 'An unexpected error occurred.');
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const goTerms = () => navigate('/terms');
  const goPrivacy = () => navigate('/privacy');
  const goLogin = () => { 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    navigate('/login'); 
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth;background:${C.bone}}
        body{overflow-x:hidden;background:${C.bone};color:${C.gray};font-family:'Inter',sans-serif}
        ::selection{background:rgba(139,115,85,0.18);color:${C.ink}}
        .inp:focus{outline:none;border-color:${C.brass}!important;box-shadow:0 0 0 3px rgba(139,115,85,0.12)}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{width:14px;height:14px;border:2px solid rgba(250,248,244,0.35);border-top-color:${C.bone};border-radius:50%;animation:spin .65s linear infinite;display:inline-block}
        .step-pane{animation:fadeIn .45s cubic-bezier(0.16,1,0.3,1) both}
      `}</style>

      {/* Navigation */}
      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 300, 
        background: 'rgba(250,248,244,0.92)', 
        backdropFilter: 'blur(10px)', 
        borderBottom: `1px solid ${C.line}`,
        padding: '1rem 0' 
      }}>
        <div style={{ 
          maxWidth: '900px', 
          margin: '0 auto', 
          padding: '0 1.75rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14.5" stroke={C.ink} strokeWidth="1"/>
              <path d="M16 8.5V23.5M9.5 16H22.5" stroke={C.ink} strokeWidth="1"/>
              <circle cx="16" cy="16" r="2.5" fill={C.ink}/>
            </svg>
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1rem', fontWeight: 500, color: C.ink }}>Rest Point</span>
          </div>
          <button onClick={goLogin} style={{ 
            background: 'transparent', 
            color: C.ink, 
            border: `1px solid ${C.ink}`, 
            padding: '.4rem 1rem', 
            fontSize: '.78rem', 
            fontWeight: 500, 
            cursor: 'pointer', 
            transition: 'all .2s',
            fontFamily: "'Inter',sans-serif",
            borderRadius: '2px'
          }}>
            Log in
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ paddingTop: '70px', minHeight: '100vh' }}>
        <section style={{ padding: '2rem 0 1rem' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.75rem' }}>
            
            {/* Step Progress - Horizontal */}
            <div style={{ 
              opacity: loaded ? 1 : 0, 
              transition: 'opacity .6s ease',
              marginBottom: '2.5rem'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                position: 'relative',
                paddingBottom: '2px'
              }}>
                {/* Progress bar background */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '8%',
                  right: '8%',
                  height: '2px',
                  background: C.line,
                  transform: 'translateY(-50%)',
                  zIndex: 0
                }} />
                {/* Progress bar fill */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '8%',
                  height: '2px',
                  background: C.brass,
                  transform: 'translateY(-50%)',
                  zIndex: 0,
                  width: `${(step / (STEPS.length - 1)) * 84}%`,
                  transition: 'width .4s ease'
                }} />
                
                {STEPS.map((s, i) => (
                  <div 
                    key={s.key} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      zIndex: 1,
                      cursor: 'pointer'
                    }}
                    onClick={() => i < step && setStep(i)}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: i <= step ? C.brass : C.bone,
                      border: `2px solid ${i <= step ? C.brass : C.line}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: i <= step ? '#fff' : C.gray,
                      fontSize: '.72rem',
                      fontWeight: 600,
                      transition: 'all .3s ease',
                      fontFamily: "'Inter',sans-serif"
                    }}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span style={{
                      fontSize: '.72rem',
                      color: i <= step ? C.ink : C.gray,
                      fontWeight: i === step ? 600 : 400,
                      marginTop: '.4rem',
                      whiteSpace: 'nowrap'
                    }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Card */}
            <div style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(18px)',
              transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
              background: '#fff',
              border: `1px solid ${C.line}`,
              padding: '2.5rem',
              boxShadow: '0 20px 60px -16px rgba(21,23,26,0.12)',
              borderRadius: '4px',
              marginBottom: '1.5rem'
            }}>

              {/* Header */}
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ 
                  fontFamily: "'Fraunces',serif", 
                  fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', 
                  fontWeight: 500, 
                  color: C.ink, 
                  marginBottom: '.3rem', 
                  lineHeight: 1.15 
                }}>
                  {step === 0 && <>Tell us about your <span style={{ color: C.brass, fontStyle: 'italic' }}>organization</span></>}
                  {step === 1 && <>Secure your <span style={{ color: C.brass, fontStyle: 'italic' }}>account</span></>}
                  {step === 2 && <>Review and <span style={{ color: C.brass, fontStyle: 'italic' }}>confirm</span></>}
                </h1>
                <p style={{ fontSize: '.88rem', color: C.gray, lineHeight: 1.6 }}>
                  {step === 0 && 'Basic details so families and your team know who they\'re working with.'}
                  {step === 1 && 'A password only your team will use to sign in to Rest Point.'}
                  {step === 2 && 'Check everything looks right, then create your account.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {apiSuccess && (
                  <div style={{ 
                    background: '#EEF3EC', 
                    border: '1px solid #DCE6D9', 
                    color: '#475A43', 
                    padding: '.75rem .9rem', 
                    marginBottom: '1.25rem', 
                    fontSize: '.82rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '.5rem',
                    borderRadius: '2px'
                  }}>
                    {I.check} {apiSuccess}
                  </div>
                )}
                {apiError && (
                  <div style={{ 
                    background: C.redBg, 
                    border: '1px solid #E8D2CC', 
                    color: C.red, 
                    padding: '.75rem .9rem', 
                    marginBottom: '1.25rem', 
                    fontSize: '.82rem',
                    borderRadius: '2px'
                  }}>
                    {apiError}
                  </div>
                )}

                {/* Step 0 - Organization */}
                {step === 0 && (
                  <div className="step-pane">
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                      <div style={{ 
                        fontSize: '.7rem', 
                        color: C.brass, 
                        letterSpacing: '.1em', 
                        textTransform: 'uppercase', 
                        marginBottom: '.5rem',
                        fontFamily: "'JetBrains Mono',monospace"
                      }}>
                        Organization logo <span style={{ color: C.red }}>*</span>
                      </div>
                      <div 
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          margin: '0 auto', 
                          border: `2px dashed ${errors.logo ? C.red : (logoPreview ? C.brass : C.line)}`,
                          borderRadius: '50%', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer', 
                          overflow: 'hidden', 
                          background: C.bone2, 
                          transition: 'all .25s' 
                        }} 
                        onClick={() => document.getElementById('logoUpload').click()}
                      >
                        {logoPreview ? 
                          <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                          <><div style={{ color: C.gray }}>{I.upload}</div><span style={{ fontSize: '.6rem', color: C.gray }}>Upload</span></>
                        }
                      </div>
                      <input id="logoUpload" type="file" accept="image/jpeg,image/png,image/jpg,image/svg+xml" onChange={handleLogoUpload} style={{ display: 'none' }} />
                      {errors.logo && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.3rem' }}>{errors.logo}</div>}
                      <div style={{ fontSize: '.7rem', color: C.gray, marginTop: '.3rem' }}>PNG, JPG or SVG (max 10MB)</div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '.7rem', color: C.brass, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.3rem', fontFamily: "'JetBrains Mono',monospace" }}>
                        Organization name <span style={{ color: C.red }}>*</span>
                      </div>
                      <input 
                        type="text" 
                        name="organizationName" 
                        value={formData.organizationName} 
                        onChange={handleChange} 
                        placeholder="e.g., Nairobi Funeral Home" 
                        className="inp" 
                        style={{ 
                          width: '100%', 
                          padding: '.7rem .8rem', 
                          background: C.bone, 
                          border: `1px solid ${errors.organizationName ? C.red : C.line}`,
                          borderRadius: '2px', 
                          fontSize: '.88rem', 
                          color: C.ink, 
                          transition: 'all .2s', 
                          fontFamily: "'Inter',sans-serif" 
                        }} 
                      />
                      {errors.organizationName && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.25rem' }}>{errors.organizationName}</div>}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '.7rem', color: C.brass, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.3rem', fontFamily: "'JetBrains Mono',monospace" }}>
                        Email address <span style={{ color: C.red }}>*</span>
                      </div>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="info@funeralhome.co.ke" 
                        className="inp" 
                        style={{ 
                          width: '100%', 
                          padding: '.7rem .8rem', 
                          background: C.bone, 
                          border: `1px solid ${errors.email ? C.red : C.line}`,
                          borderRadius: '2px', 
                          fontSize: '.88rem', 
                          color: C.ink, 
                          transition: 'all .2s', 
                          fontFamily: "'Inter',sans-serif" 
                        }} 
                      />
                      {errors.email && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.25rem' }}>{errors.email}</div>}
                    </div>

                    <div style={{ marginBottom: '.2rem' }}>
                      <div style={{ fontSize: '.7rem', color: C.brass, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.3rem', fontFamily: "'JetBrains Mono',monospace" }}>
                        Location <span style={{ color: C.red }}>*</span>
                      </div>
                      <input 
                        type="text" 
                        name="location" 
                        value={formData.location} 
                        onChange={handleChange} 
                        placeholder="e.g., Nairobi, Kenya" 
                        className="inp" 
                        style={{ 
                          width: '100%', 
                          padding: '.7rem .8rem', 
                          background: C.bone, 
                          border: `1px solid ${errors.location ? C.red : C.line}`,
                          borderRadius: '2px', 
                          fontSize: '.88rem', 
                          color: C.ink, 
                          transition: 'all .2s', 
                          fontFamily: "'Inter',sans-serif" 
                        }} 
                      />
                      {errors.location && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.25rem' }}>{errors.location}</div>}
                    </div>
                  </div>
                )}

                {/* Step 1 - Security */}
                {step === 1 && (
                  <div className="step-pane">
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '.7rem', color: C.brass, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.3rem', fontFamily: "'JetBrains Mono',monospace" }}>
                        Password <span style={{ color: C.red }}>*</span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          name="password" 
                          value={formData.password} 
                          onChange={handleChange} 
                          placeholder="Create a strong password" 
                          className="inp" 
                          style={{ 
                            width: '100%', 
                            padding: '.7rem .8rem', 
                            paddingRight: '2.4rem', 
                            background: C.bone, 
                            border: `1px solid ${errors.password ? C.red : C.line}`,
                            borderRadius: '2px', 
                            fontSize: '.88rem', 
                            color: C.ink, 
                            transition: 'all .2s', 
                            fontFamily: "'Inter',sans-serif" 
                          }} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          style={{ 
                            position: 'absolute', 
                            right: '.7rem', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer', 
                            color: C.gray, 
                            padding: '.2rem', 
                            display: 'flex' 
                          }}
                        >
                          {showPassword ? I.eyeOff : I.eye}
                        </button>
                      </div>
                      {formData.password && (
                        <div style={{ marginTop: '.5rem' }}>
                          <div style={{ display: 'flex', gap: '.25rem', marginBottom: '.25rem' }}>
                            {[1, 2, 3].map((level) => (
                              <div 
                                key={level} 
                                style={{ 
                                  flex: 1, 
                                  height: '3px', 
                                  background: passwordStrength >= level ? getPasswordStrengthColor(passwordStrength) : C.line,
                                  borderRadius: '2px', 
                                  transition: 'background .2s' 
                                }} 
                              />
                            ))}
                          </div>
                          <div style={{ fontSize: '.7rem', color: getPasswordStrengthColor(passwordStrength) }}>
                            {getPasswordStrengthText(passwordStrength)} password
                          </div>
                        </div>
                      )}
                      {errors.password && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.25rem' }}>{errors.password}</div>}
                    </div>

                    <div style={{ marginBottom: '.2rem' }}>
                      <div style={{ fontSize: '.7rem', color: C.brass, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.3rem', fontFamily: "'JetBrains Mono',monospace" }}>
                        Verify password <span style={{ color: C.red }}>*</span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showVerifyPassword ? 'text' : 'password'} 
                          name="verifyPassword" 
                          value={formData.verifyPassword} 
                          onChange={handleChange} 
                          placeholder="Confirm your password" 
                          className="inp" 
                          style={{ 
                            width: '100%', 
                            padding: '.7rem .8rem', 
                            paddingRight: '2.4rem', 
                            background: C.bone, 
                            border: `1px solid ${(errors.verifyPassword || errors.passwordMatch) ? C.red : C.line}`,
                            borderRadius: '2px', 
                            fontSize: '.88rem', 
                            color: C.ink, 
                            transition: 'all .2s', 
                            fontFamily: "'Inter',sans-serif" 
                          }} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowVerifyPassword(!showVerifyPassword)} 
                          style={{ 
                            position: 'absolute', 
                            right: '.7rem', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer', 
                            color: C.gray, 
                            padding: '.2rem', 
                            display: 'flex' 
                          }}
                        >
                          {showVerifyPassword ? I.eyeOff : I.eye}
                        </button>
                      </div>
                      {formData.verifyPassword && formData.password === formData.verifyPassword && formData.password && (
                        <div style={{ fontSize: '.7rem', color: C.verdigris, marginTop: '.3rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                          {I.check} Passwords match
                        </div>
                      )}
                      {errors.verifyPassword && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.25rem' }}>{errors.verifyPassword}</div>}
                      {errors.passwordMatch && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.25rem' }}>{errors.passwordMatch}</div>}
                    </div>
                  </div>
                )}

                {/* Step 2 - Review */}
                {step === 2 && (
                  <div className="step-pane">
                    <div style={{ 
                      border: `1px solid ${C.line}`, 
                      marginBottom: '1.5rem',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '.9rem', 
                        padding: '1rem 1.1rem', 
                        borderBottom: `1px solid ${C.line}` 
                      }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          overflow: 'hidden', 
                          background: C.bone2, 
                          flexShrink: 0, 
                          border: `1px solid ${C.line}` 
                        }}>
                          {logoPreview && <img src={logoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '.9rem', fontWeight: 500, color: C.ink }}>{formData.organizationName || '—'}</div>
                          <div style={{ fontSize: '.76rem', color: C.gray }}>{formData.location || '—'}</div>
                        </div>
                      </div>
                      <div style={{ 
                        padding: '.8rem 1.1rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        fontSize: '.82rem', 
                        borderBottom: `1px solid ${C.line}` 
                      }}>
                        <span style={{ color: C.gray }}>Email</span>
                        <span style={{ color: C.ink }}>{formData.email || '—'}</span>
                      </div>
                      <div style={{ padding: '.8rem 1.1rem', display: 'flex', justifyContent: 'space-between', fontSize: '.82rem' }}>
                        <span style={{ color: C.gray }}>Password</span>
                        <span style={{ color: C.ink }}>••••••••••</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '.7rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={agreeTerms} 
                          onChange={(e) => { 
                            setAgreeTerms(e.target.checked); 
                            if (errors.terms) setErrors(prev => ({ ...prev, terms: '' })); 
                          }} 
                          style={{ 
                            width: '1rem', 
                            height: '1rem', 
                            cursor: 'pointer', 
                            marginTop: '.15rem', 
                            flexShrink: 0, 
                            accentColor: C.brass 
                          }} 
                        />
                        <span style={{ fontSize: '.8rem', color: C.gray, lineHeight: 1.5 }}>
                          I agree to the{' '}
                          <button type="button" onClick={goTerms} style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: C.brass, 
                            cursor: 'pointer', 
                            textDecoration: 'underline', 
                            fontSize: '.8rem', 
                            fontFamily: "'Inter',sans-serif", 
                            padding: 0 
                          }}>
                            Terms of Service
                          </button>
                          {' '}and{' '}
                          <button type="button" onClick={goPrivacy} style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: C.brass, 
                            cursor: 'pointer', 
                            textDecoration: 'underline', 
                            fontSize: '.8rem', 
                            fontFamily: "'Inter',sans-serif", 
                            padding: 0 
                          }}>
                            Privacy Policy
                          </button>
                          . I confirm that I am authorized to set up an organization account.
                        </span>
                      </label>
                      {errors.terms && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.5rem' }}>{errors.terms}</div>}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', gap: '.8rem', marginTop: '1.5rem' }}>
                  {step > 0 && (
                    <button 
                      type="button" 
                      onClick={goBack} 
                      style={{ 
                        flex: '0 0 auto', 
                        background: 'transparent', 
                        color: C.ink, 
                        border: `1px solid ${C.line}`, 
                        padding: '.7rem 1.2rem', 
                        fontSize: '.85rem', 
                        fontWeight: 500, 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '.5rem', 
                        fontFamily: "'Inter',sans-serif",
                        borderRadius: '2px',
                        transition: 'border-color .2s'
                      }}
                    >
                      {I.arrLeft} Back
                    </button>
                  )}
                  {step < STEPS.length - 1 && (
                    <button 
                      type="button" 
                      onClick={goNext} 
                      style={{ 
                        flex: 1, 
                        background: C.ink, 
                        color: C.bone, 
                        border: 'none', 
                        padding: '.7rem', 
                        fontSize: '.85rem', 
                        fontWeight: 500, 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '.5rem', 
                        fontFamily: "'Inter',sans-serif",
                        borderRadius: '2px',
                        transition: 'background .2s'
                      }}
                    >
                      Continue {I.arr}
                    </button>
                  )}
                  {step === STEPS.length - 1 && (
                    <button 
                      type="submit" 
                      disabled={isSubmitting} 
                      style={{ 
                        flex: 1, 
                        background: isSubmitting ? C.line : C.ink, 
                        color: isSubmitting ? C.gray : C.bone, 
                        border: 'none', 
                        padding: '.7rem', 
                        fontSize: '.85rem', 
                        fontWeight: 500, 
                        cursor: isSubmitting ? 'default' : 'pointer', 
                        transition: 'background .2s', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '.5rem', 
                        fontFamily: "'Inter',sans-serif",
                        borderRadius: '2px'
                      }}
                    >
                      {isSubmitting ? <><span className="spinner" /> Creating account...</> : <>Create account {I.arr}</>}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Trust badges - inline below card */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '.6rem',
              justifyContent: 'center',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.6s ease 200ms',
              marginBottom: '1.5rem'
            }}>
              {[['Encrypted', 'AES-256'], ['Security', 'Enterprise'], ['Cloud', 'Contabo']].map(([label, sub]) => (
                <div key={label} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '.35rem', 
                  border: `1px solid ${C.line}`, 
                  padding: '.25rem .65rem', 
                  fontSize: '.68rem', 
                  color: C.gray,
                  background: '#fff',
                  borderRadius: '2px'
                }}>
                  <span style={{ color: C.brass, fontSize: '.7rem' }}>●</span>
                  <span style={{ fontWeight: 500, color: C.ink }}>{label}</span>
                  <span>{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Full-width Footer Card */}
        <footer style={{ 
          background: C.ink, 
          color: C.bone, 
          padding: '2.5rem 0 1.5rem',
          marginTop: '2rem'
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.75rem' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1fr 1fr', 
              gap: '2rem', 
              marginBottom: '1.5rem',
              paddingBottom: '1.5rem',
              borderBottom: `1px solid ${C.lineDark}`
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.7rem' }}>
                  <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14.5" stroke="#FAF8F4" strokeWidth="1"/>
                    <path d="M16 8.5V23.5M9.5 16H22.5" stroke="#FAF8F4" strokeWidth="1"/>
                    <circle cx="16" cy="16" r="2.5" fill="#FAF8F4"/>
                  </svg>
                  <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1rem', color: C.bone }}>Rest Point</span>
                </div>
                <p style={{ fontSize: '.8rem', color: C.grayLight, maxWidth: '260px', lineHeight: 1.6 }}>
                  The complete mortuary operating system, built for East Africa.
                </p>
              </div>
              <div>
                <div style={{ 
                  fontSize: '.65rem', 
                  color: C.brassLight, 
                  letterSpacing: '.1em', 
                  textTransform: 'uppercase', 
                  marginBottom: '.8rem',
                  fontFamily: "'JetBrains Mono',monospace"
                }}>
                  Product
                </div>
                {['Features', 'Family portal', 'Marketplace', 'Pricing'].map(l => (
                  <div key={l} style={{ fontSize: '.8rem', color: C.grayLight, marginBottom: '.4rem', cursor: 'pointer' }}>{l}</div>
                ))}
              </div>
              <div>
                <div style={{ 
                  fontSize: '.65rem', 
                  color: C.brassLight, 
                  letterSpacing: '.1em', 
                  textTransform: 'uppercase', 
                  marginBottom: '.8rem',
                  fontFamily: "'JetBrains Mono',monospace"
                }}>
                  Legal
                </div>
                <div onClick={goPrivacy} style={{ fontSize: '.8rem', color: C.grayLight, marginBottom: '.4rem', cursor: 'pointer' }}>Privacy policy</div>
                <div onClick={goTerms} style={{ fontSize: '.8rem', color: C.grayLight, marginBottom: '.4rem', cursor: 'pointer' }}>Terms of service</div>
                <div style={{ fontSize: '.8rem', color: C.grayLight, marginBottom: '.4rem', cursor: 'pointer' }}>Security</div>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '.7rem', 
              color: 'rgba(250,248,244,0.45)',
              flexWrap: 'wrap',
              gap: '.5rem'
            }}>
              <span>&copy; {new Date().getFullYear()} Rest Point Technologies. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};

export default OnboardingFlow;