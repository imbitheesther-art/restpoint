const { safeQuery } = require('../../../configurations/sqlConfig/db');
const { query, execute } = require('../../../shared/dbConfig');
const { getKenyaTimeISO } = require('../../../packages/shared-utils/dist/timestamps');
const { EventEmitter } = require('events');
const asyncHandler = require('express-async-handler');


/**
 * Create a new hearse booking
 */

const makeHearseBooking = asyncHandler(async (req, res) => {
    try {
        const io = req.app.get('io');
        const {
            hearse_id,
            deceased_id,
            client_name,
            client_phone,
            client_email,
            destination,
            estimated_departure_time,
            special_remarks,
            from_timestamp,
            to_timestamp,
            from_location,
            to_location
        } = req.body;

        // ✅ Basic validation - only destination is required
        console.log('📝 Booking request body:', { hearse_id, client_name, destination, from_timestamp, to_timestamp, from_location, to_location });

        if (!destination) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required field: destination.'
            });
        }

        // ✅ Check if hearse is already booked (double-booking prevention)
        if (hearse_id) {
            // Use transaction to prevent race conditions
            const connection = await safeQuery('SELECT status FROM hearses WHERE id = ? FOR UPDATE', [hearse_id], req.tenantSlug);
            const [hearse] = connection;

            if (!hearse) {
                return res.status(404).json({ status: 'error', message: 'The selected hearse does not exist.' });
            }

            // Check hearse status
            if (hearse.status === 'booked') {
                return res.status(400).json({
                    status: 'error',
                    message: 'This hearse is already booked. Please choose another one.'
                });
            }

            // Additional check: Look for active bookings (not completed/cancelled)
            const [activeBooking] = await safeQuery(
                `SELECT id FROM hearse_bookings 
                 WHERE hearse_id = ? 
                 AND status NOT IN ('completed', 'cancelled') 
                 LIMIT 1`,
                [hearse_id],
                req.tenantSlug
            );

            if (activeBooking) {
                return res.status(400).json({
                    status: 'error',
                    message: 'This hearse has an active booking. Please choose another one.',
                    existing_booking_id: activeBooking.id
                });
            }
        }

        // ✅ Check if deceased exists (optional — for validation)
        let deceasedNote = '';
        if (deceased_id && deceased_id.trim() !== '') {
            const [deceased] = await safeQuery(
                'SELECT deceased_id FROM deceased WHERE deceased_id = ? LIMIT 1',
                [deceased_id.trim()],
                req.tenantSlug
            );
            if (!deceased) {
                deceasedNote = `Provided deceased ID (${deceased_id}) not found — booking saved anyway.`;
            }
        } else {
            deceasedNote = 'No deceased ID provided — booking saved without deceased record.';
        }

        const remarks = special_remarks
            ? `${special_remarks.trim()} ${deceasedNote ? `(${deceasedNote})` : ''}`
            : deceasedNote || null;

        const now = getKenyaTimeISO();

        // Generate simple booking code: BK-{NUMBER}
        const [idResult] = await safeQuery(
            'SELECT COUNT(*) as count FROM hearse_bookings',
            [],
            req.tenantSlug
        );
        const bookingNumber = String((idResult.count || 0) + 1).padStart(3, '0');
        const booking_code = `BK-${bookingNumber}`;

        // ✅ Insert booking — using actual schema columns
        const insertQuery = `
      INSERT INTO hearse_bookings
      (booking_code, hearse_id, client_name, client_phone, client_email, destination,
       booking_date, event_date, event_time, pickup_location, dropoff_location, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `;
        const insertParams = [
            booking_code,
            hearse_id || null,
            client_name.trim(),
            client_phone.trim(),
            client_email ? client_email.trim() : null,
            destination.trim(),
            from_timestamp || null,
            to_timestamp || null,
            null,
            from_location || null,
            to_location || null,
            now,
            now
        ];

        const result = await safeQuery(insertQuery, insertParams, req.tenantSlug);
        const bookingDbId = result.insertId;

        // ✅ Update hearse status if assigned
        if (hearse_id) {
            await safeQuery(
                'UPDATE hearses SET status = ?, updated_at = ? WHERE id = ?',
                ['booked', now, hearse_id],
                req.tenantSlug
            );
        }

        // ✅ Fetch full booking details
        const [booking] = await safeQuery(
            `
      SELECT 
        hb.id AS booking_id, hb.client_name, hb.client_phone, hb.client_email, hb.destination,
        hb.status, hb.booking_date, hb.event_date, hb.event_time,
        hb.pickup_location, hb.dropoff_location, hb.created_at,
        h.id AS hearse_id, h.plate_number, h.hearse_name, h.model, h.status AS hearse_status, h.capacity
      FROM hearse_bookings hb
      LEFT JOIN hearses h ON hb.hearse_id = h.id
      WHERE hb.id = ?
      `,
            [bookingDbId],
            req.tenantSlug
        );


        io.emit('new_booking', {
            type: 'NEW_BOOKING',
            booking_id: booking.booking_id,
            booking: booking,
            timestamp: now,
            message: `New booking created for ${booking.client_name}`
        });

        io.to('admin').emit('booking_update', {
            type: 'BOOKING_CREATED',
            booking_id: booking.booking_id,
            booking: booking,
            timestamp: now
        });


        res.status(201).json({
            status: 'success',
            message: 'Hearse booking created successfully and hearse status updated.',
            booking
        });
    } catch (error) {
        console.error('❌ Booking Error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Server error while creating booking.'
        });
    }
});


/**
 * Get all hearse bookings
 */
const getAllHearseBookings = asyncHandler(async (req, res) => {
    try {
        const query = `
      SELECT 
        hb.id AS booking_id,
        hb.client_name,
        hb.client_phone,
        hb.client_email,
        hb.destination,
        hb.status,
        hb.booking_date,
        hb.event_date,
        hb.event_time,
        hb.service_type,
        hb.special_requests AS special_remarks,
        hb.created_at,
        h.id AS hearse_id,
        h.plate_number,
        h.hearse_name,
        h.model,
        h.status AS hearse_status,
        h.capacity,
        h.driver_id,
        h.branch_id
      FROM hearse_bookings hb
      LEFT JOIN hearses h ON hb.hearse_id = h.id
      ORDER BY hb.created_at DESC
    `;

        const bookings = await safeQuery(query, [], req.tenantSlug);

        res.status(200).json({
            status: 'success',
            total: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('❌ Fetch Bookings Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch hearse bookings.'
        });
    }
});

/**
 * Assign or change a driver for a booking
 */
const assignDriverToBooking = asyncHandler(async (req, res) => {
    try {
        const { booking_id } = req.params;
        const { driver_id } = req.body;

        if (!driver_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Driver ID is required.'
            });
        }

        // ✅ Step 1: Check if booking exists
        const [booking] = await safeQuery(
            'SELECT hearse_id FROM hearse_bookings WHERE id = ?',
            [booking_id],
            req.tenantSlug
        );

        if (!booking) {
            return res.status(404).json({
                status: 'error',
                message: `Booking with ID ${booking_id} not found.`
            });
        }

        // ✅ Step 2: Check if driver exists
        const [driver] = await safeQuery(
            'SELECT id FROM drivers WHERE id = ?',
            [driver_id],
            req.tenantSlug
        );

        if (!driver) {
            return res.status(404).json({
                status: 'error',
                message: `Driver with ID ${driver_id} not found.`
            });
        }

        // ✅ Step 3: Assign driver to hearse
        await safeQuery(
            'UPDATE hearses SET driver_id = ?, updated_at = ? WHERE id = ?',
            [driver_id, getKenyaTimeISO(), booking.hearse_id],
            req.tenantSlug
        );

        // ✅ Step 4: Optionally update driver status
        await safeQuery(
            'UPDATE drivers SET status = ?, updated_at = ? WHERE id = ?',
            ['on_trip', getKenyaTimeISO(), driver_id],
            req.tenantSlug
        );

        res.status(200).json({
            status: 'success',
            message: 'Driver assigned successfully to the hearse.',
            booking_id,
            driver_id
        });
    } catch (error) {
        console.error('❌ Assign Driver Error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to assign driver.'
        });
    }
});



