import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Hammer, Package, ClipboardList, Users, BarChart3, Plus, Eye, Edit, Trash2 } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');

    useEffect(() => {
        fetchData();
    }, [slug]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'x-tenant-slug': slug,
            };

            const [ordersRes, materialsRes, workersRes] = await Promise.all([
                fetch(`${API_BASE}/api/v1/restpoint/workshop/orders`, { headers }),
                fetch(`${API_BASE}/api/v1/restpoint/workshop/materials`, { headers }),
                fetch(`${API_BASE}/api/v1/restpoint/workshop/workers`, { headers }),
            ]);

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                setOrders(Array.isArray(ordersData) ? ordersData : []);
            }
            if (materialsRes.ok) {
                const materialsData = await materialsRes.json();
                setMaterials(Array.isArray(materialsData) ? materialsData : []);
            }
            if (workersRes.ok) {
                const workersData = await workersRes.json();
                setWorkers(Array.isArray(workersData) ? workersData : []);
            }
        } catch (error) {
            console.error('Error fetching workshop data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        return <Badge $status={status}>{status?.replace(/_/g, ' ') || 'Unknown'}</Badge>;
    };

    const stats = [
        { label: 'Total Orders', value: orders.length, icon: ClipboardList, color: COLORS.primary },
        { label: 'In Progress', value: orders.filter(o => o.status === 'in_progress').length, icon: Package, color: COLORS.info },
        { label: 'Materials', value: materials.length, icon: Package, color: COLORS.success },
        { label: 'Workers', value: workers.length, icon: Users, color: COLORS.warning },
    ];

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
                <ActionButton onClick={() => alert('Create order modal - to be implemented')}>
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

            <Section>
                <SectionHeader>
                    <SectionTitle>
                        <ClipboardList size={20} />
                        Recent Orders
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
                        {orders.length === 0 ? (
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
                                    {orders.slice(0, 10).map((order) => (
                                        <Tr key={order.id}>
                                            <Td>{order.order_number}</Td>
                                            <Td>{order.customer_name}</Td>
                                            <Td>{order.deceased_name}</Td>
                                            <Td>{order.coffin_type}</Td>
                                            <Td>{getStatusBadge(order.status)}</Td>
                                            <Td>KES {Number(order.selling_price || 0).toLocaleString()}</Td>
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
                        {materials.length === 0 ? (
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
                                    {materials.slice(0, 10).map((material) => (
                                        <Tr key={material.id}>
                                            <Td>{material.name}</Td>
                                            <Td>{material.category}</Td>
                                            <Td>{material.quantity}</Td>
                                            <Td>{material.unit}</Td>
                                            <Td>KES {Number(material.unit_price || 0).toLocaleString()}</Td>
                                            <Td>
                                                <Badge $status={material.quantity <= material.min_stock_level ? 'pending' : 'completed'}>
                                                    {material.quantity <= material.min_stock_level ? 'Low Stock' : 'In Stock'}
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
                        {workers.length === 0 ? (
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
                                    {workers.slice(0, 10).map((worker) => (
                                        <Tr key={worker.id}>
                                            <Td>{worker.first_name} {worker.last_name}</Td>
                                            <Td>{worker.email}</Td>
                                            <Td>
                                                <Badge $status={worker.role === 'manager' ? 'in_progress' : 'pending'}>
                                                    {worker.role}
                                                </Badge>
                                            </Td>
                                            <Td>{worker.phone || '-'}</Td>
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
        </DashboardContainer>
    );
};

export default WorkshopDashboard;