import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenantStore } from '../../store/useTenantStore';
import {
  Save, Upload, Building2, User, MapPin, Phone, Mail, Globe, Image,
  Palette, CheckCircle, AlertCircle, CreditCard, History,
  Settings, DollarSign, Clock, ArrowUpRight,
  ArrowDownLeft, Filter, RefreshCw, Eye, EyeOff, FileText, Users
} from 'lucide-react';
import { paymentApi } from '../../api/paymentApi';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import UserManagement from '../user/users';

const Colors = {
  primary: '#3b82f6', success: '#22c55e', danger: '#ef4444',
  warning: '#f59e0b', dark: '#1e293b', light: '#f8fafc',
  border: '#e2e8f0', text: '#1e293b', textMuted: '#64748b',
  surface: '#ffffff',
};

const tabs = [
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'billing', label: 'Billing & Charges', icon: DollarSign },
  { id: 'payments', label: 'Payment History', icon: History },
  { id: 'quickbooks', label: 'QuickBooks', icon: CreditCard },
];

const SettingsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { tenantData, setTenantData } = useTenantStore();
  const [activeTab, setActiveTab] = useState('organization');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Organization form
  const [orgForm, setOrgForm] = useState({
    name: '', location: '', phone: '', email: '', website: '',
    primaryColor: '#1e293b', logo: null, signature: null,
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);

  // Billing settings form
  const [billingForm, setBillingForm] = useState({
    embalming_charge: 0,
    coffin_markup_percentage: 0,
    transportation_charge: 0,
    storage_charge_per_day: 0,
    certificate_fee: 0,
    permit_fee: 0,
    other_services_charge: 0,
    tax_percentage: 0,
    payment_terms_days: 30,
    currency: 'KES',
  });

  // Payment history
  const [payments, setPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('all');

  // STK Push form
  const [stkForm, setStkForm] = useState({ phoneNumber: '', amount: '', description: '' });
  const [stkLoading, setStkLoading] = useState(false);
  const [stkResult, setStkResult] = useState(null);

  useEffect(() => {
    if (!slug) navigate('/login', { replace: true });
  }, [slug, navigate]);

  useEffect(() => {
    if (tenantData) {
      setOrgForm({
        name: tenantData.name || '', location: tenantData.location || '',
        phone: tenantData.phone || '', email: tenantData.email || '',
        website: tenantData.website || '', primaryColor: tenantData.primaryColor || '#1e293b',
        logo: tenantData.logo || null,
        signature: tenantData.signature || null,
      });
      if (tenantData.logo) setLogoPreview(tenantData.logo);
      if (tenantData.signature) setSignaturePreview(tenantData.signature);

      // Load billing settings if available
      if (tenantData.billing) {
        setBillingForm(prev => ({ ...prev, ...tenantData.billing }));
      }
    }
  }, [tenantData]);

  const loadPaymentData = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const [statsData, paymentsData] = await Promise.allSettled([
        paymentApi.getPaymentStats(),
        paymentApi.getAllPayments({ limit: 50 }),
      ]);
      if (statsData.status === 'fulfilled') setPaymentStats(statsData.value);
      if (paymentsData.status === 'fulfilled') setPayments(paymentsData.value);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'payments') loadPaymentData();
  }, [activeTab, loadPaymentData]);

  const handleOrgChange = (e) => {
    const { name, value } = e.target;
    setOrgForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: 'Logo size must be less than 5MB' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setOrgForm(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, signature: 'Signature size must be less than 5MB' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result);
        setOrgForm(prev => ({ ...prev, signature: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingForm(prev => ({ ...prev, [name]: value }));
  };

  const validateOrg = () => {
    const newErrors = {};
    if (!orgForm.name.trim()) newErrors.name = 'Organization name is required';
    if (!orgForm.location.trim()) newErrors.location = 'Location is required';
    if (orgForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgForm.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveOrg = async (e) => {
    e.preventDefault();
    if (!validateOrg()) return;
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

  const handleSaveBilling = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(ENDPOINTS.TENANT.CONFIG(slug) + '/billing', billingForm, {
        headers: { 'x-tenant-slug': slug || 'system_shared' }
      });
      setTenantData({ ...tenantData, billing: billingForm });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setTenantData({ ...tenantData, billing: billingForm });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSTKPush = async (e) => {
    e.preventDefault();
    if (!stkForm.phoneNumber || !stkForm.amount) {
      setErrors({ stk: 'Phone number and amount are required' });
      return;
    }
    setStkLoading(true);
    setStkResult(null);
    try {
      const result = await paymentApi.initiateSTKPush({
        phoneNumber: stkForm.phoneNumber,
        amount: parseFloat(stkForm.amount),
        description: stkForm.description,
        tenantSlug: slug,
      });
      setStkResult({ success: true, message: 'STK push sent! Check your phone.', data: result });
      setStkForm({ phoneNumber: '', amount: '', description: '' });
    } catch (error) {
      setStkResult({
        success: false,
        message: error.response?.data?.message || 'Failed to initiate STK push. Check M-Pesa configuration.',
      });
    } finally {
      setStkLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', border: `1px solid ${Colors.border}`, borderRadius: '8px', fontSize: '0.875rem', outline: 'none', transition: 'all 0.2s ease', background: 'white', color: Colors.text };
  const labelStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: Colors.text, marginBottom: '0.5rem' };
  const errorStyle = { fontSize: '0.75rem', color: Colors.danger, marginTop: '0.25rem' };

  const filteredPayments = payments.filter(p => {
    if (paymentFilter === 'all') return true;
    return p.status?.toLowerCase() === paymentFilter;
  });

  const formatCurrency = (amount) => `KES ${Number(amount || 0).toLocaleString()}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: Colors.text, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={24} /> {tenantData?.name || 'Tenant'} Settings
        </h1>
        <p style={{ color: Colors.textMuted, marginTop: '0.25rem', fontSize: '0.875rem' }}>
          Manage your funeral home profile, billing settings, and view payments
        </p>
      </div>

      {/* Success */}
      {showSuccess && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.1)', border: `1px solid ${Colors.success}`, borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: Colors.success, fontSize: '0.875rem' }}>
          <CheckCircle size={18} /> Settings saved successfully!
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: Colors.light, borderRadius: '10px', padding: '4px', border: `1px solid ${Colors.border}`, overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, minWidth: '100px', padding: '0.6rem 0.75rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.2s',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? Colors.primary : Colors.textMuted,
              boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Organization Tab */}
      {activeTab === 'organization' && (
        <form onSubmit={handleSaveOrg}>
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${Colors.border}`, padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: Colors.text, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} /> Funeral Home Information
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Funeral Home Name *</label>
                <input type="text" name="name" value={orgForm.name} onChange={handleOrgChange} placeholder="e.g., Rest Point Funeral Home" style={inputStyle} />
                {errors.name && <p style={errorStyle}>{errors.name}</p>}
              </div>
              <div>
                <label style={labelStyle}><MapPin size={14} /> Location *</label>
                <input type="text" name="location" value={orgForm.location} onChange={handleOrgChange} placeholder="e.g., Nairobi, Kenya" style={inputStyle} />
                {errors.location && <p style={errorStyle}>{errors.location}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}><Phone size={14} /> Phone</label>
                  <input type="tel" name="phone" value={orgForm.phone} onChange={handleOrgChange} placeholder="+254 700 000 000" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}><Mail size={14} /> Email</label>
                  <input type="email" name="email" value={orgForm.email} onChange={handleOrgChange} placeholder="info@funeral.com" style={inputStyle} />
                  {errors.email && <p style={errorStyle}>{errors.email}</p>}
                </div>
              </div>
              <div>
                <label style={labelStyle}><Globe size={14} /> Website</label>
                <input type="url" name="website" value={orgForm.website} onChange={handleOrgChange} placeholder="https://www.example.com" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Logo & Branding */}
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${Colors.border}`, padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: Colors.text, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Image size={18} /> Logo & Branding
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Organization Logo</label>
                <div style={{ border: `2px dashed ${Colors.border}`, borderRadius: '12px', padding: '1.5rem', textAlign: 'center', background: logoPreview ? 'transparent' : Colors.light }}>
                  {logoPreview ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={logoPreview} alt="Logo" style={{ maxWidth: '150px', maxHeight: '100px', borderRadius: '8px', objectFit: 'contain' }} />
                      <label style={{ display: 'block', marginTop: '0.75rem', cursor: 'pointer', color: Colors.primary, fontSize: '0.8rem', fontWeight: 600 }}>
                        Change Logo <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                      </label>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '48px', height: '48px', background: 'rgba(59,130,246,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Upload size={24} color={Colors.primary} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: Colors.text, margin: 0, fontSize: '0.875rem' }}>Click to upload logo</p>
                        <p style={{ fontSize: '0.75rem', color: Colors.textMuted, margin: '0.25rem 0 0' }}>PNG, JPG up to 5MB</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
                {errors.logo && <p style={errorStyle}>{errors.logo}</p>}
              </div>

              <div>
                <label style={labelStyle}>Official Signature</label>
                <div style={{ border: `2px dashed ${Colors.border}`, borderRadius: '12px', padding: '1.5rem', textAlign: 'center', background: signaturePreview ? 'transparent' : Colors.light }}>
                  {signaturePreview ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={signaturePreview} alt="Signature" style={{ maxWidth: '200px', maxHeight: '80px', borderRadius: '8px', objectFit: 'contain' }} />
                      <label style={{ display: 'block', marginTop: '0.75rem', cursor: 'pointer', color: Colors.primary, fontSize: '0.8rem', fontWeight: 600 }}>
                        Change Signature <input type="file" accept="image/*" onChange={handleSignatureChange} style={{ display: 'none' }} />
                      </label>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '48px', height: '48px', background: 'rgba(59,130,246,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={24} color={Colors.primary} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: Colors.text, margin: 0, fontSize: '0.875rem' }}>Click to upload signature</p>
                        <p style={{ fontSize: '0.75rem', color: Colors.textMuted, margin: '0.25rem 0 0' }}>PNG with transparent background, up to 5MB</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleSignatureChange} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
                {errors.signature && <p style={errorStyle}>{errors.signature}</p>}
              </div>

              <div>
                <label style={labelStyle}>Brand Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input type="color" name="primaryColor" value={orgForm.primaryColor} onChange={handleOrgChange} style={{ width: '50px', height: '50px', border: `1px solid ${Colors.border}`, borderRadius: '8px', cursor: 'pointer', padding: '4px' }} />
                  <div>
                    <p style={{ fontWeight: '600', color: Colors.text, margin: 0, fontSize: '0.875rem' }}>{orgForm.primaryColor}</p>
                    <p style={{ fontSize: '0.75rem', color: Colors.textMuted, margin: '0.25rem 0 0' }}>Sidebar and branding color</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => navigate(`/rptenant/${slug}/dashboard`)}
              style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: `1px solid ${Colors.border}`, borderRadius: '8px', color: Colors.textMuted, fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              style={{ padding: '0.75rem 2rem', background: isSubmitting ? Colors.textMuted : `linear-gradient(135deg, ${Colors.primary} 0%, #2563eb 100%)`, color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isSubmitting ? <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><Save size={18} /> Save Organization</>}
            </button>
          </div>
        </form>
      )}

      {/* Billing & Charges Tab */}
      {activeTab === 'billing' && (
        <form onSubmit={handleSaveBilling}>
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${Colors.border}`, padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: Colors.text, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={18} /> Service Charges & Billing
            </h2>
            <p style={{ fontSize: '0.8rem', color: Colors.textMuted, marginBottom: '1.5rem' }}>
              Configure default charges for various services. These will be used as defaults when creating new deceased records.
            </p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Service Charges */}
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: Colors.text, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `1px solid ${Colors.border}` }}>
                  Service Charges (KES)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Embalming Charge</label>
                    <input type="number" name="embalming_charge" value={billingForm.embalming_charge} onChange={handleBillingChange} placeholder="0" style={inputStyle} min="0" step="0.01" />
                  </div>
                  <div>
                    <label style={labelStyle}>Transportation Charge</label>
                    <input type="number" name="transportation_charge" value={billingForm.transportation_charge} onChange={handleBillingChange} placeholder="0" style={inputStyle} min="0" step="0.01" />
                  </div>
                  <div>
                    <label style={labelStyle}>Storage Charge (per day)</label>
                    <input type="number" name="storage_charge_per_day" value={billingForm.storage_charge_per_day} onChange={handleBillingChange} placeholder="0" style={inputStyle} min="0" step="0.01" />
                  </div>
                  <div>
                    <label style={labelStyle}>Certificate Fee</label>
                    <input type="number" name="certificate_fee" value={billingForm.certificate_fee} onChange={handleBillingChange} placeholder="0" style={inputStyle} min="0" step="0.01" />
                  </div>
                  <div>
                    <label style={labelStyle}>Permit Fee</label>
                    <input type="number" name="permit_fee" value={billingForm.permit_fee} onChange={handleBillingChange} placeholder="0" style={inputStyle} min="0" step="0.01" />
                  </div>
                  <div>
                    <label style={labelStyle}>Other Services Charge</label>
                    <input type="number" name="other_services_charge" value={billingForm.other_services_charge} onChange={handleBillingChange} placeholder="0" style={inputStyle} min="0" step="0.01" />
                  </div>
                </div>
              </div>

              {/* Coffin & Tax Settings */}
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: Colors.text, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `1px solid ${Colors.border}` }}>
                  Coffin & Tax Settings
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Coffin Markup Percentage (%)</label>
                    <input type="number" name="coffin_markup_percentage" value={billingForm.coffin_markup_percentage} onChange={handleBillingChange} placeholder="0" style={inputStyle} min="0" max="100" step="0.1" />
                    <p style={{ fontSize: '0.75rem', color: Colors.textMuted, marginTop: '0.25rem' }}>Percentage added to coffin cost</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Tax Percentage (%)</label>
                    <input type="number" name="tax_percentage" value={billingForm.tax_percentage} onChange={handleBillingChange} placeholder="0" style={inputStyle} min="0" max="100" step="0.1" />
                    <p style={{ fontSize: '0.75rem', color: Colors.textMuted, marginTop: '0.25rem' }}>VAT or other applicable taxes</p>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: Colors.text, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `1px solid ${Colors.border}` }}>
                  Payment Terms
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Payment Terms (days)</label>
                    <input type="number" name="payment_terms_days" value={billingForm.payment_terms_days} onChange={handleBillingChange} placeholder="30" style={inputStyle} min="0" step="1" />
                    <p style={{ fontSize: '0.75rem', color: Colors.textMuted, marginTop: '0.25rem' }}>Days until payment is due</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Currency</label>
                    <select name="currency" value={billingForm.currency} onChange={handleBillingChange} style={inputStyle}>
                      <option value="KES">KES - Kenyan Shilling</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => navigate(`/tenant/${slug}/dashboard`)}
              style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: `1px solid ${Colors.border}`, borderRadius: '8px', color: Colors.textMuted, fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              style={{ padding: '0.75rem 2rem', background: isSubmitting ? Colors.textMuted : `linear-gradient(135deg, ${Colors.primary} 0%, #2563eb 100%)`, color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isSubmitting ? <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><Save size={18} /> Save Billing Settings</>}
            </button>
          </div>
        </form>
      )}

      {/* Payment History Tab */}
      {activeTab === 'payments' && (
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Revenue', value: formatCurrency(paymentStats.total), color: Colors.primary, icon: DollarSign },
              { label: 'Pending', value: formatCurrency(paymentStats.pending), color: Colors.warning, icon: Clock },
              { label: 'Completed', value: formatCurrency(paymentStats.completed), color: Colors.success, icon: CheckCircle },
            ].map((stat, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: `1px solid ${Colors.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <stat.icon size={16} color={stat.color} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: Colors.textMuted, fontWeight: 500 }}>{stat.label}</span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: Colors.text }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Filter & Refresh */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', border: `1px solid ${Colors.border}`, borderRadius: '8px', fontSize: '0.8rem', background: 'white', cursor: 'pointer' }}>
              <option value="all">All Payments</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <button onClick={loadPaymentData} style={{ padding: '0.5rem', background: 'white', border: `1px solid ${Colors.border}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={16} color={Colors.textMuted} />
            </button>
          </div>

          {/* Payment List */}
          <div style={{ background: 'white', borderRadius: '12px', border: `1px solid ${Colors.border}`, overflow: 'hidden' }}>
            {loadingPayments ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: Colors.textMuted }}>
                <div style={{ width: '32px', height: '32px', border: `3px solid ${Colors.border}`, borderTop: `3px solid ${Colors.primary}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                Loading payments...
              </div>
            ) : filteredPayments.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: Colors.textMuted }}>
                <CreditCard size={40} color={Colors.border} style={{ marginBottom: '1rem' }} />
                <p style={{ fontWeight: 600, color: Colors.text, marginBottom: '0.25rem' }}>No Payments Found</p>
                <p style={{ fontSize: '0.8rem' }}>Payment records will appear here once transactions are made.</p>
              </div>
            ) : (
              <div>
                {filteredPayments.map((payment, idx) => (
                  <div key={payment.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: idx < filteredPayments.length - 1 ? `1px solid ${Colors.border}` : 'none', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: payment.status === 'completed' ? 'rgba(34,197,94,0.1)' : payment.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {payment.status === 'completed' ? <ArrowDownLeft size={16} color={Colors.success} /> : payment.status === 'pending' ? <Clock size={16} color={Colors.warning} /> : <ArrowUpRight size={16} color={Colors.danger} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: Colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {payment.description || payment.deceasedName || 'Payment'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: Colors.textMuted }}>
                          {payment.phoneNumber || 'N/A'} · {formatDate(payment.transactionDate || payment.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: Colors.text }}>{formatCurrency(payment.amount)}</div>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase',
                        background: payment.status === 'completed' ? 'rgba(34,197,94,0.1)' : payment.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        color: payment.status === 'completed' ? Colors.success : payment.status === 'pending' ? Colors.warning : Colors.danger,
                      }}>
                        {payment.status || 'unknown'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <UserManagement />
      )}

      {/* QuickBooks Integration Tab */}
      {activeTab === 'quickbooks' && (
        <div>
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${Colors.border}`, padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: Colors.text, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="#2CA01C" /> QuickBooks Integration
            </h2>
            <p style={{ fontSize: '0.8rem', color: Colors.textMuted, marginBottom: '1.5rem' }}>
              Connect your QuickBooks account to sync invoices, payments, and financial data automatically.
            </p>

            {/* Integration Card */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: '#2CA01C', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(44,160,28,0.3)',
                }}>
                  <span style={{ fontSize: '24px', color: 'white', fontWeight: 800 }}>QB</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#166534' }}>QuickBooks Online</h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#15803d' }}>Accounting & Financial Management</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  'Auto-sync invoices and payments',
                  'Real-time financial reporting',
                  'Tax preparation & compliance',
                  'Multi-currency support (KES/USD)',
                  'Automated bank reconciliation',
                ].map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#166534' }}>
                    <CheckCircle size={14} color="#22c55e" />
                    {feature}
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div style={{
                background: 'white',
                border: '2px solid #2CA01C',
                borderRadius: '10px',
                padding: '1.25rem',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '0.75rem', color: Colors.textMuted, margin: '0 0 0.25rem', textTransform: 'uppercase', fontWeight: 600 }}>Integration Price</p>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2CA01C', marginBottom: '0.25rem' }}>
                  KES 50,000
                </div>
                <p style={{ fontSize: '0.8rem', color: Colors.textMuted, margin: '0 0 1rem' }}>One-time setup fee + monthly maintenance</p>

                <button style={{
                  width: '100%', padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #2CA01C 0%, #16a34a 100%)',
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(44,160,28,0.3)',
                }}
                  onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 20px rgba(44,160,28,0.4)'; }}
                  onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(44,160,28,0.3)'; }}
                >
                  Contact Us to Integrate
                </button>
                <p style={{ fontSize: '0.7rem', color: Colors.textMuted, margin: '0.75rem 0 0' }}>
                  Email: <strong>info@restpoint.co.ke</strong>
                </p>
              </div>
            </div>

            {/* Status */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '8px',
            }}>
              <AlertCircle size={16} color={Colors.warning} />
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: Colors.warning }}>
                QuickBooks integration is not yet active for this account. Contact our team to get started.
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SettingsPage;