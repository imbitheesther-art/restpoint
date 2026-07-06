import React from 'react';
import { Package } from 'lucide-react';
import { Section, SectionHeader, SectionTitle, Table, Th, Td, Tr, Badge, EmptyState } from '../styles/theme';

const MaterialsInventory = ({ materials }) => {
    if (!materials || materials.length === 0) {
        return (
            <Section>
                <SectionHeader>
                    <SectionTitle><Package size={18} /> Workshop Materials Inventory</SectionTitle>
                </SectionHeader>
                <EmptyState>
                    <Package size={48} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                    <p>No materials in inventory</p>
                </EmptyState>
            </Section>
        );
    }
    return (
        <Section>
            <SectionHeader>
                <SectionTitle>
                    <Package size={18} /> Workshop Materials Inventory
                </SectionTitle>
            </SectionHeader>
            <Table>
                <thead>
                    <tr>
                        <Th>Material</Th>
                        <Th>Category</Th>
                        <Th>In Stock</Th>
                        <Th>Unit</Th>
                        <Th>Unit Price</Th>
                        <Th>Status</Th>
                    </tr>
                </thead>
                <tbody>
                    {materials.map(m => (
                        <Tr key={m.id}>
                            <Td><strong>{m.name}</strong></Td>
                            <Td><Badge $status={m.category}>{m.category}</Badge></Td>
                            <Td style={{ fontWeight: 600 }}>{m.quantity}</Td>
                            <Td>{m.unit}</Td>
                            <Td>KES {Number(m.unit_price || 0).toLocaleString()}</Td>
                            <Td>
                                {m.quantity <= (m.min_stock_level || 0) ? (
                                    <Badge $status="pending">Low Stock ⚠️</Badge>
                                ) : (
                                    <Badge $status="completed">In Stock</Badge>
                                )}
                            </Td>
                        </Tr>
                    ))}
                </tbody>
            </Table>
        </Section>
    );
};

export default MaterialsInventory;