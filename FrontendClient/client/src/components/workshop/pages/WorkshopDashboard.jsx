import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';

// ── Chart.js ──
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
const ChartJS = Chart;

// ── API & Context ──
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

// ═══════════════════════════════════════════════════════════
//  BACKEND INTEGRATION
// ═══════════════════════════════════════════════════════════

// Transform backend order to frontend format
const transformOrder = (order) => {
  if (!order) return null;
  const stageMap = {};
  if (order.stages && Array.isArray(order.stages)) {
    order.stages.forEach(s => { stageMap[s.stage] = s; });
  }
  const currentStage = order.current_stage || order.status || 'pending';
  const stages = STAGES.map(s => {
    const backendStage = stageMap[s.id];
    return {
      ...s,
      status: backendStage ? backendStage.status : (STAGES.findIndex(st => st.id === s.id) <= STAGES.findIndex(st => st.id === currentStage) ? 'completed' : 'pending'),
      startedAt: backendStage?.started_at ? new Date(backendStage.started_at) : null,
      completedAt: backendStage?.completed_at ? new Date(backendStage.completed_at) : null,
    };
  });
  const currentStageIndex = STAGES.findIndex(s => s.id === currentStage);
  return {
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    deceasedName: order.deceased_name,
    coffinType: order.coffin_type || 'Standard',
    color: order.color || 'Walnut',
    interior: order.interior_fabric || 'Satin Gold',
    currentStage: currentStageIndex >= 0 ? currentStage : 'pending',
    stages,
    assignedWorker: order.assigned_worker || WORKERS[0],
    priority: order.priority || 'normal',
    price: parseFloat(order.selling_price) || 20000,
    createdAt: order.order_date ? new Date(order.order_date) : new Date(),
    dueDate: order.due_date ? new Date(order.due_date) : new Date(Date.now() + 5 * 86400000),
  };
};

// Transform backend material to frontend format
const transformMaterial = (material) => ({
  id: material.id,
  name: material.name,
  category: material.category,
  quantity: parseFloat(material.quantity) || 0,
  unit: material.unit || 'pcs',
  minLevel: parseFloat(material.min_stock_level) || 10,
  costPerUnit: parseFloat(material.unit_price) || 0,
  supplier: material.supplier || 'N/A',
});

// Transform backend worker to frontend format
const transformWorker = (worker) => ({
  id: worker.id,
  name: `${worker.first_name} ${worker.last_name}`,
  role: worker.role,
  initials: `${worker.first_name[0]}${worker.last_name[0]}`,
  color: ['#2563EB', '#7C3AED', '#059669', '#DC2626', '#8B5CF6', '#EC4899', '#14B8A6', '#D97706'][worker.id % 8],
  speed: 0.7 + Math.random() * 0.3,
  reliability: 0.7 + Math.random() * 0.3,
  todayCount: Math.floor(Math.random() * 5),
  weekCount: Math.floor(Math.random() * 20) + 5,
  monthCount: Math.floor(Math.random() * 60) + 10,
  allTime: Math.floor(Math.random() * 400) + 50,
  avgHours: 3 + Math.random() * 5,
  trend: ['up', 'stable', 'down'][Math.floor(Math.random() * 3)],
});

