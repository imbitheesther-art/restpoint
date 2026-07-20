import React, { useState } from 'react';

// ============================================================
// SVG ICON LIBRARY (inline, no external deps)
// ============================================================

const Icons = {
  bank: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M3 21h18"/>
      <path d="M5 21V7l7-4 7 4v14"/>
      <path d="M9 21v-6h6v6"/>
      <path d="M9 9h.01"/>
      <path d="M15 9h.01"/>
      <path d="M9 13h.01"/>
      <path d="M15 13h.01"/>
    </svg>
  ),
  shield: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  wallet: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
      <circle cx="18" cy="14" r="1"/>
    </svg>
  ),
  trendUp: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  trendDown: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
      <polyline points="17 18 23 18 23 12"/>
    </svg>
  ),
  fileText: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  ),
  clock: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  check: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  alert: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  x: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  hourglass: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M6 2h12"/>
      <path d="M6 22h12"/>
      <path d="M6 2v4l6 6-6 6v4"/>
      <path d="M18 2v4l-6 6 6 6v4"/>
    </svg>
  ),
  user: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  building: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <path d="M9 22V12h6v10"/>
      <path d="M8 6h.01"/>
      <path d="M16 6h.01"/>
      <path d="M12 6h.01"/>
      <path d="M12 10h.01"/>
      <path d="M12 14h.01"/>
      <path d="M16 10h.01"/>
      <path d="M16 14h.01"/>
      <path d="M8 10h.01"/>
      <path d="M8 14h.01"/>
    </svg>
  ),
  creditCard: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  pieChart: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
      <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  ),
  arrowRight: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  eye: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  copy: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  dollarSign: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  scales: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="12" y1="3" x2="12" y2="21"/>
      <path d="M4 7l4 8 4-8"/>
      <path d="M12 7l4 8 4-8"/>
      <line x1="2" y1="21" x2="22" y2="21"/>
    </svg>
  ),
  gavel: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14.5 2.5l5 5"/>
      <path d="M18.5 6.5l-2-2"/>
      <path d="M2 22l7-7"/>
      <path d="M6 18L2 22"/>
      <path d="M9.5 5.5l5 5"/>
      <path d="M14.5 10.5L12 8"/>
      <path d="M7 13l-2 2"/>
    </svg>
  ),
  lock: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      <circle cx="12" cy="16" r="1"/>
    </svg>
  ),
  unlock: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
    </svg>
  ),
  sparkles: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 3l1.912 5.813L20 10l-6.088 1.187L12 17l-1.912-5.813L4 10l6.088-1.187z"/>
      <path d="M18 14l.944 2.868L22 18l-3.056.632L18 21.5l-.944-2.868L14 18l3.056-.632z"/>
      <path d="M5 1l.5 1.5L7 3l-1.5.5L5 5l-.5-1.5L3 3l1.5-.5z"/>
    </svg>
  ),
};

// ============================================================
// INJECT ANIMATIONS (once)
// ============================================================

const animStyleId = 'deceased-fin-anim';
if (typeof document !== 'undefined' && !document.getElementById(animStyleId)) {
  const s = document.createElement('style');
  s.id = animStyleId;
  s.textContent = `
    @keyframes dfFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes dfSlideRight { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes dfGrowBar { from { width: 0; } }
    @keyframes dfPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes dfCountUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
    @keyframes dfShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  `;
  document.head.appendChild(s);
}

// ============================================================
// UTILITY
// ============================================================

