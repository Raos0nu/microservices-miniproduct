require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth.routes');
const { connectDB } = require('./database/connection');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth-service', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ service: 'auth-service', status: 'running', endpoints: ['/health', '/api/auth'] });
});

// Routes
app.use('/api/auth', authRoutes);

// Error handler
app.use((err, req, res, next) => {
  logger.error('Auth service error:', err);
  
  // Don't send response if headers already sent or connection aborted
  if (res.headersSent || req.aborted) {
    return;
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
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
    logger.info('Auth Service: Database schema initialized');
  } catch (error) {
    logger.error('Auth Service: Schema initialization error:', error);
  }
}

// Initialize
async function startServer() {
  try {
    await connectDB();
    await initializeSchema();
    app.listen(PORT, () => {
      logger.info(`Auth Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start auth service:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

