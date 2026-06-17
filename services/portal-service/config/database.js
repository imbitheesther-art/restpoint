const path = require('path');
const fs = require('fs');

let db;

// Try loading the JS version first (most reliable)
const jsPath = path.resolve(__dirname, '../../global/config/db.js');
if (fs.existsSync(jsPath)) {
  try {
    db = require(jsPath);
  } catch (e) {
    console.error('Failed to load global/config/db.js:', e.message);
  }
}

// Try loading shared/dbConfig.js as fallback
if (!db) {
  const sharedPath = path.resolve(__dirname, '../../shared/dbConfig.js');
  if (fs.existsSync(sharedPath)) {
    try {
      db = require(sharedPath);
      // Map compatibility - portal expects safeQuery, safeQueryOne, etc
      const compatDb = {
        safeQuery: db.safeMasterQuery || db.safeQuery,
        safeQueryOne: async (sql, params) => {
          const rows = await (db.safeMasterQuery || db.safeQuery)(sql, params);
          return rows[0] || null;
        },
        transaction: async (callback, tenantSlug = null) => {
          const pool = await db.getRootPool();
          const conn = await pool.getConnection();
          try {
            await conn.beginTransaction();
            const result = await callback(conn);
            await conn.commit();
            return result;
          } catch (err) {
            await conn.rollback();
            throw err;
          } finally {
            conn.release();
          }
        },
        getConnection: async () => {
          const pool = await db.getRootPool();
          return await pool.getConnection();
        },
        pool: null,
        getRootPool: db.getRootPool,
        lookupTenantDb: db.lookupTenantDatabase || db.lookupTenantDb,
        getTenantPool: db.getTenantDB,
      };
      db = compatDb;
    } catch(e) {
      console.error('Failed to load shared/dbConfig.js:', e.message);
    }
  }
}

// Final fallback with ts-node
if (!db) {
  try {
    require('ts-node').register({ transpileOnly: true });
    const tsPath = path.resolve(__dirname, '../../global/config/db.ts');
    if (fs.existsSync(tsPath)) {
      db = require(tsPath);
    } else {
      throw new Error(`File not found: ${tsPath}`);
    }
  } catch (error) {
    console.error('Failed to load portal database configuration:', error.message);
    throw new Error('Could not load portal database configuration. Please ensure database config is available.');
  }
}

async function testConnection() {
  if (!db || (!db.pool && !db.getRootPool)) {
    throw new Error('Database connection not available');
  }

  try {
    const pool = db.pool || (await db.getRootPool());
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Portal database testConnection failed:', error.message || error);
    throw error;
  }
}

module.exports = {
  executeQuery: db.safeQuery,
  safeQuery: db.safeQuery,
  safeQueryOne: db.safeQueryOne,
  transaction: db.transaction,
  getConnection: db.getConnection,
  pool: db.pool,
  testConnection,
};