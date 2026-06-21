import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const C = {
  ink: '#15171A', bone: '#FAF8F4', bone2: '#F3EFE6', brass: '#8B7355', brassLight: '#A98F6E',
  verdigris: '#3D4F47', line: '#E3DDD0', lineDark: '#2C2F33', gray: '#6B6862', grayLight: 'rgba(250,248,244,0.62)',
  red: '#9B4A3F', redBg: '#F7ECE9',
};

const I = {
  eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
  arr: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>,
  upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
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

  useEffect(() => { 
    const t = setTimeout(() => setLoaded(true), 60); 
    return () => clearTimeout(t); 
  }, []);

  const [formData, setFormData] = useState({ organizationName: '', email: '', location: '', password: '', verifyPassword: '' });
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
    if (file.size > 10 * 1024 * 1024) { setErrors(prev => ({ ...prev, logo: 'Logo size should be less than 10MB' })); return; }
    if (!['image/jpeg','image/png','image/jpg','image/svg+xml'].includes(file.type)) { setErrors(prev => ({ ...prev, logo: 'Only JPG, PNG, or SVG images are allowed' })); return; }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
    setErrors(prev => ({ ...prev, logo: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else { 
      const pe = validatePassword(formData.password); 
      if (pe.length > 0) newErrors.password = `Password must have: ${pe.join(', ')}`; 
    }
    if (!formData.verifyPassword) newErrors.verifyPassword = 'Please verify your password';
    else if (formData.password !== formData.verifyPassword) newErrors.passwordMatch = 'Passwords do not match';
    if (!agreeTerms) newErrors.terms = 'You must agree to the terms and conditions';
    if (!logoFile && !logoPreview) newErrors.logo = 'Organization logo is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true); setApiError(''); setApiSuccess('');
    try {
      const submitData = new FormData();
      submitData.append('organizationName', formData.organizationName);
      submitData.append('email', formData.email);
      submitData.append('location', formData.location);
      submitData.append('password', formData.password);
      submitData.append('termsAccepted', agreeTerms);
      if (logoFile) submitData.append('logo', logoFile);
      
      const response = await api.post('/api/v1/restpoint/tenant/onboarding/organization', submitData, {
        headers: { 'Content-Type': 'multipart/form-data', 'x-tenant-slug': '' }, timeout: 30000,
      });
      if (response.data.success || response.status === 200 || response.status === 201) {
        setApiSuccess(response.data.message || 'Organization setup completed! Redirecting...');
        const onboardingData = { organizationName: formData.organizationName, email: formData.email, location: formData.location, logo: logoPreview, organizationId: response.data.organizationId, userId: response.data.userId, completedAt: new Date().toISOString() };
        localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
        localStorage.setItem('onboardingComplete', 'true');
        if (response.data.token) localStorage.setItem('authToken', response.data.token);
        if (response.data.user) localStorage.setItem('user', JSON.stringify(response.data.user));
        setTimeout(() => { setIsSubmitting(false); navigate('/login'); }, 2000);
      } else { throw new Error(response.data.message || 'Setup failed.'); }
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth;background:${C.bone}}
        body{overflow-x:hidden;background:${C.bone};color:${C.gray};font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased}
        ::selection{background:rgba(139,115,85,0.18);color:${C.ink}}
        .inp:focus{outline:none;border-color:${C.brass}!important;box-shadow:0 0 0 3px rgba(139,115,85,0.12)}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{width:14px;height:14px;border:2px solid rgba(250,248,244,0.35);border-top-color:${C.bone};border-radius:50%;animation:spin .65s linear infinite;display:inline-block}
        .label-mono{font-family:'JetBrains Mono',monospace;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:${C.brass}}
      `}</style>

      {/* Terms Modal */}
      {showTermsModal && (
        <div style={{ position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(21,23,26,0.88)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem' }} onClick={() => setShowTermsModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background:C.bone,border:`1px solid ${C.line}`,padding:'2.4rem',maxWidth:'580px',width:'100%',maxHeight:'80vh',overflow:'auto',boxShadow:'0 40px 80px -20px rgba(0,0,0,0.5)' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'1.2rem' }}>
              <div className="label-mono">Terms & Conditions</div>
              <button onClick={() => setShowTermsModal(false)} style={{ background:'none',border:'none',cursor:'pointer',color:C.gray,padding:'.2rem',display:'flex' }}>{I.x}</button>
            </div>
            <h2 style={{ fontFamily:"'Fraunces',serif",fontSize:'1.6rem',fontWeight:500,color:C.ink,marginBottom:'1.2rem' }}>Rest Point <span style={{ color:C.brass }}>Service Agreement</span></h2>
            <div style={{ color:C.gray,lineHeight:1.7,fontSize:'.85rem' }}>
              <p style={{ marginBottom:'1rem' }}>Please review our full terms before creating your account:</p>
              <div style={{ display:'flex',gap:'1rem',justifyContent:'center',fontSize:'.8rem',padding:'1rem 0' }}>
                <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color:C.brass,textDecoration:'underline' }}>Terms of Service</a>
                <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color:C.brass,textDecoration:'underline' }}>Privacy Policy</a>
              </div>
            </div>
            <button onClick={() => setShowTermsModal(false)} style={{ marginTop:'1.5rem',width:'100%',background:C.ink,color:C.bone,border:'none',padding:'.8rem',fontSize:'.8rem',fontWeight:500,cursor:'pointer',transition:'background .2s' }}>I Understand</button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:300,background:'rgba(250,248,244,0.92)',backdropFilter:'blur(10px)',borderBottom:`1px solid ${C.line}`,padding:'1.1rem 0' }}>
        <div style={{ maxWidth:'1100px',margin:'0 auto',padding:'0 1.75rem',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'.6rem',cursor:'pointer' }} onClick={() => window.scrollTo({ top:0,behavior:'smooth' })}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14.5" stroke={C.ink} strokeWidth="1"/><path d="M16 8.5V23.5M9.5 16H22.5" stroke={C.ink} strokeWidth="1"/><circle cx="16" cy="16" r="2.5" fill={C.ink}/></svg>
            <span style={{ fontFamily:"'Fraunces',serif",fontSize:'1.05rem',fontWeight:500,color:C.ink }}>Rest Point</span>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:'1rem' }}>
            <span className="label-mono" style={{ fontSize:'.72rem' }}>Create Account</span>
            <button onClick={() => navigate('/login')} style={{ background:'transparent',color:C.ink,border:`1px solid ${C.ink}`,padding:'.5rem 1rem',fontSize:'.78rem',fontWeight:500,cursor:'pointer',transition:'all .2s',fontFamily:"'Inter',sans-serif" }}>Log in</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ paddingTop:'76px',minHeight:'100vh' }}>
        <section style={{ padding:'3.5rem 0 5rem' }}>
          <div style={{ maxWidth:'1100px',margin:'0 auto',padding:'0 1.75rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3rem',alignItems:'start' }}>

            {/* Left Column - Form */}
            <div>
              {/* Header */}
              <div style={{ opacity:loaded?1:0,transform:loaded?'translateY(0)':'translateY(14px)',transition:'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',textAlign:'center',marginBottom:'2.4rem' }}>
                <div className="label-mono" style={{ marginBottom:'.8rem',color:C.brass }}>Enterprise Onboarding</div>
                <h1 style={{ fontFamily:"'Fraunces',serif",fontSize:'clamp(1.8rem,5vw,2.6rem)',fontWeight:500,color:C.ink,marginBottom:'.75rem',lineHeight:1.15 }}>Create your <span style={{ color:C.brass,fontStyle:'italic' }}>organization</span> account</h1>
                <p style={{ fontSize:'.92rem',color:C.gray,lineHeight:1.7,maxWidth:'400px',margin:'0 auto' }}>Set up your mortuary on Rest Point. Complete the form below to get started.</p>
              </div>

              {/* Fee notice */}
              <div style={{ opacity:loaded?1:0,transform:loaded?'translateY(0)':'translateY(10px)',transition:'opacity 0.7s cubic-bezier(0.16,1,0.3,1) 80ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) 80ms',marginBottom:'2rem' }}>
                <div style={{ background:C.bone2,border:`1px solid ${C.line}`,padding:'1rem 1.2rem',borderRadius:'2px' }}>
                  <p style={{ fontSize:'.8rem',color:C.ink,fontWeight:600,marginBottom:'.3rem' }}>Service & Setup Fee — KES 10,000 per branch</p>
                  <p style={{ fontSize:'.78rem',color:C.gray,marginBottom:'.6rem' }}>One-time registration & training fee per branch. Includes setup support and onboarding assistance.</p>
                  <div style={{ display:'flex',gap:'.6rem',flexWrap:'wrap' }}>
                    <span style={{ background:C.ink,color:C.bone,padding:'.15rem .5rem',fontSize:'.68rem' }}>Single: KES 9,500/mo</span>
                    <span style={{ background:C.brass,color:C.bone,padding:'.15rem .5rem',fontSize:'.68rem' }}>Multi-Tenant: KES 18,500/mo</span>
                    <span style={{ background:C.verdigris,color:C.bone,padding:'.15rem .5rem',fontSize:'.68rem' }}>No Limitations</span>
                  </div>
                </div>
              </div>

              {/* Form Card */}
              <div style={{ opacity:loaded?1:0,transform:loaded?'translateY(0)':'translateY(18px)',transition:'opacity 0.7s cubic-bezier(0.16,1,0.3,1) 120ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) 120ms',background:'#fff',border:`1px solid ${C.line}`,padding:'2rem 2rem 2.2rem',boxShadow:'0 20px 60px -16px rgba(21,23,26,0.12)' }}>
                <form onSubmit={handleSubmit}>
                  {/* Success Message */}
                  {apiSuccess && (
                    <div style={{ background:'#EEF3EC',border:'1px solid #DCE6D9',color:'#475A43',padding:'.75rem .9rem',marginBottom:'1.25rem',fontSize:'.82rem',display:'flex',alignItems:'center',gap:'.5rem' }}>{I.check} {apiSuccess}</div>
                  )}
                  {/* Error Message */}
                  {apiError && (
                    <div style={{ background:C.redBg,border:'1px solid #E8D2CC',color:C.red,padding:'.75rem .9rem',marginBottom:'1.25rem',fontSize:'.82rem' }}>{apiError}</div>
                  )}

                  {/* Logo Upload */}
                  <div style={{ marginBottom:'1.5rem',textAlign:'center' }}>
                    <div className="label-mono" style={{ marginBottom:'.75rem' }}>Organization Logo <span style={{ color:C.brass }}>*</span></div>
                    <div style={{ width:'90px',height:'90px',margin:'0 auto',border:`2px dashed ${errors.logo ? C.red : (logoPreview ? C.brass : C.line)}`,borderRadius:'50%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden',background:C.bone2,transition:'all .25s' }} onClick={() => document.getElementById('logoUpload').click()}>
                      {logoPreview ? <img src={logoPreview} alt="Logo" style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : <><div style={{ color:C.gray,marginBottom:'.25rem' }}>{I.upload}</div><span style={{ fontSize:'.65rem',color:C.gray }}>Upload</span></>}
                    </div>
                    <input id="logoUpload" type="file" accept="image/jpeg,image/png,image/jpg,image/svg+xml" onChange={handleLogoUpload} style={{ display:'none' }} />
                    {errors.logo && <div style={{ color:C.red,fontSize:'.72rem',marginTop:'.4rem' }}>{errors.logo}</div>}
                    <div style={{ fontSize:'.7rem',color:C.gray,marginTop:'.4rem' }}>PNG, JPG or SVG (Max 10MB)</div>
                  </div>

                  {/* Organization Name */}
                  <div style={{ marginBottom:'1.1rem' }}>
                    <div className="label-mono" style={{ marginBottom:'.45rem' }}>Organization Name <span style={{ color:C.brass }}>*</span></div>
                    <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} placeholder="e.g., Nairobi Funeral Home" className="inp" style={{ width:'100%',padding:'.7rem .8rem',background:C.bone,border:`1px solid ${errors.organizationName ? C.red : C.line}`,borderRadius:'2px',fontSize:'.88rem',color:C.ink,transition:'all .2s',fontFamily:"'Inter',sans-serif" }} />
                    {errors.organizationName && <div style={{ color:C.red,fontSize:'.72rem',marginTop:'.25rem' }}>{errors.organizationName}</div>}
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom:'1.1rem' }}>
                    <div className="label-mono" style={{ marginBottom:'.45rem' }}>Email Address <span style={{ color:C.brass }}>*</span></div>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="info@funeralhome.co.ke" className="inp" style={{ width:'100%',padding:'.7rem .8rem',background:C.bone,border:`1px solid ${errors.email ? C.red : C.line}`,borderRadius:'2px',fontSize:'.88rem',color:C.ink,transition:'all .2s',fontFamily:"'Inter',sans-serif" }} />
                    {errors.email && <div style={{ color:C.red,fontSize:'.72rem',marginTop:'.25rem' }}>{errors.email}</div>}
                  </div>

                  {/* Location */}
                  <div style={{ marginBottom:'1.1rem' }}>
                    <div className="label-mono" style={{ marginBottom:'.45rem' }}>Location <span style={{ color:C.brass }}>*</span></div>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Nairobi, Kenya" className="inp" style={{ width:'100%',padding:'.7rem .8rem',background:C.bone,border:`1px solid ${errors.location ? C.red : C.line}`,borderRadius:'2px',fontSize:'.88rem',color:C.ink,transition:'all .2s',fontFamily:"'Inter',sans-serif" }} />
                    {errors.location && <div style={{ color:C.red,fontSize:'.72rem',marginTop:'.25rem' }}>{errors.location}</div>}
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom:'1rem' }}>
                    <div className="label-mono" style={{ marginBottom:'.45rem' }}>Password <span style={{ color:C.brass }}>*</span></div>
                    <div style={{ position:'relative' }}>
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password" className="inp" style={{ width:'100%',padding:'.7rem .8rem',paddingRight:'2.4rem',background:C.bone,border:`1px solid ${errors.password ? C.red : C.line}`,borderRadius:'2px',fontSize:'.88rem',color:C.ink,transition:'all .2s',fontFamily:"'Inter',sans-serif" }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:'absolute',right:'.7rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:C.gray,padding:'.2rem',display:'flex' }}>{showPassword ? I.eyeOff : I.eye}</button>
                    </div>
                    {formData.password && (
                      <div style={{ marginTop:'.4rem' }}>
                        <div style={{ display:'flex',gap:'.25rem',marginBottom:'.2rem' }}>
                          {[1,2,3].map((level) => (
                            <div key={level} style={{ flex:1,height:'3px',background:passwordStrength>=level?getPasswordStrengthColor(passwordStrength):C.line,borderRadius:'2px',transition:'background .2s' }} />
                          ))}
                        </div>
                        <div style={{ fontSize:'.7rem',color:getPasswordStrengthColor(passwordStrength) }}>{getPasswordStrengthText(passwordStrength)} password</div>
                      </div>
                    )}
                    {errors.password && <div style={{ color:C.red,fontSize:'.72rem',marginTop:'.25rem' }}>{errors.password}</div>}
                  </div>

                  {/* Verify Password */}
                  <div style={{ marginBottom:'1.4rem' }}>
                    <div className="label-mono" style={{ marginBottom:'.45rem' }}>Verify Password <span style={{ color:C.brass }}>*</span></div>
                    <div style={{ position:'relative' }}>
                      <input type={showVerifyPassword ? 'text' : 'password'} name="verifyPassword" value={formData.verifyPassword} onChange={handleChange} placeholder="Confirm your password" className="inp" style={{ width:'100%',padding:'.7rem .8rem',paddingRight:'2.4rem',background:C.bone,border:`1px solid ${(errors.verifyPassword||errors.passwordMatch)?C.red:C.line}`,borderRadius:'2px',fontSize:'.88rem',color:C.ink,transition:'all .2s',fontFamily:"'Inter',sans-serif" }} />
                      <button type="button" onClick={() => setShowVerifyPassword(!showVerifyPassword)} style={{ position:'absolute',right:'.7rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:C.gray,padding:'.2rem',display:'flex' }}>{showVerifyPassword ? I.eyeOff : I.eye}</button>
                    </div>
                    {formData.verifyPassword && formData.password === formData.verifyPassword && formData.password && (
                      <div style={{ fontSize:'.7rem',color:C.verdigris,marginTop:'.25rem',display:'flex',alignItems:'center',gap:'.3rem' }}>{I.check} Passwords match</div>
                    )}
                    {errors.verifyPassword && <div style={{ color:C.red,fontSize:'.72rem',marginTop:'.25rem' }}>{errors.verifyPassword}</div>}
                    {errors.passwordMatch && <div style={{ color:C.red,fontSize:'.72rem',marginTop:'.25rem' }}>{errors.passwordMatch}</div>}
                  </div>

                  {/* Terms */}
                  <div style={{ marginBottom:'1.6rem' }}>
                    <label style={{ display:'flex',alignItems:'flex-start',gap:'.7rem',cursor:'pointer' }}>
                      <input type="checkbox" checked={agreeTerms} onChange={(e) => { setAgreeTerms(e.target.checked); if (errors.terms) setErrors(prev => ({ ...prev, terms:'' })); }} style={{ width:'1rem',height:'1rem',cursor:'pointer',marginTop:'.15rem',flexShrink:0,accentColor:C.brass }} />
                      <span style={{ fontSize:'.8rem',color:C.gray,lineHeight:1.5 }}>I agree to the <button type="button" onClick={() => setShowTermsModal(true)} style={{ background:'none',border:'none',color:C.brass,cursor:'pointer',textDecoration:'underline',fontSize:'.8rem',fontFamily:"'Inter',sans-serif",padding:0 }}>Terms and Conditions</button>. I confirm that I am authorized to set up an organization account.</span>
                    </label>
                    {errors.terms && <div style={{ color:C.red,fontSize:'.72rem',marginTop:'.4rem' }}>{errors.terms}</div>}
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={isSubmitting} style={{ width:'100%',background:isSubmitting?C.line:C.ink,color:isSubmitting?C.gray:C.bone,border:'none',padding:'.85rem',fontSize:'.85rem',fontWeight:500,cursor:isSubmitting?'default':'pointer',transition:'background .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:'.5rem',fontFamily:"'Inter',sans-serif" }}>
                    {isSubmitting ? <><span className="spinner" /> Creating Account...</> : <>Create Account {I.arr}</>}
                  </button>
                </form>
              </div>

              {/* Trust badges */}
              <div style={{ marginTop:'2rem',display:'flex',flexWrap:'wrap',gap:'.6rem',justifyContent:'center',opacity:loaded?1:0,transition:'opacity 0.6s ease 200ms' }}>
                {[['Encrypted','AES-256'],['Security','Enterprise'],['Cloud','Contabo']].map(([label,sub]) => (
                  <div key={label} style={{ display:'flex',alignItems:'center',gap:'.35rem',border:`1px solid ${C.line}`,padding:'.35rem .65rem',fontSize:'.68rem',color:C.gray }}>
                    <span style={{ color:C.brass,fontSize:'.7rem' }}>●</span><span style={{ fontWeight:500,color:C.ink }}>{label}</span><span>{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Info */}
            <div style={{ opacity:loaded?1:0,transform:loaded?'translateY(0)':'translateY(18px)',transition:'opacity 0.7s cubic-bezier(0.16,1,0.3,1) 140ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) 140ms' }}>
              <div style={{ background:C.ink,color:C.bone,padding:'2.5rem 2rem',borderRadius:'2px',height:'100%' }}>
                <div className="label-mono" style={{ color:C.brassLight,marginBottom:'1.2rem' }}>Why Rest Point</div>
                <h3 style={{ fontFamily:"'Fraunces',serif",fontSize:'1.4rem',fontWeight:500,color:C.bone,marginBottom:'1.2rem',lineHeight:1.3 }}>Built for funeral professionals, by people who understand the work.</h3>
                <p style={{ fontSize:'.88rem',color:C.grayLight,lineHeight:1.7,marginBottom:'2rem' }}>Join 100+ funeral homes across East Africa already using Rest Point to manage cases, communicate with families, and run their operations with confidence.</p>
                <div style={{ borderTop:'1px solid rgba(250,248,244,0.14)',paddingTop:'1.5rem' }}>
                  <div style={{ fontSize:'.78rem',color:C.grayLight,marginBottom:'.8rem' }}>What you get:</div>
                  <ul style={{ listStyle:'none',padding:0,margin:0 }}>
                    {['Complete case management','Family portal by SMS','Dispatch & fleet tracking','Document generation','Google Drive backup'].map((item,i) => (
                      <li key={i} style={{ fontSize:'.85rem',color:C.bone,marginBottom:'.6rem',display:'flex',gap:'.6rem',alignItems:'center' }}><span style={{ color:C.brassLight }}>—</span> {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
          <style>{`
            @media (max-width: 860px) {
              main section > div { grid-template-columns: 1fr !important; gap: 2rem !important; }
              main section > div > div:last-child { display: none !important; }
            }
          `}</style>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background:C.ink,color:C.grayLight,padding:'3rem 0 2rem' }}>
        <div style={{ maxWidth:'1100px',margin:'0 auto',padding:'0 1.75rem' }}>
          <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'2rem',marginBottom:'2rem',paddingBottom:'2rem',borderBottom:`1px solid ${C.lineDark}` }}>
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.7rem' }}>
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14.5" stroke="#FAF8F4" strokeWidth="1"/><path d="M16 8.5V23.5M9.5 16H22.5" stroke="#FAF8F4" strokeWidth="1"/><circle cx="16" cy="16" r="2.5" fill="#FAF8F4"/></svg>
                <span style={{ fontFamily:"'Fraunces',serif",fontSize:'1rem',color:C.bone }}>Rest Point</span>
              </div>
              <p style={{ fontSize:'.82rem',color:C.grayLight,maxWidth:'260px',lineHeight:1.6 }}>The complete mortuary operating system, built for East Africa.</p>
            </div>
            <div>
              <div style={{ fontSize:'.7rem',color:C.brassLight,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'.8rem',fontFamily:"'JetBrains Mono',monospace" }}>Product</div>
              {['Features','Family Portal','Marketplace','Pricing'].map(l => <div key={l} style={{ fontSize:'.82rem',color:C.grayLight,marginBottom:'.5rem',cursor:'pointer' }}>{l}</div>)}
            </div>
            <div>
              <div style={{ fontSize:'.7rem',color:C.brassLight,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'.8rem',fontFamily:"'JetBrains Mono',monospace" }}>Company</div>
              {['About','Blog','Careers','Contact'].map(l => <div key={l} style={{ fontSize:'.82rem',color:C.grayLight,marginBottom:'.5rem',cursor:'pointer' }}>{l}</div>)}
            </div>
            <div>
              <div style={{ fontSize:'.7rem',color:C.brassLight,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'.8rem',fontFamily:"'JetBrains Mono',monospace" }}>Legal</div>
              {['Privacy Policy','Terms of Service','Security'].map(l => <div key={l} style={{ fontSize:'.82rem',color:C.grayLight,marginBottom:'.5rem',cursor:'pointer' }}>{l}</div>)}
            </div>
          </div>
          <div style={{ display:'flex',justifyContent:'space-between',fontSize:'.74rem',color:'rgba(250,248,244,0.45)',flexWrap:'wrap',gap:'.5rem' }}>
            <span>&copy; {new Date().getFullYear()} Rest Point Technologies. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default OnboardingFlow;