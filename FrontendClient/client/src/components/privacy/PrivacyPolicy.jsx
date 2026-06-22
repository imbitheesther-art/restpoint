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
          Privacy Policy
        </h1>
        <p style={{ color: C.char500, fontSize: '0.85rem', marginBottom: '2rem' }}>
          Last updated: June 2026
        </p>

        {/* Summary */}
        <div style={{ 
          background: 'rgba(166,124,82,0.06)', 
          border: `1px solid rgba(166,124,82,0.2)`, 
          borderRadius: '10px', 
          padding: '1.25rem', 
          marginBottom: '2rem' 
        }}>
          <p style={{ color: C.char700, fontSize: '0.95rem', margin: 0 }}>
            <strong>In short:</strong> We keep your data safe, we never sell it, we don't profile users, 
            and you're always in control. Questions? Email{' '}
            <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold, fontWeight: 500 }}>
              privacy@restpoint.co.ke
            </a>
          </p>
        </div>

        {/* What we collect */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          What We Collect
        </h2>
        <p style={{ color: C.char700, marginBottom: '1rem' }}>
          We collect only what's needed to run the platform:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          <li><strong>Funeral home staff:</strong> Name, email, phone, and login credentials (encrypted)</li>
          <li><strong>Families we serve:</strong> Names, dates of birth/death, family contacts, and ID documents — provided by your funeral home</li>
          <li><strong>Technical data:</strong> Basic usage and device information to improve the platform</li>
        </ul>

        {/* No profiling */}
        <div style={{ 
          background: '#ECFDF5', 
          border: '1px solid #059669', 
          borderRadius: '8px', 
          padding: '1rem', 
          marginBottom: '1.5rem' 
        }}>
          <p style={{ color: C.char700, margin: 0 }}>
            <strong>We do not do data profiling.</strong> We don't analyze, segment, or build profiles 
            of our users or the families we serve. Data is used only to operate the platform.
          </p>
        </div>

        {/* How we use data */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          How We Use Your Data
        </h2>
        <p style={{ color: C.char700, marginBottom: '1rem' }}>
          We use your information only to:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          <li>Provide and improve the platform</li>
          <li>Support funeral homes and families</li>
          <li>Keep data secure</li>
          <li>Meet legal requirements</li>
        </ul>
        <p style={{ color: C.char700, marginBottom: '1.5rem' }}>
          We <strong>never</strong> use your data for advertising, marketing, or any purpose outside 
          of running the platform.
        </p>

        {/* Data sharing */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          Who We Share Data With
        </h2>
        <p style={{ color: C.char700, marginBottom: '1rem' }}>
          We keep your data private. We only share it with:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          <li><strong>Your funeral home</strong> — they control their data</li>
          <li><strong>Secure hosting providers</strong> — who protect your data</li>
          <li><strong>Legal authorities</strong> — only if required by Kenyan law</li>
        </ul>
        <p style={{ color: C.char700, marginBottom: '1.5rem' }}>
          We <strong>never</strong> sell your data to anyone.
        </p>

        {/* Data backup */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          Your Data Backup
        </h2>
        <p style={{ color: C.char700, marginBottom: '1rem' }}>
          Every document, permit, invoice, and report is automatically backed up to your organization's 
          Google Drive. You own this backup — it remains accessible even if you leave Rest Point.
        </p>

        {/* Data retention */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          How Long We Keep Data
        </h2>
        <p style={{ color: C.char700, marginBottom: '1rem' }}>
          We keep your data as long as your funeral home uses Rest Point. If you request deletion:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          <li>We provide a final copy of all data before deletion</li>
          <li>We delete your data from our systems within 30–60 days</li>
          <li>Your Google Drive backup remains intact — you keep that copy</li>
          <li>Once deleted from our systems, data cannot be recovered</li>
        </ul>

        {/* Your rights */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          Your Rights
        </h2>
        <p style={{ color: C.char700, marginBottom: '1rem' }}>
          You can access, correct, export, or request deletion of your data anytime. 
          Email us at{' '}
          <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>
            privacy@restpoint.co.ke
          </a>
        </p>

        {/* Security */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          How We Keep Data Safe
        </h2>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          <li>End-to-end encryption for all data</li>
          <li>Role-based access control</li>
          <li>Audit trails for all data access</li>
          <li>Automatic session timeouts</li>
          <li>Regular security monitoring</li>
        </ul>

        {/* Questions */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          Questions?
        </h2>
        <div style={{ 
          background: C.navy900, 
          color: '#fff', 
          padding: '1.5rem', 
          borderRadius: '10px',
          marginTop: '1rem'
        }}>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            Contact our privacy team:
          </p>
          <p style={{ margin: '0.5rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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