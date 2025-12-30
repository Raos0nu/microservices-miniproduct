const { Pool } = require('pg');
const logger = require('../utils/logger');

let pool = null;

function connectDB() {
  try {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'auth_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      logger.error('Database error:', err);
    });

    return pool.query('SELECT NOW()')
      .then(() => {
        logger.info('Auth Service: PostgreSQL connected');
        return pool;
      })
      .catch((err) => {
        logger.error('Auth Service: Database connection error:', err);
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

