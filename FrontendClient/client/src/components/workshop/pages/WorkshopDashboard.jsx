import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../utils/context/socketContext';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { Package, FlaskConical, Beaker, Droplets, Calendar, Loader2, Download, Gauge, ClipboardList, AlertTriangle, TrendingUp, Plus, Printer, FileImage, Server, Users, BarChart3, ChevronDown, Upload, Eye, Edit3, CheckCircle, XCircle, Clock, Hammer, Settings, Paintbrush, Search, Filter, ArrowUpDown, FileText, Image, Layers, Grid, List, RefreshCw, Trash2, Save, X, BarChart2, PieChart, Activity, Target, DollarSign, Trophy, Zap, TrendingDown, ArrowUp, Sun, Moon, Percent } from '../../utils/icons/icons';
import { workshopService } from '../services/workshopService';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Sub-components
import ProductionStatCard from '../components/ProductionStatCard';
import ActiveOrdersTable from '../components/ActiveOrdersTable';
import MaterialsInventory from '../components/MaterialsInventory';
import QuickActions from '../components/QuickActions';
import CreateOrderModal from '../components/CreateOrderModal';

const WorkshopDashboard = () => {
    // ============ STATE ============
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showNavDropdown, setShowNavDropdown] = useState(false);
    const [stats, setStats] = useState({
        activeOrders: 0, completedToday: 0, materialsInStock: 0,
        lowStockAlerts: 0, totalProduction: 0, efficiency: 0
    });
    const [orders, setOrders] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDesignModal, setShowDesignModal] = useState(false);
    const [showMaterialIntake, setShowMaterialIntake] = useState(false);
    const [showJobCardModal, setShowJobCardModal] = useState(false);
    const [showMaterialUsageModal, setShowMaterialUsageModal] = useState(false);
    const [showEditMaterialModal, setShowEditMaterialModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [materialUsageForm, setMaterialUsageForm] = useState({ material_id: '', quantity_used: '', notes: '' });
    const [pendingMaterials, setPendingMaterials] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [orderForm, setOrderForm] = useState({
        customer_name: '', customer_phone: '', customer_email: '',
        deceased_name: '', coffin_type: 'standard',
        selling_price: '', color: 'walnut', interior: 'satin_gold',
        delivery_date: '', due_date: '', priority: 'normal',
        dimensions: { length: '', width: '', height: '' },
        notes: '', instructions: '', branch_id: 1
    });
    const [materialForm, setMaterialForm] = useState({
        name: '', quantity: '', unit: 'pcs', min_stock_level: 10,
        category: 'wood', supplier: '', cost_per_unit: ''
    });
    const [designUpload, setDesignUpload] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [designs, setDesigns] = useState({});
    const [analyticsData, setAnalyticsData] = useState(null);
    const [analyticsPeriod, setAnalyticsPeriod] = useState('monthly');
    const [darkMode, setDarkMode] = useState(false);
    const { connected } = useSocket();

    // ============ DATA LOADING ============
    useEffect(() => { loadDashboardData(); }, []);

    const loadDashboardData = async () => {
        try {
            const [ordersRes, materialsRes, workersRes] = await Promise.all([
                workshopService.getOrders({}),
                workshopService.getMaterials(),
                workshopService.getWorkers()
            ]);
            if (ordersRes.success) {
                setOrders(ordersRes.data || []);
                setStats(prev => ({ ...prev, activeOrders: ordersRes.data?.length || 0 }));
            }
            if (materialsRes.success) {
                setMaterials(materialsRes.data || []);
                setStats(prev => ({ ...prev, materialsInStock: materialsRes.data?.length || 0 }));
                const lowStock = (materialsRes.data || []).filter(m => m.quantity <= (m.min_stock_level || 10));
                setStats(prev => ({ ...prev, lowStockAlerts: lowStock.length }));
            }
            if (workersRes.success) {
                setWorkers(workersRes.data || []);
                setStats(prev => ({ ...prev, totalProduction: workersRes.data?.length || 0 }));
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    // ============ SOCKET EVENTS ============
    useSocketEvents({
        onOrderCreated: (order) => {
            setOrders(prev => [order, ...prev]);
            setStats(prev => ({ ...prev, activeOrders: prev.activeOrders + 1 }));
        },
        onOrderUpdated: (updatedOrder) => {
            setOrders(prev => prev.map(order => order.id === updatedOrder.id ? updatedOrder : order));
        },
        onOrderCompleted: (data) => {
            setOrders(prev => prev.filter(order => order.id !== data.id));
            setStats(prev => ({
                ...prev,
                activeOrders: Math.max(0, prev.activeOrders - 1),
                completedToday: prev.completedToday + 1
            }));
        },
        onMaterialUsed: (usage) => {
            setMaterials(prev => prev.map(m => {
                if (m.id === usage.material_id) {
                    return { ...m, quantity: m.quantity - usage.quantity_used };
                }
                return m;
            }));
        },
        onMaterialLowStock: (material) => {
            setStats(prev => ({ ...prev, lowStockAlerts: prev.lowStockAlerts + 1 }));
        },
        onWorkerAssigned: (assignment) => {
            setOrders(prev => prev.map(order =>
                order.id === assignment.coffin_order_id
                    ? { ...order, assignments: [...(order.assignments || []), assignment] }
                    : order
            ));
        },
        onProductionStageStart: (stage) => {
            setOrders(prev => prev.map(order =>
                order.id === stage.coffin_order_id
                    ? { ...order, stages: order.stages?.map(s => s.id === stage.id ? stage : s) }
                    : order
            ));
        },
        onProductionStageDone: (stage) => {
            setOrders(prev => prev.map(order =>
                order.id === stage.coffin_order_id
                    ? { ...order, stages: order.stages?.map(s => s.id === stage.id ? stage : s) }
                    : order
            ));
        }
    });

    // ============ NAVIGATION ============
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Grid },
        { id: 'orders', label: 'Orders', icon: ClipboardList },
        { id: 'materials', label: 'Materials', icon: Package },
        { id: 'designs', label: 'Design Studio', icon: Image },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    // ============ HANDLERS ============
    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 1500);
    };

    const handleGenerateReport = () => {
        console.log('Generating report...');
    };

    const handleNewOrder = () => {
        setShowCreateModal(true);
    };

    const handlePrintJobCard = async (orderId) => {
        const order = orderId ? orders.find(o => o.id === orderId) : orders[0];
        if (!order) { alert('No orders available to print'); return; }
        generateSimpleJobCard(order);
    };

    const generateSimpleJobCard = (order) => {
        const win = window.open('', '_blank', 'width=800,height=1000');
        if (!win) return;
        let dimsDisplay = 'Standard';
        if (order.dimensions) {
            try {
                const dims = typeof order.dimensions === 'string' ? JSON.parse(order.dimensions) : order.dimensions;
                if (dims && typeof dims === 'object') {
                    dimsDisplay = `${dims.length || ''} x ${dims.width || ''} x ${dims.height || ''}`;
                } else if (typeof order.dimensions === 'string') {
                    dimsDisplay = order.dimensions;
                }
            } catch (e) { dimsDisplay = order.dimensions; }
        }
        const barcodeText = (order.order_number || `ORD${order.id}`).toUpperCase().replace(/[^A-Z0-9-.\s]/g, '');
        const barcode = `*${barcodeText}*`;
        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
        win.document.write(`
            <html><head>
                <title>Job Card - ${order.order_number || order.id}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap');
                    @page { size: A4; margin: 10mm; }
                    body { font-family: 'Courier New', monospace; padding: 15px; background: #fff; color: #000; font-size: 11px; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px; }
                    .company-name { font-size: 18px; font-weight: bold; letter-spacing: 1px; }
                    .document-title { font-size: 14px; font-weight: bold; text-decoration: underline; margin-top: 4px; }
                    .section { margin: 8px 0; border: 1.5px solid #000; padding: 8px; page-break-inside: avoid; }
                    .section-title { font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; background: #000; color: #fff; padding: 3px 6px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
                    .info-row { margin: 3px 0; font-size: 11px; }
                    .label { font-weight: bold; text-transform: uppercase; font-size: 9px; }
                    .value { margin-left: 3px; }
                    .highlight { background: #ffff00; padding: 1px 3px; font-weight: bold; }
                    .stages-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: 6px; }
                    .stage-box { border: 1.5px solid #000; padding: 4px; text-align: center; font-size: 9px; font-weight: bold; }
                    .bottom-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10px; page-break-inside: avoid; }
                    .workshop-info { font-size: 9px; line-height: 1.4; }
                    .signature-line { border-top: 1.5px solid #000; width: 200px; padding-top: 3px; margin-top: 30px; font-size: 9px; text-align: center; }
                    .barcode { text-align: center; font-family: 'Libre Barcode 39', cursive; font-size: 28px; letter-spacing: 2px; padding: 4px; border: 1.5px solid #000; display: inline-block; margin: 0 auto; }
                    .barcode-wrap { text-align: center; margin: 6px 0; }
                    .footer { margin-top: 10px; border-top: 1.5px solid #000; padding-top: 6px; font-size: 8px; text-align: center; }
                    .priority-urgent { background: #ff0000; color: #fff; padding: 2px 6px; font-weight: bold; display: inline-block; font-size: 10px; }
                    .priority-high { background: #ff9900; color: #000; padding: 2px 6px; font-weight: bold; display: inline-block; font-size: 10px; }
                    @media print { body { padding: 0; } .no-print { display: none; } }
                </style>
            </head><body>
                <div class="no-print" style="text-align: center; margin-bottom: 10px;">
                    <button onclick="window.print()" style="padding: 8px 16px; font-size: 14px; cursor: pointer;">🖨️ Print Job Card</button>
                </div>
                <div class="header">
                    <div class="company-name">DONHOLM FUNERAL HOME</div>
                    <div style="font-size: 10px; letter-spacing: 1px;">WORKSHOP PRODUCTION CONTROL</div>
                    <div class="document-title">JOB CARD</div>
                </div>
                <div class="section">
                    <div class="section-title">Order Information</div>
                    <div class="info-grid">
                        <div class="info-row"><span class="label">Order #:</span><span class="value highlight">${order.order_number || order.id}</span></div>
                        <div class="info-row"><span class="label">Priority:</span><span class="value ${order.priority === 'urgent' ? 'priority-urgent' : order.priority === 'high' ? 'priority-high' : ''}">${(order.priority || 'NORMAL').toUpperCase()}</span></div>
                        <div class="info-row"><span class="label">Customer:</span><span class="value">${order.customer_name || 'N/A'}</span></div>
                        <div class="info-row"><span class="label">Deceased:</span><span class="value">${order.deceased_name || 'N/A'}</span></div>
                        <div class="info-row"><span class="label">Coffin Type:</span><span class="value">${order.coffin_type || 'Standard'}</span></div>
                        <div class="info-row"><span class="label">Status:</span><span class="value">${(order.status || 'PENDING').toUpperCase()}</span></div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Specifications</div>
                    <div class="info-grid">
                        <div class="info-row"><span class="label">Color/Finish:</span><span class="value">${order.color || order.color_finish || 'N/A'}</span></div>
                        <div class="info-row"><span class="label">Interior:</span><span class="value">${order.interior_fabric || order.interior || 'N/A'}</span></div>
                        <div class="info-row"><span class="label">Dimensions:</span><span class="value">${dimsDisplay}</span></div>
                        <div class="info-row"><span class="label">Selling Price:</span><span class="value">KES ${order.selling_price ? Number(order.selling_price).toLocaleString() : '0'}</span></div>
                    </div>
                    ${order.instructions ? `<div style="margin-top:6px;padding:4px;background:#ffff00;border:1.5px solid #000;font-size:10px;"><span class="label">Instructions:</span><div style="margin-top:3px;font-weight:bold;">${order.instructions}</div></div>` : ''}
                </div>
                <div class="section">
                    <div class="section-title">Schedule</div>
                    <div class="info-grid">
                        <div class="info-row"><span class="label">Created:</span><span class="value">${order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}</span></div>
                        <div class="info-row"><span class="label">Due Date:</span><span class="value">${order.due_date ? new Date(order.due_date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}</span></div>
                        <div class="info-row"><span class="label">Delivery:</span><span class="value">${order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'N/A'}</span></div>
                        <div class="info-row"><span class="label">Branch:</span><span class="value">${order.branch_id || 1}</span></div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Production Stages</div>
                    <div class="stages-grid">
                        ${['Design', 'Cutting', 'Assembly', 'Polishing', 'Finishing', 'Quality Check', 'Delivery'].map(stage => {
            const stageData = order.stages?.find(s => s.stage?.toLowerCase() === stage.toLowerCase());
            const stageStatus = stageData?.status || 'pending';
            const isCompleted = stageStatus === 'completed';
            const isInProgress = stageStatus === 'in_progress';
            return `<div class="stage-box ${isCompleted ? 'stage-completed' : isInProgress ? 'stage-in-progress' : 'stage-pending'}">
                                ${stage}<div style="font-size:7px;margin-top:2px;text-transform:uppercase;color:${isCompleted ? '#16a34a' : isInProgress ? '#2563eb' : '#94a3b8'}">
                                    ${isCompleted ? '✓ DONE' : isInProgress ? '● IN PROGRESS' : '○ PENDING'}</div></div>`;
        }).join('')}
                    </div>
                </div>
                <div class="barcode-wrap"><div class="barcode">${barcode}</div></div>
                <div class="bottom-section">
                    <div class="workshop-info"><strong>Workshop Info:</strong><br>${order.assigned_worker ? `Assigned: ${order.assigned_worker}<br>` : ''}${order.created_at ? `Date: ${new Date(order.created_at).toLocaleDateString()}` : ''}</div>
                    <div><div class="label">Authorized By:</div><div class="signature-line">Signature & Date</div></div>
                </div>
                <div class="footer"><div><strong>DONHOLM FUNERAL HOME</strong> — Workshop Management System</div><div>Printed: ${timestamp}</div></div>
                <script>window.print();</script>
            </body></html>
        `);
        win.document.close();
    };

    const handleAddToPendingMaterials = () => {
        if (!materialUsageForm.material_id || !materialUsageForm.quantity_used) {
            alert('Please select a material and enter quantity');
            return;
        }
        const material = materials.find(m => m.id === parseInt(materialUsageForm.material_id));
        setPendingMaterials(prev => [...prev, {
            material_id: parseInt(materialUsageForm.material_id),
            material_name: material?.name || `Material #${materialUsageForm.material_id}`,
            quantity_used: parseFloat(materialUsageForm.quantity_used),
            unit: material?.unit || 'units',
            notes: materialUsageForm.notes
        }]);
        setMaterialUsageForm({ material_id: '', quantity_used: '', notes: '' });
    };

    const handleRemovePendingMaterial = (index) => {
        setPendingMaterials(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveAllPendingMaterials = async () => {
        if (pendingMaterials.length === 0) { alert('No materials to save'); return; }
        try {
            for (const mat of pendingMaterials) {
                await workshopService.useMaterial({
                    coffin_order_id: selectedOrder.id, material_id: mat.material_id,
                    quantity_used: mat.quantity_used, notes: mat.notes
                });
            }
            alert(`${pendingMaterials.length} material(s) recorded successfully!`);
            setPendingMaterials([]);
            setMaterialUsageForm({ material_id: '', quantity_used: '', notes: '' });
            const orderRes = await workshopService.getOrder(selectedOrder.id);
            if (orderRes.success) setSelectedOrder(orderRes.data);
            loadDashboardData();
        } catch (error) {
            console.error('Failed to record materials:', error);
            alert('Some materials may not have been saved');
        }
    };

    const handleOpenMaterialUsage = (order) => {
        setSelectedOrder(order);
        workshopService.getOrder(order.id).then(res => {
            if (res.success) setSelectedOrder(res.data);
        });
        setShowMaterialUsageModal(true);
    };

    const handleDesignStudio = (order) => {
        if (order) { setSelectedOrder(order); setShowDesignModal(true); }
        else { setActiveTab('designs'); }
    };

    const handleDesignUpload = async () => {
        if (!selectedOrder || !designUpload) { alert('Please select an order and upload a design'); return; }
        try {
            const formData = new FormData();
            formData.append('design', designUpload);
            formData.append('order_id', selectedOrder.id);
            const res = await workshopService.saveDesign(selectedOrder.id, formData);
            if (res.success) { alert('Design uploaded successfully!'); setShowDesignModal(false); setDesignUpload(null); }
            else { alert('Failed to upload design: ' + res.error); }
        } catch (error) {
            console.error('Failed to upload design:', error);
            alert('Design saved locally (API not available)');
            setShowDesignModal(false);
        }
    };

    const handleEditMaterial = (material) => {
        setEditingMaterial(material);
        setMaterialForm({
            name: material.name, quantity: material.quantity.toString(), unit: material.unit || 'pcs',
            min_stock_level: (material.min_stock_level || 10).toString(), category: material.category || 'wood',
            supplier: material.supplier || '', cost_per_unit: (material.unit_price || 0).toString()
        });
        setShowEditMaterialModal(true);
    };

    const handleUpdateMaterial = async () => {
        if (!editingMaterial || !materialForm.name || !materialForm.quantity) { alert('Please fill in material name and quantity'); return; }
        try {
            const res = await workshopService.updateMaterial(editingMaterial.id, {
                name: materialForm.name, quantity: parseFloat(materialForm.quantity), unit: materialForm.unit,
                min_stock_level: parseFloat(materialForm.min_stock_level), category: materialForm.category,
                supplier: materialForm.supplier, cost_per_unit: parseFloat(materialForm.cost_per_unit) || 0
            });
            if (res.success) {
                alert('Material updated successfully!'); setShowEditMaterialModal(false); setEditingMaterial(null);
                setMaterialForm({ name: '', quantity: '', unit: 'pcs', min_stock_level: 10, category: 'wood', supplier: '', cost_per_unit: '' });
                loadDashboardData();
            } else { alert('Failed to update material: ' + res.error); }
        } catch (error) {
            console.error('Failed to update material:', error);
            alert('Material updated locally'); setShowEditMaterialModal(false); loadDashboardData();
        }
    };

    const handleMaterialIntake = () => { setShowMaterialIntake(true); };

    const handleAddMaterial = async () => {
        if (!materialForm.name || !materialForm.quantity) { alert('Please fill in material name and quantity'); return; }
        try {
            const res = await workshopService.createMaterial({
                name: materialForm.name, quantity: parseInt(materialForm.quantity), unit: materialForm.unit,
                min_stock_level: parseInt(materialForm.min_stock_level), category: materialForm.category,
                supplier: materialForm.supplier, cost_per_unit: parseFloat(materialForm.cost_per_unit) || 0
            });
            if (res.success) {
                alert('Material added successfully!'); setShowMaterialIntake(false);
                setMaterialForm({ name: '', quantity: '', unit: 'pcs', min_stock_level: 10, category: 'wood', supplier: '', cost_per_unit: '' });
                loadDashboardData();
            } else { alert('Failed to add material: ' + res.error); }
        } catch (error) {
            console.error('Failed to add material:', error);
            alert('Material added locally (API not available)'); setShowMaterialIntake(false); loadDashboardData();
        }
    };

    const handleAssignWorker = async (orderId) => {
        const order = orderId ? orders.find(o => o.id === orderId) : orders[0];
        if (!order) { alert('No active orders to assign workers to'); return; }
        if (workers.length === 0) { alert('No workers available. Add workers first.'); return; }
        const workerNames = workers.map(w => `${w.id}: ${w.first_name} ${w.last_name} - ${w.role}`).join('\n');
        const workerId = prompt(`Assign worker to order #${order.order_number || order.id}\n\nAvailable workers:\n${workerNames}\n\nEnter worker ID:`);
        if (!workerId) return;
        const stage = prompt('Enter stage (design, cutting, assembly, polishing, finishing, quality_check):');
        if (!stage) return;
        try {
            const res = await workshopService.assignWorkerToOrder(order.id, { worker_id: parseInt(workerId), stage, notes: 'Assigned from quick actions' });
            if (res.success) { alert('Worker assigned successfully!'); loadDashboardData(); }
            else { alert('Failed to assign worker: ' + res.error); }
        } catch (error) { console.error('Failed to assign worker:', error); alert('Failed to assign worker'); }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        let updateData = { status: newStatus };
        if (newStatus === 'on_hold') { const reason = prompt('Reason for holding this order:'); if (!reason) return; updateData.hold_reason = reason; }
        try {
            const res = await workshopService.updateOrder(orderId, updateData);
            if (res.success) { alert(`Order status updated to: ${newStatus}`); loadDashboardData(); }
            else { alert('Failed to update status: ' + res.error); }
        } catch (error) {
            console.error('Failed to update status:', error);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, hold_reason: updateData.hold_reason } : o));
            alert('Status updated locally');
        }
    };

    const handleQRLabels = () => {
        if (orders.length === 0) { alert('No orders available for QR labels'); return; }
        console.log('QR Labels Data:', orders.map(o => ({ order_number: o.order_number || `#${o.id}`, customer: o.customer_name, deceased: o.deceased_name, status: o.status })));
        alert(`QR Labels generated for ${orders.length} orders!\n\nCheck console for QR data.`);
    };

    const handleAnalytics = () => { setActiveTab('analytics'); };

    // ============ Load Designs ============
    useEffect(() => { if (activeTab === 'designs') loadAllDesigns(); }, [activeTab, orders]);

    const loadAllDesigns = async () => {
        const designsMap = {};
        for (const order of orders) {
            try {
                const res = await workshopService.getDesign(order.id);
                if (res.success && res.data) designsMap[order.id] = Array.isArray(res.data) ? res.data : [res.data];
            } catch (e) { }
        }
        setDesigns(designsMap);
    };

    // ============ Load Analytics ============
    useEffect(() => { if (activeTab === 'analytics') loadAnalyticsData(); }, [activeTab, analyticsPeriod]);

    const loadAnalyticsData = async () => {
        try {
            const params = {
                year: new Date().getFullYear()
            };
            const res = await workshopService.getMonthlyAnalytics(params);
            if (res.success && res.data && typeof res.data === 'object') {
                setAnalyticsData({
                    monthly_orders: Array.isArray(res.data.monthly_orders) ? res.data.monthly_orders : [],
                    weekly_orders: Array.isArray(res.data.weekly_orders) ? res.data.weekly_orders : [],
                    coffin_types: Array.isArray(res.data.coffin_types) ? res.data.coffin_types : [],
                    top_materials: Array.isArray(res.data.top_materials) ? res.data.top_materials : [],
                    monthly_materials: Array.isArray(res.data.monthly_materials) ? res.data.monthly_materials : [],
                    stage_completion: Array.isArray(res.data.stage_completion) ? res.data.stage_completion : [],
                    total_stats: res.data.total_stats || { total_orders: 0, completed_orders: 0, total_revenue: 0, total_cost: 0 },
                    worker_count: res.data.worker_count || 0,
                    materials_total_value: res.data.materials_total_value || 0
                });
            }
        } catch (e) {
            console.warn('Analytics data not available:', e);
            setAnalyticsData({ monthly_orders: [], weekly_orders: [], coffin_types: [], top_materials: [], monthly_materials: [], stage_completion: [], total_stats: { total_orders: 0, completed_orders: 0, total_revenue: 0, total_cost: 0 }, worker_count: 0, materials_total_value: 0 });
        }
    };

    // ============ FILTERED DATA ============
    const filteredOrders = orders.filter(order => {
        const matchesSearch = !searchQuery ||
            (order.order_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.deceased_name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const productionStages = [
        { id: 'design', label: 'Design', color: '#8b5cf6' },
        { id: 'cutting', label: 'Cutting', color: '#ef4444' },
        { id: 'assembly', label: 'Assembly', color: '#f97316' },
        { id: 'polishing', label: 'Polishing', color: '#facc15' },
        { id: 'finishing', label: 'Finishing', color: '#22c55e' },
        { id: 'quality_check', label: 'Quality Check', color: '#3b82f6' },
        { id: 'delivery', label: 'Delivery', color: '#14b8a6' },
    ];

    const getStageIndex = (order) => {
        if (order.status === 'completed') return productionStages.length - 1;
        if (order.status === 'on_hold') return 1;
        if (order.status === 'pending') return 0;

        const orderStages = order.stages || [];
        const inProgress = orderStages.find(s => s.status === 'in_progress' || s.status === 'in-production');
        if (inProgress) {
            const idx = productionStages.findIndex(stage => stage.id === (inProgress.stage || '').toLowerCase());
            return idx >= 0 ? idx : 2;
        }

        const completedStages = orderStages
            .filter(s => s.status === 'completed')
            .map(s => productionStages.findIndex(stage => stage.id === (s.stage || '').toLowerCase()))
            .filter(i => i >= 0);
        if (completedStages.length > 0) {
            return Math.min(Math.max(...completedStages) + 1, productionStages.length - 1);
        }

        return order.status === 'in_progress' ? 2 : 0;
    };

    const getOrderCardStyle = (order) => {
        if (order.priority === 'urgent') {
            return { background: 'linear-gradient(180deg, #fef2f2 0%, #fee2e2 100%)', border: '1px solid #f87171', color: '#991b1b' };
        }
        if (order.priority === 'high') {
            return { background: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #fbbf24', color: '#92400e' };
        }
        if (order.status === 'completed') {
            return { background: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #4ade80', color: '#065f46' };
        }
        if (order.status === 'on_hold') {
            return { background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)', border: '1px solid #94a3b8', color: '#334155' };
        }
        return { background: 'linear-gradient(180deg, #ffffff 0%, #eff6ff 100%)', border: '1px solid rgba(56, 189, 248, 0.16)', color: '#0f172a' };
    };

    const getOrderStageLabel = (order) => {
        const idx = getStageIndex(order);
        return productionStages[idx]?.label || 'Production';
    };

    const renderOrderStages = (order) => {
        const activeIndex = getStageIndex(order);
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem' }}>
                {productionStages.map((stage, idx) => {
                    const completed = idx < activeIndex;
                    const active = idx === activeIndex;
                    const style = {
                        padding: '0.35rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: completed || active ? '#ffffff' : '#475569',
                        background: completed ? stage.color : active ? stage.color + 'cc' : '#f1f5f9',
                        border: active ? `1px solid ${stage.color}` : '1px solid transparent',
                    };
                    return <span key={stage.id} style={style}>{stage.label}</span>;
                })}
            </div>
        );
    };

    const getOrderBadge = (order) => {
        if (order.priority === 'urgent') return <span className="badge badge-red">URGENT</span>;
        if (order.priority === 'high') return <span className="badge badge-orange">HIGH</span>;
        if (order.status === 'completed') return <span className="badge badge-green">COMPLETED</span>;
        if (order.status === 'on_hold') return <span className="badge badge-yellow">ON HOLD</span>;
        return <span className="badge badge-blue">NORMAL</span>;
    };

    // ============ CHART DATA ============
    const statusChartData = {
        labels: ['Pending', 'In Progress', 'Completed', 'On Hold'],
        datasets: [{
            data: ['pending', 'in_progress', 'completed', 'on_hold'].map(s => orders.filter(o => o.status === s).length),
            backgroundColor: ['#f1c40f', '#3498db', '#27ae60', '#e74c3c'],
            borderWidth: 0
        }]
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyOrders = analyticsData?.monthly_orders || [];
    const weeklyOrders = analyticsData?.weekly_orders || [];
    const periodOrders = analyticsPeriod === 'weekly' ? weeklyOrders : monthlyOrders;
    const periodLabels = periodOrders.map(item => {
        if (analyticsPeriod === 'weekly') return `W${item.week}`;
        return monthNames[(item.month || 1) - 1] || 'N/A';
    });
    const periodTotalOrders = periodOrders.reduce((sum, item) => sum + (item.total_orders || 0), 0);
    const periodTotalRevenue = periodOrders.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const periodTitle = analyticsPeriod === 'weekly' ? 'Weekly Orders' : analyticsPeriod === 'yearly' ? 'Yearly Orders' : 'Monthly Orders';

    const totalOrders = analyticsData?.total_stats?.total_orders ?? orders.length;
    const completedOrders = analyticsData?.total_stats?.completed_orders ?? orders.filter(o => o.status === 'completed').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const inProgress = orders.filter(o => o.status === 'in_progress').length;
    const activeOrderCount = orders.filter(o => !['completed', 'delivered'].includes(o.status)).length;
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
    const workerCount = analyticsData?.worker_count ?? workers.length;
    const totalInventoryValue = analyticsData?.materials_total_value ?? materials.reduce((acc, m) => acc + (parseFloat(m.unit_price) || 0) * (parseFloat(m.quantity) || 0), 0);
    const totalMaterialTypes = materials.length;
    const completedTodayFromOrders = orders.filter(o => o.status === 'completed' && ((o.completed_at || o.updated_at || o.order_date || '').toString().startsWith(new Date().toISOString().slice(0, 10)))).length;
    const completedToday = completedTodayFromOrders || stats.completedToday;

    const periodOrdersChart = {
        labels: periodLabels,
        datasets: [
            { label: 'Total Orders', data: periodOrders.map(item => item.total_orders || 0), backgroundColor: '#3498db', borderRadius: 6 },
            { label: 'Completed', data: periodOrders.map(item => item.completed || 0), backgroundColor: '#27ae60', borderRadius: 6 }
        ]
    };

    const monthlyRevenueChart = {
        labels: periodLabels,
        datasets: [{
            label: 'Revenue (KES)',
            data: periodOrders.map(item => item.revenue || 0),
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22,163,74,0.15)',
            fill: true,
            tension: 0.4
        }]
    };

    const coffinTypes = analyticsData?.coffin_types || [];
    const coffinTypeChart = {
        labels: coffinTypes.map(c => c.coffin_type || c.type || 'Unknown'),
        datasets: [{
            data: coffinTypes.map(c => c.count || 0),
            backgroundColor: ['#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#2c3e50'],
            borderWidth: 0
        }]
    };

    const topMaterials = analyticsData?.top_materials || [];
    const topMaterialsChart = {
        labels: topMaterials.map(m => m.name || 'Unknown'),
        datasets: [{
            label: 'Quantity Used',
            data: topMaterials.map(m => m.total_used || 0),
            backgroundColor: '#e67e22',
            borderRadius: 6
        }]
    };

    const stageCompletion = analyticsData?.stage_completion || [];
    const stageCompletionChart = {
        labels: stageCompletion.map(item => item.stage || item.label || 'Stage'),
        datasets: [{
            label: 'Avg Hours',
            data: stageCompletion.map(item => item.avg_hours || item.avg_hours_per_task || 0),
            backgroundColor: stageCompletion.map((_, idx) => ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#14b8a6'][idx % 6]),
            borderRadius: 6
        }]
    };

    const monthlyMaterials = analyticsData?.monthly_materials || [];
    const materialUsageByMonth = monthlyMaterials.reduce((acc, item) => {
        const monthIndex = (item.month || 1) - 1;
        const monthKey = monthNames[monthIndex] || 'N/A';
        acc[monthKey] = (acc[monthKey] || 0) + (item.total_used || 0);
        return acc;
    }, {});
    const materialUsageLabels = Object.keys(materialUsageByMonth);
    const materialUsageChart = {
        labels: materialUsageLabels,
        datasets: [{
            label: 'Material Usage',
            data: materialUsageLabels.map(key => materialUsageByMonth[key]),
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139,92,246,0.15)',
            fill: true,
            tension: 0.35,
            pointRadius: 3
        }]
    };

    // ============ RENDER FUNCTIONS ============
    const renderDashboard = () => (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <ProductionStatCard label="Active Orders" value={activeOrderCount.toString()} unit="in production" icon={ClipboardList}
                    cardStyle={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #e2e8f0' }}
                    labelColor="#cbd5e1" textColor="#f8fafc" unitColor="#e2e8f0" iconColor="#f8fafc" accent="rgba(248,250,252,0.16)" />
                <ProductionStatCard label="Completed Today" value={completedToday.toString()} unit="orders" icon={TrendingUp}
                    cardStyle={{ background: '#064e3b', color: '#ecfdf5', border: '1px solid #10b981' }}
                    labelColor="#a7f3d0" textColor="#ecfdf5" unitColor="#d1fae5" iconColor="#ecfdf5" accent="rgba(16,185,129,0.16)" />
                <ProductionStatCard label="Materials In Stock" value={stats.materialsInStock.toString()} unit="items" icon={Package}
                    cardStyle={{ background: '#111827', color: '#f8fafc', border: '1px solid #94a3b8' }}
                    labelColor="#cbd5e1" textColor="#f8fafc" unitColor="#d1d5db" iconColor="#f8fafc" accent="rgba(148,163,184,0.16)" />
                <ProductionStatCard label="Low Stock Alerts" value={stats.lowStockAlerts.toString()} unit="need reorder" icon={AlertTriangle}
                    cardStyle={{ background: '#7f1d1d', color: '#fef2f2', border: '1px solid #fca5a5' }}
                    labelColor="#fecaca" textColor="#fef2f2" unitColor="#f8d7da" iconColor="#fef2f2" accent="rgba(254,202,202,0.18)" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem' }}>
                <ActiveOrdersTable orders={orders} onViewOrder={(id) => { setSelectedOrder(orders.find(o => o.id === id)); setShowJobCardModal(true); }} onDownloadPDF={(id) => handlePrintJobCard(id)} onViewAll={() => setActiveTab('orders')} />
                <QuickActions onNewOrder={handleNewOrder} onPrintJobCard={() => handlePrintJobCard()} onDesignStudio={() => handleDesignStudio()} onStockIntake={handleMaterialIntake} onAssignWorker={() => handleAssignWorker()} onViewDetails={() => { if (orders.length > 0) { setSelectedOrder(orders[0]); setShowJobCardModal(true); } }} onAnalytics={handleAnalytics} />
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <MaterialsInventory materials={materials} />
            </div>
        </>
    );

    const renderOrders = () => (
        <div style={{ background: 'rgba(255,255,255,0.96)', padding: '1rem', borderRadius: '18px', boxShadow: '0 12px 32px rgba(15,23,42,0.06)', border: '1px solid rgba(148,163,184,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div><h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>All Orders</h3><span className="text-muted text-sm">{filteredOrders.length} orders found</span></div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input type="text" placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '0.5rem 0.5rem 0.5rem 2rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', width: '200px' }} />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="on_hold">On Hold</option>
                    </select>
                    <button className="btn btn-outline text-sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>{viewMode === 'grid' ? <List size={14} /> : <Grid size={14} />}</button>
                    <button className="btn btn-dark text-sm" onClick={handleNewOrder}><Plus size={14} /> New Order</button>
                </div>
            </div>
            {viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {filteredOrders.map(order => {
                        const orderCardStyle = getOrderCardStyle(order);
                        return (
                            <div key={order.id} style={{ ...orderCardStyle, borderRadius: '16px', padding: '1.35rem', transition: 'all 0.2s', cursor: 'pointer' }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 30px rgba(15,23,42,0.14)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <div>
                                        <span style={{ display: 'inline-block', fontWeight: 700, color: orderCardStyle.color, fontSize: '1rem' }}>#{order.order_number || order.id}</span>
                                        <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: orderCardStyle.color, opacity: 0.8 }}>{order.customer_name || 'N/A'} • {order.coffin_type || 'Standard'}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        {getOrderBadge(order)}
                                        <span className={`badge ${order.status === 'completed' ? 'badge-green' : order.status === 'in_progress' ? 'badge-blue' : order.status === 'on_hold' ? 'badge-yellow' : 'badge-orange'}`}
                                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}>{(order.status || 'Pending').replace(/_/g, ' ').toUpperCase()}</span>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.92rem', lineHeight: 1.5, color: orderCardStyle.color, opacity: 0.9 }}>
                                    <div><strong>Deceased:</strong> {order.deceased_name || 'N/A'}</div>
                                    <div><strong>Delivery:</strong> {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'TBD'}</div>
                                </div>
                                {renderOrderStages(order)}
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <button className="btn btn-outline text-xs" onClick={() => handlePrintJobCard(order.id)}><Printer size={12} /> Print</button>
                                    <button className="btn btn-outline text-xs" onClick={() => handleDesignStudio(order)}><Image size={12} /> Design</button>
                                    <button className="btn btn-outline text-xs" onClick={() => handleAssignWorker(order.id)}><Users size={12} /> Assign</button>
                                    <select value={order.status || 'pending'} onChange={(e) => handleUpdateStatus(order.id, e.target.value)} style={{ padding: '0.35rem 0.65rem', border: '1px solid rgba(148,163,184,0.35)', borderRadius: '10px', fontSize: '0.75rem', flex: '1', minWidth: '140px' }}>
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="on_hold">On Hold</option>
                                    </select>
                                </div>
                            </div>
                        );
                    })}
                    {filteredOrders.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            <ClipboardList size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                            <h4>Active Production Queue</h4>
                            <p>No orders yet. Create your first coffin order to start production.</p>
                            <button className="btn btn-dark" onClick={handleNewOrder}><Plus size={14} /> Create Order</button>
                        </div>
                    )}
                </div>
            ) : (
                <table className="data-table">
                    <thead><tr><th>Order #</th><th>Customer</th><th>Deceased</th><th>Type</th><th>Stage</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>{filteredOrders.map(order => (
                        <tr key={order.id}>
                            <td style={{ fontWeight: 600, color: '#3498db' }}>#{order.order_number || order.id}</td>
                            <td>{order.customer_name || 'N/A'}</td>
                            <td>{order.deceased_name || 'N/A'}</td>
                            <td>{order.coffin_type || 'Standard'}</td>
                            <td><span style={{ display: 'inline-flex', padding: '0.35rem 0.7rem', borderRadius: '999px', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, fontSize: '0.75rem' }}>{getOrderStageLabel(order)}</span></td>
                            <td><span className={`badge ${order.status === 'completed' ? 'badge-green' : order.status === 'in_progress' ? 'badge-blue' : 'badge-yellow'}`}>{order.status || 'Pending'}</span></td>
                            <td><div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button className="btn btn-outline text-xs" onClick={() => handlePrintJobCard(order.id)} title="Print Job Card"><Printer size={12} /></button>
                                <button className="btn btn-outline text-xs" onClick={() => handleDesignStudio(order)} title="Upload Design"><Image size={12} /></button>
                                <button className="btn btn-outline text-xs" onClick={() => handleAssignWorker(order.id)} title="Assign Worker"><Users size={12} /></button>
                                <select value={order.status || 'pending'} onChange={(e) => handleUpdateStatus(order.id, e.target.value)} style={{ padding: '0.25rem 0.4rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.75rem' }}>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="on_hold">On Hold</option>
                                </select>
                            </div></td>
                        </tr>
                    ))}</tbody>
                </table>
            )}
        </div>
    );

    const renderMaterials = () => (
        <div style={{ background: 'rgba(255,255,255,0.96)', padding: '1rem', borderRadius: '18px', boxShadow: '0 12px 32px rgba(15,23,42,0.06)', border: '1px solid rgba(148,163,184,0.12)' }}>
            <MaterialsInventory materials={materials} />
        </div>
    );

    const renderDesigns = () => {
        const ordersWithDesigns = orders.filter(order => designs[order.id] && designs[order.id].length > 0);
        const allDesigns = [];
        ordersWithDesigns.forEach(order => {
            const orderDesigns = designs[order.id] || [];
            orderDesigns.forEach((design, index) => {
                allDesigns.push({ ...design, orderId: order.id, orderNumber: order.order_number || `#${order.id}`, customerName: order.customer_name || 'N/A', deceasedName: order.deceased_name || 'N/A', isLatest: index === orderDesigns.length - 1 });
            });
        });
        return (
            <div style={{ background: 'rgba(255,255,255,0.96)', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 14px 40px rgba(15,23,42,0.06)', border: '1px solid rgba(148,163,184,0.12)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div><h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Design Studio</h3><span className="text-muted text-sm">{allDesigns.length > 0 ? `${allDesigns.length} design(s) across ${ordersWithDesigns.length} order(s)` : 'No designs uploaded yet'}</span></div>
                </div>
                {allDesigns.length > 0 ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {allDesigns.map((design, idx) => (
                                <div key={`${design.orderId}-${design.id || idx}`} style={{ border: design.isLatest ? '2px solid #16a34a' : '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', background: design.isLatest ? '#f0fdf4' : '#fff', position: 'relative' }}>
                                    {design.isLatest && <div style={{ position: 'absolute', top: '-8px', right: '8px', background: '#16a34a', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 600 }}>LATEST</div>}
                                    <div style={{ width: '100%', height: '200px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #e2e8f0', marginBottom: '0.75rem', overflow: 'hidden', cursor: 'pointer' }} onClick={() => { if (design.design_files) window.open(design.design_files, '_blank'); }}>
                                        {design.design_files ? <img src={design.design_files} alt="Design" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : design.design_name ? <div style={{ textAlign: 'center', padding: '1rem' }}><FileImage size={48} style={{ color: '#3498db', margin: '0 auto 0.5rem' }} /><div style={{ fontWeight: 600, color: '#2c3e50', marginTop: '0.5rem' }}>{design.design_name}</div>{design.description && <div className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>{design.description}</div>}</div> : <div style={{ textAlign: 'center', color: '#94a3b8' }}><CheckCircle size={32} style={{ margin: '0 auto 0.5rem' }} /><div className="text-xs">Design saved</div></div>}
                                    </div>
                                    <div style={{ marginBottom: '0.5rem' }}><div style={{ fontWeight: 700, color: '#3498db', fontSize: '0.95rem' }}>#{design.orderNumber}</div><div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{design.customer_name || design.customerName || 'N/A'}</div>{design.deceased_name && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Deceased: {design.deceased_name}</div>}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem', padding: '0.4rem', background: '#f8fafc', borderRadius: '4px' }}>{design.created_at && <div>Uploaded: {new Date(design.created_at).toLocaleString()}</div>}{design.status && <div style={{ marginTop: '2px' }}>Status: <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{design.status}</span></div>}</div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}><button className="btn btn-dark text-xs" style={{ flex: 1 }} onClick={() => { setSelectedOrder(orders.find(o => o.id === design.orderId)); setShowDesignModal(true); }}><Upload size={12} /> Update</button><button className="btn btn-outline text-xs" onClick={() => handlePrintJobCard(design.orderId)}><Printer size={12} /></button></div>
                                </div>
                            ))}
                        </div>
                        {orders.filter(order => !designs[order.id] || designs[order.id].length === 0).length > 0 && (
                            <><h4 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '2rem', marginBottom: '1rem', color: '#94a3b8' }}>○ Orders Without Designs ({orders.filter(order => !designs[order.id] || designs[order.id].length === 0).length})</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                    {orders.filter(order => !designs[order.id] || designs[order.id].length === 0).map(order => (
                                        <div key={order.id} style={{ border: '1px dashed #e2e8f0', borderRadius: '12px', padding: '1rem', opacity: 0.7 }}>
                                            <div style={{ fontWeight: 600, color: '#3498db', marginBottom: '0.5rem' }}>#{order.order_number || order.id}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>{order.customer_name || 'N/A'}</div>
                                            <button className="btn btn-outline text-xs" style={{ width: '100%' }} onClick={() => { setSelectedOrder(order); setShowDesignModal(true); }}><Upload size={12} /> Upload Design</button>
                                        </div>
                                    ))}
                                </div></>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        <Image size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <h4>No designs uploaded yet</h4>
                        <p>Upload designs for your orders to see them here</p>
                    </div>
                )}
            </div>
        );
    };

    // ============ ENHANCED ANALYTICS ============
    const renderAnalytics = () => {
        const totalOrders = analyticsData?.total_stats?.total_orders ?? orders.length;
        const completed = analyticsData?.total_stats?.completed_orders ?? orders.filter(o => o.status === 'completed').length;
        const inProgress = orders.filter(o => o.status === 'in_progress').length;
        const pending = orders.filter(o => o.status === 'pending').length;
        const completionRate = totalOrders > 0 ? Math.round((completed / totalOrders) * 100) : 0;
        const workerCount = analyticsData?.worker_count ?? workers.length;
        const totalInventoryValue = analyticsData?.materials_total_value ?? materials.reduce((s, m) => s + (parseFloat(m.unit_price) || 0) * (parseFloat(m.quantity) || 0), 0);
        const totalMaterialTypes = materials.length;
        const completedTodayFromOrders = orders.filter(o => o.status === 'completed' && ((o.completed_at || o.updated_at || o.order_date || '').toString().startsWith(new Date().toISOString().slice(0, 10)))).length;
        const completedToday = completedTodayFromOrders || stats.completedToday;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', padding: '2rem', color: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Workshop Analytics</div>
                            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Production Intelligence</h2>
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>Real-time metrics and performance insights for your coffin workshop</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                                {['weekly', 'monthly', 'yearly'].map(p => (
                                    <button key={p} onClick={() => setAnalyticsPeriod(p)} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', background: analyticsPeriod === p ? '#3b82f6' : 'transparent', color: analyticsPeriod === p ? '#fff' : '#94a3b8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.2s' }}>{p}</button>
                                ))}
                            </div>
                            <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>{darkMode ? <Sun size={16} /> : <Moon size={16} />}</button>
                        </div>
                    </div>
                    {/* Mini KPI Strip */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '1rem', marginTop: '2rem' }}>
                        {[
                            { label: 'Total Orders', value: totalOrders, icon: ClipboardList, color: '#3b82f6' },
                            { label: 'Completed', value: completed, icon: CheckCircle, color: '#22c55e' },
                            { label: 'In Progress', value: inProgress, icon: Activity, color: '#f59e0b' },
                            { label: 'Pending', value: pending, icon: Clock, color: '#6366f1' },
                            { label: 'Completion', value: `${completionRate}%`, icon: Target, color: '#ec4899' },
                            { label: 'Materials', value: totalMaterialTypes, icon: Package, color: '#14b8a6' },
                            { label: 'Workers', value: workerCount, icon: Users, color: '#8b5cf6' },
                            { label: 'Low Stock', value: stats.lowStockAlerts, icon: AlertTriangle, color: stats.lowStockAlerts > 0 ? '#ef4444' : '#22c55e' },
                        ].map((kpi, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ color: kpi.color, marginBottom: '0.25rem' }}>{React.createElement(kpi.icon, { size: 16 })}</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{kpi.value}</div>
                                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.1rem' }}>{kpi.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Charts Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                    {/* Status Distribution */}
                    <div style={{ gridColumn: 'span 4', background: '#fff', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PieChart size={16} /> Order Status</h4>
                        <div style={{ maxHeight: '200px', display: 'flex', justifyContent: 'center' }}>
                            <Doughnut data={statusChartData} options={{ cutout: '65%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 6, font: { size: 10 } } } }, maintainAspectRatio: true }} />
                        </div>
                    </div>

                    {/* Coffin Types */}
                    <div style={{ gridColumn: 'span 4', background: '#fff', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart size={16} /> Coffin Types</h4>
                        <div style={{ maxHeight: '200px' }}>
                            <Pie data={coffinTypeChart} options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 6, font: { size: 9 } } } }, maintainAspectRatio: true }} />
                        </div>
                    </div>

                    {/* Efficiency */}
                    <div style={{ gridColumn: 'span 4', background: '#fff', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Gauge size={16} /> Performance Score</h4>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 1rem' }}>
                                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={completionRate > 75 ? '#22c55e' : completionRate > 50 ? '#f59e0b' : '#ef4444'} strokeWidth="3" strokeDasharray={`${completionRate}, 100`} strokeLinecap="round" />
                                </svg>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '2rem', fontWeight: 800, color: completionRate > 75 ? '#22c55e' : completionRate > 50 ? '#f59e0b' : '#ef4444' }}>{completionRate}%</div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Completion Rate</div>
                        </div>
                    </div>

                    {/* Monthly Orders */}
                    <div style={{ gridColumn: 'span 7', background: '#fff', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart size={16} /> {periodTitle}</h4>
                        <div style={{ height: '220px' }}>
                            <Bar data={periodOrdersChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10 } } } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
                        </div>
                    </div>
 
                    {/* Revenue */}
                    <div style={{ gridColumn: 'span 5', background: '#fff', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendUp size={16} /> Revenue Trend</h4>
                        <div style={{ height: '220px' }}>
                            <Line data={monthlyRevenueChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => 'KES ' + v.toLocaleString() } } } }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Revenue</div><div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#16a34a' }}>KES {periodTotalRevenue.toLocaleString()}</div></div>
                            <div style={{ textAlign: 'right' }}><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Avg/Order</div><div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>KES {periodTotalOrders > 0 ? Math.round(periodTotalRevenue / periodTotalOrders).toLocaleString() : 0}</div></div>
                        </div>
                    </div>

                    {/* Top Materials */}
                    <div style={{ gridColumn: 'span 6', background: '#fff', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={16} /> Top Materials Used</h4>
                        <div style={{ height: '200px' }}>
                            <Bar data={topMaterialsChart} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }} />
                        </div>
                    </div>

                    {/* Stage Completion */}
                    <div style={{ gridColumn: 'span 6', background: '#fff', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Layers size={16} /> Stage Completion</h4>
                        <div style={{ height: '200px' }}>
                            <Bar data={stageCompletionChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { callback: (value) => `${value}h` } } } }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                            {stageCompletion.slice(0, 2).map((item, idx) => (
                                <div key={idx} style={{ background: '#f8fafc', borderRadius: '12px', padding: '0.85rem', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.stage || item.label || 'Stage'}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.total ? `${item.total} orders` : 'Tracking'}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>{item.avg_hours ? `${item.avg_hours.toFixed(1)} hrs avg` : 'Not enough data'}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Material Usage Trend */}
                    <div style={{ gridColumn: 'span 6', background: '#fff', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={16} /> Material Usage Trend</h4>
                        <div style={{ height: '220px' }}>
                            <Line data={materialUsageChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                        </div>
                    </div>

                    {/* Inventory Value */}
                    <div style={{ gridColumn: 'span 6', background: '#fff', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Layers size={16} /> Inventory Value</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '12px', color: '#fff' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.5rem' }}>TOTAL INVENTORY VALUE</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>KES {totalInventoryValue.toLocaleString()}</div>
                                <div style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}><ArrowUp size={12} /> {totalMaterialTypes} material types</div>
                            </div>
                            <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.5rem' }}>COST BREAKDOWN</div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                        <span>Wood</span>
                                        <span style={{ fontWeight: 600 }}>{materials.filter(m => (m.category || '').toLowerCase() === 'wood').length} types</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                        <span>Hardware</span>
                                        <span style={{ fontWeight: 600 }}>{materials.filter(m => (m.category || '').toLowerCase() === 'hardware').length} types</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                        <span>Others</span>
                                        <span style={{ fontWeight: 600 }}>{materials.filter(m => !['wood', 'hardware'].includes((m.category || '').toLowerCase())).length} types</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div style={{ gridColumn: 'span 12', background: '#fff', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={16} /> Key Performance Indicators</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '1rem' }}>
                            {[
                                { label: 'Orders Completed', value: completed.toString(), sub: `${completionRate}% rate`, color: '#22c55e', icon: CheckCircle },
                                { label: 'Active Now', value: inProgress.toString(), sub: 'in production', color: '#3b82f6', icon: Activity },
                                { label: 'Completed Today', value: completedToday.toString(), sub: 'orders', color: '#16a34a', icon: Award },
                                { label: 'Total Materials', value: totalMaterialTypes.toString(), sub: `${stats.lowStockAlerts} low stock`, color: stats.lowStockAlerts > 0 ? '#ef4444' : '#14b8a6', icon: Package },
                                { label: 'Workers', value: workerCount.toString(), sub: 'assigned', color: '#8b5cf6', icon: Users },
                                { label: 'Inventory Value', value: `KES ${(totalInventoryValue / 1000).toFixed(1)}K`, sub: 'total', color: '#f59e0b', icon: DollarSign },
                                { label: 'Avg Production', value: `${Math.max(1, Math.round((stageCompletion.reduce((sum, item) => sum + (item.avg_hours || 0), 0) / Math.max(stageCompletion.length, 1)) / 24))} days`, sub: 'per coffin', color: '#64748b', icon: Clock },
                                { label: 'Worker Utilization', value: `${workerCount > 0 ? Math.round((orders.filter(o => o.assigned_worker || o.assignments?.length > 0).length / Math.max(orders.length, 1)) * 100) : 0}%`, sub: 'efficiency', color: '#6366f1', icon: Percent },
                            ].map((item, i) => (
                                <div key={i} style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ color: item.color, marginBottom: '0.5rem' }}>{React.createElement(item.icon, { size: 20 })}</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>{item.value}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>{item.label}</div>
                                    <div style={{ fontSize: '0.65rem', color: item.color, marginTop: '0.1rem', fontWeight: 500 }}>{item.sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSettings = () => (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1.5rem' }}>Workshop Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Hammer size={16} /> Production Stages</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {['Design', 'Cutting', 'Assembly', 'Polishing', 'Finishing', 'Quality Check', 'Delivery'].map(stage => (
                            <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <input type="checkbox" defaultChecked style={{ accentColor: '#3498db' }} />
                                <span>{stage}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Layers size={16} /> Material Categories</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[{ name: 'Wood (Boards, Plywood)', color: '#8b4513' }, { name: 'Hardware (Nails, Screws)', color: '#7f8c8d' }, { name: 'Fabric (Satin, Velvet)', color: '#e74c3c' }, { name: 'Paint & Finish', color: '#3498db' }, { name: 'Foam & Padding', color: '#f39c12' }, { name: 'Metal (Handles, Hinges)', color: '#95a5a6' }].map(cat => (
                            <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ width: 12, height: 12, borderRadius: 3, background: cat.color }} />
                                <span>{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // ============ MAIN RENDER ============
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1rem 1rem 1.5rem',
            minHeight: '100vh',
            background: '#f3f4f6'
        }}>
            <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
            <header style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.94), rgba(248,250,252,0.94))',
                padding: '0.9rem 1rem',
                borderRadius: '18px',
                boxShadow: '0 14px 38px rgba(15,23,42,0.07)',
                border: '1px solid rgba(148,163,184,0.16)',
                backdropFilter: 'blur(14px)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>🏭 Workshop</div>
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowNavDropdown(!showNavDropdown)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                                {navItems.find(n => n.id === activeTab)?.icon && React.createElement(navItems.find(n => n.id === activeTab).icon, { size: 16 })}
                                <span>{navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}</span>
                                <ChevronDown size={14} style={{ transform: showNavDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                            {showNavDropdown && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '200px', overflow: 'hidden' }}>
                                    {navItems.map(item => (
                                        <button key={item.id} onClick={() => { setActiveTab(item.id); setShowNavDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', border: 'none', background: activeTab === item.id ? '#f0fdf4' : 'transparent', color: activeTab === item.id ? '#16a34a' : '#475569', cursor: 'pointer', fontSize: '0.9rem', fontWeight: activeTab === item.id ? 600 : 400, borderBottom: '1px solid #f1f5f9' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = activeTab === item.id ? '#f0fdf4' : 'transparent'}>
                                            {React.createElement(item.icon, { size: 16 })}{item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="text-muted text-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /><span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span></div>
                        {connected && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#14DD3C', fontSize: '0.8rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#14DD3C', boxShadow: '0 0 8px #14DD3C', animation: 'pulse 2s ease-in-out infinite' }}></span>Live</div>}
                        <button className="btn btn-outline text-sm" onClick={handleGenerateReport}><Download size={14} /> Export</button>
                        <button className="btn btn-dark text-sm" onClick={handleSync} disabled={isSyncing}>{isSyncing ? <Loader2 size={14} className="lucide-spin" /> : <RefreshCw size={14} />}{isSyncing ? 'Syncing...' : 'Sync'}</button>
                    </div>
                </div>
            </header>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'materials' && renderMaterials()}
            {activeTab === 'designs' && renderDesigns()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'settings' && renderSettings()}

            {/* Modals */}
            {showCreateModal && (<CreateOrderModal show={showCreateModal} form={orderForm} onChange={setOrderForm} onClose={() => { setShowCreateModal(false); setOrderForm({ customer_name: '', deceased_name: '', coffin_type: 'standard', selling_price: '', color: 'walnut', interior: 'satin_gold', delivery_date: '', dimensions: { length: '', width: '', height: '' }, notes: '' }); }}
                onSubmit={async () => { try { const res = await workshopService.createOrder(orderForm); if (res.success) { alert('Order created successfully!'); setShowCreateModal(false); loadDashboardData(); } else { alert('Failed: ' + res.error); } } catch (e) { alert('Order created locally'); setShowCreateModal(false); loadDashboardData(); } }} />)}

            {showDesignModal && selectedOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', maxWidth: '500px', width: '90%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}><Image size={20} style={{ marginRight: '0.5rem' }} />Upload Design - #{selectedOrder.order_number || selectedOrder.id}</h3>
                            <button onClick={() => { setShowDesignModal(false); setDesignUpload(null); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                        </div>
                        <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem', cursor: 'pointer', background: designUpload ? '#f0fdf4' : '#f8fafc' }}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); const file = e.dataTransfer.files[0]; if (file) setDesignUpload(file); }}
                            onClick={() => document.getElementById('design-upload')?.click()}>
                            {designUpload ? <div><CheckCircle size={32} style={{ color: '#27ae60', margin: '0 auto 0.5rem' }} /><p style={{ fontWeight: 500 }}>{designUpload.name}</p><p className="text-muted text-xs">{(designUpload.size / 1024).toFixed(1)} KB</p></div> : <div><Upload size={32} style={{ color: '#94a3b8', margin: '0 auto 0.5rem' }} /><p style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Click to upload or drag & drop</p><p className="text-muted text-xs">PNG, JPG, PDF, DWG, DXF (MAX. 10MB)</p></div>}
                            <input type="file" accept="image/*,.pdf,.dwg,.dxf" onChange={(e) => { const file = e.target.files[0]; if (file) setDesignUpload(file); }} style={{ display: 'none' }} id="design-upload" />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => { setShowDesignModal(false); setDesignUpload(null); }}>Cancel</button>
                            <button className="btn btn-dark" onClick={handleDesignUpload} disabled={!designUpload}><Upload size={14} /> Upload Design</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditMaterialModal && editingMaterial && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', maxWidth: '550px', width: '90%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}><Edit3 size={20} style={{ marginRight: '0.5rem' }} />Edit Material - {editingMaterial.name}</h3>
                            <button onClick={() => { setShowEditMaterialModal(false); setEditingMaterial(null); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Material Name *</label><input type="text" value={materialForm.name} onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Category</label><select value={materialForm.category} onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}><option value="wood">Wood</option><option value="hardware">Hardware</option><option value="fabric">Fabric</option><option value="paint">Paint</option><option value="foam">Foam</option><option value="metal">Metal</option><option value="other">Other</option></select></div>
                            <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Quantity *</label><input type="number" value={materialForm.quantity} onChange={(e) => setMaterialForm({ ...materialForm, quantity: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Unit</label><select value={materialForm.unit} onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}><option value="pcs">Pieces</option><option value="kg">Kg</option><option value="m">Meters</option><option value="liters">Liters</option><option value="sheets">Sheets</option><option value="boxes">Boxes</option></select></div>
                            <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Min Stock Level</label><input type="number" value={materialForm.min_stock_level} onChange={(e) => setMaterialForm({ ...materialForm, min_stock_level: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Cost per Unit</label><input type="number" value={materialForm.cost_per_unit} onChange={(e) => setMaterialForm({ ...materialForm, cost_per_unit: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} /></div>
                            <div style={{ gridColumn: '1/-1' }}><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Supplier</label><input type="text" value={materialForm.supplier} onChange={(e) => setMaterialForm({ ...materialForm, supplier: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button className="btn btn-outline" onClick={() => { setShowEditMaterialModal(false); setEditingMaterial(null); }}>Cancel</button>
                            <button className="btn btn-dark" onClick={handleUpdateMaterial} disabled={!materialForm.name || !materialForm.quantity}><Save size={14} /> Update Material</button>
                        </div>
                    </div>
                </div>
            )}

            {showMaterialIntake && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', maxWidth: '550px', width: '90%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}><Package size={20} style={{ marginRight: '0.5rem' }} />Material Intake</h3>
                            <button onClick={() => setShowMaterialIntake(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Material Name *</label><input type="text" placeholder="e.g. Pine Board" value={materialForm.name} onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Category</label><select value={materialForm.category} onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}><option value="wood">Wood</option><option value="hardware">Hardware</option><option value="fabric">Fabric</option><option value="paint">Paint</option><option value="foam">Foam</option><option value="metal">Metal</option><option value="other">Other</option></select></div>
                            <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Quantity *</label><input type="number" value={materialForm.quantity} onChange={(e) => setMaterialForm({ ...materialForm, quantity: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Unit</label><select value={materialForm.unit} onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}><option value="pcs">Pieces</option><option value="kg">Kg</option><option value="m">Meters</option><option value="liters">Liters</option><option value="sheets">Sheets</option><option value="boxes">Boxes</option></select></div>
                            <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Min Stock Level</label><input type="number" value={materialForm.min_stock_level} onChange={(e) => setMaterialForm({ ...materialForm, min_stock_level: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Cost per Unit</label><input type="number" value={materialForm.cost_per_unit} onChange={(e) => setMaterialForm({ ...materialForm, cost_per_unit: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} /></div>
                            <div style={{ gridColumn: '1/-1' }}><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Supplier</label><input type="text" value={materialForm.supplier} onChange={(e) => setMaterialForm({ ...materialForm, supplier: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button className="btn btn-outline" onClick={() => setShowMaterialIntake(false)}>Cancel</button>
                            <button className="btn btn-dark" onClick={handleAddMaterial} disabled={!materialForm.name || !materialForm.quantity}><Plus size={14} /> Add Material</button>
                        </div>
                    </div>
                </div>
            )}

            {showJobCardModal && selectedOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div style={{ background: 'white', borderRadius: '16px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}><FileText size={20} style={{ marginRight: '0.5rem' }} />Job Card - #{selectedOrder.order_number || selectedOrder.id}</h3>
                            <button onClick={() => setShowJobCardModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div><div className="text-muted text-xs">Customer</div><div style={{ fontWeight: 600 }}>{selectedOrder.customer_name || 'N/A'}</div>{selectedOrder.customer_phone && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{selectedOrder.customer_phone}</div>}</div>
                            <div><div className="text-muted text-xs">Deceased</div><div style={{ fontWeight: 600 }}>{selectedOrder.deceased_name || 'N/A'}</div></div>
                            <div><div className="text-muted text-xs">Coffin Type</div><div style={{ fontWeight: 600 }}>{selectedOrder.coffin_type || 'Standard'}</div></div>
                            <div><div className="text-muted text-xs">Priority</div><span className={`badge ${selectedOrder.priority === 'urgent' ? 'badge-red' : 'badge-blue'}`}>{selectedOrder.priority || 'Normal'}</span></div>
                            <div><div className="text-muted text-xs">Status</div><span className={`badge ${selectedOrder.status === 'completed' ? 'badge-green' : selectedOrder.status === 'in_progress' ? 'badge-blue' : selectedOrder.status === 'on_hold' ? 'badge-red' : 'badge-yellow'}`}>{selectedOrder.status || 'Pending'}</span></div>
                            <div><div className="text-muted text-xs">Created</div><div style={{ fontWeight: 600 }}>{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString() : 'N/A'}</div></div>
                            {selectedOrder.due_date && <div><div className="text-muted text-xs">Due Date</div><div style={{ fontWeight: 600, color: '#e74c3c' }}>{new Date(selectedOrder.due_date).toLocaleDateString()}</div></div>}
                            {selectedOrder.delivery_date && <div><div className="text-muted text-xs">Delivery Date</div><div style={{ fontWeight: 600 }}>{new Date(selectedOrder.delivery_date).toLocaleDateString()}</div></div>}
                        </div>
                        {selectedOrder.dimensions && (
                            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <h4 style={{ fontSize: '0.85rem', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings size={14} /> Dimensions</h4>
                                <div style={{ fontSize: '0.85rem', color: '#475569' }}>{typeof selectedOrder.dimensions === 'string' ? selectedOrder.dimensions : selectedOrder.dimensions.length ? `${selectedOrder.dimensions.length} x ${selectedOrder.dimensions.width} x ${selectedOrder.dimensions.height}` : 'Not specified'}</div>
                            </div>
                        )}
                        {/* Materials Used */}
                        {selectedOrder.materials_used && selectedOrder.materials_used.length > 0 && (
                            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <h4 style={{ fontSize: '0.85rem', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={14} /> Materials Used</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {selectedOrder.materials_used.map((mu, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.3rem', background: '#fff', borderRadius: '4px' }}>
                                            <span>{mu.material_name || `Material #${mu.material_id}`}</span>
                                            <span style={{ fontWeight: 600 }}>{mu.quantity_used} {mu.unit || 'units'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn btn-dark" onClick={() => handlePrintJobCard(selectedOrder.id)}><Printer size={14} /> Print Job Card</button>
                            <button className="btn btn-outline" onClick={() => { handleOpenMaterialUsage(selectedOrder); setShowJobCardModal(false); }}><Package size={14} /> Record Materials</button>
                            <button className="btn btn-outline" onClick={() => setShowJobCardModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showMaterialUsageModal && selectedOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', maxWidth: '600px', width: '90%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}><Package size={20} style={{ marginRight: '0.5rem' }} />Record Material Usage</h3>
                            <button onClick={() => setShowMaterialUsageModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Order: #{selectedOrder.order_number || selectedOrder.id} - {selectedOrder.customer_name || 'N/A'}</p>
                        {materials.length > 0 ? (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Material</label>
                                        <select value={materialUsageForm.material_id} onChange={(e) => setMaterialUsageForm({ ...materialUsageForm, material_id: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}>
                                            <option value="">Select material...</option>
                                            {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.quantity} {m.unit} available)</option>)}
                                        </select>
                                    </div>
                                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Quantity</label><input type="number" value={materialUsageForm.quantity_used} onChange={(e) => setMaterialUsageForm({ ...materialUsageForm, quantity_used: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>&nbsp;</label><button onClick={handleAddToPendingMaterials} style={{ width: '100%', padding: '0.5rem', border: 'none', borderRadius: '8px', background: '#3498db', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }} disabled={!materialUsageForm.material_id || !materialUsageForm.quantity_used}><Plus size={14} /> Add</button></div>
                                </div>
                                {pendingMaterials.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Pending Materials ({pendingMaterials.length})</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {pendingMaterials.map((pm, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                                    <div><span style={{ fontWeight: 600 }}>{pm.material_name}</span> <span style={{ color: '#64748b', fontSize: '0.85rem' }}>x{pm.quantity_used} {pm.unit}</span></div>
                                                    <button onClick={() => handleRemovePendingMaterial(idx)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e74c3c', padding: '4px' }}><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-outline" onClick={() => setShowMaterialUsageModal(false)}>Cancel</button>
                                    <button className="btn btn-dark" onClick={() => { handleSaveAllPendingMaterials(); setShowMaterialUsageModal(false); }} disabled={pendingMaterials.length === 0}><Save size={14} /> Save All Materials</button>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p>No materials available. Add materials first.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkshopDashboard;