import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Battery, Package, TrendingUp, TrendingDown, ArrowRightLeft, Plus,
  AlertTriangle, CheckCircle, Search, BarChart3, Beaker, Eye,
  Calendar, FileText, X, Save, History, Users, PieChart, BarChart,
  RefreshCw, Zap, Target, Syringe, Shield, Truck, FlaskConical
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

// Using your specified colors
const COLORS = {
  primaryDark: '#1E293B',
  accentRed: '#EF4444',
  accentBlue: '#3B82F6',
  successGreen: '#10B981',
  dangerRed: '#DC2626',
  warningYellow: '#F59E0B',
  infoBlue: '#0EA5E9',
  darkGray: '#334155',
  light: '#F8FAFC',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#1E293B',
  textSecondary: '#64748B'
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const modalIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

// Styled Components
const DashboardContainer = styled.div`
  padding: 16px;
  background: ${COLORS.light};
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow-x: hidden;
  
  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }
`;

const Title = styled.h1`
  color: ${COLORS.primaryDark};
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (min-width: 768px) {
    font-size: 28px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  
  @media (min-width: 768px) {
    gap: 12px;
  }
`;

const ActionButton = styled.button`
  background: ${({ variant }) =>
    variant === 'primary' ? COLORS.accentBlue :
      variant === 'success' ? COLORS.successGreen :
        variant === 'warning' ? COLORS.warningYellow : COLORS.cardBg};
  color: ${({ variant }) => variant ? 'white' : COLORS.textPrimary};
  border: ${({ variant }) => variant ? 'none' : `1px solid ${COLORS.border}`};
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.3s ease;
  
  @media (min-width: 768px) {
    padding: 10px 16px;
    font-size: 14px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
`;

const StatCard = styled.div`
  background: ${COLORS.cardBg};
  border-radius: 12px;
  padding: 16px;
  border: 1px solid ${COLORS.border};
  animation: ${fadeIn} 0.6s ease-out;
  transition: all 0.3s ease;
  
  @media (min-width: 768px) {
    padding: 20px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  @media (min-width: 768px) {
    margin-bottom: 12px;
  }
`;

const StatTitle = styled.div`
  color: ${COLORS.textSecondary};
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  @media (min-width: 768px) {
    font-size: 12px;
  }
`;

const StatValue = styled.div`
  color: ${COLORS.textPrimary};
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
  
  @media (min-width: 768px) {
    font-size: 28px;
    margin-bottom: 6px;
  }
`;

const ContentSection = styled.div`
  background: ${COLORS.cardBg};
  border-radius: 12px;
  padding: 16px;
  border: 1px solid ${COLORS.border};
  margin-bottom: 16px;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (min-width: 768px) {
    padding: 24px;
    margin-bottom: 24px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
`;

const SectionTitle = styled.h3`
  color: ${COLORS.textPrimary};
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${COLORS.accentBlue};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  @media (min-width: 768px) {
    width: 300px;
  }
`;

const ChemicalCard = styled.div`
  background: ${COLORS.cardBg};
  border-radius: 12px;
  padding: 16px;
  border: 1px solid ${COLORS.border};
  margin-bottom: 12px;
  transition: all 0.3s ease;
  
  @media (min-width: 768px) {
    padding: 20px;
    margin-bottom: 16px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
`;

const ChemicalName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${COLORS.textPrimary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChemicalMeta = styled.div`
  font-size: 12px;
  color: ${COLORS.textSecondary};
  margin-top: 4px;
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${props => props.lowStock ? '#FEF2F2' : '#F0F9FF'};
  color: ${props => props.lowStock ? '#DC2626' : '#0369A1'};
  border: 1px solid ${props => props.lowStock ? '#FECACA' : '#BAE6FD'};
  white-space: nowrap;
`;

const StockHealthBar = styled.div`
  margin: 12px 0;
  padding: 0;
`;

const StockHealthTrack = styled.div`
  width: 100%;
  height: 8px;
  background: #E2E8F0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const StockHealthFill = styled.div`
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease, background 0.6s ease;
  width: ${props => Math.min(100, Math.max(0, props.percentage))}%;
  background: ${props => {
    const pct = props.percentage;
    if (pct >= 80) return '#10B981';
    if (pct >= 60) return '#22C55E';
    if (pct >= 40) return '#F59E0B';
    if (pct >= 20) return '#F97316';
    return '#EF4444';
  }};
  box-shadow: ${props => props.percentage < 20 ? '0 0 8px rgba(239,68,68,0.5)' : 'none'};
`;

const StockHealthLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
`;

const StockHealthPct = styled.span`
  color: ${props => {
    const pct = props.percentage;
    if (pct >= 60) return '#10B981';
    if (pct >= 40) return '#F59E0B';
    if (pct >= 20) return '#F97316';
    return '#EF4444';
  }};
  font-weight: 700;
`;

const StockHealthStatus = styled.span`
  color: ${props => {
    const pct = props.percentage;
    if (pct >= 80) return '#10B981';
    if (pct >= 60) return '#22C55E';
    if (pct >= 40) return '#F59E0B';
    if (pct >= 20) return '#F97316';
    return '#EF4444';
  }};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StockInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 12px 0;
  padding: 12px;
  background: ${COLORS.light};
  border-radius: 8px;
`;

const StockItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StockLabel = styled.div`
  font-size: 11px;
  color: ${COLORS.textSecondary};
  font-weight: 600;
  text-transform: uppercase;
`;

const StockValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${COLORS.textPrimary};
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 12px;
`;

const IconButton = styled.button`
  background: transparent;
  color: ${COLORS.textSecondary};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  
  @media (min-width: 768px) {
    padding: 6px;
    font-size: 14px;
  }
  
  &:hover {
    background: ${COLORS.light};
    color: ${COLORS.accentBlue};
    transform: translateY(-1px);
  }
  
  &.danger:hover {
    color: ${COLORS.accentRed};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UsageTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

const UsageRow = styled.tr`
  &:hover {
    background: ${COLORS.light};
  }
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  overflow-y: auto;
`;

const Modal = styled.div`
  background: ${COLORS.cardBg};
  border-radius: 16px;
  padding: 0;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
  animation: ${modalIn} 0.3s ease-out;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 20px 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  @media (min-width: 768px) {
    padding: 24px 24px 0;
    margin-bottom: 20px;
  }
`;

const ModalTitle = styled.h2`
  color: ${COLORS.textPrimary};
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const ModalContent = styled.div`
  padding: 0 20px 20px;
  overflow-y: auto;
  flex: 1;
  
  @media (min-width: 768px) {
    padding: 0 24px 24px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 16px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 14px;
`;

const Label = styled.label`
  display: block;
  color: ${COLORS.textPrimary};
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${COLORS.accentBlue};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${COLORS.accentBlue};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${COLORS.accentBlue};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 20px;
  
  @media (min-width: 768px) {
    gap: 12px;
    margin-top: 24px;
  }
`;

const PrimaryButton = styled.button`
  background: ${COLORS.accentBlue};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #9CA3AF;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background: white;
  color: ${COLORS.textPrimary};
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${COLORS.light};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${COLORS.textSecondary};
  
  @media (min-width: 768px) {
    padding: 60px 40px;
  }
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  color: ${COLORS.textPrimary};
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  margin: 0;
`;

// Tabs
const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;
  
  @media (min-width: 768px) {
    gap: 12px;
  }
`;

const TabButton = styled.button`
  background: ${props => props.active ? COLORS.accentBlue : COLORS.cardBg};
  color: ${props => props.active ? 'white' : COLORS.textPrimary};
  border: 1px solid ${props => props.active ? COLORS.accentBlue : COLORS.border};
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  @media (min-width: 768px) {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

// Helper functions
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
const genId = (id) => `CH-${String(id).padStart(4, '0')}`;

const ChemicalManagementDashboard = () => {
  const [chemicals, setChemicals] = useState([]);
  const [usageData, setUsageData] = useState([]);
  const [ppeRequests, setPPERequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showPPEModal, setShowPPEModal] = useState(false);
  const [selectedChemical, setSelectedChemical] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    total_chemicals: 0,
    low_stock_count: 0,
    total_usage_30d: 0,
    recent_transactions: [],
    top_used_chemicals: []
  });

  const [formData, setFormData] = useState({
    name: '',
    category: 'embalming',
    unit: 'liters',
    current_stock: '',
    min_stock_level: '',
    reorder_level: '',
    unit_cost: '',
    hazard_level: 'low',
    notes: '',
    jerican_capacity: '',
    jericans_received: ''
  });

  const [usageFormData, setUsageFormData] = useState({
    chemical_id: '',
    quantity_used: '',
    used_by: '',
    usage_notes: '',
    deceased_id: ''
  });

  const [ppeFormData, setPPEFormData] = useState({
    item_name: '',
    quantity_requested: '',
    requested_by: '',
    notes: ''
  });

  // Fetch data
  useEffect(() => {
    fetchChemicals();
    fetchUsageData();
    fetchPPERequests();
    fetchDashboardStats();
  }, []);

  const fetchChemicals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/chemicals');
      if (response.data.success) {
        setChemicals(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to fetch chemicals');
      }
    } catch (error) {
      console.error('Error fetching chemicals:', error);
      toast.error('Failed to load chemicals');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageData = async () => {
    try {
      const branchId = 1;
      const response = await api.get(`/chemicals/usage/branch/${branchId}`);
      if (response.data.success) {
        setUsageData(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
    }
  };

  const fetchPPERequests = async () => {
    try {
      const branchId = 1;
      const response = await api.get(`/chemicals/ppe-requests/branch/${branchId}`);
      if (response.data.success) {
        setPPERequests(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching PPE requests:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const branchId = 1;
      const response = await api.get(`/chemicals/dashboard/summary/${branchId}`);
      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Handle add chemical
  const handleAddChemical = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        category: formData.category.toLowerCase(),
        unit: formData.unit,
        current_stock: parseFloat(formData.current_stock) || 0,
        min_stock_level: parseFloat(formData.min_stock_level) || 0,
        reorder_level: parseFloat(formData.reorder_level) || 0,
        unit_cost: parseFloat(formData.unit_cost) || 0,
        hazard_level: formData.hazard_level.toLowerCase(),
        notes: formData.notes || null,
        branch_id: 1,
        initial_quantity: parseFloat(formData.current_stock) || 0,
        // Only include jerican fields if unit is NOT liters
        ...(formData.unit.toLowerCase() !== 'liters' && {
          jerican_capacity: formData.jerican_capacity ? parseFloat(formData.jerican_capacity) : null,
          jericans_received: formData.jericans_received ? parseInt(formData.jericans_received) : 0
        })
      };

      const response = await api.post('/chemicals', payload);
      const result = response.data;
      if (result.success) {
        toast.success('Chemical added successfully');
        setShowAddModal(false);
        resetForm();
        fetchChemicals();
        fetchDashboardStats();
      } else {
        toast.error(result.message || 'Failed to add chemical');
      }
    } catch (error) {
      console.error('Error adding chemical:', error);
      toast.error(error.message);
    }
  };

  // Handle record usage
  const handleRecordUsage = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        chemical_id: parseInt(usageFormData.chemical_id),
        quantity_used: parseFloat(usageFormData.quantity_used),
        used_by: usageFormData.used_by,
        usage_notes: usageFormData.usage_notes,
        deceased_id: usageFormData.deceased_id || null
      };

      const response = await api.post('/chemicals/usage', payload);
      const result = response.data;
      if (result.success) {
        toast.success('Usage recorded successfully');
        setShowUsageModal(false);
        resetUsageForm();
        fetchChemicals();
        fetchUsageData();
        fetchDashboardStats();
      } else {
        toast.error(result.message || 'Failed to record usage');
      }
    } catch (error) {
      console.error('Error recording usage:', error);
      toast.error(error.message);
    }
  };

  // Handle PPE request
  const handlePPERequest = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        item_name: ppeFormData.item_name,
        quantity_requested: parseInt(ppeFormData.quantity_requested),
        requested_by: ppeFormData.requested_by,
        notes: ppeFormData.notes,
        branch_id: 1
      };

      const response = await api.post('/chemicals/ppe-requests', payload);
      const result = response.data;
      if (result.success) {
        toast.success('PPE request submitted successfully');
        setShowPPEModal(false);
        resetPPEForm();
        fetchPPERequests();
      } else {
        toast.error(result.message || 'Failed to submit PPE request');
      }
    } catch (error) {
      console.error('Error submitting PPE request:', error);
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'embalming',
      unit: 'liters',
      current_stock: '',
      min_stock_level: '',
      reorder_level: '',
      unit_cost: '',
      hazard_level: 'low',
      notes: '',
      jerican_capacity: '',
      jericans_received: ''
    });
  };

  const resetUsageForm = () => {
    setUsageFormData({
      chemical_id: '',
      quantity_used: '',
      used_by: '',
      usage_notes: '',
      deceased_id: ''
    });
  };

  const resetPPEForm = () => {
    setPPEFormData({
      item_name: '',
      quantity_requested: '',
      requested_by: '',
      notes: ''
    });
  };

  // Filter chemicals
  const filteredChemicals = chemicals.filter(chemical =>
    chemical.chemical_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chemical.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalChemicals = chemicals.length;
  const lowStockCount = dashboardStats.low_stock_count || 0;

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <RefreshCw size={48} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <p style={{ color: COLORS.textSecondary }}>Loading chemical inventory...</p>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Header */}
      <Header>
        <Title>
          <Beaker size={24} />
          Chemical Inventory
        </Title>
        <HeaderActions>
          <ActionButton variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            Add Chemical
          </ActionButton>
          <ActionButton variant="success" onClick={() => setShowUsageModal(true)}>
            <FlaskConical size={18} />
            Record Usage
          </ActionButton>
          <ActionButton variant="warning" onClick={() => setShowPPEModal(true)}>
            <Shield size={18} />
            PPE Request
          </ActionButton>
        </HeaderActions>
      </Header>

      {/* Stats */}
      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatTitle>Total Chemicals</StatTitle>
            <Package size={20} color={COLORS.accentBlue} />
          </StatHeader>
          <StatValue>{totalChemicals}</StatValue>
        </StatCard>
        <StatCard>
          <StatHeader>
            <StatTitle>Low Stock Alerts</StatTitle>
            <AlertTriangle size={20} color={COLORS.accentRed} />
          </StatHeader>
          <StatValue style={{ color: lowStockCount > 0 ? COLORS.accentRed : COLORS.textPrimary }}>
            {lowStockCount}
          </StatValue>
        </StatCard>
        <StatCard>
          <StatHeader>
            <StatTitle>Usage (30 days)</StatTitle>
            <TrendingUp size={20} color={COLORS.successGreen} />
          </StatHeader>
          <StatValue>{dashboardStats.total_usage_30d}L</StatValue>
        </StatCard>
        <StatCard>
          <StatHeader>
            <StatTitle>PPE Requests</StatTitle>
            <Shield size={20} color={COLORS.warningYellow} />
          </StatHeader>
          <StatValue>{ppeRequests.length}</StatValue>
        </StatCard>
      </StatsGrid>

      {/* Tabs */}
      <TabsContainer>
        <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>
          <Package size={16} />
          Inventory
        </TabButton>
        <TabButton active={activeTab === 'usage'} onClick={() => setActiveTab('usage')}>
          <History size={16} />
          Usage History
        </TabButton>
        <TabButton active={activeTab === 'ppe'} onClick={() => setActiveTab('ppe')}>
          <Shield size={16} />
          PPE Requests
        </TabButton>
      </TabsContainer>

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <ContentSection>
          <SectionHeader>
            <SectionTitle>
              <Package size={20} />
              Chemical Inventory
            </SectionTitle>
            <SearchInput
              placeholder="Search chemicals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SectionHeader>

          {filteredChemicals.length === 0 ? (
            <EmptyState>
              <EmptyIcon>🧪</EmptyIcon>
              <EmptyTitle>No chemicals found</EmptyTitle>
              <EmptyDescription>Add your first chemical to get started</EmptyDescription>
            </EmptyState>
          ) : (
            filteredChemicals.map(chemical => (
              <ChemicalCard key={chemical.chemical_id}>
                <Header>
                  <div>
                    <ChemicalName>
                      <Beaker size={18} />
                      {chemical.chemical_name}
                    </ChemicalName>
                    <ChemicalMeta>
                      ID: {chemical.chemical_uid} | {chemical.category}
                    </ChemicalMeta>
                  </div>
                  <StatusBadge lowStock={chemical.is_low_stock === 1}>
                    {chemical.is_low_stock === 1 ? 'LOW STOCK' : 'IN STOCK'}
                  </StatusBadge>
                </Header>

                <StockInfo>
                  <StockItem>
                    <StockLabel>Available</StockLabel>
                    <StockValue>{chemical.quantity_available} {chemical.unit}</StockValue>
                  </StockItem>
                  <StockItem>
                    <StockLabel>Min Level</StockLabel>
                    <StockValue>{chemical.min_stock_level} {chemical.unit}</StockValue>
                  </StockItem>
                  {chemical.jerican_capacity && (
                    <StockItem>
                      <StockLabel>Jerican Size</StockLabel>
                      <StockValue>{chemical.jerican_capacity}L</StockValue>
                    </StockItem>
                  )}
                  {chemical.jericans_received > 0 && (
                    <StockItem>
                      <StockLabel>Jericans</StockLabel>
                      <StockValue>{chemical.jericans_received}</StockValue>
                    </StockItem>
                  )}
                </StockInfo>

                {/* Stock Health Bar */}
                <StockHealthBar>
                  <StockHealthTrack>
                    <StockHealthFill percentage={chemical.min_stock_level > 0
                      ? Math.round((chemical.quantity_available / chemical.min_stock_level) * 100)
                      : chemical.quantity_available > 0 ? 100 : 0} />
                  </StockHealthTrack>
                  <StockHealthLabel>
                    <StockHealthPct percentage={chemical.min_stock_level > 0
                      ? Math.round((chemical.quantity_available / chemical.min_stock_level) * 100)
                      : chemical.quantity_available > 0 ? 100 : 0}>
                      {chemical.min_stock_level > 0
                        ? `${Math.round((chemical.quantity_available / chemical.min_stock_level) * 100)}%`
                        : 'N/A'}
                    </StockHealthPct>
                    <StockHealthStatus percentage={chemical.min_stock_level > 0
                      ? Math.round((chemical.quantity_available / chemical.min_stock_level) * 100)
                      : chemical.quantity_available > 0 ? 100 : 0}>
                      {chemical.min_stock_level > 0
                        ? chemical.quantity_available >= chemical.min_stock_level * 2 ? 'Excellent'
                          : chemical.quantity_available >= chemical.min_stock_level * 1.5 ? 'Good'
                            : chemical.quantity_available >= chemical.min_stock_level ? 'Adequate'
                              : chemical.quantity_available >= chemical.min_stock_level * 0.5 ? 'Low'
                                : 'Critical'
                        : chemical.quantity_available > 0 ? 'Healthy' : 'Empty'}
                    </StockHealthStatus>
                  </StockHealthLabel>
                </StockHealthBar>

                {/* Usage Line */}
                <div style={{
                  padding: '8px 12px',
                  background: COLORS.light,
                  borderRadius: '6px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px'
                }}>
                  <span style={{ color: COLORS.textSecondary, fontWeight: 600 }}>Usage (30 days):</span>
                  <span style={{ color: COLORS.accentBlue, fontWeight: 700 }}>{chemical.total_used || 0} {chemical.unit}</span>
                </div>

                <ActionButtons>
                  <IconButton onClick={() => {
                    setSelectedChemical(chemical);
                    setShowUsageModal(true);
                  }}>
                    <FlaskConical size={16} />
                    Use
                  </IconButton>
                  <IconButton onClick={() => {
                    setSelectedChemical(chemical);
                    setShowAddModal(true);
                  }}>
                    <Plus size={16} />
                    Add Stock
                  </IconButton>
                </ActionButtons>
              </ChemicalCard>
            ))
          )}
        </ContentSection>
      )}

      {/* Usage History Tab */}
      {activeTab === 'usage' && (
        <ContentSection>
          <SectionHeader>
            <SectionTitle>
              <History size={20} />
              Usage History
            </SectionTitle>
          </SectionHeader>

          {usageData.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📋</EmptyIcon>
              <EmptyTitle>No usage records</EmptyTitle>
              <EmptyDescription>Usage history will appear here after recording chemical usage</EmptyDescription>
            </EmptyState>
          ) : (
            <div style={{ overflowX: 'hidden' }}>
              <UsageTable>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>Date</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>Chemical</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>Quantity</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>Used By</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {usageData.slice(0, 20).map(usage => (
                    <UsageRow key={usage.usage_id}>
                      <td style={{ padding: '12px 8px', fontSize: '13px', whiteSpace: 'nowrap' }}>{fmtDate(usage.used_at)}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>{usage.chemical_name}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', whiteSpace: 'nowrap' }}>{usage.quantity_used} {usage.unit}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', whiteSpace: 'nowrap' }}>{usage.used_by || 'N/A'}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', color: COLORS.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{usage.usage_notes || '-'}</td>
                    </UsageRow>
                  ))}
                </tbody>
              </UsageTable>
            </div>
          )}
        </ContentSection>
      )}

      {/* PPE Requests Tab */}
      {activeTab === 'ppe' && (
        <ContentSection>
          <SectionHeader>
            <SectionTitle>
              <Shield size={20} />
              PPE Requests
            </SectionTitle>
          </SectionHeader>

          {ppeRequests.length === 0 ? (
            <EmptyState>
              <EmptyIcon>🛡️</EmptyIcon>
              <EmptyTitle>No PPE requests</EmptyTitle>
              <EmptyDescription>
                Use the "PPE Request" button in the header to submit new requests.
                <br /><br />
                Submitted requests will appear here with their status (pending, approved, rejected, fulfilled).
              </EmptyDescription>
            </EmptyState>
          ) : (
            <div style={{ overflowX: 'hidden' }}>
              <UsageTable>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>Date</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>Item</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>Quantity</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>Requested By</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ppeRequests.map(request => (
                    <UsageRow key={request.id}>
                      <td style={{ padding: '12px 8px', fontSize: '13px', whiteSpace: 'nowrap' }}>{fmtDate(request.created_at)}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>{request.item_name}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', whiteSpace: 'nowrap' }}>{request.quantity_requested}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', whiteSpace: 'nowrap' }}>{request.requested_by}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        <StatusBadge lowStock={request.status === 'pending'}>
                          {request.status}
                        </StatusBadge>
                      </td>
                    </UsageRow>
                  ))}
                </tbody>
              </UsageTable>
            </div>
          )}
        </ContentSection>
      )}

      {/* Add Chemical Modal */}
      {showAddModal && (
        <ModalOverlay onClick={() => setShowAddModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <Plus size={20} />
                {selectedChemical ? 'Add Stock' : 'Add Chemical'}
              </ModalTitle>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textSecondary }}>
                <X size={24} />
              </button>
            </ModalHeader>
            <ModalContent>
              <form onSubmit={handleAddChemical}>
                <FormGrid>
                  <FormGroup>
                    <Label>Chemical Name *</Label>
                    <Input
                      placeholder="Enter chemical name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Category *</Label>
                    <Input
                      placeholder="e.g., embalming, disinfectant"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Unit *</Label>
                    <Input
                      placeholder="e.g., liters, kg, ml"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Initial Stock *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.current_stock}
                      onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Min Stock Level *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.min_stock_level}
                      onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Reorder Level *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.reorder_level}
                      onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Hazard Level</Label>
                    <Input
                      placeholder="low, medium, high"
                      value={formData.hazard_level}
                      onChange={(e) => setFormData({ ...formData, hazard_level: e.target.value })}
                    />
                  </FormGroup>
                  {/* Only show jerican fields if unit is NOT liters */}
                  {formData.unit.toLowerCase() !== 'liters' && (
                    <>
                      <FormGroup>
                        <Label>Jerican Capacity (L)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 20"
                          value={formData.jerican_capacity}
                          onChange={(e) => setFormData({ ...formData, jerican_capacity: e.target.value })}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Jericans Received</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.jericans_received}
                          onChange={(e) => setFormData({ ...formData, jericans_received: e.target.value })}
                        />
                      </FormGroup>
                    </>
                  )}
                  <FormGroup style={{ gridColumn: '1 / -1' }}>
                    <Label>Notes</Label>
                    <TextArea
                      placeholder="Additional notes..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </FormGroup>
                </FormGrid>
                <ButtonGroup>
                  <SecondaryButton type="button" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton type="submit">
                    <Save size={16} />
                    Save Chemical
                  </PrimaryButton>
                </ButtonGroup>
              </form>
            </ModalContent>
          </Modal>
        </ModalOverlay>
      )}

      {/* Record Usage Modal */}
      {showUsageModal && (
        <ModalOverlay onClick={() => setShowUsageModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <FlaskConical size={20} />
                Record Chemical Usage
              </ModalTitle>
              <button onClick={() => setShowUsageModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textSecondary }}>
                <X size={24} />
              </button>
            </ModalHeader>
            <ModalContent>
              <form onSubmit={handleRecordUsage}>
                <FormGrid>
                  <FormGroup>
                    <Label>Chemical *</Label>
                    <Select
                      value={usageFormData.chemical_id}
                      onChange={(e) => setUsageFormData({ ...usageFormData, chemical_id: e.target.value })}
                      required
                    >
                      <option value="">Select chemical...</option>
                      {chemicals.map(chem => (
                        <option key={chem.chemical_id} value={chem.chemical_id}>
                          {chem.chemical_name} ({chem.quantity_available} {chem.unit})
                        </option>
                      ))}
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>Quantity Used *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={usageFormData.quantity_used}
                      onChange={(e) => setUsageFormData({ ...usageFormData, quantity_used: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Used By</Label>
                    <Input
                      placeholder="Staff name"
                      value={usageFormData.used_by}
                      onChange={(e) => setUsageFormData({ ...usageFormData, used_by: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Deceased ID (Optional)</Label>
                    <Input
                      placeholder="Deceased #"
                      value={usageFormData.deceased_id}
                      onChange={(e) => setUsageFormData({ ...usageFormData, deceased_id: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup style={{ gridColumn: '1 / -1' }}>
                    <Label>Usage Notes</Label>
                    <TextArea
                      placeholder="Notes about usage..."
                      value={usageFormData.usage_notes}
                      onChange={(e) => setUsageFormData({ ...usageFormData, usage_notes: e.target.value })}
                    />
                  </FormGroup>
                </FormGrid>
                <ButtonGroup>
                  <SecondaryButton type="button" onClick={() => setShowUsageModal(false)}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton type="submit">
                    <Save size={16} />
                    Record Usage
                  </PrimaryButton>
                </ButtonGroup>
              </form>
            </ModalContent>
          </Modal>
        </ModalOverlay>
      )}

      {/* PPE Request Modal */}
      {showPPEModal && (
        <ModalOverlay onClick={() => setShowPPEModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <Shield size={20} />
                Request PPE Items
              </ModalTitle>
              <button onClick={() => setShowPPEModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textSecondary }}>
                <X size={24} />
              </button>
            </ModalHeader>
            <ModalContent>
              <form onSubmit={handlePPERequest}>
                <FormGrid>
                  <FormGroup>
                    <Label>Item Name *</Label>
                    <Input
                      placeholder="e.g., Gloves, Masks, Gowns"
                      value={ppeFormData.item_name}
                      onChange={(e) => setPPEFormData({ ...ppeFormData, item_name: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Quantity Requested *</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={ppeFormData.quantity_requested}
                      onChange={(e) => setPPEFormData({ ...ppeFormData, quantity_requested: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Requested By *</Label>
                    <Input
                      placeholder="Your name"
                      value={ppeFormData.requested_by}
                      onChange={(e) => setPPEFormData({ ...ppeFormData, requested_by: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup style={{ gridColumn: '1 / -1' }}>
                    <Label>Notes</Label>
                    <TextArea
                      placeholder="Additional notes..."
                      value={ppeFormData.notes}
                      onChange={(e) => setPPEFormData({ ...ppeFormData, notes: e.target.value })}
                    />
                  </FormGroup>
                </FormGrid>
                <ButtonGroup>
                  <SecondaryButton type="button" onClick={() => setShowPPEModal(false)}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton type="submit">
                    <Save size={16} />
                    Submit Request
                  </PrimaryButton>
                </ButtonGroup>
              </form>
            </ModalContent>
          </Modal>
        </ModalOverlay>
      )}
    </DashboardContainer>
  );
};

export default ChemicalManagementDashboard;