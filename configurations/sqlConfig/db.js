/**
 * Shared Database Configuration Shim
 * Used by: qrcode-service, updates-service, documents-service
 * This file provides the database connection config that these services expect at ../../configurations/sqlConfig/db
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'mariadb',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
};

let pool = null;

const getPool = async () => {
  if (!pool) {
    pool = mysql.createPool({
      ...DB_CONFIG,
      database: process.env.MASTER_DB_NAME || 'restpoint_system',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
};

module.exports = { getPool, DB_CONFIG };