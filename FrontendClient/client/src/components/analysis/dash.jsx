import React, { useState, useMemo } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler } from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  TrendingUp, Users, Truck, DollarSign, AlertTriangle, Clock, CheckCircle, Activity,
  FlaskConical, Package, MapPin, RefreshCw, ChevronDown, ShieldAlert, Eye, ArrowUp,
  ArrowDown, X, Zap, UserCheck, ClipboardCheck, Car, Stethoscope, Hammer, Box,
  CalendarDays, BarChart3, GitCompareArrows, Trophy, Star, FileText, CircleDot
} from "lucide-react";
import ReusableCalendar from "../../components/ReusableCalendar/ReusableCalendar";
import "./ComprehensiveDashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler);

/* ═══════════════════════════════════════════════════════════════
   DYNAMIC DATA (Relative to today for realistic calendar)
   ═══════════════════════════════════════════════════════════════ */
const D = () => {
  const t = new Date();
  const o = (d) => { const dt = new Date(t); dt.setDate(dt.getDate() + d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; };
  const names = ['James Ochieng','Mary Wanjiku','Susan Auma','Peter Mwangi','Grace Akinyi','Daniel Kiptoo','John Kamau','Fatuma Hassan','Samuel Otieno','Agnes Wambui','David Kiprop','Lucy Njeri','Joseph Mbugua','Sarah Achieng','Rose Nyambura','Charles Karanja','Elizabeth Muthoni','Stephen Kibet','Priscilla Jebet','Daniel Gikonyo','William Mutua','Margaret Wanjiru','Francis Maina','Michael Odhiambo','Hannah Chebet','Thomas Njoroge','Dorcas Moraa','Vincent Ochieng','Alice Njoki','Rebecca Chebet'];
  const branches = ['Nairobi Main','Mombasa Branch','Kisumu Branch','Nakuru Branch'];
  const statuses = ['active','completed','in-transit','pending','scheduled','autopsy-pending','released'];
  const drivers = ['Kamau J.','Otieno R.','Muthoni L.','Wanjiru K.','Cheruiyot P.'];
  const pathologists = ['Dr. Akinyi','Dr. Oduor','Dr. Kiptoo','Dr. Wambui'];

  const mkEvt = (id, dOff, type, deceased, age, branch, time, status, kin, kinPhone, cause, driver, vehicle, pathologist) => ({
    id, date: o(dOff), type, deceased, age, branch,
    time, status,
    nextOfKin: kin || `${deceased.split(' ')[1]} Family`,
    kinPhone: kinPhone || `+254 7${Math.floor(Math.random()*90+10)} ${Math.floor(Math.random()*900+100)}`,
    causeOfDeath: cause || '',
    driver: driver || '', vehicle: vehicle || '',
    pathologist: pathologist || '',
    admissionNumber: `ADM-${2400 + id}`,
    caseType: type === 'autopsy' ? 'Coroner Case' : type === 'dispatch' ? 'Body Transfer' : type === 'release' ? 'Release Order' : 'Standard Admission',
    urgent: Math.random() < 0.15,
  });

  const calendarEvents = [
    mkEvt(1, -12, 'admission', 'James Ochieng', 67, 'Nairobi Main', '09:00', 'completed', 'Mary Ochieng', '+254 722 3344', 'Natural causes'),
    mkEvt(2, -10, 'autopsy', 'Mary Wanjiku', 45, 'Nairobi Main', '14:00', 'completed', 'Peter Wanjiku', '+254 733 4455', 'Suspected cardiac arrest', '', '', 'Dr. Akinyi'),
    mkEvt(3, -8, 'dispatch', 'Susan Auma', 81, 'Mombasa Branch', '10:00', 'completed', 'John Auma', '+254 744 5566', '', 'Kamau J.', 'KBA 345X', ''),
    mkEvt(4, -6, 'release', 'Peter Mwangi', 72, 'Nairobi Main', '11:00', 'completed', 'Grace Mwangi', '+254 755 6677', '', '', '', ''),
    mkEvt(5, -4, 'admission', 'Grace Akinyi', 58, 'Kisumu Branch', '08:15', 'completed', 'Joseph Akinyi', '+254 766 7788', 'Respiratory failure'),
    mkEvt(6, -2, 'autopsy', 'Daniel Kiptoo', 39, 'Nakuru Branch', '09:30', 'completed', 'Jane Kiptoo', '+254 777 8899', 'Road traffic accident', '', '', 'Dr. Oduor'),
    mkEvt(7, -1, 'dispatch', 'John Kamau', 81, 'Nairobi Main', '07:30', 'completed', 'Lucy Kamau', '+254 788 9900', '', 'Otieno R.', 'KBB 678Y', ''),
    mkEvt(8, 0, 'admission', 'Fatuma Hassan', 39, 'Mombasa Branch', '16:00', 'active', 'Hassan Ali', '+254 799 0011', 'Pregnancy related', '', '', ''),
    mkEvt(9, 0, 'dispatch', 'Samuel Otieno', 55, 'Kisumu Branch', '11:30', 'in-transit', 'Rose Otieno', '+254 700 1122', '', 'Muthoni L.', 'KSC 234Z', ''),
    mkEvt(10, 0, 'autopsy', 'Agnes Wambui', 63, 'Nairobi Main', '14:00', 'active', 'David Wambui', '+254 711 2233', 'Chronic illness', '', '', 'Dr. Kiptoo'),
    mkEvt(11, 0, 'release', 'David Kiprop', 48, 'Nakuru Branch', '10:00', 'pending', 'Esther Kiprop', '+254 722 3344', '', '', '', ''),
    mkEvt(12, 1, 'admission', 'Lucy Njeri', 76, 'Nairobi Main', '08:00', 'pending', 'Samuel Njeri', '+254 733 4455', 'Old age', '', '', ''),
    mkEvt(13, 1, 'autopsy', 'Joseph Mbugua', 84, 'Mombasa Branch', '10:00', 'scheduled', 'Ann Mbugua', '+254 744 5566', 'Pending histology', '', '', 'Dr. Wambui'),
    mkEvt(14, 1, 'dispatch', 'Sarah Achieng', 51, 'Kisumu Branch', '15:00', 'pending', 'Thomas Achieng', '+254 755 6677', '', 'Kamau J.', 'KBA 345X', ''),
    mkEvt(15, 2, 'admission', 'Rose Nyambura', 69, 'Nakuru Branch', '09:00', 'pending', 'Peter Nyambura', '+254 766 7788', 'Cancer', '', '', ''),
    mkEvt(16, 2, 'release', 'Charles Karanja', 73, 'Nairobi Main', '12:00', 'pending', 'Mary Karanja', '+254 777 8899', '', '', '', ''),
    mkEvt(17, 3, 'autopsy', 'Elizabeth Muthoni', 55, 'Mombasa Branch', '08:30', 'scheduled', 'Charles Muthoni', '+254 788 9900', 'Diabetes complications', '', '', 'Dr. Oduor'),
    mkEvt(18, 3, 'dispatch', 'Stephen Kibet', 66, 'Nakuru Branch', '13:00', 'pending', 'Agnes Kibet', '+254 799 0011', '', 'Wanjiru K.', 'KBB 678Y', ''),
    mkEvt(19, 4, 'admission', 'Priscilla Jebet', 44, 'Nairobi Main', '07:45', 'pending', 'Michael Jebet', '+254 700 1122', 'Maternal', '', '', ''),
    mkEvt(20, 4, 'release', 'Daniel Gikonyo', 47, 'Kisumu Branch', '14:30', 'pending', 'Naomi Gikonyo', '+254 711 2233', '', '', '', ''),
    mkEvt(21, 5, 'admission', 'Michael Odhiambo', 42, 'Mombasa Branch', '09:00', 'pending', 'Dorcas Odhiambo', '+254 722 3344', 'Hypertension', '', '', ''),
    mkEvt(22, 5, 'dispatch', 'William Mutua', 78, 'Nakuru Branch', '10:00', 'pending', 'Jane Mutua', '+254 733 4455', '', 'Otieno R.', 'KSC 234Z', ''),
    mkEvt(23, 6, 'autopsy', 'Margaret Wanjiru', 82, 'Nairobi Main', '13:00', 'pending', 'Francis Wanjiru', '+254 744 5566', 'Stroke', '', '', 'Dr. Akinyi'),
    mkEvt(24, 7, 'admission', 'Francis Maina', 71, 'Mombasa Branch', '08:00', 'pending', 'Lucy Maina', '+254 755 6677', 'Kidney failure', '', '', ''),
    mkEvt(25, 8, 'release', 'Hannah Chebet', 59, 'Kisumu Branch', '11:00', 'pending', 'Samuel Chebet', '+254 766 7788', '', '', '', ''),
    mkEvt(26, 9, 'admission', 'Alice Njoki', 53, 'Nakuru Branch', '09:30', 'pending', 'Rebecca Njoki', '+254 777 8899', 'Liver cirrhosis', '', '', ''),
    mkEvt(27, 10, 'dispatch', 'Rebecca Chebet', 61, 'Nairobi Main', '07:00', 'pending', 'Thomas Chebet', '+254 788 9900', '', 'Muthoni L.', 'KBA 345X', ''),
    mkEvt(28, 12, 'admission', 'Thomas Njoroge', 77, 'Mombasa Branch', '10:00', 'pending', 'Dorcas Njoroge', '+254 799 0011', 'Pneumonia', '', '', ''),
    mkEvt(29, 14, 'autopsy', 'Dorcas Moraa', 48, 'Kisumu Branch', '09:00', 'pending', 'Vincent Moraa', '+254 700 1122', 'TB complications', '', '', 'Dr. Kiptoo'),
    mkEvt(30, 15, 'release', 'Vincent Ochieng', 70, 'Nakuru Branch', '14:00', 'pending', 'Alice Ochieng', '+254 711 2233', '', '', '', ''),
    mkEvt(31, 18, 'admission', 'William Mutua', 74, 'Nairobi Main', '08:30', 'pending', 'Sarah Mutua', '+254 722 3344', 'Heart failure', '', '', ''),
    mkEvt(32, 22, 'dispatch', 'Priscilla Jebet', 56, 'Mombasa Branch', '11:00', 'pending', 'Michael Jebet', '+254 733 4455', '', 'Kamau J.', 'KBB 678Y', ''),
    mkEvt(33, 25, 'admission', 'Hannah Chebet', 65, 'Kisumu Branch', '09:00', 'pending', 'Grace Chebet', '+254 744 5566', 'Alzheimer\'s', '', '', ''),
    mkEvt(34, 28, 'release', 'Francis Maina', 71, 'Nakuru Branch', '12:00', 'pending', 'Lucy Maina', '+254 755 6677', '', '', '', ''),
    mkEvt(35, 32, 'admission', 'Michael Odhiambo', 80, 'Nairobi Main', '07:30', 'pending', 'Priscilla Odhiambo', '+254 766 7788', 'COPD', '', '', ''),
    mkEvt(36, 38, 'dispatch', 'Alice Njoki', 52, 'Mombasa Branch', '08:00', 'pending', 'Rebecca Njoki', '+254 777 8899', '', 'Otieno R.', 'KSC 234Z', ''),
    mkEvt(37, 42, 'admission', 'Thomas Njoroge', 60, 'Kisumu Branch', '09:00', 'pending', 'Dorcas Njoroge', '+254 788 9900', 'Dementia', '', '', ''),
    mkEvt(38, 45, 'release', 'Dorcas Moraa', 45, 'Nakuru Branch', '14:30', 'pending', 'Vincent Moraa', '+254 799 0011', '', '', '', ''),
    mkEvt(39, 48, 'admission', 'Vincent Ochieng', 68, 'Nairobi Main', '08:00', 'pending', 'Alice Ochieng', '+254 700 1122', 'Pancreatic cancer', '', '', ''),
    mkEvt(40, 55, 'dispatch', 'Rebecca Chebet', 58, 'Mombasa Branch', '10:00', 'pending', 'Thomas Chebet', '+254 711 2233', '', 'Muthoni L.', 'KBA 345X', ''),
  ];

  const inventory = {
    coffins: [
      { id:1, name:'Standard Pine', stock:12, min:5, price:15000, sold:45, supplier:'Nairobi Woodworks', lastRestock:'2025-06-10' },
      { id:2, name:'Premium Oak', stock:8, min:3, price:35000, sold:28, supplier:'Heritage Caskets', lastRestock:'2025-06-08' },
      { id:3, name:'Eco Bamboo', stock:2, min:4, price:12000, sold:15, supplier:'GreenLife Ltd', lastRestock:'2025-06-01' },
      { id:4, name:'Mahogany Elite', stock:5, min:2, price:55000, sold:12, supplier:'Heritage Caskets', lastRestock:'2025-06-12' },
      { id:5, name:'Children Casket', stock:1, min:3, price:10000, sold:8, supplier:'Nairobi Woodworks', lastRestock:'2025-05-28' },
      { id:6, name:'Metal Casket', stock:6, min:2, price:28000, sold:18, supplier:'SteelCraft Co.', lastRestock:'2025-06-11' },
      { id:7, name:'Willow Casket', stock:3, min:2, price:32000, sold:14, supplier:'Heritage Caskets', lastRestock:'2025-06-05' },
    ],
    chemicals: [
      { id:1, name:'Formalin 10L', stock:18, min:5, unit:'Ltrs', used:12, expiry:'2026-03-15', supplier:'MedChem Kenya' },
      { id:2, name:'Disinfectant 5L', stock:24, min:8, unit:'Ltrs', used:18, expiry:'2026-06-20', supplier:'MedChem Kenya' },
      { id:3, name:'Embalming Fluid', stock:3, min:4, unit:'Ltrs', used:9, expiry:'2026-01-10', supplier:'BioPreserve Ltd' },
      id:4, name:'Latex Gloves (Box)', stock:30, min:10, unit:'Boxes', used:22, expiry:'2027-01-01', supplier:'SafeGuard Supply' },
      { id:5, name:'Body Bags (Pkg)', stock:4, min:8, unit:'Pcs', used:15, expiry:'N/A', supplier:'SafeGuard Supply' },
      { id:6, name:'Sanitizer 5L', stock:15, min:6, unit:'Ltrs', used:10, expiry:'2026-08-30', supplier:'MedChem Kenya' },
      id:7, name:'Cotton Wool (Roll)', stock:8, min:4, unit:'Rolls', used:6, expiry:'N/A', supplier:'SafeGuard Supply' },
      { id:8, name:'Surgical Masks (Box)', stock:12, min:5, unit:'Boxes', used:8, expiry:'2026-12-15', supplier:'SafeGuard Supply' },
    ],
  };

  const fleet = [
    { id:'H-001', plate:'KBA 345X', model:'Toyota Hiace', driver:'Kamau J.', status:'available', branch:'Nairobi Main', lastService:'2025-06-10', nextService:'2025-07-10', totalTrips:142 },
    { id:'H-002', plate:'KBB 678Y', model:'Toyota Hiace', driver:'Otieno R.', status:'booked', branch:'Mombasa Branch', lastService:'2025-06-05', nextService:'2025-07-05', totalTrips:98 },
    { id:'H-003', plate:'KSC 234Z', model:'Isuzu NQR', driver:'Muthoni L.', status:'booked', branch:'Kisumu Branch', lastService:'2025-06-08', nextService:'2025-07-08', totalTrips:115 },
    { id:'H-004', plate:'KNC 567A', model:'Toyota Hiace', driver:'Wanjiru K.', status:'maintenance', branch:'Nakuru Branch', lastService:'2025-06-12', nextService:'2025-06-19', totalTrips:87 },
    { id:'H-005', plate:'KNR 890B', model:'Mitsubishi Rosa', driver:'Cheruiyot P.', status:'available', branch:'Nairobi Main', lastService:'2025-06-11', nextService:'2025-07-11', totalTrips:63 },
    { id:'H-006', plate:'KMU 123C', model:'Toyota Hiace', driver:'Kamau J.', status:'available', branch:'Mombasa Branch', lastService:'2025-06-09', nextService:'2025-07-09', totalTrips:134 },
    { id:'H-007', plate:'KIS 456D', model:'Isuzu NQR', driver:'Otieno R.', status:'booked', branch:'Kisumu Branch', lastService:'2025-06-07', nextService:'2025-07-07', totalTrips:102 },
    id:8, plate:'KNK 789E', model:'Toyota Hiace', driver:'Muthoni L.', status:'available', branch:'Nakuru Branch', lastService:'2025-06-06', nextService:'2025-07-06', totalTrips:91 },
  ];

  const branchData = branches.map((b, i) => {
    const bEvents = calendarEvents.filter(e => e.branch === b);
    const bFleet = fleet.filter(f => f.branch === b);
    const avail = bFleet.filter(f => f.status === 'available').length;
    const activeCases = bEvents.filter(e => ['active','in-transit','autopsy-pending'].includes(e.status)).length;
    const monthAdmissions = bEvents.filter(e => e.type === 'admission').length;
    const monthReleases = bEvents.filter(e => e.type === 'release').length;
    const monthDispatches = bEvents.filter(e => e.type === 'dispatch').length;
    const monthAutopsies = bEvents.filter(e => e.type === 'autopsy').length;
    const revenue = Math.floor((monthAdmissions * 25 + monthDispatches * 15 + monthAutopsies * 35) * 1000);
    return { name: b, id: i+1, activeCases, monthAdmissions, monthDispatches, monthAutopsies, monthReleases, revenue, fleetAvail: avail, fleetTotal: bFleet.length, avgRevenue: 0 };
  });
  const totalRev = branchData.reduce((s,b) => s + b.revenue, 0);
  branchData.forEach(b => b.avgRevenue = Math.round(totalRev / branchData.length));

  return { calendarEvents, inventory, fleet, branches, branchData };
};

const DATA = D();

/* ═══════════════════════════════════════════════════════════════
   CHART CONFIG
   ═══════════════════════════════════════════════════════════════ */
const C = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#14b8a6'];
const baseOpts = {
  responsive:true, maintainAspectRatio:false,
  plugins:{ legend:{ position:'bottom', labels:{ usePointStyle:true, pointStyle:'circle', padding:16, font:{size:11,weight:'500'} } },
    tooltip:{ backgroundColor:'rgba(15,23,42,0.92)', titleColor:'#f1f5f9', bodyColor:'#cbd5e1', cornerRadius:8, padding:10, bodyFont:{size:12} } },
  scales:{ x:{ grid:{display:false}, ticks:{font:{size:10}}, border:{display:false} }, y:{ grid:{color:'rgba(0,0,0,0.04)'}, ticks:{font:{size:10}}, border:{display:false}, beginAtZero:true } }
};
const donutOpts = { ...baseOpts, cutout:'65%', plugins:{ ...baseOpts.plugins, scales:undefined } };

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const ComprehensiveDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [calDate, setCalDate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [invTab, setInvTab] = useState('coffins');
  const [expandedInv, setExpandedInv] = useState(null);

  const filteredCal = useMemo(() => {
    if (selectedBranch === 'all') return DATA.calendarEvents;
    return DATA.calendarEvents.filter(e => e.branch === selectedBranch);
  }, [selectedBranch]);

  const filteredFleet = useMemo(() => {
    if (selectedBranch === 'all') return DATA.fleet;
    return DATA.fleet.filter(f => f.branch === selectedBranch);
  }, [selectedBranch]);

  const refresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); };

  // Calendar event config
  const getEvColor = (ev) => ({ admission:'#3b82f6', dispatch:'#10b981', autopsy:'#8b5c1f', release:'#64748b' }[ev.type] || '#64748b');
  const getEvStatus = (ev) => ({
    active:{ label:'Active', bg:'#dbeafe', color:'#2563eb' },
    completed:{ label:'Completed', bg:'#d1fae5', color:'#059669' },
    'in-transit':{ label:'In Transit', bg:'#fef3c7', color:'#d97706' },
    pending:{ label:'Pending', bg:'#f3f4f6', color:'#6b7280' },
    scheduled:{ label:'Scheduled', bg:'#ede9fe', color:'#7c3aed' },
    'autopsy-pending':{ label:'Autopsy Pending', bg:'#fce7f3', color:'#db2777' },
    released:{ label:'Released', bg:'#f1f5f9', color:'#64748b' },
  }[ev.status] || { label:'Pending', bg:'#f3f4f6', color:'#6b7280' });

  const getEvIcon = (ev) => ({ admission:UserCheck, dispatch:Truck, autopsy:Stethoscope, release:ClipboardCheck }[ev.type] || FileText);

  // Rich calendar renderDayItem (like flower bookings)
  const renderCalItem = (ev) => {
    const st = getEvStatus(ev);
    const col = getEvColor(ev);
    const Ic = getEvIcon(ev);
    return (
      <div className="mdc-cal-card" onClick={() => { setCalDate(ev.date); setActiveSection('overview'); }}>
        <div className="mdc-cal-card-top">
          <span className="mdc-cal-card-type" style={{ color: col }}><Ic size={13} />{ev.type === 'admission' ? 'Admission' : ev.type === 'dispatch' ? 'Dispatch' : ev.type === 'autopsy' ? 'Autopsy' : 'Release'}</span>
          <span className="mdc-cal-card-branch">{ev.branch.split(' ')[0]}</span>
          {ev.urgent && <span className="mdc-cal-urgent">Urgent</span>}
        </div>
        <div className="mdc-cal-card-name">{ev.deceased}, <span style={{color:'#94a3b8'}}>{ev.age}yrs</span></div>
        <div className="mdc-cal-card-meta">
          <span><Clock size={11} /> {ev.time}</span>
          <span>{ev.admissionNumber}</span>
        </div>
        {ev.causeOfDeath && <div className="mdc-cal-card-cause">Cause: {ev.causeOfDeath}</div>}
        {ev.driver && <div className="mdc-cal-card-cause"><Car size={11} /> {ev.driver} · {ev.vehicle}</div>}
        {ev.pathologist && <div className="mdc-cal-card-cause"><Stethoscope size={11} /> {ev.pathologist}</div>}
        <div className="mdc-cal-card-bottom">
          <span className="mdc-cal-card-status" style={{ background: st.bg, color: st.color }}>{st.label}</span>
          <span className="mdc-cal-card-kin">{ev.nextOfKin}</span>
        </div>
      </div>
    );
  };

  // Chart data
  const trendData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [
      { label:'Admissions', data:[18,22,19,28,24,32,28,35,30,26,22], borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.06)', fill:true, tension:0.4, borderWidth:2.5, pointRadius:3, pointBackgroundColor:'#3b82f6' },
      { label:'Releases', data:[12,15,14,20,18,25,22,28,24,20,18], borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0.06)', fill:true, tension:0.4, borderWidth:2.5, pointRadius:3, pointBackgroundColor:'#10b981' },
      { label:'Dispatches', data:[8,11,10,15,13,18,16,20,17,14,12], borderColor:'#f59e0b', backgroundColor:'rgba(245,158,11,0.06)', fill:true, tension:0.4, borderWidth:2.5, pointRadius:3, pointBackgroundColor:'#f59e0b' },
    ]
  };

  const statusData = { labels:['Active','Completed','In Transit','Pending','Scheduled'], datasets:[{ data:[28,18,5,12,8], backgroundColor:['#3b82f6cc','#10b981cc','#f59e0bcc','#8b5cf6cc','#64748bcc'], hoverBackgroundColor:['#3b82f6','#10b981','#f59e0b','#8b5cf6','#64748b'], borderWidth:0, hoverOffset:6 }] };
  const fleetData = { labels:['Available','Booked','Maintenance'], datasets:[{ data:[4,3,1], backgroundColor:['#10b981cc','#f59e0bcc','#ef4444cc'], hoverBackgroundColor:['#10b981','#f59e0b','#ef4444'], borderWidth:0, hoverOffset:6 }] };
  const branchCompData = { labels:DATA.branches.map(b => b.split(' ')[0]), datasets:[{ label:'Revenue (KES)', data:DATA.branchData.map(b=>b.revenue), backgroundColor:DATA.branchData.map((_,i)=>C[i%C.length]+'bb'), borderColor:DATA.branchData.map((_,i)=>C[i%C.length]), borderWidth:2, borderRadius:6, borderSkipped:false }] };
  const coffinCompData = { labels:DATA.inventory.coffins.map(c=>c.name), datasets:[{ label:'Stock', data:DATA.inventory.coffins.map(c=>c.stock), backgroundColor:'#3b82f6cc', borderColor:'#3b82f6', borderWidth:1, borderRadius:6 },{ label:'Min Required', data:DATA.inventory.coffins.map(c=>c.min), backgroundColor:'#fef3c7', borderColor:'#f59e0b', borderWidth:1, borderRadius:6 }] };
  const chemCompData = { labels:DATA.inventory.chemicals.slice(0,6).map(c=>c.name.length>15?c.name.slice(0,14)+'…':c.name), datasets:[{ label:'In Stock', data:DATA.inventory.chemicals.slice(0,6).map(c=>c.stock), backgroundColor:'#06b6d4cc', borderColor:'#06b6d4', borderWidth:1, borderRadius:6 },{ label:'Min Req', data:DATA.inventory.chemicals.slice(0,6).map(c=>c.min), backgroundColor:'#fef3c7', borderColor:'#f59e0b', borderWidth:1, borderRadius:6 }] };
  const chemUsageData = { labels:['Jan','Feb','Mar','Apr','May','Jun','Jul'], datasets:[{ label:'Formalin', data:[12,15,14,18,16,14], borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.06)', fill:true, tension:0.4, borderWidth:2 }, { label:'Disinfectant', data:[8,10,9,12,11,9], borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0.06)', fill:true, tension:0.4, borderWidth:2 }] };

  const totalStock = DATA.inventory.coffins.reduce((s,c)=>s+c.stock,0) + DATA.inventory.chemicals.reduce((s,c)=>s+c.stock,0);
  const lowStockItems = [...DATA.inventory.coffins.filter(c=>c.stock<=c.min), ...DATA.inventory.chemicals.filter(c=>c.stock<=c.min)];
  const totalRevenue = DATA.branchData.reduce((s,b)=>s+b.revenue,0);
  const totalAdmissions = DATA.calendarEvents.filter(e=>e.type==='admission').length;
  const totalDispatches = DATA.calendarEvents.filter(e=>e.type==='dispatch').length;
  const totalActive = DATA.calendarEvents.filter(e=>['active','in-transit','autopsy-pending'].includes(e.status)).length;

  const navItems = [
    { id:'overview', label:'Overview', icon:Activity },
    { id:'calendar', label:'Schedule', icon:CalendarDays },
    { id:'inventory', label:'Inventory', icon:Package },
    { id:'fleet', label:'Fleet', icon:Truck },
    { id:'branches', label:'Branches', icon:MapPin },
    { id:'insights', label:'Insights', icon:Zap },
  ];

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' }); setActiveSection(id); };

  return (
    <div className="mdc-layout">
      {/* ═══ SIDEBAR ═══ */}
      <aside className={`mdc-sidebar ${sidebarOpen?'mdc-sidebar-open':''}`}>
        <div className="mdc-sidebar-brand">
          <div className="mdc-brand-icon"><Activity size={22} /></div>
          <div><div className="mdc-brand-name">MorgueOS</div><div className="mdc-brand-sub">Operations Hub</div></div>
        </div>
        <nav className="mdc-sidebar-nav">
          {navItems.map(n => (
            <div key={n.id} className={`mdc-nav-item ${activeSection===n.id?'mdc-nav-active':''}`} onClick={() => { scrollTo(n.id); setSidebarOpen(false); }}>
              <span className="mdc-nav-icon">{n.icon}</span>{n.label}
            </div>
          ))}
        </nav>
        <div className="mdc-sidebar-footer">
          <div className="mdc-user"><div className="mdc-avatar">MR</div><div><div className="mdc-user-name">Margaret Reed</div><div className="mdc-user-role">Branch Manager</div></div></div>
        </div>
      </aside>
      {sidebarOpen && <div className="mdc-overlay" onClick={()=>setSidebarOpen(false)} />}

      {/* ═══ MAIN ═══ */}
      <div className="mdc-main">
        {/* Topbar */}
        <header className="mdc-topbar">
          <div className="mdc-topbar-left">
            <button className="mdc-menu-btn" onClick={()=>setSidebarOpen(true)}><span style={{display:'flex'}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></span></button>
            <div><h1 className="mdc-topbar-title">Operations Dashboard</h1><p className="mdc-topbar-sub">Morgue management, fleet tracking & analytics</p></div>
          </div>
          <div className="mdc-topbar-right">
            <div className="mdc-branch-sel">
              <MapPin size={14} /><span>{selectedBranch==='all'?'All Branches':selectedBranch}</span>
              <ChevronDown size={13} />
              <div className="mdc-branch-drop">
                <div className={`mdc-bd-item ${selectedBranch==='all'?'mdc-bd-active':''}`} onClick={()=>{setSelectedBranch('all');}}>All Branches</div>
                {DATA.branches.map(b=>(<div key={b} className={`mdc-bd-item ${selectedBranch===b?'mdc-bd-active':''}`} onClick={()=>setSelectedBranch(b)}>{b}</div>))}
              </div>
            </div>
            <button className={`mdc-refresh ${refreshing?'mdc-spin':''}`} onClick={refresh}><RefreshCw size={16} /></button>
          </div>
        </header>

        <div className="mdc-body">
          {/* ═══ STATS ROW ═══ */}
          <div className="mdc-stats">
            {[
              { l:'Total Admissions', v:totalAdmissions, s:`${DATA.calendarEvents.filter(e=>{const d=new Date(e.date+'T23:59:59');return d>=new Date()&&d<new Date(Date.now()+86400000);}).length} today`, icon:UserCheck, c:'#3b82f6' },
              { l:'Active Cases', v:totalActive, s:'In morgue now', icon:Activity, c:'#8b5cf6' },
              { l:'Pending Releases', v:DATA.calendarEvents.filter(e=>e.type==='release'&&e.status==='pending').length, s:'Awaiting dispatch', icon:Clock, c:'#f59e0b' },
              { l:'Dispatches (Month)', v:totalDispatches, s:`${DATA.fleet.filter(f=>f.status==='booked').length} in transit`, icon:Truck, c:'#10b981' },
              { l:'Month Revenue', v:`KES ${totalRevenue.toLocaleString()}`, s:`${DATA.branchData.length} branches`, icon:DollarSign, c:'#06b6d4' },
              { l:'Fleet Available', v:`${DATA.fleet.filter(f=>f.status==='available').length}/${DATA.fleet.length}`, s:'Hearses ready', icon:Car, c:'#10b981' },
              { l:'Inventory Items', v:totalStock, s:`${lowStockItems.length} low stock`, icon:Package, c:lowStockItems.length>0?'#ef4444':'#06b6d4' },
            ].map((s,i)=>(
              <div key={i} className="mdc-stat">
                <div className="mdc-stat-top"><span className="mdc-stat-label">{s.l}</span><div className="mdc-stat-icon" style={{background:s.c+'12',color:s.c}}>{s.icon}</div></div>
                <div className="mdc-stat-val">{s.v}</div>
                <div className="mdc-stat-sub" style={{color:s.c==='#ef4444'?'#ef4444':'#94a3b8'}}>{s.s}</div>
              </div>
            ))}
          </div>

          {/* ═══ OVERVIEW SECTION ═══ */}
          <div id="overview" className="mdc-section">
            <div className="mdc-sec-hdr"><h3><TrendingUp size={18} />Performance Overview</h3></div></div>
            <div className="mdc-grid-3">
              <div className="mdc-card mdc-card-chart">
                <div className="mdc-card-hdr"><h4><BarChart3 size={15} />Trend Analysis</h4></div>
                <div className="mdc-chart" style={{height:300}}><Line data={trendData} options={baseOpts} /></div>
              </div>
              <div className="mdc-card mdc-card-chart">
                <div className="mdc-card-hdr"><h4><Activity size={15} />Case Status</h4></div>
                <div className="mdc-chart" style={{height:300}}><Doughnut data={statusData} options={donutOpts} /></div>
              </div>
              <div className="mdc-card mdc-card-chart">
                <div className="mdc-card-hdr"><h4><Truck size={15} />Fleet Status</h4></div>
                <div className="mdc-chart" style={{height:300}}><Doughnut data={fleetData} options={donutOpts} /></div>
              </div>
            </div>
            <div className="mdc-grid-2">
              <div className="mdc-card"><div className="mdc-card-hdr"><h4><MapPin size={15} />Branch Revenue</h4></div><div className="mdc-chart" style={{height:280}}><Bar data={branchCompData} options={{...baseOpts,plugins:{...baseOpts.plugins,legend:{...baseOpts.plugins.legend,position:'top'}}}} /></div></div>
              <div className="mdc-card"><div className="mdc-card-hdr"><h4><FlaskConical size={15} />Chemical Usage</h4></div><div className="mdc-chart" style={{height:280}}><Line data={chemUsageData} options={baseOpts} /></div></div>
            </div>
          </div>

          {/* ═══ CALENDAR SECTION ═══ */}
          <div id="calendar" className="mdc-section">
            <div className="mdc-sec-hdr">
              <h3><CalendarDays size={18} />Schedule Calendar</h3>
              <div className="mdc-cal-legend">
                {[{c:'#3b82f6',l:'Admission'},{c:'#10b981',l:'Dispatch'},{c:'#8b5cf6',l:'Autopsy'},{c:'#64748b',l:'Release'}].map((l,i)=>(
                  <span key={i} className="mdc-lg-item"><span className="mdc-lg-dot" style={{background:l.c}}></span>{l.l}</span>
                ))}
              </div>
            </div>
            <div className="mdc-cal-wrap">
              <ReusableCalendar
                items={filteredCal}
                dateKey="date"
                getStatusColor={getEvColor}
                getIsUrgent={(ev)=>ev.urgent}
                getSortKey={(ev)=>ev.time}
                renderDayItem={renderCalItem}
                showAddButton={false}
                accentColor="#3b82f6"
              />
            </div>
          </div>

          {/* ═══ INVENTORY SECTION ═══ */}
          <div id="inventory" className="mdc-section">
            <div className="mdc-sec-hdr">
              <h3><Package size={18} />Inventory Tracking</h3>
              {lowStockItems.length > 0 && <span className="mdc-alert-badge"><ShieldAlert size={13} />{lowStockItems.length} Low Stock Alerts</span>}
            </div>
            <div className="mdc-inv-tabs">
              <button className={`mdc-inv-tab ${invTab==='coffins'?'mdc-inv-tab-on':''}`} onClick={()=>setInvTab('coffins')}>Coffins ({DATA.inventory.coffins.length})</button>
              <button className={`mdc-inv-tab ${invTab==='chemicals'?'mdc-inv-tab-on':''}`} onClick={()=>setInvTab('chemicals')}>Chemicals ({DATA.inventory.chemicals.length})</button>
            </div>
            <div className="mdc-inv-table-wrap">
              {invTab === 'coffins' ? (
                <table className="mdc-inv-table">
                  <thead><tr><th>Coffin Type</th><th>Stock</th><th>Min</th><th>Sold</th><th>Price</th><th>Supplier</th><th>Last Restock</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {DATA.inventory.coffins.map(c => {
                      const isLow = c.stock <= c.min;
                      const pct = Math.min(100, (c.stock / (c.min * 3)) * 100);
                      return (
                        <tr key={c.id} className={isLow ? 'mdc-row-warn' : ''} onClick={() => setExpandedInv(expandedInv === c.id ? null : c.id)}>
                          <td className="mdc-td-name">{c.name}</td>
                          <td><span className={`mdc-stock-num ${isLow?'mdc-stock-low':''}`}>{c.stock}</span></td>
                          <td style={{color:'#94a3b8'}}>{c.min}</td>
                          <td>{c.sold}</td>
                          <td style={{fontWeight:500}}>KES {c.price.toLocaleString()}</td>
                          <td style={{fontSize:'0.78rem'}}>{c.supplier}</td>
                          <td style={{fontSize:'0.78rem',color:'#94a3b8'}}>{c.lastRestock}</td>
                          <td>{isLow ? <span className="mdc-status" style={{background:'#fee2e2',color:'#dc2626'}}>Low Stock</span> : <span className="mdc-status" style={{background:'#d1fae5',color:'#059669'}}>OK</span>}</td>
                          <td><button className="mdc-expand-btn" onClick={(e)=>{e.stopPropagation(); setExpandedInv(expandedInv===c.id?null:c.id);}}>{expandedInv===c.id?<ChevronDown size={14}/>:<ChevronDown size={14} style={{transform:'rotate(-90deg)'}}/>}</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {expandedInv && (() => {
                    const c = DATA.inventory.coffins.find(x=>x.id===expandedInv);
                    if(!c) return null;
                    return (
                      <tr><td colSpan="9" className="mdc-inv-detail">
                        <div className="mdc-inv-detail-grid">
                          <div><span className="mdc-inv-detail-label">Total Value</span><span className="mdc-inv-detail-val">KES {(c.stock * c.price).toLocaleString()}</span></div>
                          <div><span className="mdc-inv-detail-label">Revenue (Sold)</span><span className="mdc-inv-detail-val">KES {(c.sold * c.price).toLocaleString()}</span></div>
                          <div><span className="mdc-inv-detail-label">Turnover Rate</span><span className="mdc-inv-detail-val">{Math.round((c.sold/c.stock)*100)}%</span></div>
                          <div><span className="mdc-inv-detail-label">Days Since Restock</span><span className="mdc-inv-detail-val">{Math.floor((new Date() - new Date(c.lastRestock+'T00:00:00')) / 86400000)} days</span></div>
                          <div><span className="mdc-inv-detail-label">Status</span><span className={`mdc-status ${c.stock<=c.min?'mdc-status-danger':'mdc-status-ok'}`}>{c.stock<=c.min?'Below Minimum':'Adequate'}</span></div>
                        </div>
                      </td></tr>
                    );
                  })()}
                </table>
              ) : (
                <table className="mdc-inv-table">
                  <thead><tr><th>Chemical</th><th>Stock</th><th>Min</th><th>Used/30d</th><th>Expiry</th><th>Supplier</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {DATA.inventory.chemicals.map(c => {
                      const isLow = c.stock <= c.min;
                      const pct = Math.min(100, (c.stock / (c.min * 3)) * 100);
                      return (
                        <tr key={c.id} className={isLow ? 'mdc-row-warn' : ''} onClick={() => setExpandedInv(expandedInv===c.id ? null : c.id)}>
                          <td className="mdc-td-name">{c.name} {isLow && <AlertTriangle size={11} className="mdc-inv-warn-icon" />}</td>
                          <td><span className={`mdc-stock-num ${isLow?'mdc-stock-low':''}`}>{c.stock} {c.unit}</span></td>
                          <td style={{color:'#94a3b8'}}>{c.min} {c.unit}</td>
                          <td>{c.used} {c.unit}</td>
                          <td style={{fontSize:'0.78rem',color: c.expiry!=='N/A' && new Date(c.expiry+'T00:00:00') < new Date(Date.now()+30*86400000) ? '#ef4444':'#94a3b8'}}>{c.expiry!=='N/A' ? c.expiry : 'N/A'}</td>
                          <td style={{fontSize:'0.78rem'}}>{c.supplier}</td>
                          <td>{isLow ? <span className="mdc-status" style={{background:'#fee2e2',color:'#dc2626'}}>Low Stock</span> : <span className="mdc-status" style={{background:'#d1fae5',color:'#059669}}>OK</span>}</td>
                          <td><button className="mdc-expand-btn" onClick={(e)=>{e.stopPropagation(); setExpandedInv(expandedInv===c.id?null:c.id);}}>{expandedInv===c.id?<ChevronDown size={14}/>:<ChevronDown size={14} style={{transform:'rotate(-90deg)'}}/>}</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {expandedInv && (() => {
                    const c = DATA.inventory.chemicals.find(x=>x.id===expandedInv);
                    if(!c) return null;
                    return (
                      <tr><td colSpan="9" className="mdc-inv-detail">
                        <div className="mdc-inv-detail-grid">
                          <div><span className="mdc-inv-detail-label">Total Value</span><span className="mdc-inv-detail-val">KES {Math.round(c.stock * (c.price || 2000)).toLocaleString()}</span></div>
                          <div><span className="mdc-inv-detail-label">Expiry Status</span><span className={`mdc-status ${c.expiry!=='N/A' && new Date(c.expiry+'T00:00:00') < new Date(Date.now()+90*86400000)?'mdc-status-danger':'mdc-status-ok'}`}>{c.expiry!=='N/A' ? (new Date(c.expiry+'T00:00:00')).toLocaleDateString() : 'No expiry'}</span></div>
                          <div><span className="mdc-inv-detail-label">Days Until Expiry</span><span className="mdc-inv-detail-val">{c.expiry!=='N/A' ? Math.max(0, Math.floor((new Date(c.expiry+'T00:00:00') - new Date()) / 86400000) : 'N/A'}</span></div>
                          <div><span className="mdc-inv-detail-label">Usage Rate</span><span className="mdc-inv-detail-val">{c.min > 0 ? Math.round((c.used / (c.min * 2)) * 100) : 0}%/month</span></div>
                          <div><span className="mdc-inv-detail-label">Reorder Suggestion</span><span className="mdc-inv-detail-val">{c.stock <= c.min ? `Order ${c.min - c.stock} ${c.unit} immediately` : 'Sufficient stock'}</span></div>
                        </div>
                      </td></tr>
                    );
                  })()}
                </table>
              )}
            </div>
          </div>

          {/* ═══ FLEET SECTION ═══ */}
          <div id="fleet" className="mdc-section">
            <div className="mdc-sec-hdr"><h3><Car size={18} />Fleet Management</h3></div>
            <div className="mdc-fleet-grid">
              {filteredFleet.map(f => {
                const st = { available:{label:'Available',bg:'#d1fae5',color:'#059669'}, booked:{label:'Booked',bg:'#fef3c7',color:'#d97706'}, maintenance:{label:'Maintenance',bg:'#fee2e2',color:'#dc2626'} }[f.status] || st.available;
                const daysSinceService = Math.floor((new Date() - new Date(f.lastService+'T00:00:00')) / 86400000);
                return (
                  <div key={f.id} className="mdc-fleet-card">
                    <div className="mdc-fleet-hdr" style={{ borderLeft: `4px solid ${st.color}` }}>
                      <div>
                        <div className="mdc-fleet-name">{f.model}</div>
                        <div className="mdc-fleet-plate">{f.plate}</div>
                      </div>
                      <span className="mdc-fleet-badge" style={{background:st.bg, color:st.color}}>{st.label}</span>
                    </div>
                    <div className="mdc-fleet-body">
                      <div className="mdc-fleet-row"><span className="mdc-fleet-label">Driver</span><span className="mdc-fleet-val">{f.driver}</span></div>
                      <div className="mdc-fleet-row"><span className="mdc-fleet-label">Branch</span><span className="mdc-fleet-val">{f.branch}</span></div>
                      <div className="mdc-fleet-row"><span className="mdc-fleet-label">Total Trips</span><span className="mdc-fleet-val">{f.totalTrips}</span></div>
                      <div className="mdc-fleet-row"><span className="mdc-fleet-label">Last Service</span><span className="mdc-fleet-val">{f.lastService} <span style={{color: daysSinceService > 25 ? '#ef4444' : '#94a3b8'}}>({daysSinceService}d ago)</span></span></div>
                      <div className="mdc-fleet-row"><span className="mdc-fleet-label">Next Service</span><span className="mdc-fleet-val">{f.nextService}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══ BRANCHES SECTION ═══ */}
          <div id="branches" className="mdc-section">
            <div className="mdc-sec-hdr"><h3><MapPin size={18} />Branch Performance</h3></div>
            <div className="mdc-branch-grid">
              {DATA.branchData.map((b,i) => {
                const avgRev = DATA.branchData.reduce((s,x)=>s+x.revenue,0) / DATA.branchData.length;
                const isTop = b.revenue === Math.max(...DATA.branchData.map(x=>x.revenue));
                return (
                  <div key={i} className={`mdc-branch-card ${isTop ? 'mdc-branch-top' : ''}`}>
                    {isTop && <div className="mdc-branch-crown"><Trophy size={14} />Top Performer</div>}
                    <div className="mdc-branch-name">{b.name}</div>
                    <div className="mdc-branch-stats">
                      <div><span className="mdc-bs-label">Admissions</span><span className="mdc-bs-val">{b.monthAdmissions}</span></div>
                      <div><span className="mdc-bs-label">Dispatches</span><span className="mdc-bs-val">{b.monthDispatches}</span></div>
                      <div><span className="mdc-bs-label">Autopsies</span><span className="mdc-bs-val">{b.monthAutopsies}</span></div>
                      <div><span className="mdc-bs-label">Releases</span><span className="mdc-bs-val">{b.monthReleases}</span></div>
                    </div>
                    <div className="mdc-branch-rev">
                      <span className="mdc-bs-label">Revenue (30d)</span>
                      <span className={`mdc-bs-val ${b.revenue >= avgRev ? 'mdc-up' : 'mdc-down'}`}>
                        KES {b.revenue.toLocaleString()}
                        {b.revenue >= avgRev ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      </span>
                    </div>
                    <div className="mdc-branch-fleet">
                      <Car size={14} />
                      <span>{b.fleetAvail}/{b.fleetTotal} Hearses Available</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══ INSIGHTS SECTION ═══ */}
          <div id="insights" className="mdc-section">
            <div className="mdc-sec-hdr"><h3><Zap size={18} />AI Insights & Recommendations</h3></div>
            <div className="mdc-insights">
              {[
                { type:'danger', text:'Eco Bamboo coffins critically low (2 remaining, minimum 4). Immediate restock required to avoid service disruption.' },
                { type:'danger', text:'Body Bags across all branches below minimum threshold. 4 units remaining system-wide.' },
                { type:'warning', text:'Formalin usage spiked 25% this month. Verify chemical consumption logs.' },
                { type:'info', text:`Nairobi Main branch leading in admissions this month (+15% vs last month).` },
                { type:'success', text:'Hearse fleet utilization at optimal 58%. No immediate fleet expansion needed.' },
                { type:'info', text:`Kisumu branch showed 40% increase in dispatch requests this period.` },
                { type:'success', text:'Chemical inventory turnover rate improved from 2.1x to 2.8x this quarter.' },
                { type:'warning', text:'3 chemicals expiring within 90 days. Schedule reorder before expiry.' },
                { type:'info', text:'Nakuru branch has the highest revenue per admission (KES 8,200 avg).' },
                { type:'success', text:'Mombasa branch reduced dispatch delays by 22% through route optimization.' },
              ].map((ins, i) => {
                const ic = { danger:AlertTriangle, warning:AlertTriangle, info:CircleDot, success:CheckCircle };
                const tc = { danger:'#ef4444', warning:'#f59e0b', info:'#3b82f6', success:'#10b981' };
                return (
                  <div key={i} className={`mdc-insight mdc-insight-${ins.type}`} style={{ borderLeft:`3px solid ${tc[ins.type]}` }}>
                    <span style={{ color: tc[ins.type] }}><ic size={16} /></span>
                    <span>{ins.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ textAlign:'center', padding:'20px 0', color:'#94a3b8', fontSize:'0.78rem' }}>
            Auto-refreshes every 30 seconds · Last updated: {new Date().toLocaleTimeString()} · MorgueOS v2.4
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveDashboard;

/* ═══════════════════════════════════════════════════════════════
   COMPREHENSIVE DASHBOARD — Complete Styles
   Prefix: "mdc-"
   ═════════════════════════════════════════════════════════════ */
:root {
  --mdc-bg: #f0f4f8;
  --mdc-card: #ffffff;
  --mdc-dark: #0f172a;
  --mdc-text: #1e293b;
  --mdc-muted: #64748b;
  --mdc-faint: #94a3b8;
  --mdc-border: #e2e8f0;
  --mdc-sidebar-bg: #0f172a;
  --mdc-blue: #3b82f6;
  --mdc-green: #10b981;
  --mdc-amber: #f59e0b;
  --mdc-red: #ef4444;
  --mdc-purple: #8b5cf6;
  --mdc-cyan: #06b6d4;
  --mdc-shadow: 0 1px 3px rgba(0,0,0,0.05);
  --mdc-shadow-md: 0 4px 16px rgba(0,0,0,0.06);
  --mdc-radius: 12px;
  --mdc-radius-lg: 16px;
  --mdc-sidebar-w: 250px;
  --mdc-topbar-h: 60px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body { background: var(--mdc-bg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: var(--mdc-text); line-height: 1.5; }

.mdc-hidden { display: none !important; }
.mdc-spin { animation: mdc-spin 0.7s linear infinite; }
@keyframes mdc-spin { to { transform: rotate(360deg); } }

/* ─── Layout ─── */
.mdc-layout { display: flex; min-height: 100vh; }
.mdc-sidebar {
  width: var(--mdc-sidebar-w);
  background: var(--mdc-sidebar-bg);
  color: #e2e8f0;
  position: fixed; top: 0; bottom: 0; left: 0;
  z-index: 100;
  display: flex; flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  overflow-y: auto; overflow-x: hidden;
}
.mdc-sidebar::-webkit-scrollbar { width: 4px; }
.mdc-sidebar::-webkit-scrollbar-track { background: transparent; }
.mdc-sidebar::-webkit-scrollbar-thumb { background: #334155; border-radius: 999px; }
.mdc-sidebar-open { transform: translateX(0); }
.mdc-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:99; }
.mdc-overlay-open { display:block; }

.mdc-main { flex:1; margin-left: var(--mdc-sidebar-w); display:flex; flex-direction:column; min-height:100vh; }
.mdc-topbar { height: var(--mdc-topbar-h); background: #fff; border-bottom: 1px solid var(--mdc-border); display:flex; align-items:center; justify-content:space-between; padding:0 20px; position:sticky; top:0; z-index:50; gap:12px; }
.mdc-topbar-left { display:flex; align-items:center; gap:10px; }
.mdc-menu-btn { display:none; width:36px; height:36px; align-items:center; justify-content:center; border:none; background:none; border-radius:8px; color:#64748b; cursor:pointer; }
.mdc-topbar-title { font-size:1.1rem; font-weight:700; margin:0; line-height:1.2; color:var(--mdc-dark); }
.mdc-topbar-sub { font-size:0.75rem; color:var(--mdc-faint); margin:0; }
.mdc-topbar-right { display:flex; align-items:center; gap:10px; }
.mdc-refresh { width:34px; height:34px; display:flex; align-items:center; justify-content:center; border:1px solid var(--mdc-border); border-radius:8px; background:#fff; cursor:pointer; color:var(--mdc-muted); transition:all 0.15s; }
.mdc-refresh:hover { background:#f8fafc; border-color:#cbd5e1; }

.mdc-branch-sel {
  position:relative; display:flex; align-items:center; gap:6px; padding:6px 12px;
  background:#fff; border:1px solid var(--mdc-border); border-radius:8px; font-size:0.8rem; color:var(--mdc-text); cursor:pointer;
}
.mdc-branch-drop {
  position:absolute; top:calc(100% + 4px); left:0; min-width:200px; background:#fff;
  border:1px solid var(--mdc-border); border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,0.1);
  z-index:110; padding:4px; animation:mdc-dropIn 0.15s ease; display:none;
}
.mdc-branch-sel:hover .mdc-branch-drop, .mdc-branch-drop:hover { display:block; }
@keyframes mdc-dropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

.mdc-bd-item { padding:8px 12px; border-radius:8px; font-size:0.82rem; color:var(--mdc-text); cursor:pointer; transition:background 0.12s; }
.mdc-bd-item:hover { background:#f1f5f9; }
.mdc-bd-active { background:#eff6ff; color:#3b82f6; font-weight:600; }

.mdc-body { padding:20px; flex:1; overflow-x:hidden; }

/* ─── Stats ─── */
.mdc-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
@media(max-width:1200px) { .mdc-stats { grid-template-columns: repeat(3,1fr); } }
@media(max-width:768px)  { .mdc-stats { grid-template-columns: repeat(2,1fr); } }
@media(max-width:480px)  { .mdc-stats { grid-template-columns: 1fr; } }

.mdc-stat { background:#fff; border:1px solid var(--mdc-border); border-radius:var(--mdc-radius); padding:16px; transition:box-shadow 0.2s, transform 0.2s; }
.mdc-stat:hover { box-shadow:var(--mdc-shadow-md); transform:translateY(-2px); }
.mdc-stat-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.mdc-stat-label { font-size:0.75rem; font-weight:500; color:var(--mdc-muted); text-transform:uppercase; letter-spacing:0.04em; }
.mdc-stat-icon { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
.mdc-stat-val { font-size:1.3rem; font-weight:700; letter-spacing:-0.02em; line-height:1.2; }
.mdc-stat-sub { font-size:0.7rem; margin-top:2px; }

/* ─── Section ─── */
.mdc-section { margin-bottom:24px; }
.mdc-sec-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:12px; border-bottom:2px solid var(--mdc-border); }
.mdc-sec-hdr h3 { font-size:0.95rem; font-weight:600; margin:0; display:flex; align-items:center; gap:8px; color:var(--mdc-dark); }

/* ─── Cards ─── */
.mdc-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:20px; }
.mdc-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
@media(max-width:1024px) { .mdc-grid-3 { grid-template-columns:1fr; } }
@media(max-width:640px) { .mdc-grid-2 { grid-template-columns:1fr; } }

.mdc-card { background:var(--mdc-card); border:1px solid var(--mdc-border); border-radius:var(--mdc-radius); box-shadow:var(--mdc-shadow); overflow:hidden; display:flex; flex-direction:column; }
.mdc-card-chart { min-height:0; }
.mdc-card-hdr { display:flex; align-items:center; justify-content:space-between; padding:14px 16px 0; border-bottom:1px solid #f1f5f9; }
.mdc-card-hdr h4 { font-size:0.82rem; font-weight:600; margin:0; display:flex; align-items:center; gap:6px; color:var(--mdc-text); }
.mdc-chart { padding:0 16px 16px; flex:1; min-height:0; position:relative; }

/* ─── Calendar ─── */
.mdc-sec-hdr .mdc-cal-legend { display:flex; gap:12px; flex-wrap:wrap; }
.mdc-lg-item { display:flex; align-items:center; gap:5px; font-size:0.72rem; color:var(--mdc-muted); white-space:nowrap; }
.mdc-lg-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.mdc-cal-wrap { border:1px solid var(--mdc-border); border-radius:10px; overflow:hidden; }
.mdc-cal-wrap .rc-root { border:none !important; box-shadow:none !important; border-radius:0 !important; }
.mdc-cal-wrap .rc-right { border-left:1px solid var(--mdc-border) !important; }

/* Rich Calendar Day Cards */
.mdc-cal-card {
  background:#fff; border:1px solid var(--mdc-border); border-radius:10px;
  padding:10px; margin-bottom:6px; cursor:pointer;
  transition:all 0.15s; position:relative; overflow:hidden;
}
.mdc-cal-card:hover { border-color:var(--mdc-blue); box-shadow:0 2px 8px rgba(59,130,246,0.12); }
.mdc-cal-card-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; gap:4px; }
.mdc-cal-card-type { font-size:0.68rem; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; display:flex; align-items:center; gap:4px; }
.mdc-cal-card-branch { font-size:0.65rem; color:var(--mdc-faint); }
.mdc-cal-urgent { font-size:0.6rem; font-weight:700; color:#fff; background:var(--mdc-red); padding:1px 5px; border-radius:4px; letter-spacing:0.04em; line-height:1.3; }
.mdc-cal-card-name { font-size:0.82rem; font-weight:600; color:var(--mdc-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.mdc-cal-card-meta { display:flex; gap:10px; font-size:0.7rem; color:var(--mdc-faint); margin-bottom:5px; }
.mdc-cal-card-cause { font-size:0.7rem; color:var(--mdc-muted); background:#f8fafc; padding:4px 8px; border-radius:6px; margin-bottom:5px; border-left:3px solid var(--mdc-amber); line-height:1.3; }
.mdc-cal-card-bottom { display:flex; align-items:center; justify-content:space-between; gap:6px; margin-top:auto; padding-top:6px; border-top:1px solid #f1f5f9; }
.mdc-cal-card-status { font-size:0.65rem; font-weight:600; padding:2px 8px; border-radius:999px; white-space:nowrap; }
.mdc-cal-card-kin { font-size:0.68rem; color:var(--mdc-faint); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px; text-align:right; }

/* ─── Inventory ─── */
.mdc-inv-tabs { display:flex; gap:4px; margin-bottom:12px; }
.mdc-inv-tab {
  padding:7px 16px; border:1px solid var(--mdc-border); background:#fff; border-radius:8px;
  font-size:0.78rem; font-weight:500; color:var(--mdc-muted); cursor:pointer; transition:all 0.15s; font-family:inherit;
}
.mdc-inv-tab-on { background:var(--mdc-blue); color:#fff; border-color:var(--mdc-blue); }
.mdc-inv-tab:hover:not(.mdc-inv-tab-on) { background:#f8fafc; border-color:#cbd5e1; }
.mdc-alert-badge { display:inline-flex; align-items:center; gap:5px; font-size:0.72rem; font-weight:600; padding:3px 10px; border-radius:999px; background:#fee2e2; color:#ef4444; white-space:nowrap; }

.mdc-inv-table-wrap { overflow-x:auto; border:1px solid var(--mdc-border); border-radius:var(--mdc-radius); background:#fff; }
.mdc-inv-table { width:100%; border-collapse:collapse; font-size:0.8rem; }
.mdc-inv-table thead { background:#f8fafc; }
.mdc-inv-table th { padding:10px 12px; text-align:left; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--mdc-muted); white-space:nowrap; border-bottom:2px solid var(--mdc-border); font-weight:600; }
.mdc-inv-table td { padding:10px 12px; border-bottom:1px solid #f1f5f9; vertical-align:middle; }
.mdc-inv-table tbody tr { transition:background 0.1s; cursor:pointer; }
.mdc-inv-table tbody tr:hover { background:#f8fafc; }
.mdc-row-warn { background:#fffbfb !important; }
.mdc-row-warn:hover { background:#fef2f2 !important; }
.mdc-td-name { font-weight:500; max-width:160px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.mdc-stock-num { font-weight:600; font-variant-numeric:tabular-nums; }
.mdc-stock-low { color:var(--mdc-red) !important; background:#fef2f2; padding:1px 6px; border-radius:4px; }
.mdc-inv-warn-icon { color:var(--mdc-red); flex-shrink:0; }
.mdc-expand-btn { width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:1px solid var(--mdc-border); border-radius:6px; background:#fff; cursor:pointer; color:var(--mdc-muted); transition:all 0.15s; }
.mdc-expand-btn:hover { background:#f8fafc; }
.mdc-inv-detail { background:#f8fafc; }
.mdc-inv-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:12px 16px; }
.mdc-inv-detail-label { font-size:0.72rem; color:var(--mdc-muted); }
.mdc-inv-detail-val { font-size:0.82rem; font-weight:600; color:var(--mdc-text); text-align:right; }
.mdc-status { font-size:0.68rem; font-weight:600; padding:2px 8px; border-radius:999px; white-space:nowrap; display:inline-flex; align-items:center; }
.mdc-status-ok { background:#d1fae5; color:#059669; }
.mdc-status-danger { background:#fee2e2; color:#dc2626; }

/* ─── Fleet ─── */
.mdc-fleet-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
@media(max-width:1100px) { .mdc-fleet-grid { grid-template-columns:repeat(2,1fr); } }
@media(max-width:640px)  { .mdc-fleet-grid { grid-template-columns:1fr; } }

.mdc-fleet-card { background:#fff; border:1px solid var(--mdc-border); border-radius:var(--mdc-radius); overflow:hidden; transition:all 0.2s; }
.mdc-fleet-card:hover { box-shadow:var(--mdc-shadow-md); transform:translateY(-2px); }
.mdc-fleet-hdr { padding:14px; border-bottom:3px solid transparent; display:flex; align-items:center; justify-content:space-between; }
.mdc-fleet-name { font-size:0.85rem; font-weight:600; color:var(--mdc-text); }
.mdc-fleet-plate { font-family:monospace; font-size:0.78rem; color:var(--mdc-muted); background:#f8fafc; padding:2px 8px; border-radius:4px; }
.mdc-fleet-badge { font-size:0.68rem; font-weight:600; padding:3px 10px; border-radius:999px; white-space:nowrap; }
.mdc-fleet-body { padding:10px 14px; }
.mdc-fleet-row { display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #f1f5f9; }
.mdc-fleet-label { font-size:0.72rem; color:var(--mdc-faint); }
.mdc-fleet-val { font-size:0.78rem; font-weight:500; color:var(--mdc-text); text-align:right; }
.mdc-fleet-val span[style*="color:#ef4444"] { color:#ef4444 !important; }
.mdc-branch-fleet { display:flex; align-items:center; gap:6px; margin-top:8px; font-size:0.78rem; color:var(--mdc-muted); background:#f8fafc; padding:6px 10px; border-radius:8px; }
.mdc-branch-crown { position:absolute; top:-8px; left:-4px; color:#fbbf24; }
.mdc-branch-name { position:relative; padding-left:12px; }
.mdc-branch-stats { display:grid; grid-template-columns:1fr 1fr; gap:4px 12px 12px 12px; }
.mdc-bs-label { font-size:0.68rem; color:var(--mdc-faint); }
.mdc-bs-val { font-size:0.82rem; font-weight:600; text-align:right; }
.mdc-up { color:var(--mdc-green) !important; }
.mdc-down { color:var(--mdc-red) !important; }
.mdc-branch-rev { display:flex; align-items:center; justify-content:space-between; margin-top:4px; padding-top:6px; border-top:1px solid #f1f5f9; }
.mdc-branch-top { position:relative; padding:14px; background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%); border:1px solid #bbf7d0; border-radius:var(--mdc-radius); margin:-14px -14px 0 -14px; padding:10px; text-align:center; }
.mdc-branch-card { position:relative; background:#fff; border:1px solid var(--mdc-border); border-radius:var(--mdc-radius); padding:16px; margin-top:10px; box-shadow:var(--mdc-shadow); transition:all 0.2s; }
.mdc-branch-top:hover { box-shadow:var(--mdc-shadow-md); transform:translateY(-2px); }

/* ─── Insights ─── */
.mdc-insights { display:flex; flex-direction:column; gap:10px; }
.mdc-insight { display:flex; align-items:flex-start; gap:10px; padding:10px 14px; border-radius:10px; font-size:0.8rem; line-height:1.5; color:var(--mdc-text); border-left:3px solid; }
.mdc-insight-danger { background:#fef2f2; border-color:#fecaca; color:#991b1b; }
.mdc-insight-warning { background:#fffbeb; border-color:#fde68a; color:#92400e; }
.mdc-insight-info { background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8; }
.mdc-insight-success { background:#d1fae5; border-color:#a7f3d0; color:#065f46; }

/* ═══ RESPONSIVE ═══ */
@media(max-width:1024px) {
  .mdc-sidebar { transform: translateX(-100%); }
  .mdc-sidebar-open { transform:translateX(0); }
  .mdc-main { margin-left:0; }
  .mdc-menu-btn { display:flex; }
  .mdc-cal-wrap .rc-root { grid-template-columns:1fr !important; }
  .mdc-cal-wrap .rc-right { border-left:1px solid var(--mdc-border) !important; max-height:420px !important; }
  .mdc-grid-3, .mdc-grid-2 { grid-template-columns:1fr !important; }
  .mdc-fleet-grid { grid-template-columns:1fr !important; }
  .mdc-stats { grid-template-columns: 1fr 1fr !important; }
  .mdc-branch-grid { grid-template-columns:1fr !important; }
}
@media(max-width:480px) {
  .mdc-topbar { flex-direction:column; height:auto; padding:12px 16px; gap:8px; }
  .mdc-topbar-right { width:100%; justify-content:space-between; }
  .mdc-branch-sel { flex:1; }
  .mdc-stats { grid-template-columns:1fr !important; }
  .mdc-cal-legend { gap:6px; }
  .mdc-cal-card-meta { flex-wrap:wrap; }
  .mdc-cal-card-bottom { flex-direction:column; align-items:flex-start; }
  .mdc-cal-card-kin { max-width:100%; text-align:left; }
  .mdc-inv-table { font-size:0.75rem; }
  .mdc-inv-table th, .mdc-inv-table td { padding:8px; }
  .mdc-fleet-body { padding:8px 10px; }
  .mdc-branch-stats { padding:8px; }
  .mdc-branch-card { padding:12px; }
  .mdc-insights { font-size:0.75rem; }
  .mdc-section { padding:16px 0; }
}