/**
 * Update booking status
 */

const updateBookingStatus = asyncHandler(async (req, res) => {
    try {
        const io = req.app.get('io');
        const { booking_id } = req.params;
        const { status } = req.body;

        // ✅ Allow all valid booking statuses
        const validStatuses = ['pending', 'in_transit', 'assigned', 'completed', 'cancelled', 'postponed'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: 'error',
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // ✅ Check if booking exists
        const [booking] = await safeQuery('SELECT * FROM hearse_bookings WHERE id = ?', [booking_id], req.tenantSlug);
        if (!booking)
            return res.status(404).json({ status: 'error', message: 'Booking not found.' });

        // ✅ Find driver linked to booking
        const [driverData] = await safeQuery(`
      SELECT d.id AS driver_id
      FROM hearse_bookings hb
      LEFT JOIN hearses h ON hb.hearse_id = h.id
      LEFT JOIN drivers d ON h.driver_id = d.id
      WHERE hb.id = ?
    `, [booking_id], req.tenantSlug);

        const driver_id = driverData ? driverData.driver_id : null;

        // ✅ Update booking status
        const now = getKenyaTimeISO();
        await safeQuery(
            'UPDATE hearse_bookings SET status = ?, updated_at = ? WHERE id = ?',
            [status, now, booking_id],
            req.tenantSlug
        );

        // ✅ Free hearse when booking is completed/cancelled
        if (['completed', 'cancelled'].includes(status) && booking.hearse_id) {
            await safeQuery(
                'UPDATE hearses SET status = ?, updated_at = ? WHERE id = ?',
                ['available', now, booking.hearse_id],
                req.tenantSlug
            );
        }

        // ✅ Update driver statistics if linked
        if (driver_id) {
            await safeQuery(
                `INSERT IGNORE INTO driver_statistics (driver_id, last_updated)
         VALUES (?, ?)`,
                [driver_id, now],
                req.tenantSlug
            );

            const [stats] = await safeQuery(`
        SELECT 
          SUM(CASE WHEN hb.status = 'pending' THEN 1 ELSE 0 END) AS total_pending,
          SUM(CASE WHEN hb.status = 'in_transit' THEN 1 ELSE 0 END) AS total_in_transit,
          SUM(CASE WHEN hb.status = 'assigned' THEN 1 ELSE 0 END) AS total_assigned,
          SUM(CASE WHEN hb.status = 'completed' THEN 1 ELSE 0 END) AS total_completed,
          SUM(CASE WHEN hb.status = 'cancelled' THEN 1 ELSE 0 END) AS total_cancelled,
          SUM(CASE WHEN hb.status = 'postponed' THEN 1 ELSE 0 END) AS total_postponed
        FROM hearse_bookings hb
        LEFT JOIN hearses h ON hb.hearse_id = h.id
        WHERE h.driver_id = ?
      `, [driver_id], req.tenantSlug);

            await safeQuery(`
        UPDATE driver_statistics
        SET total_pending = ?, total_in_transit = ?, total_assigned = ?, 
            total_completed = ?, total_cancelled = ?, total_postponed = ?, last_updated = ?
        WHERE driver_id = ?
      `, [
                stats.total_pending || 0,
                stats.total_in_transit || 0,
                stats.total_assigned || 0,
                stats.total_completed || 0,
                stats.total_cancelled || 0,
                stats.total_postponed || 0,
                now,
                driver_id
            ], req.tenantSlug);
        }

        // ✅ Fetch updated booking (for real-time push)
        const [updatedBooking] = await safeQuery(`
      SELECT 
        hb.id AS booking_id, hb.client_name, hb.client_phone, hb.client_email, hb.destination,
        hb.status, hb.estimated_departure_time, hb.special_remarks, hb.created_at,
        h.id AS hearse_id, h.number_plate, h.model, h.status AS hearse_status, h.capacity,
        dr.id AS driver_id, dr.driver_name, dr.driver_phone, dr.license_number,
        dcd.deceased_id AS deceased_id, dcd.full_name AS deceased_name, dcd.gender AS deceased_gender
      FROM hearse_bookings hb
      LEFT JOIN hearses h ON hb.hearse_id = h.id
      LEFT JOIN drivers dr ON h.driver_id = dr.id
      LEFT JOIN deceased dcd ON hb.deceased_id = dcd.deceased_id
      WHERE hb.id = ?
    `, [booking_id], req.tenantSlug);

        // ✅ Emit real-time update via socket.io
        if (io && updatedBooking) {
            io.emit('booking_status_updated', {
                type: 'STATUS_UPDATE',
                booking_id: parseInt(booking_id),
                status,
                booking: updatedBooking,
                timestamp: now,
                message: `Booking status updated to ${status}`
            });
        }

        // ✅ Final success response
        res.status(200).json({
            status: 'success',
            message: `Booking status updated to '${status}'.`,
            booking_id,
            status,
            driver_id,
            booking: updatedBooking
        });
    } catch (error) {
        console.error('❌ Update Status Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update booking status.'
        });
    }
});

