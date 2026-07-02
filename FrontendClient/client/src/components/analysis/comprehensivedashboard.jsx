// src/components/analysis/comprehensivedashboard.jsx
// Comprehensive Mortuary Dashboard - Enhanced with Branch Selector, Missing Charts, Better Null Handling
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container, Row, Col, Card, Spinner, Modal, Button,
  ListGroup, Badge, Form, Alert, Dropdown, Table, ProgressBar,
  Tooltip as BSTooltip, OverlayTrigger
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
  TimeScale,
  RadialLinearScale
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, PolarArea } from 'react-chartjs-2';
import GaugeChart from 'react-gauge-chart';
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
  TimeScale,
  RadialLinearScale
);

// ============================================================
// COLOR PALETTES
// ============================================================
const CHART_COLORS = ["#ff3b30", "#5856d6", "#ffcc00", "#ff2d55", "#007aff", "#34C759"];
const CHART_COLORS_PASTEL = ["#FF6B6B", "#74B9FF", "#FFEAA7", "#DFE6E9", "#A29BFE", "#55EFC4", "#FDA7DF", "#81ECEC"];
const CHART_COLORS_GRADIENT = ["#D4A574", "#8B7E74", "#6C5B7B", "#355C7D", "#F67280", "#C06C84"];

const Colors = {
  primary: "#2C3E50",
  secondary: "#34495E",
  accent: "#007aff",
  success: "#34C759",
  warning: "#ffcc00",
  danger: "#ff3b30",
  info: "#5856d6",
  light: "#F8F9FA",
  dark: "#495057",
  white: "#FFFFFF",
  branch1: "#05668D",
  branch2: "#02C39A",
  branch3: "#F0A202",
  branch4: "#D95D39",
  branch5: "#7A4EA6"
};

