import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ENDPOINTS } from '../../../api/endpoints';
import env from '../../../utils/config/env';
import { ToastContainer, toast } from 'react-toastify';
import { getTenantSlug, getAuthToken } from '../../../utils/globalAuth';
import ReusableSignaturePad from '../../../utils/signature/signaturepad';
import { IDScannerComponent } from '../../../utils/idScanner.jsx?t=20250620';
import {
  Check, Loader2, CheckCircle, X, FileText, User,
  RotateCcw, Mark, ShieldCheck, AlertCircle, ArrowRight, Calendar, Clock, Phone, IdCard, ScanBarcode
} from '../../../utils/icons/icons';
import LoginColors from '../../../utils/colors/index';

const C = LoginColors;

const Spinner = () => (
  <span className="spinner" />
);

const AlertMessage = ({ type, text }) => {
  if (!text) return null;

  const config = {
    error: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', icon: AlertCircle },
    success: { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', icon: CheckCircle },
  };
  const style = config[type] || config.error;
  const Icon = style.icon;

  return (
    <div className="alert-message">
      <Icon size={16} />
      <span>{text}</span>
    </div>
  );
};

export default function DeceasedRegistrationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const sigPadRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showIdScanner, setShowIdScanner] = useState(false);

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
    if (message.text) setMessage({ type: '', text: '' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

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

      toast.success(`Deceased ${formData.full_name} registered successfully!`);
      setShowSuccess(true);

      setTimeout(() => {
        navigate(`/tenant/${tenantSlug}/all-deceased`, { replace: true });
      }, 2000);

    } catch (error) {
      toast.error(error.message || 'Registration failed');
      setMessage({
        type: 'error',
        text: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      ...initialFormData,
      time_received: getCurrentTime(),
    });
    setErrors({});
    setMessage({ type: '', text: '' });
    sigPadRef.current?.clear();
  };

  const handleIdScanComplete = (scanResult) => {
    if (scanResult.success && scanResult.parsedFields) {
      const { idNumber, fullName, dateOfBirth, gender } = scanResult.parsedFields;

      setFormData(prev => ({
        ...prev,
        id_number: idNumber || prev.id_number,
        full_name: fullName || prev.full_name,
        date_of_birth: dateOfBirth || prev.date_of_birth,
        gender: gender || prev.gender,
      }));

      toast.success('ID card scanned successfully!');
    } else {
      toast.error('Failed to scan ID card. Please try again.');
    }
    setShowIdScanner(false);
  };

  return (
    <div className="page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          background: #F8FAFC;
          color: #1E293B;
        }
        
        .page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);
        }
        
        .form-container {
          width: 100%;
          max-width: 720px;
          background: #FFFFFF;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
          padding: 2.5rem 3rem;
          max-height: 94vh;
          overflow-y: auto;
        }
        
        .form-container::-webkit-scrollbar {
          width: 4px;
        }
        .form-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .form-container::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 2px;
        }
        .form-container::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
        
        /* Header */
        .form-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #F1F5F9;
        }
        
        .form-header-top {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        
        .form-header-top svg {
          color: #3B82F6;
        }
        
        .form-header h1 {
          font-family: 'Fraunces', serif;
          font-size: 2rem;
          font-weight: 600;
          color: #0F172A;
          letter-spacing: -0.02em;
          margin: 0;
        }
        
        .form-header p {
          font-size: 0.95rem;
          color: #64748B;
          margin: 0.25rem 0 0 0;
        }
        
        .form-header .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.75rem;
          background: #EFF6FF;
          color: #2563EB;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }
        
        /* Sections */
        .form-section {
          margin-bottom: 1.75rem;
          padding-bottom: 1.75rem;
          border-bottom: 1px solid #F1F5F9;
        }
        .form-section:last-of-type {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .form-section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748B;
          margin-bottom: 1.25rem;
        }
        
        .form-section-title svg {
          color: #3B82F6;
        }
        
        /* Grid */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-grid .span-full {
          grid-column: 1 / -1;
        }
        
        /* Form Group */
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        
        .form-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .form-label .req {
          color: #EF4444;
          font-weight: 700;
        }
        
        .form-label .optional {
          font-size: 0.65rem;
          font-weight: 400;
          color: #94A3B8;
        }
        
        /* Input Wrapper */
        .input-wrapper {
          position: relative;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          background: #F8FAFC;
          transition: all 0.2s ease;
        }
        
        .input-wrapper:hover {
          border-color: #94A3B8;
        }
        
        .input-wrapper:focus-within {
          border-color: #3B82F6;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
        }
        
        .input-wrapper.error {
          border-color: #EF4444;
        }
        
        .input-wrapper.error:focus-within {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.08);
        }
        
        .input-wrapper.disabled {
          background: #F1F5F9;
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .input-wrapper .input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          pointer-events: none;
        }
        
        .input-wrapper .input-icon.textarea-icon {
          top: 0.75rem;
          transform: none;
        }
        
        .form-input {
          width: 100%;
          padding: 0.7rem 1rem;
          background: transparent;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          color: #0F172A;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: all 0.2s;
        }
        
        .form-input.with-icon {
          padding-left: 2.5rem;
        }
        
        .form-input::placeholder {
          color: #94A3B8;
        }
        
        .form-input:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .form-input[type="date"],
        .form-input[type="time"] {
          color-scheme: light;
        }
        
        .form-input[type="date"]::-webkit-calendar-picker-indicator,
        .form-input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
          cursor: pointer;
        }
        
        .form-textarea {
          resize: vertical;
          min-height: 60px;
          line-height: 1.5;
        }
        
        .form-error {
          font-size: 0.75rem;
          color: #EF4444;
          margin-top: 0.25rem;
          font-weight: 500;
        }
        
        /* Alert */
        .alert-message {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: 1px solid;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 1.25rem;
        }
        
        /* Signature */
        .sig-wrapper {
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          background: #F8FAFC;
          padding: 0.5rem;
          transition: all 0.2s ease;
          height: 140px;
          overflow: hidden;
        }
        
        .sig-wrapper:hover {
          border-color: #94A3B8;
        }
        
        .sig-wrapper:focus-within {
          border-color: #3B82F6;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
        }
        
        .sig-wrapper.error {
          border-color: #EF4444;
        }
        
        .sig-wrapper.error:focus-within {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.08);
        }
        
        .sig-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #94A3B8;
          font-size: 0.85rem;
          font-weight: 400;
          pointer-events: none;
        }
        
        /* Buttons */
        .form-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.75rem;
          padding-top: 1.75rem;
          border-top: 1px solid #F1F5F9;
        }
        
        .btn-cancel {
          padding: 0.75rem 1.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          background: transparent;
          color: #64748B;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        .btn-cancel:hover:not(:disabled) {
          border-color: #94A3B8;
          color: #0F172A;
          background: #F8FAFC;
        }
        
        .btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-submit-wrap {
          flex: 1;
        }
        
        .btn-submit {
          width: 100%;
          padding: 0.75rem 1.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          border: none;
          border-radius: 10px;
          background: #0F172A;
          color: #FFFFFF;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .btn-submit:hover:not(:disabled) {
          background: #1E293B;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.15);
        }
        
        .btn-submit:active:not(:disabled) {
          transform: scale(0.98);
        }
        
        .btn-submit:disabled {
          background: #94A3B8;
          cursor: not-allowed;
          opacity: 0.6;
          transform: none;
          box-shadow: none;
        }
        
        .btn-submit .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
          display: inline-block;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Form links */
        .form-links {
          display: flex;
          justify-content: flex-end;
          margin-top: 1rem;
        }
        
        .text-link {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          color: #64748B;
          padding: 0.25rem 0.5rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .text-link:hover {
          color: #0F172A;
        }
        
        /* Footer */
        .form-footer {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #F1F5F9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: #94A3B8;
        }
        
        .form-footer .req-note {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .form-footer .req-note .star {
          color: #EF4444;
        }
        
        .form-footer .encrypted {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
        }
        
        .form-footer .encrypted svg {
          opacity: 0.6;
        }
        
        /* Success Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease both;
        }
        
        .modal-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 2.5rem 2rem;
          text-align: center;
          max-width: 360px;
          width: 90%;
          animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
          box-shadow: 0 40px 80px rgba(15, 23, 42, 0.3);
        }
        
        .modal-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #F0FDF4;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: #16A34A;
        }
        
        .modal-title {
          font-family: 'Fraunces', serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: #0F172A;
          margin-bottom: 0.5rem;
        }
        
        .modal-text {
          font-size: 0.9rem;
          color: #64748B;
          margin-bottom: 1.5rem;
        }
        
        .modal-progress {
          width: 60%;
          height: 4px;
          background: #F1F5F9;
          border-radius: 2px;
          margin: 0 auto;
          overflow: hidden;
        }
        
        .modal-progress-bar {
          width: 100%;
          height: 100%;
          background: #3B82F6;
          border-radius: 2px;
          animation: shimmer 1.2s ease infinite;
          background-size: 200% 100%;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        /* Responsive */
        @media (max-width: 640px) {
          .page-wrapper {
            padding: 1rem;
          }
          .form-container {
            padding: 1.5rem;
            border-radius: 16px;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .form-header h1 {
            font-size: 1.5rem;
          }
          .form-actions {
            flex-direction: column;
          }
          .btn-cancel {
            order: 2;
          }
          .btn-submit-wrap {
            order: 1;
          }
          .form-footer {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }
        }
        
        @media (max-width: 480px) {
          .page-wrapper {
            padding: 0.5rem;
          }
          .form-container {
            padding: 1rem;
            border-radius: 12px;
          }
          .form-header h1 {
            font-size: 1.25rem;
          }
        }
      `}</style>

      <ToastContainer position="top-right" />

      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <div className="form-header-top">
            <FileText size={20} />
            <h1>Register Deceased</h1>
          </div>
          <p>Complete the form to record deceased information into the morgue registry.</p>
          <div className="badge">
            <AlertCircle size={12} />
            All fields marked with <span style={{ color: '#EF4444' }}>*</span> are required
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <AlertMessage type={message.type} text={message.text} />

          {/* ── Admission Details ── */}
          <div className="form-section">
            <div className="form-section-title">
              <Calendar size={14} />
              <span>Admission Details</span>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Admission Number</label>
                <div className="input-wrapper disabled">
                  <input
                    type="text"
                    name="admission_number"
                    value={formData.admission_number}
                    className="form-input"
                    placeholder="Auto-generated"
                    readOnly
                    disabled
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Date Admitted <span className="req">*</span></label>
                <div className={`input-wrapper ${errors.date_admitted ? 'error' : ''}`}>
                  <input
                    type="date"
                    name="date_admitted"
                    value={formData.date_admitted}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
                {errors.date_admitted && <span className="form-error">{errors.date_admitted}</span>}
              </div>
              <div className="form-group span-full">
                <label className="form-label">Time Received <span className="req">*</span></label>
                <div className={`input-wrapper ${errors.time_received ? 'error' : ''}`}>
                  <input
                    type="time"
                    name="time_received"
                    value={formData.time_received}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
                {errors.time_received && <span className="form-error">{errors.time_received}</span>}
              </div>
            </div>
          </div>

          {/* ── Deceased Information ── */}
          <div className="form-section">
            <div className="form-section-title">
              <User size={14} />
              <span>Deceased Information</span>
            </div>
            <div className="form-grid">
              <div className="form-group span-full">
                <label className="form-label">Full Name <span className="req">*</span></label>
                <div className={`input-wrapper ${errors.full_name ? 'error' : ''}`}>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter full name"
                    disabled={loading}
                  />
                </div>
                {errors.full_name && <span className="form-error">{errors.full_name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Gender <span className="req">*</span></label>
                <div className={`input-wrapper ${errors.gender ? 'error' : ''}`}>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loading}
                    style={{ color: formData.gender ? '#0F172A' : '#94A3B8' }}
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                {errors.gender && <span className="form-error">{errors.gender}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. 45"
                    min="0"
                    max="150"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <div className="input-wrapper">
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Death</label>
                <div className="input-wrapper">
                  <input
                    type="date"
                    name="date_of_death"
                    value={formData.date_of_death}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Body Status</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="body_status"
                    value={formData.body_status}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. In Morgue, Pending Autopsy"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-group span-full">
                <label className="form-label">Cause of Death</label>
                <div className="input-wrapper">
                  <textarea
                    name="cause_of_death"
                    value={formData.cause_of_death}
                    onChange={handleChange}
                    className="form-input form-textarea"
                    rows="2"
                    placeholder="Brief description if known..."
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Contact & Identification ── */}
          <div className="form-section">
            <div className="form-section-title">
              <Phone size={14} />
              <span>Contact &amp; Identification</span>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Next of kin"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">ID Number</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="input-wrapper" style={{ flex: 1 }}>
                    <input
                      type="text"
                      name="id_number"
                      value={formData.id_number}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="National ID / Passport"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowIdScanner(true)}
                    disabled={loading}
                    style={{
                      padding: '0.7rem 1rem',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 10,
                      background: '#F8FAFC',
                      color: '#64748B',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                    title="Scan ID Card"
                  >
                    <ScanBarcode size={16} />
                    Scan
                  </button>
                </div>
              </div>
              <div className="form-group span-full">
                <label className="form-label">Phone Number</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    name="tel_number"
                    value={formData.tel_number}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+254 7XX XXX XXX"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Signature ── */}
          <div className="form-section">
            <div className="form-section-title">
              <CheckCircle size={14} />
              <span>Authorization Signature <span className="req">*</span></span>
            </div>
            <div className={`sig-wrapper ${errors.signature ? 'error' : ''}`}>
              <ReusableSignaturePad
                ref={sigPadRef}
                penColor="#0F172A"
                placeholder="Sign here to authorize admission"
                showSave={false}
              />
            </div>
            {errors.signature && (
              <span className="form-error" style={{ marginTop: '0.5rem' }}>{errors.signature}</span>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </button>
            <div className="btn-submit-wrap">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Register Deceased</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Links ── */}
          <div className="form-links">
            <button onClick={handleClear} className="text-link" type="button" disabled={loading}>
              <RotateCcw size={14} />
              Clear form
            </button>
          </div>

          {/* ── Footer ── */}
          <div className="form-footer">
            <span className="req-note">
              <span className="star">*</span> Required fields. Signature is mandatory.
            </span>
            <span className="encrypted">
              <ShieldCheck size={12} />
              <span>Encrypted</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>© 2026 Rest Point</span>
            </span>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-icon">
              <CheckCircle size={28} />
            </div>
            <h3 className="modal-title">Registration Complete</h3>
            <p className="modal-text">{formData.full_name} has been added to the registry. Redirecting...</p>
            <div className="modal-progress">
              <div className="modal-progress-bar"></div>
            </div>
          </div>
        </div>
      )}

      {/* ID Scanner Modal */}
      {showIdScanner && (
        <IDScannerComponent
          onScanComplete={handleIdScanComplete}
          onClose={() => setShowIdScanner(false)}
          autoCapture={true}
          captureDelay={3000}
        />
      )}
    </div>
  );
}
