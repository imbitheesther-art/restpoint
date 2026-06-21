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

        {/* Simple Summary Box */}
        <div style={{ 
          background: 'rgba(166,124,82,0.06)', 
          border: `1px solid rgba(166,124,82,0.2)`, 
          borderRadius: '10px', 
          padding: '1.25rem', 
          marginBottom: '2rem' 
        }}>
          <p style={{ color: C.char700, fontSize: '0.9rem', margin: 0 }}>
            <strong>Simple version:</strong> These are the basic rules for using Rest Point. 
            By using our platform, you agree to follow them. We keep things fair and clear.
          </p>
        </div>

        {/* Section 1 */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          1. Agreement
        </h2>
        <p style={{ color: C.char700 }}>
          By using Rest Point, you agree to these terms. If you don't agree, please don't use 
          the platform. These terms are between you (the funeral home) and Rest Point, built 
          and maintained by <strong>Welt Tallis Technologies</strong>.
        </p>

        {/* Section 2 */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          2. What We Offer
        </h2>
        <p style={{ color: C.char700 }}>
          Rest Point helps funeral homes manage their work efficiently. Features include:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>Case management</li>
          <li>Family portal for families to stay informed</li>
          <li>Document generation</li>
          <li>Billing and payments</li>
          <li>Marketplace for funeral services</li>
          <li>Memorial services management</li>
        </ul>
        <p style={{ color: C.char700, marginTop: '0.5rem' }}>
          We're always improving. Updates will be announced in advance.
        </p>

        {/* Section 3 */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          3. Your Account
        </h2>
        <p style={{ color: C.char700 }}>
          When you sign up, you agree to:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>Provide accurate information</li>
          <li>Keep your login details safe</li>
          <li>Tell us immediately if someone accesses your account without permission</li>
        </ul>
        <p style={{ color: C.char700 }}>
          You're responsible for everything that happens under your account.
        </p>

        {/* Section 4 */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          4. Your Data is Safe
        </h2>
        <p style={{ color: C.char700 }}>
          We take data protection seriously:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>We <strong>never</strong> sell your data</li>
          <li>We <strong>never</strong> share your data with others</li>
          <li>We <strong>never</strong> change or manipulate your data</li>
          <li>All data is encrypted and secure</li>
          <li>You can access, correct, or delete your data anytime</li>
        </ul>
        <p style={{ color: C.char700 }}>
          For more details, see our <a href="/privacy" style={{ color: C.gold }}>Privacy Policy</a>.
        </p>

        {/* Section 5 */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          5. Deleting Your Data
        </h2>
        <p style={{ color: C.char700 }}>
          We only delete data when you ask us to in writing. The process takes up to 2 months 
          because we want to be absolutely sure and keep your data safe.
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>You can request your data anytime</li>
          <li>You can correct your data anytime</li>
          <li>You can get your data in a portable format</li>
          <li>We'll give you a final copy before deletion</li>
        </ul>

        {/* Section 6 */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          6. Pricing
        </h2>
        <div style={{ 
          background: '#fff', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          border: `1px solid ${C.char200}`,
          marginBottom: '1rem'
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
        <p style={{ color: C.char700 }}>
          Payments are due monthly with a 5-day grace period. Late payments may result in 
          suspension. Reactivation fee: KES 1,000.
        </p>

        {/* Section 7 */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          7. Rules of Use
        </h2>
        <p style={{ color: C.char700 }}>
          Please don't use the platform for:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>Illegal activities</li>
          <li>Uploading harmful code or viruses</li>
          <li>Sharing your account with others</li>
          <li>Using data for anything other than funeral home management</li>
        </ul>
        <p style={{ color: C.char700, background: '#FEF3E8', padding: '0.75rem', borderRadius: '6px' }}>
          <strong>Important:</strong> Breaking these rules may lead to account termination 
          without a refund.
        </p>

        {/* Section 8 */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          8. Our Responsibility
        </h2>
        <p style={{ color: C.char700 }}>
          We do our best to keep the platform running smoothly. However:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>We're not responsible for data loss caused by customer error</li>
          <li>We're not responsible for issues with third-party services</li>
          <li>Our total liability is limited to fees paid in the last 12 months</li>
        </ul>

        {/* Section 9 */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          9. Your Responsibility
        </h2>
        <p style={{ color: C.char700 }}>
          You agree to be responsible for:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>How you use the platform</li>
          <li>Following these terms</li>
          <li>Complying with all applicable laws</li>
          <li>Proper handling of family and deceased data</li>
        </ul>

        {/* Section 10 */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          10. Cancellation
        </h2>
        <p style={{ color: C.char700 }}>
          You can cancel your account anytime with 30 days written notice. We may cancel 
          immediately if you break these terms. After cancellation:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>Your access is removed</li>
          <li>Your data deletion process begins</li>
          <li>You get a final copy of your data</li>
        </ul>

        {/* Section 11 */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          11. Legal Matters
        </h2>
        <p style={{ color: C.char700 }}>
          These terms follow the laws of Kenya. Any disputes will be resolved through 
          arbitration in Nairobi, Kenya.
        </p>

        {/* Section 12 */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          12. Updates to Terms
        </h2>
        <p style={{ color: C.char700 }}>
          We may update these terms occasionally. If we make important changes, we'll 
          let you know by email or when you log in. Continued use means you accept the 
          updated terms.
        </p>

        {/* Section 13 */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          13. Contact Us
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