/**
 * Create flower bookings tables
 */

export async function up(knex) {
  // Main bookings table
  await knex.schema.createTable('flower_bookings', (table) => {
    table.increments('id').primary();
    table.string('booking_id', 50).unique().notNullable();
    table.string('flower_type', 100).notNullable();
    table.text('flower_description');
    table.string('service_type', 50).notNullable();
    table.string('customer', 255).notNullable();
    table.string('customer_phone', 20);
    table.string('customer_email', 255);
    table.string('deceased_name', 255);
    table.string('branch', 100).notNullable();
    table.integer('branch_id');
    table.date('delivery_date').notNullable();
    table.time('delivery_time').notNullable();
    table.text('delivery_address');
    table.string('invoice_number', 50).unique();
    table.decimal('amount', 10, 2).defaultTo(0.00);
    table.string('status', 50).defaultTo('pending');
    table.text('notes');
    table.boolean('urgent').defaultTo(false);
    table.string('created_by', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['booking_id'], 'idx_booking_id');
    table.index(['status'], 'idx_status');
    table.index(['delivery_date'], 'idx_delivery_date');
    table.index(['customer'], 'idx_customer');
    table.index(['branch'], 'idx_branch');
    table.index(['created_at'], 'idx_created_at');
  });

  // Customers table for repeat customers
  await knex.schema.createTable('flower_customers', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('phone', 20).unique();
    table.string('email', 255);
    table.text('address');
    table.text('notes');
    table.integer('total_orders').defaultTo(0);
    table.decimal('total_spent', 10, 2).defaultTo(0.00);
    table.integer('branch_id');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['phone'], 'idx_phone');
    table.index(['name'], 'idx_name');
  });

  // Flower types/packages catalog
  await knex.schema.createTable('flower_packages', (table) => {
    table.increments('id').primary();
    table.string('package_name', 255).notNullable();
    table.string('package_code', 50).unique();
    table.text('description');
    table.text('flower_types');
    table.decimal('price', 10, 2).notNullable();
    table.string('image_url', 500);
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_urgent').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Insert default flower packages
  await knex('flower_packages').insert([
    {
      package_name: 'Basic Wreath',
      package_code: 'FLW-BASIC',
      description: 'Simple wreath with seasonal flowers',
      flower_types: 'Roses, Carnations, Baby breath',
      price: 3500.00,
      is_active: true
    },
    {
      package_name: 'Premium Wreath',
      package_code: 'FLW-PREMIUM',
      description: 'Premium wreath with mixed flowers',
      flower_types: 'Roses, Lilies, Carnations, Baby breath',
      price: 7500.00,
      is_active: true
    },
    {
      package_name: 'Casket Spray',
      package_code: 'FLW-CASKET',
      description: 'Full casket spray arrangement',
      flower_types: 'Roses, Lilies, Orchids',
      price: 15000.00,
      is_active: true
    },
    {
      package_name: 'Standing Spray',
      package_code: 'FLW-STANDING',
      description: 'Large standing spray for funeral home',
      flower_types: 'Mixed seasonal flowers',
      price: 12000.00,
      is_active: true
    },
    {
      package_name: 'Bouquet',
      package_code: 'FLW-BOUQUET',
      description: 'Hand-tied bouquet for family',
      flower_types: 'Roses, Carnations',
      price: 2500.00,
      is_active: true
    },
    {
      package_name: 'Urgent Same-Day',
      package_code: 'FLW-URGENT',
      description: 'Same-day urgent delivery',
      flower_types: 'Assorted premium flowers',
      price: 20000.00,
      is_active: true
    }
  ]);

  // Delivery zones/pricing
  await knex.schema.createTable('delivery_zones', (table) => {
    table.increments('id').primary();
    table.string('zone_name', 100).notNullable();
    table.text('areas');
    table.decimal('delivery_fee', 10, 2).defaultTo(0.00);
    table.integer('estimated_minutes');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Insert default delivery zones
  await knex('delivery_zones').insert([
    {
      zone_name: 'Local - Same Area',
      areas: 'Within 5km radius',
      delivery_fee: 500.00,
      estimated_minutes: 30,
      is_active: true
    },
    {
      zone_name: 'Local - Extended',
      areas: '5-15km radius',
      delivery_fee: 1000.00,
      estimated_minutes: 60,
      is_active: true
    },
    {
      zone_name: 'Regional',
      areas: '15-30km radius',
      delivery_fee: 2000.00,
      estimated_minutes: 90,
      is_active: true
    },
    {
      zone_name: 'National',
      areas: 'Over 30km / Other cities',
      delivery_fee: 5000.00,
      estimated_minutes: 240,
      is_active: true
    }
  ]);
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('delivery_zones');
  await knex.schema.dropTableIfExists('flower_packages');
  await knex.schema.dropTableIfExists('flower_customers');
  await knex.schema.dropTableIfExists('flower_bookings');
}