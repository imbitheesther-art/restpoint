import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../../api/endpoints';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO, isValid } from 'date-fns';
import {
  UserPlus,
  Check,
  Loader2,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Calendar as CalendarIcon,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';

// ============================================================
// CUSTOM DATE PICKER WITH IMPROVED UX
// ============================================================

const CustomDatePicker = ({
  selectedDate,
  onChange,
  maxDate = new Date(),
  placeholder = "Select Date",
  error = null,
  label,
  required,
  name
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateValue, setDateValue] = useState(null);
  const datePickerRef = useRef(null);

  useEffect(() => {
    if (selectedDate) {
      let dateObj = selectedDate;
      if (typeof selectedDate === 'string') {
        dateObj = parseISO(selectedDate);
      }
      if (isValid(dateObj)) {
        setDateValue(dateObj);
      } else {
        setDateValue(null);
      }
    } else {
      setDateValue(null);
    }
  }, [selectedDate]);

  const handleChange = (date) => {
    if (date) {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      setDateValue(normalizedDate);
      onChange(normalizedDate);
      setIsOpen(false);
    } else {
      setDateValue(null);
      onChange(null);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setDateValue(null);
    onChange(null);
  };

  const formatDateDisplay = (date) => {
    if (!date) return placeholder;
    if (typeof date === 'string') {
      const parsed = parseISO(date);
      if (isValid(parsed)) {
        return format(parsed, 'MMM d, yyyy');
      }
      return placeholder;
    }
    if (isValid(date)) {
      return format(date, 'MMM d, yyyy');
    }
    return placeholder;
  };

  const CustomInput = React.forwardRef(({ value, onClick, onChange }, ref) => (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={ref}
        type="text"
        value={dateValue ? formatDateDisplay(dateValue) : ''}
        onClick={onClick}
        onChange={onChange}
        placeholder={placeholder}
        readOnly
        style={{
          width: '100%',
          padding: '12px 40px 12px 16px',
          border: `2px solid ${error ? '#EF4444' : '#E8ECF0'}`,
          borderRadius: '10px',
          fontSize: '14px',
          cursor: 'pointer',
          backgroundColor: '#FFFFFF',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          color: '#1A1D24',
          fontFamily: "'Inter', sans-serif",
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
      <CalendarIcon
        size={18}
        style={{
          position: 'absolute',
          right: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#9CA3AF',
          pointerEvents: 'none'
        }}
      />
      {dateValue && (
        <button
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '38px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9CA3AF',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
        >
          <X size={14} />
        </button>
      )}
    </div>
  ));

  CustomInput.displayName = 'CustomInput';

  return (
    <div style={{ marginBottom: '16px', overflow: 'visible', width: '100%' }}>
      {label && (
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
      )}
      <DatePicker
        ref={datePickerRef}
        selected={dateValue}
        onChange={handleChange}
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={() => setIsOpen(false)}
        maxDate={maxDate}
        dateFormat="MMM d, yyyy"
        placeholderText={placeholder}
        customInput={<CustomInput />}
        popperPlacement="bottom-start"
        popperModifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport',
            },
          },
        ]}
        calendarClassName="restpoint-calendar"
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        yearDropdownItemNumber={150}
        scrollableYearDropdown
        minDate={new Date(1400, 0, 1)}
        wrapperClassName="date-picker-wrapper"
        shouldCloseOnSelect
        open={isOpen}
      />
      {error && (
        <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangle size={12} />
          {error}
        </div>
      )}
      <style>{`
        /* ============================================================
           RESTPOINT CALENDAR STYLES - IMPROVED UX
           ============================================================ */
        
        .restpoint-calendar {
          border: 1px solid #E8ECF0 !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
          font-family: 'Inter', sans-serif !important;
          background: #FFFFFF !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        
        /* Header */
        .restpoint-calendar .react-datepicker__header {
          background: #FAFBFC !important;
          border-bottom: 1px solid #E8ECF0 !important;
          padding: 16px 16px 12px !important;
          border-radius: 12px 12px 0 0 !important;
        }
        
        .restpoint-calendar .react-datepicker__current-month {
          font-weight: 600 !important;
          font-size: 15px !important;
          color: #1A1D24 !important;
          font-family: 'Inter', sans-serif !important;
        }
        
        /* Day names */
        .restpoint-calendar .react-datepicker__day-name {
          color: #6B7280 !important;
          font-weight: 600 !important;
          font-size: 11px !important;
          letter-spacing: 0.5px !important;
          text-transform: uppercase !important;
          margin: 4px 2px !important;
          width: 36px !important;
        }
        
        /* Days */
        .restpoint-calendar .react-datepicker__day {
          border-radius: 8px !important;
          transition: all 0.15s ease !important;
          font-size: 13px !important;
          padding: 6px 0 !important;
          margin: 2px !important;
          width: 36px !important;
          line-height: 28px !important;
          color: #1A1D24 !important;
          font-weight: 400 !important;
          cursor: pointer !important;
          border: 1px solid transparent !important;
        }
        
        /* Hover state - improved */
        .restpoint-calendar .react-datepicker__day:hover {
          background: #E8F0FE !important;
          color: #1A1D24 !important;
          border-radius: 8px !important;
          border-color: #3D4F47 !important;
          transform: scale(1.02) !important;
        }
        
        /* Selected state */
        .restpoint-calendar .react-datepicker__day--selected {
          background: #3D4F47 !important;
          color: #FFFFFF !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          border-color: #3D4F47 !important;
          box-shadow: 0 2px 8px rgba(61, 79, 71, 0.3) !important;
        }
        
        .restpoint-calendar .react-datepicker__day--selected:hover {
          background: #2E3F37 !important;
          border-color: #2E3F37 !important;
        }
        
        /* Today state */
        .restpoint-calendar .react-datepicker__day--today {
          background: rgba(61, 79, 71, 0.08) !important;
          font-weight: 500 !important;
          color: #3D4F47 !important;
          border-radius: 8px !important;
          border-color: #3D4F47 !important;
        }
        
        .restpoint-calendar .react-datepicker__day--today:after {
          content: '';
          display: block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #3D4F47;
          margin: 2px auto 0;
        }
        
        .restpoint-calendar .react-datepicker__day--today:hover {
          background: rgba(61, 79, 71, 0.15) !important;
        }
        
        /* Keyboard selected */
        .restpoint-calendar .react-datepicker__day--keyboard-selected {
          background: rgba(61, 79, 71, 0.12) !important;
          border-radius: 8px !important;
          border-color: #3D4F47 !important;
        }
        
        /* Outside month */
        .restpoint-calendar .react-datepicker__day--outside-month {
          color: #D1D5DB !important;
        }
        
        /* Disabled */
        .restpoint-calendar .react-datepicker__day--disabled {
          color: #E5E7EB !important;
          cursor: not-allowed !important;
          opacity: 0.5 !important;
        }
        
        .restpoint-calendar .react-datepicker__day--disabled:hover {
          background: transparent !important;
          transform: none !important;
        }
        
        /* Navigation arrows */
        .restpoint-calendar .react-datepicker__navigation {
          top: 16px !important;
        }
        
        .restpoint-calendar .react-datepicker__navigation-icon::before {
          border-color: #6B7280 !important;
          border-width: 2px !important;
          height: 8px !important;
          width: 8px !important;
        }
        
        .restpoint-calendar .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
          border-color: #3D4F47 !important;
        }
        
        /* Year/Month dropdowns */
        .restpoint-calendar .react-datepicker__year-dropdown,
        .restpoint-calendar .react-datepicker__month-dropdown {
          background: white !important;
          border: 1px solid #E8ECF0 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
          max-height: 200px !important;
          overflow-y: auto !important;
          padding: 4px !important;
        }
        
        .restpoint-calendar .react-datepicker__year-option,
        .restpoint-calendar .react-datepicker__month-option {
          padding: 8px 12px !important;
          transition: all 0.15s ease !important;
          border-radius: 6px !important;
          cursor: pointer !important;
        }
        
        .restpoint-calendar .react-datepicker__year-option:hover,
        .restpoint-calendar .react-datepicker__month-option:hover {
          background: rgba(61, 79, 71, 0.08) !important;
        }
        
        .restpoint-calendar .react-datepicker__year-option--selected,
        .restpoint-calendar .react-datepicker__month-option--selected {
          background: rgba(61, 79, 71, 0.12) !important;
          font-weight: 600 !important;
        }
        
        /* Year/Month header buttons */
        .restpoint-calendar .react-datepicker__year-read-view,
        .restpoint-calendar .react-datepicker__month-read-view {
          padding: 4px 8px !important;
          border-radius: 6px !important;
          transition: background 0.15s ease !important;
        }
        
        .restpoint-calendar .react-datepicker__year-read-view:hover,
        .restpoint-calendar .react-datepicker__month-read-view:hover {
          background: rgba(61, 79, 71, 0.08) !important;
        }
        
        .restpoint-calendar .react-datepicker__year-read-view--down-arrow,
        .restpoint-calendar .react-datepicker__month-read-view--down-arrow {
          border-color: #6B7280 !important;
        }
        
        /* Wrapper */
        .date-picker-wrapper {
          width: 100% !important;
        }
        
        .date-picker-wrapper .react-datepicker-wrapper {
          width: 100% !important;
        }
        
        .date-picker-wrapper .react-datepicker__input-container {
          width: 100% !important;
        }
        
        /* Popper z-index */
        .react-datepicker-popper {
          z-index: 9999 !important;
        }
        
        /* Week row spacing */
        .react-datepicker__week {
          display: flex !important;
          justify-content: center !important;
        }
        
        /* Remove day gap */
        .react-datepicker__day {
          margin: 2px !important;
        }
      `}</style>
    </div>
  );
};

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
// STEPPER
// ============================================================

