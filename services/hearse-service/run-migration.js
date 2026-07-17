// Simple script to run hearse service migrations
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { runMigrations } = require('./database');

runMigrations()
    .then(() => {
        console.log('✅ Migration completed successfully');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    });