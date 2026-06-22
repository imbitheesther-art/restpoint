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

export default function TermsOfService() {
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
          Rest Point — Terms of Service
        </span>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem', lineHeight: 1.8 }}>
        
        {/* Header */}
        <h1 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '2rem', marginBottom: '0.5rem' }}>
          Terms of Service
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
            <strong>In short:</strong> These are the rules for using Rest Point. By using our platform, 
            you agree to follow them. We keep things fair and transparent.
          </p>
        </div>

        {/* Agreement */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          Agreement
        </h2>
        <p style={{ color: C.char700, marginBottom: '1.5rem' }}>
          Payments are due monthly with a one-month grace period. Late payments may result in 
          suspension. Reactivation fee: KES 1,000.
        </p>

        {/* What we offer */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          What We Offer
        </h2>
        <p style={{ color: C.char700, marginBottom: '1rem' }}>
          Rest Point helps funeral homes manage their work efficiently:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          <li>Case management</li>
          <li>Family portal for families to stay informed</li>
          <li>Document generation</li>
          <li>Billing and payments</li>
          <li>Marketplace for funeral services</li>
          <li>Memorial services management</li>
        </ul>

        {/* Your account */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          Your Account
        </h2>
        <p style={{ color: C.char700, marginBottom: '1rem' }}>
          When you sign up, you agree to:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          <li>Provide accurate information</li>
          <li>Keep your login details safe</li>
          <li>Tell us immediately if someone accesses your account without permission</li>
        </ul>
        <p style={{ color: C.char700, marginBottom: '1.5rem' }}>
          You're responsible for everything that happens under your account.
        </p>

        {/* Data protection */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          Data Protection
        </h2>
        <p style={{ color: C.char700, marginBottom: '1rem' }}>
          We take data protection seriously. We never sell, share, or manipulate your data. 
          All data is encrypted and secure. You can access, correct, or delete your data anytime.
        </p>
        <p style={{ color: C.char700, marginBottom: '1.5rem' }}>
          For more details, see our <a href="/privacy" style={{ color: C.gold }}>Privacy Policy</a>.
        </p>

        {/* Pricing */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          Pricing
        </h2>
        <div style={{ 
          background: '#fff', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          border: `1px solid ${C.char200}`,
          marginBottom: '1.5rem'
        }}>
          <p style={{ margin: 0, color: C.char700 }}>
            <strong>Setup Fee:</strong> KES 1,000 (one-time)
          </p>
          <p style={{ margin: '0.5rem 0', color: C.char700 }}>
            <strong>Monthly Subscription:</strong>
          </p>
          <ul style={{ color: C.char700, paddingLeft: '1.5rem', margin: 0 }}>
            <li>KES 9,500 for single-tenant</li>
            <li>KES 18,500 for multi-tenant</li>
          </ul>
        </div>
        <p style={{ color: C.char700, marginBottom: '1.5rem' }}>
          Payments are due monthly with a 10-day grace period. Late payments may result in 
          suspension. Reactivation fee: KES 1,000.
        </p>
        
        {/* Payment Methods */}
        <div style={{ 
          background: C.navy900, 
          color: '#fff', 
          padding: '1.5rem', 
          borderRadius: '10px',
          marginTop: '1.5rem'
        }}>
          <h3 style={{ fontFamily: "'Lora', serif", color: '#fff', fontSize: '1.1rem', marginTop: 0, marginBottom: '1rem' }}>
            How to Pay
          </h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', lineHeight: 1.7 }}>
            <strong style={{ color: C.gold }}>Payments (Kenya):</strong><br />
            M-Pesa Till Number: <strong style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem' }}>5570316</strong>
          </p>
          <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.7 }}>
            <strong style={{ color: C.gold }}>Payments (Outside Kenya):</strong><br />
            Bank details will be provided via email upon registration.
          </p>
        </div>

        {/* Rules */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          Rules of Use
        </h2>
        <p style={{ color: C.char700, marginBottom: '1rem' }}>
          Please don't use the platform for:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          <li>Illegal activities</li>
          <li>Uploading harmful code or viruses</li>
          <li>Sharing your account with others</li>
          <li>Using data for anything other than funeral home management</li>
        </ul>
        <p style={{ color: C.char700, marginBottom: '1.5rem' }}>
          <strong>Important:</strong> Breaking these rules may lead to account termination without a refund.
        </p>

        {/* Cancellation */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          Cancellation
        </h2>
        <p style={{ color: C.char700, marginBottom: '1.5rem' }}>
          You can cancel your account anytime with 30 days written notice. We may cancel 
          immediately if you break these terms. After cancellation, your access is removed 
          and the data deletion process begins.
        </p>

        {/* Legal */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          Legal Matters
        </h2>
        <p style={{ color: C.char700, marginBottom: '1.5rem' }}>
          These terms follow the laws of Kenya. Any disputes will be resolved through 
          arbitration in Nairobi, Kenya.
        </p>

        {/* Updates */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          Updates to Terms
        </h2>
        <p style={{ color: C.char700, marginBottom: '1.5rem' }}>
          We may update these terms occasionally. If we make important changes, we'll 
          let you know by email or when you log in. Continued use means you accept the 
          updated terms.
        </p>

        {/* Contact */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          Contact Us
        </h2>
        <div style={{ 
          background: C.navy900, 
          color: '#fff', 
          padding: '1.5rem', 
          borderRadius: '10px',
          marginTop: '1rem'
        }}>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            Questions about these terms?
          </p>
          <p style={{ margin: '0.5rem 0 0 0' }}>
            Email us at{' '}
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
            <a href="/privacy" style={{ color: C.char500, fontSize: '0.8rem', textDecoration: 'none' }}>
              Privacy Policy
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