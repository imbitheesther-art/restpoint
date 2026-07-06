import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../../api/endpoints';
import env from '../../config/env';
import {
  UserPlus,
  Check,
  Loader2,
  AlertTriangle,
  XCircle,
  CheckCircle,
  X
} from 'lucide-react';

// ============================================================
// TOAST NOTIFICATION
// ============================================================

const NotificationToast = ({ notification, setNotification }) => {
  useEffect(() => {
    if (notification.isVisible) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);

  if (!notification.isVisible) return null;

  const bgColor = notification.type === 'success' ? '#10B981' : '#EF4444';

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      backgroundColor: bgColor,
      color: 'white',
      padding: '14px 20px',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '280px',
      maxWidth: '90%',
      animation: 'slideInRight 0.3s ease'
    }}>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', fontSize: '14px' }}>{notification.title}</div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>{notification.message}</div>
      </div>
      <button
        onClick={() => setNotification(prev => ({ ...prev, isVisible: false }))}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '4px',
          opacity: 0.7,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        <X size={16} />
      </button>
    </div>
  );
};

// ============================================================
// FORM INPUT
// ============================================================

const FormInput = ({ label, name, value, onChange, error, required, type = "text", placeholder }) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        marginBottom: '6px',
        fontWeight: '500',
        fontSize: '13px',
        color: '#1A1D24'
      }}>
        {label}
        {required && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: `2px solid ${error ? '#EF4444' : '#E8ECF0'}`,
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxSizing: 'border-box',
          fontFamily: "'Inter', sans-serif",
          backgroundColor: '#FFFFFF'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#3D4F47';
          e.target.style.boxShadow = '0 0 0 3px rgba(61, 79, 71, 0.08)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#EF4444' : '#E8ECF0';
          e.target.style.boxShadow = 'none';
        }}
      />
      {error && (
        <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangle size={12} />
          {error}
        </div>
      )}
    </div>
  );
};

// ============================================================
// FORM SELECT
// ============================================================

const FormSelect = ({ label, name, value, onChange, error, required, options }) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        marginBottom: '6px',
        fontWeight: '500',
        fontSize: '13px',
        color: '#1A1D24'
      }}>
        {label}
        {required && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: `2px solid ${error ? '#EF4444' : '#E8ECF0'}`,
          borderRadius: '8px',
          fontSize: '14px',
          backgroundColor: '#FFFFFF',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: "'Inter', sans-serif",
          transition: 'border-color 0.2s, box-shadow 0.2s',
          color: '#1A1D24'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#3D4F47';
          e.target.style.boxShadow = '0 0 0 3px rgba(61, 79, 71, 0.08)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#EF4444' : '#E8ECF0';
          e.target.style.boxShadow = 'none';
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{error}</div>
      )}
    </div>
  );
};

// ============================================================
// MAIN COMPONENT - SIMPLIFIED
// ============================================================

const DeceasedRegistrationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    isVisible: false, type: 'info', title: '', message: '',
  });

  const initialFormData = {
    full_name: '',
    gender: '',
    date_of_birth: '',
    date_of_death: '',
    date_admitted: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name) newErrors.full_name = 'Full name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.date_admitted) newErrors.date_admitted = 'Date admitted is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const tenantSlug = localStorage.getItem('tenantSlug') || 'default';

      // Only send required fields
      const payload = {
        full_name: formData.full_name,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth || null,
        date_of_death: formData.date_of_death || null,
        date_admitted: formData.date_admitted,
      };

      const response = await fetch(`${env.FULL_API_URL}${ENDPOINTS.DECEASED.CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-slug': tenantSlug,
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      setNotification({
        isVisible: true,
        type: 'success',
        title: 'Success!',
        message: 'Deceased record registered successfully!',
      });

      setTimeout(() => {
        navigate(`/tenant/${tenantSlug}/all-deceased`);
      }, 2000);

    } catch (error) {
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Error!',
        message: error.message || 'Registration failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      overflow: 'visible'
    }}>
      <NotificationToast notification={notification} setNotification={setNotification} />

      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        maxWidth: '800px',
        margin: '0 auto 24px auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#3D4F47',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserPlus size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1A1D24' }}>Register Deceased</h1>
              <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '14px' }}>Fill in the basic details below</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFormData(initialFormData);
              setErrors({});
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f8f9fa',
              border: `1px solid #E8ECF0`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              color: '#1A1D24'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(61, 79, 71, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}
          >
            Clear Form
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'visible'
      }}>
        <div style={{ padding: '30px', overflow: 'visible' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#1A1D24' }}>
            Basic Information
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <FormInput
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                error={errors.full_name}
                required
                placeholder="Enter full name"
              />
            </div>

            <div>
              <FormSelect
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                error={errors.gender}
                required
                options={[
                  { value: '', label: 'Select gender', disabled: true },
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                ]}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                fontSize: '13px',
                color: '#1A1D24'
              }}>
                Date of Birth (Optional)
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #E8ECF0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: '#FFFFFF',
                  color: '#1A1D24'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3D4F47';
                  e.target.style.boxShadow = '0 0 0 3px rgba(61, 79, 71, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E8ECF0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                fontSize: '13px',
                color: '#1A1D24'
              }}>
                Date of Death (Optional)
              </label>
              <input
                type="date"
                name="date_of_death"
                value={formData.date_of_death}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #E8ECF0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: '#FFFFFF',
                  color: '#1A1D24'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3D4F47';
                  e.target.style.boxShadow = '0 0 0 3px rgba(61, 79, 71, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E8ECF0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                fontSize: '13px',
                color: '#1A1D24'
              }}>
                Date Admitted <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>
              </label>
              <input
                type="date"
                name="date_admitted"
                value={formData.date_admitted}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `2px solid ${errors.date_admitted ? '#EF4444' : '#E8ECF0'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: '#FFFFFF',
                  color: '#1A1D24'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3D4F47';
                  e.target.style.boxShadow = '0 0 0 3px rgba(61, 79, 71, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.date_admitted ? '#EF4444' : '#E8ECF0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.date_admitted && (
                <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={12} />
                  {errors.date_admitted}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #e9ecef',
            gap: '12px'
          }}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '10px 24px',
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#059669';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#10B981';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Submitting...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Register Deceased
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '12px',
        color: '#6c757d',
        maxWidth: '800px',
        margin: '24px auto 0'
      }}>
        Only fields marked with <span style={{ color: '#EF4444' }}>*</span> are required. All other fields are optional.
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DeceasedRegistrationForm;