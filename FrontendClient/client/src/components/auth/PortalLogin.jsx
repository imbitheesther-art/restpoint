import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

/* ============================================================
   FAMILY PORTAL — Sign in
   ============================================================ */

const C = {
  wash: '#221C18',
  card: '#FAF7F2',
  cardLine: '#E8E0D3',
  ink: '#2B2520',
  inkSoft: '#5C5246',
  sage: '#6F8068',
  sageDeep: '#566153',
  sageTint: '#EEF1EC',
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
    e.preventDefault(); setLoading(true); setMsg({type:'',text:''});
    const r = raw();
    if (!r || r.length<10) { 
      setMsg({type:'error',text:'Please check the phone number and try again.'}); 
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
        setMsg({type:'error',text:data?.message||'We could not find that number. Please check it and try again.'});
      }
    } catch(e) { 
      setMsg({type:'error',text:'We could not connect just now. Please try again in a moment.'}); 
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', background:C.wash, 
      fontFamily:"'Source Sans 3',sans-serif", position:'relative'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600&family=Lora:ital,wght@0,500;0,600;1,500&display=swap');
        @keyframes settle{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        
        .fp-photo{animation:fadeIn 1s ease both}
        .fp-card{animation:settle 0.8s cubic-bezier(0.16,1,0.3,1) .15s both}
        .fp-input::placeholder{color:${C.inkSoft};opacity:.55}
        
        /* Master Grid Layout */
        .portal-grid {
          display: grid;
          grid-template-columns: 1fr;
          width: 100%;
        }

        .fp-photo-wrap {
          position:relative; width:100%; height:38vh; min-height:220px; max-height:340px;
          overflow:hidden; background: #352B24;
        }
        .fp-photo-wrap img {
          width:100%; height:100%; object-fit:cover; object-position:center 30%;
          display:block;
        }

        /* Large Screen Split-View Breakpoint Override */
        @media (min-width: 960px) {
          .portal-grid {
            grid-template-columns: 1fr 1fr;
          }
          .fp-photo-wrap {
            height: 100vh;
            max-height: none;
            position: sticky;
            top: 0;
          }
          .card-space-adjust {
            margin-top: 0 !important;
            padding: 2.5rem 2rem !important;
          }
        }
      `}</style>

      <div className="portal-grid">
        
        {/* Left Side (Desktop) / Top Section (Mobile) */}
        <div className="fp-photo-wrap fp-photo">
          <img
            src="/landing.png"
            alt="Family Portal Landscape"
            onError={(e) => { 
              e.target.src = "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80"; 
            }}
          />
        </div>

        {/* Right Side (Desktop) / Bottom Section (Mobile) */}
        <div style={{
          display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'
        }}>
          <div className="card-space-adjust" style={{
            flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
            alignItems:'center', padding:'0 1.25rem 2.5rem', marginTop:-28, width:'100%', boxSizing:'border-box'
          }}>
            <div className="fp-card" style={{
              background:C.card,
              borderRadius:'24px',
              border:`1px solid ${C.cardLine}`,
              padding:'2.5rem 2.2rem',
              width:'100%', maxWidth:420,
              boxShadow:'0 24px 60px -18px rgba(0,0,0,.35)',
              position:'relative',
              boxSizing:'border-box'
            }}>
              
              <div style={{textAlign:'center', marginBottom:28}}>
                <svg width="30" height="30" viewBox="0 0 34 34" fill="none" style={{margin:'0 auto 12px', display:'block'}}>
                  <circle cx="17" cy="17" r="15.5" stroke={C.sage} strokeWidth="1" />
                  <path d="M17 9V25M9 17H25" stroke={C.sage} strokeWidth="1" />
                  <circle cx="17" cy="17" r="2.2" fill={C.sage} />
                </svg>
                <h1 style={{fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:'1.35rem',fontWeight:500,color:C.ink,margin:0,letterSpacing:'-.01em'}}>
                  Rest Point
                </h1>
                <p style={{fontSize:'.85rem',color:C.inkSoft,marginTop:7,lineHeight:1.5}}>
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

              <div style={{marginTop:22,paddingTop:18,borderTop:`1px solid ${C.cardLine}`,textAlign:'center'}}>
                <p style={{fontSize:'.74rem',color:C.inkSoft,lineHeight:1.6,margin:0}}>
                  If you have any trouble, your funeral home can help you directly.<br/>
                  <a href="/privacy" style={{color:C.sageDeep,textDecoration:'none',fontWeight:500}}>Privacy</a>
                  {'   ·   '}
                  <a href="/terms" style={{color:C.sageDeep,textDecoration:'none',fontWeight:500}}>Terms</a>
                </p>
              </div>
            </div>
          </div>

          {/* Footer view */}
          <footer style={{
            textAlign: 'center', padding: '0 1.5rem 2rem',
            color: 'rgba(255,255,255,0.35)', fontSize: '.74rem', width:'100%', boxSizing:'border-box'
          }}>
            <div style={{ maxWidth: '420px', margin: '0 auto' }}>
              <p>&copy; 2026 Rest Point. All rights reserved.</p>
              <p style={{ marginTop: '.35rem' }}>
                <a href="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginRight: '.8rem' }}>Privacy</a>
                <a href="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginRight: '.8rem' }}>Terms</a>
                <a href="/contact" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Contact</a>
              </p>
            </div>
          </footer>

        </div>

      </div>
    </div>
  );
}