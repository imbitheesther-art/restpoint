import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

/* ============================================================
   FAMILY PORTAL — Sign in (Bank App Style)
   Image on top, card centered below like mobile banking apps
   ============================================================ */

const C = {
  primary: '#1a1a2e',
  secondary: '#c9a84c',
  secondaryLight: '#e8d5a3',
  secondaryDark: '#a8883a',
  background: '#f7f5f0',
  cardBg: '#ffffff',
  textPrimary: '#1a1a2e',
  textSecondary: '#4a4a5a',
  textMuted: '#8a8a9a',
  border: '#e8e4de',
  shadow: 'rgba(26, 26, 46, 0.10)',
};

export default function PortalLoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fmt = v => { 
    const d = v.replace(/\D/g,''); 
    if(d.length<=3) return d; 
    if(d.length<=6) return `${d.slice(0,3)} ${d.slice(3)}`; 
    return `${d.slice(0,3)} ${d.slice(3,6)} ${d.slice(6,10)}`; 
  };
  const raw = () => phone.replace(/\D/g,'');

  const submit = async e => {
    e.preventDefault(); 
    setLoading(true); 
    setMsg({type:'',text:''});
    
    const r = raw();
    if (!r || r.length<10) { 
      setMsg({ type:'error', text:'Please enter a valid phone number.' }); 
      setLoading(false); 
      return; 
    }
    
    try {
      const data = await authApi.portalLogin({ phone: r });
      if (data?.success) {
        localStorage.setItem('sessionToken', data.sessionToken||data.session_token);
        localStorage.setItem('tenantSlug', data.tenantSlug);
        localStorage.setItem('deceasedId', data.deceased?.deceased_id);
        navigate('/portal/dashboard');
      } else {
        setMsg({ type:'error', text:data?.message || 'Number not found. Please try again.' });
      }
    } catch(e) { 
      setMsg({ type:'error', text:'Unable to connect. Please try again.' }); 
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: C.background,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .hero-image {
          width: 100%;
          height: 45vh;
          min-height: 280px;
          max-height: 420px;
          object-fit: cover;
          object-position: center 30%;
          display: block;
          background: #e8e4de;
        }
        
        .card-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 20px 32px;
          margin-top: -20px;
          border-radius: 24px 24px 0 0;
          background: C.background;
        }
        
        .login-card {
          width: 100%;
          max-width: 400px;
          background: C.cardBg;
          border-radius: 20px;
          padding: 32px 28px;
          box-shadow: 0 8px 40px C.shadow;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .input-field {
          width: 100%;
          padding: 14px 16px;
          font-size: 16px;
          font-family: "'Inter', sans-serif";
          border: 2px solid C.border;
          border-radius: 12px;
          background: #fafaf8;
          color: C.textPrimary;
          transition: all 0.2s ease;
          box-sizing: border-box;
          -webkit-appearance: none;
        }
        
        .input-field:focus {
          border-color: C.secondary;
          box-shadow: 0 0 0 4px rgba(201, 168, 76, 0.12);
          outline: none;
          background: #ffffff;
        }
        
        .input-field::placeholder {
          color: C.textMuted;
          opacity: 0.6;
        }
        
        .submit-btn {
          width: 100%;
          padding: 16px;
          font-size: 15px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          background: C.secondary;
          color: #ffffff;
          font-family: "'Inter', sans-serif";
          transition: all 0.2s ease;
          position: relative;
        }
        
        .submit-btn:hover:not(:disabled) {
          background: C.secondaryDark;
          transform: translateY(-1px);
        }
        
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        
        .spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (min-width: 768px) {
          .hero-image {
            height: 50vh;
            max-height: 500px;
          }
          
          .login-card {
            padding: 40px 36px;
          }
        }
      `}</style>

      {/* Hero Image - Top Section */}
      <img
        src="/landing.png"
        alt="Family Portal"
        className="hero-image"
        onError={(e) => { 
          e.target.src = "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80"; 
        }}
      />

      {/* Card Section - Bottom */}
      <div className="card-container">
        <div className="login-card">
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '8px',
            }}>
              <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
                <circle cx="17" cy="17" r="15.5" stroke={C.secondary} strokeWidth="1.2" />
                <path d="M17 9V25M9 17H25" stroke={C.secondary} strokeWidth="1.2" />
                <circle cx="17" cy="17" r="2.5" fill={C.secondary} />
              </svg>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '20px',
                fontWeight: 700,
                color: C.primary,
                letterSpacing: '-0.5px',
              }}>
                Rest Point
              </span>
            </div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: C.textPrimary,
              margin: '6px 0 4px',
            }}>
              Family Portal
            </h2>
            <p style={{
              fontSize: '14px',
              color: C.textSecondary,
              margin: 0,
              lineHeight: 1.5,
            }}>
              Access your family's arrangements
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: C.textPrimary,
                marginBottom: '6px',
              }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(fmt(e.target.value))}
                placeholder="0712 345 678"
                disabled={loading}
                className="input-field"
              />
              <p style={{
                fontSize: '12px',
                color: C.textMuted,
                marginTop: '8px',
                lineHeight: 1.4,
              }}>
                Enter the phone number registered with the funeral home.
              </p>
            </div>

            {msg.text && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                background: msg.type === 'error' ? '#fdf0ef' : '#eef6ef',
                color: msg.type === 'error' ? '#9e2a2b' : '#2d6a4f',
                border: `1px solid ${msg.type === 'error' ? '#f5d6d6' : '#d4e6d6'}`,
              }}>
                {msg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span className="spinner" />
                  Sending your link...
                </span>
              ) : (
                'Send me my private link'
              )}
            </button>

            <div style={{
              marginTop: '4px',
              paddingTop: '16px',
              borderTop: `1px solid ${C.border}`,
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '12px',
                color: C.textMuted,
                margin: '0 0 8px',
              }}>
                Need help? Contact your funeral home.
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
              }}>
                <a href="/privacy" style={{
                  fontSize: '12px',
                  color: C.textMuted,
                  textDecoration: 'none',
                  fontWeight: 500,
                }}>
                  Privacy
                </a>
                <span style={{ color: C.border }}>|</span>
                <a href="/terms" style={{
                  fontSize: '12px',
                  color: C.textMuted,
                  textDecoration: 'none',
                  fontWeight: 500,
                }}>
                  Terms
                </a>
                <span style={{ color: C.border }}>|</span>
                <a href="/contact" style={{
                  fontSize: '12px',
                  color: C.textMuted,
                  textDecoration: 'none',
                  fontWeight: 500,
                }}>
                  Contact
                </a>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '11px',
            color: C.textMuted,
            letterSpacing: '0.3px',
          }}>
            🔒 Secured by Rest Point
          </div>
        </div>
      </div>

    </div>
  );
}