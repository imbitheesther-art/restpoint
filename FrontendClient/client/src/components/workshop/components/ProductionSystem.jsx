import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../modules/seo/useAuthstore';
import { useTenantStore } from '../../../modules/seo/useTenantStore';

// Production System - Simple and Working
const ProductionSystem = () => {
    const { user } = useAuthStore();
    const { tenant } = useTenantStore();
    const [orders, setOrders] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        coffinType: 'standard',
        woodType: 'mahogany',
        quantity: 1
    });

    useEffect(() => {
        if (tenant?.db_name) {
            fetchOrders();
            fetchMaterials();
            fetchWorkers();
        }
    }, [tenant]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`/api/workshop/orders?tenant=${tenant.db_name}`);
            const data = await res.json();
            setOrders(data.orders || data || []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchMaterials = async () => {
        try {
            const res = await fetch(`/api/workshop/materials?tenant=${tenant.db_name}`);
            const data = await res.json();
            setMaterials(data.materials || data || []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchWorkers = async () => {
        try {
            const res = await fetch(`/api/workshop/workers?tenant=${tenant.db_name}`);
            const data = await res.json();
            setWorkers(data.workers || data || []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCreateOrder = async () => {
        try {
            const res = await fetch('/api/workshop/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-db': tenant.db_name
                },
                body: JSON.stringify({
                    ...formData,
                    createdBy: user?.id,
                    status: 'pending',
                    stage: 'design'
                })
            });
            const data = await res.json();
            if (data.success || data.order) {
                setShowCreateModal(false);
                setFormData({
                    customerName: '',
                    customerPhone: '',
                    coffinType: 'standard',
                    woodType: 'mahogany',
                    quantity: 1
                });
                fetchOrders();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleUpdateStage = async (orderId, stage) => {
        try {
            await fetch(`/api/workshop/orders/${orderId}/stage`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-db': tenant.db_name
                },
                body: JSON.stringify({ stage })
            });
            fetchOrders();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleAssignWorker = async (orderId, workerId) => {
        try {
            await fetch(`/api/workshop/orders/${orderId}/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-db': tenant.db_name
                },
                body: JSON.stringify({ workerId })
            });
            fetchOrders();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleUseMaterial = async (materialId, quantity) => {
        try {
            await fetch('/api/workshop/materials/use', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-db': tenant.db_name
                },
                body: JSON.stringify({ materialId, quantity })
            });
            fetchMaterials();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Production System</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    Create Order
                </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ background: 'white', padding: '15px', flex: 1 }}>
                    <h3>Orders: {orders.length}</h3>
                </div>
                <div style={{ background: 'white', padding: '15px', flex: 1 }}>
                    <h3>Materials: {materials.length}</h3>
                </div>
                <div style={{ background: 'white', padding: '15px', flex: 1 }}>
                    <h3>Workers: {workers.length}</h3>
                </div>
            </div>

            <div style={{ background: 'white', padding: '20px', marginBottom: '20px' }}>
                <h2>Orders</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#eee' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Order</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Customer</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Stage</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Worker</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '10px' }}>{order.orderNumber || order.id}</td>
                                <td style={{ padding: '10px' }}>{order.customerName || 'N/A'}</td>
                                <td style={{ padding: '10px' }}>
                                    <select
                                        value={order.stage || 'design'}
                                        onChange={(e) => handleUpdateStage(order.id, e.target.value)}
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
                                <td style={{ padding: '10px' }}>
                                    <select
                                        value={order.workerId || ''}
                                        onChange={(e) => handleAssignWorker(order.id, e.target.value)}
                                    >
                                        <option value="">Unassigned</option>
                                        {workers.map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <button onClick={() => {
                                        const qty = prompt('Quantity:');
                                        if (qty) handleUseMaterial(order.id, parseInt(qty));
                                    }}>
                                        Use Material
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ background: 'white', padding: '20px' }}>
                <h2>Materials</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#eee' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Material</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Stock</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map(m => (
                            <tr key={m.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '10px' }}>{m.name}</td>
                                <td style={{ padding: '10px' }}>{m.quantity || m.currentStock} {m.unit}</td>
                                <td style={{ padding: '10px' }}>
                                    <button onClick={() => {
                                        const qty = prompt('Quantity:');
                                        if (qty) handleUseMaterial(m.id, parseInt(qty));
                                    }}>
                                        Use
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showCreateModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ background: 'white', padding: '20px', width: '400px' }}>
                        <h2>Create Order</h2>
                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="text"
                                placeholder="Customer Name"
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="tel"
                                placeholder="Customer Phone"
                                value={formData.customerPhone}
                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <select
                                value={formData.coffinType}
                                onChange={(e) => setFormData({ ...formData, coffinType: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            >
                                <option value="standard">Standard</option>
                                <option value="premium">Premium</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <select
                                value={formData.woodType}
                                onChange={(e) => setFormData({ ...formData, woodType: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            >
                                <option value="mahogany">Mahogany</option>
                                <option value="oak">Oak</option>
                                <option value="pine">Pine</option>
                                <option value="cedar">Cedar</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <input
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div>
                            <button onClick={() => setShowCreateModal(false)} style={{ marginRight: '10px' }}>
                                Cancel
                            </button>
                            <button onClick={handleCreateOrder}>
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductionSystem;