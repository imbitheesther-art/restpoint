import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    Users, DollarSign, Package, Activity, TrendingUp, Clock,
    UserPlus, FileText, Calendar, ChevronRight, AlertTriangle,
    Loader2, RefreshCw, Box, ArrowUp, ArrowDown
} from 'lucide-react';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

// ============================================================
// COLOR SYSTEM
// ============================================================
const Colors = {
    primary: '#1A1D24',
    accent: '#3D4F47',
    accentLight: '#E8F0FE',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899',
    bg: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E8ECF0',
    text: '#1A1D24',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
};

const CHART_COLORS = ['#3D4F47', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

const PIE_COLORS = ['#3D4F47', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'];

// ============================================================
// CSS STYLES
// ============================================================
const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  .dash-container {
    min-height: 100vh;
    background: ${Colors.bg};
    padding: 20px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .dash-header {
    margin-bottom: 24px;
  }
  
  .dash-header h1 {
    font-size: 24px;
    font-weight: 700;
    color: ${Colors.text};
    margin-bottom: 4px;
  }
  
  .dash-header p {
    font-size: 14px;
    color: ${Colors.textSecondary};
  }
  
  .dash-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .dash-stat-card {
    background: ${Colors.card};
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    border: 1px solid ${Colors.border};
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .dash-stat-card:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }
  
  .dash-stat-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  
  .dash-stat-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .dash-stat-value {
    font-size: 28px;
    font-weight: 700;
    color: ${Colors.text};
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .dash-stat-label {
    font-size: 13px;
    color: ${Colors.textSecondary};
    font-weight: 500;
  }
  
  .dash-stat-change {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 6px;
    margin-top: 8px;
  }
  
  .dash-stat-change.up {
    background: #D1FAE5;
    color: #065F46;
  }
  
  .dash-stat-change.down {
    background: #FEE2E2;
    color: #991B1B;
  }
  
  .dash-charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .dash-chart-card {
    background: ${Colors.card};
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    border: 1px solid ${Colors.border};
  }
  
  .dash-chart-card.full {
    grid-column: 1 / -1;
  }
  
  .dash-chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .dash-chart-title {
    font-size: 16px;
    font-weight: 600;
    color: ${Colors.text};
  }
  
  .dash-chart-subtitle {
    font-size: 12px;
    color: ${Colors.textSecondary};
  }
  
  .dash-activity {
    background: ${Colors.card};
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    border: 1px solid ${Colors.border};
    margin-bottom: 24px;
  }
  
  .dash-activity-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid ${Colors.border};
  }
  
  .dash-activity-item:last-child {
    border-bottom: none;
  }
  
  .dash-activity-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .dash-activity-text {
    flex: 1;
    font-size: 14px;
    color: ${Colors.text};
  }
  
  .dash-activity-time {
    font-size: 12px;
    color: ${Colors.textMuted};
    white-space: nowrap;
  }
  
  .dash-quick-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }
  
  .dash-quick-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 12px;
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .dash-quick-btn:hover {
    transform: translateY(-2px);
  }
  
  .dash-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    color: ${Colors.textSecondary};
  }
  
  .dash-loading svg {
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes countUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-count {
    animation: countUp 0.5s ease-out;
  }
  
  @media (max-width: 768px) {
    .dash-container { padding: 12px; }
    .dash-header h1 { font-size: 20px; }
    .dash-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .dash-charts-grid { grid-template-columns: 1fr; }
    .dash-stat-value { font-size: 22px; }
    .dash-stat-card { padding: 16px; }
    .dash-chart-card { padding: 16px; }
    .dash-quick-btn { flex: 1; justify-content: center; }
  }
  
  @media (max-width: 480px) {
    .dash-stats-grid { grid-template-columns: 1fr; }
  }
`;

// ============================================================
// ANIMATED COUNTER
// ============================================================
const AnimatedCounter = ({ value, duration = 1000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value) || 0;
        if (start === end) return;

        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count.toLocaleString()}</span>;
};

// ============================================================
// MAIN DASHBOARD COMPONENT
// ============================================================
const DashboardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalDeceased: 0,
        activeCases: 0,
        totalRevenue: 0,
        coffinsInStock: 0,
        monthlyDeaths: [],
        revenueTrend: [],
        serviceDistribution: [],
        coffinSales: [],
        recentActivity: [],
    });

    const getTenantSlug = () => {
        return localStorage.getItem('tenantSlug') ||
            localStorage.getItem('tenant_slug') || 'default';
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch deceased records for stats
            const deceasedRes = await api.get(ENDPOINTS.DECEASED.LIST);
            const deceasedData = deceasedRes.data?.data || deceasedRes.data || [];
            const deceasedList = Array.isArray(deceasedData) ? deceasedData : [];

            // Count stats
            const totalDeceased = deceasedList.length;
            const activeCases = deceasedList.filter(d => {
                const s = (d.status || '').toLowerCase();
                return !['completed', 'released', 'discharged'].includes(s);
            }).length;

            // Monthly deaths for chart
            const monthlyMap = {};
            deceasedList.forEach(d => {
                const date = d.date_of_death || d.created_at;
                if (date) {
                    const m = new Date(date).toLocaleString('default', { month: 'short', year: '2-digit' });
                    monthlyMap[m] = (monthlyMap[m] || 0) + 1;
                }
            });
            const monthlyDeaths = Object.entries(monthlyMap)
                .map(([month, count]) => ({ month, deaths: count }))
                .slice(-12);

            // Service distribution (mock - you can replace with real data)
            const serviceDistribution = [
                { name: 'Burial', value: 45 },
                { name: 'Cremation', value: 25 },
                { name: 'Memorial', value: 18 },
                { name: 'Other', value: 12 },
            ];

            // Generate revenue trend (mock)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const revenueTrend = months.map((m, i) => ({
                month: m,
                revenue: Math.floor(Math.random() * 500000) + 100000,
                cases: Math.floor(Math.random() * 30) + 5,
            }));

            // Coffin sales
            const coffinSales = months.map((m, i) => ({
                month: m,
                sales: Math.floor(Math.random() * 20) + 5,
            }));

            // Recent activity
            const recentActivity = deceasedList.slice(0, 10).map(d => ({
                id: d.id || d.deceased_id,
                text: d.full_name || 'Unknown',
                status: d.status || 'received',
                time: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Recently',
            }));

            // Try to get coffin stock
            let coffinsInStock = 0;
            try {
                const coffinRes = await api.get(ENDPOINTS.COFFINS.LIST);
                const coffinData = coffinRes.data?.data || coffinRes.data || [];
                if (Array.isArray(coffinData)) {
                    coffinsInStock = coffinData.reduce((sum, c) => sum + (parseInt(c.quantity) || 0), 0);
                }
            } catch (e) {
                // Coffin service might not be available
                coffinsInStock = 0;
            }

            setStats({
                totalDeceased,
                activeCases,
                totalRevenue: revenueTrend.reduce((sum, m) => sum + m.revenue, 0),
                coffinsInStock,
                monthlyDeaths,
                revenueTrend,
                serviceDistribution,
                coffinSales,
                recentActivity,
            });
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleRegisterDeceased = () => {
        navigate(`/tenant/${getTenantSlug()}/deceased/register`);
    };

    const handleViewDeceased = () => {
        navigate(`/tenant/${getTenantSlug()}/all-deceased`);
    };

    const handleViewCoffins = () => {
        navigate(`/tenant/${getTenantSlug()}/coffins`);
    };

    const formatCurrency = (amount) => {
        return `KES ${(parseInt(amount) || 0).toLocaleString()}`;
    };

    const getStatusColor = (status) => {
        const map = {
            'received': '#3B82F6',
            'new': '#3B82F6',
            'undercare': '#F59E0B',
            'pending': '#F59E0B',
            'ready': '#10B981',
            'completed': '#6B7280',
            'released': '#6B7280',
        };
        return map[status?.toLowerCase()] || '#9CA3AF';
    };

    if (loading) {
        return (
            <>
                <style>{styles}</style>
                <div className="dash-container">
                    <div className="dash-loading">
                        <Loader2 size={40} color={Colors.accent} />
                        <div style={{ fontSize: '16px', fontWeight: 500 }}>Loading Dashboard...</div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <style>{styles}</style>
                <div className="dash-container">
                    <div className="dash-loading">
                        <AlertTriangle size={40} color={Colors.danger} />
                        <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>Error Loading Dashboard</div>
                        <div style={{ fontSize: '14px', color: Colors.textSecondary, marginBottom: '16px' }}>{error}</div>
                        <button
                            className="dash-quick-btn"
                            style={{ background: Colors.accent, color: 'white' }}
                            onClick={fetchDashboardData}
                        >
                            <RefreshCw size={16} /> Retry
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{styles}</style>
            <div className="dash-container">
                {/* Header */}
                <div className="dash-header">
                    <h1>Dashboard</h1>
                    <p>Overview of your mortuary operations</p>
                </div>

                {/* Quick Actions */}
                <div className="dash-quick-actions">
                    <button
                        className="dash-quick-btn"
                        style={{ background: Colors.accent, color: 'white' }}
                        onClick={handleRegisterDeceased}
                    >
                        <UserPlus size={18} /> Register Deceased
                    </button>
                    <button
                        className="dash-quick-btn"
                        style={{ background: Colors.info, color: 'white' }}
                        onClick={handleViewDeceased}
                    >
                        <FileText size={18} /> View Records
                    </button>
                    <button
                        className="dash-quick-btn"
                        style={{ background: Colors.warning, color: 'white' }}
                        onClick={handleViewCoffins}
                    >
                        <Box size={18} /> Coffin Inventory
                    </button>
                    <button
                        className="dash-quick-btn"
                        style={{ background: Colors.card, color: Colors.text, border: `2px solid ${Colors.border}` }}
                        onClick={fetchDashboardData}
                    >
                        <RefreshCw size={18} /> Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="dash-stats-grid">
                    <motion.div
                        className="dash-stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                    >
                        <div className="dash-stat-header">
                            <div>
                                <div className="dash-stat-value animate-count">
                                    <AnimatedCounter value={stats.totalDeceased} />
                                </div>
                                <div className="dash-stat-label">Total Deceased Records</div>
                            </div>
                            <div className="dash-stat-icon" style={{ background: '#E8F0FE' }}>
                                <Users size={20} color={Colors.accent} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="dash-stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="dash-stat-header">
                            <div>
                                <div className="dash-stat-value animate-count">
                                    <AnimatedCounter value={stats.activeCases} />
                                </div>
                                <div className="dash-stat-label">Active Cases</div>
                            </div>
                            <div className="dash-stat-icon" style={{ background: '#D1FAE5' }}>
                                <Activity size={20} color={Colors.success} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="dash-stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <div className="dash-stat-header">
                            <div>
                                <div className="dash-stat-value animate-count">
                                    {formatCurrency(stats.totalRevenue)}
                                </div>
                                <div className="dash-stat-label">Total Revenue (Est.)</div>
                            </div>
                            <div className="dash-stat-icon" style={{ background: '#FEF3C7' }}>
                                <DollarSign size={20} color={Colors.warning} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="dash-stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="dash-stat-header">
                            <div>
                                <div className="dash-stat-value animate-count">
                                    <AnimatedCounter value={stats.coffinsInStock} />
                                </div>
                                <div className="dash-stat-label">Coffins in Stock</div>
                            </div>
                            <div className="dash-stat-icon" style={{ background: '#EDE9FE' }}>
                                <Package size={20} color={Colors.purple} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Charts */}
                <div className="dash-charts-grid">
                    {/* Bar Chart - Monthly Deaths */}
                    <motion.div
                        className="dash-chart-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <div className="dash-chart-header">
                            <div>
                                <div className="dash-chart-title">📊 Monthly Registrations</div>
                                <div className="dash-chart-subtitle">Deceased registrations per month</div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={stats.monthlyDeaths.length > 0 ? stats.monthlyDeaths :
                                [{ month: 'No Data', deaths: 0 }]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="deaths" fill={Colors.accent} radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Line Chart - Revenue Trends */}
                    <motion.div
                        className="dash-chart-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="dash-chart-header">
                            <div>
                                <div className="dash-chart-title">📈 Revenue Trends</div>
                                <div className="dash-chart-subtitle">Monthly revenue overview</div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={stats.revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`KES ${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke={Colors.success}
                                    strokeWidth={2}
                                    dot={{ fill: Colors.success, strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: Colors.success }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Donut Chart - Service Distribution */}
                    <motion.div
                        className="dash-chart-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <div className="dash-chart-header">
                            <div>
                                <div className="dash-chart-title">🥧 Service Distribution</div>
                                <div className="dash-chart-subtitle">Types of services rendered</div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={stats.serviceDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {stats.serviceDistribution.map((entry, index) => (
                                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value) => <span style={{ fontSize: '12px', color: Colors.textSecondary }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Area Chart - Coffin Sales */}
                    <motion.div
                        className="dash-chart-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="dash-chart-header">
                            <div>
                                <div className="dash-chart-title">📉 Coffin Sales</div>
                                <div className="dash-chart-subtitle">Monthly coffin sales volume</div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={stats.coffinSales}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke={Colors.info}
                                    fill={Colors.info}
                                    fillOpacity={0.15}
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Recent Activity */}
                <motion.div
                    className="dash-activity"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                >
                    <div className="dash-chart-header">
                        <div>
                            <div className="dash-chart-title">🕐 Recent Activity</div>
                            <div className="dash-chart-subtitle">Latest deceased records and updates</div>
                        </div>
                    </div>
                    {stats.recentActivity.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: Colors.textSecondary }}>
                            No recent activity
                        </div>
                    ) : (
                        stats.recentActivity.map((item, idx) => (
                            <div className="dash-activity-item" key={item.id || idx}>
                                <div className="dash-activity-dot" style={{ background: getStatusColor(item.status) }} />
                                <div className="dash-activity-text">
                                    <strong>{item.text}</strong> - {item.status}
                                </div>
                                <div className="dash-activity-time">{item.time}</div>
                            </div>
                        ))
                    )}
                </motion.div>
            </div>
        </>
    );
};

export default DashboardPage;