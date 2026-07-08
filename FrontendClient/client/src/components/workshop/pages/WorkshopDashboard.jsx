import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../context/socketContext';
import { useSocketEvents } from '../hooks/useSocketEvents';
import {
    Package, FlaskConical, Beaker, Droplets,
    Calendar, Loader2, Download, Gauge,
    ClipboardList, AlertTriangle, TrendingUp
} from 'lucide-react';
import { workshopService } from '../services/workshopService';

// Sub-components
import ProductionStatCard from '../components/ProductionStatCard';
import ActiveOrdersTable from '../components/ActiveOrdersTable';
import MaterialsInventory from '../components/MaterialsInventory';
import QuickActions from '../components/QuickActions';
import CreateOrderModal from '../components/CreateOrderModal';

const WorkshopDashboard = () => {
    const [stats, setStats] = useState({
        activeOrders: 0,
        completedToday: 0,
        materialsInStock: 0,
        lowStockAlerts: 0,
        totalProduction: 0,
        efficiency: 0
    });

    const [orders, setOrders] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [orderForm, setOrderForm] = useState({
        customer_name: '',
        deceased_name: '',
        coffin_type: 'standard',
        selling_price: '',
        color: 'walnut',
        interior: 'satin_gold',
        delivery_date: '',
        dimensions: { length: '', width: '', height: '' },
        notes: ''
    });
    const { connected } = useSocket();

    // Load initial data
    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Load orders
            const ordersRes = await workshopService.getOrders({ status: 'active' });
            if (ordersRes.success) {
                setOrders(ordersRes.data || []);
                setStats(prev => ({ ...prev, activeOrders: ordersRes.data?.length || 0 }));
            }

            // Load materials
            const materialsRes = await workshopService.getMaterials();
            if (materialsRes.success) {
                setMaterials(materialsRes.data || []);
                setStats(prev => ({ ...prev, materialsInStock: materialsRes.data?.length || 0 }));
            }

            // Load workers count
            const workersRes = await workshopService.getWorkers();
            if (workersRes.success) {
                setStats(prev => ({ ...prev, totalProduction: workersRes.data?.length || 0 }));
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    // Real-time socket event handlers
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
            setStats(prev => ({ ...prev, activeOrders: Math.max(0, prev.activeOrders - 1), completedToday: prev.completedToday + 1 }));
        },
        onMaterialUsed: (usage) => {
            setMaterials(prev =>
                prev.map(m => {
                    if (m.id === usage.material_id) {
                        const newQuantity = m.quantity - usage.quantity_used;
                        return { ...m, quantity: newQuantity };
                    }
                    return m;
                })
            );
            // Update order cost
            setOrders(prev =>
                prev.map(order =>
                    order.id === usage.coffin_order_id
                        ? { ...order, total_cost: (order.total_cost || 0) + (usage.quantity_used * usage.unit_cost) }
                        : order
                )
            );
        },
        onMaterialLowStock: (material) => {
            setStats(prev => ({ ...prev, lowStockAlerts: prev.lowStockAlerts + 1 }));
        },
        onWorkerAssigned: (assignment) => {
            setOrders(prev =>
                prev.map(order =>
                    order.id === assignment.coffin_order_id
                        ? {
                            ...order,
                            assignments: [...(order.assignments || []), assignment]
                        }
                        : order
                )
            );
        },
        onProductionStageStart: (stage) => {
            setOrders(prev =>
                prev.map(order =>
                    order.id === stage.coffin_order_id
                        ? {
                            ...order,
                            stages: order.stages?.map(s => s.id === stage.id ? stage : s)
                        }
                        : order
                )
            );
        },
        onProductionStageDone: (stage) => {
            setOrders(prev =>
                prev.map(order =>
                    order.id === stage.coffin_order_id
                        ? {
                            ...order,
                            stages: order.stages?.map(s => s.id === stage.id ? stage : s)
                        }
                        : order
                )
            );
        }
    });

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 1500);
    };

    const handleGenerateReport = () => {
        // Generate PDF report
        console.log('Generating report...');
    };

    // Quick Actions handlers
    const handleNewOrder = () => {
        console.log('Opening new order modal...');
        setShowCreateModal(true);
    };

    const handlePrintJobCard = async () => {
        if (orders.length === 0) {
            alert('No orders available to print');
            return;
        }
        // Get the first active order and print its job card
        const order = orders[0];
        try {
            const res = await workshopService.getWorkOrderPDF(order.id);
            if (res.success && res.data) {
                const blob = new Blob([res.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `job-card-${order.order_number || order.id}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Failed to print job card:', error);
            alert('Failed to generate job card PDF');
        }
    };

    const handleDesignStudio = () => {
        console.log('Opening design studio...');
        // Navigate to design studio or open modal
        window.open('/workshop/designs', '_blank');
    };

    const handleSimulation = () => {
        console.log('Opening simulation...');
        // Open simulation in new tab or modal
        const simulationWindow = window.open('', '_blank', 'width=1200,height=800');
        if (simulationWindow) {
            simulationWindow.document.write('<h1>Production Simulation Panel</h1><p>Simulation interface would load here</p>');
        }
    };

    const handleStockIntake = async () => {
        const materialName = prompt('Enter material name:');
        if (!materialName) return;

        const quantity = prompt('Enter quantity:');
        if (!quantity) return;

        const unit = prompt('Enter unit (e.g., kg, pcs, liters):');
        if (!unit) return;

        try {
            const res = await workshopService.createMaterial({
                name: materialName,
                quantity: parseInt(quantity),
                unit: unit,
                min_stock_level: 10
            });
            if (res.success) {
                alert('Material added successfully!');
                loadDashboardData(); // Reload data
            } else {
                alert('Failed to add material: ' + res.error);
            }
        } catch (error) {
            console.error('Failed to add material:', error);
            alert('Failed to add material');
        }
    };

    const handleAssignWorker = async () => {
        if (orders.length === 0) {
            alert('No active orders to assign workers to');
            return;
        }

        // Load workers
        const workersRes = await workshopService.getWorkers();
        if (!workersRes.success || !workersRes.data?.length) {
            alert('No workers available');
            return;
        }

        const order = orders[0];
        const workerNames = workersRes.data.map(w => `${w.id}: ${w.first_name} ${w.last_name} - ${w.role}`).join('\n');
        const workerId = prompt(`Assign worker to order #${order.order_number || order.id}\n\nAvailable workers:\n${workerNames}\n\nEnter worker ID:`);

        if (!workerId) return;

        const stage = prompt('Enter stage (e.g., design, cutting, assembly, polishing, finishing, quality_check):');
        if (!stage) return;

        try {
            const res = await workshopService.assignWorkerToOrder(order.id, {
                worker_id: parseInt(workerId),
                stage: stage,
                notes: 'Assigned from quick actions'
            });
            if (res.success) {
                alert('Worker assigned successfully!');
                loadDashboardData(); // Reload data
            } else {
                alert('Failed to assign worker: ' + res.error);
            }
        } catch (error) {
            console.error('Failed to assign worker:', error);
            alert('Failed to assign worker');
        }
    };

    const handleQRLabels = () => {
        if (orders.length === 0) {
            alert('No orders available for QR labels');
            return;
        }
        // Generate QR codes for all active orders
        const qrData = orders.map(order => ({
            order_number: order.order_number || `#${order.id}`,
            customer: order.customer_name,
            deceased: order.deceased_name,
            status: order.status
        }));

        console.log('QR Labels Data:', qrData);
        alert(`QR Labels generated for ${orders.length} orders!\n\nCheck console for QR data.`);
    };

    const handleAnalytics = () => {
        console.log('Opening analytics...');
        // Navigate to analytics page
        window.open('/workshop/analytics', '_blank');
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            paddingBottom: '2rem',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            minHeight: '100vh'
        }}>
            {/* Header */}
            <header className="page-title animate-fade-up" style={{
                background: 'white',
                padding: '1.5rem 2rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
                <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
                        Workshop Dashboard
                    </div>
                    <div className="text-muted text-sm fw-500" style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span style={{ margin: '0 8px', color: '#e2e8f0' }}>|</span>
                        {connected && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#14DD3C' }}>
                                <span style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: '#14DD3C',
                                    boxShadow: '0 0 8px #14DD3C',
                                    animation: 'pulse 2s ease-in-out infinite'
                                }}></span>
                                Live Updates Active
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-outline" onClick={handleGenerateReport} disabled={isSyncing}>
                        {isSyncing ? <Loader2 size={16} className="lucide-spin" /> : <Download size={16} />}
                        {isSyncing ? 'Generating...' : 'Export Report'}
                    </button>
                    <button className="btn btn-dark" onClick={handleSync} disabled={isSyncing}>
                        {isSyncing ? <Loader2 size={16} className="lucide-spin" /> : <Gauge size={16} />}
                        {isSyncing ? 'Syncing...' : 'Live Sync'}
                    </button>
                </div>
            </header>

            {/* Row 1: KPI Cards */}
            <div className="bento animate-fade-up delay-100" style={{
                gridTemplateColumns: 'repeat(4, 1fr)',
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
                <ProductionStatCard
                    label="Active Orders"
                    value={stats.activeOrders.toString()}
                    unit="in production"
                    icon={ClipboardList}
                    accent="rgba(20, 221, 60, 0.08)"
                />
                <ProductionStatCard
                    label="Completed Today"
                    value={stats.completedToday.toString()}
                    unit="orders"
                    icon={TrendingUp}
                    accent="rgba(20, 221, 60, 0.08)"
                />
                <ProductionStatCard
                    label="Materials In Stock"
                    value={stats.materialsInStock.toString()}
                    unit="items"
                    icon={Package}
                    accent="rgba(20, 221, 60, 0.08)"
                />
                <ProductionStatCard
                    label="Low Stock Alerts"
                    value={stats.lowStockAlerts.toString()}
                    unit="need reorder"
                    icon={AlertTriangle}
                    accent={stats.lowStockAlerts > 0 ? "rgba(217, 79, 79, 0.12)" : "rgba(20, 221, 60, 0.08)"}
                />
            </div>

            {/* Row 2: Active Orders + Quick Actions */}
            <div className="bento animate-fade-up delay-200" style={{
                gridTemplateColumns: '3fr 1fr',
                gap: '1.5rem'
            }}>
                <ActiveOrdersTable
                    orders={orders}
                    onViewOrder={(id) => console.log('View order:', id)}
                    onDownloadPDF={(id) => console.log('Download PDF:', id)}
                    onViewAll={() => console.log('View all orders')}
                />
                <QuickActions
                    onNewOrder={handleNewOrder}
                    onPrintJobCard={handlePrintJobCard}
                    onDesignStudio={handleDesignStudio}
                    onSimulation={handleSimulation}
                    onStockIntake={handleStockIntake}
                    onAssignWorker={handleAssignWorker}
                    onQRLabels={handleQRLabels}
                    onAnalytics={handleAnalytics}
                />
            </div>

            {/* Row 3: Materials Inventory */}
            <div className="bento animate-fade-up delay-300" style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
                <MaterialsInventory materials={materials} />
            </div>

            {/* Create Order Modal */}
            {showCreateModal && (
                <CreateOrderModal
                    show={showCreateModal}
                    form={orderForm}
                    onChange={setOrderForm}
                    onClose={() => {
                        setShowCreateModal(false);
                        // Reset form
                        setOrderForm({
                            customer_name: '',
                            deceased_name: '',
                            coffin_type: 'standard',
                            selling_price: '',
                            color: 'walnut',
                            interior: 'satin_gold',
                            delivery_date: '',
                            dimensions: { length: '', width: '', height: '' },
                            notes: ''
                        });
                    }}
                    onSubmit={async () => {
                        try {
                            const res = await workshopService.createOrder(orderForm);
                            if (res.success) {
                                alert('Order created successfully!');
                                setShowCreateModal(false);
                                // Reset form
                                setOrderForm({
                                    customer_name: '',
                                    deceased_name: '',
                                    coffin_type: 'standard',
                                    selling_price: '',
                                    color: 'walnut',
                                    interior: 'satin_gold',
                                    delivery_date: '',
                                    dimensions: { length: '', width: '', height: '' },
                                    notes: ''
                                });
                                loadDashboardData(); // Reload data
                            } else {
                                alert('Failed to create order: ' + res.error);
                            }
                        } catch (error) {
                            console.error('Failed to create order:', error);
                            alert('Failed to create order');
                        }
                    }}
                />
            )}
        </div>
    );
};

export default WorkshopDashboard;