const Stepper = ({ currentStep, steps }) => {
  return (
    <div style={{ marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: index <= currentStep ? '#3D4F47' : '#e9ecef',
                color: index <= currentStep ? 'white' : '#6c757d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {index < currentStep ? <Check size={20} /> : index + 1}
              </div>
              <div style={{
                fontSize: '12px',
                marginTop: '8px',
                color: index === currentStep ? '#3D4F47' : '#6c757d',
                fontWeight: index === currentStep ? 'bold' : 'normal'
              }}>
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div style={{ flex: 1, height: '2px', backgroundColor: '#e9ecef' }}>
                <div style={{
                  width: index < currentStep ? '100%' : '0%',
                  height: '100%',
                  backgroundColor: '#3D4F47',
                  transition: 'width 0.3s'
                }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
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
// SMART DATE INPUT WRAPPER
// ============================================================

const SmartDateInput = ({ label, name, value, onChange, error, required }) => {
  const handleDateChange = (date) => {
    let isoString = '';
    if (date) {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      isoString = normalizedDate.toISOString().split('T')[0];
    }
    onChange({ target: { name, value: isoString } });
  };

  const getDateValue = () => {
    if (value && typeof value === 'string') {
      const parsed = parseISO(value);
      if (isValid(parsed)) {
        return parsed;
      }
    }
    return null;
  };

  return (
    <CustomDatePicker
      selectedDate={getDateValue()}
      onChange={handleDateChange}
      maxDate={new Date()}
      placeholder={`Select ${label}`}
      error={error}
      label={label}
      required={required}
      name={name}
    />
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const DeceasedRegistrationForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    isVisible: false, type: 'info', title: '', message: '',
  });

  const steps = [
    { id: 1, title: 'Personal Info' },
    { id: 2, title: 'Death Details' },
    { id: 3, title: 'Location' },
  ];

  const initialFormData = {
    full_name: '', national_id: '', gender: '', date_of_birth: '',
    date_of_death: '', place_of_death: '', cause_of_death: '',
    admission_number: '', date_admitted: '', county: '', location: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 0) {
      if (!formData.full_name) newErrors.full_name = 'Full name is required';
      if (!formData.national_id) newErrors.national_id = 'National ID is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    } else if (currentStep === 1) {
      if (!formData.date_of_death) newErrors.date_of_death = 'Date of death is required';
      if (!formData.place_of_death) newErrors.place_of_death = 'Place of death is required';
      if (!formData.cause_of_death) newErrors.cause_of_death = 'Cause of death is required';
    } else if (currentStep === 2) {
      if (!formData.county) newErrors.county = 'County is required';
      if (!formData.location) newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      const tenantSlug = localStorage.getItem('tenantSlug') || 'default';
      const payload = { ...formData, registered_by: 'System User' };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${ENDPOINTS.DECEASED.CREATE}`, {
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
        maxWidth: '1200px',
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
              <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '14px' }}>Fill in the details below</p>
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
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'visible'
      }}>
        <div style={{ padding: '30px', overflow: 'visible' }}>
          <Stepper currentStep={currentStep} steps={steps} />

          {/* Step 0: Personal Info */}
          {currentStep === 0 && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#1A1D24' }}>
                Personal Information
              </h3>
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
                  <FormInput
                    label="National ID"
                    name="national_id"
                    value={formData.national_id}
                    onChange={handleChange}
                    error={errors.national_id}
                    required
                    placeholder="Enter national ID"
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
                  <SmartDateInput
                    label="Date of Birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    error={errors.date_of_birth}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Death Details */}
          {currentStep === 1 && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#1A1D24' }}>
                Death Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <SmartDateInput
                    label="Date of Death"
                    name="date_of_death"
                    value={formData.date_of_death}
                    onChange={handleChange}
                    error={errors.date_of_death}
                    required
                  />
                </div>
                <div>
                  <FormInput
                    label="Place of Death"
                    name="place_of_death"
                    value={formData.place_of_death}
                    onChange={handleChange}
                    error={errors.place_of_death}
                    required
                    placeholder="Hospital, home, etc."
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <FormInput
                    label="Cause of Death"
                    name="cause_of_death"
                    value={formData.cause_of_death}
                    onChange={handleChange}
                    error={errors.cause_of_death}
                    required
                    placeholder="Enter cause of death"
                  />
                </div>
                <div>
                  <FormInput
                    label="Admission Number (Optional)"
                    name="admission_number"
                    value={formData.admission_number}
                    onChange={handleChange}
                    placeholder="If applicable"
                  />
                </div>
                <div>
                  <SmartDateInput
                    label="Date Admitted (Optional)"
                    name="date_admitted"
                    value={formData.date_admitted}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#1A1D24' }}>
                Location Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <FormInput
                    label="County / Region"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    error={errors.county}
                    required
                    placeholder="Enter county"
                  />
                </div>
                <div>
                  <FormInput
                    label="Location / Sub-county"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    error={errors.location}
                    required
                    placeholder="Enter location"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #e9ecef'
          }}>
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DC2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#EF4444';
                }}
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#1A1D24',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginLeft: currentStep === 0 ? 'auto' : 0,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2D3748';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1A1D24';
                }}
              >
                Continue
                <ArrowRight size={16} />
              </button>
            ) : (
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
                  marginLeft: 'auto',
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
                    Submit Registration
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '12px',
        color: '#6c757d'
      }}>
        All fields marked with <span style={{ color: '#EF4444' }}>*</span> are required
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