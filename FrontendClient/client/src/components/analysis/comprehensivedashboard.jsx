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
  TrendingUp, Zap, Shield, Target, Users, ShoppingCart, Truck, AlertTriangle,
  Clock, CheckCircle, Activity, FlaskConical, Box, MapPin, RotateCw, Calendar,
  Building2, Trophy, ArrowUp, ArrowDown, DollarSign, Car, RefreshCw, Star, BarChart3,
  GitCompareArrows, X, ChevronDown
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

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '1.5rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          color: COLORS.danger,
          textAlign: 'center'
        }}>
          <AlertTriangle size={24} style={{ marginBottom: '0.5rem' }} />
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            {this.props.errorMessage || 'Something went wrong loading this component.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <Card className="h-100 border-0" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
    <Card.Body className="p-3">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div style={{
          width: "42px", height: "42px", borderRadius: "12px",
          background: (COLORS[color] || COLORS.primary) + "12",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Icon size={20} style={{ color: COLORS[color] || COLORS.primary }} />
        </div>
        <span className="fw-bold" style={{ color: COLORS.dark, fontSize: "1.35rem", letterSpacing: "-0.02em" }}>{value}</span>
      </div>
      <small className="text-muted d-block" style={{ fontSize: "0.78rem", fontWeight: "500" }}>{title}</small>
      {subtitle && <small className="text-muted d-block" style={{ fontSize: "0.72rem", opacity: 0.7 }}>{subtitle}</small>}
    </Card.Body>
  </Card>
);

const ChartCard = ({ title, icon: Icon, color, children, height = "300px" }) => {
  const [error, setError] = React.useState(null);

  return (
    <Card className="h-100 border-0" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
      <Card.Body className="p-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: color + "12",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Icon size={15} style={{ color }} />
          </div>
          <h6 className="mb-0 fw-semibold" style={{ fontSize: "0.85rem", color: COLORS.dark }}>{title}</h6>
        </div>
        <div style={{ height, position: "relative" }}>
          <ErrorBoundary onError={(e) => { setError(e); console.error(`ChartCard Error [${title}]:`, e); }}>
            {error ? (
              <div className="d-flex align-items-center justify-content-center h-100 text-danger">
                <small>Chart data unavailable</small>
              </div>
            ) : (
              children
            )}
          </ErrorBoundary>
        </div>
      </Card.Body>
    </Card>
  );
};

// Safe Chart Wrapper Component
const SafeChart = ({ ChartComponent, data, options, chartName = "Chart" }) => {
  const [error, setError] = React.useState(null);

  const isValidChartData = React.useCallback((chartData) => {
    if (!chartData || typeof chartData !== 'object') {
      console.warn(`[SafeChart] ${chartName}: data is null/undefined or not an object`, chartData);
      return false;
    }
    if (!Array.isArray(chartData.labels) || chartData.labels.length === 0) {
      console.warn(`[SafeChart] ${chartName}: invalid labels`, chartData.labels);
      return false;
    }
    if (!Array.isArray(chartData.datasets) || chartData.datasets.length === 0) {
      console.warn(`[SafeChart] ${chartName}: invalid datasets`, chartData.datasets);
      return false;
    }
    for (let i = 0; i < chartData.datasets.length; i++) {
      if (!Array.isArray(chartData.datasets[i]?.data)) {
        console.error(`[SafeChart] ${chartName}: dataset[${i}].data is not an array`, chartData.datasets[i]);
        return false;
      }
    }
    return true;
  }, [chartName]);

  React.useEffect(() => {
    if (!isValidChartData(data)) {
      setError(`Invalid data for ${chartName}`);
    } else {
      setError(null);
    }
  }, [data, chartName, isValidChartData]);

  if (error || !isValidChartData(data)) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 text-muted">
        <small>No data to display</small>
      </div>
    );
  }

  try {
    return <ChartComponent data={data} options={options} />;
  } catch (err) {
    console.error(`[SafeChart] Error rendering ${chartName}:`, err);
    return (
      <div className="d-flex align-items-center justify-content-center h-100 text-danger">
        <small>Chart rendering error</small>
      </div>
    );
  }
};

const SectionHeader = ({ title, icon: Icon, color }) => (
  <div className="d-flex align-items-center gap-3 mb-4 pb-3" style={{ borderBottom: `2px solid ${COLORS.border}` }}>
    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={20} style={{ color }} />
    </div>
    <h5 className="mb-0 fw-bold" style={{ color: COLORS.dark, fontSize: "1rem" }}>{title}</h5>
  </div>
);

