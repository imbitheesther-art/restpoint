import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

const C = {
  ink: '#111214',
  bone: '#F9F8F5',
  bone2: '#F0EDE5',
  brass: '#8B7355',
  vg: '#3D4F47',
  vgDk: '#263530',
  vgLt: '#526E63',
  line: '#DDD8CC',
  gray: '#706D66',
  grayLt: '#A09D96',
  red: '#9B4A3F',
  redBg: '#FBF0ED',
  redLn: '#E8D2CC',
  green: '#475A43',
  greenBg: '#EEF3EC',
  white: '#FFFFFF',
  ff: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  fm: "'JetBrains Mono','SF Mono',monospace",
};

const Spin = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'sp .55s linear infinite', flexShrink: 0 }}>
    <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2" />
    <path d="M8 2a6 6 0 016 6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Alert = ({ type, text }) => {
  if (!text) return null;
  const m = { error: { bg: C.redBg, c: C.red, b: C.redLn }, success: { bg: C.greenBg, c: C.green, b: '#D5DFD2' } }[type]
    || { bg: C.redBg, c: C.red, b: C.redLn };
  return (
    <div role="alert" aria-live="polite" style={{
      background: m.bg, color: m.c, border: `1px solid ${m.b}`,
      padding: '.75rem 1rem', borderRadius: 8, fontSize: '.82rem',
      fontWeight: 500, lineHeight: 1.5, marginBottom: '1.4rem',
      animation: 'fu .2s ease both',
    }}>{text}</div>
  );
};

