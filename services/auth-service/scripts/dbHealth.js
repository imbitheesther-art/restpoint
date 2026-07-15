const mysql = require('mysql2/promise');

async function checkDBConnection() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  let connection;
  try {
    connection = await mysql.createConnection(config);
    await connection.query('SELECT 1');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = { checkDBConnection };