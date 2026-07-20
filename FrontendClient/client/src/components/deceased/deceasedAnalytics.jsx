import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
const ChartJS = Chart;

// ═══════════════════════════════════════════════════════════════
//  TOKENS
// ═══════════════════════════════════════════════════════════════
const T = {
  bg: '#F8FAFC', surface: '#FFFFFF', surfaceHover: '#F1F5F9',
  border: '#E2E8F0', borderLight: '#F1F5F9',
  text: '#0F172A', textBody: '#334155', textSecondary: '#64748B',
  textMuted: '#94A3B8', textFaint: '#CBD5E1',
  primary: '#2563EB', primaryBg: '#EFF6FF', primaryLight: '#93C5FD',
  success: '#059669', successBg: '#ECFDF5', successLight: '#6EE7B7',
  warning: '#D97706', warningBg: '#FFFBEB', warningLight: '#FCD34D',
  danger: '#DC2626', dangerBg: '#FEF2F2', dangerLight: '#FCA5A5',
  purple: '#7C3AED', purpleBg: '#F5F3FF', purpleLight: '#C4B5FD',
  cyan: '#0891B2', cyanBg: '#ECFEFF', cyanLight: '#67E8F9',
  orange: '#EA580C', orangeBg: '#FFF7ED', orangeLight: '#FDBA74',
  pink: '#DB2777', pinkBg: '#FDF2F8', pinkLight: '#F9A8D4',
  teal: '#0D9488', tealBg: '#F0FDFA', tealLight: '#5EEAD4',
  chartColors: ['#2563EB', '#7C3AED', '#0891B2', '#059669', '#D97706', '#DC2626', '#DB2777', '#EA580C', '#14B8A6', '#8B5CF6'],
};

// ═══════════════════════════════════════════════════════════════
//  ICONS (inline SVG to avoid dependency issues)
// ═══════════════════════════════════════════════════════════════
const I = {
  chartBar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="4" height="9" rx="1" /><rect x="10" y="7" width="4" height="14" rx="1" /><rect x="17" y="3" width="4" height="18" rx="1" /></svg>,
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  chevLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
  chevRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
  userPlus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  pulse: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  fileText: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  x: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  arrowRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  refresh: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  filter: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
  alertTriangle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  shield: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  phone: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  user: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  hash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>,
  mapPin: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
};

// ═══════════════════════════════════════════════════════════════
//  MOCK DATA
// ═══════════════════════════════════════════════════════════════
const NAMES = [
  { name: 'John Kamau Njoroge', gender: 'Male' }, { name: 'Mary Wanjiru Kamau', gender: 'Female' },
  { name: 'Peter Otieno Odhiambo', gender: 'Male' }, { name: 'Grace Wambui Muthoni', gender: 'Female' },
  { name: 'James Mwangi Kariuki', gender: 'Male' }, { name: 'Hannah Chebet Kipchoge', gender: 'Female' },
  { name: 'Stephen Mbugua Ngugi', gender: 'Male' }, { name: 'Agnes Nyokabi Githinji', gender: 'Female' },
  { name: 'David Waweru Kimani', gender: 'Male' }, { name: 'Elizabeth Achieng Omondi', gender: 'Female' },
  { name: 'Samuel Kiprop Chelimo', gender: 'Male' }, { name: 'Jane Njeri Wachiuri', gender: 'Female' },
  { name: 'Joseph Maina Gikonyo', gender: 'Male' }, { name: 'Margaret Nduta Kariuki', gender: 'Female' },
  { name: 'Francis Ochieng Owino', gender: 'Male' }, { name: 'Cecilia Wairimu Gathecha', gender: 'Female' },
  { name: 'Daniel Kipngetich Rotich', gender: 'Male' }, { name: 'Rosemary Nasimiyu Wekesa', gender: 'Female' },
  { name: 'Michael Njenga Mwithiga', gender: 'Male' }, { name: 'Dorcas Muthoni Thiongo', gender: 'Female' },
  { name: 'Patrick Kipkurui Bii', gender: 'Male' }, { name: 'Lydia Kawira Mwenda', gender: 'Female' },
  { name: 'Christopher Musyoka Mutua', gender: 'Male' }, { name: 'Peris Akinyi Onyango', gender: 'Female' },
  { name: 'Albert Kipchumba Lagat', gender: 'Male' }, { name: 'Veronica Wanjiku Ndonga', gender: 'Female' },
  { name: 'Thomas Gichuki Mwangi', gender: 'Male' }, { name: 'Naomi Chepngeno Arap', gender: 'Female' },
  { name: 'William Omondi Juma', gender: 'Male' }, { name: 'Susan Wambui Njihia', gender: 'Female' },
  { name: 'Robert Kipchoge Kirui', gender: 'Male' }, { name: 'Ann Njeri Gikunda', gender: 'Female' },
  { name: 'Martin Kiprotich Sang', gender: 'Male' }, { name: 'Lucy Wambui Ndegwa', gender: 'Female' },
  { name: 'George Otieno Awuor', gender: 'Male' }, { name: 'Miriam Chebet Koech', gender: 'Female' },
];
const SOURCES = ['Kenyatta National Hospital', 'Matter Hospital', 'Nairobi West Hospital', 'Brought from Home', 'Police Mortuary', 'MP Shah Hospital', 'Aga Khan Hospital', 'St. Mary\'s Hospital'];
const CONTACTS = ['Mary Njoroge', 'James Kamau', 'Grace Wambui', 'Peter Otieno', 'Hannah Chebet', 'Stephen Mbugua', 'Agnes Nyokabi', 'David Waweru'];

