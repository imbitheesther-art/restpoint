// ============================================
// HEARSE SERVICE MIGRATION - Add vehicle details
// ============================================

exports.up = function (knex) {
    return knex.schema.table('hearses', (table) => {
        // Add detailed vehicle information fields
        // Note: hearse_name was already added in migration 20260716_003_add_hearse_name.js
        table.string('make', 100).after('hearse_name');
        table.string('year', 4).after('make');
        table.string('chassis_number', 100).after('year');
        table.string('engine_number', 100).after('chassis_number');
        table.date('service_due_date').after('engine_number');
        table.date('insurance_expiry').after('service_due_date');
        table.text('features').after('insurance_expiry');
        table.boolean('is_active').defaultTo(true).after('features');
    });
};

exports.down = function (knex) {
    return knex.schema.table('hearses', (table) => {
        // Note: hearse_name is dropped in migration 20260716_003_add_hearse_name.js
        table.dropColumn('make');
        table.dropColumn('year');
        table.dropColumn('chassis_number');
        table.dropColumn('engine_number');
        table.dropColumn('service_due_date');
        table.dropColumn('insurance_expiry');
        table.dropColumn('features');
        table.dropColumn('is_active');
    });
};
