import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

const C = {
  navy900: '#0A1F3D',
  navy800: '#0F2847',
  gold:    '#A67C52',
  goldD:   '#8B6340',
  emerald: '#059669',
};

function PortalLoginPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    if (message.text) setMessage({ type: '', text: '' });
  };

  const getRawPhoneDigits = () => phoneNumber.replace(/\D/g, '');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    const rawDigits = getRawPhoneDigits();
    if (!rawDigits || rawDigits.length < 10) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number' });
      setIsLoading(false);
      return;
    }
    try {
      const data = await authApi.portalLogin({ phone: rawDigits });
      if (data && data.success) {
        localStorage.setItem('sessionToken', data.sessionToken || data.session_token);
        localStorage.setItem('tenantSlug', data.tenantSlug);
        localStorage.setItem('deceasedId', data.deceased?.deceased_id);
        if (data.deceased) localStorage.setItem('deceased', JSON.stringify(data.deceased));
        setMessage({ type: 'success', text: 'Welcome. Redirecting...' });
        setTimeout(() => navigate(`/portal/${data.tenantSlug}/dashboard`), 1500);
      } else {
        setMessage({ type: 'error', text: data?.message || 'Phone number not found.' });
        setIsLoading(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to connect.' });
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Inter',sans-serif;overflow:hidden}
        .portal-page{position:relative;width:100%;height:100vh;display:flex;align-items:center;justify-content:center;background:#0A1F3D}
        .portal-bg{position:absolute;inset:0;background:url('/familyportal.png') center/cover no-repeat;filter:brightness(0.6) saturate(1.2);z-index:0}
        .portal-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(10,31,61,0.85) 0%,rgba(15,40,71,0.7) 100%);z-index:1}
        .portal-content{position:relative;z-index:2;width:100%;max-width:440px;padding:0 24px;text-align:center;animation:fadeInUp 0.8s ease}
        .portal-logo{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:32px}
        .portal-logo-dot{width:12px;height:12px;border-radius:50%;background:#059669}
        .portal-logo-text{font-family:'Lora',serif;font-size:2rem;font-weight:700;color:#fff;letter-spacing:-0.02em}
        .portal-title{font-family:'Lora',serif;font-size:2.5rem;font-weight:600;color:#fff;margin-bottom:16px;line-height:1.2}
        .portal-subtitle{font-size:1rem;color:rgba(255,255,255,0.8);margin-bottom:32px;line-height:1.6}
        .portal-subtitle strong{color:#A67C52}
        .input-group{display:flex;flex-direction:column;gap:12px;margin-bottom:16px}
        .portal-input{width:100%;padding:16px 20px;font-family:'Inter',sans-serif;font-size:1.1rem;background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.2);border-radius:12px;outline:none;color:#fff;transition:all 0.25s;text-align:center;letter-spacing:0.05em}
        .portal-input:focus{border-color:#A67C52;background:rgba(255,255,255,0.18);box-shadow:0 0 0 4px rgba(166,124,82,0.15)}
        .portal-input::placeholder{color:rgba(255,255,255,0.4)}
        .portal-btn{width:100%;padding:16px 24px;background:linear-gradient(135deg,#A67C52,#8B6340);color:#fff;font-family:'Inter',sans-serif;font-size:0.8rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;border:none;border-radius:12px;cursor:pointer;transition:all 0.25s;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 32px -8px rgba(166,124,82,0.5)}
        .portal-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 40px -8px rgba(166,124,82,0.7)}
        .portal-btn:disabled{opacity:0.5;cursor:not-allowed}
        .portal-message{padding:14px 18px;border-radius:10px;font-size:0.85rem;margin-bottom:16px;animation:fadeIn 0.3s ease}
        .portal-message.error{background:rgba(229,62,62,0.15);color:#fc8181;border:1px solid rgba(229,62,62,0.3)}
        .portal-message.success{background:rgba(5,150,105,0.15);color:#68d391;border:1px solid rgba(5,150,105,0.3)}
        .portal-footer{margin-top:32px;display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
        .portal-footer a{color:rgba(255,255,255,0.6);text-decoration:none;font-size:0.8rem;transition:color 0.2s}
        .portal-footer a:hover{color:#A67C52}
        .portal-footer span{color:rgba(255,255,255,0.3)}
        .spinner{width:18px;height:18px;border:2.5px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.6s linear infinite;display:inline-block}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:480px){.portal-title{font-size:1.8rem}.portal-logo-text{font-size:1.5rem}.portal-input{padding:14px 16px;font-size:1rem}}
      `}</style>
      <div className="portal-page">
        <div className="portal-bg"/>
        <div className="portal-overlay"/>
        <div className="portal-content">
          <div className="portal-logo">
            <div className="portal-logo-dot"/>
            <span className="portal-logo-text">Rest Point</span>
          </div>
          <h1 className="portal-title">Family Memorial Portal</h1>
          <p className="portal-subtitle">
            Enter the <strong>phone number</strong> registered with the funeral home to access your loved one's memorial, documents, and billing.
          </p>
          {message.text && (
            <div className={`portal-message ${message.type}`}>
              {message.type === 'error' ? '⚠️ ' : '✓ '}{message.text}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input type="tel" className="portal-input" placeholder="07XX XXX XXX" value={phoneNumber} onChange={handlePhoneChange} disabled={isLoading} required autoFocus/>
            </div>
            <button type="submit" className="portal-btn" disabled={isLoading}>
              {isLoading ? <><div className="spinner"/> Searching...</> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg> Access Memorial</>}
            </button>
          </form>
          <div className="portal-footer">
            <a href="/">← Back to Rest Point</a>
            <span>•</span>
            <a href="mailto:info@restpoint.co.ke">Support</a>
            <span>•</span>
            <a href="/login">Staff Login</a>
          </div>
        </div>
      </div>
    </>
  );
}

export default PortalLoginPage;