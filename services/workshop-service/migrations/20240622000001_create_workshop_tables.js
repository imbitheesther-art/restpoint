/**
 * Create workshop tables - Coffin building, materials, and production tracking
 * Multi-tenant: Each funeral home gets its own database
 */

export async function up(knex) {
  // Users table (workers, managers, admins)
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('email', 255).unique().notNullable();
    table.string('password', 255).notNullable();
    table.string('role', 50).defaultTo('worker');
    table.string('phone', 20);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['role'], 'idx_users_role');
    table.index(['email'], 'idx_users_email');
  });

  // Coffin orders
  await knex.schema.createTable('coffin_orders', (table) => {
    table.increments('id').primary();
    table.string('order_number', 50).unique().notNullable();
    table.string('customer_name', 255).notNullable();
    table.string('customer_phone', 20);
    table.string('customer_email', 255);
    table.string('deceased_name', 255).notNullable();
    table.string('coffin_type', 50).defaultTo('standard');
    table.text('dimensions');
    table.string('color', 100);
    table.string('interior_fabric', 100);
    table.text('notes');
    table.text('instructions');
    table.decimal('selling_price', 10, 2).defaultTo(0);
    table.decimal('total_cost', 10, 2).defaultTo(0);
    table.decimal('profit', 10, 2).defaultTo(0);
    table.date('due_date');
    table.string('priority', 20).defaultTo('normal');
    table.integer('branch_id');
    table.text('hold_reason');
    table.string('created_by', 255);
    table.string('status', 50).defaultTo('pending');
    table.date('delivery_date');
    table.datetime('order_date').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['status'], 'idx_orders_status');
    table.index(['order_date'], 'idx_orders_date');
    table.index(['branch_id'], 'idx_orders_branch');
  });

  // Materials inventory
  await knex.schema.createTable('materials', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('category', 100).notNullable();
    table.string('unit', 50).notNullable().defaultTo('pieces');
    table.decimal('quantity', 10, 2).notNullable().defaultTo(0);
    table.decimal('unit_price', 10, 2).defaultTo(0);
    table.decimal('min_stock_level', 10, 2).defaultTo(0);
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['category'], 'idx_materials_category');
  });

  // Material usage tracking
  await knex.schema.createTable('material_usage', (table) => {
    table.increments('id').primary();
    table.integer('coffin_order_id').unsigned().notNullable();
    table.integer('material_id').unsigned().notNullable();
    table.decimal('quantity_used', 10, 2).notNullable();
    table.decimal('unit_cost', 10, 2).defaultTo(0);
    table.text('notes');
    table.timestamp('used_at').defaultTo(knex.fn.now());
    table.foreign('coffin_order_id').references('coffin_orders.id').onDelete('CASCADE');
    table.foreign('material_id').references('materials.id').onDelete('CASCADE');
    table.index(['coffin_order_id'], 'idx_usage_order');
    table.index(['material_id'], 'idx_usage_material');
  });

  // Production stages
  await knex.schema.createTable('production_stages', (table) => {
    table.increments('id').primary();
    table.integer('coffin_order_id').unsigned().notNullable();
    table.string('stage', 50).notNullable();
    table.string('status', 50).defaultTo('pending');
    table.datetime('started_at');
    table.datetime('completed_at');
    table.text('notes');
    table.foreign('coffin_order_id').references('coffin_orders.id').onDelete('CASCADE');
    table.unique(['coffin_order_id', 'stage'], 'uk_order_stage');
    table.index(['coffin_order_id'], 'idx_stages_order');
  });

  // Worker assignments
  await knex.schema.createTable('worker_assignments', (table) => {
    table.increments('id').primary();
    table.integer('coffin_order_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.string('stage', 50).notNullable();
    table.decimal('hours_worked', 5, 2).defaultTo(0);
    table.text('notes');
    table.datetime('assigned_at').defaultTo(knex.fn.now());
    table.datetime('completed_at');
    table.foreign('coffin_order_id').references('coffin_orders.id').onDelete('CASCADE');
    table.index(['coffin_order_id'], 'idx_assignments_order');
    table.index(['user_id'], 'idx_assignments_user');
  });

  // Costing
  await knex.schema.createTable('costing', (table) => {
    table.increments('id').primary();
    table.integer('coffin_order_id').unsigned().unique().notNullable();
    table.decimal('materials_cost', 10, 2).defaultTo(0);
    table.decimal('labor_cost', 10, 2).defaultTo(0);
    table.decimal('overhead_cost', 10, 2).defaultTo(0);
    table.decimal('total_cost', 10, 2).defaultTo(0);
    table.decimal('selling_price', 10, 2).defaultTo(0);
    table.decimal('profit', 10, 2).defaultTo(0);
    table.decimal('profit_margin', 5, 2).defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.foreign('coffin_order_id').references('coffin_orders.id').onDelete('CASCADE');
  });

  // Design specifications
  await knex.schema.createTable('design_specifications', (table) => {
    table.increments('id').primary();
    table.integer('coffin_order_id').unsigned().unique().notNullable();
    table.string('design_name', 255);
    table.text('description');
    table.json('specifications');
    table.json('design_files');
    table.string('status', 50).defaultTo('draft');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.foreign('coffin_order_id').references('coffin_orders.id').onDelete('CASCADE');
    table.index(['coffin_order_id'], 'idx_design_order');
  });

  // Material intake
  await knex.schema.createTable('material_intake', (table) => {
    table.increments('id').primary();
    table.integer('material_id').unsigned().notNullable();
    table.decimal('quantity', 10, 2).notNullable();
    table.decimal('unit_cost', 10, 2).defaultTo(0);
    table.string('supplier', 255);
    table.string('invoice_number', 100);
    table.text('notes');
    table.string('received_by', 255);
    table.timestamp('received_at').defaultTo(knex.fn.now());
    table.foreign('material_id').references('materials.id').onDelete('CASCADE');
    table.index(['material_id'], 'idx_intake_material');
    table.index(['received_at'], 'idx_intake_date');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('material_intake');
  await knex.schema.dropTableIfExists('design_specifications');
  await knex.schema.dropTableIfExists('costing');
  await knex.schema.dropTableIfExists('worker_assignments');
  await knex.schema.dropTableIfExists('production_stages');
  await knex.schema.dropTableIfExists('material_usage');
  await knex.schema.dropTableIfExists('materials');
  await knex.schema.dropTableIfExists('coffin_orders');
  await knex.schema.dropTableIfExists('users');
}