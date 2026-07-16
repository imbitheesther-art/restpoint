// Dedicated Hearse Database Configuration
// This provides a single shared database for all hearses across all branches
const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const HEARSE_DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.HEARSE_DB_NAME || 'restpoint_hearses',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool for hearse database
let hearsePool = null;

const getHearsePool = async () => {
    if (!hearsePool) {
        try {
            hearsePool = await mysql.createPool(HEARSE_DB_CONFIG);
            console.log('✅ Hearse database pool created:', HEARSE_DB_CONFIG.database);
        } catch (error) {
            console.error('❌ Failed to create hearse database pool:', error);
            throw error;
        }
    }
    return hearsePool;
};

// Initialize hearse database and tables
const initializeHearseDatabase = async () => {
    try {
        const rootPool = await mysql.createPool({
            host: HEARSE_DB_CONFIG.host,
            port: HEARSE_DB_CONFIG.port,
            user: HEARSE_DB_CONFIG.user,
            password: HEARSE_DB_CONFIG.password,
            multipleStatements: true
        });

        // Create database if not exists
        await rootPool.query(`CREATE DATABASE IF NOT EXISTS \`${HEARSE_DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ Hearse database ensured: ${HEARSE_DB_CONFIG.database}`);

        // Create hearses table
        await rootPool.query(`
      CREATE TABLE IF NOT EXISTS \`hearses\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`hearse_code\` VARCHAR(50) UNIQUE NOT NULL,
        \`plate_number\` VARCHAR(50) UNIQUE NOT NULL,
        \`model\` VARCHAR(100) NOT NULL,
        \`capacity\` INT DEFAULT 8,
        \`status\` ENUM('available', 'booked', 'maintenance', 'out_of_service') DEFAULT 'available',
        \`branch_id\` INT NOT NULL,
        \`branch_name\` VARCHAR(100) NOT NULL,
        \`branch_code\` VARCHAR(50),
        \`image\` VARCHAR(500),
        \`min_charge_ksh\` DECIMAL(10,2) DEFAULT 0.00,
        \`max_charge_ksh\` DECIMAL(10,2) DEFAULT 0.00,
        \`is_own_branch\` TINYINT(1) DEFAULT 1,
        \`active_bookings\` INT DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_branch_id\` (\`branch_id\`),
        INDEX \`idx_status\` (\`status\`),
        INDEX \`idx_hearse_code\` (\`hearse_code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        // Create hearse_bookings table
        await rootPool.query(`
      CREATE TABLE IF NOT EXISTS \`hearse_bookings\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`booking_code\` VARCHAR(50) UNIQUE NOT NULL,
        \`hearse_id\` INT NOT NULL,
        \`tenant_db_name\` VARCHAR(100) NOT NULL,
        \`client_name\` VARCHAR(200) NOT NULL,
        \`client_phone\` VARCHAR(50) NOT NULL,
        \`client_email\` VARCHAR(200),
        \`destination\` TEXT NOT NULL,
        \`from_timestamp\` DATETIME,
        \`to_timestamp\` DATETIME,
        \`booking_date\` DATE NOT NULL,
        \`status\` ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'booked') DEFAULT 'booked',
        \`branch_id\` INT,
        \`branch_code\` VARCHAR(50),
        \`booked_by\` INT,
        \`booked_by_email\` VARCHAR(200),
        \`booked_by_name\` VARCHAR(200),
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`hearse_id\`) REFERENCES \`hearses\`(\`id\`) ON DELETE RESTRICT,
        INDEX \`idx_hearse_id\` (\`hearse_id\`),
        INDEX \`idx_branch_id\` (\`branch_id\`),
        INDEX \`idx_booking_date\` (\`booking_date\`),
        INDEX \`idx_status\` (\`status\`),
        INDEX \`idx_booked_by\` (\`booked_by\`),
        INDEX \`idx_tenant_db\` (\`tenant_db_name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        // Create drivers table
        await rootPool.query(`
      CREATE TABLE IF NOT EXISTS \`drivers\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`driver_code\` VARCHAR(50) UNIQUE NOT NULL,
        \`full_name\` VARCHAR(200) NOT NULL,
        \`phone\` VARCHAR(50) NOT NULL,
        \`license_number\` VARCHAR(100),
        \`branch_id\` INT NOT NULL,
        \`branch_name\` VARCHAR(100) NOT NULL,
        \`status\` ENUM('available', 'on_trip', 'off_duty') DEFAULT 'available',
        \`current_booking_id\` INT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_branch_id\` (\`branch_id\`),
        INDEX \`idx_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        console.log('✅ Hearse database tables created successfully');
        await rootPool.end();
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize hearse database:', error);
        throw error;
    }
};

module.exports = {
    getHearsePool,
    initializeHearseDatabase,
    HEARSE_DB_CONFIG
};