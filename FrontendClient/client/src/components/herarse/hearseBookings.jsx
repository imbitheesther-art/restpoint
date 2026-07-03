import React, { useState, useEffect, useRef } from 'react';
import {
    Container,
    Row,
    Col,
    Alert,
    Spinner,
    Card,
    Badge,
    Modal,
    Button,
    Form,
    Toast,
    ToastContainer,
    Table,
    Dropdown
} from 'react-bootstrap';
import { useSocket } from '../../context/socketContext';
import {
    Eye,
    RefreshCw,
    Filter,
    Clock,
    User,
    Car,
    CheckCircle,
    XCircle,
    AlertCircle,
    MapPin,
    Calendar,
    Phone,
    Mail,
    Users,
    Truck,
    PhoneCall,
    Bell,
    Zap,
    ArrowRight,
    MoreHorizontal
} from 'lucide-react';

// API Service Layer
const API_BASE_URL = 'http://localhost:5001/api/v1/restpoint';

const bookingService = {
    getBookings: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/hearse-bookings`);
            if (!response.ok) throw new Error('Failed to fetch bookings');
            const data = await response.json();
            return data.bookings || [];
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    },



    getCrossBranchAvailability: async (branchId) => {
        try {
            const url = branchId
                ? `${API_BASE_URL}/hearses/available/cross-branch?branch_id=${branchId}`
                : `${API_BASE_URL}/hearses/available/cross-branch`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch cross-branch availability');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching cross-branch availability:', error);
            throw error;
        }
    },

    registerHearse: async (hearseData) => {
        try {
            const formData = new FormData();
            formData.append('number_plate', hearseData.number_plate);
            formData.append('min_charge_ksh', hearseData.min_charge_ksh);
            formData.append('max_charge_ksh', hearseData.max_charge_ksh);
            formData.append('branch_id', hearseData.branch_id);
            if (hearseData.model) formData.append('model', hearseData.model);
            if (hearseData.image) formData.append('image', hearseData.image);

            const response = await fetch(`${API_BASE_URL}/hearses`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Failed to register hearse');
            return await response.json();
        } catch (error) {
            console.error('Error registering hearse:', error);
            throw error;
        }
    },

    getAllHearses: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/hearses`);
            if (!response.ok) throw new Error('Failed to fetch hearses');
            const data = await response.json();
            return data.hearses || [];
        } catch (error) {
            console.error('Error fetching hearses:', error);
            throw error;
        }
    },

    assignDriver: async (bookingId, driverId, hearseId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/assign-driver`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    driver_id: parseInt(driverId),
                    hearse_id: parseInt(hearseId)
                })
            });
            if (!response.ok) throw new Error('Failed to assign driver');
            return await response.json();
        } catch (error) {
            console.error('Error assigning driver:', error);
            throw error;
        }
    },

    updateBookingStatus: async (bookingId, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });
            if (!response.ok) throw new Error('Failed to update status');
            return await response.json();
        } catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    },

    postponeBooking: async (bookingId, postponeData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/postpone`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postponeData)
            });
            if (!response.ok) throw new Error('Failed to postpone booking');
            return await response.json();
        } catch (error) {
            console.error('Error postponing booking:', error);
            throw error;
        }
    }
};

