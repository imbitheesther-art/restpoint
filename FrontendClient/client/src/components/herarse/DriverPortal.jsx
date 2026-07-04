import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Alert, Spinner, Card, Badge, Modal, Button, Form, Table, InputGroup
} from 'react-bootstrap';
import { Eye, RefreshCw, User, Car, CheckCircle, XCircle, Calendar, Phone, Truck, Search } from 'lucide-react';
import env from '../../config/env';

const API_BASE_URL = `${env.FULL_API_URL}`;

const getTenantSlug = () => {
    return localStorage.getItem('tenantSlug') || localStorage.getItem('tenant_slug') || 'default';
};

const bookingService = {
    getBookingsByDriver: async (driverId) => {
        const r = await fetch(`${API_BASE_URL}/drivers/${driverId}/bookings`, { headers: { 'x-tenant-slug': getTenantSlug() } });
        if (!r.ok) throw new Error('Failed');
        return (await r.json()).bookings || [];
    },
    updateBookingStatus: async (bookingId, status) => {
        const r = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-tenant-slug': getTenantSlug() },
            body: JSON.stringify({ status })
        });
        if (!r.ok) throw new Error('Failed');
        return r.json();
    }
};

const driverService = {
    getAllDrivers: async () => {
        try {
            const r = await fetch(`${API_BASE_URL}/all-drivers`, { headers: { 'x-tenant-slug': getTenantSlug() } });
            return (await r.json()).drivers || [];
        } catch { return []; }
    }
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
const genId = (id) => `BK-${String(id).padStart(4, '0')}`;

const StatusBadge = ({ status }) => {
    const cfg = {
        booked: { label: 'BOOKED', color: 'primary' }, pending: { label: 'PENDING', color: 'warning' },
        assigned: { label: 'ASSIGNED', color: 'info' }, in_transit: { label: 'IN TRANSIT', color: 'info' },
        completed: { label: 'COMPLETED', color: 'success' }, cancelled: { label: 'CANCELLED', color: 'danger' }
    };
    const c = cfg[status] || { label: status?.toUpperCase() || 'UNKNOWN', color: 'secondary' };
    return <Badge bg={c.color} className="fw-bold px-3 py-2">{c.label}</Badge>;
};

const DriverPortal = () => {
    const [drivers, setDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadDrivers();
    }, []);

    useEffect(() => {
        if (selectedDriver) {
            loadBookings(selectedDriver.driver_id);
        }
    }, [selectedDriver]);

    const loadDrivers = async () => {
        setLoading(true);
        try {
            const data = await driverService.getAllDrivers();
            setDrivers(data);
        } catch (e) {
            setError('Failed to load drivers.');
        } finally {
            setLoading(false);
        }
    };

    const loadBookings = async (driverId) => {
        setLoading(true);
        try {
            const data = await bookingService.getBookingsByDriver(driverId);
            setBookings(data);
        } catch (e) {
            setError('Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatus = async (bookingId, status) => {
        try {
            await bookingService.updateBookingStatus(bookingId, status);
            setSuccess(`Status updated to ${status}!`);
            setTimeout(() => setSuccess(''), 3000);
            // Reload bookings to reflect changes
            if (selectedDriver) {
                loadBookings(selectedDriver.driver_id);
            }
        } catch (e) {
            setError('Failed to update status.');
        }
    };

    const filteredDrivers = drivers.filter(d =>
        d.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.driver_phone?.includes(searchTerm) ||
        String(d.driver_id).includes(searchTerm)
    );

    const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
    const completedBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

    return (
        <Container fluid className="py-4 bg-light min-vh-100">
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Header */}
            <Card className="mb-3 border-0 shadow">
                <Card.Body className="bg-dark text-white rounded">
                    <h2 className="mb-0 fw-bold"><Car size={24} className="me-2" />Driver Portal</h2>
                    <small>Select your name to view your trips</small>
                </Card.Body>
            </Card>

            {!selectedDriver ? (
                <>
                    {/* Driver Selection */}
                    <Card className="shadow border-0 mb-3">
                        <Card.Header className="bg-primary text-white fw-bold">Select Driver</Card.Header>
                        <Card.Body>
                            <InputGroup className="mb-3">
                                <Form.Control
                                    placeholder="Search by name, phone, or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button variant="outline-primary"><Search size={16} /></Button>
                            </InputGroup>

                            {loading ? (
                                <div className="text-center py-4"><Spinner animation="border" /></div>
                            ) : filteredDrivers.length === 0 ? (
                                <div className="text-center py-5"><h5 className="text-muted">No drivers found</h5></div>
                            ) : (
                                <div className="table-responsive">
                                    <Table hover>
                                        <thead className="bg-light">
                                            <tr><th>ID</th><th>Name</th><th>Phone</th><th>License</th><th>Status</th></tr>
                                        </thead>
                                        <tbody>
                                            {filteredDrivers.map(d => (
                                                <tr key={d.driver_id} style={{ cursor: 'pointer' }} onClick={() => setSelectedDriver(d)}>
                                                    <td><strong>#{d.driver_id}</strong></td>
                                                    <td><strong>{d.driver_name}</strong></td>
                                                    <td>{d.driver_phone}</td>
                                                    <td><small>{d.license_number}</small></td>
                                                    <td><Badge bg={d.status === 'available' ? 'success' : 'warning'}>{d.status}</Badge></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </>
            ) : (
                <>
                    {/* Driver Info */}
                    <Card className="shadow border-0 mb-3">
                        <Card.Body className="bg-info text-white rounded d-flex justify-content-between align-items-center">
                            <div>
                                <h4 className="mb-0 fw-bold"><User size={20} className="me-2" />{selectedDriver.driver_name}</h4>
                                <small>Driver ID: #{selectedDriver.driver_id} | Phone: {selectedDriver.driver_phone}</small>
                            </div>
                            <Button variant="outline-light" onClick={() => { setSelectedDriver(null); setBookings([]); }}>
                                <RefreshCw size={16} className="me-2" />Change Driver
                            </Button>
                        </Card.Body>
                    </Card>

                    {/* Stats */}
                    <Row className="mb-3 g-2">
                        <Col><Card className="text-white bg-primary border-0 shadow-sm"><Card.Body className="py-2 text-center"><h4 className="mb-0 fw-bold">{activeBookings.length}</h4><small>Active Trips</small></Card.Body></Card></Col>
                        <Col><Card className="text-white bg-success border-0 shadow-sm"><Card.Body className="py-2 text-center"><h4 className="mb-0 fw-bold">{completedBookings.length}</h4><small>Completed</small></Card.Body></Card></Col>
                        <Col><Card className="text-white bg-info border-0 shadow-sm"><Card.Body className="py-2 text-center"><h4 className="mb-0 fw-bold">{bookings.filter(b => b.status === 'in_transit').length}</h4><small>In Transit</small></Card.Body></Card></Col>
                    </Row>

                    {/* Active Trips */}
                    <Card className="shadow border-0 mb-3">
                        <Card.Header className="bg-warning text-dark fw-bold">Active Trips</Card.Header>
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="bg-light">
                                    <tr><th>Booking ID</th><th>Client</th><th>Destination</th><th>Hearse</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {activeBookings.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-5"><h5 className="text-muted">No active trips</h5></td></tr>
                                    ) : activeBookings.map(b => (
                                        <tr key={b.booking_id} className="align-middle">
                                            <td><strong className="text-primary">{genId(b.booking_id)}</strong></td>
                                            <td><strong>{b.client_name}</strong><br /><small className="text-muted">{b.client_phone}</small></td>
                                            <td><strong>{b.destination}</strong></td>
                                            <td><strong>{b.plate_number || b.number_plate || 'N/A'}</strong><br /><small className="text-muted">{b.hearse_name || ''}</small></td>
                                            <td>{fmtDate(b.booking_date)}</td>
                                            <td><StatusBadge status={b.status} /></td>
                                            <td>
                                                <div className="d-flex gap-1 flex-wrap">
                                                    {b.status === 'assigned' && (
                                                        <Button size="sm" variant="info" onClick={() => handleStatus(b.booking_id, 'in_transit')}><Truck size={14} className="me-1" />Start Trip</Button>
                                                    )}
                                                    {b.status === 'in_transit' && (
                                                        <Button size="sm" variant="success" onClick={() => handleStatus(b.booking_id, 'completed')}><CheckCircle size={14} className="me-1" />Complete</Button>
                                                    )}
                                                    <Button size="sm" variant="danger" onClick={() => handleStatus(b.booking_id, 'cancelled')}><XCircle size={14} className="me-1" />Cancel</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card>

                    {/* Completed Trips */}
                    {completedBookings.length > 0 && (
                        <Card className="shadow border-0">
                            <Card.Header className="bg-success text-white fw-bold">Completed / Cancelled Trips</Card.Header>
                            <div className="table-responsive">
                                <Table hover className="mb-0">
                                    <thead className="bg-light">
                                        <tr><th>Booking ID</th><th>Client</th><th>Destination</th><th>Hearse</th><th>Date</th><th>Status</th></tr>
                                    </thead>
                                    <tbody>
                                        {completedBookings.map(b => (
                                            <tr key={b.booking_id} className="align-middle">
                                                <td><strong className="text-primary">{genId(b.booking_id)}</strong></td>
                                                <td><strong>{b.client_name}</strong></td>
                                                <td><strong>{b.destination}</strong></td>
                                                <td><strong>{b.plate_number || b.number_plate || 'N/A'}</strong></td>
                                                <td>{fmtDate(b.booking_date)}</td>
                                                <td><StatusBadge status={b.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </Container>
    );
};

export default DriverPortal;