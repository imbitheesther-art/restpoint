import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../../context/socketContext';
import { workshopApi, ENDPOINTS } from '../../../api';
import {
    ClipboardList, Users, Package, Download, Upload, Check, X,
    Clock, DollarSign, FileText, Truck, AlertTriangle, Eye,
    PlayCircle, StopCircle, RefreshCw, Filter, Search
} from 'lucide-react';

const COLORS = {
    primary: '#0A2463',
    primaryLight: '#1A3A7A',
    white: '#FFFFFF',
    bg: '#F5F7FA',
    border: '#E8ECF0',
    text: '#1A1D24',
    textSecondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#E74C3C',
    info: '#3B82F6',
};

const Container = styled.div`
  max-width: 1400px;
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
  font-size: 1.75rem;
  font-weight: 700;
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

const Button = styled.button`
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

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
  ` : props.$variant === 'success' ? `
    background: ${COLORS.success};
    color: ${COLORS.white};

    &:hover:not(:disabled) {
      background: #059669;
    }
  ` : props.$variant === 'danger' ? `
    background: ${COLORS.danger};
    color: ${COLORS.white};

    &:hover:not(:disabled) {
      background: #DC2626;
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
        };
        return colorMap[props.$status] || COLORS.textSecondary;
    }};
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
  max-width: 700px;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${COLORS.textSecondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${COLORS.white};
  padding: 1.25rem;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid ${COLORS.border};
`;

const StatLabel = styled.p`
  font-size: 0.75rem;
  color: ${COLORS.textSecondary};
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
`;

const StatValue = styled.p`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${COLORS.text};
  margin: 0;
`;

const ProductionWorkflow = () => {
    const { slug } = useParams();
    const { socket, connected } = useSocket();
    const [orders, setOrders] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showAssignWorker, setShowAssignWorker] = useState(false);
    const [showUseMaterial, setShowUseMaterial] = useState(false);
    const [showUpdateStatus, setShowUpdateStatus] = useState(false);
    const [todayCompleted, setTodayCompleted] = useState([]);

    const [assignForm, setAssignForm] = useState({
        worker_id: '',
        stage: 'design',
        notes: ''
    });

    const [materialForm, setMaterialForm] = useState({
        material_id: '',
        quantity_used: '',
        notes: ''
    });

    const [statusForm, setStatusForm] = useState({
        status: 'in_production',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, [slug]);

    useEffect(() => {
        if (!socket) return;

        const handleOrderUpdated = (order) => {
            if (order) setOrders(prev => (prev || []).map(o => o && o.id === order.id ? order : o));
        };

        const handleMaterialUsed = (data) => {
            if (data) setMaterials(prev => (prev || []).map(m => {
                if (m && m.id === data.usage.material_id) {
                    return { ...m, quantity: (m.quantity || 0) - (data.usage.quantity_used || 0) };
                }
                return m;
            }));
        };

        socket.on('order:updated', handleOrderUpdated);
        socket.on('material:used', handleMaterialUsed);

        return () => {
            socket.off('order:updated', handleOrderUpdated);
            socket.off('material:used', handleMaterialUsed);
        };
    }, [socket]);

    const fetchData = async () => {
        try {
            const [ordersRes, materialsRes, workersRes, completedRes] = await Promise.all([
                workshopApi.get(ENDPOINTS.WORKSHOP.ORDERS).catch(() => ({ data: [] })),
                workshopApi.get(ENDPOINTS.WORKSHOP.MATERIALS).catch(() => ({ data: [] })),
                workshopApi.get(ENDPOINTS.WORKSHOP.WORKERS).catch(() => ({ data: [] })),
                workshopApi.get(ENDPOINTS.WORKSHOP.PRODUCTION.TODAY_COMPLETED).catch(() => ({ data: [] })),
            ]);

            setOrders(Array.isArray(ordersRes?.data) ? ordersRes.data : []);
            setMaterials(Array.isArray(materialsRes?.data) ? materialsRes.data : []);
            setWorkers(Array.isArray(workersRes?.data) ? workersRes.data : []);
            setTodayCompleted(Array.isArray(completedRes?.data) ? completedRes.data : []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignWorker = async () => {
        if (!selectedOrder) return;
        try {
            await workshopApi.post(
                ENDPOINTS.WORKSHOP.PRODUCTION.ASSIGN_WORKER(selectedOrder.id),
                assignForm
            );
            setShowAssignWorker(false);
            setAssignForm({ worker_id: '', stage: 'design', notes: '' });
            fetchData();
        } catch (error) {
            console.error('Error assigning worker:', error);
            alert('Failed to assign worker');
        }
    };

    const handleUseMaterial = async () => {
        if (!selectedOrder) return;
        try {
            await workshopApi.post(
                ENDPOINTS.WORKSHOP.PRODUCTION.USE_MATERIAL(selectedOrder.id),
                materialForm
            );
            setShowUseMaterial(false);
            setMaterialForm({ material_id: '', quantity_used: '', notes: '' });
            fetchData();
        } catch (error) {
            console.error('Error recording material usage:', error);
            alert('Failed to record material usage: ' + (error?.response?.data?.error || 'Unknown error'));
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder) return;
        try {
            await workshopApi.patch(
                ENDPOINTS.WORKSHOP.PRODUCTION.UPDATE_STATUS(selectedOrder.id),
                statusForm
            );
            setShowUpdateStatus(false);
            setStatusForm({ status: 'in_production', notes: '' });
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleCompleteStage = async (stageId) => {
        if (!selectedOrder) return;
        try {
            await workshopApi.post(
                ENDPOINTS.WORKSHOP.PRODUCTION.COMPLETE_STAGE(selectedOrder.id, stageId),
                { notes: 'Stage completed' }
            );
            fetchData();
        } catch (error) {
            console.error('Error completing stage:', error);
            alert('Failed to complete stage');
        }
    };

    const getStatusBadge = (status) => {
        if (!status) return <Badge $status="pending">Unknown</Badge>;
        return <Badge $status={status}>{status.replace(/_/g, ' ')}</Badge>;
    };

    const activeOrders = orders.filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status));
    const completedOrders = orders.filter(o => ['completed', 'delivered'].includes(o.status));

    if (loading) {
        return (
            <Container>
                <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.textSecondary }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTop: '3px solid #C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                    <p>Loading production workflow...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <div>
                    <Title>Production Workflow</Title>
                    <p style={{ color: COLORS.textSecondary, margin: '0.25rem 0 0' }}>
                        Real-time coffin production management
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button onClick={fetchData}>
                        <RefreshCw size={18} />
                        Refresh
                    </Button>
                </div>
            </Header>

            {!connected && (
                <div style={{
                    padding: '0.75rem 1rem',
                    background: '#FEF3C7',
                    border: '1px solid #F59E0B',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    color: '#92400E'
                }}>
                    ⚠️ Real-time updates disconnected
                </div>
            )}

            <StatsGrid>
                <StatCard>
                    <StatLabel>Active Orders</StatLabel>
                    <StatValue>{activeOrders.length}</StatValue>
                </StatCard>
                <StatCard>
                    <StatLabel>Completed Today</StatLabel>
                    <StatValue>{todayCompleted.length}</StatValue>
                </StatCard>
                <StatCard>
                    <StatLabel>Total Materials</StatLabel>
                    <StatValue>{materials.length}</StatValue>
                </StatCard>
                <StatCard>
                    <StatLabel>Available Workers</StatLabel>
                    <StatValue>{workers.length}</StatValue>
                </StatCard>
            </StatsGrid>

            <Section>
                <SectionHeader>
                    <SectionTitle>
                        <ClipboardList size={20} />
                        Production Orders
                    </SectionTitle>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                            $variant={activeTab === 'active' ? 'primary' : 'secondary'}
                            onClick={() => setActiveTab('active')}
                        >
                            Active ({activeOrders.length})
                        </Button>
                        <Button
                            $variant={activeTab === 'completed' ? 'primary' : 'secondary'}
                            onClick={() => setActiveTab('completed')}
                        >
                            Completed ({completedOrders.length})
                        </Button>
                        <Button
                            $variant={activeTab === 'today' ? 'primary' : 'secondary'}
                            onClick={() => setActiveTab('today')}
                        >
                            Today ({todayCompleted.length})
                        </Button>
                    </div>
                </SectionHeader>

                {activeTab === 'active' && (
                    <>
                        {activeOrders.length === 0 ? (
                            <EmptyState>
                                <ClipboardList size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>No active orders</p>
                            </EmptyState>
                        ) : (
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Order #</Th>
                                        <Th>Customer</Th>
                                        <Th>Deceased</Th>
                                        <Th>Status</Th>
                                        <Th>Price</Th>
                                        <Th>Actions</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeOrders.map((order) => (
                                        <Tr key={order.id}>
                                            <Td>{order.order_number}</Td>
                                            <Td>{order.customer_name}</Td>
                                            <Td>{order.deceased_name}</Td>
                                            <Td>{getStatusBadge(order.status)}</Td>
                                            <Td>KES {Number(order.selling_price || 0).toLocaleString()}</Td>
                                            <Td>
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    <Button
                                                        $variant="secondary"
                                                        onClick={() => { setSelectedOrder(order); setShowAssignWorker(true); }}
                                                        title="Assign Worker"
                                                    >
                                                        <Users size={14} />
                                                    </Button>
                                                    <Button
                                                        $variant="secondary"
                                                        onClick={() => { setSelectedOrder(order); setShowUseMaterial(true); }}
                                                        title="Use Material"
                                                    >
                                                        <Package size={14} />
                                                    </Button>
                                                    <Button
                                                        $variant="secondary"
                                                        onClick={() => { setSelectedOrder(order); setShowUpdateStatus(true); }}
                                                        title="Update Status"
                                                    >
                                                        <PlayCircle size={14} />
                                                    </Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </>
                )}

                {activeTab === 'completed' && (
                    <>
                        {completedOrders.length === 0 ? (
                            <EmptyState>
                                <Check size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>No completed orders yet</p>
                            </EmptyState>
                        ) : (
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Order #</Th>
                                        <Th>Customer</Th>
                                        <Th>Deceased</Th>
                                        <Th>Status</Th>
                                        <Th>Price</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {completedOrders.map((order) => (
                                        <Tr key={order.id}>
                                            <Td>{order.order_number}</Td>
                                            <Td>{order.customer_name}</Td>
                                            <Td>{order.deceased_name}</Td>
                                            <Td>{getStatusBadge(order.status)}</Td>
                                            <Td>KES {Number(order.selling_price || 0).toLocaleString()}</Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </>
                )}

                {activeTab === 'today' && (
                    <>
                        {todayCompleted.length === 0 ? (
                            <EmptyState>
                                <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>No orders completed today</p>
                            </EmptyState>
                        ) : (
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Order #</Th>
                                        <Th>Customer</Th>
                                        <Th>Deceased</Th>
                                        <Th>Workers</Th>
                                        <Th>Materials</Th>
                                        <Th>Completed</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todayCompleted.map((order) => (
                                        <Tr key={order.id}>
                                            <Td>{order.order_number}</Td>
                                            <Td>{order.customer_name}</Td>
                                            <Td>{order.deceased_name}</Td>
                                            <Td>{order.workers_assigned}</Td>
                                            <Td>{order.materials_used}</Td>
                                            <Td>{new Date(order.updated_at).toLocaleTimeString()}</Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </>
                )}
            </Section>

            {/* Assign Worker Modal */}
            {showAssignWorker && selectedOrder && (
                <ModalOverlay>
                    <Modal>
                        <ModalHeader>
                            <ModalTitle>Assign Worker - {selectedOrder.order_number}</ModalTitle>
                            <CloseButton onClick={() => setShowAssignWorker(false)}>×</CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <FormGroup>
                                <Label>Worker *</Label>
                                <Select
                                    value={assignForm.worker_id}
                                    onChange={(e) => setAssignForm({ ...assignForm, worker_id: e.target.value })}
                                >
                                    <option value="">Select worker</option>
                                    {workers.map(w => (
                                        <option key={w.id} value={w.id}>{w.first_name} {w.last_name} - {w.role}</option>
                                    ))}
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label>Production Stage</Label>
                                <Select
                                    value={assignForm.stage}
                                    onChange={(e) => setAssignForm({ ...assignForm, stage: e.target.value })}
                                >
                                    <option value="design">Design</option>
                                    <option value="cutting">Cutting</option>
                                    <option value="assembly">Assembly</option>
                                    <option value="polishing">Polishing</option>
                                    <option value="finishing">Finishing</option>
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label>Notes</Label>
                                <Textarea
                                    placeholder="Assignment notes..."
                                    value={assignForm.notes}
                                    onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                                />
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="secondary" onClick={() => setShowAssignWorker(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleAssignWorker} disabled={!assignForm.worker_id}>
                                Assign Worker
                            </Button>
                        </ModalFooter>
                    </Modal>
                </ModalOverlay>
            )}

            {/* Use Material Modal */}
            {showUseMaterial && selectedOrder && (
                <ModalOverlay>
                    <Modal>
                        <ModalHeader>
                            <ModalTitle>Record Material Usage - {selectedOrder.order_number}</ModalTitle>
                            <CloseButton onClick={() => setShowUseMaterial(false)}>×</CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <FormGroup>
                                <Label>Material *</Label>
                                <Select
                                    value={materialForm.material_id}
                                    onChange={(e) => setMaterialForm({ ...materialForm, material_id: e.target.value })}
                                >
                                    <option value="">Select material</option>
                                    {materials.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} ({m.category}) - Stock: {m.quantity} {m.unit}
                                        </option>
                                    ))}
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label>Quantity Used *</Label>
                                <Input
                                    type="number"
                                    placeholder="Enter quantity"
                                    value={materialForm.quantity_used}
                                    onChange={(e) => setMaterialForm({ ...materialForm, quantity_used: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Notes</Label>
                                <Textarea
                                    placeholder="Usage notes..."
                                    value={materialForm.notes}
                                    onChange={(e) => setMaterialForm({ ...materialForm, notes: e.target.value })}
                                />
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="secondary" onClick={() => setShowUseMaterial(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleUseMaterial} disabled={!materialForm.material_id || !materialForm.quantity_used}>
                                Record Usage
                            </Button>
                        </ModalFooter>
                    </Modal>
                </ModalOverlay>
            )}

            {/* Update Status Modal */}
            {showUpdateStatus && selectedOrder && (
                <ModalOverlay>
                    <Modal>
                        <ModalHeader>
                            <ModalTitle>Update Order Status - {selectedOrder.order_number}</ModalTitle>
                            <CloseButton onClick={() => setShowUpdateStatus(false)}>×</CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <FormGroup>
                                <Label>Status</Label>
                                <Select
                                    value={statusForm.status}
                                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="in_production">In Production</option>
                                    <option value="design">Design</option>
                                    <option value="cutting">Cutting</option>
                                    <option value="assembly">Assembly</option>
                                    <option value="polishing">Polishing</option>
                                    <option value="finishing">Finishing</option>
                                    <option value="quality_check">Quality Check</option>
                                    <option value="completed">Completed</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label>Notes</Label>
                                <Textarea
                                    placeholder="Status update notes..."
                                    value={statusForm.notes}
                                    onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                                />
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="secondary" onClick={() => setShowUpdateStatus(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleUpdateStatus}>
                                Update Status
                            </Button>
                        </ModalFooter>
                    </Modal>
                </ModalOverlay>
            )}
        </Container>
    );
};

export default ProductionWorkflow;