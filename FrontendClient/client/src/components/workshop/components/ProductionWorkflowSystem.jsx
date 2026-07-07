import React, { useState, useEffect } from 'react';
import { theme } from '../styles/theme';
import { useSocketEvents } from '../hooks/useSocketEvents';

// Real-time Production Workflow System
const ProductionWorkflowSystem = ({ tenantSlug, user }) => {
    const [activeOrders, setActiveOrders] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [machines, setMachines] = useState([]);
    const [designs, setDesigns] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showCreateOrder, setShowCreateOrder] = useState(false);
    const [showMaterials, setShowMaterials] = useState(false);
    const [showDesigns, setShowDesigns] = useState(false);

    // Socket.IO for real-time updates
    const { socket, on, off } = useSocketEvents(tenantSlug);

    useEffect(() => {
        // Load initial data
        loadActiveOrders();
        loadMaterials();
        loadWorkers();
        loadMachines();
        loadDesigns();

        // Real-time event listeners
        on('order_created', (data) => {
            setActiveOrders(prev => [data.order, ...prev]);
        });

        on('order_updated', (data) => {
            setActiveOrders(prev => prev.map(o =>
                o.id === data.order.id ? { ...o, ...data.order } : o
            ));
        });

        on('material_used', (data) => {
            setMaterials(prev => prev.map(m =>
                m.id === data.material.id ? { ...m, ...data.material } : m
            ));
        });

        on('task_assigned', (data) => {
            setWorkers(prev => prev.map(w =>
                w.id === data.worker.id ? { ...w, ...data.worker } : w
            ));
        });

        on('machine_status', (data) => {
            setMachines(prev => prev.map(m =>
                m.id === data.machine.id ? { ...m, ...data.machine } : m
            ));
        });

        on('design_uploaded', (data) => {
            setDesigns(prev => [data.design, ...prev]);
        });

        return () => {
            off('order_created');
            off('order_updated');
            off('material_used');
            off('task_assigned');
            off('machine_status');
            off('design_uploaded');
        };
    }, [tenantSlug]);

    const loadActiveOrders = async () => {
        try {
            const response = await fetch(`/api/workshop/orders?status=active`, {
                headers: { 'x-tenant-slug': tenantSlug }
            });
            const data = await response.json();
            setActiveOrders(data.orders || []);
        } catch (error) {
            console.error('Failed to load orders:', error);
        }
    };

    const loadMaterials = async () => {
        try {
            const response = await fetch(`/api/workshop/materials`, {
                headers: { 'x-tenant-slug': tenantSlug }
            });
            const data = await response.json();
            setMaterials(data.materials || []);
        } catch (error) {
            console.error('Failed to load materials:', error);
        }
    };

    const loadWorkers = async () => {
        try {
            const response = await fetch(`/api/workshop/workers`, {
                headers: { 'x-tenant-slug': tenantSlug }
            });
            const data = await response.json();
            setWorkers(data.workers || []);
        } catch (error) {
            console.error('Failed to load workers:', error);
        }
    };

    const loadMachines = async () => {
        try {
            const response = await fetch(`/api/workshop/machines`, {
                headers: { 'x-tenant-slug': tenantSlug }
            });
            const data = await response.json();
            setMachines(data.machines || []);
        } catch (error) {
            console.error('Failed to load machines:', error);
        }
    };

    const loadDesigns = async () => {
        try {
            const response = await fetch(`/api/workshop/designs`, {
                headers: { 'x-tenant-slug': tenantSlug }
            });
            const data = await response.json();
            setDesigns(data.designs || []);
        } catch (error) {
            console.error('Failed to load designs:', error);
        }
    };

    // Create new order
    const createOrder = async (orderData) => {
        try {
            const response = await fetch(`/api/workshop/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-slug': tenantSlug
                },
                body: JSON.stringify(orderData)
            });
            const data = await response.json();
            if (data.success) {
                setShowCreateOrder(false);
                loadActiveOrders();
            }
        } catch (error) {
            console.error('Failed to create order:', error);
        }
    };

    // Assign task to worker
    const assignTask = async (orderId, workerId, stage) => {
        try {
            const response = await fetch(`/api/workshop/orders/${orderId}/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-slug': tenantSlug
                },
                body: JSON.stringify({ workerId, stage })
            });
            const data = await response.json();
            if (data.success) {
                loadActiveOrders();
            }
        } catch (error) {
            console.error('Failed to assign task:', error);
        }
    };

    // Update order stage
    const updateStage = async (orderId, stage, status) => {
        try {
            const response = await fetch(`/api/workshop/orders/${orderId}/stage`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-slug': tenantSlug
                },
                body: JSON.stringify({ stage, status })
            });
            const data = await response.json();
            if (data.success) {
                loadActiveOrders();
            }
        } catch (error) {
            console.error('Failed to update stage:', error);
        }
    };

    // Upload design
    const uploadDesign = async (file, orderId) => {
        const formData = new FormData();
        formData.append('design', file);
        formData.append('orderId', orderId);

        try {
            const response = await fetch(`/api/workshop/designs/upload`, {
                method: 'POST',
                headers: { 'x-tenant-slug': tenantSlug },
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                loadDesigns();
            }
        } catch (error) {
            console.error('Failed to upload design:', error);
        }
    };

    // Track material usage
    const trackMaterialUsage = async (materialId, quantity, orderId) => {
        try {
            const response = await fetch(`/api/workshop/materials/${materialId}/use`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-slug': tenantSlug
                },
                body: JSON.stringify({ quantity, orderId })
            });
            const data = await response.json();
            if (data.success) {
                loadMaterials();
            }
        } catch (error) {
            console.error('Failed to track material usage:', error);
        }
    };

    return (
        <div style={{
            padding: theme.spacing.lg,
            background: theme.colors.background,
            minHeight: '100vh'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing.xl,
                padding: theme.spacing.lg,
                background: theme.colors.surface,
                borderRadius: theme.borderRadius.lg,
                boxShadow: theme.shadows.md
            }}>
                <h1 style={{ color: theme.colors.text, margin: 0 }}>
                    🏭 Production Workflow System
                </h1>
                <div style={{ display: 'flex', gap: theme.spacing.md }}>
                    <button
                        onClick={() => setShowCreateOrder(true)}
                        style={{
                            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                            background: theme.colors.workshop.wood,
                            color: 'white',
                            border: 'none',
                            borderRadius: theme.borderRadius.md,
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        ➕ Create Order
                    </button>
                    <button
                        onClick={() => setShowMaterials(true)}
                        style={{
                            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                            background: theme.colors.workshop.metal,
                            color: 'white',
                            border: 'none',
                            borderRadius: theme.borderRadius.md,
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        📦 Materials
                    </button>
                    <button
                        onClick={() => setShowDesigns(true)}
                        style={{
                            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                            background: theme.colors.workshop.paint,
                            color: 'white',
                            border: 'none',
                            borderRadius: theme.borderRadius.md,
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        🎨 Designs
                    </button>
                </div>
            </div>

            {/* Production Floor - Real-time View */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: theme.spacing.lg,
                marginBottom: theme.spacing.xl
            }}>
                {/* Active Orders */}
                <div style={{
                    background: theme.colors.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.lg,
                    boxShadow: theme.shadows.md
                }}>
                    <h2 style={{ color: theme.colors.text, marginTop: 0 }}>
                        📋 Active Orders ({activeOrders.length})
                    </h2>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {activeOrders.map(order => (
                            <div
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                style={{
                                    padding: theme.spacing.md,
                                    margin: `${theme.spacing.sm} 0`,
                                    background: theme.colors.surfaceLight,
                                    borderRadius: theme.borderRadius.md,
                                    cursor: 'pointer',
                                    borderLeft: `4px solid ${theme.colors.stages[order.currentStage] || theme.colors.primary}`
                                }}
                            >
                                <div style={{ fontWeight: 'bold', color: theme.colors.text }}>
                                    {order.orderNumber} - {order.customerName}
                                </div>
                                <div style={{ color: theme.colors.textSecondary, fontSize: '12px' }}>
                                    Stage: {order.currentStage} | Status: {order.status}
                                </div>
                                <div style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                                    Created: {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Workers Status */}
                <div style={{
                    background: theme.colors.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.lg,
                    boxShadow: theme.shadows.md
                }}>
                    <h2 style={{ color: theme.colors.text, marginTop: 0 }}>
                        👷 Workers ({workers.length})
                    </h2>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {workers.map(worker => (
                            <div
                                key={worker.id}
                                style={{
                                    padding: theme.spacing.md,
                                    margin: `${theme.spacing.sm} 0`,
                                    background: theme.colors.surfaceLight,
                                    borderRadius: theme.borderRadius.md,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 'bold', color: theme.colors.text }}>
                                        {worker.name}
                                    </div>
                                    <div style={{ color: theme.colors.textSecondary, fontSize: '12px' }}>
                                        {worker.role}
                                    </div>
                                </div>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: worker.status === 'active' ? theme.colors.status.completed : theme.colors.status.pending
                                }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Machines Status */}
                <div style={{
                    background: theme.colors.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.lg,
                    boxShadow: theme.shadows.md
                }}>
                    <h2 style={{ color: theme.colors.text, marginTop: 0 }}>
                        ⚙️ Machines ({machines.length})
                    </h2>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {machines.map(machine => (
                            <div
                                key={machine.id}
                                style={{
                                    padding: theme.spacing.md,
                                    margin: `${theme.spacing.sm} 0`,
                                    background: theme.colors.surfaceLight,
                                    borderRadius: theme.borderRadius.md,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 'bold', color: theme.colors.text }}>
                                        {machine.name}
                                    </div>
                                    <div style={{ color: theme.colors.textSecondary, fontSize: '12px' }}>
                                        {machine.type}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '4px 8px',
                                    borderRadius: theme.borderRadius.sm,
                                    background: machine.status === 'available' ? theme.colors.status.completed : theme.colors.status.inProgress,
                                    color: 'white',
                                    fontSize: '11px'
                                }}>
                                    {machine.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Production Pipeline - Real-time Stages */}
            <div style={{
                background: theme.colors.surface,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                boxShadow: theme.shadows.md,
                marginBottom: theme.spacing.xl
            }}>
                <h2 style={{ color: theme.colors.text, marginTop: 0 }}>
                    🔄 Production Pipeline
                </h2>
                <div style={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: theme.spacing.md,
                    padding: theme.spacing.md
                }}>
                    {theme.productionStages.map(stage => (
                        <div
                            key={stage.id}
                            style={{
                                minWidth: '150px',
                                padding: theme.spacing.md,
                                background: theme.colors.surfaceLight,
                                borderRadius: theme.borderRadius.md,
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ fontSize: '24px' }}>{stage.icon}</div>
                            <div style={{ fontWeight: 'bold', color: theme.colors.text }}>
                                {stage.name}
                            </div>
                            <div style={{
                                marginTop: theme.spacing.sm,
                                padding: '4px',
                                background: theme.colors.border,
                                borderRadius: theme.borderRadius.sm,
                                fontSize: '12px',
                                color: theme.colors.textSecondary
                            }}>
                                {activeOrders.filter(o => o.currentStage === stage.id).length} orders
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Order Modal */}
            {showCreateOrder && (
                <CreateOrderModal
                    onClose={() => setShowCreateOrder(false)}
                    onSubmit={createOrder}
                    theme={theme}
                />
            )}

            {/* Materials Modal */}
            {showMaterials && (
                <MaterialsModal
                    materials={materials}
                    onClose={() => setShowMaterials(false)}
                    onTrackUsage={trackMaterialUsage}
                    theme={theme}
                />
            )}

            {/* Designs Modal */}
            {showDesigns && (
                <DesignsModal
                    designs={designs}
                    onClose={() => setShowDesigns(false)}
                    onUpload={uploadDesign}
                    theme={theme}
                />
            )}

            {/* Order Detail Panel */}
            {selectedOrder && (
                <OrderDetailPanel
                    order={selectedOrder}
                    workers={workers}
                    machines={machines}
                    onClose={() => setSelectedOrder(null)}
                    onAssignTask={assignTask}
                    onUpdateStage={updateStage}
                    onUploadDesign={uploadDesign}
                    theme={theme}
                />
            )}
        </div>
    );
};

// Create Order Modal Component
const CreateOrderModal = ({ onClose, onSubmit, theme }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        coffinType: '',
        woodType: '',
        quantity: 1,
        priority: 'normal',
        notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            orderType: 'customer',
            status: 'pending',
            currentStage: 'design'
        });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: theme.colors.surface,
                padding: theme.spacing.xl,
                borderRadius: theme.borderRadius.lg,
                width: '500px',
                maxHeight: '80vh',
                overflowY: 'auto'
            }}>
                <h2 style={{ color: theme.colors.text, marginTop: 0 }}>
                    ➕ Create New Order
                </h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: theme.spacing.md }}>
                        <label style={{ color: theme.colors.text, display: 'block', marginBottom: theme.spacing.xs }}>
                            Customer Name
                        </label>
                        <input
                            type="text"
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            style={{
                                width: '100%',
                                padding: theme.spacing.sm,
                                borderRadius: theme.borderRadius.sm,
                                border: `1px solid ${theme.colors.border}`,
                                background: theme.colors.surfaceLight,
                                color: theme.colors.text
                            }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: theme.spacing.md }}>
                        <label style={{ color: theme.colors.text, display: 'block', marginBottom: theme.spacing.xs }}>
                            Customer Phone
                        </label>
                        <input
                            type="tel"
                            value={formData.customerPhone}
                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                            style={{
                                width: '100%',
                                padding: theme.spacing.sm,
                                borderRadius: theme.borderRadius.sm,
                                border: `1px solid ${theme.colors.border}`,
                                background: theme.colors.surfaceLight,
                                color: theme.colors.text
                            }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: theme.spacing.md }}>
                        <label style={{ color: theme.colors.text, display: 'block', marginBottom: theme.spacing.xs }}>
                            Coffin Type
                        </label>
                        <select
                            value={formData.coffinType}
                            onChange={(e) => setFormData({ ...formData, coffinType: e.target.value })}
                            style={{
                                width: '100%',
                                padding: theme.spacing.sm,
                                borderRadius: theme.borderRadius.sm,
                                border: `1px solid ${theme.colors.border}`,
                                background: theme.colors.surfaceLight,
                                color: theme.colors.text
                            }}
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: theme.spacing.md }}>
                        <label style={{ color: theme.colors.text, display: 'block', marginBottom: theme.spacing.xs }}>
                            Wood Type
                        </label>
                        <select
                            value={formData.woodType}
                            onChange={(e) => setFormData({ ...formData, woodType: e.target.value })}
                            style={{
                                width: '100%',
                                padding: theme.spacing.sm,
                                borderRadius: theme.borderRadius.sm,
                                border: `1px solid ${theme.colors.border}`,
                                background: theme.colors.surfaceLight,
                                color: theme.colors.text
                            }}
                            required
                        >
                            <option value="">Select Wood</option>
                            <option value="mahogany">Mahogany</option>
                            <option value="oak">Oak</option>
                            <option value="pine">Pine</option>
                            <option value="cedar">Cedar</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: theme.spacing.md }}>
                        <label style={{ color: theme.colors.text, display: 'block', marginBottom: theme.spacing.xs }}>
                            Quantity
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            style={{
                                width: '100%',
                                padding: theme.spacing.sm,
                                borderRadius: theme.borderRadius.sm,
                                border: `1px solid ${theme.colors.border}`,
                                background: theme.colors.surfaceLight,
                                color: theme.colors.text
                            }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: theme.spacing.lg }}>
                        <label style={{ color: theme.colors.text, display: 'block', marginBottom: theme.spacing.xs }}>
                            Priority
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            style={{
                                width: '100%',
                                padding: theme.spacing.sm,
                                borderRadius: theme.borderRadius.sm,
                                border: `1px solid ${theme.colors.border}`,
                                background: theme.colors.surfaceLight,
                                color: theme.colors.text
                            }}
                        >
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: theme.spacing.md, justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                                background: theme.colors.status.cancelled,
                                color: 'white',
                                border: 'none',
                                borderRadius: theme.borderRadius.sm,
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                                background: theme.colors.status.completed,
                                color: 'white',
                                border: 'none',
                                borderRadius: theme.borderRadius.sm,
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Create Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Materials Modal Component
const MaterialsModal = ({ materials, onClose, onTrackUsage, theme }) => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    }}>
        <div style={{
            background: theme.colors.surface,
            padding: theme.spacing.xl,
            borderRadius: theme.borderRadius.lg,
            width: '600px',
            maxHeight: '80vh',
            overflowY: 'auto'
        }}>
            <h2 style={{ color: theme.colors.text, marginTop: 0 }}>
                📦 Materials Inventory
            </h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {materials.map(material => (
                    <div
                        key={material.id}
                        style={{
                            padding: theme.spacing.md,
                            margin: `${theme.spacing.sm} 0`,
                            background: theme.colors.surfaceLight,
                            borderRadius: theme.borderRadius.md,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 'bold', color: theme.colors.text }}>
                                {material.name}
                            </div>
                            <div style={{ color: theme.colors.textSecondary, fontSize: '12px' }}>
                                {material.category} | {material.unit}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: theme.colors.text, fontWeight: 'bold' }}>
                                {material.currentStock} {material.unit}
                            </div>
                            <div style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                                Min: {material.minimumStock}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: theme.spacing.lg, textAlign: 'right' }}>
                <button
                    onClick={onClose}
                    style={{
                        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                        background: theme.colors.status.cancelled,
                        color: 'white',
                        border: 'none',
                        borderRadius: theme.borderRadius.sm,
                        cursor: 'pointer'
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
);

// Designs Modal Component
const DesignsModal = ({ designs, onClose, onUpload, theme }) => {
    const [file, setFile] = useState(null);

    const handleUpload = () => {
        if (file) {
            onUpload(file, null);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: theme.colors.surface,
                padding: theme.spacing.xl,
                borderRadius: theme.borderRadius.lg,
                width: '600px',
                maxHeight: '80vh',
                overflowY: 'auto'
            }}>
                <h2 style={{ color: theme.colors.text, marginTop: 0 }}>
                    🎨 Design Studio
                </h2>

                {/* Upload Section */}
                <div style={{
                    padding: theme.spacing.lg,
                    background: theme.colors.surfaceLight,
                    borderRadius: theme.borderRadius.md,
                    marginBottom: theme.spacing.lg,
                    textAlign: 'center'
                }}>
                    <input
                        type="file"
                        accept=".pdf,.dxf,.svg,.jpg,.png"
                        onChange={(e) => setFile(e.target.files[0])}
                        style={{ marginBottom: theme.spacing.md }}
                    />
                    <button
                        onClick={handleUpload}
                        disabled={!file}
                        style={{
                            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                            background: file ? theme.colors.status.completed : theme.colors.status.pending,
                            color: 'white',
                            border: 'none',
                            borderRadius: theme.borderRadius.sm,
                            cursor: file ? 'pointer' : 'not-allowed'
                        }}
                    >
                        ⬆️ Upload Design
                    </button>
                </div>

                {/* Designs List */}
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {designs.map(design => (
                        <div
                            key={design.id}
                            style={{
                                padding: theme.spacing.md,
                                margin: `${theme.spacing.sm} 0`,
                                background: theme.colors.surfaceLight,
                                borderRadius: theme.borderRadius.md,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 'bold', color: theme.colors.text }}>
                                    {design.name}
                                </div>
                                <div style={{ color: theme.colors.textSecondary, fontSize: '12px' }}>
                                    {design.fileType} | {design.orderNumber}
                                </div>
                            </div>
                            <a
                                href={design.fileUrl}
                                download
                                style={{
                                    padding: '4px 8px',
                                    background: theme.colors.workshop.paint,
                                    color: 'white',
                                    borderRadius: theme.borderRadius.sm,
                                    textDecoration: 'none',
                                    fontSize: '12px'
                                }}
                            >
                                ⬇️ Download
                            </a>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: theme.spacing.lg, textAlign: 'right' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                            background: theme.colors.status.cancelled,
                            color: 'white',
                            border: 'none',
                            borderRadius: theme.borderRadius.sm,
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Order Detail Panel Component
const OrderDetailPanel = ({ order, workers, machines, onClose, onAssignTask, onUpdateStage, onUploadDesign, theme }) => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    }}>
        <div style={{
            background: theme.colors.surface,
            padding: theme.spacing.xl,
            borderRadius: theme.borderRadius.lg,
            width: '700px',
            maxHeight: '80vh',
            overflowY: 'auto'
        }}>
            <h2 style={{ color: theme.colors.text, marginTop: 0 }}>
                📋 Order Details: {order.orderNumber}
            </h2>

            {/* Order Info */}
            <div style={{ marginBottom: theme.spacing.lg }}>
                <div style={{ color: theme.colors.text, marginBottom: theme.spacing.xs }}>
                    <strong>Customer:</strong> {order.customerName}
                </div>
                <div style={{ color: theme.colors.text, marginBottom: theme.spacing.xs }}>
                    <strong>Phone:</strong> {order.customerPhone}
                </div>
                <div style={{ color: theme.colors.text, marginBottom: theme.spacing.xs }}>
                    <strong>Coffin Type:</strong> {order.coffinType}
                </div>
                <div style={{ color: theme.colors.text, marginBottom: theme.spacing.xs }}>
                    <strong>Wood Type:</strong> {order.woodType}
                </div>
                <div style={{ color: theme.colors.text, marginBottom: theme.spacing.xs }}>
                    <strong>Quantity:</strong> {order.quantity}
                </div>
                <div style={{ color: theme.colors.text, marginBottom: theme.spacing.xs }}>
                    <strong>Current Stage:</strong> {order.currentStage}
                </div>
                <div style={{ color: theme.colors.text, marginBottom: theme.spacing.xs }}>
                    <strong>Status:</strong> {order.status}
                </div>
            </div>

            {/* Stage Progress */}
            <div style={{ marginBottom: theme.spacing.lg }}>
                <h3 style={{ color: theme.colors.text }}>Production Progress</h3>
                <div style={{ display: 'flex', gap: theme.spacing.sm, overflowX: 'auto' }}>
                    {theme.productionStages.map(stage => (
                        <div
                            key={stage.id}
                            style={{
                                minWidth: '100px',
                                padding: theme.spacing.sm,
                                background: order.currentStage === stage.id
                                    ? theme.colors.stages[stage.id]
                                    : theme.colors.surfaceLight,
                                borderRadius: theme.borderRadius.sm,
                                textAlign: 'center',
                                cursor: 'pointer'
                            }}
                            onClick={() => onUpdateStage(order.id, stage.id, 'in_progress')}
                        >
                            <div style={{ fontSize: '20px' }}>{stage.icon}</div>
                            <div style={{
                                fontSize: '11px',
                                color: order.currentStage === stage.id ? 'white' : theme.colors.textSecondary
                            }}>
                                {stage.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Assign Task */}
            <div style={{ marginBottom: theme.spacing.lg }}>
                <h3 style={{ color: theme.colors.text }}>Assign Task</h3>
                <div style={{ display: 'flex', gap: theme.spacing.md }}>
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                onAssignTask(order.id, parseInt(e.target.value), order.currentStage);
                                e.target.value = '';
                            }
                        }}
                        style={{
                            flex: 1,
                            padding: theme.spacing.sm,
                            borderRadius: theme.borderRadius.sm,
                            border: `1px solid ${theme.colors.border}`,
                            background: theme.colors.surfaceLight,
                            color: theme.colors.text
                        }}
                    >
                        <option value="">Select Worker</option>
                        {workers.map(worker => (
                            <option key={worker.id} value={worker.id}>
                                {worker.name} - {worker.role}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', gap: theme.spacing.md, justifyContent: 'flex-end' }}>
                <button
                    onClick={onClose}
                    style={{
                        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                        background: theme.colors.status.cancelled,
                        color: 'white',
                        border: 'none',
                        borderRadius: theme.borderRadius.sm,
                        cursor: 'pointer'
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
);

export default ProductionWorkflowSystem;