import React, { useState, useEffect, useCallback } from 'react';
import {
    Row, Col, Spinner, Modal, Button, Form, Table, Dropdown
} from 'react-bootstrap';
import './hearseBookings.css';
import { useSocket } from '../../context/socketContext';
import {
    Eye, RefreshCw, User, Car, CheckCircle, XCircle, AlertCircle,
    Calendar, Truck, Search, MoreVertical, MapPin, Plus, Wrench,
    ChevronDown, Phone, Clock, ArrowRight, Building2
} from 'lucide-react';
import env from '../../config/env';

const API_BASE_URL = `${env.FULL_API_URL}`;

const getTenantSlug = () =>
    localStorage.getItem('tenantSlug') || localStorage.getItem('tenant_slug') || 'default';

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const headers = { 'x-tenant-slug': getTenantSlug() };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// ─── Service Layer ────────────────────────────────────────────────────────────
const bookingService = {
    /** Fetch all bookings, optionally filtered by branch_id */
    getBookings: async (branchId = null) => {
        const params = new URLSearchParams({ t: Date.now() });
        if (branchId && branchId !== 'all') params.set('branch_id', branchId);
        const r = await fetch(`${API_BASE_URL}/hearse-bookings?${params}`, { headers: getAuthHeaders() });
        if (!r.ok) throw new Error('Failed to load bookings');
        const data = await r.json();
        return { bookings: data.bookings || [], branches: data.branches || [] };
    },
    getAllHearses: async () => {
        const r = await fetch(`${API_BASE_URL}/hearses`, { headers: getAuthHeaders() });
        if (!r.ok) throw new Error('Failed');
        return (await r.json()).hearses || [];
    },
    getAvailableHearses: async () => {
        // Use cross-branch endpoint so any branch can see all available hearses
        const r = await fetch(`${API_BASE_URL}/hearses/available/cross-branch?t=${Date.now()}`, { headers: getAuthHeaders() });
        if (r.ok) {
            const data = await r.json();
            return data.hearses || [];
        }
        // Fallback to single-branch available
        const r2 = await fetch(`${API_BASE_URL}/hearses/available?t=${Date.now()}`, { headers: getAuthHeaders() });
        const data2 = await r2.json();
        return data2.hearses || data2 || [];
    },
    getBranches: async () => {
        try {
            const tenantSlug = getTenantSlug();
            const r = await fetch(`${API_BASE_URL}/tenant/${tenantSlug}/branches`, { headers: getAuthHeaders() });
            if (!r.ok) throw new Error('branches api failed');
            const data = await r.json();
            return data.data || [];
        } catch {
            return [];
        }
    },
    createBooking: async (data) => {
        const headers = getAuthHeaders();
        headers['Content-Type'] = 'application/json';

        // Add user info headers from localStorage user object
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        if (user?.branch_id) headers['x-branch-id'] = user.branch_id;
        if (user?.branch_code) headers['x-branch-code'] = user.branch_code;
        if (user?.email) headers['x-user-email'] = user.email;
        // Support both camelCase (userId) and snake_case (user_id) from JWT
        if (user?.user_id || user?.userId) headers['x-user-id'] = user.user_id || user.userId;
        // Use full_name, username, email, or role as fallback for display name
        const displayName = user?.full_name || user?.username || user?.name || user?.email || user?.role || 'System';
        headers['x-user-name'] = displayName;

        const r = await fetch(`${API_BASE_URL}/hearse-bookings`, {
            method: 'POST', headers, body: JSON.stringify(data)
        });
        if (!r.ok) { const err = await r.json(); throw new Error(err.message || 'Failed'); }
        return r.json();
    },
    registerHearse: async (data) => {
        const fd = new FormData();
        fd.append('plate_number', data.plate_number);
        fd.append('hearse_name', data.hearse_name || '');
        fd.append('model', data.model || '');
        fd.append('capacity', data.capacity || 1);
        if (data.branch_id) fd.append('branch_id', data.branch_id);
        if (data.branch_code) fd.append('branch_code', data.branch_code);
        const r = await fetch(`${API_BASE_URL}/hearses`, {
            method: 'POST', headers: getAuthHeaders(), body: fd
        });
        if (!r.ok) throw new Error('Failed to register hearse');
        return r.json();
    },
    updateBookingStatus: async (bookingId, status) => {
        const headers = getAuthHeaders();
        headers['Content-Type'] = 'application/json';
        const r = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/status`, {
            method: 'PUT', headers, body: JSON.stringify({ status })
        });
        if (!r.ok) { const err = await r.json(); throw new Error(err.message || 'Failed'); }
        return r.json();
    },
    postponeBooking: async (bookingId, data) => {
        const headers = getAuthHeaders();
        headers['Content-Type'] = 'application/json';
        const r = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/postpone`, {
            method: 'PATCH', headers, body: JSON.stringify(data)
        });
        if (!r.ok) { const err = await r.json(); throw new Error(err.message || 'Failed'); }
        return r.json();
    }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'N/A';
const fmtDateOnly = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';
const genId = (id) => id ? (id.toString().startsWith('BK-') ? id : `BK-${String(id).padStart(4, '0')}`) : 'N/A';

