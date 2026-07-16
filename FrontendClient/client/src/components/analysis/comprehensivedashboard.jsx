import React, { useState, useEffect, useCallback, useRef } from "react";
import { Container, Row, Col, Card, Spinner, Button, Dropdown, Form, Badge } from "react-bootstrap";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler, RadialLinearScale
} from "chart.js";
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
import {
  TrendingUp, Users, ShoppingCart, Truck, CheckCircle, Activity, FlaskConical,
  Box, MapPin, RotateCw, Calendar, Cpu, GitMerge, FileText
} from "lucide-react";
import { getTenantHeaders } from "../../api/endpoints";
import env from "../../config/env";
import './comprehensiveDashboard.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler, RadialLinearScale
);

// Expanded colors array for N branches
const BRANCH_COLORS = [
  "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"
];
const getBranchColor = (index) => BRANCH_COLORS[index % BRANCH_COLORS.length];
const getBranchLightColor = (index) => {
  const c = getBranchColor(index);
  return `${c}33`; // 20% opacity hex
};

const COLORS = {
  primary: "#1e3a8a", dark: "#1f2937", gray: "#6b7280", border: "#e5e7eb",
  white: "#ffffff",
  success: "#10b981", successLight: "#d1fae5",
  warning: "#f59e0b", warningLight: "#fef3c7",
  danger: "#ef4444", dangerLight: "#fee2e2",
  info: "#06b6d4", infoLight: "#cffafe",
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className="h-100 border-0 shadow-sm cd-stat-card">
    <Card.Body className="p-3">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="cd-icon-box" style={{ background: COLORS[`${color}Light`], color: COLORS[color] }}>
          <Icon size={20} />
        </div>
        <span className="fw-bold" style={{ color: COLORS.dark, fontSize: "1.5rem" }}>{value}</span>
      </div>
      <small className="text-muted d-block">{title}</small>
    </Card.Body>
  </Card>
);

const ChartCard = ({ title, children, height = "300px" }) => (
  <Card className="h-100 border-0 shadow-sm cd-chart-card">
    <Card.Body className="p-4">
      <h6 className="mb-3 fw-semibold text-muted" style={{ fontSize: "0.9rem" }}>{title}</h6>
      <div style={{ height, position: "relative" }}>{children}</div>
    </Card.Body>
  </Card>
);

const BatteryGauge = ({ label, percentage, color }) => (
  <div className="cd-battery-container mb-3">
    <div className="cd-battery-label">{label}</div>
    <div className="cd-battery-outer">
      <div className="cd-battery-inner" style={{ width: `${Math.min(100, Math.max(0, percentage))}%`, backgroundColor: color }}></div>
    </div>
    <div className="cd-battery-pct">{percentage}%</div>
  </div>
);

const ComprehensiveDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [branches, setBranches] = useState([]);
  
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null); // standard mode
  const [selectedCompareBranches, setSelectedCompareBranches] = useState([]); // Array of branch IDs
  
  const [standardData, setStandardData] = useState(null);
  const [compareData, setCompareData] = useState(null);

  const lastFetchRef = useRef(0);
  const getTenantSlug = () => localStorage.getItem("tenantSlug") || "";

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 15, font: { size: 11 }, color: COLORS.gray } },
      tooltip: { backgroundColor: COLORS.dark, titleColor: COLORS.white, bodyColor: COLORS.white, cornerRadius: 8, padding: 12 }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: COLORS.gray } },
      y: { grid: { color: COLORS.border, borderDash: [5, 5] }, ticks: { color: COLORS.gray }, beginAtZero: true }
    }
  };

  const noGridOptions = { ...chartOptions, scales: { x: { display: false }, y: { display: false } } };

  const fetchBranches = useCallback(async () => {
    try {
      const headers = getTenantHeaders();
      const res = await fetch(`${env.FULL_API_URL}/tenant/${getTenantSlug()}/branches`, { headers });
      if (res.ok) {
        const result = await res.json();
        const b = Array.isArray(result?.data) ? result.data : [];
        setBranches(b);
        if (b.length > 0) {
          setSelectedBranch(b[0]);
          setSelectedCompareBranches([b[0].id, b[1]?.id || b[0].id]);
        }
      }
    } catch (err) { console.error(err); }
  }, []);

  const fetchStandardData = async () => {
    try {
      setRefreshing(true);
      const headers = getTenantHeaders();
      const branchId = selectedBranch?.id || selectedBranch?.branch_id;
      const bHeaders = branchId ? { ...headers, "x-branch-id": branchId } : headers;

      const endpoints = [
        `/analytics/deceased/count`, `/analytics/deceased/trends`,
        `/analytics/bookings/counts`, `/analytics/hearse/fleet`,
        `/analytics/coffins/inventory`, `/analytics/workshop/summary`
      ];

      const results = await Promise.allSettled(endpoints.map(e => fetch(`${env.FULL_API_URL}${e}`, { headers: bHeaders }).then(res => res.json())));
      const getValue = (result) => result.status === "fulfilled" ? result.value?.data || {} : {};
      
      setStandardData({
        deceased: getValue(results[0]), deceasedTrends: results[1].status === 'fulfilled' ? results[1].value?.data || [] : [],
        bookings: getValue(results[2]), fleet: getValue(results[3]), coffins: getValue(results[4]), workshop: getValue(results[5])
      });
    } catch (err) { console.error(err); }
    finally { setRefreshing(false); setLoading(false); }
  };

  const fetchCompareData = async () => {
    if (selectedCompareBranches.length < 2) return;
    try {
      setRefreshing(true);
      const headers = getTenantHeaders();
      const ids = selectedCompareBranches.join(',');
      const res = await fetch(`${env.FULL_API_URL}/analytics/dashboard/compare?branches=${ids}`, { headers });
      if (res.ok) {
        const result = await res.json();
        setCompareData(result.data);
      }
    } catch (err) { console.error(err); }
    finally { setRefreshing(false); setLoading(false); }
  };

  const loadData = useCallback(() => {
    const now = Date.now();
    if (now - lastFetchRef.current < 2000) return;
    lastFetchRef.current = now;
    if (isCompareMode) fetchCompareData(); else fetchStandardData();
  }, [isCompareMode, selectedBranch, selectedCompareBranches]);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);
  useEffect(() => { if (branches.length > 0) loadData(); }, [isCompareMode, selectedBranch, selectedCompareBranches, branches, loadData]);

  const toggleCompareBranch = (branchId) => {
    if (selectedCompareBranches.includes(branchId)) {
      if (selectedCompareBranches.length > 2) {
        setSelectedCompareBranches(prev => prev.filter(id => id !== branchId));
      }
    } else {
      setSelectedCompareBranches(prev => [...prev, branchId]);
    }
  };

  if (loading) return (
    <div className="cd-loader-container"><Spinner animation="grow" variant="primary" /><h5 className="mt-3">Loading Analytics...</h5></div>
  );

  const renderStandardDashboard = () => {
    const data = standardData || {};
    const dec = Array.isArray(data.deceased) ? data.deceased[0] || {} : data.deceased || {};
    const trends = data.deceasedTrends || [];
    
    return (
      <>
        <Row className="g-3 mb-4">
          <Col xs={6} lg={3}><StatCard title="Total Deceased" value={dec.total || 0} icon={Users} color="primary" /></Col>
          <Col xs={6} lg={3}><StatCard title="Bookings (Week)" value={data.bookings?.thisWeek || 0} icon={Calendar} color="info" /></Col>
          <Col xs={6} lg={3}><StatCard title="Active Hearses" value={data.fleet?.available || 0} icon={Truck} color="success" /></Col>
          <Col xs={6} lg={3}><StatCard title="Coffins In Stock" value={data.coffins?.totalStock || 0} icon={Box} color="warning" /></Col>
        </Row>
        <Row className="g-4 mb-4">
          <Col lg={8}>
            <ChartCard title="Deceased Intake (12 Months)">
              <Line data={{
                labels: trends.map(t => t.month_label || t.month || ''),
                datasets: [{ label: "Cases", data: trends.map(t => t.count || 0), borderColor: COLORS.primary, backgroundColor: COLORS.primary + "20", fill: true, tension: 0.4 }]
              }} options={chartOptions} />
            </ChartCard>
          </Col>
          <Col lg={4}>
            <ChartCard title="Coffin Status">
              <Doughnut data={{
                labels: ['Available', 'Reserved', 'In-Use'],
                datasets: [{ data: [data.coffins?.totalStock || 0, 0, 0], backgroundColor: [COLORS.success, COLORS.warning, COLORS.danger] }]
              }} options={noGridOptions} />
            </ChartCard>
          </Col>
        </Row>
      </>
    );
  };

  const renderCompareDashboard = () => {
    if (!compareData || !compareData.branches) return <div>Select branches to compare.</div>;
    const { branches: compBranches, insights } = compareData;
    
    const activeIds = Object.keys(compBranches);
    if (activeIds.length === 0) return <div>No data found for selected branches.</div>;

    const bNames = activeIds.map(id => branches.find(b => String(b.id) === id || String(b.branch_id) === id)?.name || `Branch ${id}`);

    // Compile Line Chart Data (Deceased)
    const allMonthsSet = new Set();
    activeIds.forEach(id => { (compBranches[id].deceased.monthly || []).forEach(m => allMonthsSet.add(m.month)); });
    const allMonths = [...allMonthsSet].sort();

    const lineDatasets = activeIds.map((id, index) => {
      const bMonthly = compBranches[id].deceased.monthly || [];
      const data = allMonths.map(m => {
        const f = bMonthly.find(x => x.month === m);
        return f ? f.count : 0;
      });
      return {
        label: bNames[index], data,
        borderColor: getBranchColor(index), backgroundColor: getBranchLightColor(index),
        borderWidth: 3, fill: true, tension: 0.4
      };
    });

    // Compile Age Group Bar Data
    const ageGroups = ['0-18', '19-35', '36-50', '51-65', '65+'];
    const ageDatasets = activeIds.map((id, index) => {
      const data = ageGroups.map(a => compBranches[id].deceased.byAgeGroup[a] || 0);
      return { label: bNames[index], data, backgroundColor: getBranchColor(index) };
    });

    // Compile Chemicals Data
    const chemDatasets = activeIds.map((id, index) => {
      return {
        label: bNames[index],
        data: [compBranches[id].chemicals.formaldehyde || 0, compBranches[id].chemicals.disinfectant || 0],
        backgroundColor: getBranchColor(index),
        barPercentage: 0.6
      };
    });

    return (
      <div className="cd-compare-wrapper">
        <div className="cd-vs-banner mb-4">
          <span className="fw-bold fs-5 text-white">Comparing {activeIds.length} Branches</span>
        </div>

        {/* CHARTS ROW 1 */}
        <Row className="g-4 mb-4">
          <Col lg={8}>
            <ChartCard title="DECEASED TRENDS (12 Months)">
              <Line data={{ labels: allMonths.length > 0 ? allMonths : ['Jan', 'Feb', 'Mar'], datasets: lineDatasets }} options={chartOptions} />
            </ChartCard>
          </Col>
          <Col lg={4}>
            <Card className="h-100 border-0 shadow-sm cd-ai-card">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Cpu size={20} className="cd-ai-icon" />
                  <h6 className="mb-0 fw-bold cd-ai-title">AI INSIGHTS & RANKINGS</h6>
                </div>
                <div className="cd-insight-box winner-box mb-3">
                  <strong>🏆 {insights.winner}</strong>
                </div>
                <div className="mb-3 small">
                  <div><strong>Top Volume:</strong> {insights.topPerformers.deceasedVolume}</div>
                </div>
                <div className="cd-recommendations mt-3">
                  {insights.recommendations.map((rec, i) => (
                    <div key={i} className="cd-rec-item"><span className="bullet">💡</span> {rec}</div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* CHARTS ROW 2 */}
        <Row className="g-4 mb-4">
          <Col lg={12}>
            <ChartCard title="DECEASED BY AGE GROUP">
              <Bar data={{ labels: ageGroups, datasets: ageDatasets }} options={chartOptions} />
            </ChartCard>
          </Col>
        </Row>

        {/* ASSETS ROW */}
        <Row className="g-4 mb-4">
          <Col lg={4}>
            <ChartCard title="HEARSE FUEL LEVELS">
              <div className="d-flex flex-column gap-2 mt-2">
                {activeIds.map((id, index) => (
                  <BatteryGauge key={id} label={bNames[index]} percentage={compBranches[id].hearses.fuelAvg} color={getBranchColor(index)} />
                ))}
              </div>
            </ChartCard>
          </Col>
          <Col lg={4}>
            <ChartCard title="CHEMICAL STOCK (Avg %)">
              <Bar data={{ labels: ['Formaldehyde', 'Disinfectant'], datasets: chemDatasets }} options={{ ...chartOptions, indexAxis: 'y' }} />
            </ChartCard>
          </Col>
          <Col lg={4}>
            <ChartCard title="COFFIN INVENTORY">
               <div className="row g-2">
                 {activeIds.map((id, index) => (
                    <div key={id} className={`col-${activeIds.length > 2 ? '6' : '6'} mb-3`}>
                      <Doughnut data={{
                        labels: ['Avail', 'Rsvd', 'InUse'],
                        datasets: [{ data: [compBranches[id].coffins.available, compBranches[id].coffins.reserved, compBranches[id].coffins.inUse], backgroundColor: [getBranchColor(index), COLORS.gray, COLORS.danger] }]
                      }} options={noGridOptions} />
                      <div className="text-center mt-2 fw-bold text-truncate small" style={{color: getBranchColor(index)}}>{bNames[index]}</div>
                    </div>
                 ))}
               </div>
            </ChartCard>
          </Col>
        </Row>

        {/* DYNAMIC SUMMARY TABLE */}
        <Card className="border-0 shadow-sm cd-summary-card">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <table className="table cd-summary-table mb-0">
                <thead>
                  <tr>
                    <th>Metric</th>
                    {activeIds.map((id, index) => (
                      <th key={id} className="text-end" style={{ color: getBranchColor(index) }}>{bNames[index]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Deceased Volume</strong></td>
                    {activeIds.map(id => <td key={id} className="text-end">{compBranches[id].deceased.total}</td>)}
                  </tr>
                  <tr>
                    <td><strong>Coffins Available</strong></td>
                    {activeIds.map(id => <td key={id} className="text-end">{compBranches[id].coffins.available}</td>)}
                  </tr>
                  <tr>
                    <td><strong>Hearse Available</strong></td>
                    {activeIds.map(id => <td key={id} className="text-end">{compBranches[id].hearses.available}/{compBranches[id].hearses.total}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  };

  return (
    <Container fluid className="cd-page">
      <div className="cd-header mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h3 className="cd-title fw-bold mb-1">Advanced Analytics {isCompareMode && <Badge bg="primary" className="ms-2">COMPARE MODE</Badge>}</h3>
            <p className="text-muted mb-0 small">Real-time business intelligence for RestPoint</p>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            
            <Button variant={isCompareMode ? "primary" : "outline-primary"} size="sm" className="d-flex align-items-center gap-2 cd-btn" onClick={() => setIsCompareMode(!isCompareMode)}>
              <GitMerge size={16} /> {isCompareMode ? "Exit Compare" : "Compare Branches"}
            </Button>

            {!isCompareMode ? (
              <Dropdown>
                <Dropdown.Toggle variant="white" size="sm" className="d-flex align-items-center gap-2 cd-select">
                  <MapPin size={16} /> {selectedBranch?.name || "Select Branch"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {branches.map(b => (
                    <Dropdown.Item key={b.id} onClick={() => setSelectedBranch(b)} active={selectedBranch?.id === b.id}>{b.name}</Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Dropdown>
                <Dropdown.Toggle variant="white" size="sm" className="d-flex align-items-center gap-2 cd-select">
                  <GitMerge size={16} /> {selectedCompareBranches.length} Selected
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-2 shadow-sm" style={{ minWidth: '200px' }}>
                  <div className="text-muted small fw-bold mb-2 px-2">Select branches (min 2)</div>
                  {branches.map(b => {
                     const isSel = selectedCompareBranches.includes(b.id || b.branch_id);
                     return (
                        <div key={b.id} className="form-check mb-2 px-3">
                          <input className="form-check-input" type="checkbox" id={`chk-${b.id}`} checked={isSel} onChange={() => toggleCompareBranch(b.id || b.branch_id)} />
                          <label className="form-check-label" htmlFor={`chk-${b.id}`}>{b.name}</label>
                        </div>
                     )
                  })}
                </Dropdown.Menu>
              </Dropdown>
            )}
            
            <Button variant="white" size="sm" onClick={loadData} disabled={refreshing} className="d-flex align-items-center gap-2 border shadow-sm">
              <RotateCw size={16} className={refreshing ? "cd-spin" : ""} />
            </Button>
            <Button variant="dark" size="sm" className="d-flex align-items-center gap-2 cd-btn shadow-sm">
              <FileText size={16} /> Export
            </Button>
          </div>
        </div>
      </div>
      {isCompareMode ? renderCompareDashboard() : renderStandardDashboard()}
    </Container>
  );
};

export default ComprehensiveDashboard;