const formatCurrency = (amount) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const StatusBadge = ({ status }) => {
  const map = {
    active:    { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', icon: Icons.check, label: 'Active' },
    pending:   { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', icon: Icons.hourglass, label: 'Pending' },
    frozen:    { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE', icon: Icons.lock, label: 'Frozen' },
    closed:    { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', icon: Icons.x, label: 'Closed' },
    cleared:   { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', icon: Icons.check, label: 'Cleared' },
    disputed:  { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', icon: Icons.alert, label: 'Disputed' },
    in_progress: { bg: '#EEF2FF', color: '#4F46E5', border: '#C7D2FE', icon: Icons.hourglass, label: 'In Progress' },
    not_started: { bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB', icon: Icons.clock, label: 'Not Started' },
  };
  const cfg = map[status] || map.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 6,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      fontSize: 11, fontWeight: 600, lineHeight: 1.6,
    }}>
      <span style={{ display: 'flex', alignItems: 'center' }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

/** Hero stat card */
const StatCard = ({ icon, label, value, sub, accentColor, delay = 0 }) => (
  <div style={{
    flex: 1, minWidth: 0,
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #F3F4F6',
    padding: '16px 14px',
    animation: `dfFadeIn 0.45s ease-out ${delay}s both`,
    position: 'relative',
    overflow: 'hidden',
  }}>
    {/* Accent bar */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
      background: accentColor,
      borderRadius: '14px 14px 0 0',
    }} />
    <div style={{
      width: 34, height: 34, borderRadius: 9,
      background: accentColor + '12',
      color: accentColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 10,
    }}>
      {icon}
    </div>
    <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
      {label}
    </div>
    <div style={{
      fontSize: 20, fontWeight: 800, color: '#111827',
      lineHeight: 1.2,
      animation: `dfCountUp 0.5s ease-out ${delay + 0.15}s both`,
    }}>
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>
        {sub}
      </div>
    )}
  </div>
);

/** Progress bar */
const ProgressBar = ({ value, max, color, label, delay = 0 }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 12, animation: `dfSlideRight 0.4s ease-out ${delay}s both` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: color }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{
        height: 7, borderRadius: 4,
        background: '#F3F4F6',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 4,
          background: `linear-gradient(90deg, ${color}, ${color}CC)`,
          width: `${pct}%`,
          animation: `dfGrowBar 0.8s ease-out ${delay + 0.2}s both`,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
};

/** A single row in a detail list */
const DetailRow = ({ icon, label, value, status, mono = false, action, delay = 0 }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 14px',
    borderRadius: 10,
    background: '#FAFAFA',
    border: '1px solid #F3F4F6',
    animation: `dfFadeIn 0.35s ease-out ${delay}s both`,
    transition: 'background 0.15s, border-color 0.15s',
    cursor: action ? 'pointer' : 'default',
  }}
    onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F5'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
    onMouseLeave={e => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.borderColor = '#F3F4F6'; }}
    onClick={action}
  >
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: '#EEF2FF', color: '#4F46E5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{
        fontSize: 13, fontWeight: 600, color: '#111827',
        fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace' : 'inherit',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {value || '—'}
      </div>
    </div>
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
      {status && <StatusBadge status={status} />}
      {action && (
        <span style={{ color: '#9CA3AF', display: 'flex', alignItems: 'center' }}>
          {Icons.arrowRight}
        </span>
      )}
    </div>
  </div>
);

/** Section header */
const SectionHeader = ({ icon, title, badge, delay = 0 }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: 12,
    animation: `dfSlideRight 0.35s ease-out ${delay}s both`,
  }}>
    <div style={{
      width: 30, height: 30, borderRadius: 8,
      background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
      color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{title}</div>
    </div>
    {badge && (
      <span style={{
        fontSize: 11, fontWeight: 700, color: '#4F46E5',
        background: '#EEF2FF', padding: '3px 10px', borderRadius: 6,
        border: '1px solid #C7D2FE',
      }}>
        {badge}
      </span>
    )}
  </div>
);

/** Empty state */
const EmptyState = ({ message }) => (
  <div style={{
    padding: '32px 16px',
    textAlign: 'center',
    animation: 'dfFadeIn 0.4s ease-out',
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12,
      background: '#F3F4F6', color: '#9CA3AF',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 12px',
    }}>
      {Icons.fileText}
    </div>
    <div style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.5 }}>
      {message}
    </div>
  </div>
);

// ============================================================
// MOCK DATA (replace with real API data)
// ============================================================

const getMockFinancialData = (deceased) => ({
  summary: {
    totalAssets: 4_850_000,
    totalLiabilities: 720_000,
    netEstate: 4_130_000,
    funeralExpenses: 185_000,
    pendingClaims: 3,
  },
  bankAccounts: [
    { id: 1, bank: 'Kenya Commercial Bank', accountNumber: '1123456789', accountName: deceased?.full_name || '—', balance: 1_250_000, status: 'frozen', type: 'Savings' },
    { id: 2, bank: 'Equity Bank', accountNumber: '0098765432', accountName: deceased?.full_name || '—', balance: 680_000, status: 'frozen', type: 'Current' },
    { id: 3, bank: 'Co-operative Bank', accountNumber: '0112233445', accountName: deceased?.full_name || '—', balance: 320_000, status: 'active', type: 'Savings' },
  ],
  insurancePolicies: [
    { id: 1, provider: 'Jubilee Insurance', policyNumber: 'JBL-2021-44556', type: 'Life Cover', sumAssured: 2_000_000, status: 'pending', premium: 24_000 },
    { id: 2, provider: 'UAP Old Mutual', policyNumber: 'UAP-LF-88923', type: 'Funeral Cover', sumAssured: 200_000, status: 'cleared', premium: 6_000 },
  ],
  properties: [
    { id: 1, description: 'LR No. 12345/456 — Nairobi, Kilimani', type: 'Land & Building', estimatedValue: 2_200_000, status: 'frozen' },
    { id: 2, description: 'Motor Vehicle — Toyota Fielder KCA 321X', type: 'Vehicle', estimatedValue: 400_000, status: 'frozen' },
  ],
  liabilities: [
    { id: 1, creditor: 'KCB Personal Loan', amount: 350_000, status: 'pending', dueDate: '2025-03-15' },
    { id: 2, creditor: 'SACCO Loan', amount: 220_000, status: 'active', dueDate: '2025-08-30' },
    { id: 3, creditor: 'M-Pesa Fuliza', amount: 150_000, status: 'disputed', dueDate: '2024-12-01' },
  ],
  probate: {
    status: 'in_progress',
    caseNumber: 'P&A 234/2024',
    court: 'Milimani Law Courts',
    filingDate: '2024-11-15',
    nextHearing: '2025-02-20',
    assignedLawyer: 'Adv. Grace Wanjiru',
  },
});

// ============================================================
// MAIN COMPONENT
// ============================================================