function generateMockData() {
  const today = new Date();
  const records = [];
  let id = 1;
  for (let mOffset = -2; mOffset <= 0; mOffset++) {
    const refDate = new Date(today.getFullYear(), today.getMonth() + mOffset, 1);
    const year = refDate.getFullYear();
    const month = refDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const maxDay = mOffset === 0 ? Math.min(today.getDate(), daysInMonth) : daysInMonth;
    const countForMonth = 18 + ((mOffset + 2) * 11) % 12;
    for (let i = 0; i < countForMonth; i++) {
      const seed = id * 17 + i * 31;
      const day = 1 + (seed % maxDay);
      const hour = 6 + (seed * 3) % 16;
      const min = (seed * 7) % 60;
      const tmpl = NAMES[seed % NAMES.length];
      const age = 18 + (seed * 3) % 80;
      const dobYear = year - age;
      const sr = (seed * 11) % 100;
      let body_status = sr < 46 ? 'In Morgue' : sr < 64 ? 'Released' : sr < 80 ? 'Pending Autopsy' : 'Transferred';
      const pmRequested = body_status === 'Pending Autopsy' ? true : (seed % 7 === 0);
      const pmCompleted = pmRequested && (seed % 4 !== 0);
      const ms = String(month + 1).padStart(2, '0');
      const ds = String(day).padStart(2, '0');
      const dateStr = `${year}-${ms}-${ds}`;
      records.push({
        id,
        admission_number: `ADM-${year}-${String(id).padStart(4, '0')}`,
        full_name: tmpl.name,
        gender: tmpl.gender,
        age,
        date_of_birth: `${dobYear}-${String(1 + (seed % 12)).padStart(2, '0')}-${String(1 + (seed * 2 % 28)).padStart(2, '0')}`,
        date_of_death: dateStr,
        date_admitted: dateStr,
        time_received: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
        cause_of_death: 'Cardiac Arrest',
        body_status,
        postmortem_requested: pmRequested,
        postmortem_completed: pmCompleted,
        postmortem_report: pmCompleted ? 'Report filed — available for collection' : '',
        contact_person: CONTACTS[seed % CONTACTS.length],
        id_number: String(10000000 + (seed * 12345) % 90000000),
        tel_number: `+254 ${712 + (seed % 8)} ${String(100000 + (seed * 111) % 900000).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}`,
        received_from: SOURCES[seed % SOURCES.length],
      });
      id++;
    }
  }
  return records.sort((a, b) => b.date_admitted.localeCompare(a.date_admitted) || b.time_received.localeCompare(a.time_received));
}

const ALL_RECORDS = generateMockData();

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
function dateKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function formatDisplayDate(dateStr) { const d = new Date(dateStr + 'T00:00:00'); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }

function getStatusStyle(status) {
  switch (status) {
    case 'In Morgue': return { bg: T.primaryBg, color: T.primary, dot: T.primary };
    case 'Released': return { bg: T.successBg, color: T.success, dot: T.success };
    case 'Pending Autopsy': return { bg: T.warningBg, color: T.warning, dot: T.warning };
    case 'Transferred': return { bg: T.purpleBg, color: T.purple, dot: T.purple };
    default: return { bg: T.borderLight, color: T.textMuted, dot: T.textMuted };
  }
}

function getPMStyle(req, done) {
  if (!req) return { bg: T.borderLight, color: T.textMuted, label: 'Not Requested' };
  if (done) return { bg: T.successBg, color: T.success, label: 'Completed' };
  return { bg: T.dangerBg, color: T.danger, label: 'Pending' };
}

