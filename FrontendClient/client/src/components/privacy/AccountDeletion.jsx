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

export default function AccountDeletion() {
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
          Rest Point — Account Deletion
        </span>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem', lineHeight: 1.8 }}>
        
        {/* Header */}
        <h1 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '2rem', marginBottom: '0.5rem' }}>
          Account Deletion Policy
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
            <strong>Simple version:</strong> You can delete your account anytime. We take 
            up to 2 months to complete the process because we want to be absolutely sure 
            and keep your data safe. We'll give you a copy of everything before we delete it.
          </p>
        </div>

        {/* Pricing Box */}
        <div style={{ 
          background: 'rgba(5,150,105,0.06)', 
          border: `1px solid rgba(5,150,105,0.2)`, 
          borderRadius: '10px', 
          padding: '1.25rem', 
          marginBottom: '2rem' 
        }}>
          <p style={{ color: C.emerald, fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
            Deletion Costs
          </p>
          <ul style={{ color: C.char700, paddingLeft: '1.5rem', margin: 0 }}>
            <li><strong>Setup fee:</strong> KES 1,000 (one-time)</li>
            <li><strong>Processing fee:</strong> KES 2,500 (covers verification and data export)</li>
            <li><strong>Total:</strong> KES 3,500 (one-time payment)</li>
          </ul>
        </div>

        {/* Section 1: Your Data Is Yours */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          1. Your Data Stays Yours
        </h2>
        <p style={{ color: C.char700 }}>
          We believe your data belongs to you. We:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li><strong>Never sell</strong> your data</li>
          <li><strong>Never share</strong> your data with others</li>
          <li><strong>Never change</strong> or manipulate your data</li>
          <li>Only delete it when <strong>you ask us to</strong></li>
        </ul>

        {/* Section 2: How to Request Deletion */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          2. How to Request Deletion
        </h2>
        <p style={{ color: C.char700 }}>
          To delete your account:
        </p>
        <ol style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>Email us at <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>privacy@restpoint.co.ke</a></li>
          <li>Use the email address registered with your account</li>
          <li>Tell us you want to delete your account</li>
          <li>We'll verify your identity to make sure it's really you</li>
        </ol>

        {/* Section 3: Timeline */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          3. How Long It Takes
        </h2>
        <p style={{ color: C.char700 }}>
          We take up to <strong>2 months</strong> to complete the deletion process. This 
          is intentional — we want to:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>Make sure you really want to delete your data</li>
          <li>Give you time to change your mind</li>
          <li>Ensure everything is done correctly and safely</li>
        </ul>
        <p style={{ color: C.char700 }}>
          Here's the timeline:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li><strong>Within 7 days:</strong> We give you a complete copy of your data</li>
          <li><strong>Within 30-60 days:</strong> We delete your data from our systems</li>
          <li><strong>Within 90 days:</strong> We delete your data from backups</li>
        </ul>

        {/* Section 4: Data Export */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          4. Getting Your Data First
        </h2>
        <p style={{ color: C.char700 }}>
          Before we delete anything, we give you a complete copy of your data:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>All deceased records</li>
          <li>All documents</li>
          <li>Billing history</li>
          <li>Account settings</li>
        </ul>
        <p style={{ color: C.char700 }}>
          We'll send you a secure download link. You have <strong>14 days</strong> to download 
          your data before it expires.
        </p>

        {/* Section 5: Your Rights */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          5. Your Rights
        </h2>
        <p style={{ color: C.char700 }}>
          You have the right to:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li><strong>Access:</strong> See all the data we have about you</li>
          <li><strong>Correct:</strong> Fix any wrong information</li>
          <li><strong>Delete:</strong> Permanently remove your data</li>
          <li><strong>Export:</strong> Get a copy of your data in a portable format</li>
        </ul>
        <p style={{ color: C.char700 }}>
          To exercise these rights, email{' '}
          <a href="mailto:privacy@restpoint.co.ke" style={{ color: C.gold }}>privacy@restpoint.co.ke</a>
        </p>

        {/* Section 6: Once Deleted, It's Gone */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          6. Once Deleted, It's Gone
        </h2>
        <p style={{ color: C.char700 }}>
          After the deletion process is complete:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li>Data <strong>cannot be recovered</strong></li>
          <li>We keep <strong>no copies</strong></li>
          <li>New accounts start with an <strong>empty database</strong></li>
        </ul>
        <p style={{ color: C.char700, background: '#FEF3E8', padding: '0.75rem', borderRadius: '6px' }}>
          <strong>Important:</strong> Download your data before confirming deletion. 
          Once it's gone, it's gone forever.
        </p>

        {/* Section 7: Your Backups */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          7. Your Data is Also Backed Up
        </h2>
        <p style={{ color: C.char700 }}>
          We automatically back up your data to:
        </p>
        <ul style={{ color: C.char700, paddingLeft: '1.5rem' }}>
          <li><strong>Your Google Drive</strong> — automatically synced</li>
          <li><strong>Your NAS device</strong> — physical storage on your network</li>
          <li><strong>Our secure servers</strong> — redundant cloud storage</li>
        </ul>
        <p style={{ color: C.char700 }}>
          This means your data stays safe even if something happens to our servers.
        </p>

        {/* Section 8: Questions? */}
        <h2 style={{ fontFamily: "'Lora', serif", color: C.navy900, fontSize: '1.2rem', marginTop: '2rem' }}>
          8. Questions?
        </h2>
        <div style={{ 
          background: C.navy900, 
          color: '#fff', 
          padding: '1.5rem', 
          borderRadius: '10px',
          marginTop: '1rem'
        }}>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            Have questions about deleting your account?
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
            <a href="/terms" style={{ color: C.char500, fontSize: '0.8rem', textDecoration: 'none' }}>
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}