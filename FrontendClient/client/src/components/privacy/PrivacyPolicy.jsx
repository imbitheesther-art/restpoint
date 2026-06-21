import React from 'react';
import { useNavigate } from 'react-router-dom';

const C = { 
  navy900: '#0A1F3D', 
  gold: '#A67C52', 
  emerald: '#059669', 
  char700: '#374151', 
  char600: '#4B5563', 
  char500: '#6B7280', 
  char200: '#E5E7EB', 
  char100: '#F3F4F6', 
  navy50: '#F9FAFB' 
};

// SVG Icons
const Icons = {
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Lock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ),
  Eye: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.emerald} strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.char600} strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  File: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.char600} strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.char600} strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.char600} strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.char600} strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Mail: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Server: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
      <line x1="6" y1="6" x2="6" y2="6.01"/>
      <line x1="6" y1="18" x2="6" y2="18.01"/>
    </svg>
  ),
  Key: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2">
      <circle cx="8" cy="16" r="3"/>
      <path d="M12 12l2 2 4-4 2 2-4 4-2-2"/>
      <path d="M15 9l2-2 2 2"/>
    </svg>
  ),
  Alert: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
};

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.navy50, minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');`}</style>
      
      {/* Navigation */}
      <nav style={{ 
        padding: '1rem 2rem', 
        borderBottom: `1px solid ${C.char200}`, 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        background: '#fff'
      }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            background: C.navy900, 
            color: '#fff', 
            border: 'none', 
            padding: '0.5rem 1rem', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            letterSpacing: '0.1em', 
            textTransform: 'uppercase' 
          }}
        >
          ← Back
        </button>
        <span style={{ fontFamily: "'Lora', serif", fontWeight: 600, color: C.navy900, fontSize: '1.1rem' }}>
          Rest Point — Privacy Policy
        </span>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem', lineHeight: 1.8 }}>
        
        {/* Header */}
        <h1 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '2rem', marginBottom: '0.5rem' }}>
          Your Privacy Matters to Us
        </h1>
        <p style={{ color: C.char500, fontSize: '0.85rem', marginBottom: '2rem' }}>
          Last updated: June 2026
        </p>

        {/* Simple Summary Box */}
        <div style={{ 
          background: 'rgba(166,124,82,0.06)', 
          border: `1px solid rgba(166,124,82,0.2)`, 
          borderRadius: '10px', 
          padding: '1.25rem', 
          marginBottom: '2rem' 
        }}>
          <p style={{ color: C.char700, fontSize: '0.95rem', margin: 0 }}>
            <strong>In simple terms:</strong> We keep your data safe, we never sell it, 
            and you're always in control. If you have questions, email us at{' '}
            <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold, fontWeight: 500 }}>
              privacy@restpoint.co.ke
            </a>
          </p>
        </div>

        {/* Section 1: What This Means For You */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '10px', 
          padding: '1.5rem', 
          marginBottom: '2rem',
          border: `1px solid ${C.char200}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ 
            fontFamily: "'Lora', serif", 
            color: C.navy900, 
            fontSize: '1.2rem', 
            marginTop: 0,
            marginBottom: '0.75rem'
          }}>
            What This Means For You
          </h2>
          <ul style={{ color: C.char700, paddingLeft: '1.5rem', margin: 0, listStyle: 'none' }}>
            <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span><Icons.Shield /></span>
              <span><strong>Your data is yours</strong> — We never sell or share it</span>
            </li>
            <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span><Icons.User /></span>
              <span><strong>You're in control</strong> — Access, correct, or delete anytime</span>
            </li>
            <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span><Icons.Lock /></span>
              <span><strong>We keep it safe</strong> — Strong encryption and security</span>
            </li>
            <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span><Icons.Eye /></span>
              <span><strong>We're transparent</strong> — Always clear about how we use data</span>
            </li>
          </ul>
        </div>

        {/* Section 2: What Information We Collect */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          1. What Information We Collect
        </h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: C.navy900, marginBottom: '0.25rem' }}>
            For Funeral Home Staff:
          </h3>
          <p style={{ color: C.char700, marginTop: 0 }}>
            Your name, email address, phone number, and login details (securely encrypted)
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: C.navy900, marginBottom: '0.25rem' }}>
            For Families We Serve:
          </h3>
          <p style={{ color: C.char700, marginTop: 0 }}>
            Names, dates of birth and death, family contacts, and identification documents — 
            all provided by your funeral home
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: C.navy900, marginBottom: '0.25rem' }}>
            Technical Information:
          </h3>
          <p style={{ color: C.char700, marginTop: 0 }}>
            Basic information like how you use our platform and device details — this helps us 
            improve your experience
          </p>
        </div>

        {/* Section 3: How We Use Your Information */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          2. How We Use Your Information
        </h2>
        <p style={{ color: C.char700 }}>
          We use your information only to:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>Provide and improve our platform</li>
          <li>Support you and your funeral home</li>
          <li>Keep your data secure</li>
          <li>Follow legal requirements</li>
        </ul>
        <p style={{ 
          color: '#B45309', 
          background: '#FEF3E8', 
          padding: '0.75rem', 
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <span><Icons.Alert /></span>
          <span><strong>Important:</strong> We <strong>never</strong> use your data for advertising, 
          selling, or any purpose other than running the platform.</span>
        </p>

        {/* Section 4: Who We Share With */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          3. Who We Share Your Data With
        </h2>
        <p style={{ color: C.char700 }}>
          We keep your data private. We only share it with:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li><strong>Your funeral home</strong> — they control your data</li>
          <li><strong>Our secure hosting providers</strong> — who keep your data safe</li>
          <li><strong>Legal authorities</strong> — only if required by Kenyan law</li>
        </ul>
        <p style={{ 
          color: '#065F46', 
          background: '#ECFDF5', 
          padding: '0.75rem', 
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <span><Icons.Check /></span>
          <span><strong>Good to know:</strong> We <strong>never</strong> sell your data to anyone. 
          Period.</span>
        </p>

        {/* Section 5: How We Keep Data Safe */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          4. How We Keep Your Data Safe
        </h2>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem', listStyle: 'none' }}>
          <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span><Icons.Lock /></span>
            <span><strong>Encryption:</strong> All data is encrypted so only authorized people can read it</span>
          </li>
          <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span><Icons.Key /></span>
            <span><strong>Access Control:</strong> Only people who need access can see your data</span>
          </li>
          <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span><Icons.File /></span>
            <span><strong>Audit Trails:</strong> We track who accesses data and when</span>
          </li>
          <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span><Icons.Clock /></span>
            <span><strong>Automatic Logout:</strong> Your session times out for safety</span>
          </li>
          <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span><Icons.Shield /></span>
            <span><strong>Regular Security Checks:</strong> We constantly monitor for threats</span>
          </li>
        </ul>

        {/* Section 6: How Long We Keep Data */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          5. How Long We Keep Your Data
        </h2>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>We keep your data as long as your funeral home uses our platform</li>
          <li>If your funeral home requests deletion, we remove everything within <strong>30-60 days</strong></li>
          <li>We give your funeral home a final copy of all data before deletion</li>
          <li>Once deleted, data cannot be recovered</li>
        </ul>

        {/* Section 7: Your Rights */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          6. Your Rights
        </h2>
        <p style={{ color: C.char700 }}>You have the right to:</p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '0.75rem',
          margin: '1rem 0'
        }}>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: `1px solid ${C.char200}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Icons.File />
              <strong>Access</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: C.char600, margin: 0 }}>See what data we have about you</p>
          </div>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: `1px solid ${C.char200}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Icons.User />
              <strong>Correct</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: C.char600, margin: 0 }}>Fix any incorrect information</p>
          </div>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: `1px solid ${C.char200}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Icons.Trash />
              <strong>Delete</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: C.char600, margin: 0 }}>Request permanent deletion of your data</p>
          </div>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: `1px solid ${C.char200}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Icons.Download />
              <strong>Export</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: C.char600, margin: 0 }}>Get a copy of your data to take with you</p>
          </div>
        </div>
        <p style={{ color: C.char700 }}>
          To exercise these rights, email us at{' '}
          <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>privacy@restpoint.co.ke</a>
        </p>

        {/* Section 8: Cookies */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          7. Cookies
        </h2>
        <p style={{ color: C.char700 }}>
          Cookies help us remember your login and make the platform work smoothly. 
          We only use essential and functional cookies — no tracking for advertising.
        </p>

        {/* Section 9: Updates */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          8. Updates to This Policy
        </h2>
        <p style={{ color: C.char700 }}>
          We may update this policy from time to time. If we make important changes, 
          we'll let you know by email or when you log in.
        </p>

        {/* Section 10: Questions */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          9. Questions?
        </h2>
        <div style={{ 
          background: C.navy900, 
          color: '#fff', 
          padding: '1.5rem', 
          borderRadius: '10px',
          marginTop: '1rem'
        }}>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            We're here to help! Contact our privacy team:
          </p>
          <p style={{ margin: '0.5rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icons.Mail />
            <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold, textDecoration: 'none' }}>
              privacy@restpoint.co.ke
            </a>
          </p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
            We typically respond within 2 business days
          </p>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '3rem', 
          paddingTop: '1.5rem', 
          borderTop: `1px solid ${C.char200}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <span style={{ fontSize: '0.8rem', color: C.char500 }}>
            © 2026 Rest Point. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="/terms" style={{ color: C.char500, fontSize: '0.8rem', textDecoration: 'none' }}>
              Terms of Service
            </a>
            <a href="/contact" style={{ color: C.char500, fontSize: '0.8rem', textDecoration: 'none' }}>
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}