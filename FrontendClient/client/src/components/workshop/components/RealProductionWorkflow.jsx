import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../modules/seo/useAuthstore';
import { useTenantStore } from '../../../modules/seo/useTenantStore';

// Real Production Workflow - Simple and Working
const RealProductionWorkflow = () => {
    const { user } = useAuthStore();
    const { tenant } = useTenantStore();
    const [orders, setOrders] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [machines, setMachines] = useState([]);
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load data on mount
    useEffect(() => {
        if (tenant?.db_name) {
            loadData();
        }
    }, [tenant]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load orders
            const ordersRes = await fetch(`/api/orders?tenant=${tenant.db_name}`);
            const ordersData = await ordersRes.json();
            setOrders(ordersData.orders || []);

            // Load materials
            const materialsRes = await fetch(`/api/materials?tenant=${tenant.db_name}`);
            const materialsData = await materialsRes.json();
            setMaterials(materialsData.materials || []);

            // Load workers
            const workersRes = await fetch(`/api/workers?tenant=${tenant.db_name}`);
            const workersData = await workersRes.json();
            setWorkers(workersData.workers || []);

            // Load machines
            const machinesRes = await fetch(`/api/machines?tenant=${tenant.db_name}`);
            const machinesData = await machinesRes.json();
            setMachines(machinesData.machines || []);

            // Load designs
            const designsRes = await fetch(`/api/designs?tenant=${tenant.db_name}`);
            const designsData = await designsRes.json();
            setDesigns(designsData.designs || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Create new order
    const createOrder = async (orderData) => {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-db': tenant.db_name
                },
                body: JSON.stringify({
                    ...orderData,
                    tenant_db: tenant.db_name,
                    created_by: user?.id
                })
            });
            const data = await response.json();
            if (data.success) {
                loadData();
                return data.order;
            }
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    // Update order stage
    const updateOrderStage = async (orderId, stage) => {
        try {
            const response = await fetch(`/api/orders/${orderId}/stage`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-db': tenant.db_name
                },
                body: JSON.stringify({ stage })
            });
            const data = await response.json();
            if (data.success) {
                loadData();
            }
        } catch (error) {
            console.error('Error updating stage:', error);
        }
    };

    // Assign worker to order
    const assignWorker = async (orderId, workerId) => {
        try {
            const response = await fetch(`/api/orders/${orderId}/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-db': tenant.db_name
                },
                body: JSON.stringify({ workerId })
            });
            const data = await response.json();
            if (data.success) {
                loadData();
            }
        } catch (error) {
            console.error('Error assigning worker:', error);
        }
    };

    // Track material usage
    const useMaterial = async (materialId, quantity, orderId) => {
        try {
            const response = await fetch(`/api/materials/${materialId}/use`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-db': tenant.db_name
                },
                body: JSON.stringify({ quantity, orderId })
            });
            const data = await response.json();
            if (data.success) {
                loadData();
            }
        } catch (error) {
            console.error('Error using material:', error);
        }
    };

    // Upload design
    const uploadDesign = async (file, orderId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('orderId', orderId);

        try {
            const response = await fetch('/api/designs/upload', {
                method: 'POST',
                headers: {
                    'x-tenant-db': tenant.db_name
                },
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                loadData();
            }
        } catch (error) {
            console.error('Error uploading design:', error);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Loading Production Workflow...</h2>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh' }}>
            <h1>🏭 Real Production Workflow System</h1>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>📋 Orders</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{orders.length}</p>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>📦 Materials</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{materials.length}</p>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>👷 Workers</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{workers.length}</p>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>⚙️ Machines</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{machines.length}</p>
                </div>
            </div>

            {/* Production Pipeline */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>🔄 Production Pipeline</h2>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px' }}>
                    {['design', 'cutting', 'assembly', 'polishing', 'finishing', 'quality', 'delivery'].map(stage => (
                        <div key={stage} style={{
                            minWidth: '120px',
                            padding: '15px',
                            background: '#e9ecef',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '20px' }}>
                                {{
                                    design: '🎨',
                                    cutting: '✂️',
                                    assembly: '🔧',
                                    polishing: '✨',
                                    finishing: '🎭',
                                    quality: '✅',
                                    delivery: '🚚'
                                }[stage]}
                            </div>
                            <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{stage}</div>
                            <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                {orders.filter(o => o.stage === stage).length} orders
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>📋 Active Orders</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#e9ecef' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Order #</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Customer</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Stage</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Worker</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} style={{ borderTop: '1px solid #dee2e6' }}>
                                <td style={{ padding: '10px' }}>{order.orderNumber}</td>
                                <td style={{ padding: '10px' }}>{order.customerName}</td>
                                <td style={{ padding: '10px' }}>
                                    <select
                                        value={order.stage}
                                        onChange={(e) => updateOrderStage(order.id, e.target.value)}
                                        style={{ padding: '5px', borderRadius: '4px' }}
                                    >
                                        {['design', 'cutting', 'assembly', 'polishing', 'finishing', 'quality', 'delivery'].map(stage => (
                                            <option key={stage} value={stage}>{stage}</option>
                                        ))}
                                    </select>
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <select
                                        value={order.workerId || ''}
                                        onChange={(e) => assignWorker(order.id, e.target.value)}
                                        style={{ padding: '5px', borderRadius: '4px' }}
                                    >
                                        <option value="">Unassigned</option>
                                        {workers.map(worker => (
                                            <option key={worker.id} value={worker.id}>{worker.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <button
                                        onClick={() => document.getElementById('design-upload').click()}
                                        style={{ padding: '5px 10px', marginRight: '5px' }}
                                    >
                                        🎨 Upload Design
                                    </button>
                                    <input
                                        type="file"
                                        id="design-upload"
                                        style={{ display: 'none' }}
                                        onChange={(e) => e.target.files[0] && uploadDesign(e.target.files[0], order.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Materials Tracking */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                <h2>📦 Materials Usage</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#e9ecef' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Material</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Stock</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Used</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map(material => (
                            <tr key={material.id} style={{ borderTop: '1px solid #dee2e6' }}>
                                <td style={{ padding: '10px' }}>{material.name}</td>
                                <td style={{ padding: '10px' }}>{material.currentStock} {material.unit}</td>
                                <td style={{ padding: '10px' }}>{material.used || 0}</td>
                                <td style={{ padding: '10px' }}>
                                    <button
                                        onClick={() => {
                                            const qty = prompt('Quantity to use:');
                                            if (qty) useMaterial(material.id, parseInt(qty), null);
                                        }}
                                        style={{ padding: '5px 10px' }}
                                    >
                                        Use Material
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RealProductionWorkflow;