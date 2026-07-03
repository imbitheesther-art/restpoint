import { Request, Response } from "express"
import { supabase } from "../server.js"
import { log } from "console"


/* 
    @route  GET /api/bookings
    @desc   get all bookings
*/
const getAllBookings = async (req: Request, res: Response) => {

    const { data: data, error } = await supabase.from('bookings').select('*')

    if (error)
        return res.json(error)

    res.json(data)
}


/* 
    @route  GET /api/bookings/:id
    @desc   get a specific booking
*/
const getSingleBooking = async (req: Request, res: Response) => {
    const id = req.params.id

    const { data: data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_id', id)

    if (error) {
        res.json(error)

        return
    }

    res.json(data)
}

/* 
    @route  GET /api/bookings/user/:userid
    @desc   get all bookings from a user
*/
const getUserBookings = async (req: Request, res: Response) => {
    const { data: data, error } = await supabase.from('bookings').select('*').eq('user_id', req.params.userId)

    if (error)
        return res.json(error)

    res.json(data)
}

/* 
    @route  GET /api/bookings/getbookingwithtoolname
    @desc   Get all bookings for a specific tool
*/
const getBookingsWithToolName = async (req: Request, res: Response) => {

    try {

      // First, retrieve the booking data
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
  
      if (bookingsError) {
        console.error(bookingsError)
        res.status(500).json({ error: 'An error occurred while fetching bookings' })
        return
      }
  
      // Then, retrieve the tool data for each booking
      const toolIds = bookingsData.map((booking) => booking.tool_id)
      const { data: toolsData, error: toolsError } = await supabase
        .from('tools')
        .select('*')
        .in('id', toolIds)
  
      if (toolsError) {
        console.error(toolsError)
        res.status(500).json({ error: 'An error occurred while fetching tools' })
        return
      }
  
      // Combine the booking and tool data into a single response
      const bookingsWithToolNames = bookingsData.map((booking) => {
        const toolName = toolsData.find((tool) => tool.id === booking.tool_id)?.name || 'Unknown'
        return { ...booking, toolName }
      })

        res.json(bookingsWithToolNames)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'An error occurred while fetching bookings with tool names' })
    }
}



/* 
    @route  GET /api/bookings/:id/:date
    @desv   get all bookings from a single date
*/
const getToolBookingsByDate = async (req: Request, res: Response) => {
    const { data: data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('tool_id', req.params.id)
        .eq('booking_date', req.params.date)

    if (error)
        return res.json(error)

    res.json(data)
}

/* 
    @route  POST /api/bookings
    @desc   Create a new booking
*/
const createBooking = async (req: Request, res: Response) => {

    const bookingDataFromRequest = {
        user_id: req.body.user_id,
        tool_id: req.body.tool_id,
        booking_date: req.body.booking_date,
        booking_start: req.body.booking_start,
        booking_end: req.body.booking_end
    }

    // Check if there are any overlapping bookings
    const { data: overlappingBookings, error: overlapError } = await supabase
        .from('bookings')
        .select()
        .eq('tool_id', bookingDataFromRequest.tool_id)
        .eq('booking_date', bookingDataFromRequest.booking_date)
        .lte('booking_start', bookingDataFromRequest.booking_end)
        .gte('booking_end', bookingDataFromRequest.booking_start)

    if (overlapError)
        return res.json(overlapError)

    if (overlappingBookings.length > 0)
        return res.status(400).json({ 
            error: 'There is already a booking for this tool on the requested date and time.',
            overlappingBookings: overlappingBookings
        })

    // Make requests to insert data into the bookings and booking_log tables
    const { data: bookings_data, error: bookings_error } = await supabase
        .from('bookings')
        .insert([bookingDataFromRequest])
        .select()

    const { data: log_data, error: log_error } = await supabase
        .from('booking_log')
        .insert([bookingDataFromRequest])
        .select()


    if (bookings_error || log_error)
        return bookings_error ? res.json(bookings_error) : res.json(log_error)


    res.json(bookings_data)
}

/* 
    @route  DELETE /api/bookings/:id
    @desc   delete a specific booking
*/
const deleteBooking = async (req: Request, res: Response) => {
    const id = req.params.id

    const { data, error } = await supabase
        .from('bookings')
        .delete()
        .eq('booking_id', id)
        .select()

    if (error) {
        res.json(error)
        return
    }

    res.json(data)
}

/* 
    @route  GET /bookings/all/:toolid
    @desc   Route for mapping out historic booking data in a chart
*/
const getAllBookingsByToolId = async (req: Request, res: Response) => {
    const toolId = req.params.toolId

    const { data: data, error } = await supabase
        .from('booking_log')
        .select('*')
        .eq('tool_id', toolId)

    if (error)
        return res.json(error)

    res.json(data)
}

export {
    getAllBookings,
    getSingleBooking,
    getUserBookings,
    getBookingsWithToolName,
    createBooking,
    deleteBooking,
    getToolBookingsByDate,
    getAllBookingsByToolId
}