import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

/* ═══════════════════════════════════════════════════════════════
   REST POINT — Onboarding Flow
   Design System: Matches Landing Page (ink, bone, brass, verdigris)
   ═══════════════════════════════════════════════════════════════ */

const C = {
  ink: '#15171A',
  bone: '#FAF8F4',
  bone2: '#F3EFE6',
  brass: '#8B7355',
  brassLight: '#A98F6E',
  verdigris: '#3D4F47',
  line: '#E3DDD0',
  gray: '#6B6862',
  grayLight: 'rgba(250,248,244,0.62)',
  red: '#9B4A3F',
  redBg: '#F7ECE9',
  emerald: '#3D4F47',
};

const I = {
  eye:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  check:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
  arr:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>,
  upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  x:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
};

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 60); return () => clearTimeout(t); }, []);

  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    location: '',
    password: '',
    verifyPassword: '',
  });

  const [errors, setErrors] = useState({});

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
    if (strength === 0) return C.gray;
    if (strength === 1) return C.red;
    if (strength === 2) return C.brass;
    return C.verdigris;
  };

  const getPasswordStrengthText = (strength) => {
    if (strength === 0) return 'Enter password';
    if (strength === 1) return 'Weak';
    if (strength === 2) return 'Medium';
    return 'Strong';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (name === 'password' || name === 'verifyPassword') {
      if (errors.passwordMatch) {
        setErrors(prev => ({ ...prev, passwordMatch: '' }));
      }
    }
    setApiError('');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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
      reader.onloadend = () => { setLogoPreview(reader.result); };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, logo: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
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
    if (!agreeTerms) newErrors.terms = 'You must agree to the terms and conditions';
    if (!logoFile && !logoPreview) newErrors.logo = 'Organization logo is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
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
        setApiSuccess(response.data.message || 'Organization setup completed successfully! Redirecting to login...');
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
        setTimeout(() => { setIsSubmitting(false); navigate('/login'); }, 2000);
      } else {
        throw new Error(response.data.message || 'Setup failed. Please try again.');
      }
    } catch (error) {
      setIsSubmitting(false);
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || 'Server error occurred';
        if (status === 400) setApiError(message || 'Invalid data provided.');
        else if (status === 401) { setApiError('Authentication required.'); setTimeout(() => navigate('/login'), 2000); }
        else if (status === 409) setApiError('Organization with this email already exists.');
        else if (status === 500) setApiError('Server error. Please try again later.');
        else setApiError(message || `Error ${status}`);
      } else if (error.request) {
        setApiError('Network error. Please check your connection.');
      } else {
        setApiError(error.message || 'An unexpected error occurred.');
      }
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const hasErrorField = Object.keys(errors).length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;background:${C.bone};}
        body{overflow-x:hidden;background:${C.bone};color:${C.gray};font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
        ::selection{background:rgba(139,115,85,0.18);color:${C.ink};}

        .inp:focus{outline:none;border-color:${C.brass}!important;box-shadow:0 0 0 3px rgba(139,115,85,0.12);}

        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{width:14px;height:14px;border:2px solid rgba(250,248,244,0.35);border-top-color:${C.bone};border-radius:50%;animation:spin .65s linear infinite;display:inline-block;}

        .label-mono{font-family:'JetBrains Mono',monospace;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:${C.brass};}
      `}</style>

      {/* Terms Modal */}
      {showTermsModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(21,23,26,0.88)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
        }} onClick={() => setShowTermsModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: C.bone, border: `1px solid ${C.line}`, padding: '2.4rem',
            maxWidth: '580px', width: '100%', maxHeight: '80vh', overflow: 'auto',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.2rem' }}>
              <div className="label-mono">Terms & Conditions</div>
              <button onClick={() => setShowTermsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray, padding: '.2rem', display: 'flex' }}>{I.x}</button>
            </div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.6rem', fontWeight: 500, color: C.ink, marginBottom: '1.2rem' }}>
              Rest Point <span style={{ color: C.brass }}>Service Agreement</span>
            </h2>
            <div style={{ color: C.gray, lineHeight: 1.7, fontSize: '.85rem' }}>
              <p style={{ marginBottom: '1rem' }}>By using Rest Point, you agree to these terms:</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {[
                  'A one-time setup and training fee of KES 1,000 is required for account activation.',
                  'Monthly subscription: KES 9,500 for single-tenant plans.',
                  'Monthly subscription: KES 18,500 for multi-tenant plans with no limitations.',
                  'Subscription payments must be made on time. A 5-day grace period is provided after the due date.',
                  'Accounts may be suspended if payment is not received within 5 days.',
                  'Account reactivation after suspension requires a KES 1,000 reactivation fee.',
                  'Customer data remains securely stored during account suspension.',
                  'All customer data is securely isolated to prevent unauthorized access.',
                  'Rest Point uses multiple layers of security and encryption at rest and in transit.',
                  'Customers retain ownership of their data at all times.',
                  'Users are responsible for maintaining account credential confidentiality.',
                ].map((item, i) => (
                  <li key={i} style={{ marginBottom: '.6rem', display: 'flex', alignItems: 'start', gap: '.6rem', fontSize: '.82rem', color: C.gray }}>
                    <span style={{ color: C.brass, marginTop: '.15rem', flexShrink: 0 }}>{I.check}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, color: C.ink, marginTop: '1.2rem', marginBottom: '.5rem', fontSize: '1rem' }}>Ownership</h3>
              <p style={{ fontSize: '.82rem' }}>Rest Point is independently owned, operated, and managed. All software, branding, intellectual property, and platform services remain the exclusive property of Rest Point.</p>
            </div>
            <button onClick={() => setShowTermsModal(false)} style={{
              marginTop: '1.5rem', width: '100%', background: C.ink, color: C.bone,
              border: 'none', padding: '.8rem', fontSize: '.8rem', fontWeight: 500,
              cursor: 'pointer', transition: 'background .2s',
            }} onMouseEnter={(e) => e.target.style.background = '#000'} onMouseLeave={(e) => e.target.style.background = C.ink}>
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
        background: 'rgba(250,248,244,0.92)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${C.line}`, padding: '1.1rem 0',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14.5" stroke={C.ink} strokeWidth="1" />
              <path d="M16 8.5V23.5M9.5 16H22.5" stroke={C.ink} strokeWidth="1" />
              <circle cx="16" cy="16" r="2.5" fill={C.ink} />
            </svg>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.05rem', fontWeight: 500, color: C.ink }}>Rest Point</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="label-mono" style={{ fontSize: '.72rem' }}>Create Account</span>
            <button onClick={() => navigate('/login')} style={{
              background: 'transparent', color: C.ink, border: `1px solid ${C.ink}`,
              padding: '.5rem 1rem', fontSize: '.78rem', fontWeight: 500, cursor: 'pointer',
              transition: 'all .2s', fontFamily: "'Inter', sans-serif",
            }} onMouseEnter={(e) => { e.target.style.background = C.ink; e.target.style.color = C.bone; }} onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = C.ink; }}>
              Log in
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ paddingTop: '76px', minHeight: '100vh' }}>
        <section style={{ padding: '3.5rem 0 5rem' }}>
          <div style={{ maxWidth: '540px', margin: '0 auto', padding: '0 1.75rem' }}>
            {/* Header */}
            <div style={{
              opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(14px)',
              transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
              textAlign: 'center', marginBottom: '2.4rem',
            }}>
              <div className="label-mono" style={{ marginBottom: '.8rem', color: C.brass }}>Enterprise Onboarding</div>
              <h1 style={{
                fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.8rem,5vw,2.6rem)',
                fontWeight: 500, color: C.ink, marginBottom: '.75rem', lineHeight: 1.15,
              }}>
                Create your <span style={{ color: C.brass, fontStyle: 'italic' }}>organization</span> account
              </h1>
              <p style={{ fontSize: '.92rem', color: C.gray, lineHeight: 1.7, maxWidth: '400px', margin: '0 auto' }}>
                Set up your mortuary on Rest Point. Complete the form below to get started.
              </p>
            </div>

            {/* Fee notice */}
            <div style={{
              opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1) 80ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) 80ms',
              marginBottom: '2rem',
            }}>
              <div style={{
                background: C.bone2, border: `1px solid ${C.line}`,
                padding: '1rem 1.2rem', borderRadius: '2px',
              }}>
                <p style={{ fontSize: '.8rem', color: C.ink, fontWeight: 600, marginBottom: '.3rem' }}>
                  Service & Setup Fee — KES 1,000
                </p>
                <p style={{ fontSize: '.78rem', color: C.gray, marginBottom: '.6rem' }}>
                  One-time facility registration & training fee. Includes setup support and onboarding assistance.
                </p>
                <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
                  <span style={{ background: C.ink, color: C.bone, padding: '.15rem .5rem', fontSize: '.68rem' }}>Single: KES 9,500/mo</span>
                  <span style={{ background: C.brass, color: C.bone, padding: '.15rem .5rem', fontSize: '.68rem' }}>Multi-Tenant: KES 18,500/mo</span>
                  <span style={{ background: C.verdigris, color: C.bone, padding: '.15rem .5rem', fontSize: '.68rem' }}>No Limitations</span>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div style={{
              opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(18px)',
              transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1) 120ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) 120ms',
              background: '#fff', border: `1px solid ${C.line}`, padding: '2rem 2rem 2.2rem', boxShadow: '0 20px 60px -16px rgba(21,23,26,0.12)',
            }}>
              <form onSubmit={handleSubmit}>
                {/* Success Message */}
                {apiSuccess && (
                  <div style={{
                    background: '#EEF3EC', border: `1px solid #DCE6D9`,
                    color: '#475A43', padding: '.75rem .9rem', marginBottom: '1.25rem',
                    fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: '.5rem',
                  }}>
                    {I.check} {apiSuccess}
                  </div>
                )}

                {/* Error Message */}
                {apiError && (
                  <div style={{
                    background: C.redBg, border: `1px solid #E8D2CC`,
                    color: C.red, padding: '.75rem .9rem', marginBottom: '1.25rem',
                    fontSize: '.82rem',
                  }}>
                    {apiError}
                  </div>
                )}

                {/* Logo Upload */}
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <div className="label-mono" style={{ marginBottom: '.75rem' }}>
                    Organization Logo <span style={{ color: C.brass }}>*</span>
                  </div>
                  <div
                    style={{
                      width: '90px', height: '90px', margin: '0 auto',
                      border: `2px dashed ${errors.logo ? C.red : (logoPreview ? C.brass : C.line)}`,
                      borderRadius: '50%', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      overflow: 'hidden', background: C.bone2, transition: 'all .25s',
                    }}
                    onClick={() => document.getElementById('logoUpload').click()}
                    onMouseEnter={(e) => { if (!logoPreview) { e.target.style.borderColor = C.brass; e.target.style.background = 'rgba(139,115,85,0.08)'; } }}
                    onMouseLeave={(e) => { if (!logoPreview) { e.target.style.borderColor = errors.logo ? C.red : C.line; e.target.style.background = C.bone2; } }}
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <div style={{ color: C.gray, marginBottom: '.25rem' }}>{I.upload}</div>
                        <span style={{ fontSize: '.65rem', color: C.gray }}>Upload</span>
                      </>
                    )}
                  </div>
                  <input id="logoUpload" type="file" accept="image/jpeg,image/png,image/jpg,image/svg+xml" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  {errors.logo && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.4rem' }}>{errors.logo}</div>}
                  <div style={{ fontSize: '.7rem', color: C.gray, marginTop: '.4rem' }}>PNG, JPG or SVG (Max 10MB)</div>
                </div>

                {/* Organization Name */}
                <div style={{ marginBottom: '1.1rem' }}>
                  <div className="label-mono" style={{ marginBottom: '.45rem' }}>Organization Name <span style={{ color: C.brass }}>*</span></div>
                  <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange}
                    placeholder="e.g., Nairobi Funeral Home"
                    className="inp"
                    style={{ width: '100%', padding: '.7rem .8rem', background: C.bone,
                      border: `1px solid ${errors.organizationName ? C.red : C.line}`,
                      borderRadius: '2px', fontSize: '.88rem', color: C.ink, transition: 'all .2s', fontFamily: "'Inter', sans-serif",
                    }}
                  />
                  {errors.organizationName && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.25rem' }}>{errors.organizationName}</div>}
                </div>

                {/* Email */}
                <div style={{ marginBottom: '1.1rem' }}>
                  <div className="label-mono" style={{ marginBottom: '.45rem' }}>Email Address <span style={{ color: C.brass }}>*</span></div>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="info@funeralhome.co.ke"
                    className="inp"
                    style={{ width: '100%', padding: '.7rem .8rem', background: C.bone,
                      border: `1px solid ${errors.email ? C.red : C.line}`,
                      borderRadius: '2px', fontSize: '.88rem', color: C.ink, transition: 'all .2s', fontFamily: "'Inter', sans-serif",
                    }}
                  />
                  {errors.email && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.25rem' }}>{errors.email}</div>}
                </div>

                {/* Location */}
                <div style={{ marginBottom: '1.1rem' }}>
                  <div className="label-mono" style={{ marginBottom: '.45rem' }}>Location <span style={{ color: C.brass }}>*</span></div>
                  <input type="text" name="location" value={formData.location} onChange={handleChange}
                    placeholder="e.g., Nairobi, Kenya"
                    className="inp"
                    style={{ width: '100%', padding: '.7rem .8rem', background: C.bone,
                      border: `1px solid ${errors.location ? C.red : C.line}`,
                      borderRadius: '2px', fontSize: '.88rem', color: C.ink, transition: 'all .2s', fontFamily: "'Inter', sans-serif",
                    }}
                  />
                  {errors.location && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.25rem' }}>{errors.location}</div>}
                </div>

                {/* Password */}
                <div style={{ marginBottom: '1rem' }}>
                  <div className="label-mono" style={{ marginBottom: '.45rem' }}>Password <span style={{ color: C.brass }}>*</span></div>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                      placeholder="Create a strong password"
                      className="inp"
                      style={{ width: '100%', padding: '.7rem .8rem', paddingRight: '2.4rem',
                        background: C.bone, border: `1px solid ${errors.password ? C.red : C.line}`,
                        borderRadius: '2px', fontSize: '.88rem', color: C.ink, transition: 'all .2s', fontFamily: "'Inter', sans-serif",
                      }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '.7rem', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: C.gray, padding: '.2rem', display: 'flex',
                      }}
                      onMouseEnter={(e) => e.target.style.color = C.ink}
                      onMouseLeave={(e) => e.target.style.color = C.gray}
                    >
                      {showPassword ? I.eyeOff : I.eye}
                    </button>
                  </div>
                  {formData.password && (
                    <div style={{ marginTop: '.4rem' }}>
                      <div style={{ display: 'flex', gap: '.25rem', marginBottom: '.2rem' }}>
                        {[1, 2, 3].map((level) => (
                          <div key={level} style={{
                            flex: 1, height: '3px',
                            background: passwordStrength >= level ? getPasswordStrengthColor(passwordStrength) : C.line,
                            borderRadius: '2px', transition: 'background .2s',
                          }} />
                        ))}
                      </div>
                      <div style={{ fontSize: '.7rem', color: getPasswordStrengthColor(passwordStrength) }}>
                        {getPasswordStrengthText(passwordStrength)} password
                      </div>
                    </div>
                  )}
                  {errors.password && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.25rem' }}>{errors.password}</div>}
                </div>

                {/* Verify Password */}
                <div style={{ marginBottom: '1.4rem' }}>
                  <div className="label-mono" style={{ marginBottom: '.45rem' }}>Verify Password <span style={{ color: C.brass }}>*</span></div>
                  <div style={{ position: 'relative' }}>
                    <input type={showVerifyPassword ? 'text' : 'password'} name="verifyPassword" value={formData.verifyPassword} onChange={handleChange}
                      placeholder="Confirm your password"
                      className="inp"
                      style={{ width: '100%', padding: '.7rem .8rem', paddingRight: '2.4rem',
                        background: C.bone,
                        border: `1px solid ${errors.verifyPassword || errors.passwordMatch ? C.red : C.line}`,
                        borderRadius: '2px', fontSize: '.88rem', color: C.ink, transition: 'all .2s', fontFamily: "'Inter', sans-serif",
                      }}
                    />
                    <button type="button" onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                      style={{ position: 'absolute', right: '.7rem', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: C.gray, padding: '.2rem', display: 'flex',
                      }}
                      onMouseEnter={(e) => e.target.style.color = C.ink}
                      onMouseLeave={(e) => e.target.style.color = C.gray}
                    >
                      {showVerifyPassword ? I.eyeOff : I.eye}
                    </button>
                  </div>
                  {formData.verifyPassword && formData.password === formData.verifyPassword && formData.password && (
                    <div style={{ fontSize: '.7rem', color: C.verdigris, marginTop: '.25rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                      {I.check} Passwords match
                    </div>
                  )}
                  {errors.verifyPassword && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.25rem' }}>{errors.verifyPassword}</div>}
                  {errors.passwordMatch && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.25rem' }}>{errors.passwordMatch}</div>}
                </div>

                {/* Terms */}
                <div style={{ marginBottom: '1.6rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '.7rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={agreeTerms} onChange={(e) => { setAgreeTerms(e.target.checked); if (errors.terms) setErrors(prev => ({ ...prev, terms: '' })); }}
                      style={{ width: '1rem', height: '1rem', cursor: 'pointer', marginTop: '.15rem', flexShrink: 0, accentColor: C.brass }}
                    />
                    <span style={{ fontSize: '.8rem', color: C.gray, lineHeight: 1.5 }}>
                      I agree to the{' '}
                      <button type="button" onClick={() => setShowTermsModal(true)}
                        style={{ background: 'none', border: 'none', color: C.brass, cursor: 'pointer', textDecoration: 'underline', fontSize: '.8rem', fontFamily: "'Inter', sans-serif", padding: 0 }}
                        onMouseEnter={(e) => e.target.style.color = C.brassLight}
                        onMouseLeave={(e) => e.target.style.color = C.brass}
                      >
                        Terms and Conditions
                      </button>
                      . I confirm that I am authorized to set up an organization account.
                    </span>
                  </label>
                  {errors.terms && <div style={{ color: C.red, fontSize: '.72rem', marginTop: '.4rem' }}>{errors.terms}</div>}
                </div>

                {/* Submit */}
                <button type="submit" disabled={isSubmitting}
                  style={{
                    width: '100%', background: isSubmitting ? C.line : C.ink, color: isSubmitting ? C.gray : C.bone,
                    border: 'none', padding: '.85rem', fontSize: '.85rem', fontWeight: 500,
                    cursor: isSubmitting ? 'default' : 'pointer', transition: 'background .2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={(e) => { if (!isSubmitting) e.target.style.background = '#000'; }}
                  onMouseLeave={(e) => { if (!isSubmitting) e.target.style.background = C.ink; }}
                >
                  {isSubmitting ? (
                    <><span className="spinner" /> Creating Account...</>
                  ) : (
                    <>Create Account {I.arr}</>
                  )}
                </button>
              </form>
            </div>

            {/* Trust badges */}
            <div style={{
              marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '.6rem', justifyContent: 'center',
              opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease 200ms',
            }}>
              {[
                ['Encrypted', 'AES-256'],
                ['Security', 'Enterprise'],
                ['Cloud', 'Contabo'],
              ].map(([label, sub]) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '.35rem',
                  border: `1px solid ${C.line}`, padding: '.35rem .65rem',
                  fontSize: '.68rem', color: C.gray,
                }}>
                  <span style={{ color: C.brass, fontSize: '.7rem' }}>●</span>
                  <span style={{ fontWeight: 500, color: C.ink }}>{label}</span>
                  <span>{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: C.ink, color: C.grayLight, padding: '3rem 0 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: `1px solid ${C.lineDark}` }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.7rem' }}>
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14.5" stroke="#FAF8F4" strokeWidth="1" />
                  <path d="M16 8.5V23.5M9.5 16H22.5" stroke="#FAF8F4" strokeWidth="1" />
                  <circle cx="16" cy="16" r="2.5" fill="#FAF8F4" />
                </svg>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1rem', color: C.bone }}>Rest Point</span>
              </div>
              <p style={{ fontSize: '.82rem', color: C.grayLight, maxWidth: '260px', lineHeight: 1.6 }}>The complete mortuary operating system, built for East Africa.</p>
            </div>
            <div>
              <div style={{ fontSize: '.7rem', color: C.brassLight, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.8rem', fontFamily: "'JetBrains Mono', monospace" }}>Product</div>
              {['Features', 'Family Portal', 'Marketplace', 'Pricing'].map(l => (
                <div key={l} style={{ fontSize: '.82rem', color: C.grayLight, marginBottom: '.5rem', cursor: 'pointer', transition: 'color .18s' }}
                  onMouseEnter={e => e.target.style.color = C.bone} onMouseLeave={e => e.target.style.color = C.grayLight}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '.7rem', color: C.brassLight, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.8rem', fontFamily: "'JetBrains Mono', monospace" }}>Company</div>
              {['About', 'Blog', 'Careers', 'Contact'].map(l => (
                <div key={l} style={{ fontSize: '.82rem', color: C.grayLight, marginBottom: '.5rem', cursor: 'pointer', transition: 'color .18s' }}
                  onMouseEnter={e => e.target.style.color = C.bone} onMouseLeave={e => e.target.style.color = C.grayLight}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '.7rem', color: C.brassLight, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.8rem', fontFamily: "'JetBrains Mono', monospace" }}>Legal</div>
              {['Privacy Policy', 'Terms of Service', 'Security'].map(l => (
                <div key={l} style={{ fontSize: '.82rem', color: C.grayLight, marginBottom: '.5rem', cursor: 'pointer', transition: 'color .18s' }}
                  onMouseEnter={e => e.target.style.color = C.bone} onMouseLeave={e => e.target.style.color = C.grayLight}>{l}</div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.74rem', color: 'rgba(250,248,244,0.45)', flexWrap: 'wrap', gap: '.5rem' }}>
            <span>© {new Date().getFullYear()} Rest Point. All rights reserved.</span>
            <span>Built with compassion for funeral professionals across Africa.</span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default OnboardingFlow;