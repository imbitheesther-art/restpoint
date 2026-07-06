import React from 'react';
import { ClipboardList, Eye, Download, ChevronRight } from 'lucide-react';
import { COLORS, Section, SectionHeader, SectionTitle, Table, Th, Td, Tr, Badge, MiniProgress, EmptyState, Button } from '../styles/theme';

const ActiveOrdersTable = ({ orders, onViewOrder, onDownloadPDF, onViewAll }) => {
    if (!orders || orders.length === 0) {
        return (
            <Section>
                <SectionHeader>
                    <SectionTitle><ClipboardList size={18} /> Active Production Queue</SectionTitle>
                </SectionHeader>
                <EmptyState>
                    <ClipboardList size={48} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                    <p>No orders yet. Create your first coffin order to start production.</p>
                </EmptyState>
            </Section>
        );
    }

    const getStatusBadge = (s) => {
        if (!s) return <Badge $status="pending">Unknown</Badge>;
        return <Badge $status={s}>{s.replace(/_/g, ' ')}</Badge>;
    };

    const getProgress = (order) => {
        if (!order) return 0;
        if (['completed', 'delivered'].includes(order.status)) return 100;
        if (order.status === 'in_production' || order.status === 'in-production') return 60;
        if (['design', 'cutting', 'assembly', 'polishing', 'finishing', 'quality_check'].includes(order.status)) return 40;
        if (order.status === 'pending') return 10;
        return 25;
    };

    return (
        <Section>
            <SectionHeader>
                <SectionTitle><ClipboardList size={18} /> Active Production Queue</SectionTitle>
                <Button onClick={onViewAll}>
                    View All <ChevronRight size={14} />
                </Button>
            </SectionHeader>
            <Table>
                <thead>
                    <tr>
                        <Th>Order #</Th>
                        <Th>Customer / Deceased</Th>
                        <Th>Type</Th>
                        <Th>Stage</Th>
                        <Th>Progress</Th>
                        <Th>Actions</Th>
                    </tr>
                </thead>
                <tbody>
                    {orders.slice(0, 6).map(order => (
                        <Tr key={order.id} onClick={() => onViewOrder(order.id)}>
                            <Td><strong>{order.order_number || `#${order.id}`}</strong></Td>
                            <Td>
                                <div style={{ fontWeight: 500 }}>{order.customer_name}</div>
                                <div style={{ fontSize: '0.75rem', color: COLORS.textMuted }}>Deceased: {order.deceased_name}</div>
                            </Td>
                            <Td style={{ textTransform: 'capitalize' }}>{order.coffin_type}</Td>
                            <Td>{getStatusBadge(order.status)}</Td>
                            <Td>
                                <MiniProgress $percent={getProgress(order)}>
                                    <div />
                                </MiniProgress>
                                {getProgress(order)}%
                            </Td>
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
        </Section>
    );
};

export default ActiveOrdersTable;