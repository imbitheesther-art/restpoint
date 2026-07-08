import React from 'react';
import { ClipboardList, Eye, Download, Plus } from 'lucide-react';
import { Section, SectionHeader, SectionTitle, Table, Th, Td, Tr, Badge, EmptyState, Button } from '../styles/theme.jsx';

const AllOrdersTable = ({ orders, onViewOrder, onDownloadPDF, onCreateOrder }) => {
    const getStatusBadge = (s) => {
        if (!s) return <Badge $status="pending">Unknown</Badge>;
        return <Badge $status={s}>{s.replace(/_/g, ' ')}</Badge>;
    };

    return (
        <Section>
            <SectionHeader>
                <SectionTitle>
                    <ClipboardList size={18} /> All Orders
                </SectionTitle>
                <Button $variant="accent" onClick={onCreateOrder}>
                    <Plus size={16} /> New Order
                </Button>
            </SectionHeader>
            {!orders || orders.length === 0 ? (
                <EmptyState>
                    <ClipboardList size={48} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                    <p>No orders registered</p>
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
                        {orders.map(order => (
                            <Tr key={order.id} onClick={() => onViewOrder(order.id)}>
                                <Td><strong>{order.order_number || `#${order.id}`}</strong></Td>
                                <Td>{order.customer_name}</Td>
                                <Td>{order.deceased_name}</Td>
                                <Td style={{ textTransform: 'capitalize' }}>{order.coffin_type}</Td>
                                <Td>{getStatusBadge(order.status)}</Td>
                                <Td>KES {Number(order.selling_price || 0).toLocaleString()}</Td>
                                <Td>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <Button style={{ padding: '0.35rem 0.6rem' }} onClick={(e) => { e.stopPropagation(); onViewOrder(order.id); }}>
                                            <Eye size={14} />
                                        </Button>
                                        <Button style={{ padding: '0.35rem 0.6rem' }} onClick={(e) => { e.stopPropagation(); onDownloadPDF(order.id); }}>
                                            <Download size={14} />
                                        </Button>
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Section>
    );
};

export default AllOrdersTable;