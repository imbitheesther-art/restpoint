import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import './FlowerBookings.css';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const BRANCHES = [
  'Rosedale Memorial',
  'Serenity Gardens',
  'Evergreen Chapel',
  'Harmony Hall',
];

const FLOWER_TYPES = [
  'Standing Spray',
  'Wreath',
  'Casket Spray',
  'Sympathy Basket',
  'Floral Cross',
  'Heart Tribute',
];

const SERVICE_TYPES = [
  'Funeral Service',
  'Memorial',
  'Condolence Visit',
  'Celebration of Life',
  'Graveside',
];

const STATUS_LIST = [
  'pending',
  'confirmed',
  'preparing',
  'delivering',
  'delivered',
  'cancelled',
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', progress: 10, color: '#d97706', bg: '#fef3c7', dotColor: '#d97706' },
  confirmed: { label: 'Confirmed', progress: 30, color: '#2563eb', bg: '#dbeafe', dotColor: '#2563eb' },
  preparing: { label: 'Preparing', progress: 55, color: '#4f46e5', bg: '#e0e7ff', dotColor: '#4f46e5' },
  delivering: { label: 'Delivering', progress: 80, color: '#db2777', bg: '#fce7f3', dotColor: '#db2777' },
  delivered: { label: 'Delivered', progress: 100, color: '#059669', bg: '#d1fae5', dotColor: '#059669' },
  cancelled: { label: 'Cancelled', progress: 0, color: '#dc2626', bg: '#fee2e2', dotColor: '#dc2626' },
};

const RESULTS_PER_PAGE = 8;
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const formatDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDateDisplay = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

const getWeekNumber = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  const firstDay = new Date(d.getFullYear(), 0, 1);
  const pastDays = Math.floor((d - firstDay) / 86400000);
  return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
};

const getWeekRange = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${formatDateStr(start)} to ${formatDateStr(end)}`;
};

/* ═══════════════════════════════════════════════════════════════
   DYNAMIC SAMPLE DATA — spreads across past, today, future months
   ═══════════════════════════════════════════════════════════════ */
const generateSampleBookings = () => {
  const today = new Date();
  const offset = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return formatDateStr(d);
  };
  const createdOffset = (deliveryOff, gap) => {
    const d = new Date(today);
    d.setDate(d.getDate() + deliveryOff - gap);
    return formatDateStr(d);
  };

  const make = (id, dayOff, flower, service, customer, deceased, branch, time, amount, status, urgent, notes) => ({
    id,
    booking_id: `FLW-${24000 + id}`,
    flower_type: flower,
    flower_description: `${flower} — premium arrangement with seasonal flowers and greenery`,
    service_type: service,
    customer,
    customer_phone: `(555) ${String(200 + id).padStart(3, '0')}-${String(3300 + id * 13).slice(0, 4)}`,
    customer_email: `${customer.split(' ')[0].toLowerCase()}@email.com`,
    deceased_name: deceased,
    branch,
    delivery_date: offset(dayOff),
    delivery_time: time,
    delivery_address: branch === 'Rosedale Memorial' ? '1200 Oakridge Ave, Suite A'
      : branch === 'Serenity Gardens' ? '450 Garden Path Blvd'
        : branch === 'Evergreen Chapel' ? '789 Pine Street'
          : '320 Maple Drive',
    invoice_number: `INV-${24000 + id}`,
    amount,
    status,
    notes: notes || (urgent ? 'Urgent — family requested earliest possible delivery' : ''),
    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(flower.split(' ')[0])}&background=266b52&color=fff&size=80&bold=true`,
    created_at: createdOffset(dayOff, Math.floor(Math.random() * 5) + 2),
    urgent: urgent || false,
  });

  return [
    make(1, -18, 'Standing Spray', 'Funeral Service', 'Helen Morrison', 'Robert Morrison', 'Rosedale Memorial', '09:00', 285, 'delivered', false, 'Family requested all white arrangement'),
    make(2, -14, 'Wreath', 'Memorial', 'James Whitfield', 'Dorothy Whitfield', 'Serenity Gardens', '10:30', 195, 'delivered', false, 'Pink and purple tones preferred'),
    make(3, -10, 'Casket Spray', 'Funeral Service', 'Patricia Chen', 'David Chen', 'Rosedale Memorial', '08:00', 450, 'delivered', false, 'Premium red roses'),
    make(4, -7, 'Sympathy Basket', 'Condolence Visit', 'Michael Torres', 'Maria Torres', 'Evergreen Chapel', '14:00', 125, 'cancelled', false, 'Service postponed'),
    make(5, -4, 'Floral Cross', 'Graveside', 'Susan Baker', 'Thomas Baker', 'Harmony Hall', '11:00', 320, 'delivered', false, ''),
    make(6, -2, 'Heart Tribute', 'Celebration of Life', 'Karen Mitchell', 'William Mitchell', 'Serenity Gardens', '13:00', 275, 'delivered', false, 'Heart shape very important to family'),
    make(7, -1, 'Standing Spray', 'Funeral Service', 'Robert Hayes', 'Eleanor Hayes', 'Evergreen Chapel', '09:30', 310, 'delivered', false, "Deceased's favorite color was blue"),
    make(8, 0, 'Wreath', 'Memorial', 'Linda Garcia', 'Carlos Garcia', 'Harmony Hall', '10:00', 210, 'delivering', true, 'Deliver directly to graveside'),
    make(9, 0, 'Casket Spray', 'Funeral Service', 'Daniel Kim', 'Yuna Kim', 'Rosedale Memorial', '07:30', 520, 'preparing', true, 'Premium — family spending extra'),
    make(10, 0, 'Sympathy Basket', 'Condolence Visit', 'Angela Brooks', 'Frank Brooks', 'Serenity Gardens', '16:00', 145, 'pending', false, 'Pastel colors only'),
    make(11, 1, 'Floral Cross', 'Graveside', 'Nancy Freeman', 'George Freeman', 'Evergreen Chapel', '10:00', 340, 'confirmed', false, 'Lavender roses essential'),
    make(12, 1, 'Heart Tribute', 'Celebration of Life', 'Christopher Dunn', 'Ruth Dunn', 'Harmony Hall', '12:00', 295, 'confirmed', false, 'Gardenias were her favorite'),
    make(13, 2, 'Standing Spray', 'Funeral Service', 'Margaret Lewis', 'Henry Lewis', 'Rosedale Memorial', '09:00', 265, 'confirmed', false, ''),
    make(14, 3, 'Wreath', 'Memorial', 'Thomas Ward', 'Alice Ward', 'Serenity Gardens', '11:00', 205, 'pending', false, 'Autumn tones'),
    make(15, 4, 'Casket Spray', 'Funeral Service', 'Sandra Lopez', 'Ricardo Lopez', 'Evergreen Chapel', '08:30', 480, 'pending', true, 'Must arrive before 9am service'),
    make(16, 5, 'Sympathy Basket', 'Condolence Visit', 'Brian Clark', 'Dorothy Clark', 'Harmony Hall', '15:00', 135, 'pending', false, ''),
    make(17, 6, 'Floral Cross', 'Graveside', 'Deborah Hall', 'Edward Hall', 'Rosedale Memorial', '10:30', 330, 'pending', false, ''),
    make(18, 8, 'Standing Spray', 'Funeral Service', 'Kevin Wright', 'Margaret Wright', 'Serenity Gardens', '09:00', 290, 'pending', false, ''),
    make(19, 9, 'Heart Tribute', 'Celebration of Life', 'Lisa Adams', 'James Adams', 'Evergreen Chapel', '13:00', 280, 'pending', false, 'Red and pink heart'),
    make(20, 10, 'Wreath', 'Memorial', 'Paul Nelson', 'Susan Nelson', 'Harmony Hall', '14:00', 215, 'pending', false, ''),
    make(21, 12, 'Casket Spray', 'Funeral Service', 'Donna King', 'Charles King', 'Rosedale Memorial', '08:00', 510, 'pending', false, ''),
    make(22, 15, 'Sympathy Basket', 'Condolence Visit', 'Mark Robinson', 'Helen Robinson', 'Serenity Gardens', '16:30', 140, 'pending', false, ''),
    make(23, 18, 'Standing Spray', 'Funeral Service', 'Carol Scott', 'Donald Scott', 'Evergreen Chapel', '09:30', 300, 'pending', false, ''),
    make(24, 22, 'Floral Cross', 'Graveside', 'Steven Green', 'Mary Green', 'Harmony Hall', '11:00', 325, 'pending', false, ''),
    make(25, 28, 'Heart Tribute', 'Celebration of Life', 'Janet Young', 'Richard Young', 'Rosedale Memorial', '12:00', 285, 'pending', false, ''),
    make(26, 32, 'Wreath', 'Memorial', 'Raymond Hill', 'Frances Hill', 'Serenity Gardens', '10:00', 200, 'pending', false, ''),
    make(27, 35, 'Casket Spray', 'Funeral Service', 'Catherine Moore', 'George Moore', 'Evergreen Chapel', '08:30', 475, 'pending', false, ''),
    make(28, 38, 'Standing Spray', 'Funeral Service', 'Jeffrey Taylor', 'Louise Taylor', 'Harmony Hall', '09:00', 270, 'pending', false, ''),
    make(29, 42, 'Sympathy Basket', 'Condolence Visit', 'Diane Anderson', 'Harold Anderson', 'Rosedale Memorial', '14:00', 130, 'pending', false, ''),
    make(30, 48, 'Floral Cross', 'Graveside', 'Gregory White', 'Evelyn White', 'Serenity Gardens', '11:00', 335, 'pending', false, ''),
    make(31, 55, 'Heart Tribute', 'Celebration of Life', 'Monica Harris', 'Samuel Harris', 'Evergreen Chapel', '13:00', 290, 'pending', false, ''),
    make(32, 60, 'Wreath', 'Memorial', 'Timothy Martin', 'Ruth Martin', 'Harmony Hall', '10:30', 220, 'pending', false, ''),
  ];
};