/**
 * Postpone a booking - simplified version without hearse_postpones table
 */

const postponeHearseBooking = asyncHandler(async (req, res) => {
    try {
        const io = req.app.get('io');
        const { booking_id } = req.params;
        const { new_departure_time, reason } = req.body;

        if (!new_departure_time) {
            return res.status(400).json({ status: 'error', message: 'New departure time is required.' });
        }

        // ✅ 1. Check if booking exists
        const [booking] = await safeQuery('SELECT * FROM hearse_bookings WHERE id = ?', [booking_id], req.tenantSlug);
        if (!booking) {
            return res.status(404).json({ status: 'error', message: 'Booking not found.' });
        }

        const now = getKenyaTimeISO();

        // ✅ 2. Update booking with new time and status
        await safeQuery(
            `UPDATE hearse_bookings 
       SET booking_date = ?, special_requests = ?, status = ?, updated_at = ? 
       WHERE id = ?`,
            [new_departure_time, reason || 'Postponed by client', 'postponed', now, booking_id],
            req.tenantSlug
        );

        // ✅ 3. Notify clients (Socket)
        if (io) io.emit('booking_postponed', { booking_id, new_departure_time, reason });

        res.status(200).json({
            status: 'success',
            message: 'Booking postponed successfully.',
            data: {
                booking_id,
                new_departure_time,
                reason,
                status: 'postponed'
            }
        });
    } catch (error) {
        console.error('❌ Postpone Booking Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while postponing booking.'
        });
    }
});


const getAllDrivers = asyncHandler(async (req, res) => {
    try {
        // Try to get drivers from the drivers table, fallback to empty array
        let drivers = [];
        try {
            drivers = await safeQuery(`
        SELECT 
          id AS driver_id,
          driver_name,
          driver_phone,
          license_number,
          status,
          created_at
        FROM drivers
        ORDER BY driver_name ASC
      `, [], req.tenantSlug);
        } catch (driverErr) {
            console.warn('⚠️ Drivers table not available, returning empty:', driverErr.message);
            drivers = [];
        }

        res.status(200).json({
            status: 'success',
            total: drivers.length,
            drivers
        });
    } catch (error) {
        console.error('❌ Fetch Drivers Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch drivers.'
        });
    }
});



