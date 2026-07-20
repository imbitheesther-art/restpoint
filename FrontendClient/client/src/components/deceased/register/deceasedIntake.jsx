import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ENDPOINTS } from '../../../api/endpoints';
import env from '../../../utils/config/env';
import { ToastContainer } from 'react-toastify';

import { showToast } from '../../utils/toast';
import { getTenantSlug, getAuthToken } from '../../utils/globalAuth';

import ReusableSignaturePad from '../../../utils/signature/signaturepad';
import { UserPlus, Check, Loader2, AlertTriangle, XCircle, CheckCircle, X, FileText, Clock, User, ArrowLeft, RotateCcw } from '../../utils/icons/icons';
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
      {notification.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
      <div className="drf-toast-content">
        <span className="drf-toast-title">{notification.title}</span>
        <span className="drf-toast-message">{notification.message}</span>
      </div>
      <button className="drf-toast-close" onClick={() => setNotification(prev => ({ ...prev, isVisible: false }))}>
        <X size={14} />
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

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const initialFormData = {
    admission_number: location.state?.permitNumber || '',
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
      const tenantSlug = getTenantSlug();
      const token = getAuthToken();
      const signatureData = sigPadRef.current?.toDataURL();

      const payload = {
        full_name: formData.full_name,
        cause_of_death: formData.cause_of_death,
        date_of_birth: formData.date_of_birth || null,
        national_id: formData.id_number,
        received_from: formData.contact_person,
        age: formData.age ? parseInt(formData.age, 10) : 0,
        time_received: formData.time_received,
        body_status: formData.body_status || 'In Morgue',
        contact_person: formData.contact_person,
        tell_no: formData.tel_number,
        gender: formData.gender,
        date_of_death: formData.date_of_death || null,
        signature: signatureData,
      };

      const response = await fetch(`${env.FULL_API_URL}${ENDPOINTS.DECEASED.CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-slug': tenantSlug,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      showToast.success(`Deceased ${formData.full_name} registered successfully!`);
      setNotification({
        isVisible: true,
        type: 'success',
        title: 'Registration Successful',
        message: 'Deceased record has been saved.',
      });

      setTimeout(() => {
        navigate(`/tenant/${tenantSlug}/all-deceased`);
      }, 2000);

    } catch (error) {
      showToast.error(error.message || 'Registration failed');
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

  const handleClear = () => {
    setFormData(initialFormData);
    setErrors({});
    sigPadRef.current?.clear();
  };

  return (
    <div className="drf-wrapper">
      <ToastContainer position="top-right" />
      <NotificationToast notification={notification} setNotification={setNotification} />

      {/* Header */}
      <div className="drf-header">
        <div className="drf-header-left">
          <button className="drf-back-btn" onClick={() => navigate(-1)} type="button">
            <ArrowLeft size={18} />
          </button>
          <div className="drf-header-text">
            <h1 className="drf-header-title">Register Deceased</h1>
            <p className="drf-header-sub">Fill in the required details to admit a body</p>
          </div>
        </div>
        <button className="drf-clear-btn" onClick={handleClear} type="button">
          <RotateCcw size={14} />
          <span>Clear</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="drf-form" noValidate>

        {/* Admission Details */}
        <div className="drf-card">
          <div className="drf-card-header">
            <FileText size={15} />
            <span>Admission Details</span>
          </div>
          <div className="drf-grid">
            <div className="drf-field">
              <label className="drf-label">Admission Number</label>
              <input
                type="text"
                name="admission_number"
                value={formData.admission_number}
                onChange={handleChange}
                className="drf-input drf-input-readonly"
                placeholder="Auto or from permit"
                readOnly
              />
            </div>
            <div className="drf-field">
              <label className="drf-label">Date Admitted <span className="drf-req">*</span></label>
              <input
                type="date"
                name="date_admitted"
                value={formData.date_admitted}
                onChange={handleChange}
                className={`drf-input ${errors.date_admitted ? 'drf-input-err' : ''}`}
              />
              {errors.date_admitted && <span className="drf-err">{errors.date_admitted}</span>}
            </div>
            <div className="drf-field">
              <label className="drf-label">Time Received <span className="drf-req">*</span></label>
              <input
                type="time"
                name="time_received"
                value={formData.time_received}
                onChange={handleChange}
                className={`drf-input ${errors.time_received ? 'drf-input-err' : ''}`}
              />
              {errors.time_received && <span className="drf-err">{errors.time_received}</span>}
            </div>
          </div>
        </div>

        {/* Deceased Information */}
        <div className="drf-card">
          <div className="drf-card-header">
            <User size={15} />
            <span>Deceased Information</span>
          </div>
          <div className="drf-grid">
            <div className="drf-field drf-span-full">
              <label className="drf-label">Full Name <span className="drf-req">*</span></label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={`drf-input ${errors.full_name ? 'drf-input-err' : ''}`}
                placeholder="Enter full name"
              />
              {errors.full_name && <span className="drf-err">{errors.full_name}</span>}
            </div>
            <div className="drf-field">
              <label className="drf-label">Gender <span className="drf-req">*</span></label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`drf-input ${errors.gender ? 'drf-input-err' : ''}`}
              >
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && <span className="drf-err">{errors.gender}</span>}
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
                min="0"
                max="150"
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
              <select name="body_status" value={formData.body_status} onChange={handleChange} className="drf-input">
                <option value="" disabled>Select status</option>
                <option value="In Morgue">In Morgue</option>
                <option value="Pending Autopsy">Pending Autopsy</option>
                <option value="Released">Released</option>
                <option value="Transferred">Transferred</option>
              </select>
            </div>
            <div className="drf-field drf-span-full">
              <label className="drf-label">Cause of Death</label>
              <textarea
                name="cause_of_death"
                value={formData.cause_of_death}
                onChange={handleChange}
                className="drf-input drf-textarea"
                rows="2"
                placeholder="Brief description if known..."
              />
            </div>
          </div>
        </div>

        {/* Contact & Identification */}
        <div className="drf-card">
          <div className="drf-card-header">
            <FileText size={15} />
            <span>Contact & Identification</span>
          </div>
          <div className="drf-grid">
            <div className="drf-field">
              <label className="drf-label">Contact Person</label>
              <input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} className="drf-input" placeholder="Next of kin" />
            </div>
            <div className="drf-field">
              <label className="drf-label">ID Number</label>
              <input type="text" name="id_number" value={formData.id_number} onChange={handleChange} className="drf-input" placeholder="National ID / Passport" />
            </div>
            <div className="drf-field drf-span-full">
              <label className="drf-label">Tel Number</label>
              <input type="tel" name="tel_number" value={formData.tel_number} onChange={handleChange} className="drf-input" placeholder="+254 7XX XXX XXX" />
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="drf-card">
          <div className="drf-card-header">
            <CheckCircle size={15} />
            <span>Authorization Signature</span>
          </div>
          <div className="drf-sig-wrap">
            <ReusableSignaturePad
              ref={sigPadRef}
              penColor="#1A1D24"
              placeholder="Sign here to authorize admission"
              showSave={false}
            />
            {errors.signature && (
              <span className="drf-err drf-sig-err">{errors.signature}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="drf-actions">
          <button type="button" className="drf-btn-cancel" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="drf-btn-submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={15} className="drf-spin" />
                Registering...
              </>
            ) : (
              <>
                <Check size={15} />
                Register Deceased
              </>
            )}
          </button>
        </div>

      </form>

      <p className="drf-footer">
        <span className="drf-req">*</span> Required fields. Signature is mandatory.
      </p>
    </div>
  );
};

export default DeceasedRegistrationForm;