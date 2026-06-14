import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

/* ═══════════════════════════════════════════════════════════════
   REST POINT — Portal Login (Family Portal)
   White background · Clean · Minimal
   Detects tenant from phone number (next of kin lookup)
   ═══════════════════════════════════════════════════════════════ */

function PortalLoginPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Format phone number as XXX XXX XXX
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
      setMessage({
        type: 'error',
        text: 'Please enter a valid 10-digit phone number'
      });
      setIsLoading(false);
      return;
    }

    try {
      // Call the portal login API - it will:
      // 1. Find deceased with next of kin matching this phone
      // 2. Return the tenant slug for that deceased
      // 3. Return session token and deceased info
      const data = await authApi.portalLogin({
        phone: rawDigits
      });

      if (data && data.success) {
        // Store session data
        localStorage.setItem('sessionToken', data.sessionToken || data.session_token);
        localStorage.setItem('tenantSlug', data.tenantSlug);
        localStorage.setItem('deceasedId', data.deceased?.deceased_id);
        
        if (data.deceased) {
          localStorage.setItem('deceased', JSON.stringify(data.deceased));
        }

        setMessage({ type: 'success', text: 'Welcome. Redirecting...' });

        // Redirect to the correct tenant's portal
        setTimeout(() => {
          navigate(`/portal/${data.tenantSlug}/dashboard`);
        }, 1500);

      } else {
        setMessage({
          type: 'error',
          text: data?.message || 'Phone number not found. Please check and try again.'
        });
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Portal login error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Unable to connect. Please check your phone number.'
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(135deg, #0A1F3D 0%, #0F2847 100%);
        }

        /* Navy background matching landing page */
        .portal {
          position: relative;
          width: 100%;
          height: 100vh;
          background: linear-gradient(135deg, #0A1F3D 0%, #0F2847 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Content Container */
        .content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 420px;
          padding: 0 24px;
        }

        /* Logo Section */
        .logo {
          margin-bottom: 48px;
          text-align: center;
        }

        .logo-icon {
          width: 64px;
          height: 64px;
          background: rgba(4, 200, 0, 0.08);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          border: 1px solid rgba(4, 200, 0, 0.15);
        }

        .logo-icon svg {
          width: 30px;
          height: 30px;
          color: #04c800;
        }

        .logo h1 {
          font-size: 28px;
          font-weight: 700;
          color: #111;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }

        .logo p {
          font-size: 14px;
          color: #666;
        }

        /* Form */
        .form-group {
          margin-bottom: 20px;
        }

        .input-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #444;
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }

        .input-field {
          width: 100%;
          padding: 14px 18px;
          font-size: 15px;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 10px;
          outline: none;
          transition: all 0.2s;
          color: #333;
        }

        .input-field:focus {
          background: #ffffff;
          border-color: #04c800;
          box-shadow: 0 0 0 3px rgba(4, 200, 0, 0.1);
        }

        .input-field::placeholder {
          color: #aaa;
        }

        /* Button */
        .btn {
          width: 100%;
          padding: 14px 18px;
          background: #04c800;
          color: white;
          font-size: 15px;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 10px;
        }

        .btn:hover:not(:disabled) {
          background: #03b300;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(4, 200, 0, 0.25);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Message */
        .message {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .message.error {
          background: rgba(229, 62, 62, 0.08);
          color: #e74c3c;
          border: 1px solid rgba(229, 62, 62, 0.2);
        }

        .message.success {
          background: rgba(4, 200, 0, 0.08);
          color: #04c800;
          border: 1px solid rgba(4, 200, 0, 0.2);
        }

        /* Info */
        .info {
          background: rgba(4, 200, 0, 0.04);
          border: 1px solid rgba(4, 200, 0, 0.1);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 12px;
          color: #666;
          margin-bottom: 20px;
          text-align: center;
        }

        .info strong {
          color: #04c800;
        }

        /* Footer */
        .footer {
          margin-top: 40px;
          text-align: center;
        }

        .footer a {
          color: #888;
          text-decoration: none;
          font-size: 13px;
          transition: color 0.2s;
        }

        .footer a:hover {
          color: #04c800;
        }

        .footer span {
          color: #ddd;
          margin: 0 8px;
        }

        /* Spinner */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .content {
            padding: 0 20px;
          }
          
          .logo h1 {
            font-size: 24px;
          }
          
          .logo-icon {
            width: 56px;
            height: 56px;
          }
          
          .input-field, .btn {
            padding: 12px 16px;
          }
        }
      `}</style>

      <div className="portal">
        <div className="content">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <h1>Rest Point</h1>
            <p>Family Memorial Portal</p>
          </div>

          <div className="info">
            Enter the <strong>phone number</strong> of the next of kin registered with the funeral home. We'll locate your loved one's records automatically.
          </div>

          {message.text && (
            <div className={`message ${message.type}`}>
              <span>{message.type === 'error' ? '⚠️' : '✓'}</span>
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="input-label">Next of Kin Phone Number</label>
              <input
                type="tel"
                className="input-field"
                placeholder="07XX XXX XXX"
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={isLoading}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Searching...</span>
                </>
              ) : (
                'Access Memorial'
              )}
            </button>
          </form>

          <div className="footer">
            <a href="/support">Need help?</a>
            <span>•</span>
            <a href="mailto:info@restpoint.co.ke">info@restpoint.co.ke</a>
            <span>•</span>
            <a href="/">Rest Point home</a>
          </div>
        </div>
      </div>
    </>
  );
}

export default PortalLoginPage;