const SAMPLE_BOOKINGS = generateSampleBookings();

/* ═══════════════════════════════════════════════════════════════
   ICON COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
const Icon = ({ d, size = 16, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  layers: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  flower: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  clipboard: <><Icon d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></>,
  home: <><Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
  box: <><Icon d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></>,
  users: <><Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  dollar: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
  search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  chevLeft: <Icon d="M15 18l-6-6 6-6" />,
  chevRight: <Icon d="M9 18l6-6-6-6" />,
  chevFirst: <><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></>,
  chevLast: <><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></>,
  print: <><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>,
  invoice: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
  bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  menu: <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  check: <Icon d="M20 6L9 17l-5-5" />,
  alertTriangle: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
  refresh: <><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></>,
  mapPin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
  phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></>,
  mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  moreV: <><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
  chevDown: <Icon d="M6 9l6 6 6-6" />,
  trendingUp: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
  trendingDown: <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></>,
};

/* ═══════════════════════════════════════════════════════════════
   SMALL REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  return (
    <span className="fb-badge" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="fb-badge-dot" style={{ background: cfg.dotColor }} />
      {cfg.label}
    </span>
  );
};

const ProgressBar = ({ value, color }) => (
  <div className="fb-progress-track">
    <div className="fb-progress-fill" style={{ width: `${value}%`, background: color }} />
  </div>
);

const StatCard = ({ label, value, sub, icon, iconBg, subColor }) => (
  <div className="fb-stat-card">
    <div className="fb-stat-header">
      <span className="fb-stat-label">{label}</span>
      <div className="fb-stat-icon" style={{ background: iconBg }}>{icon}</div>
    </div>
    <div className="fb-stat-value">{value}</div>
    <div className="fb-stat-sub" style={{ color: subColor || '#78716c' }}>{sub}</div>
  </div>
);

const Checkbox = ({ checked, onChange }) => (
  <div
    className={`fb-checkbox ${checked ? 'fb-checkbox-checked' : ''}`}
    onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
    role="checkbox"
    aria-checked={checked}
    tabIndex={0}
    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); } }}
  />
);

const Toast = ({ message, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return <div className={`fb-toast fb-toast-${type}`}>{message}</div>;
};

const StatusTimeline = ({ currentStatus }) => {
  const steps = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered'];
  const currentIdx = steps.indexOf(currentStatus);
  if (currentStatus === 'cancelled') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#fee2e2', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
        <span style={{ color: '#dc2626', display: 'flex' }}>{Icons.alertTriangle}</span>
        <span style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 500 }}>This booking has been cancelled</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
      {steps.map((step, i) => {
        const cfg = STATUS_CONFIG[step];
        const done = i < currentIdx;
        const curr = i === currentIdx;
        return (
          <React.Fragment key={step}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', minWidth: '56px' }}>
              <div className={`fb-timeline-dot ${done ? 'fb-timeline-dot-completed' : ''} ${curr ? 'fb-timeline-dot-current' : ''}`}
                style={done ? { background: cfg.color, borderColor: cfg.color } : curr ? { borderColor: cfg.color, boxShadow: `0 0 0 3px ${cfg.bg}` } : {}} />
              <span style={{ fontSize: '0.65rem', fontWeight: curr ? 600 : 400, color: curr ? cfg.color : (done ? '#57534e' : '#a8a29e'), textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                {cfg.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`fb-timeline-line ${done ? 'fb-timeline-line-completed' : ''}`} style={done ? { background: cfg.color } : {}} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const DetailField = ({ label, children }) => (
  <div>
    <div className="fb-detail-label">{label}</div>
    <div className="fb-detail-value">{children}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD STATS COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const DashboardStats = ({ bookings }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentWeek = getWeekNumber(formatDateStr(today));

  // Monthly stats
  const monthlyStats = useMemo(() => {
    const monthBookings = bookings.filter(b => {
      const d = new Date(b.delivery_date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const count = monthBookings.length;
    const revenue = monthBookings.reduce((sum, b) => sum + b.amount, 0);
    const delivered = monthBookings.filter(b => b.status === 'delivered').length;
    const pending = monthBookings.filter(b => b.status === 'pending').length;
    const avgValue = count > 0 ? revenue / count : 0;

    return { count, revenue, delivered, pending, avgValue };
  }, [bookings, currentMonth, currentYear]);

  // Weekly stats
  const weeklyStats = useMemo(() => {
    const weekBookings = bookings.filter(b => {
      const d = new Date(b.delivery_date + 'T00:00:00');
      return getWeekNumber(b.delivery_date) === currentWeek && d.getFullYear() === currentYear;
    });

    const count = weekBookings.length;
    const revenue = weekBookings.reduce((sum, b) => sum + b.amount, 0);
    const delivered = weekBookings.filter(b => b.status === 'delivered').length;
    const pending = weekBookings.filter(b => b.status === 'pending').length;

    return { count, revenue, delivered, pending };
  }, [bookings, currentWeek]);

  // Last 6 months trend
  const monthlyTrend = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const monthBookings = bookings.filter(b => {
        const bd = new Date(b.delivery_date + 'T00:00:00');
        return bd.getMonth() === month && bd.getFullYear() === year;
      });
      months.push({
        label: MONTH_NAMES[month].substring(0, 3),
        count: monthBookings.length,
        revenue: monthBookings.reduce((sum, b) => sum + b.amount, 0),
      });
    }
    return months;
  }, [bookings]);

  const maxCount = Math.max(...monthlyTrend.map(m => m.count), 1);

  return (
    <div className="fb-dashboard">
      <div className="fb-dashboard-header">
        <div>
          <h2 className="fb-dashboard-title">Dashboard Overview</h2>
          <p className="fb-dashboard-subtitle">Flower booking analytics and insights</p>
        </div>
      </div>

      {/* Current Period Stats */}
      <div className="fb-period-stats">
        <div className="fb-period-card fb-period-month">
          <div className="fb-period-header">
            <span className="fb-period-label">This Month</span>
            <span className="fb-period-badge">{MONTH_NAMES[currentMonth]} {currentYear}</span>
          </div>
          <div className="fb-period-stats-grid">
            <div className="fb-period-stat">
              <div className="fb-period-stat-value">{monthlyStats.count}</div>
              <div className="fb-period-stat-label">Total Bookings</div>
            </div>
            <div className="fb-period-stat">
              <div className="fb-period-stat-value">${monthlyStats.revenue.toLocaleString()}</div>
              <div className="fb-period-stat-label">Revenue</div>
            </div>
            <div className="fb-period-stat">
              <div className="fb-period-stat-value">{monthlyStats.delivered}</div>
              <div className="fb-period-stat-label">Delivered</div>
            </div>
            <div className="fb-period-stat">
              <div className="fb-period-stat-value">{monthlyStats.pending}</div>
              <div className="fb-period-stat-label">Pending</div>
            </div>
            <div className="fb-period-stat">
              <div className="fb-period-stat-value">${monthlyStats.avgValue.toFixed(0)}</div>
              <div className="fb-period-stat-label">Avg. Value</div>
            </div>
          </div>
        </div>

        <div className="fb-period-card fb-period-week">
          <div className="fb-period-header">
            <span className="fb-period-label">This Week</span>
            <span className="fb-period-badge">Week {currentWeek}</span>
          </div>
          <div className="fb-period-stats-grid">
            <div className="fb-period-stat">
              <div className="fb-period-stat-value">{weeklyStats.count}</div>
              <div className="fb-period-stat-label">Bookings</div>
            </div>
            <div className="fb-period-stat">
              <div className="fb-period-stat-value">${weeklyStats.revenue.toLocaleString()}</div>
              <div className="fb-period-stat-label">Revenue</div>
            </div>
            <div className="fb-period-stat">
              <div className="fb-period-stat-value">{weeklyStats.delivered}</div>
              <div className="fb-period-stat-label">Delivered</div>
            </div>
            <div className="fb-period-stat">
              <div className="fb-period-stat-value">{weeklyStats.pending}</div>
              <div className="fb-period-stat-label">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="fb-trend-card">
        <div className="fb-trend-header">
          <h3 className="fb-trend-title">6-Month Trend</h3>
          <span className="fb-trend-subtitle">Monthly booking volume</span>
        </div>
        <div className="fb-trend-chart">
          {monthlyTrend.map((month, i) => (
            <div key={i} className="fb-trend-bar-container">
              <div className="fb-trend-bar-wrapper">
                <div
                  className="fb-trend-bar"
                  style={{
                    height: `${(month.count / maxCount) * 100}%`,
                    background: i === monthlyTrend.length - 1 ? 'var(--fb-accent)' : '#d9ede3',
                  }}
                >
                  {month.count > 0 && (
                    <span className="fb-trend-bar-value">{month.count}</span>
                  )}
                </div>
              </div>
              <div className="fb-trend-bar-label">{month.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CALENDAR VIEW COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const CalendarView = ({ bookings, selectedDate, onSelectDate, onOpenBooking, onNewBookingForDate }) => {
  const today = new Date();
  const todayStr = formatDateStr(today);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  /* Group bookings by date */
  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (!map[b.delivery_date]) map[b.delivery_date] = [];
      map[b.delivery_date].push(b);
    });
    return map;
  }, [bookings]);

  /* Month summary stats */
  const monthStats = useMemo(() => {
    let count = 0;
    let amount = 0;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayBookings = bookingsByDate[ds] || [];
      count += dayBookings.length;
      dayBookings.forEach((b) => { amount += b.amount; });
    }
    return { count, amount };
  }, [viewYear, viewMonth, bookingsByDate]);

  /* Build calendar grid cells */
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
    const days = [];

    for (let i = 0; i < totalCells; i++) {
      let day, month, year, isOther = false;
      if (i < firstDow) {
        day = prevMonthDays - firstDow + 1 + i;
        month = viewMonth - 1; year = viewYear;
        if (month < 0) { month = 11; year--; }
        isOther = true;
      } else if (i >= firstDow + daysInMonth) {
        day = i - firstDow - daysInMonth + 1;
        month = viewMonth + 1; year = viewYear;
        if (month > 11) { month = 0; year++; }
        isOther = true;
      } else {
        day = i - firstDow + 1;
        month = viewMonth; year = viewYear;
      }

      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayBk = bookingsByDate[ds] || [];
      const isPast = new Date(ds + 'T23:59:59') < today;
      const isWeekend = (i % 7 === 0) || (i % 7 === 6);

      days.push({
        day, month, year, isOther, dateStr: ds,
        isToday: ds === todayStr,
        isSelected: ds === selectedDate,
        isPast,
        isWeekend,
        bookings: dayBk,
        bookingCount: dayBk.length,
        hasUrgent: dayBk.some((b) => b.urgent),
        statusColors: [...new Set(dayBk.map((b) => STATUS_CONFIG[b.status]?.dotColor || '#a8a29e'))],
      });
    }
    return days;
  }, [viewYear, viewMonth, bookingsByDate, todayStr, selectedDate, today]);

  /* Navigation */
  const goToPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goToNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };
  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onSelectDate(todayStr);
  };
  const goToTomorrow = () => {
    const d = new Date(today); d.setDate(d.getDate() + 1);
    setViewYear(d.getFullYear()); setViewMonth(d.getMonth());
    onSelectDate(formatDateStr(d));
  };
  const goToThisWeek = () => {
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    setViewYear(monday.getFullYear()); setViewMonth(monday.getMonth());
    onSelectDate(formatDateStr(today));
  };
  const goToNextWeek = () => {
    const dayOfWeek = today.getDay();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + (7 - ((dayOfWeek + 6) % 7)));
    setViewYear(nextMonday.getFullYear()); setViewMonth(nextMonday.getMonth());
    onSelectDate(formatDateStr(nextMonday));
  };
  const goToThisMonth = () => {
    setViewYear(today.getFullYear()); setViewMonth(today.getMonth());
    onSelectDate(null);
  };
  const goToNextMonth = () => {
    const nm = today.getMonth() + 1;
    const ny = nm > 11 ? today.getFullYear() + 1 : today.getFullYear();
    const m = nm > 11 ? 0 : nm;
    setViewYear(ny); setViewMonth(m);
    onSelectDate(`${ny}-${String(m + 1).padStart(2, '0')}-01`);
  };

  const monthLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  const selectedDayBookings = selectedDate ? (bookingsByDate[selectedDate] || []) : [];

  return (
    <div className="fb-calendar-layout">
      {/* Calendar main */}
      <div className="fb-calendar-main">
        {/* Calendar header */}
        <div className="fb-calendar-header">
          <div className="fb-calendar-nav">
            <button className="fb-cal-nav-btn" onClick={goToPrev} title="Previous month">{Icons.chevLeft}</button>
            <h3 className="fb-calendar-title">{monthLabel}</h3>
            <button className="fb-cal-nav-btn" onClick={goToNext} title="Next month">{Icons.chevRight}</button>
          </div>
          <div className="fb-calendar-month-stats">
            <span><strong>{monthStats.count}</strong> bookings</span>
            <span className="fb-cal-stat-sep">·</span>
            <span><strong>${monthStats.amount.toLocaleString()}</strong> revenue</span>
          </div>
        </div>

        {/* Quick date buttons */}
        <div className="fb-quick-dates">
          <button className={`fb-quick-btn ${!selectedDate && viewMonth === today.getMonth() && viewYear === today.getFullYear() ? 'fb-quick-btn-active' : ''}`} onClick={goToThisMonth}>This Month</button>
          <button className="fb-quick-btn" onClick={goToToday}>Today</button>
          <button className="fb-quick-btn" onClick={goToTomorrow}>Tomorrow</button>
          <button className="fb-quick-btn" onClick={goToThisWeek}>This Week</button>
          <button className="fb-quick-btn" onClick={goToNextWeek}>Next Week</button>
          <button className="fb-quick-btn" onClick={goToNextMonth}>Next Month</button>
        </div>

        {/* Weekday headers */}
        <div className="fb-calendar-weekdays">
          {WEEKDAY_SHORT.map((w, i) => (
            <div key={w} className={`fb-calendar-weekday ${i === 0 || i === 6 ? 'fb-calendar-weekday-weekend' : ''}`}>{w}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="fb-calendar-grid">
          {calendarDays.map((cell, i) => (
            <div
              key={i}
              className={[
                'fb-calendar-day',
                cell.isOther && 'fb-calendar-day-other',
                cell.isToday && 'fb-calendar-day-today',
                cell.isSelected && 'fb-calendar-day-selected',
                cell.bookingCount > 0 && !cell.isOther && 'fb-calendar-day-has-bookings',
                cell.isWeekend && !cell.isOther && 'fb-calendar-day-weekend',
                cell.isPast && !cell.isOther && 'fb-calendar-day-past',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelectDate(cell.dateStr)}
            >
              <div className="fb-calendar-day-top">
                <span className="fb-calendar-day-num">{cell.day}</span>
                {cell.hasUrgent && !cell.isOther && <span className="fb-calendar-urgent-badge">!</span>}
              </div>
              {cell.bookingCount > 0 && !cell.isOther && (
                <div className="fb-calendar-day-dots">
                  {cell.statusColors.slice(0, 4).map((c, j) => (
                    <span key={j} className="fb-cal-dot" style={{ background: c }} />
                  ))}
                  {cell.bookingCount > 4 && <span className="fb-cal-more">+{cell.bookingCount - 4}</span>}
                </div>
              )}
              {cell.bookingCount > 0 && !cell.isOther && (
                <div className="fb-calendar-day-count">{cell.bookingCount}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Day detail panel */}
      <div className="fb-day-panel">
        {selectedDate ? (
          <>
            <div className="fb-day-panel-header">
              <div>
                <h3 className="fb-day-panel-title">{formatDateDisplay(selectedDate)}</h3>
                <p className="fb-day-panel-sub">{selectedDayBookings.length} booking{selectedDayBookings.length !== 1 ? 's' : ''} scheduled</p>
              </div>
              <button className="fb-btn fb-btn-primary fb-btn-sm" onClick={() => onNewBookingForDate(selectedDate)}>
                {Icons.plus} Add Booking
              </button>
            </div>

            {selectedDayBookings.length === 0 ? (
              <div className="fb-day-panel-empty">
                <span style={{ color: '#a8a29e', display: 'flex', marginBottom: '0.5rem' }}>{Icons.calendar}</span>
                <p>No bookings for this date</p>
                <button className="fb-btn fb-btn-outline fb-btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => onNewBookingForDate(selectedDate)}>
                  {Icons.plus} Create Booking
                </button>
              </div>
            ) : (
              <div className="fb-day-panel-list">
                {selectedDayBookings
                  .sort((a, b) => a.delivery_time.localeCompare(b.delivery_time))
                  .map((b) => (
                    <div key={b.id} className="fb-day-booking-card" onClick={() => onOpenBooking(b)}>
                      <img src={b.image} alt="" className="fb-day-booking-img" loading="lazy" />
                      <div className="fb-day-booking-info">
                        <div className="fb-day-booking-top">
                          <span className="fb-day-booking-type">{b.flower_type}</span>
                          {b.urgent && <span className="fb-urgent-tag">Urgent</span>}
                        </div>
                        <div className="fb-day-booking-customer">{b.customer}</div>
                        <div className="fb-day-booking-meta">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{Icons.clock} {b.delivery_time}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{Icons.mapPin} {b.branch.split(' ')[0]}</span>
                        </div>
                        <div className="fb-day-booking-bottom">
                          <StatusBadge status={b.status} />
                          <span className="fb-day-booking-amount">${b.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                <div className="fb-day-panel-total">
                  <span>Total for day</span>
                  <strong>${selectedDayBookings.reduce((s, b) => s + b.amount, 0).toFixed(2)}</strong>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="fb-day-panel-empty fb-day-panel-empty-prompt">
            <span style={{ color: '#a8a29e', display: 'flex', marginBottom: '0.75rem', fontSize: '2rem' }}>{Icons.calendar}</span>
            <p style={{ fontWeight: 500, color: '#57534e', marginBottom: '0.25rem' }}>Select a date</p>
            <p style={{ fontSize: '0.82rem', color: '#a8a29e' }}>Click on any day to view its bookings</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const FlowerBookings = () => {
  const [bookings, setBookings] = useState(SAMPLE_BOOKINGS);
  const [searchInput, setSearchInput] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterFlowerType, setFilterFlowerType] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [actionMenuId, setActionMenuId] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'table' | 'calendar'
  const [selectedDate, setSelectedDate] = useState(formatDateStr(new Date()));
  const [prefillDate, setPrefillDate] = useState('');
  const [showDashboard, setShowDashboard] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');

  const actionMenuRef = useRef(null);

  const getDateRange = useCallback((filter) => {
    const today = new Date();
    const todayStr = formatDateStr(today);

    switch (filter) {
      case 'today':
        return { start: todayStr, end: todayStr };
      case 'tomorrow': {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = formatDateStr(tomorrow);
        return { start: tomorrowStr, end: tomorrowStr };
      }
      case 'thisWeek': {
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return { start: formatDateStr(monday), end: formatDateStr(sunday) };
      }
      case 'nextWeek': {
        const dayOfWeek = today.getDay();
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + (7 - ((dayOfWeek + 6) % 7)));
        const nextSunday = new Date(nextMonday);
        nextSunday.setDate(nextMonday.getDate() + 6);
        return { start: formatDateStr(nextMonday), end: formatDateStr(nextSunday) };
      }
      case 'thisMonth': {
        const start = formatDateStr(new Date(today.getFullYear(), today.getMonth(), 1));
        const end = formatDateStr(new Date(today.getFullYear(), today.getMonth() + 1, 0));
        return { start, end };
      }
      case 'nextMonth': {
        const nextMonth = today.getMonth() + 1;
        const year = nextMonth > 11 ? today.getFullYear() + 1 : today.getFullYear();
        const month = nextMonth > 11 ? 0 : nextMonth;
        const start = formatDateStr(new Date(year, month, 1));
        const end = formatDateStr(new Date(year, month + 1, 0));
        return { start, end };
      }
      default:
        return { start: null, end: null };
    }
  }, []);

  const handleDateFilter = useCallback((filter) => {
    setDateFilter(filter);
    setCurrentPage(1);
  }, []);

  /* Filtered bookings */
  const filteredBookings = useCallback(() => {
    let result = [...bookings];
    if (activeTab !== 'all') result = result.filter((b) => b.status === activeTab);
    if (filterBranch) result = result.filter((b) => b.branch === filterBranch);
    if (filterFlowerType) result = result.filter((b) => b.flower_type === filterFlowerType);
    if (dateFilter !== 'all') {
      const range = getDateRange(dateFilter);
      if (range.start && range.end) {
        result = result.filter((b) => b.delivery_date >= range.start && b.delivery_date <= range.end);
      }
    }
    if (searchInput.trim()) {
      const q = searchInput.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.customer.toLowerCase().includes(q) ||
          b.booking_id.toLowerCase().includes(q) ||
          b.invoice_number.toLowerCase().includes(q) ||
          b.deceased_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [bookings, activeTab, filterBranch, filterFlowerType, dateFilter, searchInput, getDateRange]);

  const filtered = filteredBookings();
  const totalPages = Math.max(1, Math.ceil(filtered.length / RESULTS_PER_PAGE));
  const pageData = filtered.slice((currentPage - 1) * RESULTS_PER_PAGE, currentPage * RESULTS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [activeTab, filterBranch, filterFlowerType, dateFilter, searchInput]);

  useEffect(() => {
    const handler = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) setActionMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Stats */
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const inProgress = bookings.filter((b) => ['confirmed', 'preparing', 'delivering'].includes(b.status)).length;
    const delivered = bookings.filter((b) => b.status === 'delivered').length;
    const upcoming = bookings.filter((b) => {
      const d = new Date(b.delivery_date + 'T23:59:59');
      return d >= new Date() && b.status !== 'delivered' && b.status !== 'cancelled';
    }).length;
    return { total, pending, inProgress, delivered, upcoming };
  }, [bookings]);

  /* Toasts */
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* Selection */
  const toggleRow = useCallback((bookingId) => {
    setSelectedRows((prev) => prev.includes(bookingId) ? prev.filter((id) => id !== bookingId) : [...prev, bookingId]);
  }, []);
  const toggleSelectAll = useCallback(() => {
    if (selectedRows.length === pageData.length && pageData.length > 0) setSelectedRows([]);
    else setSelectedRows(pageData.map((b) => b.id));
  }, [selectedRows, pageData]);
  const allPageSelected = pageData.length > 0 && pageData.every((b) => selectedRows.includes(b.id));

  /* Drawer */
  const openDrawer = useCallback((booking) => { setSelectedBooking(booking); setDrawerOpen(true); setActionMenuId(null); }, []);
  const closeDrawer = useCallback(() => { setDrawerOpen(false); setSelectedBooking(null); }, []);

  /* New booking */
  const openNewBooking = useCallback((date) => {
    setPrefillDate(date || '');
    setNewBookingOpen(true);
  }, []);
  const closeNewBooking = useCallback(() => { setNewBookingOpen(false); setPrefillDate(''); }, []);

  const handleNewBooking = useCallback((e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newId = bookings.length + 1;
    const newBooking = {
      id: newId,
      booking_id: `FLW-${24000 + newId}`,
      flower_type: fd.get('flower_type'),
      flower_description: `${fd.get('flower_type')} — custom arrangement`,
      service_type: fd.get('service_type'),
      customer: fd.get('customer'),
      customer_phone: fd.get('customer_phone') || '',
      customer_email: fd.get('customer_email') || '',
      deceased_name: fd.get('deceased_name') || '',
      branch: fd.get('branch'),
      delivery_date: fd.get('delivery_date'),
      delivery_time: fd.get('delivery_time'),
      delivery_address: fd.get('delivery_address') || '',
      invoice_number: `INV-${24000 + newId}`,
      amount: parseFloat(fd.get('amount')) || 0,
      status: 'pending',
      notes: fd.get('notes') || '',
      image: `https://picsum.photos/seed/new${Date.now()}/80/80.jpg`,
      created_at: formatDateStr(new Date()),
      urgent: false,
    };
    setBookings((prev) => [newBooking, ...prev]);
    closeNewBooking();
    showToast('Booking created successfully');
    e.target.reset();
  }, [bookings.length, closeNewBooking, showToast]);

  /* Status change */
  const changeStatus = useCallback((bookingId, newStatus) => {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)));
    showToast(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
    setActionMenuId(null);
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
    }
  }, [selectedBooking, showToast]);

  const goToPage = useCallback((p) => { if (p >= 1 && p <= totalPages) setCurrentPage(p); }, [totalPages]);

  const getNextStatuses = (status) => {
    switch (status) {
      case 'pending': return ['confirmed', 'cancelled'];
      case 'confirmed': return ['preparing', 'cancelled'];
      case 'preparing': return ['delivering', 'cancelled'];
      case 'delivering': return ['delivered'];
      case 'delivered': return [];
      case 'cancelled': return ['pending'];
      default: return [];
    }
  };

  /* Pagination render */
  const renderPagination = () => {
    const btns = [];
    btns.push(
      <button key="first" className="fb-page-btn" disabled={currentPage === 1} onClick={() => goToPage(1)}>{Icons.chevFirst}</button>,
      <button key="prev" className="fb-page-btn" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>{Icons.chevLeft}</button>
    );
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1) {
        if (i === 3 || i === totalPages - 2) btns.push(<span key={`dots-${i}`} style={{ padding: '0 0.25rem', color: '#a8a29e', fontSize: '0.8rem' }}>…</span>);
        continue;
      }
      btns.push(<button key={i} className={`fb-page-btn ${currentPage === i ? 'fb-page-btn-active' : ''}`} onClick={() => goToPage(i)}>{i}</button>);
    }
    btns.push(
      <button key="next" className="fb-page-btn" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>{Icons.chevRight}</button>,
      <button key="last" className="fb-page-btn" disabled={currentPage === totalPages} onClick={() => goToPage(totalPages)}>{Icons.chevLast}</button>
    );
    return btns;
  };

  /* Calendar: new booking for specific date */
  const handleNewBookingForDate = useCallback((dateStr) => {
    openNewBooking(dateStr);
  }, [openNewBooking]);

  return (
    <div className="fb-layout">
      {/* ─── Main ─── */}
      <div className="fb-main">
        <header className="fb-topbar">
          <div className="fb-topbar-left">
            <div>
              <h1 className="fb-page-title">Flower Bookings</h1>
              <p className="fb-page-subtitle">Manage funeral flower arrangements and deliveries</p>
            </div>
          </div>
          <div className="fb-topbar-right">
            <button className="fb-icon-btn" title="Notifications">{Icons.bell}</button>
          </div>
        </header>

        <div className="fb-content">
          {/* Dashboard Toggle */}
          <div className="fb-dashboard-toggle">
            <button
              className={`fb-toggle-btn ${showDashboard ? 'fb-toggle-btn-active' : ''}`}
              onClick={() => setShowDashboard(!showDashboard)}
            >
              {showDashboard ? Icons.chevDown : Icons.trendingUp}
              {showDashboard ? 'Hide Dashboard' : 'Show Dashboard'}
            </button>
          </div>

          {/* Dashboard Stats */}
          {showDashboard && <DashboardStats bookings={bookings} />}

          {/* Stats */}
          <div className="fb-stats-grid fb-stats-grid-5">
            <StatCard label="Total Bookings" value={stats.total} sub="All time" icon={<span style={{ color: '#266b52' }}>{Icons.flower}</span>} iconBg="#f0f7f4" />
            <StatCard label="Upcoming" value={stats.upcoming} sub="Future deliveries" icon={<span style={{ color: '#4f46e5' }}>{Icons.calendar}</span>} iconBg="#e0e7ff" subColor="#4f46e5" />
            <StatCard label="Pending" value={stats.pending} sub="Needs attention" icon={<span style={{ color: '#d97706' }}>{Icons.clock}</span>} iconBg="#fef3c7" subColor="#d97706" />
            <StatCard label="In Progress" value={stats.inProgress} sub="Being prepared" icon={<span style={{ color: '#db2777' }}>{Icons.refresh}</span>} iconBg="#fce7f3" subColor="#db2777" />
            <StatCard label="Delivered" value={stats.delivered} sub="Completed" icon={<span style={{ color: '#059669' }}>{Icons.check}</span>} iconBg="#d1fae5" subColor="#059669" />
          </div>

          {/* Table card */}
          <div className="fb-table-card">
            {/* Tabs + View Toggle */}
            <div className="fb-tabs-row">
              <div className="fb-tabs">
                {['all', ...STATUS_LIST].map((tab) => (
                  <button key={tab} className={`fb-tab ${activeTab === tab ? 'fb-tab-active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab === 'all' ? 'All' : STATUS_CONFIG[tab]?.label || tab}
                  </button>
                ))}
              </div>
              <div className="fb-tabs-right">
                <select className="fb-select" value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                  <option value="">All Branches</option>
                  {BRANCHES.map((b) => (<option key={b} value={b}>{b}</option>))}
                </select>
                <div className="fb-view-toggle">
                  <button className={`fb-view-btn ${viewMode === 'table' ? 'fb-view-btn-active' : ''}`} onClick={() => setViewMode('table')} title="Table view">{Icons.list}</button>
                  <button className={`fb-view-btn ${viewMode === 'calendar' ? 'fb-view-btn-active' : ''}`} onClick={() => setViewMode('calendar')} title="Calendar view">{Icons.grid}</button>
                </div>
              </div>
            </div>

            {/* Date Filter Buttons */}
            <div className="fb-date-filters">
              <span className="fb-date-filter-label">Quick Filter:</span>
              <button className={`fb-date-filter-btn ${dateFilter === 'all' ? 'fb-date-filter-active' : ''}`} onClick={() => handleDateFilter('all')}>All</button>
              <button className={`fb-date-filter-btn ${dateFilter === 'today' ? 'fb-date-filter-active' : ''}`} onClick={() => handleDateFilter('today')}>Today</button>
              <button className={`fb-date-filter-btn ${dateFilter === 'tomorrow' ? 'fb-date-filter-active' : ''}`} onClick={() => handleDateFilter('tomorrow')}>Tomorrow</button>
              <button className={`fb-date-filter-btn ${dateFilter === 'thisWeek' ? 'fb-date-filter-active' : ''}`} onClick={() => handleDateFilter('thisWeek')}>This Week</button>
              <button className={`fb-date-filter-btn ${dateFilter === 'nextWeek' ? 'fb-date-filter-active' : ''}`} onClick={() => handleDateFilter('nextWeek')}>Next Week</button>
              <button className={`fb-date-filter-btn ${dateFilter === 'thisMonth' ? 'fb-date-filter-active' : ''}`} onClick={() => handleDateFilter('thisMonth')}>This Month</button>
              <button className={`fb-date-filter-btn ${dateFilter === 'nextMonth' ? 'fb-date-filter-active' : ''}`} onClick={() => handleDateFilter('nextMonth')}>Next Month</button>
            </div>

            {/* Toolbar (table mode only) */}
            {viewMode === 'table' && (
              <div className="fb-toolbar">
                <div className="fb-toolbar-left">
                  <div className="fb-search-wrap">
                    <span className="fb-search-icon">{Icons.search}</span>
                    <input className="fb-input fb-search-input" type="search" placeholder="Search customer, booking ID, invoice..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                  </div>
                  <select className="fb-select" value={filterFlowerType} onChange={(e) => setFilterFlowerType(e.target.value)}>
                    <option value="">All Types</option>
                    {FLOWER_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div className="fb-toolbar-right">
                  {selectedRows.length > 0 && <span className="fb-selection-count">{selectedRows.length} selected</span>}
                  <button className="fb-btn fb-btn-outline" disabled={selectedRows.length === 0} onClick={() => showToast('Invoice generated')}>{Icons.invoice} Make Invoice</button>
                  <button className="fb-btn fb-btn-outline" disabled={selectedRows.length === 0} onClick={() => showToast('Sent to printer')}>{Icons.print} Print</button>
                  <button className="fb-btn fb-btn-primary" onClick={() => openNewBooking('')}>{Icons.plus} New Booking</button>
                </div>
              </div>
            )}

            {/* Calendar toolbar (calendar mode) */}
            {viewMode === 'calendar' && (
              <div className="fb-toolbar">
                <div className="fb-toolbar-left">
                  <div className="fb-search-wrap">
                    <span className="fb-search-icon">{Icons.search}</span>
                    <input className="fb-input fb-search-input" type="search" placeholder="Search bookings..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                  </div>
                  <select className="fb-select" value={filterFlowerType} onChange={(e) => setFilterFlowerType(e.target.value)}>
                    <option value="">All Types</option>
                    {FLOWER_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div className="fb-toolbar-right">
                  <button className="fb-btn fb-btn-primary" onClick={() => openNewBooking(selectedDate)}>{Icons.plus} New Booking</button>
                </div>
              </div>
            )}

            {/* ─── TABLE VIEW ─── */}
            {viewMode === 'table' && (
              <>
                <div className="fb-table-wrap">
                  <table className="fb-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}><Checkbox checked={allPageSelected} onChange={toggleSelectAll} /></th>
                        <th>Arrangement</th>
                        <th>Booking ID</th>
                        <th>Service</th>
                        <th>Customer</th>
                        <th>Branch</th>
                        <th>Delivery</th>
                        <th style={{ minWidth: 120 }}>Progress</th>
                        <th>Status</th>
                        <th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.map((booking) => {
                        const cfg = STATUS_CONFIG[booking.status];
                        const isSelected = selectedRows.includes(booking.id);
                        return (
                          <tr key={booking.id} className={`fb-table-row ${isSelected ? 'fb-table-row-selected' : ''} ${booking.urgent ? 'fb-table-row-urgent' : ''}`} onClick={() => openDrawer(booking)}>
                            <td onClick={(e) => e.stopPropagation()}><Checkbox checked={isSelected} onChange={() => toggleRow(booking.id)} /></td>
                            <td>
                              <div className="fb-flower-cell">
                                <img src={booking.image} alt="" className="fb-flower-img" loading="lazy" />
                                <div>
                                  <div className="fb-flower-name">{booking.flower_type}</div>
                                  <div className="fb-flower-desc">{booking.flower_description}</div>
                                </div>
                              </div>
                            </td>
                            <td><span className="fb-mono">{booking.booking_id}</span></td>
                            <td>{booking.service_type}</td>
                            <td>
                              <div className="fb-cell-main">{booking.customer}</div>
                              <div className="fb-cell-sub">{booking.deceased_name}</div>
                            </td>
                            <td><span className="fb-branch-tag">{booking.branch}</span></td>
                            <td>
                              <div className="fb-cell-main">{booking.delivery_date}</div>
                              <div className="fb-cell-sub">{booking.delivery_time}</div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <ProgressBar value={cfg.progress} color={cfg.color} />
                                <span style={{ fontSize: '0.7rem', color: '#a8a29e', fontWeight: 500 }}>{cfg.progress}%</span>
                              </div>
                            </td>
                            <td><StatusBadge status={booking.status} /></td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <div style={{ position: 'relative' }} ref={actionMenuId === booking.id ? actionMenuRef : null}>
                                <button className="fb-icon-btn" onClick={() => setActionMenuId(actionMenuId === booking.id ? null : booking.id)}>{Icons.moreV}</button>
                                {actionMenuId === booking.id && (
                                  <div className="fb-action-menu">
                                    <div className="fb-action-menu-label">Change Status</div>
                                    {getNextStatuses(booking.status).map((s) => (
                                      <button key={s} className="fb-action-menu-item" onClick={() => changeStatus(booking.id, s)}>
                                        <span className="fb-badge-dot" style={{ background: STATUS_CONFIG[s].dotColor }} />
                                        {STATUS_CONFIG[s].label}
                                      </button>
                                    ))}
                                    <div style={{ borderTop: '1px solid #e7e5e4', margin: '0.25rem 0' }} />
                                    <button className="fb-action-menu-item" onClick={() => openDrawer(booking)}>View Details</button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {pageData.length === 0 && (
                  <div className="fb-empty-state">
                    <span style={{ color: '#a8a29e', display: 'block', marginBottom: '0.75rem' }}>{Icons.search}</span>
                    <p className="fb-empty-title">No bookings found</p>
                    <p className="fb-empty-sub">Try adjusting your search or filters</p>
                  </div>
                )}
                <div className="fb-pagination">
                  <span className="fb-pagination-info">
                    {filtered.length > 0 ? `${(currentPage - 1) * RESULTS_PER_PAGE + 1}–${Math.min(currentPage * RESULTS_PER_PAGE, filtered.length)} of ${filtered.length} bookings` : '0 bookings'}
                  </span>
                  <div className="fb-pagination-controls">{renderPagination()}</div>
                </div>
              </>
            )}

            {/* ─── CALENDAR VIEW ─── */}
            {viewMode === 'calendar' && (
              <CalendarView
                bookings={filtered}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onOpenBooking={openDrawer}
                onNewBookingForDate={handleNewBookingForDate}
              />
            )}
          </div>
        </div>
      </div>

      {/* ─── Detail Drawer ─── */}
      <div className={`fb-drawer-overlay ${drawerOpen ? 'fb-drawer-overlay-open' : ''}`} onClick={closeDrawer} />
      <div className={`fb-drawer ${drawerOpen ? 'fb-drawer-open' : ''}`}>
        {selectedBooking && (
          <>
            <div className="fb-drawer-header">
              <div>
                <h2 className="fb-drawer-title">{selectedBooking.booking_id}</h2>
                <p className="fb-drawer-subtitle">
                  <StatusBadge status={selectedBooking.status} />
                  {selectedBooking.urgent && <span className="fb-urgent-tag" style={{ marginLeft: '0.5rem' }}>Urgent</span>}
                </p>
              </div>
              <button className="fb-icon-btn" onClick={closeDrawer}>{Icons.x}</button>
            </div>
            <div className="fb-drawer-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="fb-detail-label">Order Progress</div>
                <StatusTimeline currentStatus={selectedBooking.status} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: '#fafaf9', borderRadius: '0.5rem' }}>
                <img src={selectedBooking.image} alt="" className="fb-drawer-flower-img" />
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.15rem' }}>{selectedBooking.flower_type}</div>
                  <div style={{ fontSize: '0.82rem', color: '#78716c', lineHeight: 1.4 }}>{selectedBooking.flower_description}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#266b52', marginTop: '0.5rem' }}>${selectedBooking.amount.toFixed(2)}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <DetailField label="Customer">{selectedBooking.customer}</DetailField>
                <DetailField label="Deceased">{selectedBooking.deceased_name || '—'}</DetailField>
                <DetailField label="Service Type">{selectedBooking.service_type}</DetailField>
                <DetailField label="Branch">{selectedBooking.branch}</DetailField>
                <DetailField label="Delivery Date">{selectedBooking.delivery_date}</DetailField>
                <DetailField label="Delivery Time">{selectedBooking.delivery_time}</DetailField>
                <DetailField label="Invoice">{selectedBooking.invoice_number}</DetailField>
                <DetailField label="Created">{selectedBooking.created_at}</DetailField>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="fb-detail-label" style={{ marginBottom: '0.5rem' }}>Customer Contact</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedBooking.customer_phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ color: '#a8a29e', display: 'flex' }}>{Icons.phone}</span>{selectedBooking.customer_phone}
                    </div>
                  )}
                  {selectedBooking.customer_email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ color: '#a8a29e', display: 'flex' }}>{Icons.mail}</span>{selectedBooking.customer_email}
                    </div>
                  )}
                  {selectedBooking.delivery_address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ color: '#a8a29e', display: 'flex' }}>{Icons.mapPin}</span>{selectedBooking.delivery_address}
                    </div>
                  )}
                </div>
              </div>
              {selectedBooking.notes && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div className="fb-detail-label">Notes</div>
                  <div className="fb-notes-box">{selectedBooking.notes}</div>
                </div>
              )}
              <div style={{ borderTop: '1px solid #e7e5e4', paddingTop: '1.25rem' }}>
                <div className="fb-detail-label" style={{ marginBottom: '0.5rem' }}>Quick Actions</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {getNextStatuses(selectedBooking.status).map((s) => (
                    <button key={s} className="fb-btn fb-btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={() => changeStatus(selectedBooking.id, s)}>
                      Move to {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                  <button className="fb-btn fb-btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={() => showToast('Invoice generated')}>{Icons.invoice} Invoice</button>
                  <button className="fb-btn fb-btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={() => showToast('Sent to printer')}>{Icons.print} Print</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ─── New Booking Drawer ─── */}
      <div className={`fb-drawer-overlay ${newBookingOpen ? 'fb-drawer-overlay-open' : ''}`} onClick={closeNewBooking} />
      <div className={`fb-drawer fb-drawer-wide ${newBookingOpen ? 'fb-drawer-open' : ''}`}>
        <div className="fb-drawer-header">
          <div>
            <h2 className="fb-drawer-title">New Flower Booking</h2>
            <p className="fb-drawer-subtitle">Create a new funeral flower arrangement booking</p>
          </div>
          <button className="fb-icon-btn" onClick={closeNewBooking}>{Icons.x}</button>
        </div>
        <div className="fb-drawer-body">
          <form onSubmit={handleNewBooking} className="fb-form">
            <div className="fb-form-grid-2">
              <div className="fb-form-field">
                <label className="fb-form-label">Customer Name *</label>
                <input className="fb-input" name="customer" placeholder="Full name" required />
              </div>
              <div className="fb-form-field">
                <label className="fb-form-label">Deceased Name</label>
                <input className="fb-input" name="deceased_name" placeholder="Name of the deceased" />
              </div>
            </div>
            <div className="fb-form-grid-2">
              <div className="fb-form-field">
                <label className="fb-form-label">Flower Type *</label>
                <select className="fb-select fb-select-full" name="flower_type" required defaultValue="">
                  <option value="" disabled>Select type</option>
                  {FLOWER_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
              <div className="fb-form-field">
                <label className="fb-form-label">Service Type *</label>
                <select className="fb-select fb-select-full" name="service_type" required defaultValue="">
                  <option value="" disabled>Select service</option>
                  {SERVICE_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
            </div>
            <div className="fb-form-grid-2">
              <div className="fb-form-field">
                <label className="fb-form-label">Branch *</label>
                <select className="fb-select fb-select-full" name="branch" required defaultValue="">
                  <option value="" disabled>Select branch</option>
                  {BRANCHES.map((b) => (<option key={b} value={b}>{b}</option>))}
                </select>
              </div>
              <div className="fb-form-field">
                <label className="fb-form-label">Delivery Date *</label>
                <input className="fb-input" type="date" name="delivery_date" required defaultValue={prefillDate} />
              </div>
            </div>
            <div className="fb-form-grid-3">
              <div className="fb-form-field">
                <label className="fb-form-label">Delivery Time *</label>
                <input className="fb-input" type="time" name="delivery_time" required />
              </div>
              <div className="fb-form-field">
                <label className="fb-form-label">Amount ($) *</label>
                <input className="fb-input" type="number" name="amount" min="0" step="0.01" placeholder="0.00" required />
              </div>
              <div className="fb-form-field">
                <label className="fb-form-label">Customer Phone</label>
                <input className="fb-input" type="tel" name="customer_phone" placeholder="(555) 000-0000" />
              </div>
            </div>
            <div className="fb-form-grid-2">
              <div className="fb-form-field">
                <label className="fb-form-label">Customer Email</label>
                <input className="fb-input" type="email" name="customer_email" placeholder="email@example.com" />
              </div>
              <div className="fb-form-field">
                <label className="fb-form-label">Delivery Address</label>
                <input className="fb-input" name="delivery_address" placeholder="Full address" />
              </div>
            </div>
            <div className="fb-form-field">
              <label className="fb-form-label">Notes</label>
              <textarea className="fb-textarea" name="notes" rows={3} placeholder="Special instructions, preferences..." />
            </div>
            <div className="fb-form-actions">
              <button type="button" className="fb-btn fb-btn-outline" onClick={closeNewBooking}>Cancel</button>
              <button type="submit" className="fb-btn fb-btn-primary">Create Booking</button>
            </div>
          </form>
        </div>
      </div>

      {/* ─── Toasts ─── */}
      <div className="fb-toast-container">
        {toasts.map((t) => <Toast key={t.id} message={t.message} type={t.type} onDone={() => removeToast(t.id)} />)}
      </div>
    </div>
  );
};

export default FlowerBookings;