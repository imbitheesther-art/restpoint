import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ENDPOINTS } from '../../../api/endpoints';
import env from '../../../utils/config/env';
import ReusableSignaturePad from '../../../utils/signature/signaturepad'; // Adjust path to your global pad
import {
  UserPlus,
  Check,
  Loader2,
  AlertTriangle,
  XCircle,
  CheckCircle,
  X,
  FileText,
  Clock,
  User
} from 'lucide-react';
import './DeceasedRegistrationForm.css';

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

  return (
    <div className={`drf-toast drf-toast-${notification.type}`}>
      {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <div className="drf-toast-content">
        <div className="drf-toast-title">{notification.title}</div>
        <div className="drf-toast-message">{notification.message}</div>
      </div>
      <button className="drf-toast-close" onClick={() => setNotification(prev => ({ ...prev, isVisible: false }))}>
        <X size={16} />
      </button>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const DeceasedRegistrationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sigPadRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    isVisible: false, type: 'info', title: '', message: '',
  });

  // Get current time in HH:MM format for default value
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const initialFormData = {
    admission_number: location.state?.permitNumber || '', // Received from home/ex permit if applicable
    date_admitted: new Date().toISOString().split('T')[0],
    time_received: getCurrentTime(),
    full_name: '',
    gender: '',
    age: '',
    date_of_birth: '',
    date_of_death: '',
    cause_of_death: '',
    body_status: '',
    contact_person: '',
    id_number: '',
    tel_number: '',
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
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.date_admitted) newErrors.date_admitted = 'Date admitted is required';
    if (!formData.time_received) newErrors.time_received = 'Time received is required';
    
    // Check Signature
    if (sigPadRef.current?.isEmpty()) {
      newErrors.signature = 'Signature is required to proceed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const tenantSlug = localStorage.getItem('tenantSlug') || 'default';

      // Get Signature Data URL
      const signatureData = sigPadRef.current?.toDataURL();

      const payload = {
        ...formData,
        age: formData.age ? parseInt(formData.age, 10) : null,
        signature: signatureData, // Append signature to payload
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
        title: 'Registration Successful!',
        message: 'Deceased record has been saved.',
      });

      setTimeout(() => {
        navigate(`/tenant/${tenantSlug}/all-deceased`);
      }, 2000);

    } catch (error) {
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drf-wrapper">
      <NotificationToast notification={notification} setNotification={setNotification} />

      {/* Header Card */}
      <div className="drf-header-card">
        <div className="drf-header-left">
          <div className="drf-header-icon">
            <UserPlus size={24} color="white" />
          </div>
          <div>
            <h1 className="drf-header-title">Register Deceased</h1>
            <p className="drf-header-subtitle">Fill in the required details to admit a body</p>
          </div>
        </div>
        <button 
          className="drf-btn-ghost"
          onClick={() => { setFormData(initialFormData); setErrors({}); sigPadRef.current?.clear(); }}
        >
          Clear Form
        </button>
      </div>

      {/* Main Form Card */}
      <div className="drf-main-card">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="drf-form">
          
          {/* Section 1: Admission Details */}
          <div className="drf-section">
            <div className="drf-section-title">
              <FileText size={18} />
              <span>Admission Details</span>
            </div>
            <div className="drf-grid drf-grid-2">
              <div className="drf-field">
                <label className="drf-label">Admission Number</label>
                <input 
                  type="text" 
                  name="admission_number" 
                  value={formData.admission_number} 
                  onChange={handleChange} 
                  className="drf-input" 
                  placeholder="Auto-generated or from permit"
                  readOnly // Often comes from backend/permit
                />
              </div>
              <div className="drf-field">
                <label className="drf-label">Date Admitted <span className="drf-required">*</span></label>
                <input 
                  type="date" 
                  name="date_admitted" 
                  value={formData.date_admitted} 
                  onChange={handleChange} 
                  className={`drf-input ${errors.date_admitted ? 'drf-input-error' : ''}`}
                />
                {errors.date_admitted && <span className="drf-error"><AlertTriangle size={12} />{errors.date_admitted}</span>}
              </div>
              <div className="drf-field drf-field-full">
                <label className="drf-label">Time Received <span className="drf-required">*</span></label>
                <input 
                  type="time" 
                  name="time_received" 
                  value={formData.time_received} 
                  onChange={handleChange} 
                  className={`drf-input ${errors.time_received ? 'drf-input-error' : ''}`}
                />
                {errors.time_received && <span className="drf-error"><AlertTriangle size={12} />{errors.time_received}</span>}
              </div>
            </div>
          </div>

          <div className="drf-divider" />

          {/* Section 2: Deceased Information */}
          <div className="drf-section">
            <div className="drf-section-title">
              <User size={18} />
              <span>Deceased Information</span>
            </div>
            <div className="drf-grid drf-grid-2">
              <div className="drf-field drf-field-full">
                <label className="drf-label">Full Name <span className="drf-required">*</span></label>
                <input 
                  type="text" 
                  name="full_name" 
                  value={formData.full_name} 
                  onChange={handleChange} 
                  className={`drf-input ${errors.full_name ? 'drf-input-error' : ''}`}
                  placeholder="Enter full name"
                />
                {errors.full_name && <span className="drf-error"><AlertTriangle size={12} />{errors.full_name}</span>}
              </div>

              <div className="drf-field">
                <label className="drf-label">Gender <span className="drf-required">*</span></label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange} 
                  className={`drf-select ${errors.gender ? 'drf-input-error' : ''}`}
                >
                  <option value="" disabled>Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {errors.gender && <span className="drf-error"><AlertTriangle size={12} />{errors.gender}</span>}
              </div>

              <div className="drf-field">
                <label className="drf-label">Age</label>
                <input 
                  type="number" 
                  name="age" 
                  value={formData.age} 
                  onChange={handleChange} 
                  className="drf-input" 
                  placeholder="e.g. 45"
                  min="0" max="150"
                />
              </div>

              <div className="drf-field">
                <label className="drf-label">Date of Birth</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="drf-input" />
              </div>

              <div className="drf-field">
                <label className="drf-label">Date of Death</label>
                <input type="date" name="date_of_death" value={formData.date_of_death} onChange={handleChange} className="drf-input" />
              </div>

              <div className="drf-field">
                <label className="drf-label">Body Status</label>
                <select name="body_status" value={formData.body_status} onChange={handleChange} className="drf-select">
                  <option value="" disabled>Select status</option>
                  <option value="In Morgue">In Morgue</option>
                  <option value="Pending Autopsy">Pending Autopsy</option>
                  <option value="Released">Released</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>

              <div className="drf-field drf-field-full">
                <label className="drf-label">Cause of Death (If Known)</label>
                <textarea 
                  name="cause_of_death" 
                  value={formData.cause_of_death} 
                  onChange={handleChange} 
                  className="drf-textarea" 
                  rows="2" 
                  placeholder="Brief description if known..."
                />
              </div>
            </div>
          </div>

          <div className="drf-divider" />

          {/* Section 3: Contact & Identification */}
          <div className="drf-section">
            <div className="drf-section-title">
              <FileText size={18} />
              <span>Contact & Identification</span>
            </div>
            <div className="drf-grid drf-grid-2">
              <div className="drf-field">
                <label className="drf-label">Contact Person Name</label>
                <input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} className="drf-input" placeholder="Next of kin / contact" />
              </div>
              <div className="drf-field">
                <label className="drf-label">ID Number</label>
                <input type="text" name="id_number" value={formData.id_number} onChange={handleChange} className="drf-input" placeholder="National ID / Passport" />
              </div>
              <div className="drf-field drf-field-full">
                <label className="drf-label">Tel Number</label>
                <input type="tel" name="tel_number" value={formData.tel_number} onChange={handleChange} className="drf-input" placeholder="+254 7XX XXX XXX" />
              </div>
            </div>
          </div>

          <div className="drf-divider" />

          {/* Section 4: Authorization / Signature */}
          <div className="drf-section">
            <div className="drf-section-title">
              <CheckCircle size={18} />
              <span>Authorization Signature</span>
            </div>
            <div className="drf-signature-wrapper">
              <ReusableSignaturePad 
                ref={sigPadRef}
                penColor="#1A1D24"
                placeholder="Sign here to authorize admission"
                showSave={false}
              />
              {errors.signature && (
                <span className="drf-error drf-error-sig">
                  <AlertTriangle size={12} />{errors.signature}
                </span>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="drf-actions">
            <button type="button" className="drf-btn-ghost" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="drf-btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="drf-spinner" />
                  Registering...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Register Deceased
                </>
              )}
            </button>
          </div>

        </form>
      </div>
      
      <div className="drf-footer-note">
        Fields marked with <span className="drf-required">*</span> are required. Signature is mandatory for submission.
      </div>
    </div>
  );
};

export default DeceasedRegistrationForm;