/**
 * Get all bookings assigned to a specific driver
 */
const getBookingsByDriver = asyncHandler(async (req, res) => {
    try {
        const { driver_id } = req.params;

        if (!driver_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Driver ID is required.'
            });
        }

        const query = `
      SELECT 
        hb.id AS booking_id,
        hb.client_name,
        hb.client_phone,
        hb.client_email,
        hb.destination,
        hb.status AS booking_status,
        hb.estimated_departure_time,
        hb.special_remarks,
        hb.created_at,
        h.id AS hearse_id,
        h.number_plate,
        h.model,
        h.status AS hearse_status,
        d.driver_name,
        d.driver_phone,
        d.license_number,
        d.status AS driver_status,
        dcd.deceased_id,
        dcd.full_name AS deceased_name,
        dcd.gender AS deceased_gender
      FROM hearse_bookings hb
      LEFT JOIN hearses h ON hb.hearse_id = h.id
      LEFT JOIN drivers d ON h.driver_id = d.id
      LEFT JOIN deceased dcd ON hb.deceased_id = dcd.id
      WHERE d.id = ?
      ORDER BY hb.created_at DESC
    `;

        const bookings = await safeQuery(query, [driver_id], req.tenantSlug);

        if (!bookings.length) {
            return res.status(404).json({
                status: 'error',
                message: `No bookings found for driver ID ${driver_id}`
            });
        }

        res.status(200).json({
            status: 'success',
            total: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('❌ Fetch Bookings by Driver Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch bookings for this driver.'
        });
    }
});

/**
 * Get availability across branches (tenant-aware)
 */
const getAvailabilityAcrossBranches = asyncHandler(async (req, res) => {
    try {
        const bookings = await query(req, `
      SELECT 
        hb.id AS booking_id,
        hb.status,
        hb.destination,
        hb.booking_date,
        hb.event_date,
        h.id AS hearse_id,
        h.plate_number,
        h.hearse_name,
        h.model,
        h.status AS hearse_status,
        h.capacity
      FROM hearse_bookings hb
      LEFT JOIN hearses h ON hb.hearse_id = h.id
      ORDER BY hb.created_at DESC
    `, req.tenantSlug);

        res.status(200).json({
            status: 'success',
            total: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('❌ Availability Across Branches Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch availability across branches.'
        });
    }
});

/**
 * Check availability by date - strict same-day booking prevention
 */
const checkAvailabilityByDate = asyncHandler(async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                status: 'error',
                message: 'Date parameter is required'
            });
        }

        // Get all hearses
        const allHearses = await safeQuery(
            'SELECT id, hearse_code, hearse_name, plate_number, status FROM hearses',
            [],
            req.tenantSlug
        );

        // Get bookings for the specific date (strict same-day check)
        const bookings = await safeQuery(
            `SELECT hb.id, hb.booking_id, hb.status, hb.booking_date, 
             h.hearse_id, h.plate_number, h.hearse_name
             FROM hearse_bookings hb
             LEFT JOIN hearses h ON hb.hearse_id = h.id
             WHERE DATE(hb.booking_date) = ? 
             AND hb.status NOT IN ('cancelled', 'completed')`,
            [date],
            req.tenantSlug
        );

        // Get available hearses (not booked on that date)
        const bookedHearseIds = [...new Set(bookings.map(b => b.hearse_id).filter(Boolean))];
        const availableHearses = allHearses.filter(h => !bookedHearseIds.includes(h.id) && h.status === 'available');

        res.status(200).json({
            status: 'success',
            date: date,
            available_hearses: availableHearses,
            booked_hearses: bookings,
            total_available: availableHearses.length,
            total_booked: bookings.length
        });
    } catch (error) {
        console.error('❌ Check Availability Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to check availability.'
        });
    }
});

