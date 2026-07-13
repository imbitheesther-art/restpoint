import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../modules/seo/useAuthstore';
import { useTenantStore } from '../../../modules/seo/useTenantStore';

// Simple Production Workflow - Actually Working
const SimpleProductionWorkflow = () => {
    const { user } = useAuthStore();
    const { tenant } = useTenantStore();
    const [orders, setOrders] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load data
    useEffect(() => {
        if (tenant?.db_name) {
            loadOrders();
            loadMaterials();
            loadWorkers();
        }
    }, [tenant]);

    const loadOrders = async () => {
        try {
            const res = await fetch(`/api/workshop/orders?tenant=${tenant.db_name}`);
            const data = await res.json();
            setOrders(data.orders || data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const loadMaterials = async () => {
        try {
            const res = await fetch(`/api/workshop/materials?tenant=${tenant.db_name}`);
            const data = await res.json();
            setMaterials(data.materials || data || []);
        } catch (error) {
            console.error('Error loading materials:', error);
        }
    };

    const loadWorkers = async () => {
        try {
            const res = await fetch(`/api/workshop/workers?tenant=${tenant.db_name}`);
            const data = await res.json();
            setWorkers(data.workers || data || []);
        } catch (error) {
            console.error('Error loading workers:', error);
        }
    };

    // Create order
    const createOrder = async (orderData) => {
        try {
            const res = await fetch('/api/workshop/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-db': tenant.db_name
                },
                body: JSON.stringify(orderData)
            });
            const data = await res.json();
            if (data.success || data.order) {
                loadOrders();
            }
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    // Update stage
    const updateStage = async (orderId, stage) => {
        try {
            const res = await fetch(`/api/workshop/orders/${orderId}/stage`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-db': tenant.db_name
                },
                body: JSON.stringify({ stage })
            });
            const data = await res.json();
            if (data.success) {
                loadOrders();
            }
        } catch (error) {
            console.error('Error updating stage:', error);
        }
    };

    // Assign worker
    const assignWorker = async (orderId, workerId) => {
        try {
            const res = await fetch(`/api/workshop/orders/${orderId}/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-db': tenant.db_name
                },
                body: JSON.stringify({ workerId })
            });
            const data = await res.json();
            if (data.success) {
                loadOrders();
            }
        } catch (error) {
            console.error('Error assigning worker:', error);
        }
    };

    // Use material
    const useMaterial = async (materialId, quantity) => {
        try {
            const res = await fetch('/api/workshop/materials/use', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-db': tenant.db_name
                },
                body: JSON.stringify({ materialId, quantity })
            });
            const data = await res.json();
            if (data.success) {
                loadMaterials();
            }
        } catch (error) {
            console.error('Error using material:', error);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
            <h1>Production Workflow</h1>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ background: 'white', padding: '15px', borderRadius: '5px' }}>
                    <h3>Orders: {orders.length}</h3>
                </div>
                <div style={{ background: 'white', padding: '15px', borderRadius: '5px' }}>
                    <h3>Materials: {materials.length}</h3>
                </div>
                <div style={{ background: 'white', padding: '15px', borderRadius: '5px' }}>
                    <h3>Workers: {workers.length}</h3>
                </div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
                <h2>Orders</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Stage</th>
                            <th>Worker</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>{order.orderNumber || order.id}</td>
                                <td>{order.customerName || 'N/A'}</td>
                                <td>
                                    <select
                                        value={order.stage || 'design'}
                                        onChange={(e) => updateStage(order.id, e.target.value)}
                                    >
                                        <option value="design">Design</option>
                                        <option value="cutting">Cutting</option>
                                        <option value="assembly">Assembly</option>
                                        <option value="polishing">Polishing</option>
                                        <option value="finishing">Finishing</option>
                                        <option value="quality">Quality</option>
                                        <option value="delivery">Delivery</option>
                                    </select>
                                </td>
                                <td>
                                    <select
                                        value={order.workerId || ''}
                                        onChange={(e) => assignWorker(order.id, e.target.value)}
                                    >
                                        <option value="">Unassigned</option>
                                        {workers.map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <button onClick={() => {
                                        const qty = prompt('Quantity:');
                                        if (qty) useMaterial(order.id, parseInt(qty));
                                    }}>
                                        Use Material
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '5px' }}>
                <h2>Materials</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Material</th>
                            <th>Stock</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map(m => (
                            <tr key={m.id}>
                                <td>{m.name}</td>
                                <td>{m.quantity || m.currentStock} {m.unit}</td>
                                <td>
                                    <button onClick={() => {
                                        const qty = prompt('Quantity:');
                                        if (qty) useMaterial(m.id, parseInt(qty));
                                    }}>
                                        Use
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

export default SimpleProductionWorkflow;