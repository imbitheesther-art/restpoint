import React from 'react';

// ─── Base Props ───────────────────────────────────────────────────────────────
const defaultProps = {
  size: 24,
  strokeWidth: 2,
  stroke: 'currentColor',
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

// Rose-red accent for important icons
const ACCENT = '#E11D48';

// ─── Icon Wrapper ─────────────────────────────────────────────────────────────
const Icon = ({ children, accent, color, ...props }) => {
  const p = { ...defaultProps, ...props };
  if (accent) p.stroke = ACCENT;
  if (color) p.stroke = color;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={p.size}
      height={p.size}
      viewBox="0 0 24 24"
      fill={p.fill}
      stroke={p.stroke}
      strokeWidth={p.strokeWidth}
      strokeLinecap={p.strokeLinecap}
      strokeLinejoin={p.strokeLinejoin}
      className={p.className}
      style={p.style}
    >
      {children}
    </svg>
  );
};

// ─── Navigation & Layout ─────────────────────────────────────────────────────
export const Home = (p) => (
  <Icon {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></Icon>
);

export const Menu = (p) => (
  <Icon {...p}><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></Icon>
);

export const ArrowLeft = (p) => (
  <Icon {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon>
);

export const ArrowRight = (p) => (
  <Icon {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
);

export const ArrowUp = (p) => (
  <Icon {...p}><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></Icon>
);

export const ArrowDown = (p) => (
  <Icon {...p}><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></Icon>
);

export const ChevronDown = (p) => (
  <Icon {...p}><polyline points="6 9 12 15 18 9" /></Icon>
);

export const ChevronRight = (p) => (
  <Icon {...p}><polyline points="9 18 15 12 9 6" /></Icon>
);

export const ChevronUp = (p) => (
  <Icon {...p}><polyline points="18 15 12 9 6 15" /></Icon>
);

export const ChevronLeft = (p) => (
  <Icon {...p}><polyline points="15 18 9 12 15 6" /></Icon>
);

export const ChevronFirst = (p) => (
  <Icon {...p}><polyline points="11 17 6 12 11 7" /><path d="M18 18V6" /></Icon>
);

export const ChevronLast = (p) => (
  <Icon {...p}><polyline points="13 17 18 12 13 7" /><path d="M6 18V6" /></Icon>
);

export const Grid = (p) => (
  <Icon {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></Icon>
);

export const List = (p) => (
  <Icon {...p}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></Icon>
);

export const Columns = (p) => (
  <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="3" x2="12" y2="21" /></Icon>
);

export const Maximize2 = (p) => (
  <Icon {...p}><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></Icon>
);

export const Minimize2 = (p) => (
  <Icon {...p}><polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" /></Icon>
);

export const ExternalLink = (p) => (
  <Icon {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></Icon>
);

// ─── Layouts ─────────────────────────────────────────────────────────────────
export const LayoutDashboard = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </Icon>
);

export const Layers = (p) => (
  <Icon {...p}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </Icon>
);

// ─── User & People ───────────────────────────────────────────────────────────
export const User = (p) => (
  <Icon {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>
);

export const Users = (p) => (
  <Icon {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>
);

export const Users2 = (p) => (
  <Icon {...p}><path d="M14 19c0-3.31 2.69-6 6-6" /><path d="M18 15v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="10" cy="6" r="3" /><circle cx="20" cy="10" r="2" /><path d="M4 19c0-3.31 2.69-6 6-6" /></Icon>
);

export const UserPlus = (p) => (
  <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></Icon>
);

export const UserCheck = (p) => (
  <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></Icon>
);

export const UserMinus = (p) => (
  <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="23" y1="11" x2="17" y2="11" /></Icon>
);

// ─── Status & Alerts ─────────────────────────────────────────────────────────
export const Check = (p) => (
  <Icon {...p}><polyline points="20 6 9 17 4 12" /></Icon>
);

export const CheckCircle = (p) => (
  <Icon {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Icon>
);

export const X = (p) => (
  <Icon {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
);

export const XCircle = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></Icon>
);

export const AlertCircle = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon>
);

export const AlertTriangle = (p) => (
  <Icon {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>
);

export const Loader2 = (p) => (
  <Icon {...p}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></Icon>
);

export const Info = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></Icon>
);

export const Circle = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="10" /></Icon>
);

export const CircleDot = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="1" fill="currentColor" /></Icon>
);

// ─── Time & Calendar ─────────────────────────────────────────────────────────
export const Clock = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon>
);

export const Timer = (p) => (
  <Icon {...p}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M5 3L2 6" /><path d="M22 6l-3-3" /><path d="M12 2v3" /></Icon>
);

export const History = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon>
);

export const Calendar = (p) => (
  <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></Icon>
);

export const CalendarDays = (p) => (
  <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></Icon>
);

// ─── Files & Documents ───────────────────────────────────────────────────────
export const FileText = (p) => (
  <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></Icon>
);

export const FileImage = (p) => (
  <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><circle cx="10" cy="13" r="2" /><path d="M20 17l-4.5-4.5-3 3L8 12l-3 3" /></Icon>
);

export const FileSpreadsheet = (p) => (
  <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><line x1="12" y1="13" x2="12" y2="17" /></Icon>
);

export const ClipboardList = (p) => (
  <Icon {...p}><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></Icon>
);

// ─── News & Media ────────────────────────────────────────────────────────────
export const Newspaper = (p) => (
  <Icon {...p}>
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8" />
    <path d="M15 18h-5" />
    <path d="M10 6h8v4h-8V6Z" />
  </Icon>
);

// ─── Location & Map ──────────────────────────────────────────────────────────
export const MapPin = (p) => (
  <Icon {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></Icon>
);

export const Globe = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></Icon>
);

export const Navigation = (p) => (
  <Icon {...p}><polygon points="3 11 22 2 13 21 11 13 3 11" /></Icon>
);

export const Route = (p) => (
  <Icon {...p}><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></Icon>
);

// ─── Money & Finance ─────────────────────────────────────────────────────────
export const DollarSign = (p) => (
  <Icon {...p}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></Icon>
);

export const CreditCard = (p) => (
  <Icon {...p}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></Icon>
);

export const Receipt = (p) => (
  <Icon {...p}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="12" y2="16" /></Icon>
);

export const Wallet = (p) => (
  <Icon {...p}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 1 1 0 4h-4a2 2 0 1 1 0-4h4" /></Icon>
);

// ─── Actions & Operations ────────────────────────────────────────────────────
export const Plus = (p) => (
  <Icon {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>
);

export const PlusCircle = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></Icon>
);

export const Save = (p) => (
  <Icon {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></Icon>
);

export const Edit = (p) => (
  <Icon {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></Icon>
);

export const Edit3 = (p) => (
  <Icon {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></Icon>
);

export const Trash2 = (p) => (
  <Icon {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></Icon>
);

export const Download = (p) => (
  <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Icon>
);

export const Upload = (p) => (
  <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></Icon>
);

export const Printer = (p) => (
  <Icon {...p}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></Icon>
);

export const Search = (p) => (
  <Icon {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>
);

export const Filter = (p) => (
  <Icon {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></Icon>
);

export const SlidersHorizontal = (p) => (
  <Icon {...p}><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></Icon>
);

export const MoreVertical = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></Icon>
);

export const ZoomIn = (p) => (
  <Icon {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></Icon>
);

export const ZoomOut = (p) => (
  <Icon {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></Icon>
);

export const Copy = (p) => (
  <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Icon>
);

export const Send = (p) => (
  <Icon {...p}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></Icon>
);

export const Share2 = (p) => (
  <Icon {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></Icon>
);

export const RefreshCw = (p) => (
  <Icon {...p}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></Icon>
);

export const RotateCw = (p) => (
  <Icon {...p}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></Icon>
);

export const RotateCcw = (p) => (
  <Icon {...p}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></Icon>
);

export const Hash = (p) => (
  <Icon {...p}><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="14" y1="3" x2="16" y2="21" /></Icon>
);

export const Tag = (p) => (
  <Icon {...p}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><circle cx="7" cy="7" r="1" fill="currentColor" /></Icon>
);

export const QrCode = (p) => (
  <Icon {...p}><rect x="2" y="2" width="8" height="8" rx="1" /><rect x="14" y="2" width="8" height="8" rx="1" /><rect x="2" y="14" width="8" height="8" rx="1" /><rect x="14" y="14" width="4" height="4" rx="1" /><rect x="20" y="14" width="2" height="2" /><rect x="14" y="20" width="2" height="2" /><rect x="20" y="20" width="2" height="2" /></Icon>
);

export const ScanBarcode = (p) => (
  <Icon {...p}><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="7" y1="8" x2="7" y2="16" /><line x1="11" y1="8" x2="11" y2="16" /><line x1="15" y1="8" x2="15" y2="16" /></Icon>
);

// ─── Communications ──────────────────────────────────────────────────────────
export const Phone = (p) => (
  <Icon {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></Icon>
);

export const Mail = (p) => (
  <Icon {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22 6 12 13 2 6" /></Icon>
);

export const Bell = (p) => (
  <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></Icon>
);

export const MessageCircle = (p) => (
  <Icon {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></Icon>
);

export const MessageSquare = (p) => (
  <Icon {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Icon>
);

// ─── Security & Identification ───────────────────────────────────────────────
export const Shield = (p) => (
  <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Icon>
);

export const IdCard = (p) => (
  <Icon {...p}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></Icon>
);

export const ShieldCheck = (p) => (
  <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></Icon>
);

export const Lock = (p) => (
  <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>
);

export const KeyRound = (p) => (
  <Icon {...p}><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></Icon>
);

export const Eye = (p) => (
  <Icon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Icon>
);

export const EyeOff = (p) => (
  <Icon {...p}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></Icon>
);

// ─── Server & Infrastructure ─────────────────────────────────────────────────
export const Server = (p) => (
  <Icon {...p}>
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </Icon>
);

// ─── Vehicles & Transport ────────────────────────────────────────────────────
export const Truck = (p) => (
  <Icon {...p}><rect x="1" y="3" width="15" height="13" rx="2" ry="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></Icon>
);

export const Car = (p) => (
  <Icon {...p}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.6A1 1 0 0 0 14.5 6h-5.1a1 1 0 0 0-.8.4L5.9 10l-2.5.6A2 2 0 0 0 2 12.5v3.5c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></Icon>
);

export const Fuel = (p) => (
  <Icon {...p}><line x1="3" y1="22" x2="21" y2="22" /><path d="M6 22v-6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" /><path d="M18 13v-4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v4" /><line x1="12" y1="7" x2="12" y2="11" /></Icon>
);

export const Gauge = (p) => (
  <Icon {...p}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" /><path d="M12 6v6l4 2" /></Icon>
);

// ─── Medical & Laboratory ────────────────────────────────────────────────────
export const Beaker = (p) => (
  <Icon {...p}><path d="M4.5 3h15" /><path d="M6 3v12a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V3" /><path d="M10 7v4" /><path d="M14 7v4" /><path d="M8 11h8" /></Icon>
);

export const FlaskConical = (p) => (
  <Icon {...p}><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" /><path d="M8.5 2h7" /><path d="M7 16.5h10" /></Icon>
);

export const Syringe = (p) => (
  <Icon {...p}><path d="m18 2 4 4" /><path d="m17 7 3-3" /><path d="M19 9 8.7 19.3c-.4.4-1 .4-1.4 0l-2.6-2.6c-.4-.4-.4-1 0-1.4L15 5" /><path d="m9 11 4 4" /><path d="m5 15 4 4" /><path d="m7 13 4 4" /></Icon>
);

export const Stethoscope = (p) => (
  <Icon {...p}><path d="M4.8 2.3A.3.3 0 1 0 5.1 2H6a2 2 0 0 1 2 2v5a6 6 0 0 0 12 0V4a2 2 0 0 1 2-2h.9a.3.3 0 1 0 .3-.3" /><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" /></Icon>
);

export const TestTube2 = (p) => (
  <Icon {...p}><path d="M5 3v12a7 7 0 0 0 14 0V3" /><path d="M11 3v9" /><path d="M13 3v9" /><path d="M8 15h8" /></Icon>
);

// ─── Analytics & Charts ──────────────────────────────────────────────────────
export const TrendingUp = (p) => (
  <Icon {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></Icon>
);

export const BarChart3 = (p) => (
  <Icon {...p}><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></Icon>
);

export const BarChart2 = (p) => (
  <Icon {...p}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></Icon>
);

export const Activity = (p) => (
  <Icon {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></Icon>
);

export const PieChartIcon = (p) => (
  <Icon {...p}><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></Icon>
);

// ─── Objects & Items ─────────────────────────────────────────────────────────
export const Box = (p) => (
  <Icon {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></Icon>
);

export const Package = (p) => (
  <Icon {...p}><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></Icon>
);

export const ShoppingCart = (p) => (
  <Icon {...p}><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></Icon>
);

export const Trophy = (p) => (
  <Icon {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" /></Icon>
);

export const Star = (p) => (
  <Icon {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></Icon>
);

export const Flower2 = (p) => (
  <Icon {...p}><path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1m-4.5 4.5L8 14m8-3l.5.5M12 12v4m-4.5 1.5L8 16m4-4l-4 4m4-4l4 4m0-4l-4 4" /><circle cx="12" cy="12" r="3" /></Icon>
);

export const HardDrive = (p) => (
  <Icon {...p}><line x1="22" y1="12" x2="2" y2="12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /><line x1="6" y1="16" x2="6.01" y2="16" /><line x1="10" y1="16" x2="10.01" y2="16" /></Icon>
);

export const Type = (p) => (
  <Icon {...p}><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></Icon>
);

// ─── Targets & Goals ─────────────────────────────────────────────────────────
export const Target = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></Icon>
);

export const GitCompareArrows = (p) => (
  <Icon {...p}><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M11 18H8a2 2 0 0 1-2-2V9" /></Icon>
);

// ─── Buildings & Places ─────────────────────────────────────────────────────
export const Building2 = (p) => (
  <Icon {...p}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></Icon>
);

// ─── Misc ────────────────────────────────────────────────────────────────────
export const Heart = (p) => (
  <Icon {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></Icon>
);

export const Zap = (p) => (
  <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></Icon>
);

export const Settings = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></Icon>
);

export const LogOut = (p) => (
  <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Icon>
);

export const Sun = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></Icon>
);

export const Github = (p) => (
  <Icon {...p}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></Icon>
);

export const Linkedin = (p) => (
  <Icon {...p}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></Icon>
);

export const Twitter = (p) => (
  <Icon {...p}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></Icon>
);

export const Moon = (p) => (
  <Icon {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></Icon>
);

export const CloudSun = (p) => (
  <Icon {...p}><path d="M12 2v2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M20 12h2" /><path d="M19.07 4.93l-1.41 1.41" /><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" /><path d="M13 22H7a5 5 0 0 1-.33-9.976A6 6 0 0 1 15.947 12.65" /></Icon>
);

export const Play = (p) => (
  <Icon {...p}><polygon points="5 3 19 12 5 21 5 3" /></Icon>
);

export const Pause = (p) => (
  <Icon {...p}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></Icon>
);

export const Smartphone = (p) => (
  <Icon {...p}><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></Icon>
);

export const Camera = (p) => (
  <Icon {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></Icon>
);

export const Wifi = (p) => (
  <Icon {...p}><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></Icon>
);

export const WifiOff = (p) => (
  <Icon {...p}><line x1="1" y1="1" x2="23" y2="23" /><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" /><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" /><path d="M10.71 5.05A16 16 0 0 1 22.56 9" /><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></Icon>
);



export const Mark = ({ size = 28, color = C.verdigris }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="1.5" />
    <path d="M16 8V24M8 16H24" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="16" r="3.5" fill={color} />
  </svg>
);

export const FileBarChart = (p) => (
  <Icon {...p}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M8 13v4" />
    <path d="M12 15v2" />
    <path d="M16 11v6" />
  </Icon>
);

export const Hammer = (p) => (
  <Icon {...p}>
    <path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
    <path d="M17.64 15 22 10.64" />
    <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
  </Icon>
);



export const LifeBuoy = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
    <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
    <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
    <line x1="14.83" y1="9.17" x2="18.36" y2="5.64" />
    <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
  </Icon>
);


export const CalendarClock = (p) => (
  <Icon {...p}>
    <path d="M21 7.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
    <path d="M16 14a4 4 0 1 0 0 8" />
    <path d="M18 16l-2 2" />
    <path d="M18 16v4" />
  </Icon>
);


export const ClipboardCheck = (p) => (
  <Icon {...p}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="m9 14 2 2 4-4" />
  </Icon>
);



export const Wrench = (p) => (
  <Icon {...p}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </Icon>
);


// ─── Font Awesome Aliases (for backward compatibility) ──────────────────────
export const FaArrowDown = ArrowDown;
export const FaArrowUp = ArrowUp;
export const FaChevronDown = ChevronDown;
export const FaSearch = Search;
export const FaPlus = Plus;
export const FaEye = Eye;
export const FaCheck = Check;
export const FaTimes = X;
export const FaDollarSign = DollarSign;
export const FaClock = Clock;
export const FaTruck = Truck;
export const FaTag = Tag;
export const FaBox = Box;
export const FaUser = User;
export const FaBell = Bell;
export const FaUsers = Users;
export const FaInfoCircle = Info;
export const FaTimesCircle = XCircle;
export const FaCheckDouble = (p) => <Icon {...p}><polyline points="2 12 7 17 13 5" /><polyline points="9 12 14 17 20 5" /></Icon>;
export const FaCircleXmark = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></Icon>;
export const FaTriangleExclamation = (p) => <Icon {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>;
export const FaCross = (p) => <Icon {...p}><path d="M12 2v20M2 12h20" strokeWidth="3" /></Icon>;
export const FaThLarge = (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></Icon>;
export const FaBoxesStacked = (p) => <Icon {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></Icon>;
export const FaCalendarCheck = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><polyline points="9 16 11 18 15 14" /></Icon>;
export const FaHandshakeAngle = (p) => <Icon {...p}><path d="M11 17a1 1 0 0 1-1-1c0-.6.4-1 1-1h2a1 1 0 0 1 1 1v1" /><path d="M7 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3" /><path d="M17 14h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-3" /><circle cx="12" cy="10" r="3" /><path d="M12 13v4" /></Icon>;
export const FaChartBar = (p) => <Icon {...p}><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></Icon>;
export const FaCalendarDay = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></Icon>;
export const FaCalendarXmark = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="10" y1="14" x2="14" y2="18" /><line x1="14" y1="14" x2="10" y2="18" /></Icon>;
export const FaInbox = (p) => <Icon {...p}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></Icon>;
export const FaPaperPlane = (p) => <Icon {...p}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></Icon>;
export const FaBan = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></Icon>;
export const FaSeedling = (p) => <Icon {...p}><path d="M12 22v-7" /><path d="M7 8c0-2.8 2.2-5 5-5s5 2.2 5 5" /><path d="M7 8c0 2.8 2.2 5 5 5" /><path d="M5 8h14" /></Icon>;
export const FaImage = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></Icon>;
export const FaStarOfDavid = (p) => <Icon {...p}><polygon points="12 2 15 8 21 8 16 13 18 19 12 15 6 19 8 13 3 8 9 8" /></Icon>;
export const FaMinusCircle = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></Icon>;
export const FaFlag = (p) => <Icon {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></Icon>;
export const FaPalette = (p) => <Icon {...p}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.5-4.5-10-10-10z" /></Icon>;
export const FaPenFancy = (p) => <Icon {...p}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></Icon>;
export const FaSignOutAlt = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Icon>;
export const FaCog = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></Icon>;
export const CheckCheck = (p) => (
  <Icon {...p}><polyline points="2 12 7 17 13 5" /><polyline points="9 12 14 17 20 5" /></Icon>
);
export const FaReceipt = Receipt;

// ─── Aggregate Object (convenience) ──────────────────────────────────────────
export const Icons = {
  // Navigation & Layout
  FileBarChart, Hammer, MessageSquare, Target,  Wrench  ,     ClipboardCheck  ,   LifeBuoy, Home, Menu, ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  ChevronDown, ChevronRight, ChevronUp, ChevronLeft, ChevronFirst, ChevronLast,
  Grid, List, Columns, Maximize2, Minimize2, ExternalLink,
  LayoutDashboard, Layers, Mark,  CalendarClock   , 
  // User & People
  User, Users, Users2, UserPlus, UserCheck, UserMinus,
  // Status & Alerts
  Check, CheckCircle, X, XCircle, AlertCircle, AlertTriangle, Loader2, Info, Circle, CircleDot,
  // Time & Calendar
  Clock, Timer, History, Calendar, CalendarDays,
  // Files & Documents
  FileText, FileImage, FileSpreadsheet, ClipboardList,
  // News & Media
  Newspaper,
  // Location & Map
  MapPin, Globe, Navigation, Route,
  // Money & Finance
  DollarSign, CreditCard, Receipt, Wallet,
  // Actions & Operations
  Plus, PlusCircle, Save, Edit, Edit3, Trash2, Download, Upload, Printer,
  Search, Filter, SlidersHorizontal, MoreVertical, ZoomIn, ZoomOut, Copy, Send, Share2,
  RefreshCw, RotateCw, RotateCcw, Hash, Tag, QrCode, ScanBarcode,
  // Communications
  Phone, Mail, Bell, MessageCircle, MessageSquare,
  // Security
  Shield, ShieldCheck, Lock, KeyRound, Eye, EyeOff,
  // Server & Infrastructure
  Server,
  // Vehicles & Transport
  Truck, Car, Fuel, Gauge,
  // Medical & Laboratory
  Beaker, FlaskConical, Syringe, Stethoscope, TestTube2,
  // Analytics & Charts
  TrendingUp, BarChart3, BarChart2, Activity, PieChartIcon,
  // Objects & Items
  Box, Package, ShoppingCart, Trophy, Star, Flower2, HardDrive, Type,
  // Targets & Goals
  Target, GitCompareArrows,
  // Buildings & Places
  Building2,
  // Misc
  Heart, Zap, Settings, LogOut,
  Sun, Moon, CloudSun, Play, Pause, Smartphone, Camera, Wifi, WifiOff, Github, Linkedin, Twitter,
};

export default Icons;