import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Alert, Spinner, Card, Badge, Modal, Button, Form, Table
} from 'react-bootstrap';
import { useSocket } from '../../context/socketContext';
import { Eye, RefreshCw, Clock, User, Car, CheckCircle, XCircle, AlertCircle, Calendar, Phone, Truck, Search, MoreVertical } from 'lucide-react';
import env from '../../config/env';

const API_BASE_URL = `${env.FULL_API_URL}`;

const getTenantSlug = () => {
    return localStorage.getItem('tenantSlug') || localStorage.getItem('tenant_slug') || 'default';
};

const bookingService = {
    getBookings: async () => {
        const r = await fetch(`${API_BASE_URL}/hearse-bookings`, { headers: { 'x-tenant-slug': getTenantSlug() } });
        if (!r.ok) throw new Error('Failed');
        return (await r.json()).bookings || [];
    },
    getAllHearses: async () => {
        const r = await fetch(`${API_BASE_URL}/hearses`, { headers: { 'x-tenant-slug': getTenantSlug() } });
        if (!r.ok) throw new Error('Failed');
        return (await r.json()).hearses || [];
    },
    createBooking: async (data) => {
        const r = await fetch(`${API_BASE_URL}/hearse-bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-tenant-slug': getTenantSlug() },
            body: JSON.stringify(data)
        });
        if (!r.ok) throw new Error('Failed');
        return r.json();
    },
    registerHearse: async (data) => {
        const fd = new FormData();
        fd.append('plate_number', data.plate_number);
        fd.append('hearse_name', data.hearse_name || '');
        fd.append('model', data.model || '');
        fd.append('capacity', data.capacity || 1);
        fd.append('branch_code', data.branch_code || '');
        const r = await fetch(`${API_BASE_URL}/hearses`, {
            method: 'POST',
            headers: { 'x-tenant-slug': getTenantSlug() },
            body: fd
        });
        if (!r.ok) throw new Error('Failed');
        return r.json();
    },
    updateBookingStatus: async (bookingId, status) => {
        const r = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-tenant-slug': getTenantSlug() },
            body: JSON.stringify({ status })
        });
        if (!r.ok) throw new Error('Failed');
        return r.json();
    },
    postponeBooking: async (bookingId, data) => {
        const r = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/postpone`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'x-tenant-slug': getTenantSlug() },
            body: JSON.stringify(data)
        });
        if (!r.ok) throw new Error('Failed');
        return r.json();
    }
};

const driverService = {
    getDrivers: async () => {
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
        booked: { label: 'BOOKED', color: 'primary' }, in_transit: { label: 'IN TRANSIT', color: 'info' },
        completed: { label: 'COMPLETED', color: 'success' }, cancelled: { label: 'CANCELLED', color: 'danger' },
        postponed: { label: 'POSTPONED', color: 'warning' }
    };
    const c = cfg[status] || { label: status?.toUpperCase() || 'UNKNOWN', color: 'secondary' };
    return <Badge bg={c.color} className="fw-bold px-2 py-1">{c.label}</Badge>;
};

