import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

const C = { navy900: '#0A1F3D', navy800: '#0F2847', gold: '#A67C52', goldD: '#8B6340', emerald: '#059669' };

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
    if (!r || r.length<10) { setMsg({type:'error',text:'Enter a valid 10-digit phone number'}); setLoading(false); return; }
    try {
      const data = await authApi.portalLogin({ phone: r });
      if (data?.success) {
        localStorage.setItem('sessionToken', data.sessionToken||data.session_token);
        localStorage.setItem('tenantSlug', data.tenantSlug);
        localStorage.setItem('deceasedId', data.deceased?.deceased_id);
        navigate('/portal/dashboard');
      } else setMsg({type:'error',text:data?.message||'Login failed'});
    } catch(e) { setMsg({type:'error',text:'Connection error. Try again.'}); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:`linear-gradient(135deg, rgba(10,31,61,.85) 0%, rgba(15,40,71,.75) 100%), url('/familyportal.png') center/cover no-repeat fixed`,
      fontFamily:"'Inter',sans-serif", position:'relative', overflow:'hidden'
    }}>
      {/* Animated particles overlay */}
      <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
        {[...Array(8)].map((_,i)=>(
          <div key={i} style={{
            position:'absolute', width:'4px', height:'4px', borderRadius:'50%',
            background:'rgba(166,124,82,.4)', left:`${10+Math.random()*80}%`,
            animation:`float ${6+Math.random()*8}s ${Math.random()*5}s infinite ease-in-out`,
            opacity:0.4+Math.random()*0.4
          }} />
        ))}
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
        @keyframes float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-30px) scale(1.1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{opacity:.6}50%{opacity:1}}
        .card{animation:fadeUp 0.8s ease both;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
      `}</style>

      <div className="card" style={{
        background:'rgba(255,255,255,.08)', backdropFilter:'blur(20px)',
        borderRadius:20, border:'1px solid rgba(255,255,255,.15)',
        padding:'2.5rem 2rem', width:'100%', maxWidth:400, margin:'1rem',
        boxShadow:'0 24px 80px rgba(0,0,0,.3)'
      }}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{
            width:56, height:56, borderRadius:16,
            background:'linear-gradient(135deg,#0A1F3D,#152D4A)',
            display:'flex',alignItems:'center',justifyContent:'center',
            margin:'0 auto 16px', border:'1px solid rgba(166,124,82,.3)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="1.5" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',fontWeight:600,color:'#fff',margin:0,letterSpacing:'-.02em'}}>Rest Point</h1>
          <p style={{fontSize:'.8rem',color:'rgba(255,255,255,.7)',marginTop:6}}>Family Portal — stay connected with loved ones</p>
        </div>

        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:20}}>
          <div>
            <label style={{display:'block',fontSize:'.72rem',fontWeight:600,color:'rgba(255,255,255,.8)',marginBottom:8,letterSpacing:'.05em'}}>
              Phone Number
            </label>
            <input type="tel" value={phone} onChange={e=>setPhone(fmt(e.target.value))}
              placeholder="0712 345 678" disabled={loading}
              style={{
                width:'100%',padding:'14px 18px',fontSize:'1rem',
                border:'1.5px solid rgba(255,255,255,.2)',borderRadius:12,
                outline:'none',fontFamily:"'Inter',sans-serif",
                color:'#fff',background:'rgba(255,255,255,.08)',
                transition:'all .25s',boxSizing:'border-box',letterSpacing:'.05em'
              }}
              onFocus={e=>{e.target.style.borderColor=C.gold;e.target.style.background='rgba(255,255,255,.12)';e.target.style.boxShadow='0 0 0 3px rgba(166,124,82,.15)'}}
              onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,.2)';e.target.style.background='rgba(255,255,255,.08)';e.target.style.boxShadow='none'}}
            />
          </div>

          {msg.text && (
            <div style={{
              padding:'12px 16px',borderRadius:10,fontSize:'.8rem',fontWeight:500,
              background:msg.type==='error'?'rgba(220,38,38,.15)':'rgba(5,150,105,.15)',
              color:msg.type==='error'?'#FCA5A5':'#6EE7B7',
              border:msg.type==='error'?'1px solid rgba(220,38,38,.3)':'1px solid rgba(5,150,105,.3)',
              animation:'fadeUp .3s ease'
            }}>{msg.text}</div>
          )}

          <button type="submit" disabled={loading}
            style={{
              width:'100%',padding:'15px 24px',fontSize:'.75rem',fontWeight:700,
              letterSpacing:'.08em',textTransform:'uppercase',
              border:'none',borderRadius:12,
              cursor:loading?'not-allowed':'pointer',
              background:loading?'rgba(255,255,255,.15)':'linear-gradient(135deg,#A67C52,#C9A876)',
              color:'#fff',fontFamily:"'Inter',sans-serif",
              transition:'all .25s',
              boxShadow:loading?'none':'0 4px 20px -4px rgba(166,124,82,.4)',
            }}
            onMouseEnter={e=>{if(!loading){e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 8px 28px -4px rgba(166,124,82,.5)'}}}
            onMouseLeave={e=>{e.target.style.transform='none';if(!loading)e.target.style.boxShadow='0 4px 20px -4px rgba(166,124,82,.4)'}}
          >
            {loading ? 'Sending link...' : 'Access Family Portal'}
          </button>

          <p style={{textAlign:'center',fontSize:'.7rem',color:'rgba(255,255,255,.5)',marginTop:4,lineHeight:1.6}}>
            Enter the phone number registered with your funeral home.<br/>A secure link will be sent to access your family's information.
          </p>
        </form>

        <div style={{marginTop:24,paddingTop:20,borderTop:'1px solid rgba(255,255,255,.1)',textAlign:'center'}}>
          <p style={{fontSize:'.65rem',color:'rgba(255,255,255,.4)',lineHeight:1.6,margin:0}}>
            By continuing, you agree to our{' '}
            <a href="/privacy" style={{color:C.gold,textDecoration:'none',fontWeight:500}}>Privacy Policy</a>
            {' '}and{' '}
            <a href="/terms" style={{color:C.gold,textDecoration:'none',fontWeight:500}}>Terms</a>
          </p>
        </div>
      </div>
    </div>
  );
}