import React from 'react';
import { Plus } from '../../utils/icons/icons';
import { ModalOverlay, Modal, ModalHeader, ModalTitle, CloseBtn, ModalBody, ModalFooter, FormGroup, Label, Input, TextArea, Button } from '../styles/theme.jsx';

const CreateOrderModal = ({ show, onClose, form, onChange, onSubmit }) => {
    if (!show) return null;

    return (
        <ModalOverlay>
            <Modal>
                <ModalHeader>
                    <ModalTitle>New Coffin Order</ModalTitle>
                    <CloseBtn onClick={onClose}>X</CloseBtn>
                </ModalHeader>
                <ModalBody>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <FormGroup>
                            <Label>Customer Name *</Label>
                            <Input placeholder="e.g. Peter Mumo" value={form.customer_name} onChange={(e) => onChange({ ...form, customer_name: e.target.value })} />
                        </FormGroup>
                        <FormGroup>
                            <Label>Deceased Name (optional)</Label>
                            <Input placeholder="e.g. Late Mumo" value={form.deceased_name} onChange={(e) => onChange({ ...form, deceased_name: e.target.value })} />
                        </FormGroup>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <FormGroup>
                            <Label>Coffin Type</Label>
                            <Input placeholder="e.g. Standard, Premium, Custom..." value={form.coffin_type} onChange={(e) => onChange({ ...form, coffin_type: e.target.value })} />
                        </FormGroup>
                        <FormGroup>
                            <Label>Priority</Label>
                            <select value={form.priority || 'normal'} onChange={(e) => onChange({ ...form, priority: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' }}>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </FormGroup>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <FormGroup>
                            <Label>Color / Finish</Label>
                            <Input placeholder="e.g. Walnut, Mahogany, White..." value={form.color} onChange={(e) => onChange({ ...form, color: e.target.value })} />
                        </FormGroup>
                        <FormGroup>
                            <Label>Interior Fabric / Finish</Label>
                            <Input placeholder="e.g. Satin Gold, Velvet Red..." value={form.interior} onChange={(e) => onChange({ ...form, interior: e.target.value })} />
                        </FormGroup>
                        <FormGroup>
                            <Label>Delivery Date</Label>
                            <Input type="date" value={form.delivery_date} onChange={(e) => onChange({ ...form, delivery_date: e.target.value })} />
                        </FormGroup>
                    </div>
                    <FormGroup>
                        <Label>Dimensions (mm, cm, or m - specify unit)</Label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                            <Input placeholder="e.g. 2000mm or 2m (Length)" value={form.dimensions.length} onChange={(e) => onChange({ ...form, dimensions: { ...form.dimensions, length: e.target.value } })} />
                            <Input placeholder="e.g. 800mm or 0.8m (Width)" value={form.dimensions.width} onChange={(e) => onChange({ ...form, dimensions: { ...form.dimensions, width: e.target.value } })} />
                            <Input placeholder="e.g. 600mm or 0.6m (Height)" value={form.dimensions.height} onChange={(e) => onChange({ ...form, dimensions: { ...form.dimensions, height: e.target.value } })} />
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <Label>Notes</Label>
                        <TextArea placeholder="Special requirements, custom requests..." value={form.notes} onChange={(e) => onChange({ ...form, notes: e.target.value })} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button $variant="accent" onClick={onSubmit} disabled={!form.customer_name}>
                        <Plus size={16} /> Create Order
                    </Button>
                </ModalFooter>
            </Modal>
        </ModalOverlay>
    );
};

export default CreateOrderModal;