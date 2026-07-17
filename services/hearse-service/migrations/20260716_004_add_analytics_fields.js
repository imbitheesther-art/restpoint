// ============================================
// HEARSE SERVICE MIGRATION - Add missing analytics fields
// ============================================

exports.up = function (knex) {
    return knex.schema.table('hearse_bookings', (table) => {
        // Add fields for analytics
        table.decimal('total_charge', 10, 2).defaultTo(0).after('status');
        table.decimal('paid_amount', 10, 2).defaultTo(0).after('total_charge');
        table.string('payment_status', 50).defaultTo('unpaid').after('paid_amount');
    });
};

exports.down = function (knex) {
    return knex.schema.table('hearse_bookings', (table) => {
        table.dropColumn('total_charge');
        table.dropColumn('paid_amount');
        table.dropColumn('payment_status');
    });
};
