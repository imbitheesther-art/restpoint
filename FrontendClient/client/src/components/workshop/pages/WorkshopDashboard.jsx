import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../../context/socketContext';
import { api, ENDPOINTS } from '../../../api';
import { Hammer, Package, ClipboardList, Users, BarChart3, Plus, Eye, Edit, Trash2, AlertTriangle, CheckCircle, TrendingUp, Clock, DollarSign } from 'lucide-react';

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
};

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
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
  transition: background 0.2s;

  &:hover {
    background: ${COLORS.primaryLight};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${COLORS.white};
  padding: 1.25rem;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid ${COLORS.border};
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
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
  font-size: 0.7rem;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem 1.5rem;
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
        switch (props.$status) {
            case 'completed': return '#D1FAE5';
            case 'in_progress': return '#DBEAFE';
            case 'pending': return '#FEF3C7';
            case 'delivered': return '#D1FAE5';
            default: return COLORS.bg;
        }
    }};
  color: ${props => {
        switch (props.$status) {
            case 'completed': return '#065F46';
            case 'in_progress': return '#1E40AF';
            case 'pending': return '#92400E';
            case 'delivered': return '#065F46';
            default: return COLORS.textSecondary;
        }
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

const WorkshopDashboard = () => {
    const { slug } = useParams();
    const [orders, setOrders] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: '',
        deceased_name: '',
        coffin_type: 'standard',
        selling_price: '',
        delivery_date: '',
        notes: ''
    });
    const { socket, connected } = useSocket();

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
                api.get(ENDPOINTS.WORKSHOP.ORDERS).catch(() => ({ data: [] })),
                api.get(ENDPOINTS.WORKSHOP.MATERIALS).catch(() => ({ data: [] })),
                api.get(ENDPOINTS.WORKSHOP.WORKERS).catch(() => ({ data: [] })),
                api.get(ENDPOINTS.WORKSHOP.REPORTS.PRODUCTION).catch(() => ({ data: null })),
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

    const getStatusBadge = (status) => {
        if (!status) return <Badge $status="pending">Unknown</Badge>;
        return <Badge $status={status}>{status.replace(/_/g, ' ')}</Badge>;
    };

    // Safe calculations with null checks
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

    const handleCreateOrder = async () => {
        try {
            const response = await api.post(ENDPOINTS.WORKSHOP.ORDERS, {
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
                    <Title>Workshop Management</Title>
                    <Subtitle>Coffin building, materials, and production tracking</Subtitle>
                </div>
                <ActionButton onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    New Order
                </ActionButton>
            </Header>

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

            {!connected && (
                <div style={{
                    padding: '0.75rem 1rem',
                    background: '#FEF3C7',
                    border: '1px solid #F59E0B',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    color: '#92400E',
                    fontSize: '0.9rem'
                }}>
                    ⚠️ Real-time updates disconnected. Changes may not sync automatically.
                </div>
            )}

            {/* Analytics Section */}
            {analytics && (
                <Section>
                    <SectionHeader>
                        <SectionTitle>
                            <BarChart3 size={20} />
                            Production Analytics
                        </SectionTitle>
                    </SectionHeader>
                    <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {analytics?.order_status_summary && Array.isArray(analytics.order_status_summary) && analytics.order_status_summary.map((item, i) => (
                            <div key={i} style={{
                                padding: '1rem',
                                background: COLORS.bg,
                                borderRadius: '10px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                    {item?.status || 'Unknown'}
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.text }}>
                                    {item?.count || 0}
                                </div>
                            </div>
                        ))}
                        {analytics?.stage_distribution && Array.isArray(analytics.stage_distribution) && analytics.stage_distribution.map((stage, i) => (
                            <div key={`stage-${i}`} style={{
                                padding: '1rem',
                                background: COLORS.bg,
                                borderRadius: '10px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                    {stage?.stage || 'Stage'}
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.text }}>
                                    {stage?.in_progress || 0} / {stage?.total || 0}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: COLORS.textSecondary }}>
                                    {stage?.completed || 0} completed
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            <Section>
                <SectionHeader>
                    <SectionTitle>
                        <ClipboardList size={20} />
                        {activeTab === 'orders' ? 'Orders' : activeTab === 'materials' ? 'Materials' : 'Workers'}
                    </SectionTitle>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #E5E7EB',
                                borderRadius: '6px',
                                background: activeTab === 'orders' ? COLORS.primary : COLORS.white,
                                color: activeTab === 'orders' ? COLORS.white : COLORS.textSecondary,
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                            }}
                            onClick={() => setActiveTab('orders')}
                        >
                            Orders
                        </button>
                        <button
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #E5E7EB',
                                borderRadius: '6px',
                                background: activeTab === 'materials' ? COLORS.primary : COLORS.white,
                                color: activeTab === 'materials' ? COLORS.white : COLORS.textSecondary,
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                            }}
                            onClick={() => setActiveTab('materials')}
                        >
                            Materials
                        </button>
                        <button
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #E5E7EB',
                                borderRadius: '6px',
                                background: activeTab === 'workers' ? COLORS.primary : COLORS.white,
                                color: activeTab === 'workers' ? COLORS.white : COLORS.textSecondary,
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                            }}
                            onClick={() => setActiveTab('workers')}
                        >
                            Workers
                        </button>
                    </div>
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
                                                    <ActionIcon title="View">
                                                        <Eye size={16} />
                                                    </ActionIcon>
                                                    <ActionIcon title="Edit">
                                                        <Edit size={16} />
                                                    </ActionIcon>
                                                    <ActionIcon title="Delete" $danger>
                                                        <Trash2 size={16} />
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
                        {safeMaterials.length === 0 ? (
                            <EmptyState>
                                <Package size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>No materials in inventory. Add materials to get started.</p>
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
                                    {safeMaterials.slice(0, 10).map((material) => (
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
                                        <Th>Actions</Th>
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
                                            <Td>
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    <ActionIcon title="Edit">
                                                        <Edit size={16} />
                                                    </ActionIcon>
                                                    <ActionIcon title="Delete" $danger>
                                                        <Trash2 size={16} />
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
        </DashboardContainer>
    );
};

// Modal Styles
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
  max-width: 600px;
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

export default WorkshopDashboard;