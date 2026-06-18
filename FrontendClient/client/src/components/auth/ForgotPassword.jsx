import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { ENDPOINTS } from '../../api/endpoints';
import api from '../../api/axios';

/* ============================================================
   REST POINT — Forgot password
   Same system as login / marketing site: ink, bone, brass, verdigris.
   Fraunces for display, Inter for UI, JetBrains Mono for labels.
   Three labeled steps instead of unlabeled dots.
   ============================================================ */

const C = {
  ink: '#15171A',
  bone: '#FAF8F4',
  bone2: '#F3EFE6',
  brass: '#8B7355',
  brassLight: '#A98F6E',
  verdigris: '#3D4F47',
  line: '#E3DDD0',
  gray: '#6B6862',
  red: '#9B4A3F',
  redBg: '#F7ECE9',
  redLine: '#E8D2CC',
};

const Mark = ({ size = 24, color = C.ink }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="1" />
    <path d="M16 8.5V23.5M9.5 16H22.5" stroke={color} strokeWidth="1" />
    <circle cx="16" cy="16" r="2.5" fill={color} />
  </svg>
);

const checkIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.verdigris} strokeWidth="2.2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
);

const STEPS = [
  { n: '01', label: 'Email' },
  { n: '02', label: 'Code' },
  { n: '03', label: 'New password' },
];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1=email, 2=code, 3=reset
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email: email.trim() });
      if (response.data?.success) {
        setMessage({ type: 'success', text: 'A 6-digit code is on its way to your email.' });
        setTimeout(() => { setStep(2); setMessage({ type: '', text: '' }); }, 1000);
      } else {
        setMessage({ type: 'error', text: response.data?.message || 'We could not send the code.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'We could not send the code. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const codeStr = code.join('');
    if (codeStr.length !== 6) {
      setMessage({ type: 'error', text: 'Enter the full 6-digit code.' });
      return;
    }
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post(ENDPOINTS.AUTH.VERIFY_CODE, { email: email.trim(), code: codeStr });
      if (response.data?.success) {
        setMessage({ type: 'success', text: 'Code verified. Set your new password below.' });
        setTimeout(() => { setStep(3); setMessage({ type: '', text: '' }); }, 1000);
      } else {
        setMessage({ type: 'error', text: response.data?.message || 'That code did not match.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'We could not verify that code.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
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
        setMessage({ type: 'success', text: 'Password reset. Taking you to sign in.' });
        setTimeout(() => navigate('/login'), 1800);
      } else {
        setMessage({ type: 'error', text: response.data?.message || 'We could not reset your password.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'We could not reset your password.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bone, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Inter',sans-serif;background:${C.bone};}
        .fp-inp:focus{outline:none;border-color:${C.brass}!important;box-shadow:0 0 0 3px rgba(139,115,85,0.12);}
        .fp-code:focus{outline:none;border-color:${C.brass}!important;box-shadow:0 0 0 3px rgba(139,115,85,0.12);}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeUp .4s cubic-bezier(0.16,1,0.3,1) both;}
        .label-mono{font-family:'JetBrains Mono',monospace;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:${C.brass};}
      `}</style>

      <div style={{ maxWidth: '440px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Mark size={22} />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.1rem', fontWeight: 500, color: C.ink }}>Rest Point</span>
          </div>
        </div>

        <div style={{ background: '#fff', border: `1px solid ${C.line}`, padding: '2.2rem', boxShadow: '0 30px 70px -24px rgba(21,23,26,0.16)' }}>

          {/* Step indicator — labeled */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.8rem', paddingBottom: '1.4rem', borderBottom: `1px solid ${C.line}` }}>
            {STEPS.map((s, i) => {
              const n = i + 1;
              const active = step === n;
              const done = step > n;
              return (
                <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', opacity: active || done ? 1 : 0.4 }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '.74rem',
                    color: done ? C.verdigris : active ? C.brass : C.gray,
                  }}>
                    {done ? checkIcon : s.n}
                  </span>
                  <span style={{ fontSize: '.78rem', color: active ? C.ink : C.gray, fontWeight: active ? 500 : 400 }}>{s.label}</span>
                </div>
              );
            })}
          </div>

          {message.text && (
            <div className="fade-in" style={{
              padding: '.75rem .9rem', borderRadius: '4px', marginBottom: '1.25rem',
              fontSize: '.82rem',
              background: message.type === 'error' ? C.redBg : '#EEF3EC',
              border: `1px solid ${message.type === 'error' ? C.redLine : '#DCE6D9'}`,
              color: message.type === 'error' ? C.red : '#475A43',
            }}>
              {message.text}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <div className="fade-in">
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.4rem', fontWeight: 500, color: C.ink, marginBottom: '.5rem' }}>
                Forgot your password?
              </h2>
              <p style={{ fontSize: '.86rem', color: C.gray, marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Enter your email and we'll send a 6-digit code to verify it's you.
              </p>
              <form onSubmit={handleSendCode}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="label-mono" style={{ display: 'block', marginBottom: '.55rem', color: C.gray }}>Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="director@yourfuneralhome.co.ke"
                    className="fp-inp"
                    style={{
                      width: '100%', padding: '.78rem .9rem', background: '#fff',
                      border: `1px solid ${C.line}`, borderRadius: '4px', fontSize: '.92rem', color: C.ink,
                      transition: 'all .2s', fontFamily: "'Inter', sans-serif",
                    }}
                  />
                </div>
                <button type="submit" disabled={isLoading}
                  style={{
                    width: '100%', padding: '.85rem', border: 'none', borderRadius: '2px',
                    fontSize: '.88rem', fontWeight: 500,
                    background: isLoading ? C.line : C.ink, color: isLoading ? C.gray : C.bone,
                    cursor: isLoading ? 'default' : 'pointer', transition: 'background .2s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={(e) => { if (!isLoading) e.target.style.background = '#000'; }}
                  onMouseLeave={(e) => { if (!isLoading) e.target.style.background = C.ink; }}
                >
                  {isLoading ? 'Sending…' : 'Send verification code'}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Enter Code */}
          {step === 2 && (
            <div className="fade-in">
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.4rem', fontWeight: 500, color: C.ink, marginBottom: '.5rem' }}>
                Enter the code
              </h2>
              <p style={{ fontSize: '.86rem', color: C.gray, marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Sent to <span style={{ color: C.ink, fontWeight: 500 }}>{email}</span>
              </p>
              <form onSubmit={handleVerifyCode}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.6rem' }}>
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
                      className="fp-code"
                      style={{
                        width: '46px', height: '54px', textAlign: 'center', fontSize: '1.3rem', fontWeight: 500,
                        border: `1px solid ${C.line}`, borderRadius: '4px', outline: 'none',
                        transition: 'all .2s', color: C.ink, background: '#fff',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <button type="submit" disabled={isLoading}
                  style={{
                    width: '100%', padding: '.85rem', border: 'none', borderRadius: '2px',
                    fontSize: '.88rem', fontWeight: 500,
                    background: isLoading ? C.line : C.ink, color: isLoading ? C.gray : C.bone,
                    cursor: isLoading ? 'default' : 'pointer', transition: 'background .2s', marginBottom: '1rem',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={(e) => { if (!isLoading) e.target.style.background = '#000'; }}
                  onMouseLeave={(e) => { if (!isLoading) e.target.style.background = C.ink; }}
                >
                  {isLoading ? 'Verifying…' : 'Verify code'}
                </button>
                <button type="button" onClick={() => { setStep(1); setCode(['','','','','','']); }}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: C.gray, fontSize: '.82rem', textDecoration: 'underline', textDecorationColor: C.line, fontFamily: "'Inter', sans-serif" }}
                  onMouseEnter={(e) => e.target.style.color = C.ink}
                  onMouseLeave={(e) => e.target.style.color = C.gray}
                >
                  Use a different email
                </button>
              </form>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <div className="fade-in">
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.4rem', fontWeight: 500, color: C.ink, marginBottom: '1.5rem' }}>
                Set a new password
              </h2>
              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '1.1rem' }}>
                  <label className="label-mono" style={{ display: 'block', marginBottom: '.55rem', color: C.gray }}>New password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters" className="fp-inp"
                    style={{
                      width: '100%', padding: '.78rem .9rem', background: '#fff',
                      border: `1px solid ${C.line}`, borderRadius: '4px', fontSize: '.92rem', color: C.ink,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label-mono" style={{ display: 'block', marginBottom: '.55rem', color: C.gray }}>Confirm password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password" className="fp-inp"
                    style={{
                      width: '100%', padding: '.78rem .9rem', background: '#fff',
                      border: `1px solid ${C.line}`, borderRadius: '4px', fontSize: '.92rem', color: C.ink,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                </div>
                <button type="submit" disabled={isLoading}
                  style={{
                    width: '100%', padding: '.85rem', border: 'none', borderRadius: '2px',
                    fontSize: '.88rem', fontWeight: 500,
                    background: isLoading ? C.line : C.ink, color: isLoading ? C.gray : C.bone,
                    cursor: isLoading ? 'default' : 'pointer', transition: 'background .2s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={(e) => { if (!isLoading) e.target.style.background = '#000'; }}
                  onMouseLeave={(e) => { if (!isLoading) e.target.style.background = C.ink; }}
                >
                  {isLoading ? 'Resetting…' : 'Reset password'}
                </button>
              </form>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.3rem', paddingTop: '1.1rem', borderTop: `1px solid ${C.line}` }}>
            <button onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray, fontSize: '.82rem', textDecoration: 'underline', textDecorationColor: C.line, fontFamily: "'Inter', sans-serif" }}
              onMouseEnter={(e) => e.target.style.color = C.ink}
              onMouseLeave={(e) => e.target.style.color = C.gray}
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;