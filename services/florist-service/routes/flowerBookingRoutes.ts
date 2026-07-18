/**
 * Flower Booking Routes
 * Defines all REST endpoints for the florist service
 */

import { Router } from 'express';
import {
    getBookings,
    getBookingById,
    createBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
    getStats,
    getMonthlyTrend,
    getCustomers,
    getCustomerById
} from '../controllers/flowerBooking';

export const flowerBookingRouter = Router();

// ============================================
// STATS & DASHBOARD
// ============================================
flowerBookingRouter.get('/stats', getStats);
flowerBookingRouter.get('/stats/monthly-trend', getMonthlyTrend);

// ============================================
// CUSTOMERS
// ============================================
flowerBookingRouter.get('/customers', getCustomers);
flowerBookingRouter.get('/customers/:id', getCustomerById);

// ============================================
// BOOKINGS
// ============================================
flowerBookingRouter.get('/bookings', getBookings);
flowerBookingRouter.get('/bookings/:id', getBookingById);
flowerBookingRouter.post('/bookings', createBooking);
flowerBookingRouter.put('/bookings/:id', updateBooking);
flowerBookingRouter.patch('/bookings/:id/status', updateBookingStatus);
flowerBookingRouter.delete('/bookings/:id', deleteBooking);