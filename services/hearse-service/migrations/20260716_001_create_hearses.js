// ============================================
// HEARSE SERVICE MIGRATION - Create hearses table
// ============================================

exports.up = function (knex) {
    return knex.schema
        .createTable('hearses', (table) => {
            table.increments('id').primary();
            table.string('hearse_code', 50).unique().notNullable();
            table.string('plate_number', 50).unique().notNullable();
            table.string('model', 100).notNullable();
            table.integer('capacity').defaultTo(8);
            table.enu('status', ['available', 'booked', 'in_transit', 'completed', 'cancelled', 'maintenance', 'out_of_service']).defaultTo('available');
            table.integer('branch_id').notNullable();
            table.string('branch_name', 100).notNullable();
            table.string('branch_code', 50);
            table.string('image', 500);
            table.decimal('min_charge_ksh', 10, 2).defaultTo(0.00);
            table.decimal('max_charge_ksh', 10, 2).defaultTo(0.00);
            table.tinyint('is_own_branch').defaultTo(1);
            table.integer('active_bookings').defaultTo(0);
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());

            table.index('branch_id', 'idx_branch_id');
            table.index('status', 'idx_status');
            table.index('hearse_code', 'idx_hearse_code');
        })
        .createTable('hearse_bookings', (table) => {
            table.increments('id').primary();
            table.string('booking_code', 50).unique().notNullable();
            table.integer('hearse_id').unsigned().notNullable();
            table.string('tenant_db_name', 100).notNullable();
            table.string('client_name', 200).notNullable();
            table.string('client_phone', 50).notNullable();
            table.string('client_email', 200);
            table.text('destination').notNullable();
            table.datetime('from_timestamp');
            table.datetime('to_timestamp');
            table.date('booking_date').notNullable();
            table.enu('status', ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'booked']).defaultTo('booked');
            table.integer('branch_id');
            table.string('branch_code', 50);
            table.integer('booked_by');
            table.string('booked_by_email', 200);
            table.string('booked_by_name', 200);
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());

            table.foreign('hearse_id').references('id').inTable('hearses').onDelete('RESTRICT');
            table.index('hearse_id', 'idx_booking_hearse_id');
            table.index('branch_id', 'idx_booking_branch_id');
            table.index('booking_date', 'idx_booking_date');
            table.index('status', 'idx_booking_status');
            table.index('booked_by', 'idx_booking_booked_by');
            table.index('tenant_db_name', 'idx_booking_tenant_db');
        })
        .createTable('drivers', (table) => {
            table.increments('id').primary();
            table.string('driver_code', 50).unique().notNullable();
            table.string('full_name', 200).notNullable();
            table.string('phone', 50).notNullable();
            table.string('license_number', 100);
            table.integer('branch_id').notNullable();
            table.string('branch_name', 100).notNullable();
            table.enu('status', ['available', 'on_trip', 'off_duty']).defaultTo('available');
            table.integer('current_booking_id');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());

            table.index('branch_id', 'idx_driver_branch_id');
            table.index('status', 'idx_driver_status');
        });
};

exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('drivers')
        .dropTableIfExists('hearse_bookings')
        .dropTableIfExists('hearses');
};