import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../../context/socketContext';
import { workshopApi, ENDPOINTS } from '../../../api';
import env from '../../../config/env';
import {
    Hammer, Package, ClipboardList, Users, BarChart3, Plus, Eye, Edit, Trash2,
    AlertTriangle, CheckCircle, TrendingUp, Clock, DollarSign, Download,
    Search, Filter, FileText, Calendar, Truck, Settings, Save, X,
    PieChart, LineChart, BarChart, Activity, RefreshCw, Printer,
    ChevronRight, ChevronDown, Upload, FileImage, Check, XCircle
} from 'lucide-react';

const COLORS = {
    primary: '#0A2463',
    primaryLight: '#1A3A7A',
    white: '#FFFFFF',
    bg: '#F5F7FA',
    border: '#E8ECF0',
    text: '#1A1D24',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#E74C3C',
    info: '#3B82F6',
    purple: '#8B5CF6',
};

const DashboardContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${COLORS.text};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${COLORS.textSecondary};
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
`;

const ActionButton = styled.button`
  background: ${COLORS.primary};
  color: ${COLORS.white};
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.primaryLight};
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: ${COLORS.white};
  color: ${COLORS.text};
  border: 1px solid ${COLORS.border};

  &:hover {
    background: ${COLORS.bg};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${COLORS.white};
  padding: 1.5rem;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid ${COLORS.border};
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const StatIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: ${props => props.$color || COLORS.primary};
  color: ${COLORS.white};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.p`
  font-size: 0.75rem;
  color: ${COLORS.textSecondary};
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
`;

const StatValue = styled.p`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${COLORS.text};
  margin: 0;
`;

const Section = styled.div`
  background: ${COLORS.white};
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid ${COLORS.border};
  margin-bottom: 2rem;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: ${COLORS.bg};
  border-radius: 8px;
`;

const Tab = styled.button`
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  background: ${props => props.$active ? COLORS.primary : 'transparent'};
  color: ${props => props.$active ? COLORS.white : COLORS.textSecondary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? COLORS.primaryLight : COLORS.white};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.875rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${COLORS.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${COLORS.bg};
  border-bottom: 1px solid ${COLORS.border};
`;

const Td = styled.td`
  padding: 1rem 1.5rem;
  font-size: 0.9rem;
  color: ${COLORS.text};
  border-bottom: 1px solid ${COLORS.border};
`;

const Tr = styled.tr`
  &:hover {
    background: ${COLORS.bg};
  }

  &:last-child td {
    border-bottom: none;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
        const statusMap = {
            'completed': '#D1FAE5',
            'delivered': '#D1FAE5',
            'in_progress': '#DBEAFE',
            'pending': '#FEF3C7',
            'design': '#E0E7FF',
            'cutting': '#FCE7F3',
            'assembly': '#FEF3C7',
            'polishing': '#DBEAFE',
            'finishing': '#D1FAE5',
            'quality_check': '#FEF3C7',
            'cancelled': '#FEE2E2',
        };
        return statusMap[props.$status] || COLORS.bg;
    }};
  color: ${props => {
        const colorMap = {
            'completed': '#065F46',
            'delivered': '#065F46',
            'in_progress': '#1E40AF',
            'pending': '#92400E',
            'design': '#3730A3',
            'cutting': '#9D174D',
            'assembly': '#92400E',
            'polishing': '#1E40AF',
            'finishing': '#065F46',
            'quality_check': '#92400E',
            'cancelled': '#991B1B',
        };
        return colorMap[props.$status] || COLORS.textSecondary;
    }};
`;

const ActionIcon = styled.button`
  background: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: ${COLORS.textSecondary};
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.bg};
    color: ${props => props.$danger ? COLORS.danger : COLORS.primary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${COLORS.textSecondary};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const Modal = styled.div`
  background: ${COLORS.white};
  border-radius: 14px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: ${COLORS.textSecondary};
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    background: ${COLORS.bg};
    color: ${COLORS.text};
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ModalFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid ${COLORS.border};
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${COLORS.text};
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  font-size: 0.9rem;
  color: ${COLORS.text};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  font-size: 0.9rem;
  color: ${COLORS.text};
  background: ${COLORS.white};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  font-size: 0.9rem;
  color: ${COLORS.text};
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }
`;

const Button = styled.button`
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$variant === 'primary' ? `
    background: ${COLORS.primary};
    color: ${COLORS.white};

    &:hover:not(:disabled) {
      background: ${COLORS.primaryLight};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  ` : `
    background: ${COLORS.white};
    color: ${COLORS.text};
    border: 1px solid ${COLORS.border};

    &:hover {
      background: ${COLORS.bg};
    }
  `}
