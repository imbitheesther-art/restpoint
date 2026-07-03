import express from "express";
import { getAllBookings, getSingleBooking, createBooking, getBookingsWithToolName, deleteBooking, getUserBookings, getToolBookingsByDate, getAllBookingsByToolId } from '../controllers/bookingController.js';

const bookingRouter = express()

bookingRouter.route('/')
    .get(getAllBookings)
    .post(createBooking)

bookingRouter.route('/bookingwithtoolname')
    .get(getBookingsWithToolName)

bookingRouter.route('/all/:toolId')
    .get(getAllBookingsByToolId)

bookingRouter.route('/:id')
    .get(getSingleBooking)
    .delete(deleteBooking)

bookingRouter.get('/user/:userId', getUserBookings)

bookingRouter.get('/:toolid/:date', getToolBookingsByDate)


export { bookingRouter }