import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../context/socketContext';
import { useSocketEvents } from '../hooks/useSocketEvents';
import {
    Package, AlertTriangle, TrendingDown, TrendingUp,
    Filter, Search, Plus, DollarSign, History
} from 'lucide-react';

const MaterialsInventory = ({ materials: propMaterials }) => {
    const [localMaterials, setLocalMaterials] = useState(propMaterials || []);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const { connected } = useSocket();

    // Sync with parent materials
    useEffect(() => {
        if (propMaterials) {
            setLocalMaterials(propMaterials);
        }
    }, [propMaterials]);

    // Real-time material updates
    useSocketEvents({
        onMaterialCreated: (material) => {
            setLocalMaterials(prev => [...prev, material]);
        },
        onMaterialUpdated: (updated) => {
            setLocalMaterials(prev => prev.map(m => m.id === updated.id ? updated : m));
        },
        onMaterialDeleted: (data) => {
            setLocalMaterials(prev => prev.filter(m => m.id !== data.id));
        },
        onMaterialUsed: (usage) => {
            setLocalMaterials(prev =>
                prev.map(m => {
                    if (m.id === usage.material_id) {
                        const newQuantity = m.quantity - usage.quantity_used;
                        // Check if this triggers low stock
                        if (newQuantity <= m.min_stock_level && m.quantity > m.min_stock_level) {
                            setLowStockAlerts(prev => {
                                if (!prev.find(alert => alert.id === m.id)) {
                                    return [...prev, m];
                                }
                                return prev;
                            });
                        }
                        return { ...m, quantity: newQuantity };
                    }
                    return m;
                })
            );
        },
        onMaterialLowStock: (material) => {
            setLowStockAlerts(prev => {
                if (!prev.find(alert => alert.id === material.id)) {
                    return [...prev, material];
                }
                return prev;
            });
        }
    });

    // Filter materials
    useEffect(() => {
        let filtered = localMaterials;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(m =>
                m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (filterCategory !== 'all') {
            filtered = filtered.filter(m => m.category === filterCategory);
        }

        // Low stock filter
        if (showLowStockOnly) {
            filtered = filtered.filter(m => m.quantity <= m.min_stock_level);
        }

        setFilteredMaterials(filtered);
    }, [localMaterials, searchTerm, filterCategory, showLowStockOnly]);

    // Get unique categories
    const categories = [...new Set(localMaterials.map(m => m.category))];

    // Calculate stats
    const totalMaterials = localMaterials.length;
    const totalValue = localMaterials.reduce((sum, m) => sum + (m.quantity * m.unit_price), 0);
    const lowStockCount = localMaterials.filter(m => m.quantity <= m.min_stock_level).length;
    const outOfStockCount = localMaterials.filter(m => m.quantity === 0).length;

    const getStockStatus = (material) => {
        if (material.quantity === 0) return { label: 'Out of Stock', color: '#EF4444', bg: '#FEE2E2' };
        if (material.quantity <= material.min_stock_level) return { label: 'Low Stock', color: '#F59E0B', bg: '#FEF3C7' };
        return { label: 'In Stock', color: '#14DD3C', bg: '#D1FAE5' };
    };

    const getStockPercentage = (material) => {
        const maxStock = material.min_stock_level * 3; // 3x min level = 100%
        return Math.min((material.quantity / maxStock) * 100, 100);
    };

    return (
        <div style={{
            background: '#eef2ff',
            borderRadius: '20px',
            boxShadow: '0 18px 45px rgba(15,23,42,0.08)',
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '1.1rem 1rem',
                background: 'linear-gradient(180deg, #ffffff 0%, #ecfeff 100%)',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                            Materials Inventory & Stock Tracking
                        </h3>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem', color: '#475569', maxWidth: '44rem' }}>
                            Keep workshop supply levels polished with material cards, urgent stock alerts, and real-time inventory visibility.
                        </p>
                    </div>
                    {connected && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.55rem 0.9rem',
                            background: '#ecfdf5',
                            border: '1px solid #34d399',
                            borderRadius: '14px',
                            fontSize: '0.85rem',
                            color: '#166534'
                        }}>
                            <div style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: '#16a34a',
                                boxShadow: '0 0 8px rgba(22,163,74,0.35)'
                            }} />
                            Live material sync
                        </div>
                    )}
                </div>
            </div>

            <div style={{ padding: '1rem 1rem 0 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                    {[
                        { title: 'Total Materials', value: totalMaterials, accent: '#eef2ff', color: '#0f172a', icon: Package },
                        { title: 'Inventory Value', value: `₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, accent: '#edf4ff', color: '#1d4ed8', icon: DollarSign },
                        { title: 'Low Stock', value: lowStockCount, accent: '#fef3c7', color: '#b45309', icon: AlertTriangle },
                        { title: 'Out of Stock', value: outOfStockCount, accent: '#fee2e2', color: '#991b1b', icon: TrendingDown }
                    ].map((stat) => (
                        <div key={stat.title} style={{
                            background: stat.accent,
                            borderRadius: '18px',
                            padding: '0.9rem 1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid rgba(148,163,184,0.18)',
                            boxShadow: '0 8px 18px rgba(15,23,42,0.05)'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: '0.35rem' }}>{stat.title}</div>
                                <div style={{ fontSize: '1.45rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                            </div>
                            <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(255,255,255,0.92)', display: 'grid', placeItems: 'center', boxShadow: 'inset 0 1px 2px rgba(15,23,42,0.08)' }}>
                                <stat.icon size={20} color={stat.color} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {lowStockAlerts.length > 0 && (
                <div style={{
                        margin: '1rem 1rem 0 1rem',
                        padding: '0.85rem 1rem',
                    background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)',
                    border: '1px solid #f59e0b',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}>
                    <AlertTriangle size={24} color="#b45309" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '0.2rem' }}>
                            {lowStockAlerts.length} low stock material{lowStockAlerts.length > 1 ? 's' : ''} need immediate attention
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#7c2d12' }}>
                            {lowStockAlerts.slice(0, 4).map(m => m.name).join(', ')}{lowStockAlerts.length > 4 ? ` and ${lowStockAlerts.length - 4} more` : ''}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                        style={{
                            padding: '0.55rem 1rem',
                            background: '#ffffff',
                            border: '1px solid #f59e0b',
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: '#92400e',
                            cursor: 'pointer'
                        }}
                    >
                        {showLowStockOnly ? 'Show All' : 'View Alerts'}
                    </button>
                </div>
            )}

            <div style={{ padding: '1rem 1rem 0 1rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={18} style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8'
                    }} />
                    <input
                        type="text"
                        placeholder="Search materials..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.65rem 0.9rem 0.65rem 2.9rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '14px',
                            fontSize: '0.95rem',
                            outline: 'none',
                            background: '#ffffff'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{
                            padding: '0.65rem 0.9rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '14px',
                            fontSize: '0.95rem',
                            background: '#ffffff',
                            cursor: 'pointer',
                            minWidth: '160px'
                        }}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                        style={{
                            padding: '0.65rem 0.9rem',
                            background: showLowStockOnly ? '#fef3c7' : '#ffffff',
                            border: `1px solid ${showLowStockOnly ? '#f59e0b' : '#cbd5e1'}`,
                            borderRadius: '14px',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: showLowStockOnly ? '#92400e' : '#475569',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.55rem'
                        }}
                    >
                        <Filter size={16} />
                        Low Stock Only
                    </button>
                </div>
            </div>

            <div style={{ padding: '1rem 1rem 1rem 1rem', overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '860px',
                    background: 'white',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: '0 14px 35px rgba(15,23,42,0.06)'
                }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '0.9rem 1rem', textAlign: 'left', fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Material</th>
                            <th style={{ padding: '0.9rem 1rem', textAlign: 'left', fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Category</th>
                            <th style={{ padding: '0.9rem 1rem', textAlign: 'right', fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Quantity</th>
                            <th style={{ padding: '0.9rem 1rem', textAlign: 'right', fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Unit Price</th>
                            <th style={{ padding: '0.9rem 1rem', textAlign: 'right', fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Total Value</th>
                            <th style={{ padding: '0.9rem 1rem', textAlign: 'left', fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Stock</th>
                            <th style={{ padding: '0.9rem 1rem', textAlign: 'center', fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMaterials.map(material => {
                            const status = getStockStatus(material);
                            const stockPercent = getStockPercentage(material);
                            const totalValue = material.quantity * material.unit_price;
                            const lowStock = material.quantity <= material.min_stock_level;
                            return (
                                <tr key={material.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{material.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>ID {material.id}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', color: '#475569' }}>{material.category || 'General'}</td>
                                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: lowStock ? '#b91c1c' : '#0f172a', fontWeight: 700 }}>{material.quantity} {material.unit}</td>
                                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#475569' }}>₹{Number(material.unit_price || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#0f172a', fontWeight: 700 }}>₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                            <div style={{ width: `${stockPercent}%`, height: '100%', background: lowStock ? '#ef4444' : '#22c55e', transition: 'width 0.35s ease' }} />
                                        </div>
                                        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#64748b' }}>{Math.round(stockPercent)}% capacity</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '999px',
                                            background: status.bg,
                                            color: status.color,
                                            fontSize: '0.78rem',
                                            fontWeight: 700
                                        }}>
                                            {status.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredMaterials.length === 0 && (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#94a3b8'
                    }}>
                        <Package size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p>No materials found</p>
                    </div>
                )}
            </div>

            <div style={{
                padding: '0 1.75rem 1.5rem 1.75rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.88rem',
                color: '#64748b'
            }}>
                <div>
                    Showing {filteredMaterials.length} of {localMaterials.length} materials
                </div>
                {connected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={14} />
                        <span>Real-time stock updates active</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaterialsInventory;