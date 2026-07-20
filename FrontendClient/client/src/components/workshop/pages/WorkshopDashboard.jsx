import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';

// ── Chart.js ──
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
const ChartJS = Chart;

// ── API & Context (keep but safe) ──
import { useSocket } from '../../../utils/context/socketContext';
import { workshopService } from '../services/workshopService';

// ═══════════════════════════════════════════════════════════
//  DESIGN TOKENS — WHITE LIGHT THEME
// ═══════════════════════════════════════════════════════════
const T = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceHover: '#F1F5F9',
  bdr: '#E2E8F0',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  bdrS: '#CBD5E1',
  text: '#0F172A',
  textBody: '#334155',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textFaint: '#CBD5E1',
  t1: '#0F172A',
  t2: '#475569',
  t3: '#94A3B8',
  accent: '#2563EB',
  accentD: 'rgba(37, 99, 235, 0.08)',
  accentBg: '#EFF6FF',
  accentLight: '#93C5FD',
  ok: '#059669',
  okBg: '#ECFDF5',
  okLight: '#6EE7B7',
  err: '#DC2626',
  errBg: '#FEF2F2',
  errLight: '#FCA5A5',
  warn: '#D97706',
  warnBg: '#FFFBEB',
  warnLight: '#FCD34D',
  info: '#3B82F6',
  infoBg: '#EFF6FF',
  purple: '#7C3AED',
  purpleBg: '#F5F3FF',
  cyan: '#0891B2',
  cyanBg: '#ECFEFF',
  orange: '#EA580C',
  orangeBg: '#FFF7ED',
  pink: '#DB2777',
  pinkBg: '#FDF2F8',
  teal: '#0D9488',
  tealBg: '#F0FDFA',
  chartColors: ['#2563EB', '#7C3AED', '#0891B2', '#059669', '#D97706', '#DC2626', '#DB2777', '#EA580C'],
};

const STAGES = [
  { id: 'cutting', label: 'Cutting', icon: 'fa-scissors', color: '#EF4444' },
  { id: 'assembly', label: 'Assembly', icon: 'fa-screwdriver-wrench', color: '#F97316' },
  { id: 'sanding', label: 'Sanding', icon: 'fa-paintbrush', color: '#EAB308' },
  { id: 'finishing', label: 'Finishing', icon: 'fa-spray-can-sparkles', color: '#22C55E' },
  { id: 'upholstery', label: 'Upholstery', icon: 'fa-couch', color: '#14B8A6' },
  { id: 'hardware', label: 'Hardware', icon: 'fa-wrench', color: '#3B82F6' },
  { id: 'quality_check', label: 'Quality Check', icon: 'fa-clipboard-check', color: '#8B5CF6' },
  { id: 'packaging', label: 'Packaging', icon: 'fa-box', color: '#EC4899' },
  { id: 'completed', label: 'Completed', icon: 'fa-circle-check', color: '#10B981' },
];

const WORKERS = [
  { id: 1, name: 'James Mwangi', role: 'Master Carpenter', initials: 'JM', color: '#2563EB', speed: 0.9, reliability: 0.95, todayCount: 3, weekCount: 14, monthCount: 52, allTime: 384, avgHours: 4.2, trend: 'up' },
  { id: 2, name: 'Peter Ochieng', role: 'Senior Carpenter', initials: 'PO', color: '#7C3AED', speed: 0.85, reliability: 0.88, todayCount: 2, weekCount: 11, monthCount: 45, allTime: 312, avgHours: 4.8, trend: 'up' },
  { id: 3, name: 'Samuel Kibet', role: 'Upholsterer', initials: 'SK', color: '#059669', speed: 0.78, reliability: 0.92, todayCount: 2, weekCount: 10, monthCount: 41, allTime: 278, avgHours: 5.1, trend: 'stable' },
  { id: 4, name: 'David Njoroge', role: 'Finisher', initials: 'DN', color: '#DC2626', speed: 0.82, reliability: 0.85, todayCount: 2, weekCount: 9, monthCount: 38, allTime: 256, avgHours: 4.5, trend: 'down' },
  { id: 5, name: 'John Kamau', role: 'Apprentice', initials: 'JK', color: '#8B5CF6', speed: 0.6, reliability: 0.75, todayCount: 1, weekCount: 5, monthCount: 22, allTime: 98, avgHours: 7.2, trend: 'up' },
  { id: 6, name: 'Francis Wanjiku', role: 'Quality Inspector', initials: 'FW', color: '#EC4899', speed: 0.88, reliability: 0.98, todayCount: 3, weekCount: 13, monthCount: 48, allTime: 345, avgHours: 3.8, trend: 'stable' },
  { id: 7, name: 'Michael Odhiambo', role: 'Hardware Specialist', initials: 'MO', color: '#14B8A6', speed: 0.75, reliability: 0.9, todayCount: 1, weekCount: 7, monthCount: 30, allTime: 198, avgHours: 5.5, trend: 'down' },
  { id: 8, name: 'Joseph Muthoni', role: 'Sander', initials: 'JM', color: '#D97706', speed: 0.8, reliability: 0.87, todayCount: 2, weekCount: 8, monthCount: 35, allTime: 224, avgHours: 5.0, trend: 'up' },
];

const CTYPES = ['Standard', 'Premium', 'Elite', 'Child', 'Infant', 'Oversized'];
const CUSTOMERS = ['Wanjiru K.', 'Otieno Family', 'Muthoni J.', 'Kipchoge Estate', 'Achieng M.', 'Njeri W.', 'Kamau & Sons', 'Omondi Funeral', 'Wambui T.', 'Chebet Family', 'Mwangi Holdings', 'Akinyi Services'];
const DECEASED = ['Stephen K.', 'Mary A.', 'Joseph N.', 'Grace W.', 'Peter M.', 'Hannah O.', 'David K.', 'Ruth J.', 'Samuel T.', 'Elizabeth M.', 'John O.', 'Agnes W.'];
const COLORS = ['Walnut', 'Mahogany', 'Oak', 'Cherry', 'Ebony', 'Pine White'];
const INTERIORS = ['Satin Gold', 'White Crepe', 'Blue Velvet', 'Rose Pink', 'Cream Silk', 'Burgundy'];
const PRICES = { Standard: 15000, Premium: 25000, Elite: 45000, Child: 8000, Infant: 5000, Oversized: 55000 };

let _id = 1000;
const gid = () => ++_id;

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

function makeOrders() {
  const a = [];
  for (let i = 0; i < 18; i++) {
    const si = Math.min(Math.floor(Math.random() * 8), 7);
    const w = WORKERS[Math.floor(Math.random() * WORKERS.length)];
    const hrs = Math.floor(Math.random() * 72) + 1;
    const ct = new Date(Date.now() - hrs * 3600000);
    const tp = CTYPES[Math.floor(Math.random() * CTYPES.length)];
    const stages = STAGES.slice(0, si + 1).map((s, idx) => ({
      ...s, status: idx < si ? 'completed' : 'in_progress',
      startedAt: new Date(ct.getTime() + idx * ((hrs * 3600000) / (si + 1))),
      completedAt: idx < si ? new Date(ct.getTime() + (idx + 1) * ((hrs * 3600000) / (si + 1))) : null,
    }));
    a.push({
      id: gid(), orderNumber: 'CF-' + _id, customerName: CUSTOMERS[i % 12], deceasedName: DECEASED[i % 12],
      coffinType: tp, color: COLORS[Math.floor(Math.random() * 6)], interior: INTERIORS[Math.floor(Math.random() * 6)],
      currentStage: STAGES[si].id, stages, assignedWorker: { ...w },
      priority: Math.random() < 0.1 ? 'urgent' : Math.random() < 0.25 ? 'high' : 'normal',
      price: PRICES[tp] || 20000, createdAt: ct,
      dueDate: new Date(ct.getTime() + (3 + Math.floor(Math.random() * 5)) * 86400000),
    });
  }
  return a;
}

function makeMaterials() {
  return [
    { id: 1, name: 'Mahogany Planks', category: 'Wood', quantity: 45, unit: 'pcs', minLevel: 20, costPerUnit: 3200, supplier: 'Timberland Nairobi' },
    { id: 2, name: 'Walnut Veneer Sheets', category: 'Wood', quantity: 12, unit: 'sheets', minLevel: 15, costPerUnit: 1800, supplier: 'Fine Veneers Ltd' },
    { id: 3, name: 'Brass Handles (Pair)', category: 'Hardware', quantity: 38, unit: 'pairs', minLevel: 10, costPerUnit: 650, supplier: 'MetalCraft Kenya' },
    { id: 4, name: 'Satin Gold Fabric', category: 'Fabric', quantity: 28, unit: 'meters', minLevel: 25, costPerUnit: 450, supplier: 'TextileHouse' },
    { id: 5, name: 'Wood Screws 1.5"', category: 'Hardware', quantity: 5, unit: 'boxes', minLevel: 10, costPerUnit: 320, supplier: 'Hardware World' },
    { id: 6, name: 'Polyurethane Varnish', category: 'Finish', quantity: 18, unit: 'liters', minLevel: 8, costPerUnit: 1200, supplier: 'PaintMaster' },
    { id: 7, name: 'Cotton Batting', category: 'Fabric', quantity: 32, unit: 'rolls', minLevel: 10, costPerUnit: 280, supplier: 'TextileHouse' },
    { id: 8, name: 'Pine Boards', category: 'Wood', quantity: 60, unit: 'pcs', minLevel: 30, costPerUnit: 850, supplier: 'Timberland Nairobi' },
    { id: 9, name: 'Corner Brackets', category: 'Hardware', quantity: 3, unit: 'sets', minLevel: 8, costPerUnit: 180, supplier: 'MetalCraft Kenya' },
    { id: 10, name: 'Sandpaper 120 grit', category: 'Abrasive', quantity: 22, unit: 'packs', minLevel: 15, costPerUnit: 95, supplier: 'Hardware World' },
    { id: 11, name: 'White Crepe Fabric', category: 'Fabric', quantity: 20, unit: 'meters', minLevel: 20, costPerUnit: 380, supplier: 'TextileHouse' },
    { id: 12, name: 'Hinges 3"', category: 'Hardware', quantity: 45, unit: 'pairs', minLevel: 15, costPerUnit: 120, supplier: 'MetalCraft Kenya' },
  ];
}

function makeActivity(ords) {
  const a = [];
  const acts = ['completed Cutting stage for', 'started Upholstery on', 'passed Quality Check for', 'moved to Assembly for', 'applied Finishing to', 'installed Hardware on', 'finished Sanding for', 'started Cutting on'];
  for (let i = 0; i < 8; i++) {
    const w = WORKERS[i % 8], o = ords[i % ords.length];
    a.push({ worker: w, action: acts[i], coffin: o, time: new Date(Date.now() - i * (Math.random() * 1800000 + 300000)), type: i % 2 === 0 ? 'success' : 'info' });
  }
  return a;
}

function genInsights(ords, mats, wkrs) {
  const ins = [];
  const sc = {};
  STAGES.forEach(s => sc[s.id] = 0);
  ords.filter(o => o.currentStage !== 'completed').forEach(o => sc[o.currentStage] = (sc[o.currentStage] || 0) + 1);
  const mx = Object.entries(sc).sort((a, b) => b[1] - a[1])[0];
  const bn = STAGES.find(s => s.id === mx[0]);
  if (mx && mx[1] >= 3) ins.push({ type: 'Bottleneck Detected', icon: 'fa-triangle-exclamation', text: `<strong>${bn.label}</strong> has ${mx[1]} coffins queued.`, bg: T.errBg, iconBg: 'rgba(239,68,68,0.15)', iconClr: T.err, actLbl: 'Suggest Reassignment' });
  const slow = [...wkrs].sort((a, b) => a.speed - b.speed)[0];
  ins.push({ type: 'Performance Alert', icon: 'fa-person-falling-burst', text: `<strong>${slow.name}</strong> has lowest speed (${Math.round(slow.speed * 100)}%) at ${slow.avgHours}h/coffin.`, bg: T.warnBg, iconBg: 'rgba(245,158,11,0.15)', iconClr: T.warn, actLbl: 'Initiate Mentorship' });
  const fast = [...wkrs].sort((a, b) => b.speed - a.speed)[0];
  const cutO = ords.filter(o => o.currentStage === 'cutting');
  if (cutO.length > 0) ins.push({ type: 'Optimal Assignment', icon: 'fa-wand-magic-sparkles', text: `Assign <strong>${fast.name}</strong> to <strong>${cutO[0].orderNumber}</strong>.`, bg: T.okBg, iconBg: 'rgba(16,185,129,0.15)', iconClr: T.ok, actLbl: 'Apply Suggestion' });
  const ac = ords.filter(o => o.currentStage !== 'completed').length;
  const avgC = wkrs.reduce((s, w) => s + w.avgHours, 0) / wkrs.length;
  ins.push({ type: 'Throughput Prediction', icon: 'fa-chart-line', text: `At ${avgC.toFixed(1)}h avg/coffin, expect ~${Math.round(wkrs.filter(w => w.todayCount > 0).length * (8 / avgC))} more completions today.`, bg: T.infoBg, iconBg: 'rgba(59,130,246,0.15)', iconClr: T.info });
  const lowM = mats.filter(m => m.quantity <= m.minLevel);
  if (lowM.length > 0) ins.push({ type: 'Supply Chain Risk', icon: 'fa-box-open', text: `<strong>${lowM.length} materials</strong> at/below minimum.`, bg: '#FDF2F8', iconBg: 'rgba(236,72,153,0.15)', iconClr: '#DB2777', actLbl: 'Auto-Reorder' });
  const upT = wkrs.filter(w => w.trend === 'up').length;
  ins.push({ type: 'Team Momentum', icon: 'fa-rocket', text: `<strong>${upT} of ${wkrs.length} workers</strong> show improving trends.`, bg: '#F5F3FF', iconBg: 'rgba(139,92,246,0.15)', iconClr: '#7C3AED' });
  ins.push({ type: 'Quality Forecast', icon: 'fa-shield-halved', text: `Based on <strong>${wkrs[5].name}</strong>'s ${Math.round(wkrs[5].reliability * 100)}% reliability score.`, bg: '#F0FDFA', iconBg: 'rgba(20,184,166,0.15)', iconClr: '#14B8A6' });
  ins.push({ type: 'Cost Efficiency', icon: 'fa-coins', text: `Work-in-progress value: <strong>KES ${ords.filter(o => o.currentStage !== 'completed').reduce((s, o) => s + o.price, 0).toLocaleString()}</strong>.`, bg: '#FFFBEB', iconBg: 'rgba(212,160,83,0.15)', iconClr: '#D97706' });
  return ins;
}

function useChart(ref, fn, deps) {
  const cr = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (cr.current) { cr.current.destroy(); cr.current = null; }
    cr.current = new ChartJS(ref.current, fn());
    return () => { if (cr.current) { cr.current.destroy(); cr.current = null; } };
  }, deps);
}

const Ctx = createContext();

// ── Toast ──
function Toasts() {
  const { toasts } = useContext(Ctx);
  const iconMap = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info', warning: 'fa-triangle-exclamation' };
  const colorMap = { success: T.ok, error: T.err, info: T.info, warning: T.warn };
  return (
    <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 300, maxWidth: 420, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', animation: t.out ? 'fadeOut 0.3s ease forwards' : 'slideIn 0.3s ease', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
          <i className={`fas ${iconMap[t.type] || 'fa-circle-info'}`} style={{ fontSize: '1rem', color: colorMap[t.type] || T.info }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: T.t1 }}>{t.title}</div>
            <div style={{ fontSize: '0.75rem', color: T.t2, marginTop: '0.1rem' }}>{t.msg}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Top Nav Bar (replaces sidebar) ──
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-th-large' },
  { id: 'production', label: 'Production', icon: 'fa-industry' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'fa-trophy' },
  { id: 'insights', label: 'AI Insights', icon: 'fa-brain' },
  { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line' },
  { id: 'workers', label: 'Workers', icon: 'fa-users' },
  { id: 'materials', label: 'Materials', icon: 'fa-boxes-stacked' },
];

function TopNav({ tab, setTab }) {
  const { orders, addToast } = useContext(Ctx);
  const ac = orders.filter(o => o.currentStage !== 'completed').length;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 40, background: T.surface, borderBottom: `1px solid ${T.bdr}`, padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
      {/* Logo + brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: T.accent, letterSpacing: '0.05em' }}>MORTEM</div>
        <div style={{ fontSize: '0.65rem', color: T.t3, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Workshop</div>
      </div>

      {/* Desktop nav */}
      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        {NAV_ITEMS.map(it => (
          <button key={it.id} onClick={() => setTab(it.id)}
            style={{
              padding: '0.5rem 0.85rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: tab === it.id ? 700 : 500,
              fontFamily: "'DM Sans', sans-serif", background: tab === it.id ? T.accentD : 'transparent', color: tab === it.id ? T.accent : T.t2,
              display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.15s'
            }}>
            <i className={`fas ${it.icon}`} style={{ fontSize: '0.8rem' }} />
            <span style={{ display: window.innerWidth <= 768 ? 'none' : 'inline' }}>{it.label}</span>
            {it.id === 'production' && ac > 0 && (
              <span style={{ marginLeft: '0.15rem', background: T.accent, color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: 99, minWidth: 18, textAlign: 'center' }}>{ac}</span>
            )}
          </button>
        ))}
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.6rem', borderRadius: 99, background: T.okBg, border: `1px solid ${T.ok}33` }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.ok, animation: 'livePulse 2s infinite' }} />
          <span style={{ fontSize: '0.7rem', color: T.ok, fontWeight: 600 }}>LIVE</span>
        </div>
        <button style={{ width: 34, height: 34, borderRadius: 8, background: T.surfaceHover, border: `1px solid ${T.bdr}`, color: T.t2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => addToast('info', 'Sync', 'Data synchronized')}>
          <i className="fas fa-rotate" style={{ fontSize: '0.8rem' }} />
        </button>
        <button style={{ width: 34, height: 34, borderRadius: 8, background: T.surfaceHover, border: `1px solid ${T.bdr}`, color: T.t2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <i className="fas fa-bell" style={{ fontSize: '0.8rem' }} />
          <div style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: T.err, border: `2px solid ${T.surface}` }} />
        </button>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '0.7rem' }}>AK</div>
      </div>
    </div>
  );
}

