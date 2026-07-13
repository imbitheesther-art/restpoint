// src/components/analysis/comprehensivedashboard.jsx
// Professional Mortuary Dashboard - Clean Modern Design
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container, Row, Col, Card, Spinner, Modal, Button,
  Badge, Form, Alert, Table, ProgressBar, Dropdown
} from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, PolarArea } from 'react-chartjs-2';
import {
  Users, TrendingUp, DollarSign, Clock, Box, Car, FileText,
  Shield, BarChart3, Calendar, Building, ArrowUpRight, AlertTriangle,
  CheckCircle, ClipboardList, Activity, FlaskConical, Truck,
  PieChart, ShoppingCart, Package, AlertCircle
} from 'lucide-react';
import { getTenantHeaders } from '../../api/endpoints';

// Register ChartJS components
ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler, RadialLinearScale
);

// Color scheme
const COLORS = {
  primary: '#1e3a8a', primaryLight: '#3b82f6',
  secondary: '#64748b', success: '#10b981',
  successLight: '#d1fae5', warning: '#f59e0b',
  warningLight: '#fef3c7', danger: '#ef4444',
  dangerLight: '#fee2e2', info: '#06b6d4',
  infoLight: '#cffafe', purple: '#8b5cf6',
  purpleLight: '#ede9fe', dark: '#1f2937',
  gray: '#6b7280', light: '#f3f4f6',
  white: '#ffffff', border: '#e5e7eb',
  chart1: '#3b82f6', chart2: '#10b981',
  chart3: '#f59e0b', chart4: '#ef4444',
  chart5: '#8b5cf6', chart6: '#06b6d4'
};

// API Base URL - use centralized config
import env from '../../config/env';
const API_BASE = `${env.FULL_API_URL}/dashboard/comprehensive`;

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error('Dashboard Error:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <Container fluid className="py-4">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body className="py-5">
              <AlertTriangle size={48} className="text-danger mb-3" />
              <h4 className="text-danger mb-3">Component Error</h4>
              <Button variant="primary" onClick={() => window.location.reload()}>Reload Dashboard</Button>
            </Card.Body>
          </Card>
        </Container>
      );
    }
    return this.props.children;
  }
}

// Safe data helpers
const getSafeData = (data, path, defaultValue = {}) => {
  try {
    const paths = path.split('.');
    let result = data;
    for (const p of paths) {
      result = result?.[p];
      if (result === undefined || result === null) return defaultValue;
    }
    return result || defaultValue;
  } catch { return defaultValue; }
};

const getSafeArray = (data, path, defaultValue = []) => {
  const result = getSafeData(data, path, defaultValue);
  return Array.isArray(result) ? result : defaultValue;
};

const getSafeNumber = (data, path, defaultValue = 0) => {
  const result = getSafeData(data, path, defaultValue);
  return typeof result === 'number' ? result : (parseFloat(result) || defaultValue);
};

// Stat Card
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, trendUp }) => {
  const colorMap = {
    primary: { bg: '#eff6ff', icon: COLORS.primaryLight, text: COLORS.primary },
    success: { bg: COLORS.successLight, icon: COLORS.success, text: '#065f46' },
    warning: { bg: COLORS.warningLight, icon: COLORS.warning, text: '#92400e' },
    danger: { bg: COLORS.dangerLight, icon: COLORS.danger, text: '#991b1b' },
    info: { bg: COLORS.infoLight, icon: COLORS.info, text: '#155e75' },
    purple: { bg: COLORS.purpleLight, icon: COLORS.purple, text: '#5b21b6' }
  };
  const theme = colorMap[color] || colorMap.primary;
  return (
    <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <p className="text-muted mb-2" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {title}
            </p>
            <h3 className="mb-1 fw-bold" style={{ color: theme.text, fontSize: '1.75rem' }}>
              {value ?? 'N/A'}
            </h3>
            {subtitle && <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>{subtitle}</p>}
            {trend !== undefined && (
              <div className="mt-2">
                <Badge bg={trendUp ? 'success' : 'danger'} style={{ fontSize: '0.7rem', padding: '4px 8px' }}>
                  {Math.abs(trend)}% {trendUp ? '↑' : '↓'}
                </Badge>
              </div>
            )}
          </div>
          <div className="d-flex align-items-center justify-content-center"
            style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: theme.bg, color: theme.icon }}>
            <Icon size={24} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

