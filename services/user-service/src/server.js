require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const userRoutes = require('./routes/user.routes');
const { connectDB } = require('./database/connection');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'user-service', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ service: 'user-service', status: 'running', endpoints: ['/health', '/api/users'] });
});

// Initialize database schema on startup
async function initializeSchema() {
  try {
    const pool = require('./database/connection').getPool();
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    logger.info('User Service: Database schema initialized');
  } catch (error) {
    logger.error('User Service: Schema initialization error:', error);
  }
}

app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  logger.error('User service error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

async function startServer() {
  try {
    await connectDB();
    await initializeSchema();
    app.listen(PORT, () => {
      logger.info(`User Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start user service:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