// ── StatCard ──
function StatCard({ label, value, icon, color, bg, chg, chgColor, chgBg, delay = '0s' }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, padding: '1.125rem', transition: 'all 0.2s', animation: `fadeUp .4s ease both`, animationDelay: delay, position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
        <i className={`fas ${icon}`} style={{ fontSize: '0.9rem' }} />
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.2rem', color: T.t1 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: T.t3 }}>{label}</div>
      {chg && <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.68rem', fontWeight: 600, marginTop: '0.5rem', padding: '0.15rem 0.5rem', borderRadius: 99, background: chgBg, color: chgColor }}>
        <i className="fas fa-arrow-up" style={{ fontSize: '0.55rem' }} /> {chg}
      </div>}
    </div>
  );
}

// ── Pipeline ──
function Pipeline({ orders }) {
  const counts = useMemo(() => {
    const c = {};
    STAGES.forEach(s => c[s.id] = 0);
    orders.filter(o => o.currentStage !== 'completed').forEach(o => c[o.currentStage] = (c[o.currentStage] || 0) + 1);
    return c;
  }, [orders]);
  const doneIdx = STAGES.findIndex(s => counts[s.id] > 0);

  return (
    <div style={{ display: 'flex', gap: 0, overflowX: 'auto', padding: '4px 1.25rem 1.25rem' }}>
      {STAGES.map((s, i) => {
        const cnt = counts[s.id] || 0;
        const isActive = cnt > 0;
        const isDone = i < doneIdx;
        return (
          <div key={s.id} style={{ flex: 1, minWidth: 90, textAlign: 'center', position: 'relative' }}>
            {i < STAGES.length - 1 && (
              <div style={{ position: 'absolute', top: 20, left: 'calc(50% + 18px)', right: 'calc(-50% + 18px)', height: 2, background: isDone ? T.ok : isActive ? T.accent : T.bdr, transition: 'background 0.3s' }} />
            )}
            <div style={{ width: 38, height: 38, borderRadius: '50%', margin: '0 auto 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', border: `2px solid ${isDone ? T.ok : isActive ? T.accent : T.bdr}`, background: isDone ? T.ok : T.surface, color: isDone ? '#fff' : isActive ? T.accent : T.t3, transition: 'all 0.3s', position: 'relative', zIndex: 2 }}>
              <i className={`fas ${s.icon}`} style={{ fontSize: '0.75rem' }} />
            </div>
            <div style={{ fontSize: '0.62rem', color: isDone ? T.ok : isActive ? T.accent : T.t3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            <div style={{ fontSize: '0.65rem', color: T.t3, marginTop: '0.1rem' }}>{cnt} active</div>
          </div>
        );
      })}
    </div>
  );
}

// ── WeeklyChart ──
function WeeklyChart() {
  const r = useRef(null);
  const [m, setM] = useState('orders');
  useChart(r, () => ({
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: m === 'orders'
        ? [{ label: 'Orders', data: [5, 8, 6, 9, 7, 4, 3], backgroundColor: `${T.accent}99`, borderRadius: 6, borderSkipped: false },
        { label: 'Completed', data: [4, 7, 5, 8, 6, 3, 2], backgroundColor: `${T.ok}99`, borderRadius: 6, borderSkipped: false }]
        : [{ label: 'Revenue', data: [85000, 136000, 102000, 153000, 119000, 68000, 51000], backgroundColor: `${T.accent}99`, borderRadius: 6, borderSkipped: false },
        { label: 'Cost', data: [68000, 119000, 85000, 136000, 102000, 51000, 34000], backgroundColor: `${T.ok}99`, borderRadius: 6, borderSkipped: false }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { boxWidth: 12, padding: 12, usePointStyle: true, pointStyle: 'circle', color: T.t2 } } },
      scales: { x: { grid: { display: false }, ticks: { color: T.t3 } }, y: { beginAtZero: true, grid: { color: `${T.bdr}66` }, ticks: { color: T.t3, callback: m === 'revenue' ? (v) => 'KES ' + v / 1000 + 'K' : undefined } } },
    },
  }), [m]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
        {['orders', 'revenue'].map(k => (
          <button key={k} onClick={() => setM(k)} style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: m === k ? `1px solid ${T.accent}` : `1px solid ${T.bdr}`, background: m === k ? T.accentD : T.surface, color: m === k ? T.accent : T.t2, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>{k}</button>
        ))}
      </div>
      <div style={{ height: 180 }}><canvas ref={r} /></div>
    </div>
  );
}

