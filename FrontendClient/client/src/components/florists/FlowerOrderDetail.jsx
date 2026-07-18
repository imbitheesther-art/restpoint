import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './FlowerOrderDetail.css';

const FlowerOrderDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load sample booking data
        const sampleBooking = {
            id: id || 'new',
            booking_id: id === 'new' ? '' : 'FLW24001',
            flower_type: 'Rose Bouquet',
            event_type: 'Wedding',
            customer: 'John Doe',
            customer_phone: '+254 712 345 678',
            customer_email: 'john@example.com',
            delivery_date: '2024-12-25',
            delivery_time: '14:00',
            delivery_address: '123 Main Street, Nairobi',
            special_instructions: 'Please deliver to the main entrance',
            status: 'confirmed',
            total_amount: 150,
            created_at: '2024-12-20'
        };

        setBooking(sampleBooking);
        setLoading(false);
    }, [id]);

    const handleSave = () => {
        alert('Booking saved successfully!');
        navigate('/tenant/flowers');
    };

    const handleBack = () => {
        navigate('/tenant/flowers');
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!booking) {
        return <div className="error">Booking not found</div>;
    }

    return (
        <div className="flower-order-detail">
            <div className="order-header">
                <div className="page-navigation">
                    <h2><span>Flowers</span> / {id === 'new' ? 'New Booking' : 'Booking Detail'}</h2>
                </div>
                <div className="order-actions">
                    <button id="save-button" className="production-sheet-button" onClick={handleSave}>
                        {id === 'new' ? 'Create Booking' : 'Save Changes'}
                    </button>
                    <button id="go-back-button" className="production-sheet-button" onClick={handleBack}>
                        Go Back
                    </button>
                </div>
            </div>

            <div className="order-detail">
                <div className="order-information">
                    <div className="input-box">
                        <label htmlFor="bookingId">Booking ID</label>
                        <input
                            type="text"
                            id="bookingId"
                            value={booking.booking_id}
                            onChange={(e) => setBooking({ ...booking, booking_id: e.target.value })}
                            disabled={id !== 'new'}
                        />
                    </div>

                    <div className="input-box">
                        <label htmlFor="flowerType">Flower Type *</label>
                        <input
                            type="text"
                            id="flowerType"
                            value={booking.flower_type}
                            onChange={(e) => setBooking({ ...booking, flower_type: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-box">
                        <label htmlFor="eventType">Event Type *</label>
                        <input
                            type="text"
                            id="eventType"
                            value={booking.event_type}
                            onChange={(e) => setBooking({ ...booking, event_type: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-box">
                        <label htmlFor="customer">Customer Name *</label>
                        <input
                            type="text"
                            id="customer"
                            value={booking.customer}
                            onChange={(e) => setBooking({ ...booking, customer: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-box">
                        <label htmlFor="customerPhone">Phone Number *</label>
                        <input
                            type="tel"
                            id="customerPhone"
                            value={booking.customer_phone}
                            onChange={(e) => setBooking({ ...booking, customer_phone: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-box">
                        <label htmlFor="customerEmail">Email *</label>
                        <input
                            type="email"
                            id="customerEmail"
                            value={booking.customer_email}
                            onChange={(e) => setBooking({ ...booking, customer_email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-box">
                        <label htmlFor="deliveryDate">Delivery Date *</label>
                        <input
                            type="date"
                            id="deliveryDate"
                            value={booking.delivery_date}
                            onChange={(e) => setBooking({ ...booking, delivery_date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-box">
                        <label htmlFor="deliveryTime">Delivery Time *</label>
                        <input
                            type="time"
                            id="deliveryTime"
                            value={booking.delivery_time}
                            onChange={(e) => setBooking({ ...booking, delivery_time: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-box">
                        <label htmlFor="deliveryAddress">Delivery Address *</label>
                        <textarea
                            id="deliveryAddress"
                            value={booking.delivery_address}
                            onChange={(e) => setBooking({ ...booking, delivery_address: e.target.value })}
                            rows="3"
                            required
                        />
                    </div>

                    <div className="input-box">
                        <label htmlFor="totalAmount">Total Amount (KES) *</label>
                        <input
                            type="number"
                            id="totalAmount"
                            value={booking.total_amount}
                            onChange={(e) => setBooking({ ...booking, total_amount: parseFloat(e.target.value) })}
                            required
                        />
                    </div>
                </div>

                <div className="order-notes">
                    <h3>Special Instructions</h3>
                    <textarea
                        id="specialInstructions"
                        value={booking.special_instructions}
                        onChange={(e) => setBooking({ ...booking, special_instructions: e.target.value })}
                        rows="5"
                        placeholder="Any special requests or instructions..."
                    />
                </div>

                <div className="order-status">
                    <h3>Booking Status</h3>
                    <div className="status-info">
                        <p><strong>Status:</strong> <span className={`status-badge ${booking.status}`}>{booking.status}</span></p>
                        <p><strong>Created:</strong> {new Date(booking.created_at).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlowerOrderDetail;