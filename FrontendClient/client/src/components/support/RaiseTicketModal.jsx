import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Send, Bug, Lightbulb, HelpCircle } from 'lucide-react';
import api from '../../api/axios';

/* ============================================================
   REST POINT — Raise Support Ticket
   Styled to match LandingPage: ink / bone / brass / verdigris
   Submits ticket then navigates to TicketPage for real-time tracking
   ============================================================ */

const C = {
  ink: '#15171A',
  bone: '#FAF8F4',
  bone2: '#F3EFE6',
  brass: '#8B7355',
  brassLight: '#A98F6E',
  verdigris: '#3D4F47',
  line: '#E3DDD0',
  gray: '#6B6862',
};

const ticketTypes = [
  { id: 'bug', label: 'Bug Report', icon: Bug },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb },
  { id: 'help', label: 'Need Help', icon: HelpCircle },
  { id: 'other', label: 'Other', icon: AlertCircle },
];

export default function RaiseTicketModal({ isOpen, onClose, tenantName, tenantSlug }) {
  const navigate = useNavigate();
  const [ticketType, setTicketType] = useState('help');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (!message.trim()) newErrors.message = 'Message is required';
    if (message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const userStr = localStorage.getItem('user');
      let userEmail = '';
      let userName = '';
      try {
        const user = JSON.parse(userStr || '{}');
        userEmail = user.email || user.Email || '';
        userName = user.full_name || user.fullName || user.name || '';
      } catch (e) { }

      await api.post('/support/tickets', {
        type: ticketType,
        subject: subject.trim(),
        message: message.trim(),
        tenantName: tenantName || 'Unknown',
        userEmail,
        userName,
      }, {
        headers: { 'x-tenant-slug': tenantSlug || 'system_shared' }
      });

      setResult({ success: true, message: 'Ticket submitted! Redirecting to your tickets...' });
      setTimeout(() => {
        onClose();
        setResult(null);
        setSubject('');
        setMessage('');
        setTicketType('help');
        // Navigate to the ticket page for real-time tracking
        if (tenantSlug) {
          navigate(`/support/${tenantSlug}`);
        } else {
          navigate('/support');
        }
      }, 1500);
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Failed to submit ticket. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(21,23,26,0.88)', backdropFilter: 'blur(10px)',
      zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .ticket-modal { animation: slideUp 0.3s ease; }
      `}</style>

      <div className="ticket-modal" style={{
        background: C.bone, maxWidth: '500px', width: '100%',
        border: '1px solid ' + C.line,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid ' + C.line,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: C.ink,
        }}>
          <div>
            <div style={{
              fontFamily: "'Fraunces', serif", fontSize: '1rem', fontWeight: 500, color: C.bone,
            }}>
              {tenantName ? `Support — ${tenantName}` : 'Help & Support'}
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'rgba(250,248,244,0.62)' }}>
              Raise a ticket · We respond within 24 hours
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid rgba(250,248,244,0.2)',
            padding: '0.4rem 0.7rem', cursor: 'pointer', color: 'rgba(250,248,244,0.62)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem',
            transition: 'all 0.2s',
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Info */}
          <div style={{
            padding: '0.6rem 0.8rem', border: '1px solid ' + C.verdigris,
            marginBottom: '1.25rem', fontSize: '0.78rem', color: C.verdigris,
          }}>
            📧 Email us directly at <strong>info@restpoint.co.ke</strong>
          </div>

          {/* Result message */}
          {result && (
            <div style={{
              padding: '0.65rem 0.85rem', marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.82rem', fontWeight: 500,
              border: '1px solid ' + (result.success ? C.verdigris : '#E8A0A0'),
              color: result.success ? C.verdigris : '#B91C1C',
            }}>
              {result.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {result.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Ticket Type */}
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: C.ink, marginBottom: '0.5rem',
            }}>
              What's this about?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {ticketTypes.map((type) => (
                <button key={type.id} type="button" onClick={() => setTicketType(type.id)}
                  style={{
                    padding: '0.5rem 0.65rem',
                    border: '1px solid ' + (ticketType === type.id ? C.brass : C.line),
                    cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    transition: 'all 0.2s',
                    background: ticketType === type.id ? C.bone2 : C.bone,
                    color: ticketType === type.id ? C.ink : C.gray,
                    fontFamily: "'Inter', sans-serif",
                  }}>
                  <type.icon size={13} />
                  {type.label}
                </button>
              ))}
            </div>

            {/* Subject */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: C.ink, marginBottom: '0.35rem',
              }}>
                Subject *
              </div>
              <input
                value={subject}
                onChange={(e) => { setSubject(e.target.value); if (errors.subject) setErrors(p => ({ ...p, subject: '' })); }}
                placeholder="Brief description of your issue"
                style={{
                  width: '100%', padding: '0.65rem 0.8rem',
                  border: '1px solid ' + (errors.subject ? '#B91C1C' : C.line),
                  fontSize: '0.85rem', fontFamily: "'Inter', sans-serif",
                  color: C.ink, background: C.bone, outline: 'none',
                }}
              />
              {errors.subject && <p style={{ fontSize: '0.7rem', color: '#B91C1C', marginTop: '0.25rem' }}>{errors.subject}</p>}
            </div>

            {/* Message */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: C.ink, marginBottom: '0.35rem',
              }}>
                Message *
              </div>
              <textarea
                value={message}
                onChange={(e) => { setMessage(e.target.value); if (errors.message) setErrors(p => ({ ...p, message: '' })); }}
                placeholder="Describe your issue in detail..."
                rows={5}
                style={{
                  width: '100%', padding: '0.65rem 0.8rem', resize: 'vertical',
                  border: '1px solid ' + (errors.message ? '#B91C1C' : C.line),
                  fontSize: '0.85rem', fontFamily: "'Inter', sans-serif",
                  color: C.ink, background: C.bone, lineHeight: 1.5, outline: 'none',
                }}
              />
              {errors.message && <p style={{ fontSize: '0.7rem', color: '#B91C1C', marginTop: '0.25rem' }}>{errors.message}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting}
              style={{
                width: '100%', padding: '0.75rem', border: '1px solid ' + C.ink,
                fontSize: '0.82rem', fontWeight: 500, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                background: isSubmitting ? C.gray : C.ink,
                color: C.bone, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.5rem',
                fontFamily: "'Inter', sans-serif",
                opacity: isSubmitting ? 0.6 : 1, transition: 'all 0.2s',
              }}
            >
              {isSubmitting ? (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem' }}>Submitting...</span>
              ) : (
                <><Send size={14} /> Submit Ticket</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}