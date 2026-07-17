// ============================================
// HEARSE SERVICE MIGRATION - Add hearse_name column
// ============================================

exports.up = function (knex) {
    return knex.schema
        .table('hearses', (table) => {
            table.string('hearse_name', 100).nullable().after('hearse_code');
        });
};

exports.down = function (knex) {
    return knex.schema
        .table('hearses', (table) => {
            table.dropColumn('hearse_name');
        });
};