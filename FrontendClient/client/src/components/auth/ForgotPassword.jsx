import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { ENDPOINTS } from '../../api/endpoints';
import api from '../../api/axios';

const LPC = {
  navy900: '#0A1F3D', navy800: '#0F2847', navy700: '#1a3a52',
  navy50: '#F9FAFB', char900: '#111827', char700: '#374151',
  char600: '#4B5563', char500: '#6B7280', char300: '#D1D5DB',
  char200: '#E5E7EB', char100: '#F3F4F6',
  gold: '#A67C52', goldL: '#C9A876', goldD: '#8B6340',
  emerald: '#059669', emeraldL: '#10B981',
};

const T = {
  bg0: LPC.navy900, bg1: LPC.navy800, bg2: LPC.navy700,
  bg3: '#f8f9fa', bg4: '#ffffff',
  line: LPC.char200, line2: LPC.char300,
  dim: LPC.char500, sub: LPC.char600, muted: LPC.char500,
  mid: LPC.char700, light: LPC.char900, white: '#111827',
  g: LPC.gold, gd: LPC.goldD, gl: LPC.goldL,
  ga: 'rgba(166,124,82,0.12)', ga2: 'rgba(166,124,82,0.06)',
  ga3: 'rgba(166,124,82,0.04)', gs: `0 0 30px rgba(166,124,82,0.2)`,
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1=email, 2=code, 3=reset
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [navScrolled, setNavScrolled] = useState(false);

  React.useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email: email.trim() });
      if (response.data?.success) {
        setMessage({ type: 'success', text: 'A 6-digit verification code has been sent to your email' });
        setTimeout(() => { setStep(2); setMessage({ type: '', text: '' }); }, 1000);
      } else {
        setMessage({ type: 'error', text: response.data?.message || 'Failed to send code' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to send verification code. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    // Auto-advance to next field
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const codeStr = code.join('');
    if (codeStr.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter the full 6-digit code' });
      return;
    }
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await api.post(ENDPOINTS.AUTH.VERIFY_CODE, { email: email.trim(), code: codeStr });
      if (response.data?.success) {
        setMessage({ type: 'success', text: 'Code verified! Set your new password.' });
        setTimeout(() => { setStep(3); setMessage({ type: '', text: '' }); }, 1000);
      } else {
        setMessage({ type: 'error', text: response.data?.message || 'Invalid code' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to verify code' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await api.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
        email: email.trim(),
        code: code.join(''),
        password: newPassword,
      });
      if (response.data?.success) {
        setMessage({ type: 'success', text: 'Password reset successful! Redirecting to login...' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage({ type: 'error', text: response.data?.message || 'Failed to reset password' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reset password' });
    } finally {
      setIsLoading(false);
    }
  };

  const codeInputStyle = {
    width: '48px', height: '56px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 700,
    border: `2px solid ${T.char300}`, borderRadius: '12px', outline: 'none',
    transition: 'all 0.2s', color: T.light, background: T.bg4,
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        .cg{font-family:'Cormorant Garamond',Georgia,serif;}
        .syne{font-family:'Syne',sans-serif;}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;background:${T.bg0};}
        .inp:focus{outline:none;border-color:${T.g}!important;box-shadow:0 0 0 3px ${T.ga};}
        input.code-input:focus{border-color:${T.g}!important;box-shadow:0 0 0 3px ${T.ga};}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn .3s ease forwards;}
      `}</style>

      <div style={{
        maxWidth: '440px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: T.ga, border: `1px solid rgba(166,124,82,0.2)`, borderRadius: '8px', padding: '8px 16px', marginBottom: '1rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: T.g, boxShadow: `0 0 10px ${T.g}` }} />
            <span className="syne" style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '.16em', color: T.g }}>REST POINT</span>
          </div>
        </div>

        <div style={{
          background: T.bg3, borderRadius: '16px', padding: '2rem',
          border: `1px solid ${T.line}`, boxShadow: '0 40px 80px -20px rgba(0,0,0,.8)',
        }}>
          {/* Step Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                width: '32px', height: '4px', borderRadius: '2px',
                background: step >= s ? T.g : T.char300, transition: 'all 0.3s',
              }} />
            ))}
          </div>

          {message.text && (
            <div className="fade-in" style={{
              padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem',
              background: message.type === 'error' ? 'rgba(201,76,76,.1)' : T.ga,
              border: `1px solid ${message.type === 'error' ? 'rgba(201,76,76,.3)' : 'rgba(166,124,82,.3)'}`,
              color: message.type === 'error' ? '#ff6b6b' : T.g,
            }}>
              {message.type === 'error' ? '⚠️' : '✅'} {message.text}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <div className="fade-in">
              <h2 className="cg" style={{ fontSize: '1.5rem', fontWeight: 600, color: T.white, marginBottom: '0.5rem', textAlign: 'center' }}>
                Forgot Password?
              </h2>
              <p style={{ fontSize: '0.85rem', color: T.muted, textAlign: 'center', marginBottom: '1.5rem' }}>
                Enter your email and we'll send you a 6-digit verification code
              </p>
              <form onSubmit={handleSendCode}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="syne" style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '.14em', textTransform: 'uppercase', color: T.muted, marginBottom: '.5rem', fontWeight: 600 }}>
                    Email Address
                  </label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@funeralhome.co.ke"
                    className="inp"
                    style={{
                      width: '100%', padding: '0.75rem 1rem', background: T.bg4,
                      border: `1px solid ${T.line2}`, borderRadius: '8px', fontSize: '0.88rem', color: T.light,
                      transition: 'all .2s',
                    }}
                  />
                </div>
                <button type="submit" disabled={isLoading}
                  style={{
                    width: '100%', padding: '0.75rem', border: 'none', borderRadius: '8px',
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                    background: isLoading ? T.dim : T.g, color: isLoading ? T.muted : '#000',
                    cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1,
                    boxShadow: isLoading ? 'none' : '0 4px 24px -6px rgba(166,124,82,.5)',
                    transition: 'all .22s',
                  }}>
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Enter Code */}
          {step === 2 && (
            <div className="fade-in">
              <h2 className="cg" style={{ fontSize: '1.5rem', fontWeight: 600, color: T.white, marginBottom: '0.5rem', textAlign: 'center' }}>
                Enter Code
              </h2>
              <p style={{ fontSize: '0.85rem', color: T.muted, textAlign: 'center', marginBottom: '1.5rem' }}>
                Enter the 6-digit code sent to<br/><strong style={{ color: T.g }}>{email}</strong>
              </p>
              <form onSubmit={handleVerifyCode}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          const prevInput = document.getElementById(`code-${index - 1}`);
                          if (prevInput) prevInput.focus();
                        }
                      }}
                      className="code-input"
                      style={codeInputStyle}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <button type="submit" disabled={isLoading}
                  style={{
                    width: '100%', padding: '0.75rem', border: 'none', borderRadius: '8px',
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                    background: isLoading ? T.dim : T.g, color: isLoading ? T.muted : '#000',
                    cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1,
                    transition: 'all .22s', marginBottom: '1rem',
                  }}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button type="button" onClick={() => { setStep(1); setCode(['','','','','','']); }}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: T.g, fontSize: '0.8rem', textDecoration: 'underline' }}>
                  Back to email
                </button>
              </form>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <div className="fade-in">
              <h2 className="cg" style={{ fontSize: '1.5rem', fontWeight: 600, color: T.white, marginBottom: '1.5rem', textAlign: 'center' }}>
                Set New Password
              </h2>
              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: T.muted, marginBottom: '0.4rem' }}>
                    New Password
                  </label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters" className="inp"
                    style={{
                      width: '100%', padding: '0.75rem 1rem', background: T.bg4,
                      border: `1px solid ${T.line2}`, borderRadius: '8px', fontSize: '0.88rem', color: T.light,
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: T.muted, marginBottom: '0.4rem' }}>
                    Confirm Password
                  </label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password" className="inp"
                    style={{
                      width: '100%', padding: '0.75rem 1rem', background: T.bg4,
                      border: `1px solid ${T.line2}`, borderRadius: '8px', fontSize: '0.88rem', color: T.light,
                    }}
                  />
                </div>
                <button type="submit" disabled={isLoading}
                  style={{
                    width: '100%', padding: '0.75rem', border: 'none', borderRadius: '8px',
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                    background: isLoading ? T.dim : T.g, color: isLoading ? T.muted : '#000',
                    cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1,
                    transition: 'all .22s',
                  }}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </div>
          )}

          {/* Back to login */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <button onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: '0.8rem', textDecoration: 'underline', textDecorationColor: 'rgba(166,124,82,.4)' }}>
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;