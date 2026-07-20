import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ENDPOINTS } from '../../../api/endpoints';
import env from '../../../utils/config/env';
import { ToastContainer, toast } from 'react-toastify';
import { getTenantSlug, getAuthToken } from '../../../utils/globalAuth';
import ReusableSignaturePad from '../../../utils/signature/signaturepad';
import {
  Check, Loader2, CheckCircle, X, FileText, User,
  RotateCcw, Mark, ShieldCheck, AlertCircle, ArrowRight
} from '../../../utils/icons/icons';
import LoginColors from '../../../utils/colors/index';

const C = LoginColors;

const Spinner = () => (
  <span className="spinner" />
);

const AlertMessage = ({ type, text }) => {
  if (!text) return null;

  const config = {
    error: { bg: C.redBg, color: C.red, border: C.redLine, icon: AlertCircle },
    success: { bg: C.successBg, color: C.success, border: '#DCE6D9', icon: CheckCircle },
  };
  const style = config[type] || config.error;
  const Icon = style.icon;

  return (
    <div className="alert-message" style={{ background: style.bg, color: style.color, borderColor: style.border }}>
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

  return (
    <div className="page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',sans-serif;color:${C.gray};background:${C.bone2};-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fraunces',serif;font-weight:500;letter-spacing:-0.01em;color:${C.ink}}

        .page-wrapper{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:${C.bone2}}

        /* Container — exact same as login */
        .login-container{width:100%;max-width:920px;display:flex;background:${C.white};border-radius:24px;overflow:hidden;box-shadow:0 40px 80px -20px rgba(21,23,26,0.12),0 10px 20px rgba(21,23,26,0.04);min-height:520px;max-height:92vh}

        /* Sidebar — exact same as login */
        .login-sidebar{width:380px;background:#000000;padding:3rem 2.5rem;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;flex-shrink:0}
        .sidebar-grid-bg{position:absolute;top:0;left:0;right:0;bottom:0;background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);background-size:40px 40px;pointer-events:none}
        .sidebar-glow{position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 30% 30%,rgba(61,79,71,0.3) 0%,transparent 60%);pointer-events:none}
        .sidebar-content{position:relative;z-index:1;color:${C.bone};height:100%;display:flex;flex-direction:column}
        .sidebar-logo{display:flex;align-items:center;gap:0.7rem;font-family:'Fraunces',serif;font-size:1.3rem;color:${C.bone};margin-bottom:3rem}
        .sidebar-headline{font-family:'Fraunces',serif;font-size:1.8rem;line-height:1.3;margin-bottom:1rem;color:${C.bone}}
        .sidebar-text{font-size:0.9rem;color:rgba(255,255,255,0.6);line-height:1.6}
        .sidebar-footer{font-family:'JetBrains Mono',monospace;font-size:0.7rem;color:rgba(255,255,255,0.3);letter-spacing:0.05em;margin-top:auto}

        /* Form area — same base, scrollable */
        .login-form{flex:1;padding:2.5rem 3rem;display:flex;flex-direction:column;overflow-y:auto}
        .login-form::-webkit-scrollbar{width:4px}
        .login-form::-webkit-scrollbar-track{background:transparent}
        .login-form::-webkit-scrollbar-thumb{background:${C.line};border-radius:2px}
        .login-form::-webkit-scrollbar-thumb:hover{background:${C.gray}}

        /* Header — same as login */
        .form-header{margin-bottom:1.5rem;flex-shrink:0}
        .form-header h1{font-size:1.8rem;margin-bottom:0.5rem}
        .form-header p{font-size:0.95rem;color:${C.gray}}

        /* Labels — exact same as login */
        .form-label{display:block;font-family:'JetBrains Mono',monospace;font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;color:${C.brass};margin-bottom:0.5rem;font-weight:500}
        .form-label .req{color:${C.red}}

        /* Form group — same spacing */
        .form-group{margin-bottom:1rem}

        /* Input wrapper — exact same as login */
        .input-wrapper{position:relative;border:1px solid ${C.line};border-radius:8px;background:${C.bone2};transition:all 0.2s}
        .input-wrapper.error{border-color:${C.red}}
        .input-wrapper:focus-within{border-color:${C.brass};background:${C.white};box-shadow:0 0 0 3px rgba(139,115,85,0.12)}
        .input-wrapper.readonly{background:${C.line};opacity:0.7}

        /* Input — exact same as login */
        .form-input{width:100%;padding:0.8rem 1rem;background:transparent;border:none;border-radius:8px;font-size:0.88rem;color:${C.ink};font-family:'Inter',sans-serif;outline:none}
        .form-input::placeholder{color:${C.gray}}
        .form-input:disabled{cursor:not-allowed;opacity:0.6}
        .form-input option{background:${C.white};color:${C.ink}}
        .form-input[type="date"],.form-input[type="time"]{color-scheme:light}

        /* Error text — same as login */
        .form-error{display:block;color:${C.red};font-size:0.75rem;margin-top:0.3rem}

        /* Alert message — exact same as login */
        .alert-message{display:flex;align-items:center;gap:0.6rem;padding:0.8rem 1rem;border-radius:8px;border:1px solid;font-size:0.85rem;font-weight:500;margin-bottom:1rem;flex-shrink:0}

        /* Section divider — uses same tokens */
        .form-section{margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid ${C.line}}
        .form-section:last-of-type{border-bottom:none;margin-bottom:0;padding-bottom:0}
        .form-section-title{display:flex;align-items:center;gap:0.5rem;font-family:'JetBrains Mono',monospace;font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;color:${C.brass};margin-bottom:1rem;font-weight:500}
        .form-section-title svg{opacity:0.7}

        /* Grid */
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .form-grid .span-full{grid-column:1/-1}

        /* Textarea */
        .form-textarea{resize:vertical;min-height:60px}

        /* Signature wrapper — matches input-wrapper pattern */
        .sig-wrapper{border:1px solid ${C.line};border-radius:8px;background:${C.bone2};padding:0.5rem;transition:all 0.2s;height:150px;overflow:hidden}
        .sig-wrapper.error{border-color:${C.red}}
        .sig-wrapper:focus-within{border-color:${C.brass};background:${C.white};box-shadow:0 0 0 3px rgba(139,115,85,0.12)}

        /* Buttons — exact same submit as login */
        .btn-submit{width:100%;padding:0.9rem 1.2rem;font-size:0.9rem;font-weight:600;font-family:'Inter',sans-serif;border:none;border-radius:8px;background:${C.ink};color:${C.bone};cursor:pointer;transition:all 0.3s ease;display:flex;align-items:center;justify-content:center;gap:0.5rem}
        .btn-submit:hover{background:${C.verdigris};transform:translateY(-1px);box-shadow:0 10px 20px rgba(21,23,26,0.15)}
        .btn-submit:disabled{background:${C.gray};cursor:not-allowed;opacity:0.6;transform:none;box-shadow:none}

        /* Cancel button — subtle, same radius & font */
        .btn-cancel{padding:0.9rem 1.5rem;font-size:0.9rem;font-weight:500;font-family:'Inter',sans-serif;border:1px solid ${C.line};border-radius:8px;background:transparent;color:${C.gray};cursor:pointer;transition:all 0.2s;white-space:nowrap}
        .btn-cancel:hover{border-color:${C.ink};color:${C.ink}}
        .btn-cancel:disabled{opacity:0.5;cursor:not-allowed}

        /* Action row */
        .form-actions{display:flex;gap:0.75rem;margin-top:1.5rem;flex-shrink:0}
        .btn-submit-wrap{flex:1}

        /* Links — same as login */
        .form-links{display:flex;justify-content:space-between;align-items:center;margin-top:1rem;flex-shrink:0}
        .text-link{background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:0.85rem;font-weight:500;padding:0.2rem;transition:color 0.2s;display:flex;align-items:center;gap:0.3rem}
        .text-link.brass{color:${C.brass}}
        .text-link.brass:hover{color:${C.brassLight}}

        /* Footer — same as login */
        .form-footer{margin-top:1.5rem;padding-top:1rem;border-top:1px solid ${C.line};text-align:center;font-size:0.8rem;color:${C.gray};flex-shrink:0}
        .encrypted-badge{display:flex;align-items:center;justify-content:center;gap:0.4rem;margin-top:0.75rem;font-size:0.7rem;font-family:'JetBrains Mono',monospace;color:${C.gray};opacity:0.6}

        /* Spinner — exact same as login */
        .spinner{width:16px;height:16px;border:2px solid rgba(250,248,244,0.3);border-top-color:${C.bone};border-radius:50%;animation:spin 0.65s linear infinite;display:inline-block}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes popIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}

        /* Success Modal — exact same as login */
        .modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(21,23,26,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000;animation:fadeIn 0.3s ease both}
        .modal-card{background:${C.white};border-radius:16px;padding:2.5rem 2rem;text-align:center;max-width:360px;width:90%;animation:popIn 0.4s cubic-bezier(0.16,1,0.3,1) both;box-shadow:0 40px 80px rgba(21,23,26,0.3)}
        .modal-icon{width:56px;height:56px;border-radius:50%;background:${C.successBg};display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;color:${C.success}}
        .modal-title{font-family:'Fraunces',serif;font-size:1.4rem;color:${C.ink};margin-bottom:0.5rem;font-weight:500}
        .modal-text{font-size:0.9rem;color:${C.gray};margin-bottom:1.5rem}
        .modal-progress{width:60%;height:4px;background:${C.line};border-radius:2px;margin:0 auto;overflow:hidden}
        .modal-progress-bar{width:100%;height:100%;background:${C.verdigris};border-radius:2px;animation:shimmer 1.2s ease infinite;background-size:200% 100%}

        /* Responsive — same breakpoints as login */
        @media(max-width:768px){
          .login-container{flex-direction:column;max-width:420px;max-height:none}
          .login-sidebar{width:100%;padding:2rem;min-height:auto}
          .sidebar-logo{margin-bottom:1.5rem}
          .sidebar-headline{font-size:1.4rem}
          .login-form{padding:2rem}
          .form-grid{grid-template-columns:1fr}
        }
        @media(max-width:480px){
          .page-wrapper{padding:0}
          .login-container{border-radius:0;min-height:100vh}
          .login-sidebar{padding:1.5rem}
          .sidebar-headline{display:none}
          .sidebar-text{display:none}
          .login-form{padding:1.5rem}
          .form-header h1{font-size:1.5rem}
        }
      `}</style>

      <ToastContainer position="top-right" />
      <div className="login-container">
        {/* Sidebar — same structure as login */}
        <div className="login-sidebar">
          <div className="sidebar-grid-bg"></div>
          <div className="sidebar-glow"></div>
          <div className="sidebar-content">
            <div className="sidebar-logo">
              <Mark size={28} color={C.brassLight} />
              Rest Point
            </div>
            <div>
              <h2 className="sidebar-headline">Register a <br />new admission.</h2>
              <p className="sidebar-text">Complete the form to record deceased information into the morgue registry.</p>
            </div>
            <div className="sidebar-footer">
              WELT TALLIS TECHNOLOGIES
            </div>
          </div>
        </div>

        {/* Form — same structure as login */}
        <div className="login-form">
          <div className="form-header">
            <h1>Register Deceased</h1>
            <p>Fill in the required details to admit a body.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <AlertMessage type={message.type} text={message.text} />

            {/* ── Admission Details ── */}
            <div className="form-section">
              <div className="form-section-title">
                <FileText size={14} />
                <span>Admission Details</span>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Admission Number</label>
                  <div className="input-wrapper readonly">
                    <input
                      type="text"
                      name="admission_number"
                      value={formData.admission_number}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Auto or from permit"
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
                      style={{ color: formData.gender ? C.ink : C.gray }}
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
                    <select
                      name="body_status"
                      value={formData.body_status}
                      onChange={handleChange}
                      className="form-input"
                      disabled={loading}
                      style={{ color: formData.body_status ? C.ink : C.gray }}
                    >
                      <option value="" disabled>Select status</option>
                      <option value="In Morgue">In Morgue</option>
                      <option value="Pending Autopsy">Pending Autopsy</option>
                      <option value="Released">Released</option>
                      <option value="Transferred">Transferred</option>
                    </select>
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
                <FileText size={14} />
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
                  <div className="input-wrapper">
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
                </div>
                <div className="form-group span-full">
                  <label className="form-label">Tel Number</label>
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
                <span>Authorization Signature</span>
              </div>
              <div className={`sig-wrapper ${errors.signature ? 'error' : ''}`}>
                <ReusableSignaturePad
                  ref={sigPadRef}
                  penColor="#1A1D24"
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
                      <Spinner />
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
          </form>

          {/* Links — same pattern as login */}
          <div className="form-links">
            <button onClick={handleClear} className="text-link brass" type="button" disabled={loading}>
              <RotateCcw size={14} />
              Clear form
            </button>
          </div>

          {/* Footer — exact same as login */}
          <div className="form-footer">
            <span><span className="req" style={{ color: C.red }}>*</span> Required fields. Signature is mandatory.</span>
            <div className="encrypted-badge">
              <ShieldCheck size={12} />
              <span>Encrypted connection</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>© 2026 Rest Point</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal — exact same as login */}
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
    </div>
  );
}