const DeceasedFinancialDetails = ({ deceasedId, deceased }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedId, setCopiedId] = useState(null);

  const data = getMockFinancialData(deceased);

  const handleCopy = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Tab config
  const tabs = [
    { key: 'overview', label: 'Overview', icon: Icons.pieChart },
    { key: 'accounts', label: 'Accounts', icon: Icons.bank, count: data.bankAccounts.length },
    { key: 'insurance', label: 'Insurance', icon: Icons.shield, count: data.insurancePolicies.length },
    { key: 'assets', label: 'Assets', icon: Icons.building, count: data.properties.length },
    { key: 'liabilities', label: 'Liabilities', icon: Icons.scales, count: data.liabilities.length },
    { key: 'probate', label: 'Probate', icon: Icons.gavel },
  ];

  const activeTabConfig = tabs.find(t => t.key === activeTab);

  return (
    <div style={{ padding: '20px 24px 24px' }}>

      {/* ===== TITLE BAR ===== */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
        animation: 'dfFadeIn 0.3s ease-out',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
          }}>
            {Icons.dollarSign}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
              Financial Details
            </h4>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              {deceased?.full_name && <span style={{ color: '#6B7280' }}>{deceased.full_name}</span>}
              {deceasedId && (
                <span style={{
                  fontFamily: 'ui-monospace, monospace', fontSize: 11,
                  background: '#F3F4F6', padding: '1px 7px', borderRadius: 4,
                  color: '#9CA3AF', display: 'inline-flex', alignItems: 'center', gap: 4,
                  cursor: 'pointer',
                }}
                  onClick={() => handleCopy(String(deceasedId), 'header-id')}
                >
                  ID: {deceasedId}
                  {copiedId === 'header-id' ? Icons.check : Icons.copy}
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={{
          padding: '6px 12px', borderRadius: 8,
          background: '#F0FDF4', border: '1px solid #BBF7D0',
          color: '#16A34A', fontSize: 11, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          {Icons.sparkles}
          {data.summary.pendingClaims} pending
        </div>
      </div>

      {/* ===== TAB BAR ===== */}
      <div style={{
        display: 'flex', gap: 4,
        marginBottom: 20,
        overflowX: 'auto',
        paddingBottom: 2,
        animation: 'dfFadeIn 0.35s ease-out 0.05s both',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              borderRadius: 9,
              border: 'none',
              background: activeTab === tab.key
                ? 'linear-gradient(135deg, #4F46E5, #6366F1)'
                : '#F9FAFB',
              color: activeTab === tab.key ? '#fff' : '#6B7280',
              fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              boxShadow: activeTab === tab.key ? '0 2px 10px rgba(79,70,229,0.3)' : 'none',
              border: activeTab === tab.key ? 'none' : '1px solid #F3F4F6',
            }}
            onMouseEnter={e => {
              if (activeTab !== tab.key) e.currentTarget.style.background = '#F3F4F6';
            }}
            onMouseLeave={e => {
              if (activeTab !== tab.key) e.currentTarget.style.background = '#F9FAFB';
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.count != null && (
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : '#E5E7EB',
                color: activeTab === tab.key ? '#fff' : '#6B7280',
                padding: '1px 6px', borderRadius: 5,
                minWidth: 18, textAlign: 'center',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ===== TAB CONTENT ===== */}

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
        <div>
          {/* Stat cards row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <StatCard
              icon={Icons.trendUp}
              label="Total Assets"
              value={formatCurrency(data.summary.totalAssets)}
              sub="Bank + Insurance + Property"
              accentColor="#10B981"
              delay={0.05}
            />
            <StatCard
              icon={Icons.trendDown}
              label="Liabilities"
              value={formatCurrency(data.summary.totalLiabilities)}
              sub={`${data.liabilities.length} outstanding`}
              accentColor="#EF4444"
              delay={0.1}
            />
            <StatCard
              icon={Icons.wallet}
              label="Net Estate"
              value={formatCurrency(data.summary.netEstate)}
              sub="After liabilities"
              accentColor="#4F46E5"
              delay={0.15}
            />
            <StatCard
              icon={Icons.creditCard}
              label="Funeral Expenses"
              value={formatCurrency(data.summary.funeralExpenses)}
              sub="Receipts on file"
              accentColor="#F59E0B"
              delay={0.2}
            />
          </div>

          {/* Estate composition */}
          <div style={{
            background: '#fff', borderRadius: 14,
            border: '1px solid #F3F4F6',
            padding: '18px 16px',
            animation: 'dfFadeIn 0.4s ease-out 0.25s both',
          }}>
            <SectionHeader icon={Icons.pieChart} title="Estate Composition" delay={0.25} />

            <ProgressBar
              label="Bank Accounts"
              value={data.bankAccounts.reduce((s, a) => s + a.balance, 0)}
              max={data.summary.totalAssets}
              color="#3B82F6"
              delay={0.3}
            />
            <ProgressBar
              label="Insurance Policies"
              value={data.insurancePolicies.reduce((s, p) => s + p.sumAssured, 0)}
              max={data.summary.totalAssets}
              color="#8B5CF6"
              delay={0.35}
            />
            <ProgressBar
              label="Properties & Vehicles"
              value={data.properties.reduce((s, p) => s + p.estimatedValue, 0)}
              max={data.summary.totalAssets}
              color="#10B981"
              delay={0.4}
            />
            <ProgressBar
              label="Liabilities"
              value={data.summary.totalLiabilities}
              max={data.summary.totalAssets}
              color="#EF4444"
              delay={0.45}
            />
          </div>

          {/* Probate quick view */}
          <div style={{
            background: '#fff', borderRadius: 14,
            border: '1px solid #F3F4F6',
            padding: '18px 16px',
            marginTop: 14,
            animation: 'dfFadeIn 0.4s ease-out 0.5s both',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
            onClick={() => setActiveTab('probate')}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#C7D2FE'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#F3F4F6'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: '#FEF3C7', color: '#D97706',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {Icons.gavel}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Probate Status</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                    Case {data.probate.caseNumber} — Next hearing {data.probate.nextHearing}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <StatusBadge status={data.probate.status} />
                <span style={{ color: '#9CA3AF' }}>{Icons.arrowRight}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ACCOUNTS TAB --- */}
      {activeTab === 'accounts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionHeader icon={Icons.bank} title="Bank Accounts" badge={`${data.bankAccounts.length} accounts`} delay={0.05} />
          {data.bankAccounts.map((acc, i) => (
            <DetailRow
              key={acc.id}
              icon={Icons.bank}
              label={`${acc.bank} — ${acc.type}`}
              value={formatCurrency(acc.balance)}
              status={acc.status}
              delay={0.08 + i * 0.06}
              action={() => handleCopy(acc.accountNumber, `acc-${acc.id}`)}
            />
          ))}
          {/* Account numbers detail */}
          {data.bankAccounts.map((acc, i) => (
            <div key={`detail-${acc.id}`} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px 12px',
              animation: `dfFadeIn 0.3s ease-out ${0.15 + i * 0.06}s both`,
            }}>
              <span style={{ fontSize: 11, color: '#9CA3AF', width: 80, flexShrink: 0 }}>{acc.bank.split(' ')[0]}</span>
              <span style={{
                fontSize: 12, fontFamily: 'ui-monospace, monospace', color: '#4B5563',
                background: '#F9FAFB', padding: '3px 10px', borderRadius: 5,
                border: '1px solid #F3F4F6',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
                onClick={() => handleCopy(acc.accountNumber, `accnum-${acc.id}`)}
                onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.borderColor = '#C7D2FE'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#F3F4F6'; }}
              >
                {acc.accountNumber}
                {copiedId === `accnum-${acc.id}` ? (
                  <span style={{ color: '#16A34A', marginLeft: 6 }}>{Icons.check}</span>
                ) : (
                  <span style={{ color: '#9CA3AF', marginLeft: 6 }}>{Icons.copy}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* --- INSURANCE TAB --- */}
      {activeTab === 'insurance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionHeader icon={Icons.shield} title="Insurance Policies" badge={`${data.insurancePolicies.length} policies`} delay={0.05} />
          {data.insurancePolicies.length === 0 && (
            <EmptyState message="No insurance policies on record for this deceased." />
          )}
          {data.insurancePolicies.map((pol, i) => (
            <div key={pol.id} style={{
              background: '#fff', borderRadius: 12,
              border: '1px solid #F3F4F6',
              padding: '14px 16px',
              animation: `dfFadeIn 0.4s ease-out ${0.08 + i * 0.08}s both`,
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#E5E7EB'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#F3F4F6'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: '#F3E8FF', color: '#7C3AED',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {Icons.shield}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{pol.provider}</div>
                    <div style={{
                      fontSize: 11, fontFamily: 'ui-monospace, monospace', color: '#9CA3AF',
                      marginTop: 2, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}
                      onClick={() => handleCopy(pol.policyNumber, `pol-${pol.id}`)}
                    >
                      {pol.policyNumber}
                      {copiedId === `pol-${pol.id}` ? (
                        <span style={{ color: '#16A34A' }}>{Icons.check}</span>
                      ) : (
                        <span style={{ color: '#9CA3AF' }}>{Icons.copy}</span>
                      )}
                    </div>
                  </div>
                </div>
                <StatusBadge status={pol.status} />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>Type</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginTop: 2 }}>{pol.type}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>Sum Assured</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginTop: 2 }}>{formatCurrency(pol.sumAssured)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>Annual Premium</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginTop: 2 }}>{formatCurrency(pol.premium)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ASSETS TAB --- */}
      {activeTab === 'assets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionHeader icon={Icons.building} title="Properties & Assets" badge={`${data.properties.length} items`} delay={0.05} />
          {data.properties.length === 0 && (
            <EmptyState message="No properties or assets registered for this deceased." />
          )}
          {data.properties.map((prop, i) => (
            <DetailRow
              key={prop.id}
              icon={prop.type === 'Vehicle' ? Icons.creditCard : Icons.building}
              label={prop.type}
              value={prop.description}
              status={prop.status}
              delay={0.08 + i * 0.06}
            />
          ))}
          {data.properties.map((prop, i) => (
            <div key={`val-${prop.id}`} style={{
              paddingLeft: 58, paddingBottom: 10,
              animation: `dfFadeIn 0.3s ease-out ${0.15 + i * 0.06}s both`,
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>
                {formatCurrency(prop.estimatedValue)}
              </span>
              <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 8 }}>estimated value</span>
            </div>
          ))}
        </div>
      )}

      {/* --- LIABILITIES TAB --- */}
      {activeTab === 'liabilities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionHeader icon={Icons.scales} title="Liabilities & Debts" badge={formatCurrency(data.summary.totalLiabilities)} delay={0.05} />
          {data.liabilities.length === 0 && (
            <EmptyState message="No liabilities recorded for this deceased." />
          )}
          {data.liabilities.map((liab, i) => (
            <div key={liab.id} style={{
              background: '#fff', borderRadius: 12,
              border: '1px solid #F3F4F6',
              padding: '14px 16px',
              animation: `dfFadeIn 0.4s ease-out ${0.08 + i * 0.08}s both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: '#FEF2F2', color: '#EF4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {Icons.trendDown}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{liab.creditor}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>Due: {liab.dueDate}</div>
                  </div>
                </div>
                <StatusBadge status={liab.status} />
              </div>
              <div style={{
                fontSize: 18, fontWeight: 800, color: '#EF4444',
                paddingLeft: 44,
              }}>
                {formatCurrency(liab.amount)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- PROBATE TAB --- */}
      {activeTab === 'probate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectionHeader icon={Icons.gavel} title="Probate & Legal" delay={0.05} />

          {/* Probate status card */}
          <div style={{
            background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
            borderRadius: 14,
            border: '1px solid #C7D2FE',
            padding: '20px 18px',
            animation: 'dfFadeIn 0.4s ease-out 0.1s both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Current Status
                </div>
                <div style={{ marginTop: 4 }}>
                  <StatusBadge status={data.probate.status} />
                </div>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(79,70,229,0.12)', color: '#4F46E5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {Icons.gavel}
              </div>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
            }}>
              {[
                { label: 'Case Number', value: data.probate.caseNumber, mono: true },
                { label: 'Court', value: data.probate.court },
                { label: 'Filing Date', value: data.probate.filingDate },
                { label: 'Next Hearing', value: data.probate.nextHearing },
              ].map((item, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.7)', borderRadius: 8,
                  padding: '10px 12px',
                  animation: `dfFadeIn 0.3s ease-out ${0.15 + i * 0.05}s both`,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: '#1E1B4B', marginTop: 3,
                    fontFamily: item.mono ? 'ui-monospace, monospace' : 'inherit',
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lawyer */}
          <DetailRow
            icon={Icons.user}
            label="Assigned Lawyer"
            value={data.probate.assignedLawyer}
            delay={0.35}
          />

          {/* Timeline placeholder */}
          <div style={{
            background: '#fff', borderRadius: 14,
            border: '1px solid #F3F4F6',
            padding: '18px 16px',
            animation: 'dfFadeIn 0.4s ease-out 0.4s both',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: '#F3F4F6', color: '#6B7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {Icons.clock}
              </div>
              Probate Timeline
            </div>
            {[
              { date: '2024-11-15', event: 'Probate application filed', done: true },
              { date: '2024-12-03', event: 'Notice to creditors published in Kenya Gazette', done: true },
              { date: '2025-01-10', event: 'First court mention — documents verified', done: true },
              { date: '2025-02-20', event: 'Hearing — grant of probate', done: false },
              { date: '2025-03-15', event: 'Grant issued (expected)', done: false },
            ].map((step, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12,
                paddingBottom: i < 4 ? 14 : 0,
                position: 'relative',
                animation: `dfSlideRight 0.35s ease-out ${0.45 + i * 0.06}s both`,
              }}>
                {/* Vertical line */}
                {i < 4 && (
                  <div style={{
                    position: 'absolute', left: 11, top: 22, bottom: 0,
                    width: 2,
                    background: step.done ? '#C7D2FE' : '#F3F4F6',
                  }} />
                )}
                {/* Dot */}
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: step.done ? '#4F46E5' : '#F3F4F6',
                  border: step.done ? 'none' : '2px solid #D1D5DB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 1,
                  color: step.done ? '#fff' : '#9CA3AF',
                }}>
                  {step.done ? Icons.check : (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D1D5DB' }} />
                  )}
                </div>
                {/* Content */}
                <div style={{ paddingTop: 2 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: step.done ? '#111827' : '#9CA3AF' }}>
                    {step.event}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                    {step.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default DeceasedFinancialDetails;