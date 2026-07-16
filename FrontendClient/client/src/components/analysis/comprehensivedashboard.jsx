// src/components/analysis/comprehensivedashboard.jsx
// Enhanced Professional Dashboard with Branch Comparison, Charts, AI Insights
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container, Row, Col, Card, Spinner, Alert, Button, Badge, Dropdown, Form, Table, ProgressBar
} from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler, RadialLinearScale
} from "chart.js";
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
import {
  TrendingUp, Zap, Users, ShoppingCart, Truck, AlertTriangle,
  Clock, CheckCircle, Activity, FlaskConical, Box, MapPin, RotateCw, Calendar,
  Building2, Trophy, ArrowUp, ArrowDown, DollarSign, Car, RefreshCw, Star
} from "lucide-react";
import { getTenantHeaders } from "../../api/endpoints";
import env from "../../config/env";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler, RadialLinearScale
);

const COLORS = {
  primary: "#df2117ff", primaryLight: "#3b82f6",
  secondary: "#64748b", success: "#10b981", successLight: "#d1fae5",
  warning: "#f59e0b", warningLight: "#fef3c7", danger: "#ef4444",
  dangerLight: "#fee2e2", info: "#06b6d4", infoLight: "#cffafe",
  purple: "#8b5cf6", purpleLight: "#ede9fe", dark: "#1f2937",
  gray: "#6b7280", light: "#f3f4f6", white: "#ffffff", border: "#e5e7eb",
  chart1: "#3b82f6", chart2: "#10b981", chart3: "#f59e0b", chart4: "#ef4444",
  chart5: "#8b5cf6", chart6: "#06b6d4", chart7: "#ec4899", chart8: "#14b8a6"
};

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: "12px" }}>
    <Card.Body className="p-3">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <Icon size={24} style={{ color: COLORS[color] || COLORS.primary }} />
        <span className="fw-bold" style={{ color: COLORS.dark, fontSize: "1.5rem" }}>{value}</span>
      </div>
      <small className="text-muted d-block">{title}</small>
      {subtitle && <small className="text-muted d-block" style={{ fontSize: "0.8rem" }}>{subtitle}</small>}
    </Card.Body>
  </Card>
);

const ChartCard = ({ title, icon: Icon, color, children, height = "300px" }) => (
  <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: "12px" }}>
    <Card.Body className="p-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <Icon size={20} style={{ color }} />
        <h6 className="mb-0 fw-semibold">{title}</h6>
      </div>
      <div style={{ height, position: "relative" }}>{children}</div>
    </Card.Body>
  </Card>
);

const SectionHeader = ({ title, icon: Icon, color }) => (
  <div className="d-flex align-items-center gap-3 mb-4 pb-3" style={{ borderBottom: `2px solid ${COLORS.border}` }}>
    <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={20} style={{ color }} />
    </div>
    <h5 className="mb-0 fw-bold" style={{ color: COLORS.dark }}>{title}</h5>
  </div>
);

