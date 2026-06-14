import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Send, Bug, Lightbulb, HelpCircle } from 'lucide-react';
import api from '../../api/axios';

const Colors = {
  primary: '#3b82f6',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  dark: '#1e293b',
  light: '#f8fafc',
  border: '#e2e8f0',
  text: '#1e293b',
  textMuted: '#64748b',
  surface: '#ffffff',
  gold: '#A67C52',
  goldLight: '#C9A876',
};

const ticketTypes = [
  { id: 'bug', label: 'Bug Report', icon: Bug, color: Colors.danger },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: Colors.warning },
  { id: 'help', label: 'Need Help', icon: HelpCircle, color: Colors.primary },
  { id: 'other', label: 'Other', icon: AlertCircle, color: Colors.textMuted },
];

const RaiseTicketModal = ({ isOpen, onClose, tenantName, tenantSlug }) => {
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
      } catch (e) {}
      
      await api.post('/api/v2/restpoint/support/tickets', {
        type: ticketType,
        subject: subject.trim(),
        message: message.trim(),
        tenantName: tenantName || 'Unknown',
        userEmail,
        userName,
      }, {
        headers: { 'x-tenant-slug': tenantSlug || 'system_shared' }
      });
      
      setResult({ success: true, message: 'Ticket submitted successfully! Our team will review and respond shortly.' });
      setTimeout(() => {
        onClose();
        setResult(null);
        setSubject('');
        setMessage('');
        setTicketType('help');
      }, 2500);
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
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', animation: 'fadeIn 0.2s ease',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .ticket-modal { animation: slideUp 0.25s ease; }
        .ticket-input:focus { outline: none; border-color: ${Colors.gold} !important; box-shadow: 0 0 0 3px rgba(166,124,82,0.12); }
      `}</style>

      <div className="ticket-modal" style={{
        background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%',
        maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(166,124,82,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '16px' }}>🎫</span>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#F1F5F9' }}>
                {tenantName ? `${tenantName}` : 'Help & Support'}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                Raise a ticket • Build Restpoint • Suggest something
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex',
            color: '#94A3B8', transition: 'all 0.2s',
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Email info */}
          <div style={{ padding: '0.6rem 0.8rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8rem', color: '#166534' }}>
            📧 Email us directly at <strong>info@restpoint.co.ke</strong> • We respond within 24 hours.
          </div>

          {/* Result message */}
          {result && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 500,
              background: result.success ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${result.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              color: result.success ? Colors.success : Colors.danger,
            }}>
              {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {result.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Ticket Type */}
            <label style={{
              display: 'block', fontSize: '0.75rem', fontWeight: 600, color: Colors.text, marginBottom: '0.5rem',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              What's this about?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {ticketTypes.map((type) => (
                <button key={type.id} type="button" onClick={() => setTicketType(type.id)}
                  style={{
                    padding: '0.6rem 0.75rem', border: `2px solid ${ticketType === type.id ? type.color : '#e2e8f0'}`,
                    borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s',
                    background: ticketType === type.id ? `${type.color}10` : 'white',
                    color: ticketType === type.id ? type.color : Colors.textMuted,
                  }}>
                  <type.icon size={14} />
                  {type.label}
                </button>
              ))}
            </div>

            {/* Subject */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block', fontSize: '0.75rem', fontWeight: 600, color: Colors.text, marginBottom: '0.4rem',
              }}>
                Subject *
              </label>
              <input
                value={subject}
                onChange={(e) => { setSubject(e.target.value); if (errors.subject) setErrors(p => ({ ...p, subject: '' })); }}
                placeholder="Brief description of your issue"
                className="ticket-input"
                style={{
                  width: '100%', padding: '0.7rem 0.85rem',
                  border: `1px solid ${errors.subject ? Colors.danger : '#e2e8f0'}`,
                  borderRadius: '8px', fontSize: '0.85rem', color: Colors.text,
                  transition: 'all 0.2s', background: '#f8fafc',
                }}
              />
              {errors.subject && <p style={{ fontSize: '0.7rem', color: Colors.danger, marginTop: '0.25rem' }}>{errors.subject}</p>}
            </div>

            {/* Message */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block', fontSize: '0.75rem', fontWeight: 600, color: Colors.text, marginBottom: '0.4rem',
              }}>
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => { setMessage(e.target.value); if (errors.message) setErrors(p => ({ ...p, message: '' })); }}
                placeholder="Describe your issue in detail..."
                rows={5}
                className="ticket-input"
                style={{
                  width: '100%', padding: '0.7rem 0.85rem', resize: 'vertical',
                  border: `1px solid ${errors.message ? Colors.danger : '#e2e8f0'}`,
                  borderRadius: '8px', fontSize: '0.85rem', color: Colors.text, lineHeight: 1.5,
                  transition: 'all 0.2s', background: '#f8fafc', fontFamily: 'inherit',
                }}
              />
              {errors.message && <p style={{ fontSize: '0.7rem', color: Colors.danger, marginTop: '0.25rem' }}>{errors.message}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting}
              style={{
                width: '100%', padding: '0.75rem', border: 'none', borderRadius: '10px',
                fontSize: '0.85rem', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                background: isSubmitting ? '#94A3B8' : 'linear-gradient(135deg, #A67C52 0%, #C9A876 100%)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                opacity: isSubmitting ? 0.7 : 1, transition: 'all 0.2s',
              }}
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <><Send size={16} /> Submit Ticket</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RaiseTicketModal;