const { safeQuery, getConnection } = require('../../../shared/config/db');
const { getKenyaTimeISO } = require('../../../packages/shared-utils/dist/timestamps');
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
            to_location,
            booked_by
        } = req.body;

        // ✅ Basic validation - only destination is required
        console.log('📝 Booking request body:', {
            hearse_id,
            client_name,
            destination,
            from_timestamp,
            to_timestamp,
            from_location,
            to_location
        });

        // ✅ Validate required fields
        if (!destination) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required field: destination.'
            });
        }

        if (!client_name) {
            return res.status(400).json({
                status: 'error',
                message: 'Client name is required.'
            });
        }

        if (!client_phone) {
            return res.status(400).json({
                status: 'error',
                message: 'Client phone is required.'
            });
        }

        // ✅ Check if hearse is already booked (double-booking prevention)
        if (hearse_id) {
            // Use transaction with row locking to prevent race conditions
            const connection = await getConnection(req.tenant?.db_name || req.tenantSlug);
            try {
                await connection.beginTransaction();

                // Lock the hearse row for update
                const [hearseRows] = await connection.query(
                    'SELECT id, status FROM hearses WHERE id = ? FOR UPDATE',
                    [hearse_id]
                );
                const hearse = hearseRows[0];

                if (!hearse) {
                    await connection.rollback();
                    connection.release();
                    return res.status(404).json({
                        status: 'error',
                        message: 'The selected hearse does not exist.'
                    });
                }

                // Check hearse status
                if (hearse.status === 'booked') {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        status: 'error',
                        message: 'This hearse is already booked. Please choose another one.'
                    });
                }

                // Additional check: Look for active bookings (not completed/cancelled)
                const [activeBookingRows] = await connection.query(
                    `SELECT id FROM hearse_bookings 
                     WHERE hearse_id = ? 
                     AND status NOT IN ('completed', 'cancelled') 
                     LIMIT 1`,
                    [hearse_id]
                );
                const activeBooking = activeBookingRows[0];

                if (activeBooking) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        status: 'error',
                        message: 'This hearse has an active booking. Please choose another one.',
                        existing_booking_id: activeBooking.id
                    });
                }

                // Commit the transaction - hearse is available
                await connection.commit();
                connection.release();
            } catch (txError) {
                await connection.rollback();
                connection.release();
                console.error('Transaction error during booking check:', txError);
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to verify hearse availability. Please try again.'
                });
            }
        }

        // ✅ Check if deceased exists (optional — for validation)
        let deceasedNote = '';
        if (deceased_id && deceased_id.trim() !== '') {
            try {
                const [deceased] = await safeQuery(
                    'SELECT deceased_id FROM deceased WHERE deceased_id = ? LIMIT 1',
                    [deceased_id.trim()],
                    req.tenant?.db_name || req.tenantSlug
                );
                if (!deceased) {
                    deceasedNote = `Provided deceased ID (${deceased_id}) not found — booking saved anyway.`;
                }
            } catch (err) {
                deceasedNote = 'Deceased validation skipped - table may not exist.';
            }
        } else {
            deceasedNote = 'No deceased ID provided — booking saved without deceased record.';
        }

        const remarks = special_remarks
            ? `${special_remarks.trim()} ${deceasedNote ? `(${deceasedNote})` : ''}`
            : deceasedNote || null;

        const now = getKenyaTimeISO();

        // Generate simple booking code: BK-{NUMBER}
        try {
            const [idResult] = await safeQuery(
                'SELECT COUNT(*) as count FROM hearse_bookings',
                [],
                req.tenant?.db_name || req.tenantSlug
            );
            const bookingNumber = String((idResult.count || 0) + 1).padStart(3, '0');
            var booking_code = `BK-${bookingNumber}`;
        } catch (err) {
            // Fallback if table is empty or doesn't exist
            var booking_code = `BK-${Date.now().toString().slice(-6)}`;
        }

        // ✅ Get user ID from headers if logged in
        const userId = req.headers['x-user-id'];
        const createdBy = userId ? parseInt(userId) : null;

        // ✅ Get branch tracking info from request headers
        // branch_code tells us which branch/Department this booking originated from
        const branchCode = req.headers['x-branch-code'] || req.headers['x-branch-id'] || null;

        // ✅ Determine booking status - use 'booked' since it's now in ENUM
        const bookingStatus = 'booked';

        // ✅ Insert booking — match frontend data structure (minimal fields)
        const insertQuery = `
            INSERT INTO hearse_bookings
            (booking_code, hearse_id, tenant_db_name, client_name, client_phone, destination,
             from_timestamp, to_timestamp, booking_date, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertParams = [
            booking_code,
            hearse_id || null,
            req.tenantSlug, // tenant_db_name - shared across all branches
            client_name.trim(),
            client_phone.trim(),
            destination.trim(),
            from_timestamp || null,
            to_timestamp || null,
            from_timestamp || now, // booking_date
            bookingStatus, // 'booked'
            now,
            now
        ];

        console.log('📝 Inserting booking with params:', insertParams);

        const result = await safeQuery(insertQuery, insertParams, req.tenant?.db_name || req.tenantSlug);
        const bookingDbId = result.insertId;

        // ✅ Update hearse status if assigned
        if (hearse_id) {
            await safeQuery(
                'UPDATE hearses SET status = ?, updated_at = ? WHERE id = ?',
                ['booked', now, hearse_id],
                req.tenant?.db_name || req.tenantSlug
            );
            console.log(`✅ Hearse ${hearse_id} status updated to 'booked'`);
        }

        // ✅ Fetch full booking details
        const [booking] = await safeQuery(
            `
            SELECT 
                hb.id AS booking_id, 
                hb.booking_code,
                hb.client_name, 
                hb.client_phone, 
                hb.client_email, 
                hb.destination,
                hb.from_timestamp,
                hb.to_timestamp,
                hb.from_location,
                hb.to_location,
                hb.status, 
                hb.booking_date, 
                hb.created_at,
                h.id AS hearse_id, 
                h.plate_number, 
                h.hearse_name, 
                h.model, 
                h.status AS hearse_status, 
                h.capacity
            FROM hearse_bookings hb
            LEFT JOIN hearses h ON hb.hearse_id = h.id
            WHERE hb.id = ?
            `,
            [bookingDbId],
            req.tenant?.db_name || req.tenantSlug
        );

        //  Emit real-time updates via Socket.IO
        if (io && booking) {
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
        }

        //  Log successful booking creation
        const userInfo = req.headers['x-user-name'] || 'System';
        console.log(`[ActionLog]  New booking created: ${booking_code} by ${userInfo} - Client: ${client_name}, Destination: ${destination}`);

        // Success response
        res.status(201).json({
            status: 'success',
            message: 'Hearse booking created successfully and hearse status updated.',
            booking: {
                ...booking,
                booking_code: booking_code,
                status: bookingStatus
            }
        });

    } catch (error) {
        console.error('❌ Booking Error:', error);
        console.error('❌ Error Details:', error.sql, error.sqlMessage);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Server error while creating booking.',
            error: process.env.NODE_ENV === 'development' ? error.sqlMessage : undefined
        });
    }
});

/**
 * Get all hearse bookings — cross-branch aware.
 * Joins hearses → branches so every booking carries branch_name, branch_code, branch_id.
 * Optional ?branch_id=X query param to filter to a specific branch.
 */
const getAllHearseBookings = asyncHandler(async (req, res) => {
    try {
        const { branch_id, status } = req.query;
        const dbName = req.tenant?.db_name || req.tenantSlug;

        // Build WHERE clauses
        const whereClauses = [];
        const params = [];

        if (branch_id && branch_id !== 'all') {
            whereClauses.push('h.branch_id = ?');
            params.push(branch_id);
        }

        if (status && status !== 'all') {
            whereClauses.push('hb.status = ?');
            params.push(status);
        }

        const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Check whether branches table has branch_code column
        let hasBranchCode = false;
        try {
            const { safeTenantQuery } = require('../../../shared/dbConfig');
            const colResult = await safeTenantQuery(
                dbName,
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'branches' AND COLUMN_NAME = 'branch_code'",
                [dbName]
            );
            hasBranchCode = Array.isArray(colResult) && colResult.length > 0;
        } catch (e) { /* ignore */ }

        const branchCodeSel = hasBranchCode
            ? 'COALESCE(h.branch_code, b.branch_code) AS branch_code,'
            : 'h.branch_code AS branch_code,';

        const query = `
            SELECT 
                hb.id AS booking_id,
                hb.booking_code,
                hb.client_name,
                hb.client_phone,
                hb.client_email,
                hb.destination,
                hb.from_timestamp,
                hb.to_timestamp,
                hb.from_location,
                hb.to_location,
                hb.status,
                hb.booking_date,
                hb.created_at,
                h.id AS hearse_id,
                h.plate_number,
                h.hearse_name,
                h.model,
                h.status AS hearse_status,
                h.capacity,
                h.branch_id,
                ${branchCodeSel}
                b.branch_name,
                b.branch_location
            FROM hearse_bookings hb
            LEFT JOIN hearses h ON hb.hearse_id = h.id
            LEFT JOIN branches b ON h.branch_id = b.branch_id
            ${whereSQL}
            ORDER BY hb.created_at DESC
        `;

        const bookings = await safeQuery(query, params, dbName);

        // Also return all known branches for the tenant (for filter dropdowns in UI)
        let allBranches = [];
        try {
            const { safeTenantQuery } = require('../../../shared/dbConfig');
            allBranches = await safeTenantQuery(
                dbName,
                'SELECT branch_id, branch_name, branch_slug, branch_location FROM branches WHERE is_active = TRUE ORDER BY branch_name ASC',
                []
            );
        } catch (e) { /* branches table may not exist in older tenants */ }

        res.status(200).json({
            status: 'success',
            total: bookings.length,
            bookings,
            branches: allBranches
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
        const userInfo = req.headers['x-user-name'] || 'System';

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
            req.tenant?.db_name || req.tenantSlug
        );

        if (!booking) {
            return res.status(404).json({
                status: 'error',
                message: `Booking with ID ${booking_id} not found.`
            });
        }

        // ✅ Step 2: Check if driver exists
        let driverName = 'Unknown';
        try {
            const [driver] = await safeQuery(
                'SELECT id, driver_name FROM drivers WHERE id = ?',
                [driver_id],
                req.tenant?.db_name || req.tenantSlug
            );

            if (!driver) {
                return res.status(404).json({
                    status: 'error',
                    message: `Driver with ID ${driver_id} not found.`
                });
            }
            driverName = driver.driver_name;
        } catch (err) {
            // If drivers table doesn't exist, still allow assignment
            console.warn('Drivers table not found, skipping driver validation');
        }

        // ✅ Step 3: Assign driver to hearse
        await safeQuery(
            'UPDATE hearses SET driver_id = ?, updated_at = ? WHERE id = ?',
            [driver_id, getKenyaTimeISO(), booking.hearse_id],
            req.tenant?.db_name || req.tenantSlug
        );

        // ✅ Log the action
        console.log(`[ActionLog] ✅ Driver ${driverName} (ID: ${driver_id}) assigned to booking ${booking_id} by ${userInfo}`);

        res.status(200).json({
            status: 'success',
            message: `Driver ${driverName} assigned successfully to the hearse.`,
            booking_id,
            driver_id,
            driver_name: driverName,
            performed_by: userInfo
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

        // ✅ Valid statuses - accept both old and new status values
        const validStatuses = [
            'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'booked',
            'in_transit', 'postponed'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: 'error',
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
                error_type: 'INVALID_STATUS',
                provided_status: status,
                allowed_statuses: validStatuses
            });
        }

        // ✅ Check if booking exists
        const [booking] = await safeQuery(
            'SELECT * FROM hearse_bookings WHERE id = ?',
            [booking_id],
            req.tenant?.db_name || req.tenantSlug
        );

        if (!booking) {
            return res.status(404).json({
                status: 'error',
                message: 'Booking not found.'
            });
        }

        // ✅ Update booking status
        const now = getKenyaTimeISO();
        await safeQuery(
            'UPDATE hearse_bookings SET status = ?, updated_at = ? WHERE id = ?',
            [status, now, booking_id],
            req.tenant?.db_name || req.tenantSlug
        );

        // ✅ Free hearse when booking is completed or cancelled
        if (['completed', 'cancelled'].includes(status) && booking.hearse_id) {
            console.log(`[UpdateStatus] Freeing hearse ${booking.hearse_id} - booking ${booking_id} status: ${status}`);
            await safeQuery(
                'UPDATE hearses SET status = ?, updated_at = ? WHERE id = ?',
                ['available', now, booking.hearse_id],
                req.tenant?.db_name || req.tenantSlug
            );

            // Verify the update
            const [hearseCheck] = await safeQuery(
                'SELECT id, status FROM hearses WHERE id = ?',
                [booking.hearse_id],
                req.tenant?.db_name || req.tenantSlug
            );
            console.log(`[UpdateStatus] Hearse ${booking.hearse_id} status after update:`, hearseCheck?.status);
        }

        // ✅ Fetch updated booking
        const [updatedBooking] = await safeQuery(
            `
            SELECT 
                hb.id AS booking_id, 
                hb.booking_code,
                hb.client_name, 
                hb.client_phone, 
                hb.client_email, 
                hb.destination,
                hb.status, 
                hb.booking_date, 
                hb.created_at,
                h.id AS hearse_id, 
                h.plate_number, 
                h.model, 
                h.status AS hearse_status, 
                h.capacity
            FROM hearse_bookings hb
            LEFT JOIN hearses h ON hb.hearse_id = h.id
            WHERE hb.id = ?
            `,
            [booking_id],
            req.tenant?.db_name || req.tenantSlug
        );

        // ✅ Emit real-time update
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

        // ✅ Success response
        res.status(200).json({
            status: 'success',
            message: `Booking status updated to '${status}'.`,
            booking_id,
            status,
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
 * Postpone a booking
 */
const postponeHearseBooking = asyncHandler(async (req, res) => {
    try {
        const io = req.app.get('io');
        const { booking_id } = req.params;
        const { new_departure_time, reason } = req.body;

        if (!new_departure_time) {
            return res.status(400).json({
                status: 'error',
                message: 'New departure time is required.'
            });
        }

        //  Check if booking exists
        const [booking] = await safeQuery(
            'SELECT * FROM hearse_bookings WHERE id = ?',
            [booking_id],
            req.tenant?.db_name || req.tenantSlug
        );

        if (!booking) {
            return res.status(404).json({
                status: 'error',
                message: 'Booking not found.'
            });
        }

        const now = getKenyaTimeISO();

        // Update booking with new time and status
        await safeQuery(
            `UPDATE hearse_bookings 
             SET booking_date = ?, 
                 from_timestamp = ?,
                 special_requests = CONCAT(IFNULL(special_requests, ''), ' Postponed: ', ?),
                 status = ?, 
                 updated_at = ? 
             WHERE id = ?`,
            [
                new_departure_time,
                new_departure_time,
                reason || 'Postponed by client',
                'pending', // Reset to pending after postponement
                now,
                booking_id
            ],
            req.tenant?.db_name || req.tenantSlug
        );

        // Free the hearse
        if (booking.hearse_id) {
            await safeQuery(
                'UPDATE hearses SET status = ?, updated_at = ? WHERE id = ?',
                ['available', now, booking.hearse_id],
                req.tenant?.db_name || req.tenantSlug
            );
        }

        // ✅ Log the postponement
        const userInfo = req.headers['x-user-name'] || 'System';
        console.log(`[ActionLog] ✅ Booking ${booking_id} postponed to ${new_departure_time} by ${userInfo}. Reason: ${reason || 'Not provided'}`);

        // Notify clients (Socket)
        if (io) {
            io.emit('booking_postponed', {
                booking_id,
                new_departure_time,
                reason,
                performed_by: userInfo
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Booking postponed successfully.',
            data: {
                booking_id,
                new_departure_time,
                reason,
                status: 'pending',
                performed_by: userInfo
            }
        });
    } catch (error) {
        console.error(' Postpone Booking Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while postponing booking.'
        });
    }
});

/**
 * Get all drivers
 */
const getAllDrivers = asyncHandler(async (req, res) => {
    try {
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
            `, [], req.tenant?.db_name || req.tenantSlug);
        } catch (driverErr) {
            console.warn(' Drivers table not available, returning empty:', driverErr.message);
            drivers = [];
        }

        res.status(200).json({
            status: 'success',
            total: drivers.length,
            drivers
        });
    } catch (error) {
        console.error(' Fetch Drivers Error:', error);
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
                hb.booking_code,
                hb.client_name,
                hb.client_phone,
                hb.client_email,
                hb.destination,
                hb.status AS booking_status,
                hb.from_timestamp,
                hb.to_timestamp,
                hb.special_requests,
                hb.created_at,
                h.id AS hearse_id,
                h.plate_number,
                h.model,
                h.status AS hearse_status
            FROM hearse_bookings hb
            LEFT JOIN hearses h ON hb.hearse_id = h.id
            WHERE h.driver_id = ?
            ORDER BY hb.created_at DESC
        `;

        const bookings = await safeQuery(query, [driver_id], req.tenant?.db_name || req.tenantSlug);

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
        const bookings = await safeQuery(`
            SELECT 
                hb.id AS booking_id,
                hb.status,
                hb.destination,
                hb.booking_date,
                h.id AS hearse_id,
                h.plate_number,
                h.hearse_name,
                h.model,
                h.status AS hearse_status,
                h.capacity
            FROM hearse_bookings hb
            LEFT JOIN hearses h ON hb.hearse_id = h.id
            WHERE hb.status NOT IN ('completed', 'cancelled')
            ORDER BY hb.created_at DESC
        `, [], req.tenant?.db_name || req.tenantSlug);

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
 * Check availability by date
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
            req.tenant?.db_name || req.tenantSlug
        );

        // Get bookings for the specific date
        const bookings = await safeQuery(
            `SELECT hb.id, hb.booking_code, hb.status, hb.booking_date, 
                     h.id AS hearse_id, h.plate_number, h.hearse_name
             FROM hearse_bookings hb
             LEFT JOIN hearses h ON hb.hearse_id = h.id
             WHERE DATE(hb.booking_date) = ? 
             AND hb.status NOT IN ('cancelled', 'completed')`,
            [date],
            req.tenant?.db_name || req.tenantSlug
        );

        // Get available hearses (not booked on that date)
        const bookedHearseIds = [...new Set(bookings.map(b => b.hearse_id).filter(Boolean))];
        const availableHearses = allHearses.filter(h =>
            !bookedHearseIds.includes(h.id) && h.status === 'available'
        );

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

/**
 * Get driver dashboard
 */
const getDriverDashboard = asyncHandler(async (req, res) => {
    try {
        const { driver_id } = req.params;
        const io = req.app.get('io');

        // ✅ Validate driver
        try {
            const [driver] = await safeQuery(
                'SELECT * FROM drivers WHERE id = ?',
                [driver_id],
                req.tenant?.db_name || req.tenantSlug
            );

            if (!driver) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Driver not found.'
                });
            }

            // ✅ Combined query for stats
            const [overview] = await safeQuery(`
                SELECT 
                    COUNT(hb.id) AS total_bookings,
                    SUM(CASE WHEN hb.status = 'pending' THEN 1 ELSE 0 END) AS total_pending,
                    SUM(CASE WHEN hb.status = 'in_progress' THEN 1 ELSE 0 END) AS total_in_progress,
                    SUM(CASE WHEN hb.status = 'confirmed' THEN 1 ELSE 0 END) AS total_confirmed,
                    SUM(CASE WHEN hb.status = 'completed' THEN 1 ELSE 0 END) AS total_completed,
                    SUM(CASE WHEN hb.status = 'cancelled' THEN 1 ELSE 0 END) AS total_cancelled,
                    MAX(hb.updated_at) AS last_updated
                FROM hearse_bookings hb
                LEFT JOIN hearses h ON hb.hearse_id = h.id
                WHERE h.driver_id = ?
            `, [driver_id], req.tenant?.db_name || req.tenantSlug);

            // ✅ Fetch recent bookings
            const recentBookings = await safeQuery(`
                SELECT 
                    hb.id AS booking_id,
                    hb.booking_code,
                    hb.client_name,
                    hb.destination,
                    hb.status,
                    hb.special_requests,
                    DATE_FORMAT(hb.created_at, '%Y-%m-%d %H:%i') AS created_at,
                    h.plate_number,
                    h.model
                FROM hearse_bookings hb
                LEFT JOIN hearses h ON hb.hearse_id = h.id
                WHERE h.driver_id = ?
                ORDER BY hb.created_at DESC
                LIMIT 5
            `, [driver_id], req.tenant?.db_name || req.tenantSlug);

            // ✅ Calculate metrics
            const completionRate = overview.total_bookings > 0
                ? ((overview.total_completed / overview.total_bookings) * 100).toFixed(1)
                : 0;

            // ✅ Prepare dashboard data
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
                    total_in_progress: overview.total_in_progress || 0,
                    total_confirmed: overview.total_confirmed || 0,
                    total_completed: overview.total_completed || 0,
                    total_cancelled: overview.total_cancelled || 0,
                    completion_rate: completionRate,
                    last_updated: overview.last_updated,
                },
                recent_bookings: recentBookings || [],
            };

            // ✅ Emit to socket for real-time updates
            if (io) {
                io.emit(`driver_dashboard_${driver_id}`, dashboardData);
            }

            res.status(200).json({
                status: 'success',
                message: 'Driver dashboard fetched successfully.',
                data: dashboardData,
            });

        } catch (err) {
            // If drivers table doesn't exist
            console.warn('Drivers table not found:', err.message);
            res.status(200).json({
                status: 'success',
                message: 'Driver dashboard (simplified)',
                data: {
                    driver: { id: driver_id, name: 'Driver', status: 'active' },
                    stats: { total_bookings: 0, completion_rate: 0 },
                    recent_bookings: []
                }
            });
        }

    } catch (error) {
        console.error('❌ Driver Dashboard Error:', error);
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