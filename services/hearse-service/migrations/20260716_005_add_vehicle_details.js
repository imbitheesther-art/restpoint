// ============================================
// HEARSE SERVICE MIGRATION - Add vehicle details
// ============================================

const addColumnIfMissing = async (knex, tableName, columnName, callback) => {
    const exists = await knex.schema.hasColumn(tableName, columnName);
    if (!exists) {
        await knex.schema.table(tableName, callback);
    }
};

exports.up = async function (knex) {
    await addColumnIfMissing(knex, 'hearses', 'make', (table) => {
        table.string('make', 100).after('hearse_name');
    });
    await addColumnIfMissing(knex, 'hearses', 'year', (table) => {
        table.string('year', 4).after('make');
    });
    await addColumnIfMissing(knex, 'hearses', 'chassis_number', (table) => {
        table.string('chassis_number', 100).after('year');
    });
    await addColumnIfMissing(knex, 'hearses', 'engine_number', (table) => {
        table.string('engine_number', 100).after('chassis_number');
    });
    await addColumnIfMissing(knex, 'hearses', 'service_due_date', (table) => {
        table.date('service_due_date').after('engine_number');
    });
    await addColumnIfMissing(knex, 'hearses', 'insurance_expiry', (table) => {
        table.date('insurance_expiry').after('service_due_date');
    });
    await addColumnIfMissing(knex, 'hearses', 'features', (table) => {
        table.text('features').after('insurance_expiry');
    });
    await addColumnIfMissing(knex, 'hearses', 'is_active', (table) => {
        table.boolean('is_active').defaultTo(true).after('features');
    });
};

exports.down = async function (knex) {
    if (await knex.schema.hasColumn('hearses', 'is_active')) {
        await knex.schema.table('hearses', (table) => {
            table.dropColumn('is_active');
        });
    }
    if (await knex.schema.hasColumn('hearses', 'features')) {
        await knex.schema.table('hearses', (table) => {
            table.dropColumn('features');
        });
    }
    if (await knex.schema.hasColumn('hearses', 'insurance_expiry')) {
        await knex.schema.table('hearses', (table) => {
            table.dropColumn('insurance_expiry');
        });
    }
    if (await knex.schema.hasColumn('hearses', 'service_due_date')) {
        await knex.schema.table('hearses', (table) => {
            table.dropColumn('service_due_date');
        });
    }
    if (await knex.schema.hasColumn('hearses', 'engine_number')) {
        await knex.schema.table('hearses', (table) => {
            table.dropColumn('engine_number');
        });
    }
    if (await knex.schema.hasColumn('hearses', 'chassis_number')) {
        await knex.schema.table('hearses', (table) => {
            table.dropColumn('chassis_number');
        });
    }
    if (await knex.schema.hasColumn('hearses', 'year')) {
        await knex.schema.table('hearses', (table) => {
            table.dropColumn('year');
        });
    }
    if (await knex.schema.hasColumn('hearses', 'make')) {
        await knex.schema.table('hearses', (table) => {
            table.dropColumn('make');
        });
    }
};
