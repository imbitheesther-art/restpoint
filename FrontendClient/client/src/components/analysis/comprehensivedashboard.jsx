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
  GitCompareArrows, X, ChevronDown, Flower2, User, Phone, Mail, Eye, Filter,
  Download, Printer, MessageSquare, FileText, Edit, Trash2, MoreVertical,
  Search, SlidersHorizontal, ChevronLeft, ChevronRight, Users2, ClipboardList,
  Gauge, BarChart2, PieChart as PieChartIcon, Plus
} from "lucide-react";
import { getTenantHeaders } from "../../api/endpoints";
import env from "../../utils/config/env";

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
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('week');
  const [drillDownData, setDrillDownData] = useState(null);
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const lastFetchRef = useRef(0);

  const chartColors = [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5, COLORS.chart6, COLORS.chart7, COLORS.chart8];

  // ============================================
  // CHART OPTIONS
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
  // SAFE CHART DATA HELPERS
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
    const id = branch.branch_slug || branch.slug || branch.branch_code || branch.branch_id || branch.id || branch.branchId || branch.branchName || branch.name || "";
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
    if (!bid) return;
    setSelectedBranches(prev => prev.includes(bid) ? prev.filter(x => x !== bid) : [...prev, bid]);
  };

  const openDetailPanel = (record) => {
    setSelectedRecord(record);
    setShowDetailPanel(true);
  };

  const closeDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedRecord(null);
  };

  const openDrillDown = (type, data) => {
    setDrillDownData({ type, data });
    setShowDrillDown(true);
  };

  const closeDrillDown = () => {
    setShowDrillDown(false);
    setDrillDownData(null);
  };

  const openCalendar = () => {
    setShowCalendar(true);
  };

  const closeCalendar = () => {
    setShowCalendar(false);
    setSelectedDate(null);
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
  const flowerBookings = dd.flowerBookings || [];
  const branchCompare = comparisonData?.branches;
  const insights = comparisonData?.insights;

  // Dummy data for demonstration
  const dummyDeceasedCases = [
    { id: 1, name: 'James Ochieng', age: 67, branch: 'Nairobi Main', date: '2025-06-15', status: 'completed', cause: 'Natural causes', nextOfKin: 'Mary Ochieng', phone: '+254 722 3344', admissionNo: 'ADM-2401' },
    { id: 2, name: 'Mary Wanjiku', age: 45, branch: 'Nairobi Main', date: '2025-06-14', status: 'active', cause: 'Cardiac arrest', nextOfKin: 'Peter Wanjiku', phone: '+254 733 4455', admissionNo: 'ADM-2402' },
    { id: 3, name: 'Susan Auma', age: 81, branch: 'Mombasa Branch', date: '2025-06-13', status: 'in-transit', cause: 'N/A', nextOfKin: 'John Auma', phone: '+254 744 5566', admissionNo: 'ADM-2403' },
    { id: 4, name: 'Peter Mwangi', age: 72, branch: 'Nairobi Main', date: '2025-06-12', status: 'released', cause: 'N/A', nextOfKin: 'Grace Mwangi', phone: '+254 755 6677', admissionNo: 'ADM-2404' },
    { id: 5, name: 'Grace Akinyi', age: 58, branch: 'Kisumu Branch', date: '2025-06-11', status: 'completed', cause: 'Respiratory failure', nextOfKin: 'Joseph Akinyi', phone: '+254 766 7788', admissionNo: 'ADM-2405' },
    { id: 6, name: 'Daniel Kiptoo', age: 39, branch: 'Nakuru Branch', date: '2025-06-10', status: 'active', cause: 'Road traffic accident', nextOfKin: 'Jane Kiptoo', phone: '+254 777 8899', admissionNo: 'ADM-2406' },
  ];

  const dummyFlowerBookings = [
    { id: 1, bookingCode: 'FLW-1001', clientName: 'Alice Wanjiku', phone: '+254 722 1111', flowerType: 'Rose Bouquet', color: 'Red', quantity: 12, eventDate: '2025-06-17', status: 'confirmed', amount: 4500, notes: 'For memorial service' },
    { id: 2, bookingCode: 'FLW-1002', clientName: 'John Kamau', phone: '+254 733 2222', flowerType: 'Lily Arrangement', color: 'White', quantity: 8, eventDate: '2025-06-16', status: 'completed', amount: 3200, notes: 'Delivered to Nairobi Main' },
    { id: 3, bookingCode: 'FLW-1003', clientName: 'Mary Muthoni', phone: '+254 744 3333', flowerType: 'Mixed Flowers', color: 'Mixed', quantity: 15, eventDate: '2025-06-18', status: 'confirmed', amount: 8500, notes: 'VIP - premium arrangement' },
    { id: 4, bookingCode: 'FLW-1004', clientName: 'Peter Otieno', phone: '+254 755 4444', flowerType: 'White Chrysanthemum', color: 'White', quantity: 20, eventDate: '2025-06-19', status: 'pending', amount: 6000, notes: 'Urgent delivery needed' },
  ];

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

      {/* BRANCH COMPARISON PANEL */}
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

      {/* KEY METRICS - ROW 1 with Trend Indicators */}
      <Row className="g-3 mb-4">
        <Col xs={6} lg={3}>
          <Card className="h-100 border-0" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)', cursor: 'pointer' }} onClick={() => setActiveTab('deceased')}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: COLORS.primaryLight + "12", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={20} style={{ color: COLORS.primaryLight }} />
                </div>
                <div className="text-end">
                  <div className="fw-bold" style={{ color: COLORS.dark, fontSize: "1.35rem" }}>{deceased.total || 0}</div>
                  <div className="d-flex align-items-center gap-1" style={{ fontSize: "0.65rem", color: COLORS.success }}>
                    <ArrowUp size={10} /> 12%
                  </div>
                </div>
              </div>
              <small className="text-muted d-block" style={{ fontSize: "0.78rem", fontWeight: "500" }}>Total Deceased</small>
              <small className="text-muted" style={{ fontSize: "0.72rem" }}>{deceased.thisWeek || 0} this week · {deceased.today || 0} today</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} lg={3}>
          <Card className="h-100 border-0" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)', cursor: 'pointer' }} onClick={() => setActiveTab('deceased')}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: COLORS.success + "12", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Activity size={20} style={{ color: COLORS.success }} />
                </div>
                <div className="text-end">
                  <div className="fw-bold" style={{ color: COLORS.dark, fontSize: "1.35rem" }}>{deceased.active || 0}</div>
                  <div className="d-flex align-items-center gap-1" style={{ fontSize: "0.65rem", color: COLORS.warning }}>
                    <Clock size={10} /> Active
                  </div>
                </div>
              </div>
              <small className="text-muted d-block" style={{ fontSize: "0.78rem", fontWeight: "500" }}>Active Cases</small>
              <small className="text-muted" style={{ fontSize: "0.72rem" }}>{deceased.released || 0} released this month</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} lg={3}>
          <Card className="h-100 border-0" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)', cursor: 'pointer' }} onClick={() => setActiveTab('bookings')}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: COLORS.warning + "12", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Calendar size={20} style={{ color: COLORS.warning }} />
                </div>
                <div className="text-end">
                  <div className="fw-bold" style={{ color: COLORS.dark, fontSize: "1.35rem" }}>{bookings.total || 0}</div>
                  <div className="d-flex align-items-center gap-1" style={{ fontSize: "0.65rem", color: COLORS.success }}>
                    <ArrowUp size={10} /> 8%
                  </div>
                </div>
              </div>
              <small className="text-muted d-block" style={{ fontSize: "0.78rem", fontWeight: "500" }}>Total Bookings</small>
              <small className="text-muted" style={{ fontSize: "0.72rem" }}>{bookings.thisWeek || 0} this week · {bookings.today || 0} today</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} lg={3}>
          <Card className="h-100 border-0" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)', cursor: 'pointer' }} onClick={() => setActiveTab('revenue')}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: COLORS.purple + "12", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DollarSign size={20} style={{ color: COLORS.purple }} />
                </div>
                <div className="text-end">
                  <div className="fw-bold" style={{ color: COLORS.dark, fontSize: "1.35rem" }}>KES {(parseFloat(revenue.total30d || 0) / 1000).toFixed(0)}K</div>
                  <div className="d-flex align-items-center gap-1" style={{ fontSize: "0.65rem", color: COLORS.success }}>
                    <ArrowUp size={10} /> 23%
                  </div>
                </div>
              </div>
              <small className="text-muted d-block" style={{ fontSize: "0.78rem", fontWeight: "500" }}>Revenue (30d)</small>
              <small className="text-muted" style={{ fontSize: "0.72rem" }}>{Math.round((parseFloat(revenue.collected30d || 0) / Math.max(1, parseFloat(revenue.total30d || 1)) * 100) || 0)}% collected</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* KEY METRICS - ROW 2 - Clickable for Drill-down */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="h-100 border-0" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)', cursor: 'pointer' }} onClick={() => openDrillDown('fleet', bookings.fleet)}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: COLORS.info + "12", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Car size={20} style={{ color: COLORS.info }} />
                </div>
                <Gauge size={18} style={{ color: COLORS.gray }} />
              </div>
              <div className="fw-bold" style={{ color: COLORS.dark, fontSize: "1.3rem" }}>{bookings.fleet?.available || 0}/{bookings.fleet?.total || 0}</div>
              <small className="text-muted d-block" style={{ fontSize: "0.78rem", fontWeight: "500" }}>Hearse Fleet</small>
              <small className="text-muted" style={{ fontSize: "0.72rem" }}>{bookings.fleet?.booked || 0} booked · Click for details</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="h-100 border-0" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)', cursor: 'pointer' }} onClick={() => openDrillDown('coffins', coffins)}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: COLORS.warning + "12", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Box size={20} style={{ color: COLORS.warning }} />
                </div>
                <BarChart2 size={18} style={{ color: COLORS.gray }} />
              </div>
              <div className="fw-bold" style={{ color: COLORS.dark, fontSize: "1.3rem" }}>{coffins.totalStock || 0}</div>
              <small className="text-muted d-block" style={{ fontSize: "0.78rem", fontWeight: "500" }}>Coffin Stock</small>
              <small className="text-muted" style={{ fontSize: "0.72rem" }}>KES {parseFloat(coffins.totalValue || 0).toLocaleString()} · Click for details</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="h-100 border-0" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)', cursor: 'pointer' }} onClick={() => openDrillDown('flowers', dummyFlowerBookings)}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: COLORS.danger + "12", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Flower2 size={20} style={{ color: COLORS.danger }} />
                </div>
                <PieChartIcon size={18} style={{ color: COLORS.gray }} />
              </div>
              <div className="fw-bold" style={{ color: COLORS.dark, fontSize: "1.3rem" }}>{dummyFlowerBookings.length}</div>
              <small className="text-muted d-block" style={{ fontSize: "0.78rem", fontWeight: "500" }}>Flower Bookings</small>
              <small className="text-muted" style={{ fontSize: "0.72rem" }}>KES {(dummyFlowerBookings.reduce((s, b) => s + b.amount, 0) / 1000).toFixed(1)}K · Click for details</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="h-100 border-0" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)', cursor: 'pointer' }} onClick={() => openDrillDown('chemicals', chemicals)}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: COLORS.info + "12", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FlaskConical size={20} style={{ color: COLORS.info }} />
                </div>
                <Activity size={18} style={{ color: COLORS.gray }} />
              </div>
              <div className="fw-bold" style={{ color: COLORS.dark, fontSize: "1.3rem" }}>{chemicals.lowStock?.length || 0}</div>
              <small className="text-muted d-block" style={{ fontSize: "0.78rem", fontWeight: "500" }}>Low Stock Alerts</small>
              <small className="text-muted" style={{ fontSize: "0.72rem" }}>{chemicals.topUsed?.length || 0} in top usage · Click for details</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ADVANCED ANALYTICS SECTION - Hearse Utilization, Case Pipeline, Staff Workload */}
      <Card className="border-0 mb-4" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
        <Card.Body className="p-4">
          <SectionHeader title="Advanced Analytics" icon={BarChart2} color={COLORS.purple} />
          <Row className="g-3">
            {/* Hearse Utilization */}
            <Col lg={4} md={6}>
              <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", cursor: 'pointer' }} onClick={() => openDrillDown('fleet', bookings.fleet)}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: COLORS.success + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Car size={16} style={{ color: COLORS.success }} />
                  </div>
                  <div>
                    <small className="fw-semibold" style={{ fontSize: "0.75rem", color: COLORS.gray }}>Hearse Utilization</small>
                    <div style={{ fontSize: "0.65rem", color: COLORS.gray }}>Click for details</div>
                  </div>
                </div>
                <div style={{ height: "140px" }}>
                  <SafeChart ChartComponent={Doughnut} data={createRadialChartData(['Available', 'Booked', 'Maintenance'], [
                    bookings.fleet?.available || 4,
                    bookings.fleet?.booked || 2,
                    bookings.fleet?.maintenance || 1
                  ], [COLORS.success, COLORS.warning, COLORS.danger])} options={radialChartOptions} chartName="HearseUtil" />
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <div className="text-center">
                    <div className="fw-bold" style={{ fontSize: "0.85rem", color: COLORS.success }}>{bookings.fleet?.available || 0}</div>
                    <small style={{ fontSize: "0.65rem", color: COLORS.gray }}>Available</small>
                  </div>
                  <div className="text-center">
                    <div className="fw-bold" style={{ fontSize: "0.85rem", color: COLORS.warning }}>{bookings.fleet?.booked || 0}</div>
                    <small style={{ fontSize: "0.65rem", color: COLORS.gray }}>Booked</small>
                  </div>
                  <div className="text-center">
                    <div className="fw-bold" style={{ fontSize: "0.85rem", color: COLORS.danger }}>{bookings.fleet?.maintenance || 0}</div>
                    <small style={{ fontSize: "0.65rem", color: COLORS.gray }}>Maintenance</small>
                  </div>
                </div>
              </div>
            </Col>

            {/* Case Pipeline */}
            <Col lg={4} md={6}>
              <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", cursor: 'pointer' }} onClick={() => openDrillDown('deceased', deceased)}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: COLORS.primaryLight + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ClipboardList size={16} style={{ color: COLORS.primaryLight }} />
                  </div>
                  <div>
                    <small className="fw-semibold" style={{ fontSize: "0.75rem", color: COLORS.gray }}>Case Pipeline</small>
                    <div style={{ fontSize: "0.65rem", color: COLORS.gray }}>Click for details</div>
                  </div>
                </div>
                <div style={{ height: "140px" }}>
                  <SafeChart ChartComponent={Bar} data={createCartesianChartData(['Active', 'Pending', 'Completed', 'Released'], [
                    { label: 'Cases', data: [deceased.active || 3, deceased.pending || 2, deceased.completed || 2, deceased.released || 1], backgroundColor: [COLORS.primaryLight, COLORS.warning, COLORS.success, COLORS.gray].map(c => c + 'bb'), borderColor: [COLORS.primaryLight, COLORS.warning, COLORS.success, COLORS.gray], borderWidth: 2, borderRadius: 6, borderSkipped: false }
                  ])} options={comparisonChartOptions} chartName="CasePipeline" />
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <div className="text-center">
                    <div className="fw-bold" style={{ fontSize: "0.85rem", color: COLORS.primaryLight }}>{deceased.active || 0}</div>
                    <small style={{ fontSize: "0.65rem", color: COLORS.gray }}>Active</small>
                  </div>
                  <div className="text-center">
                    <div className="fw-bold" style={{ fontSize: "0.85rem", color: COLORS.warning }}>{deceased.pending || 0}</div>
                    <small style={{ fontSize: "0.65rem", color: COLORS.gray }}>Pending</small>
                  </div>
                  <div className="text-center">
                    <div className="fw-bold" style={{ fontSize: "0.85rem", color: COLORS.success }}>{deceased.completed || 0}</div>
                    <small style={{ fontSize: "0.65rem", color: COLORS.gray }}>Completed</small>
                  </div>
                </div>
              </div>
            </Col>

            {/* Staff Workload */}
            <Col lg={4} md={6}>
              <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", cursor: 'pointer' }} onClick={() => openDrillDown('staff', {})}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: COLORS.purple + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users2 size={16} style={{ color: COLORS.purple }} />
                  </div>
                  <div>
                    <small className="fw-semibold" style={{ fontSize: "0.75rem", color: COLORS.gray }}>Staff Workload</small>
                    <div style={{ fontSize: "0.65rem", color: COLORS.gray }}>Click for details</div>
                  </div>
                </div>
                <div style={{ height: "140px" }}>
                  <SafeChart ChartComponent={Bar} data={createCartesianChartData(['Drivers', 'Pathologists', 'Staff', 'Support'], [
                    { label: 'Assigned', data: [5, 4, 8, 6], backgroundColor: COLORS.purple + 'bb', borderColor: COLORS.purple, borderWidth: 2, borderRadius: 6, borderSkipped: false },
                    { label: 'Available', data: [2, 1, 3, 2], backgroundColor: COLORS.success + 'bb', borderColor: COLORS.success, borderWidth: 2, borderRadius: 6, borderSkipped: false }
                  ])} options={comparisonChartOptions} chartName="StaffWorkload" />
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <div className="text-center">
                    <div className="fw-bold" style={{ fontSize: "0.85rem", color: COLORS.purple }}>23</div>
                    <small style={{ fontSize: "0.65rem", color: COLORS.gray }}>Assigned</small>
                  </div>
                  <div className="text-center">
                    <div className="fw-bold" style={{ fontSize: "0.85rem", color: COLORS.success }}>8</div>
                    <small style={{ fontSize: "0.65rem", color: COLORS.gray }}>Available</small>
                  </div>
                  <div className="text-center">
                    <div className="fw-bold" style={{ fontSize: "0.85rem", color: COLORS.info }}>74%</div>
                    <small style={{ fontSize: "0.65rem", color: COLORS.gray }}>Utilization</small>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* CALENDAR SECTION - Interactive Calendar with Events */}
      <Card className="border-0 mb-4" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <SectionHeader title="Schedule Calendar" icon={Calendar} color={COLORS.info} />
            <Button size="sm" variant="light" className="d-flex align-items-center gap-2" style={{ borderRadius: "8px", fontSize: "0.78rem" }} onClick={openCalendar}>
              <Calendar size={14} /> View Full Calendar
            </Button>
          </div>

          {/* Mini Calendar Grid */}
          <Row className="g-3">
            <Col md={8}>
              <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0" style={{ fontSize: "0.85rem" }}>June 2025</h6>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="light" style={{ borderRadius: "6px", padding: "4px 8px" }}>
                      <ChevronLeft size={14} />
                    </Button>
                    <Button size="sm" variant="light" style={{ borderRadius: "6px", padding: "4px 8px" }}>
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center" style={{ fontSize: "0.68rem", fontWeight: "600", color: COLORS.gray, padding: "4px" }}>{day}</div>
                  ))}
                  {Array.from({ length: 30 }, (_, i) => {
                    const day = i + 1;
                    const hasEvent = [10, 12, 14, 15, 16, 17, 18, 19, 20, 22, 24].includes(day);
                    const isToday = day === 18;
                    return (
                      <div key={day} className="text-center" style={{ padding: "6px", fontSize: "0.75rem", cursor: 'pointer', borderRadius: "6px", background: isToday ? COLORS.primaryLight : hasEvent ? COLORS.warningLight : 'transparent', color: isToday ? '#fff' : hasEvent ? COLORS.dark : COLORS.gray, fontWeight: hasEvent || isToday ? "600" : "400" }} onClick={() => hasEvent && openDrillDown('calendar', { date: `2025-06-${day}` })}>
                        {day}
                        {hasEvent && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: isToday ? '#fff' : COLORS.warning, margin: "2px auto 0" }} />}
                      </div>
                    );
                  })}
                </div>
                <div className="d-flex gap-3 mt-3" style={{ fontSize: "0.68rem" }}>
                  <div className="d-flex align-items-center gap-1">
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS.primaryLight }} />
                    <span style={{ color: COLORS.gray }}>Today</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS.warning }} />
                    <span style={{ color: COLORS.gray }}>Has Events</span>
                  </div>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 rounded-3 h-100" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <h6 className="fw-semibold mb-3" style={{ fontSize: "0.85rem" }}>Today's Schedule</h6>
                <div className="d-flex flex-column gap-2">
                  {[
                    { time: '09:00', event: 'Funeral - James Ochieng', type: 'funeral', color: COLORS.primaryLight },
                    { time: '11:00', event: 'Viewing - Mary Wanjiku', type: 'viewing', color: COLORS.info },
                    { time: '14:00', event: 'Hearse Dispatch', type: 'dispatch', color: COLORS.warning },
                    { time: '16:00', event: 'Family Meeting', type: 'meeting', color: COLORS.purple }
                  ].map((item, i) => (
                    <div key={i} className="p-2 rounded-2" style={{ background: '#fff', border: "1px solid #e2e8f0", cursor: 'pointer' }} onClick={() => openDrillDown('event', item)}>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: item.color }} />
                        <small style={{ fontSize: "0.68rem", color: COLORS.gray, fontWeight: "600" }}>{item.time}</small>
                      </div>
                      <small style={{ fontSize: "0.75rem", fontWeight: "500", color: COLORS.dark }}>{item.event}</small>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* BRANCH PERFORMANCE SECTION - Clickable Charts */}
      <Card className="border-0 mb-4" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <SectionHeader title="Branch Performance" icon={Building2} color={COLORS.purple} />
            <Button size="sm" variant="light" className="d-flex align-items-center gap-2" style={{ borderRadius: "8px", fontSize: "0.78rem" }}>
              <Download size={14} /> Export Report
            </Button>
          </div>

          <Row className="g-3">
            <Col lg={6} md={12}>
              <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", cursor: 'pointer' }} onClick={() => openDrillDown('branches', { revenue: [450000, 320000, 280000, 350000], names: ['Nairobi Main', 'Mombasa Branch', 'Kisumu Branch', 'Nakuru Branch'] })}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <small className="fw-semibold" style={{ fontSize: "0.75rem", color: COLORS.gray }}>Revenue by Branch</small>
                  <Badge bg="light" text="dark" pill style={{ fontSize: "0.65rem" }}>Click to drill down</Badge>
                </div>
                <div style={{ height: "200px" }}>
                  <SafeChart ChartComponent={Bar} data={createCartesianChartData(['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'], [
                    { label: 'Revenue (KES)', data: [450000, 320000, 280000, 350000], backgroundColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4].map(c => c + 'bb'), borderColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4], borderWidth: 2, borderRadius: 8, borderSkipped: false }
                  ])} options={cartesianChartOptions} chartName="BranchRevenue" />
                </div>
              </div>
            </Col>
            <Col lg={6} md={12}>
              <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", cursor: 'pointer' }} onClick={() => openDrillDown('branches', { cases: [45, 32, 28, 35], names: ['Nairobi Main', 'Mombasa Branch', 'Kisumu Branch', 'Nakuru Branch'] })}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <small className="fw-semibold" style={{ fontSize: "0.75rem", color: COLORS.gray }}>Case Volume by Branch</small>
                  <Badge bg="light" text="dark" pill style={{ fontSize: "0.65rem" }}>Click to drill down</Badge>
                </div>
                <div style={{ height: "200px" }}>
                  <SafeChart ChartComponent={Bar} data={createCartesianChartData(['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'], [
                    { label: 'Cases', data: [45, 32, 28, 35], backgroundColor: [COLORS.chart5, COLORS.chart6, COLORS.chart7, COLORS.chart8].map(c => c + 'bb'), borderColor: [COLORS.chart5, COLORS.chart6, COLORS.chart7, COLORS.chart8], borderWidth: 2, borderRadius: 8, borderSkipped: false }
                  ])} options={cartesianChartOptions} chartName="BranchCases" />
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* DECEASED RECORDS SECTION - Interactive Cards with Trend Charts */}
      <Card className="border-0 mb-4" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <SectionHeader title="Deceased Records" icon={User} color={COLORS.primary} />
            <div className="d-flex gap-2">
              <Button size="sm" variant="light" className="d-flex align-items-center gap-2" style={{ borderRadius: "8px", fontSize: "0.78rem" }}>
                <Filter size={14} /> Filter
              </Button>
              <Button size="sm" variant="light" className="d-flex align-items-center gap-2" style={{ borderRadius: "8px", fontSize: "0.78rem" }}>
                <Download size={14} /> Export
              </Button>
            </div>
          </div>

          {/* Trend Charts Row */}
          <Row className="g-3 mb-4">
            <Col md={4}>
              <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", height: "180px" }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <small className="fw-semibold" style={{ fontSize: "0.75rem", color: COLORS.gray }}>This Week vs Last Week</small>
                  <Badge bg="light" text="dark" pill style={{ fontSize: "0.65rem" }}>+12%</Badge>
                </div>
                <div style={{ height: "120px" }}>
                  <SafeChart ChartComponent={Bar} data={createCartesianChartData(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [
                    { label: 'This Week', data: [5, 8, 6, 9, 7, 4, 6], backgroundColor: COLORS.primaryLight + 'bb', borderColor: COLORS.primaryLight, borderWidth: 2, borderRadius: 6, borderSkipped: false },
                    { label: 'Last Week', data: [4, 6, 5, 7, 6, 3, 5], backgroundColor: COLORS.gray + '40', borderColor: COLORS.gray, borderWidth: 2, borderRadius: 6, borderSkipped: false }
                  ])} options={comparisonChartOptions} chartName="DeceasedWeeklyTrend" />
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", height: "180px" }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <small className="fw-semibold" style={{ fontSize: "0.75rem", color: COLORS.gray }}>Status Distribution</small>
                </div>
                <div style={{ height: "120px" }}>
                  <SafeChart ChartComponent={Doughnut} data={createRadialChartData(['Active', 'Completed', 'In-Transit', 'Released'], [3, 2, 1, 1], [COLORS.primaryLight, COLORS.success, COLORS.warning, COLORS.gray])} options={radialChartOptions} chartName="DeceasedStatus" />
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", height: "180px" }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <small className="fw-semibold" style={{ fontSize: "0.75rem", color: COLORS.gray }}>Branch Distribution</small>
                </div>
                <div style={{ height: "120px" }}>
                  <SafeChart ChartComponent={Bar} data={createCartesianChartData(['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'], [
                    { label: 'Cases', data: [3, 1, 1, 1], backgroundColor: [COLORS.primaryLight, COLORS.chart2, COLORS.chart3, COLORS.chart4].map(c => c + 'bb'), borderColor: [COLORS.primaryLight, COLORS.chart2, COLORS.chart3, COLORS.chart4], borderWidth: 2, borderRadius: 6, borderSkipped: false }
                  ])} options={comparisonChartOptions} chartName="DeceasedByBranch" />
                </div>
              </div>
            </Col>
          </Row>

          {/* Interactive Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" }}>
            {dummyDeceasedCases.map((c, i) => {
              const statusColors = { active: COLORS.primaryLight, completed: COLORS.success, 'in-transit': COLORS.warning, released: COLORS.gray };
              return (
                <Card key={i} className="border-0" style={{ borderRadius: "12px", borderLeft: `4px solid ${statusColors[c.status] || COLORS.gray}`, cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => openDetailPanel(c)} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="fw-bold" style={{ fontSize: "0.9rem", color: COLORS.dark }}>{c.name}</div>
                        <small style={{ fontSize: "0.72rem", color: COLORS.gray }}>{c.admissionNo} · {c.branch}</small>
                      </div>
                      <Badge bg={c.status === 'active' ? 'primary' : c.status === 'completed' ? 'success' : c.status === 'in-transit' ? 'warning' : 'secondary'} pill style={{ fontSize: "0.65rem" }}>
                        {c.status}
                      </Badge>
                    </div>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      <span className="badge bg-light text-dark" style={{ fontSize: "0.68rem" }}>{c.age} years</span>
                      {c.cause !== 'N/A' && <span className="badge bg-light text-dark" style={{ fontSize: "0.68rem" }}>{c.cause}</span>}
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-2" style={{ borderTop: "1px solid #f1f5f9" }}>
                      <small style={{ fontSize: "0.72rem", color: COLORS.gray }}>{c.nextOfKin}</small>
                      <Eye size={14} style={{ color: COLORS.primaryLight }} />
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      {/* FLOWER BOOKINGS SECTION - Interactive Cards with Analytics */}
      <Card className="border-0 mb-4" style={{ borderRadius: "14px", boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <SectionHeader title="Flower Bookings" icon={Flower2} color="#ec4899" />
            <div className="d-flex gap-2">
              <Button size="sm" variant="light" className="d-flex align-items-center gap-2" style={{ borderRadius: "8px", fontSize: "0.78rem" }}>
                <Calendar size={14} /> Schedule
              </Button>
              <Button size="sm" variant="light" className="d-flex align-items-center gap-2" style={{ borderRadius: "8px", fontSize: "0.78rem" }}>
                <Plus size={14} /> New Booking
              </Button>
            </div>
          </div>

          {/* Flower Booking Stats */}
          <Row className="g-3 mb-4">
            <Col md={3}>
              <div className="p-3 rounded-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <Flower2 size={16} style={{ color: COLORS.danger }} />
                  <small style={{ fontSize: "0.72rem", color: COLORS.gray }}>Total Bookings</small>
                </div>
                <div className="fw-bold" style={{ fontSize: "1.5rem", color: COLORS.dark }}>{dummyFlowerBookings.length}</div>
                <small style={{ fontSize: "0.68rem", color: COLORS.success }}>↑ 15% from last week</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3 rounded-3" style={{ background: "#d1fae5", border: "1px solid #a7f3d0" }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <DollarSign size={16} style={{ color: COLORS.success }} />
                  <small style={{ fontSize: "0.72rem", color: COLORS.gray }}>Revenue</small>
                </div>
                <div className="fw-bold" style={{ fontSize: "1.5rem", color: COLORS.dark }}>KES {(dummyFlowerBookings.reduce((s, b) => s + b.amount, 0) / 1000).toFixed(1)}K</div>
                <small style={{ fontSize: "0.68rem", color: COLORS.success }}>↑ 23% from last week</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3 rounded-3" style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <Clock size={16} style={{ color: COLORS.warning }} />
                  <small style={{ fontSize: "0.72rem", color: COLORS.gray }}>Pending</small>
                </div>
                <div className="fw-bold" style={{ fontSize: "1.5rem", color: COLORS.dark }}>{dummyFlowerBookings.filter(fb => fb.status === 'pending').length}</div>
                <small style={{ fontSize: "0.68rem", color: COLORS.warning }}>Requires attention</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3 rounded-3" style={{ background: "#dbeafe", border: "1px solid #bfdbfe" }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <CheckCircle size={16} style={{ color: COLORS.primaryLight }} />
                  <small style={{ fontSize: "0.72rem", color: COLORS.gray }}>Completed</small>
                </div>
                <div className="fw-bold" style={{ fontSize: "1.5rem", color: COLORS.dark }}>{dummyFlowerBookings.filter(fb => fb.status === 'completed').length}</div>
                <small style={{ fontSize: "0.68rem", color: COLORS.success }}>This week</small>
              </div>
            </Col>
          </Row>

          {/* Trend Chart */}
          <Row className="g-3 mb-4">
            <Col md={12}>
              <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", height: "200px" }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <small className="fw-semibold" style={{ fontSize: "0.75rem", color: COLORS.gray }}>Booking Trends - This Week vs Last Week</small>
                  <div className="d-flex gap-2">
                    <Badge bg="light" text="dark" pill style={{ fontSize: "0.65rem" }}>This Week</Badge>
                    <Badge bg="light" text="dark" pill style={{ fontSize: "0.65rem", opacity: 0.6 }}>Last Week</Badge>
                  </div>
                </div>
                <div style={{ height: "140px" }}>
                  <SafeChart ChartComponent={Line} data={createCartesianChartData(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [
                    { label: 'This Week', data: [2, 3, 2, 4, 3, 1, 2], borderColor: COLORS.danger, backgroundColor: 'rgba(239, 68, 68, 0.07)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: COLORS.danger },
                    { label: 'Last Week', data: [1, 2, 2, 3, 2, 1, 2], borderColor: COLORS.gray, backgroundColor: 'rgba(107, 114, 128, 0.05)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: COLORS.gray, borderDash: [5, 5] }
                  ])} options={cartesianChartOptions} chartName="FlowerTrends" />
                </div>
              </div>
            </Col>
          </Row>

          {/* Interactive Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {dummyFlowerBookings.map((fb, i) => {
              const statusColors = { confirmed: COLORS.success, pending: COLORS.warning, completed: COLORS.primaryLight, cancelled: COLORS.danger };
              return (
                <Card key={i} className="border-0" style={{ borderRadius: "12px", borderTop: `3px solid ${statusColors[fb.status] || COLORS.gray}`, cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => openDetailPanel(fb)} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="fw-bold" style={{ fontSize: "0.85rem", color: COLORS.dark }}>{fb.clientName}</div>
                        <small style={{ fontFamily: "monospace", fontSize: "0.72rem", color: COLORS.danger }}>{fb.bookingCode}</small>
                      </div>
                      <Badge bg={fb.status === 'confirmed' ? 'success' : fb.status === 'pending' ? 'warning' : fb.status === 'completed' ? 'primary' : 'secondary'} pill style={{ fontSize: "0.65rem" }}>
                        {fb.status}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <div className="d-flex align-items-center gap-1 mb-1">
                        <Flower2 size={12} style={{ color: COLORS.gray }} />
                        <small style={{ fontSize: "0.72rem" }}>{fb.flowerType} ({fb.color})</small>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <Calendar size={12} style={{ color: COLORS.gray }} />
                        <small style={{ fontSize: "0.72rem" }}>{fb.eventDate}</small>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-2" style={{ borderTop: "1px solid #f1f5f9" }}>
                      <div>
                        <small style={{ fontSize: "0.68rem", color: COLORS.gray }}>Qty: {fb.quantity}</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold" style={{ fontSize: "0.85rem", color: COLORS.success }}>KES {fb.amount.toLocaleString()}</div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </Card.Body>
      </Card>

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

      {/* DRILL-DOWN MODAL */}
      {showDrillDown && drillDownData && (
        <div className="position-fixed" style={{ top: 0, right: 0, bottom: 0, width: '600px', background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', zIndex: 1050, overflowY: 'auto', animation: 'slideInRight 0.3s ease' }}>
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>
                  {drillDownData.type === 'fleet' && 'Hearse Fleet Details'}
                  {drillDownData.type === 'coffins' && 'Coffin Inventory Details'}
                  {drillDownData.type === 'flowers' && 'Flower Bookings Details'}
                  {drillDownData.type === 'chemicals' && 'Chemicals & Consumables'}
                  {drillDownData.type === 'deceased' && 'Deceased Records Details'}
                  {drillDownData.type === 'calendar' && 'Calendar Events'}
                  {drillDownData.type === 'event' && 'Event Details'}
                  {drillDownData.type === 'branches' && 'Branch Performance Details'}
                  {drillDownData.type === 'staff' && 'Staff Workload Details'}
                </h5>
                <small style={{ fontSize: "0.78rem", color: COLORS.gray }}>Click outside to close</small>
              </div>
              <Button variant="light" size="sm" onClick={closeDrillDown} style={{ borderRadius: "8px" }}>
                <X size={18} />
              </Button>
            </div>

            <div className="d-flex flex-column gap-3">
              {drillDownData.type === 'fleet' && (
                <>
                  <div className="p-3 rounded-3" style={{ background: "#d1fae5", border: "1px solid #a7f3d0" }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small style={{ fontSize: "0.72rem", color: COLORS.gray }}>Available</small>
                        <div className="fw-bold" style={{ fontSize: "1.5rem", color: COLORS.success }}>{drillDownData.data?.available || 0}</div>
                      </div>
                      <div className="text-end">
                        <small style={{ fontSize: "0.72rem", color: COLORS.gray }}>Total Fleet</small>
                        <div className="fw-bold" style={{ fontSize: "1.5rem", color: COLORS.dark }}>{drillDownData.data?.total || 0}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <h6 className="fw-semibold mb-2" style={{ fontSize: "0.85rem" }}>Fleet Status</h6>
                    {['available', 'booked', 'maintenance'].map(status => (
                      <div key={status} className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ fontSize: "0.82rem", textTransform: 'capitalize' }}>{status}</span>
                        <Badge bg={status === 'available' ? 'success' : status === 'booked' ? 'warning' : 'danger'} pill>{drillDownData.data?.[status] || 0}</Badge>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {drillDownData.type === 'deceased' && (
                <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <h6 className="fw-semibold mb-3" style={{ fontSize: "0.85rem" }}>Case Summary</h6>
                  {['active', 'completed', 'pending', 'released'].map(status => (
                    <div key={status} className="d-flex justify-content-between align-items-center mb-2">
                      <span style={{ fontSize: "0.82rem", textTransform: 'capitalize' }}>{status}</span>
                      <Badge bg={status === 'active' ? 'primary' : status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'secondary'} pill>{deceased[status] || 0}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {drillDownData.type === 'calendar' && (
                <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <h6 className="fw-semibold mb-2" style={{ fontSize: "0.85rem" }}>Events on {drillDownData.data?.date}</h6>
                  {dummyDeceasedCases.slice(0, 3).map((c, i) => (
                    <div key={i} className="p-2 rounded-2 mb-2" style={{ background: '#fff', border: "1px solid #e2e8f0" }}>
                      <div className="fw-medium" style={{ fontSize: "0.82rem" }}>{c.name}</div>
                      <small style={{ fontSize: "0.72rem", color: COLORS.gray }}>{c.cause} · {c.branch}</small>
                    </div>
                  ))}
                </div>
              )}

              {drillDownData.type === 'branches' && (
                <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <h6 className="fw-semibold mb-3" style={{ fontSize: "0.85rem" }}>Branch Performance</h6>
                  {['Nairobi Main', 'Mombasa Branch', 'Kisumu Branch', 'Nakuru Branch'].map((branch, i) => (
                    <div key={i} className="p-2 rounded-2 mb-2" style={{ background: '#fff', border: "1px solid #e2e8f0" }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-medium" style={{ fontSize: "0.82rem" }}>{branch}</span>
                        <Badge bg="primary" pill>{[45, 32, 28, 35][i]} cases</Badge>
                      </div>
                      <small style={{ fontSize: "0.72rem", color: COLORS.gray }}>Revenue: KES {[450000, 320000, 280000, 350000][i].toLocaleString()}</small>
                    </div>
                  ))}
                </div>
              )}

              {(drillDownData.type === 'coffins' || drillDownData.type === 'flowers' || drillDownData.type === 'chemicals') && (
                <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <h6 className="fw-semibold mb-2" style={{ fontSize: "0.85rem" }}>Summary</h6>
                  <p style={{ fontSize: "0.82rem", color: COLORS.gray }}>Detailed analytics and breakdown available in the full report view.</p>
                  <Button size="sm" variant="primary" className="w-100" style={{ borderRadius: "8px" }}>
                    <Eye size={14} className="me-1" /> View Full Report
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay when drill-down is open */}
      {showDrillDown && <div onClick={closeDrillDown} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1040 }} />}

      {/* CALENDAR MODAL */}
      {showCalendar && (
        <div className="position-fixed" style={{ top: 0, right: 0, bottom: 0, width: '700px', background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', zIndex: 1050, overflowY: 'auto', animation: 'slideInRight 0.3s ease' }}>
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>Full Calendar</h5>
                <small style={{ fontSize: "0.78rem", color: COLORS.gray }}>June 2025</small>
              </div>
              <Button variant="light" size="sm" onClick={closeCalendar} style={{ borderRadius: "8px" }}>
                <X size={18} />
              </Button>
            </div>

            <div className="d-flex flex-column gap-2">
              {[
                { date: '2025-06-15', time: '09:00', event: 'Funeral Service - James Ochieng', location: 'Nairobi Main', type: 'funeral' },
                { date: '2025-06-15', time: '11:00', event: 'Viewing - Mary Wanjiku', location: 'Nairobi Main', type: 'viewing' },
                { date: '2025-06-16', time: '10:00', event: 'Hearse Dispatch - Susan Auma', location: 'Mombasa Branch', type: 'dispatch' },
                { date: '2025-06-16', time: '14:00', event: 'Family Meeting - Peter Mwangi', location: 'Nairobi Main', type: 'meeting' },
                { date: '2025-06-17', time: '09:00', event: 'Cemetery Burial - Grace Akinyi', location: 'Kisumu Branch', type: 'burial' },
                { date: '2025-06-17', time: '11:30', event: 'Hearse Booking - Daniel Kiptoo', location: 'Nakuru Branch', type: 'booking' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", cursor: 'pointer' }} onClick={() => openDrillDown('event', item)}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="fw-semibold" style={{ fontSize: "0.85rem", color: COLORS.dark }}>{item.event}</div>
                      <small style={{ fontSize: "0.72rem", color: COLORS.gray }}>{item.location}</small>
                    </div>
                    <Badge bg={item.type === 'funeral' ? 'primary' : item.type === 'viewing' ? 'info' : item.type === 'dispatch' ? 'warning' : 'secondary'} pill style={{ fontSize: "0.65rem", textTransform: 'capitalize' }}>{item.type}</Badge>
                  </div>
                  <div className="d-flex gap-3">
                    <small style={{ fontSize: "0.72rem", color: COLORS.gray }}>{item.date}</small>
                    <small style={{ fontSize: "0.72rem", color: COLORS.gray }}>{item.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overlay when calendar is open */}
      {showCalendar && <div onClick={closeCalendar} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1040 }} />}

      {/* DETAIL PANEL - Slide Over */}
      {showDetailPanel && selectedRecord && (
        <div className="position-fixed" style={{ top: 0, right: 0, bottom: 0, width: '480px', background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', zIndex: 1050, overflowY: 'auto', animation: 'slideInRight 0.3s ease' }}>
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>
                {selectedRecord.name ? 'Deceased Details' : 'Booking Details'}
              </h5>
              <Button variant="light" size="sm" onClick={closeDetailPanel} style={{ borderRadius: "8px" }}>
                <X size={18} />
              </Button>
            </div>

            {selectedRecord.name ? (
              /* Deceased Detail View */
              <div>
                <div className="p-3 rounded-3 mb-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: COLORS.primaryLight + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={24} style={{ color: COLORS.primaryLight }} />
                    </div>
                    <div>
                      <div className="fw-bold" style={{ fontSize: "1rem" }}>{selectedRecord.name}</div>
                      <small style={{ fontSize: "0.78rem", color: COLORS.gray }}>{selectedRecord.admissionNo}</small>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Badge bg={selectedRecord.status === 'active' ? 'primary' : selectedRecord.status === 'completed' ? 'success' : selectedRecord.status === 'in-transit' ? 'warning' : 'secondary'} pill>{selectedRecord.status}</Badge>
                    <Badge bg="light" text="dark" pill>{selectedRecord.age} years</Badge>
                    <Badge bg="light" text="dark" pill>{selectedRecord.branch}</Badge>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="fw-semibold mb-2" style={{ fontSize: "0.85rem" }}>Case Information</h6>
                  <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div className="d-flex justify-content-between mb-2">
                      <small style={{ color: COLORS.gray }}>Date</small>
                      <small className="fw-medium">{selectedRecord.date}</small>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <small style={{ color: COLORS.gray }}>Cause of Death</small>
                      <small className="fw-medium" style={{ color: selectedRecord.cause !== 'N/A' ? COLORS.danger : COLORS.gray }}>{selectedRecord.cause}</small>
                    </div>
                    <div className="d-flex justify-content-between">
                      <small style={{ color: COLORS.gray }}>Case Type</small>
                      <small className="fw-medium">Standard Admission</small>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="fw-semibold mb-2" style={{ fontSize: "0.85rem" }}>Next of Kin</h6>
                  <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div className="d-flex justify-content-between mb-2">
                      <small style={{ color: COLORS.gray }}>Name</small>
                      <small className="fw-medium">{selectedRecord.nextOfKin}</small>
                    </div>
                    <div className="d-flex justify-content-between">
                      <small style={{ color: COLORS.gray }}>Phone</small>
                      <small className="fw-medium" style={{ fontFamily: "monospace" }}>{selectedRecord.phone}</small>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <Button size="sm" variant="primary" className="flex-fill" style={{ borderRadius: "8px" }}>
                    <FileText size={14} className="me-1" /> View Documents
                  </Button>
                  <Button size="sm" variant="outline-secondary" className="flex-fill" style={{ borderRadius: "8px" }}>
                    <Edit size={14} className="me-1" /> Edit
                  </Button>
                </div>
              </div>
            ) : (
              /* Flower Booking Detail View */
              <div>
                <div className="p-3 rounded-3 mb-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: COLORS.danger + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Flower2 size={24} style={{ color: COLORS.danger }} />
                    </div>
                    <div>
                      <div className="fw-bold" style={{ fontSize: "1rem" }}>{selectedRecord.clientName}</div>
                      <small style={{ fontFamily: "monospace", fontSize: "0.78rem", color: COLORS.danger }}>{selectedRecord.bookingCode}</small>
                    </div>
                  </div>
                  <Badge bg={selectedRecord.status === 'confirmed' ? 'success' : selectedRecord.status === 'pending' ? 'warning' : 'primary'} pill>{selectedRecord.status}</Badge>
                </div>

                <div className="mb-3">
                  <h6 className="fw-semibold mb-2" style={{ fontSize: "0.85rem" }}>Booking Details</h6>
                  <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div className="d-flex justify-content-between mb-2">
                      <small style={{ color: COLORS.gray }}>Flower Type</small>
                      <small className="fw-medium">{selectedRecord.flowerType}</small>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <small style={{ color: COLORS.gray }}>Color</small>
                      <small className="fw-medium">{selectedRecord.color}</small>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <small style={{ color: COLORS.gray }}>Quantity</small>
                      <small className="fw-medium">{selectedRecord.quantity}</small>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <small style={{ color: COLORS.gray }}>Event Date</small>
                      <small className="fw-medium">{selectedRecord.eventDate}</small>
                    </div>
                    <div className="d-flex justify-content-between">
                      <small style={{ color: COLORS.gray }}>Amount</small>
                      <small className="fw-bold" style={{ color: COLORS.success, fontSize: "1rem" }}>KES {selectedRecord.amount.toLocaleString()}</small>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="fw-semibold mb-2" style={{ fontSize: "0.85rem" }}>Contact Information</h6>
                  <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div className="d-flex justify-content-between">
                      <small style={{ color: COLORS.gray }}>Phone</small>
                      <small className="fw-medium" style={{ fontFamily: "monospace" }}>{selectedRecord.phone}</small>
                    </div>
                  </div>
                </div>

                {selectedRecord.notes && (
                  <div className="mb-3">
                    <h6 className="fw-semibold mb-2" style={{ fontSize: "0.85rem" }}>Notes</h6>
                    <div className="p-3 rounded-3" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                      <small style={{ fontSize: "0.82rem" }}>{selectedRecord.notes}</small>
                    </div>
                  </div>
                )}

                <div className="d-flex gap-2 mt-4">
                  <Button size="sm" variant="primary" className="flex-fill" style={{ borderRadius: "8px" }}>
                    <MessageSquare size={14} className="me-1" /> Send Update
                  </Button>
                  <Button size="sm" variant="outline-secondary" className="flex-fill" style={{ borderRadius: "8px" }}>
                    <Printer size={14} className="me-1" /> Print
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay when detail panel is open */}
      {showDetailPanel && <div onClick={closeDetailPanel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1040 }} />}

      {/* Footer spacer */}
      <div style={{ height: "2rem" }} />
    </Container>
  );
};

export default ComprehensiveDashboard;