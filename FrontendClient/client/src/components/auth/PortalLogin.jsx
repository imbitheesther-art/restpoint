import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

/* ============================================================
   FAMILY PORTAL — Sign in
   This is the first screen a grieving family member sees,
   often within hours, often at night, on a phone. Direction:
   quiet, warm, low-friction. No glass-blur chrome, no particles,
   no shouting CTAs. Calm enough to hold someone's attention
   without asking anything of them but a phone number.
   ============================================================ */

const C = {
  wash: '#221C18',       // warm charcoal overlay, not navy
  washSoft: '#352B24',
  card: '#FAF7F2',        // warm paper, not glass
  cardLine: '#E8E0D3',
  ink: '#2B2520',
  inkSoft: '#5C5246',
  sage: '#6F8068',         // muted, calm accent — replaces gold/brass
  sageDeep: '#566153',
  sageTint: '#EEF1EC',
};

export default function PortalLoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fmt = v => { const d = v.replace(/\D/g,''); if(d.length<=3)return d; if(d.length<=6)return `${d.slice(0,3)} ${d.slice(3)}`; return `${d.slice(0,3)} ${d.slice(3,6)} ${d.slice(6,10)}`; };
  const raw = () => phone.replace(/\D/g,'');

  const submit = async e => {
    e.preventDefault(); setLoading(true); setMsg({type:'',text:''});
    const r = raw();
    if (!r || r.length<10) { setMsg({type:'error',text:'Please check the phone number and try again.'}); setLoading(false); return; }
    try {
      const data = await authApi.portalLogin({ phone: r });
      if (data?.success) {
        localStorage.setItem('sessionToken', data.sessionToken||data.session_token);
        localStorage.setItem('tenantSlug', data.tenantSlug);
        localStorage.setItem('deceasedId', data.deceased?.deceased_id);
        navigate('/portal/dashboard');
      } else setMsg({type:'error',text:data?.message||'We could not find that number. Please check it and try again.'});
    } catch(e) { setMsg({type:'error',text:'We could not connect just now. Please try again in a moment.'}); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:`linear-gradient(160deg, rgba(34,28,24,.88) 0%, rgba(53,43,36,.8) 100%), url('/familyportal.png') center/cover no-repeat fixed`,
      fontFamily:"'Source Sans 3',sans-serif", position:'relative', padding:'1.5rem'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600&family=Lora:ital,wght@0,500;0,600;1,500&display=swap');
        @keyframes settle{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fp-card{animation:settle 0.9s cubic-bezier(0.16,1,0.3,1) both}
        .fp-input::placeholder{color:${C.inkSoft};opacity:.55}
      `}</style>

      <div className="fp-card" style={{
        background:C.card, borderRadius:14, border:`1px solid ${C.cardLine}`,
        padding:'2.6rem 2.2rem', width:'100%', maxWidth:404,
        boxShadow:'0 30px 70px -20px rgba(0,0,0,.45)'
      }}>
        <div style={{textAlign:'center', marginBottom:30}}>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" style={{margin:'0 auto 14px', display:'block'}}>
            <circle cx="17" cy="17" r="15.5" stroke={C.sage} strokeWidth="1" />
            <path d="M17 9V25M9 17H25" stroke={C.sage} strokeWidth="1" />
            <circle cx="17" cy="17" r="2.2" fill={C.sage} />
          </svg>
          <h1 style={{fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:'1.4rem',fontWeight:500,color:C.ink,margin:0,letterSpacing:'-.01em'}}>
            Rest Point
          </h1>
          <p style={{fontSize:'.86rem',color:C.inkSoft,marginTop:8,lineHeight:1.5}}>
            A private place to follow your family's arrangements
          </p>
        </div>

        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:18}}>
          <div>
            <label style={{display:'block',fontSize:'.78rem',fontWeight:500,color:C.inkSoft,marginBottom:8}}>
              Phone number
            </label>
            <input
              type="tel" value={phone} onChange={e=>setPhone(fmt(e.target.value))}
              placeholder="0712 345 678" disabled={loading}
              className="fp-input"
              style={{
                width:'100%',padding:'13px 16px',fontSize:'1rem',
                border:`1.5px solid ${C.cardLine}`,borderRadius:10,
                outline:'none',fontFamily:"'Source Sans 3',sans-serif",
                color:C.ink,background:'#fff',
                transition:'border-color .2s, box-shadow .2s',boxSizing:'border-box',letterSpacing:'.03em'
              }}
              onFocus={e=>{e.target.style.borderColor=C.sage;e.target.style.boxShadow=`0 0 0 3px ${C.sageTint}`}}
              onBlur={e=>{e.target.style.borderColor=C.cardLine;e.target.style.boxShadow='none'}}
            />
            <p style={{fontSize:'.78rem',color:C.inkSoft,marginTop:8,lineHeight:1.55}}>
              Use the number your funeral home has on file. We'll send a private link — no password to remember.
            </p>
          </div>

          {msg.text && (
            <div style={{
              padding:'11px 14px',borderRadius:8,fontSize:'.82rem',
              background:msg.type==='error'?'#FBEEEC':'#EEF3EC',
              color:msg.type==='error'?'#8C4A3D':'#475A43',
              border:msg.type==='error'?'1px solid #F0D9D4':'1px solid #DCE6D9',
            }}>{msg.text}</div>
          )}

          <button type="submit" disabled={loading}
            style={{
              width:'100%',padding:'14px 22px',fontSize:'.92rem',fontWeight:500,
              border:'none',borderRadius:10,
              cursor:loading?'default':'pointer',
              background:loading?C.cardLine:C.sage,
              color:loading?C.inkSoft:'#fff',fontFamily:"'Source Sans 3',sans-serif",
              transition:'background .2s',
            }}
            onMouseEnter={e=>{if(!loading)e.target.style.background=C.sageDeep}}
            onMouseLeave={e=>{if(!loading)e.target.style.background=C.sage}}
          >
            {loading ? 'Sending your link…' : 'Send me my private link'}
          </button>
        </form>

        <div style={{marginTop:24,paddingTop:18,borderTop:`1px solid ${C.cardLine}`,textAlign:'center'}}>
          <p style={{fontSize:'.74rem',color:C.inkSoft,lineHeight:1.6,margin:0}}>
            If you have any trouble, your funeral home can help you directly.<br/>
            <a href="/privacy" style={{color:C.sageDeep,textDecoration:'none',fontWeight:500}}>Privacy</a>
            {'  ·  '}
            <a href="/terms" style={{color:C.sageDeep,textDecoration:'none',fontWeight:500}}>Terms</a>
          </p>
        </div>
      </div>
    </div>
  );
}