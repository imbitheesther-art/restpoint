import React, { useState, useEffect, useCallback } from 'react';
import {
    Row, Col, Spinner, Modal, Button, Form, Table, Dropdown
} from 'react-bootstrap';
import './hearseBookings.css';
import { useSocket } from '../../context/socketContext';
import {
    Eye, RefreshCw, User, Car, CheckCircle, XCircle, AlertCircle,
    Calendar, Truck, Search, MoreVertical, MapPin, Plus, Wrench
} from 'lucide-react';
import env from '../../config/env';

const API_BASE_URL = `${env.FULL_API_URL}`;

const getTenantSlug = () => {
    return localStorage.getItem('tenantSlug') || localStorage.getItem('tenant_slug') || 'default';
};

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const headers = { 'x-tenant-slug': getTenantSlug() };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

const bookingService = {
    getBookings: async () => {
        const r = await fetch(`${API_BASE_URL}/hearse-bookings`, { headers: getAuthHeaders() });
        if (!r.ok) throw new Error('Failed');
        return (await r.json()).bookings || [];
    },
    getAllHearses: async () => {
        const r = await fetch(`${API_BASE_URL}/hearses`, { headers: getAuthHeaders() });
        if (!r.ok) throw new Error('Failed');
        return (await r.json()).hearses || [];
    },
    createBooking: async (data) => {
        const headers = getAuthHeaders();
        headers['Content-Type'] = 'application/json';
        const r = await fetch(`${API_BASE_URL}/hearse-bookings`, {
            method: 'POST',
            headers,
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
            headers: getAuthHeaders(),
            body: fd
        });
        if (!r.ok) throw new Error('Failed');
        return r.json();
    },
    updateBookingStatus: async (bookingId, status) => {
        const headers = getAuthHeaders();
        headers['Content-Type'] = 'application/json';
        const r = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/status`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ status })
        });
        if (!r.ok) {
            const error = await r.json();
            throw new Error(error.message || 'Failed');
        }
        return await r.json();
    },
    postponeBooking: async (bookingId, data) => {
        const headers = getAuthHeaders();
        headers['Content-Type'] = 'application/json';
        const r = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/postpone`, {
            method: 'PATCH',
            headers,
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
        booked: 'BOOKED',
        in_transit: 'IN TRANSIT',
        completed: 'COMPLETED',
        cancelled: 'CANCELLED',
        postponed: 'POSTPONED',
        maintenance: 'MAINTENANCE'
    };
    return (
        <span className={`hb-status ${status || ''}`}>
            <span className="hb-status-dot" />
            {cfg[status] || status?.toUpperCase() || 'UNKNOWN'}
        </span>
    );
};

/* Toast Notification */
const Toast = ({ message, type, onDone }) => {
    useEffect(() => {
        const t = setTimeout(() => {
            onDone();
        }, 3500);
        return () => clearTimeout(t);
    }, [onDone]);

    return (
        <div className={`hb-toast ${type}`}>
            {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            {message}
        </div>
    );
};

/* Available Hearses Modal */
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
            const r = await fetch(`${API_BASE_URL}/hearses/available?t=${Date.now()}`, {
                headers: getAuthHeaders()
            });
            const data = await r.json();
            const hearses = data.hearses || data || [];
            setHearses(hearses);
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
            // Get logged-in user info
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : {};
            const bookedByUser = user?.user_slug || user?.username || user?.full_name || 'unknown';

            const bookingData = {
                hearse_id: selected.id,
                client_name: clientName,
                client_phone: clientPhone || '',
                destination: `${fromLocation} to ${toLocation}`,
                from_timestamp: bookingDate,
                to_timestamp: bookingDate,
                booked_by: bookedByUser
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
        <Modal show={show} onHide={onHide} size="lg" centered className="hb-modal hb-modal-dark">
            <Modal.Header closeButton>
                <Modal.Title>
                    <Truck size={18} />
                    Available Hearses
                    <span className="hb-count-badge accent">{hearses.length}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!selected ? (
                    <>
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="hb-loading-spinner" />
                                <p className="text-muted small mt-2">Loading available vehicles...</p>
                            </div>
                        ) : hearses.length === 0 ? (
                            <div className="hb-modal-empty">
                                <div className="hb-modal-empty-icon">
                                    <Car size={28} />
                                </div>
                                <h5>No hearses available</h5>
                                <p className="text-muted small mb-0">All vehicles are currently booked or in maintenance</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover size="sm" className="hb-modal-table mb-0">
                                    <thead>
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
                                                <td><span className="hb-plate-badge">{h.plate_number || h.number_plate}</span></td>
                                                <td className="d-none d-md-table-cell text-muted">{h.model || 'N/A'}</td>
                                                <td className="d-none d-md-table-cell text-muted">{h.branch_code || h.branch_name || 'N/A'}</td>
                                                <td className="text-center">
                                                    <button className="hb-btn-book-sm" onClick={() => setSelected(h)}>
                                                        <Car size={13} /> Book
                                                    </button>
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
                        <div className="hb-selected-info">
                            <div className="hb-selected-icon">
                                <Car size={22} />
                            </div>
                            <div className="hb-selected-details">
                                <strong>{selected.hearse_name}</strong>
                                <span className="hb-plate-badge ms-2">{selected.plate_number || selected.number_plate}</span>
                                <div className="sub">{selected.model} • {selected.capacity} seats</div>
                            </div>
                            <Button variant="link" className="text-muted p-0 ms-auto" onClick={() => setSelected(null)} style={{ fontSize: '0.82rem', textDecoration: 'none' }}>
                                ← Change
                            </Button>
                        </div>

                        <div className="hb-section-label">Booking Details</div>
                        <Row>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="hb-form-label">Booking Date *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={bookingDate}
                                        onChange={e => setBookingDate(e.target.value)}
                                        className="hb-form-control"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="hb-form-label">Client Name *</Form.Label>
                                    <Form.Control
                                        value={clientName}
                                        onChange={e => setClientName(e.target.value)}
                                        placeholder="Full name"
                                        className="hb-form-control"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="hb-form-label">Phone</Form.Label>
                                    <Form.Control
                                        value={clientPhone}
                                        onChange={e => setClientPhone(e.target.value)}
                                        placeholder="0712345678"
                                        className="hb-form-control"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="hb-form-label">From *</Form.Label>
                                    <Form.Control
                                        value={fromLocation}
                                        onChange={e => setFromLocation(e.target.value)}
                                        placeholder="Pickup location"
                                        className="hb-form-control"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="hb-form-label">To *</Form.Label>
                                    <Form.Control
                                        value={toLocation}
                                        onChange={e => setToLocation(e.target.value)}
                                        placeholder="Destination"
                                        className="hb-form-control"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-between mt-4">
                            <button type="button" className="hb-btn hb-btn-ghost" onClick={() => setSelected(null)}>
                                ← Back
                            </button>
                            <button
                                type="button"
                                className="hb-btn hb-btn-green"
                                onClick={handleBook}
                                disabled={!bookingDate || !clientName || !fromLocation || !toLocation || submitting}
                            >
                                {submitting ? (
                                    <><span className="hb-loading-spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 0, marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />Booking...</>
                                ) : (
                                    <><CheckCircle size={16} />Confirm Booking</>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

/* Postpone Modal */
const PostponeModal = ({ show, onHide, booking, onPostpone }) => {
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (booking) {
            const d = new Date(booking.booking_date || booking.estimated_departure_time || new Date());
            setDate(d.toISOString().split('T')[0]);
            setReason('');
        }
    }, [booking]);

    const submit = async (e) => {
        e.preventDefault();
        await onPostpone(booking.booking_id, { new_departure_time: date, reason });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered className="hb-modal hb-modal-amber">
            <Modal.Header closeButton>
                <Modal.Title>
                    <Calendar size={18} />
                    Postpone Booking
                </Modal.Title>
            </Modal.Header>
            <form onSubmit={submit}>
                <Modal.Body>
                    <div className="hb-notice warning">
                        <AlertCircle size={18} />
                        <span>Postponing <strong>{genId(booking?.booking_id)}</strong> for {booking?.client_name}</span>
                    </div>
                    <Row>
                        <Col xs={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="hb-form-label">New Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="hb-form-control"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group>
                        <Form.Label className="hb-form-label">Reason</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Why is this booking being postponed?"
                            className="hb-form-control"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="hb-btn hb-btn-ghost" onClick={onHide}>Cancel</button>
                    <button type="submit" className="hb-btn hb-btn-amber">Confirm Postpone</button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

/* All Hearses Modal */
const AllHearsesModal = ({ show, onHide, hearses }) => {
    const bookedPlates = new Set();
    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="hb-modal hb-modal-dark">
            <Modal.Header closeButton>
                <Modal.Title>
                    <Car size={18} />
                    All Hearses
                    <span className="hb-count-badge accent">{hearses.length}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {hearses.length === 0 ? (
                    <div className="hb-modal-empty">
                        <div className="hb-modal-empty-icon"><Car size={28} /></div>
                        <h5>No hearses registered</h5>
                        <p className="text-muted small mb-0">Register a new hearse to get started</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <Table hover size="sm" className="hb-modal-table mb-0">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Plate</th>
                                    <th className="d-none d-md-table-cell">Model</th>
                                    <th>Capacity</th>
                                    <th className="d-none d-md-table-cell">Branch</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hearses.map(h => {
                                    const isBooked = h.status === 'booked' || h.is_booked;
                                    return (
                                        <tr key={h.id}>
                                            <td><strong>{h.hearse_name || 'N/A'}</strong></td>
                                            <td><span className="hb-plate-badge">{h.plate_number || h.number_plate}</span></td>
                                            <td className="d-none d-md-table-cell text-muted">{h.model || 'N/A'}</td>
                                            <td>{h.capacity || '-'}</td>
                                            <td className="d-none d-md-table-cell text-muted">{h.branch_code || h.branch_name || 'N/A'}</td>
                                            <td>
                                                <span className={`hb-status ${isBooked ? 'booked' : 'completed'}`}>
                                                    <span className="hb-status-dot" />
                                                    {isBooked ? 'BOOKED' : 'AVAILABLE'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

/* Register Hearse Modal */
const RegisterHearseModal = ({ show, onHide, onRegistered, registering, setRegistering, registerForm, setRegisterForm }) => {
    const handleRegister = async (e) => {
        e.preventDefault();
        setRegistering(true);
        try {
            await bookingService.registerHearse(registerForm);
            onRegistered();
            onHide();
        } catch (e) {
            alert('Failed to register hearse: ' + e.message);
        }
        setRegistering(false);
    };

    return (
        <Modal show={show} onHide={onHide} centered className="hb-modal hb-modal-dark">
            <Modal.Header closeButton>
                <Modal.Title>
                    <Plus size={18} />
                    Register Hearse
                </Modal.Title>
            </Modal.Header>
            <form onSubmit={handleRegister}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="hb-form-label">Hearse Name *</Form.Label>
                        <Form.Control
                            value={registerForm.hearse_name}
                            onChange={e => setRegisterForm(p => ({ ...p, hearse_name: e.target.value }))}
                            placeholder="e.g., Mercedes Sprinter"
                            className="hb-form-control"
                            required
                        />
                    </Form.Group>
                    <Row className="g-3">
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label className="hb-form-label">Plate Number *</Form.Label>
                                <Form.Control
                                    value={registerForm.plate_number}
                                    onChange={e => setRegisterForm(p => ({ ...p, plate_number: e.target.value.toUpperCase() }))}
                                    placeholder="KCA 1234"
                                    className="hb-form-control"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label className="hb-form-label">Model</Form.Label>
                                <Form.Control
                                    value={registerForm.model}
                                    onChange={e => setRegisterForm(p => ({ ...p, model: e.target.value }))}
                                    placeholder="Toyota Hiace"
                                    className="hb-form-control"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label className="hb-form-label">Capacity</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={registerForm.capacity}
                                    onChange={e => setRegisterForm(p => ({ ...p, capacity: e.target.value }))}
                                    placeholder="4"
                                    min="1"
                                    className="hb-form-control"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label className="hb-form-label">Branch Code *</Form.Label>
                                <Form.Control
                                    value={registerForm.branch_code}
                                    onChange={e => setRegisterForm(p => ({ ...p, branch_code: e.target.value.toUpperCase() }))}
                                    placeholder="e.g., NBI"
                                    className="hb-form-control"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="hb-btn hb-btn-ghost" onClick={onHide}>Cancel</button>
                    <button type="submit" className="hb-btn hb-btn-green" disabled={registering}>
                        {registering ? (
                            <><span className="hb-loading-spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 0, marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />Saving...</>
                        ) : (
                            <><CheckCircle size={16} />Register Hearse</>
                        )}
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

/* Main Component */
const BookingSystem = () => {
    const [bookings, setBookings] = useState([]);
    const [hearses, setHearses] = useState([]);
    const [filter, setFilter] = useState('booked');
    const [branchFilter, setBranchFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState([]);
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

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

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
            addToast('New booking received!');
        });
        socket.on('booking_status_updated', (d) => {
            setBookings(p => p.map(b => b.booking_id === d.booking_id ? { ...b, status: d.status, ...d.booking } : b));
        });
        return () => {
            socket.off('new_booking');
            socket.off('booking_status_updated');
        };
    }, [socket, addToast]);

    const loadData = async () => {
        setLoading(true);
        try {
            const r = await fetch(`${API_BASE_URL}/hearse-bookings?t=${Date.now()}`, {
                headers: getAuthHeaders()
            });
            const data = await r.json();
            const bookingsData = Array.isArray(data.bookings) ? data.bookings : (Array.isArray(data) ? data : []);
            setBookings(bookingsData);
        } catch (e) {
            addToast('Failed to load data.', 'error');
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
            addToast('Status updated successfully!');
            await loadData();
        } catch (e) {
            addToast('Failed to update status.', 'error');
            console.error(e);
        }
    };

    const handlePostpone = async (id, d) => {
        try {
            await bookingService.postponeBooking(id, d);
            addToast('Booking postponed!');
            await loadData();
        } catch (e) {
            addToast('Failed to postpone booking.', 'error');
            console.error(e);
        }
    };

    const handleRegistered = async () => {
        addToast('Hearse registered successfully!');
        setRegisterForm({ plate_number: '', hearse_name: '', model: '', capacity: '', branch_code: '' });
        await loadHearses();
    };

    const checkAvailability = async () => {
        const date = document.getElementById('availabilityDate')?.value;
        if (!date) {
            addToast('Please select a date', 'error');
            return;
        }

        try {
            setAvailabilityResult(null);
            const r = await fetch(`${API_BASE_URL}/hearse-bookings/availability?date=${date}`, {
                headers: getAuthHeaders()
            });
            const data = await r.json();

            if (data.status === 'success') {
                setAvailabilityResult({
                    available: data.available_hearses?.length || 0,
                    booked: data.booked_hearses?.length || 0,
                    date: date
                });
            } else {
                addToast(data.message || 'No availability data returned', 'error');
            }
        } catch (e) {
            addToast('Failed to check availability: ' + e.message, 'error');
        }
    };

    const getStatusCount = (status) => bookings.filter(b => b.status === status).length;
    const getBranchCount = (branch) => bookings.filter(b => b.branch_code === branch).length;

    const filtered = bookings.filter(b => {
        const statusMatch = filter === 'all' ? !['completed', 'cancelled', 'postponed'].includes(b.status) : b.status === filter;
        const branchMatch = branchFilter === 'all' || b.branch_code === branchFilter;
        return statusMatch && branchMatch;
    });

    const statusPills = [
        { key: 'all', label: 'ALL', color: 'navy', count: bookings.length },
        { key: 'booked', label: 'BOOKED', color: 'blue', count: getStatusCount('booked') },
        { key: 'in_transit', label: 'IN TRANSIT', color: 'cyan', count: getStatusCount('in_transit') },
        { key: 'completed', label: 'COMPLETED', color: 'green', count: getStatusCount('completed') },
        { key: 'cancelled', label: 'CANCELLED', color: 'red', count: getStatusCount('cancelled') },
        { key: 'postponed', label: 'POSTPONED', color: 'amber', count: getStatusCount('postponed') }
    ];

    if (loading) return (
        <div className="hb-loading">
            <div className="hb-loading-inner">
                <div className="hb-loading-spinner" />
                <h5>Loading bookings...</h5>
            </div>
        </div>
    );

    return (
        <>
            {/* Toast Container */}
            <div className="hb-toast-container">
                {toasts.map(t => (
                    <Toast key={t.id} message={t.message} type={t.type} onDone={() => removeToast(t.id)} />
                ))}
            </div>

            <div className="hb-page">
                {/* Header */}
                <div className="hb-header">
                    <div className="hb-header-top">
                        <div>
                            <h4 className="hb-header-title">
                                <span className="icon-wrap"><Car size={20} /></span>
                                Hearse Management
                            </h4>
                            <div className="hb-header-meta">
                                <span className={`hb-live-badge ${socket?.connected ? 'online' : 'offline'}`}>
                                    <span className="hb-live-dot" />
                                    {socket?.connected ? 'LIVE' : 'OFFLINE'}
                                </span>
                                <span className="hb-active-count">
                                    {bookings.filter(b => !['completed', 'cancelled'].includes(b.status)).length} active bookings
                                </span>
                            </div>
                        </div>
                        <div className="hb-header-actions">
                            <button className="hb-btn-header ghost" onClick={loadData}>
                                <RefreshCw size={14} />Refresh
                            </button>
                            <button className="hb-btn-header primary" onClick={() => setShowAvailable(true)}>
                                <Truck size={14} />New Booking
                            </button>
                            <button className="hb-btn-header success" onClick={() => setShowRegister(true)}>
                                <Plus size={14} />Register
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="hb-filter-bar">
                        <div className="hb-filter-row">
                            <div className="hb-filter-left">
                                <Form.Control
                                    type="date"
                                    id="availabilityDate"
                                    size="sm"
                                    className="hb-input-sm"
                                    style={{ width: 'auto' }}
                                />
                                <button className="hb-btn-filter dark" onClick={checkAvailability}>
                                    <Search size={13} />Check
                                </button>
                                <button className="hb-btn-filter" onClick={async () => { await loadHearses(); setShowHearses(true); }}>
                                    <Car size={13} />All Hearses
                                </button>
                                {availabilityResult && (
                                    <div className="hb-avail-badges">
                                        <span className="hb-avail-badge green">{availabilityResult.available} Available</span>
                                        <span className="hb-avail-badge red">{availabilityResult.booked} Booked</span>
                                    </div>
                                )}
                            </div>
                            <Dropdown className="hb-branch-dropdown">
                                <Dropdown.Toggle as="div" style={{ cursor: 'pointer' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem', fontWeight: 600, border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#fff', color: '#0f172a' }}>
                                        <MapPin size={13} />
                                        {branchFilter === 'all' ? 'All Branches' : branchFilter}
                                    </span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end">
                                    <Dropdown.Item onClick={() => setBranchFilter('all')} active={branchFilter === 'all'}>
                                        <strong>All Branches</strong>
                                        <span className="hb-count-badge dark">{bookings.length}</span>
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    {branches.map(branch => (
                                        <Dropdown.Item
                                            key={branch}
                                            onClick={() => setBranchFilter(branch)}
                                            active={branchFilter === branch}
                                        >
                                            <MapPin size={12} style={{ marginRight: '0.35rem', opacity: 0.5 }} />
                                            <strong>{branch}</strong>
                                            <span className="hb-count-badge accent">{getBranchCount(branch)}</span>
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        <div className="hb-filter-pills">
                            {statusPills.map(btn => (
                                <button
                                    key={btn.key}
                                    className={`hb-pill ${filter === btn.key ? 'active' : ''}`}
                                    data-color={btn.color}
                                    onClick={() => setFilter(btn.key)}
                                >
                                    {btn.label}
                                    <span className="pill-count">{btn.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="hb-table-card" style={{ marginTop: '1rem' }}>
                    <div className="table-responsive">
                        <Table hover className="hb-table">
                            <thead>
                                <tr>
                                    <th className="d-none d-md-table-cell">ID</th>
                                    <th>Client</th>
                                    <th className="d-none d-md-table-cell">Destination</th>
                                    <th>Hearse</th>
                                    <th className="d-none d-md-table-cell">Date</th>
                                    <th>Status</th>
                                    <th className="text-center" style={{ width: '60px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="7">
                                            <div className="hb-empty">
                                                <div className="hb-empty-icon"><Car size={32} /></div>
                                                <h5>No bookings found</h5>
                                                <p>Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map(b => (
                                    <tr key={b.booking_id}>
                                        <td className="d-none d-md-table-cell">
                                            <div className="booking-id">{genId(b.booking_id)}</div>
                                            <div className="booking-date-sub">{fmtDate(b.created_at)}</div>
                                        </td>
                                        <td>
                                            <div className="client-name">{b.client_name}</div>
                                            <div className="text-muted small d-md-none" style={{ fontSize: '0.72rem' }}>
                                                {genId(b.booking_id)} • {fmtDate(b.booking_date || b.estimated_departure_time)}
                                            </div>
                                        </td>
                                        <td className="d-none d-md-table-cell">
                                            <div className="dest-text" title={b.destination}>{b.destination}</div>
                                        </td>
                                        <td>
                                            <span className="hearse-plate">{b.plate_number || b.number_plate || 'N/A'}</span>
                                            <div className="hearse-sub">{b.hearse_name || ''}</div>
                                        </td>
                                        <td className="d-none d-md-table-cell text-muted" style={{ fontSize: '0.84rem' }}>
                                            {fmtDate(b.booking_date || b.estimated_departure_time)}
                                        </td>
                                        <td><StatusBadge status={b.status} /></td>
                                        <td className="text-center">
                                            <Dropdown align="end">
                                                <Dropdown.Toggle as="div">
                                                    <button className="hb-action-btn">
                                                        <MoreVertical size={15} />
                                                    </button>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className="hb-action-menu">
                                                    <Dropdown.Item onClick={() => { setSelectedBooking(b); setShowDetails(true); }}>
                                                        <Eye size={14} />View Details
                                                    </Dropdown.Item>
                                                    <Dropdown.Divider />
                                                    {b.status === 'booked' && (
                                                        <Dropdown.Item onClick={() => handleStatus(b.booking_id, 'in_transit')}>
                                                            <Truck size={14} style={{ color: '#0891b2' }} />Mark In Transit
                                                        </Dropdown.Item>
                                                    )}
                                                    {b.status === 'in_transit' && (
                                                        <Dropdown.Item onClick={() => handleStatus(b.booking_id, 'completed')}>
                                                            <CheckCircle size={14} style={{ color: '#16a34a' }} />Mark Completed
                                                        </Dropdown.Item>
                                                    )}
                                                    <Dropdown.Item onClick={() => handleStatus(b.booking_id, 'maintenance')}>
                                                        <Wrench size={14} style={{ color: '#9333ea' }} />Mark Maintenance
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleStatus(b.booking_id, 'cancelled')}>
                                                        <XCircle size={14} style={{ color: '#dc2626' }} />Cancel
                                                    </Dropdown.Item>
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item onClick={() => { setSelectedBooking(b); setShowPostpone(true); }}>
                                                        <Calendar size={14} style={{ color: '#d97706' }} />Postpone
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
            </div>

            {/* View Details Modal */}
            <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg" centered className="hb-modal hb-modal-dark">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Eye size={18} />
                        Booking {genId(selectedBooking?.booking_id)}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        <Col md={6}>
                            <div className="hb-detail-card">
                                <div className="hb-detail-card-header">
                                    <User size={14} />Client Information
                                </div>
                                <div className="hb-detail-card-body">
                                    <div className="hb-detail-row">
                                        <span className="label">Name</span>
                                        <span className="value">{selectedBooking?.client_name}</span>
                                    </div>
                                    <div className="hb-detail-row">
                                        <span className="label">Phone</span>
                                        <span className="value">{selectedBooking?.client_phone || 'N/A'}</span>
                                    </div>
                                    <div className="hb-detail-row">
                                        <span className="label">Email</span>
                                        <span className="value">{selectedBooking?.client_email || 'N/A'}</span>
                                    </div>
                                    <div className="hb-detail-row">
                                        <span className="label">Booked By</span>
                                        <span className="value">{selectedBooking?.created_by ? `Staff ID: ${selectedBooking.created_by}` : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="hb-detail-card">
                                <div className="hb-detail-card-header">
                                    <Car size={14} />Service Details
                                </div>
                                <div className="hb-detail-card-body">
                                    <div className="hb-detail-row">
                                        <span className="label">Destination</span>
                                        <span className="value">{selectedBooking?.destination}</span>
                                    </div>
                                    <div className="hb-detail-row">
                                        <span className="label">Hearse</span>
                                        <span className="value">{selectedBooking?.hearse_name || selectedBooking?.plate_number || 'N/A'}</span>
                                    </div>
                                    <div className="hb-detail-row">
                                        <span className="label">Date</span>
                                        <span className="value">{fmtDate(selectedBooking?.booking_date || selectedBooking?.estimated_departure_time)}</span>
                                    </div>
                                    <div className="hb-detail-row">
                                        <span className="label">Status</span>
                                        <span className="value">
                                            <Form.Select
                                                size="sm"
                                                value={selectedBooking?.status || 'pending'}
                                                onChange={(e) => handleStatus(selectedBooking?.booking_id, e.target.value)}
                                                className="hb-form-control"
                                                style={{ width: 'auto', display: 'inline-block' }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="in_transit">In Transit</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="postponed">Postponed</option>
                                                <option value="maintenance">Maintenance</option>
                                            </Form.Select>
                                        </span>
                                    </div>
                                </div>
                            </div>
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

            <AllHearsesModal
                show={showHearses}
                onHide={() => setShowHearses(false)}
                hearses={hearses}
            />

            <RegisterHearseModal
                show={showRegister}
                onHide={() => setShowRegister(false)}
                onRegistered={handleRegistered}
                registering={registering}
                setRegistering={setRegistering}
                registerForm={registerForm}
                setRegisterForm={setRegisterForm}
            />
        </>
    );
};

export default BookingSystem;