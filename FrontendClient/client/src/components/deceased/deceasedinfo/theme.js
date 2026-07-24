// Shared theme for deceased management components
export const C = {
  black: '#0a0a0a',
  dark: '#1a1a1a',
  mid: '#444444',
  gray: '#777777',
  lightGray: '#aaaaaa',
  border: '#c8c8c8',
  borderLight: '#e0e0e0',
  bgField: '#f7f7f5',
  bgSection: '#fafaf9',
  bgApp: '#ececec',
  success: '#059669',
  successBg: '#ecfdf5',
  warning: '#d97706',
  warningBg: '#fef3c7',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  info: '#2563eb',
  infoBg: '#eff6ff',
  brown: '#795548',
};

export const formatDate = (dt) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getInitials = (name) => {
  if (!name) return 'NA';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const getDaysInMorgue = (admittedDate) => {
  if (!admittedDate) return 0;
  const parsed = new Date(admittedDate);
  if (isNaN(parsed.getTime())) return 0;
  return Math.floor((new Date() - parsed) / (1000 * 60 * 60 * 24));
};