// ═══════════════════════════════════════════════════════════════
//  CHART HOOK
// ═══════════════════════════════════════════════════════════════
function useChart(ref, fn, deps) {
  const cr = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (cr.current) { cr.current.destroy(); cr.current = null; }
    ChartJS.defaults.color = T.textMuted;
    ChartJS.defaults.borderColor = T.borderLight;
    ChartJS.defaults.font.family = "'Inter',-apple-system,sans-serif";
    ChartJS.defaults.font.size = 11;
    cr.current = new ChartJS(ref.current, fn());
    return () => { if (cr.current) { cr.current.destroy(); cr.current = null; } };
  }, deps);
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const DeceasedAnalytics = () => {
  const [records] = useState(ALL_RECORDS);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pmFilter, setPmFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('3m');
  const [isLoading, setIsLoading] = useState(false);

  // ── Chart Refs ──
  const intakeRef = useRef(null);
  const statusRef = useRef(null);
  const pmRef = useRef(null);
  const stayRef = useRef(null);
  const genderRef = useRef(null);

  // ── Filtered records for selected date ──
  const selectedDateRecords = useMemo(() => {
    if (!selectedDate) return [];
    const dk = dateKey(selectedDate);
    let filtered = records.filter(r => r.date_admitted === dk);
    if (statusFilter !== 'all') filtered = filtered.filter(r => r.body_status === statusFilter);
    if (pmFilter !== 'all') {
      if (pmFilter === 'pending') filtered = filtered.filter(r => r.postmortem_requested && !r.postmortem_completed);
      else if (pmFilter === 'done') filtered = filtered.filter(r => r.postmortem_completed);
      else if (pmFilter === 'not_requested') filtered = filtered.filter(r => !r.postmortem_requested);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r => r.full_name.toLowerCase().includes(q) || r.admission_number.toLowerCase().includes(q));
    }
    return filtered;
  }, [selectedDate, records, statusFilter, pmFilter, searchQuery]);

  // ── Calendar helpers ──
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
    return days;
  }, [calYear, calMonth]);

  const dateRecordMap = useMemo(() => {
    const map = {};
    records.forEach(r => {
      if (!map[r.date_admitted]) map[r.date_admitted] = [];
      map[r.date_admitted].push(r);
    });
    return map;
  }, [records]);

  // ── Computed stats ──
  const stats = useMemo(() => {
    const inMorgue = records.filter(r => r.body_status === 'In Morgue').length;
    const released = records.filter(r => r.body_status === 'Released').length;
    const pmPending = records.filter(r => r.postmortem_requested && !r.postmortem_completed).length;
    const pmDone = records.filter(r => r.postmortem_completed).length;
    const pendingAutopsy = records.filter(r => r.body_status === 'Pending Autopsy').length;
    const transferred = records.filter(r => r.body_status === 'Transferred').length;
    return { total: records.length, inMorgue, released, pmPending, pmDone, pendingAutopsy, transferred };
  }, [records]);

  // ── Monthly chart data ──
  const monthlyData = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const key = r.date_admitted.slice(0, 7);
      if (!map[key]) map[key] = { admissions: 0, releases: 0, pmPending: 0, pmDone: 0 };
      map[key].admissions++;
      if (r.body_status === 'Released') map[key].releases++;
      if (r.postmortem_requested && !r.postmortem_completed) map[key].pmPending++;
      if (r.postmortem_completed) map[key].pmDone++;
    });
    const sorted = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
    return sorted.map(([key, val]) => {
      const [y, m] = key.split('-');
      return { label: MONTH_NAMES[parseInt(m) - 1].slice(0, 3), ...val };
    });
  }, [records]);

  // ── Stay duration data ──
  const stayData = useMemo(() => {
    const ranges = [
      { label: '0-1 day', min: 0, max: 1, color: T.success },
      { label: '2-3 days', min: 2, max: 3, color: T.primary },
      { label: '4-7 days', min: 4, max: 7, color: T.purple },
      { label: '8-14 days', min: 8, max: 14, color: T.warning },
      { label: '15+ days', min: 15, max: 999, color: T.danger },
    ];
    const today = new Date();
    return ranges.map(r => {
      const count = records.filter(rec => {
        const adm = new Date(rec.date_admitted + 'T00:00:00');
        const diff = Math.floor((today - adm) / 86400000);
        return diff >= r.min && diff <= r.max && rec.body_status === 'In Morgue';
      }).length;
      return { ...r, count };
    });
  }, [records]);

  // ── Gender data ──
  const genderData = useMemo(() => {
    const male = records.filter(r => r.gender === 'Male').length;
    const female = records.filter(r => r.gender === 'Female').length;
    return [
      { gender: 'Male', count: male, color: T.primary },
      { gender: 'Female', count: female, color: T.pink },
    ];
  }, [records]);

  // ── Status data ──
  const statusData = useMemo(() => [
    { status: 'In Morgue', count: stats.inMorgue, color: T.primary },
    { status: 'Released', count: stats.released, color: T.success },
    { status: 'Pending Autopsy', count: stats.pendingAutopsy, color: T.warning },
    { status: 'Transferred', count: stats.transferred, color: T.purple },
  ], [stats]);

  // ═══════════════════════════════════════════════════════════════
  //  CHARTS
  // ═══════════════════════════════════════════════════════════════

  // Intake/Release Line
  useChart(intakeRef, () => ({
    type: 'line',
    data: {
      labels: monthlyData.map(m => m.label),
      datasets: [
        { label: 'Admissions', data: monthlyData.map(m => m.admissions), borderColor: T.primary, backgroundColor: `${T.primary}12`, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: T.primary, borderWidth: 2 },
        { label: 'Releases', data: monthlyData.map(m => m.releases), borderColor: T.success, backgroundColor: `${T.success}12`, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: T.success, borderWidth: 2 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { boxWidth: 12, usePointStyle: true, pointStyle: 'circle', padding: 16 } } },
      scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: `${T.border}55` } } },
    },
  }), [records]);

  // Body Status Donut
  useChart(statusRef, () => ({
    type: 'doughnut',
    data: {
      labels: statusData.map(s => s.status),
      datasets: [{ data: statusData.map(s => s.count), backgroundColor: statusData.map(s => s.color), borderWidth: 0, spacing: 3 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '62%',
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10, usePointStyle: true, pointStyle: 'circle', font: { size: 10 } } } },
    },
  }), [stats]);

  // Postmortem Tracking Bar
  useChart(pmRef, () => ({
    type: 'bar',
    data: {
      labels: monthlyData.map(m => m.label),
      datasets: [
        { label: 'Completed', data: monthlyData.map(m => m.pmDone), backgroundColor: `${T.success}99`, borderRadius: 5, borderSkipped: false },
        { label: 'Pending', data: monthlyData.map(m => m.pmPending), backgroundColor: `${T.danger}99`, borderRadius: 5, borderSkipped: false },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { boxWidth: 12, usePointStyle: true, pointStyle: 'circle', padding: 16 } } },
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, beginAtZero: true, grid: { color: `${T.border}55` } },
      },
    },
  }), [records]);

  // Length of Stay
  useChart(stayRef, () => ({
    type: 'bar',
    data: {
      labels: stayData.map(s => s.label),
      datasets: [{ label: 'Current Bodies', data: stayData.map(s => s.count), backgroundColor: stayData.map(s => s.color + '88'), borderRadius: 6, borderSkipped: false }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: `${T.border}55` } } },
    },
  }), [records]);

  // Gender Donut
  useChart(genderRef, () => ({
    type: 'doughnut',
    data: {
      labels: genderData.map(g => g.gender),
      datasets: [{ data: genderData.map(g => g.count), backgroundColor: genderData.map(g => g.color), borderWidth: 0, spacing: 4 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, usePointStyle: true, pointStyle: 'circle' } } },
    },
  }), [records]);

  // ── Calendar Navigation ──
  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); setSelectedDate(null); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); setSelectedDate(null); };
  const goToToday = () => { const t = new Date(); setCalYear(t.getFullYear()); setCalMonth(t.getMonth()); setSelectedDate(t); };

  const isToday = (day) => {
    if (!day) return false;
    const t = new Date();
    return day === t.getDate() && calMonth === t.getMonth() && calYear === t.getFullYear();
  };

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    return day === selectedDate.getDate() && calMonth === selectedDate.getMonth() && calYear === selectedDate.getFullYear();
  };

  // ═══════════════════════════════════════════════════════════════
  //  RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════
  const S = (style) => ({ ...style, animation: 'fadeUp 0.4s ease both' });

  const Select = ({ value, onChange, options, style }) => (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      padding: '0.4rem 1.6rem 0.4rem 0.6rem', border: `1px solid ${T.border}`, borderRadius: '6px', fontSize: '0.78rem', color: T.textBody,
      background: T.surface, cursor: 'pointer', appearance: 'none', outline: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center',
      ...style,
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  // ── Detail Modal ──
  const DetailModal = () => {
    if (!selectedRecord) return null;
    const r = selectedRecord;
    const ss = getStatusStyle(r.body_status);
    const ps = getPMStyle(r.postmortem_requested, r.postmortem_completed);

    const InfoRow = ({ icon, label, value }) => (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.55rem 0', borderBottom: `1px solid ${T.borderLight}` }}>
        <div style={{ width: 28, height: 28, borderRadius: '6px', background: T.primaryBg, color: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.65rem', color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, marginBottom: '0.1rem' }}>{label}</div>
          <div style={{ fontSize: '0.84rem', color: T.text, fontWeight: 500, wordBreak: 'break-word' }}>{value || '—'}</div>
        </div>
      </div>
    );

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease', padding: '1rem' }} onClick={() => setSelectedRecord(null)}>
        <div style={{ background: T.surface, borderRadius: '14px', width: '100%', maxWidth: '520px', maxHeight: '88vh', overflow: 'hidden', boxShadow: '0 25px 60px rgba(15,23,42,0.25)', animation: 'popIn 0.3s cubic-bezier(0.16,1,0.3,1)' }} onClick={e => e.stopPropagation()}>
          {/* Modal Header */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: T.bg }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: T.text, margin: 0 }}>{r.full_name}</h3>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', background: ss.bg, color: ss.color, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: ss.dot }} />{r.body_status}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: T.textMuted }}>{r.admission_number} · {r.gender} · {r.age} yrs</div>
            </div>
            <button onClick={() => setSelectedRecord(null)} style={{ width: 30, height: 30, borderRadius: '6px', border: `1px solid ${T.border}`, background: T.surface, color: T.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>{I.x}</button>
          </div>

          {/* Postmortem Banner */}
          <div style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: `1px solid ${T.border}`, background: ps.bg }}>
            {I.pulse}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: ps.color }}>Postmortem: {ps.label}</div>
              {r.postmortem_report && <div style={{ fontSize: '0.68rem', color: T.textSecondary, marginTop: '0.1rem' }}>{r.postmortem_report}</div>}
            </div>
            {r.postmortem_requested && !r.postmortem_completed && (
              <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', background: T.danger, color: '#fff' }}>ACTION NEEDED</span>
            )}
          </div>

          {/* Details */}
          <div style={{ padding: '0.5rem 1.5rem', overflowY: 'auto', maxHeight: 'calc(88vh - 180px)' }}>
            <InfoRow icon={I.calendar} label="Date Admitted" value={`${formatDisplayDate(r.date_admitted)} at ${r.time_received}`} />
            <InfoRow icon={I.calendar} label="Date of Death" value={formatDisplayDate(r.date_of_death)} />
            <InfoRow icon={I.user} label="Date of Birth" value={formatDisplayDate(r.date_of_birth)} />
            <InfoRow icon={I.hash} label="National ID" value={r.id_number} />
            <InfoRow icon={I.mapPin} label="Received From" value={r.received_from} />
            <InfoRow icon={I.user} label="Contact Person" value={r.contact_person} />
            <InfoRow icon={I.phone} label="Telephone" value={r.tel_number} />
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  LOADING
  // ═══════════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.primary}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 0.75rem' }} />
          <span style={{ fontSize: '0.8rem', color: T.textSecondary }}>Loading analytics...</span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  MAIN RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Inter',-apple-system,sans-serif", color: T.text, padding: '1.25rem 1.5rem', maxWidth: 1440, margin: '0 auto' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes popIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulseDot{0%,100%{opacity:1}50%{opacity:0.4}}
        .cal-scroll::-webkit-scrollbar{width:4px}
        .cal-scroll::-webkit-scrollbar-track{background:transparent}
        .cal-scroll::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
        .record-row{transition:background 0.12s}
        .record-row:hover{background:${T.surfaceHover}}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', ...S({}) }}>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: T.text }}>
            {I.chartBar} Deceased Intelligence
          </h1>
          <p style={{ fontSize: '0.78rem', color: T.textSecondary, margin: '0.2rem 0 0' }}>Body intake analytics, postmortem tracking & calendar navigation</p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', border: `1px solid ${T.border}`, background: T.surface, color: T.textBody, transition: 'all 0.15s' }}>{I.download} Export</button>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', border: `1px solid ${T.border}`, background: T.surface, color: T.textBody, transition: 'all 0.15s' }} onClick={() => window.location.reload()}>{I.refresh} Refresh</button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Admissions', value: stats.total, icon: I.userPlus, color: T.primary, bg: T.primaryBg },
          { label: 'In Morgue', value: stats.inMorgue, icon: I.clock, color: T.cyan, bg: T.cyanBg },
          { label: 'Released', value: stats.released, icon: I.check, color: T.success, bg: T.successBg },
          { label: 'PM Pending', value: stats.pmPending, icon: I.alertTriangle, color: T.danger, bg: T.dangerBg },
          { label: 'PM Completed', value: stats.pmDone, icon: I.fileText, color: T.teal, bg: T.tealBg },
        ].map((s, i) => (
          <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '0.9rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', transition: 'all 0.15s', animation: `fadeUp 0.3s ease-out ${i * 0.05}s both` }}>
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 500, color: T.textSecondary, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: T.text, lineHeight: 1 }}>{s.value}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW 1: Intake/Release + Body Status ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', overflow: 'hidden', ...S({ animationDelay: '0.15s' }) }}>
          <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.borderLight}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {I.chartBar} <h3 style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>Admissions & Releases</h3>
            </div>
            <Select value={timeRange} onChange={setTimeRange} options={[{ value: '3m', label: '3 months' }, { value: '6m', label: '6 months' }, { value: '12m', label: '12 months' }]} style={{ fontSize: '0.7rem', padding: '0.25rem 1.3rem 0.25rem 0.5rem' }} />
          </div>
          <div style={{ padding: '0.75rem 1rem', height: 240 }}><canvas ref={intakeRef} /></div>
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', overflow: 'hidden', ...S({ animationDelay: '0.2s' }) }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${T.borderLight}`, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {I.shield} <h3 style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>Body Status Distribution</h3>
          </div>
          <div style={{ padding: '0.75rem 1rem', height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 180 }}><canvas ref={statusRef} /></div>
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW 2: Postmortem Tracking + Stay Duration + Gender ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', overflow: 'hidden', ...S({ animationDelay: '0.25s' }) }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${T.borderLight}`, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {I.pulse} <h3 style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>Postmortem Tracking</h3>
          </div>
          <div style={{ padding: '0.75rem 1rem', height: 210 }}><canvas ref={pmRef} /></div>
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', overflow: 'hidden', ...S({ animationDelay: '0.3s' }) }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${T.borderLight}`, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {I.clock} <h3 style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>Length of Stay (Current)</h3>
          </div>
          <div style={{ padding: '0.75rem 1rem', height: 210 }}><canvas ref={stayRef} /></div>
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', overflow: 'hidden', ...S({ animationDelay: '0.35s' }) }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${T.borderLight}`, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {I.user} <h3 style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>Gender</h3>
          </div>
          <div style={{ padding: '0.75rem 1rem', height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 140 }}><canvas ref={genderRef} /></div>
          </div>
        </div>
      </div>

      {/* ── CALENDAR + RECORD LIST ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {/* Calendar */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', overflow: 'hidden', ...S({ animationDelay: '0.4s' }) }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${T.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>{I.calendar} <h3 style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>Calendar Navigator</h3></div>
            <button onClick={goToToday} style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', border: `1px solid ${T.primary}`, background: T.primaryBg, color: T.primary, cursor: 'pointer' }}>Today</button>
          </div>

          {/* Month Nav */}
          <div style={{ padding: '0.6rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={prevMonth} style={{ width: 30, height: 30, borderRadius: '6px', border: `1px solid ${T.border}`, background: T.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textSecondary, transition: 'all 0.15s' }}>{I.chevLeft}</button>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: T.text }}>{MONTH_NAMES[calMonth]} {calYear}</span>
            <button onClick={nextMonth} style={{ width: 30, height: 30, borderRadius: '6px', border: `1px solid ${T.border}`, background: T.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textSecondary, transition: 'all 0.15s' }}>{I.chevRight}</button>
          </div>

          {/* Day Names */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 0.75rem' }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.6rem', fontWeight: 600, color: T.textMuted, padding: '0.3rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 0.75rem 0.75rem', gap: '2px' }}>
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const d = new Date(calYear, calMonth, day);
              const dk = dateKey(d);
              const dayRecords = dateRecordMap[dk] || [];
              const today = isToday(day);
              const selected = isSelected(day);
              const hasRecords = dayRecords.length > 0;

              // Count unique statuses for dot colors
              const hasPM = dayRecords.some(r => r.postmortem_requested && !r.postmortem_completed);
              const hasReleased = dayRecords.some(r => r.body_status === 'Released');

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(d)}
                  style={{
                    aspectRatio: '1', borderRadius: '8px', border: 'none', cursor: hasRecords ? 'pointer' : 'default',
                    background: selected ? T.primary : today ? T.primaryBg : hasRecords ? T.surfaceHover : 'transparent',
                    color: selected ? '#fff' : today ? T.primary : hasRecords ? T.text : T.textFaint,
                    fontWeight: selected || today ? 700 : hasRecords ? 500 : 400,
                    fontSize: '0.78rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
                    transition: 'all 0.12s', position: 'relative',
                  }}
                >
                  {day}
                  {hasRecords && (
                    <div style={{ display: 'flex', gap: '2px', height: '4px' }}>
                      {dayRecords.length > 0 && <span style={{ width: 4, height: 4, borderRadius: '50%', background: selected ? 'rgba(255,255,255,0.8)' : T.primary }} />}
                      {hasPM && <span style={{ width: 4, height: 4, borderRadius: '50%', background: selected ? 'rgba(255,255,255,0.8)' : T.danger, animation: hasPM ? 'pulseDot 1.5s infinite' : 'none' }} />}
                      {hasReleased && <span style={{ width: 4, height: 4, borderRadius: '50%', background: selected ? 'rgba(255,255,255,0.8)' : T.success }} />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ padding: '0 1rem 0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { dot: T.primary, label: 'Admissions' },
              { dot: T.danger, label: 'PM Pending' },
              { dot: T.success, label: 'Released' },
            ].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.62rem', color: T.textMuted }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: l.dot, flexShrink: 0 }} />{l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Record List for Selected Date */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column', ...S({ animationDelay: '0.45s' }) }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${T.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {I.fileText}
              <h3 style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>
                {selectedDate ? formatDisplayDate(dateKey(selectedDate)) : 'Select a date'}
              </h3>
              {selectedDate && (
                <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '0.1rem 0.4rem', borderRadius: '4px', background: T.primaryBg, color: T.primary }}>
                  {selectedDateRecords.length} record{selectedDateRecords.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: T.textMuted, display: 'flex', pointerEvents: 'none' }}>{I.search}</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search name or ID..."
                  style={{ padding: '0.35rem 0.5rem 0.35rem 1.8rem', border: `1px solid ${T.border}`, borderRadius: '6px', fontSize: '0.72rem', color: T.textBody, background: T.surface, outline: 'none', width: '140px', fontFamily: 'inherit' }}
                />
              </div>
              <Select value={statusFilter} onChange={setStatusFilter} options={[
                { value: 'all', label: 'All Status' },
                { value: 'In Morgue', label: 'In Morgue' },
                { value: 'Released', label: 'Released' },
                { value: 'Pending Autopsy', label: 'Pending Autopsy' },
                { value: 'Transferred', label: 'Transferred' },
              ]} style={{ fontSize: '0.68rem', padding: '0.35rem 1.3rem 0.35rem 0.4rem' }} />
              <Select value={pmFilter} onChange={setPmFilter} options={[
                { value: 'all', label: 'All PM' },
                { value: 'pending', label: 'PM Pending' },
                { value: 'done', label: 'PM Done' },
                { value: 'not_requested', label: 'Not Requested' },
              ]} style={{ fontSize: '0.68rem', padding: '0.35rem 1.3rem 0.35rem 0.4rem' }} />
            </div>
          </div>

          {/* Records */}
          <div className="cal-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 200, maxHeight: 420 }}>
            {!selectedDate ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200, color: T.textMuted, gap: '0.5rem' }}>
                {I.calendar}
                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>Click a date on the calendar</span>
                <span style={{ fontSize: '0.7rem' }}>Days with admissions are highlighted</span>
              </div>
            ) : selectedDateRecords.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200, color: T.textMuted, gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>No records match your filters</span>
                <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); setPmFilter('all'); }} style={{ fontSize: '0.72rem', color: T.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>Clear filters</button>
              </div>
            ) : (
              <div>
                {selectedDateRecords.map((r, i) => {
                  const ss = getStatusStyle(r.body_status);
                  const ps = getPMStyle(r.postmortem_requested, r.postmortem_completed);
                  return (
                    <div
                      key={r.id}
                      className="record-row"
                      onClick={() => setSelectedRecord(r)}
                      style={{
                        padding: '0.7rem 1rem', borderBottom: `1px solid ${T.borderLight}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
                        borderLeft: `3px solid ${ss.color}`,
                      }}
                    >
                      {/* Avatar */}
                      <div style={{ width: 36, height: 36, borderRadius: '8px', background: ss.bg, color: ss.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0 }}>
                        {r.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.full_name}</span>
                          <span style={{ fontSize: '0.6rem', color: T.textMuted, whiteSpace: 'nowrap' }}>{r.gender[0]} · {r.age}y</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.62rem', color: T.textMuted, fontFamily: 'monospace' }}>{r.admission_number}</span>
                          <span style={{ fontSize: '0.55rem', color: T.textFaint }}>·</span>
                          <span style={{ fontSize: '0.62rem', color: T.textMuted }}>{r.time_received}</span>
                          <span style={{ fontSize: '0.55rem', color: T.textFaint }}>·</span>
                          <span style={{ fontSize: '0.62rem', color: T.textMuted }}>{r.received_from}</span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '0.12rem 0.45rem', borderRadius: '4px', background: ss.bg, color: ss.color, whiteSpace: 'nowrap' }}>
                          {r.body_status}
                        </span>
                        <span style={{ fontSize: '0.55rem', fontWeight: 600, padding: '0.1rem 0.4rem', borderRadius: '3px', background: ps.bg, color: ps.color, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                          {r.postmortem_requested && !r.postmortem_completed && <span style={{ width: 4, height: 4, borderRadius: '50%', background: T.danger, animation: 'pulseDot 1.5s infinite' }} />}
                          PM: {ps.label}
                        </span>
                      </div>

                      {/* View arrow */}
                      <div style={{ color: T.textFaint, flexShrink: 0, display: 'flex', alignItems: 'center' }}>{I.arrowRight}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* List footer summary */}
          {selectedDate && selectedDateRecords.length > 0 && (
            <div style={{ padding: '0.6rem 1rem', borderTop: `1px solid ${T.borderLight}`, background: T.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, fontSize: '0.68rem', color: T.textMuted }}>
              <span>{selectedDateRecords.length} record{selectedDateRecords.length !== 1 ? 's' : ''} · Click to view full details</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: T.success }} />{selectedDateRecords.filter(r => r.body_status === 'Released').length} Released</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: T.danger }} />{selectedDateRecords.filter(r => r.postmortem_requested && !r.postmortem_completed).length} PM Pending</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── QUICK REFERENCE TABLE: PM STATUS OVERVIEW ── */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', overflow: 'hidden', ...S({ animationDelay: '0.5s' }) }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${T.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {I.pulse} <h3 style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>Postmortem Status — All Records</h3>
          </div>
          <span style={{ fontSize: '0.65rem', color: T.textMuted }}>Showing records where postmortem was requested</span>
        </div>
        <div className="cal-scroll" style={{ maxHeight: 320, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
            <thead>
              <tr style={{ background: T.bg, position: 'sticky', top: 0, zIndex: 1 }}>
                {['Admission #', 'Name', 'Gender', 'Date Admitted', 'Body Status', 'PM Status', 'Report', ''].map((h, i) => (
                  <th key={i} style={{ padding: '0.55rem 1rem', textAlign: 'left', fontWeight: 600, color: T.textSecondary, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.filter(r => r.postmortem_requested).map(r => {
                const ss = getStatusStyle(r.body_status);
                const ps = getPMStyle(r.postmortem_requested, r.postmortem_completed);
                return (
                  <tr key={r.id} className="record-row" onClick={() => setSelectedRecord(r)} style={{ cursor: 'pointer', borderBottom: `1px solid ${T.borderLight}` }}>
                    <td style={{ padding: '0.5rem 1rem', fontFamily: 'monospace', fontSize: '0.7rem', color: T.textSecondary }}>{r.admission_number}</td>
                    <td style={{ padding: '0.5rem 1rem', fontWeight: 600, color: T.text }}>{r.full_name}</td>
                    <td style={{ padding: '0.5rem 1rem', color: T.textSecondary }}>{r.gender}</td>
                    <td style={{ padding: '0.5rem 1rem', color: T.textSecondary, whiteSpace: 'nowrap' }}>{formatDisplayDate(r.date_admitted)}</td>
                    <td style={{ padding: '0.5rem 1rem' }}><span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '0.12rem 0.45rem', borderRadius: '4px', background: ss.bg, color: ss.color, whiteSpace: 'nowrap' }}>{r.body_status}</span></td>
                    <td style={{ padding: '0.5rem 1rem' }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '0.12rem 0.45rem', borderRadius: '4px', background: ps.bg, color: ps.color, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        {!r.postmortem_completed && <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.danger, animation: 'pulseDot 1.5s infinite' }} />}
                        {ps.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem 1rem', color: r.postmortem_report ? T.success : T.textMuted, fontSize: '0.7rem', maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.postmortem_report || 'Pending'}</td>
                    <td style={{ padding: '0.5rem 1rem', color: T.textFaint }}>{I.eye}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DETAIL MODAL ── */}
      <DetailModal />
    </div>
  );
};

export default DeceasedAnalytics;