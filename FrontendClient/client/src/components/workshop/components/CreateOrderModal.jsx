import React from 'react';
import { Plus } from 'lucide-react';
import { ModalOverlay, Modal, ModalHeader, ModalTitle, CloseBtn, ModalBody, ModalFooter, FormGroup, Label, Input, Select, TextArea, Button } from '../styles/theme';

const CreateOrderModal = ({ show, onClose, form, onChange, onSubmit }) => {
    if (!show) return null;

    return (
        <ModalOverlay>
            <Modal>
                <ModalHeader>
                    <ModalTitle>📋 New Coffin Order</ModalTitle>
                    <CloseBtn onClick={onClose}>✕</CloseBtn>
                </ModalHeader>
                <ModalBody>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <FormGroup>
                            <Label>Customer Name *</Label>
                            <Input placeholder="e.g. Peter Mumo" value={form.customer_name} onChange={(e) => onChange({ ...form, customer_name: e.target.value })} />
                        </FormGroup>
                        <FormGroup>
                            <Label>Deceased Name *</Label>
                            <Input placeholder="e.g. Mumo" value={form.deceased_name} onChange={(e) => onChange({ ...form, deceased_name: e.target.value })} />
                        </FormGroup>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <FormGroup>
                            <Label>Coffin Type</Label>
                            <Select value={form.coffin_type} onChange={(e) => onChange({ ...form, coffin_type: e.target.value })}>
                                <option value="standard">Standard</option>
                                <option value="premium">Premium</option>
                                <option value="deluxe">Deluxe</option>
                                <option value="custom">Custom</option>
                            </Select>
                        </FormGroup>
                        <FormGroup>
                            <Label>Selling Price (KES)</Label>
                            <Input type="number" placeholder="0" value={form.selling_price} onChange={(e) => onChange({ ...form, selling_price: e.target.value })} />
                        </FormGroup>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <FormGroup>
                            <Label>Color</Label>
                            <Select value={form.color} onChange={(e) => onChange({ ...form, color: e.target.value })}>
                                <option value="walnut">Walnut Brown</option>
                                <option value="mahogany">Mahogany Red</option>
                                <option value="oak">Oak Natural</option>
                                <option value="black">Ebony Black</option>
                                <option value="white">White</option>
                            </Select>
                        </FormGroup>
                        <FormGroup>
                            <Label>Interior</Label>
                            <Select value={form.interior} onChange={(e) => onChange({ ...form, interior: e.target.value })}>
                                <option value="satin_gold">Satin Gold</option>
                                <option value="satin_white">Satin White</option>
                                <option value="velvet_red">Velvet Red</option>
                                <option value="velvet_blue">Velvet Blue</option>
                            </Select>
                        </FormGroup>
                        <FormGroup>
                            <Label>Delivery Date</Label>
                            <Input type="date" value={form.delivery_date} onChange={(e) => onChange({ ...form, delivery_date: e.target.value })} />
                        </FormGroup>
                    </div>
                    <FormGroup>
                        <Label>Dimensions (m)</Label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                            <Input type="number" placeholder="Length" value={form.dimensions.length} onChange={(e) => onChange({ ...form, dimensions: { ...form.dimensions, length: e.target.value } })} />
                            <Input type="number" placeholder="Width" value={form.dimensions.width} onChange={(e) => onChange({ ...form, dimensions: { ...form.dimensions, width: e.target.value } })} />
                            <Input type="number" placeholder="Height" value={form.dimensions.height} onChange={(e) => onChange({ ...form, dimensions: { ...form.dimensions, height: e.target.value } })} />
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <Label>Notes</Label>
                        <TextArea placeholder="Special requirements, custom requests..." value={form.notes} onChange={(e) => onChange({ ...form, notes: e.target.value })} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button $variant="accent" onClick={onSubmit} disabled={!form.customer_name || !form.deceased_name}>
                        <Plus size={16} /> Create Order
                    </Button>
                </ModalFooter>
            </Modal>
        </ModalOverlay>
    );
};

export default CreateOrderModal;