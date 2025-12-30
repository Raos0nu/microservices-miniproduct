const { Pool } = require('pg');
const logger = require('../utils/logger');

let pool = null;

function connectDB() {
  try {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'order_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20
    });

    return pool.query('SELECT NOW()')
      .then(() => {
        logger.info('Order Service: PostgreSQL connected');
        return pool;
      })
      .catch((err) => {
        logger.error('Order Service: Database connection error:', err);
        throw err;
      });
  } catch (error) {
    logger.error('Failed to initialize database pool:', error);
    throw error;
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool;
}

module.exports = { connectDB, getPool };