// Section Header
const SectionHeader = ({ title, icon: Icon, color }) => (
  <div className="d-flex align-items-center gap-3 mb-4">
    <div className="d-flex align-items-center justify-content-center"
      style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: color + '20', color }}>
      <Icon size={20} />
    </div>
    <h5 className="mb-0 fw-bold" style={{ color: COLORS.dark, fontSize: '1.1rem' }}>{title}</h5>
  </div>
);

// Chart Card
const ChartCard = ({ title, icon: Icon, color, children, height = '300px' }) => (
  <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
    <Card.Body className="p-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <Icon size={20} style={{ color }} />
        <h6 className="mb-0 fw-semibold" style={{ color: COLORS.dark, fontSize: '0.95rem' }}>{title}</h6>
      </div>
      <div style={{ height, position: 'relative' }}>{children}</div>
    </Card.Body>
  </Card>
);

// ============================================================
// MAIN DASHBOARD COMPONENT
// ============================================================
const ComprehensiveDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedYear] = useState(new Date().getFullYear());
  // Chart options
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15, font: { size: 11 }, color: COLORS.gray } },
      tooltip: { backgroundColor: COLORS.dark, titleColor: COLORS.white, bodyColor: COLORS.white, cornerRadius: 8, padding: 12 }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: COLORS.gray } },
      y: { grid: { color: COLORS.light }, ticks: { color: COLORS.gray }, beginAtZero: true }
    }
  };

  // Fetch data
  const fetchDashboardData = useCallback(async () => {
    try {
      const headers = getTenantHeaders();
      const url = API_BASE;
      console.log('[Dashboard] Fetching from:', url);

      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        throw new Error(result.message || 'API returned unsuccessful');
      }
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // Periodic refresh (every 5 minutes - reduced from 2 min to prevent spam)
  useEffect(() => {
    const interval = setInterval(fetchDashboardData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Chart click handler
  const handleChartClick = useCallback(async (elements, chart, type) => {
    if (!elements?.length) return;
    const element = elements[0];
    let label = chart.data.labels[element.index];
    let value = chart.data.datasets?.[0]?.data?.[element.index] || 0;
    setSelectedData({ label, value, type, details: [] });
    setShowModal(true);
  }, []);

  // Modal content
  const renderModalContent = () => {
    if (!selectedData) return <div className="text-center text-muted py-5">No data selected</div>;
    return (
      <div>
        <h5 className="mb-3">{selectedData.label}</h5>
        <Badge bg="info" className="px-3 py-2 mb-3">
          Value: {typeof selectedData.value === 'number' ? selectedData.value.toLocaleString() : selectedData.value}
        </Badge>
        <p className="text-muted">Detailed breakdown coming soon</p>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: COLORS.light }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <h5 className="text-muted mt-3">Loading Dashboard</h5>
          <p className="text-muted small">Fetching mortuary analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger" className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
          <Alert.Heading>Error Loading Dashboard</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" size="sm" onClick={fetchDashboardData}>Retry</Button>
        </Alert>
      </Container>
    );
  }

  // Extract data
  const deceased = getSafeData(data, 'deceased', {});
  const bookings = getSafeData(data, 'bookings', {});
  const revenue = getSafeData(data, 'revenue', {});
  const coffins = getSafeData(data, 'coffins', {});
  const chemicals = getSafeData(data, 'chemicals', {});
  const workshop = getSafeData(data, 'workshop', {});
  const fleet = getSafeData(bookings, 'fleet', {});

  const deceasedTrends = getSafeArray(deceased, 'monthlyTrends');
  const caseStatus = getSafeArray(deceased, 'caseStatus');
  const revenueTrends = getSafeArray(revenue, 'monthlyTrends');
  const coffinSales = getSafeArray(coffins, 'sales');
  const chemicalRecent = getSafeArray(chemicals, 'recent');
  const chemicalTrends = getSafeArray(chemicals, 'usageTrends');
  const productionStages = getSafeArray(workshop, 'production');
  const workshopOrders = getSafeData(workshop, 'orders', {});

  // Chart data
  const getCasesTrendsData = () => ({
    labels: deceasedTrends.map(d => d.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Cases Handled',
      data: deceasedTrends.length > 0 ? deceasedTrends.map(d => d.count) : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      borderColor: COLORS.chart1,
      backgroundColor: COLORS.chart1 + '20',
      borderWidth: 3, fill: true, tension: 0.4,
      pointBackgroundColor: COLORS.chart1, pointRadius: 5
    }]
  });

  const getRevenueChartData = () => ({
    labels: revenueTrends.length > 0 ? revenueTrends.map(r => r.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue (KES)',
      data: revenueTrends.length > 0 ? revenueTrends.map(r => parseFloat(r.revenue)) : [],
      borderColor: COLORS.chart2,
      backgroundColor: COLORS.chart2 + '20',
      borderWidth: 3, fill: true, tension: 0.4,
      pointBackgroundColor: COLORS.chart2, pointRadius: 5
    }]
  });

  const getCoFfinSalesData = () => ({
    labels: coffinSales.length > 0 ? coffinSales.map(c => c.type) : ['No Data'],
    datasets: [{
      label: 'Sold',
      data: coffinSales.length > 0 ? coffinSales.map(c => c.sold) : [0],
      backgroundColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5],
      borderWidth: 2, borderColor: COLORS.white
    }]
  });

  const getChemicalUsageData = () => {
    const chemNames = [...new Set(chemicalTrends.map(c => c.chemical))];
    const months = [...new Set(chemicalTrends.map(c => c.month))];
    return {
      labels: months.sort((a, b) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(a) - ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(b)),
      datasets: chemNames.slice(0, 4).map((chem, i) => ({
        label: chem,
        data: months.map(m => {
          const found = chemicalTrends.find(c => c.chemical === chem && c.month === m);
          return found ? parseFloat(found.quantity) : 0;
        }),
        borderColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4][i],
        backgroundColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4][i] + '20',
        borderWidth: 2, fill: true, tension: 0.3
      }))
    };
  };

  const getProductionData = () => ({
    labels: productionStages.map(s => s.stage || 'Unknown'),
    datasets: [{
      label: 'Completed',
      data: productionStages.map(s => s.completed || 0),
      backgroundColor: COLORS.success + '80',
      borderColor: COLORS.success, borderWidth: 1
    },
    {
      label: 'In Progress',
      data: productionStages.map(s => s.inProgress || 0),
      backgroundColor: COLORS.warning + '80',
      borderColor: COLORS.warning, borderWidth: 1
    }]
  });

  return (
    <ErrorBoundary>
      <Container fluid className="py-4" style={{ background: COLORS.light, minHeight: '100vh' }}>
        {/* Header */}
        <Card className="border-0 shadow-sm mb-4" style={{
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`
        }}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="text-white fw-bold mb-1">Mortuary Analytics Dashboard</h2>
                <p className="text-white-50 mb-0 small">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
              <Button variant="light" size="sm" onClick={fetchDashboardData}>
                Refresh Data
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* KEY METRICS */}
        <Row className="g-3 mb-4">
          <Col xs={6} lg={3}>
            <StatCard title="Total Deceased" value={deceased.total || '-'} subtitle="All time records" icon={ClipboardList} color="primary" />
          </Col>
          <Col xs={6} lg={3}>
            <StatCard title="Active Cases" value={deceased.active || deceased.total || '-'} subtitle="Currently in care" icon={CheckCircle} color="success" />
          </Col>
          <Col xs={6} lg={3}>
            <StatCard title="Total Revenue" value={revenue.total ? `KES ${(parseFloat(revenue.total) / 1000000).toFixed(1)}M` : '-'} subtitle="Cumulative" icon={DollarSign} color="success" />
          </Col>
          <Col xs={6} lg={3}>
            <StatCard title="Collection Rate" value={revenue.collectionRate ? `${revenue.collectionRate}%` : '-'} subtitle="Revenue collected" icon={Activity} color="info" />
          </Col>
        </Row>

        <Row className="g-3 mb-4">
          <Col xs={6} lg={2}>
            <StatCard title="This Week" value={deceased.thisWeek || 0} subtitle="Deceased admitted" icon={TrendingUp} color="warning" />
          </Col>
          <Col xs={6} lg={2}>
            <StatCard title="This Month" value={deceased.thisMonth || 0} subtitle="Deceased admitted" icon={Calendar} color="info" />
          </Col>
          <Col xs={6} lg={2}>
            <StatCard title="Bookings (Week)" value={bookings.thisWeek || 0} subtitle="Hearse bookings" icon={Car} color="purple" />
          </Col>
          <Col xs={6} lg={2}>
            <StatCard title="Fleet Available" value={`${fleet.available || 0}/${fleet.total || 0}`} subtitle="Hearses ready" icon={Truck} color={fleet.available > 0 ? 'success' : 'danger'} />
          </Col>
          <Col xs={6} lg={2}>
            <StatCard title="Outstanding" value={revenue.outstanding ? `KES ${(parseFloat(revenue.outstanding) / 1000).toFixed(0)}K` : '-'} subtitle="Pending payments" icon={AlertCircle} color="danger" />
          </Col>
          <Col xs={6} lg={2}>
            <StatCard title="Workshop" value={workshopOrders.total || 0} subtitle="Active orders" icon={Box} color="primary" />
          </Col>
        </Row>

        {/* DECEASED TRENDS */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <Card.Body className="p-4">
            <SectionHeader title="Deceased Trends & Case Status" icon={TrendingUp} color={COLORS.primary} />
            <Row className="g-4">
              <Col xl={8}>
                <ChartCard title="Cases Handled (12 Months)" icon={ArrowUpRight} color={COLORS.primary} height="300px">
                  <Line data={getCasesTrendsData()} options={chartOptions} />
                </ChartCard>
              </Col>
              <Col xl={4}>
                <ChartCard title="Case Status" icon={ClipboardList} color={COLORS.info} height="300px">
                  <Pie data={{
                    labels: caseStatus.map(s => s.status),
                    datasets: [{
                      data: caseStatus.map(s => s.count),
                      backgroundColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5],
                      borderWidth: 2, borderColor: COLORS.white
                    }]
                  }} options={chartOptions} />
                </ChartCard>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* BOOKINGS & FLEET */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <Card.Body className="p-4">
            <SectionHeader title="Hearse Bookings & Fleet" icon={Car} color={COLORS.info} />
            <Row className="g-3 mb-3">
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.infoLight }}>
                  <h4 className="fw-bold mb-0" style={{ color: COLORS.info }}>{bookings.total || 0}</h4>
                  <small className="text-muted">Total Bookings</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.successLight }}>
                  <h4 className="fw-bold mb-0" style={{ color: COLORS.success }}>{bookings.thisWeek || 0}</h4>
                  <small className="text-muted">This Week</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.warningLight }}>
                  <h4 className="fw-bold mb-0" style={{ color: '#92400e' }}>{bookings.booked || 0}</h4>
                  <small className="text-muted">Active Bookings</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.purpleLight }}>
                  <h4 className="fw-bold mb-0" style={{ color: COLORS.purple }}>{fleet.available || 0}/{fleet.total || 0}</h4>
                  <small className="text-muted">Fleet Available</small>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* REVENUE */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <Card.Body className="p-4">
            <SectionHeader title="Revenue Analytics" icon={DollarSign} color={COLORS.success} />
            <Row className="g-3 mb-3">
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3" style={{ backgroundColor: COLORS.successLight }}>
                  <small className="text-muted">Total Revenue</small>
                  <h5 className="fw-bold mb-0" style={{ color: '#065f46' }}>KES {parseFloat(revenue.total || 0).toLocaleString()}</h5>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3" style={{ backgroundColor: COLORS.infoLight }}>
                  <small className="text-muted">Collected</small>
                  <h5 className="fw-bold mb-0" style={{ color: '#155e75' }}>KES {parseFloat(revenue.collected || 0).toLocaleString()}</h5>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3" style={{ backgroundColor: COLORS.dangerLight }}>
                  <small className="text-muted">Outstanding</small>
                  <h5 className="fw-bold mb-0" style={{ color: COLORS.danger }}>KES {parseFloat(revenue.outstanding || 0).toLocaleString()}</h5>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3" style={{ backgroundColor: COLORS.warningLight }}>
                  <small className="text-muted">Collection Rate</small>
                  <h5 className="fw-bold mb-0" style={{ color: '#92400e' }}>{revenue.collectionRate || 0}%</h5>
                </div>
              </Col>
            </Row>
            <Row>
              <Col xl={12}>
                <ChartCard title="Monthly Revenue Trend" icon={TrendingUp} color={COLORS.success} height="300px">
                  <Line data={getRevenueChartData()} options={chartOptions} />
                </ChartCard>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* COFFINS & CHEMICALS */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <Card.Body className="p-4">
            <SectionHeader title="Inventory Management" icon={Box} color={COLORS.warning} />
            <Row className="g-4">
              <Col xl={6}>
                <ChartCard title="Coffin Sales" icon={ShoppingCart} color={COLORS.warning} height="300px">
                  <Bar data={getCoFfinSalesData()} options={chartOptions} />
                </ChartCard>
              </Col>
              <Col xl={3} lg={6}>
                <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                  <Card.Body className="p-3">
                    <h6 className="fw-bold mb-3">Coffin Stock</h6>
                    <h2 className="text-warning fw-bold">{coffins.totalStock || 0}</h2>
                    <small className="text-muted">{coffins.totalTypes || 0} types | KES {parseFloat(coffins.totalValue || 0).toLocaleString()}</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={3} lg={6}>
                <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                  <Card.Body className="p-3">
                    <h6 className="fw-bold mb-3">Chemical Usage (30d)</h6>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {chemicalRecent.slice(0, 5).map((c, i) => (
                        <div key={i} className="d-flex justify-content-between mb-2">
                          <small>{c.chemical}</small>
                          <small className="fw-bold">{c.totalUsed} {c.unit}</small>
                        </div>
                      ))}
                      {chemicalRecent.length === 0 && <small className="text-muted">No data</small>}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Row className="mt-4">
              <Col xl={12}>
                <ChartCard title="Chemical Usage Trends" icon={FlaskConical} color={COLORS.danger} height="250px">
                  <Line data={getChemicalUsageData()} options={chartOptions} />
                </ChartCard>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* WORKSHOP */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <Card.Body className="p-4">
            <SectionHeader title="Workshop Production" icon={Box} color={COLORS.purple} />
            <Row className="g-3 mb-3">
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.purpleLight }}>
                  <h4 className="fw-bold mb-0" style={{ color: COLORS.purple }}>{workshopOrders.total || 0}</h4>
                  <small className="text-muted">Total Orders</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.successLight }}>
                  <h4 className="fw-bold mb-0" style={{ color: COLORS.success }}>{workshopOrders.completed || 0}</h4>
                  <small className="text-muted">Completed</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.warningLight }}>
                  <h4 className="fw-bold mb-0" style={{ color: '#92400e' }}>{workshopOrders.pending || 0}</h4>
                  <small className="text-muted">Pending</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.infoLight }}>
                  <h4 className="fw-bold mb-0" style={{ color: '#155e75' }}>KES {workshopOrders.revenue ? (parseFloat(workshopOrders.revenue) / 1000).toFixed(0) + 'K' : '-'}</h4>
                  <small className="text-muted">Revenue</small>
                </div>
              </Col>
            </Row>
            {productionStages.length > 0 && (
              <Row>
                <Col xl={12}>
                  <ChartCard title="Production Stages" icon={Activity} color={COLORS.purple} height="250px">
                    <Bar data={getProductionData()} options={{
                      ...chartOptions,
                      scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: COLORS.light }, beginAtZero: true } },
                      plugins: { ...chartOptions.plugins, legend: { position: 'bottom', labels: { usePointStyle: true, padding: 10, font: { size: 10 } } } }
                    }} />
                  </ChartCard>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>

        {/* DRILL-DOWN MODAL */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: '1.1rem' }}>
              <BarChart3 size={20} className="me-2" style={{ color: COLORS.primary }} />
              Detailed Breakdown
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>{renderModalContent()}</Modal.Body>
          <Modal.Footer style={{ border: 'none' }}>
            <Button variant="outline-secondary" size="sm" onClick={() => setShowModal(false)} style={{ borderRadius: '8px' }}>Close</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </ErrorBoundary>
  );
};

export default ComprehensiveDashboard;