import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Premium Color Palette - Matching Landing Page
const C = {
  void: '#000000',
  obsidian: '#000000',
  graphite: '#0A0A0A',
  carbon: '#1A1A1A',
  ash: '#2A2A2A',
  mist: '#8A8A97',
  bone: '#D4CFC8',
  ivory: '#F0EDE6',
  gold: '#34C759',
  goldLight: '#4ADE80',
  goldDim: '#166534',
  white: '#FFFFFF',
  danger: '#C94C4C',
  dangerLight: '#FF6B6B',
};

const API_BASE_URL = 'http://localhost:8002/api';

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

  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    location: '',
    password: '',
    verifyPassword: '',
  });

  const [errors, setErrors] = useState({});

  // Password validation function
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
    if (strength === 0) return C.ash;
    if (strength === 1) return C.danger;
    if (strength === 2) return C.gold;
    return C.goldLight;
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
        setErrors(prev => ({ ...prev, logo: 'Logo size should be less than 2MB' }));
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
        setErrors(prev => ({ ...prev, logo: 'Only JPG, PNG, or SVG images are allowed' }));
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
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
      
      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      const response = await axios.post(`${API_BASE_URL}/onboarding/organization`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
        
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        // Redirect to login after 2 seconds
        setTimeout(() => {
          setIsSubmitting(false);
          navigate('/login');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Setup failed. Please try again.');
      }
    } catch (error) {
      setIsSubmitting(false);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || 'Server error occurred';
        
        if (status === 400) {
          setApiError(message || 'Invalid data provided. Please check your inputs.');
        } else if (status === 401) {
          setApiError('Authentication required. Please log in again.');
          setTimeout(() => navigate('/login'), 2000);
        } else if (status === 409) {
          setApiError('Organization with this email already exists. Please use a different email.');
        } else if (status === 500) {
          setApiError('Server error. Please try again later.');
        } else {
          setApiError(message || `Error ${status}: Unable to complete setup`);
        }
      } else if (error.request) {
        setApiError('Network error. Please check your internet connection and try again.');
      } else {
        setApiError(error.message || 'An unexpected error occurred. Please try again.');
      }
      
      console.error('Onboarding API Error:', error);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div style={{
      backgroundColor: C.void,
      fontFamily: '"DM Serif Display", "Georgia", serif',
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>
      
      {/* Terms Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.95)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: C.graphite,
                border: `1px solid ${C.gold}`,
                borderRadius: '16px',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '2rem',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowTermsModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: C.mist
                }}
              >
                ×
              </button>
              <h2 style={{ color: C.gold, marginBottom: '1.5rem' }}>Terms & Conditions</h2>
              <div style={{ color: C.ivory, lineHeight: 1.6 }}>
                <p style={{ marginBottom: '1rem' }}>By using RestPoint, you agree to these terms:</p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                    <span style={{ color: C.gold }}>•</span> Subscription payments must be made on time.
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                    <span style={{ color: C.gold }}>•</span> A 5-day grace period is provided after the due date.
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                    <span style={{ color: C.gold }}>•</span> Accounts may be suspended if payment is not received within 5 days.
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                    <span style={{ color: C.gold }}>•</span> Customer data remains securely stored during account suspension.
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                    <span style={{ color: C.gold }}>•</span> All customer data is securely isolated to prevent unauthorized access or data mix-ups.
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                    <span style={{ color: C.gold }}>•</span> RestPoint uses multiple layers of security and encryption to protect customer information.
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                    <span style={{ color: C.gold }}>•</span> The platform is built on modern cloud and microservices architecture to provide reliable performance and minimize downtime.
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                    <span style={{ color: C.gold }}>•</span> Customers retain ownership of their data at all times.
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                    <span style={{ color: C.gold }}>•</span> RestPoint supports integrations and operations across Kenya, Uganda, and Tanzania.
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                    <span style={{ color: C.gold }}>•</span> Users are responsible for maintaining the confidentiality of their account credentials.
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                    <span style={{ color: C.gold }}>•</span> Misuse, unauthorized access attempts, or illegal activities may result in immediate account suspension or termination.
                  </li>
                </ul>
                <h3 style={{ color: C.gold, marginTop: '1.5rem', marginBottom: '1rem' }}>Ownership</h3>
                <p>RestPoint is independently owned, operated, and managed. All software, branding, intellectual property, and platform services remain the exclusive property of RestPoint.</p>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                  color: C.void,
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                I Understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.carbon}`,
        padding: '1rem 2rem',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              color: C.void
            }}>RP</div>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: C.ivory }}>REST <span style={{ color: C.gold }}>POINT</span></span>
          </div>
          <div style={{ fontSize: '0.875rem', color: C.mist }}>Create Account</div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '2rem 2rem 4rem 2rem',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse 80% 50% at 50% 50%, ${C.graphite} 0%, ${C.void} 100%)`,
          zIndex: 0,
        }} />
        
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(to right, rgba(52,199,89,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(52,199,89,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '2rem' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 400, color: C.ivory, marginBottom: '0.5rem' }}>
              Welcome to <span style={{ color: C.gold }}>Rest Point</span>
            </h1>
            <p style={{ color: C.mist, fontSize: '0.9rem' }}>Create your organization account to get started</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              background: C.graphite,
              borderRadius: '16px',
              border: `1px solid ${C.carbon}`,
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            <form onSubmit={handleSubmit}>
              
              {/* API Success Message */}
              <AnimatePresence>
                {apiSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      background: C.goldDim + '20',
                      border: `1px solid ${C.gold}`,
                      color: C.gold,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      fontSize: '0.8rem',
                      textAlign: 'center'
                    }}
                  >
                    ✅ {apiSuccess}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* API Error Message */}
              <AnimatePresence>
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      background: C.danger + '20',
                      border: `1px solid ${C.danger}`,
                      color: C.dangerLight,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      fontSize: '0.8rem',
                      textAlign: 'center'
                    }}
                  >
                    ❌ {apiError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Logo Upload - MANDATORY */}
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.mist, marginBottom: '0.75rem' }}>
                  Organization Logo <span style={{ color: C.danger }}>*</span>
                </label>
                <div style={{
                  width: '100px',
                  height: '100px',
                  margin: '0 auto',
                  border: `2px dashed ${errors.logo ? C.danger : (logoPreview ? C.gold : C.ash)}`,
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  background: C.carbon,
                  transition: 'all 0.3s ease'
                }} onClick={() => document.getElementById('logoUpload').click()}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <span style={{ fontSize: '2rem' }}>📸</span>
                      <span style={{ fontSize: '0.6rem', color: C.mist, marginTop: '0.5rem' }}>Upload</span>
                    </>
                  )}
                </div>
                <input
                  id="logoUpload"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/svg+xml"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
                {errors.logo && <div style={{ color: C.danger, fontSize: '0.65rem', marginTop: '0.5rem' }}>{errors.logo}</div>}
                <div style={{ fontSize: '0.6rem', color: C.mist, marginTop: '0.5rem' }}>PNG, JPG or SVG (Max 2MB) - Required</div>
              </div>

              {/* Form Fields */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.mist, marginBottom: '0.5rem' }}>Organization Name *</label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder="e.g., Nairobi Funeral Home"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: C.carbon,
                    border: `1px solid ${errors.organizationName ? C.danger : C.ash}`,
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: C.ivory,
                  }}
                />
                {errors.organizationName && <div style={{ color: C.danger, fontSize: '0.65rem', marginTop: '0.25rem' }}>{errors.organizationName}</div>}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.mist, marginBottom: '0.5rem' }}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="info@funeralhome.co.ke"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: C.carbon,
                    border: `1px solid ${errors.email ? C.danger : C.ash}`,
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: C.ivory,
                  }}
                />
                {errors.email && <div style={{ color: C.danger, fontSize: '0.65rem', marginTop: '0.25rem' }}>{errors.email}</div>}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.mist, marginBottom: '0.5rem' }}>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Nairobi, Kenya"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: C.carbon,
                    border: `1px solid ${errors.location ? C.danger : C.ash}`,
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: C.ivory,
                  }}
                />
                {errors.location && <div style={{ color: C.danger, fontSize: '0.65rem', marginTop: '0.25rem' }}>{errors.location}</div>}
              </div>

              {/* Password Fields - Same as before */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.mist, marginBottom: '0.5rem' }}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      paddingRight: '2.5rem',
                      background: C.carbon,
                      border: `1px solid ${errors.password ? C.danger : C.ash}`,
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      color: C.ivory,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: C.mist
                    }}
                  >
                    {showPassword ? '👁️' : '🔒'}
                  </button>
                </div>
                {formData.password && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                      {[1, 2, 3].map((level) => (
                        <div key={level} style={{ flex: 1, height: '3px', background: passwordStrength >= level ? getPasswordStrengthColor(passwordStrength) : C.ash, borderRadius: '2px' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: getPasswordStrengthColor(passwordStrength) }}>
                      {getPasswordStrengthText(passwordStrength)} password
                    </div>
                  </div>
                )}
                {errors.password && <div style={{ color: C.danger, fontSize: '0.65rem', marginTop: '0.25rem' }}>{errors.password}</div>}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.mist, marginBottom: '0.5rem' }}>Verify Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showVerifyPassword ? 'text' : 'password'}
                    name="verifyPassword"
                    value={formData.verifyPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      paddingRight: '2.5rem',
                      background: C.carbon,
                      border: `1px solid ${errors.verifyPassword || errors.passwordMatch ? C.danger : C.ash}`,
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      color: C.ivory,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: C.mist
                    }}
                  >
                    {showVerifyPassword ? '👁️' : '🔒'}
                  </button>
                </div>
                {formData.verifyPassword && formData.password === formData.verifyPassword && formData.password && (
                  <div style={{ fontSize: '0.65rem', color: C.gold, marginTop: '0.25rem' }}>✓ Passwords match</div>
                )}
                {errors.verifyPassword && <div style={{ color: C.danger, fontSize: '0.65rem', marginTop: '0.25rem' }}>{errors.verifyPassword}</div>}
                {errors.passwordMatch && <div style={{ color: C.danger, fontSize: '0.65rem', marginTop: '0.25rem' }}>{errors.passwordMatch}</div>}
              </div>

              {/* Terms and Conditions */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }));
                    }}
                    style={{ width: '1rem', height: '1rem', cursor: 'pointer', accentColor: C.gold }}
                  />
                  <span style={{ fontSize: '0.75rem', color: C.mist }}>
                    I agree to the 
                    <button 
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', textDecoration: 'underline', marginLeft: '0.25rem' }}
                    >
                      Terms and Conditions
                    </button>
                  </span>
                </label>
                {errors.terms && <div style={{ color: C.danger, fontSize: '0.65rem', marginTop: '0.5rem' }}>{errors.terms}</div>}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                  color: C.void,
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account →'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${C.carbon}`,
        padding: '3rem 2rem',
        background: C.graphite,
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ color: C.gold, marginBottom: '1rem', fontSize: '1rem' }}>RestPoint</h3>
              <p style={{ color: C.mist, fontSize: '0.8rem' }}>Modern funeral home management platform for Africa.</p>
            </div>
            <div>
              <h3 style={{ color: C.gold, marginBottom: '1rem', fontSize: '1rem' }}>Related Products</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><span style={{ color: C.mist, fontSize: '0.8rem' }}>• NIA PAY - Payment Gateway</span></li>
                <li style={{ marginBottom: '0.5rem' }}><span style={{ color: C.mist, fontSize: '0.8rem' }}>• Mood Care - Wellness Platform</span></li>
                <li style={{ marginBottom: '0.5rem' }}><span style={{ color: C.mist, fontSize: '0.8rem' }}>• RestPoint Analytics</span></li>
                <li style={{ marginBottom: '0.5rem' }}><span style={{ color: C.mist, fontSize: '0.8rem' }}>• RestPoint Mobile App</span></li>
              </ul>
            </div>
            <div>
              <h3 style={{ color: C.gold, marginBottom: '1rem', fontSize: '1rem' }}>Resources</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><span style={{ color: C.mist, fontSize: '0.8rem' }}>Documentation</span></li>
                <li style={{ marginBottom: '0.5rem' }}><span style={{ color: C.mist, fontSize: '0.8rem' }}>API Reference</span></li>
                <li style={{ marginBottom: '0.5rem' }}><span style={{ color: C.mist, fontSize: '0.8rem' }}>Support</span></li>
              </ul>
            </div>
            <div>
              <h3 style={{ color: C.gold, marginBottom: '1rem', fontSize: '1rem' }}>Legal</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><span style={{ color: C.mist, fontSize: '0.8rem' }}>Privacy Policy</span></li>
                <li style={{ marginBottom: '0.5rem' }}><span style={{ color: C.mist, fontSize: '0.8rem' }}>Terms of Service</span></li>
              </ul>
            </div>
          </div>
          <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: `1px solid ${C.carbon}`, color: C.mist, fontSize: '0.7rem' }}>
            <p>&copy; {new Date().getFullYear()} RestPoint. All rights reserved. Built with ❤️ for Africa.</p>
          </div>
        </div>
      </footer>

      <style>{`
        input:focus {
          outline: none;
          border-color: ${C.gold} !important;
          box-shadow: 0 0 0 3px ${C.gold}20;
        }
      `}</style>
    </div>
  );
};

// THIS IS THE IMPORTANT PART - MAKE SURE THIS IS AT THE BOTTOM
export default OnboardingFlow;