// ─── StatusBadge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const labels = {
        booked: 'BOOKED', in_transit: 'IN TRANSIT', completed: 'COMPLETED',
        cancelled: 'CANCELLED', postponed: 'POSTPONED', maintenance: 'MAINTENANCE',
        pending: 'PENDING', confirmed: 'CONFIRMED'
    };
    return (
        <span className={`hb-status ${status || ''}`}>
            <span className="hb-status-dot" />
            {labels[status] || status?.toUpperCase() || 'UNKNOWN'}
        </span>
    );
};

// ─── BranchBadge ─────────────────────────────────────────────────────────────
const BranchBadge = ({ name, code }) => {
    const label = name || code || null;
    if (!label) return <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>;
    return (
        <span className="hb-branch-tag">
            <Building2 size={11} />
            {label}
        </span>
    );
};

// ─── Toast ───────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onDone }) => {
    useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
    return (
        <div className={`hb-toast ${type}`}>
            {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span>{message}</span>
        </div>
    );
};

// ─── AvailableHearsesModal ────────────────────────────────────────────────────
const AvailableHearsesModal = ({ show, onHide, onBookingCreated, globalBranches }) => {
    const [hearses, setHearses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [filterBranch, setFilterBranch] = useState('all');
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (show) {
            setSelected(null); setBookingDate(''); setClientName('');
            setClientPhone(''); setFromLocation(''); setToLocation('');
            setErrorMessage(''); setFilterBranch('all');
            loadHearses();
        }
    }, [show]);

    const loadHearses = async () => {
        setLoading(true);
        try { setHearses(await bookingService.getAvailableHearses()); }
        catch (e) { console.error('Failed to load hearses:', e); }
        finally { setLoading(false); }
    };

    const displayedHearses = filterBranch === 'all'
        ? hearses
        : hearses.filter(h => String(h.branch_id) === String(filterBranch));

    const handleBook = async () => {
        if (!selected || !bookingDate || !clientName || !fromLocation || !toLocation) {
            setErrorMessage('Please fill in all required fields'); return;
        }
        setSubmitting(true); setErrorMessage('');
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : {};

            // Get current user's branch information
            const userBranchId = user?.branch_id || selected?.branch_id || '';
            const userBranchCode = user?.branch_code || selected?.branch_code || '';

            await bookingService.createBooking({
                hearse_id: selected.id,
                client_name: clientName,
                client_phone: clientPhone || '',
                destination: `${fromLocation} to ${toLocation}`,
                from_timestamp: bookingDate, // Date only, no time
                booked_by: user?.email || user?.userId || user?.role || 'unknown',
                branch_id: userBranchId,
                branch_code: userBranchCode
            });
            onBookingCreated(); onHide();
        } catch (e) { setErrorMessage(e.message || 'Failed to create booking.'); }
        finally { setSubmitting(false); }
    };

    // Unique branches from available hearses
    const branchOptions = globalBranches.length > 0
        ? globalBranches
        : [...new Map(hearses.filter(h => h.branch_id).map(h => [h.branch_id, { branch_id: h.branch_id, branch_name: h.branch_name || h.branch_code || `Branch ${h.branch_id}` }])).values()];

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="hb-modal hb-modal-dark" fullscreen="sm-down">
            <Modal.Header closeButton>
                <Modal.Title>
                    <Truck size={18} /> Book a Hearse
                    <span className="hb-count-badge accent">{displayedHearses.length} available</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!selected ? (
                    <>
                        {/* Branch filter tabs */}
                        {branchOptions.length > 1 && (
                            <div className="hb-branch-tabs mb-3">
                                <button
                                    className={`hb-branch-tab ${filterBranch === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilterBranch('all')}
                                >
                                    All Branches <span className="pill-count">{hearses.length}</span>
                                </button>
                                {branchOptions.map(br => (
                                    <button
                                        key={br.branch_id}
                                        className={`hb-branch-tab ${String(filterBranch) === String(br.branch_id) ? 'active' : ''}`}
                                        onClick={() => setFilterBranch(String(br.branch_id))}
                                    >
                                        <Building2 size={12} />
                                        {br.branch_name}
                                        <span className="pill-count">
                                            {hearses.filter(h => String(h.branch_id) === String(br.branch_id)).length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-4">
                                <div className="hb-loading-spinner" />
                                <p className="text-muted small mt-2">Loading available vehicles...</p>
                            </div>
                        ) : displayedHearses.length === 0 ? (
                            <div className="hb-modal-empty">
                                <div className="hb-modal-empty-icon"><Car size={28} /></div>
                                <h5>No hearses available</h5>
                                <p className="text-muted small mb-0">All vehicles are currently booked or in maintenance</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hb-desktop-only">
                                    <div className="table-responsive">
                                        <Table hover size="sm" className="hb-modal-table mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Plate</th>
                                                    <th>Model</th>
                                                    <th>Branch</th>
                                                    <th className="text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {displayedHearses.map(h => (
                                                    <tr key={h.id}>
                                                        <td><strong>{h.hearse_name || 'N/A'}</strong></td>
                                                        <td><span className="hb-plate-badge">{h.plate_number || h.number_plate}</span></td>
                                                        <td className="text-muted">{h.model || 'N/A'}</td>
                                                        <td>
                                                            <BranchBadge name={h.branch_name} code={h.branch_code} />
                                                        </td>
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
                                </div>
                                {/* Mobile cards */}
                                <div className="hb-mobile-only">
                                    {displayedHearses.map(h => (
                                        <div key={h.id} className="hb-hearse-card" onClick={() => setSelected(h)}>
                                            <div className="hb-hearse-card-top">
                                                <div>
                                                    <div className="hb-hearse-card-name">{h.hearse_name || 'N/A'}</div>
                                                    <div className="hb-hearse-card-model">{h.model || 'No model'}</div>
                                                </div>
                                                <span className="hb-plate-badge">{h.plate_number || h.number_plate}</span>
                                            </div>
                                            <div className="hb-hearse-card-bottom">
                                                <BranchBadge name={h.branch_name} code={h.branch_code} />
                                                <span className="hb-hearse-card-book">Book <ArrowRight size={14} /></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {errorMessage && (
                            <div className="alert alert-danger d-flex align-items-center" style={{ fontSize: '0.85rem', padding: '0.65rem 0.85rem', marginBottom: '1rem', borderRadius: '8px' }}>
                                <XCircle size={16} className="me-2 flex-shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}
                        <div className="hb-selected-info">
                            <div className="hb-selected-icon"><Car size={22} /></div>
                            <div className="hb-selected-details">
                                <strong>{selected.hearse_name}</strong>
                                <span className="hb-plate-badge hb-plate-inline">{selected.plate_number || selected.number_plate}</span>
                                <div className="sub">
                                    {selected.model} • {selected.capacity} seats
                                    {(selected.branch_name || selected.branch_code) && (
                                        <> • <BranchBadge name={selected.branch_name} code={selected.branch_code} /></>
                                    )}
                                </div>
                            </div>
                            <Button variant="link" className="hb-change-btn" onClick={() => setSelected(null)}>← Change</Button>
                        </div>

                        <div className="hb-section-label">Booking Details</div>
                        <Row className="g-3">
                            <Col xs={12} md={6}>
                                <Form.Group>
                                    <Form.Label className="hb-form-label">Booking Date *</Form.Label>
                                    <Form.Control type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="hb-form-control" required />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group>
                                    <Form.Label className="hb-form-label">Client Name *</Form.Label>
                                    <Form.Control value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Full name" className="hb-form-control" required />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group>
                                    <Form.Label className="hb-form-label">Phone</Form.Label>
                                    <Form.Control value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="0712345678" className="hb-form-control" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="g-3 mt-0">
                            <Col xs={12} md={6}>
                                <Form.Group>
                                    <Form.Label className="hb-form-label">From *</Form.Label>
                                    <Form.Control value={fromLocation} onChange={e => setFromLocation(e.target.value)} placeholder="Pickup location" className="hb-form-control" required />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group>
                                    <Form.Label className="hb-form-label">To *</Form.Label>
                                    <Form.Control value={toLocation} onChange={e => setToLocation(e.target.value)} placeholder="Destination" className="hb-form-control" required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="hb-modal-actions">
                            <button type="button" className="hb-btn hb-btn-ghost" onClick={() => setSelected(null)}>← Back</button>
                            <button
                                type="button" className="hb-btn hb-btn-green"
                                onClick={handleBook}
                                disabled={!bookingDate || !clientName || !fromLocation || !toLocation || submitting}
                            >
                                {submitting ? <><span className="hb-loading-spinner hb-spinner-sm" />Booking...</> : <><CheckCircle size={16} />Confirm Booking</>}
                            </button>
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

// ─── PostponeModal ────────────────────────────────────────────────────────────
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
    const submit = async (e) => { e.preventDefault(); await onPostpone(booking.booking_id, { new_departure_time: date, reason }); onHide(); };
    return (
        <Modal show={show} onHide={onHide} centered className="hb-modal hb-modal-amber" fullscreen="sm-down">
            <Modal.Header closeButton>
                <Modal.Title><Calendar size={18} /> Postpone Booking</Modal.Title>
            </Modal.Header>
            <form onSubmit={submit}>
                <Modal.Body>
                    <div className="hb-notice warning">
                        <AlertCircle size={18} />
                        <span>Postponing <strong>{genId(booking?.booking_id)}</strong> for {booking?.client_name}</span>
                    </div>
                    <Form.Group className="mb-3">
                        <Form.Label className="hb-form-label">New Date *</Form.Label>
                        <Form.Control type="date" value={date} onChange={e => setDate(e.target.value)} className="hb-form-control" required />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="hb-form-label">Reason</Form.Label>
                        <Form.Control as="textarea" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Why is this booking being postponed?" className="hb-form-control" />
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

// ─── AllHearsesModal ──────────────────────────────────────────────────────────
const AllHearsesModal = ({ show, onHide, hearses, globalBranches }) => {
    const [branchFilter, setBranchFilter] = useState('all');
    const displayed = branchFilter === 'all' ? hearses : hearses.filter(h => String(h.branch_id) === String(branchFilter));
    const branchOptions = globalBranches.length > 0
        ? globalBranches
        : [...new Map(hearses.filter(h => h.branch_id).map(h => [h.branch_id, { branch_id: h.branch_id, branch_name: h.branch_name || h.branch_code || `Branch ${h.branch_id}` }])).values()];

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="hb-modal hb-modal-dark" fullscreen="sm-down">
            <Modal.Header closeButton>
                <Modal.Title>
                    <Car size={18} /> All Hearses
                    <span className="hb-count-badge accent">{displayed.length}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {branchOptions.length > 1 && (
                    <div className="hb-branch-tabs mb-3">
                        <button className={`hb-branch-tab ${branchFilter === 'all' ? 'active' : ''}`} onClick={() => setBranchFilter('all')}>
                            All <span className="pill-count">{hearses.length}</span>
                        </button>
                        {branchOptions.map(br => (
                            <button
                                key={br.branch_id}
                                className={`hb-branch-tab ${String(branchFilter) === String(br.branch_id) ? 'active' : ''}`}
                                onClick={() => setBranchFilter(String(br.branch_id))}
                            >
                                <Building2 size={12} /> {br.branch_name}
                                <span className="pill-count">{hearses.filter(h => String(h.branch_id) === String(br.branch_id)).length}</span>
                            </button>
                        ))}
                    </div>
                )}
                {displayed.length === 0 ? (
                    <div className="hb-modal-empty">
                        <div className="hb-modal-empty-icon"><Car size={28} /></div>
                        <h5>No hearses registered</h5>
                        <p className="text-muted small mb-0">Register a new hearse to get started</p>
                    </div>
                ) : (
                    <>
                        <div className="hb-desktop-only">
                            <div className="table-responsive">
                                <Table hover size="sm" className="hb-modal-table mb-0">
                                    <thead>
                                        <tr>
                                            <th>Name</th><th>Plate</th><th>Model</th><th>Cap.</th><th>Branch</th><th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayed.map(h => {
                                            const isBooked = h.status === 'booked' || h.is_booked;
                                            return (
                                                <tr key={h.id}>
                                                    <td><strong>{h.hearse_name || 'N/A'}</strong></td>
                                                    <td><span className="hb-plate-badge">{h.plate_number || h.number_plate}</span></td>
                                                    <td className="text-muted">{h.model || 'N/A'}</td>
                                                    <td>{h.capacity || '-'}</td>
                                                    <td><BranchBadge name={h.branch_name} code={h.branch_code} /></td>
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
                        </div>
                        <div className="hb-mobile-only">
                            {displayed.map(h => {
                                const isBooked = h.status === 'booked' || h.is_booked;
                                return (
                                    <div key={h.id} className="hb-hearse-card">
                                        <div className="hb-hearse-card-top">
                                            <div>
                                                <div className="hb-hearse-card-name">{h.hearse_name || 'N/A'}</div>
                                                <div className="hb-hearse-card-model">{h.model || 'No model'} • {h.capacity || '-'} seats</div>
                                            </div>
                                            <span className={`hb-status ${isBooked ? 'booked' : 'completed'}`}>
                                                <span className="hb-status-dot" />
                                                {isBooked ? 'BOOKED' : 'AVAILABLE'}
                                            </span>
                                        </div>
                                        <div className="hb-hearse-card-bottom">
                                            <span className="hb-plate-badge">{h.plate_number || h.number_plate}</span>
                                            <BranchBadge name={h.branch_name} code={h.branch_code} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

// ─── RegisterHearseModal ──────────────────────────────────────────────────────
const RegisterHearseModal = ({ show, onHide, onRegistered, registering, setRegistering, registerForm, setRegisterForm, globalBranches }) => {
    const handleRegister = async (e) => {
        e.preventDefault();
        setRegistering(true);
        try {
            await bookingService.registerHearse(registerForm);
            onRegistered(); onHide();
        } catch (e) { alert('Failed to register hearse: ' + e.message); }
        setRegistering(false);
    };
    return (
        <Modal show={show} onHide={onHide} centered className="hb-modal hb-modal-dark" fullscreen="sm-down">
            <Modal.Header closeButton>
                <Modal.Title><Plus size={18} /> Register Hearse</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleRegister}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="hb-form-label">Hearse Name *</Form.Label>
                        <Form.Control
                            value={registerForm.hearse_name}
                            onChange={e => setRegisterForm(p => ({ ...p, hearse_name: e.target.value }))}
                            placeholder="e.g., Mercedes Sprinter" className="hb-form-control" required
                        />
                    </Form.Group>
                    <Row className="g-3">
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label className="hb-form-label">Plate Number *</Form.Label>
                                <Form.Control
                                    value={registerForm.plate_number}
                                    onChange={e => setRegisterForm(p => ({ ...p, plate_number: e.target.value.toUpperCase() }))}
                                    placeholder="KCA 1234" className="hb-form-control" required
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label className="hb-form-label">Model</Form.Label>
                                <Form.Control
                                    value={registerForm.model}
                                    onChange={e => setRegisterForm(p => ({ ...p, model: e.target.value }))}
                                    placeholder="Toyota Hiace" className="hb-form-control"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label className="hb-form-label">Capacity</Form.Label>
                                <Form.Control
                                    type="number" value={registerForm.capacity}
                                    onChange={e => setRegisterForm(p => ({ ...p, capacity: e.target.value }))}
                                    placeholder="4" min="1" className="hb-form-control"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label className="hb-form-label">
                                    Branch {globalBranches.length > 0 ? '*' : '(Code)'}
                                </Form.Label>
                                {globalBranches.length > 0 ? (
                                    <Form.Select
                                        className="hb-form-control"
                                        value={registerForm.branch_id || ''}
                                        onChange={e => {
                                            const br = globalBranches.find(b => String(b.branch_id) === e.target.value);
                                            setRegisterForm(p => ({
                                                ...p,
                                                branch_id: e.target.value,
                                                branch_code: br?.branch_slug || br?.branch_name?.substring(0, 3).toUpperCase() || ''
                                            }));
                                        }}
                                        required
                                    >
                                        <option value="">— Select Branch —</option>
                                        {globalBranches.map(br => (
                                            <option key={br.branch_id} value={br.branch_id}>
                                                {br.branch_name} {br.branch_location ? `(${br.branch_location})` : ''}
                                            </option>
                                        ))}
                                    </Form.Select>
                                ) : (
                                    <Form.Control
                                        value={registerForm.branch_code}
                                        onChange={e => setRegisterForm(p => ({ ...p, branch_code: e.target.value.toUpperCase() }))}
                                        placeholder="e.g., NBI" className="hb-form-control" required
                                    />
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="hb-btn hb-btn-ghost" onClick={onHide}>Cancel</button>
                    <button type="submit" className="hb-btn hb-btn-green" disabled={registering}>
                        {registering ? <><span className="hb-loading-spinner hb-spinner-sm" />Saving...</> : <><CheckCircle size={16} />Register Hearse</>}
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

// ─── DetailsModal ─────────────────────────────────────────────────────────────
const DetailsModal = ({ show, onHide, booking }) => {
    if (!booking) return null;
    const b = booking;
    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="hb-modal hb-modal-dark" fullscreen="sm-down">
            <Modal.Header closeButton>
                <Modal.Title><Eye size={18} /> Booking {b.booking_code || genId(b.booking_id)}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="g-3">
                    <Col xs={12} md={6}>
                        <div className="hb-detail-card">
                            <div className="hb-detail-card-header"><User size={14} />Client Information</div>
                            <div className="hb-detail-card-body">
                                <div className="hb-detail-row"><span className="label">Name</span><span className="value">{b.client_name}</span></div>
                                <div className="hb-detail-row"><span className="label">Phone</span><span className="value">{b.client_phone || 'N/A'}</span></div>
                                {b.client_email && (
                                    <div className="hb-detail-row"><span className="label">Email</span><span className="value">{b.client_email}</span></div>
                                )}
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div className="hb-detail-card">
                            <div className="hb-detail-card-header"><User size={14} />Booked By</div>
                            <div className="hb-detail-card-body">
                                <div className="hb-detail-row"><span className="label">Name</span><span className="value">{b.booked_by_name || b.booked_by || 'N/A'}</span></div>
                                <div className="hb-detail-row"><span className="label">Email</span><span className="value">{b.booked_by_email || 'N/A'}</span></div>
                                <div className="hb-detail-row"><span className="label">Branch</span><span className="value"><BranchBadge name={b.branch_name} code={b.branch_code} /></span></div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div className="hb-detail-card">
                            <div className="hb-detail-card-header"><Truck size={14} />Trip Details</div>
                            <div className="hb-detail-card-body">
                                <div className="hb-detail-row"><span className="label">Destination</span><span className="value">{b.destination || 'N/A'}</span></div>
                                <div className="hb-detail-row"><span className="label">Date</span><span className="value">{fmtDateOnly(b.booking_date || b.estimated_departure_time)}</span></div>
                                <div className="hb-detail-row"><span className="label">Status</span><span className="value"><StatusBadge status={b.status} /></span></div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div className="hb-detail-card">
                            <div className="hb-detail-card-header"><Car size={14} />Vehicle</div>
                            <div className="hb-detail-card-body">
                                <div className="hb-detail-row"><span className="label">Name</span><span className="value">{b.hearse_name || 'N/A'}</span></div>
                                <div className="hb-detail-row"><span className="label">Plate</span><span className="value"><span className="hb-plate-badge">{b.plate_number || b.number_plate || 'N/A'}</span></span></div>
                                <div className="hb-detail-row">
                                    <span className="label">Branch</span>
                                    <span className="value"><BranchBadge name={b.branch_name} code={b.branch_code} /></span>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div className="hb-detail-card">
                            <div className="hb-detail-card-header"><Clock size={14} />Timestamps</div>
                            <div className="hb-detail-card-body">
                                <div className="hb-detail-row"><span className="label">Created</span><span className="value">{fmtDate(b.created_at)}</span></div>
                                <div className="hb-detail-row"><span className="label">Updated</span><span className="value">{fmtDate(b.updated_at)}</span></div>
                                {b.postpone_reason && (
                                    <div className="hb-detail-row"><span className="label">Reason</span><span className="value">{b.postpone_reason}</span></div>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

// ─── Mobile BookingCard ───────────────────────────────────────────────────────
const BookingCard = ({ b, onStatus, onView, onPostpone }) => (
    <div className="hb-booking-card">
        <div className="hb-booking-card-header">
            <div>
                <div className="hb-booking-card-id">{b.booking_code || genId(b.booking_id)}</div>
                <div className="hb-booking-card-date">{fmtDate(b.created_at)}</div>
            </div>
            <StatusBadge status={b.status} />
        </div>

        <div className="hb-booking-card-client">
            <div className="hb-booking-card-client-avatar"><User size={16} /></div>
            <div className="hb-booking-card-client-info">
                <div className="hb-booking-card-client-name">{b.client_name}</div>
                {b.client_phone && (
                    <div className="hb-booking-card-client-phone"><Phone size={11} /> {b.client_phone}</div>
                )}
            </div>
        </div>

        <div className="hb-booking-card-route">
            <div className="hb-route-item">
                <div className="hb-route-dot hb-route-dot-red" />
                <div className="hb-route-text">{b.destination || 'N/A'}</div>
            </div>
        </div>

        <div className="hb-booking-card-vehicle">
            <Car size={14} />
            <span className="hb-plate-badge">{b.plate_number || b.number_plate || 'N/A'}</span>
            {b.hearse_name && <span className="hb-booking-card-hearse-name">{b.hearse_name}</span>}
            <BranchBadge name={b.branch_name} code={b.branch_code} />
        </div>

        <div className="hb-booking-card-date-mobile">
            <Clock size={12} />{fmtDateOnly(b.booking_date || b.estimated_departure_time)}
        </div>

        <div className="hb-booking-card-actions">
            <button className="hb-card-action" onClick={() => onView(b)}><Eye size={15} /> View</button>
            {b.status === 'booked' && (
                <button className="hb-card-action hb-card-action-primary" onClick={() => onStatus(b.booking_id, 'in_transit')}>
                    <Truck size={15} /> Transit
                </button>
            )}
            {b.status === 'in_transit' && (
                <button className="hb-card-action hb-card-action-success" onClick={() => onStatus(b.booking_id, 'completed')}>
                    <CheckCircle size={15} /> Complete
                </button>
            )}
            {b.status !== 'cancelled' && b.status !== 'completed' && (
                <Dropdown align="end">
                    <Dropdown.Toggle as="div">
                        <button className="hb-card-action hb-card-action-more"><MoreVertical size={15} /></button>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="hb-action-menu">
                        <Dropdown.Item onClick={() => onStatus(b.booking_id, 'maintenance')}>
                            <Wrench size={14} style={{ color: '#9333ea' }} />Maintenance
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => onStatus(b.booking_id, 'cancelled')}>
                            <XCircle size={14} style={{ color: '#dc2626' }} />Cancel
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => onPostpone(b)}>
                            <Calendar size={14} style={{ color: '#d97706' }} />Postpone
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            )}
        </div>
    </div>
);

// ─── Main BookingSystem ───────────────────────────────────────────────────────
const BookingSystem = () => {
    const [bookings, setBookings] = useState([]);
    const [hearses, setHearses] = useState([]);
    const [globalBranches, setGlobalBranches] = useState([]); // real branches from tenant API
    const [filter, setFilter] = useState('booked');
    const [branchFilter, setBranchFilter] = useState('all'); // branch_id or 'all'
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showPostpone, setShowPostpone] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showHearses, setShowHearses] = useState(false);
    const [showAvailable, setShowAvailable] = useState(false);
    const [registerForm, setRegisterForm] = useState({
        plate_number: '', hearse_name: '', model: '', capacity: '', branch_code: '', branch_id: ''
    });
    const [registering, setRegistering] = useState(false);
    const [availabilityResult, setAvailabilityResult] = useState(null);
    const [showBranchDropdown, setShowBranchDropdown] = useState(false);
    const { socket } = useSocket();

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);
    const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

    // ── Load branches once on mount ─────────────────────────────────────────
    useEffect(() => {
        bookingService.getBranches().then(branches => {
            if (branches && branches.length > 0) setGlobalBranches(branches);
        });
    }, []);

    // ── Initial data load ───────────────────────────────────────────────────
    useEffect(() => { loadData(); loadHearses(); }, []);

    // ── Socket.io real-time ─────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;
        socket.on('new_booking', (d) => { setBookings(p => [d.booking, ...p]); addToast('New booking received!'); });
        socket.on('booking_status_updated', (d) => {
            setBookings(p => p.map(b => b.booking_id === d.booking_id ? { ...b, status: d.status, ...d.booking } : b));
        });
        socket.on('booking_postponed', (d) => {
            addToast(`Booking ${d.booking_id} postponed`, 'warning');
            loadData();
        });
        socket.on('hearse_registered', (d) => {
            addToast(d.message || 'New hearse registered!');
            loadHearses();
        });
        socket.on('hearse_updated', (d) => {
            addToast(d.message || 'Hearse updated');
            loadHearses();
        });
        return () => {
            socket.off('new_booking');
            socket.off('booking_status_updated');
            socket.off('booking_postponed');
            socket.off('hearse_registered');
            socket.off('hearse_updated');
        };
    }, [socket, addToast]);

    const loadData = async () => {
        setLoading(true);
        try {
            const { bookings: bks, branches: brs } = await bookingService.getBookings();
            setBookings(bks);
            // Merge API branches with any returned from bookings response
            if (brs && brs.length > 0) {
                setGlobalBranches(prev => {
                    const combined = [...prev, ...brs];
                    const seen = new Set();
                    return combined.filter(b => { if (seen.has(b.branch_id)) return false; seen.add(b.branch_id); return true; });
                });
            }
        } catch (e) { addToast('Failed to load bookings.', 'error'); }
        setLoading(false);
    };

    const loadHearses = async () => {
        try { setHearses(await bookingService.getAllHearses()); }
        catch (e) { console.error(e); }
    };

    const handleStatus = async (id, s) => {
        try { await bookingService.updateBookingStatus(id, s); addToast('Status updated!'); await loadData(); }
        catch (e) { addToast('Failed to update status.', 'error'); }
    };
    const handlePostpone = async (id, d) => {
        try { await bookingService.postponeBooking(id, d); addToast('Booking postponed!'); await loadData(); }
        catch (e) { addToast('Failed to postpone.', 'error'); }
    };
    const handleRegistered = async () => {
        addToast('Hearse registered!');
        setRegisterForm({ plate_number: '', hearse_name: '', model: '', capacity: '', branch_code: '', branch_id: '' });
        await loadHearses();
    };

    const checkAvailability = async () => {
        const date = document.getElementById('availabilityDate')?.value;
        if (!date) { addToast('Please select a date', 'error'); return; }
        try {
            setAvailabilityResult(null);
            const r = await fetch(`${API_BASE_URL}/hearse-bookings/check-date?date=${date}`, { headers: getAuthHeaders() });
            const data = await r.json();
            if (data.status === 'success') {
                setAvailabilityResult({ available: data.available_hearses?.length || 0, booked: data.booked_hearses?.length || 0, date });
            } else { addToast(data.message || 'No data returned', 'error'); }
        } catch (e) { addToast('Failed to check availability.', 'error'); }
    };

    // ── Filtering ────────────────────────────────────────────────────────────
    const getStatusCount = (status) => bookings.filter(b => b.status === status).length;
    const getBranchBookingCount = (branchId) => bookings.filter(b => String(b.branch_id) === String(branchId)).length;

    const filtered = bookings.filter(b => {
        const statusMatch = filter === 'all'
            ? !['completed', 'cancelled', 'postponed'].includes(b.status)
            : b.status === filter;
        const branchMatch = branchFilter === 'all' || String(b.branch_id) === String(branchFilter);
        return statusMatch && branchMatch;
    });

    const statusPills = [
        { key: 'all', label: 'ALL', color: 'navy', count: bookings.length },
        { key: 'booked', label: 'BOOKED', color: 'blue', count: getStatusCount('booked') },
        { key: 'in_transit', label: 'TRANSIT', color: 'cyan', count: getStatusCount('in_transit') },
        { key: 'completed', label: 'DONE', color: 'green', count: getStatusCount('completed') },
        { key: 'cancelled', label: 'CANCEL', color: 'red', count: getStatusCount('cancelled') },
        { key: 'postponed', label: 'LATER', color: 'amber', count: getStatusCount('postponed') }
    ];

    // Build branch display label
    const selectedBranchName = branchFilter === 'all'
        ? 'All Branches'
        : globalBranches.find(b => String(b.branch_id) === String(branchFilter))?.branch_name || `Branch ${branchFilter}`;

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
            <div className="hb-toast-container">
                {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onDone={() => removeToast(t.id)} />)}
            </div>

            <div className="hb-page">
                {/* Header */}
                <div className="hb-header">
                    <div className="hb-header-top">
                        <div className="hb-header-info">
                            <h4 className="hb-header-title">
                                <span className="icon-wrap"><Car size={20} /></span>
                                Hearse Management
                                {branchFilter !== 'all' && (
                                    <span className="hb-branch-context-badge">
                                        <Building2 size={13} /> {selectedBranchName}
                                    </span>
                                )}
                            </h4>
                            <div className="hb-header-meta">
                                <span className={`hb-live-badge ${socket?.connected ? 'online' : 'offline'}`}>
                                    <span className="hb-live-dot" />
                                    {socket?.connected ? 'LIVE' : 'OFFLINE'}
                                </span>
                                <span className="hb-active-count">
                                    {bookings.filter(b => !['completed', 'cancelled'].includes(b.status)).length} active
                                </span>
                                {globalBranches.length > 0 && (
                                    <span className="hb-active-count" style={{ color: '#8b5cf6' }}>
                                        {globalBranches.length} branches
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="hb-header-actions">
                            <button className="hb-btn-header ghost" onClick={loadData}>
                                <RefreshCw size={14} /><span>Refresh</span>
                            </button>
                            <button className="hb-btn-header primary" onClick={() => setShowAvailable(true)}>
                                <Truck size={14} /><span>New Booking</span>
                            </button>
                            <button className="hb-btn-header success" onClick={() => setShowRegister(true)}>
                                <Plus size={14} /><span>Register</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="hb-filter-bar">
                        <div className="hb-filter-row">
                            <div className="hb-filter-left">
                                <div className="hb-avail-check">
                                    <input type="date" id="availabilityDate" className="hb-input-sm" />
                                    <button className="hb-btn-filter dark" onClick={checkAvailability}>
                                        <Search size={13} /> Check
                                    </button>
                                </div>
                                <button className="hb-btn-filter hb-desktop-only" onClick={async () => { await loadHearses(); setShowHearses(true); }}>
                                    <Car size={13} /> All Hearses
                                </button>
                                {availabilityResult && (
                                    <div className="hb-avail-badges">
                                        <span className="hb-avail-badge green">{availabilityResult.available} Free</span>
                                        <span className="hb-avail-badge red">{availabilityResult.booked} Booked</span>
                                    </div>
                                )}
                            </div>

                            {/* Branch filter dropdown */}
                            <div className="hb-branch-filter-wrapper">
                                <button className="hb-branch-btn" onClick={() => setShowBranchDropdown(!showBranchDropdown)}>
                                    <Building2 size={13} />
                                    {selectedBranchName}
                                    <ChevronDown size={13} />
                                </button>
                                {showBranchDropdown && (
                                    <>
                                        <div className="hb-branch-overlay" onClick={() => setShowBranchDropdown(false)} />
                                        <div className="hb-branch-menu">
                                            <div
                                                className={`hb-branch-item ${branchFilter === 'all' ? 'active' : ''}`}
                                                onClick={() => { setBranchFilter('all'); setShowBranchDropdown(false); }}
                                            >
                                                <strong>All Branches</strong>
                                                <span className="hb-count-badge dark">{bookings.length}</span>
                                            </div>
                                            <div className="hb-branch-divider" />
                                            {globalBranches.length > 0 ? (
                                                globalBranches.map(branch => (
                                                    <div
                                                        key={branch.branch_id}
                                                        className={`hb-branch-item ${String(branchFilter) === String(branch.branch_id) ? 'active' : ''}`}
                                                        onClick={() => { setBranchFilter(String(branch.branch_id)); setShowBranchDropdown(false); }}
                                                    >
                                                        <Building2 size={12} style={{ opacity: 0.5, marginRight: 4 }} />
                                                        <strong>{branch.branch_name}</strong>
                                                        {branch.branch_location && (
                                                            <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: 4 }}>
                                                                {branch.branch_location}
                                                            </span>
                                                        )}
                                                        <span className="hb-count-badge accent">{getBranchBookingCount(branch.branch_id)}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="hb-branch-item" style={{ opacity: 0.5, fontSize: '0.8rem' }}>
                                                    No branches found
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Status pills */}
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

                {/* Desktop Table */}
                <div className="hb-table-card hb-desktop-only">
                    <div className="table-responsive">
                        <Table hover className="hb-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Client</th>
                                    <th>Destination</th>
                                    <th>Hearse</th>
                                    <th>Branch</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th className="text-center" style={{ width: '60px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="8">
                                            <div className="hb-empty">
                                                <div className="hb-empty-icon"><Car size={32} /></div>
                                                <h5>No bookings found</h5>
                                                <p>Try adjusting your filters or branch selection</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map(b => (
                                    <tr key={b.booking_id}>
                                        <td>
                                            <div className="booking-id">{b.booking_code || genId(b.booking_id)}</div>
                                            <div className="booking-date-sub">{fmtDate(b.created_at)}</div>
                                        </td>
                                        <td>
                                            <div className="client-name">{b.client_name}</div>
                                        </td>
                                        <td>
                                            <div className="dest-text" title={b.destination}>{b.destination}</div>
                                        </td>
                                        <td>
                                            <span className="hearse-plate">{b.plate_number || b.number_plate || 'N/A'}</span>
                                            <div className="hearse-sub">{b.hearse_name || ''}</div>
                                        </td>
                                        <td>
                                            <BranchBadge name={b.branch_name} code={b.branch_code} />
                                        </td>
                                        <td className="text-muted" style={{ fontSize: '0.84rem' }}>
                                            {fmtDateOnly(b.booking_date || b.estimated_departure_time)}
                                        </td>
                                        <td><StatusBadge status={b.status} /></td>
                                        <td className="text-center">
                                            <Dropdown align="end">
                                                <Dropdown.Toggle as="div">
                                                    <button className="hb-action-btn"><MoreVertical size={15} /></button>
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

                {/* Mobile Cards */}
                <div className="hb-mobile-only">
                    {filtered.length === 0 ? (
                        <div className="hb-table-card">
                            <div className="hb-empty">
                                <div className="hb-empty-icon"><Car size={32} /></div>
                                <h5>No bookings found</h5>
                                <p>Try adjusting your filters</p>
                            </div>
                        </div>
                    ) : (
                        filtered.map(b => (
                            <BookingCard
                                key={b.booking_id} b={b}
                                onStatus={handleStatus}
                                onView={(bk) => { setSelectedBooking(bk); setShowDetails(true); }}
                                onPostpone={(bk) => { setSelectedBooking(bk); setShowPostpone(true); }}
                            />
                        ))
                    )}
                </div>

                {/* Mobile floating All Hearses button */}
                <button className="hb-mobile-fab" onClick={async () => { await loadHearses(); setShowHearses(true); }}>
                    <Car size={18} />
                </button>
            </div>

            {/* Modals */}
            <AvailableHearsesModal
                show={showAvailable} onHide={() => setShowAvailable(false)}
                onBookingCreated={async () => { addToast('Booking created!'); await loadData(); }}
                globalBranches={globalBranches}
            />
            <PostponeModal
                show={showPostpone} onHide={() => setShowPostpone(false)}
                booking={selectedBooking} onPostpone={handlePostpone}
            />
            <AllHearsesModal
                show={showHearses} onHide={() => setShowHearses(false)}
                hearses={hearses} globalBranches={globalBranches}
            />
            <RegisterHearseModal
                show={showRegister} onHide={() => setShowRegister(false)}
                onRegistered={handleRegistered}
                registering={registering} setRegistering={setRegistering}
                registerForm={registerForm} setRegisterForm={setRegisterForm}
                globalBranches={globalBranches}
            />
            <DetailsModal
                show={showDetails} onHide={() => setShowDetails(false)} booking={selectedBooking}
            />
        </>
    );
};

export default BookingSystem;