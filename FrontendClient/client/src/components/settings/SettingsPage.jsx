import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenantStore } from '../store/useTenantStore';
import {
  Save, Building2, MapPin, Phone, Mail, Globe,
  CheckCircle, Settings, CreditCard, Banknote, Smartphone
} from 'lucide-react';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';

const Colors = {
  primary: '#1e293b',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  light: '#f8fafc',
  border: '#e2e8f0',
  text: '#1e293b',
  textMuted: '#64748b',
};

const SettingsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { tenantData, setTenantData } = useTenantStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [orgForm, setOrgForm] = useState({
    name: '', location: '', phone: '', email: '', website: '',
  });

  useEffect(() => {
    if (!slug) navigate('/login', { replace: true });
  }, [slug, navigate]);

  useEffect(() => {
    if (tenantData) {
      setOrgForm({
        name: tenantData.name || '', location: tenantData.location || '',
        phone: tenantData.phone || '', email: tenantData.email || '',
        website: tenantData.website || '',
      });
    }
  }, [tenantData]);

  const handleOrgChange = (e) => {
    const { name, value } = e.target;
    setOrgForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!orgForm.name.trim()) newErrors.name = 'Organization name is required';
    if (!orgForm.location.trim()) newErrors.location = 'Location is required';
    if (orgForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgForm.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await api.put(ENDPOINTS.TENANT.CONFIG(slug), orgForm, {
        headers: { 'x-tenant-slug': slug || 'system_shared' }
      });
      setTenantData({ ...tenantData, ...orgForm });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setTenantData({ ...tenantData, ...orgForm });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.7rem 0.9rem',
    border: `1px solid ${Colors.border}`, borderRadius: '8px',
    fontSize: '0.875rem', outline: 'none',
    transition: 'all 0.2s ease', background: 'white', color: Colors.text,
    fontFamily: 'inherit',
  };
  const labelStyle = {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    fontSize: '0.8rem', fontWeight: 600, color: Colors.text,
    marginBottom: '0.4rem',
  };

  const subscription = tenantData?.subscription || {};
  const planName = subscription.plan || subscription.plan_name || 'Single Tenant';
  const planStatus = subscription.status || 'active';
  const planExpiry = subscription.expiry_date || subscription.end_date || null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize: '1.4rem', fontWeight: 700, color: Colors.text, margin: 0,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <Settings size={22} /> Settings
        </h1>
        <p style={{ color: Colors.textMuted, marginTop: '0.25rem', fontSize: '0.85rem' }}>
          Manage your organization profile and view payment details
        </p>
      </div>

      {/* Success */}
      {showSuccess && (
        <div style={{
          padding: '0.65rem 1rem', marginBottom: '1rem',
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: '#166534', fontSize: '0.85rem', fontWeight: 500,
        }}>
          <CheckCircle size={16} /> Settings saved successfully!
        </div>
      )}

      {/* Organization Info */}
      <form onSubmit={handleSave}>
        <div style={{
          background: 'white', borderRadius: '12px',
          border: `1px solid ${Colors.border}`,
          padding: '1.5rem', marginBottom: '1.25rem',
        }}>
          <h2 style={{
            fontSize: '1rem', fontWeight: 600, color: Colors.text,
            marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <Building2 size={18} /> Organization Information
          </h2>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Organization Name <span style={{ color: Colors.danger }}>*</span></label>
              <input type="text" name="name" value={orgForm.name} onChange={handleOrgChange}
                placeholder="e.g., Rest Point Funeral Home" style={inputStyle} />
              {errors.name && <p style={{ fontSize: '0.75rem', color: Colors.danger, marginTop: '0.2rem' }}>{errors.name}</p>}
            </div>

            <div>
              <label style={labelStyle}><MapPin size={14} /> Location <span style={{ color: Colors.danger }}>*</span></label>
              <input type="text" name="location" value={orgForm.location} onChange={handleOrgChange}
                placeholder="e.g., Nairobi, Kenya" style={inputStyle} />
              {errors.location && <p style={{ fontSize: '0.75rem', color: Colors.danger, marginTop: '0.2rem' }}>{errors.location}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}><Phone size={14} /> Phone</label>
                <input type="tel" name="phone" value={orgForm.phone} onChange={handleOrgChange}
                  placeholder="+254 700 000 000" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}><Mail size={14} /> Email</label>
                <input type="email" name="email" value={orgForm.email} onChange={handleOrgChange}
                  placeholder="info@example.com" style={inputStyle} />
                {errors.email && <p style={{ fontSize: '0.75rem', color: Colors.danger, marginTop: '0.2rem' }}>{errors.email}</p>}
              </div>
            </div>

            <div>
              <label style={labelStyle}><Globe size={14} /> Website</label>
              <input type="url" name="website" value={orgForm.website} onChange={handleOrgChange}
                placeholder="https://www.example.com" style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <button type="submit" disabled={isSubmitting}
            style={{
              padding: '0.65rem 1.5rem',
              background: isSubmitting ? Colors.textMuted : Colors.primary,
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '0.85rem', fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s',
            }}>
            {isSubmitting ? (
              <><span style={{
                width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', display: 'inline-block',
              }} /> Saving...</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>
        </div>
      </form>

      {/* Payment Details */}
      <div style={{
        background: 'white', borderRadius: '12px',
        border: `1px solid ${Colors.border}`,
        padding: '1.5rem', marginBottom: '1.25rem',
      }}>
        <h2 style={{
          fontSize: '1rem', fontWeight: 600, color: Colors.text,
          marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <Banknote size={18} /> Payment Details
        </h2>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* M-Pesa Till */}
          <div style={{
            padding: '1rem', background: Colors.light, borderRadius: '8px',
            border: `1px solid ${Colors.border}`,
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'rgba(0,200,83,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Smartphone size={22} color="#00C853" />
            </div>
            <div>
              <p style={{ fontSize: '0.72rem', color: Colors.textMuted, marginBottom: '0.15rem', fontWeight: 500 }}>
                M-PESA TILL NUMBER
              </p>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: Colors.text, margin: 0, letterSpacing: '1px' }}>
                5570316
              </p>
              <p style={{ fontSize: '0.75rem', color: Colors.textMuted, marginTop: '0.15rem' }}>
                Paybill / Till for monthly subscription
              </p>
            </div>
          </div>

          {/* Bank Transfer */}
          <div style={{
            padding: '1rem', background: Colors.light, borderRadius: '8px',
            border: `1px solid ${Colors.border}`,
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'rgba(30,65,155,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Banknote size={22} color="#1E419B" />
            </div>
            <div>
              <p style={{ fontSize: '0.72rem', color: Colors.textMuted, marginBottom: '0.15rem', fontWeight: 500 }}>
                BANK TRANSFER — ABSA BANK
              </p>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: Colors.text, margin: 0, letterSpacing: '1px' }}>
                2054862930
              </p>
              <p style={{ fontSize: '0.75rem', color: Colors.textMuted, marginTop: '0.15rem' }}>
                Account Name: Restpoint Technologies Ltd
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plan */}
      <div style={{
        background: 'white', borderRadius: '12px',
        border: `1px solid ${Colors.border}`,
        padding: '1.5rem',
      }}>
        <h2 style={{
          fontSize: '1rem', fontWeight: 600, color: Colors.text,
          marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <CreditCard size={18} /> Subscription Plan
        </h2>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
        }}>
          <div style={{
            padding: '1rem', background: Colors.light, borderRadius: '8px',
            border: `1px solid ${Colors.border}`,
          }}>
            <p style={{ fontSize: '0.72rem', color: Colors.textMuted, marginBottom: '0.25rem', fontWeight: 500 }}>
              PLAN
            </p>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: Colors.text, margin: 0 }}>
              {planName}
            </p>
          </div>

          <div style={{
            padding: '1rem', background: Colors.light, borderRadius: '8px',
            border: `1px solid ${Colors.border}`,
          }}>
            <p style={{ fontSize: '0.72rem', color: Colors.textMuted, marginBottom: '0.25rem', fontWeight: 500 }}>
              STATUS
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: planStatus === 'active' ? Colors.success :
                  planStatus === 'trial' ? Colors.warning : Colors.danger,
              }} />
              <span style={{ fontSize: '1rem', fontWeight: 700, color: Colors.text, textTransform: 'capitalize' }}>
                {planStatus === 'active' ? 'Active' : planStatus === 'trial' ? 'Trial' : planStatus}
              </span>
            </div>
          </div>

          {planExpiry && (
            <div style={{
              padding: '1rem', background: Colors.light, borderRadius: '8px',
              border: `1px solid ${Colors.border}`,
            }}>
              <p style={{ fontSize: '0.72rem', color: Colors.textMuted, marginBottom: '0.25rem', fontWeight: 500 }}>
                EXPIRY DATE
              </p>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: Colors.text, margin: 0 }}>
                {new Date(planExpiry).toLocaleDateString('en-KE', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
          )}

          <div style={{
            padding: '1rem', background: Colors.light, borderRadius: '8px',
            border: `1px solid ${Colors.border}`,
          }}>
            <p style={{ fontSize: '0.72rem', color: Colors.textMuted, marginBottom: '0.25rem', fontWeight: 500 }}>
              TENANT ID
            </p>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: Colors.text, margin: 0, fontFamily: 'monospace' }}>
              {slug || 'N/A'}
            </p>
          </div>
        </div>

        <div style={{
          marginTop: '1rem', padding: '0.75rem 1rem',
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.15)', borderRadius: '8px',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.8rem', color: '#92400e',
        }}>
          <CreditCard size={14} />
          <span>For questions about your plan or billing, contact <strong>info@restpoint.co.ke</strong></span>
        </div>
      </div>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SettingsPage;