`;

const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: ${COLORS.bg};
  border-bottom: 1px solid ${COLORS.border};
`;

const SearchInput = styled.div`
  flex: 1;
  position: relative;

  input {
    width: 100%;
    padding: 0.625rem 0.875rem 0.625rem 2.5rem;
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    font-size: 0.9rem;

    &:focus {
      outline: none;
      border-color: ${COLORS.primary};
    }
  }

  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${COLORS.textLight};
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ChartCard = styled.div`
  background: ${COLORS.white};
  padding: 1.5rem;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid ${COLORS.border};
`;

const ChartTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 1rem;
`;

const TimelineContainer = styled.div`
  padding: 1.5rem;
`;

const TimelineItem = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    left: 20px;
    top: 40px;
    bottom: -20px;
    width: 2px;
    background: ${COLORS.border};
  }

  &:last-child:before {
    display: none;
  }
`;

const TimelineIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$completed ? COLORS.success : props.$active ? COLORS.info : COLORS.bg};
  color: ${props => props.$completed || props.$active ? COLORS.white : COLORS.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
`;

const TimelineContent = styled.div`
  flex: 1;
  padding: 0.5rem 0;
`;

const TimelineTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 0.25rem;
`;

const TimelineDescription = styled.p`
  font-size: 0.85rem;
  color: ${COLORS.textSecondary};
  margin: 0;
`;

const AlertBox = styled.div`
  padding: 0.875rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;

  ${props => props.$type === 'warning' ? `
    background: #FEF3C7;
    border: 1px solid #F59E0B;
    color: #92400E;
  ` : props.$type === 'error' ? `
    background: #FEE2E2;
    border: 1px solid #E74C3C;
    color: #991B1B;
  ` : `
    background: #DBEAFE;
    border: 1px solid #3B82F6;
    color: #1E40AF;
  `}
