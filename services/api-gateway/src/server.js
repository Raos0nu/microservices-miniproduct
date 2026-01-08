require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for frontend
}));
app.use(cors());

// Body parsing middleware - only for non-proxy routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    // Skip body parsing for API routes (they go through proxy)
    return next();
  }
  express.json()(req, res, next);
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  express.urlencoded({ extended: true })(req, res, next);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Root route - serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Service URLs
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

// Proxy middleware for Auth Service
app.use('/api/auth', createProxyMiddleware({
  target: AUTH_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  timeout: 60000,
  proxyTimeout: 60000,
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`[Gateway] Proxying ${req.method} ${req.url} to Auth Service (${AUTH_SERVICE})`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`[Gateway] Response from Auth Service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`[Gateway] Error proxying to Auth Service:`, err.message);
    if (!res.headersSent) {
      res.status(503).json({ 
        error: 'Auth service unavailable',
        message: err.message || 'Service connection failed'
      });
    }
  }
}));

// Proxy middleware for User Service
app.use('/api/users', createProxyMiddleware({
  target: USER_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users'
  },
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`[Gateway] Proxying ${req.method} ${req.url} to User Service (${USER_SERVICE})`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`[Gateway] Response from User Service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`[Gateway] Error proxying to User Service:`, err.message);
    if (!res.headersSent) {
      res.status(503).json({ 
        error: 'User service unavailable',
        message: err.message || 'Service connection failed'
      });
    }
  }
}));

// Proxy middleware for Order Service
app.use('/api/orders', createProxyMiddleware({
  target: ORDER_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/orders': '/api/orders'
  },
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`[Gateway] Proxying ${req.method} ${req.url} to Order Service (${ORDER_SERVICE})`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`[Gateway] Response from Order Service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`[Gateway] Error proxying to Order Service:`, err.message);
    if (!res.headersSent) {
      res.status(503).json({ 
        error: 'Order service unavailable',
        message: err.message || 'Service connection failed'
      });
    }
  }
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Gateway error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(`Auth Service: ${AUTH_SERVICE}`);
  logger.info(`User Service: ${USER_SERVICE}`);
  logger.info(`Order Service: ${ORDER_SERVICE}`);
});

module.exports = app;

