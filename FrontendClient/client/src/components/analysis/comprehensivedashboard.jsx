// src/components/analysis/comprehensivedashboard.jsx
// Professional Dashboard - Fetches from working individual analytics endpoints
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container, Row, Col, Card, Spinner, Alert, Button, Badge, Dropdown
} from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler, RadialLinearScale
} from "chart.js";
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
import {
  TrendingUp, Zap, Users, ShoppingCart, Truck, AlertTriangle,
  Clock, CheckCircle, Activity, FlaskConical, Box, MapPin, RotateCw, Calendar
} from "lucide-react";
import { getTenantHeaders } from "../../api/endpoints";
import env from "../../config/env";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler, RadialLinearScale
);

const COLORS = {
  primary: "#1e3a8a", primaryLight: "#3b82f6",
  secondary: "#64748b", success: "#10b981", successLight: "#d1fae5",
  warning: "#f59e0b", warningLight: "#fef3c7", danger: "#ef4444",
  dangerLight: "#fee2e2", info: "#06b6d4", infoLight: "#cffafe",
  purple: "#8b5cf6", purpleLight: "#ede9fe", dark: "#1f2937",
  gray: "#6b7280", light: "#f3f4f6", white: "#ffffff", border: "#e5e7eb",
  chart1: "#3b82f6", chart2: "#10b981", chart3: "#f59e0b", chart4: "#ef4444",
  chart5: "#8b5cf6", chart6: "#06b6d4"
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

const ComprehensiveDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [data, setData] = useState(null);
  const lastFetchRef = useRef(0);

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 15, font: { size: 11 }, color: COLORS.gray } },
      tooltip: { backgroundColor: COLORS.dark, titleColor: COLORS.white, bodyColor: COLORS.white, cornerRadius: 8, padding: 12 }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: COLORS.gray } },
      y: { grid: { color: COLORS.light }, ticks: { color: COLORS.gray }, beginAtZero: true }
    }
  };

  const getTenantSlug = () => localStorage.getItem("tenantSlug") || "";

  const fetchBranches = useCallback(async () => {
    try {
      const tenantSlug = getTenantSlug();
      const headers = getTenantHeaders();
      const url = `${env.FULL_API_URL}/tenant/${tenantSlug}/branches`;
      console.log("Fetching branches from:", url);
      const res = await fetch(url, { headers });
      if (res.ok) {
        const result = await res.json();
        const branchesArray = Array.isArray(result?.data) ? result.data : [];
        setBranches(branchesArray);
        if (branchesArray.length > 0 && !selectedBranch) {
          setSelectedBranch(branchesArray[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
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

      console.log("Fetching analytics data for branch:", branchId);

      const endpoints = [
        `/analytics/deceased/count`,
        `/analytics/deceased/status`,
        `/analytics/deceased/trends`,
        `/analytics/bookings/counts`,
        `/analytics/hearse/fleet`,
        `/analytics/coffins/inventory`,
        `/analytics/coffins/sales`,
        `/analytics/chemicals/stock`,
        `/analytics/chemicals/trends`,
        `/analytics/workshop/summary`,
        `/analytics/workshop/production`
      ];

      const results = await Promise.allSettled(
        endpoints.map(endpoint =>
          fetch(`${env.FULL_API_URL}${endpoint}`, { headers: branchHeaders })
            .then(res => res.json())
            .catch(() => ({}))
        )
      );

      const [
        deceasedCount, caseStatus, deceasedTrends,
        bookingCounts, hearseFleet,
        coffinInventory, coffinSales,
        chemicalStock, chemicalTrends,
        workshopSummary, workshopProduction
      ] = results;

      const getValue = (result) => result.status === "fulfilled" ? result.value?.data || {} : {};

      setData({
        deceased: getValue(deceasedCount),
        caseStatus: getValue(caseStatus),
        deceasedTrends: getValue(deceasedTrends),
        bookings: getValue(bookingCounts),
        fleet: getValue(hearseFleet),
        coffins: getValue(coffinInventory),
        coffinSales: getValue(coffinSales),
        chemicals: getValue(chemicalStock),
        chemicalTrends: getValue(chemicalTrends),
        workshop: getValue(workshopSummary),
        workshipProduction: getValue(workshopProduction)
      });

      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [selectedBranch]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    if (selectedBranch) {
      setLoading(true);
      fetchDashboardData();
    }
  }, [selectedBranch]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedBranch) fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const dashboardData = data || {};
  const deceased = Array.isArray(dashboardData.deceased) ? dashboardData.deceased[0] || {} : dashboardData.deceased || {};
  const bookings = dashboardData.bookings || {};
  const fleet = dashboardData.fleet || {};
  const coffins = dashboardData.coffins || {};
  const workshop = dashboardData.workshop || {};
  const caseStatus = (Array.isArray(dashboardData.caseStatus) ? dashboardData.caseStatus : []);
  const deceasedTrends = (Array.isArray(dashboardData.deceasedTrends) ? dashboardData.deceasedTrends : []);
  const coffinSalesData = (Array.isArray(dashboardData.coffinSales) ? dashboardData.coffinSales : []);
  const chemicalData = (Array.isArray(dashboardData.chemicals) ? dashboardData.chemicals : []);

  return (
    <Container fluid className="py-4" style={{ background: COLORS.light, minHeight: "100vh" }}>
      {/* HEADER */}
      <Card className="border-0 shadow-sm mb-4" style={{
        borderRadius: "12px",
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`
      }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="text-white fw-bold mb-1">Mortuary Dashboard</h2>
              <p className="text-white-50 mb-0 small">Real-time analytics & operations</p>
            </div>
            <div className="d-flex gap-2">
              <Dropdown>
                <Dropdown.Toggle variant="light" size="sm" className="d-flex align-items-center gap-2">
                  <MapPin size={18} />
                  {selectedBranch?.name || "Select Branch"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {branches.map(b => (
                    <Dropdown.Item key={b.id} onClick={() => setSelectedBranch(b)} active={selectedBranch?.id === b.id}>
                      {b.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <Button variant="light" size="sm" onClick={fetchDashboardData} disabled={refreshing} className="d-flex align-items-center gap-2">
                <RotateCw size={18} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* KEY METRICS */}
      <Row className="g-3 mb-4">
        <Col xs={6} lg={3}><StatCard title="Total Deceased" value={deceased.total || "-"} icon={Users} color="primary" /></Col>
        <Col xs={6} lg={3}><StatCard title="Active Cases" value={deceased.active || "-"} icon={CheckCircle} color="success" /></Col>
        <Col xs={6} lg={3}><StatCard title="This Month" value={deceased.this_month || "-"} icon={Calendar} color="warning" /></Col>
        <Col xs={6} lg={3}><StatCard title="This Week" value={deceased.this_week || "-"} icon={TrendingUp} color="info" /></Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col xs={6} md={3}><StatCard title="Bookings (Week)" value={bookings.thisWeek || "0"} icon={Truck} color="purple" /></Col>
        <Col xs={6} md={3}><StatCard title="Fleet Available" value={`${fleet.available || 0}/${fleet.total || 0}`} icon={Truck} color="success" /></Col>
        <Col xs={6} md={3}><StatCard title="Coffin Stock" value={coffins.totalStock || "0"} icon={Box} color="warning" /></Col>
        <Col xs={6} md={3}><StatCard title="Workshop Orders" value={workshop.total_orders || "0"} icon={Activity} color="primary" /></Col>
      </Row>

      {/* DECEASED SECTION */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <Card.Body className="p-4">
          <SectionHeader title="Deceased Management" icon={Users} color={COLORS.primary} />
          <Row className="g-4">
            <Col lg={6}>
              <ChartCard title="Cases (12 Months)" icon={TrendingUp} color={COLORS.primary} height="280px">
                <Line data={{
                  labels: deceasedTrends.map(d => d.month_label || "") || [],
                  datasets: [{
                    label: "Cases",
                    data: deceasedTrends.map(d => d.count || 0) || [],
                    borderColor: COLORS.chart1,
                    backgroundColor: COLORS.chart1 + "20",
                    borderWidth: 3, fill: true, tension: 0.4
                  }]
                }} options={chartOptions} />
              </ChartCard>
            </Col>
            <Col lg={6}>
              <ChartCard title="Case Status" icon={CheckCircle} color={COLORS.info} height="280px">
                <Pie data={{
                  labels: caseStatus.map(c => c.status || "Unknown") || [],
                  datasets: [{
                    data: caseStatus.map(c => c.count || 0) || [],
                    backgroundColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5]
                  }]
                }} options={chartOptions} />
              </ChartCard>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* BOOKINGS SECTION - LINE CHART WITH CHARGES */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <Card.Body className="p-4">
          <SectionHeader title="Hearse Bookings & Charges" icon={Truck} color={COLORS.purple} />
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
                <small className="text-muted">In Progress</small>
                <h5 className="fw-bold mb-0" style={{ color: "#92400e" }}>{bookings.booked || 0}</h5>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-3 rounded-3" style={{ backgroundColor: COLORS.dangerLight }}>
                <small className="text-muted">Fleet</small>
                <h5 className="fw-bold mb-0" style={{ color: COLORS.danger }}>{fleet.available || 0} ready</h5>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* INVENTORY SECTION */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <Card.Body className="p-4">
          <SectionHeader title="Inventory Management" icon={Box} color={COLORS.warning} />
          <Row className="g-4">
            <Col lg={6}>
              <ChartCard title="Coffin Sales" icon={ShoppingCart} color={COLORS.warning} height="280px">
                <Bar data={{
                  labels: coffinSalesData.map(c => c.type || "") || [],
                  datasets: [{
                    label: "Sold",
                    data: coffinSalesData.map(c => c.sold || 0) || [],
                    backgroundColor: COLORS.chart3
                  }]
                }} options={chartOptions} />
              </ChartCard>
            </Col>
            <Col lg={6}>
              <ChartCard title="Chemical Usage" icon={FlaskConical} color={COLORS.danger} height="280px">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                  {chemicalData.slice(0, 4).map((chem, i) => (
                    <div key={i} className="text-center p-3 rounded-3" style={{ backgroundColor: COLORS.dangerLight }}>
                      <small className="text-muted d-block">{chem.chemical}</small>
                      <h6 className="fw-bold mb-0" style={{ color: COLORS.danger }}>{chem.totalUsed} {chem.unit}</h6>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* WORKSHOP SECTION */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <Card.Body className="p-4">
          <SectionHeader title="Workshop Production" icon={Activity} color={COLORS.purple} />
          <Row className="g-3">
            <Col xs={6} md={3}>
              <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.purpleLight }}>
                <h5 className="fw-bold mb-0" style={{ color: COLORS.purple }}>{workshop.total_orders || 0}</h5>
                <small className="text-muted">Total Orders</small>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.successLight }}>
                <h5 className="fw-bold mb-0" style={{ color: COLORS.success }}>{workshop.completed || 0}</h5>
                <small className="text-muted">Completed</small>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.warningLight }}>
                <h5 className="fw-bold mb-0" style={{ color: "#92400e" }}>{workshop.pending || 0}</h5>
                <small className="text-muted">Pending</small>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-3 rounded-3 text-center" style={{ backgroundColor: COLORS.infoLight }}>
                <h5 className="fw-bold mb-0" style={{ color: COLORS.info }}>0</h5>
                <small className="text-muted">Workers</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ComprehensiveDashboard;