const getDriverDashboard = asyncHandler(async (req, res) => {
    try {
        const { driver_id } = req.params;
        const io = req.app.get('io');

        // ✅ Validate driver
        const [driver] = await safeQuery('SELECT * FROM drivers WHERE id = ?', [driver_id], req.tenantSlug);
        if (!driver) {
            return res.status(404).json({ status: 'error', message: 'Driver not found.' });
        }

        // ✅ Combined query for stats, totals, and performance metrics
        const [overview] = await safeQuery(`
      SELECT 
        COUNT(hb.id) AS total_bookings,
        SUM(CASE WHEN hb.status = 'pending' THEN 1 ELSE 0 END) AS total_pending,
        SUM(CASE WHEN hb.status = 'in_transit' THEN 1 ELSE 0 END) AS total_in_transit,
        SUM(CASE WHEN hb.status = 'assigned' THEN 1 ELSE 0 END) AS total_assigned,
        SUM(CASE WHEN hb.status = 'completed' THEN 1 ELSE 0 END) AS total_completed,
        SUM(CASE WHEN hb.status = 'cancelled' THEN 1 ELSE 0 END) AS total_cancelled,
        SUM(CASE WHEN hb.status = 'postponed' THEN 1 ELSE 0 END) AS total_postponed,
      MAX(hb.updated_at) AS last_updated
      FROM hearse_bookings hb
      LEFT JOIN hearses h ON hb.hearse_id = h.id
      WHERE h.driver_id = ?
    `, [driver_id], req.tenantSlug);

        //  Fetch last 5 bookings with key details
        const recentBookings = await safeQuery(`
      SELECT 
        hb.id AS booking_id,
        hb.destination,
        hb.status,
        hb.special_remarks,
        DATE_FORMAT(hb.created_at, '%Y-%m-%d %H:%i') AS created_at,
        DATE_FORMAT(hb.updated_at, '%Y-%m-%d %H:%i') AS updated_at,
        h.number_plate,
        h.model
      FROM hearse_bookings hb
      LEFT JOIN hearses h ON hb.hearse_id = h.id
      WHERE h.driver_id = ?
      ORDER BY hb.updated_at DESC
      LIMIT 5
    `, [driver_id], req.tenantSlug);

        // Add derived metrics
        const completionRate = overview.total_bookings > 0
            ? ((overview.total_completed / overview.total_bookings) * 100).toFixed(1)
            : 0;

        const activeTrips = (overview.total_in_transit || 0) + (overview.total_assigned || 0);

        //  Prepare response object
        const dashboardData = {
            driver: {
                id: driver.id,
                name: driver.driver_name,
                phone: driver.driver_phone,
                license: driver.license_number,
                status: driver.status,
            },
            stats: {
                total_bookings: overview.total_bookings || 0,
                total_pending: overview.total_pending || 0,
                total_in_transit: overview.total_in_transit || 0,
                total_assigned: overview.total_assigned || 0,
                total_completed: overview.total_completed || 0,
                total_cancelled: overview.total_cancelled || 0,
                total_postponed: overview.total_postponed || 0,
                completion_rate: completionRate,
                active_trips: activeTrips,
                last_updated: overview.last_updated,
            },
            recent_bookings: recentBookings || [],
        };

        // Emit to socket for real-time dashboard updates
        if (io) {
            io.emit(`driver_dashboard_${driver_id}`, dashboardData);
        }

        res.status(200).json({
            status: 'success',
            message: 'Driver dashboard fetched successfully.',
            data: dashboardData,
        });
    } catch (error) {
        console.error(' Driver Dashboard Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch driver dashboard data.',
        });
    }
});


module.exports = {
    makeHearseBooking,
    getAllHearseBookings,
    assignDriverToBooking,
    updateBookingStatus,
    postponeHearseBooking,
    getAllDrivers,
    getBookingsByDriver,
    getDriverDashboard,
    getAvailabilityAcrossBranches,
    checkAvailabilityByDate
};