export default function PortalLoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ t: '', x: '' });
  const [imgErr, setImgErr] = useState(false);

  const fmt = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  };
  const raw = (s) => s.replace(/\D/g, '');
  const ok = (s) => raw(s).length >= 10;

  const onChange = useCallback((e) => {
    setPhone(fmt(e.target.value));
    if (msg.x) setMsg({ t: '', x: '' });
  }, [msg.x]);

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!ok(phone)) { setMsg({ t: 'error', x: 'Enter a valid 10-digit phone number.' }); return; }
    setLoading(true);
    setMsg({ t: '', x: '' });
    try {
      const d = await authApi.portalLogin({ phone: raw(phone) });
      if (d?.success) {
        localStorage.setItem('sessionToken', d.sessionToken || d.session_token);
        localStorage.setItem('tenantSlug', d.tenantSlug);
        if (d.deceased?.deceased_id) localStorage.setItem('deceasedId', d.deceased.deceased_id);
        setMsg({ t: 'success', x: 'Access link sent — redirecting…' });
        setTimeout(() => navigate('/portal/dashboard'), 1400);
      } else {
        setMsg({ t: 'error', x: d?.message || 'Identity could not be verified.' });
      }
    } catch {
      setMsg({ t: 'error', x: 'Connection error — check your network and try again.' });
    } finally { setLoading(false); }
  }, [phone, navigate]);

  const canGo = !loading && ok(phone);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes sp{to{transform:rotate(360deg)}}
        @keyframes fu{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ri{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes li{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${C.bone};-webkit-font-smoothing:antialiased}
        .fi::placeholder{color:${C.grayLt};opacity:.5}
        .fi:focus{border-color:${C.brass}!important;background:#fff!important;box-shadow:0 0 0 3px rgba(139,115,85,.08)!important}
        .sb:not(:disabled):hover{background:${C.vgDk}!important;box-shadow:0 8px 24px -4px rgba(38,53,48,.3)}
        .sb:not(:disabled):active{transform:scale(.99);box-shadow:none}

        .layout{display:flex;min-height:100dvh}
        .panel-l{width:46%;background:${C.vgDk};display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:3rem 2.5rem}
        .panel-r{flex:1;background:${C.bone};display:flex;align-items:center;justify-content:center;padding:3rem 2.5rem;position:relative}

        @media(max-width:860px){
          .layout{flex-direction:column}
          .panel-l{width:100%;min-height:auto;padding:2.5rem 2rem 2rem}
          .panel-r{padding:2rem 1.5rem 3rem}
        }
      `}</style>

      <div className="layout" style={{ fontFamily: C.ff }}>

        {/* ════════ LEFT PANEL ════════ */}
        <div className="panel-l">
          {/* background shape — large soft circle */}
          <div style={{
            position: 'absolute', width: 520, height: 520, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.04)',
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', width: 360, height: 360, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.03)',
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            pointerEvents: 'none',
          }} />
          {/* subtle glow behind logo */}
          <div style={{
            position: 'absolute', width: 280, height: 180,
            background: 'radial-gradient(ellipse, rgba(82,110,99,.2) 0%, transparent 70%)',
            top: '42%', left: '50%', transform: 'translate(-50%,-50%)',
            pointerEvents: 'none',
          }} />

          {/* logo */}
          <div style={{ position: 'relative', zIndex: 1, animation: 'li .6s .1s cubic-bezier(.16,1,.3,1) both' }}>
            {!imgErr ? (
              <img
                src="/familyportal.png"
                alt="Rest Point"
                onError={() => setImgErr(true)}
                style={{
                  maxWidth: 360, width: '100%', height: 'auto', display: 'block',
                  objectFit: 'contain',
                  filter: 'brightness(1.1) drop-shadow(0 12px 32px rgba(0,0,0,.4))',
                }}
              />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path d="M18 3L5 10v8c0 8.3 5.7 16.1 13 18 7.3-1.9 13-9.7 13-18v-8L18 3z" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.3)" strokeWidth="1.2" />
                  <path d="M13 18l4 4 6-6" stroke="rgba(255,255,255,.45)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>

          {/* brand line */}
          <div style={{
            position: 'relative', zIndex: 1, marginTop: '2.5rem',
            display: 'flex', alignItems: 'center', gap: '1rem',
            animation: 'li .6s .2s cubic-bezier(.16,1,.3,1) both',
          }}>
            <div style={{ width: 32, height: '1px', background: 'rgba(255,255,255,.12)' }} />
            <span style={{
              fontSize: '.62rem', fontFamily: C.fm, letterSpacing: '.2em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', fontWeight: 500,
            }}>Family Portal</span>
            <div style={{ width: 32, height: '1px', background: 'rgba(255,255,255,.12)' }} />
          </div>

          {/* bottom descriptor — only on desktop */}
          <p style={{
            position: 'absolute', bottom: '2.5rem', left: '2.5rem', right: '2.5rem',
            fontSize: '.78rem', color: 'rgba(255,255,255,.2)', lineHeight: 1.65,
            textAlign: 'center', zIndex: 1,
            display: 'block',
          }} className="desktop-only">
            A private space for families to honor,<br />remember, and manage arrangements.
          </p>
        </div>

        {/* ════════ RIGHT PANEL ════════ */}
        <div className="panel-r">
          <div style={{
            width: '100%', maxWidth: 380,
            animation: 'ri .55s .15s cubic-bezier(.16,1,.3,1) both',
          }}>
            {/* heading */}
            <div style={{ marginBottom: '2.2rem' }}>
              <h1 style={{
                fontSize: '1.65rem', fontWeight: 800, color: C.ink,
                letterSpacing: '-.035em', lineHeight: 1.2, marginBottom: '.6rem',
              }}>
                Welcome back
              </h1>
              <p style={{ fontSize: '.88rem', color: C.gray, lineHeight: 1.6 }}>
                Enter your phone number to receive a secure sign-in link.
              </p>
            </div>

            <form onSubmit={onSubmit} noValidate>
              <Alert type={msg.t} text={msg.x} />

              {/* phone field */}
              <div style={{ marginBottom: '2rem' }}>
                <label htmlFor="p" style={{
                  display: 'block', fontSize: '.67rem', fontFamily: C.fm,
                  letterSpacing: '.12em', textTransform: 'uppercase',
                  color: C.brass, marginBottom: '.5rem', fontWeight: 500,
                }}>
                  Phone number
                </label>
                <input
                  id="p" type="tel" inputMode="numeric"
                  value={phone} onChange={onChange}
                  placeholder="0712 345 678"
                  disabled={loading} autoFocus autoComplete="tel"
                  className="fi"
                  style={{
                    width: '100%', padding: '.95rem 1.1rem', fontSize: '1.05rem',
                    fontFamily: C.ff, border: `1.5px solid ${C.line}`, borderRadius: 10,
                    background: C.bone2, color: C.ink,
                    transition: 'all .2s cubic-bezier(.16,1,.3,1)',
                    outline: 'none', fontWeight: 500, letterSpacing: '.03em',
                  }}
                />
              </div>

              {/* button */}
              <button
                type="submit" disabled={!canGo} className="sb"
                style={{
                  width: '100%', padding: '.95rem', fontSize: '.9rem',
                  fontWeight: 600, fontFamily: C.ff, border: 'none', borderRadius: 10,
                  background: canGo ? C.vg : 'rgba(61,79,71,.25)',
                  color: C.white, cursor: canGo ? 'pointer' : 'not-allowed',
                  transition: 'all .15s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '.5rem', minHeight: 50, opacity: canGo ? 1 : .5,
                  letterSpacing: '.01em',
                }}
              >
                {loading && <Spin />}
                <span>{loading ? 'Verifying…' : 'Continue'}</span>
              </button>
            </form>

            {/* trust */}
            <div style={{
              marginTop: '2.2rem', paddingTop: '1.4rem',
              borderTop: `1px solid ${C.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.45rem',
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="4" width="10" height="7" rx="1.5" fill={C.greenBg} stroke={C.green} strokeWidth=".7" />
                <path d="M3 4V2.5a3 3 0 016 0V4" stroke={C.green} strokeWidth=".7" strokeLinecap="round" />
                <circle cx="6" cy="7.5" r="1" fill={C.green} />
              </svg>
              <span style={{ fontSize: '.68rem', color: C.grayLt, letterSpacing: '.01em' }}>
                End-to-end encrypted
              </span>
            </div>

            {/* help */}
            <p style={{
              textAlign: 'center', fontSize: '.72rem', color: C.grayLt,
              marginTop: '1.4rem', lineHeight: 1.6, opacity: .7,
            }}>
              Need help? Contact your funeral director.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}