// Available Hearses Modal with booking form
const AvailableHearsesModal = ({ show, onHide, onBookingCreated }) => {
    const [hearses, setHearses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (show) {
            setSelected(null);
            setBookingDate(''); setClientName(''); setClientPhone('');
            setFromLocation(''); setToLocation('');
            loadHearses();
        }
    }, [show]);

    const loadHearses = async () => {
        setLoading(true);
        try {
            // Add timestamp to prevent caching without triggering CORS preflight
            const r = await fetch(`${API_BASE_URL}/hearses?t=${Date.now()}`, {
                headers: { 'x-tenant-slug': getTenantSlug() }
            });
            const data = await r.json();
            console.log('Hearses API response:', data);
            const hearses = data.hearses || data || [];
            console.log('All hearses:', hearses);
            // Filter for hearses with status 'available' only
            const available = hearses.filter(h => h.status === 'available');
            console.log('Available hearses:', available);
            setHearses(available);
        } catch (e) {
            console.error('Failed to load hearses:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        if (!selected || !bookingDate || !clientName || !fromLocation || !toLocation) return;
        setSubmitting(true);
        try {
            const bookingData = {
                hearse_id: selected.id,
                client_name: clientName,
                client_phone: clientPhone || '',
                destination: `${fromLocation} to ${toLocation}`,
                from_timestamp: bookingDate,
                to_timestamp: bookingDate
            };

            // Add user ID if logged in
            const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
            if (userId) {
                bookingData.created_by = parseInt(userId);
            }

            await bookingService.createBooking(bookingData);
            onBookingCreated();
            onHide();
        } catch (e) {
            console.error('Booking failed:', e);
            alert('Booking failed: ' + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="bg-dark text-white">
                <Modal.Title className="fw-bold"><Truck size={20} className="me-2" />Available Hearses</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {!selected ? (
                    <>
                        {loading ? (
                            <div className="text-center py-4"><Spinner animation="border" /></div>
                        ) : hearses.length === 0 ? (
                            <div className="text-center py-5"><h5 className="text-muted">No hearses available</h5></div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover size="sm">
                                    <thead className="bg-light">
                                        <tr><th>ID</th><th>Name</th><th>Plate</th><th>Model</th><th>Capacity</th><th>Branch</th><th>Action</th></tr>
                                    </thead>
                                    <tbody>
                                        {hearses.map(h => (
                                            <tr key={h.id}>
                                                <td><strong>{h.hearse_code || `#${h.id}`}</strong></td>
                                                <td><strong>{h.hearse_name || 'N/A'}</strong></td>
                                                <td><strong className="text-primary">{h.plate_number || h.number_plate}</strong></td>
                                                <td>{h.model || 'N/A'}</td>
                                                <td>{h.capacity || 'N/A'}</td>
                                                <td><strong className="text-primary">{h.branch_code || h.branch_name || 'N/A'}</strong></td>
                                                <td>
                                                    <Button size="sm" variant="success" onClick={() => setSelected(h)}>
                                                        <Car size={14} className="me-1" />Book
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="alert alert-info mb-3">
                            <strong>Selected:</strong> {selected.hearse_name} ({selected.plate_number || selected.number_plate})
                        </div>
                        <h5 className="fw-bold mb-3">Booking Details</h5>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Booking Date *</Form.Label>
                            <Form.Control type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Client Name *</Form.Label>
                                    <Form.Control value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Full name" required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Phone (Optional)</Form.Label>
                                    <Form.Control value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="0712345678" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">From (Location) *</Form.Label>
                                    <Form.Control value={fromLocation} onChange={e => setFromLocation(e.target.value)} placeholder="e.g., Nairobi Hospital" required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">To (Destination) *</Form.Label>
                                    <Form.Control value={toLocation} onChange={e => setToLocation(e.target.value)} placeholder="e.g., Nairobi Cemetery" required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-between mt-3">
                            <Button variant="outline-secondary" onClick={() => setSelected(null)}>Back</Button>
                            <Button variant="success" onClick={handleBook} disabled={!bookingDate || !clientName || !fromLocation || !toLocation || submitting}>
                                {submitting ? <><Spinner animation="border" size="sm" className="me-2" />Booking...</> : <><CheckCircle size={16} className="me-2" />Confirm Booking</>}
                            </Button>
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

// Main Component
const BookingSystem = () => {
    const [bookings, setBookings] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [hearses, setHearses] = useState([]);
    const [filter, setFilter] = useState('booked');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showPostpone, setShowPostpone] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showHearses, setShowHearses] = useState(false);
    const [showAvailable, setShowAvailable] = useState(false);
    const [registerForm, setRegisterForm] = useState({ plate_number: '', hearse_name: '', model: '', capacity: '', branch_code: '' });
    const [registering, setRegistering] = useState(false);
    const [availabilityResult, setAvailabilityResult] = useState(null);
    const { socket } = useSocket();

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('new_booking', (d) => { setBookings(p => [d.booking, ...p]); });
        socket.on('booking_status_updated', (d) => { setBookings(p => p.map(b => b.booking_id === d.booking_id ? { ...b, status: d.status, ...d.booking } : b)); });
        return () => { socket.off('new_booking'); socket.off('booking_status_updated'); };
    }, [socket]);

    const loadData = async () => {
        setLoading(true); setError('');
        try {
            const [b, d] = await Promise.all([
                fetch(`${API_BASE_URL}/hearse-bookings?t=${Date.now()}`, { headers: { 'x-tenant-slug': getTenantSlug() } }).then(r => r.json()),
                driverService.getDrivers()
            ]);
            // Ensure bookings is always an array
            const bookingsData = Array.isArray(b.bookings) ? b.bookings : (Array.isArray(b) ? b : []);
            setBookings(bookingsData);
            setDrivers(d);
        } catch (e) {
            setError('Failed to load data.');
            console.error(e);
        }
        setLoading(false);
    };

    const loadHearses = async () => {
        try {
            const data = await bookingService.getAllHearses();
            setHearses(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleStatus = async (id, s) => {
        try { await bookingService.updateBookingStatus(id, s); setSuccess('Status updated!'); setTimeout(() => setSuccess(''), 3000); }
        catch (e) { setError('Failed.'); }
    };

    const handlePostpone = async (id, d) => {
        try { await bookingService.postponeBooking(id, d); setSuccess('Postponed!'); setTimeout(() => setSuccess(''), 3000); loadData(); }
        catch (e) { setError('Failed.'); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegistering(true);
        try {
            await bookingService.registerHearse(registerForm);
            setSuccess('Registered!');
            setTimeout(() => setSuccess(''), 3000);
            setShowRegister(false);
            setRegisterForm({ plate_number: '', hearse_name: '', model: '', capacity: '', branch_code: '' });
            loadHearses();
        } catch (e) {
            setError('Failed.');
            console.error(e);
        }
        setRegistering(false);
    };

    const checkAvailability = async () => {
        const date = document.getElementById('availabilityDate')?.value;
        if (!date) { alert('Please select a date'); return; }

        try {
            const r = await fetch(`${API_BASE_URL}/hearse-bookings/availability?date=${date}`, {
                headers: { 'x-tenant-slug': getTenantSlug() }
            });
            const data = await r.json();
            if (data.status === 'success') {
                setAvailabilityResult({
                    available: data.available_hearses.length,
                    booked: data.booked_hearses.length
                });
                alert(`Available hearses on ${date}: ${data.available_hearses.length}\nBooked: ${data.booked_hearses.length}`);
            }
        } catch (e) {
            alert('Failed to check availability');
        }
    };

    const filtered = bookings.filter(b => {
        if (filter === 'all') return !['completed', 'cancelled', 'postponed'].includes(b.status);
        return b.status === filter;
    });

    if (loading) return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="text-center"><Spinner animation="border" variant="primary" className="mb-3" /><h4>Loading...</h4></div>
        </Container>
    );

    return (
        <Container fluid className="py-3 bg-light min-vh-100">
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Clean Header */}
            <div className="bg-white shadow-sm mb-3" style={{ borderRadius: '4px' }}>
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                    <div>
                        <h3 className="mb-0 fw-bold" style={{ fontSize: '1.1rem' }}><Car size={18} className="me-2" />Bookings</h3>
                        <small>{socket?.connected && <Badge bg="success" className="ms-2">Live</Badge>}</small>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="outline-dark" size="sm" onClick={loadData} style={{ borderRadius: '4px' }}><RefreshCw size={14} /></Button>
                        <Button variant="dark" size="sm" onClick={() => setShowAvailable(true)} style={{ borderRadius: '4px' }}><Truck size={14} className="me-1" />Available</Button>
                        <Button variant="dark" size="sm" onClick={() => setShowRegister(true)} style={{ borderRadius: '4px' }}><Car size={14} className="me-1" />Register</Button>
                    </div>
                </div>
                <div className="p-3 bg-light">
                    <Row className="g-2 align-items-center">
                        <Col xs={12} md={4}>
                            <div className="d-flex gap-2">
                                <Form.Control type="date" id="availabilityDate" size="sm" style={{ borderRadius: '4px', fontSize: '0.8rem' }} />
                                <Button variant="dark" size="sm" onClick={checkAvailability} style={{ borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                    <Search size={12} className="me-1" />Check
                                </Button>
                                <Button variant="outline-dark" size="sm" onClick={async () => { await loadHearses(); setShowHearses(true); }} style={{ borderRadius: '4px', fontSize: '0.8rem' }}>
                                    All Hearses
                                </Button>
                            </div>
                        </Col>
                        <Col xs={12} md={8}>
                            <div className="d-flex flex-wrap gap-1 justify-content-md-end">
                                {['booked', 'in_transit', 'completed', 'cancelled', 'postponed'].map(k => {
                                    const bgColors = {
                                        booked: 'primary', in_transit: 'info',
                                        completed: 'success', cancelled: 'danger', postponed: 'warning'
                                    };
                                    return (
                                        <Button key={k} variant={filter === k ? bgColors[k] : `outline-${bgColors[k]}`} size="sm" className="px-2 fw-bold" style={{ borderRadius: '4px', fontSize: '0.75rem' }} onClick={() => setFilter(k)}>
                                            {`${k.replace('_', ' ').toUpperCase()} (${bookings.filter(b => b.status === k).length})`}
                                        </Button>
                                    );
                                })}
                            </div>
                        </Col>
                    </Row>
                    {availabilityResult && (
                        <div className="mt-2">
                            <Badge bg="success" className="me-1">{availabilityResult.available} Available</Badge>
                            <Badge bg="danger">{availabilityResult.booked} Booked</Badge>
                        </div>
                    )}
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white shadow-sm" style={{ borderRadius: '4px', overflow: 'hidden' }}>
                <div className="table-responsive">
                    <Table hover className="mb-0" size="sm">
                        <thead className="bg-light">
                            <tr><th>ID</th><th>Client</th><th>Destination</th><th>Hearse</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-5"><h5 className="text-muted">No bookings</h5></td></tr>
                            ) : filtered.map(b => (
                                <tr key={b.booking_id} className="align-middle">
                                    <td><strong className="text-primary">{genId(b.booking_id)}</strong><br /><small className="text-muted">{fmtDate(b.created_at)}</small></td>
                                    <td><strong>{b.client_name}</strong><br /><small className="text-muted">{b.client_phone}</small></td>
                                    <td><strong>{b.destination}</strong></td>
                                    <td><strong>{b.plate_number || b.number_plate || 'N/A'}</strong><br /><small className="text-muted">{b.hearse_name || ''}</small></td>
                                    <td>{fmtDate(b.booking_date || b.estimated_departure_time)}</td>
                                    <td><StatusBadge status={b.status} /></td>
                                    <td style={{ position: 'relative', overflow: 'visible' }}>
                                        <div className="dropdown" style={{ position: 'static' }}>
                                            <Button variant="outline-secondary" size="sm" id={`actions-${b.booking_id}`} data-bs-toggle="dropdown" aria-expanded="false" style={{ borderRadius: '4px' }}>
                                                <MoreVertical size={14} className="me-1" />Actions
                                            </Button>
                                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={`actions-${b.booking_id}`} style={{ position: 'fixed', zIndex: 99999 }}>
                                                <li><button className="dropdown-item" onClick={() => { setSelectedBooking(b); setShowDetails(true); }}><Eye size={14} className="me-2" />View Details</button></li>
                                                <li><hr className="dropdown-divider" /></li>
                                                {b.status === 'booked' && (
                                                    <li><button className="dropdown-item text-info" onClick={() => handleStatus(b.booking_id, 'in_transit')}><Truck size={14} className="me-2" />Mark In Transit</button></li>
                                                )}
                                                {b.status === 'in_transit' && (
                                                    <li><button className="dropdown-item text-success" onClick={() => handleStatus(b.booking_id, 'completed')}><CheckCircle size={14} className="me-2" />Mark Completed</button></li>
                                                )}
                                                <li><button className="dropdown-item text-danger" onClick={() => handleStatus(b.booking_id, 'cancelled')}><XCircle size={14} className="me-2" />Cancel Booking</button></li>
                                                <li><hr className="dropdown-divider" /></li>
                                                <li><button className="dropdown-item text-warning" onClick={() => { setSelectedBooking(b); setShowPostpone(true); }}><Calendar size={14} className="me-2" />Postpone</button></li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>

            {/* Details Modal */}
            <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-dark text-white"><Modal.Title className="fw-bold">Booking {genId(selectedBooking?.booking_id)}</Modal.Title></Modal.Header>
                <Modal.Body className="p-4">
                    <Row className="g-3">
                        <Col md={6}><Card className="border-0 shadow-sm"><Card.Header className="bg-light fw-bold"><User size={16} className="me-2" />Client</Card.Header><Card.Body>
                            <div><strong>Name:</strong> {selectedBooking?.client_name}</div>
                            <div><strong>Phone:</strong> {selectedBooking?.client_phone}</div>
                            <div><strong>Email:</strong> {selectedBooking?.client_email || 'N/A'}</div>
                        </Card.Body></Card></Col>
                        <Col md={6}><Card className="border-0 shadow-sm"><Card.Header className="bg-light fw-bold"><Car size={16} className="me-2" />Service</Card.Header><Card.Body>
                            <div><strong>Destination:</strong> {selectedBooking?.destination}</div>
                            <div><strong>Hearse:</strong> {selectedBooking?.hearse_name || selectedBooking?.plate_number || selectedBooking?.number_plate || 'N/A'}</div>
                            <div><strong>Date:</strong> {fmtDate(selectedBooking?.booking_date || selectedBooking?.estimated_departure_time)}</div>
                        </Card.Body></Card></Col>
                    </Row>
                </Modal.Body>
            </Modal>

            {/* Postpone Modal */}
            <PostponeModal show={showPostpone} onHide={() => setShowPostpone(false)} booking={selectedBooking} onPostpone={handlePostpone} />

            {/* Available Hearses Modal */}
            <AvailableHearsesModal show={showAvailable} onHide={() => setShowAvailable(false)} onBookingCreated={loadData} />

            {/* Register Hearse Modal */}
            <Modal show={showRegister} onHide={() => setShowRegister(false)} centered>
                <Modal.Header closeButton className="bg-dark text-white"><Modal.Title className="fw-bold"><Car size={20} className="me-2" />Register Hearse</Modal.Title></Modal.Header>
                <form onSubmit={handleRegister}>
                    <Modal.Body className="p-4">
                        <Form.Group className="mb-3"><Form.Label className="fw-semibold">Hearse Name *</Form.Label><Form.Control value={registerForm.hearse_name} onChange={e => setRegisterForm(p => ({ ...p, hearse_name: e.target.value }))} placeholder="e.g., Mercedes Sprinter" required /></Form.Group>
                        <Row className="g-3">
                            <Col md={6}><Form.Group><Form.Label className="fw-semibold">Plate *</Form.Label><Form.Control value={registerForm.plate_number} onChange={e => setRegisterForm(p => ({ ...p, plate_number: e.target.value }))} placeholder="KCA 1234" required /></Form.Group></Col>
                            <Col md={6}><Form.Group><Form.Label className="fw-semibold">Model</Form.Label><Form.Control value={registerForm.model} onChange={e => setRegisterForm(p => ({ ...p, model: e.target.value }))} placeholder="Toyota Hiace" /></Form.Group></Col>
                            <Col md={6}><Form.Group><Form.Label className="fw-semibold">Capacity</Form.Label><Form.Control type="number" value={registerForm.capacity} onChange={e => setRegisterForm(p => ({ ...p, capacity: e.target.value }))} placeholder="4" min="1" /></Form.Group></Col>
                            <Col md={6}><Form.Group><Form.Label className="fw-semibold">Branch Code *</Form.Label><Form.Control value={registerForm.branch_code} onChange={e => setRegisterForm(p => ({ ...p, branch_code: e.target.value }))} placeholder="e.g., NBI, MBS, KSL" required /></Form.Group></Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={() => setShowRegister(false)}>Cancel</Button>
                        <Button variant="success" type="submit" disabled={registering}>{registering ? <><Spinner animation="border" size="sm" className="me-2" />Saving...</> : 'Register'}</Button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* View All Hearses Modal */}
            <Modal show={showHearses} onHide={() => setShowHearses(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-dark text-white"><Modal.Title className="fw-bold"><Eye size={20} className="me-2" />All Hearses</Modal.Title></Modal.Header>
                <Modal.Body className="p-4">
                    {hearses.length === 0 ? <div className="text-center py-5"><h5 className="text-muted">No hearses</h5></div> : (
                        <div className="table-responsive">
                            <Table hover size="sm">
                                <thead className="bg-light"><tr><th>Code</th><th>Name</th><th>Plate</th><th>Model</th><th>Status</th><th>Capacity</th><th>Branch</th></tr></thead>
                                <tbody>
                                    {hearses.map(h => (
                                        <tr key={h.id}>
                                            <td><strong>{h.hearse_code || `#${h.id}`}</strong></td>
                                            <td><strong>{h.hearse_name || 'N/A'}</strong></td>
                                            <td><strong className="text-primary">{h.plate_number || h.number_plate}</strong></td>
                                            <td>{h.model || 'N/A'}</td>
                                            <td><Badge bg={h.status === 'available' ? 'success' : 'warning'}>{h.status}</Badge></td>
                                            <td>{h.capacity || 'N/A'}</td>
                                            <td><strong className="text-primary">{h.branch_code || h.branch_name || 'N/A'}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

// Postpone Modal
const PostponeModal = ({ show, onHide, booking, onPostpone }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    useEffect(() => {
        if (booking) {
            const d = new Date(booking.booking_date || booking.estimated_departure_time || new Date());
            setDate(d.toISOString().split('T')[0]);
            setTime(d.toTimeString().slice(0, 5));
            setReason('');
        }
    }, [booking]);
    const submit = async (e) => {
        e.preventDefault();
        await onPostpone(booking.booking_id, { new_departure_time: `${date}T${time}`, reason });
        onHide();
    };
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="bg-warning text-dark"><Modal.Title className="fw-bold"><Calendar size={20} className="me-2" />Postpone</Modal.Title></Modal.Header>
            <form onSubmit={submit}>
                <Modal.Body>
                    <Row>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-semibold">New Date *</Form.Label><Form.Control type="date" value={date} onChange={e => setDate(e.target.value)} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-semibold">New Time *</Form.Label><Form.Control type="time" value={time} onChange={e => setTime(e.target.value)} required /></Form.Group></Col>
                    </Row>
                    <Form.Group><Form.Label className="fw-semibold">Reason</Form.Label><Form.Control as="textarea" rows={2} value={reason} onChange={e => setReason(e.target.value)} /></Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
                    <Button variant="warning" type="submit" className="text-white">Confirm</Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

export default BookingSystem;