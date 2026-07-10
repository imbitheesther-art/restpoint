import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle, AlertCircle
} from 'lucide-react';
import { authApi } from '../../api/authApi';

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
  red: '#9B4A3F',
  redBg: '#F7ECE9',
  redLine: '#E8D2CC',
  success: '#475A43',
  successBg: '#EEF3EC',
  white: '#FFFFFF',
};

const Mark = ({ size = 28, color = C.verdigris }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="1.5" />
    <path d="M16 8V24M8 16H24" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="16" r="3.5" fill={color} />
  </svg>
);

const Spinner = () => (
  <span className="spinner" />
);

const AlertMessage = ({ type, text }) => {
  if (!text) return null;

  const config = {
    error: { bg: C.redBg, color: C.red, border: C.redLine, icon: AlertCircle },
    success: { bg: C.successBg, color: C.success, border: '#DCE6D9', icon: CheckCircle },
  };
  const style = config[type] || config.error;
  const Icon = style.icon;

  return (
    <div className="alert-message" style={{ background: style.bg, color: style.color, borderColor: style.border }}>
      <Icon size={16} />
      <span>{text}</span>
    </div>
  );
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successName, setSuccessName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && token !== 'undefined' && token !== 'null') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = validateEmail(email) && password.length >= 6;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Please enter both email and password.' });
      return;
    }

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await authApi.login({
        email: email.trim(),
        password: password.trim(),
      });

      if (data && data.success) {
        const token = data.accessToken || data.token;
        if (!token) throw new Error('No token received');

        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('loginTime', new Date().toISOString());

        if (data.tenant) {
          localStorage.setItem('tenant', JSON.stringify(data.tenant));
          if (data.tenant.tenantSlug) localStorage.setItem('tenantSlug', data.tenant.tenantSlug);
          if (data.tenant.tenantId) localStorage.setItem('tenantId', data.tenant.tenantId.toString());
        }
        if (data.user?.dbName) localStorage.setItem('dbName', data.user.dbName);
        if (data.deploymentType) localStorage.setItem('deploymentType', data.deploymentType);
        if (data.user?.role) localStorage.setItem('userRole', data.user.role);

        setSuccessName(data.user?.fullName || 'Director');
        setShowSuccess(true);

        setTimeout(() => {
          const tenantSlug = data.tenant?.tenantSlug || data.user?.tenantSlug || 'default';

          if (tenantSlug && tenantSlug !== 'default') {
            localStorage.setItem('tenantSlug', tenantSlug);
          }

          navigate(`/tenant/${tenantSlug}/all-deceased`, { replace: true });
        }, 1600);
      } else {
        setMessage({
          type: 'error',
          text: data?.message || 'Invalid credentials. Please try again.'
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Connection error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }, [email, password, navigate]);

  const hasError = message.type === 'error';

  return (
    <div className="page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',sans-serif;color:${C.gray};background:${C.bone2};-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fraunces',serif;font-weight:500;letter-spacing:-0.01em;color:${C.ink}}
        
        .page-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; background: ${C.bone2}; }
        
        /* Layout */
        .login-container { width: 100%; max-width: 920px; display: flex; background: ${C.white}; border-radius: 24px; overflow: hidden; box-shadow: 0 40px 80px -20px rgba(21,23,26,0.12), 0 10px 20px rgba(21,23,26,0.04); min-height: 520px; }
        
        /* Sidebar */
        .login-sidebar { width: 380px; background: #000000; padding: 3rem 2.5rem; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; flex-shrink: 0; }
        .sidebar-grid-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; }
        .sidebar-glow { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 30% 30%, rgba(61,79,71,0.3) 0%, transparent 60%); pointer-events: none; }
        .sidebar-content { position: relative; z-index: 1; color: ${C.bone}; height: 100%; display: flex; flex-direction: column; }
        .sidebar-logo { display: flex; align-items: center; gap: 0.7rem; font-family: 'Fraunces', serif; font-size: 1.3rem; color: ${C.bone}; margin-bottom: 3rem; }
        .sidebar-headline { font-family: 'Fraunces', serif; font-size: 1.8rem; line-height: 1.3; margin-bottom: 1rem; color: ${C.bone}; }
        .sidebar-text { font-size: 0.9rem; color: rgba(255,255,255,0.6); line-height: 1.6; }
        .sidebar-footer { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: rgba(255,255,255,0.3); letter-spacing: 0.05em; margin-top: auto; }
        
        /* Form */
        .login-form { flex: 1; padding: 3rem 3.5rem; display: flex; flex-direction: column; justify-content: center; }
        .form-header { margin-bottom: 2rem; }
        .form-header h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }
        .form-header p { font-size: 0.95rem; color: ${C.gray}; }
        
        .form-group { margin-bottom: 1.2rem; }
        .form-label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: ${C.brass}; margin-bottom: 0.5rem; font-weight: 500; }
        
        .input-wrapper { position: relative; border: 1px solid ${C.line}; border-radius: 8px; background: ${C.bone2}; transition: all 0.2s; }
        .input-wrapper.error { border-color: ${C.red}; }
        .input-wrapper:focus-within { border-color: ${C.brass}; background: ${C.white}; box-shadow: 0 0 0 3px rgba(139,115,85,0.12); }
        .form-input { width: 100%; padding: 0.85rem 1rem; background: transparent; border: none; border-radius: 8px; font-size: 0.9rem; color: ${C.ink}; font-family: 'Inter', sans-serif; outline: none; }
        .form-input::placeholder { color: ${C.gray}; }
        .input-icon-btn { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: ${C.gray}; padding: 0.5rem; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
        .input-icon-btn:hover { color: ${C.ink}; }
        .form-error { display: block; color: ${C.red}; font-size: 0.75rem; margin-top: 0.3rem; }
        
        .alert-message { display: flex; align-items: center; gap: 0.6rem; padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid; font-size: 0.85rem; font-weight: 500; margin-bottom: 1.2rem; }
        
        /* Buttons */
        .btn-submit { width: 100%; padding: 0.9rem 1.2rem; font-size: 0.9rem; font-weight: 600; font-family: 'Inter', sans-serif; border: none; border-radius: 8px; background: ${C.ink}; color: ${C.bone}; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .btn-submit:hover { background: ${C.verdigris}; transform: translateY(-1px); box-shadow: 0 10px 20px rgba(21,23,26,0.15); }
        .btn-submit:disabled { background: ${C.gray}; cursor: not-allowed; opacity: 0.6; transform: none; box-shadow: none; }
        
        .form-links { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; }
        .text-link { background: none; border: none; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 500; padding: 0.2rem; transition: color 0.2s; }
        .text-link.brass { color: ${C.brass}; }
        .text-link.brass:hover { color: ${C.brassLight}; }
        .text-link.verdigris { color: ${C.verdigris}; }
        .text-link.verdigris:hover { color: ${C.verdigrisDark}; }
        
        .form-footer { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid ${C.line}; text-align: center; font-size: 0.8rem; color: ${C.gray}; }
        .encrypted-badge { display: flex; align-items: center; justify-content: center; gap: 0.4rem; margin-top: 1rem; font-size: 0.7rem; font-family: 'JetBrains Mono', monospace; color: ${C.gray}; opacity: 0.6; }
        
        /* Spinner & Animations */
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(250,248,244,0.3); border-top-color: ${C.bone}; border-radius: 50%; animation: spin 0.65s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        
        /* Success Modal */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(21,23,26,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.3s ease both; }
        .modal-card { background: ${C.white}; border-radius: 16px; padding: 2.5rem 2rem; text-align: center; max-width: 360px; width: 90%; animation: popIn 0.4s cubic-bezier(0.16,1,0.3,1) both; box-shadow: 0 40px 80px rgba(21,23,26,0.3); }
        .modal-icon { width: 56px; height: 56px; border-radius: 50%; background: ${C.successBg}; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: ${C.success}; }
        .modal-title { font-family: 'Fraunces', serif; font-size: 1.4rem; color: ${C.ink}; margin-bottom: 0.5rem; font-weight: 500; }
        .modal-text { font-size: 0.9rem; color: ${C.gray}; margin-bottom: 1.5rem; }
        .modal-progress { width: 60%; height: 4px; background: ${C.line}; border-radius: 2px; margin: 0 auto; overflow: hidden; }
        .modal-progress-bar { width: 100%; height: 100%; background: ${C.verdigris}; border-radius: 2px; animation: shimmer 1.2s ease infinite; background-size: 200% 100%; }
        
        /* Responsive */
        @media (max-width: 768px) {
          .login-container { flex-direction: column; max-width: 420px; }
          .login-sidebar { width: 100%; padding: 2rem; min-height: auto; }
          .sidebar-logo { margin-bottom: 1.5rem; }
          .sidebar-headline { font-size: 1.4rem; }
          .login-form { padding: 2.5rem 2rem; }
        }
        @media (max-width: 480px) {
          .page-wrapper { padding: 0; }
          .login-container { border-radius: 0; min-height: 100vh; }
          .login-sidebar { padding: 1.5rem; }
          .sidebar-headline { display: none; }
          .sidebar-text { display: none; }
          .login-form { padding: 2rem 1.5rem; }
        }
      `}</style>

      <div className="login-container">
        {/* Sidebar */}
        <div className="login-sidebar">
          <div className="sidebar-grid-bg"></div>
          <div className="sidebar-glow"></div>
          <div className="sidebar-content">
            <div className="sidebar-logo">
              <Mark size={28} color={C.brassLight} />
              Rest Point
            </div>
            <div>
              <h2 className="sidebar-headline">Dignified care, <br /> perfectly managed.</h2>
              <p className="sidebar-text">Sign in to access your funeral home registry and continue serving families with excellence.</p>
            </div>
            <div className="sidebar-footer">
              WELT TALLIS TECHNOLOGIES
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="login-form">
          <div className="form-header">
            <h1>Sign in to the registry</h1>
            <p>Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <AlertMessage type={message.type} text={message.text} />

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className={`input-wrapper ${hasError && !email ? 'error' : ''}`}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (message.text) setMessage({ type: '', text: '' });
                  }}
                  placeholder="director@funeralhome.co.ke"
                  disabled={loading}
                  autoFocus
                  autoComplete="email"
                  className="form-input"
                />
              </div>
              {hasError && !email && <span className="form-error">Email is required.</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className={`input-wrapper ${hasError && !password ? 'error' : ''}`}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (message.text) setMessage({ type: '', text: '' });
                  }}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                  className="form-input"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="input-icon-btn"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {hasError && !password && <span className="form-error">Password is required.</span>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading || !isFormValid} className="btn-submit">
              {loading ? (
                <>
                  <Spinner />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="form-links">
            <button onClick={() => navigate('/forgot-password')} className="text-link brass">
              Forgot password?
            </button>
            <button onClick={() => navigate('/change-password')} className="text-link verdigris">
              Change password
            </button>
          </div>

          {/* Footer */}
          <div className="form-footer">
            <span>Family member? <button onClick={() => navigate('/portal/login')} className="text-link verdigris" style={{ fontWeight: 600, textDecoration: 'underline' }}>Access family portal</button></span>
            <div className="encrypted-badge">
              <ShieldCheck size={12} />
              <span>Encrypted connection</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>© 2026 Rest Point</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-icon">
              <CheckCircle size={28} />
            </div>
            <h3 className="modal-title">Welcome, {successName}</h3>
            <p className="modal-text">Redirecting to your dashboard...</p>
            <div className="modal-progress">
              <div className="modal-progress-bar"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}