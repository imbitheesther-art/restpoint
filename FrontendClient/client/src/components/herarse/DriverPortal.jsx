import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { useSocket } from '../../context/socketContext';
import { RefreshCw, User, Car, CheckCircle, XCircle, Truck, Phone, MapPin } from 'lucide-react';
import env from '../../config/env';

const API_BASE_URL = `${env.HEARSE_API_URL}`;

const getTenantSlug = () => {
    return localStorage.getItem('tenantSlug') || localStorage.getItem('tenant_slug') || 'default';
};

const bookingService = {
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

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
const genId = (id) => `BK-${String(id).padStart(4, '0')}`;

const StatusBadge = ({ status }) => {
    const cfg = {
        booked: { label: 'BOOKED', color: '#0d6efd' },
        in_transit: { label: 'IN TRANSIT', color: '#0dcaf0' },
        completed: { label: 'COMPLETED', color: '#198754' },
        cancelled: { label: 'CANCELLED', color: '#dc3545' },
        postponed: { label: 'POSTPONED', color: '#ffc107' }
    };
    const c = cfg[status] || { label: status?.toUpperCase() || 'UNKNOWN', color: '#6c757d' };
    return (
        <span style={{
            background: c.color, color: '#fff', padding: '2px 8px', borderRadius: '3px',
            fontSize: '0.7rem', fontWeight: 700, display: 'inline-block'
        }}>{c.label}</span>
    );
};

const DriverPortal = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { socket } = useSocket();

    useEffect(() => {
        loadAllBookings();
    }, []);

    useEffect(() => {
        if (!socket) return;
        const handleStatusUpdate = (d) => {
            setBookings(prev => prev.map(b => b.booking_id === d.booking_id ? { ...b, status: d.status, ...d.booking } : b));
        };
        const handleNewBooking = (d) => {
            setBookings(prev => [d.booking, ...prev]);
        };
        socket.on('booking_status_updated', handleStatusUpdate);
        socket.on('new_booking', handleNewBooking);
        return () => {
            socket.off('booking_status_updated', handleStatusUpdate);
            socket.off('new_booking', handleNewBooking);
        };
    }, [socket]);

    const loadAllBookings = async () => {
        setLoading(true);
        setError('');
        try {
            // Add timestamp to prevent caching without triggering CORS preflight
            const url = `${API_BASE_URL}/hearse-bookings?t=${Date.now()}`;
            console.log('Fetching bookings from:', url);
            const r = await fetch(url, {
                headers: {
                    'x-tenant-slug': getTenantSlug()
                }
            });
            console.log('Driver portal bookings response status:', r.status, r.statusText);
            const text = await r.text();
            console.log('Raw response:', text);
            try {
                const data = JSON.parse(text);
                console.log('Parsed data:', data);
                if (data.status === 'success' || data.bookings) {
                    setBookings(data.bookings || []);
                    console.log('Bookings set:', data.bookings?.length || 0);
                } else {
                    setError('Failed to load bookings: ' + (data.message || 'Unknown error'));
                }
            } catch (parseError) {
                console.error('Failed to parse JSON:', parseError);
                setError('Invalid response from server');
            }
        } catch (e) {
            console.error('Failed to load bookings:', e);
            setError('Failed to load bookings: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatus = async (bookingId, status) => {
        try {
            await bookingService.updateBookingStatus(bookingId, status);
            setSuccess(`Status updated to ${status}!`);
            setTimeout(() => setSuccess(''), 3000);
            // Reload to get fresh data
            loadAllBookings();
        } catch (e) {
            setError('Failed to update status.');
        }
    };

    const activeBookings = bookings.filter(b => !['completed', 'cancelled', 'postponed'].includes(b.status));

    const BookingCard = ({ b }) => (
        <div style={{
            background: '#fff', borderRadius: '8px', padding: '12px', marginBottom: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                    <strong style={{ color: '#0d6efd', fontSize: '0.85rem' }}>{genId(b.booking_id)}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{fmtDate(b.created_at)}</div>
                </div>
                <StatusBadge status={b.status} />
            </div>
            <div style={{ marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.client_name}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} /> {b.client_phone}
                </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> {b.destination}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Car size={12} /> {b.plate_number || b.number_plate || 'N/A'} - {b.hearse_name || ''}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {b.status === 'booked' && (
                    <button onClick={() => handleStatus(b.booking_id, 'in_transit')}
                        style={{
                            flex: 1, padding: '10px', border: 'none', borderRadius: '6px',
                            background: '#0d6efd', color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}>
                        <CheckCircle size={16} /> Accept
                    </button>
                )}
                {b.status === 'in_transit' && (
                    <button onClick={() => handleStatus(b.booking_id, 'completed')}
                        style={{
                            flex: 1, padding: '10px', border: 'none', borderRadius: '6px',
                            background: '#198754', color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}>
                        <CheckCircle size={16} /> Completed
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 16px', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}
            {success && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '10px 16px', fontSize: '0.85rem', textAlign: 'center' }}>{success}</div>}

            {/* Header */}
            <div style={{ background: '#1f2937', color: '#fff', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                        <Car size={20} style={{ marginRight: '8px' }} />Driver Portal
                    </h1>
                    <button onClick={loadAllBookings}
                        style={{
                            background: 'transparent', border: '1px solid #fff', color: '#fff',
                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem',
                            display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            <div style={{ padding: '12px' }}>
                {/* Stats */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ flex: 1, background: '#0d6efd', color: '#fff', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{activeBookings.length}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>Active</div>
                    </div>
                    <div style={{ flex: 1, background: '#0dcaf0', color: '#fff', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{bookings.filter(b => b.status === 'in_transit').length}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>In Transit</div>
                    </div>
                    <div style={{ flex: 1, background: '#198754', color: '#fff', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{bookings.filter(b => b.status === 'completed').length}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>Completed</div>
                    </div>
                </div>

                {/* Active Trips */}
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#374151' }}>Active Trips</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '30px' }}><Spinner animation="border" /></div>
                ) : activeBookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280', background: '#fff', borderRadius: '8px' }}>
                        <Car size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                        <div>No active trips</div>
                    </div>
                ) : (
                    activeBookings.map(b => <BookingCard key={b.booking_id} b={b} />)
                )}
            </div>
        </div>
    );
};

export default DriverPortal;