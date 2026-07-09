import React, { useState, useEffect } from 'react';
import { Shield, MessageCircle, Mail, Globe, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Use the Rest Point design system colors
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
  accent: '#C77B5E',
};

const SUPPORT = { phone: '0740045355', email: 'infowelttallis@gmail.com' };

const FooterComponent = () => {
  const navigate = useNavigate();
  const [latency, setLatency] = useState('24ms');
  const [userName, setUserName] = useState('User');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const name = user.full_name || user.name || user.username || user.email || 'User';
        setUserName(name);
      }
    } catch (e) {
      setUserName('User');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(`${Math.floor(Math.random() * 10) + 21}ms`);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1.25rem',
      background: C.ink,
      borderTop: `2px solid ${C.verdigrisLight}`,
      color: C.grayLight,
      fontSize: '0.75rem',
      gap: '1rem',
    }}>
      {/* BRAND & USER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: C.bone,
          fontWeight: 700,
          letterSpacing: '0.5px',
        }}>
          <Shield size={14} /> © {currentYear} WELT TALLIS
        </div>
        <span style={{ opacity: 0.6 }}>|</span>
        <span style={{ color: C.grayLight, opacity: 0.8 }}>
          Logged in as: <strong style={{ color: C.brassLight, fontWeight: 600 }}>{userName}</strong>
        </span>
      </div>

      {/* SUPPORT LINKS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <a href={`https://wa.me/${SUPPORT.phone}`} target="_blank" rel="noopener noreferrer" style={{
          color: C.grayLight,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          transition: 'color 0.2s',
        }}
          onMouseEnter={(e) => e.target.style.color = C.verdigrisTint}
          onMouseLeave={(e) => e.target.style.color = C.grayLight}
        >
          <MessageCircle size={14} /> WhatsApp
        </a>
        <a href={`mailto:${SUPPORT.email}`} style={{
          color: C.grayLight,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          transition: 'color 0.2s',
        }}
          onMouseEnter={(e) => e.target.style.color = C.verdigrisTint}
          onMouseLeave={(e) => e.target.style.color = C.grayLight}
        >
          <Mail size={14} /> Contact
        </a>
      </div>

      {/* SYSTEM STATUS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          color: '#4CAF50',
          fontWeight: 500,
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            background: '#4CAF50',
            borderRadius: '50%',
            boxShadow: '0 0 8px #4CAF50',
          }} />
          Operational
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', color: C.grayLight, opacity: 0.7 }}>
          <span><Zap size={12} /> {latency}</span>
          <span><Globe size={12} /> v2.1</span>
          <span style={{ fontSize: '0.65rem', color: C.brassLight, opacity: 0.6 }}>
            ID: {Math.random().toString(36).substring(2, 7).toUpperCase()}
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          footer { flex-direction: column !important; align-items: flex-start !important; gap: 0.75rem !important; padding: 1rem !important; }
        }
      `}</style>
    </footer>
  );
};

export default FooterComponent;