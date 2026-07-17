// ============================================
// HEARSE SERVICE - Local Database Configuration
// ============================================
// Self-contained within hearse service - no external imports
// Uses environment variables from .env or docker-compose
// Uses knex for migrations

const mysql = require('mysql2/promise');
const knex = require('knex');
const path = require('path');

const HEARSE_DB_CONFIG = {
    host: process.env.DB_HOST || 'mariadb',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.HEARSE_DB_NAME || 'restpoint_hearses',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let hearsePool = null;

const getHearsePool = async () => {
    if (!hearsePool) {
        try {
            hearsePool = await mysql.createPool(HEARSE_DB_CONFIG);
            console.log('✅ [HearseService] Local hearse database pool created:', HEARSE_DB_CONFIG.database);
        } catch (error) {
            console.error('❌ [HearseService] Failed to create hearse database pool:', error);
            throw error;
        }
    }
    return hearsePool;
};

const safeQuery = async (sql, params = []) => {
    const pool = await getHearsePool();
    const [rows] = await pool.query(sql, params);
    return rows;
};

// ============================================
// Knex migration runner (self-contained)
// ============================================

const runMigrations = async () => {
    console.log('🔄 [HearseService] Running knex migrations...');

    // First ensure the database exists
    const rootPool = await mysql.createPool({
        host: HEARSE_DB_CONFIG.host,
        port: HEARSE_DB_CONFIG.port,
        user: HEARSE_DB_CONFIG.user,
        password: HEARSE_DB_CONFIG.password,
        multipleStatements: true
    });

    await rootPool.query(
        `CREATE DATABASE IF NOT EXISTS \`${HEARSE_DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ [HearseService] Database ensured: ${HEARSE_DB_CONFIG.database}`);
    await rootPool.end();

    // Run knex migrations
    const knexInstance = knex({
        client: 'mysql2',
        connection: {
            host: HEARSE_DB_CONFIG.host,
            port: HEARSE_DB_CONFIG.port,
            user: HEARSE_DB_CONFIG.user,
            password: HEARSE_DB_CONFIG.password,
            database: HEARSE_DB_CONFIG.database,
            charset: 'utf8mb4'
        },
        migrations: {
            directory: path.join(__dirname, 'migrations'),
            tableName: 'knex_migrations'
        },
        pool: {
            min: 2,
            max: 10
        }
    });

    try {
        const [batchNo, log] = await knexInstance.migrate.latest();
        if (log.length === 0) {
            console.log('✅ [HearseService] All migrations already up to date');
        } else {
            console.log(`✅ [HearseService] Migrations up to date (batch ${batchNo}):`, log);
        }
    } catch (error) {
        console.error('❌ [HearseService] Migration failed:', error);
        throw error;
    } finally {
        await knexInstance.destroy();
    }
};

module.exports = {
    getHearsePool,
    safeQuery,
    runMigrations,
    HEARSE_DB_CONFIG
};