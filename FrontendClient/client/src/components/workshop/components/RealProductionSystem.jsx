import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthstore';
import { useTenantStore } from '../../store/useTenantStore';

// Real Production System - Working with Actual API Endpoints
const RealProductionSystem = () => {
    const { user } = useAuthStore();
    const { tenant } = useTenantStore();
    const [orders, setOrders] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateOrder, setShowCreateOrder] = useState(false);
    const [newOrder, setNewOrder] = useState({
        customerName: '',
        customerPhone: '',
        coffinType: 'standard',
        woodType: 'mahogany',
        quantity: 1,
        priority: 'normal'
    });

    // Load data on mount
    useEffect(() => {
        if (tenant?.db_name) {
            loadData();
        }
    }, [tenant]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load coffin orders - using real endpoint
            const ordersRes = await fetch(`/api/workshop/orders?tenant=${tenant.db_name}`);
            const ordersData = await ordersRes.json();
            setOrders(ordersData.orders || ordersData || []);

            // Load materials - using real endpoint
            const materialsRes = await fetch(`/api/workshop/materials?tenant=${tenant.db_name}`);
            const materialsData = await materialsRes.json();
            setMaterials(materialsData.materials || materialsData || []);

            // Load workers - using real endpoint
            const workersRes = await fetch(`/api/workshop/workers?tenant=${tenant.db_name}`);
            const workersData = await workersRes.json();
            setWorkers(workersData.workers || workersData || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Create new order - using real endpoint
    const createOrder = async () => {
        try {
            const response = await fetch('/api/workshop/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-db': tenant.db_name
                },
                body: JSON.stringify({
                    ...newOrder,
                    createdBy: user?.id,
                    status: 'pending',
                    stage: 'design'
                })
            });
            const data = await response.json();
            if (data.success || data.order) {
                setShowCreateOrder(false);
                setNewOrder({
                    customerName: '',
                    customerPhone: '',
                    coffinType: 'standard',
                    woodType: 'mahogany',
                    quantity: 1,
                    priority: 'normal'
                });
                loadData();
            }
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    // Update order stage - using real endpoint
    const updateOrderStage = async (orderId, stage) => {
        try {
            const response = await fetch(`/api/workshop/orders/${orderId}/stage`, {
                method: 'PATCH',
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

    // Assign worker to order - using real endpoint
    const assignWorker = async (orderId, workerId) => {
        try {
            const response = await fetch(`/api/workshop/orders/${orderId}/assign`, {
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

    // Track material usage - using real endpoint
    const useMaterial = async (materialId, quantity) => {
        try {
            const response = await fetch('/api/workshop/materials/use', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-db': tenant.db_name
                },
                body: JSON.stringify({ materialId, quantity })
            });
            const data = await response.json();
            if (data.success) {
                loadData();
            }
        } catch (error) {
            console.error('Error using material:', error);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Loading Production System...</h2>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>🏭 Real Production System</h1>
                <button
                    onClick={() => setShowCreateOrder(true)}
                    style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    ➕ Create Order
                </button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
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
                                <td style={{ padding: '10px' }}>{order.orderNumber || order.id}</td>
                                <td style={{ padding: '10px' }}>{order.customerName || 'N/A'}</td>
                                <td style={{ padding: '10px' }}>
                                    <select
                                        value={order.stage || 'design'}
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
                                        onClick={() => {
                                            const qty = prompt('Quantity to use:');
                                            if (qty) useMaterial(order.id, parseInt(qty));
                                        }}
                                        style={{ padding: '5px 10px' }}
                                    >
                                        📦 Use Material
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Materials Tracking */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                <h2>📦 Materials Inventory</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#e9ecef' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Material</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Stock</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map(material => (
                            <tr key={material.id} style={{ borderTop: '1px solid #dee2e6' }}>
                                <td style={{ padding: '10px' }}>{material.name}</td>
                                <td style={{ padding: '10px' }}>{material.quantity || material.currentStock} {material.unit}</td>
                                <td style={{ padding: '10px' }}>
                                    <button
                                        onClick={() => {
                                            const qty = prompt('Quantity to use:');
                                            if (qty) useMaterial(material.id, parseInt(qty));
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

            {/* Create Order Modal */}
            {showCreateOrder && (
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
                        background: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        width: '500px'
                    }}>
                        <h2>Create New Order</h2>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Customer Name:</label>
                            <input
                                type="text"
                                value={newOrder.customerName}
                                onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Customer Phone:</label>
                            <input
                                type="tel"
                                value={newOrder.customerPhone}
                                onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Coffin Type:</label>
                            <select
                                value={newOrder.coffinType}
                                onChange={(e) => setNewOrder({ ...newOrder, coffinType: e.target.value })}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            >
                                <option value="standard">Standard</option>
                                <option value="premium">Premium</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Wood Type:</label>
                            <select
                                value={newOrder.woodType}
                                onChange={(e) => setNewOrder({ ...newOrder, woodType: e.target.value })}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            >
                                <option value="mahogany">Mahogany</option>
                                <option value="oak">Oak</option>
                                <option value="pine">Pine</option>
                                <option value="cedar">Cedar</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Quantity:</label>
                            <input
                                type="number"
                                min="1"
                                value={newOrder.quantity}
                                onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) })}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowCreateOrder(false)}
                                style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createOrder}
                                style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Create Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealProductionSystem;