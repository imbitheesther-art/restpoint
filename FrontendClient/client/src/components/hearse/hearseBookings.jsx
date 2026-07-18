import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import './hearseBookings.css';
import { useSocket } from '../../utils/context/socketContext';
import env from '../../utils/config/env';
import ReusableCalendar from '../../utils/calender/calender';

const API_BASE_URL = `${env.FULL_API_URL}`;
const RESULTS_PER_PAGE = 10;

const STATUS_CONFIG = {
  pending:    { label: 'Pending',     progress: 10, color: '#d97706', bg: '#fef3c7', dotColor: '#d97706', pillColor: 'amber' },
  booked:     { label: 'Booked',      progress: 25, color: '#2563eb', bg: '#dbeafe', dotColor: '#2563eb', pillColor: 'blue' },
  in_transit: { label: 'In Transit',  progress: 60, color: '#db2777', bg: '#fce7f3', dotColor: '#db2777', pillColor: 'amber' },
  completed:  { label: 'Completed',   progress: 100,color: '#059669', bg: '#d1fae5', dotColor: '#059669', pillColor: 'green' },
  cancelled:  { label: 'Cancelled',   progress: 0,  color: '#dc2626', bg: '#fee2e2', dotColor: '#dc2626', pillColor: 'red' },
  postponed:  { label: 'Postponed',   progress: 15, color: '#d97706', bg: '#fef3c7', dotColor: '#d97706', pillColor: 'amber' },
  maintenance:{ label: 'Maintenance', progress: 0,  color: '#9333ea', bg: '#f3e8ff', dotColor: '#9333ea', pillColor: 'cyan' },
};
const STATUS_LIST = Object.keys(STATUS_CONFIG);

const formatDateStr = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'N/A';
const fmtDateOnly = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'N/A';
const genId = (id) => id ? (id.toString().startsWith('BK-')? id : `BK-${String(id).padStart(4,'0')}`) : 'N/A';

const getTenantSlug = () => localStorage.getItem('tenantSlug')||localStorage.getItem('tenant_slug')||'default';
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('authToken')||localStorage.getItem('accessToken')||sessionStorage.getItem('accessToken');
  const headers = {'x-tenant-slug':getTenantSlug()};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const Icons = {
  truck: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14M5 17a2 2 0 0 1-2-2V9l3-5h7l4 5v6a2 2 0 0 1-2 2M5 17a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2M9 17v2M15 17v2"/></svg>,
  car: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14M5 17a2 2 0 0 1-2-2V9l3-5h7l4 5v6a2 2 0 0 1-2 2M5 17a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2M9 17v2M15 17v2"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chevLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  chevFirst: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>,
  chevLast: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>,
  list: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  grid: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  refresh: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  moreV: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

const api = {
  getBookings: async () => {
    const r = await fetch(`${API_BASE_URL}/hearse-bookings?t=${Date.now()}`,{headers:getAuthHeaders()});
    if (!r.ok) throw new Error('Failed');
    return (await r.json()).bookings || [];
  },
  getBranches: async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/tenant/${getTenantSlug()}/branches`,{headers:getAuthHeaders()});
      return r.ok ? (await r.json()).data||[] : [];
    } catch { return []; }
  },
  getAllHearses: async () => {
    const r = await fetch(`${API_BASE_URL}/hearses`,{headers:getAuthHeaders()});
    return r.ok ? (await r.json()).hearses||[] : [];
  },
  updateStatus: async (id,status) => {
    const h=getAuthHeaders(); h['Content-Type']='application/json';
    const r = await fetch(`${API_BASE_URL}/hearse-bookings/${id}/status`,{method:'PUT',headers:h,body:JSON.stringify({status})});
    if (!r.ok) throw new Error('Failed');
    return r.json();
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  return (
    <span className={`hb-status ${status}`}><span className="hb-status-dot" />{cfg.label}</span>
  );
};

const StatCard = ({ label, value, sub, icon, iconBg, subColor }) => (
  <div style={{padding:'1rem',border:'1px solid var(--hborder-light)',borderRadius:'var(--hradius-sm)',background:'var(--hbg-card)'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
      <span style={{fontSize:'0.78rem',fontWeight:500,color:'var(--htext-secondary)'}}>{label}</span>
      <div style={{width:32,height:32,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',background:iconBg}}>{icon}</div>
    </div>
    <div style={{fontSize:'1.5rem',fontWeight:700,color:'var(--htext-primary)',lineHeight:1.2}}>{value}</div>
    <div style={{fontSize:'0.75rem',marginTop:'0.2rem',color:subColor || 'var(--htext-secondary)'}}>{sub}</div>
  </div>
);

const Toast = ({ message, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return <div className={`hb-toast ${type}`}>{message}</div>;
};

const DetailField = ({ label, children }) => (
  <div><div className="hb-detail-label">{label}</div><div className="hb-detail-value">{children}</div></div>
);

const HearseBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [allHearses, setAllHearses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('table');
  const [selectedDate, setSelectedDate] = useState(formatDateStr(new Date()));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [actionMenuId, setActionMenuId] = useState(null);
  const actionMenuRef = useRef(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [prefillDate, setPrefillDate] = useState('');
  const [showDashboard, setShowDashboard] = useState(true);
  const { socket } = useSocket();

  const [newForm, setNewForm] = useState({
    hearse_id:'', client_name:'', client_phone:'', destination:'', booking_date:'', branch_id:''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const showToast = useCallback((msg, type='success') => {
    setToasts(p => [...p, {id:Date.now(), message:msg, type}]);
  }, []);
  const removeToast = useCallback((id) => setToasts(p => p.filter(t => t.id!==id)), []);

  const getDateRange = useCallback((filter) => {
    const today = new Date(), ts = formatDateStr(today);
    switch (filter) {
      case 'today': return {start:ts, end:ts};
      case 'tomorrow': { const d=new Date(today); d.setDate(d.getDate()+1); const s=formatDateStr(d); return {start:s, end:s}; }
      case 'thisWeek': { const dow=today.getDay(), mon=new Date(today); mon.setDate(today.getDate()-((dow+6)%7)); const sun=new Date(mon); sun.setDate(mon.getDate()+6); return {start:formatDateStr(mon), end:formatDateStr(sun)}; }
      case 'nextWeek': { const dow=today.getDay(), nm=new Date(today); nm.setDate(today.getDate()+(7-((dow+6)%7))); const ns=new Date(nm); ns.setDate(nm.getDate()+6); return {start:formatDateStr(nm), end:formatDateStr(ns)}; }
      case 'thisMonth': return {start:formatDateStr(new Date(today.getFullYear(),today.getMonth(),1)), end:formatDateStr(new Date(today.getFullYear(),today.getMonth()+1,0))};
      case 'nextMonth': { const nm=today.getMonth()+1, y=nm>11?today.getFullYear()+1:today.getFullYear(), m=nm>11?0:nm; return {start:formatDateStr(new Date(y,m,1)), end:formatDateStr(new Date(y,m+1,0))}; }
      default: return {start:null, end:null};
    }
  }, []);

  const handleDateFilter = useCallback((f) => { setDateFilter(f); setCurrentPage(1); }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bks, brs, hrs] = await Promise.all([api.getBookings(), api.getBranches(), api.getAllHearses()]);
      setBookings(bks);
      setBranches(brs);
      setAllHearses(hrs);
    } catch (e) { showToast('Failed to load data', 'error'); }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_booking', (d) => { setBookings(p => [d.booking, ...p]); showToast('New booking!'); });
    socket.on('booking_status_updated', (d) => { setBookings(p => p.map(b => b.booking_id===d.booking_id ? {...b, status:d.status, ...d.booking} : b)); });
    socket.on('booking_postponed', () => loadData());
    return () => { socket.off('new_booking'); socket.off('booking_status_updated'); socket.off('booking_postponed'); };
  }, [socket, showToast, loadData]);

  const filtered = useMemo(() => {
    let result = [...bookings];
    if (filterStatus) result = result.filter(b => b.status === filterStatus);
    if (filterBranch) result = result.filter(b => String(b.branch_id) === String(filterBranch));
    if (dateFilter !== 'all') {
      const range = getDateRange(dateFilter);
      if (range.start && range.end) {
        result = result.filter(b => {
          const d = b.booking_date || b.estimated_departure_time || '';
          return d >= range.start && d <= range.end;
        });
      }
    }
    if (searchInput.trim()) {
      const q = searchInput.toLowerCase();
      result = result.filter(b =>
        (b.client_name||'').toLowerCase().includes(q) ||
        (b.booking_code||genId(b.booking_id)||'').toLowerCase().includes(q) ||
        (b.destination||'').toLowerCase().includes(q) ||
        (b.hearse_name||'').toLowerCase().includes(q)
      );
    }
    return result;
  }, [bookings, filterStatus, filterBranch, dateFilter, getDateRange, searchInput]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / RESULTS_PER_PAGE));
  const pageData = filtered.slice((currentPage-1)*RESULTS_PER_PAGE, currentPage*RESULTS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [filterStatus, filterBranch, dateFilter, searchInput]);
  useEffect(() => {
    const handler = (e) => { if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) setActionMenuId(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending' || b.status === 'booked').length;
    const inProgress = bookings.filter(b => b.status === 'in_transit').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const active = bookings.filter(b => !['completed','cancelled'].includes(b.status)).length;
    return { total, pending, inProgress, completed, active };
  }, [bookings]);

  const openDrawer = useCallback((b) => { setSelectedBooking(b); setDrawerOpen(true); setActionMenuId(null); }, []);
  const closeDrawer = useCallback(() => { setDrawerOpen(false); setSelectedBooking(null); }, []);

  const changeStatus = useCallback(async (id, status) => {
    try {
      await api.updateStatus(id, status);
      setBookings(p => p.map(b => b.booking_id===id ? {...b, status} : b));
      if (selectedBooking && (selectedBooking.booking_id===id || selectedBooking.id===id)) {
        setSelectedBooking(p => ({...p, status}));
      }
      showToast(`Status → ${STATUS_CONFIG[status].label}`);
      setActionMenuId(null);
    } catch { showToast('Failed to update', 'error'); }
  }, [selectedBooking, showToast]);

  const getNextStatuses = (status) => {
    switch (status) {
      case 'pending': return ['booked', 'cancelled'];
      case 'booked': return ['in_transit', 'cancelled'];
      case 'in_transit': return ['completed'];
      case 'completed': return [];
      case 'cancelled': return ['pending'];
      case 'postponed': return ['booked'];
      case 'maintenance': return ['booked'];
      default: return [];
    }
  };

  const openNewBooking = useCallback((date) => {
    const dateStr = date || '';
    setPrefillDate(dateStr);
    setNewForm({hearse_id:'',client_name:'',client_phone:'',destination:'',booking_date:dateStr,branch_id:''});
    setNewBookingOpen(true);
  }, []);
  const closeNewBooking = useCallback(() => { setNewBookingOpen(false); setPrefillDate(''); }, []);

  const handleNewBooking = useCallback(async (e) => {
    e.preventDefault();
    if (!newForm.hearse_id || !newForm.client_name || !newForm.destination || !newForm.booking_date) {
      showToast('Please fill all required fields', 'error'); return;
    }
    setSubmitLoading(true);
    try {
      const headers = getAuthHeaders();
      headers['Content-Type'] = 'application/json';
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      if (user?.branch_id) headers['x-branch-id'] = user.branch_id;
      if (user?.email) headers['x-user-email'] = user.email;
      headers['x-user-name'] = user?.full_name || user?.username || user?.name || 'System';

      await fetch(`${API_BASE_URL}/hearse-bookings`, {
        method: 'POST', headers, body: JSON.stringify({
          hearse_id: newForm.hearse_id,
          client_name: newForm.client_name,
          client_phone: newForm.client_phone || '',
          destination: newForm.destination,
          from_timestamp: newForm.booking_date,
          booked_by: user?.email || 'system',
          branch_id: newForm.branch_id || user?.branch_id || '',
          branch_code: user?.branch_code || ''
        })
      });
      showToast('Booking created!');
      closeNewBooking();
      await loadData();
    } catch (e) { showToast('Failed to create booking: '+e.message, 'error'); }
    setSubmitLoading(false);
  }, [newForm, showToast, closeNewBooking, loadData]);

  const calendarItems = useMemo(() => {
    return bookings.map(b => ({
      ...b,
      date: formatDateStr(b.booking_date || b.estimated_departure_time),
    }));
  }, [bookings]);

  const getStatusColor = useCallback((item) => {
    return STATUS_CONFIG[item.status]?.dotColor || '#a8a29e';
  }, []);

  const getIsUrgent = useCallback((item) => {
    return item.status === 'booked' || item.status === 'in_transit';
  }, []);

  const renderPagination = () => {
    const btns = [];
    const btnStyle = {width:32,height:32,display:'inline-flex',alignItems:'center',justifyContent:'center',border:'1px solid var(--hborder)',borderRadius:6,background:'var(--hbg-card)',color:'var(--htext-secondary)',fontSize:'0.8rem',fontWeight:500,cursor:'pointer',transition:'var(--htransition)'};
    const activeBtnStyle = {...btnStyle, background:'var(--haccent)',color:'white',borderColor:'var(--haccent)'};
    btns.push(
      <button key="first" style={btnStyle} disabled={currentPage===1} onClick={() => setCurrentPage(1)}>{Icons.chevFirst}</button>,
      <button key="prev" style={btnStyle} disabled={currentPage===1} onClick={() => setCurrentPage(p=>p-1)}>{Icons.chevLeft}</button>
    );
    for (let i=1; i<=totalPages; i++) {
      if (totalPages>7 && i>2 && i<totalPages-1 && Math.abs(i-currentPage)>1) {
        if (i===3 || i===totalPages-2) btns.push(<span key={`dots-${i}`} style={{padding:'0 0.25rem',color:'#a8a29e',fontSize:'0.8rem'}}>…</span>);
        continue;
      }
      btns.push(<button key={i} style={currentPage===i ? activeBtnStyle : btnStyle} onClick={() => setCurrentPage(i)}>{i}</button>);
    }
    btns.push(
      <button key="next" style={btnStyle} disabled={currentPage===totalPages} onClick={() => setCurrentPage(p=>p+1)}>{Icons.chevRight}</button>,
      <button key="last" style={btnStyle} disabled={currentPage===totalPages} onClick={() => setCurrentPage(totalPages)}>{Icons.chevLast}</button>
    );
    return btns;
  };

  if (loading) return (
    <div className="hb-loading">
      <div className="hb-loading-spinner" />
      <h5>Loading bookings...</h5>
    </div>
  );

  const branchOptions = branches.length > 0 ? branches : [];

  return (
    <div className="hb-layout" style={{display:'flex',minHeight:'100vh',background:'var(--hbg-surface)'}}>
      {/* ─── Main content ─── */}
      <div className="hb-main" style={{flex:1,minWidth:0,padding:'1.5rem',maxWidth:'100%'}}>
        {/* Header */}
        <div className="hb-header">
          <div className="hb-header-top">
            <div className="hb-header-info">
              <h1 className="hb-header-title">
                <span className="icon-wrap">{Icons.truck}</span>
                Hearse Bookings
              </h1>
              <div className="hb-header-meta">
                <span className="hb-live-badge online"><span className="hb-live-dot" /> Live</span>
                <span className="hb-active-count">{stats.active} active bookings</span>
              </div>
            </div>
            <div className="hb-header-actions">
              <button className="hb-btn-header ghost" onClick={loadData}>{Icons.refresh} <span>Refresh</span></button>
              <button className="hb-btn-header primary" onClick={() => openNewBooking('')}>{Icons.plus} <span>New Booking</span></button>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        {showDashboard && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'0.75rem',marginBottom:'1rem'}}>
            <StatCard label="Total Bookings" value={stats.total} sub="All time" icon={<span style={{color:'#266b52'}}>{Icons.truck}</span>} iconBg="#f0f7f4" />
            <StatCard label="Active" value={stats.active} sub="In progress" icon={<span style={{color:'#2563eb'}}>{Icons.car}</span>} iconBg="#dbeafe" subColor="#2563eb" />
            <StatCard label="Pending" value={stats.pending} sub="Needs attention" icon={<span style={{color:'#d97706'}}>{Icons.clock}</span>} iconBg="#fef3c7" subColor="#d97706" />
            <StatCard label="In Transit" value={stats.inProgress} sub="On the road" icon={<span style={{color:'#db2777'}}>{Icons.truck}</span>} iconBg="#fce7f3" subColor="#db2777" />
            <StatCard label="Completed" value={stats.completed} sub="Delivered" icon={<span style={{color:'#059669'}}>{Icons.check}</span>} iconBg="#d1fae5" subColor="#059669" />
          </div>
        )}

        {/* Filter Bar */}
        <div className="hb-filter-bar">
          <div className="hb-filter-row">
            <div className="hb-filter-left">
              <div className="hb-avail-check">
                <input className="hb-input-sm" type="search" placeholder="Search client, ID, destination..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              </div>
              <select className="hb-input-sm" value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                <option value="">All Branches</option>
                {branchOptions.map((b) => (<option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>))}
                {branchOptions.length === 0 && <option value="">No branches</option>}
              </select>
              <div className="hb-view-toggle">
                <button className={`hb-view-btn ${viewMode==='table' ? 'active' : ''}`} onClick={() => setViewMode('table')} title="Table">{Icons.list}</button>
                <button className={`hb-view-btn ${viewMode==='calendar' ? 'active' : ''}`} onClick={() => setViewMode('calendar')} title="Calendar">{Icons.grid}</button>
              </div>
            </div>
            <div className="hb-avail-badges">
              <span className="hb-avail-badge green">{stats.active} Active</span>
              <span className="hb-avail-badge red">{stats.pending} Pending</span>
            </div>
          </div>

          {/* Status pills */}
          <div className="hb-filter-pills">
            {['', ...STATUS_LIST].map((tab) => {
              const cfg = tab === '' ? null : STATUS_CONFIG[tab];
              const color = tab === '' ? 'navy' : (tab === 'pending' || tab === 'booked' ? 'blue' : tab === 'in_transit' ? 'amber' : tab === 'completed' ? 'green' : tab === 'cancelled' ? 'red' : 'cyan');
              return (
                <button key={tab} className={`hb-pill ${filterStatus===tab ? 'active' : ''}`} data-color={color} onClick={() => setFilterStatus(tab)}>
                  {tab === '' ? 'All' : cfg?.label || tab}
                </button>
              );
            })}
          </div>

          {/* Date filter pills */}
          <div className="hb-filter-pills" style={{marginTop:'0.5rem'}}>
            <span style={{fontSize:'0.72rem',color:'var(--htext-muted)',fontWeight:600,marginRight:'0.25rem'}}>DATE:</span>
            {['all','today','tomorrow','thisWeek','nextWeek','thisMonth','nextMonth'].map((f) => (
              <button key={f} className={`hb-pill ${dateFilter===f ? 'active' : ''}`} data-color={dateFilter===f ? 'blue' : 'navy'} onClick={() => handleDateFilter(f)}>
                {f==='all'?'All':f==='today'?'Today':f==='tomorrow'?'Tomorrow':f==='thisWeek'?'This Week':f==='nextWeek'?'Next Week':f==='thisMonth'?'This Month':'Next Month'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Table Card */}
        <div className="hb-table-card">
          {viewMode === 'table' && (
            <>
              <div style={{overflowX:'auto'}}>
                <table className="hb-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Client</th>
                      <th>Destination</th>
                      <th>Hearse</th>
                      <th>Branch</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th style={{width:40}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((b) => (
                      <tr key={b.booking_id||b.id} onClick={() => openDrawer(b)}>
                        <td><span className="booking-id">{b.booking_code || genId(b.booking_id)}</span></td>
                        <td>
                          <div className="client-name">{b.client_name}</div>
                          {b.client_phone && <div style={{fontSize:'0.72rem',color:'var(--htext-muted)',marginTop:'0.15rem'}}>{b.client_phone}</div>}
                        </td>
                        <td>
                          <div className="dest-text" title={b.destination||''}>{b.destination||'N/A'}</div>
                          {b.end_date && <div style={{fontSize:'0.72rem',color:'#9333ea',marginTop:'0.15rem'}}>Multi-day → {fmtDateOnly(b.end_date)}</div>}
                        </td>
                        <td>
                          <span className="hearse-plate">{b.plate_number||b.number_plate||'N/A'}</span>
                          <div className="hearse-sub">{b.hearse_name||''}</div>
                        </td>
                        <td><span className="hb-branch-tag">{b.branch_name||b.branch_code||'—'}</span></td>
                        <td>
                          <div>{fmtDateOnly(b.booking_date||b.estimated_departure_time)}</div>
                          <div className="booking-date-sub">{b.delivery_time||''}</div>
                        </td>
                        <td><span className={`hb-status ${b.status}`}><span className="hb-status-dot" />{STATUS_CONFIG[b.status]?.label||b.status}</span></td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div style={{position:'relative'}} ref={actionMenuId===(b.booking_id||b.id) ? actionMenuRef : null}>
                            <button className="hb-action-btn" onClick={() => setActionMenuId(actionMenuId===(b.booking_id||b.id) ? null : (b.booking_id||b.id))}>{Icons.moreV}</button>
                            {actionMenuId===(b.booking_id||b.id) && (
                              <div className="hb-action-menu">
                                <div className="dropdown-item" style={{fontSize:'0.7rem',fontWeight:700,color:'var(--htext-muted)',textTransform:'uppercase',letterSpacing:'0.04em'}}>Change Status</div>
                                {getNextStatuses(b.status).map((s) => (
                                  <button key={s} className="dropdown-item" onClick={() => changeStatus(b.booking_id||b.id, s)}>
                                    <span className="hb-status-dot" style={{background:STATUS_CONFIG[s]?.dotColor||'#a8a29e',width:6,height:6,borderRadius:'50%',flexShrink:0}} />
                                    {STATUS_CONFIG[s]?.label||s}
                                  </button>
                                ))}
                                <div className="dropdown-divider" />
                                <button className="dropdown-item" onClick={() => openDrawer(b)}>View Details</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pageData.length === 0 && (
                <div className="hb-empty">
                  <div className="hb-empty-icon">{Icons.search}</div>
                  <h5>No bookings found</h5>
                  <p>Try adjusting your search or filters</p>
                </div>
              )}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem 1.25rem',borderTop:'1px solid var(--hborder-light)',flexWrap:'wrap',gap:'0.5rem'}}>
                <span style={{fontSize:'0.8rem',color:'var(--htext-muted)'}}>
                  {filtered.length > 0 ? `${(currentPage-1)*RESULTS_PER_PAGE+1}–${Math.min(currentPage*RESULTS_PER_PAGE, filtered.length)} of ${filtered.length} bookings` : '0 bookings'}
                </span>
                <div style={{display:'flex',gap:'0.2rem',alignItems:'center'}}>{renderPagination()}</div>
              </div>
            </>
          )}

          {/* ─── CALENDAR VIEW ─── */}
          {viewMode === 'calendar' && (
            <div className="hb-calendar-wrapper">
              <ReusableCalendar
                items={calendarItems}
                dateKey="date"
                idKey="booking_id"
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onItemClick={openDrawer}
                onAddForDate={(dateStr) => openNewBooking(dateStr)}
                showAddButton={true}
                addButtonText="Book"
                getStatusColor={getStatusColor}
                getIsUrgent={getIsUrgent}
                getItemTitle={(item) => item.client_name}
                getItemSubtitle={(item) => item.hearse_name || item.plate_number || ''}
                getItemMeta={(item) => item.destination || ''}
                getItemStatus={(item) => <StatusBadge status={item.status} />}
                accentColor="#2563eb"
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── Detail Drawer ─── */}
      <div className={`fb-drawer-overlay ${drawerOpen ? 'fb-drawer-overlay-open' : ''}`} onClick={closeDrawer} />
      <div className={`fb-drawer ${drawerOpen ? 'fb-drawer-open' : ''}`}>
        {selectedBooking && (
          <>
            <div className="fb-drawer-header">
              <div>
                <h2 className="fb-drawer-title">{selectedBooking.booking_code || genId(selectedBooking.booking_id)}</h2>
                <p className="fb-drawer-subtitle"><StatusBadge status={selectedBooking.status} /></p>
              </div>
              <button className="fb-icon-btn" onClick={closeDrawer}>{Icons.x}</button>
            </div>
            <div className="fb-drawer-body">
              {/* Vehicle + Client card */}
              <div style={{display:'flex',gap:'1rem',marginBottom:'1.5rem',padding:'1rem',background:'#fafaf9',borderRadius:'0.5rem',alignItems:'center'}}>
                <div style={{width:48,height:48,borderRadius:'0.5rem',background:'#dbeafe',display:'flex',alignItems:'center',justifyContent:'center',color:'#2563eb',flexShrink:0}}>
                  {Icons.truck}
                </div>
                <div>
                  <div style={{fontSize:'1rem',fontWeight:600,marginBottom:'0.15rem'}}>{selectedBooking.hearse_name || 'Vehicle'}</div>
                  <div style={{fontSize:'0.82rem',color:'#78716c'}}>
                    <span className="hb-plate-badge" style={{fontSize:'0.75rem'}}>{selectedBooking.plate_number||selectedBooking.number_plate||'N/A'}</span>
                    {selectedBooking.model && <span style={{marginLeft:'0.5rem'}}>{selectedBooking.model}</span>}
                  </div>
                  <div style={{fontSize:'0.9rem',fontWeight:700,color:'#2563eb',marginTop:'0.35rem'}}>{selectedBooking.client_name}</div>
                </div>
              </div>

              {/* Details grid */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem',marginBottom:'1.5rem'}}>
                <DetailField label="Client">{selectedBooking.client_name}</DetailField>
                <DetailField label="Phone">{selectedBooking.client_phone || '—'}</DetailField>
                <DetailField label="Destination">{selectedBooking.destination || '—'}</DetailField>
                <DetailField label="Branch">{selectedBooking.branch_name || selectedBooking.branch_code || '—'}</DetailField>
                <DetailField label="Date">{fmtDateOnly(selectedBooking.booking_date||selectedBooking.estimated_departure_time)}</DetailField>
                <DetailField label="Status"><StatusBadge status={selectedBooking.status} /></DetailField>
                {selectedBooking.end_date && <DetailField label="End Date">{fmtDateOnly(selectedBooking.end_date)}</DetailField>}
                <DetailField label="Booked By">{selectedBooking.booked_by_name||selectedBooking.booked_by||'—'}</DetailField>
                <DetailField label="Created">{fmtDate(selectedBooking.created_at)}</DetailField>
                {selectedBooking.updated_at && <DetailField label="Updated">{fmtDate(selectedBooking.updated_at)}</DetailField>}
              </div>

              {/* Quick Actions */}
              <div style={{borderTop:'1px solid #e7e5e4',paddingTop:'1.25rem'}}>
                <div className="hb-detail-label" style={{marginBottom:'0.5rem'}}>Quick Actions</div>
                <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                  {getNextStatuses(selectedBooking.status).map((s) => (
                    <button key={s} className="fb-btn fb-btn-outline" style={{fontSize:'0.8rem',padding:'0.35rem 0.75rem'}} onClick={() => changeStatus(selectedBooking.booking_id||selectedBooking.id, s)}>
                      Move to {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ─── New Booking Drawer ─── */}
      <div className={`fb-drawer-overlay ${newBookingOpen ? 'fb-drawer-overlay-open' : ''}`} onClick={closeNewBooking} />
      <div className={`fb-drawer fb-drawer-wide ${newBookingOpen ? 'fb-drawer-open' : ''}`}>
        <div className="fb-drawer-header" style={{background:'#78350f'}}>
          <div>
            <h2 className="fb-drawer-title" style={{color:'white'}}>New Hearse Booking</h2>
            <p className="fb-drawer-subtitle" style={{color:'rgba(255,255,255,0.7)'}}>Book a hearse for a funeral service trip</p>
          </div>
          <button className="fb-icon-btn" onClick={closeNewBooking} style={{color:'white'}}>{Icons.x}</button>
        </div>
        <div className="fb-drawer-body">
          <form onSubmit={handleNewBooking} className="fb-form">
            <div className="fb-form-grid-2">
              <div className="fb-form-field">
                <label className="hb-form-label">Client Name *</label>
                <input className="hb-form-control" placeholder="Full name" value={newForm.client_name} onChange={e => setNewForm(p=>({...p,client_name:e.target.value}))} required />
              </div>
              <div className="fb-form-field">
                <label className="hb-form-label">Phone</label>
                <input className="hb-form-control" placeholder="0712 345 678" value={newForm.client_phone} onChange={e => setNewForm(p=>({...p,client_phone:e.target.value}))} />
              </div>
            </div>
            <div className="fb-form-grid-2">
              <div className="fb-form-field">
                <label className="hb-form-label">Select Hearse *</label>
                <select className="hb-form-control form-select" value={newForm.hearse_id} onChange={e => setNewForm(p=>({...p,hearse_id:e.target.value}))} required>
                  <option value="">— Select —</option>
                  {allHearses.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.hearse_name || 'N/A'} — {h.plate_number||h.number_plate} {h.branch_name ? `(${h.branch_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fb-form-field">
                <label className="hb-form-label">Booking Date *</label>
                <input className="hb-form-control" type="date" value={newForm.booking_date} onChange={e => setNewForm(p=>({...p,booking_date:e.target.value}))} required />
              </div>
            </div>
            <div className="fb-form-field">
              <label className="hb-form-label">Destination (From → To) *</label>
              <input className="hb-form-control" placeholder="e.g., 123 Main St to 456 Elm St" value={newForm.destination} onChange={e => setNewForm(p=>({...p,destination:e.target.value}))} required />
            </div>
            <div className="fb-form-field">
              <label className="hb-form-label">Branch</label>
              <select className="hb-form-control form-select" value={newForm.branch_id} onChange={e => setNewForm(p=>({...p,branch_id:e.target.value}))}>
                <option value="">— Default —</option>
                {branchOptions.map(b => (
                  <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                ))}
              </select>
            </div>
            <div className="fb-form-actions">
              <button type="button" className="fb-btn fb-btn-outline" onClick={closeNewBooking}>Cancel</button>
              <button type="submit" className="fb-btn fb-btn-primary" disabled={submitLoading}>
                {submitLoading ? 'Creating...' : 'Create Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ─── Toasts ─── */}
      <div className="hb-toast-container">
        {toasts.map((t) => <Toast key={t.id} message={t.message} type={t.type} onDone={() => removeToast(t.id)} />)}
      </div>
    </div>
  );
};

export default HearseBookings;