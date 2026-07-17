// ============================================
// HEARSE SERVICE MIGRATION - Add more status options
// ============================================
// Prevents breakdown by supporting full lifecycle tracking

exports.up = function (knex) {
    return knex.schema
        // Update hearses status to include more options
        .raw("ALTER TABLE hearses MODIFY COLUMN status ENUM('available', 'booked', 'in_transit', 'maintenance', 'out_of_service', 'pending_inspection', 'on_standby', 'disabled') DEFAULT 'available'")

        // Update hearse_bookings status to include more options
        .raw("ALTER TABLE hearse_bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'in_progress', 'in_transit', 'completed', 'cancelled', 'postponed', 'booked', 'on_hold', 'dispatched') DEFAULT 'booked'")

        // Update drivers status to include more options
        .raw("ALTER TABLE drivers MODIFY COLUMN status ENUM('available', 'on_trip', 'off_duty', 'resting', 'sick', 'on_leave', 'training') DEFAULT 'available'");
};

exports.down = function (knex) {
    return knex.schema
        .raw("ALTER TABLE hearses MODIFY COLUMN status ENUM('available', 'booked', 'maintenance', 'out_of_service') DEFAULT 'available'")
        .raw("ALTER TABLE hearse_bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'booked') DEFAULT 'booked'")
        .raw("ALTER TABLE drivers MODIFY COLUMN status ENUM('available', 'on_trip', 'off_duty') DEFAULT 'available'");
};