const driverService = {
    getDrivers: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/all-drivers`);
            if (!response.ok) throw new Error('Failed to fetch drivers');
            const data = await response.json();
            return data.drivers || data || [];
        } catch (error) {
            console.error('Error fetching drivers:', error);
            return [];
        }
    }
};

// Utility Functions
const utils = {
    formatDate: (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    getUpdatedBy: () => {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user).name : 'mumo';
        } catch {
            return 'mumo';
        }
    },

    getBranchId: () => {
        try {
            const branch = localStorage.getItem('branch');
            return branch ? JSON.parse(branch).id : '1';
        } catch {
            return '1';
        }
    },

    generateBookingId: (bookingId) => {
        return `BK-${String(bookingId).padStart(4, '0')}`;
    },

    getStatusColor: (status) => {
        const statusColors = {
            'pending': '#f39c12',
            'approved': '#3498db',
            'assigned': '#9b59b6',
            'in_transit': '#2980b9',
            'in-transit': '#2980b9',
            'completed': '#27ae60',
            'cancelled': '#e74c3c'
        };
        return statusColors[status] || '#95a5a6';
    },

    getStatusIcon: (status) => {
        const statusIcons = {
            'pending': <Clock size={14} />,
            'approved': <CheckCircle size={14} />,
            'assigned': <User size={14} />,
            'in_transit': <Car size={14} />,
            'in-transit': <Car size={14} />,
            'completed': <CheckCircle size={14} />,
            'cancelled': <XCircle size={14} />
        };
        return statusIcons[status] || <AlertCircle size={14} />;
    }
};

// Audio Notification Hook
const useAudioNotification = () => {
    const audioRef = useRef(null);

    const playNotification = () => {
        try {
            if (!audioRef.current) {
                audioRef.current = new Audio('/audio/notification-bells.mp3');
                audioRef.current.volume = 0.7;
            }
            audioRef.current.play().catch(error => {
                console.log('Audio play failed:', error);
            });
        } catch (error) {
            console.error('Audio notification error:', error);
        }
    };

    return playNotification;
};

// Enhanced Real-time Notification Toast with Audio
const NotificationToast = ({ show, onClose, notification, onPlayAudio }) => {
    if (!notification) return null;

    const getNotificationIcon = (type) => {
        const icons = {
            'NEW_BOOKING': <Bell size={16} />,
            'STATUS_UPDATE': <RefreshCw size={16} />,
            'DRIVER_ASSIGNED': <User size={16} />,
            'BOOKING_POSTPONED': <Calendar size={16} />
        };
        return icons[type] || <Bell size={16} />;
    };

    const getNotificationVariant = (type) => {
        const variants = {
            'NEW_BOOKING': 'success',
            'STATUS_UPDATE': 'info',
            'DRIVER_ASSIGNED': 'primary',
            'BOOKING_POSTPONED': 'warning'
        };
        return variants[type] || 'secondary';
    };

    useEffect(() => {
        if (show && notification && onPlayAudio) {
            onPlayAudio();
        }
    }, [show, notification, onPlayAudio]);

    return (
        <Toast
            show={show}
            onClose={onClose}
            delay={5000}
            autohide
            bg={getNotificationVariant(notification.type)}
            className="text-white border-0 shadow-lg"
        >
            <Toast.Header className={`text-white bg-${getNotificationVariant(notification.type)} border-0`}>
                <strong className="me-auto d-flex align-items-center gap-2">
                    {getNotificationIcon(notification.type)}
                    {notification.type.replace('_', ' ')}
                </strong>
                <small>{new Date(notification.timestamp).toLocaleTimeString()}</small>
            </Toast.Header>
            <Toast.Body>
                <strong>{notification.message}</strong>
                {notification.booking && (
                    <div className="mt-2">
                        <small>
                            Booking: {utils.generateBookingId(notification.booking.booking_id)}<br />
                            Client: {notification.booking.client_name}
                        </small>
                    </div>
                )}
            </Toast.Body>
        </Toast>
    );
};

// Stats Component
const BookingStats = ({ bookings }) => {
    const stats = [
        {
            label: 'Total',
            value: bookings.length,
            color: '#2c3e50',
            icon: <Users size={20} />,
            bg: 'bg-dark'
        },
        {
            label: 'Pending',
            value: bookings.filter(b => b.status === 'pending').length,
            color: '#f39c12',
            icon: <Clock size={20} />,
            bg: 'bg-warning'
        },
        {
            label: 'Assigned',
            value: bookings.filter(b => b.status === 'assigned').length,
            color: '#9b59b6',
            icon: <User size={20} />,
            bg: 'bg-primary'
        },
        {
            label: 'In Transit',
            value: bookings.filter(b => b.status === 'in_transit' || b.status === 'in-transit').length,
            color: '#2980b9',
            icon: <Car size={20} />,
            bg: 'bg-info'
        },
        {
            label: 'Completed',
            value: bookings.filter(b => b.status === 'completed').length,
            color: '#27ae60',
            icon: <CheckCircle size={20} />,
            bg: 'bg-success'
        },
        {
            label: 'Cancelled',
            value: bookings.filter(b => b.status === 'cancelled').length,
            color: '#e74c3c',
            icon: <XCircle size={20} />,
            bg: 'bg-danger'
        }
    ];

    return (
        <Row className="mb-4 g-3">
            {stats.map((stat, index) => (
                <Col xl={2} lg={4} md={4} sm={6} key={index}>
                    <Card className="stat-card h-100 border-0 shadow-sm">
                        <Card.Body className={`p-3 text-white ${stat.bg}`}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h2 className="mb-0 fw-bold">{stat.value}</h2>
                                    <small className="opacity-8">{stat.label}</small>
                                </div>
                                <div className="stat-icon" style={{ opacity: 0.8 }}>
                                    {stat.icon}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

// Filter Component
const BookingFilter = ({ currentFilter, onFilterChange }) => {
    const filters = [
        { key: 'all', label: 'All Bookings', icon: <Filter size={14} />, variant: 'outline-dark' },
        { key: 'pending', label: 'Pending', icon: <Clock size={14} />, variant: 'outline-warning' },
        { key: 'assigned', label: 'Assigned', icon: <User size={14} />, variant: 'outline-primary' },
        { key: 'in_transit', label: 'In Transit', icon: <Car size={14} />, variant: 'outline-info' },
        { key: 'completed', label: 'Completed', icon: <CheckCircle size={14} />, variant: 'outline-success' },
        { key: 'cancelled', label: 'Cancelled', icon: <XCircle size={14} />, variant: 'outline-danger' },
    ];

    return (
        <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
                <h6 className="mb-3 text-dark fw-bold d-flex align-items-center gap-2">
                    <Filter size={16} />
                    Filter Bookings
                </h6>
                <div className="d-flex flex-wrap gap-2">
                    {filters.map(filter => (
                        <Button
                            key={filter.key}
                            variant={currentFilter === filter.key ? filter.variant.replace('outline-', '') : filter.variant}
                            size="sm"
                            onClick={() => onFilterChange(filter.key)}
                            className="d-flex align-items-center gap-2 fw-semibold px-3 py-2 rounded-pill"
                        >
                            {filter.icon}
                            <span>{filter.label}</span>
                        </Button>
                    ))}
                </div>
            </Card.Body>
        </Card>
    );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
    const statusConfig = {
        'pending': { label: 'PENDING', color: 'warning', icon: <Clock size={12} /> },
        'assigned': { label: 'ASSIGNED', color: 'primary', icon: <User size={12} /> },
        'in_transit': { label: 'IN TRANSIT', color: 'info', icon: <Car size={12} /> },
        'completed': { label: 'COMPLETED', color: 'success', icon: <CheckCircle size={12} /> },
        'cancelled': { label: 'CANCELLED', color: 'danger', icon: <XCircle size={12} /> }
    };

    const config = statusConfig[status] || { label: status?.toUpperCase() || 'UNKNOWN', color: 'secondary', icon: <AlertCircle size={12} /> };

    return (
        <Badge
            className="fw-bold px-3 py-2 d-inline-flex align-items-center gap-1"
            bg={config.color}
        >
            {config.icon}
            <span>{config.label}</span>
        </Badge>
    );
};

// Sleek Action Buttons Component
const ActionButtons = ({ booking, onStatusUpdate, onDriverAssign, onViewDetails, onShowPostpone, availableDrivers }) => {
    const [showActions, setShowActions] = useState(false);

    const getAvailableActions = () => {
        const actions = [];

        switch (booking.status) {
            case 'pending':
                if (!booking.driver_id) {
                    actions.push({
                        label: 'Assign Driver',
                        icon: <User size={14} />,
                        variant: 'primary',
                        action: () => setShowActions(true)
                    });
                } else {
                    actions.push({
                        label: 'Approve Booking',
                        icon: <CheckCircle size={14} />,
                        variant: 'success',
                        action: () => onStatusUpdate(booking.booking_id, 'assigned')
                    });
                }
                actions.push(
                    {
                        label: 'Postpone',
                        icon: <Calendar size={14} />,
                        variant: 'warning',
                        action: () => onShowPostpone(booking)
                    },
                    {
                        label: 'Cancel',
                        icon: <XCircle size={14} />,
                        variant: 'outline-danger',
                        action: () => onStatusUpdate(booking.booking_id, 'cancelled')
                    }
                );
                break;

            case 'assigned':
                actions.push(
                    {
                        label: 'Start Transit',
                        icon: <Car size={14} />,
                        variant: 'primary',
                        action: () => onStatusUpdate(booking.booking_id, 'in_transit')
                    },
                    {
                        label: 'Postpone',
                        icon: <Calendar size={14} />,
                        variant: 'warning',
                        action: () => onShowPostpone(booking)
                    },
                    {
                        label: 'Cancel',
                        icon: <XCircle size={14} />,
                        variant: 'outline-danger',
                        action: () => onStatusUpdate(booking.booking_id, 'cancelled')
                    }
                );
                break;

            case 'in_transit':
                actions.push(
                    {
                        label: 'Complete Trip',
                        icon: <CheckCircle size={14} />,
                        variant: 'success',
                        action: () => onStatusUpdate(booking.booking_id, 'completed')
                    },
                    {
                        label: 'Postpone',
                        icon: <Calendar size={14} />,
                        variant: 'warning',
                        action: () => onShowPostpone(booking)
                    }
                );
                break;

            case 'completed':
            case 'cancelled':
                actions.push({
                    label: 'Reopen',
                    icon: <RefreshCw size={14} />,
                    variant: 'outline-secondary',
                    action: () => onStatusUpdate(booking.booking_id, 'pending')
                });
                break;
        }

        return actions;
    };

    const actions = getAvailableActions();

    return (
        <>
            <div className="d-flex gap-1">
                <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => onViewDetails(booking)}
                    className="fw-semibold"
                    title="View Details"
                >
                    <Eye size={14} />
                </Button>

                {actions.length > 0 && (
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setShowActions(true)}
                        className="fw-semibold"
                        title="Manage Booking"
                    >
                        <MoreHorizontal size={14} />
                    </Button>
                )}
            </div>

            {/* Actions Modal */}
            <Modal show={showActions} onHide={() => setShowActions(false)} centered size="sm">
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                        <Zap size={16} />
                        Manage Booking
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-3">
                        <strong className="d-block">{utils.generateBookingId(booking.booking_id)}</strong>
                        <small className="text-muted">{booking.client_name}</small>
                        <div className="mt-2">
                            <StatusBadge status={booking.status} />
                        </div>
                    </div>

                    {/* Driver Assignment */}
                    {booking.status === 'pending' && !booking.driver_id && (
                        <div className="mb-3">
                            <label className="form-label fw-semibold d-flex align-items-center gap-2">
                                <User size={14} />
                                Assign Driver
                            </label>
                            <Form.Select
                                size="sm"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        onDriverAssign(booking.booking_id, e.target.value);
                                        setShowActions(false);
                                    }
                                }}
                                className="border-0 shadow-sm"
                            >
                                <option value="">Select driver...</option>
                                {availableDrivers.map(driver => (
                                    <option key={driver.driver_id} value={driver.driver_id}>
                                        {driver.driver_name} - {driver.license_number}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-grid gap-2">
                        {actions.filter(action => !action.label.includes('Driver')).map((action, index) => (
                            <Button
                                key={index}
                                variant={action.variant}
                                onClick={() => {
                                    action.action();
                                    setShowActions(false);
                                }}
                                className="d-flex align-items-center justify-content-center gap-2 fw-semibold"
                            >
                                {action.icon}
                                <span>{action.label}</span>
                            </Button>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

// Booking Row Component
const BookingRow = ({ booking, onStatusUpdate, onDriverAssign, onViewDetails, onShowPostpone, availableDrivers }) => {
    return (
        <tr className="border-bottom align-middle">
            <td>
                <div>
                    <strong className="text-primary d-block">
                        {utils.generateBookingId(booking.booking_id)}
                    </strong>
                    <small className="text-muted">
                        {utils.formatDate(booking.created_at)}
                    </small>
                </div>
            </td>
            <td>
                <div>
                    <strong className="d-block">{booking.client_name}</strong>
                    <small className="text-muted">{booking.client_phone}</small>
                </div>
            </td>
            <td>
                <strong className="text-dark d-block">{booking.destination}</strong>
            </td>
            <td>
                {booking.deceased_name ? (
                    <div>
                        <strong className="d-block">{booking.deceased_name}</strong>
                        <small className="text-muted">ID: {booking.deceased_id}</small>
                    </div>
                ) : (
                    <span className="text-muted fst-italic">No deceased</span>
                )}
            </td>
            <td>
                <div>
                    <strong className="text-dark d-block">{booking.number_plate || 'Not assigned'}</strong>
                    {booking.model && <small className="text-muted">{booking.model}</small>}
                </div>
            </td>
            <td>
                <div>
                    <strong className="text-dark d-block">
                        {utils.formatDate(booking.estimated_departure_time)}
                    </strong>
                </div>
            </td>
            <td>
                <StatusBadge status={booking.status} />
                {booking.driver_name && (
                    <small className="text-success d-block mt-1 d-flex align-items-center gap-1">
                        <User size={12} />
                        {booking.driver_name}
                    </small>
                )}
            </td>
            <td>
                <ActionButtons
                    booking={booking}
                    onStatusUpdate={onStatusUpdate}
                    onDriverAssign={onDriverAssign}
                    onViewDetails={onViewDetails}
                    onShowPostpone={onShowPostpone}
                    availableDrivers={availableDrivers}
                />
            </td>
        </tr>
    );
};

// Booking Details Modal
const BookingDetailsModal = ({ show, onHide, booking }) => {
    if (!booking) return null;

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Not scheduled';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const infoSections = [
        {
            title: 'Client Information',
            icon: <User size={16} />,
            fields: [
                { label: 'Name', value: booking.client_name },
                { label: 'Phone', value: booking.client_phone },
                { label: 'Email', value: booking.client_email || 'Not provided' }
            ]
        },
        {
            title: 'Service Details',
            icon: <Car size={16} />,
            fields: [
                { label: 'Destination', value: booking.destination },
                { label: 'Hearse', value: booking.number_plate || 'Not assigned' },
                { label: 'Departure Time', value: formatDateTime(booking.estimated_departure_time) }
            ]
        },
        {
            title: 'Deceased Information',
            icon: <Users size={16} />,
            fields: booking.deceased_name ? [
                { label: 'Name', value: booking.deceased_name },
                { label: 'Gender', value: booking.deceased_gender || 'Not specified' },
                { label: 'ID', value: booking.deceased_id }
            ] : [{ label: 'Status', value: 'No deceased information', type: 'warning' }]
        },
        {
            title: 'Driver Information',
            icon: <User size={16} />,
            fields: booking.driver_name ? [
                { label: 'Driver', value: booking.driver_name },
                { label: 'Phone', value: booking.driver_phone },
                { label: 'License', value: booking.license_number }
            ] : [{ label: 'Status', value: 'No driver assigned', type: 'warning' }]
        }
    ];

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="bg-dark text-white">
                <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <Eye size={20} />
                    Booking Details - {utils.generateBookingId(booking.booking_id)}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <div className="text-center mb-4">
                    <StatusBadge status={booking.status} />
                    <div className="mt-2">
                        <small className="text-muted">
                            Created: {utils.formatDate(booking.created_at)}
                        </small>
                    </div>
                </div>

                <Row className="g-3">
                    {infoSections.map((section, index) => (
                        <Col md={6} key={index}>
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Header className="bg-light fw-bold d-flex align-items-center gap-2">
                                    {section.icon}
                                    <span>{section.title}</span>
                                </Card.Header>
                                <Card.Body>
                                    {section.fields.map((field, fieldIndex) => (
                                        <div key={fieldIndex} className="mb-2">
                                            <strong>{field.label}:</strong>{' '}
                                            <span className={field.type === 'warning' ? 'text-warning fw-semibold' : ''}>
                                                {field.value}
                                            </span>
                                        </div>
                                    ))}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {booking.special_remarks && (
                    <Card className="mt-3 border-0 shadow-sm">
                        <Card.Header className="bg-light fw-bold d-flex align-items-center gap-2">
                            <AlertCircle size={16} />
                            Special Remarks
                        </Card.Header>
                        <Card.Body>
                            <p className="mb-0 fst-italic text-muted">{booking.special_remarks}</p>
                        </Card.Body>
                    </Card>
                )}
            </Modal.Body>
        </Modal>
    );
};

// Postpone Booking Modal
const PostponeBookingModal = ({ show, onHide, booking, onPostpone }) => {
    const [postponeData, setPostponeData] = useState({
        new_date: '',
        new_time: '',
        reason: '',
        updated_by: utils.getUpdatedBy(),
        branch_id: utils.getBranchId()
    });

    useEffect(() => {
        if (booking) {
            const currentDate = new Date(booking.estimated_departure_time);
            setPostponeData(prev => ({
                ...prev,
                new_date: currentDate.toISOString().split('T')[0],
                new_time: currentDate.toTimeString().slice(0, 5),
                updated_by: utils.getUpdatedBy(),
                branch_id: utils.getBranchId()
            }));
        }
    }, [booking]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const postponePayload = {
                new_departure_time: `${postponeData.new_date}T${postponeData.new_time}`,
                reason: postponeData.reason
            };

            await onPostpone(booking.booking_id, postponePayload);
            onHide();
        } catch (error) {
            console.error('Error postponing booking:', error);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="bg-warning text-dark">
                <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <Calendar size={20} />
                    Postpone Booking
                </Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="alert alert-info mb-3">
                        <strong>Current Booking:</strong> {utils.generateBookingId(booking?.booking_id)}<br />
                        <strong>Client:</strong> {booking?.client_name}
                    </div>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">New Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={postponeData.new_date}
                                    onChange={(e) => setPostponeData(prev => ({ ...prev, new_date: e.target.value }))}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">New Time *</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={postponeData.new_time}
                                    onChange={(e) => setPostponeData(prev => ({ ...prev, new_time: e.target.value }))}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Reason for Postponement</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={postponeData.reason}
                            onChange={(e) => setPostponeData(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Enter detailed reason for postponement..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={onHide}>
                        Cancel
                    </Button>
                    <Button variant="warning" type="submit" className="text-white d-flex align-items-center gap-2">
                        <Calendar size={16} />
                        Confirm Postponement
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

// Main Component
const BookingSystem = () => {
    const [bookings, setBookings] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [hearses, setHearses] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showPostpone, setShowPostpone] = useState(false);
    const [showRegisterHearse, setShowRegisterHearse] = useState(false);
    const [showHearsesList, setShowHearsesList] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [showCrossBranch, setShowCrossBranch] = useState(false);
    const [crossBranchData, setCrossBranchData] = useState(null);
    const [loadingCrossBranch, setLoadingCrossBranch] = useState(false);
    const [registerForm, setRegisterForm] = useState({
        number_plate: '',
        model: '',
        branch_id: utils.getBranchId()
    });

    const { socket } = useSocket();
    const playAudioNotification = useAudioNotification();

    // Load initial data
    useEffect(() => {
        loadData();
    }, []);

    // Socket.IO real-time listeners
    useEffect(() => {
        if (!socket) return;

        console.log('Setting up socket listeners...');

        // Listen for new bookings
        socket.on('new_booking', (data) => {
            console.log('New booking received:', data);
            setNotification(data);
            setShowToast(true);
            playAudioNotification();

            setBookings(prev => [data.booking, ...prev]);
        });

        // Listen for status updates
        socket.on('booking_status_updated', (data) => {
            console.log('Status update received:', data);
            setNotification(data);
            setShowToast(true);

            setBookings(prev => prev.map(booking =>
                booking.booking_id === data.booking_id
                    ? { ...booking, status: data.status, ...data.booking }
                    : booking
            ));
        });

        return () => {
            socket.off('new_booking');
            socket.off('booking_status_updated');
        };
    }, [socket, playAudioNotification]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');
            const [bookingsData, driversData] = await Promise.all([
                bookingService.getBookings(),
                driverService.getDrivers()
            ]);
            setBookings(bookingsData);
            setDrivers(driversData);
        } catch (err) {
            setError('Failed to load data. Please try again.');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            setError('');
            const result = await bookingService.updateBookingStatus(bookingId, newStatus);
            setSuccess(`Booking status updated to ${newStatus.replace('_', ' ')} successfully!`);
            setTimeout(() => setSuccess(''), 4000);

            // Socket will handle real-time update from backend
        } catch (err) {
            setError('Failed to update status. Please try again.');
            console.error('Error updating status:', err);
        }
    };

    const handleDriverAssign = async (bookingId, driverId) => {
        try {
            setError('');
            const booking = bookings.find(b => b.booking_id === bookingId);
            if (!booking) throw new Error('Booking not found');

            await bookingService.assignDriver(bookingId, driverId, booking.hearse_id);
            setSuccess(`Driver assigned successfully!`);
            setTimeout(() => setSuccess(''), 4000);

            // Reload to get updated data
            loadData();
        } catch (err) {
            setError('Failed to assign driver. Please try again.');
            console.error('Error assigning driver:', err);
        }
    };

    const handlePostponeBooking = async (bookingId, postponeData) => {
        try {
            setError('');
            await bookingService.postponeBooking(bookingId, postponeData);
            setSuccess('Booking postponed successfully!');
            setTimeout(() => setSuccess(''), 4000);
            loadData();
        } catch (err) {
            setError('Failed to postpone booking. Please try again.');
            console.error('Error postponing booking:', err);
            throw err;
        }
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setShowDetails(true);
    };

    const handleShowPostpone = (booking) => {
        setSelectedBooking(booking);
        setShowPostpone(true);
    };

    const handleShowCrossBranch = async () => {
        try {
            setLoadingCrossBranch(true);
            setError('');
            const branchId = utils.getBranchId();
            const data = await bookingService.getCrossBranchAvailability(branchId);
            setCrossBranchData(data);
            setShowCrossBranch(true);
        } catch (err) {
            setError('Failed to load cross-branch availability. Please try again.');
            console.error('Error loading cross-branch availability:', err);
        } finally {
            setLoadingCrossBranch(false);
        }
    };

    const handleBookFromBranch = async (hearseId) => {
        // This will open the booking form with pre-selected hearse from another branch
        try {
            const hearse = crossBranchData.hearses.find(h => h.id === hearseId);
            if (!hearse) return;

            // Navigate to booking form or open booking modal with pre-selected hearse
            // For now, we'll show a success message
            setSuccess(`Hearse ${hearse.number_plate} from ${hearse.branch_name} selected. Create a booking to use it.`);
            setTimeout(() => setSuccess(''), 4000);
            setShowCrossBranch(false);
        } catch (err) {
            setError('Failed to select hearse. Please try again.');
            console.error('Error selecting hearse:', err);
        }
    };

    const handleRegisterHearse = async (e) => {
        e.preventDefault();
        try {
            setError('');
            const result = await bookingService.registerHearse(registerForm);
            setSuccess(`Hearse ${registerForm.number_plate} registered successfully!`);
            setTimeout(() => setSuccess(''), 4000);
            setShowRegisterHearse(false);
            setRegisterForm({
                number_plate: '',
                model: '',
                min_charge_ksh: '',
                max_charge_ksh: '',
                branch_id: utils.getBranchId(),
                image: null
            });
            // Reload hearses list
            loadHearses();
        } catch (err) {
            setError('Failed to register hearse. Please try again.');
            console.error('Error registering hearse:', err);
        }
    };

    const loadHearses = async () => {
        try {
            const hearsesData = await bookingService.getAllHearses();
            setHearses(hearsesData);
        } catch (err) {
            console.error('Error loading hearses:', err);
        }
    };

    const handleShowHearsesList = async () => {
        await loadHearses();
        setShowHearsesList(true);
    };

    const getAvailableDrivers = () => {
        return drivers.filter(driver =>
            driver.status === 'available' || driver.availability_status === 'available'
        );
    };

    const filteredBookings = bookings.filter(booking =>
        filter === 'all' || booking.status === filter
    );

    const availableDrivers = getAvailableDrivers();

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-50">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <h4 className="text-primary fw-bold">Loading Bookings...</h4>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4 bg-light min-vh-100">
            <ToastContainer position="top-end" className="p-3">
                <NotificationToast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    notification={notification}
                    onPlayAudio={playAudioNotification}
                />
            </ToastContainer>

            <Row className="mb-4">
                <Col>
                    <Card className="border-0 shadow">
                        <Card.Body className="bg-dark text-white rounded">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h2 className="mb-1 fw-bold d-flex align-items-center gap-2">
                                        <Car size={24} />
                                        Booking Management
                                    </h2>
                                    <p className="mb-0 opacity-8">
                                        Real-time dashboard {socket?.connected && <Badge bg="success" className="ms-2 d-flex align-items-center gap-1">Live</Badge>}
                                    </p>
                                </div>
                                <Button variant="outline-light" onClick={loadData} className="fw-bold d-flex align-items-center gap-2">
                                    <RefreshCw size={16} />
                                    Refresh
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            <BookingStats bookings={bookings} />
            <BookingFilter currentFilter={filter} onFilterChange={setFilter} />

            {/* Management Buttons */}
            <Row className="mb-4 g-3">
                <Col md={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                        <Car size={18} />
                                        Register Hearse
                                    </h6>
                                    <small className="text-muted">
                                        Add new hearse to fleet
                                    </small>
                                </div>
                                <Button
                                    variant="success"
                                    onClick={() => setShowRegisterHearse(true)}
                                    className="d-flex align-items-center gap-2"
                                >
                                    <Car size={16} />
                                    Register
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                        <Eye size={18} />
                                        View Hearses
                                    </h6>
                                    <small className="text-muted">
                                        Manage hearse fleet
                                    </small>
                                </div>
                                <Button
                                    variant="info"
                                    onClick={handleShowHearsesList}
                                    className="d-flex align-items-center gap-2"
                                >
                                    <Eye size={16} />
                                    View All
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                        <Truck size={18} />
                                        Cross-Branch Availability
                                    </h6>
                                    <small className="text-muted">
                                        View and book available hearses from other branches
                                    </small>
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={handleShowCrossBranch}
                                    className="d-flex align-items-center gap-2"
                                >
                                    <Truck size={16} />
                                    View Available
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow border-0">
                <Card.Header className="bg-white border-bottom-0 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-dark fw-bold d-flex align-items-center gap-2">
                            <Eye size={20} />
                            Bookings <Badge bg="primary" className="ms-2">{filteredBookings.length}</Badge>
                        </h5>
                        <small className="text-muted">
                            Updated: {new Date().toLocaleTimeString()}
                        </small>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="fw-bold py-3">Booking ID</th>
                                    <th className="fw-bold py-3">Client</th>
                                    <th className="fw-bold py-3">Destination</th>
                                    <th className="fw-bold py-3">Deceased</th>
                                    <th className="fw-bold py-3">Hearse</th>
                                    <th className="fw-bold py-3">Departure</th>
                                    <th className="fw-bold py-3">Status</th>
                                    <th className="fw-bold py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5">
                                            <div className="py-4">
                                                <div className="text-muted mb-3">
                                                    <Eye size={48} />
                                                </div>
                                                <h4 className="mt-3 text-muted">No bookings found</h4>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <BookingRow
                                            key={booking.booking_id}
                                            booking={booking}
                                            onStatusUpdate={handleStatusUpdate}
                                            onDriverAssign={handleDriverAssign}
                                            onViewDetails={handleViewDetails}
                                            onShowPostpone={handleShowPostpone}
                                            availableDrivers={availableDrivers}
                                        />
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            <BookingDetailsModal
                show={showDetails}
                onHide={() => setShowDetails(false)}
                booking={selectedBooking}
            />

            <PostponeBookingModal
                show={showPostpone}
                onHide={() => setShowPostpone(false)}
                booking={selectedBooking}
                onPostpone={handlePostponeBooking}
            />

            {/* Register Hearse Modal */}
            <Modal show={showRegisterHearse} onHide={() => setShowRegisterHearse(false)} centered>
                <Modal.Header closeButton className="bg-success text-white">
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                        <Car size={20} />
                        Register New Hearse
                    </Modal.Title>
                </Modal.Header>
                <form onSubmit={handleRegisterHearse}>
                    <Modal.Body className="p-4">
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Number Plate *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={registerForm.number_plate}
                                        onChange={(e) => setRegisterForm(prev => ({ ...prev, number_plate: e.target.value }))}
                                        placeholder="e.g., KCA 1234"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Model</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={registerForm.model}
                                        onChange={(e) => setRegisterForm(prev => ({ ...prev, model: e.target.value }))}
                                        placeholder="e.g., Toyota Hiace"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Min Charge (KSH) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={registerForm.min_charge_ksh}
                                        onChange={(e) => setRegisterForm(prev => ({ ...prev, min_charge_ksh: e.target.value }))}
                                        placeholder="5000"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Max Charge (KSH) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={registerForm.max_charge_ksh}
                                        onChange={(e) => setRegisterForm(prev => ({ ...prev, max_charge_ksh: e.target.value }))}
                                        placeholder="10000"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Branch *</Form.Label>
                                    <Form.Select
                                        value={registerForm.branch_id}
                                        onChange={(e) => setRegisterForm(prev => ({ ...prev, branch_id: e.target.value }))}
                                        required
                                    >
                                        <option value="1">Branch 1</option>
                                        <option value="2">Branch 2</option>
                                        <option value="3">Branch 3</option>
                                        <option value="4">Branch 4</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Hearse Image</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setRegisterForm(prev => ({ ...prev, image: file }));
                                            }
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={() => setShowRegisterHearse(false)}>
                            Cancel
                        </Button>
                        <Button variant="success" type="submit" className="text-white d-flex align-items-center gap-2">
                            <Car size={16} />
                            Register Hearse
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* Hearses List Modal */}
            <Modal show={showHearsesList} onHide={() => setShowHearsesList(false)} size="xl" centered>
                <Modal.Header closeButton className="bg-info text-white">
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                        <Eye size={20} />
                        Hearse Fleet Management
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {hearses.length === 0 ? (
                        <div className="text-center py-5">
                            <Car size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">No hearses registered yet</h5>
                            <p className="text-muted">Click "Register" to add your first hearse</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover>
                                <thead className="bg-light">
                                    <tr>
                                        <th className="fw-bold">Number Plate</th>
                                        <th className="fw-bold">Model</th>
                                        <th className="fw-bold">Branch</th>
                                        <th className="fw-bold">Status</th>
                                        <th className="fw-bold">Min Charge</th>
                                        <th className="fw-bold">Max Charge</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hearses.map(hearse => (
                                        <tr key={hearse.id}>
                                            <td>
                                                <strong className="text-primary">{hearse.number_plate}</strong>
                                            </td>
                                            <td>{hearse.model || 'N/A'}</td>
                                            <td>Branch {hearse.branch_id}</td>
                                            <td>
                                                <Badge bg={hearse.status === 'available' ? 'success' : 'warning'}>
                                                    {hearse.status}
                                                </Badge>
                                            </td>
                                            <td>KSH {parseInt(hearse.min_charge_ksh).toLocaleString()}</td>
                                            <td>KSH {parseInt(hearse.max_charge_ksh).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowHearsesList(false)}>
                        Close
                    </Button>
                    <Button variant="success" onClick={() => { setShowHearsesList(false); setShowRegisterHearse(true); }}>
                        <Car size={16} className="me-2" />
                        Register New Hearse
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Cross-Branch Availability Modal */}
            <Modal show={showCrossBranch} onHide={() => setShowCrossBranch(false)} size="xl" centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                        <Truck size={20} />
                        Cross-Branch Hearse Availability
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {loadingCrossBranch ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3">Loading available hearses...</p>
                        </div>
                    ) : crossBranchData ? (
                        <>
                            <div className="alert alert-info mb-4">
                                <strong>Real-time Availability:</strong> Showing {crossBranchData.total_available} available hearses across {crossBranchData.total_branches} branches
                            </div>

                            {crossBranchData.branches && crossBranchData.branches.map(branch => (
                                <Card key={branch.branch_id} className="mb-3 border-0 shadow-sm">
                                    <Card.Header className="bg-light fw-bold d-flex align-items-center gap-2">
                                        <MapPin size={16} />
                                        {branch.branch_name}
                                        <Badge bg="primary" className="ms-auto">
                                            {branch.hearses.length} Available
                                        </Badge>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="row g-3">
                                            {branch.hearses.map(hearse => (
                                                <div key={hearse.id} className="col-md-6 col-lg-4">
                                                    <Card className="h-100 border-0 shadow-sm">
                                                        <Card.Body>
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <div>
                                                                    <h6 className="fw-bold mb-1">{hearse.number_plate}</h6>
                                                                    <small className="text-muted">{hearse.model || 'N/A'}</small>
                                                                </div>
                                                                <Badge bg="success">Available</Badge>
                                                            </div>
                                                            <div className="mb-2">
                                                                <small className="text-muted">
                                                                    <Phone size={12} className="me-1" />
                                                                    {branch.branch_phone}
                                                                </small>
                                                            </div>
                                                            <div className="mb-3">
                                                                <small className="text-muted">
                                                                    <MapPin size={12} className="me-1" />
                                                                    {branch.branch_location}
                                                                </small>
                                                            </div>
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                className="w-100 d-flex align-items-center justify-content-center gap-2"
                                                                onClick={() => handleBookFromBranch(hearse.id)}
                                                            >
                                                                <PhoneCall size={14} />
                                                                Book This Hearse
                                                            </Button>
                                                        </Card.Body>
                                                    </Card>
                                                </div>
                                            ))}
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-5">
                            <Truck size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">No cross-branch hearses available</h5>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default BookingSystem;