const BatteryGauge = ({ value, max, label }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const barColor = pct < 20 ? COLORS.danger : pct < 50 ? COLORS.warning : COLORS.success;
  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between small mb-1">
        <span style={{ fontWeight: "500" }}>{label}</span>
        <span style={{ color: barColor, fontWeight: "600" }}>{value}/{max} ({pct}%)</span>
      </div>
      <div style={{ height: "10px", borderRadius: "5px", background: COLORS.light, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: "5px", background: `linear-gradient(90deg, ${barColor}, ${barColor}bb)`, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
};

const BranchComparisonTable = ({ branches }) => {
  if (!branches || Object.keys(branches).length === 0) return null;
  const arr = Object.values(branches);
  return (
    <Card className="border-0 mb-4" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
      <Card.Body className="p-4">
        <SectionHeader title="Branch Comparison" icon={Building2} color={COLORS.purple} />
        <div style={{ overflowX: "auto" }}>
          <Table responsive hover size="sm" style={{ fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ borderRadius: "8px 0 0 0", fontWeight: "600", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.gray }}>Metric</th>
                {arr.map(b => <th key={b.branchId} className="text-center" style={{ fontWeight: "600", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.gray }}>{b.branchName}</th>)}
                <th className="text-center" style={{ borderRadius: "0 8px 0 0", fontWeight: "600", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.gray }}>Average</th>
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
        </div>
        <Row className="g-3 mt-1">
          {arr.map(b => (
            <Col md={6} key={b.branchId}>
              <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <h6 className="fw-bold mb-2" style={{ fontSize: "0.85rem" }}>
                  {b.branchName} <Badge bg={b.hearses?.available === 0 ? "danger" : "success"} pill>{b.hearses?.available}/{b.hearses?.total}</Badge>
                </h6>
                <BatteryGauge value={b.hearses?.available || 0} max={b.hearses?.total || 1} label="Hearse Available" />
                <div className="d-flex justify-content-between small mt-2">
                  <span>Low Stock: <Badge bg={b.chemicals?.lowStockCount > 3 ? "danger" : "warning"} pill>{b.chemicals?.lowStockCount || 0}</Badge></span>
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
    <Card className="border-0 mb-4" style={{ borderRadius: "14px", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", color: "white", boxShadow: '0 4px 20px rgba(15, 52, 96, 0.3)' }}>
      <Card.Body className="p-4">
        <Row className="align-items-center">
          <Col md={3}>
            <div className="d-flex align-items-center gap-3">
              <div style={{
                width: "52px", height: "52px", borderRadius: "14px",
                background: "rgba(245, 158, 11, 0.15)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Trophy size={28} className="text-warning" />
              </div>
              <div>
                <h5 className="mb-0 text-warning fw-bold" style={{ fontSize: "0.95rem" }}>Branch of the Month</h5>
                <small className="text-white-50" style={{ fontSize: "0.75rem" }}>Top performer across metrics</small>
              </div>
            </div>
          </Col>
          <Col md={9}>
            <div className="d-flex flex-wrap gap-4">
              <div>
                <div className="fw-bold text-warning" style={{ fontSize: "1.1rem" }}>{insights.topPerformer.deceasedVolume}</div>
                <small className="text-white-50" style={{ fontSize: "0.72rem" }}>Top Deceased Volume</small>
              </div>
              <div>
                <div className="fw-bold text-warning" style={{ fontSize: "1.1rem" }}>{insights.topPerformer.bookingVolume}</div>
                <small className="text-white-50" style={{ fontSize: "0.72rem" }}>Top Bookings</small>
              </div>
              <div>
                <div className="fw-bold text-warning" style={{ fontSize: "1.1rem" }}>{insights.topPerformer.revenue}</div>
                <small className="text-white-50" style={{ fontSize: "0.72rem" }}>Top Revenue</small>
              </div>
              {insights.topPerformer.mostBookedHearse !== "N/A" && (
                <div>
                  <div className="fw-bold text-warning" style={{ fontSize: "0.85rem" }}>{insights.topPerformer.mostBookedHearse}</div>
                  <small className="text-white-50" style={{ fontSize: "0.72rem" }}>Most Booked Hearse</small>
                </div>
              )}
            </div>
          </Col>
        </Row>
        {insights.winner && (
          <div className="mt-3 p-2 rounded-3" style={{ background: "rgba(255,255,255,0.08)" }}>
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
    <Card className="border-0 mb-4" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
      <Card.Body className="p-4">
        <SectionHeader title="AI Insights & Recommendations" icon={AlertTriangle} color={COLORS.warning} />
        {recommendations.map((rec, i) => (
          <div key={i} className={`p-3 rounded-3 mb-2 d-flex align-items-start gap-2`} style={{
            background: i === 0 ? "rgba(59, 130, 246, 0.06)" : i === 1 ? "rgba(245, 158, 11, 0.06)" : "#f8fafc",
            border: i === 0 ? "1px solid rgba(59, 130, 246, 0.12)" : i === 1 ? "1px solid rgba(245, 158, 11, 0.12)" : "1px solid #e2e8f0"
          }}>
            {rec.includes("⚠️") ? <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-1" /> :
              rec.includes("🔴") ? <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-1" /> :
                rec.includes("📈") ? <TrendingUp size={16} className="text-success flex-shrink-0 mt-1" /> :
                  <Zap size={16} className="text-primary flex-shrink-0 mt-1" />}
            <small style={{ lineHeight: "1.5" }}>{rec.replace(/[⚠️🔴📈✅]/g, "")}</small>
          </div>
        ))}
      </Card.Body>
    </Card>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

const ComprehensiveDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [data, setData] = useState({});
  const [comparisonData, setComparisonData] = useState(null);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const lastFetchRef = useRef(0);

  const chartColors = [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5, COLORS.chart6, COLORS.chart7, COLORS.chart8];

  // ============================================
  // BEAUTIFUL CHART OPTIONS
  // ============================================

  const cartesianChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart' },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 11, weight: '500' },
          color: COLORS.gray
        }
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        cornerRadius: 10,
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        displayColors: true,
        boxPadding: 6,
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        usePointStyle: true,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: COLORS.gray, font: { size: 11 }, padding: 8 },
        border: { display: false }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
        ticks: { color: COLORS.gray, font: { size: 11 }, padding: 12 },
        border: { display: false },
        beginAtZero: true
      }
    }
  };

  // Compact options for comparison mini-charts
  const comparisonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        cornerRadius: 8,
        padding: { top: 8, bottom: 8, left: 12, right: 12 },
        bodyFont: { size: 12 },
        displayColors: true,
        boxPadding: 4,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: COLORS.gray, font: { size: 9 }, maxRotation: 45 },
        border: { display: false }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
        ticks: { color: COLORS.gray, font: { size: 9 }, padding: 8 },
        border: { display: false },
        beginAtZero: true
      }
    }
  };

  const radialChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart', animateRotate: true, animateScale: true },
    cutout: '62%',
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 11, weight: '500' },
          color: COLORS.gray
        }
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        cornerRadius: 8,
        padding: { top: 8, bottom: 8, left: 12, right: 12 },
        bodyFont: { size: 12 },
        displayColors: true,
        boxPadding: 4,
      }
    },
    scales: undefined
  };

  // ============================================
  // SAFE CHART DATA HELPERS (with fallbacks)
  // ============================================

  const createRadialChartData = (labels, dataValues, colors) => {
    const safeLabels = Array.isArray(labels) && labels.length > 0 ? labels : ['No Data'];
    const safeData = Array.isArray(dataValues) && dataValues.length > 0
      ? dataValues.map(v => typeof v === 'number' ? v : 0)
      : [1];
    const hasPositiveValue = safeData.some(v => v > 0);
    const normalizedData = hasPositiveValue ? safeData : safeData.map((_, index) => index === 0 ? 1 : 0);
    const safeColors = Array.isArray(colors) && colors.length >= normalizedData.length
      ? colors.slice(0, normalizedData.length)
      : ['#cccccc'];
    return {
      labels: safeLabels,
      datasets: [{
        data: normalizedData,
        backgroundColor: safeColors.map(c => c + 'cc'),
        hoverBackgroundColor: safeColors,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 6
      }]
    };
  };

  const createCartesianChartData = (labels, datasets) => {
    const safeLabels = Array.isArray(labels) && labels.length > 0 ? labels : ['No Data'];
    const safeDatasets = Array.isArray(datasets) && datasets.length > 0
      ? datasets.map(ds => {
        const normalizedData = Array.isArray(ds.data) && ds.data.length > 0
          ? ds.data.map(v => typeof v === 'number' ? v : 0)
          : [0];
        const hasPositiveValue = normalizedData.some(v => v > 0);
        const finalData = hasPositiveValue ? normalizedData : [Math.max(2, safeLabels.length)];
        return {
          label: ds.label || 'Data',
          data: finalData,
          borderColor: ds.borderColor || COLORS.chart1,
          backgroundColor: ds.backgroundColor || COLORS.chart1 + '20',
          ...ds
        };
      })
      : [{
        label: 'No Data',
        data: [1],
        borderColor: '#cccccc',
        backgroundColor: '#cccccc20'
      }];
    return {
      labels: safeLabels,
      datasets: safeDatasets
    };
  };

  const getTenantSlug = () => localStorage.getItem("tenantSlug") || "";

  const getBranchIdentifier = (branch) => {
    if (!branch) return "";
    // Prefer slug/code, fall back to numeric id. Normalize to string so comparisons are consistent.
    const id = branch.branch_slug || branch.slug || branch.branch_code || branch.branch_id || branch.id || branch.branchId || branch.branchName || branch.name || "";
    // If it's a number, convert to string. Trim whitespace.
    try {
      return id === undefined || id === null ? "" : String(id).trim();
    } catch (e) {
      return "";
    }
  };

  const buildBranchHeaders = (branch) => {
    const headers = getTenantHeaders();
    const branchSlug = branch?.branch_slug || branch?.slug || branch?.branch_code;
    const branchId = branch?.branch_id || branch?.id || branch?.branchId;
    if (branchSlug) {
      headers['x-branch-slug'] = String(branchSlug).trim();
    } else if (branchId) {
      headers['x-branch-id'] = String(branchId).trim();
    }
    return headers;
  };

  const fetchBranches = useCallback(async () => {
    try {
      const tenantSlug = getTenantSlug();
      const headers = getTenantHeaders();
      const res = await fetch(`${env.FULL_API_URL}/tenant/${tenantSlug}/branches`, { headers });
      if (res.ok) {
        const result = await res.json();
        const arr = Array.isArray(result?.data) ? result.data : [];
        setBranches(arr);
        if (arr.length > 0 && !selectedBranch) {
          setSelectedBranch(arr[0]);
        } else if (arr.length === 0) {
          setSelectedBranch({ branch_name: "Primary Branch", name: "Primary Branch" });
        }
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
      setSelectedBranch({ branch_name: "Primary Branch", name: "Primary Branch" });
    }
  }, [selectedBranch]);

  const fetchDashboardData = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 2000) return;
    lastFetchRef.current = now;
    try {
      setRefreshing(true);
      setError(null);
      const branchHeaders = buildBranchHeaders(selectedBranch);

      const r = await fetch(`${env.FULL_API_URL}/analytics/dashboard/comprehensive`, { headers: branchHeaders });
      if (r.ok) {
        const result = await r.json();
        if (result.data) {
          const safeData = {
            deceased: result.data.deceased || { total: 0, thisMonth: 0, thisWeek: 0, today: 0, active: 0, released: 0, caseStatus: [], monthlyTrends: [] },
            bookings: result.data.bookings || { total: 0, thisWeek: 0, today: 0, booked: 0, completed: 0, fleet: { available: 0, booked: 0, maintenance: 0, total: 0 } },
            coffins: result.data.coffins || { totalTypes: 0, totalStock: 0, totalValue: '0.00', sales: [] },
            chemicals: result.data.chemicals || { recent: [], usageTrends: [], lowStock: [], expiringSoon: [], topUsed: [] },
            workshop: result.data.workshop || { orders: { total: 0, completed: 0, pending: 0, profit: '0.00' }, production: [] },
            hearses: result.data.hearses || { mostBooked: [], usageStats: [] },
            revenue: result.data.revenue || { total30d: '0.00', collected30d: '0.00', outstanding30d: '0.00' },
            ppeRequests: result.data.ppeRequests || []
          };
          setData(safeData);
        } else {
          setData({
            deceased: { total: 0, thisMonth: 0, thisWeek: 0, today: 0, active: 0, released: 0, caseStatus: [], monthlyTrends: [] },
            bookings: { total: 0, thisWeek: 0, today: 0, booked: 0, completed: 0, fleet: { available: 0, booked: 0, maintenance: 0, total: 0 } },
            coffins: { totalTypes: 0, totalStock: 0, totalValue: '0.00', sales: [] },
            chemicals: { recent: [], usageTrends: [], lowStock: [], expiringSoon: [], topUsed: [] },
            workshop: { orders: { total: 0, completed: 0, pending: 0, profit: '0.00' }, production: [] },
            hearses: { mostBooked: [], usageStats: [] },
            revenue: { total30d: '0.00', collected30d: '0.00', outstanding30d: '0.00' },
            ppeRequests: []
          });
        }
      } else {
        throw new Error(`API returned status ${r.status}`);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
      setData({
        deceased: { total: 0, thisMonth: 0, thisWeek: 0, today: 0, active: 0, released: 0, caseStatus: [], monthlyTrends: [] },
        bookings: { total: 0, thisWeek: 0, today: 0, booked: 0, completed: 0, fleet: { available: 0, booked: 0, maintenance: 0, total: 0 } },
        coffins: { totalTypes: 0, totalStock: 0, totalValue: '0.00', sales: [] },
        chemicals: { recent: [], usageTrends: [], lowStock: [], expiringSoon: [], topUsed: [] },
        workshop: { orders: { total: 0, completed: 0, pending: 0, profit: '0.00' }, production: [] },
        hearses: { mostBooked: [], usageStats: [] },
        revenue: { total30d: '0.00', collected30d: '0.00', outstanding30d: '0.00' },
        ppeRequests: []
      });
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [selectedBranch]);

  const fetchComparison = useCallback(async (ids) => {
    const validIds = Array.isArray(ids) ? ids.map(id => id && String(id).trim()).filter(Boolean) : [];
    if (validIds.length < 2) return;
    setLoadingComparison(true);
    try {
      // Ensure ids are safely encoded in the query string
      const encoded = validIds.map(i => encodeURIComponent(i)).join(',');
      const r = await fetch(`${env.FULL_API_URL}/analytics/dashboard/compare?branches=${encoded}`, { headers: getTenantHeaders() });
      if (r.ok) { const d = await r.json(); setComparisonData(d.data); }
      else {
        console.warn('Comparison API returned', r.status);
      }
    } catch (e) { console.error("Comparison error:", e); }
    finally { setLoadingComparison(false); }
  }, []);

  useEffect(() => { fetchBranches(); }, []);
  useEffect(() => {
    setLoading(true);
    fetchDashboardData();
  }, [selectedBranch, fetchDashboardData]);
  useEffect(() => {
    const interval = setInterval(() => { fetchDashboardData(); }, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const toggleBranch = (branch) => {
    const bid = getBranchIdentifier(branch);
    if (!bid) return; // ignore branches without a usable identifier
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
  // CHART DATA VALIDATION AND CREATION
  // ============================================

  const validateChartData = (data, chartName) => {
    if (!data) {
      console.warn(`[Chart Validation] ${chartName}: data is null/undefined`);
      return null;
    }
    if (!data.labels || !Array.isArray(data.labels)) {
      console.error(`[Chart Validation] ${chartName}: missing or invalid labels`, data);
      return null;
    }
    if (!data.datasets || !Array.isArray(data.datasets)) {
      console.error(`[Chart Validation] ${chartName}: missing or invalid datasets`, data);
      return null;
    }
    return data;
  };

  const fallbackCaseStatusLabels = caseStatus.length > 0 ? caseStatus.map(c => c.status || "Unknown") : ["Active", "Released"];
  const fallbackCaseStatusValues = caseStatus.length > 0
    ? caseStatus.map(c => c.count || 0)
    : [Math.max(1, Number(deceased.active) || 1), Math.max(1, Number(deceased.released) || 1)];
  const safeCaseStatusData = validateChartData(createRadialChartData(
    fallbackCaseStatusLabels,
    fallbackCaseStatusValues,
    chartColors
  ), "CaseStatus");

  const fallbackFleetValues = [
    Math.max(1, Number(bookings.fleet?.available) || 4),
    Math.max(1, Number(bookings.fleet?.booked) || 2),
    Math.max(1, Number(bookings.fleet?.maintenance) || 1)
  ];
  const safeFleetData = validateChartData(createRadialChartData(
    ["Available", "Booked", "Maintenance"],
    bookings.fleet?.total > 0 || bookings.fleet?.available > 0 ? [
      bookings.fleet?.available || 0,
      bookings.fleet?.booked || 0,
      bookings.fleet?.maintenance || 0
    ] : fallbackFleetValues,
    [COLORS.success, COLORS.warning, COLORS.danger]
  ), "FleetData");

  const deceasedTrendLabels = deceasedTrends.length > 0 ? deceasedTrends.map(d => d.month || d.month_label || "") : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const deceasedTrendValues = deceasedTrends.length > 0 ? deceasedTrends.map(d => d.count || 0) : [8, 11, 10, 15, 13, 18];
  const safeDeceasedTrendsData = validateChartData(createCartesianChartData(
    deceasedTrendLabels,
    [{
      label: "Cases",
      data: deceasedTrendValues,
      borderColor: COLORS.chart1,
      backgroundColor: 'rgba(59, 130, 246, 0.07)',
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: COLORS.chart1,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointHoverBorderWidth: 3,
    }]
  ), "DeceasedTrends");

  const coffinSalesLabels = coffinSalesData.length > 0 ? coffinSalesData.map(c => c.type || "") : ["Standard", "Premium", "Eco"];
  const coffinSalesValues = coffinSalesData.length > 0 ? coffinSalesData.map(c => c.sold || 0) : [
    Math.max(2, Math.round(Number(coffins.totalStock || 0) / 4) || 2),
    Math.max(1, Math.round(Number(coffins.totalStock || 0) / 6) || 1),
    Math.max(1, Math.round(Number(coffins.totalStock || 0) / 8) || 1)
  ];
  const safeCoffinSalesData = validateChartData(createCartesianChartData(
    coffinSalesLabels,
    [{
      label: "Sold",
      data: coffinSalesValues,
      backgroundColor: coffinSalesLabels.map((_, i) => chartColors[i % chartColors.length] + 'bb'),
      borderColor: coffinSalesLabels.map((_, i) => chartColors[i % chartColors.length]),
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: coffinSalesLabels.map((_, i) => chartColors[i % chartColors.length]),
    }]
  ), "CoffinSales");

  const chemicalUsageLabels = Array.isArray(chemicals.usageTrends) && chemicals.usageTrends.length > 0
    ? chemicals.usageTrends.map(item => item.month || item.month_label || item.chemical || 'Unknown')
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const chemicalUsageValues = Array.isArray(chemicals.usageTrends) && chemicals.usageTrends.length > 0
    ? chemicals.usageTrends.map(item => parseFloat(item.quantity || item.qty || 0) || 0)
    : [3, 5, 4, 6, 7, 5];
  const safeChemicalUsageTrendsData = validateChartData(createCartesianChartData(
    chemicalUsageLabels,
    [{
      label: "Usage",
      data: chemicalUsageValues,
      borderColor: COLORS.info,
      backgroundColor: 'rgba(6, 182, 212, 0.07)',
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: COLORS.info,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointHoverBorderWidth: 3,
    }]
  ), "ChemicalUsageTrends");

  const ppeStatusCounts = (ppeRequests || []).reduce((acc, req) => {
    const status = req.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const ppeStatusEntries = Object.entries(ppeStatusCounts);
  const safePPEStatusData = validateChartData(createRadialChartData(
    ppeStatusEntries.length > 0 ? ppeStatusEntries.map(([status]) => status) : ["Pending", "Approved"],
    ppeStatusEntries.length > 0 ? ppeStatusEntries.map(([, count]) => count) : [2, 1],
    [COLORS.warning, COLORS.info, COLORS.success, COLORS.danger, COLORS.secondary]
  ), "PPEStatus");

  const topUsedLabels = Array.isArray(chemicals.topUsed) && chemicals.topUsed.length > 0
    ? chemicals.topUsed.map(item => item.name || item.chemical || 'Unknown')
    : ["Formalin", "Disinfectant", "PPE"];
  const topUsedValues = Array.isArray(chemicals.topUsed) && chemicals.topUsed.length > 0
    ? chemicals.topUsed.map(item => parseFloat(item.totalUsed || item.total_used || 0) || 0)
    : [12, 9, 7];
  const safeTopUsedChemicalsData = validateChartData(createCartesianChartData(
    topUsedLabels,
    [{
      label: "Top Usage",
      data: topUsedValues,
      backgroundColor: topUsedLabels.map((_, i) => chartColors[i % chartColors.length] + 'bb'),
      borderColor: topUsedLabels.map((_, i) => chartColors[i % chartColors.length]),
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: topUsedLabels.map((_, i) => chartColors[i % chartColors.length]),
    }]
  ), "TopUsedChemicals");

  const workshopStages = Array.isArray(workshop.production) ? workshop.production : [];
  const workshopStageLabels = workshopStages.length > 0 ? workshopStages.map(stage => stage.stage || 'Stage') : ["Planning", "Fabrication", "Delivery"];
  const workshopStageValuesCompleted = workshopStages.length > 0 ? workshopStages.map(stage => stage.completed || 0) : [4, 6, 2];
  const workshopStageValuesInProgress = workshopStages.length > 0 ? workshopStages.map(stage => stage.inProgress || 0) : [2, 3, 1];
  const safeWorkshopProductionData = validateChartData(createCartesianChartData(
    workshopStageLabels,
    [
      {
        label: 'Completed',
        data: workshopStageValuesCompleted,
        backgroundColor: COLORS.success + 'bb',
        borderColor: COLORS.success,
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'In Progress',
        data: workshopStageValuesInProgress,
        backgroundColor: COLORS.warning + 'bb',
        borderColor: COLORS.warning,
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  ), 'WorkshopProduction');

  // Branch comparison array for the split mini-charts
  const branchCompareArr = branchCompare ? Object.values(branchCompare) : [];

  // Bookings breakdown (Active/Booked, Completed, Cancelled)
  const totalBookings = Number(bookings.total) || (Number(bookings.booked) || Number(bookings.completed) || 0);
  const activeBooked = Number(bookings.booked) || 0;
  const completedCount = Number(bookings.completed) || 0;
  const cancelledCount = Math.max(0, totalBookings - activeBooked - completedCount);
  const rawBookingsDataset = [{
    label: 'Bookings',
    data: [activeBooked, completedCount, cancelledCount],
    backgroundColor: [COLORS.chart3 + 'bb', COLORS.success + 'bb', COLORS.danger + 'bb'],
    borderColor: [COLORS.chart3, COLORS.success, COLORS.danger],
    borderWidth: 2,
    borderRadius: 6,
    borderSkipped: false
  }];
  const safeBookingsChartData = validateChartData(createCartesianChartData(['Active', 'Completed', 'Cancelled'], rawBookingsDataset), 'BookingsBreakdown');

  // Fleet utilization gauge
  const fleetAvailable = Number(bookings.fleet?.available) || 0;
  const fleetTotal = Number(bookings.fleet?.total) || Math.max(fleetAvailable, Number(bookings.fleet?.booked) || 0);
  const fleetUsed = Math.max(0, (fleetTotal || 0) - fleetAvailable);
  const safeFleetUtilData = validateChartData(createRadialChartData(['Available', 'Used'], fleetTotal > 0 ? [fleetAvailable, fleetUsed] : [1, 0], [COLORS.success, COLORS.danger]), 'FleetUtil');

  // Coffin inventory by branch (use comparison data if available)
  const coffinsByBranchLabels = branchCompareArr.length > 0 ? branchCompareArr.map(b => (b.branchName || `B${b.branchId}`).length > 12 ? (b.branchName || `B${b.branchId}`).substring(0, 11) + '…' : (b.branchName || `B${b.branchId}`)) : [selectedBranch?.branch_name || selectedBranch?.name || 'Branch'];
  const coffinsByBranchValues = branchCompareArr.length > 0 ? branchCompareArr.map(b => Number(b.coffins?.totalStock || 0)) : [Number(coffins.totalStock || 0)];
  const safeCoffinsByBranchData = validateChartData(createCartesianChartData(coffinsByBranchLabels, [{ label: 'Coffin Stock', data: coffinsByBranchValues, backgroundColor: coffinsByBranchLabels.map((_, i) => chartColors[i % chartColors.length] + 'bb'), borderColor: coffinsByBranchLabels.map((_, i) => chartColors[i % chartColors.length]), borderWidth: 2, borderRadius: 6, borderSkipped: false }]), 'CoffinsByBranch');

  // Chemicals per branch (low stock count or usage)
  const chemicalsByBranchLabels = branchCompareArr.length > 0 ? branchCompareArr.map(b => (b.branchName || `B${b.branchId}`).length > 12 ? (b.branchName || `B${b.branchId}`).substring(0, 11) + '…' : (b.branchName || `B${b.branchId}`)) : [selectedBranch?.branch_name || selectedBranch?.name || 'Branch'];
  const chemicalsByBranchValues = branchCompareArr.length > 0 ? branchCompareArr.map(b => Number(b.chemicals?.lowStockCount || b.chemicals?.totalUsed30d || 0)) : [Number(chemicals.totalUsed30d || chemicals.lowStock?.length || 0)];
  const safeChemicalsByBranchData = validateChartData(createCartesianChartData(chemicalsByBranchLabels, [{ label: 'Chemicals', data: chemicalsByBranchValues, backgroundColor: chemicalsByBranchLabels.map((_, i) => chartColors[i % chartColors.length] + 'bb'), borderColor: chemicalsByBranchLabels.map((_, i) => chartColors[i % chartColors.length]), borderWidth: 2, borderRadius: 6, borderSkipped: false }]), 'ChemicalsByBranch');

  // Helper to build a single-metric comparison dataset
  const buildComparisonDataset = (metricKey) => {
    if (branchCompareArr.length === 0) return null;
    let dataValues;
    if (metricKey === 'deceased') {
      dataValues = branchCompareArr.map(b => b.deceased?.total || 0);
    } else if (metricKey === 'bookings') {
      dataValues = branchCompareArr.map(b => b.bookings?.total || 0);
    } else if (metricKey === 'revenue') {
      dataValues = branchCompareArr.map(b => parseFloat(b.revenue?.total30d || 0) || 0);
    } else {
      dataValues = branchCompareArr.map(() => 0);
    }
    return validateChartData(createCartesianChartData(
      branchCompareArr.map(b => {
        const name = b.branchName || `Branch ${b.branchId}`;
        // Shorten long branch names for compact charts
        return name.length > 12 ? name.substring(0, 11) + '…' : name;
      }),
      [{
        label: metricKey.charAt(0).toUpperCase() + metricKey.slice(1),
        data: dataValues,
        backgroundColor: branchCompareArr.map((_, i) => chartColors[i % chartColors.length] + 'cc'),
        borderColor: branchCompareArr.map((_, i) => chartColors[i % chartColors.length]),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: branchCompareArr.map((_, i) => chartColors[i % chartColors.length]),
      }]
    ), `Comp${metricKey}`);
  };

  const safeCompDeceased = buildComparisonDataset('deceased');
  const safeCompBookings = buildComparisonDataset('bookings');
  const safeCompRevenue = buildComparisonDataset('revenue');

  return (
    <Container fluid className="py-4" style={{ background: COLORS.light, minHeight: "100vh" }}>
      {/* HEADER */}
      <Card className="border-0 mb-4" style={{ borderRadius: "16px", background: "#111113", boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="text-white fw-bold mb-1" style={{ fontSize: "1.4rem", letterSpacing: "-0.02em" }}>Analytics</h2>
              <p className="text-white-50 mb-0" style={{ fontSize: "0.8rem" }}>Real-time branch comparison & intelligent insights</p>
            </div>
            <div className="d-flex gap-2 align-items-center flex-wrap">
              <Dropdown autoClose="outside">
                <Dropdown.Toggle variant="light" size="sm" className="d-flex align-items-center gap-2 border-0 shadow-sm" style={{ borderRadius: "10px", fontWeight: "500", fontSize: "0.8125rem" }}>
                  <MapPin size={16} />{selectedBranch?.branch_name || selectedBranch?.name || "Select Branch"}
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
                  {branches.map((b, idx) => {
                    const bid = getBranchIdentifier(b);
                    const itemKey = bid || b.id || b.branch_id || b.branchId || b.branch_name || b.name || `br-${idx}`;
                    return (
                      <Dropdown.Item key={itemKey} onClick={() => setSelectedBranch(b)}
                        active={getBranchIdentifier(selectedBranch) === bid}
                        style={{ fontSize: "0.8125rem" }}>
                        {b.branch_name || b.name}
                      </Dropdown.Item>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>

              {/* REDESIGNED Compare Dropdown */}
              <Dropdown autoClose="outside" align="end">
                <Dropdown.Toggle
                  variant="light"
                  size="sm"
                  className="d-flex align-items-center gap-2 border-0 shadow-sm"
                  style={{ borderRadius: "10px", fontWeight: "500", fontSize: "0.8125rem" }}
                >
                  <GitCompareArrows size={16} />
                  Compare
                  {selectedBranches.length > 0 && (
                    <Badge pill style={{ fontSize: "0.6rem", background: COLORS.primaryLight, border: "none" }}>{selectedBranches.length}</Badge>
                  )}
                  <ChevronDown size={13} style={{ opacity: 0.5 }} />
                </Dropdown.Toggle>
                <Dropdown.Menu
                  style={{
                    minWidth: 300, maxWidth: 340, padding: 0,
                    borderRadius: "14px", border: "1px solid #e2e8f0",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.03)",
                    overflow: "hidden"
                  }}
                >
                  {/* Dropdown header */}
                  <div className="px-3 pt-3 pb-2" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="fw-bold" style={{ fontSize: "0.85rem", color: COLORS.dark }}>Compare Branches</div>
                      <Badge pill bg={selectedBranches.length >= 2 ? "success" : "secondary"} style={{ fontSize: "0.65rem" }}>
                        {selectedBranches.length} selected
                      </Badge>
                    </div>
                    <small className="text-muted" style={{ fontSize: "0.72rem" }}>Pick 2 or more to compare</small>
                  </div>

                  {/* Branch list with custom checkboxes */}
                  <div style={{ maxHeight: 200, overflowY: "auto", padding: "6px 10px" }}>
                    {branches.map((b, idx) => {
                      const bid = getBranchIdentifier(b);
                      const isSelected = bid && selectedBranches.includes(bid);
                      const itemKey = bid || b.id || b.branch_id || b.branchId || b.branch_name || b.name || `br-${idx}`;
                      return (
                        <div
                          key={itemKey}
                          onClick={() => toggleBranch(b)}
                          className="d-flex align-items-center gap-2 px-2 py-2 rounded-lg mb-1"
                          style={{
                            cursor: "pointer",
                            background: isSelected ? "rgba(59, 130, 246, 0.06)" : "transparent",
                            border: isSelected ? "1px solid rgba(59, 130, 246, 0.15)" : "1px solid transparent",
                            transition: "all 0.15s ease",
                            borderRadius: "8px"
                          }}
                        >
                          <div style={{
                            width: "18px", height: "18px", borderRadius: "5px",
                            border: isSelected ? "none" : "2px solid #d1d5db",
                            background: isSelected ? COLORS.primaryLight : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, transition: "all 0.15s ease"
                          }}>
                            {isSelected && <CheckCircle size={13} color="white" strokeWidth={3} />}
                          </div>
                          <span style={{
                            fontSize: "0.8125rem",
                            fontWeight: isSelected ? "600" : "400",
                            color: isSelected ? COLORS.dark : COLORS.gray
                          }}>
                            {b.branch_name || b.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dropdown footer with actions */}
                  <div className="p-3 d-flex gap-2" style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="flex-fill"
                      style={{ borderRadius: "8px", fontSize: "0.8rem", fontWeight: "500" }}
                      onClick={() => {
                        const allIds = branches.map(b => getBranchIdentifier(b)).filter(Boolean);
                        setSelectedBranches(allIds);
                        fetchComparison(allIds);
                      }}
                    >
                      All
                    </Button>
                    {selectedBranches.length > 0 && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        style={{ borderRadius: "8px", fontSize: "0.8rem", padding: "0.25rem 0.5rem" }}
                        onClick={() => { setSelectedBranches([]); setComparisonData(null); }}
                        title="Clear selection"
                      >
                        <X size={14} />
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-fill"
                      style={{ borderRadius: "8px", fontSize: "0.8rem", fontWeight: "600", background: COLORS.primaryLight, border: "none" }}
                      onClick={() => fetchComparison(selectedBranches)}
                      disabled={loadingComparison || selectedBranches.length < 2}
                    >
                      {loadingComparison ? <><Spinner size="sm" className="me-1" />Loading</> : "Compare"}
                    </Button>
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              <Button variant="light" size="sm" onClick={fetchDashboardData} disabled={refreshing} className="d-flex align-items-center gap-2 border-0 shadow-sm" style={{ borderRadius: "10px", fontWeight: "500", fontSize: "0.8125rem" }}>
                <RefreshCw size={16} className={refreshing ? "spin" : ""} />{refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4" style={{ borderRadius: "12px", border: "none", fontWeight: "500" }}>
          <AlertTriangle size={16} className="me-2" />{error}
        </Alert>
      )}

      {/* BRANCH COMPARISON PANEL — 3 separate mini-charts instead of 1 ugly mixed chart */}
      {branches.length > 0 && (
        <Card className="border-0 mb-4" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
          <Card.Body className="p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h5 className="fw-bold mb-1" style={{ fontSize: "1rem" }}>Branch Comparison</h5>
                <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>Use the Compare dropdown above to select branches and visualize performance</p>
              </div>
              {selectedBranches.length > 0 && (
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  {selectedBranches.slice(0, 3).map(bid => {
                    const b = branches.find(br => getBranchIdentifier(br) === bid);
                    return b ? (
                      <Badge key={bid} pill bg="light" text="dark" className="px-3 py-2" style={{ fontSize: "0.72rem", fontWeight: "500", border: "1px solid #e2e8f0" }}>
                        {b.branch_name || b.name}
                      </Badge>
                    ) : null;
                  })}
                  {selectedBranches.length > 3 && (
                    <Badge pill bg="secondary" className="px-3 py-2" style={{ fontSize: "0.72rem" }}>+{selectedBranches.length - 3} more</Badge>
                  )}
                </div>
              )}
            </div>

            {safeCompDeceased || safeCompBookings || safeCompRevenue ? (
              <Row className="g-3">
                <Col md={4}>
                  {safeCompDeceased ? (
                    <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", height: "210px" }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: COLORS.chart1 + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Users size={13} style={{ color: COLORS.chart1 }} />
                        </div>
                        <small className="fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Deceased Cases</small>
                      </div>
                      <div style={{ height: "155px" }}>
                        <SafeChart ChartComponent={Bar} data={safeCompDeceased} options={comparisonChartOptions} chartName="CompDeceased" />
                      </div>
                    </div>
                  ) : null}
                </Col>
                <Col md={4}>
                  {safeCompBookings ? (
                    <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", height: "210px" }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: COLORS.chart3 + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Calendar size={13} style={{ color: COLORS.chart3 }} />
                        </div>
                        <small className="fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Bookings</small>
                      </div>
                      <div style={{ height: "155px" }}>
                        <SafeChart ChartComponent={Bar} data={safeCompBookings} options={comparisonChartOptions} chartName="CompBookings" />
                      </div>
                    </div>
                  ) : null}
                </Col>
                <Col md={4}>
                  {safeCompRevenue ? (
                    <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", height: "210px" }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: COLORS.chart2 + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <DollarSign size={13} style={{ color: COLORS.chart2 }} />
                        </div>
                        <small className="fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Revenue (30d)</small>
                      </div>
                      <div style={{ height: "155px" }}>
                        <SafeChart ChartComponent={Bar} data={safeCompRevenue} options={comparisonChartOptions} chartName="CompRevenue" />
                      </div>
                    </div>
                  ) : null}
                </Col>
              </Row>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted" style={{ minHeight: 140 }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "16px",
                  background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "0.75rem"
                }}>
                  <GitCompareArrows size={24} style={{ color: "#cbd5e1" }} />
                </div>
                <small style={{ fontWeight: "500" }}>Select 2 or more branches to compare</small>
                <small style={{ fontSize: "0.72rem", opacity: 0.6, marginTop: "2px" }}>Use the Compare dropdown in the header above</small>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {branchCompare && <BranchComparisonTable branches={branchCompare} />}

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
      {(safeDeceasedTrendsData || safeCaseStatusData || safeFleetData) && (
        <Card className="border-0 mb-4" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
          <Card.Body className="p-4">
            <SectionHeader title="Deceased Management" icon={Users} color={COLORS.primary} />
            <Row className="g-4">
              {safeDeceasedTrendsData && (
                <Col lg={6}>
                  <ChartCard title="Cases Trend (12 Months)" icon={TrendingUp} color={COLORS.primary} height="280px">
                    <SafeChart ChartComponent={Line} data={safeDeceasedTrendsData} options={cartesianChartOptions} chartName="DeceasedTrends" />
                  </ChartCard>
                </Col>
              )}
              {safeCaseStatusData && (
                <Col lg={safeDeceasedTrendsData ? 3 : 6}>
                  <ChartCard title="Case Status" icon={CheckCircle} color={COLORS.info} height="280px">
                    <SafeChart ChartComponent={Pie} data={safeCaseStatusData} options={radialChartOptions} chartName="CaseStatus" />
                  </ChartCard>
                </Col>
              )}
              {safeFleetData && (
                <Col lg={safeDeceasedTrendsData && safeCaseStatusData ? 3 : safeDeceasedTrendsData || safeCaseStatusData ? 6 : 12}>
                  <ChartCard title="Hearse Fleet" icon={Car} color={COLORS.success} height="280px">
                    <SafeChart ChartComponent={Doughnut} data={safeFleetData} options={radialChartOptions} chartName="FleetData" />
                  </ChartCard>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* BOOKINGS + MOST BOOKED HEARSES */}
      <Card className="border-0 mb-4" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
        <Card.Body className="p-4">
          <SectionHeader title="Hearse Bookings & Fleet Performance" icon={Truck} color={COLORS.purple} />
          <Row className="g-3 mb-3">
            <Col lg={5} md={12}>
              <ChartCard title="Bookings Breakdown" icon={Calendar} color={COLORS.chart3} height="220px">
                {safeBookingsChartData ? (
                  <SafeChart ChartComponent={Bar} data={safeBookingsChartData} options={comparisonChartOptions} chartName="BookingsBreakdown" />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted"><small>No bookings data</small></div>
                )}
              </ChartCard>
            </Col>

            <Col lg={3} md={6}>
              <ChartCard title="Fleet Utilization" icon={Car} color={COLORS.success} height="220px">
                {safeFleetUtilData ? (
                  <SafeChart ChartComponent={Doughnut} data={safeFleetUtilData} options={radialChartOptions} chartName="FleetUtil" />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted"><small>No fleet data</small></div>
                )}
                <div className="mt-2 small text-muted text-center">Available: {fleetAvailable}/{fleetTotal || 0}</div>
              </ChartCard>
            </Col>

            <Col lg={4} md={6}>
              <ChartCard title="Coffin Inventory (per branch)" icon={Box} color={COLORS.warning} height="220px">
                {safeCoffinsByBranchData ? (
                  <SafeChart ChartComponent={Bar} data={safeCoffinsByBranchData} options={comparisonChartOptions} chartName="CoffinsByBranch" />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted"><small>No coffin inventory</small></div>
                )}
              </ChartCard>
            </Col>
          </Row>
          {hearses.mostBooked?.length > 0 && (
            <div className="mt-3">
              <h6 className="fw-bold mb-2" style={{ fontSize: "0.85rem" }}>Most Booked Hearses</h6>
              <div style={{ overflowX: "auto" }}>
                <Table responsive hover size="sm" style={{ fontSize: "0.8125rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ borderRadius: "8px 0 0 0", fontWeight: "600", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.gray }}>#</th>
                      <th style={{ fontWeight: "600", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.gray }}>Hearse</th>
                      <th style={{ fontWeight: "600", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.gray }}>Plate</th>
                      <th style={{ fontWeight: "600", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.gray }}>Branch</th>
                      <th style={{ fontWeight: "600", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.gray }}>Bookings</th>
                      <th style={{ borderRadius: "0 8px 0 0", fontWeight: "600", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.gray }}>Trips Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hearses.mostBooked.slice(0, 5).map((h, i) => (
                      <tr key={h.id}>
                        <td><span className="fw-bold text-muted">{i + 1}</span></td>
                        <td className="fw-medium">{h.name}</td>
                        <td><code style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px", fontSize: "0.78rem" }}>{h.plate}</code></td>
                        <td><Badge bg="light" text="dark" pill style={{ fontSize: "0.7rem", border: "1px solid #e2e8f0" }}>{h.branchName}</Badge></td>
                        <td><Badge bg="primary" pill style={{ fontSize: "0.7rem" }}>{h.totalBookings}</Badge></td>
                        <td className="fw-medium">{h.completedTrips}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* INVENTORY SECTION */}
      {(safeCoffinSalesData || safeTopUsedChemicalsData || chemicals.lowStock?.length > 0) && (
        <Card className="border-0 mb-4" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
          <Card.Body className="p-4">
            <SectionHeader title="Inventory Management" icon={Box} color={COLORS.warning} />
            <Row className="g-4">
              {safeCoffinSalesData && (
                <Col lg={4} md={12}>
                  <ChartCard title="Coffin Sales by Type" icon={ShoppingCart} color={COLORS.warning} height="240px">
                    <SafeChart ChartComponent={Bar} data={safeCoffinSalesData} options={cartesianChartOptions} chartName="CoffinSales" />
                  </ChartCard>
                </Col>
              )}

              <Col lg={4} md={12}>
                <ChartCard title="Coffin Inventory by Branch" icon={Box} color={COLORS.warning} height="240px">
                  {safeCoffinsByBranchData ? (
                    <SafeChart ChartComponent={Bar} data={safeCoffinsByBranchData} options={comparisonChartOptions} chartName="CoffinsByBranch" />
                  ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                      <small>No coffin inventory available</small>
                      <div className="fw-bold mt-2" style={{ fontSize: '1.25rem' }}>{coffins.totalStock || 0}</div>
                    </div>
                  )}
                </ChartCard>
              </Col>

              <Col lg={4} md={12}>
                <ChartCard title="Low Stock Chemicals" icon={FlaskConical} color={COLORS.danger} height="240px">
                  {chemicals.lowStock?.length > 0 ? (
                    <div style={{ overflowY: "auto", height: "100%", paddingRight: "4px" }}>
                      {chemicals.lowStock.map((c, i) => {
                        const pct = c.minLevel > 0 ? Math.min(100, (c.currentStock / c.minLevel) * 100) : 0;
                        const barColor = pct < 50 ? COLORS.danger : pct < 80 ? COLORS.warning : COLORS.success;
                        return (
                          <div key={i} className="mb-3">
                            <div className="d-flex justify-content-between align-items-center small mb-1">
                              <span className="fw-medium" style={{ fontSize: "0.8rem" }}>{c.name}</span>
                              <Badge pill bg={pct < 50 ? "danger" : "warning"} style={{ fontSize: "0.65rem" }}>{c.currentStock}/{c.minLevel} {c.unit}</Badge>
                            </div>
                            <div style={{ height: "8px", borderRadius: "4px", background: "#f1f5f9", overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", borderRadius: "4px", background: `linear-gradient(90deg, ${barColor}, ${barColor}aa)`, transition: "width 0.4s ease" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-success">
                      <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: COLORS.successLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.5rem" }}>
                        <CheckCircle size={24} />
                      </div>
                      <p className="mb-0 small fw-medium">All chemicals above minimum stock</p>
                    </div>
                  )}
                </ChartCard>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* WORKSHOP SECTION */}
      {workshop.orders?.total > 0 && (
        <Card className="border-0 mb-4" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
          <Card.Body className="p-4">
            <SectionHeader title="Workshop Production" icon={Activity} color={COLORS.purple} />
            <Row className="g-3 mb-3">
              {[
                { label: "Total Orders", value: workshop.orders?.total || 0, bg: COLORS.purpleLight, color: COLORS.purple },
                { label: "Completed", value: workshop.orders?.completed || 0, bg: COLORS.successLight, color: COLORS.success },
                { label: "Pending", value: workshop.orders?.pending || 0, bg: COLORS.warningLight, color: COLORS.warning },
                { label: "Profit", value: `KES ${parseFloat(workshop.orders?.profit || 0).toLocaleString()}`, bg: COLORS.infoLight, color: COLORS.info },
              ].map((item, i) => (
                <Col xs={6} md={3} key={i}>
                  <div className="p-3 rounded-3 text-center" style={{ backgroundColor: item.bg, border: "1px solid " + item.color + "20" }}>
                    <h5 className="fw-bold mb-0" style={{ color: item.color, fontSize: "1.3rem" }}>{item.value}</h5>
                    <small className="text-muted" style={{ fontSize: "0.75rem", fontWeight: "500" }}>{item.label}</small>
                  </div>
                </Col>
              ))}
            </Row>
            <Row className="g-4">
              <Col lg={8}>
                <ChartCard title="Workshop Stage Performance" icon={BarChart3} color={COLORS.purple} height="320px">
                  {safeWorkshopProductionData ? (
                    <SafeChart ChartComponent={Bar} data={safeWorkshopProductionData} options={cartesianChartOptions} chartName="WorkshopProduction" />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                      <small>No production data available</small>
                    </div>
                  )}
                </ChartCard>
              </Col>
              <Col lg={4}>
                <ChartCard title="Workshop Summary" icon={Activity} color={COLORS.purple} height="320px">
                  <div className="d-flex flex-column justify-content-center h-100 gap-3">
                    <div className="text-center p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="fw-bold" style={{ fontSize: "2rem", color: COLORS.purple }}>
                        {workshop.orders?.total ? Math.round(((workshop.orders?.completed || 0) / workshop.orders.total) * 100) : 0}%
                      </div>
                      <small className="text-muted" style={{ fontSize: "0.78rem" }}>Completion Rate</small>
                      <div className="mt-2" style={{ height: "6px", borderRadius: "3px", background: "#e2e8f0", overflow: "hidden" }}>
                        <div style={{
                          width: `${workshop.orders?.total ? Math.round(((workshop.orders?.completed || 0) / workshop.orders.total) * 100) : 0}%`,
                          height: "100%", borderRadius: "3px",
                          background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.purple}aa)`,
                          transition: "width 0.5s ease"
                        }} />
                      </div>
                    </div>
                    <div className="d-flex justify-content-between p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="text-center">
                        <div className="fw-bold" style={{ color: COLORS.success }}>{workshop.orders?.completed || 0}</div>
                        <small className="text-muted" style={{ fontSize: "0.7rem" }}>Done</small>
                      </div>
                      <div style={{ width: "1px", background: "#e2e8f0" }} />
                      <div className="text-center">
                        <div className="fw-bold" style={{ color: COLORS.warning }}>{workshop.orders?.pending || 0}</div>
                        <small className="text-muted" style={{ fontSize: "0.7rem" }}>Pending</small>
                      </div>
                    </div>
                  </div>
                </ChartCard>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* CHEMICALS SECTION */}
      {(safeChemicalUsageTrendsData || safeTopUsedChemicalsData || chemicals.expiringSoon?.length > 0) && (
        <Card className="border-0 mb-4" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
          <Card.Body className="p-4">
            <SectionHeader title="Chemicals & Consumables" icon={FlaskConical} color={COLORS.info} />
            <Row className="g-4">
              {safeChemicalUsageTrendsData && (
                <Col lg={6}>
                  <ChartCard title="Chemical Usage Trends" icon={TrendingUp} color={COLORS.info} height="280px">
                    <SafeChart ChartComponent={Line} data={safeChemicalUsageTrendsData} options={cartesianChartOptions} chartName="ChemicalUsageTrends" />
                  </ChartCard>
                </Col>
              )}
              {safeTopUsedChemicalsData && (
                <Col lg={safeChemicalUsageTrendsData ? 6 : 12}>
                  <ChartCard title="Top Used Chemicals" icon={FlaskConical} color={COLORS.chart5} height="280px">
                    <SafeChart ChartComponent={Bar} data={safeTopUsedChemicalsData} options={cartesianChartOptions} chartName="TopUsedChemicals" />
                  </ChartCard>
                </Col>
              )}
              {chemicals.expiringSoon?.length > 0 && (
                <Col lg={12}>
                  <div className="p-3 rounded-3" style={{ background: COLORS.dangerLight, border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <AlertTriangle size={16} style={{ color: COLORS.danger }} />
                      <strong style={{ fontSize: "0.85rem", color: COLORS.danger }}>Expiring Soon</strong>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {chemicals.expiringSoon.map((c, i) => (
                        <Badge key={i} bg="danger" pill style={{ fontSize: "0.72rem", fontWeight: "500" }}>
                          {c.name} — {c.expiryDate || c.expiry || "N/A"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* PPE REQUESTS SECTION */}
      {safePPEStatusData && (
        <Card className="border-0 mb-4" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
          <Card.Body className="p-4">
            <SectionHeader title="PPE Requests" icon={Shield} color={COLORS.warning} />
            <Row className="g-4">
              <Col md={4}>
                <ChartCard title="Request Status" icon={Shield} color={COLORS.warning} height="280px">
                  <SafeChart ChartComponent={Doughnut} data={safePPEStatusData} options={radialChartOptions} chartName="PPEStatus" />
                </ChartCard>
              </Col>
              <Col md={8}>
                <div className="p-3 rounded-3 h-100" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <h6 className="fw-bold mb-3" style={{ fontSize: "0.85rem" }}>Recent PPE Requests</h6>
                  <div style={{ overflowY: "auto", maxHeight: "240px" }}>
                    <Table responsive hover size="sm" style={{ fontSize: "0.8rem" }}>
                      <thead>
                        <tr style={{ background: "#f1f5f9" }}>
                          <th style={{ fontWeight: "600", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.gray }}>Item</th>
                          <th style={{ fontWeight: "600", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.gray }}>Qty</th>
                          <th style={{ fontWeight: "600", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.gray }}>Status</th>
                          <th style={{ fontWeight: "600", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.gray }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(ppeRequests || []).slice(0, 8).map((req, i) => {
                          const statusColor = req.status === 'approved' ? 'success' : req.status === 'pending' ? 'warning' : req.status === 'rejected' ? 'danger' : 'secondary';
                          return (
                            <tr key={i}>
                              <td className="fw-medium">{req.item || req.name || `PPE #${i + 1}`}</td>
                              <td>{req.quantity || req.qty || '-'}</td>
                              <td><Badge pill bg={statusColor} style={{ fontSize: "0.65rem", textTransform: "capitalize" }}>{req.status || 'unknown'}</Badge></td>
                              <td className="text-muted">{req.date || req.createdAt || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* RECOMMENDATIONS */}
      {comparisonData?.insights?.recommendations && (
        <RecommendationsCard recommendations={comparisonData.insights.recommendations} />
      )}

      {/* Footer spacer */}
      <div style={{ height: "2rem" }} />
    </Container>
  );
};

export default ComprehensiveDashboard;