// ── RecentOrders ──
function RecentOrders({ orders, onView }) {
  const active = useMemo(() => orders.filter(o => o.currentStage !== 'completed').slice(0, 8), [orders]);
  const th = { textAlign: 'left', padding: '0.6rem 0.85rem', fontSize: '0.68rem', fontWeight: 600, color: T.t3, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${T.bdr}` };
  const td = { padding: '0.7rem 0.85rem', fontSize: '0.8rem', color: T.t2 };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          <th style={th}>Order</th><th style={th}>Deceased</th><th style={th}>Stage</th><th style={th}>Assigned</th><th style={th}>Priority</th><th style={th}>Progress</th>
        </tr></thead>
        <tbody>
          {active.map(o => {
            const si = STAGES.findIndex(s => s.id === o.currentStage);
            const pct = Math.round((si / (STAGES.length - 1)) * 100);
            const st = STAGES[si];
            return (
              <tr key={o.id} onClick={() => onView(o.id)} style={{ borderBottom: `1px solid ${T.bdr}`, cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={td}><strong style={{ color: T.accent }}>{o.orderNumber}</strong><br /><span style={{ fontSize: '.68rem', color: T.t3 }}>{o.coffinType}</span></td>
                <td style={td}>{o.deceasedName}</td>
                <td style={td}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', borderRadius: 99, fontSize: '0.65rem', fontWeight: 600, background: st.color + '18', color: st.color }}><i className={`fas ${st.icon}`} style={{ fontSize: '.55rem' }} /> {st.label}</span></td>
                <td style={{ ...td, color: o.assignedWorker.color, fontWeight: 600 }}>{o.assignedWorker.name.split(' ')[0]}</td>
                <td style={td}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.18rem 0.5rem', borderRadius: 99, fontSize: '0.65rem', fontWeight: 600,
                    background: o.priority === 'urgent' ? T.errBg : o.priority === 'high' ? T.warnBg : T.surfaceHover,
                    color: o.priority === 'urgent' ? T.err : o.priority === 'high' ? T.warn : T.t3
                  }}>{o.priority}</span>
                </td>
                <td style={{ ...td, minWidth: 110 }}>
                  <div style={{ height: 5, background: T.bdr, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, width: pct + '%', background: st.color }} />
                  </div>
                  <span style={{ fontSize: '.62rem', color: T.t3 }}>{pct}%</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── ActivityFeed ──
function ActivityFeed({ activity }) {
  return (
    <div style={{ maxHeight: 280, overflowY: 'auto' }}>
      {activity.slice(0, 10).map((a, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem 0', borderBottom: `1px solid ${T.bdr}` }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: '0.35rem', flexShrink: 0, background: a.type === 'success' ? T.ok : T.info }} />
          <div>
            <div style={{ fontSize: '0.78rem', color: T.t2, lineHeight: 1.45 }} dangerouslySetInnerHTML={{ __html: `<strong>${a.worker.name}</strong> ${a.action} <strong>${a.coffin.orderNumber}</strong>` }} />
            <div style={{ fontSize: '0.62rem', color: T.t3, marginTop: '0.15rem' }}>{timeAgo(a.time)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── QuickInsights ──
function QuickInsights({ insights }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
      {insights.slice(0, 3).map((ins, i) => (
        <div key={i} style={{ padding: '0.85rem', borderRadius: 10, border: `1px solid ${T.bdr}`, background: ins.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', background: ins.iconBg, color: ins.iconClr }}>
              <i className={`fas ${ins.icon}`} />
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: ins.iconClr }}>{ins.type}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: T.t2, lineHeight: 1.45 }} dangerouslySetInnerHTML={{ __html: ins.text }} />
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD TAB
// ═══════════════════════════════════════════════════════════
function DashboardTab() {
  const { orders, activity, materials, workers, openModal } = useContext(Ctx);
  const insights = useMemo(() => genInsights(orders, materials, workers), [orders, materials, workers]);
  const ac = orders.filter(o => o.currentStage !== 'completed').length;
  const ls = materials.filter(m => m.quantity <= m.minLevel).length;
  const now = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: T.t1 }}>Production Dashboard</div>
          <div style={{ color: T.t3, fontSize: '0.8rem', marginTop: '0.2rem' }}>Real-time workshop overview — {now}</div>
        </div>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: "'DM Sans', sans-serif", background: T.accent, color: '#fff' }} onClick={() => openModal('newOrder')}>
          <i className="fas fa-plus" style={{ fontSize: '0.8rem' }} /> New Coffin Order
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <StatCard label="Active Coffins" value={ac} icon="fa-list-check" color={T.accent} bg={T.accentD} chg="12% vs yesterday" chgColor={T.ok} chgBg={T.okBg} delay=".05s" />
        <StatCard label="Completed Today" value={8} icon="fa-circle-check" color={T.ok} bg={T.okBg} chg="8% vs yesterday" chgColor={T.ok} chgBg={T.okBg} delay=".1s" />
        <StatCard label="Workers On-Duty" value={workers.length} icon="fa-users-gear" color={T.info} bg={T.infoBg} chg="Same as yesterday" chgColor={T.info} chgBg={T.infoBg} delay=".15s" />
        <StatCard label="Low Stock Alerts" value={ls} icon="fa-triangle-exclamation" color={T.err} bg={T.errBg} chg="2 less than yesterday" chgColor={T.err} chgBg={T.errBg} delay=".2s" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: `1px solid ${T.bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <i className="fas fa-route" style={{ fontSize: '0.8rem', color: T.accent }} /> Production Pipeline
            </div>
            <span style={{ padding: '0.18rem 0.5rem', borderRadius: 99, fontSize: '0.62rem', fontWeight: 600, background: T.infoBg, color: T.info }}>9 Stages</span>
          </div>
          <Pipeline orders={orders} />
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: `1px solid ${T.bdr}` }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <i className="fas fa-chart-column" style={{ fontSize: '0.8rem', color: T.accent }} /> Weekly Output
            </div>
          </div>
          <div style={{ padding: '1.15rem' }}><WeeklyChart /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: `1px solid ${T.bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <i className="fas fa-list-check" style={{ fontSize: '0.8rem', color: T.accent }} /> Active Orders
            </div>
          </div>
          <RecentOrders orders={orders} onView={(id) => openModal('orderDetail', id)} />
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: `1px solid ${T.bdr}` }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <i className="fas fa-bolt" style={{ fontSize: '0.8rem', color: T.accent }} /> Live Activity
            </div>
          </div>
          <div style={{ padding: '1.15rem' }}><ActivityFeed activity={activity} /></div>
        </div>
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.15rem', borderBottom: `1px solid ${T.bdr}` }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <i className="fas fa-brain" style={{ fontSize: '0.8rem', color: T.accent }} /> AI Quick Insights
          </div>
        </div>
        <div style={{ padding: '1.15rem' }}><QuickInsights insights={insights} /></div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  PRODUCTION TAB
// ═══════════════════════════════════════════════════════════
function ProductionTab() {
  const { orders, openModal } = useContext(Ctx);
  const [flt, setFlt] = useState('all');
  const filtered = useMemo(() => flt === 'all' ? orders : orders.filter(o => o.currentStage === flt), [orders, flt]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: T.t1 }}>Production Queue</div>
          <div style={{ color: T.t3, fontSize: '0.8rem', marginTop: '0.2rem' }}>All active coffin orders</div>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          <select value={flt} onChange={e => setFlt(e.target.value)} style={{ padding: '0.45rem 0.75rem', borderRadius: 8, background: T.surface, border: `1px solid ${T.bdr}`, color: T.t1, fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', cursor: 'pointer', width: 150 }}>
            <option value="all">All Stages</option>
            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: "'DM Sans', sans-serif", background: T.accent, color: '#fff' }} onClick={() => openModal('newOrder')}>
            <i className="fas fa-plus" style={{ fontSize: '0.8rem' }} /> New Order
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '0.85rem' }}>
        {filtered.map(o => {
          const si = STAGES.findIndex(s => s.id === o.currentStage);
          const st = STAGES[si];
          return (
            <div key={o.id} onClick={() => openModal('orderDetail', o.id)} style={{
              background: T.surface, border: `1px solid ${o.priority === 'urgent' ? T.err : o.priority === 'high' ? T.warn : T.bdr}`,
              borderLeft: o.priority === 'urgent' ? `3px solid ${T.err}` : o.priority === 'high' ? `3px solid ${T.warn}` : `3px solid ${T.accent}`,
              borderRadius: 10, padding: '1rem', cursor: 'pointer', position: 'relative', transition: 'all 0.15s'
            }}>
              {o.priority !== 'normal' && (
                <div style={{
                  position: 'absolute', top: 0, right: 0, padding: '0.18rem 0.6rem', borderRadius: '0 10px 0 8px', fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase',
                  background: o.priority === 'urgent' ? T.errBg : T.warnBg, color: o.priority === 'urgent' ? T.err : T.warn
                }}>{o.priority}</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.4rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: T.accent }}>{o.orderNumber}</div>
                  <div style={{ fontSize: '.7rem', color: T.t3, marginTop: '.1rem' }}>{o.coffinType} — {o.color}</div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.18rem 0.5rem', borderRadius: 99, fontSize: '0.62rem', fontWeight: 600, background: st.color + '18', color: st.color }}>
                  <i className={`fas ${st.icon}`} style={{ fontSize: '.55rem' }} /> {st.label}
                </span>
              </div>
              <div style={{ fontSize: '.78rem', color: T.t2, marginBottom: '.2rem' }}><strong style={{ color: T.t1 }}>Deceased:</strong> {o.deceasedName}</div>
              <div style={{ fontSize: '.75rem', color: T.t3, marginBottom: '.1rem' }}>
                <i className="fas fa-user" style={{ fontSize: '0.65rem', width: 12 }} /> {o.assignedWorker.name} &nbsp;|&nbsp; <i className="fas fa-clock" style={{ fontSize: '0.65rem', width: 12 }} /> {timeAgo(o.createdAt)}
              </div>
              <div style={{ fontSize: '.75rem', color: T.t3, marginBottom: '.4rem' }}>
                <i className="fas fa-tag" style={{ fontSize: '0.65rem', width: 12 }} /> KES {o.price.toLocaleString()} &nbsp;|&nbsp; <i className="fas fa-couch" style={{ fontSize: '0.65rem', width: 12 }} /> {o.interior}
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {STAGES.map((s, i) => (
                  <div key={s.id} style={{ flex: 1, height: 3, borderRadius: 2, background: i < si ? T.ok : i === si ? T.accent : T.bdr }} />
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: T.t3 }}>
            <i className="fas fa-inbox" style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '0.75rem', display: 'block' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>No orders in this stage</div>
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  LEADERBOARD TAB
// ═══════════════════════════════════════════════════════════
function LeaderboardTab() {
  const { workers } = useContext(Ctx);
  const [per, setPer] = useState('today');
  const ck = per === 'today' ? 'todayCount' : per === 'week' ? 'weekCount' : per === 'month' ? 'monthCount' : 'allTime';
  const ul = per === 'today' ? 'today' : per === 'week' ? 'this week' : per === 'month' ? 'this month' : 'all time';
  const sorted = useMemo(() => [...workers].sort((a, b) => b[ck] - a[ck]), [workers, ck]);
  const byAvg = useMemo(() => [...workers].sort((a, b) => a.avgHours - b.avgHours), [workers]);
  const avgR = useRef(null), pieR = useRef(null);
  const rBgs = ['linear-gradient(135deg,#2563EB,#1D4ED8)', 'linear-gradient(135deg,#94A3B8,#64748B)', 'linear-gradient(135deg,#D97706,#92400E)'];

  useChart(avgR, () => ({
    type: 'bar', indexAxis: 'y',
    data: { labels: byAvg.map(w => w.name.split(' ')[0]), datasets: [{ label: 'Avg Hours', data: byAvg.map(w => w.avgHours), backgroundColor: byAvg.map(w => w.color + '99'), borderRadius: 6, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: `${T.bdr}66` }, beginAtZero: true, ticks: { color: T.t3 } }, y: { grid: { display: false }, ticks: { color: T.t3 } } } },
  }), [workers]);

  useChart(pieR, () => ({
    type: 'doughnut',
    data: { labels: workers.map(w => w.name.split(' ')[0]), datasets: [{ data: workers.map(w => w.monthCount), backgroundColor: workers.map(w => w.color + 'cc'), borderWidth: 0, spacing: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'right', labels: { boxWidth: 10, padding: 6, usePointStyle: true, pointStyle: 'circle', font: { size: 10 }, color: T.t2 } } } },
  }), [workers]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: T.t1 }}>Performance Leaderboard</div>
          <div style={{ color: T.t3, fontSize: '0.8rem', marginTop: '0.2rem' }}>Worker rankings based on production output</div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', background: T.surfaceHover, borderRadius: 8, padding: '0.2rem' }}>
          {[['today', 'Today'], ['week', 'Week'], ['month', 'Month'], ['all', 'All']].map(([k, l]) => (
            <button key={k} onClick={() => setPer(k)} style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: 'none', background: per === k ? T.surface : 'transparent', color: per === k ? T.accent : T.t3, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: per === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: `1px solid ${T.bdr}` }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <i className="fas fa-crown" style={{ fontSize: '0.8rem', color: T.accent }} /> Top Producers
            </div>
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {sorted.map((w, i) => {
              const ti = w.trend === 'up' ? <i className="fas fa-arrow-trend-up" style={{ color: T.ok, fontSize: '0.6rem' }} /> : w.trend === 'down' ? <i className="fas fa-arrow-trend-down" style={{ color: T.err, fontSize: '0.6rem' }} /> : <i className="fas fa-minus" style={{ color: T.t3, fontSize: '0.6rem' }} />;
              return (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.7rem 1rem', marginBottom: '0.15rem', borderRadius: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, background: i < 3 ? rBgs[i] : T.surfaceHover, color: i < 3 ? '#fff' : T.t3 }}>{i + 1}</div>
                  <div style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#fff', flexShrink: 0, background: w.color }}>{w.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', color: T.t1 }}>{w.name} {ti}</div>
                    <div style={{ fontSize: '0.65rem', color: T.t3 }}>{w.role}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: T.accent }}>{w[ck]}</div>
                    <div style={{ fontSize: '0.6rem', color: T.t3 }}>{ul}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, overflow: 'hidden', marginBottom: '0.85rem' }}>
            <div style={{ padding: '0.85rem 1.15rem', borderBottom: `1px solid ${T.bdr}` }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <i className="fas fa-gauge-high" style={{ fontSize: '0.8rem', color: T.accent }} /> Avg Completion Time
              </div>
            </div>
            <div style={{ padding: '1.15rem', height: 250 }}><canvas ref={avgR} /></div>
          </div>
          <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '0.85rem 1.15rem', borderBottom: `1px solid ${T.bdr}` }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <i className="fas fa-chart-pie" style={{ fontSize: '0.8rem', color: T.accent }} /> Output Distribution
              </div>
            </div>
            <div style={{ padding: '1.15rem', height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><canvas ref={pieR} /></div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  INSIGHTS TAB
// ═══════════════════════════════════════════════════════════
function InsightsTab() {
  const { orders, materials, workers, addToast } = useContext(Ctx);
  const insights = useMemo(() => genInsights(orders, materials, workers), [orders, materials, workers]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: T.t1 }}>AI-Powered Insights</div>
          <div style={{ color: T.t3, fontSize: '0.8rem', marginTop: '0.2rem' }}>Predictive analytics and recommendations</div>
        </div>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.9rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: T.t2, border: `1px solid ${T.bdr}`, fontFamily: "'DM Sans', sans-serif" }} onClick={() => addToast('info', 'AI Engine', 'Regenerating insights...')}>
          <i className="fas fa-rotate" style={{ fontSize: '0.8rem' }} /> Regenerate
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        {insights.map((ins, i) => (
          <div key={i} style={{ padding: '0.9rem', borderRadius: 10, border: `1px solid ${T.bdr}`, background: ins.bg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', background: ins.iconBg, color: ins.iconClr }}>
                <i className={`fas ${ins.icon}`} />
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: ins.iconClr }}>{ins.type}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: T.t2, lineHeight: 1.45 }} dangerouslySetInnerHTML={{ __html: ins.text }} />
            {ins.actLbl && (
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.28rem 0.6rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: T.t2, border: `1px solid ${T.bdr}`, fontFamily: "'DM Sans', sans-serif", marginTop: '.65rem' }} onClick={() => addToast('info', 'Action', ins.actLbl + ' initiated')}>
                {ins.actLbl}
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  ANALYTICS TAB
// ═══════════════════════════════════════════════════════════
function AnalyticsTab() {
  const { orders } = useContext(Ctx);
  const [per, setPer] = useState('weekly');
  const labels = per === 'weekly' ? ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8'] : per === 'monthly' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'] : ['Q1', 'Q2', 'Q3', 'Q4'];
  const m = per === 'weekly' ? 1 : per === 'monthly' ? 4 : 12;
  const oR = useRef(null), rR = useRef(null), ctR = useRef(null), bnR = useRef(null), efR = useRef(null);
  const sd = useMemo(() => STAGES.slice(0, -1).map(s => orders.filter(o => o.currentStage === s.id).length), [orders]);
  const chartColors = { ticks: T.t3, grid: `${T.bdr}66` };

  useChart(oR, () => ({
    type: 'line',
    data: {
      labels, datasets: [
        { label: 'Orders', data: [18, 22, 19, 25, 28, 24, 31, 27].map(v => v * m), borderColor: T.accent, backgroundColor: `${T.accent}15`, fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: T.accent },
        { label: 'Completed', data: [15, 20, 17, 23, 26, 22, 28, 25].map(v => v * m), borderColor: T.ok, backgroundColor: `${T.ok}12`, fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: T.ok },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { boxWidth: 12, usePointStyle: true, pointStyle: 'circle', color: T.t2 } } }, scales: { x: { grid: { display: false }, ticks: { color: T.t3 } }, y: { grid: { color: chartColors.grid }, beginAtZero: true, ticks: { color: T.t3 } } } },
  }), [per]);

  useChart(rR, () => ({
    type: 'bar',
    data: { labels, datasets: [{ label: 'Revenue (KES)', data: [285000, 340000, 295000, 410000, 455000, 390000, 520000, 460000].map(v => v * m), backgroundColor: `${T.accent}88`, borderRadius: 6, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { boxWidth: 12, usePointStyle: true, pointStyle: 'circle', color: T.t2 } } }, scales: { x: { grid: { display: false }, ticks: { color: T.t3 } }, y: { grid: { color: chartColors.grid }, beginAtZero: true, ticks: { color: T.t3, callback: (v) => 'KES ' + v / 1000 + 'K' } } } },
  }), [per]);

  useChart(ctR, () => ({
    type: 'doughnut',
    data: { labels: CTYPES, datasets: [{ data: [35, 28, 15, 12, 6, 4], backgroundColor: T.chartColors, borderWidth: 0, spacing: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'right', labels: { boxWidth: 10, padding: 6, usePointStyle: true, pointStyle: 'circle', font: { size: 10 }, color: T.t2 } } } },
  }), []);

  useChart(bnR, () => ({
    type: 'bar',
    data: { labels: STAGES.slice(0, -1).map(s => s.label), datasets: [{ label: 'Coffins in Stage', data: sd, backgroundColor: STAGES.slice(0, -1).map(s => s.color + '77'), borderRadius: 6, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 9 }, color: T.t3 } }, y: { beginAtZero: true, grid: { color: chartColors.grid }, ticks: { color: T.t3 } } } },
  }), [sd]);

  useEffect(() => {
    if (!efR.current) return;
    try {
      const c = efR.current;
      const dpr = window.devicePixelRatio || 1;
      c.width = 200 * dpr;
      c.height = 200 * dpr;
      const ctx = c.getContext('2d');
      ctx.scale(dpr, dpr);
      c.style.width = '200px';
      c.style.height = '200px';
      const cx = 100, cy = 110, r = 75, sa = Math.PI * 0.8, ea = Math.PI * 2.2, va = sa + 0.87 * (ea - sa);
      ctx.clearRect(0, 0, 200, 200);
      ctx.beginPath(); ctx.arc(cx, cy, r, sa, ea);
      ctx.strokeStyle = T.bdr;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.stroke();
      const g = ctx.createLinearGradient(0, 0, 200, 0);
      g.addColorStop(0, T.err);
      g.addColorStop(0.4, T.warn);
      g.addColorStop(0.7, T.ok);
      g.addColorStop(1, T.ok);
      ctx.beginPath();
      ctx.arc(cx, cy, r, sa, va);
      ctx.strokeStyle = g;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.fillStyle = T.t1;
      ctx.font = '900 36px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('87%', cx, cy);
      ctx.fillStyle = T.t3;
      ctx.font = '500 11px DM Sans, sans-serif';
      ctx.fillText('EFFICIENCY', cx, cy + 30);
    } catch (e) {
      console.warn('Canvas error:', e);
    }
  }, []);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: T.t1 }}>Production Analytics</div>
          <div style={{ color: T.t3, fontSize: '0.8rem', marginTop: '0.2rem' }}>Detailed charts and trend analysis</div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', background: T.surfaceHover, borderRadius: 8, padding: '0.2rem' }}>
          {['weekly', 'monthly', 'quarterly'].map(p => (
            <button key={p} onClick={() => setPer(p)} style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: 'none', background: per === p ? T.surface : 'transparent', color: per === p ? T.accent : T.t3, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: per === p ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', textTransform: 'capitalize' }}>{p}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: `1px solid ${T.bdr}` }}><div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Orders Over Time</div></div>
          <div style={{ padding: '1.15rem', height: 280 }}><canvas ref={oR} /></div>
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: `1px solid ${T.bdr}` }}><div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Revenue Trend</div></div>
          <div style={{ padding: '1.15rem', height: 280 }}><canvas ref={rR} /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
        <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: `1px solid ${T.bdr}` }}><div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Coffin Types</div></div>
          <div style={{ padding: '1.15rem', height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><canvas ref={ctR} /></div>
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: `1px solid ${T.bdr}` }}><div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Stage Bottlenecks</div></div>
          <div style={{ padding: '1.15rem', height: 250 }}><canvas ref={bnR} /></div>
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: `1px solid ${T.bdr}` }}><div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Efficiency Score</div></div>
          <div style={{ padding: '1.15rem', height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><canvas ref={efR} /></div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  WORKERS TAB
// ═══════════════════════════════════════════════════════════
function WorkersTab() {
  const { workers, orders } = useContext(Ctx);
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: T.t1 }}>Workshop Workers</div>
          <div style={{ color: T.t3, fontSize: '0.8rem', marginTop: '0.2rem' }}>Manage your production team</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.85rem' }}>
        {workers.map(w => {
          const ac = orders.filter(o => o.assignedWorker.id === w.id && o.currentStage !== 'completed').length;
          const ti = w.trend === 'up' ? <i className="fas fa-arrow-trend-up" style={{ color: T.ok, fontSize: '0.8rem' }} /> : w.trend === 'down' ? <i className="fas fa-arrow-trend-down" style={{ color: T.err, fontSize: '0.8rem' }} /> : <i className="fas fa-minus" style={{ color: T.t3, fontSize: '0.8rem' }} />;
          return (
            <div key={w.id} style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '1.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', marginBottom: '0.85rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: w.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#fff', flexShrink: 0 }}>{w.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '.9rem', color: T.t1 }}>{w.name}</div>
                    <div style={{ fontSize: '.7rem', color: T.t3 }}>{w.role}</div>
                  </div>
                  {ti}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.4rem', marginBottom: '0.85rem' }}>
                  {[
                    { v: w.todayCount, l: 'Today', c: T.accent },
                    { v: w.weekCount, l: 'Week', c: T.info },
                    { v: w.monthCount, l: 'Month', c: T.ok },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '0.4rem', background: T.surfaceHover, borderRadius: 6 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: s.c }}>{s.v}</div>
                      <div style={{ fontSize: '0.55rem', color: T.t3, textTransform: 'uppercase' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: T.t2, marginBottom: '.25rem' }}><span>Speed</span><span>{Math.round(w.speed * 100)}%</span></div>
                <div style={{ height: 5, background: T.bdr, borderRadius: 3, overflow: 'hidden', marginBottom: '.5rem' }}>
                  <div style={{ height: '100%', borderRadius: 3, width: w.speed * 100 + '%', background: w.color }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: T.t2, marginBottom: '.25rem' }}><span>Reliability</span><span>{Math.round(w.reliability * 100)}%</span></div>
                <div style={{ height: 5, background: T.bdr, borderRadius: 3, overflow: 'hidden', marginBottom: '.65rem' }}>
                  <div style={{ height: '100%', borderRadius: 3, width: w.reliability * 100 + '%', background: T.ok }} />
                </div>
                <div style={{ fontSize: '.72rem', color: T.t3 }}><i className="fas fa-list-check" style={{ fontSize: '0.65rem', width: 12 }} /> {ac} active — Avg {w.avgHours}h per coffin</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  MATERIALS TAB
// ═══════════════════════════════════════════════════════════
function MaterialsTab() {
  const { materials, restockMat } = useContext(Ctx);
  const th = { textAlign: 'left', padding: '0.6rem 0.85rem', fontSize: '0.68rem', fontWeight: 600, color: T.t3, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${T.bdr}` };
  const td = { padding: '0.7rem 0.85rem', fontSize: '0.8rem', color: T.t2 };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: T.t1 }}>Materials Inventory</div>
          <div style={{ color: T.t3, fontSize: '0.8rem', marginTop: '0.2rem' }}>Track stock levels and suppliers</div>
        </div>
      </div>
      <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={th}>Material</th><th style={th}>Category</th><th style={th}>In Stock</th><th style={th}>Min Level</th>
              <th style={th}>Unit Cost</th><th style={th}>Supplier</th><th style={th}>Status</th><th style={th}>Actions</th>
            </tr></thead>
            <tbody>
              {materials.map(m => {
                const low = m.quantity <= m.minLevel;
                const crit = m.quantity <= m.minLevel * 0.5;
                const st = crit ? { bg: T.errBg, clr: T.err, lbl: 'Critical' } : low ? { bg: T.warnBg, clr: T.warn, lbl: 'Low Stock' } : { bg: T.okBg, clr: T.ok, lbl: 'In Stock' };
                return (
                  <tr key={m.id} style={{ borderBottom: `1px solid ${T.bdr}` }}
                    onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={td}><strong style={{ color: T.t1 }}>{m.name}</strong></td>
                    <td style={td}><span style={{ padding: '0.18rem 0.5rem', borderRadius: 99, fontSize: '0.62rem', fontWeight: 600, background: T.surfaceHover, color: T.t3 }}>{m.category}</span></td>
                    <td style={{ ...td, fontWeight: 700, color: low ? T.err : T.t1 }}>{m.quantity} {m.unit}</td>
                    <td style={td}>{m.minLevel} {m.unit}</td>
                    <td style={td}>KES {m.costPerUnit.toLocaleString()}</td>
                    <td style={{ ...td, fontSize: '.75rem' }}>{m.supplier}</td>
                    <td style={td}>
                      <span style={{ padding: '0.18rem 0.5rem', borderRadius: 99, fontSize: '0.62rem', fontWeight: 600, background: st.bg, color: st.clr }}>{st.lbl}</span>
                    </td>
                    <td style={td}>
                      <button style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.bdr}`, background: T.surface, color: T.t2, cursor: 'pointer' }} onClick={() => restockMat(m.id)}>
                        <i className="fas fa-plus" style={{ fontSize: '0.7rem' }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════════════════════
function NewOrderModal({ close }) {
  const { addToast, createOrder } = useContext(Ctx);
  const [f, setF] = useState({ customer: '', deceased: '', type: 'Standard', priority: 'normal', color: 'Walnut', interior: 'Satin Gold', due: '' });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  const submit = () => {
    if (!f.customer || !f.deceased) { addToast('error', 'Validation', 'Enter customer and deceased names'); return; }
    createOrder(f.customer, f.deceased, f.type, f.priority, f.color, f.interior, f.due);
    close();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 14, width: '90%', maxWidth: 540, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ padding: '1.15rem 1.35rem', borderBottom: `1px solid ${T.bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0, color: T.t1 }}><i className="fas fa-plus" style={{ fontSize: '0.85rem', color: T.accent }} /> New Coffin Order</h3>
          <button style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.bdr}`, background: T.surface, color: T.t2, cursor: 'pointer' }} onClick={close}><i className="fas fa-xmark" style={{ fontSize: '0.85rem' }} /></button>
        </div>
        <div style={{ padding: '1.35rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {[{ k: 'customer', l: 'Customer Name', p: 'Enter customer name' }, { k: 'deceased', l: 'Deceased Name', p: 'Enter deceased name' }].map(fld => (
              <div key={fld.k} style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: T.t2, marginBottom: '0.3rem', textTransform: 'uppercase' }}>{fld.l}</label>
                <input value={f[fld.k]} onChange={e => u(fld.k, e.target.value)} placeholder={fld.p} style={{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: 8, background: T.surfaceHover, border: `1px solid ${T.bdr}`, color: T.t1, fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {[{ k: 'type', l: 'Coffin Type', opts: CTYPES }, { k: 'priority', l: 'Priority', opts: ['normal', 'high', 'urgent'] }].map(fld => (
              <div key={fld.k} style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: T.t2, marginBottom: '0.3rem', textTransform: 'uppercase' }}>{fld.l}</label>
                <select value={f[fld.k]} onChange={e => u(fld.k, e.target.value)} style={{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: 8, background: T.surfaceHover, border: `1px solid ${T.bdr}`, color: T.t1, fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', cursor: 'pointer' }}>
                  {fld.opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {[{ k: 'color', l: 'Color / Finish', opts: COLORS }, { k: 'interior', l: 'Interior Fabric', opts: INTERIORS }].map(fld => (
              <div key={fld.k} style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: T.t2, marginBottom: '0.3rem', textTransform: 'uppercase' }}>{fld.l}</label>
                <select value={f[fld.k]} onChange={e => u(fld.k, e.target.value)} style={{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: 8, background: T.surfaceHover, border: `1px solid ${T.bdr}`, color: T.t1, fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', cursor: 'pointer' }}>
                  {fld.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: T.t2, marginBottom: '0.3rem', textTransform: 'uppercase' }}>Due Date</label>
            <input type="date" value={f.due} onChange={e => u('due', e.target.value)} style={{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: 8, background: T.surfaceHover, border: `1px solid ${T.bdr}`, color: T.t1, fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
          </div>
        </div>
        <div style={{ padding: '0.85rem 1.35rem', borderTop: `1px solid ${T.bdr}`, display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
          <button style={{ padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: T.t2, border: `1px solid ${T.bdr}`, fontFamily: "'DM Sans', sans-serif" }} onClick={close}>Cancel</button>
          <button style={{ padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: "'DM Sans', sans-serif", background: T.accent, color: '#fff' }} onClick={submit}><i className="fas fa-circle-check" style={{ fontSize: '0.8rem' }} /> Create Order</button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ orderId, close }) {
  const { orders, advanceStage, reassignOrder, removeOrder } = useContext(Ctx);
  const o = orders.find(x => x.id === orderId);
  if (!o) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 14, width: '90%', maxWidth: 660, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ padding: '1.15rem 1.35rem', borderBottom: `1px solid ${T.bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: T.t1 }}><span style={{ color: T.accent }}>{o.orderNumber}</span> — {o.coffinType}</h3>
          <button style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.bdr}`, background: T.surface, color: T.t2, cursor: 'pointer' }} onClick={close}><i className="fas fa-xmark" style={{ fontSize: '0.85rem' }} /></button>
        </div>
        <div style={{ padding: '1.35rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            {[
              { lbl: 'Customer', v: o.customerName },
              { lbl: 'Deceased', v: o.deceasedName },
              { lbl: 'Price', v: `KES ${o.price.toLocaleString()}`, c: T.accent },
            ].map((x, i) => (
              <div key={i} style={{ padding: '.65rem', background: T.surfaceHover, borderRadius: 8 }}>
                <div style={{ fontSize: '.62rem', color: T.t3, textTransform: 'uppercase', marginBottom: '.2rem' }}>{x.lbl}</div>
                <div style={{ fontWeight: 600, fontSize: '.85rem', color: x.c || T.t1 }}>{x.v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '.5rem', background: T.surfaceHover, borderRadius: 6, fontSize: '.78rem' }}><span style={{ color: T.t3 }}>Color:</span> <strong style={{ color: T.t1 }}>{o.color}</strong></div>
            <div style={{ padding: '.5rem', background: T.surfaceHover, borderRadius: 6, fontSize: '.78rem' }}><span style={{ color: T.t3 }}>Interior:</span> <strong style={{ color: T.t1 }}>{o.interior}</strong></div>
            <div style={{ padding: '.5rem', background: T.surfaceHover, borderRadius: 6, fontSize: '.78rem' }}>
              <span style={{ color: T.t3 }}>Priority:</span>
              <span style={{
                padding: '0.15rem 0.45rem', borderRadius: 99, fontSize: '0.6rem', fontWeight: 600, marginLeft: 4,
                background: o.priority === 'urgent' ? T.errBg : o.priority === 'high' ? T.warnBg : T.surface, color: o.priority === 'urgent' ? T.err : o.priority === 'high' ? T.warn : T.t3
              }}>{o.priority}</span>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '.72rem', fontWeight: 600, color: T.t2, marginBottom: '.65rem', textTransform: 'uppercase' }}>Assigned Worker</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', padding: '.65rem', background: T.surfaceHover, borderRadius: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: o.assignedWorker.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#fff', flexShrink: 0 }}>{o.assignedWorker.initials}</div>
              <div><div style={{ fontWeight: 600, color: T.t1 }}>{o.assignedWorker.name}</div><div style={{ fontSize: '.7rem', color: T.t3 }}>{o.assignedWorker.role}</div></div>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '.72rem', fontWeight: 600, color: T.t2, marginBottom: '.65rem', textTransform: 'uppercase' }}>Production Stages</div>
            <div style={{ display: 'flex', overflowX: 'auto', padding: '.25rem 0' }}>
              {STAGES.map((s, i) => {
                const os = o.stages.find(x => x.id === s.id);
                const done = os && os.status === 'completed';
                const active = os && os.status === 'in_progress';
                return (
                  <div key={s.id} style={{ flex: 1, minWidth: 75, textAlign: 'center', position: 'relative' }}>
                    {i < STAGES.length - 1 && <div style={{ position: 'absolute', top: 14, left: 'calc(50% + 14px)', right: 'calc(-50% + 14px)', height: 2, background: done ? T.ok : active ? T.accent : T.bdr }} />}
                    <div style={{ width: 28, height: 28, borderRadius: '50%', margin: '0 auto 0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', border: `2px solid ${done ? T.ok : active ? T.accent : T.bdr}`, background: done ? T.ok : T.surface, color: done ? '#fff' : active ? T.accent : T.t3, position: 'relative', zIndex: 2 }}>
                      <i className={`fas ${s.icon}`} style={{ fontSize: '0.6rem' }} />
                    </div>
                    <div style={{ fontSize: '0.52rem', color: done ? T.ok : active ? T.accent : T.t3, fontWeight: 600 }}>{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.45rem', flexWrap: 'wrap' }}>
            <button style={{ padding: '0.38rem 0.8rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: "'DM Sans', sans-serif", background: T.accent, color: '#fff' }} onClick={() => { advanceStage(o.id); close(); }}>
              <i className="fas fa-forward-step" style={{ fontSize: '0.7rem' }} /> Advance Stage
            </button>
            <button style={{ padding: '0.38rem 0.8rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', border: `1px solid ${T.bdr}`, background: 'transparent', color: T.t2, fontFamily: "'DM Sans', sans-serif" }} onClick={() => { reassignOrder(o.id); close(); }}>
              <i className="fas fa-user-pen" style={{ fontSize: '0.7rem' }} /> Reassign
            </button>
            <button style={{ padding: '0.38rem 0.8rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', border: `1px solid ${T.err}44`, background: 'transparent', color: T.err, fontFamily: "'DM Sans', sans-serif" }} onClick={() => { removeOrder(o.id); close(); }}>
              <i className="fas fa-trash" style={{ fontSize: '0.7rem' }} /> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddMaterialModal({ close }) {
  const { addMaterial, addToast } = useContext(Ctx);
  const [f, setF] = useState({ name: '', cat: 'Wood', unit: 'pcs', qty: '', min: '10', cost: '', sup: '' });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  const submit = () => {
    if (!f.name || !f.qty || parseInt(f.qty) <= 0) { addToast('error', 'Validation', 'Fill in name and quantity'); return; }
    addMaterial({ name: f.name, category: f.cat, unit: f.unit, quantity: parseInt(f.qty), minLevel: parseInt(f.min) || 10, costPerUnit: parseInt(f.cost) || 0, supplier: f.sup || 'N/A' });
    close();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 14, width: '90%', maxWidth: 540, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ padding: '1.15rem 1.35rem', borderBottom: `1px solid ${T.bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: T.t1, display: 'flex', alignItems: 'center', gap: '0.45rem' }}><i className="fas fa-plus" style={{ fontSize: '0.85rem', color: T.accent }} /> Add Material</h3>
          <button style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.bdr}`, background: T.surface, color: T.t2, cursor: 'pointer' }} onClick={close}><i className="fas fa-xmark" style={{ fontSize: '0.85rem' }} /></button>
        </div>
        <div style={{ padding: '1.35rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: T.t2, marginBottom: '0.3rem', textTransform: 'uppercase' }}>Material Name</label>
            <input value={f.name} onChange={e => u('name', e.target.value)} placeholder="e.g. Oak Planks" style={{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: 8, background: T.surfaceHover, border: `1px solid ${T.bdr}`, color: T.t1, fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {[{ k: 'cat', l: 'Category', opts: ['Wood', 'Hardware', 'Fabric', 'Finish', 'Abrasive'] }, { k: 'unit', l: 'Unit', opts: ['pcs', 'sheets', 'meters', 'liters', 'boxes', 'packs', 'pairs', 'sets', 'rolls'] }].map(fld => (
              <div key={fld.k} style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: T.t2, marginBottom: '0.3rem', textTransform: 'uppercase' }}>{fld.l}</label>
                <select value={f[fld.k]} onChange={e => u(fld.k, e.target.value)} style={{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: 8, background: T.surfaceHover, border: `1px solid ${T.bdr}`, color: T.t1, fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', cursor: 'pointer' }}>
                  {fld.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {[{ k: 'qty', l: 'Quantity', type: 'number' }, { k: 'min', l: 'Min Stock', type: 'number' }].map(fld => (
              <div key={fld.k} style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: T.t2, marginBottom: '0.3rem', textTransform: 'uppercase' }}>{fld.l}</label>
                <input type={fld.type} value={f[fld.k]} onChange={e => u(fld.k, e.target.value)} placeholder="0" style={{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: 8, background: T.surfaceHover, border: `1px solid ${T.bdr}`, color: T.t1, fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {[{ k: 'cost', l: 'Cost Per Unit', type: 'number' }, { k: 'sup', l: 'Supplier' }].map(fld => (
              <div key={fld.k} style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: T.t2, marginBottom: '0.3rem', textTransform: 'uppercase' }}>{fld.l}</label>
                <input type={fld.type || 'text'} value={f[fld.k]} onChange={e => u(fld.k, e.target.value)} placeholder="--" style={{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: 8, background: T.surfaceHover, border: `1px solid ${T.bdr}`, color: T.t1, fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '0.85rem 1.35rem', borderTop: `1px solid ${T.bdr}`, display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
          <button style={{ padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: T.t2, border: `1px solid ${T.bdr}`, fontFamily: "'DM Sans', sans-serif" }} onClick={close}>Cancel</button>
          <button style={{ padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: "'DM Sans', sans-serif", background: T.accent, color: '#fff' }} onClick={submit}><i className="fas fa-circle-check" style={{ fontSize: '0.8rem' }} /> Add Material</button>
        </div>
      </div>
    </div>
  );
}

function ModalRouter({ type, data, close }) {
  if (!type) return null;
  if (type === 'newOrder') return <NewOrderModal close={close} />;
  if (type === 'orderDetail') return <OrderDetailModal orderId={data} close={close} />;
  if (type === 'addMaterial') return <AddMaterialModal close={close} />;
  return null;
}

// ═══════════════════════════════════════════════════════════
//  INJECT CSS
// ═══════════════════════════════════════════════════════════
(function injectStyles() {
  const id = 'workshop-dashboard-styles';
  if (document.getElementById(id)) return;
  const s = document.createElement('style');
  s.id = id;
  s.textContent = `
    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
    @keyframes livePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
  `;
  document.head.appendChild(s);
})();

// ═══════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════
const WorkshopDashboard = () => {
  const [tab, setTab] = useState('dashboard');
  const [modal, setModal] = useState({ type: null, data: null });
  const [toasts, setToasts] = useState([]);
  const [orders, setOrders] = useState(() => makeOrders());
  const [materials, setMaterials] = useState(() => makeMaterials());
  const [workers, setWorkers] = useState(() => WORKERS.map(w => ({ ...w })));
  const [activity, setActivity] = useState(() => makeActivity(makeOrders()));

  const tid = useRef(0);
  const addToast = useCallback((type, title, msg) => {
    const id = ++tid.current;
    setToasts(p => [...p, { id, type, title, msg, out: false }]);
    setTimeout(() => setToasts(p => p.map(t => t.id === id ? { ...t, out: true } : t)), 3500);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  }, []);

  const openModal = useCallback((type, data = null) => setModal({ type, data }), []);
  const closeModal = useCallback(() => setModal({ type: null, data: null }), []);

  const createOrder = useCallback((cust, dec, type, pri, col, int, due) => {
    const w = workers[Math.floor(Math.random() * workers.length)];
    const o = {
      id: gid(), orderNumber: 'CF-' + _id, customerName: cust, deceasedName: dec, coffinType: type,
      color: col || 'Walnut', interior: int || 'Satin Gold', currentStage: 'cutting',
      stages: [{ ...STAGES[0], status: 'in_progress', startedAt: new Date(), completedAt: null }],
      assignedWorker: { ...w }, priority: pri || 'normal', price: PRICES[type] || 20000,
      createdAt: new Date(), dueDate: due ? new Date(due) : new Date(Date.now() + (3 + Math.floor(Math.random() * 5)) * 86400000),
    };
    setOrders(p => [o, ...p]);
    setActivity(a => [{ worker: w, action: 'started new order', coffin: o, time: new Date(), type: 'success' }, ...a]);
    addToast('success', 'New Order', o.orderNumber + ' — ' + o.coffinType);
  }, [workers, addToast]);

  const advanceStage = useCallback((oid) => {
    setOrders(p => p.map(o => {
      if (o.id !== oid) return o;
      const ci = STAGES.findIndex(s => s.id === o.currentStage);
      if (ci >= STAGES.length - 1) return o;
      const ns = STAGES[ci + 1];
      const w = workers[Math.floor(Math.random() * workers.length)];
      const ns2 = [...o.stages];
      ns2[ci] = { ...ns2[ci], status: 'completed', completedAt: new Date() };
      ns2.push({ ...ns, status: 'in_progress', startedAt: new Date(), completedAt: null });
      setActivity(a => [{ worker: w, action: 'moved to ' + ns.label + ' for', coffin: o, time: new Date(), type: ns.id === 'completed' ? 'success' : 'info' }, ...a]);
      if (ns.id === 'completed') setWorkers(ws => ws.map(x => x.id === w.id ? { ...x, todayCount: x.todayCount + 1, weekCount: x.weekCount + 1, monthCount: x.monthCount + 1, allTime: x.allTime + 1 } : x));
      addToast(ns.id === 'completed' ? 'success' : 'info', ns.id === 'completed' ? 'Completed' : 'Stage Advanced', o.orderNumber + (ns.id === 'completed' ? ' finished' : ' moved to ' + ns.label));
      return { ...o, currentStage: ns.id, stages: ns2, assignedWorker: { ...w } };
    }));
  }, [workers, addToast]);

  const reassignOrder = useCallback((oid) => {
    const w = workers[Math.floor(Math.random() * workers.length)];
    setOrders(p => p.map(o => o.id === oid ? { ...o, assignedWorker: { ...w } } : o));
    addToast('info', 'Reassigned', w.name + ' assigned to order');
  }, [workers, addToast]);

  const removeOrder = useCallback((oid) => {
    setOrders(p => p.filter(o => o.id !== oid));
    addToast('info', 'Removed', 'Order removed');
  }, [addToast]);

  const restockMat = useCallback((mid) => {
    setMaterials(p => p.map(m => m.id === mid ? { ...m, quantity: m.quantity + m.minLevel * 2 } : m));
    addToast('success', 'Restocked', 'Material restocked');
  }, [addToast]);

  const addMaterial = useCallback((mat) => {
    setMaterials(p => [...p, { ...mat, id: Math.max(...p.map(m => m.id), 0) + 1 }]);
    addToast('success', 'Added', mat.name + ' added');
  }, [addToast]);

  // Real-time simulation
  useEffect(() => {
    const iv1 = setInterval(() => {
      setOrders(prev => {
        const active = prev.filter(o => o.currentStage !== 'completed');
        if (!active.length) return prev;
        const o = active[Math.floor(Math.random() * active.length)];
        const ci = STAGES.findIndex(s => s.id === o.currentStage);
        if (ci >= STAGES.length - 1) return prev;
        const ns = STAGES[ci + 1];
        const w = WORKERS[Math.floor(Math.random() * WORKERS.length)];
        const ns2 = [...o.stages];
        ns2[ci] = { ...ns2[ci], status: 'completed', completedAt: new Date() };
        ns2.push({ ...ns, status: 'in_progress', startedAt: new Date(), completedAt: null });
        setActivity(a => [{ worker: w, action: 'moved to ' + ns.label + ' for', coffin: o, time: new Date(), type: 'info' }, ...a]);
        return prev.map(x => x.id === o.id ? { ...x, currentStage: ns.id, stages: ns2, assignedWorker: { ...w } } : x);
      });
    }, 12000);
    const iv2 = setInterval(() => {
      if (Math.random() < 0.3) {
        const w = WORKERS[Math.floor(Math.random() * WORKERS.length)];
        const tp = CTYPES[Math.floor(Math.random() * CTYPES.length)];
        const o = {
          id: gid(), orderNumber: 'CF-' + _id, customerName: CUSTOMERS[Math.floor(Math.random() * 12)],
          deceasedName: DECEASED[Math.floor(Math.random() * 12)], coffinType: tp,
          color: COLORS[Math.floor(Math.random() * 6)], interior: INTERIORS[Math.floor(Math.random() * 6)],
          currentStage: 'cutting', stages: [{ ...STAGES[0], status: 'in_progress', startedAt: new Date(), completedAt: null }],
          assignedWorker: { ...w }, priority: Math.random() < 0.1 ? 'urgent' : Math.random() < 0.25 ? 'high' : 'normal',
          price: PRICES[tp] || 20000, createdAt: new Date(),
          dueDate: new Date(Date.now() + (3 + Math.floor(Math.random() * 5)) * 86400000),
        };
        setOrders(p => [o, ...p]);
        setActivity(a => [{ worker: w, action: 'started new order', coffin: o, time: new Date(), type: 'success' }, ...a]);
      }
    }, 28000);
    return () => { clearInterval(iv1); clearInterval(iv2); };
  }, []);

  const ctx = useMemo(() => ({
    orders, materials, workers, activity, toasts, addToast, openModal, closeModal,
    createOrder, advanceStage, reassignOrder, removeOrder, restockMat, addMaterial,
  }), [orders, materials, workers, activity, toasts, addToast, openModal, closeModal, createOrder, advanceStage, reassignOrder, removeOrder, restockMat, addMaterial]);

  const tabs = { dashboard: DashboardTab, production: ProductionTab, leaderboard: LeaderboardTab, insights: InsightsTab, analytics: AnalyticsTab, workers: WorkersTab, materials: MaterialsTab };
  const Tab = tabs[tab] || DashboardTab;

  return (
    <Ctx.Provider value={ctx}>
      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
        <Toasts />
        <TopNav tab={tab} setTab={setTab} />
        <div style={{ padding: '1.25rem 1.5rem 3rem', maxWidth: 1400, margin: '0 auto' }}>
          <Tab />
        </div>
        <ModalRouter type={modal.type} data={modal.data} close={closeModal} />
      </div>
    </Ctx.Provider>
  );
};

export default WorkshopDashboard;