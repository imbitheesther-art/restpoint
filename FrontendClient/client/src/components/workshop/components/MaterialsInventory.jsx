import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../context/socketContext';
import { useSocketEvents } from '../hooks/useSocketEvents';
import {
    Package, AlertTriangle, TrendingDown, TrendingUp,
    Filter, Search, Plus, Minus, History
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
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}>
            {/* Header */}
            <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                        Materials Inventory & Stock Tracking
                    </h3>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        Real-time material usage and stock levels
                    </p>
                </div>
                {connected && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 0.8rem',
                        background: '#f0fdf4',
                        border: '1px solid #14DD3C',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        color: '#166534'
                    }}>
                        <div style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#14DD3C',
                            boxShadow: '0 0 6px #14DD3C'
                        }} />
                        Live Tracking
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                padding: '1.5rem',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <div style={{
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        Total Materials
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                        {totalMaterials}
                    </div>
                </div>
                <div style={{
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        Total Value
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#14DD3C' }}>
                        ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                </div>
                <div style={{
                    padding: '1rem',
                    background: lowStockCount > 0 ? '#FEF3C7' : 'white',
                    borderRadius: '8px',
                    border: `1px solid ${lowStockCount > 0 ? '#F59E0B' : '#e2e8f0'}`
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertTriangle size={14} color={lowStockCount > 0 ? '#F59E0B' : '#64748b'} />
                        Low Stock Alerts
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: lowStockCount > 0 ? '#F59E0B' : '#0f172a' }}>
                        {lowStockCount}
                    </div>
                </div>
                <div style={{
                    padding: '1rem',
                    background: outOfStockCount > 0 ? '#FEE2E2' : 'white',
                    borderRadius: '8px',
                    border: `1px solid ${outOfStockCount > 0 ? '#EF4444' : '#e2e8f0'}`
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <TrendingDown size={14} color={outOfStockCount > 0 ? '#EF4444' : '#64748b'} />
                        Out of Stock
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: outOfStockCount > 0 ? '#EF4444' : '#0f172a' }}>
                        {outOfStockCount}
                    </div>
                </div>
            </div>

            {/* Low Stock Alerts Banner */}
            {lowStockAlerts.length > 0 && (
                <div style={{
                    margin: '1.5rem',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    border: '1px solid #F59E0B',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <AlertTriangle size={24} color="#F59E0B" />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#92400E', marginBottom: '0.25rem' }}>
                            Low Stock Alert - {lowStockAlerts.length} item{lowStockAlerts.length > 1 ? 's' : ''} need attention
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#A16207' }}>
                            {lowStockAlerts.slice(0, 3).map(m => m.name).join(', ')}
                            {lowStockAlerts.length > 3 && ` and ${lowStockAlerts.length - 3} more`}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'white',
                            border: '1px solid #F59E0B',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            color: '#92400E',
                            cursor: 'pointer'
                        }}
                    >
                        {showLowStockOnly ? 'Show All' : 'View Alerts'}
                    </button>
                </div>
            )}

            {/* Filters */}
            <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
            }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={16} style={{
                        position: 'absolute',
                        left: '0.75rem',
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
                            padding: '0.6rem 0.75rem 0.6rem 2.5rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            outline: 'none'
                        }}
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{
                        padding: '0.6rem 1rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        background: 'white',
                        cursor: 'pointer',
                        minWidth: '150px'
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
                        padding: '0.6rem 1rem',
                        background: showLowStockOnly ? '#FEF3C7' : 'white',
                        border: `1px solid ${showLowStockOnly ? '#F59E0B' : '#cbd5e1'}`,
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: showLowStockOnly ? '#92400E' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Filter size={14} />
                    Low Stock Only
                </button>
            </div>

            {/* Materials Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.9rem'
                }}>
                    <thead>
                        <tr style={{
                            background: '#f8fafc',
                            borderBottom: '2px solid #e2e8f0'
                        }}>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                Material
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                Category
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                In Stock
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                Unit Price
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                Total Value
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                Stock Level
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMaterials.map(material => {
                            const status = getStockStatus(material);
                            const stockPercent = getStockPercentage(material);
                            const totalValue = material.quantity * material.unit_price;

                            return (
                                <tr
                                    key={material.id}
                                    style={{
                                        borderBottom: '1px solid #e2e8f0',
                                        transition: 'background-color 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{material.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                                            ID: {material.id}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>
                                        {material.category}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{
                                                fontWeight: 600,
                                                color: material.quantity <= material.min_stock_level ? '#EF4444' : '#0f172a',
                                                fontSize: '1rem'
                                            }}>
                                                {material.quantity}
                                            </span>
                                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                                {material.unit}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                                            Min: {material.min_stock_level} {material.unit}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>
                                        ₹{material.unit_price}/{material.unit}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#0f172a' }}>
                                        ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ width: '120px' }}>
                                            <div style={{
                                                width: '100%',
                                                height: '6px',
                                                background: '#e2e8f0',
                                                borderRadius: '3px',
                                                overflow: 'hidden',
                                                marginBottom: '0.3rem'
                                            }}>
                                                <div style={{
                                                    width: `${stockPercent}%`,
                                                    height: '100%',
                                                    background: stockPercent < 30 ? '#EF4444' : stockPercent < 60 ? '#F59E0B' : '#14DD3C',
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                {Math.round(stockPercent)}% capacity
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 500,
                                            background: status.bg,
                                            color: status.color,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.4rem'
                                        }}>
                                            {status.label === 'Low Stock' && <AlertTriangle size={12} />}
                                            {status.label === 'Out of Stock' && <TrendingDown size={12} />}
                                            {status.label === 'In Stock' && <TrendingUp size={12} />}
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

            {/* Footer */}
            <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem',
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