// ═══════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════
const WorkshopDashboard = () => {
  const [tab, setTab] = useState('dashboard');
  const [modal, setModal] = useState({ type: null, data: null });
  const [toasts, setToasts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  
  const { socket, connected: socketConnected } = useSocket();
  const tid = useRef(0);

  // ── Load initial data from backend ──
  useEffect(() => {
    loadInitialData();
  }, []);

  // ── Socket.io real-time updates ──
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('[Workshop] Socket connected');
      setConnected(true);
      const tenantSlug = localStorage.getItem('tenantSlug') || 'default';
      socket.emit('join_tenant', tenantSlug);
    };

    const handleDisconnect = () => {
      console.log('[Workshop] Socket disconnected');
      setConnected(false);
    };

    const handleOrderUpdate = (data) => {
      console.log('[Workshop] Real-time order update:', data);
      setOrders(prev => {
        const idx = prev.findIndex(o => o.id === data.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...data };
          return updated;
        }
        return prev;
      });
      addToast('info', 'Order Updated', `Order ${data.order_number || data.id} has been updated`);
    };

    const handleNewOrder = (order) => {
      console.log('[Workshop] New order received:', order);
      setOrders(prev => [transformOrder(order), ...prev]);
      addToast('success', 'New Order', `Order ${order.order_number} created`);
    };

    const handleStageUpdate = (data) => {
      console.log('[Workshop] Stage update:', data);
      setOrders(prev => prev.map(o => {
        if (o.id !== data.orderId) return o;
        const newStages = o.stages.map(s => 
          s.id === data.stageId ? { ...s, status: data.status, completedAt: data.completedAt ? new Date(data.completedAt) : null } : s
        );
        return { ...o, stages: newStages };
      }));
    };

    const handleMaterialUpdate = (data) => {
      console.log('[Workshop] Material update:', data);
      setMaterials(prev => prev.map(m => m.id === data.id ? { ...m, ...data } : m));
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('order:update', handleOrderUpdate);
    socket.on('order:created', handleNewOrder);
    socket.on('stage:update', handleStageUpdate);
    socket.on('material:update', handleMaterialUpdate);

    if (socketConnected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('order:update', handleOrderUpdate);
      socket.off('order:created', handleNewOrder);
      socket.off('stage:update', handleStageUpdate);
      socket.off('material:update', handleMaterialUpdate);
    };
  }, [socket, socketConnected]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersRes, materialsRes, workersRes] = await Promise.all([
        workshopService.getOrders(),
        workshopService.getMaterials(),
        workshopService.getWorkers(),
      ]);

      if (ordersRes.success && ordersRes.data) {
        const transformedOrders = ordersRes.data.map(transformOrder).filter(Boolean);
        setOrders(transformedOrders);
      }

      if (materialsRes.success && materialsRes.data) {
        const transformedMaterials = Array.isArray(materialsRes.data) ? materialsRes.data.map(transformMaterial) : [];
        setMaterials(transformedMaterials);
      }

      if (workersRes.success && workersRes.data) {
        const transformedWorkers = Array.isArray(workersRes.data) ? workersRes.data.map(transformWorker) : WORKERS;
        setWorkers(transformedWorkers);
      }

      // Generate initial activity from real orders
      if (ordersRes.success && ordersRes.data) {
        const initialActivity = [];
        const acts = ['completed Cutting stage for', 'started Upholstery on', 'passed Quality Check for', 'moved to Assembly for'];
        ordersRes.data.slice(0, 4).forEach((order, i) => {
          initialActivity.push({
            worker: transformedWorkers[i % transformedWorkers.length] || WORKERS[i % 8],
            action: acts[i % acts.length],
            coffin: transformOrder(order),
            time: new Date(Date.now() - i * 1800000),
            type: i % 2 === 0 ? 'success' : 'info',
          });
        });
        setActivity(initialActivity);
      }
    } catch (err) {
      console.error('[Workshop] Failed to load data:', err);
      setError('Failed to load workshop data. Please try again.');
      // Fallback to empty arrays
      setOrders([]);
      setMaterials([]);
      setWorkers(WORKERS);
    } finally {
      setLoading(false);
    }
  };

  const addToast = useCallback((type, title, msg) => {
    const id = ++tid.current;
    setToasts(p => [...p, { id, type, title, msg, out: false }]);
    setTimeout(() => setToasts(p => p.map(t => t.id === id ? { ...t, out: true } : t)), 3500);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  }, []);

  const openModal = useCallback((type, data = null) => setModal({ type, data }), []);
  const closeModal = useCallback(() => setModal({ type: null, data: null }), []);

  const createOrder = useCallback(async (cust, dec, type, pri, col, int, due) => {
    try {
      const orderData = {
        customer_name: cust,
        deceased_name: dec,
        coffin_type: type,
        priority: pri || 'normal',
        color: col || 'Walnut',
        interior_fabric: int || 'Satin Gold',
        due_date: due || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        selling_price: PRICES[type] || 20000,
        status: 'pending',
        current_stage: 'cutting',
      };

      const res = await workshopService.createOrder(orderData);
      if (res.success && res.data) {
        const newOrder = transformOrder(res.data);
        setOrders(p => [newOrder, ...p]);
        setActivity(a => [{ worker: workers[0], action: 'started new order', coffin: newOrder, time: new Date(), type: 'success' }, ...a]);
        addToast('success', 'New Order', newOrder.orderNumber + ' — ' + newOrder.coffinType);
        closeModal();
      } else {
        addToast('error', 'Error', res.error || 'Failed to create order');
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to create order');
    }
  }, [workers, addToast, closeModal]);

  const advanceStage = useCallback(async (oid) => {
    try {
      const order = orders.find(o => o.id === oid);
      if (!order) return;

      const currentIdx = STAGES.findIndex(s => s.id === order.currentStage);
      if (currentIdx >= STAGES.length - 1) {
        addToast('info', 'Info', 'Order already completed');
        return;
      }

      const nextStage = STAGES[currentIdx + 1];
      const res = await workshopService.completeStage(oid, nextStage.id);
      
      if (res.success) {
        setOrders(p => p.map(o => {
          if (o.id !== oid) return o;
          const newStages = o.stages.map(s => 
            s.id === o.currentStage ? { ...s, status: 'completed', completedAt: new Date() } : s
          );
          newStages.push({ ...nextStage, status: 'in_progress', startedAt: new Date(), completedAt: null });
          return { ...o, currentStage: nextStage.id, stages: newStages };
        }));
        addToast('success', 'Stage Advanced', `${order.orderNumber} moved to ${nextStage.label}`);
      } else {
        addToast('error', 'Error', res.error || 'Failed to advance stage');
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to advance stage');
    }
  }, [orders, addToast]);

  const reassignOrder = useCallback(async (oid) => {
    try {
      const w = workers[Math.floor(Math.random() * workers.length)];
      const res = await workshopService.assignWorkerToOrder(oid, { worker_id: w.id });
      if (res.success) {
        setOrders(p => p.map(o => o.id === oid ? { ...o, assignedWorker: w } : o));
        addToast('info', 'Reassigned', w.name + ' assigned to order');
      } else {
        addToast('error', 'Error', res.error || 'Failed to reassign');
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to reassign order');
    }
  }, [workers, addToast]);

  const removeOrder = useCallback(async (oid) => {
    try {
      const res = await workshopService.deleteOrder(oid);
      if (res.success) {
        setOrders(p => p.filter(o => o.id !== oid));
        addToast('info', 'Removed', 'Order removed');
        closeModal();
      } else {
        addToast('error', 'Error', res.error || 'Failed to delete order');
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to delete order');
    }
  }, [addToast, closeModal]);

  const restockMat = useCallback((mid) => {
    setMaterials(p => p.map(m => m.id === mid ? { ...m, quantity: m.quantity + m.minLevel * 2 } : m));
    addToast('success', 'Restocked', 'Material restocked');
  }, [addToast]);

  const addMaterial = useCallback(async (mat) => {
    try {
      const res = await workshopService.createMaterial({
        name: mat.name,
        category: mat.cat,
        unit: mat.unit,
        quantity: parseInt(mat.qty),
        min_stock_level: parseInt(mat.min) || 10,
        unit_price: parseInt(mat.cost) || 0,
        supplier: mat.sup || 'N/A',
      });
      if (res.success && res.data) {
        const newMat = transformMaterial(res.data);
        setMaterials(p => [...p, newMat]);
        addToast('success', 'Added', mat.name + ' added');
        closeModal();
      } else {
        addToast('error', 'Error', res.error || 'Failed to add material');
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to add material');
    }
  }, [addToast, closeModal]);

  const ctx = useMemo(() => ({
    orders, materials, workers, activity, toasts, loading, error, connected, addToast, openModal, closeModal,
    createOrder, advanceStage, reassignOrder, removeOrder, restockMat, addMaterial, refreshData: loadInitialData,
  }), [orders, materials, workers, activity, toasts, loading, error, connected, addToast, openModal, closeModal, createOrder, advanceStage, reassignOrder, removeOrder, restockMat, addMaterial, loadInitialData]);

  const tabs = { dashboard: DashboardTab, production: ProductionTab, leaderboard: LeaderboardTab, insights: InsightsTab, analytics: AnalyticsTab, workers: WorkersTab, materials: MaterialsTab };
  const Tab = tabs[tab] || DashboardTab;

  return (
    <Ctx.Provider value={ctx}>
      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
        <Toasts />
        <TopNav tab={tab} setTab={setTab} />
        <div style={{ padding: '1.25rem 1.5rem 3rem', maxWidth: 1400, margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: T.t3 }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem' }} />
              <div>Loading workshop data...</div>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: T.err }}>
              <i className="fas fa-exclamation-triangle" style={{ fontSize: '2rem', marginBottom: '1rem' }} />
              <div style={{ marginBottom: '1rem' }}>{error}</div>
              <button onClick={loadInitialData} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: `1px solid ${T.err}`, background: T.errBg, color: T.err, cursor: 'pointer' }}>
                Retry
              </button>
            </div>
          ) : (
            <Tab />
          )}
        </div>
        <ModalRouter type={modal.type} data={modal.data} close={closeModal} />
      </div>
    </Ctx.Provider>
  );
};

export default WorkshopDashboard;