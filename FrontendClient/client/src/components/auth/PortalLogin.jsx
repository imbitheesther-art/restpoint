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
        navigate('/portal/dashboard');
      } else {
        setMessage({ type: 'error', text: data?.message || 'Login failed. Check your phone number.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Unable to connect. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F9FAFB',
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        border: '1px solid #E5E7EB',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: 400,
        margin: '1rem',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#0A1F3D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 2px 8px rgba(10,31,61,0.15)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 600, color: '#0A1F3D', margin: 0, letterSpacing: '-0.02em' }}>Rest Point</h1>
          <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: 6, fontWeight: 400 }}>Family Portal — Track case progress, view documents, and communicate</p>
        </div>

        {/* Phone Input */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="0712 345 678"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1rem',
                border: '1.5px solid #D1D5DB',
                borderRadius: 10,
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                color: '#111827',
                background: '#F9FAFB',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#A67C52'; e.target.style.boxShadow = '0 0 0 3px rgba(166,124,82,0.1)'; e.target.style.background = '#fff'; }}
              onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F9FAFB'; }}
            />
          </div>

          {message.text && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 500,
              background: message.type === 'error' ? '#FEF2F2' : '#F0FDF4',
              color: message.type === 'error' ? '#DC2626' : '#16A34A',
              border: message.type === 'error' ? '1px solid #FECACA' : '1px solid #BBF7D0',
            }}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              border: 'none',
              borderRadius: 10,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              background: isLoading ? '#9CA3AF' : '#0A1F3D',
              color: '#fff',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s',
              boxShadow: isLoading ? 'none' : '0 4px 12px -4px rgba(10,31,61,0.3)',
            }}
            onMouseEnter={(e) => { if (!isLoading) { e.target.style.background = '#0F2847'; e.target.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={(e) => { e.target.style.background = isLoading ? '#9CA3AF' : '#0A1F3D'; e.target.style.transform = 'none'; }}
          >
            {isLoading ? 'Sending...' : 'Access Family Portal'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF', marginTop: 8, lineHeight: 1.5 }}>
            Enter the phone number you registered with your funeral home. An SMS link will be sent to access your family's information.
          </p>
        </form>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', color: '#9CA3AF', lineHeight: 1.5, margin: 0 }}>
            By continuing, you agree to our{' '}
            <a href="/privacy" style={{ color: '#A67C52', textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</a>
            {' '}and{' '}
            <a href="/terms" style={{ color: '#A67C52', textDecoration: 'none', fontWeight: 500 }}>Terms of Service</a>.
            Your data is encrypted and protected.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PortalLoginPage;