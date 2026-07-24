require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const getClientConfig = () => {
  const DB_HOST = process.env.DB_HOST || 'localhost';
  const DB_USER = process.env.DB_USER || 'root';
  const DB_PASSWORD = process.env.DB_PASSWORD || '';
  const DB_NAME = process.env.DB_NAME || 'restpoint_main';

  return {
    client: 'mysql2',
    connection: {
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
  };
};

module.exports = {
  development: getClientConfig(),
  production: getClientConfig(),
};