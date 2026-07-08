import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../context/socketContext';
import { useSocketEvents } from '../hooks/useSocketEvents';
import {
    Package, FlaskConical, Beaker, Droplets,
    Calendar, Loader2, Download, Gauge,
    ClipboardList, AlertTriangle, TrendingUp
} from 'lucide-react';

// Sub-components
import ProductionStatCard from '../components/ProductionStatCard';
import ActiveOrdersTable from '../components/ActiveOrdersTable';
import MaterialsInventory from '../components/MaterialsInventory';
import QuickActions from '../components/QuickActions';

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
    const { connected } = useSocket();

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
                <QuickActions />
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
        </div>
    );
};

export default WorkshopDashboard;