`;

const EnhancedWorkshopDashboard = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showMaterialIntake, setShowMaterialIntake] = useState(false);
    const [showDesignModal, setShowDesignModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const { socket, connected } = useSocket();

    const [formData, setFormData] = useState({
        customer_name: '',
        deceased_name: '',
        coffin_type: 'standard',
        selling_price: '',
        delivery_date: '',
        notes: ''
    });

    const [intakeForm, setIntakeForm] = useState({
        material_id: '',
        quantity: '',
        unit_cost: '',
        supplier: '',
        invoice_number: '',
        notes: '',
        received_by: ''
    });

    const [designForm, setDesignForm] = useState({
        design_name: '',
        description: '',
        specifications: {},
        status: 'draft'
    });

    useEffect(() => {
        fetchData();
    }, [slug]);

    // Real-time socket listeners
    useEffect(() => {
        if (!socket) return;

        const handleOrderCreated = (order) => {
            if (order) setOrders(prev => [order, ...(prev || [])]);
        };

        const handleOrderUpdated = (order) => {
            if (order) setOrders(prev => (prev || []).map(o => o && o.id === order.id ? order : o));
        };

        const handleOrderDeleted = ({ id }) => {
            if (id) setOrders(prev => (prev || []).filter(o => o && o.id !== id));
        };

        const handleMaterialCreated = (material) => {
            if (material) setMaterials(prev => [material, ...(prev || [])]);
        };

        const handleMaterialUpdated = (material) => {
            if (material) setMaterials(prev => (prev || []).map(m => m && m.id === material.id ? material : m));
        };

        const handleMaterialUsed = (usage) => {
            if (usage) setMaterials(prev => (prev || []).map(m => {
                if (m && m.id === usage.material_id) {
                    return { ...m, quantity: (m.quantity || 0) - (usage.quantity_used || 0) };
                }
                return m;
            }));
        };

        socket.on('order:created', handleOrderCreated);
        socket.on('order:updated', handleOrderUpdated);
        socket.on('order:deleted', handleOrderDeleted);
        socket.on('material:created', handleMaterialCreated);
        socket.on('material:updated', handleMaterialUpdated);
        socket.on('material:used', handleMaterialUsed);

        return () => {
            socket.off('order:created', handleOrderCreated);
            socket.off('order:updated', handleOrderUpdated);
            socket.off('order:deleted', handleOrderDeleted);
            socket.off('material:created', handleMaterialCreated);
            socket.off('material:updated', handleMaterialUpdated);
            socket.off('material:used', handleMaterialUsed);
        };
    }, [socket]);

    const fetchData = async () => {
        try {
            const [ordersRes, materialsRes, workersRes, reportRes] = await Promise.all([
                workshopApi.get(ENDPOINTS.WORKSHOP.ORDERS).catch(() => ({ data: [] })),
                workshopApi.get(ENDPOINTS.WORKSHOP.MATERIALS).catch(() => ({ data: [] })),
                workshopApi.get(ENDPOINTS.WORKSHOP.WORKERS).catch(() => ({ data: [] })),
                workshopApi.get(ENDPOINTS.WORKSHOP.REPORTS.PRODUCTION).catch(() => ({ data: null })),
            ]);

            setOrders(Array.isArray(ordersRes?.data) ? ordersRes.data : []);
            setMaterials(Array.isArray(materialsRes?.data) ? materialsRes.data : []);
            setWorkers(Array.isArray(workersRes?.data) ? workersRes.data : []);
            setAnalytics(reportRes?.data || null);
        } catch (error) {
            console.error('Error fetching workshop data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrder = async () => {
        try {
            const response = await workshopApi.post(ENDPOINTS.WORKSHOP.ORDERS, {
                customer_name: formData.customer_name,
                deceased_name: formData.deceased_name,
                coffin_type: formData.coffin_type,
                selling_price: formData.selling_price || 0,
                delivery_date: formData.delivery_date || null,
                notes: formData.notes
            });

            if (response?.data) {
                setOrders(prev => [response.data, ...(prev || [])]);
                setShowCreateModal(false);
                setFormData({
                    customer_name: '',
                    deceased_name: '',
                    coffin_type: 'standard',
                    selling_price: '',
                    delivery_date: '',
                    notes: ''
                });
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to create order: ' + (error?.response?.data?.error || error?.message || 'Unknown error'));
        }
    };

    const handleViewOrder = async (orderId) => {
        try {
            const response = await workshopApi.get(ENDPOINTS.WORKSHOP.ORDER_DETAIL(orderId));
            if (response?.data) {
                setSelectedOrder(response.data);
                setShowOrderDetail(true);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
        }
    };

    const handleDownloadPDF = async (orderId) => {
        try {
            const response = await workshopApi.get(ENDPOINTS.WORKSHOP.WORK_ORDER.PDF(orderId), {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `work-order-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to download work order');
        }
    };

    const handleMaterialIntake = async () => {
        try {
            const response = await workshopApi.post(ENDPOINTS.WORKSHOP.MATERIAL_INTAKE, intakeForm);
            if (response?.data) {
                setMaterials(prev => (prev || []).map(m => {
                    if (m && m.id === parseInt(intakeForm.material_id)) {
                        return { ...m, quantity: (m.quantity || 0) + parseFloat(intakeForm.quantity) };
                    }
                    return m;
                }));
                setShowMaterialIntake(false);
                setIntakeForm({
                    material_id: '',
                    quantity: '',
                    unit_cost: '',
                    supplier: '',
                    invoice_number: '',
                    notes: '',
                    received_by: ''
                });
            }
        } catch (error) {
            console.error('Error recording material intake:', error);
            alert('Failed to record material intake');
        }
    };

    const handleSaveDesign = async () => {
        if (!selectedOrder) return;
        try {
            const response = await workshopApi.post(ENDPOINTS.WORKSHOP.DESIGN.SAVE(selectedOrder.id), designForm);
            if (response?.data) {
                setSelectedOrder({ ...selectedOrder, design_specification: response.data });
                setShowDesignModal(false);
            }
        } catch (error) {
            console.error('Error saving design:', error);
            alert('Failed to save design specification');
        }
    };

    const getStatusBadge = (status) => {
        if (!status) return <Badge $status="pending">Unknown</Badge>;
        return <Badge $status={status}>{status.replace(/_/g, ' ')}</Badge>;
    };

    const safeOrders = orders || [];
    const safeMaterials = materials || [];
    const safeWorkers = workers || [];

    const lowStockCount = safeMaterials.filter(m => m && m.quantity <= m.min_stock_level).length;
    const inProgressCount = safeOrders.filter(o => o && (o.status === 'in_progress' || ['design', 'cutting', 'assembly', 'polishing', 'finishing'].includes(o.status))).length;
    const completedCount = safeOrders.filter(o => o && (o.status === 'completed' || o.status === 'delivered')).length;
    const totalRevenue = safeOrders.reduce((sum, o) => sum + (Number(o?.selling_price) || 0), 0);

    const stats = [
        { label: 'Total Orders', value: safeOrders.length, icon: ClipboardList, color: COLORS.primary },
        { label: 'In Production', value: inProgressCount, icon: Package, color: COLORS.info },
        { label: 'Completed', value: completedCount, icon: CheckCircle, color: COLORS.success },
        { label: 'Low Stock Items', value: lowStockCount, icon: AlertTriangle, color: lowStockCount > 0 ? COLORS.danger : COLORS.warning },
        { label: 'Total Revenue', value: `KES ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: COLORS.success },
        { label: 'Materials', value: safeMaterials.length, icon: Package, color: COLORS.info },
    ];

    const filteredMaterials = safeMaterials.filter(m => {
        if (!m) return false;
        const matchesSearch = m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <DashboardContainer>
                <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.textSecondary }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTop: '3px solid #C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                    <p>Loading workshop data...</p>
                </div>
            </DashboardContainer>
        );
    }

    return (
        <DashboardContainer>
            <Header>
                <div>
                    <Title>Workshop Production Management</Title>
                    <Subtitle>Real-time coffin building and production tracking</Subtitle>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <ActionButton onClick={() => setShowMaterialIntake(true)}>
                        <Truck size={18} />
                        Stock Intake
                    </ActionButton>
                    <ActionButton onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} />
                        New Order
                    </ActionButton>
                </div>
            </Header>

            {!connected && (
                <AlertBox $type="info">
                    <Activity size={18} />
                    Real-time updates disconnected. Changes may not sync automatically.
                </AlertBox>
            )}

            <StatsGrid>
                {stats.map((stat, index) => (
                    <StatCard key={index}>
                        <StatIcon $color={stat.color}>
                            <stat.icon size={24} />
                        </StatIcon>
                        <StatContent>
                            <StatLabel>{stat.label}</StatLabel>
                            <StatValue>{stat.value}</StatValue>
                        </StatContent>
                    </StatCard>
                ))}
            </StatsGrid>

            {analytics && (
                <Section>
                    <SectionHeader>
                        <SectionTitle>
                            <BarChart3 size={20} />
                            Production Analytics
                        </SectionTitle>
                    </SectionHeader>
                    <div style={{ padding: '1.5rem' }}>
                        <ChartsGrid>
                            <ChartCard>
                                <ChartTitle>Order Status Distribution</ChartTitle>
                                <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {analytics?.order_status_summary && Array.isArray(analytics.order_status_summary) && (
                                        <div style={{ width: '100%' }}>
                                            {analytics.order_status_summary.map((item, i) => (
                                                <div key={i} style={{ marginBottom: '0.75rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                        <span style={{ fontSize: '0.85rem', color: COLORS.textSecondary, textTransform: 'capitalize' }}>
                                                            {item?.status || 'Unknown'}
                                                        </span>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.text }}>
                                                            {item?.count || 0}
                                                        </span>
                                                    </div>
                                                    <div style={{ height: '8px', background: COLORS.bg, borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            height: '100%',
                                                            width: `${((item?.count || 0) / safeOrders.length) * 100}%`,
                                                            background: COLORS.primary,
                                                            borderRadius: '4px',
                                                            transition: 'width 0.3s'
                                                        }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </ChartCard>

                            <ChartCard>
                                <ChartTitle>Production Stages</ChartTitle>
                                <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {analytics?.stage_distribution && Array.isArray(analytics.stage_distribution) && (
                                        <div style={{ width: '100%' }}>
                                            {analytics.stage_distribution.map((stage, i) => (
                                                <div key={i} style={{ marginBottom: '0.75rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                        <span style={{ fontSize: '0.85rem', color: COLORS.textSecondary, textTransform: 'capitalize' }}>
                                                            {stage?.stage || 'Stage'}
                                                        </span>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.text }}>
                                                            {stage?.completed || 0}/{stage?.total || 0}
                                                        </span>
                                                    </div>
                                                    <div style={{ height: '8px', background: COLORS.bg, borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            height: '100%',
                                                            width: `${stage?.total > 0 ? ((stage?.completed || 0) / stage.total) * 100 : 0}%`,
                                                            background: COLORS.success,
                                                            borderRadius: '4px',
                                                            transition: 'width 0.3s'
                                                        }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </ChartCard>
                        </ChartsGrid>
                    </div>
                </Section>
            )}

            <Section>
                <SectionHeader>
                    <SectionTitle>
                        <ClipboardList size={20} />
                        Workshop Management
                    </SectionTitle>
                    <TabContainer>
                        <Tab $active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>
                            Orders
                        </Tab>
                        <Tab $active={activeTab === 'materials'} onClick={() => setActiveTab('materials')}>
                            Materials
                        </Tab>
                        <Tab $active={activeTab === 'workers'} onClick={() => setActiveTab('workers')}>
                            Workers
                        </Tab>
                    </TabContainer>
                </SectionHeader>

                {activeTab === 'orders' && (
                    <>
                        {safeOrders.length === 0 ? (
                            <EmptyState>
                                <ClipboardList size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>No orders yet. Create your first coffin order to get started.</p>
                            </EmptyState>
                        ) : (
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Order #</Th>
                                        <Th>Customer</Th>
                                        <Th>Deceased</Th>
                                        <Th>Type</Th>
                                        <Th>Status</Th>
                                        <Th>Price</Th>
                                        <Th>Actions</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {safeOrders.slice(0, 10).map((order) => (
                                        <Tr key={order?.id || Math.random()}>
                                            <Td>{order?.order_number || '-'}</Td>
                                            <Td>{order?.customer_name || '-'}</Td>
                                            <Td>{order?.deceased_name || '-'}</Td>
                                            <Td>{order?.coffin_type || '-'}</Td>
                                            <Td>{getStatusBadge(order?.status)}</Td>
                                            <Td>KES {Number(order?.selling_price || 0).toLocaleString()}</Td>
                                            <Td>
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    <ActionIcon title="View" onClick={() => handleViewOrder(order?.id)}>
                                                        <Eye size={16} />
                                                    </ActionIcon>
                                                    <ActionIcon title="Download Work Order" onClick={() => handleDownloadPDF(order?.id)}>
                                                        <Download size={16} />
                                                    </ActionIcon>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </>
                )}

                {activeTab === 'materials' && (
                    <>
                        <SearchBar>
                            <SearchInput>
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Search materials..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </SearchInput>
                            <Select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                style={{ width: '200px' }}
                            >
                                <option value="all">All Categories</option>
                                <option value="wood">Wood</option>
                                <option value="fabric">Fabric</option>
                                <option value="hardware">Hardware</option>
                                <option value="finishing">Finishing</option>
                            </Select>
                        </SearchBar>

                        {filteredMaterials.length === 0 ? (
                            <EmptyState>
                                <Package size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>No materials found. Add materials to get started.</p>
                            </EmptyState>
                        ) : (
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Name</Th>
                                        <Th>Category</Th>
                                        <Th>Quantity</Th>
                                        <Th>Unit</Th>
                                        <Th>Unit Price</Th>
                                        <Th>Status</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMaterials.slice(0, 10).map((material) => (
                                        <Tr key={material?.id || Math.random()}>
                                            <Td>{material?.name || '-'}</Td>
                                            <Td>{material?.category || '-'}</Td>
                                            <Td>{material?.quantity ?? 0}</Td>
                                            <Td>{material?.unit || '-'}</Td>
                                            <Td>KES {Number(material?.unit_price || 0).toLocaleString()}</Td>
                                            <Td>
                                                <Badge $status={(material?.quantity ?? 0) <= (material?.min_stock_level ?? 0) ? 'pending' : 'completed'}>
                                                    {(material?.quantity ?? 0) <= (material?.min_stock_level ?? 0) ? 'Low Stock' : 'In Stock'}
                                                </Badge>
                                            </Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </>
                )}

                {activeTab === 'workers' && (
                    <>
                        {safeWorkers.length === 0 ? (
                            <EmptyState>
                                <Users size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>No workers registered. Add workers to assign them to orders.</p>
                            </EmptyState>
                        ) : (
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Name</Th>
                                        <Th>Email</Th>
                                        <Th>Role</Th>
                                        <Th>Phone</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {safeWorkers.slice(0, 10).map((worker) => (
                                        <Tr key={worker?.id || Math.random()}>
                                            <Td>{(worker?.first_name || '') + ' ' + (worker?.last_name || '')}</Td>
                                            <Td>{worker?.email || '-'}</Td>
                                            <Td>
                                                <Badge $status={worker?.role === 'manager' ? 'in_progress' : 'pending'}>
                                                    {worker?.role || 'worker'}
                                                </Badge>
                                            </Td>
                                            <Td>{worker?.phone || '-'}</Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </>
                )}
            </Section>

            {/* Create Order Modal */}
            {showCreateModal && (
                <ModalOverlay>
                    <Modal>
                        <ModalHeader>
                            <ModalTitle>Create New Coffin Order</ModalTitle>
                            <CloseButton onClick={() => setShowCreateModal(false)}>×</CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <FormGroup>
                                <Label>Customer Name *</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter customer name"
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Deceased Name *</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter deceased name"
                                    value={formData.deceased_name}
                                    onChange={(e) => setFormData({ ...formData, deceased_name: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Coffin Type</Label>
                                <Select
                                    value={formData.coffin_type}
                                    onChange={(e) => setFormData({ ...formData, coffin_type: e.target.value })}
                                >
                                    <option value="standard">Standard</option>
                                    <option value="premium">Premium</option>
                                    <option value="deluxe">Deluxe</option>
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label>Selling Price (KES)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.selling_price}
                                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Delivery Date</Label>
                                <Input
                                    type="date"
                                    value={formData.delivery_date}
                                    onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Notes</Label>
                                <Textarea
                                    placeholder="Additional notes..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleCreateOrder} disabled={!formData.customer_name || !formData.deceased_name}>
                                Create Order
                            </Button>
                        </ModalFooter>
                    </Modal>
                </ModalOverlay>
            )}

            {/* Order Detail Modal */}
            {showOrderDetail && selectedOrder && (
                <ModalOverlay>
                    <Modal style={{ maxWidth: '900px' }}>
                        <ModalHeader>
                            <ModalTitle>Order Details - {selectedOrder.order_number}</ModalTitle>
                            <CloseButton onClick={() => { setShowOrderDetail(false); setSelectedOrder(null); }}>×</CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: COLORS.text }}>Order Information</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: COLORS.textSecondary, margin: '0 0 0.25rem' }}>Customer</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>{selectedOrder.customer_name}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: COLORS.textSecondary, margin: '0 0 0.25rem' }}>Deceased</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>{selectedOrder.deceased_name}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: COLORS.textSecondary, margin: '0 0 0.25rem' }}>Coffin Type</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 500, margin: 0, textTransform: 'capitalize' }}>{selectedOrder.coffin_type}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: COLORS.textSecondary, margin: '0 0 0.25rem' }}>Status</p>
                                        {getStatusBadge(selectedOrder.status)}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: COLORS.text }}>Production Timeline</h3>
                                <TimelineContainer>
                                    {selectedOrder.stages && selectedOrder.stages.map((stage, i) => (
                                        <TimelineItem key={i}>
                                            <TimelineIcon $completed={stage.status === 'completed'} $active={stage.status === 'in_progress'}>
                                                {stage.status === 'completed' ? <Check size={20} /> : <Clock size={20} />}
                                            </TimelineIcon>
                                            <TimelineContent>
                                                <TimelineTitle>{stage.stage.toUpperCase()}</TimelineTitle>
                                                <TimelineDescription>
                                                    Status: {stage.status.replace(/_/g, ' ')}
                                                    {stage.started_at && <span> • Started: {new Date(stage.started_at).toLocaleDateString()}</span>}
                                                    {stage.completed_at && <span> • Completed: {new Date(stage.completed_at).toLocaleDateString()}</span>}
                                                </TimelineDescription>
                                            </TimelineContent>
                                        </TimelineItem>
                                    ))}
                                </TimelineContainer>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <Button variant="secondary" onClick={() => setShowDesignModal(true)}>
                                    <FileText size={16} />
                                    Design Spec
                                </Button>
                                <Button variant="primary" onClick={() => handleDownloadPDF(selectedOrder.id)}>
                                    <Download size={16} />
                                    Download Work Order
                                </Button>
                            </div>
                        </ModalBody>
                    </Modal>
                </ModalOverlay>
            )}

            {/* Material Intake Modal */}
            {showMaterialIntake && (
                <ModalOverlay>
                    <Modal>
                        <ModalHeader>
                            <ModalTitle>Record Material Intake</ModalTitle>
                            <CloseButton onClick={() => setShowMaterialIntake(false)}>×</CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <FormGroup>
                                <Label>Material *</Label>
                                <Select
                                    value={intakeForm.material_id}
                                    onChange={(e) => setIntakeForm({ ...intakeForm, material_id: e.target.value })}
                                >
                                    <option value="">Select material</option>
                                    {safeMaterials.map(m => (
                                        <option key={m.id} value={m.id}>{m.name} ({m.category})</option>
                                    ))}
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label>Quantity *</Label>
                                <Input
                                    type="number"
                                    placeholder="Enter quantity"
                                    value={intakeForm.quantity}
                                    onChange={(e) => setIntakeForm({ ...intakeForm, quantity: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Unit Cost (KES)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={intakeForm.unit_cost}
                                    onChange={(e) => setIntakeForm({ ...intakeForm, unit_cost: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Supplier</Label>
                                <Input
                                    type="text"
                                    placeholder="Supplier name"
                                    value={intakeForm.supplier}
                                    onChange={(e) => setIntakeForm({ ...intakeForm, supplier: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Invoice Number</Label>
                                <Input
                                    type="text"
                                    placeholder="Invoice #"
                                    value={intakeForm.invoice_number}
                                    onChange={(e) => setIntakeForm({ ...intakeForm, invoice_number: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Received By</Label>
                                <Input
                                    type="text"
                                    placeholder="Your name"
                                    value={intakeForm.received_by}
                                    onChange={(e) => setIntakeForm({ ...intakeForm, received_by: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Notes</Label>
                                <Textarea
                                    placeholder="Additional notes..."
                                    value={intakeForm.notes}
                                    onChange={(e) => setIntakeForm({ ...intakeForm, notes: e.target.value })}
                                />
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="secondary" onClick={() => setShowMaterialIntake(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleMaterialIntake} disabled={!intakeForm.material_id || !intakeForm.quantity}>
                                Record Intake
                            </Button>
                        </ModalFooter>
                    </Modal>
                </ModalOverlay>
            )}

            {/* Design Specification Modal */}
            {showDesignModal && (
                <ModalOverlay>
                    <Modal>
                        <ModalHeader>
                            <ModalTitle>Design Specification</ModalTitle>
                            <CloseButton onClick={() => setShowDesignModal(false)}>×</CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <FormGroup>
                                <Label>Design Name</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter design name"
                                    value={designForm.design_name}
                                    onChange={(e) => setDesignForm({ ...designForm, design_name: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Description</Label>
                                <Textarea
                                    placeholder="Design description..."
                                    value={designForm.description}
                                    onChange={(e) => setDesignForm({ ...designForm, description: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Status</Label>
                                <Select
                                    value={designForm.status}
                                    onChange={(e) => setDesignForm({ ...designForm, status: e.target.value })}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="pending_approval">Pending Approval</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </Select>
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="secondary" onClick={() => setShowDesignModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleSaveDesign}>
                                <Save size={16} />
                                Save Design
                            </Button>
                        </ModalFooter>
                    </Modal>
                </ModalOverlay>
            )}
        </DashboardContainer>
    );
};

export default EnhancedWorkshopDashboard;