const BatteryGauge = ({ value, max, label }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const barColor = pct < 20 ? COLORS.danger : pct < 50 ? COLORS.warning : COLORS.success;
  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between small mb-1">
        <span>{label}</span>
        <span style={{ color: barColor }}>{value}/{max} ({pct}%)</span>
      </div>
      <div style={{ height: "12px", borderRadius: "6px", background: COLORS.light, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: "6px", background: `linear-gradient(90deg, ${barColor}, ${barColor}dd)`, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
};

const BranchComparisonTable = ({ branches }) => {
  if (!branches || Object.keys(branches).length === 0) return null;
  const arr = Object.values(branches);
  return (
    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
      <Card.Body className="p-4">
        <SectionHeader title="Branch Comparison" icon={Building2} color={COLORS.purple} />
        <Table responsive hover size="sm">
          <thead>
            <tr>
              <th>Metric</th>
              {arr.map(b => <th key={b.branchId} className="text-center">{b.branchName}</th>)}
              <th className="text-center text-muted">Average</th>
            </tr>
          </thead>
          <tbody>
            {["deceased", "bookings", "revenue"].map(metric => {
              const labels = { deceased: "Deceased Cases", bookings: "Bookings", revenue: "Revenue (30d)" };
              const units = { deceased: "", bookings: "", revenue: "KES " };
              return (
                <tr key={metric}>
                  <td><strong>{labels[metric]}</strong></td>
                  {arr.map(b => {
                    const val = metric === "revenue" ? (b.revenue?.total30d || 0) : metric === "deceased" ? (b.deceased?.total || 0) : (b.bookings?.total || 0);
                    const avg = arr.reduce((s, x) => s + (metric === "revenue" ? (x.revenue?.total30d || 0) : metric === "deceased" ? (x.deceased?.total || 0) : (x.bookings?.total || 0)), 0) / arr.length;
                    const above = val > avg;
                    return (
                      <td key={b.branchId} className="text-center">
                        {units[metric]}{typeof val === "number" ? val.toLocaleString() : val}
                        <span className={above ? "text-success ms-1" : "text-danger ms-1"}>
                          {above ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                        </span>
                      </td>
                    );
                  })}
                  <td className="text-center text-muted">
                    {units[metric]}{(arr.reduce((s, x) => s + (metric === "revenue" ? (x.revenue?.total30d || 0) : metric === "deceased" ? (x.deceased?.total || 0) : (x.bookings?.total || 0)), 0) / arr.length).toLocaleString()}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td><strong>Hearse Fleet</strong></td>
              {arr.map(b => <td key={b.branchId} className="text-center">{b.hearses?.available || 0}/{b.hearses?.total || 0} avail</td>)}
              <td className="text-center text-muted">-</td>
            </tr>
            <tr>
              <td><strong>Coffin Stock</strong></td>
              {arr.map(b => <td key={b.branchId} className="text-center">{b.coffins?.totalStock || 0}</td>)}
              <td className="text-center text-muted">{Math.round(arr.reduce((s, x) => s + (x.coffins?.totalStock || 0), 0) / arr.length)}</td>
            </tr>
          </tbody>
        </Table>
        <Row className="g-3">
          {arr.map(b => (
            <Col md={6} key={b.branchId}>
              <div className="p-3 rounded-3" style={{ background: COLORS.light }}>
                <h6 className="fw-bold mb-2">{b.branchName} <Badge bg={b.hearses?.available === 0 ? "danger" : "success"}>{b.hearses?.available}/{b.hearses?.total}</Badge></h6>
                <BatteryGauge value={b.hearses?.available || 0} max={b.hearses?.total || 1} label="Hearse Available" />
                <div className="d-flex justify-content-between small mt-2">
                  <span>Low Stock: <Badge bg={b.chemicals?.lowStockCount > 3 ? "danger" : "warning"}>{b.chemicals?.lowStockCount || 0}</Badge></span>
                  <span>Chem Used: {b.chemicals?.totalUsed30d || 0}</span>
                </div>
                {b.hearses?.mostBooked?.[0] && (
                  <div className="small text-muted mt-1">Popular: {b.hearses.mostBooked[0].name}</div>
                )}
              </div>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};

const BranchOfMonthBanner = ({ insights }) => {
  if (!insights?.topPerformer) return null;
  return (
    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px", background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)", color: "white" }}>
      <Card.Body className="p-4">
        <Row className="align-items-center">
          <Col md={3}>
            <div className="d-flex align-items-center gap-3">
              <Trophy size={36} className="text-warning" />
              <div>
                <h5 className="mb-0 text-warning fw-bold">Branch of the Month</h5>
                <small className="text-white-50">Top performer across metrics</small>
              </div>
            </div>
          </Col>
          <Col md={9}>
            <div className="d-flex flex-wrap gap-4">
              <div><div className="fw-bold text-warning">{insights.topPerformer.deceasedVolume}</div><small className="text-white-50">Top Deceased Volume</small></div>
              <div><div className="fw-bold text-warning">{insights.topPerformer.bookingVolume}</div><small className="text-white-50">Top Bookings</small></div>
              <div><div className="fw-bold text-warning">{insights.topPerformer.revenue}</div><small className="text-white-50">Top Revenue</small></div>
              {insights.topPerformer.mostBookedHearse !== "N/A" && (
                <div><div className="fw-bold text-warning small">{insights.topPerformer.mostBookedHearse}</div><small className="text-white-50">Most Booked Hearse</small></div>
              )}
            </div>
          </Col>
        </Row>
        {insights.winner && (
          <div className="mt-2 p-2 rounded" style={{ background: "rgba(255,255,255,0.1)" }}>
            <small><Star size={14} className="me-1 text-warning" />{insights.winner}</small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

const RecommendationsCard = ({ recommendations }) => {
  if (!recommendations?.length) return null;
  return (
    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
      <Card.Body className="p-4">
        <SectionHeader title="AI Insights & Recommendations" icon={AlertTriangle} color={COLORS.warning} />
        {recommendations.map((rec, i) => (
          <div key={i} className={`p-3 rounded-3 mb-2 d-flex align-items-start gap-2 ${i === 0 ? "bg-primary bg-opacity-10" : i === 1 ? "bg-warning bg-opacity-10" : "bg-light"}`}>
            {rec.includes("⚠️") ? <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-1" /> :
              rec.includes("🔴") ? <AlertTriangle size={18} className="text-danger flex-shrink-0 mt-1" /> :
                rec.includes("📈") ? <TrendingUp size={18} className="text-success flex-shrink-0 mt-1" /> :
                  <Zap size={18} className="text-primary flex-shrink-0 mt-1" />}
            <small>{rec.replace(/[⚠️🔴📈✅]/g, "")}</small>
          </div>
        ))}
      </Card.Body>
    </Card>
  );
};

// ============================================
// ⭐ FIXED: Safe chart data helper functions
// ============================================

// Safe function to create pie/doughnut chart data with fallback
const createRadialChartData = (labels, dataValues, colors) => {
  // Ensure labels is always an array
  const safeLabels = Array.isArray(labels) && labels.length > 0 ? labels : ['No Data'];
  // Ensure dataValues is always an array of numbers
  const safeData = Array.isArray(dataValues) && dataValues.length > 0
    ? dataValues.map(v => typeof v === 'number' ? v : 0)
    : [1]; // Fallback with 1 to show "No Data"

  // Ensure colors match data length
  const safeColors = Array.isArray(colors) && colors.length >= safeData.length
    ? colors.slice(0, safeData.length)
    : ['#cccccc'];

  return {
    labels: safeLabels,
    datasets: [{
      data: safeData,
      backgroundColor: safeColors,
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };
};

// Safe function to create line/bar chart data
const createCartesianChartData = (labels, datasets) => {
  // Ensure labels is always an array
  const safeLabels = Array.isArray(labels) && labels.length > 0 ? labels : ['No Data'];

  // Ensure datasets is always an array with proper structure
  const safeDatasets = Array.isArray(datasets) && datasets.length > 0
    ? datasets.map(ds => ({
      label: ds.label || 'Data',
      data: Array.isArray(ds.data) && ds.data.length > 0
        ? ds.data.map(v => typeof v === 'number' ? v : 0)
        : [0],
      borderColor: ds.borderColor || COLORS.chart1,
      backgroundColor: ds.backgroundColor || COLORS.chart1 + '20',
      ...ds
    }))
    : [{
      label: 'No Data',
      data: [0],
      borderColor: '#cccccc',
      backgroundColor: '#cccccc20'
    }];

  return {
    labels: safeLabels,
    datasets: safeDatasets
  };
};

// ============================================
// ⭐ MAIN DASHBOARD COMPONENT
// ============================================

const ComprehensiveDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [data, setData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const lastFetchRef = useRef(0);

  const chartColors = [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5, COLORS.chart6, COLORS.chart7, COLORS.chart8];

  // Options for cartesian charts (Line, Bar) - have x/y scales
  const cartesianChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 11 },
          color: COLORS.gray
        }
      },
      tooltip: {
        backgroundColor: COLORS.dark,
        titleColor: COLORS.white,
        bodyColor: COLORS.white,
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: COLORS.gray }
      },
      y: {
        grid: { color: COLORS.light },
        ticks: { color: COLORS.gray },
        beginAtZero: true
      }
    }
  };

  // Options for radial charts (Pie, Doughnut) - NO scales (causes "labels" error in Chart.js 4)
  const radialChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 11 },
          color: COLORS.gray
        }
      },
      tooltip: {
        backgroundColor: COLORS.dark,
        titleColor: COLORS.white,
        bodyColor: COLORS.white,
        cornerRadius: 8,
        padding: 12
      }
    }
  };

  // ============================================
  // ⭐ FIXED: Safe chart data helper functions
  // ============================================

  // Safe function to create pie/doughnut chart data with fallback
  const createRadialChartData = (labels, dataValues, colors) => {
    // Ensure labels is always an array
    const safeLabels = Array.isArray(labels) && labels.length > 0 ? labels : ['No Data'];
    // Ensure dataValues is always an array of numbers
    const safeData = Array.isArray(dataValues) && dataValues.length > 0
      ? dataValues.map(v => typeof v === 'number' ? v : 0)
      : [1]; // Fallback with 1 to show "No Data"

    // Ensure colors match data length
    const safeColors = Array.isArray(colors) && colors.length >= safeData.length
      ? colors.slice(0, safeData.length)
      : ['#cccccc'];

    return {
      labels: safeLabels,
      datasets: [{
        data: safeData,
        backgroundColor: safeColors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  };

  // Safe function to create line/bar chart data
  const createCartesianChartData = (labels, datasets) => {
    // Ensure labels is always an array
    const safeLabels = Array.isArray(labels) && labels.length > 0 ? labels : ['No Data'];

    // Ensure datasets is always an array with proper structure
    const safeDatasets = Array.isArray(datasets) && datasets.length > 0
      ? datasets.map(ds => ({
        label: ds.label || 'Data',
        data: Array.isArray(ds.data) && ds.data.length > 0
          ? ds.data.map(v => typeof v === 'number' ? v : 0)
          : [0],
        borderColor: ds.borderColor || COLORS.chart1,
        backgroundColor: ds.backgroundColor || COLORS.chart1 + '20',
        ...ds
      }))
      : [{
        label: 'No Data',
        data: [0],
        borderColor: '#cccccc',
        backgroundColor: '#cccccc20'
      }];

    return {
      labels: safeLabels,
      datasets: safeDatasets
    };
  };

  const getTenantSlug = () => localStorage.getItem("tenantSlug") || "";

  const fetchBranches = useCallback(async () => {
    try {
      const tenantSlug = getTenantSlug();
      const headers = getTenantHeaders();
      const res = await fetch(`${env.FULL_API_URL}/tenant/${tenantSlug}/branches`, { headers });
      if (res.ok) {
        const result = await res.json();
        const arr = Array.isArray(result?.data) ? result.data : [];
        setBranches(arr);
        if (arr.length > 0 && !selectedBranch) setSelectedBranch(arr[0]);
      }
    } catch (err) { console.error("Error fetching branches:", err); }
  }, [selectedBranch]);

  const fetchDashboardData = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 2000) return;
    lastFetchRef.current = now;
    try {
      setRefreshing(true);
      const headers = getTenantHeaders();
      const branchId = selectedBranch?.id || selectedBranch?.branch_id;
      const branchHeaders = branchId ? { ...headers, "x-branch-id": branchId } : headers;

      const r = await fetch(`${env.FULL_API_URL}/analytics/dashboard/comprehensive`, { headers: branchHeaders });
      if (r.ok) {
        const result = await r.json();
        setData(result.data || {});
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [selectedBranch]);

  const fetchComparison = useCallback(async (ids) => {
    if (ids.length < 2) return;
    setLoadingComparison(true);
    try {
      const r = await fetch(`${env.FULL_API_URL}/analytics/dashboard/compare?branches=${ids.join(",")}`, { headers: getTenantHeaders() });
      if (r.ok) { const d = await r.json(); setComparisonData(d.data); }
    } catch (e) { console.error("Comparison error:", e); }
    finally { setLoadingComparison(false); }
  }, []);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);
  useEffect(() => { if (selectedBranch) { setLoading(true); fetchDashboardData(); } }, [selectedBranch]);
  useEffect(() => {
    const interval = setInterval(() => { if (selectedBranch) fetchDashboardData(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleBranch = (bid) => {
    setSelectedBranches(prev => prev.includes(bid) ? prev.filter(x => x !== bid) : [...prev, bid]);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: COLORS.light }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
          <h5 className="text-muted mt-3">Loading Dashboard</h5>
        </div>
      </div>
    );
  }

  const dd = data || {};
  const deceased = dd.deceased || {};
  const bookings = dd.bookings || {};
  const coffins = dd.coffins || {};
  const chemicals = dd.chemicals || {};
  const hearses = dd.hearses || {};
  const workshop = dd.workshop || {};
  const revenue = dd.revenue || {};
  const caseStatus = Array.isArray(deceased.caseStatus) ? deceased.caseStatus : [];
  const deceasedTrends = Array.isArray(deceased.monthlyTrends) ? deceased.monthlyTrends : [];
  const coffinSalesData = Array.isArray(coffins.sales) ? coffins.sales : [];
  const ppeRequests = dd.ppeRequests || dd.ppe_requests || [];
  const branchCompare = comparisonData?.branches;
  const insights = comparisonData?.insights;

  // ============================================
  // ⭐ FIXED: Chart data with safe fallbacks (defined AFTER data extraction)
  // ============================================

  // Safe chart data with guaranteed labels array
  const safeCaseStatusData = createRadialChartData(
    caseStatus.map(c => c.status || "Unknown"),
    caseStatus.map(c => c.count || 0),
    chartColors
  );

  const safeFleetData = createRadialChartData(
    ["Available", "Booked", "Maintenance"],
    [
      bookings.fleet?.available || 0,
      bookings.fleet?.booked || 0,
      bookings.fleet?.maintenance || 0
    ],
    [COLORS.success, COLORS.warning, COLORS.danger]
  );

  const safeDeceasedTrendsData = createCartesianChartData(
    deceasedTrends.map(d => d.month || d.month_label || ""),
    [{
      label: "Cases",
      data: deceasedTrends.map(d => d.count || 0),
      borderColor: COLORS.chart1,
      backgroundColor: COLORS.chart1 + "20",
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: deceasedTrends.map(d => d.count > 0 ? COLORS.chart1 : "transparent")
    }]
  );

  const safeCoffinSalesData = createCartesianChartData(
    coffinSalesData.map(c => c.type || ""),
    [{
      label: "Sold",
      data: coffinSalesData.map(c => c.sold || 0),
      backgroundColor: coffinSalesData.map((_, i) => chartColors[i % chartColors.length])
    }]
  );

  return (
    <Container fluid className="py-4" style={{ background: COLORS.light, minHeight: "100vh" }}>
      {/* HEADER */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px", background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)` }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="text-white fw-bold mb-1">Mortuary Analytics Dashboard</h2>
              <p className="text-white-50 mb-0 small">Real-time branch comparison & intelligent insights</p>
            </div>
            <div className="d-flex gap-2">
              <Dropdown>
                <Dropdown.Toggle variant="light" size="sm" className="d-flex align-items-center gap-2">
                  <MapPin size={18} />{selectedBranch?.branch_name || selectedBranch?.name || "Select Branch"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {branches.map(b => (
                    <Dropdown.Item key={b.id || b.branch_id} onClick={() => setSelectedBranch(b)}
                      active={(selectedBranch?.id || selectedBranch?.branch_id) === (b.id || b.branch_id)}>
                      {b.branch_name || b.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <Button variant="light" size="sm" onClick={fetchDashboardData} disabled={refreshing} className="d-flex align-items-center gap-2">
                <RefreshCw size={18} />{refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Branch of the Month */}
      {insights && <BranchOfMonthBanner insights={insights} />}

      {/* KEY METRICS - ROW 1 */}
      <Row className="g-3 mb-4">
        <Col xs={6} lg={3}><StatCard title="Total Deceased" value={deceased.total || "-"} subtitle={`${deceased.thisMonth || 0} this month`} icon={Users} color="primary" /></Col>
        <Col xs={6} lg={3}><StatCard title="Active Cases" value={deceased.active || "-"} subtitle={`${deceased.released || 0} released`} icon={CheckCircle} color="success" /></Col>
        <Col xs={6} lg={3}><StatCard title="Active Bookings" value={bookings.booked || "0"} subtitle={`${bookings.completed || 0} completed`} icon={Calendar} color="warning" /></Col>
        <Col xs={6} lg={3}><StatCard title="Revenue (30d)" value={`KES ${parseFloat(revenue.total30d || 0).toLocaleString()}`} subtitle={`Outstanding: KES ${parseFloat(revenue.outstanding30d || 0).toLocaleString()}`} icon={DollarSign} color="purple" /></Col>
      </Row>

      {/* KEY METRICS - ROW 2 */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}><StatCard title="Hearse Fleet" value={`${bookings.fleet?.available || 0}/${bookings.fleet?.total || 0}`} subtitle={`${bookings.fleet?.booked || 0} currently booked`} icon={Car} color="info" /></Col>
        <Col xs={6} md={3}><StatCard title="Coffin Stock" value={coffins.totalStock || "0"} subtitle={`KES ${parseFloat(coffins.totalValue || 0).toLocaleString()}`} icon={Box} color="warning" /></Col>
        <Col xs={6} md={3}><StatCard title="Low Stock Chemicals" value={chemicals.lowStock?.length || 0} subtitle={`${chemicals.topUsed?.length || 0} chemicals in top usage`} icon={FlaskConical} color="danger" /></Col>
        <Col xs={6} md={3}><StatCard title="Workshop Orders" value={workshop.orders?.total || 0} subtitle={`${workshop.orders?.completed || 0} completed`} icon={Activity} color="primary" /></Col>
      </Row>

      {/* DECEASED SECTION - Charts */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <Card.Body className="p-4">
          <SectionHeader title="Deceased Management" icon={Users} color={COLORS.primary} />
          <Row className="g-4">
            <Col lg={6}>
              <ChartCard title="Cases Trend (12 Months)" icon={TrendingUp} color={COLORS.primary} height="280px">
                <Line data={deceasedTrendsData} options={cartesianChartOptions} />
              </ChartCard>
            </Col>
            <Col lg={3}>
              <ChartCard title="Case Status" icon={CheckCircle} color={COLORS.info} height="280px">
                <Pie data={safeCaseStatusData} options={radialChartOptions} />
              </ChartCard>
            </Col>
            <Col lg={3}>
              <ChartCard title="Hearse Fleet" icon={Car} color={COLORS.success} height="280px">
                <Doughnut data={safeFleetData} options={radialChartOptions} />
              </ChartCard>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* BOOKINGS + MOST BOOKED HEARSES */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <Card.Body className="p-4">
          <SectionHeader title="Hearse Bookings & Fleet Performance" icon={Truck} color={COLORS.purple} />
          <Row className="g-3 mb-3">
            <Col xs={6} md={3}>
              <div className="p-3 rounded-3" style={{ backgroundColor: COLORS.purpleLight }}>
                <small className="text-muted">Total Bookings</small>
                <h5 className="fw-bold mb-0" style={{ color: COLORS.purple }}>{bookings.total || 0}</h5>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-3 rounded-3" style={{ backgroundColor: COLORS.successLight }}>
                <small className="text-muted">Completed</small>
                <h5 className="fw-bold mb-0" style={{ color: COLORS.success }}>{bookings.completed || 0}</h5>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-3 rounded-3" style={{ backgroundColor: COLORS.warningLight }}>
                <small className="text-muted">This Week</small>
                <h5 className="fw-bold mb-0" style={{ color: COLORS.warning }}>{bookings.thisWeek || 0}</h5>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-3 rounded-3" style={{ backgroundColor: COLORS.dangerLight }}>
                <small className="text-muted">Today</small>
                <h5 className="fw-bold mb-0" style={{ color: COLORS.danger }}>{bookings.today || 0}</h5>
              </div>
            </Col>
          </Row>
          {hearses.mostBooked?.length > 0 && (
            <div className="mt-3">
              <h6 className="fw-bold mb-2">Most Booked Hearses</h6>
              <Table responsive hover size="sm">
                <thead><tr><th>#</th><th>Hearse</th><th>Plate</th><th>Branch</th><th>Bookings</th><th>Trips Completed</th></tr></thead>
                <tbody>
                  {hearses.mostBooked.slice(0, 5).map((h, i) => (
                    <tr key={h.id}>
                      <td>{i + 1}</td>
                      <td>{h.name}</td>
                      <td><code>{h.plate}</code></td>
                      <td><Badge bg="secondary">{h.branchName}</Badge></td>
                      <td><Badge bg="primary">{h.totalBookings}</Badge></td>
                      <td>{h.completedTrips}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* INVENTORY SECTION */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <Card.Body className="p-4">
          <SectionHeader title="Inventory Management" icon={Box} color={COLORS.warning} />
          <Row className="g-4">
            <Col lg={6}>
              <ChartCard title="Cases Trend (12 Months)" icon={TrendingUp} color={COLORS.primary} height="280px">
                <Line data={safeDeceasedTrendsData} options={cartesianChartOptions} />
              </ChartCard>
            </Col>
            <Col lg={6}>
              <ChartCard title="Coffin Sales by Type" icon={ShoppingCart} color={COLORS.warning} height="280px">
                <Bar data={safeCoffinSalesData} options={cartesianChartOptions} />
              </ChartCard>
            </Col>
            <Col lg={6}>
              <ChartCard title="Low Stock Chemicals" icon={FlaskConical} color={COLORS.danger} height="280px">
                {chemicals.lowStock?.length > 0 ? (
                  <div style={{ overflowY: "auto", height: "100%" }}>
                    {chemicals.lowStock.map((c, i) => {
                      const pct = c.minLevel > 0 ? Math.min(100, (c.currentStock / c.minLevel) * 100) : 0;
                      const barColor = pct < 50 ? COLORS.danger : pct < 80 ? COLORS.warning : COLORS.success;
                      return (
                        <div key={i} className="mb-2">
                          <div className="d-flex justify-content-between small">
                            <span>{c.name}</span>
                            <Badge bg={pct < 50 ? "danger" : "warning"}>{c.currentStock}/{c.minLevel} {c.unit}</Badge>
                          </div>
                          <div style={{ height: "8px", borderRadius: "4px", background: COLORS.light, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", borderRadius: "4px", background: barColor }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-success">
                    <CheckCircle size={32} className="mb-1" />
                    <p className="mb-0 small">All chemicals above minimum stock</p>
                  </div>
                )}
              </ChartCard>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* WORKSHOP SECTION */}
      {workshop.orders?.total > 0 && (
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
          <Card.Body className="p-4">
            <SectionHeader title="Workshop Production" icon={Activity} color={COLORS.purple} />
            <Row className="g-3">
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.purpleLight }}>
                  <h5 className="fw-bold mb-0" style={{ color: COLORS.purple }}>{workshop.orders?.total || 0}</h5>
                  <small className="text-muted">Total Orders</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.successLight }}>
                  <h5 className="fw-bold mb-0" style={{ color: COLORS.success }}>{workshop.orders?.completed || 0}</h5>
                  <small className="text-muted">Completed</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.warningLight }}>
                  <h5 className="fw-bold mb-0" style={{ color: COLORS.warning }}>{workshop.orders?.pending || 0}</h5>
                  <small className="text-muted">Pending</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.infoLight }}>
                  <h5 className="fw-bold mb-0" style={{ color: COLORS.info }}>KES {parseFloat(workshop.orders?.profit || 0).toLocaleString()}</h5>
                  <small className="text-muted">Profit</small>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* CHEMICALS & PPE SECTION */}
      {(chemicals.recent?.length > 0 || chemicals.lowStock?.length > 0 || ppeRequests?.length > 0) && (
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
          <Card.Body className="p-4">
            <SectionHeader title="Chemicals & PPE" icon={FlaskConical} color={COLORS.info} />
            <Row className="g-3">
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.infoLight }}>
                  <h5 className="fw-bold mb-0" style={{ color: COLORS.info }}>{chemicals.recent?.length || 0}</h5>
                  <small className="text-muted">Recent Chemicals</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.dangerLight }}>
                  <h5 className="fw-bold mb-0" style={{ color: COLORS.danger }}>{chemicals.lowStock?.length || 0}</h5>
                  <small className="text-muted">Low Stock Alerts</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.warningLight }}>
                  <h5 className="fw-bold mb-0" style={{ color: COLORS.warning }}>{ppeRequests?.length || 0}</h5>
                  <small className="text-muted">PPE Requests</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.successLight }}>
                  <h5 className="fw-bold mb-0" style={{ color: COLORS.success }}>{chemicals.topUsed?.length || 0}</h5>
                  <small className="text-muted">Top Used Items</small>
                </div>
              </Col>
            </Row>

            {/* Low Stock Chemicals List */}
            {chemicals.lowStock?.length > 0 && (
              <div className="mt-3">
                <h6 className="fw-bold mb-2 text-danger">⚠️ Low Stock Chemicals</h6>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {chemicals.lowStock.slice(0, 5).map((chem, i) => (
                    <div key={i} className="d-flex justify-content-between align-items-center p-2 mb-2 rounded" style={{ backgroundColor: COLORS.light }}>
                      <div>
                        <div className="fw-semibold small">{chem.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{chem.category}</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-danger small">{chem.currentStock} / {chem.minLevel} {chem.unit}</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Deficit: {chem.deficit}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent PPE Requests */}
            {ppeRequests?.length > 0 && (
              <div className="mt-3">
                <h6 className="fw-bold mb-2 text-warning">🛡️ Recent PPE Requests</h6>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {ppeRequests.slice(0, 5).map((req, i) => (
                    <div key={i} className="d-flex justify-content-between align-items-center p-2 mb-2 rounded" style={{ backgroundColor: COLORS.light }}>
                      <div>
                        <div className="fw-semibold small">{req.item_name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Qty: {req.quantity_requested}</div>
                      </div>
                      <div className="text-end">
                        <span className={`badge bg-${req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'info' : req.status === 'fulfilled' ? 'success' : 'danger'}`}>
                          {req.status}
                        </span>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>{req.created_at ? new Date(req.created_at).toLocaleDateString() : '-'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* BRANCH COMPARISON SECTION */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <Card.Body className="p-4">
          <SectionHeader title="Branch Comparison" icon={Building2} color={COLORS.purple} />
          <Row className="mb-3">
            <Col>
              {branches.length > 0 ? (
                <>
                  <p className="text-muted small mb-3">Select branches (minimum 2) to compare metrics side-by-side:</p>
                  <div className="d-flex flex-wrap gap-3 mb-3">
                    {branches.map(b => {
                      const bid = b.id || b.branch_id;
                      return (
                        <Form.Check
                          key={bid}
                          type="switch"
                          id={`br-${bid}`}
                          label={`${b.branch_name || b.name} ${b.branch_location ? `(${b.branch_location})` : ""}`}
                          checked={selectedBranches.includes(bid)}
                          onChange={() => toggleBranch(bid)}
                        />
                      );
                    })}
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => fetchComparison(selectedBranches)}
                      disabled={loadingComparison || selectedBranches.length < 2}>
                      {loadingComparison ? <Spinner size="sm" className="me-1" /> : <Bar size={14} className="me-1" />}
                      Compare Selected
                    </Button>
                    {branches.length >= 2 && (
                      <Button variant="outline-primary" size="sm" onClick={() => {
                        const allIds = branches.map(b => b.id || b.branch_id);
                        setSelectedBranches(allIds);
                        fetchComparison(allIds);
                      }}>
                        <Trophy size={14} className="me-1" />Compare All Branches
                      </Button>
                    )}
                  </div>
                </>
              ) : <p className="text-muted">No branches found.</p>}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Comparison Results */}
      {branchCompare && <BranchComparisonTable branches={branchCompare} />}

      {/* AI Recommendations */}
      {insights?.recommendations && <RecommendationsCard recommendations={insights.recommendations} />}

      {/* Error Banner */}
      {error && (
        <Alert variant="danger" className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>
          <AlertTriangle size={18} className="me-2" />{error}
        </Alert>
      )}
    </Container>
  );
};

export default ComprehensiveDashboard;