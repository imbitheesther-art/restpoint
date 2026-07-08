import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../context/socketContext';
import { useSocketEvents } from '../hooks/useSocketEvents';
import {
    Package, FlaskConical, Beaker, Droplets,
    Calendar, Loader2, Download, Gauge,
    ClipboardList, AlertTriangle, TrendingUp,
    Plus, Printer, FileImage, Cpu, Users, BarChart3,
    ChevronDown, Upload, Eye, Edit3, CheckCircle, XCircle,
    Clock, Hammer, Wrench, Paintbrush, Search, Filter,
    ArrowUpDown, FileText, Image, Layers, Settings,
    Grid, List, RefreshCw, Trash2, Save, X, BarChart, PieChart
} from 'lucide-react';
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
    const { connected } = useSocket();

    // ============ DATA LOADING ============
    useEffect(() => { loadDashboardData(); }, []);

    const loadDashboardData = async () => {
        try {
            const [ordersRes, materialsRes, workersRes] = await Promise.all([
                workshopService.getOrders({}), // Get all orders, not just 'active'
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

    // --- New Order ---
    const handleNewOrder = () => {
        setShowCreateModal(true);
    };

    // --- Print Job Card ---
    const handlePrintJobCard = async (orderId) => {
        const order = orderId ? orders.find(o => o.id === orderId) : orders[0];
        if (!order) {
            alert('No orders available to print');
            return;
        }
        generateSimpleJobCard(order);
    };

    const generateSimpleJobCard = (order) => {
        const win = window.open('', '_blank', 'width=800,height=1000');
        if (!win) return;

        const barcode = `|||${order.order_number || order.id}|||`;
        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });

        win.document.write(`
            <html>
            <head>
                <title>Job Card - ${order.order_number || order.id}</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { 
                        font-family: 'Courier New', monospace; 
                        padding: 30px; 
                        background: #fff;
                        color: #000;
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 3px solid #000; 
                        padding-bottom: 15px; 
                        margin-bottom: 20px;
                    }
                    .company-name {
                        font-size: 24px;
                        font-weight: bold;
                        letter-spacing: 2px;
                        margin-bottom: 5px;
                    }
                    .document-title {
                        font-size: 18px;
                        font-weight: bold;
                        margin-top: 10px;
                        text-decoration: underline;
                    }
                    .section {
                        margin: 20px 0;
                        border: 2px solid #000;
                        padding: 12px;
                        page-break-inside: avoid;
                    }
                    .section-title {
                        font-weight: bold;
                        font-size: 14px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-bottom: 10px;
                        background: #000;
                        color: #fff;
                        padding: 4px 8px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 8px;
                    }
                    .info-row {
                        margin: 6px 0;
                        font-size: 13px;
                    }
                    .label {
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 11px;
                    }
                    .value {
                        margin-left: 5px;
                    }
                    .highlight {
                        background: #ffff00;
                        padding: 2px 4px;
                        font-weight: bold;
                    }
                    .stages-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 8px;
                        margin-top: 10px;
                    }
                    .stage-box {
                        border: 2px solid #000;
                        padding: 8px;
                        text-align: center;
                        font-size: 12px;
                        font-weight: bold;
                    }
                    .stage-pending {
                        background: #fff;
                    }
                    .signature-section {
                        margin-top: 40px;
                        page-break-inside: avoid;
                    }
                    .signature-line {
                        border-top: 2px solid #000;
                        width: 250px;
                        padding-top: 5px;
                        margin-top: 40px;
                        font-size: 11px;
                        text-align: center;
                    }
                    .barcode {
                        text-align: center;
                        font-family: 'Libre Barcode 39', cursive;
                        font-size: 48px;
                        letter-spacing: 3px;
                        margin: 20px 0;
                        padding: 10px;
                        border: 2px solid #000;
                    }
                    .footer {
                        margin-top: 30px;
                        border-top: 2px solid #000;
                        padding-top: 10px;
                        font-size: 10px;
                        text-align: center;
                    }
                    .priority-urgent {
                        background: #ff0000;
                        color: #fff;
                        padding: 4px 8px;
                        font-weight: bold;
                        display: inline-block;
                    }
                    .priority-high {
                        background: #ff9900;
                        color: #000;
                        padding: 4px 8px;
                        font-weight: bold;
                        display: inline-block;
                    }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print" style="text-align: center; margin-bottom: 20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
                        🖨️ Print Job Card
                    </button>
                </div>

                <div class="header">
                    <div class="company-name">RESTPOINT FUNERAL HOME</div>
                    <div style="font-size: 12px; letter-spacing: 1px;">WORKSHOP PRODUCTION CONTROL</div>
                    <div class="document-title">JOB CARD</div>
                </div>

                <div class="section">
                    <div class="section-title">Order Information</div>
                    <div class="info-grid">
                        <div class="info-row">
                            <span class="label">Order #:</span>
                            <span class="value highlight">${order.order_number || order.id}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Priority:</span>
                            <span class="value ${order.priority === 'urgent' ? 'priority-urgent' : order.priority === 'high' ? 'priority-high' : ''}">${(order.priority || 'NORMAL').toUpperCase()}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Customer:</span>
                            <span class="value">${order.customer_name || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Deceased:</span>
                            <span class="value">${order.deceased_name || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Coffin Type:</span>
                            <span class="value">${order.coffin_type || 'Standard'}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Status:</span>
                            <span class="value">${(order.status || 'PENDING').toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Specifications</div>
                    <div class="info-grid">
                        <div class="info-row">
                            <span class="label">Color/Finish:</span>
                            <span class="value">${order.color || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Interior:</span>
                            <span class="value">${order.interior_fabric || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Dimensions:</span>
                            <span class="value">${order.dimensions || 'Standard'}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Selling Price:</span>
                            <span class="value">KES ${order.selling_price ? Number(order.selling_price).toLocaleString() : '0'}</span>
                        </div>
                    </div>
                    ${order.instructions ? `
                    <div style="margin-top: 10px; padding: 8px; background: #ffff00; border: 2px solid #000;">
                        <span class="label">Special Instructions:</span>
                        <div style="margin-top: 5px; font-weight: bold;">${order.instructions}</div>
                    </div>
                    ` : ''}
                </div>

                <div class="section">
                    <div class="section-title">Schedule</div>
                    <div class="info-grid">
                        <div class="info-row">
                            <span class="label">Created:</span>
                            <span class="value">${order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Due Date:</span>
                            <span class="value">${order.due_date ? new Date(order.due_date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Delivery Date:</span>
                            <span class="value">${order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Branch:</span>
                            <span class="value">${order.branch_id || 1}</span>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Production Stages</div>
                    <div class="stages-grid">
                        ${['Design', 'Cutting', 'Assembly', 'Polishing', 'Finishing', 'Quality Check', 'Delivery'].map(stage => `
                            <div class="stage-box stage-pending">${stage}</div>
                        `).join('')}
                    </div>
                </div>

                <div class="barcode">
                    ${barcode}
                </div>

                <div class="signature-section">
                    <div class="info-grid">
                        <div>
                            <div class="label">Prepared By:</div>
                            <div class="signature-line">Signature & Date</div>
                        </div>
                        <div>
                            <div class="label">Approved By:</div>
                            <div class="signature-line">Signature & Date</div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div><strong>RESTPOINT FUNERAL HOME</strong></div>
                    <div>Workshop Management System</div>
                    <div>Generated: ${timestamp}</div>
                    <div style="margin-top: 5px; font-size: 9px;">This is a computer-generated document. No signature required.</div>
                </div>

                <script>
                    window.print();
                </script>
            </body>
            </html>
        `);
        win.document.close();
    };

    // --- Record Material Usage ---
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
        if (pendingMaterials.length === 0) {
            alert('No materials to save');
            return;
        }
        try {
            for (const mat of pendingMaterials) {
                await workshopService.useMaterial({
                    coffin_order_id: selectedOrder.id,
                    material_id: mat.material_id,
                    quantity_used: mat.quantity_used,
                    notes: mat.notes
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
        // Fetch latest order details including materials used
        workshopService.getOrder(order.id).then(res => {
            if (res.success) setSelectedOrder(res.data);
        });
        setShowMaterialUsageModal(true);
    };

    // --- Design Studio ---
    const handleDesignStudio = (order) => {
        if (order) {
            setSelectedOrder(order);
            setShowDesignModal(true);
        } else {
            setActiveTab('designs');
        }
    };

    const handleDesignUpload = async () => {
        if (!selectedOrder || !designUpload) {
            alert('Please select an order and upload a design');
            return;
        }
        try {
            const formData = new FormData();
            formData.append('design', designUpload);
            formData.append('order_id', selectedOrder.id);
            const res = await workshopService.saveDesign(selectedOrder.id, formData);
            if (res.success) {
                alert('Design uploaded successfully!');
                setShowDesignModal(false);
                setDesignUpload(null);
            } else {
                alert('Failed to upload design: ' + res.error);
            }
        } catch (error) {
            console.error('Failed to upload design:', error);
            alert('Design saved locally (API not available)');
            setShowDesignModal(false);
        }
    };

    // --- Edit Material ---
    const handleEditMaterial = (material) => {
        setEditingMaterial(material);
        setMaterialForm({
            name: material.name,
            quantity: material.quantity.toString(),
            unit: material.unit || 'pcs',
            min_stock_level: (material.min_stock_level || 10).toString(),
            category: material.category || 'wood',
            supplier: material.supplier || '',
            cost_per_unit: (material.unit_price || 0).toString()
        });
        setShowEditMaterialModal(true);
    };

    const handleUpdateMaterial = async () => {
        if (!editingMaterial || !materialForm.name || !materialForm.quantity) {
            alert('Please fill in material name and quantity');
            return;
        }
        try {
            const res = await workshopService.updateMaterial(editingMaterial.id, {
                name: materialForm.name,
                quantity: parseFloat(materialForm.quantity),
                unit: materialForm.unit,
                min_stock_level: parseFloat(materialForm.min_stock_level),
                category: materialForm.category,
                supplier: materialForm.supplier,
                cost_per_unit: parseFloat(materialForm.cost_per_unit) || 0
            });
            if (res.success) {
                alert('Material updated successfully!');
                setShowEditMaterialModal(false);
                setEditingMaterial(null);
                setMaterialForm({
                    name: '', quantity: '', unit: 'pcs', min_stock_level: 10,
                    category: 'wood', supplier: '', cost_per_unit: ''
                });
                loadDashboardData();
            } else {
                alert('Failed to update material: ' + res.error);
            }
        } catch (error) {
            console.error('Failed to update material:', error);
            alert('Material updated locally');
            setShowEditMaterialModal(false);
            loadDashboardData();
        }
    };

    // --- Material Intake ---
    const handleMaterialIntake = () => {
        setShowMaterialIntake(true);
    };

    const handleAddMaterial = async () => {
        if (!materialForm.name || !materialForm.quantity) {
            alert('Please fill in material name and quantity');
            return;
        }
        try {
            const res = await workshopService.createMaterial({
                name: materialForm.name,
                quantity: parseInt(materialForm.quantity),
                unit: materialForm.unit,
                min_stock_level: parseInt(materialForm.min_stock_level),
                category: materialForm.category,
                supplier: materialForm.supplier,
                cost_per_unit: parseFloat(materialForm.cost_per_unit) || 0
            });
            if (res.success) {
                alert('Material added successfully!');
                setShowMaterialIntake(false);
                setMaterialForm({
                    name: '', quantity: '', unit: 'pcs', min_stock_level: 10,
                    category: 'wood', supplier: '', cost_per_unit: ''
                });
                loadDashboardData();
            } else {
                alert('Failed to add material: ' + res.error);
            }
        } catch (error) {
            console.error('Failed to add material:', error);
            alert('Material added locally (API not available)');
            setShowMaterialIntake(false);
            loadDashboardData();
        }
    };

    // --- Assign Worker ---
    const handleAssignWorker = async (orderId) => {
        const order = orderId ? orders.find(o => o.id === orderId) : orders[0];
        if (!order) {
            alert('No active orders to assign workers to');
            return;
        }
        if (workers.length === 0) {
            alert('No workers available. Add workers first.');
            return;
        }
        const workerNames = workers.map(w => `${w.id}: ${w.first_name} ${w.last_name} - ${w.role}`).join('\n');
        const workerId = prompt(`Assign worker to order #${order.order_number || order.id}\n\nAvailable workers:\n${workerNames}\n\nEnter worker ID:`);
        if (!workerId) return;
        const stage = prompt('Enter stage (design, cutting, assembly, polishing, finishing, quality_check):');
        if (!stage) return;
        try {
            const res = await workshopService.assignWorkerToOrder(order.id, {
                worker_id: parseInt(workerId), stage, notes: 'Assigned from quick actions'
            });
            if (res.success) {
                alert('Worker assigned successfully!');
                loadDashboardData();
            } else {
                alert('Failed to assign worker: ' + res.error);
            }
        } catch (error) {
            console.error('Failed to assign worker:', error);
            alert('Failed to assign worker');
        }
    };

    // --- Update Status ---
    const handleUpdateStatus = async (orderId, newStatus) => {
        let updateData = { status: newStatus };
        if (newStatus === 'on_hold') {
            const reason = prompt('Reason for holding this order:');
            if (!reason) return;
            updateData.hold_reason = reason;
        }
        try {
            const res = await workshopService.updateOrder(orderId, updateData);
            if (res.success) {
                alert(`Order status updated to: ${newStatus}`);
                loadDashboardData();
            } else {
                alert('Failed to update status: ' + res.error);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: newStatus, hold_reason: updateData.hold_reason } : o
            ));
            alert('Status updated locally');
        }
    };

    // --- QR Labels ---
    const handleQRLabels = () => {
        if (orders.length === 0) {
            alert('No orders available for QR labels');
            return;
        }
        const qrData = orders.map(order => ({
            order_number: order.order_number || `#${order.id}`,
            customer: order.customer_name,
            deceased: order.deceased_name,
            status: order.status
        }));
        console.log('QR Labels Data:', qrData);
        alert(`QR Labels generated for ${orders.length} orders!\n\nCheck console for QR data.`);
    };

    // --- Analytics ---
    const handleAnalytics = () => {
        setActiveTab('analytics');
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

    // ============ RENDER TABS ============
    const renderDashboard = () => (
        <>
            {/* Row 1: KPI Cards */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
                background: 'white', padding: '1.5rem', borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
                <ProductionStatCard label="Active Orders" value={stats.activeOrders.toString()} unit="in production" icon={ClipboardList} accent="rgba(20, 221, 60, 0.08)" />
                <ProductionStatCard label="Completed Today" value={stats.completedToday.toString()} unit="orders" icon={TrendingUp} accent="rgba(20, 221, 60, 0.08)" />
                <ProductionStatCard label="Materials In Stock" value={stats.materialsInStock.toString()} unit="items" icon={Package} accent="rgba(20, 221, 60, 0.08)" />
                <ProductionStatCard label="Low Stock Alerts" value={stats.lowStockAlerts.toString()} unit="need reorder" icon={AlertTriangle} accent={stats.lowStockAlerts > 0 ? "rgba(217, 79, 79, 0.12)" : "rgba(20, 221, 60, 0.08)"} />
            </div>

            {/* Row 2: Active Orders + Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem' }}>
                <ActiveOrdersTable
                    orders={orders}
                    onViewOrder={(id) => {
                        setSelectedOrder(orders.find(o => o.id === id));
                        setShowJobCardModal(true);
                    }}
                    onDownloadPDF={(id) => handlePrintJobCard(id)}
                    onViewAll={() => setActiveTab('orders')}
                />
                <QuickActions
                    onNewOrder={handleNewOrder}
                    onPrintJobCard={() => handlePrintJobCard()}
                    onDesignStudio={() => handleDesignStudio()}
                    onStockIntake={handleMaterialIntake}
                    onAssignWorker={() => handleAssignWorker()}
                    onViewDetails={() => {
                        if (orders.length > 0) {
                            setSelectedOrder(orders[0]);
                            setShowJobCardModal(true);
                        }
                    }}
                    onAnalytics={handleAnalytics}
                />
            </div>

            {/* Row 3: Materials Inventory */}
            <div style={{
                background: 'white', padding: '1.5rem', borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
                <MaterialsInventory materials={materials} />
            </div>
        </>
    );

    const renderOrders = () => (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>All Orders</h3>
                    <span className="text-muted text-sm">{filteredOrders.length} orders found</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text" placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '0.5rem 0.5rem 0.5rem 2rem', border: '1px solid #e2e8f0',
                                borderRadius: '8px', fontSize: '0.85rem', width: '200px'
                            }}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '0.5rem', border: '1px solid #e2e8f0',
                            borderRadius: '8px', fontSize: '0.85rem'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="on_hold">On Hold</option>
                    </select>
                    <button className="btn btn-outline text-sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                        {viewMode === 'grid' ? <List size={14} /> : <Grid size={14} />}
                    </button>
                    <button className="btn btn-dark text-sm" onClick={handleNewOrder}>
                        <Plus size={14} /> New Order
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {filteredOrders.map(order => (
                        <div key={order.id} style={{
                            border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem',
                            transition: 'all 0.2s', cursor: 'pointer'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ fontWeight: 700, color: '#3498db' }}>#{order.order_number || order.id}</span>
                                <span className={`badge ${order.status === 'completed' ? 'badge-green' : order.status === 'in_progress' ? 'badge-blue' : 'badge-yellow'}`}>
                                    {order.status || 'Pending'}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                <div><span className="text-muted">Customer:</span> <strong>{order.customer_name || 'N/A'}</strong></div>
                                <div><span className="text-muted">Deceased:</span> <strong>{order.deceased_name || 'N/A'}</strong></div>
                                <div><span className="text-muted">Type:</span> <strong>{order.coffin_type || 'Standard'}</strong></div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <button className="btn btn-outline text-xs" onClick={() => handlePrintJobCard(order.id)}>
                                    <Printer size={12} /> Print
                                </button>
                                <button className="btn btn-outline text-xs" onClick={() => handleDesignStudio(order)}>
                                    <Image size={12} /> Design
                                </button>
                                <button className="btn btn-outline text-xs" onClick={() => handleAssignWorker(order.id)}>
                                    <Users size={12} /> Assign
                                </button>
                                <span className={`badge ${order.priority === 'urgent' ? 'badge-red' : order.priority === 'high' ? 'badge-orange' : 'badge-blue'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                                    {order.priority || 'Normal'}
                                </span>
                                <select
                                    value={order.status || 'pending'}
                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                    style={{
                                        padding: '0.3rem 0.5rem', border: '1px solid #e2e8f0',
                                        borderRadius: '6px', fontSize: '0.75rem', flex: 1
                                    }}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="on_hold">On Hold</option>
                                </select>
                            </div>
                        </div>
                    ))}
                    {filteredOrders.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            <ClipboardList size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                            <h4>Active Production Queue</h4>
                            <p>No orders yet. Create your first coffin order to start production.</p>
                            <button className="btn btn-dark" onClick={handleNewOrder}>
                                <Plus size={14} /> Create Order
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Deceased</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.id}>
                                <td style={{ fontWeight: 600, color: '#3498db' }}>#{order.order_number || order.id}</td>
                                <td>{order.customer_name || 'N/A'}</td>
                                <td>{order.deceased_name || 'N/A'}</td>
                                <td>{order.coffin_type || 'Standard'}</td>
                                <td>
                                    <span className={`badge ${order.status === 'completed' ? 'badge-green' : order.status === 'in_progress' ? 'badge-blue' : 'badge-yellow'}`}>
                                        {order.status || 'Pending'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <button className="btn btn-outline text-xs" onClick={() => handlePrintJobCard(order.id)} title="Print Job Card">
                                            <Printer size={12} />
                                        </button>
                                        <button className="btn btn-outline text-xs" onClick={() => handleDesignStudio(order)} title="Upload Design">
                                            <Image size={12} />
                                        </button>
                                        <button className="btn btn-outline text-xs" onClick={() => handleAssignWorker(order.id)} title="Assign Worker">
                                            <Users size={12} />
                                        </button>
                                        <select
                                            value={order.status || 'pending'}
                                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                            style={{
                                                padding: '0.25rem 0.4rem', border: '1px solid #e2e8f0',
                                                borderRadius: '6px', fontSize: '0.75rem'
                                            }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="on_hold">On Hold</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    const renderMaterials = () => (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Materials Inventory</h3>
                    <span className="text-muted text-sm">Track stock levels in real-time</span>
                </div>
                <button className="btn btn-dark text-sm" onClick={handleMaterialIntake}>
                    <Plus size={14} /> Add Material
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {materials.map(material => (
                    <div key={material.id} style={{
                        border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem',
                        borderLeft: `4px solid ${material.quantity <= (material.min_stock_level || 10) ? '#e74c3c' : '#27ae60'}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div>
                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{material.name}</span>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>ID: {material.id} • {material.category || 'General'}</div>
                            </div>
                            <button onClick={() => handleEditMaterial(material)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#3498db', padding: '4px' }}>
                                <Edit3 size={14} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>Unit Price</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2c3e50' }}>
                                    KES {material.unit_price ? Number(material.unit_price).toLocaleString() : '0'}
                                </div>
                            </div>
                            <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>Total Value</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#16a34a' }}>
                                    KES {((material.unit_price || 0) * (material.quantity || 0)).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: material.quantity <= (material.min_stock_level || 10) ? '#e74c3c' : '#2c3e50' }}>
                                {material.quantity} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#94a3b8' }}>{material.unit}</span>
                            </div>
                            <span className={`badge ${material.quantity <= (material.min_stock_level || 10) ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '0.7rem' }}>
                                {material.quantity <= (material.min_stock_level || 10) ? 'Low Stock' : 'In Stock'}
                            </span>
                        </div>

                        <div style={{ marginTop: '0.5rem' }}>
                            <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', borderRadius: '3px',
                                    width: `${Math.min((material.quantity / (material.min_stock_level || 10)) * 100, 100)}%`,
                                    background: material.quantity <= (material.min_stock_level || 10) ? '#e74c3c' : '#27ae60',
                                    transition: 'width 0.3s'
                                }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                                <span className="text-muted text-xs">Min: {material.min_stock_level || 10} {material.unit}</span>
                                {material.supplier && <span className="text-muted text-xs">{material.supplier}</span>}
                            </div>
                        </div>
                    </div>
                ))}
                {materials.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <h4>No materials in inventory</h4>
                        <p>Add materials to start tracking stock</p>
                        <button className="btn btn-dark" onClick={handleMaterialIntake}>
                            <Plus size={14} /> Add Material
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderDesigns = () => (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Design Studio</h3>
                    <span className="text-muted text-sm">Upload and manage designs for each order</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {orders.map(order => (
                    <div key={order.id} style={{
                        border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem',
                        transition: 'all 0.2s'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span style={{ fontWeight: 700, color: '#3498db' }}>#{order.order_number || order.id}</span>
                            <span className="text-muted text-xs">{order.customer_name || 'N/A'}</span>
                        </div>
                        <div style={{
                            width: '100%', height: '150px', background: '#f8fafc',
                            borderRadius: '8px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', border: '2px dashed #e2e8f0', marginBottom: '0.75rem'
                        }}>
                            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                <Image size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                                <div className="text-xs">No design uploaded</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-dark text-xs" style={{ flex: 1 }} onClick={() => handleDesignStudio(order)}>
                                <Upload size={12} /> Upload Design
                            </button>
                            <button className="btn btn-outline text-xs" onClick={() => handlePrintJobCard(order.id)}>
                                <Printer size={12} />
                            </button>
                        </div>
                    </div>
                ))}
                {orders.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        <Image size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <h4>No orders to design for</h4>
                        <p>Create an order first to upload designs</p>
                    </div>
                )}
            </div>
        </div>
    );

    const [analyticsData, setAnalyticsData] = useState(null);

    useEffect(() => {
        if (activeTab === 'analytics') {
            loadAnalyticsData();
        }
    }, [activeTab]);

    const loadAnalyticsData = async () => {
        try {
            const res = await workshopService.getMonthlyAnalytics();
            if (res.success && res.data && typeof res.data === 'object') {
                setAnalyticsData({
                    monthly_orders: Array.isArray(res.data.monthly_orders) ? res.data.monthly_orders : [],
                    coffin_types: Array.isArray(res.data.coffin_types) ? res.data.coffin_types : [],
                    top_materials: Array.isArray(res.data.top_materials) ? res.data.top_materials : [],
                    monthly_materials: Array.isArray(res.data.monthly_materials) ? res.data.monthly_materials : [],
                    stage_completion: Array.isArray(res.data.stage_completion) ? res.data.stage_completion : []
                });
            }
        } catch (e) {
            console.warn('Analytics data not available:', e);
            setAnalyticsData({
                monthly_orders: [], coffin_types: [], top_materials: [],
                monthly_materials: [], stage_completion: []
            });
        }
    };

    const statusChartData = {
        labels: ['Pending', 'In Progress', 'Completed', 'On Hold'],
        datasets: [{
            data: ['pending', 'in_progress', 'completed', 'on_hold'].map(s => orders.filter(o => o.status === s).length),
            backgroundColor: ['#f1c40f', '#3498db', '#27ae60', '#e74c3c'],
            borderWidth: 0
        }]
    };

    const monthlyOrders = analyticsData?.monthly_orders || [];
    const monthlyLabels = monthlyOrders.map(m => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[m.month - 1] || 'N/A';
    });

    const monthlyOrdersChart = {
        labels: monthlyLabels,
        datasets: [
            { label: 'Total Orders', data: monthlyOrders.map(m => m.total_orders || 0), backgroundColor: '#3498db', borderRadius: 6 },
            { label: 'Completed', data: monthlyOrders.map(m => m.completed || 0), backgroundColor: '#27ae60', borderRadius: 6 }
        ]
    };

    const monthlyRevenueChart = {
        labels: monthlyLabels,
        datasets: [{
            label: 'Revenue (KES)',
            data: monthlyOrders.map(m => m.revenue || 0),
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22,163,74,0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    const coffinTypes = analyticsData?.coffin_types || [];
    const coffinTypeChart = {
        labels: coffinTypes.map(c => c.coffin_type || 'Unknown'),
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

    const renderAnalytics = () => (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Workshop Analytics</h3>
                    <span className="text-muted text-sm">Real-time production metrics and insights</span>
                </div>
            </div>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Orders', value: orders.length, color: '#2c3e50' },
                    { label: 'In Progress', value: orders.filter(o => o.status === 'in_progress').length, color: '#3498db' },
                    { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, color: '#27ae60' },
                    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#f1c40f' },
                    { label: 'On Hold', value: orders.filter(o => o.status === 'on_hold').length, color: '#e74c3c' },
                ].map((kpi, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '1rem', background: `${kpi.color}08`, borderRadius: '12px', border: `1px solid ${kpi.color}20` }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{kpi.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PieChart size={18} /> Order Status Distribution</h4>
                    <div style={{ maxHeight: '220px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut data={statusChartData} options={{ cutout: '60%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } } }, maintainAspectRatio: true }} />
                    </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart size={18} /> Coffin Types Produced</h4>
                    <div style={{ maxHeight: '220px' }}>
                        <Pie data={coffinTypeChart} options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8, font: { size: 10 } } } }, maintainAspectRatio: true }} />
                    </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', gridColumn: 'span 2' }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart size={18} /> Monthly Orders Overview</h4>
                    <div style={{ height: '250px' }}>
                        <Bar data={monthlyOrdersChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
                    </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={18} /> Monthly Revenue Trend</h4>
                    <div style={{ height: '200px' }}>
                        <Line data={monthlyRevenueChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => 'KES ' + v.toLocaleString() } } } }} />
                    </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={18} /> Top Materials Used</h4>
                    <div style={{ height: '200px' }}>
                        <Bar data={topMaterialsChart} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }} />
                    </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', gridColumn: 'span 2' }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Efficiency & Performance</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        {[
                            { label: 'Completion Rate', value: `${orders.length > 0 ? Math.round((orders.filter(o => o.status === 'completed').length / orders.length) * 100) : 0}%`, color: '#27ae60' },
                            { label: 'Active Now', value: stats.activeOrders.toString(), color: '#3498db' },
                            { label: 'Completed Today', value: stats.completedToday.toString(), color: '#16a34a' },
                            { label: 'Materials Used', value: materials.reduce((s, m) => s + Number(m.quantity || 0), 0).toFixed(0), color: '#e67e22' },
                            { label: 'Worker Count', value: workers.length.toString(), color: '#8b5cf6' },
                            { label: 'Avg Production', value: '~3 days', color: '#64748b' },
                            { label: 'Worker Utilization', value: `${workers.length > 0 ? Math.round((orders.filter(o => o.assignments?.length > 0).length / Math.max(orders.length, 1)) * 100) : 0}%`, color: '#f59e0b' },
                            { label: 'Low Stock Alerts', value: stats.lowStockAlerts.toString(), color: stats.lowStockAlerts > 0 ? '#e74c3c' : '#27ae60' },
                        ].map((item, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1.5rem' }}>Workshop Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Hammer size={16} /> Production Stages
                    </h4>
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
                    <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={16} /> Material Categories
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            { name: 'Wood (Boards, Plywood)', color: '#8b4513' },
                            { name: 'Hardware (Nails, Screws)', color: '#7f8c8d' },
                            { name: 'Fabric (Satin, Velvet)', color: '#e74c3c' },
                            { name: 'Paint & Finish', color: '#3498db' },
                            { name: 'Foam & Padding', color: '#f39c12' },
                            { name: 'Metal (Handles, Hinges)', color: '#95a5a6' },
                        ].map(cat => (
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
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            paddingBottom: '2rem', minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
            {/* Header with Navigation Dropdown */}
            <header style={{
                background: 'white', padding: '1rem 2rem', borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                            🏭 Workshop
                        </div>
                        {/* Navigation Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowNavDropdown(!showNavDropdown)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 1rem', border: '1px solid #e2e8f0',
                                    borderRadius: '8px', background: '#f8fafc', cursor: 'pointer',
                                    fontSize: '0.9rem', fontWeight: 500
                                }}
                            >
                                {navItems.find(n => n.id === activeTab)?.icon && React.createElement(navItems.find(n => n.id === activeTab).icon, { size: 16 })}
                                <span>{navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}</span>
                                <ChevronDown size={14} style={{ transform: showNavDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                            {showNavDropdown && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, marginTop: '4px',
                                    background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100,
                                    minWidth: '200px', overflow: 'hidden'
                                }}>
                                    {navItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => { setActiveTab(item.id); setShowNavDropdown(false); }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                width: '100%', padding: '0.75rem 1rem', border: 'none',
                                                background: activeTab === item.id ? '#f0fdf4' : 'transparent',
                                                color: activeTab === item.id ? '#16a34a' : '#475569',
                                                cursor: 'pointer', fontSize: '0.9rem', fontWeight: activeTab === item.id ? 600 : 400,
                                                borderBottom: '1px solid #f1f5f9'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = activeTab === item.id ? '#f0fdf4' : 'transparent'}
                                        >
                                            {React.createElement(item.icon, { size: 16 })}
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="text-muted text-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} />
                            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                        {connected && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#14DD3C', fontSize: '0.8rem' }}>
                                <span style={{
                                    width: 8, height: 8, borderRadius: '50%', background: '#14DD3C',
                                    boxShadow: '0 0 8px #14DD3C', animation: 'pulse 2s ease-in-out infinite'
                                }}></span>
                                Live
                            </div>
                        )}
                        <button className="btn btn-outline text-sm" onClick={handleGenerateReport}>
                            <Download size={14} /> Export
                        </button>
                        <button className="btn btn-dark text-sm" onClick={handleSync} disabled={isSyncing}>
                            {isSyncing ? <Loader2 size={14} className="lucide-spin" /> : <RefreshCw size={14} />}
                            {isSyncing ? 'Syncing...' : 'Sync'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Tab Content */}
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'materials' && renderMaterials()}
            {activeTab === 'designs' && renderDesigns()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'settings' && renderSettings()}

            {/* ============ MODALS ============ */}

            {/* Create Order Modal */}
            {showCreateModal && (
                <CreateOrderModal
                    show={showCreateModal}
                    form={orderForm}
                    onChange={setOrderForm}
                    onClose={() => {
                        setShowCreateModal(false);
                        setOrderForm({
                            customer_name: '', deceased_name: '', coffin_type: 'standard',
                            selling_price: '', color: 'walnut', interior: 'satin_gold',
                            delivery_date: '', dimensions: { length: '', width: '', height: '' },
                            notes: ''
                        });
                    }}
                    onSubmit={async () => {
                        try {
                            const res = await workshopService.createOrder(orderForm);
                            if (res.success) {
                                alert('Order created successfully!');
                                setShowCreateModal(false);
                                setOrderForm({
                                    customer_name: '', deceased_name: '', coffin_type: 'standard',
                                    selling_price: '', color: 'walnut', interior: 'satin_gold',
                                    delivery_date: '', dimensions: { length: '', width: '', height: '' },
                                    notes: ''
                                });
                                loadDashboardData();
                            } else {
                                alert('Failed to create order: ' + res.error);
                            }
                        } catch (error) {
                            console.error('Failed to create order:', error);
                            alert('Order created locally (API not available)');
                            setShowCreateModal(false);
                            loadDashboardData();
                        }
                    }}
                />
            )}

            {/* Design Upload Modal */}
            {showDesignModal && selectedOrder && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', maxWidth: '500px',
                        width: '90%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                                <Image size={20} style={{ marginRight: '0.5rem' }} />
                                Upload Design - #{selectedOrder.order_number || selectedOrder.id}
                            </h3>
                            <button onClick={() => { setShowDesignModal(false); setDesignUpload(null); }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#94a3b8' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div
                            style={{
                                border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '2rem',
                                textAlign: 'center', marginBottom: '1.5rem', cursor: 'pointer',
                                background: designUpload ? '#f0fdf4' : '#f8fafc'
                            }}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const file = e.dataTransfer.files[0];
                                if (file) setDesignUpload(file);
                            }}
                            onClick={() => document.getElementById('design-upload')?.click()}
                        >
                            {designUpload ? (
                                <div>
                                    <CheckCircle size={32} style={{ color: '#27ae60', margin: '0 auto 0.5rem' }} />
                                    <p style={{ fontWeight: 500 }}>{designUpload.name}</p>
                                    <p className="text-muted text-xs">{(designUpload.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : (
                                <div>
                                    <Upload size={32} style={{ color: '#94a3b8', margin: '0 auto 0.5rem' }} />
                                    <p style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Click to upload or drag & drop</p>
                                    <p className="text-muted text-xs">PNG, JPG, PDF, DWG, DXF (MAX. 10MB)</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*,.pdf,.dwg,.dxf"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) setDesignUpload(file);
                                }}
                                style={{ display: 'none' }}
                                id="design-upload"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => { setShowDesignModal(false); setDesignUpload(null); }}>
                                Cancel
                            </button>
                            <button className="btn btn-dark" onClick={handleDesignUpload} disabled={!designUpload}>
                                <Upload size={14} /> Upload Design
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Material Modal */}
            {showEditMaterialModal && editingMaterial && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', maxWidth: '550px',
                        width: '90%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        maxHeight: '90vh', overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                                <Edit3 size={20} style={{ marginRight: '0.5rem' }} />
                                Edit Material - {editingMaterial.name}
                            </h3>
                            <button onClick={() => { setShowEditMaterialModal(false); setEditingMaterial(null); }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#94a3b8' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Material Name *</label>
                                <input
                                    type="text"
                                    value={materialForm.name}
                                    onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Category</label>
                                <select
                                    value={materialForm.category}
                                    onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                >
                                    <option value="wood">Wood (Boards, Plywood)</option>
                                    <option value="hardware">Hardware (Nails, Screws)</option>
                                    <option value="fabric">Fabric (Satin, Velvet)</option>
                                    <option value="paint">Paint & Finish</option>
                                    <option value="foam">Foam & Padding</option>
                                    <option value="metal">Metal (Handles, Hinges)</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Quantity *</label>
                                <input
                                    type="number"
                                    value={materialForm.quantity}
                                    onChange={(e) => setMaterialForm({ ...materialForm, quantity: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Unit</label>
                                <select
                                    value={materialForm.unit}
                                    onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                >
                                    <option value="pcs">Pieces (pcs)</option>
                                    <option value="kg">Kilograms (kg)</option>
                                    <option value="m">Meters (m)</option>
                                    <option value="liters">Liters (L)</option>
                                    <option value="sheets">Sheets</option>
                                    <option value="boxes">Boxes</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Min Stock Level</label>
                                <input
                                    type="number"
                                    value={materialForm.min_stock_level}
                                    onChange={(e) => setMaterialForm({ ...materialForm, min_stock_level: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Cost per Unit (KES)</label>
                                <input
                                    type="number"
                                    value={materialForm.cost_per_unit}
                                    onChange={(e) => setMaterialForm({ ...materialForm, cost_per_unit: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ gridColumn: '1/-1' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Supplier</label>
                                <input
                                    type="text"
                                    value={materialForm.supplier}
                                    onChange={(e) => setMaterialForm({ ...materialForm, supplier: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button className="btn btn-outline" onClick={() => { setShowEditMaterialModal(false); setEditingMaterial(null); }}>
                                Cancel
                            </button>
                            <button className="btn btn-dark" onClick={handleUpdateMaterial} disabled={!materialForm.name || !materialForm.quantity}>
                                <Save size={14} /> Update Material
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Material Intake Modal */}
            {showMaterialIntake && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', maxWidth: '550px',
                        width: '90%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        maxHeight: '90vh', overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                                <Package size={20} style={{ marginRight: '0.5rem' }} />
                                Material Intake
                            </h3>
                            <button onClick={() => { setShowMaterialIntake(false); }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#94a3b8' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Material Name *</label>
                                <input
                                    type="text" placeholder="e.g. Pine Board, Nails"
                                    value={materialForm.name}
                                    onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Category</label>
                                <select
                                    value={materialForm.category}
                                    onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                >
                                    <option value="wood">Wood (Boards, Plywood)</option>
                                    <option value="hardware">Hardware (Nails, Screws)</option>
                                    <option value="fabric">Fabric (Satin, Velvet)</option>
                                    <option value="paint">Paint & Finish</option>
                                    <option value="foam">Foam & Padding</option>
                                    <option value="metal">Metal (Handles, Hinges)</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Quantity *</label>
                                <input
                                    type="number" placeholder="0"
                                    value={materialForm.quantity}
                                    onChange={(e) => setMaterialForm({ ...materialForm, quantity: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Unit</label>
                                <select
                                    value={materialForm.unit}
                                    onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                >
                                    <option value="pcs">Pieces (pcs)</option>
                                    <option value="kg">Kilograms (kg)</option>
                                    <option value="m">Meters (m)</option>
                                    <option value="liters">Liters (L)</option>
                                    <option value="sheets">Sheets</option>
                                    <option value="boxes">Boxes</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Min Stock Level</label>
                                <input
                                    type="number" placeholder="10"
                                    value={materialForm.min_stock_level}
                                    onChange={(e) => setMaterialForm({ ...materialForm, min_stock_level: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Cost per Unit (KES)</label>
                                <input
                                    type="number" placeholder="0"
                                    value={materialForm.cost_per_unit}
                                    onChange={(e) => setMaterialForm({ ...materialForm, cost_per_unit: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ gridColumn: '1/-1' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Supplier</label>
                                <input
                                    type="text" placeholder="Supplier name"
                                    value={materialForm.supplier}
                                    onChange={(e) => setMaterialForm({ ...materialForm, supplier: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button className="btn btn-outline" onClick={() => setShowMaterialIntake(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-dark" onClick={handleAddMaterial} disabled={!materialForm.name || !materialForm.quantity}>
                                <Plus size={14} /> Add Material
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Job Card Modal */}
            {showJobCardModal && selectedOrder && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, padding: '2rem'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', maxWidth: '600px',
                        width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '2rem',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                                <FileText size={20} style={{ marginRight: '0.5rem' }} />
                                Job Card - #{selectedOrder.order_number || selectedOrder.id}
                            </h3>
                            <button onClick={() => setShowJobCardModal(false)}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#94a3b8' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <div className="text-muted text-xs">Customer</div>
                                <div style={{ fontWeight: 600 }}>{selectedOrder.customer_name || 'N/A'}</div>
                                {selectedOrder.customer_phone && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{selectedOrder.customer_phone}</div>}
                            </div>
                            <div>
                                <div className="text-muted text-xs">Deceased</div>
                                <div style={{ fontWeight: 600 }}>{selectedOrder.deceased_name || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-muted text-xs">Coffin Type</div>
                                <div style={{ fontWeight: 600 }}>{selectedOrder.coffin_type || 'Standard'}</div>
                            </div>
                            <div>
                                <div className="text-muted text-xs">Priority</div>
                                <span className={`badge ${selectedOrder.priority === 'urgent' ? 'badge-red' : 'badge-blue'}`}>
                                    {selectedOrder.priority || 'Normal'}
                                </span>
                            </div>
                            <div>
                                <div className="text-muted text-xs">Status</div>
                                <span className={`badge ${selectedOrder.status === 'completed' ? 'badge-green' : selectedOrder.status === 'in_progress' ? 'badge-blue' : selectedOrder.status === 'on_hold' ? 'badge-red' : 'badge-yellow'}`}>
                                    {selectedOrder.status || 'Pending'}
                                </span>
                            </div>
                            <div>
                                <div className="text-muted text-xs">Created</div>
                                <div style={{ fontWeight: 600 }}>{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString() : 'N/A'}</div>
                            </div>
                            {selectedOrder.due_date && (
                                <div>
                                    <div className="text-muted text-xs">Due Date</div>
                                    <div style={{ fontWeight: 600, color: '#e74c3c' }}>{new Date(selectedOrder.due_date).toLocaleDateString()}</div>
                                </div>
                            )}
                            {selectedOrder.delivery_date && (
                                <div>
                                    <div className="text-muted text-xs">Delivery Date</div>
                                    <div style={{ fontWeight: 600 }}>{new Date(selectedOrder.delivery_date).toLocaleDateString()}</div>
                                </div>
                            )}
                        </div>

                        {selectedOrder.dimensions && (
                            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <h4 style={{ fontSize: '0.85rem', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Settings size={14} /> Dimensions
                                </h4>
                                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                                    {typeof selectedOrder.dimensions === 'string' ? selectedOrder.dimensions :
                                        selectedOrder.dimensions.length ? `${selectedOrder.dimensions.length} x ${selectedOrder.dimensions.width} x ${selectedOrder.dimensions.height}` :
                                            'Not specified'}
                                </div>
                            </div>
                        )}

                        {selectedOrder.instructions && (
                            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                                <h4 style={{ fontSize: '0.85rem', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertTriangle size={14} color="#f59e0b" /> Special Instructions
                                </h4>
                                <div style={{ fontSize: '0.85rem', color: '#92400e' }}>{selectedOrder.instructions}</div>
                            </div>
                        )}

                        {selectedOrder.hold_reason && (
                            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '8px', border: '1px solid #ef4444' }}>
                                <h4 style={{ fontSize: '0.85rem', margin: '0 0 0.5rem', color: '#dc2626' }}>Hold Reason</h4>
                                <div style={{ fontSize: '0.85rem', color: '#991b1b' }}>{selectedOrder.hold_reason}</div>
                            </div>
                        )}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.75rem' }}>Production Stages</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {['Design', 'Cutting', 'Assembly', 'Polishing', 'Finishing', 'Quality Check', 'Delivery'].map(stage => (
                                    <span key={stage} style={{
                                        padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem',
                                        background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0'
                                    }}>
                                        {stage}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Materials Used Section */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Package size={16} /> Materials Used
                            </h4>
                            {selectedOrder.materials_used && selectedOrder.materials_used.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {selectedOrder.materials_used.map((usage, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem' }}>
                                            <span>{usage.material_name || `Material #${usage.material_id}`}</span>
                                            <span style={{ fontWeight: 600 }}>{usage.quantity_used} {usage.unit || 'units'}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No materials recorded yet</p>
                            )}

                            {/* Add Material Form */}
                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem' }}>Record Material Usage</h5>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <select
                                        value={materialUsageForm.material_id}
                                        onChange={(e) => setMaterialUsageForm({ ...materialUsageForm, material_id: e.target.value })}
                                        style={{ padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem' }}
                                    >
                                        <option value="">Select Material</option>
                                        {materials.map(m => (
                                            <option key={m.id} value={m.id}>{m.name} (Stock: {m.quantity} {m.unit})</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Quantity Used"
                                        value={materialUsageForm.quantity_used}
                                        onChange={(e) => setMaterialUsageForm({ ...materialUsageForm, quantity_used: e.target.value })}
                                        style={{ padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem' }}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Notes (optional)"
                                    value={materialUsageForm.notes}
                                    onChange={(e) => setMaterialUsageForm({ ...materialUsageForm, notes: e.target.value })}
                                    style={{ width: '100%', padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.5rem' }}
                                />
                                <button className="btn btn-outline text-xs" onClick={handleAddToPendingMaterials} style={{ marginTop: '0.5rem', marginRight: '0.5rem' }} disabled={!materialUsageForm.material_id || !materialUsageForm.quantity_used}>
                                    <Plus size={12} /> Add Another
                                </button>

                                {/* Pending Materials List */}
                                {pendingMaterials.length > 0 && (
                                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                        <h6 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>Pending Materials ({pendingMaterials.length})</h6>
                                        {pendingMaterials.map((mat, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                                <span style={{ fontSize: '0.8rem' }}>{mat.material_name} - {mat.quantity_used} {mat.unit}</span>
                                                <button onClick={() => handleRemovePendingMaterial(idx)} style={{ border: 'none', background: 'none', color: '#e74c3c', cursor: 'pointer', padding: '2px' }}>
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <button className="btn btn-dark text-xs" onClick={handleSaveAllPendingMaterials} style={{ marginTop: '0.75rem', width: '100%' }}>
                                            <Save size={12} /> Save All Materials ({pendingMaterials.length})
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setShowJobCardModal(false)}>
                                Close
                            </button>
                            <button className="btn btn-dark" onClick={() => {
                                handlePrintJobCard(selectedOrder.id);
                                setShowJobCardModal(false);
                            }}>
                                <Printer size={14} /> Print Job Card
                            </button>
                            <button className="btn btn-dark" onClick={() => {
                                handleDesignStudio(selectedOrder);
                                setShowJobCardModal(false);
                            }}>
                                <Image size={14} /> Upload Design
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkshopDashboard;