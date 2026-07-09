// src/components/analysis/comprehensivedashboard.jsx
// Professional Mortuary Dashboard - Clean Modern Design
import React, { useState, useEffect, useCallback } from "react";
import {
  Container, Row, Col, Card, Spinner, Modal, Button,
  Badge, Form, Alert, Dropdown, Table, ProgressBar
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
import GaugeChartModule from 'react-gauge-chart';
const GaugeChart = GaugeChartModule.default;
import {
  Users, TrendingUp, DollarSign, Clock, Box, Car, FileText,
  Shield, BarChart3, Calendar, Building, ArrowUpRight, AlertTriangle,
  CheckCircle, ClipboardList, Percent, ArrowUp, ArrowDown,
  Activity, LineChart, FlaskConical, Truck, Stethoscope,
  PieChart, Settings
} from 'lucide-react';
import 'chartjs-adapter-date-fns';

// Register ChartJS components
ChartJS.register(
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
);

// ============================================================
// PROFESSIONAL COLOR SCHEME
// ============================================================
const COLORS = {
  primary: '#1e3a8a',
  primaryLight: '#3b82f6',
  secondary: '#64748b',
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  info: '#06b6d4',
  infoLight: '#cffafe',
  purple: '#8b5cf6',
  purpleLight: '#ede9fe',
  dark: '#1f2937',
  gray: '#6b7280',
  light: '#f3f4f6',
  white: '#ffffff',
  border: '#e5e7eb',
  chart1: '#3b82f6',
  chart2: '#10b981',
  chart3: '#f59e0b',
  chart4: '#ef4444',
  chart5: '#8b5cf6',
  chart6: '#06b6d4'
};

// ============================================================
// ERROR BOUNDARY
// ============================================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Container fluid className="py-4">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body className="py-5">
              <AlertTriangle size={48} className="text-danger mb-3" />
              <h4 className="text-danger mb-3">Component Error</h4>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Reload Dashboard
              </Button>
            </Card.Body>
          </Card>
        </Container>
      );
    }
    return this.props.children;
  }
}

// ============================================================
// SAFE DATA ACCESS HELPERS
// ============================================================
const getSafeData = (data, path, defaultValue = {}) => {
  try {
    const paths = path.split('.');
    let result = data;
    for (const p of paths) {
      result = result?.[p];
      if (result === undefined || result === null) return defaultValue;
    }
    return result || defaultValue;
  } catch (error) {
    console.warn(`Error accessing data path ${path}:`, error);
    return defaultValue;
  }
};

const getSafeArray = (data, path, defaultValue = []) => {
  const result = getSafeData(data, path, defaultValue);
  return Array.isArray(result) ? result : defaultValue;
};

const getSafeObject = (data, path, defaultValue = {}) => {
  const result = getSafeData(data, path, defaultValue);
  return typeof result === 'object' && !Array.isArray(result) ? result : defaultValue;
};

const getSafeNumber = (data, path, defaultValue = 0) => {
  const result = getSafeData(data, path, defaultValue);
  return typeof result === 'number' ? result : (parseFloat(result) || defaultValue);
};

// ============================================================
// PROFESSIONAL STAT CARD COMPONENT
// ============================================================
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
    <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '12px', transition: 'transform 0.2s' }}>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <p className="text-muted mb-2" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {title}
            </p>
            <h3 className="mb-1 fw-bold" style={{ color: theme.text, fontSize: '1.75rem' }}>
              {value ?? 'N/A'}
            </h3>
            {subtitle && (
              <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                {subtitle}
              </p>
            )}
            {trend !== undefined && (
              <div className="mt-2">
                <Badge bg={trendUp ? 'success' : 'danger'} style={{ fontSize: '0.7rem', padding: '4px 8px' }}>
                  {trendUp ? <ArrowUp size={12} className="me-1" /> : <ArrowDown size={12} className="me-1" />}
                  {Math.abs(trend)}%
                </Badge>
              </div>
            )}
          </div>
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: theme.bg,
              color: theme.icon
            }}
          >
            <Icon size={24} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

// ============================================================
// PROFESSIONAL SECTION HEADER
// ============================================================
const SectionHeader = ({ title, icon: Icon, color }) => (
  <div className="d-flex align-items-center gap-3 mb-4">
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: color + '20',
        color: color
      }}
    >
      <Icon size={20} />
    </div>
    <h5 className="mb-0 fw-bold" style={{ color: COLORS.dark, fontSize: '1.1rem' }}>
      {title}
    </h5>
  </div>
);

// ============================================================
// PROFESSIONAL CHART CARD
// ============================================================
const ChartCard = ({ title, icon: Icon, color, children, footer, height = '300px' }) => (
  <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
    <Card.Body className="p-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <Icon size={20} style={{ color }} />
        <h6 className="mb-0 fw-semibold" style={{ color: COLORS.dark, fontSize: '0.95rem' }}>
          {title}
        </h6>
      </div>
      <div style={{ height, position: 'relative' }}>
        {children}
      </div>
      {footer && (
        <div className="mt-3 pt-3 border-top">
          {footer}
        </div>
      )}
    </Card.Body>
  </Card>
);

