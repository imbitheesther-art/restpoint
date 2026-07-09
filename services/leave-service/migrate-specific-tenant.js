const { migrateTenantTables } = require('./migrate-tenant-tables');

// Migrate for the specific tenant database
const tenantDbName = 'donholm-feuneral-donholm';

console.log(`Running migration for tenant: ${tenantDbName}`);
migrateTenantTables(tenantDbName)
    .then(() => {
        console.log(`✅ Migration completed for ${tenantDbName}`);
        process.exit(0);
    })
    .catch(err => {
        console.error(`❌ Migration failed for ${tenantDbName}:`, err);
        process.exit(1);
    });