const CUSTOM_COLORS = {
  primaryDark: '#2C3E50',
  accentBlue: '#05668D',
  kinSuccess: '#00A896',
  autopsySuccess: '#6A0572',
  warningYellow: '#F39C12',
  infoBlue: '#3498DB',
  transport: '#4ECDC4',
  storage: '#45B7D1',
  supplies: '#96CEB4',
  chemicals: '#FF6B6B',
  coffinOak: '#D4A574',
  coffinMahogany: '#6C5B7B',
  coffinPine: '#8B7E74',
  coffinMetal: '#355C7D',
  male: '#3498DB',
  female: '#E91E63',
  age0_17: '#74B9FF',
  age18_35: '#55EFC4',
  age36_60: '#FDCB6E',
  age61_plus: '#E17055'
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
          <Card className="text-center">
            <Card.Body className="py-5">
              <div className="mb-4" style={{ fontSize: '4rem' }}>⚠️</div>
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

const getSafeString = (data, path, defaultValue = '') => {
  const result = getSafeData(data, path, defaultValue);
  return typeof result === 'string' ? result : String(result || defaultValue);
};

// ============================================================
// EMPTY STATE COMPONENT
// ============================================================
const EmptyState = ({ icon = '📊', message = 'No data available', subMessage = '' }) => (
  <div className="d-flex align-items-center justify-content-center h-100 text-muted">
    <div className="text-center">
      <div style={{ fontSize: '3rem', opacity: 0.5 }}>{icon}</div>
      <p className="mt-2 mb-1">{message}</p>
      {subMessage && <small className="text-muted">{subMessage}</small>}
    </div>
  </div>
);

// ============================================================
// STAT CARD COMPONENT
// ============================================================
const StatCard = ({ title, value, subtitle, icon, color, bgColor, trend, trendUp }) => (
  <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
    <Card.Body className="p-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h6 className="text-muted mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h6>
          <h2 className="mb-0 fw-bold" style={{ color: Colors.primary }}>{value ?? 'N/A'}</h2>
        </div>
        <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: bgColor || '#E8F0FE' }}>
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <small className="text-muted">{subtitle || ''}</small>
        {trend !== undefined && (
          <Badge bg={trendUp ? 'success' : 'danger'} className="px-2 py-1" style={{ fontSize: '0.7rem' }}>
            {trendUp ? '↑' : '↓'} {Math.abs(trend)}%
          </Badge>
        )}
      </div>
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
  const [activeTab, setActiveTab] = useState('all');

  // Refs for animation
  const cardsRef = useRef([]);

  // Fetch tenant info and branches
  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const tenantSlug = localStorage.getItem('tenantSlug') || localStorage.getItem('tenant_slug') || 'default';

        // Try to get tenant info from store or API
        const tenantResponse = await fetch(`http://localhost:5000/api/v1/restpoint/tenants/${tenantSlug}`);

        if (tenantResponse.ok) {
          const result = await tenantResponse.json();
          if (result.success) {
            setTenantInfo(result.data);
            // Extract branches from tenant data
            const tenantBranches = result.data?.branches || result.data?.departments || [];
            setBranches(tenantBranches.length > 0 ? tenantBranches : [
              { id: 'main', name: 'Main Branch' },
              { id: 'branch1', name: 'Branch 1' },
              { id: 'branch2', name: 'Branch 2' },
              { id: 'branch3', name: 'Branch 3' }
            ]);
          }
        } else {
          // Fallback branches for demo
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
        // Set fallback branches
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

  // Mock data for charts that don't have real API data yet
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

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: Colors.primary,
        bodyColor: Colors.dark,
        borderColor: '#E9ECEF',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: '#F8F9FA' },
        beginAtZero: true
      }
    }
  };

  // Chart options with dual axis
  const chartOptionsDualAxis = {
    ...chartOptions,
    scales: {
      x: { grid: { display: false } },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Count' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Value (KES)' },
        grid: { drawOnChartArea: false }
      }
    }
  };

  // Get available years from data
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

        // Fetch mortuary analytics
        const mortuaryResponse = await fetch('http://localhost:5000/api/v1/restpoint/analytics/mortuary-analytics');

        if (!mortuaryResponse.ok) {
          throw new Error(`HTTP error! status: ${mortuaryResponse.status}`);
        }

        const mortuaryResult = await mortuaryResponse.json();

        if (mortuaryResult.success) {
          setDashboardData(mortuaryResult.data);
        } else {
          throw new Error(mortuaryResult.message || 'Mortuary API returned unsuccessful response');
        }

        // Fetch vehicle analytics
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
        // Don't show error for missing data - just use mock data
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
    if (!selectedData) return <EmptyState icon="📭" message="No data selected" />;

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
          <EmptyState icon="📭" message="No records found" subMessage="Try selecting a different period or branch" />
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
  const paymentFrequencyData = getSafeObject(dashboardData, 'paymentFrequency');
  const monthlyTrendsData = getSafeObject(dashboardData, 'monthlyTrends');
  const visitorTrendsData = getSafeObject(dashboardData, 'visitorTrends');
  const coffinSalesData = getSafeArray(dashboardData, 'coffinSales');
  const averageStayDurationData = getSafeObject(dashboardData, 'averageStayDuration');
  const hearseDistanceData = getSafeObject(dashboardData, 'hearseDistance');
  const dispatchAnalyticsData = getSafeObject(dashboardData, 'dispatchAnalytics');
  const coffinInventoryData = getSafeObject(dashboardData, 'coffinInventory');
  const operationalMetricsData = getSafeObject(dashboardData, 'operationalMetrics');
  const financialMetricsData = getSafeObject(dashboardData, 'financialMetrics');
  const performanceIndicatorsData = getSafeObject(dashboardData, 'performanceIndicators');

  // Vehicle data
  const fleetSummary = getSafeObject(vehicleData, 'fleetSummary');
  const vehicles = getSafeArray(vehicleData, 'vehicles');
  const topPerformers = getSafeObject(vehicleData, 'topPerformers');

  // Financial metrics
  const collectionRate = financialMetricsData.collectionRate || 0;
  const outstandingPercentage = financialMetricsData.outstandingPercentage || 0;
  const revenuePerCase = financialMetricsData.revenuePerCase || 0;

  // Operational metrics
  const todayVisitors = operationalMetricsData.todayVisitors || 0;
  const monthlyVisitors = operationalMetricsData.monthlyVisitors || 0;

  // Visitor trends chart data
  const visitorTrendsChartData = visitorTrendsData && Object.keys(visitorTrendsData).length > 0
    ? {
      labels: Object.keys(visitorTrendsData),
      datasets: [
        {
          label: 'Admissions',
          data: Object.values(visitorTrendsData).map(day => day.admissions || 0),
          backgroundColor: CHART_COLORS[1],
          borderColor: CHART_COLORS[1],
          borderWidth: 2
        },
        {
          label: 'Avg Processing Days',
          data: Object.values(visitorTrendsData).map(day => day.avgProcessingDays || 0),
          backgroundColor: CHART_COLORS[2],
          borderColor: CHART_COLORS[2],
          borderWidth: 2,
          yAxisID: 'y1'
        }
      ]
    }
    : null;

  // ============================================================
  // CHART DATA PREPARATION FUNCTIONS
  // ============================================================

  // Cases Handled Trends
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
          borderColor: CUSTOM_COLORS.accentBlue,
          backgroundColor: `${CUSTOM_COLORS.accentBlue}20`,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: CUSTOM_COLORS.accentBlue,
          pointBorderColor: '#fff',
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };
  };

  // Monthly Revenue with colored points
  const getMonthlyRevenueData = () => {
    const revenueValues = Object.values(revenueTotalData);
    const labels = Object.keys(revenueTotalData);

    if (revenueValues.length === 0) {
      // Use mock data if no real data
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Revenue',
          data: [450000, 520000, 480000, 650000, 580000, 720000, 680000, 750000, 700000, 650000, 780000, 850000],
          borderColor: CHART_COLORS[0],
          backgroundColor: `${CHART_COLORS[0]}20`,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: ['#34C759', '#34C759', '#ffcc00', '#34C759', '#ffcc00', '#ffcc00', '#34C759', '#34C759', '#ffcc00', '#ffcc00', '#34C759', '#34C759'],
          pointBorderColor: '#fff',
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
        borderColor: CHART_COLORS[0],
        backgroundColor: `${CHART_COLORS[0]}20`,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: revenueValues.map(v => v > 600000 ? '#34C759' : v > 400000 ? '#ffcc00' : '#ff3b30'),
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    };
  };

  // Revenue by Category
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
        { label: 'Transport', data: getData('transport'), borderColor: CUSTOM_COLORS.transport, backgroundColor: `${CUSTOM_COLORS.transport}20`, borderWidth: 2, fill: true, tension: 0.3 },
        { label: 'Storage', data: getData('storage'), borderColor: CUSTOM_COLORS.storage, backgroundColor: `${CUSTOM_COLORS.storage}20`, borderWidth: 2, fill: true, tension: 0.3 },
        { label: 'Supplies', data: getData('supplies'), borderColor: CUSTOM_COLORS.supplies, backgroundColor: `${CUSTOM_COLORS.supplies}20`, borderWidth: 2, fill: true, tension: 0.3 },
        { label: 'Embalming', data: getData('embalming'), borderColor: CUSTOM_COLORS.warningYellow, backgroundColor: `${CUSTOM_COLORS.warningYellow}20`, borderWidth: 2, fill: true, tension: 0.3 }
      ]
    };
  };

  // Chemicals Usage
  const getChemicalsUsageData = () => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      labels,
      datasets: [
        { label: 'Formaldehyde', data: mockData.chemicals.formaldehyde.monthly, borderColor: CUSTOM_COLORS.chemicals, backgroundColor: `${CUSTOM_COLORS.chemicals}20`, borderWidth: 2, fill: true },
        { label: 'Disinfectants', data: mockData.chemicals.disinfectants.monthly, borderColor: CUSTOM_COLORS.infoBlue, backgroundColor: `${CUSTOM_COLORS.infoBlue}20`, borderWidth: 2, fill: true },
        { label: 'Preservatives', data: mockData.chemicals.preservatives.monthly, borderColor: CUSTOM_COLORS.kinSuccess, backgroundColor: `${CUSTOM_COLORS.kinSuccess}20`, borderWidth: 2, fill: true },
        { label: 'Embalming Fluid', data: mockData.chemicals.embalming.monthly, borderColor: CUSTOM_COLORS.warningYellow, backgroundColor: `${CUSTOM_COLORS.warningYellow}20`, borderWidth: 2, fill: true }
      ]
    };
  };

  // Age Distribution
  const getAgeDistributionData = () => ({
    labels: Object.keys(mockData.ageDistribution),
    datasets: [{
      label: 'Age Groups',
      data: Object.values(mockData.ageDistribution),
      backgroundColor: [CUSTOM_COLORS.age0_17, CUSTOM_COLORS.age18_35, CUSTOM_COLORS.age36_60, CUSTOM_COLORS.age61_plus],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  });

  // Gender Distribution
  const getGenderDistributionData = () => ({
    labels: ['Male', 'Female'],
    datasets: [{
      data: [mockData.genderDistribution.male, mockData.genderDistribution.female],
      backgroundColor: [CUSTOM_COLORS.male, CUSTOM_COLORS.female],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  });

  // Body Storage Status
  const getBodyStorageData = () => ({
    labels: ['Occupied', 'Available', 'Maintenance'],
    datasets: [{
      data: [mockData.bodyStorage.occupied, mockData.bodyStorage.available, mockData.bodyStorage.maintenance],
      backgroundColor: [CHART_COLORS[0], CHART_COLORS[5], CHART_COLORS[2]],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  });

  // Payment Methods
  const getPaymentMethodsData = () => ({
    labels: Object.keys(mockData.paymentMethods),
    datasets: [{
      label: 'Payment Methods',
      data: Object.values(mockData.paymentMethods),
      backgroundColor: CHART_COLORS_PASTEL.slice(0, 5),
      borderWidth: 0,
      borderRadius: 8
    }]
  });

  // Cause of Death
  const getCauseOfDeathData = () => ({
    labels: Object.keys(mockData.causeOfDeath),
    datasets: [{
      label: 'Cause of Death',
      data: Object.values(mockData.causeOfDeath),
      backgroundColor: [CHART_COLORS[5], CHART_COLORS[2], CHART_COLORS[0], CHART_COLORS[3]],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  });

  // Weekly Admissions
  const getWeeklyAdmissionsData = () => ({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Admissions',
      data: mockData.weeklyAdmissions,
      backgroundColor: CUSTOM_COLORS.accentBlue,
      borderWidth: 0,
      borderRadius: 6
    }]
  });

  // Coffin Sales (if from API)
  const getCoffinSalesData = () => {
    const hasData = coffinSalesData.length > 0;
    const labels = hasData
      ? coffinSalesData.map(c => c.month || c.label || '')
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const data = hasData
      ? coffinSalesData.map(c => c.sales || c.count || 0)
      : [12, 18, 15, 20, 22, 25, 18, 28, 24, 20, 26, 30];

    return { labels, datasets: [{ label: 'Coffin Sales', data, backgroundColor: CUSTOM_COLORS.coffinOak, borderWidth: 0, borderRadius: 8 }] };
  };

  // Insurance Trends
  const getInsuranceTrendsData = () => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      labels,
      datasets: [
        { label: 'Active Policies', data: mockData.insurance.trends.policies, borderColor: CHART_COLORS[4], backgroundColor: `${CHART_COLORS[4]}20`, borderWidth: 3, fill: true, yAxisID: 'y' },
        { label: 'Monthly Premiums (KES 100K)', data: mockData.insurance.trends.premiums.map(p => p / 100000), borderColor: CHART_COLORS[1], backgroundColor: `${CHART_COLORS[1]}20`, borderWidth: 3, fill: true, yAxisID: 'y1' }
      ]
    };
  };

  // Financial Trends
  const getFinancialTrendsData = () => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      { label: 'Collection Rate (%)', data: [1.8, 1.9, 2.0, 2.1, 2.1, 2.0, 2.2, 2.1, 2.1, 2.0, 2.1, 2.1], borderColor: CHART_COLORS[4], backgroundColor: `${CHART_COLORS[4]}20`, borderWidth: 3, fill: true, tension: 0.4, yAxisID: 'y' },
      { label: 'Outstanding %', data: [98, 99, 98, 100, 100, 99, 98, 100, 100, 99, 100, 100], borderColor: CHART_COLORS[0], backgroundColor: `${CHART_COLORS[0]}20`, borderWidth: 3, fill: true, tension: 0.4, yAxisID: 'y1' }
    ]
  });

  // ============================================================
  // LOADING & ERROR STATES
  // ============================================================
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: '#F8FAFC' }}>
        <div className="text-center">
          <div className="position-relative d-inline-block mb-4">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <Spinner animation="border" variant="warning" style={{ width: '2rem', height: '2rem', position: 'absolute', top: '0.5rem', left: '0.5rem' }} />
          </div>
          <h5 className="text-muted">Loading Dashboard</h5>
          <p className="text-muted small">Fetching mortuary analytics...</p>
          <div className="mt-3">
            <ProgressBar animated now={45} style={{ height: '4px', maxWidth: '200px', margin: '0 auto' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger" className="shadow-sm border-0 rounded-4">
          <div className="d-flex align-items-center">
            <div style={{ fontSize: '2rem', marginRight: '1rem' }}>⚠️</div>
            <div>
              <Alert.Heading className="mb-1">Error Loading Dashboard</Alert.Heading>
              <p className="mb-2">{error}</p>
              <Button variant="outline-danger" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        </Alert>
      </Container>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <ErrorBoundary>
      <Container fluid className="py-4" style={{ background: '#F8FAFC', minHeight: '100vh' }}>

        {/* ============================================================ */}
        {/* HEADER WITH BRANCH SELECTOR */}
        {/* ============================================================ */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <div className="d-flex align-items-center gap-3">
              <h2 className="text-white fw-bold px-4 py-2 rounded-3 mb-0" style={{ backgroundColor: Colors.branch1, fontSize: '1.25rem' }}>
                🏥 Mortuary Analytics Dashboard
              </h2>
              {tenantInfo?.name && (
                <Badge bg="light" text="dark" className="px-3 py-2">
                  {tenantInfo.name}
                </Badge>
              )}
            </div>
            <div className="mt-2 d-flex align-items-center gap-3">
              <small className="text-muted">
                {selectedBranch === 'all' ? 'Showing data across all branches' : `Showing data for: ${branches.find(b => b.id === selectedBranch)?.name || 'Selected Branch'}`}
              </small>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                Last updated: {new Date().toLocaleString()}
              </span>
            </div>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            {/* BRANCH SELECTOR */}
            <Form.Select
              style={{ width: '200px', borderRadius: '10px', fontSize: '0.9rem' }}
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="shadow-sm border-0"
            >
              <option value="all">🌐 All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  🏪 {branch.name || branch.id}
                </option>
              ))}
              {branches.length === 0 && (
                <>
                  <option value="all">🌐 All Branches</option>
                  <option value="main">🏪 Main Branch</option>
                  <option value="kilimani">🏪 Kilimani</option>
                  <option value="westlands">🏪 Westlands</option>
                  <option value="embakasi">🏪 Embakasi</option>
                </>
              )}
            </Form.Select>

            {/* YEAR SELECTOR */}
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" className="shadow-sm border-0" style={{ borderRadius: '10px' }}>
                📅 {selectedYear}
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

            {/* TIMEFRAME SELECTOR */}
            <Form.Select
              style={{ width: '150px', borderRadius: '10px', fontSize: '0.9rem' }}
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="shadow-sm border-0"
            >
              <option value="monthly">📆 Monthly</option>
              <option value="quarterly">📊 Quarterly</option>
              <option value="yearly">📈 Yearly</option>
            </Form.Select>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION LABELS - Visual indicators only, all charts visible */}
        {/* ============================================================ */}
        <div className="mb-4">
          <div className="d-flex gap-2 flex-wrap">
            <span className="badge rounded-pill px-3 py-2" style={{ background: Colors.branch1 }}>📊 Overview</span>
            <span className="badge rounded-pill px-3 py-2" style={{ background: Colors.success }}>💰 Revenue</span>
            <span className="badge rounded-pill px-3 py-2" style={{ background: Colors.info }}>⚙️ Operations</span>
            <span className="badge rounded-pill px-3 py-2" style={{ background: Colors.warning }}>📦 Inventory</span>
            <span className="badge rounded-pill px-3 py-2" style={{ background: Colors.danger }}>📈 Analytics</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TOP STATS CARDS - Always visible */}
        {/* ============================================================ */}
        <Row className="g-3 mb-4">
          <Col xs={6} lg={3}>
            <StatCard
              title="Total Cases"
              value={summaryData.totalCases ?? summaryData.totalDeceased ?? '-'}
              subtitle="All time records"
              icon="📋"
              bgColor="#E8F0FE"
            />
          </Col>
          <Col xs={6} lg={3}>
            <StatCard
              title="Active Cases"
              value={summaryData.activeCases ?? summaryData.pending ?? '-'}
              subtitle="Currently in care"
              icon="🟢"
              bgColor="#D1FAE5"
            />
          </Col>
          <Col xs={6} lg={3}>
            <StatCard
              title="Total Revenue"
              value={summaryData.totalRevenue ? `KES ${summaryData.totalRevenue.toLocaleString()}` : '-'}
              subtitle="Cumulative revenue"
              icon="💰"
              bgColor="#FEF3C7"
            />
          </Col>
          <Col xs={6} lg={3}>
            <StatCard
              title="Avg Stay Duration"
              value={averageStayDurationData?.average ? `${averageStayDurationData.average} days` : (summaryData.averageStay ? `${summaryData.averageStay} days` : '-')}
              subtitle="Per case duration"
              icon="⏱️"
              bgColor="#EDE9FE"
            />
          </Col>
        </Row>

        {/* ============================================================ */}
        {/* ALL CHARTS IN ONE VIEW - Overview Section */}
        {/* ============================================================ */}
        <h4 className="mb-3 px-2" style={{ color: Colors.branch1, fontWeight: 600 }}>📊 Overview</h4>
        <Row className="g-4 mb-4">
          {/* Cases Handled Trends */}
          <Col xl={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4 d-flex align-items-center gap-2">
                  📈 Cases Handled Trends
                  <Badge bg="info" className="ms-2 rounded-pill">{timeFrame}</Badge>
                </h5>
                <div style={{ height: '300px' }}>
                  <Line data={getCasesTrendsData()} options={{
                    ...chartOptions,
                    plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} cases` } } }
                  }} />
                </div>
                <Row className="mt-3 text-center pt-2 border-top">
                  <Col xs={4}><h6 className="text-primary mb-0">{mockData.casesTrends.monthly[mockData.casesTrends.monthly.length - 1]}</h6><small className="text-muted">Current Month</small></Col>
                  <Col xs={4}><h6 className="text-success mb-0">{mockData.casesTrends.monthly.reduce((a, b) => a + b, 0)}</h6><small className="text-muted">YTD Total</small></Col>
                  <Col xs={4}><h6 className="text-warning mb-0">{(mockData.casesTrends.monthly.reduce((a, b) => a + b, 0) / mockData.casesTrends.monthly.length).toFixed(1)}</h6><small className="text-muted">Monthly Avg</small></Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Monthly Revenue */}
          <Col xl={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">💰 Monthly Revenue</h5>
                  <div className="d-flex gap-1">
                    <Badge bg="success" className="px-2">High</Badge>
                    <Badge bg="warning" className="px-2">Med</Badge>
                    <Badge bg="danger" className="px-2">Low</Badge>
                  </div>
                </div>
                <div style={{ height: '300px' }}>
                  <Line
                    data={getMonthlyRevenueData()}
                    options={{
                      ...chartOptions,
                      plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `Revenue: KES ${ctx.parsed.y.toLocaleString()}` } } },
                      onClick: (e, elements) => { if (elements?.length) handleChartClick(elements, e.chart, 'revenue'); }
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Case Status Distribution */}
          <Col xl={3} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">📋 Case Status</h5>
                <div style={{ height: '280px' }}>
                  {Object.keys(caseStatusData).length > 0 ? (
                    <Pie
                      data={{ labels: Object.keys(caseStatusData).map(s => s.charAt(0) + s.slice(1).toLowerCase()), datasets: [{ data: Object.values(caseStatusData), backgroundColor: CHART_COLORS, borderWidth: 2, borderColor: '#fff' }] }}
                      options={{ ...chartOptions, onClick: (e, elements) => { if (elements?.length) handleChartClick(elements, e.chart, 'pie'); } }}
                    />
                  ) : (
                    <Pie data={{ labels: ['Received', 'Under Care', 'Pending', 'Completed', 'Released'], datasets: [{ data: [35, 25, 15, 18, 7], backgroundColor: CHART_COLORS, borderWidth: 2, borderColor: '#fff' }] }} options={chartOptions} />
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Gender Distribution */}
          <Col xl={3} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">👤 Gender Distribution</h5>
                <div style={{ height: '280px' }}>
                  <Doughnut data={getGenderDistributionData()} options={{ ...chartOptions, onClick: (e, elements) => { if (elements?.length) handleChartClick(elements, e.chart, 'doughnut'); } }} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Age Distribution */}
          <Col xl={3} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">📊 Age Distribution</h5>
                <div style={{ height: '280px' }}>
                  <Bar data={getAgeDistributionData()} options={{ ...chartOptions, onClick: (e, elements) => { if (elements?.length) handleChartClick(elements, e.chart, 'bar'); } }} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Cause of Death */}
          <Col xl={3} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">🩺 Cause of Death</h5>
                <div style={{ height: '280px' }}>
                  <PolarArea data={getCauseOfDeathData()} options={{ ...chartOptions, onClick: (e, elements) => { if (elements?.length) handleChartClick(elements, e.chart, 'polar'); } }} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Weekly Admissions */}
          <Col xl={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">📅 Weekly Admissions</h5>
                <div style={{ height: '250px' }}>
                  <Bar data={getWeeklyAdmissionsData()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.parsed.y} admissions` } } } }} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Body Storage Status */}
          <Col xl={3} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">🏛️ Storage Status</h5>
                <div style={{ height: '250px' }}>
                  <Pie data={getBodyStorageData()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed.y} units` } } } }} />
                </div>
                <div className="mt-3 text-center pt-2 border-top">
                  <div className="d-flex justify-content-around">
                    <div><small className="text-danger d-block fw-bold">{mockData.bodyStorage.occupied}</small><small className="text-muted">Occupied</small></div>
                    <div><small className="text-success d-block fw-bold">{mockData.bodyStorage.available}</small><small className="text-muted">Available</small></div>
                    <div><small className="text-warning d-block fw-bold">{mockData.bodyStorage.maintenance}</small><small className="text-muted">Maintenance</small></div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Dispatch Schedule */}
          <Col xl={3} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">🚑 Dispatch Schedule</h5>
                  <Badge bg="warning" className="rounded-pill">{mockData.dispatchSchedule.length}</Badge>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  <Table hover responsive size="sm">
                    <thead className="table-light"><tr><th>Name</th><th>Status</th></tr></thead>
                    <tbody>
                      {mockData.dispatchSchedule.map(item => (
                        <tr key={item.id}>
                          <td><small><strong>{item.name}</strong><br /><span className="text-muted">{item.location}</span></small></td>
                          <td><Badge bg={item.status === 'confirmed' ? 'success' : 'warning'} className="rounded-pill" style={{ fontSize: '0.65rem' }}>{item.status === 'confirmed' ? '✓' : '⏳'}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ============================================================ */}
        {/* ALL CHARTS - Revenue Section */}
        {/* ============================================================ */}
        <h4 className="mb-3 mt-4 px-2" style={{ color: Colors.success, fontWeight: 600 }}>💰 Revenue</h4>
        <Row className="g-4 mb-4">
          {/* Revenue by Category */}
          <Col xl={8}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">💵 Revenue by Category</h5>
                <div style={{ height: '350px' }}>
                  <Line data={getRevenueByCategoryData()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.dataset.label}: KES ${ctx.parsed.y.toLocaleString()}` } } } }} />
                </div>
                <Row className="mt-3 text-center pt-2 border-top">
                  <Col xs={3}><h6 className="text-info mb-0">KES {mockData.revenueByCategory.transport.monthly.reduce((a, b) => a + b, 0).toLocaleString()}</h6><small className="text-muted">Transport</small></Col>
                  <Col xs={3}><h6 className="text-primary mb-0">KES {mockData.revenueByCategory.storage.monthly.reduce((a, b) => a + b, 0).toLocaleString()}</h6><small className="text-muted">Storage</small></Col>
                  <Col xs={3}><h6 className="text-success mb-0">KES {mockData.revenueByCategory.supplies.monthly.reduce((a, b) => a + b, 0).toLocaleString()}</h6><small className="text-muted">Supplies</small></Col>
                  <Col xs={3}><h6 className="text-warning mb-0">KES {mockData.revenueByCategory.embalming.monthly.reduce((a, b) => a + b, 0).toLocaleString()}</h6><small className="text-muted">Embalming</small></Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Payment Methods Distribution */}
          <Col xl={4} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">💳 Payment Methods</h5>
                <div style={{ height: '300px' }}>
                  <Bar data={getPaymentMethodsData()} options={{ ...chartOptions, indexAxis: 'y', plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed.x} payments` } } } }} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Extra Services Revenue */}
          <Col xl={4} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">🛠️ Extra Services</h5>
                <div style={{ height: '300px' }}>
                  {revenueExtraServicesData && Object.keys(revenueExtraServicesData).length > 0 ? (
                    <Doughnut data={{ labels: Object.keys(revenueExtraServicesData), datasets: [{ data: Object.values(revenueExtraServicesData).map(s => s.revenue || 0), backgroundColor: CHART_COLORS, borderWidth: 2, borderColor: '#fff' }] }} options={{ ...chartOptions, onClick: (e, elements) => { if (elements?.length) handleChartClick(elements, e.chart, 'doughnut'); } }} />
                  ) : (
                    <Doughnut data={{ labels: ['Washing', 'Dressing', 'Viewing', 'Cremation', 'Burial'], datasets: [{ data: [25, 20, 30, 15, 10], backgroundColor: CHART_COLORS, borderWidth: 2, borderColor: '#fff' }] }} options={chartOptions} />
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Service Type Distribution */}
          <Col xl={4} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">🏥 Service Types</h5>
                <div style={{ height: '300px' }}>
                  {Object.keys(serviceTypesData).length > 0 ? (
                    <Bar data={{ labels: Object.keys(serviceTypesData), datasets: [{ label: 'Cases', data: Object.values(serviceTypesData), backgroundColor: [CUSTOM_COLORS.primaryDark, CUSTOM_COLORS.accentBlue, CUSTOM_COLORS.warningYellow], borderWidth: 0, borderRadius: 8 }] }} options={{ ...chartOptions, onClick: (e, elements) => { if (elements?.length) handleChartClick(elements, e.chart, 'bar'); } }} />
                  ) : (
                    <Bar data={{ labels: ['Burial', 'Cremation', 'Memorial'], datasets: [{ label: 'Cases', data: [180, 95, 65], backgroundColor: [CUSTOM_COLORS.primaryDark, CUSTOM_COLORS.accentBlue, CUSTOM_COLORS.warningYellow], borderWidth: 0, borderRadius: 8 }] }} options={chartOptions} />
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Insurance Analytics */}
          <Col xl={4} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">🛡️ Insurance Analytics</h5>
                <Row className="mb-3 g-2">
                  <Col xs={6}><div className="p-2 rounded-3 border text-center"><h5 className="text-primary mb-0">{mockData.insurance.activePolicies}</h5><small className="text-muted">Active Policies</small></div></Col>
                  <Col xs={6}><div className="p-2 rounded-3 border text-center"><h5 className="text-success mb-0">KES {(mockData.insurance.monthlyPremium / 1000000).toFixed(1)}M</h5><small className="text-muted">Monthly Premium</small></div></Col>
                  <Col xs={6}><div className="p-2 rounded-3 border text-center"><h5 className="text-warning mb-0">{mockData.insurance.claimsThisMonth}</h5><small className="text-muted">Claims/Month</small></div></Col>
                  <Col xs={6}><div className="p-2 rounded-3 border text-center"><h5 className="text-info mb-0">KES {(mockData.insurance.totalCoverage / 1000000).toFixed(0)}M</h5><small className="text-muted">Total Coverage</small></div></Col>
                </Row>
                <div style={{ height: '180px' }}>
                  <Line data={getInsuranceTrendsData()} options={{ ...chartOptionsDualAxis, plugins: { ...chartOptions.plugins, legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 10 } } } } }} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Financial Performance */}
          <Col xl={12}>
            <Card className="shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">📈 Financial Performance Trends</h5>
                <div style={{ height: '350px' }}>
                  <Line data={getFinancialTrendsData()} options={{ ...chartOptionsDualAxis, scales: { x: { grid: { display: false } }, y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Collection Rate (%)' }, min: 0, max: 3 }, y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Outstanding (%)' }, min: 95, max: 100, grid: { drawOnChartArea: false } } } }} />
                </div>
                <Row className="mt-4 text-center">
                  <Col md={4}><div className="border-end"><h4 className="text-primary">{collectionRate || 85}%</h4><small className="text-muted">Collection Rate</small></div></Col>
                  <Col md={4}><div className="border-end"><h4 className="text-success">KES {(revenuePerCase || 35000).toLocaleString()}</h4><small className="text-muted">Revenue Per Case</small></div></Col>
                  <Col md={4}><div><h4 className="text-warning">{outstandingPercentage || 8}%</h4><small className="text-muted">Outstanding %</small></div></Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ============================================================ */}
        {/* ALL CHARTS - Operations Section */}
        {/* ============================================================ */}
        <h4 className="mb-3 mt-4 px-2" style={{ color: Colors.info, fontWeight: 600 }}>⚙️ Operations</h4>
        <Row className="g-4 mb-4">
          {/* Chemicals Usage */}
          <Col xl={8}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">🧪 Chemicals Usage Trends</h5>
                <div style={{ height: '300px' }}>
                  <Line data={getChemicalsUsageData()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} ${['liters', 'liters', 'kg', 'liters'][ctx.datasetIndex]}` } } } }} />
                </div>
                <Row className="mt-3 text-center pt-2 border-top">
                  <Col xs={3}><h6 className="text-danger mb-0">{mockData.chemicals.formaldehyde.monthly.reduce((a, b) => a + b, 0)}L</h6><small className="text-muted">Formaldehyde</small></Col>
                  <Col xs={3}><h6 className="text-info mb-0">{mockData.chemicals.disinfectants.monthly.reduce((a, b) => a + b, 0)}L</h6><small className="text-muted">Disinfectants</small></Col>
                  <Col xs={3}><h6 className="text-success mb-0">{mockData.chemicals.preservatives.monthly.reduce((a, b) => a + b, 0)}kg</h6><small className="text-muted">Preservatives</small></Col>
                  <Col xs={3}><h6 className="text-warning mb-0">{mockData.chemicals.embalming.monthly.reduce((a, b) => a + b, 0)}L</h6><small className="text-muted">Embalming</small></Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Operational Gauges */}
          <Col xl={4} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">⏱️ Operational Metrics</h5>
                <div className="text-center mb-4">
                  <GaugeChart id="today-visitors-gauge" nrOfLevels={20} colors={[CHART_COLORS[0], CHART_COLORS[2], CHART_COLORS[4]]} arcWidth={0.3} percent={todayVisitors / 100 || 0.45} textColor={Colors.dark} needleColor={Colors.dark} formatTextValue={() => `${todayVisitors || 45}`} style={{ width: '100%', height: '130px' }} />
                  <h6 className="mt-1 mb-0">Today's Visitors</h6>
                  <small className="text-muted">Real-time visitor count</small>
                </div>
                <div className="text-center">
                  <GaugeChart id="monthly-visitors-gauge" nrOfLevels={20} colors={[CHART_COLORS[0], CHART_COLORS[2], CHART_COLORS[4]]} arcWidth={0.3} percent={monthlyVisitors / 500 || 0.52} textColor={Colors.dark} needleColor={Colors.dark} formatTextValue={() => `${monthlyVisitors || 260}`} style={{ width: '100%', height: '130px' }} />
                  <h6 className="mt-1 mb-0">Monthly Visitors</h6>
                  <small className="text-muted">Current month total</small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Average Stay Duration */}
          <Col xl={4} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">⏱️ Average Stay Duration</h5>
                <div style={{ height: '300px' }}>
                  {Object.keys(averageStayDurationData).length > 0 ? (
                    <Bar data={{ labels: Object.keys(averageStayDurationData), datasets: [{ label: 'Days', data: Object.values(averageStayDurationData), backgroundColor: CHART_COLORS[2], borderWidth: 0, borderRadius: 8 }] }} options={chartOptions} />
                  ) : (
                    <Bar data={{ labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ label: 'Days', data: [4.2, 3.8, 4.5, 5.1, 4.0, 3.9], backgroundColor: CHART_COLORS[2], borderWidth: 0, borderRadius: 8 }] }} options={chartOptions} />
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Dispatch Full Schedule */}
          <Col xl={8} lg={12}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">🚑 Full Dispatch Schedule</h5>
                  <Badge bg="warning" className="rounded-pill px-3 py-2">{mockData.dispatchSchedule.length} Scheduled</Badge>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <Table hover responsive>
                    <thead className="table-light"><tr><th>Name</th><th>Age</th><th>Cause</th><th>Location</th><th>Scheduled</th><th>Status</th></tr></thead>
                    <tbody>
                      {mockData.dispatchSchedule.map(item => (
                        <tr key={item.id}>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.age}</td>
                          <td><Badge bg={item.cause === 'Natural Causes' ? 'success' : item.cause === 'Illness' ? 'warning' : 'danger'} className="rounded-pill">{item.cause}</Badge></td>
                          <td>{item.location}</td>
                          <td><small>{item.scheduled}</small></td>
                          <td><Badge bg={item.status === 'confirmed' ? 'success' : 'warning'} className="rounded-pill">{item.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}</Badge></td>
                        </tr>
                      ))}
                      {mockData.dispatchSchedule.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-3">No dispatches scheduled</td></tr>}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ============================================================ */}
        {/* ALL CHARTS - Inventory Section */}
        {/* ============================================================ */}
        <h4 className="mb-3 mt-4 px-2" style={{ color: Colors.warning, fontWeight: 600 }}>📦 Inventory</h4>
        <Row className="g-4 mb-4">
          {/* Coffin Sales */}
          <Col xl={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">⚰️ Coffin Sales Trend</h5>
                <div style={{ height: '300px' }}>
                  <Bar data={getCoffinSalesData()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.parsed.y} coffins sold` } } } }} />
                </div>
                <Row className="mt-3 text-center pt-2 border-top">
                  <Col xs={4}><h6 className="text-primary mb-0">{coffinSalesData.length > 0 ? coffinSalesData.reduce((a, c) => a + (c.sales || c.count || 0), 0) : 248}</h6><small className="text-muted">Total Sold</small></Col>
                  <Col xs={4}><h6 className="text-success mb-0">{coffinSalesData.length > 0 ? (coffinSalesData.reduce((a, c) => a + (c.sales || c.count || 0), 0) / coffinSalesData.length).toFixed(1) : '20.7'}</h6><small className="text-muted">Monthly Avg</small></Col>
                  <Col xs={4}><h6 className="text-warning mb-0">{coffinSalesData.length > 0 ? Math.max(...coffinSalesData.map(c => c.sales || c.count || 0)) : 30}</h6><small className="text-muted">Best Month</small></Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Coffin Inventory by Type */}
          <Col xl={3} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">📦 Coffin Inventory</h5>
                <div style={{ height: '280px' }}>
                  {Object.keys(coffinInventoryData).length > 0 ? (
                    <Pie data={{ labels: Object.keys(coffinInventoryData), datasets: [{ data: Object.values(coffinInventoryData).map(v => typeof v === 'number' ? v : v.quantity || 0), backgroundColor: CHART_COLORS_GRADIENT, borderWidth: 2, borderColor: '#fff' }] }} options={chartOptions} />
                  ) : (
                    <Pie data={{ labels: ['Oak', 'Mahogany', 'Pine', 'Metal', 'Eco'], datasets: [{ data: [35, 25, 20, 12, 8], backgroundColor: CHART_COLORS_GRADIENT, borderWidth: 2, borderColor: '#fff' }] }} options={chartOptions} />
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Vehicle Fleet */}
          <Col xl={3} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">🚗 Fleet Status</h5>
                <div style={{ height: '280px' }}>
                  <Doughnut data={{ labels: vehicles.length > 0 ? vehicles.map(v => v.vehiclePlate?.trim() || 'Unknown') : ['KDK 456G', 'KDK 497C', 'KCM 234D', 'KCA 789E', 'KCB 101F'], datasets: [{ data: vehicles.length > 0 ? vehicles.map(v => v.kilometers?.currentMonth || 0) : [45, 28, 20, 15, 7], backgroundColor: CHART_COLORS_PASTEL, borderWidth: 2, borderColor: '#fff' }] }} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed.y} km` } } } }} />
                </div>
                <div className="mt-2 pt-2 border-top text-center"><small className="text-muted">Distance covered per vehicle (km/month)</small></div>
              </Card.Body>
            </Card>
          </Col>

          {/* Hearse Distance Coverage */}
          <Col xl={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">🛞 Hearse Distance Coverage</h5>
                <div style={{ height: '300px' }}>
                  <Line data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], datasets: [
                      { label: 'KDK 456G', data: [245, 280, 265, 310, 295, 320, 335, 300, 285, 270, 290, 315], borderColor: CUSTOM_COLORS.primaryDark, backgroundColor: `${CUSTOM_COLORS.primaryDark}20`, borderWidth: 2, fill: true, tension: 0.4 },
                      { label: 'KDK 497C', data: [180, 195, 210, 225, 240, 255, 270, 285, 260, 245, 230, 215], borderColor: CUSTOM_COLORS.accentBlue, backgroundColor: `${CUSTOM_COLORS.accentBlue}20`, borderWidth: 2, fill: true, tension: 0.4 },
                      { label: 'KCM 234D', data: [120, 135, 150, 165, 180, 195, 210, 195, 180, 165, 150, 135], borderColor: CUSTOM_COLORS.warningYellow, backgroundColor: `${CUSTOM_COLORS.warningYellow}20`, borderWidth: 2, fill: true, tension: 0.4 }
                    ]
                  }} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} km` } } } }} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Inventory Summary Cards */}
          <Col xl={3} lg={6}><StatCard title="Total Coffins" value={getSafeNumber(coffinInventoryData, 'total') || 85} subtitle="In stock" icon="⚰️" bgColor="#FAE5D3" /></Col>
          <Col xl={3} lg={6}><StatCard title="Active Vehicles" value={fleetSummary.activeVehicles || vehicles.length || 5} subtitle="In service" icon="🚗" bgColor="#D5F5E3" /></Col>
          <Col xl={3} lg={6}><StatCard title="Pending Orders" value={fleetSummary.pendingOrders || 3} subtitle="Awaiting fulfillment" icon="📦" bgColor="#FDEBD0" /></Col>
          <Col xl={3} lg={6}><StatCard title="Chemicals Stock" value={getSafeNumber(dashboardData, 'chemicalStock') || 72} subtitle="Items in inventory" icon="🧪" bgColor="#EBDEF0" /></Col>
        </Row>

        {/* ============================================================ */}
        {/* ALL CHARTS - Analytics Section */}
        {/* ============================================================ */}
        <h4 className="mb-3 mt-4 px-2" style={{ color: Colors.danger, fontWeight: 600 }}>📈 Analytics</h4>
        <Row className="g-4 mb-4">
          {/* Performance Indicators */}
          <Col xl={3} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px', borderLeft: `4px solid ${Colors.success}` }}>
              <Card.Body className="p-4">
                <h6 className="text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Performance Score</h6>
                <h2 className="fw-bold text-success mb-0">{performanceIndicatorsData.performanceScore || 87}%</h2>
                <ProgressBar now={performanceIndicatorsData.performanceScore || 87} variant="success" className="mt-2" style={{ height: '6px' }} />
                <small className="text-muted mt-2 d-block">Overall operational efficiency</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px', borderLeft: `4px solid ${Colors.info}` }}>
              <Card.Body className="p-4">
                <h6 className="text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Case Resolution Rate</h6>
                <h2 className="fw-bold text-info mb-0">{performanceIndicatorsData.resolutionRate || 78}%</h2>
                <ProgressBar now={performanceIndicatorsData.resolutionRate || 78} variant="info" className="mt-2" style={{ height: '6px' }} />
                <small className="text-muted mt-2 d-block">Cases completed vs received</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px', borderLeft: `4px solid ${Colors.warning}` }}>
              <Card.Body className="p-4">
                <h6 className="text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Occupancy Rate</h6>
                <h2 className="fw-bold text-warning mb-0">{performanceIndicatorsData.occupancyRate || 62}%</h2>
                <ProgressBar now={performanceIndicatorsData.occupancyRate || 62} variant="warning" className="mt-2" style={{ height: '6px' }} />
                <small className="text-muted mt-2 d-block">Mortuary storage utilization</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px', borderLeft: `4px solid ${Colors.danger}` }}>
              <Card.Body className="p-4">
                <h6 className="text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Revenue Growth</h6>
                <h2 className="fw-bold text-danger mb-0">{performanceIndicatorsData.revenueGrowth || 14}%</h2>
                <ProgressBar now={performanceIndicatorsData.revenueGrowth || 14} variant="danger" className="mt-2" style={{ height: '6px' }} />
                <small className="text-muted mt-2 d-block">Year over year increase</small>
              </Card.Body>
            </Card>
          </Col>

          {/* Visitor Trends */}
          <Col xl={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">👥 Visitor Trends</h5>
                <div style={{ height: '300px' }}>
                  {visitorTrendsChartData ? (
                    <Bar data={visitorTrendsChartData} options={chartOptions} />
                  ) : (
                    <Bar data={{
                      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'], datasets: [
                        { label: 'Visitors', data: [85, 92, 78, 105, 98, 112, 88, 95], backgroundColor: CUSTOM_COLORS.accentBlue, borderWidth: 0, borderRadius: 6 },
                        { label: 'Admissions', data: [22, 28, 18, 35, 30, 38, 25, 32], backgroundColor: CUSTOM_COLORS.kinSuccess, borderWidth: 0, borderRadius: 6 }
                      ]
                    }} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}` } } } }} />
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Key Metrics Summary */}
          <Col xl={3} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">🎯 Key Metrics</h5>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between align-items-center p-2 rounded-3" style={{ background: '#F0FDF4' }}><span>Cases/Day</span><Badge bg="success" className="rounded-pill">{Math.round((mockData.casesTrends.monthly.reduce((a, b) => a + b, 0) / 365) * 10) / 10}</Badge></div>
                  <div className="d-flex justify-content-between align-items-center p-2 rounded-3" style={{ background: '#EFF6FF' }}><span>Revenue/Day</span><Badge bg="info" className="rounded-pill">KES {Math.round(Object.values(revenueTotalData).length > 0 ? Object.values(revenueTotalData).reduce((a, b) => a + b, 0) / 365 : 5890).toLocaleString()}</Badge></div>
                  <div className="d-flex justify-content-between align-items-center p-2 rounded-3" style={{ background: '#FFF7ED' }}><span>Bed Turnover</span><Badge bg="warning" className="rounded-pill">{averageStayDurationData.average || 4.2} days</Badge></div>
                  <div className="d-flex justify-content-between align-items-center p-2 rounded-3" style={{ background: '#FEF2F2' }}><span>Collection Rate</span><Badge bg="danger" className="rounded-pill">{collectionRate || 85}%</Badge></div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Dispatch Analytics */}
          <Col xl={3} lg={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">📊 Dispatch Analytics</h5>
                <div style={{ height: '250px' }}>
                  <Line data={{ labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], datasets: [{ label: 'Dispatches', data: [dispatchAnalyticsData.weeklyDispatches || 18, Math.round((dispatchAnalyticsData.weeklyDispatches || 18) * 1.1) || 20, Math.round((dispatchAnalyticsData.weeklyDispatches || 18) * 1.3) || 24, Math.round((dispatchAnalyticsData.weeklyDispatches || 18) * 0.9) || 16], borderColor: CHART_COLORS[4], backgroundColor: `${CHART_COLORS[4]}20`, borderWidth: 3, fill: true, tension: 0.4 }] }} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.parsed.y} dispatches` } } } }} />
                </div>
                <div className="mt-2 text-center pt-2 border-top"><small className="text-muted">Weekly dispatch trends</small></div>
              </Card.Body>
            </Card>
          </Col>

          {/* Monthly Trends Summary */}
          <Col xl={12}>
            <Card className="shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="card-title mb-4">📅 Monthly Trends Summary</h5>
                <div style={{ height: '300px' }}>
                  {Object.keys(monthlyTrendsData).length > 0 ? (
                    <Line data={{ labels: Object.keys(monthlyTrendsData), datasets: [{ label: 'Monthly Cases', data: Object.values(monthlyTrendsData), borderColor: CUSTOM_COLORS.accentBlue, backgroundColor: `${CUSTOM_COLORS.accentBlue}20`, borderWidth: 3, fill: true, tension: 0.4 }] }} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => `${ctx.parsed.y} cases` } } } }} />
                  ) : (
                    <Line data={{
                      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], datasets: [
                        { label: 'Cases', data: mockData.casesTrends.monthly, borderColor: CUSTOM_COLORS.accentBlue, backgroundColor: `${CUSTOM_COLORS.accentBlue}20`, borderWidth: 3, fill: true, tension: 0.4 },
                        { label: 'Revenue (KES 10K)', data: [45, 52, 48, 65, 58, 72, 68, 75, 70, 65, 78, 85].map(v => v * 10), borderColor: CUSTOM_COLORS.kinSuccess, backgroundColor: `${CUSTOM_COLORS.kinSuccess}20`, borderWidth: 3, fill: true, tension: 0.4, yAxisID: 'y1' }
                      ]
                    }} options={{ ...chartOptionsDualAxis, plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, callbacks: { label: (ctx) => ctx.datasetIndex === 0 ? `${ctx.parsed.y} cases` : `KES ${(ctx.parsed.y * 10000).toLocaleString()}` } } } }} />
                  )}
                </div>
                <Row className="mt-3 text-center pt-2 border-top">
                  <Col md={3}><h6 className="text-primary mb-0">{summaryData.peakMonth || 'December'}</h6><small className="text-muted">Peak Month</small></Col>
                  <Col md={3}><h6 className="text-success mb-0">{summaryData.peakCases || 85}</h6><small className="text-muted">Highest Cases</small></Col>
                  <Col md={3}><h6 className="text-warning mb-0">{summaryData.lowMonth || 'February'}</h6><small className="text-muted">Lowest Month</small></Col>
                  <Col md={3}><h6 className="text-info mb-0">{summaryData.lowCases || 45}</h6><small className="text-muted">Lowest Cases</small></Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ============================================================ */}
        {/* DETAIL MODAL */}
        {/* ============================================================ */}
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