// ============================================================
// MAIN DASHBOARD COMPONENT
// ============================================================
const BeautifulMortuaryDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Main data states
  const [dashboardData, setDashboardData] = useState({
    summary: {},
    caseStatus: {},
    revenue: { total: {}, extraServices: {} },
    serviceTypes: {},
    paymentFrequency: {},
    monthlyTrends: {},
    visitorTrends: {},
    coffinSales: [],
    averageStayDuration: {},
    hearseDistance: {},
    revenueMeta: { currency: 'KES' },
    dispatchAnalytics: {},
    coffinInventory: {},
    operationalMetrics: {},
    financialMetrics: {},
    performanceIndicators: {}
  });

  const [vehicleData, setVehicleData] = useState({
    fleetSummary: {},
    vehicles: [],
    topPerformers: {}
  });

  // Tenant / Branches data
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [tenantInfo, setTenantInfo] = useState(null);

  // UI controls
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [timeFrame, setTimeFrame] = useState('monthly');

  // Fetch tenant info and branches
  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const tenantSlug = localStorage.getItem('tenantSlug') || localStorage.getItem('tenant_slug') || 'default';
        const tenantResponse = await fetch(`http://localhost:5000/api/v1/restpoint/tenants/${tenantSlug}`);

        if (tenantResponse.ok) {
          const result = await tenantResponse.json();
          if (result.success) {
            setTenantInfo(result.data);
            const tenantBranches = result.data?.branches || result.data?.departments || [];
            setBranches(tenantBranches.length > 0 ? tenantBranches : [
              { id: 'main', name: 'Main Branch' },
              { id: 'branch1', name: 'Branch 1' },
              { id: 'branch2', name: 'Branch 2' },
              { id: 'branch3', name: 'Branch 3' }
            ]);
          }
        } else {
          setBranches([
            { id: 'all', name: 'All Branches' },
            { id: 'main', name: 'Main Branch' },
            { id: 'kilimani', name: 'Kilimani' },
            { id: 'westlands', name: 'Westlands' },
            { id: 'embakasi', name: 'Embakasi' }
          ]);
        }
      } catch (err) {
        console.warn('Could not fetch tenant info:', err);
        setBranches([
          { id: 'all', name: 'All Branches' },
          { id: 'main', name: 'Main Branch' },
          { id: 'branch1', name: 'Branch 1' },
          { id: 'branch2', name: 'Branch 2' }
        ]);
      }
    };
    fetchTenantInfo();
  }, []);

  // Mock data for charts
  const [mockData] = useState({
    casesTrends: {
      monthly: [45, 52, 48, 65, 58, 72, 68, 75, 70, 65, 78, 85],
      quarterly: [145, 185, 195, 210],
      yearly: [785]
    },
    revenueByCategory: {
      transport: { monthly: [120000, 135000, 142000, 158000, 145000, 162000, 178000, 195000, 182000, 175000, 190000, 205000], quarterly: [397000, 465000, 555000, 565000], yearly: [1982000] },
      storage: { monthly: [85000, 92000, 88000, 95000, 102000, 110000, 108000, 115000, 112000, 105000, 118000, 125000], quarterly: [265000, 307000, 335000, 348000], yearly: [1255000] },
      supplies: { monthly: [45000, 52000, 48000, 55000, 58000, 62000, 65000, 68000, 72000, 70000, 75000, 78000], quarterly: [145000, 175000, 205000, 223000], yearly: [748000] },
      embalming: { monthly: [35000, 38000, 42000, 45000, 48000, 52000, 55000, 58000, 53000, 50000, 55000, 60000], quarterly: [115000, 145000, 166000, 165000], yearly: [591000] }
    },
    chemicals: {
      formaldehyde: { monthly: [120, 135, 128, 145, 142, 158, 165, 172, 168, 162, 175, 182], unit: 'liters' },
      disinfectants: { monthly: [85, 92, 88, 95, 102, 110, 108, 115, 112, 105, 118, 125], unit: 'liters' },
      preservatives: { monthly: [45, 52, 48, 55, 58, 62, 65, 68, 72, 70, 75, 78], unit: 'kg' },
      embalming: { monthly: [65, 72, 68, 75, 78, 82, 85, 88, 92, 90, 95, 98], unit: 'liters' }
    },
    dispatchSchedule: [
      { id: 1, name: "John Doe", age: 72, cause: "Natural Causes", location: "Nairobi", scheduled: "2024-01-15 09:00", status: "confirmed" },
      { id: 2, name: "Mary Smith", age: 65, cause: "Illness", location: "Mombasa", scheduled: "2024-01-15 11:30", status: "pending" },
      { id: 3, name: "Robert Johnson", age: 58, cause: "Accident", location: "Kisumu", scheduled: "2024-01-15 14:00", status: "confirmed" },
      { id: 4, name: "Sarah Williams", age: 80, cause: "Natural Causes", location: "Nakuru", scheduled: "2024-01-16 10:00", status: "pending" },
      { id: 5, name: "James Brown", age: 45, cause: "Illness", location: "Eldoret", scheduled: "2024-01-16 13:30", status: "confirmed" },
      { id: 6, name: "Emily Davis", age: 68, cause: "Natural Causes", location: "Nairobi", scheduled: "2024-01-16 15:00", status: "pending" },
      { id: 7, name: "Michael Wilson", age: 52, cause: "Illness", location: "Kisumu", scheduled: "2024-01-17 08:30", status: "confirmed" }
    ],
    insurance: {
      activePolicies: 342,
      monthlyPremium: 2850000,
      claimsThisMonth: 18,
      totalCoverage: 125000000,
      trends: {
        policies: [320, 325, 332, 338, 342, 345, 350, 348, 355, 360, 362, 365],
        claims: [12, 15, 14, 18, 16, 20, 18, 22, 25, 28, 30, 32],
        premiums: [2500000, 2550000, 2620000, 2680000, 2720000, 2780000, 2820000, 2850000, 2900000, 2950000, 2980000, 3000000]
      }
    },
    ageDistribution: { '0-17': 15, '18-35': 85, '36-60': 165, '61+': 235 },
    genderDistribution: { male: 320, female: 180 },
    bodyStorage: { occupied: 12, available: 8, maintenance: 2 },
    paymentMethods: { cash: 245, mpesa: 180, insurance: 120, bank: 55, card: 40 },
    causeOfDeath: { 'Natural Causes': 280, Illness: 120, Accident: 45, 'Other': 55 },
    weeklyAdmissions: [18, 22, 15, 20, 25, 19, 12]
  });

  // Professional chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
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

  const chartOptionsDualAxis = {
    ...chartOptions,
    scales: {
      x: { grid: { display: false } },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Count', color: COLORS.gray },
        grid: { color: COLORS.light },
        ticks: { color: COLORS.gray }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Value (KES)', color: COLORS.gray },
        grid: { drawOnChartArea: false },
        ticks: { color: COLORS.gray }
      }
    }
  };

  const getAvailableYears = () => {
    try {
      const revenueTotal = getSafeObject(dashboardData, 'revenue.total');
      const years = new Set();
      Object.keys(revenueTotal).forEach(monthYear => {
        const year = monthYear.split(' ')[1];
        if (year) years.add(parseInt(year));
      });
      return Array.from(years).sort((a, b) => b - a);
    } catch (error) {
      return [new Date().getFullYear()];
    }
  };

  // ============================================================
  // DATA FETCHING
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const mortuaryResponse = await fetch('http://localhost:5000/api/v1/restpoint/analytics/mortuary-analytics');
        if (!mortuaryResponse.ok) throw new Error(`HTTP error! status: ${mortuaryResponse.status}`);

        const mortuaryResult = await mortuaryResponse.json();
        if (mortuaryResult.success) {
          setDashboardData(mortuaryResult.data);
        } else {
          throw new Error(mortuaryResult.message || 'Mortuary API returned unsuccessful response');
        }

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const vehicleResponse = await fetch(`http://localhost:5000/api/v1/restpoint/vehicle-analytics?month=${currentMonth}&year=${currentYear}`);

        if (vehicleResponse.ok) {
          const vehicleResult = await vehicleResponse.json();
          if (vehicleResult.success) {
            setVehicleData(vehicleResult.data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        console.log('Using fallback/mock data for display');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================================================
  // HANDLE CHART CLICK - Drill Down
  // ============================================================
  const handleChartClick = useCallback(async (elements, chart, type) => {
    if (!elements || !elements.length) return;

    setLoadingDetails(true);
    setShowModal(true);

    try {
      const element = elements[0];
      let label, value;

      if (type === 'pie' || type === 'doughnut' || type === 'polar') {
        label = chart.data.labels[element.index];
        value = chart.data.datasets[0].data[element.index];
      } else {
        label = chart.data.labels[element.index];
        value = chart.data.datasets[element.datasetIndex].data[element.index];
      }

      const mockDetails = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        caseNumber: `CASE-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        service: label,
        status: ['RECEIVED', 'UNDER_CARE', 'PENDING', 'COMPLETED'][i % 4],
        amount: typeof value === 'number' ? value / 8 : 0,
        date: new Date(Date.now() - i * 86400000 * 2).toLocaleDateString(),
        billedBy: ['Dr. Kamau', 'Dr. Omondi', 'Dr. Wanjiku', 'Dr. Mutua'][i % 4]
      }));

      setSelectedData({
        label,
        value,
        details: mockDetails,
        type
      });

    } catch (error) {
      console.error('Error loading details:', error);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  // ============================================================
  // MODAL CONTENT
  // ============================================================
  const renderModalContent = () => {
    if (!selectedData) return <div className="text-center text-muted py-5">No data selected</div>;

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-1">{selectedData.label}</h5>
            <Badge bg="info" className="px-3 py-2">
              Total: {typeof selectedData.value === 'number' ? selectedData.value.toLocaleString() : selectedData.value}
              {selectedData.type === 'revenue' ? ' KES' : selectedData.type === 'distance' ? ' km' : ''}
            </Badge>
          </div>
        </div>

        {loadingDetails ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading detailed records...</p>
          </div>
        ) : selectedData.details?.length > 0 ? (
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <Table hover responsive size="sm">
              <thead className="table-light">
                <tr>
                  <th>Case No.</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Billed By</th>
                </tr>
              </thead>
              <tbody>
                {selectedData.details.map((detail) => (
                  <tr key={detail.id}>
                    <td><strong>{detail.caseNumber}</strong></td>
                    <td>{detail.service}</td>
                    <td>
                      <Badge bg={
                        detail.status === 'COMPLETED' ? 'success' :
                          detail.status === 'READY' ? 'primary' :
                            detail.status === 'UNDER_CARE' ? 'warning' : 'secondary'
                      } className="px-2">
                        {detail.status}
                      </Badge>
                    </td>
                    <td>
                      {selectedData.type === 'revenue'
                        ? `KES ${(detail.amount || 0).toLocaleString()}`
                        : selectedData.type === 'distance'
                          ? `${detail.amount || 0} km`
                          : `${detail.amount || 0}`}
                    </td>
                    <td><small>{detail.date}</small></td>
                    <td><small>{detail.billedBy}</small></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center text-muted py-5">No records found</div>
        )}
      </div>
    );
  };

  // ============================================================
  // SAFE DATA ACCESS FOR RENDERING
  // ============================================================
  const summaryData = getSafeObject(dashboardData, 'summary');
  const caseStatusData = getSafeObject(dashboardData, 'caseStatus');
  const revenueTotalData = getSafeObject(dashboardData, 'revenue.total');
  const revenueExtraServicesData = getSafeObject(dashboardData, 'revenue.extraServices');
  const serviceTypesData = getSafeObject(dashboardData, 'serviceTypes');
  const monthlyTrendsData = getSafeObject(dashboardData, 'monthlyTrends');
  const visitorTrendsData = getSafeObject(dashboardData, 'visitorTrends');
  const coffinSalesData = getSafeArray(dashboardData, 'coffinSales');
  const averageStayDurationData = getSafeObject(dashboardData, 'averageStayDuration');
  const dispatchAnalyticsData = getSafeObject(dashboardData, 'dispatchAnalytics');
  const coffinInventoryData = getSafeObject(dashboardData, 'coffinInventory');
  const operationalMetricsData = getSafeObject(dashboardData, 'operationalMetrics');
  const financialMetricsData = getSafeObject(dashboardData, 'financialMetrics');
  const performanceIndicatorsData = getSafeObject(dashboardData, 'performanceIndicators');

  const fleetSummary = getSafeObject(vehicleData, 'fleetSummary');
  const vehicles = getSafeArray(vehicleData, 'vehicles');

  const collectionRate = financialMetricsData.collectionRate || 0;
  const outstandingPercentage = financialMetricsData.outstandingPercentage || 0;
  const revenuePerCase = financialMetricsData.revenuePerCase || 0;
  const todayVisitors = operationalMetricsData.todayVisitors || 0;
  const monthlyVisitors = operationalMetricsData.monthlyVisitors || 0;

  const visitorTrendsChartData = visitorTrendsData && Object.keys(visitorTrendsData).length > 0
    ? {
      labels: Object.keys(visitorTrendsData),
      datasets: [
        {
          label: 'Admissions',
          data: Object.values(visitorTrendsData).map(day => day.admissions || 0),
          backgroundColor: COLORS.chart1 + '20',
          borderColor: COLORS.chart1,
          borderWidth: 2,
          fill: true
        },
        {
          label: 'Avg Processing Days',
          data: Object.values(visitorTrendsData).map(day => day.avgProcessingDays || 0),
          backgroundColor: COLORS.chart2 + '20',
          borderColor: COLORS.chart2,
          borderWidth: 2,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    }
    : null;

  // ============================================================
  // CHART DATA PREPARATION FUNCTIONS
  // ============================================================
  const getCasesTrendsData = () => {
    const data = timeFrame === 'monthly' ? mockData.casesTrends.monthly :
      timeFrame === 'quarterly' ? mockData.casesTrends.quarterly :
        mockData.casesTrends.yearly;

    const labels = timeFrame === 'monthly' ?
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] :
      timeFrame === 'quarterly' ? ['Q1', 'Q2', 'Q3', 'Q4'] :
        ['Year'];

    return {
      labels,
      datasets: [
        {
          label: 'Cases Handled',
          data,
          borderColor: COLORS.chart1,
          backgroundColor: COLORS.chart1 + '20',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: COLORS.chart1,
          pointBorderColor: COLORS.white,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };
  };

  const getMonthlyRevenueData = () => {
    const revenueValues = Object.values(revenueTotalData);
    const labels = Object.keys(revenueTotalData);

    if (revenueValues.length === 0) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Revenue',
          data: [450000, 520000, 480000, 650000, 580000, 720000, 680000, 750000, 700000, 650000, 780000, 850000],
          borderColor: COLORS.chart2,
          backgroundColor: COLORS.chart2 + '20',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: COLORS.chart2,
          pointBorderColor: COLORS.white,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      };
    }

    return {
      labels,
      datasets: [{
        label: 'Monthly Revenue',
        data: revenueValues,
        borderColor: COLORS.chart2,
        backgroundColor: COLORS.chart2 + '20',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: COLORS.chart2,
        pointBorderColor: COLORS.white,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    };
  };

  const getRevenueByCategoryData = () => {
    const getData = (cat) => {
      if (timeFrame === 'monthly') return mockData.revenueByCategory[cat]?.monthly || [];
      if (timeFrame === 'quarterly') return mockData.revenueByCategory[cat]?.quarterly || [];
      return mockData.revenueByCategory[cat]?.yearly || [];
    };

    const labels = timeFrame === 'monthly'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : timeFrame === 'quarterly' ? ['Q1', 'Q2', 'Q3', 'Q4'] : ['Year'];

    return {
      labels,
      datasets: [
        { label: 'Transport', data: getData('transport'), borderColor: COLORS.chart1, backgroundColor: COLORS.chart1 + '20', borderWidth: 2, fill: true, tension: 0.3 },
        { label: 'Storage', data: getData('storage'), borderColor: COLORS.chart2, backgroundColor: COLORS.chart2 + '20', borderWidth: 2, fill: true, tension: 0.3 },
        { label: 'Supplies', data: getData('supplies'), borderColor: COLORS.chart3, backgroundColor: COLORS.chart3 + '20', borderWidth: 2, fill: true, tension: 0.3 },
        { label: 'Embalming', data: getData('embalming'), borderColor: COLORS.chart4, backgroundColor: COLORS.chart4 + '20', borderWidth: 2, fill: true, tension: 0.3 }
      ]
    };
  };

  const getChemicalsUsageData = () => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      labels,
      datasets: [
        { label: 'Formaldehyde', data: mockData.chemicals.formaldehyde.monthly, borderColor: COLORS.chart4, backgroundColor: COLORS.chart4 + '20', borderWidth: 2, fill: true },
        { label: 'Disinfectants', data: mockData.chemicals.disinfectants.monthly, borderColor: COLORS.chart1, backgroundColor: COLORS.chart1 + '20', borderWidth: 2, fill: true },
        { label: 'Preservatives', data: mockData.chemicals.preservatives.monthly, borderColor: COLORS.chart2, backgroundColor: COLORS.chart2 + '20', borderWidth: 2, fill: true },
        { label: 'Embalming Fluid', data: mockData.chemicals.embalming.monthly, borderColor: COLORS.chart3, backgroundColor: COLORS.chart3 + '20', borderWidth: 2, fill: true }
      ]
    };
  };

  const getAgeDistributionData = () => ({
    labels: Object.keys(mockData.ageDistribution),
    datasets: [{
      label: 'Age Groups',
      data: Object.values(mockData.ageDistribution),
      backgroundColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4],
      borderWidth: 2,
      borderColor: COLORS.white
    }]
  });

  const getGenderDistributionData = () => ({
    labels: ['Male', 'Female'],
    datasets: [{
      data: [mockData.genderDistribution.male, mockData.genderDistribution.female],
      backgroundColor: [COLORS.chart1, COLORS.chart5],
      borderWidth: 2,
      borderColor: COLORS.white
    }]
  });

  const getBodyStorageData = () => ({
    labels: ['Occupied', 'Available', 'Maintenance'],
    datasets: [{
      data: [mockData.bodyStorage.occupied, mockData.bodyStorage.available, mockData.bodyStorage.maintenance],
      backgroundColor: [COLORS.danger, COLORS.success, COLORS.warning],
      borderWidth: 2,
      borderColor: COLORS.white
    }]
  });

  const getPaymentMethodsData = () => ({
    labels: Object.keys(mockData.paymentMethods),
    datasets: [{
      label: 'Payment Methods',
      data: Object.values(mockData.paymentMethods),
      backgroundColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5],
      borderWidth: 0,
      borderRadius: 8
    }]
  });

  const getCauseOfDeathData = () => ({
    labels: Object.keys(mockData.causeOfDeath),
    datasets: [{
      label: 'Cause of Death',
      data: Object.values(mockData.causeOfDeath),
      backgroundColor: [COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart6],
      borderWidth: 2,
      borderColor: COLORS.white
    }]
  });

  const getCoffinSalesData = () => {
    const hasData = coffinSalesData.length > 0;
    const labels = hasData
      ? coffinSalesData.map(c => c.month || c.label || '')
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const data = hasData
      ? coffinSalesData.map(c => c.sales || c.count || 0)
      : [12, 18, 15, 20, 22, 25, 18, 28, 24, 20, 26, 30];

    return { labels, datasets: [{ label: 'Coffin Sales', data, backgroundColor: COLORS.chart3, borderWidth: 0, borderRadius: 8 }] };
  };

  const getInsuranceTrendsData = () => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      labels,
      datasets: [
        { label: 'Active Policies', data: mockData.insurance.trends.policies, borderColor: COLORS.chart5, backgroundColor: COLORS.chart5 + '20', borderWidth: 3, fill: true, yAxisID: 'y' },
        { label: 'Monthly Premiums (KES 100K)', data: mockData.insurance.trends.premiums.map(p => p / 100000), borderColor: COLORS.chart1, backgroundColor: COLORS.chart1 + '20', borderWidth: 3, fill: true, yAxisID: 'y1' }
      ]
    };
  };

  const getFinancialTrendsData = () => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      { label: 'Collection Rate (%)', data: [1.8, 1.9, 2.0, 2.1, 2.1, 2.0, 2.2, 2.1, 2.1, 2.0, 2.1, 2.1], borderColor: COLORS.chart5, backgroundColor: COLORS.chart5 + '20', borderWidth: 3, fill: true, tension: 0.4, yAxisID: 'y' },
      { label: 'Outstanding %', data: [98, 99, 98, 100, 100, 99, 98, 100, 100, 99, 100, 100], borderColor: COLORS.chart4, backgroundColor: COLORS.chart4 + '20', borderWidth: 3, fill: true, tension: 0.4, yAxisID: 'y1' }
    ]
  });

  // ============================================================
  // LOADING & ERROR STATES
  // ============================================================
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

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger" className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
          <Alert.Heading>Error Loading Dashboard</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <ErrorBoundary>
      <Container fluid className="py-4" style={{ background: COLORS.light, minHeight: '100vh' }}>

        {/* PROFESSIONAL HEADER */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px', background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)` }}>
          <Card.Body className="p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: COLORS.white
                    }}
                  >
                    <Users size={24} />
                  </div>
                  <div>
                    <h2 className="text-white fw-bold mb-0" style={{ fontSize: '1.5rem' }}>
                      Mortuary Analytics Dashboard
                    </h2>
                    {tenantInfo?.name && (
                      <Badge bg="light" text="dark" className="mt-1">
                        {tenantInfo.name}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-white-50 mb-0 small">
                  {selectedBranch === 'all' ? 'Showing data across all branches' : `Showing data for: ${branches.find(b => b.id === selectedBranch)?.name || 'Selected Branch'}`}
                  <span className="ms-3">Last updated: {new Date().toLocaleString()}</span>
                </p>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <Dropdown>
                  <Dropdown.Toggle variant="light" size="sm" className="border-0 shadow-sm" style={{ borderRadius: '8px' }}>
                    <Building size={16} className="me-2" />
                    {branches.find(b => b.id === selectedBranch)?.name || 'All Branches'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setSelectedBranch('all')}>
                      <Users size={16} className="me-2" />
                      All Branches
                    </Dropdown.Item>
                    {branches.map(branch => (
                      <Dropdown.Item
                        key={branch.id}
                        onClick={() => setSelectedBranch(branch.id)}
                        active={branch.id === selectedBranch}
                      >
                        {branch.name || branch.id}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown>
                  <Dropdown.Toggle variant="light" size="sm" className="border-0 shadow-sm" style={{ borderRadius: '8px' }}>
                    <Calendar size={16} className="me-2" />
                    {selectedYear}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {getAvailableYears().map(year => (
                      <Dropdown.Item
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        active={year === selectedYear}
                      >
                        {year}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                <Form.Select
                  size="sm"
                  style={{ width: '150px', borderRadius: '8px' }}
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value)}
                  className="border-0 shadow-sm"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </Form.Select>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* KEY METRICS CARDS */}
        <Row className="g-3 mb-4">
          <Col xs={6} lg={3}>
            <StatCard
              title="Total Cases"
              value={summaryData.totalCases ?? summaryData.totalDeceased ?? '-'}
              subtitle="All time records"
              icon={ClipboardList}
              color="primary"
            />
          </Col>
          <Col xs={6} lg={3}>
            <StatCard
              title="Active Cases"
              value={summaryData.activeCases ?? summaryData.pending ?? '-'}
              subtitle="Currently in care"
              icon={CheckCircle}
              color="success"
            />
          </Col>
          <Col xs={6} lg={3}>
            <StatCard
              title="Total Revenue"
              value={summaryData.totalRevenue ? `KES ${(summaryData.totalRevenue / 1000000).toFixed(1)}M` : '-'}
              subtitle="Cumulative revenue"
              icon={DollarSign}
              color="success"
            />
          </Col>
          <Col xs={6} lg={3}>
            <StatCard
              title="Avg Stay Duration"
              value={averageStayDurationData?.average ? `${averageStayDurationData.average} days` : (summaryData.averageStay ? `${summaryData.averageStay} days` : '-')}
              subtitle="Per case duration"
              icon={Clock}
              color="warning"
            />
          </Col>
        </Row>

        {/* OVERVIEW SECTION */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <Card.Body className="p-4">
            <SectionHeader
              title="Overview"
              icon={TrendingUp}
              color={COLORS.primary}
            />
            <Row className="g-4">
              {/* Cases Handled Trends */}
              <Col xl={6}>
                <ChartCard title="Cases Handled Trends" icon={ArrowUpRight} color={COLORS.primary} height="300px">
                  <Line data={getCasesTrendsData()} options={{
                    ...chartOptions,
                    plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} cases` } } }
                  }} />
                </ChartCard>
              </Col>

              {/* Case Status Distribution */}
              <Col xl={3} lg={6}>
                <ChartCard title="Case Status" icon={ClipboardList} color={COLORS.info} height="280px">
                  {Object.keys(caseStatusData).length > 0 ? (
                    <Pie
                      data={{ labels: Object.keys(caseStatusData).map(s => s.charAt(0) + s.slice(1).toLowerCase()), datasets: [{ data: Object.values(caseStatusData), backgroundColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5], borderWidth: 2, borderColor: COLORS.white }] }}
                      options={{ ...chartOptions, onClick: (e, elements) => { if (elements?.length) handleChartClick(elements, e.chart, 'pie'); } }}
                    />
                  ) : (
                    <Pie data={{ labels: ['Received', 'Under Care', 'Pending', 'Completed', 'Released'], datasets: [{ data: [35, 25, 15, 18, 7], backgroundColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5], borderWidth: 2, borderColor: COLORS.white }] }} options={chartOptions} />
                  )}
                </ChartCard>
              </Col>

              {/* Gender Distribution */}
              <Col xl={3} lg={6}>
                <ChartCard title="Gender Distribution" icon={Users} color={COLORS.purple} height="280px">
                  <Doughnut data={getGenderDistributionData()} options={{ ...chartOptions, onClick: (e, elements) => { if (elements?.length) handleChartClick(elements, e.chart, 'doughnut'); } }} />
                </ChartCard>
              </Col>

              {/* Age Distribution */}
              <Col xl={3} lg={6}>
                <ChartCard title="Age Distribution" icon={BarChart3} color={COLORS.warning} height="280px">
                  <Bar data={getAgeDistributionData()} options={{ ...chartOptions, onClick: (e, elements) => { if (elements?.length) handleChartClick(elements, e.chart, 'bar'); } }} />
                </ChartCard>
              </Col>

              {/* Cause of Death */}
              <Col xl={3} lg={6}>
                <ChartCard title="Cause of Death" icon={Stethoscope} color={COLORS.danger} height="280px">
                  <PolarArea data={getCauseOfDeathData()} options={{ ...chartOptions, onClick: (e, elements) => { if (elements?.length) handleChartClick(elements, e.chart, 'polar'); } }} />
                </ChartCard>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* OPERATIONS SECTION */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <Card.Body className="p-4">
            <SectionHeader
              title="Operations"
              icon={Settings}
              color={COLORS.info}
            />
            <Row className="g-4">
              {/* Chemicals Usage */}
              <Col xl={12}>
                <ChartCard title="Chemicals Usage Trends" icon={FlaskConical} color={COLORS.danger} height="300px">
                  <Line data={getChemicalsUsageData()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} ${['liters', 'liters', 'kg', 'liters'][ctx.datasetIndex]}` } } } }} />
                  <Row className="mt-3 text-center pt-3 border-top">
                    <Col xs={3}><h6 className="text-danger mb-0">{mockData.chemicals.formaldehyde.monthly.reduce((a, b) => a + b, 0)}L</h6><small className="text-muted">Formaldehyde</small></Col>
                    <Col xs={3}><h6 className="text-info mb-0">{mockData.chemicals.disinfectants.monthly.reduce((a, b) => a + b, 0)}L</h6><small className="text-muted">Disinfectants</small></Col>
                    <Col xs={3}><h6 className="text-success mb-0">{mockData.chemicals.preservatives.monthly.reduce((a, b) => a + b, 0)}kg</h6><small className="text-muted">Preservatives</small></Col>
                    <Col xs={3}><h6 className="text-warning mb-0">{mockData.chemicals.embalming.monthly.reduce((a, b) => a + b, 0)}L</h6><small className="text-muted">Embalming</small></Col>
                  </Row>
                </ChartCard>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* INVENTORY SECTION */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <Card.Body className="p-4">
            <SectionHeader
              title="Inventory Management"
              icon={Box}
              color={COLORS.warning}
            />
            <Row className="g-4">
              {/* Coffin Sales */}
              <Col xl={6}>
                <ChartCard title="Coffin Sales Trend" icon={Box} color={COLORS.warning} height="300px">
                  <Bar data={getCoffinSalesData()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.parsed.y} coffins sold` } } } }} />
                  <Row className="mt-3 text-center pt-3 border-top">
                    <Col xs={4}><h6 className="text-primary mb-0">{coffinSalesData.length > 0 ? coffinSalesData.reduce((a, c) => a + (c.sales || c.count || 0), 0) : 248}</h6><small className="text-muted">Total Sold</small></Col>
                    <Col xs={4}><h6 className="text-success mb-0">{coffinSalesData.length > 0 ? (coffinSalesData.reduce((a, c) => a + (c.sales || c.count || 0), 0) / coffinSalesData.length).toFixed(1) : '20.7'}</h6><small className="text-muted">Monthly Avg</small></Col>
                    <Col xs={4}><h6 className="text-warning mb-0">{coffinSalesData.length > 0 ? Math.max(...coffinSalesData.map(c => c.sales || c.count || 0)) : 30}</h6><small className="text-muted">Best Month</small></Col>
                  </Row>
                </ChartCard>
              </Col>

              {/* Coffin Inventory by Type */}
              <Col xl={3} lg={6}>
                <ChartCard title="Coffin Inventory" icon={Box} color={COLORS.warning} height="280px">
                  {Object.keys(coffinInventoryData).length > 0 ? (
                    <Pie data={{ labels: Object.keys(coffinInventoryData), datasets: [{ data: Object.values(coffinInventoryData).map(v => typeof v === 'number' ? v : v.quantity || 0), backgroundColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5], borderWidth: 2, borderColor: COLORS.white }] }} options={chartOptions} />
                  ) : (
                    <Pie data={{ labels: ['Oak', 'Mahogany', 'Pine', 'Metal', 'Eco'], datasets: [{ data: [35, 25, 20, 12, 8], backgroundColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5], borderWidth: 2, borderColor: COLORS.white }] }} options={chartOptions} />
                  )}
                </ChartCard>
              </Col>

              {/* Vehicle Fleet */}
              <Col xl={3} lg={6}>
                <ChartCard title="Fleet Status" icon={Car} color={COLORS.info} height="280px">
                  <Doughnut data={{ labels: vehicles.length > 0 ? vehicles.map(v => v.vehiclePlate?.trim() || 'Unknown') : ['KDK 456G', 'KDK 497C', 'KCM 234D', 'KCA 789E', 'KCB 101F'], datasets: [{ data: vehicles.length > 0 ? vehicles.map(v => v.kilometers?.currentMonth || 0) : [45, 28, 20, 15, 7], backgroundColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5], borderWidth: 2, borderColor: COLORS.white }] }} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed.y} km` } } } }} />
                  <div className="mt-2 pt-2 border-top text-center"><small className="text-muted">Distance covered per vehicle (km/month)</small></div>
                </ChartCard>
              </Col>

              {/* Hearse Distance Coverage */}
              <Col xl={6}>
                <ChartCard title="Hearse Distance Coverage" icon={Truck} color={COLORS.primary} height="300px">
                  <Line data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], datasets: [
                      { label: 'KDK 456G', data: [245, 280, 265, 310, 295, 320, 335, 300, 285, 270, 290, 315], borderColor: COLORS.chart1, backgroundColor: COLORS.chart1 + '20', borderWidth: 2, fill: true, tension: 0.4 },
                      { label: 'KDK 497C', data: [180, 195, 210, 225, 240, 255, 270, 285, 260, 245, 230, 215], borderColor: COLORS.chart2, backgroundColor: COLORS.chart2 + '20', borderWidth: 2, fill: true, tension: 0.4 },
                      { label: 'KCM 234D', data: [120, 135, 150, 165, 180, 195, 210, 195, 180, 165, 150, 135], borderColor: COLORS.chart3, backgroundColor: COLORS.chart3 + '20', borderWidth: 2, fill: true, tension: 0.4 }
                    ]
                  }} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} km` } } } }} />
                </ChartCard>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ANALYTICS SECTION */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <Card.Body className="p-4">
            <SectionHeader
              title="Performance Analytics"
              icon={TrendingUp}
              color={COLORS.danger}
            />
            <Row className="g-4">
              {/* Performance Indicators */}
              <Col xl={3} lg={6}>
                <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '12px', borderLeft: `4px solid ${COLORS.success}` }}>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <TrendingUp size={18} style={{ color: COLORS.success }} />
                      <h6 className="text-muted text-uppercase mb-0" style={{ fontSize: '0.7rem', letterSpacing: '1px', fontWeight: 600 }}>Performance Score</h6>
                    </div>
                    <h2 className="fw-bold text-success mb-0">{performanceIndicatorsData.performanceScore || 87}%</h2>
                    <ProgressBar now={performanceIndicatorsData.performanceScore || 87} variant="success" className="mt-2" style={{ height: '6px', borderRadius: '3px' }} />
                    <small className="text-muted mt-2 d-block">Overall operational efficiency</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={3} lg={6}>
                <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '12px', borderLeft: `4px solid ${COLORS.info}` }}>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <CheckCircle size={18} style={{ color: COLORS.info }} />
                      <h6 className="text-muted text-uppercase mb-0" style={{ fontSize: '0.7rem', letterSpacing: '1px', fontWeight: 600 }}>Case Resolution Rate</h6>
                    </div>
                    <h2 className="fw-bold text-info mb-0">{performanceIndicatorsData.resolutionRate || 78}%</h2>
                    <ProgressBar now={performanceIndicatorsData.resolutionRate || 78} variant="info" className="mt-2" style={{ height: '6px', borderRadius: '3px' }} />
                    <small className="text-muted mt-2 d-block">Cases completed vs received</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={3} lg={6}>
                <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '12px', borderLeft: `4px solid ${COLORS.warning}` }}>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Percent size={18} style={{ color: COLORS.warning }} />
                      <h6 className="text-muted text-uppercase mb-0" style={{ fontSize: '0.7rem', letterSpacing: '1px', fontWeight: 600 }}>Occupancy Rate</h6>
                    </div>
                    <h2 className="fw-bold text-warning mb-0">{performanceIndicatorsData.occupancyRate || 62}%</h2>
                    <ProgressBar now={performanceIndicatorsData.occupancyRate || 62} variant="warning" className="mt-2" style={{ height: '6px', borderRadius: '3px' }} />
                    <small className="text-muted mt-2 d-block">Mortuary storage utilization</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={3} lg={6}>
                <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '12px', borderLeft: `4px solid ${COLORS.danger}` }}>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <ArrowUp size={18} style={{ color: COLORS.danger }} />
                      <h6 className="text-muted text-uppercase mb-0" style={{ fontSize: '0.7rem', letterSpacing: '1px', fontWeight: 600 }}>Revenue Growth</h6>
                    </div>
                    <h2 className="fw-bold text-danger mb-0">{performanceIndicatorsData.revenueGrowth || 14}%</h2>
                    <ProgressBar now={performanceIndicatorsData.revenueGrowth || 14} variant="danger" className="mt-2" style={{ height: '6px', borderRadius: '3px' }} />
                    <small className="text-muted mt-2 d-block">Year over year increase</small>
                  </Card.Body>
                </Card>
              </Col>

              {/* Visitor Trends */}
              <Col xl={6}>
                <ChartCard title="Visitor Trends" icon={Users} color={COLORS.primary} height="300px">
                  {visitorTrendsChartData ? (
                    <Bar data={visitorTrendsChartData} options={chartOptions} />
                  ) : (
                    <Bar data={{
                      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'], datasets: [
                        { label: 'Visitors', data: [85, 92, 78, 105, 98, 112, 88, 95], backgroundColor: COLORS.chart1, borderWidth: 0, borderRadius: 6 },
                        { label: 'Admissions', data: [22, 28, 18, 35, 30, 38, 25, 32], backgroundColor: COLORS.chart2, borderWidth: 0, borderRadius: 6 }
                      ]
                    }} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}` } } } }} />
                  )}
                </ChartCard>
              </Col>

              {/* Key Metrics Summary */}
              <Col xl={3} lg={6}>
                <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <PieChart size={20} style={{ color: COLORS.purple }} />
                      <h6 className="fw-semibold mb-0">Key Metrics</h6>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between align-items-center p-2 rounded-3" style={{ background: COLORS.successLight }}><span className="small">Cases/Day</span><Badge bg="success" className="rounded-pill">{Math.round((mockData.casesTrends.monthly.reduce((a, b) => a + b, 0) / 365) * 10) / 10}</Badge></div>
                      <div className="d-flex justify-content-between align-items-center p-2 rounded-3" style={{ background: COLORS.infoLight }}><span className="small">Revenue/Day</span><Badge bg="info" className="rounded-pill">KES {Math.round(Object.values(revenueTotalData).length > 0 ? Object.values(revenueTotalData).reduce((a, b) => a + b, 0) / 365 : 5890).toLocaleString()}</Badge></div>
                      <div className="d-flex justify-content-between align-items-center p-2 rounded-3" style={{ background: COLORS.warningLight }}><span className="small">Bed Turnover</span><Badge bg="warning" className="rounded-pill">{averageStayDurationData.average || 4.2} days</Badge></div>
                      <div className="d-flex justify-content-between align-items-center p-2 rounded-3" style={{ background: COLORS.dangerLight }}><span className="small">Collection Rate</span><Badge bg="danger" className="rounded-pill">{collectionRate || 85}%</Badge></div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Dispatch Analytics */}
              <Col xl={3} lg={6}>
                <ChartCard title="Dispatch Analytics" icon={Truck} color={COLORS.info} height="250px">
                  <Line data={{ labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], datasets: [{ label: 'Dispatches', data: [dispatchAnalyticsData.weeklyDispatches || 18, Math.round((dispatchAnalyticsData.weeklyDispatches || 18) * 1.1) || 20, Math.round((dispatchAnalyticsData.weeklyDispatches || 18) * 1.3) || 24, Math.round((dispatchAnalyticsData.weeklyDispatches || 18) * 0.9) || 16], borderColor: COLORS.chart5, backgroundColor: COLORS.chart5 + '20', borderWidth: 3, fill: true, tension: 0.4 }] }} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.parsed.y} dispatches` } } } }} />
                  <div className="mt-2 text-center pt-2 border-top"><small className="text-muted">Weekly dispatch trends</small></div>
                </ChartCard>
              </Col>

              {/* Monthly Trends Summary */}
              <Col xl={12}>
                <ChartCard title="Monthly Trends Summary" icon={Calendar} color={COLORS.primary} height="300px">
                  {Object.keys(monthlyTrendsData).length > 0 ? (
                    <Line data={{ labels: Object.keys(monthlyTrendsData), datasets: [{ label: 'Monthly Cases', data: Object.values(monthlyTrendsData), borderColor: COLORS.chart1, backgroundColor: COLORS.chart1 + '20', borderWidth: 3, fill: true, tension: 0.4 }] }} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.parsed.y} cases` } } } }} />
                  ) : (
                    <Line data={{
                      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], datasets: [
                        { label: 'Cases', data: mockData.casesTrends.monthly, borderColor: COLORS.chart1, backgroundColor: COLORS.chart1 + '20', borderWidth: 3, fill: true, tension: 0.4 },
                        { label: 'Revenue (KES 10K)', data: [45, 52, 48, 65, 58, 72, 68, 75, 70, 65, 78, 85].map(v => v * 10), borderColor: COLORS.chart2, backgroundColor: COLORS.chart2 + '20', borderWidth: 3, fill: true, tension: 0.4, yAxisID: 'y1' }
                      ]
                    }} options={{ ...chartOptionsDualAxis, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => ctx.datasetIndex === 0 ? `${ctx.parsed.y} cases` : `KES ${(ctx.parsed.y * 10000).toLocaleString()}` } } } }} />
                  )}
                  <Row className="mt-3 text-center pt-3 border-top">
                    <Col md={3}><h6 className="text-primary mb-0">{summaryData.peakMonth || 'December'}</h6><small className="text-muted">Peak Month</small></Col>
                    <Col md={3}><h6 className="text-success mb-0">{summaryData.peakCases || 85}</h6><small className="text-muted">Highest Cases</small></Col>
                    <Col md={3}><h6 className="text-warning mb-0">{summaryData.lowMonth || 'February'}</h6><small className="text-muted">Lowest Month</small></Col>
                    <Col md={3}><h6 className="text-info mb-0">{summaryData.lowCases || 45}</h6><small className="text-muted">Lowest Cases</small></Col>
                  </Row>
                </ChartCard>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* DETAIL MODAL */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-light" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
            <div>
              <Modal.Title className="fs-5">
                {selectedData?.label || 'Details'}
                {selectedData?.type === 'revenue' && <Badge bg="success" className="ms-2">KES</Badge>}
              </Modal.Title>
              <small className="text-muted">Detailed breakdown of selected chart data</small>
            </div>
          </Modal.Header>
          <Modal.Body style={{ padding: '1.5rem' }}>
            {renderModalContent()}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="outline-secondary" size="sm" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </ErrorBoundary>
  );
};

export default BeautifulMortuaryDashboard;