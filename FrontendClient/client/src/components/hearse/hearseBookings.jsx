import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Alert, Spinner, Card, Badge, Modal, Button, Form, Table, Dropdown, InputGroup
} from 'react-bootstrap';
import './hearseBookings.css';
import { useSocket } from '../../context/socketContext';
import { Eye, RefreshCw, Clock, User, Car, CheckCircle, XCircle, AlertCircle, Calendar, Phone, Truck, Search, MoreVertical, MapPin, Activity } from 'lucide-react';
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
        if (!r.ok) {
            const error = await r.json();
            throw new Error(error.message || 'Failed');
        }
        return await r.json();
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
        if (!r.ok) {
            const error = await r.json();
            throw new Error(error.message || 'Failed');
        }
        return await r.json();
    },
    postponeBooking: async (bookingId, data) => {
        const r = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/postpone`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'x-tenant-slug': getTenantSlug() },
            body: JSON.stringify(data)
        });
        if (!r.ok) {
            const error = await r.json();
            throw new Error(error.message || 'Failed');
        }
        return await r.json();
    }
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
const genId = (id) => `BK-${String(id).padStart(4, '0')}`;

const StatusBadge = ({ status }) => {
    const cfg = {
        booked: { label: 'BOOKED', color: 'primary' },
        in_transit: { label: 'IN TRANSIT', color: 'info' },
        completed: { label: 'COMPLETED', color: 'success' },
        cancelled: { label: 'CANCELLED', color: 'danger' },
        postponed: { label: 'POSTPONED', color: 'warning' },
        maintenance: { label: 'MAINTENANCE', color: 'warning' }
    };
    const c = cfg[status] || { label: status?.toUpperCase() || 'UNKNOWN', color: 'secondary' };
    return <Badge bg={c.color} className="fw-bold px-3 py-2" style={{ borderRadius: '20px', minWidth: '80px' }}>{c.label}</Badge>;
};

// Available Hearses Modal
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
            setBookingDate('');
            setClientName('');
            setClientPhone('');
            setFromLocation('');
            setToLocation('');
            loadHearses();
        }
    }, [show]);

    const loadHearses = async () => {
        setLoading(true);
        try {
            const r = await fetch(`${API_BASE_URL}/hearses?t=${Date.now()}`, {
                headers: { 'x-tenant-slug': getTenantSlug() }
            });
            const data = await r.json();
            const hearses = data.hearses || data || [];
            const available = hearses.filter(h => h.status === 'available');
            setHearses(available);
        } catch (e) {
            console.error('Failed to load hearses:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        if (!selected || !bookingDate || !clientName || !fromLocation || !toLocation) {
            alert('Please fill in all required fields');
            return;
        }
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

            const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
            if (userId) {
                bookingData.created_by = parseInt(userId);
            }

            await bookingService.createBooking(bookingData);
            onBookingCreated();
            onHide();
        } catch (e) {
            alert('Booking failed: ' + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="border-0" style={{ background: '#1a1a2e' }}>
                <Modal.Title className="fw-bold text-white">
                    <Truck size={20} className="me-2" />
                    Available Hearses
                    <Badge bg="light" className="ms-2 text-dark">{hearses.length} vehicles</Badge>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {!selected ? (
                    <>
                        {loading ? (
                            <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div>
                        ) : hearses.length === 0 ? (
                            <div className="text-center py-5">
                                <Car size={48} className="text-muted mb-3" />
                                <h5 className="text-muted">No hearses available</h5>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover size="sm" className="mb-0">
                                    <thead style={{ background: '#f8f9fa' }}>
                                        <tr>
                                            <th>Name</th>
                                            <th>Plate</th>
                                            <th className="d-none d-md-table-cell">Model</th>
                                            <th className="d-none d-md-table-cell">Branch</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hearses.map(h => (
                                            <tr key={h.id}>
                                                <td><strong>{h.hearse_name || 'N/A'}</strong></td>
                                                <td><Badge bg="primary">{h.plate_number || h.number_plate}</Badge></td>
                                                <td className="d-none d-md-table-cell">{h.model || 'N/A'}</td>
                                                <td className="d-none d-md-table-cell">{h.branch_code || h.branch_name || 'N/A'}</td>
                                                <td className="text-center">
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        onClick={() => setSelected(h)}
                                                        style={{ borderRadius: '20px', padding: '4px 16px' }}
                                                    >
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
                        <div className="alert alert-info border-0 shadow-sm mb-4">
                            <div className="d-flex align-items-center">
                                <Car size={24} className="me-3 text-primary" />
                                <div>
                                    <strong>{selected.hearse_name}</strong>
                                    <Badge bg="primary" className="ms-2">{selected.plate_number || selected.number_plate}</Badge>
                                    <div className="small text-muted">{selected.model} • {selected.capacity} seats</div>
                                </div>
                                <Button variant="outline-secondary" size="sm" className="ms-auto" onClick={() => setSelected(null)}>
                                    ← Change
                                </Button>
                            </div>
                        </div>

                        <h6 className="fw-bold mb-3">Booking Details</h6>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Booking Date & Time *</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={bookingDate}
                                onChange={e => setBookingDate(e.target.value)}
                                className="border-0 bg-light"
                                style={{ borderRadius: '10px' }}
                                required
                            />
                        </Form.Group>
                        <Row>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Client Name *</Form.Label>
                                    <Form.Control
                                        value={clientName}
                                        onChange={e => setClientName(e.target.value)}
                                        placeholder="Full name"
                                        className="border-0 bg-light"
                                        style={{ borderRadius: '10px' }}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Phone</Form.Label>
                                    <Form.Control
                                        value={clientPhone}
                                        onChange={e => setClientPhone(e.target.value)}
                                        placeholder="0712345678"
                                        className="border-0 bg-light"
                                        style={{ borderRadius: '10px' }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">From *</Form.Label>
                                    <Form.Control
                                        value={fromLocation}
                                        onChange={e => setFromLocation(e.target.value)}
                                        placeholder="Pickup location"
                                        className="border-0 bg-light"
                                        style={{ borderRadius: '10px' }}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">To *</Form.Label>
                                    <Form.Control
                                        value={toLocation}
                                        onChange={e => setToLocation(e.target.value)}
                                        placeholder="Destination"
                                        className="border-0 bg-light"
                                        style={{ borderRadius: '10px' }}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-between mt-3">
                            <Button variant="outline-secondary" onClick={() => setSelected(null)}>
                                ← Back
                            </Button>
                            <Button
                                variant="success"
                                onClick={handleBook}
                                disabled={!bookingDate || !clientName || !fromLocation || !toLocation || submitting}
                                style={{ borderRadius: '20px', padding: '8px 30px' }}
                            >
                                {submitting ? (
                                    <><Spinner animation="border" size="sm" className="me-2" />Booking...</>
                                ) : (
                                    <><CheckCircle size={16} className="me-2" />Confirm Booking</>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
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
            <Modal.Header closeButton className="border-0" style={{ background: '#ffc107' }}>
                <Modal.Title className="fw-bold text-dark">
                    <Calendar size={20} className="me-2" />
                    Postpone Booking
                </Modal.Title>
            </Modal.Header>
            <form onSubmit={submit}>
                <Modal.Body className="p-4">
                    <div className="alert alert-warning border-0 shadow-sm">
                        <AlertCircle size={16} className="me-2" />
                        Postponing <strong>{genId(booking?.booking_id)}</strong> for {booking?.client_name}
                    </div>
                    <Row>
                        <Col xs={12} md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">New Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="border-0 bg-light"
                                    style={{ borderRadius: '10px' }}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">New Time *</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    className="border-0 bg-light"
                                    style={{ borderRadius: '10px' }}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group>
                        <Form.Label className="fw-semibold">Reason</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Why is this booking being postponed?"
                            className="border-0 bg-light"
                            style={{ borderRadius: '10px' }}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
                    <Button
                        variant="warning"
                        type="submit"
                        style={{ borderRadius: '20px', padding: '8px 30px' }}
                    >
                        Confirm Postpone
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

// Main Component
const BookingSystem = () => {
    const [bookings, setBookings] = useState([]);
    const [hearses, setHearses] = useState([]);
    const [filter, setFilter] = useState('booked');
    const [branchFilter, setBranchFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showPostpone, setShowPostpone] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showHearses, setShowHearses] = useState(false);
    const [showAvailable, setShowAvailable] = useState(false);
    const [registerForm, setRegisterForm] = useState({
        plate_number: '',
        hearse_name: '',
        model: '',
        capacity: '',
        branch_code: ''
    });
    const [registering, setRegistering] = useState(false);
    const [availabilityResult, setAvailabilityResult] = useState(null);
    const [branches, setBranches] = useState([]);
    const { socket } = useSocket();

    // Extract unique branches from hearses (more reliable)
    useEffect(() => {
        const branchesFromHearses = [...new Set(hearses.map(h => h.branch_code || h.branch_name).filter(Boolean))];
        const branchesFromBookings = [...new Set(bookings.map(b => b.branch_code).filter(Boolean))];
        const allBranches = [...new Set([...branchesFromHearses, ...branchesFromBookings])];
        setBranches(allBranches.sort());
    }, [hearses, bookings]);

    useEffect(() => {
        loadData();
        loadHearses();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('new_booking', (d) => {
            setBookings(p => [d.booking, ...p]);
            setSuccess('🔄 New booking received!');
            setTimeout(() => setSuccess(''), 3000);
        });
        socket.on('booking_status_updated', (d) => {
            setBookings(p => p.map(b => b.booking_id === d.booking_id ? { ...b, status: d.status, ...d.booking } : b));
        });
        return () => {
            socket.off('new_booking');
            socket.off('booking_status_updated');
        };
    }, [socket]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const r = await fetch(`${API_BASE_URL}/hearse-bookings?t=${Date.now()}`, {
                headers: { 'x-tenant-slug': getTenantSlug() }
            });
            const data = await r.json();
            const bookingsData = Array.isArray(data.bookings) ? data.bookings : (Array.isArray(data) ? data : []);
            setBookings(bookingsData);
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
        try {
            await bookingService.updateBookingStatus(id, s);
            setSuccess('Status updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
            await loadData();
        } catch (e) {
            setError('Failed to update status.');
            console.error(e);
        }
    };

    const handlePostpone = async (id, d) => {
        try {
            await bookingService.postponeBooking(id, d);
            setSuccess('Booking postponed!');
            setTimeout(() => setSuccess(''), 3000);
            await loadData();
        } catch (e) {
            setError('Failed to postpone booking.');
            console.error(e);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegistering(true);
        try {
            await bookingService.registerHearse(registerForm);
            setSuccess('Hearse registered successfully!');
            setTimeout(() => setSuccess(''), 3000);
            setShowRegister(false);
            setRegisterForm({ plate_number: '', hearse_name: '', model: '', capacity: '', branch_code: '' });
            await loadHearses();
        } catch (e) {
            setError('Failed to register hearse.');
            console.error(e);
        }
        setRegistering(false);
    };

    const checkAvailability = async () => {
        const date = document.getElementById('availabilityDate')?.value;
        if (!date) {
            setError('Please select a date');
            setTimeout(() => setError(''), 3000);
            return;
        }

        try {
            setAvailabilityResult(null);
            const r = await fetch(`${API_BASE_URL}/hearse-bookings/availability?date=${date}`, {
                headers: { 'x-tenant-slug': getTenantSlug() }
            });
            const data = await r.json();

            if (data.status === 'success') {
                setAvailabilityResult({
                    available: data.available_hearses?.length || 0,
                    booked: data.booked_hearses?.length || 0,
                    date: date
                });
            } else {
                setError(data.message || 'No availability data returned');
                setTimeout(() => setError(''), 5000);
            }
        } catch (e) {
            setError('Failed to check availability: ' + e.message);
            setTimeout(() => setError(''), 5000);
        }
    };

    const getStatusCount = (status) => bookings.filter(b => b.status === status).length;

    const getBranchCount = (branch) => bookings.filter(b => b.branch_code === branch).length;

    const filtered = bookings.filter(b => {
        const statusMatch = filter === 'all' ? !['completed', 'cancelled', 'postponed'].includes(b.status) : b.status === filter;
        const branchMatch = branchFilter === 'all' || b.branch_code === branchFilter;
        return statusMatch && branchMatch;
    });

    if (loading) return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="text-center">
                <Spinner animation="border" variant="primary" className="mb-3" style={{ width: 48, height: 48 }} />
                <h5 className="text-muted">Loading bookings...</h5>
            </div>
        </Container>
    );

    return (
        <Container fluid className="py-3" style={{ background: '#f4f6f9', minHeight: '100vh' }}>

            {/* Header */}
            <div className="bg-white  shadow-sm mb-3 overflow-hidden">
                <div className="d-flex flex-wrap justify-content-between align-items-center p-3" style={{ background: '#1a1a2e' }}>
                    <div>
                        <h4 className="mb-0 text-white fw-bold">
                            <Car size={24} className="me-2" />
                            Hearse Management
                        </h4>
                        <div className="mt-2">
                            <div className={`badge ${socket?.connected ? 'bg-success' : 'bg-danger'} fs-6 px-3 py-2`} style={{
                                animation: socket?.connected ? 'pulse 2s infinite' : 'none',
                                fontSize: '0.9rem',
                                fontWeight: 'bold'
                            }}>
                                {socket?.connected ? '● ONLINE' : '● OFFLINE'}
                            </div>
                            <span className="text-white-50 small ms-2">
                                {bookings.filter(b => !['completed', 'cancelled'].includes(b.status)).length} active
                            </span>
                        </div>
                    </div>
                    <div className="d-flex gap-2 mt-2 mt-md-0">
                        <Button variant="outline-light" size="sm" onClick={loadData}>
                            <RefreshCw size={14} className="me-1" />Refresh
                        </Button>
                        <Button variant="light" size="sm" onClick={() => setShowAvailable(true)} >
                            <Truck size={14} className="me-1" />Book
                        </Button>
                        <Button variant="light" size="sm" onClick={() => setShowRegister(true)} >
                            <Car size={14} className="me-1" />Register
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-3 bg-light">
                    <div className="d-flex flex-column gap-2">
                        {/* Row 1: Date picker and branch filter */}
                        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                            <div className="d-flex gap-2">
                                <Form.Control type="date" id="availabilityDate" size="sm" />
                                <Button variant="dark" size="sm" onClick={checkAvailability} >
                                    <Search size={14} className="me-1" />Check
                                </Button>
                                <Button variant="outline-secondary" size="sm" onClick={async () => { await loadHearses(); setShowHearses(true); }} style={{ borderRadius: '20px' }}>
                                    All
                                </Button>
                            </div>
                            {availabilityResult && (
                                <div>
                                    <Badge bg="success" className="me-1">{availabilityResult.available} Available</Badge>
                                    <Badge bg="danger">{availabilityResult.booked} Booked</Badge>
                                </div>
                            )}
                            <Dropdown className="ms-auto">
                                <Dropdown.Toggle variant="outline-dark" size="sm">
                                    <MapPin size={14} className="me-1" />
                                    {branchFilter === 'all' ? 'All Branches' : branchFilter}
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end" style={{ borderRadius: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                                    <Dropdown.Item onClick={() => setBranchFilter('all')} active={branchFilter === 'all'}>
                                        <strong>All Branches</strong>
                                        <Badge bg="secondary" className="ms-2">{bookings.length}</Badge>
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    {branches.map(branch => (
                                        <Dropdown.Item
                                            key={branch}
                                            onClick={() => setBranchFilter(branch)}
                                            active={branchFilter === branch}
                                        >
                                            <MapPin size={12} className="me-1" />
                                            <strong>{branch}</strong>
                                            <Badge bg="primary" className="ms-2">{getBranchCount(branch)}</Badge>
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        {/* Row 2: Status filter buttons with different colors */}
                        <div className="d-flex gap-2 overflow-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                            {[
                                { key: 'all', label: 'ALL', bgColor: '#10375a', textColor: '#fff', count: bookings.length },
                                { key: 'booked', label: 'BOOKED', bgColor: '#0d6efd', textColor: '#fff', count: getStatusCount('booked') },
                                { key: 'in_transit', label: 'IN TRANSIT', bgColor: '#0dcaf0', textColor: '#000', count: getStatusCount('in_transit') },
                                { key: 'completed', label: 'COMPLETED', bgColor: '#198754', textColor: '#fff', count: getStatusCount('completed') },
                                { key: 'cancelled', label: 'CANCELLED', bgColor: '#dc3545', textColor: '#fff', count: getStatusCount('cancelled') },
                                { key: 'postponed', label: 'POSTPONED', bgColor: '#ffc107', textColor: '#000', count: getStatusCount('postponed') }
                            ].map(btn => {
                                const isActive = filter === btn.key;
                                return (
                                    <Button
                                        key={btn.key}
                                        size="sm"
                                        className="px-3 fw-bold flex-shrink-0 border-0"
                                        style={{
                                            borderRadius: '0px',
                                            fontSize: '0.75rem',
                                            background: isActive ? btn.bgColor : `${btn.bgColor}50`,
                                            color: isActive ? btn.textColor : btn.bgColor,
                                            border: `2px solid ${btn.bgColor}`,
                                            minWidth: '100px'
                                        }}
                                        onClick={() => setFilter(btn.key)}
                                    >
                                        {btn.label} ({btn.count})
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <Table hover className="mb-0">
                        <thead style={{ background: '#f8f9fa' }}>
                            <tr>
                                <th className="d-none d-md-table-cell">ID</th>
                                <th>Client</th>
                                <th className="d-none d-md-table-cell">Destination</th>
                                <th>Hearse</th>
                                <th className="d-none d-md-table-cell">Date</th>
                                <th>Status</th>
                                <th className="text-center" style={{ width: '60px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <Car size={48} className="text-muted mb-3" />
                                        <h5 className="text-muted">No bookings found</h5>
                                        <p className="text-muted small">Try adjusting your filters</p>
                                    </td>
                                </tr>
                            ) : filtered.map(b => (
                                <tr key={b.booking_id}>
                                    <td className="d-none d-md-table-cell">
                                        <strong className="text-primary">{genId(b.booking_id)}</strong>
                                        <div className="small text-muted">{fmtDate(b.created_at)}</div>
                                    </td>
                                    <td>
                                        <strong>{b.client_name}</strong>
                                        <div className="small text-muted d-md-none">{genId(b.booking_id)}</div>
                                        <div className="small text-muted d-md-none">{fmtDate(b.booking_date || b.estimated_departure_time)}</div>
                                    </td>
                                    <td className="d-none d-md-table-cell">{b.destination}</td>
                                    <td>
                                        <Badge bg="dark" className="px-2 py-1">
                                            {b.plate_number || b.number_plate || 'N/A'}
                                        </Badge>
                                        <div className="small text-muted">{b.hearse_name || ''}</div>
                                    </td>
                                    <td className="d-none d-md-table-cell">{fmtDate(b.booking_date || b.estimated_departure_time)}</td>
                                    <td><StatusBadge status={b.status} /></td>
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle
                                                variant="outline-secondary"
                                                size="sm"
                                                className="border-0 p-1"
                                                style={{ borderRadius: '0px', width: '32px', height: '32px', padding: '0' }}
                                            >
                                                <MoreVertical size={16} />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu align="end" className="shadow-sm border-0" style={{ borderRadius: '0px' }}>
                                                <Dropdown.Item onClick={() => { setSelectedBooking(b); setShowDetails(true); }}>
                                                    <Eye size={14} className="me-2" />View Details
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                {b.status === 'booked' && (
                                                    <Dropdown.Item onClick={() => handleStatus(b.booking_id, 'in_transit')}>
                                                        <Truck size={14} className="me-2 text-info" />Mark In Transit
                                                    </Dropdown.Item>
                                                )}
                                                {b.status === 'in_transit' && (
                                                    <Dropdown.Item onClick={() => handleStatus(b.booking_id, 'completed')}>
                                                        <CheckCircle size={14} className="me-2 text-success" />Mark Completed
                                                    </Dropdown.Item>
                                                )}
                                                <Dropdown.Item onClick={() => handleStatus(b.booking_id, 'maintenance')}>
                                                    <AlertCircle size={14} className="me-2 text-warning" />Mark Maintenance
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleStatus(b.booking_id, 'cancelled')}>
                                                    <XCircle size={14} className="me-2 text-danger" />Cancel
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item onClick={() => { setSelectedBooking(b); setShowPostpone(true); }}>
                                                    <Calendar size={14} className="me-2 text-warning" />Postpone
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>

            {/* Modals */}
            <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0" style={{ background: '#1a1a2e' }}>
                    <Modal.Title className="fw-bold text-white">
                        <Eye size={20} className="me-2" />
                        Booking {genId(selectedBooking?.booking_id)}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Row className="g-3">
                        <Col md={6}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Header className="bg-light fw-bold">
                                    <User size={16} className="me-2" />Client Information
                                </Card.Header>
                                <Card.Body>
                                    <div><strong>Name:</strong> {selectedBooking?.client_name}</div>
                                    <div><strong>Phone:</strong> {selectedBooking?.client_phone || 'N/A'}</div>
                                    <div><strong>Email:</strong> {selectedBooking?.client_email || 'N/A'}</div>
                                    <div><strong>Booked By:</strong> {selectedBooking?.created_by ? `Staff ID: ${selectedBooking.created_by}` : 'N/A'}</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Header className="bg-light fw-bold">
                                    <Car size={16} className="me-2" />Service Details
                                </Card.Header>
                                <Card.Body>
                                    <div><strong>Destination:</strong> {selectedBooking?.destination}</div>
                                    <div><strong>Hearse:</strong> {selectedBooking?.hearse_name || selectedBooking?.plate_number || 'N/A'}</div>
                                    <div><strong>Date:</strong> {fmtDate(selectedBooking?.booking_date || selectedBooking?.estimated_departure_time)}</div>
                                    <div><strong>Status:</strong> <StatusBadge status={selectedBooking?.status} /></div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>

            <PostponeModal
                show={showPostpone}
                onHide={() => setShowPostpone(false)}
                booking={selectedBooking}
                onPostpone={handlePostpone}
            />

            <AvailableHearsesModal
                show={showAvailable}
                onHide={() => setShowAvailable(false)}
                onBookingCreated={loadData}
            />

            {/* Register Hearse Modal */}
            <Modal show={showRegister} onHide={() => setShowRegister(false)} centered>
                <Modal.Header closeButton className="border-0" style={{ background: '#1a1a2e' }}>
                    <Modal.Title className="fw-bold text-white">
                        <Car size={20} className="me-2" />
                        Register Hearse
                    </Modal.Title>
                </Modal.Header>
                <form onSubmit={handleRegister}>
                    <Modal.Body className="p-4">
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Hearse Name *</Form.Label>
                            <Form.Control
                                value={registerForm.hearse_name}
                                onChange={e => setRegisterForm(p => ({ ...p, hearse_name: e.target.value }))}
                                placeholder="e.g., Mercedes Sprinter"
                                className="border-0 bg-light"
                                style={{ borderRadius: '10px' }}
                                required
                            />
                        </Form.Group>
                        <Row className="g-3">
                            <Col xs={12} md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Plate Number *</Form.Label>
                                    <Form.Control
                                        value={registerForm.plate_number}
                                        onChange={e => setRegisterForm(p => ({ ...p, plate_number: e.target.value.toUpperCase() }))}
                                        placeholder="KCA 1234"
                                        className="border-0 bg-light"
                                        style={{ borderRadius: '10px' }}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Model</Form.Label>
                                    <Form.Control
                                        value={registerForm.model}
                                        onChange={e => setRegisterForm(p => ({ ...p, model: e.target.value }))}
                                        placeholder="Toyota Hiace"
                                        className="border-0 bg-light"
                                        style={{ borderRadius: '10px' }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Capacity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={registerForm.capacity}
                                        onChange={e => setRegisterForm(p => ({ ...p, capacity: e.target.value }))}
                                        placeholder="4"
                                        min="1"
                                        className="border-0 bg-light"
                                        style={{ borderRadius: '10px' }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Branch Code *</Form.Label>
                                    <Form.Control
                                        value={registerForm.branch_code}
                                        onChange={e => setRegisterForm(p => ({ ...p, branch_code: e.target.value.toUpperCase() }))}
                                        placeholder="e.g., NBI"
                                        className="border-0 bg-light"
                                        style={{ borderRadius: '10px' }}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="outline-secondary" onClick={() => setShowRegister(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="success"
                            type="submit"
                            disabled={registering}
                            style={{ borderRadius: '20px', padding: '8px 30px' }}
                        >
                            {registering ? (
                                <><Spinner animation="border" size="sm" className="me-2" />Saving...</>
                            ) : (
                                'Register Hearse'
                            )}
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* All Hearses Modal */}
            <Modal show={showHearses} onHide={() => setShowHearses(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0" style={{ background: '#1a1a2e' }}>
                    <Modal.Title className="fw-bold text-white">
                        <Eye size={20} className="me-2" />
                        All Hearses
                        <Badge bg="light" className="ms-2 text-dark">{hearses.length} vehicles</Badge>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {hearses.length === 0 ? (
                        <div className="text-center py-5">
                            <Car size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">No hearses registered</h5>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover size="sm" className="mb-0">
                                <thead style={{ background: '#f8f9fa' }}>
                                    <tr>
                                        <th>Name</th>
                                        <th>Plate</th>
                                        <th className="d-none d-md-table-cell">Model</th>
                                        <th>Status</th>
                                        <th className="d-none d-md-table-cell">Branch</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hearses.map(h => (
                                        <tr key={h.id}>
                                            <td><strong>{h.hearse_name || 'N/A'}</strong></td>
                                            <td><Badge bg="primary">{h.plate_number || h.number_plate}</Badge></td>
                                            <td className="d-none d-md-table-cell">{h.model || 'N/A'}</td>
                                            <td>
                                                <Badge bg={h.status === 'available' ? 'success' : 'warning'}>
                                                    {h.status || 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="d-none d-md-table-cell">{h.branch_code || h.branch_name || 'N/A'}</td>
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

export default BookingSystem;